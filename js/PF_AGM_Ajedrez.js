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
let renderer, scene, camera, cameraLady;
let cameraControls, effectController;

// Golobales
let tableObject;
let boardObject;

// Luces direccional y focal.
let direccional;
let focal;
let direccionalHelper;
let focalHelper;

// Array con las piezas de ajedrez
let chessPieces = [];

// Variable que indica si se ha seleccionado una pieza de ajedrez y se está seleccionando una nueva posición.
let selectingNewPosition = false;

// Movimiento de una pieza
let movingPiece = false;

// Selección de pieza para su movimiento
let selectedPiece;

// Otras

const L = 5;

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
    // renderer.autoClear = false;

    /*******************
    * TO DO: Completar el motor de render, el canvas y habilitar
    * el buffer de sombras.
    *******************/
    document.getElementById('container').appendChild( renderer.domElement );
    renderer.antialias = true;
    renderer.shadowMap.enabled = true;    
    
    // Escena
    scene = new THREE.Scene();
    //scene.background = new THREE.Color(0.5,0.5,0.5);
    
    // Camara
    /*******************
     * TO DO: Crear dos camaras una ortografica y otra perspectiva
     * a elegir. La camara perspectiva debe manejarse con OrbitControls
     * mientras que la ortografica debe ser fija
     *******************/
    //Crear camara perspectiva
    const ar = window.innerWidth/window.innerHeight;
    camera= new THREE.PerspectiveCamera(75,ar,1,100);
    camera.position.set( 0.5, 2, 7 );
    cameraControls = new OrbitControls( camera, renderer.domElement );
    cameraControls.target.set(0,1,0);
    if(ar>1)
        camaraOrtografica = new THREE.OrthographicCamera(-L*ar,L*ar,L,-L,-10,100);
    else
        camaraOrtografica = new THREE.OrthographicCamera(-L,L,L/ar,-L/ar,-10,100);
    camaraOrtografica.position.set(0,10,0);
    camaraOrtografica.lookAt(0,0,0);
    camaraOrtografica.up = new THREE.Vector3(0,0,-1);
    
    // Luces
    /*******************
    * TO DO: Añadir luces y habilitar sombras
    * - Una ambiental
    * - Una direccional
    * - Una focal
    *******************/     
    // Luz ambiental
    const ambiental = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambiental);

    //Luz direccional
    direccional = new THREE.DirectionalLight(0xFFFFFF,0.8);
    direccional.position.set(5,6,-5);
    direccional.castShadow = true;
    scene.add(direccional);
    direccionalHelper = new THREE.CameraHelper(direccional.shadow.camera)
    scene.add(direccionalHelper);

    //Añadimos luz focal
    focal = new THREE.SpotLight(0xFFFFFF,0.3);
    focal.position.set(5,10,-5);
    focal.target.position.set(0,0,0);
    focal.angle= Math.PI/7;
    focal.penumbra = 0.3;
    focal.castShadow= true;
    focal.shadow.camera.far = 20;
    focal.shadow.camera.fov = 80;
    scene.add(focal);
    focalHelper = new THREE.CameraHelper(focal.shadow.camera)
    scene.add(focalHelper);

    // Eventos
    /*******************
    * TO DO: Añadir manejadores de eventos
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
    //const texsuelo = new THREE.TextureLoader().load("images/chess/baldosas.jpg");

    // Material del suelo
    const materialSuelo = new THREE.MeshStandardMaterial({map:texsuelo});
    const suelo = new THREE.Mesh( new THREE.PlaneGeometry(15,15, 15,15), materialSuelo );
    const path =".images/"
    const entorno = [ path+"posJAx.jpg", path+"negJAx.jpg",
                      path+"posPAy.jpg", path+"negPAy.jpg",
                      path+"posJAz.jpg", path+"negJAz.jpg"];
    const texesfera = new THREE.CubeTextureLoader().load(entorno);
    const matesfera = new THREE.MeshPhongMaterial({color:'white',
                                                   specular:'gray',
                                                   shininess: 30,
                                                   envMap: texesfera });
    suelo.receiveShadow = true;
    suelo.rotation.x = -Math.PI / 2;
    scene.add(suelo);
    
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
/*    
    //Crear una figura geometrica


    
*/    
    // Cargamos piezas
    loadPieces()
    // loadLady();

    // Crear Habitacion
    const paredes = [];
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"posJAx.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"negJAx.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"posPAy.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"negPAy.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"posJAz.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"negJAz.jpg")}) );
    const habitacion = new THREE.Mesh( new THREE.BoxGeometry(40,40,40),paredes);
    scene.add(habitacion);

    //Añadimos ejes a la escena.
    //scene.add( new THREE.AxesHelper(3) );
}

