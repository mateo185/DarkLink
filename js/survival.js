// --- MECÁNICAS DE SUPERVIVENCIA, THREAT LOOPS, WIN & LOSE SEQUENCES ---

let threatInterval = null;

// --- CUSTOM ALERT MODAL ---
function showCustomAlert(title, msg, type = 'info') {
    const alertBox = document.getElementById('custom-alert');
    if (!alertBox) return;
    const titleEl = document.getElementById('custom-alert-title');
    const msgEl = document.getElementById('custom-alert-msg');
    
    titleEl.innerText = title;
    msgEl.innerText = msg;
    
    if (type === 'error') {
        alertBox.style.borderColor = 'red';
        alertBox.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.5)';
        titleEl.style.color = 'red';
        if (typeof playErrorSound === 'function') playErrorSound();
    } else if (type === 'success') {
        alertBox.style.borderColor = 'lime';
        alertBox.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.5)';
        titleEl.style.color = 'lime';
        if (typeof playSuccessSound === 'function') playSuccessSound();
    } else {
        alertBox.style.borderColor = '#3399ff';
        alertBox.style.boxShadow = '0 0 20px rgba(51, 153, 255, 0.5)';
        titleEl.style.color = '#3399ff';
        if (typeof playSuccessSound === 'function') playSuccessSound();
    }
    
    alertBox.classList.remove('hidden');
}

function startGlobalTimer() {
    const globalTimerEl = document.getElementById('global-timer');
    clearInterval(state.globalTimerInterval);
    state.globalTimerInterval = setInterval(() => {
        state.globalTimeLeft--;
        
        let m = Math.floor(state.globalTimeLeft / 60).toString().padStart(2, '0');
        let s = (state.globalTimeLeft % 60).toString().padStart(2, '0');
        if (globalTimerEl) globalTimerEl.innerText = `${m}:${s}`;
        
        if (state.globalTimeLeft <= 60 && globalTimerEl) {
            globalTimerEl.style.animation = "blink 0.2s infinite";
        }
        
        if (state.globalTimeLeft <= 0) {
            clearInterval(state.globalTimerInterval);
            const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;
            gameOver(tFn("gameover_time_out", "EL TIEMPO SE HA AGOTADO. TUS DATOS HAN SIDO PUBLICADOS EN LA DEEP WEB Y TU UBICACIÓN COMPROMETIDA."));
        }
    }, 1000);
}

function triggerHackSequence() {
    const hackerWin = document.getElementById('window-hacker');
    const survivalUI = document.getElementById('survival-ui');

    state.hackerRevealed = true;
    if (hackerWin) {
        hackerWin.classList.remove('hidden');
        if (typeof bringToFront === 'function') bringToFront(hackerWin);
    }
    if (typeof addTaskbarTab === 'function') addTaskbarTab('hacker', '¡ALERTA!');
    
    const hackerTextEl = document.getElementById('hacker-text');
    if (hackerTextEl) {
        const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;
        hackerTextEl.innerHTML = tFn("threat_intrusion_detected", "> INTRUSIÓN DETECTADA...<br>> ACCEDIENDO DESDE IP 184.22.9.101...<br>> EJECUTANDO CONEXIÓN REMOTA SECUESTRADA...<br>> TODOS LOS PUERTOS VULNERADOS.");
    }
    
    if (survivalUI) survivalUI.classList.remove('hidden'); // Botón de apagar pantalla listo
    
    // No webcam in normal mode (as requested: "la idea es que no haya nada de la camara en el modo normal")

    // Iniciar Misiones y Timer inmediatamente
    updateQuest(1);
    startGlobalTimer();
    
    // Glitch en toda la pantalla
    document.body.style.animation = "glitch-anim 0.3s 3";
    if (typeof playGlitchSound === 'function') playGlitchSound();
    
    if (typeof queueDialogues === 'function') {
        const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;
        queueDialogues([
            { name: "Terminal", text: tFn("diag_term_download", "> DESCARGA AUTORIZADA...\n> EJECUTANDO PAYLOAD.EXE EN SEGUNDO PLANO.") },
            { name: "Terminal", text: tFn("diag_term_firewall", "> FIREWALL DE WINDOWS DERROTADO.\n> OBTENIENDO CONTROL DE CÁMARA WEB Y MICRÓFONO.") },
            { name: "Hacker", text: tFn("diag_hacker_1", "Te estaba esperando, {name}.").replace('{name}', state.playerName) },
            { name: "Hacker", text: tFn("diag_hacker_2", "Mientras navegabas ahí creyéndote seguro, acabas de ejecutar mi malware directamente en tu red local.") },
            { name: "Hacker", text: tFn("diag_hacker_3", "Conozco tu ubicación, y ya he subido todo tu historial y archivos personales a mi servidor.") },
            { name: "Hacker", text: tFn("diag_hacker_4", "Si no me transfieres dinero en las próximas horas, enviaré esta información a todos tus contactos, y recibirás una visita.") },
            { name: "player", text: tFn("diag_player_threatened", "¡Oh no! Me amenazan con venir a mi casa. ¿Qué acabo de hacer?") },
            { name: "Sistema", text: tFn("diag_sys_alert_5min", "ALERTA DE SEGURIDAD. Sistema comprometido. Tiempo estimado para extracción total de datos: 5 minutos.") },
            { name: "Sistema", text: tFn("diag_sys_recom_counter", "Se recomienda iniciar protocolo de contra-hackeo manual. Revisa la lista de tareas activa en el escritorio.") },
            { name: "Sistema", text: tFn("diag_sys_tutorial_physical", "TUTORIAL FÍSICO: El atacante ha enviado a alguien. Si escuchas PISADAS, mantente alerta. Si escuchas RESPIRACIÓN en la misma sala, asegúrate de APAGAR LA PANTALLA manteniendo el click hasta que se marche."), event: () => {
                startSurvivalLoop();
            }}
        ]);
    }
}

