document.addEventListener("dblclick", (event) => {
  event.preventDefault();
}, { passive: false });

import Mundo from './mundo/mundo.js'
import Renderizador from './render/renderizador.js'
import GameController from './game/gameController.js'
import Jogador from './jogador/jogador.js'
import Sound from './sound/sounds.js'
import Config from './config/config.js'
import MenuConfig from "./ui/menuConfig.js"

import { THREE } from './etc/imports.js'

const clock = new THREE.Clock()
const config = new Config()

let jogoPausado = false;

// Criar os módulos principais
const sounds = new Sound(config)
const renderizador = new Renderizador(config)
const mundo = new Mundo(renderizador) // Passamos a cena do Renderizador
const gameController = new GameController(mundo, renderizador, sounds, config)
const menuConfig = new MenuConfig(gameController, jogoPausado)
const jogador = new Jogador(renderizador, mundo, mundo.terreno, sounds, menuConfig)

sounds.playMusica()

function animate() {
  requestAnimationFrame(animate)

  if(menuConfig.jogoPausado) {
    document.getElementById("mobileControls").classList.add("hidden")  
    if (menuConfig.jogoPausado) return; 
  } else {
    document.getElementById("mobileControls").classList.remove("hidden")
  }


  if (mundo.terreno.terreno) {
    jogador.update()
    gameController.atualizar(jogador) // Agora o GameController gerencia tudo

    const deltaTime = clock.getDelta()
    if (mundo.entidades.passaros) mundo.entidades.passaros.update(deltaTime)
    if (mundo.entidades.monstros) mundo.entidades.monstros.update(deltaTime)
    if (mundo.entidades.peixes) mundo.entidades.peixes.update(deltaTime)
    if (mundo.entidades.arvores) mundo.entidades.arvores.update(deltaTime)

  } else {
    console.warn('Aguardando terreno.mesh estar disponível...');
  }
}

animate()

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().then(() => {
      ajustarRenderizador();
    });
  } else {
    document.exitFullscreen().then(() => {
      ajustarRenderizador();
    });
  }
}

// Atualiza o tamanho do renderer ao mudar de tamanho de tela
function ajustarRenderizador() {
  renderizador.renderer.setSize(window.innerWidth, window.innerHeight);
  renderizador.camera.aspect = window.innerWidth / window.innerHeight;
  renderizador.camera.updateProjectionMatrix();
}

// Adicionar evento ao botão
document.getElementById("btnFullscreen").addEventListener("click", toggleFullscreen);

// Adicionar evento para ajustar quando a tela for redimensionada manualmente
window.addEventListener("resize", ajustarRenderizador);


