/**
 * An Object containing:
 * @property {Number}  rows          - The minefield rows
 * @property {Number}  cols          - The minefield columns
 * @property {Number}  cells         - The minefield total cells number
 * @property {Number}  mines         - The minefield total mines number
 * @property {Object}  [X]           - Each minefield cell on its index ([0]..[99]+)
 * @property {Boolean} [X].isOpen    - Whether a cell is revealed
 * @property {Boolean} [X].isMine    - Whether a cell is a mine
 * @property {Boolean} [X].isFlagged - Whether a cell is flagged
 * @property {Number}  [X].mines     - Number of mines present around a cell
 */
export default class Minefield
{
   /**
    * Creates a new minefield with the given rows, columns and mines number (and randomizes them)
    * @param {Number} rows The number of rows of the minefield
    * @param {Number} cols The number of columns of the minefield
    * @param {Number} mines The number of total mines (default: rows*cols/5). If array given, the values of the array will be the indexes where the mines will be placed
    * @param {Function} randomizer A function that returns a random decimal number between 0 and 1 (default: {@link Math.random})
    * @returns {Minefield} A new Minefield object
    * @throws {Error} If parameters are invalid
    */
   constructor(rows, cols, mines = Math.floor(rows*cols/5), randomizer = Math.random)
   {
      rows = validateNumber(rows, 0), cols = validateNumber(cols, 0);

      let cells = rows*cols;

      if (Array.isArray(mines))
      {
         //assign properties to minefield
         Object.assign(this, {rows: rows, cols: cols, cells: cells, mines: mines.length});
         
         //assign properties to cells and add mines
         for (let i=0; i<cells; i++)
         {
            this[i] = {mines: 0, isMine: false, isOpen: false, isFlagged: false};
         }
   
         //assign mines to cells and high up the cells' nearby mines number by one
         for (let i=0; i<mines.length; i++)
         {
            this[mines[i]].isMine = true;

            let nearbyCells = this.getNearbyCells(mines[i], true);

            for (let j=0; j<nearbyCells.length; j++)
            {
               this[nearbyCells[j]].mines++;
            }
         }
      }
      else
      {
         mines = validateNumber(mines, 0, cells);

         //assign properties to minefield
         Object.assign(this, {rows: rows, cols: cols, cells: cells, mines: mines});
         
         //assign properties to cells and add mines
         for (let i=0; i<cells; i++)
         {
            this[i] = {mines: 0, isMine: i < mines, isOpen: false, isFlagged: false};
         }
   
         //Knuth-Fisher-Yates shuffle algorithm
         for (let i=cells-1; i > 0; i--)
         {
            let j = Math.floor(randomizer() * (i+1));
            [this[i], this[j]] = [this[j], this[i]];
         }

         //high up the cells' nearby mines number by one
         for (let i=0; i<cells; i++)
         {
            if (this[i].isMine)
            {
               let nearbyCells = this.getNearbyCells(i, true);

               for (let j=0; j<nearbyCells.length; j++)
               {
                  this[nearbyCells[j]].mines++;
               }
            }
         }
      }

      return this;
   }


   /**
    * Returns a simplified 2D-Array version of the minefield.
    * 
    *  - -1: A mine
    *  - [0-8]: A cell with the number of nearby mines
    */
   simplify()
   {
      let simplified = [];

      for (let i=0; i<this.rows; i++)
      {
         simplified.push([]);

         for (let j=0; j<this.cols; j++)
         {
            let cell = this[i*this.cols+j];

            simplified[i].push(cell.isMine ? -1 : cell.mines);
         }
      }

      return simplified;
   }


