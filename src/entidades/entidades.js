import Monstros from './monstros.js'
import Passaros from './passaros.js'
import Peixes from './peixes.js'
import Plantas from './plantas.js'

const posicoes = [
  { x: -3.6, y: 0.43, z: -0.6 },
  { x: -1.6, y: 0.43, z: 0 },
  { x: -1.05, y: 0.43, z: -1 },
  { x: -1.64, y: 0.43, z: -1.8 },
  { x: -1.45, y: 0.43, z: 0.8 },
  { x: 0.4, y: 0.43, z: -1.5 },
  { x: 0, y: 0.43, z: 1 },
  { x: 2, y: 0.43, z: -2 },
  { x: 3, y: 0.43, z: 0 },
  { x: 3.12, y: 0.43, z: -1 },
  { x: 3.3, y: 0.43, z: 2.4 },
  { x: 4.8, y: 0.43, z: -1 },
  { x: 5.2, y: 0.43, z: 1 },
];

export default class Entidades {
  constructor(mundo) {
    this.mundo = mundo
    this.scene = mundo.scene
    this.passaros = null
    this.monstros = null
    this.peixes = new Peixes(this.mundo)
    
    this.arvores = new Plantas(this.mundo, assets.arvore01, 1, true, true)
    this.plantasAdicionadas = false
  }

  gerenciarEntidades(horarioSol, jogador) {
    
    if (this.monstros) {
      this.monstros.seguir(jogador)
    }

    if(this.arvores.modeloOriginal && !this.plantasAdicionadas) {
      this.plantasAdicionadas = true 
      this.adicionarPlantas()
    }
    const solAltura = Math.sin(horarioSol)
    if (solAltura < 0) {
      if (!this.monstros) {
        this.monstros = new Monstros(this.mundo)
      }
      if(this.passaros) {
        this.passaros.meshes.forEach(mesh => this.scene.remove(mesh))
        this.passaros = null
      }
    }
    if (solAltura > 0) {
      if (!this.passaros) {
        this.passaros = new Passaros(this.mundo)
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