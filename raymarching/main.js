import './style.css';
import * as THREE from 'three';
import { gsap } from 'gsap';
import CameraControls from 'camera-controls';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

import { RGBShiftShader } from 'three/addons/shaders/RGBShiftShader.js';
import { DotScreenShader } from 'three/addons/shaders/DotScreenShader.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ClearPass } from 'three/addons/postprocessing/ClearPass.js';
import { blackholeshader } from './blackhole';
const canvas = document.getElementById('three-canvas');
CameraControls.install({ THREE: THREE });
let cameracontrols;
let clock = new THREE.Clock();
const width = canvas.clientWidth;
const height = canvas.clientHeight;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
camera.position.set(0, 0, 10);
renderer.setSize(width, height);
canvas.appendChild(renderer.domElement);
renderer.render(scene, camera);

cameracontrols = new CameraControls(camera, renderer.domElement);
const box = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({
    color: 0xff0000,
  })
);
scene.add(box);
let clearPass = new ClearPass();
let composer = new EffectComposer(renderer);
let iResolution = new THREE.Vector2(width, height);
blackholeshader.uniforms.iResolution.value=iResolution
blackholeshader.uniforms.U_Time.value += 5;
const shaderpass = new ShaderPass(blackholeshader);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(clearPass);
composer.addPass(shaderpass);
composer.addPass(new OutputPass());

let animate = function () {

  // box.rotation.x += 0.01;
  // box.rotation.y += 0.01;
  requestAnimationFrame(animate);
  cameracontrols.update(clock.getDelta());

  // renderer.render(scene, camera);
  composer.render();
};

animate();

window.addEventListener('resize', () => {
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  composer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
