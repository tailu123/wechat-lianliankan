export class GameContext {
  constructor(engine) {
    this.engine = engine
    this.state = {
      score: 0,
      level: 1,
      time: 0,
      combo: 0,
      hints: 3,
      isGameOver: false,
      isPaused: false
    }
    this.history = []  // 用于撤销/重做
    this.maxHistoryLength = 10
  }

  setState(newState) {
    // 保存历史记录
    this.history.push({...this.state})
    if (this.history.length > this.maxHistoryLength) {
      this.history.shift()
    }

    this.state = {...this.state, ...newState}
    return this.state
  }

  undo() {
    if (this.history.length === 0) return false
    this.state = this.history.pop()
    return true
  }

  getSnapshot() {
    return {
      state: {...this.state},
      grid: this.engine.getSystem('grid').getSnapshot(),
      timestamp: Date.now()
    }
  }

  restore(snapshot) {
    if (!snapshot) return false
    
    this.state = {...snapshot.state}
    this.engine.getSystem('grid').restore(snapshot.grid)
    return true
  }
} 