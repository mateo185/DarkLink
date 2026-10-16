// --- SISTEMA DE MINIJUEGOS (10 TIPOS DE VIRUS) ---

function tFn(key, fallback) {
    return (typeof window.t === 'function') ? window.t(key, fallback) : fallback;
}

let currentCallback = null;
let currentMinigameInterval = null;

function triggerRandomMinigame(callback) {
    const minigameWindow = document.getElementById('window-minigame');
    const webcamContainer = document.getElementById('webcam-container');
    const survivalUI = document.getElementById('survival-ui');
    const browserWindow = document.getElementById('window-browser');

    state.isMinigameActive = true;
    currentCallback = callback;
    if (minigameWindow) {
        minigameWindow.classList.remove('hidden');
        if (typeof bringToFront === 'function') bringToFront(minigameWindow);
    }
    if (typeof playVirusAlarmSound === 'function') playVirusAlarmSound();
    
    if (state.webcamStream && webcamContainer) {
        webcamContainer.classList.remove('hidden');
        if (typeof playGlitchSound === 'function') playGlitchSound();
        
        // 50% de probabilidad de alerta de doxxeo con foto
        if (Math.random() < 0.5) {
            setTimeout(() => {
                if (state.isMinigameActive && typeof triggerDoxAlert === 'function') triggerDoxAlert();
            }, 3000);
        }
    }
    
    // Mostrar botón de apagar pantalla durante el virus
    if (survivalUI) survivalUI.classList.remove('hidden');
    
    // No invocar entidad/amenazas durante el minijuego para que el jugador se concentre en resolver el virus

    if (browserWindow) browserWindow.classList.add('hidden');
    if (typeof removeTaskbarTab === 'function') removeTaskbarTab('browser');

    const gameId = Math.floor(Math.random() * 10) + 1;
    setupMinigame(gameId);
}

function setupMinigame(id) {
    const minigameContent = document.getElementById('minigame-content');
    const minigameProgressBar = document.getElementById('minigame-progress-bar');
    if (!minigameContent || !minigameProgressBar) return;

    minigameContent.innerHTML = "";
    minigameProgressBar.style.width = "0%";
    clearInterval(currentMinigameInterval);
    
    switch(id) {
        case 1: startMG_Snake(); break;
        case 2: startMG_CodeBreaker(); break;
        case 3: startMG_PacketHunter(); break;
        case 4: startMG_TerminalBurst(); break;
        case 5: startMG_MemoryMatch(); break;
        case 6: startMG_SignalSync(); break;
        case 7: startMG_FirewallClicker(); break;
        case 8: startMG_BinaryStream(); break;
        case 9: startMG_HexCracker(); break;
        case 10: startMG_PatternTrace(); break;
    }
}

function completeMinigame() {
    const minigameWindow = document.getElementById('window-minigame');
    const minigameInstr = document.getElementById('minigame-instr');
    const minigameProgressBar = document.getElementById('minigame-progress-bar');
    const webcamContainer = document.getElementById('webcam-container');
    const doxWindow = document.getElementById('window-dox');
    const survivalUI = document.getElementById('survival-ui');
    const browserWindow = document.getElementById('window-browser');

    state.isMinigameActive = false;
    state.completedMinigames++;
    clearInterval(currentMinigameInterval);
    
    // Si hay una amenaza activa al resolver el virus, la cancelamos limpiamente
    if (state.threatActive) {
        clearTimeout(state.threatTimer);
        state.threatActive = false;
        if (typeof stopThreatSound === 'function') stopThreatSound();
        if (typeof realAudioBreathing !== 'undefined') realAudioBreathing.pause();
        if (typeof realAudioFootsteps !== 'undefined') realAudioFootsteps.pause();
        
        const audioCaption = document.getElementById('audio-caption');
        if (audioCaption) {
            audioCaption.classList.add('hidden');
            audioCaption.style.color = "white";
        }
    }
    
    if (minigameInstr) {
        minigameInstr.innerText = tFn("minigame_success", "SISTEMA LIMPIADO CON ÉXITO.");
        minigameInstr.style.color = "lime";
    }
    if (minigameProgressBar) minigameProgressBar.style.width = "100%";
    if (typeof playSuccessSound === 'function') playSuccessSound();
    
    if (webcamContainer) {
        webcamContainer.classList.add('hidden');
    }
    if (doxWindow) {
        doxWindow.classList.add('hidden');
        if (typeof removeTaskbarTab === 'function') removeTaskbarTab('dox');
    }
    
    setTimeout(() => {
        if (minigameWindow) minigameWindow.classList.add('hidden');
        
        // Ocultar botón si estamos en modo libre
        if (state.freeRoam) {
            if (survivalUI) survivalUI.classList.add('hidden');
            if (typeof turnOnScreen === 'function') turnOnScreen();
        }

        if (currentCallback) currentCallback();
        
        // Abrir navegador de vuelta
        if (browserWindow) browserWindow.classList.remove('hidden');
        if (typeof addTaskbarTab === 'function') addTaskbarTab('browser', 'NightLink');
    }, 1500);
}

