import { THREE } from '../etc/imports.js'
import MobileControls from "../ui/mobileControls.js"

export default class Jogador {
  constructor(renderizador, mundo, terreno, sounds, menuConfig) {
    this.renderizador = renderizador;
    this.mundo = mundo;
    this.terreno = terreno;
    this.sounds = sounds;
    this.menuConfig = menuConfig

    this.camera = this.renderizador.camera;
    this.scene = this.mundo.scene;
    
    // Configurações de movimento e input
    this.sensibilidadeMouse = 0.001;
    this.movimentos = { frente: false, tras: false, esquerda: false, direita: false, pulando: false, agachando: false, correndo: false };

    // Collider (pode ser melhorado futuramente)
    this.collider = {
      base: new THREE.Vector3(),
      topo: new THREE.Vector3(),
      raio: 1.0
    };

    // Física e posição (usando um Vector3 pra centralizar)
    this.velocidadeY = 0;
    this.gravidade = -0.002;
    this.velocidadeQueda = 0; // Inicializando
    this.suavizacaoAgachamento = 0.05;
    this.alturaAgachado = 0.3;
    this.alturaJogador = 0.5;
    this.posicao = new THREE.Vector3(0, 0, 0);
    this.posicao.y = this.terreno.obterAlturaTerreno(0, 0) + this.alturaJogador;
    this.limiteSubida = 0.4;
    this.camera.position.copy(this.posicao);

    // Atributos do jogador
    this.morto = false;
    this.velocidadeCorrida = 0.1;
    this.velocidadeInicial = 0.05;
    this.velocidadeAtual = this.velocidadeInicial;
    this.forcaPulo = 0.05;
    this.energiaMax = 5;
    this.energia = this.energiaMax;
    this.vidaMax = 100;
    this.vida = this.vidaMax;
    this.regeneracaoVida = 0.01;

    // Eventos de entrada
    this.teclaPressionadaHandler = this.teclaPressionada.bind(this);
    this.teclaSoltaHandler = this.teclaSolta.bind(this);
    this.movimentoMouseHandler = this.movimentoMouse.bind(this);

    document.addEventListener('keydown', this.teclaPressionadaHandler, false);
    document.addEventListener('keyup', this.teclaSoltaHandler, false);
    document.addEventListener('mousemove', this.movimentoMouseHandler, false);
    this.renderizador.renderer.domElement.addEventListener('click', () =>
      this.renderizador.renderer.domElement.requestPointerLock()
    );

    // Configura a HUD
    document.querySelector('#energia').max = this.energiaMax;
    document.querySelector('#vida').max = this.vidaMax;

    if (this.isMobile()) {
      document.getElementById("mobileControls").classList.remove("hidden")
      this.mobileControls = new MobileControls(this, menuConfig)
    }
  }

