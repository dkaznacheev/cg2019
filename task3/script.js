const R = 200;
var scene, renderer, camera, controls, materialShader, count;
var light;
var blockSize, slices, boxGeom, boxMat;

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

function intersect_section(v1, v2, z) {
    return new THREE.Vector3(v1.x + (z - v1.z) / (v2.z - v1.z) * (v2.x - v1.x),
                             v1.y + (z - v1.z) / (v2.z - v1.z) * (v2.y - v1.y),
                             z);
}

function intersect_face(v1, v2, v3, z, blockSize) {
    if (v1.z >= z) {
        return [];
    }
    
    if (v1.z > z - 2 * blockSize && v1.z < z && v3.z < z) {
        //project plane
        return [[new THREE.Vector3(v1.x, v1.y, z), new THREE.Vector3(v2.x, v2.y, z)],
                [new THREE.Vector3(v2.x, v2.y, z), new THREE.Vector3(v3.x, v3.y, z)],
                [new THREE.Vector3(v1.x, v1.y, z), new THREE.Vector3(v3.x, v3.y, z)]];
    }
    
    if (v3.z < z) {
        return [];
    }
    // intersect v1-v3 and (v1-v2 or v2-v3)
    if (v2.z < z) {
        return [[intersect_section(v1, v3, z), intersect_section(v2, v3, z)]];
    }
    return [[intersect_section(v1, v2, z), intersect_section(v1, v3, z)]];
}

function roundBlock(n) {
    return Math.floor(n / blockSize) * blockSize;
}


function add_cube(x, y, z) {
    let newbox = new THREE.Mesh(boxGeom, boxMat);
    newbox.translateZ(roundBlock(z));
    newbox.translateY(roundBlock(y));
    newbox.translateX(roundBlock(x));
    scene.add(newbox);
};

function add_in_line(a, b) {
    if (a.x >= b.x) {
        a = [b, b = a][0];
    }
    let dx = b.x - a.x;
    let dy = b.y - a.y;
    if (dx == 0 || dx < Math.abs(dy)) {
        if (a.y >= b.y) {
            a = [b, b = a][0];
        }
        for (var y = roundBlock(a.y); y < b.y; y += blockSize) {
            add_cube(roundBlock(a.x + dx * (y - a.y) / dy), y, a.z);
        };
        return;
    }
    for (var x = roundBlock(a.x); x < b.x; x += blockSize) {
        add_cube(x, roundBlock(a.y + dy * (x - a.x) / dx), a.z);
    };
}

function fill_face(v1, v2, v3, z) {

    console.log("!");
    if (v1.x > v2.x) {
        v2 = [v1, v1 = v2][0];
    }
    if (v1.x > v3.x) {
        v3 = [v1, v1 = v3][0];
    }
    if (v2.x > v3.x) {
        v2 = [v3, v3 = v2][0];
    }
        
    for (var x = roundBlock(v1.x); x < v3.x; x += blockSize) {
        let a = new THREE.Vector3(x, v1.y + (x - v1.x) / (v3.x - v1.x) * (v3.y - v1.y), z);
        if (x <= v2.x) {           
            let b = new THREE.Vector3(x, v1.y + (x - v1.x) / (v2.x - v1.x) * (v2.y - v1.y), z);
            add_in_line(a, b);
        } else {
            let b = new THREE.Vector3(x, v2.y + (x - v2.x) / (v3.x - v2.x) * (v3.y - v2.y), z);
            add_in_line(a, b);
        }
    }
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
    //controls.target = new THREE.Vector3(-15, 70, 0);
    controls.update();
   
    var cmaterial = new THREE.MeshPhongMaterial({color: 0xffffff, side:THREE.DoubleSide});
    
    new THREE.OBJLoader().load('stanford_bunny.obj', function (object) {
        object.scale.set(900, 900, 900);
        
        let child = object.children[0];
        
        child.geometry.computeFaceNormals();
        child.geometry.computeVertexNormals();

//        var geom = new THREE.Geometry();
        var geom = new THREE.BoxGeometry(100, 100, 100);
        let testMesh = new THREE.Mesh(geom, cmaterial);
//        scene.add(testMesh);
        boxMat = new THREE.MeshPhongMaterial({color: 0xffffff, side:THREE.DoubleSide});

//        geom.fromBufferGeometry(child.geometry);

        
        slices = 10;
//        var bbox = new THREE.Box3().setFromObject(object);  
        var bbox = new THREE.Box3().setFromObject(testMesh);  
        console.log(bbox);
        
        
        blockSize = (bbox.max.z - bbox.min.z) / slices;
        boxGeom = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
        boxGeom.computeFaceNormals();
        boxGeom.computeVertexNormals();
        
        for (const face of geom.faces) {
            let v1 = geom.vertices[face.a].clone();//.multiplyScalar(900);
            let v2 = geom.vertices[face.b].clone();//.multiplyScalar(900);
            let v3 = geom.vertices[face.c].clone();//.multiplyScalar(900);
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
                let z = bbox.min.z + i * blockSize;
                let face_sects = intersect_face(v1, v2, v3, z, blockSize);
                
                if (face_sects.length == 3) {
                    fill_face(v1, v2, v3, z);
                } else {
                    for (const sect of face_sects) {
                        add_in_line(sect[0], sect[1]);
                    }
                }
            }
            
        }
        
  
        //scene.add(object);
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
