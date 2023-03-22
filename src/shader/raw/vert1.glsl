precision lowp float;
attribute vec3 position;
attribute vec2 uv;
//测试颜色


uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

// 获取时间
uniform float uTime;


varying vec2 vUv;

// highp  -2^16 - 2^16
// mediump -2^10 - 2^10
// lowp -2^8 - 2^8

varying float vElevation;
varying float Color1;
void main(){
    vUv = uv;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix*vec4(position,1.) ;
}