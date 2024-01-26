<template>
  <div class="first">
  <p>wsad 上下左右 空格跳动 </p>
</div>
</template>

<script setup>
import * as THREE from "three";
import { Octree } from "three/examples/jsm/math/Octree.js";
import { Capsule } from "three/examples/jsm/math/Capsule.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
import { onMounted } from "vue";
//全局
let scene,
  renderer,
  camera,
  fov,
  near,
  far,
  width,
  height,
  raycaster,
  clock,
  light,
  worldOctree,
  playerCollider,
  down,
  composer,
  outlinePass;
//选中的物体
let selectedObjects = [];
parent = new THREE.Object3D();
//设置重力为30
const GRAVITY = 30;
const STEPS_PER_FRAME = 5;
const mouse = new THREE.Vector2();


const vertexShader = `
		varying vec3 vPosition;
		varying vec2 vUv;
		void main() { 
			vUv = uv; 
			vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
			gl_Position = projectionMatrix * mvPosition;
		}
		`;
const fragmentShader = `
		uniform float iTime;
		varying vec2 vUv;
        void main(void) {
            vec2 uv = (vUv - 0.5) * 2.0;
            float t = iTime * .1 + ((.25 + .05 * sin(iTime * .1))/(length(uv.xy) + .07)) * 2.2;
            float si = sin(t);
            float co = cos(t);
            mat2 ma = mat2(co, si, -si, co);

            float v1, v2, v3;
            v1 = v2 = v3 = 0.0;
            
            float s = 0.0;
            for (int i = 0; i < 90; i++)
            {
                vec3 p = s * vec3(uv, 0.0);
                p.xy *= ma;
                p += vec3(.22, .3, s - 1.5 - sin(iTime * .13) * .1);
                for (int i = 0; i < 8; i++)	p = abs(p) / dot(p,p) - 0.659;
                v1 += dot(p,p) * .0015 * (1.8 + sin(length(uv.xy * 13.0) + .5  - iTime * .2));
                v2 += dot(p,p) * .0013 * (1.5 + sin(length(uv.xy * 14.5) + 1.2 - iTime * .3));
                v3 += length(p.xy*10.) * .0003;
                s  += .035;
            }
            float len = length(uv);
            v1 *= smoothstep(.7, .0, len);
            v2 *= smoothstep(.5, .0, len);
            v3 *= smoothstep(.9, .0, len);
            
            vec3 col = vec3( v3 * (1.5 + sin(iTime * .2) * .4),
                            (v1 + v3) * .3,
                            v2) + smoothstep(0.2, .0, len) * .85 + smoothstep(.0, .6, v3) * .3;
                if(col==vec3(0.0,0.0,0.0))
                {
                  gl_FragColor=vec4(min(pow(abs(col), vec3(1.2)), 1.0), 0.0);
                }
                else{
                  gl_FragColor=vec4(min(pow(abs(col), vec3(1.2)), 1.0), 1.0);
                }
        }
		`;
const geometryplane = new THREE.PlaneGeometry(50, 50);
const materialshader = new THREE.ShaderMaterial({
  uniforms: {
    iTime: {
      value: 0
    },
  },
  side: 2,
  depthWrite: false,
  transparent: true,
  vertexShader: vertexShader,
  fragmentShader: fragmentShader
})
const plane = new THREE.Mesh(geometryplane, materialshader);
plane.rotation.x = -Math.PI / 2;
plane.scale.x = 10
plane.scale.y = 10
plane.scale.z = 10

//场景
scene = new THREE.Scene();
//八叉树
worldOctree = new Octree();
//创建一个人
playerCollider = new Capsule(
  new THREE.Vector3(0, 0.35, 0),
  new THREE.Vector3(0, 1, 0),
  0.35
);
//玩家速度向量
const playerVelocity = new THREE.Vector3();
//玩家方向向量
const playerDirection = new THREE.Vector3();
//判断玩家是否在地面上
let playerOnFloor = false;
//用来存储按下按键的状态
const keyStates = {};
renderer = new THREE.WebGLRenderer({
  antialias: true,
});
//射线
raycaster = new THREE.Raycaster();
clock = new THREE.Clock();

