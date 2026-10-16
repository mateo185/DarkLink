// --- OPSEC HAZARD SYSTEM: PHYSICAL PRESENCE THREAT ---
// Random ambient events that create tension in the sandbox/free-roam mode.
// Simulates someone physically approaching the player's location.

let opsecHazardInterval = null;
let opsecHazardActive = false;
let opsecHazardGraceTimeout = null;
let opsecEventInProgress = false;

// Configuration
const OPSEC_CHECK_INTERVAL = 60000; // Check every 60 seconds
const OPSEC_TRIGGER_CHANCE = 0.08;  // 8% chance per check
const OPSEC_GRACE_PERIOD = 6000;    // 6 seconds to turn off the monitor
const OPSEC_PENALTY_BTC = 0.02;     // BTC lost if caught

function initOpsecHazard() {
    if (opsecHazardInterval) clearInterval(opsecHazardInterval);
    opsecHazardActive = true;
    opsecEventInProgress = false;

    opsecHazardInterval = setInterval(() => {
        if (!opsecHazardActive) return;
        if (!state.freeRoam) return;
        if (opsecEventInProgress) return;
        
        // Don't trigger during active threats or minigames
        if (state.threatActive || state.isMinigameActive) return;
        
        // Check if screen is already off
        const screenBlack = document.getElementById('screen-black');
        if (screenBlack && !screenBlack.classList.contains('hidden')) return;

        if (Math.random() < OPSEC_TRIGGER_CHANCE) {
            triggerOpsecEvent();
        }
    }, OPSEC_CHECK_INTERVAL);
}

function triggerOpsecEvent() {
    opsecEventInProgress = true;

    // 1. WinHello reacts in panic
    if (typeof setWinHelloEmotion === 'function') {
        setWinHelloEmotion('panic');
    }
    
    const lang = (typeof window.getLanguage === 'function') ? window.getLanguage() : 'es';
    const warningMessages_en = [
        '⚠ OPSEC ALERT! Physical presence detected approaching your location. TURN OFF THE MONITOR IMMEDIATELY!',
        '⚠ DANGER! Footstep sounds detected in the room. Press the monitor power button NOW!',
        '⚠ PHYSICAL INTRUSION IN PROGRESS! Someone is approaching the perimeter. TURN OFF THE SCREEN before you are exposed!'
    ];
    const warningMessages_es = [
        '⚠ ¡ALERTA OPSEC! He detectado presencia física acercándose a su ubicación. ¡APAGUE EL MONITOR INMEDIATAMENTE!',
        '⚠ ¡PELIGRO! Ruido de pasos detectado en la habitación. ¡Pulse el botón de encendido de la pantalla AHORA!',
        '⚠ ¡INTRUSIÓN FÍSICA EN CURSO! Alguien se acerca al perímetro. ¡APAGUE LA PANTALLA antes de que lo descubran!'
    ];
    const warningMessages = lang === 'en' ? warningMessages_en : warningMessages_es;
    
    if (typeof showWinHelloBubble === 'function') {
        showWinHelloBubble(warningMessages[Math.floor(Math.random() * warningMessages.length)], 10000, 'panic');
    }

    // 2. Play ambient footstep-like sounds using Web Audio API
    playFootstepSequence();

    // 3. Start grace period countdown
    opsecHazardGraceTimeout = setTimeout(() => {
        // Check if the player turned off the monitor in time
        const screenBlack = document.getElementById('screen-black');
        const monitorOff = screenBlack && !screenBlack.classList.contains('hidden');

        if (monitorOff) {
            // Player was smart - reward them
            opsecEventInProgress = false;
            
            if (typeof setWinHelloEmotion === 'function') {
                setWinHelloEmotion('proud');
            }
            
            setTimeout(() => {
                if (typeof showWinHelloBubble === 'function') {
                    const successMsg = lang === 'en'
                        ? '✓ Physical threat neutralized. Excellent reaction time, operator. OPSEC integrity maintained.'
                        : '✓ Amenaza física neutralizada. Excelente tiempo de reacción, operador. Integridad OPSEC mantenida.';
                    showWinHelloBubble(successMsg, 6000, 'proud');
                }
                setTimeout(() => {
                    if (typeof setWinHelloEmotion === 'function') {
                        setWinHelloEmotion('normal');
                    }
                }, 6000);
            }, 2000);
        } else {
            // Player got caught! Apply penalty
            applyOpsecPenalty();
        }
    }, OPSEC_GRACE_PERIOD);
}

