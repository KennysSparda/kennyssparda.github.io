export default class Config {
  constructor() {
    // Qualidade gráfica
    this.distanciaVisao = 22000
    this.habilitarSombras = true
    this.qualidadeSombras = 1024
    this.qualidadeTerreno = 1024
    this.densidadeVegetacao = 10

    // Audio
    this.volumePrincipal = 100
    this.volumeMusica = 100
  }

  definirConfiguracao(distanciaVisao, habilitarSombras, qualidadeSombras, qualidadeTerreno, densidadeVegetacao, volumePrincipal, volumeMusica) {
    this.distanciaVisao = distanciaVisao
    this.habilitarSombras = habilitarSombras
    this.qualidadeSombras = qualidadeSombras
    this.qualidadeTerreno = qualidadeTerreno
    this.densidadeVegetacao = densidadeVegetacao
    this.volumePrincipal = volumePrincipal
    this.volumeMusica = volumeMusica
  }
}

