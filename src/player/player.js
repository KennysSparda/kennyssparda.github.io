import { THREE } from '../etc/imports.js'

export default class Player {
  constructor(mapa, terreno) {
    this.mapa = mapa
    this.terreno = terreno
    this.camera = this.mapa.camera
    this.scene = this.mapa.scene
    this.sensibilidadeMouse = 0.001
    this.movimentos = { frente: false, tras: false, esquerda: false, direita: false, pulando: false, agachando: false, correndo: false}
    
    // Física
    this.velocidadeInicial = 0.05
    this.velocidadeAtual = this.velocidadeInicial
    this.velocidadeCorrida = 0.1

    this.velocidadeY = 0
    this.gravidade = -0.002
    this.forcaPulo = 0.05
    this.suavizacaoAgachamento = 0.05
    this.alturaAgachado = 0.4

    this.stamina = 5
    this.alturaJogador = 0.5

    this.playerPositionX = 0
    this.playerPositionZ = 0
    this.playerPositionY = this.terreno.obterAlturaTerreno(this.playerPositionX, this.playerPositionZ) + this.alturaJogador

    this.limiteSubida = 0.2 

    this.camera.position.set(this.playerPositionX, this.playerPositionY, this.playerPositionZ)

    // Eventos de entrada
    document.addEventListener('keydown', (e) => this.teclaPressionada(e), false)
    document.addEventListener('keyup', (e) => this.teclaSolta(e), false)
    this.mapa.renderer.domElement.addEventListener('click', () => mapa.renderer.domElement.requestPointerLock())
    document.addEventListener('mousemove', (e) => this.movimentoMouse(e), false)
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
    this.playerPositionY += this.velocidadeY
  }

  colisaoChao() {
    const alturaTerreno = this.terreno.obterAlturaTerreno(this.playerPositionX, this.playerPositionZ)
    if (this.playerPositionY <= alturaTerreno + this.alturaJogador) {
        this.playerPositionY = alturaTerreno + this.alturaJogador
        this.velocidadeY = 0
        this.movimentos.pulando = false
    }
  }

  atualizaHud(stamina) {
    document.querySelector('#stamina').value = stamina
  }

  update() {
    const direcao = new THREE.Vector3()
    this.camera.getWorldDirection(direcao)
    direcao.y = 0
    direcao.normalize()

    const direita = new THREE.Vector3().crossVectors(this.camera.up, direcao).normalize()

    if (this.movimentos.correndo && this.stamina > 0) {
      this.velocidadeAtual = this.velocidadeCorrida
      this.stamina -= 0.02 
      if (this.stamina < 0) {
        this.velocidadeAtual = this.velocidadeInicial
        this.stamina = 0
      }
    } else {
      this.velocidadeAtual = this.velocidadeInicial
      if (this.stamina < 5) {
        this.stamina += 0.01 
      }
    }
  
    const proximaPosicao = this.camera.position.clone() 
    if (this.movimentos.frente) proximaPosicao.addScaledVector(direcao, this.velocidadeAtual)
    if (this.movimentos.tras) proximaPosicao.addScaledVector(direcao, -this.velocidadeAtual)
    if (this.movimentos.esquerda) proximaPosicao.addScaledVector(direita, this.velocidadeAtual)
    if (this.movimentos.direita) proximaPosicao.addScaledVector(direita, -this.velocidadeAtual)
  
    const alturaTerrenoAtual = this.terreno.obterAlturaTerreno(this.playerPositionX, this.playerPositionZ)
    const alturaTerrenoFutura = this.terreno.obterAlturaTerreno(proximaPosicao.x, proximaPosicao.z)
    const diferencaSubida = alturaTerrenoFutura - alturaTerrenoAtual
  
    if (diferencaSubida <= this.limiteSubida || (this.movimentos.pulando && diferencaSubida <= this.playerPositionY)) {
      this.playerPositionX = proximaPosicao.x
      
      this.playerPositionZ = proximaPosicao.z
    }

    this.adicionarGravidade()
  
    this.colisaoChao()

    if(this.movimentos.agachando) {
      this.playerPositionY = THREE.MathUtils.lerp(this.camera.position.y, this.playerPositionY - this.alturaAgachado, this.suavizacaoAgachamento)
    } else {
      if (this.camera.position.y < this.terreno.obterAlturaTerreno(this.playerPositionX, this.playerPositionZ) + this.alturaJogador) {
        this.playerPositionY = THREE.MathUtils.lerp(this.camera.position.y, this.playerPositionY + this.alturaJogador, this.suavizacaoAgachamento)
      }
    }
    this.camera.position.set(this.playerPositionX, this.playerPositionY, this.playerPositionZ)
    this.atualizaHud(this.stamina)
  }
}