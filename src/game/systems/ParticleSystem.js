import { System } from '../../core/base/System'

export class ParticleSystem extends System {
  constructor(engine) {
    super(engine)
    this.particles = new Set()
    this.maxParticles = 1000
    this.defaultConfig = {
      lifetime: 1000,
      speed: 100,
      size: 5,
      color: '#ff0000',
      alpha: 1,
      gravity: 0.5,
      spread: Math.PI / 4
    }
  }

  emit(x, y, config = {}) {
    if (this.particles.size >= this.maxParticles) return

    const finalConfig = { ...this.defaultConfig, ...config }
    const count = config.count || 10
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() - 0.5) * finalConfig.spread
      const speed = finalConfig.speed * (0.8 + Math.random() * 0.4)
      
      const particle = {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: finalConfig.size * (0.8 + Math.random() * 0.4),
        color: finalConfig.color,
        alpha: finalConfig.alpha,
        gravity: finalConfig.gravity,
        lifetime: finalConfig.lifetime,
        birth: performance.now()
      }

      this.particles.add(particle)
    }
  }

  update(deltaTime) {
    const now = performance.now()
    const deadParticles = new Set()

    for (const particle of this.particles) {
      const age = now - particle.birth
      if (age >= particle.lifetime) {
        deadParticles.add(particle)
        continue
      }

      // 更新位置
      particle.x += particle.vx * deltaTime / 1000
      particle.y += particle.vy * deltaTime / 1000
      
      // 应用重力
      particle.vy += particle.gravity * deltaTime / 1000
      
      // 更新透明度
      particle.alpha = 1 - (age / particle.lifetime)
    }

    // 移除死亡粒子
    for (const particle of deadParticles) {
      this.particles.delete(particle)
    }
  }

  // 预设效果
  createMatchEffect(x, y, color) {
    this.emit(x, y, {
      count: 20,
      color,
      speed: 200,
      lifetime: 800,
      size: 4,
      spread: Math.PI * 2,
      gravity: 0.2
    })
  }

  createExplosionEffect(x, y) {
    this.emit(x, y, {
      count: 50,
      color: '#ffff00',
      speed: 300,
      lifetime: 1000,
      size: 6,
      spread: Math.PI * 2,
      gravity: 0.5
    })
  }

  createSparkleEffect(x, y) {
    this.emit(x, y, {
      count: 8,
      color: '#ffffff',
      speed: 100,
      lifetime: 500,
      size: 3,
      spread: Math.PI * 2,
      gravity: 0
    })
  }

  clear() {
    this.particles.clear()
  }
} 