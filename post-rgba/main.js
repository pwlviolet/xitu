import './style.css';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { ColorPass } from './Colorpass';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min'
import CameraControls from 'camera-controls';
let gui = new GUI()
const params = {
  Brightness:1.0,
  Saturation:1.0,
  Contrast:1.0,
  HueShift:0.0
};
gui.add( params, 'Brightness' ).min( 0).max( 2);
gui.add( params, 'Saturation' ).min( -3 ).max( 4 );
gui.add( params, 'Contrast' ).min( -3 ).max( 4 );
gui.add( params, 'HueShift' ).min( 0 ).max( 1 );
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
const mapbg=await new THREE.TextureLoader().loadAsync('./asoulbg.png')
const plane= new THREE.Mesh(
  new THREE.PlaneGeometry(200,100,100,100),
  new THREE.MeshBasicMaterial({
    map:mapbg
  })
);
mapbg.colorSpace="srgb"
scene.add(plane);

//effect
let composer = new EffectComposer(renderer);
composer.setPixelRatio( window.devicePixelRatio );
composer.setSize( window.innerWidth, window.innerHeight );
composer.addPass( new RenderPass( scene, camera ) );
let colorpass=new ColorPass({
  Brightness:1.0,
  Saturation:1.0,
  Contrast:1.0,
  HueShift:0.0
})
composer.addPass(colorpass)
let animate = function () {
  colorpass.Brightness=params.Brightness
  colorpass.Saturation=params.Saturation
  colorpass.Contrast=params.Contrast
  colorpass.HueShift=params.HueShift
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