import * as THREE from 'three';
import { createHovercraft, createHydrogenCapsule, createHydrogenPlasmaCore } from './models';
import { SolarSurfaceManager } from './solarSurface';
import { sound } from './sound';
import { PlayerStats, TouchInputState } from '../types/game';

export interface SurfaceEventCallbacks {
  onCapsuleDestroyed: (remaining: number, total: number) => void;
  onCreditCollected: (amount: number, newTotal: number) => void;
  onDamageTaken: (newShield: number, newHealth: number) => void;
  onCitadelReady: () => void;
  onEnterCitadel: () => void;
  onGameOver: () => void;
}

export class SurfaceScene {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private solarSurface: SolarSurfaceManager;

  // Actors
  public hovercraft: THREE.Group;
  private capsules: THREE.Group[] = [];
  private plasmaCores: THREE.Group[] = [];
  private lasers: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = [];
  private particles: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = [];

  // Citadel Breach Dock
  private citadelDock: THREE.Group;
  private isCitadelUnlocked = false;

  // Hovercraft Physics & Kinematics
  private velocity = new THREE.Vector3();
  private hoverYaw = 0;
  private rollAngle = 0;
  private pitchAngle = 0;
  private fireCooldown = 0;
  private isBoosting = false;

  // Game state
  private playerStats: PlayerStats;
  private callbacks: SurfaceEventCallbacks;
  private targetCapsules = 4;
  private destroyedInSector = 0;

  constructor(
    container: HTMLElement,
    playerStats: PlayerStats,
    callbacks: SurfaceEventCallbacks
  ) {
    this.playerStats = playerStats;
    this.callbacks = callbacks;

    // 1. Scene & Warm Studio Horizon
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0c0608);
    this.scene.fog = new THREE.FogExp2(0x1a0709, 0.007);

    // 2. Camera setup
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(65, aspect, 0.1, 800);
    this.camera.position.set(0, 10, 20);

    // 3. Renderer with SRGB and Soft Shadows
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    container.appendChild(this.renderer.domElement);

