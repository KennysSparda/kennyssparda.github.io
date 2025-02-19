class Mapa {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.carregarSkybox(); // Carrega o céu normal
    this.carregarSkyboxEstrelas(); // Carrega as texturas de céu e estrelas
    this.adicionarChao(); // Chão com desníveis
    this.adicionarSolELua(); // Adiciona o Sol e a Lua

    this.tempo = 0; // Controla o tempo que vai passando
    this.faseLua = 0; // Fase da Lua vai de 0 (Lua Nova) a 1 (Lua Cheia)
  }

  carregarSkybox() {
    const loader = new THREE.TextureLoader();
    const texturaHorizonte = loader.load('/assets/horizonte.png'); // Céu claro

    const geometria = new THREE.BoxGeometry(10, 10, 10);
    const materiais = [
      new THREE.MeshBasicMaterial({ map: texturaHorizonte, side: THREE.BackSide, transparent: true, opacity: 1 }), // Frente
      new THREE.MeshBasicMaterial({ map: texturaHorizonte, side: THREE.BackSide, transparent: true, opacity: 1 }), // Trás
      new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide, transparent: true, opacity: 0 }), // Cima (Transparente)
      new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide, transparent: true, opacity: 0 }), // Baixo
      new THREE.MeshBasicMaterial({ map: texturaHorizonte, side: THREE.BackSide, transparent: true, opacity: 1 }), // Esquerda
      new THREE.MeshBasicMaterial({ map: texturaHorizonte, side: THREE.BackSide, transparent: true, opacity: 1 }), // Direita
    ];

    this.skybox = new THREE.Mesh(geometria, materiais);
    this.scene.add(this.skybox);
  }

  carregarSkyboxEstrelas() {
    const loader = new THREE.TextureLoader();
    this.texturaEstrelas = null;
    this.texturaCeu = null;

    // Carregar as duas texturas: céu e estrelas
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
      // Agora que ambas as texturas foram carregadas, cria as skyboxes
      const geometria = new THREE.BoxGeometry(300, 300, 300); // Caixa maior para as estrelas
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

      // Criar a mesh da skybox para as estrelas e céu
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
      return; // Aguardar até as texturas estarem carregadas
    }

    this.tempo += 0.01;
    const raio = 100;

    // Definindo horários fixos
    const horarioSol = this.tempo * 0.2; // Ajuste para o Sol se mover mais devagar
    const horarioLua = this.tempo * 0.2 + Math.PI; // Lua sempre oposta ao Sol

    // Posições do Sol e Lua
    this.sol.position.set(Math.cos(horarioSol) * raio, Math.sin(horarioSol) * raio, 0);
    this.lua.position.set(Math.cos(horarioLua) * raio, Math.sin(horarioLua) * raio, 0);

    // Atualizando a luz do Sol e da Lua
    this.luzSol.position.copy(this.sol.position);
    this.luzLua.position.copy(this.lua.position);

    // Fases da Lua (Simples: cresce conforme o tempo)
    this.faseLua = Math.sin(this.tempo * 0.1) * 0.5 + 0.5; // Fase vai de 0 a 1

    // Atualizando opacidade e reflexividade da Lua com base na fase
    this.lua.material.opacity = this.faseLua;
    this.lua.material.reflectivity = this.faseLua;

    this.luzSol.intensity = Math.max(0, Math.sin(horarioSol) * 1.5);
    this.luzLua.intensity = Math.max(0, Math.sin(horarioLua) * 0.5);

    // Agora, vamos usar a altura do Sol para determinar o dia ou a noite
    const solAltura = Math.sin(horarioSol); // O valor de sin vai de -1 (noite) a 1 (dia)

    // Gradual transição entre o céu claro e o céu estrelado
    if (solAltura > 0) { // Durante o dia (Sol acima do horizonte)
      const alpha = Math.min(solAltura, 1); // De 0 a 1
      this.skyboxEstrelas.material.opacity = 1 - alpha; // Estrelas desaparecendo
      this.skyboxEstrelas.material.transparent = true;
      this.skyboxCeu.material.opacity = alpha; // Céu claro aparecendo
      this.skyboxCeu.material.transparent = false;
    } else { // Durante a noite (Sol abaixo do horizonte)
      const alpha = Math.min(-solAltura, 1); // De 0 a 1
      this.skyboxEstrelas.material.opacity = alpha; // Estrelas aparecendo
      this.skyboxEstrelas.material.transparent = false;
      this.skyboxCeu.material.opacity = 1 - alpha; // Céu claro desaparecendo
      this.skyboxCeu.material.transparent = true;
    }
  }

  adicionarChao() {
    const largura = 10;
    const altura = 10;
    const segmentos = 50; // Aumente esse valor pra mais detalhes
    
    const geometriaChao = new THREE.PlaneGeometry(largura, altura, segmentos, segmentos);
    geometriaChao.rotateX(-Math.PI / 2); // Deixa o plano horizontal
  
    // Carregar o mapa de deslocamento (ruído)
    const loader = new THREE.TextureLoader();
    this.displacementMap = loader.load('/assets/chaoRuido.png'); // Aqui é o mapa de deslocamento (ruído)
  
    // Carregar a textura para a superfície do chão
    const texturaChao = loader.load('/assets/chao.png'); // Mesma imagem pode ser usada, mas como textura para a superfície
  
    // Ajustando o material do chão
    const materialChao = new THREE.MeshStandardMaterial({
      map: texturaChao,  // Aplicando a textura no chão
      displacementMap: this.displacementMap,  // Usando o displacement map
      displacementScale: 2, // Ajuste para um efeito mais suave, testando 2 ou 3
      roughness: 0.8,
      metalness: 0.2,
    });
  
    // Criar o chão com a geometria e o material
    this.chao = new THREE.Mesh(geometriaChao, materialChao);
    this.chao.position.set(0, -5, 0); // Ajuste a posição conforme necessário
    this.chao.name = "chao";  // Nomeia o chão para facilitar a busca depois
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
    ctx.drawImage(image, 0, 0); // Renderiza a imagem no canvas
  
    const width = canvas.width;
    const height = canvas.height;
  
    const u = (x / 10 + 0.5) * width;
    const v = (z / 10 + 0.5) * height;
  
    const uClamped = Math.floor(Math.max(0, Math.min(width - 1, u)));
    const vClamped = Math.floor(Math.max(0, Math.min(height - 1, v)));
  
    // Pega os dados da textura
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
  
    // Índice do pixel no array de dados
    const index = (vClamped * width + uClamped) * 4;

    const intensity = data[index]; // Pegando só o canal vermelho (imagem em tons de cinza)

    const altura = (intensity / 255) * this.chao.material.displacementScale;

    return altura - 4.5;
  }
  
  render() {
    this.atualizarSolELua();
    this.renderer.render(this.scene, this.camera);
  }
}
