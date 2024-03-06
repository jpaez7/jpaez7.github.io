/**
 * EscenaAnimada.js
 * 
 * Practica AGM #2. Escena basica con interfaz y animacion
 * Se trata de añadir un interfaz de usuario que permita 
 * disparar animaciones sobre los objetos de la escena con Tween
 * 
 * @author José Páez <jpaez@etsinf.upv.es> FEB2024
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

// Variables de consenso
let renderer, scene, camera;

// Otras globales
/*******************
 * TO DO: Variables globales de la aplicacion
 *******************/
let cameraControls, effectController;
let esferaCubo,cubo,esfera;
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

    // Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(1, 0.7, 0.2);
    
    // Camara
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
    const material = new THREE.MeshNormalMaterial( {wireframe:false} );

    /*******************
    * TO DO: Misma escena que en la practica anterior
    *******************/
    // Suelo
    const suelo = new THREE.Mesh( new THREE.PlaneGeometry(10,10, 10,10), material );
    suelo.rotation.x = -Math.PI/2;
    suelo.position.y = -0.2;
    scene.add(suelo);

    // Esfera y cubo
    esfera = new THREE.Mesh( new THREE.SphereGeometry(1,20,20), material );
    cubo = new THREE.Mesh( new THREE.BoxGeometry(2,2,2), material );
    esfera.position.x = 1;
    cubo.position.x = -1;

    esferaCubo = new THREE.Object3D();
    esferaCubo.add(esfera);
    esferaCubo.add(cubo);
    esferaCubo.position.y = 1.5;

    scene.add(esferaCubo);

    scene.add( new THREE.AxesHelper(3) );
    cubo.add( new THREE.AxesHelper(1) );

    // Modelos importados
    const loader = new THREE.ObjectLoader();
    loader.load('models/soldado/soldado.json', 
    function (objeto)
    {
        const soldado = new THREE.Object3D();
        soldado.add(objeto);
        cubo.add(soldado);
        soldado.position.y = 1;
        soldado.name = 'soldado';
    });

   // Importar un modelo en gltf
   const glloader = new GLTFLoader();

   glloader.load( 'models/robota/scene.gltf', function ( gltf ) {
       gltf.scene.position.y = 1;
       gltf.scene.rotation.y = -Math.PI/2;
       gltf.scene.name = 'robota';
       esfera.add( gltf.scene );
   
   }, undefined, function ( error ) {
   
       console.error( error );
   
   } );

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
    *******************/
}

function update(delta)
{
    /*******************
    * TO DO: Actualizar tween
    *******************/

}

function render(delta)
{
    requestAnimationFrame( render );
    update(delta);
    renderer.render( scene, camera );
}