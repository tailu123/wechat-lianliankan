export class SceneManager {
  constructor(engine) {
    this.engine = engine
    this.scenes = new Map()
    this.currentScene = null
    this.nextScene = null
    this.isTransitioning = false
  }

  addScene(name, scene) {
    this.scenes.set(name, scene)
  }

  async loadScene(name) {
    if (this.isTransitioning) return
    
    const scene = this.scenes.get(name)
    if (!scene) return

    this.isTransitioning = true
    this.nextScene = scene

    // 淡出当前场景
    if (this.currentScene) {
      await this.currentScene.exit()
    }

    // 加载新场景
    await this.nextScene.load()
    this.currentScene = this.nextScene
    this.nextScene = null
    
    // 进入新场景
    await this.currentScene.enter()
    this.isTransitioning = false
  }

  update(deltaTime) {
    if (this.currentScene) {
      this.currentScene.update(deltaTime)
    }
  }

  destroy() {
    if (this.currentScene) {
      this.currentScene.destroy()
    }
    this.scenes.clear()
  }
} 