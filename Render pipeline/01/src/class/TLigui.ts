import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min'
import { Boxlist } from './TBox';
import { Material, Mesh, WebGLRenderer } from 'three';
export class TLigui extends GUI
{
    // private gui=new GUI()
    constructor(renderer: WebGLRenderer)
    {

        super();
        // let eventobj={
        //     full: function(){
        //         document.body.requestFullscreen()
        //     },
        //     exit:function(){
        //         document.exitFullscreen()
        //     }
        // }
        // this.add(eventobj,'full').name('全屏');
        // this.add(eventobj,'exit').name('退出');
        let floder=this.addFolder('物体')
        floder.add(Boxlist[0].position,'x').min(-100).max(100).step(1.0).name('物体1x轴').onChange(()=>{
            console.log(renderer.info.render)
        })
        this.add(Boxlist[1].material,'wireframe')
// setInterval(()=>{
//     console.log(renderer.info.render)
// },1000)
    }
    // destroy(): void {
    //     this.gui.destroy();
    // }
}

