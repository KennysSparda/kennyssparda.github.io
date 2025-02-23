import * as THREE from 'three'

export default class Lua {
  constructor(scene, tamanhoMapa, tamanhoLua) {
    this.scene = scene
    this.tamanhoMapa = tamanhoMapa
    this.tamanho = tamanhoLua
    this.segmentos = 200
    this.carregarTexturas()
    this.criarLua()
    this.criarLuzRefletida()
  }

  carregarTexturas() {
    const loader = new THREE.TextureLoader()
    this.textura = loader.load(assets.luaTextura)
    this.normalMap = loader.load(assets.luaTopografia)
  }

  criarLua() {
    const geometria = new THREE.SphereGeometry(this.tamanho, this.segmentos,this.segmentos)
    this.material = new THREE.MeshPhongMaterial({
      map: this.textura
    })

    this.lua = new THREE.Mesh(geometria, this.material)
    this.scene.add(this.lua)
  }

  criarLuzRefletida() {
    this.luzRefletida = new THREE.DirectionalLight(0xffffff, 0.3)
    this.scene.add(this.luzRefletida)
  }

  atualizar(tempo) {
    const raioOrbita = this.tamanhoMapa / 2 
    const angulo = tempo * 0.2 + Math.PI

    this.lua.position.set(Math.cos(angulo) * raioOrbita, Math.sin(angulo) * raioOrbita, 0)

    this.luzRefletida.position.copy(this.lua.position)
    this.luzRefletida.target.position.set(0, 0, 0)
    this.luzRefletida.target.updateMatrixWorld()
  }
}
