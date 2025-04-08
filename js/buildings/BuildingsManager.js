/**
 * BuildingsManager
 * Handles creation and management of city buildings
 */
class BuildingsManager {
  constructor(scene, textureEngine, collisionManager) {
    this.scene = scene;
    this.textureEngine = textureEngine;
    this.collisionManager = collisionManager;
    this.buildings = [];
  }
  
  createBuildings() {
    // Create several houses and shops around the agora
    this.createResidentialDistrict();
    this.createCommercialDistrict();
    this.createPublicBuildings();
    
    return this.buildings;
  }
  
  createResidentialDistrict() {
    const buildingCount = 10;
    const minRadius = 60;
    const maxRadius = 75;
    
    for (let i = 0; i < buildingCount; i++) {
      const angle = (i / buildingCount) * Math.PI * 2;
      const radius = minRadius + Math.random() * (maxRadius - minRadius);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      // Calculate ground height at this position
      let y = 0;
      const distFromCenter = Math.sqrt(x * x + z * z);
      if (distFromCenter > 50) {
        // Use same height calculation as in ground manager
        y = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2;
        y += Math.sin(x * 0.01 + z * 0.01) * 3;
        const edgeFactor = (distFromCenter - 50) / 200;
        y += edgeFactor * 10;
      }
      
      const house = this.createHouse();
      house.position.set(x, y, z);
      house.rotation.y = angle + Math.PI + (Math.random() * 0.5 - 0.25);
      this.scene.add(house);
      
      // Add to buildings array and colliders
      this.buildings.push(house);
      this.collisionManager.addCollider({
        position: new THREE.Vector3(x, y, z),
        radius: 5
      });
    }
  }
  
  createCommercialDistrict() {
    const shopCount = 5;
    const minRadius = 50;
    const maxRadius = 65;
    
    for (let i = 0; i < shopCount; i++) {
      const angle = ((i / shopCount) * Math.PI * 2) + 0.2;
      const radius = minRadius + Math.random() * (maxRadius - minRadius);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      // Calculate ground height at this position
      let y = 0;
      const distFromCenter = Math.sqrt(x * x + z * z);
      if (distFromCenter > 50) {
        // Use same height calculation as in ground manager
        y = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2;
        y += Math.sin(x * 0.01 + z * 0.01) * 3;
        const edgeFactor = (distFromCenter - 50) / 200;
        y += edgeFactor * 10;
      }
      
      const shop = this.createShop();
      shop.position.set(x, y, z);
      shop.rotation.y = angle + Math.PI + (Math.random() * 0.3 - 0.15);
      this.scene.add(shop);
      
      // Add to buildings array and colliders
      this.buildings.push(shop);
      this.collisionManager.addCollider({
        position: new THREE.Vector3(x, y, z),
        radius: 5
      });
    }
  }
  
  createPublicBuildings() {
    const buildingCount = 3;
    const minRadius = 70;
    const maxRadius = 90;
    
    for (let i = 0; i < buildingCount; i++) {
      const angle = ((i / buildingCount) * Math.PI * 2) + 0.4;
      const radius = minRadius + Math.random() * (maxRadius - minRadius);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      // Calculate ground height at this position
      let y = 0;
      const distFromCenter = Math.sqrt(x * x + z * z);
      if (distFromCenter > 50) {
        // Use same height calculation as in ground manager
        y = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2;
        y += Math.sin(x * 0.01 + z * 0.01) * 3;
        const edgeFactor = (distFromCenter - 50) / 200;
        y += edgeFactor * 10;
      }
      
      const building = this.createPublicBuilding();
      building.position.set(x, y, z);
      building.rotation.y = angle + Math.PI;
      this.scene.add(building);
      
      // Add to buildings array and colliders
      this.buildings.push(building);
      this.collisionManager.addCollider({
        position: new THREE.Vector3(x, y, z),
        radius: 7
      });
    }
  }
  
