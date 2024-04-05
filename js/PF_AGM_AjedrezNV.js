/**
 * PF_AGM_Ajedrez.js
 * 
 * Proyecto final de AGM-Bloque #1.
 * 
 * Objetivo General: Elaborar una página web con contenido 3D
 * para presentar productos, videojuegos en línea, páginas personales, etc.
 * usando tecnología WebGL/Threejs
 * 
 * En mi caso voy a realizar un proyecto donde pueda aplicar los 
 * conocimentos adquiridos durante las clases recibidas en la asignatura
 * 
 * @author: José Páez <jpaez@etsinf.upv.es>, FEB2024
 * Repositorio GIT: jpaez7.github.io
 * 
 */

/*******************
 * Modulos Requeridos
 *******************/
import * as THREE from "../lib/three.module.js";
import {GLTFLoader} from "../lib/GLTFLoader.module.js";
import {OrbitControls} from "../lib/OrbitControls.module.js";
import {TWEEN} from "../lib/tween.module.min.js";
import {GUI} from "../lib/lil-gui.module.min.js";

/*******************
 * Variables y Arreglos
 *******************/

// Estandar
let renderer, scene, camera;

// Globales
let tableObject, boardObject, figuras;
let cameraControls, effectController;
let video, camaraOrtografica, camaraOrtografica2, camaraOrtografica3;

// Luces direccional y focal.
let direccional, focal, focal1;
let direccionalHelper, focalHelper, focal1Helper;

// Array con las piezas de ajedrez
let chessPieces = [];

// Variable que indica si han seleccionado una pieza de ajedrez y se está seleccionando una nueva posición.
let selectingNewPosition = false;

// Movimiento de una pieza
let movingPiece = false;

// Selección de pieza para su movimiento
let selectedPiece;

// Otras

const L = 1.3;
const L2 = 1;
const L3 = 3;

/*******************
 * Acciones
 *******************/
init();
loadScene();
setupGUI();
render();

/*******************
 * Funciones
 *******************/
function init()
{
    // Motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.autoClear = false;

    /*******************
    * Habilitar motor de render, el canvas y el buffer de sombras
    *******************/
    document.getElementById('container').appendChild( renderer.domElement );
    renderer.antialias = true;
    renderer.shadowMap.enabled = true;    
    
    // Escena
    scene = new THREE.Scene();
    
    /*******************
     * Crear tres camaras tres ortograficas y otra perspectiva
     * a elegir. La camara perspectiva se usa con OrbitControls
     * mientras que las ortograficas son fijas
     *******************/
    
    const ar = window.innerWidth/window.innerHeight;

    //Crear y configurar camara Perspectiva
    camera = new THREE.PerspectiveCamera(75,ar,1,100);
    camera.position.set( 0.5, 2, 10 );
    cameraControls = new OrbitControls( camera, renderer.domElement );
    cameraControls.target.set(0,-1,0);

    // Crear y configurar cámaras ortográficas
    if(ar>1) {
        camaraOrtografica = new THREE.OrthographicCamera(-L*ar,L*ar,L,-L,-10,100);
        camaraOrtografica2 = new THREE.OrthographicCamera(-L2*ar,L2*ar,L2,-L2,-10,100);
        camaraOrtografica3 = new THREE.OrthographicCamera(-L3*ar,L3*ar,L3,-L3,-10,100);
    } else {
        camaraOrtografica = new THREE.OrthographicCamera(-L,L,L/ar,-L/ar,-10,100);
        camaraOrtografica2 = new THREE.OrthographicCamera(-L2,L2,L2/ar,-L2/ar,-10,100);
        camaraOrtografica3 = new THREE.OrthographicCamera(-L3,L3,L3/ar,-L3/ar,-10,100);
    }
    // Primera cámara
    camaraOrtografica.position.set(0,10,0);
    camaraOrtografica.lookAt(0,0,0);
    camaraOrtografica.up = new THREE.Vector3(0,0,-1);

    // Segunda cámara
    camaraOrtografica2.position.set(22.5,25,10);
    camaraOrtografica2.lookAt(-4,-1,-3);
    camaraOrtografica2.up = new THREE.Vector3(-10,0,-5);

    // Tercera cámara
    camaraOrtografica3.position.set(5,4,3);
    camaraOrtografica3.lookAt(-6,-3,-6);
    camaraOrtografica3.up = new THREE.Vector3(0,0,-1);

    /*******************
    * Añadir luces y habilitar sombras
    *******************/     
    // Luz ambiental
    const ambiental = new THREE.AmbientLight(0x404040,2.5);
    scene.add(ambiental);

    //Luz direccional
    direccional = new THREE.DirectionalLight(0xFFFFFF,1);
    direccional.position.set(5,6,-5);
    direccional.castShadow = true;
    scene.add(direccional);
    direccionalHelper = new THREE.CameraHelper(direccional.shadow.camera)
    scene.add(direccionalHelper);

    //Añadimos luz focal del tablero
    focal = new THREE.SpotLight(0xFFFFFF,0.3);
    focal.position.set(-5,10,5);
    focal.target.position.set(0,0,0);
    focal.angle= Math.PI/7;
    focal.penumbra = 0.3;
    focal.castShadow= true;
    focal.shadow.camera.far = 20;
    focal.shadow.camera.fov = 80;
    scene.add(focal);
    focalHelper = new THREE.CameraHelper(focal.shadow.camera)
    scene.add(focalHelper);

    //Añadimos luz focal del presentador
    focal1 = new THREE.SpotLight(0xFFFFFF,0.3);
    focal1.position.set(5,10,-5);
    focal1.target.position.set(5,5,10);
    focal1.angle= Math.PI/7;
    focal1.penumbra = 0.3;
    focal1.castShadow= true;
    focal1.shadow.camera.far = 20;
    focal1.shadow.camera.fov = 80;
    scene.add(focal1);
    focal1Helper = new THREE.CameraHelper(focal1.shadow.camera)
    scene.add(focal1Helper);

    /*******************
    * Añadir manejadores de eventos
    * - Cambio de tamaño de la ventana
    * - Doble click sobre un objeto (animate)
    *******************/
    window.addEventListener('resize', updateAspectRatio );
    renderer.domElement.addEventListener('dblclick', animate );    
}

