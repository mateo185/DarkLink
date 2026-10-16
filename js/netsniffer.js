// --- NETSNIFFER REALTIME PACKET ANALYZER ENGINE ---

let netSnifferRunning = true;
let netSnifferInterval = null;
let netsnifferPackets = [];
let netsnifferSelectedPacket = null;
let netsnifferSystemActive = false;

// Base de datos de payloads informáticos y datos simulados para inmersión
const NETSNIFFER_IPS = [
    "192.168.1.102", "10.0.0.45", "184.22.9.101", "82.165.12.9",
    "203.0.113.8", "198.51.100.12", "91.222.13.4", "172.16.254.1"
];

const NETSNIFFER_PROTOCOLS = [
    { proto: "HTTP", port: 80, class: "proto-http" },
    { proto: "DNS", port: 53, class: "proto-dns" },
    { proto: "PGP", port: 443, class: "proto-pgp" },
    { proto: "TOR", port: 9001, class: "proto-tor" },
    { proto: "ICMP", port: 0, class: "proto-icmp" }
];

const NETSNIFFER_INFOS = {
    "HTTP": [
        "GET /index.html HTTP/1.1", "POST /api/v1/telemetry HTTP/1.1",
        "GET /static/style.css HTTP/1.1", "GET /favicon.ico HTTP/1.1",
        "POST /login.php HTTP/1.1"
    ],
    "DNS": [
        "Query A google.com", "Query AAAA pastebin.com",
        "Query MX mail.onion.router", "Query TXT verification-key"
    ],
    "PGP": [
        "KeyExchange RSA 4096", "Decrypting encrypted_payload.asc",
        "Handshake ClientHello", "Encrypted message payload"
    ],
    "TOR": [
        "Relay circuit build request", "Cell relay dispatch packet",
        "Onion routing cell exchange", "Establishing bridge relay"
    ],
    "ICMP": [
        "Echo Request (ping)", "Echo Reply (pong)",
        "Destination Unreachable (Host)", "TTL expired in transit"
    ]
};

// Generador de payloads en formato hexadecimal simulado y texto plano
function generateNetsnifferPayload(proto, info, isVulnerable) {
    if (isVulnerable) {
        if (proto === "HTTP") {
            const user = "operator_" + Math.floor(Math.random() * 900 + 100);
            const pass = Math.random().toString(36).substring(2, 10).toUpperCase();
            return `[RAW DATA]\nPOST /login.php HTTP/1.1\nHost: 184.22.9.101\nContent-Type: application/x-www-form-urlencoded\nContent-Length: 48\n\nusername=${user}&password=${pass}&token=ANN_BYPASS_9948\n\n[HEX DUMP]\n47 45 54 20 2f 20 48 54 54 50 2f 31 2e 31 0d 0a\n75 73 65 72 6e 61 6d 65 3d 61 64 6d 69 6e 26 70\n61 73 73 77 6f 72 64 3d 73 65 63 72 65 74 39 35`;
        } else {
            const secretIp = "184.22.9." + Math.floor(Math.random() * 254);
            const secretKey = "KEY_" + Math.floor(Math.random() * 89999 + 10000);
            return `[RAW DATA]\nDNS QUERY TXT local-key-lookup.ann\nResponse: "ip=${secretIp};auth_hash=${secretKey};status=unshielded"\n\n[HEX DUMP]\n00 0c 29 dec a8 91 00 e0 18 99 bc c1 08 00 45 00\n00 3c 1c 46 40 00 40 06 b1 e6 c0 a8 01 68 b8 4f`;
        }
    }

    // Payloads normales
    let hex = "";
    for (let i = 0; i < 4; i++) {
        let line = [];
        for (let j = 0; j < 16; j++) {
            line.push(Math.floor(Math.random() * 256).toString(16).padStart(2, '0'));
        }
        hex += line.join(" ") + "\n";
    }

    return `[INFO] ${info}\n[TIMESTAMP] ${new Date().toISOString()}\n[STATUS] Traffic Encrypted (AES-256-GCM)\n\n[HEX DUMP]\n${hex}`;
}

