import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export default class meshs {
  constructor(mundo, quantidade = 1) {
    this.mundo = mundo
    this.scene = mundo.scene
    this.meshes = []
    this.mixer = []
    this.velocidade = 0.05
    this.quantidade = quantidade
    this.dano = 1

    const loader = new GLTFLoader()

    for (let i = 0; i < this.quantidade; i++) {
      loader.load(assets.monstros, (gltf) => {
        const mesh = gltf.scene

        mesh.scale.set(0.5, 0.5, 0.5)

        // Posiciona aleatoriamente no mundo
        const raiomundo = mundo.tamanho / 2
        mesh.position.set(
          (Math.random() - 0.5) * raiomundo * 2,
          0,
          (Math.random() - 0.5) * raiomundo * 2
        )

        // Ajusta a altura conforme o terreno
        mesh.position.y = this.mundo.terreno.obterAlturaTerreno(mesh.position.x, mesh.position.z)

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

  seguir(jogador) {
    this.meshes.forEach((mesh) => {
      const posicaoJogador = new THREE.Vector3(jogador.jogadorPositionX, jogador.jogadorPositionY, jogador.jogadorPositionZ)
      const direcao = new THREE.Vector3()
      direcao.subVectors(posicaoJogador, mesh.position).normalize()

      const angulo = Math.atan2(direcao.x, direcao.z)
      mesh.rotation.y = angulo

      mesh.position.add(direcao.multiplyScalar(this.velocidade))

      // Ajustar altura para seguir o terreno
      mesh.position.y = this.mundo.terreno.obterAlturaTerreno(mesh.position.x, mesh.position.z)
    })
  }

  update(deltaTime) {
    this.mixer.forEach((mixer) => mixer.update(deltaTime))
  }
}
