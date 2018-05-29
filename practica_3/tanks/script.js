'use strict';

/// Several functions, including the main

/**
 * Scene graph
 */
var scene = null;

/**
 * The GUI information
 */
var GUIcontrols = null;

/**
 * The object for the statistics
 */
var stats = null;

/**
 * True if stats on screen
 */
var showStats = true;

/**
 * Array of ammo bars
 */
var ammoBarsArray = null;

/**
 * Currently pressed keys
 */
var pressedKeysArray = [];

/**
 * Renderer
 */
var renderer = null;

/**
 * @enum - Possible game states
 */
const GameState = {
    START_END: 0,
    MAIN_SUBMENU: 1,
    PAUSE_OR_PAUSE_SUBMENU: 2,
    IN_GAME: 3,
};

var currentGameState = null;

/**
 * If it is the irst time the function startGame is executed
 */
var firstTime = true;

/**
 * The game speed factor
 */
var gameSpeed = 1;

/**
 * @enum - Possible menus
 */
const Menu = {
    MAIN: 0,
    OPTIONS: 1,
    INSTRUCTIONS: 2,
    PAUSE: 3,
    MAP_SELECTOR: 4,
    END: 5,
};

/**
 * Array of menus to show/hide them
 */
var menusArray = [];

/**
 * Current visible menu
 */
var currentMenu = null;

/**
 * Last visible menu
 */
var previousMenu = null;

/**

 ######      ###    ##     ## ########
##    ##    ## ##   ###   ### ##
##         ##   ##  #### #### ##
##   #### ##     ## ## ### ## ######
##    ##  ######### ##     ## ##
##    ##  ##     ## ##     ## ##
 ######   ##     ## ##     ## ########

 ######   ######  ######## ##    ## ########
##    ## ##    ## ##       ###   ## ##
##       ##       ##       ####  ## ##
 ######  ##       ######   ## ## ## ######
      ## ##       ##       ##  #### ##
##    ## ##    ## ##       ##   ### ##
 ######   ######  ######## ##    ## ########

 #######  ######## ##     ## ######## ########
##     ##    ##    ##     ## ##       ##     ##
##     ##    ##    ##     ## ##       ##     ##
##     ##    ##    ######### ######   ########
##     ##    ##    ##     ## ##       ##   ##
##     ##    ##    ##     ## ##       ##    ##
 #######     ##    ##     ## ######## ##     ##

**/


/**
 * Update music option text value
 */
function updateMusicOption() {
    var currText = 'Música';
    var currValue = (scene.musicOn ? 'ON': 'OFF');
    $('#optMusic').attr('value', currText + ' (' + currValue + ')');
}

/**
 * Update effects option text value
 */
function updateEffectsOption() {
    var currText = 'Efectos';
    var currValue = (scene.effectsOn() ? 'ON': 'OFF');
    $('#optEffects').attr('value', currText + ' (' + currValue + ')');
}

/**
 * Update speed option text value
 */
function updateSpeedOption() {
    var currText = 'Velocidad';
    var currValue = gameSpeed;
    $('#optSpeed').attr('value', currText + ' (' + currValue + ')');
}

/**
 * Update stats option text value
 */
function updateStatsOption() {
    var currText = 'Información';
    var currValue = (showStats ? 'ON': 'OFF');
    $('#optStats').attr('value', currText + ' (' + currValue + ')');
}

/**
 * Update every option text value
 */
function updateAllOptions() {
    updateMusicOption();
    updateEffectsOption();
    updateSpeedOption();
    updateStatsOption();
}

/**
 * Toggle music ON/OFF
 */
function toggleMusic() {
    scene.toggleMusic();
    updateMusicOption();
}

/**
 * Toggle effects ON/OFF
 */
function toggleEffects() {
    scene.toggleEffects();
    updateEffectsOption();
}

/**
 * Rotate game speed factor
 */
function changeSpeed() {
    gameSpeed = (gameSpeed % 3) + 1;
    updateSpeedOption();
}

/**
 * Toggle stats ON/OFF
 */
function toggleStats() {
    showStats = !showStats;
    $('#statsOutput').toggle();
    updateStatsOption();
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

    $('#statsOutput').append(stats.domElement);

    return stats;
}

/**
 * Create the ammo bar(s)
 *
 * @param {Boolean} multiPlayer - True if the game is 1vs1
 * @return {Array.<AmmoBar>} - Ammo bars in use
 */
function initAmmoBars(multiPlayer = false){
    var ammoBarsArray = [];
    var ammoBar0 = new AmmoBar(1, 'red');

    $('#ammoBarsContainer')
        .addClass('w3-display-topmiddle')
        .append(ammoBar0.domElement);

    ammoBarsArray.push(ammoBar0);

    if(multiPlayer){
        var ammoBar1 = new AmmoBar(2, 'blue');
        $('#ammoBarsContainer')
            .append(ammoBar1.domElement);
        ammoBarsArray.push(ammoBar1);
    }

    return ammoBarsArray;
}

/**
 * It creates the GUI and, optionally, adds statistic information
 * @param withStats - A boolean to show the statictics or not
 */