   /**
    *  - Opens a given cell and may open nearby ones following the minesweeper game rules.
    *  - Can also give the index of an already open cell that matches its nearby mines number with its nearby flags to automatically open all of its nearby not-flagged cells 
    * @param {Number} cell The index of the cell to open
    * @param {Boolean} firstclick If true, and a bomb is opened, it will be moved in another cell starting from 0 (default: {@link isNew()})
    * @returns {Array.<number>} An array containing the indexes of the updated cells
    * @throws {Error} If parameters are invalid
    */
   openCell(cell, firstclick=this.isNew())
   {
      cell = validateNumber(cell, 0, this.cells-1);

      let updatedCells = [];

      let openIfEmptyZone = (cell) =>
      {
         if (this[cell].mines == 0)
         {
            let emptyZone = this.getEmptyZone(cell);

            for (let i=0; i<emptyZone.length; i++)
            {
               this[emptyZone[i]].isOpen = true;
               updatedCells.push(emptyZone[i]);
            }
         }
      };

      if (this[cell].isOpen == false)
      {
         this[cell].isOpen = true;
         updatedCells.push(cell);

         if (this[cell].isMine)
         {
            if (firstclick)
            {
               this[cell].isMine = false;

               for (let i=0; i < this.cells; i++)
               {
                  if (this[i].isMine == false && i != cell)
                  {
                     this[i].isMine = true;
                     break;
                  }
               }
   
               this.resetMines();
   
               openIfEmptyZone(cell);
            }
         }

         else openIfEmptyZone(cell);
      }
      else if (this[cell].mines != 0)
      {
         let nearbyCells = this.getNearbyCells(cell);
         let flagCount = 0;

         for (let i=0; i<nearbyCells.length; i++)
         {
            if (this[nearbyCells[i]].isFlagged)
            {
               flagCount++;
            }
         }
         
         if (flagCount == this[cell].mines)
         {
            for (let i=0; i<nearbyCells.length; i++)
            {
               if (this[nearbyCells[i]].isFlagged == false && this[nearbyCells[i]].isOpen == false)
               {
                  this[nearbyCells[i]].isOpen = true;
                  updatedCells.push(nearbyCells[i]);

                  if (this[nearbyCells[i]].isMine == false)
                  {
                     openIfEmptyZone(nearbyCells[i]);
                  }
               }
            }
         }
      }

      return updatedCells;
   }

