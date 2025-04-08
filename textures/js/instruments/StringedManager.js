/**
 * StringedManager
 * Handles creation and interaction of stringed instruments
 */
class StringedManager {
    constructor(scene, textureEngine) {
      this.scene = scene;
      this.textureEngine = textureEngine;
    }
    
    createLyre() {
      const lyreGroup = new THREE.Group();
      
      // Create the central resonator body (tortoise shell shape)
      const bodyGeometry = new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const bodyMaterial = new THREE.MeshPhongMaterial({
        color: 0x8b4513,
        specular: 0x333333,
        shininess: 30
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.scale.set(1, 0.6, 1.2);
      body.rotation.x = Math.PI / 2;
      lyreGroup.add(body);
      
      // Create top cover (soundboard)
      const coverGeometry = new THREE.CircleGeometry(1, 32, 0, Math.PI);
      const coverMaterial = new THREE.MeshPhongMaterial({
        color: 0xeeddcc,
        specular: 0x222222,
        shininess: 20
      });
      const cover = new THREE.Mesh(coverGeometry, coverMaterial);
      cover.position.z = 0.05;
      cover.rotation.x = -Math.PI / 2;
      lyreGroup.add(cover);
      
      // Create arms
      lyreGroup.add(this.createLyreArm(-1));
      lyreGroup.add(this.createLyreArm(1));
      
      // Create crossbar
      const crossbarGeometry = new THREE.CylinderGeometry(0.06, 0.06, 1, 16);
      const crossbarMaterial = new THREE.MeshPhongMaterial({
        color: 0x8b4513,
        specular: 0x222222,
        shininess: 30
      });
      const crossbar = new THREE.Mesh(crossbarGeometry, crossbarMaterial);
      crossbar.position.y = 2.2;
      crossbar.rotation.z = Math.PI / 2;
      lyreGroup.add(crossbar);
      
      // Create strings
      this.createLyreStrings(lyreGroup);
      
      return lyreGroup;
    }
    
    createLyreArm(side) {
      const armGroup = new THREE.Group();
      
      // Create curved path for the arm
      const curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(side * 0.9, 0, 0),
        new THREE.Vector3(side * 1.1, 1, 0),
        new THREE.Vector3(side * 0.8, 2, 0),
        new THREE.Vector3(side * 0.4, 2.2, 0)
      );
      const points = curve.getPoints(20);
      const armGeometry = new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points),
        64,
        0.08,
        16,
        false
      );
      const armMaterial = new THREE.MeshPhongMaterial({
        color: 0xd2b48c,
        specular: 0x222222,
        shininess: 30
      });
      const arm = new THREE.Mesh(armGeometry, armMaterial);
      armGroup.add(arm);
      
      return armGroup;
    }
    
    createLyreStrings(lyreGroup) {
      const stringMaterial = new THREE.LineBasicMaterial({
        color: 0xf5f5dc,
        transparent: true,
        opacity: 0.8
      });
      const stringCount = 7;
      for (let i = -0; i < stringCount; i++) {
        const x = -0.8 + (i * 1.6 / (stringCount - 1));
        const stringGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x, 2.2, 0),
          new THREE.Vector3(x, 0, 0.1)
        ]);
        const string = new THREE.Line(stringGeometry, stringMaterial);
        lyreGroup.add(string);
      }
    }
    
    createKithara() {
      const kitharaGroup = new THREE.Group();
      
      // Create soundbox
      const boxGeometry = new THREE.BoxGeometry(1.8, 0.6, 0.3);
      const boxMaterial = new THREE.MeshStandardMaterial({
        color: 0xd2b48c,
        roughness: 0.7,
        metalness: 0.1
      });
      const soundbox = new THREE.Mesh(boxGeometry, boxMaterial);
      kitharaGroup.add(soundbox);
      
      // Create decorative patterns on soundbox
      const decorGeometry = new THREE.PlaneGeometry(1.6, 0.4);
      const decorMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b4513,
        roughness: 0.7,
        metalness: 0.1
      });
      const decor = new THREE.Mesh(decorGeometry, decorMaterial);
      decor.position.z = 0.151;
      kitharaGroup.add(decor);
      
      // Create arms
      kitharaGroup.add(this.createKitharaArm(-1));
      kitharaGroup.add(this.createKitharaArm(1));
      
      // Create crossbar
      const crossbarGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1.6, 16);
      const crossbarMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.4,
        metalness: 0.6
      });
      const crossbar = new THREE.Mesh(crossbarGeometry, crossbarMaterial);
      crossbar.position.y = 3;
      crossbar.rotation.z = Math.PI / 2;
      kitharaGroup.add(crossbar);
      
      // Create strings
      this.createKitharaStrings(kitharaGroup);
      
      return kitharaGroup;
    }
    
    createKitharaArm(side) {
      const armGroup = new THREE.Group();
      
      // Create curved path for the arm
      const curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(side * 0.9, 0, 0),
        new THREE.Vector3(side * 1, 2, 0),
        new THREE.Vector3(side * 0.8, 2.8, 0),
        new THREE.Vector3(side * 0.5, 3, 0)
      );
      const points = curve.getPoints(20);
      const armGeometry = new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points),
        32,
        0.1,
        8,
        false
      );
      const armMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b4513,
        roughness: 0.7,
        metalness: 0.1
      });
      const arm = new THREE.Mesh(armGeometry, armMaterial);
      armGroup.add(arm);
      
      return armGroup;
    }
    
    createKitharaStrings(kitharaGroup) {
      const stringMaterial = new THREE.LineBasicMaterial({
        color: 0xf5f5dc,
        transparent: true,
        opacity: 0.8
      });
      const stringCount = 9;
      for (let i = 0; i < stringCount; i++) {
        const x = -0.8 + (i * 1.6 / (stringCount - 1));
        const stringGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x, 3, 0),
          new THREE.Vector3(x, 0, 0.15)
        ]);
        const string = new THREE.Line(stringGeometry, stringMaterial);
        kitharaGroup.add(string);
      }
    }
  }