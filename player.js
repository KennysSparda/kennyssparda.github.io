class Player {
  constructor(camera, canvas, scene) {
    this.camera = camera;
    this.scene = scene;
    this.velocidade = 0.03;
    this.sensibilidadeMouse = 0.001;
    this.movimentos = { frente: false, tras: false, esquerda: false, direita: false };

    // Física
    // this.alturaChao = -4.8; // Posição do chão
    this.alturaChao = -3.8; // Posição do chão
    this.velocidadeY = 0;
    this.gravidade = -0.002;
    this.forcaPulo = 0.03;

    // Definir limites do cubo (skybox)
    this.limiteMin = -4.8; // Para evitar ficar colado na borda
    this.limiteMax = 4.8;

    this.camera.position.set(0, this.alturaChao, 0);

    // Eventos de entrada
    document.addEventListener('keydown', (e) => this.teclaPressionada(e), false);
    document.addEventListener('keyup', (e) => this.teclaSolta(e), false);
    canvas.addEventListener('click', () => canvas.requestPointerLock());
    document.addEventListener('mousemove', (e) => this.movimentoMouse(e), false);
  }

  teclaPressionada(event) {
    switch (event.code) {
      case 'KeyW': this.movimentos.frente = true; break;
      case 'KeyS': this.movimentos.tras = true; break;
      case 'KeyA': this.movimentos.esquerda = true; break;
      case 'KeyD': this.movimentos.direita = true; break;
      case 'Space': 
        if (this.camera.position.y <= this.alturaChao + 0.01) { 
          this.velocidadeY = this.forcaPulo;
        }
        break;
    }
  }

  teclaSolta(event) {
    switch (event.code) {
      case 'KeyW': this.movimentos.frente = false; break;
      case 'KeyS': this.movimentos.tras = false; break;
      case 'KeyA': this.movimentos.esquerda = false; break;
      case 'KeyD': this.movimentos.direita = false; break;
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

    const proximaPosicao = this.camera.position.clone(); // Clona a posição atual para teste

    if (this.movimentos.frente) proximaPosicao.addScaledVector(direcao, this.velocidade);
    if (this.movimentos.tras) proximaPosicao.addScaledVector(direcao, -this.velocidade);
    if (this.movimentos.esquerda) proximaPosicao.addScaledVector(direita, this.velocidade);
    if (this.movimentos.direita) proximaPosicao.addScaledVector(direita, -this.velocidade);

    // Verifica a altura do terreno na posição futura
    const alturaTerrenoAtual = mapa.obterAlturaTerreno(this.camera.position.x, this.camera.position.z);
    const alturaTerrenoFutura = mapa.obterAlturaTerreno(proximaPosicao.x, proximaPosicao.z);

    const limiteSubida = 0.2; // Define a altura máxima que o jogador pode subir sem pular

    if (alturaTerrenoFutura - alturaTerrenoAtual <= limiteSubida) {
        // Permite o movimento apenas se a elevação não for muito grande
        this.camera.position.copy(proximaPosicao);
    }

    // Aplicando gravidade
    this.velocidadeY += this.gravidade;
    this.camera.position.y += this.velocidadeY;

    // Colisão com o chão
    const alturaTerreno = mapa.obterAlturaTerreno(this.camera.position.x, this.camera.position.z);
    if (this.camera.position.y <= alturaTerreno) {
        this.camera.position.y = alturaTerreno;
        this.velocidadeY = 0;
    }

    // Colisão com as paredes do cubo (limitação no X e Z)
    this.camera.position.x = Math.max(this.limiteMin, Math.min(this.limiteMax, this.camera.position.x));
    this.camera.position.z = Math.max(this.limiteMin, Math.min(this.limiteMax, this.camera.position.z));
  }

}
