/**
 * TemplesManager
 * Handles creation and management of the temple structure
 * with properly connected stairs
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
    this.islandGroup = null;
    this.stairsGroup = null;
    this.portalTrigger = null;
  }
  
  createTempleOfApollo() {
    // Create main groups
    this.templeGroup = new THREE.Group();
    this.islandGroup = new THREE.Group();
    this.stairsGroup = new THREE.Group();
    
    // Get textures from texture engine
    const { marbleTexture, goldTexture, roofTileTexture, stoneTexture } = this.textureEngine.getTextures();
    
    // Position variables - keep island position fixed first
    const islandX = -40;
    const islandY = 15; // Lower height
    const islandZ = -10;
    
    // Create island at origin first so we can get exact dimensions
    this.createFloatingIsland(stoneTexture);
    
    // Position the island (this doesn't move the actual geometry yet)
    this.islandGroup.position.set(islandX, islandY, islandZ);
    this.scene.add(this.islandGroup);
    
    // Create temple on the island (positioned relative to island)
    this.createTempleStructure(marbleTexture, goldTexture, roofTileTexture);
    this.templeGroup.position.set(islandX, islandY, islandZ);
    this.scene.add(this.templeGroup);
    
    // Now create solid stairs from ground to island
    this.createSolidStaircase(marbleTexture, islandX, islandY, islandZ);
    
    // Create portal trigger at the temple entrance
    this.createPortalTrigger(islandX, islandY, islandZ);
    
    // Add visual quest marker
    this.questManager.createQuestMarker(new THREE.Vector3(islandX, islandY + 15, islandZ - 6));
    
    // Create lighting and effects
    this.addTempleLighting();
    
    return this.templeGroup;
  }
  
  createFloatingIsland(stoneTexture) {
    // Create a circular island base
    const islandRadius = 25;
    const islandHeight = 5;
    
    // Main island mass - using BoxGeometry for stability and better collisions
    const islandGeometry = new THREE.BoxGeometry(islandRadius * 2, islandHeight, islandRadius * 2);
    const islandMaterial = new THREE.MeshStandardMaterial({
      map: stoneTexture,
      roughness: 0.8,
      metalness: 0.2,
      color: 0x889988
    });
    
    const islandMesh = new THREE.Mesh(islandGeometry, islandMaterial);
    // Center vertically so top is at y=0 for easier alignment
    islandMesh.position.y = -islandHeight/2;
    islandMesh.castShadow = true;
    islandMesh.receiveShadow = true;
    this.islandGroup.add(islandMesh);
    
    // Add top surface with different material
    const surfaceGeometry = new THREE.BoxGeometry(islandRadius * 2, 0.5, islandRadius * 2);
    const surfaceMaterial = new THREE.MeshStandardMaterial({
      color: 0x91a185,
      roughness: 0.8,
      metalness: 0.1,
      map: stoneTexture
    });
    
    const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
    surface.position.y = 0.25; // Half its height above island
    surface.receiveShadow = true;
    this.islandGroup.add(surface);
    
    // Save island dimensions for reference
    this.islandDimensions = {
      radius: islandRadius,
      height: islandHeight,
      top: 0.5 // Height of the top surface
    };
    
    return this.islandGroup;
  }
  
  createSolidStaircase(marbleTexture, islandX, islandY, islandZ) {
    // Create a solid staircase leading up to the island
    // Plan: Create a direct staircase from ground (y=0) to island surface (y=islandY)
    
    // Stair configuration
    const stairStartZ = islandZ + 35; // Start further away from island center
    const stairEndZ = islandZ + this.islandDimensions.radius * 0.8; // End at edge of island
    
    const stairWidth = 8;
    const stepCount = 30; // Enough steps to make a reasonable slope
    
    // Calculate step dimensions
    const totalRise = islandY; // Vertical distance
    const totalRun = stairStartZ - stairEndZ; // Horizontal distance
    
    const stepRise = totalRise / stepCount; // Height of each step
    const stepRun = totalRun / stepCount; // Depth of each step
    
    // Create a solid base structure for the entire staircase
    const baseGeometry = new THREE.BoxGeometry(
      stairWidth, 
      islandY / 2, // Half the height of the island
      totalRun 
    );
    
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x777777,
      roughness: 0.9,
      metalness: 0.1
    });
    
    const stairBase = new THREE.Mesh(baseGeometry, baseMaterial);
    
    // Position the base so its top aligns with the ground
    stairBase.position.set(
      islandX, 
      islandY / 4, // Center vertically (half of half height)
      (stairStartZ + stairEndZ) / 2 // Center horizontally
    );
    
    stairBase.castShadow = true;
    stairBase.receiveShadow = true;
    this.scene.add(stairBase);
    
    // Add collision for the base
    this.collisionManager.addCollider({
      position: new THREE.Vector3(
        islandX,
        islandY / 4,
        (stairStartZ + stairEndZ) / 2
      ),
      radius: Math.max(stairWidth, totalRun) / 2,
      type: 'box',
      width: stairWidth,
      height: islandY / 2,
      depth: totalRun
    });
    
    // Create individual steps on top of the base
    const stepMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    
    // Create steps from ground up
    for (let i = 0; i < stepCount; i++) {
      const stepGeometry = new THREE.BoxGeometry(stairWidth, stepRise, stepRun);
      const step = new THREE.Mesh(stepGeometry, stepMaterial);
      
      // Position each step
      step.position.set(
        islandX,
        i * stepRise + stepRise/2, // Bottom step starts at y=0
        stairStartZ - (i * stepRun + stepRun/2) // Start from stairStartZ and move toward island
      );
      
      step.castShadow = true;
      step.receiveShadow = true;
      this.scene.add(step);
      
      // Add collision for each step
      this.collisionManager.addCollider({
        position: step.position.clone(),
        radius: Math.max(stairWidth, stepRun) / 2,
        type: 'box',
        width: stairWidth,
        height: stepRise,
        depth: stepRun
      });
    }
    
    // Create solid railings attached to the stairs
    this.createStairRailings(
      islandX, 
      stairStartZ, 
      stairEndZ, 
      stairWidth, 
      totalRise,
      stepCount,
      marbleTexture
    );
    
    // Create a landing platform connecting stairs to island
    this.createLandingPlatform(
      islandX,
      islandY,
      stairEndZ,
      stairWidth,
      marbleTexture
    );
    
    // Create a small platform at the ground level for the first step
    const groundPlatformGeometry = new THREE.BoxGeometry(stairWidth + 4, 0.5, 4);
    const groundPlatform = new THREE.Mesh(groundPlatformGeometry, stepMaterial);
    groundPlatform.position.set(
      islandX,
      0.25, // Half height above ground
      stairStartZ + 2 // Just before the first step
    );
    groundPlatform.receiveShadow = true;
    this.scene.add(groundPlatform);
    
    // Add collision for ground platform
    this.collisionManager.addCollider({
      position: groundPlatform.position.clone(),
      radius: Math.max(stairWidth + 4, 4) / 2,
      type: 'box',
      width: stairWidth + 4,
      height: 0.5,
      depth: 4
    });
    
    return this.stairsGroup;
  }
  
  createStairRailings(islandX, stairStartZ, stairEndZ, stairWidth, totalRise, stepCount, marbleTexture) {
    // Create solid railings that properly follow the stair path
    const railingHeight = 1.5;
    const railingWidth = 0.5;
    
    const railingMaterial = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      map: marbleTexture,
      roughness: 0.6,
      metalness: 0.1
    });
    
    // Calculate the angle of the stairs for angled railings
    const stairAngle = Math.atan2(totalRise, stairStartZ - stairEndZ);
    const railingLength = Math.sqrt(Math.pow(totalRise, 2) + Math.pow(stairStartZ - stairEndZ, 2));
    
    // Create angled railing base (follows stairs exactly)
    const railingGeometry = new THREE.BoxGeometry(railingWidth, railingLength, railingWidth);
    
    // Left railing base
    const leftRailing = new THREE.Mesh(railingGeometry, railingMaterial);
    leftRailing.position.set(
      islandX - stairWidth/2 - railingWidth/2,
      totalRise/2,
      (stairStartZ + stairEndZ)/2
    );
    
    // Rotate the railing to follow stairs
    leftRailing.rotation.x = Math.PI/2 - stairAngle;
    leftRailing.castShadow = true;
    this.scene.add(leftRailing);
    
    // Right railing base
    const rightRailing = new THREE.Mesh(railingGeometry, railingMaterial);
    rightRailing.position.set(
      islandX + stairWidth/2 + railingWidth/2,
      totalRise/2,
      (stairStartZ + stairEndZ)/2
    );
    
    // Rotate the railing to follow stairs
    rightRailing.rotation.x = Math.PI/2 - stairAngle;
    rightRailing.castShadow = true;
    this.scene.add(rightRailing);
    
    // Add vertical posts for both railings
    for (let i = 0; i <= stepCount; i += 5) { // Posts every 5 steps
      const postHeight = railingHeight;
      const postGeometry = new THREE.BoxGeometry(railingWidth, postHeight, railingWidth);
      
      // Calculate post position - proportional position along the stairs
      const progress = i / stepCount;
      const posZ = stairStartZ - progress * (stairStartZ - stairEndZ);
      const posY = progress * totalRise + postHeight/2;
      
      // Left post
      const leftPost = new THREE.Mesh(postGeometry, railingMaterial);
      leftPost.position.set(
        islandX - stairWidth/2 - railingWidth/2,
        posY,
        posZ
      );
      leftPost.castShadow = true;
      this.scene.add(leftPost);
      
      // Right post
      const rightPost = new THREE.Mesh(postGeometry, railingMaterial);
      rightPost.position.set(
        islandX + stairWidth/2 + railingWidth/2,
        posY,
        posZ
      );
      rightPost.castShadow = true;
      this.scene.add(rightPost);
      
      // Add lanterns to some posts
      if (i % 10 === 0) {
        const lanternGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const lanternMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffaa,
          emissive: 0xffffaa,
          emissiveIntensity: 0.5,
          transparent: true,
          opacity: 0.7
        });
        
        // Left lantern
        const leftLantern = new THREE.Mesh(lanternGeometry, lanternMaterial);
        leftLantern.position.set(
          islandX - stairWidth/2 - railingWidth/2,
          posY + postHeight/2,
          posZ
        );
        this.scene.add(leftLantern);
        
        // Right lantern
        const rightLantern = new THREE.Mesh(lanternGeometry, lanternMaterial);
        rightLantern.position.set(
          islandX + stairWidth/2 + railingWidth/2,
          posY + postHeight/2,
          posZ
        );
        this.scene.add(rightLantern);
        
        // Add point lights
        const leftLight = new THREE.PointLight(0xffffaa, 0.7, 8);
        leftLight.position.copy(leftLantern.position);
        this.scene.add(leftLight);
        
        const rightLight = new THREE.PointLight(0xffffaa, 0.7, 8);
        rightLight.position.copy(rightLantern.position);
        this.scene.add(rightLight);
      }
    }
    
    // Add horizontal top rails for more detail
    const topRailGeometry = new THREE.BoxGeometry(railingWidth, railingWidth, stairStartZ - stairEndZ);
    
    // Left top rail
    const leftTopRail = new THREE.Mesh(topRailGeometry, railingMaterial);
    leftTopRail.position.set(
      islandX - stairWidth/2 - railingWidth/2,
      railingHeight,
      (stairStartZ + stairEndZ)/2
    );
    leftTopRail.castShadow = true;
    this.scene.add(leftTopRail);
    
    // Right top rail
    const rightTopRail = new THREE.Mesh(topRailGeometry, railingMaterial);
    rightTopRail.position.set(
      islandX + stairWidth/2 + railingWidth/2,
      railingHeight,
      (stairStartZ + stairEndZ)/2
    );
    rightTopRail.castShadow = true;
    this.scene.add(rightTopRail);
  }
  
  createLandingPlatform(islandX, islandY, stairEndZ, stairWidth, marbleTexture) {
    // Create a landing platform that connects the stairs to the island
    const landingWidth = stairWidth;
    const landingDepth = 4;
    const landingHeight = 0.5;
    
    const landingGeometry = new THREE.BoxGeometry(landingWidth, landingHeight, landingDepth);
    const landingMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    
    const landing = new THREE.Mesh(landingGeometry, landingMaterial);
    landing.position.set(
      islandX,
      islandY, // Same height as island surface
      stairEndZ - landingDepth/2 // Position to connect with stairs
    );
    landing.receiveShadow = true;
    this.scene.add(landing);
    
    // Add collision for landing
    this.collisionManager.addCollider({
      position: landing.position.clone(),
      radius: Math.max(landingWidth, landingDepth) / 2,
      type: 'box',
      width: landingWidth,
      height: landingHeight,
      depth: landingDepth
    });
    
    // Add small decorative columns at landing corners
    const columnHeight = 1.8;
    const columnRadius = 0.3;
    const columnGeometry = new THREE.CylinderGeometry(columnRadius, columnRadius, columnHeight, 8);
    
    const columnPositions = [
      {x: landingWidth/2 - columnRadius, z: -landingDepth/2 + columnRadius},
      {x: -landingWidth/2 + columnRadius, z: -landingDepth/2 + columnRadius}
    ];
    
    columnPositions.forEach(pos => {
      const column = new THREE.Mesh(columnGeometry, landingMaterial);
      column.position.set(
        islandX + pos.x,
        islandY + columnHeight/2,
        stairEndZ + pos.z
      );
      column.castShadow = true;
      this.scene.add(column);
      
      // Add decorative top
      const capGeometry = new THREE.BoxGeometry(columnRadius*2, columnRadius, columnRadius*2);
      const cap = new THREE.Mesh(capGeometry, landingMaterial);
      cap.position.set(
        islandX + pos.x,
        islandY + columnHeight + columnRadius/2,
        stairEndZ + pos.z
      );
      cap.castShadow = true;
      this.scene.add(cap);
    });
  }
  
  createTempleStructure(marbleTexture, goldTexture, roofTileTexture) {
    // Create main temple structure on the island
    
    // Temple dimensions
    const width = 20;
    const depth = 15;
    const height = 8;
    
    // Create temple platform
    const platformGeometry = new THREE.BoxGeometry(width + 4, 1.5, depth + 4);
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = 0.75;
    platform.receiveShadow = true;
    this.templeGroup.add(platform);
    
    // Add steps leading to platform
    const steps = [
      { width: width + 6, depth: 2, height: 0.4, z: depth / 2 + 3 },
      { width: width + 5, depth: 2, height: 0.4, z: depth / 2 + 1 }
    ];
    
    steps.forEach(stepData => {
      const stepGeometry = new THREE.BoxGeometry(stepData.width, stepData.height, stepData.depth);
      const step = new THREE.Mesh(stepGeometry, platformMaterial);
      step.position.set(0, stepData.height / 2, stepData.z);
      step.receiveShadow = true;
      this.templeGroup.add(step);
    });
    
    // Create temple columns
    this.createTempleColumns(marbleTexture);
    
    // Create temple walls
    const wallGeometry = new THREE.BoxGeometry(width - 2, height - 2, depth - 2);
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    
    const walls = new THREE.Mesh(wallGeometry, wallMaterial);
    walls.position.y = height / 2 + 0.75;
    walls.castShadow = true;
    walls.receiveShadow = true;
    this.templeGroup.add(walls);
    
    // Create roof
    const roofGeometry = new THREE.CylinderGeometry(0.1, 0.1, width, 4, 1, false, Math.PI / 4, Math.PI / 2);
    roofGeometry.rotateZ(Math.PI / 2);
    roofGeometry.scale(1, 1.5, depth);
    
    const roofMaterial = new THREE.MeshStandardMaterial({
      map: roofTileTexture,
      roughness: 0.7,
      metalness: 0.2
    });
    
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = height + 2;
    roof.castShadow = true;
    this.templeGroup.add(roof);
    
    // Create pediments (triangular parts under the roof)
    this.createPediments(marbleTexture);
    
    // Create doorway
    const doorwayGeometry = new THREE.BoxGeometry(4, 7, 1);
    const doorwayMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.8,
      metalness: 0.2
    });
    
    const doorway = new THREE.Mesh(doorwayGeometry, doorwayMaterial);
    doorway.position.set(0, 4, depth / 2 - 0.5);
    this.templeGroup.add(doorway);
    
    // Add golden accents
    this.addGoldenAccents(goldTexture);
    
    // Create interior space
    this.createTempleInterior(marbleTexture);
    
    // Add collision for the main temple structure
    this.collisionManager.addCollider({
      position: new THREE.Vector3(
        this.templeGroup.position.x,
        this.templeGroup.position.y + 0.75,
        this.templeGroup.position.z
      ),
      radius: Math.max(width, depth) / 2,
      type: 'box',
      width: width,
      height: 1.5,
      depth: depth
    });
  }
  
  createTempleColumns(marbleTexture) {
    // Create columns around perimeter
    const columnHeight = 7;
    const columnPositions = [];
    
    // Front columns (entrance)
    for (let i = 0; i < 6; i++) {
      const x = -10 + i * 4;
      columnPositions.push({ x, z: 7.5 });
    }
    
    // Side columns
    for (let i = 1; i < 4; i++) {
      const z = 7.5 - i * 5;
      // Left side
      columnPositions.push({ x: -10, z });
      // Right side
      columnPositions.push({ x: 10, z });
    }
    
    // Back columns
    for (let i = 0; i < 6; i++) {
      const x = -10 + i * 4;
      columnPositions.push({ x, z: -7.5 });
    }
    
    // Create each column
    columnPositions.forEach(pos => {
      const column = this.createColumn(columnHeight, marbleTexture);
      column.position.set(pos.x, 1.5, pos.z);
      this.templeGroup.add(column);
      
      // Add collision for the column
      this.collisionManager.addCollider({
        position: new THREE.Vector3(
          this.templeGroup.position.x + pos.x,
          this.templeGroup.position.y,
          this.templeGroup.position.z + pos.z
        ),
        radius: 0.8
      });
    });
  }
  
  createColumn(height, marbleTexture) {
    const columnGroup = new THREE.Group();
    
    // Base
    const baseGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.3, 24);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.15;
    base.castShadow = true;
    base.receiveShadow = true;
    columnGroup.add(base);
    
    // Shaft
    const shaftGeometry = new THREE.CylinderGeometry(0.6, 0.7, height, 24, 8, false);
    const shaftMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    
    // Create bump map for fluting effect using canvas
    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 512;
    bumpCanvas.height = 512;
    const ctx = bumpCanvas.getContext('2d');
    
    // Create fluting pattern
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
    shaft.position.y = height/2 + 0.3;
    shaft.castShadow = true;
    columnGroup.add(shaft);
    
    // Capital (column top)
    const capitalGeometry = new THREE.CylinderGeometry(0.9, 0.6, 0.4, 24);
    const capital = new THREE.Mesh(capitalGeometry, baseMaterial);
    capital.position.y = height + 0.5;
    capital.castShadow = true;
    columnGroup.add(capital);
    
    // Add decorative volutes to capital (ionic style)
    const voluteGeometry = new THREE.TorusGeometry(0.15, 0.05, 8, 16, Math.PI);
    
    // Left volute
    const leftVolute = new THREE.Mesh(voluteGeometry, baseMaterial);
    leftVolute.position.set(-0.45, height + 0.5, 0);
    leftVolute.rotation.y = Math.PI / 2;
    columnGroup.add(leftVolute);
    
    // Right volute
    const rightVolute = new THREE.Mesh(voluteGeometry, baseMaterial);
    rightVolute.position.set(0.45, height + 0.5, 0);
    rightVolute.rotation.y = -Math.PI / 2;
    columnGroup.add(rightVolute);
    
    // Top abacus (square plate)
    const abacusGeometry = new THREE.BoxGeometry(1.8, 0.3, 1.8);
    const abacus = new THREE.Mesh(abacusGeometry, baseMaterial);
    abacus.position.y = height + 0.7;
    abacus.castShadow = true;
    columnGroup.add(abacus);
    
    return columnGroup;
  }
  
  createPediments(marbleTexture) {
    // Create triangular pediments at front and back
    const pedimentGeometry = new THREE.CylinderGeometry(0.1, 0.1, 20, 3, 1, false, 0, Math.PI);
    pedimentGeometry.rotateZ(Math.PI / 2);
    pedimentGeometry.rotateY(Math.PI / 2);
    pedimentGeometry.scale(1, 2, 1);
    
    const pedimentMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    
    // Front pediment
    const frontPediment = new THREE.Mesh(pedimentGeometry, pedimentMaterial);
    frontPediment.position.set(0, 9, 8);
    frontPediment.castShadow = true;
    this.templeGroup.add(frontPediment);
    
    // Back pediment
    const backPediment = new THREE.Mesh(pedimentGeometry, pedimentMaterial);
    backPediment.position.set(0, 9, -8);
    backPediment.rotation.y = Math.PI;
    backPediment.castShadow = true;
    this.templeGroup.add(backPediment);
  }
  
  addGoldenAccents(goldTexture) {
    // Add golden decorative elements
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      map: goldTexture,
      roughness: 0.3,
      metalness: 0.8
    });
    
    // Create decorative band along the top of the walls
    const bandGeometry = new THREE.BoxGeometry(20, 0.5, 15);
    const band = new THREE.Mesh(bandGeometry, goldMaterial);
    band.position.y = 7.5;
    band.castShadow = true;
    this.templeGroup.add(band);
    
    // Add golden ornaments on corners
    const cornerPositions = [
      { x: 9, z: 7 },
      { x: -9, z: 7 },
      { x: 9, z: -7 },
      { x: -9, z: -7 }
    ];
    
    cornerPositions.forEach(pos => {
      const ornamentGeometry = new THREE.SphereGeometry(0.6, 16, 16);
      const ornament = new THREE.Mesh(ornamentGeometry, goldMaterial);
      ornament.position.set(pos.x, 10, pos.z);
      ornament.castShadow = true;
      this.templeGroup.add(ornament);
    });
    
    // Add golden lyre emblem above entrance
    const lyreGroup = new THREE.Group();
    
    // Lyre body
    const lyreBodyGeometry = new THREE.CylinderGeometry(0.6, 0.8, 1.2, 16, 1, false, 0, Math.PI);
    const lyreBody = new THREE.Mesh(lyreBodyGeometry, goldMaterial);
    lyreBody.rotation.y = Math.PI;
    lyreGroup.add(lyreBody);
    
    // Lyre arms
    const lyreArmGeometry = new THREE.TorusGeometry(0.5, 0.1, 8, 12, Math.PI);
    
    // Right arm
    const lyreRightArm = new THREE.Mesh(lyreArmGeometry, goldMaterial);
    lyreRightArm.position.x = 0.5;
    lyreRightArm.rotation.y = Math.PI / 2;
    lyreGroup.add(lyreRightArm);
    
    // Left arm
    const lyreLeftArm = new THREE.Mesh(lyreArmGeometry, goldMaterial);
    lyreLeftArm.position.x = -0.5;
    lyreLeftArm.rotation.y = -Math.PI / 2;
    lyreGroup.add(lyreLeftArm);
    
    // Add strings
    for (let i = 0; i < 7; i++) {
      const x = -0.45 + i * 0.15;
      const stringGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1, 4);
      const string = new THREE.Mesh(stringGeometry, goldMaterial);
      string.position.set(x, 0.5, 0);
      lyreGroup.add(string);
    }
    
    // Position the lyre above the entrance
    lyreGroup.position.set(0, 9, 8.2);
    lyreGroup.scale.set(2, 2, 2);
    this.templeGroup.add(lyreGroup);
  }
  
  createTempleInterior(marbleTexture) {
    // Create simple interior for viewing from outside
    const floorGeometry = new THREE.PlaneGeometry(18, 13);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      map: marbleTexture,
      roughness: 0.3,
      metalness: 0.1
    });
    
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 1.6;
    floor.receiveShadow = true;
    this.templeGroup.add(floor);
    
    // Add a pedestal with a glowing orb in the center of the temple
    const pedestalGeometry = new THREE.CylinderGeometry(1, 1.2, 1, 16);
    const pedestalMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    
    const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
    pedestal.position.set(0, 2.1, 0);
    pedestal.castShadow = true;
    pedestal.receiveShadow = true;
    this.templeGroup.add(pedestal);
    
    // Glowing orb
    const orbGeometry = new THREE.SphereGeometry(1, 32, 32);
    const orbMaterial = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      emissive: 0x4488ff,
      emissiveIntensity: 1,
      transparent: true,
      opacity: 0.8,
      roughness: 0.1,
      metalness: 0.9
    });
    
    const orb = new THREE.Mesh(orbGeometry, orbMaterial);
    orb.position.set(0, 3.5, 0);
    this.templeGroup.add(orb);
    
    // Add pulsing light inside orb
    const orbLight = new THREE.PointLight(0x88ccff, 2, 15);
    orbLight.position.copy(orb.position);
    this.templeGroup.add(orbLight);
    
    // Add animation data for the orb
    orb.userData = {
      update: (time) => {
        // Pulsing size
        const scale = 1 + Math.sin(time * 0.001) * 0.1;
        orb.scale.set(scale, scale, scale);
        
        // Pulsing light intensity
        orbLight.intensity = 1.5 + Math.sin(time * 0.001) * 0.5;
        
        // Subtle floating motion
        orb.position.y = 3.5 + Math.sin(time * 0.0005) * 0.2;
      }
    };
    
    // Add some columns inside the temple
    const innerColumnPositions = [
      { x: -6, z: -4 },
      { x: 6, z: -4 },
      { x: -6, z: 4 },
      { x: 6, z: 4 }
    ];
    
    innerColumnPositions.forEach(pos => {
      const column = this.createColumn(6, marbleTexture);
      column.position.set(pos.x, 1.5, pos.z);
      column.scale.set(0.8, 0.8, 0.8);
      this.templeGroup.add(column);
    });
  }
  
  createPortalTrigger(islandX, islandY, islandZ) {
    // Create a trigger area in front of the temple entrance to redirect to temple.html
    const portalPosition = new THREE.Vector3(
      islandX,
      islandY + 1, // Slightly above island surface
      islandZ + 8 // Position in front of temple entrance
    );
    
    // Add an invisible trigger box
    const portalGeometry = new THREE.BoxGeometry(4, 3, 1);
    const portalMaterial = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      transparent: true,
      opacity: 0.0 // Invisible
    });
    
    this.portalTrigger = new THREE.Mesh(portalGeometry, portalMaterial);
    this.portalTrigger.position.copy(portalPosition);
    this.scene.add(this.portalTrigger);
    
    // Create visual effect for the portal
    const portalEffectGeometry = new THREE.TorusGeometry(2, 0.2, 16, 32);
    const portalEffectMaterial = new THREE.MeshBasicMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.7
    });
    
    const portalEffect = new THREE.Mesh(portalEffectGeometry, portalEffectMaterial);
    portalEffect.position.copy(portalPosition);
    portalEffect.rotation.y = Math.PI / 2;
    this.scene.add(portalEffect);
    
    // Add point light inside portal
    const portalLight = new THREE.PointLight(0x88ccff, 2, 10);
    portalLight.position.copy(portalPosition);
    this.scene.add(portalLight);
    
    // Add animation data for portal effect
    portalEffect.userData = {
      update: (time) => {
        // Pulsing size
        const scale = 1 + Math.sin(time * 0.002) * 0.1;
        portalEffect.scale.set(scale, scale, 1);
        
        // Rotation effect
        portalEffect.rotation.z = time * 0.001;
        
        // Pulsing light
        portalLight.intensity = 1.5 + Math.sin(time * 0.002) * 0.5;
      }
    };
    
    // Add to interactive objects for player detection
    this.playerController.addInteractiveObject({
      object: this.portalTrigger,
      position: portalPosition,
      name: "Temple Entrance",
      radius: 4,
      interact: () => {
        // First show a dialog
        this.dialogManager.showDialog("Temple Guardian Voice", "You have reached the sacred Temple of Apollo. Enter to explore the ancient musical instruments of the gods.");
        
        // Then redirect to temple.html after dialog is closed
        setTimeout(() => {
          // Check if dialog is closed before redirecting
          if (!this.dialogManager.isOpen()) {
            window.location.href = 'temple.html';
          } else {
            // Set up an event listener for when dialog is closed
            const checkDialogClosed = setInterval(() => {
              if (!this.dialogManager.isOpen()) {
                clearInterval(checkDialogClosed);
                window.location.href = 'temple.html';
              }
            }, 500);
          }
        }, 2000);
      }
    });
    
    // Update quest state when the temple is found
    this.questManager.setTempleFound(true);
  }
  
  addTempleLighting() {
    // Add dramatic lighting to the temple area
    
    // Main light beam from above
    const templeSpotlight = new THREE.SpotLight(0xffffcc, 1.5, 50, Math.PI / 6, 0.5, 1);
    templeSpotlight.position.set(0, 20, 0);
    templeSpotlight.target = this.templeGroup;
    templeSpotlight.castShadow = true;
    this.templeGroup.add(templeSpotlight);
    
    // Add secondary lighting around the temple
    const secondaryLights = [
      { position: new THREE.Vector3(-15, 5, -15), color: 0x88aaff, intensity: 1 },
      { position: new THREE.Vector3(15, 5, -15), color: 0x88aaff, intensity: 1 },
      { position: new THREE.Vector3(0, 5, 15), color: 0xffffaa, intensity: 1.5 }
    ];
    
    secondaryLights.forEach(light => {
      const pointLight = new THREE.PointLight(light.color, light.intensity, 30);
      pointLight.position.copy(light.position);
      this.templeGroup.add(pointLight);
    });
    
    // Add ambient lighting to ensure visibility
    const ambientLight = new THREE.AmbientLight(0x445577, 0.5);
    this.templeGroup.add(ambientLight);
    
    // Add stair lighting
    this.addStairLighting();
  }
  
  addStairLighting() {
    // Add ground-level lighting at the base of the stairs
    const groundLight = new THREE.PointLight(0xffffaa, 2, 20);
    groundLight.position.set(
      this.templeGroup.position.x,
      2,
      this.templeGroup.position.z + 35 // At start of stairs
    );
    this.scene.add(groundLight);
    
    // Add path lights along the stairs
    for (let i = 0; i < 3; i++) {
      const stairLight = new THREE.SpotLight(0xaaddff, 1, 30, Math.PI / 6, 0.5, 1);
      stairLight.position.set(
        this.templeGroup.position.x,
        5 + i * 5,
        this.templeGroup.position.z + 25 - i * 10
      );
      stairLight.target.position.set(
        this.templeGroup.position.x,
        0,
        this.templeGroup.position.z + 15 - i * 10
      );
      stairLight.castShadow = true;
      this.scene.add(stairLight);
      this.scene.add(stairLight.target);
    }
  }
  
  // Animation update method
  update(time) {
    // Update any animated elements in the temple
    if (this.templeGroup) {
      // Update temple elements
      this.templeGroup.children.forEach(child => {
        if (child.userData && child.userData.update) {
          child.userData.update(time);
        }
      });
      
      // Update other scene elements
      this.scene.children.forEach(child => {
        if (child.userData && child.userData.update) {
          child.userData.update(time);
        }
      });
    }
  }
}