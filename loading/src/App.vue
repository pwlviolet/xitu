<template>
  <div id="test">
  </div>
  <div class="hp" id="hp"></div>
  <div class="progress" id="progress">
    <el-progress :text-inside="true" :stroke-width="26" :percentage="jd" />
  </div>
</template>

<script setup>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { reactive, onMounted, ref } from "vue";
let jd = ref(0)
function init() {
  //创建场景和相机
  const scene = new THREE.Scene();
  //创建一个天空盒
  const skybox = new THREE.BoxGeometry(200, 200, 200)
  const skyloader = new THREE.TextureLoader();  //加载材质
  const skymaterials = [
    new THREE.MeshBasicMaterial({ map: skyloader.load('./textures/px.jpg') }),
    new THREE.MeshBasicMaterial({ map: skyloader.load('./textures/nx.jpg') }),
    new THREE.MeshBasicMaterial({ map: skyloader.load('./textures/py.jpg') }),
    new THREE.MeshBasicMaterial({ map: skyloader.load('./textures/ny.jpg') }),
    new THREE.MeshBasicMaterial({ map: skyloader.load('./textures/pz.jpg') }),
    new THREE.MeshBasicMaterial({ map: skyloader.load('./textures/nz.jpg') }),
  ];
  skybox.scale(1, 1, -1);
  const cube = new THREE.Mesh(skybox, skymaterials);
  // console.log(cube1)
  scene.add(cube)
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  //创建渲染器，设置尺寸为窗口尺寸，并将渲染后的元素添加到body
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  let loader = new ColladaLoader();

  const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4); //环境光
  scene.add(ambientLight);

  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);//直线光
  directionalLight1.position.set(1, 1, 0).normalize();
  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);//直线光
  directionalLight2.position.set(-1, 1, 0).normalize();
  const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.8);//直线光
  directionalLight3.position.set(-1, -1, 0).normalize();
  scene.add(directionalLight1);
  scene.add(directionalLight2);
  scene.add(directionalLight3);
  //设置照相机的位置
  camera.position.set(0, 5, 10);
  // 添加控制器
  let controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;
  // controls.enablePan = false;
  controls.maxPolarAngle = 1.5;
  controls.minDistance = 0.01;
  controls.maxDistance = 70;

  let animate3d = function () {
    controls.update();
    renderer.render(scene, camera);
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight,     //当窗口变化时重新设置相机和渲染器的尺寸，可不写
      requestAnimationFrame(animate3d);
  };

  animate3d();
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  scene.add(directionalLight);
  loader.load('./model/elf.dae', function (object) {
    scene.add(object.scene)
    document.getElementById('hp').style.visibility = 'hidden'
    document.getElementById('progress').style.visibility = 'hidden'
  }, (xhr) => {
    console.log('加载完成的百分比' + (xhr.loaded / xhr.total * 100) + '%')
    jd.value = xhr.loaded / xhr.total * 100

  })
}

onMounted(() => {
  init()

});
</script>

<style>
* {
  margin: 0;
  padding: 0;
}

#container {
  width: 100vw;
  height: 100vh;
}

#test {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  pointer-events: none;
}

.elementContent {
  background-color: rgba(248, 2, 154, 0.68);
  box-shadow: 12px rgba(199, 233, 9, 0.75);
  border: 1px solid rgba(18, 100, 233, 0.75);
  padding: 20px;
  color: #efefef;
}

.progress {
  position: absolute;
  z-index: 10;
  left: 10%;
  width: 80%;
  top: 50%
}

.hp {
  position: absolute;
  background-color: black;
  z-index: 9;
  width: 100%;
  height: 100%;
}
</style>
