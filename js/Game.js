/**
 * Main Game class
 * Initializes and coordinates all game systems
 */

class Game {
  import TempleCollision from './js/buildings/TempleCollision.js';

  constructor() {
    // Game state
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();
    this.prevTime = performance.now();
    
    // Game systems
    this.loadingManager = null;
    this.textureEngine = null;
    this.skyboxManager = null;
    this.groundManager = null;
    this.lightingManager = null;
    this.atmosphericEffects = null;
    this.collisionManager = null;
    this.playerController = null;
    this.dialogManager = null;
    this.questManager = null;
    this.musicManager = null;

    // Building systems
    this.templesManager = null;
    this.templeCollision = null;
    this.buildingsManager = null;
    this.structuresManager = null;
    this.decorationsManager = null;
    
    // Instrument systems
    this.stringedManager = null;
    this.windManager = null;
    this.percussionManager = null;
    
    // Initialize game
    this.init();
  }
  
  async init() {
    // Create loading manager first
    this.loadingManager = new LoadingManager();
    
     // Create scene with a default sky color
this.scene = new THREE.Scene();
this.scene.background = null; // Set a default sky color
this.scene.fog = new THREE.FogExp2(CONFIG.world.fogColor, CONFIG.world.fogDensity);

    // Setup camera
    this.camera = new THREE.PerspectiveCamera(
      CONFIG.camera.fov,
      window.innerWidth / window.innerHeight,
      CONFIG.camera.near,
      CONFIG.camera.far
    );
    console.log("Camera near/far planes:", CONFIG.camera.near, CONFIG.camera.far);
    this.camera.position.set(10, CONFIG.player.height, 20);
    
    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('canvas'),
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    
    // Initialize game systems
     // Initialize game systems
this.textureEngine = new TextureEngine(this.renderer, this.scene, this.loadingManager.getManager());

// Load textures first
await this.textureEngine.loadAllTextures();

this.musicManager = new MusicManager();

// Create core environment managers
this.skyboxManager = new SkyboxManager(this.scene, this.textureEngine);

this.lightingManager = new LightingManager(this.scene);
this.groundManager = new GroundManager(this.scene, this.textureEngine);
this.atmosphericEffects = new AtmosphericEffects(this.scene);

// Create interaction managers
this.collisionManager = new CollisionManager();
this.dialogManager = new DialogManager();
this.questManager = new QuestManager();
this.playerController = new PlayerController(this.camera, this.scene, this.collisionManager);

// Set ground level for collision detection
this.collisionManager.setGroundLevel(0);

    // Create instrument managers
    this.stringedManager = new StringedManager(this.scene, this.textureEngine);
    this.windManager = new WindManager(this.scene, this.textureEngine);
    this.percussionManager = new PercussionManager(this.scene, this.textureEngine);
    
    // Make some managers global for other systems to access
    window.collisionManager = this.collisionManager;
    window.isDialogOpen = false;
    window.stringedManager = this.stringedManager;
    window.windManager = this.windManager;
    window.percussionManager = this.percussionManager;
    
    // Create building managers
    this.buildingsManager = new BuildingsManager(this.scene, this.textureEngine, this.collisionManager);
    this.structuresManager = new StructuresManager(this.scene, this.textureEngine, this.collisionManager);
    this.decorationsManager = new DecorationsManager(this.scene, this.textureEngine, this.collisionManager);
    this.templesManager = new TemplesManager(
      this.scene,
      this.textureEngine,
      this.collisionManager,
      this.playerController,
      this.questManager,
      this.dialogManager
    );
    
    // Setup world
    await this.setupWorld();
    
    // Improve materials with PBR properties
    this.textureEngine.enhanceMaterialsForPBR();
      if (this.skyboxManager.skybox) {    this.skyboxManager.skybox.material.side = THREE.BackSide;   }
    this.textureEngine.applyTexturesToMaterials();
    
    // Fix colliders
    this.collisionManager.fixProblemColliders();
    
    // Window resize handler
    window.addEventListener('resize', this.onWindowResize.bind(this));
    
    // Make sure everything is ready before starting animation
    console.log("Starting animation loop");
    this.prevTime = performance.now();
    // Start game loop
    this.animate();
    
  }
  
