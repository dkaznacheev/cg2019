const phongVertex = `
    varying vec3 Normal;
    varying vec3 Position;
    varying vec3 oldPos;
    uniform vec3 modelCenter;
    varying vec2 vUv;
    varying vec3 trueCenter;
    
    void main() {
        vUv = uv;
        Normal = normalize(normalMatrix * normal);
        oldPos = position;
        trueCenter = vec3(modelViewMatrix * vec4(modelCenter, 1.0));
        Position = vec3(modelViewMatrix * vec4(position, 1.0));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const phongFragment = `
    const highp float PI = 3.1415926535897932384626433832795;
    varying vec3 Normal;
    varying vec3 Position;
    varying vec3 oldPos;
    varying vec2 vUv;
    
    uniform vec4 lightPos;
    uniform vec3 intensity;
    uniform float shininess;
  
    uniform vec3 ambientVal;
    uniform vec3 diffuseVal;
    uniform vec3 specularVal;
    
    uniform vec3 modelCenter;
    uniform float dissolve;
    uniform sampler2D noise;

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
    
    
    void main() {
        // slightly moving the center of model to actual center
        vec3 normPos = normalize(oldPos - vec3(-0.02, 0.09, 0.0));
        
        // sampling spherical texture
        float longitude = (atan(abs(normPos.x) / abs(normPos.z)));
        float latitude = acos(normPos.y);
        float tex_x = longitude / PI;
        float tex_y = latitude / PI;
        vec4 noise_tex = texture2D(noise, vec2(tex_x, tex_y));
       
        vec4 color = vec4(phong(), 1.0);
        
        if (noise_tex.x > dissolve) {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 0.0);
        } else {
            gl_FragColor = color;
        }
        
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
        object.translateX(20);
        
        let child = object.children[0];
        child.geometry.computeFaceNormals();
        child.geometry.computeVertexNormals();
        child.material.shading = THREE.SmoothShading;
        child.material.transparent = true;
        child.material.onBeforeCompile = function (shader) {
            shader.uniforms.lightPos = {value: new THREE.Vector4(0.0, 2000.0, 0.0, 1.0)};
            shader.uniforms.intensity = {value: get_intensity_value()};
            shader.uniforms.shininess = {value: 2.0};
        
            shader.uniforms.ambientVal = {value: new THREE.Vector3(0.5, 0.5, 0.5)};
            shader.uniforms.diffuseVal = {value: new THREE.Vector3(0.5, 0.5, 0.5)};
            shader.uniforms.specularVal = {value: new THREE.Vector3(0.5, 0.5, 0.5)};
        
            shader.uniforms.dissolve = {value: get_dissolve_value()};
            shader.uniforms.noise = {value: THREE.ImageUtils.loadTexture('noise.jpg')};
            shader.uniforms.modelCenter = {value: new THREE.Vector3(0.0, -75.0, 0.0)};
            
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
    return (100 - slider_value) / 100.0;
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

