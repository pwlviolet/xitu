import { Vector4 } from 'three';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
const Boxblurshader = {
	defines: {
		gamma: 2.2
	},
	uniforms: {
		tDiffuse: { value: null },
		_Bluroffset: { value:  new Vector4(1.0/window.innerWidth, 1.0/window.innerHeight,1.0/window.innerWidth, 1.0/window.innerHeight)},
	},

	vertexShader: `
		varying vec2 vUv;
		void main() {
      		vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: `
		uniform sampler2D tDiffuse;
		uniform float _Brightness;
		uniform float _Saturation;
		uniform float _Contrast;
		uniform float _HueShift;
		uniform vec4 _Bluroffset;

		varying vec2 vUv;
		//饱和度
        float luminance( vec3 rgb ) {
    		vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
    		return dot( weights, rgb );
		}
		vec3 lerp(vec3 x, vec3 y, float t) {
    		return x + t * (y - x);
		}
		vec3 gammaCorrection(vec3 color) {
    		return pow(color, vec3(1.0 / gamma));
		}
		vec3 inverseGammaCorrection(vec3 color) {
    		return pow(color, vec3(gamma));
		}

		void main() {
			 vec4 kernel=_Bluroffset.xyxy*vec4(-1,-1,1,1);
			 vec4 color=vec4(0.0);
			 vec4 Diffuse=texture(tDiffuse,vUv);
			//  Diffuse.rgb= gammaCorrection(Diffuse.rgb);
			 color+=texture(tDiffuse,vUv+kernel.xy);
			 color+=texture(tDiffuse,vUv+kernel.zy);
			 color+=texture(tDiffuse,vUv+kernel.xw);
			 color+=texture(tDiffuse,vUv+kernel.zw);
			 color*=0.25;
			 color.rgb=gammaCorrection(color.rgb);

			 gl_FragColor = vec4(color.xyz,1.0);
		}`,
};



class BoxblurPass extends ShaderPass {
	set Bluroffset(v) {
		this.material.uniforms._Bluroffset.value = v;
	}
	get Bluroffset() {
		return this.material.uniforms._Bluroffset.value;
	}

	constructor(options = {}) {

		super(Boxblurshader);
		this.Bluroffset = 'Bluroffset' in options? options.Bluroffset : new Vector4(1.0/window.innerWidth, 1.0/window.innerHeight,1.0/window.innerWidth, 1.0/window.innerHeight);
		console.log(this.material.uniforms.tDiffuse)

	}

}

export { BoxblurPass };
