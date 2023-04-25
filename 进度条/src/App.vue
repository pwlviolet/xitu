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
import Stats from "three/examples/jsm/libs/stats.module.js";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import{ MMDLoader } from "three/examples/jsm/loaders/MMDLoader.js"

import { Octree } from "three/examples/jsm/math/Octree.js";
import { OctreeHelper } from "three/examples/jsm/helpers/OctreeHelper.js";

import { Capsule } from "three/examples/jsm/math/Capsule.js";

import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { MMDAnimationHelper } from 'three/examples/jsm/animation/MMDAnimationHelper.js';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { reactive, onMounted, ref } from "vue";
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import Flowline from './mesh/FlowLine.js'
import * as dat from 'dat.gui'
// import * as Ammo from '../node_modules/ammojs'
// Ammo().then((Ammo) => {
//   init()
// })
let jd=ref(0)
function init()
{
  			// 	let helper = new MMDAnimationHelper( {
				// 	afterglow: 2.0
				// } );
  // const gui=new dat.GUI();
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

// const vmdFiles = [ './model/《我们快出发》MMD动作数据.vmd' ];
// Instantiate a loader
let mesh
// const modelFile = './model/miku_v2.pmd';
// const vmdFiles = [ 'model/wavefile_v2.vmd' ];
// const loader = new MMDLoader();
// 				loader.loadWithAnimation( modelFile, vmdFiles, function ( mmd ) {

// 					mesh = mmd.mesh;
// 					mesh.position.y = - 10;
// 					scene.add( mesh );})

				// new MTLLoader()
				// 	.load( './model/male02.mtl'), function ( materials ) {

				// 		materials.preload();

				// 		new OBJLoader()
				// 			.setMaterials( materials )
				// 			.load( './model/male02.obj', function ( object ) {

				// 				// object.position.y = - 95;
        //         object.scale.set(0.1,0.1,0.1)
				// 				scene.add( object );

				// 			});

				// 	} ;

// let materials=new MTLLoader().load('./model/male02.mtl');
let loader=new ColladaLoader( );

				const ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 ); //环境光
				scene.add( ambientLight );

				const directionalLight1 = new THREE.DirectionalLight( 0xffffff,0.8);//直线光
				directionalLight1.position.set( 1, 1, 0 ).normalize();
        const directionalLight2 = new THREE.DirectionalLight( 0xffffff,0.8);//直线光
        directionalLight2.position.set( -1, 1, 0 ).normalize();
                const directionalLight3 = new THREE.DirectionalLight( 0xffffff,0.8);//直线光
        directionalLight3.position.set( -1, -1, 0 ).normalize();
        scene.add( directionalLight1 );
        scene.add( directionalLight2 );
        scene.add( directionalLight3 );
				// new MTLLoader()
				// 	.load( './model/male02.mtl', function ( materials ) {
				// 		materials.preload();
				// 		new OBJLoader()
				// 			.setMaterials( materials )
				// 			.load( './model/male02.obj', function ( object ) {
				// 				object.position.y = - 95;
				// 				scene.add( object );
				// 			} );
				// 	} );
// Load a MMD model
// loader.load(
// 	// path to PMD/PMX file
// 	'./model/《我们快出发》MMD动作数据.vmd',
// 	// called when the resource is loaded
// 	function ( mesh ) {

// 		scene.add( mesh );

// 	})


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

      //浏览器每次渲染的时候更新立方体的旋转角度
    let animate3d = function () {
        // cube.rotation.x += 0.01;
        // cube.rotation.y += 0.01;
        controls.update();
        renderer.render(scene, camera);
        // render3d.render(scene, camera)
        renderer.setSize(window.innerWidth, window.innerHeight);
        // render3d.setSize(window.innerWidth, window.innerHeight);
        camera.aspect=window.innerWidth / window.innerHeight,     //当窗口变化时重新设置相机和渲染器的尺寸，可不写
        requestAnimationFrame(animate3d);
    };

    animate3d();
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
scene.add( directionalLight );
loader.load('./model/elf.dae',function (object)
{
  // object.scene.scale.set(2,2,2)
  scene.add(object.scene)
  document.getElementById('hp').style.visibility='hidden'
  document.getElementById('progress').style.visibility='hidden'
},(xhr)=>{
  console.log('加载完成的百分比'+(xhr.loaded/xhr.total*100)+'%')
  jd.value=xhr.loaded/xhr.total*100
  // if(jd.value==100)
  // {
  //   document.getElementById('hp').style.visibility='hidden'
  //   document.getElementById('progress').style.visibility='hidden'
  // }

})
    //创建纹理流动效果
// const flowLine=new Flowline();
// scene.add(flowLine.mesh);
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
  box-shadow:12px rgba(199, 233, 9, 0.75);
  border: 1px solid rgba(18, 100, 233, 0.75);
  padding: 20px;
  color: #efefef;
}
.progress{
  position: absolute;
  z-index: 10;
  left: 10%;
  width: 80%;
  top:50%
}
.hp{
  position: absolute;
  background-color: black;
  z-index: 9;
  width: 100%;
  height: 100%;
}
</style>
