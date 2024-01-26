import { Box3, Clock, Group, MOUSE, Material, Matrix4, Mesh, MeshStandardMaterial, Object3D, PerspectiveCamera, Quaternion, RawShaderMaterial, Raycaster, Scene, Sphere, Spherical, Vector2, Vector3, Vector4, WebGLRenderer } from "three";
import Stats from "three/examples/jsm/libs/stats.module.js"
import CameraControls from "camera-controls";
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { TEventManager } from "./TEventManager";
export class TEngine {
    dom: HTMLElement
    renderer: WebGLRenderer
    camera: PerspectiveCamera
    scene: Scene
    // cameraControls:CameraControls
    // transformControls: TransformControls
    raycaster: Raycaster | undefined
    orbitcontrols: OrbitControls
    // eventManager: TEventManager | undefined
    eventManagerstate:Boolean =false
    constructor(dom: HTMLElement) {
        // const subsetOfTHREE = {
        //     Vector2: Vector2,
        //     Vector3: Vector3,
        //     Vector4: Vector4,
        //     Quaternion: Quaternion,
        //     Matrix4: Matrix4,
        //     Spherical: Spherical,
        //     Box3: Box3,
        //     Sphere: Sphere,
        //     Raycaster: Raycaster,
        // };
        // CameraControls.install({ THREE: subsetOfTHREE })
        this.dom = dom;
        const renderer = new WebGLRenderer({
            antialias: true
        })
        //开启阴影渲染
        renderer.shadowMap.enabled = true
        const camera = new PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            5000)
        const scene = new Scene()
        renderer.setSize(dom.clientWidth, dom.clientHeight)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        //设置背景色
        // this.renderer.setClearColor('rgb(255,255,0)')
        // this.renderer.clearColor()

        dom.appendChild(renderer.domElement)
        //设置摄像机朝向和位置
        camera.position.set(40, 50, 20)
        camera.lookAt(0, 0, 0)
        camera.up = new Vector3(0, 1, 0)
        //添加状态栏和控制栏
        const stats = new Stats()
        dom.appendChild(stats.dom)
        //添加控制器
        // const clock=new Clock()
        // this.cameraControls=new CameraControls(camera,renderer.domElement)
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.mouseButtons = {
            LEFT: null as unknown as MOUSE,
            MIDDLE: MOUSE.DOLLY,
            RIGHT: MOUSE.ROTATE
        }
        controls.enableDamping = true
        this.orbitcontrols = controls
        // //添加transform控制器
        // const transformControls = new TransformControls(camera, renderer.domElement)

        // scene.add(transformControls)
        // //判断鼠标事件是否是变换事件
        // let transing = false
        // transformControls.addEventListener('mouseDown', (Event) => {
        //     console.log('mousedown');
        //     transing = true
        // })

        // document.addEventListener('keyup', (event) => {
        //     if (event.key === 'e') {
        //         transformControls.mode = 'scale'
        //         return false
        //     }
        //     if (event.key === 'r') {
        //         transformControls.mode = 'rotate'
        //         return false
        //     }
        //     if (event.key === 't') {
        //         transformControls.mode = 'translate'
        //         return false
        //     }
        // })

        //渲染循环
        const animate = () => {
            stats.begin();
            // this.cameraControls.update(clock.getDelta());
            controls.update()
            renderer.render(scene, camera)
            stats.end()
            requestAnimationFrame(animate)
        }
        animate()
        //只绑定一次优化
        this.renderer = renderer
        this.camera = camera
        this.scene = scene
        // this.transformControls = transformControls
    }
    //随着窗口的监听
    onResize(dom: HTMLElement) {
        window.addEventListener("resize", () => {
            this.renderer.setSize(dom.clientWidth, dom.clientHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
            // 更新相机
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        })
    }
    //添加物体
    addObject(...obj: Object3D[]) {
        obj.forEach((item) => {
            this.scene.add(item)
        })
    }

}