function applyOpsecPenalty() {
    const lang = (typeof window.getLanguage === 'function') ? window.getLanguage() : 'es';

    // Glitch scare effect
    const container = document.getElementById('monitor-container') || document.getElementById('game-container');
    if (container) {
        container.classList.add('glitch-scare');
        setTimeout(() => {
            container.classList.remove('glitch-scare');
        }, 1500);
    }

    // Play glitch sound
    if (typeof playGlitchSound === 'function') playGlitchSound();

    // Deduct BTC
    if (typeof updateWallet === 'function') {
        updateWallet(-OPSEC_PENALTY_BTC);
    }

    // WinHello alerts
    if (typeof showWinHelloBubble === 'function') {
        const penaltyMsg = lang === 'en'
            ? `✗ COMPROMISED! Your physical location was discovered. ₿ ${OPSEC_PENALTY_BTC.toFixed(3)} BTC lost as operational security penalty.`
            : `✗ ¡DESCUBIERTO! Su ubicación física ha sido comprometida. Se han perdido ₿ ${OPSEC_PENALTY_BTC.toFixed(3)} BTC como penalización de seguridad operacional.`;
        showWinHelloBubble(penaltyMsg, 10000, 'panic');
    }

    // Reset after penalty
    setTimeout(() => {
        opsecEventInProgress = false;
        if (typeof setWinHelloEmotion === 'function') {
            setWinHelloEmotion('alert');
        }
        setTimeout(() => {
            if (typeof setWinHelloEmotion === 'function') {
                setWinHelloEmotion('normal');
            }
        }, 5000);
    }, 3000);
}

function playFootstepSequence() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();

        // Simulate 3-5 footstep-like thuds with increasing volume
        const numSteps = 3 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < numSteps; i++) {
            const startTime = ctx.currentTime + (i * 0.7) + (Math.random() * 0.15);
            const volume = 0.02 + (i * 0.015); // Gets louder (approaching)

            // Low frequency thud
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(60 + Math.random() * 30, startTime);
            osc.frequency.exponentialRampToValueAtTime(30, startTime + 0.12);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(200, startTime);
            
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(Math.min(volume, 0.08), startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.2);

            // Add a higher frequency click/creak component
            const click = ctx.createOscillator();
            const clickGain = ctx.createGain();
            click.type = 'square';
            click.frequency.setValueAtTime(800 + Math.random() * 400, startTime);
            clickGain.gain.setValueAtTime(0, startTime);
            clickGain.gain.linearRampToValueAtTime(volume * 0.3, startTime + 0.005);
            clickGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.04);
            click.connect(clickGain);
            clickGain.connect(ctx.destination);
            click.start(startTime);
            click.stop(startTime + 0.05);
        }
    } catch (err) {
        // Silent fail if audio context not available
    }
}

function shutdownOpsecHazard() {
    opsecHazardActive = false;
    if (opsecHazardInterval) {
        clearInterval(opsecHazardInterval);
        opsecHazardInterval = null;
    }
    if (opsecHazardGraceTimeout) {
        clearTimeout(opsecHazardGraceTimeout);
        opsecHazardGraceTimeout = null;
    }
    opsecEventInProgress = false;
}

// Auto-initialize when entering free roam
window.addEventListener('DOMContentLoaded', () => {
    // Watch for freeRoam state changes
    const originalFreeRoam = Object.getOwnPropertyDescriptor(state, 'freeRoam');
    
    // Use an interval to check since state.freeRoam may be set externally
    setInterval(() => {
        if (state.freeRoam && !opsecHazardActive) {
            initOpsecHazard();
        } else if (!state.freeRoam && opsecHazardActive) {
            shutdownOpsecHazard();
        }
    }, 3000);
});

// Export globally
window.initOpsecHazard = initOpsecHazard;
window.shutdownOpsecHazard = shutdownOpsecHazard;
