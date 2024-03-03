/**
 * EscenaIluminada.js
 * 
 * Practica AGM #3. Escena basica con interfaz, animacion e iluminacion
 * Se trata de añadir luces a la escena y diferentes materiales
 * 
 * @author 
 * 
 */

// Modulos necesarios
/*******************
 * TO DO: Cargar los modulos necesarios
 *******************/
import * as THREE from "../lib/three.module.js";
import {GLTFLoader} from "../lib/GLTFLoader.module.js";
import {OrbitControls} from "../lib/OrbitControls.module.js";
import {TWEEN} from "../lib/tween.module.min.js";
import {GUI} from "../lib/lil-gui.module.min.js";

// Variables de consenso
let renderer, scene, camera;

// Otras globales
/*******************
 * TO DO: Variables globales de la aplicacion
 *******************/
let cameraControls, effectController;
let esferaCubo,cubo,esfera,suelo;
let video;
let pentShape;
let material;
let figures;
let model;
let matfigure;
let matesfera;
let matsuelo;
let matcylinder;
// Acciones
init();
loadScene();
loadGUI();
render();

function init()
{
    // Motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    /*******************
    * TO DO: Completar el motor de render, el canvas y habilitar
    * el buffer de sombras
    *******************/
    document.getElementById('container').appendChild( renderer.domElement );
    renderer.antialias = true;
    renderer.shadowMap.enabled = true;
    // Escena
    scene = new THREE.Scene();
    
    // Camara
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1,1000);
    camera.position.set( 0.5, 2, 7 );
    
    /*******************
    * TO DO: Añadir manejador de camara (OrbitControls)
    *******************/
    camera.lookAt( new THREE.Vector3(0,1,0) );
    cameraControls = new OrbitControls( camera, renderer.domElement );
    cameraControls.target.set(0,1,0);
    camera.lookAt(0,1,0);
    // Eventos
    renderer.domElement.addEventListener('dblclick', animate );
    // Luces
    /*******************
     * TO DO: Añadir luces y habilitar sombras
     * - Una ambiental
     * - Una direccional
     * - Una focal
     *******************/
    const ambiental = new THREE.AmbientLight(0x222222);
    scene.add(ambiental);
    const direccional = new THREE.DirectionalLight(0xFFFFFF,0.3);
    direccional.position.set(-1,10,-1);
    direccional.castShadow = true;
    scene.add(direccional);
    scene.add(new THREE.CameraHelper(direccional.shadow.camera));
    const focal = new THREE.SpotLight(0xFFFFFF,0.3);
    focal.position.set(-2,7,4);
    focal.target.position.set(0,0,0);
    focal.angle= Math.PI/7;
    focal.penumbra = 0.3;
    focal.castShadow= true;
    focal.shadow.camera.far = 20;
    focal.shadow.camera.fov = 80;
    scene.add(focal);
    scene.add(new THREE.CameraHelper(focal.shadow.camera));
}

