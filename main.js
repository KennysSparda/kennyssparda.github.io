import Mapa from './src/mapa/mapa.js'
import Player from './src/player/player.js'
import { THREE } from './src/etc/imports.js'

const clock = new THREE.Clock()

const mapa = new Mapa()
const player = new Player(mapa, mapa.terreno)

function animate() {
  requestAnimationFrame(animate)
  const deltaTime = clock.getDelta()

  player.update()
  
  mapa.render(player)
  if (mapa.criaturas.passaros) mapa.criaturas.passaros.update(deltaTime)
  if (mapa.criaturas.monstros) mapa.criaturas.monstros.update(deltaTime)
}

animate()