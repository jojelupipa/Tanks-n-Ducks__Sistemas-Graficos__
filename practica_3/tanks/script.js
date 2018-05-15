'use strict';

/// Several functions, including the main

/// The scene graph
var scene = null;

/// The GUI information
var GUIcontrols = null;

/// The object for the statistics
var stats = null;

/// The pressed key
var pressedKey = null;
/// Currently pressed keys
var pressedKeysArray = new Array();

/// Player information GUI
// var playerInfo = null;

/// The current mode of the application
// var gameMode = null;

var renderer = null;

var menusArray = new Array();

var pause = false;

var firstTime = true;

var visibleMenu = false;



const MENU = {
    MAIN: 0,
    MAIN_OPTIONS: 1,
    MAIN_INSTR: 2,
    PAUSE: 3,
    PAUSE_OPT: 4,
    PAUSE_INSTR: 5,
};

function hideMenu(){
    $('#fullScreenMenuContainer').hide();
    if(pause) {
        pause = false;
    }
    visibleMenu = false;
}

function startGame(){
    if(firstTime) {
        createGUI(true);
        firstTime = false;
    } //else
    //        createGUI(false);
    hideMenu();
    $('#Stats-output').show();
    render();
}

function showMenu(menuId){
    $('#fullScreenMenuContainer').show();
    menusArray.forEach(function(currMenu, index){
        if(index != menuId)
            currMenu.hide();
        else
            currMenu.show();
    });
    visibleMenu = true;
}

/**
 * Create every menu in the game
 */
function createMenus(){
    // Get the div element which will contain the menus
    var fullScreenMenuContainer = $('#fullScreenMenuContainer')
        // Add basic classes for color and opacity
        .attr('class', 'w3-container w3-opacity-min w3-black')
        // force full-screen and above every element in html
        .css({
            'height': '100vh',
            'width': '100vw',
            'position': 'fixed',
            'z-index': '1',
            'top': '0',
        }).hide();

    // Create the menus with each heading and buttons
    var menus = [
        {
            headingText: 'Tanks n\' Ducks',
            buttonsArray: [
                {name: '1 Jugador', func: 'startGame()'},
                {name: '1 vs 1', func: 'startGame()'},
                {name: 'Instrucciones', func: 'showMenu(MENU.MAIN_INSTR)'},
                {name: 'Opciones', func: 'showMenu(MENU.MAIN_OPTIONS)'},
            ],
        },
        {
            headingText: 'Opciones',
            buttonsArray: [
                {name: 'Velocidad', func: ''},
                {name: 'Nosequé', func: ''},
                {name: 'un puñao de cosas', func: ''},
                {name: 'pin pan pun', func: ''},
                {name: 'Atrás', func:'showMenu(MENU.MAIN)'},
            ],
        },
        {
            headingText: 'Instrucciones',
            image: {
                src: './imgs/Instrucciones.png',
                title: 'Instrucciones',
                alt: 'Instrucciones',
            },
            buttonsArray: [
                {name: 'Atrás', func: 'showMenu(MENU.MAIN)'},
            ],
        },
        {
            headingText: 'Pausa',
            buttonsArray: [
                {name: 'Reanudar', func:'toggleRender()'},
                {name: 'Instrucciones', func: 'showMenu(MENU.PAUSE_INSTR)'},
                {name: 'Opciones rápidas', func: 'showMenu(MENU.PAUSE_OPT)'},
                {name: 'Menú principal', func:'restartScene()'},
            ],
        },
        {
            headingText: 'Opciones In-Game',
            buttonsArray: [
                {name: 'Velocidad', func: ''},
                {name: 'Nosequé', func: ''},
                {name: 'Atrás', func:'showMenu(MENU.PAUSE)'},
            ],
        },
        {
            headingText: 'Instrucciones',
            image: {
                src: './imgs/Instrucciones.png',
                title: 'Instrucciones',
                alt: 'Instrucciones',
            },
            buttonsArray: [
                {name: 'Atrás', func: 'showMenu(MENU.PAUSE)'},
            ],
        },
    ];

    // For each menu, add it to the html
    menus.forEach(function(currMenuContents){
        // Menu itself
        var currMenu = $('<form>')
            .addClass(
                'menu w3-container w3-text-light-grey w3-center ' +
                'w3-display-middle w3-quarter'
            );
        fullScreenMenuContainer.append(currMenu);

        // Add a label with the current menu heading
        currMenu.append(
            $('<label>')
                .text(currMenuContents.headingText)
                .addClass(
                    'w3-xxlarge w3-margin-bottom w3-panel w3-block ' +
                    'w3-round-large w3-teal'
                )
        );

        if(currMenuContents.image !== undefined)
            currMenu.append(
                $('<img>')
                    .attr({
                        'src': currMenuContents.image.src,
                        'title': currMenuContents.image.title,
                        'alt': currMenuContents.image.alt,
                    }).width('100%')
                    .addClass('w3-margin-bottom w3-round-large')
            );

        // Add the buttons to de menu
        currMenuContents.buttonsArray.forEach(function(currButton){
            currMenu.append(
                $('<input>')
                    .attr({
                        'value': currButton.name,
                        'onmouseup':currButton.func,
                        'type': 'button'
                    }).addClass(
                        'w3-button w3-block w3-round-large w3-hover-teal'
                    )
            );
        });

        // Add the current menu to an array for future show/hide
        menusArray.push(currMenu);
    });
}

