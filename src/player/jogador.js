import { THREE } from '../etc/imports.js'

export default class jogador {
  constructor(mapa, terreno) {
    this.mapa = mapa
    this.terreno = terreno
    this.camera = this.mapa.camera
    this.scene = this.mapa.scene
    this.sensibilidadeMouse = 0.001
    this.movimentos = { frente: false, tras: false, esquerda: false, direita: false, pulando: false, agachando: false, correndo: false}
    
    // Física
    this.velocidadeY = 0
    this.gravidade = -0.002
    this.suavizacaoAgachamento = 0.05
    this.alturaAgachado = 0.4
    
    this.alturaJogador = 0.5
    
    this.jogadorPositionX = 0
    this.jogadorPositionZ = 0
    this.jogadorPositionY = this.terreno.obterAlturaTerreno(this.jogadorPositionX, this.jogadorPositionZ) + this.alturaJogador
    
    this.limiteSubida = 0.2 
    
    this.camera.position.set(this.jogadorPositionX, this.jogadorPositionY, this.jogadorPositionZ)
    
    // Atributos
    this.velocidadeCorrida = 0.1
    this.velocidadeInicial = 0.05
    this.velocidadeAtual = this.velocidadeInicial
    this.forcaPulo = 0.05
    this.energia = 5
    this.vida = 3
    this.regeneracaoVida=0.1

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
    this.jogadorPositionY += this.velocidadeY
  }

  colisaoChao() {
    const alturaTerreno = this.terreno.obterAlturaTerreno(this.jogadorPositionX, this.jogadorPositionZ)
    if (this.jogadorPositionY <= alturaTerreno + this.alturaJogador) {
        this.jogadorPositionY = alturaTerreno + this.alturaJogador
        this.velocidadeY = 0
        this.movimentos.pulando = false
    }
  }

  atualizaHud(energia, vida) {
    document.querySelector('#energia').value = energia
    document.querySelector('#vida').value = vida
  }

  update() {
    const direcao = new THREE.Vector3()
    this.camera.getWorldDirection(direcao)
    direcao.y = 0
    direcao.normalize()

    const direita = new THREE.Vector3().crossVectors(this.camera.up, direcao).normalize()

    if (this.movimentos.correndo && this.energia > 0) {
      this.velocidadeAtual = this.velocidadeCorrida
      this.energia -= 0.02 
      if (this.energia < 0) {
        this.velocidadeAtual = this.velocidadeInicial
        this.energia = 0
      }
    } else {
      this.velocidadeAtual = this.velocidadeInicial
      if (this.energia < 5) {
        this.energia += 0.01 
      }
    }
  
    const proximaPosicao = this.camera.position.clone() 
    if (this.movimentos.frente) proximaPosicao.addScaledVector(direcao, this.velocidadeAtual)
    if (this.movimentos.tras) proximaPosicao.addScaledVector(direcao, -this.velocidadeAtual)
    if (this.movimentos.esquerda) proximaPosicao.addScaledVector(direita, this.velocidadeAtual)
    if (this.movimentos.direita) proximaPosicao.addScaledVector(direita, -this.velocidadeAtual)
  
    const alturaTerrenoAtual = this.terreno.obterAlturaTerreno(this.jogadorPositionX, this.jogadorPositionZ)
    const alturaTerrenoFutura = this.terreno.obterAlturaTerreno(proximaPosicao.x, proximaPosicao.z)
    const diferencaSubida = alturaTerrenoFutura - alturaTerrenoAtual
  
    if (diferencaSubida <= this.limiteSubida || (this.movimentos.pulando && diferencaSubida <= this.jogadorPositionY)) {
      this.jogadorPositionX = proximaPosicao.x
      
      this.jogadorPositionZ = proximaPosicao.z
    }

    this.adicionarGravidade()
  
    this.colisaoChao()

    if(this.movimentos.agachando) {
      this.jogadorPositionY = THREE.MathUtils.lerp(this.camera.position.y, this.jogadorPositionY - this.alturaAgachado, this.suavizacaoAgachamento)
    } else {
      if (this.camera.position.y < this.terreno.obterAlturaTerreno(this.jogadorPositionX, this.jogadorPositionZ) + this.alturaJogador) {
        this.jogadorPositionY = THREE.MathUtils.lerp(this.camera.position.y, this.jogadorPositionY + this.alturaJogador, this.suavizacaoAgachamento)
      }
    }

    if (this.mapa.criaturas.monstros) {
      this.mapa.criaturas.monstros.meshes.forEach((monstro) => {
        const distancia = Math.sqrt(
          Math.pow(this.jogadorPositionX - monstro.position.x, 2) +
          Math.pow(this.jogadorPositionZ - monstro.position.z, 2)
        )
        if (distancia < 0.5) {
          this.vida-=this.mapa.criaturas.monstros.dano
          // document.querySelector('label#log').innerHTML += `-${this.mapa.criaturas.monstros.dano}`
          document.body.style.backgroundColor = 'rgba(255, 0, 0, 0.5)' // Tela pisca vermelha
          setTimeout(() => document.body.style.backgroundColor = 'transparent', 200)
          this.atualizaHud(this.energia, this.vida)
        }
      })
    }
    this.vida+=this.regeneracaoVida
    this.camera.position.set(this.jogadorPositionX, this.jogadorPositionY, this.jogadorPositionZ)
    this.atualizaHud(this.energia, this.vida)
  }
}