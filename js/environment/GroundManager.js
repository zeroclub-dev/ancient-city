/**
 * GroundManager
 * Handles creation and management of ground and terrain
 */
class GroundManager {
  constructor(scene, textureEngine) {
    this.scene = scene;
    this.textureEngine = textureEngine;
    this.ground = null;
    this.groundLevel = 0; // Default ground level
  }
  
  
  createGround() {
  // Create terrain geometry
  const groundGeometry = new THREE.PlaneGeometry(500, 500, 2, 2);
  groundGeometry.rotateX(-Math.PI / 2);
  
  // Create height variations
  const positions = groundGeometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const z = positions[i + 2];
    
    // Keep center area flatter for city
    const distFromCenter = Math.sqrt(x * x + z * z);
    let height = 0;
    
    if (distFromCenter > 50) {

      // Perlin-like noise for rolling hills outside city
      height = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2;
      height += Math.sin(x * 0.01 + z * 0.01) * 3;
      
      // Add more height at edges
      const edgeFactor = (distFromCenter - 50) / 200;
      height += edgeFactor * 10;
    }
    positions[i + 1] = height;
  }
  
  // Update normals for proper lighting
  groundGeometry.computeVertexNormals();
  
  // FIX: Use the grass texture from the texture engine
  const { grassTexture } = this.textureEngine.getTextures();
  const groundMaterial = new THREE.MeshStandardMaterial({
    map: grassTexture,
    roughness: 1.0,
    metalness: 0,
  });
  
  // Set proper texture repeat for the large ground
  if (grassTexture) {
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(50, 50); // Adjust repeating to cover large ground area
  }
  
  // Create ground mesh
  this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
  this.ground.receiveShadow = true;
  this.scene.add(this.ground);
  
  // Set ground level in collision system
  if (window.collisionManager) {
    window.collisionManager.setGroundLevel(this.groundLevel);
  }
  
  // Add a ground plane collider for accurate collision detection
  this.addGroundCollider();
  
  // Add terrain details
  this.addTerrainDetails();
  
