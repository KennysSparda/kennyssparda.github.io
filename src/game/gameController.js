export default class GameController {
  constructor(mundo, renderizador, sounds, config) {
    this.mundo = mundo
    this.renderizador = renderizador
    this.sounds = sounds
    this.config = config
    this.tempo = 0
    this.horarioSol = null

    this.aplicarConfiguracoes()
  }

  aplicarConfiguracoes() {
    this.sounds.atualizarVolume(this.config.volumePrincipal, this.config.volumeMusica)
    this.mundo.sol.atualizarSombras(this.config.qualidadeSombras)
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
    this.aplicarConfiguracoes()
    this.atualizarRelogio()
    this.mundo.sol.atualizar(this.tempo)
    this.mundo.lua.atualizar(this.tempo)
    this.mundo.ceu.atualizarCeoEstrelas(this.horarioSol)
    this.mundo.entidades.gerenciarEntidades(this.horarioSol, jogador)
    this.gerenciarSons()
    this.renderizador.render()
  }
}

