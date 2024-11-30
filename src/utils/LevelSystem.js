import { Logger } from './Logger'

export class LevelSystem {
  constructor(eventManager) {
    this.eventManager = eventManager
    this.currentLevel = 1
    this.maxLevel = 10
    this.levelConfigs = this.initLevelConfigs()
    this.logger = new Logger('LevelSystem')
  }

  initLevelConfigs() {
    return {
      1: {
        gridSize: 6,
        blockTypes: 4,
        targetScore: 200,
        timeLimit: 120,
        hintCount: 3
      },
      2: {
        gridSize: 6,
        blockTypes: 5,
        targetScore: 300,
        timeLimit: 180,
        hintCount: 3
      },
      3: {
        gridSize: 7,
        blockTypes: 5,
        targetScore: 400,
        timeLimit: 240,
        hintCount: 3
      },
      4: {
        gridSize: 7,
        blockTypes: 6,
        targetScore: 500,
        timeLimit: 300,
        hintCount: 3
      },
      5: {
        gridSize: 8,
        blockTypes: 6,
        targetScore: 600,
        timeLimit: 360,
        hintCount: 3
      },
      6: {
        gridSize: 8,
        blockTypes: 7,
        targetScore: 700,
        timeLimit: 420,
        hintCount: 2
      },
      7: {
        gridSize: 9,
        blockTypes: 7,
        targetScore: 800,
        timeLimit: 480,
        hintCount: 2
      },
      8: {
        gridSize: 9,
        blockTypes: 8,
        targetScore: 900,
        timeLimit: 540,
        hintCount: 2
      },
      9: {
        gridSize: 10,
        blockTypes: 8,
        targetScore: 1000,
        timeLimit: 600,
        hintCount: 1
      },
      10: {
        gridSize: 10,
        blockTypes: 9,
        targetScore: 1200,
        timeLimit: 660,
        hintCount: 1
      }
    }
  }

  getCurrentLevel() {
    const config = this.levelConfigs[this.currentLevel]
    if (!config) {
      console.error(`Level ${this.currentLevel} config not found!`)
      return this.levelConfigs[1] // 如果找不到配置，返回第一关的配置
    }
    return {
      level: this.currentLevel,
      ...config
    }
  }

  checkLevelComplete(score, time) {
    const config = this.levelConfigs[this.currentLevel]
    return score >= config.targetScore
  }

  nextLevel() {
    this.logger.group('Level Change')
    const oldLevel = this.currentLevel
    
    if (this.currentLevel < this.maxLevel) {
      this.currentLevel++
      const config = this.getCurrentLevel()
      this.logger.info(`Advancing to level ${this.currentLevel}`)
      this.logger.debug('New level config:', config)
      this.eventManager.emit('levelChange', { level: this.currentLevel, config })
      this.logger.groupEnd()
      return true
    }
    
    this.logger.warn('Already at max level')
    this.logger.groupEnd()
    return false
  }

  isGameComplete() {
    return this.currentLevel >= this.maxLevel
  }

  loadProgress() {
    try {
      const progress = wx.getStorageSync('levelProgress')
      if (progress) {
        this.logger.debug('Loading progress:', progress)
        
        if (!progress.currentLevel || progress.currentLevel < 1 || progress.currentLevel > this.maxLevel) {
          this.logger.warn('Invalid progress, starting from level 1')
          this.currentLevel = 1
          this.saveProgress()
          return
        }
        
        this.currentLevel = progress.currentLevel
        this.logger.info(`Loaded level progress: ${this.currentLevel}`)
      } else {
        this.logger.info('No progress found, starting from level 1')
        this.currentLevel = 1
        this.saveProgress()
      }
    } catch (e) {
      this.logger.error('Failed to load progress:', e)
      this.currentLevel = 1
      this.saveProgress()
    }
  }

  saveProgress() {
    try {
      this.logger.debug(`Saving progress: level ${this.currentLevel}`)
      wx.setStorageSync('levelProgress', {
        currentLevel: this.currentLevel
      })
    } catch (e) {
      this.logger.error('Failed to save progress:', e)
    }
  }

  reset() {
    this.logger.info('Resetting game to level 1')
    this.currentLevel = 1
    this.saveProgress()
  }
} 