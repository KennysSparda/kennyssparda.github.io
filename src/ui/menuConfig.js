export default class MenuConfig {
  constructor(gameController, jogoPausado) {
    this.config = gameController.config
    this.gameController = gameController
    this.jogoPausado = jogoPausado

    this.menu = document.getElementById("menuConfig")
    this.btnFechar = document.getElementById("fecharConfig")
    this.btnSalvar = document.getElementById("salvarConfig")
    this.mobileControls = document.querySelector('mobileControls')

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

  toggleMenu() {
    if (this.menu.style.display === "block") {
      this.menu.style.display = "none";
      this.jogoPausado = false; // Retoma o jogo
    } else {
      this.menu.style.display = "block";
      this.jogoPausado = true; // Pausa o jogo
    }
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
        this.toggleMenu()
      }
    })

    this.btnFechar.addEventListener("click", () => this.toggleMenu())

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
      this.toggleMenu()
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