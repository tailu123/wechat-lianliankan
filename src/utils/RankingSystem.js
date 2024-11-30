export class RankingSystem {
  constructor() {
    this.rankings = wx.getStorageSync('rankings') || []
  }

  addScore(score, time) {
    const newRecord = {
      score,
      time,
      date: new Date().toISOString(),
      timeStr: this.formatTime(time)
    }

    this.rankings.push(newRecord)
    this.rankings.sort((a, b) => b.score - a.score)
    
    // 只保留前10名
    if (this.rankings.length > 10) {
      this.rankings.length = 10
    }

    wx.setStorageSync('rankings', this.rankings)
    return this.getRank(score)
  }

  getRank(score) {
    return this.rankings.findIndex(record => record.score === score) + 1
  }

  getTopScores(limit = 10) {
    return this.rankings.slice(0, limit)
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}分${remainingSeconds}秒`
  }

  clearRankings() {
    this.rankings = []
    wx.setStorageSync('rankings', [])
  }
} 