light = new THREE.AmbientLight(0x404040); // soft white light
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
const directionalLight1 = new THREE.DirectionalLight(0xffffff, 2);
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(2, -34, 3);
directionalLight1.position.set(5, 18, -23);
directionalLight2.position.set(5, 8, 7);
scene.add(directionalLight);
scene.add(directionalLight1);
scene.add(directionalLight2);
scene.add(light);
//创建粒子
const geometry = new THREE.BufferGeometry();
const vertices = [];
for (let i = 0; i < 5000; i++) {
  const x = Math.random() * 2000 - 1000;
  const y = Math.random() * 2000 - 1000;
  const z = Math.random() * 2000 - 1000;
  vertices.push(x, y, z);
}
geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
const textureLoader = new THREE.TextureLoader();
const particlesTexture = textureLoader.load("https://pwlviolet.github.io/xitujuejin/textures/particles/9.png");
const material = new THREE.PointsMaterial({
  size: 5,
  blending: THREE.AdditiveBlending,
  map: particlesTexture,
  alphaMap: particlesTexture,
  transparent: true,
})
const particles = new THREE.Points(geometry, material);
particles.onBeforeRender = function () {
  this.rotation.z += 0.0001
  this.rotation.y += 0.0001
  this.rotation.x += 0.0001
}
scene.add(particles)
plane.onBeforeRender = function () {
  this.rotation.z += 0.0001;
};
worldOctree.fromGraphNode(plane);
scene.add(plane)
//创建四个点
const sphere = new THREE.SphereGeometry(2, 160, 8);
//lights
let light1, light2, light3, light4
light1 = new THREE.PointLight(0x9AC8E2, 2, 50);
light1.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0x9AC8E2 })));
scene.add(light1);
light1.children[0].name='light1'
light2 = new THREE.PointLight(0xDB7D74, 2, 50);
light2.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0xDB7D74 })));
scene.add(light2);
light2.children[0].name='light2'
light3 = new THREE.PointLight(0xE799B0, 2, 50);
light3.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0xE799B0 })));
scene.add(light3);
light3.children[0].name='light3'
light4 = new THREE.PointLight(0x576690, 2, 50);
light4.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0x576690 })));
scene.add(light4);
light4.children[0].name='light4'
console.log(light4)
//创建视频纹理
let texture = new THREE.TextureLoader().load("https://pwlviolet.github.io/xitujuejin/textures/1.jpg");
const skyGeometry = new THREE.PlaneGeometry(100,100,10);
const skyMaterial = new THREE.MeshBasicMaterial({
  map: texture,
  side:2
});

const sky = new THREE.Mesh(skyGeometry, skyMaterial);
sky.position.set(0,50,-70)
scene.add(sky);
const video = document.createElement("video");
video.src = "./1.mp4";//视频地址
video.loop = true;

window.addEventListener("click", (e) => {
  // 当鼠标移动的时候播放视频
  //   判断视频是否处于播放状态
  if (video.paused) {
    video.play();
    let texture = new THREE.VideoTexture(video);
    skyMaterial.map = texture;
    skyMaterial.map.needsUpdate = true;
  }
});


onMounted(() => {
  width = window.innerWidth;
  height = window.innerHeight;
  fov = 60;
  near = 0.01;
  far = 10000;
  camera = new THREE.PerspectiveCamera(fov, width / height, near, far);

  camera.rotation.order = "YXZ";
  renderer.setSize(width, height);
  renderer.render(scene, camera);
  renderer.shadowMap.enabled = true;
  renderer.physicallyCorrectLights = true;
  document.body.appendChild(renderer.domElement);
  let clock1 = new THREE.Clock()
  mouseevent();

  let animate = function () {
    const elapsedTime = clock1.getElapsedTime();
    //   console.log(elapsedTime);
    materialshader.uniforms.iTime.value = elapsedTime;
    //欧拉角的顺序
    const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;
    for (let i = 0; i < STEPS_PER_FRAME; i++) {
      controls(deltaTime);
      updatePlayer(deltaTime);
      teleportPlayerIfOob();
    }
    const time = Date.now() * 0.0005;
    const delta = clock.getDelta();
    light1.position.x = Math.sin(time * 0.7) * 30;
    light1.position.y = Math.cos(time * 0.5) * 40;
    light1.position.z = Math.cos(time * 0.3) * 30;

    light2.position.x = Math.cos(time * 0.3) * 30;
    light2.position.y = Math.sin(time * 0.5) * 40;
    light2.position.z = Math.sin(time * 0.7) * 30;

    light3.position.x = Math.sin(time * 0.7) * 30;
    light3.position.y = Math.cos(time * 0.3) * 40;
    light3.position.z = Math.sin(time * 0.5) * 30;

    light4.position.x = Math.sin(time * 0.3) * 30;
    light4.position.y = Math.cos(time * 0.7) * 40;
    light4.position.z = Math.sin(time * 0.5) * 30;
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    composer.render();
  };

  renderer.domElement.addEventListener("click", mouseClick, false);
  renderer.domElement.addEventListener("pointermove", onPointerMove);
  // postprocessing
  composer = new EffectComposer(renderer);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  composer.setSize(width, height);
  outlinePass = new OutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,
    camera
  );
  outlinePass.edgeStrength = 3;
  outlinePass.edgeThickness = 1;
  composer.addPass(outlinePass);
  let effectFXAA = new ShaderPass(FXAAShader);
  effectFXAA.uniforms["resolution"].value.set(
    1 / window.innerWidth,
    1 / window.innerHeight
  );
  composer.addPass(effectFXAA);
  animate();
});
function mouseClick(e) {
  e.preventDefault();
  let mouse = new THREE.Vector2();
  // 通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1.
  mouse.x =
    ((e.clientX - renderer.domElement.getBoundingClientRect().left) / width) *
    2 -
    1;
  mouse.y =
    -((e.clientY - renderer.domElement.getBoundingClientRect().top) / height) *
    2 +
    1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);
}
function mouseevent() {
  document.addEventListener("keydown", (event) => {
    keyStates[event.code] = true;
  });

  document.addEventListener("keyup", (event) => {
    keyStates[event.code] = false;
  });

  renderer.domElement.addEventListener("mousedown", () => {
    //锁定鼠标
    down = true;
    // document.body.requestPointerLock();
  });
  renderer.domElement.addEventListener("mouseup", () => {
    down = false;
  });
  // 监听鼠标旋转
  document.body.addEventListener("mousemove", (event) => {
    if (down == true) {
      // if (document.pointerLockElement === document.body) {
      // console.log(camera);
      camera.rotation.y -= event.movementX / 500;
      camera.rotation.x -= event.movementY / 500;
    }
  });
}

