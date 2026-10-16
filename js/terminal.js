// --- INTERACTIVE TERMINAL CLI & COMMAND HANDLERS ---

let terminalStep = 0;

function printTerminal(text, color="white") {
    const terminalHistory = document.getElementById('terminal-history');
    if (!terminalHistory) return;

    let p = document.createElement('p');
    p.style.color = color;
    p.style.margin = "2px 0";
    p.innerText = text;
    terminalHistory.appendChild(p);
    terminalHistory.scrollTop = terminalHistory.scrollHeight;
}

function handleFreeRoamTerminalCommand(cmdText) {
    const parts = cmdText.split(' ');
    const command = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ');
    const terminalHistory = document.getElementById('terminal-history');
    const lang = (typeof window.getLanguage === 'function') ? window.getLanguage() : 'es';
    
    if (command === 'help') {
        if (lang === 'en') {
            printTerminal("Available commands in Sandbox/FreeRoam:", "lime");
            printTerminal("  help                      - Displays this help menu.");
            printTerminal("  sysinfo / neofetch        - Displays system and hardware information.", "white");
            printTerminal("  wallet                    - Displays financial details and history.", "white");
            printTerminal("  scan                      - Scans the deep network for VIP links.", "white");
            printTerminal("  decrypt <file>            - Decrypts PGP files (requires kit_pgp.key).", "white");
            printTerminal("  hack <node_id>            - Launches a manual remote attack for BTC.", "white");
            printTerminal("  exploit <node_id>         - Launches an automated remote attack (requires exploit_pack.pkg).", "white");
            printTerminal("  ls                        - Lists local files in the VFS.", "white");
            printTerminal("  cat <file>                - Reads the content of a file.", "white");
            printTerminal("  rm <file>                 - Deletes a file from the VFS.", "white");
            printTerminal("  tutorial                  - Restarts the DarkChat interactive tutorial.", "white");
            printTerminal("  clear                     - Clears the terminal screen.", "white");
        } else {
            printTerminal("Comandos disponibles en Sandbox/FreeRoam:", "lime");
            printTerminal("  help                      - Muestra este menú de ayuda.");
            printTerminal("  sysinfo / neofetch        - Muestra información del sistema y hardware.", "white");
            printTerminal("  wallet                    - Muestra detalles financieros e historial.", "white");
            printTerminal("  scan                      - Escanea la red profunda en busca de enlaces VIP.", "white");
            printTerminal("  decrypt <archivo>         - Desencripta archivos PGP (requiere kit_pgp.key).", "white");
            printTerminal("  hack <nodo_id>            - Lanza un ataque remoto manual por BTC.", "white");
            printTerminal("  exploit <nodo_id>         - Lanza un ataque remoto automatizado (requiere exploit_pack.pkg).", "white");
            printTerminal("  ls                        - Lista archivos locales en el VFS.", "white");
            printTerminal("  cat <archivo>             - Lee el contenido de un archivo.", "white");
            printTerminal("  rm <archivo>              - Elimina un archivo del VFS.", "white");
            printTerminal("  tutorial                  - Reinicia el tutorial de DarkChat con Guía_Neta.", "white");
            printTerminal("  clear                     - Limpia la consola.", "white");
        }
    } 
    else if (command === 'sysinfo' || command === 'neofetch') {
        printTerminal(" ██████╗  █████╗ ██████╗ ██╗  ██╗██╗     ██╗███╗   ██╗██╗  ██╗", "lime");
        printTerminal(" ██╔══██╗██╔══██╗██╔══██╗██║ ██╔╝██║     ██║████╗  ██║██║ ██╔╝", "lime");
        printTerminal(" ██║  ██║███████║██████╔╝█████╔╝ ██║     ██║██╔██╗ ██║█████╔╝ ", "lime");
        printTerminal(" ██║  ██║██╔══██║██╔══██╗██╔═██╗ ██║     ██║██║╚██╗██║██╔═██╗ ", "lime");
        printTerminal(" ██████╔╝██║  ██║██║  ██║██║  ██╗███████╗██║██║ ╚████║██║  ██╗", "lime");
        printTerminal(" ╚══════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝", "lime");
        printTerminal("---------------------------------------------------------------", "gray");
        if (lang === 'en') {
            printTerminal("Operating System: DarkOS v4.1 (Sandbox Mode)", "white");
            printTerminal("User: root@local", "white");
            printTerminal("Kernel: 4.1.0-ann-free-x86_64", "white");
            printTerminal("Uptime: " + Math.floor(state.gameTimeMinutes / 60) + "h " + (state.gameTimeMinutes % 60) + "m", "white");
            printTerminal("CPU Usage: " + (state.antivirusShield ? "78%" : "23%"), "white");
            printTerminal("RAM Usage: 1824 MB / 4096 MB", "white");
            printTerminal("Antivirus Shield: " + (state.antivirusShield ? "ACTIVE (Max Security)" : "INACTIVE (Vulnerable)"), state.antivirusShield ? "lime" : "red");
            printTerminal("Wallet: " + state.walletBTC.toFixed(3) + " BTC", "yellow");
            
            if (state.upgrades) {
                printTerminal("---------------------------------------------------------------", "gray");
                printTerminal("ACTIVE HARDWARE UPGRADES:", "lime");
                printTerminal("  [🔒 VPN Phantom]     : " + (state.upgrades.vpn ? "ACTIVE (Mitigates 50% network threats)" : "NOT INSTALLED"), state.upgrades.vpn ? "lime" : "gray");
                printTerminal("  [🔑 Kit PGP Key]     : " + (state.upgrades.pgpKey ? "ACTIVE (Decrypts .pgp files)" : "NOT INSTALLED"), state.upgrades.pgpKey ? "lime" : "gray");
                printTerminal("  [⚡ CPU Overclock]   : " + (state.upgrades.overclock ? "ACTIVE (Scanning in 2s)" : "NOT INSTALLED"), state.upgrades.overclock ? "lime" : "gray");
                printTerminal("  [💣 Exploit Pack]    : " + (state.upgrades.exploitPack ? "ACTIVE ('exploit' command unlocked)" : "NOT INSTALLED"), state.upgrades.exploitPack ? "lime" : "gray");
            }
        } else {
            printTerminal("Sistema Operativo: DarkOS v4.1 (Sandbox Mode)", "white");
            printTerminal("Usuario: root@local", "white");
            printTerminal("Kernel: 4.1.0-ann-free-x86_64", "white");
            printTerminal("Tiempo Activo: " + Math.floor(state.gameTimeMinutes / 60) + "h " + (state.gameTimeMinutes % 60) + "m", "white");
            printTerminal("Uso de CPU: " + (state.antivirusShield ? "78%" : "23%"), "white");
            printTerminal("Uso de RAM: 1824 MB / 4096 MB", "white");
            printTerminal("Escudo Antivirus: " + (state.antivirusShield ? "ACTIVO (Seguridad Máxima)" : "INACTIVO (Vulnerable)"), state.antivirusShield ? "lime" : "red");
            printTerminal("Billetera: " + state.walletBTC.toFixed(3) + " BTC", "yellow");
            
            if (state.upgrades) {
                printTerminal("---------------------------------------------------------------", "gray");
                printTerminal("MEJORAS DE HARDWARE ACTIVAS:", "lime");
                printTerminal("  [🔒 VPN Phantom]     : " + (state.upgrades.vpn ? "ACTIVO (Mitiga 50% de amenazas de red)" : "NO INSTALADO"), state.upgrades.vpn ? "lime" : "gray");
                printTerminal("  [🔑 Kit PGP Key]     : " + (state.upgrades.pgpKey ? "ACTIVO (Descifra archivos .pgp)" : "NO INSTALADO"), state.upgrades.pgpKey ? "lime" : "gray");
                printTerminal("  [⚡ CPU Overclock]   : " + (state.upgrades.overclock ? "ACTIVO (Escaneo en 2s)" : "NO INSTALADO"), state.upgrades.overclock ? "lime" : "gray");
                printTerminal("  [💣 Exploit Pack]    : " + (state.upgrades.exploitPack ? "ACTIVO (Comando 'exploit' desbloqueado)" : "NO INSTALADO"), state.upgrades.exploitPack ? "lime" : "gray");
            }
        }
        
        if (typeof checkTutorialProgress === 'function') checkTutorialProgress('neofetch');
    } 
    else if (command === 'wallet') {
        if (lang === 'en') {
            printTerminal("--- ANONYMOUS BITCOIN WALLET ---", "yellow");
            printTerminal("Local Address: 1DarkLNKx932fNq10aBCzXx...", "gray");
            printTerminal("Available Balance: " + state.walletBTC.toFixed(3) + " BTC", "yellow");
            printTerminal("Transaction History:", "lime");
            printTerminal("  [+] Remote hack successful: +0.220 BTC", "lime");
            printTerminal("  [-] Database purchase: -0.045 BTC", "red");
            printTerminal("  [+] Anonymous chat reward: +0.150 BTC", "lime");
        } else {
            printTerminal("--- CARTERA BITCOIN ANÓNIMA ---", "yellow");
            printTerminal("Dirección local: 1DarkLNKx932fNq10aBCzXx...", "gray");
            printTerminal("Balance Disponible: " + state.walletBTC.toFixed(3) + " BTC", "yellow");
            printTerminal("Historial de transacciones:", "lime");
            printTerminal("  [+] Hack remoto exitoso: +0.220 BTC", "lime");
            printTerminal("  [-] Compra de base de datos: -0.045 BTC", "red");
            printTerminal("  [+] Recompensa chat anónimo: +0.150 BTC", "lime");
        }
    } 
    else if (command === 'scan') {
        if (typeof checkTutorialProgress === 'function') checkTutorialProgress('scan');
        printTerminal(lang === 'en' ? "Starting deep network scan (.ann)..." : "Iniciando escaneo de la red profunda (.ann)...", "lime");
        printTerminal(lang === 'en' ? "Routing packets across 5 encrypted hops..." : "Enrutando paquetes a través de 5 saltos...", "gray");
        setTimeout(() => {
            const exists = window.deepWebDB.some(n => n.id === 'vip_leak');
            if (exists) {
                printTerminal(lang === 'en' ? "Scan complete. No new hidden nodes found." : "Escaneo finalizado. No se encontraron nuevos nodos ocultos.", "yellow");
            } else {
                window.deepWebDB.push({
                    id: 'vip_leak',
                    url: 'http://leaksvip99x2.ann/',
                    title: 'VIP Hacker Leaks Database',
                    category: 'repositorio',
                    topic: 'código gubernamental filtrado',
                    description: 'Acceso exclusivo a archivos militares robados y claves de cifrado.'
                });
                window.deepWebDB.push({
                    id: 'btc_mixer',
                    url: 'http://mixerblackx4.ann/',
                    title: 'BlackMixer - Anonymous BTC Tumbler',
                    category: 'mercado',
                    topic: 'lavado de criptomonedas',
                    description: 'Servicio de mezcla y anonimización de fondos Bitcoin. Alta confianza.'
                });
                
                printTerminal(lang === 'en' ? "[!] NEW ONION LINKS DISCOVERED!" : "[!] ¡NUEVOS ENLACES ENCONTRADOS!", "lime");
                printTerminal("  > http://leaksvip99x2.ann/ (VIP Hacker Leaks)", "yellow");
                printTerminal("  > http://mixerblackx4.ann/ (BlackMixer Tumbler)", "yellow");
                printTerminal(lang === 'en' ? "Links have been added to your browser index directory." : "Los enlaces han sido agregados al directorio local del navegador.", "lime");
                
                const idxCount = document.getElementById('torch-index-count');
                if (idxCount) {
                    idxCount.innerText = window.deepWebDB.length;
                }
            }
        }, 1500);
    } 
    else if (command === 'decrypt') {
        const lang = (typeof window.getLanguage === 'function') ? window.getLanguage() : 'es';
        if (!arg) {
            printTerminal(lang === 'en' ? "Error. You must specify the filename to decrypt." : "Error. Debes especificar el nombre del archivo a desencriptar.", "red");
            printTerminal(lang === 'en' ? "Syntax: decrypt <filename>" : "Sintaxis: decrypt <nombre_archivo>", "yellow");
            return;
        }
        
        if (state.freeRoam && !state.upgrades.pgpKey) {
            printTerminal(lang === 'en' ? "Security Error: 'kit_pgp.key' required to decrypt PGP signatures." : "Error de seguridad: Se requiere el 'kit_pgp.key' para descifrar firmas PGP.", "red");
            printTerminal(lang === 'en' ? "You can acquire this digital key on a dark market for 0.15 BTC." : "Puedes adquirir esta firma digital en un mercado oscuro por 0.15 BTC.", "yellow");
            return;
        }
        
        const file = state.vfs.find(f => f.name === arg || (f.name_en && f.name_en === arg));
        if (!file) {
            printTerminal(lang === 'en' ? `Error. File '${arg}' was not found in the system.` : `Error. El archivo '${arg}' no se encuentra en el sistema.`, "red");
            return;
        }
        
        if (file.decrypted) {
            printTerminal(lang === 'en' ? `File '${arg}' is already decrypted.` : `El archivo '${arg}' ya está desencriptado.`, "yellow");
            return;
        }
        
        printTerminal(lang === 'en' ? `Starting PGP decryption of '${arg}'...` : `Iniciando desencriptación PGP de '${arg}'...`, "lime");
        printTerminal(lang === 'en' ? "Searching keys on PasteDumps..." : "Buscando claves en PasteDumps...", "gray");
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += 33;
            if (progress > 100) progress = 100;
            printTerminal(lang === 'en' ? `Progress: ${progress}%...` : `Progreso: ${progress}%...`, "gray");
            if (progress === 100) {
                clearInterval(interval);
                file.decrypted = true;
                printTerminal(lang === 'en' ? `[+] DECRYPTION SUCCESSFUL: '${arg}' decrypted.` : `[+] DESENCRIPTACIÓN EXITOSA: '${arg}' descifrado.`, "lime");
                printTerminal(lang === 'en' ? "Readable content available in Recycle Bin." : "Contenido legible disponible en la Papelera de Reciclaje.", "yellow");
                if (typeof updateTrashUI === 'function') updateTrashUI();
                
                if (arg === 'dump_core.bin' || arg.includes('dump')) {
                    if (window.StoryMode && typeof window.StoryMode.completeObjective === 'function') {
                        window.StoryMode.completeObjective('c2_decrypt');
                    }
                }
            }
        }, 800);
    } 
    else if (command === 'trace') {
        const lang = (typeof window.getLanguage === 'function') ? window.getLanguage() : 'es';
        printTerminal(lang === 'en' ? "Starting packet tracing and geo-triangulation..." : "Iniciando rastreo de paquetes y geo-triangulación...", "lime");
        const ip = arg || "184.22.9.101";
        printTerminal(`> Rastreando IP: ${ip}...`, "gray");
        printTerminal("> 192.168.1.1 -> 10.0.4.1 -> 172.16.88.2 -> 184.22.9.101", "gray");
        printTerminal(`[!] NODO IDENTIFICADO: puppeteer-project.ann (Puerto 443 ABIERTO)`, "yellow");
        printTerminal(lang === 'en' ? `[!] ACTION REQUIRED: Isolate vulnerable port with 'isolate-port 443'.` : `[!] ACCIÓN REQUERIDA: Aísla el puerto vulnerable con 'isolate-port 443'.`, "lime");
        if (window.StoryMode && typeof window.StoryMode.completeObjective === 'function') {
            window.StoryMode.completeObjective('c3_isolate');
        }
    }
    else if (command === 'isolate-port' || command === 'isolate') {
        const lang = (typeof window.getLanguage === 'function') ? window.getLanguage() : 'es';
        const port = arg || "443";
        printTerminal(lang === 'en' ? `[+] Blocking incoming connections on port ${port}...` : `[+] Bloqueando conexiones entrantes en el puerto ${port}...`, "lime");
        printTerminal("> Reglas de iptables actualizadas: DROP tcp dport " + port, "gray");
        printTerminal(lang === 'en' ? `[✓] PORT ${port} ISOLATED. External intrusion successfully mitigated.` : `[✓] PUERTO ${port} AISLADO. Intrusión externa mitigada con éxito.`, "lime");
        if (window.StoryMode && typeof window.StoryMode.completeObjective === 'function') {
            window.StoryMode.completeObjective('c3_isolate');
        }
    }
    else if (command === 'purge_master.sh' || command === './purge_master.sh' || command === 'purge') {
        const lang = (typeof window.getLanguage === 'function') ? window.getLanguage() : 'es';
        printTerminal(lang === 'en' ? "[!] INITIALIZING MASTER PURGE SCRIPT..." : "[!] INICIALIZANDO SCRIPT MAESTRO DE PURGA...", "yellow");
        printTerminal(lang === 'en' ? "> Connecting to 250 decentralized mirror servers..." : "> Conectando a 250 servidores espejo descentralizados...", "lime");
        
        let purgeProgress = 0;
        const purgeInterval = setInterval(() => {
            purgeProgress += 25;
            printTerminal(lang === 'en' ? `> Broadcasting Project Puppeteer database: ${purgeProgress}%...` : `> Transmitiendo base de datos del Proyecto Puppeteer: ${purgeProgress}%...`, "gray");
            if (purgeProgress >= 100) {
                clearInterval(purgeInterval);
                printTerminal(lang === 'en' ? "[✓] GLOBAL BROADCAST COMPLETED. EVIDENCE LEAKED TO THE WORLD." : "[✓] TRANSMISIÓN GLOBAL COMPLETADA. EVIDENCIA FILTRADA AL MUNDO.", "lime");
                printTerminal(lang === 'en' ? "[✓] CORE PUPPETEER NODE DESTROYED." : "[✓] NODO CENTRAL DEL TITIRITERO DESTRUIDO.", "lime");
                
                if (window.StoryMode && typeof window.StoryMode.completeObjective === 'function') {
                    window.StoryMode.completeObjective('c5_purge');
                    window.StoryMode.completeObjective('c5_survive');
                    window.StoryMode.completeObjective('c5_leak');
                }
            }
        }, 1000);
    } 
    else if (command === 'hack') {
        const lang = (typeof window.getLanguage === 'function') ? window.getLanguage() : 'es';
        if (!arg) {
            printTerminal(lang === 'en' ? "Error. You must specify a node ID to hack (e.g. hack node_5)." : "Error. Debes especificar un ID de nodo para hackear (ej: hack node_5).", "red");
            printTerminal(lang === 'en' ? "Syntax: hack <node_id>" : "Sintaxis: hack <node_id>", "yellow");
            return;
        }
        
        const targetNode = window.deepWebDB ? window.deepWebDB.find(n => n.id === arg || n.url === arg) : null;
        if (!targetNode) {
            printTerminal(lang === 'en' ? `Error. Node '${arg}' does not exist in network database.` : `Error. El nodo '${arg}' no existe en la base de datos de red.`, "red");
            return;
        }
        
        printTerminal(lang === 'en' ? `Establishing reverse SSH tunnel to ${targetNode.url}...` : `Estableciendo tunel inverso SSH hacia ${targetNode.url}...`, "lime");
        printTerminal(lang === 'en' ? "Injecting buffer overflow exploit..." : "Inyectando exploit de desbordamiento de búfer...", "gray");
        
        setTimeout(() => {
            const winTerminal = document.getElementById('window-terminal');
            if (winTerminal) winTerminal.classList.add('hidden');
            if (typeof removeTaskbarTab === 'function') removeTaskbarTab('terminal');
            
            state.acceleratedMinigame = true;
            
            if (typeof triggerRandomMinigame === 'function') {
                triggerRandomMinigame(() => {
                    state.acceleratedMinigame = false;
                    const reward = parseFloat((Math.random() * 0.15 + 0.15).toFixed(3));
                    
                    if (winTerminal) winTerminal.classList.remove('hidden');
                    if (typeof addTaskbarTab === 'function') addTaskbarTab('terminal', 'Terminal');
                    if (typeof bringToFront === 'function' && winTerminal) bringToFront(winTerminal);
                    
                    printTerminal(lang === 'en' ? "[!] ATTACK SUCCESSFUL" : "[!] ATAQUE EXITOSO", "lime");
                    printTerminal(lang === 'en' ? `  > Server '${targetNode.title}' compromised.` : `  > Servidor '${targetNode.title}' comprometido.`, "lime");
                    printTerminal(lang === 'en' ? `  > Extracted funds: +${reward} BTC.` : `  > Fondos extraídos: +${reward} BTC.`, "yellow");
                    updateWallet(reward);
                });
            }
        }, 1500);
    } 
    else if (command === 'exploit') {
        const lang = (typeof window.getLanguage === 'function') ? window.getLanguage() : 'es';
        if (!state.upgrades.exploitPack) {
            printTerminal(lang === 'en' ? "Error. The 'exploit' command requires active 'exploit_pack.pkg'." : "Error. El comando 'exploit' requiere la herramienta 'exploit_pack.pkg' activa.", "red");
            printTerminal(lang === 'en' ? "You can buy this tool on a dark market for 0.40 BTC." : "Puedes adquirir esta herramienta en un mercado oscuro por 0.40 BTC.", "yellow");
            return;
        }
        if (!arg) {
            printTerminal(lang === 'en' ? "Error. You must specify a node ID to exploit (e.g. exploit node_5)." : "Error. Debes especificar un ID de nodo para explotar (ej: exploit node_5).", "red");
            printTerminal(lang === 'en' ? "Syntax: exploit <node_id>" : "Sintaxis: exploit <node_id>", "yellow");
            return;
        }
        const targetNode = window.deepWebDB ? window.deepWebDB.find(n => n.id === arg || n.url === arg) : null;
        if (!targetNode) {
            printTerminal(lang === 'en' ? `Error. Node '${arg}' does not exist in network database.` : `Error. El nodo '${arg}' no existe en la base de datos de red.`, "red");
            return;
        }
        
        printTerminal(lang === 'en' ? `[!] Starting automated Zero-Day injection on ${targetNode.url}...` : `[!] Iniciando inyección automatizada de Zero-Day en ${targetNode.url}...`, "lime");
        printTerminal(lang === 'en' ? "Loading local exploit database..." : "Cargando base de datos de exploits locales...", "gray");
        printTerminal(lang === 'en' ? "Stack overflow successfully executed." : "Desbordamiento de pila ejecutado exitosamente.", "gray");
        printTerminal(lang === 'en' ? "Firewall bypassed via cryptographic signature." : "Bypass de firewall por firma criptográfica.", "gray");
        
        setTimeout(() => {
            const reward = parseFloat((Math.random() * 0.25 + 0.25).toFixed(3));
            printTerminal(lang === 'en' ? "[+] AUTOMATED HACK SUCCESSFUL" : "[+] HACK AUTOMÁTICO EXITOSO", "lime");
            printTerminal(lang === 'en' ? `  > Server '${targetNode.title}' compromised via Zero-Day exploit.` : `  > Servidor '${targetNode.title}' comprometido via Zero-Day exploit.`, "lime");
            printTerminal(lang === 'en' ? `  > Extracted funds: +${reward} BTC.` : `  > Fondos extraídos: +${reward} BTC.`, "yellow");
            updateWallet(reward);
            
            if (typeof checkTutorialProgress === 'function') checkTutorialProgress('buy', targetNode.title);
        }, 1200);
    }
    else if (command === 'ls') {
        const lang = (typeof window.getLanguage === 'function') ? window.getLanguage() : 'es';
        printTerminal(lang === 'en' ? "Local directory: /home/root" : "Directorio local: /home/root", "lime");
        state.vfs.forEach(f => {
            const displayName = (lang === 'en' && f.name_en) ? f.name_en : f.name;
            let color = "white";
            if (f.name.endsWith('.pgp')) color = f.decrypted ? "lime" : "orange";
            else if (f.name.endsWith('.log')) color = "lightblue";
            else if (f.name.endsWith('.txt')) color = "yellow";
            
            let statusStr = "";
            if (f.name.endsWith('.pgp')) {
                if (lang === 'en') {
                    statusStr = f.decrypted ? " (PGP Decrypted)" : " (PGP Encrypted)";
                } else {
                    statusStr = f.decrypted ? " (PGP Desencriptado)" : " (PGP Encriptado)";
                }
            }
            printTerminal(`  ${displayName}${statusStr}`, color);
        });
    }
    else if (command === 'cat') {
        const lang = (typeof window.getLanguage === 'function') ? window.getLanguage() : 'es';
        if (!arg) {
            printTerminal(lang === 'en' ? "Error. You must specify the file to read (e.g. cat system_log.log)." : "Error. Debes especificar el archivo a leer (ej: cat registro_sistema.log).", "red");
            printTerminal(lang === 'en' ? "Syntax: cat <filename>" : "Sintaxis: cat <nombre_archivo>", "yellow");
            return;
        }
        const file = state.vfs.find(f => f.name === arg || (f.name_en && f.name_en === arg));
        if (!file) {
            printTerminal(lang === 'en' ? `Error. File '${arg}' is not found in the system.` : `Error. El archivo '${arg}' no se encuentra en el sistema.`, "red");
            return;
        }
        
        const displayName = (lang === 'en' && file.name_en) ? file.name_en : file.name;
        
        if (file.name.endsWith('.pgp') && !file.decrypted) {
            printTerminal(lang === 'en' ? "----- PGP READ ERROR -----" : "----- ERROR DE LECTURA PGP -----", "red");
            const encContent = (lang === 'en' && file.content_en) ? file.content_en : file.content;
            printTerminal(encContent, "orange");
            printTerminal("--------------------------------", "red");
            printTerminal(lang === 'en' ? "This file is PGP encrypted. You must decrypt it using the 'decrypt <file>' command before reading." : "Este archivo está cifrado con PGP. Debes desencriptarlo usando el comando 'decrypt <archivo>' antes de poder leerlo.", "red");
            return;
        }
        
        let content;
        if (file.decrypted) {
            content = (lang === 'en' && file.decryptedContent_en) ? file.decryptedContent_en : (file.decryptedContent || file.content);
        } else {
            content = (lang === 'en' && file.content_en) ? file.content_en : file.content;
        }

        if (state.freeRoam && typeof window.openNotepad === 'function') {
            window.openNotepad(displayName, content, true);
            printTerminal(lang === 'en' ? `Opening ${displayName} in Notepad...` : `Abriendo ${displayName} en el Bloc de Notas...`, "lime");
        } else {
            printTerminal(lang === 'en' ? `=== Reading: ${displayName} ===` : `=== Leyendo: ${displayName} ===`, "lime");
            const contentLines = content.split('\n');
            contentLines.forEach(line => printTerminal(line, "white"));
            printTerminal("=====================================", "lime");
        }
    }
    else if (command === 'rm') {
        const lang = (typeof window.getLanguage === 'function') ? window.getLanguage() : 'es';
        if (!arg) {
            printTerminal(lang === 'en' ? "Error. You must specify the file to delete (e.g. rm system_log.log)." : "Error. Debes especificar el archivo a eliminar (ej: rm registro_sistema.log).", "red");
            printTerminal(lang === 'en' ? "Syntax: rm <filename>" : "Sintaxis: rm <nombre_archivo>", "yellow");
            return;
        }
        const fileIdx = state.vfs.findIndex(f => f.name === arg || (f.name_en && f.name_en === arg));
        if (fileIdx === -1) {
            printTerminal(lang === 'en' ? `Error. File '${arg}' does not exist in the system.` : `Error. El archivo '${arg}' no existe en el sistema.`, "red");
            return;
        }
        const file = state.vfs[fileIdx];
        if (file.canDelete === false) {
            printTerminal(lang === 'en' ? `Permission Error: File '${arg}' is a protected system resource and cannot be removed.` : `Error de permisos: El archivo '${arg}' es un recurso protegido del sistema y no puede eliminarse.`, "red");
            return;
        }
        
        state.vfs.splice(fileIdx, 1);
        printTerminal(lang === 'en' ? `[+] FILE REMOVED: '${arg}' has been deleted from VFS.` : `[+] ARCHIVO ELIMINADO: '${arg}' ha sido eliminado exitosamente del VFS.`, "lime");
        if (typeof updateTrashUI === 'function') updateTrashUI();
    }
    else if (command === 'tutorial') {
        printTerminal(lang === 'en' ? "Restarting interactive Sandbox tutorial..." : "Reiniciando tutorial interactivo de Sandbox...", "lime");
        if (typeof startSandboxTutorial === 'function') startSandboxTutorial();
    }
    else if (command === 'clear') {
        if (terminalHistory) terminalHistory.innerHTML = '';
    } 
    else {
        printTerminal(lang === 'en' ? `Unrecognized command: '${command}'. Type 'help' to see the list of available commands.` : `Comando no reconocido: '${command}'. Escribe 'help' para ver la lista de comandos.`, "red");
    }
}

