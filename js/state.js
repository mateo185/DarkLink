// --- ESTADO GLOBAL ---
const state = {
    playerName: "Usuario",
    dialogueQueue: [],
    isDialogueActive: false,
    threatActive: false,
    doorKnockActive: false,
    screenOff: false,
    hackerRevealed: false,
    threatTimer: null,
    currentQuest: 0,
    globalTimeLeft: 300,
    globalTimerInterval: null,
    freeRoam: false,
    freeRoamInitialized: false,
    hasEvadedOnce: false,
    isMinigameActive: false,
    completedMinigames: 0,
    gameTimeMinutes: 194, // Empieza a las 03:14 AM
    gameClockInterval: null,
    webcamStream: null,
    lastCapturedPhoto: null,
    antivirusShield: false,
    acceleratedMinigame: false,
    sandboxTutorialStep: 0,
    firstTimeSandbox: true,
    upgrades: {
        vpn: false,
        overclock: false,
        pgpKey: false,
        exploitPack: false
    },
    vfs: [
        {
            name: "diario_hacker.pgp",
            name_en: "hacker_diary.pgp",
            content: "-----BEGIN PGP MESSAGE-----\nVersion: GnuPG v2\n\nhQEMA+x... [Cifrado con clave del atacante]\n\nDescifra este archivo usando el comando:\ndecrypt diario_hacker.pgp\nen la Terminal.\n-----END PGP MESSAGE-----",
            content_en: "-----BEGIN PGP MESSAGE-----\nVersion: GnuPG v2\n\nhQEMA+x... [Encrypted with attacker key]\n\nDecrypt this file using command:\ndecrypt hacker_diary.pgp\nin Terminal.\n-----END PGP MESSAGE-----",
            decryptedContent: "BITÁCORA DEL ATACANTE - ACCESO NO AUTORIZADO\n--------------------------------------------\n> Objetivo: Usuario Local.\n> Nivel de vulnerabilidad: Alto (sin cortafuegos activo).\n> Notas: He tomado una foto sigilosa usando su propia cámara web para confirmar su identidad. La he subido al foro profundo. Este tonto se asusta con solo escuchar unas pisadas o mi respiración simulada...\n> Plan: Esperar a que entre al simulador y extraer todas sus credenciales de crypto. Si intenta purgar el sistema, enviaré la foto a toda su subred.\n--------------------------------------------",
            decryptedContent_en: "ATTACKER LOG - UNAUTHORIZED ACCESS\n--------------------------------------------\n> Target: Local User.\n> Vulnerability level: High (no active firewall).\n> Notes: I took a stealth webcam snapshot to confirm their identity and uploaded it to the dark forum. This fool panics just hearing footsteps or simulated breathing...\n> Plan: Wait until they enter the simulator and extract all their crypto credentials. If they attempt to purge the system, I will broadcast their info to their entire subnet.\n--------------------------------------------",
            decrypted: false,
            canDelete: false
        },
        {
            name: "registro_sistema.log",
            name_en: "system_log.log",
            content: "REGISTRO DE INTRUSIONES DEL SISTEMA\n-----------------------------------\n[02:14:10] CONEXIÓN ESTABLECIDA: 184.22.9.101 (Puerto 443)\n[02:15:32] ALERTA: Acceso no autorizado detectado en directorio root.\n[02:18:44] ADVERTENCIA: Proceso externo modificó 'driver_webcam.sys'.\n[03:14:02] NOTA: Protocolo A.N.N Sandbox iniciado.",
            content_en: "SYSTEM INTRUSION LOG\n-----------------------------------\n[02:14:10] CONNECTION ESTABLISHED: 184.22.9.101 (Port 443)\n[02:15:32] ALERT: Unauthorized access detected in root directory.\n[02:18:44] WARNING: External process modified 'driver_webcam.sys'.\n[03:14:02] NOTE: A.N.N Sandbox Protocol initiated.",
            decryptedContent: "",
            decryptedContent_en: "",
            decrypted: true,
            canDelete: true
        },
        {
            name: "guia_rapida.txt",
            name_en: "quick_guide.txt",
            content: "GUÍA DE INICIO RÁPIDO PARA HACKERS - OS PHANTOM\n===============================================\n\n1. SEGURIDAD (ANTIVIRUS):\n   - Activa el 'Escudo en Tiempo Real' en el Antivirus.\n   - Reduce drásticamente las intrusiones de red.\n   - Si oyes respiraciones o pisadas, alguien te rastrea.\n     ¡Apaga el monitor (botón ROJO) de inmediato!\n   - Ejecuta un 'Escaneo Completo' si te infectas.\n\n2. ECONOMÍA & MEJORAS:\n   - Navega con NightLink usando Torch.\n   - Busca ofertas en los Mercados profundos.\n   - Utiliza tus Bitcoins (BTC) para comprar mejoras:\n     * vpn_phantom.ovpn (₿ 0.20): VPN antirastreo.\n     * overclock.inf (₿ 0.25): Escaneo ultrarrápido.\n     * kit_pgp.key (₿ 0.15): Descifra textos secretos.\n     * exploit_pack.pkg (₿ 0.40): Hackeos instantáneos.\n\n3. COMANDOS DE LA TERMINAL:\n   - help           : Lista los comandos CLI.\n   - neofetch       : Diagnóstico del sistema y mejoras.\n   - wallet         : Estado de billetera BTC.\n   - scan           : Desbloquea onion links raros.\n   - hack <nodo>    : Incursión manual por BTC.\n   - exploit <nodo> : Incursión automatizada (requiere pack).\n   - decrypt <file> : Descifra volcados .pgp (requiere key).\n   - ls             : Lista archivos locales.\n   - cat <file>     : Lee archivos en la consola.\n   - rm <file>      : Elimina archivos locales.\n   - tutorial       : Reinicia el tutorial de DarkChat.\n\n4. COMUNICACIÓN (DARKCHAT):\n   - Los usuarios piden URLs. Responde con enlaces válidos.\n   - Algunos son trampas (scam). ¡Ten cuidado!",
            content_en: "QUICK START GUIDE FOR HACKERS - OS PHANTOM\n===============================================\n\n1. SECURITY (ANTIVIRUS):\n   - Turn on 'Real-Time Shield' in Antivirus.\n   - Drastically reduces network intrusions.\n   - If you hear breathing or footsteps, someone is tracking you.\n     Turn off monitor immediately (hold click)!\n   - Run a 'Full Scan' if infected.\n\n2. ECONOMY & UPGRADES:\n   - Browse with NightLink using Torch.\n   - Look for deals in deep markets.\n   - Use Bitcoins (BTC) to buy upgrades:\n     * vpn_phantom.ovpn (₿ 0.20): Anti-tracking VPN.\n     * overclock.inf (₿ 0.25): Ultra-fast scanning.\n     * kit_pgp.key (₿ 0.15): Decrypt secret texts.\n     * exploit_pack.pkg (₿ 0.40): Instant hacks.\n\n3. TERMINAL COMMANDS:\n   - help           : List CLI commands.\n   - neofetch       : System diagnostics & upgrades.\n   - wallet         : BTC wallet status.\n   - scan           : Unlock rare onion links.\n   - hack <node>    : Manual BTC incursion.\n   - exploit <node> : Automated incursion (requires pack).\n   - decrypt <file> : Decrypt .pgp dumps (requires key).\n   - ls             : List local files.\n   - cat <file>     : Read file in console.\n   - rm <file>      : Delete local file.\n   - tutorial       : Restart DarkChat tutorial.\n\n4. COMMUNICATION (DARKCHAT):\n   - Users request URLs. Reply with valid links.\n   - Some are scams. Stay sharp!",
            decryptedContent: "",
            decryptedContent_en: "",
            decrypted: true,
            canDelete: false
        }
    ],
    walletBTC: 0,
    // ---- 90s Interactive Room State ----
    radioOn: false,
    radioStation: 0,
    windowOpen: false,
    doorOpen: false,
    doorLocked: false,
    isLyingDown: false,
    catState: 'sleeping',      // sleeping, walking, scared, purring
    weatherState: 'clear',     // clear, rain, storm
    phoneRinging: false,
    phonePickedUp: false,
    tvOn: false,
    tvChannel: 0,
    catPetCount: 0,
    mirrorCreepy: false,
    consoleMinigameActive: false,
    isAtPC: false,
    doorBroken: false
};

