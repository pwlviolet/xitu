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
const lights = {
  useAmbientLights: 0b100000, // 1
  usePointLights: 0b010000, // 2
  useDirectionalLights: 0b001000, // 4
  useSpotLights: 0b000100, // 8
  useHemisphereLights: 0b000010, // 16
  useEnvironment: 0b000001, // 32
};
scene.background = new THREE.Color(0x598eff);
const fogVolume = new OpenVDB.FogVolume(new OpenVDB.CloudVolume({
  height: 0.2,
  density: 0.3
}), {
  resolution: 100,
  progressive: true,
  steps: 100,
  absorbance: 1.,
  baseColor: 0x000000,
  lights: lights.useEnvironment | lights.useDirectionalLights,
  densityCutoff: 0.,
});
fogVolume.scale.setScalar(1000.0);
fogVolume.position.y += 300.0;
scene.add(fogVolume);
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
