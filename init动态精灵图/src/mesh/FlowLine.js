import * as THREE from "three";
import gsap from"gsap";
export default class FlowLine{
    constructor(lineArray,imgUrl,lineWidth=0.2)
    {
        let linePoints=[
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(10,0,0),
            new THREE.Vector3(20,0,0),
            new THREE.Vector3(20,0,10),
        ]
        //1.创建曲线
        this.lineCurve=new THREE.CatmullRomCurve3(linePoints);
        //2.根据曲线生成管道几何体
        this.geometry=new THREE.TubeBufferGeometry(this.lineCurve,100,1,2,false);
        //3.创建一个纹理
        const textloader = new THREE.TextureLoader();
        this.texture = textloader.load("./textures/z1.png");
        this.texture.repeat.set(1, 2);
        this.texture.wrapS = THREE.RepeatWrapping;
        this.texture.wrapT = THREE.MirroredRepeatWrapping;
        //4.设置材质
        this.material=new  THREE.MeshBasicMaterial({
            // color:0xff000,
            color: 0xffffff,
            map: this.texture,
            transparent: true,
            blending: THREE.AdditiveBlending,
        });
        //创建物体
        this.mesh=new THREE.Mesh(this.geometry,this.material)
        //创建动画
        gsap.to(this.texture.offset, {
        x: -1,
        duration: 1,
        repeat: -1,
        ease: "none",
        });
    }
}