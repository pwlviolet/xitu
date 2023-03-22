precision lowp float;
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;
varying vec2 vUv;

uniform sampler2D uTexture;

varying vec3 vNormal;
const int n = 800;
const float rate = 7.;
const float lineThickness = 2.2;
const float colours = 0.05; // proportion of cells to colour in
const bool zoom = true;

const float phi = 1.6180339887498948;
const float tau = 6.2831853071795865;

void main(){
    // vec2 uv = vUv-0.5;
    float penOut = lineThickness/iResolution.y;
    float penIn = (lineThickness-2.8)/iResolution.y;

    float t = iTime*rate;
    
    gl_FragColor = vec4(0,0,0,1);

    float scale = sqrt(float(n));
    if ( zoom ) scale = min( scale, pow((iTime+7.)*rate*.5,.6) ); // keep the edgemost points in shot as we zoom
    
    float closest = 1e38;
    float closest2 = 1e38;
    for ( int i=0; i < n; i++ )
    {
        float f = float(i);
        f += fract(t);
        float r = sqrt(f/128.);
        r *= 13./scale;
        float a = fract((f-t)*phi)*tau;
        vec2 pos = r*vec2(sin(a),cos(a));
        
        vec3 col = sin(vec3(3,1,6)*(float(i)-floor(t)))*.5+.5;
        if ( fract(col.y*64.) > colours ) col = vec3(1);

        float l = length(pos-vUv);

        // add a ring to help me track size (so it doesn't look like we're zooming out)
        //col *= smoothstep(penIn,penOut,abs(l/scale-.001)*scale);
		
        if ( i == 0 ) l += smoothstep(1.,0.,fract(t))*1.2/scale; // grow the new point
		if ( l < closest )
        {
            if ( closest < closest2 ) closest2 = closest;
            closest = l;
			gl_FragColor.rgb = col; // *(1.-l*sqrt(float(n)));
        }
        else if ( l < closest2 )
        {
            closest2 = l;
        }
        gl_FragColor.rgb = mix(gl_FragColor.rgb,vec3(0),smoothstep(penOut,penIn,length(pos-vUv)));
    }
    
    // cell borders
    gl_FragColor.rgb *= smoothstep(penIn,penOut,(closest2-closest));//*scale);
}