function loadScene()
{
    // Texturas
    /*******************
     * TO DO: Cargar texturas
     * - De superposición
     * - De entorno
     *******************/
    const path ="./images/";
    const texfigure = new THREE.TextureLoader().load(path+"wood512.jpg");
    const texsuelo = new THREE.TextureLoader().load(path+"r_256.jpg");
    texsuelo.repeat.set(4,3);
    texsuelo.wrapS= texsuelo.wrapT = THREE.MirroredRepeatWrapping;
    const entorno = [ path+"posx.jpg", path+"negx.jpg",
                      path+"posy.jpg", path+"negy.jpg",
                      path+"posz.jpg", path+"negz.jpg"];
    const texesfera = new THREE.CubeTextureLoader().load(entorno);

    // Materiales
    /*******************
     * TO DO: Crear materiales y aplicar texturas
     * - Uno basado en Lambert
     * - Uno basado en Phong
     * - Uno basado en Basic
     *******************/
    matfigure = new THREE.MeshLambertMaterial({color:'yellow',map:texfigure});
    matesfera = new THREE.MeshPhongMaterial({color:'white',
                                                   specular:'gray',
                                                   shininess: 30,
                                                   envMap: texesfera });
    matsuelo = new THREE.MeshStandardMaterial({color:"rgb(150,150,150)",map:texsuelo});
    matcylinder = new THREE.MeshBasicMaterial({color:"rgb(150,150,150)",map:texsuelo});
    /*******************
    * TO DO: Misma escena que en la practica anterior
    * cambiando los materiales y activando las sombras
    *******************/
    material = new THREE.MeshNormalMaterial( {wireframe:false} );
    //const suelo = new THREE.Mesh( new THREE.PlaneGeometry(10,10, 10,10), matsuelo );
    
    //Creamos la geometría de las figuras
    const geoCubo = new THREE.BoxGeometry( 2,2,2 );
    const geoEsfera = new THREE.SphereGeometry( 1, 20,20 );
    const geoCone = new THREE.ConeGeometry( 1, 5, 8, 1);
    const geoCylinder = new THREE.CylinderGeometry( 1, 1, 2);
    const geoCapsule = new THREE.CapsuleGeometry(1, 5, 1);
    //Creamos la mesh con la geometría y el material y hacemos que produzcan y reciban sombras.
    
    const cubo = new THREE.Mesh( geoCubo, matfigure );
    cubo.castShadow = true;
    cubo.receiveShadow = true;
    const esfera = new THREE.Mesh( geoEsfera, matesfera );
    esfera.castShadow = true;
    esfera.receiveShadow = true;
    const cone = new THREE.Mesh( geoCone, matfigure );
    cone.castShadow = true;
    cone.receiveShadow = true;
    const cylinder = new THREE.Mesh( geoCylinder, matcylinder );
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    const capsule = new THREE.Mesh( geoCapsule, matfigure );
    capsule.castShadow = true;
    capsule.receiveShadow = true;
    figures = [cubo, esfera, cone, cylinder, capsule];
    //Creamos la forma del pentagono y posicionamos sobre sus vertices a las figuras
    pentShape = new THREE.Shape();
    const pentRadius = 4;
    stablishPentRadius(pentRadius)
    //Creamos la geometría del pentagono (como ShapeGeometry no tiene volumen, puede recibir sombras pero no producirlas)
    const geoPent = new THREE.ShapeGeometry( pentShape );
    const pent = new THREE.Mesh( geoPent, matfigure );
    //Hacemos que pent pueda producir y recibir sombras.
    pent.castShadow = true;
    pent.receiveShadow = true;
    //Hacemos hijos del mesh del pentagono al resto de mesh y los rotamos para que sean paralelos al pentagono
    for(let i = 0; i < figures.length; i++){
        pent.add(figures[i]);
        figures[i].rotation.x = Math.PI / 2;
    }
    //Rotamos el pentagono para que sea paralelo al suelo (también se mueven las figuras para que sean paralelas sobre el plano)
    pent.rotation.x = -Math.PI / 2;
    //Creamos el objeto 3D que representa el pentagono
    const pentObject = new THREE.Object3D();
    pentObject.position.x=0;
    pentObject.position.y=1;
    pentObject.position.z=0;
    pentObject.add(pent);
    //PentObject puede producir sombra y recibir sombra.
    pentObject.castShadow = true;
    pentObject.receiveShadow = true;
    pentObject.add( new THREE.AxesHelper(1) );
    //Agregamos el objeto a la escena
    scene.add(pentObject);
    const glloader = new GLTFLoader();
    glloader.load( 'models/anime_lady_officer/scene.gltf', function ( gltf ) {
            gltf.scene.position.y = 0;
            gltf.scene.rotation.y = -Math.PI/2;
            pentObject.add( gltf.scene );
            gltf.scene.scale.x = gltf.scene.scale.y * 2;
            gltf.scene.scale.y = gltf.scene.scale.y * 2;
            gltf.scene.scale.z = gltf.scene.scale.z * 2;
            console.log("LADY OFFICER");
            model = gltf.scene;
            //La chica produce y recibe sombras.
            gltf.scene.traverse(ob=>{
                if(ob.isObject3D) {
                    ob.castShadow = true;
                    ob.receiveShadow = true;
                }
            })
            console.log(gltf);
        
        }, undefined, function ( error ) {
        
            console.error( error );
        
        } );
    scene.add( new THREE.AxesHelper(3) );
    /******************
     * TO DO: Crear una habitacion de entorno
     ******************/
    // Habitacion
    const paredes = [];
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"posx.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"negx.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"posy.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"negy.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"posz.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"negz.jpg")}) );
    const habitacion = new THREE.Mesh( new THREE.BoxGeometry(40,40,40),paredes);
    scene.add(habitacion);
    /******************
     * TO DO: Asociar una textura de vídeo al suelo
     ******************/
    video = document.createElement('video');
    video.src = "./videos/Pixar.mp4";
    video.load();
    video.muted = true;
    video.play();
    const texvideo = new THREE.VideoTexture(video);
    const suelo = new THREE.Mesh(new THREE.PlaneGeometry(10,10, 10,10), 
                                    new THREE.MeshBasicMaterial({map:texvideo}));
    suelo.rotation.x = -Math.PI / 2;
    //Hacemos que suelo pueda recibir sombra.
    suelo.receiveShadow = true;
    scene.add(suelo);
}

