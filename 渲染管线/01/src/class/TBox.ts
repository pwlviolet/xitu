import { BoxGeometry, Mesh, MeshStandardMaterial, Object3D } from "three";


//创建物体
export const Boxlist: Object3D[] = []

const Box: Mesh = new Mesh(new BoxGeometry(10, 10, 10), new MeshStandardMaterial({
    color: 'rgb(255,0,0)',
    metalness:1,
    roughness:0.3
    // wireframe: true
}))
const Box2: Mesh = new Mesh(new BoxGeometry(10, 10, 10), new MeshStandardMaterial({
    color: 'rgb(255,0,0)',
    metalness:1,
    roughness:0.3,
    wireframe: true
}))
Boxlist.push(Box,Box2)