function loadScene()
{
    /*******************
     * TO DO: Cargar Escena
     *******************/

    // Texturas
    const path ="./images/"
    const texSuelo = new THREE.TextureLoader().load(path+"metal_128.jpg");
    const matSuelo = new THREE.MeshStandardMaterial({color:"rgb(150,150,150)",map:texSuelo});
    texSuelo.repeat.set(12,12);
    const suelo = new THREE.Mesh( new THREE.PlaneGeometry(15,15,15,15), matSuelo );
    const entorno = [ path+"posPAx.jpg", path+"negPAx.jpg",
                      path+"posPAy.jpg", path+"negPAy.jpg",
                      path+"posPAz.jpg", path+"negPAz.jpg"];

    const maFigura = new THREE.MeshLambertMaterial({color:'orange',map:texSuelo});
    suelo.receiveShadow = true;
    suelo.rotation.x = -Math.PI / 2;
    scene.add(suelo);
    
    // Crear figuras geometricas con su sombra

    // Cubo
    const geoCubo = new THREE.BoxGeometry( 1, 1, 1 );
    const cubo = new THREE.Mesh(geoCubo, maFigura)
    cubo.position.x = 4;
    cubo.position.y = 0.5;
    cubo.position.z = 1.5;
    cubo.castShadow = cubo.receiveShadow = true;

    // Cylindro
    const geoCylinder = new THREE.CylinderGeometry( 1, 1, 1 );
    const cylinder = new THREE.Mesh(geoCylinder, maFigura)
    cylinder.position.x = 2;
    cylinder.position.y = 0.5;
    cylinder.position.z = 4;
    cylinder.castShadow = cylinder.receiveShadow = true;

    // Esfera
    const geoCono = new THREE.ConeGeometry( 1, 1, 4, 2 );
    const cono = new THREE.Mesh(geoCono, maFigura)
    cono.position.x = 5;
    cono.position.y = 0.5;
    cono.position.z = 4;
    cono.castShadow = cono.receiveShadow = true;

    figuras = [cubo, cylinder, cono];    

    //Añadimos las figuras a la escena
    figuras.forEach(figura => {
        scene.add(figura);
    });

    // Crear objetos
    tableObject = new THREE.Object3D();
    boardObject = new THREE.Object3D();
    
    // Ubicar la mesa
    tableObject.position.x = 0;
    tableObject.position.y = 0;
    tableObject.position.z = 0;
    
    // Cargar objetos
    loadTable();
    loadTablero();
    
    // Relacionar objetos
    tableObject.add(boardObject);
    scene.add(tableObject);
    scene.add(boardObject);
    
    // Reducir la escala del tablero
    boardObject.scale.x = boardObject.scale.x*0.05
    boardObject.scale.y = boardObject.scale.y*0.05
    boardObject.scale.z = boardObject.scale.z*0.05
    
    // Mover tablero
    boardObject.position.y = 3.3

    // Cargamos piezas y otros objetos
    loadPieces()
    loadPersona();

    // Crear Habitacion
    const paredes = [];
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"posPAy.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"posPAx.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"negPAx.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"posPAz.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"negPAy.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"negPAz.jpg")}) );
    const habitacion = new THREE.Mesh( new THREE.BoxGeometry(40,40,40),paredes);
    scene.add(habitacion);

    /******************
     * Asociar una textura de vídeo
     ******************/
    video = document.createElement('video');
    video.src = "videos/ChampionChess.mp4";
    video.load();
    video.muted = true;
    video.play();

    // Video en Pantalla
    const texvideo = new THREE.VideoTexture(video);

    const pantalla = new THREE.Mesh(new THREE.PlaneGeometry(20,6, 4,4), 
                                    new THREE.MeshBasicMaterial({map:texvideo}));
    pantalla.position.set(0,4.5,-5);
    scene.add(pantalla);

}

