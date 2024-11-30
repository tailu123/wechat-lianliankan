export class GameUI {
  constructor(eventManager) {
    this.eventManager = eventManager
    this.setupEventListeners()
  }

  setupEventListeners() {
    this.eventManager.on('gameOver', this.handleGameOver.bind(this))
  }

  handleGameOver(data) {
    const { score } = data
    wx.showModal({
      title: '游戏结束',
      content: `你的得分是：${score}`,
      confirmText: '再来一局',
      cancelText: '返回',
      success: (res) => {
        if (res.confirm) {
          this.eventManager.emit('restartGame')
        }
      }
    })
  }

  showError(message) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    })
  }
} 