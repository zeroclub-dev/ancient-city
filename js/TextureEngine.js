/**
 * TextureEngine
 * Handles loading and management of PBR textures
 */
class TextureEngine {
    constructor(renderer, scene, loadingManager) {
      this.renderer = renderer;
      this.scene = scene;
      this.loadingManager = loadingManager;
      
      // Global variables for basic textures
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
    }
    
    /**
     * Load a single texture with proper settings
     */
    loadTexture(url, onLoad = null) {
      console.log(`Loading texture: ${url}`);
      return new Promise((resolve, reject) => {
        const textureLoader = new THREE.TextureLoader(this.loadingManager);
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
    }
  
    /**
     * Load all texture maps for a single material type
     */
    async loadMaterialTextures(materialName, materialID) {
      const basePath = `${CONFIG.paths.textures}${materialName}/${materialID}_1K-JPG`;
      
      try {
        // Color/albedo map
        this.textures[materialName].map = await this.loadTexture(
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
        
         // Try to load other maps, but don't fail if they don't exist
    try {
        this.textures[materialName].normalMap = await this.loadTexture(`${basePath}_NormalDX.jpg`);
      } catch (e) {
        try {
          this.textures[materialName].normalMap = await this.loadTexture(`${basePath}_NormalGL.jpg`);
        } catch (e2) {
          console.warn(`No normal map found for ${materialName}`);
        }
      }
        
       // These maps are optional, so set to null if they don't exist
    this.textures[materialName].roughnessMap = await this.loadTextureOrNull(`${basePath}_Roughness.jpg`);
    this.textures[materialName].metalnessMap = await this.loadTextureOrNull(`${basePath}_Metalness.jpg`);
    this.textures[materialName].displacementMap = await this.loadTextureOrNull(`${basePath}_Displacement.jpg`);
    
    console.log(`Completed loading textures for ${materialName}`);
    return this.textures[materialName];
    
  } catch (error) {
    console.error(`Error loading textures for ${materialName}:`, error);
    throw error;
  }
}

// New helper method that returns null instead of throwing when a texture is missing
loadTextureOrNull(url) {
    return new Promise((resolve) => {
      const textureLoader = new THREE.TextureLoader(this.loadingManager);
      textureLoader.load(
        url,
        (texture) => {
          console.log(`Successfully loaded texture: ${url}`);
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          
          if (this.renderer && this.renderer.capabilities) {
            texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
          }
          
          resolve(texture);
        },
        undefined,
        () => {
          console.warn(`Texture not found: ${url}, using null instead`);
          resolve(null);
        }
      );
    });
  }

    
    /**
     * Main method to load all textures
     */
    async loadAllTextures() {
      const startTime = performance.now();
      
      try {
        // Load all material textures in parallel - ADD THE MISSING TEXTURES
        const promises = [
          this.loadMaterialTextures('gold', CONFIG.textures.materialIDs.gold),
          this.loadMaterialTextures('marble', CONFIG.textures.materialIDs.marble),
          this.loadMaterialTextures('wood', CONFIG.textures.materialIDs.wood),
          this.loadMaterialTextures('rock', CONFIG.textures.materialIDs.rock),
          this.loadMaterialTextures('roof', CONFIG.textures.materialIDs.roof),
          // Add these missing textures
          this.loadMaterialTextures('grass', CONFIG.textures.materialIDs.grass),
          this.loadMaterialTextures('metal', CONFIG.textures.materialIDs.metal),
          this.loadMaterialTextures('tiles', CONFIG.textures.materialIDs.tiles)
        ];
        
        // Wait for textures to load
        await Promise.allSettled(promises);
        
        // Set global texture references with fallbacks - ADD THE MISSING TEXTURES
        this.marbleTexture = this.textures.marble.map || this.createFallbackTexture('#f5f5f5');
        this.stoneTexture = this.textures.rock.map || this.createFallbackTexture('#a0a0a0');
        this.woodTexture = this.textures.wood.map || this.createFallbackTexture('#8B4513');
        this.roofTileTexture = this.textures.roof.map || this.createFallbackTexture('#b35a1f');
        this.goldTexture = this.textures.gold.map || this.createFallbackTexture('#d4af37');
        // Add these missing textures
        this.grassTexture = this.textures.grass.map || this.createFallbackTexture('#567d46');
        this.metalTexture = this.textures.metal.map || this.createFallbackTexture('#888888');
        this.tilesTexture = this.textures.tiles.map || this.createFallbackTexture('#a4a4a4');
        
        // Ensure proper repeats
        if (this.marbleTexture) this.marbleTexture.repeat.set(2, 2);
        if (this.stoneTexture) this.stoneTexture.repeat.set(4, 4);
        if (this.woodTexture) this.woodTexture.repeat.set(2, 2);
        if (this.roofTileTexture) this.roofTileTexture.repeat.set(8, 8);
        if (this.goldTexture) this.goldTexture.repeat.set(1, 1);
        // Add repeats for new textures
        if (this.grassTexture) this.grassTexture.repeat.set(4, 4);
        if (this.metalTexture) this.metalTexture.repeat.set(2, 2);
        if (this.tilesTexture) this.tilesTexture.repeat.set(8, 8);
        
        // Mark textures as loaded
        this.texturesLoaded = true;
        
        const loadTime = Math.round(performance.now() - startTime);
        console.log(`All textures loaded successfully in ${loadTime}ms!`);
        
        // Create environment map for reflections
        this.createEnvironmentMap();
        
        return this.getTextures();
        
      } catch (error) {
        console.error("Error in texture loading:", error);
        this.createFallbackTextures();
        return this.getTextures();
      }
    }
    
    /**
     * Create fallback texture with noise
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
      
      // Add fallback textures for the missing textures
      this.grassTexture = this.createFallbackTexture('#567d46');
      this.grassTexture.repeat.set(4, 4);
      
      this.metalTexture = this.createFallbackTexture('#888888');
      this.metalTexture.repeat.set(2, 2);
      
      this.tilesTexture = this.createFallbackTexture('#a4a4a4');
      this.tilesTexture.repeat.set(8, 8);
      
      console.log("Created fallback textures");
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
     * Create environment map for reflections
     */
    createEnvironmentMap() {
      if (!this.renderer || !THREE.PMREMGenerator) return;
      
      try {
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        pmremGenerator.compileCubemapShader();
        
        // Create a simple scene for the environment map
        const tempScene = new THREE.Scene();
        tempScene.background = new THREE.Color(0x88CCEE);
        
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
     * Enhance materials with PBR properties
     */
    enhanceMaterialsForPBR() {
      this.scene.traverse((object) => {
        if (object.isMesh && object.material) {
          // Skip objects that shouldn't be enhanced
          if (object.userData && object.userData.skipEnhancement) {
            return;
          }
          
          // Handle material arrays
          if (Array.isArray(object.material)) {
            object.material.forEach((mat, index) => {
              object.material[index] = this._enhanceSingleMaterial(mat, object);
            });
          } else {
            object.material = this._enhanceSingleMaterial(object.material, object);
          }
        }
      });
      
      console.log('Enhanced materials for PBR');
    }
    
    _enhanceSingleMaterial(material, object) {
      // Convert non-standard materials to MeshPhysicalMaterial for better realism
      if (!material.isMeshStandardMaterial && !material.isMeshPhysicalMaterial) {
        try {
          const oldMap = material.map;
          const oldColor = material.color ? material.color.clone() : new THREE.Color(0xffffff);
          
          // Use Physical Material for better quality
          const newMaterial = new THREE.MeshPhysicalMaterial({
            map: oldMap,
            color: oldColor,
            roughness: 0.5,
            metalness: 0.0,
            clearcoat: 0.0,
            clearcoatRoughness: 0.25,
            transmission: 0.0,
            ior: 1.5
          });
          
          if (material.dispose) {
            material.dispose();
          }
          
          material = newMaterial;
        } catch (e) {
          console.warn('Could not convert material:', e);
        }
      }
      
      // Material-specific adjustments
      if (material.map) {
        // Enhance marble materials
        if (material.map === this.marbleTexture) {
          material.roughness = 0.15;
          material.metalness = 0.0;
          material.envMapIntensity = 0.8;
          
          if (material.isMeshPhysicalMaterial) {
            material.transmission = 0.05;
            material.clearcoat = 0.3;
            material.reflectivity = 0.5;
          }
        }
        // Enhance gold materials 
        else if (material.map === this.goldTexture) {
          material.roughness = 0.15;
          material.metalness = 0.9;
          material.envMapIntensity = 1.2;
        }
        // Enhance stone materials
        else if (material.map === this.stoneTexture) {
          material.roughness = 0.8;
          material.metalness = 0.0;
        }
        // Enhance wood materials
        else if (material.map === this.woodTexture) {
          material.roughness = 0.7;
          material.metalness = 0.0;
        }
      }
      
      // Apply environment map for reflections with proper intensity
      if (this.environmentMap && !material.envMap) {
        material.envMap = this.environmentMap;
        material.envMapIntensity = 0.7; // Less intense for realism
      }
      
      // Set shadow properties
      object.castShadow = true;
      object.receiveShadow = true;
      
      // Mark for update
      material.needsUpdate = true;
      
      return material;
    }
    
    /**
     * Enhance a single material
     */
    _enhanceSingleMaterial(material, object) {
      if (object.userData && object.userData.skipEnhancement) {
        return material;
      }
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
     * Apply loaded textures to materials
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
            object.material.forEach(mat => this._applyTexturesToSingleMaterial(mat));
          } else {
            this._applyTexturesToSingleMaterial(object.material);
          }
        }
      });
      
      console.log('Applied textures to materials');
    }
    
    /**
     * Apply textures to a single material
     */
    _applyTexturesToSingleMaterial(material) {
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
      // Add handlers for new textures
      else if (material.map === this.grassTexture && this.textures.grass) {
        this._applyTextureSet(material, this.textures.grass);
        
        // Grass should look organic
        material.metalness = 0.0;
        material.roughness = 0.9;
      }
      else if (material.map === this.metalTexture && this.textures.metal) {
        this._applyTextureSet(material, this.textures.metal);
        
        // Metal should look metallic (but less than gold)
        material.metalness = 0.7;
        material.roughness = 0.3;
      }
      else if (material.map === this.tilesTexture && this.textures.tiles) {
        this._applyTextureSet(material, this.textures.tiles);
        
        // Tiles should look ceramic
        material.metalness = 0.0;
        material.roughness = 0.6;
      }
      
      // Mark for update
      material.needsUpdate = true;
    }
    
    /**
     * Apply texture set to material
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
     * Get the current texture set
     */
    
    getTextures() {
      return {
        marbleTexture: this.marbleTexture,
        stoneTexture: this.stoneTexture,
        woodTexture: this.woodTexture,
        roofTileTexture: this.roofTileTexture,
        goldTexture: this.goldTexture,
        grassTexture: this.grassTexture,
        metalTexture: this.metalTexture,
        tilesTexture: this.tilesTexture
      };
    }
  }