function loadTable()
{
    // Importar un modelo en gltf
    const glloader = new GLTFLoader();

     glloader.load( 'models/mesa02/scene.gltf', function ( gltf ) {
        gltf.scene.position.y = 0;
        gltf.scene.position.x = 0;
        gltf.scene.position.z = 0;

        // Establecer escala de la mesa
        gltf.scene.scale.x = gltf.scene.scale.x*3.3
        gltf.scene.scale.y = gltf.scene.scale.y*3.3
        gltf.scene.scale.z = gltf.scene.scale.z*3.3
        gltf.scene.name = 'mesa';
        const mesa = gltf.scene;
     
        // Agregar modelo y relacionar
        tableObject.add(mesa);
        gltf.scene.traverse(ob=>{
            if(ob.isObject3D){
                ob.castShadow = true;
                ob.receiveShadow = false;
            }
    })
 
    }, undefined, function ( error ) {
 
     console.error( error );
 
    } );
}

function loadPersona(){
    // Importar un modelo en gltf
    const glloader = new GLTFLoader();

    glloader.load( 'models/Persona/scene.gltf', function ( gltf ) {
        gltf.scene.position.y = 0;
        gltf.scene.scale.x = gltf.scene.scale.x * 0.03;
        gltf.scene.scale.y = gltf.scene.scale.y * 0.03;
        gltf.scene.scale.z = gltf.scene.scale.z * 0.03;
        gltf.scene.position.z = -3;   
        console.log("PERSONA");
        const model = gltf.scene;

        // Modelo produce y recibe sombras.
        gltf.scene.traverse(ob=>{
            if(ob.isObject3D) {
                ob.castShadow = true;
                ob.receiveShadow = true;
            }
        })
        scene.add(model);
        console.log(gltf);
    
    }, undefined, function ( error ) {
    
        console.error( error );
    
    } );
}

function loadTablero(){
   // Importar un modelo en gltf
   const glloader = new GLTFLoader();

   glloader.load( 'models/tablero/scene.gltf', function ( gltf ) {
        gltf.scene.position.y = 0;
        gltf.scene.position.x = 0;
        gltf.scene.position.z = 0;
        gltf.scene.rotation.y = -Math.PI / 2;

        // Establecer escala del tablero
        gltf.scene.scale.x = gltf.scene.scale.x*240
        gltf.scene.scale.y = gltf.scene.scale.y*240
        gltf.scene.scale.z = gltf.scene.scale.z*240
        gltf.scene.name = 'tablero';
        const tablero = gltf.scene;       

        // Agregar modelo y relacionar
        boardObject.add( tablero );
        gltf.scene.traverse(ob=>{
            if(ob.isObject3D){
                ob.castShadow = true;
                ob.receiveShadow = false;
            }
        })
   
   }, undefined, function ( error ) {
   
       console.error( error );
   
   } );
}

