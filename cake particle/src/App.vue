<template>
  <div id="container"></div>
</template>

<script setup>
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { reactive, onMounted, ref, watch } from "vue";
// // 顶点着色器
import basicVertexShader from "./shader/raw/vertexpoint.glsl?raw";
// // 片元着色器
import basicFragmentShader from "./shader/raw/fragmentpoint.glsl?raw";
import * as Mathmatrix from'./util/math'
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
  glbloader,
  cube,
  light;
scene = new THREE.Scene();

renderer = new THREE.WebGLRenderer({
  antialias: true,
});
raycaster = new THREE.Raycaster();

//创建着色器材质
const rawShaderMaterial = new THREE.RawShaderMaterial(
  {
    vertexShader: basicVertexShader,
    fragmentShader: basicFragmentShader,
    //   wireframe: true,
    side: THREE.DoubleSide,
    uniforms: {
      uSpeed: {
        value: 10,
      },
      uTime: {
        value: 10.0,
      },
      uMatrix:{
        value:Mathmatrix.getModelViewMatrix()
      },
      uPro:{
        value:Mathmatrix.getProjectionMatrix()
      }
    },
  }
)





glbloader = new GLTFLoader();
//创建一个数组用于存储顶点的位置
let cakevertices = [];
let cakeuv = [];
glbloader.load('./model/cake3.glb', (model) => {
  console.log(model.scene)
  cakevertices = combineBuffer(model.scene, 'position')
  cakeuv = combineBuffer(model.scene, 'uv')
  let cakebuffer = new THREE.BufferGeometry()
  cakebuffer.setAttribute('position', cakevertices)
  cakebuffer.setAttribute('uv', cakeuv)
  let cakepoint = new THREE.Points(cakebuffer, rawShaderMaterial)
  cakepoint.scale.set(10, 10, 10)
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
  renderer.shadowMap.enabled = true
  renderer.render(scene, camera);
  container.appendChild(renderer.domElement);

  clock = new THREE.Clock();
  let clock1 = new THREE.Clock()

  cameracontrols = new CameraControls(camera, renderer.domElement);

  let animate = function () {
    const elapsedTime = clock1.getElapsedTime();
    rawShaderMaterial.uniforms.uTime.value = elapsedTime;
    cameracontrols.update(clock.getDelta());
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };

  animate();
  // 页面缩放事件监听
window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight;
  // 更新渲染
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  // 更新相机
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});
});

function combineBuffer(model, bufferName) {

  let count = 0;

  model.traverse(function (child) {

    if (child.isMesh) {

      const buffer = child.geometry.attributes[bufferName];
      console.log(buffer)

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
