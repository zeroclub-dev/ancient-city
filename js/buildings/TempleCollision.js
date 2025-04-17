/**
 * TempleCollision.js
 * Specialized collision handling for Temple elements to ensure
 * proper collision detection and portal events
 */
class TempleCollision {
    constructor(scene, collisionManager, questManager, dialogManager) {
      this.scene = scene;
      this.collisionManager = collisionManager;
      this.questManager = questManager;
      this.dialogManager = dialogManager;
  // Temple structure references
  this.templeGroup = null;
  this.portalObject = null;
  this.portalActive = false;
  
  // Temple position
  this.templeX = -40;
  this.templeZ = 40;
  this.groundY = this.calculateGroundY(this.templeX, this.templeZ);
  
  // Important collision areas
  this.platformColliders = [];
  this.stairsColliders = [];
  this.portalTriggerZone = null;
  
  // Player reference
  this.player = null;
  
  // Debug flag
  this.debugMode = false;
  }
  calculateGroundY(x, z) {
  // Same height calculation used in TemplesManager
  let groundY = 0;
  const distFromCenter = Math.sqrt(x * x + z * z);
  if (distFromCenter > 80) {
    groundY = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 0.5;
    groundY += Math.sin(x * 0.01 + z * 0.01) * 0.75;
    const edgeFactor = (distFromCenter - 80) / 400;
    groundY += edgeFactor * 4;
  }
  
  return groundY;
  }
  setup(templeGroup, playerController) {
  console.log("Setting up Temple Collision handling");
  this.templeGroup = templeGroup;
  this.player = playerController;
  // Find portal object
  this.findPortalObject();
  
  // Setup temple floor collisions
  this.setupTempleFloorCollisions();
  
  // Setup stairs with proper collision (correcting the backwards stairs)
  this.setupStairCollisions();
  
  // Setup portal trigger zone
  this.setupPortalTrigger();
  
  // Mark temple found in quest manager
  if (this.questManager) {
    this.questManager.setTempleFound(true);
  }
  
  // Create temple keeper NPC for interaction
  this.createTempleKeeper();
  
  console.log("Temple Collision setup complete");
  
  return this;
  }
  findPortalObject() {
  if (!this.templeGroup) return;
  // Find portal object in temple group
  this.templeGroup.traverse((object) => {
    // Look for the portal ring (a torus geometry)
    if (object.geometry && object.geometry.type === 'TorusGeometry' && 
        object.geometry.parameters.radius >= 1.5) {
      // Found the portal ring
      let parent = object.parent;
      if (parent) {
        this.portalObject = parent;
        console.log("Found portal object:", this.portalObject);
      }
    }
  });
  }
  setupTempleFloorCollisions() {
  if (!this.templeGroup || !this.collisionManager) return;
  // Remove any existing temple floor colliders to avoid duplicates
  this.cleanupExistingColliders();
  
  // Create main temple platform collider (with solid surfaces)
  this.addTempleFloorCollider();
  
  // Create interior floor collider
  this.addTempleInteriorCollider();
  
  // Fix any problematic colliders
  this.collisionManager.fixProblemColliders();
  }
  cleanupExistingColliders() {
  // Remove existing temple floor related colliders that might be problematic
  if (this.collisionManager.colliders) {
  const tempColliders = [...this.collisionManager.colliders];
    for (let i = tempColliders.length - 1; i >= 0; i--) {
      const collider = tempColliders[i];
      
      // Check if collider is related to temple floor
      const isTempleFloor = 
        collider.userData && 
        (collider.userData.isFloor || collider.name === "temple_floor");
      
      // Check if collider is in temple position
      const isInTemplePosition = 
        collider.position && 
        Math.abs(collider.position.x - this.templeX) < 20 && 
        Math.abs(collider.position.z - this.templeZ) < 20;
      
      if (isTempleFloor || isInTemplePosition) {
        this.collisionManager.removeCollider(collider.position);
      }
    }
  }
  }
  addTempleFloorCollider() {
  // Add solid collider for main temple platform
  const platformCollider = {
  position: new THREE.Vector3(this.templeX, this.groundY + 0.75, this.templeZ),
  radius: 15,
  type: 'box',
  width: 30,
  height: 0.5,
  depth: 20,
  name: "temple_platform",
  userData: { isFloor: true }
  };
  this.collisionManager.addCollider(platformCollider);
  this.platformColliders.push(platformCollider);
  
  console.log("Added main temple platform collider at y:", this.groundY + 0.75);
  }
  addTempleInteriorCollider() {
  // Add collider for interior floor that's higher than the platform
  const interiorFloorCollider = {
  position: new THREE.Vector3(this.templeX, this.groundY + 1.6, this.templeZ),
  radius: 10,
  type: 'box',
  width: 19.5,
  height: 0.5,
  depth: 19.5,
  name: "temple_interior_floor",
  userData: { isFloor: true }
  };
  this.collisionManager.addCollider(interiorFloorCollider);
  this.platformColliders.push(interiorFloorCollider);
  
  console.log("Added temple interior floor collider at y:", this.groundY + 1.6);
  }
  setupStairCollisions() {
  // FIX: Correct the backwards stairs issue
  // Create proper stairs in front of the temple for the portal
  // Create portal platform collider
  const portalPlatformHeight = 1.0; // Height of the portal platform
  const portalPlatform = {
    position: new THREE.Vector3(this.templeX, this.groundY + portalPlatformHeight/2, this.templeZ + 14),
    radius: 5,
    type: 'box',
    width: 10,
    height: portalPlatformHeight,
    depth: 5,
    name: "portal_platform",
    userData: { isFloor: true }
  };
  
  this.collisionManager.addCollider(portalPlatform);
  this.platformColliders.push(portalPlatform);
  
  // Create stair colliders - FIX for backwards stairs
  const stepCount = 4;
  const stepHeight = portalPlatformHeight / stepCount;
  const stepDepth = 0.8;
  const stepWidth = 4;
  
  // Create steps leading UP to the portal platform
  for (let i = 0; i < stepCount; i++) {
    const stepCollider = {
      position: new THREE.Vector3(
        this.templeX, 
        this.groundY + (i + 0.5) * stepHeight, 
        // Position steps CORRECTLY in front of the platform with proper depth
        this.templeZ + 14 + 2.5 + (stepCount - i - 0.5) * stepDepth
      ),
      type: 'box',
      width: stepWidth,
      height: stepHeight,
      depth: stepDepth,
      name: `portal_step_${i}`,
      userData: { isFloor: true }
    };
    
    this.collisionManager.addCollider(stepCollider);
    this.stairsColliders.push(stepCollider);
  }
  
  console.log("Added portal stairs colliders (fixed direction)");
  }
  setupPortalTrigger() {
  // Create a specialized trigger zone for the portal
  const portalPlatformHeight = 1.0;
  this.portalTriggerZone = {
    position: new THREE.Vector3(this.templeX, this.groundY + portalPlatformHeight + 1, this.templeZ + 14),
    radius: 2, // Reasonably sized trigger area
    isActive: true,
    name: "portal_trigger"
  };
  
  // Add portal trigger to player controller for interaction
  if (this.player) {
    const portalInteraction = this.player.addInteractiveObject({
      position: this.portalTriggerZone.position.clone(),
      name: "Portal to Temple Interior",
      radius: 3,
      interact: () => this.activatePortal()
    });
    
    // Store reference to the created interactive object
    this.portalTriggerObject = portalInteraction;
  }
  
  console.log("Portal trigger zone created at position:", this.portalTriggerZone.position);
  }
  createTempleKeeper() {
  if (!this.player || !this.dialogManager) return;
  // Create temple keeper position - near entrance
  const keeperPos = new THREE.Vector3(
    this.templeX, 
    this.groundY, 
    this.templeZ + 10 // In front of temple
  );
  
  // Add temple keeper NPC
  const keeperInteraction = this.player.addInteractiveObject({
    position: keeperPos,
    name: "Temple Keeper",
    radius: 3,
    interact: () => {
      // Show dialog when interacting with keeper
      this.dialogManager.showDialog(
        "Temple Keeper",
        "Welcome to the Temple of Apollo! I am the keeper of this sacred place. Inside you will find magnificent examples of ancient Greek instruments. The gods themselves played these instruments. Enter the portal ahead to see our virtual exhibit of these musical treasures."
      );
      
      // Update quest state
      if (this.questManager) {
        this.questManager.setTalkedToKeeper(true);
      }
    }
  });
  
  // Store reference
  this.keeperInteraction = keeperInteraction;
  }
  // Check if player is in the portal zone
  update(time, playerPosition) {
  if (!this.portalTriggerZone || !playerPosition) return;
  // Calculate distance to portal trigger
  const distToPortal = new THREE.Vector3(
    playerPosition.x - this.portalTriggerZone.position.x,
    0, // Ignore Y difference for easier triggering
    playerPosition.z - this.portalTriggerZone.position.z
  ).length();
  
  // Check if player is in trigger zone and portal is active
  if (distToPortal < this.portalTriggerZone.radius && this.portalTriggerZone.isActive) {
    // Check if player is close to the correct height
    const heightDiff = Math.abs(playerPosition.y - this.portalTriggerZone.position.y);
    
    if (heightDiff < 2) { // Reasonable height difference
      this.activatePortal();
    }
  }
  
  // Animate portal if it exists
  if (this.portalObject) {
    this.animatePortal(time);
  }
  }
  animatePortal(time) {
  if (!this.portalObject) return;
  // Traverse to find portal components
  this.portalObject.traverse((object) => {
    // Animate portal surface (the glowing part)
    if (object.isMesh && object.material && object.material.transparent) {
      // Pulse opacity
      object.material.opacity = 0.5 + 0.3 * Math.sin(time * 0.002);
      
      // Slow rotation
      if (object.rotation) {
        object.rotation.z = time * 0.0005;
      }
    }
  });
  
  // Subtle floating animation for the entire portal
  if (this.portalObject.position) {
    this.portalObject.position.y = (this.groundY + 1) + Math.sin(time * 0.001) * 0.1;
  }
  }
  activatePortal() {
  // Prevent multiple activations
  if (this.portalActive) return;
  console.log("Portal activated!");
  this.portalActive = true;
  
  // Disable further triggers
  if (this.portalTriggerZone) {
    this.portalTriggerZone.isActive = false;
  }
  
  // Show dialog for effect
  if (this.dialogManager) {
    this.dialogManager.showDialog(
      "Portal", 
      "Entering the Temple of Apollo's sacred chamber of instruments..."
    );
  }
  
  // Portal effect - brighten the portal
  if (this.portalObject) {
    this.portalObject.traverse((object) => {
      if (object.isMesh && object.material) {
        if (object.material.emissive) {
          object.material.emissiveIntensity = 1.0;
        }
        if (object.material.color) {
          object.material.color.setHex(0xffffff);
        }
      }
    });
  }
  
  // Create flash effect
  this.createPortalFlash();
  
  // Wait for effect, then redirect
  setTimeout(() => {
    window.location.href = 'temple.html';
  }, 2000);
  }
  createPortalFlash() {
  // Create a dramatic flash effect when portal activates
  if (!this.scene || !this.portalTriggerZone) return;
  // Create a bright point light at portal position
  const flashLight = new THREE.PointLight(0xffffff, 5, 30);
  flashLight.position.copy(this.portalTriggerZone.position);
  this.scene.add(flashLight);
  
  // Fade out effect
  const fadeOut = () => {
    flashLight.intensity -= 0.2;
    if (flashLight.intensity > 0) {
      setTimeout(fadeOut, 50);
    } else {
      this.scene.remove(flashLight);
    }
  };
  
  // Start fade after a short delay
  setTimeout(fadeOut, 200);
  }
  // Debug method to visualize colliders
  debugVisualizeColliders() {
  if (!this.scene || !this.debugMode) return;
  // Create visual indicators for all temple colliders
  const debugMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true,
    transparent: true,
    opacity: 0.3
  });
  
  // Visualize platform colliders
  this.platformColliders.forEach(collider => {
    const boxGeometry = new THREE.BoxGeometry(
      collider.width, 
      collider.height, 
      collider.depth
    );
    const debugMesh = new THREE.Mesh(boxGeometry, debugMaterial);
    debugMesh.position.copy(collider.position);
    this.scene.add(debugMesh);
  });
  
  // Visualize stair colliders
  this.stairsColliders.forEach(collider => {
    const boxGeometry = new THREE.BoxGeometry(
      collider.width, 
      collider.height, 
      collider.depth
    );
    const debugMesh = new THREE.Mesh(boxGeometry, debugMaterial);
    debugMesh.position.copy(collider.position);
    this.scene.add(debugMesh);
  });
  
  // Visualize portal trigger
  if (this.portalTriggerZone) {
    const sphereGeometry = new THREE.SphereGeometry(this.portalTriggerZone.radius, 16, 16);
    const debugMesh = new THREE.Mesh(sphereGeometry, 
      new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true,
        transparent: true,
        opacity: 0.3
      })
    );
    debugMesh.position.copy(this.portalTriggerZone.position);
    this.scene.add(debugMesh);
  }
  }
  }