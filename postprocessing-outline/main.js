import './style.css';
import * as THREE from 'three';
import * as SceneUtils from 'three/addons/utils/SceneUtils.js';
import { gsap } from 'gsap';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MaterialXLoader } from 'three/addons/loaders/MaterialXLoader.js';
import { nodeFrame } from './webgl-legacy/nodes/WebGLNodes.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { NaddDshader } from '/NaddD.js';
// console.log(nodeFrame);
import CameraControls from 'camera-controls';
const canvas = document.getElementById('three-canvas');
CameraControls.install({ THREE: THREE });
let cameracontrols;
let clock = new THREE.Clock();
const width = canvas.clientWidth;
const height = canvas.clientHeight;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100000);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
camera.position.set(0, 0, 1000);
renderer.setSize(width, height);
canvas.appendChild(renderer.domElement);
renderer.render(scene, camera);
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(
  new RoomEnvironment(renderer),
  0.04
).texture;
scene.background = pmremGenerator.fromScene(
  new RoomEnvironment(renderer),
  0.04
).texture;
cameracontrols = new CameraControls(camera, renderer.domElement);

const material = await new MaterialXLoader()
  .loadAsync('./test.mtlx')
  .then(({ materials }) => Object.values(materials).pop());
const box = new THREE.Mesh(
  new THREE.BoxGeometry(50, 50, 50),
  new THREE.MeshBasicMaterial({
    color: 0xff0000,
  })
);
// const box2 = new THREE.Mesh(
//   new THREE.BoxGeometry(50, 50, 50),
//   new THREE.MeshBasicMaterial({
//     // color: 0x000000,
//   })
// );
// box.material.map = await new THREE.TextureLoader().loadAsync('./567.jpg');
scene.add(box);
// box2.position.set(100, 0, 0);
//创建rtt

let normalrt = new THREE.WebGLRenderTarget(width, height);
normalrt.texture.generateMipmaps = false;

let depthrt = new THREE.WebGLRenderTarget(width, height);
depthrt.texture.generateMipmaps = false;
//effect
let composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const effect1 = new ShaderPass(NaddDshader);
// console.log(effect1);
effect1.uniforms.resolution.value = new THREE.Vector2(width, height);
composer.addPass(effect1);
const effect2 = new ShaderPass(FXAAShader);
composer.addPass(effect2);
const effect3 = new OutputPass();
composer.addPass(effect3);
let animate = function () {
  requestAnimationFrame(animate);
  // nodeFrame.update();
  cameracontrols.update(clock.getDelta());

  //
  const initialBackground = scene.background;
  scene.background = null;
  scene.overrideMaterial = new THREE.MeshDepthMaterial();

  const initialClearAlpha = renderer.getClearAlpha();
  renderer.setClearAlpha(0);

  renderer.setRenderTarget(depthrt);
  renderer.render(scene, camera);
  effect1.uniforms.tMydepth.value = depthrt.texture;
  scene.overrideMaterial = new THREE.MeshNormalMaterial();
  renderer.setRenderTarget(normalrt);
  effect1.uniforms.tMynormal.value = normalrt.texture;
  // console.log(effect1);
  renderer.render(scene, camera);
  renderer.setRenderTarget(null);
  scene.background = initialBackground;
  // renderer.getClearAlpha(initialClearAlpha);
  // box2.material.map = normalrt.texture;
  scene.overrideMaterial = null;

  renderer.render(scene, camera);
  composer.render(renderer, scene);
};

animate();

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
