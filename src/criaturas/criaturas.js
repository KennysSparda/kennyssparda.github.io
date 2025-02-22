import Monstros from '../criaturas/monstros.js'
import Passaros from '../criaturas/passaros.js'

export default class gerenciarCriaturas {
  constructor(mapa) {
    this.mapa = mapa
    this.scene = mapa.scene
    this.passaros = null
    this.monstros = null
  }

  gerenciarCriaturas(horarioSol) {
    const solAltura = Math.sin(horarioSol)
    // Criar Monstros à noite
    if (solAltura < 0) {
      if (!this.monstros) {
        this.monstros = new Monstros(this.mapa)
      }
      if(this.passaros) {
        this.passaros.meshes.forEach(mesh => this.scene.remove(mesh))
        this.passaros = null
      }
    }
    // Remover Monstros ao amanhecer
    if (solAltura > 0) {
      if (!this.passaros) {
        this.passaros = new Passaros(this.mapa)
      }
      if (this.monstros) {
        this.scene.remove(this.monstros.mesh)
        this.monstros = null
      }
    }
  }
}