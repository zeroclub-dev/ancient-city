/**
 * PlayerController
 * Handles player movement, camera controls, and physics
 */
class PlayerController {
  constructor(camera, scene, collisionManager) {
    this.camera = camera;
    this.scene = scene;
    this.collisionManager = collisionManager;
    
    // Movement state
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.canJump = false;
    this.isSprinting = false;
    
    // Physics
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.position = new THREE.Vector3();
    
    // Camera controls
    this.pitch = 0; // Looking up/down (x-rotation)
    this.yaw = 0;   // Looking left/right (y-rotation)
    
    // Mouse sensitivity
    this.mouseSensitivity = 0.002;
    
    // Lock state
    this.isLocked = false;
    
    // Motion smoothing
    this.smoothingFactor = 0.9;
    this.smoothVelocity = new THREE.Vector3();

    // Interactive objects
    this.interactiveObjects = [];
    this.interactionDistance = 3;
    this.raycastDirection = new THREE.Vector3();
    this.raycaster = new THREE.Raycaster();
    
    // Initialize controls
    this.initPointerLock();
    this.initKeyboardControls();
    
    // Initialize position
    this.position.copy(this.camera.position);
  }
  
  initPointerLock() {
    // Get DOM elements
    const blocker = document.getElementById('blocker');
    const instructions = document.getElementById('instructions');
    
    // If elements don't exist, create them
    if (!blocker || !instructions) {
      console.log("Creating pointer lock UI elements");
      this.createPointerLockUI();
    } else {
      // Use existing elements
      this.setupPointerLockEvents(blocker, instructions);
    }
  }
  
  createPointerLockUI() {
    // Create blocker element if it doesn't exist
    let blocker = document.getElementById('blocker');
    if (!blocker) {
      blocker = document.createElement('div');
      blocker.id = 'blocker';
      blocker.style.position = 'absolute';
      blocker.style.width = '100%';
      blocker.style.height = '100%';
      blocker.style.backgroundColor = 'rgba(0,0,0,0.5)';
      blocker.style.display = 'flex';
      blocker.style.alignItems = 'center';
      blocker.style.justifyContent = 'center';
      blocker.style.zIndex = '999';
      document.body.appendChild(blocker);
    }
    
    // Create instructions element if it doesn't exist
    let instructions = document.getElementById('instructions');
    if (!instructions) {
      instructions = document.createElement('div');
      instructions.id = 'instructions';
      instructions.style.width = '50%';
      instructions.style.padding = '20px';
      instructions.style.backgroundColor = 'rgba(0,0,0,0.75)';
      instructions.style.color = '#ffffff';
      instructions.style.textAlign = 'center';
      instructions.style.borderRadius = '10px';
      instructions.style.cursor = 'pointer';
      instructions.innerHTML = '<p>Click to explore the ancient Greek world</p><p>Move: WASD / Arrow Keys</p><p>Sprint: Shift</p><p>Jump: Space</p><p>Interact: E</p>';
      blocker.appendChild(instructions);
    }
    
    // Set up event listeners
    this.setupPointerLockEvents(blocker, instructions);
  }
  
  setupPointerLockEvents(blocker, instructions) {
    // Click event to request pointer lock
    instructions.addEventListener('click', () => {
      console.log("Instructions clicked, requesting pointer lock");
      // Use document.body for better compatibility
      document.body.requestPointerLock = document.body.requestPointerLock || 
                                         document.body.mozRequestPointerLock ||
                                         document.body.webkitRequestPointerLock;
      document.body.requestPointerLock();
    });
    
    // Setup pointer lock change event
    const lockChangeEvent = () => {
      console.log("Pointer lock change event fired");
      if (document.pointerLockElement === document.body || 
          document.mozPointerLockElement === document.body ||
          document.webkitPointerLockElement === document.body) {
        // Pointer locked
        console.log("Pointer is locked, hiding blocker");
        blocker.style.display = 'none';
        this.isLocked = true;
      } else {
        // Pointer unlocked
        console.log("Pointer is unlocked, showing blocker");
        blocker.style.display = 'flex';
        this.isLocked = false;
      }
    };
    
    // Add all vendor-prefixed versions
    document.addEventListener('pointerlockchange', lockChangeEvent, false);
    document.addEventListener('mozpointerlockchange', lockChangeEvent, false);
    document.addEventListener('webkitpointerlockchange', lockChangeEvent, false);
    
    // Handle pointer lock error
    document.addEventListener('pointerlockerror', () => {
      console.error("Pointer lock error");
      alert("Pointer lock failed! Your browser might be blocking this feature.");
    }, false);
    
    // Mouse move event for camera control
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
  }
  
