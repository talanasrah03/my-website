const canvas = document.getElementById("bg-canvas");
const gl = canvas.getContext("webgl");

function resize(){
    canvas.width  = innerWidth;
    canvas.height = innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}
resize();
addEventListener("resize", resize);

// Vertex shader
const vs = `
attribute vec2 a_pos;
void main(){
    gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

// Fragment shader = mouse liquid light only
const fs = `
precision highp float;

uniform float u_time;
uniform vec2  u_res;
uniform vec2  u_mouse;

float hash(vec2 p){
    return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453);
}
float noise(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i+vec2(1.,0.));
    float c = hash(i+vec2(0.,1.));
    float d = hash(i+vec2(1.,1.));
    vec2 u = f*f*(3. - 2.*f);
    return mix(a,b,u.x)
         + (c-a)*u.y*(1.-u.x)
         + (d-b)*u.x*u.y;
}
float fbm(vec2 p){
    float v=0.0;
    float a=0.5;
    for(int i=0;i<5;i++){
        v+=a*noise(p);
        p*=2.0;
        a*=.5;
    }
    return v;
}

void main(){
    vec2 uv = gl_FragCoord.xy / u_res;
    uv -= 0.5;
    uv.x *= u_res.x / u_res.y;

    float t = u_time * 0.1;

    // internal slight wavy movement
    vec2 flow = vec2(
        sin(t*1.1)*0.3,
        cos(t*0.9)*0.3
    );

    float f = fbm(uv*1.2 + flow);

    // mouse ripple
    float d = distance(gl_FragCoord.xy, u_mouse);
    float ripple = 0.08 * sin(d*0.03 - u_time*3.0) * exp(-d*0.007);
    f += ripple;

    vec3 col = vec3(f*0.15 + 0.05); // subtle light only

    gl_FragColor = vec4(col, 0.6); // 0.6 alpha → blends with PNG
}
`;

// Build shaders
function compile(type,src){
    const s = gl.createShader(type);
    gl.shaderSource(s,src);
    gl.compileShader(s);
    return s;
}
const v = compile(gl.VERTEX_SHADER, vs);
const f = compile(gl.FRAGMENT_SHADER, fs);

const prog = gl.createProgram();
gl.attachShader(prog, v);
gl.attachShader(prog, f);
gl.linkProgram(prog);
gl.useProgram(prog);

// Fullscreen quad
const buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1,-1, 1,-1, -1,1,
    -1,1, 1,-1, 1,1
]), gl.STATIC_DRAW);

const loc = gl.getAttribLocation(prog, "a_pos");
gl.enableVertexAttribArray(loc);
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

// uniforms
const u_time  = gl.getUniformLocation(prog, "u_time");
const u_res   = gl.getUniformLocation(prog, "u_res");
const u_mouse = gl.getUniformLocation(prog, "u_mouse");

let mouse=[9999,9999];
addEventListener("mousemove", e=>{
    mouse=[e.clientX, canvas.height - e.clientY];
});

// Loop
function draw(t){
    gl.uniform1f(u_time, t*0.001);
    gl.uniform2f(u_res, canvas.width, canvas.height);
    gl.uniform2f(u_mouse, mouse[0], mouse[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(draw);
}
draw();
