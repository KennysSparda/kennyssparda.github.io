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
  
  jogador.update()
  
  mapa.render(jogador)
  
  const deltaTime = clock.getDelta()
  if (mapa.criaturas.passaros) mapa.criaturas.passaros.update(deltaTime)
  if (mapa.criaturas.monstros) mapa.criaturas.monstros.update(deltaTime)
  if (mapa.criaturas.peixes) mapa.criaturas.peixes.update(deltaTime)
}

animate()