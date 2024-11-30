import { PathFinder } from './PathFinder'
import { GridGenerator } from './GridGenerator'
import { Logger } from './Logger'

export class GameLogic {
  constructor(gridSize, blockTypes, eventManager, gameState) {
    this.logger = new Logger('GameLogic')
    this.logger.debug('Initializing GameLogic')

    this.gridSize = gridSize
    this.blockTypes = blockTypes
    this.eventManager = eventManager
    this.gameState = gameState
    this.gridGenerator = new GridGenerator(gridSize, blockTypes)

    this.reset()
  }

  reset() {
    this.logger.debug('Resetting game')
    do {
      this.grid = this.gridGenerator.createGrid()
    } while (!this.gridGenerator.ensureMatchable(this.grid))
    
    this.pathFinder = new PathFinder(this.grid, this.gridSize)
    this.lastSelectedBlock = null
    this.isProcessing = false
    this.gameState.reset()
    
    // 验证所有方块
    this.validateAllBlocks()
  }

  validateAllBlocks() {
    if (!this.logger) {
      console.error('Logger not initialized')
      return
    }

    this.logger.group('Block Validation')
    try {
      for (let row = 0; row < this.gridSize; row++) {
        for (let col = 0; col < this.gridSize; col++) {
          const block = this.grid[row][col]
          if (block) {
            if (block.color === undefined) {
              this.logger.error(`Block at (${row},${col}) has no color`)
            }
            if (block.color >= this.blockTypes) {
              this.logger.error(`Block at (${row},${col}) has invalid color: ${block.color}`)
            }
          }
        }
      }
    } catch (error) {
      this.logger.error('Error during block validation:', error)
    } finally {
      this.logger.groupEnd()
    }
  }

  handleBlockSelect(row, col) {
    this.logger.group('Block Selection')
    this.logger.debug(`Selected position: (${row}, ${col})`)
    
    if (this.isProcessing || this.gameState.isPaused) {
      this.logger.warn('Game is processing or paused')
      this.logger.groupEnd()
      return { type: 'processing' }
    }

    if (!this.grid[row]?.[col]) {
      this.logger.error('Invalid block selected')
      this.logger.groupEnd()
      return { type: 'invalid' }
    }

    this.logger.info(`Selected block color: ${this.grid[row][col].color}`)

    if (this.lastSelectedBlock && 
        this.lastSelectedBlock.row === row && 
        this.lastSelectedBlock.col === col) {
      this.logger.info('Deselecting block')
      this.clearSelection()
      this.logger.groupEnd()
      return { type: 'deselect' }
    }

    if (this.lastSelectedBlock) {
      this.logger.info('Attempting to match')
      const matchResult = this.tryMatch(row, col)
      this.logger.info('Match result:', matchResult)
      if (matchResult.type === 'match') {
        this.isProcessing = true
        setTimeout(() => {
          this.isProcessing = false
          if (this.checkGameOver()) {
            this.logger.info('Game over')
            this.gameState.setGameOver()
          }
        }, 300)
        this.logger.groupEnd()
        return matchResult
      } else {
        this.clearSelection()
        this.logger.groupEnd()
      }
    }

    this.logger.info('Selecting new block')
    this.lastSelectedBlock = { row, col }
    this.grid[row][col].isSelected = true
    this.logger.groupEnd()
    return { type: 'select' }
  }

  clearSelection() {
    if (this.lastSelectedBlock) {
      const { row, col } = this.lastSelectedBlock
      if (this.grid[row]?.[col]) {
        this.grid[row][col].isSelected = false
      }
      this.lastSelectedBlock = null
    }
  }

  tryMatch(row, col) {
    this.logger.group('Match Attempt')
    this.logger.debug(`tryMatch called with row: ${row}, col: ${col}`)
    const { row: lastRow, col: lastCol } = this.lastSelectedBlock

    if (row === lastRow && col === lastCol) {
      this.logger.info('Same block selected')
      this.logger.groupEnd()
      return { type: 'mismatch' }
    }

    const currentBlock = this.grid[row][col]
    const lastBlock = this.grid[lastRow][lastCol]
    
    this.logger.info(`Current block color: ${currentBlock?.color}, Last block color: ${lastBlock?.color}`)

    if (!currentBlock || !lastBlock || 
        currentBlock.color !== lastBlock.color) {
      this.logger.error('Colors do not match or blocks are invalid')
      this.logger.groupEnd()
      return { type: 'mismatch' }
    }

    const path = this.pathFinder.findPath(lastRow, lastCol, row, col)
    this.logger.info('Path found:', path)

    if (!path) {
      this.logger.error('No valid path found')
      this.logger.groupEnd()
      return { type: 'mismatch' }
    }

    this.logger.info('Match successful, removing blocks')
    this.grid[lastRow][lastCol] = null
    this.grid[row][col] = null
    this.lastSelectedBlock = null

    this.pathFinder.updateGrid(this.grid)

    this.gameState.updateScore(20)

    this.logger.groupEnd()
    return {
      type: 'match',
      blocks: [
        { row: lastRow, col: lastCol },
        { row, col }
      ],
      path
    }
  }

  checkGameOver() {
    // 检查是否还有剩余方块
    let remainingBlocks = 0;
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.grid[row][col]) {
          remainingBlocks++;
        }
      }
    }

    // 如果没有剩余方块，游戏胜利
    if (remainingBlocks === 0) {
      return true;
    }

    // 检查是否还有可以匹配的方块
    for (let row1 = 0; row1 < this.gridSize; row1++) {
      for (let col1 = 0; col1 < this.gridSize; col1++) {
        const block1 = this.grid[row1][col1];
        if (!block1) continue;

        for (let row2 = 0; row2 < this.gridSize; row2++) {
          for (let col2 = 0; col2 < this.gridSize; col2++) {
            const block2 = this.grid[row2][col2];
            if (!block2 || block1 === block2) continue;

            if (block1.color === block2.color) {
              const path = this.pathFinder.findPath(row1, col1, row2, col2);
              if (path) {
                return false; // 还有可以匹配的方块
              }
            }
          }
        }
      }
    }

    return true; // 没有可以匹配的方块了
  }
} 