function loadPieces(){
    const glloader = new GLTFLoader();

    glloader.load( 'models/rey/scene.gltf', function ( gltf ) {
        gltf.scene.position.y = 1.5;
        gltf.scene.position.x = 3;
        gltf.scene.position.z = 21;

        // Establecer escala del rey
        gltf.scene.scale.x = gltf.scene.scale.x*3
        gltf.scene.scale.y = gltf.scene.scale.y*3
        gltf.scene.scale.z = gltf.scene.scale.z*3
        gltf.scene.name = 'rey';
        const rey = gltf.scene;
       
        // Agregar modelo y relacionar
        boardObject.add( rey );
        chessPieces.push(rey);
        gltf.scene.traverse(ob=>{
        if(ob.isObject3D){
             ob.castShadow = true;
             ob.receiveShadow = false;
        }
        })
   
   }, undefined, function ( error ) {
   
       console.error( error );
   
   } );

   glloader.load( 'models/reyna/scene.gltf', function ( gltf ) {
    gltf.scene.position.y = 1.5;
    gltf.scene.position.x = -3;
    gltf.scene.position.z = 21;
    
    //Establecer escala de la reyna
    gltf.scene.scale.x = gltf.scene.scale.x*3
    gltf.scene.scale.y = gltf.scene.scale.y*3
    gltf.scene.scale.z = gltf.scene.scale.z*3
    gltf.scene.name = 'reyna';
    const reyna = gltf.scene;
    
    // Agregar modelo y relacionar
    boardObject.add( reyna );
    chessPieces.push(reyna);
    gltf.scene.traverse(ob=>{
        if(ob.isObject3D){
             ob.castShadow = true;
             ob.receiveShadow = false;
        }
    })
    }, undefined, function ( error ) {

        console.error( error );

    } );

    glloader.load( 'models/alfil/scene.gltf', function ( gltf ) {
        gltf.scene.position.y = 1.5;
        gltf.scene.position.x = 9;
        gltf.scene.position.z = 21;
        
        //Establecer escala del alfil
        gltf.scene.scale.x = gltf.scene.scale.x*3
        gltf.scene.scale.y = gltf.scene.scale.y*3
        gltf.scene.scale.z = gltf.scene.scale.z*3
        gltf.scene.name = 'alfil1';
        const alfil1 = gltf.scene;
        
        // Agregar modelo y relacionar
        boardObject.add( alfil1 );
        chessPieces.push(alfil1);
        gltf.scene.traverse(ob=>{
            if(ob.isObject3D){
                 ob.castShadow = true;
                 ob.receiveShadow = false;
            }
        })
    }, undefined, function ( error ) {
    
            console.error( error );
    
    } );

    glloader.load( 'models/alfil/scene.gltf', function ( gltf ) {
        gltf.scene.position.y = 1.5;
        gltf.scene.position.x = -9;
        gltf.scene.position.z = 21;

        // Establecer escala del alfil
        gltf.scene.scale.x = gltf.scene.scale.x*3
        gltf.scene.scale.y = gltf.scene.scale.y*3
        gltf.scene.scale.z = gltf.scene.scale.z*3
        gltf.scene.name = 'alfil2';
        const alfil2 = gltf.scene;

        // Agregar modelo y relacionar
        boardObject.add( alfil2 );
        chessPieces.push(alfil2);
        gltf.scene.traverse(ob=>{
            if(ob.isObject3D){
                 ob.castShadow = true;
                 ob.receiveShadow = false;
            }
        })
    }, undefined, function ( error ) {
    
            console.error( error );
    
    } );

   glloader.load( 'models/caballo/scene.gltf', function ( gltf ) {
    
        // El centro del modelo del caballo está desplazado
        // Crear horseObject parra relacionar y facilitar su movimiento
        const horseObject = new THREE.Object3D();
        horseObject.position.x = 15;
        horseObject.position.y = 0;
        horseObject.position.z = 21;
    
        // Desplazar el caballo al centro
        gltf.scene.position.y = 1.2;
        gltf.scene.position.x = -2;
        gltf.scene.position.z = -5.5;
    
        // Establecer escala del caballo
        gltf.scene.scale.x = gltf.scene.scale.x*0.13
        gltf.scene.scale.y = gltf.scene.scale.y*0.13
        gltf.scene.scale.z = gltf.scene.scale.z*0.13
        gltf.scene.name = 'caballo1';
        const caballo1 = gltf.scene;
        horseObject.add(caballo1)
    
        // Agregar modelo y relacionar
        boardObject.add( horseObject );
        chessPieces.push(horseObject);
        gltf.scene.traverse(ob=>{
            if(ob.isObject3D){
                ob.castShadow = true;
                ob.receiveShadow = false;
        }
    })

    }, undefined, function ( error ) {

        console.error( error );

    } );

    glloader.load( 'models/caballo/scene.gltf', function ( gltf ) {
        
        // El centro del modelo del caballo está desplazado
        // Crear horseObject parra relacionar y facilitar su movimiento        
        const horseObject = new THREE.Object3D();
        horseObject.position.x = -15;
        horseObject.position.y = 0;
        horseObject.position.z = 21;

        // Desplazar el caballo al centro 
        gltf.scene.position.y = 1.2;
        gltf.scene.position.x = -2;
        gltf.scene.position.z = -5.5;

        // Establecer escala del caballo
        gltf.scene.scale.x = gltf.scene.scale.x*0.13
        gltf.scene.scale.y = gltf.scene.scale.y*0.13
        gltf.scene.scale.z = gltf.scene.scale.z*0.13
        gltf.scene.name = 'caballo2';
        const caballo2 = gltf.scene;
        horseObject.add(caballo2)
    
        // Agregar modelo y relacionar
        boardObject.add( horseObject );
        chessPieces.push(horseObject);
        gltf.scene.traverse(ob=>{
            if(ob.isObject3D){
                 ob.castShadow = true;
                 ob.receiveShadow = false;
            }
        })
    
        }, undefined, function ( error ) {
    
            console.error( error );
    
        } );

    glloader.load( 'models/torre/scene.gltf', function ( gltf ) {
        gltf.scene.position.y = 1.5;
        gltf.scene.position.x = 21;
        gltf.scene.position.z = 21;

        // Establecer escala de la torre
        gltf.scene.scale.x = gltf.scene.scale.x*3
        gltf.scene.scale.y = gltf.scene.scale.y*3
        gltf.scene.scale.z = gltf.scene.scale.z*3
        gltf.scene.name = 'torre1';
        const torre1 = gltf.scene;

        // Agregar modelo y relacionar
        boardObject.add( torre1 );
        chessPieces.push(torre1);
        gltf.scene.traverse(ob=>{
            if(ob.isObject3D){
                 ob.castShadow = true;
                 ob.receiveShadow = false;
            }
        })

    }, undefined, function ( error ) {
    
        console.error( error );
    
    } );

    glloader.load( 'models/torre/scene.gltf', function ( gltf ) {
        gltf.scene.position.y = 1.5;
        gltf.scene.position.x = -21;
        gltf.scene.position.z = 21;

        // Establecer escala de la torre
        gltf.scene.scale.x = gltf.scene.scale.x*3
        gltf.scene.scale.y = gltf.scene.scale.y*3
        gltf.scene.scale.z = gltf.scene.scale.z*3
        gltf.scene.name = 'torre2';
        const torre2 = gltf.scene;

        // Agregar modelo y relacionar
        boardObject.add( torre2 );
        chessPieces.push(torre2);
        gltf.scene.traverse(ob=>{
            if(ob.isObject3D){
                 ob.castShadow = true;
                 ob.receiveShadow = false;
            }
        })

    }, undefined, function ( error ) {
    
        console.error( error );
    
    } );

    // Cargar piezas de peones

    for(let i = 0; i < 8; i++){
        glloader.load( 'models/peon/scene.gltf', function ( gltf ) {
            gltf.scene.position.y = 1.5;
            gltf.scene.position.x = -21+i*6;
            gltf.scene.position.z = 15;

            // Establecemos escala del peon
            gltf.scene.scale.x = gltf.scene.scale.x*3
            gltf.scene.scale.y = gltf.scene.scale.y*3
            gltf.scene.scale.z = gltf.scene.scale.z*3
            gltf.scene.name = ('pawn'+(i+1));
            let pawn = gltf.scene;

            // Agregar modelo y relacionar
            boardObject.add( pawn );
            chessPieces.push(pawn);
            gltf.scene.traverse(ob=>{
                if(ob.isObject3D){
                     ob.castShadow = true;
                     ob.receiveShadow = false;
                }
            })
        }, undefined, function ( error ) {
        
            console.error( error );
        
        } );
    }
}

