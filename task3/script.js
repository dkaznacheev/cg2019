const R = 200;
var scene, renderer, camera, controls, materialShader, count;
var light;

function init() {
    /*new THREE.TextureLoader().load( 'https://threejsfundamentals.org/threejs/resources/images/equirectangularmaps/tears_of_steel_bridge_2k.jpg', function ( texture ) {
	    texture.mapping = THREE.UVMapping;
	    initTexture( texture );
    } );
    */
    initTexture(null);
}

function addLight() {
	light = new THREE.PointLight( 0xaaaaaa, 1, 100 );
    light.position.set( 50, 50, 50 );
    scene.add( light );
    var hlight = new THREE.HemisphereLight( 0xaaaaaa, 0x080808, 1 );
    scene.add( hlight );
}

function initTexture(texture) {
    scene = new THREE.Scene();
    
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
	
	scene.background = new THREE.Color( 0xBEDEAD );
	addLight();
    
    camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
    camera.position.set(250, 0, -300);
    controls = new THREE.OrbitControls(camera, renderer.domElement);
   
    var cmaterial = new THREE.MeshBasicMaterial();
    
    /*cmaterial.onBeforeCompile = function (shader) {
        shader.uniforms.lightPos = {value: new THREE.Vector4(0.0, 2000.0, 100.0, 1.0)};
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
        
    */

    new THREE.OBJLoader().load('stanford_bunny.obj', function (object) {
        object.scale.set(900, 900, 900);
        object.rotateY(2.75);
        object.translateY(-75);
        object.translateX(20);
        
        let child = object.children[0];
        
        child.geometry.computeFaceNormals();
        child.geometry.computeVertexNormals();

        var geom = new THREE.Geometry();
        var bmat = new THREE.MeshBasicMaterial( {color: 0x00ff00} );

        geom.fromBufferGeometry(child.geometry);
        console.log(geom);
        var box = new THREE.BoxGeometry( 10, 10, 10);
        for (const i in geom.vertices) {
            if (i % 100 == 0) {
                let v = geom.vertices[i];
                console.log(v);
                var newbox = new THREE.Mesh(box, bmat);
                newbox.translateX(v.x*900);
                newbox.translateY(v.y*900);
                newbox.translateZ(v.z*900);
                scene.add(newbox);
            }
        }
       
        scene.add(object);
    });
    
    document.body.appendChild(renderer.domElement);
    
    render();
}

function render() {
    var time = 0;
    
    const canvas = renderer.domElement;
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }
    
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

init();
