// --- SISTEMA DE AUDIO (Web Audio API & Elementos de Audio) ---

let audioCtx = null;
let fanNoiseNode, fanOscNode, fanGainNode;
let threatAudioBufferSrc = null;
let threatAudioGain = null;

const realAudioBreathing = new Audio('respiracion.mp3');
const realAudioFootsteps = new Audio('pasos.mp3');
realAudioBreathing.loop = true;

let menuMusic = null;
let menuMusicInitialized = false;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        startAmbientFanSound();
    } else if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// Ruido Rosa (Pink Noise) en vez de Blanco para mayor realismo acústico
function createPinkNoise(audioCtx, bufferSize) {
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
        let white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.11; // compensation
        b6 = white * 0.115926;
    }
    return buffer;
}

function startAmbientFanSound() {
    if (!audioCtx) return;

    // Zumbido grave del motor del ventilador
    fanOscNode = audioCtx.createOscillator();
    fanOscNode.type = 'sine';
    fanOscNode.frequency.value = 50; 
    
    // Ruido rosa constante
    const bufferSize = audioCtx.sampleRate * 2;
    const pinkNoiseBuffer = createPinkNoise(audioCtx, bufferSize);
    fanNoiseNode = audioCtx.createBufferSource();
    fanNoiseNode.buffer = pinkNoiseBuffer;
    fanNoiseNode.loop = true; 
    
    // Lowpass filter ajustado
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600; 
    
    fanGainNode = audioCtx.createGain();
    fanGainNode.gain.value = 0.06; // El ruido rosa tiene un perfil distinto, ajustamos volumen
    
    fanNoiseNode.connect(filter);
    filter.connect(fanGainNode);
    fanOscNode.connect(fanGainNode);
    fanGainNode.connect(audioCtx.destination);
    
    fanNoiseNode.start();
    fanOscNode.start();
}

function mutePCAudio() {
    if (fanGainNode && audioCtx) {
        fanGainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    }
}

function unmutePCAudio() {
    if (fanGainNode && audioCtx) {
        fanGainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
    }
}

window.mutePCAudio = mutePCAudio;
window.unmutePCAudio = unmutePCAudio;

function playClickSound() {
    if (!audioCtx || audioCtx.state !== 'running') return;
    
    // High frequency "snap" de plastico
    const snap = audioCtx.createOscillator();
    const snapGain = audioCtx.createGain();
    snap.type = 'triangle';
    snap.frequency.setValueAtTime(2000, audioCtx.currentTime);
    snap.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.02);
    snapGain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    snapGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.03);
    snap.connect(snapGain);
    snapGain.connect(audioCtx.destination);
    
    // Resonancia baja "Thud" del switch pegando
    const thud = audioCtx.createOscillator();
    const thudGain = audioCtx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(300, audioCtx.currentTime);
    thud.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.04);
    thudGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    thudGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
    thud.connect(thudGain);
    thudGain.connect(audioCtx.destination);

    snap.start();
    thud.start();
    snap.stop(audioCtx.currentTime + 0.05);
    thud.stop(audioCtx.currentTime + 0.05);
}

let footstepTimeouts = [];
let activeFootstepNodes = [];

function playSynthesizedFootsteps() {
    if (!audioCtx || audioCtx.state !== 'running') return;
    
    // Limpiar pasos previos si hubiera
    stopFootstepsSound();
    
    // Reproduce 4 pasos espaciados temporalmente
    for (let i = 0; i < 4; i++) {
        const tid = setTimeout(() => {
            if (!audioCtx || audioCtx.state !== 'running') return;
            if (window.state && window.state.freeRoam && !window.state.isAtPC) return; // No sonar si el jugador ya se levantó
            
            const step = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            step.type = 'sine';
            step.frequency.setValueAtTime(100, audioCtx.currentTime); // Frecuencia grave simulando un golpe en el piso
            step.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.1);
            
            gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
            
            // Fricción sorda del zapato contra el piso
            const noiseSize = audioCtx.sampleRate * 0.1;
            const buffer = audioCtx.createBuffer(1, noiseSize, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for(let j=0; j<noiseSize; j++) data[j] = Math.random()*2 - 1;
            const noise = audioCtx.createBufferSource();
            noise.buffer = buffer;
            const noiseFilter = audioCtx.createBiquadFilter();
            noiseFilter.type = 'lowpass';
            noiseFilter.frequency.value = 400; // Sonido ahogado lejano
            const noiseGain = audioCtx.createGain();
            noiseGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            
            step.connect(gain);
            gain.connect(audioCtx.destination);
            
            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(audioCtx.destination);
            
            step.start();
            noise.start();
            step.stop(audioCtx.currentTime + 0.15);

            activeFootstepNodes.push(step, noise, gain, noiseGain);
        }, i * 650); // Intervalo de 650ms logrando que suenen pesados y lentos
        footstepTimeouts.push(tid);
    }
}

