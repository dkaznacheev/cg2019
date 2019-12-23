const R = 200;
var scene, renderer, camera, controls, materialShader, count;
var light;
var boxSize, slices, boxGeom, boxMat;

function init() {
    /*new THREE.TextureLoader().load( 'https://threejsfundamentals.org/threejs/resources/images/equirectangularmaps/tears_of_steel_bridge_2k.jpg', function ( texture ) {
	    texture.mapping = THREE.UVMapping;
	    initTexture( texture );
    } );
    */
    initTexture(null);
}

function addLight() {
	light = new THREE.PointLight( 0x888888, 1, 100 );
    light.position.set( 50, 120, 50 );
    scene.add( light );
    var alight = new THREE.AmbientLight(0x404040);
    scene.add(alight);
    var hlight = new THREE.HemisphereLight( 0xaaaaaa, 0x080808, 1 );
    scene.add( hlight );
}

function intersect_face(v1, v2, v3, z, boxSize) {
    if (v1.z >= z) {
        return [];
    }
    
    if (v1.z > z - boxSize && v3.z < z) {
        //project plane
        return [[new THREE.Vector3(v1.x, v1.y, z), new THREE.Vector3(v2.x, v2.y, z)],
                [new THREE.Vector3(v2.x, v2.y, z), new THREE.Vector3(v3.x, v3.y, z)],
                [new THREE.Vector3(v1.x, v1.y, z), new THREE.Vector3(v3.x, v3.y, z)]];
    }
    
    if (v3.z < z) {
        return [];
    }
    
    // intersect v1-v3 and (v1-v2 or v2-v3)
    //let res = [new THREE.Vector3(v1.x + )]
    return [];
}

function add_cube(x, y, z) {
    let newbox = new THREE.Mesh(boxGeom, boxMat);
    newbox.translateZ(z);
    newbox.translateY(y);
    newbox.translateX(x);
    scene.add(newbox);
};

function roundBlock(n) {
    return Math.floor(n / blockSize) * blockSize;
}

function add_in_line(a, b) {
    add_cube(roundBlock(a.x), roundBlock(a.y), z);
    return;
    if (a.x >= b.x) {
        a = [b, b = a][0];
    }
    if (b.x - a.x == 0 || (b.x - a.x) < Math.abs(b.y - a.y)) {
        if (a.y >= b.y) {
            a = [b, b = a][0];
        }
        for (const y = roundBlock(a.y) * blockSize; x < b.y + blockSize; x += blockSize) {
            add_cube(roundBlock(a.x + dx * (y - a.y) / dy), y, a.z);
        };
        return;
    }
    for (const x = roundBlock(a.x); x < b.x + blockSize; x += blockSize) {
        add_cube(x, roundBlock(a.y + dy * (x - a.x) / dx), a.z);
    };
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
    controls.target = new THREE.Vector3(-15, 70, 0);
    controls.update();
   
    var cmaterial =  new THREE.MeshPhongMaterial({color: 0xffffff, side:THREE.DoubleSide});
    
    new THREE.OBJLoader().load('stanford_bunny.obj', function (object) {
        object.scale.set(900, 900, 900);
        
        let child = object.children[0];
        
        child.geometry.computeFaceNormals();
        child.geometry.computeVertexNormals();

        var geom = new THREE.Geometry();
        boxMat = new THREE.MeshBasicMaterial( {color: 0x888888} );

        geom.fromBufferGeometry(child.geometry);
        console.log(geom);
        
        slices = 20;
        var bbox = new THREE.Box3().setFromObject(object);  
        
        boxSize = (bbox.max.z - bbox.min.z) / slices;
        boxGeom = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
        boxGeom.computeFaceNormals();
        boxGeom.computeVertexNormals();
        
        for (const face of geom.faces) {
            console.log(geom.vertices[face.a]);
            let v1 = geom.vertices[face.a];
            let v2 = geom.vertices[face.b];
            let v3 = geom.vertices[face.c];
            if (v1.z > v2.z) {
                v2 = [v1, v1 = v2][0];
            }
            if (v1.z > v3.z) {
                v3 = [v1, v1 = v3][0];
            }
            if (v2.z > v3.z) {
                v2 = [v3, v3 = v2][0];
            }
            
            for (const i of Array(slices + 5).keys()) {        
                let z = bbox.min.z + i * boxSize;
                let face_sects = intersect_face(v1, v2, v3, z, boxSize);
                
                for (const sect of face_sects) {
                    add_in_line(sect[0], sect[1]);
                }
            }
        }
        /*
        for (const i of Array(slices + 5).keys()) {
            let z = bbox.min.z + i * boxSize;
            
            var planeg = new THREE.PlaneGeometry(bbox.max.x - bbox.min.x + 10, bbox.max.y - bbox.min.y + 10);
            var plane = new THREE.Mesh(planeg, cmaterial);
            plane.translateX((bbox.max.x + bbox.min.x) / 2 + 5);
            plane.translateY((bbox.max.y + bbox.min.y) / 2 + 5);
            plane.translateZ(z);
            scene.add(plane);
        }
        */
  
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
