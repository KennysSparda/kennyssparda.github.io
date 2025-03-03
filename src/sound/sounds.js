export default class Sound {
  constructor(config) {
    this.monstrosSons = this.reprodutor(assets.monstrosSons, true)
    this.monstrosPlaying = false

    this.passarosSons = this.reprodutor(assets.passarosSons, true)
    this.passarosPlaying = false

    this.musicaSons = this.reprodutor(assets.lulaby, true)
    this.musicaPlaying = false
    
    this.volume = config.volumePrincipal
    this.atualizarVolume(config.volumePrincipal, config.volumeMusica)
  }

  reprodutor(asset, loop) {
    const reprodutor = document.createElement('video')
    reprodutor.src = asset
    reprodutor.loop = loop
    reprodutor.volume = this.volume != undefined ? this.volume : 0.1;
    return reprodutor
  }

  atualizarVolume(volumePrincipal, volumeMusica) {
    this.volume = volumePrincipal / 100
    this.volumeMusica = volumeMusica / 100
    this.monstrosSons.volume = this.volume
    this.passarosSons.volume = this.volume
    this.musicaSons.volume = this.volumeMusica
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

  playMusica() {
    if(!this.musicaPlaying) {
      this.musicaSons.play()
    }
    this.musicaPlaying = true
  }

  stopMonstros() {
    this.monstrosSons.pause()
    this.monstrosPlaying = false
  }

  stopPassaros() {
    this.passarosSons.pause()
    this.passarosPlaying = false
  }

  stopMusica() {
    this.musicaSons.pause()
    this.musicaPlaying = false
  }
}