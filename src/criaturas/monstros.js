import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export default class Monstros {
  constructor(mapa) {
    this.mapa = mapa
    this.scene = mapa.scene
    this.mesh = null
    this.mixer = null
    this.velocidade = 0.05

    const loader = new GLTFLoader()
    loader.load(assets.monstros, (gltf) => {
      this.mesh = gltf.scene

      this.mesh.scale.set(0.5, 0.5, 0.5)
      this.mesh.position.set(0, 0, -5) 

      this.scene.add(this.mesh)

      if (gltf.animations.length > 0) {
        this.mixer = new THREE.AnimationMixer(this.mesh)
        const action = this.mixer.clipAction(gltf.animations[0])
        action.play()
      }
    })
  }

  seguir(player) {
    if (!this.mesh) return

    const posicaoPlayer = new THREE.Vector3(player.playerPositionX, player.playerPositionY, player.playerPositionZ)
    const direcao = new THREE.Vector3()
    direcao.subVectors(posicaoPlayer, this.mesh.position).normalize()

    const angulo = Math.atan2(direcao.x, direcao.z)
    this.mesh.rotation.y = angulo

    this.mesh.position.add(direcao.multiplyScalar(this.velocidade))

    const alturaChao = this.mapa.obterAlturaTerreno(this.mesh.position.x, this.mesh.position.z)
    this.mesh.position.y = alturaChao
  }

  update(deltaTime) {
    if (this.mixer) this.mixer.update(deltaTime)
  }
}
