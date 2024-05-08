import  { Color, RawShaderMaterial, UniformsLib } from "three";
//仿MeshToon材质
//rawshader
const Toonshader =new RawShaderMaterial(
    {
        lights: true,
        uniforms: {

            ...UniformsLib.lights,
            uColor:{
                value:new Color('#6495ED')
            },
            uFim:{
                value:false
            }
        },
    
        vertexShader: /* glsl */`
            precision mediump float;
            attribute vec3 position;
            attribute vec3 normal;
            attribute vec2 uv;
            uniform mat4 modelMatrix;
            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;
            uniform mat4 viewMatrix;
            uniform mat3 normalMatrix;
            uniform vec3 cameraPosition;
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vViewDir;
            
            void main() {
                vUv=uv;
                vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                vec4 viewPosition = viewMatrix * modelPosition;
                vec4 clipPosition = projectionMatrix * viewPosition;        
                vNormal = normalize(normalMatrix * normal);
                vViewDir = normalize(-viewPosition.xyz);            
                gl_Position = clipPosition;
    
            }`,
    
        fragmentShader: /* glsl */`
            precision mediump float;

            uniform mat4 modelMatrix;
            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;
            uniform mat4 viewMatrix;
            uniform mat3 normalMatrix;
            uniform vec3 cameraPosition;
            uniform vec3 uColor;
            uniform bool uFim;
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vViewDir;
            #include <common>
            #include <lights_pars_begin>
    
            void main() {
    
                float NdotL = dot(vNormal, directionalLights[0].direction);
                float lightIntensity = smoothstep(0.0, 0.01, NdotL);
                vec3 directionalLight = directionalLights[0].color * lightIntensity;
                float rimDot = 1.0 - dot(vViewDir, vNormal);
                vec3 rim ;
                if(uFim==true)
                {

                    float rimAmount = 0.6;
    
                    float rimThreshold = 0.2;
                    float rimIntensity = rimDot * pow(NdotL, rimThreshold);
                    rimIntensity = smoothstep(rimAmount - 0.01, rimAmount + 0.01, rimIntensity);
    
                     rim = rimIntensity * directionalLights[0].color;
                }
                else{
                     rim = vec3(0.);
                }
                gl_FragColor = vec4(uColor * (ambientLightColor + directionalLight + rim), 1.0);
    
            }`
    
    }
) 

export { Toonshader };