const boardDiv = document.querySelector('.board')
const difficultySelect = document.querySelector('.difficulty')
const scoreTracker = document.querySelector('.score-tracker')
const replayBtn = document.querySelector('.replay-button')
const timeTracker = document.querySelector('.time-tracker')
const messagePara = document.querySelector('.message')

/****************************
 * Change these to impart 
 * interesting variations
 * to the game
 * **************************/
let ROWS = 16
let COLS = 16
let MINEPERCENTAGE = 0.1
/****************************/

let CELLCOUNT = ROWS * COLS
let MINECOUNT = Math.floor(MINEPERCENTAGE * CELLCOUNT)
let VALIDCOUNT = CELLCOUNT - MINECOUNT

const CELLCLASS = 'cell'
const STARTCELLCLASS = 'start-cell'
const FLAGCLASS = 'flag'
const HIDDENCLASS = 'hidden'

const MINETEXT = 'mine'
const VALIDTEXT = 'valid'

const STARTICON = '<i class="fas fa-circle"></i>'
const FLAGICON = '<i class="fas fa-times"></i>'
const MINEICON = '&#x1F4A5;'
const WINICON = '<i class="fas fa-trophy"></i> YOU WIN'
const LOSEICON = '<i class="fas fa-thumbs-down"></i> YOU LOSE'

/*********************************
 * These are reset before each game
 **********************************/
let isGameOver
let startingCell
let originalTarget
let cellDivs
let layoutArray
let neighboringMinesArray
let minesFlagged
let hiddenCellCount

let intervalId = null
/*********************************** */

/***********************************************
 * Make magic happen
 * Either on page load
 * or on replay button click
 * or on changing the difficulty drop down value
 **********************************************/
createBoard(difficultySelect.value)

difficultySelect.addEventListener('change', (e) => {
    createBoard(e.target.value)
})

replayBtn.addEventListener('click', (e) => {
    createBoard(difficultySelect.value)
})
/******************************************** */


function createBoard (difficulty) {
    resetGame(difficulty)

    const mineArray = Array(MINECOUNT).fill(MINETEXT)
    const validArray = Array(VALIDCOUNT).fill(VALIDTEXT)

    layoutArray = mineArray.concat(validArray)

    // Shuffle the layout array
    // using Fisher-Yates algorithm
    for (let i = layoutArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * i)
        const temp = layoutArray[i]
        layoutArray[i] = layoutArray[j]
        layoutArray[j] = temp
    }
    
    let cellIndex = 0

    for (let i = 0; i < ROWS; i++) {
        const rowDiv = document.createElement('div')
        rowDiv.classList.add('row')

        for (let j = 0; j < COLS; j++) {
            const cellDiv = document.createElement('div')
            
            cellDiv.id = cellIndex
            cellDiv.classList.add(CELLCLASS, HIDDENCLASS)

            rowDiv.appendChild(cellDiv)
            cellDivs.push(cellDiv);

            cellIndex++;
        }

        boardDiv.appendChild(rowDiv)
    }

    for (let i = 0; i < cellDivs.length; i++) {
        const thisCell = cellDivs[i]

        neighboringMinesArray.push(countSurroundingMines(thisCell))

        if (startingCell === null && 
            !isMine(thisCell.id) && 
            !hasNeighboringMines(thisCell)) {
            
            startingCell = thisCell
        }

        thisCell.addEventListener('click', () => {
            originalTarget = thisCell
            handleLeftClick(thisCell)
        })

        thisCell.addEventListener('contextmenu', (e) => {
            e.preventDefault()
            handleRightClick(thisCell)
        })
    }

    startingCell.classList.add(STARTCELLCLASS)
    startingCell.innerHTML = STARTICON
}

function resetGame (difficulty) {
    isGameOver = false
    startingCell = null
    originalTarget = null
    cellDivs = []
    layoutArray = []
    neighboringMinesArray = []
    minesFlagged = 0
    boardDiv.innerHTML = ''
    messagePara.innerHTML = ''
    setDifficulty(difficulty)
    updateScore()
    restartTimer()
}


