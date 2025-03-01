import Config from "../config/config.js"

export default class MenuConfig {
  constructor(gameController) {
    this.config = gameController.config
    this.menu = document.getElementById("menuConfig")
    this.btnAbrir = document.getElementById("abrirConfig")
    this.btnFechar = document.getElementById("fecharConfig")
    this.btnSalvar = document.getElementById("salvarConfig")

    this.inputs = {
      distanciaVisao: document.getElementById("distanciaVisao"),
      qualidadeSombras: document.getElementById("qualidadeSombras"),
      volumePrincipal: document.getElementById("volumePrincipal"),
      volumeMusica: document.getElementById("volumeMusica"),
    }

    this.carregarValores()
    this.adicionarEventos()
  }

  carregarValores() {
    this.inputs.distanciaVisao.value = this.config.distanciaVisao
    this.inputs.qualidadeSombras.value = this.config.qualidadeSombras
    this.inputs.volumePrincipal.value = this.config.volumePrincipal
    this.inputs.volumeMusica.value = this.config.volumeMusica
  }

  adicionarEventos() {
    this.btnAbrir.addEventListener("click", () => this.menu.style.display = "block")
    this.btnFechar.addEventListener("click", () => this.menu.style.display = "none")

    this.btnSalvar.addEventListener("click", () => {
      this.config.definirConfiguracao(
        parseInt(this.inputs.distanciaVisao.value),
        true, // Sombras ativadas
        parseInt(this.inputs.qualidadeSombras.value),
        1024, // Qualidade do terreno (fixa por enquanto)
        10, // Densidade de vegetação (fixa)
        parseInt(this.inputs.volumePrincipal.value),
        parseInt(this.inputs.volumeMusica.value)
      )

      this.menu.style.display = "none"
    })
  }
}
