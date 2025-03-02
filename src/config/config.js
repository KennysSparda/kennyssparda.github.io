export default class Config {
  constructor() {
    const savedConfig = JSON.parse(localStorage.getItem("gameConfig")) || {}

    this.distanciaVisao = savedConfig.distanciaVisao ?? 22000
    this.distanciaNevoeiro = savedConfig.distanciaNevoeiro ?? 50000
    this.habilitarSombras = savedConfig.habilitarSombras ?? true
    this.qualidadeSombras = savedConfig.qualidadeSombras ?? 1024
    this.qualidadeTerreno = savedConfig.qualidadeTerreno ?? 1024
    this.densidadeVegetacao = savedConfig.densidadeVegetacao ?? 10
    this.volumePrincipal = savedConfig.volumePrincipal ?? 100
    this.volumeMusica = savedConfig.volumeMusica ?? 100

    this.callbackAtualizacao = null // Callback para aplicar mudanças em tempo real
  }

  definirCallback(callback) {
    this.callbackAtualizacao = callback
  }

  salvarConfiguracao() {
    const configParaSalvar = {
      distanciaVisao: this.distanciaVisao,
      distanciaNevoeiro: this.distanciaNevoeiro,
      habilitarSombras: this.habilitarSombras,
      qualidadeSombras: this.qualidadeSombras,
      qualidadeTerreno: this.qualidadeTerreno,
      densidadeVegetacao: this.densidadeVegetacao,
      volumePrincipal: this.volumePrincipal,
      volumeMusica: this.volumeMusica
    }
  
    localStorage.setItem("gameConfig", JSON.stringify(configParaSalvar))
    console.log("Configurações salvas:", configParaSalvar)
  }

  definirConfiguracao(distanciaVisao, distanciaNevoeiro, habilitarSombras, qualidadeSombras, qualidadeTerreno, densidadeVegetacao, volumePrincipal, volumeMusica) {
    this.distanciaVisao = distanciaVisao
    this.distanciaNevoeiro = distanciaNevoeiro
    this.habilitarSombras = habilitarSombras
    this.qualidadeSombras = qualidadeSombras
    this.qualidadeTerreno = qualidadeTerreno
    this.densidadeVegetacao = densidadeVegetacao
    this.volumePrincipal = volumePrincipal
    this.volumeMusica = volumeMusica

    this.salvarConfiguracao()

    // Chama o callback para atualizar o renderizador em tempo real
    if (this.callbackAtualizacao) {
      this.callbackAtualizacao(this)
    }
  }
}
