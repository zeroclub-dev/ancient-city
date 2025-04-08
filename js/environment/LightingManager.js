/**
 * LightingManager
 * Handles creation and management of scene lighting with PBR support
 */
class LightingManager {
  constructor(scene) {
    this.scene = scene;
    this.directionalLight = null;
    this.ambientLight = null;
    this.pointLights = [];
    this.shadows = true;
    this.hdrEnabled = true;
  }
  
  setupLighting() {
    // Skip ColorManagement line that's causing errors
    // THREE.ColorManagement.enabled = true; 
    
    // Subtle ambient light for fill
    this.ambientLight = new THREE.AmbientLight(0xd1e8ff, 0.2);
    this.scene.add(this.ambientLight);
    
    // More physically accurate sky illumination
    const hemisphereLight = new THREE.HemisphereLight(
      0x90c0ff, // Sky color - cooler blue
      0xb08060, // Ground color - warm terracotta
      0.4       // Lower intensity for realism
    );
    this.scene.add(hemisphereLight);
    
    // Main directional light (sun)
    this.directionalLight = new THREE.DirectionalLight(0xfff5e0, 1.0);
    this.directionalLight.position.set(-50, 200, -100);
    
    // Adjust shadow properties for high quality
    if (this.shadows) {
      this.directionalLight.castShadow = true;
      this.directionalLight.shadow.mapSize.width = 4096;
      this.directionalLight.shadow.mapSize.height = 4096;
      
      // Tighter shadow camera for better resolution
      const shadowSize = 120;
      this.directionalLight.shadow.camera.left = -shadowSize;
      this.directionalLight.shadow.camera.right = shadowSize;
      this.directionalLight.shadow.camera.top = shadowSize;
      this.directionalLight.shadow.camera.bottom = -shadowSize;
      this.directionalLight.shadow.camera.near = 1;
      this.directionalLight.shadow.camera.far = 500;
      
      // Fix shadow acne with bias adjustment
      this.directionalLight.shadow.bias = -0.0002;
      this.directionalLight.shadow.normalBias = 0.05;
      
      // Higher quality PCF shadows
      this.directionalLight.shadow.radius = 1.5;
    }
    
    // Create directional light target for better control
    const target = new THREE.Object3D();
    target.position.set(0, 0, 0);
    this.scene.add(target);
    this.directionalLight.target = target;
    
    this.scene.add(this.directionalLight);
    
    // Add secondary sun fill light
    const secondarySun = new THREE.DirectionalLight(0xffeedd, 0.3);
    secondarySun.position.set(100, 100, 100);
    secondarySun.castShadow = false;
    this.scene.add(secondarySun);
    
    // Add focused spotlight to emphasize marble details
    const spotlight = new THREE.SpotLight(0xffffff, 0.4, 100, Math.PI/6, 0.5, 1);
    spotlight.position.set(-20, 40, -30);
    spotlight.target.position.set(0, 0, 0);
    spotlight.castShadow = false; // One shadow source is enough
    this.scene.add(spotlight);
    this.scene.add(spotlight.target);
    
    // Evening point lights
    this.addPointLights();
    
    // Apply HDR tone mapping for realistic range
    if (this.hdrEnabled) {
      this.setupHDR();
    }
    
    // Create light probes for global illumination - use try/catch in case these features aren't available
    try {
      this.setupLightProbes();
    } catch (e) {
      console.warn("Light probe setup failed, skipping:", e);
    }
  }
  
  setupHDR() {
    // This would be called by the renderer in Game.js
    console.log("HDR rendering enabled");
  }
  
  setupLightProbes() {
    // Only create light probe if this feature is available in this Three.js version
    if (typeof THREE.LightProbe === 'undefined') {
      console.warn("THREE.LightProbe not available in this version, skipping light probe setup");
      return;
    }
    
    // Add a light probe for more accurate ambient lighting
    const lightProbe = new THREE.LightProbe();
    lightProbe.intensity = 0.75;
    this.scene.add(lightProbe);
    
    // Use SphericalHarmonics to approximate lighting environment
    if (lightProbe.sh && lightProbe.sh.coefficients) {
      const sh = lightProbe.sh;
      sh.coefficients[0].set(0.8, 0.8, 1.0); // Ambient
      sh.coefficients[1].set(0.5, 0.5, 0.5); // Directional
      sh.coefficients[2].set(0.05, 0.05, 0.05); // Higher order terms
    }
  }
  
