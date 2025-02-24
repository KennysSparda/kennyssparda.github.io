import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export default class Plantas {
  constructor(mapa, modelo, escala = 1, animacao = true, loop) {
    this.mapa = mapa;
    this.scene = mapa.scene;
    this.modelo = modelo;
    this.escala = escala;
    this.animacao = animacao;
    this.loop = loop;

    this.meshes = [];
    this.mixer = [];
    this.modeloOriginal = null; // Guarda o modelo carregado
    this.animations = null;      // Guarda as animações, se houver

    this.loader = new GLTFLoader();
    this.carregarModelo();
  }

  carregarModelo() {
    this.loader.load(this.modelo, (gltf) => {
      this.modeloOriginal = gltf.scene;
      this.modeloOriginal.scale.set(this.escala, this.escala, this.escala);
      this.animations = gltf.animations;
      console.log("Modelo carregado, pode adicionar as plantas agora.");
    });
  }

  // Método pra adicionar uma planta em uma posição específica
  adicionarPlanta(posicao) {
    // posicao deve ser um objeto: { x, y, z }
    if (!this.modeloOriginal) {
      console.warn("O modelo ainda não foi carregado. Tenta de novo depois!");
      return;
    }

    const mesh = this.modeloOriginal.clone();
    mesh.rotation.y = Math.random() * Math.PI * 2; // Rotação aleatória pra dar aquele toque natural
    mesh.position.set(posicao.x, posicao.y, posicao.z);

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

    console.log('plantas adicionadas')
  }

  update(deltaTime) {
    this.mixer.forEach((mixer) => mixer.update(deltaTime));
  }
}
