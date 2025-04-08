/**
 * StructuresManager
 * Handles creation and management of large public structures
 */
class StructuresManager {
  constructor(scene, textureEngine, collisionManager) {
    this.scene = scene;
    this.textureEngine = textureEngine;
    this.collisionManager = collisionManager;
    this.structures = [];
  }
  
  createStructures() {
    // Create main agora (central square)
    this.createAgora();
    
    // Create a theater
    this.createTheater();
    
    // Create a stoa (covered walkway)
    this.createStoa();
    
    return this.structures;
  }
  
  createAgora() {
    const { marbleTexture, woodTexture, tilesTexture } = this.textureEngine.getTextures();
    const agoraGroup = new THREE.Group();
    
    // Create main platform
    const platformGeometry = new THREE.BoxGeometry(50, 1, 50);
    const platformMaterial = new THREE.MeshStandardMaterial({
      map: tilesTexture,
      roughness: 0.7,
      metalness: 0.0
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = 0.5;
    platform.receiveShadow = true;
    platform.name = "floor_agora_platform";
    platform.userData.isFloor = true;
    agoraGroup.add(platform);
    
    // Add platform collision
    this.collisionManager.addCollider({
      position: new THREE.Vector3(0, 0.5, 0),
      radius: 25,
      type: 'box',
      width: 50,
      height: 1,
      depth: 50
    });
    
    // FIX: Create proper visible stairs - THREE LEVELS OF STAIRS 
    // First step (outermost)
    const step1Geometry = new THREE.BoxGeometry(54, 0.3, 54);
    const stepMaterial = new THREE.MeshStandardMaterial({
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    const step1 = new THREE.Mesh(step1Geometry, stepMaterial);
    step1.position.y = 0.15; // Clearly visible above ground
    step1.receiveShadow = true;
    agoraGroup.add(step1);
    
    // Second step (middle)
    const step2Geometry = new THREE.BoxGeometry(52, 0.3, 52);
    const step2 = new THREE.Mesh(step2Geometry, stepMaterial);
    step2.position.y = 0.3; // Above the first step
    step2.receiveShadow = true;
    agoraGroup.add(step2);
    
    // Third step (innermost)
    const step3Geometry = new THREE.BoxGeometry(51, 0.2, 51);
    const step3 = new THREE.Mesh(step3Geometry, stepMaterial);
    step3.position.y = 0.45; // Directly below the platform
    step3.receiveShadow = true;
    agoraGroup.add(step3);
    
    // FIX: Add collisions for all steps
    this.collisionManager.addCollider({
      position: new THREE.Vector3(0, 0.15, 0),
      radius: 27,
      type: 'box',
      width: 54,
      height: 0.3,
      depth: 54
    });
    
    this.collisionManager.addCollider({
      position: new THREE.Vector3(0, 0.3, 0),
      radius: 26,
      type: 'box',
      width: 52,
      height: 0.3,
      depth: 52
    });
    
    this.collisionManager.addCollider({
      position: new THREE.Vector3(0, 0.45, 0),
      radius: 25.5,
      type: 'box',
      width: 51,
      height: 0.2,
      depth: 51
    });
    
    // Add columns around perimeter
    const columnCount = 20;
    const radius = 22;
    for (let i = 0; i < columnCount; i++) {
      const angle = (i / columnCount) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const column = this.createColumn(2.5, marbleTexture);
      column.position.set(x, 0.5, z);
      agoraGroup.add(column);
      
      // FIX: Add proper column collision with height
      this.collisionManager.addCollider({
        position: new THREE.Vector3(x, 1.5, z), // Position centered vertically on column
        radius: 3.0,
        type: 'cylinder',
        height: 3.0 // Full column height
      });
    }
    
    // Add central fountain
    const fountainGroup = this.createFountain(marbleTexture);
    fountainGroup.position.y = 0.5;
    agoraGroup.add(fountainGroup);
    
    // Add fountain to collision objects
    this.collisionManager.addCollider({
      position: new THREE.Vector3(0, 0, 0),
      radius: 6.5
    });
    
    // Add statues around the agora
    this.addAgoraStatues(agoraGroup, marbleTexture);
    
    // Add market stalls around the edges
    this.addMarketStalls(agoraGroup, woodTexture);
    
    // Position the agora
    agoraGroup.position.set(0, 0, 0);
    this.scene.add(agoraGroup);
    this.structures.push(agoraGroup);
    
    return agoraGroup;
  }
  
  createFountain(marbleTexture) {
    const fountainGroup = new THREE.Group();
    
    // Base of fountain
    const fountainBaseGeometry = new THREE.CylinderGeometry(6, 6.5, 1, 32);
    const fountainBaseMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    
    const fountainBase = new THREE.Mesh(fountainBaseGeometry, fountainBaseMaterial);
    fountainBase.position.y = 0.5; // Position half-height above ground
    fountainBase.receiveShadow = true;
    fountainGroup.add(fountainBase);
    
    // Second tier
    const fountainTier2Geometry = new THREE.CylinderGeometry(4, 4.5, 0.8, 32);
    const fountainTier2 = new THREE.Mesh(fountainTier2Geometry, fountainBaseMaterial);
    fountainTier2.position.y = 1.4; // Position on top of the base
    fountainTier2.receiveShadow = true;
    fountainGroup.add(fountainTier2);
    
    // Water basin
    const basinGeometry = new THREE.CylinderGeometry(5, 5, 0.6, 32);
    const basinMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTexture,
      roughness: 0.4,
      metalness: 0.2
    });
    const basin = new THREE.Mesh(basinGeometry, basinMaterial);
    basin.position.y = 1; // Position between base and tier2
    basin.receiveShadow = true;
    fountainGroup.add(basin);
    
    // Center column
    const centerColumnGeometry = new THREE.CylinderGeometry(0.8, 1, 3, 16);
    const centerColumn = new THREE.Mesh(centerColumnGeometry, fountainBaseMaterial);
    centerColumn.position.y = 3; // Place on top of second tier
    centerColumn.castShadow = true;
    fountainGroup.add(centerColumn);
    
    // Top ornament
    const ornamentGeometry = new THREE.SphereGeometry(1, 16, 16);
    const ornamentMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.3,
      metalness: 0.8
    });
    const ornament = new THREE.Mesh(ornamentGeometry, ornamentMaterial);
    ornament.position.y = 4.6; // Position on top of the column
    ornament.castShadow = true;
    fountainGroup.add(ornament);
    
    // Add water
    const waterGeometry = new THREE.CylinderGeometry(4.8, 4.8, 0.2, 32);
    const waterMaterial = new THREE.MeshStandardMaterial({
      color: 0x7FB2F0,
      transparent: true,
      opacity: 0.7,
      roughness: 0.2,
      metalness: 0.1
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.position.y = 1.3; // Position slightly above the basin
    fountainGroup.add(water);
    
    return fountainGroup;
  }
  
  addAgoraStatues(agoraGroup, marbleTexture) {
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const dist = 15;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const statue = this.createStatue(marbleTexture);
      statue.position.set(x, 0.5, z);
      statue.rotation.y = Math.random() * Math.PI * 2;
      agoraGroup.add(statue);
      
      // Add to collision objects
      this.collisionManager.addCollider({
        position: new THREE.Vector3(x, 0, z),
        radius: 1
      });
    }
  }
  
  createStatue(marbleTexture) {
    const statueGroup = new THREE.Group();
    
    // Create base
    const baseGeometry = new THREE.CylinderGeometry(1, 1.2, 0.5, 32);
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
    
    // Create figure body
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    
    // Torso
    const torsoGeometry = new THREE.CylinderGeometry(
      0.4, 0.3, 1.5,
      16, 1, false // Using more segments to avoid gaps
    );
    const torso = new THREE.Mesh(torsoGeometry, bodyMaterial);
    torso.position.y = 1.5; // Position above base
    torso.castShadow = true;
    statueGroup.add(torso);
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.y = 2.4; // Position on top of torso
    head.castShadow = true;
    statueGroup.add(head);
    
    // Add hairstyle
    const isFemale = Math.random() > 0.5;
    
    if (isFemale) {
      // Female hairstyle - gathered hair
      const hairGeometry = new THREE.SphereGeometry(0.33, 16, 16);
      const hair = new THREE.Mesh(hairGeometry, bodyMaterial);
      hair.position.y = 2.5;
      hair.scale.set(1, 0.9, 1);
      statueGroup.add(hair);
      
      // Hair bun
      const bunGeometry = new THREE.SphereGeometry(0.2, 16, 16);
      const bun = new THREE.Mesh(bunGeometry, bodyMaterial);
      bun.position.set(0, 2.6, -0.2);
      statueGroup.add(bun);
    } else {
      // Male hairstyle - short curls
      const hairGeometry = new THREE.SphereGeometry(0.34, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const hair = new THREE.Mesh(hairGeometry, bodyMaterial);
      hair.position.y = 2.45;
      hair.rotation.x = Math.PI;
      statueGroup.add(hair);
      
      // Add laurel crown for some male statues
      if (Math.random() > 0.5) {
        const laurelGeometry = new THREE.TorusGeometry(0.3, 0.04, 8, 16);
        const laurelMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          map: marbleTexture,
          roughness: 0.5,
          metalness: 0.1
        });
        const laurel = new THREE.Mesh(laurelGeometry, laurelMaterial);
        laurel.position.y = 2.5;
        laurel.rotation.x = Math.PI / 2;
        statueGroup.add(laurel);
      }
    }
    
    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.2, 8);
    