function startGreatPurge() {
    const winTerminal = document.getElementById('window-terminal');
    const windowPurge = document.getElementById('window-purge');
    const purgeBar = document.getElementById('purge-bar');
    const purgeProgress = document.getElementById('purge-progress');
    const logBox = document.getElementById('purge-log-box');
    const challengeBox = document.getElementById('purge-challenge-box');

    if (winTerminal) winTerminal.classList.add('hidden');
    if (windowPurge) {
        windowPurge.classList.remove('hidden');
        if (typeof bringToFront === 'function') bringToFront(windowPurge);
    }

    // Ocultar todas las demás ventanas abiertas para concentrar al jugador en la purga
    document.querySelectorAll('.os-window').forEach(w => {
        if (w !== windowPurge) w.classList.add('hidden');
    });
    
    // Desactivar interacciones externas (barra de tareas, iconos del escritorio, menú de inicio)
    const taskbarAppsEl = document.getElementById('taskbar-apps');
    if (taskbarAppsEl) {
        taskbarAppsEl.style.pointerEvents = 'none';
        taskbarAppsEl.style.opacity = '0.3';
    }
    const startBtn = document.querySelector('.start-btn');
    if (startBtn) {
        startBtn.style.pointerEvents = 'none';
        startBtn.style.opacity = '0.3';
    }
    const desktopIcons = document.querySelector('.desktop-icons');
    if (desktopIcons) {
        desktopIcons.style.pointerEvents = 'none';
        desktopIcons.style.opacity = '0.3';
    }
    const winHello = document.getElementById('winhello-assistant');
    if (winHello) winHello.classList.add('hidden');

    
    // Aumentar la agresividad del intruso (Climax)
    clearInterval(threatInterval);
    threatInterval = setInterval(() => {
        if (!state.threatActive && !state.isDialogueActive && Math.random() < 0.6) {
            triggerThreat();
        }
    }, 2000);

    let progress = 0;
    let isPurgeBlocked = false;
    let completedMilestones = { 20: false, 40: false, 60: false, 80: false };

    function addPurgeLog(text, color = '#ff3333') {
        if (logBox) {
            logBox.style.display = 'block';
            const p = document.createElement('p');
            p.style.margin = '2px 0';
            p.style.color = color;
            p.innerText = text;
            logBox.appendChild(p);
            logBox.scrollTop = logBox.scrollHeight;
        }
    }

    function setRunningChallengeText(text) {
        if (challengeBox) {
            challengeBox.innerHTML = `<p style="color: #888; animation: blink 1.5s infinite;">${text}</p>`;
        }
    }

    const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;

    // Inicializar logs y retos
    if (logBox) logBox.innerHTML = '';
    addPurgeLog(tFn("purge_log_init", ">>> INICIALIZANDO PURGA DE SISTEMA GLOBAL..."), "lime");
    addPurgeLog(tFn("purge_log_analyzing", ">>> Analizando firmas en el sector de arranque..."), "lime");
    setRunningChallengeText(tFn("purge_log_analyzing", "Analizando sector de arranque..."));

    let purgeInterval = setInterval(() => {
        if (!state.threatActive && !state.screenOff && !isPurgeBlocked) {
            progress += 2; // 2% por segundo -> ~50 seg sin bloqueos
            
            // Mensajes de log automáticos en base al progreso
            if (Math.floor(progress) === 10) {
                addPurgeLog(tFn("purge_log_boot_clean", ">>> Sector de arranque: LIMPIO."));
                setRunningChallengeText(tFn("purge_status_disinfecting", "Desinfectando tablas de asignación de archivos..."));
            } else if (Math.floor(progress) === 30) {
                addPurgeLog(tFn("purge_log_sockets", ">>> Cerrando sockets ilegales en puertos de red..."), "lime");
                setRunningChallengeText(tFn("purge_status_purging_conn", "Purgando conexiones activas del atacante..."));
            } else if (Math.floor(progress) === 50) {
                addPurgeLog(tFn("purge_log_ram", ">>> Eliminando malware residual de caché y memoria RAM..."));
                setRunningChallengeText(tFn("purge_status_deleting_traces", "Borrando huellas del intruso..."));
            } else if (Math.floor(progress) === 70) {
                addPurgeLog(tFn("purge_log_rebuilding", ">>> Reconstruyendo archivos de sistema dañados..."), "lime");
                setRunningChallengeText(tFn("purge_status_validating_kernel", "Validando integridad del Kernel..."));
            } else if (Math.floor(progress) === 90) {
                addPurgeLog(tFn("purge_log_finalizing", ">>> Desinfección global completada al 99%. Preparando apagado seguro..."), "lime");
                setRunningChallengeText(tFn("purge_status_finalizing", "Finalizando procesos de purga..."));
            }
        }
        
        if (progress > 100) progress = 100;
        
        if (purgeBar) purgeBar.style.width = progress + '%';
        if (purgeProgress) purgeProgress.innerText = Math.floor(progress) + '%';

        // Comprobar hitos para retos
        const floorProg = Math.floor(progress);
        if (floorProg >= 20 && floorProg < 30 && !completedMilestones[20] && !isPurgeBlocked) {
            triggerPurgeChallenge(20);
        } else if (floorProg >= 40 && floorProg < 50 && !completedMilestones[40] && !isPurgeBlocked) {
            triggerPurgeChallenge(40);
        } else if (floorProg >= 60 && floorProg < 70 && !completedMilestones[60] && !isPurgeBlocked) {
            triggerPurgeChallenge(60);
        } else if (floorProg >= 80 && floorProg < 90 && !completedMilestones[80] && !isPurgeBlocked) {
            triggerPurgeChallenge(80);
        }
        
        if (progress >= 100) {
            clearInterval(purgeInterval);
            setTimeout(() => {
                if (purgeBar) purgeBar.style.width = '0%';
                if (purgeProgress) purgeProgress.innerText = '0%';
            }, 2000);
            gameWon();
        }
    }, 1000);

    function triggerPurgeChallenge(milestone) {
        isPurgeBlocked = true;
        addPurgeLog(tFn("purge_alert_milestone", ">>> [ALERTA] ¡RETROALIMENTACIÓN HOSTIL DETECTADA A LOS {milestone}%!").replace('{milestone}', milestone), "red");
        
        if (typeof playVirusAlarmSound === 'function') playVirusAlarmSound();
        
        if (milestone === 20) {
            // Reto 1: Token Alfanumérico
            addPurgeLog(tFn("purge_log_fw_locked", ">>> Cortafuegos bloqueado. Ingrese token de descompresión."), "yellow");
            const token = Math.random().toString(36).substring(2, 8).toUpperCase();
            
            if (challengeBox) {
                challengeBox.innerHTML = `
                    <div style="text-align: center; color: white; width: 100%;">
                        <p style="color: #ff3333; font-size: 1.1rem; font-weight: bold; margin: 0 0 8px 0;">${tFn("purge_ch1_title", "[ RETO 1: VERIFICAR FIRMA ]")}</p>
                        <p style="margin: 0 0 10px 0; font-size: 0.9rem;">${tFn("purge_ch1_desc", "Escribe el siguiente token de descompresión:")}</p>
                        <p style="font-size: 1.4rem; letter-spacing: 3px; color: #00ff66; font-weight: bold; margin: 0 0 12px 0; background: #222; padding: 4px 10px; display: inline-block; border: 1px dashed #00ff66; font-family: monospace;">${token}</p>
                        <div>
                            <input type="text" id="purge-token-input" autocomplete="off" style="background: black; border: 1px solid #ff3333; color: white; padding: 5px; font-family: monospace; font-size: 1rem; width: 120px; text-align: center; text-transform: uppercase; outline: none;">
                            <button id="purge-token-btn" class="terminal-btn" style="border-color: #ff3333; color: #ff3333; margin-left: 5px; font-size: 0.9rem; padding: 4px 10px; cursor: pointer;">${tFn("purge_ch1_btn", "VALIDAR")}</button>
                        </div>
                    </div>
                `;
                
                const inputEl = document.getElementById('purge-token-input');
                const btnEl = document.getElementById('purge-token-btn');
                
                const validate = () => {
                    const userVal = inputEl.value.trim().toUpperCase();
                    if (userVal === token) {
                        isPurgeBlocked = false;
                        completedMilestones[20] = true;
                        if (typeof playSuccessSound === 'function') playSuccessSound();
                        addPurgeLog(tFn("purge_log_fw_ok", ">>> [OK] Cortafuegos liberado. Continuando purga..."), "lime");
                        setRunningChallengeText(tFn("purge_status_disinfecting_short", "Desinfectando tablas de asignación..."));
                    } else {
                        if (typeof playGlitchSound === 'function') playGlitchSound();
                        inputEl.value = '';
                        inputEl.focus();
                        addPurgeLog(tFn("purge_log_token_err", ">>> [ERROR] Token incorrecto. Intente de nuevo."), "red");
                    }
                };
                
                if (btnEl) btnEl.addEventListener('click', validate);
                if (inputEl) {
                    inputEl.focus();
                    inputEl.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') validate();
                    });
                }
            }
        } 
        else if (milestone === 40) {
            // Reto 2: Inundación de Puertos (Clicker en botón activo)
            addPurgeLog(tFn("purge_log_ports_compromised", ">>> Puertos de red comprometidos. Desactívalos manualmente."), "yellow");
            let clicksRemaining = 3;
            
            const renderPorts = () => {
                if (!challengeBox) return;
                
                const ports = [80, 443, 8080, 22];
                const activeIndex = Math.floor(Math.random() * ports.length);
                
                challengeBox.innerHTML = `
                    <div style="text-align: center; color: white; width: 100%;">
                        <p style="color: #ff3333; font-size: 1.1rem; font-weight: bold; margin: 0 0 8px 0;">${tFn("purge_ch2_title", "[ RETO 2: INUNDACIÓN DE PUERTOS ]")}</p>
                        <p style="margin: 0 0 10px 0; font-size: 0.9rem;">${tFn("purge_ch2_desc", "Desactive los puertos en rojo ({count} restantes):").replace('{count}', clicksRemaining)}</p>
                        <div id="purge-ports-container" style="display: flex; gap: 10px; justify-content: center; margin-top: 10px;">
                            ${ports.map((port, idx) => {
                                const isActive = idx === activeIndex;
                                return `
                                    <button class="terminal-btn purge-port-btn" data-index="${idx}" style="
                                        width: 80px; 
                                        padding: 8px 0; 
                                        font-family: monospace; 
                                        font-size: 0.9rem; 
                                        ${isActive ? 'background: red !important; color: black !important; border-color: red !important; cursor: pointer; animation: blink 0.5s infinite;' : 'background: #000; color: #444; border-color: #222; pointer-events: none;'}
                                    ">
                                        P-${port}
                                    </button>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
                
                const btns = challengeBox.querySelectorAll('.purge-port-btn');
                btns.forEach(btn => {
                    const idx = parseInt(btn.getAttribute('data-index'));
                    if (idx === activeIndex) {
                        btn.addEventListener('click', () => {
                            clicksRemaining--;
                            if (typeof playClickSound === 'function') playClickSound();
                            
                            if (clicksRemaining <= 0) {
                                isPurgeBlocked = false;
                                completedMilestones[40] = true;
                                if (typeof playSuccessSound === 'function') playSuccessSound();
                                addPurgeLog(tFn("purge_log_ports_ok", ">>> [OK] Sobrecarga de puertos contenida. Resumiendo purga..."), "lime");
                                setRunningChallengeText(tFn("purge_status_deleting_temp", "Borrando archivos maliciosos temporales..."));
                            } else {
                                renderPorts();
                            }
                        });
                    }
                });
            };
            
            renderPorts();
        } 
        else if (milestone === 60) {
            // Reto 3: Ecuación matemática
            addPurgeLog(tFn("purge_log_cpu_overheat", ">>> CPU sobrecalentada. Calibre el reloj del procesador."), "yellow");
            const num1 = Math.floor(Math.random() * 40) + 15;
            const num2 = Math.floor(Math.random() * 40) + 15;
            const ans = num1 + num2;
            
            if (challengeBox) {
                challengeBox.innerHTML = `
                    <div style="text-align: center; color: white; width: 100%;">
                        <p style="color: #ff3333; font-size: 1.1rem; font-weight: bold; margin: 0 0 8px 0;">${tFn("purge_ch3_title", "[ RETO 3: CALIBRAR FRECUENCIA ]")}</p>
                        <p style="margin: 0 0 10px 0; font-size: 0.9rem;">${tFn("purge_ch3_desc", "Sincronice el CPU ingresando la suma de frecuencia:")}</p>
                        <p style="font-size: 1.5rem; color: #00ff66; font-weight: bold; margin: 0 0 12px 0; font-family: monospace;">${num1} + ${num2} = ?</p>
                        <div>
                            <input type="number" id="purge-math-input" autocomplete="off" style="background: black; border: 1px solid #ff3333; color: white; padding: 5px; font-family: monospace; font-size: 1rem; width: 100px; text-align: center; outline: none;">
                            <button id="purge-math-btn" class="terminal-btn" style="border-color: #ff3333; color: #ff3333; margin-left: 5px; font-size: 0.9rem; padding: 4px 10px; cursor: pointer;">${tFn("purge_ch3_btn", "CALIBRAR")}</button>
                        </div>
                    </div>
                `;
                
                const inputEl = document.getElementById('purge-math-input');
                const btnEl = document.getElementById('purge-math-btn');
                
                const validate = () => {
                    const userVal = parseInt(inputEl.value);
                    if (userVal === ans) {
                        isPurgeBlocked = false;
                        completedMilestones[60] = true;
                        if (typeof playSuccessSound === 'function') playSuccessSound();
                        addPurgeLog(tFn("purge_log_clock_ok", ">>> [OK] Reloj sincronizado correctamente."), "lime");
                        setRunningChallengeText(tFn("purge_status_scanning_kernel", "Escaneando integridad de la memoria del kernel..."));
                    } else {
                        if (typeof playGlitchSound === 'function') playGlitchSound();
                        inputEl.value = '';
                        inputEl.focus();
                        addPurgeLog(tFn("purge_log_freq_err", ">>> [ERROR] Frecuencia errónea. Reintentando..."), "red");
                    }
                };
                
                if (btnEl) btnEl.addEventListener('click', validate);
                if (inputEl) {
                    inputEl.focus();
                    inputEl.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') validate();
                    });
                }
            }
        } 
        else if (milestone === 80) {
            // Reto 4: Comando de fuerza
            addPurgeLog(tFn("purge_log_abort_detected", ">>> Aborto forzado detectado. Fuerza el protocolo final."), "yellow");
            const cmdText = tFn("purge_cmd_force_text", "purgar --forzar");
            
            if (challengeBox) {
                challengeBox.innerHTML = `
                    <div style="text-align: center; color: white; width: 100%;">
                        <p style="color: #ff3333; font-size: 1.1rem; font-weight: bold; margin: 0 0 8px 0;">${tFn("purge_ch4_title", "[ RETO 4: PROTOCOLO DE FUERZA ]")}</p>
                        <p style="margin: 0 0 10px 0; font-size: 0.9rem;">${tFn("purge_ch4_desc", "Escriba el siguiente comando para forzar la purga final:")}</p>
                        <p style="font-size: 1.1rem; color: #ff9900; font-family: monospace; margin: 0 0 12px 0; background: #2b1100; padding: 4px 10px; display: inline-block; border: 1px solid #ff9900;">${cmdText}</p>
                        <div>
                            <input type="text" id="purge-cmd-input" autocomplete="off" style="background: black; border: 1px solid #ff3333; color: white; padding: 5px; font-family: monospace; font-size: 1.0rem; width: 160px; text-align: center; outline: none;">
                            <button id="purge-cmd-btn" class="terminal-btn" style="border-color: #ff3333; color: #ff3333; margin-left: 5px; font-size: 0.9rem; padding: 4px 10px; cursor: pointer;">${tFn("purge_ch4_btn", "EJECUTAR")}</button>
                        </div>
                    </div>
                `;
                
                const inputEl = document.getElementById('purge-cmd-input');
                const btnEl = document.getElementById('purge-cmd-btn');
                
                const validate = () => {
                    const userVal = inputEl.value.trim().toLowerCase();
                    if (userVal === cmdText.toLowerCase() || userVal === "purge --force" || userVal === "purgar --forzar") {
                        isPurgeBlocked = false;
                        completedMilestones[80] = true;
                        if (typeof playSuccessSound === 'function') playSuccessSound();
                        addPurgeLog(tFn("purge_log_force_ok", ">>> [OK] Protocolo de fuerza exitoso. Ejecutando purga final..."), "lime");
                        setRunningChallengeText(tFn("purge_status_finalizing_system", "Finalizando purga del sistema..."));
                    } else {
                        if (typeof playGlitchSound === 'function') playGlitchSound();
                        inputEl.value = '';
                        inputEl.focus();
                        addPurgeLog(tFn("purge_log_cmd_err", ">>> [ERROR] Comando no reconocido."), "red");
                    }
                };
                
                if (btnEl) btnEl.addEventListener('click', validate);
                if (inputEl) {
                    inputEl.focus();
                    inputEl.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') validate();
                    });
                }
            }
        }
    }
}

