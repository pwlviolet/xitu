import './style.css';
import * as THREE from 'three';
import { gsap } from 'gsap';
import CameraControls from 'camera-controls';
import * as OpenVDB from 'openvdb/three';
const canvas = document.getElementById('three-canvas');
CameraControls.install({ THREE: THREE });
let cameracontrols;
let clock = new THREE.Clock();
const width = canvas.clientWidth;
const height = canvas.clientHeight;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
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

new OpenVDB.VDBLoader().load('./model/dragon.vdb', function (vdb) {
  const fogVolume = new OpenVDB.FogVolume(vdb, {
    resolution: 100,
    progressive: true,
    steps: 20,
    absorbance: 1.0,
    baseColor: 0xffffff,
  });

  scene.add(fogVolume);
});
// scene.add(box);
const light=new THREE.AmbientLight(0xffffff,10)
scene.add(light)
cameracontrols = new CameraControls(camera, renderer.domElement);

// console.log(box);

let animate = function () {
  // material.uniforms.iTime.value += 0.001;
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