   /**
    * Checks if a minefield is solvable from a given cell (by not guessing)
    * WARNING! This method gets resource-intensive the more the minefield is big.
    * @param {Number} cell The index of the cell to open
    * @param {Boolean} restore If true, the Minefield will be restored after the function ends (default: true)
    * @returns {Boolean} A Boolean value that indicates whether the minefield is solvable from the given cell
    * @throws {Error} If parameters are invalid
    */
   isSolvableFrom(cell, restore=true)
   { 
      cell = validateNumber(cell, 0, this.cells-1);

      let matrixIncludesArr = (matrix, arr) => JSON.stringify(matrix).includes(JSON.stringify(arr));

      let firstClick = this.openCell(cell)
      if (firstClick.length <= 1 && this[firstClick[0]].mines != 0)
      {
         if (restore) this[firstClick[0]].isOpen = false;
         return false;
      }

      let updates = true;
      
      while (updates)
      {
         let phantomGroups = [];
         updates = false;

         let importantCells = [];

         for (let i=0; i<this.cells; i++)
         {
            if (this[i].isOpen == false && this[i].isFlagged == false)
            {
               let nearbyCells = this.getNearbyCells(i);
               
               for (let j=0; j<nearbyCells.length; j++)
               {
                  if (this[nearbyCells[j]].isOpen == true)
                  {
                     importantCells.push(nearbyCells[j]);
                  }
               }
            }
         }

         importantCells = [...new Set(importantCells)];

         
         for (let i of importantCells) //1st try: open cells using flags
         {
            if (this[i].mines == 0) //all nearby cells are fine
            {
               let emptyCells = this.getEmptyZone(i);

               for (let j=0; j<emptyCells.length; j++)
               {
                  if (this[emptyCells[j]].isOpen == false)
                  {
                     this[emptyCells[j]].isOpen = true;
                     updates = true;
                  }
               }
            }
            else
            {
               let nearbyCells = this.getNearbyCells(i);
      
               let closedCells = 0, flaggedCells = 0, unflaggedCells = [];
      
               for (let j=0; j<nearbyCells.length; j++)
               {
                  if (this[nearbyCells[j]].isOpen == false)
                  {
                     closedCells++;

                     if (this[nearbyCells[j]].isFlagged) flaggedCells++;
                     else unflaggedCells.push(nearbyCells[j]);
                  }
               }
      
               if (unflaggedCells.length > 0)
               {
                  if (this[i].mines == flaggedCells) //all nearby cells are fine (except for the flagged cells) > open them
                  {
                     unflaggedCells.forEach(x => this[x].isOpen = true);
                     updates = true
                  }
      
                  if (this[i].mines == closedCells) //all nearby closed cells are mines > flag them all
                  {
                     unflaggedCells.forEach(x => this[x].isFlagged = true);
                     updates = true;
                  }
      
                  if (this[i].mines > flaggedCells) //all nearby not flagged cells have some mines > phantom flagging
                  {
                     let tempPhantomGroup = [this[i].mines - flaggedCells, ...unflaggedCells.sort((a, b) => a - b)];
                     
                     if (matrixIncludesArr(phantomGroups, tempPhantomGroup) == false) phantomGroups.push(tempPhantomGroup);
                  }
               }
            }
         }

         if (updates == false) //2nd try: open cells using phantom bombs
         {
            let shiftUpdates = true;

            while (shiftUpdates) //shifting & adding phantom bombs
            {
               shiftUpdates = false;

               for (let i of importantCells)
               {
                  let nearbyCells = this.getNearbyCells(i);
                  let phantomGroupSum = [0];
                  
                  let closedCells = [];
                  let flaggedCells = 0;

                  for (let k=0; k < nearbyCells.length; k++)
                  {
                     if (this[nearbyCells[k]].isFlagged) flaggedCells++;
                     else if (this[nearbyCells[k]].isOpen == false) closedCells.push(nearbyCells[k]);
                  }
                  
                  for (let j=0; j < phantomGroups.length; j++)
                  {
                     if (phantomGroups[j].slice(1).every(x => closedCells.includes(x)) && closedCells.length != phantomGroups[j].length-1)
                     {
                        let shift = closedCells.filter(x => phantomGroups[j].includes(x, 1) == false).sort((a, b) => a - b);
                        let shiftMines = this[i].mines - phantomGroups[j][0] - flaggedCells;

                        let shiftPhantomGroup = [shiftMines, ...shift];

                        if (shift.length > 0 && shiftMines > 0 && matrixIncludesArr(phantomGroups, shiftPhantomGroup) == false)
                        {
                           let push = true;

                           for (let k=0; k<phantomGroups.length; k++)
                           {
                              if (phantomGroups[k].every(x => shiftPhantomGroup.includes(x)))
                              {
                                 push = false;
                                 break;
                              }
                           }

                           if (push)
                           {
                              phantomGroups.push(shiftPhantomGroup)
                              shiftUpdates = true;
                           }
                        }

                        if (phantomGroups[j].slice(1).some(x => phantomGroupSum.includes(x, 1)) == false)
                        {
                           phantomGroupSum[0] += phantomGroups[j][0];
                           phantomGroupSum.push(...phantomGroups[j].slice(1));
                        }
                     }
                  }

                  if (phantomGroupSum[0] > 0 && matrixIncludesArr(phantomGroups, phantomGroupSum) == false)
                  {
                     phantomGroups.push(phantomGroupSum);
                     shiftUpdates = true;
                  }
               }
            }


            for (let i of importantCells) //open cells using phantom bombs
            {
               let nearbyCells = this.getNearbyCells(i);

               for (let j=0; j < phantomGroups.length; j++)
               {
                  if (nearbyCells.some(x => phantomGroups[j].includes(x, 1)))
                  {
                     let phantomGroupUncontainedCells = phantomGroups[j].slice(1).filter(x => nearbyCells.includes(x) == false).length;

                     let flaggedCells = 0, unknownCells = [];
   
                     for (let k=0; k < nearbyCells.length; k++)
                     {
                        if (this[nearbyCells[k]].isFlagged) flaggedCells++;
                        else if (this[nearbyCells[k]].isOpen == false && phantomGroups[j].includes(nearbyCells[k], 1) == false)
                        {
                           unknownCells.push(nearbyCells[k]);
                        }
                     }
   
                     if (unknownCells.length > 0)
                     {
                        if (this[i].mines == flaggedCells + phantomGroups[j][0] + unknownCells.length) //all unknown cells are mines > flag them all
                        {
                           unknownCells.forEach(x => this[x].isFlagged = true);
                           updates = true;
                        }
                        if (this[i].mines == flaggedCells + phantomGroups[j][0] - phantomGroupUncontainedCells && updates == false) //all unknown cells are clear > open them
                        {
                           unknownCells.forEach(x =>
                           {
                              if (this[x].isFlagged == false)
                              {
                                 this[x].isOpen = true;
                                 updates = true;
                              }
                           })
                        }
                     }
                  }
               }
            }
         }

         if (updates == false) //3th try: open cells using remaining flags count
         {
            if (this.usedFlags == this.mines)
            {
               for (let i=0; i < this.cells; i++)
               {
                  if (this[i].isOpen == false && this[i].isFlagged == false)
                  {
                     this[i].isOpen = true;
                  }
               }
            }
            else
            {
               phantomGroups.sort((a, b) => a.length - b.length)
               let remainingPhantomGroups = [0];
         
               for (let i=0; i<phantomGroups.length; i++)
               {
                  if (phantomGroups[i].slice(1).some(x => JSON.stringify(remainingPhantomGroups.slice(1)).includes(x)) == false)
                  {
                     remainingPhantomGroups[0] += phantomGroups[i][0];
                     remainingPhantomGroups.push(...phantomGroups[i].slice(1));
                  }
               }
         
               if (remainingPhantomGroups[0] == this.mines - this.usedFlags)
               {
                  for (let i=0; i < this.cells; i++)
                  {
                     if (this[i].isOpen == false && this[i].isFlagged == false && remainingPhantomGroups.includes(i, 1) == false)
                     {
                        this[i].isOpen = true;
                        updates = true;
                     }
                  }
               }
            }
         }
      }
      
      let isSolvable = false;
      if (this.isCleared()) isSolvable = true;

      if (restore)
      {
         for (let i=0; i < this.cells; i++)
         {
            this[i].isOpen = false;
            this[i].isFlagged = false;
         }
      }

      return isSolvable;
   }

