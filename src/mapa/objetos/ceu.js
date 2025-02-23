import * as THREE from 'three'

export default class Ceu {
  constructor(scene, tamanho) {
    this.scene = scene;
    this.tamanho = tamanho;

    this.carregarSkybox();
  }

  carregarSkybox() {
    const loader = new THREE.CubeTextureLoader();
    const arquivos = [
      '/assets/mapa/ceu/ceuDiurno.png', // direita
      '/assets/mapa/ceu/ceuDiurno.png', // esquerda
      '/assets/mapa/ceu/ceuDiurno.png', // cima
      '/assets/mapa/ceu/ceuDiurno.png', // baixo
      '/assets/mapa/ceu/ceuDiurno.png', // frente
      '/assets/mapa/ceu/ceuDiurno.png'  // trás
    ];

    const skyboxTexture = loader.load(arquivos, () => {
      this.scene.background = skyboxTexture;
    });
  }

  carregarSkyboxEstrelas() {
    const loader = new THREE.TextureLoader()
    this.ceuNoturnoTextura = null
    this.ceuDiurnoTextura = null
    
    loader.load(assets.ceuNoturnoTextura, (ceuNoturnoTextura) => {
      this.ceuNoturnoTextura = ceuNoturnoTextura
      this.checkTexturesLoaded()
    })
    loader.load(assets.ceuDiurnoTextura, (ceuDiurnoTextura) => {
      this.ceuDiurnoTextura = ceuDiurnoTextura
      this.checkTexturesLoaded()
    })
  }

  checkTexturesLoaded() {
    if (this.ceuNoturnoTextura && this.ceuDiurnoTextura) {
      
      const geometria = new THREE.BoxGeometry(this.tamanho * 5, this.tamanho * 5, this.tamanho * 5)
      this.materialEstrelas = new THREE.MeshBasicMaterial({
        map: this.ceuNoturnoTextura,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0
      })
      this.materialCeu = new THREE.MeshBasicMaterial({
        map: this.ceuDiurnoTextura,
        side: THREE.BackSide,
        transparent: true,
        opacity: 1
      })
      
      this.skyboxEstrelas = new THREE.Mesh(geometria, this.materialEstrelas)
      this.skyboxCeu = new THREE.Mesh(geometria, this.materialCeu)

      this.scene.add(this.skyboxEstrelas)
      this.scene.add(this.skyboxCeu)
    }
  }

  atualizarCeoEstrelas() {
    if (!this.skyboxEstrelas || !this.skyboxCeu || !this.skyboxEstrelas.material || !this.skyboxCeu.material) return

    const solAltura = Math.sin(this.horarioSol)
    
    this.skyboxEstrelas.material.opacity = solAltura < 0 ? 1 : 1 - solAltura
    this.skyboxCeu.material.opacity = solAltura > 0 ? 1 : 1 + solAltura
  }
}