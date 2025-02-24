import * as THREE from 'three';

export default class Ceu {
  constructor(scene, tamanhoMapa, multiplicadorTamanho) {
    this.scene = scene;
    this.tamanhoMapa = tamanhoMapa;
    this.multiplicadorTamanho = multiplicadorTamanho;
    this.ceuTexture = null;

    this.gerarTexturaCeu(0); // Começa com o céu noturno
    this.carregarSkybox();
    this.carregarSkyboxEstrelas()
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
      
      const geometria = new THREE.BoxGeometry(this.tamanhoMapa * this.multiplicadorTamanho, this.tamanhoMapa * this.multiplicadorTamanho, this.tamanhoMapa * this.multiplicadorTamanho)
      this.materialEstrelas = new THREE.MeshBasicMaterial({
        map: this.ceuNoturnoTextura,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0
      })
      this.materialNuvens = new THREE.MeshBasicMaterial({
        map: this.ceuDiurnoTextura,
        side: THREE.BackSide,
        transparent: true,
        opacity: 1
      })
      
      this.skyboxEstrelas = new THREE.Mesh(geometria, this.materialEstrelas)
      this.skyboxNuvens = new THREE.Mesh(geometria, this.materialNuvens)

      this.scene.add(this.skyboxEstrelas)
      this.scene.add(this.skyboxNuvens)
    }
  }

  gerarTexturaCeu(horarioSol) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 512;

    const solAltura = Math.sin(horarioSol); // -1 (meia-noite), 0 (amanhecer/anoitecer), 1 (meio-dia)

    let corNoite = new THREE.Color(0x000000);  // Preto total (meia-noite)
    let corAzulNoite = new THREE.Color(0x0a0a3233);  // Azul escuro antes do amanhecer
    let corCrepusculo = new THREE.Color(0xff8c42); // Laranja do pôr/nascer do sol
    let corDia = new THREE.Color(0x87CEFF);   // Azul celeste do meio-dia

    let corTopo, corHorizonte;

    if (solAltura < -0.8) {
      // Noite profunda → Preto total
      corTopo = corNoite;
      corHorizonte = corNoite;
    } else if (solAltura < -0.2) {
      // Do meio da noite até antes do amanhecer → Vai clareando para azul escuro
      corTopo = corNoite.lerp(corAzulNoite, (solAltura + 1) / 0.6);
      corHorizonte = corNoite.lerp(corAzulNoite, (solAltura + 1) / 0.6);
    } else if (solAltura < 0.2) {
      // Amanhecer e Anoitecer → Mistura laranja no horizonte e azul escuro no topo
      corTopo = corAzulNoite.lerp(corDia, (solAltura + 0.2) / 0.4);
      corHorizonte = corNoite.lerp(corCrepusculo, (solAltura + 0.2) / 0.4);
    } else {
      // Dia → Azul celeste no topo e um leve laranja no horizonte
      corTopo = corDia;
      corHorizonte = corCrepusculo.lerp(corDia, (solAltura - 0.2) / 0.8);
    }

    const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
    gradient.addColorStop(0, `#${corHorizonte.getHexString()}`); // Horizonte
    gradient.addColorStop(1, `#${corTopo.getHexString()}`); // Topo do céu

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    this.ceuTexture = texture;
  }

  carregarSkybox() {
    const geometria = new THREE.SphereGeometry(this.tamanhoMapa * this.multiplicadorTamanho, 32, 32);
    this.materialCeu = new THREE.MeshBasicMaterial({
      map: this.ceuTexture,
      side: THREE.BackSide,
      transparent: true
    });

    this.skyboxCeu = new THREE.Mesh(geometria, this.materialCeu);
    this.scene.add(this.skyboxCeu);
  }

  atualizarCeoEstrelas(horarioSol) {
    if (!this.skyboxEstrelas || !this.skyboxNuvens || !this.skyboxEstrelas.material || !this.skyboxNuvens.material || !this.skyboxCeu) return

    const solAltura = Math.sin(horarioSol)

    if (solAltura > 0) {
      // dia
      this.skyboxEstrelas.material.opacity = 1 - solAltura
      this.skyboxNuvens.material.opacity = 0 + solAltura
    } 
    this.gerarTexturaCeu(horarioSol); // Atualiza o degradê conforme o sol muda
    this.skyboxCeu.material.map = this.ceuTexture;
    this.skyboxCeu.material.map.needsUpdate = true;
  }
}
