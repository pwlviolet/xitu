<template>
    <div id="test">
      </div>
</template>

<script setup>
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import{ MMDLoader } from "three/examples/jsm/loaders/MMDLoader.js"
import { MMDAnimationHelper } from 'three/examples/jsm/animation/MMDAnimationHelper.js';

import { Octree } from "three/examples/jsm/math/Octree.js";
import { OctreeHelper } from "three/examples/jsm/helpers/OctreeHelper.js";

import { Capsule } from "three/examples/jsm/math/Capsule.js";

import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

import { reactive, onMounted, ref } from "vue";
import Flowline from './mesh/FlowLine.js'
import * as dat from 'dat.gui'
// import Ammo from "../public/model/ammo.wasm.js";
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    // const listener = new THREE.AudioListener();
		// 		// camera.add( listener );
    //     var audio = new THREE.Audio(listener);
  var listener = new THREE.AudioListener();
// camera.add( listener );
// 创建一个非位置音频对象  用来控制播放
var audio = new THREE.Audio(listener);
// 创建一个音频加载器对象
var audioLoader = new THREE.AudioLoader();
// 加载音频文件，返回一个音频缓冲区对象作为回调函数参数
audioLoader.load('../public/model/我们快出发.mp3', function(AudioBuffer) {
  // console.log(AudioBuffer)
  // 音频缓冲区对象关联到音频对象audio
  audio.setBuffer(AudioBuffer);
  audio.setLoop(true); //是否循环
  audio.setVolume(0.5); //音量
  // 播放缓冲区中的音频数据
  audio.play(); //play播放、stop停止、pause暂停
})
function init()
{
  // const gui=new dat.GUI();
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
// console.log(cube1)
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
const vmdFiles = [ './model/《我们快出发》MMD动作数据.vmd' ];
const cameraFiles = [ 'model/wavefile_camera.vmd' ];
const audioFile = 'models/wavefile_short.mp3';
const audioParams = { delayTime: 160 * 1 / 30 };
const loader = new MMDLoader();
				loader.loadWithAnimation( modelFile, vmdFiles, function ( mmd ) {

					mesh = mmd.mesh;
          console.log(mmd.mesh)
          helper.add( mesh, {
						animation: mmd.animation,
						physics: true
					} );
          // helper.enable('animation')
					mesh.position.y = - 10;
					scene.add( mesh );
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
        
        
        
        
        // })

      //创建一个Mesh（绿色的3D立方体），并添加到场景中
    // const geometry = new THREE.PlaneGeometry( 10, 10, 1, 1)
    // const material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
    // const plane = new THREE.Mesh(geometry, material);
    // plane.rotation.x=-Math.PI/2
    // scene.add(plane);
    // console.log(plane)
    // const axesHelper = new THREE.AxesHelper( 5 );
    // scene.add( axesHelper );
      
      //设置照相机的位置
    camera.position.set(0, 5, 10);
    // camera.position.z = 5;
    //设置控制器
      // 添加控制器
    let controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    // controls.enablePan = false;
    controls.maxPolarAngle = 1.5;
    controls.minDistance = 0.01;
    controls.maxDistance = 70;
let clock=new THREE.Clock()
      //浏览器每次渲染的时候更新立方体的旋转角度
    let animate3d = function () {
        // cube.rotation.x += 0.01;
        // cube.rotation.y += 0.01;
        controls.update();
        helper.update( clock.getDelta() )
        renderer.render(scene, camera);
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect=window.innerWidth / window.innerHeight,     //当窗口变化时重新设置相机和渲染器的尺寸，可不写
        requestAnimationFrame(animate3d);
    };

    animate3d();
    light()
//     const light = new THREE.PointLight( 0xff0000, 1, 100 );
// light.position.set( 50, 50, 50 );
// scene.add( light )

    //创建纹理流动效果
// const flowLine=new Flowline();
// scene.add(flowLine.mesh);
}

onMounted(() => {
  Ammo().then(function(AmmoLib)
  {
    Ammo=AmmoLib;
    init();
  })
    // init()

});



function light() {
  // const lightgroup = new THREE.Group();
  // //light
  // const light = new THREE.AmbientLight(0xfff, 2); // soft white light
  // light.name = 'ambient_light';
  // // camera.add(light)
  // const light1 = new THREE.DirectionalLight(0xffffff, 0.5)
  // light1.position.set(-10, -10, 0)
  // light1.name = 'dir_light1'
  // const light2 = new THREE.DirectionalLight(0xffffff, 0.9)
  // light2.position.set(0, 5, 10)
  // light2.name = 'dir_light2'
  // const light3 = new THREE.DirectionalLight(0xffffff, 2.5)
  // light3.position.set(0, -10, 10)
  // light3.name = 'dir_light3'
  // const light4 = new THREE.DirectionalLight(0xffffff, 2.5)
  // light4.position.set(0, -10, -10)
  // light4.name = 'dir_light4'
  // const light5 = new THREE.DirectionalLight(0xffffff, 2.5)
  // light5.position.set(0, 10, 0)
  // light5.name = 'dir_light5'
  // // lightgroup.add(light1)
  // lightgroup.add(light2)
  // lightgroup.add(light3)
  // lightgroup.add(light4)
  // lightgroup.add(light5)
//   const light6 = new THREE.PointLight( 0xff0000, 5, 100 );
// light6.position.set( 50, 50, 50 );
// scene.add( light6 );
// const spotLight = new THREE.SpotLight( 0xffffff );
// spotLight.position.set( 100, 1, 100 );

// spotLight.castShadow = true;

// // spotLight.shadow.mapSize.width = 1024;
// // spotLight.shadow.mapSize.height = 1024;

// // spotLight.shadow.camera.near = 500;
// // spotLight.shadow.camera.far = 4000;
// // spotLight.shadow.camera.fov = 30;

// scene.add( spotLight );
  // scene.add(lightgroup);
  const ambient = new THREE.AmbientLight( 0x666666 );
				scene.add( ambient );

				const directionalLight = new THREE.DirectionalLight( 0x887766 );
				directionalLight.position.set( - 1, 1, 1 ).normalize();
				scene.add( directionalLight );

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
  box-shadow:12px rgba(199, 233, 9, 0.75);
  border: 1px solid rgba(18, 100, 233, 0.75);
  padding: 20px;
  color: #efefef;
}
</style>
