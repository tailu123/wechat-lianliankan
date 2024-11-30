import { Logger } from './Logger'

export class GridGenerator {
  constructor(gridSize, blockTypes) {
    this.gridSize = gridSize
    this.blockTypes = Math.min(blockTypes, 5)
    this.logger = new Logger('GridGenerator')
  }

  createGrid() {
    this.logger.debug(`Creating grid: ${this.gridSize}x${this.gridSize}, blockTypes: ${this.blockTypes}`)
    const grid = []
    const colorCounts = new Array(this.blockTypes).fill(0)
    
    // 计算总格子数
    const totalCells = this.gridSize * this.gridSize
    
    // 如果总格子数是奇数，减少一行以确保总数为偶数
    if (totalCells % 2 !== 0) {
      this.gridSize--
      this.logger.warn(`Adjusted gridSize to ${this.gridSize} to ensure even number of cells`)
    }
    
    // 第一遍：生成一半的格子
    const halfCells = (this.gridSize * this.gridSize) / 2
    const colors = []
    
    for (let i = 0; i < halfCells; i++) {
      const color = Math.floor(Math.random() * this.blockTypes)
      colors.push(color)
      colorCounts[color]++
    }
    
    // 复制一份相同的颜色，确保每种颜色都是成对的
    colors.push(...colors)
    
    // 打乱颜色数组
    for (let i = colors.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[colors[i], colors[j]] = [colors[j], colors[i]]
    }
    
    // 填充网格
    let colorIndex = 0
    for (let row = 0; row < this.gridSize; row++) {
      grid[row] = []
      for (let col = 0; col < this.gridSize; col++) {
        grid[row][col] = {
          color: colors[colorIndex++],
          isSelected: false,
          isMatched: false
        }
      }
    }

    // 验证生成的网格
    this.validateGrid(grid)
    
    return grid
  }

  validateGrid(grid) {
    this.logger.group('Grid Validation')
    let hasInvalidBlocks = false
    const colorCounts = new Array(this.blockTypes).fill(0)
    
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const block = grid[row][col]
        if (!block || block.color === undefined || block.color >= this.blockTypes) {
          this.logger.error(`Invalid block at (${row}, ${col}):`, block)
          hasInvalidBlocks = true
        } else {
          colorCounts[block.color]++
        }
      }
    }
    
    // 验证每种颜色的数量是否为偶数
    colorCounts.forEach((count, color) => {
      if (count % 2 !== 0) {
        this.logger.error(`Color ${color} has odd count: ${count}`)
        hasInvalidBlocks = true
      }
    })
    
    if (hasInvalidBlocks) {
      this.logger.error('Grid validation failed')
    } else {
      this.logger.info('Grid validation passed')
      this.logger.debug('Color counts:', colorCounts)
    }
    
    this.logger.groupEnd()
  }

  // 确保至少有一对可以匹配的方块
  ensureMatchable(grid) {
    this.logger.debug('Ensuring grid is matchable')
    // 检查是否有可匹配的方块
    for (let row1 = 0; row1 < this.gridSize; row1++) {
      for (let col1 = 0; col1 < this.gridSize; col1++) {
        for (let row2 = 0; row2 < this.gridSize; row2++) {
          for (let col2 = 0; col2 < this.gridSize; col2++) {
            if (row1 === row2 && col1 === col2) continue
            
            const block1 = grid[row1][col1]
            const block2 = grid[row2][col2]
            
            if (block1.color === block2.color) {
              this.logger.debug(`Found matchable pair: (${row1},${col1}) and (${row2},${col2})`)
              return true
            }
          }
        }
      }
    }
    
    // 如果没有可匹配的方块，重新生成网格
    this.logger.warn('No matchable blocks found, regenerating grid')
    return false
  }
} 