// 1. SNAKE
function startMG_Snake() {
    const minigameTitle = document.getElementById('minigame-title');
    const minigameInstr = document.getElementById('minigame-instr');
    const minigameContent = document.getElementById('minigame-content');
    const minigameProgressBar = document.getElementById('minigame-progress-bar');
    
    if (minigameTitle) minigameTitle.innerText = tFn("minigame_corruptor_title", "VIRUS: CORRUPTOR.EXE");
    if (minigameInstr) minigameInstr.innerText = tFn("minigame_corruptor_instr", "Captura 5 fragmentos de datos.");
    
    const canvas = document.createElement('canvas');
    canvas.width = 300; canvas.height = 200;
    if (minigameContent) minigameContent.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    
    let snake = [{x: 10, y: 10}];
    let food = {x: 5, y: 5};
    let dx = 1, dy = 0;
    let score = 0;
    
    const handler = (e) => {
        if (e.key === 'ArrowUp' && dy === 0) { dx = 0; dy = -1; }
        if (e.key === 'ArrowDown' && dy === 0) { dx = 0; dy = 1; }
        if (e.key === 'ArrowLeft' && dx === 0) { dx = -1; dy = 0; }
        if (e.key === 'ArrowRight' && dx === 0) { dx = 1; dy = 0; }
    };
    document.addEventListener('keydown', handler);

    currentMinigameInterval = setInterval(() => {
        let head = {x: snake[0].x + dx, y: snake[0].y + dy};
        if (head.x < 0 || head.x >= 30 || head.y < 0 || head.y >= 20) {
            document.removeEventListener('keydown', handler);
            return setupMinigame(1);
        }
        
        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
            score++;
            if (minigameProgressBar) minigameProgressBar.style.width = (score / 5 * 100) + "%";
            if (score >= 5) {
                document.removeEventListener('keydown', handler);
                completeMinigame();
            }
            food = { x: Math.floor(Math.random()*30), y: Math.floor(Math.random()*20) };
        } else {
            snake.pop();
        }
        
        ctx.fillStyle = "#000"; ctx.fillRect(0,0,300,200);
        ctx.fillStyle = "lime"; snake.forEach(p => ctx.fillRect(p.x*10, p.y*10, 9, 9));
        ctx.fillStyle = "red"; ctx.fillRect(food.x*10, food.y*10, 9, 9);
    }, state.acceleratedMinigame ? 60 : 100);
}

// 2. CODE BREAKER
function startMG_CodeBreaker() {
    const minigameTitle = document.getElementById('minigame-title');
    const minigameInstr = document.getElementById('minigame-instr');
    const minigameContent = document.getElementById('minigame-content');

    if (minigameTitle) minigameTitle.innerText = tFn("minigame_bruteforce_title", "VIRUS: BRUTEFORCE.SH");
    const target = Math.floor(Math.random() * 900) + 100;
    if (minigameInstr) minigameInstr.innerText = tFn("minigame_bruteforce_instr", "Adivina el código de acceso (100-999)");
    
    const input = document.createElement('input');
    input.type = "text"; input.className = "mg-input"; input.maxLength = 3;
    if (minigameContent) minigameContent.appendChild(input);
    input.focus();
    
    const log = document.createElement('div');
    log.className = "mg-terminal";
    if (minigameContent) minigameContent.appendChild(log);

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const val = parseInt(input.value);
            input.value = "";
            if (val === target) {
                completeMinigame();
            } else {
                const hint = val < target ? (window.getLanguage && window.getLanguage() === 'en' ? "HIGHER" : "MAYOR") : (window.getLanguage && window.getLanguage() === 'en' ? "LOWER" : "MENOR");
                log.innerHTML += `> ${window.getLanguage && window.getLanguage() === 'en' ? 'Trying' : 'Intentando'} ${val}... ERROR: ${window.getLanguage && window.getLanguage() === 'en' ? 'Code is' : 'El código es'} ${hint}.<br>`;
                log.scrollTop = log.scrollHeight;
            }
        }
    });
}