function stopFootstepsSound() {
    footstepTimeouts.forEach(tid => clearTimeout(tid));
    footstepTimeouts = [];
    activeFootstepNodes.forEach(node => {
        try {
            if (node.stop) node.stop();
            if (node.disconnect) node.disconnect();
        } catch(e) {}
    });
    activeFootstepNodes = [];
}

function playTypeSound() {
    if (!audioCtx || audioCtx.state !== 'running') return;
    if (state.freeRoam && !document.body.classList.contains('ps1-monitor-active')) return;
    
    const noiseSize = audioCtx.sampleRate * 0.02;
    const buffer = audioCtx.createBuffer(1, noiseSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0; i<noiseSize; i++) data[i] = Math.random()*2 - 1;
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2500 + Math.random()*1000;
    
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.02);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();

    // Thud
    const thud = audioCtx.createOscillator();
    const thudGain = audioCtx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(150 + Math.random()*50, audioCtx.currentTime);
    thud.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.04);
    thudGain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    thudGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.04);
    thud.connect(thudGain);
    thudGain.connect(audioCtx.destination);

    thud.start();
    thud.stop(audioCtx.currentTime + 0.05);
}

function startThreatSound() {
    if (!audioCtx || audioCtx.state !== 'running') return;
    
    // Detener cualquier sonido previo
    stopThreatSound();
    
    // Generar Ruido Rosa para simular el aire de los pulmones
    const bufferSize = audioCtx.sampleRate * 4; 
    const buffer = createPinkNoise(audioCtx, bufferSize);
    
    threatAudioBufferSrc = audioCtx.createBufferSource();
    threatAudioBufferSrc.buffer = buffer;
    threatAudioBufferSrc.loop = true;
    
    // Filtro pasa-banda para simular garganta / laringe humana (estilo pesado oscuro)
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 900; // Resonancia típica de garganta
    filter.Q.value = 1.0; 
    
    threatAudioGain = audioCtx.createGain();
    
    // Envolventes de volumen cronometradas para Inhalación > Retención > Exhalación
    const now = audioCtx.currentTime;
    threatAudioGain.gain.setValueAtTime(0.01, now);
    
    // Inhala lento e intenso (0s a 1.2s)
    threatAudioGain.gain.linearRampToValueAtTime(1.5, now + 1.2);
    // Retiene tensión (1.2s a 1.4s)
    threatAudioGain.gain.linearRampToValueAtTime(1.2, now + 1.4); 
    // Exhala fuertemente decallendo (1.4s a 2.5s)
    threatAudioGain.gain.exponentialRampToValueAtTime(0.02, now + 2.5); 
    // Pausa de pulmones vacíos hasta el 3.5s
    threatAudioGain.gain.setValueAtTime(0.02, now + 3.5); 
    // Inhala de nuevo (Por si el hacker se demora un segundo extra en irse)
    threatAudioGain.gain.linearRampToValueAtTime(1.5, now + 4.7);
    
    threatAudioBufferSrc.connect(filter);
    filter.connect(threatAudioGain);
    threatAudioGain.connect(audioCtx.destination);
    
    threatAudioBufferSrc.start();
}

function stopThreatSound() {
    stopFootstepsSound();
    if (threatAudioGain && audioCtx) {
        try {
            threatAudioGain.gain.cancelScheduledValues(audioCtx.currentTime);
            threatAudioGain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
        } catch(e) {}
    }
    if (threatAudioBufferSrc) {
        try {
            threatAudioBufferSrc.stop();
            threatAudioBufferSrc.disconnect();
        } catch(e) {}
        threatAudioBufferSrc = null;
    }
}

function playGlitchSound() {
    if (!audioCtx || audioCtx.state !== 'running') return;
    const bufferSize = audioCtx.sampleRate * 0.5; // Medio segundo de ruido
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1; // Ruido blanco
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    
    noise.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();
}

