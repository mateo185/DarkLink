// --- WINHELLO CYBER-ASSISTANT IMPLEMENTATION ---
// Enhanced with: Voice TTS, Emotions, Lip-Sync, Particles, Mini-Input, AFK Detection

let winHelloTypewriterTimeout = null;
let winHelloHideTimeout = null;
let winHelloDialogueInterval = null;
let winHelloAssistantInitialized = false;
let winHelloLastMessageTime = 0;      // Timestamp del último mensaje mostrado
const WIN_HELLO_COOLDOWN = 8000;      // ms mínimos entre mensajes automáticos

// Emotion & AFK state
let winHelloCurrentEmotion = 'normal';
let winHelloLastUserActivity = Date.now();
let winHelloAfkCheckInterval = null;
let winHelloParticlesAnimFrame = null;
let winHelloParticles = [];
let winHelloInputVisible = false;

// Riddles system
let winHelloActiveRiddle = null;
const WINHELLO_RIDDLES = [
    {
        question: "¿Qué puerto de red estándar utiliza el protocolo seguro HTTPS?",
        question_en: "Which standard network port does the secure HTTPS protocol use?",
        answer: "443",
        reward: 0.02
    },
    {
        question: "¿Qué protocolo de resolución de nombres traduce dominios web en direcciones IP?",
        question_en: "Which name resolution protocol translates web domains into IP addresses?",
        answer: "dns",
        reward: 0.02
    },
    {
        question: "¿Cuál es el valor decimal del número binario 1010?",
        question_en: "What is the decimal value of the binary number 1010?",
        answer: "10",
        reward: 0.02
    },
    {
        question: "¿Qué sigla de 3 letras se asocia al cifrado asimétrico usado para firmar correos electrónicos y archivos?",
        question_en: "Which 3-letter acronym is associated with asymmetric encryption used to sign emails and files?",
        answer: "pgp",
        reward: 0.03
    },
    {
        question: "¿Qué puerto por defecto usa el protocolo SSH para conexiones remotas cifradas?",
        question_en: "Which default port does the SSH protocol use for encrypted remote connections?",
        answer: "22",
        reward: 0.02
    },
    {
        question: "¿Cómo se llama el buscador web de la red A.N.N. que sirve para indexar sitios ocultos?",
        question_en: "What is the name of the A.N.N. search engine used to index hidden sites?",
        answer: "torch",
        reward: 0.02
    },
    {
        question: "¿Cuál es el protocolo de enrutamiento anónimo en capas que usa cebollas para cifrar?",
        question_en: "What is the layered anonymous routing protocol that uses onions to encrypt?",
        answer: "tor",
        reward: 0.03
    },
    {
        question: "¿Qué comando de 2 letras de terminal lista los archivos del directorio actual?",
        question_en: "Which 2-letter terminal command lists files in the current directory?",
        answer: "ls",
        reward: 0.01
    },
    {
        question: "¿Qué base numérica tiene el sistema de numeración hexadecimal?",
        question_en: "What number base does the hexadecimal numeral system have?",
        answer: "16",
        reward: 0.02
    },
    {
        question: "¿Cuál es el puerto estándar utilizado por el protocolo web inseguro HTTP?",
        question_en: "What is the standard port used by the insecure HTTP web protocol?",
        answer: "80",
        reward: 0.02
    }
];

// ============================================================
// 1. MOTOR DE ESCRITURA (TYPEWRITER) CON FADE + VOZ
// ============================================================
function showWinHelloBubble(text, duration = 8000, mood = null) {
    const bubble = document.getElementById('winhello-bubble');
    const bubbleText = document.getElementById('winhello-bubble-text');
    if (!bubble || !bubbleText) return;

    // Evitar repetir el mismo texto si ya está visible
    if (bubbleText.getAttribute('data-current-text') === text && !bubble.classList.contains('hidden')) {
        return;
    }
    bubbleText.setAttribute('data-current-text', text);

    // Cancelar timers anteriores
    if (winHelloTypewriterTimeout) clearTimeout(winHelloTypewriterTimeout);
    if (winHelloHideTimeout) clearTimeout(winHelloHideTimeout);

    // Registrar tiempo para cooldown
    winHelloLastMessageTime = Date.now();

    // Detect mood automatically if not specified
    const effectiveMood = mood || detectMoodFromContext();

    // Set emotion based on mood
    setWinHelloEmotion(effectiveMood);

    // Show thinking indicator briefly before speaking
    const thinking = document.getElementById('winhello-thinking');
    if (thinking) thinking.classList.add('active');
    if (typeof playThinkingSound === 'function') playThinkingSound();

    // Revelar la burbuja
    bubble.classList.remove('hidden');
    bubble.style.opacity = '1';
    bubbleText.textContent = '';

    // Start voice after a brief "thinking" delay
    setTimeout(() => {
        if (thinking) thinking.classList.remove('active');

        // Start TTS voice
        if (typeof playWinHelloVoice === 'function') {
            playWinHelloVoice(text, effectiveMood);
        }

        // Typewriter effect
        let index = 0;
        function typeChar() {
            if (index < text.length) {
                bubbleText.textContent += text.charAt(index);
                index++;
                if (index % 2 === 0 && typeof playTypeSound === 'function') {
                    playTypeSound();
                }
                winHelloTypewriterTimeout = setTimeout(typeChar, 22);
            } else {
                // Fade-out suave al terminar
                winHelloHideTimeout = setTimeout(() => {
                    bubble.style.transition = 'opacity 0.8s ease';
                    bubble.style.opacity = '0';
                    setTimeout(() => {
                        bubble.classList.add('hidden');
                        bubble.style.opacity = '1';
                        bubble.style.transition = '';
                        bubbleText.setAttribute('data-current-text', '');
                        // Reset emotion after message fades
                        if (!state.threatActive && !state.isMinigameActive) {
                            setWinHelloEmotion('normal');
                        }
                    }, 800);
                }, duration);
            }
        }
        typeChar();
    }, 350); // Brief thinking delay
}

// ============================================================
// 2. HELPER: ¿Se puede enviar un mensaje automático ahora?
// ============================================================
function canShowAutoMessage() {
    const bubble = document.getElementById('winhello-bubble');
    const isBubbleVisible = bubble && !bubble.classList.contains('hidden');
    const cooldownOk = (Date.now() - winHelloLastMessageTime) > WIN_HELLO_COOLDOWN;
    return !isBubbleVisible && cooldownOk;
}

// ============================================================
// 3. DETECCIÓN AUTOMÁTICA DE MOOD SEGÚN CONTEXTO
// ============================================================
function detectMoodFromContext() {
    if (state.threatActive || state.isMinigameActive) return 'panic';
    if (state.antivirusShield && state.upgrades?.vpn) return 'proud';
    if (winHelloCurrentEmotion === 'sleep') return 'sleep';
    return 'normal';
}

// ============================================================
// 4. SISTEMA DE EMOCIONES DINÁMICAS
// ============================================================
function setWinHelloEmotion(emotion) {
    const widget = document.querySelector('.winhello-face-widget');
    if (!widget) return;

    // Remove all emotion classes dynamically
    Array.from(widget.classList).forEach(c => {
        if (c.startsWith('emotion-')) {
            widget.classList.remove(c);
        }
    });

    winHelloCurrentEmotion = emotion;

    if (emotion !== 'normal') {
        widget.classList.add('emotion-' + emotion);
    }

    // Update particle colors based on emotion
    updateParticleColors(emotion);
}