   /**
    * Checks the minefield to find hints about its state
    * @param {Boolean} accurateHint If false, the function will return the nearby cells around the hint. If true, it will only return the exact cells to open/flag. (default: false)
    * @param {Boolean} getOneHint If true, the function will only return a single hint (the first one found starting from the top) (default: true)
    * @returns {Array.<Array.<any>>} An array containing arrays of the indexes of hint cells + a char value at index 0 of each (O/F) indicating if the hint is about opening or flagging cells
    * @example minefield.getHint(false, false) //returns [['O', 6, 7, 8], ['F', 15, 25, 35]]
    */
   getHint(accurateHint=false, getOneHint=true)
   {
      let matrixIncludesArr = (matrix, arr) => JSON.stringify(matrix).includes(JSON.stringify(arr));

      let hintCells = [];
      let accurateHintCells = [];

      let phantomGroups = [];
      let importantCells = [];

      for (let i=0; i<this.cells; i++)
      {
         if (this[i].isOpen == false && this[i].isFlagged == false)
         {
            let nearbyCells = this.getNearbyCells(i);
            
            for (let j=0; j<nearbyCells.length; j++)
            {
               if (this[nearbyCells[j]].isOpen == true)
               {
                  importantCells.push(nearbyCells[j]);
               }
            }
         }
      }

      importantCells = [...new Set(importantCells)];


      for (let i of importantCells) //1st try: using flags
      {
         if (this[i].isOpen)
         {
            if (this[i].mines == 0) //all nearby cells are fine
            {
               let nearbyCells = this.getNearbyCells(i);
               let closedCells = nearbyCells.filter(x => this[x].isOpen == false)

               if (closedCells.length > 0)
               {
                  hintCells.push(["O", ...nearbyCells, i])
                  accurateHintCells.push(["O", ...closedCells]);
               }
            }
            else
            {
               let nearbyCells = this.getNearbyCells(i);
      
               let closedCells = 0, flaggedCells = 0, unflaggedCells = [];
      
               for (let j=0; j<nearbyCells.length; j++)
               {
                  if (this[nearbyCells[j]].isOpen == false)
                  {
                     closedCells++;

                     if (this[nearbyCells[j]].isFlagged) flaggedCells++;
                     else unflaggedCells.push(nearbyCells[j]);
                  }
               }
      
               if (unflaggedCells.length > 0)
               {
                  if (this[i].mines == flaggedCells) //all nearby cells are fine (except for the flagged cells) > open them
                  {
                     hintCells.push(["O", ...nearbyCells, i])
                     accurateHintCells.push(["O", ...unflaggedCells]);
                  }
      
                  if (this[i].mines == closedCells) //all nearby closed cells are mines > flag them all
                  {
                     hintCells.push(["F", ...nearbyCells, i])
                     accurateHintCells.push(["F", ...unflaggedCells]);
                  }
      
                  if (this[i].mines > flaggedCells) //all nearby not flagged cells have some mines > phantom flagging
                  {
                     let tempPhantomGroup = [this[i].mines - flaggedCells, ...unflaggedCells.sort((a, b) => a - b)];
                     
                     if (matrixIncludesArr(phantomGroups, tempPhantomGroup) == false) phantomGroups.push(tempPhantomGroup);
                  }
               }
            }
         }
      }

      let shiftUpdates = true;
      while (shiftUpdates) //phantom bombs shifting
      {
         shiftUpdates = false;

         for (let i of importantCells)
         {
            let nearbyCells = this.getNearbyCells(i);
            let phantomGroupSum = [0];
            
            let closedCells = [];
            let flaggedCells = 0;

            for (let k=0; k < nearbyCells.length; k++)
            {
               if (this[nearbyCells[k]].isFlagged) flaggedCells++;
               else if (this[nearbyCells[k]].isOpen == false) closedCells.push(nearbyCells[k]);
            }
            
            for (let j=0; j < phantomGroups.length; j++)
            {
               if (phantomGroups[j].slice(1).every(x => closedCells.includes(x)) && closedCells.length != phantomGroups[j].length-1)
               {
                  let shift = closedCells.filter(x => phantomGroups[j].includes(x, 1) == false).sort((a, b) => a - b);
                  let shiftMines = this[i].mines - phantomGroups[j][0] - flaggedCells;

                  let shiftPhantomGroup = [shiftMines, ...shift];

                  if (shift.length > 0 && shiftMines > 0 && matrixIncludesArr(phantomGroups, shiftPhantomGroup) == false)
                  {
                     let push = true;

                     for (let k=0; k<phantomGroups.length; k++)
                     {
                        if (phantomGroups[k].every(x => shiftPhantomGroup.includes(x)))
                        {
                           push = false;
                           break;
                        }
                     }

                     if (push)
                     {
                        phantomGroups.push(shiftPhantomGroup)
                        shiftUpdates = true;
                     }
                  }

                  if (phantomGroups[j].slice(1).some(x => phantomGroupSum.includes(x, 1)) == false)
                  {
                     phantomGroupSum[0] += phantomGroups[j][0];
                     phantomGroupSum.push(...phantomGroups[j].slice(1));
                  }
               }
            }

            if (phantomGroupSum[0] > 0 && matrixIncludesArr(phantomGroups, phantomGroupSum) == false)
            {
               phantomGroups.push(phantomGroupSum);
               shiftUpdates = true;
            }
         }
      }

      for (let i of importantCells) //2nd try: using phantom bombs
      {
         let nearbyCells = this.getNearbyCells(i);

         for (let j=0; j < phantomGroups.length; j++)
         {
            if (nearbyCells.some(x => phantomGroups[j].includes(x, 1)))
            {
               let phantomGroupUncontainedCells = phantomGroups[j].slice(1).filter(x => nearbyCells.includes(x) == false).length;

               let flaggedCells = 0, unknownCells = [], pgCenterNearbyCells = [];

               for (let k=0; k < nearbyCells.length; k++)
               {
                  let tempNearbyCells = this.getNearbyCells(nearbyCells[k]);

                  if (phantomGroups[j].slice(1).every(x => tempNearbyCells.includes(x)) && this[nearbyCells[k]].isOpen)
                  {
                     pgCenterNearbyCells.push(...tempNearbyCells);
                  }

                  if (this[nearbyCells[k]].isFlagged) flaggedCells++;
                  else if (this[nearbyCells[k]].isOpen == false && phantomGroups[j].includes(nearbyCells[k], 1) == false)
                  {
                     unknownCells.push(nearbyCells[k]);
                  }
               }

               if (unknownCells.length > 0)
               {
                  if (this[i].mines == flaggedCells + phantomGroups[j][0] + unknownCells.length) //all unknown cells are mines > flag them all
                  {
                     hintCells.push(["F", ...new Set([...nearbyCells, ...pgCenterNearbyCells, i])]);
                     accurateHintCells.push(["F", ...unknownCells]);
                  }
                  else if (this[i].mines == flaggedCells + phantomGroups[j][0] - phantomGroupUncontainedCells) //all unknown cells are clear > open them
                  {
                     unknownCells = unknownCells.filter(x => this[x].isFlagged == false);

                     if (unknownCells.length > 0)
                     {
                        hintCells.push(["O", ...new Set([...nearbyCells, ...pgCenterNearbyCells, i])]);
                        accurateHintCells.push(["O", ...unknownCells]);
                     }
                  }
               }
            }
         }
      }

      if (this.usedFlags == this.mines) //3th try: using remaining flags count
      {
         let closedCells = [];

         for (let i=0; i < this.cells; i++)
         {
            if (this[i].isOpen == false && this[i].isFlagged == false)
            {
               closedCells.push(i);
            }
         }

         hintCells.push(["O", ...closedCells]);
         accurateHintCells.push(["O", ...closedCells]);
      }
      else
      {
         phantomGroups.sort((a, b) => a.length - b.length)
         let remainingPhantomGroups = [0];
   
         for (let i=0; i<phantomGroups.length; i++)
         {
            if (phantomGroups[i].slice(1).some(x => JSON.stringify(remainingPhantomGroups.slice(1)).includes(x)) == false)
            {
               remainingPhantomGroups[0] += phantomGroups[i][0];
               remainingPhantomGroups.push(...phantomGroups[i].slice(1));
            }
         }
   
         if (remainingPhantomGroups[0] == this.mines - this.usedFlags)
         {
            let safeCells = [];

            for (let i=0; i < this.cells; i++)
            {
               if (this[i].isOpen == false && this[i].isFlagged == false && remainingPhantomGroups.includes(i, 1) == false)
               {
                  safeCells.push(i);
               }
            }

            hintCells.push(["O", ...safeCells]);
            accurateHintCells.push(["O", ...safeCells]);
         }
      }

      if (getOneHint)
      {
         hintCells = hintCells[0];
         accurateHintCells = accurateHintCells[0];
      }

      return accurateHint ? accurateHintCells : hintCells;
   }


