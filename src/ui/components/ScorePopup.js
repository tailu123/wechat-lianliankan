Component({
  properties: {
    score: {
      type: Number,
      value: 0
    },
    x: {
      type: Number,
      value: 0
    },
    y: {
      type: Number,
      value: 0
    }
  },

  data: {
    isVisible: false,
    style: ''
  },

  lifetimes: {
    attached() {
      this.show()
    }
  },

  methods: {
    show() {
      const style = `left:${this.properties.x}rpx; top:${this.properties.y}rpx;`
      this.setData({
        isVisible: true,
        style
      })

      setTimeout(() => {
        this.hide()
      }, 1000)
    },

    hide() {
      this.setData({ isVisible: false })
      this.triggerEvent('complete')
    }
  }
}) 