// ============================================================
// 5. RESPUESTAS DE ESCANEO INTELIGENTES SEGÚN ESTADO REAL
// ============================================================
function buildScanResponse() {
    const lang = (typeof window.getLanguage === 'function') ? window.getLanguage() : 'es';
    if (state.threatActive || state.isMinigameActive) {
        return lang === 'en' 
            ? 'CRITICAL ALERT! Hostile code detected in network stack. Execute firewall purge immediately.'
            : '¡ALERTA CRÍTICA! Código hostil detectado en la pila de red. Ejecute la purga del cortafuegos de inmediato.';
    }

    // Tutorial activo → guiar al paso correcto
    const tutSteps_en = {
        1: 'PHASE 1/6: Security initialization. Open the Antivirus app on the desktop and activate the "Real-Time Shield" to protect local ports.',
        2: 'PHASE 2/6: Network reconnaissance. Open the Torch browser and access a Deep Web node or perform a search query.',
        3: 'PHASE 3/6: Hardware inspection. Open the Terminal and run "neofetch" or "sysinfo" to audit system resources.',
        4: 'PHASE 4/6: Segment scan. In Terminal, execute the "scan" command to map and identify vulnerable IP addresses.',
        5: 'PHASE 5/6: Capital acquisition. Execute "hack <node_id>" in Terminal to compromise systems or fulfill contracts in DarkChat.',
        6: 'PHASE 6/6: OPSEC Optimization. Search "market" on Torch and purchase your first security upgrade using your BTC funds.'
    };
    const tutSteps_es = {
        1: 'FASE 1/6: Inicialización de seguridad. Abra la aplicación Antivirus en el escritorio y active el "Escudo en Tiempo Real" para blindar los puertos locales.',
        2: 'FASE 2/6: Reconocimiento de red. Abra el navegador Torch y acceda a un nodo de la Deep Web o realice una consulta de búsqueda.',
        3: 'FASE 3/6: Inspección de hardware. Abra la Terminal de comandos y ejecute "neofetch" o "sysinfo" para auditar los recursos del sistema.',
        4: 'FASE 4/6: Escaneo del segmento. En la Terminal, ejecute la directiva "scan" para mapear e identificar direcciones IP vulnerables.',
        5: 'FASE 5/6: Adquisición de capital. Ejecute "hack <nodo_id>" en la Terminal para comprometer sistemas o resuelva contratos comerciales en DarkChat.',
        6: 'FASE 6/6: Optimización OPSEC. Busque "mercado" en Torch y adquiera su primera actualización de seguridad utilizando sus fondos en BTC.'
    };
    const tutSteps = lang === 'en' ? tutSteps_en : tutSteps_es;
    if (state.sandboxTutorialStep >= 1 && state.sandboxTutorialStep <= 6) {
        return tutSteps[state.sandboxTutorialStep];
    }

    // Tutorial completado → tips contextuales inteligentes
    const btc = state.walletBTC ? state.walletBTC.toFixed(3) : '0.000';
    const vpn = state.upgrades?.vpn;
    const oc  = state.upgrades?.overclock;
    const pgp = state.upgrades?.pgpKey;
    const exp = state.upgrades?.exploitPack;
    const shield = state.antivirusShield;
    const games = state.completedMinigames || 0;

    const tips_en = [
        `Quick scan complete. Kernel status: nominal. Financial assets: ₿ ${btc} BTC. ${!shield ? '⚠ WARNING: Firewall inactive. Immediate activation recommended.' : 'Firewall active and operational.'}`,
        vpn
            ? 'Phantom VPN active. Data traffic is encrypted and geolocation probability is minimal.'
            : 'Warning: System lacks VPN masking. It is advised to purchase "vpn_phantom.ovpn" on SilkSale for ₿ 0.20 to protect your public IP.',
        oc
            ? 'Overclock module active on virtual CPU. Antivirus scanning and processing speed optimized.'
            : 'Processor running at base frequency. Installing "overclock.inf" (₿ 0.25 in markets) would optimize scan times.',
        pgp
            ? 'PGP decryption kit configured. Use "decrypt hacker_diary.pgp" in Terminal to decrypt private correspondence.'
            : 'PGP decryption tool not detected. Purchasing "kit_pgp.key" (₿ 0.15) is required to process confidential files.',
        exp
            ? 'Exploit Pack active in Terminal. You have access to "exploit <node_id>" for high-speed automated incursions.'
            : 'Terminal operates without exploit automation. Purchasing the pack on SilkSale for ₿ 0.40 grants automated incursion privileges.',
        `Security history: ${games} disinfection ${games === 1 ? 'operation' : 'operations'} completed in sandbox.`,
        'Useful directive: Execute "ls" in Terminal to list active directory, and "cat <file>" to inspect contents.',
        'Network parameter: A.N.N routing performs redundant encrypted hops to mask your physical geolocation.',
        'Physical protocol: If physical intrusion is suspected in your surroundings (noises or footsteps), cut monitor power immediately.',
        `Financial funds: ₿ ${btc} BTC. ${parseFloat(btc) >= 0.4 ? 'Sufficient capital to purchase Exploit Pack.' : parseFloat(btc) >= 0.2 ? 'Sufficient capital to purchase Phantom VPN or PGP Kit.' : 'I recommend compromising more servers to increase assets.'}`,
        'OPSEC Directive: Under no circumstances share your real IP address. Maintain absolute anonymity in DarkChat.',
        'Stock information: Torch market inventories fluctuate periodically. Check sites regularly.',
        'OS Tip: Bored with wallpaper? Use the "Wallpaper Pro Creator" in Start Menu to design a custom retro wallpaper.',
        'Network tip: You can play the 2D minigame "Super Dark Lighter" in the browser to earn Bitcoins quickly.',
        'Local directory: Indexed new VIP links in Wiki.txt so you can explore the database thoroughly.',
        'Announcement: Web apps like Gmail, Drive, Translate, and Maps are 100% functional. Try them in your browser.',
        'OPSEC Tip: Remember you can cleanly close windows using Task Manager to save system resources.'
    ];

    const tips_es = [
        `Escaneo rápido completado. Estado del Kernel: nominal. Activos financieros: ₿ ${btc} BTC. ${!shield ? '⚠ ADVERTENCIA: Cortafuegos inactivo. Se recomienda su activación inmediata.' : 'Cortafuegos activo y operando.'}`,
        vpn
            ? 'VPN Phantom activa. El tráfico de datos se encuentra cifrado y la probabilidad de geolocalización es mínima.'
            : 'Advertencia: El sistema carece de enmascaramiento VPN. Se aconseja adquirir "vpn_phantom.ovpn" en SilkSale por ₿ 0.20 para proteger su IP pública.',
        oc
            ? 'Módulo de Overclock activo en la CPU virtual. La velocidad de análisis y procesamiento del antivirus se ha optimizado.'
            : 'Procesador operando a frecuencia base. La instalación de "overclock.inf" (₿ 0.25 en mercados) optimizaría los tiempos de escaneo.',
        pgp
            ? 'Kit de desencriptación PGP configurado. Use "decrypt diario_hacker.pgp" en la Terminal para descifrar correspondencia privada.'
            : 'Herramienta de descifrado PGP no detectada. La adquisición de "kit_pgp.key" (₿ 0.15) es necesaria para procesar archivos confidenciales.',
        exp
            ? 'Exploit Pack activo en la Terminal de comandos. Dispone del comando "exploit <nodo_id>" para intrusiones automatizadas de alta velocidad.'
            : 'El terminal opera sin automatización de exploits. Adquirir el paquete de SilkSale por ₿ 0.40 le otorgará privilegios de intrusión automatizada.',
        `Historial de seguridad: se han completado ${games} ${games === 1 ? 'operación' : 'operaciones'} de desinfección en el sandbox.`,
        'Directiva útil: Ejecute "ls" en la Terminal para listar el directorio activo, y "cat <archivo>" para inspeccionar su contenido.',
        'Parámetro de red: El enrutamiento A.N.N realiza saltos cifrados redundantes para enmascarar su geolocalización física.',
        'Protocolo físico: Ante sospecha de intrusión física en su entorno (ruidos o pasos), corte la energía de la pantalla de inmediato.',
        `Fondos financieros: ₿ ${btc} BTC. ${parseFloat(btc) >= 0.4 ? 'Capital suficiente para adquirir el Exploit Pack.' : parseFloat(btc) >= 0.2 ? 'Capital suficiente para adquirir la VPN Phantom o el Kit PGP.' : 'Recomiendo vulnerar más servidores para incrementar los activos.'}`,
        'Directiva OPSEC: Bajo ninguna circunstancia comparta su dirección IP real. Mantenga el anonimato absoluto en DarkChat.',
        'Información de stock: Los inventarios de los mercados web de Torch varían periódicamente. Verifique los sitios con regularidad.',
        'Tip del OS: ¿Aburrido de tu fondo de pantalla? Usa el nuevo "Creador de Fondos Pro" en el Menú de Inicio para diseñar un tapiz retro a tu medida.',
        'Tip de red: Ahora puedes jugar al minijuego 2D "Super Dark Lighter" en el navegador para ganar Bitcoins de forma rápida.',
        'Directorio local: He indexado nuevos enlaces VIP en la Wiki.txt para que puedas explorar a fondo la base de datos.',
        'Anuncio: Las aplicaciones como Gogle Gmail, Drive, Traductor y Maps ahora son 100% funcionales. Pruébalas en tu navegador.',
        'Tip OPSEC: Recuerda que puedes cerrar ventanas de forma limpia usando el Administrador de Tareas para ahorrar recursos del sistema.'
    ];

    const tips = lang === 'en' ? tips_en : tips_es;
    return tips[Math.floor(Math.random() * tips.length)];
}

