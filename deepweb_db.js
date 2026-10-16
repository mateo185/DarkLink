// Base de Datos Procedural de la Deep Web para DarkLink
// Genera 120+ páginas bilingües para el Modo Libre.

const adjectives = [
    { es: "Carmesí", en: "Crimson" },
    { es: "Sombra", en: "Shadow" },
    { es: "Vacío", en: "Void" },
    { es: "Silencioso", en: "Silent" },
    { es: "Abismo", en: "Abyss" },
    { es: "Oscuro", en: "Dark" },
    { es: "Fantasma", en: "Phantom" },
    { es: "Neón", en: "Neon" },
    { es: "Rojo", en: "Red" },
    { es: "Negro", en: "Black" },
    { es: "Cyber", en: "Cyber" },
    { es: "Nulo", en: "Null" },
    { es: "Muerto", en: "Dead" },
    { es: "Oculto", en: "Hidden" },
    { es: "Secreto", en: "Secret" },
    { es: "Ciego", en: "Blind" },
    { es: "Profundo", en: "Deep" },
    { es: "Sangriento", en: "Bloody" },
    { es: "Roto", en: "Broken" },
    { es: "Olvidado", en: "Forgotten" },
    { es: "Anónimo", en: "Anonymous" },
    { es: "Espectral", en: "Spectral" },
    { es: "Criptográfico", en: "Cryptographic" },
    { es: "Tóxico", en: "Toxic" },
    { es: "Infectado", en: "Infected" },
    { es: "Gélido", en: "Frozen" },
    { es: "Enmascarado", en: "Masked" },
    { es: "Encriptado", en: "Encrypted" },
    { es: "Eterno", en: "Eternal" },
    { es: "Furtivo", en: "Stealth" }
];

const nouns = [
    { es: "Mercado", en: "Market" },
    { es: "Foro", en: "Forum" },
    { es: "Alianza", en: "Alliance" },
    { es: "Red", en: "Network" },
    { es: "Directorio", en: "Directory" },
    { es: "Puerta", en: "Gate" },
    { es: "Refugio", en: "Shelter" },
    { es: "Bóveda", en: "Vault" },
    { es: "Habitación", en: "Room" },
    { es: "Drop", en: "Drop" },
    { es: "Nodo", en: "Node" },
    { es: "Enlace", en: "Link" },
    { es: "Web", en: "Web" },
    { es: "Zona", en: "Zone" },
    { es: "Sector", en: "Sector" },
    { es: "Archivo", en: "Archive" },
    { es: "Legión", en: "Legion" },
    { es: "Sindicato", en: "Syndicate" },
    { es: "Sociedad", en: "Society" },
    { es: "Orden", en: "Order" },
    { es: "Búnker", en: "Bunker" },
    { es: "Terminal", en: "Terminal" },
    { es: "Nexo", en: "Nexus" },
    { es: "Santuario", en: "Sanctuary" },
    { es: "Cripta", en: "Crypt" },
    { es: "Base", en: "Base" },
    { es: "Matriz", en: "Matrix" },
    { es: "Núcleo", en: "Core" },
    { es: "Sótano", en: "Basement" },
    { es: "Canal", en: "Channel" }
];

const topics = [
    { es: "exploits 0-day", en: "0-day exploits" },
    { es: "lavado de criptomonedas", en: "cryptocurrency laundering" },
    { es: "armas no registradas", en: "unregistered weapons" },
    { es: "documentos falsificados", en: "forged documents" },
    { es: "filtraciones del gobierno", en: "government leaks" },
    { es: "espionaje corporativo", en: "corporate espionage" },
    { es: "conocimiento prohibido", en: "forbidden knowledge" },
    { es: "avistamientos OVNI", en: "UFO sightings" },
    { es: "software prohibido", en: "prohibited software" },
    { es: "bases de datos robadas", en: "stolen databases" },
    { es: "contratos de sicarios", en: "hitman contracts" },
    { es: "botnets", en: "botnets" },
    { es: "carding", en: "carding" },
    { es: "código fuente de malware", en: "malware source code" },
    { es: "hosting anónimo", en: "anonymous hosting" },
    { es: "red rooms", en: "red rooms" },
    { es: "reuniones de culto", en: "cult meetings" },
    { es: "rituales esotéricos", en: "esoteric rituals" },
    { es: "misterios sin resolver", en: "unsolved mysteries" },
    { es: "manifiestos hacker", en: "hacker manifestos" },
    { es: "inteligencia artificial descontrolada", en: "rogue artificial intelligence" },
    { es: "proyectos militares secretos", en: "secret military projects" },
    { es: "tráfico de datos biométricos", en: "biometric data trafficking" },
    { es: "chats de hackers de élite", en: "elite hacker chats" },
    { es: "esquemas ponzi de criptomonedas", en: "cryptocurrency ponzi schemes" },
    { es: "servicios de borrado de identidad", en: "identity erasure services" },
    { es: "satélites pirateados", en: "hijacked satellites" },
    { es: "conspiraciones sanitarias", en: "health conspiracies" },
    { es: "subastas del mercado negro", en: "black market auctions" },
    { es: "claves maestras del gobierno", en: "government master keys" }
];

const categoryTranslations = {
    foro: { es: "foro", en: "forum" },
    mercado: { es: "mercado", en: "market" },
    blog: { es: "blog", en: "blog" },
    pastebin: { es: "pastebin", en: "pastebin" },
    directorio: { es: "directorio", en: "directory" },
    repositorio: { es: "repositorio", en: "repository" },
    redroom: { es: "redroom", en: "red room" },
    exchange: { es: "exchange", en: "exchange" },
    leaks: { es: "leaks", en: "leaks" },
    hitman: { es: "portal de sicarios", en: "hitman service" },
    hosting: { es: "hosting", en: "hosting" },
    chat: { es: "chat", en: "chat" }
};

const deepWebDB = [];

// Generar Hash URL único
function generateAnnHash() {
    return Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
}

// Generar 120 sitios procedurales bilingües
for (let i = 0; i < 120; i++) {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    
    const categories = ['foro', 'mercado', 'blog', 'pastebin', 'directorio', 'repositorio', 'redroom', 'exchange', 'leaks', 'hitman', 'hosting', 'chat'];
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    let title_es = `${adj.es} ${noun.es}`;
    let title_en = `${adj.en} ${noun.en}`;
    
    if (category === 'blog') {
        title_es += ` - Blog Personal`;
        title_en += ` - Personal Blog`;
    } else if (category === 'pastebin') {
        title_es = `PasteDrop: ${adj.es}`;
        title_en = `PasteDrop: ${adj.en}`;
    } else if (category === 'redroom') {
        title_es = `RedRoom: ${adj.es}`;
        title_en = `RedRoom: ${adj.en}`;
    } else if (category === 'exchange') {
        title_es = `${adj.es} Exchange`;
        title_en = `${adj.en} Exchange`;
    } else if (category === 'leaks') {
        title_es = `${adj.es} Leaks`;
        title_en = `${adj.en} Leaks`;
    } else if (category === 'hitman') {
        title_es = `Contratos ${adj.es}`;
        title_en = `${adj.en} Contracts`;
    } else if (category === 'hosting') {
        title_es = `${adj.es} Hosting`;
        title_en = `${adj.en} Hosting`;
    } else if (category === 'chat') {
        title_es = `ChatRoom: ${adj.es}`;
        title_en = `ChatRoom: ${adj.en}`;
    }
    
    const catName_es = categoryTranslations[category] ? categoryTranslations[category].es : category;
    const catName_en = categoryTranslations[category] ? categoryTranslations[category].en : category;

    const node = {
        id: `node_${i}`,
        url: `http://${generateAnnHash()}.ann/`,
        title: title_es,
        title_en: title_en,
        category: category,
        topic: topic.es,
        topic_en: topic.en,
        threads: Math.floor(Math.random() * 5000),
        users: Math.floor(Math.random() * 10000),
        description: `Este es un ${catName_es} oculto dedicado a ${topic.es}. Procede con precaución.`,
        description_en: `This is a hidden ${catName_en} dedicated to ${topic.en}. Proceed with caution.`
    };
    deepWebDB.push(node);
}

// Añadir el buscador a la base de datos (para que pueda ser enlazado)
deepWebDB.push({
    id: "torch",
    url: "http://torchsearch3x21d.ann/",
    title: "Buscador Torch",
    category: "buscador",
    topic: "motor de búsqueda",
    description: "El buscador más grande de la darknet."
});