function setDifficulty (level) {
    switch(parseInt(level)) {
        case 0: // Beginner
            setBoardVals(16, 16, 0.05)
            break
        case 1: // Easy
            setBoardVals(16, 16, 0.1)
            break
        case 2: // Moderate
            setBoardVals(20, 20, 0.15)
            break
        case 3: // Hard
            setBoardVals(20, 20, 0.18)
            break
        case 4: // Extreme
            setBoardVals(25, 25, 0.22)
            break
        default:
            console.error('Error occured while setting difficulty.');
    }

    CELLCOUNT = ROWS * COLS
    hiddenCellCount = ROWS * COLS
    MINECOUNT = Math.floor(MINEPERCENTAGE * CELLCOUNT)
    VALIDCOUNT = CELLCOUNT - MINECOUNT

    function setBoardVals (rows, cols, minepercentage) {
        ROWS = rows
        COLS = cols
        MINEPERCENTAGE = minepercentage
    }
}


function countSurroundingMines (cell) {
    const cellId = parseInt(cell.id)
    let idsToCheck = []

    const nwCellId = cellId - ROWS - 1,
        nCellId = cellId - ROWS,
        neCellId = cellId -ROWS + 1,
        wCellId = cellId - 1,
        eCellId = cellId + 1,
        swCellId = cellId + ROWS - 1,
        sCellId = cellId + ROWS,
        seCellId = cellId + ROWS + 1

    if (isTopCornerLeft(cellId)) {
        idsToCheck = [eCellId, seCellId, sCellId]
    } 
    else if (isTopEdge(cellId)) {
        idsToCheck = [wCellId, eCellId, sCellId, seCellId, swCellId]
    } 
    else if (isTopCornerRight(cellId)) {
        idsToCheck = [wCellId, swCellId, sCellId]
    } 
    else if (isLeftEdge(cellId)) {
        idsToCheck = [nCellId, neCellId, eCellId, seCellId, sCellId]
    } 
    else if (isRightEdge(cellId)) {
        idsToCheck = [nCellId, sCellId, swCellId, wCellId, nwCellId]
    } 
    else if (isBottomCornerLeft(cellId)) {
        idsToCheck = [nCellId, neCellId, eCellId]
    } 
    else if (isBottomEdge(cellId)) {
        idsToCheck = [nCellId, neCellId, eCellId, wCellId, nwCellId]
    } 
    else if (isBottomCornerRight(cellId)) {
        idsToCheck = [nCellId, wCellId, nwCellId]
    } 
    else {
        idsToCheck = [nCellId, neCellId, eCellId, seCellId, sCellId, swCellId, wCellId, nwCellId]
    }

    return countMines(idsToCheck)
}


function countMines (cellIds) {
    let count = 0;
    cellIds.forEach(cellId => {
        if (isMine(cellId)) count++
    })

    return count
}


function isMine (cellId) {
    return (layoutArray[cellId] === MINETEXT)
}


function handleLeftClick (cell) {
    const cellId = parseInt(cell.id)

    if (isGameOver) return
    if (isFlagged(cell) || !isHidden(cell)) return
    if (isMine(cellId) && !isOriginalTarget(cell)) return

    // Check losing condition
    if (isMine(cellId)) {
        endGame(false)
    }

    unHide(cell)
    
    // Check recursion condition
    if (!hasNeighboringMines(cell)) {
        setTimeout(() => {
            if (hasTop(cellId)) {
                handleLeftClick(cellDivs[cellId - ROWS])
            }
            if (hasTopRight(cellId)) {
                handleLeftClick(cellDivs[cellId - ROWS + 1])
            }
            if (hasRight(cellId)) {
                handleLeftClick(cellDivs[cellId + 1])
            }
            if (hasBottomRight(cellId)) {
                handleLeftClick(cellDivs[cellId + ROWS + 1])
            }
            if (hasBottom(cellId)) {
                handleLeftClick(cellDivs[cellId + ROWS])
            }
            if (hasBottomLeft(cellId)) {
                handleLeftClick(cellDivs[cellId + ROWS - 1])
            }
            if (hasLeft(cellId)) {
                handleLeftClick(cellDivs[cellId - 1])
            }
            if (hasTopLeft(cellId)) {
                handleLeftClick(cellDivs[cellId - ROWS - 1])
            }
        }, 30)
    }

    // Check winning condition
    if (hiddenCellCount === MINECOUNT) {
        endGame(true)
    }
}


function handleRightClick (cell) {
    if (isGameOver) return
    if (!isHidden(cell)) return

    toggleFlag(cell)

    // Check winning condition
    if (minesFlagged === MINECOUNT) {
        endGame(true)
    }
}


