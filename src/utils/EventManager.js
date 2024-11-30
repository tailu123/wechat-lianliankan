export class EventManager {
  constructor() {
    this.handlers = new Map()
  }

  on(event, handler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event).add(handler)
  }

  off(event, handler) {
    const handlers = this.handlers.get(event)
    if (handlers) {
      handlers.delete(handler)
    }
  }

  emit(event, data) {
    const handlers = this.handlers.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error(`Error in event handler (${event}):`, error)
        }
      })
    }
  }

  clear() {
    this.handlers.clear()
  }
} 