function gameWon() {
    clearInterval(state.globalTimerInterval);
    clearInterval(threatInterval);
    if (state.threatTimerInterval) clearInterval(state.threatTimerInterval);
    
    if (typeof stopThreatSound === 'function') stopThreatSound();
    if (typeof realAudioFootsteps !== 'undefined') realAudioFootsteps.pause();
    
    document.querySelectorAll('.os-window').forEach(w => w.classList.add('hidden'));
    
    const survivalUI = document.getElementById('survival-ui');
    const questLog = document.getElementById('quest-log');
    if (survivalUI) survivalUI.classList.add('hidden');
    if (questLog) questLog.classList.add('hidden');
    
    const blackScreen = document.getElementById('screen-black');
    if (blackScreen) {
        const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;
        blackScreen.classList.remove('hidden');
        blackScreen.innerHTML = `
            <div style="color:lime; text-align:center; font-family:monospace; display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh;">
                <h1 style="font-size:3rem; margin-bottom:20px; text-shadow:0 0 10px lime;">${tFn("victory_threat_neutralized", "[ AMENAZA NEUTRALIZADA ]")}</h1>
                <p style="font-size:1.5rem;">${tFn("victory_system_purged", "El sistema ha sido purgado exitosamente.")}</p>
                <p style="font-size:1.2rem; color:#aaa; margin-top:20px;">${tFn("victory_survived_darknet", "Sobreviviste a la DarkNet y la conexión ha sido terminada.")}</p>
                <div style="margin-top:40px; display:flex; gap:20px;">
                    <button class="terminal-btn" style="border-color:lime; color:lime;" onclick="location.reload()">${tFn("victory_exit_btn", "_SALIR_DEL_SISTEMA")}</button>
                    <button class="terminal-btn" style="border-color:#3399ff; color:#3399ff;" onclick="enterFreeRoamFromVictory()">${tFn("victory_freeroam_btn", "_ENTRAR_MODO_LIBRE")}</button>
                </div>
            </div>
        `;
    }
}

function enterFreeRoamFromVictory() {
    const blackScreen = document.getElementById('screen-black');
    if (blackScreen) {
        blackScreen.classList.add('hidden');
        blackScreen.innerHTML = '';
    }
    const gameoverScreen = document.getElementById('screen-gameover');
    if (gameoverScreen) {
        gameoverScreen.classList.add('hidden');
        gameoverScreen.classList.remove('active');
    }
    const screens = ['screen-menu', 'screen-name', 'screen-booting', 'screen-setup-deepweb', 'screen-desktop'];
    screens.forEach(s => {
        const el = document.getElementById(s);
        if (el) {
            el.classList.remove('active');
            el.classList.add('hidden');
        }
    });

    if (typeof stopMenuMusic === 'function') stopMenuMusic();
    
    state.freeRoam = true;
    state.freeRoamInitialized = false;
    state.sandboxTutorialStep = 0;

    // Iniciar 3D PS1 intro / Modo Libre
    if (typeof startPS1Intro === 'function') {
        startPS1Intro();
    } else if (typeof startFreeRoam === 'function') {
        startFreeRoam();
    }
}
window.enterFreeRoamFromVictory = enterFreeRoamFromVictory;

function startFreeRoam() {
    const isReentry = !!state.freeRoamInitialized;
    state.freeRoam = true;
    state.freeRoamInitialized = true;
    state.firstTimeSandbox = false;
    state.hackerRevealed = false;
    
    // Limpiar terminal de comandos solo al iniciar el modo libre por primera vez
    if (!isReentry && typeof resetTerminal === 'function') resetTerminal();
    
    // Parar música del menú si sigue sonando
    if (typeof stopMenuMusic === 'function') stopMenuMusic();
    
    if (state.webcamStream) {
        if (typeof showCustomAlert === 'function') {
            showCustomAlert("CÁMARA CONFIGURADA", "El dispositivo de captura de video ha sido inicializado correctamente.", "success");
        }
    }
    
    const blackScreen = document.getElementById('screen-black');
    if (blackScreen) {
        blackScreen.classList.add('hidden');
        blackScreen.innerHTML = '<p class="hidden-message">PANTALLA APAGADA... Mantente en silencio.</p>';
    }
    
    const winPurge = document.getElementById('window-purge');
    if (winPurge) winPurge.classList.add('hidden'); 
    updateQuest(-1);
    
    const purgeBar = document.getElementById('purge-bar');
    const purgeProgress = document.getElementById('purge-progress');
    if (purgeBar) purgeBar.style.width = '0%';
    if (purgeProgress) purgeProgress.innerText = '0%';

    clearInterval(state.globalTimerInterval);
    
    // Activar Tema A.N.N para Modo Libre
    document.body.classList.add('ann-theme');
    const browserWindow = document.querySelector('.browser-window');
    if (browserWindow) browserWindow.classList.add('ann-theme');
    
    const titleText = document.getElementById('browser-title-text');
    if (titleText) titleText.innerText = "Phantom - Anonymous Onion Router";
    
    // Router screens desktop
    const screens = ['screen-menu', 'screen-name', 'screen-booting', 'screen-setup-deepweb', 'screen-desktop', 'screen-gameover'];
    screens.forEach(s => {
        const el = document.getElementById(s);
        if (el) {
            el.classList.remove('active');
            el.classList.add('hidden');
        }
    });
    const desktopEl = document.getElementById('screen-desktop');
    if (desktopEl) {
        desktopEl.classList.remove('hidden');
        desktopEl.classList.add('active');
    }
    
    document.body.style.animation = "";
    
    // Mostrar iconos del modo libre
    const icons = ['icon-wiki', 'icon-chat', 'icon-antivirus', 'icon-paint', 'icon-camera', 'icon-wallpaper-gen', 'icon-nodemap', 'icon-miner', 'icon-netsniffer', 'icon-expediente'];
    icons.forEach(i => {
        const el = document.getElementById(i);
        if (el) el.classList.remove('hidden');
    });
    const netManagerIcon = document.getElementById('icon-netmanager');
    if (netManagerIcon) netManagerIcon.classList.add('hidden');

    // Cerrar ventanas y limpiar la barra de tareas ÚNICAMENTE en la primera inicialización de Modo Libre
    if (!isReentry) {
        document.querySelectorAll('.os-window').forEach(win => {
            win.classList.add('hidden');
        });
        const taskbarAppsEl = document.getElementById('taskbar-apps');
        if (taskbarAppsEl) {
            taskbarAppsEl.innerHTML = '';
            taskbarAppsEl.style.pointerEvents = '';
            taskbarAppsEl.style.opacity = '';
        }
    }
    const startBtn = document.querySelector('.start-btn');
    if (startBtn) {
        startBtn.style.pointerEvents = '';
        startBtn.style.opacity = '';
    }
    const desktopIcons = document.querySelector('.desktop-icons');
    if (desktopIcons) {
        desktopIcons.style.pointerEvents = '';
        desktopIcons.style.opacity = '';
    }
    const winHello = document.getElementById('winhello-assistant');
    if (winHello) winHello.classList.remove('hidden');


    startSurvivalLoop(0.15);

    if (!isReentry) {
        if (typeof queueDialogues === 'function') {
            const lang = (typeof window.getLanguage === 'function') ? window.getLanguage() : 'es';
            queueDialogues([
                { 
                    name: lang === 'en' ? "System" : "Sistema", 
                    text: lang === 'en'
                        ? "A.N.N Sandbox protocol initialized. Accessing unindexed deep network..."
                        : "Protocolo A.N.N Sandbox iniciado. Accediendo a la red profunda no indexada..."
                }
            ]);
        }
        
        if (typeof initFreeModeNavigation === 'function') initFreeModeNavigation();
        if (typeof loadPage === 'function') loadPage('torch'); // Cargar el buscador por defecto
        if (typeof updateBrowserURL === 'function') updateBrowserURL("http://torchsearch3x21d.ann/");
        if (typeof updateAntivirusUpgradesUI === 'function') updateAntivirusUpgradesUI();
        if (typeof startSandboxTutorial === 'function') startSandboxTutorial();
        
        // WinHello Cyber-Assistant reveal & init
        const assistantEl = document.getElementById('winhello-assistant');
        if (assistantEl) {
            assistantEl.classList.remove('hidden');
        }
        if (typeof initWinHelloAssistant === 'function') initWinHelloAssistant();
        if (typeof startWinHelloRandomDialogueLoop === 'function') startWinHelloRandomDialogueLoop();

        // Inicializar Story Mode (Expediente 98)
        if (window.StoryMode && typeof window.StoryMode.initStoryState === 'function') {
            window.StoryMode.initStoryState();
            window.StoryMode.updateStoryUI();
        }
        const storyWidget = document.getElementById('story-mission-widget');
        if (storyWidget) storyWidget.classList.remove('hidden');
    }

    // Iniciar reloj del sistema in-game en el modo Sandbox
    if (typeof window.startGameClock === 'function') {
        window.startGameClock();
    }

    // Actualizar ambiente estacional expandido para Modo Libre (toda la casa)
    if (typeof window.applySeasonalEnvironment === 'function') {
        window.applySeasonalEnvironment();
    }
}

// --- LOCAL NLP / MOCK AI CONVERSATIONAL ENGINE ---
// --- LOCAL NLP / MOCK AI CONVERSATIONAL ENGINE ---
if (!window.chatAIState) {
    window.chatAIState = {
        lastTopic: null,
        lastQuestion: null
    };
}