function playMenuMusic() {
    if (state.screenOff) return;
    
    // Solo reproducir si la pantalla activa del DOM es 'menu' o 'name'
    const menuScreen = document.getElementById('screen-menu');
    const nameScreen = document.getElementById('screen-name');
    const isMenuOrNameActive = (menuScreen && menuScreen.classList.contains('active')) || 
                               (nameScreen && nameScreen.classList.contains('active'));
    
    if (!isMenuOrNameActive) return;

    if (!menuMusic) {
        menuMusic = new Audio('sounds/menu.mp3');
        menuMusic.loop = true;
        menuMusic.volume = 0.45; // Volumen moderado para inmersión óptima
        
        menuMusic.addEventListener('timeupdate', () => {
            const mScreen = document.getElementById('screen-menu');
            const nScreen = document.getElementById('screen-name');
            const ps1Screen = document.getElementById('screen-ps1-intro');
            const isPs1Active = ps1Screen && (!ps1Screen.classList.contains('hidden') || ps1Screen.classList.contains('active'));
            const isActive = !isPs1Active && !(window.state && window.state.freeRoam) && (
                (mScreen && mScreen.classList.contains('active') && !mScreen.classList.contains('hidden')) || 
                (nScreen && nScreen.classList.contains('active') && !nScreen.classList.contains('hidden'))
            );
            if (!isActive) {
                if (menuMusic && !menuMusic.paused) {
                    menuMusic.pause();
                    menuMusic.currentTime = 0;
                }
                triggerMenuGlitchVisualEffect(false);
                return;
            }

            // Sincronización de sonido de glitch a las 00:01:16 (segundo 76) y a las 00:01:41 (segundo 101).
            const glitch1Active = menuMusic.currentTime >= 76.0 && menuMusic.currentTime <= 78.5;
            const glitch2Active = menuMusic.currentTime >= 101.0 && menuMusic.currentTime <= 103.5;
            
            if (glitch1Active || glitch2Active) {
                triggerMenuGlitchVisualEffect(true);
            } else {
                triggerMenuGlitchVisualEffect(false);
            }
        });
    }

    if (menuMusic.paused) {
        menuMusic.play().then(() => {
            menuMusicInitialized = true;
            // Verificar si el usuario ya salió del menú antes de que resolviera la promesa de reproducción
            const mScreen = document.getElementById('screen-menu');
            const nScreen = document.getElementById('screen-name');
            const ps1Screen = document.getElementById('screen-ps1-intro');
            const isPs1Active = ps1Screen && (!ps1Screen.classList.contains('hidden') || ps1Screen.classList.contains('active'));
            const isActive = !isPs1Active && !(window.state && window.state.freeRoam) && (
                (mScreen && mScreen.classList.contains('active') && !mScreen.classList.contains('hidden')) || 
                (nScreen && nScreen.classList.contains('active') && !nScreen.classList.contains('hidden'))
            );
            if (!isActive && menuMusic) {
                menuMusic.pause();
                menuMusic.currentTime = 0;
                triggerMenuGlitchVisualEffect(false);
            }
        }).catch(err => {
            // Autoplay bloqueado controlado
            console.log("Autoplay del menú bloqueado (esperando interacción):", err);
        });
    }
}

function stopMenuMusic() {
    if (menuMusic) {
        menuMusic.pause();
        menuMusic.currentTime = 0;
    }
    document.body.classList.remove('menu-glitch-active');
    triggerMenuGlitchVisualEffect(false);
}

function triggerMenuGlitchVisualEffect(active) {
    const ps1Screen = document.getElementById('screen-ps1-intro');
    const isPs1Active = ps1Screen && (!ps1Screen.classList.contains('hidden') || ps1Screen.classList.contains('active'));
    if (isPs1Active || (window.state && window.state.freeRoam)) {
        document.body.classList.remove('menu-glitch-active');
        return;
    }

    // Solo aplicar el glitch visual si el menú principal o la pantalla de nombre están activas
    const menuScreen = document.getElementById('screen-menu');
    const nameScreen = document.getElementById('screen-name');
    const isMenuOrNameActive = (menuScreen && menuScreen.classList.contains('active') && !menuScreen.classList.contains('hidden')) ||
                               (nameScreen && nameScreen.classList.contains('active') && !nameScreen.classList.contains('hidden'));

    const body = document.body;
    if (active && isMenuOrNameActive) {
        if (!body.classList.contains('menu-glitch-active')) {
            body.classList.add('menu-glitch-active');
        }
    } else {
        if (body.classList.contains('menu-glitch-active')) {
            body.classList.remove('menu-glitch-active');
        }
    }
}

