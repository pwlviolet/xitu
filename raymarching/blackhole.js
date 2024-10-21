//法线加上深度实现的描边
import { Matrix4, Vector2, Vector3 } from 'three';

const blackholeshader = {
  uniforms: {
    //指定要传递给shader代码的uniforms
    U_Time: { value: 0 },
    iResolution: { value: new Vector2(window.innerWidth, window.innerHeight) },
    tDiffuse: { value: null },
    // bgColor: { value: new Vector3(155, 210, 181) },
    // lightdir: { value: new Vector3(1, 1, 1) },
    // lightColor: { value: new Vector3(243, 224, 149) },
    // skyColor: { value: new Vector3(70, 96, 134) },
    // specularColor: { value: new Vector3(255, 255, 255) },
    // fresnelColor: { value: new Vector3(240, 200, 151) },
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
      uniform float U_Time;
      const float h=0.0001;
const float pi = 3.1415927;
const mat2 m = mat2( 1.6,  1.2, -1.2,  1.6 );

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
      float noise(vec2 v) {
    // Precompute values for skewed triangular grid
    const vec4 C = vec4(0.211324865405187,
                        // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,
                        // 0.5*(sqrt(3.0)-1.0)
                        -0.577350269189626,
                        // -1.0 + 2.0 * C.x
                        0.024390243902439);
                        // 1.0 / 41.0

    // First corner (x0)
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);

    // Other two corners (x1, x2)
    vec2 i1 = vec2(0.0);
    i1 = (x0.x > x0.y)? vec2(1.0, 0.0):vec2(0.0, 1.0);
    vec2 x1 = x0.xy + C.xx - i1;
    vec2 x2 = x0.xy + C.zz;

    // Do some permutations to avoid
    // truncation effects in permutation
    i = mod289(i);
    vec3 p = permute(
            permute( i.y + vec3(0.0, i1.y, 1.0))
                + i.x + vec3(0.0, i1.x, 1.0 ));

    vec3 m = max(0.5 - vec3(
                        dot(x0,x0),
                        dot(x1,x1),
                        dot(x2,x2)
                        ), 0.0);

    m = m*m ;
    m = m*m ;

    // Gradients:
    //  41 pts uniformly over a line, mapped onto a diamond
    //  The ring size 17*17 = 289 is close to a multiple
    //      of 41 (41*7 = 287)
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;

    // Normalise gradients implicitly by scaling m
    // Approximation of: m *= inversesqrt(a0*a0 + h*h);
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0+h*h);

    // Compute final noise value at P
    vec3 g = vec3(0.0);
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * vec2(x1.x,x2.x) + h.yz * vec2(x1.y,x2.y);
    return 130.0 * dot(m, g);
}     
    vec2 fixuv(vec2 c)
{
    return 1.*(c-.5*iResolution.xy)/min(iResolution.x,iResolution.y)*2.;
}
      float sdSphere( vec3 p, float s )
      {
        return length(p)-s;
      }
      float sdBox( in vec3 p,in  vec3 b )
      {
        vec3 q = abs(p) - b;
        return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
      }
      float sdTorus( in vec3 p, in vec2 t )
      {
        vec2 q = vec2(length(p.xz)-t.x,p.y);
        return length(q)-t.y;
      }
      // https://iquilezles.org/articles/normalsSDF/

      mat3 setCamera(vec3 ta,vec3 ro,float cr)
      {
        vec3 z=normalize(ta-ro);
        vec3 cp=vec3(sin(cr),cos(cr),0.0);
        vec3 x=normalize(cross(z,cp));
        vec3 y=cross(x,z);
        return mat3(x,y,z);
      }
    vec3 render(vec2 uv)
    {
        vec3 col=vec3(0.0);
        vec3 ro =vec3(0.0,-0.1,(sin(U_Time/10.)+2.0));
        //摄像机的初始位置
        // vec3 ro=vec3 (0.0,-0.1,1.4);
        //朝向
        vec3 lookAt = vec3(0.0, -0.1,0.0);
        mat3 cam=setCamera(lookAt,ro,0.);
        //rd相机向每个像素发射的射线
        vec3 rd=normalize(cam*vec3(uv,1.0));
        vec3 bh = vec3(0.0,0.0,0.0);
        float bhr = 0.3;
        float bhmass = 5.0;
   	    bhmass *= 0.001; // premul G   
        vec3 p = ro;
        vec3 pv = rd;   
        float dt = 0.02;
        float noncaptured = 1.0;
        vec3 c1 = vec3(0.5,0.35,0.1);
        vec3 c2 = vec3(1.0,0.8,0.6);
      for(float i=0.0;i<200.;i++)
     {
        p += pv * dt * noncaptured;
        // gravity
        vec3 bhv = bh - p;
        float r = dot(bhv,bhv);
         pv += normalize(bhv) * ((bhmass) / r);
        noncaptured = smoothstep(0.0,0.05,sdSphere(p-bh,bhr));
        //圆环
        vec3 dcol = mix(c2,c1,pow(length(bhv)-bhr,2.0)) * max(0.0,noise(uv/5.)+0.05) * (4.0 / ((0.001+(length(bhv) - bhr)*50.0) ));
        col += max(vec3(0.0),dcol * smoothstep(0.0, 1.0, -sdTorus( (p * vec3(1.0,25.0,1.0)) - bh, vec2(0.8,0.99))) * noncaptured);
        vec3 raycolor=vec3(1.0,0.9,0.7);
        col += raycolor * (1.0/vec3(dot(bhv,bhv))) * 0.003 * noncaptured;
      }
      return col;
    }
      vec3 getNormal(vec3 p,float s)
      {
      vec2 e=vec2(0,EPS);
      float c=sdSphere(p,s);
      return normalize(vec3(sdSphere(p+e.yxx,s)-c,
                            sdSphere(p+e.xyx,s)-c,
                            sdSphere(p+e.xxy,s)-c));//求三个方向的偏导然后归一化
      }      
          void main() {
      vec3 color=vec3(0.0);
      vec2 uv=fixuv(gl_FragCoord.xy);
      color+=render(uv);
      gl_FragColor=vec4(color,1.0);
      // 转换为灰度
      float gray = dot(gl_FragColor.rgb, vec3(0.2125, 0.7154, 0.0721));
      vec4 grayColor = vec4(gray, gray, gray, gl_FragColor.a);
      gl_FragColor=grayColor;
 
  
  
  
          }
      `,
};

export { blackholeshader };




// void main() {
//   vec2 uv = vUv;
//   uv-=0.5;
//   uv.x*=iResolution.x/iResolution.y;
//   //定义射线 ray:o+dr;
//   vec3 dir=normalize(vec3(uv,1.)),o=vec3(0.0,0.0,0.0);
//   float d=0.;
//     vec3 col;
//     for(float i=0.;i<10.;i++)
//     {
//       float sdf=sdSphere(o+d*dir,0.1);
//         d+=sdf;
//         if(sdf<EPS)//如果小于阈值就跳出
//             break;
//     }
//     //获取法线和光
//     vec3 n=getNormal(o+d*dir,0.2),lightdir=normalize(vec3(0.,0.,1.0));
//     vec3 lightcolor=vec3(1.0,0.0,0.0);
//     vec3 diffuse=1.0*lightcolor*pow(max(0.,dot(n,-lightdir)),1.);//漫反射
//     vec3 ambient=vec3(1.0,1.0,1.0)*.5;//环境
//     // col=vec3(0.0,0.0,1.0);
//     col=diffuse+ambient;
//     if(d>2.0)
//     {
//       gl_FragColor = vec4(0.0,0.0,0.0,1.0);
//     }
//     else{
//       gl_FragColor = vec4(vec3(col),1.0);
//     }
