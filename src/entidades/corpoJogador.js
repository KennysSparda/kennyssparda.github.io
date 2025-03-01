import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export default class corpoJogador {
  constructor(mapa) {
    this.mapa = mapa
    this.scene = mapa.scene
    this.meshes = []
    this.mixer = []
    this.quantidade = quantidade

    const loader = new GLTFLoader()

    for (let i = 0; i < this.quantidade; i++) {
      loader.load(assets.monstros, (gltf) => {
        const mesh = gltf.scene

        mesh.scale.set(0.5, 0.5, 0.5)

        // Posiciona aleatoriamente no mapa
        const raioMapa = mapa.tamanho / 2
        mesh.position.set(
          (Math.random() - 0.5) * raioMapa * 2,
          0,
          (Math.random() - 0.5) * raioMapa * 2
        )

        // Ajusta a altura conforme o terreno
        mesh.position.y = this.mapa.terreno.obterAlturaTerreno(mesh.position.x, mesh.position.z)

        this.scene.add(mesh)
        this.meshes.push(mesh)

        if (gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(mesh)
          const action = mixer.clipAction(gltf.animations[0])
          action.play()
          this.mixer.push(mixer)
        }
      })
    }
  }

  update(deltaTime) {
    this.mixer.forEach((mixer) => mixer.update(deltaTime))
  }
}