  // Ensure ground has proper collision properties
  this.ensureProperFloorCollisions();
}
  ensureProperFloorCollisions() {
    // Make sure the ground has a name for identification in raycasts
    if (this.ground) {
      this.ground.name = "terrain";
      
      // Add a specific userData value to help identify it
      this.ground.userData.isGround = true;
    }
  }
  

  // Add a new method to create a ground plane collider
  addGroundCollider() {
    if (window.collisionManager) {
      // Add ground plane as a special collider type
      window.collisionManager.ground = {
        y: this.groundLevel,
        width: 500,
        depth: 500
      };
      
      console.log("Added ground plane collider at y =", this.groundLevel);
    }
  }
  
  createGroundTexture(groundMaterial) {
    // Create custom ground texture
    const groundCanvas = document.createElement('canvas');
    groundCanvas.width = 1024;
    groundCanvas.height = 1024;
    const groundContext = groundCanvas.getContext('2d');
    
    // Base sand/dirt color
    groundContext.fillStyle = '#91814D';
    groundContext.fillRect(0, 0, 1024, 1024);
    
    // Add noise and variation
    for (let i = 0; i < 80000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const size = Math.random() * 3 + 1;
      
      // Vary the soil/ground colors
      const colorVariation = Math.random() * 20;
      groundContext.fillStyle = `rgba(${145 + colorVariation}, ${129 + colorVariation}, ${77 + colorVariation}, 0.5)`;
      groundContext.beginPath();
      groundContext.arc(x, y, size, 0, Math.PI * 2);
      groundContext.fill();
    }
    
    // Add some small rocks
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const size = Math.random() * 4 + 2;
      
      groundContext.fillStyle = `rgba(${100 + Math.random() * 30}, ${100 + Math.random() * 30}, ${100 + Math.random() * 30}, 0.8)`;
      groundContext.beginPath();
      groundContext.arc(x, y, size, 0, Math.PI * 2);
      groundContext.fill();
    }
    
    // Create some paths in the texture
    this.createGroundPaths(groundContext);
    
    // Create texture from canvas
    const groundTextureMap = new THREE.CanvasTexture(groundCanvas);
    groundTextureMap.wrapS = THREE.RepeatWrapping;
    groundTextureMap.wrapT = THREE.RepeatWrapping;
    groundTextureMap.repeat.set(10, 10);
    groundMaterial.map = groundTextureMap;
    
    // Create displacement and roughness maps
    this.createGroundDisplacementMap(groundMaterial);
  }
  
  createGroundPaths(groundContext) {
    const pathCount = 5;
    for (let i = 0; i < pathCount; i++) {
      const startX = Math.random() * 1024;
      const startY = Math.random() * 1024;
      
      groundContext.strokeStyle = 'rgba(180, 160, 120, 0.7)';
      groundContext.lineWidth = 10 + Math.random() * 20;
      groundContext.beginPath();
      groundContext.moveTo(startX, startY);
      
      let currentX = startX;
      let currentY = startY;
      const pathSegments = 10 + Math.floor(Math.random() * 10);
      
      for (let j = 0; j < pathSegments; j++) {
        currentX += (Math.random() * 200 - 100);
        currentY += (Math.random() * 200 - 100);
        groundContext.lineTo(currentX, currentY);
      }
      groundContext.stroke();
    }
  }
  
  createGroundDisplacementMap(groundMaterial) {
    const displacementCanvas = document.createElement('canvas');
    displacementCanvas.width = 1024;
    displacementCanvas.height = 1024;
    const displacementContext = displacementCanvas.getContext('2d');
    
    // Fill with base value
    displacementContext.fillStyle = '#808080';
    displacementContext.fillRect(0, 0, 1024, 1024);
    
    // Add noise for displacement
    for (let i = 0; i < 10000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const size = Math.random() * 10 + 5;
      const brightness = Math.random() * 50;
      
      displacementContext.fillStyle = `rgba(${128 + brightness}, ${128 + brightness}, ${128 + brightness}, 0.5)`;
      displacementContext.beginPath();
      displacementContext.arc(x, y, size, 0, Math.PI * 2);
      displacementContext.fill();
    }
    
    const displacementMap = new THREE.CanvasTexture(displacementCanvas);
    displacementMap.wrapS = THREE.RepeatWrapping;
    displacementMap.wrapT = THREE.RepeatWrapping;
    displacementMap.repeat.set(10, 10);
    
    groundMaterial.displacementMap = displacementMap;
    groundMaterial.displacementScale = 0.5;
    groundMaterial.roughnessMap = displacementMap;
  }
  
  addTerrainDetails() {
    // Add rocks, trees, bushes, etc.
    this.addRocks();
    this.addTrees();
    this.addBushes();
    this.addCypressTrees();
  }
  
  addRocks() {
    const rockGeometry = new THREE.DodecahedronGeometry(1, 1);
    const rockMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.9,
      metalness: 0.1
    });
    
    for (let i = 0; i < 100; i++) {
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      
      // Position rocks around outside of city
      const angle = Math.random() * Math.PI * 2;
      const radius = 60 + Math.random() * 150;
      
      // Get height at this position for proper placement
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      let y = 0;
      
      // Find approximate terrain height at this position
      if (this.ground && this.ground.geometry) {
        const distFromCenter = Math.sqrt(x * x + z * z);
        if (distFromCenter > 50) {
          // Use same height calculation as in createGround
          y = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2;
          y += Math.sin(x * 0.01 + z * 0.01) * 3;
          const edgeFactor = (distFromCenter - 50) / 200;
          y += edgeFactor * 10;
        }
      }
      
      // Ensure rocks are positioned on the ground, not below it
      rock.position.set(
        x,
        y + 0.5, // Place half above ground for natural look
        z
      );
      rock.scale.set(
        Math.random() * 2 + 0.5,
        Math.random() * 2 + 0.5,
        Math.random() * 2 + 0.5
      );
      rock.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.scene.add(rock);
      
      // Add to collision manager if needed
      if (rock.scale.x > 1.5) {
        // This will need to be integrated with the collision system
        if (window.collisionManager) {
          window.collisionManager.addCollider({
            position: rock.position.clone(),
            radius: 1 * Math.max(rock.scale.x, rock.scale.z),
            type: 'sphere' // Explicitly specify type
          });
        }
      }
    }
  }
  
  addTrees() {
    for (let i = 0; i < 40; i++) {
      const tree = this.createTree();
      
      // Position trees around outside of city
      const angle = Math.random() * Math.PI * 2;
      const radius = 70 + Math.random() * 150;
      
      // Get height at this position for proper placement
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      let y = 0;
      
      // Find approximate terrain height at this position
      if (this.ground && this.ground.geometry) {
        const distFromCenter = Math.sqrt(x * x + z * z);
        if (distFromCenter > 50) {
          // Use same height calculation as in createGround
          y = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2;
          y += Math.sin(x * 0.01 + z * 0.01) * 3;
          const edgeFactor = (distFromCenter - 50) / 200;
          y += edgeFactor * 10;
        }
      }
      
      tree.position.set(x, y, z);
      this.scene.add(tree);
      
      // Add to collision manager if needed
      if (window.collisionManager) {
        window.collisionManager.addCollider({
          position: new THREE.Vector3(x, y, z),
          radius: 1.2,
          type: 'sphere' // Explicitly specify type
        });
      }
    }
  }
  
  createTree() {
    const treeGroup = new THREE.Group();
    
    // Create trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.4, 2.5, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.9,
      metalness: 0.1
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1.25;
    trunk.castShadow = true;
    treeGroup.add(trunk);
    
    // Create foliage
    const foliageGeometry = new THREE.SphereGeometry(1.5, 10, 10);
    const foliageMaterial = new THREE.MeshStandardMaterial({
      color: 0x567d46,
      roughness: 0.9
    });
    
    // Create multiple layers of foliage
    for (let i = 0; i < 3; i++) {
      const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
      foliage.position.y = 2.5 + i * 0.7;
      foliage.scale.set(1 - i * 0.2, 0.8, 1 - i * 0.2);
      foliage.castShadow = true;
      treeGroup.add(foliage);
    }
    
    return treeGroup;
  }
  
  addBushes() {
    const bushGeometry = new THREE.SphereGeometry(1, 8, 8);
    const bushMaterial = new THREE.MeshStandardMaterial({
      color: 0x566D31,
      roughness: 0.9
    });

    for (let i = 0; i < 120; i++) {
      const bush = new THREE.Mesh(bushGeometry, bushMaterial);
      
      // Position some bushes inside city, some outside
      const angle = Math.random() * Math.PI * 2;
      const radius = 20 + Math.random() * 180;
      
      // Get height at this position for proper placement
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      let y = 0;
      
      // Find approximate terrain height at this position
      if (this.ground && this.ground.geometry) {
        const distFromCenter = Math.sqrt(x * x + z * z);
        if (distFromCenter > 50) {
          // Use same height calculation as in createGround
          y = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2;
          y += Math.sin(x * 0.01 + z * 0.01) * 3;
          const edgeFactor = (distFromCenter - 50) / 200;
          y += edgeFactor * 10;
        }
      }
      
      // Position bush properly on ground
      bush.position.set(
        x,
        y + 0.5, // Half of the bush above ground
        z
      );
      bush.scale.set(
        Math.random() * 1 + 0.5,
        Math.random() * 1 + 0.5,
        Math.random() * 1 + 0.5
      );
      bush.castShadow = true;
      bush.receiveShadow = true;
      this.scene.add(bush);
      
      // Add smaller bushes as colliders too
      if (bush.scale.x > 0.8 && window.collisionManager) {
        window.collisionManager.addCollider({
          position: bush.position.clone(),
          radius: 0.8 * Math.max(bush.scale.x, bush.scale.z),
          type: 'sphere'
        });
      }
    }
  }
  
  addCypressTrees() {
    for (let i = 0; i < 20; i++) {
      const cypress = this.createCypressTree();
      
      // Position around city
      const angle = Math.random() * Math.PI * 2;
      const radius = 40 + Math.random() * 120;
      
      // Get height at this position for proper placement
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      let y = 0;
      
      // Find approximate terrain height at this position
      if (this.ground && this.ground.geometry) {
        const distFromCenter = Math.sqrt(x * x + z * z);
        if (distFromCenter > 50) {
          // Use same height calculation as in createGround
          y = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2;
          y += Math.sin(x * 0.01 + z * 0.01) * 3;
          const edgeFactor = (distFromCenter - 50) / 200;
          y += edgeFactor * 10;
        }
      }
      
      cypress.position.set(x, y, z);
      this.scene.add(cypress);
      
      // Add to collision manager if needed
      if (window.collisionManager) {
        window.collisionManager.addCollider({
          position: new THREE.Vector3(x, y, z),
          radius: 1,
          type: 'sphere'
        });
      }
    }
  }
  
  createCypressTree() {
    const cypressGroup = new THREE.Group();
    
    // Create trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.15, 0.3, 1.5, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({
      color: 0x5D4037,
      roughness: 0.9,
      metalness: 0.1
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 0.75;
    trunk.castShadow = true;
    cypressGroup.add(trunk);
    
    // Create cypress cone shape
    const coneGeometry = new THREE.ConeGeometry(0.8, 5, 8);
    const coneMaterial = new THREE.MeshStandardMaterial({
      color: 0x33691E,
      roughness: 0.9
    });
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    cone.position.y = 4;
    cone.castShadow = true;
    cypressGroup.add(cone);
    
    return cypressGroup;
  }
}