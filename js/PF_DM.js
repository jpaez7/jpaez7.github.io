// Modulos necesarios
import * as THREE from "../lib/three.module.js";
import {GLTFLoader} from "../lib/GLTFLoader.module.js";
import {OrbitControls} from "../lib/OrbitControls.module.js";
import {TWEEN} from "../lib/tween.module.min.js";
import {GUI} from "../lib/lil-gui.module.min.js";

// Variables estandar
let renderer, scene, camera, cameraLady;
let cameraControls, effectController;
// Otras globales
let tableObject;
let boardObject;
//Array con todas las piezas de ajedrez
let chessPieces = [];
// Variable que indica si se ha seleccionado una pieza de ajedrez y se está seleccionando una nueva posición.
let selectingNewPosition = false;
// Variable que indica si se está moviendo en ese momento una pieza de ajedrez.
let movingPiece = false;
// Pieza seleccionada para mover.
let selectedPiece;
// Variables para las luces direccional y focal.
let direccional;
let focal;
let direccionalHelper;
let focalHelper;

const L = 5;
// Acciones
init();
loadScene();
setupGUI();
render();

function init()
{
    // Instanciar el motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth,window.innerHeight);
    document.getElementById('container').appendChild( renderer.domElement );
    renderer.antialias = true;
    renderer.shadowMap.enabled = true;
    //renderer.autoClear = false;
    // Instanciar el nodo raiz de la escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0.5,0.5,0.5);

    // Instanciar la camara principal
    const ar = window.innerWidth/window.innerHeight;
    camera = new THREE.PerspectiveCamera( 75, ar, 0.1,100);
    camera.position.set( 0.5, 4, 7 );
    //Controles de camara principal
    cameraControls = new OrbitControls( camera, renderer.domElement );
    cameraControls.target.set(0,1,0);
    camera.lookAt( new THREE.Vector3(0,1,0) );
    //Crear segunda camara a la vista del personaje
    /*if(ar>1)
     cameraLady = new THREE.OrthographicCamera(-L*ar,L*ar,L,-L,-10,100);
    else
     cameraLady = new THREE.OrthographicCamera(-L,L,L/ar,-L/ar,-10,100);
    cameraLady.position.set(0, 1, -4);
    cameraLady.lookAt( new THREE.Vector3(0,1,0) );
    cameraLady.up = new THREE.Vector3(0,1,0);*/
    // Eventos
    renderer.domElement.addEventListener('dblclick', animate );
    //window.addEventListener('resize', updateAspectRatio );
    //Añadimos luz ambiental
    const ambiental = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambiental);
    //Añadimos luz direccional
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
}

function loadScene()
{
    //Creamos las texturas
    const texsuelo = new THREE.TextureLoader().load("images/chess/baldosas.jpg");
    //Creamos el material del suelo
    const materialSuelo = new THREE.MeshStandardMaterial({map:texsuelo});
    const suelo = new THREE.Mesh( new THREE.PlaneGeometry(15,15, 15,15), materialSuelo );
    const path ="images/chess/Yokohama/"
    const entorno = [ path+"posx.jpg", path+"negx.jpg",
                      path+"posy.jpg", path+"negy.jpg",
                      path+"posz.jpg", path+"negz.jpg"];
    const texesfera = new THREE.CubeTextureLoader().load(entorno);
    const matesfera = new THREE.MeshPhongMaterial({color:'white',
                                                   specular:'gray',
                                                   shininess: 30,
                                                   envMap: texesfera });
    suelo.receiveShadow = true;
    suelo.rotation.x = -Math.PI / 2;
    scene.add(suelo);
    //Creamos los objetos del tablero de ajedrez y la mesa.
    tableObject = new THREE.Object3D();
    boardObject = new THREE.Object3D();
    //Centramos la mesa
    tableObject.position.x = 0;
    tableObject.position.y = 0;
    tableObject.position.z = 0;
    //Cargamos la mesa y el tablero
    loadTable();
    loadChessboard();
    //Hacemos al tablero hijo de la mesa.
    tableObject.add(boardObject);
    scene.add(tableObject);
    scene.add(boardObject);
    //Reducimos la escala del tablero
    boardObject.scale.x = boardObject.scale.x*0.05
    boardObject.scale.y = boardObject.scale.y*0.05
    boardObject.scale.z = boardObject.scale.z*0.05
    //Movemos el tablero encima de la mesa.
    boardObject.position.y = 3.3
    //Creamos una esfera
    const geoEsfera = new THREE.SphereGeometry( 1, 20,20 );
    const esfera = new THREE.Mesh(geoEsfera, matesfera)
    esfera.position.x = -1.9;
    esfera.position.y = 3.5;
    esfera.scale.x = esfera.scale.x/3;
    esfera.scale.y = esfera.scale.y/3;
    esfera.scale.z = esfera.scale.z/3;
    //Activamos generación de sombras y recepción de sombras de la esfera
    esfera.traverse(ob=>{
        if(ob.isObject3D){
             ob.castShadow = true;
             ob.receiveShadow = true;
        }
    })
    //Añadimos la esfera como hijo de la mesa.
    tableObject.add(esfera);
    //Cargamos las piezas del tablero
    loadPieces()
    loadLady();
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
    /*habitacion.position.x = 0;
    habitacion.position.y = 10;
    habitacion.position.z = 0;*/
    scene.add(habitacion);
    //Añadimos ejes a la escena.
    //scene.add( new THREE.AxesHelper(3) );
}

