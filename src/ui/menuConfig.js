export default class MenuConfig {
  constructor(gameController) {
    this.config = gameController.config
    this.gameController = gameController
    this.menu = document.getElementById("menuConfig")
    this.btnFechar = document.getElementById("fecharConfig")
    this.btnSalvar = document.getElementById("salvarConfig")

    this.inputs = {
      distanciaVisao: document.getElementById("distanciaVisao"),
      distanciaNevoeiro: document.getElementById("distanciaNevoeiro"),
      qualidadeSombras: document.getElementById("qualidadeSombras"),
      volumePrincipal: document.getElementById("volumePrincipal"),
      volumeMusica: document.getElementById("volumeMusica"),
      qualidadeTerreno: document.getElementById("qualidadeTerreno"),
      densidadeVegetacao: document.getElementById("densidadeVegetacao"),
      habilitarSombras: document.getElementById("habilitarSombras")
    }

    this.carregarValores()
    this.adicionarEventos()
    this.menu.style.display = "none"
  }

  carregarValores() {
    this.inputs.distanciaVisao.value = this.config.distanciaVisao
    this.inputs.distanciaNevoeiro.value = this.config.distanciaNevoeiro
    this.inputs.qualidadeSombras.value = this.config.qualidadeSombras
    this.inputs.volumePrincipal.value = this.config.volumePrincipal
    this.inputs.volumeMusica.value = this.config.volumeMusica
    this.inputs.qualidadeTerreno.value = this.config.qualidadeTerreno
    this.inputs.densidadeVegetacao.value = this.config.densidadeVegetacao
    this.inputs.habilitarSombras.checked = this.config.habilitarSombras
  }

  adicionarEventos() {
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        this.menu.style.display = this.menu.style.display === "block" ? "none" : "block"
      }
    })
    this.btnFechar.addEventListener("click", () => this.menu.style.display = "none")


    this.inputs.qualidadeTerreno.addEventListener("input", () => {
      const novoNivelDetalhes = parseInt(this.inputs.qualidadeTerreno.value)
      this.config.qualidadeTerreno = novoNivelDetalhes
      this.gameController.mundo.atualizarQualidadeTerreno(novoNivelDetalhes)
    })

    // Atualiza o volume em tempo real
    this.inputs.volumePrincipal.addEventListener("input", () => {
      this.config.volumePrincipal = parseInt(this.inputs.volumePrincipal.value)
      this.gameController.sounds.atualizarVolume(this.config.volumePrincipal, this.config.volumeMusica)
    })

    this.inputs.volumeMusica.addEventListener("input", () => {
      this.config.volumeMusica = parseInt(this.inputs.volumeMusica.value)
      this.gameController.sounds.atualizarVolume(this.config.volumePrincipal, this.config.volumeMusica)
    })
    
    this.btnSalvar.addEventListener("click", () => {
      this.config.definirConfiguracao(
        parseInt(this.inputs.distanciaVisao.value),
        parseInt(this.inputs.distanciaNevoeiro.value),
        this.inputs.habilitarSombras.checked,
        parseInt(this.inputs.qualidadeSombras.value),
        parseInt(this.inputs.qualidadeTerreno.value),
        parseInt(this.inputs.densidadeVegetacao.value),
        parseInt(this.inputs.volumePrincipal.value),
        parseInt(this.inputs.volumeMusica.value)
      )
    
      this.menu.style.display = "none"
    })
  }
}
