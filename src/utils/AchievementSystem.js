export class AchievementSystem {
  constructor(eventManager) {
    this.eventManager = eventManager
    this.achievements = this.initAchievements()
    this.loadProgress()
    this.setupListeners()
  }

  initAchievements() {
    return {
      firstWin: {
        id: 'firstWin',
        title: '初次胜利',
        description: '完成第一局游戏',
        icon: '/images/achievements/first-win.png',
        unlocked: false
      },
      speedMaster: {
        id: 'speedMaster',
        title: '速度大师',
        description: '在2分钟内完成游戏',
        icon: '/images/achievements/speed.png',
        unlocked: false
      },
      comboKing: {
        id: 'comboKing',
        title: '连击之王',
        description: '达成5连击',
        icon: '/images/achievements/combo.png',
        unlocked: false
      },
      perfectClear: {
        id: 'perfectClear',
        title: '完美通关',
        description: '不使用提示完成游戏',
        icon: '/images/achievements/perfect.png',
        unlocked: false
      }
    }
  }

  setupListeners() {
    this.eventManager.on('gameComplete', (data) => {
      this.checkGameComplete(data)
    })

    this.eventManager.on('comboChange', ({ combo }) => {
      if (combo >= 5) {
        this.unlock('comboKing')
      }
    })
  }

  checkGameComplete(data) {
    // 检查首胜
    this.unlock('firstWin')

    // 检查速度
    if (data.time <= 120) {
      this.unlock('speedMaster')
    }

    // 检查完美通关
    if (!data.usedHint) {
      this.unlock('perfectClear')
    }
  }

  unlock(achievementId) {
    const achievement = this.achievements[achievementId]
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true
      achievement.unlockDate = new Date().toISOString()
      this.saveProgress()
      
      // 发送成就解锁事件
      this.eventManager.emit('achievementUnlocked', achievement)
      
      // 显示成就解锁提示
      wx.showToast({
        title: `解锁成就：${achievement.title}`,
        icon: 'none',
        duration: 2000
      })
    }
  }

  loadProgress() {
    const saved = wx.getStorageSync('achievements')
    if (saved) {
      Object.keys(saved).forEach(id => {
        if (this.achievements[id]) {
          this.achievements[id].unlocked = saved[id].unlocked
          this.achievements[id].unlockDate = saved[id].unlockDate
        }
      })
    }
  }

  saveProgress() {
    wx.setStorageSync('achievements', this.achievements)
  }

  getAll() {
    return Object.values(this.achievements)
  }

  getUnlocked() {
    return Object.values(this.achievements).filter(a => a.unlocked)
  }

  getLocked() {
    return Object.values(this.achievements).filter(a => !a.unlocked)
  }

  getProgress() {
    const total = Object.keys(this.achievements).length
    const unlocked = this.getUnlocked().length
    return {
      total,
      unlocked,
      percentage: Math.round((unlocked / total) * 100)
    }
  }
} 