// 3. PACKET HUNTER
function startMG_PacketHunter() {
    const minigameTitle = document.getElementById('minigame-title');
    const minigameInstr = document.getElementById('minigame-instr');
    const minigameContent = document.getElementById('minigame-content');
    const minigameProgressBar = document.getElementById('minigame-progress-bar');

    if (minigameTitle) minigameTitle.innerText = tFn("minigame_sniffer_title", "VIRUS: TRAFFIC_SNIFFER");
    if (minigameInstr) minigameInstr.innerText = tFn("minigame_sniffer_instr", "Intercepta 10 paquetes de datos.");
    let caught = 0;
    
    const zone = document.createElement('div');
    zone.style.width = "100%"; zone.style.height = "250px"; zone.style.position = "relative";
    if (minigameContent) minigameContent.appendChild(zone);
    
    function spawn() {
        if (!state.isMinigameActive) return;
        const p = document.createElement('div');
        p.className = "mg-packet";
        p.style.top = Math.random() * 220 + "px";
        p.style.left = Math.random() * 80 + "%";
        p.onclick = () => {
            p.remove();
            caught++;
            if (minigameProgressBar) minigameProgressBar.style.width = (caught / 10 * 100) + "%";
            if (caught >= 10) completeMinigame();
            else spawn();
        };
        zone.appendChild(p);
        setTimeout(() => { if(p.parentNode) p.remove(); if(caught < 10) spawn(); }, 1500);
    }
    spawn(); spawn();
}

// 4. TERMINAL BURST
function startMG_TerminalBurst() {
    const minigameTitle = document.getElementById('minigame-title');
    const minigameInstr = document.getElementById('minigame-instr');
    const minigameContent = document.getElementById('minigame-content');
    const minigameProgressBar = document.getElementById('minigame-progress-bar');

    if (minigameTitle) minigameTitle.innerText = tFn("minigame_stack_title", "VIRUS: STACK_OVERFLOW");
    const words = ["OVERRIDE", "BYPASS", "DECRYPT", "INJECT", "PURGE"];
    let currentWord = 0;
    
    if (minigameInstr) minigameInstr.innerText = `${tFn("minigame_stack_instr", "Escribe: ")}${words[currentWord]}`;
    const input = document.createElement('input');
    input.className = "mg-input";
    if (minigameContent) minigameContent.appendChild(input);
    input.focus();

    input.addEventListener('input', () => {
        if (input.value.toUpperCase() === words[currentWord]) {
            currentWord++;
            input.value = "";
            if (minigameProgressBar) minigameProgressBar.style.width = (currentWord / words.length * 100) + "%";
            if (currentWord >= words.length) completeMinigame();
            else if (minigameInstr) minigameInstr.innerText = `${tFn("minigame_stack_instr", "Escribe: ")}${words[currentWord]}`;
        }
    });
}

// 5. MEMORY MATCH
function startMG_MemoryMatch() {
    const minigameTitle = document.getElementById('minigame-title');
    const minigameInstr = document.getElementById('minigame-instr');
    const minigameContent = document.getElementById('minigame-content');
    const minigameProgressBar = document.getElementById('minigame-progress-bar');

    if (minigameTitle) minigameTitle.innerText = tFn("minigame_ram_title", "VIRUS: RAM_EATER");
    if (minigameInstr) minigameInstr.innerText = tFn("minigame_ram_instr", "Encuentra las parejas de hashes.");
    const icons = ["#", "$", "!", "&", "?", "+", "@", "*"];
    const deck = [...icons, ...icons].sort(() => Math.random() - 0.5);
    let selected = [];
    let matched = 0;

    const grid = document.createElement('div');
    grid.className = "minigame-grid";
    if (minigameContent) minigameContent.appendChild(grid);

    deck.forEach((icon, i) => {
        const card = document.createElement('div');
        card.className = "mg-card";
        card.dataset.val = icon;
        card.innerText = "";
        card.onclick = () => {
            if (selected.length < 2 && !card.classList.contains('revealed')) {
                card.innerText = icon;
                card.classList.add('revealed');
                selected.push(card);
                if (selected.length === 2) {
                    if (selected[0].dataset.val === selected[1].dataset.val) {
                        matched++;
                        selected = [];
                        if (minigameProgressBar) minigameProgressBar.style.width = (matched / 8 * 100) + "%";
                        if (matched === 8) completeMinigame();
                    } else {
                        setTimeout(() => {
                            selected.forEach(c => { c.innerText = ""; c.classList.remove('revealed'); });
                            selected = [];
                        }, 500);
                    }
                }
            }
        };
        grid.appendChild(card);
    });
}