//Función que establece el radio del pentagono
function stablishPentRadius(radius){
    for (let i = 0; i < 5; i++) {
        let angle = (i / 5) * Math.PI * 2;
        //let angle = (i / pentSides) * (-Math.PI/2);
        let x = Math.cos(angle) * radius;
        let y = Math.sin(angle) * radius;
        if (i === 0) {
            pentShape.moveTo(x, y);
        } else {
            pentShape.lineTo(x, y);
        }
        //Colocamos la figura en la posición
        figures[i].position.x = x;
        figures[i].position.y = y;
    }
}

function loadGUI()
{
    // Interfaz de usuario
    /*******************
    * TO DO: Crear la interfaz de usuario con la libreria lil-gui.js
    * - Funcion de disparo de animaciones. Las animaciones deben ir
    *   encadenadas
    * - Slider de control de radio del pentagono
    * - Checkbox para alambrico/solido
    * - Checkbox de sombras
    * - Selector de color para cambio de algun material
    * - Boton de play/pause y checkbox de mute
    *******************/
   // Definicion de los controles
	effectController = {
		mensaje: 'Lady Officer',
		radioPent: 4.0,
        alambric: false,
        shadow: true,
        play: function(){video.play();},
		pause: function(){video.pause();},
        mute: true,
		colorcubo: "rgb(150,150,150)",
        ladyAnimation: animateLady,
        cubeAnimation: animateCube,
        esferaAnimation: animateEsfera,
        coneAnimation: animateCone,
        cylinderAnimation: animateCylinder,
        capsuleAnimation: animateCapsule
	};

	// Creacion interfaz
	const gui = new GUI();

	// Construccion del menu
	const h = gui.addFolder("Control PentObject");
	h.add(effectController, "mensaje").name("Aplicacion");
	h.add(effectController, "radioPent", 0, 10).name("Radio del pentagono");
    h.add(effectController, "alambric").name("Alambric");
    h.add(effectController, "ladyAnimation").name("Activar animación personaje");
    h.add(effectController, "cubeAnimation").name("Activar animación cubo");
    h.add(effectController, "esferaAnimation").name("Activar animación esfera");
    h.add(effectController, "coneAnimation").name("Activar animación cono");
    h.add(effectController, "cylinderAnimation").name("Activar animación cilindro");
    h.add(effectController, "capsuleAnimation").name("Activar animación capsula");

    const hi = gui.addFolder("Control color y sombras")
    hi.add(effectController, "shadow").name("Cast shadow")
    .onChange( value =>
    {
        //Activamos/desactivamos la sombra de las figuras
        for(let i = 0; i < 5; i++){
            figures[i].castShadow = value;
        }
        //Activamos/desactivamos la sombra de la chica
        model.traverse(ob=>{
            if(ob.isObject3D) {
                ob.castShadow = value;
            }
        })
    })
    hi.addColor(effectController, "colorcubo")
     .name("Color cubo, pentagono, cono y cilindro")
     .onChange(c=>{figures[0].material.setValues({color:c})});

    const hj = gui.addFolder("Control video")
    hj.add(effectController,"play");
	hj.add(effectController,"pause");
    hj.add(effectController,"mute").onChange(v=>{video.muted = v});

    gui.onChange( event => {
        //Si se modifica el controlador del radio, modificamos el radio del pentagono
        if(event.property == "radioPent"){
            stablishPentRadius(event.value)
        }
        //Si se modifica el check box del controlador del matarial, modificamos el material
        if(event.property == "alambric"){
            material.wireframe = event.value;
            matesfera.wireframe = event.value;
            matfigure.wireframe = event.value;
            matsuelo.wireframe = event.value;
            matcylinder.wireframe = event.value;
        }
    })
}

