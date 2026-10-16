// ============================================================
// 3D BEDROOM ENVIRONMENT & INTERACTIVE PS1 RETRO ENGINE (90s)
// Habitación completa de adolescente de los 90s, ultra interactiva:
// Boombox FM, Ventana animada + Lluvia, Cama, Teléfono, Puerta + Pasillo,
// TV CRT + VHS, Consola PS1, Gato Low-Poly, Espejo con Reflejo Real, Decorativos 90s.
// 100% Web Audio API procedural synthesis.
// ============================================================

(function () {
    'use strict';

    // Función auxiliar para traducciones seguras
    function tFn(key, fallback) {
        return (typeof window.t === 'function') ? window.t(key, fallback) : fallback;
    }

    // ---- DIMENSIONES DEL DORMITORIO ----
    const ROOM_W = 6.0;
    const ROOM_H = 2.8;
    const ROOM_D = 5.8;
    const HALF_W = ROOM_W / 2;  // 3.0
    const HALF_D = ROOM_D / 2;  // 2.9
    const BACK_WALL_Z = -HALF_D; // -2.9
    const FRONT_WALL_Z = HALF_D;  // 2.9
    const MOVE_SPEED = 3.2;
    const MOUSE_SENS = 0.0022;
    const INTERACT_DIST = 2.8;
    const PLAYER_HEIGHT = 1.5;
    const PLAYER_RADIUS = 0.32;
    const SEAT_X = -1.2;
    const SEAT_Z = BACK_WALL_Z + 2.35; // -0.55m frente al escritorio

    // Window params
    const WIN_W = 1.8;
    const WIN_H = 1.2;
    const WIN_CENTER_X = 0.8;
    const WIN_CENTER_Y = 1.45;
    const DOOR_X = 0.6;

    // ---- ESTADO DE LA ESCENA ----
    let scene, camera, renderer, clock;
    let isRunning = false;
    let isMonitorMode = false;
    let isTransitioning = false;
    let transitionProgress = 0;
    let transitionDirection = 'to_monitor';

    let startCamPos = new THREE.Vector3();
    let targetCamPos = new THREE.Vector3();
    let startCamYaw = 0, startCamPitch = 0;

    let moveState = { forward: false, backward: false, left: false, right: false };
    let yaw = 0, pitch = 0;
    let playerPos = new THREE.Vector3(0, PLAYER_HEIGHT, 0);

    // Cama / Modo Acostado / Cinemática de Sueño
    let isBedTransition = false;
    let bedTransitionProgress = 0;
    let bedCamStartPos = new THREE.Vector3();
    let bedCamTargetPos = new THREE.Vector3();
    let bedCamStartYaw = 0, bedCamStartPitch = 0;
    let bedCamTargetYaw = 0, bedCamTargetPitch = 0;
    let bedCooldownTimer = 0;
    let isSleepingSequence = false;
    let sleepTimer = 0;

    // Objetos 3D e Iluminación
    let pcMonitorMesh = null, pcScreenMesh = null;
    let deskLampLight = null, nightstandLight = null;
    let ceilingLightObj = null, ambientLightObj = null;
    let sunMoonLight = null;
    let outdoorHemiLight = null;
    let fairyLightsGroup = null, fairyPointLight = null;
    let lampShadeMesh = null, lampBaseMesh = null;
    let isLampOn = true;

    // Interactables
    let raycaster, interactables = [];
    let focusedObject = null;

    // 1. Boombox 3D
    let boomboxGroup = null, boomboxReel1 = null, boomboxReel2 = null;
    let boomboxLeds = [];

    // 2. Ventana Interactiva & Cortinas
    let windowSashLeft = null, windowSashRight = null;
    let curtainLeft = null, curtainRight = null;

    // 3. Cama
    let bedFrameMesh = null, bedMattressMesh = null, bedPillowMesh = null;

    // 4. Teléfono 90s
    let phoneGroup = null, phoneHandset = null, phoneCord = null;

    // 5. Puerta & Pasillo
    let doorPivot = null, doorMesh = null, doorHandleMesh = null;
    let bathDoorPivot = null, bathDoorOpen = false;
    let hallwayLight = null, hallwaySilhouette = null;
    let frontDoorPivot = null, frontDoorOpen = false;
    let livingTvOn = false, livingTvChannel = 1, livingTvLight = null, livingTvScMesh = null;
    let fridgeOpen = false, fridgeDoorPivot = null, fridgeLight = null;
    let kitchenFaucetOn = false, sinkWaterMesh = null, faucetAudioNode = null;
    let isSofaSeated = false, sofaPreSitPos = null;
    let basementRadioOn = false, basementRadioAudioNode = null;
    let basementDoorPivot = null, basementDoorOpen = false;

    // 6. TV CRT 14" con VHS
    let tvGroup = null, tvScreenMesh = null, tvScreenCanvas = null, tvScreenCtx = null, tvScreenTex = null;
    let tvStandbyLed = null;

    // 7. Consola PS1
    let ps1ConsoleGroup = null, ps1Led = null;

    // 8. Gato Low-Poly
    let catGroup = null, catBodyMesh = null, catHeadMesh = null, catTailMesh = null;
    let catAnimTime = 0;

    // 9. Espejo Dinámico con Reflejo del Jugador
    let mirrorMesh = null, mirrorCanvas = null, mirrorCtx = null, mirrorTex = null;

    // 10. Clima & Partículas
    let rainParticles = null;
    let lightningLight = null;
    let lightningTimer = 0;
    let lightningFlashActive = false;
    let dustParticles = null;

    // 10.1 Linterna 3D y Sistema de Iluminación Portátil
    let deskFlashlightMesh = null;
    let heldFlashlightGroup = null;
    let flashlightSpotLight = null;
    let isFlashlightOn = false;
    let hasFlashlight = false;

    // 10.2 Disyuntor del Sótano e Iluminación de Toda la Casa
    let breakerBoxGroup = null;
    let breakerHandleMesh = null;
    let breakerLedMesh = null;
    let livingLight = null, kitchenLight = null, basementLight = null;
    let upperBathLight = null, groundBathLight = null, foyerLight = null;
    let basementStairLight = null;

    // 11. Eventos Estacionales Dinámicos (Halloween y Navidad)
    let halloweenDecorGroup = null;
    let halloweenBedroomGroup = null;
    let halloweenHouseGroup = null;
    let christmasDecorGroup = null;
    let christmasBedroomGroup = null;
    let christmasHouseGroup = null;
    let seasonalBlinkLights = [];
    let seasonalBats = [];
    let seasonalFairyOriginalColors = [];
    let seasonalDoorDecorations = [];
    let snowRoofsGroup = null;
    let bedroomGroup = null;
    let outdoorGroup = null;
    let retroFog = null;
    let currentSceneAddTarget = null;
    let nightmareGroup = null;
    let isNightmareActive = false;
    let nightmareVariant = null;
    let nightmareInteractive = false;
    let nightmareInteractTriggered = false;
    let nightmarePropsGroup = null;
    let nightmareLightObj = null;
    let nightmareFinishCb = null;

    // 12. Persona encapuchada en la vereda de enfrente
    let hoodedStrangerGroup = null;
    let hoodedStrangerCheckTimer = 0;
    let isHoodedStrangerActive = false;
    let hoodedStrangerLifeTimer = 0;
    let steamParticles = [];
    let starParticles = null;
    let alarmClockCanvas = null, alarmClockCtx = null, alarmClockTex = null;

    // 13. Sistema de Entidades Paranormales (estilo The Mortuary Assistant)
    let paranormalEntity = null;          // { group, variant, spawnTime, lifespan, escaping, escapeTimer, spawnPos }
    let paranormalTimer = 0;              // Cuenta regresiva hasta el próximo spawn
    let paranormalCooldown = 120 + Math.random() * 180; // Segundos hasta el próximo evento
    let paranormalActive = false;
    let paranormalNotified = false;       // Si ya se mostró la notificación sutil
    let paranormalEscapeSpeed = 0;

    // Estado del Clima Dinámico
    let currentWeatherState = 'clear'; // 'clear', 'rain', 'storm'
    let weatherTimer = 0;
    let weatherCycleDuration = 150; // Duración en segundos antes de evaluar cambio climático (empieza despejado un buen rato)
    let rainOpacity = 0.0;

    // Cinemática 3D de Apertura (Modo Historia — Expediente 98)
    let isIntroCinematic = false;
    let introCinematicTimer = 0;
    const INTRO_CINEMATIC_DURATION = 28.0;
    let cinematicTriggeredFlashes = {};
    let cinematicMusicNodes = null;
    let cinematicSplashCar = null;       // Auto rápido que pasa y salpica en la cinemática
    let cinematicSplashTriggered = false; // Si ya se disparó la salpicadura
    let cinematicHemiLight = null;       // Iluminación hemisférica cinematográfica de alta visibilidad
    let cinematicMoonLight = null;       // Luz direccional de luna cinematográfica nítida

    // Exterior & Atmósfera 90s
    let playerCompleteHouseGroup = null;
    let fullHouseGroup = null;
    let outdoorCars = [];
    let outdoorStreetlights = [];
    let outdoorPorchLights = [];
    let outdoorHouseWindows = [];
    let outdoorTrees = [];
    let outdoorClouds = [];
    let outdoorBirds = [];
    let outdoorRabbits = [];
    let outdoorCats = [];
    let outdoorGroundBirds = [];
    let outdoorGrassTufts = [];
    let outdoorChimneySmokes = [];
    let outdoorFireflies = null;
    let outdoorPedestrians = [];
    let outdoorPedestrian = null;
    let outdoorPowerlines = [];
    let outdoorTvWindow = null;
    let outdoorTvLight = null;
    let outdoorPuddles = [];
    let towerBeaconLight = null;
    let mountainMeshes = [];
    let windTimer = 0;
    let skyPlaneMesh = null;
    let sunGroup = null, sunMesh = null, sunCoronaMesh = null, sunGlowMesh = null;
    let moonGroup = null, moonMesh = null, moonGlowMesh = null;
    let skyColorCurrent = new THREE.Color(0x141e30);

    let introAudioCtx = null;
    let footstepTimer = 0;
    let flickerTimer = 0;

    // ---- OPTIMIZACIÓN AUTOMÁTICA DE RENDIMIENTO 3D (Detección de Hardware) ----
    let _animFrameCount = 0;
    let _lastRenderTime = 0;
    let _fpsAccum = 0;
    let _fpsSamples = 0;
    let _qualityReduced = false;
    let _qualityBoosted = false;

    // ---- SISTEMA DE DETECCIÓN AUTOMÁTICA DE HARDWARE ----
    // Clasifica la PC en 'low', 'mid' o 'high' y ajusta todos los parámetros
    const _HW_PROFILES = {
        low:  { pixelRatio: 0.4,  fpsCap: 24, throttleTimeOfDay: 15, throttleOSCanvas: 10, throttleMirror: 8, throttleRaycast: 5, throttleChristmas: 6,  minPixelRatio: 0.25 },
        mid:  { pixelRatio: 0.65, fpsCap: 30, throttleTimeOfDay: 10, throttleOSCanvas: 6,  throttleMirror: 4, throttleRaycast: 3, throttleChristmas: 4,  minPixelRatio: 0.35 },
        high: { pixelRatio: 1.0,  fpsCap: 60, throttleTimeOfDay: 5,  throttleOSCanvas: 3,  throttleMirror: 2, throttleRaycast: 2, throttleChristmas: 2,  minPixelRatio: 0.5  }
    };
    let _detectedTier = 'mid'; // Por defecto medio, se recalcula en init
    let _hwProfile = _HW_PROFILES.mid;
    let _adaptivePixelRatio = _hwProfile.pixelRatio;
    let _TARGET_FRAME_MS = 1000 / _hwProfile.fpsCap;

    /**
     * Detecta automáticamente la capacidad del hardware del usuario.
     * Analiza: GPU (WebGL), núcleos de CPU, RAM, resolución de pantalla.
     * Retorna 'low', 'mid' o 'high'.
     */
    function _detectHardwareTier() {
        let score = 0; // 0-100 puntos

        // 1. Núcleos de CPU (navigator.hardwareConcurrency)
        const cores = navigator.hardwareConcurrency || 2;
        if (cores >= 8) score += 25;
        else if (cores >= 4) score += 15;
        else score += 5;

        // 2. Memoria del dispositivo (navigator.deviceMemory — Chrome/Edge)
        const mem = navigator.deviceMemory || 4; // Default 4 GB si no disponible
        if (mem >= 8) score += 20;
        else if (mem >= 4) score += 12;
        else score += 4;

        // 3. Análisis de GPU via WebGL
        try {
            const testCanvas = document.createElement('canvas');
            const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
            if (gl) {
                // Obtener nombre de la GPU
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    const gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
                    // GPUs integradas/débiles
                    const lowGPUs = ['intel hd', 'intel uhd', 'intel(r) hd', 'intel(r) uhd', 'mesa', 'llvmpipe', 'swiftshader', 'microsoft basic'];
                    const highGPUs = ['nvidia', 'geforce', 'rtx', 'gtx', 'radeon rx', 'radeon pro', 'arc a'];

                    if (highGPUs.some(g => gpuRenderer.includes(g))) score += 30;
                    else if (lowGPUs.some(g => gpuRenderer.includes(g))) score += 5;
                    else score += 15; // GPU desconocida, asumir media
                } else {
                    score += 12; // Sin debug info, asumir media
                }

                // Capacidades WebGL: max texture size y max renderbuffer
                const maxTexSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
                const maxRB = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
                if (maxTexSize >= 16384 && maxRB >= 16384) score += 10;
                else if (maxTexSize >= 8192) score += 6;
                else score += 2;

                // Limpiar contexto
                const loseCtx = gl.getExtension('WEBGL_lose_context');
                if (loseCtx) loseCtx.loseContext();
            } else {
                score += 5; // Sin WebGL, GPU muy baja
            }
        } catch (e) {
            score += 10; // Error en detección, asumir media
        }

        // 4. Resolución de pantalla (más pixeles = más carga de GPU)
        const totalPixels = window.screen.width * window.screen.height;
        if (totalPixels <= 1366 * 768) score += 5;   // Laptop básica
        else if (totalPixels <= 1920 * 1080) score += 10; // Full HD
        else score += 3; // 2K/4K necesita más GPU, penalizar ligeramente

        // Clasificar tier
        let tier;
        if (score >= 65) tier = 'high';
        else if (score >= 35) tier = 'mid';
        else tier = 'low';

        console.log(`[PS1 AutoPerf] Hardware detectado — Score: ${score}/100, Tier: ${tier.toUpperCase()}, Cores: ${cores}, RAM: ${mem}GB, Pixels: ${totalPixels}`);
        return tier;
    }

    /**
     * Aplica el perfil de hardware detectado a todos los parámetros de rendimiento.
     */
    function _applyHardwareProfile(tier) {
        _detectedTier = tier;
        _hwProfile = _HW_PROFILES[tier] || _HW_PROFILES.mid;
        _adaptivePixelRatio = _hwProfile.pixelRatio;
        _TARGET_FRAME_MS = 1000 / _hwProfile.fpsCap;
        _qualityReduced = false;
        _qualityBoosted = false;
        console.log(`[PS1 AutoPerf] Perfil aplicado — Tier: ${tier.toUpperCase()}, PixelRatio: ${_hwProfile.pixelRatio}, FPS Cap: ${_hwProfile.fpsCap}`);
    }

    let osCanvas = null, osCtx = null, osTexture = null;

    // ---- TEXTURAS PIXEL ART ----
    function makePixelTexture(w, h, drawFn) {
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        drawFn(ctx, w, h);
        const tex = new THREE.CanvasTexture(c);
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = THREE.NearestFilter;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
    }

    function woodFloorTexture() {
        return makePixelTexture(64, 64, (ctx, w, h) => {
            ctx.fillStyle = '#5c3818';
            ctx.fillRect(0, 0, w, h);
            for (let y = 0; y < h; y += 16) {
                ctx.fillStyle = '#3f240f';
                ctx.fillRect(0, y, w, 2);
                for (let x = 0; x < w; x += 32) {
                    const offset = (y / 16 % 2 === 0) ? 0 : 16;
                    ctx.fillStyle = '#291609';
                    ctx.fillRect(x + offset, y, 2, 16);
                    ctx.fillStyle = '#734722';
                    ctx.fillRect(x + offset + 3, y + 3, 26, 10);
                }
            }
        });
    }

    function rugTexture() {
        return makePixelTexture(32, 32, (ctx, w, h) => {
            ctx.fillStyle = '#8a3324'; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#e09f5c'; ctx.fillRect(2, 2, w - 4, h - 4);
            ctx.fillStyle = '#a83e2c'; ctx.fillRect(4, 4, w - 8, h - 8);
            ctx.fillStyle = '#ebd0ab'; ctx.fillRect(8, 8, w - 16, h - 16);
        });
    }

    function wallTexture() {
        return makePixelTexture(64, 64, (ctx, w, h) => {
            ctx.fillStyle = '#f5e8d7'; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#e8d5c0';
            for (let x = 0; x < w; x += 16) {
                ctx.fillRect(x, 0, 4, h);
                ctx.fillStyle = '#dbcaa7';
                ctx.fillRect(x + 1, 0, 2, h);
                ctx.fillStyle = '#e8d5c0';
            }
            ctx.fillStyle = '#d5c0aa';
            for (let y = 8; y < h; y += 16) {
                for (let x = 8; x < w; x += 16) {
                    ctx.fillRect(x, y, 2, 2);
                }
            }
        });
    }

    let wallTex = null;

    function createSeamlessWallMesh(width, height, posX, posY, posZ, rotY, worldXOffset, worldYOffset) {
        if (!wallTex) wallTex = wallTexture();
        const segX = Math.max(6, Math.round(width * 3));
        const segY = Math.max(6, Math.round(height * 3));
        const geo = new THREE.PlaneGeometry(width, height, segX, segY);
        const tex = wallTex.clone();
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = THREE.NearestFilter;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.needsUpdate = true;
        const unitW = 1.0;
        const unitH = 1.0;
        tex.repeat.set(width / unitW, height / unitH);
        tex.offset.set((worldXOffset / unitW) % 1, (worldYOffset / unitH) % 1);
        const mat = new THREE.MeshLambertMaterial({ map: tex, side: THREE.FrontSide });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(posX, posY, posZ);
        if (rotY) mesh.rotation.y = rotY;
        return mesh;
    }

    function blanketTexture() {
        return makePixelTexture(32, 32, (ctx, w, h) => {
            ctx.fillStyle = '#2b6cb0'; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#3182ce';
            for (let i = 0; i < w; i += 8) { ctx.fillRect(i, 0, 4, h); ctx.fillRect(0, i, w, 4); }
        });
    }

    function furnitureWoodTexture() {
        return makePixelTexture(32, 32, (ctx, w, h) => {
            ctx.fillStyle = '#422513'; ctx.fillRect(0, 0, w, h);
            for (let y = 0; y < h; y += 4) { ctx.fillStyle = '#5c351c'; ctx.fillRect(0, y, w, 2); }
        });
    }

    function posterNirvanaTexture() {
        return makePixelTexture(64, 96, (ctx, w, h) => {
            ctx.fillStyle = '#080808'; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#facc15'; ctx.font = 'bold 9px sans-serif'; ctx.fillText('NIRVANA', 8, 16);
            ctx.fillStyle = '#facc15';
            ctx.beginPath(); ctx.arc(32, 48, 18, 0, Math.PI * 2); ctx.stroke();
            ctx.font = '14px sans-serif'; ctx.fillText('x x', 22, 46);
            ctx.beginPath(); ctx.arc(32, 54, 8, 0, Math.PI); ctx.stroke();
            ctx.fillStyle = '#ffffff'; ctx.font = '7px monospace'; ctx.fillText('NEVERMIND 1991', 4, 85);
        });
    }

    function posterCyberHackerTexture() {
        return makePixelTexture(64, 96, (ctx, w, h) => {
            ctx.fillStyle = '#051508'; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#00ff66'; ctx.font = 'bold 9px monospace';
            ctx.fillText('DARK LINK', 4, 18); ctx.fillText('SYSTEM OK', 4, 32);
            ctx.strokeStyle = '#00ff66'; ctx.strokeRect(4, 40, w - 8, 48);
            ctx.fillStyle = '#00ff66';
            for (let i = 0; i < 6; i++) ctx.fillRect(8 + i * 8, 48 + (i % 3) * 12, 6, 8);
        });
    }

    function posterProdigyTexture() {
        return makePixelTexture(64, 96, (ctx, w, h) => {
            ctx.fillStyle = '#1a0505'; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#ff3300'; ctx.font = 'bold 8px monospace'; ctx.fillText('THE PRODIGY', 2, 16);
            ctx.fillStyle = '#ff8800'; ctx.fillRect(12, 28, 40, 42);
            ctx.fillStyle = '#000000'; ctx.font = 'bold 10px sans-serif'; ctx.fillText('FAT', 22, 48); ctx.fillText('LAND', 18, 62);
            ctx.fillStyle = '#ffff00'; ctx.font = '6px monospace'; ctx.fillText('ELECTRONIC 1997', 2, 88);
        });
    }

    // ---- PANTALLA VIVA DEL OS ----
    function initDynamicOSCanvas() {
        if (!osCanvas) {
            osCanvas = document.createElement('canvas');
            osCanvas.width = 256; osCanvas.height = 192;
            osCtx = osCanvas.getContext('2d');
        }
        updateDynamicOSCanvas();
        osTexture = new THREE.CanvasTexture(osCanvas);
        osTexture.magFilter = THREE.NearestFilter;
        osTexture.minFilter = THREE.NearestFilter;
        return osTexture;
    }

    function updateDynamicOSCanvas() {
        if (!osCtx) return;
        const w = osCanvas.width, h = osCanvas.height;
        osCtx.fillStyle = '#008080'; osCtx.fillRect(0, 0, w, h);

        const icons = [
            { name: 'NightLink', x: 10, y: 10, color: '#00ffff' },
            { name: 'DarkChat', x: 10, y: 44, color: '#ffff00' },
            { name: 'Terminal', x: 10, y: 78, color: '#ffffff' },
            { name: 'Antivirus', x: 10, y: 112, color: '#ff3333' }
        ];
        icons.forEach(ic => {
            osCtx.fillStyle = 'rgba(0,0,0,0.4)'; osCtx.fillRect(ic.x, ic.y, 36, 26);
            osCtx.fillStyle = ic.color; osCtx.font = '9px sans-serif'; osCtx.fillText('■', ic.x + 14, ic.y + 16);
            osCtx.fillStyle = '#ffffff'; osCtx.font = '6px monospace'; osCtx.fillText(ic.name.substring(0, 7), ic.x + 2, ic.y + 24);
        });

        osCtx.fillStyle = '#c0c0c0'; osCtx.fillRect(80, 45, 160, 95);
        osCtx.fillStyle = '#000080'; osCtx.fillRect(81, 46, 158, 12);
        osCtx.fillStyle = '#ffffff'; osCtx.font = '7px monospace'; osCtx.fillText('Phantom DarkOS v1.95', 84, 55);
        osCtx.fillStyle = '#ffffff'; osCtx.fillRect(84, 60, 152, 76);
        osCtx.fillStyle = '#008000'; osCtx.font = '6px monospace'; osCtx.fillText('> ANN NETWORK CONNECTED', 87, 72);
        osCtx.fillStyle = '#000000'; osCtx.fillText('Status: ONLINE', 87, 84);
        osCtx.fillStyle = '#0000ff'; osCtx.fillText('[ CLICK PARA ENTRAR ]', 87, 114);
        osCtx.fillStyle = '#c0c0c0'; osCtx.fillRect(0, h - 16, w, 16);
        osCtx.fillStyle = '#000000'; osCtx.font = 'bold 7px sans-serif'; osCtx.fillText('Inicio', 6, h - 5);

        let timeStr = "03:14 AM";
        if (window.state && typeof window.state.gameTimeMinutes === 'number') {
            let mins = window.state.gameTimeMinutes;
            let h24 = Math.floor(mins / 60) % 24, m24 = mins % 60;
            let ampm = h24 >= 12 ? 'PM' : 'AM';
            let h12 = h24 % 12; if (h12 === 0) h12 = 12;
            timeStr = h12.toString().padStart(2, '0') + ':' + m24.toString().padStart(2, '0') + ' ' + ampm;
        }
        osCtx.fillStyle = '#ffffff'; osCtx.fillRect(w - 48, h - 14, 45, 12);
        osCtx.fillStyle = '#000000'; osCtx.font = '7px monospace'; osCtx.fillText(timeStr, w - 44, h - 5);
        if (osTexture) osTexture.needsUpdate = true;
    }

    // ---- RELOJ DESPERTADOR DIGITAL LED ROJO ----
    function initAlarmClockCanvas() {
        if (!alarmClockCanvas) {
            alarmClockCanvas = document.createElement('canvas');
            alarmClockCanvas.width = 64; alarmClockCanvas.height = 32;
            alarmClockCtx = alarmClockCanvas.getContext('2d');
        }
        updateAlarmClockTexture();
        alarmClockTex = new THREE.CanvasTexture(alarmClockCanvas);
        alarmClockTex.magFilter = THREE.NearestFilter;
        alarmClockTex.minFilter = THREE.NearestFilter;
        return alarmClockTex;
    }

    function updateAlarmClockTexture() {
        if (!alarmClockCtx) return;
        if (_animFrameCount > 0 && _animFrameCount % _hwProfile.throttleTimeOfDay !== 0) return; // Throttle adaptativo según hardware
        alarmClockCtx.fillStyle = '#111'; alarmClockCtx.fillRect(0, 0, 64, 32);
        let timeStr = "03:14";
        if (window.state && typeof window.state.gameTimeMinutes === 'number') {
            let mins = window.state.gameTimeMinutes;
            let h24 = Math.floor(mins / 60) % 24, m24 = mins % 60;
            let h12 = h24 % 12; if (h12 === 0) h12 = 12;
            timeStr = h12.toString().padStart(2, '0') + ':' + m24.toString().padStart(2, '0');
        }
        alarmClockCtx.fillStyle = '#ff1122';
        alarmClockCtx.font = 'bold 16px monospace';
        alarmClockCtx.fillText(timeStr, 8, 22);
        if (alarmClockTex) alarmClockTex.needsUpdate = true;
    }

    // ---- TEXTURA DINÁMICA DE LA TV CRT 14" ----
    function initTVScreenCanvas() {
        if (!tvScreenCanvas) {
            tvScreenCanvas = document.createElement('canvas');
            tvScreenCanvas.width = 128; tvScreenCanvas.height = 96;
            tvScreenCtx = tvScreenCanvas.getContext('2d');
        }
        updateTVScreenCanvas();
        tvScreenTex = new THREE.CanvasTexture(tvScreenCanvas);
        tvScreenTex.magFilter = THREE.NearestFilter;
        tvScreenTex.minFilter = THREE.NearestFilter;
        return tvScreenTex;
    }

    function updateTVScreenCanvas() {
        if (!tvScreenCtx) return;
        if (_animFrameCount > 0 && _animFrameCount % _hwProfile.throttleOSCanvas !== 0) return; // Throttle adaptativo según hardware
        const w = tvScreenCanvas.width, h = tvScreenCanvas.height;

        if (!window.state.tvOn) {
            tvScreenCtx.fillStyle = '#05070a';
            tvScreenCtx.fillRect(0, 0, w, h);
            if (tvScreenTex) tvScreenTex.needsUpdate = true;
            return;
        }

        const ch = window.state.tvChannel || 0;
        if (ch === 0) {
            const imgData = tvScreenCtx.createImageData(w, h);
            for (let i = 0; i < imgData.data.length; i += 4) {
                const v = Math.random() * 255;
                imgData.data[i] = v;
                imgData.data[i + 1] = v;
                imgData.data[i + 2] = v;
                imgData.data[i + 3] = 255;
            }
            tvScreenCtx.putImageData(imgData, 0, 0);
            tvScreenCtx.fillStyle = '#00ff00';
            tvScreenCtx.font = 'bold 10px monospace';
            tvScreenCtx.fillText('CH 03 - ANT', 8, 16);

        } else if (ch === 1) {
            tvScreenCtx.fillStyle = '#000044';
            tvScreenCtx.fillRect(0, 0, w, h);
            tvScreenCtx.fillStyle = '#ffaa00';
            tvScreenCtx.fillRect(0, 0, w, 14);
            tvScreenCtx.fillStyle = '#000000';
            tvScreenCtx.font = 'bold 9px sans-serif';
            tvScreenCtx.fillText('NOTICIAS 24H - 1998', 6, 10);

            tvScreenCtx.fillStyle = '#e0ac69';
            tvScreenCtx.fillRect(16, 24, 28, 32);
            tvScreenCtx.fillStyle = '#222';
            tvScreenCtx.fillRect(16, 20, 28, 8);
            tvScreenCtx.fillStyle = '#112255';
            tvScreenCtx.fillRect(10, 56, 40, 24);

            tvScreenCtx.fillStyle = '#cc0000';
            tvScreenCtx.fillRect(0, h - 18, w, 18);
            tvScreenCtx.fillStyle = '#ffffff';
            tvScreenCtx.font = '7px monospace';
            const offset = (Math.floor(Date.now() / 80) % 200);
            tvScreenCtx.fillText('ALERTA: INTROMISIÓN EN REDES... CORTAFUEGOS COMPROMETIDOS...', 130 - offset, h - 6);

        } else if (ch === 2) {
            tvScreenCtx.fillStyle = '#0000aa';
            tvScreenCtx.fillRect(0, 0, w, h);
            tvScreenCtx.fillStyle = '#ffffff';
            tvScreenCtx.font = 'bold 12px monospace';
            tvScreenCtx.fillText('VIDEO 1', 12, 28);
            tvScreenCtx.font = '9px monospace';
            tvScreenCtx.fillText('SIN SEÑAL', 12, 44);

        } else if (ch === 3) {
            tvScreenCtx.fillStyle = '#150000';
            tvScreenCtx.fillRect(0, 0, w, h);
            tvScreenCtx.fillStyle = '#ff0033';
            tvScreenCtx.font = 'bold 10px monospace';
            tvScreenCtx.fillText('>>> SEÑAL PIRATA <<<', 8, 20);
            tvScreenCtx.fillStyle = '#ffffff';
            tvScreenCtx.font = '8px monospace';
            tvScreenCtx.fillText('NODO: ' + (window.state.threatActive ? 'INTRUSO CERCA' : 'ESPERANDO'), 12, 40);
            if (Math.random() < 0.7) {
                tvScreenCtx.fillStyle = '#ff0000';
                tvScreenCtx.fillRect(40, 55, 12, 6);
                tvScreenCtx.fillRect(76, 55, 12, 6);
                tvScreenCtx.fillStyle = '#ffff00';
                tvScreenCtx.fillRect(44, 57, 4, 2);
                tvScreenCtx.fillRect(80, 57, 4, 2);
            }

        } else if (ch === 4) {
            // Canal 05: Dibujos Animados 90s (Las Aventuras de Pixel & Link)
            tvScreenCtx.fillStyle = '#63b3ed';
            tvScreenCtx.fillRect(0, 0, w, 52);
            tvScreenCtx.fillStyle = '#48bb78';
            tvScreenCtx.fillRect(0, 52, w, 44);
            // Nubes retro
            tvScreenCtx.fillStyle = '#ffffff';
            tvScreenCtx.fillRect(16, 14, 24, 10);
            tvScreenCtx.fillRect(84, 20, 28, 12);
            // Personaje pixel animado saltando
            const charBounce = Math.abs(Math.sin(Date.now() / 160)) * 14;
            const charX = 52 + Math.sin(Date.now() / 450) * 22;
            tvScreenCtx.fillStyle = '#ecc94b';
            tvScreenCtx.fillRect(charX, 42 - charBounce, 18, 16);
            tvScreenCtx.fillStyle = '#e53e3e';
            tvScreenCtx.fillRect(charX + 2, 58 - charBounce, 14, 14);
            tvScreenCtx.fillStyle = '#000000';
            tvScreenCtx.fillRect(charX + 4, 46 - charBounce, 3, 3);
            tvScreenCtx.fillRect(charX + 11, 46 - charBounce, 3, 3);
            tvScreenCtx.fillStyle = '#ffffff';
            tvScreenCtx.font = 'bold 8px sans-serif';
            tvScreenCtx.fillText('PIXEL & LINK 1998', 8, 12);

        } else if (ch === 5) {
            // Canal 18: Teletienda de Madrugada (Módem 56k Phantom)
            tvScreenCtx.fillStyle = '#1a202c';
            tvScreenCtx.fillRect(0, 0, w, h);
            tvScreenCtx.fillStyle = '#ecc94b';
            tvScreenCtx.fillRect(0, 0, w, 15);
            tvScreenCtx.fillStyle = '#000000';
            tvScreenCtx.font = 'bold 9px sans-serif';
            tvScreenCtx.fillText('¡OFERTA DE MADRUGADA!', 6, 11);
            tvScreenCtx.fillStyle = '#e2e8f0';
            tvScreenCtx.fillRect(18, 24, 38, 26);
            tvScreenCtx.fillStyle = '#a0aec0';
            tvScreenCtx.fillRect(56, 24, 10, 26);
            tvScreenCtx.fillStyle = '#4a5568';
            tvScreenCtx.fillRect(22, 28, 14, 6);
            tvScreenCtx.fillStyle = '#00ff66';
            tvScreenCtx.fillRect(22, 42, 4, 4);
            tvScreenCtx.fillRect(30, 42, 4, 4);
            tvScreenCtx.fillStyle = '#63b3ed';
            tvScreenCtx.font = 'bold 8px monospace';
            tvScreenCtx.fillText('MODEM 56K V.90', 40, 64);
            tvScreenCtx.fillStyle = '#f56565';
            tvScreenCtx.font = 'bold 11px sans-serif';
            tvScreenCtx.fillText('$199.99', 76, 40);
            tvScreenCtx.fillStyle = '#ffffff';
            tvScreenCtx.font = '8px monospace';
            tvScreenCtx.fillText('LLAME: 1-800-PHANTOM', 6, h - 6);

        } else if (ch === 6) {
            // Canal 24: Cámara CCTV Pasillo
            tvScreenCtx.fillStyle = '#0a160e';
            tvScreenCtx.fillRect(0, 0, w, h);
            tvScreenCtx.strokeStyle = '#1c452e';
            tvScreenCtx.lineWidth = 1;
            tvScreenCtx.beginPath();
            tvScreenCtx.moveTo(0, 0); tvScreenCtx.lineTo(44, 32);
            tvScreenCtx.moveTo(w, 0); tvScreenCtx.lineTo(84, 32);
            tvScreenCtx.moveTo(0, h); tvScreenCtx.lineTo(44, 64);
            tvScreenCtx.moveTo(w, h); tvScreenCtx.lineTo(84, 64);
            tvScreenCtx.stroke();
            tvScreenCtx.strokeRect(44, 32, 40, 32);
            if (Math.random() < 0.6) {
                tvScreenCtx.fillStyle = '#040b07';
                tvScreenCtx.fillRect(58, 36, 12, 24);
            }
            tvScreenCtx.fillStyle = '#48bb78';
            tvScreenCtx.font = '7px monospace';
            tvScreenCtx.fillText('CAM-04 [PASILLO B]', 6, 12);
            tvScreenCtx.fillText('REC ● LIVE', 6, h - 6);
            const scanY = (Date.now() / 25) % h;
            tvScreenCtx.fillStyle = 'rgba(72, 187, 120, 0.25)';
            tvScreenCtx.fillRect(0, scanY, w, 4);

        } else if (ch === 7) {
            // Canal 66: Transmisión de Emergencia EBS
            const barW = w / 7;
            const colors = ['#ffffff', '#ffff00', '#00ffff', '#00ff00', '#ff00ff', '#ff0000', '#0000ff'];
            colors.forEach((col, i) => {
                tvScreenCtx.fillStyle = col;
                tvScreenCtx.fillRect(i * barW, 0, barW + 1, 58);
            });
            const flash = Math.floor(Date.now() / 320) % 2 === 0;
            tvScreenCtx.fillStyle = flash ? '#cc0000' : '#1a202c';
            tvScreenCtx.fillRect(0, 58, w, 38);
            tvScreenCtx.fillStyle = '#ffffff';
            tvScreenCtx.font = 'bold 8px sans-serif';
            tvScreenCtx.fillText('SISTEMA DE ALERTA EBS', 10, 72);
            tvScreenCtx.font = '7px monospace';
            tvScreenCtx.fillText('NO MIRE POR LA VENTANA', 6, 86);
        }

        if (tvScreenTex) tvScreenTex.needsUpdate = true;
    }

    // ---- TEXTURA DINÁMICA DEL ESPEJO (Reflejo del Jugador) ----
    function initMirrorCanvas() {
        if (!mirrorCanvas) {
            mirrorCanvas = document.createElement('canvas');
            mirrorCanvas.width = 128; mirrorCanvas.height = 192;
            mirrorCtx = mirrorCanvas.getContext('2d');
        }
        updateMirrorCanvas();
        mirrorTex = new THREE.CanvasTexture(mirrorCanvas);
        mirrorTex.magFilter = THREE.NearestFilter;
        mirrorTex.minFilter = THREE.NearestFilter;
        return mirrorTex;
    }

    function updateMirrorCanvas() {
        if (!mirrorCtx) return;
        if (_animFrameCount > 0 && _animFrameCount % _hwProfile.throttleMirror !== 0) return; // Throttle adaptativo según hardware
        const w = mirrorCanvas.width, h = mirrorCanvas.height;

        // ---- 1. REFLEJO REAL DE LA HABITACIÓN (Pared Opuesta x = +3.0) ----
        // Fondo base de la pared (papel tapiz beige noventero idéntico al cuarto)
        mirrorCtx.fillStyle = '#f5e8d7';
        mirrorCtx.fillRect(0, 0, w, h);

        // Franjas verticales del papel tapiz de la habitación
        for (let x = 0; x < w; x += 16) {
            mirrorCtx.fillStyle = '#e8d5c0';
            mirrorCtx.fillRect(x, 0, 4, h);
            mirrorCtx.fillStyle = '#dbcaa7';
            mirrorCtx.fillRect(x + 1, 0, 2, h);
        }
        // Motivos y textura de puntos del papel tapiz
        mirrorCtx.fillStyle = '#d5c0aa';
        for (let y = 8; y < 140; y += 16) {
            for (let x = 8; x < w; x += 16) {
                mirrorCtx.fillRect(x, y, 2, 2);
            }
        }

        // Sombra de unión superior pared/techo
        mirrorCtx.fillStyle = 'rgba(60, 40, 20, 0.25)';
        mirrorCtx.fillRect(0, 0, w, 8);

        // Resplandor cálido de la lámpara central del techo reflejada
        const ceilGlow = mirrorCtx.createRadialGradient(w / 2, 8, 2, w / 2, 8, 48);
        ceilGlow.addColorStop(0, 'rgba(255, 235, 190, 0.4)');
        ceilGlow.addColorStop(1, 'rgba(255, 235, 190, 0.0)');
        mirrorCtx.fillStyle = ceilGlow;
        mirrorCtx.fillRect(0, 0, w, 60);

        // Moldura de madera a media altura (Chair Rail a y = 86)
        mirrorCtx.fillStyle = '#2a160a';
        mirrorCtx.fillRect(0, 86, w, 5);
        mirrorCtx.fillStyle = '#5c351c';
        mirrorCtx.fillRect(0, 87, w, 2);

        // Zócalo de madera en la base de la pared (y = 138 a 150)
        mirrorCtx.fillStyle = '#3a2012';
        mirrorCtx.fillRect(0, 138, w, 12);
        mirrorCtx.fillStyle = '#5c351c';
        mirrorCtx.fillRect(0, 138, w, 2);

        // Suelo de madera con perspectiva de tablas (y = 150 a h)
        mirrorCtx.fillStyle = '#5c3818';
        mirrorCtx.fillRect(0, 150, w, h - 150);
        // Líneas de junturas de tablas de madera
        mirrorCtx.fillStyle = '#3a220e';
        mirrorCtx.fillRect(0, 162, w, 2);
        mirrorCtx.fillRect(0, 176, w, 2);
        for (let x = 12; x < w; x += 36) {
            mirrorCtx.fillRect(x, 150, 2, 12);
            mirrorCtx.fillRect((x + 18) % w, 164, 2, 12);
            mirrorCtx.fillRect(x, 178, 2, 14);
        }

        // Borde de la alfombra en el centro del suelo
        mirrorCtx.fillStyle = '#8a3324';
        mirrorCtx.fillRect(28, 168, 72, h - 168);
        mirrorCtx.fillStyle = '#e09f5c';
        mirrorCtx.fillRect(32, 172, 64, h - 172);

        // ---- OBJETOS REALES DE LA HABITACIÓN REFLEJADOS DE FONDO ----
        // A la izquierda del reflejo (Planta de interior en x = 8, y = 116)
        mirrorCtx.fillStyle = '#dcd3c2';
        mirrorCtx.fillRect(8, 134, 14, 16); // Maceta
        mirrorCtx.fillStyle = '#8a5030';
        mirrorCtx.fillRect(7, 133, 16, 3); // Borde maceta
        mirrorCtx.fillStyle = '#1b5e20';
        mirrorCtx.fillRect(6, 122, 18, 12); // Follaje verde
        mirrorCtx.fillStyle = '#2d8a4e';
        mirrorCtx.fillRect(9, 118, 12, 10);
        mirrorCtx.fillRect(4, 126, 6, 6);

        // En el centro-derecha (Calendario 1998 en la pared opuesta)
        mirrorCtx.fillStyle = '#ffffff';
        mirrorCtx.fillRect(48, 38, 16, 22);
        mirrorCtx.fillStyle = '#cc0000';
        mirrorCtx.fillRect(48, 38, 16, 6);
        mirrorCtx.fillStyle = '#225588';
        mirrorCtx.fillRect(50, 46, 12, 6);
        mirrorCtx.fillStyle = '#444444';
        mirrorCtx.fillRect(50, 54, 12, 4);

        // A la derecha de fondo (Póster Cyber Hacker en pared opuesta)
        mirrorCtx.fillStyle = '#051508';
        mirrorCtx.fillRect(96, 44, 26, 38);
        mirrorCtx.strokeStyle = '#00ff66';
        mirrorCtx.lineWidth = 1;
        mirrorCtx.strokeRect(98, 46, 22, 34);
        mirrorCtx.fillStyle = '#00ff66';
        mirrorCtx.fillRect(101, 50, 16, 3);
        mirrorCtx.fillRect(101, 56, 16, 2);

        // Esquina inferior derecha (Estructura de la Cama y Manta azul)
        mirrorCtx.fillStyle = '#422513';
        mirrorCtx.fillRect(86, 114, 42, 36); // Cabecero y marco
        mirrorCtx.fillStyle = '#2b6cb0';
        mirrorCtx.fillRect(92, 124, 36, 26); // Colchón con manta azul
        mirrorCtx.fillStyle = '#3182ce';
        mirrorCtx.fillRect(92, 132, 36, 4);
        mirrorCtx.fillRect(104, 124, 4, 26);
        mirrorCtx.fillStyle = '#f5f7fa';
        mirrorCtx.fillRect(100, 118, 20, 8); // Almohada blanca

        // Gato durmiendo cerca de la cama
        mirrorCtx.fillStyle = '#d97724';
        mirrorCtx.fillRect(94, 142, 14, 8);
        mirrorCtx.fillRect(92, 140, 6, 6);
        mirrorCtx.fillStyle = '#b85b14';
        mirrorCtx.fillRect(92, 138, 3, 3);

        // ---- 2. REFLEJO DEL JUGADOR EN PIXEL ART (Cuerpo Completo) ----
        // Posición relativa del jugador frente al espejo (x = -HALF_W = -3.0, z = -0.9)
        const distX = playerPos.x - (-HALF_W);
        const distZ = playerPos.z - (-0.9);
        const dist = Math.hypot(distX, distZ);

        if (distX < 4.8 && Math.abs(distZ) < 3.2 && !window.state.isLyingDown) {
            const scale = Math.max(0.65, Math.min(1.35, 1.8 / dist));
            const charX = 64 + (distZ / 2.0) * 46;
            const groundY = 158;
            const headY = groundY - 105 * scale;

            // Sombra ovalada en el suelo
            mirrorCtx.fillStyle = 'rgba(0, 0, 0, 0.45)';
            mirrorCtx.beginPath();
            mirrorCtx.ellipse(charX, groundY, 18 * scale, 5 * scale, 0, 0, Math.PI * 2);
            mirrorCtx.fill();

            // --- A. ZAPATILLAS SKATE 90s ---
            // Zapatilla izquierda
            mirrorCtx.fillStyle = '#1e293b';
            mirrorCtx.fillRect(charX - 14 * scale, groundY - 7 * scale, 12 * scale, 7 * scale);
            mirrorCtx.fillStyle = '#f1f5f9';
            mirrorCtx.fillRect(charX - 15 * scale, groundY - 3 * scale, 14 * scale, 3 * scale); // Suela blanca
            mirrorCtx.fillRect(charX - 15 * scale, groundY - 6 * scale, 4 * scale, 4 * scale); // Puntera de goma
            mirrorCtx.fillStyle = '#ffffff';
            mirrorCtx.fillRect(charX - 10 * scale, groundY - 6 * scale, 5 * scale, 2 * scale); // Cordones

            // Zapatilla derecha
            mirrorCtx.fillStyle = '#1e293b';
            mirrorCtx.fillRect(charX + 2 * scale, groundY - 7 * scale, 12 * scale, 7 * scale);
            mirrorCtx.fillStyle = '#f1f5f9';
            mirrorCtx.fillRect(charX + 1 * scale, groundY - 3 * scale, 14 * scale, 3 * scale); // Suela blanca
            mirrorCtx.fillRect(charX + 11 * scale, groundY - 6 * scale, 4 * scale, 4 * scale); // Puntera de goma
            mirrorCtx.fillStyle = '#ffffff';
            mirrorCtx.fillRect(charX + 5 * scale, groundY - 6 * scale, 5 * scale, 2 * scale); // Cordones

            // --- B. PANTALONES / JEANS HOLGADOS 90s (Baggy Jeans) ---
            // Pierna izquierda
            mirrorCtx.fillStyle = '#2b4c7e';
            mirrorCtx.fillRect(charX - 14 * scale, groundY - 48 * scale, 12 * scale, 42 * scale);
            mirrorCtx.fillStyle = '#1e355b';
            mirrorCtx.fillRect(charX - 4 * scale, groundY - 48 * scale, 3 * scale, 42 * scale); // Sombra interior
            mirrorCtx.fillStyle = '#3b629b';
            mirrorCtx.fillRect(charX - 14 * scale, groundY - 30 * scale, 10 * scale, 3 * scale); // Arruga de rodilla

            // Pierna derecha
            mirrorCtx.fillStyle = '#2b4c7e';
            mirrorCtx.fillRect(charX + 2 * scale, groundY - 48 * scale, 12 * scale, 42 * scale);
            mirrorCtx.fillStyle = '#1e355b';
            mirrorCtx.fillRect(charX + 1 * scale, groundY - 48 * scale, 3 * scale, 42 * scale); // Sombra interior
            mirrorCtx.fillStyle = '#3b629b';
            mirrorCtx.fillRect(charX + 4 * scale, groundY - 30 * scale, 10 * scale, 3 * scale); // Arruga de rodilla

            // Cinturón y tiro
            mirrorCtx.fillStyle = '#1a1816';
            mirrorCtx.fillRect(charX - 14 * scale, groundY - 50 * scale, 28 * scale, 3 * scale);

            // --- C. BUZO / HOODIE OVERSIZED 90s ---
            // Torso principal (Buzo grunge grafito con rayas verde petróleo)
            mirrorCtx.fillStyle = '#222933';
            mirrorCtx.fillRect(charX - 16 * scale, groundY - 82 * scale, 32 * scale, 33 * scale);
            // Rayas de estilo retro en el buzo
            mirrorCtx.fillStyle = '#0f766e';
            mirrorCtx.fillRect(charX - 16 * scale, groundY - 72 * scale, 32 * scale, 5 * scale);
            mirrorCtx.fillRect(charX - 16 * scale, groundY - 62 * scale, 32 * scale, 5 * scale);
            // Bolsillo canguro central
            mirrorCtx.fillStyle = '#181e26';
            mirrorCtx.fillRect(charX - 10 * scale, groundY - 60 * scale, 20 * scale, 9 * scale);
            // Cuello / Capucha
            mirrorCtx.fillStyle = '#2e3846';
            mirrorCtx.fillRect(charX - 12 * scale, groundY - 86 * scale, 24 * scale, 6 * scale);

            // Brazo y Manga Izquierda
            mirrorCtx.fillStyle = '#222933';
            mirrorCtx.fillRect(charX - 21 * scale, groundY - 82 * scale, 6 * scale, 30 * scale);
            mirrorCtx.fillStyle = '#0f766e';
            mirrorCtx.fillRect(charX - 21 * scale, groundY - 72 * scale, 6 * scale, 5 * scale);
            mirrorCtx.fillStyle = '#2e3846';
            mirrorCtx.fillRect(charX - 21 * scale, groundY - 54 * scale, 6 * scale, 3 * scale); // Puño
            // Mano izquierda
            mirrorCtx.fillStyle = '#e8be96';
            mirrorCtx.fillRect(charX - 20 * scale, groundY - 51 * scale, 5 * scale, 5 * scale);

            // Brazo y Manga Derecha
            mirrorCtx.fillStyle = '#222933';
            mirrorCtx.fillRect(charX + 15 * scale, groundY - 82 * scale, 6 * scale, 30 * scale);
            mirrorCtx.fillStyle = '#0f766e';
            mirrorCtx.fillRect(charX + 15 * scale, groundY - 72 * scale, 6 * scale, 5 * scale);
            mirrorCtx.fillStyle = '#2e3846';
            mirrorCtx.fillRect(charX + 15 * scale, groundY - 54 * scale, 6 * scale, 3 * scale); // Puño
            // Mano derecha
            mirrorCtx.fillStyle = '#e8be96';
            mirrorCtx.fillRect(charX + 15 * scale, groundY - 51 * scale, 5 * scale, 5 * scale);

            // --- D. CUELLO Y CABEZA ---
            // Cuello
            mirrorCtx.fillStyle = '#e5b88f';
            mirrorCtx.fillRect(charX - 4 * scale, headY + 14 * scale, 8 * scale, 8 * scale);

            // Rostro
            mirrorCtx.fillStyle = '#e8be96';
            mirrorCtx.fillRect(charX - 9 * scale, headY - 4 * scale, 18 * scale, 18 * scale);
            // Sombra de mandíbula
            mirrorCtx.fillStyle = '#d4a373';
            mirrorCtx.fillRect(charX - 8 * scale, headY + 12 * scale, 16 * scale, 3 * scale);
            // Orejas
            mirrorCtx.fillStyle = '#e0ad80';
            mirrorCtx.fillRect(charX - 11 * scale, headY + 2 * scale, 3 * scale, 6 * scale);
            mirrorCtx.fillRect(charX + 8 * scale, headY + 2 * scale, 3 * scale, 6 * scale);

            // --- E. CABELLO GRUNGE 90s (Parted Messy Hair) ---
            mirrorCtx.fillStyle = '#3a2012';
            mirrorCtx.fillRect(charX - 11 * scale, headY - 12 * scale, 22 * scale, 11 * scale); // Corona
            mirrorCtx.fillRect(charX - 12 * scale, headY - 4 * scale, 5 * scale, 15 * scale); // Mechón izq
            mirrorCtx.fillRect(charX + 7 * scale, headY - 4 * scale, 5 * scale, 15 * scale); // Mechón der
            mirrorCtx.fillStyle = '#5c351c'; // Luces castañas
            mirrorCtx.fillRect(charX - 8 * scale, headY - 11 * scale, 6 * scale, 4 * scale);
            mirrorCtx.fillRect(charX + 2 * scale, headY - 11 * scale, 6 * scale, 4 * scale);
            mirrorCtx.fillStyle = '#221108'; // Sombra flequillo
            mirrorCtx.fillRect(charX - 5 * scale, headY - 3 * scale, 4 * scale, 5 * scale);
            mirrorCtx.fillRect(charX + 1 * scale, headY - 3 * scale, 4 * scale, 5 * scale);

            // --- F. OJOS Y EXPRESIÓN ---
            const blink = Math.sin(flickerTimer * 2.6) > 0.93;
            if (!blink) {
                // Blanco de ojos
                mirrorCtx.fillStyle = '#ffffff';
                mirrorCtx.fillRect(charX - 7 * scale, headY + 2 * scale, 4 * scale, 3 * scale);
                mirrorCtx.fillRect(charX + 3 * scale, headY + 2 * scale, 4 * scale, 3 * scale);
                // Iris azul noventero
                mirrorCtx.fillStyle = '#2563eb';
                mirrorCtx.fillRect(charX - 6 * scale, headY + 2 * scale, 2 * scale, 3 * scale);
                mirrorCtx.fillRect(charX + 4 * scale, headY + 2 * scale, 2 * scale, 3 * scale);
                // Cejas
                mirrorCtx.fillStyle = '#3a2012';
                mirrorCtx.fillRect(charX - 7 * scale, headY - 1 * scale, 4 * scale, 1.5 * scale);
                mirrorCtx.fillRect(charX + 3 * scale, headY - 1 * scale, 4 * scale, 1.5 * scale);
            } else {
                // Ojos cerrados pestañeando
                mirrorCtx.fillStyle = '#3a2012';
                mirrorCtx.fillRect(charX - 7 * scale, headY + 3 * scale, 4 * scale, 1.5 * scale);
                mirrorCtx.fillRect(charX + 3 * scale, headY + 3 * scale, 4 * scale, 1.5 * scale);
            }

            // Nariz y Boca
            mirrorCtx.fillStyle = '#d4a373';
            mirrorCtx.fillRect(charX - 1 * scale, headY + 6 * scale, 2 * scale, 2 * scale);
            mirrorCtx.fillStyle = '#c48b68';
            mirrorCtx.fillRect(charX - 3 * scale, headY + 10 * scale, 6 * scale, 1.5 * scale);
        }

        // Adaptar iluminación realista: calcular nivel de oscuridad según hora, luces y linterna
        const isBlackout = !!(window.state && window.state.powerOutage);
        const hasLight = (isLampOn && !isBlackout) || (isFlashlightOn && hasFlashlight);
        const timeMinutes = (window.state && typeof window.state.gameTimeMinutes === 'number') ? (window.state.gameTimeMinutes % 1440) : 480;
        const isDaytime = (timeMinutes >= 420 && timeMinutes <= 1140);
        
        let darkFactor = 0.0;
        if (!hasLight) {
            darkFactor = isDaytime ? 0.45 : 0.88;
        } else if (!isDaytime && isLampOn) {
            darkFactor = 0.12;
        }
        if (lightningFlashActive) darkFactor = Math.max(0, darkFactor - 0.7);

        if (darkFactor > 0.05) {
            mirrorCtx.fillStyle = `rgba(2, 4, 10, ${darkFactor})`;
            mirrorCtx.fillRect(0, 0, w, h);
        }

        // Tinte de cristal sutil y destello diagonal realista
        mirrorCtx.fillStyle = 'rgba(180, 225, 250, 0.06)';
        mirrorCtx.fillRect(0, 0, w, h);

        mirrorCtx.fillStyle = isDaytime ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)';
        mirrorCtx.beginPath();
        mirrorCtx.moveTo(0, 0); mirrorCtx.lineTo(35, 0); mirrorCtx.lineTo(0, 75); mirrorCtx.closePath();
        mirrorCtx.fill();

        // Bisel de sombra en bordes del cristal del espejo
        mirrorCtx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
        mirrorCtx.lineWidth = 2;
        mirrorCtx.strokeRect(1, 1, w - 2, h - 2);

        if (mirrorTex) mirrorTex.needsUpdate = true;
    }

    // ========================================================
    // CONSTRUIR DORMITORIO COMPLETO 90s
    // ========================================================
    function buildBedroom() {
        const floorTex = woodFloorTexture(); floorTex.repeat.set(3, 3);
        const blanketTex = blanketTexture(); blanketTex.repeat.set(2, 2);

        const floorMat = new THREE.MeshLambertMaterial({ map: floorTex, side: THREE.FrontSide });
        const rugMat = new THREE.MeshLambertMaterial({ map: rugTexture(), side: THREE.FrontSide });
        const ceilMat = new THREE.MeshLambertMaterial({ color: 0xe8ded1, side: THREE.FrontSide });
        const woodMat = new THREE.MeshLambertMaterial({ map: furnitureWoodTexture(), side: THREE.DoubleSide });

        // SUELO Y ALFOMBRA
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, ROOM_D), floorMat);
        floor.rotation.x = -Math.PI / 2; floor.position.y = 0.002;
        scene.add(floor);

        const rug = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.6), rugMat);
        rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.008, 0.1);
        scene.add(rug);

        // TECHO
        const ceil = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, ROOM_D), ceilMat);
        ceil.rotation.x = Math.PI / 2; ceil.position.y = ROOM_H;
        scene.add(ceil);

        // PAREDES
        buildWallWithWindow();
        buildWallWithDoor(woodMat);

        const rightW = createSeamlessWallMesh(ROOM_D, ROOM_H, HALF_W, ROOM_H / 2, 0, -Math.PI / 2, 0, 0);
        scene.add(rightW);

        const leftW = createSeamlessWallMesh(ROOM_D, ROOM_H, -HALF_W, ROOM_H / 2, 0, Math.PI / 2, 0, 0);
        scene.add(leftW);

        // ZÓCALOS Y MOLDURAS
        buildBaseboards(woodMat);
        buildChairRail(woodMat);

        // MUEBLES E INTERACTABLES 90s
        buildSingleBed(blanketTex, woodMat);
        buildNightstand(woodMat);
        buildDeskAndPC(woodMat);
        buildFloatingWallShelf(woodMat);
        buildTVWithVHS(woodMat);
        buildWallMirror();
        buildCat();
        buildDecorativeObjects(woodMat);
        buildHousePlant(HALF_W - 0.45, 0, -1.8);
        buildFairyStringLights();

        // POSTERS DE ÉPOCA (Reactivos a la luz de la habitación, noche y linterna)
        const p1m = new THREE.MeshLambertMaterial({ map: posterNirvanaTexture(), side: THREE.DoubleSide });
        const p1 = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 1.15), p1m);
        p1.position.set(-HALF_W + 0.02, 1.6, 0.2); p1.rotation.y = Math.PI / 2; scene.add(p1);

        const p2m = new THREE.MeshLambertMaterial({ map: posterCyberHackerTexture(), side: THREE.DoubleSide });
        const p2 = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 1.15), p2m);
        p2.position.set(HALF_W - 0.02, 1.6, 1.6); p2.rotation.y = -Math.PI / 2; scene.add(p2);

        const p3m = new THREE.MeshLambertMaterial({ map: posterProdigyTexture(), side: THREE.DoubleSide });
        const p3 = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 1.15), p3m);
        p3.position.set(-1.2, 1.6, FRONT_WALL_Z - 0.02); p3.rotation.y = Math.PI; scene.add(p3);

        // LÁMPARA TECHO (Luz cálida y difusa sin quemar el techo)
        const ceilLamp = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 0.2, 8), new THREE.MeshLambertMaterial({ color: 0xf5dfb3 }));
        ceilLamp.position.set(0, ROOM_H - 0.1, 0); scene.add(ceilLamp);

        ceilingLightObj = new THREE.PointLight(0xfff3db, 1.7, 8.5);
        ceilingLightObj.position.set(0, ROOM_H - 0.40, 0); scene.add(ceilingLightObj);

        // LUZ AMBIENTAL SUAVE
        ambientLightObj = new THREE.AmbientLight(0xffeedb, 0.80); scene.add(ambientLightObj);

        // LUZ DE RELÁMPAGO
        lightningLight = new THREE.DirectionalLight(0xddeeff, 0.0);
        lightningLight.position.set(2, 10, -5); scene.add(lightningLight);

        // EFECTOS VISUALES
        createDustParticles();
        createSteamParticles(-1.2 - 0.35, 0.85, BACK_WALL_Z + 1.1 + 0.2);

        // Linterna y Arquitectura Completa de la Casa (Planta Alta, Planta Baja y Sótano)
        buildDeskFlashlight();
        buildFullHouse();
    }

    function buildBaseboards(woodMat) {
        const baseH = 0.22, baseThick = 0.03, baseY = baseH / 2;
        const bBack = new THREE.Mesh(new THREE.BoxGeometry(ROOM_W, baseH, baseThick), woodMat);
        bBack.position.set(0, baseY, BACK_WALL_Z + baseThick / 2); scene.add(bBack);

        // Zócalos frontales divididos a la izquierda y derecha para no atravesar el vano de la puerta
        const doorLeft = DOOR_X - 0.95 / 2 - 0.03; // ~0.095
        const doorRight = DOOR_X + 0.95 / 2 + 0.03; // ~1.105

        const wFrontL = doorLeft - (-HALF_W); // ~3.095
        const bFrontL = new THREE.Mesh(new THREE.BoxGeometry(wFrontL, baseH, baseThick), woodMat);
        bFrontL.position.set(-HALF_W + wFrontL / 2, baseY, FRONT_WALL_Z - baseThick / 2); scene.add(bFrontL);

        const wFrontR = HALF_W - doorRight; // ~1.895
        const bFrontR = new THREE.Mesh(new THREE.BoxGeometry(wFrontR, baseH, baseThick), woodMat);
        bFrontR.position.set(HALF_W - wFrontR / 2, baseY, FRONT_WALL_Z - baseThick / 2); scene.add(bFrontR);

        // Umbral de madera fino al ras del suelo en la entrada al pasillo
        const threshold = new THREE.Mesh(new THREE.BoxGeometry(0.95 + 0.06, 0.012, 0.16), woodMat);
        threshold.position.set(DOOR_X, 0.006, FRONT_WALL_Z); scene.add(threshold);

        const bLeft = new THREE.Mesh(new THREE.BoxGeometry(baseThick, baseH, ROOM_D), woodMat);
        bLeft.position.set(-HALF_W + baseThick / 2, baseY, 0); scene.add(bLeft);

        const bRight = new THREE.Mesh(new THREE.BoxGeometry(baseThick, baseH, ROOM_D), woodMat);
        bRight.position.set(HALF_W - baseThick / 2, baseY, 0); scene.add(bRight);
    }

    function buildChairRail(woodMat) {
        const railH = 0.05, railThick = 0.025, railY = 0.95;
        const rBackL = new THREE.Mesh(new THREE.BoxGeometry(2.9, railH, railThick), woodMat);
        rBackL.position.set(-1.55, railY, BACK_WALL_Z + railThick / 2); scene.add(rBackL);

        const rBackR = new THREE.Mesh(new THREE.BoxGeometry(1.3, railH, railThick), woodMat);
        rBackR.position.set(2.35, railY, BACK_WALL_Z + railThick / 2); scene.add(rBackR);

        const rLeft = new THREE.Mesh(new THREE.BoxGeometry(railThick, railH, ROOM_D), woodMat);
        rLeft.position.set(-HALF_W + railThick / 2, railY, 0); scene.add(rLeft);

        const rRight = new THREE.Mesh(new THREE.BoxGeometry(railThick, railH, ROOM_D), woodMat);
        rRight.position.set(HALF_W - railThick / 2, railY, 0); scene.add(rRight);
    }

    function buildFairyStringLights() {
        fairyLightsGroup = new THREE.Group();
        const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffaa33 });
        for (let x = -2.7; x <= 2.7; x += 0.32) {
            const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), bulbMat);
            const sag = Math.sin((x + 2.7) / 5.4 * Math.PI) * 0.14;
            bulb.position.set(x, ROOM_H - 0.15 - sag, BACK_WALL_Z + 0.08);
            fairyLightsGroup.add(bulb);
        }
        fairyPointLight = new THREE.PointLight(0xffaa33, 0.35, 4.5);
        fairyPointLight.position.set(0, ROOM_H - 0.45, BACK_WALL_Z + 0.65);
        fairyLightsGroup.add(fairyPointLight);
        scene.add(fairyLightsGroup);
    }

    function createDustParticles() {
        const pCount = 35;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(pCount * 3);
        for (let i = 0; i < pCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 5;
            positions[i * 3 + 1] = 0.4 + Math.random() * 2.0;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({
            color: 0xffe6a3, size: 0.032, transparent: true, opacity: 0.65
        });
        dustParticles = new THREE.Points(geo, mat);
        scene.add(dustParticles);
    }

    function updateDustParticles(dt) {
        if (!dustParticles) return;
        const speedMult = window.state.windowOpen ? 2.5 : 1.0;
        const positions = dustParticles.geometry.attributes.position.array;
        for (let i = 0; i < 35; i++) {
            positions[i * 3 + 1] += Math.sin(flickerTimer * speedMult + i) * 0.0018;
            positions[i * 3] += Math.cos(flickerTimer * 0.5 * speedMult + i) * 0.0015;
            if (positions[i * 3 + 1] > 2.5) positions[i * 3 + 1] = 0.4;
        }
        dustParticles.geometry.attributes.position.needsUpdate = true;
    }

    function createSteamParticles(x, y, z) {
        steamParticles = [];
        const mat = new THREE.MeshBasicMaterial({ color: 0xeeeeee, transparent: true, opacity: 0.35 });
        for (let i = 0; i < 4; i++) {
            const p = new THREE.Mesh(new THREE.SphereGeometry(0.018, 4, 4), mat);
            p.position.set(x + (Math.random() - 0.5) * 0.02, y + i * 0.035, z + (Math.random() - 0.5) * 0.02);
            scene.add(p);
            steamParticles.push({ mesh: p, basePos: new THREE.Vector3(x, y, z), offset: i * 0.25 });
        }
    }

    function updateSteamParticles(dt) {
        steamParticles.forEach((sp, idx) => {
            sp.mesh.position.y += dt * 0.11;
            sp.mesh.position.x += Math.sin(flickerTimer * 3 + idx) * 0.001;
            if (sp.mesh.position.y > sp.basePos.y + 0.22) {
                sp.mesh.position.y = sp.basePos.y;
                sp.mesh.position.x = sp.basePos.x + (Math.random() - 0.5) * 0.02;
            }
        });
    }

    // ========================================================
    // PARED CON VENTANA INTERACTIVA Y CORTINAS EN MOVIMIENTO
    // ========================================================
    function buildWallWithWindow() {
        const winLeft = WIN_CENTER_X - WIN_W / 2;
        const winRight = WIN_CENTER_X + WIN_W / 2;
        const winBottom = WIN_CENTER_Y - WIN_H / 2;
        const winTop = WIN_CENTER_Y + WIN_H / 2;

        const botH = winBottom;
        if (botH > 0) {
            const wBot = createSeamlessWallMesh(ROOM_W, botH, 0, botH / 2, BACK_WALL_Z, 0, 0, 0);
            scene.add(wBot);
        }

        const topH = ROOM_H - winTop;
        if (topH > 0) {
            const wTop = createSeamlessWallMesh(ROOM_W, topH, 0, ROOM_H - topH / 2, BACK_WALL_Z, 0, 0, winTop);
            scene.add(wTop);
        }

        const leftPanelW = winLeft - (-HALF_W);
        if (leftPanelW > 0) {
            const wLeft = createSeamlessWallMesh(leftPanelW, WIN_H, -HALF_W + leftPanelW / 2, WIN_CENTER_Y, BACK_WALL_Z, 0, 0, winBottom);
            scene.add(wLeft);
        }

        const rightPanelW = HALF_W - winRight;
        if (rightPanelW > 0) {
            const wRight = createSeamlessWallMesh(rightPanelW, WIN_H, HALF_W - rightPanelW / 2, WIN_CENTER_Y, BACK_WALL_Z, 0, leftPanelW + WIN_W, winBottom);
            scene.add(wRight);
        }

        const frameThick = 0.06, frameDepth = 0.07;
        const frameMat = new THREE.MeshLambertMaterial({ color: 0x3d230d, side: THREE.DoubleSide });

        const fTop = new THREE.Mesh(new THREE.BoxGeometry(WIN_W + frameThick * 2, frameThick, frameDepth), frameMat);
        fTop.position.set(WIN_CENTER_X, winTop + frameThick / 2, BACK_WALL_Z); scene.add(fTop);

        const fBot = new THREE.Mesh(new THREE.BoxGeometry(WIN_W + frameThick * 2, frameThick, frameDepth), frameMat);
        fBot.position.set(WIN_CENTER_X, winBottom - frameThick / 2, BACK_WALL_Z); scene.add(fBot);

        const fLeft = new THREE.Mesh(new THREE.BoxGeometry(frameThick, WIN_H, frameDepth), frameMat);
        fLeft.position.set(winLeft - frameThick / 2, WIN_CENTER_Y, BACK_WALL_Z); scene.add(fLeft);

        const fRight = new THREE.Mesh(new THREE.BoxGeometry(frameThick, WIN_H, frameDepth), frameMat);
        fRight.position.set(winRight + frameThick / 2, WIN_CENTER_Y, BACK_WALL_Z); scene.add(fRight);

        // Hojas de ventana interactivas (Cristal transparente con depthWrite: false para que jamás recorte el cielo ni las montañas de noche)
        const sashW = (WIN_W - 0.04) / 2;
        const glassMat = new THREE.MeshBasicMaterial({ 
            color: 0xddf0ff, 
            transparent: true, 
            opacity: 0.02, 
            side: THREE.DoubleSide,
            depthWrite: false,
            depthTest: true
        });

        windowSashLeft = new THREE.Group();
        windowSashLeft.position.set(winLeft, WIN_CENTER_Y, BACK_WALL_Z);
        const slMesh = new THREE.Mesh(new THREE.PlaneGeometry(sashW, WIN_H - 0.04), glassMat);
        slMesh.position.set(sashW / 2, 0, 0.01);
        slMesh.renderOrder = 10;
        windowSashLeft.add(slMesh);
        scene.add(windowSashLeft);
        interactables.push(slMesh);
        slMesh.userData = { type: 'window' };

        windowSashRight = new THREE.Group();
        windowSashRight.position.set(winRight, WIN_CENTER_Y, BACK_WALL_Z);
        const srMesh = new THREE.Mesh(new THREE.PlaneGeometry(sashW, WIN_H - 0.04), glassMat);
        srMesh.position.set(-sashW / 2, 0, 0.01);
        srMesh.renderOrder = 10;
        windowSashRight.add(srMesh);
        scene.add(windowSashRight);
        interactables.push(srMesh);
        srMesh.userData = { type: 'window' };

        // Cortinas
        const curtainMat = new THREE.MeshLambertMaterial({ color: 0x3b5998, side: THREE.DoubleSide });
        curtainLeft = new THREE.Mesh(new THREE.PlaneGeometry(0.35, WIN_H + 0.2), curtainMat);
        curtainLeft.position.set(winLeft - 0.12, WIN_CENTER_Y - 0.05, BACK_WALL_Z + 0.06);
        scene.add(curtainLeft);

        curtainRight = new THREE.Mesh(new THREE.PlaneGeometry(0.35, WIN_H + 0.2), curtainMat);
        curtainRight.position.set(winRight + 0.12, WIN_CENTER_Y - 0.05, BACK_WALL_Z + 0.06);
        scene.add(curtainRight);
    }

    // ========================================================
    // PARED FRONTAL CON PUERTA Y PASILLO RESIDENCIAL 90s COMPLETO
    // ========================================================
    function buildWallWithDoor(woodMat) {
        const doorW = 0.95, doorH = 2.1;
        const doorX = DOOR_X;

        const wLeft = createSeamlessWallMesh(HALF_W + doorX - doorW / 2, ROOM_H, (-HALF_W + (doorX - doorW / 2)) / 2, ROOM_H / 2, FRONT_WALL_Z, Math.PI, 0, 0);
        scene.add(wLeft);

        const wRight = createSeamlessWallMesh(HALF_W - (doorX + doorW / 2), ROOM_H, (HALF_W + (doorX + doorW / 2)) / 2, ROOM_H / 2, FRONT_WALL_Z, Math.PI, 0, 0);
        scene.add(wRight);

        const wTop = createSeamlessWallMesh(doorW, ROOM_H - doorH, doorX, doorH + (ROOM_H - doorH) / 2, FRONT_WALL_Z, Math.PI, 0, doorH);
        scene.add(wTop);

        const fm = new THREE.MeshLambertMaterial({ color: 0x2d180a });
        const fLeft = new THREE.Mesh(new THREE.BoxGeometry(0.06, doorH, 0.12), fm);
        fLeft.position.set(doorX - doorW / 2 - 0.03, doorH / 2, FRONT_WALL_Z); scene.add(fLeft);

        const fRight = new THREE.Mesh(new THREE.BoxGeometry(0.06, doorH, 0.12), fm);
        fRight.position.set(doorX + doorW / 2 + 0.03, doorH / 2, FRONT_WALL_Z); scene.add(fRight);

        const fTop = new THREE.Mesh(new THREE.BoxGeometry(doorW + 0.12, 0.06, 0.12), fm);
        fTop.position.set(doorX, doorH + 0.03, FRONT_WALL_Z); scene.add(fTop);

        // Jambas interiores del vano de la puerta para que el hueco sea 100% sólido
        const jambL = new THREE.Mesh(new THREE.BoxGeometry(0.02, doorH, 0.10), fm);
        jambL.position.set(doorX - doorW / 2 + 0.01, doorH / 2, FRONT_WALL_Z); scene.add(jambL);

        const jambR = new THREE.Mesh(new THREE.BoxGeometry(0.02, doorH, 0.10), fm);
        jambR.position.set(doorX + doorW / 2 - 0.01, doorH / 2, FRONT_WALL_Z); scene.add(jambR);

        const jambT = new THREE.Mesh(new THREE.BoxGeometry(doorW, 0.02, 0.10), fm);
        jambT.position.set(doorX, doorH - 0.01, FRONT_WALL_Z); scene.add(jambT);

        doorPivot = new THREE.Group();
        doorPivot.position.set(doorX - doorW / 2, 0, FRONT_WALL_Z);

        doorMesh = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, 0.05), woodMat);
        doorMesh.position.set(doorW / 2, doorH / 2, 0);
        doorPivot.add(doorMesh);

        const handleMat = new THREE.MeshLambertMaterial({ color: 0xd4af37 });
        doorHandleMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 8), handleMat);
        doorHandleMesh.rotation.z = Math.PI / 2;
        doorHandleMesh.position.set(doorW - 0.1, 1.0, -0.04);
        doorPivot.add(doorHandleMesh);

        scene.add(doorPivot);
        interactables.push(doorMesh);
        doorMesh.userData = { type: 'door' };

        // Retornos limpios que enmarcan la jamba de la puerta hacia el pasillo
        const hallRetMat = new THREE.MeshLambertMaterial({ color: 0x423830, side: THREE.DoubleSide });
        const hallRetTop = new THREE.Mesh(new THREE.PlaneGeometry(doorW, ROOM_H - doorH), hallRetMat);
        hallRetTop.position.set(doorX, doorH + (ROOM_H - doorH) / 2, FRONT_WALL_Z + 0.005);
        scene.add(hallRetTop);

        // 7. Silueta Humanoid Detallada (visible en evento de amenaza)
        const silMat = new THREE.MeshBasicMaterial({ color: 0x020408 });
        const silDarkMat = new THREE.MeshBasicMaterial({ color: 0x010204 });
        const silEyeMat = new THREE.MeshBasicMaterial({ color: 0xff0022 });
        hallwaySilhouette = new THREE.Group();

        // Piernas alargadas y delgadas
        const silLegL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.0, 0.1), silMat);
        silLegL.position.set(-0.08, 0.5, 0); hallwaySilhouette.add(silLegL);
        const silLegR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.0, 0.1), silMat);
        silLegR.position.set(0.08, 0.5, 0); hallwaySilhouette.add(silLegR);

        // Pies oscuros
        const silFootL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.18), silDarkMat);
        silFootL.position.set(-0.08, 0.025, 0.04); hallwaySilhouette.add(silFootL);
        const silFootR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.18), silDarkMat);
        silFootR.position.set(0.08, 0.025, 0.04); hallwaySilhouette.add(silFootR);

        // Torso delgado y ligeramente encorvado
        const silTorso = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.7, 0.16), silMat);
        silTorso.position.set(0, 1.35, 0);
        silTorso.rotation.x = 0.08; // Ligeramente inclinado hacia adelante
        hallwaySilhouette.add(silTorso);

        // Hombros anchos y angulosos
        const silShoulders = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.14), silDarkMat);
        silShoulders.position.set(0, 1.68, 0); hallwaySilhouette.add(silShoulders);

        // Brazos esqueléticos largos (casi hasta las rodillas)
        const silArmL = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.9, 0.07), silMat);
        silArmL.position.set(-0.28, 1.2, 0);
        silArmL.rotation.z = 0.06; // Ligeramente separado
        hallwaySilhouette.add(silArmL);
        const silArmR = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.9, 0.07), silMat);
        silArmR.position.set(0.28, 1.2, 0);
        silArmR.rotation.z = -0.06;
        hallwaySilhouette.add(silArmR);

        // Manos con dedos largos
        const silHandL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.04), silDarkMat);
        silHandL.position.set(-0.3, 0.72, 0); hallwaySilhouette.add(silHandL);
        const silHandR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.04), silDarkMat);
        silHandR.position.set(0.3, 0.72, 0); hallwaySilhouette.add(silHandR);
        // Dedos
        [-0.34, -0.3, -0.26].forEach(fx => {
            const f = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.1, 0.02), silDarkMat);
            f.position.set(fx, 0.6, 0); hallwaySilhouette.add(f);
        });
        [0.26, 0.3, 0.34].forEach(fx => {
            const f = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.1, 0.02), silDarkMat);
            f.position.set(fx, 0.6, 0); hallwaySilhouette.add(f);
        });

        // Cuello fino
        const silNeck = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.08), silMat);
        silNeck.position.set(0, 1.74, 0); hallwaySilhouette.add(silNeck);

        // Cabeza ovalada, ligeramente inclinada
        const silHead = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), silMat);
        silHead.position.set(0, 1.92, 0);
        silHead.scale.set(1.0, 1.2, 0.9); // Cráneo ovalado alargado
        hallwaySilhouette.add(silHead);

        // Ojos rojos brillantes
        const silEyeL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.025, 0.02), silEyeMat);
        silEyeL.position.set(-0.055, 1.93, 0.14); hallwaySilhouette.add(silEyeL);
        const silEyeR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.025, 0.02), silEyeMat);
        silEyeR.position.set(0.055, 1.93, 0.14); hallwaySilhouette.add(silEyeR);

        // Boca abierta oscura (hendidura)
        const silMouth = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.02), silDarkMat);
        silMouth.position.set(0, 1.85, 0.14); hallwaySilhouette.add(silMouth);

        hallwaySilhouette.position.set(doorX, 0, FRONT_WALL_Z + 4.2);
        hallwaySilhouette.visible = false;
        scene.add(hallwaySilhouette);
    }

    // ========================================================
    // CAMA INDIVIDUAL INTERACTIVA
    // ========================================================
    function buildSingleBed(blanketTex, woodMat) {
        const bx = HALF_W - 0.55;
        const bz = 1.91;

        const frame = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.28, 1.9), woodMat);
        frame.position.set(bx, 0.14, bz); scene.add(frame);
        bedFrameMesh = frame;

        const headboard = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.85, 0.08), woodMat);
        headboard.position.set(bx, 0.45, bz + 0.95); scene.add(headboard);

        const mattressMat = new THREE.MeshLambertMaterial({ map: blanketTex, side: THREE.DoubleSide });
        const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.24, 1.75), mattressMat);
        mattress.position.set(bx, 0.36, bz); scene.add(mattress);
        bedMattressMesh = mattress;
        interactables.push(mattress);
        mattress.userData = { type: 'bed' };

        const pillowMat = new THREE.MeshLambertMaterial({ color: 0xf5f7fa, side: THREE.DoubleSide });
        const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.12, 0.4), pillowMat);
        pillow.position.set(bx, 0.52, bz + 0.65); scene.add(pillow);
        bedPillowMesh = pillow;
        interactables.push(pillow);
        pillow.userData = { type: 'bed' };
    }

    // ========================================================
    // MESA DE NOCHE CON BOOMBOX, TELÉFONO Y LÁMPARA
    // ========================================================
    function buildNightstand(woodMat) {
        const nx = 1.48, nz = 2.45;
        const ns = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.48, 0.46), woodMat);
        ns.position.set(nx, 0.24, nz); scene.add(ns);

        // Lámpara de mesa en la esquina trasera izquierda (dimensiones estilizadas para no tocar ningún otro objeto)
        const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.065, 0.14, 8), new THREE.MeshLambertMaterial({ color: 0xd4af37 }));
        lampBase.position.set(nx - 0.14, 0.55, nz + 0.06); scene.add(lampBase);
        lampBaseMesh = lampBase; interactables.push(lampBase);
        lampBase.userData = { type: 'lamp' };

        const shadeMat = new THREE.MeshLambertMaterial({ color: 0xffaa44, emissive: 0xff8822, emissiveIntensity: 0.8 });
        const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.105, 0.15, 8), shadeMat);
        shade.position.set(nx - 0.14, 0.705, nz + 0.06); scene.add(shade);
        lampShadeMesh = shade; interactables.push(shade);
        shade.userData = { type: 'lamp' };

        nightstandLight = new THREE.PointLight(0xffaa44, 1.8, 5.0);
        nightstandLight.position.set(nx - 0.14, 0.705, nz + 0.06); scene.add(nightstandLight);

        // Reloj despertador digital LED rojo en la esquina trasera derecha
        const clockTex = initAlarmClockCanvas();
        const clockBox = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.06), new THREE.MeshLambertMaterial({ color: 0x111111 }));
        clockBox.position.set(nx + 0.14, 0.52, nz + 0.11); scene.add(clockBox);

        const clockFace = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.065), new THREE.MeshBasicMaterial({ map: clockTex }));
        clockFace.position.set(nx + 0.14, 0.52, nz + 0.079); clockFace.rotation.y = Math.PI;
        scene.add(clockFace);

        // Boombox FM en el sector delantero izquierdo (totalmente separado de la lámpara)
        buildBoombox(nx - 0.13, 0.48, nz - 0.11);
        // Teléfono vintage 90s en el sector delantero derecho, bien visible y orientado hacia el cuarto
        buildPhone(nx + 0.13, 0.48, nz - 0.10);
    }

    function buildBoombox(x, y, z) {
        boomboxGroup = new THREE.Group();
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0x22262c });
        const meshMat = new THREE.MeshLambertMaterial({ color: 0x111111 });

        const body = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.10, 0.07), bodyMat);
        body.position.set(0, 0.05, 0); boomboxGroup.add(body);

        const sp1 = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.008, 10), meshMat);
        sp1.rotation.x = Math.PI / 2; sp1.position.set(-0.055, 0.05, -0.036); boomboxGroup.add(sp1);
        const sp2 = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.008, 10), meshMat);
        sp2.rotation.x = Math.PI / 2; sp2.position.set(0.055, 0.05, -0.036); boomboxGroup.add(sp2);

        const cassDoor = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.038), new THREE.MeshBasicMaterial({ color: 0x223344, transparent: true, opacity: 0.7 }));
        cassDoor.position.set(0, 0.048, -0.037); cassDoor.rotation.y = Math.PI; boomboxGroup.add(cassDoor);

        const reelMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        boomboxReel1 = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.003, 6), reelMat);
        boomboxReel1.rotation.x = Math.PI / 2; boomboxReel1.position.set(-0.012, 0.048, -0.035); boomboxGroup.add(boomboxReel1);

        boomboxReel2 = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.003, 6), reelMat);
        boomboxReel2.rotation.x = Math.PI / 2; boomboxReel2.position.set(0.012, 0.048, -0.035); boomboxGroup.add(boomboxReel2);

        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.012, 0.012), bodyMat);
        handle.position.set(0, 0.115, 0); boomboxGroup.add(handle);

        boomboxLeds = [];
        for (let l = 0; l < 4; l++) {
            const led = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.005, 0.003), new THREE.MeshBasicMaterial({ color: l < 3 ? 0x00ff66 : 0xff2222 }));
            led.position.set(-0.012 + l * 0.008, 0.08, -0.036);
            boomboxGroup.add(led);
            boomboxLeds.push(led);
        }

        boomboxGroup.position.set(x, y, z);
        scene.add(boomboxGroup);
        interactables.push(body);
        body.userData = { type: 'boombox' };
    }

    function buildPhone(x, y, z) {
        phoneGroup = new THREE.Group();
        const beigeMat = new THREE.MeshLambertMaterial({ color: 0xd6ccb6 });
        const darkKeyMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const keyMat = new THREE.MeshLambertMaterial({ color: 0xf0ece1 });

        // Base inclinada del teléfono fijo noventero
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.045, 0.13), beigeMat);
        base.position.set(0, 0.022, 0); phoneGroup.add(base);

        // Panel de teclado numérico (sector derecho de la base)
        const keypadPanel = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.004, 0.075), darkKeyMat);
        keypadPanel.position.set(0.03, 0.046, 0.005); phoneGroup.add(keypadPanel);

        // 12 botones numéricos en matriz 3x4
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 3; col++) {
                const btn = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.005, 0.012), keyMat);
                btn.position.set(0.016 + col * 0.014, 0.049, -0.024 + row * 0.016);
                phoneGroup.add(btn);
            }
        }

        // Cuna / Soporte del auricular (sector izquierdo)
        const cradleL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.012, 0.018), beigeMat);
        cradleL.position.set(-0.038, 0.048, -0.038); phoneGroup.add(cradleL);
        const cradleR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.012, 0.018), beigeMat);
        cradleR.position.set(-0.038, 0.048, 0.038); phoneGroup.add(cradleR);

        // Tubo / Auricular con mango y bocinas
        phoneHandset = new THREE.Group();
        const grip = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 0.085), beigeMat);
        grip.position.set(0, 0.012, 0); phoneHandset.add(grip);

        const earpiece = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.022, 0.036), beigeMat);
        earpiece.position.set(0, 0.008, -0.055); phoneHandset.add(earpiece);

        const mouthpiece = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.022, 0.036), beigeMat);
        mouthpiece.position.set(0, 0.008, 0.055); phoneHandset.add(mouthpiece);

        phoneHandset.position.set(-0.038, 0.048, 0);
        phoneGroup.add(phoneHandset);

        // Cable enrulado de espiral
        phoneCord = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.004, 4, 10), new THREE.MeshLambertMaterial({ color: 0x333333 }));
        phoneCord.rotation.x = Math.PI / 2;
        phoneCord.position.set(-0.038, 0.03, 0.08); phoneGroup.add(phoneCord);

        phoneGroup.position.set(x, y, z);
        phoneGroup.rotation.y = -0.15; // Orientado ligeramente hacia la habitación
        scene.add(phoneGroup);

        interactables.push(base);
        interactables.push(grip);
        base.userData = { type: 'phone' };
        grip.userData = { type: 'phone' };
    }

    // ========================================================
    // TV CRT 14" ORIENTADA HACIA EL JUGADOR / CENTRO DEL CUARTO
    // ========================================================
    function buildTVWithVHS(woodMat) {
        const tvX = -HALF_W + 0.65, tvZ = FRONT_WALL_Z - 0.7;

        // Mueble de TV noventero de 2 niveles (con repisa inferior para VHS)
        const standTop = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.04, 0.62), woodMat);
        standTop.position.set(tvX, 0.58, tvZ); scene.add(standTop);

        const standShelf = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.03, 0.58), woodMat);
        standShelf.position.set(tvX, 0.24, tvZ); scene.add(standShelf);

        const standBase = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.04, 0.62), woodMat);
        standBase.position.set(tvX, 0.04, tvZ); scene.add(standBase);

        const legL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.54, 0.58), woodMat);
        legL.position.set(tvX - 0.36, 0.30, tvZ); scene.add(legL);

        const legR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.54, 0.58), woodMat);
        legR.position.set(tvX + 0.36, 0.30, tvZ); scene.add(legR);

        tvGroup = new THREE.Group();
        const tvCaseMat = new THREE.MeshLambertMaterial({ color: 0x1c1e22 });

        const tvBody = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.44, 0.42), tvCaseMat);
        tvBody.position.set(0, 0.22, 0); tvGroup.add(tvBody);

        const screenTex = initTVScreenCanvas();
        const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });
        tvScreenMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.28), screenMat);
        tvScreenMesh.position.set(0, 0.22, 0.212);
        tvGroup.add(tvScreenMesh);

        const vhsBody = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.08, 0.36), new THREE.MeshLambertMaterial({ color: 0x111111 }));
        vhsBody.position.set(0, -0.04, 0); tvGroup.add(vhsBody);

        const slot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.025, 0.02), new THREE.MeshLambertMaterial({ color: 0x333333 }));
        slot.position.set(0, -0.03, 0.181); tvGroup.add(slot);

        tvStandbyLed = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.01, 0.005), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
        tvStandbyLed.position.set(0.2, 0.06, 0.212); tvGroup.add(tvStandbyLed);

        tvGroup.position.set(tvX, 0.60, tvZ);
        tvGroup.lookAt(0, 0.75, 0);
        scene.add(tvGroup);

        interactables.push(tvBody);
        tvBody.userData = { type: 'tv' };
    }

    // ========================================================
    // CONSOLA PS1 EN EL ESTANTE
    // ========================================================
    function buildPS1Console(shelfX, shelfY, shelfZ) {
        ps1ConsoleGroup = new THREE.Group();
        const greyMat = new THREE.MeshLambertMaterial({ color: 0x8f9399 });

        const body = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.05, 0.2), greyMat);
        body.position.set(0, 0.025, 0); ps1ConsoleGroup.add(body);

        const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.005, 12), new THREE.MeshLambertMaterial({ color: 0x7e8288 }));
        lid.position.set(0, 0.053, 0); ps1ConsoleGroup.add(lid);

        const pBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.006, 8), greyMat);
        pBtn.position.set(-0.09, 0.053, 0.06); ps1ConsoleGroup.add(pBtn);

        ps1Led = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.008, 0.004), new THREE.MeshBasicMaterial({ color: 0x00ff88 }));
        ps1Led.position.set(-0.09, 0.056, 0.08); ps1ConsoleGroup.add(ps1Led);

        const joy = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.07), greyMat);
        joy.position.set(0.2, 0.015, 0.02); ps1ConsoleGroup.add(joy);

        ps1ConsoleGroup.position.set(shelfX - 0.2, shelfY + 0.02, shelfZ);
        scene.add(ps1ConsoleGroup);

        interactables.push(body);
        body.userData = { type: 'ps1' };
    }

    // ========================================================
    // GATO LOW-POLY 90s
    // ========================================================
    function buildCat() {
        catGroup = new THREE.Group();
        const catMat = new THREE.MeshLambertMaterial({ color: 0xd97724 });

        catBodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.18), catMat);
        catBodyMesh.position.set(0, 0.07, 0); catGroup.add(catBodyMesh);

        catHeadMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), catMat);
        catHeadMesh.position.set(-0.16, 0.12, 0); catGroup.add(catHeadMesh);

        const ear1 = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.05, 4), catMat);
        ear1.position.set(-0.18, 0.2, -0.04); catGroup.add(ear1);
        const ear2 = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.05, 4), catMat);
        ear2.position.set(-0.18, 0.2, 0.04); catGroup.add(ear2);

        catTailMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.04), catMat);
        catTailMesh.position.set(0.2, 0.06, 0.04);
        catTailMesh.rotation.z = -0.3;
        catGroup.add(catTailMesh);

        catGroup.position.set(HALF_W - 0.55, 0.48, 1.4);
        scene.add(catGroup);

        interactables.push(catBodyMesh);
        catBodyMesh.userData = { type: 'cat' };
    }

    function updateCatAnimation(dt) {
        if (!catGroup) return;
        catAnimTime += dt;
        const breath = Math.sin(catAnimTime * 2.0) * 0.015;
        if (catBodyMesh) catBodyMesh.scale.set(1.0 + breath, 1.0 + breath * 1.5, 1.0 + breath);
        if (catTailMesh) catTailMesh.rotation.y = Math.sin(catAnimTime * 1.2) * 0.2;

        if (window.state.threatActive && window.state.catState !== 'scared') {
            window.state.catState = 'scared';
            catGroup.position.set(HALF_W - 0.55, 0.1, 1.4);
        } else if (!window.state.threatActive && window.state.catState === 'scared') {
            window.state.catState = 'sleeping';
            catGroup.position.set(HALF_W - 0.55, 0.48, 1.4);
        }
    }

    // ========================================================
    // ESPEJO EN LA PARED CON REFLEJO REAL DEL JUGADOR
    // ========================================================
    function buildWallMirror() {
        const mirrorW = 0.8, mirrorH = 1.2;
        const frameMat = new THREE.MeshLambertMaterial({ color: 0x8b6508 });
        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.04, mirrorH + 0.1, mirrorW + 0.1), frameMat);
        frame.position.set(-HALF_W + 0.02, 1.5, -0.9); scene.add(frame);

        const mTex = initMirrorCanvas();
        const glassMat = new THREE.MeshLambertMaterial({ map: mTex, side: THREE.DoubleSide });
        mirrorMesh = new THREE.Mesh(new THREE.PlaneGeometry(mirrorW, mirrorH), glassMat);
        mirrorMesh.rotation.y = Math.PI / 2;
        mirrorMesh.position.set(-HALF_W + 0.045, 1.5, -0.9);
        scene.add(mirrorMesh);
        // Nota: No agregamos el espejo a 'interactables' para no mostrar carteles de 'Presionar E'
    }

    // ========================================================
    // OBJETOS DECORATIVOS 90s (SIN LA PALA/GUITARRA)
    // ========================================================
    function buildDecorativeObjects(woodMat) {
        const dx = -1.2, dz = BACK_WALL_Z + 1.1;

        // 1. Walkman con auriculares naranjas en el escritorio
        const wmBody = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.025, 0.13), new THREE.MeshLambertMaterial({ color: 0x2244aa }));
        wmBody.position.set(dx + 0.55, 0.765, dz + 0.2); scene.add(wmBody);

        const foamMat = new THREE.MeshLambertMaterial({ color: 0xff6600 });
        const hp1 = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.015, 8), foamMat);
        hp1.position.set(dx + 0.62, 0.765, dz + 0.12); scene.add(hp1);

        // 2. Pila de cintas VHS en el estante inferior del mueble de TV (sin atravesar la TV)
        const tvX = -HALF_W + 0.65, tvZ = FRONT_WALL_Z - 0.7;
        const vhsColors = [0x992222, 0x226699, 0x228833, 0x887722];
        vhsColors.forEach((col, idx) => {
            const vhs = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.03, 0.11), new THREE.MeshLambertMaterial({ color: col }));
            vhs.position.set(tvX - 0.12, 0.26 + idx * 0.032, tvZ + 0.05);
            vhs.rotation.y = (idx * 0.08);
            scene.add(vhs);
        });

        // 3. Lata de soda en el escritorio
        const soda = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.09, 8), new THREE.MeshLambertMaterial({ color: 0xcc1122 }));
        soda.position.set(dx - 0.72, 0.795, dz + 0.05); scene.add(soda);

        // 4. Pelota de básquet en la esquina
        const ball = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), new THREE.MeshLambertMaterial({ color: 0xd95a14 }));
        ball.position.set(-HALF_W + 0.3, 0.14, FRONT_WALL_Z - 0.3); scene.add(ball);

        // 5. Calendario de pared 1998
        const calTex = makePixelTexture(32, 40, (ctx, w, h) => {
            ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#cc0000'; ctx.fillRect(0, 0, w, 10);
            ctx.fillStyle = '#ffffff'; ctx.font = 'bold 7px monospace'; ctx.fillText('1998', 4, 8);
            ctx.fillStyle = '#225588'; ctx.fillRect(4, 12, w - 8, 14);
            ctx.fillStyle = '#333333';
            for (let y = 28; y < h - 2; y += 3) {
                for (let x = 4; x < w - 4; x += 4) ctx.fillRect(x, y, 2, 2);
            }
        });
        const cal = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.45), new THREE.MeshBasicMaterial({ map: calTex, side: THREE.DoubleSide }));
        cal.position.set(HALF_W - 0.02, 1.8, -0.4); cal.rotation.y = -Math.PI / 2; scene.add(cal);

        // 6. CDs sueltos reflectivos
        const cdMat = new THREE.MeshStandardMaterial({ color: 0xddeeff, metalness: 0.9, roughness: 0.1 });
        const cd1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.002, 12), cdMat);
        cd1.position.set(dx + 0.42, 0.755, dz - 0.22); scene.add(cd1);
    }

    // ========================================================
    // SISTEMA DE LINTERNA 3D Y GESTIÓN DE INVENTARIO
    // ========================================================
    function buildDeskFlashlight() {
        if (hasFlashlight) return;
        const dx = -1.2, dz = BACK_WALL_Z + 1.1;

        const flGroup = new THREE.Group();
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0xe6a117 }); // Amarillo industrial 90s
        const gripMat = new THREE.MeshLambertMaterial({ color: 0x181818 }); // Goma negra estriada
        const chromeMat = new THREE.MeshLambertMaterial({ color: 0xdde4eb });
        const glassMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 });

        // Cuerpo cilíndrico
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.18, 10), bodyMat);
        body.rotation.x = Math.PI / 2;
        flGroup.add(body);

        // Anillos de goma antideslizante
        for (let i = -2; i <= 2; i++) {
            const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.023, 0.023, 0.012, 10), gripMat);
            ring.rotation.x = Math.PI / 2;
            ring.position.z = i * 0.024;
            flGroup.add(ring);
        }

        // Cabeza cónica reflectora
        const head = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.024, 0.06, 10), bodyMat);
        head.rotation.x = Math.PI / 2;
        head.position.z = 0.11;
        flGroup.add(head);

        // Bisel cromado
        const bezel = new THREE.Mesh(new THREE.CylinderGeometry(0.039, 0.039, 0.012, 10), chromeMat);
        bezel.rotation.x = Math.PI / 2;
        bezel.position.z = 0.142;
        flGroup.add(bezel);

        // Lente de cristal frontal
        const lens = new THREE.Mesh(new THREE.CircleGeometry(0.036, 10), glassMat);
        lens.position.z = 0.148;
        flGroup.add(lens);

        // Interruptor rojo
        const sw = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.008, 0.022), new THREE.MeshLambertMaterial({ color: 0xcc2222 }));
        sw.position.set(0, 0.024, 0.02);
        flGroup.add(sw);

        // Ubicada de forma clara y visible sobre el lado derecho del escritorio (junto al teclado y mouse)
        flGroup.position.set(dx + 0.55, 0.768, dz + 0.20);
        flGroup.rotation.y = -0.45;
        scene.add(flGroup);

        deskFlashlightMesh = flGroup;
        interactables.push(body);
        interactables.push(head);
        interactables.push(bezel);
        body.userData = { type: 'flashlight_item' };
        head.userData = { type: 'flashlight_item' };
        bezel.userData = { type: 'flashlight_item' };
    }

    function setupFlashlightSystem() {
        if (!camera) return;
        if (scene && !camera.parent) {
            scene.add(camera);
        }

        if (!flashlightSpotLight) {
            flashlightSpotLight = new THREE.SpotLight(0xfffae0, 3.2, 28, Math.PI / 5.0, 0.45, 1.1);
            flashlightSpotLight.position.set(0.26, -0.22, -0.15);
            camera.add(flashlightSpotLight);

            const targetObj = new THREE.Object3D();
            targetObj.position.set(0.12, -0.05, -12);
            camera.add(targetObj);
            flashlightSpotLight.target = targetObj;
        }

        if (!heldFlashlightGroup) {
            heldFlashlightGroup = new THREE.Group();
            const bodyMat = new THREE.MeshLambertMaterial({ color: 0xe6a117 });
            const gripMat = new THREE.MeshLambertMaterial({ color: 0x181818 });
            const chromeMat = new THREE.MeshLambertMaterial({ color: 0xdde4eb });
            const glassMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

            const body = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.16, 8), bodyMat);
            body.rotation.x = Math.PI / 2; heldFlashlightGroup.add(body);

            const head = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.020, 0.05, 8), bodyMat);
            head.rotation.x = Math.PI / 2; head.position.z = 0.095; heldFlashlightGroup.add(head);

            const bezel = new THREE.Mesh(new THREE.CylinderGeometry(0.033, 0.033, 0.01, 8), chromeMat);
            bezel.rotation.x = Math.PI / 2; bezel.position.z = 0.122; heldFlashlightGroup.add(bezel);

            const lens = new THREE.Mesh(new THREE.CircleGeometry(0.031, 8), glassMat);
            lens.position.z = 0.127; heldFlashlightGroup.add(lens);

            heldFlashlightGroup.position.set(0.26, -0.22, -0.32);
            heldFlashlightGroup.rotation.y = -0.05;
            camera.add(heldFlashlightGroup);
        }
    }

    function pickupFlashlight() {
        if (hasFlashlight) return;
        hasFlashlight = true;
        isFlashlightOn = true;
        if (window.state) {
            if (!window.state.inventory) window.state.inventory = [];
            if (!window.state.inventory.includes('flashlight')) window.state.inventory.push('flashlight');
        }

        if (deskFlashlightMesh) {
            scene.remove(deskFlashlightMesh);
            interactables = interactables.filter(obj => !obj.userData || obj.userData.type !== 'flashlight_item');
            deskFlashlightMesh = null;
        }

        setupFlashlightSystem();
        if (flashlightSpotLight) flashlightSpotLight.intensity = 3.2;
        if (heldFlashlightGroup) heldFlashlightGroup.visible = true;

        if (window.RoomInteractions && typeof window.RoomInteractions.playRetroClick === 'function') {
            window.RoomInteractions.playRetroClick(0.9);
        }

        updateInventoryHUD();

        const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;
        if (window.RoomInteractions && typeof window.RoomInteractions.showNotificationPrompt === 'function') {
            window.RoomInteractions.showNotificationPrompt(
                tFn("notif_flashlight_acquired", "[ 🔦 LINTERNA RECOGIDA — PRESIONA F PARA ENCENDER/APAGAR ]")
            );
        }
    }

    function toggleFlashlight() {
        if (!hasFlashlight) {
            toggleRoomLamp();
            return;
        }
        isFlashlightOn = !isFlashlightOn;
        if (flashlightSpotLight) {
            flashlightSpotLight.intensity = isFlashlightOn ? 3.2 : 0.0;
        }
        if (heldFlashlightGroup) {
            heldFlashlightGroup.visible = isFlashlightOn;
        }
        if (window.RoomInteractions && typeof window.RoomInteractions.playRetroClick === 'function') {
            window.RoomInteractions.playRetroClick(0.85);
        }
        updateInventoryHUD();
    }

    function updateInventoryHUD() {
        let bar = document.getElementById('ps1-inventory-bar');
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'ps1-inventory-bar';
            bar.className = 'ps1-inventory-bar';
            const ps1Screen = document.getElementById('screen-ps1-intro');
            if (ps1Screen) ps1Screen.appendChild(bar);
        }
        const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;
        if (hasFlashlight) {
            bar.innerHTML = `
                <div class="inv-slot active" id="inv-slot-flashlight" title="${tFn('inv_flashlight_hint', 'Linterna [F]')}">
                    <span class="inv-icon">🔦</span>
                    <span class="inv-key">F</span>
                    <span class="inv-status ${isFlashlightOn ? 'on' : 'off'}">${isFlashlightOn ? 'ON' : 'OFF'}</span>
                </div>
            `;
            bar.style.display = (isRunning && !isMonitorMode && !isIntroCinematic) ? 'flex' : 'none';
        } else {
            bar.style.display = 'none';
        }
    }

    // ========================================================
    // SISTEMA DE APAGÓN POR TORMENTA Y DISYUNTOR DEL SÓTANO
    // ========================================================
    function triggerBlackout() {
        if (!window.state) window.state = {};
        if (window.state.powerOutage) return;
        window.state.powerOutage = true;

        // Apagar toda la iluminación de la casa
        if (ceilingLightObj) ceilingLightObj.intensity = 0.0;
        if (deskLampLight) deskLampLight.intensity = 0.0;
        if (nightstandLight) nightstandLight.intensity = 0.0;
        if (hallwayLight) hallwayLight.intensity = 0.0;
        if (livingLight) livingLight.intensity = 0.0;
        if (kitchenLight) kitchenLight.intensity = 0.0;
        if (basementLight) basementLight.intensity = 0.0;
        if (upperBathLight) upperBathLight.intensity = 0.0;
        if (groundBathLight) groundBathLight.intensity = 0.0;
        if (foyerLight) foyerLight.intensity = 0.0;
        if (fairyPointLight) fairyPointLight.intensity = 0.0;

        // Breaker box LED a rojo y palanca caída
        if (breakerLedMesh && breakerLedMesh.material) {
            breakerLedMesh.material.color.setHex(0xff0022);
        }
        if (breakerHandleMesh) {
            breakerHandleMesh.rotation.z = -0.55;
        }

        // Si el jugador estaba en la PC, levantarlo forzadamente por el corte
        if (isMonitorMode) {
            standUpFromPC();
        }

        if (window.RoomInteractions && typeof window.RoomInteractions.playRetroClick === 'function') {
            window.RoomInteractions.playRetroClick(0.4);
        }

        const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;
        if (window.RoomInteractions && typeof window.RoomInteractions.showNotificationPrompt === 'function') {
            window.RoomInteractions.showNotificationPrompt(
                tFn("blackout_triggered_alert", "[ ⚡ ¡CORTE GENERAL DE LUZ! La tormenta disparó los plomos. Ve al sótano a rearmar el disyuntor ]")
            );
        }
    }

    function restorePower() {
        if (!window.state) window.state = {};
        window.state.powerOutage = false;

        // Restaurar iluminación de toda la casa
        if (ceilingLightObj) ceilingLightObj.intensity = isLampOn ? 1.7 : 0.05;
        if (deskLampLight) deskLampLight.intensity = isLampOn ? 2.0 : 0.2;
        if (nightstandLight) nightstandLight.intensity = isLampOn ? 2.5 : 0.0;
        if (hallwayLight) hallwayLight.intensity = 0.85;
        if (livingLight) livingLight.intensity = 1.6;
        if (kitchenLight) kitchenLight.intensity = 1.7;
        if (basementLight) basementLight.intensity = 1.4;
        if (upperBathLight) upperBathLight.intensity = 1.2;
        if (groundBathLight) groundBathLight.intensity = 1.2;
        if (foyerLight) foyerLight.intensity = 1.4;
        if (fairyPointLight) fairyPointLight.intensity = 0.35;

        // Breaker box LED a verde y palanca rearmada
        if (breakerLedMesh && breakerLedMesh.material) {
            breakerLedMesh.material.color.setHex(0x00ff44);
        }
        if (breakerHandleMesh) {
            breakerHandleMesh.rotation.z = 0.55;
        }

        if (window.RoomInteractions && typeof window.RoomInteractions.playRetroClick === 'function') {
            window.RoomInteractions.playRetroClick(1.25);
        }

        const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;
        if (window.RoomInteractions && typeof window.RoomInteractions.showNotificationPrompt === 'function') {
            window.RoomInteractions.showNotificationPrompt(
                tFn("blackout_restored_alert", "[ 💡 ENERGÍA RESTABLECIDA: Toda la red eléctrica de la casa vuelve a funcionar ]")
            );
        }
    }

    function toggleBreakerBox() {
        if (window.state && window.state.powerOutage) {
            restorePower();
        } else {
            triggerBlackout();
        }
    }

    // ========================================================
    // CÁLCULO DINÁMICO DE ALTURA DEL SUELO (ESCALERAS Y 3 PLANTAS)
    // ========================================================
    function getFloorHeight(x, z, currentFeetY = null) {
        const fy = (currentFeetY !== null) ? currentFeetY : (playerPos.y - PLAYER_HEIGHT);

        // 1. SECTOR PLANTA ALTA (Nivel superior Y = 0.0)
        // Todo z <= 6.2 con fy > -1.9 pertenece estrictamente a Planta Alta (dormitorio, pasillo, baño y descansillo superior)
        // Esto sella completamente el piso impidiendo cualquier caída o teletransporte hacia Planta Baja o Sótano
        if (fy > -1.9 && z <= 6.2) {
            return 0.0;
        }

        // 2. ESCALERA PRINCIPAL ENTRE PLANTA BAJA Y PLANTA ALTA (z: [6.2, 9.4], |x| <= 0.85)
        // Descenso continuo desde Y = 0.0 en z = 6.2 hasta Y = -2.8 en z = 9.4
        if (z >= 6.2 && z <= 9.4 && Math.abs(x) <= 0.85) {
            const t = (z - 6.2) / (9.4 - 6.2);
            return 0.0 + (-2.8) * Math.max(0, Math.min(1, t));
        }

        // 3. SECTOR ENTRADA / FOYER DE PLANTA BAJA AL PIE DE LA ESCALERA (z > 9.4)
        if (z > 9.4) {
            return -2.8;
        }

        // 4. SECTOR SÓTANO Y ESCALERA AL SÓTANO (fy <= -1.9)
        // 4A. Rampa de escalera al sótano (z: [1.0, 4.5], |x| <= 0.85)
        // Descenso desde Y = -2.8 en z = 4.5 hasta Y = -5.6 en z = 1.0
        if (z >= 1.0 && z <= 4.5 && Math.abs(x) <= 0.85) {
            if (fy < -3.2 || basementDoorOpen || z < 4.4) {
                const t = (4.5 - z) / (4.5 - 1.0);
                return -2.8 + (-2.8) * Math.max(0, Math.min(1, t));
            }
            return -2.8;
        }

        // 4B. Sótano profundo (habitación del sótano Y = -5.6)
        if (fy < -3.5 || (z < 1.0 && fy < -2.2)) {
            return -5.6;
        }

        // 4C. Planta Baja estándar (resto de la planta intermedia: cocina, living, descansillo del sótano)
        return -2.8;
    }

    // Textura auténtica de bloques de hormigón/cemento con mortero para paredes de sótano
    function cinderBlockTexture() {
        return makePixelTexture(64, 64, (ctx, w, h) => {
            ctx.fillStyle = '#444a51';
            ctx.fillRect(0, 0, w, h);
            for (let i = 0; i < 160; i++) {
                const rx = Math.floor(Math.random() * w);
                const ry = Math.floor(Math.random() * h);
                ctx.fillStyle = Math.random() < 0.5 ? '#363b42' : '#575f68';
                ctx.fillRect(rx, ry, (i % 2) + 1, (i % 2) + 1);
            }
            // Hileras de bloques de hormigón (bloques de 32x16 con junta de mortero)
            for (let y = 0; y < h; y += 16) {
                ctx.fillStyle = '#22262a';
                ctx.fillRect(0, y, w, 2);
                ctx.fillStyle = '#626a74';
                ctx.fillRect(0, y + 2, w, 1);

                const isEvenRow = (Math.floor(y / 16) % 2 === 0);
                const startX = isEvenRow ? 0 : 16;
                for (let x = startX; x < w; x += 32) {
                    ctx.fillStyle = '#22262a';
                    ctx.fillRect(x, y, 2, 16);
                    ctx.fillStyle = '#626a74';
                    ctx.fillRect((x + 2) % w, y + 2, 1, 14);
                }
            }
            // Manchas sutiles de humedad vintage
            ctx.fillStyle = 'rgba(24, 28, 32, 0.25)';
            for (let x = 0; x < w; x += 8) {
                ctx.fillRect(x, h - 6 - (x % 5), 6, 6);
            }
        });
    }

    // Textura de losa de hormigón lisa industrial con juntas de dilatación para pisos y techos de sótano
    function concreteFloorTexture() {
        return makePixelTexture(64, 64, (ctx, w, h) => {
            ctx.fillStyle = '#383d44';
            ctx.fillRect(0, 0, w, h);
            for (let i = 0; i < 200; i++) {
                ctx.fillStyle = Math.random() < 0.5 ? '#2b3036' : '#474e57';
                ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
            }
            ctx.fillStyle = '#1e2226';
            ctx.fillRect(0, 31, w, 2);
            ctx.fillRect(31, 0, 2, h);
            ctx.fillStyle = '#505862';
            ctx.fillRect(0, 33, w, 1);
            ctx.fillRect(33, 0, 1, h);
        });
    }

    // ========================================================
    // ARQUITECTURA COMPLETA DE LA CASA (PLANTA ALTA, PLANTA BAJA Y SÓTANO)
    // ========================================================
    function buildFullHouse() {
        if (fullHouseGroup) {
            try { scene.remove(fullHouseGroup); } catch(e) {}
            fullHouseGroup = null;
        }
        fullHouseGroup = new THREE.Group();

        const floorTex = woodFloorTexture(); floorTex.repeat.set(4, 4);
        const tileTex = makePixelTexture(32, 32, (ctx, w, h) => {
            ctx.fillStyle = '#e8ecf2'; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#425b73'; ctx.fillRect(0, 0, 16, 16); ctx.fillRect(16, 16, 16, 16);
            ctx.strokeStyle = '#2b3a4a'; ctx.strokeRect(0, 0, w, h);
        });
        tileTex.repeat.set(6, 6);

        const linoTex = makePixelTexture(32, 32, (ctx, w, h) => {
            ctx.fillStyle = '#dfd6c8'; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#c4b59d'; ctx.fillRect(0, 0, 16, 16); ctx.fillRect(16, 16, 16, 16);
            ctx.strokeStyle = '#aa9c85'; ctx.strokeRect(0, 0, w, h);
        });
        linoTex.repeat.set(6, 6);

        const cinderWallTex = cinderBlockTexture();
        cinderWallTex.repeat.set(4, 2);
        cinderWallTex.wrapS = THREE.RepeatWrapping;
        cinderWallTex.wrapT = THREE.RepeatWrapping;

        const concreteFloorTex = concreteFloorTexture();
        concreteFloorTex.repeat.set(4, 4);
        concreteFloorTex.wrapS = THREE.RepeatWrapping;
        concreteFloorTex.wrapT = THREE.RepeatWrapping;

        // Textura empapelado residencial vintage 90s para paredes de pasillo y planta alta
        const hallWallTex = makePixelTexture(32, 32, (ctx, w, h) => {
            ctx.fillStyle = '#b5a691'; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#a89882';
            for (let y = 0; y < h; y += 4) { ctx.fillRect(0, y, w, 1); }
            ctx.fillStyle = '#c4b59e';
            for (let x = 0; x < w; x += 8) { ctx.fillRect(x, 0, 1, h); }
        });
        hallWallTex.repeat.set(4, 3);
        hallWallTex.wrapS = THREE.RepeatWrapping;
        hallWallTex.wrapT = THREE.RepeatWrapping;

        // Textura revoque cálido noventero para planta baja
        const groundWallTex = makePixelTexture(32, 32, (ctx, w, h) => {
            ctx.fillStyle = '#a39785'; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#948877';
            for (let i = 0; i < 40; i++) {
                ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
            }
        });
        groundWallTex.repeat.set(5, 3);
        groundWallTex.wrapS = THREE.RepeatWrapping;
        groundWallTex.wrapT = THREE.RepeatWrapping;

        // Textura de ladrillos para la chimenea del living
        const brickTex = makePixelTexture(32, 32, (ctx, w, h) => {
            ctx.fillStyle = '#7a2818'; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#5c1b10';
            for (let y = 0; y < h; y += 8) {
                ctx.fillRect(0, y, w, 1);
                const off = (y / 8 % 2 === 0) ? 0 : 8;
                for (let x = 0; x < w; x += 16) {
                    ctx.fillRect(x + off, y, 1, 8);
                }
            }
            ctx.fillStyle = '#8e3522';
            ctx.fillRect(2, 2, 12, 5);
            ctx.fillRect(18, 10, 12, 5);
        });
        brickTex.repeat.set(3, 2);
        brickTex.wrapS = THREE.RepeatWrapping;
        brickTex.wrapT = THREE.RepeatWrapping;

        const woodMat = new THREE.MeshLambertMaterial({ map: furnitureWoodTexture(), side: THREE.DoubleSide });
        const floorMat = new THREE.MeshLambertMaterial({ map: floorTex, side: THREE.DoubleSide });
        const tileMat = new THREE.MeshLambertMaterial({ map: tileTex, side: THREE.DoubleSide });
        const linoMat = new THREE.MeshLambertMaterial({ map: linoTex, side: THREE.DoubleSide });
        const wallMatBasement = new THREE.MeshLambertMaterial({ map: cinderWallTex, side: THREE.DoubleSide });
        const concreteFloorMat = new THREE.MeshLambertMaterial({ map: concreteFloorTex, side: THREE.DoubleSide });
        const concreteMat = concreteFloorMat; // Compatibilidad
        const wallMatUpper = new THREE.MeshLambertMaterial({ map: hallWallTex, side: THREE.DoubleSide });
        const wallMatGround = new THREE.MeshLambertMaterial({ map: groundWallTex, side: THREE.DoubleSide });
        const brickMat = new THREE.MeshLambertMaterial({ map: brickTex, side: THREE.DoubleSide });
        const ceilMatUpper = new THREE.MeshLambertMaterial({ color: 0xd8cec2, side: THREE.DoubleSide });
        const ceilMatGround = new THREE.MeshLambertMaterial({ color: 0xd8cec2, side: THREE.FrontSide });
        const trimMat = new THREE.MeshLambertMaterial({ color: 0x482d1c, side: THREE.DoubleSide });
        const goldBrassMat = new THREE.MeshLambertMaterial({ color: 0xd4af37 });
        const pipeMat = new THREE.MeshLambertMaterial({ color: 0x33383f });

        function makeTessMesh(w, h, mat, segsX = 0, segsY = 0) {
            const sx = segsX || Math.max(4, Math.round(w * 2));
            const sy = segsY || Math.max(4, Math.round(h * 2));
            return new THREE.Mesh(new THREE.PlaneGeometry(w, h, sx, sy), mat);
        }

        // ----------------------------------------------------
        // A. PLANTA ALTA: PASILLO, BAÑO Y ENCERRAMIENTO TOTAL (Y = 0.0 A 2.8)
        // ----------------------------------------------------
        // 1. Suelo del pasillo superior (desde puerta z = 2.9 hasta el borde de la escalera z = 6.0, x: [-0.85, 1.7])
        const upHallFloor = makeTessMesh(2.55, 3.12, floorMat);
        upHallFloor.rotation.x = -Math.PI / 2;
        upHallFloor.position.set(0.425, 0.005, 4.46);
        fullHouseGroup.add(upHallFloor);

        // Alfombra pasillera roja tejida estilo 90s: alineada y centrada simétricamente con el eje de la escalera (x = 0.0)
        const runnerMat = new THREE.MeshLambertMaterial({ color: 0x821c26, side: THREE.DoubleSide });
        const upHallRunner = makeTessMesh(0.9, 3.05, runnerMat, 4, 8);
        upHallRunner.rotation.x = -Math.PI / 2;
        upHallRunner.position.set(0.0, 0.012, 4.475);
        fullHouseGroup.add(upHallRunner);

        // Ramal de conexión de alfombra roja desde la puerta del dormitorio (x = 0.6) hacia el corredor central (x = 0.0)
        const bedDoorRunner = makeTessMesh(0.85, 0.90, runnerMat, 4, 4);
        bedDoorRunner.rotation.x = -Math.PI / 2;
        bedDoorRunner.position.set(0.425, 0.0125, 3.40);
        fullHouseGroup.add(bedDoorRunner);

        // Tabiques frontales (Norte) del pasillo superior en z = 2.91
        // Cierran herméticamente a ambos lados de la puerta del dormitorio
        const wNorthHallL = makeTessMesh(0.975, ROOM_H, wallMatUpper, 4, 6);
        wNorthHallL.position.set(-0.3625, ROOM_H / 2, 2.91);
        fullHouseGroup.add(wNorthHallL);
        const baseNorthHallL = new THREE.Mesh(new THREE.BoxGeometry(0.975, 0.22, 0.04), trimMat);
        baseNorthHallL.position.set(-0.3625, 0.11, 2.93); fullHouseGroup.add(baseNorthHallL);

        const wNorthHallR = makeTessMesh(0.625, ROOM_H, wallMatUpper, 4, 6);
        wNorthHallR.position.set(1.3875, ROOM_H / 2, 2.91);
        fullHouseGroup.add(wNorthHallR);
        const baseNorthHallR = new THREE.Mesh(new THREE.BoxGeometry(0.625, 0.22, 0.04), trimMat);
        baseNorthHallR.position.set(1.3875, 0.11, 2.93); fullHouseGroup.add(baseNorthHallR);

        const wNorthHallTop = makeTessMesh(0.95, ROOM_H - 2.1, wallMatUpper, 4, 2);
        wNorthHallTop.position.set(0.6, 2.1 + (ROOM_H - 2.1) / 2, 2.91);
        fullHouseGroup.add(wNorthHallTop);

        // JAMBAS PERIMETRALES HUECAS DE LA PUERTA DEL DORMITORIO (Libera completamente el vano, erradicando el bloque negro)
        const hfLeft = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.15, 0.05), trimMat);
        hfLeft.position.set(0.6 - 0.95 / 2 - 0.02, 1.075, 2.925);
        fullHouseGroup.add(hfLeft);

        const hfRight = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.15, 0.05), trimMat);
        hfRight.position.set(0.6 + 0.95 / 2 + 0.02, 1.075, 2.925);
        fullHouseGroup.add(hfRight);

        const hfTop = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.06, 0.05), trimMat);
        hfTop.position.set(0.6, 2.15 + 0.02, 2.925);
        fullHouseGroup.add(hfTop);

        // 2. Pared Izquierda (Oeste) CONTINUA del 2do piso: de z = 2.9 a z = 11.2 en x = -0.85 (Longitud 8.3m)
        const upWallWest = makeTessMesh(8.3, ROOM_H, wallMatUpper, 16, 6);
        upWallWest.rotation.y = Math.PI / 2;
        upWallWest.position.set(-0.85, ROOM_H / 2, 7.05);
        fullHouseGroup.add(upWallWest);

        // Zócalos de madera en la pared izquierda divididos antes y después de la puerta en z = 4.3 (no cortan la puerta)
        const baseWest1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.95), trimMat);
        baseWest1.position.set(-0.83, 0.11, 3.375);
        fullHouseGroup.add(baseWest1);

        const baseWest2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 6.45), trimMat);
        baseWest2.position.set(-0.83, 0.11, 7.975);
        fullHouseGroup.add(baseWest2);

        // Puerta decorativa en la pared izquierda del pasillo (Habitación Principal en z = 4.3)
        // Marco perimetral hueco con umbral y tableros en relieve
        const df43L = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.15, 0.05), trimMat);
        df43L.position.set(-0.83, 1.075, 4.3 - 0.45); fullHouseGroup.add(df43L);
        const df43R = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.15, 0.05), trimMat);
        df43R.position.set(-0.83, 1.075, 4.3 + 0.45); fullHouseGroup.add(df43R);
        const df43Top = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.95), trimMat);
        df43Top.position.set(-0.83, 2.15 + 0.025, 4.3); fullHouseGroup.add(df43Top);

        const thresh43 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.015, 0.86), woodMat);
        thresh43.position.set(-0.82, 0.0075, 4.3); fullHouseGroup.add(thresh43);

        const doorLeaf43 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.10, 0.85), woodMat);
        doorLeaf43.position.set(-0.82, 1.05, 4.3); fullHouseGroup.add(doorLeaf43);

        // Molduras clásicas de panel para embellecer doorLeaf43
        const dPan43Top = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.80, 0.34), trimMat);
        dPan43Top.position.set(-0.817, 1.48, 4.3); fullHouseGroup.add(dPan43Top);
        const dPan43Bot = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.70, 0.34), trimMat);
        dPan43Bot.position.set(-0.817, 0.58, 4.3); fullHouseGroup.add(dPan43Bot);

        const dKnob43 = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), goldBrassMat);
        dKnob43.position.set(-0.79, 1.05, 4.3 + 0.3); fullHouseGroup.add(dKnob43);

        // Cuadros decorativos al óleo enmarcados en la pared izquierda del pasillo
        const picMat1 = new THREE.MeshLambertMaterial({ color: 0x8a7258 });
        const picMat2 = new THREE.MeshLambertMaterial({ color: 0x3d5a80 });
        const picMatLandscape = new THREE.MeshLambertMaterial({ color: 0x4a7c59 });

        const pf1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.65, 0.85), trimMat);
        pf1.position.set(-0.83, 1.55, 3.4); fullHouseGroup.add(pf1);
        const p1 = makeTessMesh(0.75, 0.55, picMat1, 2, 2);
        p1.rotation.y = Math.PI / 2; p1.position.set(-0.805, 1.55, 3.4); fullHouseGroup.add(p1);

        // En lugar de la puerta inútil en z = 8.5 sobre el hueco de la escalera, ubicamos un elegante cuadro clásico al óleo
        const pf85 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.85, 1.1), trimMat);
        pf85.position.set(-0.83, 1.6, 8.5); fullHouseGroup.add(pf85);
        const p85 = makeTessMesh(1.0, 0.75, picMatLandscape, 2, 2);
        p85.rotation.y = Math.PI / 2; p85.position.set(-0.805, 1.6, 8.5); fullHouseGroup.add(p85);

        const pf2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.65, 0.85), trimMat);
        pf2.position.set(-0.83, 1.55, 9.8); fullHouseGroup.add(pf2);
        const p2 = makeTessMesh(0.75, 0.55, picMat2, 2, 2);
        p2.rotation.y = Math.PI / 2; p2.position.set(-0.805, 1.55, 9.8); fullHouseGroup.add(p2);

        // Mesa consola clásica en el pasillo superior con jarrón y candelabro
        const consoleTable = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.75, 0.95), woodMat);
        consoleTable.position.set(-0.65, 0.375, 5.25);
        fullHouseGroup.add(consoleTable);

        const vaseMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.05, 0.26, 8), new THREE.MeshLambertMaterial({ color: 0x2b4c7e }));
        vaseMesh.position.set(-0.65, 0.75 + 0.13, 5.4);
        fullHouseGroup.add(vaseMesh);

        const candleHolder = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.15, 8), goldBrassMat);
        candleHolder.position.set(-0.65, 0.75 + 0.075, 5.05);
        fullHouseGroup.add(candleHolder);

        // 3. Baño Superior (x: [1.7, 3.5], z: [2.9, 6.0], y = 0.0)
        const bathW = 1.8, bathD = 3.1;
        const bathCenterX = 2.6, bathCenterZ = 4.45;

        // Azulejos cerámicos claros y limpios para paredes del baño
        const bathWallTex = makePixelTexture(32, 32, (ctx, w, h) => {
            ctx.fillStyle = '#f0f4f8'; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#dbe5ee'; ctx.fillRect(0, 0, 16, 16); ctx.fillRect(16, 16, 16, 16);
            ctx.strokeStyle = '#bcccdc'; ctx.strokeRect(0, 0, w, h);
        });
        bathWallTex.repeat.set(6, 5);
        bathWallTex.wrapS = THREE.RepeatWrapping;
        bathWallTex.wrapT = THREE.RepeatWrapping;
        const bathWallMat = new THREE.MeshLambertMaterial({ map: bathWallTex, side: THREE.DoubleSide });

        const upBathFloor = makeTessMesh(bathW, bathD, tileMat);
        upBathFloor.rotation.x = -Math.PI / 2;
        upBathFloor.position.set(bathCenterX, 0.006, bathCenterZ);
        fullHouseGroup.add(upBathFloor);

        const upBathCeil = makeTessMesh(bathW, bathD, ceilMatUpper);
        upBathCeil.rotation.x = Math.PI / 2;
        upBathCeil.position.set(bathCenterX, ROOM_H, bathCenterZ);
        fullHouseGroup.add(upBathCeil);

        const upBathWallE = makeTessMesh(bathD, ROOM_H, bathWallMat);
        upBathWallE.rotation.y = -Math.PI / 2;
        upBathWallE.position.set(bathCenterX + bathW / 2, ROOM_H / 2, bathCenterZ);
        fullHouseGroup.add(upBathWallE);

        const upBathWallN = makeTessMesh(bathW, ROOM_H, bathWallMat);
        upBathWallN.position.set(bathCenterX, ROOM_H / 2, 2.93);
        fullHouseGroup.add(upBathWallN);

        const upBathWallS = makeTessMesh(bathW, ROOM_H, bathWallMat);
        upBathWallS.position.set(bathCenterX, ROOM_H / 2, 6.0);
        fullHouseGroup.add(upBathWallS);

        // Pared divisoria pasillo / baño en x = 1.7 con vano para puerta en z = 4.3 (cara pasillo)
        const wallW1 = makeTessMesh(0.9, ROOM_H, wallMatUpper);
        wallW1.rotation.y = -Math.PI / 2;
        wallW1.position.set(1.7, ROOM_H / 2, 3.35);
        fullHouseGroup.add(wallW1);

        const wallW2 = makeTessMesh(1.2, ROOM_H, wallMatUpper);
        wallW2.rotation.y = -Math.PI / 2;
        wallW2.position.set(1.7, ROOM_H / 2, 5.4);
        fullHouseGroup.add(wallW2);

        const wallWTop = makeTessMesh(1.0, ROOM_H - 2.12, wallMatUpper, 4, 2);
        wallWTop.rotation.y = -Math.PI / 2;
        wallWTop.position.set(1.7, 2.12 + (ROOM_H - 2.12) / 2, 4.3);
        fullHouseGroup.add(wallWTop);

        // Revestimiento de azulejo en la cara interna del baño de la pared oeste (x = 1.702)
        const inBathWallW1 = makeTessMesh(0.9, ROOM_H, bathWallMat);
        inBathWallW1.rotation.y = Math.PI / 2;
        inBathWallW1.position.set(1.702, ROOM_H / 2, 3.35);
        fullHouseGroup.add(inBathWallW1);

        const inBathWallW2 = makeTessMesh(1.2, ROOM_H, bathWallMat);
        inBathWallW2.rotation.y = Math.PI / 2;
        inBathWallW2.position.set(1.702, ROOM_H / 2, 5.4);
        fullHouseGroup.add(inBathWallW2);

        const inBathWallWTop = makeTessMesh(1.0, ROOM_H - 2.12, bathWallMat, 4, 2);
        inBathWallWTop.rotation.y = Math.PI / 2;
        inBathWallWTop.position.set(1.702, 2.12 + (ROOM_H - 2.12) / 2, 4.3);
        fullHouseGroup.add(inBathWallWTop);

        // Marco perimetral hueco de la puerta del baño superior
        const upDfL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.12, 0.05), trimMat);
        upDfL.position.set(1.7, 1.06, 3.80); fullHouseGroup.add(upDfL);
        const upDfR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.12, 0.05), trimMat);
        upDfR.position.set(1.7, 1.06, 4.80); fullHouseGroup.add(upDfR);
        const upDfTop = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 1.05), trimMat);
        upDfTop.position.set(1.7, 2.12 + 0.025, 4.30); fullHouseGroup.add(upDfTop);

        // Umbral de madera biselado en el vano de la puerta del baño
        const bathThreshold = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.018, 1.00), woodMat);
        bathThreshold.position.set(1.70, 0.009, 4.30);
        fullHouseGroup.add(bathThreshold);

        // Zócalos de madera en la pared del pasillo frente al baño
        const baseBathWall1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.90), trimMat);
        baseBathWall1.position.set(1.68, 0.11, 3.35); fullHouseGroup.add(baseBathWall1);
        const baseBathWall2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 1.20), trimMat);
        baseBathWall2.position.set(1.68, 0.11, 5.40); fullHouseGroup.add(baseBathWall2);

        // Puerta interactiva del baño superior (altura ajustada a 2.13 para sellar perfectamente el vano y eliminar hueco superior)
        bathDoorPivot = new THREE.Group();
        bathDoorPivot.position.set(1.7, 0, 3.82);

        const bathDoorLeaf = new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.13, 0.96), woodMat);
        bathDoorLeaf.position.set(0.02, 1.065, 0.48);
        bathDoorPivot.add(bathDoorLeaf);

        // Molduras de panel para la hoja de la puerta
        const bathP1 = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.84, 0.36), trimMat);
        bathP1.position.set(0.02, 1.52, 0.48); bathDoorPivot.add(bathP1);
        const bathP2 = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.72, 0.36), trimMat);
        bathP2.position.set(0.02, 0.56, 0.48); bathDoorPivot.add(bathP2);

        // Picaporte de latón exterior (lado pasillo)
        const bathDKnob = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), goldBrassMat);
        bathDKnob.position.set(-0.025, 1.04, 0.88);
        bathDoorPivot.add(bathDKnob);

        // Picaporte de latón interior (lado baño)
        const bathDKnobIn = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), goldBrassMat);
        bathDKnobIn.position.set(0.065, 1.04, 0.88);
        bathDoorPivot.add(bathDKnobIn);

        fullHouseGroup.add(bathDoorPivot);
        interactables.push(bathDoorLeaf);
        bathDoorLeaf.userData = { type: 'bathroom_door' };

        // Sanitarios baño superior: Inodoro, Lavamanos y Bañera completa con cortina
        const porcelainMat = new THREE.MeshLambertMaterial({ color: 0xf5f7fa });
        const chromeMat = new THREE.MeshLambertMaterial({ color: 0xdde4eb });

        // 1. BAÑERA DE LUJO RETRO: Ubicada contra la pared norte (z: [2.95, 3.65], x: [1.85, 3.40]), 100% visible y libre de bugs
        // Faldón exterior y laterales en porcelana sanitaria
        const tubFront = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.48, 0.04), porcelainMat);
        tubFront.position.set(2.625, 0.24, 3.63); fullHouseGroup.add(tubFront);

        const tubSideW = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.48, 0.64), porcelainMat);
        tubSideW.position.set(1.87, 0.24, 3.29); fullHouseGroup.add(tubSideW);

        // Zócalo sanitario inferior en el faldón de la bañera
        const tubBaseFront = new THREE.Mesh(new THREE.BoxGeometry(1.57, 0.04, 0.05), trimMat);
        tubBaseFront.position.set(2.625, 0.02, 3.635); fullHouseGroup.add(tubBaseFront);

        const tubBaseSide = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.66), trimMat);
        tubBaseSide.position.set(1.865, 0.02, 3.29); fullHouseGroup.add(tubBaseSide);

        // Reborde superior perimetral de la tina
        const rimFront = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.05, 0.08), porcelainMat);
        rimFront.position.set(2.625, 0.505, 3.61); fullHouseGroup.add(rimFront);

        const rimSideW = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.64), porcelainMat);
        rimSideW.position.set(1.89, 0.505, 3.29); fullHouseGroup.add(rimSideW);

        const rimSideE = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.64), porcelainMat);
        rimSideE.position.set(3.36, 0.505, 3.29); fullHouseGroup.add(rimSideE);

        const rimBackN = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.05, 0.08), porcelainMat);
        rimBackN.position.set(2.625, 0.505, 2.99); fullHouseGroup.add(rimBackN);

        // Fondo y paredes interiores esmaltadas de la tina
        const tubFloor = new THREE.Mesh(new THREE.BoxGeometry(1.39, 0.02, 0.52), porcelainMat);
        tubFloor.position.set(2.625, 0.08, 3.30); fullHouseGroup.add(tubFloor);

        const tubWallF = new THREE.Mesh(new THREE.BoxGeometry(1.39, 0.38, 0.02), porcelainMat);
        tubWallF.position.set(2.625, 0.28, 3.56); fullHouseGroup.add(tubWallF);

        const tubWallB = new THREE.Mesh(new THREE.BoxGeometry(1.39, 0.38, 0.02), porcelainMat);
        tubWallB.position.set(2.625, 0.28, 3.04); fullHouseGroup.add(tubWallB);

        const tubWallL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.38, 0.52), porcelainMat);
        tubWallL.position.set(1.94, 0.28, 3.30); fullHouseGroup.add(tubWallL);

        const tubWallR = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.38, 0.52), porcelainMat);
        tubWallR.position.set(3.31, 0.28, 3.30); fullHouseGroup.add(tubWallR);

        // Desagüe cromado circular en el fondo de la tina
        const tubDrain = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.01, 8), chromeMat);
        tubDrain.position.set(3.10, 0.092, 3.30); fullHouseGroup.add(tubDrain);

        const tubPlug = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.012, 6), trimMat);
        tubPlug.position.set(3.10, 0.096, 3.30); fullHouseGroup.add(tubPlug);

        // Agua translúcida en la tina
        const tubWater = new THREE.Mesh(
            new THREE.PlaneGeometry(1.35, 0.50),
            new THREE.MeshLambertMaterial({ color: 0x3d94b8, transparent: true, opacity: 0.50, side: THREE.DoubleSide })
        );
        tubWater.rotation.x = -Math.PI / 2;
        tubWater.position.set(2.625, 0.26, 3.30);
        fullHouseGroup.add(tubWater);

        // Grifería de pared, caño mezclador y mandos de agua caliente/fría
        const tubFaucetBase = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.04), chromeMat);
        tubFaucetBase.position.set(2.625, 0.62, 2.96); fullHouseGroup.add(tubFaucetBase);

        const tubSpout = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.014, 0.12, 8), chromeMat);
        tubSpout.rotation.x = Math.PI / 3;
        tubSpout.position.set(2.625, 0.60, 3.02); fullHouseGroup.add(tubSpout);

        const tubKnobL = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), new THREE.MeshLambertMaterial({ color: 0xb53b3b }));
        tubKnobL.position.set(2.55, 0.62, 2.99); fullHouseGroup.add(tubKnobL);

        const tubKnobR = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), new THREE.MeshLambertMaterial({ color: 0x3b6bb5 }));
        tubKnobR.position.set(2.70, 0.62, 2.99); fullHouseGroup.add(tubKnobR);

        // Columna vertical de ducha cromada y flor de ducha retro en la pared norte
        const showerPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.48, 8), chromeMat);
        showerPipe.position.set(2.625, 1.39, 2.96); fullHouseGroup.add(showerPipe);

        const showerArm = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 8), chromeMat);
        showerArm.rotation.x = Math.PI / 2;
        showerArm.position.set(2.625, 2.14, 3.06); fullHouseGroup.add(showerArm);

        const showerHead = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.03, 0.05, 12), chromeMat);
        showerHead.rotation.x = Math.PI / 6;
        showerHead.position.set(2.625, 2.11, 3.16); fullHouseGroup.add(showerHead);

        // Jabonera cromada montada en la pared con pastilla de jabón
        const soapDish = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.02, 0.06), chromeMat);
        soapDish.position.set(2.38, 0.64, 2.97); fullHouseGroup.add(soapDish);

        const soapBar = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.025, 0.04), new THREE.MeshLambertMaterial({ color: 0xf5eedd }));
        soapBar.position.set(2.38, 0.655, 2.97); fullHouseGroup.add(soapBar);

        // Barra transversal cromada superior para la cortina
        const showerRod = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 1.55, 8), chromeMat);
        showerRod.rotation.z = Math.PI / 2;
        showerRod.position.set(2.625, 2.22, 3.62); fullHouseGroup.add(showerRod);

        // Cortina de baño elegante recogida hacia el lateral oeste (deja la bañera 100% visible y libre de bugs)
        const curtainMat = new THREE.MeshLambertMaterial({ color: 0x7ba3bd, side: THREE.DoubleSide });
        const curtainFold1 = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 1.65, 8), curtainMat);
        curtainFold1.position.set(1.96, 1.38, 3.60); fullHouseGroup.add(curtainFold1);

        const curtainFold2 = new THREE.Mesh(new THREE.CylinderGeometry(0.050, 0.060, 1.65, 8), curtainMat);
        curtainFold2.position.set(2.05, 1.38, 3.61); fullHouseGroup.add(curtainFold2);

        const curtainFold3 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 1.65, 8), curtainMat);
        curtainFold3.position.set(2.13, 1.38, 3.59); fullHouseGroup.add(curtainFold3);

        const curtainTie = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.014, 6, 12), goldBrassMat);
        curtainTie.position.set(2.04, 1.35, 3.60); fullHouseGroup.add(curtainTie);

        // 2. LAVAMANOS Y BOTIQUÍN: En la pared este frente a la puerta (x = 3.48, z = 4.30)
        const upSink = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.78, 0.75), woodMat);
        upSink.position.set(3.24, 0.39, 4.30); fullHouseGroup.add(upSink);

        const upBasin = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.16, 0.12, 10), porcelainMat);
        upBasin.position.set(3.24, 0.84, 4.30); fullHouseGroup.add(upBasin);

        const basinFaucet = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.10, 8), chromeMat);
        basinFaucet.position.set(3.40, 0.94, 4.30); fullHouseGroup.add(basinFaucet);

        // Botiquín con espejo sobre el lavamanos en la pared este
        const upMirrorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.75, 0.60), trimMat);
        upMirrorFrame.position.set(3.48, 1.55, 4.30); fullHouseGroup.add(upMirrorFrame);

        const upMirrorMat = new THREE.MeshBasicMaterial({ color: 0xb5d3e8 });
        const upMirror = makeTessMesh(0.54, 0.69, upMirrorMat, 2, 2);
        upMirror.rotation.y = -Math.PI / 2;
        upMirror.position.set(3.455, 1.55, 4.30); fullHouseGroup.add(upMirror);

        // Lámpara de aplique cálido sobre el botiquín
        const mirrorLamp = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.35), goldBrassMat);
        mirrorLamp.position.set(3.46, 1.98, 4.30); fullHouseGroup.add(mirrorLamp);

        // 3. INODORO: En el sector sur (z: 5.4 a 5.9, x = 3.15)
        const upToiletB = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.42, 0.54), porcelainMat);
        upToiletB.position.set(3.15, 0.21, 5.50); fullHouseGroup.add(upToiletB);

        const upToiletT = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.50, 0.24), porcelainMat);
        upToiletT.position.set(3.15, 0.58, 5.86); fullHouseGroup.add(upToiletT);

        const upToiletSeat = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.04, 0.42), porcelainMat);
        upToiletSeat.position.set(3.15, 0.44, 5.44); fullHouseGroup.add(upToiletSeat);

        const flusherHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.06, 6), chromeMat);
        flusherHandle.rotation.x = Math.PI / 2;
        flusherHandle.position.set(2.94, 0.74, 5.86); fullHouseGroup.add(flusherHandle);

        // Portarrollos de papel higiénico en la pared sur
        const tpRoll = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.12, 8), new THREE.MeshLambertMaterial({ color: 0xffffff }));
        tpRoll.rotation.z = Math.PI / 2;
        tpRoll.position.set(2.80, 0.65, 5.96); fullHouseGroup.add(tpRoll);

        // Toallero con toalla colgada en la pared oeste (lado sur)
        const towelBar = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.55, 6), chromeMat);
        towelBar.position.set(1.74, 1.10, 5.30); fullHouseGroup.add(towelBar);
        const towelHanging = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.50, 0.42), new THREE.MeshLambertMaterial({ color: 0x3d7068 }));
        towelHanging.position.set(1.75, 0.90, 5.30); fullHouseGroup.add(towelHanging);

        // Alfombrita antideslizante frente al lavamanos
        const bathRug = new THREE.Mesh(new THREE.BoxGeometry(0.60, 0.012, 0.85), new THREE.MeshLambertMaterial({ color: 0x42708c }));
        bathRug.position.set(2.55, 0.012, 4.30); fullHouseGroup.add(bathRug);

        upperBathLight = new THREE.PointLight(0xffecd0, 1.2, 5.0);
        upperBathLight.position.set(bathCenterX, ROOM_H - 0.2, bathCenterZ);
        fullHouseGroup.add(upperBathLight);

        // Muro conector entre pasillo y escalera en z = 6.0
        const upWallConnector = makeTessMesh(0.85, ROOM_H, wallMatUpper, 4, 6);
        upWallConnector.position.set(1.275, ROOM_H / 2, 6.0);
        fullHouseGroup.add(upWallConnector);

        const baseConnector = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.22, 0.04), trimMat);
        baseConnector.position.set(1.275, 0.11, 5.98);
        fullHouseGroup.add(baseConnector);

        // 4. Pared Derecha (Este) del hueco de la escalera: z = 6.0 a 11.2 en x = 0.85
        const upWallEastStairs = makeTessMesh(5.2, ROOM_H, wallMatUpper, 12, 6);
        upWallEastStairs.rotation.y = -Math.PI / 2;
        upWallEastStairs.position.set(0.85, ROOM_H / 2, 8.6);
        fullHouseGroup.add(upWallEastStairs);

        const pf3 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.65, 0.85), trimMat);
        pf3.position.set(0.83, 1.55, 8.5); fullHouseGroup.add(pf3);
        const p3 = makeTessMesh(0.75, 0.55, picMat1, 2, 2);
        p3.rotation.y = -Math.PI / 2; p3.position.set(0.805, 1.55, 8.5); fullHouseGroup.add(p3);

        // 5. PARED SUR TRASERA DE PLANTA ALTA (z = 11.2, x: [-0.85, 0.85])
        const upWallSouth = makeTessMesh(1.7, ROOM_H, wallMatUpper, 6, 6);
        upWallSouth.rotation.y = Math.PI;
        upWallSouth.position.set(0.0, ROOM_H / 2, 11.2);
        fullHouseGroup.add(upWallSouth);

        const baseSouth = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.22, 0.04), trimMat);
        baseSouth.position.set(0.0, 0.11, 11.18);
        fullHouseGroup.add(baseSouth);

        const oilFrame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.04), trimMat);
        oilFrame.position.set(0.0, 1.6, 11.17); fullHouseGroup.add(oilFrame);
        const oilArt = makeTessMesh(1.1, 0.7, new THREE.MeshLambertMaterial({ color: 0x4d685a }), 2, 2);
        oilArt.rotation.y = Math.PI; oilArt.position.set(0.0, 1.6, 11.145); fullHouseGroup.add(oilArt);

        // 6. TECHO DE PLANTA ALTA
        const upCeilNorth = makeTessMesh(2.55, 3.1, ceilMatUpper, 8, 8);
        upCeilNorth.rotation.x = Math.PI / 2;
        upCeilNorth.position.set(0.425, ROOM_H, 4.45);
        fullHouseGroup.add(upCeilNorth);

        const upCeilSouth = makeTessMesh(1.7, 5.2, ceilMatUpper, 6, 12);
        upCeilSouth.rotation.x = Math.PI / 2;
        upCeilSouth.position.set(0.0, ROOM_H, 8.6);
        fullHouseGroup.add(upCeilSouth);

        hallwayLight = new THREE.PointLight(0xffecd0, 1.4, 10.0);
        hallwayLight.position.set(0.0, ROOM_H - 0.22, 5.0);
        fullHouseGroup.add(hallwayLight);

        const lampGlassMat = new THREE.MeshBasicMaterial({ color: 0xffeedd });
        const stairLamp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), lampGlassMat);
        stairLamp.position.set(0.0, ROOM_H - 0.16, 8.8);
        fullHouseGroup.add(stairLamp);

        // ----------------------------------------------------
        // B. ESCALERA 2 -> 1 (Descenso a Planta Baja, z: 6.2 a 9.4)
        // ----------------------------------------------------
        const GY = -2.8;
        const stairStepsCount = 14;
        const stairLength = 3.2;
        const stairDrop = 2.8;
        const stepDepth = stairLength / stairStepsCount;
        const stepHeight = stairDrop / stairStepsCount;

        for (let i = 0; i < stairStepsCount; i++) {
            const stepY = 0.0 - (i + 1) * stepHeight + stepHeight / 2;
            const stepZ = 6.2 + i * stepDepth + stepDepth / 2;
            const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(1.64, stepHeight, stepDepth), woodMat);
            stepMesh.position.set(0.0, stepY, stepZ);
            fullHouseGroup.add(stepMesh);

            // Alfombra central roja con varilla de latón en cada escalón
            const runnerStep = new THREE.Mesh(new THREE.BoxGeometry(0.9, stepHeight + 0.005, stepDepth + 0.005), runnerMat);
            runnerStep.position.set(0.0, stepY + 0.002, stepZ);
            fullHouseGroup.add(runnerStep);

            const stairRod = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.95, 6), goldBrassMat);
            stairRod.rotation.z = Math.PI / 2;
            stairRod.position.set(0.0, stepY + stepHeight / 2 + 0.006, stepZ - stepDepth / 2);
            fullHouseGroup.add(stairRod);
        }

        // Plancha de transición superior de la escalera (rellena gap visual entre el pasillo y el primer escalón de pared a pared)
        const stairTopTransition = new THREE.Mesh(new THREE.BoxGeometry(1.70, 0.06, 0.25), woodMat);
        stairTopTransition.position.set(0.0, -0.025, 6.12);
        fullHouseGroup.add(stairTopTransition);
        const stairTopRunner = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.065, 0.25), runnerMat);
        stairTopRunner.position.set(0.0, -0.020, 6.12);
        fullHouseGroup.add(stairTopRunner);

        // Rellano de transición inferior (rellena gap visual entre último escalón y el piso del pasillo central)
        const stairBotTransition = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.06, 0.30), woodMat);
        stairBotTransition.position.set(0.0, GY + 0.03, 9.55);
        fullHouseGroup.add(stairBotTransition);
        const stairBotRunner = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.065, 0.30), runnerMat);
        stairBotRunner.position.set(0.0, GY + 0.035, 9.55);
        fullHouseGroup.add(stairBotRunner);

        // Cielo raso / Soffito inclinado debajo de la escalera (confinado a ±0.81 para no penetrar paredes)
        const soffitGeo = new THREE.BufferGeometry();
        const soffitVerts = new Float32Array([
            -0.81,  0.00 - 0.06, 6.20,
            -0.81, -2.80 - 0.06, 9.40,
             0.81,  0.00 - 0.06, 6.20,

             0.81,  0.00 - 0.06, 6.20,
            -0.81, -2.80 - 0.06, 9.40,
             0.81, -2.80 - 0.06, 9.40,

             0.81,  0.00 - 0.06, 6.20,
            -0.81, -2.80 - 0.06, 9.40,
            -0.81,  0.00 - 0.06, 6.20,

             0.81, -2.80 - 0.06, 9.40,
            -0.81, -2.80 - 0.06, 9.40,
             0.81,  0.00 - 0.06, 6.20
        ]);
        soffitGeo.setAttribute('position', new THREE.BufferAttribute(soffitVerts, 3));
        soffitGeo.computeVertexNormals();
        const stairUnderSoffit = new THREE.Mesh(soffitGeo, ceilMatGround);
        fullHouseGroup.add(stairUnderSoffit);

        // Zancas de madera y pasamanos (con vértice superior a ras de suelo Y=0.00 para no penetrar el parquet del piso superior)
        [-0.79, 0.79].forEach(sx => {
            const stringerGeo = new THREE.BufferGeometry();
            const sVerts = new Float32Array([
                sx,  0.00, 6.18,
                sx, -2.72, 9.42,
                sx, -0.22, 6.18,

                sx, -0.22, 6.18,
                sx, -2.72, 9.42,
                sx, -3.02, 9.42
            ]);
            stringerGeo.setAttribute('position', new THREE.BufferAttribute(sVerts, 3));
            stringerGeo.computeVertexNormals();
            const strMesh = new THREE.Mesh(stringerGeo, trimMat);
            fullHouseGroup.add(strMesh);
        });

        [-0.79, 0.79].forEach(rx => {
            const postTop = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.95, 8), trimMat);
            postTop.position.set(rx, 0.475, 6.22); fullHouseGroup.add(postTop);

            const postBot = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.95, 8), trimMat);
            postBot.position.set(rx, GY + 0.475, 9.38); fullHouseGroup.add(postBot);

            const handrail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 4.3), trimMat);
            handrail.rotation.x = Math.atan2(stairDrop, stairLength);
            handrail.position.set(rx, -1.4 + 0.50, 7.8);
            fullHouseGroup.add(handrail);

            for (let b = 1; b < 13; b++) {
                const bz = 6.2 + b * (3.2 / 14);
                const t = (bz - 6.2) / 3.2;
                const baseStepY = 0.0 - t * 2.8;
                const bH = 0.50;
                const bal = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, bH, 6), trimMat);
                bal.position.set(rx, baseStepY + bH / 2, bz);
                fullHouseGroup.add(bal);
            }
        });

        // ----------------------------------------------------
        // C. PLANTA BAJA (Y = -2.8, ROOM_H = 2.8, Techo Y = 0.0, z: 1.0 a 11.2)
        // ----------------------------------------------------

        // 1. Living Room (Sala de Estar) (x: [0.85, 6.2], z: [1.0, 11.2])
        const livingW = 5.35, livingD = 10.2;
        const livingCenterX = 3.525, livingCenterZ = 6.1;

        const livingFloor = makeTessMesh(livingW, livingD, floorMat, 10, 16);
        livingFloor.rotation.x = -Math.PI / 2;
        livingFloor.position.set(livingCenterX, GY + 0.005, livingCenterZ);
        fullHouseGroup.add(livingFloor);

        const livingCeil = makeTessMesh(livingW, livingD, ceilMatGround, 10, 16);
        livingCeil.rotation.x = Math.PI / 2;
        livingCeil.position.set(livingCenterX, -0.01, livingCenterZ);
        fullHouseGroup.add(livingCeil);

        // Pared Este (exterior)
        const livingWallE = makeTessMesh(livingD, ROOM_H, wallMatGround, 16, 6);
        livingWallE.rotation.y = -Math.PI / 2;
        livingWallE.position.set(6.2, GY + ROOM_H / 2, livingCenterZ);
        fullHouseGroup.add(livingWallE);

        // Pared Sur con ventanal y cortinas
        const livingWallS = makeTessMesh(livingW, ROOM_H, wallMatGround, 10, 6);
        livingWallS.rotation.y = Math.PI;
        livingWallS.position.set(livingCenterX, GY + ROOM_H / 2, 11.2);
        fullHouseGroup.add(livingWallS);

        // Pared Norte sólida
        const livingWallN = makeTessMesh(livingW, ROOM_H, wallMatGround, 10, 6);
        livingWallN.position.set(livingCenterX, GY + ROOM_H / 2, 1.0);
        fullHouseGroup.add(livingWallN);

        // Ventana grande del Living
        const winLivingMat = new THREE.MeshBasicMaterial({ color: 0x22354c, transparent: true, opacity: 0.85 });
        const livingWin = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.5), winLivingMat);
        livingWin.position.set(3.8, GY + 1.5, 11.18);
        livingWin.rotation.y = Math.PI;
        fullHouseGroup.add(livingWin);

        // Cortinas elegantes de tela azul oscuro en el ventanal
        const curtainDrapeMat = new THREE.MeshLambertMaterial({ color: 0x263d59 });
        const curtainLivL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.65, 0.08), curtainDrapeMat);
        curtainLivL.position.set(2.35, GY + 1.5, 11.14); fullHouseGroup.add(curtainLivL);
        const curtainLivR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.65, 0.08), curtainDrapeMat);
        curtainLivR.position.set(5.25, GY + 1.5, 11.14); fullHouseGroup.add(curtainLivR);

        // Gran chimenea de ladrillo con repisa de madera en la pared Este
        const fpOuter = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.5, 1.9), brickMat);
        fpOuter.position.set(5.95, GY + 0.75, 4.2); fullHouseGroup.add(fpOuter);

        const fpMantle = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.1, 2.1), woodMat);
        fpMantle.position.set(5.88, GY + 1.55, 4.2); fullHouseGroup.add(fpMantle);

        const fpHearthHole = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.75, 0.95), new THREE.MeshLambertMaterial({ color: 0x181412 }));
        fpHearthHole.position.set(5.72, GY + 0.45, 4.2); fullHouseGroup.add(fpHearthHole);

        // Leños y brasas con luz cálida
        const woodLogMat = new THREE.MeshLambertMaterial({ color: 0x3d2314 });
        const log1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.7, 6), woodLogMat);
        log1.rotation.x = Math.PI / 2; log1.position.set(5.75, GY + 0.12, 4.2); fullHouseGroup.add(log1);
        const log2 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.65, 6), woodLogMat);
        log2.rotation.x = Math.PI / 2 + 0.3; log2.position.set(5.75, GY + 0.22, 4.2); fullHouseGroup.add(log2);

        const fpLight = new THREE.PointLight(0xff6611, 1.2, 4.5);
        fpLight.position.set(5.6, GY + 0.35, 4.2); fullHouseGroup.add(fpLight);

        // Reloj clásico y candelabros en la repisa de la chimenea
        const mantleClock = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.35), woodMat);
        mantleClock.position.set(5.88, GY + 1.71, 4.2); fullHouseGroup.add(mantleClock);
        const candle1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.18, 6), goldBrassMat);
        candle1.position.set(5.88, GY + 1.69, 3.5); fullHouseGroup.add(candle1);
        const candle2 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.18, 6), goldBrassMat);
        candle2.position.set(5.88, GY + 1.69, 4.9); fullHouseGroup.add(candle2);

        // Gran biblioteca de roble llena de libros clásicos
        const bookcase = new THREE.Mesh(new THREE.BoxGeometry(0.45, 2.2, 1.8), woodMat);
        bookcase.position.set(3.8, GY + 1.1, 1.25); fullHouseGroup.add(bookcase);

        const bookColors = [0x8b2635, 0x1f363d, 0x40534c, 0xc27ba0, 0x5e4b56];
        for (let row = 0; row < 3; row++) {
            const bY = GY + 0.45 + row * 0.55;
            for (let b = 0; b < 10; b++) {
                const bMat = new THREE.MeshLambertMaterial({ color: bookColors[(row + b) % bookColors.length] });
                const bMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.38, 0.09), bMat);
                bMesh.position.set(3.78, bY, 0.65 + b * 0.12 + 0.05);
                fullHouseGroup.add(bMesh);
            }
        }

        // Gran alfombra persa floral del living
        const rugLiving = makeTessMesh(3.2, 4.2, new THREE.MeshLambertMaterial({ map: rugTexture(), side: THREE.DoubleSide }), 6, 8);
        rugLiving.rotation.x = -Math.PI / 2;
        rugLiving.position.set(3.6, GY + 0.012, 6.8);
        fullHouseGroup.add(rugLiving);

        // Sofá 3 cuerpos interactivo
        const sofaMat = new THREE.MeshLambertMaterial({ color: 0x4a6582 });
        const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.42, 0.9), sofaMat);
        sofaBase.position.set(3.6, GY + 0.21, 6.4);
        sofaBase.userData = { type: 'living_sofa' };
        interactables.push(sofaBase);
        fullHouseGroup.add(sofaBase);

        const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.6, 0.26), sofaMat);
        sofaBack.position.set(3.6, GY + 0.64, 6.02); fullHouseGroup.add(sofaBack);
        [-1.05, 1.05].forEach(sx => {
            const arm = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.35, 0.9), sofaMat);
            arm.position.set(3.6 + sx, GY + 0.48, 6.4); fullHouseGroup.add(arm);
        });

        // Almohadones del sofá
        const cushionMat = new THREE.MeshLambertMaterial({ color: 0xb5835a });
        const c1 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.12), cushionMat);
        c1.position.set(2.85, GY + 0.52, 6.2); c1.rotation.y = 0.2; fullHouseGroup.add(c1);
        const c2 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.12), cushionMat);
        c2.position.set(4.35, GY + 0.52, 6.2); c2.rotation.y = -0.2; fullHouseGroup.add(c2);

        // Sillón individual
        const armChair = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.42, 0.9), sofaMat);
        armChair.position.set(2.1, GY + 0.21, 7.8);
        armChair.rotation.y = -0.6;
        armChair.userData = { type: 'living_sofa' };
        interactables.push(armChair);
        fullHouseGroup.add(armChair);

        // Mesa de café con revistas y control remoto
        const coffeeTable = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.4, 0.7), woodMat);
        coffeeTable.position.set(3.6, GY + 0.20, 7.8); fullHouseGroup.add(coffeeTable);

        const magMat = new THREE.MeshLambertMaterial({ color: 0x2288bb });
        const magazine = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.015, 0.32), magMat);
        magazine.position.set(3.4, GY + 0.41, 7.8); fullHouseGroup.add(magazine);

        const remoteMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
        const remoteMesh = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.16), remoteMat);
        remoteMesh.position.set(3.75, GY + 0.41, 7.75); fullHouseGroup.add(remoteMesh);

        // Mueble de TV y TV CRT interactiva
        const entUnit = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.85, 2.2), woodMat);
        entUnit.position.set(5.7, GY + 0.425, 7.8); entUnit.rotation.y = -Math.PI / 2;
        fullHouseGroup.add(entUnit);

        const tvLiv = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.5, 0.55), new THREE.MeshLambertMaterial({ color: 0x222226 }));
        tvLiv.position.set(5.65, GY + 1.1, 7.8);
        tvLiv.userData = { type: 'living_tv' };
        interactables.push(tvLiv);
        fullHouseGroup.add(tvLiv);

        const tvLivSc = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.34), new THREE.MeshBasicMaterial({ color: 0x05080c }));
        tvLivSc.rotation.y = -Math.PI / 2; tvLivSc.position.set(5.37, GY + 1.1, 7.8);
        tvLivSc.userData = { type: 'living_tv' };
        interactables.push(tvLivSc);
        fullHouseGroup.add(tvLivSc);

        livingTvScMesh = tvLivSc;
        livingTvLight = new THREE.PointLight(0x77aaff, 0.0, 4.5);
        livingTvLight.position.set(5.1, GY + 1.1, 7.8);
        fullHouseGroup.add(livingTvLight);

        // Lámpara de pie en la esquina del living
        const flBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.05, 10), goldBrassMat);
        flBase.position.set(5.8, GY + 0.025, 10.6); fullHouseGroup.add(flBase);
        const flPole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.75, 8), goldBrassMat);
        flPole.position.set(5.8, GY + 0.9, 10.6); fullHouseGroup.add(flPole);
        const flShade = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.38, 0.35, 12), new THREE.MeshLambertMaterial({ color: 0xf4eedb }));
        flShade.position.set(5.8, GY + 1.75, 10.6); fullHouseGroup.add(flShade);

        livingLight = new THREE.PointLight(0xffecd0, 1.6, 9.5);
        livingLight.position.set(3.5, GY + ROOM_H - 0.3, 6.5);
        fullHouseGroup.add(livingLight);

        // 2. Cocina y Comedor (Kitchen & Dining) (x: [-6.2, -0.85], z: [1.0, 11.2])
        const kitchenW = 5.35, kitchenD = 10.2;
        const kitchenCenterX = -3.525, kitchenCenterZ = 6.1;

        const kitchenFloor = makeTessMesh(kitchenW, kitchenD, linoMat, 10, 16);
        kitchenFloor.rotation.x = -Math.PI / 2;
        kitchenFloor.position.set(kitchenCenterX, GY + 0.005, kitchenCenterZ);
        fullHouseGroup.add(kitchenFloor);

        const kitchenCeil = makeTessMesh(kitchenW, kitchenD, ceilMatGround, 10, 16);
        kitchenCeil.rotation.x = Math.PI / 2;
        kitchenCeil.position.set(kitchenCenterX, -0.01, kitchenCenterZ);
        fullHouseGroup.add(kitchenCeil);

        // Pared Oeste (exterior)
        const kitchenWallW = makeTessMesh(kitchenD, ROOM_H, wallMatGround, 16, 6);
        kitchenWallW.rotation.y = Math.PI / 2;
        kitchenWallW.position.set(-6.2, GY + ROOM_H / 2, kitchenCenterZ);
        fullHouseGroup.add(kitchenWallW);

        // Pared Sur
        const kitchenWallS = makeTessMesh(kitchenW, ROOM_H, wallMatGround, 10, 6);
        kitchenWallS.rotation.y = Math.PI;
        kitchenWallS.position.set(kitchenCenterX, GY + ROOM_H / 2, 11.2);
        fullHouseGroup.add(kitchenWallS);

        // Pared Norte sólida
        const kitchenWallN = makeTessMesh(kitchenW, ROOM_H, wallMatGround, 10, 6);
        kitchenWallN.position.set(kitchenCenterX, GY + ROOM_H / 2, 1.0);
        fullHouseGroup.add(kitchenWallN);

        // Mesada inferior en L con cajoneras
        const counterMat = new THREE.MeshLambertMaterial({ color: 0xd6cbb8 });
        const counterWoodMat = new THREE.MeshLambertMaterial({ color: 0x4f331f });
        const counter1 = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.88, 0.65), counterMat);
        counter1.position.set(-4.6, GY + 0.44, 10.85); fullHouseGroup.add(counter1);
        const counter2 = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.88, 2.5), counterMat);
        counter2.position.set(-5.85, GY + 0.44, 9.35); fullHouseGroup.add(counter2);

        // Alacenas superiores colgantes
        const upperCab1 = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.75, 0.38), counterWoodMat);
        upperCab1.position.set(-4.6, GY + 1.95, 10.98); fullHouseGroup.add(upperCab1);
        const upperCab2 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.75, 2.2), counterWoodMat);
        upperCab2.position.set(-5.98, GY + 1.95, 9.45); fullHouseGroup.add(upperCab2);

        // Electrodomésticos sobre la mesada: Microondas y Cafetera
        const microMat = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
        const microwave = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.32, 0.38), microMat);
        microwave.position.set(-5.8, GY + 0.88 + 0.16, 8.8); fullHouseGroup.add(microwave);
        const microDoor = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.26), new THREE.MeshBasicMaterial({ color: 0x222222 }));
        microDoor.rotation.y = Math.PI / 2;
        microDoor.position.set(-5.535, GY + 0.88 + 0.16, 8.8); fullHouseGroup.add(microDoor);

        const coffeeMaker = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 0.28), new THREE.MeshLambertMaterial({ color: 0x222222 }));
        coffeeMaker.position.set(-3.6, GY + 0.88 + 0.175, 10.8); fullHouseGroup.add(coffeeMaker);

        // Bacha interactiva de cocina
        const sinkKitchen = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.02, 0.42), new THREE.MeshLambertMaterial({ color: 0xccd6e0 }));
        sinkKitchen.position.set(-4.6, GY + 0.89, 10.85);
        sinkKitchen.userData = { type: 'kitchen_sink' };
        interactables.push(sinkKitchen);
        fullHouseGroup.add(sinkKitchen);

        const faucetMat = new THREE.MeshLambertMaterial({ color: 0xdde4eb });
        const faucetPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.22, 8), faucetMat);
        faucetPipe.position.set(-4.6, GY + 1.00, 11.02);
        faucetPipe.userData = { type: 'kitchen_sink' };
        interactables.push(faucetPipe);
        fullHouseGroup.add(faucetPipe);

        const faucetSpout = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.14, 8), faucetMat);
        faucetSpout.rotation.x = Math.PI / 2; faucetSpout.position.set(-4.6, GY + 1.10, 10.95);
        faucetSpout.userData = { type: 'kitchen_sink' };
        interactables.push(faucetSpout);
        fullHouseGroup.add(faucetSpout);

        const waterMat = new THREE.MeshBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.75 });
        sinkWaterMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.20, 6), waterMat);
        sinkWaterMesh.position.set(-4.6, GY + 0.99, 10.89);
        sinkWaterMesh.visible = false;
        fullHouseGroup.add(sinkWaterMesh);

        // Refrigerador interactivo 90s
        const fridgeBody = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.75, 0.75), new THREE.MeshLambertMaterial({ color: 0xe5e7eb }));
        fridgeBody.position.set(-5.75, GY + 0.875, 4.0);
        fridgeBody.userData = { type: 'fridge' };
        interactables.push(fridgeBody);
        fullHouseGroup.add(fridgeBody);

        fridgeDoorPivot = new THREE.Group();
        fridgeDoorPivot.position.set(-5.375, GY + 0.875, 3.625);
        const fridgeDoor = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.72, 0.73), new THREE.MeshLambertMaterial({ color: 0xeeeeee }));
        fridgeDoor.position.set(0.03, 0, 0.365);
        fridgeDoor.userData = { type: 'fridge' };
        interactables.push(fridgeDoor);
        fridgeDoorPivot.add(fridgeDoor);

        const fHandle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.45, 0.04), new THREE.MeshLambertMaterial({ color: 0x777777 }));
        fHandle.position.set(0.07, 0.2, 0.65);
        fridgeDoorPivot.add(fHandle);
        fullHouseGroup.add(fridgeDoorPivot);

        fridgeLight = new THREE.PointLight(0xfff0cc, 0.0, 3.5);
        fridgeLight.position.set(-5.2, GY + 1.0, 4.0);
        fullHouseGroup.add(fridgeLight);

        // Mesa de comedor redonda con sillas
        const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.05, 12), woodMat);
        tableTop.position.set(-3.2, GY + 0.74, 5.2); fullHouseGroup.add(tableTop);
        const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 0.72, 8), woodMat);
        tableLeg.position.set(-3.2, GY + 0.36, 5.2); fullHouseGroup.add(tableLeg);

        // Frutera decorativa en el centro de la mesa
        const fruitBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.1, 0.08, 8), porcelainMat);
        fruitBowl.position.set(-3.2, GY + 0.79, 5.2); fullHouseGroup.add(fruitBowl);

        for (let a = 0; a < 4; a++) {
            const angle = a * (Math.PI / 2) + 0.4;
            const chair = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.42, 0.38), woodMat);
            chair.position.set(-3.2 + Math.cos(angle) * 1.05, GY + 0.21, 5.2 + Math.sin(angle) * 1.05);
            chair.rotation.y = -angle + Math.PI / 2;
            fullHouseGroup.add(chair);
        }

        // Lámpara colgante vintage con pantalla cónica sobre el comedor
        const pendantShade = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.35, 0.24, 10), new THREE.MeshLambertMaterial({ color: 0x3d7068 }));
        pendantShade.position.set(-3.2, GY + 2.1, 5.2); fullHouseGroup.add(pendantShade);
        const pendantCord = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.6, 4), new THREE.MeshBasicMaterial({ color: 0x111111 }));
        pendantCord.position.set(-3.2, GY + 2.5, 5.2); fullHouseGroup.add(pendantCord);

        kitchenLight = new THREE.PointLight(0xfff0dd, 1.7, 8.5);
        kitchenLight.position.set(-3.5, GY + ROOM_H - 0.3, 6.0);
        fullHouseGroup.add(kitchenLight);

        // 3. TABIQUES DIVISORIOS DE PLANTA BAJA
        // Tabique divisor Este (entre escalera/pasillo central y Living en x = 0.85, z: 1.0 a 9.42)
        // Cierra herméticamente todo el costado Este, uniendo con el pilar de la arcada del living en z = 9.42
        const pEast1 = makeTessMesh(8.42, ROOM_H, wallMatGround, 16, 6);
        pEast1.rotation.y = -Math.PI / 2;
        pEast1.position.set(0.85, GY + ROOM_H / 2, 5.21); fullHouseGroup.add(pEast1);

        const pEastTrim = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 8.42), trimMat);
        pEastTrim.position.set(0.87, GY + 0.11, 5.21); fullHouseGroup.add(pEastTrim);

        // Tabique divisor Oeste (entre escalera/sótano y Cocina en x = -0.85)
        // Segmento Norte: z: [1.0, 4.5] (longitud 3.5m)
        const pWestNorth = makeTessMesh(3.5, ROOM_H, wallMatGround, 8, 6);
        pWestNorth.rotation.y = Math.PI / 2;
        pWestNorth.position.set(-0.85, GY + ROOM_H / 2, 2.75); fullHouseGroup.add(pWestNorth);

        const pWestNorthTrim = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 3.5), trimMat);
        pWestNorthTrim.position.set(-0.87, GY + 0.11, 2.75); fullHouseGroup.add(pWestNorthTrim);

        // Portal de Acceso al Sótano desde la Cocina (z: 4.5 a 6.0 en x = -0.85)
        const pWestArchL = new THREE.Mesh(new THREE.BoxGeometry(0.12, ROOM_H, 0.15), trimMat);
        pWestArchL.position.set(-0.85, GY + ROOM_H / 2, 4.5); fullHouseGroup.add(pWestArchL);

        const pWestArchR = new THREE.Mesh(new THREE.BoxGeometry(0.12, ROOM_H, 0.15), trimMat);
        pWestArchR.position.set(-0.85, GY + ROOM_H / 2, 6.0); fullHouseGroup.add(pWestArchR);

        const pWestArchHeader = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.55, 1.5), trimMat);
        pWestArchHeader.position.set(-0.85, GY + ROOM_H - 0.275, 5.25); fullHouseGroup.add(pWestArchHeader);

        const pWestArchWallTop = makeTessMesh(1.5, ROOM_H - 2.25, wallMatGround, 4, 2);
        pWestArchWallTop.rotation.y = Math.PI / 2;
        pWestArchWallTop.position.set(-0.85, GY + 2.25 + (ROOM_H - 2.25) / 2, 5.25); fullHouseGroup.add(pWestArchWallTop);

        // Aplique de luz decorativo y cartel indicador de SÓTANO sobre el portal de la cocina
        const portalLamp = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), lampGlassMat);
        portalLamp.position.set(-0.89, GY + 2.3, 5.25); fullHouseGroup.add(portalLamp);
        const portalLight = new THREE.PointLight(0xffdfaa, 1.3, 4.5);
        portalLight.position.set(-0.95, GY + 2.3, 5.25); fullHouseGroup.add(portalLight);

        // Placa estilo 90s: "SÓTANO / BASEMENT" visible desde la cocina
        const portalPlaque = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.20, 0.85), trimMat);
        portalPlaque.position.set(-0.89, GY + 2.05, 5.25); fullHouseGroup.add(portalPlaque);
        const portalPlaqueFace = new THREE.Mesh(new THREE.PlaneGeometry(0.80, 0.16), goldBrassMat);
        portalPlaqueFace.rotation.y = -Math.PI / 2;
        portalPlaqueFace.position.set(-0.915, GY + 2.05, 5.25); fullHouseGroup.add(portalPlaqueFace);

        // Segmento Sur: z: [6.0, 9.42] (longitud 3.42m)
        const pWestSouth = makeTessMesh(3.42, ROOM_H, wallMatGround, 8, 6);
        pWestSouth.rotation.y = Math.PI / 2;
        pWestSouth.position.set(-0.85, GY + ROOM_H / 2, 7.71); fullHouseGroup.add(pWestSouth);

        const pWestSouthTrim = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 3.42), trimMat);
        pWestSouthTrim.position.set(-0.87, GY + 0.11, 7.71); fullHouseGroup.add(pWestSouthTrim);

        // Muro de cerramiento Sur bajo la escalera en z = 6.0 (cierra el descansillo del sótano)
        const landingWallS = makeTessMesh(1.7, ROOM_H, wallMatGround, 4, 6);
        landingWallS.rotation.y = Math.PI;
        landingWallS.position.set(0.0, GY + ROOM_H / 2, 6.0); fullHouseGroup.add(landingWallS);

        const landingWallSTrim = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.22, 0.04), trimMat);
        landingWallSTrim.position.set(0.0, GY + 0.11, 5.98); fullHouseGroup.add(landingWallSTrim);

        // Suelo y techo del descansillo del sótano (z: [4.5, 6.0], x: [-0.85, 0.85])
        const landingFloorMesh = makeTessMesh(1.7, 1.5, floorMat, 4, 4);
        landingFloorMesh.rotation.x = -Math.PI / 2;
        landingFloorMesh.position.set(0.0, GY + 0.005, 5.25); fullHouseGroup.add(landingFloorMesh);

        const landingCeilMesh = makeTessMesh(1.7, 1.5, ceilMatGround, 4, 4);
        landingCeilMesh.rotation.x = Math.PI / 2;
        landingCeilMesh.position.set(0.0, -0.01, 5.25); fullHouseGroup.add(landingCeilMesh);

        // Techo sobre la escalera del sótano (z: [1.0, 4.5], x: [-0.85, 0.85]) a Y = -0.01
        const stairTopCeil = makeTessMesh(1.7, 3.5, ceilMatGround, 4, 8);
        stairTopCeil.rotation.x = Math.PI / 2;
        stairTopCeil.position.set(0.0, -0.01, 2.75); fullHouseGroup.add(stairTopCeil);

        // 4. FOYER CON GRANDES ARCADAS RESIDENCIALES AL LIVING Y COCINA
        // Suelo del foyer (z: 9.4 a 11.2, x: [-0.85, 0.85]) ajustado perfectamente al vano central sin solapar
        const foyerFloor = makeTessMesh(1.70, 1.8, floorMat, 6, 4);
        foyerFloor.rotation.x = -Math.PI / 2;
        foyerFloor.position.set(0, GY + 0.005, 10.3);
        fullHouseGroup.add(foyerFloor);

        // Techo del foyer (z: 9.4 a 11.2, x: [-0.85, 0.85]) a Y = -0.01
        const foyerCeil = makeTessMesh(1.70, 1.8, ceilMatGround, 6, 4);
        foyerCeil.rotation.x = Math.PI / 2;
        foyerCeil.position.set(0, -0.01, 10.3);
        fullHouseGroup.add(foyerCeil);

        // Umbrales decorativos de madera biselados en las transiciones a cocina y living
        const threshArcadeE = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.014, 1.56), trimMat);
        threshArcadeE.position.set(0.85, GY + 0.007, 10.2); fullHouseGroup.add(threshArcadeE);

        const threshArcadeW = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.014, 1.56), trimMat);
        threshArcadeW.position.set(-0.85, GY + 0.007, 10.2); fullHouseGroup.add(threshArcadeW);

        // GRANDES ARCADAS ABIERTAS AL PIE DE LA ESCALERA (z: 9.3 a 10.9)
        // Paredes conectoras entre muros del pasillo central (x = ±0.85) y pilastras de arcadas (x = ±1.2) en z = 9.42
        // Sellan herméticamente los huecos hacia el vacío exterior
        const fConnE = makeTessMesh(0.35, ROOM_H, wallMatGround, 2, 6);
        fConnE.position.set(1.025, GY + ROOM_H / 2, 9.42); fullHouseGroup.add(fConnE);
        const fConnTrimE = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, 0.04), trimMat);
        fConnTrimE.position.set(1.025, GY + 0.11, 9.44); fullHouseGroup.add(fConnTrimE);

        const fConnW = makeTessMesh(0.35, ROOM_H, wallMatGround, 2, 6);
        fConnW.position.set(-1.025, GY + ROOM_H / 2, 9.42); fullHouseGroup.add(fConnW);
        const fConnTrimW = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, 0.04), trimMat);
        fConnTrimW.position.set(-1.025, GY + 0.11, 9.44); fullHouseGroup.add(fConnTrimW);

        // Tabique vertical superior y viga de cielo raso que cierran el vano sobre el descansillo inferior (z = 9.40)
        // Elimina el borde flotante y los huecos negros al mirar hacia arriba
        const stairBulkhead = makeTessMesh(1.70, ROOM_H, wallMatUpper, 6, 6);
        stairBulkhead.rotation.y = Math.PI;
        stairBulkhead.position.set(0.0, ROOM_H / 2, 9.40); fullHouseGroup.add(stairBulkhead);

        const stairBulkheadBeam = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.12, 0.08), trimMat);
        stairBulkheadBeam.position.set(0.0, 0.0, 9.40); fullHouseGroup.add(stairBulkheadBeam);

        // Arcada Este hacia el Living en x = 1.2:
        const archEastPilasterL = new THREE.Mesh(new THREE.BoxGeometry(0.12, ROOM_H, 0.25), trimMat);
        archEastPilasterL.position.set(1.2, GY + ROOM_H / 2, 9.42); fullHouseGroup.add(archEastPilasterL);

        const archEastPilasterR = new THREE.Mesh(new THREE.BoxGeometry(0.12, ROOM_H, 0.25), trimMat);
        archEastPilasterR.position.set(1.2, GY + ROOM_H / 2, 10.98); fullHouseGroup.add(archEastPilasterR);

        const archEastHeader = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.55, 1.4), trimMat);
        archEastHeader.position.set(1.2, GY + ROOM_H - 0.275, 10.2); fullHouseGroup.add(archEastHeader);

        // Arcada Oeste hacia la Cocina en x = -1.2:
        const archWestPilasterL = new THREE.Mesh(new THREE.BoxGeometry(0.12, ROOM_H, 0.25), trimMat);
        archWestPilasterL.position.set(-1.2, GY + ROOM_H / 2, 9.42); fullHouseGroup.add(archWestPilasterL);

        const archWestPilasterR = new THREE.Mesh(new THREE.BoxGeometry(0.12, ROOM_H, 0.25), trimMat);
        archWestPilasterR.position.set(-1.2, GY + ROOM_H / 2, 10.98); fullHouseGroup.add(archWestPilasterR);

        const archWestHeader = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.55, 1.4), trimMat);
        archWestHeader.position.set(-1.2, GY + ROOM_H - 0.275, 10.2); fullHouseGroup.add(archWestHeader);

        // Foyer y Puerta Principal de Entrada
        frontDoorPivot = new THREE.Group();
        frontDoorPivot.position.set(-0.5, GY, 11.16);

        const frontDoorMesh = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.2, 0.08), woodMat);
        frontDoorMesh.position.set(0.5, 1.1, 0.0);
        frontDoorPivot.add(frontDoorMesh);

        const knobFront = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), goldBrassMat);
        knobFront.position.set(0.88, 1.05, -0.05);
        frontDoorPivot.add(knobFront);

        frontDoorMesh.userData = { type: 'front_door' };
        interactables.push(frontDoorMesh);
        fullHouseGroup.add(frontDoorPivot);

        // Pared frontal del foyer en z = 11.2 con zócalos de madera
        const fSurL = makeTessMesh(0.7, ROOM_H, wallMatGround, 3, 6);
        fSurL.rotation.y = Math.PI; fSurL.position.set(-0.85, GY + ROOM_H / 2, 11.2); fullHouseGroup.add(fSurL);
        const fSurTrimL = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.22, 0.04), trimMat);
        fSurTrimL.position.set(-0.85, GY + 0.11, 11.18); fullHouseGroup.add(fSurTrimL);

        const fSurR = makeTessMesh(0.7, ROOM_H, wallMatGround, 3, 6);
        fSurR.rotation.y = Math.PI; fSurR.position.set(0.85, GY + ROOM_H / 2, 11.2); fullHouseGroup.add(fSurR);
        const fSurTrimR = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.22, 0.04), trimMat);
        fSurTrimR.position.set(0.85, GY + 0.11, 11.18); fullHouseGroup.add(fSurTrimR);

        const fSurTop = makeTessMesh(1.0, ROOM_H - 2.2, wallMatGround, 3, 2);
        fSurTop.rotation.y = Math.PI; fSurTop.position.set(0, GY + 2.2 + (ROOM_H - 2.2) / 2, 11.2); fullHouseGroup.add(fSurTop);

        // Perchero de entrada con paragüero
        const coatRack = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 1.85, 8), woodMat);
        coatRack.position.set(-0.95, GY + 0.925, 10.6); fullHouseGroup.add(coatRack);
        const coatHook = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.04, 0.28), goldBrassMat);
        coatHook.position.set(-0.95, GY + 1.7, 10.6); fullHouseGroup.add(coatHook);

        const doormat = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.55), new THREE.MeshLambertMaterial({ color: 0x6e5233 }));
        doormat.rotation.x = -Math.PI / 2;
        doormat.position.set(0, GY + 0.015, 10.5); fullHouseGroup.add(doormat);

        foyerLight = new THREE.PointLight(0xffeedd, 1.4, 6.0);
        foyerLight.position.set(0, GY + ROOM_H - 0.25, 10.3);
        fullHouseGroup.add(foyerLight);

        // Porche frontal exterior cubierto (z: 11.2 a 13.0, x: [-1.5, 1.5])
        const porchPlatform = makeTessMesh(3.0, 1.8, concreteMat, 6, 6);
        porchPlatform.rotation.x = -Math.PI / 2;
        porchPlatform.position.set(0, GY + 0.005, 12.1);
        fullHouseGroup.add(porchPlatform);

        const porchCeilExt = makeTessMesh(3.0, 1.8, ceilMatGround, 6, 6);
        porchCeilExt.rotation.x = Math.PI / 2;
        porchCeilExt.position.set(0, -0.01, 12.1);
        fullHouseGroup.add(porchCeilExt);

        [-1.35, 1.35].forEach(cx => {
            const col = new THREE.Mesh(new THREE.BoxGeometry(0.14, ROOM_H, 0.14), trimMat);
            col.position.set(cx, GY + ROOM_H / 2, 12.85);
            fullHouseGroup.add(col);
        });

        // ----------------------------------------------------
        // D. ENTRADA Y ESCALERA 1 -> SÓTANO (Descenso desde Y = -2.8 en z = 4.5 hasta Y = -5.6 en z = 1.0)
        // ----------------------------------------------------
        const BY = -5.6;

        // Portal y Puerta Interactiva del Sótano en z = 4.5 (Planta Baja)
        // Tabique de cerramiento con vano para la puerta
        const baseDoorWallL = makeTessMesh(0.38, ROOM_H, wallMatGround, 2, 4);
        baseDoorWallL.position.set(-0.66, GY + ROOM_H / 2, 4.5); fullHouseGroup.add(baseDoorWallL);

        const baseDoorWallR = makeTessMesh(0.38, ROOM_H, wallMatGround, 2, 4);
        baseDoorWallR.position.set(0.66, GY + ROOM_H / 2, 4.5); fullHouseGroup.add(baseDoorWallR);

        const baseDoorWallTop = makeTessMesh(0.95, ROOM_H - 2.15, wallMatGround, 4, 2);
        baseDoorWallTop.position.set(0.0, GY + 2.15 + (ROOM_H - 2.15) / 2, 4.5); fullHouseGroup.add(baseDoorWallTop);

        // Marco hueco visible de ambos lados (profundidad 0.12)
        const bdfL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.15, 0.12), trimMat);
        bdfL.position.set(-0.475 - 0.03, GY + 1.075, 4.5); fullHouseGroup.add(bdfL);
        const bdfR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.15, 0.12), trimMat);
        bdfR.position.set(0.475 + 0.03, GY + 1.075, 4.5); fullHouseGroup.add(bdfR);
        const bdfTop = new THREE.Mesh(new THREE.BoxGeometry(1.07, 0.06, 0.12), trimMat);
        bdfTop.position.set(0.0, GY + 2.15 + 0.03, 4.5); fullHouseGroup.add(bdfTop);

        // Umbral de madera al pie de la puerta
        const bThreshold = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.04, 0.14), trimMat);
        bThreshold.position.set(0.0, GY + 0.02, 4.5); fullHouseGroup.add(bThreshold);

        // Placa dorada vintage sobre la puerta del sótano
        const bPlaque = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.14, 0.02), goldBrassMat);
        bPlaque.position.set(0.0, GY + 2.22, 4.57); fullHouseGroup.add(bPlaque);

        // Aplique de luz vintage sobre la puerta del sótano
        const basementSconceLamp = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), lampGlassMat);
        basementSconceLamp.position.set(0.0, GY + 2.38, 4.56); fullHouseGroup.add(basementSconceLamp);
        const basementSconceLight = new THREE.PointLight(0xffdfaa, 1.4, 5.5);
        basementSconceLight.position.set(0.0, GY + 2.38, 4.65); fullHouseGroup.add(basementSconceLight);

        // Puerta interactiva del sótano con bisagra
        basementDoorPivot = new THREE.Group();
        basementDoorPivot.position.set(-0.475, GY, 4.5);

        const basementDoorLeaf = new THREE.Mesh(new THREE.BoxGeometry(0.94, 2.1, 0.05), woodMat);
        basementDoorLeaf.position.set(0.47, 1.05, 0.0);
        basementDoorPivot.add(basementDoorLeaf);

        // Pomo exterior (lado descansillo)
        const bDoorKnobOut = new THREE.Mesh(new THREE.SphereGeometry(0.032, 6, 6), goldBrassMat);
        bDoorKnobOut.position.set(0.85, 1.05, 0.04);
        bDoorKnobOut.userData = { type: 'basement_door' };
        interactables.push(bDoorKnobOut);
        basementDoorPivot.add(bDoorKnobOut);

        // Pomo interior (lado escalera sótano)
        const bDoorKnobIn = new THREE.Mesh(new THREE.SphereGeometry(0.032, 6, 6), goldBrassMat);
        bDoorKnobIn.position.set(0.85, 1.05, -0.04);
        bDoorKnobIn.userData = { type: 'basement_door' };
        interactables.push(bDoorKnobIn);
        basementDoorPivot.add(bDoorKnobIn);

        fullHouseGroup.add(basementDoorPivot);
        interactables.push(basementDoorLeaf);
        basementDoorLeaf.userData = { type: 'basement_door' };

        // Escalones de la escalera al sótano (z: 4.5 a 1.0)
        const baseStairSteps = 14;
        const baseStairLen = 3.5;
        const baseStairDrop = 2.8;
        const bStepD = baseStairLen / baseStairSteps;
        const bStepH = baseStairDrop / baseStairSteps;
        const baseStepMat = woodMat;

        for (let i = 0; i < baseStairSteps; i++) {
            const stepY = GY - (i + 1) * bStepH + bStepH / 2;
            const stepZ = 4.5 - i * bStepD - bStepD / 2;
            // Ancho 1.64m para evitar z-fighting con los tabiques de mampostería laterales
            const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(1.64, bStepH, bStepD), baseStepMat);
            stepMesh.position.set(0.0, stepY, stepZ);
            fullHouseGroup.add(stepMesh);

            // Huella de madera con cantonera visible en cada escalón para nitidez visual
            const bTread = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.02, bStepD + 0.015), trimMat);
            bTread.position.set(0.0, stepY + bStepH / 2 + 0.01, stepZ + 0.0075);
            fullHouseGroup.add(bTread);
        }

        // Iluminación cálida en la escalera del sótano (sin la bolita blanca flotante ni baranda cilíndrica)
        basementStairLight = new THREE.PointLight(0xffdfaa, 1.5, 6.0);
        basementStairLight.position.set(0.65, GY - 0.7, 2.75);
        fullHouseGroup.add(basementStairLight);

        // Cerramientos de hormigón en laterales inferiores de la escalera al sótano (Y = -5.6 a -2.8)
        const bStairWallW = makeTessMesh(3.5, 2.8, wallMatBasement, 6, 6);
        bStairWallW.rotation.y = Math.PI / 2;
        bStairWallW.position.set(-0.85, BY + 1.4, 2.75);
        fullHouseGroup.add(bStairWallW);

        const bStairWallE = makeTessMesh(3.5, 2.8, wallMatBasement, 6, 6);
        bStairWallE.rotation.y = -Math.PI / 2;
        bStairWallE.position.set(0.85, BY + 1.4, 2.75);
        fullHouseGroup.add(bStairWallE);

        // Cerramientos de hormigón en laterales superiores del hueco de la escalera (Y = -2.8 a 0.0)
        // Offset a ±0.84 para eliminar al 100% el z-fighting con los tabiques de planta baja (pWestNorth y pEast1)
        const bStairUpperWallW = makeTessMesh(3.5, 2.8, wallMatBasement, 6, 6);
        bStairUpperWallW.rotation.y = Math.PI / 2;
        bStairUpperWallW.position.set(-0.84, GY + 1.4, 2.75);
        fullHouseGroup.add(bStairUpperWallW);

        const bStairUpperWallE = makeTessMesh(3.5, 2.8, wallMatBasement, 6, 6);
        bStairUpperWallE.rotation.y = -Math.PI / 2;
        bStairUpperWallE.position.set(0.84, GY + 1.4, 2.75);
        fullHouseGroup.add(bStairUpperWallE);

        // Pared frontal superior en z = 1.0 (sella el vacío sobre la entrada del sótano)
        const bStairUpperWallN = makeTessMesh(1.7, 2.8, wallMatBasement, 4, 4);
        bStairUpperWallN.position.set(0.0, GY + 1.4, 1.0);
        fullHouseGroup.add(bStairUpperWallN);

        // Losa de techo de hormigón sobre la escalera (Y = -0.015, z: 1.0 a 4.5)
        const bStairUpperCeil = makeTessMesh(1.7, 3.5, concreteFloorMat, 4, 6);
        bStairUpperCeil.rotation.x = Math.PI / 2;
        bStairUpperCeil.position.set(0.0, -0.015, 2.75);
        fullHouseGroup.add(bStairUpperCeil);

        const bStairLandingFloor = makeTessMesh(1.7, 3.5, concreteFloorMat, 4, 6);
        bStairLandingFloor.rotation.x = -Math.PI / 2;
        bStairLandingFloor.position.set(0.0, BY + 0.005, 2.75);
        fullHouseGroup.add(bStairLandingFloor);

        const bStairWallHead = makeTessMesh(1.7, 2.8, wallMatBasement, 4, 4);
        bStairWallHead.rotation.y = Math.PI;
        bStairWallHead.position.set(0.0, BY + 1.4, 4.5);
        fullHouseGroup.add(bStairWallHead);

        // ----------------------------------------------------
        // E. SÓTANO COMPLETO (Y = -5.6, ROOM_H = 2.8, Techo Y = -2.8)
        // ----------------------------------------------------
        const baseW = 8.0, baseD = 3.8;
        const baseCenterX = 0.0, baseCenterZ = -0.9;

        const basementFloor = makeTessMesh(baseW, baseD, concreteFloorMat, 8, 6);
        basementFloor.rotation.x = -Math.PI / 2;
        basementFloor.position.set(baseCenterX, BY + 0.005, baseCenterZ);
        fullHouseGroup.add(basementFloor);

        const basementCeil = makeTessMesh(baseW, baseD, concreteFloorMat, 8, 6);
        basementCeil.rotation.x = Math.PI / 2;
        basementCeil.position.set(baseCenterX, GY, baseCenterZ);
        fullHouseGroup.add(basementCeil);

        const joistMat = new THREE.MeshLambertMaterial({ color: 0x221812 });
        for (let jz = -2.5; jz <= 0.8; jz += 0.65) {
            const joist = new THREE.Mesh(new THREE.BoxGeometry(baseW, 0.18, 0.09), joistMat);
            joist.position.set(baseCenterX, GY - 0.09, jz);
            fullHouseGroup.add(joist);
        }

        const copperMat = new THREE.MeshLambertMaterial({ color: 0x995533 });
        const p1p = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, baseW - 0.4, 6), copperMat);
        p1p.rotation.z = Math.PI / 2; p1p.position.set(0, GY - 0.22, -0.6); fullHouseGroup.add(p1p);

        const p2p = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, baseD - 0.4, 6), pipeMat);
        p2p.position.set(2.4, GY - 0.25, baseCenterZ); fullHouseGroup.add(p2p);

        // Muros perimetrales del sótano con mampostería de bloques auténtica
        const bWallNorth = makeTessMesh(baseW, ROOM_H, wallMatBasement, 8, 6);
        bWallNorth.position.set(baseCenterX, BY + ROOM_H / 2, -2.8);
        fullHouseGroup.add(bWallNorth);

        const bWallSouthL = makeTessMesh((baseW - 1.7) / 2, ROOM_H, wallMatBasement, 4, 6);
        bWallSouthL.rotation.y = Math.PI;
        bWallSouthL.position.set(-2.425, BY + ROOM_H / 2, 1.0);
        fullHouseGroup.add(bWallSouthL);

        const bWallSouthR = makeTessMesh((baseW - 1.7) / 2, ROOM_H, wallMatBasement, 4, 6);
        bWallSouthR.rotation.y = Math.PI;
        bWallSouthR.position.set(2.425, BY + ROOM_H / 2, 1.0);
        fullHouseGroup.add(bWallSouthR);

        const bWallWest = makeTessMesh(baseD, ROOM_H, wallMatBasement, 6, 6);
        bWallWest.rotation.y = Math.PI / 2;
        bWallWest.position.set(-4.0, BY + ROOM_H / 2, baseCenterZ);
        fullHouseGroup.add(bWallWest);

        const bWallEast = makeTessMesh(baseD, ROOM_H, wallMatBasement, 6, 6);
        bWallEast.rotation.y = -Math.PI / 2;
        bWallEast.position.set(4.0, BY + ROOM_H / 2, baseCenterZ);
        fullHouseGroup.add(bWallEast);

        // Muros de fundación superiores (Y = -2.8 a 0.0)
        const fWallNorth = makeTessMesh(baseW, ROOM_H, wallMatBasement, 8, 6);
        fWallNorth.position.set(baseCenterX, GY + ROOM_H / 2, -2.8);
        fullHouseGroup.add(fWallNorth);

        const fWallWest = makeTessMesh(baseD, ROOM_H, wallMatBasement, 6, 6);
        fWallWest.rotation.y = Math.PI / 2;
        fWallWest.position.set(-4.0, GY + ROOM_H / 2, baseCenterZ);
        fullHouseGroup.add(fWallWest);

        const fWallEast = makeTessMesh(baseD, ROOM_H, wallMatBasement, 6, 6);
        fWallEast.rotation.y = -Math.PI / 2;
        fWallEast.position.set(4.0, GY + ROOM_H / 2, baseCenterZ);
        fullHouseGroup.add(fWallEast);

        const fCeil = makeTessMesh(baseW, baseD, ceilMatGround, 8, 6);
        fCeil.rotation.x = Math.PI / 2;
        fCeil.position.set(baseCenterX, -0.015, baseCenterZ);
        fullHouseGroup.add(fCeil);

        const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.7, ROOM_H, 0.7), wallMatBasement);
        pillar.position.set(0, BY + ROOM_H / 2, -0.9);
        fullHouseGroup.add(pillar);

        // Banco de trabajo de carpintero con herramientas
        const workBenchMat = new THREE.MeshLambertMaterial({ color: 0x5a3e28 });
        const benchTop = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.75), workBenchMat);
        benchTop.position.set(-2.5, BY + 0.85, -2.35); fullHouseGroup.add(benchTop);
        const benchLeg1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.85, 0.1), workBenchMat);
        benchLeg1.position.set(-3.25, BY + 0.425, -2.6); fullHouseGroup.add(benchLeg1);
        const benchLeg2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.85, 0.1), workBenchMat);
        benchLeg2.position.set(-1.75, BY + 0.425, -2.6); fullHouseGroup.add(benchLeg2);
        const benchLeg3 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.85, 0.1), workBenchMat);
        benchLeg3.position.set(-3.25, BY + 0.425, -2.1); fullHouseGroup.add(benchLeg3);
        const benchLeg4 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.85, 0.1), workBenchMat);
        benchLeg4.position.set(-1.75, BY + 0.425, -2.1); fullHouseGroup.add(benchLeg4);

        // Prensa / morsa roja y caja de herramientas
        const viseMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.18), new THREE.MeshLambertMaterial({ color: 0xc1292e }));
        viseMesh.position.set(-3.2, BY + 0.96, -2.1); fullHouseGroup.add(viseMesh);

        const toolBox = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.22, 0.24), new THREE.MeshLambertMaterial({ color: 0x234e70 }));
        toolBox.position.set(-2.2, BY + 0.98, -2.35); fullHouseGroup.add(toolBox);

        // Lavarropas y secarropas en la esquina del sótano
        const washerMat = new THREE.MeshLambertMaterial({ color: 0xededed });
        const washer = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.92, 0.72), washerMat);
        washer.position.set(-3.4, BY + 0.46, 0.2); fullHouseGroup.add(washer);
        const washerDoor = new THREE.Mesh(new THREE.CircleGeometry(0.24, 12), new THREE.MeshBasicMaterial({ color: 0x444444 }));
        washerDoor.position.set(-3.03, BY + 0.46, 0.2);
        washerDoor.rotation.y = Math.PI / 2;
        fullHouseGroup.add(washerDoor);

        // Caldera interactiva y manómetro
        const boilerMat = new THREE.MeshLambertMaterial({ color: 0x2b333a });
        const boilerBody = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 1.6, 12), boilerMat);
        boilerBody.position.set(2.4, BY + 0.8, -1.8);
        boilerBody.userData = { type: 'basement_boiler' };
        interactables.push(boilerBody);
        fullHouseGroup.add(boilerBody);

        // Mirilla de inspección con llama piloto azul/cian
        const boilerFlame = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.08), new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide }));
        boilerFlame.rotation.y = -Math.PI / 2;
        boilerFlame.position.set(1.86, BY + 0.35, -1.8);
        fullHouseGroup.add(boilerFlame);

        const boilerFlameLight = new THREE.PointLight(0x0284c7, 0.6, 2.2);
        boilerFlameLight.position.set(1.92, BY + 0.35, -1.8);
        fullHouseGroup.add(boilerFlameLight);

        const exhaustPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.2, 8), pipeMat);
        exhaustPipe.position.set(2.4, BY + 2.1, -1.8); fullHouseGroup.add(exhaustPipe);

        const gauge = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        gauge.rotation.x = Math.PI / 2;
        gauge.position.set(2.4, BY + 1.2, -1.26); fullHouseGroup.add(gauge);

        // Estanterías metálicas con radio de onda corta y cajas rotuladas
        const shelfMat = new THREE.MeshLambertMaterial({ color: 0x3d434a });
        const shelf1 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.8, 1.4), shelfMat);
        shelf1.position.set(2.8, BY + 0.9, 0.0); fullHouseGroup.add(shelf1);

        // Radio vintage de onda corta interactiva
        const radioMat = new THREE.MeshLambertMaterial({ color: 0x5a3825 });
        const radioBody = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.22, 0.24), radioMat);
        radioBody.position.set(2.8, BY + 1.80 + 0.11, 0.0);
        radioBody.userData = { type: 'basement_radio' };
        interactables.push(radioBody);
        fullHouseGroup.add(radioBody);

        const dialTex = makePixelTexture(32, 16, (ctx, w, h) => {
            ctx.fillStyle = '#111812'; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#22dd44'; ctx.font = 'bold 7px monospace'; ctx.fillText('5.8MHz', 2, 11);
        });
        const radioDial = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.08), new THREE.MeshBasicMaterial({ map: dialTex }));
        radioDial.position.set(2.61, BY + 1.80 + 0.13, 0.0);
        radioDial.rotation.y = -Math.PI / 2;
        radioDial.userData = { type: 'basement_radio' };
        interactables.push(radioDial);
        fullHouseGroup.add(radioDial);

        const antMat = new THREE.MeshLambertMaterial({ color: 0xcccccc });
        const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.42, 4), antMat);
        antenna.rotation.z = -0.22;
        antenna.position.set(2.9, BY + 1.80 + 0.40, -0.06);
        fullHouseGroup.add(antenna);

        const boxMat = new THREE.MeshLambertMaterial({ color: 0x8a6c4a });
        const cBox1 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.32, 0.44), boxMat);
        cBox1.position.set(2.8, BY + 0.45, 0.0); fullHouseGroup.add(cBox1);
        const cBox2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.28, 0.38), boxMat);
        cBox2.position.set(2.8, BY + 0.95, -0.25); fullHouseGroup.add(cBox2);

        // Cajas de almacenamiento adicionales en el suelo
        const cBox3 = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.38, 0.42), boxMat);
        cBox3.position.set(-1.35, BY + 0.19, -2.4); fullHouseGroup.add(cBox3);
        const cBox4 = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.30, 0.36), boxMat);
        cBox4.position.set(-1.35, BY + 0.48, -2.4); fullHouseGroup.add(cBox4);

        // Lámpara colgante industrial del sótano (Reubicada fuera del pilar a z = -1.85)
        const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffe6aa });
        const lampShadeMat = new THREE.MeshLambertMaterial({ color: 0x1f392b, side: THREE.DoubleSide });

        const cordMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.55, 4), new THREE.MeshBasicMaterial({ color: 0x111111 }));
        cordMesh.position.set(0, GY - 0.275, -1.85); fullHouseGroup.add(cordMesh);

        // Campana esmaltada verde vintage
        const lampCone = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.12, 10, 1, true), lampShadeMat);
        lampCone.position.set(0, GY - 0.52, -1.85); fullHouseGroup.add(lampCone);

        // Jaula protectora de alambre
        const lampCage = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.12, 6), new THREE.MeshBasicMaterial({ color: 0x333333, wireframe: true }));
        lampCage.position.set(0, GY - 0.60, -1.85); fullHouseGroup.add(lampCage);

        const bBulb = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), bulbMat);
        bBulb.position.set(0, GY - 0.58, -1.85); fullHouseGroup.add(bBulb);

        basementLight = new THREE.PointLight(0xffdf99, 1.8, 9.0);
        basementLight.position.set(0, GY - 0.60, -1.85);
        fullHouseGroup.add(basementLight);

        // ----------------------------------------------------
        // F. CAJA DE DISYUNTORES PRINCIPAL / BREAKER BOX
        // ----------------------------------------------------
        breakerBoxGroup = new THREE.Group();
        const metalPanelMat = new THREE.MeshLambertMaterial({ color: 0x22262b });
        const metalDoorMat = new THREE.MeshLambertMaterial({ color: 0x2e353d });
        const handleLeverMat = new THREE.MeshLambertMaterial({ color: 0xd1231b });

        const boxHousing = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.72, 0.52), metalPanelMat);
        breakerBoxGroup.add(boxHousing);

        const boxDoor = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.68, 0.48), metalDoorMat);
        boxDoor.position.x = 0.07;
        breakerBoxGroup.add(boxDoor);

        const signTex = makePixelTexture(64, 32, (ctx, w, h) => {
            ctx.fillStyle = '#ffcc00'; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#000000'; ctx.fillRect(2, 2, w - 4, 2); ctx.fillRect(2, h - 4, w - 4, 2);
            ctx.font = 'bold 8px monospace'; ctx.fillText('⚡ 220V ⚡', 8, 14);
            ctx.font = 'bold 6px monospace'; ctx.fillText('MAIN BREAKER', 6, 24);
        });
        const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.12), new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide }));
        signMesh.rotation.y = Math.PI / 2;
        signMesh.position.set(0.082, 0.22, 0);
        breakerBoxGroup.add(signMesh);

        const ledGeo = new THREE.SphereGeometry(0.022, 8, 8);
        const ledMat = new THREE.MeshBasicMaterial({ color: 0x00ff44 });
        breakerLedMesh = new THREE.Mesh(ledGeo, ledMat);
        breakerLedMesh.position.set(0.085, 0.08, -0.14);
        breakerBoxGroup.add(breakerLedMesh);

        breakerHandleMesh = new THREE.Group();
        const leverArm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.025, 0.025), handleLeverMat);
        leverArm.position.x = 0.04;
        breakerHandleMesh.add(leverArm);

        const leverGrip = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 8), handleLeverMat);
        leverGrip.rotation.z = Math.PI / 2;
        leverGrip.position.x = 0.08;
        breakerHandleMesh.add(leverGrip);

        breakerHandleMesh.position.set(0.08, -0.08, 0);
        breakerHandleMesh.rotation.z = 0.55;
        breakerBoxGroup.add(breakerHandleMesh);

        breakerBoxGroup.position.set(-3.92, BY + 1.45, -0.8);
        fullHouseGroup.add(breakerBoxGroup);

        interactables.push(boxHousing);
        interactables.push(boxDoor);
        boxHousing.userData = { type: 'breaker_box' };
        boxDoor.userData = { type: 'breaker_box' };

        scene.add(fullHouseGroup);
    }


    // ========================================================
    // ESCRITORIO Y PC CRT
    // ========================================================
    function buildDeskAndPC(woodMat) {
        const dx = -1.2, dz = BACK_WALL_Z + 1.1;

        const deskTop = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.06, 0.9), woodMat);
        deskTop.position.set(dx, 0.72, dz); scene.add(deskTop);

        const legGeo = new THREE.BoxGeometry(0.06, 0.72, 0.06);
        [[-0.8, -0.32], [0.8, -0.32], [-0.8, 0.32], [0.8, 0.32]].forEach(p => {
            const leg = new THREE.Mesh(legGeo, woodMat);
            leg.position.set(dx + p[0], 0.36, dz + p[1]); scene.add(leg);
        });

        const caseMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a, side: THREE.DoubleSide });
        const pcCase = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.42, 0.45), caseMat);
        pcCase.position.set(dx - 0.6, 0.96, dz - 0.1); scene.add(pcCase);

        const led = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.01), new THREE.MeshBasicMaterial({ color: 0x00ff66 }));
        led.position.set(dx - 0.6, 1.05, dz + 0.13); scene.add(led);

        const monitorBody = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.62, 0.56), new THREE.MeshLambertMaterial({ color: 0x222222, side: THREE.DoubleSide }));
        monitorBody.position.set(dx, 1.06, dz - 0.1); scene.add(monitorBody);
        pcMonitorMesh = monitorBody; interactables.push(monitorBody);
        monitorBody.userData = { type: 'pc' };

        const screenTex = initDynamicOSCanvas();
        const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });
        const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.46), screenMat);
        screen.position.set(dx, 1.07, dz + 0.185); scene.add(screen);
        pcScreenMesh = screen; interactables.push(screen);
        screen.userData = { type: 'pc' };

        deskLampLight = new THREE.PointLight(0xffc870, 2.0, 5.0);
        deskLampLight.position.set(dx, 1.15, dz + 0.3); scene.add(deskLampLight);

        const padMat = new THREE.MeshLambertMaterial({ color: 0x181a20, side: THREE.DoubleSide });
        const deskPad = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.006, 0.42), padMat);
        deskPad.position.set(dx + 0.12, 0.753, dz + 0.22); scene.add(deskPad);

        const kbMat = new THREE.MeshLambertMaterial({ color: 0x1f2128, side: THREE.DoubleSide });
        const kb = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.024, 0.18), kbMat);
        kb.position.set(dx, 0.765, dz + 0.24); scene.add(kb);

        const mouseBody = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.028, 0.11), kbMat);
        mouseBody.position.set(dx + 0.34, 0.767, dz + 0.24); scene.add(mouseBody);

        const mx = dx - 0.35, my = 0.75, mz = dz + 0.2;
        const coaster = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.012, 0.12), new THREE.MeshLambertMaterial({ color: 0x8b5a2b }));
        coaster.position.set(mx, my + 0.006, mz); scene.add(coaster);

        const mugMat = new THREE.MeshLambertMaterial({ color: 0xcc2b2b });
        const mugBody = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.09, 12), mugMat);
        mugBody.position.set(mx, my + 0.057, mz); scene.add(mugBody);

        buildChair(dx, dz + 0.7);
    }

    function buildFloatingWallShelf(woodMat) {
        const shelfX = -1.2, shelfY = 1.7, shelfZ = BACK_WALL_Z + 0.2;
        const shelfBoard = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 0.35), woodMat);
        shelfBoard.position.set(shelfX, shelfY, shelfZ); scene.add(shelfBoard);

        const cols = [0xb83232, 0x2b6ca3, 0x2b9e52, 0xd49b28];
        for (let b = 0; b < 3; b++) {
            const bk = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.22), new THREE.MeshLambertMaterial({ color: cols[b], side: THREE.DoubleSide }));
            bk.position.set(shelfX - 0.5 + b * 0.08, shelfY + 0.11, shelfZ); scene.add(bk);
        }

        buildPS1Console(shelfX + 0.35, shelfY, shelfZ);
    }

    function buildChair(cx, cz) {
        const cm = new THREE.MeshLambertMaterial({ color: 0x1a1a1a, side: THREE.DoubleSide });
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 0.42), cm);
        seat.position.set(cx, 0.4, cz); scene.add(seat);

        const back = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.04), cm);
        back.position.set(cx, 0.65, cz + 0.18); scene.add(back);

        const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.38, 8), new THREE.MeshLambertMaterial({ color: 0x333333 }));
        piston.position.set(cx, 0.19, cz); scene.add(piston);
    }

    function buildHousePlant(x, y, z) {
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.09, 0.22, 8), new THREE.MeshLambertMaterial({ color: 0xe6e0d4 }));
        pot.position.set(x, y + 0.11, z); scene.add(pot);
        const lm = new THREE.MeshLambertMaterial({ color: 0x2d8a4e });
        for (let i = 0; i < 5; i++) {
            const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.12, 5, 5), lm);
            leaf.scale.set(1.3, 0.25, 0.7);
            leaf.rotation.y = (i / 5) * Math.PI * 2;
            leaf.position.set(x + Math.cos(i) * 0.07, y + 0.26 + Math.sin(i) * 0.03, z + Math.sin(i) * 0.07);
            scene.add(leaf);
        }
    }

    // ========================================================
    // EXTERIOR & CLIMA DINÁMICO 90s (VIVO, DETALLADO E INMERSIVO)
    // ========================================================
    function buildOutdoorEnvironment() {
        const GROUND_Y = -4.5;
        const STREET_Z = -15.0;
        const SIDEWALK_NEAR_Z = -9.0;
        const SIDEWALK_FAR_Z = -21.0;
        const WORLD_W = 360;

        // 1. CIELO Y HORIZONTE DISTANTE (Domo esférico 360° sin bordes de corte)
        const skyGeo = new THREE.SphereGeometry(260, 24, 16);
        const skyMatObj = new THREE.MeshBasicMaterial({ color: skyColorCurrent, side: THREE.BackSide, depthWrite: false, fog: false });
        skyPlaneMesh = new THREE.Mesh(skyGeo, skyMatObj);
        skyPlaneMesh.position.set(0, 0, 0);
        scene.add(skyPlaneMesh);

        // Sol 3D Dinámico situado en el plano astronómico de fondo (-72.0 Z, detrás de todas las montañas)
        sunGroup = new THREE.Group();
        sunMesh = new THREE.Mesh(
            new THREE.CircleGeometry(4.8, 32),
            new THREE.MeshBasicMaterial({ color: 0xfffae0, side: THREE.DoubleSide, depthTest: true, depthWrite: true })
        );
        sunGroup.add(sunMesh);

        sunCoronaMesh = new THREE.Mesh(
            new THREE.RingGeometry(4.8, 12.0, 32),
            new THREE.MeshBasicMaterial({ color: 0xffe880, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthTest: true, depthWrite: false })
        );
        sunCoronaMesh.position.set(0, 0, 0.04);
        sunGroup.add(sunCoronaMesh);

        sunGlowMesh = new THREE.Mesh(
            new THREE.CircleGeometry(24.0, 32),
            new THREE.MeshBasicMaterial({ color: 0xffaa40, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthTest: true, depthWrite: false })
        );
        sunGlowMesh.position.set(0, 0, 0.02);
        sunGroup.add(sunGlowMesh);

        sunGroup.position.set(0, 30, -72.0);
        sunGroup.visible = false;
        scene.add(sunGroup);

        // Luna 3D situada en el plano astronómico de fondo (-72.0 Z)
        moonGroup = new THREE.Group();
        moonMesh = new THREE.Mesh(
            new THREE.CircleGeometry(3.6, 32),
            new THREE.MeshBasicMaterial({ color: 0xfff8d0, side: THREE.DoubleSide, depthTest: true, depthWrite: true })
        );
        moonGroup.add(moonMesh);

        moonGlowMesh = new THREE.Mesh(
            new THREE.CircleGeometry(7.8, 32),
            new THREE.MeshBasicMaterial({ color: 0x99bbee, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthTest: true, depthWrite: false })
        );
        moonGlowMesh.position.set(0, 0, 0.02);
        moonGroup.add(moonGlowMesh);

        moonGroup.position.set(24, 24, -72.0);
        moonGroup.visible = false;
        scene.add(moonGroup);

        buildDistantHorizon(GROUND_Y);
        createOutdoorClouds();
        createStarParticles();
        createRainParticles();

        // 2. SUELO, CÉSPED Y ACERAS CONTINUAS (CON EXCLUSIÓN PRECISA DEL SUBSUELO DE LA CASA)
        // El césped rodea la casa sin atravesar el sótano ni flotar a Y = -4.5 dentro de la vivienda
        const lawnMat = new THREE.MeshLambertMaterial({ color: 0x244b28, side: THREE.DoubleSide });

        // Sector Norte (delante de la casa hasta el horizonte lejano de z = -80 a z = -3.5)
        const groundNorth = new THREE.Mesh(new THREE.PlaneGeometry(WORLD_W, 76.5), lawnMat);
        groundNorth.rotation.x = -Math.PI / 2;
        groundNorth.position.set(0, GROUND_Y, -41.75);
        scene.add(groundNorth);

        // Sector Sur (detrás de la casa y bosque posterior de z = 12.0 a z = 70.0)
        const groundSouth = new THREE.Mesh(new THREE.PlaneGeometry(WORLD_W, 58.0), lawnMat);
        groundSouth.rotation.x = -Math.PI / 2;
        groundSouth.position.set(0, GROUND_Y, 41.0);
        scene.add(groundSouth);

        // Sector Oeste (lateral izquierdo de la vivienda, x: [-180, -7.0], z: [-3.5, 12.0])
        const groundWest = new THREE.Mesh(new THREE.PlaneGeometry(173.0, 15.5), lawnMat);
        groundWest.rotation.x = -Math.PI / 2;
        groundWest.position.set(-93.5, GROUND_Y, 4.25);
        scene.add(groundWest);

        // Sector Este (lateral derecho de la vivienda, x: [7.0, 180], z: [-3.5, 12.0])
        const groundEast = new THREE.Mesh(new THREE.PlaneGeometry(173.0, 15.5), lawnMat);
        groundEast.rotation.x = -Math.PI / 2;
        groundEast.position.set(93.5, GROUND_Y, 4.25);
        scene.add(groundEast);

        // Acera cercana con bordillo
        const swMat = new THREE.MeshLambertMaterial({ color: 0x5a5f6b, side: THREE.DoubleSide });
        const swCurbMat = new THREE.MeshLambertMaterial({ color: 0x474c56, side: THREE.DoubleSide });
        const sw1 = new THREE.Mesh(new THREE.BoxGeometry(WORLD_W, 0.16, 2.4), swMat);
        sw1.position.set(0, GROUND_Y + 0.08, SIDEWALK_NEAR_Z); scene.add(sw1);
        const curb1 = new THREE.Mesh(new THREE.BoxGeometry(WORLD_W, 0.18, 0.25), swCurbMat);
        curb1.position.set(0, GROUND_Y + 0.09, SIDEWALK_NEAR_Z - 1.25); scene.add(curb1);

        // Líneas de corte de bloques en la acera a lo largo de toda la calle
        const seamMat = new THREE.MeshBasicMaterial({ color: 0x3a3f47, side: THREE.DoubleSide });
        for (let x = -175; x <= 175; x += 3.5) {
            const seam = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 2.3), seamMat);
            seam.rotation.x = -Math.PI / 2; seam.position.set(x, GROUND_Y + 0.17, SIDEWALK_NEAR_Z); scene.add(seam);
        }

        // Calzada / Asfalto de dos carriles continuo
        const roadMat = new THREE.MeshLambertMaterial({ color: 0x1f242c, side: THREE.DoubleSide });
        const road = new THREE.Mesh(new THREE.PlaneGeometry(WORLD_W, 11), roadMat);
        road.rotation.x = -Math.PI / 2; road.position.set(0, GROUND_Y + 0.02, STREET_Z); scene.add(road);

        // Línea central divisoria amarilla discontinua continua
        const lineMat = new THREE.MeshBasicMaterial({ color: 0xe5b210, side: THREE.DoubleSide });
        for (let x = -175; x <= 175; x += 5.5) {
            const line = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 0.22), lineMat);
            line.rotation.x = -Math.PI / 2; line.position.set(x, GROUND_Y + 0.035, STREET_Z); scene.add(line);
        }
        // Líneas blancas en los bordes de la calzada
        const edgeLineMat = new THREE.MeshBasicMaterial({ color: 0xdde2eb, side: THREE.DoubleSide });
        const edgeLineNear = new THREE.Mesh(new THREE.PlaneGeometry(WORLD_W, 0.15), edgeLineMat);
        edgeLineNear.rotation.x = -Math.PI / 2; edgeLineNear.position.set(0, GROUND_Y + 0.035, STREET_Z + 4.8); scene.add(edgeLineNear);
        const edgeLineFar = new THREE.Mesh(new THREE.PlaneGeometry(WORLD_W, 0.15), edgeLineMat);
        edgeLineFar.rotation.x = -Math.PI / 2; edgeLineFar.position.set(0, GROUND_Y + 0.035, STREET_Z - 4.8); scene.add(edgeLineFar);

        // Charcos reflectantes en el asfalto (activos en lluvia)
        buildRoadPuddles(GROUND_Y, STREET_Z);

        // Acera lejana con bordillo
        const sw2 = new THREE.Mesh(new THREE.BoxGeometry(WORLD_W, 0.16, 2.4), swMat);
        sw2.position.set(0, GROUND_Y + 0.08, SIDEWALK_FAR_Z); scene.add(sw2);
        const curb2 = new THREE.Mesh(new THREE.BoxGeometry(WORLD_W, 0.18, 0.25), swCurbMat);
        curb2.position.set(0, GROUND_Y + 0.09, SIDEWALK_FAR_Z + 1.25); scene.add(curb2);

        // 3. INFRAESTRUCTURA DE CALLE 90s: POSTES DE LUZ CON TRANSFORMADORES Y CABLES COLGANTES
        buildUtilityPolesAndWires(GROUND_Y, SIDEWALK_NEAR_Z, SIDEWALK_FAR_Z);

        // 4. ELEMENTOS DECORATIVOS URBANOS (Bocas de incendio, alcantarillas, buzones)
        buildStreetFurniture(GROUND_Y, SIDEWALK_NEAR_Z, SIDEWALK_FAR_Z);

        // 5. VEGETACIÓN FRONDOSA (Árboles animados por viento y arbustos)
        buildLushOutdoorVegetation(GROUND_Y, SIDEWALK_NEAR_Z, SIDEWALK_FAR_Z);
        buildExpandedResidentialTerrain(GROUND_Y);
        buildLushBackyardForest(GROUND_Y);

        // 6. CASAS DEL VECINDARIO 90s (Avenida continua residencial a ambos lados de la calle)
        buildPlayerCompleteHouse(GROUND_Y);
        buildNearSideNeighborhoodHouses(GROUND_Y, 0.0);
        buildDetailedNeighborhoodHouses(GROUND_Y, -26.5);

        // 7. TRÁFICO DINÁMICO 90s (Varios modelos de coches retro con faros que iluminan)
        createVariedOutdoorCars(GROUND_Y, STREET_Z);

        // 8. VIDA URBANA Y FAUNA (Ciclistas, Conejos en el césped, Aves volando, Luciérnagas, Persona Encapuchada)
        createOutdoorBirds();
        createRealisticCyclists(GROUND_Y, SIDEWALK_NEAR_Z, SIDEWALK_FAR_Z);
        createAnimatedWildlife(GROUND_Y);
        createOutdoorFireflies(GROUND_Y);
        buildHoodedStranger(GROUND_Y, SIDEWALK_FAR_Z);

        // 9. ILUMINACIÓN GLOBAL EXTERIOR (ILUMINACIÓN VIBRANTE, CÁLIDA Y SIN SOMBRAS OSCURAS)
        sunMoonLight = new THREE.DirectionalLight(0xfffaed, 1.45);
        sunMoonLight.position.set(10, 32, 18);
        sunMoonLight.target.position.set(0, 0, -22);
        scene.add(sunMoonLight.target);
        scene.add(sunMoonLight);

        outdoorHemiLight = new THREE.HemisphereLight(0xfffaed, 0x6b8099, 1.25);
        scene.add(outdoorHemiLight);
    }

    // ---- HORIZONTE LEJANO, MONTAÑAS MAJESTUOSAS Y TORRE DE TRANSMISIÓN ----
    function buildDistantHorizon(groundY) {
        mountainMeshes = [];
        // MeshBasicMaterial con fog: false para que de noche mantengan siempre su silueta azulada nocturna
        // y la niebla o sombras nunca las conviertan en manchas negras
        const mMat1 = new THREE.MeshBasicMaterial({ 
            color: 0x273b5a, 
            side: THREE.DoubleSide,
            fog: false
        });
        const mMat2 = new THREE.MeshBasicMaterial({ 
            color: 0x1c2b42, 
            side: THREE.DoubleSide,
            fog: false
        });
        const mMatSouth = new THREE.MeshBasicMaterial({ 
            color: 0x1a283e, 
            side: THREE.DoubleSide,
            fog: false
        });

        // 1. Cadena montañosa Norte original (Majestuosa y alta tal como le gusta al usuario)
        const northFarPeaks = [
            { x: -210, h: 45, r: 35 }, { x: -180, h: 42, r: 32 }, { x: -150, h: 48, r: 36 },
            { x: -120, h: 40, r: 30 }, { x: -90,  h: 46, r: 35 }, { x: -60,  h: 42, r: 32 },
            { x: -30,  h: 50, r: 38 }, { x: 0,    h: 44, r: 34 }, { x: 30,   h: 48, r: 36 },
            { x: 60,   h: 41, r: 31 }, { x: 90,   h: 47, r: 35 }, { x: 120,  h: 43, r: 33 },
            { x: 150,  h: 49, r: 37 }, { x: 180,  h: 42, r: 32 }, { x: 210,  h: 46, r: 35 }
        ];

        northFarPeaks.forEach(p => {
            const cone = new THREE.Mesh(new THREE.ConeGeometry(p.r, p.h, 8), mMat2.clone());
            cone.position.set(p.x, groundY + p.h / 2 - 2.0, -54.0);
            cone.scale.set(1.0, 1.0, 0.08);
            scene.add(cone);
            mountainMeshes.push({ mesh: cone, layer: 2 });
        });

        const northMidPeaks = [
            { x: -195, h: 30, r: 22 }, { x: -165, h: 32, r: 24 }, { x: -135, h: 28, r: 20 },
            { x: -105, h: 33, r: 25 }, { x: -75,  h: 29, r: 21 }, { x: -45,  h: 34, r: 26 },
            { x: -15,  h: 28, r: 20 }, { x: 15,   h: 33, r: 24 }, { x: 45,   h: 30, r: 22 },
            { x: 75,   h: 34, r: 25 }, { x: 105,  h: 29, r: 21 }, { x: 135,  h: 32, r: 23 },
            { x: 165,  h: 28, r: 20 }, { x: 195,  h: 31, r: 22 }
        ];

        northMidPeaks.forEach(p => {
            const cone = new THREE.Mesh(new THREE.ConeGeometry(p.r, p.h, 8), mMat1.clone());
            cone.position.set(p.x, groundY + p.h / 2 - 2.0, -47.0);
            cone.scale.set(1.0, 1.0, 0.08);
            scene.add(cone);
            mountainMeshes.push({ mesh: cone, layer: 1 });
        });

        // 2. Cadena montañosa Sur original (Detrás de la casa del jugador y casas vecinas)
        const southPeaks = [
            { x: -210, h: 46, r: 35 }, { x: -175, h: 42, r: 32 }, { x: -140, h: 48, r: 36 },
            { x: -105, h: 44, r: 33 }, { x: -70,  h: 50, r: 38 }, { x: -35,  h: 43, r: 32 },
            { x: 0,    h: 49, r: 37 }, { x: 35,   h: 45, r: 34 }, { x: 70,   h: 51, r: 38 },
            { x: 105,  h: 42, r: 31 }, { x: 140,  h: 47, r: 35 }, { x: 175,  h: 44, r: 33 },
            { x: 210,  h: 48, r: 36 }
        ];

        southPeaks.forEach(p => {
            const cone = new THREE.Mesh(new THREE.ConeGeometry(p.r, p.h, 8), mMatSouth.clone());
            cone.position.set(p.x, groundY + p.h / 2 - 2.0, 48.0);
            cone.scale.set(1.0, 1.0, 0.08);
            scene.add(cone);
        });

        // 3. Torres de telecomunicaciones con balizas rojas titilantes
        const tMat = new THREE.MeshLambertMaterial({ color: 0x333c4d });
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff1122 });

        [
            { x: -48, z: -38.0, h: 26 },
            { x: 62,  z: -42.0, h: 28 },
            { x: -30, z: 36.0,  h: 24 },
            { x: 45,  z: 38.0,  h: 25 }
        ].forEach((tCfg, idx) => {
            const tGroup = new THREE.Group();
            const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.45, tCfg.h, 4), tMat);
            mast.position.set(0, tCfg.h / 2, 0); tGroup.add(mast);

            [0.25, 0.5, 0.72, 0.88].forEach(pct => {
                const cross = new THREE.Mesh(new THREE.BoxGeometry(1.6 - pct * 0.6, 0.09, 0.09), tMat);
                cross.position.set(0, tCfg.h * pct, 0); tGroup.add(cross);
            });

            const beaconMesh = new THREE.Mesh(new THREE.SphereGeometry(0.32, 6, 6), beaconMat);
            beaconMesh.position.set(0, tCfg.h + 0.2, 0); tGroup.add(beaconMesh);

            const bLight = new THREE.PointLight(0xff1122, 1.8, 16);
            bLight.position.set(0, tCfg.h + 0.2, 0); tGroup.add(bLight);
            if (idx === 0) towerBeaconLight = bLight;

            tGroup.position.set(tCfg.x, groundY, tCfg.z);
            scene.add(tGroup);
        });
    }

    // ---- NUBES VOLUMÉTRICAS LOW-POLY EN EL CIELO (PANORÁMICAS) ----
    function createOutdoorClouds() {
        outdoorClouds = [];
        const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, side: THREE.DoubleSide });

        const cloudConfigs = [
            // Nubes lado Norte
            { x: -160, y: 23, z: -33, s: 1.4, speed: 0.8 },
            { x: -110, y: 19, z: -30, s: 1.6, speed: 1.1 },
            { x: -60,  y: 22, z: -33, s: 1.3, speed: 0.9 },
            { x: -15,  y: 18, z: -29, s: 1.7, speed: 1.2 },
            { x: 30,   y: 24, z: -32, s: 1.9, speed: 0.8 },
            { x: 80,   y: 20, z: -30, s: 1.4, speed: 1.1 },
            { x: 125,  y: 23, z: -31, s: 1.6, speed: 1.0 },
            { x: 170,  y: 19, z: -28, s: 1.5, speed: 1.2 },
            // Nubes lado Sur (detrás de la casa del jugador)
            { x: -140, y: 22, z: 26,  s: 1.5, speed: 1.0 },
            { x: -80,  y: 25, z: 28,  s: 1.8, speed: 0.8 },
            { x: -20,  y: 21, z: 25,  s: 1.4, speed: 1.2 },
            { x: 40,   y: 24, z: 27,  s: 1.7, speed: 0.9 },
            { x: 100,  y: 20, z: 25,  s: 1.5, speed: 1.1 },
            { x: 155,  y: 23, z: 28,  s: 1.6, speed: 1.0 }
        ];

        cloudConfigs.forEach(cfg => {
            const cGroup = new THREE.Group();
            for (let i = 0; i < 5; i++) {
                const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(1.8 * cfg.s), cloudMat);
                puff.position.set((i - 2) * 1.5 * cfg.s, (Math.random() - 0.5) * 0.8 * cfg.s, (Math.random() - 0.5) * 1.2 * cfg.s);
                puff.scale.set(1.4, 0.7, 0.9);
                cGroup.add(puff);
            }
            cGroup.position.set(cfg.x, cfg.y, cfg.z);
            scene.add(cGroup);
            outdoorClouds.push({ group: cGroup, speed: cfg.speed, baseMat: cloudMat });
        });
    }

    // ========================================================
    // DECORACIONES Y AMBIENTACIÓN ESTACIONAL (HALLOWEEN & NAVIDAD)
    // ========================================================
    function buildJackOLantern(x, y, z, rotY = 0, scale = 1.0) {
        const group = new THREE.Group();
        const pumpkinMat = new THREE.MeshLambertMaterial({ color: 0xdd5500 });
        const stemMat = new THREE.MeshLambertMaterial({ color: 0x224411 });
        const glowMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });

        const body = new THREE.Mesh(new THREE.SphereGeometry(0.28 * scale, 9, 7), pumpkinMat);
        body.scale.set(1.15, 0.85, 1.15);
        body.position.set(0, 0.22 * scale, 0);
        group.add(body);

        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03 * scale, 0.045 * scale, 0.12 * scale, 5), stemMat);
        stem.position.set(0.02 * scale, 0.44 * scale, 0);
        stem.rotation.z = -0.15;
        group.add(stem);

        // Ojos triangulares iluminados
        [-0.08 * scale, 0.08 * scale].forEach(ex => {
            const eye = new THREE.Mesh(new THREE.ConeGeometry(0.04 * scale, 0.05 * scale, 3), glowMat);
            eye.position.set(ex, 0.26 * scale, 0.28 * scale);
            eye.rotation.x = Math.PI / 2;
            group.add(eye);
        });

        // Nariz
        const nose = new THREE.Mesh(new THREE.ConeGeometry(0.025 * scale, 0.035 * scale, 3), glowMat);
        nose.position.set(0, 0.20 * scale, 0.29 * scale);
        nose.rotation.x = Math.PI / 2;
        group.add(nose);

        // Boca dentada siniestra
        const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.18 * scale, 0.04 * scale, 0.03 * scale), glowMat);
        mouth.position.set(0, 0.13 * scale, 0.28 * scale);
        group.add(mouth);

        const candleLight = new THREE.PointLight(0xff7700, 1.1 * scale, 3.5 * scale);
        candleLight.position.set(0, 0.22 * scale, 0.08 * scale);
        group.add(candleLight);

        group.position.set(x, y, z);
        group.rotation.y = rotY;
        return group;
    }

    function buildMiniChristmasTree(x, y, z, scale = 1.0) {
        const group = new THREE.Group();
        const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4a2a18 });
        const pineMat = new THREE.MeshLambertMaterial({ color: 0x184a22 });
        const starMat = new THREE.MeshBasicMaterial({ color: 0xffdd00 });

        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * scale, 0.10 * scale, 0.35 * scale, 6), trunkMat);
        trunk.position.set(0, 0.175 * scale, 0);
        group.add(trunk);

        const cones = [
            { r: 0.50 * scale, h: 0.60 * scale, y: 0.50 * scale },
            { r: 0.38 * scale, h: 0.50 * scale, y: 0.82 * scale },
            { r: 0.26 * scale, h: 0.40 * scale, y: 1.12 * scale }
        ];

        cones.forEach(c => {
            const cone = new THREE.Mesh(new THREE.ConeGeometry(c.r, c.h, 7), pineMat);
            cone.position.set(0, c.y, 0);
            group.add(cone);
        });

        // Estrella dorada
        const star = new THREE.Mesh(new THREE.DodecahedronGeometry(0.08 * scale), starMat);
        star.position.set(0, 1.38 * scale, 0);
        group.add(star);

        // Luces navideñas multicolores
        const bulbColors = [0xff2222, 0x22ff44, 0x2288ff, 0xffdd22, 0xff33cc];
        const bulbGeo = new THREE.SphereGeometry(0.03 * scale, 5, 5);
        for (let i = 0; i < 16; i++) {
            const cIdx = i % bulbColors.length;
            const bMat = new THREE.MeshBasicMaterial({ color: bulbColors[cIdx] });
            const bulb = new THREE.Mesh(bulbGeo, bMat);
            const heightPct = (i / 16);
            const radiusAtH = (1.0 - heightPct * 0.7) * 0.40 * scale;
            const angle = i * 1.65;
            bulb.position.set(
                Math.cos(angle) * radiusAtH,
                0.35 * scale + heightPct * 0.88 * scale,
                Math.sin(angle) * radiusAtH
            );
            group.add(bulb);
            seasonalBlinkLights.push({ mesh: bulb, baseColor: bulbColors[cIdx], offset: i });
        }

        const treeLight = new THREE.PointLight(0xffcc66, 1.2 * scale, 4.5 * scale);
        treeLight.position.set(0, 0.8 * scale, 0);
        group.add(treeLight);

        group.position.set(x, y, z);
        return group;
    }

    function buildSantaHat(x, y, z, scale = 1.0) {
        const group = new THREE.Group();
        const redMat = new THREE.MeshLambertMaterial({ color: 0xd41c2c });
        const whiteMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });

        // Borde blanco redondeado y grueso que asienta sobre la PC
        const brim = new THREE.Mesh(new THREE.TorusGeometry(0.13 * scale, 0.045 * scale, 8, 16), whiteMat);
        brim.rotation.x = Math.PI / 2;
        brim.position.set(0, 0.04 * scale, 0);
        group.add(brim);

        // Cono rojo con doble inclinación alegre
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.12 * scale, 0.28 * scale, 10), redMat);
        cone.position.set(0.02 * scale, 0.16 * scale, 0.01 * scale);
        cone.rotation.z = -0.35;
        cone.rotation.x = -0.15;
        group.add(cone);

        // Pompón blanco esponjoso en la punta
        const pompom = new THREE.Mesh(new THREE.SphereGeometry(0.045 * scale, 8, 8), whiteMat);
        pompom.position.set(0.13 * scale, 0.27 * scale, -0.06 * scale);
        group.add(pompom);

        group.position.set(x, y, z);
        return group;
    }

    function buildChristmasGifts(x, y, z) {
        const group = new THREE.Group();
        const giftConfigs = [
            { box: 0xd62222, rib: 0xffd700, w: 0.28, h: 0.22, d: 0.26, ox: -0.16, oz: 0.10, rot: 0.2 },
            { box: 0x168a3e, rib: 0xee2222, w: 0.22, h: 0.18, d: 0.22, ox: 0.18, oz: 0.06, rot: -0.35 },
            { box: 0x1e50c4, rib: 0xffffff, w: 0.20, h: 0.15, d: 0.20, ox: 0.02, oz: -0.18, rot: 0.6 }
        ];

        giftConfigs.forEach((g, idx) => {
            const bMat = new THREE.MeshLambertMaterial({ color: g.box });
            const rMat = new THREE.MeshLambertMaterial({ color: g.rib });

            const box = new THREE.Mesh(new THREE.BoxGeometry(g.w, g.h, g.d), bMat);
            box.position.set(g.ox, g.h / 2, g.oz);
            box.rotation.y = g.rot;
            group.add(box);

            const r1 = new THREE.Mesh(new THREE.BoxGeometry(g.w + 0.005, g.h + 0.005, 0.035), rMat);
            r1.position.copy(box.position);
            r1.rotation.y = g.rot;
            group.add(r1);

            const r2 = new THREE.Mesh(new THREE.BoxGeometry(0.035, g.h + 0.005, g.d + 0.005), rMat);
            r2.position.copy(box.position);
            r2.rotation.y = g.rot;
            group.add(r2);

            const knot = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 6), rMat);
            knot.position.set(g.ox, g.h + 0.015, g.oz);
            group.add(knot);

            interactables.push(box);
            box.userData = { type: 'xmas_gift' };
        });

        group.position.set(x, y, z);
        return group;
    }

    function buildHotCocoa(x, y, z) {
        const group = new THREE.Group();
        const mugMat = new THREE.MeshLambertMaterial({ color: 0xcc2222 });
        const cocoaMat = new THREE.MeshLambertMaterial({ color: 0x4a2414 });
        const caneMat = new THREE.MeshLambertMaterial({ color: 0xfafafa });

        const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.038, 0.09, 10), mugMat);
        mug.position.set(0, 0.045, 0);
        group.add(mug);

        const handle = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.008, 6, 10), mugMat);
        handle.position.set(0.048, 0.045, 0);
        handle.rotation.y = Math.PI / 2;
        group.add(handle);

        const cocoa = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.01, 10), cocoaMat);
        cocoa.position.set(0, 0.086, 0);
        group.add(cocoa);

        const cane = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.11, 6), caneMat);
        cane.position.set(0.015, 0.095, 0);
        cane.rotation.z = 0.35;
        group.add(cane);

        group.position.set(x, y, z);
        interactables.push(mug);
        mug.userData = { type: 'xmas_cocoa' };
        return group;
    }

    function buildSnowman(x, y, z) {
        const group = new THREE.Group();
        const snowMat = new THREE.MeshLambertMaterial({ color: 0xf2f7fc });
        const coalMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
        const carrotMat = new THREE.MeshLambertMaterial({ color: 0xff6600 });
        const scarfMat = new THREE.MeshLambertMaterial({ color: 0xcc1122 });
        const hatMat = new THREE.MeshLambertMaterial({ color: 0x222222 });

        const b1 = new THREE.Mesh(new THREE.SphereGeometry(0.65, 10, 8), snowMat);
        b1.position.set(0, 0.65, 0); group.add(b1);
        const b2 = new THREE.Mesh(new THREE.SphereGeometry(0.48, 10, 8), snowMat);
        b2.position.set(0, 1.55, 0); group.add(b2);
        const b3 = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), snowMat);
        b3.position.set(0, 2.22, 0); group.add(b3);

        const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.08, 6, 12), scarfMat);
        scarf.rotation.x = Math.PI / 2; scarf.position.set(0, 1.95, 0); group.add(scarf);

        const nose = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.24, 6), carrotMat);
        nose.rotation.x = Math.PI / 2; nose.position.set(0, 2.22, 0.38); group.add(nose);

        const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 10), hatMat);
        hatBrim.position.set(0, 2.50, 0); group.add(hatBrim);
        const hatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.40, 10), hatMat);
        hatTop.position.set(0, 2.70, 0); group.add(hatTop);

        group.position.set(x, y, z);
        return group;
    }

    function buildChristmasStockings(x, y, z) {
        const group = new THREE.Group();
        const redMat = new THREE.MeshLambertMaterial({ color: 0xcc1122 });
        const whiteMat = new THREE.MeshLambertMaterial({ color: 0xffffff });

        [-0.14, 0.14].forEach((ox, idx) => {
            const sock = new THREE.Group();
            const top = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.035, 0.035), whiteMat);
            top.position.set(0, 0.09, 0); sock.add(top);

            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.12, 0.03), redMat);
            leg.position.set(0, 0.03, 0); sock.add(leg);

            const foot = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.04, 0.03), redMat);
            foot.position.set(0.03, -0.04, 0); sock.add(foot);

            sock.position.set(ox, 0, 0);
            sock.rotation.z = (idx === 0 ? 0.08 : -0.08);
            group.add(sock);
        });

        group.position.set(x, y, z);
        return group;
    }

    function buildHalloweenCandyBowl(x, y, z) {
        const group = new THREE.Group();
        const bowlMat = new THREE.MeshLambertMaterial({ color: 0xff6600 });
        const candyMat1 = new THREE.MeshLambertMaterial({ color: 0x8800cc });
        const candyMat2 = new THREE.MeshLambertMaterial({ color: 0x22cc44 });

        const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.07, 0.065, 8), bowlMat);
        bowl.position.set(0, 0.032, 0); group.add(bowl);

        for (let i = 0; i < 6; i++) {
            const cMat = (i % 2 === 0 ? candyMat1 : candyMat2);
            const candy = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.018, 0.018), cMat);
            const ang = i * 1.05;
            candy.position.set(Math.cos(ang) * 0.05, 0.055, Math.sin(ang) * 0.05);
            candy.rotation.y = ang;
            group.add(candy);
        }

        group.position.set(x, y, z);
        interactables.push(bowl);
        bowl.userData = { type: 'halloween_candy' };
        return group;
    }

    function buildHalloweenSkull(x, y, z, rotY = 0) {
        const group = new THREE.Group();
        const skullMat = new THREE.MeshLambertMaterial({ color: 0xdcd8cb });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
        const candleMat = new THREE.MeshLambertMaterial({ color: 0x221122 });
        const flameMat = new THREE.MeshBasicMaterial({ color: 0xff7700 });

        const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 7), skullMat);
        cranium.position.set(0, 0.085, 0); cranium.scale.set(1.0, 1.1, 1.15); group.add(cranium);

        const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 0.07), skullMat);
        jaw.position.set(0, 0.03, 0.04); group.add(jaw);

        [-0.032, 0.032].forEach(ox => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.018, 5, 5), eyeMat);
            eye.position.set(ox, 0.08, 0.08); group.add(eye);
        });

        // Vela gótica al lado
        const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.12, 6), candleMat);
        candle.position.set(0.14, 0.06, 0); group.add(candle);
        const flame = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.03, 5), flameMat);
        flame.position.set(0.14, 0.13, 0); group.add(flame);

        group.position.set(x, y, z);
        group.rotation.y = rotY;
        interactables.push(cranium);
        cranium.userData = { type: 'halloween_skull' };
        return group;
    }

    function buildSpiderweb(x, y, z, scale = 1.0) {
        const group = new THREE.Group();
        
        // 1. Red geométrica de telaraña con hilos finos de seda plateada
        const webLineMat = new THREE.LineBasicMaterial({
            color: 0xefefef,
            transparent: true,
            opacity: 0.75,
            linewidth: 1.5
        });

        // Radios principales que anclan la telaraña a la esquina del techo
        const numRadials = 9;
        const radLength = 0.55 * scale;
        const radialEndPoints = [];

        for (let i = 0; i < numRadials; i++) {
            const angle = (i / (numRadials - 1)) * (Math.PI / 2); // 0 a 90 grados cubriendo la esquina
            const rx = Math.cos(angle) * radLength;
            const ry = Math.sin(angle) * radLength;
            const rz = (Math.sin(i * 1.5) * 0.04) * scale;
            radialEndPoints.push(new THREE.Vector3(rx, ry, rz));

            const radGeo = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(rx, ry, rz)
            ]);
            const radLine = new THREE.Line(radGeo, webLineMat);
            group.add(radLine);
        }

        // Espirales / anillos concéntricos conectando los radios
        const numRings = 6;
        for (let r = 1; r <= numRings; r++) {
            const ringFrac = r / numRings;
            const ringPoints = [];
            for (let i = 0; i < numRadials; i++) {
                const p = radialEndPoints[i].clone().multiplyScalar(ringFrac);
                // Ligera caída / combadura orgánica del hilo de seda por gravedad
                if (i > 0 && i < numRadials - 1) {
                    p.y -= 0.015 * scale * (1 - ringFrac);
                }
                ringPoints.push(p);
            }
            const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPoints);
            const ringLine = new THREE.Line(ringGeo, webLineMat);
            group.add(ringLine);
        }

        // 2. Araña 3D realista con cefalotórax, abdomen y 8 patas articuladas
        const spiderGroup = new THREE.Group();
        const spiderBodyMat = new THREE.MeshLambertMaterial({ color: 0x141013 });
        const spiderEyeMat = new THREE.MeshBasicMaterial({ color: 0xcc0000 });
        const legMat = new THREE.MeshLambertMaterial({ color: 0x1c171a });

        // Cefalotórax y abdomen bulboso
        const thorax = new THREE.Mesh(new THREE.SphereGeometry(0.016 * scale, 6, 6), spiderBodyMat);
        thorax.scale.set(0.9, 0.7, 1.2);
        spiderGroup.add(thorax);

        const abdomen = new THREE.Mesh(new THREE.SphereGeometry(0.026 * scale, 7, 7), spiderBodyMat);
        abdomen.scale.set(1.0, 0.85, 1.35);
        abdomen.position.set(0, 0.005 * scale, -0.032 * scale);
        spiderGroup.add(abdomen);

        // Ojos diminutos carmesí
        [-0.006, 0.006].forEach(ex => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.003 * scale, 4, 4), spiderEyeMat);
            eye.position.set(ex * scale, 0.008 * scale, 0.015 * scale);
            spiderGroup.add(eye);
        });

        // 8 Patas articuladas en 2 segmentos cada una (4 a cada lado)
        for (let side = -1; side <= 1; side += 2) {
            for (let legIdx = 0; legIdx < 4; legIdx++) {
                const legAngle = ((legIdx - 1.5) * 0.38) * side;
                const legGroup = new THREE.Group();
                legGroup.position.set(side * 0.012 * scale, 0, (legIdx - 1.5) * 0.01 * scale);

                // Segmento proximal (coxa/fémur hacia arriba y afuera)
                const seg1Len = (0.038 + Math.sin(legIdx) * 0.01) * scale;
                const seg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.0025 * scale, 0.002 * scale, seg1Len, 4), legMat);
                seg1.position.set(side * seg1Len * 0.4, seg1Len * 0.35, 0);
                seg1.rotation.z = -side * 0.8;
                seg1.rotation.y = legAngle;
                legGroup.add(seg1);

                // Segmento distal (tibia/tarso doblado hacia abajo)
                const seg2Len = (0.042 + Math.sin(legIdx) * 0.01) * scale;
                const seg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.002 * scale, 0.001 * scale, seg2Len, 4), legMat);
                seg2.position.set(side * (seg1Len * 0.75 + seg2Len * 0.3), seg1Len * 0.35 - seg2Len * 0.45, 0);
                seg2.rotation.z = side * 1.1;
                seg2.rotation.y = legAngle;
                legGroup.add(seg2);

                spiderGroup.add(legGroup);
            }
        }

        // Posicionar araña en el centro de la telaraña con rotación natural
        spiderGroup.position.set(0.18 * scale, 0.18 * scale, 0.01 * scale);
        spiderGroup.rotation.z = -0.4;
        group.add(spiderGroup);

        // Hilo de seda vertical desde el techo sosteniendo la araña
        const dropLineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0.18 * scale, 0.55 * scale, 0),
            new THREE.Vector3(0.18 * scale, 0.18 * scale, 0.01 * scale)
        ]);
        const dropLine = new THREE.Line(dropLineGeo, webLineMat);
        group.add(dropLine);

        group.position.set(x, y, z);
        return group;
    }

    function buildOutdoorBats() {
        seasonalBats = [];
        const batMat = new THREE.MeshBasicMaterial({ color: 0x121218, side: THREE.DoubleSide });
        for (let i = 0; i < 6; i++) {
            const bGroup = new THREE.Group();
            
            // Cuerpo del murciélago
            const body = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.28, 4), batMat);
            body.rotation.x = Math.PI / 2;
            bGroup.add(body);

            // Cabeza
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.06, 4, 4), batMat);
            head.position.set(0, 0, 0.16);
            bGroup.add(head);

            // Alas
            const wingL = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.16), batMat);
            wingL.position.set(-0.20, 0, 0);
            bGroup.add(wingL);

            const wingR = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.16), batMat);
            wingR.position.set(0.20, 0, 0);
            bGroup.add(wingR);

            const angle = (i / 6) * Math.PI * 2;
            const centerX = (i % 2 === 0 ? -12.0 : 14.0) + (i % 3) * 6.0;
            const radX = 16.0 + (i % 3) * 5.0;
            const radZ = 3.5 + (i % 2) * 2.0;
            const baseY = 5.2 + (i % 3) * 1.6;
            const speed = 0.28 + (i % 3) * 0.08; // Vuelo lento, sereno y realista

            bGroup.position.set(centerX + Math.cos(angle) * radX, baseY, -18.0 + Math.sin(angle) * radZ);
            bGroup.userData = { angle, centerX, radX, radZ, baseY, speed, wingL, wingR };

            if (halloweenDecorGroup) halloweenDecorGroup.add(bGroup);
            seasonalBats.push(bGroup);
        }
    }

    // ---- NUEVAS DECORACIONES FESTIVAS EXPANDIDAS ----
    function buildChristmasCookies(x, y, z) {
        const group = new THREE.Group();
        const plateMat = new THREE.MeshLambertMaterial({ color: 0xfbfbfb });
        const rimMat = new THREE.MeshLambertMaterial({ color: 0xcc2222 });
        const gingerbreadMat = new THREE.MeshLambertMaterial({ color: 0x935123 });
        const icingWhiteMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const icingRedMat = new THREE.MeshLambertMaterial({ color: 0xcc1122 });
        const icingGreenMat = new THREE.MeshLambertMaterial({ color: 0x228833 });

        // Plato de cerámica festivo
        const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.02, 12), plateMat);
        plate.position.set(0, 0.01, 0);
        group.add(plate);

        const plateRim = new THREE.Mesh(new THREE.TorusGeometry(0.175, 0.01, 6, 16), rimMat);
        plateRim.rotation.x = Math.PI / 2;
        plateRim.position.set(0, 0.018, 0);
        group.add(plateRim);

        // Galleta Hombre de Jengibre
        const manGroup = new THREE.Group();
        const head = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.008, 8), gingerbreadMat);
        head.position.set(0, 0.025, -0.05); manGroup.add(head);
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.008, 0.055), gingerbreadMat);
        torso.position.set(0, 0.025, -0.015); manGroup.add(torso);
        const armL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.008, 0.018), gingerbreadMat);
        armL.position.set(-0.035, 0.025, -0.025); armL.rotation.y = 0.3; manGroup.add(armL);
        const armR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.008, 0.018), gingerbreadMat);
        armR.position.set(0.035, 0.025, -0.025); armR.rotation.y = -0.3; manGroup.add(armR);
        const legL = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.008, 0.04), gingerbreadMat);
        legL.position.set(-0.018, 0.025, 0.025); manGroup.add(legL);
        const legR = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.008, 0.04), gingerbreadMat);
        legR.position.set(0.018, 0.025, 0.025); manGroup.add(legR);
        const dot1 = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.01, 5), icingRedMat);
        dot1.position.set(0, 0.03, -0.025); manGroup.add(dot1);
        const dot2 = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.01, 5), icingGreenMat);
        dot2.position.set(0, 0.03, -0.008); manGroup.add(dot2);
        group.add(manGroup);

        // Galleta Estrella
        const star = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.008, 5), gingerbreadMat);
        star.position.set(-0.08, 0.024, 0.04); star.rotation.y = 0.5; group.add(star);
        const starIcing = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.01, 5), icingWhiteMat);
        starIcing.position.set(-0.08, 0.028, 0.04); starIcing.rotation.y = 0.5; group.add(starIcing);

        // Galletas redondas
        const round1 = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.008, 8), gingerbreadMat);
        round1.position.set(0.08, 0.024, 0.05); group.add(round1);
        const roundIcing = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.01, 8), icingRedMat);
        roundIcing.position.set(0.08, 0.028, 0.05); group.add(roundIcing);

        group.position.set(x, y, z);
        interactables.push(plate);
        plate.userData = { type: 'xmas_cookies' };
        return group;
    }

    function buildChristmasWreath(x, y, z, rotY = 0, scale = 1.0) {
        const group = new THREE.Group();
        const pineMat = new THREE.MeshLambertMaterial({ color: 0x14451c });
        const pineHighlight = new THREE.MeshLambertMaterial({ color: 0x1e5e27 });
        const redRibbonMat = new THREE.MeshLambertMaterial({ color: 0xcc1122 });
        const goldMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });

        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.24 * scale, 0.075 * scale, 8, 16), pineMat);
        group.add(ring);
        const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.23 * scale, 0.055 * scale, 6, 12), pineHighlight);
        ring2.rotation.z = 0.2; group.add(ring2);

        // Moño rojo festivo
        const bowCenter = new THREE.Mesh(new THREE.SphereGeometry(0.035 * scale, 6, 6), redRibbonMat);
        bowCenter.position.set(0, 0.25 * scale, 0.06 * scale); group.add(bowCenter);
        [-1, 1].forEach(side => {
            const loop = new THREE.Mesh(new THREE.TorusGeometry(0.055 * scale, 0.018 * scale, 5, 8), redRibbonMat);
            loop.position.set(side * 0.06 * scale, 0.27 * scale, 0.05 * scale);
            loop.rotation.y = side * 0.4; loop.rotation.z = side * 0.3; group.add(loop);

            const tail = new THREE.Mesh(new THREE.BoxGeometry(0.028 * scale, 0.16 * scale, 0.01 * scale), redRibbonMat);
            tail.position.set(side * 0.035 * scale, 0.14 * scale, 0.06 * scale);
            tail.rotation.z = side * 0.25; group.add(tail);
        });

        // Bayas rojas
        for (let i = 0; i < 8; i++) {
            const ang = (i / 8) * Math.PI * 2;
            const berry = new THREE.Mesh(new THREE.SphereGeometry(0.018 * scale, 4, 4), redRibbonMat);
            berry.position.set(Math.cos(ang) * 0.23 * scale, Math.sin(ang) * 0.23 * scale, 0.065 * scale);
            group.add(berry);
        }

        // Campanitas doradas
        const bell = new THREE.Mesh(new THREE.ConeGeometry(0.025 * scale, 0.04 * scale, 6), goldMat);
        bell.position.set(0, 0.19 * scale, 0.07 * scale); bell.rotation.x = Math.PI; group.add(bell);

        group.position.set(x, y, z);
        group.rotation.y = rotY;
        interactables.push(ring);
        ring.userData = { type: 'xmas_wreath' };
        return group;
    }

    function buildHalloweenPotion(x, y, z) {
        const group = new THREE.Group();
        const glassMat = new THREE.MeshLambertMaterial({ color: 0x223322, transparent: true, opacity: 0.65 });
        const liquidMat = new THREE.MeshBasicMaterial({ color: 0x33ff44 });
        const corkMat = new THREE.MeshLambertMaterial({ color: 0x6e4726 });
        const waxMat = new THREE.MeshLambertMaterial({ color: 0x24142a });
        const candleFlameMat = new THREE.MeshBasicMaterial({ color: 0x9933ff });

        const flaskSphere = new THREE.Mesh(new THREE.SphereGeometry(0.08, 9, 8), glassMat);
        flaskSphere.position.set(0, 0.08, 0); group.add(flaskSphere);

        const flaskNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.07, 8), glassMat);
        flaskNeck.position.set(0, 0.17, 0); group.add(flaskNeck);

        const cork = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.020, 0.035, 7), corkMat);
        cork.position.set(0, 0.21, 0); group.add(cork);

        const liquid = new THREE.Mesh(new THREE.SphereGeometry(0.068, 7, 7), liquidMat);
        liquid.position.set(0, 0.07, 0); group.add(liquid);

        const glowLight = new THREE.PointLight(0x33ff44, 0.8, 1.8);
        glowLight.position.set(0, 0.09, 0); group.add(glowLight);

        const candleWax = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.09, 6), waxMat);
        candleWax.position.set(0.12, 0.045, 0); group.add(candleWax);
        const candleFlame = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.028, 5), candleFlameMat);
        candleFlame.position.set(0.12, 0.105, 0); group.add(candleFlame);

        group.position.set(x, y, z);
        interactables.push(flaskSphere);
        flaskSphere.userData = { type: 'halloween_potion' };
        return group;
    }

    function buildHalloweenWreath(x, y, z, rotY = 0, scale = 1.0) {
        const group = new THREE.Group();
        const branchMat = new THREE.MeshLambertMaterial({ color: 0x20191c });
        const skullMat = new THREE.MeshLambertMaterial({ color: 0xdfdacf });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xaa0000 });
        const webLineMat = new THREE.LineBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.65 });

        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.24 * scale, 0.065 * scale, 6, 12), branchMat);
        group.add(ring);

        for (let i = 0; i < 6; i++) {
            const ang = (i / 6) * Math.PI * 2;
            const twig = new THREE.Mesh(new THREE.CylinderGeometry(0.008 * scale, 0.014 * scale, 0.16 * scale, 4), branchMat);
            twig.position.set(Math.cos(ang) * 0.24 * scale, Math.sin(ang) * 0.24 * scale, 0.02 * scale);
            twig.rotation.z = ang + 0.6; group.add(twig);
        }

        const skullCenter = new THREE.Mesh(new THREE.SphereGeometry(0.045 * scale, 6, 6), skullMat);
        skullCenter.position.set(0, 0.24 * scale, 0.05 * scale); skullCenter.scale.set(1.0, 1.1, 1.1); group.add(skullCenter);
        [-0.016, 0.016].forEach(ex => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.009 * scale, 4, 4), eyeMat);
            eye.position.set(ex * scale, 0.24 * scale, 0.09 * scale); group.add(eye);
        });

        const dropLineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0.15 * scale, 0.01 * scale),
            new THREE.Vector3(0, -0.10 * scale, 0.01 * scale)
        ]);
        const dropLine = new THREE.Line(dropLineGeo, webLineMat);
        group.add(dropLine);

        group.position.set(x, y, z);
        group.rotation.y = rotY;
        interactables.push(ring);
        ring.userData = { type: 'halloween_wreath' };
        return group;
    }

    function buildSeasonalDecorations() {
        if (halloweenDecorGroup) { try { scene.remove(halloweenDecorGroup); } catch(e){} halloweenDecorGroup = null; }
        if (christmasDecorGroup) { try { scene.remove(christmasDecorGroup); } catch(e){} christmasDecorGroup = null; }
        if (snowRoofsGroup) { try { scene.remove(snowRoofsGroup); } catch(e){} snowRoofsGroup = null; }
        halloweenBedroomGroup = null;
        halloweenHouseGroup = null;
        christmasBedroomGroup = null;
        christmasHouseGroup = null;
        seasonalBlinkLights = [];
        seasonalBats = [];

        // Limpiar adornos estacionales adjuntados previamente a puertas móviles
        seasonalDoorDecorations.forEach(item => {
            if (item.mesh && item.mesh.parent) {
                try { item.mesh.parent.remove(item.mesh); } catch(e){}
            }
        });
        seasonalDoorDecorations = [];

        // Limpiar interactables de temporadas anteriores para evitar fantasmas interactivos
        interactables = interactables.filter(obj => !obj.userData || !['halloween_candy', 'halloween_skull', 'halloween_potion', 'halloween_wreath', 'xmas_cocoa', 'xmas_gift', 'xmas_cookies', 'xmas_wreath'].includes(obj.userData.type));

        const season = (typeof window.getCurrentActiveSeason === 'function') ? window.getCurrentActiveSeason() : 'default';
        const isHalloween = season === 'halloween';
        const isChristmas = season === 'christmas';
        const GY = -2.8; // Nivel de piso de planta baja
        const BY = -5.6; // Nivel de piso del sótano

        // ================================================================
        // 1. DECORACIONES DE HALLOWEEN (DORMITORIO + EXPANSIÓN MODO LIBRE TODA LA CASA)
        // ================================================================
        if (isHalloween) {
            halloweenDecorGroup = new THREE.Group();
            halloweenBedroomGroup = new THREE.Group();
            halloweenHouseGroup = new THREE.Group();
            halloweenDecorGroup.add(halloweenBedroomGroup);
            halloweenDecorGroup.add(halloweenHouseGroup);

            // ---- DORMITORIO (Planta Alta, Y = 0) ----
            const deskPumpkin = buildJackOLantern(-0.65, 0.82, BACK_WALL_Z + 1.25, -0.4, 0.55);
            halloweenBedroomGroup.add(deskPumpkin);

            const candyBowl = buildHalloweenCandyBowl(-1.75, 0.74, BACK_WALL_Z + 1.35);
            halloweenBedroomGroup.add(candyBowl);

            const skull = buildHalloweenSkull(-1.2, 2.02, BACK_WALL_Z + 0.25);
            halloweenBedroomGroup.add(skull);

            const web1 = buildSpiderweb(HALF_W - 0.3, ROOM_H - 0.3, BACK_WALL_Z + 0.3, 1.2);
            halloweenBedroomGroup.add(web1);
            const web2 = buildSpiderweb(-HALF_W + 0.3, ROOM_H - 0.3, FRONT_WALL_Z - 0.3, 1.0);
            halloweenBedroomGroup.add(web2);

            // ---- EXPANSIÓN MODO LIBRE: TODA LA CASA ----
            // 1. PASILLO PLANTA ALTA
            const webHall1 = buildSpiderweb(1.5, ROOM_H - 0.2, 5.8, 1.4);
            halloweenHouseGroup.add(webHall1);

            // Corona fijada a la puerta del dormitorio para que rote con ella y nunca quede flotando en el aire
            if (doorPivot) {
                const bedDoorWreath = buildHalloweenWreath(0.475, 1.40, 0.038, 0, 0.7);
                bedDoorWreath.userData.seasonalDoorDecor = true;
                doorPivot.add(bedDoorWreath);
                seasonalDoorDecorations.push({ mesh: bedDoorWreath, season: 'halloween', freeOnly: true });
            }

            // Poción apoyada sólidamente sobre la tabla superior de la cómoda consola (y = 0.75, z = 5.55)
            const hallPotion = buildHalloweenPotion(-0.65, 0.75, 5.55);
            halloweenHouseGroup.add(hallPotion);

            // Calabaza espaciosa junto a la baranda al inicio de la escalera
            const hallStairPumpkin = buildJackOLantern(1.1, 0.0, 5.7, -0.6, 0.65);
            halloweenHouseGroup.add(hallStairPumpkin);
            const webHallSouth = buildSpiderweb(-0.6, ROOM_H - 0.25, 4.0, 0.9);
            halloweenHouseGroup.add(webHallSouth);

            // 2. BAÑO PLANTA ALTA
            const webBathMirror = buildSpiderweb(3.45, 1.95, 4.10, 0.7);
            halloweenHouseGroup.add(webBathMirror);

            // Poción apoyada sobre la mesada del lavamanos en y = 0.78
            const bathPotion = buildHalloweenPotion(3.18, 0.78, 4.55);
            halloweenHouseGroup.add(bathPotion);

            // Calabaza asentada en el suelo del baño (y = 0.0) frente a la bañera, libre de la cortina
            const tubPumpkin = buildJackOLantern(2.30, 0.0, 3.92, 0.4, 0.52);
            halloweenHouseGroup.add(tubPumpkin);

            // Calavera gótica apoyada en la tapa del inodoro (y = 0.83) y rotada hacia el frente del baño
            const toiletSkull = buildHalloweenSkull(3.15, 0.83, 5.84, Math.PI - 0.2);
            halloweenHouseGroup.add(toiletSkull);

            // Telaraña anclada en la esquina este real del baño (x = 3.45)
            const webBathCorner = buildSpiderweb(3.45, ROOM_H - 0.25, 5.85, 1.1);
            halloweenHouseGroup.add(webBathCorner);

            // 3. ESCALERA PLANTA ALTA A PLANTA BAJA
            // Telaraña anclada en la esquina superior del techo de la escalera (en lugar de flotar en el aire)
            const webStairCeil = buildSpiderweb(0.80, ROOM_H - 0.2, 6.4, 1.2);
            halloweenHouseGroup.add(webStairCeil);
            const stairBottomPumpkin = buildJackOLantern(-0.35, GY, 9.5, -0.4, 0.8);
            halloweenHouseGroup.add(stairBottomPumpkin);

            // 4. ENTRADA Y PUERTA PRINCIPAL
            // Corona fijada al pivot de la puerta principal para rotar con ella
            if (frontDoorPivot) {
                const frontDoorWreath = buildHalloweenWreath(0.475, 1.45, 0.045, 0, 0.82);
                frontDoorWreath.userData.seasonalDoorDecor = true;
                frontDoorPivot.add(frontDoorWreath);
                seasonalDoorDecorations.push({ mesh: frontDoorWreath, season: 'halloween', freeOnly: true });
            }

            const foyerPumpkin = buildJackOLantern(0.2, GY, 10.8, -0.6, 0.95);
            halloweenHouseGroup.add(foyerPumpkin);
            const webFoyer = buildSpiderweb(-0.8, GY + ROOM_H - 0.2, 11.1, 1.2);
            halloweenHouseGroup.add(webFoyer);

            // 5. LIVING ROOM (Planta Baja, GY = -2.8)
            const fpPumpkin = buildJackOLantern(5.3, GY, 3.5, -0.3, 1.1);
            halloweenHouseGroup.add(fpPumpkin);
            const mantlePumpkin = buildJackOLantern(5.88, GY + 1.62, 4.7, 0.2, 0.45);
            halloweenHouseGroup.add(mantlePumpkin);
            const mantlePotion = buildHalloweenPotion(5.88, GY + 1.62, 3.8);
            halloweenHouseGroup.add(mantlePotion);
            const coffeSkull = buildHalloweenSkull(3.8, GY + 0.42, 7.6);
            halloweenHouseGroup.add(coffeSkull);
            const livingCandy = buildHalloweenCandyBowl(3.3, GY + 0.42, 7.9);
            halloweenHouseGroup.add(livingCandy);
            const shelfPumpkin = buildJackOLantern(3.5, GY + 1.05, 1.3, 0.4, 0.6);
            halloweenHouseGroup.add(shelfPumpkin);
            const webLiving = buildSpiderweb(3.6, GY + ROOM_H - 0.2, 1.2, 1.5);
            halloweenHouseGroup.add(webLiving);
            const webLiving2 = buildSpiderweb(6.0, GY + ROOM_H - 0.2, 10.9, 1.2);
            halloweenHouseGroup.add(webLiving2);
            const webLivingWindow = buildSpiderweb(5.8, GY + ROOM_H - 0.25, 9.8, 1.3);
            halloweenHouseGroup.add(webLivingWindow);

            // 6. COCINA / COMEDOR (Planta Baja, GY = -2.8)
            // Calabaza y calavera apoyadas limpiamente sobre la madera de la mesa del comedor (superficie en GY + 0.765)
            const tablePumpkin = buildJackOLantern(-3.45, GY + 0.765, 5.08, 0.4, 0.42);
            halloweenHouseGroup.add(tablePumpkin);
            const diningSkull = buildHalloweenSkull(-2.95, GY + 0.765, 5.32, -Math.PI / 2);
            halloweenHouseGroup.add(diningSkull);

            const kitchenCandy = buildHalloweenCandyBowl(-4.0, GY + 0.9, 10.75);
            halloweenHouseGroup.add(kitchenCandy);

            // Poción apoyada sólidamente SOBRE la mesada de la cocina (y = GY + 0.88, x = -5.80)
            const kitchenPotion = buildHalloweenPotion(-5.80, GY + 0.88, 9.6);
            halloweenHouseGroup.add(kitchenPotion);

            const webKitchen = buildSpiderweb(-5.9, GY + ROOM_H - 0.2, 3.5, 1.3);
            halloweenHouseGroup.add(webKitchen);
            const webFridge = buildSpiderweb(-5.4, GY + ROOM_H - 0.25, 3.6, 1.0);
            halloweenHouseGroup.add(webFridge);

            // 7. PUERTA Y DESCENSO AL SÓTANO
            if (basementDoorPivot) {
                const basementDoorWreath = buildHalloweenWreath(0.475, 1.45, 0.038, 0, 0.72);
                basementDoorWreath.userData.seasonalDoorDecor = true;
                basementDoorPivot.add(basementDoorWreath);
                seasonalDoorDecorations.push({ mesh: basementDoorWreath, season: 'halloween', freeOnly: true });
            }
            // Telaraña anclada en el dintel superior del portal hacia el sótano (en lugar de flotar a media altura)
            const webBasementDoor = buildSpiderweb(-0.85, GY + ROOM_H - 0.25, 4.6, 1.2);
            halloweenHouseGroup.add(webBasementDoor);
            const stairBasementSkull = buildHalloweenSkull(0.1, GY - 0.4, 3.8);
            halloweenHouseGroup.add(stairBasementSkull);

            // 8. SÓTANO (BY = -5.6)
            const basePump1 = buildJackOLantern(0.4, BY, 2.0, 0.5, 0.8);
            halloweenHouseGroup.add(basePump1);
            const basePump2 = buildJackOLantern(-0.5, BY, 3.5, -0.7, 0.65);
            halloweenHouseGroup.add(basePump2);
            const baseBoilerPumpkin = buildJackOLantern(1.2, BY, 1.0, 0.6, 1.1);
            halloweenHouseGroup.add(baseBoilerPumpkin);
            const baseSkull = buildHalloweenSkull(0.5, BY, 1.5);
            halloweenHouseGroup.add(baseSkull);
            const baseRitualSkull = buildHalloweenSkull(-1.2, BY, 2.5);
            halloweenHouseGroup.add(baseRitualSkull);
            const basePotion = buildHalloweenPotion(-3.8, BY + 1.2, 0.5);
            halloweenHouseGroup.add(basePotion);
            const webBasement = buildSpiderweb(0.7, BY + ROOM_H - 0.2, 1.2, 1.8);
            halloweenHouseGroup.add(webBasement);
            const webBasement2 = buildSpiderweb(-0.7, BY + ROOM_H - 0.2, 3.8, 1.4);
            halloweenHouseGroup.add(webBasement2);
            const webBasementPipes = buildSpiderweb(-2.5, BY + ROOM_H - 0.2, 3.8, 1.6);
            halloweenHouseGroup.add(webBasementPipes);

            // 9. PORCHE Y EXTERIOR
            const pPumpkin = buildJackOLantern(0.35, -4.5 + 0.35, -3.2, 0.2, 1.1);
            halloweenHouseGroup.add(pPumpkin);
            const pPumpkin2 = buildJackOLantern(-1.5, -4.5 + 0.30, -3.2, -0.3, 0.9);
            halloweenHouseGroup.add(pPumpkin2);

            buildOutdoorBats();

            [-20, -38, 20, 39].forEach(nx => {
                const nPump = buildJackOLantern(nx - 2.2, -4.5 + 0.25, -7.2, (Math.random() - 0.5) * 0.6, 0.9);
                halloweenHouseGroup.add(nPump);
                const nPump2 = buildJackOLantern(nx + 1.8, -4.5 + 0.20, -7.2, (Math.random() - 0.5) * 0.4, 0.65);
                halloweenHouseGroup.add(nPump2);
            });

            scene.add(halloweenDecorGroup);
        }

        // ================================================================
        // 2. DECORACIONES DE NAVIDAD (DORMITORIO + EXPANSIÓN MODO LIBRE TODA LA CASA)
        // ================================================================
        if (isChristmas) {
            christmasDecorGroup = new THREE.Group();
            christmasBedroomGroup = new THREE.Group();
            christmasHouseGroup = new THREE.Group();
            christmasDecorGroup.add(christmasBedroomGroup);
            christmasDecorGroup.add(christmasHouseGroup);

            // ---- DORMITORIO (Planta Alta, Y = 0) ----
            const bedTree = buildMiniChristmasTree(1.85, 0, BACK_WALL_Z + 0.65, 0.95);
            christmasBedroomGroup.add(bedTree);
            const gifts = buildChristmasGifts(1.85, 0, BACK_WALL_Z + 0.65);
            christmasBedroomGroup.add(gifts);
            const santaHat = buildSantaHat(-1.2, 1.37, BACK_WALL_Z + 1.05, 1.0);
            christmasBedroomGroup.add(santaHat);
            const cocoa = buildHotCocoa(-1.75, 0.75, BACK_WALL_Z + 1.25);
            christmasBedroomGroup.add(cocoa);
            const stockings = buildChristmasStockings(-1.2, 1.95, BACK_WALL_Z + 0.32);
            christmasBedroomGroup.add(stockings);

            // ---- EXPANSIÓN MODO LIBRE: TODA LA CASA ----
            // 1. PASILLO PLANTA ALTA
            const bulbColorsHall = [0xff2222, 0x22ff44, 0x2288ff, 0xffdd22, 0xff33cc];
            const hallBulbGeo = new THREE.SphereGeometry(0.03, 5, 5);
            for (let hz = 3.2; hz <= 5.8; hz += 0.32) {
                const cIdx = Math.floor((hz - 3.2) / 0.32) % bulbColorsHall.length;
                const bMat = new THREE.MeshBasicMaterial({ color: bulbColorsHall[cIdx] });
                const bulb = new THREE.Mesh(hallBulbGeo, bMat);
                bulb.position.set(0.4, ROOM_H - 0.15, hz);
                christmasHouseGroup.add(bulb);
                seasonalBlinkLights.push({ mesh: bulb, baseColor: bulbColorsHall[cIdx], offset: Math.floor(hz * 5) });
            }
            // Corona navideña montada en la puerta del dormitorio para que rote con ella
            if (doorPivot) {
                const bedDoorXmasWreath = buildChristmasWreath(0.475, 1.40, 0.038, 0, 0.7);
                bedDoorXmasWreath.userData.seasonalDoorDecor = true;
                doorPivot.add(bedDoorXmasWreath);
                seasonalDoorDecorations.push({ mesh: bedDoorXmasWreath, season: 'christmas', freeOnly: true });
            }

            // Corona navideña montada en la puerta del baño
            if (bathDoorPivot) {
                const bathDoorXmasWreath = buildChristmasWreath(-0.015, 1.45, 0.48, -Math.PI / 2, 0.65);
                bathDoorXmasWreath.userData.seasonalDoorDecor = true;
                bathDoorPivot.add(bathDoorXmasWreath);
                seasonalDoorDecorations.push({ mesh: bathDoorXmasWreath, season: 'christmas', freeOnly: true });
            }

            const hallStockings = buildChristmasStockings(-0.70, 0.85, 6.2);
            christmasHouseGroup.add(hallStockings);

            // 2. BAÑO PLANTA ALTA
            const bathMirrorWreath = buildChristmasWreath(3.45, 1.90, 4.30, -Math.PI / 2, 0.48);
            christmasHouseGroup.add(bathMirrorWreath);
            const bathCocoa = buildHotCocoa(3.18, 0.82, 4.55);
            christmasHouseGroup.add(bathCocoa);

            // 3. ESCALERA PLANTA ALTA A PLANTA BAJA
            const stairBulbGeo = new THREE.SphereGeometry(0.035, 5, 5);
            for (let sz = 6.2; sz <= 9.4; sz += 0.4) {
                const frac = (sz - 6.2) / 3.2;
                const sy = 0.0 - frac * 2.8 + 0.85;
                const cIdx = Math.floor(frac * 8) % bulbColorsHall.length;
                const bMat = new THREE.MeshBasicMaterial({ color: bulbColorsHall[cIdx] });
                const bulb = new THREE.Mesh(stairBulbGeo, bMat);
                bulb.position.set(-0.82, sy, sz);
                christmasHouseGroup.add(bulb);
                seasonalBlinkLights.push({ mesh: bulb, baseColor: bulbColorsHall[cIdx], offset: Math.floor(sz * 7) });
            }
            const stairStockings = buildChristmasStockings(-0.82, GY + 1.2, 9.4);
            christmasHouseGroup.add(stairStockings);

            // 4. ENTRADA Y PUERTA PRINCIPAL
            // Corona navideña montada en la puerta principal
            if (frontDoorPivot) {
                const frontDoorXmasWreath = buildChristmasWreath(0.475, 1.45, 0.045, 0, 0.88);
                frontDoorXmasWreath.userData.seasonalDoorDecor = true;
                frontDoorPivot.add(frontDoorXmasWreath);
                seasonalDoorDecorations.push({ mesh: frontDoorXmasWreath, season: 'christmas', freeOnly: true });
            }

            const foyerGifts = buildChristmasGifts(0.2, GY, 10.8);
            christmasHouseGroup.add(foyerGifts);

            // 5. LIVING ROOM (Planta Baja, GY = -2.8)
            const livingTree = buildMiniChristmasTree(5.5, GY, 10.2, 1.6);
            christmasHouseGroup.add(livingTree);
            const livingGifts = buildChristmasGifts(5.5, GY, 10.2);
            christmasHouseGroup.add(livingGifts);
            const fpStockings = buildChristmasStockings(5.88, GY + 1.58, 4.2);
            christmasHouseGroup.add(fpStockings);

            const bulbColorsLiving = [0xff2222, 0x22ff44, 0x2288ff, 0xffdd22, 0xffffff];
            const livingBulbGeo = new THREE.SphereGeometry(0.04, 5, 5);
            for (let lz = 2.0; lz <= 10.5; lz += 0.35) {
                const cIdx = Math.floor((lz - 2.0) / 0.35) % bulbColorsLiving.length;
                const bMat = new THREE.MeshBasicMaterial({ color: bulbColorsLiving[cIdx] });
                const bulb = new THREE.Mesh(livingBulbGeo, bMat);
                bulb.position.set(5.9, GY + ROOM_H - 0.12, lz);
                christmasHouseGroup.add(bulb);
                seasonalBlinkLights.push({ mesh: bulb, baseColor: bulbColorsLiving[cIdx], offset: Math.floor(lz * 3) });
            }
            for (let lx = 1.5; lx <= 5.5; lx += 0.35) {
                const cIdx = Math.floor((lx - 1.5) / 0.35) % bulbColorsLiving.length;
                const bMat = new THREE.MeshBasicMaterial({ color: bulbColorsLiving[cIdx] });
                const bulb = new THREE.Mesh(livingBulbGeo, bMat);
                bulb.position.set(lx, GY + ROOM_H - 0.12, 10.9);
                christmasHouseGroup.add(bulb);
                seasonalBlinkLights.push({ mesh: bulb, baseColor: bulbColorsLiving[cIdx], offset: Math.floor(lx * 4) });
            }

            const livingCocoa = buildHotCocoa(3.5, GY + 0.42, 7.7);
            christmasHouseGroup.add(livingCocoa);

            // Bandeja de galletas de jengibre navideñas en la mesa de café (interactuable)
            const livingCookies = buildChristmasCookies(3.8, GY + 0.42, 7.3);
            christmasHouseGroup.add(livingCookies);

            const sofaSantaHat = buildSantaHat(2.4, GY + 0.85, 5.5, 0.85);
            christmasHouseGroup.add(sofaSantaHat);

            // 6. COCINA / COMEDOR (Planta Baja, GY = -2.8)
            const kitchenTree = buildMiniChristmasTree(-4.2, GY + 0.89, 10.7, 0.45);
            christmasHouseGroup.add(kitchenTree);
            const diningCocoa = buildHotCocoa(-3.0, GY + 0.78, 5.0);
            christmasHouseGroup.add(diningCocoa);

            // Bandeja de galletas de jengibre en la mesa del comedor (interactuable)
            const diningCookies = buildChristmasCookies(-3.2, GY + 0.78, 5.5);
            christmasHouseGroup.add(diningCookies);

            const kitchenStockings = buildChristmasStockings(-4.5, GY + 1.6, 9.8);
            christmasHouseGroup.add(kitchenStockings);

            const kitchenBulbGeo = new THREE.SphereGeometry(0.03, 5, 5);
            for (let kz = 3.0; kz <= 10.5; kz += 0.38) {
                const cIdx = Math.floor((kz - 3.0) / 0.38) % bulbColorsLiving.length;
                const bMat = new THREE.MeshBasicMaterial({ color: bulbColorsLiving[cIdx] });
                const bulb = new THREE.Mesh(kitchenBulbGeo, bMat);
                bulb.position.set(-5.8, GY + ROOM_H - 0.12, kz);
                christmasHouseGroup.add(bulb);
                seasonalBlinkLights.push({ mesh: bulb, baseColor: bulbColorsLiving[cIdx], offset: Math.floor(kz * 6) });
            }
            const diningGifts = buildChristmasGifts(-3.2, GY, 5.8);
            christmasHouseGroup.add(diningGifts);

            // 7. PUERTA Y DESCENSO AL SÓTANO
            if (basementDoorPivot) {
                const basementDoorXmasWreath = buildChristmasWreath(0.475, 1.45, 0.038, 0, 0.72);
                basementDoorXmasWreath.userData.seasonalDoorDecor = true;
                basementDoorPivot.add(basementDoorXmasWreath);
                seasonalDoorDecorations.push({ mesh: basementDoorXmasWreath, season: 'christmas', freeOnly: true });
            }

            // 8. SÓTANO (BY = -5.6)
            const baseSanta = buildSantaHat(0.3, BY + 1.8, 2.0, 0.8);
            christmasHouseGroup.add(baseSanta);
            const baseStorageGifts = buildChristmasGifts(-1.5, BY, 2.0);
            christmasHouseGroup.add(baseStorageGifts);
            const baseDustyTree = buildMiniChristmasTree(-3.6, BY + 1.0, 0.5, 0.55);
            christmasHouseGroup.add(baseDustyTree);

            const baseBulbGeo = new THREE.SphereGeometry(0.03, 5, 5);
            for (let bz = 1.5; bz <= 3.8; bz += 0.5) {
                const cIdx = Math.floor((bz - 1.5) / 0.5) % bulbColorsLiving.length;
                const bMat = new THREE.MeshBasicMaterial({ color: bulbColorsLiving[cIdx] });
                const bulb = new THREE.Mesh(baseBulbGeo, bMat);
                bulb.position.set(0.0, BY + ROOM_H - 0.15, bz);
                christmasHouseGroup.add(bulb);
                seasonalBlinkLights.push({ mesh: bulb, baseColor: bulbColorsLiving[cIdx], offset: Math.floor(bz * 8) });
            }

            // 9. PORCHE Y EXTERIOR
            const snowman = buildSnowman(-1.6, -4.5, -5.2);
            christmasHouseGroup.add(snowman);
            const yardTree = buildMiniChristmasTree(-3.5, -4.5, -4.0, 1.4);
            christmasHouseGroup.add(yardTree);
            const snowman2 = buildSnowman(2.5, -4.5, -5.8);
            christmasHouseGroup.add(snowman2);

            const bulbColors = [0xff2222, 0x22ff44, 0x2288ff, 0xffdd22, 0xffffff];
            const porchBulbGeo = new THREE.SphereGeometry(0.04, 5, 5);
            for (let bx = -2.5; bx <= 2.5; bx += 0.25) {
                const bMat = new THREE.MeshBasicMaterial({ color: bulbColors[Math.abs(Math.floor(bx * 10)) % bulbColors.length] });
                const bulb = new THREE.Mesh(porchBulbGeo, bMat);
                bulb.position.set(0.8 + bx, -4.5 + 2.32, -3.2);
                christmasHouseGroup.add(bulb);
                seasonalBlinkLights.push({ mesh: bulb, baseColor: bMat.color.getHex(), offset: Math.floor(bx * 7) });
            }
            for (let bx = -3.0; bx <= 3.0; bx += 0.3) {
                const bMat = new THREE.MeshBasicMaterial({ color: bulbColors[Math.abs(Math.floor(bx * 8)) % bulbColors.length] });
                const bulb = new THREE.Mesh(porchBulbGeo, bMat);
                bulb.position.set(bx, -4.5 + 5.6 + 0.3, -3.5);
                christmasHouseGroup.add(bulb);
                seasonalBlinkLights.push({ mesh: bulb, baseColor: bMat.color.getHex(), offset: Math.floor(bx * 11) });
            }

            [-20, -38, 20, 39].forEach((nx, idx) => {
                if (idx % 2 === 0) {
                    const nSnow = buildSnowman(nx + 2.0, -4.5, -5.5);
                    christmasHouseGroup.add(nSnow);
                }
                const nTree = buildMiniChristmasTree(nx - 1.5, -4.5, -4.5, 1.2);
                christmasHouseGroup.add(nTree);
            });

            scene.add(christmasDecorGroup);
        }

        applySeasonalEnvironment();
    }

    function applySeasonalEnvironment() {
        const season = (typeof window.getCurrentActiveSeason === 'function') ? window.getCurrentActiveSeason() : 'default';
        const isHalloween = season === 'halloween';
        const isChristmas = season === 'christmas';
        const isFree = !!(window.state && window.state.freeRoam);

        if (halloweenDecorGroup) {
            halloweenDecorGroup.visible = isHalloween;
            if (halloweenHouseGroup) {
                halloweenHouseGroup.visible = isHalloween && isFree;
            }
        }
        if (christmasDecorGroup) {
            christmasDecorGroup.visible = isChristmas;
            if (christmasHouseGroup) {
                christmasHouseGroup.visible = isChristmas && isFree;
            }
        }

        // Sincronizar visibilidad de adornos estacionales montados sobre puertas móviles
        seasonalDoorDecorations.forEach(item => {
            if (item.mesh) {
                const matchesSeason = item.season === season;
                const matchesMode = !item.freeOnly || isFree;
                item.mesh.visible = matchesSeason && matchesMode;
            }
        });

        // Ajuste de las luces de hadas del dormitorio
        if (fairyLightsGroup && fairyLightsGroup.children) {
            fairyLightsGroup.children.forEach((child, idx) => {
                if (child.material) {
                    if (isHalloween) {
                        child.material.color.setHex(idx % 2 === 0 ? 0xff5500 : 0x8800ff);
                    } else if (isChristmas) {
                        const cArr = [0xff2222, 0x22ff44, 0xffdd22, 0x2288ff];
                        child.material.color.setHex(cArr[idx % cArr.length]);
                    } else {
                        child.material.color.setHex(0xffaa33);
                    }
                }
            });
        }

        console.log(`[DarkLink 3D] Ambiente estacional aplicado: ${season.toUpperCase()} (Modo Libre Casa: ${isFree ? 'ACTIVO' : 'SÓLO DORMITORIO'})`);
    }

    window.applySeasonalEnvironment = applySeasonalEnvironment;

    // ---- CHARCOS DE AGUA EN LA CALLE ----
    function buildRoadPuddles(groundY, streetZ) {
        outdoorPuddles = [];
        const puddleMat = new THREE.MeshBasicMaterial({ color: 0x3d5a7d, transparent: true, opacity: 0.0, side: THREE.DoubleSide });
        const pConfigs = [
            { x: -60, z: streetZ + 1.5, rx: 2.5, rz: 1.3 },
            { x: -35, z: streetZ - 1.8, rx: 3.0, rz: 1.4 },
            { x: -14, z: streetZ + 1.8, rx: 2.2, rz: 1.2 },
            { x: 6,   z: streetZ - 2.0, rx: 2.8, rz: 1.5 },
            { x: 28,  z: streetZ + 1.2, rx: 2.0, rz: 1.1 },
            { x: 55,  z: streetZ - 1.6, rx: 2.7, rz: 1.3 },
            { x: 85,  z: streetZ + 1.4, rx: 3.1, rz: 1.5 }
        ];
        pConfigs.forEach(p => {
            const puddle = new THREE.Mesh(new THREE.PlaneGeometry(p.rx, p.rz), puddleMat);
            puddle.rotation.x = -Math.PI / 2;
            puddle.position.set(p.x, groundY + 0.04, p.z);
            scene.add(puddle);
            outdoorPuddles.push(puddle);
        });
    }

    // ---- POSTES DE LUZ 90s, TRANSFORMADORES Y CABLES COLGANTES ----
    function buildUtilityPolesAndWires(groundY, nearZ, farZ) {
        const poleMat = new THREE.MeshLambertMaterial({ color: 0x2e2015, side: THREE.DoubleSide });
        const crossMat = new THREE.MeshLambertMaterial({ color: 0x3d2b1c, side: THREE.DoubleSide });
        const transfMat = new THREE.MeshLambertMaterial({ color: 0x38453a, side: THREE.DoubleSide });
        const insulatorMat = new THREE.MeshBasicMaterial({ color: 0xd9e2ec });
        const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffbb44 });
        const wireMat = new THREE.MeshBasicMaterial({ color: 0x11161d });

        const polePositionsNear = [-142, -120, -98, -76, -54, -32, -10, 12, 34, 56, 78, 100, 122, 144];
        const poleTopPoints = [];

        polePositionsNear.forEach((x, idx) => {
            const poleH = 7.5;
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, poleH, 8), poleMat);
            pole.position.set(x, groundY + poleH / 2, nearZ + 0.2); scene.add(pole);

            // Cruceta superior horizontal
            const cross = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.08), crossMat);
            cross.position.set(x, groundY + poleH - 0.3, nearZ + 0.2); scene.add(cross);

            // Aisladores de porcelana
            [-1.0, 0, 1.0].forEach(ox => {
                const ins = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 6), insulatorMat);
                ins.position.set(x + ox, groundY + poleH - 0.2, nearZ + 0.2); scene.add(ins);
            });

            // Brazo de farola con pantalla curva (conectado al poste en nearZ + 0.2)
            const arm = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.06, 0.06), poleMat);
            arm.position.set(x - 0.7, groundY + poleH - 0.8, nearZ + 0.2); scene.add(arm);

            const shade = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.18, 8), poleMat);
            shade.position.set(x - 1.4, groundY + poleH - 0.9, nearZ + 0.2); scene.add(shade);

            const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), bulbMat);
            bulb.position.set(x - 1.4, groundY + poleH - 1.0, nearZ + 0.2); scene.add(bulb);

            const stLight = new THREE.PointLight(0xffbb44, 3.8, 22);
            stLight.position.set(x - 1.4, groundY + poleH - 1.1, nearZ + 0.2); scene.add(stLight);
            outdoorStreetlights.push(stLight);

            // Transformador cilíndrico verde en algunos postes alternos
            if (idx % 2 === 1) {
                const transf = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.75, 8), transfMat);
                transf.position.set(x + 0.24, groundY + poleH - 1.4, nearZ + 0.2); scene.add(transf);
            }

            poleTopPoints.push(new THREE.Vector3(x, groundY + poleH - 0.2, nearZ + 0.2));
        });

        // Cables de electricidad combados / caídos entre postes
        for (let i = 0; i < poleTopPoints.length - 1; i++) {
            const p1 = poleTopPoints[i];
            const p2 = poleTopPoints[i + 1];
            [-0.9, 0.9].forEach(ox => {
                const curve = new THREE.QuadraticBezierCurve3(
                    new THREE.Vector3(p1.x + ox, p1.y, p1.z),
                    new THREE.Vector3((p1.x + p2.x) / 2 + ox, p1.y - 0.65, (p1.z + p2.z) / 2),
                    new THREE.Vector3(p2.x + ox, p2.y, p2.z)
                );
                const pts = curve.getPoints(12);
                const wireGeo = new THREE.BufferGeometry().setFromPoints(pts);
                const wire = new THREE.Line(wireGeo, wireMat);
                scene.add(wire);
                outdoorPowerlines.push(wire);
            });
        }
    }

    // ---- ELEMENTOS DECORATIVOS DE CALLE ----
    function buildStreetFurniture(groundY, nearZ, farZ) {
        // Bocas de incendio rojas vintage
        [-45, 3.2, 52, 105].forEach(x => {
            const hydGroup = new THREE.Group();
            const hydMat = new THREE.MeshLambertMaterial({ color: 0xcc2222 });
            const capMat = new THREE.MeshLambertMaterial({ color: 0xd4a017 });
            const hydBody = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.55, 8), hydMat);
            hydBody.position.set(0, 0.27, 0); hydGroup.add(hydBody);
            const hydCap = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), capMat);
            hydCap.position.set(0, 0.55, 0); hydGroup.add(hydCap);
            const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.35, 6), capMat);
            nozzle.rotation.z = Math.PI / 2; nozzle.position.set(0, 0.32, 0); hydGroup.add(nozzle);
            hydGroup.position.set(x, groundY + 0.16, nearZ - 0.6);
            scene.add(hydGroup);
        });

        // Buzones de correo residenciales 90s en postes de madera
        [-132, -114, -96, -78, -60, -44, -26, -10, 4, 22, 38, 56, 74, 92, 110, 128, 146].forEach(x => {
            const mbGroup = new THREE.Group();
            const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.85, 0.08), new THREE.MeshLambertMaterial({ color: 0x3d2617 }));
            post.position.set(0, 0.42, 0); mbGroup.add(post);

            const box = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.42), new THREE.MeshLambertMaterial({ color: 0x223040 }));
            box.position.set(0, 0.95, 0); mbGroup.add(box);

            const flag = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.12, 0.08), new THREE.MeshBasicMaterial({ color: 0xee2222 }));
            flag.position.set(0.13, 1.0, -0.1); mbGroup.add(flag);

            mbGroup.position.set(x, groundY + 0.16, farZ + 0.8);
            scene.add(mbGroup);
        });

        // Contenedores de basura residenciales en la acera
        [-90, -62, -18, 14, 30, 68, 112].forEach(x => {
            const can = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.17, 0.65, 8), new THREE.MeshLambertMaterial({ color: 0x1c2b1e }));
            can.position.set(x, groundY + 0.48, nearZ + 0.4);
            scene.add(can);
        });
    }

    // ---- VEGETACIÓN FRONDOSA (ÁRBOLES Y ARBUSTOS SOLO EN JARDINES, NUNCA EN LA CALLE) ----
    function buildLushOutdoorVegetation(groundY, nearZ, farZ) {
        outdoorTrees = [];
        const trunkMat = new THREE.MeshLambertMaterial({ color: 0x3a2312, side: THREE.DoubleSide });
        const foliageMat1 = new THREE.MeshLambertMaterial({ color: 0x235e2e, side: THREE.DoubleSide });
        const foliageMat2 = new THREE.MeshLambertMaterial({ color: 0x2f7a3b, side: THREE.DoubleSide });
        const pineMat = new THREE.MeshLambertMaterial({ color: 0x1a4524, side: THREE.DoubleSide });
        const bushMat = new THREE.MeshLambertMaterial({ color: 0x286333, side: THREE.DoubleSide });

        // nearZ = -9.0, farZ = -21.0
        // Zona segura de jardines cerca (z > -7.5, detrás de acera cercana)
        // Zona segura de jardines lejos (z < -22.5, detrás de acera lejana)

        // 1. Árboles caducifolios frondosos en JARDINES ENTRE CASAS (Lado cercano)
        const deciduousTrees = [
            // Espacios verdes abiertos entre las casas del lado cercano (nunca sobre las paredes/tejados)
            { x: -9.0,   z: -5.8, h: 6.2, r: 1.8, mat: foliageMat1 },
            { x: -28.8,  z: -5.8, h: 6.0, r: 1.7, mat: foliageMat2 },
            { x: -48.2,  z: -5.8, h: 6.4, r: 1.8, mat: foliageMat1 },
            { x: -67.9,  z: -5.8, h: 6.2, r: 1.7, mat: foliageMat2 },
            { x: -87.9,  z: -5.8, h: 6.5, r: 1.8, mat: foliageMat1 },
            { x: -109.2, z: -5.8, h: 6.2, r: 1.7, mat: foliageMat2 },
            { x: -130.8, z: -5.8, h: 6.0, r: 1.8, mat: foliageMat1 },

            { x: 10.6,   z: -5.8, h: 6.2, r: 1.8, mat: foliageMat2 },
            { x: 29.3,   z: -5.8, h: 6.0, r: 1.7, mat: foliageMat1 },
            { x: 49.2,   z: -5.8, h: 6.5, r: 1.8, mat: foliageMat2 },
            { x: 68.8,   z: -5.8, h: 6.2, r: 1.7, mat: foliageMat1 },
            { x: 89.9,   z: -5.8, h: 6.4, r: 1.8, mat: foliageMat2 },
            { x: 112.2,  z: -5.8, h: 6.2, r: 1.7, mat: foliageMat1 },
            { x: 133.7,  z: -5.8, h: 6.5, r: 1.8, mat: foliageMat2 },

            // Jardines del lado lejano (en el patio trasero detrás de las casas de enfrente, z = -34 a -38)
            { x: -30,  z: farZ - 13.0, h: 7.2, r: 2.2, mat: foliageMat1 },
            { x: -65,  z: farZ - 12.5, h: 6.8, r: 2.1, mat: foliageMat2 },
            { x: -100, z: farZ - 13.0, h: 7.2, r: 2.2, mat: foliageMat1 },
            { x: -135, z: farZ - 12.5, h: 6.8, r: 2.0, mat: foliageMat2 },
            { x: 35,   z: farZ - 12.8, h: 7.0, r: 2.1, mat: foliageMat1 },
            { x: 70,   z: farZ - 13.2, h: 7.2, r: 2.2, mat: foliageMat2 },
            { x: 105,  z: farZ - 12.8, h: 7.0, r: 2.1, mat: foliageMat1 },
            { x: 140,  z: farZ - 12.6, h: 6.8, r: 2.0, mat: foliageMat2 }
        ];

        deciduousTrees.forEach((t, idx) => {
            const tGroup = new THREE.Group();
            const trunkH = t.h * 0.75;
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, trunkH, 7), trunkMat);
            trunk.position.set(0, trunkH / 2, 0); tGroup.add(trunk);

            const c1 = new THREE.Mesh(new THREE.DodecahedronGeometry(t.r), t.mat);
            c1.position.set(0, trunkH + t.r * 0.35, 0); tGroup.add(c1);
            const c2 = new THREE.Mesh(new THREE.DodecahedronGeometry(t.r * 0.75), t.mat);
            c2.position.set(0.3, trunkH + t.r * 0.75, 0.15); tGroup.add(c2);

            tGroup.position.set(t.x, groundY, t.z);
            scene.add(tGroup);
            outdoorTrees.push({ mesh: tGroup, swaySpeed: 1.2 + (idx % 3) * 0.3, swayAmp: 0.02 });
        });

        // 2. Pinos perennes / coníferas SOLO en espacios despejados y patios traseros
        const pineTrees = [
            // Patios traseros seguros (z = +12.0 a +16.0, detrás de la casa del jugador)
            { x: -15,  z: 13.0 }, { x: -45,  z: 14.0 }, { x: -75,  z: 13.5 },
            { x: -105, z: 14.0 }, { x: 18,   z: 13.0 }, { x: 48,   z: 14.0 },
            { x: 78,   z: 13.5 }, { x: 108,  z: 14.0 },
            // Patios traseros lejanos (detrás de las casas de enfrente, z = -35 a -38)
            { x: -45,  z: farZ - 14.5 }, { x: -80,  z: farZ - 14.5 },
            { x: -115, z: farZ - 14.5 }, { x: -145, z: farZ - 14.5 },
            { x: 50,   z: farZ - 14.5 }, { x: 90,   z: farZ - 14.5 },
            { x: 125,  z: farZ - 14.5 }, { x: 145,  z: farZ - 14.5 }
        ];

        pineTrees.forEach(p => {
            const pGroup = new THREE.Group();
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 5.0, 6), trunkMat);
            trunk.position.set(0, 2.5, 0); pGroup.add(trunk);

            [0, 1.1, 2.2].forEach((yo, i) => {
                const cone = new THREE.Mesh(new THREE.ConeGeometry(1.8 - i * 0.4, 1.9, 6), pineMat);
                cone.position.set(0, 3.6 + yo, 0); pGroup.add(cone);
            });
            pGroup.position.set(p.x, groundY, p.z);
            scene.add(pGroup);
            outdoorTrees.push({ mesh: pGroup, swaySpeed: 1.5, swayAmp: 0.015 });
        });

        // 3. Setos y arbustos en jardines de ambos lados (cerca y lejos)
        for (let x = -150; x <= 150; x += 10) {
            if (Math.abs(x - 0.8) < 3.5) continue;
            // Lado cercano (detrás de la acera cercana)
            const bushNear = new THREE.Mesh(new THREE.DodecahedronGeometry(0.75), bushMat);
            bushNear.scale.set(1.3, 0.7, 1.0);
            bushNear.position.set(x, groundY + 0.5, -7.8);
            scene.add(bushNear);

            // Lado lejano (detrás de la acera lejana)
            const bushFar = new THREE.Mesh(new THREE.DodecahedronGeometry(0.65), bushMat);
            bushFar.scale.set(1.2, 0.65, 0.9);
            bushFar.position.set(x + 5, groundY + 0.4, farZ - 1.5);
            scene.add(bushFar);
        }
    }

    // ---- TERRENO RESIDENCIAL EXPANDIDO Y JARDINES EN TODO EL VECINDARIO ----
    function buildExpandedResidentialTerrain(groundY) {
        outdoorGrassTufts = [];
        const fenceMat = new THREE.MeshLambertMaterial({ color: 0xdcd5c5, side: THREE.DoubleSide });
        const postMat = new THREE.MeshLambertMaterial({ color: 0xb5ad9e });
        const gardenMat = new THREE.MeshLambertMaterial({ color: 0x2d4826 });
        const flowerMat1 = new THREE.MeshBasicMaterial({ color: 0xff6b81 });
        const flowerMat2 = new THREE.MeshBasicMaterial({ color: 0xfeca57 });
        const flowerMat3 = new THREE.MeshBasicMaterial({ color: 0x54a0ff });
        const flowerMat4 = new THREE.MeshBasicMaterial({ color: 0xc56cf0 });
        const stoneMat = new THREE.MeshLambertMaterial({ color: 0x777b85 });
        const grassBladeMat = new THREE.MeshLambertMaterial({ color: 0x388235, side: THREE.DoubleSide });

        // 1. Cercas de madera blanca en el jardín del jugador
        // Cerca Izquierda
        for (let x = -3.8; x >= -14.0; x -= 1.8) {
            const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.15, 0.12), postMat);
            post.position.set(x, groundY + 0.575, -3.1); scene.add(post);
            const rail1 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.04), fenceMat);
            rail1.position.set(x - 0.9, groundY + 0.85, -3.1); scene.add(rail1);
            const rail2 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.04), fenceMat);
            rail2.position.set(x - 0.9, groundY + 0.40, -3.1); scene.add(rail2);
            for (let px = x - 0.35; px >= x - 1.5; px -= 0.38) {
                const picket = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.95, 0.025), fenceMat);
                picket.position.set(px, groundY + 0.55, -3.08); scene.add(picket);
            }
        }
        // Cerca Derecha
        for (let x = 7.6; x <= 14.0; x += 1.8) {
            const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.15, 0.12), postMat);
            post.position.set(x, groundY + 0.575, -3.1); scene.add(post);
            const rail1 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.04), fenceMat);
            rail1.position.set(x + 0.9, groundY + 0.85, -3.1); scene.add(rail1);
            const rail2 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.04), fenceMat);
            rail2.position.set(x + 0.9, groundY + 0.40, -3.1); scene.add(rail2);
            for (let px = x + 0.35; px <= x + 1.5; px += 0.38) {
                const picket = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.95, 0.025), fenceMat);
                picket.position.set(px, groundY + 0.55, -3.08); scene.add(picket);
            }
        }

        // 2. Parterres de flores distribuidos por TODO el vecindario (ambos lados de la calle)
        const gardenPositions = [
            // Lado cercano (jardines de las casas del jugador y vecinos)
            { x: -6.5, z: -4.5 }, { x: -11.0, z: -4.5 }, { x: 10.5, z: -4.5 }, { x: 15.0, z: -4.5 },
            { x: -25.0, z: -4.0 }, { x: -42.0, z: -4.5 }, { x: -62.0, z: -4.0 }, { x: -82.0, z: -4.5 },
            { x: -102.0, z: -4.0 }, { x: -125.0, z: -4.5 },
            { x: 25.0, z: -4.0 }, { x: 43.0, z: -4.5 }, { x: 63.0, z: -4.0 }, { x: 83.0, z: -4.5 },
            { x: 105.0, z: -4.0 }, { x: 128.0, z: -4.5 },
            // Lado lejano (jardines de las casas de enfrente)
            { x: -30.0, z: -23.5 }, { x: -55.0, z: -24.0 }, { x: -80.0, z: -23.5 }, { x: -108.0, z: -24.0 },
            { x: -135.0, z: -23.5 },
            { x: 30.0, z: -23.5 }, { x: 58.0, z: -24.0 }, { x: 85.0, z: -23.5 }, { x: 112.0, z: -24.0 },
            { x: 138.0, z: -23.5 }
        ];

        gardenPositions.forEach(gp => {
            const bed = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.12, 1.2), gardenMat);
            bed.position.set(gp.x, groundY + 0.06, gp.z); scene.add(bed);

            for (let fx = -0.9; fx <= 0.9; fx += 0.5) {
                for (let fz = -0.35; fz <= 0.35; fz += 0.35) {
                    const fMats = [flowerMat1, flowerMat2, flowerMat3, flowerMat4];
                    const fColor = fMats[Math.floor(Math.random() * fMats.length)];
                    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.22, 5), gardenMat);
                    stem.position.set(gp.x + fx, groundY + 0.22, gp.z + fz); scene.add(stem);
                    const blossom = new THREE.Mesh(new THREE.DodecahedronGeometry(0.065), fColor);
                    blossom.position.set(gp.x + fx, groundY + 0.33, gp.z + fz); scene.add(blossom);
                }
            }
        });

        // 3. Senderos de piedras en varios jardines del vecindario
        [-5.5, 9.5, -25.0, -55.0, 30.0, 62.0, -90.0, 100.0].forEach(sx => {
            const sz0 = (Math.abs(sx) < 16) ? -3.8 : -3.5;
            for (let sz = sz0; sz >= sz0 - 2.8; sz -= 0.9) {
                const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.04, 7), stoneMat);
                stone.position.set(sx + (Math.random() - 0.5) * 0.15, groundY + 0.02, sz);
                scene.add(stone);
            }
        });

        // 4. Pasto 3D disperso por TODO el vecindario (ambos lados de la calle)
        for (let i = 0; i < 180; i++) {
            const gx = (Math.random() - 0.5) * 280;
            // Elegir zona: jardín cercano (z = -2 a -7.5) o jardín lejano (z = -22.5 a -28)
            let gz;
            if (Math.random() > 0.4) {
                gz = -2.5 - Math.random() * 5.0;
            } else {
                gz = -23.0 - Math.random() * 5.0;
            }
            // No poner pasto dentro de la vivienda, sótano ni sobre los caminos de entrada
            if (Math.abs(gx) < 7.0 && gz >= -3.5 && gz <= 12.0) continue;
            if (Math.abs(gx - 0.8) < 1.2) continue;

            const tuftGroup = new THREE.Group();
            for (let b = 0; b < 3; b++) {
                const blade = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.32 + Math.random() * 0.15), grassBladeMat);
                blade.rotation.y = (b * Math.PI) / 3;
                blade.rotation.x = 0.1;
                blade.position.y = 0.16;
                tuftGroup.add(blade);
            }
            tuftGroup.position.set(gx, groundY, gz);
            scene.add(tuftGroup);
            outdoorGrassTufts.push({ group: tuftGroup, baseRotX: 0.1, speed: 1.5 + Math.random() * 1.5 });
        }
    }

    // ---- FAUNA ANIMADA EN TODO EL VECINDARIO (CONEJOS, GATOS Y AVES DE CÉSPED) ----
    function createAnimatedWildlife(groundY) {
        outdoorRabbits = [];
        outdoorCats = [];
        outdoorGroundBirds = [];

        const whiteFur = new THREE.MeshLambertMaterial({ color: 0xf5f3ee });
        const brownFur = new THREE.MeshLambertMaterial({ color: 0x8a583e });
        const grayFur = new THREE.MeshLambertMaterial({ color: 0x88929a });
        const pinkMat = new THREE.MeshBasicMaterial({ color: 0xffb8b8 });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

        // 1. Conejos distribuidos en jardines de TODAS las casas (cerca y enfrente)
        const rabbitSpawns = [
            // Cerca de la casa del jugador
            { x: -5.5, z: -4.8, fur: whiteFur },
            { x: -12.0, z: -5.2, fur: brownFur },
            { x: -8.5, z: -6.0, fur: whiteFur },
            { x: 11.0, z: -4.8, fur: brownFur },
            { x: 15.5, z: -5.5, fur: whiteFur },
            { x: 3.5, z: -6.2, fur: brownFur },
            // Jardines de vecinos a la izquierda
            { x: -28.0, z: -4.5, fur: grayFur },
            { x: -45.0, z: -5.0, fur: whiteFur },
            { x: -65.0, z: -4.8, fur: brownFur },
            { x: -95.0, z: -5.2, fur: grayFur },
            { x: -130.0, z: -4.6, fur: whiteFur },
            // Jardines de vecinos a la derecha
            { x: 32.0, z: -4.6, fur: grayFur },
            { x: 52.0, z: -5.0, fur: whiteFur },
            { x: 75.0, z: -4.8, fur: brownFur },
            { x: 110.0, z: -5.2, fur: whiteFur },
            { x: 135.0, z: -4.5, fur: brownFur },
            // Jardines de casas de enfrente (acera lejana)
            { x: -35.0, z: -23.5, fur: brownFur },
            { x: -75.0, z: -24.0, fur: whiteFur },
            { x: 45.0, z: -23.8, fur: grayFur },
            { x: 95.0, z: -24.2, fur: whiteFur }
        ];

        rabbitSpawns.forEach((spawn) => {
            const rGroup = new THREE.Group();

            // Cuerpo esponjoso
            const body = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18), spawn.fur);
            body.scale.set(1.25, 0.95, 0.95);
            body.position.set(0, 0.18, 0); rGroup.add(body);

            // Cabeza
            const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12), spawn.fur);
            head.position.set(0.18, 0.28, 0); rGroup.add(head);

            // Hocico rosado
            const nose = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.04), pinkMat);
            nose.position.set(0.28, 0.26, 0); rGroup.add(nose);

            // Ojos negros brillantes
            const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.02, 5, 5), eyeMat);
            eye1.position.set(0.22, 0.32, 0.08); rGroup.add(eye1);
            const eye2 = new THREE.Mesh(new THREE.SphereGeometry(0.02, 5, 5), eyeMat);
            eye2.position.set(0.22, 0.32, -0.08); rGroup.add(eye2);

            // Orejas largas
            const earL = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.20, 0.06), spawn.fur);
            earL.position.set(0.12, 0.44, 0.05); earL.rotation.z = -0.2; rGroup.add(earL);

            const earR = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.20, 0.06), spawn.fur);
            earR.position.set(0.12, 0.44, -0.05); earR.rotation.z = -0.2; rGroup.add(earR);

            // Colita de pompón
            const tail = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 6), whiteFur);
            tail.position.set(-0.20, 0.20, 0); rGroup.add(tail);

            // Patitas
            [[-0.12, -0.08], [-0.12, 0.08], [0.12, -0.08], [0.12, 0.08]].forEach(ppos => {
                const paw = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.06), spawn.fur);
                paw.position.set(ppos[0], 0.04, ppos[1]); rGroup.add(paw);
            });

            rGroup.position.set(spawn.x, groundY, spawn.z);
            scene.add(rGroup);

            outdoorRabbits.push({
                group: rGroup,
                earL,
                earR,
                originX: spawn.x,
                originZ: spawn.z,
                currentX: spawn.x,
                currentZ: spawn.z,
                targetX: spawn.x + (Math.random() - 0.5) * 2.5,
                targetZ: spawn.z + (Math.random() - 0.5) * 2.0,
                hopTimer: 0,
                hopDuration: 0.42,
                pauseTimer: 1.5 + Math.random() * 3.5,
                isHopping: false,
                hopHeight: 0.22,
                earWiggleTimer: Math.random() * 5.0
            });
        });

        // 2. Gatos domésticos del vecindario en porches y jardines
        const catConfigs = [
            { x: -20.0, z: -4.2, color: 0xd35400 }, // Gato atigrado naranja
            { x: 39.0, z: -4.2, color: 0x1e272e },  // Gato negro
            { x: -78.0, z: -4.2, color: 0x7f8c8d }, // Gato gris
            { x: 79.0, z: -4.2, color: 0xf5f6fa }   // Gato blanco
        ];

        catConfigs.forEach(cfg => {
            const catGroup = new THREE.Group();
            const catMat = new THREE.MeshLambertMaterial({ color: cfg.color });

            // Cuerpo descansando
            const cBody = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.22, 0.24), catMat);
            cBody.position.set(0, 0.11, 0); catGroup.add(cBody);

            // Cabeza con orejitas triangulares
            const cHead = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), catMat);
            cHead.position.set(0.24, 0.22, 0); catGroup.add(cHead);

            const ear1 = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.08, 4), catMat);
            ear1.position.set(0.24, 0.34, 0.06); catGroup.add(ear1);
            const ear2 = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.08, 4), catMat);
            ear2.position.set(0.24, 0.34, -0.06); catGroup.add(ear2);

            // Ojos
            const cEye1 = new THREE.Mesh(new THREE.SphereGeometry(0.02, 4, 4), new THREE.MeshBasicMaterial({ color: 0x2ed573 }));
            cEye1.position.set(0.32, 0.24, 0.05); catGroup.add(cEye1);
            const cEye2 = new THREE.Mesh(new THREE.SphereGeometry(0.02, 4, 4), new THREE.MeshBasicMaterial({ color: 0x2ed573 }));
            cEye2.position.set(0.32, 0.24, -0.05); catGroup.add(cEye2);

            // Cola curvada
            const cTail = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.30, 5), catMat);
            cTail.rotation.x = Math.PI / 3;
            cTail.position.set(-0.24, 0.18, 0.08); catGroup.add(cTail);

            catGroup.position.set(cfg.x, groundY, cfg.z);
            scene.add(catGroup);
            outdoorCats.push({ group: catGroup, tail: cTail, head: cHead, baseRotY: Math.random() * Math.PI * 2 });
        });

        // 3. Aves picoteando en el césped (Pájaros de suelo)
        const birdMat = new THREE.MeshLambertMaterial({ color: 0x795548 });
        const beakMat = new THREE.MeshBasicMaterial({ color: 0xffa502 });
        const groundBirdSpawns = [
            { x: -16.0, z: -5.0 }, { x: -48.0, z: -4.5 }, { x: -88.0, z: -5.2 },
            { x: 22.0, z: -5.0 }, { x: 65.0, z: -4.8 }, { x: 115.0, z: -5.2 },
            { x: -50.0, z: -23.5 }, { x: 60.0, z: -23.5 }
        ];

        groundBirdSpawns.forEach(sp => {
            const bGroup = new THREE.Group();
            const bBody = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.20, 5), birdMat);
            bBody.rotation.x = -Math.PI / 3;
            bBody.position.set(0, 0.10, 0); bGroup.add(bBody);

            const bHead = new THREE.Mesh(new THREE.SphereGeometry(0.055, 5, 5), birdMat);
            bHead.position.set(0, 0.16, 0.08); bGroup.add(bHead);

            const bBeak = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.06, 4), beakMat);
            bBeak.rotation.x = Math.PI / 2;
            bBeak.position.set(0, 0.15, 0.14); bGroup.add(bBeak);

            bGroup.position.set(sp.x, groundY, sp.z);
            scene.add(bGroup);

            outdoorGroundBirds.push({
                group: bGroup,
                head: bHead,
                originX: sp.x,
                originZ: sp.z,
                currentX: sp.x,
                currentZ: sp.z,
                peckTimer: Math.random() * 2.0,
                hopTimer: 0,
                isHopping: false
            });
        });
    }

    // ---- BOSQUE TRASERO Y ESPACIOS VERDES DETRÁS DE LAS CASAS (ELIMINA EL VACÍO) ----
    function buildLushBackyardForest(groundY) {
        const trunkMat = new THREE.MeshLambertMaterial({ color: 0x2e1c0e, side: THREE.DoubleSide });
        const pineMat1 = new THREE.MeshLambertMaterial({ color: 0x14351c, side: THREE.DoubleSide });
        const pineMat2 = new THREE.MeshLambertMaterial({ color: 0x1a4524, side: THREE.DoubleSide });
        const oakMat1 = new THREE.MeshLambertMaterial({ color: 0x1e5027, side: THREE.DoubleSide });
        const oakMat2 = new THREE.MeshLambertMaterial({ color: 0x276432, side: THREE.DoubleSide });
        const fenceWoodMat = new THREE.MeshLambertMaterial({ color: 0x3d281a, side: THREE.DoubleSide });

        // 1. Cercas de patio trasero detrás de la hilera de casas (omite la casa del jugador para no atravesar Living ni Cocina)
        for (let x = -150; x <= 150; x += 3.2) {
            if (x >= -7.5 && x <= 7.5) continue;
            const pPost = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.8, 0.12), fenceWoodMat);
            pPost.position.set(x, groundY + 0.9, 7.5); scene.add(pPost);

            const pPlank = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.4, 0.04), fenceWoodMat);
            pPlank.position.set(x + 1.6, groundY + 0.9, 7.5); scene.add(pPlank);
        }

        // 2. Hilera densa de pinos altos y majestuosos detrás de la casa del jugador y vecinos
        // Con separación segura de la casa (la vivienda llega hasta z = 11.2 y x: [-6.2, 6.2])
        const backForestTrees = [
            { x: -9.5,  z: 15.0, h: 13.0, r: 2.6, type: 'pine', mat: pineMat1 },
            { x: -3.5,  z: 16.5, h: 14.5, r: 2.8, type: 'pine', mat: pineMat2 },
            { x: 3.5,   z: 16.5, h: 14.0, r: 2.8, type: 'pine', mat: pineMat1 },
            { x: 9.5,   z: 15.0, h: 13.5, r: 2.6, type: 'pine', mat: pineMat2 },
            { x: -14.0, z: 16.0, h: 14.0, r: 3.2, type: 'oak',  mat: oakMat1 },
            { x: 14.0,  z: 16.0, h: 13.5, r: 3.0, type: 'oak',  mat: oakMat2 },
            { x: 0.0,   z: 22.0, h: 16.5, r: 3.8, type: 'pine', mat: pineMat1 },
            { x: -6.0,  z: 26.0, h: 18.0, r: 4.0, type: 'pine', mat: pineMat2 },
            { x: 6.0,   z: 25.0, h: 17.5, r: 3.9, type: 'pine', mat: pineMat1 },

            // Fondo boscoso continuo a la izquierda y derecha de la manzana
            { x: -22, z: 12, h: 13, r: 3.0, type: 'pine', mat: pineMat1 },
            { x: -38, z: 14, h: 14, r: 3.2, type: 'oak',  mat: oakMat2 },
            { x: -55, z: 11, h: 12, r: 2.8, type: 'pine', mat: pineMat2 },
            { x: -75, z: 15, h: 15, r: 3.4, type: 'pine', mat: pineMat1 },
            { x: -95, z: 13, h: 13, r: 3.0, type: 'oak',  mat: oakMat1 },
            { x: -115,z: 16, h: 16, r: 3.6, type: 'pine', mat: pineMat2 },
            { x: -135,z: 12, h: 14, r: 3.2, type: 'pine', mat: pineMat1 },

            { x: 25,  z: 12, h: 13, r: 3.0, type: 'pine', mat: pineMat2 },
            { x: 42,  z: 15, h: 15, r: 3.4, type: 'oak',  mat: oakMat1 },
            { x: 62,  z: 11, h: 12, r: 2.8, type: 'pine', mat: pineMat1 },
            { x: 82,  z: 14, h: 14, r: 3.2, type: 'pine', mat: pineMat2 },
            { x: 102, z: 12, h: 13, r: 3.0, type: 'oak',  mat: oakMat2 },
            { x: 125, z: 16, h: 16, r: 3.6, type: 'pine', mat: pineMat1 },
            { x: 145, z: 13, h: 14, r: 3.2, type: 'pine', mat: pineMat2 },

            // Segunda hilera profunda de bosque en colina (z = 28 a 42)
            { x: -30, z: 32, h: 19, r: 4.2, type: 'pine', mat: pineMat1 },
            { x: -60, z: 35, h: 20, r: 4.5, type: 'pine', mat: pineMat2 },
            { x: -90, z: 30, h: 18, r: 4.0, type: 'oak',  mat: oakMat1 },
            { x: -120,z: 34, h: 19, r: 4.2, type: 'pine', mat: pineMat2 },
            { x: 30,  z: 32, h: 19, r: 4.2, type: 'pine', mat: pineMat2 },
            { x: 60,  z: 35, h: 20, r: 4.5, type: 'pine', mat: pineMat1 },
            { x: 90,  z: 30, h: 18, r: 4.0, type: 'oak',  mat: oakMat2 },
            { x: 120, z: 34, h: 19, r: 4.2, type: 'pine', mat: pineMat1 }
        ];

        backForestTrees.forEach((bt, idx) => {
            const bGroup = new THREE.Group();

            if (bt.type === 'pine') {
                const trunkH = bt.h * 0.45;
                const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.42, trunkH, 6), trunkMat);
                trunk.position.set(0, trunkH / 2, 0);
                bGroup.add(trunk);

                const numCones = 4;
                for (let c = 0; c < numCones; c++) {
                    const coneH = (bt.h * 0.65) / numCones + 0.9;
                    const coneR = bt.r * (1.0 - c * 0.22);
                    const cone = new THREE.Mesh(new THREE.ConeGeometry(coneR, coneH, 6), bt.mat);
                    cone.position.set(0, bt.h * 0.30 + c * (coneH * 0.62), 0);
                    bGroup.add(cone);
                }
            } else {
                const trunkH = bt.h * 0.65;
                const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.48, trunkH, 6), trunkMat);
                trunk.position.set(0, trunkH / 2, 0);
                bGroup.add(trunk);

                const c1 = new THREE.Mesh(new THREE.DodecahedronGeometry(bt.r), bt.mat);
                c1.position.set(0, trunkH + bt.r * 0.4, 0);
                bGroup.add(c1);

                const c2 = new THREE.Mesh(new THREE.DodecahedronGeometry(bt.r * 0.75), bt.mat);
                c2.position.set(0.6, trunkH + bt.r * 0.7, 0.4);
                bGroup.add(c2);
            }

            bGroup.position.set(bt.x, groundY, bt.z);
            scene.add(bGroup);
            outdoorTrees.push({ mesh: bGroup, swaySpeed: 1.0 + (idx % 4) * 0.25, swayAmp: 0.018 });
        });
    }

    // ---- CASA COMPLETA DEL JUGADOR (ARQUITECTURA COLONIAL SUBURBANA IMPECABLE) ----
    function buildPlayerCompleteHouse(groundY) {
        const hGroup = new THREE.Group();
        const sidingMat = new THREE.MeshLambertMaterial({ color: 0xd6cbb0, side: THREE.DoubleSide });
        const trimMat = new THREE.MeshLambertMaterial({ color: 0xf4f6f8, side: THREE.DoubleSide });
        const roofMat = new THREE.MeshLambertMaterial({ color: 0x22262e, side: THREE.DoubleSide });
        const shutterMat = new THREE.MeshLambertMaterial({ color: 0x253858, side: THREE.DoubleSide });
        const doorMat = new THREE.MeshLambertMaterial({ color: 0x4a2414, side: THREE.DoubleSide });
        const windowLitMat = new THREE.MeshBasicMaterial({ color: 0xffd566, side: THREE.DoubleSide });
        const brickMat = new THREE.MeshLambertMaterial({ color: 0x7a3024, side: THREE.DoubleSide });
        const concreteMat = new THREE.MeshLambertMaterial({ color: 0x686c75, side: THREE.DoubleSide });

        const houseW = 6.8;
        const houseD = 6.0;
        const houseCenterZ = 0.0;
        const groundH = Math.abs(groundY); // 4.5m
        const totalH = groundH + 2.8; // 7.3m
        const facadeZ = -3.00;

        // 1. PLANTA BAJA (Desde groundY = -4.5 hasta y = 0.0)
        const groundBody = new THREE.Mesh(new THREE.BoxGeometry(houseW, groundH, houseD), sidingMat);
        groundBody.position.set(0, groundY + groundH / 2, houseCenterZ);
        hGroup.add(groundBody);

        // 2. FACHADA EXTERIOR DEL SEGUNDO PISO (y = 0.0 a 2.8) - Paneles limpios alineados a facadeZ
        // Panel izquierdo
        const extFrontL = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 2.8), sidingMat);
        extFrontL.rotation.y = Math.PI;
        extFrontL.position.set(-1.75, 1.4, facadeZ);
        hGroup.add(extFrontL);

        // Panel derecho
        const extFrontR = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 2.8), sidingMat);
        extFrontR.rotation.y = Math.PI;
        extFrontR.position.set(2.55, 1.4, facadeZ);
        hGroup.add(extFrontR);

        // Panel inferior bajo la ventana
        const extFrontBot = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.85), sidingMat);
        extFrontBot.rotation.y = Math.PI;
        extFrontBot.position.set(0.8, 0.425, facadeZ);
        hGroup.add(extFrontBot);

        // Panel superior sobre la ventana
        const extFrontTop = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.75), sidingMat);
        extFrontTop.rotation.y = Math.PI;
        extFrontTop.position.set(0.8, 2.425, facadeZ);
        hGroup.add(extFrontTop);

        // Molduras blancas exteriores y marco que enmarca la ventana del 2do piso
        const extWinFrameTop = new THREE.Mesh(new THREE.BoxGeometry(1.96, 0.08, 0.08), trimMat);
        extWinFrameTop.position.set(0.8, 2.05, facadeZ - 0.04); hGroup.add(extWinFrameTop);
        const extWinFrameBot = new THREE.Mesh(new THREE.BoxGeometry(1.96, 0.08, 0.08), trimMat);
        extWinFrameBot.position.set(0.8, 0.85, facadeZ - 0.04); hGroup.add(extWinFrameBot);
        const extWinFrameL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.2, 0.08), trimMat);
        extWinFrameL.position.set(-0.1, 1.45, facadeZ - 0.04); hGroup.add(extWinFrameL);
        const extWinFrameR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.2, 0.08), trimMat);
        extWinFrameR.position.set(1.7, 1.45, facadeZ - 0.04); hGroup.add(extWinFrameR);

        // Persianas coloniales de madera azul noche
        const shutterL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.25, 0.04), shutterMat);
        shutterL.position.set(-0.32, 1.45, facadeZ - 0.04); hGroup.add(shutterL);
        const shutterR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.25, 0.04), shutterMat);
        shutterR.position.set(1.92, 1.45, facadeZ - 0.04); hGroup.add(shutterR);

        // Paredes laterales y trasera del 2do piso
        const extSideL = new THREE.Mesh(new THREE.PlaneGeometry(houseD, 2.8), sidingMat);
        extSideL.rotation.y = -Math.PI / 2;
        extSideL.position.set(-houseW / 2, 1.4, houseCenterZ);
        hGroup.add(extSideL);

        const extSideR = new THREE.Mesh(new THREE.PlaneGeometry(houseD, 2.8), sidingMat);
        extSideR.rotation.y = Math.PI / 2;
        extSideR.position.set(houseW / 2, 1.4, houseCenterZ);
        hGroup.add(extSideR);

        const extBack = new THREE.Mesh(new THREE.PlaneGeometry(houseW, 2.8), sidingMat);
        extBack.position.set(0, 1.4, houseCenterZ + houseD / 2);
        hGroup.add(extBack);

        // 3. PILASTRAS EN LAS 4 ESQUINAS (Continuas de y = -4.5 a y = 2.8)
        [
            [-houseW / 2, facadeZ],
            [houseW / 2, facadeZ],
            [-houseW / 2, houseCenterZ + houseD / 2],
            [houseW / 2, houseCenterZ + houseD / 2]
        ].forEach(pos => {
            const corner = new THREE.Mesh(new THREE.BoxGeometry(0.16, totalH, 0.16), trimMat);
            corner.position.set(pos[0], groundY + totalH / 2, pos[1]);
            hGroup.add(corner);
        });

        // Moldura horizontal divisoria rasante
        const midBandFront = new THREE.Mesh(new THREE.BoxGeometry(houseW + 0.08, 0.08, 0.04), trimMat);
        midBandFront.position.set(0, 0.0, facadeZ - 0.02); hGroup.add(midBandFront);
        const midBandL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, houseD + 0.08), trimMat);
        midBandL.position.set(-houseW / 2 - 0.02, 0.0, houseCenterZ); hGroup.add(midBandL);
        const midBandR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, houseD + 0.08), trimMat);
        midBandR.position.set(houseW / 2 + 0.02, 0.0, houseCenterZ); hGroup.add(midBandR);

        // 4. TEJADO A DOS AGUAS CON GABLE FRONTAL CLÁSICO (COLONIAL AMERICANO AUTÉNTICO)
        // El frontis triangular da a la calle en facadeZ = -3.00, elevándose desde y = 2.80 hasta y = 4.45 en x = 0
        const roofPitchZ = 0.44; // Inclinación lateral
        const roofOverhangD = 6.6; // Largo del tejado con aleros delantero y trasero (z = -3.3 a +3.3)
        const slopeW = 3.85; // Ancho de cada vertiente

        // Frontis triangular de la fachada (Ático frontal sellado con revestimiento beige)
        const frontGableGeo = new THREE.BufferGeometry();
        const frontGableVerts = new Float32Array([
            -houseW / 2, 0, 0,
             houseW / 2, 0, 0,
             0, 1.65, 0
        ]);
        frontGableGeo.setAttribute('position', new THREE.BufferAttribute(frontGableVerts, 3));
        frontGableGeo.computeVertexNormals();
        const frontGable = new THREE.Mesh(frontGableGeo, sidingMat);
        frontGable.position.set(0, 2.80, facadeZ);
        hGroup.add(frontGable);

        // Ventilación decorativa circular del ático en el frontis
        const atticVent = new THREE.Mesh(new THREE.CircleGeometry(0.28, 8), shutterMat);
        atticVent.position.set(0, 3.55, facadeZ - 0.02);
        hGroup.add(atticVent);

        // Frontis triangular trasero
        const backGableGeo = new THREE.BufferGeometry();
        const backGableVerts = new Float32Array([
             houseW / 2, 0, 0,
            -houseW / 2, 0, 0,
             0, 1.65, 0
        ]);
        backGableGeo.setAttribute('position', new THREE.BufferAttribute(backGableVerts, 3));
        backGableGeo.computeVertexNormals();
        const backGable = new THREE.Mesh(backGableGeo, sidingMat);
        backGable.position.set(0, 2.80, houseCenterZ + houseD / 2);
        hGroup.add(backGable);

        // Vertiente Izquierda del Tejado (Cae desde el caballete x = 0, y = 4.45 hasta x = -3.65, y = 2.80)
        const roofLeft = new THREE.Mesh(new THREE.BoxGeometry(slopeW, 0.12, roofOverhangD), roofMat);
        roofLeft.rotation.z = roofPitchZ;
        roofLeft.position.set(-1.82, 3.62, houseCenterZ);
        hGroup.add(roofLeft);

        // Vertiente Derecha del Tejado (Cae desde el caballete x = 0, y = 4.45 hasta x = 3.65, y = 2.80)
        const roofRight = new THREE.Mesh(new THREE.BoxGeometry(slopeW, 0.12, roofOverhangD), roofMat);
        roofRight.rotation.z = -roofPitchZ;
        roofRight.position.set(1.82, 3.62, houseCenterZ);
        hGroup.add(roofRight);

        // Cumbrera central superior
        const roofRidge = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, roofOverhangD + 0.06), roofMat);
        roofRidge.position.set(0, 4.48, houseCenterZ);
        hGroup.add(roofRidge);

        // Molduras blancas decorativas en los aleros laterales y frontales
        const rakeTrimL = new THREE.Mesh(new THREE.BoxGeometry(slopeW, 0.08, 0.08), trimMat);
        rakeTrimL.rotation.z = roofPitchZ;
        rakeTrimL.position.set(-1.82, 3.62, facadeZ - 0.04);
        hGroup.add(rakeTrimL);

        const rakeTrimR = new THREE.Mesh(new THREE.BoxGeometry(slopeW, 0.08, 0.08), trimMat);
        rakeTrimR.rotation.z = -roofPitchZ;
        rakeTrimR.position.set(1.82, 3.62, facadeZ - 0.04);
        hGroup.add(rakeTrimR);

        const eavesL = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.08, roofOverhangD), trimMat);
        eavesL.position.set(-3.65, 2.78, houseCenterZ); hGroup.add(eavesL);
        const eavesR = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.08, roofOverhangD), trimMat);
        eavesR.position.set(3.65, 2.78, houseCenterZ); hGroup.add(eavesR);

        // Chimenea de ladrillo rojo en el tejado izquierdo
        const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.85, 2.4, 0.85), brickMat);
        chimney.position.set(-1.8, 4.30, 0.8);
        hGroup.add(chimney);
        createChimneySmokeEmitter(-1.8, 5.60, 0.8);

        // 5. ENTRADA PRINCIPAL Y PORCHE DELANTERO EN PLANTA BAJA
        const porchW = 2.4, porchD = 1.2, porchH = 2.3;
        // Plataforma de entrada
        const porchPlat = new THREE.Mesh(new THREE.BoxGeometry(porchW, 0.20, porchD), concreteMat);
        porchPlat.position.set(0.8, groundY + 0.10, facadeZ - porchD / 2);
        hGroup.add(porchPlat);

        // Escalón de acceso
        const step1 = new THREE.Mesh(new THREE.BoxGeometry(porchW * 0.7, 0.12, 0.35), concreteMat);
        step1.position.set(0.8, groundY + 0.06, facadeZ - porchD - 0.18);
        hGroup.add(step1);

        // Tejadillo compacto del porche
        const porchRoof = new THREE.Mesh(new THREE.BoxGeometry(porchW + 0.12, 0.10, porchD + 0.12), roofMat);
        porchRoof.rotation.x = 0.12;
        porchRoof.position.set(0.8, groundY + porchH + 0.05, facadeZ - porchD / 2);
        hGroup.add(porchRoof);

        // Columnas blancas de soporte del porche
        [-porchW / 2 + 0.10, porchW / 2 - 0.10].forEach(cx => {
            const col = new THREE.Mesh(new THREE.BoxGeometry(0.11, porchH, 0.11), trimMat);
            col.position.set(0.8 + cx, groundY + porchH / 2, facadeZ - porchD + 0.10);
            hGroup.add(col);
        });

        // Puerta principal de caoba en planta baja
        const frontDoor = new THREE.Mesh(new THREE.BoxGeometry(1.05, 2.05, 0.06), doorMat);
        frontDoor.position.set(0.8, groundY + 1.025, facadeZ - 0.03);
        hGroup.add(frontDoor);

        // Farol de entrada del porche (Luz cálida de bienvenida)
        const porchLightMesh = new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffd066 }));
        porchLightMesh.position.set(0.8, groundY + porchH - 0.22, facadeZ - 0.35);
        hGroup.add(porchLightMesh);

        const porchPtLight = new THREE.PointLight(0xffcc55, 1.8, 8.0);
        porchPtLight.position.set(0.8, groundY + porchH - 0.22, facadeZ - 0.35);
        scene.add(porchPtLight);
        outdoorPorchLights.push(porchPtLight);

        // Ventanas iluminadas de la planta baja (Living / Comedor)
        [-2.0, -0.6].forEach(wx => {
            const frame = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.35, 0.06), trimMat);
            frame.position.set(wx, groundY + 2.1, facadeZ - 0.03);
            hGroup.add(frame);

            const win = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 1.2), windowLitMat);
            win.rotation.y = Math.PI;
            win.position.set(wx, groundY + 2.1, facadeZ - 0.04);
            hGroup.add(win);
            outdoorHouseWindows.push(win);
        });

        // 6. GARAJE ADJUNTO A LA DERECHA (Hueco interior 3D con paredes, suelo y auto adentro)
        const garageW = 3.4, garageH = 3.0, garageD = 5.6;
        const gWallMat = sidingMat;
        const gFloorMat = new THREE.MeshLambertMaterial({ color: 0x3d434a });

        // Pared lateral derecha
        const gRightWall = new THREE.Mesh(new THREE.BoxGeometry(0.14, garageH, garageD), gWallMat);
        gRightWall.position.set(5.0 + garageW / 2 - 0.07, groundY + garageH / 2, houseCenterZ);
        hGroup.add(gRightWall);

        // Pared lateral izquierda (tabique)
        const gLeftWall = new THREE.Mesh(new THREE.BoxGeometry(0.14, garageH, garageD), gWallMat);
        gLeftWall.position.set(5.0 - garageW / 2 + 0.07, groundY + garageH / 2, houseCenterZ);
        hGroup.add(gLeftWall);

        // Pared trasera del garaje
        const gBackWall = new THREE.Mesh(new THREE.BoxGeometry(garageW, garageH, 0.14), gWallMat);
        gBackWall.position.set(5.0, groundY + garageH / 2, houseCenterZ + garageD / 2 - 0.07);
        hGroup.add(gBackWall);

        // Suelo de cemento interior
        const gFloor = new THREE.Mesh(new THREE.BoxGeometry(garageW, 0.04, garageD), gFloorMat);
        gFloor.position.set(5.0, groundY + 0.02, houseCenterZ);
        hGroup.add(gFloor);

        // Marco del portón del garaje abierto
        const gFrameMat = new THREE.MeshLambertMaterial({ color: 0xf4f6f8 });
        const gTopFrame = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.15, 0.12), gFrameMat);
        gTopFrame.position.set(5.0, groundY + 2.40, facadeZ - 0.04); hGroup.add(gTopFrame);
        [-1.55, 1.55].forEach(fx => {
            const gSide = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.45, 0.12), gFrameMat);
            gSide.position.set(5.0 + fx, groundY + 1.22, facadeZ - 0.04); hGroup.add(gSide);
        });

        // Portón seccional enrollado en la parte superior del garaje
        const gDoorMat = new THREE.MeshLambertMaterial({ color: 0xdde4e6, side: THREE.DoubleSide });
        const garageDoorRoll = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.35, 0.18), gDoorMat);
        garageDoorRoll.position.set(5.0, groundY + 2.22, facadeZ + 0.05); hGroup.add(garageDoorRoll);

        // Luz cálida interior del garaje que ilumina el coche
        const garageInteriorLight = new THREE.PointLight(0xffdd99, 1.8, 7.0);
        garageInteriorLight.position.set(5.0, groundY + 2.2, houseCenterZ);
        hGroup.add(garageInteriorLight);

        // Techo inclinado sobre el garaje
        const garageRoof = new THREE.Mesh(new THREE.BoxGeometry(garageW + 0.2, 0.10, garageD + 0.2), roofMat);
        garageRoof.rotation.z = -0.10;
        garageRoof.position.set(5.05, groundY + garageH + 0.05, houseCenterZ);
        hGroup.add(garageRoof);

        // Coche retro aparcado dentro del garaje mirando hacia la calle
        const driveCar = buildParkedRetroCar('wagon', 0x2b4c7e);
        driveCar.position.set(5.0, groundY, -0.6);
        driveCar.rotation.y = Math.PI;
        hGroup.add(driveCar);

        // Entrada pavimentada frente al garaje
        const gDriveway = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.2), new THREE.MeshLambertMaterial({ color: 0x3a3f47, side: THREE.DoubleSide }));
        gDriveway.rotation.x = -Math.PI / 2;
        gDriveway.position.set(5.0, groundY + 0.015, -3.2);
        hGroup.add(gDriveway);

        // 7. CAMINO DELANTERO Y BUZÓN RESIDENCIAL
        const walkway = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 3.8), concreteMat);
        walkway.rotation.x = -Math.PI / 2;
        walkway.position.set(0.8, groundY + 0.02, -6.8);
        hGroup.add(walkway);

        // Buzón americano al borde de la acera
        const postMat = new THREE.MeshLambertMaterial({ color: 0x4a3220 });
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.1, 6), postMat);
        post.position.set(2.8, groundY + 0.55, -8.6);
        hGroup.add(post);

        const mailboxBox = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.42), new THREE.MeshLambertMaterial({ color: 0x222222 }));
        mailboxBox.position.set(2.8, groundY + 1.1, -8.6);
        hGroup.add(mailboxBox);

        playerCompleteHouseGroup = hGroup;
        playerCompleteHouseGroup.visible = !!isIntroCinematic;
        scene.add(hGroup);
    }

    // ---- CASAS VECINAS A LOS LADOS DEL JUGADOR (ACERA CERCANA) ----
    function buildNearSideNeighborhoodHouses(groundY, houseZ) {
        const windowLitMat = new THREE.MeshBasicMaterial({ color: 0xffd566, side: THREE.DoubleSide });
        const doorMat = new THREE.MeshLambertMaterial({ color: 0x5a2d18 });

        const nearConfigs = [
            // Vecinos a la Izquierda del jugador (X negativa, despejando la casa del jugador)
            { x: -20, w: 10.5, h: 6.8, d: 7.2, color: 0xa8d3ec, trimColor: 0xffffff, roofColor: 0x364858, roofH: 2.8, chimney: true, porch: true, garage: true, parkedCar: { type: 'sedan', color: 0x225588 } },
            { x: -38, w: 11.0, h: 7.0, d: 7.5, color: 0xf7e1b5, trimColor: 0xffffff, roofColor: 0x4b3a2e, roofH: 2.7, chimney: false, porch: true, garage: true, parkedCar: { type: 'wagon', color: 0x445533 } },
            { x: -58, w: 10.2, h: 6.6, d: 7.0, color: 0xd9826a, trimColor: 0xffffff, roofColor: 0x3d2a20, roofH: 2.6, chimney: true, porch: true, garage: false, parkedCar: null },
            { x: -78, w: 10.6, h: 6.8, d: 7.3, color: 0xb0d6b6, trimColor: 0xffffff, roofColor: 0x48372b, roofH: 2.7, chimney: false, porch: true, garage: true, parkedCar: { type: 'pickup', color: 0x883322 } },
            { x: -98, w: 11.0, h: 7.0, d: 7.4, color: 0xf6e3a4, trimColor: 0xffffff, roofColor: 0x3d4957, roofH: 2.8, chimney: true, porch: true, garage: false, parkedCar: null },
            { x: -120, w: 10.2, h: 6.7, d: 7.2, color: 0xa4cce6, trimColor: 0xffffff, roofColor: 0x354352, roofH: 2.6, chimney: false, porch: true, garage: true, parkedCar: null },
            { x: -142, w: 11.0, h: 6.9, d: 7.5, color: 0xd97e65, trimColor: 0xffffff, roofColor: 0x3d2b22, roofH: 2.8, chimney: true, porch: true, garage: false, parkedCar: null },

            // Vecinos a la Derecha del jugador (X positiva, despejando el garaje del jugador)
            { x: 20, w: 10.5, h: 6.8, d: 7.2, color: 0xfff0c2, trimColor: 0xffffff, roofColor: 0x4e3a2f, roofH: 2.7, chimney: true, porch: true, garage: true, parkedCar: { type: 'sedan', color: 0x882233 } },
            { x: 39, w: 11.0, h: 7.0, d: 7.5, color: 0x9bc2a1, trimColor: 0xffffff, roofColor: 0x3a4856, roofH: 2.8, chimney: false, porch: true, garage: true, parkedCar: { type: 'wagon', color: 0x2b4c7e } },
            { x: 59, w: 10.2, h: 6.6, d: 7.0, color: 0xbcd8eb, trimColor: 0xffffff, roofColor: 0x384452, roofH: 2.6, chimney: true, porch: true, garage: true, parkedCar: null },
            { x: 79, w: 10.8, h: 6.9, d: 7.4, color: 0xf7e4aa, trimColor: 0xffffff, roofColor: 0x334150, roofH: 2.7, chimney: false, porch: true, garage: true, parkedCar: { type: 'pickup', color: 0x334466 } },
            { x: 101, w: 11.0, h: 7.1, d: 7.6, color: 0xd4765d, trimColor: 0xffffff, roofColor: 0x3a2c22, roofH: 2.9, chimney: true, porch: true, garage: false, parkedCar: null },
            { x: 123, w: 10.0, h: 6.6, d: 7.1, color: 0xb8d5b8, trimColor: 0xffffff, roofColor: 0x423429, roofH: 2.6, chimney: false, porch: true, garage: true, parkedCar: null },
            { x: 145, w: 11.0, h: 7.0, d: 7.5, color: 0xf2dfc1, trimColor: 0xffffff, roofColor: 0x4d382c, roofH: 2.8, chimney: true, porch: true, garage: false, parkedCar: null }
        ];

        nearConfigs.forEach((cfg) => {
            const hGroup = new THREE.Group();
            const hMat = new THREE.MeshLambertMaterial({ color: cfg.color, side: THREE.DoubleSide });
            const rMat = new THREE.MeshLambertMaterial({ color: cfg.roofColor, side: THREE.DoubleSide });
            const trimMat = new THREE.MeshLambertMaterial({ color: cfg.trimColor, side: THREE.DoubleSide });

            // Estructura de la casa (Cuerpo principal y Cavidad Interior del Garaje)
            if (cfg.garage) {
                // Bloque residencial izquierdo (Sala y dormitorios)
                const houseBody = new THREE.Mesh(new THREE.BoxGeometry(cfg.w * 0.58, cfg.h, cfg.d), hMat);
                houseBody.position.set(-cfg.w * 0.21, cfg.h / 2, 0); hGroup.add(houseBody);

                // Planta alta sobre el garaje
                if (cfg.h > 3.0) {
                    const upperFloor = new THREE.Mesh(new THREE.BoxGeometry(cfg.w * 0.42, cfg.h - 2.8, cfg.d), hMat);
                    upperFloor.position.set(cfg.w * 0.29, 2.8 + (cfg.h - 2.8) / 2, 0); hGroup.add(upperFloor);
                }

                // Garaje Hueco 3D: Pared exterior derecha
                const gRight = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.8, cfg.d), hMat);
                gRight.position.set(cfg.w / 2 - 0.07, 1.4, 0); hGroup.add(gRight);

                // Garaje Hueco 3D: Pared trasera
                const gBack = new THREE.Mesh(new THREE.BoxGeometry(cfg.w * 0.42, 2.8, 0.14), hMat);
                gBack.position.set(cfg.w * 0.29, 1.4, cfg.d / 2 - 0.07); hGroup.add(gBack);

                // Garaje Hueco 3D: Suelo de hormigón interior
                const gFloor = new THREE.Mesh(new THREE.BoxGeometry(cfg.w * 0.42, 0.04, cfg.d), new THREE.MeshLambertMaterial({ color: 0x3d434a }));
                gFloor.position.set(cfg.w * 0.29, 0.02, 0); hGroup.add(gFloor);

                // Garaje Hueco 3D: Techo del garaje
                const gCeil = new THREE.Mesh(new THREE.BoxGeometry(cfg.w * 0.42, 0.10, cfg.d), hMat);
                gCeil.position.set(cfg.w * 0.29, 2.8, 0); hGroup.add(gCeil);

                // Marco del portón abierto (Dintel superior y laterales)
                const gLintel = new THREE.Mesh(new THREE.BoxGeometry(cfg.w * 0.42 - 0.1, 0.35, 0.16), trimMat);
                gLintel.position.set(cfg.w * 0.29, 2.62, -cfg.d / 2 - 0.02); hGroup.add(gLintel);

                // Luz interior del garaje que ilumina el coche estacionado adentro
                const gLight = new THREE.PointLight(0xffdd99, 1.6, 6.5);
                gLight.position.set(cfg.w * 0.29, 2.4, 0); hGroup.add(gLight);

                // Entrada / Driveway pavimentado
                const driveway = new THREE.Mesh(new THREE.PlaneGeometry(cfg.w * 0.40, 2.6), new THREE.MeshLambertMaterial({ color: 0x3a3f47, side: THREE.DoubleSide }));
                driveway.rotation.x = -Math.PI / 2;
                driveway.position.set(cfg.w * 0.29, 0.015, -cfg.d / 2 - 1.3);
                hGroup.add(driveway);

                // Coche estacionado adentro del garaje mirando hacia la calle
                if (cfg.parkedCar) {
                    const driveCar = buildParkedRetroCar(cfg.parkedCar.type, cfg.parkedCar.color);
                    driveCar.position.set(cfg.w * 0.29, 0, -0.6);
                    driveCar.rotation.y = Math.PI;
                    hGroup.add(driveCar);
                }
            } else {
                const houseBody = new THREE.Mesh(new THREE.BoxGeometry(cfg.w, cfg.h, cfg.d), hMat);
                houseBody.position.set(0, cfg.h / 2, 0); hGroup.add(houseBody);
            }

            // Techo a dos aguas clásico americano (sin conos ni vértices salientes)
            const roofH = cfg.roofH || 2.4;
            const halfW = cfg.w / 2 + 0.3;
            const halfD = cfg.d / 2 + 0.3;
            const pitch = Math.atan2(roofH, halfD);
            const slopeLen = Math.sqrt(roofH * roofH + halfD * halfD);

            // Vertiente Frontal
            const rFront = new THREE.Mesh(new THREE.BoxGeometry(cfg.w + 0.6, 0.12, slopeLen), rMat);
            rFront.rotation.x = -pitch;
            rFront.position.set(0, cfg.h + roofH / 2, -halfD / 2);
            hGroup.add(rFront);

            // Vertiente Trasera
            const rBack = new THREE.Mesh(new THREE.BoxGeometry(cfg.w + 0.6, 0.12, slopeLen), rMat);
            rBack.rotation.x = pitch;
            rBack.position.set(0, cfg.h + roofH / 2, halfD / 2);
            hGroup.add(rBack);

            // Cumbrera central
            const ridge = new THREE.Mesh(new THREE.BoxGeometry(cfg.w + 0.7, 0.12, 0.16), rMat);
            ridge.position.set(0, cfg.h + roofH + 0.05, 0);
            hGroup.add(ridge);

            // Hastiales laterales triangulares (Gables)
            [-cfg.w / 2, cfg.w / 2].forEach(gx => {
                const gGeo = new THREE.BufferGeometry();
                const verts = new Float32Array([
                    0, 0, -halfD + 0.3,
                    0, 0, halfD - 0.3,
                    0, roofH, 0
                ]);
                gGeo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
                gGeo.computeVertexNormals();
                const gMesh = new THREE.Mesh(gGeo, hMat);
                gMesh.position.set(gx, cfg.h, 0);
                hGroup.add(gMesh);
            });

            // Puerta principal en fachada frontal (mirando a la calle, z negativa)
            const door = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.1, 0.08), doorMat);
            door.position.set(-cfg.w * 0.22, 1.05, -cfg.d / 2 - 0.04); hGroup.add(door);

            // Porche delantero con luz
            if (cfg.porch) {
                const porchW = 2.4, porchD = 1.3, porchH = 2.4;
                const porchRoof = new THREE.Mesh(new THREE.BoxGeometry(porchW, 0.12, porchD), rMat);
                porchRoof.position.set(-cfg.w * 0.22, porchH, -cfg.d / 2 - porchD / 2); hGroup.add(porchRoof);

                [-porchW / 2 + 0.12, porchW / 2 - 0.12].forEach(cx => {
                    const col = new THREE.Mesh(new THREE.BoxGeometry(0.10, porchH, 0.10), trimMat);
                    col.position.set(-cfg.w * 0.22 + cx, porchH / 2, -cfg.d / 2 - porchD + 0.08); hGroup.add(col);
                });

                const pLightMesh = new THREE.Mesh(new THREE.SphereGeometry(0.10, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffd066 }));
                pLightMesh.position.set(-cfg.w * 0.22, porchH - 0.22, -cfg.d / 2 - 0.2); hGroup.add(pLightMesh);

                const porchPtLight = new THREE.PointLight(0xffcc55, 1.2, 5.0);
                porchPtLight.position.set(cfg.x - cfg.w * 0.22, groundY + porchH - 0.22, houseZ - cfg.d / 2 - 0.2);
                scene.add(porchPtLight);
                outdoorPorchLights.push(porchPtLight);
            }

            // Chimenea de ladrillo
            if (cfg.chimney) {
                const chMat = new THREE.MeshLambertMaterial({ color: 0x5c2b22 });
                const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.85, 2.4, 0.85), chMat);
                chimney.position.set(-cfg.w * 0.32, cfg.h + 1.2, 0); hGroup.add(chimney);
                createChimneySmokeEmitter(cfg.x - cfg.w * 0.32, groundY + cfg.h + 2.5, houseZ);
            }

            // Ventanas iluminadas en fachada frontal (planta alta completa, planta baja solo sala)
            for (let wy = 1.6; wy <= cfg.h - 1.2; wy += 2.2) {
                for (let wx = -cfg.w * 0.35; wx <= cfg.w * 0.35; wx += 2.6) {
                    if (wy < 2.5 && (wx > 0 || Math.abs(wx - (-cfg.w * 0.22)) < 1.0)) continue;

                    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.15, 0.06), trimMat);
                    frame.position.set(wx, wy, -cfg.d / 2 - 0.02); hGroup.add(frame);

                    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 1.02), windowLitMat);
                    win.position.set(wx, wy, -cfg.d / 2 - 0.055); win.rotation.y = Math.PI; hGroup.add(win);
                    outdoorHouseWindows.push(win);
                }
            }

            hGroup.position.set(cfg.x, groundY, houseZ);
            scene.add(hGroup);
        });
    }

    // ---- CASAS DEL VECINDARIO 90s (AVENIDA RESIDENCIAL CONTINUA) ----
    function buildDetailedNeighborhoodHouses(groundY, houseZ) {
        outdoorHouseWindows = [];
        outdoorPorchLights = [];
        outdoorChimneySmokes = [];

        const windowLitMat = new THREE.MeshBasicMaterial({ color: 0xffd566, side: THREE.DoubleSide });
        const doorMat = new THREE.MeshLambertMaterial({ color: 0x5a2d18 });

        const houseConfigs = [
            // Extremo Izquierdo
            { x: -140, w: 10.5, h: 5.6, d: 7.0, color: 0xf2dfc1, trim: 0xffffff, roofColor: 0x4d382c, porch: true, chimney: true, garage: true, parkedCar: { type: 'sedan', color: 0x2e6b8c } },
            { x: -122, w: 10.0, h: 6.2, d: 7.2, color: 0xa8d3ec, trim: 0xfdfdfd, roofColor: 0x364858, porch: true, chimney: false, garage: true, parkedCar: { type: 'coupe', color: 0x9c321e } },
            { x: -104, w: 11.0, h: 5.8, d: 7.0, color: 0xb0d6b6, trim: 0xffffff, roofColor: 0x48372b, porch: true, chimney: true, garage: true, parkedCar: { type: 'wagon', color: 0x5a483a } },
            { x: -86,  w: 10.0, h: 6.0, d: 7.0, color: 0xf6e3a4, trim: 0xffffff, roofColor: 0x3d4957, porch: true, chimney: false, garage: true, parkedCar: { type: 'sedan', color: 0x326848 } },
            { x: -68,  w: 10.5, h: 5.5, d: 7.2, color: 0xd97e65, trim: 0xfdfbf7, roofColor: 0x3d2b22, porch: true, chimney: true, garage: true, parkedCar: { type: 'pickup', color: 0x733431 } },
            { x: -50,  w: 10.2, h: 6.4, d: 7.0, color: 0xbcd8eb, trim: 0xffffff, roofColor: 0x384452, porch: true, chimney: false, garage: true, parkedCar: { type: 'wagon', color: 0x364861 } },
            // Centro Izquierda (Frente al jugador — Casas visibles desde la ventana)
            { x: -32,  w: 11.0, h: 5.8, d: 7.2, color: 0xf7e1b5, trim: 0xffffff, roofColor: 0x4b3a2e, porch: true, chimney: true, garage: true, parkedCar: { type: 'sedan', color: 0x8a3333 } },
            { x: -16,  w: 10.0, h: 6.2, d: 7.0, color: 0x9bc2a1, trim: 0xffffff, roofColor: 0x3a4856, porch: true, chimney: false, garage: true, parkedCar: { type: 'coupe', color: 0x346153 } },
            { x: 0,    w: 11.5, h: 6.0, d: 7.4, color: 0xfff0c2, trim: 0xffffff, roofColor: 0x4e3a2f, porch: true, chimney: true, garage: true, parkedCar: { type: 'wagon', color: 0x4d4742 } },
            { x: 18,   w: 10.0, h: 5.8, d: 7.0, color: 0xa4cce6, trim: 0xffffff, roofColor: 0x354352, porch: true, chimney: false, garage: true, parkedCar: { type: 'sedan', color: 0x33527d } },
            { x: 34,   w: 10.5, h: 6.2, d: 7.2, color: 0xd9826a, trim: 0xffffff, roofColor: 0x3d2a20, porch: true, chimney: true, garage: true, parkedCar: { type: 'pickup', color: 0x854731 } },
            // Centro Derecha y Extremo Derecho
            { x: 52,   w: 10.0, h: 5.6, d: 7.0, color: 0xb8d5b8, trim: 0xffffff, roofColor: 0x423429, porch: true, chimney: false, garage: true, parkedCar: { type: 'coupe', color: 0x6e3864 } },
            { x: 70,   w: 11.0, h: 6.4, d: 7.2, color: 0xf5dfb3, trim: 0xffffff, roofColor: 0x384554, porch: true, chimney: true, garage: true, parkedCar: { type: 'wagon', color: 0x335c6e } },
            { x: 88,   w: 10.2, h: 5.8, d: 7.0, color: 0x9ec7e4, trim: 0xffffff, roofColor: 0x403126, porch: true, chimney: false, garage: true, parkedCar: { type: 'sedan', color: 0x734535 } },
            { x: 106,  w: 10.8, h: 6.0, d: 7.2, color: 0xf7e4aa, trim: 0xffffff, roofColor: 0x334150, porch: true, chimney: true, garage: true, parkedCar: { type: 'pickup', color: 0x365e47 } },
            { x: 124,  w: 10.0, h: 5.5, d: 7.0, color: 0xd4765d, trim: 0xffffff, roofColor: 0x3a2c22, porch: true, chimney: false, garage: true, parkedCar: { type: 'coupe', color: 0x853232 } },
            { x: 142,  w: 11.0, h: 6.2, d: 7.2, color: 0xa8cfb0, trim: 0xffffff, roofColor: 0x364452, porch: true, chimney: true, garage: true, parkedCar: { type: 'wagon', color: 0x4a5745 } }
        ];

        houseConfigs.forEach(cfg => {
            const hGroup = new THREE.Group();
            const wallMat = new THREE.MeshLambertMaterial({ color: cfg.color });
            const trimMat = new THREE.MeshLambertMaterial({ color: cfg.trim });
            const roofMat = new THREE.MeshLambertMaterial({ color: cfg.roofColor || 0x364452 });

            // Estructura de la casa con Cavidad Interior del Garaje
            if (cfg.garage) {
                // Bloque residencial izquierdo
                const body = new THREE.Mesh(new THREE.BoxGeometry(cfg.w * 0.58, cfg.h, cfg.d), wallMat);
                body.position.set(-cfg.w * 0.21, cfg.h / 2, 0); hGroup.add(body);

                // Planta alta sobre el garaje
                if (cfg.h > 3.0) {
                    const upperFloor = new THREE.Mesh(new THREE.BoxGeometry(cfg.w * 0.42, cfg.h - 2.8, cfg.d), wallMat);
                    upperFloor.position.set(cfg.w * 0.29, 2.8 + (cfg.h - 2.8) / 2, 0); hGroup.add(upperFloor);
                }

                // Pared exterior derecha
                const gRight = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.8, cfg.d), wallMat);
                gRight.position.set(cfg.w / 2 - 0.07, 1.4, 0); hGroup.add(gRight);

                // Pared trasera del garaje
                const gBack = new THREE.Mesh(new THREE.BoxGeometry(cfg.w * 0.42, 2.8, 0.14), wallMat);
                gBack.position.set(cfg.w * 0.29, 1.4, -cfg.d / 2 + 0.07); hGroup.add(gBack);

                // Suelo de hormigón interior
                const gFloor = new THREE.Mesh(new THREE.BoxGeometry(cfg.w * 0.42, 0.04, cfg.d), new THREE.MeshLambertMaterial({ color: 0x3d434a }));
                gFloor.position.set(cfg.w * 0.29, 0.02, 0); hGroup.add(gFloor);

                // Techo del garaje
                const gCeil = new THREE.Mesh(new THREE.BoxGeometry(cfg.w * 0.42, 0.10, cfg.d), wallMat);
                gCeil.position.set(cfg.w * 0.29, 2.8, 0); hGroup.add(gCeil);

                // Dintel del portón abierto
                const gLintel = new THREE.Mesh(new THREE.BoxGeometry(cfg.w * 0.42 - 0.1, 0.35, 0.16), trimMat);
                gLintel.position.set(cfg.w * 0.29, 2.62, cfg.d / 2 + 0.02); hGroup.add(gLintel);

                // Luz interior del garaje
                const gLight = new THREE.PointLight(0xffdd99, 1.6, 6.5);
                gLight.position.set(cfg.w * 0.29, 2.4, 0); hGroup.add(gLight);

                // Driveway
                const driveway = new THREE.Mesh(new THREE.PlaneGeometry(cfg.w * 0.40, 2.6), new THREE.MeshLambertMaterial({ color: 0x3a3f47, side: THREE.DoubleSide }));
                driveway.rotation.x = -Math.PI / 2;
                driveway.position.set(cfg.w * 0.29, 0.015, cfg.d / 2 + 1.3);
                hGroup.add(driveway);

                if (cfg.parkedCar) {
                    const driveCar = buildParkedRetroCar(cfg.parkedCar.type, cfg.parkedCar.color);
                    driveCar.position.set(cfg.w * 0.29, 0, 0.6);
                    driveCar.rotation.y = 0;
                    hGroup.add(driveCar);
                }
            } else {
                const body = new THREE.Mesh(new THREE.BoxGeometry(cfg.w, cfg.h, cfg.d), wallMat);
                body.position.set(0, cfg.h / 2, 0); hGroup.add(body);
            }

            // Techo a 2 aguas clásico
            const roofH = 1.9;
            const halfD = cfg.d / 2 + 0.3;
            const pitch = Math.atan2(roofH, halfD);
            const slopeLen = Math.sqrt(roofH * roofH + halfD * halfD);

            const rFront = new THREE.Mesh(new THREE.BoxGeometry(cfg.w + 0.6, 0.12, slopeLen), roofMat);
            rFront.rotation.x = pitch;
            rFront.position.set(0, cfg.h + roofH / 2, halfD / 2);
            hGroup.add(rFront);

            const rBack = new THREE.Mesh(new THREE.BoxGeometry(cfg.w + 0.6, 0.12, slopeLen), roofMat);
            rBack.rotation.x = -pitch;
            rBack.position.set(0, cfg.h + roofH / 2, -halfD / 2);
            hGroup.add(rBack);

            const ridge = new THREE.Mesh(new THREE.BoxGeometry(cfg.w + 0.7, 0.12, 0.16), roofMat);
            ridge.position.set(0, cfg.h + roofH + 0.05, 0);
            hGroup.add(ridge);

            [-cfg.w / 2, cfg.w / 2].forEach(gx => {
                const gGeo = new THREE.BufferGeometry();
                const verts = new Float32Array([
                    0, 0, -halfD + 0.3,
                    0, 0, halfD - 0.3,
                    0, roofH, 0
                ]);
                gGeo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
                gGeo.computeVertexNormals();
                const gMesh = new THREE.Mesh(gGeo, wallMat);
                gMesh.position.set(gx, cfg.h, 0);
                hGroup.add(gMesh);
            });

            // Puerta principal
            const door = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 0.08), doorMat);
            door.position.set(-cfg.w * 0.22, 1.1, cfg.d / 2 + 0.04); hGroup.add(door);

            // Porche iluminado
            if (cfg.porch) {
                const pRoof = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 1.4), trimMat);
                pRoof.position.set(-cfg.w * 0.22, 2.35, cfg.d / 2 + 0.7); hGroup.add(pRoof);

                [-0.8, 0.8].forEach(px => {
                    const post = new THREE.Mesh(new THREE.BoxGeometry(0.10, 2.25, 0.10), trimMat);
                    post.position.set(-cfg.w * 0.22 + px, 1.125, cfg.d / 2 + 1.35); hGroup.add(post);
                });

                const porchPtLight = new THREE.PointLight(0xffcc55, 1.2, 5.0);
                porchPtLight.position.set(cfg.x - cfg.w * 0.22, groundY + 2.1, houseZ + cfg.d / 2 + 0.6);
                scene.add(porchPtLight);
                outdoorPorchLights.push(porchPtLight);
            }

            // Chimenea de ladrillo
            if (cfg.chimney) {
                const chMat = new THREE.MeshLambertMaterial({ color: 0x5c2b22 });
                const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.85, 2.4, 0.85), chMat);
                chimney.position.set(-cfg.w * 0.32, cfg.h + 1.2, 0); hGroup.add(chimney);
                createChimneySmokeEmitter(cfg.x - cfg.w * 0.32, groundY + cfg.h + 2.5, houseZ);
            }

            // Ventanas iluminadas
            for (let wy = 1.6; wy <= cfg.h - 1.2; wy += 2.2) {
                for (let wx = -cfg.w * 0.35; wx <= cfg.w * 0.35; wx += 2.6) {
                    if (wy < 2.5 && (wx > 0 || Math.abs(wx - (-cfg.w * 0.22)) < 1.0)) continue;

                    if (cfg.tvWindow && wy < 2.5 && wx < -1.0) {
                        const tvWinGeo = new THREE.PlaneGeometry(1.2, 1.3);
                        const tvWinMat = new THREE.MeshBasicMaterial({ color: 0x4da6ff, side: THREE.DoubleSide });
                        const tvWin = new THREE.Mesh(tvWinGeo, tvWinMat);
                        tvWin.position.set(wx, wy, cfg.d / 2 + 0.02); hGroup.add(tvWin);

                        outdoorTvWindow = tvWin;
                        outdoorTvLight = new THREE.PointLight(0x4da6ff, 1.8, 5.0);
                        outdoorTvLight.position.set(cfg.x + wx, groundY + wy, houseZ + cfg.d / 2 + 0.6);
                        scene.add(outdoorTvLight);
                        continue;
                    }

                    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.15, 0.06), trimMat);
                    frame.position.set(wx, wy, cfg.d / 2 + 0.02); hGroup.add(frame);

                    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 1.02), windowLitMat);
                    win.position.set(wx, wy, cfg.d / 2 + 0.055); hGroup.add(win);
                    outdoorHouseWindows.push(win);
                }
            }

            // Valla de patio
            const fenceMat = new THREE.MeshLambertMaterial({ color: 0xe6e6e6 });
            for (let fx = -cfg.w * 0.48; fx <= cfg.w * 0.48; fx += 0.5) {
                if (Math.abs(fx - (-cfg.w * 0.2)) < 0.9) continue;
                const picket = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.75, 0.03), fenceMat);
                picket.position.set(fx, 0.38, cfg.d / 2 + 4.2); hGroup.add(picket);
            }

            hGroup.position.set(cfg.x, groundY, houseZ);
            scene.add(hGroup);
        });
    }

    // ---- COCHE ESTACIONADO EN ENTRADA (DETALLE 3D MEJORADO) ----
    function buildParkedRetroCar(type, colorHex) {
        const car = new THREE.Group();
        const bMat = new THREE.MeshLambertMaterial({ color: colorHex });
        const bMatDark = new THREE.MeshLambertMaterial({ color: new THREE.Color(colorHex).multiplyScalar(0.7) });
        const glassMat = new THREE.MeshLambertMaterial({ color: 0x1a2a3a, transparent: true, opacity: 0.75 });
        const wheelMat = new THREE.MeshLambertMaterial({ color: 0x151515 });
        const chromeMat = new THREE.MeshLambertMaterial({ color: 0xc8c8c8 });
        const rubberMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffcc, transparent: true, opacity: 0.6 });
        const taillightMat = new THREE.MeshBasicMaterial({ color: 0xcc1111, transparent: true, opacity: 0.7 });
        const plateMat = new THREE.MeshLambertMaterial({ color: 0xeeeeee });

        let bodyLen, bodyH, bodyW, cabLen, cabH, cabOff;

        if (type === 'wagon') {
            bodyLen = 3.8; bodyH = 0.65; bodyW = 1.6; cabLen = 2.6; cabH = 0.55; cabOff = -0.2;
            // Carrocería principal
            const body = new THREE.Mesh(new THREE.BoxGeometry(bodyW, bodyH, bodyLen), bMat);
            body.position.set(0, 0.45, 0); car.add(body);
            // Guardabarros inferiores curvados (faldones)
            const fenderL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.20, bodyLen * 0.92), bMatDark);
            fenderL.position.set(-bodyW / 2 - 0.02, 0.28, 0); car.add(fenderL);
            const fenderR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.20, bodyLen * 0.92), bMatDark);
            fenderR.position.set(bodyW / 2 + 0.02, 0.28, 0); car.add(fenderR);
            // Panel de madera lateral (estilo station wagon 70s)
            const woodPanel = new THREE.Mesh(new THREE.BoxGeometry(bodyW + 0.02, 0.26, 2.8), new THREE.MeshLambertMaterial({ color: 0x73431f }));
            woodPanel.position.set(0, 0.47, -0.15); car.add(woodPanel);
            // Cabina alargada con cristal trasero continuo
            const cabin = new THREE.Mesh(new THREE.BoxGeometry(bodyW * 0.86, cabH, cabLen), glassMat);
            cabin.position.set(0, 0.95, cabOff); car.add(cabin);
            // Pilar C trasero (soporte cristal)
            const pillarCL = new THREE.Mesh(new THREE.BoxGeometry(0.06, cabH, 0.08), bMat);
            pillarCL.position.set(-bodyW * 0.42, 0.95, cabOff - cabLen / 2 + 0.04); car.add(pillarCL);
            const pillarCR = new THREE.Mesh(new THREE.BoxGeometry(0.06, cabH, 0.08), bMat);
            pillarCR.position.set(bodyW * 0.42, 0.95, cabOff - cabLen / 2 + 0.04); car.add(pillarCR);
            // Baca portaequipaje de metal
            const rack = new THREE.Mesh(new THREE.BoxGeometry(bodyW * 0.72, 0.04, cabLen * 0.8), chromeMat);
            rack.position.set(0, 1.26, cabOff); car.add(rack);
            // Barras laterales de baca
            [-bodyW * 0.35, bodyW * 0.35].forEach(rx => {
                const rBar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, cabLen * 0.78), chromeMat);
                rBar.position.set(rx, 1.22, cabOff); car.add(rBar);
            });
            // Moldura cromada horizontal a media altura
            const stripL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.04, bodyLen * 0.88), chromeMat);
            stripL.position.set(-bodyW / 2 - 0.01, 0.62, 0); car.add(stripL);
            const stripR = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.04, bodyLen * 0.88), chromeMat);
            stripR.position.set(bodyW / 2 + 0.01, 0.62, 0); car.add(stripR);
        } else if (type === 'pickup') {
            bodyLen = 4.2; bodyH = 0.72; bodyW = 1.7; cabLen = 1.9; cabH = 0.68; cabOff = 0.7;
            // Chasis principal
            const body = new THREE.Mesh(new THREE.BoxGeometry(bodyW, bodyH, bodyLen), bMat);
            body.position.set(0, 0.50, 0); car.add(body);
            // Cabina robusta
            const cab = new THREE.Mesh(new THREE.BoxGeometry(bodyW * 0.88, cabH, cabLen), glassMat);
            cab.position.set(0, 1.08, cabOff); car.add(cab);
            // Techo de cabina sólido
            const cabRoof = new THREE.Mesh(new THREE.BoxGeometry(bodyW * 0.90, 0.06, cabLen + 0.06), bMat);
            cabRoof.position.set(0, 1.42, cabOff); car.add(cabRoof);
            // Caja de carga trasera con bordes elevados
            const bedFloor = new THREE.Mesh(new THREE.BoxGeometry(bodyW - 0.08, 0.04, bodyLen * 0.4), bMatDark);
            bedFloor.position.set(0, bodyH + 0.32, -bodyLen * 0.25); car.add(bedFloor);
            const bedL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, bodyLen * 0.4), bMat);
            bedL.position.set(-bodyW / 2 + 0.06, bodyH + 0.50, -bodyLen * 0.25); car.add(bedL);
            const bedR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, bodyLen * 0.4), bMat);
            bedR.position.set(bodyW / 2 - 0.06, bodyH + 0.50, -bodyLen * 0.25); car.add(bedR);
            const bedBack = new THREE.Mesh(new THREE.BoxGeometry(bodyW - 0.14, 0.35, 0.06), bMat);
            bedBack.position.set(0, bodyH + 0.50, -bodyLen * 0.45); car.add(bedBack);
            // Estribo lateral cromado
            const stepL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 1.6), chromeMat);
            stepL.position.set(-bodyW / 2 - 0.04, 0.22, 0.2); car.add(stepL);
            const stepR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 1.6), chromeMat);
            stepR.position.set(bodyW / 2 + 0.04, 0.22, 0.2); car.add(stepR);
        } else {
            // Sedán clásico
            bodyLen = 3.6; bodyH = 0.62; bodyW = 1.55; cabLen = 1.9; cabH = 0.52; cabOff = -0.05;
            const body = new THREE.Mesh(new THREE.BoxGeometry(bodyW, bodyH, bodyLen), bMat);
            body.position.set(0, 0.46, 0); car.add(body);
            // Guardabarros
            const fenderL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, bodyLen * 0.9), bMatDark);
            fenderL.position.set(-bodyW / 2 - 0.02, 0.30, 0); car.add(fenderL);
            const fenderR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, bodyLen * 0.9), bMatDark);
            fenderR.position.set(bodyW / 2 + 0.02, 0.30, 0); car.add(fenderR);
            // Cabina con línea de techo suave
            const cab = new THREE.Mesh(new THREE.BoxGeometry(bodyW * 0.84, cabH, cabLen), glassMat);
            cab.position.set(0, 0.94, cabOff); car.add(cab);
            // Techo sólido sobre la cabina
            const cabRoof = new THREE.Mesh(new THREE.BoxGeometry(bodyW * 0.86, 0.05, cabLen + 0.04), bMat);
            cabRoof.position.set(0, 1.21, cabOff); car.add(cabRoof);
            // Pilar A y C (soportes del techo)
            [-1, 1].forEach(side => {
                const pA = new THREE.Mesh(new THREE.BoxGeometry(0.06, cabH, 0.08), bMat);
                pA.position.set(side * bodyW * 0.41, 0.94, cabOff + cabLen / 2 - 0.04); car.add(pA);
                const pC = new THREE.Mesh(new THREE.BoxGeometry(0.06, cabH, 0.08), bMat);
                pC.position.set(side * bodyW * 0.41, 0.94, cabOff - cabLen / 2 + 0.04); car.add(pC);
            });
            // Maletero trasero ligeramente elevado
            const trunk = new THREE.Mesh(new THREE.BoxGeometry(bodyW - 0.04, 0.12, bodyLen * 0.22), bMat);
            trunk.position.set(0, bodyH + 0.28, -bodyLen * 0.34); car.add(trunk);
            // Moldura cromada central
            const strip = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.04, bodyLen * 0.85), chromeMat);
            strip.position.set(-bodyW / 2 - 0.01, 0.56, 0); car.add(strip);
            const strip2 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.04, bodyLen * 0.85), chromeMat);
            strip2.position.set(bodyW / 2 + 0.01, 0.56, 0); car.add(strip2);
        }

        // === ELEMENTOS COMUNES MEJORADOS ===

        // Parachoques cromados delantero y trasero
        const bmpF = new THREE.Mesh(new THREE.BoxGeometry(bodyW + 0.08, 0.12, 0.10), chromeMat);
        bmpF.position.set(0, 0.24, bodyLen / 2 + 0.04); car.add(bmpF);
        const bmpB = new THREE.Mesh(new THREE.BoxGeometry(bodyW + 0.08, 0.12, 0.10), chromeMat);
        bmpB.position.set(0, 0.24, -bodyLen / 2 - 0.04); car.add(bmpB);

        // Faros delanteros (circulares estilo retro)
        [-0.52, 0.52].forEach(xOff => {
            const hlOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.06, 10), chromeMat);
            hlOuter.rotation.x = Math.PI / 2; hlOuter.position.set(xOff, 0.46, bodyLen / 2 + 0.04); car.add(hlOuter);
            const hlInner = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.07, 10), headlightMat);
            hlInner.rotation.x = Math.PI / 2; hlInner.position.set(xOff, 0.46, bodyLen / 2 + 0.05); car.add(hlInner);
        });

        // Faros traseros (rectangulares)
        [-0.55, 0.55].forEach(xOff => {
            const tlOuter = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.06), chromeMat);
            tlOuter.position.set(xOff, 0.46, -bodyLen / 2 - 0.04); car.add(tlOuter);
            const tlInner = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.10, 0.07), taillightMat);
            tlInner.position.set(xOff, 0.46, -bodyLen / 2 - 0.05); car.add(tlInner);
        });

        // Placa trasera
        const plate = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.10, 0.02), plateMat);
        plate.position.set(0, 0.30, -bodyLen / 2 - 0.06); car.add(plate);

        // Espejos retrovisores laterales
        [-1, 1].forEach(side => {
            const mirrorArm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.03), chromeMat);
            mirrorArm.position.set(side * (bodyW / 2 + 0.06), 0.72, bodyLen * 0.22); car.add(mirrorArm);
            const mirrorFace = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.08, 0.10), glassMat);
            mirrorFace.position.set(side * (bodyW / 2 + 0.12), 0.72, bodyLen * 0.22); car.add(mirrorFace);
        });

        // Líneas de puertas grabadas (sutiles)
        const doorLineMat = new THREE.MeshLambertMaterial({ color: new THREE.Color(colorHex).multiplyScalar(0.85) });
        [-1, 1].forEach(side => {
            const dl = new THREE.Mesh(new THREE.BoxGeometry(0.01, bodyH * 0.75, 0.02), doorLineMat);
            dl.position.set(side * (bodyW / 2 + 0.005), 0.50, 0.3); car.add(dl);
            if (type !== 'pickup') {
                const dl2 = new THREE.Mesh(new THREE.BoxGeometry(0.01, bodyH * 0.75, 0.02), doorLineMat);
                dl2.position.set(side * (bodyW / 2 + 0.005), 0.50, -0.5); car.add(dl2);
            }
        });

        // 4 Ruedas con neumáticos y tapacubos detallados
        const wheelPositions = [
            [-bodyW * 0.42, bodyLen * 0.28], [bodyW * 0.42, bodyLen * 0.28],
            [-bodyW * 0.42, -bodyLen * 0.28], [bodyW * 0.42, -bodyLen * 0.28]
        ];
        wheelPositions.forEach(wpos => {
            // Neumático exterior (goma negra)
            const tire = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.08, 8, 12), rubberMat);
            tire.rotation.y = Math.PI / 2; tire.position.set(wpos[0], 0.22, wpos[1]); car.add(tire);
            // Disco de la rueda
            const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.10, 10), chromeMat);
            rim.rotation.z = Math.PI / 2; rim.position.set(wpos[0], 0.22, wpos[1]); car.add(rim);
            // Centro del tapacubos
            const hubCap = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.12, 8), new THREE.MeshLambertMaterial({ color: 0xa0a0a0 }));
            hubCap.rotation.z = Math.PI / 2; hubCap.position.set(wpos[0], 0.22, wpos[1]); car.add(hubCap);
            // Arco de paso de rueda
            const wellW = wpos[0] > 0 ? bodyW / 2 + 0.03 : -bodyW / 2 - 0.03;
            const archSide = wpos[0] > 0 ? 1 : -1;
            const arch = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.32, 0.48), bMatDark);
            arch.position.set(archSide * (bodyW / 2 + 0.01), 0.30, wpos[1]); car.add(arch);
        });

        return car;
    }

    // ---- EMISOR DE HUMO DE CHIMENEA ----
    function createChimneySmokeEmitter(x, y, z) {
        const smokePuffs = [];
        const sMat = new THREE.MeshBasicMaterial({ color: 0xdddddd, transparent: true, opacity: 0.35 });
        for (let i = 0; i < 4; i++) {
            const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18 + i * 0.08), sMat);
            puff.position.set(x + (Math.random() - 0.5) * 0.1, y + i * 0.4, z + (Math.random() - 0.5) * 0.1);
            scene.add(puff);
            smokePuffs.push({ mesh: puff, originY: y, speed: 0.6 + Math.random() * 0.3, offset: i * 0.3 });
        }
        outdoorChimneySmokes.push(...smokePuffs);
    }

    // ---- TRÁFICO DINÁMICO (VARIEDAD DE COCHES RETRO CON DETALLE 3D MEJORADO) ----
    function createVariedOutdoorCars(groundY, streetZ) {
        outdoorCars = [];
        const carConfigs = [
            { type: 'sedan', color: 0xc82a2a, x: -140, z: streetZ + 2.2, dir: 1, speed: 4.8, delay: 0 },
            { type: 'taxi', color: 0xe0ad19, x: 140, z: streetZ - 2.2, dir: -1, speed: 5.2, delay: 8 },
            { type: 'wagon', color: 0x2255aa, x: -140, z: streetZ + 2.2, dir: 1, speed: 4.2, delay: 18 },
            { type: 'van', color: 0xe8ecf0, x: 140, z: streetZ - 2.2, dir: -1, speed: 3.8, delay: 28 },
            { type: 'coupe', color: 0x1b7a6b, x: -140, z: streetZ + 2.2, dir: 1, speed: 5.8, delay: 38 }
        ];

        carConfigs.forEach(cfg => {
            const carGroup = new THREE.Group();
            const bMat = new THREE.MeshLambertMaterial({ color: cfg.color, side: THREE.DoubleSide });
            const bMatDark = new THREE.MeshLambertMaterial({ color: new THREE.Color(cfg.color).multiplyScalar(0.7) });
            const glassMat = new THREE.MeshLambertMaterial({ color: 0x1a2a3a, transparent: true, opacity: 0.75, side: THREE.DoubleSide });
            const chromeMat = new THREE.MeshLambertMaterial({ color: 0xcccccc });
            const rubberMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
            const headMat = new THREE.MeshBasicMaterial({ color: 0xffffaa });
            const tailMat = new THREE.MeshBasicMaterial({ color: 0xff1111 });
            const plateMat = new THREE.MeshLambertMaterial({ color: 0xeeeeee });

            let bodyLen = 3.2, bodyH = 0.65, bodyW = 1.5;
            let cabinLen = 1.8, cabinH = 0.55, cabinOffX = -0.1;

            if (cfg.type === 'van') {
                bodyLen = 3.6; bodyH = 1.1; bodyW = 1.6; cabinLen = 2.4; cabinH = 0.6; cabinOffX = -0.3;
            } else if (cfg.type === 'wagon') {
                bodyLen = 3.5; bodyW = 1.55; cabinLen = 2.2; cabinOffX = -0.2;
            } else if (cfg.type === 'coupe') {
                bodyLen = 3.0; bodyH = 0.55; bodyW = 1.45; cabinLen = 1.5; cabinOffX = -0.1;
            } else if (cfg.type === 'taxi') {
                bodyLen = 3.3; bodyW = 1.5; cabinLen = 1.9; cabinOffX = -0.05;
            }

            // Carrocería principal
            const body = new THREE.Mesh(new THREE.BoxGeometry(bodyLen, bodyH, bodyW), bMat);
            body.position.set(0, bodyH / 2 + 0.15, 0); carGroup.add(body);

            // Guardabarros inferiores
            [-1, 1].forEach(side => {
                const fender = new THREE.Mesh(new THREE.BoxGeometry(bodyLen * 0.92, 0.16, 0.05), bMatDark);
                fender.position.set(0, 0.22, side * (bodyW / 2 + 0.02)); carGroup.add(fender);
            });

            // Cabina con pilares
            const cabin = new THREE.Mesh(new THREE.BoxGeometry(cabinLen, cabinH, bodyW * 0.86), glassMat);
            cabin.position.set(cabinOffX, bodyH + cabinH / 2 + 0.14, 0); carGroup.add(cabin);

            // Techo sólido
            const roof = new THREE.Mesh(new THREE.BoxGeometry(cabinLen + 0.04, 0.05, bodyW * 0.88), bMat);
            roof.position.set(cabinOffX, bodyH + cabinH + 0.16, 0); carGroup.add(roof);

            // Pilares A y C
            [-1, 1].forEach(side => {
                const pA = new THREE.Mesh(new THREE.BoxGeometry(0.06, cabinH, 0.06), bMat);
                pA.position.set(cabinOffX + cabinLen / 2 - 0.03, bodyH + cabinH / 2 + 0.14, side * bodyW * 0.42); carGroup.add(pA);
                const pC = new THREE.Mesh(new THREE.BoxGeometry(0.06, cabinH, 0.06), bMat);
                pC.position.set(cabinOffX - cabinLen / 2 + 0.03, bodyH + cabinH / 2 + 0.14, side * bodyW * 0.42); carGroup.add(pC);
            });

            // Letrero de Taxi
            if (cfg.type === 'taxi') {
                const sign = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.16, 0.2), new THREE.MeshBasicMaterial({ color: 0xffffff }));
                sign.position.set(0, bodyH + cabinH + 0.25, 0); carGroup.add(sign);
                // Franja de chequerboard lateral
                const taxiStripe = new THREE.Mesh(new THREE.BoxGeometry(bodyLen * 0.7, 0.06, 0.02), new THREE.MeshLambertMaterial({ color: 0x111111 }));
                taxiStripe.position.set(0, bodyH * 0.7 + 0.15, bodyW / 2 + 0.01); carGroup.add(taxiStripe);
                const taxiStripe2 = taxiStripe.clone(); taxiStripe2.position.z = -bodyW / 2 - 0.01; carGroup.add(taxiStripe2);
            }

            // Alerón trasero coupé
            if (cfg.type === 'coupe') {
                const spoiler = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.10, bodyW * 0.85), bMat);
                spoiler.position.set(cfg.dir > 0 ? -bodyLen / 2 + 0.1 : bodyLen / 2 - 0.1, bodyH + 0.22, 0); carGroup.add(spoiler);
                const spoilerLegs = [-bodyW * 0.3, bodyW * 0.3];
                spoilerLegs.forEach(sz => {
                    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.04), chromeMat);
                    leg.position.set(cfg.dir > 0 ? -bodyLen / 2 + 0.1 : bodyLen / 2 - 0.1, bodyH + 0.14, sz); carGroup.add(leg);
                });
            }

            // Panel de madera para wagon
            if (cfg.type === 'wagon') {
                [-1, 1].forEach(side => {
                    const woodPanel = new THREE.Mesh(new THREE.BoxGeometry(bodyLen * 0.6, bodyH * 0.45, 0.02), new THREE.MeshLambertMaterial({ color: 0x73431f }));
                    woodPanel.position.set(-0.1, bodyH * 0.6 + 0.15, side * (bodyW / 2 + 0.01)); carGroup.add(woodPanel);
                });
            }

            // Puerta trasera elevada para van
            if (cfg.type === 'van') {
                const vanBack = new THREE.Mesh(new THREE.BoxGeometry(0.04, bodyH * 0.8, bodyW * 0.9), bMatDark);
                vanBack.position.set(cfg.dir > 0 ? -bodyLen / 2 - 0.02 : bodyLen / 2 + 0.02, bodyH * 0.6 + 0.15, 0); carGroup.add(vanBack);
            }

            // Parachoques cromados
            const bmpFx = cfg.dir > 0 ? bodyLen / 2 + 0.04 : -bodyLen / 2 - 0.04;
            const bmpBx = cfg.dir > 0 ? -bodyLen / 2 - 0.04 : bodyLen / 2 + 0.04;
            const bmpFront = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.12, bodyW + 0.06), chromeMat);
            bmpFront.position.set(bmpFx, 0.22, 0); carGroup.add(bmpFront);
            const bmpBack = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.12, bodyW + 0.06), chromeMat);
            bmpBack.position.set(bmpBx, 0.22, 0); carGroup.add(bmpBack);

            // Molduras cromadas laterales
            [-1, 1].forEach(side => {
                const molding = new THREE.Mesh(new THREE.BoxGeometry(bodyLen * 0.85, 0.03, 0.02), chromeMat);
                molding.position.set(0, bodyH * 0.65 + 0.15, side * (bodyW / 2 + 0.01)); carGroup.add(molding);
            });

            // Espejos retrovisores
            [-1, 1].forEach(side => {
                const mArm = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.12), chromeMat);
                mArm.position.set(cabinOffX + cabinLen * 0.4, bodyH + cabinH * 0.3 + 0.14, side * (bodyW / 2 + 0.05)); carGroup.add(mArm);
                const mFace = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.02), glassMat);
                mFace.position.set(cabinOffX + cabinLen * 0.4, bodyH + cabinH * 0.3 + 0.14, side * (bodyW / 2 + 0.10)); carGroup.add(mFace);
            });

            // Líneas de puerta
            [-1, 1].forEach(side => {
                const dl = new THREE.Mesh(new THREE.BoxGeometry(0.02, bodyH * 0.7, 0.01), bMatDark);
                dl.position.set(0.25, bodyH * 0.55 + 0.15, side * (bodyW / 2 + 0.005)); carGroup.add(dl);
            });

            // 4 Ruedas con torus y rims
            const fx = cfg.dir > 0 ? bodyLen / 2 + 0.02 : -bodyLen / 2 - 0.02;
            const bx = cfg.dir > 0 ? -bodyLen / 2 - 0.02 : bodyLen / 2 + 0.02;
            [[-bodyLen * 0.3, -bodyW * 0.48], [bodyLen * 0.3, -bodyW * 0.48],
             [-bodyLen * 0.3, bodyW * 0.48], [bodyLen * 0.3, bodyW * 0.48]].forEach(wPos => {
                const tire = new THREE.Mesh(new THREE.TorusGeometry(0.20, 0.07, 8, 12), rubberMat);
                tire.rotation.x = Math.PI / 2; tire.position.set(wPos[0], 0.20, wPos[1]); carGroup.add(tire);
                const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.09, 10), chromeMat);
                rim.rotation.x = Math.PI / 2; rim.position.set(wPos[0], 0.20, wPos[1]); carGroup.add(rim);
                const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.10, 6), new THREE.MeshLambertMaterial({ color: 0x999999 }));
                hub.rotation.x = Math.PI / 2; hub.position.set(wPos[0], 0.20, wPos[1]); carGroup.add(hub);
            });

            // Faros delanteros (circulares con halo de luz)
            [-0.48, 0.48].forEach(zOff => {
                const hlRing = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 10), chromeMat);
                hlRing.rotation.z = Math.PI / 2; hlRing.position.set(fx, bodyH * 0.65 + 0.15, zOff); carGroup.add(hlRing);
                const hl = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 10), headMat);
                hl.rotation.z = Math.PI / 2; hl.position.set(fx + (cfg.dir > 0 ? 0.01 : -0.01), bodyH * 0.65 + 0.15, zOff); carGroup.add(hl);
            });

            // Parche de luz suave plano sobre el asfalto
            const lightPatch = new THREE.Mesh(
                new THREE.PlaneGeometry(2.8, 1.5),
                new THREE.MeshBasicMaterial({ color: 0xfff3aa, transparent: true, opacity: 0.10, side: THREE.DoubleSide })
            );
            lightPatch.rotation.x = -Math.PI / 2;
            lightPatch.position.set(cfg.dir > 0 ? 2.6 : -2.6, 0.04, 0);
            carGroup.add(lightPatch);

            // Faros traseros (rectangulares con reflector)
            [-0.5, 0.5].forEach(zOff => {
                const tlOuter = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.22), chromeMat);
                tlOuter.position.set(bx, bodyH * 0.65 + 0.15, zOff); carGroup.add(tlOuter);
                const tl = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.10, 0.18), tailMat);
                tl.position.set(bx + (cfg.dir > 0 ? -0.01 : 0.01), bodyH * 0.65 + 0.15, zOff); carGroup.add(tl);
            });

            // Placa trasera
            const plate = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.08, 0.30), plateMat);
            plate.position.set(bx + (cfg.dir > 0 ? -0.01 : 0.01), 0.28, 0); carGroup.add(plate);

            carGroup.position.set(cfg.x, groundY, cfg.z);
            scene.add(carGroup);

            outdoorCars.push({
                group: carGroup, dir: cfg.dir, speed: cfg.speed,
                waitTimer: cfg.delay, startX: cfg.dir > 0 ? -160 : 160, beam: lightPatch
            });
        });
    }

    // ---- AVES VOLANDO EN EL CIELO ----
    function createOutdoorBirds() {
        outdoorBirds = [];
        const birdMat = new THREE.MeshBasicMaterial({ color: 0x1a222d, side: THREE.DoubleSide });

        for (let i = 0; i < 4; i++) {
            const bGroup = new THREE.Group();
            // Cuerpo
            const body = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.35, 4), birdMat);
            body.rotation.x = Math.PI / 2; bGroup.add(body);

            // Ala izquierda
            const wingL = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.14), birdMat);
            wingL.position.set(-0.16, 0, 0); bGroup.add(wingL);

            // Ala derecha
            const wingR = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.14), birdMat);
            wingR.position.set(0.16, 0, 0); bGroup.add(wingR);

            bGroup.position.set(-45 + i * 2.5, 16 + i * 0.8, -32 - i * 1.5);
            scene.add(bGroup);

            outdoorBirds.push({
                group: bGroup, wingL: wingL, wingR: wingR,
                speed: 4.5, flapSpeed: 10 + i * 1.5, offset: i * 0.4
            });
        }
    }

    // ---- CICLISTAS ULTRA REALISTAS 90s EN LA ACERA ----
    function createRealisticCyclists(groundY, sidewalkNearZ, sidewalkFarZ) {
        outdoorPedestrians = [];

        const cyclistConfigs = [
            // Ciclista 1: Acera cercana hacia la derecha (+X) — Bici roja, suéter verde, gorra amarilla
            {
                dir: 1, z: sidewalkNearZ, startX: -75, speed: 4.2, delay: 2.5,
                bikeColor: 0xd92626, shirtColor: 0x16a34a, pantsColor: 0x1e293b,
                hasCap: true, capColor: 0xeab308, hasBackpack: true, backpackColor: 0x475569
            },
            // Ciclista 2: Acera lejana hacia la izquierda (-X) — Bici azul eléctrico, buzo ámbar, mochila
            {
                dir: -1, z: sidewalkFarZ, startX: 75, speed: 3.7, delay: 16.0,
                bikeColor: 0x2563eb, shirtColor: 0xf59e0b, pantsColor: 0x334155,
                hasCap: false, hasBackpack: true, backpackColor: 0x6d28d9
            }
        ];

        // Función auxiliar para construir tubos cilíndricos del cuadro 3D
        function createTubeSegment(p1, p2, radius, mat) {
            const v1 = new THREE.Vector3(p1[0], p1[1], p1[2] || 0);
            const v2 = new THREE.Vector3(p2[0], p2[1], p2[2] || 0);
            const dist = v1.distanceTo(v2);
            const cyl = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, dist, 6), mat);
            const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
            cyl.position.copy(mid);
            cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v2.clone().sub(v1).normalize());
            return cyl;
        }

        cyclistConfigs.forEach(cfg => {
            const pedGroup = new THREE.Group();
            const bikeMat = new THREE.MeshLambertMaterial({ color: cfg.bikeColor });
            const chromeMat = new THREE.MeshLambertMaterial({ color: 0xd0d7de });
            const tireMat = new THREE.MeshLambertMaterial({ color: 0x141414 });
            const spokeMat = new THREE.MeshBasicMaterial({ color: 0x8c9bb0, transparent: true, opacity: 0.65 });
            const shirtMat = new THREE.MeshLambertMaterial({ color: cfg.shirtColor });
            const pantsMat = new THREE.MeshLambertMaterial({ color: cfg.pantsColor });
            const skinMat = new THREE.MeshLambertMaterial({ color: 0xffdfba });
            const shoeMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
            const saddleMat = new THREE.MeshLambertMaterial({ color: 0x181818 });

            const bikeGroup = new THREE.Group();
            if (cfg.dir < 0) {
                bikeGroup.rotation.y = Math.PI;
            }

            const WHEEL_R = 0.32;
            const WHEELBASE = 1.05;

            // 1. RUEDA TRASERA
            const rearWheelGroup = new THREE.Group();
            rearWheelGroup.position.set(-WHEELBASE / 2, WHEEL_R, 0);
            const rearTire = new THREE.Mesh(new THREE.TorusGeometry(WHEEL_R, 0.035, 8, 16), tireMat);
            rearWheelGroup.add(rearTire);
            const rearHub = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 8), chromeMat);
            rearHub.rotation.x = Math.PI / 2; rearWheelGroup.add(rearHub);
            const rearSpokes = new THREE.Mesh(new THREE.CircleGeometry(WHEEL_R * 0.92, 8), spokeMat);
            rearWheelGroup.add(rearSpokes);
            bikeGroup.add(rearWheelGroup);

            // 2. RUEDA DELANTERA
            const frontWheelGroup = new THREE.Group();
            frontWheelGroup.position.set(WHEELBASE / 2, WHEEL_R, 0);
            const frontTire = new THREE.Mesh(new THREE.TorusGeometry(WHEEL_R, 0.035, 8, 16), tireMat);
            frontWheelGroup.add(frontTire);
            const frontHub = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 8), chromeMat);
            frontHub.rotation.x = Math.PI / 2; frontWheelGroup.add(frontHub);
            const frontSpokes = new THREE.Mesh(new THREE.CircleGeometry(WHEEL_R * 0.92, 8), spokeMat);
            frontWheelGroup.add(frontSpokes);
            bikeGroup.add(frontWheelGroup);

            // 3. FARO DELANTERO Y REFLECTOR TRASERO
            const headlight = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.06, 8), chromeMat);
            headlight.rotation.z = Math.PI / 2;
            headlight.position.set(WHEELBASE / 2 + 0.05, 0.72, 0);
            const headLens = new THREE.Mesh(new THREE.CircleGeometry(0.04, 8), new THREE.MeshBasicMaterial({ color: 0xffffbb }));
            headLens.rotation.y = Math.PI / 2;
            headLens.position.set(WHEELBASE / 2 + 0.08, 0.72, 0);
            bikeGroup.add(headlight);
            bikeGroup.add(headLens);

            const reflector = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.04), new THREE.MeshBasicMaterial({ color: 0xff2222 }));
            reflector.position.set(-WHEELBASE / 2 - 0.04, 0.58, 0);
            bikeGroup.add(reflector);

            // 4. CUADRO DE BICICLETA (GEOMETRÍA DIAMANTE RETRO)
            const bbX = -0.05, bbY = 0.28;
            const seatPostTopX = -0.18, seatPostTopY = 0.68;
            const headTubeTopX = 0.42, headTubeTopY = 0.75;
            const rearHubX = -WHEELBASE / 2, rearHubY = WHEEL_R;
            const frontHubX = WHEELBASE / 2, frontHubY = WHEEL_R;

            // Tubo del sillín
            bikeGroup.add(createTubeSegment([bbX, bbY, 0], [seatPostTopX, seatPostTopY, 0], 0.022, bikeMat));
            // Tubo superior horizontal
            bikeGroup.add(createTubeSegment([seatPostTopX, seatPostTopY - 0.03, 0], [headTubeTopX, headTubeTopY - 0.05, 0], 0.02, bikeMat));
            // Tubo diagonal inferior
            bikeGroup.add(createTubeSegment([bbX, bbY, 0], [headTubeTopX, headTubeTopY - 0.05, 0], 0.024, bikeMat));
            // Vainas superiores traseras
            bikeGroup.add(createTubeSegment([seatPostTopX, seatPostTopY - 0.03, -0.04], [rearHubX, rearHubY, -0.04], 0.015, bikeMat));
            bikeGroup.add(createTubeSegment([seatPostTopX, seatPostTopY - 0.03, 0.04], [rearHubX, rearHubY, 0.04], 0.015, bikeMat));
            // Vainas inferiores traseras
            bikeGroup.add(createTubeSegment([bbX, bbY, -0.04], [rearHubX, rearHubY, -0.04], 0.016, bikeMat));
            bikeGroup.add(createTubeSegment([bbX, bbY, 0.04], [rearHubX, rearHubY, 0.04], 0.016, bikeMat));
            // Horquilla delantera
            bikeGroup.add(createTubeSegment([headTubeTopX, headTubeTopY - 0.05, -0.03], [frontHubX, frontHubY, -0.03], 0.018, chromeMat));
            bikeGroup.add(createTubeSegment([headTubeTopX, headTubeTopY - 0.05, 0.03], [frontHubX, frontHubY, 0.03], 0.018, chromeMat));

            // Sillín / Asiento ergonómico
            const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.12), saddleMat);
            saddle.position.set(seatPostTopX - 0.02, seatPostTopY + 0.04, 0);
            bikeGroup.add(saddle);

            // Manillar, potencia y puños
            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.1, 6), chromeMat);
            stem.position.set(headTubeTopX, headTubeTopY + 0.02, 0);
            bikeGroup.add(stem);
            const handlebar = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.44, 6), chromeMat);
            handlebar.rotation.x = Math.PI / 2;
            handlebar.position.set(headTubeTopX + 0.03, headTubeTopY + 0.07, 0);
            bikeGroup.add(handlebar);
            [-0.18, 0.18].forEach(gz => {
                const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.09, 6), saddleMat);
                grip.rotation.x = Math.PI / 2;
                grip.position.set(headTubeTopX + 0.03, headTubeTopY + 0.07, gz);
                bikeGroup.add(grip);
            });

            // 5. BIELAS, PLATOS Y PEDALES (Giran con el pedaleo)
            const crankGroup = new THREE.Group();
            crankGroup.position.set(bbX, bbY, 0);
            const chainring = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 12), chromeMat);
            chainring.rotation.x = Math.PI / 2; crankGroup.add(chainring);

            const crankArmL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.14, 0.02), chromeMat);
            crankArmL.position.set(0, 0.06, -0.07); crankGroup.add(crankArmL);
            const pedalL = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.025, 0.05), saddleMat);
            pedalL.position.set(0, 0.13, -0.09); crankGroup.add(pedalL);

            const crankArmR = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.14, 0.02), chromeMat);
            crankArmR.position.set(0, -0.06, 0.07); crankGroup.add(crankArmR);
            const pedalR = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.025, 0.05), saddleMat);
            pedalR.position.set(0, -0.13, 0.09); crankGroup.add(pedalR);

            bikeGroup.add(crankGroup);

            // 6. CICLISTA ARTICULADO CON BRAZOS Y ROPA
            const riderGroup = new THREE.Group();
            const torso = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.44, 0.22), shirtMat);
            torso.position.set(seatPostTopX + 0.12, seatPostTopY + 0.32, 0);
            torso.rotation.z = -0.36;
            riderGroup.add(torso);

            if (cfg.hasBackpack) {
                const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.32, 0.2), new THREE.MeshLambertMaterial({ color: cfg.backpackColor }));
                backpack.position.set(seatPostTopX + 0.02, seatPostTopY + 0.36, 0);
                backpack.rotation.z = -0.36;
                riderGroup.add(backpack);
            }

            const headGroup = new THREE.Group();
            headGroup.position.set(seatPostTopX + 0.26, seatPostTopY + 0.58, 0);
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), skinMat);
            headGroup.add(head);

            if (cfg.hasCap) {
                const cap = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.09, 8), new THREE.MeshLambertMaterial({ color: cfg.capColor }));
                cap.position.set(0, 0.08, 0); headGroup.add(cap);
                const visor = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.12), new THREE.MeshLambertMaterial({ color: cfg.capColor }));
                visor.position.set(0.08, 0.04, 0); headGroup.add(visor);
            }
            riderGroup.add(headGroup);

            // Brazos sujetando el manillar
            [-0.14, 0.14].forEach(az => {
                const shoulderPos = [seatPostTopX + 0.2, seatPostTopY + 0.46, az];
                const handPos = [headTubeTopX + 0.03, headTubeTopY + 0.07, az > 0 ? 0.16 : -0.16];
                const arm = createTubeSegment(shoulderPos, handPos, 0.038, shirtMat);
                riderGroup.add(arm);
                const hand = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), skinMat);
                hand.position.set(handPos[0], handPos[1], handPos[2]);
                riderGroup.add(hand);
            });

            // PIERNAS CON MUSLOS, PANTORRILLAS Y ZAPATOS
            const hipL = [seatPostTopX - 0.02, seatPostTopY + 0.08, -0.1];
            const thighL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.26, 0.08), pantsMat);
            const shinL = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.26, 0.07), pantsMat);
            const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.05, 0.07), shoeMat);
            riderGroup.add(thighL);
            riderGroup.add(shinL);
            riderGroup.add(shoeL);

            const hipR = [seatPostTopX - 0.02, seatPostTopY + 0.08, 0.1];
            const thighR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.26, 0.08), pantsMat);
            const shinR = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.26, 0.07), pantsMat);
            const shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.05, 0.07), shoeMat);
            riderGroup.add(thighR);
            riderGroup.add(shinR);
            riderGroup.add(shoeR);

            bikeGroup.add(riderGroup);
            pedGroup.add(bikeGroup);

            pedGroup.position.set(cfg.startX, groundY + 0.16, cfg.z);
            scene.add(pedGroup);

            outdoorPedestrians.push({
                group: pedGroup,
                bikeGroup: bikeGroup,
                rearWheel: rearWheelGroup,
                frontWheel: frontWheelGroup,
                crankGroup: crankGroup,
                thighL, shinL, shoeL,
                thighR, shinR, shoeR,
                riderGroup,
                torso,
                hipL, hipR,
                bbX, bbY,
                dir: cfg.dir,
                speed: cfg.speed,
                waitTimer: cfg.delay,
                startX: cfg.startX,
                pedalAngle: 0
            });
        });

        // Mantener compatibilidad de referencia global
        outdoorPedestrian = outdoorPedestrians[0] || null;
    }

    // ---- PERSONA ENCAPUCHADA EN LA ACERA DE ENFRENTE (EVENTO ESPONTÁNEO) ----
    function buildHoodedStranger(groundY, sidewalkFarZ) {
        hoodedStrangerGroup = new THREE.Group();

        const hoodieMat = new THREE.MeshLambertMaterial({ color: 0x1f232b, side: THREE.DoubleSide });
        const shadowMat = new THREE.MeshBasicMaterial({ color: 0x05070a, side: THREE.DoubleSide });
        const jeansMat = new THREE.MeshLambertMaterial({ color: 0x1e293b, side: THREE.DoubleSide });
        const shoeMat = new THREE.MeshLambertMaterial({ color: 0x0f1318, side: THREE.DoubleSide });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xccd6e0, transparent: true, opacity: 0.85 });

        // 1. Zapatos / zapatillas
        const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.22), shoeMat);
        shoeL.position.set(-0.11, 0.03, 0); hoodedStrangerGroup.add(shoeL);
        const shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.22), shoeMat);
        shoeR.position.set(0.11, 0.03, 0); hoodedStrangerGroup.add(shoeR);

        // 2. Piernas / Jeans
        const legL = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.72, 0.12), jeansMat);
        legL.position.set(-0.11, 0.39, 0); hoodedStrangerGroup.add(legL);
        const legR = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.72, 0.12), jeansMat);
        legR.position.set(0.11, 0.39, 0); hoodedStrangerGroup.add(legR);

        // 3. Torso con sudadera / buzo con capucha oversize
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.62, 0.26), hoodieMat);
        torso.position.set(0, 1.05, 0); hoodedStrangerGroup.add(torso);

        // Bolsillo canguro delantero
        const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.08), hoodieMat);
        pocket.position.set(0, 0.95, 0.12); hoodedStrangerGroup.add(pocket);

        // 4. Brazos con manos en los bolsillos
        const armL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.52, 0.1), hoodieMat);
        armL.position.set(-0.25, 1.02, 0.04);
        armL.rotation.z = 0.15;
        armL.rotation.x = 0.2;
        hoodedStrangerGroup.add(armL);

        const armR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.52, 0.1), hoodieMat);
        armR.position.set(0.25, 1.02, 0.04);
        armR.rotation.z = -0.15;
        armR.rotation.x = 0.2;
        hoodedStrangerGroup.add(armR);

        // 5. Cabeza con Capucha envolvente 3D
        const hoodOuter = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.42, 8), hoodieMat);
        hoodOuter.position.set(0, 1.54, 0);
        hoodOuter.rotation.x = 0.1;
        hoodedStrangerGroup.add(hoodOuter);

        const hoodBrim = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.035, 6, 12), hoodieMat);
        hoodBrim.position.set(0, 1.48, 0.09);
        hoodedStrangerGroup.add(hoodBrim);

        // Rostro en penumbras profundas dentro de la capucha
        const faceCavity = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), shadowMat);
        faceCavity.position.set(0, 1.47, 0.05);
        hoodedStrangerGroup.add(faceCavity);

        // Mirada fija sutil reflectante hacia la ventana
        const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.015, 0.01), eyeMat);
        eyeL.position.set(-0.04, 1.48, 0.14);
        hoodedStrangerGroup.add(eyeL);
        const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.015, 0.01), eyeMat);
        eyeR.position.set(0.04, 1.48, 0.14);
        hoodedStrangerGroup.add(eyeR);

        // Posicionado en la acera de enfrente, mirando hacia la ventana del jugador (z = -3.0)
        hoodedStrangerGroup.position.set(-0.8, groundY + 0.08, sidewalkFarZ + 0.6);
        hoodedStrangerGroup.lookAt(0.8, 1.45, -3.0);
        hoodedStrangerGroup.visible = false;
        scene.add(hoodedStrangerGroup);
    }

    // ---- LUCIÉRNAGAS NOCTURNAS ----
    function createOutdoorFireflies(groundY) {
        const count = 28;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 55;
            positions[i * 3 + 1] = groundY + 0.4 + Math.random() * 2.5;
            positions[i * 3 + 2] = -6 - Math.random() * 20;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({
            color: 0xccff33, size: 0.18, transparent: true, opacity: 0.0
        });
        outdoorFireflies = new THREE.Points(geo, mat);
        scene.add(outdoorFireflies);
    }

    function createStarParticles() {
        const sCount = 220;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(sCount * 3);
        for (let i = 0; i < sCount; i++) {
            // Distribución hemisférica 360° en la bóveda celeste a radio 240
            const theta = Math.random() * Math.PI * 2; // Azimut 360°
            const phi = 0.15 + Math.random() * (Math.PI / 2 - 0.20); // Elevación sobre el horizonte
            const r = 235 + Math.random() * 15;
            positions[i * 3] = r * Math.cos(phi) * Math.sin(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) + 4.0; // Siempre elevado en el cielo
            positions[i * 3 + 2] = r * Math.cos(phi) * Math.cos(theta);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.35, transparent: true, opacity: 0.90 });
        starParticles = new THREE.Points(geo, mat);
        scene.add(starParticles);
    }

    function createRainParticles() {
        const count = 350;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 1] = -4.5 + Math.random() * 26;
            positions[i * 3 + 2] = -2 - Math.random() * 26;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({ color: 0xc2e2ff, size: 0.12, transparent: true, opacity: 0.0 });
        rainParticles = new THREE.Points(geo, mat);
        rainParticles.visible = false;
        scene.add(rainParticles);
    }

    // ========================================================
    // BUCLE DE ACTUALIZACIÓN DEL EXTERIOR & CLIMA EN VIVO
    // ========================================================
    function updateOutdoorEnvironment(dt) {
        if (!isRunning || !window.state || !window.state.freeRoam || isNightmareActive) return;
        windTimer += dt;

        // 1. Clima y Lluvia
        updateWeather(dt);

        // 2. Tráfico de Coches 90s con Sistema Anti-Colisión Inteligente (Sin sobrepasos ni choques)
        const curHour = window.state ? Math.floor((window.state.gameTimeMinutes || 0) / 60) % 24 : 3;
        const isDaytime = curHour >= 7 && curHour < 21;
        const nightWaitMult = isDaytime ? 1.0 : 2.5;
        const nightSpeedMult = isDaytime ? 1.0 : 0.75;
        const SAFE_FOLLOW_DISTANCE = 15.0;

        outdoorCars.forEach((car, idx) => {
            if (car.waitTimer > 0) {
                car.waitTimer -= dt;
                car.group.position.x = car.startX;
                return;
            }

            // Detección de distancia respecto a vehículos precedentes en el mismo carril
            let effectiveSpeed = car.speed * nightSpeedMult;
            for (let j = 0; j < outdoorCars.length; j++) {
                if (j === idx) continue;
                const other = outdoorCars[j];
                if (other.waitTimer > 0) continue;
                if (other.dir === car.dir) {
                    const distAhead = (other.group.position.x - car.group.position.x) * car.dir;
                    if (distAhead > 0 && distAhead < SAFE_FOLLOW_DISTANCE) {
                        // Igualar velocidad del vehículo de adelante y mantener distancia segura
                        effectiveSpeed = Math.min(effectiveSpeed, other.speed * nightSpeedMult * (distAhead / SAFE_FOLLOW_DISTANCE));
                    }
                }
            }

            car.group.position.x += car.dir * effectiveSpeed * dt;

            if (car.dir > 0 && car.group.position.x > 155) {
                car.waitTimer = (8 + Math.random() * 10) * nightWaitMult;
                car.group.position.x = -155;
            } else if (car.dir < 0 && car.group.position.x < -155) {
                car.waitTimer = (8 + Math.random() * 10) * nightWaitMult;
                car.group.position.x = 155;
            }
        });

        // 3. Nubes Volumétricas Drifting
        outdoorClouds.forEach(cloud => {
            cloud.group.position.x += cloud.speed * dt;
            if (cloud.group.position.x > 165) {
                cloud.group.position.x = -165;
            }
        });

        // 4. Balanceo de Árboles y Vegetación por el Viento
        outdoorTrees.forEach(t => {
            const sway = Math.sin(windTimer * t.swaySpeed) * t.swayAmp;
            t.mesh.rotation.z = sway;
        });

        // 5. Humo de Chimeneas Residenciales
        outdoorChimneySmokes.forEach(sp => {
            sp.mesh.position.y += dt * sp.speed;
            sp.mesh.position.x += Math.sin(windTimer * 2.0 + sp.offset) * 0.015;
            if (sp.mesh.position.y > sp.originY + 2.2) {
                sp.mesh.position.y = sp.originY;
                sp.mesh.position.x += (Math.random() - 0.5) * 0.1;
            }
        });

        // 6. Aves Volando en Formación
        outdoorBirds.forEach(bird => {
            bird.group.position.x += bird.speed * dt;
            const flap = Math.sin(windTimer * bird.flapSpeed) * 0.45;
            bird.wingL.rotation.z = flap;
            bird.wingR.rotation.z = -flap;

            if (bird.group.position.x > 150) {
                bird.group.position.x = -150;
            }
        });

        // 7. Ciclistas Realistas con Cinemática de Pedaleo y Balanceo
        outdoorPedestrians.forEach(ped => {
            if (ped.waitTimer > 0) {
                ped.waitTimer -= dt;
                ped.group.position.x = ped.startX;
                return;
            }

            ped.group.position.x += ped.dir * ped.speed * dt;

            // Rotación angular de ruedas
            const wheelAngVel = (ped.speed / 0.32) * dt * 3.2;
            ped.rearWheel.rotation.z -= wheelAngVel;
            ped.frontWheel.rotation.z -= wheelAngVel;

            // Cadencia de pedaleo rítmica
            ped.pedalAngle += (ped.speed / 0.32) * dt * 1.5;
            ped.crankGroup.rotation.z = -ped.pedalAngle;

            // Balanceo natural del cuerpo y bicicleta
            const sway = Math.sin(ped.pedalAngle) * 0.038;
            ped.bikeGroup.rotation.z = sway;
            ped.torso.rotation.y = Math.sin(ped.pedalAngle) * 0.025;

            // Cinemática de piernas (posicionamiento de rodillas y pies)
            const R_CRANK = 0.13;
            const bbX = ped.bbX, bbY = ped.bbY;

            // Pierna Izquierda
            const pLx = bbX + Math.sin(ped.pedalAngle) * R_CRANK;
            const pLy = bbY - Math.cos(ped.pedalAngle) * R_CRANK;
            ped.shoeL.position.set(pLx, pLy, -0.09);

            const hipL = ped.hipL;
            const kneeLx = (hipL[0] + pLx) * 0.5 + 0.08;
            const kneeLy = (hipL[1] + pLy) * 0.5 + 0.06;
            ped.thighL.position.set((hipL[0] + kneeLx) * 0.5, (hipL[1] + kneeLy) * 0.5, -0.1);
            ped.thighL.rotation.z = Math.atan2(kneeLy - hipL[1], kneeLx - hipL[0]) - Math.PI / 2;
            ped.shinL.position.set((kneeLx + pLx) * 0.5, (kneeLy + pLy) * 0.5, -0.1);
            ped.shinL.rotation.z = Math.atan2(pLy - kneeLy, pLx - kneeLx) - Math.PI / 2;

            // Pierna Derecha (Desfasada 180°)
            const pRx = bbX + Math.sin(ped.pedalAngle + Math.PI) * R_CRANK;
            const pRy = bbY - Math.cos(ped.pedalAngle + Math.PI) * R_CRANK;
            ped.shoeR.position.set(pRx, pRy, 0.09);

            const hipR = ped.hipR;
            const kneeRx = (hipR[0] + pRx) * 0.5 + 0.08;
            const kneeRy = (hipR[1] + pRy) * 0.5 + 0.06;
            ped.thighR.position.set((hipR[0] + kneeRx) * 0.5, (hipR[1] + kneeRy) * 0.5, 0.1);
            ped.thighR.rotation.z = Math.atan2(kneeRy - hipR[1], kneeRx - hipR[0]) - Math.PI / 2;
            ped.shinR.position.set((kneeRx + pRx) * 0.5, (kneeRy + pRy) * 0.5, 0.1);
            ped.shinR.rotation.z = Math.atan2(pRy - kneeRy, pRx - kneeRx) - Math.PI / 2;

            if (ped.dir > 0 && ped.group.position.x > 155) {
                ped.waitTimer = isDaytime ? (10 + Math.random() * 12) : (40 + Math.random() * 30);
                ped.group.position.x = -155;
            } else if (ped.dir < 0 && ped.group.position.x < -155) {
                ped.waitTimer = isDaytime ? (10 + Math.random() * 12) : (40 + Math.random() * 30);
                ped.group.position.x = 155;
            }
        });

        // 8. Audio Espacial Procedural de Tráfico (Coches, Bicicletas y Bocinas)
        if (window.RoomInteractions && typeof window.RoomInteractions.updateTrafficAudio === 'function') {
            const isWinOpen = window.state ? !!window.state.windowOpen : false;
            window.RoomInteractions.updateTrafficAudio(outdoorCars, outdoorPedestrians, isWinOpen, dt);
        }

        // 8. Luciérnagas Nocturnas
        if (outdoorFireflies && outdoorFireflies.material.opacity > 0.05) {
            const pos = outdoorFireflies.geometry.attributes.position.array;
            for (let i = 0; i < pos.length; i += 3) {
                pos[i + 1] += Math.sin(windTimer * 2.5 + i) * 0.008;
                pos[i] += Math.cos(windTimer * 1.8 + i) * 0.006;
            }
            outdoorFireflies.geometry.attributes.position.needsUpdate = true;
        }

        // 9. TV Parpadeante en Casa de Vecino
        if (outdoorTvWindow && outdoorTvLight) {
            const tvSin = Math.sin(flickerTimer * 4.5);
            const tvColor = tvSin > 0.3 ? 0x4da6ff : (tvSin < -0.3 ? 0x66e0ff : 0xddeeff);
            outdoorTvWindow.material.color.setHex(tvColor);
            outdoorTvLight.color.setHex(tvColor);
            outdoorTvLight.intensity = 1.2 + Math.sin(flickerTimer * 8.0) * 0.6;
        }

        // 10. Baliza de Torre de Telecomunicaciones Parpadeante
        if (towerBeaconLight) {
            towerBeaconLight.intensity = (Math.floor(windTimer * 1.5) % 2 === 0) ? 2.5 : 0.0;
        }

        // 11. Opacidad de Charcos Reflectantes según Clima
        outdoorPuddles.forEach(p => {
            p.material.opacity = Math.min(0.75, rainOpacity * 0.9);
        });

        // 12. Evento Ocasional de la Persona Encapuchada en la Vereda de Enfrente (Modo Libre)
        if (hoodedStrangerGroup && window.state && window.state.freeRoam) {
            if (!isHoodedStrangerActive) {
                hoodedStrangerCheckTimer += dt;
                // Cada 50 segundos hay un 35% de probabilidad de aparición
                if (hoodedStrangerCheckTimer >= 50.0) {
                    hoodedStrangerCheckTimer = 0;
                    if (Math.random() < 0.35) {
                        isHoodedStrangerActive = true;
                        hoodedStrangerLifeTimer = 8.5;
                        hoodedStrangerGroup.visible = true;
                        hoodedStrangerGroup.position.set(-0.8, -4.5 + 0.08, -21.0 + 0.6);
                        hoodedStrangerGroup.lookAt(0.8, 1.45, -3.0);

                        // Tirar piedrita a la ventana con sonido cristalino
                        if (typeof window.playPebbleTapSound === 'function') {
                            window.playPebbleTapSound();
                        }
                        if (window.RoomInteractions && typeof window.RoomInteractions.showNotificationPrompt === 'function') {
                            window.RoomInteractions.showNotificationPrompt(tFn("prompt_pebble_notification", "[ *Clink*... Alguien arrojó una pequeña piedra a tu ventana ]"));
                        }
                        const audioCaption = document.getElementById('audio-caption');
                        if (audioCaption) {
                            audioCaption.innerText = tFn("audio_caption_pebble", "[ *Clink*... Un golpe suave en el cristal. Alguien te observa fijamente desde la vereda. ]");
                            audioCaption.style.color = "#ffd700";
                            audioCaption.classList.remove('hidden');
                            setTimeout(() => { if (audioCaption) audioCaption.classList.add('hidden'); }, 4000);
                        }
                    }
                }
            } else {
                hoodedStrangerLifeTimer -= dt;
                const stareBreath = Math.sin(flickerTimer * 1.5) * 0.015;
                hoodedStrangerGroup.position.y = (-4.5 + 0.08) + stareBreath;

                if (hoodedStrangerLifeTimer <= 0) {
                    hoodedStrangerGroup.visible = false;
                    isHoodedStrangerActive = false;
                    hoodedStrangerCheckTimer = 0;
                }
            }
        }

        // 13. Animación de Fauna (Conejos en el Césped y Jardines)
        outdoorRabbits.forEach(r => {
            // Movimiento de orejas y olfateo
            r.earWiggleTimer += dt * 3.2;
            const earSway = Math.sin(r.earWiggleTimer) * 0.08;
            r.earL.rotation.z = -0.2 + earSway;
            r.earR.rotation.z = -0.2 - earSway;

            if (r.isHopping) {
                r.hopTimer += dt;
                const prog = Math.min(r.hopTimer / r.hopDuration, 1.0);
                // Curva parabólica de salto
                const hopArc = Math.sin(prog * Math.PI) * r.hopHeight;
                r.group.position.y = -4.5 + hopArc;
                r.group.position.x = r.currentX + (r.targetX - r.currentX) * prog;
                r.group.position.z = r.currentZ + (r.targetZ - r.currentZ) * prog;

                if (prog >= 1.0) {
                    r.isHopping = false;
                    r.hopTimer = 0;
                    r.currentX = r.targetX;
                    r.currentZ = r.targetZ;
                    r.group.position.y = -4.5;
                    r.pauseTimer = 1.2 + Math.random() * 2.8;
                }
            } else {
                r.pauseTimer -= dt;
                if (r.pauseTimer <= 0) {
                    // Elegir nuevo punto cercano para saltar dentro de su territorio
                    r.targetX = r.originX + (Math.random() - 0.5) * 3.2;
                    r.targetZ = r.originZ + (Math.random() - 0.5) * 2.4;
                    r.isHopping = true;
                    r.hopTimer = 0;
                    // Girar hacia la dirección del salto
                    const dx = r.targetX - r.currentX;
                    const dz = r.targetZ - r.currentZ;
                    r.group.rotation.y = Math.atan2(-dz, dx);
                }
            }
        });

        // 14. Animación de Gatos en Porches y Jardines
        outdoorCats.forEach(cat => {
            // Mover la cola suavemente
            const tailWag = Math.sin(windTimer * 2.2) * 0.25;
            cat.tail.rotation.z = tailWag;
            // Pequeños giros de cabeza ocasionales
            const headTurn = Math.sin(windTimer * 0.8) * 0.15;
            cat.head.rotation.y = headTurn;
        });

        // 15. Animación de Aves en el Césped (Picoteo y saltitos)
        outdoorGroundBirds.forEach(bird => {
            bird.peckTimer -= dt;
            if (bird.peckTimer <= 0) {
                // Picoteo hacia abajo
                bird.head.rotation.x = 0.45;
                if (bird.peckTimer <= -0.25) {
                    bird.head.rotation.x = 0.0;
                    bird.peckTimer = 1.0 + Math.random() * 2.5;

                    // 40% de probabilidad de dar un saltito a una nueva posición
                    if (Math.random() < 0.4) {
                        bird.currentX = bird.originX + (Math.random() - 0.5) * 1.5;
                        bird.currentZ = bird.originZ + (Math.random() - 0.5) * 1.2;
                        bird.group.position.x = bird.currentX;
                        bird.group.position.z = bird.currentZ;
                        bird.group.rotation.y = Math.random() * Math.PI * 2;
                    }
                }
            }
        });

        // 16. Pasto 3D Swaying por el Viento
        outdoorGrassTufts.forEach(g => {
            const sway = Math.sin(windTimer * g.speed) * 0.12;
            g.group.rotation.z = sway;
        });
    }

    function updateWeather(dt) {
        if (isIntroCinematic) {
            currentWeatherState = 'storm';
            if (window.state) window.state.weatherState = 'storm';
            weatherTimer = 0;
            weatherCycleDuration = 9999;
        } else {
            weatherTimer += dt;
            if (weatherTimer > weatherCycleDuration) {
                weatherTimer = 0;
                // Transición natural de clima (despejado la mayor parte del tiempo, lluvia de vez en cuando)
                if (currentWeatherState === 'clear') {
                    if (Math.random() < 0.25) {
                        currentWeatherState = 'rain';
                        weatherCycleDuration = 45 + Math.random() * 30; // 45-75s de lluvia
                    } else {
                        weatherCycleDuration = 120 + Math.random() * 120; // 120-240s despejado (2-4 min)
                    }
                } else if (currentWeatherState === 'rain') {
                    const roll = Math.random();
                    if (roll < 0.25) {
                        currentWeatherState = 'storm';
                        weatherCycleDuration = 30 + Math.random() * 20; // 30-50s tormenta
                    } else {
                        currentWeatherState = 'clear'; // Para de llover
                        weatherCycleDuration = 150 + Math.random() * 90; // 150-240s despejado
                    }
                } else if (currentWeatherState === 'storm') {
                    currentWeatherState = Math.random() < 0.40 ? 'rain' : 'clear';
                    weatherCycleDuration = 90 + Math.random() * 60; // vuelta a despejado
                }
                if (window.state) window.state.weatherState = currentWeatherState;
            }

            // Sincronización si state.weatherState fue modificado externamente
            if (window.state && window.state.weatherState && window.state.weatherState !== currentWeatherState) {
                currentWeatherState = window.state.weatherState;
            }
        }

        // Transición de opacidad de la lluvia
        const targetOpacity = currentWeatherState === 'storm' ? 1.0 : (currentWeatherState === 'rain' ? 0.75 : 0.0);
        if (isIntroCinematic) {
            rainOpacity = 1.0;
        } else if (rainOpacity < targetOpacity) {
            rainOpacity = Math.min(targetOpacity, rainOpacity + dt * 0.5);
        } else if (rainOpacity > targetOpacity) {
            rainOpacity = Math.max(targetOpacity, rainOpacity - dt * 0.5);
        }

        if (rainParticles) {
            const activeSeason = (typeof window.getCurrentActiveSeason === 'function') ? window.getCurrentActiveSeason() : 'default';
            const isChristmas = activeSeason === 'christmas';

            rainParticles.visible = isChristmas ? true : (rainOpacity > 0.02);
            if (rainParticles.material) {
                if (isChristmas) {
                    rainParticles.material.color.setHex(0xffffff);
                    rainParticles.material.size = 0.18;
                    rainParticles.material.opacity = Math.max(0.85, rainOpacity);
                } else {
                    rainParticles.material.color.setHex(0xbad7f2);
                    rainParticles.material.size = 0.08;
                    rainParticles.material.opacity = rainOpacity * 0.75;
                }
            }
            if (rainParticles.visible) {
                const pos = rainParticles.geometry.attributes.position.array;
                if (isChristmas) {
                    // Caída suave y ondeante de copos de nieve
                    for (let i = 0; i < pos.length; i += 3) {
                        pos[i + 1] -= dt * 3.2;
                        pos[i] += Math.sin(windTimer * 1.6 + i) * dt * 1.5;
                        if (pos[i + 1] < -4.5) {
                            pos[i + 1] = 21.0;
                            pos[i] = (Math.random() - 0.5) * 50;
                            pos[i + 2] = -2 - Math.random() * 26;
                        }
                    }
                } else {
                    const speed = currentWeatherState === 'storm' ? 22.0 : 15.0;
                    for (let i = 0; i < pos.length; i += 3) {
                        pos[i + 1] -= dt * speed;
                        pos[i] += dt * 2.2;
                        if (pos[i + 1] < -4.5) {
                            pos[i + 1] = 21.0;
                            pos[i] = (Math.random() - 0.5) * 50;
                            pos[i + 2] = -2 - Math.random() * 26;
                        }
                    }
                }
                rainParticles.geometry.attributes.position.needsUpdate = true;
            }
        }

        if (starParticles) {
            starParticles.visible = (currentWeatherState === 'clear');
        }

        // Relámpagos sólo activos durante tormenta
        if (currentWeatherState === 'storm') {
            lightningTimer += dt;
            if (lightningTimer > 8.0 && Math.random() < 0.02) {
                triggerLightningFlash();
                lightningTimer = 0;
            }
        }

        // Animación de murciélagos en Halloween: SÓLO salen de noche (de día no están) y vuelan pausados/realistas
        if (seasonalBats && seasonalBats.length > 0) {
            const isHalloween = (typeof window.getCurrentActiveSeason === 'function') && window.getCurrentActiveSeason() === 'halloween';
            const totalMins = (window.state && typeof window.state.gameTimeMinutes === 'number') ? (window.state.gameTimeMinutes % 1440) : 434;
            const hourFrac = totalMins / 60.0;
            const isNightOrTwilight = (hourFrac < 5.5 || hourFrac >= 20.0);
            const showBats = isHalloween && isNightOrTwilight;

            seasonalBats.forEach((b, idx) => {
                b.visible = showBats;
                if (showBats) {
                    const u = b.userData;
                    u.angle += dt * (u.speed || 0.32);
                    
                    const nextX = u.centerX + Math.cos(u.angle) * u.radX;
                    const nextZ = -18.0 + Math.sin(u.angle) * u.radZ; // Mantiene Z estrictamente entre -24 y -12 (afuera sobre la calle)
                    const nextY = u.baseY + Math.sin(flickerTimer * 1.5 + idx) * 0.45;

                    // Dirección de vuelo tangente suave
                    const vx = -Math.sin(u.angle) * u.radX;
                    const vz = Math.cos(u.angle) * u.radZ;
                    const heading = Math.atan2(vx, vz);

                    b.position.set(nextX, nextY, nextZ);
                    b.rotation.y = heading + Math.PI / 2;
                    b.rotation.z = Math.sin(u.angle) * 0.18; // Inclinación suave de alabeo

                    // Aleteo pausado y realista con fases de planeo
                    if (u.wingL && u.wingR) {
                        const glideCycle = Math.sin(flickerTimer * 6.5 + idx * 1.8);
                        const isFlapping = Math.sin(u.angle * 4.0 + idx) > -0.2;
                        const flap = isFlapping ? (glideCycle * 0.55) : 0.08;
                        u.wingL.rotation.z = flap;
                        u.wingR.rotation.z = -flap;
                    }
                }
            });
        }

        // Sincronización continua de audio atmosférico y sonido de lluvia procedural
        if (window.RoomInteractions && typeof window.RoomInteractions.updateWeatherAudio === 'function') {
            window.RoomInteractions.updateWeatherAudio(rainOpacity, !!(window.state && window.state.windowOpen));
        }
    }

    function triggerLightningFlash() {
        if (!lightningLight) return;
        lightningFlashActive = true;
        lightningLight.intensity = 4.5;
        if (ambientLightObj) ambientLightObj.intensity = 2.0;

        setTimeout(() => {
            if (lightningLight) lightningLight.intensity = 0.5;
            setTimeout(() => {
                if (lightningLight) lightningLight.intensity = 3.5;
                setTimeout(() => {
                    if (lightningLight) lightningLight.intensity = 0.0;
                    if (ambientLightObj) ambientLightObj.intensity = 0.65;
                    lightningFlashActive = false;
                    setTimeout(() => {
                        if (window.RoomInteractions && typeof window.RoomInteractions.playThunderSound === 'function') {
                            window.RoomInteractions.playThunderSound();
                        }
                        // En tormenta eléctrica, un rayo puede disparar el disyuntor y cortar la luz
                        if (currentWeatherState === 'storm' && window.state && !window.state.powerOutage && Math.random() < 0.32) {
                            triggerBlackout();
                        }
                    }, 1200);
                }, 80);
            }, 60);
        }, 100);
    }

    function updateTimeOfDaySync() {
        if (!window.state || typeof window.state.gameTimeMinutes !== 'number' || isNightmareActive) return;
        const totalMinutes = window.state.gameTimeMinutes % 1440;
        const hour = Math.floor(totalMinutes / 60) % 24;
        const minute = totalMinutes % 60;
        const timeFrac = hour + minute / 60;

        let skyHex = 0x5b9ee1;
        let isNight = false;
        let cloudColorHex = 0xffffff;
        let mountainColorHexFar = 0x141f30;
        let mountainColorHexMid = 0x1d2e47;

        let sunColorHex = 0xfffae0;
        let sunCoronaColorHex = 0xffe880;
        let sunGlowColorHex = 0xffd060;
        let sunVisible = false;
        let moonVisible = false;
        let sunPosX = 0, sunPosY = 30, sunScale = 1.0;

        if (timeFrac >= 5.0 && timeFrac < 7.0) {
            // AMANECER (05:00 - 07:00)
            const progress = (timeFrac - 5.0) / 2.0;
            skyHex = 0xfd7e48; // Amanecer
            cloudColorHex = 0xffd4b8;
            mountainColorHexFar = 0x4a2e38;
            mountainColorHexMid = 0x6e454f;
            sunVisible = true;
            moonVisible = false;
            sunColorHex = 0xffc070;
            sunCoronaColorHex = 0xff9944;
            sunGlowColorHex = 0xff7733;
            sunPosX = -36 + progress * 24;
            sunPosY = 4 + progress * 24;
            sunScale = 1.1;
        } else if (timeFrac >= 7.0 && timeFrac < 18.0) {
            // DÍA PLENO (07:00 - 18:00)
            const progress = (timeFrac - 7.0) / 11.0;
            skyHex = 0x5b9ee1; // Día azul retro
            cloudColorHex = 0xffffff;
            mountainColorHexFar = 0x2d4869;
            mountainColorHexMid = 0x426894;
            sunVisible = true;
            moonVisible = false;
            sunColorHex = 0xfffae0;
            sunCoronaColorHex = 0xffe880;
            sunGlowColorHex = 0xffcc40;
            sunPosX = -12 + progress * 28;
            sunPosY = 28 + Math.sin(progress * Math.PI) * 6;
            sunScale = 1.0;
        } else if (timeFrac >= 18.0 && timeFrac < 21.0) {
            // ATARDECER / PUESTA DE SOL (18:00 - 21:00)
            const progress = (timeFrac - 18.0) / 3.0;
            skyHex = 0xff4b6e; // Carmesí / púrpura atardecer
            cloudColorHex = 0xffa0b8;
            mountainColorHexFar = 0x3e1f38;
            mountainColorHexMid = 0x613256;
            sunVisible = true;
            moonVisible = progress > 0.65;
            // Sol del atardecer: rojo / naranja intenso ardiente, corona expandida
            sunColorHex = 0xff4411; // Naranja-rojo intenso
            sunCoronaColorHex = 0xff2200; // Carmesí profundo
            sunGlowColorHex = 0xff5533; // Resplandor cálido
            sunPosX = 16 + progress * 26;
            sunPosY = 26 - progress * 23; // Desciende hacia el horizonte
            sunScale = 1.35 + progress * 0.35; // Se ve más grande en el horizonte
        } else {
            // NOCHE (21:00 - 05:00)
            skyHex = 0x141e30; // Noche
            isNight = true;
            cloudColorHex = 0x22304d;
            mountainColorHexFar = 0x1c2b42;
            mountainColorHexMid = 0x273b5a;
            sunVisible = false;
            moonVisible = true;
        }

        // Actualizar Sol 3D Dinámico (Posicionado detrás de las montañas en z = -72.0)
        if (sunGroup) {
            sunGroup.visible = sunVisible;
            if (sunVisible) {
                sunGroup.position.set(sunPosX * 1.35, sunPosY * 1.15, -72.0);
                sunGroup.scale.set(sunScale, sunScale, 1.0);
                if (sunMesh && sunMesh.material) sunMesh.material.color.setHex(sunColorHex);
                if (sunCoronaMesh && sunCoronaMesh.material) sunCoronaMesh.material.color.setHex(sunCoronaColorHex);
                if (sunGlowMesh && sunGlowMesh.material) {
                    sunGlowMesh.material.color.setHex(sunGlowColorHex);
                    sunGlowMesh.material.opacity = (timeFrac >= 18.0 && timeFrac < 21.0) ? 0.45 : 0.25;
                }
            }
        }

        // Actualizar Luna 3D (Posicionada detrás de las montañas en z = -72.0)
        if (moonGroup) {
            moonGroup.visible = moonVisible;
            if (moonVisible) {
                moonGroup.position.set(24, 24, -72.0);
            }
        }

        skyColorCurrent.setHex(skyHex);
        if (skyPlaneMesh && skyPlaneMesh.material) skyPlaneMesh.material.color.copy(skyColorCurrent);
        // Sincronizar SIEMPRE el fondo infinito de Three.js con el color del cielo
        // para que no se vean bordes rectangulares negros del sky plane
        if (scene) scene.background = skyColorCurrent;

        // Actualizar color y silueta de montañas con profundidad atmosférica
        mountainMeshes.forEach(m => {
            if (m.mesh && m.mesh.material) {
                m.mesh.material.color.setHex(m.layer === 2 ? mountainColorHexFar : mountainColorHexMid);
                if (m.mesh.material.emissive) {
                    m.mesh.material.emissive.setHex(isNight ? (m.layer === 2 ? 0x101a2c : 0x162338) : 0x000000);
                }
            }
        });

        // Actualizar color de nubes
        outdoorClouds.forEach(c => {
            if (c.baseMat) c.baseMat.color.setHex(cloudColorHex);
        });

        if (starParticles && starParticles.material) {
            starParticles.material.opacity = isNight ? 0.85 : (timeFrac >= 20.0 ? 0.45 : 0.0);
        }

        // Iluminación direccional y hemisférica exterior que ilumina directamente las fachadas
        if (sunMoonLight) {
            if (isNight) {
                sunMoonLight.color.setHex(0x99bbdd);
                sunMoonLight.intensity = 0.55;
                sunMoonLight.position.set(24, 26, 15);
            } else if (timeFrac >= 18.0 && timeFrac < 21.0) {
                sunMoonLight.color.setHex(0xff8855);
                sunMoonLight.intensity = 1.4;
                sunMoonLight.position.set(sunPosX * 0.7, Math.max(8, sunPosY), 18);
            } else if (timeFrac >= 5.0 && timeFrac < 7.0) {
                sunMoonLight.color.setHex(0xffbb77);
                sunMoonLight.intensity = 1.25;
                sunMoonLight.position.set(sunPosX * 0.7, Math.max(8, sunPosY), 18);
            } else {
                sunMoonLight.color.setHex(0xfffaed);
                sunMoonLight.intensity = 1.45;
                sunMoonLight.position.set(sunPosX * 0.7, 32, 18);
            }
        }

        if (outdoorHemiLight) {
            if (isNight) {
                outdoorHemiLight.color.setHex(0x1a2638);
                outdoorHemiLight.groundColor.setHex(0x0e141f);
                outdoorHemiLight.intensity = 0.45;
            } else if (timeFrac >= 18.0 && timeFrac < 21.0) {
                outdoorHemiLight.color.setHex(0xffaa88);
                outdoorHemiLight.groundColor.setHex(0x553322);
                outdoorHemiLight.intensity = 1.05;
            } else if (timeFrac >= 5.0 && timeFrac < 7.0) {
                outdoorHemiLight.color.setHex(0xffcc99);
                outdoorHemiLight.groundColor.setHex(0x443322);
                outdoorHemiLight.intensity = 1.1;
            } else {
                outdoorHemiLight.color.setHex(0xfffaee);
                outdoorHemiLight.groundColor.setHex(0x6b8299);
                outdoorHemiLight.intensity = 1.25;
            }
        }

        outdoorStreetlights.forEach(s => { s.intensity = isNight ? 4.2 : 0.0; });
        outdoorPorchLights.forEach(p => { p.intensity = (isNight || hour >= 18) ? 1.6 : 0.0; });
        outdoorHouseWindows.forEach(w => { w.material.color.setHex(isNight ? 0xffd566 : (hour >= 18 ? 0xffbb55 : 0x444d5c)); });

        // Luciérnagas solo activas al atardecer y noche con clima despejado
        if (outdoorFireflies && outdoorFireflies.material) {
            outdoorFireflies.material.opacity = (isNight || hour >= 19) && currentWeatherState === 'clear' ? 0.85 : 0.0;
        }

        // Aves solo visibles de día y al atardecer
        outdoorBirds.forEach(b => {
            b.group.visible = !isNight && currentWeatherState !== 'storm';
        });

        // Faros y reflejos de asfalto de los coches
        outdoorCars.forEach(car => {
            if (car.beam && car.beam.material) {
                car.beam.material.opacity = isNight ? 0.16 : (rainOpacity > 0.1 || hour >= 18 ? 0.12 : 0.0);
            }
        });

        updateRetroFog();
    }

    // ========================================================
    // NIEBLA RETRO 3D PS1 — ATMÓSFERA PROFUNDA Y VOLUMÉTRICA
    // ========================================================
    function updateRetroFog() {
        if (!scene) return;
        if (isNightmareActive) {
            if (!scene.fog || !(scene.fog instanceof THREE.FogExp2)) {
                scene.fog = new THREE.FogExp2(0x000000, 0.08);
            } else {
                scene.fog.color.setHex(0x000000);
                scene.fog.density = 0.08;
            }
            return;
        }

        const totalMinutes = (window.state && typeof window.state.gameTimeMinutes === 'number') ? (window.state.gameTimeMinutes % 1440) : 480;
        const timeFrac = totalMinutes / 60;
        let fogHex = 0x5b9ee1;
        let density = 0.012;

        if (currentWeatherState === 'storm') {
            fogHex = (timeFrac >= 7.0 && timeFrac < 18.0) ? 0x485868 : 0x162234;
            density = 0.016;
        } else if (currentWeatherState === 'rain') {
            fogHex = (timeFrac >= 7.0 && timeFrac < 18.0) ? 0x5a6a7c : 0x1a2638;
            density = 0.014;
        } else if (timeFrac >= 5.0 && timeFrac < 7.0) {
            fogHex = 0xfd7e48; // Amanecer
            density = 0.014;
        } else if (timeFrac >= 7.0 && timeFrac < 18.0) {
            fogHex = 0x5b9ee1; // Día pleno retro
            density = 0.011;
        } else if (timeFrac >= 18.0 && timeFrac < 21.0) {
            fogHex = 0xff4b6e; // Atardecer carmesí
            density = 0.015;
        } else {
            fogHex = 0x141e30; // Noche noventera
            density = 0.015;
        }

        if (!scene.fog || !(scene.fog instanceof THREE.FogExp2)) {
            scene.fog = new THREE.FogExp2(fogHex, density);
        } else {
            scene.fog.color.setHex(fogHex);
            scene.fog.density = density;
        }
    }

    // ========================================================
    // ACTUALIZACIÓN DE OBJETOS INTERACTIVOS EN ANIMATE()
    // ========================================================
    function updateInteractiveObjects(dt) {
        if (bedCooldownTimer > 0) {
            bedCooldownTimer -= dt;
        }

        // 1. Boombox
        if (window.state.radioOn) {
            if (boomboxReel1) boomboxReel1.rotation.z += dt * 4.0;
            if (boomboxReel2) boomboxReel2.rotation.z += dt * 4.0;
            boomboxLeds.forEach((led, i) => {
                led.material.opacity = Math.sin(flickerTimer * 12 + i) > 0.1 ? 1.0 : 0.2;
            });
        }

        // 2. Ventana
        if (windowSashLeft && windowSashRight) {
            const targetRot = window.state.windowOpen ? 1.3 : 0.0;
            windowSashLeft.rotation.y = THREE.MathUtils.lerp(windowSashLeft.rotation.y, targetRot, dt * 4.0);
            windowSashRight.rotation.y = THREE.MathUtils.lerp(windowSashRight.rotation.y, -targetRot, dt * 4.0);
        }
        if (curtainLeft && curtainRight) {
            const sway = Math.sin(flickerTimer * (window.state.windowOpen ? 4.0 : 1.5)) * (window.state.windowOpen ? 0.08 : 0.02);
            curtainLeft.rotation.z = sway;
            curtainRight.rotation.z = -sway;
        }

        // 3. Puerta y Pasillo
        if (doorPivot) {
            if (window.state && window.state.doorBroken) {
                doorPivot.rotation.x = THREE.MathUtils.lerp(doorPivot.rotation.x, -Math.PI / 2, dt * 8.0);
            } else {
                const targetDoorRot = window.state.doorOpen ? 1.5 : 0.0;
                doorPivot.rotation.y = THREE.MathUtils.lerp(doorPivot.rotation.y, targetDoorRot, dt * 3.5);
                doorPivot.rotation.x = THREE.MathUtils.lerp(doorPivot.rotation.x, 0.0, dt * 4.0);
            }
        }
        if (bathDoorPivot) {
            const targetBathRot = bathDoorOpen ? (Math.PI / 2) : 0.0;
            bathDoorPivot.rotation.y = THREE.MathUtils.lerp(bathDoorPivot.rotation.y, targetBathRot, dt * 4.5);
        }
        if (basementDoorPivot) {
            const targetBasementRot = basementDoorOpen ? (-Math.PI / 2) : 0.0;
            basementDoorPivot.rotation.y = THREE.MathUtils.lerp(basementDoorPivot.rotation.y, targetBasementRot, dt * 4.0);
        }
        if (hallwayLight) {
            hallwayLight.intensity = 0.8 + (Math.sin(flickerTimer * 5.0) > 0.95 ? -0.3 : 0.05);
        }
        if (hallwaySilhouette) {
            const isKnocking = !!(window.state && window.state.doorKnockActive);
            const silVisible = isKnocking;
            hallwaySilhouette.visible = silVisible;
            if (silVisible) {
                if (isKnocking) {
                    // Posicionada directamente frente a la puerta golpeando con furia
                    const doorKnockShake = Math.sin(flickerTimer * 22) * 0.05;
                    hallwaySilhouette.position.set(DOOR_X, 0, FRONT_WALL_Z + 1.6 + doorKnockShake);
                    hallwaySilhouette.rotation.x = 0.12 + Math.sin(flickerTimer * 14) * 0.08;
                } else {
                    hallwaySilhouette.position.set(DOOR_X, 0, FRONT_WALL_Z + 4.2);
                    // Respiración sutil: balanceo de cabeza y torso
                    const breathSway = Math.sin(flickerTimer * 2.5) * 0.02;
                    const headTilt = Math.sin(flickerTimer * 1.8 + 0.5) * 0.04;
                    hallwaySilhouette.rotation.x = breathSway;
                    hallwaySilhouette.position.y = Math.sin(flickerTimer * 2.5) * 0.015;
                    hallwaySilhouette.children.forEach(child => {
                        if (child.geometry && child.geometry.type === 'SphereGeometry') {
                            child.rotation.z = headTilt;
                        }
                    });
                }
            } else {
                hallwaySilhouette.rotation.x = 0;
                hallwaySilhouette.position.y = 0;
                hallwaySilhouette.position.set(DOOR_X, 0, FRONT_WALL_Z + 4.2);
            }
        }

        // 4. TV CRT
        updateTVScreenCanvas();

        // 5. Espejo Dinámico
        updateMirrorCanvas();

        // 6. PS1 Standby LED
        if (ps1Led) {
            ps1Led.material.color.setHex(Math.sin(flickerTimer * 3.0) > 0 ? 0x00ff88 : 0x005522);
        }

        // 7. Gato
        updateCatAnimation(dt);

        // 8. Clima
        updateWeather(dt);
        updateAtmosphere(dt);
        updateHouseLighting();
    }

    function updateAtmosphere(dt) {
        flickerTimer += dt;
        updateDustParticles(dt);
        updateSteamParticles(dt);
        updateAlarmClockTexture();
    }

    // ========================================================
    // GESTIÓN DINÁMICA DE ILUMINACIÓN DE LA CASA (PREVIENE OVERFLOW DE POINTLIGHTS EN WEBGL)
    // ========================================================
    function updateHouseLighting() {
        const isBlackout = !!(window.state && window.state.powerOutage);
        const feetY = playerPos.y - PLAYER_HEIGHT;
        const isIndoors = (playerPos.z >= -3.5 && playerPos.z <= 12.0 && Math.abs(playerPos.x) <= 7.0);

        // Ocultar luces puntuales exteriores cuando el jugador está dentro de la casa para no saturar los uniforms de WebGL
        if (isIndoors) {
            outdoorStreetlights.forEach(sl => { sl.visible = false; });
            outdoorPorchLights.forEach(pl => { pl.visible = false; });
            if (outdoorTvLight) outdoorTvLight.visible = false;
        } else {
            outdoorStreetlights.forEach(sl => { sl.visible = true; });
            outdoorPorchLights.forEach(pl => { pl.visible = true; });
            if (outdoorTvLight) outdoorTvLight.visible = true;
        }

        if (isBlackout) {
            if (ceilingLightObj) ceilingLightObj.intensity = 0.0;
            if (nightstandLight) nightstandLight.intensity = 0.0;
            if (deskLampLight) deskLampLight.intensity = 0.0;
            if (hallwayLight) hallwayLight.intensity = 0.0;
            if (upperBathLight) upperBathLight.intensity = 0.0;
            if (livingLight) livingLight.intensity = 0.0;
            if (kitchenLight) kitchenLight.intensity = 0.0;
            if (foyerLight) foyerLight.intensity = 0.0;
            if (groundBathLight) groundBathLight.intensity = 0.0;
            if (basementLight) basementLight.intensity = 0.0;
            if (basementStairLight) basementStairLight.intensity = 0.0;
            if (fairyPointLight) fairyPointLight.intensity = 0.0;
            return;
        }

        // Gestión dinámica de luces interiores por nivel para garantizar que NUNCA se superen 4 luces activas simultáneas
        if (feetY > -1.4 || (feetY > -1.85 && playerPos.z <= 6.2)) {
            // PLANTA ALTA: Dormitorio, Pasillo superior y Baño superior
            const isInHallway = (playerPos.z > 2.85);
            if (isInHallway) {
                if (ceilingLightObj) ceilingLightObj.visible = false;
                if (nightstandLight) nightstandLight.visible = false;
                if (deskLampLight) deskLampLight.visible = false;
                if (fairyPointLight) fairyPointLight.visible = false;
                if (hallwayLight) {
                    hallwayLight.visible = true;
                    hallwayLight.intensity = 1.35 + (Math.sin(flickerTimer * 4.0) > 0.95 ? -0.25 : 0.05);
                }
                if (upperBathLight) upperBathLight.visible = true;
                if (livingLight) livingLight.visible = true; // Permite ver el salón desde el descansillo de la escalera
            } else {
                if (ceilingLightObj) ceilingLightObj.visible = true;
                if (nightstandLight) nightstandLight.visible = isLampOn;
                if (deskLampLight) deskLampLight.visible = isLampOn;
                if (fairyPointLight) fairyPointLight.visible = true;
                if (hallwayLight) {
                    hallwayLight.visible = true;
                    hallwayLight.intensity = 1.35 + (Math.sin(flickerTimer * 4.0) > 0.95 ? -0.25 : 0.05);
                }
                if (upperBathLight) upperBathLight.visible = bathDoorOpen; // Mantener luz del baño si la puerta está abierta para evitar pantalla negra
                if (livingLight) livingLight.visible = false;
            }
            if (kitchenLight) kitchenLight.visible = false;
            if (foyerLight) foyerLight.visible = false;
            if (groundBathLight) groundBathLight.visible = false;
            if (basementLight) basementLight.visible = false;
            if (basementStairLight) basementStairLight.visible = false;
        } else if (feetY > -3.8) {
            // PLANTA BAJA: Living, Cocina, Foyer, Baño PB y escalera
            if (livingLight) {
                livingLight.visible = true;
                livingLight.intensity = 1.6;
            }
            if (kitchenLight) {
                kitchenLight.visible = true;
                kitchenLight.intensity = 1.7;
            }
            if (foyerLight) {
                foyerLight.visible = true;
                foyerLight.intensity = 1.4;
            }
            if (groundBathLight) groundBathLight.visible = true;
            if (hallwayLight) {
                hallwayLight.visible = true; // Se ve al mirar hacia arriba en la escalera
                hallwayLight.intensity = 1.2;
            }
            if (upperBathLight) upperBathLight.visible = false;
            if (ceilingLightObj) ceilingLightObj.visible = false;
            if (nightstandLight) nightstandLight.visible = false;
            if (deskLampLight) deskLampLight.visible = false;
            if (fairyPointLight) fairyPointLight.visible = false;
            if (basementLight) basementLight.visible = basementDoorOpen; // Visible al abrir la puerta del sótano
            if (basementStairLight) basementStairLight.visible = basementDoorOpen;
        } else {
            // SÓTANO: Foco colgante del sótano activo
            if (basementLight) {
                basementLight.visible = true;
                basementLight.intensity = 1.4;
            }
            if (basementStairLight) basementStairLight.visible = true;
            if (groundBathLight) groundBathLight.visible = false;
            if (foyerLight) foyerLight.visible = false;
            if (livingLight) livingLight.visible = false;
            if (kitchenLight) kitchenLight.visible = basementDoorOpen; // Se ve la luz de la cocina al subir la escalera
            if (hallwayLight) hallwayLight.visible = false;
            if (upperBathLight) upperBathLight.visible = false;
            if (ceilingLightObj) ceilingLightObj.visible = false;
            if (nightstandLight) nightstandLight.visible = false;
            if (deskLampLight) deskLampLight.visible = false;
            if (fairyPointLight) fairyPointLight.visible = false;
        }
    }

    // ========================================================
    // CONTROLES Y PROXIMIDAD MULTI-OBJETO
    // ========================================================
    function setupControls() {
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        const c = document.getElementById('screen-ps1-intro');
        if (c) { c.addEventListener('click', requestPointerLock); }
        document.addEventListener('pointerlockchange', onPointerLockChange);
        document.addEventListener('mousemove', onMouseMove);
    }

    function teardownControls() {
        document.removeEventListener('keydown', onKeyDown);
        document.removeEventListener('keyup', onKeyUp);
        document.removeEventListener('pointerlockchange', onPointerLockChange);
        document.removeEventListener('mousemove', onMouseMove);
        if (document.pointerLockElement) document.exitPointerLock();
    }

    function requestPointerLock() {
        if (window.RoomInteractions && typeof window.RoomInteractions.getAudioCtx === 'function') {
            window.RoomInteractions.getAudioCtx();
        }
        if (isNightmareActive) {
            const c = document.getElementById('screen-ps1-intro');
            if (c && !document.pointerLockElement) c.requestPointerLock();
            return;
        }
        if (isMonitorMode || isTransitioning || isBedTransition || isSleepingSequence || window.state.consoleMinigameActive) return;
        const c = document.getElementById('screen-ps1-intro');
        if (c && !document.pointerLockElement) c.requestPointerLock();
    }

    function onPointerLockChange() {
        const lp = document.getElementById('ps1-lock-prompt');
        if (document.pointerLockElement) { if (lp) lp.style.display = 'none'; }
        else { if (lp && isRunning && !isIntroCinematic && !isMonitorMode && !isTransitioning && (!isSleepingSequence || isNightmareActive) && !window.state.consoleMinigameActive) lp.style.display = 'block'; }
    }

    function onKeyDown(e) {
        if (!isRunning || isMonitorMode || isTransitioning || window.state.consoleMinigameActive) return;

        // Si está activa una pesadilla interactiva
        if (isNightmareActive && nightmareInteractive) {
            if (e.code === 'KeyE' && !e.repeat && !nightmareInteractTriggered) {
                triggerNightmareInteraction();
                return;
            }
            switch (e.code) {
                case 'KeyW': case 'ArrowUp': moveState.forward = true; break;
                case 'KeyS': case 'ArrowDown': moveState.backward = true; break;
                case 'KeyA': case 'ArrowLeft': moveState.left = true; break;
                case 'KeyD': case 'ArrowRight': moveState.right = true; break;
            }
            return;
        }

        if (isSleepingSequence) return;

        if (isSofaSeated) {
            if ((e.code === 'KeyE' || e.code === 'Space' || e.code === 'KeyW' || e.code === 'KeyS') && !e.repeat) {
                standUpFromSofa();
            } else if (e.code === 'KeyR' && !e.repeat && livingTvOn) {
                cycleLivingTvChannel();
            }
            return;
        }

        if (window.state.isLyingDown) {
            if ((e.code === 'KeyE' || e.code === 'Space') && bedCooldownTimer <= 0 && !isBedTransition) {
                triggerBedAction();
            }
            return;
        }

        switch (e.code) {
            case 'KeyW': case 'ArrowUp': moveState.forward = true; break;
            case 'KeyS': case 'ArrowDown': moveState.backward = true; break;
            case 'KeyA': case 'ArrowLeft': moveState.left = true; break;
            case 'KeyD': case 'ArrowRight': moveState.right = true; break;
            case 'KeyE':
                if (!e.repeat) executeObjectInteraction(focusedObject);
                break;
            case 'KeyF':
                if (!e.repeat) {
                    if (focusedObject === 'lamp') {
                        toggleRoomLamp();
                    } else {
                        toggleFlashlight();
                    }
                }
                break;
            case 'KeyL':
                if (!e.repeat && window.RoomInteractions && typeof window.RoomInteractions.toggleDoorLock === 'function') {
                    window.RoomInteractions.toggleDoorLock();
                }
                break;
            case 'KeyR':
                if (!e.repeat) {
                    if (focusedObject === 'tv') {
                        if (window.RoomInteractions) window.RoomInteractions.cycleTVChannel();
                    } else if (focusedObject === 'boombox') {
                        if (window.RoomInteractions) window.RoomInteractions.cycleRadioStation();
                    } else if (focusedObject === 'living_tv' || (livingTvOn && isSofaSeated)) {
                        cycleLivingTvChannel();
                    }
                }
                break;
        }
    }

    function onKeyUp(e) {
        if (!isRunning) return;
        switch (e.code) {
            case 'KeyW': case 'ArrowUp': moveState.forward = false; break;
            case 'KeyS': case 'ArrowDown': moveState.backward = false; break;
            case 'KeyA': case 'ArrowLeft': moveState.left = false; break;
            case 'KeyD': case 'ArrowRight': moveState.right = false; break;
        }
    }

    function onMouseMove(e) {
        if (!isRunning || isMonitorMode || isTransitioning || isBedTransition) return;

        if (isNightmareActive) {
            if (nightmareVariant === 'paralysis') {
                // Durante la parálisis de sueño, mover el cuello con esfuerzo
                yaw -= e.movementX * (MOUSE_SENS * 0.65);
                yaw = Math.max(-0.95, Math.min(0.95, yaw));
                pitch -= e.movementY * (MOUSE_SENS * 0.65);
                pitch = Math.max(Math.PI / 4.2, Math.min(Math.PI / 1.95, pitch));
                return;
            } else {
                // Pesadillas interactivas con movimiento libre de vista
                yaw -= e.movementX * MOUSE_SENS;
                pitch -= e.movementY * MOUSE_SENS;
                pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, pitch));
                return;
            }
        }

        if (!document.pointerLockElement) return;
        if (isSleepingSequence || window.state.isLyingDown) return;

        yaw -= e.movementX * MOUSE_SENS;
        pitch -= e.movementY * MOUSE_SENS;
        pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, pitch));
    }

    function setupInteraction() {
        const c = document.getElementById('screen-ps1-intro');
        if (c) c.addEventListener('mousedown', onInteract);
    }
    function teardownInteraction() {
        const c = document.getElementById('screen-ps1-intro');
        if (c) c.removeEventListener('mousedown', onInteract);
    }

    function onInteract(e) {
        if (!isRunning || !document.pointerLockElement || isTransitioning || isMonitorMode || e.button !== 0 || window.state.consoleMinigameActive) return;

        // Pesadilla interactiva
        if (isNightmareActive && nightmareInteractive) {
            if (!nightmareInteractTriggered) {
                triggerNightmareInteraction();
            }
            return;
        }

        if (isSleepingSequence) return;

        if (window.state.isLyingDown) {
            if (bedCooldownTimer <= 0 && !isBedTransition) {
                triggerBedAction();
            }
            return;
        }
        executeObjectInteraction(focusedObject);
    }

    function executeObjectInteraction(type) {
        if (!type) return;
        if (window.RoomInteractions && window.RoomInteractions.getAudioCtx) window.RoomInteractions.getAudioCtx();

        switch (type) {
            case 'pc':
                sitDownAtPC();
                break;
            case 'flashlight_item':
                pickupFlashlight();
                break;
            case 'breaker_box':
                toggleBreakerBox();
                break;
            case 'lamp':
                toggleRoomLamp();
                break;
            case 'boombox':
                if (window.RoomInteractions) window.RoomInteractions.toggleBoombox();
                break;
            case 'window':
                if (window.RoomInteractions) window.RoomInteractions.toggleWindow();
                break;
            case 'bed':
                if (playerPos.z <= 2.88 && Math.abs(playerPos.x) <= HALF_W + 0.1) {
                    triggerBedAction();
                }
                break;
            case 'phone':
                if (window.RoomInteractions) window.RoomInteractions.interactPhone();
                break;
            case 'door':
                if (window.RoomInteractions) window.RoomInteractions.toggleDoor();
                break;
            case 'bathroom_door':
                bathDoorOpen = !bathDoorOpen;
                if (typeof playDoorSqueak === 'function') {
                    playDoorSqueak(bathDoorOpen);
                } else if (window.RoomInteractions && typeof window.RoomInteractions.playRetroClick === 'function') {
                    window.RoomInteractions.playRetroClick(0.6);
                }
                if (window.RoomInteractions && typeof window.RoomInteractions.showNotificationPrompt === 'function') {
                    window.RoomInteractions.showNotificationPrompt(
                        bathDoorOpen
                            ? tFn("room_notif_bath_door_open", "[ PUERTA DEL BAÑO — ABIERTA ]")
                            : tFn("room_notif_bath_door_closed", "[ PUERTA DEL BAÑO — CERRADA ]")
                    );
                }
                break;
            case 'living_tv':
                livingTvOn = !livingTvOn;
                if (livingTvLight) livingTvLight.intensity = livingTvOn ? 1.6 : 0.0;
                if (livingTvScMesh) {
                    livingTvScMesh.material.color.setHex(livingTvOn ? 0x99bbff : 0x05080c);
                }
                playTvLivingSound(livingTvChannel);
                if (window.RoomInteractions && typeof window.RoomInteractions.showNotificationPrompt === 'function') {
                    window.RoomInteractions.showNotificationPrompt(
                        livingTvOn
                            ? tFn("prompt_tv_living_off", "[ CLICK / E: APAGAR TV DEL LIVING | R: CAMBIAR CANAL 📺 ]")
                            : tFn("prompt_tv_living_on", "[ CLICK / E: PRENDER TV DEL LIVING 📺 ]")
                    );
                }
                break;
            case 'fridge':
                fridgeOpen = !fridgeOpen;
                if (fridgeLight) fridgeLight.intensity = fridgeOpen ? 1.7 : 0.0;
                playFridgeSound(fridgeOpen);
                if (window.RoomInteractions && typeof window.RoomInteractions.showNotificationPrompt === 'function') {
                    window.RoomInteractions.showNotificationPrompt(
                        fridgeOpen
                            ? tFn("room_notif_fridge_drink", "[ ¡TOMASTE UNA SODA HELADA! Energía restaurada 🥤✨ ]")
                            : tFn("prompt_fridge_open", "[ CLICK / E: ABRIR REFRIGERADOR 🥤 ]")
                    );
                }
                break;
            case 'kitchen_sink':
                kitchenFaucetOn = !kitchenFaucetOn;
                if (sinkWaterMesh) sinkWaterMesh.visible = kitchenFaucetOn;
                playFaucetSound(kitchenFaucetOn);
                if (window.RoomInteractions && typeof window.RoomInteractions.showNotificationPrompt === 'function') {
                    window.RoomInteractions.showNotificationPrompt(
                        kitchenFaucetOn
                            ? tFn("prompt_sink_off", "[ CLICK / E: CERRAR CANILLA DE COCINA 🚰 ]")
                            : tFn("prompt_sink_on", "[ CLICK / E: ABRIR CANILLA DE COCINA 🚰 ]")
                    );
                }
                break;
            case 'living_sofa':
                isSofaSeated = !isSofaSeated;
                if (isSofaSeated) {
                    sofaPreSitPos = playerPos.clone();
                    playerPos.set(3.5, GY + 1.05, 5.5);
                    if (window.RoomInteractions && typeof window.RoomInteractions.playRetroClick === 'function') {
                        window.RoomInteractions.playRetroClick(0.4);
                    }
                    if (window.RoomInteractions && typeof window.RoomInteractions.showNotificationPrompt === 'function') {
                        window.RoomInteractions.showNotificationPrompt(tFn("prompt_sofa_rise", "[ DESCANSANDO EN EL SOFÁ — PRESIONA E O ESPACIO PARA LEVANTARTE 🛋️ ]"));
                    }
                } else {
                    if (sofaPreSitPos) playerPos.copy(sofaPreSitPos);
                    else playerPos.set(3.5, GY + PLAYER_HEIGHT, 6.8);
                }
                break;
            case 'front_door':
                frontDoorOpen = !frontDoorOpen;
                playHeavyDoor(frontDoorOpen);
                if (window.RoomInteractions && typeof window.RoomInteractions.showNotificationPrompt === 'function') {
                    window.RoomInteractions.showNotificationPrompt(
                        frontDoorOpen
                            ? tFn("prompt_front_door_close", "[ CLICK / E: CERRAR PUERTA AL PORCHE 🚪 ]")
                            : tFn("prompt_front_door_open", "[ CLICK / E: ABRIR PUERTA AL PORCHE 🚪 ]")
                    );
                }
                break;
            case 'basement_door':
                basementDoorOpen = !basementDoorOpen;
                if (typeof playDoorSqueak === 'function') {
                    playDoorSqueak(basementDoorOpen);
                } else if (typeof playHeavyDoor === 'function') {
                    playHeavyDoor(basementDoorOpen);
                }
                if (window.RoomInteractions && typeof window.RoomInteractions.showNotificationPrompt === 'function') {
                    window.RoomInteractions.showNotificationPrompt(
                        basementDoorOpen
                            ? tFn("room_notif_basement_door_open", "[ PUERTA DEL SÓTANO — ABIERTA ]")
                            : tFn("room_notif_basement_door_closed", "[ PUERTA DEL SÓTANO — CERRADA ]")
                    );
                }
                break;
            case 'basement_radio':
                basementRadioOn = !basementRadioOn;
                playBasementRadioSound(basementRadioOn);
                if (window.RoomInteractions && typeof window.RoomInteractions.showNotificationPrompt === 'function') {
                    window.RoomInteractions.showNotificationPrompt(
                        basementRadioOn
                            ? tFn("prompt_basement_radio_off", "[ CLICK / E: APAGAR RADIO DE ONDA CORTA 📻 ]")
                            : tFn("prompt_basement_radio_on", "[ CLICK / E: ENCENDER RADIO DE ONDA CORTA 📻 ]")
                    );
                }
                break;
            case 'basement_boiler':
                if (window.RoomInteractions && typeof window.RoomInteractions.playRetroClick === 'function') {
                    window.RoomInteractions.playRetroClick(0.5);
                }
                if (window.RoomInteractions && typeof window.RoomInteractions.showNotificationPrompt === 'function') {
                    window.RoomInteractions.showNotificationPrompt(
                        tFn("room_notif_boiler_inspect", "[ 🔥 CALDERA CENTRAL: Quemador a gas encendido. Presión: 1.8 bar. Calefacción funcionando correctamente ]")
                    );
                }
                break;
            case 'tv':
                if (window.RoomInteractions) window.RoomInteractions.toggleTV();
                break;
            case 'ps1':
                if (window.RoomInteractions) window.RoomInteractions.playPS1ConsoleMinigame();
                break;
            case 'cat':
                if (window.RoomInteractions) window.RoomInteractions.petCat();
                break;
            case 'xmas_gift':
                if (window.RoomInteractions && (typeof window.getCurrentActiveSeason === 'function') && window.getCurrentActiveSeason() === 'christmas') {
                    window.RoomInteractions.interactXmasGifts();
                }
                break;
            case 'xmas_cocoa':
                if (window.RoomInteractions && (typeof window.getCurrentActiveSeason === 'function') && window.getCurrentActiveSeason() === 'christmas') {
                    window.RoomInteractions.interactHotCocoa();
                }
                break;
            case 'halloween_candy':
                if (window.RoomInteractions && (typeof window.getCurrentActiveSeason === 'function') && window.getCurrentActiveSeason() === 'halloween') {
                    window.RoomInteractions.interactHalloweenCandy();
                }
                break;
            case 'halloween_skull':
                if (window.RoomInteractions && (typeof window.getCurrentActiveSeason === 'function') && window.getCurrentActiveSeason() === 'halloween') {
                    window.RoomInteractions.interactHalloweenSkull();
                }
                break;
            case 'xmas_cookies':
                if (window.RoomInteractions && (typeof window.getCurrentActiveSeason === 'function') && window.getCurrentActiveSeason() === 'christmas') {
                    window.RoomInteractions.interactXmasCookies();
                }
                break;
            case 'xmas_wreath':
                if (window.RoomInteractions && (typeof window.getCurrentActiveSeason === 'function') && window.getCurrentActiveSeason() === 'christmas') {
                    window.RoomInteractions.interactXmasWreath();
                }
                break;
            case 'halloween_potion':
                if (window.RoomInteractions && (typeof window.getCurrentActiveSeason === 'function') && window.getCurrentActiveSeason() === 'halloween') {
                    window.RoomInteractions.interactHalloweenPotion();
                }
                break;
            case 'halloween_wreath':
                if (window.RoomInteractions && (typeof window.getCurrentActiveSeason === 'function') && window.getCurrentActiveSeason() === 'halloween') {
                    window.RoomInteractions.interactHalloweenWreath();
                }
                break;
        }
    }

    function playHeavyDoor(isOpen) {
        try {
            const ctx = (window.RoomInteractions && typeof window.RoomInteractions.getAudioCtx === 'function') ? window.RoomInteractions.getAudioCtx() : introAudioCtx;
            if (!ctx) return;
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(isOpen ? 130 : 95, now);
            osc.frequency.exponentialRampToValueAtTime(30, now + 0.18);
            g.gain.setValueAtTime(0.35, now);
            g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
            osc.connect(g); g.connect(ctx.destination);
            osc.start(now); osc.stop(now + 0.25);
        } catch(e) {}
    }

    function playFridgeSound(isOpen) {
        try {
            const ctx = (window.RoomInteractions && typeof window.RoomInteractions.getAudioCtx === 'function') ? window.RoomInteractions.getAudioCtx() : introAudioCtx;
            if (!ctx) return;
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(isOpen ? 80 : 160, now);
            osc.frequency.linearRampToValueAtTime(isOpen ? 220 : 60, now + 0.12);
            g.gain.setValueAtTime(0.25, now);
            g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            osc.connect(g); g.connect(ctx.destination);
            osc.start(now); osc.stop(now + 0.16);
        } catch(e) {}
    }

    function playFaucetSound(turnOn) {
        try {
            const ctx = (window.RoomInteractions && typeof window.RoomInteractions.getAudioCtx === 'function') ? window.RoomInteractions.getAudioCtx() : introAudioCtx;
            if (!ctx) return;
            if (faucetAudioNode) {
                try { faucetAudioNode.gain.setValueAtTime(0.0001, ctx.currentTime); } catch(e) {}
                faucetAudioNode = null;
            }
            if (!turnOn) return;
            const bs = ctx.sampleRate * 1.5;
            const buf = ctx.createBuffer(1, bs, ctx.sampleRate);
            const d = buf.getChannelData(0);
            for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * 0.12;
            const src = ctx.createBufferSource();
            src.buffer = buf;
            src.loop = true;
            const f = ctx.createBiquadFilter();
            f.type = 'bandpass'; f.frequency.value = 1200; f.Q.value = 2.0;
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.18, ctx.currentTime);
            src.connect(f); f.connect(g); g.connect(ctx.destination);
            src.start();
            faucetAudioNode = g;
        } catch(e) {}
    }

    function playTvLivingSound(ch) {
        try {
            const ctx = (window.RoomInteractions && typeof window.RoomInteractions.getAudioCtx === 'function') ? window.RoomInteractions.getAudioCtx() : introAudioCtx;
            if (!ctx) return;
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(440 + ch * 120, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
            g.gain.setValueAtTime(0.15, now);
            g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
            osc.connect(g); g.connect(ctx.destination);
            osc.start(now); osc.stop(now + 0.1);
        } catch(e) {}
    }

    function playBasementRadioSound(isOn) {
        try {
            const ctx = (window.RoomInteractions && typeof window.RoomInteractions.getAudioCtx === 'function') ? window.RoomInteractions.getAudioCtx() : introAudioCtx;
            if (!ctx) return;
            if (basementRadioAudioNode) {
                try { basementRadioAudioNode.stop(); } catch(e) {}
                basementRadioAudioNode = null;
            }
            if (!isOn) return;
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(580, now);
            g.gain.setValueAtTime(0.08, now);
            osc.connect(g); g.connect(ctx.destination);
            osc.start(now);
            basementRadioAudioNode = osc;
        } catch(e) {}
    }

    function cycleLivingTvChannel() {
        if (!livingTvOn) return;
        const tvColors = [0x99bbff, 0x88ff99, 0xff99aa, 0xffea77, 0x55eeff];
        livingTvChannel = (livingTvChannel + 1) % tvColors.length;
        if (livingTvScMesh) livingTvScMesh.material.color.setHex(tvColors[livingTvChannel]);
        if (livingTvLight) livingTvLight.color.setHex(tvColors[livingTvChannel]);
        playTvLivingSound(livingTvChannel);
        const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;
        if (window.RoomInteractions && typeof window.RoomInteractions.showNotificationPrompt === 'function') {
            window.RoomInteractions.showNotificationPrompt(
                tFn("room_notif_tv_channel", "[ CANAL TV: CANAL {ch} ]").replace('{ch}', livingTvChannel + 1)
            );
        }
    }

    function standUpFromSofa() {
        if (!isSofaSeated) return;
        isSofaSeated = false;
        if (sofaPreSitPos) playerPos.copy(sofaPreSitPos);
        else playerPos.set(3.5, -2.8 + PLAYER_HEIGHT, 6.8);
        if (window.RoomInteractions && typeof window.RoomInteractions.playRetroClick === 'function') {
            window.RoomInteractions.playRetroClick(0.4);
        }
        const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;
        if (window.RoomInteractions && typeof window.RoomInteractions.showNotificationPrompt === 'function') {
            window.RoomInteractions.showNotificationPrompt(tFn("prompt_sofa_sit", "[ CLICK / E: DESCANSAR EN EL SOFÁ 🛋️ ]"));
        }
    }

    // ========================================================
    // NIEBLA RETRO 3D PS1 — ATMÓSFERA PROFUNDA Y VOLUMÉTRICA
    // ========================================================
    function updateRetroFog() {
        if (!scene) return;
        if (isNightmareActive) {
            const fogColor = (nightmareVariant === 'corridor_door') ? 0x0a0306 : (nightmareVariant === 'void_pc' ? 0x020408 : 0x06060c);
            const fogDensity = (nightmareVariant === 'corridor_door') ? 0.032 : 0.045;
            if (!scene.fog || !(scene.fog instanceof THREE.FogExp2)) {
                scene.fog = new THREE.FogExp2(fogColor, fogDensity);
            } else {
                scene.fog.color.setHex(fogColor);
                scene.fog.density = fogDensity;
            }
            return;
        }

        const totalMinutes = (window.state && typeof window.state.gameTimeMinutes === 'number') ? (window.state.gameTimeMinutes % 1440) : 480;
        const timeFrac = totalMinutes / 60;
        let fogHex = 0x5b9ee1;
        let density = 0.012;

        if (currentWeatherState === 'storm') {
            fogHex = (timeFrac >= 7.0 && timeFrac < 18.0) ? 0x485868 : 0x162234;
            density = 0.016;
        } else if (currentWeatherState === 'rain') {
            fogHex = (timeFrac >= 7.0 && timeFrac < 18.0) ? 0x5a6a7c : 0x1a2638;
            density = 0.014;
        } else if (timeFrac >= 5.0 && timeFrac < 7.0) {
            fogHex = 0xfd7e48; // Amanecer
            density = 0.014;
        } else if (timeFrac >= 7.0 && timeFrac < 18.0) {
            fogHex = 0x5b9ee1; // Día pleno retro
            density = 0.011;
        } else if (timeFrac >= 18.0 && timeFrac < 21.0) {
            fogHex = 0xff4b6e; // Atardecer carmesí
            density = 0.015;
        } else {
            fogHex = 0x141e30; // Noche noventera
            density = 0.015;
        }

        if (!scene.fog || !(scene.fog instanceof THREE.FogExp2)) {
            scene.fog = new THREE.FogExp2(fogHex, density);
        } else {
            scene.fog.color.setHex(fogHex);
            scene.fog.density = density;
        }
    }

    function createDarkEntityModel() {
        const group = new THREE.Group();
        const mat = new THREE.MeshBasicMaterial({ color: 0x010102 });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0022 });

        // Torso encorvado y macilento
        const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 1.3, 6), mat);
        spine.position.y = 1.05;
        spine.rotation.x = 0.28;
        group.add(spine);

        // Costillas expuestas
        for (let i = 0; i < 4; i++) {
            const rib = new THREE.Mesh(new THREE.TorusGeometry(0.20 - i * 0.02, 0.025, 4, 8, Math.PI), mat);
            rib.position.set(0, 1.25 - i * 0.16, 0.06);
            rib.rotation.x = Math.PI / 2 + 0.28;
            group.add(rib);
        }

        // Cabeza alargada y grotesca
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.72, 0.22);

        const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.18, 7, 7), mat);
        cranium.scale.set(0.9, 1.35, 1.1);
        headGroup.add(cranium);

        // Mandíbula desencajada
        const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.22, 0.18), mat);
        jaw.position.set(0, -0.16, 0.06);
        headGroup.add(jaw);

        // Ojos carmesí brillantes penetrantes
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.038, 5, 5), eyeMat);
        eyeL.position.set(-0.07, 0.06, 0.16);
        headGroup.add(eyeL);

        const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.038, 5, 5), eyeMat);
        eyeR.position.set(0.07, 0.06, 0.16);
        headGroup.add(eyeR);

        // Luz puntual tenue emitida por los ojos
        const eyeLight = new THREE.PointLight(0xff0022, 1.5, 3.0);
        eyeLight.position.set(0, 0.06, 0.22);
        headGroup.add(eyeLight);

        group.add(headGroup);

        // Brazos largos desproporcionados con garras afiladas
        const arms = [];
        [-1, 1].forEach(side => {
            const arm = new THREE.Group();
            arm.position.set(side * 0.26, 1.45, 0.08);

            const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.7, 4), mat);
            upperArm.position.y = -0.35;
            arm.add(upperArm);

            const foreArm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.8, 4), mat);
            foreArm.position.set(0, -0.95, 0.12);
            foreArm.rotation.x = -0.35;
            arm.add(foreArm);

            // Garras
            for (let f = -2; f <= 2; f++) {
                const claw = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.18, 3), mat);
                claw.position.set(f * 0.025, -1.40, 0.26);
                claw.rotation.x = Math.PI - 0.2;
                arm.add(claw);
            }

            group.add(arm);
            arms.push(arm);
        });

        // Piernas huesudas
        [-1, 1].forEach(side => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.03, 1.1, 4), mat);
            leg.position.set(side * 0.16, 0.55, -0.05);
            group.add(leg);
        });

        return {
            group,
            headGroup,
            jaw,
            eyeLeft: eyeL,
            eyeRight: eyeR,
            eyeLight,
            arms
        };
    }

    // Control de visibilidad e iluminación para pesadillas
    function setNightmareSceneState(active, variant) {
        if (active) {
            if (variant === 'void_pc' || variant === 'corridor_door') {
                if (bedroomGroup) bedroomGroup.visible = false;
                if (outdoorGroup) outdoorGroup.visible = false;
            } else {
                // mirror_demon y paralysis ocurren dentro del dormitorio
                if (bedroomGroup) bedroomGroup.visible = true;
                if (outdoorGroup) outdoorGroup.visible = false;
            }

            if (halloweenDecorGroup) halloweenDecorGroup.visible = false;
            if (christmasDecorGroup) christmasDecorGroup.visible = false;
            if (dustParticles) dustParticles.visible = false;
            if (rainParticles) rainParticles.visible = false;

            if (sunMoonLight) sunMoonLight.intensity = 0;
            if (outdoorHemiLight) outdoorHemiLight.intensity = 0;
            if (lightningLight) lightningLight.intensity = 0;
            if (ceilingLightObj) ceilingLightObj.intensity = 0;
            if (nightstandLight) nightstandLight.intensity = 0;
            if (deskLampLight) deskLampLight.intensity = 0;

            if (ambientLightObj) {
                if (variant === 'corridor_door') {
                    ambientLightObj.color.setHex(0x28141c);
                    ambientLightObj.intensity = 0.50;
                } else if (variant === 'void_pc') {
                    ambientLightObj.color.setHex(0x060e18);
                    ambientLightObj.intensity = 0.25;
                } else {
                    ambientLightObj.color.setHex(0x1c121e);
                    ambientLightObj.intensity = 0.35;
                }
            }

            if (scene) {
                scene.background = new THREE.Color(0x020104);
            }
            updateRetroFog();
        } else {
            if (bedroomGroup) bedroomGroup.visible = true;
            if (outdoorGroup) outdoorGroup.visible = true;
            const season = (typeof window.getCurrentActiveSeason === 'function') ? window.getCurrentActiveSeason() : 'default';
            if (halloweenDecorGroup) halloweenDecorGroup.visible = (season === 'halloween');
            if (christmasDecorGroup) christmasDecorGroup.visible = (season === 'christmas');
            if (dustParticles) dustParticles.visible = true;
            if (rainParticles && currentWeatherState !== 'clear') rainParticles.visible = true;

            updateTimeOfDaySync();
            updateRetroFog();
        }
    }

    function cleanupNightmareObjects() {
        if (nightmareGroup && scene) {
            scene.remove(nightmareGroup);
            nightmareGroup = null;
        }
        if (nightmarePropsGroup && scene) {
            scene.remove(nightmarePropsGroup);
            nightmarePropsGroup = null;
        }
        if (nightmareLightObj && scene) {
            scene.remove(nightmareLightObj);
            nightmareLightObj = null;
        }
        nightmareInteractive = false;
        nightmareInteractTriggered = false;
        isNightmareActive = false;
        if (window.state) window.state.isNightmareActive = false;
        setNightmareSceneState(false);
    }

    function updateNightmareInteractionPrompt() {
        if (!isNightmareActive || !nightmareInteractive || nightmareInteractTriggered) return;
        const prompt = document.getElementById('ps1-interact-prompt');
        if (!prompt) return;

        if (nightmareVariant === 'void_pc') {
            const dist = Math.hypot(playerPos.x - 0, playerPos.z - (-6.5));
            if (dist <= 2.5) {
                prompt.innerText = tFn("nightmare_void_pc_interact", "[ ⚡ CLICK / E PARA INTERACTUAR CON LA COMPUTADORA ]");
            } else {
                prompt.innerText = tFn("nightmare_void_pc_walk", "[ 💻 PESADILLA: UNA PC BRILLA SOLA EN LA OSCURIDAD... ACÉRCATE ]");
            }
            prompt.classList.add('visible');
        } else if (nightmareVariant === 'corridor_door') {
            if (playerPos.z <= -6.0) {
                prompt.innerText = tFn("nightmare_corridor_interact", "[ 🔒 LA PUERTA ESTÁ TRABADA... ¡ALGO CORRE HACIA TI! ]");
            } else {
                prompt.innerText = tFn("nightmare_corridor_walk", "[ 🚪 PESADILLA: ALGO ACECHA DETRÁS... ALCANZA LA PUERTA AL FINAL ]");
            }
            prompt.classList.add('visible');
        } else if (nightmareVariant === 'mirror_demon') {
            const dist = Math.hypot(playerPos.x - (-HALF_W + 0.1), playerPos.z - 0);
            if (dist <= 2.4) {
                prompt.innerText = tFn("nightmare_mirror_walk", "[ 🪞 PESADILLA: TU REFLEJO NO TE OBEDECE... TOCA EL ESPEJO ]");
            }
            prompt.classList.add('visible');
        }
    }

    function triggerNightmareInteraction() {
        if (!isNightmareActive || !nightmareInteractive || nightmareInteractTriggered) return;

        if (nightmareVariant === 'void_pc') {
            const dist = Math.hypot(playerPos.x - 0, playerPos.z - (-6.5));
            if (dist > 2.5) return; // Solo interactuar si está verdaderamente cerca
            nightmareInteractTriggered = true;

            const prompt = document.getElementById('ps1-interact-prompt');
            if (prompt) prompt.classList.remove('visible');

            // 1. Apagón inmediato de la PC en el cuarto oscuro
            if (nightmareLightObj) nightmareLightObj.intensity = 0.0;
            if (window.RoomInteractions && typeof window.RoomInteractions.playRetroClick === 'function') {
                window.RoomInteractions.playRetroClick(0.65);
            } else if (typeof playClickSound === 'function') {
                playClickSound();
            }

            // 2. Giro forzado instantáneo de 180° hacia atrás
            yaw += Math.PI;
            pitch = 0.05;

            // 3. La Entidad Oscura aparece inmediatamente frente al rostro del jugador
            const entity = createDarkEntityModel();
            nightmareGroup = entity.group;
            nightmareGroup.position.set(playerPos.x, 0, playerPos.z + 1.25);
            nightmareGroup.rotation.y = 0;
            scene.add(nightmareGroup);

            entity.jaw.rotation.x = 0.75;
            entity.jaw.position.y = -0.22;
            entity.eyeLeft.scale.set(2.2, 2.2, 2.2);
            entity.eyeRight.scale.set(2.2, 2.2, 2.2);
            entity.eyeLight.intensity = 4.5;
            entity.arms.forEach(a => { a.rotation.x = -1.1; });

            if (window.RoomInteractions) {
                window.RoomInteractions.playNightmareScreech();
            }

            // Abalanzarse hacia la cámara en 0.22 segundos
            let lungeT = 0;
            const startZ = nightmareGroup.position.z;
            const targetZ = playerPos.z + 0.15;
            const startY = nightmareGroup.position.y;
            const targetY = 0.45;

            const lungeInterval = setInterval(() => {
                lungeT += 0.15;
                if (lungeT >= 1.0) {
                    clearInterval(lungeInterval);
                    const eyelids = document.getElementById('ps1-eyelids');
                    if (eyelids) eyelids.className = 'closed';
                    cleanupNightmareObjects();

                    if (window.RoomInteractions) {
                        window.RoomInteractions.playGaspWakeupSound();
                    }

                    setTimeout(() => {
                        isNightmareActive = false;
                        if (nightmareFinishCb) nightmareFinishCb(true);
                    }, 500);
                } else {
                    if (nightmareGroup) {
                        nightmareGroup.position.z = THREE.MathUtils.lerp(startZ, targetZ, lungeT);
                        nightmareGroup.position.y = THREE.MathUtils.lerp(startY, targetY, lungeT);
                        pitch += Math.sin(lungeT * 20) * 0.04;
                    }
                }
            }, 16);

        } else if (nightmareVariant === 'corridor_door') {
            if (playerPos.z > -6.0) return; // Solo cuando alcanza la puerta
            nightmareInteractTriggered = true;

            const prompt = document.getElementById('ps1-interact-prompt');
            if (prompt) prompt.classList.remove('visible');

            // Sonido de cerrojo trabado y apagón
            if (nightmareLightObj) nightmareLightObj.intensity = 0.0;
            if (window.RoomInteractions) {
                window.RoomInteractions.playDoorSqueak(false);
            }

            // Giro forzado de 180°
            yaw += Math.PI;
            pitch = 0.05;

            const entity = createDarkEntityModel();
            nightmareGroup = entity.group;
            nightmareGroup.position.set(0, 0, playerPos.z + 2.8);
            nightmareGroup.rotation.y = 0;
            scene.add(nightmareGroup);

            entity.jaw.rotation.x = 0.75;
            entity.eyeLight.intensity = 4.5;
            entity.arms.forEach(a => { a.rotation.x = -1.1; });

            if (window.RoomInteractions) {
                window.RoomInteractions.playNightmareScreech();
            }

            let lungeT = 0;
            const startZ = nightmareGroup.position.z;
            const targetZ = playerPos.z + 0.15;

            const lungeInterval = setInterval(() => {
                lungeT += 0.12;
                if (lungeT >= 1.0) {
                    clearInterval(lungeInterval);
                    const eyelids = document.getElementById('ps1-eyelids');
                    if (eyelids) eyelids.className = 'closed';
                    cleanupNightmareObjects();

                    if (window.RoomInteractions) {
                        window.RoomInteractions.playGaspWakeupSound();
                    }

                    setTimeout(() => {
                        isNightmareActive = false;
                        if (nightmareFinishCb) nightmareFinishCb(true);
                    }, 500);
                } else {
                    if (nightmareGroup) {
                        nightmareGroup.position.z = THREE.MathUtils.lerp(startZ, targetZ, lungeT);
                        nightmareGroup.position.y = Math.sin(lungeT * 22) * 0.08;
                    }
                }
            }, 16);

        } else if (nightmareVariant === 'mirror_demon') {
            const dist = Math.hypot(playerPos.x - (-HALF_W + 0.1), playerPos.z - 0);
            if (dist > 2.4) return;
            nightmareInteractTriggered = true;

            const prompt = document.getElementById('ps1-interact-prompt');
            if (prompt) prompt.classList.remove('visible');

            if (window.RoomInteractions) {
                window.RoomInteractions.playNightmareScreech();
            }

            const entity = createDarkEntityModel();
            nightmareGroup = entity.group;
            nightmareGroup.position.set(-HALF_W + 0.3, 0, 0);
            nightmareGroup.rotation.y = Math.PI / 2;
            scene.add(nightmareGroup);

            entity.jaw.rotation.x = 0.75;
            entity.eyeLight.intensity = 4.5;
            entity.arms.forEach(a => { a.rotation.x = -1.1; });

            let lungeT = 0;
            const startX = nightmareGroup.position.x;
            const targetX = playerPos.x - 0.2;

            const lungeInterval = setInterval(() => {
                lungeT += 0.14;
                if (lungeT >= 1.0) {
                    clearInterval(lungeInterval);
                    const eyelids = document.getElementById('ps1-eyelids');
                    if (eyelids) eyelids.className = 'closed';
                    cleanupNightmareObjects();

                    if (window.RoomInteractions) {
                        window.RoomInteractions.playGaspWakeupSound();
                    }

                    setTimeout(() => {
                        isNightmareActive = false;
                        if (nightmareFinishCb) nightmareFinishCb(true);
                    }, 500);
                } else {
                    if (nightmareGroup) {
                        nightmareGroup.position.x = THREE.MathUtils.lerp(startX, targetX, lungeT);
                        pitch += Math.sin(lungeT * 18) * 0.03;
                    }
                }
            }, 16);
        }
    }

    function startNightmareSequence(onFinish, forcedVariant = null) {
        cleanupNightmareObjects();
        isNightmareActive = true;
        if (window.state) window.state.isNightmareActive = true;
        if (window.RoomInteractions && typeof window.RoomInteractions.stopAllAmbientAudio === 'function') {
            window.RoomInteractions.stopAllAmbientAudio();
        }
        isBedTransition = false;
        isSleepingSequence = false;
        isTransitioning = false;
        moveState.forward = false;
        moveState.backward = false;
        moveState.left = false;
        moveState.right = false;
        nightmareFinishCb = onFinish;
        const eyelids = document.getElementById('ps1-eyelids');
        const prompt = document.getElementById('ps1-interact-prompt');

        // Rotación entre 4 variantes aterradoras
        const variants = ['void_pc', 'paralysis', 'corridor_door', 'mirror_demon'];
        nightmareVariant = (forcedVariant && variants.includes(forcedVariant)) ? forcedVariant : variants[Math.floor(Math.random() * variants.length)];

        // Aislar escena de inmediato: ciudad oculta y luces normales apagadas
        setNightmareSceneState(true, nightmareVariant);

        if (nightmareVariant === 'paralysis') {
            // ============================================================
            // VARIANTE 1: PARÁLISIS DEL SUEÑO EN LA CAMA
            // ============================================================
            nightmareInteractive = false;
            window.state.isLyingDown = true;
            if (eyelids) eyelids.className = 'flutter';

            nightmareLightObj = new THREE.PointLight(0xcc001a, 2.8, 6.0);
            nightmareLightObj.position.set(HALF_W - 0.55, 1.3, 1.1);
            scene.add(nightmareLightObj);

            const entity = createDarkEntityModel();
            nightmareGroup = entity.group;
            nightmareGroup.position.set(HALF_W - 0.55, 0, 0.20);
            nightmareGroup.rotation.y = 0;
            scene.add(nightmareGroup);

            if (window.RoomInteractions) {
                window.RoomInteractions.playNightmareDrone();
                window.RoomInteractions.playHeartbeatFast(5);
            }

            if (prompt) {
                prompt.innerText = tFn("nightmare_paralysis_hint", "[ ⚡ PARÁLISIS DEL SUEÑO: NO PUEDES MOVERTE NI GRITAR... ]");
                prompt.classList.add('visible');
            }

            // Fase 2: Espasmo y aproximación
            setTimeout(() => {
                if (!isNightmareActive || nightmareVariant !== 'paralysis') return;

                if (prompt) {
                    prompt.innerText = tFn("nightmare_shadow_entity_look", "[ 👁 UNA SILUETA OSCURA A LOS PIES DE TU CAMA TE CLAVA LA MIRADA... ]");
                }

                entity.headGroup.rotation.z = -0.38;
                entity.headGroup.rotation.x = 0.22;
                entity.eyeLeft.scale.set(1.4, 1.4, 1.4);
                entity.eyeRight.scale.set(1.4, 1.4, 1.4);

                if (window.RoomInteractions) {
                    window.RoomInteractions.playHeartbeatFast(9);
                }

                let creepT = 0;
                const creepStart = nightmareGroup.position.z;
                const creepTarget = 1.15;

                const creepInterval = setInterval(() => {
                    if (!isNightmareActive || !nightmareGroup || nightmareVariant !== 'paralysis') {
                        clearInterval(creepInterval);
                        return;
                    }
                    creepT += 0.02;
                    if (creepT >= 1.0) {
                        clearInterval(creepInterval);
                    } else {
                        nightmareGroup.position.z = THREE.MathUtils.lerp(creepStart, creepTarget, creepT);
                        nightmareGroup.position.y = Math.sin(creepT * 18) * 0.025;
                        entity.headGroup.rotation.z = -0.38 + Math.sin(creepT * 12) * 0.08;
                    }
                }, 30);

            }, 2800);

            // Fase 3: Jumpscare
            setTimeout(() => {
                if (!isNightmareActive || !nightmareGroup || nightmareVariant !== 'paralysis') return;

                if (prompt) {
                    prompt.innerText = tFn("nightmare_shadow_entity_charge", "[ 😱 ¡LA ENTIDAD ABRE SU MANDÍBULA Y SE ABALANZA DIRECTO A TU CARA! ]");
                }

                entity.jaw.rotation.x = 0.75;
                entity.jaw.position.y = -0.22;
                entity.eyeLeft.scale.set(2.2, 2.2, 2.2);
                entity.eyeRight.scale.set(2.2, 2.2, 2.2);
                entity.eyeLight.intensity = 4.5;

                entity.arms.forEach(a => { a.rotation.x = -1.1; });

                if (window.RoomInteractions) {
                    window.RoomInteractions.playNightmareScreech();
                }

                let lungeT = 0;
                const startZ = nightmareGroup.position.z;
                const targetZ = 2.25;
                const startY = nightmareGroup.position.y;
                const targetY = 0.52;

                const lungeInterval = setInterval(() => {
                    lungeT += 0.14;
                    if (lungeT >= 1.0) {
                        clearInterval(lungeInterval);
                        if (eyelids) eyelids.className = 'closed';
                        cleanupNightmareObjects();

                        if (window.RoomInteractions) {
                            window.RoomInteractions.playGaspWakeupSound();
                        }

                        setTimeout(() => {
                            isNightmareActive = false;
                            if (onFinish) onFinish(true);
                        }, 500);
                    } else {
                        if (nightmareGroup) {
                            nightmareGroup.position.z = THREE.MathUtils.lerp(startZ, targetZ, lungeT);
                            nightmareGroup.position.y = THREE.MathUtils.lerp(startY, targetY, lungeT);
                            nightmareGroup.rotation.x = Math.sin(lungeT * 14) * 0.2;
                        }
                    }
                }, 16);

            }, 5800);

        } else if (nightmareVariant === 'void_pc') {
            // ============================================================
            // VARIANTE 2: EL CUARTO OSCURO / VACÍO Y LA PC SOLITARIA (INTERACTIVA)
            // ============================================================
            nightmareInteractive = true;
            window.state.isLyingDown = false;
            playerPos.set(0, PLAYER_HEIGHT, 4.0);
            camera.position.set(0, PLAYER_HEIGHT, 4.0);
            yaw = 0; pitch = 0;
            if (eyelids) eyelids.className = '';

            nightmarePropsGroup = new THREE.Group();

            // Suelo oscuro
            const floorGeo = new THREE.PlaneGeometry(60, 60);
            const floorMat = new THREE.MeshLambertMaterial({ color: 0x050508 });
            const floor = new THREE.Mesh(floorGeo, floorMat);
            floor.rotation.x = -Math.PI / 2;
            floor.position.y = 0;
            nightmarePropsGroup.add(floor);

            // Habitación oscura envolvente (paredes oscuras para eliminar cualquier vacío con glitches)
            const roomMat = new THREE.MeshLambertMaterial({ color: 0x020204, side: THREE.BackSide });
            const darkRoomMesh = new THREE.Mesh(new THREE.BoxGeometry(26, 12, 26), roomMat);
            darkRoomMesh.position.set(0, 5, -1);
            nightmarePropsGroup.add(darkRoomMesh);

            // Escritorio solitario a lo lejos (z = -6.5)
            const deskMat = new THREE.MeshLambertMaterial({ color: 0x181412 });
            const deskTop = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.9), deskMat);
            deskTop.position.set(0, 0.74, -6.5);
            nightmarePropsGroup.add(deskTop);

            // Patas
            [-0.7, 0.7].forEach(dx => {
                [-0.35, 0.35].forEach(dz => {
                    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.74, 5), deskMat);
                    leg.position.set(dx, 0.37, -6.5 + dz);
                    nightmarePropsGroup.add(leg);
                });
            });

            // Torre de PC al pie del escritorio
            const towerMat = new THREE.MeshLambertMaterial({ color: 0x242428 });
            const tower = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.48, 0.44), towerMat);
            tower.position.set(0.65, 0.24, -6.3);
            nightmarePropsGroup.add(tower);

            // Monitor CRT brillando en el cuarto oscuro
            const monCaseMat = new THREE.MeshLambertMaterial({ color: 0x2c2c30 });
            const monCase = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.44, 0.46), monCaseMat);
            monCase.position.set(0, 1.02, -6.5);
            nightmarePropsGroup.add(monCase);

            // Pantalla CRT verde fósforo/cian
            const monScreenMat = new THREE.MeshBasicMaterial({ color: 0x15f4ee });
            const monScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.32), monScreenMat);
            monScreen.position.set(0, 1.02, -6.26);
            nightmarePropsGroup.add(monScreen);

            // Teclado noventero
            const kbMat = new THREE.MeshLambertMaterial({ color: 0x2e2e34 });
            const kb = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.03, 0.20), kbMat);
            kb.position.set(0, 0.79, -6.25);
            nightmarePropsGroup.add(kb);

            scene.add(nightmarePropsGroup);

            // Luz brillante de la pantalla que ilumina el cuarto oscuro
            nightmareLightObj = new THREE.PointLight(0x15f4ee, 3.8, 12.0);
            nightmareLightObj.position.set(0, 1.1, -6.1);
            scene.add(nightmareLightObj);

            if (window.RoomInteractions) {
                window.RoomInteractions.playNightmareDrone();
                window.RoomInteractions.playHeartbeatFast(6);
            }

            updateNightmareInteractionPrompt();

        } else if (nightmareVariant === 'corridor_door') {
            // ============================================================
            // VARIANTE 3: EL PASILLO ANGOSTO Y LA PUERTA TRABADA
            // ============================================================
            nightmareInteractive = true;
            window.state.isLyingDown = false;
            playerPos.set(0, PLAYER_HEIGHT, 5.0);
            camera.position.set(0, PLAYER_HEIGHT, 5.0);
            yaw = 0; pitch = 0;
            if (eyelids) eyelids.className = '';

            nightmarePropsGroup = new THREE.Group();

            // 1. Suelo de tablones de madera vieja
            const hallFloor = new THREE.Mesh(
                new THREE.PlaneGeometry(2.6, 18),
                new THREE.MeshLambertMaterial({ color: 0x362c26 })
            );
            hallFloor.rotation.x = -Math.PI / 2;
            hallFloor.position.set(0, 0, -1.0);
            nightmarePropsGroup.add(hallFloor);

            // 2. Paredes laterales con zócalos y paneles
            [-1.3, 1.3].forEach(wx => {
                const wall = new THREE.Mesh(
                    new THREE.PlaneGeometry(18, 3.4),
                    new THREE.MeshLambertMaterial({ color: 0x484252, side: THREE.DoubleSide })
                );
                wall.position.set(wx, 1.7, -1.0);
                wall.rotation.y = Math.PI / 2;
                nightmarePropsGroup.add(wall);

                // Zócalo inferior oscuro
                const baseboard = new THREE.Mesh(
                    new THREE.PlaneGeometry(18, 0.35),
                    new THREE.MeshLambertMaterial({ color: 0x221d26, side: THREE.DoubleSide })
                );
                baseboard.position.set(wx > 0 ? wx - 0.01 : wx + 0.01, 0.175, -1.0);
                baseboard.rotation.y = Math.PI / 2;
                nightmarePropsGroup.add(baseboard);
            });

            // 3. Techo del pasillo
            const hallCeil = new THREE.Mesh(
                new THREE.PlaneGeometry(2.6, 18),
                new THREE.MeshLambertMaterial({ color: 0x242028, side: THREE.DoubleSide })
            );
            hallCeil.rotation.x = Math.PI / 2;
            hallCeil.position.set(0, 3.4, -1.0);
            nightmarePropsGroup.add(hallCeil);

            // 4. Pared trasera detrás del jugador
            const backWall = new THREE.Mesh(
                new THREE.PlaneGeometry(2.6, 3.4),
                new THREE.MeshLambertMaterial({ color: 0x2e2834 })
            );
            backWall.position.set(0, 1.7, 7.5);
            nightmarePropsGroup.add(backWall);

            // 5. Pared frontal que enmarca la puerta al final
            const frontWall = new THREE.Mesh(
                new THREE.PlaneGeometry(2.6, 3.4),
                new THREE.MeshLambertMaterial({ color: 0x2e2834 })
            );
            frontWall.position.set(0, 1.7, -8.3);
            nightmarePropsGroup.add(frontWall);

            // 6. Marco de puerta 3D robusto
            const frameMat = new THREE.MeshLambertMaterial({ color: 0x3d1f10 });
            [-0.72, 0.72].forEach(fx => {
                const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.45, 0.14), frameMat);
                post.position.set(fx, 1.22, -8.2);
                nightmarePropsGroup.add(post);
            });
            const lintel = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.12, 0.14), frameMat);
            lintel.position.set(0, 2.45, -8.2);
            nightmarePropsGroup.add(lintel);

            // 7. Hoja de la puerta de madera visible y detallada
            const doorMat = new THREE.MeshLambertMaterial({ color: 0x6e3316 });
            const door = new THREE.Mesh(new THREE.BoxGeometry(1.32, 2.38, 0.08), doorMat);
            door.position.set(0, 1.19, -8.18);
            nightmarePropsGroup.add(door);

            // Molduras / Paneles decorativos en relieve sobre la puerta
            const panelMat = new THREE.MeshLambertMaterial({ color: 0x54240d });
            const topPanel = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.90, 0.02), panelMat);
            topPanel.position.set(0, 1.68, -8.13);
            nightmarePropsGroup.add(topPanel);

            const botPanel = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.80, 0.02), panelMat);
            botPanel.position.set(0, 0.70, -8.13);
            nightmarePropsGroup.add(botPanel);

            // Pomo y cerradura dorada/latón
            const knobMat = new THREE.MeshLambertMaterial({ color: 0xdcb048 });
            const knob = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), knobMat);
            knob.position.set(0.48, 1.10, -8.11);
            nightmarePropsGroup.add(knob);

            const escutcheon = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, 0.01), knobMat);
            escutcheon.position.set(0.48, 1.04, -8.12);
            nightmarePropsGroup.add(escutcheon);

            // Resplandor carmesí siniestro filtrándose bajo la puerta
            const underDoorGlow = new THREE.Mesh(
                new THREE.PlaneGeometry(1.28, 0.06),
                new THREE.MeshBasicMaterial({ color: 0xff1a2a })
            );
            underDoorGlow.rotation.x = -Math.PI / 2;
            underDoorGlow.position.set(0, 0.02, -8.12);
            nightmarePropsGroup.add(underDoorGlow);

            // 8. Lámpara de emergencia roja sobre la puerta
            const lampCaseMat = new THREE.MeshLambertMaterial({ color: 0x222226 });
            const lampCase = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.14, 0.14), lampCaseMat);
            lampCase.position.set(0, 2.70, -8.16);
            nightmarePropsGroup.add(lampCase);

            const redDomeMat = new THREE.MeshBasicMaterial({ color: 0xff2233 });
            const redDome = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), redDomeMat);
            redDome.position.set(0, 2.62, -8.10);
            nightmarePropsGroup.add(redDome);

            // 9. Luz ambiental intermedia en el pasillo (foco colgante a mitad de camino z = -1.0)
            const hangingCord = new THREE.Mesh(
                new THREE.CylinderGeometry(0.008, 0.008, 0.6, 4),
                new THREE.MeshBasicMaterial({ color: 0x111111 })
            );
            hangingCord.position.set(0, 3.1, -1.0);
            nightmarePropsGroup.add(hangingCord);

            const midBulb = new THREE.Mesh(
                new THREE.SphereGeometry(0.06, 5, 5),
                new THREE.MeshBasicMaterial({ color: 0xffaa55 })
            );
            midBulb.position.set(0, 2.78, -1.0);
            nightmarePropsGroup.add(midBulb);

            const midLight = new THREE.PointLight(0xcc6633, 1.4, 12.0);
            midLight.position.set(0, 2.75, -1.0);
            nightmarePropsGroup.add(midLight);

            // 10. Foco colgante cerca del inicio del pasillo (z = 3.5)
            const startCord = new THREE.Mesh(
                new THREE.CylinderGeometry(0.008, 0.008, 0.6, 4),
                new THREE.MeshBasicMaterial({ color: 0x111111 })
            );
            startCord.position.set(0, 3.1, 3.5);
            nightmarePropsGroup.add(startCord);

            const startBulb = new THREE.Mesh(
                new THREE.SphereGeometry(0.06, 5, 5),
                new THREE.MeshBasicMaterial({ color: 0xffaa55 })
            );
            startBulb.position.set(0, 2.78, 3.5);
            nightmarePropsGroup.add(startBulb);

            const startLight = new THREE.PointLight(0xcc6633, 1.3, 11.0);
            startLight.position.set(0, 2.75, 3.5);
            nightmarePropsGroup.add(startLight);

            scene.add(nightmarePropsGroup);

            // 11. Luz roja principal potente sobre la puerta (alcance de 26 unidades para bañar todo el corredor)
            nightmareLightObj = new THREE.PointLight(0xff1828, 4.8, 26.0);
            nightmareLightObj.position.set(0, 2.58, -7.7);
            scene.add(nightmareLightObj);

            if (window.RoomInteractions) {
                window.RoomInteractions.playNightmareDrone();
                window.RoomInteractions.playHeartbeatFast(7);
            }

            updateNightmareInteractionPrompt();

        } else if (nightmareVariant === 'mirror_demon') {
            // ============================================================
            // VARIANTE 4: EL REFLEJO CORRUPTO EN EL ESPEJO
            // ============================================================
            nightmareInteractive = true;
            window.state.isLyingDown = false;
            playerPos.set(-HALF_W + 1.2, PLAYER_HEIGHT, 0.0);
            camera.position.set(-HALF_W + 1.2, PLAYER_HEIGHT, 0.0);
            yaw = -Math.PI / 2; pitch = 0;
            if (eyelids) eyelids.className = '';

            nightmareLightObj = new THREE.PointLight(0xdd0018, 3.0, 5.5);
            nightmareLightObj.position.set(-HALF_W + 0.8, 1.5, 0);
            scene.add(nightmareLightObj);

            if (window.RoomInteractions) {
                window.RoomInteractions.playNightmareDrone();
                window.RoomInteractions.playHeartbeatFast(6);
            }

            updateNightmareInteractionPrompt();
        }
    }

    // --- SECUENCIA COMPLETA DE SUEÑO & SALTO TEMPORAL (4 HORAS) CON ANIMACIÓN DE PÁRPADOS ---
    function triggerBedAction() {
        if (isBedTransition || isSleepingSequence) return;
        if (playerPos.z > 2.88 || Math.abs(playerPos.x) > HALF_W + 0.1) return;

        const eyelids = document.getElementById('ps1-eyelids');

        if (!window.state.isLyingDown) {
            // ACOSTARSES Y DORMIR
            isBedTransition = true;
            isSleepingSequence = true;
            bedTransitionProgress = 0;
            bedCooldownTimer = 6.0;
            bedCamStartPos.copy(camera.position);
            bedCamStartYaw = yaw;
            bedCamStartPitch = pitch;

            window.state.isLyingDown = true;
            bedCamTargetPos.set(HALF_W - 0.55, 0.55, 2.3);
            bedCamTargetYaw = 0;
            bedCamTargetPitch = Math.PI / 2.8;

            if (window.RoomInteractions) window.RoomInteractions.interactBed();
            if (window.RoomInteractions) window.RoomInteractions.showNotificationPrompt(tFn("room_notif_bed_lying", "[ 💤 RECOSTÁNDOTE... CERRANDO LOS OJOS ]"));

            // 1. Iniciar animación de cerrar los párpados
            if (eyelids) {
                eyelids.className = 'closing';
            }

            // 2. Transición a sueño profundo con ojos totalmente cerrados (pantalla en negro)
            setTimeout(() => {
                if (eyelids) eyelids.className = 'closed';
                const prompt = document.getElementById('ps1-interact-prompt');
                if (prompt) {
                    prompt.innerText = tFn("prompt_sleeping_hours", "[ 💤 DURMIENDO PROFUNDAMENTE... PASAN LAS HORAS ]");
                    prompt.classList.add('visible');
                }

                // Avance del reloj en 4 horas (240 minutos)
                if (typeof window.state.gameTimeMinutes === 'number') {
                    window.state.gameTimeMinutes = (window.state.gameTimeMinutes + 240) % 1440;
                }

                // El clima amanece despejado y fresco
                currentWeatherState = 'clear';
                if (window.state) window.state.weatherState = 'clear';
                rainOpacity = 0.0;
                if (rainParticles) rainParticles.visible = false;

                // Evaluación de pesadilla: En Modo Libre ocurre de vez en cuando (~35% prob)
                const isFreeMode = !!(window.state && (window.state.isFreeMode || !window.state.storyActive));
                const nightmareChance = Math.random();

                const executeWakeupSequence = (wasNightmare = false) => {
                    cleanupNightmareObjects();
                    isNightmareActive = false;
                    nightmareInteractive = false;
                    nightmareInteractTriggered = false;
                    window.state.isLyingDown = true;
                    camera.position.set(HALF_W - 0.55, 0.55, 2.3);
                    playerPos.set(HALF_W - 1.2, PLAYER_HEIGHT, 1.4);
                    pitch = bedCamTargetPitch;
                    yaw = 0;

                    // Restaurar iluminación de la habitación
                    if (isLampOn) {
                        if (nightstandLight) nightstandLight.intensity = 2.5;
                        if (ceilingLightObj) ceilingLightObj.intensity = 1.7;
                        if (deskLampLight) deskLampLight.intensity = 2.0;
                        if (ambientLightObj) {
                            ambientLightObj.color.setHex(0x141a24);
                            ambientLightObj.intensity = 0.35;
                        }
                    } else {
                        if (ceilingLightObj) ceilingLightObj.intensity = 0.05;
                        if (deskLampLight) deskLampLight.intensity = 0.2;
                        if (ambientLightObj) {
                            ambientLightObj.color.setHex(0x141a24);
                            ambientLightObj.intensity = 0.2;
                        }
                    }

                    let mins = window.state.gameTimeMinutes || 434;
                    let h24 = Math.floor(mins / 60) % 24, m24 = mins % 60;
                    let ampm = h24 >= 12 ? 'PM' : 'AM';
                    let h12 = h24 % 12; if (h12 === 0) h12 = 12;
                    let timeStr = h12.toString().padStart(2, '0') + ':' + m24.toString().padStart(2, '0') + ' ' + ampm;

                    if (!wasNightmare) {
                        // Aves matutinas solo si despierta de día sin pesadilla
                        if (h24 >= 5 && h24 < 19) {
                            if (window.RoomInteractions && typeof window.RoomInteractions.playMorningBirdsSound === 'function') {
                                window.RoomInteractions.playMorningBirdsSound();
                            }
                        }
                        if (window.RoomInteractions && typeof window.RoomInteractions.playAlarmChime === 'function') {
                            window.RoomInteractions.playAlarmChime();
                        }
                        if (eyelids) eyelids.className = 'flutter';
                    }

                    setTimeout(() => {
                        // Los ojos se abren suavemente por completo
                        if (eyelids) eyelids.className = 'opening';

                        setTimeout(() => {
                            if (eyelids) eyelids.className = '';
                        }, 1600);

                        isSleepingSequence = false;
                        
                        let timeTitle = tFn("room_time_dawn", "🌅 AMANECER");
                        if (h24 >= 5 && h24 < 8) timeTitle = tFn("room_time_dawn", "🌅 AMANECER");
                        else if (h24 >= 8 && h24 < 12) timeTitle = tFn("room_time_morning", "☀️ MAÑANA");
                        else if (h24 >= 12 && h24 < 19) timeTitle = tFn("room_time_afternoon", "🌇 TARDE");
                        else timeTitle = tFn("room_time_night", "🌙 NOCHE");

                        if (window.RoomInteractions) {
                            if (wasNightmare) {
                                const nightmareMsg = tFn("nightmare_waking_gasp", "[ 😱 ¡DESPIERTAS DE GOLPE EMPAPADO EN SUDOR! Solo fue una pesadilla... ]");
                                window.RoomInteractions.showNotificationPrompt(nightmareMsg);
                            } else {
                                const wakingMsg = tFn("room_notif_bed_waking", "[ {title} ({time}) — Has descansado 4 horas. Presiona E o Espacio para levantarte ]").replace('{title}', timeTitle).replace('{time}', timeStr);
                                window.RoomInteractions.showNotificationPrompt(wakingMsg);
                            }
                        }
                    }, wasNightmare ? 300 : 900);
                };

                if (isFreeMode && nightmareChance < 0.38) {
                    // DISPARAR PESADILLA
                    setTimeout(() => {
                        startNightmareSequence(executeWakeupSequence);
                    }, 1000);
                } else {
                    // DESPERTAR NORMAL
                    setTimeout(() => {
                        executeWakeupSequence(false);
                    }, 2000);
                }

            }, 1200);

        } else {
            // LEVANTARSE DE LA CAMA
            isBedTransition = true;
            bedTransitionProgress = 0;
            bedCooldownTimer = 1.0;
            bedCamStartPos.copy(camera.position);
            bedCamStartYaw = yaw;
            bedCamStartPitch = pitch;

            if (eyelids) eyelids.className = '';

            window.state.isLyingDown = false;
            bedCamTargetPos.set(HALF_W - 1.2, PLAYER_HEIGHT, 1.4);
            bedCamTargetYaw = 0;
            bedCamTargetPitch = 0;

            if (window.RoomInteractions) window.RoomInteractions.showNotificationPrompt(tFn("room_notif_bed_stood", "[ TE HAS LEVANTADO DE LA CAMA ]"));
        }
    }

    function updateBedTransition(dt) {
        if (!isBedTransition) return;
        bedTransitionProgress += dt * 0.85;
        if (bedTransitionProgress >= 1.0) {
            bedTransitionProgress = 1.0;
            isBedTransition = false;
            if (!window.state.isLyingDown) {
                playerPos.set(HALF_W - 1.2, PLAYER_HEIGHT, 1.4);
                pitch = 0; yaw = 0;
            } else {
                pitch = bedCamTargetPitch; yaw = 0;
            }
            return;
        }
        const t = bedTransitionProgress < 0.5 ? 2 * bedTransitionProgress * bedTransitionProgress : -1 + (4 - 2 * bedTransitionProgress) * bedTransitionProgress;
        camera.position.lerpVectors(bedCamStartPos, bedCamTargetPos, t);
        pitch = THREE.MathUtils.lerp(bedCamStartPitch, bedCamTargetPitch, t);
        yaw = THREE.MathUtils.lerp(bedCamStartYaw, bedCamTargetYaw, t);
        const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
        const qp = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitch);
        camera.quaternion.copy(qy).multiply(qp);
    }

    // RESOLUCIÓN DE COLISIONES MULTI-PLANTA
    function resolveCollisions(px, pz, r) {
        let x = px;
        let z = pz;

        // Entornos especiales de pesadilla
        if (isNightmareActive && nightmareVariant === 'void_pc') {
            x = Math.max(-18, Math.min(18, px));
            z = Math.max(-14, Math.min(12, pz));
            // Colisión con el escritorio solitario de la PC en el vacío
            if (x > -1.0 - r && x < 1.0 + r && z > -7.2 - r && z < -5.8 + r) {
                if (pz > -5.8) z = -5.8 + r;
                else if (pz < -7.2) z = -7.2 - r;
            }
            return { x, z };
        }

        if (isNightmareActive && nightmareVariant === 'corridor_door') {
            // Pasillo angosto
            x = Math.max(-1.15 + r, Math.min(1.15 - r, px));
            z = Math.max(-7.8 + r, Math.min(6.8 - r, pz));
            return { x, z };
        }

        const playerFeetY = playerPos.y - PLAYER_HEIGHT;
        const currentFloorY = getFloorHeight(px, pz, playerFeetY);

        // 0. SECTOR ESCALERA PRINCIPAL ENTRE PLANTA ALTA Y PLANTA BAJA (z: [6.0, 9.45], |x| <= 0.85)
        // Permite tránsito fluido y continuo en ambas direcciones sin bucles ni snags con Planta Baja
        if (z >= 6.0 && z <= 9.45 && Math.abs(px) <= 0.85) {
            const stairsFloorY = (z <= 6.2) ? 0.0 : (0.0 + (-2.8) * ((z - 6.2) / 3.2));
            if (playerFeetY >= stairsFloorY - 0.85) {
                x = Math.max(-0.80 + r, Math.min(0.80 - r, x));
                return { x, z };
            }
        }

        // 1. SECTOR PLANTA ALTA (Y > -1.4 o fy > -1.85 en z <= 6.2)
        if (currentFloorY > -1.4 || (playerFeetY > -1.85 && z <= 6.2)) {
            // Dentro del dormitorio (z <= 2.9)
            if (z < 2.9) {
                x = Math.max(-HALF_W + r, Math.min(HALF_W - r, x));
                z = Math.max(-HALF_D + r, z);

                // Pared con puerta hacia el pasillo (vano en DOOR_X = 0.6)
                const isDoorOpen = !!(window.state && window.state.doorOpen);
                if (z > 2.9 - r - 0.02) {
                    if (!isDoorOpen || x < 0.05 + r || x > 1.15 - r) {
                        z = 2.9 - r - 0.02;
                    }
                }

                // Obstáculos del dormitorio
                const bedObs = [
                    { x1: -2.15, x2: -0.25, z1: -HALF_D, z2: -1.42 }, // Escritorio PC
                    { x1: -1.45, x2: -0.95, z1: -1.42, z2: -0.95 }, // Silla
                    { x1: 1.88, x2: HALF_W, z1: 0.90, z2: HALF_D },  // Cama
                    { x1: 1.20, x2: 1.76, z1: 2.32, z2: FRONT_WALL_Z }, // Mesita
                    { x1: 2.2, x2: HALF_W, z1: -2.2, z2: -1.4 },     // TV
                    { x1: -HALF_W, x2: -HALF_W + 1.0, z1: FRONT_WALL_Z - 1.0, z2: FRONT_WALL_Z } // Armario
                ];
                bedObs.forEach(o => {
                    const mx = o.x1 - r, Mx = o.x2 + r, mz = o.z1 - r, Mz = o.z2 + r;
                    if (x > mx && x < Mx && z > mz && z < Mz) {
                        const ol = x - mx, or2 = Mx - x, ot = z - mz, ob = Mz - z;
                        const m = Math.min(ol, or2, ot, ob);
                        if (m === ol) x = mx; else if (m === or2) x = Mx;
                        else if (m === ot) z = mz; else z = Mz;
                    }
                });
                return { x, z };
            } else {
                // Pasillo superior y Baño superior (z: [2.9, 6.2])
                if (z < 6.2) {
                    if (px <= 1.7) {
                        x = Math.max(-0.85 + r, x);
                        if (z < 3.8 || z > 4.8 || !bathDoorOpen) {
                            x = Math.min(1.7 - r, x);
                        } else {
                            x = Math.min(3.4 - r, x);
                        }
                        const isDoorOpen = !!(window.state && window.state.doorOpen);
                        if (z < 2.9 + r + 0.02) {
                            if (!isDoorOpen || x < 0.05 + r || x > 1.15 - r) {
                                z = 2.9 + r + 0.02;
                            }
                        }
                    } else {
                        // Dentro del baño
                        x = Math.min(3.4 - r, x);
                        z = Math.max(2.95 + r, Math.min(5.95 - r, z));
                        if (!bathDoorOpen || z < 3.8 || z > 4.8) {
                            x = Math.max(1.7 + r, x);
                        }

                        // Colisiones con elementos del baño:
                        // 1. Bañera en la pared norte (z: [2.95, 3.68], x: [1.80, 3.45])
                        if (x > 1.80 - r && x < 3.45 + r && z > 2.95 - r && z < 3.68 + r) {
                            z = 3.68 + r;
                        }
                        // 2. Lavamanos y botiquín en la pared este (x: [2.95, 3.50], z: [3.90, 4.70])
                        if (x > 2.95 - r && z > 3.90 - r && z < 4.70 + r) {
                            x = 2.95 - r;
                        }
                        // 3. Inodoro en la zona sur (x: [2.85, 3.50], z: [5.20, 5.98])
                        if (x > 2.85 - r && z > 5.20 - r) {
                            if (px < 2.85) x = 2.85 - r;
                            else z = 5.20 - r;
                        }
                        // 4. Hoja de la puerta del baño abierta (a lo largo de z = 3.82, x: [1.70, 2.68])
                        if (bathDoorOpen && x > 1.70 - r && x < 2.68 + r && z > 3.75 - r && z < 3.90 + r) {
                            if (pz >= 3.82) z = 3.90 + r;
                            else z = 3.75 - r;
                        }
                    }
                } else {
                    // Hueco de la escalera hacia Planta Baja
                    x = Math.max(-0.8 + r, Math.min(0.8 - r, x));
                    z = Math.min(9.5 - r, z);
                }
                return { x, z };
            }
        }

        // 2. SECTOR SÓTANO (Y < -3.5 o en rampa de sótano z <= 4.5 descendiendo)
        if (currentFloorY < -2.2 && (currentFloorY < -3.5 || playerFeetY < -3.5 || (playerFeetY < -2.95 && z <= 4.5 && Math.abs(x) <= 0.85))) {
            // Si está en el hueco/pasaje de la escalera del sótano (z: [1.0, 4.5]):
            if (z >= 1.0) {
                x = Math.max(-0.75 + r, Math.min(0.75 - r, x));
                if (!basementDoorOpen && z > 4.5 - r) {
                    z = 4.5 - r; // No pasar si la puerta está cerrada
                } else if (basementDoorOpen && z > 4.5) {
                    // Permitir salir de la escalera al descansillo libremente
                }
            } else {
                // Dentro del sótano propiamente dicho
                x = Math.max(-3.85 + r, Math.min(3.85 - r, x));
                z = Math.max(-2.65 + r, z);
                if (Math.abs(x) > 0.75 - r && z > 1.0 - r) {
                    z = 1.0 - r;
                }
            }

            // Obstáculos Sótano:
            // Pilar central (x: 0, z: -0.9)
            if (x > -0.45 - r && x < 0.45 + r && z > -1.25 - r && z < -0.55 + r) {
                if (px > 0) x = 0.45 + r; else x = -0.45 - r;
            }
            // Caldera (x: 2.4, z: -1.8)
            if (x > 1.7 - r && x < 3.1 + r && z > -2.5 - r && z < -1.1 + r) {
                if (px < 1.7) x = 1.7 - r; else if (pz > -1.1) z = -1.1 + r; else z = -2.5 - r;
            }
            // Estanterías metálicas
            if (x > 2.2 - r && x < 3.5 + r && z > -0.7 - r && z < 0.7 + r) {
                if (px < 2.2) x = 2.2 - r;
            }
            return { x, z };
        }

        // 3. SECTOR PLANTA BAJA (-3.8 <= Y <= -1.4)
        // Escalera subiendo a Planta Alta (z: [6.2, 9.4], dentro del pasillo central):
        if (z >= 6.2 && z <= 9.4 && Math.abs(px) <= 0.85) {
            x = Math.max(-0.80 + r, Math.min(0.80 - r, x));
        }

        // Si el jugador entra a la escalera del sótano desde el descansillo (x: [-0.85, 0.85], z <= 4.5):
        if (Math.abs(x) <= 0.85 && z <= 4.5) {
            if (!basementDoorOpen && z < 4.5 + r) {
                z = 4.5 + r;
            } else if (basementDoorOpen) {
                // Vano de paso de la puerta del sótano (x: [-0.47, 0.47])
                if (x < -0.47 + r || x > 0.47 - r) {
                    z = Math.max(4.5 + r, z);
                } else {
                    x = Math.max(-0.75 + r, Math.min(0.75 - r, x));
                    return { x, z };
                }
            }
        }

        // Acceso al porche exterior si la puerta principal está abierta
        if (frontDoorOpen && Math.abs(x) <= 1.2 && z >= 10.9) {
            x = Math.max(-1.85 + r, Math.min(1.85 - r, x));
            z = Math.min(13.4 - r, z);
            return { x, z };
        }

        x = Math.max(-6.0 + r, Math.min(6.0 - r, x));
        z = Math.max(1.0 + r, Math.min(11.0 - r, z));

        // Impedir caer a los lados del hueco de la escalera al sótano (z: [1.0, 4.5], x: [-0.85, 0.85])
        if (z >= 1.0 && z <= 4.5) {
            if (px < -0.85 && x > -0.85 - r) x = -0.85 - r;
            else if (px > 0.85 && x < 0.85 + r) x = 0.85 + r;
        }

        // Muro Este (x = 0.85) entre Living y escalera/pasillo central (z: [1.0, 9.3])
        if (z >= 1.0 && z < 9.3) {
            if (px < 0.85 && x > 0.85 - r) x = 0.85 - r;
            else if (px > 0.85 && x < 0.85 + r) x = 0.85 + r;
        }

        // Muro Oeste (x = -0.85) entre Cocina y descansillo/escalera:
        // Segmento Norte (z: [1.0, 4.5]) y Segmento Sur (z: [6.0, 9.3])
        // En z: [4.5, 6.0] el paso es LIBRE (portal de acceso al sótano desde la cocina)
        if ((z >= 1.0 && z < 4.5) || (z > 6.0 && z < 9.3)) {
            if (px > -0.85 && x < -0.85 + r) x = -0.85 + r;
            else if (px < -0.85 && x > -0.85 - r) x = -0.85 - r;
        }

        // Cierre Sur del descansillo del sótano en z = 6.0 (bajo la escalera a planta alta)
        // Solo aplica a quien está en Planta Baja dentro del descansillo del sótano (z <= 6.05)
        if (playerFeetY < -2.2 && pz <= 6.05 && x > -0.85 - r && x < 0.85 + r && z >= 4.5 - r) {
            if (z > 6.0 - r) {
                z = 6.0 - r;
            }
        }

        // Obstáculos Planta Baja:
        // Sofá Living — hitbox ajustado a la geometría real del mesh (2.3x0.9 en pos 3.6, 6.4)
        if (!isSofaSeated && x > 2.45 - r && x < 4.75 + r && z > 5.95 - r && z < 6.85 + r) {
            const ol = x - (2.45 - r), or2 = (4.75 + r) - x, ot = z - (5.95 - r), ob = (6.85 + r) - z;
            const m = Math.min(ol, or2, ot, ob);
            if (m === ol) x = 2.45 - r; else if (m === or2) x = 4.75 + r;
            else if (m === ot) z = 5.95 - r; else z = 6.85 + r;
        }
        // Sillón individual Living (pos 2.1, 7.8, tam 0.9x0.9)
        if (x > 1.65 - r && x < 2.55 + r && z > 7.35 - r && z < 8.25 + r) {
            const ol = x - (1.65 - r), or2 = (2.55 + r) - x, ot = z - (7.35 - r), ob = (8.25 + r) - z;
            const m = Math.min(ol, or2, ot, ob);
            if (m === ol) x = 1.65 - r; else if (m === or2) x = 2.55 + r;
            else if (m === ot) z = 7.35 - r; else z = 8.25 + r;
        }
        // Mesa ratona Living (pos 3.6, 7.8, tam 1.3x0.7)
        if (x > 2.95 - r && x < 4.25 + r && z > 7.45 - r && z < 8.15 + r) {
            const ol = x - (2.95 - r), or2 = (4.25 + r) - x, ot = z - (7.45 - r), ob = (8.15 + r) - z;
            const m = Math.min(ol, or2, ot, ob);
            if (m === ol) x = 2.95 - r; else if (m === or2) x = 4.25 + r;
            else if (m === ot) z = 7.45 - r; else z = 8.15 + r;
        }
        // Chimenea Living (x: 5.95, z: 4.2, tam 0.5x1.9)
        if (x > 5.45 - r && z > 3.25 - r && z < 5.15 + r) {
            x = 5.45 - r;
        }
        // Biblioteca Living (x: 3.8, z: 1.25, tam 0.45x1.8)
        if (x > 3.55 - r && x < 4.05 + r && z > 1.0 - r && z < 2.15 + r) {
            if (px < 3.55) x = 3.55 - r; else if (px > 4.05) x = 4.05 + r;
            else if (pz > 2.15) z = 2.15 + r;
        }
        // Mueble TV Living
        if (x > 5.2 - r && z > 6.7 - r && z < 8.9 + r) {
            x = 5.2 - r;
        }
        // Mesada Cocina en L
        if (x < -3.2 + r && z > 10.5 - r && z < 11.2) {
            z = 10.5 - r;
        }
        if (x < -5.5 + r && z > 8.1 - r && z < 10.6 + r) {
            x = -5.5 + r;
        }
        // Heladera Cocina (pos -5.75, 4.0, tam 0.75x0.75)
        if (x < -5.0 + r && z > 3.4 - r && z < 4.6 + r) {
            x = -5.0 + r;
        }
        // Mesa de comedor redonda y sillas Cocina
        if (x > -3.9 - r && x < -2.5 + r && z > 4.3 - r && z < 5.9 + r) {
            const ol = x - (-3.9 - r), or2 = (-2.5 + r) - x, ot = z - (4.3 - r), ob = (5.9 + r) - z;
            const m = Math.min(ol, or2, ot, ob);
            if (m === ol) x = -3.9 - r; else if (m === or2) x = -2.5 + r;
            else if (m === ot) z = 4.3 - r; else z = 5.9 + r;
        }

        return { x, z };
    }

    function updateMovement(dt) {
        if (isNightmareActive) {
            if (isTransitioning || isMonitorMode || isBedTransition || window.state.consoleMinigameActive) return;
            if (nightmareVariant === 'paralysis') return;

            const fx = -Math.sin(yaw), fz = -Math.cos(yaw);
            const rx = Math.cos(yaw), rz = -Math.sin(yaw);
            let mx = 0, mz = 0;
            if (moveState.forward) { mx += fx; mz += fz; }
            if (moveState.backward) { mx -= fx; mz -= fz; }
            if (moveState.right) { mx += rx; mz += rz; }
            if (moveState.left) { mx -= rx; mz -= rz; }
            const ls = mx * mx + mz * mz;
            if (ls > 0) {
                const l = Math.sqrt(ls);
                mx = (mx / l) * MOVE_SPEED * dt; mz = (mz / l) * MOVE_SPEED * dt;
                const r = resolveCollisions(playerPos.x + mx, playerPos.z + mz, PLAYER_RADIUS);
                playerPos.x = r.x; playerPos.z = r.z;
            }
            if (nightmareInteractive) {
                updateNightmareInteractionPrompt();
            }
            return;
        }

        if (!document.pointerLockElement || isTransitioning || isMonitorMode || isBedTransition || window.state.consoleMinigameActive) return;
        if (isSleepingSequence && !isNightmareActive) return;
        if (window.state.isLyingDown && (!isNightmareActive || nightmareVariant === 'paralysis')) return;

        const fx = -Math.sin(yaw), fz = -Math.cos(yaw);
        const rx = Math.cos(yaw), rz = -Math.sin(yaw);
        let mx = 0, mz = 0;
        if (moveState.forward) { mx += fx; mz += fz; }
        if (moveState.backward) { mx -= fx; mz -= fz; }
        if (moveState.right) { mx += rx; mz += rz; }
        if (moveState.left) { mx -= rx; mz -= rz; }

        const ls = mx * mx + mz * mz;
        if (ls > 0) {
            const l = Math.sqrt(ls);
            mx = (mx / l) * MOVE_SPEED * dt; mz = (mz / l) * MOVE_SPEED * dt;
            const r = resolveCollisions(playerPos.x + mx, playerPos.z + mz, PLAYER_RADIUS);
            playerPos.x = r.x; playerPos.z = r.z;
        }

        // Suavizado vertical con altura dinámica de piso y escaleras
        const targetFloorY = getFloorHeight(playerPos.x, playerPos.z, playerPos.y - PLAYER_HEIGHT);
        const targetEyeY = targetFloorY + PLAYER_HEIGHT;
        playerPos.y = THREE.MathUtils.lerp(playerPos.y, targetEyeY, dt * 14.0);

        if (isNightmareActive && nightmareInteractive) {
            updateNightmareInteractionPrompt();
        }
    }

    function updateCamera() {
        if (isTransitioning || isMonitorMode || isBedTransition) return;
        if (window.state.isLyingDown && (!isNightmareActive || nightmareVariant === 'paralysis')) {
            camera.position.set(HALF_W - 0.55, 0.55, 2.3);
            if (!isNightmareActive) {
                pitch = Math.PI / 2.8; yaw = 0;
            }
        } else {
            camera.position.set(playerPos.x, playerPos.y, playerPos.z);
        }
        const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
        const qp = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitch);
        camera.quaternion.copy(qy).multiply(qp);
    }

    function toggleRoomLamp() {
        isLampOn = !isLampOn;
        if (typeof playClickSound === 'function') playClickSound();
        if (window.RoomInteractions) window.RoomInteractions.playRetroClick(1.0);

        if (isLampOn) {
            if (nightstandLight) nightstandLight.intensity = 2.5;
            if (lampShadeMesh && lampShadeMesh.material) {
                lampShadeMesh.material.emissive.setHex(0xff8822);
                lampShadeMesh.material.emissiveIntensity = 0.8;
                lampShadeMesh.material.color.setHex(0xffaa44);
            }
            if (ceilingLightObj) ceilingLightObj.intensity = 1.7;
            if (deskLampLight) deskLampLight.intensity = 2.0;
            if (fairyPointLight) fairyPointLight.intensity = 0.35;
        } else {
            if (nightstandLight) nightstandLight.intensity = 0.0;
            if (lampShadeMesh && lampShadeMesh.material) {
                lampShadeMesh.material.emissive.setHex(0x000000);
                lampShadeMesh.material.emissiveIntensity = 0;
                lampShadeMesh.material.color.setHex(0x332211);
            }
            if (ceilingLightObj) ceilingLightObj.intensity = 0.05;
            if (deskLampLight) deskLampLight.intensity = 0.2;
            if (fairyPointLight) fairyPointLight.intensity = 0.55;
        }
    }

    // ========================================================
    // SISTEMA DE ENTIDADES PARANORMALES TERRORÍFICAS (Estilo The Mortuary Assistant)
    // 4 Variantes únicas: tall_specter, crawling_ghoul, window_face, shadow_glitch
    // ========================================================

    const PARANORMAL_VARIANTS = ['tall_specter', 'crawling_ghoul', 'window_face', 'shadow_glitch'];
    let lastParanormalVariantIndex = 0;

    function playParanormalAudio(type) {
        try {
            const ctx = (window.RoomInteractions && typeof window.RoomInteractions.getAudioCtx === 'function')
                ? window.RoomInteractions.getAudioCtx()
                : (window.AudioContext ? new (window.AudioContext || window.webkitAudioContext)() : null);
            if (!ctx) return;
            if (ctx.state === 'suspended') ctx.resume();
            const now = ctx.currentTime;

            if (type === 'presence') {
                // Infrasonido grave 40Hz + batimiento binaural tenso
                const osc1 = ctx.createOscillator();
                const osc2 = ctx.createOscillator();
                const gain = ctx.createGain();
                const filter = ctx.createBiquadFilter();

                osc1.type = 'sawtooth';
                osc1.frequency.setValueAtTime(44, now);
                osc1.frequency.exponentialRampToValueAtTime(34, now + 3.5);

                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(46.5, now); // batimiento lento de 2.5Hz
                osc2.frequency.exponentialRampToValueAtTime(36, now + 3.5);

                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(105, now);

                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.linearRampToValueAtTime(0.09, now + 0.6);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

                osc1.connect(filter);
                osc2.connect(filter);
                filter.connect(gain);
                gain.connect(ctx.destination);

                osc1.start(now); osc2.start(now);
                osc1.stop(now + 3.9); osc2.stop(now + 3.9);
            } else if (type === 'crawler_scuttle') {
                // Sonido de patas arrastrándose y articulaciones crujiendo rápidamente
                for (let i = 0; i < 5; i++) {
                    const clickOsc = ctx.createOscillator();
                    const clickGain = ctx.createGain();
                    const clickTime = now + i * 0.055;
                    clickOsc.type = 'triangle';
                    clickOsc.frequency.setValueAtTime(240 + Math.random() * 80, clickTime);
                    clickOsc.frequency.exponentialRampToValueAtTime(40, clickTime + 0.04);
                    clickGain.gain.setValueAtTime(0.12, clickTime);
                    clickGain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.045);
                    clickOsc.connect(clickGain);
                    clickGain.connect(ctx.destination);
                    clickOsc.start(clickTime);
                    clickOsc.stop(clickTime + 0.05);
                }
            } else if (type === 'flee') {
                // Golpe seco de espasmo y disolución en estática analógica
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const filter = ctx.createBiquadFilter();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(180, now);
                osc.frequency.exponentialRampToValueAtTime(45, now + 0.34);
                filter.type = 'bandpass';
                filter.frequency.setValueAtTime(580, now);
                filter.Q.value = 3.5;
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.36);
                osc.connect(filter);
                filter.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.38);

                // Ruido blanco de descarga
                const bufSize = Math.floor(ctx.sampleRate * 0.28);
                const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufSize; i++) {
                    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.07));
                }
                const noise = ctx.createBufferSource();
                noise.buffer = buffer;
                const nGain = ctx.createGain();
                nGain.gain.setValueAtTime(0.10, now);
                nGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.29);
                noise.connect(nGain);
                nGain.connect(ctx.destination);
                noise.start(now);
            }
        } catch (e) {
            console.warn('Paranormal audio exception:', e);
        }
    }

    // Generador de textura procedural para piel cadavérica/corrupta
    function getDecayedFleshTexture(baseR, baseG, baseB, veinR, veinG, veinB) {
        const c = document.createElement('canvas');
        c.width = 128; c.height = 128;
        const ctx = c.getContext('2d');
        ctx.fillStyle = `rgb(${baseR},${baseG},${baseB})`;
        ctx.fillRect(0, 0, 128, 128);
        ctx.strokeStyle = `rgba(${veinR},${veinG},${veinB},0.45)`;
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 16; i++) {
            ctx.beginPath();
            let x = Math.random() * 128, y = Math.random() * 128;
            ctx.moveTo(x, y);
            for (let j = 0; j < 4; j++) {
                x += (Math.random() - 0.5) * 26;
                y += (Math.random() - 0.5) * 26;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        const idata = ctx.getImageData(0, 0, 128, 128);
        const d = idata.data;
        for (let i = 0; i < d.length; i += 4) {
            const noise = (Math.random() - 0.5) * 32;
            d[i] = Math.min(255, Math.max(0, d[i] + noise));
            d[i+1] = Math.min(255, Math.max(0, d[i+1] + noise));
            d[i+2] = Math.min(255, Math.max(0, d[i+2] + noise));
        }
        ctx.putImageData(idata, 0, 0);
        const tex = new THREE.CanvasTexture(c);
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = THREE.NearestFilter;
        return tex;
    }

    // Constructor multi-variante de modelos 3D hiper-detallados de terror (The Mortuary Assistant)
    function createParanormalModel(variant) {
        const entGroup = new THREE.Group();
        const materials = [];

        if (variant === 'crawling_ghoul') {
            // ========================================================
            // VARIANTE 2: EL REPTANTE (Deforme en 4 patas con columna rota y cabeza mirando arriba)
            // ========================================================
            const fleshTex = getDecayedFleshTexture(38, 30, 32, 110, 20, 20);
            const ghoulMat = new THREE.MeshLambertMaterial({ map: fleshTex, color: 0x5a4848 });
            const boneMat = new THREE.MeshLambertMaterial({ color: 0x8a7f72 });
            const clawMat = new THREE.MeshLambertMaterial({ color: 0x181010 });
            materials.push(ghoulMat, boneMat, clawMat);

            const crawlerGroup = new THREE.Group();

            // Columna arqueada hacia atrás en U invertida
            const spineGroup = new THREE.Group();
            for (let v = 0; v < 6; v++) {
                const vert = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.10), boneMat);
                const angle = (v / 5) * Math.PI * 0.4 - 0.2;
                vert.position.set(0, 0.36 + Math.sin(v * 0.6) * 0.08, -0.30 + v * 0.11);
                vert.rotation.x = angle;
                spineGroup.add(vert);
            }
            crawlerGroup.add(spineGroup);

            // Caja torácica deforme con costillas laterales expuestas
            const ribCage = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.22, 0.42), ghoulMat);
            ribCage.position.set(0, 0.34, -0.05);
            crawlerGroup.add(ribCage);

            [-1, 1].forEach(side => {
                for (let r = 0; r < 4; r++) {
                    const rib = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.18, 4), boneMat);
                    rib.position.set(side * 0.18, 0.32 - r * 0.03, -0.18 + r * 0.10);
                    rib.rotation.z = side * 0.7;
                    crawlerGroup.add(rib);
                }
            });

            // Brazos delanteros largos doblados en ángulo insectoide (articulación de codo alta)
            [-1, 1].forEach(side => {
                const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.36, 5), ghoulMat);
                upperArm.position.set(side * 0.24, 0.38, -0.26);
                upperArm.rotation.set(0.65, 0, side * -0.55);
                crawlerGroup.add(upperArm);

                const foreArm = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.022, 0.38, 5), ghoulMat);
                foreArm.position.set(side * 0.32, 0.16, -0.38);
                foreArm.rotation.set(-0.85, 0, side * 0.30);
                crawlerGroup.add(foreArm);

                // Garra delantera con dedos afilados apoyados en el piso
                const hand = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.03, 0.14), clawMat);
                hand.position.set(side * 0.32, 0.02, -0.50);
                crawlerGroup.add(hand);
            });

            // Piernas traseras encorvadas con rodillas hacia afuera
            [-1, 1].forEach(side => {
                const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.34, 5), ghoulMat);
                thigh.position.set(side * 0.22, 0.32, 0.22);
                thigh.rotation.set(-0.60, 0, side * -0.65);
                crawlerGroup.add(thigh);

                const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.36, 5), ghoulMat);
                shin.position.set(side * 0.28, 0.14, 0.34);
                shin.rotation.set(0.80, 0, side * 0.25);
                crawlerGroup.add(shin);

                const foot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.12), clawMat);
                foot.position.set(side * 0.28, 0.02, 0.44);
                crawlerGroup.add(foot);
            });

            // Cabeza torcida 90° hacia arriba mirando directo al jugador
            const headG = new THREE.Group();
            headG.position.set(0, 0.48, -0.42);

            const cranium = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.24), ghoulMat);
            headG.add(cranium);

            // Mandíbula abierta con colmillos
            const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.18), clawMat);
            jaw.position.set(0, 0.12, -0.06);
            headG.add(jaw);

            // Ojos rojos carmesí ardientes en cuencas negras
            const redEyeMat = new THREE.MeshBasicMaterial({ color: 0xff1111 });
            const socketMat = new THREE.MeshBasicMaterial({ color: 0x050202 });
            materials.push(redEyeMat, socketMat);

            [-0.06, 0.06].forEach(ex => {
                const sock = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.05), socketMat);
                sock.position.set(ex, 0.04, -0.122); sock.rotation.y = Math.PI;
                headG.add(sock);

                const eye = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), redEyeMat);
                eye.position.set(ex, 0.04, -0.125);
                headG.add(eye);
            });

            headG.rotation.x = -1.15; // Girada bruscamente hacia arriba
            crawlerGroup.add(headG);
            entGroup.add(crawlerGroup);

            entGroup.headGroup = headG;
            entGroup.spineGroup = crawlerGroup;

        } else if (variant === 'window_face') {
            // ========================================================
            // VARIANTE 3: EL ROSTRO PÁLIDO EN EL CRISTAL (Pegado a la ventana exterior)
            // ========================================================
            const paleTex = getDecayedFleshTexture(180, 190, 198, 70, 85, 105);
            const paleMat = new THREE.MeshLambertMaterial({ map: paleTex, color: 0xcddbe8 });
            const darkMat = new THREE.MeshBasicMaterial({ color: 0x030508 });
            const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const hairMat = new THREE.MeshLambertMaterial({ color: 0x0c0e12 });
            materials.push(paleMat, darkMat, eyeMat, hairMat);

            const headG = new THREE.Group();
            headG.position.set(0, 1.48, 0);

            // Cráneo anatómico cadavérico con pómulos y sienes hundidas
            const skull = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.34, 0.22), paleMat);
            headG.add(skull);

            // Pómulos protuberantes
            [-0.10, 0.10].forEach(cx => {
                const cheek = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.04), paleMat);
                cheek.position.set(cx, 0.02, 0.11);
                headG.add(cheek);
            });

            // Cuencas oculares negras con ojos pálidos vidriosos
            [-0.07, 0.07].forEach(ex => {
                const socket = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.08), darkMat);
                socket.position.set(ex, 0.05, 0.114);
                headG.add(socket);

                const eyeball = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), eyeMat);
                eyeball.position.set(ex, 0.05, 0.118);
                headG.add(eyeball);

                const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.009, 6, 6), darkMat);
                pupil.position.set(ex, 0.05, 0.138);
                headG.add(pupil);
            });

            // Boca entreabierta en rictus de dolor silencioso
            const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.04), darkMat);
            mouth.position.set(0, -0.09, 0.112);
            headG.add(mouth);

            // Mechones de pelo lacio mojado cayendo a los lados
            [-0.13, 0.13].forEach(hx => {
                const hairStrand = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.44, 0.16), hairMat);
                hairStrand.position.set(hx, -0.04, 0.03);
                headG.add(hairStrand);
            });

            // Manos cadavéricas con dedos largos huesudos aplanados contra el vidrio
            [-0.26, 0.26].forEach(hx => {
                const palm = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.12, 0.02), paleMat);
                palm.position.set(hx, 1.42, 0.11);
                entGroup.add(palm);

                // 5 dedos aplanados contra el cristal
                for (let f = 0; f < 5; f++) {
                    const finger = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.08, 0.015), paleMat);
                    finger.position.set(hx - 0.036 + f * 0.018, 1.50, 0.112);
                    entGroup.add(finger);
                }
            });

            // Torso mortuorio cubierto en sudario oscuro que se pierde hacia abajo
            const shroudMat = new THREE.MeshLambertMaterial({ color: 0x10141a, transparent: true, opacity: 0.92 });
            materials.push(shroudMat);
            const torso = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.85, 0.22), shroudMat);
            torso.position.set(0, 0.92, -0.04);
            entGroup.add(torso);

            entGroup.add(headG);
            entGroup.headGroup = headG;

        } else if (variant === 'shadow_glitch') {
            // ========================================================
            // VARIANTE 4: LA SOMBRA ESPASMÓDICA (Silueta corrupta fractal con aberración electromagnética)
            // ========================================================
            const voidMat = new THREE.MeshBasicMaterial({ color: 0x06070a, transparent: true, opacity: 0.96 });
            const edgeMat = new THREE.MeshBasicMaterial({ color: 0x152232, wireframe: true });
            const cyanEyeMat = new THREE.MeshBasicMaterial({ color: 0x77eeff });
            const redGlowMat = new THREE.MeshBasicMaterial({ color: 0xff2244 });
            materials.push(voidMat, edgeMat, cyanEyeMat, redGlowMat);

            // Torso segmentado en capas desfasadas
            const torso = new THREE.Mesh(new THREE.BoxGeometry(0.36, 1.20, 0.20), voidMat);
            torso.position.y = 1.40;
            const torsoWire = new THREE.Mesh(new THREE.BoxGeometry(0.38, 1.22, 0.22), edgeMat);
            torso.add(torsoWire);
            entGroup.add(torso);

            // Extremidades filiformes
            [-0.11, 0.11].forEach(lx => {
                const leg = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.15, 0.09), voidMat);
                leg.position.set(lx, 0.55, 0);
                entGroup.add(leg);
            });

            const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.25, 0.07), voidMat);
            lArm.position.set(-0.27, 1.26, 0); lArm.rotation.z = 0.28;
            const rArm = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.25, 0.07), voidMat);
            rArm.position.set(0.27, 1.26, 0); rArm.rotation.z = -0.16;
            entGroup.add(lArm); entGroup.add(rArm);

            const headG = new THREE.Group();
            headG.position.set(0, 2.12, 0);
            const headM = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.32, 0.22), voidMat);
            headG.add(headM);

            // Ojos de aberración cromática desfasados (uno cian y uno carmesí)
            const eye1 = new THREE.Mesh(new THREE.PlaneGeometry(0.045, 0.045), cyanEyeMat);
            eye1.position.set(-0.06, 0.04, 0.115);
            const eye2 = new THREE.Mesh(new THREE.PlaneGeometry(0.045, 0.045), redGlowMat);
            eye2.position.set(0.06, 0.04, 0.115);
            headG.add(eye1); headG.add(eye2);

            entGroup.add(headG);
            entGroup.headGroup = headG;
            entGroup.glitchArms = [lArm, rArm];

        } else {
            // ========================================================
            // VARIANTE 1: EL ACECHADOR ALTO (tall_specter — 2.5m, costillas 3D, mandíbula desencajada y garras)
            // ========================================================
            const paleFleshTex = getDecayedFleshTexture(50, 55, 62, 18, 22, 28);
            const fleshMat = new THREE.MeshLambertMaterial({ map: paleFleshTex, color: 0x3a4048 });
            const boneMat = new THREE.MeshLambertMaterial({ color: 0x828a90 });
            const darkMat = new THREE.MeshBasicMaterial({ color: 0x020304 });
            const whiteEyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            materials.push(fleshMat, boneMat, darkMat, whiteEyeMat);

            // Torso cadavérico alargado
            const torso = new THREE.Mesh(new THREE.BoxGeometry(0.30, 1.35, 0.18), fleshMat);
            torso.position.y = 1.58;
            entGroup.add(torso);

            // 6 pares de costillas tridimensionales protuberantes a lo largo del pecho
            for (let r = 0; r < 6; r++) {
                [-1, 1].forEach(side => {
                    const rib = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.16, 4), boneMat);
                    rib.position.set(side * 0.15, 1.85 - r * 0.09, 0.08);
                    rib.rotation.z = side * 0.85;
                    rib.rotation.y = side * 0.35;
                    entGroup.add(rib);
                });
            }

            // Columna vertebral dorsal en la espalda
            for (let s = 0; s < 7; s++) {
                const vert = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.05), boneMat);
                vert.position.set(0, 1.95 - s * 0.11, -0.10);
                entGroup.add(vert);
            }

            // Clavículas sobresalientes
            [-1, 1].forEach(side => {
                const clav = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.04), boneMat);
                clav.position.set(side * 0.10, 2.08, 0.07);
                clav.rotation.z = side * 0.25;
                entGroup.add(clav);
            });

            // Piernas esqueléticas altas con rodillas marcadas
            [-1, 1].forEach(side => {
                const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 1.35, 6), fleshMat);
                leg.position.set(side * 0.11, 0.68, 0);
                entGroup.add(leg);

                const knee = new THREE.Mesh(new THREE.SphereGeometry(0.048, 6, 6), boneMat);
                knee.position.set(side * 0.11, 0.68, 0.03);
                entGroup.add(knee);
            });

            // Brazos extremadamente largos que casi tocan el suelo con garras de 5 dedos
            [-1, 1].forEach(side => {
                const armUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.028, 0.72, 6), fleshMat);
                armUpper.position.set(side * 0.24, 1.72, 0.02);
                armUpper.rotation.z = side * 0.06;
                entGroup.add(armUpper);

                const armLower = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.022, 0.76, 6), fleshMat);
                armLower.position.set(side * 0.26, 1.05, 0.03);
                armLower.rotation.z = side * 0.04;
                entGroup.add(armLower);

                // Garra con 5 dedos huesudos alargados
                const hand = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.03), fleshMat);
                hand.position.set(side * 0.27, 0.64, 0.03);
                entGroup.add(hand);

                for (let f = 0; f < 5; f++) {
                    const claw = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.004, 0.14, 4), boneMat);
                    claw.position.set(side * 0.27 - 0.02 + f * 0.01, 0.54, 0.03);
                    entGroup.add(claw);
                }
            });

            // Cabeza alargada con mandíbula descolgada y ojos blancos
            const headGroup = new THREE.Group();
            headGroup.position.set(0, 2.36, 0);

            const cranium = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.28, 0.22), fleshMat);
            headGroup.add(cranium);

            // Mandíbula descolgada hacia abajo (abertura cavernosa con dientes podridos)
            const jawMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.18), darkMat);
            jawMesh.position.set(0, -0.22, 0.04);
            headGroup.add(jawMesh);

            // Dientes irregulares afilados
            for (let t = 0; t < 6; t++) {
                const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.025, 4), boneMat);
                tooth.position.set(-0.06 + t * 0.024, -0.14, 0.12);
                tooth.rotation.x = Math.PI;
                headGroup.add(tooth);
            }

            // Ojos lechosos brillantes en cuencas profundas
            [-0.055, 0.055].forEach(ex => {
                const sock = new THREE.Mesh(new THREE.PlaneGeometry(0.045, 0.045), darkMat);
                sock.position.set(ex, 0.04, 0.114);
                headGroup.add(sock);

                const eye = new THREE.Mesh(new THREE.SphereGeometry(0.020, 8, 8), whiteEyeMat);
                eye.position.set(ex, 0.04, 0.118);
                headGroup.add(eye);
            });

            headGroup.rotation.z = 0.22; // Ladeada de forma siniestra
            entGroup.add(headGroup);
            entGroup.headGroup = headGroup;
        }

        entGroup.materials = materials;
        return entGroup;
    }

    function cleanupParanormalEntity() {
        if (paranormalEntity && paranormalEntity.group) {
            scene.remove(paranormalEntity.group);
            if (paranormalEntity.group.materials) {
                paranormalEntity.group.materials.forEach(m => {
                    try { m.dispose(); } catch (e) {}
                });
            }
        }
        paranormalEntity = null;
        paranormalActive = false;
    }

    function spawnParanormalEntity(spotOverride, variantOverride) {
        if (isNightmareActive || isIntroCinematic || isMonitorMode || isTransitioning || isSleepingSequence) return;
        cleanupParanormalEntity();

        // 1. Selección de variante
        let variant = variantOverride;
        if (!variant) {
            variant = PARANORMAL_VARIANTS[lastParanormalVariantIndex % PARANORMAL_VARIANTS.length];
            lastParanormalVariantIndex++;
        }

        // 2. Selección de spot adecuado a la variante
        let chosenSpot = spotOverride;
        if (!chosenSpot) {
            if (variant === 'window_face') {
                chosenSpot = 'window_stalker';
            } else if (variant === 'crawling_ghoul') {
                chosenSpot = Math.random() < 0.5 ? 'bed_watcher' : 'door_peek';
            } else {
                const spots = ['door_peek', 'window_stalker', 'corner_shadow', 'bed_watcher'];
                chosenSpot = spots[Math.floor(Math.random() * spots.length)];
            }
        }

        const model = createParanormalModel(variant);
        let targetPos = new THREE.Vector3();
        let rotY = 0;
        let notifEscapedKey = 'paranormal_glimpse_escaped';

        if (variant === 'tall_specter') notifEscapedKey = 'paranormal_tall_escaped';
        else if (variant === 'crawling_ghoul') notifEscapedKey = 'paranormal_crawler_escaped';
        else if (variant === 'window_face') notifEscapedKey = 'paranormal_window_escaped';
        else if (variant === 'shadow_glitch') notifEscapedKey = 'paranormal_glitch_escaped';

        if (chosenSpot === 'door_peek') {
            targetPos.set(DOOR_X + 0.35, 0.0, FRONT_WALL_Z + 0.38);
            rotY = Math.PI; // Mirando hacia adentro de la habitación
        } else if (chosenSpot === 'window_stalker') {
            if (variant === 'window_face') {
                // Pegado al cristal exterior de la ventana del segundo piso (z: -2.96)
                targetPos.set(WIN_CENTER_X, 0.0, BACK_WALL_Z - 0.06);
                rotY = 0; // Mirando directo hacia la habitación
            } else {
                targetPos.set(WIN_CENTER_X, -1.2, -6.2);
                rotY = 0;
            }
        } else if (chosenSpot === 'corner_shadow') {
            targetPos.set(-HALF_W + 0.55, 0.0, FRONT_WALL_Z - 0.65);
            rotY = 2.4;
        } else {
            // bed_watcher
            targetPos.set(HALF_W - 1.1, 0.0, 0.4);
            rotY = -1.4;
        }

        model.position.copy(targetPos);
        model.rotation.y = rotY;
        scene.add(model);

        paranormalEntity = {
            group: model,
            variant: variant,
            spot: chosenSpot,
            spawnPos: targetPos.clone(),
            spawnTime: Date.now(),
            lifespan: 11.0,
            escaping: false,
            escapeTimer: 0.0,
            notifEscapedKey: notifEscapedKey
        };
        paranormalActive = true;
        paranormalNotified = false;

        playParanormalAudio('presence');
    }

    function updateParanormalEntity(dt) {
        if (!isRunning || isNightmareActive || isIntroCinematic || isMonitorMode || isSleepingSequence) {
            if (paranormalActive) cleanupParanormalEntity();
            return;
        }

        // 1. Temporizador constante aleatorio para eventos espontáneos
        if (!paranormalActive) {
            paranormalTimer += dt;
            if (paranormalTimer >= paranormalCooldown) {
                paranormalTimer = 0;
                paranormalCooldown = 55 + Math.random() * 75; // Cada 55s a 130s en modo libre
                spawnParanormalEntity();
            }
            return;
        }

        if (!paranormalEntity || !paranormalEntity.group) return;

        const now = Date.now() * 0.001;
        const variant = paranormalEntity.variant;

        // 2. Animaciones siniestras según la variante
        if (variant === 'shadow_glitch') {
            // Convulsiones espasmódicas a 25Hz
            const twitch = Math.sin(now * 32) > 0.4;
            if (paranormalEntity.group.headGroup) {
                paranormalEntity.group.headGroup.rotation.z = 0.24 + (twitch ? 0.35 : -0.15);
                paranormalEntity.group.headGroup.rotation.x = (twitch ? 0.20 : 0);
            }
            if (paranormalEntity.group.glitchArms) {
                paranormalEntity.group.glitchArms[0].rotation.z = 0.25 + (twitch ? 0.2 : -0.1);
            }
        } else if (variant === 'crawling_ghoul') {
            // Respiración agitada en el suelo y leve oscilación
            if (paranormalEntity.group.spineGroup) {
                paranormalEntity.group.spineGroup.position.y = 0.02 * Math.sin(now * 6.0);
            }
        } else if (variant === 'window_face') {
            // Movimiento suave pegado al vidrio
            if (paranormalEntity.group.headGroup) {
                paranormalEntity.group.headGroup.rotation.z = Math.sin(now * 1.5) * 0.04;
            }
        } else {
            // tall_specter: micro espasmos de cabeza
            if (paranormalEntity.group.headGroup) {
                paranormalEntity.group.headGroup.rotation.z = 0.26 + Math.sin(now * 2.8) * 0.025;
            }
        }

        // 3. Micro-parpadeo paranormal de las luces de la habitación
        if (deskLampLight && Math.sin(now * 7.5) > 0.88) {
            deskLampLight.intensity = 0.05 + Math.random() * 0.15;
        }

        // 4. Detección de mirada del jugador (Dot Product hacia la entidad)
        const camPos = camera.position;
        const entHeadPos = paranormalEntity.group.position.clone().add(new THREE.Vector3(0, variant === 'crawling_ghoul' ? 0.6 : 1.7, 0));
        const toEnt = entHeadPos.clone().sub(camPos).normalize();
        const camDir = new THREE.Vector3();
        camera.getWorldDirection(camDir);

        const dot = camDir.dot(toEnt);
        const dist = camPos.distanceTo(paranormalEntity.group.position);

        // Si el jugador la mira de frente (dot > 0.70) o se acerca mucho (< 2.2m)
        if (!paranormalEntity.escaping && (dot > 0.70 || dist < 2.2)) {
            paranormalEntity.escaping = true;
            paranormalEntity.escapeTimer = 0.0;

            if (variant === 'crawling_ghoul') {
                playParanormalAudio('crawler_scuttle');
            } else {
                playParanormalAudio('flee');
            }

            // Mostrar el pensamiento / sobresalto fugaz en el HUD
            if (window.RoomInteractions && typeof window.RoomInteractions.showNotificationPrompt === 'function') {
                const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;
                const msgKey = paranormalEntity.notifEscapedKey || "paranormal_glimpse_escaped";
                window.RoomInteractions.showNotificationPrompt(
                    tFn(msgKey, "[ ...¡DESAPARECIÓ DE GOLPE! Juraría que había alguien ahí... ]")
                );
            }
        }

        // 5. Secuencia de huida rápida / colapso aterrador
        if (paranormalEntity.escaping) {
            paranormalEntity.escapeTimer += dt;
            const progress = Math.min(paranormalEntity.escapeTimer / 0.35, 1.0);

            // Desvanecer opacidad de todos los materiales
            if (paranormalEntity.group.materials) {
                paranormalEntity.group.materials.forEach(m => {
                    m.opacity = (1.0 - progress) * 0.95;
                });
            }

            // Movimiento de escape único por variante
            if (variant === 'crawling_ghoul') {
                // Se arrastra en reversa violentamente a 8.5m/s por el piso
                const backwardDir = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), paranormalEntity.group.rotation.y);
                paranormalEntity.group.position.addScaledVector(backwardDir, -8.5 * dt);
            } else if (variant === 'window_face') {
                // Cae verticalmente en picada hacia la oscuridad
                paranormalEntity.group.position.y -= 6.5 * dt;
                paranormalEntity.group.position.z -= 2.0 * dt;
            } else if (paranormalEntity.spot === 'door_peek') {
                // Retrocede velozmente hacia el pasillo oscuro
                paranormalEntity.group.position.z += 7.5 * dt;
                paranormalEntity.group.position.x += 1.8 * dt;
            } else {
                // Se colapsa y desintegra en una nube de sombra
                paranormalEntity.group.scale.set(1.0 - progress * 0.85, 1.0 - progress * 0.85, 1.0 - progress * 0.85);
                paranormalEntity.group.position.y -= 2.2 * dt;
            }

            if (progress >= 1.0) {
                cleanupParanormalEntity();
            }
            return;
        }

        // 6. Timeout si el jugador nunca la miró (se desvanece en silencio al mirar a otro lado)
        const elapsed = (Date.now() - paranormalEntity.spawnTime) * 0.001;
        if (elapsed > paranormalEntity.lifespan && dot < 0.25) {
            cleanupParanormalEntity();
        }
    }

    // CHECK PROXIMITY MULTI-OBJETO
    function checkInteractionProximity() {
        const prompt = document.getElementById('ps1-interact-prompt');
        if (isNightmareActive) return;
        if (isIntroCinematic || isTransitioning || isMonitorMode || isSleepingSequence || (window.state && window.state.consoleMinigameActive)) {
            if (prompt) prompt.classList.remove('visible');
            return;
        }
        const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;

        if (window.state.isLyingDown) {
            if (prompt && !isSleepingSequence) {
                prompt.innerText = tFn("prompt_lying_bed", "[ RECOSTADO EN LA CAMA — PRESIONA E O ESPACIO PARA LEVANTARTE ]");
                prompt.classList.add('visible');
            }
            return;
        }

        function isEffectivelyVisible(obj) {
            let cur = obj;
            while (cur) {
                if (cur.visible === false) return false;
                cur = cur.parent;
            }
            return true;
        }

        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        const allHits = raycaster.intersectObjects(interactables, true);
        const hits = allHits.filter(h => isEffectivelyVisible(h.object));

        if (hits.length > 0 && hits[0].distance < INTERACT_DIST) {
            let hitObj = hits[0].object;
            let itemType = null;
            while (hitObj) {
                if (hitObj.userData && hitObj.userData.type) {
                    itemType = hitObj.userData.type;
                    break;
                }
                hitObj = hitObj.parent;
            }

            if (itemType) {
                // SEGURIDAD: Los objetos del dormitorio solo son interactuables si el jugador se encuentra dentro del dormitorio
                const inBedroom = (playerPos.z <= 2.88 && Math.abs(playerPos.x) <= HALF_W + 0.1);
                if (!inBedroom && (itemType === 'bed' || itemType === 'lamp' || itemType === 'boombox' || itemType === 'window' || itemType === 'phone')) {
                    itemType = null;
                }
            }

            if (itemType) {
                focusedObject = itemType;
                if (prompt) {
                    switch (itemType) {
                        case 'pc':
                            prompt.innerText = tFn("prompt_sit_pc", "[ CLICK / PRESIONA E PARA SENTARSE EN LA PC ]");
                            break;
                        case 'flashlight_item':
                            prompt.innerText = tFn("prompt_pickup_flashlight", "[ CLICK / E PARA RECOGER LINTERNA DE MANO 🔦 ]");
                            break;
                        case 'breaker_box':
                            prompt.innerText = (window.state && window.state.powerOutage)
                                ? tFn("prompt_breaker_restore", "[ CLICK / E PARA RESTABLECER DISYUNTOR PRINCIPAL ⚡ ]")
                                : tFn("prompt_breaker_trip", "[ CLICK / E: DISYUNTOR PRINCIPAL (ENERGIZADO 220V) ⚡ ]");
                            break;
                        case 'lamp':
                            prompt.innerText = isLampOn ? tFn("prompt_lamp_off", "[ CLICK / F PARA APAGAR LÁMPARA ]") : tFn("prompt_lamp_on", "[ CLICK / F PARA PRENDER LÁMPARA ]");
                            break;
                        case 'boombox':
                            prompt.innerText = window.state.radioOn ? tFn("prompt_radio_off", "[ CLICK / E: APAGAR RADIO | R: CAMBIAR ESTACIÓN ]") : tFn("prompt_radio_on", "[ CLICK / E: PRENDER BOOMBOX FM ]");
                            break;
                        case 'window':
                            prompt.innerText = window.state.windowOpen ? tFn("prompt_window_close", "[ CLICK / E PARA CERRAR VENTANA ]") : tFn("prompt_window_open", "[ CLICK / E PARA ABRIR VENTANA ]");
                            break;
                        case 'bed':
                            prompt.innerText = tFn("prompt_bed_sleep", "[ CLICK / E PARA DORMIR EN LA CAMA (4 HORAS) 💤 ]");
                            break;
                        case 'phone':
                            prompt.innerText = window.state.phoneRinging ? tFn("prompt_phone_ring", "[ ¡CLICK / E PARA CONTESTAR TELÉFONO! ]") : tFn("prompt_phone_lift", "[ CLICK / E PARA LEVANTAR TELÉFONO ]");
                            break;
                        case 'door':
                            if (window.state.doorLocked) {
                                prompt.innerText = tFn("prompt_door_locked", "[ PUERTA TRABADA 🔒 | CLICK / E: ABRIR | L: DESTRABAR PESTILLO ]");
                            } else if (window.state.doorOpen) {
                                prompt.innerText = tFn("prompt_door_open", "[ CLICK / E: CERRAR PUERTA | (CIERRA PARA TRABAR) ]");
                            } else {
                                prompt.innerText = tFn("prompt_door_closed", "[ CLICK / E: ABRIR PUERTA | L: TRABAR PESTILLO ]");
                            }
                            break;
                        case 'bathroom_door':
                            prompt.innerText = bathDoorOpen
                                ? tFn("prompt_door_bathroom_open", "[ CLICK / E: CERRAR PUERTA DEL BAÑO ]")
                                : tFn("prompt_door_bathroom_closed_action", "[ CLICK / E: ABRIR PUERTA DEL BAÑO ]");
                            break;
                        case 'living_tv':
                            prompt.innerText = livingTvOn
                                ? tFn("prompt_tv_living_off", "[ CLICK / E: APAGAR TV DEL LIVING | R: CAMBIAR CANAL 📺 ]")
                                : tFn("prompt_tv_living_on", "[ CLICK / E: PRENDER TV DEL LIVING 📺 ]");
                            break;
                        case 'fridge':
                            prompt.innerText = fridgeOpen
                                ? tFn("prompt_fridge_close", "[ CLICK / E: CERRAR REFRIGERADOR 🥤 ]")
                                : tFn("prompt_fridge_open", "[ CLICK / E: ABRIR REFRIGERADOR 🥤 ]");
                            break;
                        case 'kitchen_sink':
                            prompt.innerText = kitchenFaucetOn
                                ? tFn("prompt_sink_off", "[ CLICK / E: CERRAR CANILLA DE COCINA 🚰 ]")
                                : tFn("prompt_sink_on", "[ CLICK / E: ABRIR CANILLA DE COCINA 🚰 ]");
                            break;
                        case 'living_sofa':
                            prompt.innerText = isSofaSeated
                                ? tFn("prompt_sofa_rise", "[ DESCANSANDO EN EL SOFÁ — PRESIONA E O ESPACIO PARA LEVANTARTE 🛋️ ]")
                                : tFn("prompt_sofa_sit", "[ CLICK / E: DESCANSAR EN EL SOFÁ 🛋️ ]");
                            break;
                        case 'front_door':
                            prompt.innerText = frontDoorOpen
                                ? tFn("prompt_front_door_close", "[ CLICK / E: CERRAR PUERTA AL PORCHE 🚪 ]")
                                : tFn("prompt_front_door_open", "[ CLICK / E: ABRIR PUERTA AL PORCHE 🚪 ]");
                            break;
                        case 'basement_door':
                            prompt.innerText = basementDoorOpen
                                ? tFn("prompt_basement_door_close", "[ CLICK / E: CERRAR PUERTA DEL SÓTANO 🚪 ]")
                                : tFn("prompt_basement_door_open", "[ CLICK / E: ABRIR PUERTA DEL SÓTANO 🚪 ]");
                            break;
                        case 'basement_radio':
                            prompt.innerText = basementRadioOn
                                ? tFn("prompt_basement_radio_off", "[ CLICK / E: APAGAR RADIO DE ONDA CORTA 📻 ]")
                                : tFn("prompt_basement_radio_on", "[ CLICK / E: ENCENDER RADIO DE ONDA CORTA 📻 ]");
                            break;
                        case 'basement_boiler':
                            prompt.innerText = tFn("prompt_basement_boiler", "[ CLICK / E: INSPECCIONAR CALDERA DE CALEFACCIÓN 🔥 ]");
                            break;
                        case 'tv':
                            prompt.innerText = window.state.tvOn ? tFn("prompt_tv_off", "[ CLICK / E: APAGAR TV | R: CAMBIAR CANAL ]") : tFn("prompt_tv_on", "[ CLICK / E: PRENDER TV CRT 14\" ]");
                            break;
                        case 'ps1':
                            prompt.innerText = tFn("prompt_ps1_play", "[ CLICK / E PARA JUGAR PS1 // CYBER INVADERS ]");
                            break;
                        case 'cat':
                            prompt.innerText = tFn("prompt_cat_pet", "[ CLICK / E PARA ACARICIAR AL GATO 🐾 ]");
                            break;
                        case 'xmas_gift':
                            prompt.innerText = tFn("prompt_xmas_gift", "[ CLICK / E PARA INSPECCIONAR REGALOS DE NAVIDAD 🎁 ]");
                            break;
                        case 'xmas_cocoa':
                            prompt.innerText = tFn("prompt_xmas_cocoa", "[ CLICK / E PARA TOMAR UN SORBO DE CHOCOLATE CALIENTE ☕ ]");
                            break;
                        case 'halloween_candy':
                            prompt.innerText = tFn("prompt_halloween_candy", "[ CLICK / E PARA TOMAR UN DULCE DE HALLOWEEN 🍬 ]");
                            break;
                        case 'halloween_skull':
                            prompt.innerText = tFn("prompt_halloween_skull", "[ CLICK / E PARA OBSERVAR LA CALAVERA GÓTICA 💀 ]");
                            break;
                        case 'xmas_cookies':
                            prompt.innerText = tFn("prompt_xmas_cookies", "[ CLICK / E PARA PROBAR UNA GALLETA DE JENGIBRE 🍪 ]");
                            break;
                        case 'xmas_wreath':
                            prompt.innerText = tFn("prompt_xmas_wreath", "[ CLICK / E PARA ADMIRAR LA CORONA NAVIDEÑA 🎄 ]");
                            break;
                        case 'halloween_potion':
                            prompt.innerText = tFn("prompt_halloween_potion", "[ CLICK / E PARA EXAMINAR EL FRASCO DE ALQUIMIA 🧪 ]");
                            break;
                        case 'halloween_wreath':
                            prompt.innerText = tFn("prompt_halloween_wreath", "[ CLICK / E PARA INSPECCIONAR LA CORONA DE ESPINAS 🕸 ]");
                            break;
                    }
                    prompt.classList.add('visible');
                }
                return;
            }
        }

        if (focusedObject) {
            focusedObject = null;
            if (prompt) prompt.classList.remove('visible');
        }
    }

    // ---- SENTARSE / LEVANTARSE DE LA PC ----
    function sitDownAtPC() {
        if (isTransitioning || isMonitorMode || isSleepingSequence) return;
        if (window.state && window.state.powerOutage) {
            const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;
            if (window.RoomInteractions && typeof window.RoomInteractions.showNotificationPrompt === 'function') {
                window.RoomInteractions.showNotificationPrompt(
                    tFn("blackout_pc_blocked", "[ ❌ COMPUTADORA SIN ENERGÍA: La casa no tiene luz eléctrica. Restablece los plomos en el sótano ]")
                );
            }
            return;
        }
        if (typeof unmutePCAudio === 'function') unmutePCAudio();
        isTransitioning = true; transitionDirection = 'to_monitor'; transitionProgress = 0;
        if (document.pointerLockElement) document.exitPointerLock();
        const p = document.getElementById('ps1-interact-prompt'); if (p) p.classList.remove('visible');
        startCamPos.copy(camera.position);

        let normYaw = yaw % (Math.PI * 2);
        if (normYaw > Math.PI) normYaw -= Math.PI * 2;
        if (normYaw < -Math.PI) normYaw += Math.PI * 2;
        startCamYaw = normYaw; startCamPitch = pitch;

        targetCamPos.set(-1.2, 1.07, BACK_WALL_Z + 1.75);
    }

    function standUpFromPC() {
        if (isTransitioning) return;
        if (typeof window.dismissWinHelloBubble === 'function') {
            window.dismissWinHelloBubble();
        }
        if ('speechSynthesis' in window) {
            try { window.speechSynthesis.cancel(); } catch(e) {}
        }
        
        // Limpiar el temporizador de amenazas y detener sonidos
        if (window.state) {
            window.state.isAtPC = false;
            window.state.threatActive = false;
            if (window.state.threatTimer) {
                clearTimeout(window.state.threatTimer);
                window.state.threatTimer = null;
            }
        }
        if (typeof stopThreatSound === 'function') stopThreatSound();
        if (typeof window.stopThreatSound === 'function') window.stopThreatSound();
        if (window.realAudioBreathing) {
            try { window.realAudioBreathing.pause(); window.realAudioBreathing.currentTime = 0; } catch(e) {}
        }
        if (window.realAudioFootsteps) {
            try { window.realAudioFootsteps.pause(); window.realAudioFootsteps.currentTime = 0; } catch(e) {}
        }
        const audioCaption = document.getElementById('audio-caption');
        if (audioCaption) {
            audioCaption.classList.add('hidden');
            audioCaption.style.color = "white";
        }

        if (typeof mutePCAudio === 'function') mutePCAudio();
        document.querySelectorAll('audio, video').forEach(media => {
            try { media.pause(); } catch(e) {}
        });

        // Ocultar inmediatamente interfaz de escritorio y mostrar escena 3D para la animación
        const survivalUI = document.getElementById('survival-ui');
        if (survivalUI) {
            survivalUI.classList.add('hidden');
            survivalUI.classList.add('room-hidden');
        }
        const screenBlack = document.getElementById('screen-black');
        if (screenBlack) {
            screenBlack.classList.add('hidden');
        }

        const desktopEl = document.getElementById('screen-desktop');
        if (desktopEl) {
            desktopEl.classList.remove('active');
            desktopEl.classList.add('hidden');
        }

        isMonitorMode = false;
        document.body.classList.remove('ps1-monitor-active');
        const ps1 = document.getElementById('screen-ps1-intro');
        if (ps1) ps1.classList.remove('hidden');

        // Reanudar inmediatamente el audio ambiental de la habitación 3D
        if (window.RoomInteractions && typeof window.RoomInteractions.updateWeatherAudio === 'function') {
            window.RoomInteractions.updateWeatherAudio(rainOpacity, !!(window.state && window.state.windowOpen));
        }

        // Actualizar decoraciones estacionales de la casa para Modo Libre
        applySeasonalEnvironment();

        isTransitioning = true;
        transitionDirection = 'from_monitor';
        transitionProgress = 0;
        startCamPos.set(-1.2, 1.07, BACK_WALL_Z + 1.75);
        startCamYaw = 0;
        startCamPitch = 0;
        targetCamPos.set(SEAT_X, PLAYER_HEIGHT, SEAT_Z);
    }

    function updateSeatTransition(dt) {
        if (!isTransitioning) return;
        transitionProgress += dt * 1.5;
        if (transitionProgress >= 1.0) {
            transitionProgress = 1.0; isTransitioning = false;
            if (transitionDirection === 'to_monitor') {
                isMonitorMode = true; document.body.classList.add('ps1-monitor-active');
                if (window.state) window.state.isAtPC = true;
                const survivalUI = document.getElementById('survival-ui');
                if (survivalUI) survivalUI.classList.remove('room-hidden');
                yaw = 0; pitch = 0; startCamYaw = 0; startCamPitch = 0;
                
                const btnStandUp = document.getElementById('btn-stand-up');
                const startStandUp = document.getElementById('start-menu-standup');
                if (window.state && window.state.freeRoam) {
                    if (btnStandUp) {
                        btnStandUp.classList.add('visible');
                        btnStandUp.style.display = 'inline-flex';
                    }
                    if (startStandUp) startStandUp.style.display = 'block';
                } else {
                    if (btnStandUp) {
                        btnStandUp.classList.remove('visible');
                        btnStandUp.style.display = 'none';
                    }
                    if (startStandUp) startStandUp.style.display = 'none';
                }
                
                setTimeout(() => {
                    const ps1 = document.getElementById('screen-ps1-intro'); if (ps1) ps1.classList.add('hidden');
                    if (typeof window.startFreeRoam === 'function') window.startFreeRoam();
                }, 150);
            } else {
                playerPos.set(SEAT_X, PLAYER_HEIGHT, SEAT_Z);
                camera.position.copy(playerPos);
                yaw = 0; pitch = 0;
                playFootstep();
                requestPointerLock();
            }
            return;
        }
        const t = transitionProgress < 0.5 ? 4 * transitionProgress ** 3 : 1 - (-2 * transitionProgress + 2) ** 3 / 2;
        camera.position.lerpVectors(startCamPos, targetCamPos, t);
        if (transitionDirection === 'to_monitor') { yaw = startCamYaw * (1 - t); pitch = startCamPitch * (1 - t); }
        else { yaw = 0; pitch = 0; }
        const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
        const qp = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitch);
        camera.quaternion.copy(qy).multiply(qp);
    }

    function updateFootsteps(dt) {
        const moving = moveState.forward || moveState.backward || moveState.left || moveState.right;
        if (!moving || !document.pointerLockElement || isTransitioning || isMonitorMode || isBedTransition || isSleepingSequence || window.state.isLyingDown) { footstepTimer = 0.35; return; }
        footstepTimer += dt;
        if (footstepTimer >= 0.45) { footstepTimer = 0; playFootstep(); }
    }

    function playFootstep() {
        if (!introAudioCtx) return;
        try {
            const bs = introAudioCtx.sampleRate * 0.08;
            const buf = introAudioCtx.createBuffer(1, bs, introAudioCtx.sampleRate);
            const d = buf.getChannelData(0);
            for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (introAudioCtx.sampleRate * 0.015));
            const s = introAudioCtx.createBufferSource(); s.buffer = buf;
            const g = introAudioCtx.createGain(); g.gain.value = 0.04;
            const f = introAudioCtx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 400;
            s.connect(f); f.connect(g); g.connect(introAudioCtx.destination); s.start();
        } catch (e) {}
    }

    // ---- MÚSICA PROCEDURAL ÉPICA DE CINEMÁTICA (WEB AUDIO API SYNTH) ----
    function startCinematicEpicMusic() {
        stopCinematicEpicMusic();
        try {
            const ctx = (window.RoomInteractions && typeof window.RoomInteractions.getAudioCtx === 'function')
                ? window.RoomInteractions.getAudioCtx()
                : (introAudioCtx || new (window.AudioContext || window.webkitAudioContext)());
            if (!ctx) return;
            if (ctx.state === 'suspended') ctx.resume();

            const now = ctx.currentTime;
            const masterGain = ctx.createGain();
            masterGain.gain.setValueAtTime(0.0001, now);
            // Volumen maestro potente y nítido para que resalte épicamente sobre la lluvia
            masterGain.gain.linearRampToValueAtTime(0.95, now + 1.8);
            masterGain.connect(ctx.destination);

            const nodes = [];

            // 1. Drone Análogo Pesado y Sub-Bass (Estilo Cyberpunk 90s / Retro Horror)
            const subOsc1 = ctx.createOscillator();
            subOsc1.type = 'sawtooth';
            subOsc1.frequency.setValueAtTime(32.70, now); // C1 profundo

            const subOsc2 = ctx.createOscillator();
            subOsc2.type = 'sine';
            subOsc2.frequency.setValueAtTime(65.41, now); // C2

            const subFilter = ctx.createBiquadFilter();
            subFilter.type = 'lowpass';
            subFilter.frequency.setValueAtTime(180, now);
            subFilter.frequency.linearRampToValueAtTime(460, now + 10.0);
            subFilter.frequency.linearRampToValueAtTime(220, now + 19.0);
            subFilter.Q.value = 4.2;

            const subGain = ctx.createGain();
            subGain.gain.setValueAtTime(0.65, now);

            subOsc1.connect(subFilter);
            subOsc2.connect(subFilter);
            subFilter.connect(subGain);
            subGain.connect(masterGain);

            subOsc1.start(now);
            subOsc2.start(now);
            nodes.push(subOsc1, subOsc2, subFilter, subGain);

            // 2. Acordes Pad Envolventes (Cm -> Ab -> Fm -> Gm -> Cm)
            const padFilter = ctx.createBiquadFilter();
            padFilter.type = 'bandpass';
            padFilter.frequency.setValueAtTime(480, now);
            padFilter.Q.value = 1.6;

            const padGain = ctx.createGain();
            padGain.gain.setValueAtTime(0.001, now);
            padGain.gain.linearRampToValueAtTime(0.55, now + 2.2);

            padFilter.connect(padGain);
            padGain.connect(masterGain);
            nodes.push(padFilter, padGain);

            const chordPitches = [
                [130.81, 155.56, 196.00], // C3, Eb3, G3 (Acto 1: Vista aérea calle lluviosa)
                [103.83, 130.81, 155.56], // Ab2, C3, Eb3 (Acto 2: Seguimiento acera hacia casa)
                [87.31, 103.83, 130.81],  // F2, Ab2, C3 (Acto 3: Ascenso grúa hacia ventana)
                [98.00, 116.54, 146.83],  // G2, Bb2, D3 (Acto 4: Entrada al dormitorio)
                [65.41, 130.81, 155.56]   // C2, C3, Eb3 (Acto 5: Enfoque pantalla CRT)
            ];

            const padOscs = [];
            for (let i = 0; i < 3; i++) {
                const osc = ctx.createOscillator();
                osc.type = 'sawtooth';
                osc.detune.value = (i - 1) * 10; // Coro analógico grueso
                osc.frequency.setValueAtTime(chordPitches[0][i], now);
                osc.connect(padFilter);
                osc.start(now);
                padOscs.push(osc);
                nodes.push(osc);
            }

            let currentChordIdx = 0;
            const chordInterval = setInterval(() => {
                if (!isIntroCinematic) {
                    clearInterval(chordInterval);
                    return;
                }
                currentChordIdx++;
                if (currentChordIdx < chordPitches.length) {
                    const stepNow = ctx.currentTime;
                    for (let i = 0; i < 3; i++) {
                        if (padOscs[i]) {
                            padOscs[i].frequency.exponentialRampToValueAtTime(chordPitches[currentChordIdx][i], stepNow + 1.4);
                        }
                    }
                }
            }, 5500);

            // 3. Arpegiador Retro Chime (Atmósfera de misterio y suspenso digital)
            const arpNotes = [261.63, 311.13, 392.00, 523.25, 622.25, 523.25, 392.00, 311.13];
            let arpIndex = 0;
            const arpInterval = setInterval(() => {
                if (!isIntroCinematic) {
                    clearInterval(arpInterval);
                    return;
                }
                try {
                    const t = ctx.currentTime;
                    const aOsc = ctx.createOscillator();
                    const aGain = ctx.createGain();
                    const aFilter = ctx.createBiquadFilter();

                    aOsc.type = 'triangle';
                    aOsc.frequency.setValueAtTime(arpNotes[arpIndex % arpNotes.length], t);
                    arpIndex++;

                    aFilter.type = 'lowpass';
                    aFilter.frequency.setValueAtTime(1300 + Math.sin(t * 1.8) * 400, t);

                    aGain.gain.setValueAtTime(0.0001, t);
                    aGain.gain.linearRampToValueAtTime(0.22, t + 0.04);
                    aGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);

                    aOsc.connect(aFilter);
                    aFilter.connect(aGain);
                    aGain.connect(masterGain);

                    aOsc.start(t);
                    aOsc.stop(t + 0.45);
                } catch (e) {}
            }, 270);

            // 4. Impacto Cinematográfico Sub-Bass (Trailer Hit)
            function playCinematicBoom() {
                try {
                    const t = ctx.currentTime;
                    const bOsc = ctx.createOscillator();
                    const bGain = ctx.createGain();
                    bOsc.type = 'sine';
                    bOsc.frequency.setValueAtTime(95, t);
                    bOsc.frequency.exponentialRampToValueAtTime(24, t + 2.0);
                    bGain.gain.setValueAtTime(0.85, t);
                    bGain.gain.exponentialRampToValueAtTime(0.001, t + 2.2);
                    bOsc.connect(bGain);
                    bGain.connect(ctx.destination);
                    bOsc.start(t);
                    bOsc.stop(t + 2.3);
                } catch (e) {}
            }

            cinematicMusicNodes = {
                masterGain,
                nodes,
                intervals: [chordInterval, arpInterval],
                playCinematicBoom
            };

            // Impacto inicial al arrancar cinemática
            playCinematicBoom();

        } catch (e) {
            console.warn('Cinematic music synthesizer exception:', e);
        }
    }

    function stopCinematicEpicMusic() {
        if (cinematicMusicNodes) {
            try {
                if (cinematicMusicNodes.intervals) {
                    cinematicMusicNodes.intervals.forEach(int => clearInterval(int));
                }
                if (cinematicMusicNodes.masterGain) {
                    const ctx = (window.RoomInteractions && typeof window.RoomInteractions.getAudioCtx === 'function')
                        ? window.RoomInteractions.getAudioCtx()
                        : (introAudioCtx || null);
                    if (ctx) {
                        cinematicMusicNodes.masterGain.gain.setValueAtTime(cinematicMusicNodes.masterGain.gain.value, ctx.currentTime);
                        cinematicMusicNodes.masterGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
                    }
                }
                setTimeout(() => {
                    if (cinematicMusicNodes && cinematicMusicNodes.nodes) {
                        cinematicMusicNodes.nodes.forEach(n => {
                            try { if (n.stop) n.stop(); if (n.disconnect) n.disconnect(); } catch (e) {}
                        });
                    }
                    cinematicMusicNodes = null;
                }, 850);
            } catch (e) {
                cinematicMusicNodes = null;
            }
        }
    }

    let cinematicPuddleMesh = null;
    let cinematic3DSplashParticles = [];

    // ---- EFECTO DE GOTAS DE AGUA EN LA LENTE DE LA CÁMARA (LENS WATER SPLASH) ----
    function triggerLensWaterSplash() {
        let splashOverlay = document.getElementById('ps1-lens-water-splash');
        if (!splashOverlay) {
            splashOverlay = document.createElement('div');
            splashOverlay.id = 'ps1-lens-water-splash';
            const ps1Screen = document.getElementById('screen-ps1-intro');
            if (ps1Screen) ps1Screen.appendChild(splashOverlay);
        }
        splashOverlay.innerHTML = '';
        splashOverlay.classList.add('active');

        // Generar 30 gotas de agua y 10 hilos de agua resbalando por la lente
        for (let i = 0; i < 30; i++) {
            const drop = document.createElement('div');
            drop.className = 'lens-drop';
            const size = 14 + Math.random() * 30;
            const left = 4 + Math.random() * 92;
            const top = 8 + Math.random() * 82;
            const dur = 2.6 + Math.random() * 1.6;
            drop.style.width = `${size}px`;
            drop.style.height = `${size * (1.15 + Math.random() * 0.35)}px`;
            drop.style.left = `${left}%`;
            drop.style.top = `${top}%`;
            drop.style.setProperty('--duration', `${dur}s`);
            splashOverlay.appendChild(drop);

            if (i % 3 === 0) {
                const streak = document.createElement('div');
                streak.className = 'lens-streak';
                streak.style.left = `${left + size * 0.4}px`;
                streak.style.top = `${top + size * 0.4}px`;
                streak.style.height = `${45 + Math.random() * 80}px`;
                streak.style.setProperty('--duration', `${dur}s`);
                splashOverlay.appendChild(streak);
            }
        }

        // Desvanecer progresivamente tras 3.5s
        setTimeout(() => {
            if (splashOverlay) {
                splashOverlay.classList.remove('active');
                setTimeout(() => { if (splashOverlay) splashOverlay.innerHTML = ''; }, 600);
            }
        }, 3600);
    }

    function spawn3DPuddleSplash(x, y, z) {
        const splashMat = new THREE.MeshBasicMaterial({
            color: 0xc8ecff,
            transparent: true,
            opacity: 0.90,
            side: THREE.DoubleSide
        });

        // Crear abanicos, gotas y cortinas de agua en 3D
        for (let i = 0; i < 55; i++) {
            const pGeo = new THREE.PlaneGeometry(0.14 + Math.random() * 0.35, 0.28 + Math.random() * 0.55);
            const pMesh = new THREE.Mesh(pGeo, splashMat.clone());
            pMesh.position.set(
                x + (Math.random() - 0.5) * 2.2,
                y + 0.12 + Math.random() * 0.5,
                z + (Math.random() - 0.5) * 1.8
            );
            pMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            scene.add(pMesh);

            const speed = 5.5 + Math.random() * 7.5;
            cinematic3DSplashParticles.push({
                mesh: pMesh,
                vx: (Math.random() - 0.25) * 4.2,
                vy: speed,
                vz: (Math.random() - 0.5) * 6.5 - 3.2, // Salpica violentamente hacia la cámara
                rotSpeed: (Math.random() - 0.5) * 12.0,
                life: 1.0,
                decay: 1.0 + Math.random() * 0.7
            });
        }
    }

    // ---- CINEMÁTICA 3D DE APERTURA (MODO HISTORIA — EXPEDIENTE 98) ----
    function startIntroCinematic() {
        isIntroCinematic = true;
        introCinematicTimer = 0;
        cinematicTriggeredFlashes = {};
        cinematicSplashTriggered = false;

        // Limpiar auto y partículas previas si existieran
        if (cinematicSplashCar) {
            try { scene.remove(cinematicSplashCar); } catch(e) {}
            cinematicSplashCar = null;
        }
        if (cinematicPuddleMesh) {
            try { scene.remove(cinematicPuddleMesh); } catch(e) {}
            cinematicPuddleMesh = null;
        }
        cinematic3DSplashParticles.forEach(sp => { try { scene.remove(sp.mesh); } catch(e) {} });
        cinematic3DSplashParticles = [];

        // Iluminación cinematográfica exterior dramática y clara (evita la oscuridad excesiva)
        if (cinematicHemiLight) { try { scene.remove(cinematicHemiLight); } catch(e) {} }
        cinematicHemiLight = new THREE.HemisphereLight(0x789ecc, 0x304052, 1.85);
        scene.add(cinematicHemiLight);

        if (cinematicMoonLight) { try { scene.remove(cinematicMoonLight); } catch(e) {} }
        cinematicMoonLight = new THREE.DirectionalLight(0xa5cbef, 1.50);
        cinematicMoonLight.position.set(16, 32, -4);
        scene.add(cinematicMoonLight);

        // Aumentar radio y brillo cálido de las farolas suburbanas durante las tomas de calle
        outdoorStreetlights.forEach(s => { s.intensity = 5.2; s.distance = 32; });

        const groundY = -4.5;
        const streetZ = -13.2;

        // 1. Charco de agua reflectante sobre el asfalto en el camino del auto
        const puddleGeo = new THREE.PlaneGeometry(5.0, 2.8);
        const puddleMat = new THREE.MeshBasicMaterial({
            color: 0x182c3c,
            transparent: true,
            opacity: 0.75,
            side: THREE.DoubleSide
        });
        cinematicPuddleMesh = new THREE.Mesh(puddleGeo, puddleMat);
        cinematicPuddleMesh.rotation.x = -Math.PI / 2;
        cinematicPuddleMesh.position.set(-5.0, groundY + 0.03, streetZ);
        scene.add(cinematicPuddleMesh);

        // 2. Auto deportivo retro ultra-detallado con efectos volumétricos y halo de luz
        const splashCar = new THREE.Group();
        const scBodyMat = new THREE.MeshLambertMaterial({ color: 0x9e1a1a });
        const scDarkMat = new THREE.MeshLambertMaterial({ color: 0x3d0808 });
        const scGlassMat = new THREE.MeshLambertMaterial({ color: 0x112233, transparent: true, opacity: 0.85 });
        const scChromeMat = new THREE.MeshLambertMaterial({ color: 0xddeeff });
        const scRubberMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
        const scBeamMat = new THREE.MeshBasicMaterial({ color: 0xd8f4ff, transparent: true, opacity: 0.35, side: THREE.DoubleSide });

        // Chasis aerodinámico bajo y veloz
        const scBody = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.54, 1.6), scBodyMat);
        scBody.position.set(0, 0.42, 0); splashCar.add(scBody);

        const scNose = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.38, 1.55), scBodyMat);
        scNose.position.set(1.65, 0.36, 0); splashCar.add(scNose);

        const scCab = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.48, 1.38), scGlassMat);
        scCab.position.set(-0.2, 0.85, 0); splashCar.add(scCab);

        const scRoof = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 1.40), scBodyMat);
        scRoof.position.set(-0.2, 1.10, 0); splashCar.add(scRoof);

        const scSpoiler = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 1.5), scDarkMat);
        scSpoiler.position.set(-1.80, 0.74, 0); splashCar.add(scSpoiler);

        // Faros xenón de alta potencia con haz volumétrico 3D
        const scHeadMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        [-0.54, 0.54].forEach(zOff => {
            const scHl = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.08, 10), scHeadMat);
            scHl.rotation.z = Math.PI / 2; scHl.position.set(2.0, 0.46, zOff); splashCar.add(scHl);

            // Cono de luz volumétrica proyectado hacia adelante en la lluvia
            const coneGeo = new THREE.ConeGeometry(0.9, 6.5, 8, 1, true);
            const coneMesh = new THREE.Mesh(coneGeo, scBeamMat);
            coneMesh.rotation.z = -Math.PI / 2;
            coneMesh.position.set(5.2, 0.46, zOff);
            splashCar.add(coneMesh);
        });

        // Faros traseros LED y estela roja de velocidad
        const scTailMat = new THREE.MeshBasicMaterial({ color: 0xff0022 });
        [-0.52, 0.52].forEach(zOff => {
            const scTl = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.32), scTailMat);
            scTl.position.set(-1.86, 0.46, zOff); splashCar.add(scTl);
        });

        // Estela de luz roja difusa tras el auto (efecto cinematográfico)
        const trailMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(3.8, 1.4),
            new THREE.MeshBasicMaterial({ color: 0xff1133, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
        );
        trailMesh.position.set(-3.6, 0.46, 0);
        splashCar.add(trailMesh);

        // Luz proyectada sobre el pavimento mojado
        const scGroundLight = new THREE.Mesh(
            new THREE.PlaneGeometry(8.5, 3.5),
            new THREE.MeshBasicMaterial({ color: 0xc8eeff, transparent: true, opacity: 0.30, side: THREE.DoubleSide })
        );
        scGroundLight.rotation.x = -Math.PI / 2;
        scGroundLight.position.set(5.5, 0.04, 0);
        splashCar.add(scGroundLight);

        // 4 Ruedas anchas deportivas
        [[-1.15, -0.80], [1.15, -0.80], [-1.15, 0.80], [1.15, 0.80]].forEach(wPos => {
            const tire = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.08, 8, 12), scRubberMat);
            tire.rotation.x = Math.PI / 2; tire.position.set(wPos[0], 0.22, wPos[1]); splashCar.add(tire);
            const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.11, 10), scChromeMat);
            rim.rotation.x = Math.PI / 2; rim.position.set(wPos[0], 0.22, wPos[1]); splashCar.add(rim);
        });

        splashCar.position.set(-62.0, groundY, streetZ);
        scene.add(splashCar);
        cinematicSplashCar = splashCar;

        // Sonido de motor rugiendo y neumáticos acercándose a toda velocidad
        if (window.RoomInteractions && typeof window.RoomInteractions.playApproachingCarSound === 'function') {
            window.RoomInteractions.playApproachingCarSound();
        }

        // Activar visibilidad de la fachada exterior completa durante las tomas aéreas/de calle
        if (playerCompleteHouseGroup) {
            playerCompleteHouseGroup.visible = true;
        }
        if (fullHouseGroup) {
            fullHouseGroup.visible = false;
        }

        // Forzar tormenta con lluvia torrencial ininterrumpida y relámpagos
        currentWeatherState = 'storm';
        if (window.state) window.state.weatherState = 'storm';
        rainOpacity = 1.0;
        weatherTimer = 0;
        weatherCycleDuration = 9999;

        if (rainParticles) {
            rainParticles.visible = true;
            if (rainParticles.material) rainParticles.material.opacity = 1.0;
        }

        if (window.RoomInteractions && typeof window.RoomInteractions.updateWeatherAudio === 'function') {
            window.RoomInteractions.updateWeatherAudio(1.0, false);
        }

        startCinematicEpicMusic();

        const lockPrompt = document.getElementById('ps1-lock-prompt');
        if (lockPrompt) lockPrompt.style.display = 'none';
        const hudPrompt = document.getElementById('ps1-hud');
        if (hudPrompt) hudPrompt.style.display = 'none';

        let overlay = document.getElementById('ps1-cinematic-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'ps1-cinematic-overlay';
            overlay.className = 'ps1-cinematic-overlay';
            overlay.innerHTML = `
                <div class="ps1-cinematic-vignette"></div>
                <div class="ps1-cinematic-bars top"></div>
                <div class="ps1-cinematic-content">
                    <div id="ps1-cinematic-tag" class="ps1-cinematic-tag">${tFn("cinematic_act1_tag", "OCTUBRE 1998 — SUBURBIOS DE LA RED")}</div>
                    <div id="ps1-cinematic-subtitle" class="ps1-cinematic-subtitle"></div>
                </div>
                <div class="ps1-cinematic-bars bottom"></div>
                <div class="ps1-cinematic-skip">${tFn("cinematic_skip_hint", "[ ESPACIO / ESC: SALTAR CINEMÁTICA ]")}</div>
            `;
            const ps1Screen = document.getElementById('screen-ps1-intro');
            if (ps1Screen) ps1Screen.appendChild(overlay);
        } else {
            overlay.classList.remove('hidden');
        }
        
        window.addEventListener('keydown', onCinematicKeyDown);
    }

    function onCinematicKeyDown(e) {
        if (!isIntroCinematic) return;
        if (e.code === 'Space' || e.code === 'Escape' || e.key === ' ' || e.key === 'Escape') {
            endIntroCinematic();
        }
    }

    function endIntroCinematic() {
        if (!isIntroCinematic) return;
        isIntroCinematic = false;
        window.removeEventListener('keydown', onCinematicKeyDown);
        
        stopCinematicEpicMusic();

        // Limpiar elementos de la cinemática
        if (cinematicHemiLight) {
            try { scene.remove(cinematicHemiLight); } catch(e) {}
            cinematicHemiLight = null;
        }
        if (cinematicMoonLight) {
            try { scene.remove(cinematicMoonLight); } catch(e) {}
            cinematicMoonLight = null;
        }
        outdoorStreetlights.forEach(s => { s.intensity = 4.2; s.distance = 22; });

        if (cinematicSplashCar) {
            try { scene.remove(cinematicSplashCar); } catch(e) {}
            cinematicSplashCar = null;
        }
        if (cinematicPuddleMesh) {
            try { scene.remove(cinematicPuddleMesh); } catch(e) {}
            cinematicPuddleMesh = null;
        }
        cinematic3DSplashParticles.forEach(sp => { try { scene.remove(sp.mesh); } catch(e) {} });
        cinematic3DSplashParticles = [];

        const splashOverlay = document.getElementById('ps1-lens-water-splash');
        if (splashOverlay) {
            splashOverlay.classList.remove('active');
            splashOverlay.innerHTML = '';
        }

        // Ocultar estructura exterior de la casa y mostrar el interior completo 100% puro y limpio
        if (playerCompleteHouseGroup) {
            playerCompleteHouseGroup.visible = false;
        }
        if (fullHouseGroup) {
            fullHouseGroup.visible = true;
        }

        const hudPrompt = document.getElementById('ps1-hud');
        if (hudPrompt) hudPrompt.style.display = '';

        const overlay = document.getElementById('ps1-cinematic-overlay');
        if (overlay) overlay.classList.add('hidden');
        
        // Colocar jugador en posición inicial dentro de la habitación
        playerPos.set(0, PLAYER_HEIGHT, 0);
        yaw = 0;
        pitch = 0;
        
        // Mantener lluvia continua y tormenta después de la cinemática
        currentWeatherState = 'storm';
        if (window.state) window.state.weatherState = 'storm';
        weatherTimer = 0;
        weatherCycleDuration = 60 + Math.random() * 40;
        rainOpacity = 1.0;

        // Restaurar estado de audio ambiental del clima normal
        if (window.RoomInteractions && typeof window.RoomInteractions.updateWeatherAudio === 'function') {
            window.RoomInteractions.updateWeatherAudio(rainOpacity, !!(window.state && window.state.windowOpen));
        }

        if (window.state) {
            if (!window.state.storyMode) {
                if (window.StoryMode && typeof window.StoryMode.initStoryState === 'function') {
                    window.StoryMode.initStoryState();
                }
            }
            if (window.state.storyMode) {
                window.state.storyMode.cinemaWatched = true;
            }
        }
        
        // Notificación de inicio de investigación
        if (window.Desktop && typeof window.Desktop.showToast === 'function') {
            window.Desktop.showToast(tFn("toast_expediente_active_long", '📁 Expediente 98 activo. Acércate a la PC para comenzar a descifrar los archivos.'), 6000);
        } else if (window.Survival && typeof window.Survival.showToast === 'function') {
            window.Survival.showToast(tFn("toast_expediente_active", '📁 Expediente 98 activo. Acércate a la PC.'));
        } else {
            const toast = document.getElementById('ps1-toast');
            if (toast) {
                toast.innerText = tFn("toast_expediente_active", '📁 Expediente 98 activo. Acércate a la PC.');
                toast.classList.remove('hidden');
                setTimeout(() => { toast.classList.add('hidden'); }, 5000);
            }
        }
        
        requestPointerLock();
    }

    function updateIntroCinematic(dt) {
        if (!isIntroCinematic) return;
        introCinematicTimer += dt;
        const p = Math.min(introCinematicTimer / INTRO_CINEMATIC_DURATION, 1.0);
        const subEl = document.getElementById('ps1-cinematic-subtitle');
        const tagEl = document.getElementById('ps1-cinematic-tag');
        const groundY = -4.5;
        const streetZ = -13.2;

        // Animación del auto veloz y la salpicadura de charco en la cinemática
        if (cinematicSplashCar && p <= 0.35) {
            cinematicSplashCar.position.x += 34.0 * dt;

            // Al cruzar el charco en x = -4.5
            if (cinematicSplashCar.position.x >= -4.5 && !cinematicSplashTriggered) {
                cinematicSplashTriggered = true;
                if (window.RoomInteractions && typeof window.RoomInteractions.playPuddleSplashSound === 'function') {
                    window.RoomInteractions.playPuddleSplashSound();
                }
                triggerLightningFlash();
                if (cinematicMusicNodes && typeof cinematicMusicNodes.playCinematicBoom === 'function') {
                    cinematicMusicNodes.playCinematicBoom();
                }
                spawn3DPuddleSplash(cinematicSplashCar.position.x, groundY + 0.1, streetZ);
                triggerLensWaterSplash();
            }
        }

        // Actualizar partículas 3D de agua
        for (let i = cinematic3DSplashParticles.length - 1; i >= 0; i--) {
            const sp = cinematic3DSplashParticles[i];
            sp.mesh.position.x += sp.vx * dt;
            sp.mesh.position.y += sp.vy * dt;
            sp.mesh.position.z += sp.vz * dt;
            sp.vy -= 14.0 * dt; // Gravedad
            sp.mesh.rotation.z += sp.rotSpeed * dt;
            sp.life -= sp.decay * dt;
            if (sp.mesh.material) sp.mesh.material.opacity = Math.max(0, sp.life * 0.85);
            if (sp.life <= 0 || sp.mesh.position.y < groundY - 0.5) {
                scene.remove(sp.mesh);
                cinematic3DSplashParticles.splice(i, 1);
            }
        }

        // Al entrar al cuarto (Acto 4 y 5), alternar de la fachada exterior al interior completo
        if (playerCompleteHouseGroup) {
            playerCompleteHouseGroup.visible = (p < 0.65);
        }
        if (fullHouseGroup) {
            fullHouseGroup.visible = (p >= 0.65);
        }

        // Modular suavemente la intensidad de las luces cinematográficas al entrar a la habitación
        if (cinematicHemiLight) {
            cinematicHemiLight.intensity = (p < 0.60) ? 1.85 : Math.max(0.4, 1.85 - (p - 0.60) * 4.5);
        }
        if (cinematicMoonLight) {
            cinematicMoonLight.intensity = (p < 0.60) ? 1.50 : Math.max(0.2, 1.50 - (p - 0.60) * 3.8);
        }

        // Disparadores de Relámpagos Sincronizados con la Cinemática
        if (p >= 0.28 && !cinematicTriggeredFlashes['f2']) {
            cinematicTriggeredFlashes['f2'] = true;
            triggerLightningFlash();
        }
        if (p >= 0.52 && !cinematicTriggeredFlashes['f3']) {
            cinematicTriggeredFlashes['f3'] = true;
            triggerLightningFlash();
        }
        if (p >= 0.83 && !cinematicTriggeredFlashes['f4']) {
            cinematicTriggeredFlashes['f4'] = true;
            if (cinematicMusicNodes && typeof cinematicMusicNodes.playCinematicBoom === 'function') {
                cinematicMusicNodes.playCinematicBoom();
            }
        }

        if (p < 0.20) {
            // ========================================================
            // ACTO 1: PLANO A RAS DE ASFALTO CON AUTO VELOZ CRUZANDO LA CALLE (0 - 5.6s)
            // ========================================================
            const t = p / 0.20;
            const easeT = t * t * (3 - 2 * t);
            // Cámara a ras de acera mirando a lo largo de la calle mojada, viendo aproximarse y pasar el auto
            const camX = -9.0 + 4.5 * easeT;
            let camY = -3.75 + 0.15 * easeT;
            const camZ = -10.5 - 0.3 * easeT;
            let curYaw = -1.35 + 1.15 * easeT;
            let curPitch = 0.08 - 0.02 * easeT;

            // Camera Shake cinematográfico al rugir el motor y pasar el auto justo delante
            if (cinematicSplashCar && Math.abs(cinematicSplashCar.position.x) < 18.0) {
                const shakePower = (1.0 - Math.abs(cinematicSplashCar.position.x) / 18.0) * 0.055;
                camY += Math.sin(introCinematicTimer * 42.0) * shakePower;
                curYaw += Math.cos(introCinematicTimer * 38.0) * (shakePower * 0.4);
                curPitch += Math.sin(introCinematicTimer * 50.0) * (shakePower * 0.3);
            }

            camera.position.set(camX, camY, camZ);
            yaw = curYaw;
            pitch = curPitch;

            if (tagEl) tagEl.innerText = tFn("cinematic_act1_tag", "OCTUBRE 1998 — SUBURBIOS DE LA RED");
            if (subEl) subEl.innerHTML = tFn("cinematic_act1_sub", "> UNA TORMENTA ELÉCTRICA HISTÓRICA AISLA LA CIUDAD...<br><span style='color:#7fe6ff; font-size:1.05rem;'>Líneas telefónicas y repetidores saturados por tráfico desconocido en frecuencias no indexadas.</span>");

        } else if (p < 0.42) {
            // ========================================================
            // ACTO 2: TRANSICIÓN Y SEGUIMIENTO EN ACERA HACIA LA CASA (5.6s - 11.8s)
            // ========================================================
            const t = (p - 0.20) / 0.22;
            const easeT = t * t * (3 - 2 * t);
            // La cámara gira suavemente desde la calle para encuadrar la casa de 2 pisos con la luz cálida del porche
            const camX = -4.5 + (0.8 - (-4.5)) * easeT;
            const camY = -3.6 + (-2.6 - (-3.6)) * easeT;
            const camZ = -10.8 + (-9.2 - (-10.8)) * easeT;
            camera.position.set(camX, camY, camZ);
            yaw = -0.20 + (Math.PI - (-0.20)) * easeT;
            pitch = 0.06 + (0.24 - 0.06) * easeT;

            if (tagEl) tagEl.innerText = tFn("cinematic_act2_tag", "INTRUSIÓN EN EL NODO DOMÉSTICO");
            if (subEl) subEl.innerHTML = tFn("cinematic_act2_sub", "> UN VOLCADO DE MEMORIA NO AUTORIZADO FUE INYECTADO EN TU PC.<br><span style='color:#ffcc00; font-size:1.05rem;'>Alguien burló la seguridad mientras la tormenta provocaba caídas de tensión en el sector.</span>");

        } else if (p < 0.65) {
            // ========================================================
            // ACTO 3: ELEVACIÓN / GRÚA VERTICAL HACIA LA VENTANA (11.8s - 18.2s)
            // ========================================================
            const t = (p - 0.42) / 0.23;
            const easeT = t * t * (3 - 2 * t);
            // Ascenso vertical majestuoso hacia la ventana iluminada del 2do piso
            const camX = 0.8;
            const camY = -2.6 + (WIN_CENTER_Y - (-2.6)) * easeT;
            const camZ = -9.2 + (-3.3 - (-9.2)) * easeT;
            camera.position.set(camX, camY, camZ);
            yaw = Math.PI;
            pitch = 0.20 * (1 - easeT);

            if (tagEl) tagEl.innerText = tFn("cinematic_act3_tag", "EXPEDIENTE 98 — CASO DARK_LINK");
            if (subEl) subEl.innerHTML = tFn("cinematic_act3_sub", "> NO ES UN SIMPLE FORO CLANDESTINO DE HACKERS.<br><span style='color:#ff5577; font-size:1.05rem;'>Descubriste un experimento clasificado de vigilancia masiva y control biológico.</span>");

        } else if (p < 0.83) {
            // ========================================================
            // ACTO 4: ATRAVESANDO LA VENTANA HACIA EL DORMITORIO 90s (18.2s - 23.2s)
            // ========================================================
            const t = (p - 0.65) / 0.18;
            const easeT = t * t * (3 - 2 * t);
            // Cruce fluido del cristal e ingreso a la habitación cálida y en penumbra
            const camX = 0.8 + (-0.6) * easeT;
            const camY = WIN_CENTER_Y + (1.25 - WIN_CENTER_Y) * easeT;
            const camZ = -3.3 + (0.4 - (-3.3)) * easeT;
            camera.position.set(camX, camY, camZ);
            yaw = Math.PI * (1 - easeT) + (-1.85) * easeT;
            pitch = -0.06 * easeT;

            if (tagEl) tagEl.innerText = tFn("cinematic_act4_tag", "EL RASTREO ESTÁ ACTIVO");
            if (subEl) subEl.innerHTML = tFn("cinematic_act4_sub", "> CADA ACCIÓN EN LA RED TIENE CONSECUENCIAS FÍSICAS.<br><span style='color:#d0f0ff; font-size:1.05rem;'>La entidad monitoriza los puertos abiertos... mantén la puerta trabada y vigila tu entorno.</span>");

        } else if (p < 1.0) {
            // ========================================================
            // ACTO 5: DOLLY DIRECTO HACIA EL MONITOR CRT Y TERMINAL (23.2s - 28.0s)
            // ========================================================
            const t = (p - 0.83) / 0.17;
            const easeT = t * t * (3 - 2 * t);
            // Encuadre cinematográfico final frente al monitor CRT
            const camX = 0.2 * (1 - easeT) + 0.0 * easeT;
            const camY = 1.25 * (1 - easeT) + 1.12 * easeT;
            const camZ = 0.4 * (1 - easeT) + (-1.25) * easeT;
            camera.position.set(camX, camY, camZ);
            yaw = -1.85 * (1 - easeT) + 0.0 * easeT;
            pitch = -0.05 * (1 - easeT);

            if (tagEl) tagEl.innerText = tFn("cinematic_act5_tag", "MISIÓN ASIGNADA — EXPEDIENTE 98");
            if (subEl) subEl.innerHTML = tFn("cinematic_act5_sub", "> SIÉNTATE FRENTE AL MONITOR Y ABRE EL EXPEDIENTE.<br><span style='color:#00ff66; font-size:1.15rem; font-weight:bold;'>Descifra el volcado de memoria, contacta a la resistencia y sobrevive a la noche.</span>");

        } else {
            endIntroCinematic();
            return;
        }

        const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
        const qp = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitch);
        camera.quaternion.copy(qy).multiply(qp);
    }

    // ---- BUCLE DE ANIMACIÓN (OPTIMIZADO: FPS CAP AUTOMÁTICO + THROTTLING ADAPTATIVO POR HARDWARE) ----
    function animate() {
        if (!isRunning || !window.state || !window.state.freeRoam) {
            isRunning = false;
            return;
        }
        requestAnimationFrame(animate);

        // ---- FPS CAP: Limitado según el tier de hardware detectado ----
        const _now = performance.now();
        if (_now - _lastRenderTime < _TARGET_FRAME_MS) return;
        _lastRenderTime = _now;

        _animFrameCount++;
        const dt = Math.min(clock.getDelta(), 0.1);

        // ---- CALIDAD ADAPTATIVA BIDIRECCIONAL: sube o baja según rendimiento real ----
        _fpsAccum += dt;
        _fpsSamples++;
        if (_fpsAccum >= 3.0) {
            const avgFps = _fpsSamples / _fpsAccum;
            const targetFpsLow = _hwProfile.fpsCap * 0.6;  // Umbral bajo (ej: 30*0.6 = 18 FPS)
            const targetFpsHigh = _hwProfile.fpsCap * 0.9; // Umbral alto (ej: 30*0.9 = 27 FPS)

            if (avgFps < targetFpsLow && !_qualityReduced && renderer) {
                // BAJAR calidad — la PC no da abasto
                _adaptivePixelRatio = Math.max(_hwProfile.minPixelRatio, _adaptivePixelRatio - 0.1);
                renderer.setPixelRatio(_adaptivePixelRatio);
                renderer.setSize(window.innerWidth, window.innerHeight);
                _qualityReduced = true;
                console.log(`[PS1 AutoPerf] ⬇ Calidad reducida (FPS: ${avgFps.toFixed(1)}) — pixelRatio: ${_adaptivePixelRatio.toFixed(2)}`);
            } else if (avgFps > targetFpsHigh && !_qualityBoosted && _qualityReduced && renderer) {
                // SUBIR calidad — la PC se estabilizó después de la reducción
                _adaptivePixelRatio = Math.min(_hwProfile.pixelRatio, _adaptivePixelRatio + 0.05);
                renderer.setPixelRatio(_adaptivePixelRatio);
                renderer.setSize(window.innerWidth, window.innerHeight);
                if (_adaptivePixelRatio >= _hwProfile.pixelRatio) {
                    _qualityReduced = false;
                    _qualityBoosted = true;
                }
                console.log(`[PS1 AutoPerf] ⬆ Calidad restaurada (FPS: ${avgFps.toFixed(1)}) — pixelRatio: ${_adaptivePixelRatio.toFixed(2)}`);
            }
            _fpsAccum = 0;
            _fpsSamples = 0;
        }

        // ---- MODO MONITOR: canvas 3D oculto → no renderizar (ahorra ~100% GPU cuando está sentado en la PC) ----
        if (isMonitorMode) {
            updateWeather(dt);
            flickerTimer += dt;
            return;
        }
        if (isIntroCinematic) {
            updateIntroCinematic(dt);
        } else {
            updateSeatTransition(dt);
            updateBedTransition(dt);
            updateMovement(dt);
            updateCamera();
        }
        // ---- SISTEMAS CON THROTTLING POR PRIORIDAD ----
        updateOutdoorEnvironment(dt);

        // Hora del día: throttle adaptativo según hardware
        if (_animFrameCount % _hwProfile.throttleTimeOfDay === 0) {
            updateTimeOfDaySync();
        }

        updateInteractiveObjects(dt);

        // Textura del OS en el monitor CRT 3D: throttle adaptativo según hardware
        if (_animFrameCount % _hwProfile.throttleOSCanvas === 0) {
            updateDynamicOSCanvas();
        }

        updateFootsteps(dt);

        // Raycasting de proximidad: throttle adaptativo según hardware
        if (_animFrameCount % _hwProfile.throttleRaycast === 0) {
            checkInteractionProximity();
        }

        updateParanormalEntity(dt);

        // Modulación atmosférica de la luz de emergencia en la pesadilla de la puerta
        if (isNightmareActive && nightmareVariant === 'corridor_door' && nightmareLightObj && !nightmareInteractTriggered) {
            nightmareLightObj.intensity = 4.8 + Math.sin(Date.now() * 0.007) * 0.8;
        }

        // Luces navideñas parpadeantes: throttle adaptativo según hardware
        if (_animFrameCount % _hwProfile.throttleChristmas === 0 && seasonalBlinkLights && seasonalBlinkLights.length > 0) {
            const season = (typeof window.getCurrentActiveSeason === 'function') ? window.getCurrentActiveSeason() : 'default';
            if (season === 'christmas') {
                const nowSec = Date.now() * 0.003;
                seasonalBlinkLights.forEach(bl => {
                    if (bl.mesh && bl.mesh.material) {
                        const on = Math.sin(nowSec * 3.5 + bl.offset * 1.3) > -0.15;
                        bl.mesh.material.opacity = on ? 1.0 : 0.25;
                        bl.mesh.material.transparent = true;
                    }
                });
            }
        }

        // Animación suave de puertas y electrodomésticos interactivos de la casa
        if (frontDoorPivot) {
            frontDoorPivot.rotation.y = THREE.MathUtils.lerp(frontDoorPivot.rotation.y, frontDoorOpen ? -Math.PI / 2 : 0.0, dt * 4.0);
        }
        if (fridgeDoorPivot) {
            fridgeDoorPivot.rotation.y = THREE.MathUtils.lerp(fridgeDoorPivot.rotation.y, fridgeOpen ? 1.8 : 0.0, dt * 4.5);
        }
        if (livingTvOn && livingTvLight) {
            livingTvLight.intensity = 1.45 + Math.sin(Date.now() * 0.015) * 0.25;
        }

        renderer.render(scene, camera);
    }

    // ---- INIT ----
    function init(forceCinematic = true) {
        if (isRunning) return;
        const container = document.getElementById('screen-ps1-intro');
        if (!container) return;

        // ---- DETECCIÓN AUTOMÁTICA DE HARDWARE (una sola vez al iniciar) ----
        const detectedTier = _detectHardwareTier();
        _applyHardwareProfile(detectedTier);

        isRunning = true;
        _animFrameCount = 0;
        _lastRenderTime = 0;
        _fpsAccum = 0;
        _fpsSamples = 0;
        _qualityReduced = false;
        _qualityBoosted = false;
        isMonitorMode = false;
        isTransitioning = false;
        isBedTransition = false;
        isSleepingSequence = false;
        weatherTimer = 0;
        currentWeatherState = 'clear';
        rainOpacity = 0.0;
        bedCooldownTimer = 0;
        focusedObject = null;

        const survivalUI = document.getElementById('survival-ui');
        if (survivalUI) {
            survivalUI.classList.add('hidden');
            survivalUI.classList.add('room-hidden');
        }
        const screenBlack = document.getElementById('screen-black');
        if (screenBlack) {
            screenBlack.classList.add('hidden');
        }

        const promptEl = document.getElementById('ps1-interact-prompt');
        if (promptEl) {
            promptEl.classList.remove('visible');
            promptEl.innerText = '';
        }
        const eyelidsEl = document.getElementById('ps1-eyelids');
        if (eyelidsEl) {
            eyelidsEl.className = '';
        }
        moveState = { forward: false, backward: false, left: false, right: false };
        yaw = 0; pitch = 0;
        interactables = [];
        outdoorCars = [];
        outdoorStreetlights = [];
        outdoorPorchLights = [];
        outdoorHouseWindows = [];
        outdoorTrees = [];
        outdoorClouds = [];
        outdoorBirds = [];
        outdoorChimneySmokes = [];
        outdoorFireflies = null;
        outdoorPedestrians = [];
        outdoorPedestrian = null;
        outdoorPowerlines = [];
        outdoorTvWindow = null;
        outdoorTvLight = null;
        outdoorPuddles = [];
        towerBeaconLight = null;
        mountainMeshes = [];
        windTimer = 0;
        playerPos.set(0, PLAYER_HEIGHT, 0);

        scene = new THREE.Scene();
        skyColorCurrent = new THREE.Color(0x141e30);
        scene.background = skyColorCurrent;
        clock = new THREE.Clock();
        camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 400);
        scene.add(camera);

        const canvas = document.getElementById('ps1-canvas');
        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(_adaptivePixelRatio);

        window.removeEventListener('resize', onWindowResize);
        window.addEventListener('resize', onWindowResize);

        // Crear grupos dedicados para dormitorio y exterior
        bedroomGroup = new THREE.Group();
        bedroomGroup.name = 'bedroomGroup';
        scene.add(bedroomGroup);

        outdoorGroup = new THREE.Group();
        outdoorGroup.name = 'outdoorGroup';
        scene.add(outdoorGroup);

        const rawSceneAdd = scene.add.bind(scene);
        scene.add = function (...args) {
            if (currentSceneAddTarget) {
                currentSceneAddTarget.add(...args);
            } else {
                rawSceneAdd(...args);
            }
        };

        currentSceneAddTarget = bedroomGroup;
        buildBedroom();

        currentSceneAddTarget = outdoorGroup;
        buildOutdoorEnvironment();

        currentSceneAddTarget = null;
        buildSeasonalDecorations();

        // Inicializar niebla atmosférica retro 3D
        updateRetroFog();

        raycaster = new THREE.Raycaster(); raycaster.far = INTERACT_DIST + 1;
        setupControls(); setupInteraction();
        try { introAudioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}

        const btn = document.getElementById('btn-stand-up');
        if (btn) { btn.removeEventListener('click', standUpFromPC); btn.addEventListener('click', standUpFromPC); }
        window.removeEventListener('keydown', onGlobalKeyDown);
        window.addEventListener('keydown', onGlobalKeyDown);

        if (window.RoomInteractions && typeof window.RoomInteractions.updateWeatherAudio === 'function') {
            window.RoomInteractions.updateWeatherAudio(rainOpacity, !!(window.state && window.state.windowOpen));
        }

        if (window.state && window.state.inventory && window.state.inventory.includes('flashlight')) {
            hasFlashlight = true;
            setupFlashlightSystem();
        }
        updateInventoryHUD();

        // Ejecutar cinemática inicial en primera entrada a Sandbox / Modo Libre
        if (forceCinematic || !window.state || !window.state.storyMode || !window.state.storyMode.cinemaWatched) {
            startIntroCinematic();
        } else {
            if (playerCompleteHouseGroup) playerCompleteHouseGroup.visible = false;
            if (fullHouseGroup) fullHouseGroup.visible = true;
            requestPointerLock();
        }

        animate();
    }

    function onWindowResize() {
        if (camera && renderer) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    function onGlobalKeyDown(e) {
        // La tecla Escape ya no sirve para levantarse de la silla, solo el botón UI
    }

    function cleanup() {
        isRunning = false; isMonitorMode = false; isTransitioning = false; isSleepingSequence = false;
        stopCinematicEpicMusic();
        if (isIntroCinematic) {
            window.removeEventListener('keydown', onCinematicKeyDown);
            isIntroCinematic = false;
        }
        const cinOverlay = document.getElementById('ps1-cinematic-overlay');
        if (cinOverlay) cinOverlay.classList.add('hidden');
        document.body.classList.remove('ps1-monitor-active');
        const eyelidsEl = document.getElementById('ps1-eyelids');
        if (eyelidsEl) eyelidsEl.className = '';
        teardownControls(); teardownInteraction();
        if (introAudioCtx) {
            try { introAudioCtx.close(); } catch (e) {}
            introAudioCtx = null;
        }
        if (window.RoomInteractions && typeof window.RoomInteractions.stopAllAmbientAudio === 'function') {
            window.RoomInteractions.stopAllAmbientAudio();
        }
        if (renderer) {
            try { renderer.dispose(); } catch (e) {}
            renderer = null;
        }
        scene = null; camera = null;
        sunGroup = null; sunMesh = null; sunCoronaMesh = null; sunGlowMesh = null;
        moonGroup = null; moonMesh = null; moonGlowMesh = null;
        interactables = [];
        outdoorCars = [];
        outdoorStreetlights = [];
        outdoorPorchLights = [];
        outdoorHouseWindows = [];
        outdoorTrees = [];
        outdoorClouds = [];
        outdoorBirds = [];
        outdoorChimneySmokes = [];
        outdoorFireflies = null;
        outdoorPedestrians = [];
        outdoorPedestrian = null;
        outdoorPowerlines = [];
        outdoorTvWindow = null;
        outdoorTvLight = null;
        outdoorPuddles = [];
        towerBeaconLight = null;
        mountainMeshes = [];
        bedroomGroup = null;
        outdoorGroup = null;
        retroFog = null;
        cleanupNightmareObjects();
    }

    // ---- API GLOBAL ----
    window.startPS1Intro = function (forceCinematic = true) {
        if (typeof stopMenuMusic === 'function') stopMenuMusic();
        document.body.classList.remove('menu-glitch-active');
        if (typeof triggerMenuGlitchVisualEffect === 'function') triggerMenuGlitchVisualEffect(false);
        if (typeof showScreen === 'function') showScreen('ps1_intro');
        const c = document.getElementById('screen-ps1-intro');
        if (c) { c.classList.remove('hidden'); c.classList.add('active'); }
        if (window.state) {
            window.state.freeRoam = true;
            if (forceCinematic && window.state.storyMode) {
                window.state.storyMode.cinemaWatched = false;
            }
        }
        if (window.RoomInteractions && typeof window.RoomInteractions.getAudioCtx === 'function') {
            window.RoomInteractions.getAudioCtx();
        }
        if (window.RoomInteractions && typeof window.RoomInteractions.updateWeatherAudio === 'function') {
            window.RoomInteractions.updateWeatherAudio(0.0, false);
        }
        if (isRunning) {
            cleanup();
        }
        init(forceCinematic);
    };
    window.cleanupPS1Intro = cleanup;
    window.standUpFromPC = standUpFromPC;
    window.sitDownAtPC = sitDownAtPC;
    window.triggerNightmare = function (variant) {
        if (!isRunning) {
            if (typeof window.startPS1Intro === 'function') window.startPS1Intro();
        }
        setTimeout(() => {
            const executeWakeup = (wasNightmare = true) => {
                cleanupNightmareObjects();
                isNightmareActive = false;
                nightmareInteractive = false;
                nightmareInteractTriggered = false;
                window.state.isLyingDown = true;
                camera.position.set(HALF_W - 0.55, 0.55, 2.3);
                playerPos.set(HALF_W - 1.2, PLAYER_HEIGHT, 1.4);
                pitch = bedCamTargetPitch;
                yaw = 0;
                setNightmareSceneState(false);
                const eyelids = document.getElementById('ps1-eyelids');
                if (eyelids) eyelids.className = 'opening';
                setTimeout(() => { if (eyelids) eyelids.className = ''; }, 1200);
                if (window.RoomInteractions) {
                    window.RoomInteractions.showNotificationPrompt(tFn("nightmare_waking_gasp", "[ 😱 ¡DESPIERTAS DE GOLPE EMPAPADO EN SUDOR! Solo fue una pesadilla... ]"));
                }
            };
            startNightmareSequence(executeWakeup, variant);
        }, 300);
    };

    // Exponer API para eventos paranormales estilo The Mortuary Assistant
    window.triggerParanormalEvent = function(spot, variant) {
        if (typeof spawnParanormalEntity === 'function') {
            spawnParanormalEntity(spot, variant);
            console.log("👻 Entidad paranormal invocada en spot:", spot || "aleatorio", "variante:", variant || "siguiente");
        }
    };
    window.dismissParanormalEntity = function() {
        if (typeof cleanupParanormalEntity === 'function') {
            cleanupParanormalEntity();
        }
    };
})();
