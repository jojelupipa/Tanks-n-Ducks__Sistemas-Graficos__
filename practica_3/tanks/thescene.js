'use strict';

/// The Model Facade class. The root node of the graph.
/**
 * @param renderer - The renderer to visualize the scene
 */
class TheScene extends THREE.Scene {

    constructor(renderer) {
        super();

        // Attributes

        this.ambientLight = null;
        this.spotLight = null;
        this.camera = null;
        this.trackballControls = null;
        this.tank = null;
        this.ground = null;

        this.gameReset = false;
        this.hardMode = false;
        this.createLights();
        this.createCamera(renderer);
        this.firstPersonCamera = false;
        this.axis = new THREE.AxisHelper(25);
        this.add(this.axis);
        this.model = this.createModel();
        this.add(this.model);
        this.fog = new THREE.Fog(
            0xffffff,
            1000,
            1000
        );

    }

    /// It creates the camera and adds it to the graph
    /**
     * @param renderer - The renderer associated with the camera
     */
    createCamera(renderer) {
        this.camera = new THREE.PerspectiveCamera(
            45, window.innerWidth / window.innerHeight,
            0.1, 1000
        );
        this.camera.position.set(
            80, 50, 80
        );
        var look = new THREE.Vector3(
            0, 20, 0
        );
        this.camera.lookAt(look);
        this.trackballControls = new THREE.TrackballControls(this.camera,
                                                             renderer);
        this.trackballControls.rotateSpeed = 5;
        this.trackballControls.zoomSpeed = -2;
        this.trackballControls.panSpeed = 0.5;
        this.trackballControls.target = look;


        this.add(this.camera);
    }

    /// It creates lights and adds them to the graph
    createLights() {
        // add subtle ambient lighting
        this.ambientLight = new THREE.AmbientLight(0xccddee, 0.35);
        this.add(this.ambientLight);

        // add spotlight for the shadows
        this.spotLight = new THREE.SpotLight(0xffffff);
        this.spotLight.position.set(
            100, 100, 30
        );
        this.spotLight.castShadow = true;
        // the shadow resolution
        this.spotLight.shadow.mapSize.width = 2048;
        this.spotLight.shadow.mapSize.height = 2048;
        this.add(this.spotLight);
    }

    /// It creates the geometric model
    /**
     * @return The model
     */
    createModel() {
        var model = new THREE.Object3D();
        var loader = new THREE.TextureLoader();

        // Tank model
        this.tank = new Tank({});
        model.add(this.tank);

        // Ground model
        // var groundTexture = loader.load('imgs/rock.jpg');
        // groundTexture.wrapS = THREE.RepeatWrapping;
        // groundTexture.wrapT = THREE.RepeatWrapping;
        // groundTexture.repeat = new THREE.Vector2(4,4);
        // this.ground = new Ground(
        //     500, 500, new THREE.MeshPhongMaterial({
        //         map: groundTexture
        //     }), 4
        // );
        // model.add(this.ground);

        return model;
    }

    /// It sets the crane position according to the GUI
    /**
     * @controls - The GUI information
     */
    animate(controls) {
        this.axis.visible = controls.axis;
        this.spotLight.intensity = controls.lightIntensity;
    }

    /// It returns the camera
    /**
     * @return The camera
     */
    getCamera() {
        if (this.firstPersonCamera) {
            return this.tank.getCamera();
        } else {
            return this.camera;
        }
    }

    swapCamera() {
        this.firstPersonCamera = !this.firstPersonCamera;
    }

    pauseGame() {
        alert('El juego está en pausa, pulse de nuevo la barra' +
              'espaciadora para continuar');
    }

    toggleReset() {
        this.gameReset = !this.gameReset;
    }

    reset() {
        this.toggleReset();
    }

    /// It returns the camera controls
    /**
     * @return The camera controls
     */
    getCameraControls() {
        return this.trackballControls;
    }

    /// It updates the aspect ratio of the camera
    /**
     * @param anAspectRatio - The new aspect ratio for the camera
     */
    setCameraAspect(anAspectRatio) {
        this.camera.aspect = anAspectRatio;
        this.camera.updateProjectionMatrix();
    }

    moveTank(key) {
        var speed = 1;
        var rotationSpeed = 2;

        switch (key) {
        case String.charCodeAt('W'): // Up
        case 38: // Up
            this.tank.moveForward(speed);
            break;
        case String.charCodeAt('A'): // Left
        case 37: // Left
            this.tank.rotate(rotationSpeed);
            break;
        case String.charCodeAt('S'): // Down
        case 40: // Down
            this.tank.moveForward(-speed);
            break;
        case String.charCodeAt('D'): // Right
        case 39: // Right
            this.tank.rotate(-rotationSpeed);
            break;
        case String.charCodeAt('V'):
            this.swapCamera();
            break;
        }
    }
}

function randNum(top) {
    return Math.floor(Math.random() * Math.floor(top));
}
