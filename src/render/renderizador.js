// renderizador.js
import { THREE } from '../etc/imports.js'

export default class Renderizador {
  constructor(config) {
    this.config = config
    this.qualidadeTerreno = config.qualidadeTerreno
    this.qualidadeSombras = config.qualidadeSombras
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      config.distanciaVisao
    )
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.scene.fog = new THREE.Fog(0xffffff, config.distanciaNevoeiro - 50, config.distanciaNevoeiro + 50)

    this.setupSombras()

    document.body.appendChild(this.renderer.domElement)

    // Registra callback para atualizações em tempo real
    this.config.definirCallback((novaConfig) => this.atualizarQualidade(novaConfig))
  }

  setupSombras() {
    this.renderer.shadowMap.enabled = this.config.habilitarSombras
    if (this.config.habilitarSombras) {
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
      this.renderer.physicallyCorrectLights = true
    }
  }

  atualizarQualidade(config) {
    this.camera.far = config.distanciaVisao
    this.qualidadeSombra = config.qualidadeSombras
    this.camera.updateProjectionMatrix()

    this.renderer.shadowMap.enabled = config.habilitarSombras
    this.scene.fog.near = config.distanciaNevoeiro - 50
    this.scene.fog.far = config.distanciaNevoeiro + 50

    console.log("Configuração de qualidade aplicada em tempo real:", config)
  }

  render() {
    this.renderer.render(this.scene, this.camera)
  }
}
