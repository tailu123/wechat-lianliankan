export class AssetManager {
  constructor() {
    this.assets = new Map()
    this.loadingAssets = new Map()
    this.loadingPromises = new Map()
  }

  async loadAsset(key, url, type) {
    if (this.assets.has(key)) {
      return this.assets.get(key)
    }

    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key)
    }

    const promise = this._loadAsset(key, url, type)
    this.loadingPromises.set(key, promise)

    try {
      const asset = await promise
      this.assets.set(key, asset)
      this.loadingPromises.delete(key)
      return asset
    } catch (error) {
      this.loadingPromises.delete(key)
      throw error
    }
  }

  async _loadAsset(key, url, type) {
    switch (type) {
      case 'image':
        return this.loadImage(url)
      case 'audio':
        return this.loadAudio(url)
      default:
        throw new Error(`Unsupported asset type: ${type}`)
    }
  }

  loadImage(url) {
    return new Promise((resolve, reject) => {
      const image = wx.createImage()
      image.onload = () => resolve(image)
      image.onerror = reject
      image.src = url
    })
  }

  loadAudio(url) {
    return new Promise((resolve, reject) => {
      const audio = wx.createInnerAudioContext()
      audio.onCanplay(() => resolve(audio))
      audio.onError(reject)
      audio.src = url
    })
  }

  getAsset(key) {
    return this.assets.get(key)
  }

  unloadAsset(key) {
    const asset = this.assets.get(key)
    if (asset) {
      if (asset.destroy) {
        asset.destroy()
      }
      this.assets.delete(key)
    }
  }

  clear() {
    for (const [key] of this.assets) {
      this.unloadAsset(key)
    }
  }
} 