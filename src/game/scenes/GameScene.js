import { Scene } from '../../core/base/Scene'
import { BlockEntity } from '../entities/BlockEntity'

export class GameScene extends Scene {
  constructor(engine, config) {
    super(engine)
    this.config = config
    this.grid = []
    this.selectedBlock = null
  }

  async onLoad() {
    this.initGrid()
  }

  initGrid() {
    const { gridSize, blockTypes } = this.config
    
    for (let row = 0; row < gridSize; row++) {
      this.grid[row] = []
      for (let col = 0; col < gridSize; col++) {
        const block = new BlockEntity(
          Math.floor(Math.random() * blockTypes),
          row,
          col
        )
        this.grid[row][col] = block
        this.addEntity(block)
      }
    }
  }

  handleBlockSelect(row, col) {
    const block = this.grid[row][col]
    if (!block) return { type: 'invalid' }

    if (block.getState().isSelected) {
      this.clearSelection()
      return { type: 'deselect' }
    }

    if (!this.selectedBlock) {
      this.selectBlock(block)
      return { type: 'select' }
    }

    const matchResult = this.tryMatch(block)
    this.clearSelection()
    return matchResult
  }

  selectBlock(block) {
    block.select()
    this.selectedBlock = block
  }

  clearSelection() {
    if (this.selectedBlock) {
      this.selectedBlock.deselect()
      this.selectedBlock = null
    }
  }

  tryMatch(block) {
    const firstBlock = this.selectedBlock
    const firstPos = firstBlock.getPosition()
    const secondPos = block.getPosition()

    if (firstBlock.getColor() === block.getColor()) {
      const path = this.engine.getSystem('pathfinder')
        .findPath(firstPos.row, firstPos.col, secondPos.row, secondPos.col)

      if (path) {
        this.eliminateBlocks(firstBlock, block)
        return {
          type: 'match',
          blocks: [firstPos, secondPos],
          path
        }
      }
    }

    return { type: 'mismatch' }
  }

  eliminateBlocks(block1, block2) {
    block1.match()
    block2.match()

    const pos1 = block1.getPosition()
    const pos2 = block2.getPosition()

    setTimeout(() => {
      this.grid[pos1.row][pos1.col] = null
      this.grid[pos2.row][pos2.col] = null
      this.removeEntity(block1)
      this.removeEntity(block2)
    }, 300)
  }

  isGameOver() {
    for (let row = 0; row < this.config.gridSize; row++) {
      for (let col = 0; col < this.config.gridSize; col++) {
        if (this.grid[row][col]) return false
      }
    }
    return true
  }
} 