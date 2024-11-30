export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.thresholds = new Map()
    this.listeners = new Set()
  }

  startMeasure(name) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, {
        startTime: performance.now(),
        count: 0,
        totalTime: 0,
        maxTime: 0,
        minTime: Infinity
      })
    } else {
      this.metrics.get(name).startTime = performance.now()
    }
  }

  endMeasure(name) {
    const metric = this.metrics.get(name)
    if (!metric) return

    const duration = performance.now() - metric.startTime
    metric.count++
    metric.totalTime += duration
    metric.maxTime = Math.max(metric.maxTime, duration)
    metric.minTime = Math.min(metric.minTime, duration)

    // 检查是否超过阈值
    const threshold = this.thresholds.get(name)
    if (threshold && duration > threshold) {
      this.notifyListeners({
        type: 'threshold_exceeded',
        name,
        duration,
        threshold
      })
    }
  }

  setThreshold(name, value) {
    this.thresholds.set(name, value)
  }

  addListener(callback) {
    this.listeners.add(callback)
  }

  removeListener(callback) {
    this.listeners.delete(callback)
  }

  notifyListeners(event) {
    this.listeners.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        console.error('Performance monitor listener error:', error)
      }
    })
  }

  getMetrics() {
    const result = {}
    this.metrics.forEach((metric, name) => {
      result[name] = {
        avgTime: metric.totalTime / metric.count,
        maxTime: metric.maxTime,
        minTime: metric.minTime,
        count: metric.count
      }
    })
    return result
  }

  reset() {
    this.metrics.clear()
  }
} 