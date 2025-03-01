import Mapa from './src/mapa/mapa.js'
import Renderizador from './src/render/renderizador.js'
import GameController from './src/game/gameController.js'
import Jogador from './src/player/jogador.js'
import Sound from './src/sound/sounds.js'
import Config from './src/config/config.js'

import { THREE } from './src/etc/imports.js'

const clock = new THREE.Clock()
const config = new Config()

// Criar os módulos principais
const sounds = new Sound()
const renderizador = new Renderizador(config)
const mapa = new Mapa(renderizador) // Passamos a cena do Renderizador
const gameController = new GameController(mapa, renderizador, sounds)
const jogador = new Jogador(renderizador, mapa, mapa.terreno, sounds)

function animate() {
  requestAnimationFrame(animate)

  if (mapa.terreno.terreno) {
    jogador.update()
    gameController.atualizar(jogador) // Agora o GameController gerencia tudo

    const deltaTime = clock.getDelta()
    if (mapa.entidades.passaros) mapa.entidades.passaros.update(deltaTime)
    if (mapa.entidades.monstros) mapa.entidades.monstros.update(deltaTime)
    if (mapa.entidades.peixes) mapa.entidades.peixes.update(deltaTime)
    if (mapa.entidades.arvores) mapa.entidades.arvores.update(deltaTime)

  } else {
    console.warn('Aguardando terreno.mesh estar disponível...');
  }
}

animate()
