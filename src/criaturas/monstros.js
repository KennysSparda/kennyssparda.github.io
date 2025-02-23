import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export default class meshs {
  constructor(mapa, quantidade = 1) {
    this.mapa = mapa
    this.scene = mapa.scene
    this.meshes = []
    this.mixer = []
    this.velocidade = 0.05
    this.quantidade = quantidade
    this.dano = 0.01

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

  seguir(player) {
    this.meshes.forEach((mesh) => {
      const posicaoPlayer = new THREE.Vector3(player.playerPositionX, player.playerPositionY, player.playerPositionZ)
      const direcao = new THREE.Vector3()
      direcao.subVectors(posicaoPlayer, mesh.position).normalize()

      const angulo = Math.atan2(direcao.x, direcao.z)
      mesh.rotation.y = angulo

      mesh.position.add(direcao.multiplyScalar(this.velocidade))

      // Ajustar altura para seguir o terreno
      mesh.position.y = this.mapa.terreno.obterAlturaTerreno(mesh.position.x, mesh.position.z)
    })
  }

  update(deltaTime) {
    this.mixer.forEach((mixer) => mixer.update(deltaTime))
  }
}