// Inicialización de simulación de sniffing
function initNetSniffer() {
    const tableBody = document.getElementById('netsniffer-rows');
    const toggleBtn = document.getElementById('netsniffer-btn-toggle');
    const clearBtn = document.getElementById('netsniffer-btn-clear');
    const decryptBox = document.getElementById('netsniffer-decrypt-box');
    const decryptBtn = document.getElementById('netsniffer-btn-decrypt');
    
    if (!tableBody) return;

    netsnifferSystemActive = true;

    // Resetear arrays y estados
    netsnifferPackets = [];
    netsnifferSelectedPacket = null;
    tableBody.innerHTML = '';
    
    if (decryptBox) {
        decryptBox.style.setProperty('display', 'none', 'important');
        decryptBox.classList.add('hidden');
    }

    // Inicializar timer de sniffing
    if (netSnifferInterval) clearInterval(netSnifferInterval);
    netSnifferInterval = setInterval(() => {
        if (!netSnifferRunning || !netsnifferSystemActive) return;
        generateRandomPacket();
    }, 1800);

    // Evento toggle pausar/reanudar
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;
            netSnifferRunning = !netSnifferRunning;
            const statusIndicator = document.getElementById('netsniffer-status');
            if (statusIndicator) {
                if (netSnifferRunning) {
                    statusIndicator.textContent = tFn("netsniffer_status_tracking", "Rastreando");
                    statusIndicator.classList.remove('paused');
                    statusIndicator.classList.add('active');
                    toggleBtn.textContent = tFn("netsniffer_btn_pause", "Pausar");
                } else {
                    statusIndicator.textContent = tFn("netsniffer_status_paused", "Pausado");
                    statusIndicator.classList.remove('active');
                    statusIndicator.classList.add('paused');
                    toggleBtn.textContent = tFn("netsniffer_btn_resume", "Reanudar");
                }
            }
            if (typeof playClickSound === 'function') playClickSound();
        });
    }

    // Evento limpiar
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;
            tableBody.innerHTML = '';
            netsnifferPackets = [];
            netsnifferSelectedPacket = null;
            
            const viewer = document.getElementById('netsniffer-payload');
            const infoText = document.getElementById('netsniffer-packet-info');
            if (viewer) viewer.textContent = tFn("netsniffer_payload_empty", "Seleccione cualquier paquete TCP/UDP de la grilla de arriba para analizar sus datos crudos.");
            if (infoText) infoText.textContent = tFn("netsniffer_select_packet", "Seleccione un paquete...");
            if (decryptBox) {
                decryptBox.style.setProperty('display', 'none', 'important');
                decryptBox.classList.add('hidden');
            }
            if (typeof playClickSound === 'function') playClickSound();
        });
    }

    // Evento interceptar credenciales (Hacking satoshis)
    if (decryptBtn) {
        decryptBtn.addEventListener('click', () => {
            if (!netsnifferSelectedPacket || !netsnifferSelectedPacket.isVulnerable) return;

            const reward = netsnifferSelectedPacket.reward;
            const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;
            
            // Recompensar con Satoshis reales
            if (typeof updateWallet === 'function') {
                updateWallet(reward);
            }

            // Cambiar estado a no vulnerable para evitar doble cobro
            netsnifferSelectedPacket.isVulnerable = false;
            netsnifferSelectedPacket.payload = `[DECRYPTED BY OPERATOR]\n[BTC CLAIMED: ₿ ${reward.toFixed(3)} BTC]\n\n` + netsnifferSelectedPacket.payload;

            // Ocultar botón de descifrar
            if (decryptBox) {
                decryptBox.style.setProperty('display', 'none', 'important');
                decryptBox.classList.add('hidden');
            }

            // Actualizar fila en la grilla quitando animación de vulnerabilidad
            const selectedRow = document.querySelector('.netsniffer-row.selected');
            if (selectedRow) {
                selectedRow.classList.remove('vulnerable-packet');
                selectedRow.querySelector('.packet-info-cell').textContent = "CREDENTIAL_HIJACKED";
            }

            // Actualizar visualización
            const viewer = document.getElementById('netsniffer-payload');
            if (viewer) {
                viewer.textContent = netsnifferSelectedPacket.payload;
            }

            // Notificación sonora y textual
            if (typeof playProudSound === 'function') playProudSound();
            
            if (typeof showWinHelloBubble === 'function') {
                const bubbleMsg = tFn("netsniffer_winhello_success", "¡Excelente intercepción de red, operador! Hemos extraído ₿ {reward} BTC de las credenciales en texto plano.").replace('{reward}', reward.toFixed(3));
                showWinHelloBubble(bubbleMsg, 8000, 'proud');
            }
        });
    }
}

