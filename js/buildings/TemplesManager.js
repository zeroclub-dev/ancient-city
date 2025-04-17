/**
 * TemplesManager
 * Handles creation and management of temple structures and portals
 */
class TemplesManager {
  constructor(scene, textureEngine, collisionManager, playerController, questManager, dialogManager) {
    this.scene = scene;
    this.textureEngine = textureEngine;
    this.collisionManager = collisionManager;
    this.playerController = playerController;
    this.questManager = questManager;
    this.dialogManager = dialogManager;
    
    this.templeGroup = null;
    this.portalActive = false;
    this.platformCollider = null;
    this.portalTrigger = null;
    this.portalObject = null;
  }
  
  async createTempleOfApollo() {
    this.templeGroup = new THREE.Group();
    
    // Get textures from texture engine
    const { marbleTexture, goldTexture, roofTileTexture } = this.textureEngine.getTextures();
    
    // Position temple near the plaza/agora
    const templeX = -40;
    const templeZ = 40;
    const groundY = 0;
    
    // Calculate ground height at the temple position
    const distFromCenter = Math.sqrt(templeX * templeX + templeZ * templeZ);
    if (distFromCenter > 80) {
      // Use same height calculation as in ground manager (with reduced values)
      groundY = Math.sin(templeX * 0.05) * Math.cos(templeZ * 0.05) * 0.5;
      groundY += Math.sin(templeX * 0.01 + templeZ * 0.01) * 0.75;
      const edgeFactor = (distFromCenter - 80) / 400;
      groundY += edgeFactor * 4;
    }
    
    // Create approach pathway
    this.createApproachPath(templeX, groundY, templeZ, marbleTexture);
    
    // Create temple platform (stylobate) with steps
    this.createTemplePlatform(groundY, marbleTexture);
    
    // Create temple columns around perimeter
    this.createTempleColumns(groundY, marbleTexture);
    
    // Create entablature (top of columns)
    this.createEntablature(groundY, marbleTexture);
    
    // Create roof structure
    this.createRoof(groundY, roofTileTexture);
    
    // Create pediments (triangular parts under the roof)
    this.createPediments(groundY, marbleTexture);
    
    // Create temple interior with solid floor
    this.createTempleInterior(groundY, marbleTexture);
    
    // Create Apollo statue inside
    this.createApolloStatue(groundY, marbleTexture, goldTexture);
    
    // Create portal platform in front of the temple with stairs
    this.createPortalPlatform(groundY, goldTexture, marbleTexture);
    
    // Add lighting to emphasize the temple
    this.addTempleLighting();
    
    // Position the temple
    this.templeGroup.position.set(templeX, 0, templeZ);
    
    // Add temple to the scene
    this.scene.add(this.templeGroup);
    
    // Create temple glow
    const templeGlow = new THREE.PointLight(0xffffdd, 0.8, 50);
    templeGlow.position.set(templeX, 10 + groundY, templeZ);
    this.scene.add(templeGlow);
    
    // Add golden marker arrow pointing to the temple (quest marker)
    if (this.questManager) {
      this.questManager.createQuestMarker(new THREE.Vector3(templeX, 15 + groundY, templeZ + 5));
    }
    
    // Add collider for the temple building
    this.collisionManager.addCollider({
      position: new THREE.Vector3(templeX, 0.75 + groundY, templeZ),
      radius: 15,
      type: 'box',
      width: 30,
      height: 10, // Increased to prevent jumping over
      depth: 20
    });
    
    console.log("Temple of Apollo created at position:", templeX, groundY, templeZ);
    
    return this.templeGroup;
  }
  
  createApproachPath(templeX, groundY, templeZ, marbleTexture) {
    // Create a path from the agora to the temple
    const pathLength = 40; // Length of the path
    const pathWidth = 8;   // Width of the path
    
    const pathGeometry = new THREE.BoxGeometry(pathLength, 0.5, pathWidth);
    const pathMaterial = new THREE.MeshStandardMaterial({
      color: 0xeeeedd,
      map: marbleTexture,
      roughness: 0.6,
      metalness: 0.1
    });
    
    const path = new THREE.Mesh(pathGeometry, pathMaterial);
    
    // Position path between agora (0,0,0) and temple
    const pathX = templeX / 2;
    const pathZ = templeZ / 2;
    
    path.position.set(0, groundY + 0.25, 0);
    path.receiveShadow = true;
    
    // Calculate angle to point the path toward the temple
    const angle = Math.atan2(templeZ, templeX);
    path.rotation.y = angle;
    
    // Position path to connect agora and temple
    const distance = Math.sqrt(templeX * templeX + templeZ * templeZ);
    const offsetDistance = distance / 2;
    
    path.position.x = offsetDistance * Math.cos(angle);
    path.position.z = offsetDistance * Math.sin(angle);
    path.position.y = groundY + 0.25; // Slightly above ground
    
    this.scene.add(path);
    
    // Add some torches along the path
    this.addPathTorches(templeX, groundY, templeZ, angle, distance);
  }
  
