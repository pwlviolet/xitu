precision highp float;
attribute vec3 position;
attribute vec2 uv;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform float uTime;
varying vec2 vUv;

void main()
{
    vUv=uv;
    vec3 nPosition=vec3(sin(uTime*0.07)*70.0-35.0,cos(uTime*0.05)*90.0-45.0,cos(uTime*0.03)*70.0-35.0)*position+vec3(rand(),rand(),rand())*100;
    gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(nPosition,1.);
    gl_PointSize=0.8;
}