// Iniciar música en la primera interacción del usuario con la página
const playMusicOnGesture = () => {
    initAudio();
    playMenuMusic();
    if (menuMusic && !menuMusic.paused) {
        document.removeEventListener('click', playMusicOnGesture);
        document.removeEventListener('keydown', playMusicOnGesture);
        document.removeEventListener('touchstart', playMusicOnGesture);
    }
};

document.addEventListener('click', playMusicOnGesture);
document.addEventListener('keydown', playMusicOnGesture);
document.addEventListener('touchstart', playMusicOnGesture);

// 1. Boot Chime
function playBootSound() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    
    // Beep 1
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.15);
    
    // Beep 2
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(659.25, now + 0.1); // E5
    gain2.gain.setValueAtTime(0.08, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.25);
    
    // Chord
    const chordFreqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    chordFreqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + 0.25);
        gain.gain.setValueAtTime(0.06, now + 0.25);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + 0.25);
        osc.stop(now + 0.8);
    });
}

// 2. Error Beep
function playErrorSound() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(120, now);
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(123, now); // Disonante
    
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    
    // Filtro pasa-bajos para quitar agudos molestos
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);
    
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.3);
    osc2.stop(now + 0.3);
}

// 3. Success Sound
function playSuccessSound() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    const scale = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
    
    scale.forEach((freq, idx) => {
        const timeOffset = idx * 0.08;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + timeOffset);
        
        gain.gain.setValueAtTime(0.08, now + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.35);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(now + timeOffset);
        osc.stop(now + timeOffset + 0.4);
    });
}

// 4. Window Open Swoosh
function playWindowOpenSound() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
    
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(now);
    osc.stop(now + 0.18);
}

// 5. Window Close/Minimize Swoosh
function playWindowCloseSound() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, now);
    osc.frequency.exponentialRampToValueAtTime(250, now + 0.15);
    
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(now);
    osc.stop(now + 0.18);
}

// 6. Trash crumple / deletion sound
function playTrashEmptySound() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    
    // Generate multiple tiny crackles using high-pass filtered noise bursts
    const bursts = 6;
    for (let i = 0; i < bursts; i++) {
        const timeOffset = i * 0.05 + Math.random() * 0.02;
        const dur = 0.04 + Math.random() * 0.03;
        
        const noiseSize = audioCtx.sampleRate * dur;
        const buffer = audioCtx.createBuffer(1, noiseSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for(let j=0; j<noiseSize; j++) data[j] = Math.random()*2 - 1;
        
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1500 + Math.random() * 1000, now + timeOffset);
        
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.08, now + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + dur - 0.01);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        
        noise.start(now + timeOffset);
        noise.stop(now + timeOffset + dur);
    }
}

// 7. Virus Alarm
function playVirusAlarmSound() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    
    // Alternating tone alert (like a soft retro warning siren)
    const tones = [880, 587.33, 880, 587.33]; // A5 -> D5
    tones.forEach((freq, idx) => {
        const timeOffset = idx * 0.25;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + timeOffset);
        
        gain.gain.setValueAtTime(0.04, now + timeOffset);
        gain.gain.setValueAtTime(0.04, now + timeOffset + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.24);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(now + timeOffset);
        osc.stop(now + timeOffset + 0.25);
    });
}

// 8. Dial-up packet transmission static sound (for web loading latencia)
function playWebLoadingSound() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    const duration = 1.0; // 1 second of loading static
    
    const noiseSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, noiseSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    // combine noise with modulated sine waves
    for (let i = 0; i < noiseSize; i++) {
        const noise = Math.random() * 2 - 1;
        const carrier = Math.sin(2 * Math.PI * 1200 * (i / audioCtx.sampleRate) + Math.sin(2 * Math.PI * 45 * (i / audioCtx.sampleRate)) * 10);
        data[i] = (noise * 0.4 + carrier * 0.6) * 0.15;
    }
    
    const noiseSrc = audioCtx.createBufferSource();
    noiseSrc.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(2.0, now);
    
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.05, now + duration - 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    noiseSrc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    
    noiseSrc.start(now);
    noiseSrc.stop(now + duration);
}

// Asignar sonido a CUALQUIER clic para máxima inmersión táctil
window.addEventListener('click', () => {
    if (audioCtx) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        playClickSound();
    }
});

// ============================================================
// WINHELLO VOICE SYSTEM (Web Speech API + Synthetic Fallback)
// ============================================================

