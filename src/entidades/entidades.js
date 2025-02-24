import Monstros from './monstros.js'
import Passaros from './passaros.js'
import Peixes from './peixes.js'
import Plantas from './plantas.js'
import posicoes from './posicoesPlantas.js'



export default class Entidades {
  constructor(mapa) {
    this.mapa = mapa
    this.scene = mapa.scene
    this.passaros = null
    this.monstros = null
    this.peixes = new Peixes(this.mapa)
    
    // Criando diferentes tipos de vegetação
    
    this.arvores = new Plantas(this.mapa, assets.arvore01, 1, true, true)
    if(this.arvores.modeloOriginal) {
      this.adicionarPlantas()
    }
  }

  gerenciarEntidades(horarioSol) {
    const solAltura = Math.sin(horarioSol)
    if (solAltura < 0) {
      if (!this.monstros) {
        this.monstros = new Monstros(this.mapa)
      }
      if(this.passaros) {
        this.passaros.meshes.forEach(mesh => this.scene.remove(mesh))
        this.passaros = null
      }
    }
    if (solAltura > 0) {
      if (!this.passaros) {
        this.passaros = new Passaros(this.mapa)
      }
      if (this.monstros) {
        this.monstros.meshes.forEach(mesh => this.scene.remove(mesh))
        this.monstros = null
      }
    }
  }

  adicionarPlantas() {
    posicoes.forEach(pos => {
      this.arvores.adicionarPlanta(pos);
    });
  }
}