import './style.css';
import * as THREE from 'three';
import { gsap } from 'gsap';
import CameraControls from 'camera-controls';
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
// renderer.render(scene, camera);


cameracontrols = new CameraControls(camera, renderer.domElement);
const TBoxgeo = new THREE.BoxGeometry(10, 10, 10);
const diffuse=await new THREE.TextureLoader().loadAsync('./567.jpg');
const TBoxmaterial = new THREE.RawShaderMaterial({
  glslVersion: THREE.GLSL3,
  uniforms: {
    repeat: { value: new THREE.Vector2(1,1) },
    tDiffuse: { value: diffuse },
  },
  vertexShader: `
      in vec3 position;
			in vec3 normal;
			in vec2 uv;

			out vec3 vNormal;
			out vec2 vUv;
			out vec4 vPosition;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;
			uniform mat3 normalMatrix;

			void main() {

				vUv = uv;

				// get smooth normals
				vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

				vec3 transformedNormal = normalMatrix * normal;
				vNormal = normalize( transformedNormal );

				vPosition = projectionMatrix * mvPosition;
				gl_Position = projectionMatrix * mvPosition;
        // gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 )

			}
  `,
  fragmentShader: `
      precision highp float;
			precision highp int;

			layout(location = 0) out vec4 gColor;
			layout(location = 1) out vec4 gNormal;
			layout(location = 2) out vec4 gPosition;
			layout(location = 3) out vec4 gUv;

			uniform sampler2D tDiffuse;
			uniform vec2 repeat;

			in vec3 vNormal;
			in vec4 vPosition;
			in vec2 vUv;

			void main() {

				// write color to G-Buffer
				gColor = texture( tDiffuse, vUv * repeat );

				// write normals to G-Buffer
				gNormal = vec4( normalize( vNormal ), 0.0 );

				// write position to G-Buffer
				gPosition = vPosition;

				// write uv to G-Buffer
				gUv = vec4(vUv, 1.0, 1.0);

			}
  `
})
const mesh = new THREE.Mesh(TBoxgeo, TBoxmaterial);
scene.add(mesh);
// scene.add(new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({ color: 0xffffff })))

// 场景2
const scene2 = new THREE.Scene();
const RT = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
const RT2 = new THREE.WebGLMultipleRenderTargets(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, 4);
// 设置 texture 选项
for (let i = 0; i < RT2.texture.length; i++) {

  RT2.texture[i].minFilter = THREE.NearestFilter;
  RT2.texture[i].magFilter = THREE.NearestFilter;

}
console.log(RT2)
// console.log(window.devicePixelRatio)
// RT.texture.minFilter = THREE.LinearFilter;
const camera2 = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
camera2.position.set(0, 0, 10);
camera2.lookAt(0, 0, 0);
const planegeo=new THREE.PlaneGeometry(2, 2);
let planematerial = new THREE.RawShaderMaterial({
  glslVersion: THREE.GLSL3,
  vertexShader:`
      in vec3 position;
			in vec3 normal;
			in vec2 uv;

			out vec3 vNormal;
			out vec2 vUv;
			out vec4 vPosition;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;
			uniform mat3 normalMatrix;

			void main() {

				vUv = uv;

				// get smooth normals
				vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

				vec3 transformedNormal = normalMatrix * normal;
				vNormal = normalize( transformedNormal );

				vPosition = projectionMatrix * mvPosition;
				gl_Position = projectionMatrix * mvPosition;
        // gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 )

			}
  `,
  fragmentShader:`
  		precision highp float;
			precision highp int;

			layout(location = 0) out vec4 pc_FragColor;

			// 点光源结构
			struct PointLight {
				vec3 position;
				vec3 color;
			};
			
			in vec2 vUv;
			// 此处4个 点光源
			uniform PointLight pointLights[ 4 ];
			// 顶点颜色数据贴图
			uniform sampler2D tDiffuse;
			// 顶点法线数据贴图
			uniform sampler2D tNormal;
			// 顶点位置数据贴图
			uniform sampler2D tPosition;
			// 顶点uv数据贴图
			uniform sampler2D tUv;
			

			void main() {

				vec3 diffuse = texture( tDiffuse, vUv ).rgb;
				vec3 normal = texture( tNormal, vUv ).rgb;
				vec3 position = texture( tPosition, vUv ).rgb;

				// 计算 片元 与 灯光关系
				vec3 lightDir1 = normalize(pointLights[0].position - position);
				vec3 lightDir2 = normalize(pointLights[1].position - position);
				vec3 lightDir3 = normalize(pointLights[2].position - position);
				vec3 lightDir4 = normalize(pointLights[3].position - position);

				float lightDLN1 = dot(normal, lightDir1);
				float lightDLN2 = dot(normal, lightDir2);
				float lightDLN3 = dot(normal, lightDir3);
				float lightDLN4 = dot(normal, lightDir4);

				// 模拟计算 光照
				vec3 rc1 = pointLights[0].color/255.0 * diffuse;
				vec3 rc2 = pointLights[1].color/255.0 * diffuse;
				vec3 rc3 = pointLights[2].color/255.0 * diffuse;
				vec3 rc4 = pointLights[3].color/255.0 * diffuse;

				pc_FragColor = vec4((rc1 + rc2 + rc3 + rc4)/4.0, 1.0);			

			}
  `,
  uniforms: {
    tDiffuse: { value: RT2.texture[ 0 ] },
    tNormal: { value: RT2.texture[ 1 ] },
    tPosition: { value: RT2.texture[ 2 ] },
    tUv: { value: RT2.texture[3] },
    // 使用uniforms struct 结构数组传入灯光
    pointLights: { value: [{
      position: new THREE.Vector3(200, 200, 0),
      color: new THREE.Vector3(5, 250, 250)
    },{
      position: new THREE.Vector3(10, 200, 0),
      color: new THREE.Vector3(5, 10, 200)
    },{
      position: new THREE.Vector3(10, 20, 2000),
      color: new THREE.Vector3(255, 200, 0)
    },{
      position: new THREE.Vector3(100, 200, 0),
      color: new THREE.Vector3(35, 130, 0)
    },]}
  },
})
const plane = new THREE.Mesh(planegeo,planematerial)
scene2.add(plane)
// renderer.render(scene2, camera2);

let animate = function () {

  requestAnimationFrame(animate);
  cameracontrols.update(clock.getDelta());
  renderer.setRenderTarget(RT2);
  // renderer.clear();
  renderer.render(scene, camera);
  renderer.setRenderTarget(null);
  // plane.material.map = RT2.texture[0];
  plane.material.uniforms.tDiffuse.value = RT2.texture[0];
  plane.material.uniforms.tNormal.value = RT2.texture[1];
  plane.material.uniforms.tPosition.value = RT2.texture[2];
  plane.material.uniforms.tUv.value = RT2.texture[3];
  renderer.render(scene2, camera2);
};

animate();

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
