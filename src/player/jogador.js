import Passaros from '../entidades/passaros.js'
import { THREE } from '../etc/imports.js'

export default class jogador {
  constructor(render, mapa, terreno, sounds) {
    this.renderizador = render
    this.mapa = mapa
    this.terreno = terreno
    this.sounds = sounds
    this.camera = this.renderizador.camera
    this.scene = this.mapa.scene
    this.sensibilidadeMouse = 0.001
    this.movimentos = { frente: false, tras: false, esquerda: false, direita: false, pulando: false, agachando: false, correndo: false}
    this.collider = {
      base: new THREE.Vector3(), // Ponto inferior da cápsula
      topo: new THREE.Vector3(), // Ponto superior da cápsula
      raio: 1.0 // Raio da cápsula
    };
    // Física
    this.velocidadeY = 0
    this.gravidade = -0.002
    this.suavizacaoAgachamento = 0.05
    this.alturaAgachado = 0.2
    
    this.alturaJogador = 0.5
    
    this.jogadorPositionX = 0
    this.jogadorPositionZ = 0
    this.jogadorPositionY = this.terreno.obterAlturaTerreno(this.jogadorPositionX, this.jogadorPositionZ) + this.alturaJogador
    
    this.limiteSubida = 0.4
    
    this.camera.position.set(this.jogadorPositionX, this.jogadorPositionY, this.jogadorPositionZ)
    
    // Atributos
    this.morto = false
    this.velocidadeCorrida = 0.1
    this.velocidadeInicial = 0.05
    this.velocidadeAtual = this.velocidadeInicial
    this.forcaPulo = 0.05
    this.energiaMax = 5
    this.energia = this.energiaMax
    this.vidaMax = 100
    this.vida = this.vidaMax
    this.regeneracaoVida=0.01

    // Eventos de entrada
    this.teclaPressionadaHandler = this.teclaPressionada.bind(this)
    this.teclaSoltaHandler = this.teclaSolta.bind(this)
    this.movimentoMouseHandler = this.movimentoMouse.bind(this)

    document.addEventListener('keydown', this.teclaPressionadaHandler, false)
    document.addEventListener('keyup', this.teclaSoltaHandler, false)
    document.addEventListener('mousemove', this.movimentoMouseHandler, false)
    this.renderizador.renderer.domElement.addEventListener('click', () => this.renderizador.renderer.domElement.requestPointerLock())


    // Ajuste da hud
    document.querySelector('#energia').max = this.energiaMax
    document.querySelector('#vida').max = this.vidaMax
  }


  teclaPressionada(event) {
    switch (event.code) {
      case 'KeyW': this.movimentos.frente = true; break
      case 'KeyS': this.movimentos.tras = true; break
      case 'KeyA': this.movimentos.esquerda = true; break
      case 'KeyD': this.movimentos.direita = true; break
      case 'ShiftLeft': this.movimentos.correndo = true; break
      case 'ControlLeft': this.movimentos.agachando = true; break
      case 'Space': 
         if (!this.movimentos.pulando) { 
          this.velocidadeY = this.forcaPulo
          this.movimentos.pulando = true
          this.movimentos.agachando = false
        }
        break
    }
  }

  teclaSolta(event) {
    switch (event.code) {
      case 'KeyW': this.movimentos.frente = false; break
      case 'KeyS': this.movimentos.tras = false; break
      case 'KeyA': this.movimentos.esquerda = false; break
      case 'KeyD': this.movimentos.direita = false; break
      case 'ShiftLeft': this.movimentos.correndo = false; break
      case 'ControlLeft': this.movimentos.agachando = false; break
    }
  }

