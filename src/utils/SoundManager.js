export class SoundManager {
  constructor() {
    this.effects = new Map()
    this.effectsEnabled = true
    this.bgmEnabled = true
  }

  createEffect(key, src) {
    const audio = wx.createInnerAudioContext()
    audio.src = src
    audio.volume = 0.8
    this.effects.set(key, audio)
  }

  playEffect(key) {
    if (!this.effectsEnabled) return
    
    const audio = this.effects.get(key)
    if (!audio) return

    const newAudio = wx.createInnerAudioContext()
    newAudio.src = audio.src
    newAudio.volume = audio.volume
    newAudio.play()
    
    newAudio.onEnded(() => {
      newAudio.destroy()
    })
  }

  createBGM(src) {
    this.bgm = wx.createInnerAudioContext()
    this.bgm.src = src
    this.bgm.loop = true
    this.bgm.volume = 0.5
  }

  toggleBGM() {
    if (!this.bgm || !this.bgmEnabled) return false
    
    if (this.bgm.paused) {
      this.bgm.play()
      return true
    } else {
      this.bgm.pause()
      return false
    }
  }

  toggleEffects() {
    this.effectsEnabled = !this.effectsEnabled
    return this.effectsEnabled
  }

  setVolume(volume) {
    this.effects.forEach(audio => {
      audio.volume = volume
    })
    if (this.bgm) {
      this.bgm.volume = volume * 0.6
    }
  }

  stopAll() {
    this.effects.forEach(audio => {
      audio.stop()
      audio.destroy()
    })
    this.effects.clear()
    
    if (this.bgm) {
      this.bgm.stop()
      this.bgm.destroy()
    }
  }
} 