  addPointLights() {
    // Create more physically plausible evening lights
    const pointLightColors = [
      0xffcb8e, // Warm candle
      0xff9d5c, // Amber
      0xffd1a3  // Soft gold
    ];
    
    for (let i = 0; i < 15; i++) {
      const intensity = 0.65 + Math.random() * 0.35; // Varied intensity
      const distance = 20; // Shorter, more realistic distance
      const decay = 2.0; // Physically correct inverse square falloff
      
      const light = new THREE.PointLight(
        pointLightColors[Math.floor(Math.random() * pointLightColors.length)],
        intensity,
        distance,
        decay
      );
      
      // Position lights around the city
      const angle = (i / 15) * Math.PI * 2;
      const radius = 30 + Math.random() * 30;
      
      light.position.set(
        Math.cos(angle) * radius,
        1.5 + Math.random() * 2,
        Math.sin(angle) * radius
      );
      
      // Add subtle shadows to a few key lights only (for performance)
      if (i % 5 === 0 && this.shadows) {
        light.castShadow = true;
        light.shadow.bias = -0.001;
        light.shadow.mapSize.width = 512;
        light.shadow.mapSize.height = 512;
      }
      
      this.scene.add(light);
      this.pointLights.push(light);
    }
  }
  
  update(time) {
    // Subtle sun movement
    if (this.directionalLight) {
      const angle = time * 0.00005;
      const distance = 300;
      const height = 200 + Math.sin(angle * 0.5) * 50;
      
      this.directionalLight.position.x = Math.sin(angle) * distance;
      this.directionalLight.position.z = Math.cos(angle) * distance;
      this.directionalLight.position.y = height;
      
      // Adjust color temperature based on sun position
      const elevation = (height - 150) / 50; // -1 to 1 range
      const colorTemp = 1.0 + elevation * 0.1; // Subtle color shift
      
      this.directionalLight.color.r = 1.0;
      this.directionalLight.color.g = 0.95 + 0.05 * Math.min(colorTemp, 1.0);
      this.directionalLight.color.b = 0.9 + 0.1 * Math.min(colorTemp, 1.0);
      
      // Adjust intensity based on height
      this.directionalLight.intensity = 0.9 + 0.1 * Math.max(elevation, 0);
    }
    
    // Realistic flickering for point lights
    this.pointLights.forEach((light, index) => {
      // Natural flame flicker algorithm with multiple frequencies
      const noise = 
        0.5 * Math.sin(time * 0.001 + index) +
        0.3 * Math.sin(time * 0.01 + index * 2.13) +
        0.2 * Math.sin(time * 0.023 + index * 4.28);
      
      const baseIntensity = 0.65 + Math.random() * 0.35;
      light.intensity = baseIntensity * (0.9 + 0.1 * noise);
    });
  }
  
  // Add new method to update material parameters for marble
  enhanceMarbleMaterials(scene) {
    scene.traverse((object) => {
      if (object.isMesh && object.material) {
        // Process material arrays
        if (Array.isArray(object.material)) {
          object.material.forEach(mat => this._adjustMaterial(mat, object));
        } else {
          this._adjustMaterial(object.material, object);
        }
      }
    });
  }
  
  _adjustMaterial(material, object) {
    // Skip non-PBR materials
    if (!material.isMeshStandardMaterial && !material.isMeshPhysicalMaterial) {
      return;
    }
    
    // Check if this is a marble material by color or name
    const isMarble = 
      (material.name && material.name.toLowerCase().includes('marble')) ||
      (material.map && material.map.name && material.map.name.toLowerCase().includes('marble')) ||
      (material.color && material.color.r > 0.8 && material.color.g > 0.8 && material.color.b > 0.8);
    
    if (isMarble) {
      // Adjust marble properties for realism
      material.roughness = 0.1; // Polished marble is smooth
      material.metalness = 0.0; // Non-metallic
      
      // Add subsurface scattering if using MeshPhysicalMaterial
      if (material.isMeshPhysicalMaterial) {
        // Check if these properties exist before setting them
        if ('transmission' in material) material.transmission = 0.05;
        if ('thickness' in material) material.thickness = 1.0;
        if ('clearcoat' in material) material.clearcoat = 0.2;
        if ('clearcoatRoughness' in material) material.clearcoatRoughness = 0.3;
        if ('ior' in material) material.ior = 1.5;
      }
    } else {
      // Adjust other materials to react better to the lighting
      // Stones
      if (material.map && material.map.name && material.map.name.toLowerCase().includes('stone')) {
        material.roughness = 0.75;
        material.metalness = 0.0;
      }
      // Gold
      else if (material.map && material.map.name && material.map.name.toLowerCase().includes('gold')) {
        material.roughness = 0.15;
        material.metalness = 0.85;
        if ('envMapIntensity' in material) material.envMapIntensity = 1.5;
      }
      // Wood
      else if (material.map && material.map.name && material.map.name.toLowerCase().includes('wood')) {
        material.roughness = 0.7;
        material.metalness = 0.0;
      }
    }
    
    // Enhance all shadows
    object.castShadow = true;
    object.receiveShadow = true;
    
    material.needsUpdate = true;
  }
}