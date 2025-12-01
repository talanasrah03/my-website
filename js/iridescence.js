// ====== GET CONTAINER ======
const container = document.getElementById("fx-container");

// Create canvas for WebGL
const canvas = document.createElement("canvas");
canvas.style.position = "absolute";
canvas.style.inset = "0";
canvas.style.width = "100%";
canvas.style.height = "100%";
canvas.style.zIndex = "3";
container.appendChild(canvas);

const gl = canvas.getContext("webgl");

// Resize canvas correctly
function resize() {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}
resize();
window.addEventListener("resize", resize);


// ===== VERTEX SHADER =====
const vertexShaderSrc = `
attribute vec2 a_pos;
varying vec2 vUv;

void main() {
    vUv = (a_pos + 1.0) * 0.5;
    gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;


// ===== FRAGMENT SHADER =====
const fragmentShaderSrc = `
precision highp float;

uniform float uTime;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uAmp;
uniform float uSpeed;
uniform vec3 uColor;

varying vec2 vUv;

void main() {
    float mr = uRes.x < uRes.y ? uRes.x : uRes.y;
    vec2 uv = (vUv * 2.0 - 1.0) * (uRes / mr);

    uv += (uMouse - vec2(0.5)) * uAmp;

    float d = -uTime * 0.5 * uSpeed;
    float a = 0.0;

    for (int i = 0; i < 8; i++) {
        float fi = float(i);
        a += cos(fi - d - a * uv.x);
        d += sin(uv.y * fi + a);
    }

    d += uTime * 0.5 * uSpeed;

    vec3 col = vec3(
        cos(uv.x * d) * 0.6 + 0.4,
        cos(a + d) * 0.5 + 0.5,
        cos(d - a) * 0.5 + 0.5
    );

    col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5);
    col *= uColor;

    gl_FragColor = vec4(col, 1.0);
}
`;


// ===== COMPILE =====
function compile(type, src) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("SHADER ERROR:", gl.getShaderInfoLog(shader));
    }
    return shader;
}

const vShader = compile(gl.VERTEX_SHADER, vertexShaderSrc);
const fShader = compile(gl.FRAGMENT_SHADER, fragmentShaderSrc);

const program = gl.createProgram();
gl.attachShader(program, vShader);
gl.attachShader(program, fShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("PROGRAM LINK ERROR:", gl.getProgramInfoLog(program));
}

gl.useProgram(program);


// ===== GEOMETRY =====
const quad = new Float32Array([
    -1,-1, 1,-1, -1,1,
    -1,1, 1,-1, 1,1
]);

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

const a_pos = gl.getAttribLocation(program, "a_pos");
gl.enableVertexAttribArray(a_pos);
gl.vertexAttribPointer(a_pos, 2, gl.FLOAT, false, 0, 0);


// ===== UNIFORMS =====
const uTime = gl.getUniformLocation(program, "uTime");
const uRes = gl.getUniformLocation(program, "uRes");
const uMouse = gl.getUniformLocation(program, "uMouse");
const uAmp = gl.getUniformLocation(program, "uAmp");
const uSpeed = gl.getUniformLocation(program, "uSpeed");
const uColor = gl.getUniformLocation(program, "uColor");

gl.uniform1f(uAmp, 0.08);
gl.uniform1f(uSpeed, 1.0);
gl.uniform3f(uColor, 0.95, 0.95, 0.95);


// ===== MOUSE =====
let mouseX = 0.5, mouseY = 0.5;

window.addEventListener("mousemove", (e) => {
    const r = container.getBoundingClientRect();
    mouseX = (e.clientX - r.left) / r.width;
    mouseY = 1.0 - (e.clientY - r.top) / r.height;
});


// ===== RENDER LOOP =====
function render(t) {
    gl.uniform1f(uTime, t * 0.001);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform2f(uMouse, mouseX, mouseY);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
}
render();








