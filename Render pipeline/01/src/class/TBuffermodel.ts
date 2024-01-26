import { BufferAttribute, BufferGeometry, Mesh, MeshStandardMaterial, Object3D } from "three";

export const BufferModelList: Object3D[]=[]
//创建顶点
const points:Float32Array=new Float32Array([
    -20,10,10,
    10,10,10,
    10,10,-10,
    -20,10,-10
])
//创建索引,逆时针
const index:number[]=[
    0,1,2,
    2,3,0 //若是0,2,3则光照相反
]
//创建uv范围0-1
const uv:Float32Array=new Float32Array([
    0,0,
    1,0,
    1,1,
    0,1
])
const bufferGeometry :BufferGeometry=new BufferGeometry()
//位置
bufferGeometry.setAttribute('position',new BufferAttribute(points,3))
//法线，光照效果
bufferGeometry.setAttribute('normal',new BufferAttribute(points,3))
//uv
bufferGeometry.setAttribute('uv',new BufferAttribute(uv,2))
//索引
bufferGeometry.setIndex(index)
const matrial=new MeshStandardMaterial({
    color:'rgb(255,255,255)',
    side:2,
    roughness:0.2,
    // map:pic1
})
const bufferMesh:Mesh=new Mesh(bufferGeometry,matrial)
bufferMesh.castShadow=true
bufferMesh.position.set(30,0,0)
BufferModelList.push(bufferMesh)