//Funciones para preparar la animacion

function animateLady(){
    new TWEEN.Tween( model.position ).
        to( {x:[0,0,0],y:[0,5,0],z:[0,0,0]}, 2000 ).
        interpolation( TWEEN.Interpolation.Bezier ).
        easing( TWEEN.Easing.Bounce.Out ).
        start();
}

function animateCube(){
    new TWEEN.Tween( figures[0].rotation ).
        to( {x:[0,0],y:[0,Math.PI*2],z:[0,0]}, 2000 ).
        interpolation( TWEEN.Interpolation.Bezier ).
        easing( TWEEN.Easing.Linear.None ).
        start();
}

function animateEsfera(){
    let originScaleX = figures[1].scale.x
    let originScaleY = figures[1].scale.y
    let originScaleZ = figures[1].scale.z
    new TWEEN.Tween( figures[1].scale ).
        to( {x:[originScaleX ,originScaleX * 4, originScaleX],y:[originScaleY ,originScaleY * 4, originScaleY],z:[originScaleZ ,originScaleZ * 4, originScaleZ]}, 2000 ).
        interpolation( TWEEN.Interpolation.Bezier ).
        easing( TWEEN.Easing.Bounce.InOut ).
        start();
}

function animateCone(){
    new TWEEN.Tween( figures[2].rotation ).
        to( {x:[figures[2].rotation.x,figures[2].rotation.x-Math.PI], y:[figures[2].rotation.y, figures[2].rotation.y], z:[figures[2].rotation.z, figures[2].rotation.z]}, 2000 ).
        easing( TWEEN.Easing.Quadratic.Out ).
        start();
}

function animateCylinder(){
    let originScaleX = figures[3].scale.x
    let originScaleY = figures[3].scale.y
    let originScaleZ = figures[3].scale.z
    new TWEEN.Tween( figures[3].scale ).
        to( {x:[originScaleX, originScaleX * 2, originScaleX],y:[originScaleY, originScaleY],z:[originScaleZ, originScaleZ * 2, originScaleZ]}, 2000 ).
        interpolation( TWEEN.Interpolation.Bezier ).
        easing( TWEEN.Easing.Circular.InOut ).
        start();
}

function animateCapsule(){
    new TWEEN.Tween( figures[4].rotation ).
    to( {x:[figures[4].rotation.x,figures[4].rotation.x], y:[figures[4].rotation.y, figures[4].rotation.y], z:[figures[4].rotation.z, figures[4].rotation.z + Math.PI / 2]}, 2000 ).
    easing( TWEEN.Easing.Bounce.Out ).
    start();
}

function animate(event)
{
    // Capturar y normalizar
    let x= event.clientX;
    let y = event.clientY;
    x = ( x / window.innerWidth ) * 2 - 1;
    y = -( y / window.innerHeight ) * 2 + 1;

    // Construir el rayo y detectar la interseccion
    const rayo = new THREE.Raycaster();
    rayo.setFromCamera(new THREE.Vector2(x,y), camera);
    let intersecciones = rayo.intersectObjects(model.children,true);

    if( intersecciones.length > 0 ){
        animateLady();
    }
}

function update(delta)
{
    /*******************
    * TO DO: Actualizar tween
    *******************/
    TWEEN.update();
}

function render(delta)
{
    requestAnimationFrame( render );
    update(delta);
    renderer.render( scene, camera );
}