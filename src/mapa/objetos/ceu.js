import * as THREE from 'three';

export default class Ceu {
  constructor(scene, tamanhoMapa, multiplicadorTamanho) {
    this.scene = scene;
    this.tamanhoMapa = tamanhoMapa;
    this.multiplicadorTamanho = multiplicadorTamanho;
    this.ceuTexture = null;

    this.gerarTexturaCeu(0); // Começa com o céu noturno
    this.carregarSkybox();
    this.carregarSkyboxEstrelas();
  }

  carregarSkyboxEstrelas() {
    const loader = new THREE.TextureLoader();
    this.ceuNoturnoTextura = null;
    this.ceuDiurnoTextura = null;
    
    loader.load(assets.ceuNoturnoTextura, (texture) => {
      this.ceuNoturnoTextura = texture;
      this.checkTexturesLoaded();
    });
    loader.load(assets.ceuDiurnoTextura, (texture) => {
      this.ceuDiurnoTextura = texture;
      this.checkTexturesLoaded();
    });
  }

  checkTexturesLoaded() {
    if (this.ceuNoturnoTextura && this.ceuDiurnoTextura) {
      const geometria = new THREE.BoxGeometry(
        this.tamanhoMapa * this.multiplicadorTamanho,
        this.tamanhoMapa * this.multiplicadorTamanho,
        this.tamanhoMapa * this.multiplicadorTamanho
      );
      this.materialEstrelas = new THREE.MeshBasicMaterial({
        map: this.ceuNoturnoTextura,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0
      });
      this.materialNuvens = new THREE.MeshBasicMaterial({
        map: this.ceuDiurnoTextura,
        side: THREE.BackSide,
        transparent: true,
        opacity: 1
      });
      
      this.skyboxEstrelas = new THREE.Mesh(geometria, this.materialEstrelas);
      this.skyboxNuvens = new THREE.Mesh(geometria, this.materialNuvens);

      this.scene.add(this.skyboxEstrelas);
      this.scene.add(this.skyboxNuvens);
    }
  }

  lerpCor(corA, corB, t) {
    return new THREE.Color(
      corA.r + (corB.r - corA.r) * t,
      corA.g + (corB.g - corA.g) * t,
      corA.b + (corB.b - corA.b) * t
    );
  }
  
  gerarTexturaCeu(horarioSol) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 512;
  
    const solAltura = Math.sin(horarioSol); // -1 (meia-noite), 0 (amanhecer/anoitecer), 1 (meio-dia)
  
    let corNoite = new THREE.Color(0x000000);  // Preto total (meia-noite)
    let corAzulNoite = new THREE.Color(0x000000);  // Azul escuro antes do amanhecer
    let corCrepusculo = new THREE.Color(0xff8c42); // Laranja do pôr/nascer do sol
    let corDia = new THREE.Color(0x87CEFF);   // Azul celeste do meio-dia
  
    let corTopo, corHorizonte;
  
    if (solAltura < -0.9) {
      // Noite profunda → Preto total
      corTopo = corHorizonte = corNoite;
    } else if (solAltura < -0.3) {
      // Transição mais suave do preto para azul escuro
      let t = (solAltura + 1) / 0.6;
      corTopo = this.lerpCor(corNoite, corAzulNoite, t);
      corHorizonte = this.lerpCor(corNoite, corAzulNoite, t);
    } else if (solAltura < 0.1) {
      // Amanhecer/Anoitecer → Azul escuro para laranja
      let t = (solAltura + 0.3) / 0.4;
      corTopo = this.lerpCor(corAzulNoite, corDia, t);
      corHorizonte = this.lerpCor(corNoite, corCrepusculo, t);
    } else {
      // Durante o dia → Azul claro no topo, laranja suave no horizonte
      let t = (solAltura - 0.1) / 0.9;
      corTopo = corDia;
      corHorizonte = this.lerpCor(corCrepusculo, corDia, t);
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
    const geometria = new THREE.SphereGeometry(
      this.tamanhoMapa * this.multiplicadorTamanho,
      32,
      32
    );
    this.materialCeu = new THREE.MeshBasicMaterial({
      map: this.ceuTexture,
      side: THREE.BackSide,
      transparent: true
    });
    this.skyboxCeu = new THREE.Mesh(geometria, this.materialCeu);
    this.scene.add(this.skyboxCeu);
  }

  atualizarCeoEstrelas(horarioSol) {
    if (!this.skyboxEstrelas || !this.skyboxNuvens || !this.skyboxCeu) return;

    const solAltura = Math.sin(horarioSol);

    if (solAltura > 0) {
      this.skyboxEstrelas.material.opacity = 1 - solAltura;
      this.skyboxNuvens.material.opacity = solAltura;
    }
    this.gerarTexturaCeu(horarioSol);
    this.skyboxCeu.material.map = this.ceuTexture;
    this.skyboxCeu.material.map.needsUpdate = true;
  }
}
