import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export default class Peixes {
  constructor(mundo, quantidade = 1) {
    this.mundo = mundo
    this.scene = mundo.scene
    this.nivelMar = mundo.altura
    this.alturaDaAgua = mundo.alturaDaAgua
    this.meshes = []
    this.mixer = []
    this.velocidadeRotacao = 0.5
    this.tempo = 0
    this.quantidade = quantidade

    const loader = new GLTFLoader()

    for (let i = 0; i < this.quantidade; i++) {
      loader.load(assets.peixe01, (gltf) => {
        const mesh = gltf.scene

        mesh.scale.set(0.2, 0.2, 0.2)
        const raiomundo = mundo.tamanho / 2
        const centroX = (Math.random() - 0.5) * raiomundo * 2
        const centroZ = (Math.random() - 0.5) * raiomundo * 2
        mesh.userData.centro = new THREE.Vector3(centroX, Math.random() * 5 + 5, centroZ)
        mesh.userData.raio = Math.random() * 3 + 5 
        mesh.position.set(
          mesh.userData.centro.x + mesh.userData.raio,
          mesh.userData.centro.y,
          mesh.userData.centro.z
        )

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
    this.tempo += deltaTime * this.velocidadeRotacao

    this.meshes.forEach((mesh, index) => {
      const centro = mesh.userData.centro
      const raio = mesh.userData.raio

      const novoX = centro.x + Math.cos(this.tempo + index) * raio
      const novoZ = centro.z - Math.sin(this.tempo + index) * raio

      const direcao = new THREE.Vector3(novoX - mesh.position.x, 0, novoZ - mesh.position.z).normalize()
      mesh.lookAt(novoX + direcao.x, mesh.position.y, novoZ + direcao.z)

      // Aplica a nova posição
      mesh.position.x = novoX
      mesh.position.z = novoZ
      mesh.position.y = this.alturaDaAgua / 2
    })

    this.mixer.forEach((mixer) => mixer.update(deltaTime))
  }
}
