export class MemoryManager {
  constructor() {
    this.memoryUsage = new Map()
    this.gcThreshold = 1024 * 1024 * 50  // 50MB
    this.lastGC = Date.now()
    this.gcInterval = 30000  // 30秒
    this.startMonitoring()
  }

  startMonitoring() {
    if (wx.getPerformance) {
      setInterval(() => {
        const performance = wx.getPerformance()
        const memory = performance.memory
        
        if (memory && memory.jsHeapSizeLimit) {
          const usage = memory.usedJSHeapSize
          this.memoryUsage.set(Date.now(), usage)
          
          if (usage > this.gcThreshold && 
              Date.now() - this.lastGC > this.gcInterval) {
            this.forceGC()
          }
        }
      }, 1000)
    }
  }

  forceGC() {
    // 清理旧的内存使用记录
    const now = Date.now()
    for (const [time] of this.memoryUsage) {
      if (now - time > 60000) {  // 保留1分钟的数据
        this.memoryUsage.delete(time)
      }
    }

    // 清理图片缓存
    wx.clearStorage({
      success: () => {
        console.log('Cleared storage cache')
      }
    })

    this.lastGC = now
  }

  getMemoryUsage() {
    const latest = Array.from(this.memoryUsage.entries())
      .sort((a, b) => b[0] - a[0])[0]
    
    return latest ? latest[1] : 0
  }

  getMemoryTrend() {
    const entries = Array.from(this.memoryUsage.entries())
      .sort((a, b) => a[0] - b[0])
    
    if (entries.length < 2) return 0
    
    const first = entries[0][1]
    const last = entries[entries.length - 1][1]
    return (last - first) / entries.length
  }
} 