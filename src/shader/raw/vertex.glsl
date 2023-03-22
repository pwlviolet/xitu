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
    vec4 modelPosition = modelMatrix *mat4(1.0,0.0,0.0,0.0, 0.0,1.0,0.0,0.0, 0.0,0.0,1.0,0.0 ,0.0,0.0,0.0,1.0)* vec4( position, 1.0 );
    // modelPosition.x += 1.0;
    // modelPosition.z += 1.0;

    // modelPosition.z += modelPosition.x;

    modelPosition.z = sin((modelPosition.x+uTime) * 10.0)*0.05 ;
    modelPosition.z += sin((modelPosition.y+uTime)  * 10.0)*0.05 ;
    // Color1 = sin((modelPosition.x+uTime) * 10.0)*0.05 ;
    // Color1+= sin((modelPosition.y+uTime)  * 10.0)*0.05 ;
    vElevation = modelPosition.z;

    gl_Position = projectionMatrix * viewMatrix * modelPosition ;
    gl_PointSize = 0.001;
}