function loadTable()
{
    // Importar un modelo en gltf
    const glloader = new GLTFLoader();

     glloader.load( 'models/table/scene.gltf', function ( gltf ) {
     gltf.scene.position.y = 0;
     gltf.scene.position.x = 0;
     gltf.scene.position.z = 0;
     gltf.scene.name = 'table';
     const table = gltf.scene;
     //Agregamos el modelo de la mesa al objeto mesa.
     tableObject.add(table);
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

function loadChessboard(){
    // Importar un modelo en gltf
   const glloader = new GLTFLoader();

   glloader.load( 'models/chess_board/scene.gltf', function ( gltf ) {
       gltf.scene.position.y = 0;
       gltf.scene.position.x = 0;
       gltf.scene.position.z = 0;
       gltf.scene.rotation.y = -Math.PI / 2;
       gltf.scene.name = 'chessBoard';
       const board = gltf.scene;
       //Agregamos el modelo como hijo del objeto tablero.
       boardObject.add( board );
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
/***
 * Límites del tablero:
 * x=[-21,21]
 * z=[-21,21]
 */
function loadPieces(){
    const glloader = new GLTFLoader();

   glloader.load( 'models/king/scene.gltf', function ( gltf ) {
       gltf.scene.position.y = 1.5;
       gltf.scene.position.x = 3;
       gltf.scene.position.z = 21;
       //Establecemos la escala del rey
       gltf.scene.scale.x = gltf.scene.scale.x*3
       gltf.scene.scale.y = gltf.scene.scale.y*3
       gltf.scene.scale.z = gltf.scene.scale.z*3
       gltf.scene.name = 'king';
       const king = gltf.scene;
       //Agregamos el modelo como hijo del objeto tablero.
       //boardObject.add( king );
       boardObject.add( king );
       chessPieces.push(king);
       gltf.scene.traverse(ob=>{
        if(ob.isObject3D){
             ob.castShadow = true;
             ob.receiveShadow = false;
        }
        })
   
   }, undefined, function ( error ) {
   
       console.error( error );
   
   } );

   glloader.load( 'models/queen/scene.gltf', function ( gltf ) {
    gltf.scene.position.y = 1.5;
    gltf.scene.position.x = -3;
    gltf.scene.position.z = 21;
    //Establecemos la escala del rey
    gltf.scene.scale.x = gltf.scene.scale.x*3
    gltf.scene.scale.y = gltf.scene.scale.y*3
    gltf.scene.scale.z = gltf.scene.scale.z*3
    gltf.scene.name = 'queen';
    const queen = gltf.scene;
    //Agregamos el modelo como hijo del objeto tablero.
    boardObject.add( queen );
    chessPieces.push(queen);
    gltf.scene.traverse(ob=>{
        if(ob.isObject3D){
             ob.castShadow = true;
             ob.receiveShadow = false;
        }
    })
    }, undefined, function ( error ) {

        console.error( error );

    } );

    glloader.load( 'models/bishop/scene.gltf', function ( gltf ) {
        gltf.scene.position.y = 1.5;
        gltf.scene.position.x = 9;
        gltf.scene.position.z = 21;
        //Establecemos la escala del rey
        gltf.scene.scale.x = gltf.scene.scale.x*3
        gltf.scene.scale.y = gltf.scene.scale.y*3
        gltf.scene.scale.z = gltf.scene.scale.z*3
        gltf.scene.name = 'bishop1';
        const bishop1 = gltf.scene;
        //Agregamos el modelo como hijo del objeto tablero.
        //boardObject.add( king );
        boardObject.add( bishop1 );
        chessPieces.push(bishop1);
        gltf.scene.traverse(ob=>{
            if(ob.isObject3D){
                 ob.castShadow = true;
                 ob.receiveShadow = false;
            }
        })
    }, undefined, function ( error ) {
    
            console.error( error );
    
    } );

    glloader.load( 'models/bishop/scene.gltf', function ( gltf ) {
        gltf.scene.position.y = 1.5;
        gltf.scene.position.x = -9;
        gltf.scene.position.z = 21;
        //Establecemos la escala del rey
        gltf.scene.scale.x = gltf.scene.scale.x*3
        gltf.scene.scale.y = gltf.scene.scale.y*3
        gltf.scene.scale.z = gltf.scene.scale.z*3
        gltf.scene.name = 'bishop2';
        const bishop2 = gltf.scene;
        //Agregamos el modelo como hijo del objeto tablero.
        //boardObject.add( king );
        boardObject.add( bishop2 );
        chessPieces.push(bishop2);
        gltf.scene.traverse(ob=>{
            if(ob.isObject3D){
                 ob.castShadow = true;
                 ob.receiveShadow = false;
            }
        })
    }, undefined, function ( error ) {
    
            console.error( error );
    
    } );

   glloader.load( 'models/horse/scene.gltf', function ( gltf ) {
    //Como el centro del modelo del caballo está un poco desplazado, creamos un horseObject que será el padre del caballo para facilitar el manejo de la posición del caballo
    const horseObject = new THREE.Object3D();
    horseObject.position.x = 15;
    horseObject.position.y = 0;
    horseObject.position.z = 21;
    //Desplazamos el modelo del caballo al centro (recordemos que su centro esta desplazado), para que al añadirlo como hijo al horseObject, el centro del horseObject esté en el sitio donde debería encontrarse el centro del modelo del caballo
    gltf.scene.position.y = 1.2;
    gltf.scene.position.x = -2;
    gltf.scene.position.z = -5.5;
    //Establecemos la escala del caballo
    gltf.scene.scale.x = gltf.scene.scale.x*0.13
    gltf.scene.scale.y = gltf.scene.scale.y*0.13
    gltf.scene.scale.z = gltf.scene.scale.z*0.13
    gltf.scene.name = 'horse1';
    const horse1 = gltf.scene;
    horseObject.add(horse1)
    //Agregamos el modelo como hijo del objeto tablero.
    //scene.add(horseObject);
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

    glloader.load( 'models/horse/scene.gltf', function ( gltf ) {
        //Como el centro del modelo del caballo está un poco desplazado, creamos un horseObject que será el padre del caballo para facilitar el manejo de la posición del caballo
        const horseObject = new THREE.Object3D();
        horseObject.position.x = -15;
        horseObject.position.y = 0;
        horseObject.position.z = 21;
        //Desplazamos el modelo del caballo al centro (recordemos que su centro esta desplazado), para que al añadirlo como hijo al horseObject, el centro del horseObject esté en el sitio donde debería encontrarse el centro del modelo del caballo
        gltf.scene.position.y = 1.2;
        gltf.scene.position.x = -2;
        gltf.scene.position.z = -5.5;
        //Establecemos la escala del caballo
        gltf.scene.scale.x = gltf.scene.scale.x*0.13
        gltf.scene.scale.y = gltf.scene.scale.y*0.13
        gltf.scene.scale.z = gltf.scene.scale.z*0.13
        gltf.scene.name = 'horse2';
        const horse2 = gltf.scene;
        horseObject.add(horse2)
        //Agregamos el modelo como hijo del objeto tablero.
        //scene.add(horseObject);
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

    glloader.load( 'models/rook/scene.gltf', function ( gltf ) {
        gltf.scene.position.y = 1.5;
        gltf.scene.position.x = 21;
        gltf.scene.position.z = 21;
        //Establecemos la escala del rey
        gltf.scene.scale.x = gltf.scene.scale.x*3
        gltf.scene.scale.y = gltf.scene.scale.y*3
        gltf.scene.scale.z = gltf.scene.scale.z*3
        gltf.scene.name = 'rook1';
        const rook1 = gltf.scene;
        //Agregamos el modelo como hijo del objeto tablero.
        //boardObject.add( king );
        boardObject.add( rook1 );
        chessPieces.push(rook1);
        gltf.scene.traverse(ob=>{
            if(ob.isObject3D){
                 ob.castShadow = true;
                 ob.receiveShadow = false;
            }
        })

    }, undefined, function ( error ) {
    
        console.error( error );
    
    } );

    glloader.load( 'models/rook/scene.gltf', function ( gltf ) {
        gltf.scene.position.y = 1.5;
        gltf.scene.position.x = -21;
        gltf.scene.position.z = 21;
        //Establecemos la escala del rey
        gltf.scene.scale.x = gltf.scene.scale.x*3
        gltf.scene.scale.y = gltf.scene.scale.y*3
        gltf.scene.scale.z = gltf.scene.scale.z*3
        gltf.scene.name = 'rook2';
        const rook2 = gltf.scene;
        //Agregamos el modelo como hijo del objeto tablero.
        //boardObject.add( king );
        boardObject.add( rook2 );
        chessPieces.push(rook2);
        gltf.scene.traverse(ob=>{
            if(ob.isObject3D){
                 ob.castShadow = true;
                 ob.receiveShadow = false;
            }
        })

    }, undefined, function ( error ) {
    
        console.error( error );
    
    } );

    //Cargamos los peones

    for(let i = 0; i < 8; i++){
        glloader.load( 'models/pawn/scene.gltf', function ( gltf ) {
            gltf.scene.position.y = 1.5;
            gltf.scene.position.x = -21+i*6;
            gltf.scene.position.z = 15;
            //Establecemos la escala del rey
            gltf.scene.scale.x = gltf.scene.scale.x*3
            gltf.scene.scale.y = gltf.scene.scale.y*3
            gltf.scene.scale.z = gltf.scene.scale.z*3
            gltf.scene.name = ('pawn'+(i+1));
            let pawn = gltf.scene;
            //Agregamos el modelo como hijo del objeto tablero.
            //boardObject.add( king );
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
//Función que inicia la animación de la pieza seleccionada (versión de prueba)
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
            //comprobamos que hay una intersección con una de las piezas, es decir, con uno de los elementos del array de piezas.
            const board = scene.getObjectByName('chessBoard')
            for(let i = 0; (i < intersecciones.length) && !selectingNewPosition; i++){
                console.log("Revisando qué pieza se seleccionó entre "+chessPieces.length)
                let object = intersecciones[i].object
                for(let j = 0; j < chessPieces.length && !selectingNewPosition; j++){
                    //Si el objeto interseccionado es una pieza o hijo de una pieza, se selecciona la pieza.
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
            //Pasamos el punto seleccionado del Sistema de referencia global al sistema de referencia local del boardObject
            // Obtén la matriz de transformación global del objeto
            const matrizGlobal = boardObject.matrixWorld;

            // Invierte la matriz de transformación global
            const matrizInversa = new THREE.Matrix4().getInverse(matrizGlobal);

            // Aplica la matriz de transformación inversa al punto global
            selectedPosition = selectedPosition.clone().applyMatrix4(matrizInversa);

            //Comprobamos que no exceda los límites del tablero (las piezas no pueden colocarse en los bordes del tablero) y corregimos la posición
            if(selectedPosition.x > 21) selectedPosition.x = 21
            else if(selectedPosition.x < -21) selectedPosition.x = -21
            if(selectedPosition.z > 21) selectedPosition.z = 21
            else if(selectedPosition.z < -21) selectedPosition.z = -21
            console.log("X: "+selectedPosition.x+"; Z: "+selectedPosition.z);
            moveSelectedPiece(selectedPosition.x, selectedPosition.z)
        }
    }
}

//Función que inicia la animación de la pieza seleccionado
function moveSelectedPiece(newPositionX, newPositionZ){
    movingPiece = true;
    let oldPositionX = selectedPiece.position.x;
    let oldPositionY = selectedPiece.position.y;
    let oldPositionZ = selectedPiece.position.z;
    new TWEEN.Tween( selectedPiece.position ).
        to( {x:[oldPositionX,newPositionX],y:[oldPositionY,30,oldPositionY],z:[oldPositionZ,newPositionZ]}, 2000 ).
        interpolation( TWEEN.Interpolation.Bezier ).
        easing( TWEEN.Easing.Cubic.InOut ).
        //Cuando finalice la animación se indicará que ya no se está moviendo una pieza y se habilitará la selección de una nueva pieza para mover.
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
	const hd = gui.addFolder("Control luz direccional");
    hd.add(effectController, "direccionalIntensity", 0, 1, 0.1).name("Intensidad de la luz direccional").onChange(v => {
        direccional.intensity = v;
    });
    hd.add(effectController, "direccionalPosX", -5, 5, 0.5).name("Posición luz direccional eje X").onChange(v => {
        direccional.position.x = v;
    });
    hd.add(effectController, "direccionalPosY", 0, 10, 0.5).name("Posición luz direccional eje Y").onChange(v => {
        direccional.position.y = v;
    });
    hd.add(effectController, "direccionalPosZ", -5, 5, 0.5).name("Posición luz direccional eje Z").onChange(v => {
        direccional.position.z = v;
    });
    hd.add(effectController, "direccionalShadow").name("Generar sombras con luz direccional").onChange(v => {
        direccional.castShadow = v;
    });
    hd.add(effectController, "enableDireccinalHelper").name("Mostrar helper de luz direccional").onChange(v => {
        if(v){
            scene.add(direccionalHelper);
        }
        else{
            scene.remove(direccionalHelper);
        }
    })

    const hf =  gui.addFolder("Control luz focal");
    hf.add(effectController, "focalIntensity", 0, 1, 0.1).name("Intensidad de la luz focal").onChange(v => {
        focal.intensity = v;
    });
    hf.add(effectController, "focalPosX", -5, 5, 0.5).name("Posición luz focal eje X").onChange(v => {
        focal.position.x = v;
    });
    hf.add(effectController, "focalPosY", 0, 10, 0.5).name("Posición luz focal eje Y").onChange(v => {
        focal.position.y = v;
    });
    hf.add(effectController, "focalPosZ", -5, 5, 0.5).name("Posición luz focal eje Z").onChange(v => {
        focal.position.z = v;
    });
    hf.add(effectController, "focalShadow").name("Generar sombras con luz focal").onChange(v => {
        focal.castShadow = v;
    });
    hf.add(effectController, "enableFocalHelper").name("Mostrar helper de luz focal").onChange(v => {
        if(v){
            scene.add(focalHelper);
        }
        else{
            scene.remove(focalHelper);
        }
    })
}

function update()
{
    TWEEN.update();
}

function updateAspectRatio()
{
    // Renueva la relación de aspecto de la camara
    /*******************
    * TO DO: Actualizar relacion de aspecto de ambas camaras
    *******************/
    const ar = window.innerWidth/window.innerHeight;

    // Dimensiones del canvas
    renderer.setSize(window.innerWidth,window.innerHeight);

    // Reajuste de la relacion de aspecto de las camaras

    camera.aspect = ar;
    camera.updateProjectionMatrix();

    if(ar>1){
        cameraLady.left = -L*ar;
        cameraLady.right = L*ar;
        cameraLady.top =  L;
        cameraLady.bottom = -L;    
    }
    else{
        cameraLady.left = -L;
        cameraLady.right = L;
        cameraLady.top = L/ar;
        cameraLady.bottom = -L/ar;       
    }
    cameraLady.updateProjectionMatrix();  
}

function render()
{
    requestAnimationFrame(render);
    update();
    renderer.render(scene,camera);
    // Limpieza del canvas una vez por frame
    //renderer.clear();
    //Renderizamos las vistas
    /*renderer.setViewport(0 ,0 ,window.innerWidth,window.innerHeight);
    renderer.render( scene, camera );
    renderer.setViewport(0, 7*window.innerHeight/8, window.innerWidth/8,window.innerHeight/8);
    renderer.render( scene, cameraLady );*/
}