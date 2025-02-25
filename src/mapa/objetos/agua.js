import * as THREE from 'three'

export default class Agua {
  constructor(scene, tamanhoX, tamanhoZ, multiplicadorTamanho, alturaAgua) {
    this.scene = scene
    this.tamanhoX = tamanhoX
    this.tamanhoZ = tamanhoZ
    this.multiplicadorTamanho = multiplicadorTamanho
    this.alturaDaAgua = alturaAgua
    this.adicionarAgua()
  }

  adicionarAgua() {
    this.videoAgua = document.createElement("video")
    this.videoAgua.src = assets.aguaTextura 
    this.videoAgua.playbackRate = 0.6
    this.videoAgua.loop = true
    this.videoAgua.muted = true

    this.texturaAgua = new THREE.VideoTexture(this.videoAgua)
    this.texturaAgua.minFilter = THREE.LinearFilter
    this.texturaAgua.magFilter = THREE.LinearFilter
    this.texturaAgua.wrapS = THREE.RepeatWrapping
    this.texturaAgua.wrapT = THREE.RepeatWrapping
    this.texturaAgua.repeat.set(this.tamanhoX / 2, this.tamanhoZ / 2)

    const geometriaAgua = new THREE.PlaneGeometry(this.tamanhoX * this.multiplicadorTamanho, this.tamanhoZ * this.multiplicadorTamanho)
    const materialAgua = new THREE.MeshStandardMaterial({
      map: this.texturaAgua,
      transparent: true,
      opacity: 0.8,
      roughness: 0.4,
      metalness: 0.6
    })
  
    this.agua = new THREE.Mesh(geometriaAgua, materialAgua)
    this.agua.rotation.x = -Math.PI / 2
    this.agua.position.y = this.alturaDaAgua
  
    this.scene.add(this.agua)

    const iniciarVideo = () => {
        this.videoAgua.play().catch(e => console.warn("Falha ao iniciar vídeo:", e))
        document.removeEventListener("click", iniciarVideo)
    }
    document.addEventListener("click", iniciarVideo)
  }
}


  