function restartScene() {
    scene = new TheScene(renderer.domElement);
    renderer.clear(false,true,true);
    $('#Stats-output').hide();
    showMenu(MENU.MAIN);
}

/**
 * It creates the GUI and, optionally, adds statistic information
 * @param withStats - A boolean to show the statictics or not
 */
function createGUI(withStats) {
    // GUIcontrols = new function() {
    //     this.axis = false;
    //     this.lightIntensity = 0.3;
    //     this.tankTurretRotation = 0;
    //     this.tankBarrelRotation = 0;
    //     this.hardMode = false;
    // };
    //
    // var gui = new dat.GUI();
    //
    // var gameControls = gui.addFolder('Game Controls');
    // gameControls.add(GUIcontrols, 'hardMode').name('Hard Mode: ');
    //
    // var tankControls = gui.addFolder('Tank Controls');
    // tankControls.add(
    //     GUIcontrols, 'tankTurretRotation', -180.0, 180.0
    // ).name('Turret Rotation :');
    //
    // var axisLights = gui.addFolder('Axis and Lights');
    // axisLights.add(GUIcontrols, 'axis').name('Axis on/off :');
    // axisLights.add(
    //     GUIcontrols, 'lightIntensity', 0, 1.0
    // ).name('Light intensity :');


    // The method  listen()  allows the height attribute to be written,
    // not only read

    if(withStats) {
        stats = initStats();
    }

    // playerInfo = initPlayerInfo();
}

/**
 * It adds statistics information to a previously created Div
 * @return The statistics object
 */
function initStats() {

    var stats = new Stats();

    stats.setMode(0); // 0: fps, 1: ms

    // Align top-left
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    $('#Stats-output').append(stats.domElement);

    return stats;
}

function initPlayerInfo() {
    var playerInfo = new PlayerInfo();

    playerInfo.domElement.style.position = 'absolute';
    playerInfo.domElement.style.left = '0px';
    playerInfo.domElement.style.top = '100px';

    $('#Player-info').append(playerInfo.domElement);

    return playerInfo;
}

/**
 * It shows a feed-back message for the user
 * @param str - The message
 */
function setMessage(str) {
    $('#Messages').text('<h2>' + str + '</h2>');
}

/**
 * It processes the clic-down of the mouse
 * @param event - Mouse information
 */
function onMouseDown(event) {
    if (event.ctrlKey) {
        // The Trackballcontrol only works if Ctrl key is pressed
        scene.getCameraControls().enabled = true;
    } else {
        scene.getCameraControls().enabled = false;
    }
}

