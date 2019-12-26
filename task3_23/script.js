const R = 200;
var scene, renderer, camera, controls, count;

var model, skeleton, mixer, clock;
var light;
var runAction;
var runWeight;
var actions, settings;

function addLight() {
	light = new THREE.PointLight( 0x888888, 1, 100 );
    light.position.set( 50, 120, 50 );
    scene.add( light );
    var alight = new THREE.AmbientLight(0xffffff);
    scene.add(alight);
    var hlight = new THREE.HemisphereLight( 0xaaaaaa, 0x080808, 1 );
    scene.add( hlight );
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
        console.log(gltf);
        let object = gltf.scene;
        object.scale.set(100, 100, 100);
    	scene.add(object);
    	    
        skeleton = new THREE.SkeletonHelper( object );
		skeleton.visible = true;
		scene.add( skeleton );
        
        var animations = gltf.animations;
	    mixer = new THREE.AnimationMixer( object );
	    console.log(animations[1]);
	    runAction = mixer.clipAction(animations[1]);
	    runAction.enabled = true;
		runAction.setEffectiveTimeScale( 1 );
		runAction.setEffectiveWeight(1);
		runAction.play();
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
    
    if (mixer) {
	    var mixerUpdateDelta = clock.getDelta();
	    mixer.update( mixerUpdateDelta );
    }
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

init();
