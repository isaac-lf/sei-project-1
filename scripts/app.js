function init() {

  // * DOM elements
  const grid = document.querySelector('.grid')
  let cells = []

  const startBtn = document.querySelector('.start-button')

  const scoreBox = document.querySelector('.score')
  const levelBox = document.querySelector('.level')
  const linesBox = document.querySelector('.lines')

  const preview = document.querySelector('.preview')
  const previewCells = []

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

  // * Preview variables
  const previewWidth = 4
  const previewHeight = 10
  const previewCellCount = previewWidth * previewHeight

  // * Make a preview
  for (let i = 0; i < previewCellCount; i++) {
    const previewCell = document.createElement('div')
    preview.append(previewCell)
    previewCells.push(previewCell)
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

  const startingPosition = 14
  let currentPosition = startingPosition

  let timerId
  let tickRate

  let hasGameOver = false
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

  const upcomingTetrominoes = [0,0,0]
  const previewPositions = [9, 21, 33]

  // * Create new tetromino
  function newTetromino(index) {
    currentIndex = index
    currentRotations = [...tetrominoes[index]]
    currentTetromino = currentRotations[0]
    currentOrientations = [...tetrominoOrientations]
    currentOrientation = currentOrientations[0]
    currentColor = tetrominoColors[index]
    currentPosition = startingPosition
    addTetromino()
  }

  // * Introduce next upcoming tetromino
  function nextTetromino() {
    newTetromino(upcomingTetrominoes[0][0])
    removeUpcomingTetrominoes()
    updateUpcomingTetrominoes()
    addUpcomingTetrominoes()
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

  // * Remove upcoming tetromino from preview
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
  function startClock() {
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

  // * Attempt to tetromino
  function rotateTetromino() {
    removeTetromino()
    if (canRotate(currentTetromino)) {
      currentRotations.push(currentRotations.shift())
      currentTetromino = currentRotations[0]
      currentOrientations.push(currentOrientations.shift())
      currentOrientation = currentOrientations[0]
    }
    addTetromino()
  }

  // * Check if tetromino can be rotated
  // * Push rotated tetromino if it needs to be pushed
  function canRotate(currentTetromino) {
    if (currentIndex === 0) return true
    const nextRotation = currentRotations[1]
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
          calculateTickRate()
          clearInterval(timerId)
          startClock()
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
  function calculateTickRate() {
    tickRate = Math.floor(1000 * Math.exp(-(level - 1) / 20))
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

  // * Game over if starting position is occupied
  function gameOver() {
    if (wouldOverlapPiece(currentTetromino)) {
      hasGameOver = true
      clearInterval(timerId)
      cells.forEach(cell => {
        if (cell.classList.contains('occupied') && !cell.classList.contains('active')) {
          cell.style.backgroundColor = '#777'
        }
      })
      startBtn.innerHTML = 'Restart'
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
    calculateTickRate()
    startClock()
  }

  // * Pause game
  function pauseGame() {
    isPaused = true
    clearInterval(timerId)
  }

  // * Resume game
  function resumeGame() {
    isPaused = false
    startClock()
  }

  // * Restart game after game over
  function restartGame() {
    hasGameOver = false
    resetVariables()
    cells.forEach(cell => {
      cell.classList.remove('occupied', 'tetromino')
      cell.style.backgroundColor = ''
    })
    startGame()
  }

  // * Reset game variables
  function resetVariables() {
    score = 0
    level = 1
    lines = 0
  }

  // * Handle keydown events - move / rotate / drop tetromino
  function handleKeyDown(e) {
    if (isPaused || hasGameOver) {
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
  startBtn.addEventListener('click', handleStartBtnClick)
}

window.addEventListener('DOMContentLoaded', init)