let winHelloVoiceMuted = false;
let winHelloCurrentUtterance = null;
let winHelloSpeechAvailable = 'speechSynthesis' in window;
let winHelloSelectedVoice = null;
let winHelloVoiceReady = false;

// Initialize voice selection — pick best voice based on language and cyber-assistant aesthetics
function getWinHelloVoice(lang) {
    if (!('speechSynthesis' in window)) return null;
    const voices = speechSynthesis.getVoices() || [];
    if (!voices || voices.length === 0) return null;

    const isEn = lang === 'en';
    const langPrefix = isEn ? 'en' : 'es';
    
    // Filter voices matching language
    const langVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith(langPrefix));
    const pool = langVoices.length > 0 ? langVoices : voices;
    
    if (isEn) {
        // Preferred English voices (natural or clean cyber AI assistant)
        const preferredKeywords = ['google us english', 'microsoft zira', 'microsoft david', 'microsoft mark', 'samantha', 'alex', 'daniel', 'fred', 'george', 'serena', 'guy'];
        for (const kw of preferredKeywords) {
            const match = pool.find(v => v.name.toLowerCase().includes(kw));
            if (match) return match;
        }
        // Preferred locales
        const locMatch = pool.find(v => v.lang === 'en-US' || v.lang === 'en-GB');
        if (locMatch) return locMatch;
    } else {
        // Preferred Spanish masculine/cyber voices
        const preferredKeywords = ['julio', 'david', 'miguel', 'pablo', 'carlos', 'manuel', 'enrique', 'jorge', 'juan', 'diego', 'helena', 'sabina', 'monica', 'masculino', 'male'];
        for (const kw of preferredKeywords) {
            const match = pool.find(v => v.name.toLowerCase().includes(kw));
            if (match) return match;
        }
        const locMatch = pool.find(v => v.lang === 'es-ES' || v.lang === 'es-MX' || v.lang === 'es-US' || v.lang === 'es-AR');
        if (locMatch) return locMatch;
    }
    
    return pool[0] || null;
}

function initWinHelloVoice() {
    if (!winHelloSpeechAvailable) return;
    
    const loadVoices = () => {
        const currentLang = (typeof window.getLanguage === 'function') ? window.getLanguage() : 'es';
        winHelloSelectedVoice = getWinHelloVoice(currentLang);
        winHelloVoiceReady = true;
    };
    
    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    window.addEventListener('languageChanged', () => {
        loadVoices();
    });
}

