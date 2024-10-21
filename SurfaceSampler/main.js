import './style.css';
import * as THREE from 'three';
import { gsap } from 'gsap';
import CameraControls from 'camera-controls';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
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
console.log(renderer.info)
camera.position.set(0, 0, 40);
renderer.setSize(width, height);
canvas.appendChild(renderer.domElement);
renderer.render(scene, camera);

cameracontrols = new CameraControls(camera, renderer.domElement);
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(10,100,100),
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
  })
);
scene.add(sphere);
// scene.add(new THREE.Mesh(
//   new THREE.SphereGeometry(10,10,100),
//   new THREE.MeshBasicMaterial({
//     color: 0xffff00,
//   })
// ))
const sampler=new MeshSurfaceSampler(sphere)
.build();
const mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(),new THREE.MeshBasicMaterial({
  color:0xff0000
}),10);
console.log(mesh)
const position = new THREE.Vector3();
const matrix = new THREE.Matrix4();
for ( let i = 0; i < 10; i ++ ) {

	sampler.sample( position );

	matrix.makeTranslation( position.x, position.y, position.z );

	mesh.setMatrixAt( i, matrix );

}

scene.add( mesh );

let animate = function () {
  requestAnimationFrame(animate);
  cameracontrols.update(clock.getDelta());

  renderer.render(scene, camera);
  // composer.render();
};

animate();

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // composer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