window.addEventListener("resize", () => {
  // 更新渲染
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // 更新相机
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

//人物碰撞
function playerCollisions() {
  const result = worldOctree.capsuleIntersect(playerCollider);
  playerOnFloor = false;
  if (result) {
    playerOnFloor = result.normal.y > 0;

    if (!playerOnFloor) {
      playerVelocity.addScaledVector(
        result.normal,
        -result.normal.dot(playerVelocity)
      );
    }
    //使其保持在地面上
    playerCollider.translate(result.normal.multiplyScalar(result.depth));
  }
}

function updatePlayer(deltaTime) {
  //设置阻力
  let damping = Math.exp(-4 * deltaTime) - 1; //e的x幂次
  if (!playerOnFloor) {
    playerVelocity.y -= GRAVITY * deltaTime;
    // small air resistance
    damping *= 0.1;
  }
  //运用阻力速度×阻力
  playerVelocity.addScaledVector(playerVelocity, damping); //playervelocity*damping+playervelocity
  //运动的距离 速度×时间
  const deltaPosition = playerVelocity.clone().multiplyScalar(deltaTime);
  playerCollider.translate(deltaPosition);
  playerCollisions();

  camera.position.copy(playerCollider.end);
}
function getForwardVector() {
  camera.getWorldDirection(playerDirection);
  playerDirection.y = 0;
  playerDirection.normalize();
  return playerDirection;
}

function getSideVector() {
  camera.getWorldDirection(playerDirection);
  playerDirection.y = 0;
  playerDirection.normalize();
  playerDirection.cross(camera.up);
  return playerDirection;
}

function controls(deltaTime) {
  // gives a bit of air control
  const speedDelta = deltaTime * (playerOnFloor ? 25 : 8);
  if (keyStates["KeyW"]) {
    playerVelocity.add(getForwardVector().multiplyScalar(speedDelta));
  }
  if (keyStates["KeyS"]) {
    playerVelocity.add(getForwardVector().multiplyScalar(-speedDelta));
  }
  if (keyStates["KeyA"]) {
    playerVelocity.add(getSideVector().multiplyScalar(-speedDelta));
  }
  if (keyStates["KeyD"]) {
    playerVelocity.add(getSideVector().multiplyScalar(speedDelta));
  }
  if (playerOnFloor) {
    if (keyStates["Space"]) {
      playerVelocity.y = 15;
    }
  }
}
//重置
function teleportPlayerIfOob() {
  if (camera.position.y <= -25) {
    playerCollider.start.set(0, 0.35, 0);
    playerCollider.end.set(0, 1, 0);
    playerCollider.radius = 0.35;
    camera.position.copy(playerCollider.end);
    camera.rotation.set(0, 0, 0);
  }
}

function onPointerMove(event) {
  if (event.isPrimary === false) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  checkIntersection();
}

function addSelectedObject(object) {
  selectedObjects = [];
  selectedObjects.push(object);
}

function checkIntersection() {
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(scene, true);

  if (intersects.length > 0) {
    if (intersects[0].object.name == "light1"||intersects[0].object.name == "light2"||intersects[0].object.name == "light3"||intersects[0].object.name == "light4") {
      const selectedObject = intersects[0].object;
      addSelectedObject(selectedObject);
      outlinePass.selectedObjects = selectedObjects;
    }
    else {
      outlinePass.selectedObjects = [];
    }
  }
}

</script>

<style>
* {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
.first{
  position: absolute;
  z-index: 2;
  left: 45%;
  color: aliceblue;
}
</style>