// Bind Enter key when DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    const terminalInput = document.getElementById('terminal-input');
    const iconTerminal = document.getElementById('icon-terminal');
    const btnCloseTerminal = document.getElementById('btn-close-terminal');
    const windowTerminal = document.getElementById('window-terminal');

    if (iconTerminal) {
        iconTerminal.addEventListener('click', () => {
            const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;
            if (!state.freeRoam && state.currentQuest < 4) {
                if (typeof queueDialogues === 'function') {
                    queueDialogues([{ name: "Sistema", text: tFn("terminal_denied_dialogue", "ERROR. Permisos insuficientes para iniciar Terminal Root. Consiga la clave de volcado.") }]);
                }
                return;
            }
            if (windowTerminal) {
                windowTerminal.classList.remove('hidden');
                if (typeof bringToFront === 'function') bringToFront(windowTerminal);
            }
            if (typeof addTaskbarTab === 'function') addTaskbarTab('terminal', 'Terminal');
            if (terminalInput) terminalInput.focus();
        });
    }

    if (btnCloseTerminal) {
        btnCloseTerminal.addEventListener('click', () => {
            if (windowTerminal) windowTerminal.classList.add('hidden');
            if (typeof removeTaskbarTab === 'function') removeTaskbarTab('terminal');
        });
    }

    if (terminalInput) {
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = terminalInput.value.trim();
                terminalInput.value = "";
                printTerminal("root@local:~# " + cmd, "gray");
                
                // Notify other systems (like WinHello assistant)
                window.dispatchEvent(new CustomEvent('terminal-command-executed', { detail: { command: cmd } }));
                
                if (state.freeRoam) {
                    handleFreeRoamTerminalCommand(cmd);
                    return;
                }
                
                const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;

                if (state.currentQuest !== 4) {
                    printTerminal(tFn("terminal_err_locked", "Error: Acceso denegado o comandos bloqueados por proceso externo."), "red");
                    return;
                }

                if (terminalStep === 0) {
                    if (cmd.toLowerCase() === "trace target 184.22.9.101" || cmd === "184.22.9.101") {
                        printTerminal(tFn("terminal_step0_ok", "Target fijado: 184.22.9.101. Ping OK. Se requiere override del firewall."), "lime");
                        terminalStep = 1;
                    } else {
                        printTerminal(tFn("terminal_step0_err", "Error. Primer paso: rastrear la IP origen encontrada en NightLink."), "red");
                        printTerminal(tFn("terminal_step0_syntax", "Sintaxis requerida: trace target 184.22.9.101"), "yellow");
                    }
                } else if (terminalStep === 1) {
                    if (cmd.toLowerCase() === "override firewall" || cmd.includes("override")) {
                        printTerminal(tFn("terminal_step1_ok", "Firewall bypasseado temporalmente. Sistema listo para inyección de clave maestra."), "lime");
                        terminalStep = 2;
                    } else {
                        printTerminal(tFn("terminal_step1_err", "Error. El cortafuegos sigue activo. Necesita anularse desde Terminal."), "red");
                        printTerminal(tFn("terminal_step1_syntax", "Sintaxis requerida: override firewall"), "yellow");
                    }
                } else if (terminalStep === 2) {
                    if (cmd.toLowerCase().includes("execute purge --key") || cmd.toLowerCase().includes("x9-delta-44")) {
                        printTerminal(tFn("terminal_step2_ok", "CLAVE ACEPTADA. INICIANDO SECUENCIA DE PURGA CRÍTICA..."), "yellow");
                        if (typeof updateQuest === 'function') updateQuest(5);
                        if (typeof startGreatPurge === 'function') startGreatPurge();
                    } else {
                        printTerminal(tFn("terminal_step2_err", "Clave incorrecta o formato inválido."), "red");
                        printTerminal(tFn("terminal_step2_syntax", "Sintaxis requerida: execute purge --key X9-DELTA-44"), "yellow");
                    }
                }
            }
        });
    }
});

function resetTerminal() {
    terminalStep = 0;
    const terminalHistory = document.getElementById('terminal-history');
    if (terminalHistory) {
        terminalHistory.innerHTML = '';
    }
}

// Exportar globalmente
window.printTerminal = printTerminal;
window.handleFreeRoamTerminalCommand = handleFreeRoamTerminalCommand;
window.terminalStep = terminalStep;
window.resetTerminal = resetTerminal;

