import Monstros from './monstros.js'
import Passaros from './passaros.js'
import Peixes from './peixes.js'
import Plantas from './plantas.js'

const posicoes = [
  { x: 0, y: 3.9, z: 0 },
  { x: 4.96 , y: 3, z: -7.65 },
  { x: -1 , y: 4, z: -2.68 },
  { x: 2.66 , y: 3, z: -6.26 },
  { x: 0 , y: 3, z: -9.26 },
  { x: 2.14 , y: 2, z: -12.36 },
  { x: 4.15 , y: 3.3, z: -5 },
  { x: 4.15 , y: 2.6 , z: 4 },
  { x: 4.15 , y: 2.6 , z: 4 },
  { x: -2.35 , y: 3.6 , z: 3.66 },
  { x: -1 , y: 2.3 , z: 6 },
  { x: 7.10 , y: 2.3 , z: -3.78 },
  { x: 6.10 , y: 2.3 , z: -1.78 },
  { x: 3.30 , y: 3.65 , z: 0.78 },
  
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