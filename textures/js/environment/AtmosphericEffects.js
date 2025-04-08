/**
 * AtmosphericEffects
 * Handles particle systems and atmospheric effects
 */
class AtmosphericEffects {
    constructor(scene) {
      this.scene = scene;
      this.particles = null;
      this.birds = [];
      
      // Particle count for atmosphere
      this.particleCount = 2000;
    }
    
    createAtmosphericEffects() {
      // Create particle system for atmosphere (dust, pollen, etc.)
      this.createParticleSystem();
      
      // Create birds flying in the sky
      this.createBirds();
    }
    
    createParticleSystem() {
      const particlesGeometry = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(this.particleCount * 3);
      
      for (let i = 0; i < this.particleCount; i++) {
        const i3 = i * 3;
        const radius = 50 + Math.random() * 100;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        particlePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        particlePositions[i3 + 1] = Math.random() * 40 + 1;
        particlePositions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      }
      
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      
      const particleMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true,
        opacity: 0.3,
        sizeAttenuation: true
      });
      
      this.particles = new THREE.Points(particlesGeometry, particleMaterial);
      
      // Add animation data
      this.particles.userData = {
        initialPositions: particlePositions.slice(),
        update: (time) => {
          const positions = this.particles.geometry.attributes.position.array;
          for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            
            // Gentle drift
            positions[i3] += Math.sin(time * 0.001 + i * 0.01) * 0.01;
            positions[i3 + 1] += Math.sin(time * 0.0005 + i * 0.01) * 0.01;
            positions[i3 + 2] += Math.cos(time * 0.001 + i * 0.01) * 0.01;
            
            // Keep particles visible
            if (positions[i3 + 1] < 0) {
              positions[i3 + 1] = 40;
            } else if (positions[i3 + 1] > 40) {
              positions[i3 + 1] = 0;
            }
          }
          this.particles.geometry.attributes.position.needsUpdate = true;
        }
      };
      
      this.scene.add(this.particles);
    }
    
    createBirds() {
      const birdCount = 20;
      for (let i = 0; i < birdCount; i++) {
        const bird = this.createBird();
        
        // Position bird in sky
        const angle = Math.random() * Math.PI * 2;
        const radius = 80 + Math.random() * 120;
        const height = 25 + Math.random() * 20;
        
        bird.position.set(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        );
        bird.rotation.y = Math.random() * Math.PI * 2;
        
        this.scene.add(bird);
        this.birds.push(bird);
      }
    }
    
    createBird() {
        const birdGroup = new THREE.Group();
        
        // Create bird body
        const bodyGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({
          color: 0x333333,
          roughness: 0.9,
          metalness: 0.1
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.scale.set(1, 0.7, 1.2);
        birdGroup.add(body);
        
        // Create wings
        const wingGeometry = new THREE.BoxGeometry(0.8, 0.05, 0.3);
        const wingMaterial = new THREE.MeshStandardMaterial({
          color: 0x444444,
          roughness: 0.9,
          metalness: 0.1
        });
        
        const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        leftWing.position.set(-0.4, 0, 0);
        birdGroup.add(leftWing);
        
        const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        rightWing.position.set(0.4, 0, 0);
        birdGroup.add(rightWing);
        
        // Generate a random angle for flight path
        const birdAngle = Math.random() * Math.PI * 2; // Add this line to define the angle
        
        // Add animation data
        birdGroup.userData = {
          flySpeed: 0.1 + Math.random() * 0.1,
          turnSpeed: 0.005 + Math.random() * 0.005,
          time: Math.random() * 1000,
          wingFlapSpeed: 0.2 + Math.random() * 0.1,
          targetRotation: birdGroup.rotation.y,
          circlingCenter: new THREE.Vector3(0, 0, 0),
          circlingRadius: 80 + Math.random() * 50,
          circlingHeight: 25 + Math.random() * 20,
          circlingSpeed: 0.003 + Math.random() * 0.002,
          circlingAngle: birdAngle, // Use birdAngle instead of angle
          update: (deltaTime) => {
            birdGroup.userData.time += deltaTime;
            
            // Wing flapping animation
            leftWing.rotation.z = Math.sin(birdGroup.userData.time * birdGroup.userData.wingFlapSpeed) * 0.5;
            rightWing.rotation.z = -Math.sin(birdGroup.userData.time * birdGroup.userData.wingFlapSpeed) * 0.5;
            
            // Circular flight pattern
            birdGroup.userData.circlingAngle += birdGroup.userData.circlingSpeed;
            birdGroup.position.x = Math.cos(birdGroup.userData.circlingAngle) * birdGroup.userData.circlingRadius;
            birdGroup.position.z = Math.sin(birdGroup.userData.circlingAngle) * birdGroup.userData.circlingRadius;
            
            // Adjust height slightly
            birdGroup.position.y = birdGroup.userData.circlingHeight + Math.sin(birdGroup.userData.time * 0.001) * 2;
            
            // Turn in direction of travel
            const targetRotation = Math.atan2(
              -Math.cos(birdGroup.userData.circlingAngle),
              -Math.sin(birdGroup.userData.circlingAngle)
            );
            
            birdGroup.rotation.y += (targetRotation - birdGroup.rotation.y) * birdGroup.userData.turnSpeed * 5;
            
            // Slight banking in turns
            birdGroup.rotation.z = (targetRotation - birdGroup.rotation.y) * 0.2;
          }
        };
        
        return birdGroup;
      }

update(time, deltaTime) {
  // Update atmospheric particles
  if (this.particles && this.particles.userData && this.particles.userData.update) {
    this.particles.userData.update(time);
  }
  
  // Update birds
  this.birds.forEach(bird => {
    if (bird.userData && bird.userData.update) {
      bird.userData.update(deltaTime);
    }
  });
}
}
            