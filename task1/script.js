const vShader = `
    precision highp float;
    uniform float zoom;
    uniform int dx;
    uniform int dy;
    varying vec2 pos;
    void main () {
        pos = (position.xy) * zoom;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fShader = `
    precision highp float;
    varying vec2 pos;
    uniform int iter;
    void main () {
        vec2 fractal = pos;
        for (int i = 0; i < 100; i++) {
            if (i >= iter) {
                break;
            }
            fractal = pos + vec2(
                fractal.x * fractal.x - fractal.y * fractal.y,
                2.0 * fractal.x * fractal.y);
            gl_FragColor = vec4(fractal, 0, 1);
        }
    }
`;


var width = window.innerWidth;
var height = window.innerHeight;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.z = 1;

var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.PlaneGeometry(2, 2, 0);
var material = new THREE.ShaderMaterial({
    uniforms: {
        zoom: { type: 'f', value: 0.45 },
        iter: { type: 'i', value: 20 }
    },
    vertexShader: vShader,
    fragmentShader: fShader
});
var mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

function render() {
    requestAnimationFrame(render);
   
    mesh.material.uniforms.zoom.value = document.getElementById("zoom_slider").value / 100;
    mesh.material.uniforms.iter.value = document.getElementById("iter_slider").value;
    renderer.render(scene, camera);
}

render();
