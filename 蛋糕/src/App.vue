<template>
  <div id="container"></div>
</template>

<script setup>
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Octree } from "three/examples/jsm/math/Octree.js";
import { OctreeHelper } from "three/examples/jsm/helpers/OctreeHelper.js";
import { Capsule } from "three/examples/jsm/math/Capsule.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { reactive, onMounted, ref, watch } from "vue";
import * as dat from "dat.gui";
// // 顶点着色器
import basicVertexShader from "./shader/raw/vert2.glsl?raw";
// // 片元着色器
import basicFragmentShader from "./shader/raw/frag3.glsl?raw";
import CameraControls from "camera-controls";
CameraControls.install({ THREE: THREE });
//全局
let scene,
  renderer,
  camera,
  fov,
  near,
  far,
  cameracontrols,
  clock,
  container,
  width,
  height,
  raycaster,
  fbxloader,
  cube,
  light;
scene = new THREE.Scene();

renderer = new THREE.WebGLRenderer({
  antialias: true,
});
raycaster = new THREE.Raycaster();
const gridHelper = new THREE.GridHelper(50, 50);
gridHelper.position.y = -1;
// scene.add(gridHelper);

// 创建纹理加载器对象
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load("./texture/1.png");
//创建着色器材质
const rawShaderMaterial = new THREE.RawShaderMaterial(
  {
    vertexShader: basicVertexShader,
    fragmentShader: basicFragmentShader,
    //   wireframe: true,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: {
        value: 10,
      },
      uTexture: {
        value: texture,
      },
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector3(100, 100, 1) },
    },
  }
)
// 创建平面
const floor = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(1, 1, 32, 32),
  rawShaderMaterial
);
rawShaderMaterial.transparent = true;
rawShaderMaterial.opacity = 0.1
console.log(floor);
// scene.add(floor);


let vertex = [];
//粒子效果
var particleCount = 10000;
var particles = new THREE.BufferGeometry();
for (var p = 0; p < particleCount; p++) {
  var particle = new THREE.Vector3(
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
    Math.random() * 2 - 1
  );
  particle.normalize();
  particle.multiplyScalar(200);
  vertex.push(particle.x)
  vertex.push(particle.y)
  vertex.push(particle.z)
  // particles.vertices.add(particle);
}
particles.setAttribute('position', new THREE.Float32BufferAttribute(vertex, 3))
// console.log(particles)
var particleMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.1,
  map: new THREE.TextureLoader().load(
    "https://threejs.org/examples/textures/sprites/disc.png"
  ),
  blending: THREE.AdditiveBlending,
  transparent: true,
  sizeAttenuation:true,
  depthTest:false,
  // vertexColors:true
});


// var particleSystem = new THREE.Points(particles, particleMaterial);
// particleSystem.position.set(0, 0, 0);
// scene.add(particleSystem);


fbxloader = new FBXLoader();
//创建一个数组用于存储顶点的位置
let cakevertices = [];
let cakeuv = [];
fbxloader.load('./model/cake.fbx', (model) => {
  // model.scale.set(0.1,0.1,0.1)
  cakevertices = combineBuffer(model, 'position')
  cakeuv = combineBuffer(model, 'uv')
  // scene.add(model)
  const cakebuffer=new THREE.BufferGeometry().setAttribute('position',cakevertices);
  let cakepoint=new THREE.Points(cakebuffer,particleMaterial)
  cakepoint.scale.set(2,2,2)
  cakepoint.rotateX(Math.PI/2*3)
  scene.add(cakepoint)
});

onMounted(() => {
  container = document.getElementById("container");
  width = container.clientWidth;
  height = container.clientHeight;
  fov = 60;
  near = 0.01;
  far = 10000;
  camera = new THREE.PerspectiveCamera(fov, width / height, near, far);
  camera.position.set(0, 0, 5);
  renderer.setSize(width, height);
  //  renderer.setPixelRatio(2);
  renderer.shadowMap.enabled = true
  renderer.render(scene, camera);
  container.appendChild(renderer.domElement);

  clock = new THREE.Clock();
  let clock1 = new THREE.Clock()

  cameracontrols = new CameraControls(camera, renderer.domElement);

  let animate = function () {
    const elapsedTime = clock1.getElapsedTime();
    //   console.log(elapsedTime);
    rawShaderMaterial.uniforms.iTime.value = elapsedTime;
    cameracontrols.update(clock.getDelta());
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };

  animate();
  renderer.domElement.addEventListener("click", mouseClick, false);
});
function mouseClick(e) {
  e.preventDefault();
  let mouse = new THREE.Vector2();
  // 通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1.
  mouse.x = ((e.clientX - renderer.domElement.getBoundingClientRect().left) / width) * 2 - 1;
  mouse.y = -((e.clientY - renderer.domElement.getBoundingClientRect().top) / height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  console.log(intersects);
}
window.addEventListener("resize", () => {
  let sizes = new Object();
  sizes.width = width;
  sizes.height = height;
  // 更新渲染
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // 更新相机
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});
function combineBuffer(model, bufferName) {

  let count = 0;

  model.traverse(function (child) {

    if (child.isMesh) {

      const buffer = child.geometry.attributes[bufferName];

      count += buffer.array.length;

    }

  });

  const combined = new Float32Array(count);

  let offset = 0;

  model.traverse(function (child) {

    if (child.isMesh) {

      const buffer = child.geometry.attributes[bufferName];

      combined.set(buffer.array, offset);
      offset += buffer.array.length;

    }

  });

  return new THREE.BufferAttribute(combined, 3);

}
function createMesh(positions, scene, scale, x, y, z, color) {

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', positions.clone());
  geometry.setAttribute('initialPosition', positions.clone());

  geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);

  const clones = [

    [6000, 0, - 4000],
    [5000, 0, 0],
    [1000, 0, 5000],
    [1000, 0, - 5000],
    [4000, 0, 2000],
    [- 4000, 0, 1000],
    [- 5000, 0, - 5000],

    [0, 0, 0]

  ];

  for (let i = 0; i < clones.length; i++) {

    const c = (i < clones.length - 1) ? 0x252525 : color;

    mesh = new THREE.Points(geometry, new THREE.PointsMaterial({ size: 30, color: c }));
    mesh.scale.x = mesh.scale.y = mesh.scale.z = scale;

    mesh.position.x = x + clones[i][0];
    mesh.position.y = y + clones[i][1];
    mesh.position.z = z + clones[i][2];

    parent.add(mesh);

    clonemeshes.push({ mesh: mesh, speed: 0.5 + Math.random() });

  }

  meshes.push({
    mesh: mesh, verticesDown: 0, verticesUp: 0, direction: 0, speed: 15, delay: Math.floor(200 + 200 * Math.random()),
    start: Math.floor(100 + 200 * Math.random()),
  });

}

</script>

<style>
* {
  margin: 0;
  padding: 0;
}

html {
  overflow: hidden;
}

#container {
  width: 100vw;
  height: 100vh;
}
</style>