/*******************
 * Animación de las piezas
 *******************/
function movePiece(){
    let pawn = scene.getObjectByName('pawn1');
    let oldPositionX = pawn.position.x;
    let oldPositionY = pawn.position.y;
    let oldPositionZ = pawn.position.z;
    new TWEEN.Tween( pawn.position ).
        to( {x:[oldPositionX,oldPositionX+6],y:[oldPositionY,30,oldPositionY],z:[oldPositionZ,oldPositionZ-6]}, 2000 ).
        interpolation( TWEEN.Interpolation.Bezier ).
        easing( TWEEN.Easing.Cubic.InOut ).
        start();
}

function animate(event)
{
    console.log("evento doble click")
    // Capturar y normalizar
    let x = event.clientX;
    let y = event.clientY;
    x = ( x / window.innerWidth ) * 2 - 1;
    y = -( y / window.innerHeight ) * 2 + 1;
    // Construir el rayo y detectar la interseccion
    const rayo = new THREE.Raycaster();
    rayo.setFromCamera(new THREE.Vector2(x,y), camera);
    if(!selectingNewPosition && !movingPiece){
        let intersecciones = rayo.intersectObjects(boardObject.children,true);

        if( intersecciones.length > 0 ){
            // Comprobar intersección con una de las piezas
            const board = scene.getObjectByName('chessBoard')
            for(let i = 0; (i < intersecciones.length) && !selectingNewPosition; i++){
                console.log("Revisando qué pieza se seleccionó entre "+chessPieces.length)
                let object = intersecciones[i].object
                for(let j = 0; j < chessPieces.length && !selectingNewPosition; j++){
                    // Si el objeto interseccionado, se selecciona la pieza.
                    chessPieces[j].traverse(ob=>{
                        if(ob.isObject3D){
                             if(object == ob || object.parent == ob){
                                console.log("Se ha seleccionado una pieza")
                                selectedPiece = chessPieces[j]
                                selectingNewPosition = true
                                console.log("Seleccionada la pieza " + selectedPiece.name)
                             }
                        }
                    })
                }
            }
        }
    }
    else if(selectingNewPosition && !movingPiece){
        let intersecciones = rayo.intersectObjects(boardObject.children,true);
        if( intersecciones.length > 0 ){
            let selectedPosition = intersecciones[0].point;
           
            // Obtener matriz el objeto
            const matrizGlobal = boardObject.matrixWorld;

            // Inviertir matriz
            const matrizInversa = new THREE.Matrix4().getInverse(matrizGlobal);

            // Aplica la matriz
            selectedPosition = selectedPosition.clone().applyMatrix4(matrizInversa);

            // Comprobar que no exceda los límites del tablero
            if(selectedPosition.x > 21) selectedPosition.x = 21
            else if(selectedPosition.x < -21) selectedPosition.x = -21
            if(selectedPosition.z > 21) selectedPosition.z = 21
            else if(selectedPosition.z < -21) selectedPosition.z = -21
            console.log("X: "+selectedPosition.x+"; Z: "+selectedPosition.z);
            moveSelectedPiece(selectedPosition.x, selectedPosition.z)
        }
    }
}