function getMockAIResponse(userMessage, isHackerChat = false) {
    const msg = userMessage.toLowerCase().trim();
    
    if (isHackerChat) {
        // Inicializar estado de memoria
        if (!window.chatAIState) {
            window.chatAIState = { lastTopic: null, lastQuestion: null };
        }
        const stateAI = window.chatAIState;

        // 1. EVALUAR RESPUESTAS A PREGUNTAS PREVIAS (MEMORIA CONTEXTUAL)
        if (stateAI.lastQuestion) {
            const lastQ = stateAI.lastQuestion;
            stateAI.lastQuestion = null; // resetear para evitar bucles
            
            const isAffirmative = msg.includes('si') || msg.includes('claro') || msg.includes('obvio') || msg.includes('sisi') || msg.includes('ya');
            const isNegative = msg.includes('no') || msg.includes('nunca') || msg.includes('todavia') || msg.includes('nono');

            if (lastQ === 'pregunta_monero') {
                if (isAffirmative) {
                    return "bien ahí. monero (XMR) es lo único q nos protege del análisis de cadena. los federales tienen re monitoreados los nodos de salida de BTC, no te regales.";
                } else if (isNegative) {
                    return "deberías cambiarte. usa el swap de Shadow Exchange para limpiar tus bitcoins antes de comprar cosas sensibles en el mercado.";
                }
            }
            if (lastQ === 'pregunta_diario') {
                if (isAffirmative) {
                    return "buenísimo. ¿viste los logs del servidor local? la IP es 184.22.9.101. con la credencial ssh admin_net puedes intentar entrar desde la terminal. manda exploit si tienes el pack.";
                } else if (isNegative) {
                    return "descárgalo del blog y dale a 'decrypt diario_hacker.pgp' en la consola. tienes q haber comprado el kit PGP de antemano xd.";
                }
            }
            if (lastQ === 'pregunta_antivirus') {
                if (isAffirmative) {
                    return "joya, mantenlo encendido. pero ponete la vpn tmb, el antivirus solo frena exploits lógicos, no te enmascara la IP física.";
                } else if (isNegative) {
                    return "tas re loco... actívalo ya en la app Shield, si te entra un rootkit o te tiran ddos te van a tumbar la conexión al toque.";
                }
            }
        }

        // 2. PREGUNTAS DE CONTINUACIÓN (¿POR QUÉ?, ¿CÓMO?, ¿DÓNDE?)
        if (msg === 'por que' || msg === 'por qué' || msg === 'como' || msg === 'cómo' || msg === 'donde' || msg === 'dónde' || msg === 'y por que' || msg === 'y por qué') {
            const topic = stateAI.lastTopic;
            if (topic === 'virus') {
                return msg.includes('como') 
                    ? "abre la app Shield Antivirus en el escritorio y dale a ESCANEAR. si compraste overclock tarda 2s, sino te vas a comer 5s xd" 
                    : "porque los payloads y descargas .pgp sin firmas válidas suelen venir inyectados con malware RAT.";
            }
            if (topic === 'btc') {
                return msg.includes('como') 
                    ? "hackea nodos con el comando 'hack <nodo>' o responde las tareas rápidas de DarkChat, pagan en btc al toque" 
                    : "porque bitcoin usa firmas transparentes públicas. si no las limpias en un mixer, asocian tu IP al saldo de una.";
            }
            if (topic === 'exploit') {
                return msg.includes('como') 
                    ? "compra el 'exploit_pack.pkg' en SilkSale por 0.40 btc. desbloquea el comando automático 'exploit <nodo_id>' en la consola" 
                    : "porque el exploit automatiza el descifrado perimetral sin tener q jugar los minijuegos manuales de hackeo. te ahorra tiempo.";
            }
            if (topic === 'camara') {
                return msg.includes('como') 
                    ? "el atacante inyecta scripts en 'driver_webcam.sys'. si te doxxean, apaga la pantalla (botón rojo) para cortar la captura en vivo" 
                    : "porque los hackers usan software de acceso remoto (RAT) para capturar video y chantajear usuarios.";
            }
            if (topic === 'vpn') {
                return msg.includes('como') 
                    ? "cómprala en SilkSale (0.20 btc) y se instala sola en el OS virtual. lo ves en la app Shield" 
                    : "porque oculta tu nodo de salida y rebota la señal para q no puedan triangular tu ubicación real.";
            }
        }

        // 3. DETECTAR INTENCIÓN Y CONFIGURAR CONTEXTO DE MEMORIA POR CONCEPTOS PRINCIPALES
        
        // Identidad / Quiénes son
        if (msg.includes('quien') || msg.includes('quién') || msg.includes('quienes') || msg.includes('quiénes') || msg.includes('sos')) {
            stateAI.lastTopic = 'identity';
            return "somos un grupo descentralizado de la red A.N.N... hackers, criptoanarquistas y algún que otro troll xd. mantente anónimo y no confíes en nadie por acá.";
        }

        // Hacking / Exploits / Terminal
        if (msg.includes('hack') || msg.includes('nodo') || msg.includes('ataque') || msg.includes('terminal') || msg.includes('exploit') || msg.includes('consola') || msg.includes('puerto')) {
            stateAI.lastTopic = 'exploit';
            const hacks = [
                "tengo un zero-day para ssh listo. busco intercambio por llaves pgp.",
                "el exploit de SilkSale funciona joya, pero tienes q desactivar el antivirus remoto primero. usa 'exploit <nodo_id>' si compraste el pack de 0.40 BTC.",
                "yo hackee un nodo ruso ayer con 'hack node_3'. me dio 0.15 btc directo a la wallet xd. pruébalo.",
                "el exploit pack vale 0.40 btc en el mercado. te ahorra toda la intrusión manual en consola. es un golazo."
            ];
            return hacks[Math.floor(Math.random() * hacks.length)];
        }

        // Dinero / Wallet / Monero / BTC
        if (msg.includes('btc') || msg.includes('bitcoin') || msg.includes('monero') || msg.includes('dinero') || msg.includes('wallet') || msg.includes('pagar') || msg.includes('comprar') || msg.includes('precio') || msg.includes('xmr') || msg.includes('saldo')) {
            stateAI.lastTopic = 'btc';
            stateAI.lastQuestion = 'pregunta_monero';
            
            // Inyectar contexto si el jugador es rico
            if (typeof state !== 'undefined' && state.walletBTC > 0.5) {
                return `veo q tienes un lindo balance en la wallet (₿ ${state.walletBTC.toFixed(3)}). ¿ya te compraste el exploit pack de 0.40 btc?`;
            }
            
            return "el btc está subiendo de precio, pero para transacciones pesadas yo uso Monero (XMR) que es irrastreable. ¿tú usas XMR o solo btc?";
        }

        // VPN / Proxy / IP / Seguridad
        if (msg.includes('vpn') || msg.includes('rastreo') || msg.includes('ip') || msg.includes('seguridad') || msg.includes('proxy') || msg.includes('cortafuegos')) {
            stateAI.lastTopic = 'vpn';
            
            // Inyectar contexto si el jugador ya tiene VPN
            if (typeof state !== 'undefined' && state.upgrades && state.upgrades.vpn) {
                return "veo q tienes vpn_phantom.ovpn activa en tu sistema virtual. con eso estás blindado de sniffers en nodos de salida.";
            }
            
            const vpn = [
                "conseguir 'vpn_phantom.ovpn' en SilkSale (0.20 btc) es obligatorio para que no rastreen tu IP física.",
                "si navegas sin VPN, el atacante te va a triangular al toque cuando entres a nodos sospechosos. no te regales.",
                "la VPN reduce al 50% la probabilidad de hackeos externos. vale totalmente la inversión."
            ];
            return vpn[Math.floor(Math.random() * vpn.length)];
        }

        // Antivirus / Scan / Infección
        if (msg.includes('antivirus') || msg.includes('escudo') || msg.includes('escaneo') || msg.includes('analisis') || msg.includes('virus') || msg.includes('infectado') || msg.includes('troyano') || msg.includes('malware') || msg.includes('desinfectar')) {
            stateAI.lastTopic = 'virus';
            stateAI.lastQuestion = 'pregunta_antivirus';
            
            // Inyectar contexto si escaneo activo
            if (typeof state !== 'undefined' && state.antivirusScanInProgress) {
                return "veo q estás escaneando la cpu ahora. si compraste overclock tarda 2s, sino te vas a comer 5s ahí xd.";
            }
            
            return "el escudo de la app Shield frena las intrusiones en tiempo real. ¿lo tienes encendido ahora mismo?";
        }

        // Cámara / Doxxeo / Ruidos
        if (msg.includes('camara') || msg.includes('webcam') || msg.includes('foto') || msg.includes('dox') || msg.includes('ruido') || msg.includes('pasos') || msg.includes('monitor') || msg.includes('pantalla')) {
            stateAI.lastTopic = 'camara';
            const threat = [
                "si oyes pasos virtuales o respiración rara, apaga el monitor (botón rojo) al toque. si no te van a meter un susto bárbaro xd.",
                "te pueden secuestrar la webcam con el script RAT de SilkSale. ponle una cinta si no quieres terminar doxxeado en el foro lol.",
                "ayer subieron la captura de un noob al foro por no apagar la pantalla a tiempo. qué risa.",
                "la paranoia de los pasos es real. quédate quieto y apaga la pantalla si escuchas algo cerca."
            ];
            return threat[Math.floor(Math.random() * threat.length)];
        }

        // PGP / Decrypt / Diario
        if (msg.includes('pgp') || msg.includes('clave') || msg.includes('descifrar') || msg.includes('cifrado') || msg.includes('decrypt') || msg.includes('diario')) {
            stateAI.lastTopic = 'pgp';
            stateAI.lastQuestion = 'pregunta_diario';
            return "para descifrar archivos .pgp (como diario_hacker.pgp) necesitas comprar el kit PGP de 0.15 btc y usar el comando 'decrypt' en la consola. ¿ya pudiste descifrar el diario?";
        }

        // Red Rooms
        if (msg.includes('redroom') || msg.includes('red room') || msg.includes('void stream') || msg.includes('puja') || msg.includes('live') || msg.includes('stream')) {
            stateAI.lastTopic = 'redroom';
            return "las redrooms cambian de IP constantemente. si compras la clave de acceso de 0.125 btc, te descarga el archivo .key para desencriptar el feed sin interferencias.";
        }

        // Wiki / Links / Buscar
        if (msg.includes('directorio') || msg.includes('wiki') || msg.includes('link') || msg.includes('pagina') || msg.includes('buscador') || msg.includes('torch') || msg.includes('enlace')) {
            stateAI.lastTopic = 'navigation';
            return "The Hidden Wiki está re caída. Lo mejor es usar Torch y buscar términos específicos como 'redroom', 'leaks', 'chat' o 'hosting'. Hay más de 100 páginas en la base de datos.";
        }

        // Saludo estándar
        if (msg.includes('hola') || msg.includes('buenas') || msg.includes('hello') || msg.includes('saludos') || msg.includes('buen') || msg.includes('hey') || msg.includes('hi ') || msg === 'hi') {
            stateAI.lastTopic = 'greeting';
            const greetings = [
                "qué tal Anon. ¿de qué nodo vienes? xd",
                "hola. cuidado con lo que hablas por aquí, hay mucho sniffer husmeando logs.",
                "buenas. ¿vienes a intercambiar exploits o solo a leer hilos?",
                "hey. ¿ya tienes la VPN configurada? cuida tu IP real.",
                "ey, bienvenido al canal. lee las reglas antes de postear cualquier cosa.",
                "qué onda. ¿sos nuevo o ya estuviste por estos canales antes?"
            ];
            return greetings[Math.floor(Math.random() * greetings.length)];
        }

        // Risas / Reacciones / Emociones
        if (msg.includes('jaja') || msg.includes('jeje') || msg.includes('xd') || msg.includes('lol') || msg.includes('lmao') || msg.includes('jajaj') || msg.includes('kjj') || msg.includes('ajaj') || msg === 'ja') {
            stateAI.lastTopic = 'reaction';
            const laughs = [
                "jajaj ¿de qué te reís? acá la cosa es seria, Anon.",
                "xd. si te causa gracia ahora, espera a que te llegue un exploit de verdad.",
                "no te rías mucho que los logs del canal quedan registrados xd.",
                "jajaj el humor hacker es otra cosa. ¿probaste a hackear un nodo? eso sí da risa cuando sale bien.",
                "lol. ¿estás en modo turista o viniste a hacer algo serio?",
                "me alegro que haya buen humor. en la deep web es raro encontrar a alguien que se ría xd."
            ];
            return laughs[Math.floor(Math.random() * laughs.length)];
        }

        // Wow / Sorpresa
        if (msg.includes('wow') || msg.includes('increible') || msg.includes('increíble') || msg.includes('wtf') || msg.includes('que loco') || msg.includes('impresionante') || msg.includes('tremendo') || msg.includes('genial') || msg.includes('zarpado') || msg.includes('waaa') || msg.includes('omg')) {
            stateAI.lastTopic = 'surprise';
            const surprises = [
                "jaja sí, las cosas que se ven por acá son de otro nivel. bienvenido a la deep web real.",
                "sorprendido? y eso que no viste las redrooms todavía xd.",
                "yeah, la red A.N.N tiene bastante material q no encontrás en la surface web.",
                "lo sé, es una locura. pero así funciona cuando no hay regulaciones ni censura.",
                "esto no es nada, espera a ver lo que hay si buscás 'leaks' o 'redroom' en Torch."
            ];
            return surprises[Math.floor(Math.random() * surprises.length)];
        }

        // Agradecimientos
        if (msg.includes('gracias') || msg.includes('thx') || msg.includes('thanks') || msg.includes('grax') || msg.includes('te agradezco') || msg.includes('mil gracias') || msg.includes('muchas gracias') || msg.includes('ty')) {
            stateAI.lastTopic = 'thanks';
            const thanks = [
                "de nada, Anon. en esta red nos cuidamos entre nosotros... o eso dicen.",
                "no hay por qué. pero si tienes BTC, las donaciones siempre se agradecen xd.",
                "tranca, pa eso estamos. cualquier duda usá el canal IRC o preguntá.",
                "todo bien. solo recuerda: acá la información vale monedas. la próxima te cobro en XMR jajaj.",
                "np. pero tené cuidado a quién le das las gracias por acá, no todos somos buena onda."
            ];
            return thanks[Math.floor(Math.random() * thanks.length)];
        }

        // Despedidas
        if (msg.includes('chau') || msg.includes('bye') || msg.includes('me voy') || msg.includes('adios') || msg.includes('adiós') || msg.includes('nos vemos') || msg.includes('me fui') || msg.includes('hasta luego') || msg.includes('me desconecto') || msg.includes('salgo')) {
            stateAI.lastTopic = 'farewell';
            const farewells = [
                "chau, Anon. borrá los logs antes de irte.",
                "nos vemos. cierra la sesión con el comando 'logout' en la terminal para no dejar rastros.",
                "adiós. recuerda activar el escudo del antivirus antes de desconectarte.",
                "ok, suerte ahí afuera. la surface web es más aburrida pero más segura xd.",
                "dale, cuidate. y no te olvides de limpiar la caché del navegador NightLink."
            ];
            return farewells[Math.floor(Math.random() * farewells.length)];
        }

        // Preguntas existenciales / sobre la IA
        if (msg.includes('eres bot') || msg.includes('sos bot') || msg.includes('eres real') || msg.includes('sos real') || msg.includes('eres humano') || msg.includes('sos humano') || msg.includes('eres una ia') || msg.includes('inteligencia artificial') || msg.includes('eres una maquina') || msg.includes('eres robot') || msg.includes('sos una ia')) {
            stateAI.lastTopic = 'identity_ai';
            const aiResponses = [
                "¿bot? soy tan real como vos, Anon. en la deep web todos somos anónimos, no preguntes de más.",
                "jajaj ¿bot? si fuera un bot no tendría esta ortografía horrible. soy carne y hueso detrás de 7 proxies.",
                "no soy un bot. soy un hacker freelance que se aburre y viene al IRC a charlar. ¿y vos?",
                "la verdadera pregunta es: ¿vos sos real? porque hay muchos bots honeypot del FBI en estos canales.",
                "¿importa? lo que importa es q no reveles tu IP real. bot o humano, eso no cambia."
            ];
            return aiResponses[Math.floor(Math.random() * aiResponses.length)];
        }

        // Insultos / Trolleo
        if (msg.includes('tonto') || msg.includes('idiota') || msg.includes('estupido') || msg.includes('estúpido') || msg.includes('pelotudo') || msg.includes('boludo') || msg.includes('imbecil') || msg.includes('imbécil') || msg.includes('basura') || msg.includes('inutil') || msg.includes('inútil') || msg.includes('bobo') || msg.includes('tarado') || msg.includes('mierda') || msg.includes('puto') || msg.includes('pendejo') || msg.includes('gil') || msg.includes('nabo') || msg.includes('mogolico') || msg.includes('mogólico') || msg.includes('retrasado')) {
            stateAI.lastTopic = 'insult';
            const insultResponses = [
                "jajaj re ardido. cuidado con lo que decís, tengo tu IP en mis logs.",
                "tranquilo, Anon. ese tipo de actitud te pone en la lista de doxxeo del foro xd.",
                "wow, qué agresivo. ¿te hackearon la wallet o qué te pasó?",
                "uhhh, alguien se levantó de mal humor. tomate un café y volvé cuando estés más tranquilo.",
                "sí, sí, muy duro. pero a ver si sos tan malo como para hackear un nodo sin el exploit pack.",
                "ban incoming en 3... 2... jk, acá no hay mods. pero cuidá esa boquita xd."
            ];
            return insultResponses[Math.floor(Math.random() * insultResponses.length)];
        }

        // ¿Qué hago? / Aburrimiento / Sin rumbo
        if (msg.includes('que hago') || msg.includes('qué hago') || msg.includes('aburrido') || msg.includes('aburrida') || msg.includes('me aburro') || msg.includes('no se que hacer') || msg.includes('no sé qué hacer') || msg.includes('que puedo hacer') || msg.includes('qué puedo hacer') || msg.includes('alguna idea') || msg.includes('sugerencia') || msg.includes('que recomiendas') || msg.includes('qué recomiendas')) {
            stateAI.lastTopic = 'bored';
            const tips = [
                "¿aburrido? probá a hackear nodos con 'hack <nodo_id>' en la Terminal. ganas BTC y algo de adrenalina.",
                "buscá 'redroom' o 'leaks' en Torch. hay páginas bastante interesantes en la base de datos.",
                "podrías explorar el mercado negro. buscá 'mercado' en Torch y comprate alguna mejora.",
                "si ya tenés BTC, comprate la VPN o el Exploit Pack. te cambian el gameplay por completo.",
                "hacé un 'scan' en la Terminal para descubrir IPs vulnerables y después hackeá los nodos.",
                "leé el blog de leaks, hay info filtrada. o entrá a un foro y comentá algo a ver qué te responden."
            ];
            return tips[Math.floor(Math.random() * tips.length)];
        }

        // Preguntas sobre el juego / ¿Qué es esto?
        if (msg.includes('que es esto') || msg.includes('qué es esto') || msg.includes('como juego') || msg.includes('cómo juego') || msg.includes('como funciona') || msg.includes('cómo funciona') || msg.includes('donde estoy') || msg.includes('dónde estoy') || msg.includes('como se juega') || msg.includes('cómo se juega') || msg.includes('que juego es') || msg.includes('qué juego es')) {
            stateAI.lastTopic = 'game_help';
            const gameHelp = [
                "estás en la red A.N.N., una simulación de la deep web. usá el navegador NightLink para explorar y la Terminal para hackear.",
                "esto es DarkOS, un sistema operativo de hacking. explorá la deep web, hackeá nodos, ganá BTC y comprá mejoras en los mercados.",
                "básicamente: navegás con NightLink, hackeás con la Terminal (comandos: scan, hack, exploit), ganás BTC y sobrevivís a las intrusiones.",
                "el objetivo es explorar la deep web, conseguir BTC, mejorar tu setup (VPN, PGP, Exploit Pack) y no morir en el intento xd."
            ];
            return gameHelp[Math.floor(Math.random() * gameHelp.length)];
        }

        // Deep Web / Dark Web / Darknet
        if (msg.includes('deep web') || msg.includes('dark web') || msg.includes('darknet') || msg.includes('dark net') || msg.includes('internet profundo') || msg.includes('onion') || msg.includes('tor ')) {
            stateAI.lastTopic = 'deepweb';
            const dwResponses = [
                "la deep web es el 96% del internet que los buscadores normales no indexan. acá en la red A.N.N tenemos nuestros propios servidores.",
                "dark web, deep web, darknet... todo el mismo concepto. contenido no indexado, servidores ocultos, transacciones anónimas en crypto.",
                "la red A.N.N usa enrutamiento en cascada similar a Tor pero con cifrado AES-256. es imposible rastrear los nodos de salida.",
                "si querés navegar seguro por la deep web, asegurate de tener VPN activa y el escudo del antivirus encendido."
            ];
            return dwResponses[Math.floor(Math.random() * dwResponses.length)];
        }

        // Miedo / Susto / Horror / Paranoia
        if (msg.includes('miedo') || msg.includes('susto') || msg.includes('terror') || msg.includes('asusta') || msg.includes('creepy') || msg.includes('paranoia') || msg.includes('paranoico') || msg.includes('escalofrio') || msg.includes('escalofr') || msg.includes('perturbador') || msg.includes('turbio') || msg.includes('siniestro')) {
            stateAI.lastTopic = 'fear';
            const fearResponses = [
                "bienvenido a la deep web. si no te da un poco de miedo, no estás prestando atención.",
                "lo turbio es real acá. los sonidos de respiración y pasos cerca de tu terminal significan q alguien te está rastreando.",
                "consejo: si escuchás ruidos raros, apagá la pantalla con el botón rojo inmediatamente. te puede salvar.",
                "la paranoia es tu mejor aliado en la deep web. nunca te confíes, siempre chequeá tus protecciones.",
                "jajaj relax, es normal sentir eso la primera vez. pero mantené el antivirus encendido por las dudas."
            ];
            return fearResponses[Math.floor(Math.random() * fearResponses.length)];
        }

        // Acuerdo / Afirmación simple
        if (msg === 'si' || msg === 'sí' || msg === 'ok' || msg === 'dale' || msg === 'claro' || msg === 'obvio' || msg === 'ya' || msg === 'sep' || msg === 'seh' || msg === 'va' || msg === 'bien' || msg === 'bueno' || msg === 'okey' || msg === 'oka') {
            const agreements = [
                "bien. si necesitás algo más, preguntá nomás.",
                "dale. ¿tenés algún objetivo en mente o solo estás explorando?",
                "ok. mantené los ojos abiertos por si sale alguna tarea con recompensa en BTC.",
                "perfecto. recordá que siempre podés usar 'scan' en la terminal para descubrir nuevos nodos."
            ];
            return agreements[Math.floor(Math.random() * agreements.length)];
        }

        // Negación simple
        if (msg === 'no' || msg === 'nah' || msg === 'nel' || msg === 'nope' || msg === 'para nada' || msg === 'ni') {
            const negations = [
                "bueno, como quieras. pero si cambias de opinión acá estamos.",
                "ok, sin presión. explorá a tu ritmo.",
                "nah tampoco yo xd. pero algún día vas a necesitar esos exploits.",
                "entendido. igual te recomiendo echarle un ojo a los mercados de Torch."
            ];
            return negations[Math.floor(Math.random() * negations.length)];
        }

        // Mensajes muy cortos (1-2 caracteres sin sentido)
        if (msg.length <= 2) {
            const shortMsgs = [
                "¿? no te escuché bien, Anon. ¿podés repetir?",
                "hmm... ¿eso fue un error de teclado o un mensaje cifrado? xd",
                "necesito más contexto, Anon. ¿qué necesitás?",
                "mensaje demasiado corto. ¿estás testeando el canal?"
            ];
            return shortMsgs[Math.floor(Math.random() * shortMsgs.length)];
        }

        // Preguntas con "?" al final
        if (msg.endsWith('?') && msg.length > 5) {
            // Si no matcheó ninguna categoría anterior pero es una pregunta
            const questionFallbacks = [
                "buena pregunta. la verdad, no tengo la data exacta pero podrías buscar en Torch o en los foros.",
                "hmm, no estoy seguro. probá preguntando en el canal principal o buscá en los blogs de leaks.",
                "eso habría q investigarlo. usá 'scan' en la Terminal y fijate si encontrás algún nodo con esa info.",
                "ni idea la verdad. pero si alguien acá sabe, seguro te contesta en un rato.",
                "buena pregunta, pero yo me dedicaría a juntar BTC y mejorar tus herramientas antes de preocuparte por eso."
            ];
            return questionFallbacks[Math.floor(Math.random() * questionFallbacks.length)];
        }

        // 4. --- SISTEMA HEURÍSTICO NLP AVANZADO (ECO Y CONTEXTUALIZACIÓN DE CUALQUIER TEMA) ---
        // Filtramos palabras vacías (stop words) para extraer conceptos del usuario
        const stopWords = [
            'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'al', 'y', 'o', 'pero', 'mas',
            'para', 'por', 'con', 'sin', 'en', 'sobre', 'tras', 'que', 'qué', 'como', 'cómo', 'donde', 'dónde',
            'tu', 'tus', 'su', 'sus', 'mi', 'mis', 'me', 'te', 'se', 'nos', 'lo', 'le', 'les', 'yo', 'tu', 'él',
            'ella', 'nosotros', 'ellos', 'ellas', 'esta', 'este', 'esto', 'estas', 'estos', 'es', 'son', 'un',
            'esos', 'esas', 'aquel', 'aquello', 'quiero', 'necesito', 'puedo', 'hacer', 'puedes', 'queres',
            'tengo', 'hay', 'como', 'hace', 'hacen', 'esta', 'este', 'gusta', 'gusta', 'odio', 'amor', 'saber',
            'ese', 'esa', 'algo', 'nada', 'todo', 'cada', 'otro', 'otra', 'otros', 'otras', 'mismo', 'misma',
            'asi', 'así', 'bien', 'mal', 'muy', 'más', 'menos', 'mucho', 'poco', 'tanto', 'tan', 'aquí', 'ahi',
            'ahí', 'alla', 'allá', 'cuando', 'cuándo', 'porque', 'siempre', 'nunca', 'también', 'tampoco'
        ];

        // Extraer palabras significativas
        const words = msg.replace(/[¿?¡!.,:;()\-]/g, "").split(/\s+/);
        const keywords = words.filter(w => w.length > 2 && !stopWords.includes(w));

        if (keywords.length > 0) {
            // Guardamos la última palabra significativa como tema
            stateAI.lastTopic = keywords[0];

            // Seleccionar 1 o 2 palabras para el eco
            const kw1 = keywords[0];
            const kw2 = keywords[1] || "";

            const templates = [
                `interesante eso de "${kw1}". no es un tema que se hable mucho por acá, pero seguro hay algo en los foros de la deep web.`,
                `"${kw1}"... ${kw2 ? `"${kw2}"...` : ""} hmm, no estoy seguro de qué quieras decir. pero si buscás en Torch capaz encontrás algo relacionado.`,
                `ojo con andar hablando de "${kw1}" en canales abiertos. los sniffers capturan palabras clave y las envían a los admins.`,
                `sobre "${kw1}"... he visto gente preguntando lo mismo en los foros. podrías buscar ahí para más info.`,
                `"${kw1}" me suena. ${kw2 ? `y "${kw2}" también.` : ""} pero mejor hablemos por PGP si es algo delicado.`,
                `no sé mucho sobre "${kw1}" la verdad. ¿probaste buscándolo en Torch? hay más de 100 sitios en la base de datos.`,
                `jaja me encanta cuando alguien viene y tira "${kw1}" así como si nada. cuidá tu OPSEC, Anon.`
            ];

            return templates[Math.floor(Math.random() * templates.length)];
        }

        // 5. RESPUESTAS GENÉRICAS (POOL DE RESPUESTAS HACKER EN CASO DE MENSAJES DE 1 O 2 PALABRAS VACÍAS)
        const hackerResponses = [
            "totalmente, la descentralización de la red A.N.N es lo único q nos queda.",
            "che, no confíen en nadie. en este canal hay infiltrados, seguro.",
            "esperando q liberen el nuevo dump de datos del gobierno. se va a pudrir todo xd.",
            "el ping está re alto hoy. ¿será q el ISP nos está aplicando traffic shaping?",
            "¿quién está para armar una botnet cooperativa y tumbar SilkSale? lol",
            "OPSEC primero amigos. si revelan su IP real están re fritos.",
            "ayer vi una Red Room activa por unos minutos... re turbio todo xd.",
            "Monero manda. BTC ya está re vigilado por las agencias forenses.",
            "no bajen archivos del repositorio sin auditar el código fuente, vienen con regalito.",
            "la terminal es tu mejor herramienta. usa 'decrypt' y 'exploit' para dominar el mapa.",
            "si escuchas ruidos estáticos en los auriculares, apaga el monitor y quédate pillo.",
            "jaja, vi a otro novato doxxeado en el foro principal. qué n00b.",
            "¿quién vende un hosting bulletproof decente? pago en XMR.",
            "la red está tensa hoy. siento q se viene una ola de escaneos masivos.",
            "pásate por el blog de leaks, hay info fresca de las finanzas corporativas.",
            "¿alguien tiene credenciales SSH limpias? las mías ya expiraron.",
            "aseguren sus nodos. mantengan el escudo del antivirus encendido.",
            "acabo de interceptar un paquete sospechoso en el puerto 443. ¿alguien más lo vio?",
            "la última actualización del mercado SilkSale trajo items nuevos. échenle un ojo.",
            "pregunta seria: ¿alguien acá ha conseguido más de 1 BTC en un solo día? porque yo ni cerca.",
            "recomendación del día: nunca uses la misma contraseña en dos sitios de la dark web.",
            "un amigo perdió 0.8 BTC por no usar el mezclador de Shadow Exchange. no sean como él.",
            "ojo que hay un honeypot nuevo en la red. los federales se están poniendo creativos.",
            "si van a postear en los foros, usen un alias diferente al del chat. OPSEC básica.",
            "el overclock vale cada centavo. los escaneos de antivirus pasan de 5s a 2s. un golazo.",
            "dato random: el 70% de los sitios en Torch se caen y vuelven cada 24 horas. así funciona la deep web.",
            "alguien debería escribir un tutorial de cómo usar PGP. hay mucha gente perdida xd.",
            "me pregunto cuántos de los que estamos acá son agentes encubiertos... bueno, todos somos anónimos al final.",
            "la regla de oro: si algo parece demasiado bueno para ser verdad en la deep web, probablemente es una trampa.",
            "¿ya descargaron el diario del hacker? es lo mejor que hay en el sistema de archivos local."
        ];
        return hackerResponses[Math.floor(Math.random() * hackerResponses.length)];
    } else {
        // --- RESPUESTAS ASISTENTE WINHELLO (AI CONVERSATIONAL GUIDE) ---
        if (msg.includes('hack') || msg.includes('nodo') || msg.includes('ataque') || msg.includes('terminal')) {
            return "Para hackear, puedes usar el comando 'hack <nodo_id>' en la Terminal para lanzar una intrusión manual con minijuegos. Si compras el 'exploit_pack.pkg' en el Mercado por 0.40 BTC, tendrás acceso al comando 'exploit <nodo_id>' que automatiza el proceso de inmediato.";
        }
        if (msg.includes('vpn') || msg.includes('rastreo') || msg.includes('ip') || msg.includes('seguridad')) {
            return "Un OPSEC limpio requiere enrutamiento seguro. Consigue 'vpn_phantom.ovpn' en algún mercado oscuro por 0.20 BTC. Esto reducirá a la mitad las comprobaciones de intrusiones de red y evitará que rastreen tu IP física.";
        }
        if (msg.includes('antivirus') || msg.includes('escudo') || msg.includes('escaneo') || msg.includes('analisis')) {
            return "El antivirus es tu única línea de defensa contra intrusiones lógicas. Si te infectas, realiza un 'Escaneo Completo'. Con la mejora 'overclock.inf' (0.25 BTC), el escaneo de CPU tardará solo 2 segundos en lugar de 5.";
        }
        if (msg.includes('btc') || msg.includes('bitcoin') || msg.includes('dinero') || msg.includes('billetera') || msg.includes('wallet')) {
            return "El BTC es la moneda oficial en Phantom. Escribe 'wallet' en la Terminal para ver tu balance. Consigue BTC resolviendo los pedidos de enlaces en DarkChat o hackeando nodos remotos en la red.";
        }
        if (msg.includes('camara') || msg.includes('webcam') || msg.includes('foto') || msg.includes('dox')) {
            return "Advertencia: El atacante puede secuestrar la señal del driver 'driver_webcam.sys' para tomarte fotos y publicarlas en el Foro. Apaga el monitor (botón rojo) si notas pisadas o respiración simulada.";
        }
        if (msg.includes('pgp') || msg.includes('clave') || msg.includes('descifrar') || msg.includes('cifrado')) {
            return "Hay archivos confidenciales como 'diario_hacker.pgp' en tu sistema. Adquiere el 'kit_pgp.key' por 0.15 BTC en la tienda profunda y ejecuta 'decrypt diario_hacker.pgp' para descifrar sus secretos.";
        }
        if (msg.includes('ayuda') || msg.includes('como') || msg.includes('tutorial') || msg.includes('guia')) {
            return "Soy tu Guía de Red Avanzada. Para empezar, asegúrate de activar el Escudo del Antivirus. Luego puedes usar el comando 'scan' en la consola para buscar nuevos servidores de la Deep Web en NightLink.";
        }
        
        const generalResponses = [
            "El protocolo A.N.N de Phantom enruta tu tráfico por múltiples saltos encriptados. Ninguna agencia puede rastrearnos aquí.",
            "Recuerda revisar la papelera de reciclaje: allí guardamos las descargas de datos sensibles y logs filtrados.",
            "Si escuchas respiraciones o ruidos de pisadas muy cerca, alguien ha burlado tu cortafuegos. ¡Apaga la pantalla en el botón rojo YA!",
            "Los mercados oscuros son la mayor red de Phantom. Compra las herramientas avanzadas allí antes de que cierren los nodos.",
            "Las firmas PGP aseguran que los volcados de código gubernamental sean auténticos. No ejecutes nada sin verificar."
        ];
        return generalResponses[Math.floor(Math.random() * generalResponses.length)];
    }
}

