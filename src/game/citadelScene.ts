import * as THREE from 'three';
import { createInfiltrator, createPatrolDrone, createCitadelCore } from './models';
import { sound } from './sound';
import { PlayerStats, TouchInputState } from '../types/game';

export interface CitadelEventCallbacks {
  onTerminalHacked: (current: number, total: number) => void;
  onCoreOverloaded: (countdownSeconds: number) => void;
  onDroneDestroyed: (droneId: string) => void;
  onAlertChanged: (alertLevel: number) => void;
  onDamageTaken: (shield: number, health: number) => void;
  onInfiltrationSuccess: (bonusCredits: number) => void;
  onGameOver: () => void;
}

export class CitadelScene {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  // Operative & Actors
  public operative: THREE.Group;
  private drones: THREE.Group[] = [];
  private crates: THREE.Mesh[] = [];
  private citadelCore: THREE.Group;
  private bullets: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number; isEnemy: boolean }[] = [];
  private particles: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = [];

  // Infiltration State
  private playerStats: PlayerStats;
  private callbacks: CitadelEventCallbacks;
  private alertLevel = 0; // 0 (calm) to 100 (high alarm)
  private isCovering = false;
  private fireCooldown = 0;
  private empCooldown = 0;
  private hackProgress = 0;
  private isNearTerminal = false;
  private isTerminalHacked = false;
  private isCoreOverloaded = false;
  private escapeTimer = 45; // seconds
  private extractionZone: THREE.Vector3 = new THREE.Vector3(0, 0, 32);

  constructor(
    container: HTMLElement,
    playerStats: PlayerStats,
    callbacks: CitadelEventCallbacks
  ) {
    this.playerStats = playerStats;
    this.callbacks = callbacks;

    // 1. Scene & Lighting
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x06060c);
    this.scene.fog = new THREE.FogExp2(0x0b0b14, 0.015);

    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 300);
    this.camera.position.set(0, 12, 14);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    container.appendChild(this.renderer.domElement);

    // Interior Industrial Facility Lighting
    const amb = new THREE.AmbientLight(0x181824, 1.2);
    this.scene.add(amb);

    const topLight = new THREE.DirectionalLight(0xffeedd, 2.0);
    topLight.position.set(10, 25, 10);
    topLight.castShadow = true;
    this.scene.add(topLight);

    // 2. Build Facility Map (Floors, Walls, Barriers, Crates for Stealth Cover)
    this.buildCitadelMap();

    // 3. Spawn Operative
    this.operative = createInfiltrator();
    this.operative.position.set(0, 0, 30); // Starts at entry airlock
    this.scene.add(this.operative);

    // 4. Spawn Reactor Core
    this.citadelCore = createCitadelCore();
    this.citadelCore.position.set(0, 0, -28);
    this.scene.add(this.citadelCore);

    // 5. Spawn Patrol Drones
    this.spawnPatrolDrones();
  }

  private buildCitadelMap() {
    // Floor
    const floorGeo = new THREE.PlaneGeometry(36, 75);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x14141d,
      roughness: 0.4,
      metalness: 0.8,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Outer Walls
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x1b1b26,
      roughness: 0.6,
      metalness: 0.5,
    });
    const wallGeoSide = new THREE.BoxGeometry(1.2, 8, 75);

    const wallL = new THREE.Mesh(wallGeoSide, wallMat);
    wallL.position.set(-18, 4, 0);
    this.scene.add(wallL);

    const wallR = wallL.clone();
    wallR.position.set(18, 4, 0);
    this.scene.add(wallR);

    const wallBack = new THREE.Mesh(new THREE.BoxGeometry(36, 8, 1.2), wallMat);
    wallBack.position.set(0, 4, -38);
    this.scene.add(wallBack);

    // Cargo Crates & Cover Pillars (Where player can hide)
    const crateGeo = new THREE.BoxGeometry(2.4, 2.2, 2.4);
    const crateMat = new THREE.MeshStandardMaterial({
      color: 0x2b2c3d,
      roughness: 0.5,
      metalness: 0.7,
    });

    const crateLocations = [
      [-6, 12], [6, 14], [-7, 4], [8, 0],
      [-5, -10], [6, -12], [-8, -20], [7, -22],
    ];

    crateLocations.forEach(([x, z]) => {
      const crate = new THREE.Mesh(crateGeo, crateMat);
      crate.position.set(x, 1.1, z);
      crate.castShadow = true;
      crate.receiveShadow = true;
      this.scene.add(crate);
      this.crates.push(crate);
    });

    // Extraction Airlock Ring at South Entrance
    const airlockGeo = new THREE.TorusGeometry(3.5, 0.4, 8, 20);
    airlockGeo.rotateX(Math.PI / 2);
    const airlockMat = new THREE.MeshBasicMaterial({ color: 0x38d9a9, wireframe: true });
    const airlock = new THREE.Mesh(airlockGeo, airlockMat);
    airlock.name = 'ExtractionAirlock';
    airlock.position.set(0, 0.2, 32);
    this.scene.add(airlock);
  }

  private spawnPatrolDrones() {
    const droneConfigs = [
      { id: 'alpha', start: new THREE.Vector3(-9, 1.8, 18), range: 16, axis: 'x' },
      { id: 'beta', start: new THREE.Vector3(8, 1.8, 6), range: 18, axis: 'z' },
      { id: 'gamma', start: new THREE.Vector3(-8, 1.8, -8), range: 15, axis: 'x' },
      { id: 'omega', start: new THREE.Vector3(0, 1.8, -20), range: 14, axis: 'x' },
    ];

    droneConfigs.forEach((cfg) => {
      const drone = createPatrolDrone(cfg.id);
      drone.position.copy(cfg.start);
      drone.userData = {
        ...drone.userData,
        patrolStart: cfg.start.clone(),
        patrolRange: cfg.range,
        patrolAxis: cfg.axis,
        patrolDir: 1,
        patrolSpeed: 3.8,
        shootCooldown: 0,
        stunnedTimer: 0,
      };
      this.scene.add(drone);
      this.drones.push(drone);
    });
  }

  public update(delta: number, input: TouchInputState) {
    // 1. Operative Movement & Cover / Crouch State
    this.isCovering = input.isCovering;
    const moveSpeed = this.isCovering ? 3.5 : 7.2;

    const moveX = input.moveX * moveSpeed * delta;
    const moveZ = input.moveY * moveSpeed * delta;

    if (Math.abs(input.moveX) > 0.05 || Math.abs(input.moveY) > 0.05) {
      this.operative.position.x += moveX;
      this.operative.position.z += moveZ;

      // Restrict to corridor bounds
      this.operative.position.x = THREE.MathUtils.clamp(this.operative.position.x, -16, 16);
      this.operative.position.z = THREE.MathUtils.clamp(this.operative.position.z, -34, 34);

      // Face direction of movement
      const angle = Math.atan2(input.moveX, input.moveY);
      this.operative.rotation.y = THREE.MathUtils.damp(this.operative.rotation.y, angle, 12, delta);
    }

    // Crouch height animation
    const targetScaleY = this.isCovering ? 0.6 : 1.0;
    this.operative.scale.y = THREE.MathUtils.damp(this.operative.scale.y, targetScaleY, 10, delta);

    // 2. Check Cover Behind Crates
    let isBehindCover = false;
    if (this.isCovering) {
      for (const crate of this.crates) {
        if (this.operative.position.distanceTo(crate.position) < 2.8) {
          isBehindCover = true;
          break;
        }
      }
    }

    // 3. Firing Silenced Blaster
    this.fireCooldown -= delta;
    if (input.isFiring && this.fireCooldown <= 0) {
      this.fireSilencedBlaster();
      this.fireCooldown = 0.28;
    }

    // 4. Trigger EMP Shockwave
    this.empCooldown -= delta;
    if (input.isEMPTriggered && this.empCooldown <= 0) {
      this.triggerEMP();
      this.empCooldown = 6.0;
    }

    // 5. Update Patrol Drones & Detection Mechanics
    let playerSpotted = false;
    this.drones.forEach((drone) => {
      if (drone.userData.stunnedTimer > 0) {
        drone.userData.stunnedTimer -= delta;
        // Stun flicker
        drone.rotation.y += delta * 12;
        return;
      }

      // Patrol movement
      const axis = drone.userData.patrolAxis as 'x' | 'z';
      drone.position[axis] += drone.userData.patrolDir * drone.userData.patrolSpeed * delta;
      const distFromStart = Math.abs(drone.position[axis] - drone.userData.patrolStart[axis]);
      if (distFromStart > drone.userData.patrolRange) {
        drone.userData.patrolDir *= -1;
        drone.rotation.y += Math.PI;
      }

      // Drone hover float
      drone.position.y = 1.6 + Math.sin(Date.now() * 0.006) * 0.15;

      // Detection Check (Cone Line of Sight)
      const toPlayer = this.operative.position.clone().sub(drone.position);
      const distToPlayer = toPlayer.length();

      const scannerEye = drone.getObjectByName('ScannerEye') as THREE.Mesh;
      const visionCone = drone.getObjectByName('VisionCone') as THREE.Mesh;

      if (distToPlayer < 12) {
        // If player is in front and NOT behind cover
        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(drone.quaternion);
        const dot = forward.dot(toPlayer.clone().normalize());

        if (dot > 0.45 && !isBehindCover) {
          playerSpotted = true;
          drone.userData.isAlerted = true;

          // Turn eye and vision cone RED
          if (scannerEye) (scannerEye.material as THREE.MeshBasicMaterial).color.setHex(0xff0033);
          if (visionCone) (visionCone.material as THREE.MeshBasicMaterial).color.setHex(0xff0033);

          // Drone shoots at player
          drone.userData.shootCooldown -= delta;
          if (drone.userData.shootCooldown <= 0) {
            this.droneShoot(drone);
            drone.userData.shootCooldown = 0.75;
          }
        } else {
          drone.userData.isAlerted = false;
          if (scannerEye) (scannerEye.material as THREE.MeshBasicMaterial).color.setHex(0x38d9a9);
          if (visionCone) (visionCone.material as THREE.MeshBasicMaterial).color.setHex(0x38d9a9);
        }
      }
    });

    // Update Alert Level
    if (playerSpotted) {
      this.alertLevel = Math.min(100, this.alertLevel + delta * 35);
      if (Math.random() < 0.05) sound.playAlarm();
    } else {
      this.alertLevel = Math.max(0, this.alertLevel - delta * 12);
    }
    this.callbacks.onAlertChanged(this.alertLevel);

    // 6. Update Bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.mesh.position.addScaledVector(b.vel, delta);
      b.life -= delta;

      if (!b.isEnemy) {
        // Player bullet hits drone
        let hit = false;
        for (let j = this.drones.length - 1; j >= 0; j--) {
          const drone = this.drones[j];
          if (b.mesh.position.distanceTo(drone.position) < 1.4) {
            hit = true;
            this.destroyDrone(j);
            break;
          }
        }
        if (hit) b.life = 0;
      } else {
        // Enemy bullet hits player
        if (b.mesh.position.distanceTo(this.operative.position) < 1.2) {
          this.applyDamage(18);
          b.life = 0;
        }
      }

      if (b.life <= 0) {
        this.scene.remove(b.mesh);
        b.mesh.geometry.dispose();
        (b.mesh.material as THREE.Material).dispose();
        this.bullets.splice(i, 1);
      }
    }

    // 7. Update Explosion Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.mesh.position.addScaledVector(p.vel, delta);
      p.life -= delta;
      p.mesh.scale.multiplyScalar(0.95);
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        (p.mesh.material as THREE.Material).dispose();
        this.particles.splice(i, 1);
      }
    }

    // 8. Terminal Hacking & Core Overload Interaction
    const distToCore = this.operative.position.distanceTo(new THREE.Vector3(0, 0, -25));
    this.isNearTerminal = distToCore < 4.5;

    // Animate Core Singularity
    const orb = this.citadelCore.getObjectByName('SingularityOrb') as THREE.Mesh;
    if (orb && orb.material) {
      orb.rotation.y += delta * (this.isCoreOverloaded ? 6.0 : 1.5);
      orb.rotation.x += delta * (this.isCoreOverloaded ? 4.0 : 0.8);
      if (this.isCoreOverloaded) {
        (orb.material as THREE.MeshPhysicalMaterial).color.setHex(0xff0044);
      }
    }

    if (this.isNearTerminal && input.isInteracting && !this.isCoreOverloaded) {
      this.hackProgress += delta * (0.8 + this.playerStats.hackLevel * 0.3);
      if (Math.random() < 0.2) sound.playHackBeep();

      if (this.hackProgress >= 3.0) {
        this.isCoreOverloaded = true;
        this.isTerminalHacked = true;
        sound.playAlarm();
        sound.vibrate([100, 50, 100, 50, 200]);
        this.callbacks.onTerminalHacked(1, 1);
        this.callbacks.onCoreOverloaded(this.escapeTimer);
      }
    }

    // 9. Escape Countdown if Core Overloaded
    if (this.isCoreOverloaded) {
      this.escapeTimer -= delta;

      // Pulsing extraction airlock
      const airlock = this.scene.getObjectByName('ExtractionAirlock') as THREE.Mesh;
      if (airlock) {
        airlock.scale.setScalar(1 + Math.sin(Date.now() * 0.01) * 0.2);
      }

      // Check if reached extraction zone
      const distToEscape = this.operative.position.distanceTo(this.extractionZone);
      if (distToEscape < 3.5) {
        // Mission Accomplished!
        const bonus = 400 + this.playerStats.currentSector * 200;
        sound.playCreditChime();
        this.callbacks.onInfiltrationSuccess(bonus);
        return;
      }

      if (this.escapeTimer <= 0) {
        // Failed to escape before detonation
        sound.playExplosion(true);
        this.callbacks.onGameOver();
      }
    }

    // 10. Camera Follow Operative (Over the shoulder)
    const targetCam = this.operative.position.clone().add(new THREE.Vector3(0, 8.5, 9.5));
    this.camera.position.lerp(targetCam, delta * 4.5);
    this.camera.lookAt(this.operative.position.clone().add(new THREE.Vector3(0, 1.4, 0)));

    // 11. Render
    this.renderer.render(this.scene, this.camera);
  }

  private fireSilencedBlaster() {
    sound.playSilencedShot();
    sound.vibrate(15);

    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.operative.quaternion);
    const bulletGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const bulletMat = new THREE.MeshBasicMaterial({ color: 0x38d9a9 });
    const mesh = new THREE.Mesh(bulletGeo, bulletMat);
    mesh.position.copy(this.operative.position).add(new THREE.Vector3(0, 1.3, 0));

    this.scene.add(mesh);
    this.bullets.push({
      mesh,
      vel: forward.clone().multiplyScalar(45),
      life: 1.2,
      isEnemy: false,
    });
  }

  private droneShoot(drone: THREE.Group) {
    sound.playLaser(0.8);
    const toPlayer = this.operative.position.clone().add(new THREE.Vector3(0, 1.2, 0)).sub(drone.position).normalize();
    const bulletGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const bulletMat = new THREE.MeshBasicMaterial({ color: 0xff3838 });
    const mesh = new THREE.Mesh(bulletGeo, bulletMat);
    mesh.position.copy(drone.position);

    this.scene.add(mesh);
    this.bullets.push({
      mesh,
      vel: toPlayer.multiplyScalar(28),
      life: 1.5,
      isEnemy: true,
    });
  }

  private triggerEMP() {
    sound.playEMP();
    sound.vibrate([100, 40, 100]);

    // Visual shockwave ring
    const ringGeo = new THREE.RingGeometry(0.5, 12, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x22b8cf,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(this.operative.position).add(new THREE.Vector3(0, 0.2, 0));
    this.scene.add(ring);
    this.particles.push({ mesh: ring, vel: new THREE.Vector3(0, 0, 0), life: 0.5 });

    // Stun all drones within radius
    const empRadius = 14 + this.playerStats.empLevel * 3;
    this.drones.forEach((drone) => {
      if (drone.position.distanceTo(this.operative.position) < empRadius) {
        drone.userData.stunnedTimer = 5.0 + this.playerStats.empLevel * 1.5;
        drone.userData.isAlerted = false;
        const scannerEye = drone.getObjectByName('ScannerEye') as THREE.Mesh;
        if (scannerEye) (scannerEye.material as THREE.MeshBasicMaterial).color.setHex(0x22b8cf);
      }
    });
  }

  private destroyDrone(index: number) {
    const drone = this.drones[index];
    sound.playExplosion(false);
    sound.vibrate([40, 30, 40]);

    // Debris
    const pGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const pMat = new THREE.MeshBasicMaterial({ color: 0xff6b6b });
    for (let i = 0; i < 12; i++) {
      const mesh = new THREE.Mesh(pGeo, pMat);
      mesh.position.copy(drone.position);
      this.scene.add(mesh);
      const vel = new THREE.Vector3((Math.random() - 0.5) * 10, Math.random() * 8, (Math.random() - 0.5) * 10);
      this.particles.push({ mesh, vel, life: 1.0 });
    }

    this.scene.remove(drone);
    this.drones.splice(index, 1);
    this.callbacks.onDroneDestroyed(drone.userData.id);
  }

  private applyDamage(amount: number) {
    sound.vibrate(60);
    if (this.playerStats.shield > 0) {
      this.playerStats.shield = Math.max(0, this.playerStats.shield - amount);
    } else {
      this.playerStats.health = Math.max(0, this.playerStats.health - amount);
      if (this.playerStats.health <= 0) {
        this.callbacks.onGameOver();
      }
    }
    this.callbacks.onDamageTaken(this.playerStats.shield, this.playerStats.health);
  }

  public getHackState() {
    return {
      isNearTerminal: this.isNearTerminal,
      hackProgress: Math.min(100, Math.round((this.hackProgress / 3.0) * 100)),
      isOverloaded: this.isCoreOverloaded,
      escapeTimer: Math.max(0, Math.ceil(this.escapeTimer)),
    };
  }

  public resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public dispose() {
    this.renderer.dispose();
  }
}
