export class Logger {
  static LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
  }

  constructor(tag, level = Logger.LEVELS.DEBUG) {
    this.tag = tag
    this.level = level
  }

  debug(...args) {
    if (this.level <= Logger.LEVELS.DEBUG) {
      console.log(`[${this.tag}][DEBUG]`, ...args)
    }
  }

  info(...args) {
    if (this.level <= Logger.LEVELS.INFO) {
      console.info(`[${this.tag}][INFO]`, ...args)
    }
  }

  warn(...args) {
    if (this.level <= Logger.LEVELS.WARN) {
      console.warn(`[${this.tag}][WARN]`, ...args)
    }
  }

  error(...args) {
    if (this.level <= Logger.LEVELS.ERROR) {
      console.error(`[${this.tag}][ERROR]`, ...args)
    }
  }

  group(label) {
    console.group(`[${this.tag}] ${label}`)
  }

  groupEnd() {
    console.groupEnd()
  }

  // 用于记录游戏状态
  logGameState(state) {
    this.group('Game State')
    this.debug('Score:', state.score)
    this.debug('Level:', state.currentLevel)
    this.debug('Grid:', state.grid)
    this.groupEnd()
  }

  // 用于记录匹配过程
  logMatch(block1, block2, path) {
    this.group('Match Attempt')
    this.debug('Block 1:', block1)
    this.debug('Block 2:', block2)
    this.debug('Path:', path)
    this.groupEnd()
  }

  // 用于记录关卡变化
  logLevelChange(oldLevel, newLevel, config) {
    this.group('Level Change')
    this.info(`Level: ${oldLevel} -> ${newLevel}`)
    this.debug('New Config:', config)
    this.groupEnd()
  }

  // 用于记录性能指标
  logPerformance(metrics) {
    this.group('Performance')
    this.debug('FPS:', metrics.fps)
    this.debug('Memory:', metrics.memory)
    this.debug('Load Time:', metrics.loadTime)
    this.groupEnd()
  }
} 