/**
 * TemplesManager
 * Handles creation and management of temple structures
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
  }
  
  createTempleOfApollo() {
    this.templeGroup = new THREE.Group();
    
    // Get textures from texture engine
    const { marbleTexture, goldTexture, roofTileTexture } = this.textureEngine.getTextures();
    
    // Calculate ground height at the temple position
    let groundY = 0;
    const templeX = -40;
    const templeZ = -10;
    const distFromCenter = Math.sqrt(templeX * templeX + templeZ * templeZ);
    if (distFromCenter > 50) {
      // Use same height calculation as in ground manager
      groundY = Math.sin(templeX * 0.05) * Math.cos(templeZ * 0.05) * 2;
      groundY += Math.sin(templeX * 0.01 + templeZ * 0.01) * 3;
      const edgeFactor = (distFromCenter - 50) / 200;
      groundY += edgeFactor * 10;
    }
    
    // Create temple platform (stylobate)
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
    
    // Create temple steps
    this.createTempleSteps(marbleTexture, groundY);
    
    // Create columns around perimeter
    this.createTempleColumns(marbleTexture, groundY);
    
    // Create entablature (top of columns)
    this.createEntablature(marbleTexture, groundY);
    
    // Create roof structure
    this.createRoof(roofTileTexture, groundY);
    
    // Create pediments (triangular parts under the roof)
    this.createPediments(marbleTexture, groundY);
    
    // Create temple interior
    this.createTempleInterior(marbleTexture, groundY);
    
    // Create Apollo statue inside
    this.createApolloStatue(marbleTexture, goldTexture, groundY);
    
    // Create instrument displays
    this.createInstrumentDisplays(marbleTexture, goldTexture, groundY);
    
    // Create an NPC temple keeper
    this.createTempleKeeper(groundY);
    
    // Add lighting to emphasize the temple
    this.addTempleLighting();
    
    // Position the temple
    this.templeGroup.position.set(-40, 0, -10);
      
    // Add temple to interactive objects
    this.playerController.addInteractiveObject({
      position: new THREE.Vector3(-40, groundY, 4), // Position in front of the temple
      name: "Temple of Apollo",
      radius: 5,
      interact: () => {
        this.dialogManager.showDialog("Temple Keeper", "Welcome to the Temple of Apollo, home of the divine musical instruments. I am the keeper of these sacred relics. Would you like to learn about the instruments inside?");
        this.questManager.setTempleFound(true);
      }
    });
    
    this.scene.add(this.templeGroup);
    
    // Create temple glow
    const templeGlow = new THREE.PointLight(0xffffdd, 0.5, 50);
    templeGlow.position.set(-40, 10 + groundY, -10);
    this.scene.add(templeGlow);
    
    // Add golden marker arrow pointing to the temple (quest marker)
    this.questManager.createQuestMarker(new THREE.Vector3(-40, 15 + groundY, -6));
    this.collisionManager.addCollider({
      position: new THREE.Vector3(-40, 0.75 + groundY, -10),
      radius: 15,
      type: 'box',
      width: 30,
      height: 1.5,
      depth: 20
    });
    
      // FIX: Add proper collision for temple platform
  this.collisionManager.addCollider({
    position: new THREE.Vector3(-40, 0.75 + groundY, -10),
    radius: 15,
    type: 'box',
    width: 30,
    height: 1.5,
    depth: 20
  });
  
  // FIX: Add proper collision for temple steps
  const stepPositions = [
    {x: -40, y: 0.2 + groundY, z: -10, width: 32, depth: 22, height: 0.4},
    {x: -40, y: 0.6 + groundY, z: -10, width: 31, depth: 21, height: 0.4}
  ];
  
  stepPositions.forEach(step => {
    this.collisionManager.addCollider({
      position: new THREE.Vector3(step.x, step.y, step.z),
      radius: Math.max(step.width, step.depth)/2,
      type: 'box',
      width: step.width,
      height: step.height,
      depth: step.depth
    });
  });
    return this.templeGroup;
  }
  
  createTempleSteps(marbleTexture, groundY = 0) {
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
    });
  }

  createTempleColumns(marbleTexture, groundY = 0) {
    // Create columns around perimeter
    const columnDepth = 6;
    const columnWidth = 12;
    
    // Front and back columns (shorter sides)
    for (let i = 0; i < columnWidth; i++) {
      const xPos = -12.5 + i * (25 / (columnWidth - 1));
      
      // Front columns
      const frontColumn = this.createColumn(5, marbleTexture);
      frontColumn.position.set(xPos, 1.5 + groundY, 9);
      this.templeGroup.add(frontColumn);
      
      // FIX: Add proper collision for front columns with height
      this.collisionManager.addCollider({
        position: new THREE.Vector3(xPos + this.templeGroup.position.x, 3 + groundY, 9 + this.templeGroup.position.z),
        radius: 0.8,
        type: 'cylinder',
        height: 5
      });
      
      // Back columns
      const backColumn = this.createColumn(5, marbleTexture);
      backColumn.position.set(xPos, 1.5 + groundY, -9);
      this.templeGroup.add(backColumn);
      
      // FIX: Add proper collision for back columns with height
      this.collisionManager.addCollider({
        position: new THREE.Vector3(xPos + this.templeGroup.position.x, 3 + groundY, -9 + this.templeGroup.position.z),
        radius: 0.8,
        type: 'cylinder',
        height: 5
      });
    }
    
    // Side columns (longer sides)
    for (let i = 1; i < columnDepth - 1; i++) {
      const zPos = 9 - i * (18 / (columnDepth - 1));
      
      // Left side columns
      const leftColumn = this.createColumn(5, marbleTexture);
      leftColumn.position.set(-12.5, 1.5 + groundY, zPos);
      this.templeGroup.add(leftColumn);
      
      // FIX: Add proper collision for left columns with height
      this.collisionManager.addCollider({
        position: new THREE.Vector3(-12.5 + this.templeGroup.position.x, 3 + groundY, zPos + this.templeGroup.position.z),
        radius: 0.8,
        type: 'cylinder',
        height: 5
      });
      
      // Right side columns
      const rightColumn = this.createColumn(5, marbleTexture);
      rightColumn.position.set(12.5, 1.5 + groundY, zPos);
      this.templeGroup.add(rightColumn);
      
      // FIX: Add proper collision for right columns with height
      this.collisionManager.addCollider({
        position: new THREE.Vector3(12.5 + this.templeGroup.position.x, 3 + groundY, zPos + this.templeGroup.position.z),
        radius: 0.8,
        type: 'cylinder',
        height: 5
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
    
    // Shaft - using closed cylinder to avoid seams
    const shaftGeometry = new THREE.CylinderGeometry(0.6, 0.7, height, 32, 6, false);
    const shaftMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    
    // Create bump map for fluting effect instead of modifying geometry
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
  
  createEntablature(marbleTexture, groundY = 0) {
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
  
  createRoof(roofTileTexture, groundY = 0) {
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
  
  createPediments(marbleTexture, groundY = 0) {
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
  
  createTempleInterior(marbleTexture, groundY = 0) {
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xfafafa,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    
    // Back wall
    const backWallGeometry = new THREE.BoxGeometry(20, 5, 0.5);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(0, 4 + groundY, -6);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    this.templeGroup.add(backWall);
    
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
    
    // Create doorway
    const doorwayGeometry = new THREE.BoxGeometry(5, 4, 2);
    const doorwayMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.8,
      metalness: 0.2
    });
    const doorway = new THREE.Mesh(doorwayGeometry, doorwayMaterial);
    doorway.position.set(0, 3 + groundY, 6);
    this.templeGroup.add(doorway);
    
    // Create interior floor
    const floorGeometry = new THREE.BoxGeometry(19.5, 0.2, 14);
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
  }
  
  createApolloStatue(marbleTexture, goldTexture, groundY = 0) {
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
    statueGroup.position.set(0, 1.5 + groundY, -2);
    statueGroup.scale.set(1.5, 1.5, 1.5);
    this.templeGroup.add(statueGroup);
    
    return statueGroup;
  }

  createInstrumentDisplays(marbleTexture, goldTexture, groundY = 0) {
    // Get instrument managers if available
    const stringedManager = window.stringedManager || null;
    const windManager = window.windManager || null;
    const percussionManager = window.percussionManager || null;
    
    const displayPositions = [
      { x: -6, z: -2, rotation: Math.PI / 4 },
      { x: -6, z: 3, rotation: Math.PI / 4 },
      { x: 6, z: -2, rotation: -Math.PI / 4 },
      { x: 6, z: 3, rotation: -Math.PI / 4 }
    ];
    
    displayPositions.forEach((pos, index) => {
      const display = this.createInstrumentDisplay(index, marbleTexture, goldTexture, stringedManager, windManager, percussionManager);
      display.position.set(pos.x, 1.5 + groundY, pos.z); // Adjust for ground height
      display.rotation.y = pos.rotation;
      this.templeGroup.add(display);
    });
  }
  
  createInstrumentDisplay(index, marbleTexture, goldTexture, stringedManager, windManager, percussionManager) {
    const displayGroup = new THREE.Group();
    
    // Create pedestal
    const pedestalGeometry = new THREE.CylinderGeometry(0.5, 0.6, 1, 16);
    const pedestalMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
    pedestal.position.y = 0.5; // Half height above ground
    pedestal.castShadow = true;
    pedestal.receiveShadow = true;
    displayGroup.add(pedestal);
    
    // Create different instruments based on index
    let instrument;
    switch(index) {
      case 0:
        // Lyre
        instrument = stringedManager ? 
          stringedManager.createLyre() : 
          this.createSimpleInstrumentModel(0.3, 0.3, 0.3, 0xd2b48c);
        instrument.position.y = 1.3; // Position on top of pedestal
        instrument.scale.set(0.3, 0.3, 0.3);
        break;
      case 1:
        // Aulos
        instrument = windManager ? 
          windManager.createAulos() : 
          this.createSimpleInstrumentModel(0.1, 1.0, 0.1, 0xd2b48c);
        instrument.position.y = 1.2; // Position on top of pedestal
        instrument.scale.set(0.5, 0.5, 0.5);
        break;
      case 2:
        // Kithara
        instrument = stringedManager ? 
          stringedManager.createKithara() : 
          this.createSimpleInstrumentModel(0.5, 0.8, 0.2, 0xd2b48c);
        instrument.position.y = 1.3; // Position on top of pedestal
        instrument.scale.set(0.3, 0.3, 0.3);
        break;
      case 3:
        // Syrinx (Pan Flute)
        instrument = windManager ? 
          windManager.createSyrinx() : 
          this.createSimpleInstrumentModel(0.4, 0.4, 0.1, 0xd2b48c);
        instrument.position.y = 1.2; // Position on top of pedestal
        instrument.scale.set(0.5, 0.5, 0.5);
        break;
    }
    
    displayGroup.add(instrument);
    
    // Add spotlight to highlight the instrument
    const spotlight = new THREE.SpotLight(0xffffcc, 0.5, 5, Math.PI / 6, 0.5, 2);
    spotlight.position.set(0, 3, 0);
    spotlight.target = instrument;
    displayGroup.add(spotlight);
    
    return displayGroup;
  }
  
  createSimpleInstrumentModel(width, height, depth, color) {
    // Simple stand-in instrument if specialized managers aren't available
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.7,
      metalness: 0.1
    });
    return new THREE.Mesh(geometry, material);
  }
  
  createTempleKeeper(groundY = 0) {
    const keeperGroup = new THREE.Group();
    
    // Create body
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1.5, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5dc,
      roughness: 0.7,
      metalness: 0.1
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.75; // Half height above ground
    body.castShadow = true;
    keeperGroup.add(body);
    
    // Create head
    const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0xedc9af,
      roughness: 0.7,
      metalness: 0.1
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.65; // Position on top of body
    head.castShadow = true;
    keeperGroup.add(head);
    
    // Create hair
    const hairGeometry = new THREE.SphereGeometry(0.28, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const hairMaterial = new THREE.MeshStandardMaterial({
      color: 0xd3d3d3,
      roughness: 0.9,
      metalness: 0.1
    });
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.y = 1.75; // Position on top of head
    hair.rotation.x = Math.PI;
    hair.castShadow = true;
    keeperGroup.add(hair);
    
    // Create arms
    const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.7, 8);
    
    // Right arm
    const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
    rightArm.position.set(0.3, 1.2, 0);
    rightArm.rotation.z = -Math.PI / 4;
    rightArm.castShadow = true;
    keeperGroup.add(rightArm);
    
    // Left arm (holding scroll)
    const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
    leftArm.position.set(-0.3, 1.2, 0);
    leftArm.rotation.z = Math.PI / 3;
    leftArm.castShadow = true;
    keeperGroup.add(leftArm);
    
    // Create scroll in hand
    const scrollGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 16);
    const scrollMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5dc,
      roughness: 0.9,
      metalness: 0.1
    });
    const scroll = new THREE.Mesh(scrollGeometry, scrollMaterial);
    scroll.position.set(-0.6, 1.3, 0);
    scroll.rotation.z = Math.PI / 2;
    scroll.castShadow = true;
    keeperGroup.add(scroll);
    
    // Position keeper
    keeperGroup.position.set(0, 1.5 + groundY, 6);
    keeperGroup.rotation.y = Math.PI;
    this.templeGroup.add(keeperGroup);
    
    // Add to interactive objects
    this.playerController.addInteractiveObject({
      mesh: keeperGroup,
      position: new THREE.Vector3(-40, groundY, -4), // Will be adjusted when added to scene
      name: "Temple Keeper",
      radius: 2,
      interact: () => {
        if (!this.questManager.getQuestState().talkedToKeeper) {
          this.dialogManager.showDialog("Temple Keeper", "I see you have found our temple, traveler. The instruments inside are sacred to Apollo and the Muses. They represent the harmony of the cosmos. Would you like to enter and examine them more closely?");
          this.questManager.setTalkedToKeeper(true);
        } else {
          this.dialogManager.showDialog("Temple Keeper", "Go ahead inside. The instruments await your curiosity. Feel free to interact with them to learn their stories.");
        }
      }
    });
    
    return keeperGroup;
  }
  
  addTempleLighting() {
    // Add lighting to emphasize the temple
    const templeLight = new THREE.SpotLight(0xffffcc, 0.8, 50, Math.PI / 6, 0.5, 2);
    templeLight.position.set(0, 30, 0);
    templeLight.target = this.templeGroup.children[0]; // Target the platform
    templeLight.castShadow = true;
    this.templeGroup.add(templeLight);
  }
}