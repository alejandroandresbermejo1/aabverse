import {
  Component,
  inject,
  signal,
  ElementRef,
  ViewChild,
  OnInit,
  AfterViewInit,
  OnDestroy,
  effect,
  NgZone
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';
import { CircuitGameService } from '../../services/circuit-game.service';
import { GamePhase, UpgradeItem } from '../../models/circuit-game.models';

interface CarGhost {
  mesh: THREE.Mesh;
  progress: number;
  speed: number;
  color: string;
  laneOffset: number;
  currentHeading: number;
}

interface SmokeParticle {
  mesh: THREE.Mesh;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  initialScale: number;
}

@Component({
  selector: 'app-circuit-game',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvasContainer') canvasContainerRef!: ElementRef<HTMLDivElement>;

  gameService = inject(CircuitGameService);
  private ngZone = inject(NgZone);

  activeTab = signal<'car' | 'team' | 'garage'>('car');
  activeUpgradeCategory = signal<'car' | 'team'>('car');

  previewPhase = signal<GamePhase | null>(null);
  allPhases: { id: GamePhase; name: string; circuitName: string }[] = [
    { id: 'iniciacion', name: 'Iniciación', circuitName: 'Kartódromo Municipal' },
    { id: 'amateur', name: 'Amateur', circuitName: 'Circuito Regional' },
    { id: 'profesional', name: 'Profesional', circuitName: 'Autódromo Nacional' },
    { id: 'elite', name: 'Élite Mundial', circuitName: 'Gran Premio Internacional' }
  ];

  carColors = [
    '#e10600', '#00d2be', '#0600ef', '#ff8700', '#229971',
    '#c0c0c0', '#52e252', '#facc15', '#ec4899', '#a855f7',
    '#14b8a6', '#f97316', '#3b82f6', '#84cc16', '#e2e8f0',
    '#9333ea', '#0284c7', '#16a34a', '#ca8a04', '#dc2626',
    '#059669', '#d97706', '#475569', '#6366f1', '#e11d48'
  ];
  carColorOptions = [
    { hex: '#e10600', name: 'Rojo Scuderia' },
    { hex: '#00d2be', name: 'Cian Flecha Plateada' },
    { hex: '#0600ef', name: 'Azul Competición' },
    { hex: '#ff8700', name: 'Naranja Papaya' },
    { hex: '#229971', name: 'Verde Carreras' },
    { hex: '#c0c0c0', name: 'Plata Cromado' },
    { hex: '#52e252', name: 'Verde Neón' },
    { hex: '#facc15', name: 'Amarillo Modena' },
    { hex: '#ec4899', name: 'Rosa Racing' },
    { hex: '#a855f7', name: 'Púrpura GP' },
    { hex: '#14b8a6', name: 'Turquesa Nitro' },
    { hex: '#3b82f6', name: 'Azul Eléctrico' },
    { hex: '#84cc16', name: 'Lima Tóxico' },
    { hex: '#e2e8f0', name: 'Blanco Perla' },
    { hex: '#9333ea', name: 'Violeta Hyper' },
    { hex: '#0284c7', name: 'Azul Zafiro' },
    { hex: '#16a34a', name: 'Verde Esmeralda' },
    { hex: '#ca8a04', name: 'Oro Campeonato' },
    { hex: '#dc2626', name: 'Carmesí Furia' },
    { hex: '#059669', name: 'Menta Velocidad' },
    { hex: '#d97706', name: 'Ámbar Desierto' },
    { hex: '#475569', name: 'Gris Grafito' },
    { hex: '#6366f1', name: 'Índigo Cosmos' },
    { hex: '#e11d48', name: 'Rubí Apex' }
  ];

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private animationFrameId?: number;

  private playerCarMesh!: THREE.Mesh;
  private playerProgress = 0;
  private playerHeading = 0;
  private ghostCars: CarGhost[] = [];

  private smokeParticles: SmokeParticle[] = [];
  private smokeGeometry = new THREE.SphereGeometry(0.065, 6, 6);
  private smokeMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.65
  });

  private currentTubeRadius = 1.35;
  private particleSpawnTimer = 0;

  private playerBoostVelocity = 0;
  private nitroMaterial = new THREE.MeshBasicMaterial({
    color: 0x00e5ff,
    transparent: true,
    opacity: 0.95
  });
  private flameMaterial = new THREE.MeshBasicMaterial({
    color: 0xff3d00,
    transparent: true,
    opacity: 0.95
  });

  private resizeObserver?: ResizeObserver;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  clickPopups = signal<{ id: number; x: number; y: number; text: string }[]>([]);
  clickRipples = signal<{ id: number; x: number; y: number }[]>([]);
  private popupCounter = 0;

  addClickEffect(event: MouseEvent) {
    const power = this.gameService.state().clickBonusPower;
    const text = `+${power} €`;

    const target = event.currentTarget as HTMLElement | null;
    const rect = target ? target.getBoundingClientRect() : { left: event.clientX, top: event.clientY, width: 0, height: 0 };
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const id = ++this.popupCounter;
    this.clickPopups.update(list => [...list.slice(-7), { id, x, y, text }]);
    this.clickRipples.update(list => [...list.slice(-7), { id, x, y }]);

    setTimeout(() => {
      this.clickPopups.update(list => list.filter(p => p.id !== id));
      this.clickRipples.update(list => list.filter(r => r.id !== id));
    }, 700);
  }

  constructor() {
    let lastColor = this.gameService.state().playerCarColor;
    let lastPhase = this.currentPhase;

    effect(() => {
      const color = this.gameService.state().playerCarColor;
      const phase = this.currentPhase;

      if (color !== lastColor || phase !== lastPhase) {
        lastColor = color;
        lastPhase = phase;
        if (this.playerCarMesh && this.scene) {
          this.disposeThreeObject(this.playerCarMesh);
          this.scene.remove(this.playerCarMesh);
          const newPlayerGroup = this.create3DCarModel(color, phase);
          this.playerCarMesh = newPlayerGroup as unknown as THREE.Mesh;
          this.scene.add(this.playerCarMesh);
          this.updateRivalCarsForPhase(phase);
        }
      }
    });
  }

  private disposeThreeObject(obj: THREE.Object3D) {
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) {
          mesh.geometry.dispose();
        }
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(m => m.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      }
    });
  }

  ngOnInit() {
    this.gameService.startGameLoop();
  }

  ngAfterViewInit() {
    this.initThree();
    this.setupResizeObserver();
  }

  ngOnDestroy() {
    this.gameService.stopGameLoop();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.smokeParticles && this.scene) {
      for (const p of this.smokeParticles) {
        this.scene.remove(p.mesh);
      }
      this.smokeParticles = [];
    }
    if (this.smokeGeometry) {
      this.smokeGeometry.dispose();
    }
    if (this.smokeMaterial) {
      this.smokeMaterial.dispose();
    }
    if (this.nitroMaterial) {
      this.nitroMaterial.dispose();
    }
    if (this.flameMaterial) {
      this.flameMaterial.dispose();
    }
    if (this.trackGroup) {
      this.disposeThreeObject(this.trackGroup);
    }
    if (this.playerCarMesh) {
      this.disposeThreeObject(this.playerCarMesh);
    }
    if (this.ghostCars) {
      this.ghostCars.forEach(g => this.disposeThreeObject(g.mesh));
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private trackGroup = new THREE.Group();

  get currentCircuitName(): string {
    switch (this.currentPhase) {
      case 'iniciacion':
        return 'Kartódromo Municipal';
      case 'amateur':
        return 'Circuito Regional';
      case 'profesional':
        return 'Autódromo Nacional';
      case 'elite':
        return 'Gran Premio Internacional';
    }
  }

  get currentPhase(): GamePhase {
    return this.previewPhase() ?? this.gameService.state().phase;
  }

  get actualPhase(): GamePhase {
    return this.gameService.state().phase;
  }

  get isPreviewing(): boolean {
    return this.previewPhase() !== null && this.previewPhase() !== this.actualPhase;
  }

  setPhasePreview(phase: GamePhase) {
    this.previewPhase.set(phase);
    this.updateRivalCarsForPhase(phase);
    this.playerProgress = 0;
  }

  resetPhasePreview() {
    this.previewPhase.set(null);
    this.updateRivalCarsForPhase(this.actualPhase);
    this.playerProgress = 0;
  }

  exportGameSave() {
    this.gameService.exportSaveToFile();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const ok = this.gameService.importSaveFromJson(content);
        if (ok) {
          this.updateRivalCarsForPhase(this.actualPhase);
          this.playerProgress = 0;
        }
      }
    };
    reader.readAsText(file);
    input.value = '';
  }

  nextPhase() {
    const order: GamePhase[] = ['iniciacion', 'amateur', 'profesional', 'elite'];
    const idx = order.indexOf(this.currentPhase);
    const nextIdx = (idx + 1) % order.length;
    this.setPhasePreview(order[nextIdx]);
  }

  prevPhase() {
    const order: GamePhase[] = ['iniciacion', 'amateur', 'profesional', 'elite'];
    const idx = order.indexOf(this.currentPhase);
    const prevIdx = (idx - 1 + order.length) % order.length;
    this.setPhasePreview(order[prevIdx]);
  }

  get upgrades(): UpgradeItem[] {
    const cat = this.activeUpgradeCategory();
    return this.gameService.upgradesList().filter(u => u.category === cat);
  }

  get totalUpgradeLevels(): number {
    return this.gameService.upgradesList().reduce((sum, u) => sum + u.level, 0);
  }

  get currentPhaseName(): string {
    switch (this.currentPhase) {
      case 'iniciacion':
        return 'Iniciación';
      case 'amateur':
        return 'Amateur';
      case 'profesional':
        return 'Profesional';
      case 'elite':
        return 'Élite Mundial';
    }
  }

  get currentPhaseProgressPercentage(): number {
    const levels = this.totalUpgradeLevels;
    if (levels <= 0) return 0;
    if (this.currentPhase === 'iniciacion') {
      return Math.min(100, Math.round((levels / 145) * 100));
    }
    if (this.currentPhase === 'amateur') {
      return Math.min(100, Math.round(((levels - 145) / (250 - 145)) * 100));
    }
    if (this.currentPhase === 'profesional') {
      return Math.min(100, Math.round(((levels - 250) / (360 - 250)) * 100));
    }
    return 100;
  }

  get phaseProgressPercentage(): number {
    const levels = this.totalUpgradeLevels;
    if (levels <= 0) return 0;
    if (levels < 145) {
      return Math.min(33.33, (levels / 145) * 33.33);
    }
    if (levels < 250) {
      return Math.min(66.66, 33.33 + ((levels - 145) / (250 - 145)) * 33.33);
    }
    if (levels < 360) {
      return Math.min(100, 66.66 + ((levels - 250) / (360 - 250)) * 33.34);
    }
    return 100;
  }

  isPhaseUnlocked(phaseRequired: GamePhase): boolean {
    const order: GamePhase[] = ['iniciacion', 'amateur', 'profesional', 'elite'];
    const currentIdx = order.indexOf(this.currentPhase);
    const reqIdx = order.indexOf(phaseRequired);
    return currentIdx >= reqIdx;
  }

  canAfford(u: UpgradeItem): boolean {
    const s = this.gameService.state();
    return s.money >= u.currentCostMoney && s.researchPoints >= u.currentCostResearch;
  }

  getUpgradeImpact(item: UpgradeItem): { current: string; nextDiff: string } {
    let currentDesc = '';
    let nextDesc = '';

    const lvl = item.level;

    switch (item.id) {
      case 'engine_power':
        currentDesc = `${(lvl * 2).toFixed(1)} €/s`;
        nextDesc = `+2.0 €/s`;
        break;
      case 'aero_wings':
        currentDesc = `${(lvl * 3.5).toFixed(1)} €/s`;
        nextDesc = `+3.5 €/s`;
        break;
      case 'brakes_cooling':
        currentDesc = `${(lvl * 4).toFixed(1)} €/s`;
        nextDesc = `+4.0 €/s`;
        break;
      case 'pit_mechanics':
        currentDesc = `${(lvl * 2.5).toFixed(1)} €/s`;
        nextDesc = `+2.5 €/s`;
        break;
      case 'box_tools':
        currentDesc = `${(lvl * 4.5).toFixed(1)} €/s`;
        nextDesc = `+4.5 €/s`;
        break;
      case 'driver_training':
        currentDesc = `${(lvl * 2).toFixed(1)} €/s | +${lvl * 1} €/clic`;
        nextDesc = `+2 €/s | +1 €/clic`;
        break;
      case 'tires_compound':
        currentDesc = `${(lvl * 8).toFixed(1)} €/s`;
        nextDesc = `+8.0 €/s`;
        break;
      case 'telemetry_box':
        currentDesc = `+${(lvl * 2.5).toFixed(1)} €/clic`;
        nextDesc = `+2.5 €/clic`;
        break;
      case 'gearbox_quick':
        currentDesc = `${(lvl * 18).toFixed(1)} €/s`;
        nextDesc = `+18.0 €/s`;
        break;
      case 'local_sponsors':
        currentDesc = `${(lvl * 12).toFixed(1)} €/s`;
        nextDesc = `+12.0 €/s`;
        break;
      case 'motorhome_base':
        currentDesc = `${(lvl * 25).toFixed(1)} €/s | ${(lvl * 0.5).toFixed(1)} I+D/s`;
        nextDesc = `+25 €/s | +0.5 I+D/s`;
        break;
      case 'ers_hybrid':
        currentDesc = `${(lvl * 55).toFixed(1)} €/s | +${lvl * 6} €/clic`;
        nextDesc = `+55 €/s | +6 €/clic`;
        break;
      case 'carbon_brakes_pro':
        currentDesc = `${(lvl * 90).toFixed(1)} €/s`;
        nextDesc = `+90.0 €/s`;
        break;
      case 'engineers_hire':
        currentDesc = `${(lvl * 30).toFixed(1)} €/s | ${(lvl * 1.5).toFixed(1)} I+D/s`;
        nextDesc = `+30 €/s | +1.5 I+D/s`;
        break;
      case 'wind_tunnel':
        currentDesc = `${(lvl * 4).toFixed(1)} I+D/s`;
        nextDesc = `+4.0 I+D/s`;
        break;
      case 'global_brands':
        currentDesc = `${(lvl * 180).toFixed(1)} €/s`;
        nextDesc = `+180.0 €/s`;
        break;
      case 'carbon_chassis':
        currentDesc = `${(lvl * 400).toFixed(1)} €/s | ${(lvl * 6).toFixed(1)} I+D/s`;
        nextDesc = `+400 €/s | +6 I+D/s`;
        break;
      case 'ai_race_strategy':
        currentDesc = `${(lvl * 850).toFixed(1)} €/s | ${(lvl * 16).toFixed(1)} I+D/s`;
        nextDesc = `+850 €/s | +16 I+D/s`;
        break;
      case 'f1_factory':
        currentDesc = `${(lvl * 1800).toFixed(1)} €/s | ${(lvl * 35).toFixed(1)} I+D/s`;
        nextDesc = `+1.8k €/s | +35 I+D/s`;
        break;
      case 'legend_wind_tunnel':
        currentDesc = `${(lvl * 3500).toFixed(1)} €/s | +${lvl * 25} €/clic`;
        nextDesc = `+3.5k €/s | +25 €/clic`;
        break;
      default:
        currentDesc = `0`;
        nextDesc = `+1`;
    }

    return { current: currentDesc, nextDiff: nextDesc };
  }

  getUpgradeIcon(id: string): string {
    switch (id) {
      case 'engine_power':
        return 'engine';
      case 'aero_wings':
        return 'wing';
      case 'brakes_cooling':
      case 'carbon_brakes_pro':
        return 'disc';
      case 'pit_mechanics':
      case 'box_tools':
        return 'tool';
      case 'driver_training':
        return 'user';
      case 'tires_compound':
        return 'tire';
      case 'telemetry_box':
        return 'cpu';
      case 'gearbox_quick':
        return 'settings';
      case 'local_sponsors':
      case 'global_brands':
        return 'dollar';
      case 'motorhome_base':
      case 'f1_factory':
        return 'building';
      case 'ers_hybrid':
        return 'zap';
      case 'engineers_hire':
      case 'ai_race_strategy':
        return 'activity';
      case 'wind_tunnel':
      case 'legend_wind_tunnel':
        return 'wind';
      case 'carbon_chassis':
        return 'shield';
      default:
        return 'zap';
    }
  }

  formatNumber(val: number): string {
    if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + 'M';
    if (val >= 1_000) return (val / 1_000).toFixed(1) + 'k';
    return Math.floor(val).toLocaleString('es-ES');
  }

  formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  }

  private trackCurve!: THREE.CatmullRomCurve3;

  private initThree() {
    const container = this.canvasContainerRef.nativeElement;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 300;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x7dd3fc);
    this.scene.fog = new THREE.FogExp2(0x93c5fd, 0.015);

    const aspect = width / height;
    this.camera = new THREE.PerspectiveCamera(46, aspect, 0.1, 1000);
    this.camera.position.set(0, 27, 28);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
    });
    this.renderer.domElement.addEventListener('webglcontextrestored', () => {
      this.initThree();
    });
    container.appendChild(this.renderer.domElement);

    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x166534, 0.85);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.35);
    dirLight.position.set(22, 28, 16);
    this.scene.add(dirLight);

    this.scene.add(this.trackGroup);
    this.buildCircuitForPhase(this.gameService.state().phase);
    this.createCars();
    this.ngZone.runOutsideAngular(() => {
      this.animate();
    });
  }

  private buildCircuitForPhase(phase: GamePhase) {
    if (this.camera) {
      if (phase === 'iniciacion') {
        this.camera.position.set(0, 25.0, 25.5);
        this.camera.lookAt(0, 0, 0);
      } else if (phase === 'amateur') {
        this.camera.position.set(0, 23.5, 24.0);
        this.camera.lookAt(0, 0, 0);
      } else if (phase === 'profesional') {
        this.camera.position.set(0, 24.2, 24.6);
        this.camera.lookAt(0, 0, 0);
      } else {
        this.camera.position.set(0, 26.2, 26.6);
        this.camera.lookAt(0, 0, 0);
      }
    }

    while (this.trackGroup.children.length > 0) {
      const obj = this.trackGroup.children[0];
      this.disposeThreeObject(obj);
      this.trackGroup.remove(obj);
    }

    let circuitPoints: THREE.Vector3[] = [];
    let asphaltColor = 0x1e2430;
    let kerbColor = 0xf97316;
    let tubeRadius = 1.25;

    if (phase === 'iniciacion') {
      circuitPoints = [
        new THREE.Vector3(-9, 0, 4),
        new THREE.Vector3(-5, 0, 6.5),
        new THREE.Vector3(0, 0, 4.5),
        new THREE.Vector3(3.5, 0, 6.5),
        new THREE.Vector3(8.5, 0, 3.5),
        new THREE.Vector3(7.5, 0, -1),
        new THREE.Vector3(3, 0, 0),
        new THREE.Vector3(2, 0, -4.5),
        new THREE.Vector3(-3.5, 0, -3),
        new THREE.Vector3(-8.5, 0, -6),
        new THREE.Vector3(-10, 0, -1),
      ];
      asphaltColor = 0x334155;
      kerbColor = 0xeab308;
      tubeRadius = 1.35;
    } else if (phase === 'amateur') {
      circuitPoints = [
        new THREE.Vector3(-10, 0, 2),
        new THREE.Vector3(-7, 0, 7.5),
        new THREE.Vector3(2, 0, 7),
        new THREE.Vector3(8, 0, 5),
        new THREE.Vector3(10, 0, -1),
        new THREE.Vector3(6.5, 0, -3),
        new THREE.Vector3(8, 0, -6.5),
        new THREE.Vector3(1, 0, -7.5),
        new THREE.Vector3(-3, 0, -4),
        new THREE.Vector3(-5.5, 0, -1.5),
        new THREE.Vector3(-9, 0, -2.5),
      ];
      asphaltColor = 0x2d3748;
      kerbColor = 0x38bdf8;
      tubeRadius = 1.25;
    } else if (phase === 'profesional') {
      circuitPoints = [
        new THREE.Vector3(-11, 0, 2),
        new THREE.Vector3(-8, 0, 7),
        new THREE.Vector3(-2, 0, 8),
        new THREE.Vector3(4, 0, 4.5),
        new THREE.Vector3(9.5, 0, 6.5),
        new THREE.Vector3(11.5, 0, 1),
        new THREE.Vector3(6, 0, -1.5),
        new THREE.Vector3(9, 0, -6),
        new THREE.Vector3(2, 0, -7.5),
        new THREE.Vector3(-4, 0, -5.5),
        new THREE.Vector3(-7.5, 0, -8),
        new THREE.Vector3(-11.5, 0, -3),
      ];
      asphaltColor = 0x272e3f;
      kerbColor = 0xf97316;
      tubeRadius = 1.35;
    } else {
      circuitPoints = [
        new THREE.Vector3(-12, 0, 2),
        new THREE.Vector3(-9, 0, 7.5),
        new THREE.Vector3(-5, 0, 6),
        new THREE.Vector3(1, 0, 8.5),
        new THREE.Vector3(8.5, 0, 7.5),
        new THREE.Vector3(12, 0, 3.5),
        new THREE.Vector3(9, 0, -0.5),
        new THREE.Vector3(11, 0, -5),
        new THREE.Vector3(5, 0, -8),
        new THREE.Vector3(-1, 0, -5),
        new THREE.Vector3(-5, 0, -7.5),
        new THREE.Vector3(-9, 0, -7),
        new THREE.Vector3(-12.5, 0, -2),
      ];
      asphaltColor = 0x222a38;
      kerbColor = 0xef4444;
      tubeRadius = 1.45;
    }

    this.currentTubeRadius = tubeRadius;
    this.trackCurve = new THREE.CatmullRomCurve3(circuitPoints, true, 'catmullrom', 0.25);

    const groundGeom = new THREE.PlaneGeometry(500, 500);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.88,
      metalness: 0.05
    });
    const groundMesh = new THREE.Mesh(groundGeom, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -0.12;
    this.trackGroup.add(groundMesh);

    const gravelGeo = new THREE.TubeGeometry(this.trackCurve, 240, tubeRadius + 0.65, 8, true);
    const gravelMat = new THREE.MeshStandardMaterial({
      color: 0xd4a373,
      roughness: 0.95,
      metalness: 0.05
    });
    const gravelMesh = new THREE.Mesh(gravelGeo, gravelMat);
    gravelMesh.scale.set(1, 0.04, 1);
    gravelMesh.position.y = -0.05;
    this.trackGroup.add(gravelMesh);

    const tubeGeo = new THREE.TubeGeometry(this.trackCurve, 240, tubeRadius, 10, true);
    const asphaltMat = new THREE.MeshStandardMaterial({
      color: asphaltColor,
      roughness: 0.72,
      metalness: 0.18
    });
    const trackMesh = new THREE.Mesh(tubeGeo, asphaltMat);
    trackMesh.scale.set(1, 0.08, 1);
    this.trackGroup.add(trackMesh);

    const skidMat = new THREE.MeshBasicMaterial({
      color: 0x090d14,
      transparent: true,
      opacity: 0.45
    });
    const skidGeom = new THREE.BoxGeometry(0.38, 0.015, 0.12);
    const skidSamples = 160;
    for (let i = 0; i < skidSamples; i++) {
      const t = i / skidSamples;
      const pt = this.trackCurve.getPointAt(t);
      const tang = this.trackCurve.getTangentAt(t).normalize();
      const nextTang = this.trackCurve.getTangentAt((t + 0.01) % 1).normalize();
      const norm = new THREE.Vector3(-tang.z, 0, tang.x).normalize();

      const a0 = Math.atan2(-tang.z, tang.x);
      const a1 = Math.atan2(-nextTang.z, nextTang.x);
      let diff = a1 - a0;
      if (diff > Math.PI) diff -= Math.PI * 2;
      if (diff < -Math.PI) diff += Math.PI * 2;

      if (Math.abs(diff) > 0.035) {
        const sideSign = diff > 0 ? 1 : -1;
        const offset = -sideSign * (tubeRadius * 0.42);

        const skid1 = new THREE.Mesh(skidGeom, skidMat);
        skid1.position.set(pt.x + norm.x * (offset - 0.12), pt.y + 0.018, pt.z + norm.z * (offset - 0.12));
        skid1.rotation.y = Math.atan2(-tang.z, tang.x);
        this.trackGroup.add(skid1);

        const skid2 = new THREE.Mesh(skidGeom, skidMat);
        skid2.position.set(pt.x + norm.x * (offset + 0.12), pt.y + 0.018, pt.z + norm.z * (offset + 0.12));
        skid2.rotation.y = Math.atan2(-tang.z, tang.x);
        this.trackGroup.add(skid2);
      }
    }

    const centerSamples = 120;
    const dashGeom = new THREE.BoxGeometry(0.35, 0.02, 0.08);
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let i = 0; i < centerSamples; i += 2) {
      const t = i / centerSamples;
      const pt = this.trackCurve.getPointAt(t);
      const tang = this.trackCurve.getTangentAt(t).normalize();
      const dash = new THREE.Mesh(dashGeom, dashMat);
      dash.position.set(pt.x, pt.y + 0.02, pt.z);
      dash.rotation.y = Math.atan2(-tang.z, tang.x);
      this.trackGroup.add(dash);
    }

    const kerbWidth = 0.28;
    const kerbHeight = 0.035;
    const kerbSamples = 240;
    const redKerbMat = new THREE.MeshStandardMaterial({
      color: kerbColor,
      roughness: 0.35,
      side: THREE.DoubleSide
    });
    const whiteKerbMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.35,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < kerbSamples; i++) {
      const t0 = i / kerbSamples;
      const t1 = (i + 1) / kerbSamples;

      const p0 = this.trackCurve.getPointAt(t0);
      const tang0 = this.trackCurve.getTangentAt(t0).normalize();
      const n0 = new THREE.Vector3(-tang0.z, 0, tang0.x).normalize();

      const p1 = this.trackCurve.getPointAt(t1);
      const tang1 = this.trackCurve.getTangentAt(t1).normalize();
      const n1 = new THREE.Vector3(-tang1.z, 0, tang1.x).normalize();

      const mat = (Math.floor(i / 2) % 2 === 0) ? redKerbMat : whiteKerbMat;

      const outGeom = new THREE.BufferGeometry();
      const outVerts = new Float32Array([
        p0.x + n0.x * tubeRadius, p0.y + kerbHeight, p0.z + n0.z * tubeRadius,
        p0.x + n0.x * (tubeRadius + kerbWidth), p0.y + kerbHeight, p0.z + n0.z * (tubeRadius + kerbWidth),
        p1.x + n1.x * (tubeRadius + kerbWidth), p1.y + kerbHeight, p1.z + n1.z * (tubeRadius + kerbWidth),

        p0.x + n0.x * tubeRadius, p0.y + kerbHeight, p0.z + n0.z * tubeRadius,
        p1.x + n1.x * (tubeRadius + kerbWidth), p1.y + kerbHeight, p1.z + n1.z * (tubeRadius + kerbWidth),
        p1.x + n1.x * tubeRadius, p1.y + kerbHeight, p1.z + n1.z * tubeRadius,
      ]);
      outGeom.setAttribute('position', new THREE.BufferAttribute(outVerts, 3));
      outGeom.computeVertexNormals();
      const meshOut = new THREE.Mesh(outGeom, mat);
      this.trackGroup.add(meshOut);

      const inGeom = new THREE.BufferGeometry();
      const inVerts = new Float32Array([
        p0.x - n0.x * tubeRadius, p0.y + kerbHeight, p0.z - n0.z * tubeRadius,
        p1.x - n1.x * (tubeRadius + kerbWidth), p1.y + kerbHeight, p1.z - n1.z * (tubeRadius + kerbWidth),
        p0.x - n0.x * (tubeRadius + kerbWidth), p0.y + kerbHeight, p0.z - n0.z * (tubeRadius + kerbWidth),

        p0.x - n0.x * tubeRadius, p0.y + kerbHeight, p0.z - n0.z * tubeRadius,
        p1.x - n1.x * tubeRadius, p1.y + kerbHeight, p1.z - n1.z * tubeRadius,
        p1.x - n1.x * (tubeRadius + kerbWidth), p1.y + kerbHeight, p1.z - n1.z * (tubeRadius + kerbWidth),
      ]);
      inGeom.setAttribute('position', new THREE.BufferAttribute(inVerts, 3));
      inGeom.computeVertexNormals();
      const meshIn = new THREE.Mesh(inGeom, mat);
      this.trackGroup.add(meshIn);
    }

    const finishGeom = new THREE.BoxGeometry(0.45, 0.06, tubeRadius * 2 + 0.3);
    const finishMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const finishLine = new THREE.Mesh(finishGeom, finishMat);
    const startPoint = this.getTrackPoint(0);
    const startTang = this.trackCurve.getTangentAt(0).normalize();
    finishLine.position.set(startPoint.x, startPoint.y + 0.03, startPoint.z);
    finishLine.rotation.y = Math.atan2(-startTang.z, startTang.x) + Math.PI / 2;
    this.trackGroup.add(finishLine);

    this.addCircuitScenery(startPoint, startTang, phase);
  }

  private addCircuitScenery(startPoint: THREE.Vector3, startTang: THREE.Vector3, phase: GamePhase) {
    if (!this.trackCurve) return;

    const normal = new THREE.Vector3(-startTang.z, 0, startTang.x).normalize();

    const distanceToTrack = (x: number, z: number): number => {
      let minDst = Infinity;
      const samples = 200;
      for (let i = 0; i < samples; i++) {
        const pt = this.trackCurve!.getPointAt(i / samples);
        const dx = pt.x - x;
        const dz = pt.z - z;
        const d = Math.sqrt(dx * dx + dz * dz);
        if (d < minDst) minDst = d;
      }
      return minDst;
    };

    const isBoxClearOfTrack = (cx: number, cz: number, halfW: number, halfD: number, requiredClearance = 2.0): boolean => {
      const testPoints = [
        [cx, cz],
        [cx - halfW, cz - halfD],
        [cx + halfW, cz - halfD],
        [cx - halfW, cz + halfD],
        [cx + halfW, cz + halfD],
      ];
      return testPoints.every(([px, pz]) => distanceToTrack(px, pz) > (this.currentTubeRadius + requiredClearance));
    };

    const pitBuildingMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.5 });
    const pitRoofMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.8 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 });

    const pitBuilding = new THREE.Group();
    const mainBox = new THREE.Mesh(new THREE.BoxGeometry(6, 1.4, 2.2), pitBuildingMat);
    mainBox.position.y = 0.7;
    const pitRoof = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.2, 2.6), pitRoofMat);
    pitRoof.position.y = 1.45;
    const windows = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.4, 0.1), glassMat);
    windows.position.set(0, 0.9, 1.12);
    pitBuilding.add(mainBox, pitRoof, windows);

    const sceneryObstacles: { x: number; z: number; radius: number }[] = [];

    const pitDistance = phase === 'elite' ? 6.2 : 5.4;
    pitBuilding.position.set(
      startPoint.x + normal.x * pitDistance,
      startPoint.y,
      startPoint.z + normal.z * pitDistance
    );
    pitBuilding.rotation.y = Math.atan2(-startTang.z, startTang.x);
    this.trackGroup.add(pitBuilding);
    sceneryObstacles.push({ x: pitBuilding.position.x, z: pitBuilding.position.z, radius: 4.8 });

    const towerBuilding = new THREE.Group();
    const tBase = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.6, 2.2), pitBuildingMat);
    tBase.position.y = 1.3;
    const tGlass = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.0, 2.4), glassMat);
    tGlass.position.y = 2.8;
    const tRoof = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.2, 2.6), pitRoofMat);
    tRoof.position.y = 3.4;
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.5, 6), accentMat);
    antenna.position.y = 4.2;
    towerBuilding.add(tBase, tGlass, tRoof, antenna);

    towerBuilding.position.set(
      startPoint.x + normal.x * (pitDistance + 1.2) - startTang.x * 4.5,
      startPoint.y,
      startPoint.z + normal.z * (pitDistance + 1.2) - startTang.z * 4.5
    );
    towerBuilding.rotation.y = Math.atan2(-startTang.z, startTang.x);
    this.trackGroup.add(towerBuilding);
    sceneryObstacles.push({ x: towerBuilding.position.x, z: towerBuilding.position.z, radius: 3.5 });

    const tentMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 });
    const tentRoofMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
    const tent = new THREE.Group();
    const tentBase = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.1, 2.2), tentMat);
    tentBase.position.y = 0.55;
    const tentRoof = new THREE.Mesh(new THREE.ConeGeometry(2.4, 0.9, 4), tentRoofMat);
    tentRoof.position.y = 1.55;
    tentRoof.rotation.y = Math.PI / 4;
    tent.add(tentBase, tentRoof);
    tent.position.set(
      startPoint.x + normal.x * (pitDistance + 0.8) + startTang.x * 4.8,
      startPoint.y,
      startPoint.z + normal.z * (pitDistance + 0.8) + startTang.z * 4.8
    );
    tent.rotation.y = Math.atan2(-startTang.z, startTang.x);
    this.trackGroup.add(tent);
    sceneryObstacles.push({ x: tent.position.x, z: tent.position.z, radius: 3.8 });

    const grandstandMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    const seatMatRed = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });
    const seatMatYellow = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 });
    const seatMatBlue = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.5 });

    const createGrandstand = (gx: number, gz: number, rotY: number, size = 1) => {
      const stand = new THREE.Group();
      const standWidth = 7.0 * size;
      const base = new THREE.Mesh(new THREE.BoxGeometry(standWidth, 1.6, 2.5), grandstandMat);
      base.position.y = 0.8;
      const roof = new THREE.Mesh(new THREE.BoxGeometry(standWidth + 0.4, 0.15, 3.2), grandstandMat);
      roof.position.set(0, 2.2, -0.2);

      const seatColors = [seatMatRed, seatMatYellow, seatMatBlue];
      for (let row = 0; row < 3; row++) {
        const rowSeats = new THREE.Mesh(new THREE.BoxGeometry(standWidth - 0.4, 0.22, 0.45), seatColors[row % seatColors.length]);
        rowSeats.position.set(0, 0.4 + row * 0.35, 0.6 - row * 0.5);
        stand.add(rowSeats);
      }
      stand.add(base, roof);
      stand.position.set(gx, 0, gz);
      stand.rotation.y = rotY;
      return stand;
    };

    const tryAddGrandstand = (t: number, lateralDistance: number, size = 1): boolean => {
      const pt = this.trackCurve!.getPointAt(t % 1);
      const tang = this.trackCurve!.getTangentAt(t % 1).normalize();
      const norm = new THREE.Vector3(-tang.z, 0, tang.x).normalize();

      const gx = pt.x + norm.x * lateralDistance;
      const gz = pt.z + norm.z * lateralDistance;
      const rotY = Math.atan2(-tang.z, tang.x) + (lateralDistance > 0 ? 0 : Math.PI);

      if (!isBoxClearOfTrack(gx, gz, (3.5 * size) + 0.5, 1.8, 1.2)) return false;
      if (sceneryObstacles.some(obs => Math.hypot(gx - obs.x, gz - obs.z) < 6.0)) return false;

      this.trackGroup.add(createGrandstand(gx, gz, rotY, size));
      sceneryObstacles.push({ x: gx, z: gz, radius: 4.8 * size });
      return true;
    };

    if (phase === 'iniciacion') {
      tryAddGrandstand(0.78, 4.8, 0.85);
    } else if (phase === 'amateur') {
      tryAddGrandstand(0.35, 4.8, 1.0);
      tryAddGrandstand(0.72, -4.8, 0.9);
    } else if (phase === 'profesional') {
      tryAddGrandstand(0.22, 5.2, 1.1);
      tryAddGrandstand(0.48, -5.2, 1.0);
      tryAddGrandstand(0.75, 5.0, 1.0);
      tryAddGrandstand(0.92, -5.0, 0.95);
    } else {
      tryAddGrandstand(0.18, 5.6, 1.2);
      tryAddGrandstand(0.32, -5.4, 1.1);
      tryAddGrandstand(0.48, 5.5, 1.15);
      tryAddGrandstand(0.68, -5.4, 1.1);
      tryAddGrandstand(0.84, 5.6, 1.2);
      tryAddGrandstand(0.94, -5.5, 1.0);
    }

    const poleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    const candidateLightPositions: [number, number, number][] = [
      [14, 0, 9],
      [-14, 0, 9],
      [15, 0, -2],
      [-14, 0, -8],
      [0, 0, -11],
      [8, 0, -11],
      [-8, 0, 11],
      [15, 0, 5],
      [-15, 0, 3]
    ];

    candidateLightPositions.forEach(([x, y, z]) => {
      if (distanceToTrack(x, z) < 2.5) return;
      if (sceneryObstacles.some(obs => Math.hypot(x - obs.x, z - obs.z) < obs.radius)) return;

      const tower = new THREE.Group();
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 4.5, 8), poleMat);
      pole.position.y = 2.25;
      const lampHead = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.25, 0.4), poleMat);
      lampHead.position.y = 4.4;
      const bulb = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 0.3), lampMat);
      bulb.position.y = 4.3;
      tower.add(pole, lampHead, bulb);
      tower.position.set(x, y, z);
      this.trackGroup.add(tower);
      sceneryObstacles.push({ x, z, radius: 1.5 });
    });

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3825 });
    const leavesDarkMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.8 });
    const leavesLightMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.8 });
    const pineMat = new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.8 });

    const candidateTrees: [number, number, number, number][] = [
      [0, 0, 1, 0],
      [3.5, 0, 2, 1],
      [-1.5, 0, -1.5, 0],
      [4.5, 0, -2, 1],
      [-3.5, 0, 1.5, 0],
      [0.5, 0, -3.5, 1],
      [-13.5, 0, 1, 0],
      [-14.5, 0, -5, 1],
      [14, 0, 3, 0],
      [14.5, 0, -5, 1],
      [-8, 0, 9.5, 0],
      [-5, 0, 10, 1],
      [5, 0, 10, 0],
      [8.5, 0, 9.5, 1],
      [-11, 0, -9, 0],
      [-4, 0, -10.5, 1],
      [3, 0, -10.5, 0],
      [11, 0, -8.5, 1],
      [-15, 0, 6, 0],
      [15.5, 0, -1, 1],
    ];

    candidateTrees.forEach(([tx, ty, tz, type]) => {
      if (distanceToTrack(tx, tz) < 2.5) return;
      if (sceneryObstacles.some(obs => Math.hypot(tx - obs.x, tz - obs.z) < obs.radius)) return;

      const tree = new THREE.Group();
      if (type === 1) {
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 1.0, 6), trunkMat);
        trunk.position.y = 0.5;
        const foliage1 = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.8, 6), pineMat);
        foliage1.position.y = 1.6;
        const foliage2 = new THREE.Mesh(new THREE.ConeGeometry(0.65, 1.4, 6), pineMat);
        foliage2.position.y = 2.4;
        tree.add(trunk, foliage1, foliage2);
      } else {
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.2, 6), trunkMat);
        trunk.position.y = 0.6;
        const foliage = new THREE.Mesh(new THREE.ConeGeometry(0.95, 2.1, 7), (type === 0 ? leavesLightMat : leavesDarkMat));
        foliage.position.y = 1.95;
        tree.add(trunk, foliage);
      }

      tree.position.set(tx, ty, tz);
      this.trackGroup.add(tree);
    });

    const hillMat = new THREE.MeshStandardMaterial({
      color: 0x166534,
      roughness: 0.95,
      flatShading: true
    });
    const hillMatFar = new THREE.MeshStandardMaterial({
      color: 0x14532d,
      roughness: 0.95,
      flatShading: true
    });

    const hillsData: [number, number, number, number, number][] = [
      [-45, -2, -55, 32, 14],
      [5, -2, -65, 38, 16],
      [50, -2, -50, 34, 15],
      [-60, -2, 10, 36, 15],
      [65, -2, 15, 38, 16],
      [-40, -2, 55, 30, 13],
      [20, -2, 60, 35, 14],
    ];

    hillsData.forEach(([hx, hy, hz, radius, height], idx) => {
      const hillGeo = new THREE.ConeGeometry(radius, height, 7);
      const hillMesh = new THREE.Mesh(hillGeo, idx % 2 === 0 ? hillMat : hillMatFar);
      hillMesh.position.set(hx, hy + height / 2, hz);
      this.trackGroup.add(hillMesh);
    });
  }

  private getTrackPoint(t: number): THREE.Vector3 {
    if (!this.trackCurve) return new THREE.Vector3(0, 0, 0);
    return this.trackCurve.getPointAt(t % 1);
  }

  private create3DCarModel(colorHex: string, phase: GamePhase): THREE.Group {
    const carGroup = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.2,
      metalness: 0.75
    });
    const blackMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.6,
      metalness: 0.3
    });
    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x0f141c,
      roughness: 0.35,
      metalness: 0.85
    });
    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.9,
      metalness: 0.1
    });
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      roughness: 0.2,
      metalness: 0.95
    });
    const helmetMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.15,
      metalness: 0.85
    });
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.9
    });
    const mirrorMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.95
    });
    const tailLightMat = new THREE.MeshBasicMaterial({
      color: 0xef4444
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.2
    });
    const neonCyanMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4
    });

    const createAeroWheel = (radius: number, width: number, hasTurbofan: boolean = false) => {
      const wGroup = new THREE.Group();
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, width, 16), tireMat);
      wGroup.add(tire);

      if (hasTurbofan) {
        const discL = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.88, radius * 0.88, width + 0.02, 16), carbonMat);
        const rimRing = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.72, 0.02, 6, 16), goldMat);
        wGroup.add(discL, rimRing);
      } else {
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.58, radius * 0.58, width + 0.01, 12), rimMat);
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.25, radius * 0.25, width + 0.02, 8), carbonMat);
        wGroup.add(rim, hub);
      }
      wGroup.rotation.x = Math.PI / 2;
      return wGroup;
    };

    if (phase === 'iniciacion') {
      const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 0.75), bodyMat);
      chassis.position.y = 0.18;

      const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.15, 1.05), blackMat);
      frontBumper.position.set(0.85, 0.14, 0);
      const leftPod = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.18, 0.2), bodyMat);
      leftPod.position.set(0.05, 0.18, 0.44);
      const rightPod = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.18, 0.2), bodyMat);
      rightPod.position.set(0.05, 0.18, -0.44);

      const steering = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.35, 6), blackMat);
      steering.rotation.z = -Math.PI / 4;
      steering.position.set(0.28, 0.35, 0);
      const wheelRing = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.025, 6, 12), blackMat);
      wheelRing.position.set(0.4, 0.45, 0);
      wheelRing.rotation.y = Math.PI / 2;

      const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), helmetMat);
      helmet.position.set(-0.12, 0.48, 0);
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, 0.2), visorMat);
      visor.position.set(-0.02, 0.48, 0);

      const engine = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.3), carbonMat);
      engine.position.set(-0.6, 0.22, 0.18);
      const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.3, 8), rimMat);
      exhaust.rotation.z = Math.PI / 2;
      exhaust.position.set(-0.85, 0.22, 0.22);

      carGroup.add(chassis, frontBumper, leftPod, rightPod, steering, wheelRing, helmet, visor, engine, exhaust);

      [[0.6, 0.58], [0.6, -0.58], [-0.55, 0.58], [-0.55, -0.58]].forEach(([x, z]) => {
        const w = createAeroWheel(0.2, 0.18);
        w.position.set(x, 0.2, z);
        carGroup.add(w);
      });

    } else if (phase === 'amateur') {
      const slenderBody = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 1.8, 12), bodyMat);
      slenderBody.rotation.z = Math.PI / 2;
      slenderBody.position.set(0.1, 0.25, 0);

      const vintageNose = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 8), bodyMat);
      vintageNose.scale.set(1.5, 1, 1);
      vintageNose.position.set(1.15, 0.25, 0);

      const suspensionFL = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6), rimMat);
      suspensionFL.rotation.x = Math.PI / 2;
      suspensionFL.position.set(0.8, 0.24, 0.3);
      const suspensionFR = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6), rimMat);
      suspensionFR.rotation.x = Math.PI / 2;
      suspensionFR.position.set(0.8, 0.24, -0.3);

      const suspensionRL = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6), rimMat);
      suspensionRL.rotation.x = Math.PI / 2;
      suspensionRL.position.set(-0.7, 0.24, 0.3);
      const suspensionRR = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6), rimMat);
      suspensionRR.rotation.x = Math.PI / 2;
      suspensionRR.position.set(-0.7, 0.24, -0.3);

      const windscreen = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.36), visorMat);
      windscreen.position.set(0.3, 0.42, 0);
      windscreen.rotation.z = -Math.PI / 6;

      const rollHoop = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.03, 6, 12, Math.PI), rimMat);
      rollHoop.position.set(-0.2, 0.48, 0);

      const exposedExhaust1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.65, 8), rimMat);
      exposedExhaust1.rotation.z = Math.PI / 2;
      exposedExhaust1.position.set(-0.95, 0.3, 0.14);
      const exposedExhaust2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.65, 8), rimMat);
      exposedExhaust2.rotation.z = Math.PI / 2;
      exposedExhaust2.position.set(-0.95, 0.3, -0.14);

      const vintageWing = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.04, 0.95), blackMat);
      vintageWing.position.set(-1.05, 0.52, 0);
      const wingStrutL = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.32, 6), rimMat);
      wingStrutL.position.set(-1.0, 0.36, 0.2);
      const wingStrutR = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.32, 6), rimMat);
      wingStrutR.position.set(-1.0, 0.36, -0.2);

      const fNoseWingL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.32), blackMat);
      fNoseWingL.position.set(1.1, 0.2, 0.36);
      const fNoseWingR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.32), blackMat);
      fNoseWingR.position.set(1.1, 0.2, -0.36);

      const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 12), helmetMat);
      helmet.position.set(0.0, 0.46, 0);
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.18), visorMat);
      visor.position.set(0.1, 0.46, 0);

      carGroup.add(
        slenderBody, vintageNose,
        suspensionFL, suspensionFR, suspensionRL, suspensionRR,
        windscreen, rollHoop,
        exposedExhaust1, exposedExhaust2,
        vintageWing, wingStrutL, wingStrutR,
        fNoseWingL, fNoseWingR,
        helmet, visor
      );

      [[0.8, 0.54], [0.8, -0.54], [-0.7, 0.54], [-0.7, -0.54]].forEach(([x, z]) => {
        const w = createAeroWheel(0.24, 0.2);
        w.position.set(x, 0.24, z);
        carGroup.add(w);
      });

    } else if (phase === 'profesional') {
      const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.32, 0.68), bodyMat);
      chassis.position.set(0, 0.26, 0);

      const noseCone = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.25, 12), bodyMat);
      noseCone.rotation.z = -Math.PI / 2;
      noseCone.position.set(1.65, 0.22, 0);

      const podL = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.32, 0.34), bodyMat);
      podL.position.set(-0.05, 0.26, 0.5);
      const podR = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.32, 0.34), bodyMat);
      podR.position.set(-0.05, 0.26, -0.5);

      const podVentL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.24, 0.26), blackMat);
      podVentL.position.set(0.55, 0.26, 0.5);
      const podVentR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.24, 0.26), blackMat);
      podVentR.position.set(0.55, 0.26, -0.5);

      const tallAirbox = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.44, 0.24), bodyMat);
      tallAirbox.position.set(-0.25, 0.62, 0);
      const airboxScoop = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.16), blackMat);
      airboxScoop.position.set(0.12, 0.68, 0);

      const sharkFin = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.26, 0.03), carbonMat);
      sharkFin.position.set(-0.85, 0.54, 0);

      const fWing = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.07, 1.55), carbonMat);
      fWing.position.set(1.95, 0.18, 0);
      const fEndL = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.18, 0.03), carbonMat);
      fEndL.position.set(1.95, 0.19, 0.78);
      const fEndR = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.18, 0.03), carbonMat);
      fEndR.position.set(1.95, 0.19, -0.78);

      const rWing1 = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.06, 1.3), carbonMat);
      rWing1.position.set(-1.3, 0.72, 0);
      const rWing2 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 1.3), carbonMat);
      rWing2.position.set(-1.38, 0.86, 0);
      const rEndL = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.38, 0.04), carbonMat);
      rEndL.position.set(-1.34, 0.77, 0.66);
      const rEndR = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.38, 0.04), carbonMat);
      rEndR.position.set(-1.34, 0.77, -0.66);

      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.04, 6, 14), carbonMat);
      halo.rotation.x = Math.PI / 2;
      halo.position.set(0.15, 0.56, 0);

      const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), helmetMat);
      helmet.position.set(0.08, 0.48, 0);
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.18), visorMat);
      visor.position.set(0.18, 0.48, 0);

      const mirrorL = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.05, 0.1), carbonMat);
      mirrorL.position.set(0.38, 0.44, 0.42);
      const mirrorR = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.05, 0.1), carbonMat);
      mirrorR.position.set(0.38, 0.44, -0.42);

      const rainLight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.12), tailLightMat);
      rainLight.position.set(-1.42, 0.26, 0);

      carGroup.add(
        chassis, noseCone, podL, podR, podVentL, podVentR,
        tallAirbox, airboxScoop, sharkFin,
        fWing, fEndL, fEndR, rWing1, rWing2, rEndL, rEndR,
        halo, helmet, visor, mirrorL, mirrorR, rainLight
      );

      [[1.1, 0.68], [1.1, -0.68], [-1.0, 0.68], [-1.0, -0.68]].forEach(([x, z]) => {
        const w = createAeroWheel(0.29, 0.26);
        w.position.set(x, 0.29, z);
        carGroup.add(w);
      });

    } else {
      const aeroFloor = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.06, 1.35), carbonMat);
      aeroFloor.position.set(0, 0.11, 0);

      const mainChassis = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.28, 0.62), bodyMat);
      mainChassis.position.set(0, 0.26, 0);

      const sharpNose = new THREE.Mesh(new THREE.ConeGeometry(0.24, 1.5, 16), bodyMat);
      sharpNose.rotation.z = -Math.PI / 2;
      sharpNose.position.set(2.0, 0.2, 0);

      const sculptPodL = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.26, 0.36), bodyMat);
      sculptPodL.position.set(-0.1, 0.25, 0.52);
      const sculptPodR = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.26, 0.36), bodyMat);
      sculptPodR.position.set(-0.1, 0.25, -0.52);

      const bargeboardL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.22, 0.04), carbonMat);
      bargeboardL.position.set(0.75, 0.22, 0.58);
      const bargeboardR = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.22, 0.04), carbonMat);
      bargeboardR.position.set(0.75, 0.22, -0.58);

      const floorNeonL = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.03, 0.04), neonCyanMat);
      floorNeonL.position.set(-0.1, 0.12, 0.68);
      const floorNeonR = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.03, 0.04), neonCyanMat);
      floorNeonR.position.set(-0.1, 0.12, -0.68);

      const aeroHalo = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.045, 8, 16), carbonMat);
      aeroHalo.rotation.x = Math.PI / 2;
      aeroHalo.position.set(0.22, 0.58, 0);
      const haloFin = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.03), carbonMat);
      haloFin.position.set(0.42, 0.56, 0);

      const fullDorsalFin = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.42, 0.04), carbonMat);
      fullDorsalFin.position.set(-0.85, 0.62, 0);
      const finTrim = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.05, 0.05), goldMat);
      finTrim.position.set(-0.85, 0.82, 0);

      const curvedFWingLower = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.06, 1.9), carbonMat);
      curvedFWingLower.position.set(2.4, 0.15, 0);
      const curvedFWingUpper = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 1.76), carbonMat);
      curvedFWingUpper.position.set(2.32, 0.23, 0);
      const fEndL = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.26, 0.04), carbonMat);
      fEndL.position.set(2.4, 0.21, 0.95);
      const fEndR = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.26, 0.04), carbonMat);
      fEndR.position.set(2.4, 0.21, -0.95);
      const fWingGlow = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 1.88), neonCyanMat);
      fWingGlow.position.set(2.58, 0.15, 0);

      const rWingMain = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.08, 1.6), carbonMat);
      rWingMain.position.set(-1.52, 0.78, 0);
      const rWingDRS = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.05, 1.6), goldMat);
      rWingDRS.position.set(-1.58, 0.94, 0);
      const rEndL = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.48, 0.04), carbonMat);
      rEndL.position.set(-1.54, 0.81, 0.8);
      const rEndR = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.48, 0.04), carbonMat);
      rEndR.position.set(-1.54, 0.81, -0.8);

      const diffuserL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.03), carbonMat);
      diffuserL.position.set(-1.5, 0.15, 0.35);
      const diffuserR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.03), carbonMat);
      diffuserR.position.set(-1.5, 0.15, -0.35);

      const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 14), helmetMat);
      helmet.position.set(0.14, 0.5, 0);
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.2), visorMat);
      visor.position.set(0.24, 0.5, 0);

      const mirrorL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.16), carbonMat);
      mirrorL.position.set(0.42, 0.45, 0.5);
      const mirrorR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.16), carbonMat);
      mirrorR.position.set(0.42, 0.45, -0.5);

      const rainLight = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.16), tailLightMat);
      rainLight.position.set(-1.62, 0.28, 0);

      carGroup.add(
        aeroFloor, mainChassis, sharpNose,
        sculptPodL, sculptPodR, bargeboardL, bargeboardR,
        floorNeonL, floorNeonR,
        aeroHalo, haloFin, fullDorsalFin, finTrim,
        curvedFWingLower, curvedFWingUpper, fEndL, fEndR, fWingGlow,
        rWingMain, rWingDRS, rEndL, rEndR,
        diffuserL, diffuserR,
        helmet, visor, mirrorL, mirrorR, rainLight
      );

      [[1.36, 0.82], [1.36, -0.82], [-1.22, 0.82], [-1.22, -0.82]].forEach(([x, z]) => {
        const w = createAeroWheel(0.34, 0.36, true);
        w.position.set(x, 0.34, z);
        carGroup.add(w);
      });
    }

    let carScale = 0.55;
    if (phase === 'iniciacion') {
      carScale = 0.65;
    } else if (phase === 'amateur') {
      carScale = 0.54;
    } else if (phase === 'profesional') {
      carScale = 0.48;
    } else {
      carScale = 0.45;
    }
    carGroup.scale.set(carScale, carScale, carScale);

    return carGroup;
  }

  private getRivalColorsPool(playerColor: string): string[] {
    const fullColorPalette = this.carColorOptions.map(opt => opt.hex.toLowerCase());
    return fullColorPalette.filter(c => c !== playerColor.toLowerCase());
  }

  isColorUsedByRivals(colorHex: string): boolean {
    const phase = this.currentPhase;
    let visibleRivals = 9;
    if (phase === 'amateur') {
      visibleRivals = 11;
    } else if (phase === 'profesional') {
      visibleRivals = 13;
    } else if (phase === 'elite') {
      visibleRivals = 15;
    }

    const targetHex = colorHex.toLowerCase();
    for (let i = 0; i < visibleRivals && i < this.ghostCars.length; i++) {
      if (this.ghostCars[i].color.toLowerCase() === targetHex) {
        return true;
      }
    }
    return false;
  }

  private createCars() {
    const phase = this.gameService.state().phase;
    const playerColor = this.gameService.state().playerCarColor;
    const playerGroup = this.create3DCarModel(playerColor, phase);
    this.playerCarMesh = playerGroup as unknown as THREE.Mesh;
    this.scene.add(this.playerCarMesh);

    const rivalOffsets = [-0.28, 0.28, -0.15, 0.2, 0.0, -0.22, 0.25, -0.12, 0.18, 0.05, -0.25, 0.22, -0.18, 0.15, -0.08];
    const initialPlayerSpeed = 0.00045 * this.gameService.playerSpeedMultiplier();
    const availableColors = this.getRivalColorsPool(playerColor);

    this.ghostCars = [];
    for (let i = 0; i < 15; i++) {
      const color = availableColors[i];
      const gGroup = this.create3DCarModel(color, phase);
      const mesh = gGroup as unknown as THREE.Mesh;

      const rivalSpeedFactor = 0.94 + ((i % 5) * 0.032);
      this.ghostCars.push({
        mesh,
        progress: ((i + 1) * (1 / 16)) % 1,
        speed: initialPlayerSpeed * rivalSpeedFactor,
        color,
        laneOffset: rivalOffsets[i % rivalOffsets.length],
        currentHeading: 0
      });
    }

    this.updateRivalCarsForPhase(phase);
  }

  private updateRivalCarsForPhase(phase: GamePhase) {
    if (this.scene && this.trackGroup) {
      this.buildCircuitForPhase(phase);
    }

    const playerColor = this.gameService.state().playerCarColor;

    if (this.playerCarMesh && this.scene) {
      this.disposeThreeObject(this.playerCarMesh);
      this.scene.remove(this.playerCarMesh);
      const newPlayerGroup = this.create3DCarModel(playerColor, phase);
      this.playerCarMesh = newPlayerGroup as unknown as THREE.Mesh;
      this.scene.add(this.playerCarMesh);
    }

    if (!this.ghostCars || this.ghostCars.length === 0) return;

    let visibleRivals = 9;
    if (phase === 'amateur') {
      visibleRivals = 11;
    } else if (phase === 'profesional') {
      visibleRivals = 13;
    } else if (phase === 'elite') {
      visibleRivals = 15;
    }

    const availableColors = this.getRivalColorsPool(playerColor);
    const currentPlayerSpeed = 0.00045 * this.gameService.playerSpeedMultiplier();

    this.ghostCars.forEach((ghost, index) => {
      ghost.color = availableColors[index];
      const isVisible = index < visibleRivals;
      const speedFactor = 0.94 + ((index % 5) * 0.032);
      ghost.speed = currentPlayerSpeed * speedFactor;

      if (this.scene) {
        this.disposeThreeObject(ghost.mesh);
        this.scene.remove(ghost.mesh);
        const newGhostGroup = this.create3DCarModel(ghost.color, phase);
        ghost.mesh = newGhostGroup as unknown as THREE.Mesh;
        ghost.mesh.visible = isVisible;
        if (isVisible) {
          this.scene.add(ghost.mesh);
        }
      }
    });
  }

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const speedMultiplier = this.gameService.playerSpeedMultiplier();
    const baseSpeed = 0.00045 * speedMultiplier;

    this.playerBoostVelocity *= 0.94;
    if (this.playerBoostVelocity < 0.00003) {
      this.playerBoostVelocity = 0;
    }

    const currentFrameSpeed = baseSpeed + this.playerBoostVelocity;
    const prevProgress = this.playerProgress;
    this.playerProgress = (this.playerProgress + currentFrameSpeed) % 1;

    if (prevProgress > 0.9 && this.playerProgress < 0.1) {
      this.gameService.recordLapCompleted();
    }

    const smoothAngleLerp = (current: number, target: number, speed: number): number => {
      let d = target - current;
      while (d < -Math.PI) d += Math.PI * 2;
      while (d > Math.PI) d -= Math.PI * 2;
      return current + d * speed;
    };

    if (this.trackCurve && this.playerCarMesh) {
      const p = this.playerProgress;
      const pos = this.trackCurve.getPointAt(p);
      const tangent = this.trackCurve.getTangentAt(p).normalize();
      const norm = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

      const lookAhead = (p + 0.015) % 1;
      const nextTangent = this.trackCurve.getTangentAt(lookAhead).normalize();

      const a0 = Math.atan2(-tangent.z, tangent.x);
      const a1 = Math.atan2(-nextTangent.z, nextTangent.x);
      let diff = a1 - a0;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;

      const curveDir = Math.sign(diff);
      const turnIntensity = Math.min(1, Math.abs(diff) * 8);
      const apexOffset = -curveDir * turnIntensity * 0.25;

      const carX = pos.x + norm.x * apexOffset;
      const carZ = pos.z + norm.z * apexOffset;

      if (this.playerHeading === 0) {
        this.playerHeading = a0;
      } else {
        this.playerHeading = smoothAngleLerp(this.playerHeading, a0, 0.12);
      }

      this.playerCarMesh.position.set(carX, pos.y + 0.1, carZ);

      const boostSquat = Math.min(0.12, (this.playerBoostVelocity / 0.004) * 0.1);
      this.playerCarMesh.rotation.set(boostSquat, this.playerHeading, 0);

      this.particleSpawnTimer++;
      if (this.particleSpawnTimer % 3 === 0) {
        this.spawnSmokeParticle(
          carX - tangent.x * 0.75,
          pos.y + 0.28,
          carZ - tangent.z * 0.75,
          -tangent.x * 0.02,
          -tangent.z * 0.02,
          1.0
        );
      }

      if (this.playerBoostVelocity > 0.0003 && this.particleSpawnTimer % 3 === 0) {
        const flameOffsetZ = (Math.random() - 0.5) * 0.15;
        this.spawnNitroParticle(
          carX - tangent.x * 0.85 + norm.x * flameOffsetZ,
          pos.y + 0.22,
          carZ - tangent.z * 0.85 + norm.z * flameOffsetZ,
          -tangent.x * 0.05,
          -tangent.z * 0.05
        );
      }
    }

    if (this.trackCurve) {
      for (let i = 0; i < this.ghostCars.length; i++) {
        const ghost = this.ghostCars[i];
        if (!ghost.mesh.visible) continue;
        ghost.progress = (ghost.progress + ghost.speed) % 1;
        const gp = ghost.progress;
        const gPos = this.trackCurve.getPointAt(gp);
        const gTangent = this.trackCurve.getTangentAt(gp).normalize();
        const gNorm = new THREE.Vector3(-gTangent.z, 0, gTangent.x).normalize();

        const gLookAhead = (gp + 0.015) % 1;
        const gNextTangent = this.trackCurve.getTangentAt(gLookAhead).normalize();

        const ga0 = Math.atan2(-gTangent.z, gTangent.x);
        const ga1 = Math.atan2(-gNextTangent.z, gNextTangent.x);
        let gDiff = ga1 - ga0;
        while (gDiff < -Math.PI) gDiff += Math.PI * 2;
        while (gDiff > Math.PI) gDiff -= Math.PI * 2;

        const gCurveDir = Math.sign(gDiff);
        const gTurnIntensity = Math.min(1, Math.abs(gDiff) * 8);
        const gApexOffset = -gCurveDir * gTurnIntensity * 0.25 + ghost.laneOffset;

        const gx = gPos.x + gNorm.x * gApexOffset;
        const gz = gPos.z + gNorm.z * gApexOffset;

        const lerpFactor = Math.min(0.25, Math.max(0.12, (ghost.speed / 0.0007) * 0.15));
        if (ghost.currentHeading === 0) {
          ghost.currentHeading = ga0;
        } else {
          ghost.currentHeading = smoothAngleLerp(ghost.currentHeading, ga0, lerpFactor);
        }

        ghost.mesh.position.set(gx, gPos.y + 0.1, gz);
        ghost.mesh.rotation.set(0, ghost.currentHeading, 0);

        if ((this.particleSpawnTimer + i) % 3 === 0) {
          this.spawnSmokeParticle(
            gx - gTangent.x * 0.7,
            gPos.y + 0.28,
            gz - gTangent.z * 0.7,
            -gTangent.x * 0.015,
            -gTangent.z * 0.015,
            0.85
          );
        }
      }
    }

    this.updateSmokeParticles();

    this.renderer.render(this.scene, this.camera);
  };

  onCanvasClick(event: MouseEvent) {
    this.gameService.manualTrackClick();
    this.playerBoostVelocity = Math.min(0.0028, this.playerBoostVelocity + 0.0009);
    this.addClickEffect(event);
  }

  private spawnNitroParticle(x: number, y: number, z: number, vx: number, vz: number) {
    if (!this.scene) return;
    if (this.smokeParticles.length > 120) {
      const oldest = this.smokeParticles.shift();
      if (oldest) {
        this.scene.remove(oldest.mesh);
      }
    }
    const isNitro = Math.random() > 0.4;
    const mesh = new THREE.Mesh(this.smokeGeometry, isNitro ? this.nitroMaterial : this.flameMaterial);
    const initialScale = 0.75 + Math.random() * 0.45;
    mesh.scale.set(initialScale, initialScale, initialScale);
    mesh.position.set(x, y, z);
    this.scene.add(mesh);

    this.smokeParticles.push({
      mesh,
      vx: vx + (Math.random() - 0.5) * 0.015,
      vy: 0.015 + Math.random() * 0.02,
      vz: vz + (Math.random() - 0.5) * 0.015,
      life: 0,
      maxLife: 14 + Math.floor(Math.random() * 6),
      initialScale
    });
  }

  private spawnSmokeParticle(x: number, y: number, z: number, vx: number, vz: number, scaleMultiplier = 1) {
    if (!this.scene) return;
    if (this.smokeParticles.length > 120) {
      const oldest = this.smokeParticles.shift();
      if (oldest) {
        this.scene.remove(oldest.mesh);
      }
    }

    const mesh = new THREE.Mesh(this.smokeGeometry, this.smokeMaterial);
    const initialScale = (0.55 + Math.random() * 0.25) * scaleMultiplier;
    mesh.scale.set(initialScale, initialScale, initialScale);
    mesh.position.set(
      x + (Math.random() - 0.5) * 0.04,
      y + (Math.random() - 0.5) * 0.02,
      z + (Math.random() - 0.5) * 0.04
    );
    this.scene.add(mesh);

    this.smokeParticles.push({
      mesh,
      vx: vx + (Math.random() - 0.5) * 0.008,
      vy: 0.022 + Math.random() * 0.012,
      vz: vz + (Math.random() - 0.5) * 0.008,
      life: 0,
      maxLife: 22 + Math.floor(Math.random() * 6),
      initialScale
    });
  }

  private updateSmokeParticles() {
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const p = this.smokeParticles[i];
      p.life++;
      p.mesh.position.x += p.vx;
      p.mesh.position.y += p.vy;
      p.mesh.position.z += p.vz;

      const progress = p.life / p.maxLife;
      const currentScale = p.initialScale * Math.max(0.01, 1 - progress * 0.7);
      p.mesh.scale.set(currentScale, currentScale, currentScale);

      if (p.life >= p.maxLife) {
        this.scene.remove(p.mesh);
        this.smokeParticles.splice(i, 1);
      }
    }
  }

  private setupResizeObserver() {
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0 && this.camera && this.renderer) {
          this.camera.aspect = width / height;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(width, height);
          if (this.scene) {
            this.renderer.render(this.scene, this.camera);
          }
        }
      }
    });
    this.resizeObserver.observe(this.canvasContainerRef.nativeElement);
  }
}