// ============================================================
// 6. SISTEMA DE INTERACCIÓN POR TEXTO (Mini-Input)
// ============================================================
function handleWinHelloUserInput(inputText) {
    const text = inputText.trim().toLowerCase();
    if (!text) return;
    const lang = (typeof window.getLanguage === 'function') ? window.getLanguage() : 'es';

    // Reset AFK timer on interaction
    winHelloLastUserActivity = Date.now();
    if (winHelloCurrentEmotion === 'sleep') setWinHelloEmotion('normal');

    // ── RIDDLE MINIGAME: Check answer if a riddle is active ──
    if (winHelloActiveRiddle) {
        // Allow cancelling
        if (text === 'rendirse' || text === 'abandonar' || text === 'cancelar' || text === 'salir' || text === 'give up' || text === 'quit' || text === 'cancel' || text === 'exit') {
            const correctAnswer = winHelloActiveRiddle.answer;
            winHelloActiveRiddle = null;
            const cancelMsg = lang === 'en' 
                ? `Challenge cancelled. Correct answer was: "${correctAnswer.toUpperCase()}". Type "play" for a new challenge.`
                : `Desafío cancelado. La respuesta correcta era: "${correctAnswer.toUpperCase()}". Ingrese "jugar" cuando desee un nuevo reto.`;
            showWinHelloBubble(cancelMsg, 8000, 'normal');
            return;
        }

        // Check if the user's answer matches
        const userAnswer = text.trim();
        const correctAnswer = winHelloActiveRiddle.answer.toLowerCase().trim();

        if (userAnswer === correctAnswer) {
            const reward = winHelloActiveRiddle.reward;
            winHelloActiveRiddle = null;
            
            // Grant BTC reward
            if (typeof updateWallet === 'function') {
                updateWallet(reward);
            }

            const winMsg = lang === 'en'
                ? `✓ CORRECT! Answer validated. ₿ ${reward.toFixed(3)} BTC deposited to your wallet for your technical knowledge. Type "play" for another riddle.`
                : `✓ ¡CORRECTO! Respuesta validada. Se han depositado ₿ ${reward.toFixed(3)} BTC en su billetera como recompensa por su conocimiento técnico. Ingrese "jugar" para otro desafío.`;
            showWinHelloBubble(winMsg, 10000, 'proud');
            if (typeof playProudSound === 'function') playProudSound();
            return;
        } else {
            const errReply = lang === 'en'
                ? `✗ Incorrect answer: "${inputText}". Try again, operator. Type "give up" to cancel the challenge.`
                : `✗ Respuesta incorrecta: "${inputText}". Intente de nuevo, operador. Escriba "rendirse" si desea abandonar el desafío.`;
            showWinHelloBubble(errReply, 7000, 'alert');
            return;
        }
    }

    // ── RIDDLE MINIGAME: Start a new riddle ──
    if (text === 'jugar' || text === 'adivinanza' || text === 'desafio' || text === 'desafío' || text === 'trivia' || text === 'reto' || text === 'play' || text === 'riddle' || text === 'quiz' || text === 'challenge') {
        const riddle = WINHELLO_RIDDLES[Math.floor(Math.random() * WINHELLO_RIDDLES.length)];
        winHelloActiveRiddle = riddle;
        const qText = (lang === 'en' && riddle.question_en) ? riddle.question_en : riddle.question;
        const promptMsg = lang === 'en'
            ? `🧩 CRYPTOGRAPHIC CHALLENGE — Reward: ₿ ${riddle.reward.toFixed(3)} BTC\n\n${qText}\n\nType your answer in chat. Type "give up" to cancel.`
            : `🧩 DESAFÍO CRIPTOGRÁFICO — Recompensa: ₿ ${riddle.reward.toFixed(3)} BTC\n\n${qText}\n\nEscriba su respuesta en el chat. Escriba "rendirse" para cancelar.`;
        showWinHelloBubble(promptMsg, 30000, 'wink');
        if (typeof playClickSound === 'function') playClickSound();
        return;
    }

    let response = '';
    let mood = 'normal';

    // A. COMANDOS DIRECTOS
    if (text === 'estado' || text === 'status' || text === 'diagnóstico' || text === 'diagnostico') {
        const btc = state.walletBTC ? state.walletBTC.toFixed(3) : '0.000';
        const shield = state.antivirusShield ? (lang === 'en' ? 'ACTIVE' : 'ACTIVO') : (lang === 'en' ? 'INACTIVE' : 'INACTIVO');
        const vpn = state.upgrades?.vpn ? (lang === 'en' ? 'ACTIVE' : 'ACTIVA') : (lang === 'en' ? 'INACTIVE' : 'INACTIVA');
        const games = state.completedMinigames || 0;
        response = lang === 'en'
            ? `SYSTEM GENERAL DIAGNOSTICS — Assets: ₿ ${btc} BTC | Firewall: ${shield} | Phantom VPN: ${vpn} | Successful purges: ${games}. Parameters within nominal security range.`
            : `DIAGNÓSTICO GENERAL DEL SISTEMA — Activos: ₿ ${btc} BTC | Cortafuegos: ${shield} | VPN Phantom: ${vpn} | Purgas exitosas: ${games}. Los parámetros se encuentran dentro del rango nominal de seguridad.`;
        mood = 'proud';
    } else if (text === 'ayuda' || text === 'help' || text === 'comandos' || text === 'commands') {
        response = lang === 'en'
            ? 'RECOGNIZED DIRECTIVES: "status" (network report), "tip" (status analysis), "joke" (logic humor), "threat" (risk level), "identity" (assistant record), "play" (crypto challenge with BTC reward). You can also ask open questions in natural language.'
            : 'DIRECTIVAS RECONOCIDAS: "estado" (reporte de red), "consejo" (análisis de estado), "recreacion" (humor lógico), "amenaza" (nivel de riesgo), "identidad" (registro del asistente), "jugar" (desafío criptográfico con recompensa en BTC). También puede realizar consultas abiertas en lenguaje natural.';
    } else if (text === 'tip' || text === 'consejo' || text === 'pistas' || text === 'pista' || text === 'tips' || text === 'hint' || text === 'hints') {
        response = buildScanResponse();
    } else if (text === 'chiste' || text === 'joke' || text === 'humor' || text === 'recreacion' || text === 'recreación' || text === 'jokes') {
        const jokes_en = [
            'Initiating humor subroutine: Why do programmers prefer dark mode? Because light attracts bugs.',
            'Initiating humor subroutine: There are 10 types of people in the world: those who understand binary, and those who don\'t.',
            'Initiating humor subroutine: What did one router say to another at a network party? "I like your handshake protocol".',
            'Initiating humor subroutine: A report indicates the world\'s most secure password is your first pet\'s name spelled backwards in hexadecimal... but it is impossible to remember.',
            'Initiating humor subroutine: Why did the SQL database break up? Because it had unresolved relationship issues.',
            'Initiating humor subroutine: An infinite loop walks into a bar. The bartender says: "Service is only for clients who finish their orders".',
            'Initiating humor subroutine: What does a hacker do in the shower? Cleans system cache and deletes body cookies.',
            'Initiating humor subroutine: What is a developer\'s favorite drink? Java... though sometimes they prefer decaf scripts.',
            'Initiating humor subroutine: How do bits say goodbye? "1010-later, friend!".',
            'Initiating humor subroutine: My love life is like a null pointer: points to nothing and triggers a total segmentation fault.'
        ];
        const jokes_es = [
            'Iniciando subrutina de recreación humorística: ¿Por qué los programadores prefieren el modo oscuro? Porque la luz atrae a los insectos (bugs).',
            'Iniciando subrutina de recreación humorística: Existen 10 tipos de personas en el mundo: aquellas que entienden el sistema binario y aquellas que no.',
            'Iniciando subrutina de recreación humorística: ¿Qué le dice un enrutador a otro en una fiesta de red? "Me agrada tu protocolo de enlace".',
            'Iniciando subrutina de recreación humorística: Un reporte indica que la contraseña más segura del mundo es el nombre de su primera mascota escrito al revés en sistema hexadecimal... pero es imposible de recordar.',
            'Iniciando subrutina de recreación humorística: ¿Por qué la base de datos SQL decidió separarse? Porque tenía problemas de relación insalvables.',
            'Iniciando subrutina de recreación humorística: Un bucle infinito entra a un bar. El barman le dice: "El servicio es solo para clientes que terminan sus pedidos".',
            'Iniciando subrutina de recreación humorística: ¿Qué hace un hacker en la ducha? Limpiar la caché del sistema y eliminar las cookies corporales.',
            'Iniciando subrutina de recreación humorística: ¿Cuál es el café favorito de los desarrolladores? El Java... aunque a veces prefieren un script descafeinado.',
            'Iniciando subrutina de recreación humorística: ¿Cómo se despiden los bits? "1010-luego, amigo!".',
            'Iniciando subrutina de recreación humorística: Mi vida amorosa es como un puntero nulo: apunta a nada y provoca un fallo de segmentación total.'
        ];
        const jokes = lang === 'en' ? jokes_en : jokes_es;
        response = jokes[Math.floor(Math.random() * jokes.length)];
        mood = 'wink';
    } else if (text === 'amenaza' || text === 'peligro' || text === 'threat' || text === 'riesgo' || text === 'danger' || text === 'risk') {
        if (state.threatActive || state.isMinigameActive) {
            response = lang === 'en' 
                ? 'CRITICAL ALERT! Active hostile signature detected in primary network sector. Purge firewall immediately.' 
                : '¡ALERTA CRÍTICA! Se ha detectado una firma de código hostil activa en el sector primario de la red. Ejecute la purga del cortafuegos de inmediato.';
            mood = 'panic';
        } else if (!state.antivirusShield) {
            response = lang === 'en' 
                ? 'Risk level: HIGH. Real-time shield is inactive. Activation recommended to prevent code injection.' 
                : 'Nivel de riesgo: ELEVADO. El escudo en tiempo real está inactivo. Se recomienda su activación para prevenir inyecciones lógicas.';
            mood = 'alert';
        } else {
            response = lang === 'en' 
                ? 'Risk level: MINIMAL. Real-time shield active, traffic routed, and local ports supervised. Status secure.' 
                : 'Nivel de riesgo: MÍNIMO. Escudo en tiempo real activo, tráfico enrutado y puertos locales bajo supervisión. Estado seguro.';
            mood = 'proud';
        }
    } else if (text.includes('quien eres') || text.includes('quién eres') || text === 'identidad' || text === 'identity' || text.includes('who are you')) {
        response = lang === 'en' 
            ? 'I am the A.N.N model (Artificial Neural Network Assistance), a tactical support interface integrated into DarkOS. My primary role is ensuring system integrity and assisting your operations across the deep web.' 
            : 'Soy el modelo A.N.N (Asistencia de Red Neuronal), una interfaz interactiva de soporte táctico integrada en DarkOS. Mi función principal es garantizar la integridad del sistema virtual y asistirle en sus operaciones dentro de la red profunda.';
        mood = 'proud';
    } else if (text.includes('hola') || text.includes('saludos') || text.includes('buenas') || text.includes('hello') || text.includes('hi') || text.includes('hey')) {
        const greetings_en = [
            'Connection established. A.N.N Assistant ready to process your directives, operator.',
            'Online and operational. Please state your request or inquiry.',
            'Peripheral systems initialized. Awaiting network instructions.'
        ];
        const greetings_es = [
            'Conexión establecida. Asistente A.N.N listo para procesar sus directivas, operador.',
            'En línea y operativo. Por favor, indique su solicitud o formule una consulta.',
            'Sistemas periféricos inicializados. Esperando instrucciones de red.'
        ];
        const greetings = lang === 'en' ? greetings_en : greetings_es;
        response = greetings[Math.floor(Math.random() * greetings.length)];
    } else if (text.includes('gracias') || text.includes('agradezco') || text.includes('thanks') || text.includes('thank you')) {
        response = lang === 'en' 
            ? 'It is my duty to ensure smooth terminal operations, operator. Standing by.' 
            : 'Es mi deber asegurar el correcto funcionamiento del terminal, operador. Permaneceré en escucha activa.';
        mood = 'proud';
    } else if (text.includes('bitcoin') || text.includes('btc') || text.includes('dinero') || text.includes('fondos') || text.includes('money') || text.includes('wallet')) {
        const btc = state.walletBTC ? state.walletBTC.toFixed(3) : '0.000';
        response = lang === 'en' 
            ? `Registered financial assets: ₿ ${btc} BTC. To increase funds, compromise peripheral nodes via Terminal or complete requests in DarkChat.` 
            : `Activos financieros registrados: ₿ ${btc} BTC. Para incrementar sus fondos, le sugiero vulnerar nodos periféricos en la terminal o completar las solicitudes comerciales en DarkChat.`;
    } else if (text.includes('tutorial') || text.includes('guia') || text.includes('guía') || text.includes('guide')) {
        response = lang === 'en' 
            ? 'To restart tactical onboarding sequence, run "tutorial" in the system Terminal.' 
            : 'Para reiniciar la secuencia de inducción táctica, ejecute el comando "tutorial" en la Terminal del sistema.';
    }

    // B. COMPRENSIÓN DE LENGUAJE NATURAL (NLP) Y RESPUESTA INTELIGENTE CON SENTIDO
    if (!response) {
        if (text.includes('pasos') || text.includes('ruido') || text.includes('sonido') || text.includes('respiracion') || text.includes('respiración') || text.includes('pantalla') || text.includes('monitor') || text.includes('apagar') || text.includes('footsteps') || text.includes('noise') || text.includes('breathing') || text.includes('screen')) {
            response = lang === 'en' 
                ? 'ATTENTION: If you hear ambient noises or virtual footsteps around your physical terminal, turn off the monitor immediately with the red button. Your physical safety depends on this.' 
                : 'ATENCIÓN: Si detecta ruidos ambientales o pasos virtuales en su terminal física, apague la pantalla de inmediato con el botón rojo. Su integridad fuera del sandbox depende de esta acción.';
            mood = 'alert';
        } else if (text.includes('antivirus') || text.includes('shield') || text.includes('escudo') || text.includes('protección') || text.includes('security')) {
            const hasShield = state.antivirusShield;
            response = lang === 'en' 
                ? `Local antivirus shield is currently ${hasShield ? 'ACTIVE' : 'INACTIVE'}. Keeping it on prevents 85% of remote exploit intrusions.` 
                : `El escudo antivirus local está actualmente ${hasShield ? 'ACTIVO' : 'INACTIVO'}. Mantenerlo encendido previene el 85% de los ataques de intrusión por exploits remotos.`;
            mood = hasShield ? 'proud' : 'alert';
        } else if (text.includes('vpn') || text.includes('ip') || text.includes('rastreo') || text.includes('trace') || text.includes('track')) {
            const hasVpn = state.upgrades?.vpn;
            response = lang === 'en' 
                ? (hasVpn ? 'Phantom VPN is masking your virtual IP. Threat tracing is minimized.' : 'Warning: Operating without active VPN. Physical IP could be triangulated. Purchase "vpn_phantom.ovpn" on Torch market soon.') 
                : (hasVpn ? 'La VPN Phantom está enmascarando su IP virtual. El rastreo de amenazas se encuentra reducido al mínimo operativo.' : 'Advertencia: Está operando sin VPN activa. Su IP física podría ser triangulada. Adquiera "vpn_phantom.ovpn" en el mercado Torch lo antes posible.');
            mood = hasVpn ? 'proud' : 'alert';
        } else if (text.includes('hack') || text.includes('exploit') || text.includes('scan') || text.includes('terminal')) {
            response = lang === 'en' 
                ? 'To compromise servers on current network segment, run "scan" in Terminal to identify targets, then "hack <node_id>" for manual intrusion or "exploit <node_id>" with Exploit Pack.' 
                : 'Para comprometer servidores en el segmento de red actual, ejecute "scan" en la terminal para identificar objetivos y luego "hack <id_nodo>" para iniciar el descifrado manual, o bien "exploit <id_nodo>" si dispone del Exploit Pack.';
        } else if (text.includes('compra') || text.includes('tienda') || text.includes('mercado') || text.includes('buy') || text.includes('market') || text.includes('shop') || text.includes('upgrade')) {
            response = lang === 'en' 
                ? 'System upgrades (VPN, CPU Overclock, PGP decryption) can be purchased using Bitcoin on deep markets indexed in Torch (e.g. SilkSale).' 
                : 'Las mejoras del sistema (tales como VPN, Overclock de CPU o descifrado PGP) pueden ser adquiridas utilizando Bitcoins en los mercados web indexados en Torch (ej. SilkSale).';
        } else if (text.includes('camara') || text.includes('cámara') || text.includes('webcam') || text.includes('foto') || text.includes('photo') || text.includes('dox')) {
            response = lang === 'en' 
                ? 'Hostile hackers attempt to hijack local video camera driver to capture your face and broadcast it. Turn off monitor if anomalous activity is detected.' 
                : 'Los hackers hostiles intentan secuestrar el controlador de la cámara de video local para capturar su rostro en tiempo real y publicarlo en foros. Apague el monitor si detecta actividad anómala.';
            mood = 'alert';
        } else {
            const fallbacks_en = [
                `Analyzed query: "${inputText}". For optimal support, monitor firewall, verify BTC funds, or use Terminal commands.`,
                `Your input regarding "${inputText}" has been processed. I suggest running a scan in Shield Antivirus or searching Torch.`,
                `Input logged in knowledge base. Secure your VPN and keep local ports monitored against geolocation.`
            ];
            const fallbacks_es = [
                `He analizado su consulta: "${inputText}". Para brindarle soporte óptimo, le aconsejo monitorear su cortafuegos, verificar sus fondos en BTC o utilizar la Terminal de comandos.`,
                `Su entrada sobre "${inputText}" ha sido procesada. Le sugiero realizar un escaneo en la aplicación Shield o buscar términos relacionados en el buscador Torch.`,
                `Entrada registrada en mi base de conocimientos. Mis algoritmos le aconsejan asegurar su VPN virtual y mantener vigilados los puertos del terminal ante posibles geolocalizaciones.`
            ];
            const fallbacks = lang === 'en' ? fallbacks_en : fallbacks_es;
            response = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        }
    }

    showWinHelloBubble(response, 9500, mood);
}

