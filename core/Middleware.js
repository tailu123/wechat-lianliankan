export class Middleware {
  constructor() {
    this.middlewares = new Map()
  }

  use(event, handler) {
    if (!this.middlewares.has(event)) {
      this.middlewares.set(event, [])
    }
    this.middlewares.get(event).push(handler)
  }

  async process(event, data) {
    const handlers = this.middlewares.get(event) || []
    let result = data

    for (const handler of handlers) {
      try {
        result = await handler(result)
        if (result === null) return null // 中断处理链
      } catch (error) {
        console.error(`Middleware error for ${event}:`, error)
        return null
      }
    }

    return result
  }
} 