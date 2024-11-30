import { Logger } from './Logger'

export class TimerSystem {
  constructor(eventManager) {
    this.eventManager = eventManager
    this.timeLimit = 0
    this.remainingTime = 0
    this.timerId = null
    this.isPaused = false
    this.logger = new Logger('TimerSystem')
  }

  start(timeLimit) {
    this.logger.info(`Starting timer with limit: ${timeLimit}s`)
    this.timeLimit = timeLimit
    this.remainingTime = timeLimit
    this.isPaused = false
    this.update()
  }

  stop() {
    if (this.timerId) {
      this.logger.info('Stopping timer')
      clearTimeout(this.timerId)
      this.timerId = null
    }
  }

  pause() {
    this.logger.info('Pausing timer')
    this.isPaused = true
    this.stop()
  }

  resume() {
    if (this.isPaused) {
      this.logger.info('Resuming timer')
      this.isPaused = false
      this.update()
    }
  }

  reset() {
    this.logger.info('Resetting timer')
    this.stop()
    this.remainingTime = this.timeLimit
    this.isPaused = false
    this.eventManager.emit('timerUpdate', {
      time: this.formatTime(this.remainingTime)
    })
  }

  update() {
    if (this.isPaused) return

    if (this.remainingTime <= 0) {
      this.logger.warn('Time up!')
      this.eventManager.emit('timeUp')
      return
    }

    this.logger.debug(`Time remaining: ${this.remainingTime}s`)
    this.eventManager.emit('timerUpdate', {
      time: this.formatTime(this.remainingTime),
      progress: this.remainingTime / this.timeLimit
    })

    this.remainingTime--
    this.timerId = setTimeout(() => this.update(), 1000)
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  getRemainingTime() {
    return this.remainingTime
  }
} 