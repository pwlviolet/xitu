import {
  MeshPhysicalMaterial,
  CatmullRomCurve3,
  Texture,
  Vector3,
  TubeGeometry,
  RepeatWrapping,
  AdditiveBlending,
  Mesh,
  MeshBasicMaterial,
} from 'three';

export function createTube(Pointarr, radius) {
  //1.创建曲线
  let lineCurve = new CatmullRomCurve3(Pointarr);
  lineCurve.curveType = 'catmullrom';
  // lineCurve.tension = 1.0;
  let curvelength = lineCurve.getLength();
  //2.根据曲线生成管道几何体
  let geometry = new TubeGeometry(
    lineCurve,
    64,
    radius,
    16,
    false //管道的两端是否闭合，默认值为false
  );
  // let texture = Texture

  // // 设置阵列模式 RepeatWrapping
  // texture.wrapS = RepeatWrapping
  // texture.repeat.set(curvelength / 50, 1);
  // texture.offset.y = 0.5;
  // texture.wrapT = RepeatWrapping;

  //3.创建材质
  let material = new MeshBasicMaterial({
    color: 0xff00,
    // wireframe:true
    // map: texture,
    // transparent: true,
    // blending: AdditiveBlending,
  });
  //4.创建Mesh
  let mesh = new Mesh(geometry, material);
  // mesh.onBeforeRender = () => {
  //         texture.offset.x -= 0.01
  // }
  return mesh;
}
