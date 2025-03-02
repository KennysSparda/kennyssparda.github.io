export default class MobileControls {
  constructor(jogador) {
    this.jogador = jogador
    this.controles = {
      frente: document.getElementById("btnUp"),
      tras: document.getElementById("btnDown"),
      esquerda: document.getElementById("btnLeft"),
      direita: document.getElementById("btnRight"),
      pular: document.getElementById("btnJump"),
      correr: document.getElementById("btnRun"),
    }

    this.adicionarEventos()
  }

  adicionarEventos() {
    let touchStartX = 0
    let touchStartY = 0
    
    document.addEventListener("touchstart", (event) => {
      touchStartX = event.touches[0].clientX
      touchStartY = event.touches[0].clientY
    })
    
    document.addEventListener("touchmove", (event) => {
      const touchEndX = event.touches[0].clientX
      const touchEndY = event.touches[0].clientY
    
      const deltaX = touchEndX - touchStartX
      const deltaY = touchEndY - touchStartY
    
      this.jogador.movimentoTouch(deltaX, deltaY)
    
      touchStartX = touchEndX
      touchStartY = touchEndY
    })

    Object.keys(this.controles).forEach((acao) => {
      this.controles[acao].addEventListener("touchstart", () => this.ativarMovimento(acao))
      this.controles[acao].addEventListener("touchend", () => this.desativarMovimento(acao))
    })
  }

  ativarMovimento(acao) {
    if (acao === "pular") {
      if (!this.jogador.movimentos.pulando) {
        this.jogador.velocidadeY = this.jogador.forcaPulo
        this.jogador.movimentos.pulando = true
        this.jogador.movimentos.agachando = false
      }
    } else if (acao === "correr") {
      this.jogador.movimentos.correndo = true
    } else {
      this.jogador.movimentos[acao] = true
    }
  }

  desativarMovimento(acao) {
    if (acao === "correr") {
      this.jogador.movimentos.correndo = false
    } else {
      this.jogador.movimentos[acao] = false
    }
  }
}
