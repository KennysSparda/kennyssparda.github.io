import { THREE } from '../etc/imports.js'

import Terreno from './objetos/terreno.js'
import Ceu from './objetos/ceu.js'
import Sol from './objetos/sol.js'
import Lua from './objetos/lua.js'
import Agua from './objetos/agua.js'
import Entidades from '../entidades/entidades.js'

export default class Mapa {
  constructor(renderizador) {
    this.renderizador = renderizador
    this.scene = renderizador.scene
    this.tamanho = 20
    this.alturaEscala = 2
    this.alturaDaAgua = 0.2

    this.terreno = new Terreno(this.scene, this.tamanho, this.tamanho, 100, this.alturaEscala)
    this.ceu = new Ceu(this.scene, this.tamanho, 1000)
    this.sol = new Sol(this.scene, this.tamanho, 100, 5000)
    this.lua = new Lua(this.scene, this.tamanho, 20, 700)
    this.agua = new Agua(this.scene, this.tamanho, this.tamanho, 5, this.alturaDaAgua)
    this.entidades = new Entidades(this)
    
    this.luzAmbiente = new THREE.AmbientLight(0x404040, 0.3)
    this.scene.add(this.luzAmbiente)
  }
}
