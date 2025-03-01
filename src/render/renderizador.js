// renderizador.js
import { THREE } from '../etc/imports.js'

export default class Renderizador {
  constructor(config) {
    this.habilitarSombras = config.habilitarSombras

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      config.distanciaVisao
    )
    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.scene.fog = new THREE.Fog(0xffffff, config.distanciaNevoeiro - 50, config.distanciaNevoeiro + 50);

    this.setupSombras()
  }

  setupSombras() {
    this.renderer.shadowMap.enabled = this.habilitarSombras
    if(this.habilitarSombras) {
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
      this.renderer.physicallyCorrectLights = true
    }
    document.body.appendChild(this.renderer.domElement)
  }

  render() {
    this.renderer.render(this.scene, this.camera)
  }
}
