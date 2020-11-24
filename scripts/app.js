function init() {

  // * DOM elements
  const grid = document.querySelector('.grid')
  let cells = []

  const startButton = document.querySelector('.start-button')
  const pauseScreen = document.querySelector('.pause-screen')

  const scoreBox = document.querySelector('.score')
  const levelBox = document.querySelector('.level')
  const linesBox = document.querySelector('.lines')

  const preview = document.querySelector('.preview')
  const previewCells = []

  const hold = document.querySelector('.hold')
  const holdCells = []

  // * Grid variables
  const width = 10
  const height = 20
  const bufferHeight = 4
  const cellCount = width * (height + bufferHeight)

  // * Make a grid
  for (let i = 0; i < cellCount; i++) {
    const cell = document.createElement('div')
    if (i < width * bufferHeight) {
      cell.classList.add('buffer')
    }
    grid.append(cell)
    cells.push(cell)
  }

  // * Preview variables
  const previewWidth = 4
  const previewHeight = 10
  const previewCellCount = previewWidth * previewHeight

  // * Make a preview
  for (let i = 0; i < previewCellCount; i++) {
    const cell = document.createElement('div')
    preview.append(cell)
    previewCells.push(cell)
  }

  // * Hold variables
  const holdWidth = 4
  const holdCellCount = holdWidth ** 2

  // * Make a hold
  for (let i = 0; i < holdCellCount; i++) {
    const cell = document.createElement('div')
    hold.append(cell)
    holdCells.push(cell)
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
  const tetrominoOrientations = ['wide', 'tall', 'wide', 'tall']
  const tetrominoColors = ['yellow', 'orange', 'blue', 'green', 'red', 'purple', 'skyblue']
  
  let currentIndex
  let currentRotations
  let currentTetromino
  let currentOrientations
  let currentOrientation
  let currentColor

  const startingPosition = 14 + (width * bufferHeight)
  let currentPosition = startingPosition

  let timerId
  let tickRate

  let isGameOver = false
  let isPaused = false

  let score = 0
  let level = 1
  let lines = 0

  const previewTetrominoes = [
    [0, -previewWidth, -previewWidth + 1, 1],
    [-1, 0, 1, -previewWidth + 1],
    [-previewWidth - 1, -1, 0, 1],
    [-1, 0, -previewWidth, -previewWidth + 1],
    [-previewWidth - 1, -previewWidth, 0, 1],
    [-1, 0, -previewWidth, 1],
    [-1, 0, 1, 2]
  ]

  const previewPositions = [9, 21, 33]
  let upcomingTetrominoes = [0,0,0]
  
  const holdPosition = 9
  let heldTetromino = 0
  let canHold

  // * Create new tetromino
  function newTetromino(index) {
    currentIndex = index
    currentRotations = [...tetrominoes[index]]
    currentTetromino = currentRotations[0]
    currentOrientations = [...tetrominoOrientations]
    currentOrientation = currentOrientations[0]
    currentColor = tetrominoColors[index]
    currentPosition = startingPosition
    while (wouldOverlapPiece(currentTetromino)) {
      currentPosition -= width
    }
    addTetromino()
  }

  // * Introduce next upcoming tetromino
  function nextTetromino() {
    newTetromino(upcomingTetrominoes[0][0])
    removeUpcomingTetrominoes()
    updateUpcomingTetrominoes()
    addUpcomingTetrominoes()
    canHold = true
  }

  // * Update upcoming tetrominoes array
  function updateUpcomingTetrominoes() {
    upcomingTetrominoes[0] = upcomingTetrominoes[1]
    upcomingTetrominoes[1] = upcomingTetrominoes[2]
    upcomingTetrominoes[2] = randomTetromino()
  }

  // * Return random tetromino
  function randomTetromino() {
    const index = randomIndex()
    return [index, previewTetrominoes[index], tetrominoColors[index]]
  }

  // * Return random index of tetrominoes array
  function randomIndex() {
    return Math.floor(Math.random() * tetrominoes.length)
  }
  
  // * Add / replace tetromino on grid
  function addTetromino() {
    currentTetromino.forEach(position => {
      cells[currentPosition + position].classList.add('tetromino', 'active')
      cells[currentPosition + position].style.backgroundColor = currentColor
    })
    addGhost()
  }

  // * Remove tetromino from grid
  function removeTetromino() {
    currentTetromino.forEach(position => {
      cells[currentPosition + position].classList.remove('tetromino', 'active')
      cells[currentPosition + position].style.backgroundColor = ''
    })
    removeGhost()
  }

  // * Add upcoming tetrominoes to preview
  function addUpcomingTetrominoes() {
    upcomingTetrominoes.forEach((tetromino, index) => {
      tetromino[1].forEach(position => {
        previewCells[previewPositions[index] + position].classList.add('tetromino')
        previewCells[previewPositions[index] + position].style.backgroundColor = tetromino[2]
      })
    })
  }

  // * Remove upcoming tetrominoes from preview
  function removeUpcomingTetrominoes() {
    upcomingTetrominoes.forEach((tetromino, index) => {
      tetromino[1].forEach(position => {
        previewCells[previewPositions[index] + position].classList.remove('tetromino')
        previewCells[previewPositions[index] + position].style.backgroundColor = ''
      })
    })
  }

  // * Attempt to move tetromino left or right
  function moveTetromino(direction) {
    if (cannotMove(direction)) {
      return
    }
    removeTetromino()
    currentPosition += direction
    addTetromino()
  }

  // * Check whether or not tetromino can move (returns true if it cannot)
  function cannotMove(direction) {
    switch (direction) {
      case -1: // left
        return atLeftEdge() || hasPieceLeft()
      case 1: // right
        return atRightEdge() || hasPieceRight()
      case width: // down
        return freezeTetromino()
    }
  }

  // * Check if tetromino is at left edge of the grid
  function atLeftEdge(tetromino = currentTetromino) {
    return inColumnN(0, tetromino)
  }

  // * Check if tetromino is at right edge of the grid
  function atRightEdge(tetromino = currentTetromino) {
    return inColumnN(width - 1, tetromino)
  }

  // * Check if tetromino is in column n
  function inColumnN(n, tetromino = currentTetromino) {
    return tetromino.some(position => {
      return (currentPosition + position) % width === n
    })
  }

  // * Check if tetromino has piece(s) to the left of it
  function hasPieceLeft(tetromino = currentTetromino) {
    return tetromino.some(position => {
      return cells[currentPosition + position - 1].classList.contains('occupied')
    })
  }

  // * Check if tetromino has piece(s) to the right of it
  function hasPieceRight(tetromino = currentTetromino) {
    return tetromino.some(position => {
      if (currentPosition + position + 1 >= cellCount) {
        return false
      }
      return cells[currentPosition + position + 1].classList.contains('occupied')
    })
  }

  // * Attempt to move tetromino down
  function softDrop(forced = false) {
    if (cannotMove(width)) {
      if (!forced) {
        resetClock()
      }
      return
    }
    removeTetromino()
    currentPosition += width
    addTetromino()
    if (!forced) {
      score += 1 * Math.ceil((level + 1) / 2)
      updateScore()
    }
  }

  // * Move tetromino down every tick
  function resetClock() {
    if (timerId) {
      clearInterval(timerId)
    }
    timerId = setInterval(softDrop, tickRate, true)
  }

  // * Freeze tetromino if at bottom of grid or on top of another piece(s)
  // * Clear any full rows, cycle to next tetromino, check for game over
  function freezeTetromino() {
    const movedDown = currentTetromino.map(position => position + width)
    if (wouldLeaveGrid(movedDown) || wouldOverlapPiece(movedDown)) {
      currentTetromino.forEach(position => {
        cells[currentPosition + position].classList.add('occupied')
        cells[currentPosition + position].classList.remove('active')
      })
      clearLines()
      nextTetromino()
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

  // * Attempt to rotate tetromino
  function rotateTetromino(direction) {
    removeTetromino()
    if (canRotate(direction)) {
      switch (direction) {
        case 1: // clockwise
          currentRotations.push(currentRotations.shift())
          currentOrientations.push(currentOrientations.shift())
          break
        case 3: // counterclockwise
          currentRotations.unshift(currentRotations.pop())
          currentOrientations.unshift(currentOrientations.pop())
          break
      }
      currentTetromino = currentRotations[0]
      currentOrientation = currentOrientations[0]
    }
    addTetromino()
  }

  // * Check if tetromino can be rotated
  // * Push rotated tetromino if it needs to be pushed
  function canRotate(direction) {
    if (currentIndex === 0) return true
    const nextRotation = currentRotations[direction]
    const storedPosition = currentPosition
    while (wouldLeaveGrid(nextRotation)) {
      currentPosition -= width
    }
    if (currentIndex !== 6) {
      if (currentOrientation === 'tall') {
        if (atLeftEdge()) {
          if (atRightEdge(nextRotation)) {
            currentPosition++
          }
        } else if (atRightEdge()) {
          if (atLeftEdge(nextRotation)) {
            currentPosition--
          }
        } else if (hasPieceLeft()) {
          if (wouldOverlapPiece(nextRotation)) {
            currentPosition++
          }
        } else if (hasPieceRight()) {
          if (wouldOverlapPiece(nextRotation)) {
            currentPosition--
          }
        }
      } else {
        if (wouldOverlapPiece(nextRotation)) {
          currentPosition -= width
        }
      }
    } else {
      let count = 0
      if (currentOrientation === 'tall') {
        if (atLeftEdge() || inColumnN(1)) {
          while ((atRightEdge(nextRotation) || wouldOverlapPiece(nextRotation)) && count < 2) {
            currentPosition++
            count++
          }
        } else if (atRightEdge() || inColumnN(width - 2)) {
          while ((atLeftEdge(nextRotation) || wouldOverlapPiece(nextRotation)) && count < 2) {
            currentPosition--
            count++
          }
        } else if (hasPieceLeft() || hasPieceLeft(currentTetromino.map(position => position - 1))) {
          while (wouldOverlapPiece(nextRotation) && !atLeftEdge(nextRotation) && count < 2) {
            currentPosition++
            count++
          }
        } else if (hasPieceRight() || hasPieceRight(currentTetromino.map(position => position + 1))) {
          while (wouldOverlapPiece(nextRotation) && !atRightEdge(nextRotation) && count < 2) {
            currentPosition--
            count++
          }
        }
      } else {
        while (wouldOverlapPiece(nextRotation) && count < 2) {
          currentPosition -= width
          count++
        }
      }
    }
    if (wouldOverlapPiece(nextRotation)) {
      currentPosition = storedPosition
      return false
    }
    return true
  }

  // * Add ghost to grid i.e. project lowest possible position of tetromino
  function addGhost() {
    const distance = distanceToLowestPosition()
    currentTetromino.forEach(position => {
      if (!cells[currentPosition + position + (width * distance)].classList.contains('tetromino')) {
        cells[currentPosition + position + (width * distance)].classList.add('ghost')
        cells[currentPosition + position + (width * distance)].style.backgroundColor = currentColor
      }
    })
  }

  // * Remove ghost from grid
  function removeGhost() {
    const distance = distanceToLowestPosition()
    currentTetromino.forEach(position => {
      cells[currentPosition + position + (width * distance)].classList.remove('ghost')
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
    resetClock()
    score += distance * 2 * Math.ceil((level + 1) / 2)
    updateScore()
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

  // * Hold tetromino
  function holdTetromino() {
    if (!heldTetromino) {
      removeTetromino()
      const index = currentIndex
      heldTetromino = [index, previewTetrominoes[index], currentColor]
      addHeldTetromino()
      nextTetromino()
      resetClock()
      canHold = false
    } else if (canHold) {
      const storedIndex = heldTetromino[0]
      removeHeldTetromino()
      removeTetromino()
      const index = currentIndex
      heldTetromino = [index, previewTetrominoes[index], currentColor]
      addHeldTetromino()
      newTetromino(storedIndex)
      resetClock()
      canHold = false
    }
  }

  // * Add held tetromino to hold
  function addHeldTetromino() {
    heldTetromino[1].forEach(position => {
      holdCells[holdPosition + position].classList.add('tetromino')
      holdCells[holdPosition + position].style.backgroundColor = heldTetromino[2]
    })
  }

  // * Remove held tetromino from hold
  function removeHeldTetromino() {
    heldTetromino[1].forEach(position => {
      holdCells[holdPosition + position].classList.remove('tetromino')
      holdCells[holdPosition + position].style.backgroundColor = ''
    })
  }

  // * Clear any full lines
  function clearLines() {
    const storedLevel = level
    let linesCleared = 0
    for (let i = 0; i < cellCount; i += width) {
      const rowIndices = []
      for (let j = 0; j < width; j++) {
        rowIndices.push(i + j)
      }
      if (rowIndices.every(index => {
        return cells[index].classList.contains('occupied')
      })) {
        rowIndices.forEach(index => {
          cells[index].classList.remove('occupied', 'tetromino')
          cells[index].style.backgroundColor = ''
        })
        const rowCleared = cells.splice(i, width)
        cells = rowCleared.concat(cells)
        cells.forEach(cell => grid.append(cell))
        linesCleared++
        lines++
        if (lines % 10 === 0) {
          level++
          recalculateTickRate()
          resetClock()
        }
      }
    }
    if (linesCleared > 0) {
      score += linesCleared === 4 ? 800 * storedLevel : (linesCleared * 200 - 100) * storedLevel
      updateScore()
      updateLevel()
      updateLines()
    }
  }

  // * Recalculate tick rate
  function recalculateTickRate() {
    tickRate = Math.floor(1500 * Math.exp(-(level - 1) / 15))
  }

  // * Update score
  function updateScore() {
    if (score > 999999) {
      scoreBox.innerHTML = '999,999'
    } else if (score >= 1000) {
      if (score % 1000 < 10) {
        scoreBox.innerHTML = `${Math.floor(score / 1000)},00${score % 1000}`
      } else if (score % 1000 < 100) {
        scoreBox.innerHTML = `${Math.floor(score / 1000)},0${score % 1000}`
      } else {
        scoreBox.innerHTML = `${Math.floor(score / 1000)},${score % 1000}`
      }
    } else {
      scoreBox.innerHTML = score
    }
  }

  // * Update level
  function updateLevel() {
    levelBox.innerHTML = level
  }

  // * Update number of lines cleared
  function updateLines() {
    linesBox.innerHTML = lines
  }

  // * Game over if new tetromino in buffer
  function gameOver() {
    if (currentTetromino.every(position => {
      return cells[currentPosition + position].classList.contains('buffer')
    })) {
      isGameOver = true
      clearInterval(timerId)
      const cellsArrays = [cells, previewCells, holdCells]
      cellsArrays.forEach(cellsArray => {
        cellsArray.forEach(cell => {
          if (cell.classList.contains('tetromino')) {
            cell.style.backgroundColor = '#777'
          }
        })
      })
      startButton.innerHTML = 'Restart'
    }
  }

  // * Start game
  function startGame() {
    updateScore()
    updateLevel()
    updateLines()
    newTetromino(randomIndex())
    while (upcomingTetrominoes[0] === 0) {
      updateUpcomingTetrominoes()
    }
    addUpcomingTetrominoes()
    recalculateTickRate()
    resetClock()
  }

  // * Pause game
  function pauseGame() {
    isPaused = true
    clearInterval(timerId)
    pauseScreen.style.display = 'block'
  }

  // * Resume game
  function resumeGame() {
    isPaused = false
    resetClock()
    pauseScreen.style.display = 'none'
  }

  // * Restart game after game over
  function restartGame() {
    cells.forEach(cell => {
      cell.classList.remove('occupied', 'tetromino')
      cell.style.backgroundColor = ''
    })
    removeUpcomingTetrominoes()
    if (heldTetromino) {
      removeHeldTetromino()
    }
    resetVariables()
    startGame()
  }

  // * Reset game variables
  function resetVariables() {
    isGameOver = false
    score = 0
    level = 1
    lines = 0
    upcomingTetrominoes = [0,0,0]
    heldTetromino = 0
    canHold = true
  }

  // * Handle keydown events - move / rotate / drop tetromino
  function handleKeyDown(e) {
    if (isPaused || isGameOver) {
      return
    }
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
        softDrop()
        break
      case 38: // up arrow
      case 87: // w key
        if (!hasRotated) {
          rotateTetromino(1)
          hasRotated = true
        }
        break
      case 16: // shift key
        if (!hasRotated) {
          rotateTetromino(3)
          hasRotated = true
        }
        break
      case 32: // space bar
        hardDrop()
        break
      case 72: // h key
        holdTetromino()
        break
    }
  }

  // * Boolean
  let hasRotated = false

  // * Handle keyup event - change boolean back to false
  function handleKeyUp() {
    hasRotated = false
  }

  // * Handle click events - start / pause / resume / restart game
  function handleStartBtnClick(e) {
    switch (e.target.innerHTML) {
      case 'Start':
        startGame()
        e.target.innerHTML = 'Pause'
        break
      case 'Pause':
        pauseGame()
        e.target.innerHTML = 'Resume'
        break
      case 'Resume':
        resumeGame()
        e.target.innerHTML = 'Pause'
        break
      case 'Restart':
        restartGame()
        e.target.innerHTML = 'Pause'
        break
    }
    e.target.blur()
  }

  // * Event listeners
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('keyup', handleKeyUp)
  startButton.addEventListener('click', handleStartBtnClick)
}

window.addEventListener('DOMContentLoaded', init)