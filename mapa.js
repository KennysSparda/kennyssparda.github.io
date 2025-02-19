class Mapa {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);


    this.carregarSkyboxEstrelas();
    this.adicionarChao();
    this.adicionarSolELua();

    this.tempo = 0;
    this.faseLua = 0;
  }


  carregarSkyboxEstrelas() {
    const loader = new THREE.TextureLoader();
    this.texturaEstrelas = null;
    this.texturaCeu = null;

   
    loader.load('/assets/estrelas.png', (texturaEstrelas) => {
      this.texturaEstrelas = texturaEstrelas;
      this.checkTexturesLoaded();
    });
    loader.load('/assets/ceu.png', (texturaCeu) => {
      this.texturaCeu = texturaCeu;
      this.checkTexturesLoaded();
    });
  }

  checkTexturesLoaded() {
    if (this.texturaEstrelas && this.texturaCeu) {
     
      const geometria = new THREE.BoxGeometry(300, 300, 300);
      this.materialEstrelas = new THREE.MeshBasicMaterial({
        map: this.texturaEstrelas,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0
      });
      this.materialCeu = new THREE.MeshBasicMaterial({
        map: this.texturaCeu,
        side: THREE.BackSide,
        transparent: true,
        opacity: 1
      });

     
      this.skyboxEstrelas = new THREE.Mesh(geometria, this.materialEstrelas);
      this.skyboxCeu = new THREE.Mesh(geometria, this.materialCeu);

      this.scene.add(this.skyboxEstrelas);
      this.scene.add(this.skyboxCeu);
    }
  }

  adicionarSolELua() {
    const geometria = new THREE.SphereGeometry(5, 16, 16);

    const materialSol = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1 });
    const materialLua = new THREE.MeshStandardMaterial({ color: 0xaaaa00, emissive: 0xccccaa, emissiveIntensity: 0.5 });

    this.sol = new THREE.Mesh(geometria, materialSol);
    this.lua = new THREE.Mesh(geometria, materialLua);

    this.luzSol = new THREE.DirectionalLight(0xffffff, 3.5);
    this.luzLua = new THREE.DirectionalLight(0x555555, 1);

    this.luzSol.castShadow = true;
    this.luzLua.castShadow = true;

    this.scene.add(this.sol, this.lua, this.luzSol, this.luzLua);
  }

  atualizarSolELua() {
    if (!this.skyboxEstrelas || !this.skyboxCeu) {
      return;
    }

    this.tempo += 0.01;
    const raio = 100;

   
    const horarioSol = this.tempo * 0.2;
    const horarioLua = this.tempo * 0.2 + Math.PI;

   
    this.sol.position.set(Math.cos(horarioSol) * raio, Math.sin(horarioSol) * raio, 0);
    this.lua.position.set(Math.cos(horarioLua) * raio, Math.sin(horarioLua) * raio, 0);

   
    this.luzSol.position.copy(this.sol.position);
    this.luzLua.position.copy(this.lua.position);

   
    this.faseLua = Math.sin(this.tempo * 0.1) * 0.5 + 0.5;

   
    this.lua.material.opacity = this.faseLua;
    this.lua.material.reflectivity = this.faseLua;

    this.luzSol.intensity = Math.max(0, Math.sin(horarioSol) * 1.5);
    this.luzLua.intensity = Math.max(0, Math.sin(horarioLua) * 0.5);

   
    const solAltura = Math.sin(horarioSol);

   
    if (solAltura > 0) {
      const alpha = Math.min(solAltura, 1);
      this.skyboxEstrelas.material.opacity = 1 - alpha;
      this.skyboxEstrelas.material.transparent = true;
      this.skyboxCeu.material.opacity = alpha;
      this.skyboxCeu.material.transparent = false;
    } else {
      const alpha = Math.min(-solAltura, 1);
      this.skyboxEstrelas.material.opacity = alpha;
      this.skyboxEstrelas.material.transparent = false;
      this.skyboxCeu.material.opacity = 1 - alpha;
      this.skyboxCeu.material.transparent = true;
    }
  }

  adicionarChao() {
    const largura = 10;
    const altura = 10;
    const segmentos = 50;
    
    const geometriaChao = new THREE.PlaneGeometry(largura, altura, segmentos, segmentos);
    geometriaChao.rotateX(-Math.PI / 2);
  
   
    const loader = new THREE.TextureLoader();
    this.displacementMap = loader.load('/assets/chaoRuido.png');
  
   
    const texturaChao = loader.load('/assets/chao.png');
  
   
    const materialChao = new THREE.MeshStandardMaterial({
      map: texturaChao, 
      displacementMap: this.displacementMap, 
      displacementScale: 2,
      roughness: 0.8,
      metalness: 0.2,
    });
  
   
    this.chao = new THREE.Mesh(geometriaChao, materialChao);
    this.chao.position.set(0, -5, 0);
    this.chao.name = "chao"; 
    this.scene.add(this.chao);
  }


  obterAlturaTerreno(x, z) {
    if (!this.displacementMap || !this.displacementMap.image) {
      console.warn("Displacement map não carregado.");
      return 0;
    }
  
    console.log("DisplacementMap Image:", this.displacementMap.image);
  
    const image = this.displacementMap.image;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
  
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    
    const width = canvas.width;
    const height = canvas.height;
  
    const u = (x / 10 + 0.5) * width;
    const v = (z / 10 + 0.5) * height;
  
    const uClamped = Math.floor(Math.max(0, Math.min(width - 1, u)));
    const vClamped = Math.floor(Math.max(0, Math.min(height - 1, v)));
  
   
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
  
   
    const index = (vClamped * width + uClamped) * 4;

    const intensity = data[index];

    const altura = (intensity / 255) * this.chao.material.displacementScale;

    return altura - 4.5;
  }
  
  render() {
    this.atualizarSolELua();
    this.renderer.render(this.scene, this.camera);
  }
}