   /**
    * Calculates nearby mines number for each cell and assigns the value*/
   resetMines()
   {
      for (let i=0; i<this.cells; i++) this[i].mines = 0;

      for (let i=0; i<this.cells; i++)
      {
         if (this[i].isMine)
         {
            let nearbyCells = this.getNearbyCells(i, true);

            for (let j=0; j<nearbyCells.length; j++)
            {
               this[nearbyCells[j]].mines++;
            }
         }
      }
   }


   /**
    * @returns {Array.<object>} An Array containing only the cells of the Minefield object
    */
   getCellArray()
   {
      return Object.values(this).slice(0, this.cells);
   }
   /**
    * @param {Number} cell The index of the concerned cell
    * @param {Number} getCell Also return the index of the concerned cell, along with the nearby ones (default: false)
    * @returns {Array.<number>} An Array containing the indexes of the cells directly around the given one
    * @throws {Error} If parameters are invalid
    */
   getNearbyCells(cell, getCell=false)
   {
      cell = validateNumber(cell, 0, this.cells-1);
      
      let nearbyCells = [];

      let cellRow = Math.floor(cell / this.cols);
      let isNotFirstRow = cellRow > 0;
      let isNotLastRow = cellRow < this.rows-1;

      let cellCol = cell % this.cols;


      if (getCell) nearbyCells.push(cell)                       //center

      if (isNotFirstRow) nearbyCells.push(cell-this.cols);      //up
      if (isNotLastRow ) nearbyCells.push(cell+this.cols);      //down

      if (cellCol > 0) //if cell isn't on first column
      {
         nearbyCells.push(cell-1);                              //left

         if (isNotFirstRow) nearbyCells.push(cell-this.cols-1); //up left
         if (isNotLastRow ) nearbyCells.push(cell+this.cols-1); //down left
      }

      if (cellCol < this.cols-1) //if cell isn't on last column
      {
         nearbyCells.push(cell+1);                              //right
         
         if (isNotFirstRow) nearbyCells.push(cell-this.cols+1); //up right
         if (isNotLastRow ) nearbyCells.push(cell+this.cols+1); //down right
      }

      return nearbyCells;
   }
   /**
    * @param {Number} cell The index of the concerned cell
    * @param {Boolean} includeFlags If true, the flagged cells will be included in the empty zone (default: false)
    * @returns {Array.<number>} An Array containing the indexes of the empty cells zone starting from the given one
    * @throws {Error} If parameters are invalid
    */
   getEmptyZone(cell, includeFlags=false)
   {
      const widthIndex = this.cols;
      const startMines = 0;

      if (this[cell].mines != startMines) return [];

      let fullStack = new Set();
      let topStack = [cell];

      while(topStack.length)
      {
         let curCell = topStack.pop();

         while(Math.floor(curCell / this.cols) >= 0 && this[curCell].mines == startMines)
         {
            curCell -= widthIndex;
         }

         curCell += widthIndex;

         let reachLeft = false;
         let reachRight = false;

         while (Math.floor(curCell / this.cols) < this.rows && this[curCell].mines == startMines)
         {
            fullStack.add(curCell);

            if (curCell % this.cols > 0)
            {
               if (this[curCell-1].mines == startMines && fullStack.has(curCell-1) == false)
               {
                  if (reachLeft == false)
                  {
                     topStack.push(curCell-1);
                     reachLeft = true;
                  }
               }

               else if (reachLeft) reachLeft = false;
            }

            if (curCell % this.cols < this.cols-1)
            {
               if (this[curCell+1].mines == startMines && fullStack.has(curCell+1) == false)
               {
                  if (reachRight == false)
                  {
                     topStack.push(curCell+1);
                     reachRight = true;
                  }
               }
               
               else if (reachRight) reachRight = false;
            }

            curCell += widthIndex;
         }
      }

      let marginStack = new Set();

      if (includeFlags)
      {
         for (let cell of fullStack)
         {
            let nearbyCells = this.getNearbyCells(cell);
   
            for (let j=0; j<nearbyCells.length; j++)
            {
               if (this[nearbyCells[j]].mines != startMines)
               {
                  marginStack.add(nearbyCells[j])
               }
            }
         }
      }
      else
      {
         for (let cell of fullStack)
         {
            if (this[cell].isFlagged) fullStack.delete(cell);
   
            let nearbyCells = this.getNearbyCells(cell);
   
            for (let j=0; j<nearbyCells.length; j++)
            {
               if (this[nearbyCells[j]].mines != startMines && this[nearbyCells[j]].isFlagged == false)
               {
                  marginStack.add(nearbyCells[j])
               }
            }
         }
      }

      return [...fullStack, ...marginStack];
   }


