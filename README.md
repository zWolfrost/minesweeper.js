# minesweeper.js
A Minesweeper class engine that can be used to easily create minefields and play without having to code any logic (UI-indipendent).
[Here's what you can do using it](https://github.com/zWolfrost/JSMinesweeper).

Supports:
- Lots of useful logic functions such as "**openCell**" and "**getHint**" ([see below their use](#methods));
- **Minefield Auto-Solving Algorithm** (useful when wanting to make no-guess minefields);
- **Current minefield state functions** (it's going on, it's over etc.);
- **Used flags count**;
- **Visual Debugging**;

## Dependencies
minesweeper.js is written in vanilla javascript (ES10) and has no dependencies.

## How to install
You can just install it like any npm package

```
npm i @zwolfrost/minesweeper.js
```

or just copy the file from the [src directory](src/minesweeper.js)

&nbsp;
# How to use
```
import Minefield from "path/to/minesweeper.js"
let minefield = new Minefield(2, 5, 3);
```

Creates a 2x5 minefield with 3 mines, which is an object containing:
 - rows:  The minefield rows
 - cols:  The minefield columns
 - cells: The minefield total cells number
 - mines: The minefield total mines number
 - [0...9]:           Each minefield cell on its index (2x5 thus 0 to 9 in this case)
   - [0...9].isOpen:    Whether a cell is revealed
   - [0...9].isMine:    Whether a cell is a mine
   - [0...9].isFlagged: Whether a cell is flagged
   - [0...9].mines:     Number of mines present around a cell


## Methods
#### Full accurate description of methods here mentioned available in JSDOC Comments

|      Method      | Short Description
|:----------------:|:-
| simplify         | Returns a simplified 2D-Array version of the minefield.
| openCell         | Opens a given cell and may open nearby ones following the minesweeper game rules. Can also get the index of an already open cell that matches its nearby mines number with its nearby flags to open all of its nearby non-flagged cells.
| isSolvableFrom   | Checks if a minefield is solvable from a given cell (by not guessing).
| getHint          | Checks the minefield to find hints about its state.
| resetMines       | Calculates nearby mines number for each cell and assigns the value.
| getCellArray     | Returns an Array containing only the cells of the Minefield object.
| getNearbyCells   | Returns an Array containing the indexes of the cells directly around the given one.
| getEmptyZone     | Returns an Array containing the indexes of the empty cells zone starting from the given one.
| getCellRow       | Returns a Number that indicates the row the given cell is in (0-based).
| getCellCol       | Returns a Number that indicates the column the given cell is in (0-based).
| getCellIndex     | Returns a Number that indicates the index of the cell that is in the specified row and column.
| isNew            | Returns a Boolean value that indicates whether the game is new (before the first move).
| isGoingOn        | Returns a Boolean value that indicates whether the game is going on (after the first move, before game over).
| isOver           | Returns a Boolean value that indicates whether the game is over (both cleared or lost).
| isCleared        | Returns a Boolean value that indicates whether the minefield has been cleared (no mines opened).
| isLost           | Returns a Boolean value that indicates whether a mine has been opened in the current minefield.
| visualDebug      | Console logs the minefield in a visual way.
| usedFlags        | (getter) A Number that indicates the used flags in the current minefield.