class Mapa {
  constructor() {
    this.viewDistanceMin = 0.1
    this.viewDistanceMax = 1000
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, this.viewDistanceMin, this.viewDistanceMax);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.carregarSkyboxEstrelas();
    this.adicionarChao();
    this.adicionarSolELua();
    this.adicionarAgua()
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
    this.sol = new THREE.Mesh(geometria, new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff }));
    this.lua = new THREE.Mesh(geometria, new THREE.MeshStandardMaterial({ color: 0xaaaaaa, emissive: 0x888888 }));
    
    this.luzSol = new THREE.DirectionalLight(0xffffff, 2);
    this.luzLua = new THREE.DirectionalLight(0x555555, 0.8);
    
    this.luzSol.target = new THREE.Object3D();
    this.luzLua.target = new THREE.Object3D();
    this.scene.add(this.luzSol.target, this.luzLua.target);
    
    this.luzAmbiente = new THREE.AmbientLight(0xffffff, 0.2);
    this.scene.add(this.luzAmbiente, this.sol, this.lua, this.luzSol, this.luzLua);
  }

  atualizarSolELua() {
    this.tempo += 0.01;
    const raio = 100;
    
    const horarioSol = this.tempo * 0.2;
    const horarioLua = this.tempo * 0.2 + Math.PI;

    this.sol.position.set(Math.cos(horarioSol) * raio, Math.sin(horarioSol) * raio, 0);
    this.lua.position.set(Math.cos(horarioLua) * raio, Math.sin(horarioLua) * raio, 0);
    
    this.luzSol.position.copy(this.sol.position);
    this.luzLua.position.copy(this.lua.position);
    
    this.luzSol.target.position.copy(this.camera.position);
    this.luzLua.target.position.copy(this.camera.position);
    this.luzSol.target.updateMatrixWorld();
    this.luzLua.target.updateMatrixWorld();

    this.luzSol.intensity = Math.max(0.3, Math.sin(horarioSol) * 1.5);
    this.luzLua.intensity = Math.max(0.3, Math.sin(horarioLua) * 0.8);

    if (this.skyboxEstrelas && this.skyboxEstrelas.material && this.skyboxCeu && this.skyboxCeu.material) {
      const solAltura = Math.sin(horarioSol);
      this.skyboxEstrelas.material.opacity = solAltura < 0 ? 1 : 1 - solAltura;
      this.skyboxCeu.material.opacity = solAltura > 0 ? 1 : 1 + solAltura;
      // Cria a criatura apenas uma vez quando anoitece
      if (solAltura < 0 && !this.criatura) {
        this.criatura = new Criatura(this.scene);
      }
      // Remove a criatura ao amanhecer
      if (solAltura > 0 && this.criatura) {
        this.scene.remove(this.criatura.mesh); // Remove da cena
        this.criatura = null; // Reseta a variável para poder recriar depois
      }
    }
  }

  adicionarChao() {
    const largura = 100;
    const altura = 100;
    const segmentos = 1000;
    
    const geometriaChao = new THREE.PlaneGeometry(largura, altura, segmentos, segmentos);
    geometriaChao.rotateX(-Math.PI / 2);

    const loader = new THREE.TextureLoader();

    loader.load('/assets/terrenoTopografia.png', (textura) => {
        this.displacementMap = textura;
        
        loader.load('/assets/terreno.png', (texturaTerreno) => {
            const materialTerreno = new THREE.MeshStandardMaterial({
                map: texturaTerreno, 
                displacementMap: this.displacementMap, 
                displacementScale: 2,
                roughness: 0.8,
                metalness: 0.2,
            });

            this.terreno = new THREE.Mesh(geometriaChao, materialTerreno);
            this.terreno.position.set(0, 0, 0);
            this.terreno.name = "terreno"; 
            this.scene.add(this.terreno);

            // Agora que a textura carregou, processa o mapa
            this.alturas = this.processarMapa();
        });
    });
}


  processarMapa() {
    if (!this.displacementMap || !this.displacementMap.image) {
      return 0;
    }
  
    const image = this.displacementMap.image;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
  
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    
    const width = canvas.width;
    const height = canvas.height;
  
    const imageData = ctx.getImageData(0, 0, width, height);
    return imageData.data;
  }

  obterAlturaTerreno(x, z) {
    if (!this.alturas) {
      return 0;
    }

    const width = this.displacementMap.image.width;
    const height = this.displacementMap.image.height;

    const u = (x / 100 + 0.5) * width;
    const v = (z / 100 + 0.5) * height;
  
    const uClamped = Math.floor(Math.max(0, Math.min(width - 1, u)));
    const vClamped = Math.floor(Math.max(0, Math.min(height - 1, v)));
   
    const index = (vClamped * width + uClamped) * 4;

    const intensity = this.alturas[index];

    const altura = (intensity / 255) * this.terreno.material.displacementScale;

    return altura;
  }

  adicionarAgua() {
    this.videoAgua = document.createElement("video");
    this.videoAgua.src = "/assets/agua.mp4"; 
    this.videoAgua.loop = true;
    this.videoAgua.muted = true;
  
    // Criar textura de vídeo
    this.texturaAgua = new THREE.VideoTexture(this.videoAgua);
    this.texturaAgua.minFilter = THREE.LinearFilter;
    this.texturaAgua.magFilter = THREE.LinearFilter;
    this.texturaAgua.wrapS = THREE.RepeatWrapping;
    this.texturaAgua.wrapT = THREE.RepeatWrapping;
    this.texturaAgua.repeat.set(20, 20);
  
    // Criar plano de água
    const geometriaAgua = new THREE.PlaneGeometry(100, 100);
    const materialAgua = new THREE.MeshStandardMaterial({
      map: this.texturaAgua,
      transparent: true,
      opacity: 0.8,
      roughness: 0.4,
      metalness: 0.6
    });

    this.agua = new THREE.Mesh(geometriaAgua, materialAgua);
    this.agua.rotation.x = -Math.PI / 2;
    this.agua.position.y = 0.5;
  
    this.scene.add(this.agua);

    // Só iniciar o vídeo após interação do usuário
    const iniciarVideo = () => {
        this.videoAgua.play().catch(e => console.warn("Falha ao iniciar vídeo:", e));
        document.removeEventListener("click", iniciarVideo);
    };
    document.addEventListener("click", iniciarVideo);
  }

  render(player) {
    this.atualizarSolELua();
    if (this.criatura) {
      this.criatura.seguir(player);
    }
    this.renderer.render(this.scene, this.camera);
  }
}
