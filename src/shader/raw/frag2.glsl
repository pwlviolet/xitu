precision lowp float;
varying vec2 vUv;
uniform sampler2D uTexture;

void main(){
    // vec4 textureColor=texture2D(uTexture,vUv);
    // gl_FragColor=textureColor;
    gl_FragColor=mix(vec4(vUv,1.0,1.0),vec4(1.0,1.0,0.0,0.5),0.5);
}