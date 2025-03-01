import Mundo from './src/mundo/mundo.js'
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
const mundo = new Mundo(renderizador) // Passamos a cena do Renderizador
const gameController = new GameController(mundo, renderizador, sounds)
const jogador = new Jogador(renderizador, mundo, mundo.terreno, sounds)

function animate() {
  requestAnimationFrame(animate)

  if (mundo.terreno.terreno) {
    jogador.update()
    gameController.atualizar(jogador) // Agora o GameController gerencia tudo

    const deltaTime = clock.getDelta()
    if (mundo.entidades.passaros) mundo.entidades.passaros.update(deltaTime)
    if (mundo.entidades.monstros) mundo.entidades.monstros.update(deltaTime)
    if (mundo.entidades.peixes) mundo.entidades.peixes.update(deltaTime)
    if (mundo.entidades.arvores) mundo.entidades.arvores.update(deltaTime)

  } else {
    console.warn('Aguardando terreno.mesh estar disponível...');
  }
}

animate()
