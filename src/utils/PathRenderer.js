export class PathRenderer {
  constructor(blockSize = 80) {
    this.blockSize = blockSize
  }

  calculatePathPoints(path) {
    if (!path?.length) return []
    
    // 添加中间控制点，使路径更平滑
    const controlPoints = this.generateControlPoints(path)
    // 生成更多的插值点，使路径更平滑
    const smoothPoints = this.interpolatePoints(controlPoints)
    
    return smoothPoints.map(point => ({
      x: point.col * this.blockSize + this.blockSize / 2,
      y: point.row * this.blockSize + this.blockSize / 2
    }))
  }

  generateControlPoints(path) {
    const controlPoints = []
    for (let i = 0; i < path.length - 1; i++) {
      const current = path[i]
      const next = path[i + 1]
      
      controlPoints.push(current)
      
      // 在拐角处添加更多控制点
      if (current.row !== next.row && current.col !== next.col) {
        // 添加两个控制点使转弯更圆滑
        controlPoints.push({
          row: current.row,
          col: next.col,
          isControl: true
        })
        controlPoints.push({
          row: next.row,
          col: current.col,
          isControl: true
        })
      }
    }
    controlPoints.push(path[path.length - 1])
    
    return controlPoints
  }

  interpolatePoints(points) {
    const smoothPoints = []
    const STEPS = 5  // 每段路径的插值点数量
    
    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i]
      const end = points[i + 1]
      
      // 为每段路径生成插值点
      for (let step = 0; step < STEPS; step++) {
        const t = step / STEPS
        smoothPoints.push({
          row: start.row + (end.row - start.row) * t,
          col: start.col + (end.col - start.col) * t
        })
      }
    }
    
    // 添加终点
    smoothPoints.push(points[points.length - 1])
    
    return smoothPoints
  }

  calculateLines(points) {
    // 使用 requestAnimationFrame 优化动画性能
    return points.reduce((lines, point, index, array) => {
      if (index === array.length - 1) return lines
      
      const start = point
      const end = array[index + 1]
      
      const length = Math.hypot(end.x - start.x, end.y - start.y)  // 使用 hypot 计算距离
      const angle = Math.atan2(end.y - start.y, end.x - start.x)
      
      lines.push({
        left: start.x,
        top: start.y,
        width: length,
        transform: `rotate(${angle}rad)`,
        delay: index * 2  // 进一步减少延迟
      })
      
      return lines
    }, [])
  }

  // 添加性能优化方法
  optimizeAnimation(lines) {
    return lines.map((line, index) => ({
      ...line,
      style: `left:${line.left}rpx;` +
             `top:${line.top}rpx;` +
             `width:${line.width}rpx;` +
             `transform:${line.transform};` +
             `animation-delay:${line.delay}ms;` +
             'will-change:transform,opacity;'
    }))
  }
} 