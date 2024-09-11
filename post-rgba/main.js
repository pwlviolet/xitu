import './style.css';
import * as THREE from 'three';
import * as SceneUtils from 'three/addons/utils/SceneUtils.js';
import { gsap } from 'gsap';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { testcolorshader } from './postcolor';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min'
import CameraControls from 'camera-controls';
let gui = new GUI()
let eventobj = {
  _Brightness:1.0,
  _Saturation:1.0,
  _Contrast:1.0
}
testcolorshader.uniforms._Brightness.value=eventobj._Brightness
testcolorshader.uniforms._Saturation.value=eventobj._Saturation
testcolorshader.uniforms._Contrast.value=eventobj._Contrast
gui.add(eventobj,"_Brightness").min(-10.0).max(10.0).step(0.1) .onChange((value)=>{
  // console.log(testcolorshader);
  testcolorshader.uniforms._Brightness.value=eventobj._Brightness
  updateComposer();
// testcolorshader.uniforms._Saturation.value=eventobj._Saturation
// composer.render()
// testcolorshader.uniforms._Contrast.value=eventobj._Contrast
})
// gui.add(eventobj, 'exit').name('exit');
// gui.add(eventobj, 'lasso').name('lasso');
// gui.add(eventobj, 'debug').name('debug');

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
  // colorSpace:"srgb"
});
// renderer.outputColorSpace="srgb"
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
const mapbg=await new THREE.TextureLoader().loadAsync('./asoulbg.png')
const box = new THREE.Mesh(
  new THREE.PlaneGeometry(200,100,100,100),
  new THREE.MeshBasicMaterial({
    map:mapbg
  })
);
mapbg.colorSpace="srgb"
scene.add(box);

//创建rtt

let normalrt = new THREE.WebGLRenderTarget(width, height);
normalrt.texture.generateMipmaps = false;

let depthrt = new THREE.WebGLRenderTarget(width, height);
depthrt.texture.generateMipmaps = false;
//effect
let composer = new EffectComposer(renderer);
composer.setPixelRatio( window.devicePixelRatio );
composer.setSize( window.innerWidth, window.innerHeight );
composer.addPass( new RenderPass( scene, camera ) );
const colorpass=new ShaderPass(testcolorshader)
composer.addPass(colorpass)
let animate = function () {
  requestAnimationFrame(animate);
  cameracontrols.update(clock.getDelta());
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
// function updateComposer()
// {
//   composer.removePass(colorpass)
//   composer.addPass(colorpass)
//   composer.render()
// }