export default class Sound {
  constructor(mapa, player) {
    this.mapa = mapa
    this.player = player
    
    this.monstros = null
    this.monstrosPlaying = false
    this.passaros = assets.passaroSom
    this.passarosPlaying = false
  }

  player(asset) {
    const player = document.createElement('video')
    player.src = asset
    player.loop = true

    const iniciarVideo = () => {
      player.play().catch(e => console.warn("Falha ao iniciar vídeo:", e))
      document.removeEventListener("click", iniciarVideo)
    }
    document.addEventListener("click", iniciarVideo)
  }

  playPassaroSom() {
    this.passarosPlaying = true
    player(assets.passaroSom)
  }
}