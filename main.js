const mapa = new Mapa();
const player = new Player(mapa.camera, mapa.renderer.domElement, mapa.scene, mapa);

function animate() {
  requestAnimationFrame(animate);
  
  player.update();
  mapa.render();
}

animate();