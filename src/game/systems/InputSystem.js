import { System } from '../../core/base/System'

export class InputSystem extends System {
  constructor(engine) {
    super(engine)
    this.touchStartPos = null
    this.touchEndPos = null
    this.swipeThreshold = 30  // 滑动判定阈值
    this.handlers = new Map()
    this.isEnabled = true
  }

  // 注册输入处理器
  registerHandler(type, handler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set())
    }
    this.handlers.get(type).add(handler)
  }

  // 移除输入处理器
  removeHandler(type, handler) {
    const handlers = this.handlers.get(type)
    if (handlers) {
      handlers.delete(handler)
    }
  }

  // 处理触摸开始
  handleTouchStart(e) {
    if (!this.isEnabled) return
    
    const touch = e.touches[0]
    this.touchStartPos = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    }

    this.notifyHandlers('touchstart', {
      x: touch.clientX,
      y: touch.clientY,
      raw: e
    })
  }

  // 处理触摸移动
  handleTouchMove(e) {
    if (!this.isEnabled || !this.touchStartPos) return
    
    const touch = e.touches[0]
    const currentPos = {
      x: touch.clientX,
      y: touch.clientY
    }

    this.notifyHandlers('touchmove', {
      x: currentPos.x,
      y: currentPos.y,
      deltaX: currentPos.x - this.touchStartPos.x,
      deltaY: currentPos.y - this.touchStartPos.y,
      raw: e
    })
  }

  // 处理触摸结束
  handleTouchEnd(e) {
    if (!this.isEnabled || !this.touchStartPos) return
    
    const touch = e.changedTouches[0]
    this.touchEndPos = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    }

    // 计算滑动
    const deltaX = this.touchEndPos.x - this.touchStartPos.x
    const deltaY = this.touchEndPos.y - this.touchStartPos.y
    const duration = this.touchEndPos.timestamp - this.touchStartPos.timestamp

    // 判断滑动方向
    if (Math.abs(deltaX) > this.swipeThreshold || 
        Math.abs(deltaY) > this.swipeThreshold) {
      const direction = this.getSwipeDirection(deltaX, deltaY)
      this.notifyHandlers('swipe', {
        direction,
        deltaX,
        deltaY,
        duration,
        raw: e
      })
    } else {
      // 点击事件
      this.notifyHandlers('tap', {
        x: touch.clientX,
        y: touch.clientY,
        raw: e
      })
    }

    this.touchStartPos = null
    this.touchEndPos = null
  }

  // 获取滑动方向
  getSwipeDirection(deltaX, deltaY) {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left'
    } else {
      return deltaY > 0 ? 'down' : 'up'
    }
  }

  // 通知处理器
  notifyHandlers(type, data) {
    const handlers = this.handlers.get(type)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error(`Error in input handler (${type}):`, error)
        }
      })
    }
  }

  // 启用/禁用输入
  enable() {
    this.isEnabled = true
  }

  disable() {
    this.isEnabled = false
  }

  // 清理
  destroy() {
    this.handlers.clear()
    this.touchStartPos = null
    this.touchEndPos = null
  }
} 