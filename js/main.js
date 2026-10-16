// --- MAIN ENTRY POINT (GAME BOOTSTRAPPING, CLOCKS, MENU ANIMATIONS) ---

let menuLogsPaused = false;
let menuAmbientLogsIntervalId = null;
let menuCanvas = null;
let menuCanvasCtx = null;
let menuCanvasAnimId = null;
let menuMousePos = { x: null, y: null };
let gridOffset = 0;
let gridPackets = [];

// ====================================================
// --- SISTEMA DE RELOJ IN-GAME ---
// ====================================================
function formatTime(minutes) {
    let h = Math.floor(minutes / 60) % 24;
    let m = minutes % 60;
    let ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function startGameClock() {
    if (state.gameClockInterval) clearInterval(state.gameClockInterval);
    const clockEl = document.getElementById('clock');
    if (!clockEl) return;
    
    clockEl.innerText = formatTime(state.gameTimeMinutes);
    
    state.gameClockInterval = setInterval(() => {
        state.gameTimeMinutes++;
        clockEl.innerText = formatTime(state.gameTimeMinutes);
        checkTimeBasedEvents();
    }, 5000); // 1 minuto in-game = 5 segundos reales
}

function checkTimeBasedEvents() {
    if (state.gameTimeMinutes === 210) { // 3:30 AM
        if (state.freeRoam && typeof postChatMessage === 'function') {
            postChatMessage('Sistema: EVENTO DETECTADO. Actividad inusual en los foros principales.', '#ffcc00');
        }
    } else if (state.gameTimeMinutes === 240) { // 4:00 AM
        if (state.freeRoam && typeof postChatMessage === 'function') {
            postChatMessage('Admin: Los drops de BTC han sido incrementados temporalmente.', 'lime');
        }
    } else if (state.gameTimeMinutes === 270) { // 4:30 AM
        if (state.freeRoam && typeof postChatMessage === 'function') {
            postChatMessage('Ghost: Alguien está intentando rastrear nuestras conexiones. Cuidado con lo que descargan.', 'red');
        }
    }
}

// ====================================================
// --- REGISTRO DE LOGS DINÁMICOS DEL MENÚ ---
// ====================================================
const menuLogs = [
    "Establishing secure handshake with onion gateways...",
    "Routing traffic through proxy node: 184.22.9.101...",
    "Bypassing local ISP firewalls... DONE.",
    "Loading military-grade PGP decryption algorithm...",
    "Scanning network ports 80, 443, 8080, 9001...",
    "Warning: Unencrypted connection detected.",
    "Webcam handshake authorization... PENDING.",
    "Mounting secure virtual file system (VFS)...",
    "Pre-fetching darknet forum comments...",
    "System developers: Bonamaison Marconi & Gandini detected.",
    "Sandbox protocol: Initialized successfully."
];

function initMenuAmbientLogs() {
    const container = document.getElementById('menu-terminal-lines');
    if (!container) return;
    
    if (menuAmbientLogsIntervalId) {
        clearInterval(menuAmbientLogsIntervalId);
    }
    
    menuAmbientLogsIntervalId = setInterval(() => {
        if (menuLogsPaused) return;
        
        const menuScreen = document.getElementById('screen-menu');
        if (menuScreen && menuScreen.classList.contains('active')) {
            const line = document.createElement('p');
            line.innerText = `> ${menuLogs[Math.floor(Math.random() * menuLogs.length)]}`;
            container.appendChild(line);
            
            if (container.children.length > 8) {
                container.removeChild(container.firstChild);
            }
            
            container.scrollTop = container.scrollHeight;
        }
    }, 2800);
}

// ====================================================
// --- SIMULACIÓN DE RED CIBERNÉTICA EN CANVAS (FONDO) ---
// ====================================================
function initMenuCyberCanvas() {
    menuCanvas = document.getElementById('menu-cyber-canvas');
    if (!menuCanvas) return;
    
    menuCanvasCtx = menuCanvas.getContext('2d');
    
    let horizonX = menuCanvas.width / 2;
    let horizonY = menuCanvas.height * 0.35;
    gridPackets = [];
    
    const resizeCanvas = () => {
        if (!menuCanvas) return;
        const rect = menuCanvas.parentElement.getBoundingClientRect();
        menuCanvas.width = rect.width;
        menuCanvas.height = rect.height;
        horizonX = menuCanvas.width / 2;
        horizonY = menuCanvas.height * 0.35;
    };
    
    resizeCanvas();
    window.removeEventListener('resize', resizeCanvas);
    window.addEventListener('resize', resizeCanvas);
    
    const menuScreen = document.getElementById('screen-menu');
    if (menuScreen) {
        const onMouseMove = (e) => {
            const rect = menuCanvas.getBoundingClientRect();
            menuMousePos.x = e.clientX - rect.left;
            menuMousePos.y = e.clientY - rect.top;
        };
        const onMouseLeave = () => {
            menuMousePos.x = null;
            menuMousePos.y = null;
        };
        
        menuScreen.removeEventListener('mousemove', onMouseMove);
        menuScreen.removeEventListener('mouseleave', onMouseLeave);
        menuScreen.addEventListener('mousemove', onMouseMove);
        menuScreen.addEventListener('mouseleave', onMouseLeave);
    }
    
    if (menuCanvasAnimId) {
        cancelAnimationFrame(menuCanvasAnimId);
    }
    
    const drawMatrixGrid = () => {
        if (!menuCanvas || !menuCanvasCtx) return;
        
        if (menuScreen && !menuScreen.classList.contains('active')) {
            cancelAnimationFrame(menuCanvasAnimId);
            return;
        }
        
        const isGlitching = document.body.classList.contains('menu-glitch-active');
        
        menuCanvasCtx.fillStyle = isGlitching ? 'rgba(25, 0, 0, 0.28)' : 'rgba(0, 6, 1, 0.15)';
        menuCanvasCtx.fillRect(0, 0, menuCanvas.width, menuCanvas.height);
        
        let targetHorizonX = menuCanvas.width / 2;
        let targetHorizonY = menuCanvas.height * 0.35;
        
        if (menuMousePos.x !== null && menuMousePos.y !== null) {
            targetHorizonX += (menuMousePos.x - menuCanvas.width / 2) * 0.28;
            targetHorizonY += (menuMousePos.y - menuCanvas.height / 2) * 0.18;
        }
        
        if (isGlitching) {
            targetHorizonX += (Math.random() - 0.5) * 45;
            targetHorizonY += (Math.random() - 0.5) * 45;
        }
        
        horizonX += (targetHorizonX - horizonX) * 0.08;
        horizonY += (targetHorizonY - horizonY) * 0.08;
        
        gridOffset += isGlitching ? 0.025 : 0.007;
        if (gridOffset >= 1.0) gridOffset -= 1.0;
        
        const numHorizontalLines = 16;
        for (let i = 0; i < numHorizontalLines; i++) {
            const progress = (i + gridOffset) / numHorizontalLines;
            const y = horizonY + (menuCanvas.height - horizonY) * Math.pow(progress, 3);
            
            menuCanvasCtx.beginPath();
            menuCanvasCtx.moveTo(0, y);
            menuCanvasCtx.lineTo(menuCanvas.width, y);
            
            const alpha = Math.pow(progress, 2.2) * 0.7;
            menuCanvasCtx.strokeStyle = isGlitching ? `rgba(255, 0, 50, ${alpha * 1.5})` : `rgba(0, 255, 100, ${alpha})`;
            menuCanvasCtx.lineWidth = isGlitching ? 2.5 : 1.2;
            menuCanvasCtx.stroke();
        }
        
        const numVerticalLines = 26;
        for (let i = -numVerticalLines / 2; i <= numVerticalLines / 2; i++) {
            const xAtBottom = horizonX + i * (menuCanvas.width / (numVerticalLines * 0.35));
            
            menuCanvasCtx.beginPath();
            menuCanvasCtx.moveTo(horizonX, horizonY);
            menuCanvasCtx.lineTo(xAtBottom, menuCanvas.height);
            
            const normalizedDist = Math.abs(i) / (numVerticalLines / 2);
            let alpha = 0.5 * (1.0 - Math.pow(normalizedDist, 1.8));
            if (alpha < 0) alpha = 0;
            
            menuCanvasCtx.strokeStyle = isGlitching ? `rgba(255, 0, 50, ${alpha * 1.5})` : `rgba(0, 255, 100, ${alpha})`;
            menuCanvasCtx.lineWidth = isGlitching ? 2.5 : 1.2;
            menuCanvasCtx.stroke();
        }
        
        if (gridPackets.length === 0) {
            for (let i = 0; i < 20; i++) {
                gridPackets.push({
                    vertIndex: Math.floor(Math.random() * 26) - 13,
                    progress: Math.random(),
                    speed: Math.random() * 0.0035 + 0.0018,
                    size: Math.random() * 5 + 3
                });
            }
        }
        
        gridPackets.forEach(p => {
            p.progress += isGlitching ? p.speed * 4.5 : p.speed;
            if (p.progress > 1.0) {
                p.progress = 0.0;
                p.vertIndex = Math.floor(Math.random() * 26) - 13;
                p.speed = Math.random() * 0.0035 + 0.0018;
            }
            
            const progressPow = Math.pow(p.progress, 3);
            const y = horizonY + (menuCanvas.height - horizonY) * progressPow;
            const xAtBottom = horizonX + p.vertIndex * (menuCanvas.width / (26 * 0.35));
            const x = horizonX + (xAtBottom - horizonX) * progressPow;
            
            const size = p.size * (0.3 + p.progress * 1.2);
            const alpha = p.progress * 0.95;
            
            if (y >= horizonY && y <= menuCanvas.height && x >= 0 && x <= menuCanvas.width) {
                menuCanvasCtx.beginPath();
                menuCanvasCtx.moveTo(x, y - size);
                menuCanvasCtx.lineTo(x + size, y);
                menuCanvasCtx.lineTo(x, y + size);
                menuCanvasCtx.lineTo(x - size, y);
                menuCanvasCtx.closePath();
                
                menuCanvasCtx.fillStyle = isGlitching ? `rgba(255, 50, 50, ${alpha * 0.7})` : `rgba(0, 255, 100, ${alpha * 0.48})`;
                menuCanvasCtx.strokeStyle = isGlitching ? `rgba(255, 150, 150, ${alpha})` : `rgba(150, 255, 200, ${alpha})`;
                menuCanvasCtx.lineWidth = 1;
                menuCanvasCtx.fill();
                menuCanvasCtx.stroke();
            }
        });
        
        menuCanvasCtx.beginPath();
        menuCanvasCtx.moveTo(0, horizonY);
        menuCanvasCtx.lineTo(menuCanvas.width, horizonY);
        menuCanvasCtx.strokeStyle = isGlitching ? 'rgba(255, 0, 50, 0.85)' : 'rgba(0, 255, 100, 0.85)';
        menuCanvasCtx.lineWidth = isGlitching ? 4 : 2;
        menuCanvasCtx.stroke();
        
        if (isGlitching) {
            if (Math.random() < 0.3) {
                menuCanvasCtx.beginPath();
                menuCanvasCtx.moveTo(Math.random() * menuCanvas.width, Math.random() * menuCanvas.height);
                menuCanvasCtx.lineTo(Math.random() * menuCanvas.width, Math.random() * menuCanvas.height);
                menuCanvasCtx.lineTo(Math.random() * menuCanvas.width, Math.random() * menuCanvas.height);
                menuCanvasCtx.closePath();
                menuCanvasCtx.strokeStyle = 'rgba(255, 0, 0, 0.4)';
                menuCanvasCtx.fillStyle = 'rgba(255, 0, 0, 0.08)';
                menuCanvasCtx.lineWidth = 1;
                menuCanvasCtx.fill();
                menuCanvasCtx.stroke();
            }
            
            if (Math.random() < 0.35) {
                menuCanvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
                menuCanvasCtx.lineWidth = 1;
                const sliceY = Math.random() * menuCanvas.height;
                menuCanvasCtx.beginPath();
                menuCanvasCtx.moveTo(0, sliceY);
                menuCanvasCtx.lineTo(menuCanvas.width, sliceY);
                menuCanvasCtx.stroke();
                
                menuCanvasCtx.fillStyle = 'rgba(255, 0, 0, 0.15)';
                menuCanvasCtx.fillRect(
                    Math.random() * menuCanvas.width,
                    Math.random() * menuCanvas.height,
                    Math.random() * 150 + 50,
                    Math.random() * 6 + 1
                );
            }
        }
        
        menuCanvasAnimId = requestAnimationFrame(drawMatrixGrid);
    };
    
    drawMatrixGrid();
}

// ====================================================
// --- INTERACCIÓN DE CRÉDITOS Y PERFILES DE CREADOR ---
// ====================================================
function initCreatorInteractions() {
    const badges = document.querySelectorAll('.creator-badge');
    const container = document.getElementById('menu-terminal-lines');
    if (!badges || !container) return;
    
    const profiles = {
        luca: [
            "C:\\SYSTEM\\ARCHITECTS> RUN LUCA.EXE --ROOT",
            "LOADING CORE ENGINE SEGMENTS... [100%]",
            "------------------------------------------",
            "CREATOR DETECTED: LUCA BONAMAISON MARCONI",
            "ROLE: CORE IMPLEMENTER & AUDIO ENGINEER",
            "STATUS: ACCESS GRANTED (BIOS LEVEL 0)"
        ],
        mateo: [
            "C:\\SYSTEM\\ARCHITECTS> RUN MATEO.EXE --ROOT",
            "LOADING NETWORK DRIVER PORTS... [100%]",
            "------------------------------------------",
            "CREATOR DETECTED: MATEO GANDINI",
            "ROLE: ARCHITECT & SECURITY AUDITOR",
            "STATUS: ACCESS GRANTED (BIOS LEVEL 0)"
        ]
    };
    
    let activeTypingTimeoutIds = [];
    
    badges.forEach(badge => {
        badge.addEventListener('mouseenter', () => {
            const creator = badge.getAttribute('data-creator');
            if (!profiles[creator]) return;
            
            menuLogsPaused = true;
            
            if (typeof playGlitchSound === 'function') {
                playGlitchSound();
            }
            
            activeTypingTimeoutIds.forEach(id => clearTimeout(id));
            activeTypingTimeoutIds = [];
            
            container.innerHTML = '';
            
            profiles[creator].forEach((lineText, index) => {
                const timeoutId = setTimeout(() => {
                    const p = document.createElement('p');
                    p.innerText = lineText;
                    
                    if (lineText.includes('RUN') || lineText.includes('LOADING')) {
                        p.style.color = '#3399ff';
                        p.style.fontWeight = 'bold';
                    } else if (lineText.includes('STATUS') || lineText.includes('GRANTED')) {
                        p.style.color = '#00ff66';
                        p.style.fontWeight = 'bold';
                        p.style.textShadow = '0 0 8px rgba(0, 255, 102, 0.6)';
                    } else if (lineText.includes('CREATOR') || lineText.includes('ROLE')) {
                        p.style.color = '#ffffff';
                        p.style.textShadow = '0 0 5px #ffffff';
                    } else if (lineText.includes('---')) {
                        p.style.color = 'rgba(0, 255, 100, 0.4)';
                    }
                    
                    container.appendChild(p);
                    container.scrollTop = container.scrollHeight;
                }, index * 200);
                
                activeTypingTimeoutIds.push(timeoutId);
            });
        });
        
        badge.addEventListener('mouseleave', () => {
            activeTypingTimeoutIds.forEach(id => clearTimeout(id));
            activeTypingTimeoutIds = [];
            
            container.innerHTML = '';
            
            const exitMsg = document.createElement('p');
            exitMsg.innerText = "C:\\SYSTEM\\ARCHITECTS> EXIT";
            exitMsg.style.color = '#ffaa00';
            container.appendChild(exitMsg);
            
            const restoreMsg = document.createElement('p');
            restoreMsg.innerText = "> SYSTEM: RESTORING AUTOMATIC MONITORING...";
            restoreMsg.style.color = '#ffaa00';
            
            const restoreTimeout = setTimeout(() => {
                container.appendChild(restoreMsg);
                container.scrollTop = container.scrollHeight;
            }, 320);
            activeTypingTimeoutIds.push(restoreTimeout);
            
            const pauseTimeout = setTimeout(() => {
                menuLogsPaused = false;
            }, 1100);
            activeTypingTimeoutIds.push(pauseTimeout);
        });
    });
}

// ====================================================
// --- SECUENCIAS DE BOOT Y FLUJO DE HISTORIA ---
// ====================================================
async function startBootSequence() {
    state.freeRoam = false;
    state.freeRoamInitialized = false;
    state.sandboxTutorialStep = 0;
    const btnStandUp = document.getElementById('btn-stand-up');
    if (btnStandUp) {
        btnStandUp.classList.remove('visible');
        btnStandUp.style.display = 'none';
    }
    const startMenuStandup = document.getElementById('start-menu-standup');
    if (startMenuStandup) startMenuStandup.style.display = 'none';
    if (typeof stopMenuMusic === 'function') stopMenuMusic();
    showScreen('booting');
    const bootTextEl = document.getElementById('boot-text');
    if (!bootTextEl) return;
    bootTextEl.innerHTML = "";
    
    const bootLines = [
        "BIOS Date 10/11/04 14:32:05 Ver 08.00.09",
        "CPU: Genuine Intel(R) processor - 2.80GHz",
        "Memory Test:  4194304K OK",
        "",
        "Enabling Cache... OK",
        "Initializing USB Controllers... OK",
        "Detecting IDE ATAPI device... found.",
        "",
        "Loading OS Kernel...................",
        "Executing startup scripts...",
        "Starting services...",
        "",
        "Welcome to DarkOS 4.1."
    ];

    for (let line of bootLines) {
        bootTextEl.innerHTML += line + "<br>";
        if (line.trim() !== "") {
            if (typeof playTypeSound === 'function') playTypeSound();
            await new Promise(r => setTimeout(r, 150 + Math.random() * 250));
        } else {
            await new Promise(r => setTimeout(r, 100));
        }
    }

    await new Promise(r => setTimeout(r, 1000));
    startDeepWebSetup();
}

async function startDeepWebSetup() {
    showScreen('setup');
    const progressBar = document.getElementById('progress-bar');
    const setupStatus = document.getElementById('setup-status');
    if (!progressBar || !setupStatus) return;
    
    const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;
    progressBar.style.width = "0%";
    setupStatus.innerText = tFn("setup_init", "Inicializando entorno...");
    
    const steps = [
        { progress: 10, text: tFn("setup_step_1", "Conectando al proxy local...") },
        { progress: 25, text: tFn("setup_step_2", "Descargando nodos Tor actualizados...") },
        { progress: 40, text: tFn("setup_step_3", "Configurando túnel encriptado obfs4...") },
        { progress: 55, text: tFn("setup_step_4", "Bypasseando restricciones de ISP...") },
        { progress: 70, text: tFn("setup_step_5", "Estableciendo conexión P2P anónima...") },
        { progress: 85, text: tFn("setup_step_6", "Instalando certificados de NightLink...") },
        { progress: 95, text: tFn("setup_step_7", "Limpiando rastros de red...") },
        { progress: 100, text: tFn("setup_step_8", "¡Acceso garantizado!") }
    ];

    for (let step of steps) {
        await new Promise(r => setTimeout(r, 500 + Math.random() * 800));
        progressBar.style.width = step.progress + "%";
        setupStatus.innerText = step.text;
        
        if (typeof playTypeSound === 'function') playTypeSound(); 
    }
    
    await new Promise(r => setTimeout(r, 1500));
    if (typeof playSuccessSound === 'function') playSuccessSound();
    
    const iconNetManager = document.getElementById('icon-netmanager');
    const iconAntivirus = document.getElementById('icon-antivirus');
    if (iconNetManager) iconNetManager.classList.remove('hidden');
    if (iconAntivirus) iconAntivirus.classList.add('hidden');
    
    showScreen('desktop');
    if (typeof updateQuest === 'function') updateQuest(0);
    startIntroSequence();
}

function startIntroSequence() {
    const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;
    if (typeof queueDialogues === 'function') {
        queueDialogues([
            { name: "player", text: tFn("intro_dialogue_1", "Siempre tuve curiosidad sobre la Deep Web... Dicen que hay foros ocultos e información prohibida.") },
            { name: "player", text: tFn("intro_dialogue_2", "Al fin logré instalar este navegador NightLink siguiendo un tutorial. A ver qué pasa si lo abro...") },
            { name: "Sistema", text: tFn("intro_dialogue_system", "(Haz clic en el icono del navegador NightLink en el escritorio)") }
        ]);
    }
}

// Iniciar sistema de pantallas
const screens = {
    menu: document.getElementById('screen-menu'),
    name: document.getElementById('screen-name'),
    booting: document.getElementById('screen-booting'),
    setup: document.getElementById('screen-setup-deepweb'),
    desktop: document.getElementById('screen-desktop'),
    gameover: document.getElementById('screen-gameover'),
    ps1_intro: document.getElementById('screen-ps1-intro')
};

function showScreen(screenId) {
    Object.values(screens).forEach(s => {
        if (s) {
            s.classList.remove('active');
            s.classList.add('hidden');
        }
    });
    if (screens[screenId]) {
        screens[screenId].classList.remove('hidden');
        screens[screenId].classList.add('active');
    }
    
    if (screenId === 'menu') {
        initMenuCyberCanvas();
    }
    
    if (screenId === 'desktop') {
        startGameClock();
    }
}

// ====================================================
// --- INITIALIZE ALL DOM LISTENERS & TRIGGERS ON LOAD ---
// ====================================================
document.addEventListener('DOMContentLoaded', () => {
    // Menu ambient lines and canvas
    initMenuCyberCanvas();
    initMenuAmbientLogs();
    initCreatorInteractions();
    
    const btnStart = document.getElementById('btn-start');
    const btnFreeMode = document.getElementById('btn-free-mode');
    const btnConfirmName = document.getElementById('btn-confirm-name');
    const playerNameInput = document.getElementById('player-name-input');
    const btnToggleLang = document.getElementById('btn-toggle-lang-menu');
    
    if (btnToggleLang) {
        btnToggleLang.addEventListener('click', () => {
            if (typeof window.getLanguage === 'function' && typeof window.setLanguage === 'function') {
                const newLang = window.getLanguage() === 'es' ? 'en' : 'es';
                window.setLanguage(newLang);
                btnToggleLang.innerText = newLang === 'es' ? '🌐 IDIOMA: ESPAÑOL' : '🌐 LANGUAGE: ENGLISH';
            }
        });
    }
    
    if (btnStart) {
        btnStart.addEventListener('click', () => {
            if (typeof initAudio === 'function') initAudio(); 
            showScreen('name');
            if (playerNameInput) playerNameInput.focus();
        });
    }
    
    if (btnFreeMode) {
        btnFreeMode.addEventListener('click', () => {
            if (typeof initAudio === 'function') initAudio();
            if (typeof playBootSound === 'function') playBootSound();
            if (window.RoomInteractions && typeof window.RoomInteractions.getAudioCtx === 'function') {
                window.RoomInteractions.getAudioCtx();
            }
            state.playerName = "Guest_Sandbox";
            state.freeRoam = true;
            state.freeRoamInitialized = false;
            state.sandboxTutorialStep = 0;
            if (state.storyMode) {
                state.storyMode.cinemaWatched = false;
            }
            // Lanzar intro 3D PS1 con cinemática activa en vez de ir directo al modo libre
            if (typeof startPS1Intro === 'function') {
                startPS1Intro(true);
            } else if (typeof window.startPS1Intro === 'function') {
                window.startPS1Intro(true);
            } else {
                // Fallback si ps1_intro.js no cargó
                if (typeof startFreeRoam === 'function') startFreeRoam();
            }
        });
    }
    
    if (playerNameInput) {
        playerNameInput.addEventListener('keypress', (e) => {
            if(e.key === 'Enter' && btnConfirmName) btnConfirmName.click();
        });
    }
    
    if (btnConfirmName) {
        btnConfirmName.addEventListener('click', () => {
            if (!playerNameInput) return;
            let name = playerNameInput.value.trim();
            if (name.length > 0) {
                state.playerName = name;
                
                // Asegurar que la cámara esté completamente apagada y sin tracks activos en el modo normal
                if (state.webcamStream) {
                    state.webcamStream.getTracks().forEach(track => track.stop());
                    state.webcamStream = null;
                    const feed = document.getElementById('webcam-feed');
                    if (feed) feed.srcObject = null;
                }
                const chkWebcam = document.getElementById('chk-webcam');
                if (chkWebcam) chkWebcam.checked = false;

                if (typeof playBootSound === 'function') playBootSound();
                startBootSequence();
            }
        });
    }
    
    const btnCloseHacker = document.getElementById('btn-close-hacker');
    if (btnCloseHacker) {
        btnCloseHacker.addEventListener('click', () => {
            const winHacker = document.getElementById('window-hacker');
            if (winHacker) winHacker.classList.add('hidden');
            if (typeof removeTaskbarTab === 'function') removeTaskbarTab('hacker');
        });
    }

    const btnStandUp = document.getElementById('btn-stand-up');
    if (btnStandUp) {
        btnStandUp.addEventListener('click', () => {
            if (typeof window.standUpFromPC === 'function') {
                window.standUpFromPC();
            } else if (typeof window.startPS1Intro === 'function') {
                window.startPS1Intro();
            }
        });
    }
});

// Export globally
window.showScreen = showScreen;
window.startBootSequence = startBootSequence;
window.startDeepWebSetup = startDeepWebSetup;
window.startIntroSequence = startIntroSequence;
window.startGameClock = startGameClock;
