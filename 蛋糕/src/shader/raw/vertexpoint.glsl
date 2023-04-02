precision highp float;
attribute vec3 position;
attribute vec2 uv;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform float uTime;
uniform mat4 uMatrix;
varying vec2 vUv;

// float random (vec3 st) {
//     return fract(sin(dot(st.xyz,
//                          vec3(12.9898,78.233,78.233)))*
//         43758.54);
// }
float random (vec3 st) {
    return fract(sin(dot(st.xyz,
                         vec3(12.9898,78.233,500.0)))*
        43758.5453123);
}
void main()
{
    vUv=uv;
    vec3 translate = vec3(cos(uTime),sin(uTime),cos(uTime));


    vec4 nPosition=vec4(position,1.);
        // nPosition +=fract(sin(nPosition.y)*100.0)*10.0*sin(uTime);
            float rnd = random(vec3(nPosition.xyz));
            nPosition *=vec4(rnd,rnd,rnd,1.0)*10.0;
            nPosition +=vec4(sin(nPosition.x),sin(nPosition.y),sin(nPosition.z),1.0);
    gl_Position=projectionMatrix*viewMatrix*modelMatrix*nPosition;
    gl_PointSize=0.8;
}