// --- HELPERS DE ESTADO ---

function updateQuest(questId) {
    const questLog = document.getElementById('quest-log');
    const questText = document.getElementById('quest-text');
    const timerContainer = document.getElementById('timer-container');
    
    // Si la misión avanza, reiniciamos el reloj global a 5:00
    if (questId > state.currentQuest) {
        state.globalTimeLeft = 300;
    }
    
    state.currentQuest = questId;
    if (questLog) questLog.classList.remove('hidden');

    // Ocultar el contenedor del timer si no hemos sido hackeados aún
    if (questId <= 0) {
        if (timerContainer) timerContainer.classList.add('hidden');
    } else {
        if (timerContainer) timerContainer.classList.remove('hidden');
    }

    // Ocultar billetera en modo normal, mostrar en modo libre
    const walletUI = document.getElementById('wallet-ui');
    if (walletUI) {
        if (questId === -1) {
            walletUI.classList.remove('hidden');
        } else {
            walletUI.classList.add('hidden');
        }
    }
    
    // Ocultar botón de levantarse de la silla y menú inicio en modo normal, mostrar exclusivamente en modo libre
    const btnStandUp = document.getElementById('btn-stand-up');
    if (btnStandUp) {
        if (questId === -1 && state.freeRoam) {
            btnStandUp.classList.add('visible');
            btnStandUp.style.display = 'inline-flex';
        } else {
            btnStandUp.classList.remove('visible');
            btnStandUp.style.display = 'none';
        }
    }
    const startMenuStandup = document.getElementById('start-menu-standup');
    if (startMenuStandup) {
        if (questId === -1 && state.freeRoam) {
            startMenuStandup.style.display = 'block';
        } else {
            startMenuStandup.style.display = 'none';
        }
    }
    
    if (questText) {
        const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;
        switch(questId) {
            case -1:
                questText.innerHTML = tFn("quest_sandbox", "[-] Protocolo Sandbox Activo.<br><i>Navega libremente. Puedes comprar acceso a archivos con BTC. El tiempo pasa...</i>");
                questText.style.color = "";
                questText.style.animation = "";
                break;
            case 0:
                questText.innerHTML = tFn("quest_0", "[-] Explora la Deep Web.<br><i>Sugerencia: Abre el navegador NightLink y encuentra contenido interesante.</i>");
                questText.style.color = "";
                questText.style.animation = "";
                break;
            case 1:
                questText.innerHTML = tFn("quest_1", "[-] Localiza el origen del atacante.<br><i>Sugerencia: Usa NightLink y busca herramientas de rastreo en la Deep Web.</i>");
                questText.style.color = "";
                questText.style.animation = "";
                break;
            case 2:
                questText.innerHTML = tFn("quest_2", "[-] Restaura los permisos del cortafuegos.<br><i>Sugerencia: Usa el panel NetManager en el escritorio.</i>");
                questText.style.color = "";
                questText.style.animation = "";
                break;
            case 3:
                questText.innerHTML = tFn("quest_3", "[-] Limpia los troyanos inyectados.<br><i>Sugerencia: Ejecuta un escaneo profundo en el Antivirus.</i>");
                questText.style.color = "";
                questText.style.animation = "";
                break;
            case 4:
                questText.innerHTML = tFn("quest_4", "[-] Desencripta la transmisión interceptada.<br><i>Sugerencia: Usa el comando 'decrypt' en la Terminal.</i>");
                questText.style.color = "";
                questText.style.animation = "";
                break;
            case 5:
                questText.innerHTML = tFn("quest_5", "[-] Sobrevive a la intrusión física.<br><i>Sugerencia: Traba el pestillo con 'L' o apaga el monitor si se acerca.</i>");
                questText.style.color = "red";
                questText.style.animation = "blink 0.5s infinite";
                break;
        }
    }
}

