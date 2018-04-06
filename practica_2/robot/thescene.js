/// The Model Facade class. The root node of the graph.
/**
 * @param renderer - The renderer to visualize the scene
 */
class TheScene extends THREE.Scene {

    constructor(renderer) {
        super();

        // Attributes

        this.ambientLight = null
        this.spotLight = null
        this.camera = null
        this.trackballControls = null
        this.crane = null
        this.robot = null
        this.ground = null
        this.flyingObjects = null
        this.spawnedFO = 0
        this.spawnedFOArray = [-1,-1,-1]

        this.createLights()
        this.createCamera(renderer)
        this.axis = new THREE.AxisHelper(25)
        this.add(this.axis)
        this.model = this.createModel()
        this.add(this.model)
    }

    /// It creates the camera and adds it to the graph
    /**
     * @param renderer - The renderer associated with the camera
     */
    createCamera(renderer) {
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth /
                                                  window.innerHeight,
                                                  0.1, 1000);
        this.camera.position.set(80, 50, 80);
        var look = new THREE.Vector3(0, 20, 0);
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
        this.spotLight.position.set(100, 100, 30);
        this.spotLight.castShadow = true;
        // the shadow resolution
        this.spotLight.shadow.mapSize.width = 2048
        this.spotLight.shadow.mapSize.height = 2048
        this.add(this.spotLight);
    }

    /// It creates the geometric model: crane and ground
    /**
     * @return The model
     */
    createModel() {
        var model = new THREE.Object3D()
        var loader = new THREE.TextureLoader()

        // Robot model
        var robotTexture = loader.load('imgs/metal.jpg')
        var legTexture = loader.load('imgs/leg.jpg')
        this.robot = new Robot({
            eyeMaterial: new THREE.MeshPhongMaterial({ color: "#000000",
                                                       shininess: 70 }),
            headMaterial: new THREE.MeshPhongMaterial({ color: "#888888",
                                                        shininess: 70 }),
            bodyMaterial: new THREE.MeshPhongMaterial({ color: "#e8e8e8",
                                                        shininess: 70 }),
            footMaterial: new THREE.MeshPhongMaterial({ color: "#001284",
                                                        shininess: 70 }),
            legMaterial: new THREE.MeshPhongMaterial({ color: "#e8e8e8",
            shininess: 70 , map: legTexture}),
            shoulderMaterial: new THREE.MeshPhongMaterial({ color:
            "#001284", shininess: 70 })
        })
        // model.add (this.crane);
        model.add(this.robot)

        // Ground model
        var groundTexture = loader.load('imgs/rock.jpg')
        this.ground = new Ground(300, 300, new THREE.MeshPhongMaterial({
            map: groundTexture
        }), 4)
        model.add(this.ground)

        // Flying object
        this.flyingObjects = new Array(10)
        for (var i = 0; i < 8; i++)
            this.flyingObjects[i] = new OvoMa({})

	for (var i = 8; i < 10; i++)
            this.flyingObjects[i] = new OvoBu({})
        return model
    }

    flyingObjectsAgent() {
        // Primero hay que spawnear algún objeto, añadiéndolo al
        // modelo (this.model) y luego estos hay que moverlos y cuando
	// lleguen a una posición determinada, borrarlos e instanciar
	// unos nuevos
	this.spawner();
        this.mover();
	this.remover();
    }

    spawner() {
        if(this.spawnedFO < 3) {
	    // Nos aseguramos de que el objeto que se genere no esté
	    // ya en el juego
	    do {
		var lastGenerated = randNum(10);  
		var found = this.spawnedFOArray.find(function(element) {
		    return element == lastGenerated;
		});
	    } while(found !== undefined);
	    
            this.spawnedFOArray[this.spawnedFO] =
                lastGenerated;
	    ++this.spawnedFO;
            this.model.add(this.flyingObjects[lastGenerated]);
        }
    }

    mover() {
	for(var i = 0; i < this.spawnedFO; ++i) {
	    this.flyingObjects[this.spawnedFOArray[i]].moveTowardsNegativeX();
	}
    }
    remover() {
	for(var i = 0; i < this.spawnedFO; ++i) {
	    if(this.flyingObjects[this.spawnedFOArray[i]].sphere.position.x
	       < -100) {
		this.model.remove(this.flyingObjects[this.spawnedFOArray[i]]);
		--this.spawnedFO;
		this.spawnedFOArray[i] = -1;
		this.spawner();
	    }
	    
	    //console.log('object ' + i + ': ' +this.flyingObjects[this.spawnedFOArray[i]].sphere.position.x
	//	       );
	}
    }
    // Public methods

    /// It adds a new box, or finish the action
    /**
     * @param event - Mouse information
     * @param action - Which action is requested to be processed: start
     adding or finish.
    */
    // addBox (event, action) {
    //   this.ground.addBox(event, action);
    // }

    /// It moves or rotates a box on the ground
    /**
     * @param event - Mouse information
     * @param action - Which action is requested to be processed: select
     a box, move it, rotate it or finish the action.
    */
    // moveBox (event, action) {
    //   this.ground.moveBox (event, action);
    // }

    /// The crane can take a box
    /**
     * @return The new height of the hook, on the top of the taken
     box. Zero if no box is taken
    */
    // takeBox () {
    //   var box = this.ground.takeBox (this.crane.getHookPosition());
    //   if (box === null)
    //     return 0;
    //   else
    //     return this.crane.takeBox (box);
    //   // The retuned height set the new limit to down the hook
    // }

    /// The crane drops its taken box
    // dropBox () {
    //   var box = this.crane.dropBox ();
    //   if (box !== null) {
    //     box.position.copy (this.crane.getHookPosition());
    //     box.position.y = 0;
    //     this.ground.dropBox (box);
    //   }
    // }

    /// It sets the crane position according to the GUI
    /**
     * @controls - The GUI information
     */
    animate(controls) {
        this.axis.visible = controls.axis
        this.spotLight.intensity = controls.lightIntensity
        this.robot.setLegHeight(controls.robotLegScaleFactor)
        this.robot.setHeadTwist(controls.robotHeadTwist)
        this.robot.setBodySwing(controls.robotBodySwing)
	this.flyingObjectsAgent()
        // this.crane.setHookPosition (controls.rotation,
        // controls.distance, controls.height);
    }

    /// It returns the camera
    /**
     * @return The camera
     */
    getCamera() {
        return this.camera;
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

    moveRobot(key) {
        var speed = 1;
        var rotationSpeed = 2;
        switch (key) {
            case String.charCodeAt('W'): // W
                this.robot.moveRobotForward(speed);
                break;
            case String.charCodeAt('A'): // A
                this.robot.rotateRobot(rotationSpeed);
                break;
            case String.charCodeAt('S'): // S
                this.robot.moveRobotForward(-speed);
                break;
            case String.charCodeAt('D'):
                this.robot.rotateRobot(-rotationSpeed);
                break;
        }
    }
}


function randNum(top) {
    return Math.floor(Math.random() * Math.floor(top));
}


// class variables

// Application modes
TheScene.NO_ACTION = 0;
TheScene.ADDING_BOXES = 1;
TheScene.MOVING_BOXES = 2;

// Actions
TheScene.NEW_BOX = 0;
TheScene.MOVE_BOX = 1;
TheScene.SELECT_BOX = 2;
TheScene.ROTATE_BOX = 3;
TheScene.END_ACTION = 10;