  createHouse() {
    const { woodTexture, stoneTexture, roofTileTexture } = this.textureEngine.getTextures();
    const houseGroup = new THREE.Group();
    
    // Random house dimensions
    const width = 5 + Math.random() * 3;
    const depth = 5 + Math.random() * 3;
    const height = 3 + Math.random() * 1;
    
    // Create main structure - use BoxBufferGeometry for better quality
    const wallGeometry = new THREE.BoxGeometry(width, height, depth);
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xeeeedd,
      roughness: 0.9,
      metalness: 0.1
    });
    const walls = new THREE.Mesh(wallGeometry, wallMaterial);
    walls.position.y = height / 2;
    walls.castShadow = true;
    walls.receiveShadow = true;
    houseGroup.add(walls);
    
    // Create roof with higher detail
    const roofGeometry = new THREE.CylinderGeometry(0.1, 0.1, width * 1.2, 8, 1, false, Math.PI / 4, Math.PI / 2);
    roofGeometry.rotateZ(Math.PI / 2);
    roofGeometry.scale(1, 1.5, depth * 1.2);
    const roofMaterial = new THREE.MeshStandardMaterial({
      map: roofTileTexture,
      roughness: 0.8,
      metalness: 0.1
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = height + 0.75;
    roof.castShadow = true;
    houseGroup.add(roof);
    
    // Add door
    const doorGeometry = new THREE.BoxGeometry(1.2, 2, 0.2);
    const doorMaterial = new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.8,
      metalness: 0.1
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 1, depth / 2 + 0.01); // Slightly offset to prevent z-fighting
    door.castShadow = true;
    houseGroup.add(door);
    
    // Add windows
    const windowGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.1);
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x88aacc,
      transparent: true,
      opacity: 0.7,
      roughness: 0.3,
      metalness: 0.3
    });
    
    // Front windows
    const frontWindowCount = Math.floor(width / 2);
    for (let i = 0; i < frontWindowCount; i++) {
      const windowSpacing = width / (frontWindowCount + 1);
      const x = -width / 2 + windowSpacing * (i + 1);
      const window = new THREE.Mesh(windowGeometry, windowMaterial);
      window.position.set(x, height / 2 + 0.5, depth / 2 + 0.01); // Slight offset to prevent z-fighting
      houseGroup.add(window);
    }
    
    // Side windows
    const sideWindowCount = Math.floor(depth / 2);
    for (let i = 0; i < sideWindowCount; i++) {
      const windowSpacing = depth / (sideWindowCount + 1);
      const z = -depth / 2 + windowSpacing * (i + 1);
      
      // Left side window
      const leftWindow = new THREE.Mesh(windowGeometry, windowMaterial);
      leftWindow.position.set(-width / 2 - 0.01, height / 2 + 0.5, z); // Slight offset
      leftWindow.rotation.y = Math.PI / 2;
      houseGroup.add(leftWindow);
      
      // Right side window
      const rightWindow = new THREE.Mesh(windowGeometry, windowMaterial);
      rightWindow.position.set(width / 2 + 0.01, height / 2 + 0.5, z); // Slight offset
      rightWindow.rotation.y = Math.PI / 2;
      houseGroup.add(rightWindow);
    }
    
    return houseGroup;
  }
  
  createShop() {
    const { woodTexture, marbleTexture, roofTileTexture } = this.textureEngine.getTextures();
    const shopGroup = new THREE.Group();
    
    // Shop dimensions
    const width = 5 + Math.random() * 2;
    const depth = 5 + Math.random() * 2;
    const height = 3;
    
    // Create main structure
    const wallGeometry = new THREE.BoxGeometry(width, height, depth);
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xdedcb8,
      roughness: 0.9,
      metalness: 0.1
    });
    const walls = new THREE.Mesh(wallGeometry, wallMaterial);
    walls.position.y = height / 2;
    walls.castShadow = true;
    walls.receiveShadow = true;
    shopGroup.add(walls);
    
    // Create flat roof
    const roofGeometry = new THREE.BoxGeometry(width + 0.5, 0.2, depth + 0.5);
    const roofMaterial = new THREE.MeshStandardMaterial({
      map: roofTileTexture,
      roughness: 0.8,
      metalness: 0.1
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = height + 0.1;
    roof.castShadow = true;
    shopGroup.add(roof);
    
    // Create shop front (open front with pillars)
    const frontWidth = width - 1;
    const frontOpeningGeometry = new THREE.BoxGeometry(frontWidth, height - 1, 0.2);
    const frontOpeningMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.8,
      metalness: 0.1
    });
    const frontOpening = new THREE.Mesh(frontOpeningGeometry, frontOpeningMaterial);
    frontOpening.position.set(0, height / 2, depth / 2 + 0.01); // Slight offset to prevent z-fighting
    shopGroup.add(frontOpening);
    
    // Add counter
    const counterGeometry = new THREE.BoxGeometry(frontWidth, 1, 0.8);
    const counterMaterial = new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.8,
      metalness: 0.1
    });
    const counter = new THREE.Mesh(counterGeometry, counterMaterial);
    counter.position.set(0, 0.5, depth / 2 - 0.4);
    counter.castShadow = true;
    shopGroup.add(counter);
    
    // Add support pillars
    const pillarGeometry = new THREE.CylinderGeometry(0.2, 0.2, height, 8);
    const pillarMaterial = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    
    // Add two pillars at the shop front
    for (let i = 0; i < 2; i++) {
      const x = (i === 0 ? -1 : 1) * (frontWidth / 2 - 0.2);
      const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
      pillar.position.set(x, height / 2, depth / 2);
      pillar.castShadow = true;
      shopGroup.add(pillar);
    }
    
    // Add canopy/awning
    const canopyGeometry = new THREE.BoxGeometry(width, 0.1, 1.5);
    const canopyMaterial = new THREE.MeshStandardMaterial({
      color: 0xc25b3d,
      roughness: 0.9,
      metalness: 0.1
    });
    const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
    canopy.position.set(0, height - 0.5, depth / 2 + 0.75);
    canopy.castShadow = true;
    shopGroup.add(canopy);
    
    // Add merchandise on counter
    for (let i = 0; i < 5; i++) {
      const itemType = Math.floor(Math.random() * 3);
      const itemMaterial = new THREE.MeshStandardMaterial({
        color: [0xc7a95e, 0xad6245, 0x8b4513][itemType],
        roughness: 0.8,
        metalness: 0.1
      });
      const itemGeometry = [
        new THREE.BoxGeometry(0.3, 0.3, 0.3),
        new THREE.SphereGeometry(0.2, 8, 8),
        new THREE.CylinderGeometry(0.15, 0.15, 0.3, 8)
      ][itemType];
      const item = new THREE.Mesh(itemGeometry, itemMaterial);
      const x = (Math.random() * frontWidth) - (frontWidth / 2);
      item.position.set(x, 1.1, depth / 2 - 0.4);
      item.rotation.y = Math.random() * Math.PI;
      item.castShadow = true;
      shopGroup.add(item);
    }
    
    return shopGroup;
  }
  
  createPublicBuilding() {
    const { marbleTexture, roofTileTexture } = this.textureEngine.getTextures();
    const buildingGroup = new THREE.Group();
    
    // Building dimensions
    const width = 8 + Math.random() * 3;
    const depth = 8 + Math.random() * 3;
    const height = 5;
    
    // Create base platform
    const platformGeometry = new THREE.BoxGeometry(width + 2, 0.5, depth + 2);
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = 0.25; // Half height above ground
    platform.receiveShadow = true;
    buildingGroup.add(platform);
    
    // Create main structure
    const wallGeometry = new THREE.BoxGeometry(width, height, depth);
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      map: marbleTexture,
      roughness: 0.6,
      metalness: 0.1
    });
    const walls = new THREE.Mesh(wallGeometry, wallMaterial);
    walls.position.y = height / 2 + 0.5; // Position on top of platform
    walls.castShadow = true;
    walls.receiveShadow = true;
    buildingGroup.add(walls);
    
    // Create front columns
    const columnCount = Math.floor(width / 2);
    for (let i = 0; i < columnCount; i++) {
      const spacing = width / (columnCount - 1);
      const x = -width / 2 + spacing * i;
      
      if (i > 0 && i < columnCount - 1) {
        const column = this.createSimpleColumn(height - 0.5, marbleTexture);
        column.position.set(x, 0.5, depth / 2 + 1);
        buildingGroup.add(column);
      }
    }
    
    // Create front steps
    const steps = [
      { width: width + 2, depth: 1, height: 0.2, z: depth / 2 + 2.2 },
      { width: width + 1.5, depth: 1, height: 0.2, z: depth / 2 + 1.2 }
    ];
    steps.forEach(stepData => {
      const stepGeometry = new THREE.BoxGeometry(stepData.width, stepData.height, stepData.depth);
      const step = new THREE.Mesh(stepGeometry, platformMaterial);
      step.position.set(0, stepData.height / 2, stepData.z);
      step.receiveShadow = true;
      buildingGroup.add(step);
    });
    
    // Create pediment (triangular top)
    const pedimentGeometry = new THREE.CylinderGeometry(0.1, 0.1, width, 3, 1, false, 0, Math.PI);
    pedimentGeometry.rotateZ(Math.PI / 2);
    pedimentGeometry.rotateY(Math.PI / 2);
    pedimentGeometry.scale(1, 1.2, 1);
    const pedimentMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    const pediment = new THREE.Mesh(pedimentGeometry, pedimentMaterial);
    pediment.position.set(0, height + 0.5, depth / 2 + 0.5);
    pediment.castShadow = true;
    buildingGroup.add(pediment);
    
    // Create roof
    const roofGeometry = new THREE.BoxGeometry(width + 1, 0.3, depth + 1);
    const roofMaterial = new THREE.MeshStandardMaterial({
      map: roofTileTexture,
      roughness: 0.7,
      metalness: 0.1
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = height + 1;
    roof.castShadow = true;
    buildingGroup.add(roof);
    
    // Create large doorway
    const doorGeometry = new THREE.BoxGeometry(width / 3, height / 1.5, 0.5);
    const doorMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.8,
      metalness: 0.2
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, height / 3 + 0.5, depth / 2 + 0.3);
    buildingGroup.add(door);
    
    return buildingGroup;
  }
  
  createSimpleColumn(height, marbleTexture) {
    const columnGroup = new THREE.Group();
    
    // Base
    const baseGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 16);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.1; // Half height above ground
    base.castShadow = true;
    base.receiveShadow = true;
    columnGroup.add(base);
    
    // Shaft
    const shaftGeometry = new THREE.CylinderGeometry(0.3, 0.35, height, 16);
    const shaft = new THREE.Mesh(shaftGeometry, baseMaterial);
    shaft.position.y = height / 2 + 0.2; // Position on top of base
    shaft.castShadow = true;
    columnGroup.add(shaft);
    
    // Capital
    const capitalGeometry = new THREE.CylinderGeometry(0.4, 0.3, 0.2, 16);
    const capital = new THREE.Mesh(capitalGeometry, baseMaterial);
    capital.position.y = height + 0.3; // Position on top of shaft
    capital.castShadow = true;
    columnGroup.add(capital);
    
    return columnGroup;
  }
}