    // Different arm poses based on type
    if (Math.random() > 0.5) {
      // Arms extended forward
      const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
      leftArm.position.set(-0.4, 1.8, 0.3);
      leftArm.rotation.x = -Math.PI / 3;
      leftArm.rotation.z = Math.PI / 8;
      leftArm.castShadow = true;
      statueGroup.add(leftArm);
      
      const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
      rightArm.position.set(0.4, 1.8, 0.3);
      rightArm.rotation.x = -Math.PI / 3;
      rightArm.rotation.z = -Math.PI / 8;
      rightArm.castShadow = true;
      statueGroup.add(rightArm);
    } else {
      // One arm raised (typical Greek pose)
      const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
      leftArm.position.set(-0.4, 1.8, 0);
      leftArm.rotation.z = Math.PI / 8;
      leftArm.castShadow = true;
      statueGroup.add(leftArm);
      
      const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
      rightArm.position.set(0.4, 1.8, 0.2);
      rightArm.rotation.x = -Math.PI / 2;
      rightArm.rotation.z = -Math.PI / 8;
      rightArm.castShadow = true;
      statueGroup.add(rightArm);
    }
    
    // Lower body - draped cloth
    const lowerGeometry = new THREE.CylinderGeometry(0.3, 0.5, 1.2, 16);
    const lower = new THREE.Mesh(lowerGeometry, bodyMaterial);
    lower.position.y = 0.7;
    lower.castShadow = true;
    statueGroup.add(lower);
    
