// ============================================================
// SISTEMA DE MODO HISTORIA — EXPEDIENTE 98 (MODO LIBRE / SANDBOX)
// ============================================================

(function() {
    function tFn(key, fallback) {
        return (typeof window.t === 'function') ? window.t(key, fallback) : fallback;
    }

    function getLang() {
        return (typeof window.getLanguage === 'function') ? window.getLanguage() : 'es';
    }

    // Definición de los 5 Capítulos Narrativos
    const STORY_CHAPTERS = [
        {
            id: 1,
            title: "Capítulo 1: El Contacto Fantasma",
            title_en: "Chapter 1: The Phantom Contact",
            code: "DOC-001/WHISPER",
            summary: "Un misterioso informante '@Specter_98' te ha contactado en DarkChat asegurando que tu PC alberga un volcado de memoria secreto del Proyecto Puppeteer. Encuentra el sitio oculto en Torch y descarga los datos.",
            summary_en: "A mysterious informant '@Specter_98' contacted you on DarkChat claiming your PC contains a secret memory dump of Project Puppeteer. Find the hidden site on Torch and download the data.",
            objectives: [
                { id: "c1_chat", text: "Abre DarkChat y responde al mensaje privado de @Specter_98.", text_en: "Open DarkChat and reply to @Specter_98's private message.", done: false },
                { id: "c1_radio", text: "Enciende la Radio Boombox y sintoniza la estación 'Numbers Station' para escuchar la contraseña de acceso.", text_en: "Turn on the Boombox Radio and tune into 'Numbers Station' to hear the access password.", done: false },
                { id: "c1_torch", text: "Navega en Torch hacia 'http://vault77.ann/' e ingresa la contraseña para descargar 'dump_core.bin'.", text_en: "Browse in Torch to 'http://vault77.ann/' and enter the password to download 'dump_core.bin'.", done: false }
            ],
            clue: "Frecuencia cifrada detectada en el dial de la radio FM del dormitorio. Códigos numéricos de onda corta transmiten contraseñas de la red A.N.N.",
            clue_en: "Encrypted frequency detected on the bedroom FM radio dial. Shortwave numerical codes broadcast A.N.N. network passwords.",
            rewardBTC: 0.05
        },
        {
            id: 2,
            title: "Capítulo 2: Rastreo y Mercado Negro",
            title_en: "Chapter 2: Tracing & Black Market",
            code: "DOC-002/SILK_PGP",
            summary: "El archivo 'dump_core.bin' está protegido por un cifrado RSA asimétrico de 2048 bits. Necesitas conseguir un kit de desencriptado PGP en SilkSale o resolver una auditoría en la Terminal para descifrarlo.",
            summary_en: "The 'dump_core.bin' file is protected by 2048-bit asymmetric RSA encryption. You must obtain a PGP decryption kit on SilkSale or resolve a Terminal audit to decrypt it.",
            objectives: [
                { id: "c2_phone", text: "Atiende el teléfono vintage de la mesita cuando suene para recibir la clave de verificación.", text_en: "Answer the vintage desk phone when it rings to receive the verification key.", done: false },
                { id: "c2_silk", text: "Adquiere el 'kit_pgp.key' en SilkSale (o junta ₿ 0.15 BTC completando comandos en Terminal).", text_en: "Purchase 'kit_pgp.key' on SilkSale (or gather ₿ 0.15 BTC completing Terminal commands).", done: false },
                { id: "c2_decrypt", text: "Ejecuta 'decrypt dump_core.bin' en Terminal Root para extraer las identidades ocultas.", text_en: "Run 'decrypt dump_core.bin' in Terminal Root to extract the hidden identities.", done: false }
            ],
            clue: "El teléfono vintage conectado en la habitación recibe interferencias de la red local del atacante.",
            clue_en: "The vintage phone connected in the room is picking up interference from the attacker's local network.",
            rewardBTC: 0.08
        },
        {
            id: 3,
            title: "Capítulo 3: Contrataque & Aislamiento de Red",
            title_en: "Chapter 3: Counter-Attack & Network Isolation",
            code: "DOC-003/INTRUSION",
            summary: "Al descifrar los datos, el 'Titiritero' (The Puppeteer) detecta la brecha y lanza una intrusión forzada contra tu máquina. Debes aislar los puertos en la Terminal y proteger tu ubicación física.",
            summary_en: "Upon decrypting the data, 'The Puppeteer' detects the breach and launches a forced intrusion against your machine. Isolate ports in the Terminal and secure your physical room.",
            objectives: [
                { id: "c3_lock", text: "Traba el pestillo de la puerta de tu habitación con 'L' antes de que el recolector aproveche la intrusión.", text_en: "Latch your bedroom door with 'L' before the collector breaches your room.", done: false },
                { id: "c3_isolate", text: "Ejecuta 'trace 184.22.9.101' y 'isolate-port 443' en Terminal Root para frenar la infección.", text_en: "Run 'trace 184.22.9.101' and 'isolate-port 443' in Terminal Root to halt the infection.", done: false },
                { id: "c3_antivirus", text: "Activa el Escudo en Tiempo Real en el Antivirus para asegurar el kernel.", text_en: "Activate Real-Time Shield in Antivirus to secure the kernel.", done: false }
            ],
            clue: "La entidad física que acecha el pasillo se activa cuando el sistema operativo sufre picos de telemetría de red.",
            clue_en: "The physical entity stalking the hallway awakens when the operating system suffers network telemetry spikes.",
            rewardBTC: 0.10
        },
        {
            id: 4,
            title: "Capítulo 4: La Frecuencia Oculta y CCTV",
            title_en: "Chapter 4: The Hidden Frequency & CCTV",
            code: "DOC-004/SHADOW_CAM",
            summary: "Los registros revelan que una cámara oculta en el pasillo transmite imágenes de tu propia puerta. Sincroniza la TV CRT de la habitación con el canal de seguridad y rastrea el nodo central.",
            summary_en: "Logs reveal a hidden hallway camera broadcasting footage of your own doorway. Sync the room CRT TV to the security channel and trace the central node.",
            objectives: [
                { id: "c4_tv", text: "Enciende la TV CRT de la habitación y cambia al Canal 7 (CCTV Pasillo) para confirmar la presencia externa.", text_en: "Turn on the CRT TV in the room and switch to Channel 7 (Hallway CCTV) to confirm external presence.", done: false },
                { id: "c4_search", text: "Busca 'puppeteer-project.ann' en Torch e investiga la lista de instalaciones biológicas.", text_en: "Search 'puppeteer-project.ann' on Torch and investigate the biological facility listings.", done: false },
                { id: "c4_exploit", text: "Consigue el 'exploit_pack.pkg' para vulnerar el cortafuegos del servidor central.", text_en: "Acquire 'exploit_pack.pkg' to breach the central server's firewall.", done: false }
            ],
            clue: "El canal 7 de la televisión analógica intercepta transmisiones de circuito cerrado del pasillo.",
            clue_en: "Analog television Channel 7 intercepts closed-circuit transmissions from the hallway.",
            rewardBTC: 0.12
        },
        {
            id: 5,
            title: "Capítulo 5: El Gran Desmantelamiento (Final)",
            title_en: "Chapter 5: The Grand Dismantling (Finale)",
            code: "DOC-005/OMEGA_PURGE",
            summary: "Tienes todas las pruebas. Es momento de ejecutar el script 'purge_master.sh' en la Terminal Root y cargar toda la base de datos a los servidores espejo globales antes de que desconecten tu línea.",
            summary_en: "You have all the evidence. It's time to run 'purge_master.sh' in Terminal Root and upload the entire database to global mirror servers before your line gets cut.",
            objectives: [
                { id: "c5_purge", text: "Ejecuta 'purge_master.sh' en la Terminal Root.", text_en: "Run 'purge_master.sh' in Terminal Root.", done: false },
                { id: "c5_survive", text: "Supera la secuencia de defensa final sin permitir que el intruso te detecte.", text_en: "Survive the final defense sequence without allowing the intruder to catch you.", done: false },
                { id: "c5_leak", text: "Filtra la verdad al mundo exterior y desmantela el Proyecto DarkLink.", text_en: "Leak the truth to the outside world and dismantle Project DarkLink.", done: false }
            ],
            clue: "El script maestro purga los servidores proxy y envía la evidencia a 250 servidores de noticias anónimos.",
            clue_en: "The master script purges proxy servers and dispatches evidence to 250 anonymous news mirrors.",
            rewardBTC: 0.50
        }
    ];

    // Helpers de localización de capítulos
    function getChapterTitle(ch, lang) {
        if (!ch) return '';
        return (lang === 'en' && ch.title_en) ? ch.title_en : ch.title;
    }

    function getChapterSummary(ch, lang) {
        if (!ch) return '';
        return (lang === 'en' && ch.summary_en) ? ch.summary_en : ch.summary;
    }

    function getChapterClue(ch, lang) {
        if (!ch) return '';
        return (lang === 'en' && ch.clue_en) ? ch.clue_en : ch.clue;
    }

    function getObjectiveText(obj, lang) {
        if (!obj) return '';
        return (lang === 'en' && obj.text_en) ? obj.text_en : obj.text;
    }

    // Inicializar el estado de la historia si no existe
    function initStoryState() {
        if (!window.state) return;
        if (!window.state.storyMode) {
            window.state.storyMode = {
                active: true,
                chapter: 1,
                completed: false,
                chapters: JSON.parse(JSON.stringify(STORY_CHAPTERS)),
                discoveredClues: [],
                cinemaWatched: false
            };
        }
    }

    // Obtener capítulo actual
    function getCurrentChapter() {
        initStoryState();
        const chNum = window.state.storyMode.chapter || 1;
        return window.state.storyMode.chapters.find(c => c.id === chNum) || window.state.storyMode.chapters[0];
    }

    // Marcar objetivo completado
    function completeObjective(objId) {
        initStoryState();
        const curCh = getCurrentChapter();
        if (!curCh) return;

        const obj = curCh.objectives.find(o => o.id === objId);
        if (obj && !obj.done) {
            obj.done = true;
            playObjectiveSound();
            const lang = getLang();
            const text = getObjectiveText(obj, lang);
            const toastTpl = tFn("story_obj_completed_toast", "✓ OBJETIVO CUMPLIDO: {text}");
            showStoryToast(toastTpl.replace('{text}', text));
            updateStoryUI();

            // Verificar si todos los objetivos del capítulo están listos
            const allDone = curCh.objectives.every(o => o.done);
            if (allDone) {
                setTimeout(() => {
                    advanceChapter();
                }, 1500);
            }
        }
    }

    // Avanzar de capítulo
    function advanceChapter() {
        initStoryState();
        const curCh = getCurrentChapter();
        const nextChNum = curCh.id + 1;

        if (curCh.rewardBTC && typeof window.updateWallet === 'function') {
            window.updateWallet(curCh.rewardBTC);
        }

        playChapterAdvanceSound();
        showChapterCompletedModal(curCh, nextChNum);
    }

    // Sonidos de la historia
    function playObjectiveSound() {
        try {
            if (window.RoomInteractions && typeof window.RoomInteractions.getAudioCtx === 'function') {
                const ctx = window.RoomInteractions.getAudioCtx();
                const now = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(587.33, now); // D5
                osc.frequency.setValueAtTime(880, now + 0.1); // A5
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.35);
            }
        } catch(e) {}
    }

    function playChapterAdvanceSound() {
        try {
            if (window.RoomInteractions && typeof window.RoomInteractions.playCinematicChapterTransitionStinger === 'function') {
                window.RoomInteractions.playCinematicChapterTransitionStinger();
            } else if (window.RoomInteractions && typeof window.RoomInteractions.getAudioCtx === 'function') {
                const ctx = window.RoomInteractions.getAudioCtx();
                const now = ctx.currentTime;
                [440, 554.37, 659.25, 880].forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0.1, now + idx * 0.12);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.4);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + idx * 0.12);
                    osc.stop(now + idx * 0.12 + 0.4);
                });
            }
        } catch(e) {}
    }

    // Diálogos específicos por capítulo
    function triggerChapterDialogues(chapterId) {
        if (typeof window.queueDialogues !== 'function') return;
        const lang = getLang();

        if (chapterId === 2) {
            window.queueDialogues([
                { 
                    name: "@Specter_98", 
                    text: lang === 'en' 
                        ? "Great work downloading the dump! But it has military-grade PGP encryption." 
                        : "¡Buen trabajo descargando el volcado! Pero tiene cifrado militar PGP." 
                },
                { 
                    name: "@Specter_98", 
                    text: lang === 'en'
                        ? "Answer the phone if it rings. Someone at HQ is trying to pass you the public key."
                        : "Atiende el teléfono si suena. Alguien en la central está intentando pasarte la clave pública." 
                },
                { 
                    name: lang === 'en' ? "System" : "Sistema", 
                    text: lang === 'en'
                        ? "NEW FILE: 'dump_core.bin' added to local file system."
                        : "NUEVO ARCHIVO: 'dump_core.bin' agregado al sistema de archivos local." 
                }
            ]);
            // Agregar archivo al VFS si no existe
            if (window.state && window.state.vfs) {
                if (!window.state.vfs.find(f => f.name === 'dump_core.bin')) {
                    window.state.vfs.push({
                        name: "dump_core.bin",
                        name_en: "dump_core.bin",
                        content: "-----BEGIN ENCRYPTED MEMORY DUMP-----\nPROJECT_PUPPETEER_NODE_77\n[RSA-2048 ENCRYPTED DATA: 0x9F4C1B...]\n\nDescifra este volcado ejecutando:\ndecrypt dump_core.bin\n-----END ENCRYPTED DUMP-----",
                        content_en: "-----BEGIN ENCRYPTED MEMORY DUMP-----\nPROJECT_PUPPETEER_NODE_77\n[RSA-2048 ENCRYPTED DATA: 0x9F4C1B...]\n\nDecrypt this dump by running:\ndecrypt dump_core.bin\n-----END ENCRYPTED DUMP-----",
                        decryptedContent: "PROYECTO PUPPETEER - ARCHIVO CONFIDENCIAL DESCLASIFICADO\n=======================================================\n> SUJETO: Operador de Nodo Local (Usuario 1998).\n> ESTADO: Bajo vigilancia perimetral activa.\n> ENTIDAD BIOLÓGICA ASIGNADA: Colector de Pasillo Modelo-IV.\n> ADVERTENCIA: La entidad responde al ruido y a las emisiones electromagnéticas del monitor CRT. Si el monitor está encendido durante la recolección, el sujeto será eliminado.\n> SERVIDOR PRINCIPAL: http://puppeteer-project.ann/ (IP: 184.22.9.101)\n=======================================================",
                        decryptedContent_en: "PROJECT PUPPETEER - DECLASSIFIED CONFIDENTIAL FILE\n=======================================================\n> SUBJECT: Local Node Operator (User 1998).\n> STATUS: Under active perimeter surveillance.\n> ASSIGNED BIOLOGICAL ENTITY: Model-IV Hallway Collector.\n> WARNING: The entity responds to noise and electromagnetic CRT monitor emissions. If monitor is active during harvest, subject will be terminated.\n> MAIN SERVER: http://puppeteer-project.ann/ (IP: 184.22.9.101)\n=======================================================",
                        decrypted: false,
                        canDelete: false
                    });
                }
            }
        } else if (chapterId === 3) {
            window.queueDialogues([
                { 
                    name: lang === 'en' ? "System" : "Sistema", 
                    text: lang === 'en'
                        ? "⚠ CRITICAL INTRUSION ALERT! IP Address 184.22.9.101 attempting to overwrite boot sector."
                        : "⚠ ¡ALERTA CRÍTICA DE INTRUSIÓN! Dirección IP 184.22.9.101 intentando sobrescribir el sector de arranque." 
                },
                { 
                    name: "@Specter_98", 
                    text: lang === 'en'
                        ? "They found you! Latch the door with 'L' and isolate the ports in Terminal before it's too late!"
                        : "¡Te han localizado! Traba la puerta con 'L' y aísla los puertos en la Terminal antes de que sea tarde." 
                }
            ]);
        } else if (chapterId === 4) {
            window.queueDialogues([
                { 
                    name: "@Specter_98", 
                    text: lang === 'en'
                        ? "We held off the attack temporarily. Check the room CRT TV on the CCTV channel."
                        : "Logramos frenar el ataque temporalmente. Mira la TV CRT del cuarto en el canal CCTV." 
                },
                { 
                    name: "@Specter_98", 
                    text: lang === 'en'
                        ? "They're right outside your door. We need the exploit pack to break into their central server."
                        : "Están afuera de tu puerta. Necesitamos el exploit pack para ingresar a su servidor central." 
                }
            ]);
        } else if (chapterId === 5) {
            window.queueDialogues([
                { 
                    name: "@Specter_98", 
                    text: lang === 'en'
                        ? "This is the final stretch. The 'purge_master.sh' script is ready in your terminal."
                        : "Esta es la recta final. El script 'purge_master.sh' está listo en tu terminal." 
                },
                { 
                    name: "@Specter_98", 
                    text: lang === 'en'
                        ? "Execute it! Don't get distracted by what you hear outside. Do it now!"
                        : "Ejecútalo. No te distraigas con lo que escuches afuera. ¡Hazlo ahora!" 
                }
            ]);
            // Agregar script de purga al VFS
            if (window.state && window.state.vfs) {
                if (!window.state.vfs.find(f => f.name === 'purge_master.sh')) {
                    window.state.vfs.push({
                        name: "purge_master.sh",
                        name_en: "purge_master.sh",
                        content: "#!/bin/bash\n# SCRIPT MAESTRO DE PURGA GLOBAL\n# Ejecuta este script escribiendo:\n# purge_master.sh o ./purge_master.sh\n\necho '> INICIALIZANDO PURGA DEL PROYECTO PUPPETEER...'\necho '> SUBIENDO VOLCADOS A 250 SERVIDORES ESPEJO...'",
                        content_en: "#!/bin/bash\n# GLOBAL PURGE MASTER SCRIPT\n# Execute this script by typing:\n# purge_master.sh or ./purge_master.sh\n\necho '> INITIALIZING PROJECT PUPPETEER PURGE...'\necho '> UPLOADING DUMPS TO 250 MIRROR SERVERS...'",
                        decryptedContent: "",
                        decrypted: true,
                        canDelete: false
                    });
                }
            }
        }
    }

    // Modal de Capítulo Completado (Diseño profesional y llamativo)
    function showChapterCompletedModal(curCh, nextChNum) {
        let modal = document.getElementById('story-chapter-complete-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'story-chapter-complete-modal';
            modal.className = 'story-chapter-complete-modal';
            document.body.appendChild(modal);
        }

        const lang = getLang();
        const chTitle = getChapterTitle(curCh, lang);
        const romans = ["I", "II", "III", "IV", "V"];
        const curRoman = romans[(curCh.id - 1) % romans.length] || curCh.id;

        const completeBadge = lang === 'en' ? '★ CHAPTER COMPLETED ★' : '★ CAPÍTULO COMPLETADO ★';
        const docResolvedTag = lang === 'en' ? 'DOSSIER 98 // OBJECTIVES CLEARED' : 'EXPEDIENTE 98 // OBJETIVOS RESUELTOS';
        const objsListHtml = curCh.objectives ? curCh.objectives.map(o => {
            const oText = getObjectiveText(o, lang);
            return `<div class="story-complete-obj-row"><span class="story-complete-check">✓</span><span>${oText}</span></div>`;
        }).join('') : '';

        const rewardText = lang === 'en'
            ? `+₿ ${curCh.rewardBTC} BTC CREDITED TO WALLET`
            : `+₿ ${curCh.rewardBTC} BTC ACREDITADOS A LA BILLETERA`;

        const nextBtnText = nextChNum <= 5
            ? (lang === 'en' ? 'NEXT DIRECTIVE ▶' : 'SIGUIENTE DIRECTIVA ▶')
            : (lang === 'en' ? 'FINALIZE PURGE ▶' : 'FINALIZAR PURGA ▶');
        const pressEnterText = lang === 'en'
            ? '(Press ENTER or SPACE to continue)'
            : '(Presiona ENTER o ESPACIO para continuar)';

        modal.innerHTML = `
            <div class="story-complete-box">
                <div class="story-modal-scanlines"></div>
                <div class="story-complete-badge">${completeBadge}</div>
                <h2 class="story-complete-title">${chTitle}</h2>
                <div class="story-complete-subtitle">[${curCh.code}] — ${docResolvedTag}</div>
                <div class="story-complete-objs-list">
                    ${objsListHtml}
                </div>
                <div class="story-complete-reward-box">
                    <span style="font-size: 1.4rem;">💰</span>
                    <span>${rewardText}</span>
                </div>
                <button class="story-modal-btn cinematic-btn" id="btn-complete-continue">${nextBtnText}</button>
                <div class="story-modal-shortcut-hint">${pressEnterText}</div>
            </div>
        `;

        modal.classList.remove('hidden');

        const proceedNext = () => {
            modal.classList.add('hidden');
            window.removeEventListener('keydown', handleKeyComplete);
            if (typeof window.playClickSound === 'function') window.playClickSound();

            if (nextChNum <= 5) {
                window.state.storyMode.chapter = nextChNum;
                showStoryChapterModal(nextChNum);
                updateStoryUI();
                triggerChapterDialogues(nextChNum);
            } else {
                window.state.storyMode.completed = true;
                triggerStoryVictory();
            }
        };

        const handleKeyComplete = (e) => {
            if (e.code === 'Enter' || e.code === 'Space' || e.code === 'Escape') {
                e.preventDefault();
                proceedNext();
            }
        };

        const btn = document.getElementById('btn-complete-continue');
        if (btn) {
            btn.onclick = proceedNext;
            btn.focus();
        }

        window.addEventListener('keydown', handleKeyComplete);
    }

    // Modal Cinemático de nuevo capítulo
    function showStoryChapterModal(chId) {
        initStoryState();
        const ch = window.state.storyMode.chapters.find(c => c.id === chId);
        if (!ch) return;

        let modal = document.getElementById('story-chapter-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'story-chapter-modal';
            modal.className = 'story-chapter-modal hidden';
            document.body.appendChild(modal);
        }

        const lang = getLang();
        const title = getChapterTitle(ch, lang);
        const summary = getChapterSummary(ch, lang);
        const rewardTpl = tFn("story_modal_reward", "Recompensa por completar: +₿ {reward} BTC");
        const romans = ["I", "II", "III", "IV", "V"];
        const romanNumeral = romans[(ch.id - 1) % romans.length] || ch.id;
        const chapterPrefix = tFn("story_cinematic_chapter_prefix", "CAPÍTULO");
        const classifiedTag = tFn("story_cinematic_classified_tag", "EXPEDIENTE 98 // ARCHIVO DESCLASIFICADO");
        const objectivesHeader = tFn("story_cinematic_objectives_header", "DIRECTIVAS DE LA MISIÓN:");
        const startBtnText = tFn("story_cinematic_btn_start", "INICIAR CAPÍTULO ▶");
        const pressEnterText = tFn("story_cinematic_press_enter", "(O presiona ENTER / ESPACIO para continuar)");

        const objectivesHtml = ch.objectives ? ch.objectives.map(o => {
            const oText = getObjectiveText(o, lang);
            return `<div class="story-cinematic-obj-item"><span class="obj-dot">▶</span> ${oText}</div>`;
        }).join('') : '';

        modal.innerHTML = `
            <div class="story-modal-box cinematic">
                <div class="story-modal-scanlines"></div>
                <div class="story-modal-top-bar">
                    <span class="story-modal-tag">${classifiedTag}</span>
                    <span class="story-modal-code">${ch.code}</span>
                </div>
                <div class="story-modal-roman-badge">${chapterPrefix} ${romanNumeral}</div>
                <h2 class="story-modal-title">${title}</h2>
                <div class="story-modal-summary-box">
                    <p class="story-modal-summary">${summary}</p>
                </div>
                <div class="story-modal-objectives-box">
                    <div class="story-modal-obj-title">${objectivesHeader}</div>
                    ${objectivesHtml}
                </div>
                <div class="story-modal-reward-bar">
                    <span class="reward-icon">💰</span>
                    <span class="reward-text">${rewardTpl.replace('{reward}', ch.rewardBTC)}</span>
                </div>
                <button class="story-modal-btn cinematic-btn" id="btn-story-continue">${startBtnText}</button>
                <div class="story-modal-shortcut-hint">${pressEnterText}</div>
            </div>
        `;

        modal.classList.remove('hidden');

        const closeModal = () => {
            modal.classList.add('hidden');
            window.removeEventListener('keydown', handleKeyContinue);
            if (typeof window.playClickSound === 'function') window.playClickSound();
        };

        const handleKeyContinue = (e) => {
            if (e.code === 'Enter' || e.code === 'Space' || e.code === 'Escape') {
                e.preventDefault();
                closeModal();
            }
        };

        const btn = document.getElementById('btn-story-continue');
        if (btn) {
            btn.onclick = closeModal;
            btn.focus();
        }

        window.addEventListener('keydown', handleKeyContinue);
    }

    // Victoria de la historia
    function triggerStoryVictory() {
        if (typeof window.queueDialogues === 'function') {
            window.queueDialogues([
                { name: "@Specter_98", text: tFn("story_specter_victory_1", "¡LO LOGRAMOS! La base de datos completa del Proyecto Puppeteer ha sido transmitida.") },
                { name: "@Specter_98", text: tFn("story_specter_victory_2", "Los servidores centrales se están apagando... la entidad en el pasillo se desvanece.") },
                { name: "Sistema", text: tFn("story_system_victory", "EXPEDIENTE 98 RESUELTO. Has liberado la verdad y sobrevivido a DarkLink.") }
            ]);
        }

        setTimeout(() => {
            const winEl = document.getElementById('screen-victory');
            if (winEl) {
                const title = winEl.querySelector('h1');
                if (title) title.innerText = tFn("story_victory_title", "EXPEDIENTE RESUELTO — HAS SOBREVIVIDO");
                const p = winEl.querySelector('p');
                if (p) p.innerText = tFn("story_victory_desc", "Has desmantelado el Proyecto Puppeteer y filtrado toda la evidencia al mundo. ¡Modo Sandbox Libre y Desbloqueado!");
                winEl.classList.remove('hidden');
                winEl.classList.add('active');
            }
        }, 5000);
    }

    // Toast de historia
    function showStoryToast(text) {
        let toast = document.getElementById('story-hud-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'story-hud-toast';
            toast.className = 'story-hud-toast hidden';
            document.body.appendChild(toast);
        }
        toast.innerText = text;
        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 4000);
    }

    // Actualizar UI del Expediente en el escritorio
    function updateStoryUI() {
        initStoryState();
        const curCh = getCurrentChapter();
        if (!curCh) return;

        const lang = getLang();
        const title = getChapterTitle(curCh, lang);
        const summary = getChapterSummary(curCh, lang);
        const clue = getChapterClue(curCh, lang);

        // Actualizar Widget HUD en el escritorio
        const widgetBadge = document.querySelector('.story-widget-badge');
        if (widgetBadge) widgetBadge.innerText = tFn("story_widget_badge", "HISTORIA");

        const widgetTitle = document.getElementById('story-widget-title');
        const widgetList = document.getElementById('story-widget-objectives');
        const widgetFooter = document.querySelector('.story-widget-footer');

        if (widgetTitle) widgetTitle.innerText = `${title}`;
        if (widgetList) {
            widgetList.innerHTML = curCh.objectives.map(o => {
                const oText = getObjectiveText(o, lang);
                return `
                    <li class="${o.done ? 'done' : 'pending'}">
                        <span class="chk">${o.done ? '✓' : '○'}</span> ${oText}
                    </li>
                `;
            }).join('');
        }
        if (widgetFooter) {
            widgetFooter.innerHTML = `<span>${tFn("story_widget_footer_text", "Abre <b>Expediente 98</b> para más pistas.")}</span>`;
        }

        // Actualizar Ventana de la App EXPEDIENTE_98
        const appTitle = document.getElementById('expediente-chapter-title');
        const appCode = document.getElementById('expediente-chapter-code');
        const appDesc = document.getElementById('expediente-chapter-desc');
        const appList = document.getElementById('expediente-objectives-list');
        const appClue = document.getElementById('expediente-clue-text');

        if (appTitle) appTitle.innerText = title;
        if (appCode) {
            const codeTpl = tFn("story_app_code_label", "CÓDIGO: {code}");
            appCode.innerText = codeTpl.replace('{code}', curCh.code);
        }
        if (appDesc) appDesc.innerText = summary;
        if (appClue) {
            const clueTpl = tFn("story_app_clue_label", "💡 PISTA FORENSE: {clue}");
            appClue.innerText = clueTpl.replace('{clue}', clue);
        }
        if (appList) {
            const statusDone = tFn("story_obj_status_done", "[COMPLETADO]");
            const statusPending = tFn("story_obj_status_pending", "[PENDIENTE]");
            appList.innerHTML = curCh.objectives.map(o => {
                const oText = getObjectiveText(o, lang);
                return `
                    <div class="expediente-obj-item ${o.done ? 'completed' : ''}">
                        <span class="expediente-obj-icon">${o.done ? '✓' : '▶'}</span>
                        <span class="expediente-obj-label">${oText}</span>
                        <span class="expediente-obj-status">${o.done ? statusDone : statusPending}</span>
                    </div>
                `;
            }).join('');
        }
    }

    window.addEventListener('languageChanged', () => {
        updateStoryUI();
    });

    // Exportar al objeto global
    window.StoryMode = {
        initStoryState,
        getCurrentChapter,
        completeObjective,
        advanceChapter,
        updateStoryUI,
        showStoryChapterModal,
        showChapterCompletedModal,
        showStoryToast,
        triggerChapterDialogues
    };

})();