  initCollisionSystem() {
    console.log("Initializing enhanced collision system...");
    
    // Make sure ground level is set properly
    if (this.groundManager && this.groundManager.groundLevel !== undefined) {
      this.collisionManager.setGroundLevel(this.groundManager.groundLevel);
      console.log(`Set ground level to ${this.groundManager.groundLevel}`);
    } else {
      console.warn("Could not get ground level from groundManager, using default");
      this.collisionManager.setGroundLevel(0);
    }
    
    // Fix any colliders that might be problematic
    this.collisionManager.fixProblemColliders();
    
    // Remove colliders that are below ground
    const removedCount = this.collisionManager.cleanupBelowGroundColliders();
    console.log(`Removed ${removedCount} invalid colliders from below ground`);
    
    // Visualize colliders in debug mode
    if (CONFIG.debug && CONFIG.debug.showColliders) {
      console.log("Creating visual debug meshes for colliders");
      this.collisionManager.createDebugMeshes(this.scene);
    }
    
    // Set the player at a safe starting position on the Agora platform (height adjusted)
    // The platform is at y=0.5 and has thickness of 1, so we position at 2.5 (platform top is at y=1 plus player height)
    this.playerController.setPosition(5, 2.5, 15);
    
    console.log(`Collision system initialized with ${this.collisionManager.colliders.length} colliders`);
  }
  // Continued from the previous code

// Add this to setupWorld method:
async setupWorld() {
// Create environment
await this.skyboxManager.createSkybox();
this.lightingManager.setupLighting();
this.groundManager.createGround();
this.atmosphericEffects.createAtmosphericEffects();

// Enhance materials after loading all textures
this.lightingManager.enhanceMarbleMaterials(this.scene);

// Create city structures
await this.setupCityStructures();
// Initialize temple collision system
this.templeCollision = new TempleCollision(this.scene, this.collisionManager, this.questManager, this.dialogManager);
this.templeCollision.setup(this.templesManager.templeGroup, this.playerController);
// Make it globally accessible
window.templeCollision = this.templeCollision;
// Initialize collision system after all structures are loaded
this.initCollisionSystem();

// Fix collision system after all structures are loaded
this.fixCollisions();
}



fixCollisions() {
// Check for problem colliders
this.collisionManager.fixProblemColliders();

// Remove any colliders that might be below the ground
const removedCount = this.collisionManager.cleanupBelowGroundColliders();
console.log(`Removed ${removedCount} invalid colliders`);

// Debug: Uncomment the next line to visualize all colliders
// this.collisionManager.createDebugMeshes(this.scene);

// Set player position to a safe starting location
this.playerController.setPosition(5, CONFIG.player.height, 15);

console.log(`Total colliders in world: ${this.collisionManager.colliders.length}`);
}

// Update the animate method to use the advanced collision system
animate() {
  // Request next frame at the beginning to ensure smooth animation even if errors occur
  this._animationFrameId = requestAnimationFrame(this.animate.bind(this));
  
  try {
    const time = performance.now();
    const delta = Math.min((time - this.prevTime) / 1000, 0.1); // Cap delta time
    
    // Update managers
    if (!this.dialogManager.isOpen()) {
      this.playerController.update(delta);
    }
    
    // Update skybox first
    if (this.skyboxManager) {
      this.skyboxManager.update(time);
      if (this.skyboxManager.skybox && this.camera) {
        this.skyboxManager.skybox.position.copy(this.camera.position);
      }
    }
    
    // Update other systems
    if (this.lightingManager) this.lightingManager.update(time);
    if (this.atmosphericEffects) this.atmosphericEffects.update(time, delta);
    if (this.questManager && this.camera) this.questManager.update(this.camera);
    
    // Update temple manager and check portal activation - NEW

    // Update temple collision detection and portal effects
if (this.templeCollision && this.playerController) {
  this.templeCollision.update(time, this.playerController.position);
  }
    
    // Render only if all required objects exist
    if (this.renderer && this.scene && this.camera) {
      // Clear any previous renders
      this.renderer.clear();
      
      // Render the scene
      this.renderer.render(this.scene, this.camera);
    }
    
    this.prevTime = time;
  } catch (error) {
    console.error("Error in animation loop:", error);
    // Continue animation loop despite errors
  }
}
  
  async setupCityStructures() {
    // Create main agora and public spaces
    this.structuresManager.createStructures();
    
    // Create buildings
    this.buildingsManager.createBuildings();
    
    // Create decorations
    this.decorationsManager.createDecorations();
    
    // Create temple
    await this.templesManager.createTempleOfApollo();

    console.log("All city structures created");
  }
  
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  // Add this method to Game class
cleanup() {
// Stop animation loop
if (this._animationFrameId) {
  cancelAnimationFrame(this._animationFrameId);
  this._animationFrameId = null;
}

// Dispose of renderer
if (this.renderer) {
  this.renderer.dispose();
  this.renderer.forceContextLoss();
  this.renderer.domElement = null;
  this.renderer = null;
}

// Clear scene
if (this.scene) {
  this.disposeScene(this.scene);
  this.scene = null;
}

// Clear references
this.camera = null;
this.clock = null;
}

// Helper to properly dispose of scenes
disposeScene(scene) {
scene.traverse((object) => {
  if (object.isMesh) {
    if (object.geometry) {
      object.geometry.dispose();
    }
    
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach(material => this.disposeMaterial(material));
      } else {
        this.disposeMaterial(object.material);
      }
    }
  }
});
}

disposeMaterial(material) {
// Dispose textures
for (const key of Object.keys(material)) {
  const value = material[key];
  if (value && typeof value === 'object' && 'minFilter' in value) {
    value.dispose();
  }
}

// Dispose material itself
material.dispose();
}

  animate() {
          // Request next frame at the beginning to ensure smooth animation even if errors occur

    this._animationFrameId = requestAnimationFrame(this.animate.bind(this));

    
    try {
      const time = performance.now();
      const delta = Math.min((time - this.prevTime) / 1000, 0.1); // Cap delta time
      
      // Update managers
      if (!this.dialogManager.isOpen()) {
        this.playerController.update(delta);
      }
      
      // Update skybox first
      if (this.skyboxManager) {
        this.skyboxManager.update(time);
        if (this.skyboxManager.skybox && this.camera) {
          this.skyboxManager.skybox.position.copy(this.camera.position);
        }
      }
      
      // Update other systems
      if (this.lightingManager) this.lightingManager.update(time);
      if (this.atmosphericEffects) this.atmosphericEffects.update(time, delta);
      if (this.questManager && this.camera) this.questManager.update(this.camera);
      
      // Render only if all required objects exist
      if (this.renderer && this.scene && this.camera) {
        // Clear any previous renders
        this.renderer.clear();
        
        // Render the scene
        this.renderer.render(this.scene, this.camera);
      }
      
      this.prevTime = time;
    } catch (error) {
      console.error("Error in animation loop:", error);
      // Continue animation loop despite errors
    }
  }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
});