function loadTable()
{
    // Importar un modelo en gltf
    const glloader = new GLTFLoader();

     glloader.load( 'models/mesa01/scene.gltf', function ( gltf ) {
     gltf.scene.position.y = 0;
     gltf.scene.position.x = 0;
     gltf.scene.position.z = 0;
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
/*
function loadLady(){
    // Importar un modelo en gltf
    const glloader = new GLTFLoader();

    glloader.load( 'models/anime_lady_officer/scene.gltf', function ( gltf ) {
        gltf.scene.position.y = 0;
        //gltf.scene.rotation.y = -Math.PI/2;
        gltf.scene.scale.x = gltf.scene.scale.x * 4;
        gltf.scene.scale.y = gltf.scene.scale.y * 4;
        gltf.scene.scale.z = gltf.scene.scale.z * 4;
        //gltf.scene.position.x = 4;
        gltf.scene.position.z = -4;
        console.log("LADY OFFICER");
        const model = gltf.scene;
        //La chica produce y recibe sombras.
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
*/
function loadTablero(){
   // Importar un modelo en gltf
   const glloader = new GLTFLoader();

   glloader.load( 'models/tablero/scene.gltf', function ( gltf ) {
       gltf.scene.position.y = 0;
       gltf.scene.position.x = 0;
       gltf.scene.position.z = 0;
       gltf.scene.rotation.y = -Math.PI / 2;
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
        
        //Establecemos escala del alfil
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
    let x= event.clientX;
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
function setupGUI()
{
    effectController = {
		mensaje: 'Control iluminación',
        direccionalIntensity: 0.8,
        focalIntensity: 0.3,
        direccionalPosX: 5,
        direccionalPosY: 6,
        direccionalPosZ: -5,
        focalPosX: 5,
        focalPosY: 10,
        focalPosZ: -5,
        direccionalShadow: true,
        focalShadow: true,
        enableDireccinalHelper: true,
        enableFocalHelper: true
    }

    // Creacion interfaz
	const gui = new GUI();

	// Construccion del menu
	const hd = gui.addFolder("Controles de Luz Direccional");
    hd.add(effectController, "direccionalIntensity", 0, 1, 0.1).name("Intensidad").onChange(v => {
        direccional.intensity = v;
    });
    hd.add(effectController, "direccionalPosX", -5, 5, 0.5).name("Iluminación dese Eje X").onChange(v => {
        direccional.position.x = v;
    });
    hd.add(effectController, "direccionalPosY", 0, 10, 0.5).name("Iluminación dese Eje Y").onChange(v => {
        direccional.position.y = v;
    });
    hd.add(effectController, "direccionalPosZ", -5, 5, 0.5).name("Iluminación dese Eje Z").onChange(v => {
        direccional.position.z = v;
    });
    hd.add(effectController, "direccionalShadow").name("Colocar Sombras   ").onChange(v => {
        direccional.castShadow = v;
    });
    hd.add(effectController, "enableDireccinalHelper").name("Activar Guías   ").onChange(v => {
        if(v){
            scene.add(direccionalHelper);
        }
        else{
            scene.remove(direccionalHelper);
        }
    })

    const hf =  gui.addFolder("Controles de Luz Focal");
    hf.add(effectController, "focalIntensity", 0, 1, 0.1).name("Intensidad").onChange(v => {
        focal.intensity = v;
    });
    hf.add(effectController, "focalPosX", -5, 5, 0.5).name("Iluminación dese Eje X").onChange(v => {
        focal.position.x = v;
    });
    hf.add(effectController, "focalPosY", 0, 10, 0.5).name("Iluminación dese Eje Y").onChange(v => {
        focal.position.y = v;
    });
    hf.add(effectController, "focalPosZ", -5, 5, 0.5).name("Iluminación dese Eje Z").onChange(v => {
        focal.position.z = v;
    });
    hf.add(effectController, "focalShadow").name("Colocar Sombras   ").onChange(v => {
        focal.castShadow = v;
    });
    hf.add(effectController, "enableFocalHelper").name("Activar Guías   ").onChange(v => {
        if(v){
            scene.add(focalHelper);
        }
        else{
            scene.remove(focalHelper);
        }
    })
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

    // Ajustar relacion de aspecto en las camaras

    camera.aspect = ar;
    camera.updateProjectionMatrix();

    if(ar>1){
        camaraOrtografica.left = -L*ar;
        camaraOrtografica.right = planta.right =perfil.right = L*ar;
        camaraOrtografica.top = planta.top= perfil.top=  L;
        camaraOrtografica.bottom = planta.bottom = perfil.bottom = -L;    
    }
    else{
        camaraOrtografica.left = -L;
        camaraOrtografica.right = L;
        camaraOrtografica.top = L/ar;
        camaraOrtografica.bottom = -L/ar;       
    }
    camaraOrtografica.updateProjectionMatrix(); 
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
     * - La ortografica debe ser cuadrada y ocupar un octavo de la ventana
     *   en la parte superior izquierda
     *******************/
    renderer.setViewport(0 ,0 ,window.innerWidth,window.innerHeight);
    renderer.render( scene, camera );
    renderer.setViewport(0, 7*window.innerHeight/8, window.innerWidth/8,window.innerHeight/8);
    renderer.render( scene, camaraOrtografica );    

}