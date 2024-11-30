export class CacheManager {
  constructor() {
    this.cache = new Map()
    this.maxSize = 1024 * 1024 * 20  // 20MB
    this.currentSize = 0
    this.hits = 0
    this.misses = 0
  }

  async set(key, value, size = 0, ttl = 3600000) {  // 默认1小时过期
    if (size > this.maxSize) return false

    // 如果需要，清理空间
    while (this.currentSize + size > this.maxSize) {
      const oldestKey = this.findOldestKey()
      if (!oldestKey) break
      this.delete(oldestKey)
    }

    const entry = {
      value,
      size,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
      hits: 0
    }

    try {
      await wx.setStorage({
        key: `cache_${key}`,
        data: entry
      })
      
      this.cache.set(key, entry)
      this.currentSize += size
      return true
    } catch (error) {
      console.error('Cache set error:', error)
      return false
    }
  }

  async get(key) {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.misses++
      
      // 尝试从持久存储恢复
      try {
        const stored = await wx.getStorage({
          key: `cache_${key}`
        })
        
        if (stored && stored.data) {
          this.cache.set(key, stored.data)
          return this.get(key)
        }
      } catch {
        return null
      }
      
      return null
    }

    if (Date.now() > entry.expiry) {
      this.delete(key)
      return null
    }

    this.hits++
    entry.hits++
    entry.timestamp = Date.now()
    return entry.value
  }

  delete(key) {
    const entry = this.cache.get(key)
    if (entry) {
      this.currentSize -= entry.size
      this.cache.delete(key)
      
      wx.removeStorage({
        key: `cache_${key}`
      })
    }
  }

  findOldestKey() {
    let oldestKey = null
    let oldestTime = Infinity

    for (const [key, entry] of this.cache) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }

    return oldestKey
  }

  getStats() {
    return {
      size: this.currentSize,
      maxSize: this.maxSize,
      itemCount: this.cache.size,
      hitRate: this.hits / (this.hits + this.misses),
      hits: this.hits,
      misses: this.misses
    }
  }

  clear() {
    this.cache.clear()
    this.currentSize = 0
    wx.clearStorage()
  }
} 