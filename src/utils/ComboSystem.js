export class ComboSystem {
  constructor(eventManager) {
    this.eventManager = eventManager
    this.combo = 0
    this.lastMatchTime = 0
    this.comboTimeout = null
  }

  handleMatch() {
    const now = Date.now()
    
    // 如果在1.5秒内连续消除，增加连击
    if (now - this.lastMatchTime < 1500) {
      this.combo++
    } else {
      this.combo = 1
    }
    
    this.lastMatchTime = now
    
    // 清除之前的超时
    if (this.comboTimeout) {
      clearTimeout(this.comboTimeout)
    }
    
    // 1.5秒后重置连击
    this.comboTimeout = setTimeout(() => {
      this.resetCombo()
    }, 1500)
    
    // 发送连击事件
    this.eventManager.emit('comboChange', {
      combo: this.combo,
      score: this.getComboScore()
    })
    
    return this.getComboScore()
  }

  getComboScore() {
    // 连击加成计算
    return Math.floor(20 * (1 + (this.combo - 1) * 0.2))
  }

  resetCombo() {
    if (this.combo > 1) {
      this.combo = 0
      this.eventManager.emit('comboEnd')
    }
  }

  clear() {
    if (this.comboTimeout) {
      clearTimeout(this.comboTimeout)
    }
    this.combo = 0
    this.lastMatchTime = 0
  }
} 