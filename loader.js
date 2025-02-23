function carregarModeloGLB(caminho, scene, posicao = { x: 0, y: 2, z: 0 }, escala = { x: 1, y: 1, z: 1 }) {
    return new Promise((resolve, reject) => {
        const loader = new THREE.GLTFLoader();
        loader.load(
            caminho,
            function (gltf) {
                const modelo = gltf.scene;
                modelo.position.set(posicao.x, posicao.y, posicao.z);
                modelo.scale.set(escala.x, escala.y, escala.z);
                scene.add(modelo);
                resolve(modelo);
            },
            function (xhr) {
                console.log(`Carregando: ${Math.round((xhr.loaded / xhr.total) * 100)}%`);
            },
            function (error) {
                console.error('Erro ao carregar modelo:', error);
                reject(error);
            }
        );
    });
  }
  