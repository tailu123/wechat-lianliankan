// chat.js
import { RESOURCES } from '../../config/resources'
import { GameLogic } from '../../src/utils/GameLogic'
import { PathRenderer } from '../../src/utils/PathRenderer'
import { SoundManager } from '../../src/utils/SoundManager'
import { EventManager } from '../../src/utils/EventManager'
import { GameState } from '../../src/utils/GameState'
import { GameUI } from '../../src/utils/GameUI'
import { TimerSystem } from '../../src/utils/TimerSystem'
import { HintSystem } from '../../src/utils/HintSystem'
import { LevelSystem } from '../../src/utils/LevelSystem'

Page({
  data: {
    blockImages: RESOURCES.IMAGES.BLOCKS,
    grid: [],
    score: 0,
    isGameOver: false,
    pathPoints: [],
    isBgmPlaying: false,
    musicOnIcon: RESOURCES.IMAGES.MUSIC_ON,
    musicOffIcon: RESOURCES.IMAGES.MUSIC_OFF,
    time: '00:00',
    hintCount: 3,
    currentLevel: 1,
    targetScore: 0,
    timeLimit: 0,
    RESOURCES: RESOURCES
  },

  onLoad() {
    // 初始化所有管理器
    this.eventManager = new EventManager()
    this.gameState = new GameState(this.eventManager)
    this.gameUI = new GameUI(this.eventManager)
    
    // 初始化游戏逻辑
    this.gameLogic = new GameLogic(
      8, 
      this.data.blockImages.length,
      this.eventManager,
      this.gameState
    )
    
    // 初始化其他管理器
    this.pathRenderer = new PathRenderer(80)
    this.soundManager = new SoundManager()
    this.timerSystem = new TimerSystem(this.eventManager)
    this.hintSystem = new HintSystem(this.gameLogic)
    this.levelSystem = new LevelSystem(this.eventManager)
    this.levelSystem.loadProgress()
    this.setupLevelListeners()
    
    // 设置事件监听
    this.setupEventListeners()
    
    // 初始化音频
    this.initAudio()
    
    // 生成提示图标
    if (!RESOURCES.IMAGES.HINT) {
      const { generateHintIcon } = require('../../src/utils/ImageGenerator')
      RESOURCES.IMAGES.HINT = generateHintIcon()
    }
    
    // 开始游戏
    this.initLevel()
  },

  setupEventListeners() {
    // 监听分数更新
    this.eventManager.on('scoreUpdate', ({ score }) => {
      this.setData({ score })
      
      // 检查是否达到关卡目标
      if (score >= this.data.targetScore) {
        this.handleLevelComplete()
      }
    })

    // 监听游戏结束
    this.eventManager.on('gameOver', ({ score }) => {
      this.timerSystem.stop()
    })

    // 监听重新开始游戏
    this.eventManager.on('restartGame', () => {
      this.restartGame()
    })

    // 监听方块选择
    this.eventManager.on('blockSelect', ({ row, col }) => {
      this.updateUI()
    })

    // 监听方块匹配
    this.eventManager.on('match', (result) => {
      this.soundManager.playEffect('pop')
      if (result.path) {
        const points = this.pathRenderer.calculatePathPoints(result.path)
        this.setData({ pathPoints: points })
      }
    })

    this.eventManager.on('timerUpdate', ({ time }) => {
      this.setData({ time })
    })

    this.eventManager.on('timeUp', () => {
      if (!this.gameState.isGameOver) {
        wx.showModal({
          title: '时间到！',
          content: '很遗憾，未能在规定时间内完成关卡',
          confirmText: '重试',
          cancelText: '返回',
          success: (res) => {
            if (res.confirm) {
              this.restartGame()
            }
          }
        })
        this.gameState.setGameOver()
      }
    })
  },

  setupLevelListeners() {
    this.eventManager.on('levelChange', ({ level, config }) => {
      this.setData({
        currentLevel: level,
        targetScore: config.targetScore,
        timeLimit: config.timeLimit,
        hintCount: config.hintCount
      })
    })
  },

  initLevel() {
    const level = this.levelSystem.getCurrentLevel()
    this.setData({
      currentLevel: level.level,
      targetScore: level.targetScore,
      timeLimit: level.timeLimit,
      hintCount: level.hintCount,
      score: 0,
      pathPoints: []
    })
    
    // 使用关卡配置初始化游戏
    this.gameLogic = new GameLogic(
      level.gridSize,
      level.blockTypes,
      this.eventManager,
      this.gameState
    )
    
    this.updateUI()
    this.timerSystem.reset()
    this.timerSystem.start()
  },

  handleLevelComplete() {
    this.timerSystem.stop()
    const remainingTime = this.timerSystem.getRemainingTime()
    const timeBonus = Math.floor(remainingTime * 2) // 剩余时间奖励
    
    if (this.levelSystem.isGameComplete()) {
      wx.showModal({
        title: '恭喜通关！',
        content: `完美通关！\n总分：${this.gameState.score}\n时间奖励：${timeBonus}`,
        showCancel: false,
        success: () => {
          this.levelSystem.reset()
          this.initLevel()
        }
      })
    } else {
      wx.showModal({
        title: '过关！',
        content: `当前得分：${this.gameState.score}\n时间奖励：${timeBonus}\n准备好挑战下一关了吗？`,
        showCancel: false,
        success: () => {
          this.gameState.updateScore(timeBonus)
          this.levelSystem.nextLevel()
          this.levelSystem.saveProgress()
          this.initLevel()
        }
      })
    }
  },

  initAudio() {
    this.soundManager.createEffect('pop', RESOURCES.AUDIO.POP)
    this.soundManager.createBGM(RESOURCES.AUDIO.BGM)
    this.soundManager.toggleBGM()
    this.setData({ isBgmPlaying: true })
  },

  updateUI() {
    this.setData({
      grid: this.gameLogic.grid,
      score: this.gameState.score,
      isGameOver: this.gameState.isGameOver
    })
  },

  tapBlock(e) {
    console.log('Block tapped')
    if (this.gameState.isGameOver) return
    
    const { row, col } = e.currentTarget.dataset
    console.log(`Tapped block at row: ${row}, col: ${col}`)
    const result = this.gameLogic.handleBlockSelect(row, col)
    console.log('handleBlockSelect result:', result)
    
    if (result.type === 'match') {
      setTimeout(() => {
        this.setData({ pathPoints: [] })
        this.updateUI()
      }, 200)
    }
    
    this.updateUI()
  },

  toggleBgm() {
    const isPlaying = this.soundManager.toggleBGM()
    this.setData({ isBgmPlaying: isPlaying })
  },

  restartGame() {
    this.setData({ 
      pathPoints: [],
      hintCount: 3,
      time: '00:00'
    })
    this.timerSystem.reset()
    this.timerSystem.start()
    this.gameLogic.reset()
    this.updateUI()
  },

  showHint() {
    if (this.data.hintCount <= 0) {
      this.gameUI.showError('提示次数已用完')
      return
    }

    const hint = this.hintSystem.showHint()
    if (hint) {
      this.setData({ hintCount: this.data.hintCount - 1 })
      this.updateUI()
    } else {
      this.gameUI.showError('没有找到可消除的方块')
    }
  },

  onUnload() {
    this.soundManager.stopAll()
    this.eventManager.clear()
    this.timerSystem.stop()
  }
})