export class Scene {
  constructor(engine) {
    this.engine = engine
    this.entities = new Set()
    this.isLoaded = false
  }

  async load() {
    if (this.isLoaded) return
    await this.onLoad()
    this.isLoaded = true
  }

  async enter() {
    await this.onEnter()
  }

  async exit() {
    await this.onExit()
  }

  update(deltaTime) {
    for (const entity of this.entities) {
      if (entity.isActive) {
        entity.update(deltaTime)
      }
    }
  }

  addEntity(entity) {
    this.entities.add(entity)
    return entity
  }

  removeEntity(entity) {
    this.entities.delete(entity)
    entity.destroy()
  }

  destroy() {
    for (const entity of this.entities) {
      entity.destroy()
    }
    this.entities.clear()
    this.onDestroy()
  }

  // 生命周期钩子
  async onLoad() {}
  async onEnter() {}
  async onExit() {}
  onDestroy() {}
} 