// Genera un paquete aleatorio y lo inyecta en la tabla y array
function generateRandomPacket() {
    const tableBody = document.getElementById('netsniffer-rows');
    if (!tableBody) return;

    const time = new Date().toLocaleTimeString();
    const src = NETSNIFFER_IPS[Math.floor(Math.random() * NETSNIFFER_IPS.length)];
    let dest = NETSNIFFER_IPS[Math.floor(Math.random() * NETSNIFFER_IPS.length)];
    while (dest === src) {
        dest = NETSNIFFER_IPS[Math.floor(Math.random() * NETSNIFFER_IPS.length)];
    }

    const protoObj = NETSNIFFER_PROTOCOLS[Math.floor(Math.random() * NETSNIFFER_PROTOCOLS.length)];
    const proto = protoObj.proto;
    const protoClass = protoObj.class;
    
    // Posibilidad de paquete vulnerable (credenciales visibles) si es HTTP o DNS
    // 12% de probabilidad
    const isVulnerable = (proto === "HTTP" || proto === "DNS") && Math.random() < 0.12;
    let info = "";
    let reward = 0;
    
    if (isVulnerable) {
        info = proto === "HTTP" ? "AUTH_CREDENTIALS_EXPOSED" : "LOCAL_DNS_LEAK";
        reward = proto === "HTTP" ? 0.025 : 0.015;
    } else {
        const infos = NETSNIFFER_INFOS[proto];
        info = infos[Math.floor(Math.random() * infos.length)];
    }

    const payload = generateNetsnifferPayload(proto, info, isVulnerable);
    
    const packet = {
        id: "pkt-" + Math.floor(Math.random() * 89999 + 10000),
        time: time,
        src: src,
        dest: dest,
        proto: proto,
        protoClass: protoClass,
        info: info,
        payload: payload,
        isVulnerable: isVulnerable,
        reward: reward
    };

    netsnifferPackets.push(packet);
    
    // Mantener un límite de 50 paquetes en memoria para evitar lag
    if (netsnifferPackets.length > 50) {
        netsnifferPackets.shift();
    }

    // Inyectar en la tabla
    const tr = document.createElement('tr');
    tr.id = packet.id;
    tr.className = `netsniffer-row ${protoClass} ${isVulnerable ? 'vulnerable-packet' : ''}`;
    
    tr.innerHTML = `
        <td>${packet.time}</td>
        <td>${packet.src}</td>
        <td>${packet.dest}</td>
        <td>${packet.proto}</td>
        <td class="packet-info-cell">${packet.info}</td>
    `;

    // Clic en la fila
    tr.addEventListener('click', () => {
        // Remover selección previa
        document.querySelectorAll('.netsniffer-row').forEach(row => row.classList.remove('selected'));
        tr.classList.add('selected');
        
        selectNetsnifferPacket(packet);
    });

    tableBody.appendChild(tr);
    
    // Auto-scroll hacia abajo si el usuario no está scrolleando manualmente
    const tableContainer = tableBody.parentElement.parentElement;
    if (tableContainer) {
        tableContainer.scrollTop = tableContainer.scrollHeight;
    }
}

// Selecciona un paquete y actualiza la UI
function selectNetsnifferPacket(packet) {
    netsnifferSelectedPacket = packet;
    
    const viewer = document.getElementById('netsniffer-payload');
    const infoText = document.getElementById('netsniffer-packet-info');
    const decryptBox = document.getElementById('netsniffer-decrypt-box');
    
    if (viewer) viewer.textContent = packet.payload;
    if (infoText) infoText.textContent = `ID: ${packet.id} | Protocolo: ${packet.proto}`;
    
    if (decryptBox) {
        if (packet.isVulnerable) {
            decryptBox.style.setProperty('display', 'block', 'important');
            decryptBox.classList.remove('hidden');
        } else {
            decryptBox.style.setProperty('display', 'none', 'important');
            decryptBox.classList.add('hidden');
        }
    }
    
    if (typeof playClickSound === 'function') playClickSound();
}

// Apagar el sniffing cuando se cierra la ventana
function shutdownNetSniffer() {
    netsnifferSystemActive = false;
    if (netSnifferInterval) {
        clearInterval(netSnifferInterval);
        netSnifferInterval = null;
    }
}

// Exportar globalmente
window.initNetSniffer = initNetSniffer;
window.shutdownNetSniffer = shutdownNetSniffer;
