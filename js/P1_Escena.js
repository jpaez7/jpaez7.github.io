/**
 * P1_Escena.js
 * 
 * Practica AGM #1. Escena basica en three.js
 * Seis objetos organizados en un grafo de escena con
 * transformaciones, animacion basica y modelos importados
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

// Variables de consenso
let renderer, scene, camera;

// Otras globales
/*******************
 * TO DO: Variables globales de la aplicacion
 *******************/
let esferaCubo;
let angulo = 0;

// Acciones
init();
loadScene();
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
    camera.lookAt( new THREE.Vector3(0,1,0) );
}

function loadScene()
{
    const material = new THREE.MeshNormalMaterial( );
    //const material = new THREE.MeshBasicMaterial( { color: 'yellow', wireframe: true } );

    /*******************
    * TO DO: Construir un suelo en el plano XZ
    *******************/
    const suelo = new THREE.Mesh( new THREE.PlaneGeometry(10,10,10,10), material );
    suelo.rotation.x = -Math.PI / 2;
    scene.add(suelo);

    /*******************
    * TO DO: Construir una escena con 5 figuras diferentes posicionadas
    * en los cinco vertices de un pentagono regular alredor del origen
    *******************/
    const geoCubo = new THREE.BoxGeometry( 2, 2, 2 );
    const geoEsfera = new THREE.SphereGeometry( 1, 20,20 );
    //const geoExtrude = new THREE.ExtrudeGeometry( 1, 5, 8, 1, 2, 3 );
    //const geoIcosa = new THREE.IcosahedronGeometry( 1, 1, 2 );
    //const geoDodeca = new THREE.DodecahedronGeometry( 1, 5, 1 );

    const cubo = new THREE.Mesh( geoCubo, material );
    const esfera = new THREE.Mesh( geoEsfera, material );
    //const extrude = new THREE.Mesh( geoExtrude, material );
    //const icosa = new THREE.Mesh( geoIcosa, material );
    //const dodeca = new THREE.Mesh( geoDodeca, material ); 

    /*******************
    * TO DO: Añadir a la escena un modelo importado en el centro del pentagono
    *******************/

      // Importar un modelo en json
      const loader = new THREE.ObjectLoader();

    loader.load( 'models/soldado/soldado.json', 
        function(objeto){
            cubo.add(objeto);
            objeto.position.y = 1;
        }
    )
  
      // Importar un modelo en gltf
      const glloader = new GLTFLoader();
  
      //glloader.load( 'models/RobotExpressive.glb', function ( gltf ) {
      glloader.load( 'models/playerbb/scene.gltf', function ( gltf ) {
          gltf.scene.position.y = 2;
          gltf.scene.rotation.y = -Math.PI/2;
          esfera.add( gltf.scene );
          console.log("ROBOT");
          console.log(gltf);
      
      }, undefined, function ( error ) {
      
          console.error( error );
      
      } );

    /*******************
    * TO DO: Añadir a la escena unos ejes
    *******************/

    esferaCubo = new THREE.Object3D();
    esferaCubo.position.y = 1.5;
    cubo.position.x = -1;
    esfera.position.x = 1;
    cubo.add( new THREE.AxesHelper(1) );

    scene.add( esferaCubo);
    esferaCubo.add( cubo );
    esferaCubo.add( esfera );
    
    
    scene.add( new THREE.AxesHelper(3) );

    //extrude.position.y = 1.5;
    //scene.add( extrude );

}

function update()
{
    /*******************
    * TO DO: Modificar el angulo de giro de cada objeto sobre si mismo
    * y del conjunto pentagonal sobre el objeto importado
    *******************/
    angulo += 0.01;
    esferaCubo.rotation.y = angulo;
}

function render()
{
    requestAnimationFrame( render );
    update();
    renderer.render( scene, camera );
}