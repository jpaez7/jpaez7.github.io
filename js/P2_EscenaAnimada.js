/**
 * P2_EscenaAnimada.js
 * 
 * Practica AGM #2. Escena basica con interfaz y animacion
 * Se trata de añadir un interfaz de usuario que permita 
 * disparar animaciones sobre los objetos de la escena con Tween
 * 
 * @author José Páez <jpaez@etsinf.upv.es>, FEB2024
 * Repositorio GIT: jpaez7.github.io 
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

// Variables de estandar o de consenso
let renderer, scene, camera;

// Otras globales
/*******************
 * TO DO: Variables globales de la aplicacion
 *******************/
let pentaForm, figuras, material, modelo;
//, giraFiguras;
let cameraControls, effectController;
let angulo = 0;

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
    * TO DO: Completar el motor de render y el canvas
    *******************/
    document.getElementById('container').appendChild( renderer.domElement );

    // Instanciar Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(1, 0.7, 0.2);
    
    // Instanciar Camara
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1,1000);
    camera.position.set( 0.5, 2, 7 );

    /*******************
    * TO DO: Añadir manejador de camara (OrbitControls)
    *******************/
    cameraControls = new OrbitControls( camera, renderer.domElement );
    cameraControls.target.set(0,1,0);
    camera.lookAt( new THREE.Vector3(0,1,0) );

     // Eventos
     renderer.domElement.addEventListener('dblclick', animate );
}

function loadScene()
{
    // *** Selección de presentación en color del Mesh Básico
    
    material = new THREE.MeshBasicMaterial( { color: 'white', wireframe: true } );

    /*******************
    * TO DO: Construir un suelo en el plano XZ
    *******************/
    const suelo = new THREE.Mesh( new THREE.PlaneGeometry(10,10,10,10), material );
    suelo.rotation.x = -Math.PI / 2;
    //suelo.position.y = -0.2;    
    scene.add(suelo);

    /*******************
    * TO DO: Construir una escena con 5 figuras diferentes posicionadas
    * en los cinco vertices de un pentagono regular alredor del origen
    *******************/
    const geoCubo = new THREE.BoxGeometry( 2, 2, 2 );
    const geoEsfera = new THREE.SphereGeometry( 1, 20 ,20 );
    const geoDodeca = new THREE.DodecahedronGeometry( 1, 1, 1);
    const geoCylinder = new THREE.CylinderGeometry( 1, 1, 2);
    const geoIcosa = new THREE.IcosahedronGeometry(1, 1, 2);
    
    const cubo = new THREE.Mesh( geoCubo, material );
    const esfera = new THREE.Mesh( geoEsfera, material );
    const dodeca = new THREE.Mesh( geoDodeca, material );
    const cylinder = new THREE.Mesh( geoCylinder, material );
    const icosa = new THREE.Mesh( geoIcosa, material );

    figuras = [cubo, esfera, dodeca, cylinder, icosa];

    // Elaborar el pentagono y colocar figuras en cada vertice

    pentaForm = new THREE.Shape();
    const pentRadius = 2;
    stablishPentRadius(pentRadius)

    // Crear geometría del pentagono
    const geoPent = new THREE.ShapeGeometry( pentaForm );
    const pent = new THREE.Mesh( geoPent, material );

    // Relacionar objetos al mesh del pentagono y al resto de mesh
        
    for(let i = 0; i < figuras.length; i++){
        pent.add(figuras[i]);
        figuras[i].rotation.x = Math.PI / 2;
    }
    
    // Rotar el pentagono en paralelo al suelo, además mover las figuras
    
    pent.rotation.x = -Math.PI / 2;
    
    //Crear el objeto que representa un pentagono
    
    const pentaFigu = new THREE.Object3D();
    pentaFigu.position.x=0;
    pentaFigu.position.y=1;
    pentaFigu.position.z=0;
    pentaFigu.add(pent);
    pentaFigu.add( new THREE.AxesHelper(1) );

    //Agregar objeto a la escena
    scene.add(pentaFigu);

    /*******************
    * TO DO: Añadir a la escena un modelo importado en el centro del pentagono
    *******************/
    const glloader = new GLTFLoader();
  
    glloader.load( 'models/playerfa/scene.gltf', function ( gltf ) {
        gltf.scene.position.y = 0;
        gltf.scene.rotation.y = -Math.PI/2;
        pentaFigu.add( gltf.scene );
        gltf.scene.scale.x = gltf.scene.scale.x * 2;
        gltf.scene.scale.y = gltf.scene.scale.y * 2;
        gltf.scene.scale.z = gltf.scene.scale.z * 2;        
        console.log("FA PLAYER");
        modelo = gltf.scene;
        console.log(gltf);
    
    }, undefined, function ( error ) {
      
        console.error( error );
      
    } );
    /*******************
    * TO DO: Añadir a la escena unos ejes
    *******************/
    scene.add( new THREE.AxesHelper(3) );
}

