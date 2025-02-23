export default class Sound {
  constructor(mapa, jogador) {
    this.mapa = mapa
    this.jogador = jogador
    
    this.monstrosPlaying = false

    this.passarosPlaying = false
  }

  reprodutor(asset) {
    const reprodutor = document.createElement('video')
    reprodutor.src = asset
    reprodutor.loop = true

    const iniciarVideo = () => {
      reprodutor.play().catch(e => console.warn("Falha ao iniciar vídeo:", e))
      document.removeEventListener("click", iniciarVideo)
    }
    document.addEventListener("click", iniciarVideo)
  }

  playPassaros() {
    this.passarosPlaying = true
    this.reprodutor(assets.passarosSons)
  }
}