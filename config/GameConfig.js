export class GameConfig {
  constructor() {
    this.config = {
      game: {
        gridSize: 8,
        blockTypes: 5,
        baseScore: 20,
        comboTimeWindow: 1500,
        matchAnimationDuration: 300,
        hintDuration: 3000,
        maxHints: 3
      },
      
      animation: {
        frameRate: 60,
        pathAnimationDuration: 200,
        fadeAnimationDuration: 300,
        scaleAnimationDuration: 200,
        particleLifetime: 1000,
        maxParticles: 1000
      },
      
      audio: {
        effectVolume: 0.8,
        bgmVolume: 0.5,
        maxConcurrentAudio: 4
      },
      
      performance: {
        gcThreshold: 50 * 1024 * 1024,  // 50MB
        gcInterval: 30000,  // 30s
        maxCacheSize: 20 * 1024 * 1024,  // 20MB
        targetFPS: 60,
        lowFPSThreshold: 30
      },
      
      ui: {
        blockSize: 80,
        lineWidth: 6,
        lineColor: '#ff0000',
        selectedBorderWidth: 4,
        selectedBorderColor: '#333',
        hintGlowColor: 'rgba(255, 215, 0, 0.6)',
        comboTextColors: ['#ff3333', '#ff6633', '#ff9933', '#ffcc33']
      }
    }
  }

  get(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this.config)
  }

  set(path, value) {
    const keys = path.split('.')
    const lastKey = keys.pop()
    const target = keys.reduce((obj, key) => obj[key], this.config)
    if (target) {
      target[lastKey] = value
    }
  }

  // 根据设备性能调整配置
  adjustForDevice() {
    const systemInfo = wx.getSystemInfoSync()
    const isLowEndDevice = systemInfo.benchmarkLevel < 10

    if (isLowEndDevice) {
      this.set('animation.frameRate', 30)
      this.set('performance.maxParticles', 500)
      this.set('performance.targetFPS', 30)
      this.set('game.maxHints', 5)  // 给低端设备更多提示次数
    }

    // 根据屏幕大小调整UI
    const screenWidth = systemInfo.windowWidth
    const blockSize = Math.floor(screenWidth / this.get('game.gridSize'))
    this.set('ui.blockSize', blockSize)
  }

  // 获取关卡配置
  getLevelConfig(level) {
    const configs = {
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
      // ... 更多关卡配置
    }
    return configs[level] || configs[1]
  }

  // 导出配置
  export() {
    return JSON.parse(JSON.stringify(this.config))
  }

  // 导入配置
  import(config) {
    this.config = JSON.parse(JSON.stringify(config))
  }
} 