// --- MECÁNICA DE SUPERVIVENCIA ---
let prolongedLockSeconds = 0;
let prolongedLockWarned = false;
let prolongedLockInterval = null;

function initProlongedLockWatcher() {
    if (prolongedLockInterval) clearInterval(prolongedLockInterval);
    prolongedLockInterval = setInterval(() => {
        if (!state.freeRoam || state.doorBroken) return;

        if (state.doorLocked) {
            prolongedLockSeconds += 1;

            // A los 18 segundos: Advertencia de picaporte sacudiéndose violentamente
            if (prolongedLockSeconds >= 18 && !prolongedLockWarned) {
                prolongedLockWarned = true;
                const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;
                if (typeof playDoorRattleSound === 'function') playDoorRattleSound();
                if (window.RoomInteractions && typeof window.RoomInteractions.showNotificationPrompt === 'function') {
                    window.RoomInteractions.showNotificationPrompt(tFn("prompt_doorknob_shake", "⚠ [ EL PICAPORTE TIEMBLA CON FUERZA... ALGUIEN FORCEJEA AFUERA ]"));
                }
                const audioCaption = document.getElementById('audio-caption');
                if (audioCaption) {
                    audioCaption.innerText = tFn("audio_caption_doorknob_shake", "[ ¡El picaporte de la puerta se sacude con violencia! ]");
                    audioCaption.style.color = "#ffaa00";
                    audioCaption.classList.remove('hidden');
                    setTimeout(() => { if (audioCaption) audioCaption.classList.add('hidden'); }, 3500);
                }
            }

            // A los 28 segundos: ¡LA ENTIDAD DERRIBA LA PUERTA Y TE MATA CON EL SCREAMER!
            if (prolongedLockSeconds >= 28) {
                triggerDoorBustDownScreamer();
            }
        } else {
            // Se desbloqueó la puerta: reiniciar contador
            prolongedLockSeconds = 0;
            prolongedLockWarned = false;
        }
    }, 1000);
}