/**
 * It processes the mouse wheel rotation
 * @param event - Mouse information
 */
function onMouseWheel(event) {
    if (event.ctrlKey) {
        // The Trackballcontrol only works if Ctrl key is pressed
        scene.getCameraControls().enabled = true;
    } else {
        scene.getCameraControls().enabled = false;
    }
}

/**
 * It processes the window size changes
 */
function onWindowResize() {
    scene.setCameraAspect(window.innerWidth / window.innerHeight);
    renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * It creates and configures the WebGL renderer
 * @return The renderer
 */
function createRenderer() {
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0xEEEEEE), 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    return renderer;
}

/**
 * It renders every frame
 */
function render() {
    if(!pause){
        requestAnimationFrame(render);

        stats.update();
        // playerInfo.update(scene.robot.energy, scene.robot.score);
        scene.getCameraControls().update();
        scene.animate(GUIcontrols);

        renderer.render(scene, scene.getCamera());

        if (scene.gameReset){
            scene.toggleReset();
            pressedKey = null;
        }
    }

}

function toggleRender(){
    if (visibleMenu) {
        hideMenu();
        pause = false;
        visibleMenu = false;
        requestAnimationFrame(render);
    } else {
        showMenu(MENU.PAUSE);
        pause = true;
    }
}

/**
 * Key down listener
 * @param event - The key event
 */
function keyDownListener(event) {
    var key = (event.keyCode) ? event.keyCode : event.which;

    switch(key){
    case String('V').charCodeAt():
        scene.swapCamera();
        break;
    case 27: // Esc key
        toggleRender();
    }
}

/**
 * Key up listener
 * @param event - The key event
 */
function keyUpListener(event) {
    var key = (event.keyCode) ? event.keyCode : event.which;

    switch(key) {
    case String('W').charCodeAt():
    case String('A').charCodeAt():
    case String('S').charCodeAt():
    case String('D').charCodeAt():
    case String('Q').charCodeAt():
    case String('E').charCodeAt():        
    case String(' ').charCodeAt():
    case 37: // Left arrow
    case 38: // Up arrow
    case 39: // Right arrow
    case 40: // Down arrow
        pressedKeysArray.splice(pressedKeysArray.indexOf(key),1);
    }
}

/**
 * Runs code while a key is pressed
 * @param event - keyboard event
 */
function onKeyDown(event){
    var key = (event.keyCode) ? event.keyCode : event.which;

    switch (key) {
    case String('W').charCodeAt():
    case String('A').charCodeAt():
    case String('S').charCodeAt():
    case String('D').charCodeAt():
    case String('Q').charCodeAt():
    case String('E').charCodeAt():
    case String(' ').charCodeAt():
    case 37: // Left arrow
    case 38: // Up arrow
    case 39: // Right arrow
    case 40: // Down arrow
        pressedKey = key;
        if(pressedKeysArray.indexOf(pressedKey) == -1) {
            pressedKeysArray.push(pressedKey);
        }
        break;
    }
}

/**
 * Runs code while a key is released
 */
function onKeyUp(){
    pressedKey = null;
}

/**
 * The main function
 */
$(function() {
    // create a render and set the size
    renderer = createRenderer();

    // add the output of the renderer to the html element
    $('#WebGL-output').append(renderer.domElement);

    // liseners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener(
        'mousedown', onMouseDown, true
    );
    window.addEventListener(
        'mousewheel', onMouseWheel, true
    ); // For
    // Chrome an others
    window.addEventListener(
        'DOMMouseScroll', onMouseWheel, true
    ); // For Firefox
    window.addEventListener(
        'keydown', onKeyDown, false
    ); // For Firefox
    window.addEventListener(
        'keyup', onKeyUp, false
    ); // For Firefox
    window.onkeydown = keyDownListener;
    window.onkeyup = keyUpListener;

    // create a scene, that will hold all our elements such as objects,
    // cameras and lights.
    scene = new TheScene(renderer.domElement);

    createMenus();
    showMenu(MENU.MAIN);
});