  isMobile() {
    return /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent)
  }

  movimentoTouch(deltaX, deltaY) {
    const eixoHorizontal = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      -deltaX * this.sensibilidadeMouse * 2 // Multiplicado para maior precisão
    );
    const eixoVertical = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      -deltaY * this.sensibilidadeMouse * 2
    );
  
    this.camera.quaternion.premultiply(eixoHorizontal);
    this.camera.quaternion.multiply(eixoVertical);
  }

  // Métodos de Input
  teclaPressionada(event) {
    switch (event.code) {
      case 'KeyW': this.movimentos.frente = true; break;
      case 'KeyS': this.movimentos.tras = true; break;
      case 'KeyA': this.movimentos.esquerda = true; break;
      case 'KeyD': this.movimentos.direita = true; break;
      case 'ShiftLeft': this.movimentos.correndo = true; break;
      case 'ControlLeft': this.movimentos.agachando = true; break;
      case 'Space':
        if (!this.movimentos.pulando) {
          this.velocidadeY = this.forcaPulo;
          this.movimentos.pulando = true;
          this.movimentos.agachando = false;
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
      case 'ShiftLeft': this.movimentos.correndo = false; break;
      case 'ControlLeft': this.movimentos.agachando = false; break;
    }
  }

  movimentoMouse(event) {
    const eixoHorizontal = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      -event.movementX * this.sensibilidadeMouse
    );
    const eixoVertical = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      -event.movementY * this.sensibilidadeMouse
    );
    this.camera.quaternion.premultiply(eixoHorizontal);
    this.camera.quaternion.multiply(eixoVertical);
  }

  // Métodos de Física e Movimento
  adicionarGravidade() {
    this.velocidadeY += this.gravidade;
    this.posicao.y += this.velocidadeY;
  }

  colisaoChao() {
    const alturaTerreno = this.terreno.obterAlturaTerreno(this.posicao.x, this.posicao.z);
    if (this.posicao.y <= alturaTerreno + this.alturaJogador) {
      this.posicao.y = alturaTerreno + this.alturaJogador;
      this.velocidadeY = 0;
      this.movimentos.pulando = false;
    }
  }

  atualizarCorrida() {
    if (this.movimentos.correndo && this.movimentos.frente && this.energia > 0) {
      this.velocidadeAtual = this.velocidadeCorrida;
      this.energia -= 0.02;
      if (this.energia < 0) {
        this.velocidadeAtual = this.velocidadeInicial;
        this.energia = 0;
      }
    } else {
      this.velocidadeAtual = this.velocidadeInicial;
      if (this.energia < this.energiaMax) {
        this.energia += 0.005;
      }
    }
  }

  calculateNextHorizontalPosition() {
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();

    const right = new THREE.Vector3().crossVectors(this.camera.up, direction).normalize();
    const nextPos = this.posicao.clone();

    if (this.movimentos.frente) nextPos.addScaledVector(direction, this.velocidadeAtual);
    if (this.movimentos.tras) nextPos.addScaledVector(direction, -this.velocidadeAtual);
    if (this.movimentos.esquerda) nextPos.addScaledVector(right, this.velocidadeAtual);
    if (this.movimentos.direita) nextPos.addScaledVector(right, -this.velocidadeAtual);

    return nextPos;
  }

  atualizarPosition() {
    const nextPos = this.calculateNextHorizontalPosition();
    const terrainHeightNext = this.terreno.obterAlturaTerreno(nextPos.x, nextPos.z);
    const currentTerrainHeight = this.terreno.obterAlturaTerreno(this.posicao.x, this.posicao.z);
    const heightDiff = Math.abs(terrainHeightNext - currentTerrainHeight);

    if (heightDiff <= this.limiteSubida || (this.movimentos.pulando && this.camera.position.y >= terrainHeightNext)) {
      this.posicao.x = nextPos.x;
      this.posicao.z = nextPos.z;
      if (!this.movimentos.pulando) {
        this.adjustVerticalPosition(terrainHeightNext);
      }
    } else if (terrainHeightNext < this.posicao.y) {
      // Permite que o jogador desça morros suavemente
      this.posicao.x = nextPos.x;
      this.posicao.z = nextPos.z;
      this.posicao.y -= 0.05; // Ajuste fino para simular descida gradual
    }
    this.applyFreeFall();
    this.updateCameraPosition();
  }

  adjustVerticalPosition(terrainHeightNext) {
    if (terrainHeightNext > this.posicao.y && Math.abs(terrainHeightNext - this.posicao.y) <= this.limiteSubida) {
      this.posicao.y = terrainHeightNext + this.alturaJogador;
    } else if (terrainHeightNext < this.posicao.y) {
      this.posicao.y = terrainHeightNext + this.alturaJogador;
    }
  }

  applyFreeFall() {
    const currentTerrainHeight = this.terreno.obterAlturaTerreno(this.posicao.x, this.posicao.z);
    if (!this.movimentos.pulando && this.posicao.y > currentTerrainHeight + this.alturaJogador) {
      this.velocidadeQueda += this.gravidade;
      this.posicao.y -= this.velocidadeQueda;
      if (this.posicao.y < currentTerrainHeight + this.alturaJogador) {
        this.posicao.y = currentTerrainHeight + this.alturaJogador;
        this.velocidadeQueda = 0;
      }
    } else {
      this.velocidadeQueda = 0;
    }
  }

  updateCameraPosition() {
    this.camera.position.copy(this.posicao);
  }

  movimentoAgachar() {
    if (this.movimentos.agachando) {
      this.posicao.y = THREE.MathUtils.lerp(this.camera.position.y, this.posicao.y - this.alturaAgachado, this.suavizacaoAgachamento);
    } else {
      const terrenoAltura = this.terreno.obterAlturaTerreno(this.posicao.x, this.posicao.z) + this.alturaJogador;
      if (this.camera.position.y < terrenoAltura) {
        this.posicao.y = THREE.MathUtils.lerp(this.camera.position.y, terrenoAltura, this.suavizacaoAgachamento);
      }
    }
  }

  // Métodos de HUD e Danos
  atualizaHud() {
    document.querySelector('#energia').value = this.energia;
    document.querySelector('#vida').value = this.vida;
    // document.querySelector('#pos').textContent = `X: ${this.posicao.x.toFixed(2)}, Y: ${this.posicao.y.toFixed(2)}, Z: ${this.posicao.z.toFixed(2)}`;
  }

  fimJogo() {
    this.energia = 0
    this.energiaMax = 0
    this.regeneracaoVida = 0
    this.morto = true
    this.sounds.stopMonstros()
    this.sounds.stopPassaros()
    this.sounds.stopMusica()
    this.atualizaHud(this.energia, this.vida)
    document.querySelector('div#fimdejogo').textContent = "FIM DE JOGO"
    document.querySelector('.hidden').style.display = 'block'
    document.querySelector('.hidden').style.visibility = 'visible'

    // Remover eventos corretamente
    document.removeEventListener('keydown', this.teclaPressionadaHandler, false)
    document.removeEventListener('keyup', this.teclaSoltaHandler, false)
    document.removeEventListener('mousemove', this.movimentoMouseHandler, false)
  }

  aplicaDanos() {
    if (this.morto) {
      this.posicao.y = THREE.MathUtils.lerp(this.posicao.y, 0, 0.05);
    }
    if (this.vida <= 0) {
      this.fimJogo();
    } else if (this.mundo.entidades.monstros) {
      this.mundo.entidades.monstros.meshes.forEach(monstro => {
        const distancia = this.posicao.distanceTo(monstro.position);
        if (distancia < 5) {
          this.sounds.playMonstros();
        } else {
          this.sounds.stopMonstros();
        }
        if (distancia < 1.5) {
          if (this.vida > 0) {
            this.vida -= this.mundo.entidades.monstros.dano;
          }
        }
      });
    }
  }

  adicionarRegeneracaoDeVida() {
    if (this.vida < this.vidaMax) {
      this.vida += this.regeneracaoVida;
    }
  }

  // Update Loop principal
  update() {
    this.atualizarCorrida();
    this.adicionarGravidade();
    this.atualizarPosition();
    this.colisaoChao();
    this.movimentoAgachar();
    this.aplicaDanos();
    this.adicionarRegeneracaoDeVida();
    this.updateCameraPosition();
    this.atualizaHud();
  }
}
