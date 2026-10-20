import * as THREE from 'three';

/**
 * Creates procedural 3D assets for Helios Infiltrator following Three.js guidelines:
 * - 3 to 12 part composite groups with primary, secondary, and accent details
 * - PBR materials with varied roughness/metalness
 * - Procedural canvas textures (zero external file 404 dependencies)
 */

// Shared reusable materials & canvas textures
function createCarbonFiberTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1c1c24';
  ctx.fillRect(0, 0, 128, 128);

  ctx.fillStyle = '#282834';
  for (let y = 0; y < 128; y += 4) {
    for (let x = 0; x < 128; x += 4) {
      if ((x / 4 + y / 4) % 2 === 0) {
        ctx.fillRect(x, y, 4, 4);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createHazardStripeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f59f00';
  ctx.fillRect(0, 0, 128, 128);

  ctx.fillStyle = '#1e1e24';
  ctx.beginPath();
  for (let i = -128; i < 256; i += 32) {
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 32, 128);
    ctx.lineTo(i + 16, 128);
    ctx.lineTo(i - 16, 0);
  }
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const carbonTexture = createCarbonFiberTexture();
const hazardTexture = createHazardStripeTexture();

/**
 * 1. 3D Hovercraft - Solar Skimmer (Composite 9-part Group)
 */
export function createHovercraft(weaponLevel = 1, engineLevel = 1): THREE.Group {
  const craft = new THREE.Group();
  craft.name = 'Hovercraft';

  // 1. Fuselage / Main Hull (Primary Silhouette)
  const hullGeo = new THREE.ConeGeometry(0.9, 3.2, 5);
  hullGeo.rotateX(Math.PI / 2);
  hullGeo.scale(1.2, 0.45, 1.0);
  const hullMat = new THREE.MeshStandardMaterial({
    map: carbonTexture,
    color: 0x2b2b36,
    metalness: 0.85,
    roughness: 0.25,
  });
  const hull = new THREE.Mesh(hullGeo, hullMat);
  hull.position.y = 0.5;
  hull.castShadow = true;
  craft.add(hull);

  // 2. Cockpit Canopy (Accent Detail)
  const canopyGeo = new THREE.SphereGeometry(0.45, 16, 12);
  canopyGeo.scale(0.8, 0.5, 1.6);
  const canopyMat = new THREE.MeshPhysicalMaterial({
    color: 0xff7b00,
    emissive: 0xff4500,
    emissiveIntensity: 0.3,
    metalness: 0.2,
    roughness: 0.1,
    transmission: 0.6,
    transparent: true,
    opacity: 0.9,
  });
  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  canopy.position.set(0, 0.72, 0.1);
  craft.add(canopy);

  // 3 & 4. Left and Right Swept Wings (Secondary Silhouette)
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(1.8, -0.7);
  wingShape.lineTo(1.6, -1.5);
  wingShape.lineTo(0, -1.0);
  wingShape.closePath();

  const wingExtrudeSettings = { depth: 0.08, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03 };
  const wingGeo = new THREE.ExtrudeGeometry(wingShape, wingExtrudeSettings);
  wingGeo.rotateX(-Math.PI / 2);

  const wingMat = new THREE.MeshStandardMaterial({
    color: 0x3d3d4e,
    metalness: 0.9,
    roughness: 0.3,
  });

  const rightWing = new THREE.Mesh(wingGeo, wingMat);
  rightWing.position.set(0.6, 0.5, 0.4);
  rightWing.castShadow = true;
  craft.add(rightWing);

  const leftWing = rightWing.clone();
  leftWing.scale.x = -1;
  leftWing.position.set(-0.6, 0.5, 0.4);
  craft.add(leftWing);

  // 5 & 6. Left & Right Magnetic Repulsor Pods on wing tips
  const podGeo = new THREE.CylinderGeometry(0.2, 0.22, 1.1, 12);
  podGeo.rotateX(Math.PI / 2);
  const podMat = new THREE.MeshStandardMaterial({
    color: 0x181820,
    metalness: 0.95,
    roughness: 0.15,
  });

  const rightPod = new THREE.Mesh(podGeo, podMat);
  rightPod.position.set(2.2, 0.45, -0.3);
  craft.add(rightPod);

  const leftPod = rightPod.clone();
  leftPod.position.set(-2.2, 0.45, -0.3);
  craft.add(leftPod);

  // 7. Dual Twin Plasma Cannons (Scales with weaponLevel)
  const cannonBarrelGeo = new THREE.CylinderGeometry(0.06 * Math.min(weaponLevel, 3), 0.08, 1.4, 8);
  cannonBarrelGeo.rotateX(Math.PI / 2);
  const cannonMat = new THREE.MeshStandardMaterial({
    color: 0x111116,
    metalness: 0.95,
    roughness: 0.2,
  });

  const rightCannon = new THREE.Mesh(cannonBarrelGeo, cannonMat);
  rightCannon.position.set(0.85, 0.48, 1.1);
  craft.add(rightCannon);

  const leftCannon = rightCannon.clone();
  leftCannon.position.set(-0.85, 0.48, 1.1);
  craft.add(leftCannon);

  // 8. Dual Rear Ion Thrusters (Scales with engineLevel)
  const thrusterGeo = new THREE.CylinderGeometry(0.22, 0.3, 0.6, 12);
  thrusterGeo.rotateX(Math.PI / 2);
  const thrusterMat = new THREE.MeshStandardMaterial({
    color: 0x222228,
    metalness: 0.9,
    roughness: 0.3,
  });

  const thrusterL = new THREE.Mesh(thrusterGeo, thrusterMat);
  thrusterL.position.set(-0.45, 0.5, -1.6);
  craft.add(thrusterL);

  const thrusterR = thrusterL.clone();
  thrusterR.position.set(0.45, 0.5, -1.6);
  craft.add(thrusterR);

  // 9. Thruster Plasma Jet Plumes (Animated in tick)
  const jetGeo = new THREE.ConeGeometry(0.26, 1.2, 8);
  jetGeo.rotateX(-Math.PI / 2);
  const jetMat = new THREE.MeshBasicMaterial({
    color: 0x00d4ff,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
  });

  const jetL = new THREE.Mesh(jetGeo, jetMat);
  jetL.name = 'JetL';
  jetL.position.set(-0.45, 0.5, -2.4);
  craft.add(jetL);

  const jetR = jetL.clone();
  jetR.name = 'JetR';
  jetR.position.set(0.45, 0.5, -2.4);
  craft.add(jetR);

  // Shield bubble mesh (hidden unless active)
  const shieldGeo = new THREE.SphereGeometry(2.6, 24, 16);
  const shieldMat = new THREE.MeshBasicMaterial({
    color: 0x38d9a9,
    wireframe: true,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
  });
  const shield = new THREE.Mesh(shieldGeo, shieldMat);
  shield.name = 'ShieldBubble';
  shield.position.y = 0.5;
  craft.add(shield);

  return craft;
}

/**
 * 2. Hydrogen Siphon Extraction Capsule (Composite 10-part Tower)
 * Planted by Dyson Cartel to drain the star's stellar hydrogen.
 */
export function createHydrogenCapsule(id: string): THREE.Group {
  const capsule = new THREE.Group();
  capsule.name = `Capsule_${id}`;
  capsule.userData = { id, maxHp: 100, hp: 100, isDestroyed: false, rotationSpeed: 0.015 };

  // 1. Heavy Star-Anchor Base Pedestal
  const baseGeo = new THREE.CylinderGeometry(2.4, 3.8, 1.8, 8);
  const baseMat = new THREE.MeshStandardMaterial({
    map: hazardTexture,
    roughness: 0.6,
    metalness: 0.7,
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.9;
  base.castShadow = true;
  base.receiveShadow = true;
  capsule.add(base);

  // 2. Central Hydrogen Fluid Chamber (Transmissive Glass Cylinder)
  const tankGeo = new THREE.CylinderGeometry(1.4, 1.4, 6.0, 16);
  const tankMat = new THREE.MeshPhysicalMaterial({
    color: 0x22b8cf,
    emissive: 0x15aabf,
    emissiveIntensity: 0.5,
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.8,
    transparent: true,
    opacity: 0.8,
  });
  const tank = new THREE.Mesh(tankGeo, tankMat);
  tank.position.y = 4.8;
  capsule.add(tank);

  // 3. Pulsing Core Plasma Filament (Inside the glass)
  const coreGeo = new THREE.CylinderGeometry(0.6, 0.6, 5.6, 12);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x66d9e8,
    wireframe: true,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.name = 'HydrogenCore';
  core.position.y = 4.8;
  capsule.add(core);

  // 4, 5, 6. Rotating Magnetic Siphon Rings
  const ringGroup = new THREE.Group();
  ringGroup.name = 'Rings';
  const ringGeo = new THREE.TorusGeometry(2.1, 0.15, 8, 24);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xff922b,
    emissive: 0xf76707,
    emissiveIntensity: 0.4,
    metalness: 0.9,
    roughness: 0.2,
  });

  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 3.0 + i * 1.8;
    ring.rotation.x = Math.PI / 2 + (i - 1) * 0.2;
    ringGroup.add(ring);
  }
  capsule.add(ringGroup);

  // 7. Top Antenna & Cartel Signal Spire
  const spireGeo = new THREE.ConeGeometry(0.8, 2.5, 6);
  const spireMat = new THREE.MeshStandardMaterial({
    color: 0x181820,
    metalness: 0.9,
    roughness: 0.2,
  });
  const spire = new THREE.Mesh(spireGeo, spireMat);
  spire.position.y = 8.8;
  capsule.add(spire);

  // 8. Red Pulsing Warning Beacon
  const beaconGeo = new THREE.SphereGeometry(0.3, 12, 12);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.name = 'Beacon';
  beacon.position.y = 10.2;
  capsule.add(beacon);

  // 9. Siphon Funnel downwards (plunges into the star)
  const funnelGeo = new THREE.ConeGeometry(2.2, 3.5, 8);
  funnelGeo.rotateX(Math.PI);
  const funnelMat = new THREE.MeshBasicMaterial({
    color: 0xff4500,
    wireframe: true,
  });
  const funnel = new THREE.Mesh(funnelGeo, funnelMat);
  funnel.position.y = -1.0;
  capsule.add(funnel);

  return capsule;
}

/**
 * 3. Syndicate Surveillance / Defense Drone (Composite 6-part Group)
 */
export function createPatrolDrone(id: string): THREE.Group {
  const drone = new THREE.Group();
  drone.name = `Drone_${id}`;
  drone.userData = { id, hp: 40, isAlerted: false, alertTimer: 0, patrolAngle: 0 };

  // 1. Armored Spherical Chassis
  const bodyGeo = new THREE.DodecahedronGeometry(0.7, 1);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x16161d,
    metalness: 0.9,
    roughness: 0.25,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 1.0;
  drone.add(body);

  // 2. Front Scanning Eye (Color changes based on alert)
  const eyeGeo = new THREE.SphereGeometry(0.28, 12, 12);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x38d9a9 }); // Green/cyan = calm, Yellow = suspicious, Red = alerted
  const eye = new THREE.Mesh(eyeGeo, eyeMat);
  eye.name = 'ScannerEye';
  eye.position.set(0, 1.0, 0.6);
  drone.add(eye);

  // 3. Antigravity Hover Rings
  const ringGeo = new THREE.TorusGeometry(0.95, 0.08, 8, 20);
  ringGeo.rotateX(Math.PI / 2);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xff922b,
    emissive: 0xff6b6b,
    emissiveIntensity: 0.3,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.name = 'HoverRing';
  ring.position.y = 0.95;
  drone.add(ring);

  // 4 & 5. Dual Pulse Blaster Barrels
  const gunGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.8, 8);
  gunGeo.rotateX(Math.PI / 2);
  const gunMat = new THREE.MeshStandardMaterial({ color: 0x212529, metalness: 0.9 });
  const gunL = new THREE.Mesh(gunGeo, gunMat);
  gunL.position.set(-0.55, 0.7, 0.4);
  drone.add(gunL);

  const gunR = gunL.clone();
  gunR.position.set(0.55, 0.7, 0.4);
  drone.add(gunR);

  // 6. Projected Vision Cone on Floor (Line-of-Sight)
  const coneShapeGeo = new THREE.ConeGeometry(5.0, 9.0, 16, 1, true, -Math.PI / 6, Math.PI / 3);
  coneShapeGeo.rotateX(Math.PI / 2);
  coneShapeGeo.rotateY(Math.PI);
  const coneMat = new THREE.MeshBasicMaterial({
    color: 0x38d9a9,
    transparent: true,
    opacity: 0.22,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const visionCone = new THREE.Mesh(coneShapeGeo, coneMat);
  visionCone.name = 'VisionCone';
  visionCone.position.set(0, 0.08, 4.5);
  drone.add(visionCone);

  return drone;
}

/**
 * 4. Ground Operative - Helios Infiltrator Suit (Composite 8-part Group)
 */
export function createInfiltrator(): THREE.Group {
  const operative = new THREE.Group();
  operative.name = 'Operative';

  // 1. Armored Torso / Nano-Suit
  const torsoGeo = new THREE.BoxGeometry(0.7, 0.9, 0.45);
  const suitMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a24,
    metalness: 0.6,
    roughness: 0.4,
  });
  const torso = new THREE.Mesh(torsoGeo, suitMat);
  torso.name = 'Torso';
  torso.position.y = 1.35;
  torso.castShadow = true;
  operative.add(torso);

  // 2. Tactical Visor Helmet
  const headGeo = new THREE.SphereGeometry(0.32, 16, 16);
  const headMat = new THREE.MeshStandardMaterial({
    color: 0x282834,
    metalness: 0.8,
    roughness: 0.2,
  });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 2.05;
  operative.add(head);

  // 3. Glowing Visor (HUD Optic)
  const visorGeo = new THREE.BoxGeometry(0.35, 0.12, 0.2);
  const visorMat = new THREE.MeshBasicMaterial({
    color: 0x22b8cf,
  });
  const visor = new THREE.Mesh(visorGeo, visorMat);
  visor.position.set(0, 2.08, 0.25);
  operative.add(visor);

  // 4 & 5. Left & Right Legs
  const legGeo = new THREE.BoxGeometry(0.24, 0.9, 0.26);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x121218, metalness: 0.7, roughness: 0.5 });
  const legL = new THREE.Mesh(legGeo, legMat);
  legL.name = 'LegL';
  legL.position.set(-0.2, 0.45, 0);
  legL.castShadow = true;
  operative.add(legL);

  const legR = legL.clone();
  legR.name = 'LegR';
  legR.position.set(0.2, 0.45, 0);
  operative.add(legR);

  // 6. Silenced Pulse Carbine
  const rifleGeo = new THREE.BoxGeometry(0.12, 0.2, 0.85);
  const rifleMat = new THREE.MeshStandardMaterial({ color: 0x09090d, metalness: 0.9, roughness: 0.1 });
  const rifle = new THREE.Mesh(rifleGeo, rifleMat);
  rifle.position.set(0.35, 1.3, 0.45);
  operative.add(rifle);

  // 7. Backpack Field Battery / Thermal Shield
  const packGeo = new THREE.BoxGeometry(0.45, 0.6, 0.2);
  const packMat = new THREE.MeshStandardMaterial({ color: 0xfa5252, emissive: 0xc92a2a, emissiveIntensity: 0.3 });
  const pack = new THREE.Mesh(packGeo, packMat);
  pack.position.set(0, 1.4, -0.3);
  operative.add(pack);

  return operative;
}

