import { System } from '../../core/base/System'

export class MatchSystem extends System {
  constructor(engine) {
    super(engine)
    this.pathFinder = engine.getSystem('pathfinder')
    this.blockSystem = engine.getSystem('block')
    this.eventManager = engine.getManager('event')
  }

  checkMatch(block1, block2) {
    if (!block1 || !block2 || block1 === block2) {
      return null
    }

    const pos1 = block1.getPosition()
    const pos2 = block2.getPosition()

    if (block1.getColor() === block2.getColor()) {
      const path = this.pathFinder.findPath(
        pos1.row, pos1.col,
        pos2.row, pos2.col
      )

      if (path) {
        return {
          blocks: [block1, block2],
          path
        }
      }
    }

    return null
  }

  handleMatch(match) {
    const [block1, block2] = match.blocks
    
    // 发送匹配事件
    this.eventManager.emit('match', {
      blocks: [
        block1.getPosition(),
        block2.getPosition()
      ],
      path: match.path
    })

    // 标记方块为匹配状态
    block1.match()
    block2.match()

    // 延迟移除方块
    setTimeout(() => {
      this.blockSystem.removeBlock(block1)
      this.blockSystem.removeBlock(block2)
    }, 300)

    return true
  }

  checkGameOver() {
    const blocks = Array.from(this.blockSystem.blocks)
    
    // 检查是否还有可能的匹配
    for (let i = 0; i < blocks.length; i++) {
      for (let j = i + 1; j < blocks.length; j++) {
        if (this.checkMatch(blocks[i], blocks[j])) {
          return false
        }
      }
    }

    return blocks.length === 0 || true
  }
} 