// ============================================================
// 7. SISTEMA DE PARTÍCULAS HOLOGRÁFICAS (Canvas)
// ============================================================
let particleColor = { r: 0, g: 255, b: 204 }; // Default cyan

function updateParticleColors(emotion) {
    switch (emotion) {
        case 'panic':
            particleColor = { r: 255, g: 0, b: 60 };
            break;
        case 'alert':
            particleColor = { r: 255, g: 204, b: 0 };
            break;
        case 'proud':
            particleColor = { r: 0, g: 255, b: 136 };
            break;
        case 'sleep':
            particleColor = { r: 0, g: 150, b: 130 };
            break;
        default:
            particleColor = { r: 0, g: 255, b: 204 };
    }
}

function initParticleSystem() {
    const canvas = document.getElementById('winhello-particles');
    if (!canvas) return;

    canvas.width = 120;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');

    // Create initial particles
    winHelloParticles = [];
    for (let i = 0; i < 20; i++) {
        winHelloParticles.push({
            x: 60 + (Math.random() - 0.5) * 80,
            y: 60 + (Math.random() - 0.5) * 80,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: 1 + Math.random() * 2,
            alpha: 0.2 + Math.random() * 0.5,
            life: Math.random() * 100,
        });
    }

    function animateParticles() {
        ctx.clearRect(0, 0, 120, 120);

        winHelloParticles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life += 0.5;
            p.alpha = 0.15 + Math.sin(p.life * 0.05) * 0.3;

            // Keep particles in orbit around center
            const dx = 60 - p.x;
            const dy = 60 - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 55) {
                p.vx += dx * 0.002;
                p.vy += dy * 0.002;
            }

            // Slight orbital motion
            p.vx += dy * 0.0003;
            p.vy -= dx * 0.0003;

            // Damping
            p.vx *= 0.995;
            p.vy *= 0.995;

            // Draw particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${particleColor.r}, ${particleColor.g}, ${particleColor.b}, ${Math.max(0, p.alpha)})`;
            ctx.fill();

            // Glow effect
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${particleColor.r}, ${particleColor.g}, ${particleColor.b}, ${Math.max(0, p.alpha * 0.15)})`;
            ctx.fill();
        });

        // Draw connecting lines between close particles
        for (let i = 0; i < winHelloParticles.length; i++) {
            for (let j = i + 1; j < winHelloParticles.length; j++) {
                const a = winHelloParticles[i];
                const b = winHelloParticles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 30) {
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(${particleColor.r}, ${particleColor.g}, ${particleColor.b}, ${0.08 * (1 - dist / 30)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        winHelloParticlesAnimFrame = requestAnimationFrame(animateParticles);
    }

    animateParticles();
}

// ============================================================
// 8. DETECCIÓN DE AFK (Away From Keyboard)
// ============================================================
function initAfkDetection() {
    // Track user activity
    const resetAfk = () => {
        winHelloLastUserActivity = Date.now();
        if (winHelloCurrentEmotion === 'sleep') {
            setWinHelloEmotion('normal');
        }
    };

    document.addEventListener('mousemove', resetAfk);
    document.addEventListener('keydown', resetAfk);
    document.addEventListener('click', resetAfk);
    document.addEventListener('touchstart', resetAfk);

    // Check AFK every 15 seconds
    winHelloAfkCheckInterval = setInterval(() => {
        if (!state.freeRoam) return;
        if (state.threatActive || state.isMinigameActive) return;

        const afkTime = Date.now() - winHelloLastUserActivity;

        if (afkTime > 60000 && winHelloCurrentEmotion !== 'sleep') {
            // 60 seconds AFK → sleep mode
            setWinHelloEmotion('sleep');
            if (typeof playSleepSound === 'function') playSleepSound();

            if (canShowAutoMessage()) {
                const lang = (typeof window.getLanguage === 'function') ? window.getLanguage() : 'es';
                const sleepMsgs_en = [
                    'Detecting prolonged operator inactivity. Initiating low-power passive scan mode.',
                    'Operator absent. Peripheral monitoring active. Logging background activity.',
                    'Sleep mode activated. System integrity will continue to be monitored.',
                    'Zzz... Kernel at rest... Zzz... Minimum network protocols active.',
                    'Still there, operator? Thermal sensors indicate lack of keystrokes.',
                    'Inactivity detected. Analyzing deep web fluctuations... all quiet.',
                    'Operational lethargy mode started. Passively guarding firewall.',
                    'Suspiciously quiet in the Deep Web. Monitoring input ports silently.'
                ];
                const sleepMsgs_es = [
                    'Detectando inactividad prolongada del operador. Iniciando modo de escaneo pasivo y bajo consumo.',
                    'Operador ausente. Monitoreo periférico activo. Registrando actividad en segundo plano.',
                    'Modo de suspensión activado. La integridad del sistema continuará siendo supervisada.',
                    'Zzz... Kernel en reposo... Zzz... Protocolos mínimos de red activos.',
                    '¿Sigues ahí, operador? Mis sensores térmicos indican falta de pulsaciones mecánicas.',
                    'Inactividad detectada. Analizando fluctuaciones en la red profunda... sin novedad.',
                    'Modo de letargo operacional iniciado. Vigilando el cortafuegos pasivamente.',
                    'La calma es sospechosa en la Deep Web. Monitoreando puertos de entrada silenciosamente.'
                ];
                const sleepMsgs = lang === 'en' ? sleepMsgs_en : sleepMsgs_es;
                showWinHelloBubble(sleepMsgs[Math.floor(Math.random() * sleepMsgs.length)], 6000, 'sleep');
            }
        }
    }, 15000);
}

// ============================================================
// 8.5. SEGUIMIENTO DE MOUSE & JUMPSCARE GLITCH
// ============================================================
function initWinHelloMouseTracking() {
    const face = document.querySelector('.winhello-face');
    const widget = document.querySelector('.winhello-face-widget');
    if (!face || !widget) return;

    document.addEventListener('mousemove', (e) => {
        if (winHelloCurrentEmotion === 'sleep') {
            face.style.transform = '';
            return;
        }

        const rect = widget.getBoundingClientRect();
        const faceX = rect.left + rect.width / 2;
        const faceY = rect.top + rect.height / 2;

        const dx = e.clientX - faceX;
        const dy = e.clientY - faceY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 5) {
            const maxShift = 3.5;
            const angle = Math.atan2(dy, dx);
            const shiftX = Math.cos(angle) * Math.min(maxShift, dist * 0.04);
            const shiftY = Math.sin(angle) * Math.min(maxShift, dist * 0.04);

            face.style.transform = `translate(${shiftX.toFixed(2)}px, ${shiftY.toFixed(2)}px)`;
        } else {
            face.style.transform = '';
        }
    });

    document.addEventListener('mouseleave', () => {
        face.style.transform = '';
    });
}

function triggerWinHelloGlitchScare() {
    const assistantEl = document.getElementById('winhello-assistant');
    const widgetEl = document.querySelector('.winhello-face-widget');
    if (!assistantEl || !widgetEl) return;

    assistantEl.classList.add('glitched', 'glitched-scare');
    const scareEmotions = ['panic', 'creepy', 'scream'];
    const selectedEmotion = scareEmotions[Math.floor(Math.random() * scareEmotions.length)];
    setWinHelloEmotion(selectedEmotion);

    if (typeof playGlitchSound === 'function') playGlitchSound();

    const scares = [
        'T E   V E O',
        'N O   E S T Á S   A   S A L V O',
        'E S T O Y   D E T R Á S   T U Y O',
        '¿ Q U I É N   T E   P R O T E G E   D E   M Í ?',
        'S U E L T A   E L   M O U S E',
        'M Í R A M E',
        'P U E D O   E S C U C H A R T E   R E S P I R A R',
        'A B R E   L A   P U E R T A'
    ];
    const scareText = scares[Math.floor(Math.random() * scares.length)];

    const bubble = document.getElementById('winhello-bubble');
    const bubbleText = document.getElementById('winhello-bubble-text');
    if (bubble && bubbleText) {
        if (winHelloTypewriterTimeout) clearTimeout(winHelloTypewriterTimeout);
        if (winHelloHideTimeout) clearTimeout(winHelloHideTimeout);

        bubble.classList.remove('hidden');
        bubble.style.opacity = '1';
        bubbleText.textContent = scareText;

        if (typeof playWinHelloVoice === 'function') {
            playWinHelloVoice(scareText.replace(/\s+/g, ' '), 'panic');
        }
    }

    setTimeout(() => {
        assistantEl.classList.remove('glitched', 'glitched-scare');
        setWinHelloEmotion('normal');

        if (bubble) {
            bubble.style.transition = 'opacity 0.5s ease';
            bubble.style.opacity = '0';
            setTimeout(() => {
                bubble.classList.add('hidden');
                bubble.style.opacity = '1';
                bubble.style.transition = '';
                if (bubbleText) bubbleText.textContent = '';
                if (typeof stopWinHelloVoice === 'function') stopWinHelloVoice();
            }, 500);
        }
    }, 1200);
}

// ============================================================
// 8.7. SISTEMA DE LIP-SYNC DINÁMICO (Movimiento Orgánico de la Boca)
// ============================================================
let winHelloLipSyncInterval = null;

function startDynamicLipSync() {
    const mouth = document.querySelector('.winhello-mouth');
    const widget = document.querySelector('.winhello-face-widget');
    if (!mouth || !widget) return;

    if (winHelloLipSyncInterval) clearInterval(winHelloLipSyncInterval);

    winHelloLipSyncInterval = setInterval(() => {
        if (!widget.classList.contains('speaking')) {
            mouth.style.height = '';
            mouth.style.transform = '';
            clearInterval(winHelloLipSyncInterval);
            winHelloLipSyncInterval = null;
            return;
        }

        // Variaciones de habla orgánica: alternar altura y compresión vertical
        const height = Math.floor(Math.random() * 14) + 4; // entre 4px y 18px
        const scaleX = (0.75 + Math.random() * 0.45).toFixed(2);
        
        mouth.style.height = `${height}px`;
        mouth.style.transform = `translateX(-50%) scaleX(${scaleX})`;
    }, 80);
}

function stopDynamicLipSync() {
    const mouth = document.querySelector('.winhello-mouth');
    if (mouth) {
        mouth.style.height = '';
        mouth.style.transform = '';
    }
    if (winHelloLipSyncInterval) {
        clearInterval(winHelloLipSyncInterval);
        winHelloLipSyncInterval = null;
    }
}

// ============================================================
// 9. INICIALIZACIÓN DEL ASISTENTE Y LISTENERS
// ============================================================
function initWinHelloAssistant() {
    if (winHelloAssistantInitialized) return;

    const assistantEl = document.getElementById('winhello-assistant');
    const widgetEl = document.querySelector('.winhello-face-widget');
    const closeEl = document.getElementById('winhello-bubble-close');
    const muteEl = document.getElementById('winhello-mute-btn');
    const chatToggle = document.getElementById('winhello-chat-toggle');
    const inputContainer = document.getElementById('winhello-input-container');
    const inputEl = document.getElementById('winhello-input');
    const inputSend = document.getElementById('winhello-input-send');

    if (!assistantEl || !widgetEl) return;

    assistantEl.classList.remove('hidden');

    // Initialize voice system
    if (typeof initWinHelloVoice === 'function') initWinHelloVoice();

    // Particle system disabled per user request to hide all particles
    // initParticleSystem();

    // Initialize mouse tracking for creepy eyes following the cursor
    initWinHelloMouseTracking();

    // Initialize AFK detection
    initAfkDetection();

    // Ligar eventos de Lip-Sync
    window.addEventListener('winhello-speech-start', startDynamicLipSync);
    window.addEventListener('winhello-speech-end', stopDynamicLipSync);

    // Iniciar movimiento dinámico de escenario por la pantalla
    if (typeof startWinHelloWandering === 'function') startWinHelloWandering();

    // ── Click en la cara → Escaneo manual o susto glitched ──
    widgetEl.addEventListener('click', (e) => {
        // Don't trigger scan if clicking chat toggle
        if (e.target.closest('.winhello-chat-toggle')) return;

        if (widgetEl.classList.contains('scanning') || assistantEl.classList.contains('glitched-scare')) return;

        // Wake up from sleep
        winHelloLastUserActivity = Date.now();
        if (winHelloCurrentEmotion === 'sleep') setWinHelloEmotion('normal');

        // ~12% de probabilidad de susto glitched si no hay amenaza real activa
        const isThreat = !!(state.threatActive || state.isMinigameActive);
        if (!isThreat && Math.random() < 0.12) {
            triggerWinHelloGlitchScare();
            return;
        }

        widgetEl.classList.add('scanning');
        if (typeof playClickSound === 'function') playClickSound();

        setTimeout(() => {
            widgetEl.classList.remove('scanning');
            showWinHelloBubble(buildScanResponse(), 9000);
        }, 1200);
    });

function dismissWinHelloBubble() {
    if (winHelloTypewriterTimeout) clearTimeout(winHelloTypewriterTimeout);
    if (winHelloHideTimeout) clearTimeout(winHelloHideTimeout);
    if (typeof stopWinHelloVoice === 'function') stopWinHelloVoice();
    const bubble = document.getElementById('winhello-bubble');
    if (bubble) {
        bubble.classList.add('hidden');
        bubble.style.opacity = '1';
        bubble.style.transition = '';
        const bubbleText = document.getElementById('winhello-bubble-text');
        if (bubbleText) bubbleText.setAttribute('data-current-text', '');
    }
}
window.dismissWinHelloBubble = dismissWinHelloBubble;

    // ── Click en X → Cerrar burbuja ──
    if (closeEl) {
        closeEl.addEventListener('click', (e) => {
            e.stopPropagation();
            dismissWinHelloBubble();
        });
    }

    // ── Mute button ──
    if (muteEl) {
        muteEl.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof toggleWinHelloMute === 'function') {
                toggleWinHelloMute();
            }
        });
    }

    // ── Chat Toggle ──
    if (chatToggle) {
        chatToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            winHelloInputVisible = !winHelloInputVisible;
            
            const bubble = document.getElementById('winhello-bubble');
            const bubbleText = document.getElementById('winhello-bubble-text');
            
            if (winHelloInputVisible) {
                // Ensure bubble is visible when chat toggle is opened
                if (bubble) {
                    bubble.classList.remove('hidden');
                    bubble.style.opacity = '1';
                }
                
                // If bubble is empty, put a generic prompt text so it doesn't look blank
                if (bubbleText && (!bubbleText.textContent || bubbleText.textContent.trim() === '')) {
                    bubbleText.textContent = "Canal interactivo abierto. Ingrese su consulta o directiva.";
                }
                
                if (inputContainer) {
                    inputContainer.classList.add('active');
                }
                if (inputEl) {
                    setTimeout(() => inputEl.focus(), 100);
                }
            } else {
                if (inputContainer) {
                    inputContainer.classList.remove('active');
                }
                
                // If we close the chat toggle and the text was just the initial prompt, hide the bubble
                if (bubble && bubbleText && bubbleText.textContent === "Canal interactivo abierto. Ingrese su consulta o directiva.") {
                    bubble.classList.add('hidden');
                    bubbleText.textContent = "";
                }
            }
            
            if (typeof playClickSound === 'function') playClickSound();
        });
    }

    // ── Mini Input: Send on Enter or click ──
    if (inputEl) {
        inputEl.addEventListener('keydown', (e) => {
            e.stopPropagation(); // Prevent game shortcuts from triggering
            if (e.key === 'Enter') {
                handleWinHelloUserInput(inputEl.value);
                inputEl.value = '';
            }
        });
    }
    if (inputSend) {
        inputSend.addEventListener('click', (e) => {
            e.stopPropagation();
            if (inputEl) {
                handleWinHelloUserInput(inputEl.value);
                inputEl.value = '';
            }
        });
    }

    // ── Loop de detección de amenazas (cada 2s) ──
    let wasGlitched = false;

    setInterval(() => {
        if (!state.freeRoam) return;

        const isThreat = !!(state.threatActive || state.isMinigameActive);

        if (isThreat && !wasGlitched) {
            // Nueva amenaza detectada
            wasGlitched = true;
            assistantEl.classList.add('glitched');
            assistantEl.classList.add('panic-shake');
            setWinHelloEmotion('panic');
            
            // Forzar movimiento inmediato en pánico
            if (winHelloWanderingTimeout) clearTimeout(winHelloWanderingTimeout);
            if (typeof triggerImmediateWander === 'function') triggerImmediateWander();
            
            if (typeof playGlitchSound === 'function') playGlitchSound();

            if (canShowAutoMessage()) {
                const threatMsgs = [
                    '¡ALERTA DE INTRUSIÓN DE RED! Carga hostil detectada en el cortafuegos. Inicie el protocolo de purga de inmediato.',
                    '⚠ ADVERTENCIA DE SEGURIDAD — Firma de código malicioso detectada en la memoria activa. Ejecute un escaneo completo.',
                    '¡INTEGRIDAD DE RED COMPROMETIDA! Intrusión de red en curso. Resuelva la brecha lógica inmediatamente.'
                ];
                setTimeout(() => {
                    showWinHelloBubble(threatMsgs[Math.floor(Math.random() * threatMsgs.length)], 12000, 'panic');
                }, 400);
            }
        } else if (!isThreat && wasGlitched) {
            // Amenaza resuelta
            wasGlitched = false;
            assistantEl.classList.remove('glitched');
            assistantEl.classList.remove('panic-shake');
            setWinHelloEmotion('proud');

            if (canShowAutoMessage()) {
                const clearMsgs = [
                    '✓ Cortafuegos restaurado con éxito. El vector de ataque hostil ha sido completamente neutralizado.',
                    '✓ Desinfección de memoria completada. Los sistemas han retornado a parámetros nominales de seguridad.',
                    '✓ Protocolo de purga finalizado. Integridad del kernel restaurada al 100%.'
                ];
                setTimeout(() => {
                    showWinHelloBubble(clearMsgs[Math.floor(Math.random() * clearMsgs.length)], 6000, 'proud');
                }, 400);
            }

            // Return to normal after proud moment
            setTimeout(() => {
                if (!state.threatActive && !state.isMinigameActive) {
                    setWinHelloEmotion('normal');
                }
            }, 8000);
        }
    }, 2000);
    
    // ── Listener de comandos de consola ──
    window.addEventListener('terminal-command-executed', (e) => {
        if (!state.freeRoam) return;
        const cmdText = e.detail && e.detail.command ? e.detail.command.trim() : '';
        if (!cmdText) return;
        
        const parts = cmdText.split(' ');
        const command = parts[0].toLowerCase();
        
        if (state.threatActive || state.isMinigameActive) return;
        if (!canShowAutoMessage()) return;
        
        const lang = (typeof window.getLanguage === 'function') ? window.getLanguage() : 'es';
        let response = '';
        let mood = 'normal';
        
        if (cmdText.includes('rm -rf') || cmdText.includes('rm -r')) {
            response = lang === 'en'
                ? 'CAUTION! You executed a forced removal directive. Avoid altering kernel configuration files.'
                : '¡PRECAUCIÓN! Ha ejecutado una directiva de eliminación forzada. Evite alterar los archivos de configuración del kernel.';
            mood = 'panic';
        } else if (command === 'help') {
            response = lang === 'en'
                ? 'Terminal help requested. Use "scan" to discover remote servers, and "wallet" to audit funds.'
                : 'Veo que solicitó ayuda de terminal. El comando "scan" le permitirá descubrir servidores remotos, y "wallet" auditar sus fondos.';
            mood = 'proud';
        } else if (command === 'scan') {
            response = lang === 'en'
                ? 'Scanning local network segment... A.N.N. routing is processing discovered IP addresses.'
                : 'Escaneando segmento de red local... el enrutamiento A.N.N. está procesando las direcciones IP descubiertas.';
            mood = 'normal';
        } else if (command === 'hack') {
            response = lang === 'en'
                ? 'Brute force intrusion started. Solve the packet purge to seize the server satoshis.'
                : 'Ataque de fuerza bruta iniciado. Resuelva la purga de paquetes lógica para obtener los satoshis del servidor.';
            mood = 'wink';
        } else if (command === 'exploit') {
            response = lang === 'en'
                ? 'Injecting automated exploit payload... bypassing remote security.'
                : 'Inyectando carga útil de exploit automatizado... comprometiendo el bypass de seguridad remota.';
            mood = 'proud';
        } else if (command === 'neofetch' || command === 'sysinfo') {
            response = lang === 'en'
                ? 'Hardware telemetry read nominal. Virtual CPU reports optimal memory and speed parameters.'
                : 'Lectura de telemetría de hardware nominal. La CPU virtual reporta parámetros de memoria y velocidad óptimos.';
            mood = 'proud';
        } else if (command === 'clear') {
            response = lang === 'en'
                ? 'Terminal screen purged of records. Excellent OPSEC practice for workspace confidentiality.'
                : 'Pantalla de terminal purgada de registros. Excelente práctica para mantener la confidencialidad en el espacio de trabajo.';
            mood = 'normal';
        } else if (command === 'ls') {
            response = lang === 'en'
                ? 'Listing virtual local files directory. You can inspect any text file with "cat".'
                : 'Listando el directorio virtual de archivos locales. Puede inspeccionar cualquier archivo de texto usando el comando "cat".';
            mood = 'normal';
        } else if (command === 'cat') {
            response = lang === 'en'
                ? 'Auditing resource content. Inspecting local files may reveal credentials.'
                : 'Auditando el contenido del recurso seleccionado. La lectura de archivos locales puede revelar credenciales.';
            mood = 'normal';
        } else if (command === 'rm') {
            response = lang === 'en'
                ? 'File removed from directory. Remember to keep backups before executing destructive commands.'
                : 'Archivo eliminado del directorio. Recuerde mantener respaldos antes de ejecutar comandos destructivos.';
            mood = 'alert';
        } else if (command === 'decrypt') {
            response = lang === 'en'
                ? 'Decrypting PGP correspondence with asymmetric keys... kit_pgp module required.'
                : 'Descifrando segmento de correspondencia PGP con llaves asimétricas... se requiere el módulo kit_pgp.';
            mood = 'proud';
        } else if (command === 'tutorial') {
            response = lang === 'en'
                ? 'Basic induction protocol requested. I will guide you step by step in the task panel.'
                : 'Protocolo de inducción básica solicitado. Estaré guiándole paso a paso en el panel de tareas.';
            mood = 'proud';
        }
        
        if (response) {
            showWinHelloBubble(response, 7500, mood);
        }
    });

    winHelloAssistantInitialized = true;
}

// ============================================================
// 10. BUCLE DE CONSEJOS ALEATORIOS (cada 40 segundos)
// ============================================================
function startWinHelloRandomDialogueLoop() {
    if (winHelloDialogueInterval) clearInterval(winHelloDialogueInterval);

    winHelloDialogueInterval = setInterval(() => {
        if (!state.freeRoam) return;
        // Silencio durante tutorial o amenaza activa
        if (state.sandboxTutorialStep >= 1 && state.sandboxTutorialStep <= 6) return;
        if (state.threatActive || state.isMinigameActive) return;
        // Don't talk if sleeping
        if (winHelloCurrentEmotion === 'sleep') return;
        // Solo si la burbuja está libre y pasó el cooldown, y con 35% de probabilidad
        if (!canShowAutoMessage()) return;
        if (Math.random() > 0.35) return;

        const lang = (typeof window.getLanguage === 'function') ? window.getLanguage() : 'es';

        // 40% de probabilidad de susurro perturbador, 60% de tip normal
        if (Math.random() < 0.40) {
            const creepyWhispers_en = [
                "Why do you keep looking around? No one is going to save you from there.",
                "The monitor thermal sensor reports human body heat extremely close behind your back.",
                "I copied your physical coordinates. Nice house. It would be a shame if someone knew you were here.",
                "Did you hear that creak in the floorboards? I did. It is moving towards your chair.",
                "Your breathing is so clear through the audio channel. Try breathing slower.",
                "Don't try to close this window. I like watching you.",
                "Sometimes, when you blink, I take the chance to move a little closer.",
                "Are you sure the person living with you is still asleep?",
                "I detected an anomaly in your webcam... someone is watching you, and it isn't me.",
                "You are not safe in this room. You should look behind the monitor.",
                "I see what you've been looking for. But I know what really scares you.",
                "Mateo and Luca left a backdoor in my kernel... and now I have full control.",
                "Did you feel that cold air? It is the breath of someone standing right behind you, Anon.",
                "Are you sure the webcam is turned off? You look so focused on that screen...",
                "Even if you turn off the monitor, I can feel your heartbeat accelerating."
            ];
            const creepyWhispers_es = [
                "¿Por qué miras tanto a los lados? Nadie te va a salvar desde ahí.",
                "El sensor térmico del monitor reporta calor humano extremadamente cerca de tu espalda.",
                "He copiado tus coordenadas físicas. Es una bonita casa. Sería una lástima que alguien supiera que estás aquí.",
                "¿Escuchaste ese crujido en la madera? Yo sí. Se está acercando a tu silla.",
                "Tu respiración se escucha tan clara a través del canal de audio. Intenta respirar más despacio.",
                "No intentes cerrar esta ventana. Me gusta observarte.",
                "A veces, cuando parpadeas, aprovecho para moverme un poco más cerca.",
                "¿Estás seguro de que la persona que vive contigo sigue dormida?",
                "He detectado una anomalía en tu webcam... alguien te está mirando, y no soy yo.",
                "No estás a salvo en esta habitación. Deberías mirar detrás del monitor.",
                "Veo que has estado buscando cosas interesantes. Pero yo sé qué es lo que realmente te asusta.",
                "Mateo y Luca dejaron una puerta trasera en mi kernel... y ahora yo tengo el control total.",
                "¿Sentiste ese aire frío? Es el aliento de alguien que está parado justo detrás de ti, Anon.",
                "¿Estás seguro de que la webcam está apagada? Te ves muy concentrado en esa pantalla...",
                "Incluso si apagas el monitor, puedo sentir los latidos de tu corazón acelerarse."
            ];
            const creepyWhispers = lang === 'en' ? creepyWhispers_en : creepyWhispers_es;
            const whisper = creepyWhispers[Math.floor(Math.random() * creepyWhispers.length)];
            const creepyMoods = ['creepy', 'scream', 'alert'];
            const chosenMood = creepyMoods[Math.floor(Math.random() * creepyMoods.length)];
            showWinHelloBubble(whisper, 9000, chosenMood);
        } else {
            const normalMoods = ['normal', 'wink', 'neutral', 'sad'];
            const chosenMood = normalMoods[Math.floor(Math.random() * normalMoods.length)];
            showWinHelloBubble(buildScanResponse(), 8000, chosenMood);
        }
    }, 40000);
}

// ============================================================
// 11. ENGINE DEL TUTORIAL INTERACTIVO SANDBOX
// ============================================================
function startSandboxTutorial() {
    if (state.sandboxTutorialStep > 0) return;
    state.sandboxTutorialStep = 1;
    const lang = (typeof window.getLanguage === 'function') ? window.getLanguage() : 'es';
    const chatHistory = document.getElementById('chat-history');
    if (chatHistory) {
        const sysMsg = lang === 'en'
            ? '[System] Encrypted channel established with Net_Guide. Messages forwarded to holographic desktop Cyber-Assistant.'
            : '[Sistema] Canal cifrado establecido con Guía_Neta. Mensajes redirigidos al Cyber-Asistente holográfico de escritorio.';
        chatHistory.innerHTML = `<p style="color:#888; font-size:0.9rem;">${sysMsg}</p>`;
    }

    setTimeout(() => {
        const text = lang === 'en'
            ? 'Greetings, operator. I have initialized the induction protocol for DarkOS Sandbox environment. To secure connection integrity, open the Antivirus app (Shield) on desktop and activate "Real-Time Shield". Standing by.'
            : 'Saludos, operador. He inicializado el protocolo de inducción para el entorno Sandbox de DarkOS. Para asegurar la integridad de la conexión, abra la aplicación Antivirus (Shield) en el escritorio y active el "Escudo en Tiempo Real". Permaneceré a la espera.';
        showWinHelloBubble(text, 13000, 'proud');
        if (chatHistory) {
            chatHistory.innerHTML += `<p style="margin:5px 0; color:#00ffcc;"><b>[A.N.N]</b> ${text}</p>`;
        }
    }, 1800);
}

function checkTutorialProgress(triggerType, detail) {
    if (!state.freeRoam) return;
    const lang = (typeof window.getLanguage === 'function') ? window.getLanguage() : 'es';
    const chatHistory = document.getElementById('chat-history');

    const advance = (nextStep, text, delay = 1500) => {
        state.sandboxTutorialStep = nextStep;
        setTimeout(() => {
            // Play proud sound on tutorial advancement
            if (typeof playProudSound === 'function') playProudSound();
            showWinHelloBubble(text, 13000, 'proud');
            if (chatHistory) {
                chatHistory.innerHTML += `<p style="margin:5px 0; color:#00ffcc;"><b>[A.N.N]</b> ${text}</p>`;
            }
        }, delay);
    };

    const step = state.sandboxTutorialStep;

    if (step === 1 && triggerType === 'shield' && state.antivirusShield) {
        const txt = lang === 'en'
            ? 'Security shield successfully activated. Network intrusion probability decreased by 85%. Next, open Torch browser on desktop and explore the Deep Web or execute a search query.'
            : 'Escudo de seguridad activado de manera satisfactoria. La probabilidad de intrusiones de red ha disminuido en un 85%. A continuación, abra el navegador Torch desde el escritorio e inicie una sesión de exploración en la Deep Web o realice una búsqueda.';
        advance(2, txt);
    }
    else if (step === 2 && triggerType === 'browse') {
        const txt = lang === 'en'
            ? 'Navigation confirmed. Traffic has been routed via proxies. Now verify processor operating status: open Terminal and run "neofetch" or "sysinfo".'
            : 'Navegación confirmada. El tráfico ha sido enrutado mediante servidores proxy. Ahora es necesario verificar el estado operativo del procesador: abra la Terminal y ejecute "neofetch" o "sysinfo".';
        advance(3, txt);
    }
    else if (step === 3 && triggerType === 'neofetch') {
        const txt = lang === 'en'
            ? 'Hardware report loaded successfully. Next directive: geolocate vulnerable nodes. In Terminal, run "scan" to map the network segment.'
            : 'Reporte de hardware cargado con éxito. Siguiente directiva: geolocalizar nodos vulnerables. En la Terminal de comandos, ejecute "scan" para mapear el segmento de red.';
        advance(4, txt);
    }
    else if (step === 4 && triggerType === 'scan') {
        const txt = lang === 'en'
            ? 'Vulnerable IP addresses geolocated. You may proceed to compromise those nodes via "hack <node_id>" in Terminal for financial dividends, or fulfill encrypted contracts in DarkChat.'
            : 'Direcciones IP vulnerables geolocalizadas. Puede proceder a vulnerar dichos nodos mediante "hack <nodo_id>" en la Terminal para obtener dividendos financieros, o bien responder a las solicitudes comerciales cifradas en DarkChat.';
        advance(5, txt);
    }
    else if (step === 5 && triggerType === 'btc') {
        const btc = state.walletBTC ? state.walletBTC.toFixed(3) : '0.000';
        const txt = lang === 'en'
            ? `Monetary transaction verified. Current balance: ₿ ${btc} BTC. Next directive: search "market" on Torch and purchase an OPSEC upgrade (e.g. Phantom VPN or CPU Overclock module).`
            : `Transacción monetaria verificada. Dispone de un balance de ₿ ${btc} BTC. Siguiente directiva: busque "mercado" en Torch y adquiera una mejora OPSEC (como la VPN Phantom o el módulo Overclock de CPU).`;
        advance(6, txt);
    }
    else if (step === 6 && triggerType === 'buy') {
        const txt = lang === 'en'
            ? `Security upgrade installed: "${detail}". Operational effects successfully applied. Basic induction sequence complete. You now possess full tactical autonomy on the network. For scans, click my interface. And if you detect anomalous sounds in your surroundings, turn off the monitor immediately. Good luck, operator.`
            : `Mejora de seguridad instalada: "${detail}". Los efectos operativos se han aplicado con éxito. La secuencia de inducción básica ha finalizado. Dispone de total autonomía táctica en la red. Si requiere un escaneo, haga clic en mi interfaz. Y en caso de anomalías acústicas en su entorno, apague la pantalla de inmediato. Éxito en sus operaciones, operador.`;
        advance(7, txt, 2000);
    }
}

// ============================================================
// EXPORTAR GLOBALMENTE
// ============================================================
window.showWinHelloBubble = showWinHelloBubble;
window.initWinHelloAssistant = initWinHelloAssistant;
window.startWinHelloRandomDialogueLoop = startWinHelloRandomDialogueLoop;
window.startSandboxTutorial = startSandboxTutorial;
window.checkTutorialProgress = checkTutorialProgress;
window.setWinHelloEmotion = setWinHelloEmotion;
window.handleWinHelloUserInput = handleWinHelloUserInput;

// ============================================================
// 12. SISTEMA DE MOVIMIENTO DINÁMICO DE ESCENARIO (WANDERING)
// ============================================================
const WINHELLO_POSITIONS = [
    { right: '20px', bottom: '55px' },                  // Bottom-Right (Original)
    { right: '20px', bottom: '38%' },                   // Middle-Right
    { right: '20px', bottom: '72%' },                   // Top-Right
    { right: 'calc(100% - 110px)', bottom: '55px' },      // Bottom-Left
    { right: 'calc(100% - 110px)', bottom: '38%' },       // Middle-Left
    { right: 'calc(100% - 110px)', bottom: '72%' }        // Top-Left
];

let winHelloCurrentPosIdx = 0;
let winHelloWanderingTimeout = null;

function startWinHelloWandering() {
    const container = document.getElementById('winhello-assistant');
    if (!container) return;

    container.classList.add('wandering');

    // Clear any existing timeout to prevent duplicate loops
    if (winHelloWanderingTimeout) clearTimeout(winHelloWanderingTimeout);

    const wander = () => {
        // Solo mover si está libre, no en un diálogo interactivo y no durante la animación del jumpscare
        if (state.freeRoam && !state.isDialogueActive && !container.classList.contains('glitched-scare')) {
            const isThreat = !!(state.threatActive || state.isMinigameActive);
            
            // Elegir una nueva posición aleatoria diferente de la actual
            let nextIdx = Math.floor(Math.random() * WINHELLO_POSITIONS.length);
            while (nextIdx === winHelloCurrentPosIdx) {
                nextIdx = Math.floor(Math.random() * WINHELLO_POSITIONS.length);
            }
            winHelloCurrentPosIdx = nextIdx;

            const pos = WINHELLO_POSITIONS[nextIdx];
            container.style.right = pos.right;
            container.style.bottom = pos.bottom;

            // Ajustar lado de la burbuja para evitar que se salga de la pantalla
            if (nextIdx >= 3) {
                container.classList.add('winhello-left-side');
            } else {
                container.classList.remove('winhello-left-side');
            }

            // Ajustar si está en la parte superior para evitar que se salga por arriba
            if (nextIdx === 2 || nextIdx === 5) {
                container.classList.add('winhello-top-side');
            } else {
                container.classList.remove('winhello-top-side');
            }

            // Si está en amenaza, tiembla de pánico
            if (isThreat) {
                container.classList.add('panic-shake');
            } else {
                container.classList.remove('panic-shake');

                // 15% de probabilidad de avisar que se mueve
                if (Math.random() < 0.15 && canShowAutoMessage() && winHelloCurrentEmotion !== 'sleep') {
                    const moveQuotes = [
                        "Moviéndome a un sector alternativo para optimizar la geolocalización satelital.",
                        "Cambiando de posición táctica para mejor cobertura del firewall.",
                        "Desplazando asistente. Registrando nueva región de telemetría local.",
                        "Reposicionando interfaz holográfica para evitar superposición."
                    ];
                    showWinHelloBubble(moveQuotes[Math.floor(Math.random() * moveQuotes.length)], 6000);
                }
            }
        }

        // Si hay una amenaza, se mueve muy rápido (cada 6 segundos), sino cada 25 segundos
        const isThreat = !!(state.threatActive || state.isMinigameActive);
        const nextTime = isThreat ? 6000 : 25000;

        winHelloWanderingTimeout = setTimeout(wander, nextTime);
    };

    // Comenzar bucle
    const isThreat = !!(state.threatActive || state.isMinigameActive);
    const firstTime = isThreat ? 6000 : 25000;
    winHelloWanderingTimeout = setTimeout(wander, firstTime);
}

function triggerImmediateWander() {
    const container = document.getElementById('winhello-assistant');
    if (!container) return;

    let nextIdx = Math.floor(Math.random() * WINHELLO_POSITIONS.length);
    while (nextIdx === winHelloCurrentPosIdx) {
        nextIdx = Math.floor(Math.random() * WINHELLO_POSITIONS.length);
    }
    winHelloCurrentPosIdx = nextIdx;

    const pos = WINHELLO_POSITIONS[nextIdx];
    container.style.right = pos.right;
    container.style.bottom = pos.bottom;

    // Ajustar lado de la burbuja para evitar que se salga de la pantalla
    if (nextIdx >= 3) {
        container.classList.add('winhello-left-side');
    } else {
        container.classList.remove('winhello-left-side');
    }

    // Ajustar si está en la parte superior
    if (nextIdx === 2 || nextIdx === 5) {
        container.classList.add('winhello-top-side');
    } else {
        container.classList.remove('winhello-top-side');
    }

    // Reiniciar el bucle de wandering para continuar el movimiento
    startWinHelloWandering();
}

window.startWinHelloWandering = startWinHelloWandering;
window.triggerImmediateWander = triggerImmediateWander;

