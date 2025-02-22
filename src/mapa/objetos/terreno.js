import * as THREE from 'three'

export default class Agua {
  constructor(scene, tamanhoX, tamanhoZ, nivelDetalhes = 100, alturaEscala) {
    this.scene = scene
    this.tamanhoX = tamanhoX
    this.tamanhoZ = tamanhoZ
    this.nivelDetalhes = nivelDetalhes
    this.alturaEscala = alturaEscala

    this.adicionarTerreno()
  }

  adicionarTerreno() {
    const segmentos = this.nivelDetalhes
    
    const geometriaChao = new THREE.PlaneGeometry(this.tamanhoX, this.tamanhoZ, segmentos, segmentos)
    geometriaChao.rotateX(-Math.PI / 2)
  
    const loader = new THREE.TextureLoader()
  
    loader.load(assets.terrenoTopografia, (textura) => {
        this.displacementMap = textura
        
        loader.load(assets.terrenoTextura, (texturaTerreno) => {
            const materialTerreno = new THREE.MeshStandardMaterial({
                map: texturaTerreno, 
                displacementMap: this.displacementMap, 
                displacementScale: this.alturaEscala,
                roughness: 0.8,
                metalness: 0.2,
            })
  
            this.terreno = new THREE.Mesh(geometriaChao, materialTerreno)
            this.terreno.position.set(0, 0, 0)
            this.terreno.name = "terreno" 
            this.scene.add(this.terreno)

            this.alturas = this.processarMapa()
        })
    })
  }

  processarMapa() {
    if (!this.displacementMap || !this.displacementMap.image) {
      return 0
    }
  
    const image = this.displacementMap.image
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
  
    canvas.width = image.width
    canvas.height = image.height
    ctx.drawImage(image, 0, 0)
    
    const width = canvas.width
    const height = canvas.height
  
    const imageData = ctx.getImageData(0, 0, width, height)
    return imageData.data
  }

  obterAlturaTerreno(x, z) {
    if (!this.alturas) {
      return 0
    }

    const width = this.displacementMap.image.width
    const height = this.displacementMap.image.height

    const u = (x / this.tamanhoX + 0.5) * width
    const v = (z / this.tamanhoZ + 0.5) * height
  
    const uClamped = Math.floor(Math.max(0, Math.min(width - 1, u)))
    const vClamped = Math.floor(Math.max(0, Math.min(height - 1, v)))
   
    const index = (vClamped * width + uClamped) * 4

    const intensity = this.alturas[index]

    const altura = (intensity / 255) * this.terreno.material.displacementScale

    return altura
  }
}

