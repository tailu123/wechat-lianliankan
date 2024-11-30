export class ResourceLoader {
  constructor() {
    this.resources = new Map()
    this.loadingPromises = new Map()
    this.retryCount = 3
    this.retryDelay = 1000
  }

  // 预加载资源
  async preload(resources) {
    const tasks = []
    for (const [key, url] of Object.entries(resources)) {
      if (!this.resources.has(key) && !this.loadingPromises.has(key)) {
        tasks.push(this.loadResource(key, url))
      }
    }
    return Promise.all(tasks)
  }

  // 加载单个资源
  async loadResource(key, url, retries = 0) {
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key)
    }

    const promise = new Promise(async (resolve, reject) => {
      try {
        const resource = await this.loadFile(url)
        this.resources.set(key, resource)
        this.loadingPromises.delete(key)
        resolve(resource)
      } catch (error) {
        if (retries < this.retryCount) {
          await new Promise(r => setTimeout(r, this.retryDelay))
          resolve(this.loadResource(key, url, retries + 1))
        } else {
          this.loadingPromises.delete(key)
          reject(error)
        }
      }
    })

    this.loadingPromises.set(key, promise)
    return promise
  }

  // 根据文件类型加载资源
  loadFile(url) {
    const ext = url.split('.').pop().toLowerCase()
    switch (ext) {
      case 'png':
      case 'jpg':
      case 'jpeg':
        return this.loadImage(url)
      case 'mp3':
      case 'wav':
        return this.loadAudio(url)
      default:
        return Promise.reject(new Error(`Unsupported file type: ${ext}`))
    }
  }

  // 加载图片
  loadImage(url) {
    return new Promise((resolve, reject) => {
      const image = wx.createImage()
      image.onload = () => resolve(image)
      image.onerror = reject
      image.src = url
    })
  }

  // 加载音频
  loadAudio(url) {
    return new Promise((resolve, reject) => {
      const audio = wx.createInnerAudioContext()
      audio.onCanplay(() => resolve(audio))
      audio.onError(reject)
      audio.src = url
    })
  }

  // 获取已加载的资源
  get(key) {
    return this.resources.get(key)
  }

  // 清理资源
  clear() {
    this.resources.clear()
    this.loadingPromises.clear()
  }
} 