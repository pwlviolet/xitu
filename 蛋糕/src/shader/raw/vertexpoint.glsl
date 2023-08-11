precision highp float;
attribute vec3 position;
attribute vec2 uv;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform float uTime;
uniform mat4 uMatrix;
varying vec2 vUv;

float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                 * 43758.5453123);
}
void main()
{
    vUv=uv;
    // vec3 translate = vec3(cos(uTime),sin(uTime),cos(uTime));


    // vec4 nPosition=vec4(position,1.);

    //         float rnd = random(vec3(nPosition.xyz));
    //         nPosition *=vec4(rnd,rnd,rnd,1.0)*10.0;
    //         nPosition +=vec4(sin(nPosition.x),sin(nPosition.y),sin(nPosition.z),1.0);
    // gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(position,1.);
    vUv = uv;
    vec4 modelPosition = modelMatrix * vec4( position, 1.0 );
    vec4 toPosition=projectionMatrix * viewMatrix * modelPosition;
    vec4 randompos=toPosition*random(toPosition.xy)*1000.;
    gl_Position = randompos ;
    gl_PointSize=2.0;
}