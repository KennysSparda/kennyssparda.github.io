import Mapa from './src/mapa/mapa.js'
import Jogador from './src/player/jogador.js'
import Sound from './src/sound/sounds.js'

import { THREE } from './src/etc/imports.js'

const clock = new THREE.Clock()

const mapa = new Mapa()
const jogador = new Jogador(mapa, mapa.terreno)
const sounds = new Sound(mapa, jogador)

sounds.playPassaros()

function animate() {
  requestAnimationFrame(animate)
  if (mapa.terreno.terreno) {
    
    jogador.update()
    
    mapa.render(jogador)
    
    const deltaTime = clock.getDelta()
    if (mapa.entidades.passaros) mapa.entidades.passaros.update(deltaTime)
    if (mapa.entidades.monstros) mapa.entidades.monstros.update(deltaTime)
    if (mapa.entidades.peixes) mapa.entidades.peixes.update(deltaTime)
    
  } else {
    console.warn('Aguardando terreno.mesh estar disponível...');
  }
}

animate()