function playWinHelloVoice(text, mood = 'normal') {
    if (winHelloVoiceMuted || !winHelloSpeechAvailable) {
        // Fallback to vocal beeps if TTS not available
        if (!winHelloSpeechAvailable) playVocalBeep(text);
        return null;
    }
    
    // Si el jugador está en modo libre y no está sentado a la PC, no reproducir voz
    if (state.freeRoam && !document.body.classList.contains('ps1-monitor-active')) {
        return null;
    }

    // Cancel any ongoing speech
    stopWinHelloVoice();
    
    const utterance = new SpeechSynthesisUtterance(text);
    winHelloCurrentUtterance = utterance;
    
    const currentLang = (typeof window.getLanguage === 'function') ? window.getLanguage() : 'es';
    utterance.lang = currentLang === 'en' ? 'en-US' : 'es-ES';
    
    const chosenVoice = getWinHelloVoice(currentLang) || winHelloSelectedVoice;
    if (chosenVoice) utterance.voice = chosenVoice;
    
    // Configure rate and pitch tailored for natural English vs Spanish speech
    if (currentLang === 'en') {
        switch (mood) {
            case 'panic':
            case 'scream':
                utterance.rate = 1.20;
                utterance.pitch = 1.25;
                utterance.volume = 0.95;
                break;
            case 'alert':
                utterance.rate = 1.08;
                utterance.pitch = 1.15;
                utterance.volume = 0.9;
                break;
            case 'proud':
            case 'wink':
                utterance.rate = 0.98;
                utterance.pitch = 1.10;
                utterance.volume = 0.85;
                break;
            case 'creepy':
                utterance.rate = 0.82;
                utterance.pitch = 0.88;
                utterance.volume = 0.8;
                break;
            case 'sleep':
                utterance.rate = 0.78;
                utterance.pitch = 0.95;
                utterance.volume = 0.55;
                break;
            default: // normal English cyber voice
                utterance.rate = 1.02;
                utterance.pitch = 1.08;
                utterance.volume = 0.85;
                break;
        }
    } else {
        switch (mood) {
            case 'panic':
            case 'scream':
                utterance.rate = 1.30;
                utterance.pitch = 1.65;
                utterance.volume = 0.9;
                break;
            case 'alert':
                utterance.rate = 1.15;
                utterance.pitch = 1.45;
                utterance.volume = 0.85;
                break;
            case 'proud':
            case 'wink':
                utterance.rate = 0.95;
                utterance.pitch = 1.35;
                utterance.volume = 0.8;
                break;
            case 'creepy':
                utterance.rate = 0.82;
                utterance.pitch = 0.90;
                utterance.volume = 0.75;
                break;
            case 'sleep':
                utterance.rate = 0.75;
                utterance.pitch = 1.05;
                utterance.volume = 0.5;
                break;
            default: // normal Spanish cyber voice
                utterance.rate = 0.98;
                utterance.pitch = 1.35;
                utterance.volume = 0.8;
                break;
        }
    }
    
    // Events for lip-sync and equalizer
    utterance.onstart = () => {
        const widget = document.querySelector('.winhello-face-widget');
        const eq = document.querySelector('.winhello-equalizer');
        if (widget) widget.classList.add('speaking');
        if (eq) eq.classList.add('active');
        window.dispatchEvent(new CustomEvent('winhello-speech-start'));
    };
    
    utterance.onend = () => {
        const widget = document.querySelector('.winhello-face-widget');
        const eq = document.querySelector('.winhello-equalizer');
        if (widget) widget.classList.remove('speaking');
        if (eq) eq.classList.remove('active');
        winHelloCurrentUtterance = null;
        window.dispatchEvent(new CustomEvent('winhello-speech-end'));
    };
    
    utterance.onerror = () => {
        const widget = document.querySelector('.winhello-face-widget');
        const eq = document.querySelector('.winhello-equalizer');
        if (widget) widget.classList.remove('speaking');
        if (eq) eq.classList.remove('active');
        winHelloCurrentUtterance = null;
        window.dispatchEvent(new CustomEvent('winhello-speech-end'));
    };

    speechSynthesis.speak(utterance);
    return utterance;
}

function stopWinHelloVoice() {
    if ('speechSynthesis' in window) {
        try {
            window.speechSynthesis.pause();
            window.speechSynthesis.cancel();
        } catch(e) {}
    }
    if (winHelloCurrentUtterance) {
        winHelloCurrentUtterance.onend = null;
        winHelloCurrentUtterance.onerror = null;
        winHelloCurrentUtterance = null;
    }
    const widget = document.querySelector('.winhello-face-widget');
    const eq = document.querySelector('.winhello-equalizer');
    if (widget) widget.classList.remove('speaking');
    if (eq) eq.classList.remove('active');
    window.dispatchEvent(new CustomEvent('winhello-speech-end'));
}

function toggleWinHelloMute() {
    winHelloVoiceMuted = !winHelloVoiceMuted;
    if (winHelloVoiceMuted) {
        stopWinHelloVoice();
    }
    const muteBtn = document.getElementById('winhello-mute-btn');
    if (muteBtn) {
        muteBtn.textContent = winHelloVoiceMuted ? '🔇' : '🔊';
        muteBtn.classList.toggle('muted', winHelloVoiceMuted);
    }
    return winHelloVoiceMuted;
}

// Thinking sound — electronic processing beeps before speaking
function playThinkingSound() {
    if (!audioCtx || audioCtx.state !== 'running') return;
    const now = audioCtx.currentTime;
    
    // 3 ascending quick beeps
    const freqs = [600, 900, 1200];
    freqs.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.04, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.06);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.07);
    });
}

// Vocal beep fallback — robotic compressed speech sounds
function playVocalBeep(text) {
    if (!audioCtx || audioCtx.state !== 'running') return;
    const now = audioCtx.currentTime;
    const syllables = Math.min(Math.ceil(text.length / 4), 30);
    
    for (let i = 0; i < syllables; i++) {
        const t = now + i * 0.06;
        const freq = 450 + Math.random() * 500;
        
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.linearRampToValueAtTime(freq * (0.8 + Math.random() * 0.4), t + 0.04);
        
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800 + Math.random() * 1200, t);
        filter.Q.setValueAtTime(5, t);
        
        gain.gain.setValueAtTime(0.03, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.055);
    }
    
    // Simulate lip-sync for beep mode
    const widget = document.querySelector('.winhello-face-widget');
    const eq = document.querySelector('.winhello-equalizer');
    if (widget) widget.classList.add('speaking');
    if (eq) eq.classList.add('active');
    setTimeout(() => {
        if (widget) widget.classList.remove('speaking');
        if (eq) eq.classList.remove('active');
    }, syllables * 60 + 200);
}

