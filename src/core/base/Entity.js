export class Entity {
  constructor() {
    this.id = Symbol('entity')
    this.components = new Map()
    this.isActive = true
  }

  addComponent(name, component) {
    this.components.set(name, component)
    return this
  }

  getComponent(name) {
    return this.components.get(name)
  }

  removeComponent(name) {
    this.components.delete(name)
  }

  update(deltaTime) {
    if (!this.isActive) return

    for (const component of this.components.values()) {
      if (component.update) {
        component.update(deltaTime)
      }
    }
  }

  destroy() {
    for (const component of this.components.values()) {
      if (component.destroy) {
        component.destroy()
      }
    }
    this.components.clear()
  }
} 