function init() {

  // * DOM elements
  const grid = document.querySelector('.grid')
  let cells = []

  const display = document.querySelector('.up-next-display')
  const displayCells = []

  // * Grid variables
  const width = 10
  const height = 20
  const cellCount = width * height

  // * Make a grid
  for (let i = 0; i < cellCount; i++) {
    const cell = document.createElement('div')
    grid.append(cell)
    cells.push(cell)
  }

  // * Up next display variables
  const displayWidth = 4
  const displayCellCount = displayWidth ** 2

  // * Make an up next display
  for (let i = 0; i < displayCellCount; i++) {
    const displayCell = document.createElement('div')
    display.append(displayCell)
    displayCells.push(displayCell)
  }

  // * Game variables
  const O = [
    [0, -width, -width + 1, 1],
    [-width, -width + 1, 1, 0],
    [-width + 1, 1, 0, -width],
    [1, 0, -width, -width + 1]
  ]

  const L = [
    [-1, 0, 1, -width + 1],
    [-width, 0, width, width + 1],
    [1, 0, -1, width - 1],
    [width, 0, -width, -width - 1]
  ]

  const J = [
    [-width - 1, -1, 0, 1],
    [-width + 1, -width, 0, width],
    [width + 1, 1, 0, -1],
    [width - 1, width, 0, -width]
  ]

  const S = [
    [-1, 0, -width, -width + 1],
    [-width, 0, 1, width + 1],
    [1, 0, width, width - 1],
    [width, 0, -1, -width - 1]
  ]

  const Z = [
    [-width - 1, -width, 0, 1],
    [-width + 1, 1, 0, width],
    [width + 1, width, 0, -1],
    [width - 1, -1, 0, -width]
  ]

  const T = [
    [-1, 0, -width, 1],
    [-width, 0, 1, width],
    [1, 0, width, -1],
    [width, 0, -1, -width]
  ]
  
  const I = [
    [-1, 0, 1, 2],
    [-width + 1, 1, width + 1, width * 2 + 1],
    [width + 2, width + 1, width, width - 1],
    [width * 2, width, 0, -width]
  ]

  const tetrominoes = [O, L, J, S, Z, T, I]
  const tetrominoColors = ['yellow', 'orange', 'blue', 'green', 'red', 'purple', 'skyblue']
  
  let currentIndex
  let currentTetrominoRotations
  let currentTetromino
  let currentColor

  const startingPosition = 14
  let currentPosition = startingPosition

  let timerId
  let tick = 1000 // 1000 milliseconds = 1 second
  let hasLost = false

  const nextTetrominoes = [
    [0, -displayWidth, -displayWidth + 1, 1],
    [-1, 0, 1, -displayWidth + 1],
    [-displayWidth - 1, -1, 0, 1],
    [-1, 0, -displayWidth, -displayWidth + 1],
    [-displayWidth - 1, -displayWidth, 0, 1],
    [-1, 0, -displayWidth, 1],
    [-1, 0, 1, 2]
  ]

  let nextIndex
  let nextTetromino
  let nextColor

  const displayStartingPosition = 5

  // * Create new tetromino
  function newTetromino(index) {
    currentIndex = index
    currentTetrominoRotations = [...tetrominoes[currentIndex]]
    currentTetromino = currentTetrominoRotations[0]
    currentColor = tetrominoColors[currentIndex]
  }
  
  // * Create new next tetromino
  function newNextTetromino() {
    nextIndex = randomIndex()
    nextTetromino = nextTetrominoes[nextIndex]
    nextColor = tetrominoColors[nextIndex]
  }

  // * Cycle to next tetromino
  function cycleTetromino() {
    newTetromino(nextIndex)
    currentPosition = startingPosition
    addTetromino()
    removeNextTetromino()
    newNextTetromino()
    addNextTetromino()
  }

  // * Return random index of tetrominoes array
  function randomIndex() {
    return Math.floor(Math.random() * tetrominoes.length)
  }
  
  // * Add / replace tetromino on grid
  function addTetromino() {
    currentTetromino.forEach(position => {
      cells[currentPosition + position].classList.add('tetromino')
      cells[currentPosition + position].style.backgroundColor = currentColor
    })
    projectTetromino()
  }

  // * Remove tetromino from grid
  function removeTetromino() {
    currentTetromino.forEach(position => {
      cells[currentPosition + position].classList.remove('tetromino')
      cells[currentPosition + position].style.backgroundColor = ''
    })
    removeProjection()
  }

  // * Add next tetromino to display
  function addNextTetromino() {
    nextTetromino.forEach(position => {
      displayCells[displayStartingPosition + position].classList.add('tetromino')
      displayCells[displayStartingPosition + position].style.backgroundColor = nextColor
    })
  }

  // * Remove next tetromino from display
  function removeNextTetromino() {
    nextTetromino.forEach(position => {
      displayCells[displayStartingPosition + position].classList.remove('tetromino')
      displayCells[displayStartingPosition + position].style.backgroundColor = ''
    })
  }

  // * Move tetromino down every tick
  timerId = setInterval(moveTetromino, tick, width)

  // * Attempt to move tetromino
  function moveTetromino(direction) {
    if (cannotMove(direction)) return
    removeTetromino()
    currentPosition += direction
    addTetromino()
  }

  // * Check whether or not tetromino can move (returns true if it cannot)
  function cannotMove(direction) {
    switch (direction) {
      case -1: // left
        return cannotMoveLeft(currentTetromino)
      case 1: // right
        return cannotMoveRight(currentTetromino)
      case width: // down
        return freezeTetromino()
    }
  }

  // * Check whether or not tetromino can move left (returns true if it cannot)
  function cannotMoveLeft(currentTetromino) {
    return atLeftEdge(currentTetromino) || hasPieceLeft()
  }

  // * Check whether or not tetromino can move right (returns true if it cannot)
  function cannotMoveRight(currentTetromino) {
    return atRightEdge(currentTetromino) || hasPieceRight()
  }

  // * Check if tetromino is at left edge of the grid
  function atLeftEdge(currentTetromino) {
    return currentTetromino.some(position => {
      return (currentPosition + position) % width === 0 
    })
  }

  // * Check if tetromino is at right edge of the grid
  function atRightEdge(currentTetromino) {
    return currentTetromino.some(position => {
      return (currentPosition + position) % width === width - 1
    })
  }

  // * Check if tetromino has piece(s) to the left of it
  function hasPieceLeft() {
    return currentTetromino.some(position => {
      return cells[currentPosition + position - 1].classList.contains('occupied')
    })
  }

  // * Check if tetromino has piece(s) to the right of it
  function hasPieceRight() {
    return currentTetromino.some(position => {
      if (currentPosition + position + 1 >= cellCount) return false
      return cells[currentPosition + position + 1].classList.contains('occupied')
    })
  }

  // * Freeze tetromino if at bottom of grid or on top of another piece(s)
  // * Clear any full rows, cycle to next tetromino, check for game over
  function freezeTetromino() {
    const movedDown = currentTetromino.map(position => position + width)
    if (wouldLeaveGrid(movedDown) || wouldOverlapPiece(movedDown)) {
      currentTetromino.forEach(position => {
        cells[currentPosition + position].classList.add('occupied')
      })
      clearRows()
      cycleTetromino()
      gameOver()
      return true
    }
    return false
  }

  // * Check if next position of tetromino would leave bottom of grid
  function wouldLeaveGrid(nextPosition) {
    return nextPosition.some(position => {
      return currentPosition + position >= cellCount
    })
  }

  // * Check if next position of tetromino would overlap piece(s)
  function wouldOverlapPiece(nextPosition) {
    return nextPosition.some(position => {
      return cells[currentPosition + position].classList.contains('occupied')
    })
  }

  // * Rotate tetromino
  function rotateTetromino() {
    removeTetromino()
    if (canRotate(currentTetromino)) {
      currentTetrominoRotations.push(currentTetrominoRotations.shift())
      currentTetromino = currentTetrominoRotations[0]
    }
    addTetromino()
  }

  // * Check if tetromino can be rotated
  // * Push rotated tetromino if it needs to be pushed
  function canRotate(currentTetromino) {
    const nextRotation = currentTetrominoRotations[1]
    const storedPosition = currentPosition
    while (wouldLeaveGrid(nextRotation)) {
      currentPosition -= width
    }
    if (hasPieceLeft() && hasPieceRight()) {
      if (wouldOverlapPiece(nextRotation)) return false
    } else if (atLeftEdge(currentTetromino) && hasPieceRight()) {
      if (wouldOverlapPiece(nextRotation) || atRightEdge(nextRotation)) return false
    } else if (atRightEdge(currentTetromino) && hasPieceLeft()) {
      if (wouldOverlapPiece(nextRotation) || atLeftEdge(nextRotation)) return false
    } else if (hasPieceLeft()) {
      if (wouldOverlapPiece(nextRotation)) currentPosition++
    } else if (hasPieceRight()) {
      if (wouldOverlapPiece(nextRotation)) currentPosition--
    } else if (atLeftEdge(currentTetromino)) {
      if (atRightEdge(nextRotation)) currentPosition++
    } else if (atRightEdge(currentTetromino)) {
      if (atLeftEdge(nextRotation)) currentPosition--
    }
    if (wouldOverlapPiece(nextRotation)) {
      currentPosition -= width
    }
    if (wouldOverlapPiece(nextRotation)) {
      currentPosition = storedPosition
      return false
    }
    return true
  }

  // * Clear any full rows
  function clearRows() {
    for (let i = 0; i < cellCount; i += width) {
      const rowIndices = []
      for (let j = 0; j < width; j++) {
        rowIndices.push(i + j)
      }
      if (rowIndices.every(index => {
        return cells[index].classList.contains('occupied')
      })) {
        rowIndices.forEach(index => {
          cells[index].classList.remove('tetromino')
          cells[index].classList.remove('occupied')
          cells[index].style.backgroundColor = ''
        })
        const rowCleared = cells.splice(i, width)
        cells = rowCleared.concat(cells)
        cells.forEach(cell => grid.append(cell))
      }
    }
  }

  // * Game over if starting position is occupied
  function gameOver() {
    if (wouldOverlapPiece(currentTetromino)) {
      hasLost = true
      clearInterval(timerId)
      cells.forEach(cell => {
        if (cell.classList.contains('occupied') || cell.classList.contains('tetromino')) {
          cell.style.backgroundColor = '#777'
        }
      })
    }
  }

  // * Project lowest possible position of tetromino
  function projectTetromino() {
    const distance = distanceToLowestPosition()
    currentTetromino.forEach(position => {
      if (!cells[currentPosition + position + (width * distance)].classList.contains('tetromino')) {
        cells[currentPosition + position + (width * distance)].classList.add('projection')
        cells[currentPosition + position + (width * distance)].style.backgroundColor = currentColor
      }
    })
  }

  // * Remove projection
  function removeProjection() {
    const distance = distanceToLowestPosition()
    currentTetromino.forEach(position => {
      cells[currentPosition + position + (width * distance)].classList.remove('projection')
      cells[currentPosition + position + (width * distance)].style.backgroundColor = ''
    })
  }

  // * Drop tetromino to lowest possible position
  function hardDrop() {
    const distance = distanceToLowestPosition()
    removeTetromino()
    currentPosition += (width * distance)
    addTetromino()
    moveTetromino(width)
  }

  // * Return distance (in number of rows) to lowest possible position
  function distanceToLowestPosition() {
    const distances = []
    currentTetromino.forEach(position => {
      let emptyCellsBelow = 0
      while (!(currentPosition + position + (width * (emptyCellsBelow + 1)) >= cellCount ||
      cells[currentPosition + position + (width * (emptyCellsBelow + 1))].classList.contains('occupied'))) {
        emptyCellsBelow++
      }
      distances.push(emptyCellsBelow)
    })
    return Math.min(...distances)
  }

  // * Handle keydown event - move / rotate tetromino
  function handleKeyDown(e) {
    if (hasLost) return
    switch (e.keyCode) {
      case 37: // left arrow
      case 65: // a key
        moveTetromino(-1)
        break
      case 39: // right arrow
      case 68: // d key
        moveTetromino(1)
        break
      case 40: // down arrow
      case 83: // s key
        moveTetromino(width)
        break
      case 38: // up arrow
      case 87: // w key
        if (!hasRotated) {
          rotateTetromino()
          hasRotated = true
        }
        break
      case 32: // space bar
        hardDrop()
        break
    }
  }

  // * Boolean
  let hasRotated = false

  // * Handle keyup event - change boolean back to false
  function handleKeyUp() {
    hasRotated = false
  }

  // * Event listeners
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('keyup', handleKeyUp)

  newTetromino(randomIndex())
  addTetromino()
  newNextTetromino()
  addNextTetromino()
}

window.addEventListener('DOMContentLoaded', init)