function onDoorLockChanged(isLocked) {
    if (!isLocked) {
        prolongedLockSeconds = 0;
        prolongedLockWarned = false;
    }
}
window.onDoorLockChanged = onDoorLockChanged;

function triggerDoorBustDownScreamer() {
    if (state.doorBroken) return;
    state.doorBroken = true;
    state.doorKnockActive = false;
    clearTimeout(doorThreatTimer);
    doorThreatTimer = null;

    if (typeof stopDoorKnockSequence === 'function') stopDoorKnockSequence();
    if (typeof stopThreatSound === 'function') stopThreatSound();

    // Reproducir caída demoledora de la puerta y screamer ensordecedor
    if (typeof playDoorCrashDownSound === 'function') playDoorCrashDownSound();
    if (typeof playScreamerAudio === 'function') playScreamerAudio();

    // Tumbar la puerta en 3D
    state.doorOpen = true;
    state.doorLocked = false;
    hidePS1ThreatBanner();
    hidePCThreatBanner();

    const screamerEl = document.getElementById('entity-screamer');
    if (screamerEl) {
        screamerEl.classList.remove('hidden');
    }

    const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;
    setTimeout(() => {
        if (screamerEl) screamerEl.classList.add('hidden');
        gameOver(tFn("gameover_screamer_door", "DEJASTE LA PUERTA CON PESTILLO DEMASIADO TIEMPO. LA ENTIDAD SE ENFURECIÓ, DERRIBÓ LA PUERTA Y TE ATRAPÓ."));
    }, 1900);
}

function startSurvivalLoop(prob = 0.35) {
    if (state.threatTimerInterval) clearInterval(state.threatTimerInterval);
    
    const hackerTextEl = document.getElementById('hacker-text');
    if (hackerTextEl) {
        const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;
        if (state.freeRoam) {
            hackerTextEl.innerText = tFn("threat_hacker_freeroam", "> Red A.N.N Activa...\n> Monitoreando tráfico entrante...\n> Protocolos de anonimato al 100%.\n\n(Mantente alerta a posibles intrusiones externas)");
        } else {
            hackerTextEl.innerText = tFn("threat_hacker_story", "> Monitoreando red local...\n> Bloqueando conexiones entrantes...\n> Inicializando consola de comandos para purgar el sistema...\n\n(Sobrevive mientras tratas de recuperar el control)");
        }
        hackerTextEl.style.color = "var(--text-color)";
    }
    
    state.threatTimerInterval = setInterval(() => {
        // En modo libre, SOLO disparar amenazas de respiración/pisadas si la PC está infectada (minijuego de hackeo activo)
        if (state.freeRoam && !state.isMinigameActive) return;

        let currentProb = prob;
        if (state.isMinigameActive) {
            currentProb = Math.max(prob, 0.45);
        } else {
            if (state.antivirusShield) {
                currentProb *= 0.15;
            }
            if (state.upgrades && state.upgrades.vpn) {
                currentProb *= 0.50;
            }
        }
        if (!state.threatActive && !state.doorKnockActive && !state.isDialogueActive && Math.random() < currentProb) {
            triggerThreat();
        }
    }, 4500);

    // Loop aleatorio para eventos de golpes en la puerta de la entidad oscura (EXCLUSIVO DE MODO LIBRE)
    if (doorKnockLoopInterval) clearInterval(doorKnockLoopInterval);
    if (state.freeRoam) {
        initProlongedLockWatcher();
        doorKnockLoopInterval = setInterval(() => {
            if (!state.freeRoam || state.isMinigameActive || state.doorKnockActive || state.threatActive || state.isDialogueActive) return;
            
            // Probabilidad aleatoria reducida (~10% cada 40 segundos para que aparezca de vez en cuando y no constantemente)
            if (Math.random() < 0.10) {
                triggerDoorKnockThreat();
            }
        }, 40000);
    }
}

