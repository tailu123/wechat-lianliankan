Component({
  properties: {
    combo: {
      type: Number,
      value: 0
    }
  },

  data: {
    text: '',
    isVisible: false
  },

  observers: {
    'combo': function(combo) {
      if (combo > 1) {
        this.showCombo(combo)
      }
    }
  },

  methods: {
    showCombo(combo) {
      const texts = ['不错！', '好棒！', '太厉害了！', '无敌了！']
      const text = texts[Math.min(combo - 2, texts.length - 1)]
      
      this.setData({
        text,
        isVisible: true
      })

      setTimeout(() => {
        this.setData({ isVisible: false })
      }, 1000)
    }
  }
}) 