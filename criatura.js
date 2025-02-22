class Criatura {
  constructor(scene) {
    const loader = new THREE.TextureLoader();
    loader.load('/assets/criatura.png', (texture) => {
      const geometry = new THREE.BoxGeometry(1, 1, 1); // Cubo de 3x3x3

      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true 
      });

      // Criando o cubo com a textura aplicada a todos os lados
      const materiais = [
        material, material, material, material, material, material
      ];

      this.mesh = new THREE.Mesh(geometry, materiais);
      this.mesh.position.set(0, 1, -5); // Posição inicial
      this.velocidade = 0.6

      scene.add(this.mesh);
    });
  }

  seguir(player) {
    if (!this.mesh) return; // Evita erro se ainda não carregou
    
    const posicaoPlayer = new THREE.Vector3(player.playerPositionX, player.playerPositionY, player.playerPositionZ);
    
    // Calcula direção até o jogador
    const direcao = new THREE.Vector3();
    direcao.subVectors(posicaoPlayer, this.mesh.position).normalize();
    
    // Move a criatura na direção do jogador
    this.mesh.position.add(direcao.multiplyScalar(this.velocidade));
  }
}
