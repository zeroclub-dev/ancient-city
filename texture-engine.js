/**
 * TextureEngine.js - Advanced texture loading and management for Three.js
 * 
 * Handles loading of PBR textures, skybox, and application to materials
 */

class TextureEngine {
  constructor(renderer, scene, loadingManager) {
    this.renderer = renderer;
    this.scene = scene;
    this.loadingManager = loadingManager;
    
    // Global variables for basic textures (compatibility with existing code)
    this.marbleTexture = null;
    this.stoneTexture = null;
    this.woodTexture = null;
    this.roofTileTexture = null;
    this.goldTexture = null;
    
    // Environment map for reflections
    this.environmentMap = null;
    
    // Skybox reference
    this.skybox = null;
    
    // Texture loading state
    this.texturesLoaded = false;
    
    // All PBR texture sets
    this.textures = {
      gold: {},
      grass: {},
      marble: {},
      metal: {},
      rock: {},
      roof: {},
      tiles: {},
      wood: {}
    };
    
    // Material IDs based on your folder structure
    this.materialIDs = {
      gold: 'Gold001',
      grass: 'Grass001',
      marble: 'Marble016',
      metal: 'Metal032',
      rock: 'Rock023',
      roof: 'Roofingtiles002',
      tiles: 'Tiles074',
      wood: 'Wood062'
    };
  }
  