  movimentoMouse(event) {
    const eixoVertical = new THREE.Quaternion()
    const eixoHorizontal = new THREE.Quaternion()

    eixoHorizontal.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -event.movementX * this.sensibilidadeMouse)
    eixoVertical.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -event.movementY * this.sensibilidadeMouse)

    this.camera.quaternion.premultiply(eixoHorizontal)
    this.camera.quaternion.multiply(eixoVertical)
  }

  adicionarGravidade() {
    this.velocidadeY += this.gravidade
    this.jogadorPositionY += this.velocidadeY
  }

  colisaoChao() {
    const alturaTerreno = this.terreno.obterAlturaTerreno(this.jogadorPositionX, this.jogadorPositionZ)
    if (this.jogadorPositionY <= alturaTerreno + this.alturaJogador) {
        // 
        this.jogadorPositionY = alturaTerreno + this.alturaJogador
        this.velocidadeY = 0
        this.movimentos.pulando = false
    }
  }

  atualizaHud(energia, vida) {
    document.querySelector('#energia').value = energia
    document.querySelector('#vida').value = vida
    document.querySelector('#pos').textContent = `X: ${parseFloat(this.jogadorPositionX.toFixed(2))}, Y: ${parseFloat(this.jogadorPositionY.toFixed(2))}, Z: ${parseFloat(this.jogadorPositionZ.toFixed(2))}`

  }

  atualizarCorrida() {
    if (this.movimentos.correndo && this.movimentos.frente && this.energia > 0) {
      this.velocidadeAtual = this.velocidadeCorrida
      this.energia -= 0.02 
      if (this.energia < 0) {
        this.velocidadeAtual = this.velocidadeInicial
        this.energia = 0
      }
    } else {
      this.velocidadeAtual = this.velocidadeInicial
      if (this.energia < this.energiaMax) {
        this.energia += 0.005 
      }
    }
  }

  atualizarPosition() {
    // Atualiza o movimento horizontal
    const nextPos = this.calculateNextHorizontalPosition();
    const terrainHeightNext = this.terreno.obterAlturaTerreno(nextPos.x, nextPos.z);
    const currentTerrainHeight = this.terreno.obterAlturaTerreno(this.jogadorPositionX, this.jogadorPositionZ);
    const heightDiff = Math.abs(terrainHeightNext - currentTerrainHeight);
  
    if (this.canMoveHorizontally(heightDiff, terrainHeightNext)) {
      this.jogadorPositionX = nextPos.x;
      this.jogadorPositionZ = nextPos.z;
      
      if (!this.movimentos.pulando) {
        this.adjustVerticalPosition(terrainHeightNext);
      }
    } else {
      
    }
  
    // Aplica a lógica de queda livre (movimento vertical)
    this.applyFreeFall();
  
    // Atualiza a posição da câmera
    this.updateCameraPosition();
  
    
  }
  
  calculateNextHorizontalPosition() {
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();
  
    const right = new THREE.Vector3().crossVectors(this.camera.up, direction).normalize();
    const nextPos = this.camera.position.clone();
  
    if (this.movimentos.frente) nextPos.addScaledVector(direction, this.velocidadeAtual);
    if (this.movimentos.tras) nextPos.addScaledVector(direction, -this.velocidadeAtual);
    if (this.movimentos.esquerda) nextPos.addScaledVector(right, this.velocidadeAtual);
    if (this.movimentos.direita) nextPos.addScaledVector(right, -this.velocidadeAtual);
  
    
    return nextPos;
  }
  
  canMoveHorizontally(heightDiff, terrainHeightNext) {
    // Permite se a diferença for menor que o limite ou se estiver pulando e o player já estiver acima do terreno adiante
    return heightDiff <= this.limiteSubida || (this.movimentos.pulando && this.camera.position.y >= terrainHeightNext);
  }
  
  adjustVerticalPosition(terrainHeightNext) {
    // Se o terreno à frente estiver mais alto (dentro do limite), sobe; se estiver mais baixo, desce.
    if (terrainHeightNext > this.jogadorPositionY && Math.abs(terrainHeightNext - this.jogadorPositionY) <= this.limiteSubida) {
      
      this.jogadorPositionY = terrainHeightNext + this.alturaJogador;
    } else if (terrainHeightNext < this.jogadorPositionY) {
      
      this.jogadorPositionY = terrainHeightNext + this.alturaJogador;
    }
  }
  
  applyFreeFall() {
    const currentTerrainHeight = this.terreno.obterAlturaTerreno(this.jogadorPositionX, this.jogadorPositionZ);
    if (!this.movimentos.pulando && this.jogadorPositionY > currentTerrainHeight + this.alturaJogador) {
      
      this.velocidadeQueda += this.gravidade; // Acelera a queda
      this.jogadorPositionY -= this.velocidadeQueda;
      
      // Se ultrapassar o solo, corrige a posição
      if (this.jogadorPositionY < currentTerrainHeight + this.alturaJogador) {
        this.jogadorPositionY = currentTerrainHeight + this.alturaJogador;
        this.velocidadeQueda = 0;
      }
    } else {
      this.velocidadeQueda = 0;
    }
  }
  
  updateCameraPosition() {
    this.camera.position.set(this.jogadorPositionX, this.jogadorPositionY, this.jogadorPositionZ);
  }
  
  movimentoAgachar() {
    if(this.movimentos.agachando) {
      this.jogadorPositionY = THREE.MathUtils.lerp(this.camera.position.y, this.jogadorPositionY - this.alturaAgachado, this.suavizacaoAgachamento)
    } else {
      if (this.camera.position.y < this.terreno.obterAlturaTerreno(this.jogadorPositionX, this.jogadorPositionZ) + this.alturaJogador) {
        this.jogadorPositionY = THREE.MathUtils.lerp(this.camera.position.y, this.jogadorPositionY + this.alturaJogador, this.suavizacaoAgachamento)
      }
    }
  }

  aplicaDanos() {
    if (this.morto) {
      this.jogadorPositionY = THREE.MathUtils.lerp(this.jogadorPositionY, 0, 0.05)
    }
    if (this.vida <= 0) {
      this.fimJogo()
    } else {
      if (this.mapa.entidades.monstros) {
        this.mapa.entidades.monstros.meshes.forEach((monstro) => {
          const distancia = Math.sqrt(
            Math.pow(this.jogadorPositionX - monstro.position.x, 2) +
            Math.pow(this.jogadorPositionZ - monstro.position.z, 2)
          )
          if (distancia < 5) {
            this.sounds.playMonstros()
          } else {
            this.sounds.stopMonstros()
          }
          if (distancia < 1.5) {
            if ( this.vida > 0){
              this.vida -= this.mapa.entidades.monstros.dano
            }
          }
        })
      }
    }
  }

  fimJogo() {
    this.energia = 0
    this.energiaMax = 0
    this.regeneracaoVida = 0
    this.morto = true
    this.sounds.stopMonstros()
    this.sounds.stopPassaros()
    this.atualizaHud(this.energia, this.vida)
    document.querySelector('div#fimdejogo').textContent = "FIM DE JOGO"
    document.querySelector('a#tentarNovamente').style.display = 'block'

    // Remover eventos corretamente
    document.removeEventListener('keydown', this.teclaPressionadaHandler, false)
    document.removeEventListener('keyup', this.teclaSoltaHandler, false)
    document.removeEventListener('mousemove', this.movimentoMouseHandler, false)
  }

  adicionarRegeneracaoDeVida() {
    if (this.vida < this.vidaMax) {
      this.vida+=this.regeneracaoVida
    }
  }

  update() {

    this.atualizarCorrida() 
    
    this.adicionarGravidade()
    
    this.atualizarPosition()
  
    this.colisaoChao()

    this.movimentoAgachar()

    this.aplicaDanos()
    
    this.adicionarRegeneracaoDeVida()

    this.camera.position.set(this.jogadorPositionX, this.jogadorPositionY, this.jogadorPositionZ)
    
    this.atualizaHud(this.energia, this.vida)
  }
}