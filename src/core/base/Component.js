export class Component {
  constructor(entity) {
    this.entity = entity
    this.isEnabled = true
  }

  init() {}
  update(deltaTime) {}
  destroy() {}

  enable() { this.isEnabled = true }
  disable() { this.isEnabled = false }

  // 获取其他组件
  getComponent(name) {
    return this.entity.getComponent(name)
  }

  // 获取系统
  getSystem(name) {
    return this.entity.engine.getSystem(name)
  }
} 