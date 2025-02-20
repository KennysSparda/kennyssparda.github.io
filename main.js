const mapa = new Mapa();
const player = new Player(mapa);

function animate() {
  requestAnimationFrame(animate);
  
  player.update();
  
  mapa.render(player);

}

animate();