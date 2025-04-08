/**
 * SkyboxManager
 * Handles creation and updates of the skybox and celestial elements
 */
class SkyboxManager {
  constructor(scene, textureEngine) {
    this.scene = scene;
    this.textureEngine = textureEngine;
    this.skybox = null;
    this.sun = null;
    this.sunLight = null;
    
    // Day-night cycle properties
    this.cycleDuration = 120; // Duration in seconds
    this.timeOfDay = 0.5; // Start at midday (0 = midnight, 0.5 = noon, 1 = midnight again)
    this.lastUpdate = 0;
  }

  async createSkybox() {
    console.log("Starting skybox creation");
    // Create a large sphere for sky
    const skyGeometry = new THREE.SphereGeometry(CONFIG.world.skyboxRadius, 64, 64);
    
    try {
      // Try to load sky texture first
      console.log("Attempting to load sky texture");
      const skyTexture = await this.textureEngine.loadTexture(`${CONFIG.paths.textures}sky/sky.jpg`);
      console.log("Sky texture loaded successfully:", skyTexture);
      
      // IMPORTANT: Configure texture properly for skybox
      skyTexture.encoding = THREE.sRGBEncoding;
      skyTexture.flipY = false; // Important for skybox
      skyTexture.wrapS = THREE.ClampToEdgeWrapping;
      skyTexture.wrapT = THREE.ClampToEdgeWrapping;
      
      // Create material with texture
      const skyMaterial = new THREE.MeshStandardMaterial({
        map: skyTexture,
        side: THREE.BackSide, // Important for inside view
        fog: false, // Skybox should not be affected by fog
        depthWrite: false // Prevents z-fighting
      });
      
      // Create skybox mesh
      this.skybox = new THREE.Mesh(skyGeometry, skyMaterial);
      this.skybox.frustumCulled = false; // Never cull the skybox
      this.skybox.renderOrder = -1000; // Render first
      this.scene.add(this.skybox);
      console.log("Skybox added to scene");
      if (skyTexture.image) {
        console.log("Texture image dimensions:", skyTexture.image.width, "x", skyTexture.image.height);
      } else {
        console.warn("Texture loaded but no image data found!");
      }
      // Skip material enhancement for skybox
      this.skybox.userData.skipEnhancement = true;
      
      // Try to load night texture for day/night cycle
      try {
        const nightTexture = await this.textureEngine.loadTexture(`${CONFIG.paths.textures}sky/night.jpg`);
        nightTexture.encoding = THREE.sRGBEncoding;
        nightTexture.flipY = false;
        nightTexture.wrapS = THREE.ClampToEdgeWrapping;
        nightTexture.wrapT = THREE.ClampToEdgeWrapping;
        
        skyMaterial.userData = {
          dayTexture: skyTexture,
          nightTexture: nightTexture
        };
        
        // Create a new material for blended transitions
        this.createBlendedSkyMaterial(skyTexture, nightTexture);
      } catch (e) {
        console.warn("Could not load night sky texture, skipping day/night cycle");
      }
      
    } catch (error) {
      console.error("Failed to load skybox texture, creating fallback:", error);
      this.createFallbackSkybox(skyGeometry);
    }
    
    // Add celestial bodies
    this.createCelestialBodies();
  }

// Create a material that can blend between day and night textures
createBlendedSkyMaterial(dayTexture, nightTexture) {
  if (!this.skybox) return;
  
  // Store original textures for reference
  this.dayTexture = dayTexture;
  this.nightTexture = nightTexture;
  
  // Create new material that uses both textures
  const blendedMaterial = new THREE.ShaderMaterial({
    uniforms: {
      dayTexture: { value: dayTexture },
      nightTexture: { value: nightTexture },
      blendFactor: { value: 0.0 } // 0.0 = day, 1.0 = night
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D dayTexture;
      uniform sampler2D nightTexture;
      uniform float blendFactor;
      varying vec2 vUv;
      
      void main() {
        vec4 dayColor = texture2D(dayTexture, vUv);
        vec4 nightColor = texture2D(nightTexture, vUv);
        gl_FragColor = mix(dayColor, nightColor, blendFactor);
      }
    `,
    side: THREE.BackSide,
    fog: false,
    depthWrite: false
  });
  
  // Replace the skybox material
  this.skybox.material = blendedMaterial;
  
  console.log("Created blended sky material for smooth day-night transitions");
}

// Make fallback skybox more aggressive with bright colors for better visibility issues
createFallbackSkybox(skyGeometry) {
  console.log("Creating fallback skybox");
  
  // Instead of using a canvas texture, let's use a simple color
  const skyMaterial = new THREE.MeshBasicMaterial({
    color: 0x87CEEB,  // Sky blue color
    side: THREE.BackSide
  });
  
  // Create mesh
  this.skybox = new THREE.Mesh(skyGeometry, skyMaterial);
  this.scene.add(this.skybox);
  console.log("Fallback skybox added to scene");
}

createCelestialBodies() {
  // Add sun
  const sunGeometry = new THREE.SphereGeometry(10, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffcc,
    transparent: true,
    opacity: 0.8
  });
  this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
  this.sun.position.set(-300, 200, -300);
  this.scene.add(this.sun);
  
  // Add sun glow
  this.sunLight = new THREE.PointLight(0xffffcc, 1, 1000);
  this.sunLight.position.copy(this.sun.position);
  this.scene.add(this.sunLight);
  
  // Add lens flare effect to the sun
  const sunFlare = new THREE.PointLight(0xffffcc, 0.3, 500);
  sunFlare.position.copy(this.sun.position);
  this.scene.add(sunFlare);
  
  // Add moon
  const moonGeometry = new THREE.SphereGeometry(8, 32, 32);
  const moonMaterial = new THREE.MeshBasicMaterial({
    color: 0xeeeeee,
    transparent: true,
    opacity: 0.9
  });
  this.moon = new THREE.Mesh(moonGeometry, moonMaterial);
  this.moon.position.set(300, 200, 300); // Opposite side from sun
  this.scene.add(this.moon);
  
  // Add moon glow
  this.moonLight = new THREE.PointLight(0xaabbff, 0.5, 800);
  this.moonLight.position.copy(this.moon.position);
  this.scene.add(this.moonLight);
}

update(time) {
  // Calculate deltaTime in seconds since last update
  const deltaTime = this.lastUpdate === 0 ? 0 : (time - this.lastUpdate) / 1000;
  this.lastUpdate = time;
  
  // Update day-night cycle
  this.updateDayNightCycle(deltaTime);
  
  if (this.skybox) {
    // Slow rotation for skybox
    this.skybox.rotation.y = time * 0.00002;
  }
  
  // Update celestial bodies position based on time of day
  this.updateCelestialBodies();
}

updateDayNightCycle(deltaTime) {
  // Update time of day (0.0 to 1.0 representing a full day-night cycle)
  this.timeOfDay += deltaTime / this.cycleDuration;
  
  // Loop back to beginning when a full day is complete
  if (this.timeOfDay >= 1.0) {
    this.timeOfDay -= 1.0;
  }
  
  // If we have the custom shader material, update blend factor
  if (this.skybox && this.skybox.material.uniforms) {
    // Calculate blend factor for time of day
    // 0.0 = noon (full day), 0.5 = midnight (full night)
    // Convert timeOfDay to blendFactor
    let blendFactor;
    
    if (this.timeOfDay < 0.25) {
      // Morning: transition from night to day (1.0 to 0.0)
      blendFactor = 1.0 - (this.timeOfDay * 4);
    } else if (this.timeOfDay < 0.75) {
      // Afternoon to evening: transition from day to night (0.0 to 1.0)
      blendFactor = (this.timeOfDay - 0.25) * 2;
    } else {
      // Night: stay at night (1.0)
      blendFactor = 1.0;
    }
    
    // Update blend factor
    this.skybox.material.uniforms.blendFactor.value = Math.max(0, Math.min(1, blendFactor));
  } else {
    // Fall back to older texture-swap method
    this.updateDayNightTextureSwap();
  }
  
  // Update fog color based on time of day
  this.updateFogColor();
}

updateDayNightTextureSwap() {
  if (!this.skybox || 
      !this.skybox.material || 
      !this.skybox.material.userData || 
      !this.skybox.material.userData.dayTexture || 
      !this.skybox.material.userData.nightTexture) {
    return;
  }
  
  const { dayTexture, nightTexture } = this.skybox.material.userData;
  
  // Determine if it should be day or night based on timeOfDay
  if (this.timeOfDay < 0.25 || this.timeOfDay > 0.75) {
    // Night time
    this.skybox.material.map = nightTexture;
  } else {
    // Day time
    this.skybox.material.map = dayTexture;
  }
  
  this.skybox.material.needsUpdate = true;
}

updateFogColor() {
  if (!this.scene.fog) return;
  
  // Day color (blueish)
  const dayColor = new THREE.Color(0x88a7c5);
  // Night color (dark blue)
  const nightColor = new THREE.Color(0x101830);
  
  // Calculate fog color based on time of day
  let blendFactor;
  
  if (this.timeOfDay < 0.25) {
    // Morning: transition from night to day (1.0 to 0.0)
    blendFactor = 1.0 - (this.timeOfDay * 4);
  } else if (this.timeOfDay < 0.75) {
    // Afternoon to evening: transition from day to night (0.0 to.0)
    blendFactor = (this.timeOfDay - 0.25) * 2;
  } else {
    // Night: stay at night (1.0)
    blendFactor = 1.0;
  }
  
  // Blend colors
  const fogColor = new THREE.Color().lerpColors(dayColor, nightColor, Math.max(0, Math.min(1, blendFactor)));
  
  // Apply to fog
  this.scene.fog.color.copy(fogColor);
}

updateCelestialBodies() {
  // Full 360 degree rotation based on time of day
  const angle = this.timeOfDay * Math.PI * 2;
  
  // Sun Position - circular path with height variation
  if (this.sun && this.sunLight) {
    const radius = 400;
    const height = 200 + Math.sin(angle) * 100;
    
    this.sun.position.x = Math.cos(angle) * radius;
    this.sun.position.y = height;
    this.sun.position.z = Math.sin(angle) * radius;
    
    // Update sunlight position
    this.sunLight.position.copy(this.sun.position);
    
    // Adjust sun brightness based on height
    // When the sun is below horizon, reduce intensity
    if (this.sun.position.y < 50) {
      const factor = Math.max(0, this.sun.position.y / 50);
      this.sunLight.intensity = factor;
      this.sun.material.opacity = factor * 0.8;
    } else {
      this.sunLight.intensity = 1;
      this.sun.material.opacity = 0.8;
    }
  }
  
  // Moon position - opposite to sun
  if (this.moon && this.moonLight) {
    const radius = 400;
    const height = 200 - Math.sin(angle) * 100;
    
    this.moon.position.x = -Math.cos(angle) * radius;
    this.moon.position.y = height;
    this.moon.position.z = -Math.sin(angle) * radius;
    
    // Update moonlight position
    this.moonLight.position.copy(this.moon.position);
    
    // Adjust moon brightness based on height
    // When the moon is below horizon, reduce intensity
    if (this.moon.position.y < 50) {
      const factor = Math.max(0, this.moon.position.y / 50);
      this.moonLight.intensity = factor * 0.5; // Moon is dimmer than sun
      this.moon.material.opacity = factor * 0.9;
    } else {
      this.moonLight.intensity = 0.5;
      this.moon.material.opacity = 0.9;
    }
  }
}

// Method to get current time of day (0.0 to 1.0) for other systems
getCurrentTimeOfDay() {
  return this.timeOfDay;
}

// Method to set time of day manually
setTimeOfDay(time) {
  this.timeOfDay = Math.max(0, Math.min(1, time));
  this.updateDayNightCycle(0); // Update visuals immediately
  this.updateCelestialBodies();
}
}