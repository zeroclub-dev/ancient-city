/**
 * TemplesManager
 * Handles creation and management of the floating temple structure
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
    
    // Create floating island
    this.createFloatingIsland(stoneTexture);
    
    // Create floating staircase
    this.createFloatingStaircase(marbleTexture);
    
    // Create temple on the island
    this.createTempleStructure(marbleTexture, goldTexture, roofTileTexture);
    
    // Create lighting and atmosphere
    this.addTempleLighting();
    this.addAtmosphericEffects();
    
    // Position the entire temple complex
    const templeX = -40;
    const templeY = 40; // Floating high in the air
    const templeZ = -10;
    
    this.templeGroup.position.set(templeX, templeY, templeZ);
    this.scene.add(this.templeGroup);
    
    // Create portal trigger at the temple entrance
    this.createPortalTrigger(templeX, templeY, templeZ);
    
    // Add visual quest marker
    this.questManager.createQuestMarker(new THREE.Vector3(templeX, templeY + 15, templeZ - 6));
    
    return this.templeGroup;
  }
  
  createFloatingIsland(stoneTexture) {
    // Create a circular island base
    const islandRadius = 25;
    const islandHeight = 10;
    
    // Main island mass
    const islandGeometry = new THREE.CylinderGeometry(islandRadius, islandRadius * 1.2, islandHeight, 32);
    const islandMaterial = new THREE.MeshStandardMaterial({
      map: stoneTexture,
      roughness: 0.8,
      metalness: 0.2,
      color: 0x889988
    });
    
    const islandMesh = new THREE.Mesh(islandGeometry, islandMaterial);
    islandMesh.position.y = -islandHeight/2;
    islandMesh.castShadow = true;
    islandMesh.receiveShadow = true;
    this.islandGroup.add(islandMesh);
    
    // Add rock formations around the edge
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const radius = islandRadius * 0.9;
      
      const rockHeight = 2 + Math.random() * 3;
      const rockGeometry = new THREE.ConeGeometry(
        1 + Math.random(), 
        rockHeight, 
        5 + Math.floor(Math.random() * 3)
      );
      
      const rockMaterial = new THREE.MeshStandardMaterial({
        map: stoneTexture,
        color: 0x7a8a7a,
        roughness: 0.9,
        metalness: 0.1
      });
      
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      rock.position.set(
        Math.cos(angle) * radius,
        rockHeight/2,
        Math.sin(angle) * radius
      );
      rock.rotation.y = Math.random() * Math.PI;
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.islandGroup.add(rock);
    }
    
    // Add ground surface on top of the island
    const surfaceGeometry = new THREE.CircleGeometry(islandRadius * 0.95, 32);
    const surfaceMaterial = new THREE.MeshStandardMaterial({
      color: 0x91a185,
      roughness: 0.8,
      metalness: 0.1
    });
    
    const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
    surface.rotation.x = -Math.PI / 2;
    surface.position.y = 0.1;
    surface.receiveShadow = true;
    this.islandGroup.add(surface);
    
    // Add some vegetation and small details
    this.addIslandVegetation();
    
    // Add floating crystal formations for mystical effect
    this.addFloatingCrystals();
    
    // Add collision for the island surface
    this.collisionManager.addCollider({
      position: new THREE.Vector3(0, 0, 0),
      radius: islandRadius,
      type: 'cylinder',
      height: 0.2
    });
    
    this.templeGroup.add(this.islandGroup);
  }
  
  addIslandVegetation() {
    // Add small bushes and plants
    const bushGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    const bushMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a6d4a,
      roughness: 0.9
    });
    
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 10 + Math.random() * 12;
      
      const bush = new THREE.Mesh(bushGeometry, bushMaterial);
      bush.position.set(
        Math.cos(angle) * radius,
        0.3,
        Math.sin(angle) * radius
      );
      bush.scale.set(
        0.5 + Math.random() * 0.5,
        0.5 + Math.random() * 0.5,
        0.5 + Math.random() * 0.5
      );
      bush.castShadow = true;
      bush.receiveShadow = true;
      this.islandGroup.add(bush);
    }
    
    // Add flower patches
    const flowerColors = [0xe7493a, 0xffeb3b, 0xf5b8d1, 0xe91e63, 0xffffff];
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 8 + Math.random() * 14;
      
      const flowerGeometry = new THREE.SphereGeometry(0.15, 8, 8);
      const flowerMaterial = new THREE.MeshStandardMaterial({
        color: flowerColors[Math.floor(Math.random() * flowerColors.length)],
        roughness: 0.8,
        metalness: 0.1
      });
      
      const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
      flower.position.set(
        Math.cos(angle) * radius,
        0.2,
        Math.sin(angle) * radius
      );
      this.islandGroup.add(flower);
      
      // Add stem
      const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 4);
      const stemMaterial = new THREE.MeshStandardMaterial({
        color: 0x2e7d32,
        roughness: 0.9
      });
      
      const stem = new THREE.Mesh(stemGeometry, stemMaterial);
      stem.position.set(
        Math.cos(angle) * radius,
        0.1,
        Math.sin(angle) * radius
      );
      this.islandGroup.add(stem);
    }
  }
  
  addFloatingCrystals() {
    const crystalGeometry = new THREE.ConeGeometry(0.5, 2, 5);
    const crystalMaterial = new THREE.MeshStandardMaterial({
      color: 0x88aaff,
      transparent: true,
      opacity: 0.7,
      roughness: 0.1,
      metalness: 0.9
    });
    
    // Add floating crystals around the island
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 20;
      
      const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
      crystal.position.set(
        Math.cos(angle) * radius,
        2 + Math.sin(i * 0.5) * 3,
        Math.sin(angle) * radius
      );
      
      // Rotate crystal to point outward
      crystal.rotation.x = Math.PI;
      crystal.rotation.y = angle;
      
      crystal.castShadow = true;
      this.islandGroup.add(crystal);
      
      // Add point light inside crystal
      const light = new THREE.PointLight(0x88aaff, 0.5, 5);
      light.position.copy(crystal.position);
      this.islandGroup.add(light);
      
      // Store animation data for floating motion
      crystal.userData = {
        initialY: crystal.position.y,
        angle: i,
        update: (time) => {
          crystal.position.y = crystal.userData.initialY + Math.sin(time * 0.001 + i) * 0.5;
          crystal.rotation.z = Math.sin(time * 0.0005 + i * 0.5) * 0.1;
        }
      };
    }
  }
  
  createFloatingStaircase(marbleTexture) {
    // Create a series of floating steps leading up to the island
    const startY = -30; // Starting point below the island
    const endY = 0;     // End at island surface
    const startZ = 50;  // Start far from the island
    const endZ = 20;    // End at the edge of the island
    
    const stepCount = 15;
    const stepWidth = 6;
    const stepDepth = 3;
    const stepHeight = 0.5;
    
    const stepMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    
    for (let i = 0; i < stepCount; i++) {
      // Calculate step position based on curve
      const t = i / (stepCount - 1);
      const y = startY + (endY - startY) * t;
      const z = startZ - (startZ - endZ) * (t * t); // Quadratic curve for nicer approach
      
      // Make steps get closer together as they ascend
      const stepSpacing = 1 - (0.5 * t);
      
      // Create step geometry and offset initial steps for curved approach
      const stepGeometry = new THREE.BoxGeometry(
        stepWidth - (t * 2), // Steps get narrower as they approach the island
        stepHeight,
        stepDepth
      );
      
      const step = new THREE.Mesh(stepGeometry, stepMaterial);
      
      // Position step with slight rotation for curved approach
      step.position.set(0, y + i * stepSpacing, z);
      
      // Add some rotation for visual effect - steps twist as they ascend
      step.rotation.y = t * Math.PI * 0.15;
      
      step.castShadow = true;
      step.receiveShadow = true;
      this.stairsGroup.add(step);
      
      // Add collision for each step
      this.collisionManager.addCollider({
        position: new THREE.Vector3(
          this.templeGroup.position.x,
          this.templeGroup.position.y + y + i * stepSpacing,
          this.templeGroup.position.z + z
        ),
        radius: Math.max(stepWidth, stepDepth) / 2,
        type: 'box',
        width: stepWidth - (t * 2),
        height: stepHeight,
        depth: stepDepth
      });
      
      // Add ethereal glow beneath certain steps
      if (i % 3 === 0) {
        const light = new THREE.PointLight(0xaaccff, 0.5, 8);
        light.position.set(0, y + i * stepSpacing - 0.5, z);
        this.stairsGroup.add(light);
      }
    }
    
    // Add decorative elements to the staircase
    this.addStaircaseDecoration(stepMaterial);
    
    this.templeGroup.add(this.stairsGroup);
  }
  
  addStaircaseDecoration(stepMaterial) {
    // Add small decorative columns along the staircase
    const columnGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.5, 8);
    
    for (let i = 0; i < 5; i++) {
      // Left column
      const leftColumn = new THREE.Mesh(columnGeometry, stepMaterial);
      leftColumn.position.set(-2.5, -22 + i * 4, 40 - i * 5);
      leftColumn.castShadow = true;
      this.stairsGroup.add(leftColumn);
      
      // Right column
      const rightColumn = new THREE.Mesh(columnGeometry, stepMaterial);
      rightColumn.position.set(2.5, -22 + i * 4, 40 - i * 5);
      rightColumn.castShadow = true;
      this.stairsGroup.add(rightColumn);
      
      // Add small light on top of each column
      const leftLight = new THREE.PointLight(0xffffaa, 0.5, 5);
      leftLight.position.set(-2.5, -21 + i * 4, 40 - i * 5);
      this.stairsGroup.add(leftLight);
      
      const rightLight = new THREE.PointLight(0xffffaa, 0.5, 5);
      rightLight.position.set(2.5, -21 + i * 4, 40 - i * 5);
      this.stairsGroup.add(rightLight);
    }
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
    
    // Add collider for the main temple structure
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
    
    // Add decorative relief to front pediment
    const sunGeometry = new THREE.CircleGeometry(1.5, 16);
    const sunMaterial = new THREE.MeshStandardMaterial({
      color: 0xfafafa,
      roughness: 0.5,
      metalness: 0.1
    });
    
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(0, 9, 8.1);
    sun.castShadow = true;
    this.templeGroup.add(sun);
    
    // Add rays around sun
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const rayGeometry = new THREE.BoxGeometry(0.2, 1, 0.05);
      const ray = new THREE.Mesh(rayGeometry, sunMaterial);
      
      ray.position.set(
        Math.cos(angle) * 2,
        9 + Math.sin(angle) * 2,
        8.15
      );
      ray.rotation.z = angle;
      this.templeGroup.add(ray);
    }
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
  
  addTempleLighting() {
    // Add dramatic lighting to the temple area
    
    // Main light beam from above
    const templeSpotlight = new THREE.SpotLight(0xffffcc, 1.5, 50, Math.PI / 6, 0.5, 1);
    templeSpotlight.position.set(0, 20, 0);
    templeSpotlight.target = this.templeGroup;
    templeSpotlight.castShadow = true;
    this.templeGroup.add(templeSpotlight);
    
    // Add volumetric light beam
    const beamGeometry = new THREE.CylinderGeometry(0.5, 3, 20, 16, 1, true);
    const beamMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffdd,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide
    });
    
    const lightBeam = new THREE.Mesh(beamGeometry, beamMaterial);
    lightBeam.position.set(0, 10, 0);
    this.templeGroup.add(lightBeam);
    
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
  }
  
  addAtmosphericEffects() {
    // Add mist/fog around the floating island
    const mistParticleCount = 200;
    const mistGeometry = new THREE.BufferGeometry();
    const mistPositions = new Float32Array(mistParticleCount * 3);
    
    for (let i = 0; i < mistParticleCount; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const radius = 20 + Math.random() * 10;
      
      mistPositions[i3] = Math.cos(angle) * radius;
      mistPositions[i3 + 1] = -2 - Math.random() * 8;
      mistPositions[i3 + 2] = Math.sin(angle) * radius;
    }
    
    mistGeometry.setAttribute('position', new THREE.BufferAttribute(mistPositions, 3));
    
    const mistMaterial = new THREE.PointsMaterial({
      color: 0xaabbff,
      size: 1.5,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true
    });
    
    const mistParticles = new THREE.Points(mistGeometry, mistMaterial);
    
    // Add animation data for mist
    mistParticles.userData = {
      initialPositions: mistPositions.slice(),
      update: (time) => {
        const positions = mistParticles.geometry.attributes.position.array;
        for (let i = 0; i < mistParticleCount; i++) {
          const i3 = i * 3;
          
          // Gentle swirling motion
          const angle = Math.atan2(positions[i3 + 2], positions[i3]);
          const radius = Math.sqrt(positions[i3] * positions[i3] + positions[i3 + 2] * positions[i3 + 2]);
          
          // Update angle for swirling
          const newAngle = angle + 0.0005 * Math.sin(time * 0.0001 + i * 0.01);
          
          positions[i3] = Math.cos(newAngle) * radius;
          positions[i3 + 2] = Math.sin(newAngle) * radius;
          
          // Gentle vertical oscillation
          positions[i3 + 1] = mistParticles.userData.initialPositions[i3 + 1] + 
                             Math.sin(time * 0.0005 + i * 0.01) * 0.5;
        }
        mistParticles.geometry.attributes.position.needsUpdate = true;
      }
    };
    
    this.templeGroup.add(mistParticles);
    
    // Add floating sparkles near the temple
    const sparkleCount = 50;
    const sparkleGeometry = new THREE.BufferGeometry();
    const sparklePositions = new Float32Array(sparkleCount * 3);
    
    for (let i = 0; i < sparkleCount; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 15;
      
      sparklePositions[i3] = Math.cos(angle) * radius;
      sparklePositions[i3 + 1] = 3 + Math.random() * 8;
      sparklePositions[i3 + 2] = Math.sin(angle) * radius;
    }
    
    sparkleGeometry.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));
    
    const sparkleMaterial = new THREE.PointsMaterial({
      color: 0xffffdd,
      size: 0.3,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });
    
    const sparkleParticles = new THREE.Points(sparkleGeometry, sparkleMaterial);
    
    // Add animation data for sparkles
    sparkleParticles.userData = {
      initialPositions: sparklePositions.slice(),
      update: (time) => {
        const positions = sparkleParticles.geometry.attributes.position.array;
        for (let i = 0; i < sparkleCount; i++) {
          const i3 = i * 3;
          
          // Gentle floating motion
          positions[i3] = sparkleParticles.userData.initialPositions[i3] + 
                         Math.sin(time * 0.001 + i) * 0.2;
          positions[i3 + 1] = sparkleParticles.userData.initialPositions[i3 + 1] + 
                             Math.cos(time * 0.001 + i) * 0.2;
          positions[i3 + 2] = sparkleParticles.userData.initialPositions[i3 + 2] + 
                             Math.sin(time * 0.001 + i * 0.5) * 0.2;
        }
        sparkleParticles.geometry.attributes.position.needsUpdate = true;
        
        // Pulse the opacity for twinkling effect
        sparkleMaterial.opacity = 0.5 + Math.sin(time * 0.003) * 0.3;
      }
    };
    
    this.templeGroup.add(sparkleParticles);
  }
  
  createPortalTrigger(templeX, templeY, templeZ) {
    // Create a trigger area in front of the temple entrance to redirect to temple.html
    const portalPosition = new THREE.Vector3(
      templeX,
      templeY,
      templeZ + 8 // Position in front of temple entrance
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
  
  // Animation update method to be called in the main game loop
  update(time) {
    // Update any animated elements in the temple
    if (this.templeGroup) {
      // Update floating crystals
      this.islandGroup.children.forEach(child => {
        if (child.userData && child.userData.update) {
          child.userData.update(time);
        }
      });
      
      // Update orb and light beam
      this.templeGroup.children.forEach(child => {
        if (child.userData && child.userData.update) {
          child.userData.update(time);
        }
      });
      
      // Update portal effect
      if (this.portalTrigger && this.portalTrigger.userData && this.portalTrigger.userData.update) {
        this.portalTrigger.userData.update(time);
      }
      
      // Make the entire temple gently float
      this.templeGroup.position.y = this.templeGroup.position.y + Math.sin(time * 0.0001) * 0.01;
    }
  }
}