Component({
  properties: {
    path: {
      type: Array,
      value: []
    },
    blockSize: {
      type: Number,
      value: 80
    }
  },

  data: {
    lines: []
  },

  lifetimes: {
    attached() {
      this.lineQueue = []
      this.isAnimating = false
      this.frameId = null
    },

    detached() {
      if (this.frameId) {
        cancelAnimationFrame(this.frameId)
      }
      this.lineQueue = []
      this.isAnimating = false
    }
  },

  observers: {
    'path': function(path) {
      if (!path.length) {
        this.clearLines()
        return
      }
      this.queueLines(path)
    }
  },

  methods: {
    queueLines(path) {
      // 将新的路径添加到队列
      this.lineQueue.push(path)
      if (!this.isAnimating) {
        this.processNextLines()
      }
    },

    async processNextLines() {
      if (this.lineQueue.length === 0) {
        this.isAnimating = false
        return
      }

      this.isAnimating = true
      const path = this.lineQueue.shift()
      
      // 使用 requestAnimationFrame 优化动画
      this.frameId = requestAnimationFrame(() => {
        const lines = this.calculateLines(path)
        this.setData({ lines }, () => {
          setTimeout(() => {
            this.clearLines()
            this.processNextLines()
          }, 250)
        })
      })
    },

    calculateLines(path) {
      const lines = []
      for (let i = 0; i < path.length - 1; i++) {
        const start = path[i]
        const end = path[i + 1]
        
        const x1 = start.x
        const y1 = start.y
        const x2 = end.x
        const y2 = end.y
        
        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
        const angle = Math.atan2(y2 - y1, x2 - x1)
        
        lines.push({
          left: x1,
          top: y1,
          width: length,
          transform: `rotate(${angle}rad)`,
          delay: i * 5  // 减少延迟
        })
      }
      return lines
    },

    setLines(lines) {
      return new Promise(resolve => {
        this.setData({ lines }, resolve)
      })
    },

    clearLines() {
      this.setData({ lines: [] })
    }
  }
}) 