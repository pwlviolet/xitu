import './style.css';
import * as THREE from 'three';
import { gsap } from 'gsap';
import CameraControls from 'camera-controls';
import { createTube } from './tube.js';
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
const box = new THREE.Mesh(
  new THREE.BoxGeometry(),
  new THREE.MeshBasicMaterial({
    color: 0xffff00,
  })
);
const box2 = new THREE.Mesh(
  new THREE.BoxGeometry(),
  new THREE.MeshBasicMaterial({
    color: 0xff0000,
  })
);
const box3 = new THREE.Mesh(
  new THREE.BoxGeometry(),
  new THREE.MeshBasicMaterial({
    color: 0x0000ff,
  })
);
box2.position.set(0, 1, 0);
box3.position.set(0, -1, 0);
scene.add(box, box2, box3);
cameracontrols = new CameraControls(camera, renderer.domElement);
gsap.to(box.position, {
  x: 3,
  duration: 2,
  yoyo: true,
  repeat: -1,
});
// console.log(box);
const pointarr = [new THREE.Vector3(-3, 0, 0), new THREE.Vector3(3, 0, 0)];
const tube = createTube(pointarr, 0.5);
tube.material.transparent = true;
tube.material.opacity = 0.5;
const flow = createTube(pointarr, 0.1);
flow.material.color = new THREE.Color(1, 0, 0);
scene.add(tube, flow);
let animate = function () {
  requestAnimationFrame(animate);
  cameracontrols.update(clock.getDelta());
  renderer.render(scene, camera);
};

animate();

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
