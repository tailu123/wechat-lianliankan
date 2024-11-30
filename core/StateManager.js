export class StateManager {
  constructor() {
    this.state = {}
    this.reducers = new Map()
    this.subscribers = new Set()
    this.middlewares = []
    this.history = []  // 用于状态回溯
    this.maxHistoryLength = 50
  }

  // 注册状态处理器
  registerReducer(namespace, reducer) {
    this.reducers.set(namespace, reducer)
    this.state[namespace] = reducer(undefined, { type: '@@INIT' })
  }

  // 添加中间件
  use(middleware) {
    this.middlewares.push(middleware)
  }

  // 订阅状态变化
  subscribe(callback) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  // 派发动作
  async dispatch(action) {
    // 保存当前状态
    this.saveState()

    // 应用中间件
    let result = action
    for (const middleware of this.middlewares) {
      result = await middleware(this.state, result)
      if (!result) return
    }

    // 更新状态
    const nextState = {}
    let hasChanged = false

    for (const [namespace, reducer] of this.reducers) {
      const currentState = this.state[namespace]
      const nextNamespaceState = reducer(currentState, result)
      
      if (currentState !== nextNamespaceState) {
        hasChanged = true
        nextState[namespace] = nextNamespaceState
      } else {
        nextState[namespace] = currentState
      }
    }

    if (hasChanged) {
      this.state = nextState
      this.notifySubscribers()
    }
  }

  // 保存状态快照
  saveState() {
    this.history.push(JSON.stringify(this.state))
    if (this.history.length > this.maxHistoryLength) {
      this.history.shift()
    }
  }

  // 状态回溯
  undo() {
    if (this.history.length === 0) return false
    
    const previousState = JSON.parse(this.history.pop())
    this.state = previousState
    this.notifySubscribers()
    return true
  }

  // 获取状态快照
  getSnapshot() {
    return JSON.parse(JSON.stringify(this.state))
  }

  // 恢复状态
  restore(snapshot) {
    if (!snapshot) return false
    
    this.state = JSON.parse(JSON.stringify(snapshot))
    this.notifySubscribers()
    return true
  }

  // 通知订阅者
  notifySubscribers() {
    for (const subscriber of this.subscribers) {
      try {
        subscriber(this.state)
      } catch (error) {
        console.error('Subscriber error:', error)
      }
    }
  }

  // 获取状态
  getState() {
    return this.state
  }

  // 重置状态
  reset() {
    for (const [namespace, reducer] of this.reducers) {
      this.state[namespace] = reducer(undefined, { type: '@@RESET' })
    }
    this.history = []
    this.notifySubscribers()
  }

  // 清理资源
  destroy() {
    this.subscribers.clear()
    this.reducers.clear()
    this.middlewares = []
    this.history = []
    this.state = {}
  }
} 