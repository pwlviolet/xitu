import './style.css';
import * as THREE from 'three';
import { gsap } from 'gsap';
import CameraControls from 'camera-controls';
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
//平面 plane
const tex = new THREE.TextureLoader().load(
  './jiantou.png'
);
tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
const geometry = new THREE.PlaneGeometry(1, 32).rotateX(-90);
const material = new THREE.ShaderMaterial({
  vertexShader: /* glsl */ `
    uniform float iTime;
    varying vec2 vUv;
void main(){
    vUv=uv;
    vec3 p=position;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
}
`,
  fragmentShader: /* glsl */ `
uniform float iTime;
varying vec2 vUv;
uniform sampler2D tex;
const float PI=3.14159265359;
mat2 rotation2d(float angle){
float s=sin(angle);
float c=cos(angle);
return mat2(
  c,-s,
  s,c
);
}
vec2 rotate(vec2 v,float angle){
return rotation2d(angle)*v;
}

void main() {
vec2 uv=vUv;
uv.y-=iTime;
uv.y=fract(uv.y*10.);
uv.y+=.15;
uv=rotate(uv,PI*.5);
vec4 col=texture(tex,uv);
gl_FragColor=col;
}
`,
  uniforms: {
    tex: {
      value: tex,
    },
    iTime: {
      value: 0,
    },
  },
  // transparent: true,
  side: 2,
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

//管道平面
let linePoints = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(10, 0, 0),
  new THREE.Vector3(20, 0, 0),
  new THREE.Vector3(20, 0, 10),
]
//1.创建曲线
let lineCurve = new THREE.CatmullRomCurve3(linePoints);
let geometry2 = new THREE.TubeGeometry(lineCurve, 100, 1, 2, false);
const textloader = new THREE.TextureLoader();
let texture2 = textloader.load("./z1.png");
texture2.repeat.set(1, 2);
texture2.wrapS = THREE.RepeatWrapping;
texture2.wrapT = THREE.RepeatWrapping;
let material2 = new THREE.MeshBasicMaterial({
  // color:0xff000,
  color: 0xffffff,
  map: texture2,
  transparent: true,
  blending: THREE.AdditiveBlending,
});
//创建物体
let mesh2 = new THREE.Mesh(geometry2, material2)
mesh2.onBeforeRender=()=>{
  mesh2.material.map.offset.x-=0.001
}
//创建动画
scene.add(mesh2)


//管道
let linePoints2 = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(-10, 0, 0),
  new THREE.Vector3(-20, 0, 0),
  new THREE.Vector3(-20, 0, 10),
]
//1.创建曲线
let lineCurve2 = new THREE.CatmullRomCurve3(linePoints2);
lineCurve2.tension=0.1
let geometry3 = new THREE.TubeGeometry(lineCurve2, 100, 1, 100, false);


let texture3 = textloader.load("./pic3.png");
texture3.repeat.set(10, 1);
texture3.wrapS = THREE.RepeatWrapping;
texture3.wrapT = THREE.RepeatWrapping;
let material3 = new THREE.MeshBasicMaterial({
  // color:0xff000,
  color: 0xffffff,
  map: texture3,
  transparent: true,
  blending: THREE.AdditiveBlending,
});
//创建物体
let mesh3 = new THREE.Mesh(geometry3, material3)
mesh3.position.set(-10,0,0)
mesh3.onBeforeRender=()=>{
  mesh3.material.map.offset.x-=0.01
}
//创建动画
scene.add(mesh3)

let animate = function () {
  material.uniforms.iTime.value += 0.001;
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
