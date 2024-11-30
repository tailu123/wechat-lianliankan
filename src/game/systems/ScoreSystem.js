import { System } from '../../core/base/System'

export class ScoreSystem extends System {
  constructor(engine) {
    super(engine)
    this.score = 0
    this.combo = 0
    this.lastMatchTime = 0
    this.eventManager = engine.getManager('event')
  }

  addScore(baseScore) {
    const now = Date.now()
    
    // 计算连击
    if (now - this.lastMatchTime < 1500) {
      this.combo++
    } else {
      this.combo = 1
    }
    this.lastMatchTime = now

    // 计算实际得分（包含连击加成）
    const actualScore = Math.floor(baseScore * (1 + this.combo * 0.2))
    this.score += actualScore

    // 发送得分事件
    this.eventManager.emit('scoreUpdate', {
      score: this.score,
      combo: this.combo,
      added: actualScore
    })

    // 检查连击成就
    if (this.combo >= 5) {
      this.eventManager.emit('achievement', {
        id: 'comboKing',
        combo: this.combo
      })
    }

    return actualScore
  }

  getScore() {
    return this.score
  }

  getCombo() {
    return this.combo
  }

  reset() {
    this.score = 0
    this.combo = 0
    this.lastMatchTime = 0
    this.eventManager.emit('scoreUpdate', {
      score: 0,
      combo: 0,
      added: 0
    })
  }
} 