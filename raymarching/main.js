import './style.css';
import * as THREE from 'three';
import { gsap } from 'gsap';
import CameraControls from 'camera-controls';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

import { RGBShiftShader } from 'three/addons/shaders/RGBShiftShader.js';
import { DotScreenShader } from 'three/addons/shaders/DotScreenShader.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ClearPass } from 'three/addons/postprocessing/ClearPass.js';
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
const box = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({
    color: 0xff0000,
  })
);
scene.add(box);
let clearPass = new ClearPass();
let composer = new EffectComposer(renderer);
let iResolution = new THREE.Vector2(width, height);
const shaderpass = new ShaderPass(
  new THREE.ShaderMaterial({
    uniforms: {
      //指定要传递给shader代码的uniforms
      iTime: { value: 0 },
      iResolution: { value: iResolution },
      tDiffuse: { value: null },
      bgColor: { value: new THREE.Vector3(155, 210, 181) },
      lightdir: { value: new THREE.Vector3(1, 1, 1) },
      lightColor: { value: new THREE.Vector3(243, 224, 149) },
      skyColor: { value: new THREE.Vector3(70, 96, 134) },
      specularColor: { value: new THREE.Vector3(255, 255, 255) },
      fresnelColor: { value: new THREE.Vector3(240, 200, 151) },
    },
    vertexShader: `		
		varying vec2 vUv;
		void main() {
     vUv = uv;
		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,
    fragmentShader: `
		varying vec2 vUv;
    uniform vec2 iResolution;
    float sdCircle( in vec2 p, in float r ) 
    {
        return length(p)-r;
    }
    
    float sdSphere( vec3 p, float s )
    {
        return length(p)-s;
    }      
		void main() {
      vec2 uv = vUv;
      uv-=0.5;
      uv.x*=iResolution.x/iResolution.y;
      vec3 col=vec3(0.0);
      float d= uv.x*uv.x+uv.y*uv.y-0.16;
      float c= step(d,0.0);
      col = mix(col,vec3(0.0,0.0,1.0),c);
			gl_FragColor = vec4(col, 1.0);
		}
    `,
  })
);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(clearPass);
composer.addPass(shaderpass);
composer.addPass(new OutputPass());

let animate = function () {
  requestAnimationFrame(animate);
  cameracontrols.update(clock.getDelta());

  // renderer.render(scene, camera);
  composer.render();
};

animate();

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  composer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
