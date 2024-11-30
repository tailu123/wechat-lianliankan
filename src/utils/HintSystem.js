export class HintSystem {
  constructor(gameLogic) {
    this.gameLogic = gameLogic
    this.hintTimeout = null
  }

  findHint() {
    const { grid, gridSize } = this.gameLogic
    
    // 遍历所有方块寻找可消除的对子
    for (let row1 = 0; row1 < gridSize; row1++) {
      for (let col1 = 0; col1 < gridSize; col1++) {
        if (!grid[row1][col1]) continue
        
        const color1 = grid[row1][col1].color
        
        // 寻找相同颜色的方块
        for (let row2 = 0; row2 < gridSize; row2++) {
          for (let col2 = 0; col2 < gridSize; col2++) {
            if (!grid[row2][col2] || (row1 === row2 && col1 === col2)) continue
            
            if (grid[row2][col2].color === color1) {
              // 检查是否有有效路径
              const path = this.gameLogic.pathFinder.findPath(row1, col1, row2, col2)
              if (path) {
                return {
                  block1: { row: row1, col: col1 },
                  block2: { row: row2, col: col2 },
                  path
                }
              }
            }
          }
        }
      }
    }
    
    return null
  }

  showHint() {
    const hint = this.findHint()
    if (!hint) return false
    
    // 添加闪烁动画
    const { block1, block2 } = hint
    this.gameLogic.grid[block1.row][block1.col].isHinting = true
    this.gameLogic.grid[block2.row][block2.col].isHinting = true
    
    // 3秒后取消提示
    this.hintTimeout = setTimeout(() => {
      this.clearHint()
    }, 3000)
    
    return true
  }

  clearHint() {
    if (this.hintTimeout) {
      clearTimeout(this.hintTimeout)
      this.hintTimeout = null
    }
    
    const { grid, gridSize } = this.gameLogic
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (grid[row][col]) {
          grid[row][col].isHinting = false
        }
      }
    }
  }
} 