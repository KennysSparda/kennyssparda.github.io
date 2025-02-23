import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export default class Passaros {
  constructor(mapa, quantidadeBandos = 10) {
    this.mapa = mapa
    this.scene = mapa.scene
    this.meshes = []
    this.mixer = []
    this.velocidadeRotacao = 0.5
    this.tempo = 0
    this.quantidadeBandos = quantidadeBandos

    const loader = new GLTFLoader()

    for (let i = 0; i < this.quantidadeBandos; i++) {
      loader.load(assets.passaros, (gltf) => {
        const mesh = gltf.scene

        mesh.scale.set(0.5, 0.5, 0.5)
        const raioMapa = mapa.tamanho / 2
        const centroX = (Math.random() - 0.5) * raioMapa * 2
        const centroZ = (Math.random() - 0.5) * raioMapa * 2
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
      const angulo = -(this.tempo + index)
      const novoX = centro.x + Math.cos(angulo) * raio
      const novoZ = centro.z + Math.sin(angulo) * raio
      const direcao = new THREE.Vector3(mesh.position.x - novoX, 0, mesh.position.z - novoZ).normalize()
      mesh.lookAt(mesh.position.x + direcao.x, mesh.position.y, mesh.position.z + direcao.z)
      mesh.position.set(novoX, mesh.position.y, novoZ)
    })

    this.mixer.forEach((mixer) => mixer.update(deltaTime))
  }
}
