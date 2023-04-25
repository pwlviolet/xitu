<template>
  <!-- <div id="container"></div> -->
</template>

<script setup>
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { Octree } from "three/examples/jsm/math/Octree.js";
import { OctreeHelper } from "three/examples/jsm/helpers/OctreeHelper.js";

import { Capsule } from "three/examples/jsm/math/Capsule.js";

import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { reactive, onMounted, ref } from "vue";
import Flowline from './mesh/FlowLine.js'
import * as dat from 'dat.gui'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import SpriteMixer from '../public/build/SpriteMixer'

const scene = new THREE.Scene();
let  delta, actionSprite, running;
		var actions = {};
    let clock = new THREE.Clock();
    let loader = new THREE.TextureLoader();
    let spriteMixer = SpriteMixer();
function init()
{
  const gui=new dat.GUI();
        //创建场景和相机

    // var camera = new THREE.OrthographicCamera(-1, 3, 1.5, -1.5, 1, 10);
    // camera.position.set(2, -3, 5);
    // camera.lookAt(new THREE.Vector3(0, 0, 0));
    // scene.add(camera);
    var cube1 = new THREE.Mesh(new TextGeometry('Hello'),
        new THREE.MeshBasicMaterial({
            color: 0xff0000,
            // wireframe: true
        })
);
// scene.add(cube1);
// cube1.visible=false
console.log(cube1)
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

      
      //设置照相机的位置
    camera.position.set(0, 5, 10);
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
    let animate = function () {
        controls.update();
        renderer.render(scene, camera);
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect=window.innerWidth / window.innerHeight,     //当窗口变化时重新设置相机和渲染器的尺寸，可不写
        requestAnimationFrame(animate);
        var delta = clock.getDelta();
        // clock is a THREE.Clock object
			
	      spriteMixer.update(delta);
    };

    animate();
    
}

onMounted(() => {
    init()
    // let scene, camera, renderer, stats;

    loader.load("./textures/1.png", (texture)=> {
    let actionSprite = spriteMixer.ActionSprite( texture, 4, 4 );
    console.log(actionSprite)
    actionSprite.name='111'
    actionSprite.setFrame( 9 );
    // actions.runRight = spriteMixer.Action(actionSprite, 0, 8, 40);
    actions.runLeft = spriteMixer.Action(actionSprite, 0, 16, 500);
    actions.runLeft.playLoop()
    actionSprite.scale.set(1.7, 2, 1);
    scene.add( actionSprite );
})
console.log(scene)
    console.log(spriteMixer)
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
html,#App,body{
  overflow: hidden;
}
</style>