    // 4. Lighting Rig (Warm Key Directional + Cool Deep Space Fill + Amber Rim)
    const keyLight = new THREE.DirectionalLight(0xff7733, 2.8);
    keyLight.position.set(30, 45, -20);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 150;
    const d = 40;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    this.scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0xff5500, 0x1a0b12, 1.2);
    this.scene.add(hemiLight);

    // 5. Star Photosphere & Hazards
    this.solarSurface = new SolarSurfaceManager(this.scene, 240);

    // 6. Spawn Player Hovercraft
    this.hovercraft = createHovercraft(this.playerStats.weaponLevel, this.playerStats.engineLevel);
    this.hovercraft.position.set(0, 1.5, 0);
    this.scene.add(this.hovercraft);

    // 7. Spawn Hydrogen Siphon Capsules across the sector
    this.spawnCapsules();

    // 8. Spawn Citadel Infiltration Hub Platform
    this.citadelDock = this.createCitadelDock();
    this.citadelDock.position.set(0, 0, -140);
    this.scene.add(this.citadelDock);
  }

  private createCitadelDock(): THREE.Group {
    const dock = new THREE.Group();
    dock.name = 'CitadelDock';

    // Massive Fortress Base Platform
    const platformGeo = new THREE.CylinderGeometry(16, 20, 6, 8);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a24,
      metalness: 0.9,
      roughness: 0.2,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = 3;
    dock.add(platform);

    // Infiltration Landing Bay Ring (Glowing breach zone)
    const ringGeo = new THREE.TorusGeometry(8, 0.6, 8, 24);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff4500,
      wireframe: true,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.name = 'DockBeaconRing';
    ring.position.y = 6.2;
    dock.add(ring);

    // Twin Defensive Spires
    const spireGeo = new THREE.BoxGeometry(2.5, 24, 2.5);
    const spireMat = new THREE.MeshStandardMaterial({ color: 0x121218, metalness: 0.85 });

    const spireL = new THREE.Mesh(spireGeo, spireMat);
    spireL.position.set(-14, 12, 0);
    dock.add(spireL);

    const spireR = spireL.clone();
    spireR.position.set(14, 12, 0);
    dock.add(spireR);

    // Holographic Cartel Insignia
    const holoGeo = new THREE.OctahedronGeometry(3.5, 0);
    const holoMat = new THREE.MeshBasicMaterial({
      color: 0xff6b6b,
      wireframe: true,
    });
    const holo = new THREE.Mesh(holoGeo, holoMat);
    holo.name = 'HoloInsignia';
    holo.position.set(0, 15, 0);
    dock.add(holo);

    return dock;
  }

  private spawnCapsules() {
    this.targetCapsules = 4 + this.playerStats.currentSector;
    const spawnPositions = [
      new THREE.Vector3(35, 0, -45),
      new THREE.Vector3(-45, 0, -60),
      new THREE.Vector3(55, 0, -100),
      new THREE.Vector3(-35, 0, -115),
      new THREE.Vector3(10, 0, -75),
    ];

    for (let i = 0; i < this.targetCapsules; i++) {
      const pos = spawnPositions[i % spawnPositions.length].clone();
      pos.x += (Math.random() - 0.5) * 12;
      pos.z += (Math.random() - 0.5) * 12;

      const capsule = createHydrogenCapsule(`cap_${i}`);
      capsule.position.copy(pos);
      this.scene.add(capsule);
      this.capsules.push(capsule);
    }
  }

  public update(delta: number, input: TouchInputState) {
    // 1. Update star surface simulation
    this.solarSurface.update(delta);

    // 2. Hovercraft Propulsion & Steering
    const baseSpeed = 26 + this.playerStats.engineLevel * 6;
    const boostMultiplier = input.isBoosting ? 1.75 : 1.0;
    this.isBoosting = input.isBoosting;

    // Turn steering
    if (Math.abs(input.moveX) > 0.05) {
      this.hoverYaw -= input.moveX * delta * 2.8;
      // Banking roll
      this.rollAngle = THREE.MathUtils.damp(this.rollAngle, -input.moveX * 0.45, 6, delta);
    } else {
      this.rollAngle = THREE.MathUtils.damp(this.rollAngle, 0, 5, delta);
    }

    // Forward/Backward thrust
    let targetSpeed = 0;
    if (Math.abs(input.moveY) > 0.05) {
      targetSpeed = -input.moveY * baseSpeed * boostMultiplier;
      this.pitchAngle = THREE.MathUtils.damp(this.pitchAngle, input.moveY * 0.15, 5, delta);
    } else {
      this.pitchAngle = THREE.MathUtils.damp(this.pitchAngle, 0, 4, delta);
    }

    // Acceleration damping
    const forwardVec = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.hoverYaw);
    const targetVel = forwardVec.clone().multiplyScalar(targetSpeed);
    this.velocity.lerp(targetVel, delta * 3.5);

    // Move hovercraft
    this.hovercraft.position.addScaledVector(this.velocity, delta);

    // Dynamic floating wave bounce
    const hoverFloatY = 1.3 + Math.sin(Date.now() * 0.005) * 0.18;
    this.hovercraft.position.y = hoverFloatY;

    // Apply orientation
    this.hovercraft.rotation.y = this.hoverYaw;
    this.hovercraft.rotation.z = this.rollAngle;
    this.hovercraft.rotation.x = this.pitchAngle;

    // Animate rear thruster jet plumes
    const jetL = this.hovercraft.getObjectByName('JetL') as THREE.Mesh;
    const jetR = this.hovercraft.getObjectByName('JetR') as THREE.Mesh;
    if (jetL && jetR) {
      const scaleZ = 0.8 + (this.velocity.length() / baseSpeed) * (this.isBoosting ? 2.5 : 1.4);
      jetL.scale.set(1, 1, scaleZ);
      jetR.scale.set(1, 1, scaleZ);
      (jetL.material as THREE.MeshBasicMaterial).color.setHex(this.isBoosting ? 0xffffff : 0x00e1ff);
    }

    // 3. Firing Mechanism
    this.fireCooldown -= delta;
    if (input.isFiring && this.fireCooldown <= 0) {
      this.fireLasers();
      const fireRate = 0.22 - Math.min(this.playerStats.weaponLevel * 0.02, 0.1);
      this.fireCooldown = Math.max(fireRate, 0.09);
    }

    // 4. Update Laser Projectiles
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const laser = this.lasers[i];
      laser.mesh.position.addScaledVector(laser.vel, delta);
      laser.life -= delta;

      // Check collision with Capsules
      let hit = false;
      for (const capsule of this.capsules) {
        if (capsule.userData.isDestroyed) continue;
        const dist = laser.mesh.position.distanceTo(capsule.position);
        if (dist < 4.2) {
          hit = true;
          this.damageCapsule(capsule, 25 + this.playerStats.weaponLevel * 10);
          break;
        }
      }

      if (hit || laser.life <= 0) {
        this.scene.remove(laser.mesh);
        laser.mesh.geometry.dispose();
        (laser.mesh.material as THREE.Material).dispose();
        this.lasers.splice(i, 1);
      }
    }

    // 5. Update Capsules & Siphon Animations
    this.capsules.forEach((capsule) => {
      if (!capsule.userData.isDestroyed) {
        const rings = capsule.getObjectByName('Rings');
        if (rings) rings.rotation.y += delta * 1.5;
        const beacon = capsule.getObjectByName('Beacon') as THREE.Mesh;
        if (beacon) {
          const bMat = beacon.material as THREE.MeshBasicMaterial;
          bMat.opacity = Math.sin(Date.now() * 0.008) * 0.5 + 0.5;
        }
      }
    });

    // 6. Update Plasma Cores (Collectibles) & Magnet Vacuum
    const magnetRadius = 10 + this.playerStats.magnetLevel * 4;
    for (let i = this.plasmaCores.length - 1; i >= 0; i--) {
      const core = this.plasmaCores[i];
      core.rotation.y += delta * 3.0;
      core.rotation.x += delta * 2.0;

      const distToPlayer = core.position.distanceTo(this.hovercraft.position);

      // Vacuum magnetic pull toward hovercraft
      if (distToPlayer < magnetRadius) {
        const pullDir = this.hovercraft.position.clone().sub(core.position).normalize();
        core.position.addScaledVector(pullDir, delta * 24);
      }

      // Collect when close
      if (distToPlayer < 2.5) {
        sound.playCreditChime();
        sound.vibrate(40);
        this.playerStats.credits += core.userData.value;
        this.callbacks.onCreditCollected(core.userData.value, this.playerStats.credits);

        // Remove core
        this.scene.remove(core);
        this.plasmaCores.splice(i, 1);
        continue;
      }

      core.userData.life -= delta;
      if (core.userData.life <= 0) {
        this.scene.remove(core);
        this.plasmaCores.splice(i, 1);
      }
    }

    // 7. Update Explosion Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.mesh.position.addScaledVector(p.vel, delta);
      p.life -= delta;
      p.mesh.scale.multiplyScalar(0.96);
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        (p.mesh.material as THREE.Material).dispose();
        this.particles.splice(i, 1);
      }
    }

    // 8. Heat Hazard Flare Eruption Check
    this.solarSurface.hazardFlares.forEach((flare) => {
      const dist = this.hovercraft.position.distanceTo(flare.pos);
      if (dist < flare.radius) {
        // Taking thermal flare heat
        const heatAdd = delta * 35;
        this.playerStats.heat = Math.min(this.playerStats.heat + heatAdd, this.playerStats.maxHeat);
        if (this.playerStats.heat >= this.playerStats.maxHeat) {
          // Heat causes shield degradation
          this.applyDamage(delta * 15);
        }
      }
    });

    // Natural cooling over time when moving
    if (this.velocity.length() > 5) {
      this.playerStats.heat = Math.max(0, this.playerStats.heat - delta * 12);
    }

    // 9. Check Citadel Dock Breach Zone
    const distToCitadel = this.hovercraft.position.distanceTo(this.citadelDock.position);
    const holo = this.citadelDock.getObjectByName('HoloInsignia');
    if (holo) {
      holo.rotation.y += delta * 1.2;
      holo.rotation.z += delta * 0.8;
    }

    const beaconRing = this.citadelDock.getObjectByName('DockBeaconRing') as THREE.Mesh;
    if (beaconRing) {
      const rMat = beaconRing.material as THREE.MeshBasicMaterial;
      if (this.isCitadelUnlocked) {
        rMat.color.setHex(0x38d9a9); // Ready to enter
        beaconRing.scale.setScalar(1 + Math.sin(Date.now() * 0.006) * 0.15);
      } else {
        rMat.color.setHex(0xff4500); // Locked until capsules destroyed
      }
    }

    if (distToCitadel < 14 && this.isCitadelUnlocked) {
      // Trigger breach into Citadel!
      this.callbacks.onEnterCitadel();
    }

    // 10. Smooth 3rd-Person Follow Camera
    const cameraOffset = new THREE.Vector3(0, 5.5, 12).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.hoverYaw);
    const targetCamPos = this.hovercraft.position.clone().add(cameraOffset);
    this.camera.position.lerp(targetCamPos, delta * 4.5);

    const lookTarget = this.hovercraft.position.clone().add(new THREE.Vector3(0, 1.8, 0));
    this.camera.lookAt(lookTarget);

    // Dynamic FOV widening on boost
    const targetFOV = this.isBoosting ? 76 : 65;
    this.camera.fov = THREE.MathUtils.damp(this.camera.fov, targetFOV, 4, delta);
    this.camera.updateProjectionMatrix();

    // 11. Render
    this.renderer.render(this.scene, this.camera);
  }

  private fireLasers() {
    sound.playLaser(1.1);
    sound.vibrate(20);

    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.hoverYaw);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.hoverYaw);

    const laserGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.2, 6);
    laserGeo.rotateX(Math.PI / 2);
    const laserMat = new THREE.MeshBasicMaterial({ color: 0x00e1ff });

    // Dual shot from left and right cannon barrels
    [-0.85, 0.85].forEach((offset) => {
      const mesh = new THREE.Mesh(laserGeo, laserMat);
      const spawnPos = this.hovercraft.position.clone().addScaledVector(right, offset).add(new THREE.Vector3(0, 0.45, 0));
      mesh.position.copy(spawnPos);
      mesh.rotation.y = this.hoverYaw;

      this.scene.add(mesh);
      this.lasers.push({
        mesh,
        vel: forward.clone().multiplyScalar(95),
        life: 1.6,
      });
    });
  }

  private damageCapsule(capsule: THREE.Group, damage: number) {
    capsule.userData.hp -= damage;
    sound.playExplosion(false);
    sound.vibrate([30, 20, 30]);

    // Flash core
    const core = capsule.getObjectByName('HydrogenCore') as THREE.Mesh;
    if (core) {
      (core.material as THREE.MeshBasicMaterial).color.setHex(0xffffff);
      setTimeout(() => {
        if (core && !capsule.userData.isDestroyed) {
          (core.material as THREE.MeshBasicMaterial).color.setHex(0x66d9e8);
        }
      }, 80);
    }

    if (capsule.userData.hp <= 0 && !capsule.userData.isDestroyed) {
      capsule.userData.isDestroyed = true;
      this.destroyCapsule(capsule);
    }
  }

  private destroyCapsule(capsule: THREE.Group) {
    sound.playExplosion(true);
    sound.vibrate([60, 40, 80, 50]);
    this.playerStats.destroyedCapsulesTotal++;
    this.destroyedInSector++;

    // Shatter capsule into explosive debris particles
    const debrisGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const debrisMat = new THREE.MeshStandardMaterial({ color: 0xff922b, emissive: 0xff3b00, emissiveIntensity: 0.6 });

    for (let i = 0; i < 18; i++) {
      const mesh = new THREE.Mesh(debrisGeo, debrisMat);
      mesh.position.copy(capsule.position).add(new THREE.Vector3(0, 4, 0));
      this.scene.add(mesh);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 22,
        Math.random() * 18 + 5,
        (Math.random() - 0.5) * 22
      );
      this.particles.push({ mesh, vel, life: 1.8 });
    }

    // Spawn 5-8 Hydrogen Plasma Cores scattered on ground
    const coreCount = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < coreCount; i++) {
      const core = createHydrogenPlasmaCore(`core_${Date.now()}_${i}`);
      const dropPos = capsule.position.clone().add(
        new THREE.Vector3((Math.random() - 0.5) * 8, 1.0, (Math.random() - 0.5) * 8)
      );
      core.position.copy(dropPos);
      this.scene.add(core);
      this.plasmaCores.push(core);
    }

    // Remove capsule structure
    this.scene.remove(capsule);

    // Notify callback
    const remaining = this.targetCapsules - this.destroyedInSector;
    this.callbacks.onCapsuleDestroyed(remaining, this.targetCapsules);

    // Check if citadel is unlocked
    if (remaining <= 0 && !this.isCitadelUnlocked) {
      this.isCitadelUnlocked = true;
      sound.playAlarm();
      this.callbacks.onCitadelReady();
    }
  }

  private applyDamage(amount: number) {
    if (this.playerStats.shield > 0) {
      this.playerStats.shield = Math.max(0, this.playerStats.shield - amount);
      // Flash shield bubble
      const shield = this.hovercraft.getObjectByName('ShieldBubble') as THREE.Mesh;
      if (shield) {
        (shield.material as THREE.MeshBasicMaterial).opacity = 0.6;
        setTimeout(() => {
          if (shield) (shield.material as THREE.MeshBasicMaterial).opacity = 0;
        }, 120);
      }
    } else {
      this.playerStats.health = Math.max(0, this.playerStats.health - amount);
      if (this.playerStats.health <= 0) {
        this.callbacks.onGameOver();
      }
    }
    this.callbacks.onDamageTaken(this.playerStats.shield, this.playerStats.health);
  }

  public resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public dispose() {
    this.solarSurface.dispose();
    this.renderer.dispose();
  }
}
