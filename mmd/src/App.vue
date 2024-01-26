<template>
  <div id="test">
  </div>
</template>

<script setup>
import * as THREE from "three";
import { MMDLoader } from "three/examples/jsm/loaders/MMDLoader.js"
import { MMDAnimationHelper } from 'three/examples/jsm/animation/MMDAnimationHelper.js';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { reactive, onMounted, ref } from "vue";
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

var listener = new THREE.AudioListener();
// 创建一个非位置音频对象  用来控制播放
var audio = new THREE.Audio(listener);
// 创建一个音频加载器对象
var audioLoader = new THREE.AudioLoader();
// 加载音频文件，返回一个音频缓冲区对象作为回调函数参数
audioLoader.load('/model/我们快出发.mp3', function (AudioBuffer) {
  // 音频缓冲区对象关联到音频对象audio
  audio.setBuffer(AudioBuffer);
  audio.setLoop(true); //是否循环
  audio.setVolume(0.5); //音量
  // 播放缓冲区中的音频数据
  audio.play(); //play播放、stop停止、pause暂停
})
function init() {
  //创建场景和相机

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
  scene.add(cube)
  //创建渲染器，设置尺寸为窗口尺寸，并将渲染后的元素添加到body
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  //3d渲染器
  let mesh
  let helper = new MMDAnimationHelper();
  // Instantiate a loader
  const modelFile = './model/星穹铁道—克拉拉/星穹铁道—克拉拉/克拉拉.pmx';
  const vmdFiles = ['./model/《我们快出发》MMD动作数据.vmd'];
  const loader = new MMDLoader();
  loader.loadWithAnimation(modelFile, vmdFiles, function (mmd) {
    mesh = mmd.mesh;
    console.log(mmd.mesh)
    helper.add(mesh, {
      animation: mmd.animation,
      physics: true
    });
    mesh.position.y = - 10;
    scene.add(mesh);
    // loader.loadAnimation( cameraFiles, camera, function ( cameraAnimation ) {
    // helper.add( camera, {
    //   animation: cameraAnimation
    // } );

    // new THREE.AudioLoader().load( audioFile, function ( buffer ) {
    //   audio.setBuffer( buffer );
    //   audio.setVolume(0.5);
    //   audio.play()
    //   // helper.add( audio, audioParams );
    //   // // scene.add( mesh );
    //   // ready = true;

    // },  );

    // },  );

  },);

  //设置照相机的位置
  camera.position.set(0, 5, 10);
  // camera.position.z = 5;
  //设置控制器
  // 添加控制器
  let controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;
  controls.maxPolarAngle = 1.5;
  controls.minDistance = 0.01;
  controls.maxDistance = 70;
  let clock = new THREE.Clock()
  //浏览器每次渲染的时候更新立方体的旋转角度
  let animate3d = function () {
    controls.update();
    helper.update(clock.getDelta())
    renderer.render(scene, camera);
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight,     //当窗口变化时重新设置相机和渲染器的尺寸，可不写
      requestAnimationFrame(animate3d);
  };

  animate3d();
  light()

}

onMounted(() => {
  Ammo().then(function (AmmoLib) {
    Ammo = AmmoLib;
    init();
  })

});



function light() {
  const ambient = new THREE.AmbientLight(0x666666);
  scene.add(ambient);
  const directionalLight = new THREE.DirectionalLight(0x887766);
  directionalLight.position.set(- 1, 1, 1).normalize();
  scene.add(directionalLight);

}
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
</style>