function toggleFlag (cell) {
    if (!isFlagged(cell)) {
        flag(cell)
    } else {
        unFlag(cell)   
    }
}


function isFlagged (cell) {
    return cell.classList.contains(FLAGCLASS)
}


function flag (cell) {
    cell.classList.add(FLAGCLASS)
    cell.innerHTML = FLAGICON

    if (isMine(cell.id)) {
        minesFlagged++
        updateScore()
    }
}


function unFlag (cell) {
    cell.classList.remove(FLAGCLASS)
    cell.innerHTML = ''

    if (isMine(cell.id)) {
        minesFlagged--
        updateScore()
    };
}


function updateScore () {
    scoreTracker.innerHTML = MINECOUNT - minesFlagged
}


function restartTimer() {
    stopTimerIfRunning()

    let seconds = 0
    let minutes = 0
    let secText = ''
    let minText = ''

    timeTracker.innerHTML = ''

    intervalId = setInterval(() => {
        secText = seconds < 10 ? '0' + seconds : seconds.toString()
        minText = minutes < 10 ? '0' + minutes : minutes.toString()
        timeTracker.innerHTML = minText + ':' + secText
        
        seconds++

        if (seconds > 59) {
            seconds = 0
            minutes++
        }
    }, 1000)
}


function stopTimerIfRunning () {
    if (intervalId) clearInterval(intervalId)
}


function isHidden (cell) {
    return cell.classList.contains(HIDDENCLASS)
}


function isOriginalTarget (cell) {
    return cell === originalTarget
}


function endGame (isWin) {
    stopTimerIfRunning()
    isGameOver = true

    if (isWin) {
        messagePara.innerHTML = WINICON
        setTimeout(() => alert('You Won!'), 10)
    }
    else {
        cellDivs.forEach(cell => {
            if (isMine(cell.id)) {
                unHide(cell)
                cell.innerHTML = MINEICON
            }
        })

        messagePara.innerHTML = LOSEICON
        setTimeout(() => alert('Sorry, you lost.'), 10)
    }
}


function hasNeighboringMines (cell) {
    return neighboringMinesArray[cell.id] > 0
}


function unHide (cell) {
    cell.classList.remove(HIDDENCLASS)

    const surroundingMineCount = neighboringMinesArray[cell.id]
    if (surroundingMineCount && !isMine(cell.id)) cell.innerHTML = surroundingMineCount

    hiddenCellCount--
}


function isTopCornerLeft (cellId) {
    return cellId === 0
}


function isTopEdge (cellId) {
    return (cellId > 0) && (cellId < ROWS - 1)
}


function isTopCornerRight (cellId) {
    return cellId === (ROWS - 1)
}


function isLeftEdge (cellId) {
    return (cellId > 0) && (cellId < (ROWS - 1) * COLS) && (cellId % ROWS === 0)
}


function isRightEdge (cellId) {
    return (cellId > ROWS) && (cellId < (ROWS - 1) * COLS) && ((cellId + 1) % ROWS === 0)
}


function isBottomCornerLeft (cellId) {
    return cellId === (ROWS - 1) * COLS
}


function isBottomEdge (cellId) {
    return (cellId > (ROWS - 1) * COLS) && (cellId < (ROWS * COLS) - 1)
}


function isBottomCornerRight (cellId) {
    return cellId === (ROWS * COLS) - 1
}


function hasTop (cellId) {
    return !isTopCornerLeft(cellId) && 
           !isTopEdge(cellId) && 
           !isTopCornerRight(cellId)
}


function hasRight (cellId) {
    return !isTopCornerRight(cellId) &&
           !isRightEdge(cellId) &&
           !isBottomCornerRight(cellId)
}


function hasBottom (cellId) {
    return !isBottomCornerLeft(cellId) &&
           !isBottomEdge(cellId) &&
           !isBottomCornerRight(cellId)
}


function hasLeft (cellId) {
    return !isTopCornerLeft(cellId) && 
           !isLeftEdge(cellId) && 
           !isBottomCornerLeft(cellId)
}


function hasTopLeft (cellId) {
    return hasTop(cellId) &&
           hasLeft(cellId)
}


function hasTopRight (cellId) {
    return hasTop(cellId) &&
           hasRight(cellId)
}


function hasBottomLeft (cellId) {
    return hasBottom(cellId) &&
           hasLeft(cellId)
}


function hasBottomRight (cellId) {
    return hasBottom(cellId) &&
           hasRight(cellId)
}