  onMouseMove(event) {
    if (!this.isLocked) return;
    
    // Apply mouse sensitivity and get movement deltas
    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
    
    // Update yaw (horizontal rotation) - this is around the Y axis
    this.yaw -= movementX * this.mouseSensitivity;
    
    // Update pitch (vertical rotation) - this is around the X axis
    // Limit the pitch to avoid flipping
    this.pitch -= movementY * this.mouseSensitivity;
    this.pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, this.pitch));
    
    // Apply rotations to camera
    this.camera.rotation.order = 'YXZ'; // This order is important!
    this.camera.rotation.x = this.pitch;
    this.camera.rotation.y = this.yaw;
  }
  
  initKeyboardControls() {
    document.addEventListener('keydown', (event) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.moveForward = true;
          break;
          
        case 'ArrowLeft':
        case 'KeyA':
          this.moveLeft = true;  // FIXED: This is for moving left
          break;
          
        case 'ArrowDown':
        case 'KeyS':
          this.moveBackward = true;
          break;
          
        case 'ArrowRight':
        case 'KeyD':
          this.moveRight = true;  // FIXED: This is for moving right
          break;
          
        case 'ShiftLeft':
        case 'ShiftRight':
          this.isSprinting = true;
          break;
          
        case 'Space':
          if (this.canJump) {
            this.velocity.y = CONFIG.player.jumpStrength;
            this.canJump = false;
          }
          break;
          
        case 'KeyE':
          this.interact();
          break;
          
        case 'Escape':
          // Handle escape key (optional)
          if (document.exitPointerLock) {
            document.exitPointerLock();
          }
          break;
      }
    });
    
    document.addEventListener('keyup', (event) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.moveForward = false;
          break;
          
        case 'ArrowLeft':
        case 'KeyA':
          this.moveLeft = false;  // FIXED: This is for moving left
          break;
          
        case 'ArrowDown':
        case 'KeyS':
          this.moveBackward = false;
          break;
          
        case 'ArrowRight':
        case 'KeyD':
          this.moveRight = false;  // FIXED: This is for moving right
          break;
          
        case 'ShiftLeft':
        case 'ShiftRight':
          this.isSprinting = false;
          break;
      }
    });
  }
  
  update(delta) {
    if (!this.isLocked || window.isDialogOpen) return;
    
    // Store previous position for collision detection
    const previousPosition = this.position.clone();
    
    // Apply gravity
    this.velocity.y -= CONFIG.player.gravity * delta;
    
    // Initialize movement vector
    const movement = new THREE.Vector3(0, 0, 0);
    
    // Get camera's forward and right vectors (on the horizontal plane)
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    forward.y = 0; // Keep movement horizontal
    forward.normalize();
    
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
    right.y = 0; // Keep movement horizontal
    right.normalize();
    
    // Set a very high base speed
    const baseSpeed = 3;
    const currentSpeed = this.isSprinting ? baseSpeed * 1.5 : baseSpeed;
    
    // Apply movement directly based on keys pressed
    if (this.moveForward) {
      movement.add(forward.clone().multiplyScalar(currentSpeed * delta));
    }
    if (this.moveBackward) {
      movement.add(forward.clone().multiplyScalar(-currentSpeed * delta));
    }
    if (this.moveRight) {
      movement.add(right.clone().multiplyScalar(currentSpeed * delta));
    }
    if (this.moveLeft) {
      movement.add(right.clone().multiplyScalar(-currentSpeed * delta));
    }
    
    // Apply movement directly to position (no smoothing)
    this.position.add(movement);
    
    // Apply vertical velocity (gravity/jumping)
    this.position.y += this.velocity.y * delta;
    
    // Check for ground/floor collision with raycasting
  this.raycaster.ray.origin.copy(this.position);
  this.raycaster.ray.direction.set(0, -1, 0);  // Down direction
  
  // Create an array of objects to check for floor collision
  const floorObjects = [];
  if (this.scene) {
    this.scene.traverse((object) => {
      if (object.isMesh && 
          (object.name.toLowerCase().includes('ground') || 
           object.name.toLowerCase().includes('floor') || 
           object.name.toLowerCase().includes('platform') ||
           object.name.toLowerCase().includes('terrain') ||
           (object.userData && object.userData.isFloor))) {
        floorObjects.push(object);
      }
    });

    }
    
    // Check ground collision
    if (floorObjects.length > 0) {
      const intersects = this.raycaster.intersectObjects(floorObjects);
      
      if (intersects.length > 0 && intersects[0].distance < CONFIG.player.height) {
        const floorY = intersects[0].point.y;
        
        // If we're below or at floor level
        if (this.position.y < floorY + CONFIG.player.height / 2 + 0.01) {
          this.velocity.y = 0;
          this.position.y = floorY + CONFIG.player.height / 2;
          this.canJump = true;
        }
      } else {
        // Use ground level if no floor hit
        const floorY = this.collisionManager.groundY;
        
        if (this.position.y <= floorY + CONFIG.player.height / 2) {
          this.velocity.y = 0;
          this.position.y = floorY + CONFIG.player.height / 2;
          this.canJump = true;
        }
      }
    } else {
      // No floor objects, use ground level
      const floorY = this.collisionManager.groundY;
      
      if (this.position.y <= floorY + CONFIG.player.height / 2) {
        this.velocity.y = 0;
        this.position.y = floorY + CONFIG.player.height / 2;
        this.canJump = true;
      }
    }
    
    // Check for collisions with objects
    const collisionResult = this.collisionManager.checkCollisionWithSliding(
      this.position,
      new THREE.Vector3(movement.x, this.velocity.y, movement.z),
      CONFIG.player.radius,
      CONFIG.player.height
    );
    
    // Update position based on collision result
    this.position.copy(collisionResult.position);
    
    // Update camera position
    this.camera.position.copy(this.position);
    
    // Update interactive object indicators
    this.updateInteractionIndicators();
  }
  
  // Interactive objects management
  addInteractiveObject(object) {
    if (!this.interactiveObjects) {
      this.interactiveObjects = [];
    }
    
    // Add interactive object
    this.interactiveObjects.push({
      object: object.object,
      position: object.position || object.object?.position?.clone() || new THREE.Vector3(),
      onInteract: object.interact || (() => {}),
      name: object.name || 'Object',
      radius: object.radius || 2.0,
      indicator: this.createInteractionIndicator(object.name || 'Interact')
    });
    
    return this.interactiveObjects[this.interactiveObjects.length - 1];
  }
  
  removeInteractiveObject(object) {
    const index = this.interactiveObjects.findIndex(item => item.object === object);
    if (index !== -1) {
      // Remove indicator from scene
      if (this.interactiveObjects[index].indicator && this.scene) {
        this.scene.remove(this.interactiveObjects[index].indicator);
      }
      
      // Remove from array
      this.interactiveObjects.splice(index, 1);
    }
  }
  
  createInteractionIndicator(label) {
    // Create floating indicator for interactive object
    const indicatorGroup = new THREE.Group();
    
    // Add visual indicator (simple arrow or sphere)
    const indicatorGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const indicatorMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.7
    });
    const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
    indicatorGroup.add(indicator);
    
    // Text label would be implemented here if needed with canvas or sprite
    
    // Hide initially
    indicatorGroup.visible = false;
    this.scene.add(indicatorGroup);
    
    return indicatorGroup;
  }
  
  updateInteractionIndicators() {
    if (!this.interactiveObjects || !this.camera) return;
    
    // Get camera direction for raycasting
    this.camera.getWorldDirection(this.raycastDirection);
    
    // Hide all indicators by default
    this.interactiveObjects.forEach(item => {
      if (item.indicator) item.indicator.visible = false;
    });
    
    // Find closest interactive object in view
    let closestObject = null;
    let closestDistance = Infinity;
    
    this.interactiveObjects.forEach(item => {
      // Calculate distance and angle to object
      const distanceVector = new THREE.Vector3().subVectors(item.position, this.camera.position);
      const distance = distanceVector.length();
      
      // Check if within interaction distance
      if (distance < item.radius) {
        // Normalize for angle calculation
        const normalizedDistance = distanceVector.clone().normalize();
        
        // Calculate dot product with camera direction
        const dotProduct = normalizedDistance.dot(this.raycastDirection);
        
        // Check if in front of camera (dot product > 0.7)
        // and closer than previously found objects
        if (dotProduct > 0.7 && distance < closestDistance) {
          closestDistance = distance;
          closestObject = item;
        }
      }
    });
    
    // Show indicator for closest object
    if (closestObject && closestObject.indicator) {
      closestObject.indicator.position.copy(closestObject.position);
      closestObject.indicator.position.y += 0.5; // Float above object
      closestObject.indicator.visible = true;
      
      // Store reference to closest for interaction
      this.closestInteractiveObject = closestObject;
    } else {
      this.closestInteractiveObject = null;
    }
  }
  
  interact() {
    if (this.closestInteractiveObject && !window.isDialogOpen) {
      // Call interaction handler
      if (typeof this.closestInteractiveObject.onInteract === 'function') {
        this.closestInteractiveObject.onInteract();
      } else {
        console.warn("Interactive object has no valid interaction handler:", this.closestInteractiveObject);
      }
    }
  }
  
  // Helper methods
  setPosition(x, y, z) {
    this.position.set(x, y, z);
    this.camera.position.copy(this.position);
  }
  
  setRotation(pitch, yaw) {
    this.pitch = pitch;
    this.yaw = yaw;
    
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.x = this.pitch;
    this.camera.rotation.y = this.yaw;
  }
  
  lookAt(target) {
    // Calculate direction vector
    const direction = new THREE.Vector3().subVectors(target, this.camera.position).normalize();
    
    // Calculate yaw (horizontal angle)
    this.yaw = Math.atan2(-direction.x, -direction.z);
    
    // Calculate pitch (vertical angle)
    const horizontalDistance = Math.sqrt(direction.x * direction.x + direction.z * direction.z);
    this.pitch = Math.atan2(direction.y, horizontalDistance);
    
    // Apply to camera
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.x = this.pitch;
    this.camera.rotation.y = this.yaw;
  }
}