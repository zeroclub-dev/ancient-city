/**
 * Game Configuration
 * Central place for game settings and constants
 */
const CONFIG = {
  // Player settings
  player: {
    height: 1.7,
    radius: 0.3,
    moveSpeed: 20.0,       // DRASTICALLY increased from 15.0
    sprintSpeed: 10.0,     // DRASTICALLY increased from 24.0
    jumpStrength: 5.5,     
    gravity: 15.0,
    frictionCoef: 0.2,     // Further reduced friction for more responsive movement
    stepHeight: 0.35
  },

  
  // Texture settings
  textures: {
    materialIDs: {
      gold: 'Gold001',
      grass: 'Grass001',
      marble: 'Marble014',
      metal: 'Metal032',
      rock: 'Rock023',
      roof: 'Roofingtiles002',
      tiles: 'Tiles074',
      wood: 'Wood062'
    }
  },
  
  // Camera settings
  camera: {
    fov: 75,
    near: 0.1,
    far: 1000,
    height: 1.6,         // Height of camera (eye level)
    headBobAmount: 0.05  // Amount of head bobbing when walking
  },
  
  // World settings
  world: {
    fogDensity: 0.008,
    fogColor: 0x88a7c5,
    skyboxRadius: 1000,
    groundLevel: 0        // Explicit ground level for collision
  },
  
  // Paths
  paths: {
    textures: './textures/'
  },
  
  // Debug settings
  debug: {
    showColliders: false,  // Set to true to see collision shapes
    fixedTimestep: true,   // Use fixed physics timestep for more stable simulation
    timestep: 1/60,        // Target physics update rate (60fps)
    logCollisions: false   // Set to true to log collision details to console
  }
};