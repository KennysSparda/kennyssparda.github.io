export default class Sound {
  constructor() {
    this.monstrosSons = this.reprodutor(assets.monstrosSons, true)
    this.monstrosPlaying = false

    this.passarosSons = this.reprodutor(assets.passarosSons, true)
    this.passarosPlaying = false
  }

  reprodutor(asset, loop) {
    const reprodutor = document.createElement('video')
    reprodutor.src = asset
    reprodutor.loop = loop
    return reprodutor
  }

  playMonstros() {
    if(!this.monstrosPlaying) {
      this.monstrosSons.play()
    }
    this.monstrosPlaying = true
  }

  playPassaros() {
    if(!this.passarosPlaying) {
      this.passarosSons.play()
    }
    this.passarosPlaying = true
  }

  stopMonstros() {
    this.monstrosSons.pause()
    this.monstrosPlaying = false
  }

  stopPassaros() {
    this.passarosSons.pause()
    this.passarosPlaying = false
  }
}