function createGUI(withStats) {

    if(withStats) {
        stats = initStats();
    }

    ammoBarsArray = initAmmoBars();
}

/**
 * Start game: show gui and start a new render/request animation frame
 */
function startGame(mapName = 'galaxy'){
    toggleMenu(currentMenu);
    if (showStats)
        $('#statsOutput').show();
    $('#ammoBarsContainer').show();
    scene.stopTheme();
    scene.createBackground(mapName);
    if (firstTime) {
        firstTime = false;
        createGUI(true);
        render();
    } else {
        requestAnimationFrame(render);
    }
}

/**
 * Restart the scene, clear the render and show main menu
 */
function resetGame() {
    toggleMenu(Menu.MAIN);
    $('#statsOutput').hide();
    $('#ammoBarsContainer').hide();
    scene.stopMusic();
    renderer.clear(false, true, true);
    scene = new TheScene(renderer.domElement);
}

/**

##     ## ######## ##    ## ##     ##  ######
###   ### ##       ###   ## ##     ## ##    ##
#### #### ##       ####  ## ##     ## ##
## ### ## ######   ## ## ## ##     ##  ######
##     ## ##       ##  #### ##     ##       ##
##     ## ##       ##   ### ##     ## ##    ##
##     ## ######## ##    ##  #######   ######

**/

/**
 * Manage menu changes (hide/show) and the consecuences of the changes
 *
 * @param {Menu} menuId - menusArray index
 */
function toggleMenu(menuId = Menu.MAIN) {
    // Hide current menu
    if (menuId === currentMenu) {
        // Hide current menu
        menusArray[menuId].hide();
        $('#fullScreenMenuContainer').hide();
        // Update current and previous menu vars
        previousMenu = currentMenu;
        currentMenu = null;
    // Show other menu and hide current one
    } else if (0 <= menuId || menuId < menusArray.length) {
        // If the current menu isn't null, hide it!
        if (currentMenu !== null)
            menusArray[currentMenu].hide();
        $('#fullScreenMenuContainer').show();
        // Show the new menu (menuId)
        menusArray[menuId].show();
        // Update current and previous menu vars
        previousMenu = currentMenu;
        currentMenu = menuId;
    }

    // Update all options when entering the options menu
    if (currentMenu === Menu.OPTIONS)
        updateAllOptions();

    // If we are in a main sub-menu
    if (previousMenu == Menu.MAIN && currentMenu !== null)
        currentGameState = GameState.MAIN_SUBMENU;

    // If we are playing
    if (currentMenu === null) {
        currentGameState = GameState.IN_GAME;
        // If we came from pause
        if (previousMenu === Menu.PAUSE)
            requestAnimationFrame(render);
    }

    // If we are in pause
    if ((previousMenu === Menu.PAUSE &&
            currentMenu !== Menu.MAIN &&
            currentMenu !== null) ||
            currentMenu === Menu.PAUSE)
        currentGameState = GameState.PAUSE_OR_PAUSE_SUBMENU;

    // If we are in the end screen
    if (currentMenu === Menu.MAIN || currentMenu === Menu.END)
        currentGameState = GameState.START_END;

    // Clear pressed keys
    pressedKeysArray = [];
}

/**
 * Create every menu in the game
 */
function createMenus(){
    // Get the div element which will contain the menus
    var fullScreenMenuContainer = $('#fullScreenMenuContainer')
        // Add basic classes for color and opacity
        .addClass('w3-container w3-black')
        // force full-screen and above every element in html
        .css({
            'height': '100vh',
            'width': '100vw',
            'position': 'fixed',
            'z-index': '10',
            'top': '0',
            'opacity': '0.85'
        }).hide();

    // Create the menus with each heading and buttons
    var menus = [
        {
            headingText: 'Tanks n\' Ducks',
            buttonsArray: [
                {text: '1 Jugador', func: 'toggleMenu(Menu.MAP_SELECTOR)'},
                {text: '1 vs 1', func: 'alert(\'Comming soon...\')'},
                {text: 'Instrucciones', func: 'toggleMenu(Menu.INSTRUCTIONS)'},
                {text: 'Opciones', func: 'toggleMenu(Menu.OPTIONS)'},
            ],
        },
        {
            headingText: 'Opciones',
            buttonsArray: [
                {
                    text: 'Música (ON)',
                    func: 'toggleMusic()',
                    id: 'optMusic'
                },
                {
                    text: 'Efectos (ON)',
                    func: 'toggleEffects()',
                    id: 'optEffects'
                },
                {
                    text: 'Velocidad (1)',
                    func: 'changeSpeed()',
                    id: 'optSpeed'
                },
                {
                    text: 'Información (ON)',
                    func: 'toggleStats()',
                    id: 'optStats'
                },
                {text: 'Atrás', func:'toggleMenu(previousMenu)'},
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
                {text: 'Atrás', func: 'toggleMenu(previousMenu)'},
            ],
        },
        {
            headingText: 'Pausa',
            buttonsArray: [
                {text: 'Reanudar', func:'toggleMenu(currentMenu)'},
                {text: 'Instrucciones', func: 'toggleMenu(Menu.INSTRUCTIONS)'},
                {text: 'Opciones', func: 'toggleMenu(Menu.OPTIONS)'},
                {text: 'Menú principal', func:'resetGame()'},
            ],
        },
        {
            headingText: 'Selección de mapas',
            buttonsArray: [
                {text: 'Universo', func:'startGame(\'galaxy\')'},
                {text: 'Parque', func: 'startGame(\'park\')'},
                {text: 'Atrás', func:'toggleMenu(previousMenu)'},
            ],
        },
        {
            headingText: 'Fin del juego',
            image: {
                src: './imgs/see_you_later.png',
                title: 'See you later',
                alt: 'See you later',
            },
            buttonsArray: [
                {text: 'Menú principal', func:'resetGame()'},
            ]
        }
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
                        'id': (currButton.id === undefined? '': currButton.id),
                        'value': currButton.text,
                        'onmouseup':currButton.func,
                        'type': 'button'
                    }).addClass(
                        'w3-button w3-block w3-round-large w3-hover-teal'
                    )
            );
        });

        // Add the current menu to an array for future show/hide
        menusArray.push(currMenu.hide());
    });
}

