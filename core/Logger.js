export class Logger {
  constructor(options = {}) {
    this.levels = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3
    }
    
    this.currentLevel = options.level || this.levels.INFO
    this.maxLogSize = options.maxLogSize || 1000
    this.logs = []
    this.listeners = new Set()
  }

  log(level, message, data = {}) {
    if (level < this.currentLevel) return

    const logEntry = {
      level,
      timestamp: Date.now(),
      message,
      data,
      page: getCurrentPages().pop()?.route
    }

    this.logs.push(logEntry)
    if (this.logs.length > this.maxLogSize) {
      this.logs.shift()
    }

    this.notifyListeners(logEntry)
    this.writeToConsole(logEntry)
  }

  debug(message, data) {
    this.log(this.levels.DEBUG, message, data)
  }

  info(message, data) {
    this.log(this.levels.INFO, message, data)
  }

  warn(message, data) {
    this.log(this.levels.WARN, message, data)
  }

  error(message, data) {
    this.log(this.levels.ERROR, message, data)
  }

  addListener(callback) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  notifyListeners(log) {
    this.listeners.forEach(listener => {
      try {
        listener(log)
      } catch (error) {
        console.error('Error in log listener:', error)
      }
    })
  }

  writeToConsole(log) {
    const timestamp = new Date(log.timestamp).toISOString()
    const level = Object.keys(this.levels).find(
      key => this.levels[key] === log.level
    )
    
    switch (log.level) {
      case this.levels.DEBUG:
        console.debug(`[${timestamp}] ${level}:`, log.message, log.data)
        break
      case this.levels.INFO:
        console.info(`[${timestamp}] ${level}:`, log.message, log.data)
        break
      case this.levels.WARN:
        console.warn(`[${timestamp}] ${level}:`, log.message, log.data)
        break
      case this.levels.ERROR:
        console.error(`[${timestamp}] ${level}:`, log.message, log.data)
        break
    }
  }

  getLogs(level) {
    if (level === undefined) {
      return [...this.logs]
    }
    return this.logs.filter(log => log.level === level)
  }

  clearLogs() {
    this.logs = []
  }

  setLevel(level) {
    this.currentLevel = level
  }
} 