function updateWallet(amount) {
    state.walletBTC += amount;
    const balanceElem = document.getElementById('wallet-balance');
    if(balanceElem) {
        balanceElem.innerText = state.walletBTC.toFixed(3);
        // Flashing effect
        balanceElem.style.color = '#fff';
        setTimeout(() => balanceElem.style.color = '#0f0', 500);
    }
    if (state.walletBTC > 0) {
        if (typeof checkTutorialProgress === 'function') checkTutorialProgress('btc');
    }
}

function updateAntivirusUpgradesUI() {
    const container = document.getElementById('antivirus-upgrades-list');
    if (!container) return;
    
    container.innerHTML = '';
    let upgradesCount = 0;
    
    if (state.upgrades.vpn) {
        container.innerHTML += `<span style="background: rgba(94, 255, 130, 0.1); border: 1px solid #5eff82; color: #5eff82; padding: 2px 6px; border-radius: 3px; font-weight: bold; margin-right: 5px;">🔒 VPN_PHANTOM.OVPN</span>`;
        upgradesCount++;
    }
    if (state.upgrades.pgpKey) {
        container.innerHTML += `<span style="background: rgba(94, 255, 130, 0.1); border: 1px solid #5eff82; color: #5eff82; padding: 2px 6px; border-radius: 3px; font-weight: bold; margin-right: 5px;">🔑 KIT_PGP.KEY</span>`;
        upgradesCount++;
    }
    if (state.upgrades.overclock) {
        container.innerHTML += `<span style="background: rgba(94, 255, 130, 0.1); border: 1px solid #5eff82; color: #5eff82; padding: 2px 6px; border-radius: 3px; font-weight: bold; margin-right: 5px;">⚡ OVERCLOCK.INF (CPU)</span>`;
        upgradesCount++;
    }
    if (state.upgrades.exploitPack) {
        container.innerHTML += `<span style="background: rgba(94, 255, 130, 0.1); border: 1px solid #5eff82; color: #5eff82; padding: 2px 6px; border-radius: 3px; font-weight: bold; margin-right: 5px;">💣 EXPLOIT_PACK.PKG</span>`;
        upgradesCount++;
    }
    
    if (upgradesCount === 0) {
        const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;
        container.innerHTML = `<span style="color: #ff3333; animation: blink 1.5s infinite;">${tFn("antivirus_no_upgrades", "Ninguna mejora detectada. Busca un mercado en Torch para comprar actualizaciones de OPSEC.")}</span>`;
    }
}

