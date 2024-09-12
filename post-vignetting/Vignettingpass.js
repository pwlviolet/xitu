import { Vector2 } from 'three';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
const Vignettingshader = {
	defines: {
		gamma: 2.2
	},
	uniforms: {
		tDiffuse: { value: null },
		_r:{value:0.5},
		_VignettingIntensity:{value:1.0},
		_center:{value:new Vector2(0.0,0)}
	},

	vertexShader: `
		varying vec2 vUv;
		void main() {
      		vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: `
		uniform sampler2D tDiffuse;
		uniform float _VignettingIntensity;
		uniform float _r;
		uniform vec2 _center;
		varying vec2 vUv;
		vec3 lerp(vec3 x, vec3 y, float t) {
    		return x + t * (y - x);
		}
		vec3 gammaCorrection(vec3 color) {
    		return pow(color, vec3(1.0 / gamma));
		}
		vec3 inverseGammaCorrection(vec3 color) {
    		return pow(color, vec3(gamma));
		}
		//https://iquilezles.org/articles/distfunctions2d/
		float sdBox( in vec2 p, in vec2 b )
		{
    		vec2 d = abs(p)-b;
    		return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
		}
		float sdCircle( vec2 p, float r ,vec2 center)
		{
    		return length(p-center) - r;
		}
		void main() {
			 vec4 Diffuse=texture(tDiffuse,vUv);
			 Diffuse.rgb=gammaCorrection(Diffuse.xyz);
			 vec2 fixuv=vUv*2.0-1.0;
			 float d=pow(1.0-smoothstep(0.,1.,sdCircle(fixuv,_r,_center)),_VignettingIntensity+0.001);
			 Diffuse.rgb*=d;
			 gl_FragColor = vec4(Diffuse.xyz,1.0);
		}`,
};



class VignettingPass extends ShaderPass {
	set VignettingIntensity(v) {
		this.material.uniforms._VignettingIntensity.value = v;
	}
	get VignettingIntensity() {
		return this.material.uniforms._VignettingIntensity.value;
	}
	set r(v) {
		this.material.uniforms._r.value = v;
	}
	get r() {
		return this.material.uniforms._r.value;
	}
	set center(v) {
		this.material.uniforms._center.value = v;
	}
	get center() {
		return this.material.uniforms._center.value;
	}

	constructor(options = {}) {

		super(Vignettingshader);
		this.VignettingIntensity = 'VignettingIntensity' in options ? options.VignettingIntensity : 1.0;
		this.r = 'r' in options ? options.r : 0.5;
		this.center='center'in options?options.center:new Vector2(0,0)


	}

}

export { VignettingPass };
