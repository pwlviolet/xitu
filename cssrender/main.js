import './style.css';
import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject,CSS3DSprite } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import CameraControls from 'camera-controls';
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
camera.position.set(0, 0, 100);
renderer.setSize(width, height);
canvas.appendChild(renderer.domElement);


cameracontrols = new CameraControls(camera, renderer.domElement);
const box=new THREE.Mesh(new THREE.BoxGeometry(10,10,10),new THREE.MeshBasicMaterial({
  color:0xff0000
}))
scene.add(box)

//css3d
const render3d=new CSS3DRenderer()
canvas.appendChild(render3d.domElement)
render3d.setSize(width,height)
render3d.domElement.style.top = 0;
render3d.domElement.style.position = 'absolute'
render3d.domElement.style.zIndex = '100'
render3d.domElement.style.pointerEvents = 'none'

//css3dobj
const element = document.createElement('div');
element.className = 'css3d'
element.innerHTML = `
    <div class="css3dobj" style="color:white" >
      <h3>css3dobj</h3>
    </div>
  `;
const objcss3d = new CSS3DObject(element);
objcss3d.position.set(0,10,0)
objcss3d.scale.set(0.1,0.1,0.1)
//css3dsprite
const element1 = document.createElement('div');
element1.className = 'css3d'
element1.innerHTML = `
    <div class="css3dsprite" style="color:white" >
      <h3>css3sprite</h3>
    </div>
  `;
const css3dsprite = new CSS3DSprite(element1);
css3dsprite.position.set(10,10,0)
css3dsprite.scale.set(0.1,0.1,0.1)

box.add(objcss3d)
box.add(css3dsprite)
renderer.render(scene, camera);
render3d.render(scene,camera)
let animate = function () {
  requestAnimationFrame(animate);
  cameracontrols.update(clock.getDelta());
  renderer.render(scene, camera);
  render3d.render(scene,camera)
};

animate();

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  render3d.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
