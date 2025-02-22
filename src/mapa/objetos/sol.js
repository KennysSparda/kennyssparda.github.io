import * as THREE from 'three'

export default class Sol {
  constructor(scene, tamanho) {
    this.scene = scene
    this.tamanho = tamanho

    this.criarSol()
  }

  criarSol() {
    const geometria = new THREE.SphereGeometry(50, 16, 16)
    this.sol = new THREE.Mesh(geometria, new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff }))
    this.luzSol = new THREE.DirectionalLight(0xffffff, 2)
    this.scene.add(this.sol, this.luzSol)
  }

  atualizar(tempo) {
    const raio = this.tamanho * 2.5
    this.horarioSol = tempo * 0.2
    
    this.sol.position.set(Math.cos(this.horarioSol) * raio, Math.sin(this.horarioSol) * raio, 0)
    this.luzSol.position.copy(this.sol.position)
    
    this.luzSol.intensity = Math.max(0.3, Math.sin(this.horarioSol) * 1.5)
  }
}
