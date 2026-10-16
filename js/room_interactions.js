// ============================================================
// ROOM INTERACTIONS & PROCEDURAL AUDIO ENGINE (90s RETRO)
// 100% Web Audio API procedural synthesis — No external audio files
// ============================================================

(function () {
    'use strict';

    let actx = null;
    function getAudioCtx() {
        if (!actx) {
            actx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (actx.state === 'suspended') {
            actx.resume();
        }
        return actx;
    }

    // ============================================================
    // 1. PROCEDURAL SOUND GENERATORS (Web Audio API)
    // ============================================================

    // --- RUIDO BLANCO / ROSA SUAVIZADO (Anti-Saturación) ---
    function makeNoiseBuffer(ctx, duration = 2.0) {
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.4;
        }
        return buffer;
    }

    function makePinkNoiseBuffer(ctx, duration = 4.0) {
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
            b6 = white * 0.115926;
        }
        return buffer;
    }

    // --- SONIDO DE SALPICADURA DE CHARCO DE AGUA (AUTO A VELOCIDAD) ---
    function playPuddleSplashSound() {
        try {
            const ctx = getAudioCtx();
            if (!ctx) return;
            const now = ctx.currentTime;

            // 1. Impacto sordo y profundo del agua (Desplazamiento hidrodinámico)
            const thudOsc = ctx.createOscillator();
            const thudGain = ctx.createGain();
            thudOsc.type = 'sine';
            thudOsc.frequency.setValueAtTime(160, now);
            thudOsc.frequency.exponentialRampToValueAtTime(35, now + 0.35);
            thudGain.gain.setValueAtTime(0.45, now);
            thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.40);
            thudOsc.connect(thudGain);
            thudGain.connect(ctx.destination);
            thudOsc.start(now);
            thudOsc.stop(now + 0.45);

            // 2. Cortina de agua / Slosh de gotas pulverizadas
            const splashBuf = makePinkNoiseBuffer(ctx, 1.2);
            const splashSrc = ctx.createBufferSource();
            splashSrc.buffer = splashBuf;

            const splashFilter = ctx.createBiquadFilter();
            splashFilter.type = 'bandpass';
            splashFilter.frequency.setValueAtTime(2800, now);
            splashFilter.frequency.exponentialRampToValueAtTime(800, now + 0.8);
            splashFilter.Q.value = 1.2;

            const splashGain = ctx.createGain();
            splashGain.gain.setValueAtTime(0.001, now);
            splashGain.gain.linearRampToValueAtTime(0.55, now + 0.04);
            splashGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

            splashSrc.connect(splashFilter);
            splashFilter.connect(splashGain);
            splashGain.connect(ctx.destination);
            splashSrc.start(now);
            splashSrc.stop(now + 1.0);

            // 3. Zumbido / Whoosh del motor y neumáticos sobre asfalto mojado
            const whooshOsc = ctx.createOscillator();
            const whooshGain = ctx.createGain();
            whooshOsc.type = 'sawtooth';
            whooshOsc.frequency.setValueAtTime(95, now);
            whooshOsc.frequency.exponentialRampToValueAtTime(140, now + 0.15);
            whooshOsc.frequency.exponentialRampToValueAtTime(60, now + 0.6);

            const whooshFilter = ctx.createBiquadFilter();
            whooshFilter.type = 'lowpass';
            whooshFilter.frequency.setValueAtTime(450, now);

            whooshGain.gain.setValueAtTime(0.001, now);
            whooshGain.gain.linearRampToValueAtTime(0.28, now + 0.12);
            whooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

            whooshOsc.connect(whooshFilter);
            whooshFilter.connect(whooshGain);
            whooshGain.connect(ctx.destination);
            whooshOsc.start(now);
            whooshOsc.stop(now + 0.75);
        } catch (e) {
            console.warn('Puddle splash sound error:', e);
        }
    }

    // --- SONIDO DE AUTO VELOZ ACERCÁNDOSE (RUGIDO DE MOTOR + NEUMÁTICOS EN LLUVIA) ---
    function playApproachingCarSound() {
        if (window.state && window.state.isNightmareActive) return;
        try {
            const ctx = getAudioCtx();
            if (!ctx) return;
            const now = ctx.currentTime;

            // 1. Rugido del motor acelerando con efecto Doppler
            const engineOsc1 = ctx.createOscillator();
            const engineOsc2 = ctx.createOscillator();
            const engineFilter = ctx.createBiquadFilter();
            const engineGain = ctx.createGain();

            engineOsc1.type = 'sawtooth';
            engineOsc2.type = 'triangle';
            engineOsc1.frequency.setValueAtTime(70, now);
            engineOsc1.frequency.exponentialRampToValueAtTime(175, now + 1.8);
            engineOsc1.frequency.exponentialRampToValueAtTime(80, now + 3.2);

            engineOsc2.frequency.setValueAtTime(140, now);
            engineOsc2.frequency.exponentialRampToValueAtTime(350, now + 1.8);
            engineOsc2.frequency.exponentialRampToValueAtTime(160, now + 3.2);

            engineFilter.type = 'lowpass';
            engineFilter.frequency.setValueAtTime(220, now);
            engineFilter.frequency.linearRampToValueAtTime(750, now + 1.8);
            engineFilter.frequency.linearRampToValueAtTime(280, now + 3.2);

            engineGain.gain.setValueAtTime(0.001, now);
            engineGain.gain.linearRampToValueAtTime(0.40, now + 1.8);
            engineGain.gain.exponentialRampToValueAtTime(0.001, now + 3.4);

            engineOsc1.connect(engineFilter);
            engineOsc2.connect(engineFilter);
            engineFilter.connect(engineGain);
            engineGain.connect(ctx.destination);

            engineOsc1.start(now);
            engineOsc2.start(now);
            engineOsc1.stop(now + 3.5);
            engineOsc2.stop(now + 3.5);

            // 2. Fricción de neumáticos cortando agua sobre asfalto mojado
            const tireBuf = makePinkNoiseBuffer(ctx, 3.5);
            const tireSrc = ctx.createBufferSource();
            tireSrc.buffer = tireBuf;

            const tireFilter = ctx.createBiquadFilter();
            tireFilter.type = 'bandpass';
            tireFilter.frequency.setValueAtTime(1100, now);
            tireFilter.frequency.linearRampToValueAtTime(2600, now + 1.8);
            tireFilter.frequency.linearRampToValueAtTime(1200, now + 3.2);
            tireFilter.Q.value = 1.0;

            const tireGain = ctx.createGain();
            tireGain.gain.setValueAtTime(0.001, now);
            tireGain.gain.linearRampToValueAtTime(0.35, now + 1.8);
            tireGain.gain.exponentialRampToValueAtTime(0.001, now + 3.4);

            tireSrc.connect(tireFilter);
            tireFilter.connect(tireGain);
            tireGain.connect(ctx.destination);

            tireSrc.start(now);
            tireSrc.stop(now + 3.5);
        } catch (e) {
            console.warn('Approaching car sound error:', e);
        }
    }

    // --- CLICK MECÁNICO (Botones de plástico 90s) ---
    function playRetroClick(pitch = 1.0) {
        try {
            const ctx = getAudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(140 * pitch, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.04);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.05);
        } catch (e) {}
    }

    // --- BOOMBOX PROCEDURAL FM RADIO ---
    let radioNodes = null;
    let radioStepTimer = null;
    let spontaneousCreepyRadioInterval = null;

    const STATIONS = [
        { name: "98.5 FM — Lofi / Synth Chill", genre: "synth" },
        { name: "103.1 FM — Euro Techno 90s", genre: "techno" },
        { name: "640 AM — Static & Strange Voices", genre: "am" },
        { name: "99.9 ??? — Numbers & Mystery", genre: "creepy" },
        { name: "94.3 FM — Dark Cyberwave 1998", genre: "cyberwave" },
        { name: "88.1 FM — Vapor Jazz Night", genre: "vaporjazz" },
        { name: "66.6 FM — Radio Espectro / Frecuencia Maldita", genre: "cursed" },
        { name: "105.7 FM — 8-Bit Chiptune Retro", genre: "chiptune" }
    ];

    function stopRadioAudio() {
        if (radioStepTimer) {
            clearInterval(radioStepTimer);
            radioStepTimer = null;
        }
        if (radioNodes) {
            try {
                if (radioNodes.gain) {
                    radioNodes.gain.gain.setValueAtTime(radioNodes.gain.gain.value, actx.currentTime);
                    radioNodes.gain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 0.1);
                }
                setTimeout(() => {
                    if (radioNodes && radioNodes.nodes) {
                        radioNodes.nodes.forEach(n => { try { n.stop && n.stop(); n.disconnect && n.disconnect(); } catch (e) {} });
                    }
                    radioNodes = null;
                }, 120);
            } catch (e) {
                radioNodes = null;
            }
        }
    }

    function startRadioStation(stationIdx) {
        stopRadioAudio();
        const ctx = getAudioCtx();
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
        masterGain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.15);
        masterGain.connect(ctx.destination);

        const nodes = [];

        const noiseBuf = makeNoiseBuffer(ctx, 3.0);
        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        noiseSrc.loop = true;
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = (stationIdx === 2 || stationIdx === 6) ? 1400 : 3500;
        noiseFilter.Q.value = (stationIdx === 2 || stationIdx === 6) ? 1.5 : 4.0;
        const noiseGain = ctx.createGain();
        noiseGain.gain.value = (stationIdx === 2 || stationIdx === 6) ? 0.30 : 0.04;
        noiseSrc.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(masterGain);
        noiseSrc.start();
        nodes.push(noiseSrc);

        if (stationIdx === 0) {
            // Lofi Chill
            const chords = [
                [220, 261.63, 329.63, 392],
                [174.61, 220, 261.63, 329.63],
                [130.81, 164.81, 196, 246.94],
                [196, 246.94, 293.66, 349.23]
            ];
            let chordIdx = 0;
            const oscGroup = [];
            chords[0].forEach(f => {
                const osc = ctx.createOscillator();
                osc.type = 'sawtooth';
                osc.frequency.value = f;
                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 650;
                const g = ctx.createGain();
                g.gain.value = 0.08;
                osc.connect(filter);
                filter.connect(g);
                g.connect(masterGain);
                osc.start();
                nodes.push(osc);
                oscGroup.push({ osc, filter });
            });

            radioStepTimer = setInterval(() => {
                chordIdx = (chordIdx + 1) % chords.length;
                const targetChord = chords[chordIdx];
                oscGroup.forEach((item, i) => {
                    item.osc.frequency.setValueAtTime(targetChord[i], ctx.currentTime);
                    item.filter.frequency.setValueAtTime(500, ctx.currentTime);
                    item.filter.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.8);
                });
            }, 2400);

        } else if (stationIdx === 1) {
            // Euro Techno 90s
            const bassFilter = ctx.createBiquadFilter();
            bassFilter.type = 'lowpass';
            bassFilter.frequency.value = 800;
            bassFilter.Q.value = 6;
            bassFilter.connect(masterGain);

            let beat = 0;
            const bassNotes = [110, 110, 130.8, 146.8, 110, 164.8, 146.8, 123.4];

            radioStepTimer = setInterval(() => {
                const now = ctx.currentTime;
                if (beat % 2 === 0) {
                    const kick = ctx.createOscillator();
                    const kg = ctx.createGain();
                    kick.frequency.setValueAtTime(160, now);
                    kick.frequency.exponentialRampToValueAtTime(45, now + 0.08);
                    kg.gain.setValueAtTime(0.4, now);
                    kg.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                    kick.connect(kg);
                    kg.connect(masterGain);
                    kick.start(now);
                    kick.stop(now + 0.15);
                }
                const bOsc = ctx.createOscillator();
                const bg = ctx.createGain();
                bOsc.type = 'sawtooth';
                bOsc.frequency.setValueAtTime(bassNotes[beat % bassNotes.length], now);
                bassFilter.frequency.setValueAtTime(400 + (beat % 4) * 300, now);
                bassFilter.frequency.exponentialRampToValueAtTime(1400, now + 0.1);
                bg.gain.setValueAtTime(0.12, now);
                bg.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
                bOsc.connect(bassFilter);
                bOsc.start(now);
                bOsc.stop(now + 0.2);
                beat = (beat + 1) % 16;
            }, 160);

        } else if (stationIdx === 2) {
            // AM Static & Strange Voices / Beeps
            radioStepTimer = setInterval(() => {
                if (Math.random() < 0.45) {
                    const now = ctx.currentTime;
                    const bleep = ctx.createOscillator();
                    const bg = ctx.createGain();
                    bleep.type = Math.random() < 0.5 ? 'sine' : 'sawtooth';
                    bleep.frequency.setValueAtTime(600 + Math.random() * 800, now);
                    bleep.frequency.exponentialRampToValueAtTime(200 + Math.random() * 300, now + 0.18);
                    bg.gain.setValueAtTime(0.09, now);
                    bg.gain.exponentialRampToValueAtTime(0.001, now + (Math.random() > 0.5 ? 0.08 : 0.2));
                    bleep.connect(bg);
                    bg.connect(masterGain);
                    bleep.start(now);
                    bleep.stop(now + 0.25);
                }
            }, 260);

        } else if (stationIdx === 3) {
            // Numbers & Mystery (Turbia / Incomoda)
            const drone1 = ctx.createOscillator();
            const drone2 = ctx.createOscillator();
            drone1.type = 'sawtooth';
            drone2.type = 'sine';
            drone1.frequency.value = 55;
            drone2.frequency.value = 58.27; // Battements discordantes
            const dFilter = ctx.createBiquadFilter();
            dFilter.type = 'lowpass';
            dFilter.frequency.value = 180;
            const dg = ctx.createGain();
            dg.gain.value = 0.16;
            drone1.connect(dFilter);
            drone2.connect(dFilter);
            dFilter.connect(dg);
            dg.connect(masterGain);
            drone1.start();
            drone2.start();
            nodes.push(drone1, drone2);

            let creepyStep = 0;
            radioStepTimer = setInterval(() => {
                creepyStep++;
                if (creepyStep % 4 === 0) {
                    const now = ctx.currentTime;
                    const bell = ctx.createOscillator();
                    const bg = ctx.createGain();
                    bell.type = 'sine';
                    bell.frequency.setValueAtTime(311.13 * (Math.floor(Math.random() * 3) + 1), now); // D# minor eerie
                    bg.gain.setValueAtTime(0.06, now);
                    bg.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
                    bell.connect(bg);
                    bg.connect(masterGain);
                    bell.start(now);
                    bell.stop(now + 1.5);
                }
            }, 800);

        } else if (stationIdx === 4) {
            // Dark Cyberwave 1998 (Synthwave arpeggiator)
            const arpNotes = [146.83, 174.61, 220.00, 293.66, 261.63, 220.00, 196.00, 164.81]; // D min
            let arpIdx = 0;
            radioStepTimer = setInterval(() => {
                const now = ctx.currentTime;
                const osc = ctx.createOscillator();
                const filter = ctx.createBiquadFilter();
                const gain = ctx.createGain();

                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(arpNotes[arpIdx % arpNotes.length], now);
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(1400, now);
                filter.frequency.exponentialRampToValueAtTime(350, now + 0.12);

                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(masterGain);
                osc.start(now);
                osc.stop(now + 0.15);
                arpIdx++;
            }, 140);

        } else if (stationIdx === 5) {
            // Vapor Jazz Night (Rhodes chords suaves)
            const jazzChords = [
                [174.61, 220.0, 261.63, 329.63], // Fmaj7
                [164.81, 196.0, 246.94, 293.66], // Em7
                [146.83, 174.61, 220.0, 261.63], // Dm7
                [130.81, 164.81, 196.0, 246.94]  // Cmaj7
            ];
            let jIdx = 0;
            const jOscGroup = [];
            jazzChords[0].forEach(f => {
                const osc = ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.value = f;
                const g = ctx.createGain();
                g.gain.value = 0.09;
                osc.connect(g);
                g.connect(masterGain);
                osc.start();
                nodes.push(osc);
                jOscGroup.push(osc);
            });

            radioStepTimer = setInterval(() => {
                jIdx = (jIdx + 1) % jazzChords.length;
                const cur = jazzChords[jIdx];
                jOscGroup.forEach((osc, i) => {
                    osc.frequency.setValueAtTime(cur[i], ctx.currentTime);
                });
            }, 2800);

        } else if (stationIdx === 6) {
            // Radio Espectro / Frecuencia Maldita (Música turbia / siniestra)
            const curDrone1 = ctx.createOscillator();
            const curDrone2 = ctx.createOscillator();
            curDrone1.type = 'triangle';
            curDrone2.type = 'sawtooth';
            curDrone1.frequency.value = 46.25; // F#1
            curDrone2.frequency.value = 49.00; // G1 (disonancia extrema tritono/semitono)

            const curFilter = ctx.createBiquadFilter();
            curFilter.type = 'lowpass';
            curFilter.frequency.value = 220;
            const curGain = ctx.createGain();
            curGain.gain.value = 0.18;

            curDrone1.connect(curFilter);
            curDrone2.connect(curFilter);
            curFilter.connect(curGain);
            curGain.connect(masterGain);
            curDrone1.start();
            curDrone2.start();
            nodes.push(curDrone1, curDrone2);

            let evilStep = 0;
            radioStepTimer = setInterval(() => {
                evilStep++;
                const now = ctx.currentTime;
                // Tonos invertidos y susurros de estática espectrales
                if (evilStep % 3 === 0) {
                    const revOsc = ctx.createOscillator();
                    const revGain = ctx.createGain();
                    revOsc.type = 'sine';
                    revOsc.frequency.setValueAtTime(740, now);
                    revOsc.frequency.exponentialRampToValueAtTime(110, now + 0.8);
                    revGain.gain.setValueAtTime(0.001, now);
                    revGain.gain.linearRampToValueAtTime(0.07, now + 0.2);
                    revGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
                    revOsc.connect(revGain);
                    revGain.connect(masterGain);
                    revOsc.start(now);
                    revOsc.stop(now + 0.85);
                }
            }, 900);

        } else if (stationIdx === 7) {
            // 8-Bit Chiptune Retro Arcade
            const chipNotes = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 293.66, 349.23, 440.00, 587.33, 440.00, 349.23];
            let chipIdx = 0;
            radioStepTimer = setInterval(() => {
                const now = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(chipNotes[chipIdx % chipNotes.length], now);
                gain.gain.setValueAtTime(0.07, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
                osc.connect(gain);
                gain.connect(masterGain);
                osc.start(now);
                osc.stop(now + 0.12);
                chipIdx++;
            }, 125);
        }

        radioNodes = { gain: masterGain, nodes: nodes };
    }

    // --- SONIDO DE BISAGRA / PUERTA ---
    function playDoorSqueak(open = true) {
        try {
            const ctx = getAudioCtx();
            const osc = ctx.createOscillator();
            const filter = ctx.createBiquadFilter();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            const now = ctx.currentTime;
            if (open) {
                osc.frequency.setValueAtTime(280, now);
                osc.frequency.linearRampToValueAtTime(520, now + 0.35);
                osc.frequency.linearRampToValueAtTime(320, now + 0.6);
            } else {
                osc.frequency.setValueAtTime(480, now);
                osc.frequency.linearRampToValueAtTime(180, now + 0.4);
            }
            filter.type = 'bandpass';
            filter.frequency.value = 800;
            filter.Q.value = 3;
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.linearRampToValueAtTime(0.12, now + 0.2);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.7);

            if (!open) {
                setTimeout(() => {
                    const thud = ctx.createOscillator();
                    const tg = ctx.createGain();
                    thud.frequency.setValueAtTime(90, ctx.currentTime);
                    thud.frequency.exponentialRampToValueAtTime(25, ctx.currentTime + 0.1);
                    tg.gain.setValueAtTime(0.25, ctx.currentTime);
                    tg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
                    thud.connect(tg);
                    tg.connect(ctx.destination);
                    thud.start();
                    thud.stop(ctx.currentTime + 0.15);
                }, 400);
            }
        } catch (e) {}
    }

    // --- SONIDO DE TELÉFONO DE LÍNEA ---
    let phoneRingInterval = null;
    let dialToneOsc = null;

    function playPhoneRingPulse() {
        try {
            const ctx = getAudioCtx();
            const now = ctx.currentTime;
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const g = ctx.createGain();
            osc1.type = 'sine'; osc1.frequency.value = 440;
            osc2.type = 'sine'; osc2.frequency.value = 480;
            g.gain.setValueAtTime(0.15, now);
            g.gain.setValueAtTime(0.15, now + 1.6);
            g.gain.linearRampToValueAtTime(0.0001, now + 1.8);
            osc1.connect(g); osc2.connect(g);
            g.connect(ctx.destination);
            osc1.start(now); osc2.start(now);
            osc1.stop(now + 1.85); osc2.stop(now + 1.85);
        } catch (e) {}
    }

    function startPhoneRinging() {
        if (phoneRingInterval) return;
        window.state.phoneRinging = true;
        playPhoneRingPulse();
        phoneRingInterval = setInterval(() => {
            if (window.state.phoneRinging) {
                playPhoneRingPulse();
            } else {
                stopPhoneRinging();
            }
        }, 4000);
    }

    function stopPhoneRinging() {
        if (phoneRingInterval) {
            clearInterval(phoneRingInterval);
            phoneRingInterval = null;
        }
        window.state.phoneRinging = false;
    }

    function startDialTone() {
        stopDialTone();
        try {
            const ctx = getAudioCtx();
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const g = ctx.createGain();
            osc1.type = 'sine'; osc1.frequency.value = 350;
            osc2.type = 'sine'; osc2.frequency.value = 440;
            g.gain.setValueAtTime(0.08, ctx.currentTime);
            osc1.connect(g); osc2.connect(g);
            g.connect(ctx.destination);
            osc1.start(); osc2.start();
            dialToneOsc = { osc1, osc2, g };
        } catch (e) {}
    }

    function stopDialTone() {
        if (dialToneOsc) {
            try {
                dialToneOsc.g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 0.05);
                setTimeout(() => {
                    try {
                        dialToneOsc.osc1.stop(); dialToneOsc.osc2.stop();
                        dialToneOsc = null;
                    } catch (e) {}
                }, 60);
            } catch (e) {
                dialToneOsc = null;
            }
        }
    }

    // --- TV CRT POWER "TUNK" & DEGAUSS SOUND ---
    function playTVPowerSound(turnOn = true) {
        try {
            const ctx = getAudioCtx();
            const now = ctx.currentTime;
            const clk = ctx.createOscillator();
            const cg = ctx.createGain();
            clk.type = 'square';
            clk.frequency.setValueAtTime(110, now);
            clk.frequency.exponentialRampToValueAtTime(30, now + 0.08);
            cg.gain.setValueAtTime(0.3, now);
            cg.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
            clk.connect(cg); cg.connect(ctx.destination);
            clk.start(now); clk.stop(now + 0.1);

            if (turnOn) {
                const deg = ctx.createOscillator();
                const dg = ctx.createGain();
                deg.type = 'sine';
                deg.frequency.setValueAtTime(80, now + 0.05);
                deg.frequency.exponentialRampToValueAtTime(50, now + 0.4);
                dg.gain.setValueAtTime(0.3, now + 0.05);
                dg.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
                deg.connect(dg); dg.connect(ctx.destination);
                deg.start(now + 0.05); deg.stop(now + 0.5);

                const fly = ctx.createOscillator();
                const fg = ctx.createGain();
                fly.type = 'sine';
                fly.frequency.value = 15625;
                fg.gain.setValueAtTime(0.012, now + 0.2);
                fg.gain.exponentialRampToValueAtTime(0.002, now + 1.5);
                fly.connect(fg); fg.connect(ctx.destination);
                fly.start(now + 0.2); fly.stop(now + 2.0);
            }
        } catch (e) {}
    }

    // --- AMBIENTE ATMOSFÉRICO & LLUVIA PROCEDURAL (Web Audio API) ---
    let rainGainNode = null;
    let rainNoiseSrc = null;
    let rainFilter1 = null;
    let rainFilter2 = null;
    let windGainNode = null;
    let windNoiseSrc = null;
    let windFilter = null;
    let roomToneGain = null;
    let roomToneOsc = null;

    function initWeatherAudio() {
        if (rainGainNode) return;
        try {
            const ctx = getAudioCtx();
            const now = ctx.currentTime;

            // 1. Capa de Lluvia Suave y Orgánica (Ruido Rosa 1/f Anti-Saturación)
            const rainBuf = makePinkNoiseBuffer(ctx, 4.0);
            rainNoiseSrc = ctx.createBufferSource();
            rainNoiseSrc.buffer = rainBuf;
            rainNoiseSrc.loop = true;

            // Filtro para impacto de gotas de lluvia suave en el follaje y tejado
            rainFilter1 = ctx.createBiquadFilter();
            rainFilter1.type = 'bandpass';
            rainFilter1.frequency.value = 1600;
            rainFilter1.Q.value = 0.85;

            // Filtro para cuerpo/cortina de lluvia (graves suaves y envolventes)
            rainFilter2 = ctx.createBiquadFilter();
            rainFilter2.type = 'lowpass';
            rainFilter2.frequency.value = 950;
            rainFilter2.Q.value = 0.7;

            rainGainNode = ctx.createGain();
            rainGainNode.gain.setValueAtTime(0.0001, now);

            rainNoiseSrc.connect(rainFilter1);
            rainNoiseSrc.connect(rainFilter2);
            rainFilter1.connect(rainGainNode);
            rainFilter2.connect(rainGainNode);

            // Compresor de seguridad para evitar cualquier clip o distorsión
            const rainCompressor = ctx.createDynamicsCompressor();
            rainCompressor.threshold.setValueAtTime(-16, now);
            rainCompressor.knee.setValueAtTime(10, now);
            rainCompressor.ratio.setValueAtTime(6, now);
            rainGainNode.connect(rainCompressor);
            rainCompressor.connect(ctx.destination);

            rainNoiseSrc.start();

            // 2. Capa de Viento / Brisa Nocturna
            const windBuf = makePinkNoiseBuffer(ctx, 5.0);
            windNoiseSrc = ctx.createBufferSource();
            windNoiseSrc.buffer = windBuf;
            windNoiseSrc.loop = true;

            windFilter = ctx.createBiquadFilter();
            windFilter.type = 'lowpass';
            windFilter.frequency.value = 320;

            windGainNode = ctx.createGain();
            windGainNode.gain.setValueAtTime(0.035, now);

            windNoiseSrc.connect(windFilter);
            windFilter.connect(windGainNode);
            windGainNode.connect(ctx.destination);
            windNoiseSrc.start();

            // 3. Tono Ambiental de Habitación 90s (Presencia cálida de cuarto cerrado)
            roomToneOsc = ctx.createOscillator();
            roomToneOsc.type = 'sine';
            roomToneOsc.frequency.value = 80;

            const roomToneFilter = ctx.createBiquadFilter();
            roomToneFilter.type = 'lowpass';
            roomToneFilter.frequency.value = 140;

            roomToneGain = ctx.createGain();
            roomToneGain.gain.setValueAtTime(0.02, now);

            roomToneOsc.connect(roomToneFilter);
            roomToneFilter.connect(roomToneGain);
            roomToneGain.connect(ctx.destination);
            roomToneOsc.start();
        } catch (e) {}
    }

    function updateWeatherAudio(rainOpacity, isWindowOpen) {
        if (!window.state || !window.state.freeRoam || window.state.isNightmareActive) {
            stopWeatherAudio();
            return;
        }

        try {
            initWeatherAudio();
            const ctx = getAudioCtx();
            const now = ctx.currentTime;

            if (rainGainNode) {
                // Volumen calibrado sin saturación acústica (suave y atmosférico)
                const windowMult = isWindowOpen ? 1.35 : 0.85;
                const targetRainVol = Math.max(0.0001, rainOpacity * 0.16 * windowMult);
                rainGainNode.gain.linearRampToValueAtTime(targetRainVol, now + 0.15);

                if (rainFilter1) {
                    rainFilter1.frequency.linearRampToValueAtTime(isWindowOpen ? 2200 : 1500, now + 0.15);
                }
            }

            if (windGainNode && windFilter) {
                const windVol = isWindowOpen ? (0.08 + rainOpacity * 0.04) : (0.025 + rainOpacity * 0.02);
                windGainNode.gain.linearRampToValueAtTime(windVol, now + 0.25);
                windFilter.frequency.linearRampToValueAtTime(isWindowOpen ? 480 : 280, now + 0.25);
            }

            if (roomToneGain) {
                roomToneGain.gain.linearRampToValueAtTime(isWindowOpen ? 0.01 : 0.02, now + 0.25);
            }
        } catch (e) {}
    }

    function stopWeatherAudio() {
        if (rainNoiseSrc) {
            try { rainNoiseSrc.stop(); rainNoiseSrc.disconnect(); } catch (e) {}
            rainNoiseSrc = null;
        }
        if (windNoiseSrc) {
            try { windNoiseSrc.stop(); windNoiseSrc.disconnect(); } catch (e) {}
            windNoiseSrc = null;
        }
        if (roomToneOsc) {
            try { roomToneOsc.stop(); roomToneOsc.disconnect(); } catch (e) {}
            roomToneOsc = null;
        }
        if (rainGainNode) {
            try { rainGainNode.disconnect(); } catch (e) {}
            rainGainNode = null;
        }
        if (windGainNode) {
            try { windGainNode.disconnect(); } catch (e) {}
            windGainNode = null;
        }
        if (roomToneGain) {
            try { roomToneGain.disconnect(); } catch (e) {}
            roomToneGain = null;
        }
        rainFilter1 = null;
        rainFilter2 = null;
        windFilter = null;
    }

    // --- TRUENO PROCEDURAL Y RELÁMPAGO ---
    function playThunderSound() {
        try {
            const ctx = getAudioCtx();
            const now = ctx.currentTime;
            
            // Capa principal: Estruendo grave de trueno
            const noise = ctx.createBufferSource();
            noise.buffer = makeNoiseBuffer(ctx, 4.5);
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(550, now);
            filter.frequency.exponentialRampToValueAtTime(60, now + 3.5);
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.linearRampToValueAtTime(1.2, now + 0.12);
            gain.gain.linearRampToValueAtTime(0.7, now + 0.5);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 4.2);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            noise.start(now);
            noise.stop(now + 4.5);
            
            // Capa sub-bass: Boom profundo retumbante
            const subOsc = ctx.createOscillator();
            subOsc.type = 'sine';
            subOsc.frequency.setValueAtTime(45, now);
            subOsc.frequency.exponentialRampToValueAtTime(25, now + 2.5);
            const subGain = ctx.createGain();
            subGain.gain.setValueAtTime(0.0, now);
            subGain.gain.linearRampToValueAtTime(0.6, now + 0.08);
            subGain.gain.linearRampToValueAtTime(0.35, now + 0.4);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);
            subOsc.connect(subGain);
            subGain.connect(ctx.destination);
            subOsc.start(now);
            subOsc.stop(now + 3.0);
        } catch (e) {}
    }

    // --- MAULLIDO / RONRONEO DEL GATO ---
    function playCatMeow() {
        try {
            const ctx = getAudioCtx();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const filter = ctx.createBiquadFilter();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(420, now);
            osc.frequency.linearRampToValueAtTime(680, now + 0.18);
            osc.frequency.exponentialRampToValueAtTime(360, now + 0.55);
            filter.type = 'bandpass';
            filter.frequency.value = 1100;
            filter.Q.value = 2.5;
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.12, now + 0.08);
            gain.gain.linearRampToValueAtTime(0.1, now + 0.35);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.6);
        } catch (e) {}
    }

    function playCatPurr() {
        try {
            const ctx = getAudioCtx();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const mod = ctx.createOscillator();
            const modGain = ctx.createGain();
            const gain = ctx.createGain();

            osc.type = 'sine'; osc.frequency.value = 35;
            mod.type = 'sawtooth'; mod.frequency.value = 24;
            modGain.gain.value = 25;

            mod.connect(modGain);
            modGain.connect(osc.frequency);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.08, now + 0.2);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now); mod.start(now);
            osc.stop(now + 1.5); mod.stop(now + 1.5);
        } catch (e) {}
    }

    // --- SONIDO DE PÁJAROS MATUTINOS Y ALARMA SUAVE DE AMANECER ---
    function playMorningBirdsSound() {
        try {
            const ctx = getAudioCtx();
            for (let b = 0; b < 3; b++) {
                setTimeout(() => {
                    const now = ctx.currentTime;
                    const osc = ctx.createOscillator();
                    const g = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(2400 + Math.random() * 600, now);
                    osc.frequency.linearRampToValueAtTime(3200 + Math.random() * 400, now + 0.08);
                    osc.frequency.exponentialRampToValueAtTime(1800, now + 0.22);
                    g.gain.setValueAtTime(0.001, now);
                    g.gain.linearRampToValueAtTime(0.08, now + 0.04);
                    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
                    osc.connect(g); g.connect(ctx.destination);
                    osc.start(now); osc.stop(now + 0.28);
                }, b * 220);
            }
        } catch (e) {}
    }

    function playAlarmChime() {
        try {
            const ctx = getAudioCtx();
            for (let i = 0; i < 2; i++) {
                setTimeout(() => {
                    const now = ctx.currentTime;
                    const osc = ctx.createOscillator();
                    const g = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(880, now);
                    g.gain.setValueAtTime(0.06, now);
                    g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                    osc.connect(g); g.connect(ctx.destination);
                    osc.start(now); osc.stop(now + 0.15);
                }, i * 180);
            }
        } catch (e) {}
    }

    // --- SONIDO DE CRUJIDO DE MADERA / CAMA ---
    function playWoodCreak() {
        try {
            const ctx = getAudioCtx();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const filter = ctx.createBiquadFilter();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(140, now);
            osc.frequency.linearRampToValueAtTime(220, now + 0.12);
            osc.frequency.linearRampToValueAtTime(90, now + 0.28);
            filter.type = 'bandpass';
            filter.frequency.value = 400;
            filter.Q.value = 4.0;
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.32);
        } catch (e) {}
    }

    // --- SONIDOS PROCEDURALES DE TRÁFICO Y VEHÍCULOS (90s RETRO) ---
    let carHonkCooldown = 0;
    let bikeBellCooldown = 0;

    // Bocina de auto retro de dos tonos armónicos (tipo sedán / taxi 90s)
    function playCarHonk(posX = 0, isWindowOpen = false) {
        if (window.state && window.state.isNightmareActive) return;
        try {
            const ctx = getAudioCtx();
            const now = ctx.currentTime;
            const panVal = Math.max(-1, Math.min(1, posX / 35));

            let panner = null;
            if (ctx.createStereoPanner) {
                panner = ctx.createStereoPanner();
                panner.pan.setValueAtTime(panVal, now);
            }

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(isWindowOpen ? 3200 : 950, now);

            const masterGain = ctx.createGain();
            const dist = Math.abs(posX);
            const distGain = Math.max(0.02, 1.0 - (dist / 60) ** 1.5) * (isWindowOpen ? 0.22 : 0.09);
            masterGain.gain.setValueAtTime(0.001, now);
            masterGain.gain.linearRampToValueAtTime(distGain, now + 0.03);
            masterGain.gain.setValueAtTime(distGain, now + 0.22);
            masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

            // Dos tonos armónicos típicos (F4 = 349Hz, A4 = 440Hz)
            [370, 466].forEach(freq => {
                const osc = ctx.createOscillator();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, now);
                osc.connect(filter);
                osc.start(now);
                osc.stop(now + 0.4);
            });

            filter.connect(masterGain);
            if (panner) {
                masterGain.connect(panner);
                panner.connect(ctx.destination);
            } else {
                masterGain.connect(ctx.destination);
            }
        } catch (e) {}
    }

    // Timbre metálico de bicicleta ("ting-ting!")
    function playBikeBell(posX = 0, isWindowOpen = false) {
        if (window.state && window.state.isNightmareActive) return;
        try {
            const ctx = getAudioCtx();
            const panVal = Math.max(-1, Math.min(1, posX / 35));

            [0, 0.12].forEach(delay => {
                const now = ctx.currentTime + delay;
                let panner = null;
                if (ctx.createStereoPanner) {
                    panner = ctx.createStereoPanner();
                    panner.pan.setValueAtTime(panVal, now);
                }

                const filter = ctx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.setValueAtTime(isWindowOpen ? 2400 : 1200, now);
                filter.Q.value = 8.0;

                const gain = ctx.createGain();
                const distGain = isWindowOpen ? 0.15 : 0.06;
                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(distGain, now + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

                const osc1 = ctx.createOscillator();
                osc1.type = 'sine';
                osc1.frequency.setValueAtTime(2093, now); // C7

                const osc2 = ctx.createOscillator();
                osc2.type = 'triangle';
                osc2.frequency.setValueAtTime(3136, now); // G7

                osc1.connect(filter);
                osc2.connect(filter);
                filter.connect(gain);

                if (panner) {
                    gain.connect(panner);
                    panner.connect(ctx.destination);
                } else {
                    gain.connect(ctx.destination);
                }

                osc1.start(now); osc1.stop(now + 0.3);
                osc2.start(now); osc2.stop(now + 0.3);
            });
        } catch (e) {}
    }

    // --- MOTOR CONTINUO ESPACIAL DE TRÁFICO ---
    let trafficAudioVoice = null;

    function initTrafficAudioVoice() {
        if (trafficAudioVoice) return trafficAudioVoice;
        try {
            const ctx = getAudioCtx();
            const masterGain = ctx.createGain();
            masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);

            let panner = null;
            if (ctx.createStereoPanner) {
                panner = ctx.createStereoPanner();
                panner.pan.setValueAtTime(0, ctx.currentTime);
            }

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(350, ctx.currentTime);

            // 1. Oscilador grave de motor (RPM drone)
            const oscEngine = ctx.createOscillator();
            oscEngine.type = 'triangle';
            oscEngine.frequency.setValueAtTime(65, ctx.currentTime);

            // 2. Sub-armónico de motor
            const oscSub = ctx.createOscillator();
            oscSub.type = 'sawtooth';
            oscSub.frequency.setValueAtTime(32.5, ctx.currentTime);

            const oscGain = ctx.createGain();
            oscGain.gain.setValueAtTime(0.4, ctx.currentTime);
            oscEngine.connect(oscGain);
            oscSub.connect(oscGain);
            oscGain.connect(filter);

            // 3. Fricción de neumáticos sobre asfalto (Ruido filtrado)
            const tireNoise = ctx.createBufferSource();
            tireNoise.buffer = makeNoiseBuffer(ctx, 3.0);
            tireNoise.loop = true;

            const tireFilter = ctx.createBiquadFilter();
            tireFilter.type = 'bandpass';
            tireFilter.frequency.setValueAtTime(550, ctx.currentTime);
            tireFilter.Q.value = 1.2;

            const tireGain = ctx.createGain();
            tireGain.gain.setValueAtTime(0.25, ctx.currentTime);
            tireNoise.connect(tireFilter);
            tireFilter.connect(tireGain);
            tireGain.connect(filter);

            filter.connect(masterGain);
            if (panner) {
                masterGain.connect(panner);
                panner.connect(ctx.destination);
            } else {
                masterGain.connect(ctx.destination);
            }

            oscEngine.start();
            oscSub.start();
            tireNoise.start();

            trafficAudioVoice = {
                ctx, masterGain, panner, filter, oscEngine, oscSub, tireFilter,
                active: true
            };
            return trafficAudioVoice;
        } catch (e) {
            return null;
        }
    }

    function stopTrafficAudio() {
        if (trafficAudioVoice) {
            try {
                if (trafficAudioVoice.oscEngine) { trafficAudioVoice.oscEngine.stop(); trafficAudioVoice.oscEngine.disconnect(); }
                if (trafficAudioVoice.oscSub) { trafficAudioVoice.oscSub.stop(); trafficAudioVoice.oscSub.disconnect(); }
                if (trafficAudioVoice.tireNoise) { trafficAudioVoice.tireNoise.stop(); trafficAudioVoice.tireNoise.disconnect(); }
                if (trafficAudioVoice.filter) { trafficAudioVoice.filter.disconnect(); }
                if (trafficAudioVoice.tireFilter) { trafficAudioVoice.tireFilter.disconnect(); }
                if (trafficAudioVoice.masterGain) { trafficAudioVoice.masterGain.disconnect(); }
            } catch (e) {}
            trafficAudioVoice = null;
        }
    }

    function stopAllAmbientAudio() {
        stopRadioAudio();
        stopWeatherAudio();
        stopTrafficAudio();
        stopPhoneRinging();
        stopDialTone();
        if (spontaneousCreepyRadioInterval) {
            clearInterval(spontaneousCreepyRadioInterval);
            spontaneousCreepyRadioInterval = null;
        }
    }

    function updateTrafficAudio(cars = [], cyclists = [], isWindowOpen = false, dt = 0.016) {
        if (!window.state || !window.state.freeRoam || window.state.isNightmareActive) {
            stopTrafficAudio();
            return;
        }

        carHonkCooldown -= dt;
        bikeBellCooldown -= dt;

        // Encontrar el vehículo más cercano a la ventana (X = 0)
        let closestCar = null;
        let minCarDist = 9999;

        cars.forEach(car => {
            if (!car.group || car.waitTimer > 0) return;
            const dist = Math.abs(car.group.position.x);
            if (dist < minCarDist && dist < 55) {
                minCarDist = dist;
                closestCar = car;
            }
        });

        const voice = initTrafficAudioVoice();
        if (!voice) return;

        const ctx = voice.ctx;
        const now = ctx.currentTime;

        if (closestCar) {
            const posX = closestCar.group.position.x;
            const dir = closestCar.dir || 1;
            const speed = closestCar.speed || 4.5;

            // Paneo estéreo según posición X
            const pan = Math.max(-1.0, Math.min(1.0, posX / 32));
            if (voice.panner && voice.panner.pan) {
                voice.panner.pan.setTargetAtTime(pan, now, 0.08);
            }

            // Ganancia por proximidad (curva parabólica suave)
            const prox = Math.max(0, 1.0 - (minCarDist / 50) ** 1.6);
            const targetGain = prox * (isWindowOpen ? 0.16 : 0.065);
            voice.masterGain.gain.setTargetAtTime(targetGain, now, 0.06);

            // Efecto Doppler & RPM
            const doppler = (posX * dir < 0) ? 1.08 : 0.92; // Más agudo al acercarse, más grave al alejarse
            const baseFreq = 58 + speed * 3.5;
            voice.oscEngine.frequency.setTargetAtTime(baseFreq * doppler, now, 0.1);
            voice.oscSub.frequency.setTargetAtTime((baseFreq * 0.5) * doppler, now, 0.1);

            // Filtro dinámico: ventana abierta deja pasar frecuencias altas
            const cutoff = (isWindowOpen ? 1800 : 520) + prox * 600;
            voice.filter.frequency.setTargetAtTime(cutoff, now, 0.1);
            voice.tireFilter.frequency.setTargetAtTime((isWindowOpen ? 750 : 380) * doppler, now, 0.1);

            // Probabilidad aleatoria de bocina al pasar frente a la casa
            if (minCarDist < 12 && carHonkCooldown <= 0 && Math.random() < 0.008) {
                playCarHonk(posX, isWindowOpen);
                carHonkCooldown = 18 + Math.random() * 15;
            }
        } else {
            // Sin coches cercanos: silenciar gradualmente el motor
            voice.masterGain.gain.setTargetAtTime(0.0001, now, 0.15);
        }

        // Timbres de bicicleta cuando un ciclista pasa cerca
        cyclists.forEach(ped => {
            if (!ped || !ped.group || ped.waitTimer > 0) return;
            const bikeDist = Math.abs(ped.group.position.x);
            if (bikeDist < 10 && bikeBellCooldown <= 0 && Math.random() < 0.02) {
                playBikeBell(ped.group.position.x, isWindowOpen);
                bikeBellCooldown = 22 + Math.random() * 20;
            }
        });
    }

    const tFn = (k, fb) => (typeof window.t === 'function' ? window.t(k, fb) : fb);

    // ============================================================
    // 2. LÓGICA DE INTERACCIONES Y CONTROLADORES
    // ============================================================

    // --- BOOMBOX INTERACTION ---
    function toggleBoombox() {
        window.state.radioOn = !window.state.radioOn;
        playRetroClick(1.2);
        if (window.state.radioOn) {
            startRadioStation(window.state.radioStation);
            showNotificationPrompt(tFn("room_notif_radio_on", "[ BOOMBOX: ON ({station}) ]").replace('{station}', STATIONS[window.state.radioStation].name));
            if (window.state.radioStation === 7 || window.state.radioStation === 5) {
                if (window.StoryMode && typeof window.StoryMode.completeObjective === 'function') {
                    window.StoryMode.completeObjective('c1_radio');
                }
            }
        } else {
            stopRadioAudio();
            showNotificationPrompt(tFn("room_notif_radio_off", "[ BOOMBOX: OFF ]"));
        }
    }

    function cycleRadioStation() {
        if (!window.state.radioOn) {
            toggleBoombox();
            return;
        }
        window.state.radioStation = (window.state.radioStation + 1) % STATIONS.length;
        playRetroClick(0.9);
        startRadioStation(window.state.radioStation);
        showNotificationPrompt(tFn("room_notif_radio_tuning", "[ SINTONIZANDO: {station} ]").replace('{station}', STATIONS[window.state.radioStation].name));
        if (window.state.radioStation === 7 || window.state.radioStation === 5) {
            if (window.StoryMode && typeof window.StoryMode.completeObjective === 'function') {
                window.StoryMode.completeObjective('c1_radio');
            }
        }
    }

    // --- VENTANA INTERACTION ---
    function toggleWindow() {
        window.state.windowOpen = !window.state.windowOpen;
        playWoodCreak();
        if (window.state.windowOpen) {
            let timeDesc = tFn("room_breeze_fresh", "Entra aire fresco del exterior");
            if (window.state && typeof window.state.gameTimeMinutes === 'number') {
                const totalMinutes = window.state.gameTimeMinutes % 1440;
                const hour = Math.floor(totalMinutes / 60) % 24;
                if (hour >= 6 && hour < 12) timeDesc = tFn("room_breeze_morning", "Entra la brisa fresca de la mañana");
                else if (hour >= 12 && hour < 19) timeDesc = tFn("room_breeze_afternoon", "Entra la brisa de la tarde");
                else timeDesc = tFn("room_breeze_night", "Entra la brisa de la noche");
            }
            showNotificationPrompt(tFn("room_notif_window_open", "[ VENTANA ABIERTA — {desc} ]").replace('{desc}', timeDesc));
            if (window.state.threatActive) {
                setTimeout(() => {
                    if (typeof window.showHackerDialogue === 'function') {
                        window.showHackerDialogue(tFn("hacker_diag_wind", "Escucho el viento... sé que tu ventana está abierta."));
                    }
                }, 2000);
            }
        } else {
            showNotificationPrompt(tFn("room_notif_window_closed", "[ VENTANA CERRADA ]"));
        }
    }

    // --- PUERTA INTERACTION ---
    function toggleDoor() {
        if (window.state.doorLocked) {
            playRetroClick(0.6);
            showNotificationPrompt(tFn("room_notif_door_latched_hint", "[ LA PUERTA TIENE PESTILLO PUESTO — PRESIONA L PARA DESTRABAR ]"));
            return;
        }
        window.state.doorOpen = !window.state.doorOpen;
        playDoorSqueak(window.state.doorOpen);
        if (window.state.doorOpen) {
            showNotificationPrompt(tFn("room_notif_door_open", "[ PUERTA ABIERTA — El pasillo está a oscuras ]"));
        } else {
            showNotificationPrompt(tFn("room_notif_door_closed", "[ PUERTA CERRADA ]"));
        }
    }

    let lastDoorLockToggleTime = 0;

    function toggleDoorLock() {
        const now = Date.now();
        if (now - lastDoorLockToggleTime < 220) {
            return; // Prevenir rebotes mecánicos o dobles eventos de teclado
        }
        lastDoorLockToggleTime = now;

        // En modo libre y en general: solo se puede trabar el pestillo cuando la puerta está cerrada
        if (!window.state.doorLocked && window.state.doorOpen) {
            playRetroClick(0.5);
            showNotificationPrompt(tFn("room_notif_door_cant_latch", "[ NO PUEDES PONER EL PESTILLO CON LA PUERTA ABIERTA — CIÉRRALA PRIMERO ]"));
            return;
        }

        window.state.doorLocked = !window.state.doorLocked;
        playRetroClick(0.7);
        showNotificationPrompt(window.state.doorLocked ? tFn("room_notif_latch_locked", "[ PESTILLO: BLOQUEADO (CLAC) 🔒 ]") : tFn("room_notif_latch_unlocked", "[ PESTILLO: DESBLOQUEADO 🔓 ]"));
        
        if (typeof window.onDoorLockChanged === 'function') {
            window.onDoorLockChanged(window.state.doorLocked);
        }

        if (window.state.doorLocked) {
            if (window.StoryMode && typeof window.StoryMode.completeObjective === 'function') {
                window.StoryMode.completeObjective('c3_lock');
            }
        }

        if (window.state.doorLocked && window.state.doorKnockActive && typeof window.resolveDoorKnockSuccess === 'function') {
            window.resolveDoorKnockSuccess();
        }
    }

    // --- GENERADORES DE AUDIO DE PESADILLAS & PARÁLISIS DEL SUEÑO ---
    function playHeartbeatFast(count = 6) {
        try {
            const ctx = getAudioCtx();
            if (!ctx) return;
            const now = ctx.currentTime;
            const interval = 0.42; // ~142 BPM acelerado
            for (let i = 0; i < count; i++) {
                const beatTime = now + i * interval;
                
                // Primer golpe del latido (Lub - Cámara ventricular)
                const osc1 = ctx.createOscillator();
                const gain1 = ctx.createGain();
                const filter1 = ctx.createBiquadFilter();
                filter1.type = 'lowpass';
                filter1.frequency.value = 110;

                osc1.type = 'sine';
                osc1.frequency.setValueAtTime(68, beatTime);
                osc1.frequency.exponentialRampToValueAtTime(24, beatTime + 0.11);
                
                gain1.gain.setValueAtTime(0.001, beatTime);
                gain1.gain.linearRampToValueAtTime(0.65, beatTime + 0.02);
                gain1.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.12);
                
                osc1.connect(filter1);
                filter1.connect(gain1);
                gain1.connect(ctx.destination);
                osc1.start(beatTime);
                osc1.stop(beatTime + 0.13);

                // Segundo golpe del latido más fuerte y seco (Dub)
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                const filter2 = ctx.createBiquadFilter();
                filter2.type = 'lowpass';
                filter2.frequency.value = 130;

                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(82, beatTime + 0.10);
                osc2.frequency.exponentialRampToValueAtTime(20, beatTime + 0.24);
                
                gain2.gain.setValueAtTime(0.001, beatTime + 0.10);
                gain2.gain.linearRampToValueAtTime(0.75, beatTime + 0.12);
                gain2.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.25);
                
                osc2.connect(filter2);
                filter2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.start(beatTime + 0.10);
                osc2.stop(beatTime + 0.26);
            }
        } catch (e) {}
    }

    function playNightmareDrone() {
        try {
            const ctx = getAudioCtx();
            if (!ctx) return null;
            const now = ctx.currentTime;

            // Sub-grave oscuro opresivo binaural
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const oscSub = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(36.5, now); // D1
            osc2.type = 'sawtooth';
            osc2.frequency.setValueAtTime(38.8, now); // Discrepancia binaural inquieta
            oscSub.type = 'sine';
            oscSub.frequency.setValueAtTime(28.0, now);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(90, now);
            filter.frequency.linearRampToValueAtTime(320, now + 3.5);
            filter.frequency.linearRampToValueAtTime(80, now + 6.0);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.45, now + 1.2);
            gain.gain.linearRampToValueAtTime(0.001, now + 6.2);

            osc1.connect(filter);
            osc2.connect(filter);
            oscSub.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc1.start(now);
            osc2.start(now);
            oscSub.start(now);
            osc1.stop(now + 6.5);
            osc2.stop(now + 6.5);
            oscSub.stop(now + 6.5);

            // Susurros espectrales difusos en el fondo
            const noiseBuf = makePinkNoiseBuffer(ctx, 4.0);
            const noiseSrc = ctx.createBufferSource();
            noiseSrc.buffer = noiseBuf;

            const nFilter = ctx.createBiquadFilter();
            nFilter.type = 'bandpass';
            nFilter.frequency.setValueAtTime(650, now);
            nFilter.frequency.linearRampToValueAtTime(1400, now + 2.0);
            nFilter.frequency.linearRampToValueAtTime(450, now + 4.0);
            nFilter.Q.value = 4.0;

            const nGain = ctx.createGain();
            nGain.gain.setValueAtTime(0.001, now);
            nGain.gain.linearRampToValueAtTime(0.12, now + 1.5);
            nGain.gain.linearRampToValueAtTime(0.001, now + 4.0);

            noiseSrc.connect(nFilter);
            nFilter.connect(nGain);
            nGain.connect(ctx.destination);
            noiseSrc.start(now);
            noiseSrc.stop(now + 4.2);

        } catch (e) {}
    }

    function playNightmareScreech() {
        try {
            const ctx = getAudioCtx();
            if (!ctx) return;
            const now = ctx.currentTime;

            // ==========================================================
            // CHILLIDO DEMONÍACO MULTI-CAPA HIPER-REALISTA & ESPELUZNANTE
            // ==========================================================

            // 1. CAPA VOCAL GUTURAL (Síntesis FM con formantes humanos desgarrados)
            const carrier1 = ctx.createOscillator();
            const mod1 = ctx.createOscillator();
            const modGain1 = ctx.createGain();
            const voiceGain1 = ctx.createGain();
            const voiceFilter1 = ctx.createBiquadFilter();

            carrier1.type = 'sawtooth';
            carrier1.frequency.setValueAtTime(680, now);
            carrier1.frequency.exponentialRampToValueAtTime(1950, now + 0.18);
            carrier1.frequency.exponentialRampToValueAtTime(380, now + 0.95);

            mod1.type = 'square';
            mod1.frequency.setValueAtTime(340, now);
            mod1.frequency.exponentialRampToValueAtTime(890, now + 0.25);
            modGain1.gain.setValueAtTime(1600, now);
            modGain1.gain.exponentialRampToValueAtTime(200, now + 0.95);

            mod1.connect(carrier1.frequency);
            
            voiceFilter1.type = 'peaking';
            voiceFilter1.frequency.setValueAtTime(1800, now);
            voiceFilter1.Q.value = 3.5;
            voiceFilter1.gain.value = 12;

            voiceGain1.gain.setValueAtTime(0.001, now);
            voiceGain1.gain.linearRampToValueAtTime(0.65, now + 0.05);
            voiceGain1.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

            carrier1.connect(voiceFilter1);
            voiceFilter1.connect(voiceGain1);
            voiceGain1.connect(ctx.destination);

            mod1.start(now);
            carrier1.start(now);
            mod1.stop(now + 1.05);
            carrier1.stop(now + 1.05);

            // 2. CAPA AGUDA TALADRANTE (Grito histérico y desgarre de cuerdas vocales)
            const carrier2 = ctx.createOscillator();
            const mod2 = ctx.createOscillator();
            const voiceGain2 = ctx.createGain();

            carrier2.type = 'triangle';
            carrier2.frequency.setValueAtTime(1450, now);
            carrier2.frequency.exponentialRampToValueAtTime(3600, now + 0.15);
            carrier2.frequency.exponentialRampToValueAtTime(820, now + 0.85);

            mod2.type = 'sawtooth';
            mod2.frequency.setValueAtTime(78, now); // Modulación áspera
            const modGain2 = ctx.createGain();
            modGain2.gain.setValueAtTime(2800, now);

            mod2.connect(carrier2.frequency);

            voiceGain2.gain.setValueAtTime(0.001, now);
            voiceGain2.gain.linearRampToValueAtTime(0.55, now + 0.04);
            voiceGain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

            carrier2.connect(voiceGain2);
            voiceGain2.connect(ctx.destination);

            mod2.start(now);
            carrier2.start(now);
            mod2.stop(now + 0.95);
            carrier2.stop(now + 0.95);

            // 3. CAPA DE RASGADO DE AIRE / ALIENTO MONSTRUOSO (Ruido rosa de garganta con resonancia)
            const noiseBuf = makePinkNoiseBuffer(ctx, 1.1);
            const noiseSrc = ctx.createBufferSource();
            noiseSrc.buffer = noiseBuf;

            const noiseFilter = ctx.createBiquadFilter();
            noiseFilter.type = 'bandpass';
            noiseFilter.frequency.setValueAtTime(3200, now);
            noiseFilter.frequency.linearRampToValueAtTime(5400, now + 0.2);
            noiseFilter.frequency.exponentialRampToValueAtTime(1100, now + 0.9);
            noiseFilter.Q.value = 6.0;

            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.001, now);
            noiseGain.gain.linearRampToValueAtTime(0.70, now + 0.06);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

            noiseSrc.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(ctx.destination);
            noiseSrc.start(now);
            noiseSrc.stop(now + 1.0);

            // 4. IMPACTO SÍSMICO DE TERROR (Sub-Bass Doom Slam que te sacude el pecho)
            const sub = ctx.createOscillator();
            const subGain = ctx.createGain();
            sub.type = 'sine';
            sub.frequency.setValueAtTime(160, now);
            sub.frequency.exponentialRampToValueAtTime(22, now + 0.55);

            subGain.gain.setValueAtTime(0.85, now);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

            sub.connect(subGain);
            subGain.connect(ctx.destination);
            sub.start(now);
            sub.stop(now + 0.65);

        } catch (e) {}
    }

    function playGaspWakeupSound() {
        try {
            const ctx = getAudioCtx();
            if (!ctx) return;
            const now = ctx.currentTime;

            // Inhalación brusca, realista y profunda de aire al despertar en shock
            const buf = makePinkNoiseBuffer(ctx, 0.8);
            const src = ctx.createBufferSource();
            src.buffer = buf;

            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(2200, now);
            filter.frequency.exponentialRampToValueAtTime(750, now + 0.55);
            filter.Q.value = 3.2;

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.75, now + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

            src.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            src.start(now);
            src.stop(now + 0.7);

            // Suspiro residual y 3 latidos rápidos
            playHeartbeatFast(3);
        } catch (e) {}
    }

    function playCinematicChapterTransitionStinger() {
        try {
            const ctx = getAudioCtx();
            if (!ctx) return;
            const now = ctx.currentTime;

            // 1. Sub-bass drop cinematográfico masivo
            const sub = ctx.createOscillator();
            const subGain = ctx.createGain();
            sub.type = 'sine';
            sub.frequency.setValueAtTime(65, now);
            sub.frequency.exponentialRampToValueAtTime(24, now + 1.2);
            subGain.gain.setValueAtTime(0.75, now);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
            sub.connect(subGain);
            subGain.connect(ctx.destination);
            sub.start(now);
            sub.stop(now + 1.5);

            // 2. Acorde sintético de suspenso (D minor / A / F / D)
            [146.83, 220.00, 293.66, 349.23, 440.00].forEach((freq, idx) => {
                const pad = ctx.createOscillator();
                const padGain = ctx.createGain();
                pad.type = 'sawtooth';
                pad.frequency.value = freq;
                padGain.gain.setValueAtTime(0.08 / (idx + 1), now);
                padGain.gain.linearRampToValueAtTime(0.12 / (idx + 1), now + 0.2);
                padGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
                pad.connect(padGain);
                padGain.connect(ctx.destination);
                pad.start(now);
                pad.stop(now + 2.1);
            });

            // 3. Sello / Clack de máquina de escribir confidencial
            setTimeout(() => {
                try {
                    const clkNow = ctx.currentTime;
                    const clk = ctx.createOscillator();
                    const clkGain = ctx.createGain();
                    clk.type = 'square';
                    clk.frequency.setValueAtTime(780, clkNow);
                    clk.frequency.exponentialRampToValueAtTime(120, clkNow + 0.05);
                    clkGain.gain.setValueAtTime(0.35, clkNow);
                    clkGain.gain.exponentialRampToValueAtTime(0.001, clkNow + 0.06);
                    clk.connect(clkGain);
                    clkGain.connect(ctx.destination);
                    clk.start(clkNow);
                    clk.stop(clkNow + 0.07);
                } catch(e) {}
            }, 250);
        } catch (e) {}
    }

    // --- INTERACCIONES DE OBJETOS ESTACIONALES (NAVIDAD & HALLOWEEN) ---
    function interactXmasGifts() {
        playRetroClick(1.2);
        showNotificationPrompt(tFn("notif_xmas_gift", "[ 🎁 REGALO NAVIDEÑO: 'Para el operador de DarkLink. Que sobrevivas a las intrusiones.' ]"));
    }

    function interactHotCocoa() {
        try {
            const ctx = getAudioCtx();
            if (ctx) {
                const now = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(520, now);
                osc.frequency.exponentialRampToValueAtTime(260, now + 0.25);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.35);
            }
        } catch(e) {}
        showNotificationPrompt(tFn("notif_xmas_cocoa", "[ ☕ CHOCOLATE CALIENTE CON BASTÓN DE MENTA: Reconfortante y dulce. ]"));
    }

    function interactHalloweenCandy() {
        playRetroClick(0.9);
        showNotificationPrompt(tFn("notif_halloween_candy", "[ 🍬 DULCE O TRUCO: Saboreas un caramelo ácido noventero. ]"));
    }

    function interactHalloweenSkull() {
        try {
            const ctx = getAudioCtx();
            if (ctx) {
                const now = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(110, now);
                osc.frequency.exponentialRampToValueAtTime(82, now + 0.8);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.95);
            }
        } catch(e) {}
        showNotificationPrompt(tFn("notif_halloween_skull", "[ 💀 CALAVERA: Los ojos parecen seguir tus pasos en la penumbra... ]"));
    }

    function interactXmasCookies() {
        playRetroClick(1.1);
        showNotificationPrompt(tFn("notif_xmas_cookies", "[ 🍪 GALLETA NAVIDEÑA: Crujiente galleta de jengibre horneada con glaseado festivo. ]"));
    }

    function interactXmasWreath() {
        try {
            const ctx = getAudioCtx();
            if (ctx) {
                const now = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(880, now);
                osc.frequency.exponentialRampToValueAtTime(1320, now + 0.15);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.38);
            }
        } catch(e) {}
        showNotificationPrompt(tFn("notif_xmas_wreath", "[ 🎄 CORONA FESTIVA: Ramas de abeto natural, bayas rojas y un lazo aterciopelado. ]"));
    }

    function interactHalloweenPotion() {
        try {
            const ctx = getAudioCtx();
            if (ctx) {
                const now = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.exponentialRampToValueAtTime(440, now + 0.2);
                osc.frequency.exponentialRampToValueAtTime(160, now + 0.5);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.6);
            }
        } catch(e) {}
        showNotificationPrompt(tFn("notif_halloween_potion", "[ 🧪 BREBAJE OSCURO: Un líquido verdoso fluorescente burbujea lentamente con humo frío. ]"));
    }

    function interactHalloweenWreath() {
        playRetroClick(0.7);
        showNotificationPrompt(tFn("notif_halloween_wreath", "[ 🕸 CORONA DE HALLOWEEN: Ramas negras retorcidas con pequeñas calaveras y telarañas. ]"));
    }

    // --- CAMA INTERACTION (Dormir con paso de 4 horas cinemático) ---
    function interactBed() {
        playWoodCreak();
    }

    // --- TELÉFONO INTERACTION ---
    function interactPhone() {
        playRetroClick(1.0);
        if (window.StoryMode && typeof window.StoryMode.completeObjective === 'function') {
            window.StoryMode.completeObjective('c2_phone');
        }

        if (window.state.phoneRinging) {
            stopPhoneRinging();
            window.state.phonePickedUp = true;
            showNotificationPrompt(tFn("room_notif_phone_lifted", "[ TUBO LEVANTADO... ESCUCHAS ALGO ]"));

            if (window.state.threatActive || Math.random() < 0.5) {
                setTimeout(() => {
                    const threats = [
                        tFn("phone_threat_1", "...Sé que estás solo en la habitación."),
                        tFn("phone_threat_2", "...No deberías haber abierto ese enlace onion."),
                        tFn("phone_threat_3", "...Puedo verte desde el poste de luz de la calle."),
                        tFn("phone_threat_4", "...(Respiración pesada y silencio perturbador)..."),
                        tFn("phone_threat_5", "...Clave PGP de volcado: 'X9-DELTA-44'. Úsala en la Terminal...")
                    ];
                    const chosen = threats[Math.floor(Math.random() * threats.length)];
                    showNotificationPrompt(tFn("room_notif_phone_voice", `[ VOZ EN EL TELÉFONO ]: "${chosen}"`).replace('{msg}', chosen));
                }, 1000);
            } else {
                setTimeout(() => {
                    showNotificationPrompt(tFn("phone_informant", '[ INFORMANTE ]: "...Clave de volcado autorizada: X9-DELTA-44..."'));
                }, 800);
            }

            setTimeout(() => {
                window.state.phonePickedUp = false;
                showNotificationPrompt(tFn("room_notif_phone_hangup", "[ COLGASTE EL TELÉFONO ]"));
            }, 6000);

        } else {
            if (!window.state.phonePickedUp) {
                window.state.phonePickedUp = true;
                startDialTone();
                showNotificationPrompt(tFn("room_notif_phone_dialtone", "[ TONO DE MARCADO... Susurro: 'Clave PGP: X9-DELTA-44' ]"));
                setTimeout(() => {
                    stopDialTone();
                    window.state.phonePickedUp = false;
                    showNotificationPrompt(tFn("room_notif_phone_hangup", "[ COLGASTE EL TELÉFONO ]"));
                }, 3500);
            }
        }
    }

    // --- TV CRT INTERACTION ---
    const TV_CHANNELS = [
        "Canal 03: [ RUIDO BLANCO / ESTÁTICA ]",
        "Canal 07: [ NOTICIERO NOCTURNO — 'Reportan fallos globales en servidores' ]",
        "Canal 12: [ PANTALLA AZUL — 'VIDEO 1 - SIN SEÑAL' ]",
        "Canal 99: [ TRANSMISIÓN PIRATA — Ojos en la estática ]",
        "Canal 05: [ DIBUJOS ANIMADOS RETRO 90s — 'Las Aventuras de Pixel & Link' ]",
        "Canal 18: [ TELETIENDA DE MADRUGADA — 'Módem 56k Phantom V.90 ¡Llame ya!' ]",
        "Canal 24: [ CÁMARA CCTV SEGURIDAD — 'Peligro: Pasillo del Edificio' ]",
        "Canal 66: [ TRANSMISIÓN DE EMERGENCIA EBS — 'Permanezca en sus hogares' ]"
    ];

    const getTVChannelName = (idx) => tFn('tv_channel_' + idx, TV_CHANNELS[idx]);

    function toggleTV() {
        window.state.tvOn = !window.state.tvOn;
        playTVPowerSound(window.state.tvOn);
        if (window.state.tvOn) {
            showNotificationPrompt(tFn("room_notif_tv_on", "[ TV ENCENDIDA — {channel} ]").replace('{channel}', getTVChannelName(window.state.tvChannel)));
            if (window.state.tvChannel === 6 || window.state.tvChannel === 3) {
                if (window.StoryMode && typeof window.StoryMode.completeObjective === 'function') {
                    window.StoryMode.completeObjective('c4_tv');
                }
            }
        } else {
            showNotificationPrompt(tFn("room_notif_tv_off", "[ TV CRT APAGADA ]"));
        }
    }

    function cycleTVChannel() {
        if (!window.state.tvOn) {
            toggleTV();
            return;
        }
        window.state.tvChannel = (window.state.tvChannel + 1) % TV_CHANNELS.length;
        playRetroClick(1.4);
        showNotificationPrompt(tFn("room_notif_tv_channel_change", "[ CAMBIO DE CANAL: {channel} ]").replace('{channel}', getTVChannelName(window.state.tvChannel)));
        if (window.state.tvChannel === 6 || window.state.tvChannel === 3) {
            if (window.StoryMode && typeof window.StoryMode.completeObjective === 'function') {
                window.StoryMode.completeObjective('c4_tv');
            }
        }
    }

    // --- EVENTO ESPONTÁNEO DE RADIO TURBIA EN MODO LIBRE ---
    function triggerRandomCreepyRadioEvent() {
        if (!window.state || !window.state.freeRoam) return;
        
        const creepyList = [3, 6, 2];
        const chosen = creepyList[Math.floor(Math.random() * creepyList.length)];
        window.state.radioOn = true;
        window.state.radioStation = chosen;
        playRetroClick(0.8);
        startRadioStation(chosen);
        showNotificationPrompt(tFn("room_notif_radio_creepy", "[ 📻 LA RADIO SE ENCENDIÓ SOLA... SINTONIZANDO: {station} ]").replace('{station}', STATIONS[chosen].name));
    }

    if (spontaneousCreepyRadioInterval) clearInterval(spontaneousCreepyRadioInterval);
    spontaneousCreepyRadioInterval = setInterval(() => {
        if (window.state && window.state.freeRoam && !window.state.isDialogueActive && Math.random() < 0.28) {
            triggerRandomCreepyRadioEvent();
        }
    }, 45000);

    // --- GATO INTERACTION ---
    function petCat() {
        const currentCount = window.state.catPetCount || 0;
        
        // Tope de 10 mimos — después el gato se duerme satisfecho
        if (currentCount >= 10) {
            playCatPurr();
            window.state.catState = 'sleeping';
            showNotificationPrompt(tFn("room_notif_cat_sleeping", "[ EL GATO DUERME PLÁCIDAMENTE 😴 — Ya recibió todos sus mimos ]"));
            return;
        }
        
        window.state.catPetCount = currentCount + 1;
        
        if (window.state.catPetCount >= 10) {
            // Último mimo — recompensa especial y el gato se duerme
            playCatPurr();
            window.state.catState = 'sleeping';
            showNotificationPrompt(tFn("room_notif_cat_max", "[ EL GATO RONRONEA FUERTE Y SE DUERME FELIZ 🐱 — ¡10/10 mimos! +₿ 0.05 BTC ]"));
            if (typeof window.updateWallet === 'function') {
                window.updateWallet(0.05);
            }
        } else {
            if (Math.random() < 0.6) {
                playCatMeow();
                window.state.catState = 'meowing';
            } else {
                playCatPurr();
                window.state.catState = 'purring';
            }
            showNotificationPrompt(tFn("room_notif_cat_pet", "[ ACARICIASTE AL GATO ({count}/10 mimos) 🐾 ]").replace('{count}', window.state.catPetCount));
        }
    }

    // --- PROMPT DE NOTIFICACIÓN HUD ---
    let notifTimeout = null;
    function showNotificationPrompt(text) {
        const toast = document.getElementById('ps1-notif-toast');
        if (!toast) return;
        toast.innerText = text;
        toast.classList.remove('hidden');
        if (notifTimeout) clearTimeout(notifTimeout);
        notifTimeout = setTimeout(() => {
            if (toast.innerText === text) {
                toast.classList.add('hidden');
            }
        }, 3600);
    }

    // ============================================================
    // 3. PS1 RETRO ARCADE MINIGAME (Space Invaders 1995)
    // ============================================================
    let arcadeRunning = false;
    let arcadeAnimId = null;
    let arcadeScore = 0;
    let arcadeLives = 3;
    let playerX = 220;
    let playerBullets = [];
    let enemyList = [];
    let enemyDir = 1;
    let enemySpeed = 1.2;
    let keysState = { left: false, right: false, space: false };

    function initArcadeGame() {
        arcadeScore = 0;
        arcadeLives = 3;
        playerX = 220;
        playerBullets = [];
        enemyList = [];
        enemyDir = 1;
        enemySpeed = 1.2;

        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 8; col++) {
                enemyList.push({
                    x: 50 + col * 48,
                    y: 40 + row * 36,
                    w: 24,
                    h: 20,
                    alive: true,
                    type: row
                });
            }
        }
    }

    function openRetroConsoleOverlay() {
        const modal = document.getElementById('modal-ps1-console');
        if (!modal) return;
        modal.classList.remove('hidden');
        if (document.pointerLockElement) document.exitPointerLock();

        initArcadeGame();
        arcadeRunning = true;
        window.addEventListener('keydown', onArcadeKeyDown);
        window.addEventListener('keyup', onArcadeKeyUp);

        const btnClose = document.getElementById('btn-close-ps1-console');
        if (btnClose) {
            btnClose.onclick = closeRetroConsoleOverlay;
        }

        arcadeLoop();
    }

    function closeRetroConsoleOverlay() {
        arcadeRunning = false;
        if (arcadeAnimId) cancelAnimationFrame(arcadeAnimId);
        window.removeEventListener('keydown', onArcadeKeyDown);
        window.removeEventListener('keyup', onArcadeKeyUp);
        const modal = document.getElementById('modal-ps1-console');
        if (modal) modal.classList.add('hidden');
        window.state.consoleMinigameActive = false;
    }

    function onArcadeKeyDown(e) {
        if (!arcadeRunning) return;
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') keysState.left = true;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') keysState.right = true;
        if (e.code === 'Space') {
            if (!keysState.space && playerBullets.length < 3) {
                playerBullets.push({ x: playerX + 14, y: 320, vy: -6 });
                playLaserSound();
            }
            keysState.space = true;
        }
        if (e.code === 'Escape') closeRetroConsoleOverlay();
    }

    function onArcadeKeyUp(e) {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') keysState.left = false;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') keysState.right = false;
        if (e.code === 'Space') keysState.space = false;
    }

    function playLaserSound() {
        try {
            const ctx = getAudioCtx();
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.1);
            g.gain.setValueAtTime(0.15, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            osc.connect(g); g.connect(ctx.destination);
            osc.start(); osc.stop(ctx.currentTime + 0.12);
        } catch (e) {}
    }

    function playExplosionSound() {
        try {
            const ctx = getAudioCtx();
            const noise = ctx.createBufferSource();
            noise.buffer = makeNoiseBuffer(ctx, 0.3);
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(600, ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.25);
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.25, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            noise.connect(filter); filter.connect(g); g.connect(ctx.destination);
            noise.start(); noise.stop(ctx.currentTime + 0.3);
        } catch (e) {}
    }

    function arcadeLoop() {
        if (!arcadeRunning) return;
        const cvs = document.getElementById('canvas-ps1-arcade');
        if (!cvs) return;
        const ctx = cvs.getContext('2d');
        const W = cvs.width, H = cvs.height;

        if (keysState.left) playerX = Math.max(10, playerX - 4);
        if (keysState.right) playerX = Math.min(W - 40, playerX + 4);

        for (let i = playerBullets.length - 1; i >= 0; i--) {
            const b = playerBullets[i];
            b.y += b.vy;
            if (b.y < 0) {
                playerBullets.splice(i, 1);
                continue;
            }
            for (let e of enemyList) {
                if (e.alive && b.x >= e.x && b.x <= e.x + e.w && b.y >= e.y && b.y <= e.y + e.h) {
                    e.alive = false;
                    playerBullets.splice(i, 1);
                    arcadeScore += 100;
                    playExplosionSound();
                    break;
                }
            }
        }

        let moveDown = false;
        let leftmost = W, rightmost = 0;
        let aliveCount = 0;
        enemyList.forEach(e => {
            if (e.alive) {
                aliveCount++;
                if (e.x < leftmost) leftmost = e.x;
                if (e.x + e.w > rightmost) rightmost = e.x + e.w;
            }
        });

        if (rightmost > W - 15 && enemyDir > 0) { enemyDir = -1; moveDown = true; }
        if (leftmost < 15 && enemyDir < 0) { enemyDir = 1; moveDown = true; }

        enemyList.forEach(e => {
            if (e.alive) {
                e.x += enemyDir * enemySpeed;
                if (moveDown) e.y += 12;
            }
        });

        if (aliveCount === 0) {
            arcadeRunning = false;
            if (typeof window.updateWallet === 'function') {
                window.updateWallet(0.1);
            }
            showNotificationPrompt(tFn("room_notif_arcade_win", "[ 🏆 ¡VICTORIA EN PS1 ARCADE! Recompensa: +0.100 BTC ]"));
            setTimeout(closeRetroConsoleOverlay, 1500);
        }

        ctx.fillStyle = '#000814';
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        for (let s = 0; s < 25; s++) {
            ctx.fillRect((s * 73) % W, (s * 47) % H, 2, 2);
        }

        ctx.fillStyle = '#00ff66';
        ctx.fillRect(playerX + 12, 330, 6, 12);
        ctx.fillRect(playerX + 4, 336, 22, 8);
        ctx.fillRect(playerX, 342, 30, 8);

        ctx.fillStyle = '#ffff00';
        playerBullets.forEach(b => {
            ctx.fillRect(b.x, b.y, 3, 8);
        });

        enemyList.forEach(e => {
            if (e.alive) {
                ctx.fillStyle = e.type === 0 ? '#ff3366' : e.type === 1 ? '#00ffff' : '#ffaa00';
                ctx.fillRect(e.x + 4, e.y, e.w - 8, 4);
                ctx.fillRect(e.x, e.y + 4, e.w, e.h - 8);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(e.x + 4, e.y + 6, 4, 4);
                ctx.fillRect(e.x + e.w - 8, e.y + 6, 4, 4);
            }
        });

        const scoreEl = document.getElementById('ps1-arcade-score');
        if (scoreEl) {
            scoreEl.innerText = `SCORE: ${arcadeScore.toString().padStart(4, '0')} | ALIENÍGENAS: ${aliveCount}`;
        }

        arcadeAnimId = requestAnimationFrame(arcadeLoop);
    }

    function playPS1ConsoleMinigame() {
        playRetroClick(1.1);
        openRetroConsoleOverlay();
    }

    // ============================================================
    // 4. EXPORTS GLOBALES
    // ============================================================
    window.RoomInteractions = {
        getAudioCtx,
        playRetroClick,
        playKeyStrokeSound: (pitch = 0.7) => playRetroClick(pitch),
        playDoorSqueak,
        playThunderSound,
        playCatMeow,
        playCatPurr,
        playWoodCreak,
        playTVPowerSound,
        playMorningBirdsSound,
        playAlarmChime,
        startPhoneRinging,
        stopPhoneRinging,
        stopRadioAudio,
        updateWeatherAudio,
        stopWeatherAudio,
        toggleBoombox,
        cycleRadioStation,
        toggleWindow,
        toggleDoor,
        toggleDoorLock,
        interactBed,
        interactPhone,
        toggleTV,
        cycleTVChannel,
        petCat,
        playPS1ConsoleMinigame,
        showNotificationPrompt,
        openRetroConsoleOverlay,
        closeRetroConsoleOverlay,
        updateTrafficAudio,
        stopTrafficAudio,
        stopAllAmbientAudio,
        playCarHonk,
        playBikeBell,
        playPuddleSplashSound,
        playApproachingCarSound,
        playHeartbeatFast,
        playNightmareDrone,
        playNightmareScreech,
        playGaspWakeupSound,
        playCinematicChapterTransitionStinger,
        interactXmasGifts,
        interactHotCocoa,
        interactXmasCookies,
        interactXmasWreath,
        interactHalloweenCandy,
        interactHalloweenSkull,
        interactHalloweenPotion,
        interactHalloweenWreath,
        STATIONS,
        TV_CHANNELS
    };

    window.openRetroConsoleOverlay = openRetroConsoleOverlay;
    window.closeRetroConsoleOverlay = closeRetroConsoleOverlay;

})();
