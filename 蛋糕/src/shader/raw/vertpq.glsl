precision lowp float;
attribute vec3 position;
attribute vec2 uv;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
varying vec2 vUv;
uniform float time;

void main(){
    // vUv=uv
    vec4 mvPosition=modelMatrix*viewMatrix*vec4(position,1.);
    float amplitude=.5;
    float frequency=.5;
    float displacement=amplitude*sin(time*frequency+position.y);
    mvPosition.xyz+=displacement;
    gl_PointSize=2.;
    gl_Position=projectionMatrix*mvPosition;
}