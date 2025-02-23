import Mapa from './src/mapa/mapa.js'
import Player from './src/player/player.js'
import Sound from './src/sound/sounds.js'

import { THREE } from './src/etc/imports.js'

const clock = new THREE.Clock()

const mapa = new Mapa()
const player = new Player(mapa, mapa.terreno)
const sounds = new Sound(mapa, player)
sounds.playPassaroSom
function animate() {
  requestAnimationFrame(animate)
  
  player.update()
  
  mapa.render(player)
  
  const deltaTime = clock.getDelta()
  if (mapa.criaturas.passaros) mapa.criaturas.passaros.update(deltaTime)
  if (mapa.criaturas.monstros) mapa.criaturas.monstros.update(deltaTime)
  if (mapa.criaturas.peixes) mapa.criaturas.peixes.update(deltaTime)
}

animate()