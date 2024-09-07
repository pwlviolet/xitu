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
camera.position.set(0, 0, 40);
renderer.setSize(width, height);
canvas.appendChild(renderer.domElement);
renderer.render(scene, camera);

cameracontrols = new CameraControls(camera, renderer.domElement);
const sphere = new THREE.Mesh(
  new THREE.BoxGeometry(1,1,1),
  new THREE.RawShaderMaterial({
    vertexShader: `
    precision highp float;

    uniform mat3 normalMatrix;
    uniform mat4 modelMatrix;
    uniform mat4 viewMatrix;
    uniform mat4 projectionMatrix;
    
    attribute vec3 position;
    attribute vec3 normal;
    
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    mat4 transpose(mat4 inMatrix){
      vec4 i0=inMatrix[0];
      vec4 i1=inMatrix[1];
      vec4 i2=inMatrix[2];
      vec4 i3=inMatrix[3];
      
      mat4 outMatrix=mat4(
          vec4(i0.x,i1.x,i2.x,i3.x),
          vec4(i0.y,i1.y,i2.y,i3.y),
          vec4(i0.z,i1.z,i2.z,i3.z),
          vec4(i0.w,i1.w,i2.w,i3.w)
      );
      
      return outMatrix;
  }
  mat4 inverse_mat4(mat4 m)
  {
      float Coef00 = m[2][2] * m[3][3] - m[3][2] * m[2][3];
      float Coef02 = m[1][2] * m[3][3] - m[3][2] * m[1][3];
      float Coef03 = m[1][2] * m[2][3] - m[2][2] * m[1][3];
      
      float Coef04 = m[2][1] * m[3][3] - m[3][1] * m[2][3];
      float Coef06 = m[1][1] * m[3][3] - m[3][1] * m[1][3];
      float Coef07 = m[1][1] * m[2][3] - m[2][1] * m[1][3];
      
      float Coef08 = m[2][1] * m[3][2] - m[3][1] * m[2][2];
      float Coef10 = m[1][1] * m[3][2] - m[3][1] * m[1][2];
      float Coef11 = m[1][1] * m[2][2] - m[2][1] * m[1][2];
      
      float Coef12 = m[2][0] * m[3][3] - m[3][0] * m[2][3];
      float Coef14 = m[1][0] * m[3][3] - m[3][0] * m[1][3];
      float Coef15 = m[1][0] * m[2][3] - m[2][0] * m[1][3];
      
      float Coef16 = m[2][0] * m[3][2] - m[3][0] * m[2][2];
      float Coef18 = m[1][0] * m[3][2] - m[3][0] * m[1][2];
      float Coef19 = m[1][0] * m[2][2] - m[2][0] * m[1][2];
      
      float Coef20 = m[2][0] * m[3][1] - m[3][0] * m[2][1];
      float Coef22 = m[1][0] * m[3][1] - m[3][0] * m[1][1];
      float Coef23 = m[1][0] * m[2][1] - m[2][0] * m[1][1];
      
      const vec4 SignA = vec4( 1.0, -1.0,  1.0, -1.0);
      const vec4 SignB = vec4(-1.0,  1.0, -1.0,  1.0);
      
      vec4 Fac0 = vec4(Coef00, Coef00, Coef02, Coef03);
      vec4 Fac1 = vec4(Coef04, Coef04, Coef06, Coef07);
      vec4 Fac2 = vec4(Coef08, Coef08, Coef10, Coef11);
      vec4 Fac3 = vec4(Coef12, Coef12, Coef14, Coef15);
      vec4 Fac4 = vec4(Coef16, Coef16, Coef18, Coef19);
      vec4 Fac5 = vec4(Coef20, Coef20, Coef22, Coef23);
      
      vec4 Vec0 = vec4(m[1][0], m[0][0], m[0][0], m[0][0]);
      vec4 Vec1 = vec4(m[1][1], m[0][1], m[0][1], m[0][1]);
      vec4 Vec2 = vec4(m[1][2], m[0][2], m[0][2], m[0][2]);
      vec4 Vec3 = vec4(m[1][3], m[0][3], m[0][3], m[0][3]);
      
      vec4 Inv0 = SignA * (Vec1 * Fac0 - Vec2 * Fac1 + Vec3 * Fac2);
      vec4 Inv1 = SignB * (Vec0 * Fac0 - Vec2 * Fac3 + Vec3 * Fac4);
      vec4 Inv2 = SignA * (Vec0 * Fac1 - Vec1 * Fac3 + Vec3 * Fac5);
      vec4 Inv3 = SignB * (Vec0 * Fac2 - Vec1 * Fac4 + Vec2 * Fac5);
      
      mat4 Inverse = mat4(Inv0, Inv1, Inv2, Inv3);
      
      vec4 Row0 = vec4(Inverse[0][0], Inverse[1][0], Inverse[2][0], Inverse[3][0]);
      
      float Determinant = dot(m[0], Row0);
      
      Inverse /= Determinant;
      
      return Inverse;
  }
    void main() {
      // vNormal = normalize(normalMatrix * normal);
      vec4 normalworld=inverse_mat4(transpose(modelMatrix))*vec4(normal,1.);
      // vNormal=normalworld.xyz;
      vNormal=normal;
      vWorldPosition = (modelMatrix * vec4(position, 1.)).xyz;
      gl_Position = projectionMatrix * viewMatrix * vec4(vWorldPosition, 1.);
    }
    `,
    fragmentShader:
      `
      precision highp float;

      uniform vec3 lightPosition;
      uniform float lightIntensity;
      uniform vec3 lightColor;
      
      uniform vec3 cameraPosition;
      
      uniform float kd;
      uniform float ka;
      uniform float ks;
      
      uniform bool isPhong;
      
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      
      void main() {
        vec3 color = vec3(1, 1.0, 0);
        float r = distance(vWorldPosition, lightPosition);
      
        float radiance = lightIntensity / (r * r);
        vec3 l = lightPosition - vWorldPosition;
      
        vec3 ambient = ka * vec3(1, 1, 1) * color;
        vec3 diffuse = color * lightColor * kd * radiance * max(dot(vNormal, normalize(l)), 0.);
        vec3 h = normalize(l + (cameraPosition - vWorldPosition));
        float specularAngle = dot(h, vNormal);// blinn-phong
        if(isPhong)
          specularAngle = dot(normalize(2. * dot(l, vNormal) * vNormal - l), normalize(cameraPosition - vWorldPosition));
        vec3 specular = lightColor * ks * radiance * pow(max(0., specularAngle), 64.);
      
        gl_FragColor = vec4(ambient + diffuse + specular, 1);
      }
    `,
    uniforms: {
      lightPosition: { value: new THREE.Vector3(0,0,1.5) },
      lightIntensity: { value: 1.0 },
      lightColor: { value: new THREE.Vector3(1.,1.,0.) },
      kd: { value: 0.6 },
      ka: { value: 0.1 },
      ks: { value: 0.0},
      isPhong:{value:false}
    }
  })
);
scene.add(sphere);


let animate = function () {
  requestAnimationFrame(animate);
  cameracontrols.update(clock.getDelta());

  renderer.render(scene, camera);
  // composer.render();
};

animate();

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // composer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
