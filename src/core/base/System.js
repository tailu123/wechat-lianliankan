export class System {
  constructor(engine) {
    this.engine = engine
    this.isEnabled = true
  }

  init() {}
  update(deltaTime) {}
  destroy() {}
  
  enable() { this.isEnabled = true }
  disable() { this.isEnabled = false }
} 