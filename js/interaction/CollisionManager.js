/**
 * CollisionManager
 * Handles collision detection between player and environment
 */
class CollisionManager {
  constructor() {
    this.colliders = [];
    this.problemColliders = [];
    this.groundY = 0; // Default ground level
  }
  
  setGroundLevel(y) {
    this.groundY = y;
  }
  
  addCollider(collider) {
    if (!collider.position) {
      console.warn("Attempted to add collider without position:", collider);
      this.problemColliders.push(collider);
      return;
    }
    
    // Add to active colliders
    this.colliders.push({
      position: collider.position.clone(),
      radius: collider.radius || 1.0,
      height: collider.height || 2.0,
      type: collider.type || 'sphere'
    });
  }
  
  removeCollider(position) {
    const index = this.colliders.findIndex(
      c => c.position.distanceTo(position) < 0.1
    );
    
    if (index !== -1) {
      this.colliders.splice(index, 1);
      return true;
    }
    
    return false;
  }
  
  /**
   * Check and resolve collisions with sliding
   * @param {THREE.Vector3} position - Current position
   * @param {THREE.Vector3} velocity - Current velocity
   * @param {number} radius - Player radius
   * @param {number} height - Player height
   * @returns {Object} - Collision info with adjusted position and velocity
   */
  checkCollisionWithSliding(position, velocity, radius, height = 2.0) {
    // Start with current position and velocity
    const adjustedPosition = position.clone();
    const adjustedVelocity = velocity.clone();
    
    // Check ground collision first (with a small buffer to prevent falling through)
    if (adjustedPosition.y - (height / 2) < this.groundY + 0.01) {
      adjustedPosition.y = this.groundY + (height / 2);
      adjustedVelocity.y = 0;
    }
    
    // Check each collider for collision
    let hasCollision = false;
    
    for (let i = 0; i < this.colliders.length; i++) {
      const collider = this.colliders[i];
      
      if (collider.type === 'sphere') {
        // Sphere-to-sphere collision
        const distance = adjustedPosition.distanceTo(collider.position);
        const combinedRadius = radius + collider.radius;
        
        if (distance < combinedRadius) {
          hasCollision = true;
          
          // Calculate penetration depth
          const penetration = combinedRadius - distance;
          
          // If we're not right on top, calculate normal for sliding
          if (distance > 0.001) {
            // Calculate collision normal
            const normal = new THREE.Vector3()
              .subVectors(adjustedPosition, collider.position)
              .normalize();
            
            // Move player out of collision along normal
            adjustedPosition.add(normal.clone().multiplyScalar(penetration * 1.01));
            
            // Adjust velocity to slide along the surface
            const velocityDotNormal = adjustedVelocity.dot(normal);
            if (velocityDotNormal < 0) {
              adjustedVelocity.sub(normal.multiplyScalar(velocityDotNormal));
            }
          } else {
            // If we're right on top, just move slightly up
            adjustedPosition.y += penetration * 1.01;
          }
        }
      } else if (collider.type === 'box') {
        // Box collision handling (approximate with AABB)
        const boxSize = new THREE.Vector3(
          collider.width || 2,
          collider.height || 2,
          collider.depth || 2
        );
        
        // Get min/max for collider box
        const boxMin = new THREE.Vector3(
          collider.position.x - boxSize.x / 2,
          collider.position.y,
          collider.position.z - boxSize.z / 2
        );
        
        const boxMax = new THREE.Vector3(
          collider.position.x + boxSize.x / 2,
          collider.position.y + boxSize.y,
          collider.position.z + boxSize.z / 2
        );
        
        // Check AABB collision
        const playerMin = new THREE.Vector3(
          adjustedPosition.x - radius,
          adjustedPosition.y - height / 2,
          adjustedPosition.z - radius
        );
        
        const playerMax = new THREE.Vector3(
          adjustedPosition.x + radius,
          adjustedPosition.y + height / 2,
          adjustedPosition.z + radius
        );
        
        if (playerMin.x <= boxMax.x && playerMax.x >= boxMin.x &&
            playerMin.y <= boxMax.y && playerMax.y >= boxMin.y &&
            playerMin.z <= boxMax.z && playerMax.z >= boxMin.z) {
          
          hasCollision = true;
          
          // Find the penetration depth for each axis
          const penetrations = [
            boxMax.x - playerMin.x, // right penetration
            playerMax.x - boxMin.x, // left penetration
            boxMax.y - playerMin.y, // top penetration
            playerMax.y - boxMin.y, // bottom penetration
            boxMax.z - playerMin.z, // back penetration
            playerMax.z - boxMin.z  // front penetration
          ];
          
          // Find minimum penetration
          let minPenetration = penetrations[0];
          let minPenetrationIndex = 0;
          
          for (let j = 1; j < penetrations.length; j++) {
            if (penetrations[j] < minPenetration) {
              minPenetration = penetrations[j];
              minPenetrationIndex = j;
            }
          }
          
          // Create normal based on min penetration axis
          const normal = new THREE.Vector3();
          switch (minPenetrationIndex) {
            case 0: normal.set(-1, 0, 0); break;  // right
            case 1: normal.set(1, 0, 0); break;   // left
            case 2: normal.set(0, -1, 0); break;  // top
            case 3: normal.set(0, 1, 0); break;   // bottom
            case 4: normal.set(0, 0, -1); break;  // back
            case 5: normal.set(0, 0, 1); break;   // front
          }
          
          // Adjust position by the smallest penetration
          adjustedPosition.add(normal.clone().multiplyScalar(minPenetration * 1.01));
          
          // Adjust velocity for sliding
          const velocityDotNormal = adjustedVelocity.dot(normal);
          if (velocityDotNormal < 0) {
            adjustedVelocity.sub(normal.multiplyScalar(velocityDotNormal));
          }
        }
      }
    }
    
    return {
      position: adjustedPosition,
      velocity: adjustedVelocity,
      hasCollision: hasCollision
    };
  }
  
