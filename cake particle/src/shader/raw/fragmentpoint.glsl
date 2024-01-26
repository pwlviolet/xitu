precision lowp float;

varying vec2 vUv;
uniform sampler2D uTexture;
void main(){
    gl_FragColor=vec4(vec3(vUv.xyx),1.);
}