// Achievement / proud sound
function playProudSound() {
    if (!audioCtx || audioCtx.state !== 'running') return;
    const now = audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5 to E6
    notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(0.06, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.35);
    });
}

// Sleep ambient hum
function playSleepSound() {
    if (!audioCtx || audioCtx.state !== 'running') return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, now);
    gain.gain.setValueAtTime(0.02, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 2.1);
}

// --- EFECTOS DE AUDIO: GOLPES EN LA PUERTA, PASOS ALEJÁNDOSE Y SCREAMER ---
let doorKnockInterval = null;

function playSingleKnockThud(timeOffset = 0, intensity = 1.0) {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime + timeOffset;

    // 1. Golpe de impacto grave (resonancia de madera hueca)
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(95 + Math.random() * 20, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.14);

    oscGain.gain.setValueAtTime(0.75 * intensity, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(oscGain);
    oscGain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.18);

    // 2. Ruido sordo del choque de nudillos/cuerpo contra la madera
    const bufferSize = Math.floor(audioCtx.sampleRate * 0.08);
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320 + Math.random() * 80, now);
    filter.Q.setValueAtTime(2.2, now);

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.6 * intensity, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);

    noise.start(now);
    noise.stop(now + 0.1);
}

function playDoorKnockSequence() {
    stopDoorKnockSequence();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    // Ráfaga inmediata de 3 golpes secos
    playSingleKnockThud(0.0, 1.0);
    playSingleKnockThud(0.18, 0.9);
    playSingleKnockThud(0.38, 1.1);

    // Ciclo continuo de golpes desesperados cada 1.2 segundos
    doorKnockInterval = setInterval(() => {
        playSingleKnockThud(0.0, 1.0);
        playSingleKnockThud(0.16, 0.95);
        playSingleKnockThud(0.34, 1.15);
    }, 1100);
}

function stopDoorKnockSequence() {
    if (doorKnockInterval) {
        clearInterval(doorKnockInterval);
        doorKnockInterval = null;
    }
}

function playFootstepsAwaySound() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const numSteps = 5;
    for (let i = 0; i < numSteps; i++) {
        const timeOffset = i * 0.45;
        const volumeFactor = Math.max(0.05, 0.45 - i * 0.08); // Se desvanece
        
        const now = audioCtx.currentTime + timeOffset;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(70 - i * 5, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(Math.max(100, 500 - i * 80), now);

        gain.gain.setValueAtTime(volumeFactor, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
    }
}

function playScreamerAudio() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    const duration = 1.8;

    // 1. Chillido disonante agudo y desgarrador
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const screamerGain = audioCtx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(850, now);
    osc1.frequency.linearRampToValueAtTime(1200, now + 0.3);
    osc1.frequency.exponentialRampToValueAtTime(300, now + duration);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(890, now);
    osc2.frequency.linearRampToValueAtTime(1250, now + 0.3);
    osc2.frequency.exponentialRampToValueAtTime(320, now + duration);

    screamerGain.gain.setValueAtTime(0.85, now);
    screamerGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    osc1.connect(screamerGain);
    osc2.connect(screamerGain);
    screamerGain.connect(audioCtx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);

    // 2. Estallido violento de ruido blanco distorsionado
    const bufferSize = Math.floor(audioCtx.sampleRate * duration);
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.7));
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(400, now);

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.9, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);

    noise.start(now);
    noise.stop(now + duration);

    // 3. Golpe de sub-graves demoledor
    const subOsc = audioCtx.createOscillator();
    const subGain = audioCtx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(140, now);
    subOsc.frequency.exponentialRampToValueAtTime(25, now + 0.6);

    subGain.gain.setValueAtTime(0.95, now);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

    subOsc.connect(subGain);
    subGain.connect(audioCtx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.75);
}

