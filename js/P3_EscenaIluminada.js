/**
 * EscenaIluminada.js
 * 
 * Practica AGM #3. Escena basica con interfaz, animacion e iluminacion
 * Se trata de añadir luces a la escena y diferentes materiales
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
    scene.background = new THREE.Color(0.5,0.5,0.5);
    
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
    window.addEventListener('resize', updateAspectRatio );
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
    direccional.position.set(-1,1,-1);
    direccional.castShadow = true;
    scene.add(direccional);
    const puntual = new THREE.PointLight(0xFFFFFF,0.5);
    puntual.position.set(2,7,-4);
    scene.add(puntual);
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

    // Materiales
    /*******************
     * TO DO: Crear materiales y aplicar texturas
     * - Uno basado en Lambert
     * - Uno basado en Phong
     * - Uno basado en Basic
     *******************/

    /*******************
    * TO DO: Misma escena que en la practica anterior
    * cambiando los materiales y activando las sombras
    *******************/

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