  /**
   * Main method to load all textures
   */
  loadAllTextures() {
    const startTime = performance.now();
    
    // Create texture loader
    const textureLoader = new THREE.TextureLoader(this.loadingManager);
    
    /**
     * Helper function to load a single texture with proper settings
     */
    const loadTexture = (url, onLoad = null) => {
      console.log(`Loading texture: ${url}`);
      return new Promise((resolve, reject) => {
        textureLoader.load(
          url,
          (texture) => {
            console.log(`Successfully loaded texture: ${url}`);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            
            // Set anisotropy for better quality at angles
            if (this.renderer && this.renderer.capabilities) {
              texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
            }
            
            if (onLoad) {
              onLoad(texture);
            }
            
            resolve(texture);
          },
          undefined,
          (error) => {
            console.error(`Failed to load texture: ${url}`, error);
            reject(error);
          }
        );
      });
    };
    
    /**
     * Load all texture maps for a single material type
     */
    const loadMaterialTextures = async (materialName, materialID) => {
      const basePath = `./textures/${materialName}/${materialID}_1K-JPG`;
      
      try {
        // Color/albedo map
        this.textures[materialName].map = await loadTexture(
          `${basePath}_Color.jpg`,
          (texture) => {
            // Set encoding for color maps
            if (THREE.sRGBEncoding !== undefined) {
              texture.encoding = THREE.sRGBEncoding;
            }
            
            // Set appropriate repeat based on material
            if (materialName === 'marble' || materialName === 'gold') {
              texture.repeat.set(2, 2);
            } else if (materialName === 'rock') {
              texture.repeat.set(4, 4);
            } else if (materialName === 'roof' || materialName === 'tiles') {
              texture.repeat.set(8, 8);
            } else {
              texture.repeat.set(2, 2);
            }
          }
        );
        
        // Normal map (try DX first, then GL)
        try {
          this.textures[materialName].normalMap = await loadTexture(
            `${basePath}_NormalDX.jpg`,
            (texture) => {
              if (THREE.LinearEncoding !== undefined) {
                texture.encoding = THREE.LinearEncoding;
              }
            }
          );
        } catch (e) {
          try {
            this.textures[materialName].normalMap = await loadTexture(
              `${basePath}_NormalGL.jpg`,
              (texture) => {
                if (THREE.LinearEncoding !== undefined) {
                  texture.encoding = THREE.LinearEncoding;
                }
              }
            );
          } catch (e2) {
            console.warn(`No normal map found for ${materialName}`);
          }
        }
        
        // Roughness map
        try {
          this.textures[materialName].roughnessMap = await loadTexture(
            `${basePath}_Roughness.jpg`,
            (texture) => {
              if (THREE.LinearEncoding !== undefined) {
                texture.encoding = THREE.LinearEncoding;
              }
            }
          );
        } catch (e) {
          console.warn(`No roughness map found for ${materialName}`);
        }
        
        // Metalness map
        try {
          this.textures[materialName].metalnessMap = await loadTexture(
            `${basePath}_Metalness.jpg`,
            (texture) => {
              if (THREE.LinearEncoding !== undefined) {
                texture.encoding = THREE.LinearEncoding;
              }
            }
          );
        } catch (e) {
          console.warn(`No metalness map found for ${materialName}`);
        }
        
        // Displacement map
        try {
          this.textures[materialName].displacementMap = await loadTexture(
            `${basePath}_Displacement.jpg`,
            (texture) => {
              if (THREE.LinearEncoding !== undefined) {
                texture.encoding = THREE.LinearEncoding;
              }
            }
          );
        } catch (e) {
          console.warn(`No displacement map found for ${materialName}`);
        }
        
        console.log(`Completed loading all textures for ${materialName}`);
        return this.textures[materialName];
        
      } catch (error) {
        console.error(`Error loading textures for ${materialName}:`, error);
        throw error;
      }
    };
    
    /**
     * Load skybox textures (day and night)
     */
    const loadSkybox = async () => {
      try {
        // Load day and night textures
        const daySky = await loadTexture('./textures/sky/sky.jpg');
        let nightSky = null;
        
        try {
          nightSky = await loadTexture('./textures/sky/night.jpg');
        } catch (e) {
          console.warn("Could not load night sky texture");
        }
        
        // Create or update skybox
        const skyGeometry = new THREE.SphereGeometry(500, 64, 64);
        const skyMaterial = new THREE.MeshBasicMaterial({
          map: daySky,
          side: THREE.BackSide
        });
        
        // Store night texture if available
        if (nightSky) {
          skyMaterial.userData = {
            dayTexture: daySky,
            nightTexture: nightSky
          };
        }
        
        if (this.skybox) {
          this.skybox.material = skyMaterial;
        } else {
          this.skybox = new THREE.Mesh(skyGeometry, skyMaterial);
          this.scene.add(this.skybox);
        }
        
        console.log("Skybox created successfully");
        return true;
      } catch (error) {
        console.error("Error loading skybox:", error);
        this.createFallbackSkybox();
        throw error;
      }
    };
    
    /**
     * Start the actual loading process
     */
    return new Promise(async (resolve) => {
      try {
        // Load all material textures in parallel
        const promises = [
          loadMaterialTextures('gold', this.materialIDs.gold),
          loadMaterialTextures('marble', this.materialIDs.marble),
          loadMaterialTextures('wood', this.materialIDs.wood),
          loadMaterialTextures('rock', this.materialIDs.rock),
          loadMaterialTextures('roof', this.materialIDs.roof)
        ];
        
        // Wait for textures to load
        const results = await Promise.allSettled(promises);
        
        // Set global texture references with fallbacks
        this.marbleTexture = this.textures.marble.map || this.createFallbackTexture('#f5f5f5');
        this.stoneTexture = this.textures.rock.map || this.createFallbackTexture('#a0a0a0');
        this.woodTexture = this.textures.wood.map || this.createFallbackTexture('#8B4513');
        this.roofTileTexture = this.textures.roof.map || this.createFallbackTexture('#b35a1f');
        this.goldTexture = this.textures.gold.map || this.createFallbackTexture('#d4af37');
        
        // Ensure proper repeats
        if (this.marbleTexture) this.marbleTexture.repeat.set(2, 2);
        if (this.stoneTexture) this.stoneTexture.repeat.set(4, 4);
        if (this.woodTexture) this.woodTexture.repeat.set(2, 2);
        if (this.roofTileTexture) this.roofTileTexture.repeat.set(8, 8);
        if (this.goldTexture) this.goldTexture.repeat.set(1, 1);
        
        // Load skybox
        await loadSkybox();
        
        // Mark textures as loaded
        this.texturesLoaded = true;
        
        const loadTime = Math.round(performance.now() - startTime);
        console.log(`All textures loaded successfully in ${loadTime}ms!`);
        
        // Create environment map for reflections
        this.createEnvironmentMap();
        
        resolve({
          marbleTexture: this.marbleTexture,
          stoneTexture: this.stoneTexture,
          woodTexture: this.woodTexture,
          roofTileTexture: this.roofTileTexture,
          goldTexture: this.goldTexture
        });
        
      } catch (error) {
        console.error("Error in texture loading:", error);
        this.createFallbackTextures();
        this.createFallbackSkybox();
        
        resolve({
          marbleTexture: this.marbleTexture,
          stoneTexture: this.stoneTexture,
          woodTexture: this.woodTexture,
          roofTileTexture: this.roofTileTexture,
          goldTexture: this.goldTexture
        });
      }
    });
  }
  