function playPebbleTapSound() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;

    [0, 0.08].forEach((offset, idx) => {
        const t = now + offset;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(idx === 0 ? 3200 : 2800, t);
        osc.frequency.exponentialRampToValueAtTime(1400, t + 0.06);

        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1800, t);

        gain.gain.setValueAtTime(idx === 0 ? 0.35 : 0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + (idx === 0 ? 0.12 : 0.08));

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(t);
        osc.stop(t + 0.15);

        const bufSize = Math.floor(audioCtx.sampleRate * 0.02);
        const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.3));
        const nSrc = audioCtx.createBufferSource();
        nSrc.buffer = buf;
        const nGain = audioCtx.createGain();
        nGain.gain.setValueAtTime(0.2, t);
        nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
        nSrc.connect(nGain);
        nGain.connect(audioCtx.destination);
        nSrc.start(t);
        nSrc.stop(t + 0.03);
    });
}

function playDoorRattleSound() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;

    for (let i = 0; i < 4; i++) {
        const t = now + i * 0.07;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220 + Math.random() * 80, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.05);

        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.07);
    }
}

function playDoorCrashDownSound() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;

    const crackOsc = audioCtx.createOscillator();
    const crackGain = audioCtx.createGain();
    crackOsc.type = 'sawtooth';
    crackOsc.frequency.setValueAtTime(450, now);
    crackOsc.frequency.exponentialRampToValueAtTime(40, now + 0.35);
    crackGain.gain.setValueAtTime(0.7, now);
    crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    crackOsc.connect(crackGain);
    crackGain.connect(audioCtx.destination);
    crackOsc.start(now);
    crackOsc.stop(now + 0.45);

    const bufSize = Math.floor(audioCtx.sampleRate * 0.6);
    const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.4));
    const noise = audioCtx.createBufferSource();
    noise.buffer = buf;
    const nFilter = audioCtx.createBiquadFilter();
    nFilter.type = 'lowpass';
    nFilter.frequency.setValueAtTime(380, now);
    const nGain = audioCtx.createGain();
    nGain.gain.setValueAtTime(0.9, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    noise.connect(nFilter);
    nFilter.connect(nGain);
    nGain.connect(audioCtx.destination);
    noise.start(now);
    noise.stop(now + 0.65);

    const subOsc = audioCtx.createOscillator();
    const subGain = audioCtx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(90, now);
    subOsc.frequency.exponentialRampToValueAtTime(20, now + 0.5);
    subGain.gain.setValueAtTime(0.95, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    subOsc.connect(subGain);
    subGain.connect(audioCtx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.6);
}

// Initialize voice on load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initWinHelloVoice);
}

// Exportar globalmente
window.audioCtx = audioCtx;
window.realAudioBreathing = realAudioBreathing;
window.realAudioFootsteps = realAudioFootsteps;
window.initAudio = initAudio;
window.playClickSound = playClickSound;
window.playSynthesizedFootsteps = playSynthesizedFootsteps;
window.playTypeSound = playTypeSound;
window.startThreatSound = startThreatSound;
window.stopThreatSound = stopThreatSound;
window.playGlitchSound = playGlitchSound;
window.playMenuMusic = playMenuMusic;
window.stopMenuMusic = stopMenuMusic;
window.triggerMenuGlitchVisualEffect = triggerMenuGlitchVisualEffect;
window.playBootSound = playBootSound;
window.playErrorSound = playErrorSound;
window.playSuccessSound = playSuccessSound;
window.playWindowOpenSound = playWindowOpenSound;
window.playWindowCloseSound = playWindowCloseSound;
window.playTrashEmptySound = playTrashEmptySound;
window.playVirusAlarmSound = playVirusAlarmSound;
window.playWebLoadingSound = playWebLoadingSound;
// Door Knocks, Footsteps, Screamer & Environmental exports
window.playDoorKnockSequence = playDoorKnockSequence;
window.stopDoorKnockSequence = stopDoorKnockSequence;
window.playFootstepsAwaySound = playFootstepsAwaySound;
window.playScreamerAudio = playScreamerAudio;
window.playPebbleTapSound = playPebbleTapSound;
window.playDoorRattleSound = playDoorRattleSound;
window.playDoorCrashDownSound = playDoorCrashDownSound;
// WinHello Voice exports
window.initWinHelloVoice = initWinHelloVoice;
window.playWinHelloVoice = playWinHelloVoice;
window.stopWinHelloVoice = stopWinHelloVoice;
window.toggleWinHelloMute = toggleWinHelloMute;
window.playThinkingSound = playThinkingSound;
window.playVocalBeep = playVocalBeep;
window.playProudSound = playProudSound;
window.playSleepSound = playSleepSound;
window.winHelloVoiceMuted = winHelloVoiceMuted;
