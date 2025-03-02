import * as THREE from 'three'

export default class Sol {
  constructor(scene, tamanhomundo, tamanhoSol, raioOrbita, qualidadeSombras) {
    this.scene = scene
    this.tamanhomundo = tamanhomundo
    this.tamanho = tamanhoSol
    this.raio = raioOrbita
    this.qualidadeSombras = qualidadeSombras
    this.criarSol()
  }

  criarSol() {
    const geometria = new THREE.SphereGeometry(this.tamanho, 16, 16)
    this.sol = new THREE.Mesh(geometria, new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff }))
    this.sol.castShadow = false;
    this.sol.receiveShadow = false;
    this.luzSol = new THREE.DirectionalLight(0xffffff, 1)
    this.luzSol.castShadow = true;
    this.luzSol.shadow.mapSize.width = this.qualidadeSombras;
    this.luzSol.shadow.mapSize.height = this.qualidadeSombras;
    this.luzSol.shadow.camera.near = 0.1; // Distância mínima pra considerar sombras
    this.luzSol.shadow.camera.far = this.raio * 2; // Ajusta conforme o tamanho do mundo
    this.luzSol.shadow.camera.left = -this.tamanhomundo * 2;
    this.luzSol.shadow.camera.right = this.tamanhomundo * 2;
    this.luzSol.shadow.camera.top = this.tamanhomundo * 2;
    this.luzSol.shadow.camera.bottom = -this.tamanhomundo * 2;

    this.scene.add(this.sol, this.luzSol)
    // const lightHelper = new THREE.DirectionalLightHelper(this.luzSol, 10);
    // const shadowHelper = new THREE.CameraHelper(this.luzSol.shadow.camera);
    // this.scene.add(lightHelper, shadowHelper);
    
  }

  atualizarSombras(qualidadeSombras) {
    this.luzSol.shadow.mapSize.width = qualidadeSombras;
    this.luzSol.shadow.mapSize.height = qualidadeSombras;
    
    // Força a recriação do mapa de sombras
    if (this.luzSol.shadow.map) {
      this.luzSol.shadow.map.dispose(); // Remove o mapa antigo
      this.luzSol.shadow.map = null;    // Evita referências antigas
    }
  
    console.log("Sombras atualizadas para qualidade:", qualidadeSombras);
  }

  atualizar(tempo) {
    const raio = this.raio
    this.horarioSol = tempo * 0.2
    
    this.sol.position.set(Math.cos(this.horarioSol) * raio, Math.sin(this.horarioSol) * raio, 0)
    this.luzSol.position.set(Math.cos(this.horarioSol) * raio, Math.sin(this.horarioSol) * raio, 0);
    this.luzSol.target.position.set(0, 0, 0);
    this.luzSol.target.updateMatrixWorld();
    this.luzSol.intensity = Math.max(0.3, Math.sin(this.horarioSol) * 1.5)
  }
}
