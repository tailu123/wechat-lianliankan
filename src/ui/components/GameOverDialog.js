Component({
  properties: {
    score: {
      type: Number,
      value: 0
    },
    isVisible: {
      type: Boolean,
      value: false
    }
  },

  data: {
    rank: 0,
    text: ''
  },

  observers: {
    'isVisible': function(visible) {
      if (visible) {
        this.updateRank()
      }
    }
  },

  methods: {
    updateRank() {
      const rankSystem = this.getAppInstance().rankSystem
      const rank = rankSystem.addScore(this.properties.score)
      const text = this.getScoreText(this.properties.score)
      
      this.setData({
        rank,
        text
      })
    },

    getScoreText(score) {
      if (score >= 1000) return '太厉害了！'
      if (score >= 500) return '很不错！'
      if (score >= 200) return '再接再厉！'
      return '继续加油！'
    },

    onRestart() {
      this.triggerEvent('restart')
    },

    onShare() {
      wx.shareAppMessage({
        title: `我在消消乐中获得了${this.properties.score}分，快来挑战我吧！`,
        imageUrl: '/images/share.png'
      })
    },

    getAppInstance() {
      return getApp()
    }
  }
}) 