  /**
   * Create fallback texture with noise
   */
  createFallbackTexture(color) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const context = canvas.getContext('2d');
    context.fillStyle = color;
    context.fillRect(0, 0, 1024, 1024);
    
    // Add noise for texture variation
    for (let i = 0; i < 20000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const brightness = (Math.random() - 0.5) * 30;
      const size = Math.random() * 4 + 1;
      context.fillStyle = `rgba(${brightness + 128}, ${brightness + 128}, ${brightness + 128}, 0.5)`;
      context.beginPath();
      context.arc(x, y, size, 0, Math.PI * 2);
      context.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }
  
  /**
   * Create all fallback textures
   */
  createFallbackTextures() {
    this.marbleTexture = this.createFallbackTexture('#f5f5f5');
    this.marbleTexture.repeat.set(2, 2);
    
    this.stoneTexture = this.createFallbackTexture('#a0a0a0');
    this.stoneTexture.repeat.set(4, 4);
    
    this.woodTexture = this.createFallbackTexture('#8B4513');
    this.woodTexture.repeat.set(2, 2);
    
    this.roofTileTexture = this.createFallbackTexture('#b35a1f');
    this.roofTileTexture.repeat.set(8, 8);
    
    this.goldTexture = this.createFallbackTexture('#d4af37');
    this.goldTexture.repeat.set(1, 1);
    
    console.log("Created fallback textures");
  }
  
  /**
   * Create fallback skybox
   */
  createFallbackSkybox() {
    const skyGeometry = new THREE.SphereGeometry(500, 64, 64);
    
    // Create canvas for gradient sky
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 1024;
    skyCanvas.height = 1024;
    const skyContext = skyCanvas.getContext('2d');
    
    // Create gradient
    const skyGradient = skyContext.createLinearGradient(0, 0, 0, 1024);
    skyGradient.addColorStop(0, '#1a3b6d'); // Deep blue at zenith
    skyGradient.addColorStop(0.4, '#5d8bc5'); // Mid blue
    skyGradient.addColorStop(0.7, '#a3c8f0'); // Light blue
    skyGradient.addColorStop(1, '#ffe9ba'); // Golden horizon
    skyContext.fillStyle = skyGradient;
    skyContext.fillRect(0, 0, 1024, 1024);
    
    // Add clouds
    skyContext.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 20; i++) {
      const cloudX = Math.random() * 1024;
      const cloudY = 400 + Math.random() * 300;
      const cloudWidth = 100 + Math.random() * 300;
      const cloudHeight = 20 + Math.random() * 40;
      
      // Draw the cloud as a rounded rectangle
      skyContext.beginPath();
      skyContext.moveTo(cloudX, cloudY);
      skyContext.bezierCurveTo(
        cloudX - 40, cloudY + 20,
        cloudX - 40, cloudY + cloudHeight - 20,
        cloudX, cloudY + cloudHeight
      );
      skyContext.bezierCurveTo(
        cloudX + cloudWidth / 3, cloudY + cloudHeight + 20,
        cloudX + cloudWidth * 2/3, cloudY + cloudHeight + 20,
        cloudX + cloudWidth, cloudY + cloudHeight
      );
      skyContext.bezierCurveTo(
        cloudX + cloudWidth + 40, cloudY + cloudHeight - 20,
        cloudX + cloudWidth + 40, cloudY + 20,
        cloudX + cloudWidth, cloudY
      );
      skyContext.bezierCurveTo(
        cloudX + cloudWidth * 2/3, cloudY - 20,
        cloudX + cloudWidth / 3, cloudY - 20,
        cloudX, cloudY
      );
      skyContext.fill();
    }
    
