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
let pentaFigu;
let figuras;
let model;
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
    // *** Selección de presentación en color del Mesh Básico
    
    //const material = new THREE.MeshNormalMaterial( );
    const material = new THREE.MeshBasicMaterial( { color: 'white', wireframe: true } );
    //const material = new THREE.MeshBasicMaterial( { color: 'white' } );

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
    
    // Incorporar 3 nuvas figuras para completar lo solicitado

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

    const pentShape = new THREE.Shape();
    const pentRadius = 4;
    const pentSides = 5;

    for (let i = 0; i < pentSides; i++) {
        let angle = (i / pentSides) * Math.PI * 2;       
        let x = Math.cos(angle) * pentRadius;
        let y = Math.sin(angle) * pentRadius;
        if (i === 0) {
            pentShape.moveTo(x, y);
        } else {
            pentShape.lineTo(x, y);
        }
        
        // Colocar figuras en posición
        
        figuras[i].position.x = x;
        figuras[i].position.y = y;
    }
    
    // Crear geometría del pentagono
    
    const geoPent = new THREE.ShapeGeometry( pentShape );
    const pent = new THREE.Mesh( geoPent, material );
    
    // Relacionar objetos (hijos) al mesh del pentagono al resto de mesh
    // Para rotar en paralelo al pentagono
    
    for(let i = 0; i < figuras.length; i++){
        pent.add(figuras[i]);
        figuras[i].rotation.x = Math.PI / 2;
    }
    
    // Rotar el pentagono para que sea paralelo al suelo
    // (también se mueven las figuras para que sean paralelas sobre el plano)
    
    pent.rotation.x = -Math.PI / 2;
    
    //Crear el objeto 3D que representa el pentagono
    
    pentaFigu = new THREE.Object3D();
    pentaFigu.position.x=0;
    pentaFigu.position.y=1;
    pentaFigu.position.z=0;
    pentaFigu.add(pent);
    pentaFigu.add( new THREE.AxesHelper(1) );
    
    scene.add(pentaFigu);

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
  
    // Importar modelos en gltf
    const glloader = new GLTFLoader();
  
    glloader.load( 'models/playerbb/scene.gltf', function ( gltf ) {
        gltf.scene.position.y = 2;
        gltf.scene.rotation.y = -Math.PI/2;
        esfera.add( gltf.scene );
        console.log("BB PLAYER");
        console.log(gltf);
      
    }, undefined, function ( error ) {
      
        console.error( error );
      
    } );

       glloader.load( 'models/robota/scene.gltf', function ( gltf ) {
        gltf.scene.position.y = 1;
        gltf.scene.rotation.y = -Math.PI/2;
        cylinder.add( gltf.scene );
        console.log("ROBOT");
        console.log(gltf);
      
    }, undefined, function ( error ) {
      
        console.error( error );
      
    } );

    /*******************
    * TO DO: Añadir a la escena unos ejes
    *******************/
    scene.add( new THREE.AxesHelper(3) );

}

function update()
{
    /*******************
    * TO DO: Modificar el angulo de giro de cada objeto sobre si mismo
    * y del conjunto pentagonal sobre el objeto importado
    *******************/
    angulo += 0.01;
    pentaFigu.rotation.y = angulo;

    for(let i = 0; i < figuras.length; i++){
        figuras[i].rotation.y = angulo
    }
    try{
        model.rotation.y = angulo;
    }
    catch{
        console.log("El modelo no se ha cargado")
    }

}

function render()
{
    requestAnimationFrame( render );
    update();
    renderer.render( scene, camera );
}