// 6. SIGNAL SYNC
function startMG_SignalSync() {
    const minigameTitle = document.getElementById('minigame-title');
    const minigameInstr = document.getElementById('minigame-instr');
    const minigameContent = document.getElementById('minigame-content');

    if (minigameTitle) minigameTitle.innerText = tFn("minigame_radio_title", "VIRUS: RADIOWAVE");
    if (minigameInstr) minigameInstr.innerText = tFn("minigame_radio_instr", "Detén la señal en el centro crítico.");
    
    const track = document.createElement('div');
    track.style.width = "100%"; track.style.height = "50px"; track.style.background = "#111";
    track.style.position = "relative"; track.style.border = "1px solid #444";
    track.style.borderRadius = "4px";
    if (minigameContent) minigameContent.appendChild(track);
    
    // Zona verde crítica
    const zone = document.createElement('div');
    zone.style.width = "60px"; zone.style.height = "100%"; zone.style.background = "rgba(0,255,0,0.4)";
    zone.style.position = "absolute"; zone.style.left = "50%"; zone.style.transform = "translateX(-50%)";
    zone.style.borderLeft = "2px solid lime"; zone.style.borderRight = "2px solid lime";
    track.appendChild(zone);
    
    // Slider (Señal Roja)
    const slider = document.createElement('div');
    slider.style.width = "12px"; slider.style.height = "100%"; slider.style.background = "#ff003c";
    slider.style.position = "absolute"; slider.style.left = "0%";
    slider.style.transform = "translateX(-50%)"; // Centrar el slider sobre su posición X
    slider.style.boxShadow = "0 0 10px #ff003c";
    track.appendChild(slider);
    
    let pos = 0; let dir = state.acceleratedMinigame ? 3.0 : 1.5; // Velocidad de la señal
    currentMinigameInterval = setInterval(() => {
        pos += dir;
        if (pos >= 100 || pos <= 0) dir *= -1;
        slider.style.left = pos + "%";
    }, 16);
    
    const btn = document.createElement('button');
    btn.className = "terminal-btn"; btn.innerText = tFn("minigame_radio_btn", "SINCRONIZAR SEÑAL");
    btn.style.marginTop = "30px"; btn.style.width = "100%";
    btn.onclick = () => {
        if (pos >= 38 && pos <= 62) {
            clearInterval(currentMinigameInterval);
            completeMinigame();
        } else {
            if (minigameInstr) {
                minigameInstr.innerText = tFn("minigame_radio_desync", "DESINCRONIZACIÓN DETECTADA. RECALIBRANDO...");
                minigameInstr.style.color = "red";
            }
            setTimeout(() => {
                if (state.isMinigameActive) setupMinigame(6);
            }, 800);
        }
    };
    if (minigameContent) minigameContent.appendChild(btn);
}

// 7. FIREWALL CLICKER
function startMG_FirewallClicker() {
    const minigameTitle = document.getElementById('minigame-title');
    const minigameInstr = document.getElementById('minigame-instr');
    const minigameContent = document.getElementById('minigame-content');
    const minigameProgressBar = document.getElementById('minigame-progress-bar');

    if (minigameTitle) minigameTitle.innerText = tFn("minigame_dos_title", "VIRUS: DOS_ATTACK");
    if (minigameInstr) minigameInstr.innerText = tFn("minigame_dos_instr", "Elimina los sockets infectados (Rojos).");
    let score = 0;
    
    const grid = document.createElement('div');
    grid.className = "minigame-grid";
    if (minigameContent) minigameContent.appendChild(grid);

    function spawn() {
        if (!state.isMinigameActive) return;
        const boxes = minigameContent.querySelectorAll('.mg-card');
        if (boxes.length === 0) return;
        const randomBox = boxes[Math.floor(Math.random() * boxes.length)];
        randomBox.style.background = "red";
        randomBox.onclick = () => {
            if (randomBox.style.background === "red") {
                randomBox.style.background = "#111";
                score++;
                if (minigameProgressBar) minigameProgressBar.style.width = (score / 15 * 100) + "%";
                if (score >= 15) completeMinigame();
            }
        };
        setTimeout(() => { if (randomBox.style.background === "red") randomBox.style.background = "#111"; }, 800);
    }

    for (let i = 0; i < 16; i++) {
        const box = document.createElement('div');
        box.className = "mg-card";
        grid.appendChild(box);
    }
    
    currentMinigameInterval = setInterval(spawn, state.acceleratedMinigame ? 300 : 500);
}

