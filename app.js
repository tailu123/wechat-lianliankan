// app.js
App({
  onLaunch() {
    // 清除游戏进度（如果需要）
    try {
      wx.removeStorageSync('levelProgress')
    } catch (e) {
      console.error('Failed to clear progress:', e)
    }

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'your-env-id',  // 替换为你的云环境ID
        traceUser: true
      })
    }
  },

  globalData: {
    userInfo: null
  }
})
