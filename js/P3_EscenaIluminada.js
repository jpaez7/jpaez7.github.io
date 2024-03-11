/**
 * EscenaIluminada.js
 * 
 * Practica AGM #3. Escena basica con interfaz, animacion e iluminacion
 * Se trata de añadir luces a la escena y diferentes materiales
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

// Variables de consenso
let renderer, scene, camera;

// Otras globales
/*******************
 * TO DO: Variables globales de la aplicacion
 *******************/
let pentaForm, figuras, material, modelo, video;
let cameraControls, effectController;
let maCubo, maEsfera, maSuelo, matcylinder;
let esferaCubo,cubo,esfera,suelo;

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
    camera.lookAt( new THREE.Vector3(0,1,0) );  // Linea no en S3
    cameraControls = new OrbitControls( camera, renderer.domElement );
    cameraControls.target.set(0,1,0);
    camera.lookAt(0,1,0);
    
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

    // OJO
    scene.add(new THREE.CameraHelper(direccional.shadow.camera));
    
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

    // Eventos
    window.addEventListener('resize', updateAspectRatio );
    renderer.domElement.addEventListener('dblclick', animate );
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
    const texcubo = new THREE.TextureLoader().load(path+"metal_128.jpg");
    const texsuelo = new THREE.TextureLoader().load(path+"sports.jpg");
    texsuelo.repeat.set(4,3);
    texsuelo.wrapS= texsuelo.wrapT = THREE.MirroredRepeatWrapping;
    const entorno = [ path+"posPFx.jpg", path+"negPFx.jpg",
                      path+"posCFy.jpg", path+"negCFy.jpg",
                      path+"posPFz.jpg", path+"negPFz.jpg"];
    const texesfera = new THREE.CubeTextureLoader().load(entorno);

    // Materiales
    /*******************
     * TO DO: Crear materiales y aplicar texturas
     * - Uno basado en Lambert
     * - Uno basado en Phong
     * - Uno basado en Basic  OJO con estas variables
     *******************/
    maCubo = new THREE.MeshLambertMaterial({color:'yellow',map:texfigure});
    maEsfera = new THREE.MeshPhongMaterial({color:'white',
                                                   specular:'gray',
                                                   shininess: 30,
                                                   envMap: texesfera });
    maSuelo = new THREE.MeshStandardMaterial({color:"rgb(150,150,150)",map:texsuelo});
    matcylinder = new THREE.MeshBasicMaterial({color:"rgb(150,150,150)",map:texsuelo});

    /*******************
    * TO DO: Misma escena que en la practica anterior
    * cambiando los materiales y activando las sombras
    *******************/
    // *** Selección de presentación en color del Mesh Básico
    
    material = new THREE.MeshBasicMaterial( { color: 'white', wireframe: true } );
    //material = new THREE.MeshNormalMaterial( {wireframe:false} );

    const geoCubo = new THREE.BoxGeometry( 2, 2, 2 );
    const geoEsfera = new THREE.SphereGeometry( 1, 20 ,20 );
    const geoDodeca = new THREE.DodecahedronGeometry( 1, 1, 1);
    const geoCylinder = new THREE.CylinderGeometry( 1, 1, 2);
    const geoIcosa = new THREE.IcosahedronGeometry(1, 1, 2);
    
    const cubo = new THREE.Mesh( geoCubo, maCubo );
    capsule.castShadow = true;
    capsule.receiveShadow = true;
    const esfera = new THREE.Mesh( geoEsfera, maEsfera );
    capsule.castShadow = true;
    capsule.receiveShadow = true;
    const dodeca = new THREE.Mesh( geoDodeca, material );
    capsule.castShadow = true;
    capsule.receiveShadow = true;
    const cylinder = new THREE.Mesh( geoCylinder, material );
    capsule.castShadow = true;
    capsule.receiveShadow = true;
    const icosa = new THREE.Mesh( geoIcosa, material );
    capsule.castShadow = true;
    capsule.receiveShadow = true;

    figuras = [cubo, esfera, dodeca, cylinder, icosa];

    // Elaborar el pentagono y colocar figuras en cada vertice

    pentaForm = new THREE.Shape();
    const pentRadius = 2;
    stablishPentRadius(pentRadius)

    // Crear geometría del pentagono
    const geoPent = new THREE.ShapeGeometry( pentaForm );
    const pent = new THREE.Mesh( geoPent, material );

    // Crear y dar sombra a pent
    pent.castShadow = true;
    pent.receiveShadow = true;

    // Relacionar objetos al mesh del pentagono y al resto de mesh
        
    for(let i = 0; i < figuras.length; i++){
        pent.add(figuras[i]);
        figuras[i].rotation.x = Math.PI / 2;
    }
    
    // Rotar pentagono en paralelo al suelo, además mover las figuras
    
    pent.rotation.x = -Math.PI / 2;
    
    //Crear un objeto que represente a un pentagono
    
    const pentaFigu = new THREE.Object3D();
    pentaFigu.position.x=0;
    pentaFigu.position.y=1;
    pentaFigu.position.z=0;
    pentaFigu.add(pent);

    //Producir sombra y recibir sombra.
    pentaFigu.castShadow = true;
    pentaFigu.receiveShadow = true;
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

        // Dar sombra al modelo
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
    /*******************
    * TO DO: Añadir a la escena unos ejes
    *******************/
    scene.add( new THREE.AxesHelper(3) );

    /******************
     * TO DO: Crear una habitacion de entorno
     ******************/
     // Habitacion
     const paredes = [];
     paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                   map: new THREE.TextureLoader().load(path+"posPFx.jpg")}) );
     paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                   map: new THREE.TextureLoader().load(path+"negPFx.jpg")}) );
     paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                   map: new THREE.TextureLoader().load(path+"posCFy.jpg")}) );
     paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                   map: new THREE.TextureLoader().load(path+"negCfy.jpg")}) );
     paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                   map: new THREE.TextureLoader().load(path+"posPFz.jpg")}) );
     paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                   map: new THREE.TextureLoader().load(path+"negPFz.jpg")}) );
     const habitacion = new THREE.Mesh( new THREE.BoxGeometry(40,40,40),paredes);
     scene.add(habitacion);

    /******************
     * TO DO: Asociar una textura de vídeo al suelo
     ******************/

    video = document.createElement('video');
    video.src = "./videos/NFL_Blocks.mp4";
    video.load();
    video.muted = true;
    video.play();

    // Video en Pantalla
    const texvideo = new THREE.VideoTexture(video);
    const pantalla = new THREE.Mesh(new THREE.PlaneGeometry(20,6, 4,4), 
                                    new THREE.MeshBasicMaterial({map:texvideo}));
    pantalla.position.set(0,4.5,-5);
    scene.add(pantalla);