// 8. BINARY STREAM
function startMG_BinaryStream() {
    const minigameTitle = document.getElementById('minigame-title');
    const minigameInstr = document.getElementById('minigame-instr');
    const minigameContent = document.getElementById('minigame-content');
    const minigameProgressBar = document.getElementById('minigame-progress-bar');

    if (minigameTitle) minigameTitle.innerText = tFn("minigame_binary_title", "VIRUS: BINARY_GEN");
    if (minigameInstr) minigameInstr.innerText = tFn("minigame_binary_instr", "Haz clic en los ceros (0) para invertir el flujo.");
    let score = 0;
    
    const stream = document.createElement('div');
    stream.className = "mg-terminal";
    if (minigameContent) minigameContent.appendChild(stream);

    currentMinigameInterval = setInterval(() => {
        const span = document.createElement('span');
        const isZero = Math.random() < 0.2;
        span.innerText = isZero ? "0" : "1";
        span.style.cursor = isZero ? "pointer" : "default";
        span.style.color = isZero ? "red" : "#0f0";
        if (isZero) {
            span.onclick = () => {
                span.innerText = "1"; span.style.color = "lime";
                score++;
                if (minigameProgressBar) minigameProgressBar.style.width = (score / 20 * 100) + "%";
                if (score >= 20) completeMinigame();
            };
        }
        stream.appendChild(span);
        stream.scrollTop = stream.scrollHeight;
    }, state.acceleratedMinigame ? 60 : 100);
}

// 9. HEX CRACKER
function startMG_HexCracker() {
    const minigameTitle = document.getElementById('minigame-title');
    const minigameInstr = document.getElementById('minigame-instr');
    const minigameContent = document.getElementById('minigame-content');

    if (minigameTitle) minigameTitle.innerText = tFn("minigame_hex_title", "VIRUS: HEX_DUMP");
    const target = "0x" + Math.floor(Math.random()*16777215).toString(16).toUpperCase();
    if (minigameInstr) minigameInstr.innerText = `${tFn("minigame_hex_instr", "Busca el registro: ")}${target}`;
    
    const grid = document.createElement('div');
    grid.className = "minigame-grid";
    if (minigameContent) minigameContent.appendChild(grid);

    for (let i = 0; i < 12; i++) {
        const box = document.createElement('div');
        box.className = "mg-card";
        box.style.fontSize = "0.7rem";
        const val = i === 0 ? target : "0x" + Math.floor(Math.random()*16777215).toString(16).toUpperCase();
        box.innerText = val;
        box.onclick = () => {
            if (box.innerText === target) completeMinigame();
            else setupMinigame(9);
        };
        grid.appendChild(box);
    }
    // Shuffling
    const children = Array.from(grid.children);
    children.sort(() => Math.random() - 0.5);
    grid.innerHTML = "";
    children.forEach(c => grid.appendChild(c));
}

// 10. PATTERN TRACE
function startMG_PatternTrace() {
    const minigameTitle = document.getElementById('minigame-title');
    const minigameInstr = document.getElementById('minigame-instr');
    const minigameContent = document.getElementById('minigame-content');
    const minigameProgressBar = document.getElementById('minigame-progress-bar');

    if (minigameTitle) minigameTitle.innerText = tFn("minigame_pattern_title", "VIRUS: PATTERN_TRACE");
    if (minigameInstr) minigameInstr.innerText = tFn("minigame_pattern_instr", "Mantén el puntero sobre el rastro.");
    
    const zone = document.createElement('div');
    zone.style.width = "300px"; zone.style.height = "250px"; 
    zone.style.background = "#111"; zone.style.position = "relative";
    if (minigameContent) minigameContent.appendChild(zone);
    
    const dot = document.createElement('div');
    dot.style.width = "40px"; dot.style.height = "40px"; dot.style.background = "red";
    dot.style.position = "absolute"; dot.style.borderRadius = "50%";
    zone.appendChild(dot);
    
    let progress = 0;
    let over = false;
    dot.onmouseenter = () => over = true;
    dot.onmouseleave = () => over = false;
    
    let angle = 0;
    currentMinigameInterval = setInterval(() => {
        angle += 0.05;
        dot.style.left = (Math.cos(angle) * 100 + 130) + "px";
        dot.style.top = (Math.sin(angle * 0.7) * 80 + 100) + "px";
        
        if (over) {
            progress += 0.5;
            if (minigameProgressBar) minigameProgressBar.style.width = progress + "%";
            dot.style.background = "lime";
            if (progress >= 100) completeMinigame();
        } else {
            dot.style.background = "red";
        }
    }, 20);
}

// Exportar globalmente
window.triggerRandomMinigame = triggerRandomMinigame;
window.setupMinigame = setupMinigame;
window.completeMinigame = completeMinigame;
