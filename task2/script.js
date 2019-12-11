const phongVertex = `
    varying vec3 Normal;
    varying vec3 Position;
    varying vec2 vUv;
    
    void main() {
        vUv = uv;
        Normal = normalize(normalMatrix * normal);
        Position = vec3(modelViewMatrix * vec4(position, 1.0));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const phongFragment = `
    varying vec3 Normal;
    varying vec3 Position;
    varying vec2 vUv;
    
    uniform vec4 lightPos;
    uniform vec3 intensity;
    uniform float shininess;
  
    uniform vec3 ambientVal;
    uniform vec3 diffuseVal;
    uniform vec3 specularVal;
    
    uniform float dissolve;
    uniform sampler2D noise;
    uniform sampler2D gradient;
    
    vec3 phong() {
        vec3 norm = normalize(Normal);
        vec3 dist = normalize(vec3(lightPos) - Position);
        vec3 v = normalize(vec3(-Position));
        
        vec3 refl = reflect(-dist, norm);
        vec3 amb = ambientVal;
        
        vec3 diff = diffuseVal * max(dot(dist, norm), 0.0);
        vec3 spec = specularVal * pow(max(dot(refl, v), 0.0), shininess);
        return intensity * (amb + diff + spec);
    }
    
    float mapc(float c) {
        return floor(c - floor((c + 0.5) / 200.0) * 200.0 + 0.5) / 200.0; 
    }
    
    
    void main() {
        vec4 noise_tex = texture2D(noise, vec2(mapc(Position.x), mapc(Position.y)));
        float d = (dissolve * 2.0 + noise_tex.x) - 1.0;
        float saturated = saturate(d * 2.5);
        vec4 burn_tex = texture2D(gradient, vec2(saturated, 1.0));
        
        vec4 color = vec4(phong(), 1.0);
        color *= burn_tex;
        gl_FragColor = color;
    }
`;


var scene, rendere, camera, controls, materialShader;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xDADDFF);

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);
    
    camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
    camera.position.set(250, 0, -300);
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    
    new THREE.OBJLoader().load('stanford_bunny.obj', function (object) {
        object.scale.set(900, 900, 900);
        object.rotateY(2.75);
        object.translateY(-75);
        object.children[0].material.transparent = true;
        object.children[0].material.onBeforeCompile = function (shader) {
        
            shader.uniforms.lightPos = {value: new THREE.Vector4(0.0, 2000.0, 0.0, 1.0)};
            shader.uniforms.intensity = {value: get_intensity_value()};
            shader.uniforms.shininess = {value: 2.0};
        
            shader.uniforms.ambientVal = {value: new THREE.Vector3(0.5, 0.5, 0.5)};
            shader.uniforms.diffuseVal = {value: new THREE.Vector3(0.5, 0.5, 0.5)};
            shader.uniforms.specularVal = {value: new THREE.Vector3(0.5, 0.5, 0.5)};
        
            shader.uniforms.dissolve = {value: get_dissolve_value()};
            shader.uniforms.noise = {value: THREE.ImageUtils.loadTexture('noise.png')};
            shader.uniforms.gradient = {value: THREE.ImageUtils.loadTexture('gradient.png')};
            
            shader.vertexShader = phongVertex;
            shader.fragmentShader = phongFragment;

            materialShader = shader;

        };
        scene.add(object);
    });


    render();
}

function get_dissolve_value() {
    let slider_value = document.getElementById("dissolve_slider").value;
    return (100 - slider_value) / 150;
}

function get_intensity_value() {
    let v = document.getElementById("intensity_slider").value / 5;
    return new THREE.Vector4(v, v, v, v);
}

function render() {
    const canvas = renderer.domElement;
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    if (materialShader) {
        materialShader.uniforms.dissolve.value = get_dissolve_value();
        materialShader.uniforms.intensity.value = get_intensity_value();
    }

    renderer.render(scene, camera);
    requestAnimationFrame(render);
}


init();

