/**
 * TemplesManager
 * Handles creation and management of temple structures
 * With completely reworked collision and proper stair-to-island connection
 */
class TemplesManager {
  constructor(scene, textureEngine, collisionManager, playerController, questManager, dialogManager) {
    this.scene = scene;
    this.textureEngine = textureEngine;
    this.collisionManager = collisionManager;
    this.playerController = playerController;
    this.questManager = questManager;
    this.dialogManager = dialogManager;
    
    this.temple = null;
    this.stairs = null;
  }
  
  createTempleOfApollo() {
    // Get textures from texture engine
    const { marbleTexture, goldTexture, roofTileTexture, stoneTexture } = this.textureEngine.getTextures();
    
    // Create plain temple without floating - just a regular building
    const templeX = -40;
    const templeZ = -10;
    const templeY = 0; // At ground level
    
    // Create temple group
    this.temple = new THREE.Group();
    this.temple.position.set(templeX, templeY, templeZ);
    this.scene.add(this.temple);
    
    // Create temple structure on regular terrain
    this.createTempleStructure(marbleTexture, goldTexture, roofTileTexture);
    
    // Create entrance area with portal to temple.html
    this.createPortalTrigger(templeX, templeY, templeZ);
    
    // Create stairs leading up to the temple entrance
    this.createTempleStairs(marbleTexture, templeX, templeY, templeZ);
    
    // Add simple lighting
    this.addTempleLighting();
    
    // Add quest marker
    this.questManager.createQuestMarker(new THREE.Vector3(templeX, templeY + 15, templeZ - 6));
    
    return this.temple;
  }
  
