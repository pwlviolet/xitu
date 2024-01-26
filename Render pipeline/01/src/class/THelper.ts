import { GridHelper, Object3D, AxesHelper, PointLightHelper, SpotLightHelper } from 'three'
export const Helperlist: Object3D[] = []
const gridHelper = new GridHelper(500, 20,'rgb(200,200,200)','rgb(100,100,100)')
gridHelper.position.y = -1;
// const axeshelper = new AxesHelper(500);
// const pointLightHelper=new PointLightHelper(pointLight,pointLight.distance,pointLight.color)
// const spotLightHelper=new SpotLightHelper(spotLight,spotLight.color)

// axeshelper.raycast=()=>{}
gridHelper.raycast=()=>{}
// pointLightHelper.raycast=()=>{}
// spotLightHelper.raycast=()=>{}
Helperlist.push(gridHelper)