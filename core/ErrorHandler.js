export class ErrorHandler {
  constructor() {
    this.errorStack = []
    this.maxStackSize = 50
    this.errorListeners = new Set()
    this.setupGlobalErrorHandler()
  }

  setupGlobalErrorHandler() {
    wx.onError((error) => {
      this.handleError(error, 'global')
    })

    // 捕获未处理的Promise错误
    wx.onUnhandledRejection(({ reason, promise }) => {
      this.handleError(reason, 'promise', { promise })
    })
  }

  handleError(error, type = 'unknown', context = {}) {
    const errorInfo = {
      type,
      timestamp: Date.now(),
      message: error.message || String(error),
      stack: error.stack,
      context: {
        ...context,
        page: getCurrentPages().pop()?.route
      }
    }

    this.errorStack.push(errorInfo)
    if (this.errorStack.length > this.maxStackSize) {
      this.errorStack.shift()
    }

    this.notifyListeners(errorInfo)
    this.logError(errorInfo)
  }

  addListener(callback) {
    this.errorListeners.add(callback)
    return () => this.errorListeners.delete(callback)
  }

  notifyListeners(error) {
    this.errorListeners.forEach(listener => {
      try {
        listener(error)
      } catch (err) {
        console.error('Error in error listener:', err)
      }
    })
  }

  logError(error) {
    console.error(
      `[${new Date(error.timestamp).toISOString()}] ${error.type} Error:`,
      error.message,
      '\nContext:', error.context,
      '\nStack:', error.stack
    )
  }

  getErrorStack() {
    return [...this.errorStack]
  }

  clearErrorStack() {
    this.errorStack = []
  }
} 