//Función para establecer el radio del pentagono

function stablishPentRadius(radius){
    for (let i = 0; i < 5; i++) {
        let angle = (i / 5) * Math.PI * 2;
        let x = Math.cos(angle) * radius;
        let y = Math.sin(angle) * radius;
        if (i === 0) {
            pentaForm.moveTo(x, y);
        } else {
            pentaForm.lineTo(x, y);
        }
        //Colocar figuras en posición
        figuras[i].position.x = x;
        figuras[i].position.y = y;
    }
}

function loadGUI()
{
    // Interfaz de usuario
    /*******************
    * TO DO: Crear la interfaz de usuario con la libreria lil-gui.js
    * - Funcion de disparo de animaciones. Las animaciones deben ir encadenadas
    * - Slider de control de radio del pentagono
    * - Checkbox para alambrico/solido
    *******************/
	
    // Definicion de los controles
	effectController = {
		mensaje: 'Seminario #2',
        radioPent: 4.5,
        giroY: 0.0,
        colorsuelo: "rgb(150,150,150)",
        playerAnimation: animaPlayer
	};

	// Creacion interfaz
	const gui = new GUI();

	// Construccion del menu
	const h = gui.addFolder("Menú General");
	h.add(effectController, "mensaje").name("Práctica");
    h.add(effectController, "giroY", -180.0, 180.0, 0.025).name("Girar en Y - NO");
    h.add(effectController, "radioPent", 3, 6).name("Mover Figuras");
    h.add(effectController, "playerAnimation").name("Rebotar Modelo");
    h.addColor(effectController, "colorsuelo").name("Color alambres - NO");

    gui.onChange( event => {
        // Modificar controlador del radio y radio del pentagono
        if(event.property == "radioPent"){
            stablishPentRadius(event.value)
        }
     })
}

//Funciones de Animación

function animaPlayer(){
    new TWEEN.Tween( modelo.position ).
        to( {x:[0,0,0],y:[0,5,0],z:[0,0,0]}, 2000 ).
        interpolation( TWEEN.Interpolation.Bezier ).
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
    let intersecciones = rayo.intersectObjects(modelo.children,true);

    if( intersecciones.length > 0 ){
        animaPlayer();
    }

    intersecciones = rayo.intersectObjects(robot.children,true);

    if( intersecciones.length > 0 ){
        new TWEEN.Tween( playerb.rotation ).
        to( {x:[0,0],y:[Math.PI,-Math.PI/2],z:[0,0]}, 5000 ).
        interpolation( TWEEN.Interpolation.Linear ).
        easing( TWEEN.Easing.Exponential.InOut ).
        start();
    }
}

function update(delta)
{
    /*******************
    * TO DO: Actualizar tween
    *******************/
    //angulo += 0.01;
    
    // Lectura de controles en GUI (es mejor hacerlo con onChange)
    //cubo.material.setValues( { color: effectController.colorsuelo } );
	//giraFiguras.rotation.y = effectController.giroY * Math.PI/180;
	TWEEN.update();
}

function render(delta)
{
    requestAnimationFrame( render );
    update(delta);
    renderer.render( scene, camera );
}