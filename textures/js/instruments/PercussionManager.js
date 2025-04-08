/**
 * PercussionManager
 * Handles creation and interaction of percussion instruments
 */
class PercussionManager {
    constructor(scene, textureEngine) {
      this.scene = scene;
      this.textureEngine = textureEngine;
    }
    
    createTympanon() {
      const tympanonGroup = new THREE.Group();
      
      // Create frame
      const frameGeometry = new THREE.TorusGeometry(0.8, 0.08, 16, 32);
      const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.8,
        metalness: 0.1
      });
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      tympanonGroup.add(frame);
      
      // Create drumhead
      const drumheadGeometry = new THREE.CircleGeometry(0.8, 32);
      const drumheadMaterial = new THREE.MeshStandardMaterial({
        color: 0xDCDCDC,
        roughness: 0.9,
        metalness: 0.1,
        transparent: true,
        opacity: 0.8
      });
      const drumhead = new THREE.Mesh(drumheadGeometry, drumheadMaterial);
      drumhead.position.z = 0.02;
      tympanonGroup.add(drumhead);
      
      // Add optional jingles/bells around the frame
      if (Math.random() > 0.5) {
        this.addJingles(tympanonGroup);
      }
      
      return tympanonGroup;
    }
    
    addJingles(tympanonGroup) {
      const jinglCount = 8;
      const ringRadius = 0.8;
      
      for (let i = 0; i < jinglCount; i++) {
        const angle = (i / jinglCount) * Math.PI * 2;
        
        // Create small metal disc
        const jinglGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.01, 8);
        const jinglMaterial = new THREE.MeshStandardMaterial({
          color: 0xD4AF37,
          roughness: 0.3,
          metalness: 0.8
        });
        const jingl = new THREE.Mesh(jinglGeometry, jinglMaterial);
        
        // Position around the frame
        jingl.position.set(
          Math.cos(angle) * ringRadius,
          Math.sin(angle) * ringRadius,
          0.05
        );
        jingl.rotation.x = Math.PI / 2;
        
        tympanonGroup.add(jingl);
      }
    }
    
    createKymbala() {
      const kymbalaGroup = new THREE.Group();
      
      // Create two cymbals
      const cymbalGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.03, 32);
      const cymbalMaterial = new THREE.MeshStandardMaterial({
        color: 0xD4AF37,
        roughness: 0.3,
        metalness: 0.8
      });
      
      // First cymbal
      const cymbal1 = new THREE.Mesh(cymbalGeometry, cymbalMaterial);
      cymbal1.position.set(-0.25, 0, 0);
      cymbal1.rotation.x = Math.PI / 2;
      
      // Second cymbal
      const cymbal2 = new THREE.Mesh(cymbalGeometry, cymbalMaterial);
      cymbal2.position.set(0.25, 0, 0);
      cymbal2.rotation.x = Math.PI / 2;
      
      // Add center boss to each cymbal
      const bossGeometry = new THREE.SphereGeometry(0.05, 16, 16);
      const bossMaterial = new THREE.MeshStandardMaterial({
        color: 0xD4AF37,
        roughness: 0.3,
        metalness: 0.8
      });
      
      const boss1 = new THREE.Mesh(bossGeometry, bossMaterial);
      boss1.position.set(-0.25, 0, 0.03);
      boss1.scale.y = 0.5;
      
      const boss2 = new THREE.Mesh(bossGeometry, bossMaterial);
      boss2.position.set(0.25, 0, 0.03);
      boss2.scale.y = 0.5;
      
      kymbalaGroup.add(cymbal1);
      kymbalaGroup.add(cymbal2);
      kymbalaGroup.add(boss1);
      kymbalaGroup.add(boss2);
      
      return kymbalaGroup;
    }
    
    createKrotala() {
      const krotalaGroup = new THREE.Group();
      
      // Create two wooden clappers
      const clapperGeometry = new THREE.BoxGeometry(0.2, 0.04, 0.6);
      const clapperMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.8,
        metalness: 0.1
      });
      
      // First clapper
      const clapper1 = new THREE.Mesh(clapperGeometry, clapperMaterial);
      clapper1.position.set(-0.2, 0, 0);
      clapper1.rotation.z = Math.PI / 12;
      
      // Second clapper
      const clapper2 = new THREE.Mesh(clapperGeometry, clapperMaterial);
      clapper2.position.set(0.2, 0, 0);
      clapper2.rotation.z = -Math.PI / 12;
      
      krotalaGroup.add(clapper1);
      krotalaGroup.add(clapper2);
      
      return krotalaGroup;
    }
  }