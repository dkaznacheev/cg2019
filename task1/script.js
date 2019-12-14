const vShader = `
    precision highp float;
    varying vec2 pos;
    uniform vec2 offset;
    uniform float zoom;
    
    void main () {
        pos = (position.xy) * zoom + offset;
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

var offsetX = -250.0;
var offsetY = 0.0;
var zoom = 2.5;

function addControls(canvas) {
    let scope = this;

    function onMouseWheel(event) {
        event.preventDefault();

        let delta = 1 + Math.abs(event.deltaY * 0.02);
        if (event.deltaY > 0) {
            delta = 1 / delta;
        }
        zoom *= delta;        
    }

    function onMouseDown(event) {
        scope.mousedown = true;
        scope.posX = event.clientX;
        scope.posY = event.clientY;
    }

    function onMouseMove(event) {
        if (!scope.mousedown) {
            return;
        }
        event.preventDefault();
        
        offsetX += (scope.posX - event.clientX) * zoom;
        offsetY += -(scope.posY - event.clientY) * zoom;

        scope.posX = event.clientX;
        scope.posY = event.clientY;
    }

    function onMouseUp() {
        scope.mousedown = false;
    }

    canvas.addEventListener('wheel', onMouseWheel, false);
    canvas.addEventListener('mousedown', onMouseDown, false);
    canvas.addEventListener('mousemove', onMouseMove, false);
    canvas.addEventListener('mouseup', onMouseUp, false);
}

var width = window.innerWidth;
var height = window.innerHeight;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.z = 0.5;

var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
var canvas = renderer.domElement;
document.body.appendChild(canvas);
addControls(canvas);

var geometry = new THREE.PlaneGeometry(2, 2, 0);
var material = new THREE.ShaderMaterial({
    uniforms: {
        zoom: { type: 'f', value: 1.5 },
        iter: { type: 'i', value: 20 },
        offset: { value: new THREE.Vector2(offsetX / height, offsetY / height) }
    },
    vertexShader: vShader,
    fragmentShader: fShader
});

var mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

function render() {
    mesh.material.uniforms.offset.value = new THREE.Vector2(offsetX / height, offsetY / height);
    mesh.material.uniforms.zoom.value = zoom;
    mesh.material.uniforms.iter.value = document.getElementById("iter_slider").value;
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

render();