   /**
    * @param {Number} cell The index of the concerned cell
    * @returns {Number} A Number that indicates the row the given cell is in (0-based)
    */
   getCellRow(cell)
   {
      cell = validateNumber(cell);
      
      return Math.floor(cell / this.cols);
   }
   /**
    * @param {Number} cell The index of the concerned cell
    * @returns {Number} A Number that indicates the column the given cell is in (0-based)
    */
   getCellCol(cell)
   {
      cell = validateNumber(cell);

      return cell % this.cols;
   }
   /**
    * @param {Number} row The row of the desired cell
    * @param {Number} col The column of the desired cell
    * @returns {Number} A Number that indicates the index of the cell that is in the specified row and column
    */
   getCellIndex(row, col)
   {
      row = validateNumber(row), col = validateNumber(col);

      return row*this.cols + col;
   }


   /**
    * @returns {Boolean} a Boolean value that indicates whether the game is new (before the first move)
    */
   isNew()
   {
      return this.getCellArray().some(x => x.isOpen) == false;
   }
   /**
    * @returns {Boolean} a Boolean value that indicates whether the game is going on (after the first move, before game over)
    */
   isGoingOn()
   {
      let foundClosedEmpty = false;
      let foundOpen = false;

      for (let i=0; i < this.cells; i++)
      {
         if (this[i].isOpen && this[i].isMine) return false;

         if (this[i].isOpen) foundOpen = true;
         if (this[i].isOpen == false && this[i].isMine == false) foundClosedEmpty = true;
      }

      return foundOpen && foundClosedEmpty;
   }
   /**
    * @returns {Boolean} a Boolean value that indicates whether the game is over (both cleared or lost)
    */
   isOver()
   {
      let foundClosedEmpty = false;

      for (let i=0; i < this.cells; i++)
      {
         if (this[i].isOpen == false && this[i].isMine == false) foundClosedEmpty = true;
         if (this[i].isOpen && this[i].isMine) return true;
      }

      return foundClosedEmpty == false;
   }
   /**
    * @returns {Boolean} a Boolean value that indicates whether the minefield has been cleared (no mines opened)
    */
   isCleared()
   {
      for (let i=0; i < this.cells; i++)
      {
         if (this[i].isOpen == false && this[i].isMine == false) return false;
         if (this[i].isOpen && this[i].isMine) return false;
      }

      return true;
   }
   /**
    * @returns {Boolean} a Boolean value that indicates whether a mine has been opened in the current minefield
    */
   isLost()
   {
      return this.getCellArray().some(x => x.isOpen && x.isMine);
   }


