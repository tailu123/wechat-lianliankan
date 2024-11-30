import { Logger } from './Logger'

export class PathFinder {
  constructor(grid, gridSize) {
    this.grid = grid
    this.gridSize = gridSize
    this.directions = [[-1, 0], [0, 1], [1, 0], [0, -1]]  // 上右下左
    this.cache = new Map()
    this.logger = new Logger('PathFinder')
  }

  findPath(startRow, startCol, endRow, endCol) {
    this.logger.group('Finding Path')
    this.logger.debug(`Start: (${startRow}, ${startCol}), End: (${endRow}, ${endCol})`)
    
    // 检查起点和终点是否有效
    if (!this.isValidPosition(startRow, startCol) || !this.isValidPosition(endRow, endCol)) {
      this.logger.error('Invalid start or end position')
      this.logger.groupEnd()
      return null
    }

    // 如果起点和终点相邻，直接返回路径
    if (Math.abs(startRow - endRow) + Math.abs(startCol - endCol) === 1) {
      return [[startRow, startCol], [endRow, endCol]]
    }

    const queue = [[startRow, startCol]]
    const visited = new Set()
    const parent = new Map()
    
    visited.add(`${startRow},${startCol}`)

    while (queue.length > 0) {
      const [row, col] = queue.shift()
      
      // 检查四个方向
      for (const [dx, dy] of this.directions) {
        const newRow = row + dx
        const newCol = col + dy
        const key = `${newRow},${newCol}`

        if (!this.isValidPosition(newRow, newCol)) {
          this.logger.debug(`Invalid position: (${newRow}, ${newCol})`)
          continue
        }

        if (visited.has(key)) {
          this.logger.debug(`Already visited: (${newRow}, ${newCol})`)
          continue
        }

        if (!this.isValidMove(row, col, newRow, newCol, endRow, endCol)) {
          this.logger.debug(`Cannot move to: (${newRow}, ${newCol})`)
          continue
        }

        visited.add(key)
        parent.set(key, [row, col])
        queue.push([newRow, newCol])
        this.logger.debug(`Added to queue: (${newRow}, ${newCol})`)

        // 如果找到终点
        if (newRow === endRow && newCol === endCol) {
          const path = this.reconstructPath(parent, startRow, startCol, endRow, endCol)
          this.logger.debug('Path found:', path)
          this.logger.groupEnd()
          return path
        }
      }
    }

    this.logger.debug('No path found')
    this.logger.groupEnd()
    return null
  }

  isValidMove(currentRow, currentCol, newRow, newCol, endRow, endCol) {
    // 首先检查新位置是否在网格范围内
    if (!this.isValidPosition(newRow, newCol)) {
      return false
    }

    // 如果是终点，直接允许
    if (newRow === endRow && newCol === endCol) {
      return true
    }

    // 检查新位置是否为空（没有方块）
    // 确保在访问 grid 之前进行边界检查
    if (!this.grid[newRow] || !this.grid[newRow][newCol]) {
      return true
    }

    return false
  }

  isValidPosition(row, col) {
    return row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize
  }

  reconstructPath(parent, startRow, startCol, endRow, endCol) {
    const path = [[endRow, endCol]]
    let current = `${endRow},${endCol}`
    
    while (current && current !== `${startRow},${startCol}`) {
      const [row, col] = parent.get(current)
      path.unshift([row, col])
      current = `${row},${col}`
    }
    
    path.unshift([startRow, startCol])
    return path
  }

  updateGrid(grid) {
    this.logger.debug('Updating grid')
    this.grid = grid
    this.cache.clear()
  }
} 