  /**
   * Simplified collision check without resolution
   */
  checkCollision(position, radius) {
    for (let i = 0; i < this.colliders.length; i++) {
      const collider = this.colliders[i];
      
      if (collider.type === 'sphere') {
        // Sphere-to-sphere collision
        const distance = position.distanceTo(collider.position);
        if (distance < (radius + collider.radius)) {
          return {
            collider: collider,
            position: collider.position,
            normal: new THREE.Vector3().subVectors(position, collider.position).normalize()
          };
        }
       } else if (collider.type === 'box') {
          // More accurate box collision check
          const boxMin = new THREE.Vector3(
            collider.position.x - (collider.width || 1) / 2,
            collider.position.y - (collider.height || 1) / 2,
            collider.position.z - (collider.depth || 1) / 2
          );
          
          const boxMax = new THREE.Vector3(
            collider.position.x + (collider.width || 1) / 2,
            collider.position.y + (collider.height || 1) / 2,
            collider.position.z + (collider.depth || 1) / 2
          );
          
          // Check if the position is inside the box
          const playerMin = new THREE.Vector3(
            position.x - radius,
            position.y - radius,
            position.z - radius
          );
          
          const playerMax = new THREE.Vector3(
            position.x + radius,
            position.y + radius,
            position.z + radius
          );
          
          if (!(playerMax.x < boxMin.x || playerMin.x > boxMax.x ||
                playerMax.y < boxMin.y || playerMin.y > boxMax.y ||
                playerMax.z < boxMin.z || playerMin.z > boxMax.z)) {
            return {
              collider: collider,
              position: collider.position,
              normal: new THREE.Vector3().subVectors(position, collider.position).normalize()
            };
          }
       }
      }
    
    return null;
  }
  
  fixProblemColliders() {
    // Try to fix any colliders that had issues when added
    if (this.problemColliders.length > 0) {
      console.log(`Attempting to fix ${this.problemColliders.length} problem colliders`);
      
      for (let i = this.problemColliders.length - 1; i >= 0; i--) {
        const collider = this.problemColliders[i];
        
        // If the object has a position now, add it properly
        if (collider.object && collider.object.position) {
          this.addCollider({
            position: collider.object.position.clone(),
            radius: collider.radius || 1.0
          });
          
          // Remove from problem list
          this.problemColliders.splice(i, 1);
        }
      }
      
      console.log(`${this.problemColliders.length} problem colliders remaining`);
    }
  }
  
  getColliderAt(position, maxDistance = 1.0) {
    for (let i = 0; i < this.colliders.length; i++) {
      const distance = position.distanceTo(this.colliders[i].position);
      if (distance < maxDistance) {
        return this.colliders[i];
      }
    }
    
    return null;
  }
  
  /**
   * Remove colliders that are below the ground
   */
  cleanupBelowGroundColliders() {
    const buffer = 0.1; // Small buffer to allow for legitimate near-ground colliders
    let removedCount = 0;
    
    for (let i = this.colliders.length - 1; i >= 0; i--) {
      // Check if collider is below ground level
      if (this.colliders[i].position.y < this.groundY - buffer) {
        console.log(`Removing below-ground collider at position: 
                    ${this.colliders[i].position.x.toFixed(2)}, 
                    ${this.colliders[i].position.y.toFixed(2)}, 
                    ${this.colliders[i].position.z.toFixed(2)}`);
        this.colliders.splice(i, 1);
        removedCount++;
      }
    }
    
    if (removedCount > 0) {
      console.log(`Removed ${removedCount} colliders that were below ground level`);
    }
    
    return removedCount;
  }
  
  // Debug visualization
  createDebugMeshes(scene) {
    // Create visual indicators for all colliders
    this.colliders.forEach(collider => {
      const geometry = new THREE.SphereGeometry(collider.radius, 16, 16);
      const material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true,
        transparent: true,
        opacity: 0.3
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(collider.position);
      scene.add(mesh);
    });
  }
}