// Animación de la pieza seleccionada
function moveSelectedPiece(newPositionX, newPositionZ){
    movingPiece = true;
    let oldPositionX = selectedPiece.position.x;
    let oldPositionY = selectedPiece.position.y;
    let oldPositionZ = selectedPiece.position.z;
    new TWEEN.Tween( selectedPiece.position ).
        to( {x:[oldPositionX,newPositionX],y:[oldPositionY,30,oldPositionY],z:[oldPositionZ,newPositionZ]}, 2000 ).
        interpolation( TWEEN.Interpolation.Bezier ).
        easing( TWEEN.Easing.Cubic.InOut ).
        // Validar fin de animación e iniciar otra
        onComplete(()=>{
            selectingNewPosition = false;
            movingPiece = false;
        }).
        start();
}

// Interfaz de usuario
function setupGUI()
{
    // Definición de los controles
    effectController = {
		mensaje: 'Proyecto Bloque #1',
        direccionalIntensity: 0.5,
        direccionalPosX: 2,
        direccionalPosY: 5,
        direccionalPosZ: 0,
        focalIntensity: 0.5,        
        focalPosX: 2,
        focalPosY: 5,
        focalPosZ: 0,
        focal1Intensity: 0.5,        
        focal1PosX: 2,
        focal1PosY: 5,
        focal1PosZ: 0,
        moverFiguras: 0.5,
        alambric: false,        
        direccionalShadow: true,
        focalShadow: true,
        enableDireccinalHelper: true,
        enableFocalHelper: true,
        enableFocal1Helper: true,        
        play: function(){video.play();},
        pause: function(){video.pause();},
        colorcubo: "rgb(150,150,150)",
        cubeAnimation: animaCubo,
        cylinderAnimation: animaCylinder, 
        mute: true
    }

    // Crear interfaz
	const gui = new GUI();

	// Construir Menu General
    const h = gui.addFolder("Menú General");
    h.add(effectController, "mensaje").name("Aplicativo");
    const ha = gui.addFolder("Figuras Geométricas");
    ha.close()
    const controlMover = ha.add(effectController, "moverFiguras", 0.5, 4).name("Mover Figuras");
        controlMover.onChange(function (value) {
            figuras.forEach(figura => {
                figura.position.y = value;
            });
        });
    ha.add(effectController, "alambric").name("Activar Alambres en Figuras").onChange(function (value) {
        figuras.forEach(figura => {
            figura.material.wireframe = value;
        });
    });
    ha.add(effectController, "cubeAnimation").name("Girar Cubo");
    ha.add(effectController, "cylinderAnimation").name("Agrandar Cilindro");
    ha.addColor(effectController, "colorcubo")
        .name("Paleta de Colores Figuras  ")
        .onChange(c=>{figuras[0].material.setValues({color:c})});
    const hb = gui.addFolder("Luz Direccional");
    hb.close()
    hb.add(effectController, "direccionalIntensity", 0, 1, 0.1).name("Intensidad").onChange(v => {
        direccional.intensity = v;
    });
    hb.add(effectController, "direccionalPosX", -5, 5, 0.5).name("Iluminación desde Eje X      ").onChange(v => {
        direccional.position.x = v;
    });
    hb.add(effectController, "direccionalPosY", 0, 10, 0.5).name("Iluminación desde Eje Y      ").onChange(v => {
        direccional.position.y = v;
    });
    hb.add(effectController, "direccionalPosZ", -5, 5, 0.5).name("Iluminación desde Eje Z      ").onChange(v => {
        direccional.position.z = v;
    });
    hb.add(effectController, "direccionalShadow").name("Desactivar Sombras   ").onChange(v => {
        direccional.castShadow = v;
    });
    hb.add(effectController, "enableDireccinalHelper").name("Desactivar Ejes   ").onChange(v => {
        if(v){
            scene.add(direccionalHelper);
        }
        else{
            scene.remove(direccionalHelper);
        }
    })

    const hc =  gui.addFolder("Luz Focal del Tablero");
    hc.close()
    hc.add(effectController, "focalIntensity", 0, 1, 0.1).name("Intensidad").onChange(v => {
        focal.intensity = v;
    });
    hc.add(effectController, "focalPosX", -5, 5, 0.5).name("Iluminación desde Eje X      ").onChange(v => {
        focal.position.x = v;
    });
    hc.add(effectController, "focalPosY", 0, 10, 0.5).name("Iluminación desde Eje Y      ").onChange(v => {
        focal.position.y = v;
    });
    hc.add(effectController, "focalPosZ", -5, 5, 0.5).name("Iluminación desde Eje Z      ").onChange(v => {
        focal.position.z = v;
    });
    hc.add(effectController, "focalShadow").name("Desactivar Sombras   ").onChange(v => {
        focal.castShadow = v;
    });
    hc.add(effectController, "enableFocalHelper").name("Desactivar Ejes   ").onChange(v => {
        if(v){
            scene.add(focalHelper);
        }
        else{
            scene.remove(focalHelper);
        }
    })

    const hd =  gui.addFolder("Luz Focal del Presentador");
    hd.close()
    hd.add(effectController, "focalIntensity", 0, 1, 0.1).name("Intensidad").onChange(v => {
        focal1.intensity = v;
    });
    hd.add(effectController, "focalPosX", -5, 5, 0.5).name("Iluminación desde Eje X      ").onChange(v => {
        focal1.position.x = v;
    });
    hd.add(effectController, "focalPosY", 0, 10, 0.5).name("Iluminación desde Eje Y      ").onChange(v => {
        focal1.position.y = v;
    });
    hd.add(effectController, "focalPosZ", -5, 5, 0.5).name("Iluminación desde Eje Z      ").onChange(v => {
        focal1.position.z = v;
    });
    hd.add(effectController, "focalShadow").name("Desactivar Sombras   ").onChange(v => {
        focal1.castShadow = v;
    });
    hd.add(effectController, "enableFocal1Helper").name("Desactivar Ejes   ").onChange(v => {
        if(v){
            scene.add(focal1Helper);
        }
        else{
            scene.remove(focal1Helper);
        }
    })

    const hv = gui.addFolder("Controles de Video")
    hv.add(effectController,"play");
    hv.add(effectController,"pause");
    hv.add(effectController,"mute").onChange(v=>{video.muted = v});

}

