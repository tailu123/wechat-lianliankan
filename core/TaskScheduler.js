export class TaskScheduler {
  constructor() {
    this.tasks = new Map()
    this.queues = new Map()
    this.isRunning = false
    this.frameId = null
    this.lastFrameTime = 0
    this.frameInterval = 1000 / 60  // 目标60fps
  }

  // 添加任务
  addTask(id, task, priority = 0) {
    this.tasks.set(id, {
      task,
      priority,
      lastRun: 0,
      isRunning: false
    })
  }

  // 添加到队列
  enqueue(queueName, task, options = {}) {
    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, [])
    }
    
    const queue = this.queues.get(queueName)
    queue.push({
      task,
      options,
      timestamp: Date.now()
    })

    if (!this.isRunning) {
      this.start()
    }
  }

  // 开始执行
  start() {
    if (this.isRunning) return
    this.isRunning = true
    this.scheduleFrame()
  }

  // 停止执行
  stop() {
    this.isRunning = false
    if (this.frameId) {
      cancelAnimationFrame(this.frameId)
      this.frameId = null
    }
  }

  // 调度帧
  scheduleFrame() {
    this.frameId = requestAnimationFrame((timestamp) => {
      const deltaTime = timestamp - this.lastFrameTime
      
      if (deltaTime >= this.frameInterval) {
        this.processTasks(deltaTime)
        this.processQueues()
        this.lastFrameTime = timestamp
      }

      if (this.isRunning) {
        this.scheduleFrame()
      }
    })
  }

  // 处理任务
  processTasks(deltaTime) {
    const sortedTasks = Array.from(this.tasks.entries())
      .sort(([, a], [, b]) => b.priority - a.priority)

    for (const [id, task] of sortedTasks) {
      if (!task.isRunning && 
          Date.now() - task.lastRun >= (task.options?.interval || 0)) {
        task.isRunning = true
        
        Promise.resolve(task.task(deltaTime))
          .catch(error => console.error(`Task ${id} error:`, error))
          .finally(() => {
            task.isRunning = false
            task.lastRun = Date.now()
          })
      }
    }
  }

  // 处理队列
  processQueues() {
    for (const [name, queue] of this.queues) {
      if (queue.length === 0) continue

      const { task, options, timestamp } = queue[0]
      const delay = options.delay || 0
      
      if (Date.now() - timestamp >= delay) {
        queue.shift()
        
        Promise.resolve(task())
          .catch(error => console.error(`Queue ${name} task error:`, error))
          .finally(() => {
            if (queue.length === 0) {
              this.queues.delete(name)
            }
          })
      }
    }

    if (this.queues.size === 0 && this.tasks.size === 0) {
      this.stop()
    }
  }

  // 清理任务
  removeTask(id) {
    this.tasks.delete(id)
  }

  // 清理队列
  clearQueue(queueName) {
    this.queues.delete(queueName)
  }

  // 清理所有
  clear() {
    this.tasks.clear()
    this.queues.clear()
    this.stop()
  }

  // 获取状态
  getStatus() {
    return {
      isRunning: this.isRunning,
      taskCount: this.tasks.size,
      queueCount: this.queues.size,
      queueSizes: Array.from(this.queues.entries())
        .reduce((acc, [name, queue]) => {
          acc[name] = queue.length
          return acc
        }, {})
    }
  }
} 