/**
 * 5. Citadel Siphon Reactor Core (Objective Target)
 */
export function createCitadelCore(): THREE.Group {
  const coreGroup = new THREE.Group();
  coreGroup.name = 'CitadelCore';

  // Base platform
  const baseGeo = new THREE.CylinderGeometry(4.5, 5.0, 1.2, 6);
  const baseMat = new THREE.MeshStandardMaterial({
    map: hazardTexture,
    roughness: 0.5,
    metalness: 0.7,
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.6;
  coreGroup.add(base);

  // 4 Surrounding Power Monoliths
  const pillarGeo = new THREE.BoxGeometry(0.9, 5.5, 0.9);
  const pillarMat = new THREE.MeshStandardMaterial({
    color: 0x1f1f2e,
    metalness: 0.85,
    roughness: 0.2,
  });

  const positions = [
    [-3.0, -3.0],
    [3.0, -3.0],
    [3.0, 3.0],
    [-3.0, 3.0],
  ];

  positions.forEach(([x, z]) => {
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.set(x, 3.2, z);
    coreGroup.add(pillar);
  });

  // Central Spinning Quantum Singularity Sphere
  const orbGeo = new THREE.SphereGeometry(1.6, 24, 24);
  const orbMat = new THREE.MeshPhysicalMaterial({
    color: 0xff922b,
    emissive: 0xf76707,
    emissiveIntensity: 0.8,
    metalness: 0.1,
    roughness: 0.1,
    transmission: 0.7,
    transparent: true,
  });
  const orb = new THREE.Mesh(orbGeo, orbMat);
  orb.name = 'SingularityOrb';
  orb.position.y = 3.6;
  coreGroup.add(orb);

  // Terminal console to hack
  const consoleGeo = new THREE.BoxGeometry(1.2, 1.4, 0.7);
  const consoleMat = new THREE.MeshStandardMaterial({
    color: 0x25262b,
    metalness: 0.8,
  });
  const terminal = new THREE.Mesh(consoleGeo, consoleMat);
  terminal.name = 'MainTerminal';
  terminal.position.set(0, 1.3, 3.6);

  // Screen
  const screenGeo = new THREE.PlaneGeometry(0.9, 0.5);
  screenGeo.rotateX(-Math.PI / 6);
  const screenMat = new THREE.MeshBasicMaterial({ color: 0x38d9a9 });
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.set(0, 0.3, 0.36);
  terminal.add(screen);

  coreGroup.add(terminal);

  return coreGroup;
}

/**
 * 6. Collectible Hydrogen Plasma Core
 */
export function createHydrogenPlasmaCore(id: string): THREE.Group {
  const orbGroup = new THREE.Group();
  orbGroup.name = `HCore_${id}`;
  orbGroup.userData = { id, value: 50, life: 18.0 };

  const coreGeo = new THREE.DodecahedronGeometry(0.45, 1);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x38d9a9,
    wireframe: true,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  orbGroup.add(core);

  const innerGeo = new THREE.SphereGeometry(0.3, 12, 12);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0x66d9e8,
  });
  const inner = new THREE.Mesh(innerGeo, innerMat);
  orbGroup.add(inner);

  return orbGroup;
}