  addPathTorches(templeX, groundY, templeZ, angle, distance) {
    // Add torches on both sides of the path
    const torchCount = 5;
    const torchSpacing = distance / (torchCount + 1);
    const pathWidth = 5; // Half-width of the path for torch placement
    
    for (let i = 1; i <= torchCount; i++) {
      const distanceAlongPath = i * torchSpacing;
      
      // Calculate positions
      const x = distanceAlongPath * Math.cos(angle);
      const z = distanceAlongPath * Math.sin(angle);
      
      // Calculate offset perpendicular to path direction
      const offsetX = Math.cos(angle + Math.PI/2) * pathWidth;
      const offsetZ = Math.sin(angle + Math.PI/2) * pathWidth;
      
      // Create left torch
      const leftTorch = this.createTorch();
      leftTorch.position.set(
        x + offsetX,
        groundY,
        z + offsetZ
      );
      this.scene.add(leftTorch);
      
      // Create right torch
      const rightTorch = this.createTorch();
      rightTorch.position.set(
        x - offsetX,
        groundY,
        z - offsetZ
      );
      this.scene.add(rightTorch);
      
      // Add colliders for torches
      this.collisionManager.addCollider({
        position: new THREE.Vector3(x + offsetX, groundY, z + offsetZ),
        radius: 0.5
      });
      
      this.collisionManager.addCollider({
        position: new THREE.Vector3(x - offsetX, groundY, z - offsetZ),
        radius: 0.5
      });
      
      // Add point lights for torches
      const leftLight = new THREE.PointLight(0xffaa55, 1, 10);
      leftLight.position.set(x + offsetX, groundY + 3, z + offsetZ);
      this.scene.add(leftLight);
      
      const rightLight = new THREE.PointLight(0xffaa55, 1, 10);
      rightLight.position.set(x - offsetX, groundY + 3, z - offsetZ);
      this.scene.add(rightLight);
    }
  }
  
  createTorch() {
    const torchGroup = new THREE.Group();
    
    // Create torch base
    const baseGeometry = new THREE.CylinderGeometry(0.2, 0.3, 3, 8);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.9,
      metalness: 0.1
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 1.5;
    base.castShadow = true;
    torchGroup.add(base);
    
    // Create torch bowl
    const bowlGeometry = new THREE.CylinderGeometry(0.5, 0.3, 0.5, 8);
    const bowlMaterial = new THREE.MeshStandardMaterial({
      color: 0x775533,
      roughness: 0.7,
      metalness: 0.3
    });
    const bowl = new THREE.Mesh(bowlGeometry, bowlMaterial);
    bowl.position.y = 3.2;
    bowl.castShadow = true;
    torchGroup.add(bowl);
    
    // Create flame
    const flameGeometry = new THREE.SphereGeometry(0.4, 8, 8);
    const flameMaterial = new THREE.MeshBasicMaterial({
      color: 0xff9900,
      transparent: true,
      opacity: 0.9
    });
    const flame = new THREE.Mesh(flameGeometry, flameMaterial);
    flame.position.y = 3.6;
    flame.scale.y = 1.5;
    torchGroup.add(flame);
    
    return torchGroup;
  }
  
  createTemplePlatform(groundY, marbleTexture) {
    // Create main temple platform with steps
    const platformGeometry = new THREE.BoxGeometry(30, 1.5, 20);
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = 0.75 + groundY; // Position half height above ground
    platform.receiveShadow = true;
    this.templeGroup.add(platform);
    
    // Create steps
    const steps = [
      { width: 32, depth: 22, height: 0.4, y: 0.2 },
      { width: 31, depth: 21, height: 0.4, y: 0.6 }
    ];
    
    const stepMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    
    steps.forEach(stepData => {
      const stepGeometry = new THREE.BoxGeometry(stepData.width, stepData.height, stepData.depth);
      const step = new THREE.Mesh(stepGeometry, stepMaterial);
      step.position.y = stepData.y + groundY;
      step.receiveShadow = true;
      this.templeGroup.add(step);
      
      // Add collision for steps
      this.collisionManager.addCollider({
        position: new THREE.Vector3(this.templeGroup.position.x, stepData.y + groundY, this.templeGroup.position.z),
        radius: Math.max(stepData.width, stepData.depth)/2,
        type: 'box',
        width: stepData.width,
        height: stepData.height,
        depth: stepData.depth
      });
    });
  }
  
