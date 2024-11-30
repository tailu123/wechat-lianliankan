import { System } from '../../core/base/System'

export class EffectSystem extends System {
  constructor(engine) {
    super(engine)
    this.effects = new Map()
    this.activeEffects = new Set()
    this.animationSystem = engine.getSystem('animation')
  }

  createEffect(type, config) {
    this.effects.set(type, config)
  }

  playEffect(type, target, options = {}) {
    const config = this.effects.get(type)
    if (!config) return null

    const effect = {
      id: Symbol('effect'),
      type,
      target,
      startTime: performance.now(),
      duration: options.duration || config.duration,
      onUpdate: config.onUpdate,
      onComplete: () => {
        this.activeEffects.delete(effect)
        options.onComplete?.()
      }
    }

    this.activeEffects.add(effect)
    this.animationSystem.addAnimation(effect.id, effect)

    return effect.id
  }

  stopEffect(id) {
    this.animationSystem.removeAnimation(id)
  }

  update(deltaTime) {
    // 效果更新由 AnimationSystem 处理
  }

  // 预定义一些常用效果
  setupDefaultEffects() {
    // 消除闪光效果
    this.createEffect('match_flash', {
      duration: 300,
      onUpdate: (target, progress) => {
        target.opacity = Math.sin(progress * Math.PI) * 0.5 + 0.5
        target.scale = 1 + Math.sin(progress * Math.PI) * 0.2
      }
    })

    // 选中缩放效果
    this.createEffect('select_scale', {
      duration: 200,
      onUpdate: (target, progress) => {
        target.scale = 0.8 + Math.sin(progress * Math.PI) * 0.2
      }
    })

    // 提示闪烁效果
    this.createEffect('hint_blink', {
      duration: 1000,
      onUpdate: (target, progress) => {
        target.opacity = 0.5 + Math.sin(progress * Math.PI * 2) * 0.5
      }
    })
  }
} 