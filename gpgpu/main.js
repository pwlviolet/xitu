/*
* @Description: 
 * Basic use:
 *
 * // Initialization...
 *
 * // Create computation renderer
 * const gpuCompute = new GPUComputationRenderer( 1024, 1024, renderer );
 *
 * // Create initial state float textures
 * const pos0 = gpuCompute.createTexture();
 * const vel0 = gpuCompute.createTexture();
 * // and fill in here the texture data...
 *
 * // Add texture variables
 * const velVar = gpuCompute.addVariable( "textureVelocity", fragmentShaderVel, pos0 );
 * const posVar = gpuCompute.addVariable( "texturePosition", fragmentShaderPos, vel0 );
 *
 * // Add variable dependencies
 * gpuCompute.setVariableDependencies( velVar, [ velVar, posVar ] );
 * gpuCompute.setVariableDependencies( posVar, [ velVar, posVar ] );
 *
 * // Add custom uniforms
 * velVar.material.uniforms.time = { value: 0.0 };
 *
 * // Check for completeness
 * const error = gpuCompute.init();
 * if ( error !== null ) {
 *		console.error( error );
  * }
 *
 *
 * // In each frame...
 *
 * // Compute!
 * gpuCompute.compute();
 *
 * // Update texture uniforms in your visualization materials with the gpu renderer output
 * myMaterial.uniforms.myTexture.value = gpuCompute.getCurrentRenderTarget( posVar ).texture;
 *
 * // Do your rendering
 * renderer.render( myScene, myCamera );
 *
 * -------------
 *
 * Also, you can use utility functions to create ShaderMaterial and perform computations (rendering between textures)
 * Note that the shaders can have multiple input textures.
 *
 * const myFilter1 = gpuCompute.createShaderMaterial( myFilterFragmentShader1, { theTexture: { value: null } } );
 * const myFilter2 = gpuCompute.createShaderMaterial( myFilterFragmentShader2, { theTexture: { value: null } } );
 *
 * const inputTexture = gpuCompute.createTexture();
 *
 * // Fill in here inputTexture...
 *
 * myFilter1.uniforms.theTexture.value = inputTexture;
 *
 * const myRenderTarget = gpuCompute.createRenderTarget();
 * myFilter2.uniforms.theTexture.value = myRenderTarget.texture;
 *
 * const outputRenderTarget = gpuCompute.createRenderTarget();
 *
 * // Now use the output texture where you want:
 * myMaterial.uniforms.map.value = outputRenderTarget.texture;
 *
 * // And compute each frame, before rendering to screen:
 * gpuCompute.doRenderTarget( myFilter1, myRenderTarget );
 * gpuCompute.doRenderTarget( myFilter2, outputRenderTarget );
* @Author: WL_P
* @Date: 2024-01-10
* @LastEditTime: 2024-01-10
*/
import './style.css';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer'
import CameraControls from 'camera-controls';
const canvas = document.getElementById('three-canvas');
CameraControls.install({ THREE: THREE });
let cameracontrols;
let clock = new THREE.Clock();
const width = canvas.clientWidth;
const height = canvas.clientHeight;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100000);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
camera.position.set(0, 0, 10);
renderer.setSize(width, height);
canvas.appendChild(renderer.domElement);
renderer.render(scene, camera);
// const box = new THREE.Mesh(
//   new THREE.BoxGeometry(),
//   new THREE.MeshBasicMaterial({
//     color: 0xffff00,
//   })
// );
// scene.add(box);
cameracontrols = new CameraControls(camera, renderer.domElement);
//gpgpu

const texel = 1000

const gpgpu = new GPUComputationRenderer(texel, texel, renderer)
const texture = gpgpu.createTexture()
console.log(texture)
const data = texture.image.data
console.log(data)

for (let i = 0; i < data.length / 4; i++) {
  data[i * 4 + 0] = THREE.MathUtils.randFloatSpread(256)
  data[i * 4 + 1] = THREE.MathUtils.randFloatSpread(256)
  data[i * 4 + 2] = THREE.MathUtils.randFloatSpread(256)
  data[i * 4 + 3] = 1
}
console.log(data, data.length)
const computeshader = `
uniform sampler2D texturePosition;
void main(){
    vec2 uv=gl_FragCoord.xy/resolution.xy;
    vec3 pos=texture(texturePosition,uv).xyz;
    gl_FragColor=vec4(pos,1.);
}
`
let positionVariable = gpgpu.addVariable('texturePosition', computeshader, texture)
gpgpu.setVariableDependencies(positionVariable, null)
// console.log(positionVariable)
const error = gpgpu.init()
if (error !== null) {
  console.error(error);
}
gpgpu.compute()
const result = gpgpu.getCurrentRenderTarget(positionVariable).texture
// box.material.map = result
//创建一个粒子geo
const pointsGeo = new THREE.BufferGeometry()
const positions = new Float32Array(texel * texel * 3)
const datauv = new Float32Array(texel * texel * 2)
for (let i = 0; i < texel; i++) {
  for (let j = 0; j < texel; j++) {
    const index = i + j * texel
    positions[index * 3 + 0] = (Math.random() * 2 - 1) * 100
    positions[index * 3 + 1] = (Math.random() * 2 - 1) * 100
    positions[index * 3 + 2] = (Math.random() * 2 - 1) * 100
    datauv[index * 2 + 0] = i / texel
    datauv[index * 2 + 1] = j / texel
  }
}
pointsGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
pointsGeo.setAttribute("datauv", new THREE.BufferAttribute(datauv, 2))

const pointsystem = new THREE.Points(pointsGeo, new THREE.ShaderMaterial({
  vertexShader: `
  attribute vec2 datauv;
  uniform sampler2D datatexture;
  uniform float uTime;
  void main(){
  vec3 p=texture(datatexture,datauv).xyz;
  // vec3 dis =p-position;
  // vec3 pos=position+dis*abs(sin(uTime));
  vec4 worldposition=modelMatrix*vec4(position,1.);
  vec4 woldtexturep=modelMatrix*vec4(p,1.);
  vec3 dis=woldtexturep.xyz-worldposition.xyz;
  vec4 curposition=worldposition+vec4(dis*abs(sin(uTime)),1.0);
  // vec4 curPosition=vec4(vec3(worldposition.xyz+woldtexturep.xyz),1.0);
  gl_Position=projectionMatrix*viewMatrix*curposition;
  gl_PointSize=1.0;
}
  
  `,
  fragmentShader: `
  void main(){
    vec4 col=vec4(0.,1.,0.,1.);
    gl_FragColor=col;
}
  
  `,
  uniforms: {
    datatexture: {
      value: gpgpu.getCurrentRenderTarget(positionVariable).texture
    },
    uTime:{
      value:0.0
    }
  },
  // side: 2,
  // transparent: true,
  // blending: THREE.AdditiveBlending,
  // depthWrite: false,
})
)
scene.add(pointsystem)
let animate = function () {
  pointsystem.material.uniforms.uTime.value+=0.001
  requestAnimationFrame(animate);
  cameracontrols.update(clock.getDelta());
  renderer.render(scene, camera);
};

animate();

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
