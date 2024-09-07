//法线加上深度实现的描边
import { Matrix4, Vector2 ,Vector3} from 'three';

const blackholeshader = {
    uniforms: {
        //指定要传递给shader代码的uniforms
        iTime: { value: 0 },
        iResolution: { value: new Vector2(0,0) },
        tDiffuse: { value: null },
        bgColor: { value: new Vector3(155, 210, 181) },
        lightdir: { value: new Vector3(1, 1, 1) },
        lightColor: { value: new Vector3(243, 224, 149) },
        skyColor: { value: new Vector3(70, 96, 134) },
        specularColor: { value: new Vector3(255, 255, 255) },
        fresnelColor: { value: new Vector3(240, 200, 151) },
      },
      vertexShader: `		
          varying vec2 vUv;
          void main() {
       vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  
          }`,
      fragmentShader: `
      #define EPS 1e-5
      varying vec2 vUv;
      uniform vec2 iResolution;      
      float sdSphere( vec3 p, float s )
      {
          return length(p-vec3(0,0,1))-s;
      }
      // https://iquilezles.org/articles/normalsSDF/
      vec3 getNormal(vec3 p,float s)
      {
      vec2 e=vec2(0,EPS);
      float c=sdSphere(p,s);
      return normalize(vec3(sdSphere(p+e.yxx,s)-c,
                            sdSphere(p+e.xyx,s)-c,
                            sdSphere(p+e.xxy,s)-c));//求三个方向的偏导然后归一化
      }      
          void main() {
        vec2 uv = vUv;
        uv-=0.5;
        uv.x*=iResolution.x/iResolution.y;
        //定义射线 ray:o+dr;
        vec3 dir=normalize(vec3(uv,1.)),o=vec3(0.0,0.0,0.0);
        float d=0.;
          vec3 col;
          for(float i=0.;i<10.;i++)
          {
            float sdf=sdSphere(o+d*dir,0.1);
              d+=sdf;
              if(sdf<EPS)//如果小于阈值就跳出
                  break;
          }
          //获取法线和光
          vec3 n=getNormal(o+d*dir,0.2),lightdir=normalize(vec3(0.,0.,1.0));
          vec3 lightcolor=vec3(1.0,0.0,0.0);
          vec3 diffuse=1.0*lightcolor*pow(max(0.,dot(n,-lightdir)),1.);//漫反射
          vec3 ambient=vec3(1.0,1.0,1.0)*.5;//环境
          // col=vec3(0.0,0.0,1.0);
          col=diffuse+ambient;
          if(d>2.0)
          {
            gl_FragColor = vec4(0.0,0.0,0.0,1.0);
          }
          else{
            gl_FragColor = vec4(vec3(col),1.0);
          }
  
  
  
          }
      `,
};

export { blackholeshader};
