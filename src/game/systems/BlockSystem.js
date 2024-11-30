import { System } from '../../core/base/System'

export class BlockSystem extends System {
  constructor(engine) {
    super(engine)
    this.blocks = new Set()
    this.selectedBlocks = new Set()
  }

  addBlock(block) {
    this.blocks.add(block)
  }

  removeBlock(block) {
    this.blocks.delete(block)
    this.selectedBlocks.delete(block)
  }

  selectBlock(block) {
    if (this.selectedBlocks.size >= 2) {
      this.clearSelection()
    }
    block.select()
    this.selectedBlocks.add(block)
  }

  clearSelection() {
    for (const block of this.selectedBlocks) {
      block.deselect()
    }
    this.selectedBlocks.clear()
  }

  getSelectedBlocks() {
    return Array.from(this.selectedBlocks)
  }

  update(deltaTime) {
    for (const block of this.blocks) {
      if (block.isActive) {
        block.update(deltaTime)
      }
    }
  }

  destroy() {
    this.blocks.clear()
    this.selectedBlocks.clear()
  }
} 