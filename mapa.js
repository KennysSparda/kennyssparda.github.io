class Mapa {
  constructor() {
    this.viewDistanceMin = 0.1
    this.viewDistanceMax = 5000
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, this.viewDistanceMin, this.viewDistanceMax);

    this.tamanho = 100
    this.tamanhoX = this.tamanho
    this.tamanhoZ = this.tamanho

    this.nivelDetalhes = 512
    this.alturaEscala = 2
    this.alturaDaAgua = 0.5

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.carregarSkyboxEstrelas();
    this.adicionarChao(this.tamanhoX, this.tamanhoZ, this.nivelDetalhes, this.alturaEscala);
    this.adicionarSol()
    this.adicionarLua();
    this.adicionarAgua(this.tamanhoX, this.tamanhoZ)
    this.tempo = 0;
    this.faseLua = 0;

    this.luzAmbiente = new THREE.AmbientLight(0x404040, 0.5); // Luz ambiente suave
    this.scene.add(this.luzAmbiente);
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
     
      const geometria = new THREE.BoxGeometry(this.tamanho * 5, this.tamanho * 5, this.tamanho * 5);
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

  adicionarSol() {
    const geometria = new THREE.SphereGeometry(50, 16, 16);
    this.sol = new THREE.Mesh(geometria, new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff }));
    
    this.luzSol = new THREE.DirectionalLight(0xffffff, 2);
    this.luzSol.target = new THREE.Object3D();
    
    this.scene.add(this.luzSol.target, this.sol, this.luzSol);
  }

  adicionarLua() {
    const texturaLoader = new THREE.TextureLoader();
    const texturaLua = texturaLoader.load('/assets/lua.jpg');
    const normalMapLua = texturaLoader.load('/assets/luaTopografia.jpg');

    // Criação do material da Lua
    this.materialLua = new THREE.MeshPhongMaterial({
      map: texturaLua,
      normalMap: normalMapLua,
      shininess: 25, // Controla o brilho; valores mais baixos reduzem o aspecto metálico
      specular: new THREE.Color(0xffffff), // Cor da luz especular; tons mais escuros reduzem o brilho
      color: new THREE.Color(0xffffff) // Cor base da Lua
    });
    
    const geometriaLua = new THREE.SphereGeometry(10, 256, 256);
    this.lua = new THREE.Mesh(geometriaLua, this.materialLua);
    
    this.luzLua = new THREE.DirectionalLight(0x555555, 0.8);
    this.luzLua.target = new THREE.Object3D();
    
    this.scene.add(this.luzLua.target, this.lua, this.luzLua);
  }

  atualizarSol() {
    this.tempo += 0.01;
    const raio = this.tamanho * 2.5;
    this.horarioSol = this.tempo * 0.2;

    this.sol.position.set(Math.cos(this.horarioSol) * raio, Math.sin(this.horarioSol) * raio, 0);
    this.luzSol.position.copy(this.sol.position);
    
    this.luzSol.target.position.copy(this.camera.position);
    this.luzSol.target.updateMatrixWorld();
    
    this.luzSol.intensity = Math.max(0.3, Math.sin(this.horarioSol) * 1.5);
  }

  atualizarLua() {
    const raio = this.tamanho * 2.5;
    const horarioLua = this.tempo * 0.2 + Math.PI;

    this.lua.position.set(Math.cos(horarioLua) * raio, Math.sin(horarioLua) * raio, 0);
    this.luzLua.position.copy(this.lua.position);
    
    this.luzLua.target.position.copy(this.lua.position);
    this.luzLua.target.updateMatrixWorld();
    
    this.luzLua.intensity = Math.max(0.3, Math.sin(horarioLua) * 0.8);
    this.atualizarFasesDaLua()
  }

  atualizarFasesDaLua() {
    // Atualiza a posição da Lua em sua órbita
    const raioOrbita = this.tamanho * 2.5; // Raio da órbita da Lua
    const velocidadeOrbital = 0.0001; // Velocidade de órbita
    const anguloOrbital = performance.now() * velocidadeOrbital;
  
    this.lua.position.set(
      raioOrbita * Math.cos(anguloOrbital),
      -raioOrbita * Math.cos(anguloOrbital),
      raioOrbita * Math.sin(anguloOrbital)
    );
  
    // Calcula o ângulo entre a posição da Lua e a direção da luz
    const vetorLua = new THREE.Vector3().copy(this.lua.position).normalize();
    const vetorLuz = new THREE.Vector3().copy(this.luzSol.position).normalize();
    const angulo = vetorLua.dot(vetorLuz);
  
    // Ajusta a intensidade da luz refletida pela Lua
    this.materialLua.emissiveIntensity = Math.max(0.1, angulo);
  }

  atualizarCeoEstrelas() {
    if (!this.skyboxEstrelas || !this.skyboxCeu || !this.skyboxEstrelas.material || !this.skyboxCeu.material) return;

    const solAltura = Math.sin(this.horarioSol);
    
    // Opacidade do céu e das estrelas
    this.skyboxEstrelas.material.opacity = solAltura < 0 ? 1 : 1 - solAltura;
    this.skyboxCeu.material.opacity = solAltura > 0 ? 1 : 1 + solAltura;


  }

  gerenciarCriatura() {
    const solAltura = Math.sin(this.horarioSol);
      // Criar criatura à noite
      if (solAltura < 0 && !this.criatura) {
        this.criatura = new Criatura(this.scene);
      }
      // Remover criatura ao amanhecer
      if (solAltura > 0 && this.criatura) {
        this.scene.remove(this.criatura.mesh);
        this.criatura = null;
      }
  }


  adicionarChao(tamanhoX, tamanhoZ, nivelDetalhes, alturaEscala) {
    const segmentos = nivelDetalhes;
    
    const geometriaChao = new THREE.PlaneGeometry(tamanhoX, tamanhoZ, segmentos, segmentos);
    geometriaChao.rotateX(-Math.PI / 2);

    const loader = new THREE.TextureLoader();

    loader.load('/assets/terrenoTopografia.png', (textura) => {
        this.displacementMap = textura;
        
        loader.load('/assets/terreno.png', (texturaTerreno) => {
            const materialTerreno = new THREE.MeshStandardMaterial({
                map: texturaTerreno, 
                displacementMap: this.displacementMap, 
                displacementScale: alturaEscala,
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

    const u = (x / this.tamanhoX + 0.5) * width;
    const v = (z / this.tamanhoZ + 0.5) * height;
  
    const uClamped = Math.floor(Math.max(0, Math.min(width - 1, u)));
    const vClamped = Math.floor(Math.max(0, Math.min(height - 1, v)));
   
    const index = (vClamped * width + uClamped) * 4;

    const intensity = this.alturas[index];

    const altura = (intensity / 255) * this.terreno.material.displacementScale;

    return altura;
  }

  adicionarAgua(tamanhoX, tamanhoZ) {
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
    this.texturaAgua.repeat.set(this.tamanho / 2, this.tamanho / 2);
  
    // Criar plano de água
    const geometriaAgua = new THREE.PlaneGeometry(tamanhoX, tamanhoZ);
    const materialAgua = new THREE.MeshStandardMaterial({
      map: this.texturaAgua,
      transparent: true,
      opacity: 0.8,
      roughness: 0.4,
      metalness: 0.6
    });

    this.agua = new THREE.Mesh(geometriaAgua, materialAgua);
    this.agua.rotation.x = -Math.PI / 2;
    this.agua.position.y = this.alturaDaAgua;
  
    this.scene.add(this.agua);

    // Só iniciar o vídeo após interação do usuário
    const iniciarVideo = () => {
        this.videoAgua.play().catch(e => console.warn("Falha ao iniciar vídeo:", e));
        document.removeEventListener("click", iniciarVideo);
    };
    document.addEventListener("click", iniciarVideo);
  }

  render(player) {
    this.atualizarSol()
    this.atualizarLua()
    this.atualizarCeoEstrelas()
    this.gerenciarCriatura()
    if (this.criatura) {
      this.criatura.seguir(player)
    }
    this.renderer.render(this.scene, this.camera);
  }
}
