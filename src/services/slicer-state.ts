import { signal, computed, effect } from '../../packages/signals/index.js';
import kobraProfile from '../../packages/profiles/anycubic_kobra_2.json';
import { sanitizeKobra2Filename } from './sdcard-service.js';

// Top navigation tabs (Prepare / Preview / Device / Project / Calibration)
export const activeTopTab = signal<'prepare' | 'preview' | 'device' | 'project' | 'calibration'>('prepare');

// Process tab categories exactly like Bambu Studio: Quality | Strength | Speed | Support | Others
export const activeProcessTab = signal<'quality' | 'strength' | 'speed' | 'support' | 'others'>('speed');
export const processScope = signal<'global' | 'objects'>('global');
export const advancedMode = signal<boolean>(false);

// Printer profile selection
export const selectedPrinter = signal<string>('Anycubic Kobra 2');
export const selectedNozzle = signal<string>('0.4 nozzle');

// Filament slot (slot 1, type, color, profile)
export const filamentType = signal<string>('PLA Basic');
export const filamentColor = signal<string>('#10b981'); // Emerald green
export const filamentPresetName = signal<string>('PLA Basic @Anycubic Kobra 2');
export const nozzleTemp = signal<number>(210);
export const bedTemp = signal<number>(60);

// Print profile preset
export const printProfileName = signal<string>('0.20mm Standard @Anycubic Kobra2');

// Quality parameters
export const layerHeight = signal<number>(0.20);
export const firstLayerHeight = signal<number>(0.25);
export const lineRatio = signal<number>(100);

// Strength parameters
export const wallLoops = signal<number>(3);
export const topShellLayers = signal<number>(4);
export const bottomShellLayers = signal<number>(3);
export const sparseInfillDensity = signal<number>(15);
export const sparseInfillPattern = signal<string>('grid');

// Speed parameters (Matches Bambu Studio exact fields)
export const initialLayerSpeed = signal<number>(45);
export const initialLayerInfillSpeed = signal<number>(50);
export const outerWallSpeed = signal<number>(150);
export const innerWallSpeed = signal<number>(150);
export const smallPerimetersSpeed = signal<number>(50); // %
export const sparseInfillSpeed = signal<number>(180);
export const internalSolidInfillSpeed = signal<number>(150);
export const topSurfaceSpeed = signal<number>(120);
export const travelSpeed = signal<number>(250);
export const slowDownOverhangs = signal<boolean>(true);

// Retraction (Kobra 2 direct-drive tuned)
export const retractionDistance = signal<number>(1.0);
export const retractionSpeed = signal<number>(40);

// Support parameters
export const enableSupport = signal<boolean>(false);
export const supportType = signal<'tree' | 'normal'>('tree');
export const supportThresholdAngle = signal<number>(30);

// Aliases for engine and community sidebar
export const materialPreset = signal<'pla' | 'petg' | 'tpu'>('pla');
export const infillDensity = sparseInfillDensity;
export const enableSupports = enableSupport;
export const infillSpeed = sparseInfillSpeed;
export const firstLayerSpeed = initialLayerSpeed;
export const activeSidebarTab = signal<'marketplace' | 'explorer' | 'sdguide'>('marketplace');
export const onlineSearchQuery = signal<string>('');
export const onlinePlatformFilter = signal<'all' | 'printables' | 'thingiverse' | 'makerworld' | 'cults3d' | 'myminifactory'>('all');
export const settingsMode = signal<'simple' | 'expert'>('simple');
export const validationAlarms = computed<any[]>(() => []);

// Custom G-Code
export const startGcode = signal<string>(kobraProfile.custom_gcode.start);
export const endGcode = signal<string>(kobraProfile.custom_gcode.end);

// Slicing progress & stats
export const slicingStatus = signal<'idle' | 'slicing' | 'sliced' | 'error'>('idle');
export const slicingProgress = signal<number>(0);
export const estimatedTimeSeconds = signal<number>(0);
export const filamentMassGrams = signal<number>(0);
export const filamentLengthMeters = signal<number>(0);
export const filamentCostUSD = signal<number>(0);
export const generatedGcode = signal<string>('');
export const activeModelName = signal<string>('night_5_ams(2).stl');

// SD Card filename suggestion
export const sdCardSuggestedFilename = computed<string>(() => {
  return sanitizeKobra2Filename(activeModelName.value);
});

// Model dimensions & metrics
export const modelDimensions = signal<{ x: number; y: number; z: number }>({ x: 84.5, y: 132.0, z: 36.2 });
export const triangleCount = signal<number>(28450);

// Clean direct-drive safety checks (silent auto-clamp or badge, no obnoxious banner text)
export const isRetractionSafe = computed<boolean>(() => {
  return retractionDistance.value <= 1.8 && retractionSpeed.value <= 50;
});

// Auto-clamp dangerous retraction speed silently to protect direct-drive feeder
effect(() => {
  if (retractionSpeed.peek() > 60) {
    retractionSpeed.value = 50;
  }
});
