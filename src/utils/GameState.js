export class GameState {
  constructor(eventManager) {
    this.eventManager = eventManager
    this.reset()
  }

  reset() {
    this.score = 0
    this.isGameOver = false
    this.isPaused = false
  }

  updateScore(points) {
    this.score += points
    this.eventManager.emit('scoreUpdate', { score: this.score })
  }

  setGameOver() {
    if (this.isGameOver) return
    
    this.isGameOver = true
    // 使用 setTimeout 避免调用栈溢出
    setTimeout(() => {
      this.eventManager.emit('gameOver', { score: this.score })
    }, 0)
  }

  setPaused(paused) {
    this.isPaused = paused
    this.eventManager.emit('pauseStateChange', { isPaused: paused })
  }
} 