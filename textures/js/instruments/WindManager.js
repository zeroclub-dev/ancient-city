/**
 * WindManager
 * Handles creation and interaction of wind instruments
 */
class WindManager {
    constructor(scene, textureEngine) {
      this.scene = scene;
      this.textureEngine = textureEngine;
    }
    
    createAulos() {
      const aulosGroup = new THREE.Group();
      
      // Create two pipes
      const leftPipe = this.createAulosPipe();
      leftPipe.position.x = -0.15;
      aulosGroup.add(leftPipe);
      
      const rightPipe = this.createAulosPipe();
      rightPipe.position.x = 0.15;
      rightPipe.scale.y = 0.95; // Slightly different length
      aulosGroup.add(rightPipe);
      
      // Rotate entire aulos for display
      aulosGroup.rotation.z = Math.PI / 6;
      
      return aulosGroup;
    }
    
    createAulosPipe() {
      const pipeGroup = new THREE.Group();
      
      // Main pipe body
      const pipeGeometry = new THREE.CylinderGeometry(0.05, 0.07, 2, 8);
      const pipeMaterial = new THREE.MeshStandardMaterial({
        color: 0xd2b48c,
        roughness: 0.7,
        metalness: 0.1
      });
      const pipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
      pipeGroup.add(pipe);
      
      // Add finger holes
      const holeGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.03, 8);
      const holeMaterial = new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.5,
        metalness: 0.2
      });
      for (let i = 0; i < 5; i++) {
        const hole = new THREE.Mesh(holeGeometry, holeMaterial);
        hole.rotation.x = Math.PI / 2;
        hole.position.y = 0.3 - i * 0.3;
        hole.position.z = 0.075;
        pipeGroup.add(hole);
      }
      
      // Add reed mouthpiece
      const reedGeometry = new THREE.ConeGeometry(0.03, 0.15, 8);
      const reedMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b4513,
        roughness: 0.9,
        metalness: 0.1
      });
      const reed = new THREE.Mesh(reedGeometry, reedMaterial);
      reed.position.y = 1.05;
      reed.rotation.x = Math.PI;
      pipeGroup.add(reed);
      
      // Add decorative bands
      const bandGeometry = new THREE.TorusGeometry(0.07, 0.01, 8, 16);
      const bandMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.3,
        metalness: 0.8
      });
      for (let i = 0; i < 3; i++) {
        const band = new THREE.Mesh(bandGeometry, bandMaterial);
        band.rotation.x = Math.PI / 2;
        band.position.y = -0.5 + i * 0.5;
        pipeGroup.add(band);
      }
      
      return pipeGroup;
    }
    
    createSyrinx() {
      const syrinxGroup = new THREE.Group();
      
      // Create pipes of different lengths
      const pipeMaterial = new THREE.MeshStandardMaterial({
        color: 0xd2b48c,
        roughness: 0.8,
        metalness: 0.1
      });
      const pipeCount = 7;
      const maxPipeLength = 1.4;
      const minPipeLength = 0.5;
      
      for (let i = 0; i < pipeCount; i++) {
        // Calculate pipe dimensions based on position
        const pipeLength = maxPipeLength - (i * (maxPipeLength - minPipeLength) / (pipeCount - 1));
        const pipeRadius = 0.06;
        
        // Create pipe
        const pipeGeometry = new THREE.CylinderGeometry(pipeRadius, pipeRadius, pipeLength, 8);
        const pipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
        
        // Position pipe
        const x = -0.36 + i * 0.12;
        pipe.position.set(x, pipeLength / 2 - 0.25, 0);
        syrinxGroup.add(pipe);
        
        // Create pipe openings (darker circles)
        const openingGeometry = new THREE.CircleGeometry(pipeRadius * 0.8, 16);
        const openingMaterial = new THREE.MeshStandardMaterial({
          color: 0x3d2817,
          roughness: 0.9,
          metalness: 0.1
        });
        const opening = new THREE.Mesh(openingGeometry, openingMaterial);
        opening.position.set(x, pipeLength - 0.25, 0.001);
        opening.rotation.x = -Math.PI / 2;
        syrinxGroup.add(opening);
      }
      
      // Create binding wraps
      const wrapMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b4513,
        roughness: 0.9,
        metalness: 0.1
      });
      
      // Top wrap
      const topWrapGeometry = new THREE.BoxGeometry(0.84, 0.05, 0.15);
      const topWrap = new THREE.Mesh(topWrapGeometry, wrapMaterial);
      topWrap.position.set(0, maxPipeLength - 0.3, 0);
      syrinxGroup.add(topWrap);
      
      // Middle wrap
      const midWrapGeometry = new THREE.BoxGeometry(0.84, 0.05, 0.15);
      const midWrap = new THREE.Mesh(midWrapGeometry, wrapMaterial);
      midWrap.position.set(0, 0.3, 0);
      syrinxGroup.add(midWrap);
      
      // Bottom wrap
      const bottomWrapGeometry = new THREE.BoxGeometry(0.84, 0.05, 0.15);
      const bottomWrap = new THREE.Mesh(bottomWrapGeometry, wrapMaterial);
      bottomWrap.position.set(0, -0.2, 0);
      syrinxGroup.add(bottomWrap);
      
      return syrinxGroup;
    }
  }