   /**
    * Console logs the minefield in a visual way. Legend:
    * 
    *  - ?: Unknown cells (neither opened or flagged)
    *  - F: Flagged cells
    *  - [N]: An open cell, with its nearby mines number
    *  - X: An open mine
    * 
    * @param {Boolean} allsee If true, every cell will be showed as if they were open (default: false)
    */
   visualDebug(allsee=false)
   {
      let text = "";

      for (let i=0; i < this.cells; i++)
      {
         let cell = "";

         if (this[i].isOpen == false && allsee == false)
         {
            if (this[i].isFlagged) cell += "F";
            else cell += "?";
         }
         else if (this[i].isMine == true) cell += "X";
         else cell += this[i].mines;

         if (this.getCellCol(i+1) == 0) text += cell + "\n";
         else text += cell + " ";
      }

      console.log(text);
   }
   

   /**
    * @returns {Number} A Number that indicates the used flags in the current minefield
    */
   get usedFlags()
   {
      let flags = 0;

      for (let i=0; i<this.cells; i++)
      {
         if (this[i].isFlagged) flags++;
      }

      return flags;
   }
};

function validateNumber(num, min=-Infinity, max=Infinity)
{
   try
   {
      num = Math.trunc(min >= 0 ? Math.abs(+num) : +num);
      if (isNaN(num)) throw new Error();
   }
   catch {throw new Error("Invalid parameter type");}
   
   if (num < min) throw new Error("Parameter value is too small");
   if (num > max) throw new Error("Parameter value is too big");

   return num;
};