    return statueGroup;
  }
  
  addMarketStalls(agoraGroup, woodTexture) {
    for (let i = 0; i < 6; i++) {
      const angle = ((i + 0.5) / 6) * Math.PI * 2;
      const dist = 18;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const stall = this.createMarketStall(woodTexture);
      stall.position.set(x, 0.5, z);
      stall.rotation.y = angle + Math.PI; // Face outward
      agoraGroup.add(stall);
      
      // Add to collision objects
      this.collisionManager.addCollider({
        position: new THREE.Vector3(x, 0, z),
        radius: 2.5
      });
    }
  }
  
  createMarketStall(woodTexture) {
    const stallGroup = new THREE.Group();
    
    // Create stall base
    const baseGeometry = new THREE.BoxGeometry(4, 0.2, 3);
    const baseMaterial = new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.8,
      metalness: 0.1
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.1; // Position half height above ground
    base.receiveShadow = true;
    stallGroup.add(base);
    
    // Create counter
    const counterGeometry = new THREE.BoxGeometry(4, 0.8, 1);
    const counter = new THREE.Mesh(counterGeometry, baseMaterial);
    counter.position.set(0, 0.5, -1); // Position at correct height
    counter.receiveShadow = true;
    counter.castShadow = true;
    stallGroup.add(counter);
    
    // Create posts for canopy
    const postGeometry = new THREE.BoxGeometry(0.2, 2.5, 0.2);
    for (let i = 0; i < 4; i++) {
      const x = i % 2 === 0 ? -1.9 : 1.9;
      const z = i < 2 ? -1.4 : 1.4;
      const post = new THREE.Mesh(postGeometry, baseMaterial);
      post.position.set(x, 1.25, z); // Position half height above base
      post.castShadow = true;
      stallGroup.add(post);
    }
    
    // Create canopy
    const canopyGeometry = new THREE.BoxGeometry(4.2, 0.1, 3.2);
    const canopyMaterial = new THREE.MeshStandardMaterial({
      color: 0xd29869,
      roughness: 0.8,
      metalness: 0.1
    });
    const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
    canopy.position.y = 2.55; // Position on top of posts
    canopy.castShadow = true;
    stallGroup.add(canopy);
    
    // Add some goods on the counter
    const goodsGeometries = [
      new THREE.BoxGeometry(0.4, 0.3, 0.6),
      new THREE.SphereGeometry(0.2, 8, 8),
      new THREE.CylinderGeometry(0.15, 0.15, 0.3, 8)
    ];
    const goodsMaterials = [
      new THREE.MeshStandardMaterial({ color: 0xd1a26c, roughness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: 0xbc8f8f, roughness: 0.8 })
    ];
    
    for (let i = 0; i < 8; i++) {
      const geomIndex = Math.floor(Math.random() * goodsGeometries.length);
      const materialIndex = Math.floor(Math.random() * goodsMaterials.length);
      const good = new THREE.Mesh(goodsGeometries[geomIndex], goodsMaterials[materialIndex]);
      const x = (Math.random() * 3.6) - 1.8;
      const z = -1 + (Math.random() * 0.8) - 0.4;
      good.position.set(x, 1, z); // Position on top of counter
      good.rotation.y = Math.random() * Math.PI;
      good.castShadow = true;
      stallGroup.add(good);
    }
    
    return stallGroup;
  }
  
  createTheater() {
    const { marbleTexture } = this.textureEngine.getTextures();
    const theaterGroup = new THREE.Group();
    
    // Create theater seating (semi-circular rows)
    const rowCount = 12;
    const maxRadius = 20;
    
    for (let i = 0; i < rowCount; i++) {
      const rowRadius = maxRadius * (i + 1) / rowCount;
      const rowHeight = i * 0.5;
      const rowGeometry = new THREE.TorusGeometry(rowRadius, 0.5, 8, 32, Math.PI);
      const rowMaterial = new THREE.MeshStandardMaterial({
        color: 0xdddddd,
        map: marbleTexture,
        roughness: 0.7,
        metalness: 0.1
      });
      const row = new THREE.Mesh(rowGeometry, rowMaterial);
      row.position.y = rowHeight;
      row.rotation.y = Math.PI;
      row.receiveShadow = true;
      theaterGroup.add(row);
    }
    
    // Create orchestra (central circular area)
    const orchestraGeometry = new THREE.CircleGeometry(7, 32);
    const orchestraMaterial = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    const orchestra = new THREE.Mesh(orchestraGeometry, orchestraMaterial);
    orchestra.rotation.x = -Math.PI / 2;
    orchestra.position.y = 0.05; // Slightly above ground to prevent z-fighting
    orchestra.receiveShadow = true;
    theaterGroup.add(orchestra);
    
    // Create skene (stage building)
    const skeneGeometry = new THREE.BoxGeometry(20, 4, 5);
    const skeneMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      map: marbleTexture,
      roughness: 0.6,
      metalness: 0.1
    });
    const skene = new THREE.Mesh(skeneGeometry, skeneMaterial);
    skene.position.set(0, 2, -10); // Position half height above ground
    skene.castShadow = true;
    skene.receiveShadow = true;
    theaterGroup.add(skene);
    
    // Create columns on the skene
    const columnCount = 5;
    const columnSpacing = 18 / (columnCount - 1);
    
    for (let i = 0; i < columnCount; i++) {
      const x = -9 + i * columnSpacing;
      const column = this.createColumn(3, marbleTexture);
      column.position.set(x, 0, -7.5);
      column.scale.set(0.7, 0.7, 0.7);
      theaterGroup.add(column);
    }
    
    // Add decorative elements to the skene (simple pediment)
    const pedimentGeometry = new THREE.CylinderGeometry(0.1, 0.1, 6, 3, 1, false, 0, Math.PI);
    pedimentGeometry.rotateZ(Math.PI / 2);
    pedimentGeometry.rotateY(Math.PI / 2);
    const pedimentMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    const pediment = new THREE.Mesh(pedimentGeometry, pedimentMaterial);
    pediment.position.set(0, 4.5, -7.5);
    pediment.scale.set(1, 1, 1);
    theaterGroup.add(pediment);
    
    // Add masks decoration (theater symbols)
    const maskGeometry = new THREE.SphereGeometry(0.8, 16, 16);
    const maskMaterial = new THREE.MeshStandardMaterial({
      color: 0xeeeedd,
      roughness: 0.7,
      metalness: 0.1
    });
    
    // Comedy mask
    const comedyMask = new THREE.Mesh(maskGeometry, maskMaterial);
    comedyMask.position.set(-5, 3, -7.4);
    comedyMask.scale.set(1, 1.2, 0.4);
    theaterGroup.add(comedyMask);
    
    // Tragedy mask
    const tragedyMask = new THREE.Mesh(maskGeometry, maskMaterial);
    tragedyMask.position.set(5, 3, -7.4);
    tragedyMask.scale.set(1, 1.2, 0.4);
    theaterGroup.add(tragedyMask);
    
    // Position theater
    theaterGroup.position.set(70, 0, -50);
    theaterGroup.rotation.y = Math.PI / 2;
    this.scene.add(theaterGroup);
    this.structures.push(theaterGroup);
    
    // Add to collision objects
    this.collisionManager.addCollider({
      position: new THREE.Vector3(70, 0, -50),
      radius: 20
    });
    
    return theaterGroup;
  }
  
  createStoa() {
    const { marbleTexture, woodTexture, roofTileTexture, } = this.textureEngine.getTextures();
    const stoaGroup = new THREE.Group();
    
    // Dimensions
    const length = 30;
    const width = 8;
    const height = 4;
    
    // Create base platform
    const baseGeometry = new THREE.BoxGeometry(length, 0.5, width);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.25; // Half height above ground
    base.receiveShadow = true;
    stoaGroup.add(base);
    
    // Create back wall
    const wallGeometry = new THREE.BoxGeometry(length, height, 0.5);
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xf0f0f0,
      map: marbleTexture,
      roughness: 0.6,
      metalness: 0.1
    });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(0, height / 2 + 0.5, -width / 2 + 0.25); // Position correctly relative to base
    wall.castShadow = true;
    wall.receiveShadow = true;
    stoaGroup.add(wall);
    
    // Create roof
    const roofGeometry = new THREE.BoxGeometry(length + 1, 0.5, width + 1);
    const roofMaterial = new THREE.MeshStandardMaterial({
      map: roofTileTexture,
      roughness: 0.7,
      metalness: 0.1
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = height + 0.75; // Position on top of walls
    roof.castShadow = true;
    stoaGroup.add(roof);
    
    // Create columns along front edge
    const columnCount = Math.floor(length / 3);
    const columnSpacing = length / (columnCount - 1);
    
    for (let i = 0; i < columnCount; i++) {
      const x = -length / 2 + i * columnSpacing;
      const column = this.createColumn(height - 0.5, marbleTexture);
      column.position.set(x, 0.5, width / 2 - 0.5); // Position on base
      column.scale.set(0.8, 1, 0.8);
      stoaGroup.add(column);
    }
    
    // Add benches along the back wall
    const benchGeometry = new THREE.BoxGeometry(length - 2, 0.5, 1);
    const benchMaterial = new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.6,
      metalness: 0.1
    });
    const bench = new THREE.Mesh(benchGeometry, benchMaterial);
    bench.position.set(0, 0.75, -width / 2 + 1.5); // Position on base
    bench.castShadow = true;
    bench.receiveShadow = true;
    stoaGroup.add(bench);
    
    // Position stoa
    stoaGroup.position.set(0, 0, 60);
    stoaGroup.rotation.y = Math.PI;
    this.scene.add(stoaGroup);
    this.structures.push(stoaGroup);
    
    // Add collision for the base platform
    this.collisionManager.addCollider({
      position: new THREE.Vector3(0, 0.25, 60),
      radius: 15,
      type: 'box',
      width: 30,
      height: 0.5,
      depth: 8
    });
    
    return stoaGroup;
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
    const shaftGeometry = new THREE.CylinderGeometry(0.6, 0.7, height, 32, 6, false); // Closed cylinder to avoid gaps
    const shaftMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    
    // Instead of modifying vertices directly which can cause gaps, use bump mapping for fluting effect
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
}