//Funciones de Animación para las figuras

function animaCubo(){
    new TWEEN.Tween( figuras[0].rotation ).
        to( {x:[0,0],y:[0,Math.PI*2],z:[0,0]}, 2000 ).
        interpolation( TWEEN.Interpolation.Bezier ).
        easing( TWEEN.Easing.Linear.None ).
        start();
}

function animaCylinder(){
    let originScaleX = figuras[1].scale.x
    let originScaleY = figuras[1].scale.y
    let originScaleZ = figuras[1].scale.z
    new TWEEN.Tween( figuras[1].scale ).
        to( {x:[originScaleX ,originScaleX * 4, originScaleX],y:[originScaleY ,originScaleY * 4, originScaleY],z:[originScaleZ ,originScaleZ * 4, originScaleZ]}, 2000 ).
        interpolation( TWEEN.Interpolation.Bezier ).
        easing( TWEEN.Easing.Bounce.InOut ).
        start();
}

function updateAspectRatio()
{
    // Renueva la relación de aspecto de la camara
    /*******************
    * TO DO: Actualizar relacion de aspecto de ambas camaras
    *******************/
    const ar = window.innerWidth/window.innerHeight;

    // Dimensionar canvas
    renderer.setSize(window.innerWidth,window.innerHeight);

    // Ajustar relacion de aspecto en las diferentes camaras

    camera.aspect = ar;
    camera.updateProjectionMatrix();

    if(ar>1){
        camaraOrtografica.left = -L*ar;
        camaraOrtografica.right = planta.right =perfil.right = L*ar;
        camaraOrtografica.top = planta.top= perfil.top=  L;
        camaraOrtografica.bottom = planta.bottom = perfil.bottom = -L;    

        camaraOrtografica2.left = -L2*ar;
        camaraOrtografica2.right = planta.right =perfil.right = L2*ar;
        camaraOrtografica2.top = planta.top= perfil.top=  L2;
        camaraOrtografica2.bottom = planta.bottom = perfil.bottom = -L2;    

        camaraOrtografica3.left = -L3*ar;
        camaraOrtografica3.right = planta.right =perfil.right = L3*ar;
        camaraOrtografica3.top = planta.top= perfil.top=  L3;
        camaraOrtografica3.bottom = planta.bottom = perfil.bottom = -L3;
    }
    else{
        camaraOrtografica.left = -L;
        camaraOrtografica.right = L;
        camaraOrtografica.top = L/ar;
        camaraOrtografica.bottom = -L/ar;       

        camaraOrtografica2.left = -L2;
        camaraOrtografica2.right = L2;
        camaraOrtografica2.top = L2/ar;
        camaraOrtografica2.bottom = -L2/ar; 

        camaraOrtografica3.left = -L3;
        camaraOrtografica3.right = L3;
        camaraOrtografica3.top = L3/ar;
        camaraOrtografica3.bottom = -L3/ar; 
    }
    camaraOrtografica.updateProjectionMatrix();
    camaraOrtografica2.updateProjectionMatrix();
    camaraOrtografica3.updateProjectionMatrix();
}

function update()
{
    /*******************
    * TO DO: Actualizar tween
    *******************/
    TWEEN.update();
}

function render()
{
    requestAnimationFrame(render);
    update();
    /*******************
     * TO DO: Renderizar ambas vistas
     * - La perspectiva debe ocupar toda la ventana
     * - Las ortograficas son rectangulares y ocupan un octavo de la ventana
     *   en tres lugares diferentes de la parte izquierda del monitor
     *******************/
    renderer.setViewport(0 ,0 ,window.innerWidth,window.innerHeight);
    renderer.render( scene, camera );
    renderer.setViewport(3, 6*window.innerHeight/8, window.innerWidth/6,window.innerHeight/6);
    renderer.render( scene, camaraOrtografica );
    renderer.setViewport(3, 4*window.innerHeight/8, window.innerWidth/6,window.innerHeight/6);
    renderer.render( scene, camaraOrtografica2 );
    renderer.setViewport(3, 2*window.innerHeight/8, window.innerWidth/6,window.innerHeight/6);
    renderer.render( scene, camaraOrtografica3 );
}