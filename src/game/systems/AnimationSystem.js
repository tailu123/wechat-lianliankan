import { System } from '../../core/base/System'

export class AnimationSystem extends System {
  constructor(engine) {
    super(engine)
    this.animations = new Map()
    this.completedAnimations = new Set()
  }

  addAnimation(id, animation) {
    this.animations.set(id, {
      ...animation,
      startTime: performance.now(),
      isComplete: false
    })
  }

  removeAnimation(id) {
    this.animations.delete(id)
    this.completedAnimations.delete(id)
  }

  update(deltaTime) {
    const currentTime = performance.now()
    
    for (const [id, animation] of this.animations) {
      if (animation.isComplete) continue

      const elapsed = currentTime - animation.startTime
      const progress = Math.min(elapsed / animation.duration, 1)

      if (progress >= 1) {
        animation.isComplete = true
        this.completedAnimations.add(id)
        animation.onComplete?.()
      } else {
        animation.onUpdate?.(progress)
      }
    }

    // 清理完成的动画
    for (const id of this.completedAnimations) {
      this.removeAnimation(id)
    }
    this.completedAnimations.clear()
  }

  // 创建淡入动画
  fadeIn(target, duration = 300) {
    return {
      duration,
      onUpdate: (progress) => {
        target.opacity = progress
      }
    }
  }

  // 创建淡出动画
  fadeOut(target, duration = 300) {
    return {
      duration,
      onUpdate: (progress) => {
        target.opacity = 1 - progress
      }
    }
  }

  // 创建缩放动画
  scale(target, from, to, duration = 300) {
    return {
      duration,
      onUpdate: (progress) => {
        target.scale = from + (to - from) * progress
      }
    }
  }

  // 创建移动动画
  move(target, fromX, fromY, toX, toY, duration = 300) {
    return {
      duration,
      onUpdate: (progress) => {
        target.x = fromX + (toX - fromX) * progress
        target.y = fromY + (toY - fromY) * progress
      }
    }
  }
} 