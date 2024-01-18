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
    varying vec2 v_uv;
    uniform vec2 iResolution;
    float sdCircle( in vec2 p, in float r ) 
    {
        return length(p)-r;
    }      
		void main() {
      // vec2 p = (2.0*vUv-iResolution.xy)/iResolution.y;;
      // vec2 texelSize = vec2( 1.0/ iResolution.x, 1.0/ iResolution.y );
      // float d = sdCircle(p,0.5);

      // // coloring
      // vec3 col = (d>0.0) ? vec3(0.9,0.6,0.3) : vec3(0.65,0.85,1.0);
      // col *= 1.0 - exp(-6.0*abs(d));
      // col *= 0.8 + 0.2*cos(150.0*d);
      // col = mix( col, vec3(1.0), 1.0-smoothstep(0.0,0.01,abs(d)) );
			gl_FragColor = vec4(vec3(1.0), 1.0);
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
