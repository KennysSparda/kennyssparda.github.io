import { THREE } from '../etc/imports.js'
import Terreno from './objetos/terreno.js'
import Ceu from './objetos/ceu.js'
import Sol from './objetos/sol.js'
import Lua from './objetos/lua.js'
import Agua from './objetos/agua.js'
import Criaturas from '../criaturas/criaturas.js'

export default class Mapa {
  constructor() {
    this.scene = new THREE.Scene()
    
    this.tamanho = 100
    this.viewDistanceMax = 20000
    this.tamanhoZ = this.tamanho
    this.nivelDetalhesMapa = 500
    this.alturaEscala = 2
    this.alturaDaAgua = 0.5
    this.viewDistanceMin = 0.1
    this.tamanhoX = this.tamanho
    
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, this.viewDistanceMin, this.viewDistanceMax)
    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(this.renderer.domElement)

    this.terreno = new Terreno(this.scene, this.tamanhoX, this.tamanhoZ, this.nivelDetalhesMapa, this.alturaEscala)
    this.ceu = new Ceu(this.scene, 100)
    this.sol = new Sol(this.scene, this.tamanho, 20)
    this.lua = new Lua(this.scene, this.tamanho, 10)
    this.agua = new Agua(this.scene, this.tamanhoX, this.tamanhoZ, 0.6)
    this.criaturas = new Criaturas(this)

    this.tempo = 0
    this.horarioSol = null

    this.luzAmbiente = new THREE.AmbientLight(0x404040, 0.5) 
    this.scene.add(this.luzAmbiente)
  }

  atualizaRelogio() {
    this.tempo += 0.01
    this.horarioSol = this.tempo * 0.2
  }

  render(player) {
    this.atualizaRelogio()
    this.sol.atualizar(this.tempo)
    this.lua.atualizar(this.tempo)

    this.criaturas.gerenciarCriaturas(this.horarioSol)

    if (this.criaturas.monstros) {
      this.criaturas.monstros.seguir(player)
    }
    this.renderer.render(this.scene, this.camera)
  }
}
