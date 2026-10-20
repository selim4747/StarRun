import * as THREE from 'three';

/**
 * Procedural Star Surface (Photosphere & Corona) Simulation
 * Generates convective red-orange plasma fields, solar prominences/flare arches,
 * and magnetic eruption hazards.
 */

export class SolarSurfaceManager {
  public photosphereMesh: THREE.Mesh;
  public coronaParticles: THREE.Points;
  public prominenceArches: THREE.Group;
  public hazardFlares: { mesh: THREE.Mesh; pos: THREE.Vector3; radius: number; intensity: number }[] = [];
  private timeUniform: { value: number } = { value: 0 };
  private canvasTexture: THREE.CanvasTexture;
  private canvasCtx: CanvasRenderingContext2D;

  constructor(scene: THREE.Scene, radius = 220) {
    // 1. Create procedural animated solar texture via canvas
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    this.canvasCtx = canvas.getContext('2d')!;
    this.drawSolarGranules(0);

    this.canvasTexture = new THREE.CanvasTexture(canvas);
    this.canvasTexture.wrapS = THREE.RepeatWrapping;
    this.canvasTexture.wrapT = THREE.RepeatWrapping;
    this.canvasTexture.repeat.set(16, 16);
    this.canvasTexture.colorSpace = THREE.SRGBColorSpace;

    // 2. Photosphere Surface Plane (Curved gently downwards to simulate massive stellar sphere)
    const geo = new THREE.PlaneGeometry(radius * 2, radius * 2, 64, 64);
    geo.rotateX(-Math.PI / 2);

    // Bend the edges slightly to evoke star curvature
    const posAttr = geo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      const distFromCenter = Math.sqrt(x * x + z * z);
      const curveY = -Math.pow(distFromCenter / radius, 2) * 12;
      posAttr.setY(i, curveY);
    }
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      map: this.canvasTexture,
      color: 0xff3b00,
      emissive: 0xd9480f,
      emissiveIntensity: 0.75,
      roughness: 0.85,
      metalness: 0.1,
    });

    this.photosphereMesh = new THREE.Mesh(geo, mat);
    this.photosphereMesh.position.y = 0;
    this.photosphereMesh.receiveShadow = true;
    scene.add(this.photosphereMesh);

    // 3. Solar Prominence Arches (Magnetic loops over the horizon)
    this.prominenceArches = new THREE.Group();
    const archMat = new THREE.MeshBasicMaterial({
      color: 0xff6b00,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const distance = 90 + Math.random() * 40;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(Math.cos(angle) * distance - 20, 0, Math.sin(angle) * distance - 20),
        new THREE.Vector3(Math.cos(angle) * distance, 22 + Math.random() * 12, Math.sin(angle) * distance),
        new THREE.Vector3(Math.cos(angle) * distance + 20, 0, Math.sin(angle) * distance + 20),
      ]);
      const archGeo = new THREE.TubeGeometry(curve, 32, 2.5 + Math.random() * 1.5, 8, false);
      const archMesh = new THREE.Mesh(archGeo, archMat);
      this.prominenceArches.add(archMesh);
    }
    scene.add(this.prominenceArches);

    // 4. Corona Embers Particle System (Floating plasma motes)
    const particleCount = 450;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * radius * 1.5;
      const y = Math.random() * 25 + 0.5;
      const z = (Math.random() - 0.5) * radius * 1.5;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color from incandescent gold to fiery crimson
      const t = Math.random();
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.3 + t * 0.6;
      colors[i * 3 + 2] = t * 0.1;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.85,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    this.coronaParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(this.coronaParticles);

    // 5. Spawn 5 Solar Flare Thermal Hazards (Pulsing fiery geysers)
    for (let i = 0; i < 5; i++) {
      const flareAngle = Math.random() * Math.PI * 2;
      const flareDist = 30 + Math.random() * 70;
      const flareX = Math.cos(flareAngle) * flareDist;
      const flareZ = Math.sin(flareAngle) * flareDist;

      const flareGeo = new THREE.CylinderGeometry(1.5, 4.0, 14, 12, 1, true);
      const flareMeshMat = new THREE.MeshBasicMaterial({
        color: 0xff3838,
        wireframe: true,
        transparent: true,
        opacity: 0.6,
      });
      const flareMesh = new THREE.Mesh(flareGeo, flareMeshMat);
      flareMesh.position.set(flareX, 7, flareZ);
      scene.add(flareMesh);

      this.hazardFlares.push({
        mesh: flareMesh,
        pos: new THREE.Vector3(flareX, 0, flareZ),
        radius: 6.5,
        intensity: 1.0,
      });
    }
  }

  private drawSolarGranules(time: number) {
    const ctx = this.canvasCtx;
    const w = 256;
    const h = 256;

    // Base glowing red-orange gradient
    const grad = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, 140);
    grad.addColorStop(0, '#ffd43b');
    grad.addColorStop(0.4, '#ff922b');
    grad.addColorStop(0.8, '#e8590c');
    grad.addColorStop(1, '#c92a2a');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Draw turbulent convective cells (Voronoi/Granule like spots)
    ctx.fillStyle = 'rgba(255, 230, 100, 0.4)';
    for (let i = 0; i < 30; i++) {
      const x = ((Math.sin(i * 1.7 + time * 0.8) + 1) / 2) * w;
      const y = ((Math.cos(i * 2.3 + time * 0.6) + 1) / 2) * h;
      const r = 12 + Math.sin(i + time) * 6;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cooler darker magnetic filament sunspots
    ctx.fillStyle = 'rgba(70, 10, 10, 0.5)';
    for (let j = 0; j < 12; j++) {
      const x = ((Math.cos(j * 3.1 + time * 0.3) + 1) / 2) * w;
      const y = ((Math.sin(j * 1.9 + time * 0.4) + 1) / 2) * h;
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  public update(delta: number) {
    this.timeUniform.value += delta;

    // Periodic redraw of procedural solar granulation (every ~10 frames)
    if (Math.random() < 0.2) {
      this.drawSolarGranules(this.timeUniform.value);
      this.canvasTexture.needsUpdate = true;
    }

    // Animate solar prominence arches
    this.prominenceArches.rotation.y += delta * 0.02;

    // Drift corona ember particles upwards & wrap
    const pos = this.coronaParticles.geometry.attributes.position as THREE.BufferAttribute;
    const array = pos.array as Float32Array;
    for (let i = 0; i < pos.count; i++) {
      array[i * 3 + 1] += delta * (1.8 + (i % 5) * 0.4);
      if (array[i * 3 + 1] > 26) {
        array[i * 3 + 1] = 0.5;
      }
    }
    pos.needsUpdate = true;

    // Animate hazard flares
    this.hazardFlares.forEach((flare, idx) => {
      const pulse = Math.sin(this.timeUniform.value * 3.0 + idx) * 0.5 + 0.5;
      flare.mesh.scale.set(1 + pulse * 0.3, 0.8 + pulse * 0.5, 1 + pulse * 0.3);
      flare.intensity = pulse;
    });
  }

  public dispose() {
    this.photosphereMesh.geometry.dispose();
    (this.photosphereMesh.material as THREE.Material).dispose();
    this.canvasTexture.dispose();
    this.coronaParticles.geometry.dispose();
    (this.coronaParticles.material as THREE.Material).dispose();
  }
}
