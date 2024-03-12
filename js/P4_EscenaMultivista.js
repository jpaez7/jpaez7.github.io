/**
 * EscenaMultivista.js
 * 
 * Practica AGM #3. Escena basica con interfaz, animacion e iluminacion
 * Se trata de añadir luces a la escena y diferentes materiales
 * 
 * @author José Páez <jpaez@etsinf.upv.es>, MAR2024
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
let maFigura, maEsfera, maSuelo, maCylinder, camaraOrtografica;
const L = 5;

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
    renderer.autoClear = false;

    /*******************
    * TO DO: Completar el motor de render, el canvas y habilitar
    * el buffer de sombras.
    *******************/
    document.getElementById('container').appendChild( renderer.domElement );
    renderer.antialias = true;
    renderer.shadowMap.enabled = true;

    // Escena
    scene = new THREE.Scene();
    
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
    // Texturas
    /*******************
     * TO DO: Cargar texturas
     * - De superposición
     * - De entorno
     *******************/
    const path ="./images/";
    const texfigura = new THREE.TextureLoader().load(path+"metal_128.jpg");
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
     * - Uno basado en Basic
     *******************/
    maFigura = new THREE.MeshLambertMaterial({color:'orange',map:texfigura});
    maEsfera = new THREE.MeshPhongMaterial({color:'White',
                                                   specular:'gray',
                                                   shininess: 30,
                                                   envMap: texesfera });
    maSuelo = new THREE.MeshStandardMaterial({color:"rgb(150,150,150)",map:texsuelo});
    maCylinder = new THREE.MeshBasicMaterial({color:"rgb(53,102,86)",map:texsuelo});

    /*******************
    * TO DO: Misma escena que en la practica anterior
    * cambiando los materiales y activando las sombras
    *******************/
    // *** Selección de presentación en color del Mesh Básico
    
    //material = new THREE.MeshBasicMaterial( { color: 'white', wireframe: true } );
    material = new THREE.MeshNormalMaterial( {wireframe:false} );

    // Geometría de las Figuras
    const geoCubo = new THREE.BoxGeometry( 2, 2, 2 );
    const geoEsfera = new THREE.SphereGeometry( 1, 20 ,20 );
    const geoDodeca = new THREE.DodecahedronGeometry( 1, 1, 1);
    const geoCylinder = new THREE.CylinderGeometry( 1, 1, 2);
    const geoIcosa = new THREE.IcosahedronGeometry(1, 1, 2);
    
    //Crear mesh con geometría, material, hacer y dar sombras
    const cubo = new THREE.Mesh( geoCubo, maFigura );
    cubo.castShadow = true;
    cubo.receiveShadow = true;
    const esfera = new THREE.Mesh( geoEsfera, maEsfera );
    esfera.castShadow = true;
    esfera.receiveShadow = true;
    const dodeca = new THREE.Mesh( geoDodeca, maFigura );
    dodeca.castShadow = true;
    dodeca.receiveShadow = true;
    const cylinder = new THREE.Mesh( geoCylinder, maCylinder );
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    const icosa = new THREE.Mesh( geoIcosa, maFigura );
    icosa.castShadow = true;
    icosa.receiveShadow = true;

    figuras = [cubo, esfera, dodeca, cylinder, icosa];

    // Elaborar el pentagono y colocar figuras en cada vertice

    pentaForm = new THREE.Shape();
    const pentRadius = 4;
    stablishPentRadius(pentRadius)

    // Crear geometría del pentagono
    const geoPent = new THREE.ShapeGeometry( pentaForm );
    const pent = new THREE.Mesh( geoPent, maFigura );

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
                   map: new THREE.TextureLoader().load(path+"negCFy.jpg")}) );
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
        mensaje: 'Seminario #4',
        radioPent: 3.5,
        alambric: false,
        shadow: true,
        play: function(){video.play();},
        pause: function(){video.pause();},
        mute: true,
        colorcubo: "rgb(150,150,150)",
        playerAnimation: animaPlayer,
        cubeAnimation: animaCubo,
        esferaAnimation: animaEsfera,        
        //colorsuelo: "rgb(150,150,150)"
    };

    // Creacion interfaz
    const gui = new GUI();

    // Construccion del menu
    const h = gui.addFolder("Menú General");
    h.add(effectController, "mensaje").name("Práctica");
	//h.add(effectController, "giroY", -180.0, 180.0, 0.025).name("Giro en Y");    
    h.add(effectController, "radioPent", 2, 5).name("Mover Figura");
    h.add(effectController, "alambric").name("Activar Alambres en Figuras   ");
    h.add(effectController, "playerAnimation").name("Rebotar Modelo");
    h.add(effectController, "cubeAnimation").name("Girar Cubo");
    h.add(effectController, "esferaAnimation").name("Agrandar Esfera");
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
        .onChange(c=>{figuras[0].material.setValues({color:c})});

    const hj = gui.addFolder("Controles de Video")
    hj.add(effectController,"play");
    hj.add(effectController,"pause");
    hj.add(effectController,"mute").onChange(v=>{video.muted = v});

    gui.onChange( event => {
        // Modificar controlador del radio y radio del pentagono
        if(event.property == "radioPent"){
            stablishPentRadius(event.value)
        }
        
        // Modificar con check box los alambres
        if(event.property == "alambric"){
            material.wireframe = event.value;
            maEsfera.wireframe = event.value;
            maFigura.wireframe = event.value;
            maSuelo.wireframe = event.value;
            maCylinder.wireframe = event.value;
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

//Funciones de Animación para el Modelo, el Cubo y la Esfera

function animaPlayer(){
    new TWEEN.Tween( modelo.position ).
        to( {x:[0,0,0],y:[0,5,0],z:[0,0,0]}, 2000 ).
        interpolation( TWEEN.Interpolation.Bezier ).
        easing( TWEEN.Easing.Bounce.Out ).
        start();
}

function animaCubo(){
    new TWEEN.Tween( figuras[0].rotation ).
        to( {x:[0,0],y:[0,Math.PI*2],z:[0,0]}, 2000 ).
        interpolation( TWEEN.Interpolation.Bezier ).
        easing( TWEEN.Easing.Linear.None ).
        start();
}

function animaEsfera(){
    let originScaleX = figuras[1].scale.x
    let originScaleY = figuras[1].scale.y
    let originScaleZ = figuras[1].scale.z
    new TWEEN.Tween( figuras[1].scale ).
        to( {x:[originScaleX ,originScaleX * 4, originScaleX],y:[originScaleY ,originScaleY * 4, originScaleY],z:[originScaleZ ,originScaleZ * 4, originScaleZ]}, 2000 ).
        interpolation( TWEEN.Interpolation.Bezier ).
        easing( TWEEN.Easing.Bounce.InOut ).
        start();
}

function animate(event)
{
    /*******************
    * TO DO: Animar el objeto seleccionado con dobleclick
    * en cualquier vista
    *******************/
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