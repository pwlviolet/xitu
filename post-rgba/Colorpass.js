import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
const Colorshader = {
	defines: {
		gamma: 2.2
	},
	uniforms: {
		tDiffuse: { value: null },
		_Brightness: { value: 1.0 },
		_Saturation: { value: 1.0 },
		_Contrast: { value: 1.0 },
		_HueShift: { value: 5.0 }
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
		vec3 hsv2rgb(vec3 c) {
   		 	vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
    	 	vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    		return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
		}
		vec3 rgb2hsv(vec3 c) {
    		vec4 K = vec4(0.0, -1.0/3.0, 2.0/3.0, -1.0);
    		vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    		vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    		float d = q.x - min(q.w, q.y);
    		float e = 1.0e-10;
    		return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
		}

		void main() {
			 vec4 Diffuse=texture(tDiffuse,vUv);
			 Diffuse.rgb= gammaCorrection(Diffuse.rgb);
			 //色相
			 vec3 finalcolor=Diffuse.rgb;
			 vec3 hsv=rgb2hsv(finalcolor);
			 hsv.r=hsv.r+_HueShift;
			 finalcolor=hsv2rgb(hsv);
			 //亮度
			 finalcolor=finalcolor.rgb*_Brightness;
			 //饱和度
			 float lumin=luminance(finalcolor);
			 finalcolor=lerp(vec3(lumin),finalcolor,_Saturation);
			 //对比度
			 vec3 midpoint=vec3(0.5,0.5,0.5);
			 finalcolor=lerp(midpoint,finalcolor,_Contrast);
			 gl_FragColor = vec4(finalcolor,1.0);
		}`,
};



class ColorPass extends ShaderPass {
	set Brightness(v) {
		this.material.uniforms._Brightness.value = v;
	}
	get Brightness() {
		return this.material.uniforms._Brightness.value;
	}
	set Saturation(v) {
		this.material.uniforms._Saturation.value = v;
	}
	get Saturation() {
		return this.material.uniforms._Saturation.value;
	}
	set Contrast(v) {
		this.material.uniforms._Contrast.value = v;
	}
	get Contrast() {
		return this.material.uniforms._Contrast.value;
	}
	set HueShift(v) {
		this.material.uniforms._HueShift.value = v;
	}
	get HueShift() {
		return this.material.uniforms._HueShift.value;
	}


	constructor(options = {}) {

		super(Colorshader);
		this.Brightness = 'Brightness' in options ? options.Brightness : 1.0;
		this.Saturation = 'Saturation' in options ? options.Saturation : 1.0;
		this.Contrast = 'Contrast' in options ? options.Contrast : 1.0;
		this.HueShift = 'HueShift' in options ? options.HueShift : 0.0;

	}

}

export { ColorPass };