    // Create texture and material
    const skyTexture = new THREE.CanvasTexture(skyCanvas);
    const skyMaterial = new THREE.MeshBasicMaterial({
      map: skyTexture,
      side: THREE.BackSide
    });
     skyTexture.wrapS = THREE.ClampToEdgeWrapping;   
    skyTexture.wrapT = THREE.ClampToEdgeWrapping;
    
    // Create or update skybox
    if (this.skybox) {
      this.skybox.material = skyMaterial;
    } else {
      this.skybox = new THREE.Mesh(skyGeometry, skyMaterial);
      this.scene.add(this.skybox);
    }
    
    console.log("Created fallback skybox");
  }
  
  /**
   * Create environment map for reflections
   */
  createEnvironmentMap() {
    if (!this.renderer || !THREE.PMREMGenerator) return;
    
    try {
      const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
      pmremGenerator.compileCubemapShader();
      
      // Create a simple scene for the environment map
      const tempScene = new THREE.Scene();
      tempScene.background = null;
      
      // Generate environment map
      this.environmentMap = pmremGenerator.fromScene(tempScene).texture;
      pmremGenerator.dispose();
      
      // Apply to scene
      this.scene.environment = this.environmentMap;
      
      console.log('Environment map created');
    } catch (e) {
      console.warn('Could not create environment map:', e);
    }
  }
  
  /**
   * Apply loaded textures to materials in the scene
   */
  applyTexturesToMaterials() {
    if (!this.texturesLoaded) {
      console.warn('Cannot apply textures - textures not loaded yet');
      return;
    }
    
    this.scene.traverse((object) => {
      if (object.isMesh && object.material) {
        // Handle arrays of materials
        if (Array.isArray(object.material)) {
          object.material.forEach(mat => this._updateMaterial(mat));
        } else {
          this._updateMaterial(object.material);
        }
      }
    });
    
    console.log('Applied textures to materials');
  }
  
  /**
   * Update a single material with PBR maps
   * @private
   */
  _updateMaterial(material) {
    // Skip non-standard materials
    if (!material.isMeshStandardMaterial && !material.isMeshPhysicalMaterial) {
      return;
    }
    
    // Match material to texture set based on current color map
    if (material.map === this.marbleTexture && this.textures.marble) {
      this._applyTextureSet(material, this.textures.marble);
    }
    else if (material.map === this.stoneTexture && this.textures.rock) {
      this._applyTextureSet(material, this.textures.rock);
    }
    else if (material.map === this.woodTexture && this.textures.wood) {
      this._applyTextureSet(material, this.textures.wood);
    }
    else if (material.map === this.roofTileTexture) {
      if (this.textures.roof && this.textures.roof.map) {
        this._applyTextureSet(material, this.textures.roof);
      } else if (this.textures.tiles && this.textures.tiles.map) {
        this._applyTextureSet(material, this.textures.tiles);
      }
    }
    else if (material.map === this.goldTexture && this.textures.gold) {
      this._applyTextureSet(material, this.textures.gold);
      
      // Gold should look metallic
      material.metalness = 0.9;
      material.roughness = 0.2;
    }
    
    // Mark for update
    material.needsUpdate = true;
  }
  
  /**
   * Apply texture set to material
   * @private
   */
  _applyTextureSet(material, textureSet) {
    if (!textureSet) return;
    
    // Apply normal map
    if (textureSet.normalMap) {
      material.normalMap = textureSet.normalMap;
      material.normalScale = new THREE.Vector2(1.0, 1.0);
    }
    
    // Apply roughness map
    if (textureSet.roughnessMap) {
      material.roughnessMap = textureSet.roughnessMap;
    }
    
    // Apply metalness map
    if (textureSet.metalnessMap) {
      material.metalnessMap = textureSet.metalnessMap;
    }
    
    // Apply displacement map (cautiously)
    if (textureSet.displacementMap) {
      material.displacementMap = textureSet.displacementMap;
      material.displacementScale = 0.05; // Small value to avoid extreme geometry distortion
    }
  }
  
  /**
   * Enhance materials with PBR properties
   */
  enhanceMaterialsForPBR() {
    this.scene.traverse((object) => {
      if (object.isMesh && object.material) {
        // Handle material arrays
        if (Array.isArray(object.material)) {
          object.material.forEach((mat, index) => {
            object.material[index] = this._enhanceMaterial(mat, object);
          });
        } else {
          object.material = this._enhanceMaterial(object.material, object);
        }
      }
    });
    
    console.log('Enhanced materials for PBR');
  }
  
  /**
   * Enhance a single material
   * @private
   */
  _enhanceMaterial(material, object) {
    // Convert non-standard materials to MeshStandardMaterial
    if (!material.isMeshStandardMaterial && !material.isMeshPhysicalMaterial) {
      try {
        const oldMap = material.map;
        const oldColor = material.color ? material.color.clone() : new THREE.Color(0xffffff);
        
        const newMaterial = new THREE.MeshStandardMaterial({
          map: oldMap,
          color: oldColor,
          roughness: 0.7,
          metalness: 0.0
        });
        
        if (material.dispose) {
          material.dispose();
        }
        
        material = newMaterial;
      } catch (e) {
        console.warn('Could not convert material:', e);
      }
    }
    
    // Apply environment map for reflections
    if (this.environmentMap && !material.envMap) {
      material.envMap = this.environmentMap;
      material.envMapIntensity = 1.0;
    }
    
    // Set shadow properties
    object.castShadow = true;
    object.receiveShadow = true;
    
    // Mark for update
    material.needsUpdate = true;
    
    return material;
  }
  
  /**
   * Update skybox for time of day (0=night, 1=day)
   */
  updateSkyboxForTimeOfDay(timeOfDay) {
    if (!this.skybox || !this.skybox.material || !this.skybox.material.userData) return;
    
    const { dayTexture, nightTexture } = this.skybox.material.userData;
    if (!dayTexture || !nightTexture) return;
    
    // Clamp value between 0 and 1
    timeOfDay = Math.max(0, Math.min(1, timeOfDay));
    
    if (timeOfDay > 0.8) {
      // Full day
      this.skybox.material.map = dayTexture;
    } else if (timeOfDay < 0.2) {
      // Full night
      this.skybox.material.map = nightTexture;
    } else {
      // For proper transitions, would need a custom shader
      // Simple approach just uses the closest texture
      this.skybox.material.map = timeOfDay > 0.5 ? dayTexture : nightTexture;
    }
    
    this.skybox.material.needsUpdate = true;
  }
  
  /**
   * Get the current texture set
   */
  getTextures() {
    return {
      marbleTexture: this.marbleTexture,
      stoneTexture: this.stoneTexture,
      woodTexture: this.woodTexture,
      roofTileTexture: this.roofTileTexture,
      goldTexture: this.goldTexture
    };
  }
}

// Make the class available globally
window.TextureEngine = TextureEngine;