  createTempleStructure(marbleTexture, goldTexture, roofTileTexture) {
    // Create a raised platform for the temple
    const platformWidth = 50;
    const platformDepth = 40;
    const platformHeight = 3;
    
    // Base platform
    const platformGeometry = new THREE.BoxGeometry(platformWidth, platformHeight, platformDepth);
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      map: marbleTexture,
      roughness: 0.7,
      metalness: 0.1
    });
    
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = platformHeight/2;
    platform.receiveShadow = true;
    this.temple.add(platform);
    
    // Add collision for the base platform
    this.collisionManager.addCollider({
      position: new THREE.Vector3(
        this.temple.position.x, 
        this.temple.position.y + platformHeight/2, 
        this.temple.position.z
      ),
      type: 'box',
      width: platformWidth,
      height: platformHeight,
      depth: platformDepth
    });
    
    // Create main temple building on the platform
    const templeWidth = 30;
    const templeDepth = 24;
    const templeHeight = 15;
    
    // Temple walls
    const templeGeometry = new THREE.BoxGeometry(templeWidth, templeHeight, templeDepth);
    const templeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTexture, 
      roughness: 0.5,
      metalness: 0.1
    });
    
    const templeBuilding = new THREE.Mesh(templeGeometry, templeMaterial);
    templeBuilding.position.y = platformHeight + templeHeight/2;
    templeBuilding.receiveShadow = true;
    templeBuilding.castShadow = true;
    this.temple.add(templeBuilding);
    
    // Add collision for temple building
    this.collisionManager.addCollider({
      position: new THREE.Vector3(
        this.temple.position.x,
        this.temple.position.y + platformHeight + templeHeight/2,
        this.temple.position.z
      ),
      type: 'box',
      width: templeWidth,
      height: templeHeight,
      depth: templeDepth
    });
    
    // Create columns in front of temple
    const columnSpacing = 4;
    const columnCount = 7;
    const columnHeight = 12;
    
    for (let i = 0; i < columnCount; i++) {
      const x = -columnSpacing * (columnCount - 1) / 2 + i * columnSpacing;
      const column = this.createColumn(columnHeight, marbleTexture);
      column.position.set(x, platformHeight, platformDepth/2 - 4);
      this.temple.add(column);
      
      // Add collision for each column
      this.collisionManager.addCollider({
        position: new THREE.Vector3(
          this.temple.position.x + x,
          this.temple.position.y + platformHeight,
          this.temple.position.z + platformDepth/2 - 4
        ),
        type: 'cylinder',
        radius: 1.2,
        height: columnHeight
      });
    }
    
    // Create temple roof
    const roofWidth = templeWidth + 4;
    const roofDepth = templeDepth + 4;
    const roofHeight = 6;
    
    const roofGeometry = new THREE.CylinderGeometry(0.1, 0.1, roofWidth, 4, 1, false, Math.PI / 4, Math.PI / 2);
    roofGeometry.rotateZ(Math.PI / 2);
    roofGeometry.scale(1, 1.5, roofDepth);
    
    const roofMaterial = new THREE.MeshStandardMaterial({
      map: roofTileTexture,
      roughness: 0.7,
      metalness: 0.2
    });
    
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = platformHeight + templeHeight + 2;
    roof.castShadow = true;
    this.temple.add(roof);
    
    // Create door opening
    const doorWidth = 6;
    const doorHeight = 10;
    const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, 2);
    const doorMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.5,
      metalness: 0.3
    });
    
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, platformHeight + doorHeight/2, platformDepth/2);
    this.temple.add(door);
    
    // Create steps in front of entrance 
    this.createEntranceSteps(marbleTexture);
    
    // Add golden decorations
    this.addGoldenAccents(goldTexture);
  }
  
  createEntranceSteps(marbleTexture) {
    const platformHeight = 3;
    const platformDepth = 40;
    const stepMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    
    // Three steps leading to entrance
    for (let i = 0; i < 3; i++) {
      const stepWidth = 20 - i * 2; // Steps get wider at the bottom
      const stepHeight = 1;
      const stepDepth = 2;
      
      const stepGeometry = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth);
      const step = new THREE.Mesh(stepGeometry, stepMaterial);
      
      // Position steps in front of door
      step.position.set(
        0,
        i * stepHeight + stepHeight/2,
        platformDepth/2 + stepDepth/2 + (i + 1) * stepDepth
      );
      
      step.receiveShadow = true;
      this.temple.add(step);
      
      // Add collision for each step
      this.collisionManager.addCollider({
        position: new THREE.Vector3(
          this.temple.position.x,
          this.temple.position.y + i * stepHeight + stepHeight/2,
          this.temple.position.z + platformDepth/2 + stepDepth/2 + (i + 1) * stepDepth
        ),
        type: 'box',
        width: stepWidth,
        height: stepHeight,
        depth: stepDepth
      });
    }
  }
  
  createTempleStairs(marbleTexture, templeX, templeY, templeZ) {
    // Create stairs leading up to temple platform
    const platformHeight = 3;
    const platformDepth = 40;
    
    // Stair dimensions
    const stairStartZ = templeZ + platformDepth/2 + 20; // Start 20 units away from platform edge
    const stairEndZ = templeZ + platformDepth/2 + 6;    // End 6 units from platform edge
    const stairWidth = 14;
    
    const stepCount = 10;
    const stepHeight = platformHeight / stepCount;
    const totalRunLength = stairStartZ - stairEndZ;
    const stepDepth = totalRunLength / stepCount;
    
    const stepMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTexture,
      roughness: 0.6,
      metalness: 0.1
    });
    
    // Create each step
    for (let i = 0; i < stepCount; i++) {
      const stepGeometry = new THREE.BoxGeometry(stairWidth, stepHeight, stepDepth);
      const step = new THREE.Mesh(stepGeometry, stepMaterial);
      
      // Position each step
      step.position.set(
        templeX,
        templeY + i * stepHeight + stepHeight/2,
        stairStartZ - i * stepDepth - stepDepth/2
      );
      
      step.receiveShadow = true;
      step.castShadow = true;
      this.scene.add(step);
      
      // Add collision for each step
      this.collisionManager.addCollider({
        position: step.position.clone(),
        type: 'box',
        width: stairWidth,
        height: stepHeight,
        depth: stepDepth
      });
    }
    
    // Create railings
    const railingHeight = 1.5;
    const railingWidth = 0.4;
    
    const railingMaterial = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      map: marbleTexture,
      roughness: 0.6,
      metalness: 0.1
    });
    
    // Left and right railings
    const sides = [-1, 1];
    sides.forEach(side => {
      // Base railing
      const xPos = templeX + side * (stairWidth/2 + railingWidth/2);
      
      // Create several railing segments to follow the stairs
      const segmentCount = 3;
      const segmentLength = totalRunLength / segmentCount;
      
      for (let i = 0; i < segmentCount; i++) {
        // Calculate segment position
        const segmentZ = stairStartZ - i * segmentLength - segmentLength/2;
        const segmentY = templeY + (i * stepCount/segmentCount + stepCount/(segmentCount*2)) * stepHeight;
        
        // Create railing segment
        const railingGeometry = new THREE.BoxGeometry(railingWidth, railingHeight, segmentLength);
        const railing = new THREE.Mesh(railingGeometry, railingMaterial);
        
        railing.position.set(xPos, segmentY + railingHeight/2, segmentZ);
        railing.castShadow = true;
        this.scene.add(railing);
        
        // Add collision for railing
        this.collisionManager.addCollider({
          position: railing.position.clone(),
          type: 'box',
          width: railingWidth,
          height: railingHeight,
          depth: segmentLength
        });
        
        // Add posts at segment joints
        if (i < segmentCount) {
          const postGeometry = new THREE.BoxGeometry(railingWidth * 1.5, railingHeight * 2, railingWidth * 1.5);
          const post = new THREE.Mesh(postGeometry, railingMaterial);
          
          post.position.set(
            xPos,
            segmentY + railingHeight,
            stairStartZ - i * segmentLength
          );
          
          post.castShadow = true;
          this.scene.add(post);
          
          // Add collision for post
          this.collisionManager.addCollider({
            position: post.position.clone(),
            type: 'box',
            width: railingWidth * 1.5,
            height: railingHeight * 2,
            depth: railingWidth * 1.5
          });
        }
      }
    });
    
    // Create a path from the bottom of the stairs to ground level
    const pathGeometry = new THREE.BoxGeometry(stairWidth + 4, 0.2, 10);
    const pathMaterial = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      roughness: 0.8,
      metalness: 0.1
    });
    
    const path = new THREE.Mesh(pathGeometry, pathMaterial);
    path.position.set(templeX, templeY + 0.1, stairStartZ + 5);
    path.receiveShadow = true;
    this.scene.add(path);
  }
  
  createColumn(height, marbleTexture) {
    const columnGroup = new THREE.Group();
    
    // Base
    const baseGeometry = new THREE.CylinderGeometry(1.5, 1.7, 0.5, 16);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.25;
    base.castShadow = true;
    base.receiveShadow = true;
    columnGroup.add(base);
    
    // Shaft
    const shaftGeometry = new THREE.CylinderGeometry(1, 1.2, height - 2, 16);
    const shaftMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTexture,
      roughness: 0.5,
      metalness: 0.1
    });
    
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
    shaft.position.y = height/2;
    shaft.castShadow = true;
    columnGroup.add(shaft);
    
    // Capital
    const capitalGeometry = new THREE.CylinderGeometry(1.5, 1, 1.5, 16);
    const capital = new THREE.Mesh(capitalGeometry, baseMaterial);
    capital.position.y = height - 0.5;
    capital.castShadow = true;
    columnGroup.add(capital);
    
    return columnGroup;
  }
  
  addGoldenAccents(goldTexture) {
    // Add golden decorative elements
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      map: goldTexture,
      roughness: 0.3,
      metalness: 0.8
    });
    
    // Create decorative band along the temple
    const bandGeometry = new THREE.BoxGeometry(32, 0.5, 26);
    const band = new THREE.Mesh(bandGeometry, goldMaterial);
    band.position.y = 12;
    band.castShadow = true;
    this.temple.add(band);
    
    // Add golden lyre emblem above entrance
    const lyreGroup = new THREE.Group();
    
    // Create a simplified lyre
    const lyreBaseGeometry = new THREE.CylinderGeometry(0.8, 1, 1.6, 16, 1, false, 0, Math.PI);
    const lyreBase = new THREE.Mesh(lyreBaseGeometry, goldMaterial);
    lyreBase.rotation.y = Math.PI;
    lyreGroup.add(lyreBase);
    
    // Lyre arms
    const sides = [-1, 1];
    sides.forEach(side => {
      const armGeometry = new THREE.TorusGeometry(0.7, 0.15, 8, 12, Math.PI);
      const arm = new THREE.Mesh(armGeometry, goldMaterial);
      arm.position.set(side * 0.7, 0.8, 0);
      arm.rotation.y = side * Math.PI/2;
      lyreGroup.add(arm);
    });
    
    // Add strings
    for (let i = 0; i < 7; i++) {
      const x = -0.6 + i * 0.2;
      const stringGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1.6, 4);
      const string = new THREE.Mesh(stringGeometry, goldMaterial);
      string.position.set(x, 0.8, 0);
      lyreGroup.add(string);
    }
    
    // Position the lyre above the entrance
    lyreGroup.position.set(0, 16, 22);
    lyreGroup.scale.set(3, 3, 3);
    this.temple.add(lyreGroup);
  }
  
  createPortalTrigger(templeX, templeY, templeZ) {
    // Create a trigger area in front of the temple entrance
    const platformDepth = 40;
    const portalPosition = new THREE.Vector3(
      templeX,
      templeY + 3, // At platform height
      templeZ + platformDepth/2 + 1 // Just in front of temple entrance
    );
    
    // Add an invisible trigger box
    const portalGeometry = new THREE.BoxGeometry(6, 6, 1);
    const portalMaterial = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      transparent: true,
      opacity: 0.0 // Invisible
    });
    
    const portalTrigger = new THREE.Mesh(portalGeometry, portalMaterial);
    portalTrigger.position.copy(portalPosition);
    this.scene.add(portalTrigger);
    
    // Create a visual effect for the portal
    const portalEffectGeometry = new THREE.TorusGeometry(2.5, 0.3, 16, 32);
    const portalEffectMaterial = new THREE.MeshBasicMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.7
    });
    
    const portalEffect = new THREE.Mesh(portalEffectGeometry, portalEffectMaterial);
    portalEffect.position.copy(portalPosition);
    portalEffect.rotation.y = Math.PI/2;
    this.scene.add(portalEffect);
    
    // Add a point light for the portal effect
    const portalLight = new THREE.PointLight(0x88ccff, 1.5, 10);
    portalLight.position.copy(portalPosition);
    this.scene.add(portalLight);
    
    // Add animation data for the portal effect
    portalEffect.userData = {
      update: (time) => {
        // Pulsing size effect
        const scale = 1 + Math.sin(time * 0.002) * 0.1;
        portalEffect.scale.set(scale, scale, 1);
        
        // Rotation effect
        portalEffect.rotation.z = time * 0.001;
        
        // Pulsing light
        portalLight.intensity = 1.2 + Math.sin(time * 0.002) * 0.3;
      }
    };
    
    // Add to interactive objects for player detection
    this.playerController.addInteractiveObject({
      object: portalTrigger,
      position: portalPosition,
      name: "Temple Entrance",
      radius: 4,
      interact: () => {
        // Show dialog first
        this.dialogManager.showDialog("Temple Guardian Voice", "You have reached the sacred Temple of Apollo. Enter to explore the ancient musical instruments of the gods.");
        
        // Then redirect to temple.html
        setTimeout(() => {
          if (!this.dialogManager.isOpen()) {
            window.location.href = 'temple.html';
          } else {
            // Set up listener for dialog closing
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
    
    // Update quest state
    this.questManager.setTempleFound(true);
  }
  
  addTempleLighting() {
    // Add lighting for the temple
    
    // Main spotlight from above
    const mainLight = new THREE.SpotLight(0xffffcc, 1.5, 100, Math.PI/4, 0.5, 1);
    mainLight.position.set(
      this.temple.position.x,
      30,
      this.temple.position.z
    );
    mainLight.target = this.temple;
    mainLight.castShadow = true;
    this.scene.add(mainLight);
    this.scene.add(mainLight.target);
    
    // Front entrance light
    const entranceLight = new THREE.SpotLight(0xffffaa, 1, 30, Math.PI/6, 0.5, 1);
    entranceLight.position.set(
      this.temple.position.x,
      10,
      this.temple.position.z + 30
    );
    entranceLight.target.position.set(
      this.temple.position.x,
      3,
      this.temple.position.z + 20
    );
    entranceLight.castShadow = true;
    this.scene.add(entranceLight);
    this.scene.add(entranceLight.target);
    
    // Add torches at the entrance
    const sides = [-1, 1];
    sides.forEach(side => {
      // Create torch flame
      const flameGeometry = new THREE.SphereGeometry(0.5, 8, 8);
      const flameMaterial = new THREE.MeshBasicMaterial({
        color: 0xff9933,
        transparent: true,
        opacity: 0.9
      });
      
      const flame = new THREE.Mesh(flameGeometry, flameMaterial);
      flame.position.set(
        this.temple.position.x + side * 8,
        this.temple.position.y + 6,
        this.temple.position.z + 21
      );
      this.scene.add(flame);
      
      // Add point light for torch
      const torchLight = new THREE.PointLight(0xff7700, 1, 15);
      torchLight.position.copy(flame.position);
      this.scene.add(torchLight);
      
      // Add animation for flame
      flame.userData = {
        update: (time) => {
          // Flickering size
          const scale = 0.8 + Math.random() * 0.4;
          flame.scale.set(scale, scale, scale);
          
          // Flickering light
          torchLight.intensity = 0.8 + Math.random() * 0.4;
        }
      };
    });
  }
  
  // Animation update method
  update(time) {
    // Update any animated objects
    this.scene.children.forEach(child => {
      if (child.userData && child.userData.update) {
        child.userData.update(time);
      }
    });
  }
}