// Plantillas de Renderizado
const DWRenderer = {
    renderSite: function(site) {
        const lang = (typeof window.getLanguage === 'function') ? window.getLanguage() : 'es';
        const isEn = lang === 'en';
        const siteTitle = (isEn && site.title_en) ? site.title_en : site.title;
        const siteDesc = (isEn && site.description_en) ? site.description_en : site.description;
        const siteTopic = (isEn && site.topic_en) ? site.topic_en : site.topic;

        if (site.category === 'buscador') {
            return `
                <div style="padding: 20px; color: white;">
                    <h2>${siteTitle}</h2>
                    <p>${isEn ? 'Use the search bar on Torch homepage to find content.' : 'Usa la barra de búsqueda en la página principal de Torch para encontrar contenido.'}</p>
                    <button class="terminal-btn" onclick="tryNavigate('torch', false)">${isEn ? 'Go to Search Engine' : 'Ir al Buscador'}</button>
                </div>
            `;
        }

        // Banners y clases visuales por categoría
        let bannerSrc = "assets/dw_banner.png";
        if (site.category === 'foro') bannerSrc = "assets/dw_forum_banner.png";
        else if (site.category === 'blog') bannerSrc = "assets/dw_creepy.png";
        else if (site.category === 'pastebin') bannerSrc = "assets/dw_crypto.png";
        else if (site.category === 'redroom') bannerSrc = "assets/dw_redroom.png";
        else if (site.category === 'exchange') bannerSrc = "assets/dw_exchange.png";
        else if (site.category === 'leaks') bannerSrc = "assets/dw_leaks.png";
        else if (site.category === 'hitman') bannerSrc = "assets/dw_hitman.png";
        else if (site.category === 'hosting') bannerSrc = "assets/dw_hosting.png";
        else if (site.category === 'chat') bannerSrc = "assets/dw_chat_banner.png";
        else if (site.category === 'mercado') bannerSrc = "assets/dw_market_banner.png";

        let categoryHeaderHTML = '';
        if (site.category === 'repositorio' || site.category === 'directorio') {
            categoryHeaderHTML = `<div class="dw-header-img" style="display:flex; justify-content:center; align-items:center; background:#000; font-size:2rem; width:80px; height:80px; border:1px solid #333;">📁</div>`;
        } else {
            categoryHeaderHTML = `<img src="${bannerSrc}" class="dw-header-img" style="width: 120px; height: 80px; object-fit: cover; border: 1px solid #333;">`;
        }

        let html = `
        <div class="dw-container category-${site.category}">
            <div class="dw-header">
                ${categoryHeaderHTML}
                <div>
                    <h1>${siteTitle}</h1>
                    <p style="color:#aaa; font-style:italic;">"${siteDesc}"</p>
                </div>
            </div>
            <div class="dw-content">
                <div class="dw-main">
        `;

        const loreParagraphs_es = [
            `El anonimato no es un derecho, es una necesidad. En este espacio, hemos acumulado terabytes de información que "ellos" no quieren que veas. Toda comunicación aquí está encriptada con PGP. Si no confías en la clave pública, es mejor que desconectes tu cable de red ahora mismo.`,
            `Hace semanas que venimos rastreando movimientos anómalos en los nodos de salida. Alguien está inyectando paquetes maliciosos para desanonimizar el tráfico. Sugerimos rotar las identidades al menos una vez al día. No uses Javascript. No uses tu IP real.`,
            `Los documentos filtrados confirman lo que ya sospechábamos. Las corporaciones tienen acceso directo a las bases de datos biométricas globales. Aquí encontrarás las herramientas necesarias para evadir esos controles. Usa la información bajo tu propio riesgo.`,
            `Si estás leyendo esto, es probable que ya sea demasiado tarde para ellos. Hemos distribuido el código fuente en múltiples servidores en la red Tor e I2P. Descarga los binarios, compílalos desde la fuente, y únete a la red descentralizada. La verdadera resistencia comienza en la capa 7.`,
            `Este nodo es operado por un colectivo independiente. No guardamos logs. No cooperamos. Nuestro único objetivo es preservar el libre intercambio de información relacionada con ${siteTopic}. Si tienes datos relevantes, súbelos al drop anónimo.`,
            `El mercado fluctúa, pero la información sobre ${siteTopic} siempre mantiene su valor. Hemos visto cómo foros enteros caen bajo ataques DDoS patrocinados por actores estatales. Nosotros hemos sobrevivido purgas anteriores y sobreviviremos a esta. Mantén tu OPSEC limpio.`,
            `Nadie está a salvo detrás de una VPN comercial. El nodo de entrada sabe quién eres; el nodo de salida sabe qué buscas. La única seguridad real es interceptar el flujo antes de que llegue a la red física.`,
            `He visto los logs del servidor central. Las huellas digitales de los usuarios se almacenan en un búfer volátil. Si no borras tu caché antes de que el script de mantenimiento se ejecute a medianoche, tu IP quedará registrada para siempre.`,
            `El sonido de las teclas... a veces parece que alguien está escribiendo al mismo ritmo que yo. No es un delay de red, es una inyección de telemetría activa en mi terminal virtual.`,
            `Las subastas de las Red Rooms no se pagan con Bitcoin ordinario. Utilizan firmas de anillo ciegas y canales secundarios de micropagos para evitar el rastreo por análisis de cadena de bloques.`,
            `No descargues binarios compilados de fuentes no confiables. Si un archivo .pkg contiene una firma MD5 corrupta, es muy probable que sea una trampa para obtener acceso root a tu terminal.`,
            `El gran firewall corporativo está cerrando el cerco. Las IPs residenciales están siendo escaneadas masivamente por bots en busca de puertos abiertos. Cambia tu puerto SSH por defecto a un rango no estándar.`,
            `Se rumorea que el exploit zero-day en circulación fue diseñado originalmente por una agencia de inteligencia estatal y luego filtrado tras un ataque ransomware a sus propios servidores de respaldo.`,
            `Si escuchas ruidos de interferencia estática o pisadas virtuales en tus auriculares mientras navegas por estos directorios, limpia tu sistema de inmediato. Podría ser un exploit de audio inyectando frecuencias binaurales.`
        ];

        const loreParagraphs_en = [
            `Anonymity is not a privilege, it is a necessity. Here we have accumulated terabytes of intelligence "they" don't want you to see. All communication here is PGP-encrypted. If you don't trust the public key, unplug your network cable immediately.`,
            `For weeks we have tracked anomalous movements across exit nodes. Someone is injecting malicious packets to deanonymize traffic. We advise rotating identities at least once a day. Disable Javascript. Never reveal your real IP.`,
            `Leaked files confirm our darkest suspicions. Mega-corporations hold direct backdoors into global biometric databases. Here you will find the tools needed to evade surveillance. Use at your own risk.`,
            `If you are reading this, it may already be too late for them. We distributed source code across multiple mirrored servers on Tor and I2P. Download binaries, compile from source, and join the decentralized mesh. True resistance begins at Layer 7.`,
            `This node is operated by an autonomous collective. Zero logs. Zero cooperation. Our sole mission is preserving free access to information regarding ${siteTopic}. If you hold relevant dumps, upload to our secure drop.`,
            `Markets fluctuate, but intelligence on ${siteTopic} always holds supreme value. Entire forums have fallen under state-sponsored DDoS barrages. We survived past purges and will survive this one. Maintain pristine OPSEC.`,
            `No one is truly safe behind a commercial VPN. The entry node knows who you are; the exit node knows what you seek. True security is intercepting packet flow before it reaches the physical wire.`,
            `I inspected the core server audit logs. User fingerprints are retained in volatile ring buffers. If you do not wipe cache before midnight maintenance scripts trigger, your hardware identity is indexed forever.`,
            `The sound of keystrokes... sometimes it feels like someone is typing in sync with my own hands. It isn't network latency, it is active telemetry injection in this virtual terminal.`,
            `Red Room auctions do not settle with standard Bitcoin transactions. They utilize blind ring signatures and secondary lightning channels to evade blockchain forensic surveillance.`,
            `Never download pre-compiled packages from unverified sources. If a .pkg payload contains a mismatched MD5 hash, it is almost certainly a honey-trap designed for root terminal elevation.`,
            `The corporate firewall perimeter is tightening. Residential IP ranges are being mass-probed by automated crawlers seeking open listening ports. Shift default SSH configs to non-standard ports.`,
            `Rumor has it the zero-day exploit circulating in the wild was engineered by a national intelligence agency and subsequently leaked following a ransomware breach on their cold backup array.`,
            `If you detect static interference or rhythmic phantom footfalls through your headphones while browsing these directories, flush system memory immediately. It could be an audio exploit payload streaming binaural frequencies.`
        ];

        const loreParagraphs = isEn ? loreParagraphs_en : loreParagraphs_es;

        function getRandomLore(count) {
            let res = [];
            let pool = [...loreParagraphs];
            for(let i=0; i<count; i++) {
                if(pool.length === 0) break;
                let idx = Math.floor(Math.random() * pool.length);
                res.push(`<p style="margin-bottom: 15px; text-align: justify; line-height: 1.5; font-size: 0.9rem; color:#bbb;">${pool[idx]}</p>`);
                pool.splice(idx, 1);
            }
            return res.join('');
        }

        if (site.category === 'foro') {
            if (!site.threadsData) {
                site.threadsData = [
                    {
                        title: "Vulnerabilidades Zero-Day & Hacking",
                        comments: [
                            {
                                user: "Kaelen_Ghost",
                                posts: 242,
                                date: "Publicado: Hace 2 horas",
                                text: "He estado intentando infiltrar el firewall local de SilkSale. Tienen un sistema heurístico bastante molesto. ¿Alguien tiene alguna llave PGP útil para descifrar sus logs?",
                                hasLink: false,
                                badge: "Mod Elite",
                                color: "#ff3333",
                                signature: "En las sombras operamos."
                            },
                            {
                                user: "shadow_net",
                                posts: 89,
                                date: "Publicado: Hace 1 hora",
                                text: "Para saltarte la seguridad, necesitas buscar un pack de exploits zero-day. He oído que los venden en el mercado por 0.40 BTC. Eso te da el comando `exploit <nodo>` para incursiones automáticas en la consola.",
                                hasLink: true,
                                badge: "Hacker VIP",
                                color: "#00ff66",
                                signature: "OPSEC es vida."
                            }
                        ]
                    },
                    {
                        title: "Base de Datos y Filtraciones Públicas",
                        comments: [
                            {
                                user: "root_phantom",
                                posts: 512,
                                date: "Publicado: Hace 4 horas",
                                text: "He subido un volcado cifrado PGP que contiene el historial de transacciones de SilkSale. Está comprimido en `diario_hacker.pgp`. Puedes descargarlo del blog y usar `decrypt diario_hacker.pgp` en la consola para ver qué contiene.",
                                hasLink: false,
                                badge: "Administrador",
                                color: "#ff3333",
                                signature: "La verdad os hará libres."
                            }
                        ]
                    },
                    {
                        title: "Debate General: ¿Es seguro Phantom?",
                        comments: [
                            {
                                user: "vpn_master",
                                posts: 33,
                                date: "Publicado: Hace 10 minutos",
                                text: "¡Ojo! La red es segura pero tu IP física no lo es. Si entras al Sandbox sin activar el cortafuegos de tu Antivirus, te rastrearán en un santiamén. Si oyes pasos detrás tuyo, ¡APAGA EL MONITOR (botón rojo) de inmediato y mantente quieto!",
                                hasLink: false,
                                badge: "Usuario Nuevo",
                                color: "#3399ff",
                                signature: "Cifra todo o muere."
                            }
                        ]
                    }
                ];
            }

            const statsText = isEn 
                ? `<span>📈 Statistics: <strong>${site.threads}</strong> Threads | <strong>${site.users}</strong> Users</span><span>Main Topic: <strong style="color:#fff;">${siteTopic}</strong></span>`
                : `<span>📈 Estadísticas: <strong>${site.threads}</strong> Hilos | <strong>${site.users}</strong> Usuarios</span><span>Tema Principal: <strong style="color:#fff;">${siteTopic}</strong></span>`;

            html += `
                <div style="background: #111; padding: 12px; border: 1px solid #333; margin-bottom: 20px; color:#ff9900; font-size:0.9rem; font-family:monospace; display:flex; justify-content:space-between; align-items:center;">
                    ${statsText}
                </div>
                
                <!-- TABS DE HILOS -->
                <div class="forum-threads-nav" style="display:flex; gap:5px; margin-bottom:15px; border-bottom:1px solid #333; padding-bottom:10px;">
                    <button class="forum-thread-tab active-tab" data-thread="0" style="background:#222; color:#ff9900; border:1px solid #ff9900; padding:6px 12px; font-family:monospace; font-size:0.85rem; cursor:pointer;">${isEn ? '[1] Hacking & Exploits' : '[1] Hacking & Exploits'}</button>
                    <button class="forum-thread-tab" data-thread="1" style="background:#000; color:#aaa; border:1px solid #333; padding:6px 12px; font-family:monospace; font-size:0.85rem; cursor:pointer;">${isEn ? '[2] Leaks' : '[2] Filtraciones'}</button>
                    <button class="forum-thread-tab" data-thread="2" style="background:#000; color:#aaa; border:1px solid #333; padding:6px 12px; font-family:monospace; font-size:0.85rem; cursor:pointer;">${isEn ? '[3] Security & OPSEC' : '[3] Seguridad & OPSEC'}</button>
                </div>
            `;
            
            site.threadsData.forEach((thread, index) => {
                const threadTitle = thread.title;
                html += `
                <div class="forum-thread-content ${index > 0 ? 'hidden' : ''}" id="forum-thread-${index}" style="margin-bottom:20px;">
                    <h3 style="color:#ff9900; margin-bottom:15px; font-size:1.15rem; border-bottom: 1px dashed #444; padding-bottom:8px;">${isEn ? 'Thread:' : 'Hilo:'} ${threadTitle}</h3>
                    <div class="thread-posts-list" id="thread-posts-${index}">
                `;
                
                thread.comments.forEach(comment => {
                    const badgeColor = comment.color || '#ff9900';
                    const userBadge = comment.badge || (isEn ? 'User' : 'Usuario');
                    html += `
                    <div class="dw-forum-post" style="border-left: 3px solid ${badgeColor}; margin-bottom:15px; background:#141414;">
                        <div class="dw-forum-user" style="padding:15px; width:130px; text-align:center; background:#111;">
                            <img src="assets/dw_hacker_group.png" alt="Avatar" style="width: 50px; height: 50px; object-fit: cover; border: 1px solid #444; border-radius: 4px; margin-bottom: 8px;">
                            <br><strong style="font-size:0.85rem; color:#ff9900; display:block; text-overflow:ellipsis; overflow:hidden;">${comment.user}</strong>
                            <span style="font-size:0.65rem; background:#222; color:${badgeColor}; border:1px solid ${badgeColor}; padding:1px 4px; border-radius:3px; display:inline-block; margin:3px 0;">${userBadge}</span>
                            <br><span style="font-size:0.65rem; color:#555;">${isEn ? 'Posts:' : 'Mensajes:'} ${comment.posts}</span>
                        </div>
                        <div class="dw-forum-body" style="padding:15px; flex-grow:1; display:flex; flex-direction:column; justify-content:space-between;">
                            <div>
                                <div class="dw-forum-date" style="font-size:0.75rem; color:#555; margin-bottom:8px; border-bottom:1px solid #222; padding-bottom:5px; display:flex; justify-content:space-between;">
                                    <span>${comment.date}</span>
                                    <span style="color:#00ff66;">ID: #${Math.floor(Math.random()*900000 + 100000)}</span>
                                </div>
                                <p style="font-size:0.9rem; color:#ccc; line-height:1.4; margin:0 0 10px 0;">${comment.text}</p>
                                ${comment.hasLink ? `<a class="fake-link free-link" style="font-size:0.85rem; color:#3399ff;" data-target="random">${isEn ? 'Link to related evidence' : 'Enlace a evidencia relacionada'}</a>` : ''}
                            </div>
                            <div class="dw-forum-signature" style="font-size:0.7rem; color:#444; border-top:1px dashed #222; margin-top:10px; padding-top:5px; font-style:italic;">"${comment.signature || (isEn ? 'Information wants to be free.' : 'La información quiere ser libre.')}"</div>
                        </div>
                    </div>
                    `;
                });
                
                html += `
                    </div>
                    
                    <!-- INPUT RESPONDER -->
                    <div style="margin-top:20px; background:#161616; border:1px solid #333; padding:15px;">
                        <h4 style="color:#ff9900; margin-bottom:10px; font-size:0.9rem; font-family:monospace;">${isEn ? '✍️ Post reply anonymously to this thread' : '✍️ Responder a este hilo de forma anónima'}</h4>
                        <div style="display:flex; gap:10px;">
                            <input type="text" class="forum-comment-user" id="forum-comment-user-${index}" placeholder="Alias..." style="width:20%; background:#000; border:1px solid #333; color:#ff9900; padding:6px; font-family:monospace; font-size:0.85rem; outline:none;" value="Anon_Hacker">
                            <input type="text" class="forum-comment-text" id="forum-comment-text-${index}" placeholder="${isEn ? 'Write a comment...' : 'Escribe un comentario...'}" style="width:65%; background:#000; border:1px solid #333; color:#ccc; padding:6px; font-family:monospace; font-size:0.85rem; outline:none;">
                            <button class="btn-forum-comment-submit terminal-btn" data-thread="${index}" style="width:15%; padding:6px; font-size:0.8rem; border-color:#ff9900; color:#ff9900; background:transparent; font-family:monospace; font-weight:bold; cursor:pointer;">${isEn ? 'POST' : 'PUBLICAR'}</button>
                        </div>
                    </div>
                </div>
                `;
            });
        } else if (site.category === 'mercado') {
            html += `
                <div style="background:#111; border:1px solid #333; padding:12px; margin-bottom:20px; font-size:0.85rem; display:flex; justify-content:space-between; align-items:center; color:#ff9900;">
                    <span>${isEn ? '🛡️ Decentralized PGP Encrypted Market' : '🛡️ Mercado Descentralizado y Cifrado PGP'}</span>
                    <span>${isEn ? 'OS Wallet:' : 'Monedero OS:'} <strong style="color:#fff;">₿ ${state.walletBTC.toFixed(4)}</strong></span>
                </div>
                <div class="dw-market-grid">
            `;
            const products_es = [
                { name: "vpn_phantom.ovpn", title: "VPN Premium antirastreo", desc: "Reduce a la mitad la probabilidad de amenazas y sustos externos.", price: "0.200", stock: 3, rating: "⭐⭐⭐⭐⭐ (142 reviews)", vendor: "PhantomDev" },
                { name: "kit_pgp.key", title: "Kit Cifrado PGP Avanzado", desc: "Desbloquea el descifrado de secretos nivel 2 en tu terminal.", price: "0.150", stock: 8, rating: "⭐⭐⭐⭐ (89 reviews)", vendor: "Keysmith" },
                { name: "overclock.inf", title: "Overclock de CPU Virtual", desc: "Acelera el escaneo completo de desinfección del antivirus a solo 2s.", price: "0.250", stock: 5, rating: "⭐⭐⭐⭐⭐ (64 reviews)", vendor: "KernelMaster" },
                { name: "exploit_pack.pkg", title: "Pack Exploits Zero-Day", desc: "Desbloquea el comando terminal `exploit` para hackeos instantáneos.", price: "0.400", stock: 2, rating: "⭐⭐⭐⭐⭐ (195 reviews)", vendor: "ZeroBroker" }
            ];
            const products_en = [
                { name: "vpn_phantom.ovpn", title: "Premium Anti-Tracking VPN", desc: "Halves the probability of external threats and jump scares.", price: "0.200", stock: 3, rating: "⭐⭐⭐⭐⭐ (142 reviews)", vendor: "PhantomDev" },
                { name: "kit_pgp.key", title: "Advanced PGP Encryption Kit", desc: "Unlocks level 2 secret decryption in your terminal.", price: "0.150", stock: 8, rating: "⭐⭐⭐⭐ (89 reviews)", vendor: "Keysmith" },
                { name: "overclock.inf", title: "Virtual CPU Overclock", desc: "Accelerates complete antivirus scan and purge to only 2s.", price: "0.250", stock: 5, rating: "⭐⭐⭐⭐⭐ (64 reviews)", vendor: "KernelMaster" },
                { name: "exploit_pack.pkg", title: "Zero-Day Exploit Pack", desc: "Unlocks the terminal `exploit` command for instant system breaches.", price: "0.400", stock: 2, rating: "⭐⭐⭐⭐⭐ (195 reviews)", vendor: "ZeroBroker" }
            ];
            const products = isEn ? products_en : products_es;
            const escrowBadge = isEn ? "ESCROW ACTIVE" : "ESCRÓW ACTIVO";
            const buyBtnLabel = isEn ? "BUY" : "COMPRAR";

            products.forEach(p => {
                html += `
                <div class="dw-product" style="background: #111; border: 1px solid #333; padding: 15px; display:flex; flex-direction:column; justify-content:space-between;">
                    <div>
                        <div style="position:relative;">
                            <img src="assets/dw_market_item.png" alt="Product" style="width:100%; border: 1px solid #222; margin-bottom:10px;">
                            <span style="position:absolute; top:5px; right:5px; background:rgba(0,0,0,0.85); color:#0f0; border:1px solid #0f0; font-size:0.6rem; padding:2px 5px; border-radius:3px;">${escrowBadge}</span>
                        </div>
                        <div class="dw-product-title" style="font-size:0.95rem; font-weight:bold; color:#fff; margin-bottom:5px;">${p.title}</div>
                        <div style="font-size:0.7rem; color:#666; margin-bottom:8px; display:flex; justify-content:space-between;">
                            <span>${isEn ? 'By:' : 'Por:'} ${p.vendor}</span>
                            <span>Stock: ${p.stock} uds</span>
                        </div>
                        <p style="font-size:0.8rem; color:#888; margin-bottom:10px; line-height:1.3; min-height: 2.6em;">${p.desc}</p>
                    </div>
                    <div>
                        <div style="font-size:0.7rem; color:#ff9900; margin-bottom:10px;">${p.rating}</div>
                        <div class="dw-product-price" style="font-size:1.15rem; color:#ff9900; font-weight:bold; margin-bottom:12px;">₿ ${p.price}</div>
                        <button class="dw-btn-buy btn-dynamic-buy" data-price="${p.price}" data-file="${p.name}">${buyBtnLabel}</button>
                    </div>
                </div>`;
            });
            html += `</div>`;
        } else if (site.category === 'blog') {
            if (!site.comments) {
                site.comments = isEn ? [
                    {
                        user: `Hacker_${Math.floor(Math.random() * 999)}`,
                        text: `Great breakdown. We definitely shouldn't trust traditional cloud hosting providers.`,
                        date: "1 hour ago"
                    },
                    {
                        user: `CryptoAnon`,
                        text: `Does anyone know if the download link is still active? Need to verify the PGP key.`,
                        date: "30 mins ago"
                    }
                ] : [
                    {
                        user: `Hacker_${Math.floor(Math.random() * 999)}`,
                        text: `Excelente artículo. Definitivamente no debemos confiar en los proveedores de hosting tradicionales.`,
                        date: "Hace 1 hora"
                    },
                    {
                        user: `CriptoAnon`,
                        text: `¿Alguien sabe si el link de descarga sigue activo? Necesito verificar la firma PGP.`,
                        date: "Hace 30 mins"
                    }
                ];
            }

            let commentsHTML = "";
            site.comments.forEach(c => {
                commentsHTML += `
                    <div style="border-left: 2px solid #a00; padding-left: 12px; margin-bottom: 12px; background:#151515; padding:8px 12px;">
                        <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#777;">
                            <strong style="color:#ff3333;">${c.user}</strong>
                            <span>${c.date}</span>
                        </div>
                        <p style="font-size:0.85rem; color:#aaa; margin:5px 0 0 0; line-height:1.3;">${c.text}</p>
                    </div>
                `;
            });

            html += `
                <div class="dw-blog-article" style="background:#111; padding:25px; border-left:4px solid #a00; margin-bottom:20px;">
                    <span style="font-size:0.75rem; color:#ff3333; font-weight:bold; letter-spacing:1px; text-transform:uppercase;">${isEn ? '[INVESTIGATION ARTICLE]' : '[ARTÍCULO DE INVESTIGACIÓN]'}</span>
                    <h2 style="color:#ff3333; margin:8px 0 10px 0; font-size:1.4rem;">${isEn ? `The Hidden Truth About ${siteTopic}` : `La Verdad Oculta sobre ${siteTopic}`}</h2>
                    <p style="color:#666; font-size:0.8rem; margin-bottom:15px; border-bottom:1px solid #222; padding-bottom:10px;">
                        ${isEn ? 'Published by:' : 'Publicado por:'} <strong>Admin_Ghost</strong> | 👁️ ${site.users} ${isEn ? 'views' : 'vistas'} | 📂 ${isEn ? 'Category: Security' : 'Categoría: Seguridad'}
                    </p>
                    <div class="dw-blog-text">
                        ${getRandomLore(3)}
                    </div>
                    
                    <div style="background:#181212; border:1px solid #300; padding:15px; margin:20px 0; border-radius:4px;">
                        <h4 style="color:#ff3333; margin:0 0 5px 0; font-size:0.85rem;">🔒 ${isEn ? 'Payload / Attached Binary' : 'Payload / Binario Adjunto'}</h4>
                        <p style="font-size:0.75rem; color:#888; margin:0 0 12px 0;">${isEn ? `Contains audit scripts and dumps related to ${siteTopic}. MD5: a76f4e19022ba9bc1a72d0012` : `Contiene scripts de auditoría y volcados relacionados con ${siteTopic}. MD5: a76f4e19022ba9bc1a72d0012`}</p>
                        <button class="terminal-btn btn-dynamic-download" data-file="leak_${siteTopic.replace(/ /g, '_')}.pgp" style="border-color:#ff3333; color:#ff3333; font-size:0.8rem; padding:6px 12px; cursor:pointer; font-weight:bold; background:transparent; font-family:monospace;">${isEn ? 'DOWNLOAD ENCRYPTED FILE (.pgp)' : 'DESCARGAR ARCHIVO ENCRIPTADO (.pgp)'}</button>
                    </div>

                    <!-- Comentarios del Blog -->
                    <div style="margin-top: 30px; border-top: 1px solid #333; padding-top: 20px;">
                        <h3 style="color:#ff3333; margin-bottom:15px; font-size:1.05rem;">${isEn ? `Comments (${site.comments.length})` : `Comentarios (${site.comments.length})`}</h3>
                        <div id="blog-comments-list" style="margin-bottom: 20px; display:flex; flex-direction:column; gap:10px; max-height: 250px; overflow-y:auto; padding-right:5px;">
                            ${commentsHTML}
                        </div>
                        <div style="display:flex; gap:10px; margin-top:15px; background:#161616; padding:10px; border:1px solid #222;">
                            <input type="text" id="blog-comment-user" placeholder="Alias..." style="width: 25%; background:#000; border:1px solid #333; color:#ff3333; padding:6px; font-family:monospace; font-size:0.85rem; outline:none;" required>
                            <input type="text" id="blog-comment-text" placeholder="${isEn ? 'Write a comment...' : 'Escribe un comentario...'}" style="width: 60%; background:#000; border:1px solid #333; color:#ccc; padding:6px; font-family:monospace; font-size:0.85rem; outline:none;" required>
                            <button id="btn-blog-comment-submit" class="terminal-btn" style="border-color:#ff3333; color:#ff3333; width: 15%; padding:6px; font-size:0.8rem; font-weight:bold; cursor:pointer; font-family:monospace; background:transparent;">${isEn ? 'SEND' : 'ENVIAR'}</button>
                        </div>
                    </div>
                </div>
            `;
        } else if (site.category === 'repositorio') {
            html += `
                <div style="font-family: monospace; background:#050505; padding:20px; border:1px solid #333;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #222; padding-bottom:10px;">
                        <h2 style="margin:0; color:#0f0; font-size:1.2rem;">📁 Index of /hidden_dumps/${siteTopic.replace(/ /g, '_')}/</h2>
                        <span style="font-size:0.75rem; color:#666;">Server: Apache/2.4.41 (Ubuntu)</span>
                    </div>
                    <table style="width:100%; text-align:left; border-collapse:collapse; font-size:0.85rem;">
                        <thead>
                            <tr style="border-bottom:2px solid #222; color:#555;">
                                <th style="padding:8px;">Name</th>
                                <th style="padding:8px;">Last modified</th>
                                <th style="padding:8px; text-align:right;">Size</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom:1px solid #111;"><td style="padding:8px;">📁 <a class="fake-link free-link" style="font-size:0.85rem; color:#0f0;" data-target="random">../ (${isEn ? 'Parent Directory' : 'Directorio Padre'})</a></td><td>-</td><td style="text-align:right;">-</td></tr>
                            <tr style="border-bottom:1px solid #111;"><td style="padding:8px;">📄 <a class="fake-link free-link btn-dynamic-download" style="font-size:0.85rem; color:#88ccff;" data-file="data_leak_part1.tar.gz">data_leak_part1.tar.gz</a></td><td>${isEn ? '2 hrs ago' : 'Hace 2 hrs'}</td><td style="text-align:right; color:#888;">4.2G</td></tr>
                            <tr style="border-bottom:1px solid #111;"><td style="padding:8px;">📄 <a class="fake-link free-link btn-dynamic-download" style="font-size:0.85rem; color:#88ccff;" data-file="passwords_decrypted.txt">passwords_decrypted.txt</a></td><td>${isEn ? '5 hrs ago' : 'Hace 5 hrs'}</td><td style="text-align:right; color:#888;">120M</td></tr>
                            <tr style="border-bottom:1px solid #111;"><td style="padding:8px;">📄 <a class="fake-link free-link btn-dynamic-download" style="font-size:0.85rem; color:#88ccff;" data-file="readme_pgp.asc">readme_pgp.asc</a></td><td>${isEn ? '1 day ago' : 'Hace 1 día'}</td><td style="text-align:right; color:#888;">2K</td></tr>
                        </tbody>
                    </table>
                    
                    <div style="margin-top:25px; border-top:1px dashed #222; padding-top:15px; font-size:0.8rem; color:#555;">
                        <p style="margin:0 0 5px 0;">🔑 ${isEn ? 'Repository PGP Public Key active in keyring.' : 'Llave Pública PGP del Repositorio activa en el llavero.'}</p>
                        <p style="margin:0;">${isEn ? 'To audit signatures, verify with fingerprint: DEADBEEF-4F88-1234-ABCD-901234567890' : 'Para auditar las firmas, verifique con la huella digital: DEADBEEF-4F88-1234-ABCD-901234567890'}</p>
                    </div>
                </div>
            `;
        } else if (site.category === 'pastebin') {
            html += `
                <div style="background:#111; padding:20px; border:1px solid #333;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #222; padding-bottom:10px;">
                        <h2 style="color:#0f0; margin:0; font-size:1.2rem;">📋 ${isEn ? `Anonymous PasteDrop: ${siteTitle.replace('PasteDrop: ', '')}` : `PasteDrop Anónimo: ${siteTitle.replace('PasteDrop: ', '')}`}</h2>
                        <span style="color:#555; font-size:0.75rem;">${isEn ? `Views: ${site.users} | Expires: Never | Encryption: PGP` : `Visitas: ${site.users} | Expira: Nunca | Cifrado: PGP`}</span>
                    </div>
                    <div style="background:#0a0a0a; border:1px solid #222; padding:10px; display:flex; justify-content:space-between; font-size:0.75rem; color:#888; font-family:monospace; border-bottom:none;">
                        <span>Syntax: PGP Message Block</span>
                        <span>[Raw] | [Download] | [Clone]</span>
                    </div>
                    <textarea readonly style="width:100%; height:250px; background:#000; color:#0f0; border:1px solid #222; padding:15px; font-family:monospace; font-size:0.85rem; line-height:1.4; resize:none; outline:none; box-sizing:border-box;">
-----BEGIN PGP MESSAGE-----
Version: GnuPG v2

hQEMA+x... [${isEn ? `Encrypted data about ${siteTopic}` : `Datos cifrados sobre ${siteTopic}`}]
...
[${isEn ? `Encrypted payload detected in database dump of ${siteTopic}` : `Bloque cifrado detectado en el volcado de la base de datos de ${siteTopic}`}]
...
${isEn ? 'Primary objective: ensure node integrity and cipher rotation.' : 'El objetivo principal es asegurar la integridad del nodo de red.'}
${isEn ? 'If you decrypt this message in your terminal, contact us.' : 'Si descifras este mensaje en tu terminal, contáctanos.'}
${isEn ? 'Signature: SHA-256 (Hash verified)' : 'Firma del Mensaje: SHA-256 (Hash verificado)'}
-----END PGP MESSAGE-----</textarea>
                </div>
            `;
        } else if (site.category === 'directorio') {
            // Generar enlaces categorizados para que parezca una Hidden Wiki real
            let finanzasLinks = '';
            let forosLinks = '';
            let serviciosLinks = '';
            
            for(let k=0; k<12; k++) {
                let randomSite = deepWebDB[Math.floor(Math.random() * (deepWebDB.length - 1))];
                let rTitle = (isEn && randomSite.title_en) ? randomSite.title_en : randomSite.title;
                let rDesc = (isEn && randomSite.description_en) ? randomSite.description_en : randomSite.description;
                let itemHTML = `<li style="padding:8px 0; border-bottom:1px solid #222;">
                    <a class="fake-link free-link" style="font-size:0.95rem; font-weight:bold;" data-target="${randomSite.id}">${rTitle}</a>
                    <span style="font-size:0.7rem; color:#666; display:block; font-family:monospace; margin:2px 0;">URL: ${randomSite.url}</span>
                    <p style="color:#888; font-size:0.8rem; margin:2px 0 0 0;">${rDesc}</p>
                </li>`;
                
                if (randomSite.category === 'mercado' || randomSite.category === 'exchange' || randomSite.category === 'hitman') {
                    finanzasLinks += itemHTML;
                } else if (randomSite.category === 'foro' || randomSite.category === 'chat' || randomSite.category === 'blog') {
                    forosLinks += itemHTML;
                } else {
                    serviciosLinks += itemHTML;
                }
            }
            
            // Garantizar que no queden vacíos
            if (!finanzasLinks) finanzasLinks = `<li style="color:#555; font-size:0.8rem;">${isEn ? 'No commercial nodes active in this sector.' : 'Ningún nodo comercial activo en este momento.'}</li>`;
            if (!forosLinks) forosLinks = `<li style="color:#555; font-size:0.8rem;">${isEn ? 'No forums or chats reported.' : 'Ningún foro o chat reportado en este sector.'}</li>`;
            if (!serviciosLinks) serviciosLinks = `<li style="color:#555; font-size:0.8rem;">${isEn ? 'No services listed.' : 'Ningún servicio listado.'}</li>`;

            html += `
                <div style="background:#111; padding:20px; border:1px solid #333;">
                    <h2 style="margin:0 0 10px 0; color:#3399ff; font-size:1.3rem; text-align:center;">${isEn ? '📖 The Hidden Wiki - Link Directory' : '📖 The Hidden Wiki - Directorio de Enlaces'}</h2>
                    <p style="color:#888; font-size:0.8rem; text-align:center; margin-bottom:20px; border-bottom:1px solid #222; padding-bottom:10px;">
                        ${isEn ? 'Classified and organized .ann services. Links are maintained by the community.' : 'Servicios clasificados y organizados de la red .ann. Los enlaces son mantenidos por la comunidad.'}
                    </p>
                    
                    <div style="display:grid; grid-template-columns: 1fr; gap:25px;">
                        <div>
                            <h3 style="color:#00ff66; font-size:1rem; border-bottom:1px solid #00ff66; padding-bottom:5px; margin-bottom:10px;">${isEn ? '💰 Commercial & Financial Services' : '💰 Servicios Comerciales y Financieros'}</h3>
                            <ul style="list-style:none; padding:0; margin:0;">
                                ${finanzasLinks}
                            </ul>
                        </div>
                        
                        <div>
                            <h3 style="color:#ff9900; font-size:1rem; border-bottom:1px solid #ff9900; padding-bottom:5px; margin-bottom:10px;">${isEn ? '💬 Forums, Blogs and Channels' : '💬 Foros, Blogs y Canales'}</h3>
                            <ul style="list-style:none; padding:0; margin:0;">
                                ${forosLinks}
                            </ul>
                        </div>
                        
                        <div>
                            <h3 style="color:#00ffff; font-size:1rem; border-bottom:1px solid #00ffff; padding-bottom:5px; margin-bottom:10px;">${isEn ? '🛠️ Utilities, Leaks and Dumps' : '🛠️ Utilidades, Leaks y Dumps'}</h3>
                            <ul style="list-style:none; padding:0; margin:0;">
                                ${serviciosLinks}
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        } else if (site.category === 'redroom') {
            html += `
                <div class="dw-redroom-container">
                    <div class="redroom-header" style="background:#200; border:2px solid #a00; padding:15px; display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                        <span style="color:#f22; font-weight:bold; font-size:1.2rem; display:flex; align-items:center; gap:8px;">
                            <span class="redroom-pulse-dot" style="display:inline-block; width:12px; height:12px; background:#f22; border-radius:50%; box-shadow:0 0 8px #f22;"></span>
                            RED ROOM #0${Math.floor(Math.random()*8 + 1)}: LIVE STREAM
                        </span>
                        <span style="color:#aaa; font-size:0.9rem;">${isEn ? 'Viewers:' : 'Espectadores:'} ${site.users} | ${isEn ? 'Topic:' : 'Tema:'} ${siteTopic}</span>
                    </div>
                    
                    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:15px; margin-bottom:20px;">
                        <!-- Streaming box -->
                        <div class="redroom-video-box" style="position:relative; background:#000; border:2px solid #333; aspect-ratio:16/9; display:flex; justify-content:center; align-items:center; overflow:hidden;">
                            <img src="assets/dw_redroom.png" alt="Live Stream" style="width:100%; height:100%; object-fit:cover; opacity:0.8;">
                            <div class="redroom-scanline" style="position:absolute; top:0; left:0; width:100%; height:100%; background:linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%); background-size:100% 4px; pointer-events:none;"></div>
                            <div class="redroom-overlay" style="position:absolute; bottom:15px; left:15px; background:rgba(0,0,0,0.7); padding:8px 12px; border:1px solid #a00; font-family:monospace; font-size:0.85rem; color:#f22;">
                                FEED: CAM_0${Math.floor(Math.random()*4+1)} (ENCRYPTED P2P)<br>
                                ${isEn ? 'Status: BROADCASTING' : 'Estatus: TRANSMITIENDO'}
                            </div>
                        </div>
                        
                        <!-- Chat Box -->
                        <div class="redroom-chat" style="background:#111; border:1px solid #333; display:flex; flex-direction:column; justify-content:space-between; height:100%;">
                            <div style="background:#222; padding:8px; border-bottom:1px solid #333; color:#f22; font-size:0.85rem; font-weight:bold; text-align:center;">
                                ${isEn ? 'ANONYMOUS LIVE CHAT' : 'CHAT EN VIVO ANÓNIMO'}
                            </div>
                            <div class="redroom-chat-messages" style="flex-grow:1; padding:10px; overflow-y:auto; font-size:0.8rem; height:200px; display:flex; flex-direction:column; gap:8px; color:#ccc;">
                                <div><strong style="color:#f88;">Anon_43:</strong> ${isEn ? 'When does the main bid start?' : '¿Cuándo empieza la puja principal?'}</div>
                                <div><strong style="color:#f88;">CryptHunter:</strong> ${isEn ? 'Feed has significant latency, use local VPN.' : 'El feed tiene bastante delay, usen la VPN local.'}</div>
                                <div><strong style="color:#f88;">Kaelen_Ghost:</strong> ${isEn ? 'Bids transferred to escrow wallet.' : 'Ya he depositado las ofertas en la billetera temporal.'}</div>
                                <div><strong style="color:#f88;">Specter:</strong> ${isEn ? `Interesting transmission regarding ${siteTopic}.` : `Interesante transmisión de ${siteTopic}.`}</div>
                                <div><strong style="color:#f88;">Anon_09:</strong> ${isEn ? 'Are exit relays stable?' : '¿Están listos los nodos de salida?'}</div>
                            </div>
                            <div style="padding:8px; border-top:1px solid #333; display:flex; gap:5px;">
                                <input type="text" placeholder="${isEn ? 'Type message...' : 'Escribir...'}" style="width:75%; background:#000; border:1px solid #a00; color:#fff; padding:4px; font-size:0.75rem; font-family:monospace; outline:none;">
                                <button style="width:25%; background:#a00; color:#000; border:none; padding:4px; font-size:0.75rem; font-weight:bold; cursor:pointer;" onclick="showCustomAlert('RED ROOM CHAT', ${isEn ? '\'Invalid cryptographic signature. Live chat requires a 0.05 BTC deposit.\'' : '\'Firma criptográfica inválida. Para chatear en vivo necesitas un depósito previo de 0.05 BTC.\''}, 'error')">${isEn ? 'Send' : 'Enviar'}</button>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background:#151515; border:1px solid #333; padding:15px; margin-bottom:15px;">
                        <h3 style="color:#f22; margin-bottom:10px; font-size:1.1rem;">${isEn ? 'Control Panel & Live Bids' : 'Panel de Control y Pujas'}</h3>
                        <p style="font-size:0.85rem; color:#aaa; margin-bottom:15px;">${isEn ? `Access restricted. To unlock the raw feed without latency or participate in bids on ${siteTopic}, purchase a temporary pass.` : `Estás viendo una retransmisión de acceso denegado. Para obtener el feed principal sin compresión o realizar pujas sobre ${siteTopic}, debes adquirir una llave de acceso temporal.`}</p>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="color:#fff; font-size:0.9rem;">${isEn ? 'Key Price:' : 'Precio de la llave:'} <strong style="color:#f22;">₿ 0.125</strong></span>
                            <button class="dw-btn-buy btn-dynamic-buy" data-price="0.125" data-file="key_redroom_${site.id}.key" style="background:#a00; color:#fff; width:auto; padding:8px 20px;">${isEn ? 'BUY ACCESS' : 'COMPRAR ACCESO'}</button>
                        </div>
                    </div>
                </div>
            `;
        } else if (site.category === 'exchange') {
            html += `
                <div class="dw-exchange-container" style="background:#0c0d12; border:1px solid #1e222d; padding:20px; font-family:monospace; color:#d1d4dc;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid #1e222d; padding-bottom:15px;">
                        <span style="color:#00ff66; font-size:1.3rem; font-weight:bold; display:flex; align-items:center; gap:8px;">
                            <img src="assets/dw_exchange.png" style="width:24px; height:24px; object-fit:cover; border-radius:50%;">
                            SHADOW_EXCHANGE: Darknet Crypto Swap
                        </span>
                        <span style="color:#888; font-size:0.8rem;">${isEn ? 'OS Wallet:' : 'Monedero OS:'} <strong style="color:#00ff66;">₿ \${state.walletBTC.toFixed(4)}</strong></span>
                    </div>
                    
                    <!-- Market charts -->
                    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:20px; margin-bottom:20px;">
                        <div style="background:#131722; border:1px solid #1e222d; padding:15px;">
                            <div style="display:flex; justify-content:space-between; color:#888; font-size:0.8rem; margin-bottom:10px;">
                                <span>XMR/BTC (${isEn ? 'Private Monero' : 'Monero Privado'})</span>
                                <span style="color:#00ff66;">+4.52% (24h)</span>
                            </div>
                            <!-- ASCII Chart -->
                            <pre style="color:#00ff66; font-size:0.8rem; line-height:1.2; font-family:monospace; margin:0; background:#0b0e14; padding:10px; border:1px solid #1c2030; overflow-x:auto;">
 ₿ 0.00350 |           _/\_
 ₿ 0.00340 |       _/- \\   \\
 ₿ 0.00330 |      /     \\   \\
 ₿ 0.00320 |  _/-         \\  \\__
 ₿ 0.00310 | /             \\-   \\
 ----------+---------------------
 Vol: 1,421 XMR         Interval: 1H</pre>
                        </div>
                        
                        <div style="background:#131722; border:1px solid #1e222d; padding:15px; font-size:0.8rem;">
                            <div style="color:#888; margin-bottom:10px; font-weight:bold;">${isEn ? 'LIVE TICKERS' : 'TICKERS EN VIVO'}</div>
                            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                                <span>BTC/USD:</span><strong style="color:#fff;">$64,120</strong>
                            </div>
                            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                                <span>XMR/USD:</span><strong style="color:#00ff66;">$180.40</strong>
                            </div>
                            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                                <span>ETH/USD:</span><strong style="color:#ff3b30;">$3,450</strong>
                            </div>
                            <div style="display:flex; justify-content:space-between;">
                                <span>SOL/USD:</span><strong style="color:#00ff66;">$142.10</strong>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background:#131722; border:1px solid #1e222d; padding:15px; margin-bottom:15px;">
                        <h3 style="color:#fff; margin-bottom:12px; font-size:1rem;">${isEn ? 'Cryptographic Swapping & Mixing' : 'Swapping y Lavado Criptográfico'}</h3>
                        <p style="font-size:0.8rem; color:#888; margin-bottom:15px;">${isEn ? 'Automated service to mix BTC and swap to Monero (XMR) for 100% untraceable settlements. Process completes after 3 network confirmations.' : 'Servicio automatizado para mezclar tus bitcoins y convertirlos a Monero (XMR) para transacciones 100% irrastreables. El proceso toma 3 confirmaciones en el nodo de red virtual.'}</p>
                        
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:15px;">
                            <div style="background:#1c2030; padding:10px; border:1px solid #2a2e3f;">
                                <div style="color:#888; font-size:0.75rem; margin-bottom:5px;">${isEn ? 'YOU PAY (BTC)' : 'PAGAS (BTC)'}</div>
                                <input type="number" value="0.10" readonly style="width:100%; background:transparent; border:none; color:#fff; font-size:1.1rem; font-weight:bold; font-family:monospace; outline:none;">
                            </div>
                            <div style="background:#1c2030; padding:10px; border:1px solid #2a2e3f;">
                                <div style="color:#888; font-size:0.75rem; margin-bottom:5px;">${isEn ? 'YOU RECEIVE (XMR)' : 'RECIBES (XMR)'}</div>
                                <input type="number" value="28.57" readonly style="width:100%; background:transparent; border:none; color:#00ff66; font-size:1.1rem; font-weight:bold; font-family:monospace; outline:none;">
                            </div>
                        </div>
                        
                        <button class="dw-btn-buy btn-dynamic-buy" data-price="0.100" data-file="xmr_swap_receipt.txt" style="background:#00ff66; color:#000; font-weight:bold; padding:10px; width:100%; border:none; cursor:pointer;">${isEn ? 'START CRYPTO MIXER' : 'INICIAR MEZCLADOR CRIPTOGRÁFICO'}</button>
                    </div>
                </div>
            `;
        } else if (site.category === 'leaks') {
            html += `
                <div class="dw-leaks-container">
                    <img src="assets/dw_leaks.png" class="dw-header-img" style="width:100%; height:120px; object-fit:cover; margin-bottom:20px; border:1px solid #333;">
                    
                    <div style="background:#111; padding:15px; border:1px solid #333; margin-bottom:20px; border-left:4px solid #00ffff;">
                        <h2 style="color:#00ffff; font-size:1.2rem; margin-bottom:8px;">${siteTitle} - ${isEn ? 'Collective Transparency Archive' : 'Archivo de Transparencia Colectiva'}</h2>
                        <p style="font-size:0.85rem; color:#aaa; margin:0;">${isEn ? `Publishing state secrets, corporate corruption logs and classified files related to <strong>${siteTopic}</strong>. All submissions are verified by cryptographers.` : `Publicamos secretos gubernamentales, esquemas corruptos de corporaciones y archivos clasificados relacionados con <strong>${siteTopic}</strong>. Todas las subidas son filtradas y validadas por nuestro grupo de criptógrafos.`}</p>
                    </div>
                    
                    <div style="display:grid; grid-template-columns: 1fr; gap:15px;">
                        <div class="leak-item" style="background:#0a0a0a; border:1px solid #222; padding:15px; display:flex; flex-direction:column; gap:10px; border-left:3px solid #ff3333;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="background:#ff3333; color:#000; font-size:0.65rem; padding:2px 6px; font-weight:bold;">${isEn ? 'CLASSIFIED: TOP SECRET' : 'CLASIFICADO: TOP SECRET'}</span>
                                <span style="font-size:0.75rem; color:#555;">${isEn ? '4 hours ago' : 'Hace 4 horas'}</span>
                            </div>
                            <h3 style="color:#fff; font-size:1rem; margin:0;">${isEn ? 'Internal Dump: Biometric Surveillance Array' : 'Volcado Interno: Proyecto de Vigilancia Biométrica'}</h3>
                            <p style="font-size:0.8rem; color:#888; margin:0;">${isEn ? `Internal telecom memos detailing facial recognition indexing over urban nodes. Topic: ${siteTopic}.` : `Contiene memorandos internos de telecomunicaciones detallando el rastreo e identificación de ciudadanos mediante cámaras urbanas de baja resolución. Tema del volcado: ${siteTopic}.`}</p>
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; border-top:1px dashed #222; padding-top:10px;">
                                <span style="color:#00ffff; font-size:0.8rem;">${isEn ? 'File:' : 'Archivo:'} <strong style="color:#fff;">leak_biometrics_${site.id}.pgp</strong> (${isEn ? 'Encrypted' : 'Cifrado'})</span>
                                <button class="terminal-btn btn-dynamic-download" data-file="leak_biometrics_${site.id}.pgp" style="border-color:#00ffff; color:#00ffff; font-size:0.75rem; padding:4px 10px; cursor:pointer; background:transparent; font-family:monospace;">${isEn ? 'DOWNLOAD LEAK' : 'DESCARGAR LEAK'}</button>
                            </div>
                        </div>
                        
                        <div class="leak-item" style="background:#0a0a0a; border:1px solid #222; padding:15px; display:flex; flex-direction:column; gap:10px; border-left:3px solid #ffcc00;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="background:#ffcc00; color:#000; font-size:0.65rem; padding:2px 6px; font-weight:bold;">${isEn ? 'CONFIDENTIAL' : 'CONFIDENCIAL'}</span>
                                <span style="font-size:0.75rem; color:#555;">${isEn ? '1 day ago' : 'Hace 1 día'}</span>
                            </div>
                            <h3 style="color:#fff; font-size:1rem; margin:0;">${isEn ? 'Communication Logs: SilkSale Financial Ledger' : 'Logs de Comunicación: Finanzas Corporativas de SilkSale'}</h3>
                            <p style="font-size:0.8rem; color:#888; margin:0;">${isEn ? 'Detailed transaction audit logs and cold storage addresses tied to illicit transfers.' : 'Registros detallados de transacciones y carteras frías asociadas con transferencias ilícitas y evasión de impuestos.'}</p>
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; border-top:1px dashed #222; padding-top:10px;">
                                <span style="color:#00ffff; font-size:0.8rem;">${isEn ? 'File:' : 'Archivo:'} <strong style="color:#fff;">financial_log_${site.id}.tar.gz</strong></span>
                                <button class="terminal-btn btn-dynamic-download" data-file="financial_log_${site.id}.tar.gz" style="border-color:#00ffff; color:#00ffff; font-size:0.75rem; padding:4px 10px; cursor:pointer; background:transparent; font-family:monospace;">${isEn ? 'DOWNLOAD LEAK' : 'DESCARGAR LEAK'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (site.category === 'hitman') {
            html += `
                <div class="dw-hitman-container" style="background:#050505; border:1px solid #500; padding:20px; font-family:monospace; color:#ccc;">
                    <div style="text-align:center; border-bottom:2px solid #500; padding-bottom:20px; margin-bottom:20px;">
                        <img src="assets/dw_hitman.png" style="width:100%; max-height:150px; object-fit:cover; border:1px solid #333; margin-bottom:15px;">
                        <h1 style="color:#ff3333; font-size:1.8rem; letter-spacing:3px; margin:0;">${isEn ? siteTitle.toUpperCase() : `CONTRATOS ${siteTitle.replace('Contratos ', '')}`}</h1>
                        <p style="color:#666; font-size:0.85rem; margin-top:5px; text-transform:uppercase;">${isEn ? 'Professional Removal & Anonymous Arbitration' : 'Servicios Profesionales de Remoción y Arbitraje Anónimo'}</p>
                    </div>
                    
                    <div style="background:#111; border:1px solid #333; padding:15px; margin-bottom:20px; border-left:4px solid #a00;">
                        <h3 style="color:#fff; margin-bottom:8px; font-size:0.95rem;">${isEn ? 'CRITICAL NOTICE' : 'ADVERTENCIA IMPORTANTE'}</h3>
                        <p style="font-size:0.8rem; color:#aaa; margin:0; line-height:1.4;">${isEn ? 'We operate under total mutual anonymity. Escrow collateral must be locked before operation dispatch. No contracts accepted on high-profile public figures or minors.' : 'Operamos bajo el principio del anonimato mutuo. Los fondos deben depositarse en garantía (Escrow) de depósito cerrado antes de iniciar cualquier operación. No aceptamos solicitudes dirigidas a figuras gubernamentales de alto perfil ni menores.'}</p>
                    </div>
                    
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:20px;">
                        <div style="background:#0a0a0a; border:1px solid #222; padding:15px;">
                            <h3 style="color:#ff3333; margin-bottom:10px; font-size:0.9rem; border-bottom:1px solid #333; padding-bottom:5px;">${isEn ? 'SERVICES LIST' : 'LISTA DE SERVICIOS'}</h3>
                            <ul style="padding-left:15px; list-style-type:square; font-size:0.8rem; color:#aaa;">
                                <li style="margin-bottom:8px;">${isEn ? 'Tracking & Doxxing' : 'Localización y Rastreo (Doxx)'} - <strong style="color:#ff3333;">₿ 0.05</strong></li>
                                <li style="margin-bottom:8px;">${isEn ? 'Corporate Sabotage / DDoS' : 'Sabotaje Corporativo / DDoS'} - <strong style="color:#ff3333;">₿ 0.10</strong></li>
                                <li style="margin-bottom:8px;">${isEn ? 'Standard Contract' : 'Contrato Estándar'} - <strong style="color:#ff3333;">₿ 0.35</strong></li>
                                <li style="margin-bottom:8px;">${isEn ? 'Priority Contract' : 'Contrato Prioritario'} - <strong style="color:#ff3333;">₿ 0.60</strong></li>
                            </ul>
                        </div>
                        
                        <div style="background:#0a0a0a; border:1px solid #222; padding:15px; display:flex; flex-direction:column; gap:10px;">
                            <h3 style="color:#ff3333; margin-bottom:5px; font-size:0.9rem; border-bottom:1px solid #333; padding-bottom:5px;">${isEn ? 'SUBMIT CONTRACT' : 'REALIZAR SOLICITUD'}</h3>
                            <div style="display:flex; flex-direction:column; gap:5px; font-size:0.75rem;">
                                <label style="color:#888;">${isEn ? 'Target Alias:' : 'Alias del Objetivo:'}</label>
                                <input type="text" value="Target_Unknown" style="background:#000; border:1px solid #500; color:#fff; padding:4px; font-family:monospace; outline:none;">
                            </div>
                            <div style="display:flex; flex-direction:column; gap:5px; font-size:0.75rem;">
                                <label style="color:#888;">${isEn ? 'Contract Tier:' : 'Nivel de Contrato:'}</label>
                                <select style="background:#000; border:1px solid #500; color:#fff; padding:4px; font-family:monospace; outline:none;">
                                    <option>${isEn ? 'Tracking & Doxxing (₿ 0.05)' : 'Localización y Rastreo (₿ 0.05)'}</option>
                                    <option>${isEn ? 'Sabotage / DDoS (₿ 0.10)' : 'Sabotaje / DDoS (₿ 0.10)'}</option>
                                    <option>${isEn ? 'Standard Contract (₿ 0.35)' : 'Contrato Estándar (₿ 0.35)'}</option>
                                </select>
                            </div>
                            <button class="dw-btn-buy btn-dynamic-buy" data-price="0.050" data-file="contrato_hitman_${site.id}.txt" style="background:#ff3333; color:#000; font-weight:bold; border:none; padding:8px; cursor:pointer; font-size:0.8rem; margin-top:5px; width:100%;">${isEn ? 'PAY INITIAL DEPOSIT' : 'PAGAR DEPÓSITO INICIAL'}</button>
                        </div>
                    </div>
                </div>
            `;
        } else if (site.category === 'hosting') {
            html += `
                <div class="dw-hosting-container" style="background:#0c0f12; border:1px solid #1a233a; padding:20px; font-family:monospace; color:#8f9cae;">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #1a233a; padding-bottom:15px; margin-bottom:20px;">
                        <span style="color:#38bdf8; font-size:1.25rem; font-weight:bold; display:flex; align-items:center; gap:8px;">
                            <img src="assets/dw_hosting.png" style="width:24px; height:24px; object-fit:cover; border-radius:3px;">
                            ${siteTitle} - Bulletproof Hosting Panel
                        </span>
                        <span style="background:#15294a; color:#38bdf8; font-size:0.7rem; padding:2px 8px; border-radius:10px;">${isEn ? 'Active Relay: Tor-Relay-09' : 'Nodo Activo: Tor-Relay-09'}</span>
                    </div>
                    
                    <div style="display:grid; grid-template-columns: 1fr 2fr; gap:20px; margin-bottom:20px;">
                        <!-- Server usage panel -->
                        <div style="background:#0f172a; border:1px solid #1e293b; padding:15px; display:flex; flex-direction:column; gap:12px; font-size:0.8rem;">
                            <h3 style="color:#fff; margin:0; font-size:0.9rem; border-bottom:1px solid #1e293b; padding-bottom:5px;">${isEn ? 'NODE RESOURCES' : 'RECURSOS NODO'}</h3>
                            <div>
                                <div style="display:flex; justify-content:space-between; margin-bottom:3px;"><span>CPU Core:</span><span style="color:#38bdf8;">42%</span></div>
                                <div style="width:100%; height:6px; background:#1e293b; border-radius:3px;"><div style="width:42%; height:100%; background:#38bdf8; border-radius:3px;"></div></div>
                            </div>
                            <div>
                                <div style="display:flex; justify-content:space-between; margin-bottom:3px;"><span>${isEn ? 'RAM Usage:' : 'RAM Utilizada:'}</span><span style="color:#10b981;">68%</span></div>
                                <div style="width:100%; height:6px; background:#1e293b; border-radius:3px;"><div style="width:68%; height:100%; background:#10b981; border-radius:3px;"></div></div>
                            </div>
                            <div>
                                <div style="display:flex; justify-content:space-between; margin-bottom:3px;"><span>${isEn ? 'Storage:' : 'Almacenamiento:'}</span><span style="color:#f59e0b;">88%</span></div>
                                <div style="width:100%; height:6px; background:#1e293b; border-radius:3px;"><div style="width:88%; height:100%; background:#f59e0b; border-radius:3px;"></div></div>
                            </div>
                        </div>
                        
                        <!-- Main Content -->
                        <div style="background:#0f172a; border:1px solid #1e293b; padding:15px;">
                            <h3 style="color:#fff; margin:0; font-size:0.9rem; border-bottom:1px solid #1e293b; padding-bottom:5px; margin-bottom:10px;">${isEn ? 'ACTIVE INSTANCES' : 'SERVICIOS CONTRATADOS'}</h3>
                            <table style="width:100%; font-size:0.8rem; text-align:left; border-collapse:collapse;">
                                <tr style="color:#475569; border-bottom:1px solid #1e293b;">
                                    <th style="padding:6px 0;">${isEn ? 'Service' : 'Servicio'}</th>
                                    <th>${isEn ? 'Location' : 'Ubicación'}</th>
                                    <th>${isEn ? 'Status' : 'Estatus'}</th>
                                    <th>${isEn ? 'Action' : 'Acción'}</th>
                                </tr>
                                <tr style="border-bottom:1px solid #111827;">
                                    <td style="padding:10px 0; color:#fff;">VPS Linux Ubuntu</td>
                                    <td>${isEn ? 'Russia (Anonymous)' : 'Rusia (Anónimo)'}</td>
                                    <td><span style="color:#10b981;">● RUNNING</span></td>
                                    <td><button class="terminal-btn btn-dynamic-download" data-file="vps_key_sh.pgp" style="font-size:0.7rem; border-color:#38bdf8; color:#38bdf8; padding:2px 6px; cursor:pointer; background:transparent; font-family:monospace;">Backup SSH</button></td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 0; color:#fff;">${isEn ? 'Private .ann Domain' : 'Dominio .ann Privado'}</td>
                                    <td>${isEn ? 'P2P Mirror DNS' : 'DNS Espejo P2P'}</td>
                                    <td><span style="color:#10b981;">● ACTIVE</span></td>
                                    <td><button class="terminal-btn" style="font-size:0.7rem; border-color:#38bdf8; color:#38bdf8; padding:2px 6px; cursor:pointer; background:transparent; font-family:monospace;" onclick="showCustomAlert('DOMINIO .ANN', ${isEn ? '\'DNS configuration synchronized successfully on local router.\'' : '\'Configuración de DNS sincronizada con éxito en el router local.\''}, 'info')">${isEn ? 'Config DNS' : 'Ajustar DNS'}</button></td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    
                    <div style="background:#0f172a; border:1px solid #1e293b; padding:15px;">
                        <h3 style="color:#fff; margin-bottom:10px; font-size:0.95rem;">${isEn ? 'Bandwidth Extension / Overclock' : 'Extender Ancho de Banda / Overclock'}</h3>
                        <p style="font-size:0.8rem; color:#475569; margin-bottom:15px;">${isEn ? 'Purchase a redundant port kit to safeguard against DDoS attacks and accelerate traffic routing. Includes Apache optimization exploit.' : 'Adquiere un kit de desvío de puertos redundantes para proteger tu servidor de ataques DDoS externos y acelerar el enrutamiento. Contenido: exploit de optimización de Apache.'}</p>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="color:#fff; font-size:0.85rem;">${isEn ? 'Upgrade Cost:' : 'Costo de Mejora:'} <strong style="color:#38bdf8;">₿ 0.150</strong></span>
                            <button class="dw-btn-buy btn-dynamic-buy" data-price="0.150" data-file="overclock.inf" style="background:#38bdf8; color:#000; width:auto; padding:6px 15px; font-size:0.8rem;">${isEn ? 'BUY OVERCLOCK' : 'COMPRAR OVERCLOCK'}</button>
                        </div>
                    </div>
                </div>
            `;
        } else if (site.category === 'chat') {
            if (!site.chatHistory) {
                site.chatHistory = isEn ? [
                    { user: "Kaelen_Ghost", time: "15:40", text: `Any news on the exit relay for ${siteTopic}?` },
                    { user: "root_phantom", time: "15:42", text: "Downed by government DDoS 20 mins ago. Use backup proxies." },
                    { user: "VPN_User", time: "15:43", text: "Glad I bought the VPN kit on the market, otherwise I'd be traced." },
                    { user: "Specter_X", time: "15:45", text: `The dump on ${siteTopic} is still live on the blog, grab the archive before it's wiped.` }
                ] : [
                    { user: "Kaelen_Ghost", time: "15:40", text: `¿Alguien tiene noticias del nodo de salida de ${siteTopic}?` },
                    { user: "root_phantom", time: "15:42", text: "Cayó por DDoS del gobierno hace 20 minutos. Usen las proxies de respaldo." },
                    { user: "VPN_User", time: "15:43", text: "Menos mal que compré el kit de VPN en el mercado, sino me habrían rastreado." },
                    { user: "Specter_X", time: "15:45", text: `La información de ${siteTopic} sigue libre en el blog, bajen el zip antes de que lo purguen.` }
                ];
            }
            
            let chatLines = "";
            site.chatHistory.forEach(msg => {
                chatLines += `
                    <div style="margin-bottom:8px; line-height:1.3; font-size:0.85rem;">
                        <span style="color:#555;">[${msg.time}]</span> <strong style="color:#00ff66;">&lt;${msg.user}&gt;</strong> <span style="color:#ccc;">${msg.text}</span>
                    </div>
                `;
            });
            
            html += `
                <div class="dw-chat-container" style="background:#000; border:1px solid #00ff66; padding:20px; font-family:monospace; color:#00ff66;">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #00ff66; padding-bottom:12px; margin-bottom:15px;">
                        <span style="font-weight:bold; font-size:1.15rem; display:flex; align-items:center; gap:8px;">
                            <img src="assets/dw_chat_banner.png" style="width:24px; height:24px; object-fit:cover; border:1px solid #00ff66; border-radius:2px;">
                            IRC CHANNEL: ${siteTitle.replace('ChatRoom: ', '')}
                        </span>
                        <span style="font-size:0.8rem;">${isEn ? 'Users online:' : 'Usuarios en línea:'} ${Math.floor(Math.random()*20 + 5)}</span>
                    </div>
                    
                    <div style="background:#050505; border:1px solid #005511; padding:15px; margin-bottom:15px;">
                        <p style="margin:0 0 10px 0; font-size:0.8rem; color:#00aa44; font-style:italic;">*** ${isEn ? `You are in the room dedicated to ${siteTopic}. Logs are not retained on server. Maintain OPSEC.` : `Estás en la sala dedicada al debate sobre ${siteTopic}. Los logs del canal no se guardan en el servidor. Respeta la OPSEC.`}</p>
                        
                        <!-- Chat Message Area -->
                        <div id="chat-messages-container" style="height:220px; overflow-y:auto; border:1px solid #003300; background:#000; padding:10px; margin-bottom:15px; display:flex; flex-direction:column; gap:4px; font-family:monospace; box-sizing:border-box;">
                            ${chatLines}
                        </div>
                        
                        <!-- Input send message -->
                        <div style="display:flex; gap:10px;">
                            <input type="text" id="chat-user-alias" value="Anon_Hacker" style="width:20%; background:#000; border:1px solid #00ff66; color:#00ff66; padding:6px; font-family:monospace; font-size:0.85rem; outline:none;">
                            <input type="text" id="chat-message-input" placeholder="${isEn ? 'Type a message in IRC chat...' : 'Escribe un mensaje en el chat IRC...'}" style="width:65%; background:#000; border:1px solid #00ff66; color:#fff; padding:6px; font-family:monospace; font-size:0.85rem; outline:none;">
                            <button id="btn-chat-message-send" class="terminal-btn" style="width:15%; border-color:#00ff66; color:#00ff66; background:transparent; font-family:monospace; font-size:0.8rem; cursor:pointer;">${isEn ? 'SEND' : 'ENVIAR'}</button>
                        </div>
                    </div>
                    
                    <div style="background:#050505; border:1px solid #005511; padding:10px; font-size:0.75rem; color:#00aa44; display:flex; justify-content:space-between;">
                        <span>${isEn ? 'IRC Server: shadow_irc.ann' : 'Servidor IRC: shadow_irc.ann'}</span>
                        <span>${isEn ? 'Encoding: UTF-8 / TLS_AES_256_GCM' : 'Codificación: UTF-8 / TLS_AES_256_GCM'}</span>
                    </div>
                </div>
            `;
        }

        html += `
                </div>
                <!-- Sidebar -->
                <div class="dw-sidebar">
                    <h3>${isEn ? 'Navigation' : 'Navegación'}</h3>
                    <ul>
                        <li><a class="fake-link free-link" data-target="random">${isEn ? 'Home Page' : 'Página Principal'}</a></li>
                        <li><a class="fake-link free-link" data-target="random">${isEn ? 'Rules (PGP)' : 'Reglas (PGP)'}</a></li>
                        <li><a class="fake-link free-link" data-target="random">${isEn ? 'BTC Donations' : 'Donaciones BTC'}</a></li>
                        <li><a class="fake-link free-link" data-target="random">${isEn ? 'Allied Forums' : 'Foros Aliados'}</a></li>
                    </ul>
                    <h3 style="margin-top:20px; color:#ff3333;">${isEn ? 'Warning' : 'Advertencia'}</h3>
                    <p style="font-size:0.8rem; color:#aaa; text-align:justify; line-height: 1.4;">${isEn ? 'All traffic is monitored by active peers. Trust no one. Always verify PGP signatures before compiling or executing payloads.' : 'Toda la actividad es monitoreada por los usuarios. No confíes en nadie. Verifica todas las firmas PGP antes de descargar archivos.'}</p>
                </div>
            </div>
        </div>`;
        return html;
    }
};

window.deepWebDB = deepWebDB;
window.DWRenderer = DWRenderer;
