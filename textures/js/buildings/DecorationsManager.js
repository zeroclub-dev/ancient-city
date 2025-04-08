/**
 * DecorationsManager
 * Handles creation and management of decorative elements
 */
class DecorationsManager {
  constructor(scene, textureEngine, collisionManager) {
    this.scene = scene;
    this.textureEngine = textureEngine;
    this.collisionManager = collisionManager;
    this.decorations = [];
  }
  
  createDecorations() {
    // Add various decorations around the city
    this.addOliveTrees();
    this.addFlowerBeds();
    this.addStatues();
    this.addBenches();
    this.addPaths();
    this.addWaterFeatures();
    
    return this.decorations;
  }
  
  addOliveTrees() {
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const radius = 40 + Math.random() * 10;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      // Get approximate ground height at this position
      let y = 0;
      const distFromCenter = Math.sqrt(x * x + z * z);
      if (distFromCenter > 50) {
        // Use same height calculation as in ground manager
        y = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2;
        y += Math.sin(x * 0.01 + z * 0.01) * 3;
        const edgeFactor = (distFromCenter - 50) / 200;
        y += edgeFactor * 10;
      }
      
      const oliveTree = this.createOliveTree();
      oliveTree.position.set(x, y, z);
      this.scene.add(oliveTree);
      this.decorations.push(oliveTree);
      
      // Add to collision objects
      this.collisionManager.addCollider({
        position: new THREE.Vector3(x, y, z),
        radius: 1.2
      });
    }
  }
  
  createOliveTree() {
    const treeGroup = new THREE.Group();
    
    // Create trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.9,
      metalness: 0.1
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1; // Half height above ground
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);
    
    // Create twisted branches
    const branchMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.9,
      metalness: 0.1
    });
    
    // Add a few main branches
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const branchGeometry = new THREE.CylinderGeometry(0.1, 0.15, 1.2, 6);
      const branch = new THREE.Mesh(branchGeometry, branchMaterial);
      branch.position.set(
        Math.cos(angle) * 0.4,
        1.8,
        Math.sin(angle) * 0.4
      );
      
      // Rotate the branch outward
      branch.rotation.z = Math.PI / 3 * Math.cos(angle);
      branch.rotation.x = Math.PI / 3 * Math.sin(angle);
      branch.castShadow = true;
      treeGroup.add(branch);
    }
    
    // Create foliage as multiple small spheres
    const foliageMaterial = new THREE.MeshStandardMaterial({
      color: 0x708d4e,
      roughness: 0.9,
      metalness: 0.1
    });
    for (let i = 0; i < 30; i++) {
      const foliageSize = 0.3 + Math.random() * 0.3;
      const foliageGeometry = new THREE.SphereGeometry(foliageSize, 8, 8);
      const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
      
      // Position foliage around in a roughly spherical pattern
      const foliageAngle = Math.random() * Math.PI * 2;
      const foliageRadius = 0.7 + Math.random() * 0.7;
      const heightVariation = 0.7 + Math.random() * 1;
      foliage.position.set(
        Math.cos(foliageAngle) * foliageRadius,
        2 + heightVariation,
        Math.sin(foliageAngle) * foliageRadius
      );
      foliage.castShadow = true;
      treeGroup.add(foliage);
    }
    
    return treeGroup;
  }
  
  addFlowerBeds() {
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const radius = 30;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      // Get approximate ground height at this position
      let y = 0;
      const distFromCenter = Math.sqrt(x * x + z * z);
      if (distFromCenter > 50) {
        // Use same height calculation as in ground manager
        y = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2;
        y += Math.sin(x * 0.01 + z * 0.01) * 3;
        const edgeFactor = (distFromCenter - 50) / 200;
        y += edgeFactor * 10;
      }
      
      const flowerBed = this.createFlowerBed();
      flowerBed.position.set(x, y, z);
      this.scene.add(flowerBed);
      this.decorations.push(flowerBed);
    }
  }
  
  createFlowerBed() {
    const flowerBedGroup = new THREE.Group();
    
    // Create the bed border
    const borderGeometry = new THREE.CylinderGeometry(2, 2, 0.3, 24);
    const borderMaterial = new THREE.MeshStandardMaterial({
      color: 0xccc0a8,
      roughness: 0.9,
      metalness: 0.1
    });
    const border = new THREE.Mesh(borderGeometry, borderMaterial);
    border.position.y = 0.15; // Half height above ground
    border.receiveShadow = true;
    flowerBedGroup.add(border);
    
    // Create soil
    const soilGeometry = new THREE.CylinderGeometry(1.9, 1.9, 0.2, 24);
    const soilMaterial = new THREE.MeshStandardMaterial({
      color: 0x54321c,
      roughness: 0.9,
      metalness: 0.0
    });
    const soil = new THREE.Mesh(soilGeometry, soilMaterial);
    soil.position.y = 0.15; // Same height as border
    soil.receiveShadow = true;
    flowerBedGroup.add(soil);
    
    // Create flowers and plants
    const flowerColors = [0xe7493a, 0xffeb3b, 0xf5b8d1, 0xe91e63, 0xffffff];
    for (let i = 0; i < 30; i++) {
      const flowerColor = flowerColors[Math.floor(Math.random() * flowerColors.length)];
      
      // Create stem
      const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3 + Math.random() * 0.3, 6);
      const stemMaterial = new THREE.MeshStandardMaterial({
        color: 0x2e7d32,
        roughness: 0.9,
        metalness: 0.0
      });
      const stem = new THREE.Mesh(stemGeometry, stemMaterial);
      
      // Create flower head
      const flowerGeometry = new THREE.SphereGeometry(0.1, 8, 8);
      const flowerMaterial = new THREE.MeshStandardMaterial({
        color: flowerColor,
        roughness: 0.8,
        metalness: 0.1
      });
      const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
      
      // Position flower randomly within bed
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 1.8;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const stemHeight = 0.3 + Math.random() * 0.3;
      
      stem.position.set(x, stemHeight / 2 + 0.25, z); // Position stem above soil
      stem.castShadow = true;
      flowerBedGroup.add(stem);
      
      flower.position.set(x, stemHeight + 0.25, z); // Position flower on top of stem
      flower.castShadow = true;
      flowerBedGroup.add(flower);
    }
    
    return flowerBedGroup;
  }
  
  addStatues() {
      const { marbleTexture } = this.textureEngine.getTextures();
      
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 + 0.2;
        const radius = 50;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        // Get approximate ground height at this position
        let y = 0;
        const distFromCenter = Math.sqrt(x * x + z * z);
        if (distFromCenter > 50) {
          // Use same height calculation as in ground manager
          y = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2;
          y += Math.sin(x * 0.01 + z * 0.01) * 3;
          const edgeFactor = (distFromCenter - 50) / 200;
          y += edgeFactor * 10;
        }
        
        const statueBase = new THREE.Group();
        
        // Create pedestal
        const pedestalGeometry = new THREE.BoxGeometry(2, 1, 2);
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
        statueBase.add(pedestal);
        
        // Add statue on top
        const statue = this.createStatue(marbleTexture);
        statue.position.y = 1; // Position on top of pedestal
        statue.scale.set(0.8, 0.8, 0.8);
        statueBase.add(statue);
        
        statueBase.position.set(x, y, z);
        statueBase.rotation.y = Math.random() * Math.PI * 2;
        this.scene.add(statueBase);
        this.decorations.push(statueBase);
        
        // Add to collision objects
        this.collisionManager.addCollider({
          position: new THREE.Vector3(x, y, z),
          radius: 1.5
        });
      }
    }
    
    createStatue(marbleTexture) {
      const statueGroup = new THREE.Group();
      
      // Create base
      const baseGeometry = new THREE.CylinderGeometry(0.5, 0.6, 0.2, 16);
      const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: marbleTexture,
        roughness: 0.5,
        metalness: 0.1
      });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.y = 0.1; // Half height above ground
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
      const torsoGeometry = new THREE.CylinderGeometry(0.25, 0.2, 1, 8);
      const torso = new THREE.Mesh(torsoGeometry, bodyMaterial);
      torso.position.y = 0.7; // Position on top of base
      torso.castShadow = true;
      statueGroup.add(torso);
      
      // Head
      const headGeometry = new THREE.SphereGeometry(0.2, 16, 16);
      const head = new THREE.Mesh(headGeometry, bodyMaterial);
      head.position.y = 1.35; // Position on top of torso
      head.castShadow = true;
      statueGroup.add(head);
      
      // Arms
      const armGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.8, 8);
      
      // Different arm pose
      if (Math.random() > 0.5) {
        // Forward position
        const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
        leftArm.position.set(-0.3, 0.8, 0.1);
        leftArm.rotation.x = -Math.PI / 6;
        leftArm.rotation.z = Math.PI / 6;
        leftArm.castShadow = true;
        statueGroup.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
        rightArm.position.set(0.3, 0.8, 0.1);
        rightArm.rotation.x = -Math.PI / 6;
        rightArm.rotation.z = -Math.PI / 6;
        rightArm.castShadow = true;
        statueGroup.add(rightArm);
      } else {
        // Contrapposto pose
        const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
        leftArm.position.set(-0.3, 0.8, 0);
        leftArm.rotation.z = Math.PI / 8;
        leftArm.castShadow = true;
        statueGroup.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
        rightArm.position.set(0.3, 0.8, 0);
        rightArm.rotation.x = -Math.PI / 2;
        rightArm.rotation.z = -Math.PI / 8;
        rightArm.castShadow = true;
        statueGroup.add(rightArm);
      }
      
      // Lower body
      const lowerGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.8, 16);
      const lower = new THREE.Mesh(lowerGeometry, bodyMaterial);
      lower.position.y = 0.1; // Position at bottom of torso
      lower.castShadow = true;
      statueGroup.add(lower);
      
      return statueGroup;
    }
    
    addBenches() {
      const { woodTexture, marbleTexture } = this.textureEngine.getTextures();
      
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + 0.1;
        const radius = 25;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        // Get approximate ground height at this position
        let y = 0;
        const distFromCenter = Math.sqrt(x * x + z * z);
        if (distFromCenter > 50) {
          // Use same height calculation as in ground manager
          y = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2;
          y += Math.sin(x * 0.01 + z * 0.01) * 3;
          const edgeFactor = (distFromCenter - 50) / 200;
          y += edgeFactor * 10;
        }
        
        const bench = this.createBench(woodTexture, marbleTexture);
        bench.position.set(x, y, z);
        bench.rotation.y = angle + Math.PI;
        this.scene.add(bench);
        this.decorations.push(bench);
        
        // Add to collision objects
        this.collisionManager.addCollider({
          position: new THREE.Vector3(x, y, z),
          radius: 1.2
        });
      }
    }
    
    createBench(woodTexture, marbleTexture) {
      const benchGroup = new THREE.Group();
      // Create bench seat
      const seatGeometry = new THREE.BoxGeometry(2, 0.1, 0.6);
      const woodMaterial = new THREE.MeshStandardMaterial({
        map: woodTexture,
        roughness: 0.8,
        metalness: 0.1
      });
      const seat = new THREE.Mesh(seatGeometry, woodMaterial);
      seat.position.y = 0.5; // Seat height
      seat.castShadow = true;
      seat.receiveShadow = true;
      benchGroup.add(seat);
      
      // Create bench backrest
      const backrestGeometry = new THREE.BoxGeometry(2, 0.6, 0.1);
      const backrest = new THREE.Mesh(backrestGeometry, woodMaterial);
      backrest.position.set(0, 0.8, -0.25); // Position above seat
      backrest.castShadow = true;
      benchGroup.add(backrest);
      
      // Create bench legs
      const legGeometry = new THREE.BoxGeometry(0.1, 0.5, 0.6);
      const stoneMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        map: marbleTexture,
        roughness: 0.8,
        metalness: 0.1
      });
      
      // Left leg
      const leftLeg = new THREE.Mesh(legGeometry, stoneMaterial);
      leftLeg.position.set(-0.8, 0.25, 0); // Half height above ground
      leftLeg.castShadow = true;
      leftLeg.receiveShadow = true;
      benchGroup.add(leftLeg);
      
      // Right leg
      const rightLeg = new THREE.Mesh(legGeometry, stoneMaterial);
      rightLeg.position.set(0.8, 0.25, 0); // Half height above ground
      rightLeg.castShadow = true;
      rightLeg.receiveShadow = true;
      benchGroup.add(rightLeg);
      
      return benchGroup;
    }
    
    addPaths() {
      // Create main paths connecting different areas
      
      // Create path from agora to temple
      this.createPathBetween(
        new THREE.Vector3(0, 0.05, 0),
        new THREE.Vector3(-40, 0.05, 0),
        8, // width
        0xd9c8a9 // color
      );
      
      // Create circular path around agora
      this.createCircularPath(
        new THREE.Vector3(0, 0.05, 0),
        30, // radius
        6, // width
        0xd9c8a9 // color
      );
      
      // Create radiating paths from agora
      const pathCount = 8;
      for (let i = 0; i < pathCount; i++) {
        const angle = (i / pathCount) * Math.PI * 2;
        
        // Skip path where temple path already exists
        if (Math.abs(angle - Math.PI) > 0.4) {
          const startPoint = new THREE.Vector3(
            Math.cos(angle) * 30,
            0.05,
            Math.sin(angle) * 30
          );
          const endPoint = new THREE.Vector3(
            Math.cos(angle) * 80,
            0.05,
            Math.sin(angle) * 80
          );
          this.createPathBetween(startPoint, endPoint, 5, 0xd9c8a9);
        }
      }
    }
    
    createPathBetween(startPoint, endPoint, width, color) {
      // Create a path between two points
      const pathDirection = new THREE.Vector3().subVectors(endPoint, startPoint);
      const pathLength = pathDirection.length();
      
      // Create path geometry
      const pathGeometry = new THREE.PlaneGeometry(width, pathLength);
      const pathMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.9,
        metalness: 0.0
      });
      const path = new THREE.Mesh(pathGeometry, pathMaterial);
      
      // Position and rotate path
      path.position.copy(startPoint).add(endPoint).multiplyScalar(0.5);
      
      // Calculate rotation to align with path direction
      path.rotation.x = -Math.PI / 2;
      path.rotation.z = -Math.atan2(pathDirection.z, pathDirection.x) + Math.PI / 2;
      path.receiveShadow = true;
      
      // Raise path slightly to prevent z-fighting
      path.position.y += 0.02;
      
      this.scene.add(path);
      this.decorations.push(path);
      
      // Add some pebbles along the path
      this.addPathDecorations(startPoint, endPoint, width);
    }
    
    createCircularPath(center, radius, width, color) {
      // Create a circular path
      const pathGeometry = new THREE.RingGeometry(radius - width/2, radius + width/2, 64);
      const pathMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.9,
        metalness: 0.0
      });
      const path = new THREE.Mesh(pathGeometry, pathMaterial);
      path.position.copy(center);
      path.rotation.x = -Math.PI / 2;
      
      // Raise path slightly to prevent z-fighting
      path.position.y += 0.02;
      
      path.receiveShadow = true;
      this.scene.add(path);
      this.decorations.push(path);
      
      // Add some pebbles along the path
      for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2;
        const pathRadius = radius - width/2 + Math.random() * width;
        const x = center.x + Math.cos(angle) * pathRadius;
        const z = center.z + Math.sin(angle) * pathRadius;
        this.createPebble(x, center.y + 0.05, z);
      }
    }
    
    addPathDecorations(startPoint, endPoint, width) {
      // Add pebbles and other details along a path
      const pathVector = new THREE.Vector3().subVectors(endPoint, startPoint);
      const pathLength = pathVector.length();
      const pathDirection = pathVector.clone().normalize();
      
      // Add some pebbles along the path
      const pebbleCount = Math.floor(pathLength / 2);
      for (let i = 0; i < pebbleCount; i++) {
        const t = Math.random();
        const position = new THREE.Vector3().copy(startPoint)
          .add(pathVector.clone().multiplyScalar(t));
        
        // Offset position to be on the path
        const offsetDirection = new THREE.Vector3(-pathDirection.z, 0, pathDirection.x);
        const offset = (Math.random() - 0.5) * (width - 0.5);
        position.add(offsetDirection.multiplyScalar(offset));
        
        // Raise pebble slightly above path
        position.y += 0.03;
        
        this.createPebble(position.x, position.y, position.z);
      }
    }
    
    createPebble(x, y, z) {
      const size = 0.05 + Math.random() * 0.1;
      const pebbleGeometry = new THREE.DodecahedronGeometry(size, 0);
      const pebbleMaterial = new THREE.MeshStandardMaterial({
        color: 0xb5b5b5,
        roughness: 0.9,
        metalness: 0.1
      });
      const pebble = new THREE.Mesh(pebbleGeometry, pebbleMaterial);
      pebble.position.set(x, y, z);
      pebble.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      pebble.receiveShadow = true;
      pebble.castShadow = true;
      this.scene.add(pebble);
      this.decorations.push(pebble);
    }
    
    addWaterFeatures() {
      // Create a decorative fountain in the scene
      this.createFountain(new THREE.Vector3(20, 0, -30), 5);
      
      // Create a small pond
      this.createPond(new THREE.Vector3(30, 0, 40), 15);
    }
    
    createFountain(position, size) {
      const { marbleTexture, goldTexture } = this.textureEngine.getTextures();
      const fountainGroup = new THREE.Group();
      
      // Get approximate ground height at this position
      let y = 0;
      const distFromCenter = Math.sqrt(position.x * position.x + position.z * position.z);
      if (distFromCenter > 50) {
        // Use same height calculation as in ground manager
        y = Math.sin(position.x * 0.05) * Math.cos(position.z * 0.05) * 2;
        y += Math.sin(position.x * 0.01 + position.z * 0.01) * 3;
        const edgeFactor = (distFromCenter - 50) / 200;
        y += edgeFactor * 10;
      }
      
      // Create fountain base
      const baseGeometry = new THREE.CylinderGeometry(size, size * 1.2, 1, 32);
      const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: marbleTexture,
        roughness: 0.5,
        metalness: 0.1
      });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.y = 0.5; // Half height above ground
      base.receiveShadow = true;
      fountainGroup.add(base);
      
      // Create water basin
      const basinGeometry = new THREE.CylinderGeometry(size * 0.8, size * 0.8, 0.5, 32);
      const basinMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: marbleTexture,
        roughness: 0.5,
        metalness: 0.1
      });
      const basin = new THREE.Mesh(basinGeometry, basinMaterial);
      basin.position.y = 1.25; // Position on top of base
      basin.receiveShadow = true;
      fountainGroup.add(basin);
      
      // Create water surface
      const waterGeometry = new THREE.CircleGeometry(size * 0.78, 32);
      const waterMaterial = new THREE.MeshStandardMaterial({
        color: 0x70b8ff,
        transparent: true,
        opacity: 0.7,
        roughness: 0.2,
        metalness: 0.5
      });
      const water = new THREE.Mesh(waterGeometry, waterMaterial);
      water.position.y = 1.51; // Slightly above basin
      water.rotation.x = -Math.PI / 2;
      fountainGroup.add(water);
      
      // Create center column
      const columnGeometry = new THREE.CylinderGeometry(0.5, 0.7, 2, 16);
      const columnMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: marbleTexture,
        roughness: 0.5,
        metalness: 0.1
      });
      const column = new THREE.Mesh(columnGeometry, columnMaterial);
      column.position.y = 2.5; // Position on top of basin
      column.castShadow = true;
      fountainGroup.add(column);
      
      // Create fountain top
      const topGeometry = new THREE.SphereGeometry(1, 16, 16);
      const topMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        map: goldTexture,
        roughness: 0.3,
        metalness: 0.8
      });
      const top = new THREE.Mesh(topGeometry, topMaterial);
      top.position.y = 4; // Position on top of column
      top.castShadow = true;
      fountainGroup.add(top);
      
      // Add a point light in the fountain for glow
      const fountainLight = new THREE.PointLight(0x70d1ff, 1, 20);
      fountainLight.position.set(0, 2, 0);
      fountainGroup.add(fountainLight);
      
      // Position the fountain
      fountainGroup.position.set(position.x, y, position.z);
      this.scene.add(fountainGroup);
      this.decorations.push(fountainGroup);
      
      // Add to collision objects
      this.collisionManager.addCollider({
        position: new THREE.Vector3(position.x, y, position.z),
        radius: size * 1.2
      });
      
      return fountainGroup;
    }
    
    createPond(position, size) {
      const pondGroup = new THREE.Group();
      
      // Get approximate ground height at this position
      let y = 0;
      const distFromCenter = Math.sqrt(position.x * position.x + position.z * position.z);
      if (distFromCenter > 50) {
        // Use same height calculation as in ground manager
        y = Math.sin(position.x * 0.05) * Math.cos(position.z * 0.05) * 2;
        y += Math.sin(position.x * 0.01 + position.z * 0.01) * 3;
        const edgeFactor = (distFromCenter - 50) / 200;
        y += edgeFactor * 10;
      }
      
      // Create pond shape
      const pondGeometry = new THREE.CircleGeometry(size, 32);
      const pondMaterial = new THREE.MeshStandardMaterial({
        color: 0x70b8ff,
        transparent: true,
        opacity: 0.8,
        roughness: 0.2,
        metalness: 0.5
      });
      const pond = new THREE.Mesh(pondGeometry, pondMaterial);
      pond.rotation.x = -Math.PI / 2;
      pond.position.y = 0.05; // Slightly above ground to prevent z-fighting
      pondGroup.add(pond);
      
      // Create pond rim
      const rimGeometry = new THREE.RingGeometry(size, size + 0.5, 32);
      const rimMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        roughness: 0.8,
        metalness: 0.1
      });
      const rim = new THREE.Mesh(rimGeometry, rimMaterial);
      rim.rotation.x = -Math.PI / 2;
      rim.position.y = 0.07; // Slightly above pond
      pondGroup.add(rim);
      
      // Add some rocks around the pond
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const radius = size + 0.8 + Math.random() * 1.5;
        const rockSize = 0.2 + Math.random() * 0.4;
        const rockGeometry = new THREE.DodecahedronGeometry(rockSize, 1);
        const rockMaterial = new THREE.MeshStandardMaterial({
          color: 0x888888,
          roughness: 0.9,
          metalness: 0.1
        });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.set(
          Math.cos(angle) * radius,
          rockSize / 2, // Half height above ground
          Math.sin(angle) * radius
        );
        rock.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );
        rock.castShadow = true;
        rock.receiveShadow = true;
        pondGroup.add(rock);
      }
      
      // Add some lilypads
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * (size * 0.8);
        const lilypadSize = 0.3 + Math.random() * 0.4;
        const lilypadGeometry = new THREE.CircleGeometry(lilypadSize, 8);
        const lilypadMaterial = new THREE.MeshStandardMaterial({
          color: 0x2e7d32,
          roughness: 0.8,
          metalness: 0.1
        });
        const lilypad = new THREE.Mesh(lilypadGeometry, lilypadMaterial);
        lilypad.position.set(
          Math.cos(angle) * radius,
          0.1, // Slightly above water surface
          Math.sin(angle) * radius
        );
        lilypad.rotation.x = -Math.PI / 2;
        lilypad.rotation.z = Math.random() * Math.PI * 2;
        pondGroup.add(lilypad);
        
        // Add occasional lily flower
        if (Math.random() > 0.5) {
          const flowerGeometry = new THREE.SphereGeometry(0.15, 8, 8);
          const flowerMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.8,
            metalness: 0.1
          });
          const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
          flower.position.set(
            Math.cos(angle) * radius,
            0.2, // Above lilypad
            Math.sin(angle) * radius
          );
          pondGroup.add(flower);
        }
      }
      
      // Position the pond
      pondGroup.position.set(position.x, y, position.z);
      this.scene.add(pondGroup);
      this.decorations.push(pondGroup);
      
      // Add to collision objects
      this.collisionManager.addCollider({
        position: new THREE.Vector3(position.x, y, position.z),
        radius: size + 0.5
      });
      
      return pondGroup;
    }
  }