export class AnimationManager {
  constructor() {
    this.animations = new Map()
    this.frameId = null
    this.lastTime = 0
    this.isRunning = false
    this.easingFunctions = this.initEasingFunctions()
  }

  initEasingFunctions() {
    return {
      linear: t => t,
      easeInQuad: t => t * t,
      easeOutQuad: t => t * (2 - t),
      easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
      easeInCubic: t => t * t * t,
      easeOutCubic: t => (--t) * t * t + 1,
      easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
      easeOutElastic: t => {
        const p = 0.3
        return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1
      },
      easeOutBounce: t => {
        if (t < (1 / 2.75)) {
          return 7.5625 * t * t
        } else if (t < (2 / 2.75)) {
          return 7.5625 * (t -= (1.5 / 2.75)) * t + 0.75
        } else if (t < (2.5 / 2.75)) {
          return 7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375
        } else {
          return 7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375
        }
      }
    }
  }

  createAnimation(config) {
    const id = Symbol('animation')
    const animation = {
      ...config,
      id,
      startTime: performance.now(),
      isComplete: false,
      easing: this.easingFunctions[config.easing || 'linear']
    }

    this.animations.set(id, animation)
    
    if (!this.isRunning) {
      this.start()
    }

    return id
  }

  start() {
    if (this.isRunning) return
    
    this.isRunning = true
    this.lastTime = performance.now()
    this.update()
  }

  stop() {
    this.isRunning = false
    if (this.frameId) {
      cancelAnimationFrame(this.frameId)
      this.frameId = null
    }
  }

  update() {
    if (!this.isRunning) return

    const currentTime = performance.now()
    const deltaTime = currentTime - this.lastTime
    this.lastTime = currentTime

    let hasActiveAnimations = false

    for (const [id, animation] of this.animations) {
      if (animation.isComplete) continue

      const elapsed = currentTime - animation.startTime
      const progress = Math.min(elapsed / animation.duration, 1)
      const easedProgress = animation.easing(progress)

      if (progress >= 1) {
        animation.isComplete = true
        animation.onComplete?.()
        this.animations.delete(id)
      } else {
        animation.onUpdate?.(easedProgress, deltaTime)
        hasActiveAnimations = true
      }
    }

    if (hasActiveAnimations) {
      this.frameId = requestAnimationFrame(() => this.update())
    } else {
      this.stop()
    }
  }

  // 预定义动画
  fadeIn(target, duration = 300, easing = 'easeOutQuad') {
    return this.createAnimation({
      duration,
      easing,
      onUpdate: (progress) => {
        target.opacity = progress
      }
    })
  }

  fadeOut(target, duration = 300, easing = 'easeInQuad') {
    return this.createAnimation({
      duration,
      easing,
      onUpdate: (progress) => {
        target.opacity = 1 - progress
      }
    })
  }

  scale(target, from, to, duration = 300, easing = 'easeOutElastic') {
    return this.createAnimation({
      duration,
      easing,
      onUpdate: (progress) => {
        target.scale = from + (to - from) * progress
      }
    })
  }

  move(target, fromX, fromY, toX, toY, duration = 300, easing = 'easeOutQuad') {
    return this.createAnimation({
      duration,
      easing,
      onUpdate: (progress) => {
        target.x = fromX + (toX - fromX) * progress
        target.y = fromY + (toY - fromY) * progress
      }
    })
  }

  shake(target, intensity = 5, duration = 500) {
    const originalX = target.x
    const originalY = target.y

    return this.createAnimation({
      duration,
      easing: 'linear',
      onUpdate: (progress) => {
        const decay = 1 - progress
        const offsetX = (Math.random() * 2 - 1) * intensity * decay
        const offsetY = (Math.random() * 2 - 1) * intensity * decay
        target.x = originalX + offsetX
        target.y = originalY + offsetY
      },
      onComplete: () => {
        target.x = originalX
        target.y = originalY
      }
    })
  }

  clear() {
    this.animations.clear()
    this.stop()
  }
} 