# minesweeper.js
A Minesweeper class engine that can be used to easily create minefields and play without having to code any logic (UI-indipendent).
[Here's what you can do using it](https://github.com/zWolfrost/JSMinesweeper).

Supports:
- Lots of useful logic methods such as "**openCell**" and "**getHint**" ([see below their use](#minefield-object-methods));
- Minefield **Auto-Solving Algorithm** (useful when wanting to make no-guess minefields);
- **Current minefield state** methods (it's going on, it's over etc.);
- Possibility to **switch** from a 1D-Array Minefield to a 2D-Array one depending on your taste;
- **Used flags** count;
- **Visual Debugging**.

## Dependencies
minesweeper.js is written in vanilla javascript (ES10) and has no dependencies.

## How to install
You can just install it like any npm package,<br>
`npm i @zwolfrost/minesweeper.js`<br>
use a [cdn](#how-to-use) or copy the file from the [src directory](src/).

&nbsp;
## BREAKING CHANGES!
**Watch out for this section if you wish to migrate to a different version.**

- **v2.0.0+**: The "rows" and "cols" parameters and properties were replaced with "width" and "height" for understanding purposes. <br> `(rows, cols, ...)` --> `(width, height, ...)`

- **v2.1.0+**: The "x" and "y" parameters were changed to stay both in an array when passing them to methods. <br> `(x, y, ...)` --> `([x, y], ...)`

&nbsp;
# How to use
*Note that you can change the cdn version and/or package type of the library with whatever version you want. Template:*<br>
`https://cdn.jsdelivr.net/npm/package@version/file`.
```
import Minefield from "path/to/minesweeper.js"
//OR
import Minefield from "https://cdn.jsdelivr.net/npm/@zwolfrost/minesweeper.js@2.1.2/src/minesweeper.js";

let minefield = new Minefield(2, 5, 3);
```

Creates a 2x5 minefield with 3 mines, which is an object containing:
 - `width`:  The minefield width (n. of columns)
 - `height`: The minefield height (n. of rows)
 - `cells`:  The minefield total cells number
 - `mines`:  The minefield total mines number
 - `[0...9]`:           Each minefield cell on its index (2x5 thus 0 to 9 in this case)
   - `[0...9].isOpen`:    Whether a cell is revealed
   - `[0...9].isMine`:    Whether a cell is a mine
   - `[0...9].isFlagged`: Whether a cell is flagged
   - `[0...9].mines`:     Number of mines present around a cell

&nbsp;
```
let minefield2d = minefield.toMinefield2D();
```

Creates a Minefield2D Object that is very similar to a Minefield one with the only difference being that, instead of having cells in the same array, the minefield is like a 2D Array.
- `[0][0...4].isOpen, isMine, ecc.`
- `[1][0...4].isOpen, isMine, ecc.`
- `width, height, ecc.`

&nbsp;
## Minefield Object Methods
*Note that the methods are fully documented in the JSDOC methods comments*

| Method            | Description                                                                                                                                                                                                  | Parameters
|:-----------------:|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:-
| **new Minefield** | Creates a "Minefield" Object.                                                                                                                                                                                | <ul><li>The **width** of the minefield (n. of columns).</li><li>The **height** of the minefield (n. of rows).</li><li>The **mines** number/placements.</li><li>An optional **randomizer** that is useful in case you want to make a seed system (default: Math.random).</li></ul>
| toMinefield2D     | Returns a "[Minefield2D](#minefield2d-object-methods)" Object, based on your "Minefield" Object. Note that the two share the same addresses to the same cells, so a change on one will reflect on the other. |
| openCell          | Opens a given cell and may open nearby ones following the minesweeper game rules. Returns the index of cells updated by this operation.                                                                      | <ul><li>The **index** of the cell to open.</li><li>A boolean value "**firstclick**" that indicates whether the method is executed on a new game or not (default: isNew()). If it's true, and a bomb is opened, it will be moved in another cell starting from 0.</li><li>A boolean value "**nearbyOpening**" that enables the opening of nearby cells if the given cell is already open and its nearby mines number matches the number of nearby flagged cells (default: true).</li><li>A boolean value "**nearbyFlagging**" that enables the flagging of nearby cells if the given cell is already open and its nearby mines number matches the number of nearby closed cells (default: true).</li></ul>
| isSolvableFrom    | Returns a Boolean value that indicates whether the game is solvable from a given cell (by not guessing).                                                                                                     | <ul><li>The **index** of the cell where to start.</li><li>A boolean value "**restore**". If true, the minefield will be fully re-closed after the method's execution (default: true).</li></ul>
| getHint           | Returns an Array of indexes of hint cells about a minefield's state.                                                                                                                                         | <ul><li>A boolean value "**accurateHint**" that indicates whether the hint will be the exact cells or more "in the area" (default: false).</li><li>Another optional boolean value "**getOneHint**" that indicates whether to return only an hint (1D array) or more (2D array) (default: true).</li></ul>
| resetMines        | Resets the nearby-mines number for each cell in the current minefield.                                                                                                                                       |
| forEachCell       | Executes a given function for every cell (passing them as parameters along with the corresponding index, like a forEach).                                                                                    | <ul><li>A **function** to execute for each cell</li><ul>
| getNearbyCells    | Returns an Array containing the indexes of the cells directly around the given one.                                                                                                                          | <ul><li>The **index** of the desired cell.</li><li>A boolean value "**includeSelf**". If true, the index of the given cell will also be included (default: false).</li></ul>
| getEmptyZone      | Returns an Array containing the indexes of the empty cells zone starting from the given one.                                                                                                                 | <ul><li>The **index** of the cell where to start.</li><li>A boolean value "**includeFlags**". If true, the flagged cells will be included in the result (default: false).</li></ul>
| getSquareZone     | Returns an Array containing the indexes of all the square zone cells starting and ending at the specified indexes.                                                                                           | <ul><li>The starting index "**begIndex**" of the square zone.</li><li>The ending index "**endIndex**" of the square zone.</li></ul>
| getCellCords      | Returns an Array that contains the X and Y cords of the desired cell.                                                                                                                                        | <ul><li>The **index** of the desired cell.</li></ul>
| getCellIndex      | Returns a Number that indicates the index of the cell that is in the specified X and Y coordinates.                                                                                                          | <ul><li>The **x** and **y** coordinate of the desired cell (in an array).</li></ul>
| isNew             | Returns a Boolean value that indicates whether the game is new (before the first move).                                                                                                                      |
| isGoingOn         | Returns a Boolean value that indicates whether the game is going on (after the first move, before game over).                                                                                                |
| isOver            | Returns a Boolean value that indicates whether the game is over (both cleared or lost).                                                                                                                      |
| isCleared         | Returns a Boolean value that indicates whether the minefield has been cleared (no mines opened).                                                                                                             |
| isLost            | Returns a Boolean value that indicates whether a mine has been opened in the current minefield.                                                                                                              |
| visualDebug       | Console logs the minefield in a visual way.                                                                                                                                                                  | <ul><li>A boolean value "**allsee**". If true, every cell will be showed as if they were open (default: false)</li></ul>
| usedFlags         | (getter) A Number that indicates the used flags in the current minefield.                                                                                                                                    |

&nbsp;
## Minefield2D Object Methods
The Minefield2D Methods are **completely the same** as the Minefield ones with the only difference being that every index, that being parameter or result, is changed with X and Y coordinates.

Also the "**toMinefield2D**" Method is replaced with "toMinefield" which is conceptually the same.