// --- SISTEMA DE EVENTOS ESTACIONALES EN TIEMPO REAL (HALLOWEEN Y NAVIDAD) ---
state.activeSeason = 'auto'; // 'auto', 'halloween', 'christmas', 'default'

function getCurrentActiveSeason() {
    if (state.activeSeason && state.activeSeason !== 'auto') {
        return state.activeSeason;
    }
    const now = new Date();
    const month = now.getMonth(); // 0 = Ene, 9 = Oct, 10 = Nov, 11 = Dic
    const day = now.getDate();

    // Halloween / Temporada de Terror: Del 1 de Octubre al 5 de Noviembre
    if ((month === 9) || (month === 10 && day <= 5)) {
        return 'halloween';
    }
    // Navidad / Temporada Festiva: Del 1 de Diciembre al 6 de Enero
    if ((month === 11) || (month === 0 && day <= 6)) {
        return 'christmas';
    }
    return 'default';
}

function setSeason(seasonName) {
    const valid = ['auto', 'halloween', 'christmas', 'default'];
    if (valid.includes(seasonName)) {
        state.activeSeason = seasonName;
        console.log(`[DarkLink Season] Temporada activa configurada: ${seasonName} (Efectiva: ${getCurrentActiveSeason()})`);
        if (typeof window.applySeasonalEnvironment === 'function') {
            window.applySeasonalEnvironment();
        }
        return `[DarkLink Event] Temporada activa: ${seasonName.toUpperCase()} (Efectiva: ${getCurrentActiveSeason().toUpperCase()})`;
    }
    return `Opciones válidas: ${valid.join(', ')}`;
}

// Exportar globalmente
window.state = state;
window.updateQuest = updateQuest;
window.updateWallet = updateWallet;
window.updateAntivirusUpgradesUI = updateAntivirusUpgradesUI;
window.getCurrentActiveSeason = getCurrentActiveSeason;
window.setSeason = setSeason;
