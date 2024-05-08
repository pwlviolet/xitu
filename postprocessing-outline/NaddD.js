//法线加上深度实现的描边
import { Matrix4, Vector2 } from 'three';

const NaddDshader = {
  uniforms: {
    tDiffuse: { value: null },
    tMydepth: { value: null },
    tMynormal: { value: null },
    resolution: { value: new Vector2() },
  },

  vertexShader: `
		uniform vec2 resolution;
		varying vec2 vUv;
    varying vec2 v_uv;
		void main() {
      vUv = uv;
			vec2 texelSize = ( 1.0 / resolution );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

  fragmentShader: `
  	#define PRECISION .001
	#define AA 3
		uniform sampler2D tDiffuse;
		uniform sampler2D tMydepth;
    uniform sampler2D tMynormal;
		uniform vec2 resolution;
		varying vec2 vUv;
    varying vec2 v_uv;
        
		void main() {
			vec4 color;
			for(int m=0;m<AA;m++)
			{
				for(int n=0;n<AA;n++)
				{
					vec2 offset=2.0*(vec2(float(m),float(n)/float(AA)-0.5));
					vec2 vUv=vUv+offset;
					vec2 texelSize = vec2( 3.0/ resolution.x, 3.0/ resolution.y );
					vec4 basicColor=texture2D(tDiffuse,vUv);
					vec4 depthColor = texture2D(tMydepth, vUv) ;
					vec4 normalColor=texture2D(tMynormal,vUv);
					// gl_FragColor = vec4(mix(vec3(depthColor.r * 100.0),normalColor.xyz,0.5),1.0);
					float depthlb=texture2D(tMydepth,vUv).r;
					float depthlt=texture2D(tMydepth,(vUv+vec2(0,1)*texelSize)).r;
					float depthrt=texture2D(tMydepth,(vUv+vec2(1,1)*texelSize)).r;
					float depthrb=texture2D(tMydepth,(vUv+vec2(1,0)*texelSize)).r;
					float depthFiniteDifference0 = depthrt - depthlb;
					float depthFiniteDifference1 = depthlt - depthrb;
					// float res=abs(depthFiniteDifference0)*100.;
					float DepthThreshold=0.4;
					float edgeDepth = sqrt(pow(depthFiniteDifference0, 2.0) + pow(depthFiniteDifference1, 2.0)) * 10000.;
					edgeDepth = edgeDepth > DepthThreshold ? 1. : 0.;
					
					float threshold = 0.05;
					// float edge=step(threshold,res);
					float normallb=texture2D(tMynormal,vUv).r;
					float normallt=texture2D(tMynormal,(vUv+vec2(0,1)*texelSize)).r;
					float normalrt=texture2D(tMynormal,(vUv+vec2(1,1)*texelSize)).r;
					float normalrb=texture2D(tMynormal,(vUv+vec2(1,0)*texelSize)).r;
					float normalFiniteDifference0 = normalrt - normallb;
					float normalFiniteDifference1 = normallt - normalrb;
					float edgenormal = sqrt(dot(normalFiniteDifference0, normalFiniteDifference0) + dot(normalFiniteDifference1, normalFiniteDifference1));
					float edge=edgenormal>threshold?1.0:0.0;

					edge==0.0?color=basicColor:color=vec4(0.0,0.,0.,1.0);
				}
			}
			gl_FragColor=vec4(color.xyz/float(AA*AA),1.0);
			// gl_FragColor = vec4(normalColor);

			
		}`,
};

export { NaddDshader };