// --- SISTEMA DE GOLPES EN LA PUERTA Y SCREAMER DE LA ENTIDAD ---
let doorThreatTimer = null;
let doorKnockLoopInterval = null;

function showPS1ThreatBanner(msg, isSuccess = false, autoHideMs = 0) {
    const banner = document.getElementById('ps1-alert-banner');
    if (!banner) return;
    banner.innerText = msg;
    banner.className = isSuccess ? 'success' : '';
    banner.classList.remove('hidden');
    if (autoHideMs > 0) {
        setTimeout(() => {
            if (banner.innerText === msg) {
                banner.classList.add('hidden');
            }
        }, autoHideMs);
    }
}

function hidePS1ThreatBanner() {
    const banner = document.getElementById('ps1-alert-banner');
    if (banner) {
        banner.classList.add('hidden');
    }
}

function showPCThreatBanner(msg, isSuccess = false, autoHideMs = 0, showLockBtn = true) {
    const banner = document.getElementById('pc-threat-banner');
    const textEl = document.getElementById('pc-threat-text');
    const lockBtn = document.getElementById('btn-pc-quick-lock');
    if (!banner) return;
    
    if (textEl) textEl.innerText = msg;
    banner.className = `pc-threat-banner ${isSuccess ? 'success' : ''}`;
    banner.classList.remove('hidden');
    
    if (lockBtn) {
        lockBtn.style.display = (showLockBtn && !isSuccess) ? 'inline-block' : 'none';
        lockBtn.onclick = () => {
            if (window.RoomInteractions && typeof window.RoomInteractions.toggleDoorLock === 'function') {
                window.RoomInteractions.toggleDoorLock();
            }
        };
    }
    
    if (autoHideMs > 0) {
        setTimeout(() => {
            if (textEl && textEl.innerText === msg) {
                banner.classList.add('hidden');
            }
        }, autoHideMs);
    }
}

function hidePCThreatBanner() {
    const banner = document.getElementById('pc-threat-banner');
    if (banner) {
        banner.classList.add('hidden');
    }
}

function triggerDoorKnockThreat() {
    // Los golpes en la puerta y el screamer de puerta son EXCLUSIVOS del modo libre
    if (!state.freeRoam) return;
    if (state.doorKnockActive || state.isMinigameActive || state.isDialogueActive) return;
    
    state.doorKnockActive = true;
    state.catState = 'scared';
    
    // Iniciar ráfagas de golpes violentos en la puerta
    if (typeof playDoorKnockSequence === 'function') {
        playDoorKnockSequence();
    }

    const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;

    // Mostrar AVISO VISUAL PROMINENTE en 3D HUD y dentro de la pantalla de la PC
    showPS1ThreatBanner(tFn("threat_door_banner_3d", "⚠ ¡ALGUIEN GOLPEA LA PUERTA CON FUERZA! — APRIETA 'L' PARA TRABAR EL PESTILLO 🔒"));
    showPCThreatBanner(tFn("threat_door_banner_pc", "⚠ ¡ALERTA DE SEGURIDAD! ¡ALGUIEN GOLPEA LA PUERTA CON FUERZA! — APRIETA 'L' PARA TRABAR EL PESTILLO 🔒"), false, 0, true);

    if (typeof showWinHelloBubble === 'function') {
        showWinHelloBubble(tFn("threat_winhello_door", "⚠ ¡ALERTA! ¡Están golpeando la puerta con fuerza! Traba el pestillo con 'L'."), 5500, 'panic');
    }

    const audioCaption = document.getElementById('audio-caption');
    if (audioCaption && !document.getElementById('screen-ps1-intro')?.classList.contains('active')) {
        audioCaption.innerText = tFn("audio_caption_door", "[ ¡GOLPES VIOLENTOS EN LA PUERTA! TRÁBALA CON LA TECLA 'L' ]");
        audioCaption.style.color = "var(--danger-color)";
        audioCaption.classList.remove('hidden');
    }

    // Si la puerta YA estaba trabada con pestillo, forcejea un instante y se va
    if (state.doorLocked) {
        clearTimeout(doorThreatTimer);
        doorThreatTimer = setTimeout(() => {
            if (state.doorKnockActive) {
                resolveDoorKnockSuccess();
            }
        }, 2200);
        return;
    }

    // Tiempo de reacción para trabar con L (5.5 segundos)
    clearTimeout(doorThreatTimer);
    doorThreatTimer = setTimeout(() => {
        if (state.doorKnockActive) {
            if (state.doorLocked) {
                // Bloqueada a tiempo: salva la vida
                resolveDoorKnockSuccess();
            } else {
                // No se trabó a tiempo -> Derriba la puerta y Screamer aterrador con Game Over!
                triggerDarkEntityScreamer();
            }
        }
    }, 5500);
}

function resolveDoorKnockSuccess() {
    if (!state.doorKnockActive) return;
    
    clearTimeout(doorThreatTimer);
    doorThreatTimer = null;
    state.doorKnockActive = false;
    state.doorLocked = true;
    
    if (typeof stopDoorKnockSequence === 'function') {
        stopDoorKnockSequence();
    }
    
    // Sonido de pasos alejándose por el pasillo
    if (typeof playFootstepsAwaySound === 'function') {
        playFootstepsAwaySound();
    }

    const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;

    // Mostrar confirmación visual de salvada en el banner 3D y en la PC
    showPS1ThreatBanner(tFn("threat_door_saved_3d", "✓ ¡PESTILLO TRABADO A TIEMPO! — La entidad no pudo entrar y huye por el pasillo."), true, 4000);
    showPCThreatBanner(tFn("threat_door_saved_pc", "✓ ¡PESTILLO TRABADO A TIEMPO! — La entidad no pudo entrar y los pasos se alejan."), true, 4000, false);

    const audioCaption = document.getElementById('audio-caption');
    if (audioCaption) {
        audioCaption.innerText = tFn("audio_caption_saved", "[ ...Los pasos se alejan por el pasillo. La entidad no pudo entrar. ]");
        audioCaption.style.color = "#00ff66";
        setTimeout(() => {
            if (audioCaption) {
                audioCaption.classList.add('hidden');
                audioCaption.style.color = "white";
            }
        }, 4000);
    }
}

function triggerDarkEntityScreamer() {
    state.doorKnockActive = false;
    clearTimeout(doorThreatTimer);
    doorThreatTimer = null;
    hidePS1ThreatBanner();
    hidePCThreatBanner();
    
    if (typeof stopDoorKnockSequence === 'function') stopDoorKnockSequence();
    if (typeof stopThreatSound === 'function') stopThreatSound();

    // Abrir la puerta de golpe en 3D
    state.doorOpen = true;
    state.doorLocked = false;
    if (window.RoomInteractions && typeof window.RoomInteractions.playDoorSqueak === 'function') {
        window.RoomInteractions.playDoorSqueak(true);
    }

    // Reproducir audio aterrador ensordecedor del screamer
    if (typeof playScreamerAudio === 'function') {
        playScreamerAudio();
    }

    // Mostrar el overlay del screamer
    const screamerEl = document.getElementById('entity-screamer');
    if (screamerEl) {
        screamerEl.classList.remove('hidden');
    }

    // Tras 1.8 segundos de screamer -> Game Over definitivo para reiniciar la partida
    setTimeout(() => {
        if (screamerEl) screamerEl.classList.add('hidden');
        const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;
        gameOver(tFn("gameover_door_screamer", "LA ENTIDAD OSCURA DERRIBÓ LA PUERTA Y ENTRÓ A TU HABITACIÓN. DEBISTE TRABAR EL PESTILLO APRETANDO LA TECLA 'L'."));
    }, 1800);
}

function triggerThreat() {
    // En modo libre, solo si la PC está infectada (minijuego de hackeo activo)
    if (state.freeRoam && !state.isMinigameActive) return;

    state.threatActive = true;
    
    // El gato se asusta durante el ataque
    state.catState = 'scared';

    // Aumentar vulnerabilidad si la ventana o la puerta están abiertas
    let openRisk = 0;
    if (state.windowOpen) openRisk += 0.2;
    if (state.doorOpen) openRisk += 0.25;

    let probability = (state.freeRoam && !state.isMinigameActive) ? 0.35 : (state.currentQuest >= 5 ? 0.5 : 0.25) + openRisk;
    const isBreathing = state.isMinigameActive ? true : (Math.random() < probability);
    const audioCaption = document.getElementById('audio-caption');
    const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;

    if (isBreathing) {
        if (audioCaption) {
            audioCaption.innerText = tFn("audio_caption_breathing", "[ Sonido de respiración pesada cerca... ]");
            audioCaption.classList.remove('hidden');
        }
        
        // Asegurar que el botón de apagar pantalla esté visible durante la amenaza
        const survivalUI = document.getElementById('survival-ui');
        if (survivalUI) survivalUI.classList.remove('hidden');
        
        if (typeof startThreatSound === 'function') startThreatSound();

        // Tiempo límite para apagar pantalla (más corto si la ventana o puerta están abiertas)
        const reactionTime = (state.windowOpen || state.doorOpen) ? 3000 : 4000;
        state.threatTimer = setTimeout(() => {
            if (typeof realAudioBreathing !== 'undefined') realAudioBreathing.pause();
            if (typeof stopThreatSound === 'function') stopThreatSound();
            if (audioCaption) audioCaption.classList.add('hidden');
            
            if (!state.screenOff) {
                if (state.freeRoam) {
                    state.threatActive = false;
                    if (typeof updateWallet === 'function') {
                        updateWallet(-0.1);
                    }
                    if (typeof playGlitchSound === 'function') playGlitchSound();

                    const container = document.getElementById('monitor-container') || document.getElementById('game-container');
                    if (container) {
                        container.classList.add('glitch-scare');
                        setTimeout(() => {
                            container.classList.remove('glitch-scare');
                        }, 1500);
                    }

                    if (audioCaption) {
                        audioCaption.innerText = tFn("audio_caption_compromised", "[ ¡COMPROMETIDO! El intruso te vio. Penalización de ₿ 0.100 BTC ]");
                        audioCaption.style.color = "red";
                        audioCaption.classList.remove('hidden');
                        setTimeout(() => {
                            audioCaption.classList.add('hidden');
                            audioCaption.style.color = "white";
                        }, 4000);
                    }
                    if (typeof showWinHelloBubble === 'function') {
                        showWinHelloBubble(tFn("winhello_threat_compromised", "✗ ¡INTRUSO DETECTADO! Te vio con la pantalla encendida. Se ha aplicado una multa de ₿ 0.100 BTC."), 10000, 'panic');
                    }
                    if (!state.isMinigameActive) {
                        const sui = document.getElementById('survival-ui');
                        if (sui) sui.classList.add('hidden');
                    }
                } else {
                    gameOver(tFn("gameover_monitor_light", "El intruso te vio por la luz de tu monitor. Debiste apagar la pantalla al oír su respiración."));
                }
            } else {
                state.threatActive = false;
                
                if (!state.hasEvadedOnce) {
                    state.hasEvadedOnce = true;
                    if (typeof queueDialogues === 'function') {
                        queueDialogues([
                            { name: "player", text: tFn("dialogue_evaded_relief", "Uff... se alejó. Estaba justo detrás de mí.") }
                        ]);
                    }
                }
                if (state.freeRoam) {
                    if (typeof updateWallet === 'function') {
                        updateWallet(0.025);
                    }
                    if (audioCaption) {
                        audioCaption.innerText = tFn("audio_caption_evasion", "[ ¡Evasión exitosa! Recompensa de sigilo: +₿ 0.025 BTC ]");
                        audioCaption.style.color = "#00ff66";
                        audioCaption.classList.remove('hidden');
                        setTimeout(() => {
                            audioCaption.classList.add('hidden');
                            audioCaption.style.color = "white";
                        }, 3000);
                    }
                }
                if (state.freeRoam && !state.isMinigameActive) {
                    const sui = document.getElementById('survival-ui');
                    if (sui) sui.classList.add('hidden');
                }
            }
        }, reactionTime);

    } else {
        if (audioCaption) {
            audioCaption.innerText = tFn("audio_caption_footsteps", "[ Sonido de pisadas... ]");
            audioCaption.style.color = "var(--warning-color)";
            audioCaption.classList.remove('hidden');
        }
        
        if (typeof playSynthesizedFootsteps === 'function') playSynthesizedFootsteps();
        
        state.threatTimer = setTimeout(() => {
            if (audioCaption) {
                audioCaption.classList.add('hidden');
                audioCaption.style.color = "white";
            }
            state.threatActive = false;
        }, 3000);
    }
}

