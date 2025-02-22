import { THREE } from '../etc/imports.js'
import Criaturas from '../criaturas/criaturas.js'
import Sol from './objetos/sol.js'
import Lua from './objetos/lua.js'
import Agua from './objetos/agua.js'
import Terreno from './objetos/terreno.js'

export default class Mapa {
  constructor() {
    this.viewDistanceMin = 0.1
    this.viewDistanceMax = 5000
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, this.viewDistanceMin, this.viewDistanceMax)

    this.tamanho = 100
    this.tamanhoX = this.tamanho
    this.tamanhoZ = this.tamanho

    this.nivelDetalhesMapa = 512
    this.alturaEscala = 2
    this.alturaDaAgua = 0.5

    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(this.renderer.domElement)

    this.carregarSkyboxEstrelas()

    this.terreno = new Terreno(this.scene, this.tamanhoX, this.tamanhoZ, this.nivelDetalhesMapa, this.alturaEscala)
    this.sol = new Sol(this.scene, this.tamanho)
    this.lua = new Lua(this.scene, this.tamanho)
    this.agua = new Agua(this.scene, this.tamanhoX, this.tamanhoZ, 0.6)

    this.criaturas = new Criaturas(this)

    this.tempo = 0
    this.faseLua = 0

    this.luzAmbiente = new THREE.AmbientLight(0x404040, 0.5) 
    this.scene.add(this.luzAmbiente)
  }

  carregarSkyboxEstrelas() {
    const loader = new THREE.TextureLoader()
    this.ceuNoturnoTextura = null
    this.ceuDiurnoTextura = null
   
    loader.load(assets.ceuNoturnoTextura, (ceuNoturnoTextura) => {
      this.ceuNoturnoTextura = ceuNoturnoTextura
      this.checkTexturesLoaded()
    })
    loader.load(assets.ceuDiurnoTextura, (ceuDiurnoTextura) => {
      this.ceuDiurnoTextura = ceuDiurnoTextura
      this.checkTexturesLoaded()
    })
  }

  checkTexturesLoaded() {
    if (this.ceuNoturnoTextura && this.ceuDiurnoTextura) {
     
      const geometria = new THREE.BoxGeometry(this.tamanho * 5, this.tamanho * 5, this.tamanho * 5)
      this.materialEstrelas = new THREE.MeshBasicMaterial({
        map: this.ceuNoturnoTextura,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0
      })
      this.materialCeu = new THREE.MeshBasicMaterial({
        map: this.ceuDiurnoTextura,
        side: THREE.BackSide,
        transparent: true,
        opacity: 1
      })
     
      this.skyboxEstrelas = new THREE.Mesh(geometria, this.materialEstrelas)
      this.skyboxCeu = new THREE.Mesh(geometria, this.materialCeu)

      this.scene.add(this.skyboxEstrelas)
      this.scene.add(this.skyboxCeu)
    }
  }

  atualizarCeoEstrelas() {
    if (!this.skyboxEstrelas || !this.skyboxCeu || !this.skyboxEstrelas.material || !this.skyboxCeu.material) return

    const solAltura = Math.sin(this.horarioSol)
    
    this.skyboxEstrelas.material.opacity = solAltura < 0 ? 1 : 1 - solAltura
    this.skyboxCeu.material.opacity = solAltura > 0 ? 1 : 1 + solAltura
  }

  atualizaRelogio() {
    this.tempo += 0.01
    this.horarioSol = this.tempo * 0.2
  }

  render(player) {
    this.atualizaRelogio()
    this.sol.atualizar(this.tempo)
    this.lua.atualizar(this.tempo)
    this.atualizarCeoEstrelas()
    this.criaturas.gerenciarCriaturas(this.horarioSol)

    if (this.monstros) {
      this.monstros.seguir(player)
    }
    this.renderer.render(this.scene, this.camera)
  }
}
