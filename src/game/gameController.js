// gameController.js
export default class GameController {
  constructor(mundo, renderizador, sounds) {
    this.mundo = mundo
    this.renderizador = renderizador
    this.sounds = sounds
    this.tempo = 0
    this.horarioSol = null
  }

  atualizarRelogio() {
    this.tempo += 0.01
    this.horarioSol = this.tempo * 0.2
  }

  gerenciarSons() {
    const solAltura = Math.sin(this.horarioSol)
    if (solAltura < 0) {
      this.sounds.stopPassaros()
    } else {
      this.sounds.playPassaros()
      this.sounds.stopMonstros()
    }
  }

  atualizar(jogador) {
    this.atualizarRelogio()
    this.mundo.sol.atualizar(this.tempo)
    this.mundo.lua.atualizar(this.tempo)
    this.mundo.ceu.atualizarCeoEstrelas(this.horarioSol)
    this.mundo.entidades.gerenciarEntidades(this.horarioSol, jogador)
    this.gerenciarSons()
    this.renderizador.render()
  }
}

