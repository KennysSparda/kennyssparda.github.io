class Player {
  constructor(mapa) {
    this.camera = mapa.camera;
    this.scene = mapa.scene;
    this.sensibilidadeMouse = 0.001;
    this.movimentos = { frente: false, tras: false, esquerda: false, direita: false, pulando: false, correndo: false};
    
    // Física
    this.velocidadeInicial = 0.01
    this.velocidadeAtual = this.velocidadeInicial
    this.velocidadeCorrida = 0.03

    this.velocidadeY = 0;
    this.gravidade = -0.002;
    this.forcaPulo = 0.02;
    this.stamina = 5
    this.alturaJogador = 0.4

    this.playerPositionX = 0
    this.playerPositionZ = 0
    this.playerPositionY = mapa.obterAlturaTerreno(this.playerPositionX, this.playerPositionZ) + this.alturaJogador

    this.limiteSubida = 0.1; // Define a altura máxima que o jogador pode subir sem pular

    // Definir limites do cubo (skybox)
    this.limiteMin = -4.8; // Para evitar ficar colado na borda
    this.limiteMax = 4.8;

    this.camera.position.set(this.playerPositionX, this.playerPositionY, this.playerPositionZ)

    // Eventos de entrada
    document.addEventListener('keydown', (e) => this.teclaPressionada(e), false);
    document.addEventListener('keyup', (e) => this.teclaSolta(e), false);
    mapa.renderer.domElement.addEventListener('click', () => mapa.renderer.domElement.requestPointerLock());
    document.addEventListener('mousemove', (e) => this.movimentoMouse(e), false);
  }

  teclaPressionada(event) {
    switch (event.code) {
      case 'KeyW': this.movimentos.frente = true; break;
      case 'KeyS': this.movimentos.tras = true; break;
      case 'KeyA': this.movimentos.esquerda = true; break;
      case 'KeyD': this.movimentos.direita = true; break;
      case 'ControlLeft': this.movimentos.correndo = true; break;
      case 'Space': 
         if (!this.movimentos.pulando) { 
          this.velocidadeY = this.forcaPulo;
          this.movimentos.pulando = true;
        }
        break;
    }
  }

  teclaSolta(event) {
    switch (event.code) {
      case 'KeyW': this.movimentos.frente = false; break;
      case 'KeyS': this.movimentos.tras = false; break;
      case 'KeyA': this.movimentos.esquerda = false; break;
      case 'KeyF': this.movimentos.direita = false; break;
      case 'ControlLeft': this.movimentos.correndo = false; break;
    }
  }

  movimentoMouse(event) {
    const eixoVertical = new THREE.Quaternion();
    const eixoHorizontal = new THREE.Quaternion();

    eixoHorizontal.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -event.movementX * this.sensibilidadeMouse);
    eixoVertical.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -event.movementY * this.sensibilidadeMouse);

    this.camera.quaternion.premultiply(eixoHorizontal);
    this.camera.quaternion.multiply(eixoVertical);
  }

  update() {
    const direcao = new THREE.Vector3();
    this.camera.getWorldDirection(direcao);
    direcao.y = 0;
    direcao.normalize();

    const direita = new THREE.Vector3().crossVectors(this.camera.up, direcao).normalize();

    // Gerenciamento da stamina
    if (this.movimentos.correndo && this.stamina > 0) {
      this.velocidadeAtual = this.velocidadeCorrida;
      this.stamina -= 0.02; // Gasta stamina ao correr
    } else {
      this.velocidadeAtual = this.velocidadeInicial;
      if (this.stamina < 5) {
        this.stamina += 0.01; // Recupera stamina quando não está correndo
      }
    }

    // Evita valores negativos na stamina
    this.stamina = Math.max(0, Math.min(5, this.stamina));

    const proximaPosicao = this.camera.position.clone(); // Clona a posição atual para teste
    if (this.movimentos.frente) proximaPosicao.addScaledVector(direcao, this.velocidadeAtual);
    if (this.movimentos.tras) proximaPosicao.addScaledVector(direcao, -this.velocidadeAtual);
    if (this.movimentos.esquerda) proximaPosicao.addScaledVector(direita, this.velocidadeAtual);
    if (this.movimentos.direita) proximaPosicao.addScaledVector(direita, -this.velocidadeAtual);

    // Verifica a altura do terreno na posição futura
    const alturaTerrenoAtual = mapa.obterAlturaTerreno(this.playerPositionX, this.playerPositionZ);
    const alturaTerrenoFutura = mapa.obterAlturaTerreno(proximaPosicao.x, proximaPosicao.z);
    const diferencaSubida = alturaTerrenoFutura - alturaTerrenoAtual;

    if (diferencaSubida <= this.limiteSubida || (this.movimentos.pulando && diferencaSubida <= this.playerPositionY)) {
        this.playerPositionX = proximaPosicao.x;
        this.playerPositionY = proximaPosicao.y;
        this.playerPositionZ = proximaPosicao.z;

        this.camera.position.set(proximaPosicao.x , proximaPosicao.y , proximaPosicao.z );
    }

    // Aplicando gravidade
    this.velocidadeY += this.gravidade;
    this.playerPositionY += this.velocidadeY;

    // Colisão com o chão
    const alturaTerreno = mapa.obterAlturaTerreno(this.playerPositionX, this.playerPositionZ);
    if (this.playerPositionY <= alturaTerreno + this.alturaJogador) {
        this.playerPositionY = alturaTerreno + this.alturaJogador;
        this.velocidadeY = 0;
        this.movimentos.pulando = false;
    }

    // Colisão com as paredes do cubo (limitação no X e Z)
    this.camera.position.x = Math.max(this.limiteMin, Math.min(this.limiteMax, this.camera.position.x));
    this.camera.position.z = Math.max(this.limiteMin, Math.min(this.limiteMax, this.camera.position.z));

    this.camera.position.set(this.playerPositionX, this.playerPositionY, this.playerPositionZ);
  }

}
