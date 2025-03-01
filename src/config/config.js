export default class Config {
  constructor() {
    // Carregar do localStorage ou definir valores padrões
    const savedConfig = JSON.parse(localStorage.getItem("gameConfig")) || {}

    this.distanciaVisao = savedConfig.distanciaVisao ?? 22000
    this.distanciaNevoeiro = savedConfig.distanciaNevoeiro ?? 50000
    this.habilitarSombras = savedConfig.habilitarSombras ?? true
    this.qualidadeSombras = savedConfig.qualidadeSombras ?? 1024
    this.qualidadeTerreno = savedConfig.qualidadeTerreno ?? 1024
    this.densidadeVegetacao = savedConfig.densidadeVegetacao ?? 10

    this.volumePrincipal = savedConfig.volumePrincipal ?? 100
    this.volumeMusica = savedConfig.volumeMusica ?? 100
  }

  salvarConfiguracao() {
    localStorage.setItem("gameConfig", JSON.stringify(this))
  }

  definirConfiguracao(distanciaVisao, habilitarSombras, qualidadeSombras, qualidadeTerreno, densidadeVegetacao, volumePrincipal, volumeMusica) {
    this.distanciaVisao = distanciaVisao
    this.habilitarSombras = habilitarSombras
    this.qualidadeSombras = qualidadeSombras
    this.qualidadeTerreno = qualidadeTerreno
    this.densidadeVegetacao = densidadeVegetacao
    this.volumePrincipal = volumePrincipal
    this.volumeMusica = volumeMusica

    this.salvarConfiguracao()
  }
}
