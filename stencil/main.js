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
const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  stencil: true,
});
camera.position.set(0, 0, 10);
renderer.setSize(width, height);
canvas.appendChild(renderer.domElement);
renderer.render(scene, camera);
const box = new THREE.Mesh(
  new THREE.BoxGeometry(100, 100, 100, 100, 100, 100),
  // new THREE.RawShaderMaterial({
  //   vertexShader: `
  //   precision mediump float;
  //   attribute vec3 position;
  //   attribute vec3 pos2;
  //   attribute vec2 uv;

  //   uniform mat4 modelMatrix;
  //   uniform mat4 viewMatrix;
  //   uniform mat4 projectionMatrix;

  //   // 获取时间
  //   uniform float uTime;
  //   varying float size;
  //   varying vec2 vUv;
  //   // highp  -2^16 - 2^16
  //   // mediump -2^10 - 2^10
  //   // lowp -2^8 - 2^8

  //   void main()
  //   {
  //       vUv=uv;
  //       gl_Position = projectionMatrix * viewMatrix * modelMatrix* vec4(position,1.0) ;
  //   }`,
  //   fragmentShader: `
  //   precision mediump float;

  //   void main()
  //   {
  //       vec2 screenCoord = gl_FragCoord.xy;
  //       gl_FragColor=vec4(screenCoord.x,0.0,0.0,1.0);
  //   }`,
  // })
  new THREE.MeshBasicMaterial({
    color: 0xff0000,
    stencilWrite: true,
    stencilRef: 1,
    stencilFunc: THREE.EqualStencilFunc,
  })
);
box.material.onBeforeCompile = function (shader) {
  // console.log('Vertex Shader:');
  console.log(shader.vertexShader);

  // console.log('Fragment Shader:');
  console.log(shader.fragmentShader);
};
scene.add(box);
box.position.set(0, 0, -100);
const stencilplane = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.RawShaderMaterial({
    vertexShader: `
    precision mediump float;
    attribute vec3 position;
    attribute vec3 pos2;
    attribute vec2 uv;

    uniform mat4 modelMatrix;
    uniform mat4 viewMatrix;
    uniform mat4 projectionMatrix;

    // 获取时间
    uniform float uTime;
    varying float size;
    varying vec2 vUv;
    // highp  -2^16 - 2^16
    // mediump -2^10 - 2^10
    // lowp -2^8 - 2^8

    void main()
    {
        vUv=uv;
        gl_Position = projectionMatrix * viewMatrix * modelMatrix* vec4(position,1.0) ;
    }`,
    fragmentShader: `
    precision mediump float;

    void main()
    {
        vec2 screenCoord = gl_FragCoord.xy;
        gl_FragColor=vec4(screenCoord.x,0.0,0.0,1.0);
    }`,
    // color: 0xffff00,
    stencilWrite: true,
    stencilRef: 1,
    stencilFunc: THREE.AlwaysStencilFunc,
    // transparent: true,
    // opacity: 0.5,
    depthWrite: false,
    colorWrite: false,
    stencilZPass: THREE.ReplaceStencilOp,
  })
);
stencilplane.renderOrder = -1;
scene.add(stencilplane);
cameracontrols = new CameraControls(camera, renderer.domElement);

const transparentobj=new THREE.Mesh(new THREE.BoxGeometry(2,2,2),new THREE.MeshBasicMaterial({
  transparent:true,
  opacity:0.1,
  color:0x00ff00
}))
scene.add(transparentobj)
// transparentobj.position.set(0,0,1)
const realobj=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({
  transparent:true,
  opacity:0.5,
  color:0xffff00,
  depthTest:false
}))
scene.add(realobj)
// realobj.renderOrder=-1
console.log(transparentobj.renderOrder)
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
