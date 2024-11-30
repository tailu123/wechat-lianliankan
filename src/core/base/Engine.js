export class Engine {
  constructor() {
    this.systems = new Map()
    this.managers = new Map()
    this.isRunning = false
    this.lastTime = 0
  }

  addSystem(name, system) {
    this.systems.set(name, system)
    system.init()
  }

  addManager(name, manager) {
    this.managers.set(name, manager)
  }

  getSystem(name) {
    return this.systems.get(name)
  }

  getManager(name) {
    return this.managers.get(name)
  }

  start() {
    if (this.isRunning) return
    this.isRunning = true
    this.lastTime = performance.now()
    this.update()
  }

  stop() {
    this.isRunning = false
  }

  update() {
    if (!this.isRunning) return

    const currentTime = performance.now()
    const deltaTime = currentTime - this.lastTime
    this.lastTime = currentTime

    for (const system of this.systems.values()) {
      if (system.isEnabled) {
        system.update(deltaTime)
      }
    }

    requestAnimationFrame(() => this.update())
  }

  destroy() {
    this.stop()
    for (const system of this.systems.values()) {
      system.destroy()
    }
    this.systems.clear()
    this.managers.clear()
  }
} 