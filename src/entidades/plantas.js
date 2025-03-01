import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export default class Plantas {
  constructor(mundo, modelo, escala = 1, animacao = true, loop) {
    this.mundo = mundo;
    this.scene = mundo.scene;
    this.renderizador = mundo.renderizador
    this.modelo = modelo;
    this.escala = escala;
    this.animacao = animacao;
    this.loop = loop;

    this.meshes = [];
    this.mixer = [];
    this.modeloOriginal = null;
    this.animations = null;

    this.loader = new GLTFLoader();
    this.carregarModelo();
  }

  carregarModelo() {
    this.loader.load(this.modelo, (gltf) => {
      this.modeloOriginal = gltf.scene;
      this.modeloOriginal.scale.set(this.escala, this.escala, this.escala);
      this.animations = gltf.animations;
    
      this.modeloOriginal.traverse((child) => {
        if (child.isMesh) {
          child.receiveShadow = true;
          child.castShadow = true;
          child.renderOrder = 1; // Objetos com menor valor são renderizados primeiro
        }
      });
    });
  }

  adicionarPlanta(posicao) {
    if (!this.modeloOriginal) {
      return;
    }

    const mesh = this.modeloOriginal.clone();
    mesh.rotation.y = Math.random() * Math.PI * 2;
    mesh.position.set(posicao.x, posicao.y, posicao.z);

    const minEscala = 0.5;
    const maxEscala = 0.9;
    const fatorAleatorio = Math.random() * (maxEscala - minEscala) + minEscala;
    const novaEscala = this.escala * fatorAleatorio;

    mesh.scale.set(novaEscala, novaEscala, novaEscala);
    this.scene.add(mesh);
    this.meshes.push(mesh);

    if (this.animacao && this.animations && this.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(mesh);
      const action = mixer.clipAction(this.animations[0]);
      action.setLoop(this.loop ? THREE.LoopRepeat : THREE.LoopOnce);
      action.clampWhenFinished = true;
      action.setDuration(5);
      action.play();
      this.mixer.push(mixer);
    }
  }

  verificarColisao() {
    const jogadorPos = this.renderizador.camera.position;
    const raioColisao = 1.0; // Ajuste conforme necessário

    this.meshes.forEach(planta => {
      const distancia = jogadorPos.distanceTo(planta.position);
      if (distancia <= raioColisao) {
        console.log("Colisão detectada com planta!");
        
        // Empurra o jogador para fora da planta
        const direcaoFuga = new THREE.Vector3().subVectors(jogadorPos, planta.position).normalize();
        jogadorPos.addScaledVector(direcaoFuga, raioColisao - distancia);
      }
    });
  }

  update(deltaTime) {
    this.verificarColisao();
    this.mixer.forEach((mixer) => mixer.update(deltaTime));
  }
}
