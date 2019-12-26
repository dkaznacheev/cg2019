const R = 200;
var scene, renderer, camera, controls, count;

var model, skeleton, mixer, clock;
var light;
var runAction;
var runWeight;
var actions, settings;
var lleg, rleg;
const r0 = 3.141592;
var t = 0;
var tr = -2;
var tl = -2;

function addLight() {
	light = new THREE.PointLight( 0x888888, 1, 100 );
    light.position.set( 50, 120, 50 );
    scene.add( light );
    var alight = new THREE.AmbientLight(0xffffff);
    scene.add(alight);
    var hlight = new THREE.HemisphereLight( 0xaaaaaa, 0x080808, 1 );
    scene.add( hlight );
}

function ik_leg(leg, val) {
    let alpha = Math.acos(val);
    leg.hip.rotation.x = r0 - alpha;
    leg.knee.rotation.x = r0 - (3.141592 - 2 * alpha);
}

function update_left_leg() {
    tl = t;
    let val = document.getElementById("left_leg").value / 100;
    ik_leg(lleg, val);
}

function update_right_leg() {
    tr = t;
    let val = document.getElementById("right_leg").value / 100;
    ik_leg(rleg, val);
}

function setleg(leg, index) {
    leg = {};
    leg.hip = skeleton.bones[index];
    leg.knee = skeleton.bones[index + 1];
    leg.foot = skeleton.bones[index + 2];
    
    leg.hip_size = 1;
    leg.knee_size = 1;
    return leg;
}

function loadModel(texture) {    
    camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
    camera.position.set(250, 0, -300);
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target = new THREE.Vector3(0, 70, 0);
    controls.update();

    addLight();
    

	clock = new THREE.Clock();    
    new THREE.GLTFLoader().load( 'Soldier.glb', function ( gltf ) {
        let object = gltf.scene;
        object.scale.set(100, 100, 100);
    	scene.add(object);
    	    
        skeleton = new THREE.SkeletonHelper( object );
		skeleton.visible = true;
		scene.add( skeleton );
    
        var boxMat = new THREE.MeshBasicMaterial({color: 0xffffff});
        var boxGeom = new THREE.SphereGeometry(5, 15);
        
        lleg = setleg(lleg, 45);
        rleg = setleg(rleg, 41);
      
        render();
    });
}

function initTexture(texture) {
    scene = new THREE.Scene();
    
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
	
    scene.background = new THREE.Color( 0xBEDEAD );
    
    document.body.appendChild(renderer.domElement);
    
    loadModel(texture);
}


function init() {
    initTexture(null);
}


function render() {
    const canvas = renderer.domElement;
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }
    t += 0.1;
    let a = (1 + Math.sin(t)) / 2;
    if (lleg && t - tl > 2) { 
        ik_leg(lleg, a); 
    }
    if (lleg && t - tr > 2) { 
        ik_leg(rleg, 1 - a); 
    }
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

init();