/*
    // Video en Suelo
    const texvideo = new THREE.VideoTexture(video);
    const suelo = new THREE.Mesh(new THREE.PlaneGeometry(10,10, 10,10), 
                                    new THREE.MeshBasicMaterial({map:texvideo}));
    suelo.rotation.x = -Math.PI / 2;

    // Colocar sombra en el suelo
    suelo.receiveShadow = true;
    scene.add(suelo);
*/
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
        mensaje: 'Seminario #3',
        radioPent: 4.0,
        alambric: false,
        shadow: true,
        play: function(){video.play();},
        pause: function(){video.pause();},
        mute: true,
        colorcubo: "rgb(150,150,150)",
        playerAnimation: animaPlayer,
/*
        cubeAnimation: animateCube,
        esferaAnimation: animateEsfera,
        coneAnimation: animateCone,
        cylinderAnimation: animateCylinder,
        capsuleAnimation: animateCapsule
*/    
    };

    // Creacion interfaz
    const gui = new GUI();

    // Construccion del menu
    const h = gui.addFolder("Menú General");
    h.add(effectController, "mensaje").name("Práctica");
    h.add(effectController, "radioPent", 0, 10).name("Mover Figura");
    h.add(effectController, "alambric").name("Cambiar Alambres");
    h.add(effectController, "playerAnimation").name("Rebotar Modelo");
/*    
    h.add(effectController, "cubeAnimation").name("Activar animación cubo");
    h.add(effectController, "esferaAnimation").name("Activar animación esfera");
    h.add(effectController, "coneAnimation").name("Activar animación cono");
    h.add(effectController, "cylinderAnimation").name("Activar animación cilindro");
    h.add(effectController, "capsuleAnimation").name("Activar animación capsula");
*/
    const hi = gui.addFolder("Opciones de Control")
    hi.add(effectController, "shadow").name("Sombras")
    .onChange( value =>
    {
        //Activar o no la sombra de las figuras
        for(let i = 0; i < 5; i++){
            figuras[i].castShadow = value;
        }
        // Activar o no la sombra del modelo
        modelo.traverse(ob=>{
            if(ob.isObject3D) {
                ob.castShadow = value;
            }
        })
    })
    hi.addColor(effectController, "colorcubo")
        .name("Paleta de Colores")
        .onChange(c=>{figures[0].material.setValues({color:c})});

    const hj = gui.addFolder("Controles de Video")
    hj.add(effectController,"play");
    hj.add(effectController,"pause");
    hj.add(effectController,"mute").onChange(v=>{video.muted = v});

    gui.onChange( event => {
        //Si se modifica el controlador del radio, modificamos el radio del pentagono
        if(event.property == "radioPent"){
            stablishPentRadius(event.value)
        }
        // Modificar con check box los alambres
        if(event.property == "alambric"){
            maCubo.wireframe = event.value;
            maEsfera.wireframe = event.value;
            matfigure.wireframe = event.value;
            maSuelo.wireframe = event.value;
            matcylinder.wireframe = event.value;
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
/*
    intersecciones = rayo.intersectObjects(modelo.children,true);

    if( intersecciones.length > 0 ){
        new TWEEN.Tween( playerfa.rotation ).
        to( {x:[0,0],y:[Math.PI,-Math.PI/2],z:[0,0]}, 5000 ).
        interpolation( TWEEN.Interpolation.Linear ).
        easing( TWEEN.Easing.Exponential.InOut ).
        start();
    }
    */
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