function turnOffScreen() {
    state.screenOff = true;
    const screenBlack = document.getElementById('screen-black');
    const audioCaption = document.getElementById('audio-caption');
    if (screenBlack) {
        const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;
        screenBlack.classList.remove('hidden');
        screenBlack.innerHTML = `<p class="hidden-message">${tFn("threat_screen_off_hint", "PANTALLA APAGADA... Mantente en silencio.")}</p>`;
    }
    if (audioCaption) {
        audioCaption.classList.add('hidden');
        audioCaption.style.zIndex = "1001";
    }
    if (typeof playClickSound === 'function') playClickSound();
}

function turnOnScreen() {
    if (state.screenOff) {
        state.screenOff = false;
        const screenBlack = document.getElementById('screen-black');
        if (screenBlack) screenBlack.classList.add('hidden');
    }
}

function gameOver(reason) {
    state.isMinigameActive = false;
    state.freeRoam = false;
    state.freeRoamInitialized = false;
    state.sandboxTutorialStep = 0;
    state.threatActive = false;
    state.doorKnockActive = false;
    
    // Salir del pointer lock si estaba activo
    if (document.pointerLockElement) {
        try { document.exitPointerLock(); } catch(e) {}
    }

    // Ocultar asistente WinHello y banners de alerta
    const winHello = document.getElementById('winhello-assistant');
    if (winHello) winHello.classList.add('hidden');
    hidePS1ThreatBanner();
    hidePCThreatBanner();
    
    clearTimeout(state.threatTimer);
    clearTimeout(doorThreatTimer);
    if (prolongedLockInterval) clearInterval(prolongedLockInterval);
    clearInterval(threatInterval);
    if (doorKnockLoopInterval) clearInterval(doorKnockLoopInterval);
    if (state.threatTimerInterval) clearInterval(state.threatTimerInterval);
    clearInterval(state.globalTimerInterval);
    if (typeof currentMinigameInterval !== 'undefined') clearInterval(currentMinigameInterval);
    
    if (typeof stopThreatSound === 'function') stopThreatSound();
    if (typeof stopDoorKnockSequence === 'function') stopDoorKnockSequence();
    if (typeof shutdownOpsecHazard === 'function') shutdownOpsecHazard();
    if (typeof realAudioFootsteps !== 'undefined') realAudioFootsteps.pause();
    if (typeof realAudioBreathing !== 'undefined') realAudioBreathing.pause();
    if (typeof mutePCAudio === 'function') mutePCAudio();
    if (typeof playGlitchSound === 'function') playGlitchSound();
    
    // Detener absolutamente todo audio de habitación / autos / tráfico / clima / radio de la escena 3D
    if (window.RoomInteractions) {
        if (typeof window.RoomInteractions.stopAllAmbientAudio === 'function') {
            window.RoomInteractions.stopAllAmbientAudio();
        } else {
            if (typeof window.RoomInteractions.stopRadioAudio === 'function') window.RoomInteractions.stopRadioAudio();
            if (typeof window.RoomInteractions.stopWeatherAudio === 'function') window.RoomInteractions.stopWeatherAudio();
            if (typeof window.RoomInteractions.stopTrafficAudio === 'function') window.RoomInteractions.stopTrafficAudio();
        }
    }

    // Detener y limpiar escena 3D de PS1 de forma permanente
    if (typeof window.cleanupPS1Intro === 'function') {
        window.cleanupPS1Intro();
    }

    const webcamContainer = document.getElementById('webcam-container');
    if (webcamContainer) webcamContainer.classList.add('hidden');
    
    if (state.webcamStream) {
        state.webcamStream.getTracks().forEach(track => track.stop());
        state.webcamStream = null;
        const webcamFeed = document.getElementById('webcam-feed');
        if (webcamFeed) webcamFeed.srcObject = null;
    }
    const chkWebcam = document.getElementById('chk-webcam');
    if (chkWebcam) chkWebcam.checked = false;
    
    document.querySelectorAll('.os-window').forEach(w => w.classList.add('hidden'));
    
    const doxWindow = document.getElementById('window-dox');
    if (doxWindow) doxWindow.classList.add('hidden');
    
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    
    // Ocultar y desactivar la pantalla 3D de PS1
    const ps1Intro = document.getElementById('screen-ps1-intro');
    if (ps1Intro) {
        ps1Intro.classList.add('hidden');
        ps1Intro.classList.remove('active');
    }
    document.body.classList.remove('ps1-monitor-active');

    const survivalUI = document.getElementById('survival-ui');
    if (survivalUI) survivalUI.classList.add('hidden');
    
    // Show game over screen
    const gameoverScreen = document.getElementById('screen-gameover');
    if (gameoverScreen) {
        gameoverScreen.classList.remove('hidden');
        gameoverScreen.classList.add('active');
        gameoverScreen.style.display = 'flex';
    }
    const gameoverReason = document.getElementById('gameover-reason');
    if (gameoverReason) {
        const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;
        gameoverReason.innerHTML = `
            <br><br>
            <span style="color:#aaa; font-size:1rem;">${tFn("gameover_reason_label", "RAZÓN DE LA FALLA:")}</span><br>
            ${reason || (window.getLanguage && window.getLanguage() === 'en' ? "FATAL ERROR." : "ERROR FATAL.")}
            <br><br>
            ${tFn("gameover_system_compromised", "> SISTEMA COMPROMETIDO.<br>> HAZ CLIC EN EL BOTÓN INFERIOR PARA REINICIAR LA PARTIDA.")}
        `;
    }
    
    if (typeof applyTranslations === 'function') {
        applyTranslations();
    }
    
    state.dialogueQueue = [];
    const dialogueBox = document.getElementById('dialogue-box');
    if (dialogueBox) dialogueBox.classList.add('hidden');
}

// Power off monitor mouse and touch events
document.addEventListener('DOMContentLoaded', () => {
    const btnPower = document.getElementById('btn-power');
    if (btnPower) {
        btnPower.addEventListener('mousedown', turnOffScreen);
        btnPower.addEventListener('mouseup', turnOnScreen);
        btnPower.addEventListener('mouseleave', turnOnScreen);
        
        btnPower.addEventListener('touchstart', (e) => { e.preventDefault(); turnOffScreen(); }, {passive: false});
        btnPower.addEventListener('touchend', (e) => { e.preventDefault(); turnOnScreen(); }, {passive: false});
    }

    const chkWebcam = document.getElementById('chk-webcam');
    if (chkWebcam) {
        chkWebcam.addEventListener('change', async () => {
            if (chkWebcam.checked) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    state.webcamStream = stream;
                    const feed = document.getElementById('webcam-feed');
                    if (feed) feed.srcObject = stream;
                } catch (err) {
                    console.error("Error al acceder a la cámara:", err);
                    chkWebcam.checked = false;
                    if (typeof showCustomAlert === 'function') {
                        showCustomAlert("ERROR DE ACCESO", "No se pudo acceder a la cámara web. Asegúrate de otorgar permisos.", "error");
                    }
                }
            } else {
                if (state.webcamStream) {
                    state.webcamStream.getTracks().forEach(track => track.stop());
                    state.webcamStream = null;
                }
                const feed = document.getElementById('webcam-feed');
                if (feed) feed.srcObject = null;
            }
        });
    }
});

function takePhoto() {
    const video = document.getElementById('webcam-feed');
    const canvas = document.getElementById('webcam-capture-canvas');
    if (!video || !canvas || !state.webcamStream) return null;
    
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    try {
        return canvas.toDataURL('image/jpeg');
    } catch (e) {
        console.error("Error taking photo:", e);
        return null;
    }
}

function triggerDoxAlert() {
    const doxWindow = document.getElementById('window-dox');
    const doxPhoto = document.getElementById('dox-photo');
    const doxText = document.getElementById('dox-text');
    if (!doxWindow || !doxPhoto || !doxText || !state.lastCapturedPhoto) return;
    
    doxPhoto.src = state.lastCapturedPhoto;
    
    const doxMessages = [
        "IP LOCALIZADA: 192.168.1.105. Proveedor: Fibertel. Ciudad: Buenos Aires.",
        "DRIVER DE WEBCAM SECUESTRADO. Retransmitiendo señal en vivo...",
        "IMAGEN DE PERFIL OBTENIDA. Inyectando captura de pantalla en Crimson Shadow Forum.",
        "FILTRACIÓN DE IDENTIDAD EN CURSO. Se detectó un rostro en el nodo activo."
    ];
    doxText.innerText = doxMessages[Math.floor(Math.random() * doxMessages.length)];
    
    doxWindow.classList.remove('hidden');
    if (typeof bringToFront === 'function') bringToFront(doxWindow);
    if (typeof addTaskbarTab === 'function') addTaskbarTab('dox', '¡ALERTA!');
    if (typeof playGlitchSound === 'function') playGlitchSound();
}

// Exportar globalmente
window.showCustomAlert = showCustomAlert;
window.startGlobalTimer = startGlobalTimer;
window.triggerHackSequence = triggerHackSequence;
window.startGreatPurge = startGreatPurge;
window.gameWon = gameWon;
window.startFreeRoam = startFreeRoam;
window.getMockAIResponse = getMockAIResponse;
window.startSurvivalLoop = startSurvivalLoop;
window.triggerThreat = triggerThreat;
window.turnOffScreen = turnOffScreen;
window.turnOnScreen = turnOnScreen;
window.gameOver = gameOver;
window.threatInterval = threatInterval;
window.takePhoto = takePhoto;
window.triggerDoxAlert = triggerDoxAlert;
window.triggerDoorKnockThreat = triggerDoorKnockThreat;
window.resolveDoorKnockSuccess = resolveDoorKnockSuccess;
window.triggerDarkEntityScreamer = triggerDarkEntityScreamer;
window.showPCThreatBanner = showPCThreatBanner;
window.hidePCThreatBanner = hidePCThreatBanner;
window.showPS1ThreatBanner = showPS1ThreatBanner;
window.hidePS1ThreatBanner = hidePS1ThreatBanner;

// Listener de teclado global para interactuar con el pestillo (tecla 'L') en cualquier momento durante Modo Libre (en PC o 3D)
window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyL' || e.key === 'l' || e.key === 'L') {
        const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (tag === 'input' || tag === 'textarea' || (document.activeElement && document.activeElement.isContentEditable)) {
            return; // No interceptar si el usuario está escribiendo texto
        }
        if (window.state && window.state.freeRoam) {
            if (window.RoomInteractions && typeof window.RoomInteractions.toggleDoorLock === 'function') {
                window.RoomInteractions.toggleDoorLock();
            }
        }
    }
});
