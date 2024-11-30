export class GameEngine {
  constructor() {
    this.systems = new Map()
    this.isInitialized = false
  }

  init() {
    if (this.isInitialized) return

    // 按依赖顺序初始化系统
    this.initSystems([
      'event',
      'state',
      'grid',
      'path',
      'sound',
      'ui',
      'timer',
      'hint',
      'level',
      'achievement',
      'ranking'
    ])

    this.isInitialized = true
  }

  initSystems(systemNames) {
    systemNames.forEach(name => {
      const system = this.createSystem(name)
      if (system) {
        this.systems.set(name, system)
      }
    })
  }

  createSystem(name) {
    switch (name) {
      case 'event':
        return new EventManager()
      case 'state':
        return new GameState(this.getSystem('event'))
      case 'grid':
        return new GridGenerator(8, 5)
      case 'path':
        return new PathFinder(null, 8)
      case 'sound':
        return new SoundManager()
      case 'ui':
        return new GameUI(this.getSystem('event'))
      case 'timer':
        return new TimerSystem(this.getSystem('event'))
      case 'hint':
        return new HintSystem(null)
      case 'level':
        return new LevelSystem(this.getSystem('event'))
      case 'achievement':
        return new AchievementSystem(this.getSystem('event'))
      case 'ranking':
        return new RankingSystem()
      default:
        return null
    }
  }

  getSystem(name) {
    return this.systems.get(name)
  }

  start() {
    if (!this.isInitialized) {
      this.init()
    }

    const level = this.getSystem('level').getCurrentLevel()
    this.setupGame(level)
  }

  setupGame(level) {
    // 重置所有系统状态
    this.systems.forEach(system => {
      if (system.reset) {
        system.reset()
      }
    })

    // 初始化游戏逻辑
    const gameLogic = new GameLogic(
      level.gridSize,
      level.blockTypes,
      this.getSystem('event'),
      this.getSystem('state')
    )

    this.systems.set('logic', gameLogic)

    // 更新路径查找器的网格
    const pathFinder = this.getSystem('path')
    pathFinder.grid = gameLogic.grid
    pathFinder.gridSize = level.gridSize

    // 更新提示系统的游戏逻辑
    const hintSystem = this.getSystem('hint')
    hintSystem.gameLogic = gameLogic

    // 启动计时器
    this.getSystem('timer').start()
  }

  handleBlockSelect(row, col) {
    const gameLogic = this.getSystem('logic')
    const result = gameLogic.handleBlockSelect(row, col)

    if (result.type === 'match') {
      this.handleMatch(result)
    }

    return result
  }

  handleMatch(result) {
    const soundSystem = this.getSystem('sound')
    soundSystem.playEffect('pop')

    if (result.path) {
      this.getSystem('event').emit('showPath', result.path)
    }

    // 检查关卡完成
    this.checkLevelComplete()
  }

  checkLevelComplete() {
    const levelSystem = this.getSystem('level')
    const gameState = this.getSystem('state')
    const timerSystem = this.getSystem('timer')

    if (levelSystem.checkLevelComplete(
      gameState.score,
      timerSystem.getElapsedTime()
    )) {
      timerSystem.stop()
      
      if (levelSystem.isGameComplete()) {
        this.handleGameComplete()
      } else {
        this.handleLevelComplete()
      }
    }
  }

  handleLevelComplete() {
    const levelSystem = this.getSystem('level')
    levelSystem.nextLevel()
    levelSystem.saveProgress()
    
    const level = levelSystem.getCurrentLevel()
    this.setupGame(level)
  }

  handleGameComplete() {
    const rankingSystem = this.getSystem('ranking')
    const gameState = this.getSystem('state')
    const timerSystem = this.getSystem('timer')

    rankingSystem.addScore(
      gameState.score,
      timerSystem.getElapsedTime()
    )
  }

  destroy() {
    this.systems.forEach(system => {
      if (system.destroy) {
        system.destroy()
      }
    })
    this.systems.clear()
    this.isInitialized = false
  }
} 