  createTempleColumns(groundY, marbleTexture) {
    // Front and back rows
    for (let i = 0; i < 6; i++) {
      const xPos = -12.5 + i * 5;
      
      // Front columns
      const frontColumn = this.createColumn(5, marbleTexture);
      frontColumn.position.set(xPos, 1.5 + groundY, 9);
      this.templeGroup.add(frontColumn);
      
      // Add collision for column
      this.collisionManager.addCollider({
        position: new THREE.Vector3(xPos + this.templeGroup.position.x, groundY, 9 + this.templeGroup.position.z),
        radius: 0.8
      });
      
      // Back columns (except for the middle to create entrance)
      if (i !== 2 && i !== 3) {
        const backColumn = this.createColumn(5, marbleTexture);
        backColumn.position.set(xPos, 1.5 + groundY, -9);
        this.templeGroup.add(backColumn);
        
        // Add collision for column
        this.collisionManager.addCollider({
          position: new THREE.Vector3(xPos + this.templeGroup.position.x, groundY, -9 + this.templeGroup.position.z),
          radius: 0.8
        });
      }
    }
    
    // Side columns
    for (let i = 1; i < 4; i++) {
      const zPos = 9 - i * 6;
      
      // Left side columns
      const leftColumn = this.createColumn(5, marbleTexture);
      leftColumn.position.set(-12.5, 1.5 + groundY, zPos);
      this.templeGroup.add(leftColumn);
      
      // Add collision for column
      this.collisionManager.addCollider({
        position: new THREE.Vector3(-12.5 + this.templeGroup.position.x, groundY, zPos + this.templeGroup.position.z),
        radius: 0.8
      });
      
      // Right side columns
      const rightColumn = this.createColumn(5, marbleTexture);
      rightColumn.position.set(12.5, 1.5 + groundY, zPos);
      this.templeGroup.add(rightColumn);
      
      // Add collision for column
      this.collisionManager.addCollider({
        position: new THREE.Vector3(12.5 + this.templeGroup.position.x, groundY, zPos + this.templeGroup.position.z),
        radius: 0.8
      });
    }
  }
  
  createColumn(height, marbleTexture) {
    const columnGroup = new THREE.Group();
    
    // Base
    const baseGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.3, 32);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.15; // Half height above ground
    base.castShadow = true;
    base.receiveShadow = true;
    columnGroup.add(base);
    
    // Shaft
    const shaftGeometry = new THREE.CylinderGeometry(0.6, 0.7, height, 32, 6, false);
    const shaftMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    
    // Create bump map for fluting effect
    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 512;
    bumpCanvas.height = 512;
    const ctx = bumpCanvas.getContext('2d');
    
