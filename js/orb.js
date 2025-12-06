import { Renderer, Program, Mesh, Triangle, Texture }
from "https://cdn.skypack.dev/ogl";

const canvas = document.getElementById("orb-canvas");
const wrapper = document.querySelector(".circle-wrapper");

let renderer, gl, program, mesh, texture;
let isReady = false;

let hover = 0;
let targetHover = 0;

function init() {

    renderer = new Renderer({
        canvas,
        alpha: true,
        premultipliedAlpha: false,
        antialias: true,
    });

    gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    // -----------------------------
    // VERTEX (correct UV!)
    // -----------------------------
    const vert = `
        precision highp float;
        attribute vec2 position;
        attribute vec2 uv;
        varying vec2 vUv;

        void main() {
            vUv = uv;                // correct texture UV
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    // -----------------------------
    // FRAGMENT (hover-reactive orb)
    // -----------------------------
    const frag = `
        precision highp float;

        uniform sampler2D uTex;
        uniform float uTime;
        uniform float uHover;

        varying vec2 vUv;

        vec2 rotate(vec2 uv, float a) {
            float s = sin(a);
            float c = cos(a);
            uv -= 0.5;
            uv = mat2(c, -s, s, c) * uv;
            uv += 0.5;
            return uv;
        }

        void main() {

            float t = uTime * 0.6;
            float k = smoothstep(0.0, 1.0, uHover);

            vec2 uv = rotate(vUv, t * 0.25 * k);

            float warp =
                sin(uv.y * 10.0 + t * 2.0) * 0.03 * k +
                cos(uv.x * 12.0 - t * 1.5) * 0.03 * k;

            uv += warp;

            vec4 color = texture2D(uTex, uv);

            float breathe = 1.0 + 0.08 * sin(t * 2.0) * k;
            color.rgb *= breathe;

            gl_FragColor = color;
        }
    `;

    program = new Program(gl, {
        vertex: vert,
        fragment: frag,
        uniforms: {
            uTex: { value: null },
            uTime: { value: 0 },
            uHover: { value: 0 },
        }
    });

    // Load PNG texture
    texture = new Texture(gl, { minFilter: gl.LINEAR });
    const img = new Image();
    img.src = "assets/Circle.png";
    img.onload = () => {
        texture.image = img;
        program.uniforms.uTex.value = texture;
        isReady = true;
    };

    mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    resize();
    window.addEventListener("resize", resize);

    requestAnimationFrame(update);

    // ---------------------------
    // HOVER LISTENERS
    // ---------------------------
    wrapper.addEventListener("mouseenter", () => targetHover = 1);
    wrapper.addEventListener("mouseleave", () => targetHover = 0);
}

function resize() {
    const rect = wrapper.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    renderer.setSize(rect.width * dpr, rect.height * dpr);

    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
}

function update(t) {
    if (isReady) {
        hover += (targetHover - hover) * 0.1;

        program.uniforms.uHover.value = hover;
        program.uniforms.uTime.value = t * 0.001;

        renderer.render({ scene: mesh });
    }

    requestAnimationFrame(update);
}

init();

