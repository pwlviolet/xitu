import { AmbientLight, Color, Object3D, PointLight, SpotLight } from 'three'




export const light: AmbientLight = new AmbientLight('rgb(255,255,255)', 0.3)
export const pointLight: PointLight = new PointLight('rgb(255,255,255)', 0.7, 200, 0.1)
pointLight.position.set(0, 15, 0)
export const spotLight: SpotLight = new SpotLight(
    'rgb(255,0,255)',
    1,
    300,
    Math.PI / 180 * 30,
    0, 0
)

//产生阴影
spotLight.castShadow=true
spotLight.position.set(-100,50,150)
export const Lightlist: Object3D[] = []

Lightlist.push(light, pointLight)