    // Create fluting pattern using canvas
    const flutingCount = 24;
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);
    
    for (let i = 0; i < flutingCount; i++) {
      const angle = (i / flutingCount) * Math.PI * 2;
      const x = 256 + Math.cos(angle) * 200;
      const width = 512 / flutingCount;
      
      // Create gradient for each flute
      const gradient = ctx.createLinearGradient(x - width/2, 0, x + width/2, 0);
      gradient.addColorStop(0, '#808080');
      gradient.addColorStop(0.5, '#ffffff');
      gradient.addColorStop(1, '#808080');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x - width/2, 0, width, 512);
    }
    
    // Create bump map from canvas
    const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
    shaftMaterial.bumpMap = bumpTexture;
    shaftMaterial.bumpScale = 0.05;
    
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
    shaft.position.y = height/2 + 0.3; // Position on top of base
    shaft.castShadow = true;
    columnGroup.add(shaft);
    
    // Capital
    const capitalGeometry = new THREE.CylinderGeometry(0.9, 0.6, 0.4, 32);
    const capitalMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    const capital = new THREE.Mesh(capitalGeometry, capitalMaterial);
    capital.position.y = height + 0.5; // Position on top of shaft
    capital.castShadow = true;
    columnGroup.add(capital);
    
    // Add details to capital (simplified Ionic volutes)
    const voluteGeometry = new THREE.TorusGeometry(0.15, 0.05, 8, 16, Math.PI);
    const voluteMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    
    // Left volute
    const leftVolute = new THREE.Mesh(voluteGeometry, voluteMaterial);
    leftVolute.position.set(-0.45, height + 0.5, 0);
    leftVolute.rotation.y = Math.PI / 2;
    columnGroup.add(leftVolute);
    
    // Right volute
    const rightVolute = new THREE.Mesh(voluteGeometry, voluteMaterial);
    rightVolute.position.set(0.45, height + 0.5, 0);
    rightVolute.rotation.y = -Math.PI / 2;
    columnGroup.add(rightVolute);
    
    // Top abacus
    const abacusGeometry = new THREE.BoxGeometry(1.8, 0.3, 1.8);
    const abacusMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    const abacus = new THREE.Mesh(abacusGeometry, abacusMaterial);
    abacus.position.y = height + 0.7; // Position on top of capital
    abacus.castShadow = true;
    columnGroup.add(abacus);
    
    return columnGroup;
  }
  
  createEntablature(groundY, marbleTexture) {
    const entablatureGeometry = new THREE.BoxGeometry(30, 1.5, 20);
    const entablatureMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    const entablature = new THREE.Mesh(entablatureGeometry, entablatureMaterial);
    entablature.position.y = 7.5 + groundY; // Position on top of columns
    entablature.castShadow = true;
    entablature.receiveShadow = true;
    this.templeGroup.add(entablature);
  }
  
  createRoof(groundY, roofTileTexture) {
    const roofGeometry = new THREE.CylinderGeometry(0.1, 0.1, 30, 4, 1, false, Math.PI / 4, Math.PI / 2);
    roofGeometry.rotateZ(Math.PI / 2);
    roofGeometry.scale(1, 3, 20);
    const roofMaterial = new THREE.MeshStandardMaterial({
      map: roofTileTexture,
      roughness: 0.7,
      metalness: 0.1
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 9.5 + groundY; // Position on top of entablature
    roof.castShadow = true;
    this.templeGroup.add(roof);
  }
  
  createPediments(groundY, marbleTexture) {
    const pedimentGeometry = new THREE.CylinderGeometry(0.1, 0.1, 30, 3, 1, false, 0, Math.PI);
    pedimentGeometry.rotateZ(Math.PI / 2);
    pedimentGeometry.rotateY(Math.PI / 2);
    pedimentGeometry.scale(1, 1.8, 1);
    const pedimentMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    
    // Front pediment
    const frontPediment = new THREE.Mesh(pedimentGeometry, pedimentMaterial);
    frontPediment.position.set(0, 8.75 + groundY, 10);
    frontPediment.castShadow = true;
    this.templeGroup.add(frontPediment);
    
    // Back pediment
    const backPediment = new THREE.Mesh(pedimentGeometry, pedimentMaterial);
    backPediment.position.set(0, 8.75 + groundY, -10);
    backPediment.rotation.y = Math.PI;
    backPediment.castShadow = true;
    this.templeGroup.add(backPediment);
  }
  
  createTempleInterior(groundY, marbleTexture) {
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xfafafa,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    
    // Side walls
    const sideWallGeometry = new THREE.BoxGeometry(0.5, 5, 14);
    
    // Left wall
    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    leftWall.position.set(-9.75, 4 + groundY, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    this.templeGroup.add(leftWall);
    
    // Right wall
    const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    rightWall.position.set(9.75, 4 + groundY, 0);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    this.templeGroup.add(rightWall);
    
    // Back wall
    const backWallGeometry = new THREE.BoxGeometry(20, 5, 0.5);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(0, 4 + groundY, -9.75);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    this.templeGroup.add(backWall);
    
    // Create interior floor - This is the key addition for standing on
    const floorGeometry = new THREE.BoxGeometry(19.5, 0.2, 19.5);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      map: marbleTexture,
      roughness: 0.4,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = 1.6 + groundY; // Position on top of platform
    floor.receiveShadow = true;
    this.templeGroup.add(floor);
    
    // Add floor collision for player to stand on
    this.ensureTempleFloorCollision(groundY);
  }
  
  // New method to specifically add a floor collider
  ensureTempleFloorCollision(groundY) {
    this.collisionManager.addCollider({
      position: new THREE.Vector3(this.templeGroup.position.x, 1.6 + groundY, this.templeGroup.position.z),
      radius: 10,
      type: 'box',
      width: 19.5,
      height: 0.2, 
      depth: 19.5,
      name: "temple_floor", // Name it for identification
      userData: { isFloor: true } // Flag it as floor for physics/collision
    });
    
    console.log("Added temple floor collision at height:", 1.6 + groundY);
  }
  
  createApolloStatue(groundY, marbleTexture, goldTexture) {
    const statueGroup = new THREE.Group();
    
    // Create base
    const baseGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.5, 32);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.25; // Half height above ground
    base.receiveShadow = true;
    statueGroup.add(base);
    
    // Create statue body
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    
    // Torso
    const torsoGeometry = new THREE.CylinderGeometry(0.6, 0.5, 1.5, 8);
    const torso = new THREE.Mesh(torsoGeometry, bodyMaterial);
    torso.position.y = 1.5; // Position above base
    torso.castShadow = true;
    statueGroup.add(torso);
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.y = 2.7; // Position on top of torso
    head.castShadow = true;
    statueGroup.add(head);
    
    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.2, 8);
    
    // Right arm (holding lyre)
    const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
    rightArm.position.set(0.7, 1.8, 0);
    rightArm.rotation.z = -Math.PI / 4;
    rightArm.castShadow = true;
    statueGroup.add(rightArm);
    
    // Left arm (extended)
    const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
    leftArm.position.set(-0.7, 1.8, 0);
    leftArm.rotation.z = Math.PI / 4;
    leftArm.castShadow = true;
    statueGroup.add(leftArm);
    
    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.5, 8);
    
    // Right leg
    const rightLeg = new THREE.Mesh(legGeometry, bodyMaterial);
    rightLeg.position.set(0.3, 0.75, 0);
    rightLeg.castShadow = true;
    statueGroup.add(rightLeg);
    
    // Left leg
    const leftLeg = new THREE.Mesh(legGeometry, bodyMaterial);
    leftLeg.position.set(-0.3, 0.75, 0);
    leftLeg.castShadow = true;
    statueGroup.add(leftLeg);
    
    // Create small lyre in hand
    const lyreGroup = new THREE.Group();
    
    // Lyre body
    const lyreBodyGeometry = new THREE.CylinderGeometry(0.2, 0.25, 0.4, 16, 1, false, 0, Math.PI);
    const lyreBodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      map: goldTexture,
      roughness: 0.3,
      metalness: 0.8
    });
    const lyreBody = new THREE.Mesh(lyreBodyGeometry, lyreBodyMaterial);
    lyreBody.rotation.y = Math.PI;
    lyreGroup.add(lyreBody);
    
    // Lyre arms
    const lyreArmGeometry = new THREE.TorusGeometry(0.15, 0.03, 8, 12, Math.PI);
    
    // Right arm
    const lyreRightArm = new THREE.Mesh(lyreArmGeometry, lyreBodyMaterial);
    lyreRightArm.position.x = 0.15;
    lyreRightArm.rotation.y = Math.PI / 2;
    lyreGroup.add(lyreRightArm);
    
    // Left arm
    const lyreLeftArm = new THREE.Mesh(lyreArmGeometry, lyreBodyMaterial);
    lyreLeftArm.position.x = -0.15;
    lyreLeftArm.rotation.y = -Math.PI / 2;
    lyreGroup.add(lyreLeftArm);
    
    // Position lyre in hand
    lyreGroup.position.set(1.1, 1.9, 0.2);
    lyreGroup.rotation.x = Math.PI / 2;
    lyreGroup.rotation.z = -Math.PI / 4;
    statueGroup.add(lyreGroup);
    
    // Create laurel wreath
    const laurelGeometry = new THREE.TorusGeometry(0.4, 0.05, 8, 16);
    const laurelMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      map: goldTexture,
      roughness: 0.3,
      metalness: 0.8
    });
    const laurel = new THREE.Mesh(laurelGeometry, laurelMaterial);
    laurel.position.y = 2.8; // Position around head
    laurel.rotation.x = Math.PI / 2;
    statueGroup.add(laurel);
    
    // Position statue
    statueGroup.position.set(0, 1.6 + groundY, -5);
    statueGroup.scale.set(1.5, 1.5, 1.5);
    this.templeGroup.add(statueGroup);
    
    // Add collision for the statue base
    this.collisionManager.addCollider({
      position: new THREE.Vector3(this.templeGroup.position.x, 1.6 + groundY, this.templeGroup.position.z - 5),
      radius: 2.5
    });
    
    return statueGroup;
  }
  
  createPortalPlatform(groundY, goldTexture, marbleTexture) {
    // *** NEW: Create raised platform with stairs ***
    
    // Create main platform - elevated
    const platformHeight = 1.0; // Height of the platform
    const platformGeometry = new THREE.BoxGeometry(10, platformHeight, 5);
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.2
    });
    
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.set(0, groundY + platformHeight/2, 14); // Position in front of temple
    platform.receiveShadow = true;
    this.templeGroup.add(platform);
    
    // Create steps leading up to platform
    this.createPortalSteps(groundY, platformHeight, marbleTexture);
    
    // Create physical portal structure on the platform
    this.createPhysicalPortal(groundY + platformHeight, goldTexture, marbleTexture);
    
    // Register the portal platform as a collider
    this.platformCollider = {
      position: new THREE.Vector3(this.templeGroup.position.x, groundY + platformHeight/2, this.templeGroup.position.z + 14),
      radius: 5,
      type: 'box',
      width: 10,
      height: platformHeight,
      depth: 5
    };
    
    // Add to collision system
    this.collisionManager.addCollider(this.platformCollider);
    
    // Create portal trigger for teleportation
    this.portalTrigger = {
      position: new THREE.Vector3(this.templeGroup.position.x, groundY + platformHeight + 1, this.templeGroup.position.z + 14),
      radius: 2, // Reduced from 4 to 2 to be more precise
      onEnter: () => this.activatePortal()
    };
    
    // Add interaction object for the portal
    this.playerController.addInteractiveObject({
      position: new THREE.Vector3(this.templeGroup.position.x, groundY + platformHeight + 1, this.templeGroup.position.z + 14),
      name: "Portal to Temple Interior",
      radius: 3,
      interact: () => {
        this.dialogManager.showDialog("Portal", "Step into the portal to enter the Temple of Apollo virtual gallery and explore the ancient Greek instruments.");
      }
    });
    
    // Create decorative elements around the portal
    this.createPortalPedestals(groundY + platformHeight, goldTexture, marbleTexture);
    
    // Add portal particles (will be animated)
    this.createPortalParticles(groundY + platformHeight);
  }
  
  createPortalSteps(groundY, platformHeight, marbleTexture) {
    const stepMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    
    // Number of steps
    const stepCount = 4;
    const stepHeight = platformHeight / stepCount;
    const stepDepth = 0.8;
    
    // Create steps on the front side of the platform
    for (let i = 0; i < stepCount; i++) {
      const stepWidth = 4; // Width of the steps
      const stepGeometry = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth);
      const step = new THREE.Mesh(stepGeometry, stepMaterial);
      
      // Position each step
      step.position.set(
        0, // Centered on x-axis
        groundY + (i + 0.5) * stepHeight, // Stacked vertically
        14 + 2.5 + (i + 0.5) * stepDepth // Extend outward from platform
      );
      
      step.receiveShadow = true;
      step.castShadow = true;
      this.templeGroup.add(step);
      
      // Add collision for each step
      this.collisionManager.addCollider({
        position: new THREE.Vector3(
          this.templeGroup.position.x, 
          groundY + (i + 0.5) * stepHeight, 
          this.templeGroup.position.z + 14 + 2.5 + (i + 0.5) * stepDepth
        ),
        type: 'box',
        width: stepWidth,
        height: stepHeight,
        depth: stepDepth
      });
    }
  }
  
  createPhysicalPortal(platformY, goldTexture, marbleTexture) {
    const portalGroup = new THREE.Group();
    
    // Create circular base
    const baseGeometry = new THREE.CylinderGeometry(2.5, 2.5, 0.2, 32);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      map: goldTexture,
      roughness: 0.3,
      metalness: 0.8
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.1; // Just above platform
    base.receiveShadow = true;
    portalGroup.add(base);
    
    // Create portal ring/arch
    const ringGeometry = new THREE.TorusGeometry(2, 0.3, 16, 32, Math.PI * 2);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      map: goldTexture,
      roughness: 0.3,
      metalness: 0.8,
      emissive: 0xffcc77,
      emissiveIntensity: 0.2
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2; // Make it stand upright
    ring.position.y = 2; // Height of the ring
    ring.castShadow = true;
    portalGroup.add(ring);
    
    // Create shimmering portal surface
    const portalGeometry = new THREE.CircleGeometry(1.7, 32);
    const portalMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffaa,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    const portalSurface = new THREE.Mesh(portalGeometry, portalMaterial);
    portalSurface.rotation.x = Math.PI / 2; // Make it stand upright
    portalSurface.position.y = 2; // Same height as ring
    portalGroup.add(portalSurface);
    
    // Add portal effect with another surface
    const portalEffect = new THREE.Mesh(
      new THREE.CircleGeometry(1.5, 32),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
      })
    );
    portalEffect.rotation.x = Math.PI / 2;
    portalEffect.position.y = 2;
    portalGroup.add(portalEffect);
    
    // Create small decorative pillars at the base of the portal
    this.createPortalPillars(portalGroup, marbleTexture, goldTexture);
    
    // Add point light in the center of the portal
    const portalLight = new THREE.PointLight(0xffffaa, 1.5, 10);
    portalLight.position.y = 2; // Center of portal
    portalGroup.add(portalLight);
    
    // Position portal on the platform
    portalGroup.position.set(0, platformY, 14);
    this.templeGroup.add(portalGroup);
    
    // Store reference to portal object
    this.portalObject = portalGroup;
    
    // Add collision for the portal base
    this.collisionManager.addCollider({
      position: new THREE.Vector3(this.templeGroup.position.x, platformY + 0.1, this.templeGroup.position.z + 14),
      radius: 2.5,
      type: 'cylinder',
      height: 0.2
    });
    
    return portalGroup;
  }
  
  createPortalPillars(portalGroup, marbleTexture, goldTexture) {
    // Create four small pillars around the portal base
    const pillarCount = 4;
    
    for (let i = 0; i < pillarCount; i++) {
      const angle = (i / pillarCount) * Math.PI * 2;
      const radius = 2.2; // Slightly inside the base circle
      
      // Position calculations
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      // Create mini-pillar
      const pillarGroup = new THREE.Group();
      
      // Base of pillar
      const pillarBaseGeometry = new THREE.CylinderGeometry(0.2, 0.25, 0.3, 16);
      const marbleMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: marbleTexture,
        roughness: 0.5,
        metalness: 0.1
      });
      
      const pillarBase = new THREE.Mesh(pillarBaseGeometry, marbleMaterial);
      pillarBase.position.y = 0.15;
      pillarGroup.add(pillarBase);
      
      // Shaft of pillar
      const pillarShaftGeometry = new THREE.CylinderGeometry(0.15, 0.2, 1.2, 16);
      const pillarShaft = new THREE.Mesh(pillarShaftGeometry, marbleMaterial);
      pillarShaft.position.y = 0.9;
      pillarGroup.add(pillarShaft);
      
      // Capital of pillar
      const pillarCapitalGeometry = new THREE.CylinderGeometry(0.25, 0.15, 0.3, 16);
      const pillarCapital = new THREE.Mesh(pillarCapitalGeometry, marbleMaterial);
      pillarCapital.position.y = 1.65;
      pillarGroup.add(pillarCapital);
      
      // Golden orb on top
      const orbGeometry = new THREE.SphereGeometry(0.2, 16, 16);
      const goldMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        map: goldTexture,
        roughness: 0.3,
        metalness: 0.8,
        emissive: 0xffaa00,
        emissiveIntensity: 0.2
      });
      
      const orb = new THREE.Mesh(orbGeometry, goldMaterial);
      orb.position.y = 2.0;
      pillarGroup.add(orb);
      
      // Position the pillar
      pillarGroup.position.set(x, 0, z);
      portalGroup.add(pillarGroup);
    }
  }
  
  createPortalPedestals(platformY, goldTexture, marbleTexture) {
    // Add decorative pedestals around the platform
    const pedestalCount = 4;
    for (let i = 0; i < pedestalCount; i++) {
      const angle = (i / pedestalCount) * Math.PI * 2;
      const radius = 8; // Position well outside the platform
      
      const x = Math.cos(angle) * radius;
      const z = 14 + Math.sin(angle) * radius;
      
      const pedestal = this.createPortalPedestal(marbleTexture, goldTexture);
      pedestal.position.set(x, groundY, z);
      this.templeGroup.add(pedestal);
      
      // Add collider for pedestal
      this.collisionManager.addCollider({
        position: new THREE.Vector3(this.templeGroup.position.x + x, groundY, this.templeGroup.position.z + z),
        radius: 0.6
      });
      
      // Add small light on top of each pedestal
      const pedestalLight = new THREE.PointLight(0xffffaa, 0.5, 5);
      pedestalLight.position.set(x, groundY + 2, z);
      this.templeGroup.add(pedestalLight);
    }
  }
  
  createPortalPedestal(marbleTexture, goldTexture) {
    const pedestalGroup = new THREE.Group();
    
    // Base of pedestal
    const baseGeometry = new THREE.CylinderGeometry(0.5, 0.6, 0.4, 16);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.2;
    base.castShadow = true;
    base.receiveShadow = true;
    pedestalGroup.add(base);
    
    // Shaft of pedestal
    const shaftGeometry = new THREE.CylinderGeometry(0.4, 0.4, 1.6, 16);
    const shaft = new THREE.Mesh(shaftGeometry, baseMaterial);
    shaft.position.y = 1.2;
    shaft.castShadow = true;
    pedestalGroup.add(shaft);
    
    // Top of pedestal (bowl for fire)
    const bowlGeometry = new THREE.CylinderGeometry(0.5, 0.3, 0.4, 16);
    const bowlMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      map: goldTexture,
      roughness: 0.3,
      metalness: 0.8
    });
    
    const bowl = new THREE.Mesh(bowlGeometry, bowlMaterial);
    bowl.position.y = 2.2;
    bowl.castShadow = true;
    pedestalGroup.add(bowl);
    
    // Flame in bowl
    const flameGeometry = new THREE.ConeGeometry(0.3, 0.8, 16);
    const flameMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.8
    });
    
    const flame = new THREE.Mesh(flameGeometry, flameMaterial);
    flame.position.y = 2.6;
    pedestalGroup.add(flame);
    
    return pedestalGroup;
  }
  
  createPortalParticles(platformY) {
    // Create particle system for portal effect
    const particleCount = 500;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    
    // Initialize particles in a torus shape around the portal
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.8 + Math.random() * 0.4; // Around the portal ring
      
      particlePositions[i3] = Math.cos(angle) * radius;
      particlePositions[i3 + 1] = Math.random() * 4; // Height around the portal
      particlePositions[i3 + 2] = 14 + Math.sin(angle) * radius;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffaa,
      size: 0.1,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true
    });
    
    const particles = new THREE.Points(particlesGeometry, particleMaterial);
    particles.position.y = platformY;
    
    // Add animation data
    particles.userData = {
      initialPositions: particlePositions.slice(),
      update: (time) => {
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          const initialX = particles.userData.initialPositions[i3];
          const initialZ = particles.userData.initialPositions[i3 + 2] - 14;
          
          // Spiral around the portal
          const angle = Math.atan2(initialZ, initialX) + time * 0.001;
          const radius = Math.sqrt(initialX * initialX + initialZ * initialZ);
          
          positions[i3] = Math.cos(angle) * radius;
          positions[i3 + 1] = (particles.userData.initialPositions[i3 + 1] + time * 0.001) % 4;
          positions[i3 + 2] = 14 + Math.sin(angle) * radius;
        }
        particles.geometry.attributes.position.needsUpdate = true;
      }
    };
    
    this.templeGroup.add(particles);
  }
  
  addTempleLighting() {
    // Add dramatic lighting for temple
    const templeLight = new THREE.SpotLight(0xffffcc, 1, 50, Math.PI / 6, 0.5, 2);
    templeLight.position.set(0, 30, 0);
    templeLight.target = this.templeGroup.children[0]; // Target the platform
    templeLight.castShadow = true;
    this.templeGroup.add(templeLight);
    
    // Add warm light inside the temple
    const interiorLight = new THREE.PointLight(0xffcc88, 1, 15);
    interiorLight.position.set(0, 5, 0);
    this.templeGroup.add(interiorLight);
  }
  
  // Check if player is on the portal platform
  update(time, playerPosition) {
    // Skip if portal not created yet
    if (!this.portalTrigger || !this.platformCollider) return;
    
    // Check if player is on the platform
    const platformX = this.platformCollider.position.x;
    const platformZ = this.platformCollider.position.z;
    const platformWidth = this.platformCollider.width / 2;
    const platformDepth = this.platformCollider.depth / 2;
    
    const playerIsOnPlatform = 
      playerPosition.x >= platformX - platformWidth &&
      playerPosition.x <= platformX + platformWidth &&
      playerPosition.z >= platformZ - platformDepth &&
      playerPosition.z <= platformZ + platformDepth;
    
    // If player is on platform and within portal radius
    if (playerIsOnPlatform) {
      const distToPortal = new THREE.Vector2(
        playerPosition.x - this.portalTrigger.position.x,
        playerPosition.z - this.portalTrigger.position.z
      ).length();
      
      if (distToPortal < this.portalTrigger.radius) {
        this.activatePortal();
      }
    }
    
    // Animate portal
    this.animatePortal(time);
    
    // Animate portal particles if they exist
    if (this.templeGroup) {
      this.templeGroup.traverse((object) => {
        if (object.isPoints && object.userData && object.userData.update) {
          object.userData.update(time);
        }
      });
    }
  }
  
  // New method to animate the portal
  animatePortal(time) {
    if (!this.portalObject) return;
    
    // Find the portal surface to animate (the white inner circle)
    this.portalObject.traverse((object) => {
      if (object.isMesh && object.material && object.material.color && object.material.color.r > 0.9) {
        // Pulse the opacity
        object.material.opacity = 0.5 + 0.3 * Math.sin(time * 0.002);
        
        // Rotate slightly
        object.rotation.z = time * 0.0005;
      }
    });
  }
  
  activatePortal() {
    // If portal isn't active yet
    if (!this.portalActive) {
      this.portalActive = true;
      
      // Show dialog to prepare for teleport
      this.dialogManager.showDialog("Portal", "Entering the Temple of Apollo...");
      
      // Wait a moment for effect, then redirect
      setTimeout(() => {
        window.location.href = 'temple.html';
      }, 1500);
    }
  }
}