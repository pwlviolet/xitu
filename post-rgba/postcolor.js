//法线加上深度实现的描边
import { Matrix4, Vector2 } from 'three';

const testcolorshader = {
	uniforms: {
		tDiffuse: { value: null },
		_Brightness:{value:1.0},
		_Saturation:{value:1.0},
		_Contrast:{value:1.0}
		// tMydepth: { value: null },
		// tMynormal: { value: null },
		// resolution: { value: new Vector2() },
	},

	vertexShader: `
		uniform vec2 resolution;
		varying vec2 vUv;
		void main() {
      		vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: `
		#define gamma 2.2
		uniform sampler2D tDiffuse;
		uniform float _Brightness;
		uniform float _Saturation;
		uniform float _Contrast;
		uniform vec2 resolution;
		varying vec2 vUv;
		//饱和度
        float luminance( const in vec3 rgb ) {
    		const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
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
			 vec4 Diffuse=texture(tDiffuse,vUv);
			 Diffuse.xyz = gammaCorrection(Diffuse.xyz);
			 //亮度
			 vec3 finalcolor=Diffuse.rgb*_Brightness;
			 //饱和度
			 float lumin=luminance(finalcolor);
			 finalcolor=lerp(vec3(lumin),finalcolor,_Saturation);
			 //对比度
			 vec3 midpoint=vec3(0.5,0.5,0.5);
			 finalcolor=lerp(midpoint,finalcolor,_Contrast);
			 gl_FragColor = vec4(finalcolor,1.0);
		}`,
};

export { testcolorshader };