/**

########  ######## ##    ## ########  ######## ########
##     ## ##       ###   ## ##     ## ##       ##     ##
##     ## ##       ####  ## ##     ## ##       ##     ##
########  ######   ## ## ## ##     ## ######   ########
##   ##   ##       ##  #### ##     ## ##       ##   ##
##    ##  ##       ##   ### ##     ## ##       ##    ##
##     ## ######## ##    ## ########  ######## ##     ##

**/

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
    // If we are in pause, dont request another animation frame
    if (currentGameState !== GameState.IN_GAME)
        return;

    requestAnimationFrame(render);

    if (showStats)
        stats.update();

    scene.getCameraControls().update();
    scene.animate();

    renderer.render(scene, scene.getCamera());
}


/**

##       ####  ######  ######## ######## ##    ## ######## ########   ######
##        ##  ##    ##    ##    ##       ###   ## ##       ##     ## ##    ##
##        ##  ##          ##    ##       ####  ## ##       ##     ## ##
##        ##   ######     ##    ######   ## ## ## ######   ########   ######
##        ##        ##    ##    ##       ##  #### ##       ##   ##         ##
##        ##  ##    ##    ##    ##       ##   ### ##       ##    ##  ##    ##
######## ####  ######     ##    ######## ##    ## ######## ##     ##  ######

**/


/**
 * Key down listener
 * @param event - The key event
 */
function keyDownListener(event) {
    var key = (event.keyCode) ? event.keyCode : event.which;

    switch(key){
    case String('V').charCodeAt():
        if (currentGameState === GameState.IN_GAME)
            scene.swapCamera();
        break;
    case 27: // Esc key
        if (currentGameState === GameState.MAIN_SUBMENU)
            toggleMenu(Menu.MAIN);
        else if (currentGameState === GameState.PAUSE_OR_PAUSE_SUBMENU ||
                currentGameState === GameState.IN_GAME) {
            toggleMenu(Menu.PAUSE);
        }
    }
}

/**
 * Key up listener
 * @param event - The key event
 */
function keyUpListener(event) {
    var key = (event.keyCode) ? event.keyCode : event.which;

    if (currentGameState === GameState.IN_GAME) {
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
            pressedKeysArray.splice(pressedKeysArray.indexOf(key),1);
        }
    }
}

/**
 * Runs code while a key is pressed
 * @param event - keyboard event
 */
function onKeyDown(event){
    var key = (event.keyCode) ? event.keyCode : event.which;

    if (currentGameState === GameState.IN_GAME) {
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
            if(pressedKeysArray.indexOf(key) == -1) {
                pressedKeysArray.push(key);
            }
        }
    }
}

/**
 * It processes the clic-down of the mouse
 * @param event - Mouse information
 */
function onMouseDown(event) {
    if (currentGameState === GameState.IN_GAME) {
        if (event.ctrlKey) {
            // The Trackballcontrol only works if Ctrl key is pressed
            scene.getCameraControls().enabled = true;
        } else {
            scene.getCameraControls().enabled = false;
        }
    }
}

/**
 * It processes the mouse wheel rotation
 * @param event - Mouse information
 */
function onMouseWheel(event) {
    if (currentGameState === GameState.IN_GAME) {
        if (event.ctrlKey) {
            // The Trackballcontrol only works if Ctrl key isn't pressed
            scene.getCameraControls().enabled = false;
        } else {
            scene.getCameraControls().enabled = true;
        }
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
 * The main function
 */
$(function() {
    // create a render and set the size
    renderer = createRenderer();

    // add the output of the renderer to the html element
    $('#webGLOutput').append(renderer.domElement);

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
    window.onkeydown = keyDownListener;
    window.onkeyup = keyUpListener;

    // create a scene, that will hold all our elements such as objects,
    // cameras and lights.
    scene = new TheScene(renderer.domElement);

    createMenus();
    toggleMenu(Menu.MAIN);
});
