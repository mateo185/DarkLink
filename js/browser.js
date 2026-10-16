// --- FAKE BROWSER NAVIGATION & DEEP WEB SYSTEMS ---

function tFn(key, fallback) {
    return (typeof window.t === 'function') ? window.t(key, fallback) : fallback;
}

let activeChatTask = null;
let chatTaskInterval = null;
window.browserHistory = [];

// Helper: Inyectar un mensaje de chat directamente en el DOM sin reconstruir la página
// Esto evita que se borre el input del usuario mientras escribe
function appendChatMessageToDOM(user, time, text) {
    const chatContainer = document.getElementById('chat-messages-container');
    if (!chatContainer) return;
    const msgDiv = document.createElement('div');
    msgDiv.style.cssText = 'margin-bottom:8px; line-height:1.3; font-size:0.85rem;';
    msgDiv.innerHTML = `<span style="color:#555;">[${time}]</span> <strong style="color:#00ff66;">&lt;${user}&gt;</strong> <span style="color:#ccc;">${text}</span>`;
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function startChatTaskGenerator() {
    if (chatTaskInterval) clearInterval(chatTaskInterval);
    chatTaskInterval = setInterval(() => {
        if (!state.freeRoam || activeChatTask) return;
        
        if (Math.random() > 0.3) { // 70% chance every 20 seconds
            const topicsList = [...new Set(window.deepWebDB.filter(n => n.topic && n.category !== 'buscador').map(n => n.topic))];
            if (topicsList.length === 0) return;
            const topic = topicsList[Math.floor(Math.random() * topicsList.length)];
            
            activeChatTask = {
                expectedTopic: topic,
                isScam: Math.random() < 0.25 // 25% trampa
            };
            
            const lang = (typeof window.getLanguage === 'function') ? window.getLanguage() : 'es';
            const chatMsg = lang === 'en'
                ? `Anonymous: "Urgent link needed for [${topic}]. Paying well. Send URL."`
                : `Anónimo: "Necesito urgente un enlace sobre [${topic}]. Pago bien. Pásame la URL."`;
            postChatMessage(chatMsg, 'yellow');
            if (typeof playClickSound === 'function') playClickSound();
            
            const iconChat = document.getElementById('icon-chat');
            if (iconChat && document.getElementById('window-chat').classList.contains('hidden')) {
                iconChat.classList.add('shake-anim');
                setTimeout(() => iconChat.classList.remove('shake-anim'), 1000);
            }
        }
    }, 20000);
}

// Variable global para la edad del circuito Tor y su intervalo
let torCircuitAge = 15;
let torCircuitAgeInterval = null;

function rebuildTorCircuit() {
    const ips = [
        `84.120.${Math.floor(Math.random()*254)+1}.${Math.floor(Math.random()*254)+1}`,
        `185.92.${Math.floor(Math.random()*254)+1}.${Math.floor(Math.random()*254)+1}`,
        `95.216.${Math.floor(Math.random()*254)+1}.${Math.floor(Math.random()*254)+1}`
    ];
    const pings = [
        Math.floor(Math.random() * 15) + 15,
        Math.floor(Math.random() * 25) + 30,
        Math.floor(Math.random() * 40) + 60
    ];
    
    const relayNodes = document.querySelectorAll('.tor-circuit-nodes .relay');
    if (relayNodes.length === 3) {
        // Guard
        relayNodes[0].querySelector('.node-ip').innerText = ips[0];
        relayNodes[0].querySelector('.node-ping').innerText = `${pings[0]}ms`;
        // Middle
        relayNodes[1].querySelector('.node-ip').innerText = ips[1];
        relayNodes[1].querySelector('.node-ping').innerText = `${pings[1]}ms`;
        // Exit
        relayNodes[2].querySelector('.node-ip').innerText = ips[2];
        relayNodes[2].querySelector('.node-ping').innerText = `${pings[2]}ms`;
    }
    
    torCircuitAge = 0;
    const ageEl = document.getElementById('tor-circuit-age');
    if (ageEl) ageEl.innerText = '0s';
    
    if (typeof playWebLoadingSound === 'function') playWebLoadingSound();
    
    // Animación de destello amarillo temporal en el nodo indicador
    const dot = document.querySelector('.tor-security-badge .sec-dot');
    if (dot) {
        dot.style.background = '#ffcc00';
        dot.style.boxShadow = '0 0 8px #ffcc00';
        setTimeout(() => {
            dot.style.background = '#00ff66';
            dot.style.boxShadow = '0 0 6px #00ff66';
        }, 800);
    }
}

function initFreeModeNavigation() {
    startChatTaskGenerator();
    
    // Escuchar a todos los links de modo libre
    document.querySelectorAll('.free-link').forEach(link => {
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);
        newLink.addEventListener('click', (e) => {
            const target = e.target.getAttribute('data-target');
            if (!target) return; // Evitar navegar a nulo
            const isSuspicious = e.target.getAttribute('data-virus') === 'true';
            tryNavigate(target, isSuspicious);
        });
    });

    // Iniciar temporizador de edad del circuito Tor si no está activo
    if (!torCircuitAgeInterval) {
        torCircuitAgeInterval = setInterval(() => {
            torCircuitAge++;
            const ageEl = document.getElementById('tor-circuit-age');
            if (ageEl) ageEl.innerText = `${torCircuitAge}s`;
        }, 1000);
    }

    // Controles del Phantom Browser en Modo Libre
    const backBtn = document.getElementById('btn-ann-back');
    const homeBtn = document.getElementById('btn-ann-home');
    const reloadBtn = document.getElementById('btn-ann-reload');
    const circuitBadge = document.getElementById('btn-tor-circuit');
    const circuitCloseBtn = document.getElementById('btn-close-circuit');
    const circuitRebuildBtn = document.getElementById('btn-rebuild-circuit');
    const circuitDropdown = document.getElementById('tor-circuit-dropdown');

    if (backBtn && !backBtn.dataset.bound) {
        backBtn.dataset.bound = true;
        backBtn.addEventListener('click', () => {
            if (state.freeRoam && window.browserHistory && window.browserHistory.length > 1) {
                window.browserHistory.pop(); // quitar la pagina actual
                const prevPage = window.browserHistory.pop(); // extraer y navegar a la anterior
                if (prevPage) tryNavigate(prevPage, false);
                else tryNavigate('torch', false);
            }
        });
    }

    if (homeBtn && !homeBtn.dataset.bound) {
        homeBtn.dataset.bound = true;
        homeBtn.addEventListener('click', () => {
            if (state.freeRoam) tryNavigate('torch', false);
        });
    }

    if (reloadBtn && !reloadBtn.dataset.bound) {
        reloadBtn.dataset.bound = true;
        reloadBtn.addEventListener('click', () => {
            if (state.freeRoam && state.activePageId) {
                tryNavigate(state.activePageId, false);
            }
        });
    }

    // Toggle del panel de circuito Tor
    if (circuitBadge && !circuitBadge.dataset.bound) {
        circuitBadge.dataset.bound = true;
        circuitBadge.addEventListener('click', (e) => {
            e.stopPropagation();
            if (circuitDropdown) {
                circuitDropdown.classList.toggle('hidden');
                if (!circuitDropdown.classList.contains('hidden')) {
                    if (typeof playMenuSelectSound === 'function') playMenuSelectSound();
                }
            }
        });
    }

    if (circuitCloseBtn && !circuitCloseBtn.dataset.bound) {
        circuitCloseBtn.dataset.bound = true;
        circuitCloseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (circuitDropdown) circuitDropdown.classList.add('hidden');
        });
    }

    if (circuitRebuildBtn && !circuitRebuildBtn.dataset.bound) {
        circuitRebuildBtn.dataset.bound = true;
        circuitRebuildBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            rebuildTorCircuit();
        });
    }

    // Evento global para cerrar el dropdown si se hace clic afuera
    document.addEventListener('click', (e) => {
        if (circuitDropdown && !circuitDropdown.classList.contains('hidden')) {
            if (!circuitDropdown.contains(e.target) && e.target !== circuitBadge) {
                circuitDropdown.classList.add('hidden');
            }
        }
    });

    // Delegación de eventos para contenido dinámico
    const dynamicContainer = document.getElementById('page-dynamic');
    if (dynamicContainer && !dynamicContainer.dataset.bound) {
        dynamicContainer.dataset.bound = true;
        dynamicContainer.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.id === 'chat-message-input') {
                const sendBtn = document.getElementById('btn-chat-message-send');
                if (sendBtn) sendBtn.click();
            }
        });
        dynamicContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('free-link') && !e.target.classList.contains('btn-dynamic-download') && !e.target.classList.contains('btn-dynamic-buy')) {
                let target = e.target.getAttribute('data-target');
                if (target === 'random' && window.deepWebDB) {
                    target = window.deepWebDB[Math.floor(Math.random() * window.deepWebDB.length)].id;
                }
                if (target) {
                    tryNavigate(target, false);
                }
            } else if (e.target.classList.contains('btn-dynamic-buy')) {
                const price = parseFloat(e.target.getAttribute('data-price') || 0);
                const fileName = e.target.getAttribute('data-file') || 'dump_datos.txt';
                if (state.walletBTC >= price) {
                    updateWallet(-price);
                    if (typeof playClickSound === 'function') playClickSound();
                    e.target.innerText = "DESCARGANDO...";
                    e.target.disabled = true;
                    e.target.style.background = "#555";
                    
                    setTimeout(() => {
                        const isUpgrade = ['vpn_phantom.ovpn', 'kit_pgp.key', 'overclock.inf', 'exploit_pack.pkg'].includes(fileName);
                        const hasVirus = !isUpgrade && (Math.random() < 0.4);
                        
                        if (hasVirus) {
                            let target = window.deepWebDB ? window.deepWebDB[Math.floor(Math.random() * window.deepWebDB.length)].id : 'torch';
                            tryNavigate(target, true);
                        } else {
                            if (isUpgrade) {
                                if (fileName === 'vpn_phantom.ovpn') state.upgrades.vpn = true;
                                if (fileName === 'kit_pgp.key') {
                                    state.upgrades.pgpKey = true;
                                    if (window.StoryMode && typeof window.StoryMode.completeObjective === 'function') {
                                        window.StoryMode.completeObjective('c2_silk');
                                    }
                                }
                                if (fileName === 'overclock.inf') state.upgrades.overclock = true;
                                if (fileName === 'exploit_pack.pkg') {
                                    state.upgrades.exploitPack = true;
                                    if (window.StoryMode && typeof window.StoryMode.completeObjective === 'function') {
                                        window.StoryMode.completeObjective('c4_exploit');
                                    }
                                }
                                
                                state.vfs.push({
                                    name: fileName,
                                    content: `SOFTWARE DE MEJORA DETECTADO: ${fileName}\n----------------------------------------\nLicencia activa de Phantom OS. Efectos integrados en la memoria del kernel.\nDiagnóstico: Funcionando correctamente en modo sigilo y cargado en el OS.`,
                                    decryptedContent: "",
                                    decrypted: true,
                                    canDelete: false
                                });
                                if (typeof updateTrashUI === 'function') updateTrashUI();
                                if (typeof updateAntivirusUpgradesUI === 'function') updateAntivirusUpgradesUI();
                                if (typeof showCustomAlert === 'function') {
                                    showCustomAlert("COMPRA EXITOSA", `Mejora '${fileName}' instalada y activada en el sistema.`, "success");
                                }
                                e.target.innerText = "INSTALADO";
                                e.target.style.background = "#052e0e";
                                e.target.style.color = "#5eff82";
                                if (typeof checkTutorialProgress === 'function') checkTutorialProgress('buy', fileName);
                            } else {
                                state.vfs.push({
                                    name: fileName,
                                    content: `DATOS Y LOGS EXTRAÍDOS DE: ${fileName}\n----------------------------------------\nAquí se listan credenciales, logs de transacciones y registros financieros de SilkSale.\nClave de acceso SSH: admin_net:shadow_pass_2026\nDirección IP del servidor: 184.22.9.101`,
                                    decryptedContent: "",
                                    decrypted: true,
                                    canDelete: true
                                });
                                if (typeof updateTrashUI === 'function') updateTrashUI();
                                if (typeof showCustomAlert === 'function') {
                                    showCustomAlert("COMPRA EXITOSA", `Archivo '${fileName}' descargado y guardado en la Papelera.`, "success");
                                }
                                e.target.innerText = "COMPRADO";
                            }
                        }
                    }, 2000);
                } else {
                    if (typeof showCustomAlert === 'function') {
                        showCustomAlert("FONDOS INSUFICIENTES", "Necesitas más BTC para realizar esta compra.", "error");
                    }
                }
            } else if (e.target.classList.contains('btn-dynamic-download')) {
                const fileName = e.target.getAttribute('data-file') || 'leak_descargado.pgp';
                const hasVirus = Math.random() < 0.35; // 35% de virus
                if (hasVirus) {
                    let target = window.deepWebDB ? window.deepWebDB[Math.floor(Math.random() * window.deepWebDB.length)].id : 'torch';
                    tryNavigate(target, true);
                } else {
                    if (typeof playClickSound === 'function') playClickSound();
                    
                    const isPgp = fileName.endsWith('.pgp');
                    state.vfs.push({
                        name: fileName,
                        content: isPgp 
                            ? `-----BEGIN PGP MESSAGE-----\nVersion: GnuPG v2\n\n[Mensaje cifrado de repositorio: ${fileName}]\nUse el comando 'decrypt ${fileName}' en la Terminal.` 
                            : `DATOS EXTRAÍDOS DE REPOSITORIO: ${fileName}\n----------------------------------------\nFirma MD5: 9a2f6c91e1d0f8a9e0481c96b78d2b2f\nEste es un archivo de volcado limpio obtenido del repositorio profundo.`,
                        decryptedContent: isPgp 
                            ? `DATOS FILTRADOS EXTRAÍDOS DE: ${fileName}\n----------------------------------------\n[!] Revelación Confidencial: El atacante ha estado infiltrando servidores locales usando inyecciones SQL.\n[!] Registros de actividad indican que el nodo de salida utilizado fue 184.22.9.101.\n----------------------------------------` 
                            : "",
                        decrypted: !isPgp,
                        canDelete: true
                    });
                    if (typeof updateTrashUI === 'function') updateTrashUI();
                    if (typeof showCustomAlert === 'function') {
                        showCustomAlert("DESCARGA COMPLETADA", `El archivo '${fileName}' ha sido descargado y guardado en la Papelera de Reciclaje.`, "success");
                    }
                    if (typeof checkTutorialProgress === 'function') checkTutorialProgress('browse');
                }
            } else if (e.target.id === 'btn-blog-comment-submit') {
                const userEl = document.getElementById('blog-comment-user');
                const textEl = document.getElementById('blog-comment-text');
                if (!userEl || !textEl) return;
                
                const userVal = userEl.value.trim();
                const textVal = textEl.value.trim();
                
                if (!userVal || !textVal) {
                    if (typeof showCustomAlert === 'function') {
                        showCustomAlert("ERROR", "Debes completar el alias y el comentario.", "error");
                    }
                    return;
                }
                
                const activeSite = window.deepWebDB.find(n => n.id === state.activePageId);
                if (activeSite) {
                    if (!activeSite.comments) activeSite.comments = [];
                    activeSite.comments.push({
                        user: userVal,
                        text: textVal,
                        date: "Justo ahora"
                    });
                    loadPage(activeSite.id);
                    if (typeof playClickSound === 'function') playClickSound();
                    if (typeof showCustomAlert === 'function') {
                        showCustomAlert("COMENTARIO ENVIADO", "Tu comentario ha sido publicado en el blog.", "success");
                    }
                    
                    setTimeout(() => {
                        const npcMessage = typeof getMockAIResponse === 'function' ? getMockAIResponse(textVal, true) : "Estamos monitoreando la red.";
                        const npcNames = ["Root_Master", "BlackHat_Leo", "ShadowBroker", "ZeroCool"];
                        const randomNpc = npcNames[Math.floor(Math.random() * npcNames.length)];
                        
                        if (!activeSite.comments) activeSite.comments = [];
                        activeSite.comments.push({
                            user: randomNpc,
                            text: npcMessage,
                            date: "Justo ahora"
                        });
                        
                        if (state.activePageId === activeSite.id) {
                            loadPage(activeSite.id);
                        }
                    }, 2500);
                }
            } else if (e.target.classList.contains('forum-thread-tab')) {
                const threadIndex = parseInt(e.target.getAttribute('data-thread'));
                
                const tabs = e.target.parentElement.querySelectorAll('.forum-thread-tab');
                tabs.forEach(t => {
                    t.classList.remove('active-tab');
                    t.style.background = '#000';
                    t.style.color = '#aaa';
                    t.style.borderColor = '#333';
                });
                
                e.target.classList.add('active-tab');
                e.target.style.background = '#222';
                e.target.style.color = '#ff9900';
                e.target.style.borderColor = '#ff9900';
                
                const forumWindow = e.target.closest('#page-dynamic');
                forumWindow.querySelectorAll('.forum-thread-content').forEach((content, idx) => {
                    if (idx === threadIndex) {
                        content.classList.remove('hidden');
                    } else {
                        content.classList.add('hidden');
                    }
                });
                
                if (typeof playClickSound === 'function') playClickSound();
            } else if (e.target.classList.contains('btn-forum-comment-submit')) {
                const threadIndex = parseInt(e.target.getAttribute('data-thread'));
                const userEl = document.getElementById(`forum-comment-user-${threadIndex}`);
                const textEl = document.getElementById(`forum-comment-text-${threadIndex}`);
                if (!userEl || !textEl) return;
                
                const userVal = userEl.value.trim();
                const textVal = textEl.value.trim();
                
                if (!userVal || !textVal) {
                    if (typeof showCustomAlert === 'function') {
                        showCustomAlert("ERROR", "Debes ingresar tu alias y comentario.", "error");
                    }
                    return;
                }
                
                const activeSite = window.deepWebDB.find(n => n.id === state.activePageId);
                if (activeSite && activeSite.threadsData && activeSite.threadsData[threadIndex]) {
                    const thread = activeSite.threadsData[threadIndex];
                    
                    const playerComment = {
                        user: userVal,
                        posts: 1,
                        date: "Publicado: Hace un momento",
                        text: textVal,
                        signature: "Enviado desde Phantom OS"
                    };
                    
                    thread.comments.push(playerComment);
                    if (typeof playClickSound === 'function') playClickSound();
                    
                    loadPage(activeSite.id);
                    
                    setTimeout(() => {
                        const tabBtn = document.querySelector(`.forum-thread-tab[data-thread="${threadIndex}"]`);
                        if (tabBtn) tabBtn.click();
                    }, 50);
                    
                    if (typeof showCustomAlert === 'function') {
                        showCustomAlert("PUBLICADO", "Tu respuesta ha sido transmitida de forma anónima.", "success");
                    }
                    if (typeof checkTutorialProgress === 'function') checkTutorialProgress('browse');
                    
                    setTimeout(() => {
                        const npcMessage = typeof getMockAIResponse === 'function' ? getMockAIResponse(textVal, true) : "Procediendo con cautela.";
                        const npcNames = ["Ghost_Sec", "Kaelen_Ghost", "CriptoNet", "AnonZero", "cyber_ninja", "phreaker_88", "dark_lord"];
                        const randomNpc = npcNames[Math.floor(Math.random() * npcNames.length)];
                        
                        const npcComment = {
                            user: randomNpc,
                            posts: Math.floor(Math.random() * 400) + 10,
                            date: "Publicado: Justo ahora",
                            text: npcMessage,
                            signature: "Autonomía digital o caos."
                        };
                        
                        thread.comments.push(npcComment);
                        
                        if (state.activePageId === activeSite.id) {
                            loadPage(activeSite.id);
                            setTimeout(() => {
                                const tabBtn = document.querySelector(`.forum-thread-tab[data-thread="${threadIndex}"]`);
                                if (tabBtn) tabBtn.click();
                            }, 50);
                        }
                    }, 2500);
                }
            } else if (e.target.id === 'btn-chat-message-send') {
                const userEl = document.getElementById('chat-user-alias');
                const textEl = document.getElementById('chat-message-input');
                if (!userEl || !textEl) return;
                
                const userVal = userEl.value.trim();
                const textVal = textEl.value.trim();
                
                if (!userVal || !textVal) {
                    if (typeof showCustomAlert === 'function') {
                        showCustomAlert("ERROR", "Debes ingresar tu alias y el mensaje.", "error");
                    }
                    return;
                }
                
                const activeSite = window.deepWebDB.find(n => n.id === state.activePageId);
                if (activeSite) {
                    if (!activeSite.chatHistory) activeSite.chatHistory = [];
                    
                    const timeStr = typeof formatTime === 'function' ? formatTime(state.gameTimeMinutes) : "03:14 AM";
                    
                    activeSite.chatHistory.push({
                        user: userVal,
                        time: timeStr,
                        text: textVal
                    });
                    
                    // Inyectar el mensaje del usuario directamente sin reconstruir la página
                    appendChatMessageToDOM(userVal, timeStr, textVal);
                    textEl.value = '';
                    if (typeof playClickSound === 'function') playClickSound();
                    
                    // Primer responder (NPC 1)
                    setTimeout(() => {
                        const npcMessage1 = typeof getMockAIResponse === 'function' ? getMockAIResponse(textVal, true) : "Buen punto, vigilando los puertos.";
                        const npcNames = ["Kaelen_Ghost", "root_phantom", "VPN_User", "Specter_X", "cyber_demon", "phreak", "AnonZero", "cyber_ninja", "phreaker_88", "dark_lord"];
                        const randomNpc1 = npcNames[Math.floor(Math.random() * npcNames.length)];
                        
                        if (!activeSite.chatHistory) activeSite.chatHistory = [];
                        
                        const npcTimeStr = typeof formatTime === 'function' ? formatTime(state.gameTimeMinutes) : "03:14 AM";
                        
                        activeSite.chatHistory.push({
                            user: randomNpc1,
                            time: npcTimeStr,
                            text: npcMessage1
                        });
                        
                        if (state.activePageId === activeSite.id) {
                            appendChatMessageToDOM(randomNpc1, npcTimeStr, npcMessage1);
                        }
                        
                        // Segundo responder (NPC 2) que complementa o debate
                        setTimeout(() => {
                            let randomNpc2 = npcNames[Math.floor(Math.random() * npcNames.length)];
                            while (randomNpc2 === randomNpc1) {
                                randomNpc2 = npcNames[Math.floor(Math.random() * npcNames.length)];
                            }
                            
                            const followUpMessages = [
                                `@${randomNpc1} total, coincido. Hay que tener mucho cuidado.`,
                                `¿Seguro? Yo escuché que eso ya no funciona en servidores actualizados.`,
                                `@${randomNpc1} pasa el link si tienes la versión limpia de eso por PGP.`,
                                `Exacto, mejor prevenir. La seguridad ante todo.`,
                                `Vaya, eso explica por qué me rebotaba la IP hace rato.`,
                                `No confíen, podría ser una trampa para obtener logs.`,
                                `Mejor cifren todo antes de mandar nada.`
                            ];
                            const npcMessage2 = followUpMessages[Math.floor(Math.random() * followUpMessages.length)];
                            
                            const npcTimeStr2 = typeof formatTime === 'function' ? formatTime(state.gameTimeMinutes) : "03:14 AM";
                            
                            activeSite.chatHistory.push({
                                user: randomNpc2,
                                time: npcTimeStr2,
                                text: npcMessage2
                            });
                            
                            if (state.activePageId === activeSite.id) {
                                appendChatMessageToDOM(randomNpc2, npcTimeStr2, npcMessage2);
                            }
                        }, 1500); // 1.5s después del primer mensaje (2.5s total)
                        
                    }, 1000); // 1.0s después de que el usuario escribe
                }
            }
        });
    }

    // Lógica del buscador Torch
    const torchSearchBtn = document.getElementById('torch-search-btn');
    const torchSearchInput = document.getElementById('torch-search-input');
    if (torchSearchBtn && !torchSearchBtn.dataset.bound) {
        torchSearchBtn.dataset.bound = true;
        torchSearchBtn.addEventListener('click', () => {
            if (typeof playClickSound === 'function') playClickSound();
            const input = document.getElementById('torch-search-input').value.toLowerCase();
            const resultsContainer = document.getElementById('torch-results');
            if (!resultsContainer) return;
            resultsContainer.innerHTML = '';
            
            if (input.trim() === '' || !window.deepWebDB) return;
            
            let results = [];
            
            // Si la búsqueda incluye google o servicios relacionados, inyectar Google replica
            const googleTerms = ['google', 'gmail', 'drive', 'maps', 'translate', 'traductor', 'buscador'];
            const matchesGoogle = googleTerms.some(term => input.includes(term));
            
            if (matchesGoogle) {
                results.push({
                    id: 'google',
                    title: 'Gogle (Search, Gmail, Drive, Maps, Translate)',
                    url: 'http://www.gogle.com',
                    description: 'Acceso seguro proxy a la clearnet. Permite usar el buscador de Gogle, Gmail, Gogle Drive, Gogle Maps (localizador de IP) y el Traductor l33t.'
                });
            }
            
            const lang = (typeof window.getLanguage === 'function') ? window.getLanguage() : 'es';
            const isEn = lang === 'en';
            
            const dbResults = window.deepWebDB.filter(site => 
                (site.title && site.title.toLowerCase().includes(input)) || 
                (site.title_en && site.title_en.toLowerCase().includes(input)) || 
                (site.topic && site.topic.toLowerCase().includes(input)) || 
                (site.topic_en && site.topic_en.toLowerCase().includes(input)) || 
                (site.category && site.category.toLowerCase().includes(input)) ||
                (site.description && site.description.toLowerCase().includes(input)) ||
                (site.description_en && site.description_en.toLowerCase().includes(input))
            );
            
            results = results.concat(dbResults);
            
            if (results.length === 0) {
                const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;
                resultsContainer.innerHTML = `<p style="color:red; margin-bottom:10px;">${tFn("torch_no_results", "No se encontraron coincidencias exactas. Mostrando nodos relacionados:")}</p>`;
                for(let i=0; i<3; i++) results.push(window.deepWebDB[Math.floor(Math.random() * window.deepWebDB.length)]);
            } else {
                const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;
                const countTpl = tFn("torch_results_count", "Se encontraron {count} nodos coincidiendo con la búsqueda:");
                resultsContainer.innerHTML = `<p style="color:lime; margin-bottom:10px;">${countTpl.replace('{count}', results.length)}</p>`;
            }
            
            results.forEach(site => {
                if (site.id === 'torch') return;
                const div = document.createElement('div');
                div.style.marginBottom = '15px';
                div.style.padding = '10px';
                div.style.border = '1px dashed #555';
                div.style.background = '#1a1a1a';
                const sTitle = (isEn && site.title_en) ? site.title_en : site.title;
                const sDesc = (isEn && site.description_en) ? site.description_en : site.description;
                div.innerHTML = `
                    <a class="fake-link free-link" style="font-size: 1.2rem; display:block; margin-bottom:5px;" data-target="${site.id}">${sTitle}</a>
                    <span style="color: #0f0; font-size:0.8rem;">${site.url}</span>
                    <p style="color: #aaa; margin-top:5px; font-size: 0.9rem;">${sDesc}</p>
                `;
                resultsContainer.appendChild(div);
            });
            
            resultsContainer.querySelectorAll('.free-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    tryNavigate(e.target.getAttribute('data-target'), false);
                });
            });
        });

        // Enter en el campo de búsqueda de Torch dispara el botón _BUSCAR
        if (torchSearchInput && !torchSearchInput.dataset.bound) {
            torchSearchInput.dataset.bound = true;
            torchSearchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    torchSearchBtn.click();
                }
            });
        }
    }

    // Torch Search Recommendations
    const torchRecInput = document.getElementById('torch-search-input');
    const torchRecContainer = document.getElementById('torch-recommendations');
    if (torchRecInput && torchRecContainer && !torchRecInput.dataset.recBound) {
        torchRecInput.dataset.recBound = true;
        torchRecInput.addEventListener('input', () => {
            const val = torchRecInput.value.trim().toLowerCase();
            torchRecContainer.innerHTML = '';
            if (!val || val.length < 2) {
                torchRecContainer.classList.add('hidden');
                return;
            }
            let recs = [];
            // Check gogle/google terms
            const gogleTerms = ['google', 'gogle', 'gmail', 'drive', 'maps', 'translate', 'traductor', 'buscador'];
            if (gogleTerms.some(t => val.includes(t))) {
                recs.push({ id: 'google', title: 'Gogle (Search, Gmail, Drive, Maps, Translate)', category: 'clearnet' });
            }
            // Search deepWebDB
            if (window.deepWebDB) {
                const dbMatches = window.deepWebDB.filter(s =>
                    s.id !== 'torch' && (
                        s.title.toLowerCase().includes(val) ||
                        s.topic.toLowerCase().includes(val) ||
                        s.category.toLowerCase().includes(val)
                    )
                );
                recs = recs.concat(dbMatches);
            }
            recs = recs.slice(0, 8);
            if (recs.length === 0) {
                torchRecContainer.classList.add('hidden');
                return;
            }
            torchRecContainer.classList.remove('hidden');
            recs.forEach(site => {
                const item = document.createElement('div');
                item.style.cssText = 'padding: 8px 12px; border-bottom: 1px solid #333; cursor: pointer; color: #ff6600; font-family: monospace; font-size: 0.9rem; transition: background 0.15s; text-align: left; box-sizing: border-box;';
                item.innerHTML = `<span style="font-weight:bold;">${site.title}</span> <span style="color:#888; font-size:0.75rem; margin-left:8px;">[${site.category || 'clearnet'}]</span>`;
                item.addEventListener('mouseenter', () => { item.style.background = '#1a0a00'; });
                item.addEventListener('mouseleave', () => { item.style.background = 'transparent'; });
                item.addEventListener('click', () => {
                    torchRecContainer.classList.add('hidden');
                    torchRecInput.value = site.title;
                    tryNavigate(site.id, false);
                });
                torchRecContainer.appendChild(item);
            });
        });
        // Hide recs on click outside
        document.addEventListener('click', (e) => {
            if (!torchRecContainer.contains(e.target) && e.target !== torchRecInput) {
                torchRecContainer.classList.add('hidden');
            }
        });
    }

    // Initialize browser tabs if in Free Roam and not already initialized
    if (state.freeRoam) {
        if (!window.browserTabs || window.browserTabs.length === 0) {
            window.browserTabs = [
                { pageId: 'torch', title: 'Torch Search', history: ['torch'], url: 'http://torchsearch3x21d.ann/' }
            ];
            window.activeTabIdx = 0;
        }
        renderBrowserTabs();
    }
}

function startAnnLoader(targetPageId, callback) {
    if (!targetPageId) {
        setTimeout(callback, 10);
        return;
    }
    const logsContainer = document.getElementById('ann-loader-log');
    const progressBar = document.getElementById('ann-loader-bar');
    const percentText = document.getElementById('ann-loader-percent');
    
    if (!logsContainer || !progressBar || !percentText) {
        setTimeout(callback, 1000);
        return;
    }
    
    logsContainer.innerHTML = '';
    progressBar.style.width = '0%';
    percentText.innerText = '0%';
    
    let destUrl = "torchsearch3x21d.ann";
    if (targetPageId.startsWith('google')) {
        destUrl = targetPageId === 'google' ? 'google.com' : targetPageId.replace('google-', '') + '.google.com';
    } else if (window.deepWebDB) {
        const site = window.deepWebDB.find(n => n.id === targetPageId);
        if (site) destUrl = site.url.replace('http://', '');
    }
    
    // Obtener las IPs dinámicas del circuito actual
    const relayNodes = document.querySelectorAll('.tor-circuit-nodes .relay');
    let guardIp = "84.120.43.19";
    let midIp = "185.92.220.10";
    let exitIp = "95.216.14.88";
    if (relayNodes.length === 3) {
        guardIp = relayNodes[0].querySelector('.node-ip').innerText;
        midIp = relayNodes[1].querySelector('.node-ip').innerText;
        exitIp = relayNodes[2].querySelector('.node-ip').innerText;
    }
    
    const lang = (typeof window.getLanguage === 'function') ? window.getLanguage() : 'es';
    const isEn = lang === 'en';

    const steps = isEn ? [
        { text: `[PHANTOM] Resolving Onion circuit for: ${targetPageId}...`, delay: 0, pct: 10 },
        { text: `[PHANTOM] Guard Relay: Connected to ${guardIp} (Germany) [Ping: 22ms]`, delay: 250, pct: 28 },
        { text: `[PHANTOM] Middle Relay: Encrypting tunnel via ${midIp} (Iceland) [Ping: 45ms]`, delay: 500, pct: 52 },
        { text: `[PHANTOM] Exit Relay: Decrypting headers at ${exitIp} (Russia) [Ping: 79ms]`, delay: 750, pct: 75 },
        { text: `[PHANTOM] Onion circuit negotiation completed successfully.`, delay: 1000, pct: 88 },
        { text: `[PHANTOM] Transmitting secure request to: ${destUrl}`, delay: 1200, pct: 95 },
        { text: `[PHANTOM] Hidden service HTTP response received. Rendering site.`, delay: 1450, pct: 100 }
    ] : [
        { text: `[PHANTOM] Resolviendo circuito Onion para: ${targetPageId}...`, delay: 0, pct: 10 },
        { text: `[PHANTOM] Guard Relay: Conectado a ${guardIp} (Alemania) [Ping: 22ms]`, delay: 250, pct: 28 },
        { text: `[PHANTOM] Middle Relay: Cifrando túnel vía ${midIp} (Islandia) [Ping: 45ms]`, delay: 500, pct: 52 },
        { text: `[PHANTOM] Exit Relay: Desencriptando cabeceras en ${exitIp} (Rusia) [Ping: 79ms]`, delay: 750, pct: 75 },
        { text: `[PHANTOM] Negociación de circuito Onion completada con éxito.`, delay: 1000, pct: 88 },
        { text: `[PHANTOM] Transmitiendo petición segura a: ${destUrl}`, delay: 1200, pct: 95 },
        { text: `[PHANTOM] Respuesta HTTP de servicio oculto recibida. Renderizando sitio.`, delay: 1450, pct: 100 }
    ];
    
    steps.forEach(step => {
        setTimeout(() => {
            const div = document.createElement('div');
            div.innerText = step.text;
            logsContainer.appendChild(div);
            logsContainer.scrollTop = logsContainer.scrollHeight;
            
            progressBar.style.width = `${step.pct}%`;
            percentText.innerText = `${step.pct}%`;
            
            if (typeof playMenuSelectSound === 'function') {
                playMenuSelectSound();
            }
        }, step.delay);
    });
    
    setTimeout(() => {
        callback();
    }, 1750);
}

function tryNavigate(targetPageId, isSuspicious = false) {
    if (!targetPageId) return;
    if (isSuspicious) {
        if (typeof triggerRandomMinigame === 'function') {
            triggerRandomMinigame(() => loadPage(targetPageId));
        } else {
            loadPage(targetPageId);
        }
    } else {
        const loadingOverlay = document.getElementById('browser-loading');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('hidden');
            
            if (state.freeRoam) {
                // Modo Libre: Usar Cargador Terminal Onion
                const classicLoader = document.getElementById('loader-classic');
                const annLoader = document.getElementById('loader-ann');
                if (classicLoader) classicLoader.classList.add('hidden');
                if (annLoader) annLoader.classList.remove('hidden');
                
                if (typeof playWebLoadingSound === 'function') playWebLoadingSound();
                
                startAnnLoader(targetPageId, () => {
                    loadingOverlay.classList.add('hidden');
                    loadPage(targetPageId);
                });
            } else {
                // Modo Historia: Usar Cargador Clásico
                const classicLoader = document.getElementById('loader-classic');
                const annLoader = document.getElementById('loader-ann');
                if (classicLoader) classicLoader.classList.remove('hidden');
                if (annLoader) annLoader.classList.add('hidden');
                
                if (typeof playWebLoadingSound === 'function') playWebLoadingSound();
                const fakeTime = Math.floor(Math.random() * 1500) + 500;
                setTimeout(() => {
                    loadingOverlay.classList.add('hidden');
                    loadPage(targetPageId);
                }, fakeTime);
            }
        } else {
            loadPage(targetPageId);
        }
    }
}

function loadPage(pageId) {
    state.activePageId = pageId;

    // Check if it's one of the Google Pages or special standalone pages
    const specialPages = ['google', 'google-gmail', 'google-drive', 'google-maps', 'google-translate', 'dark-game'];
    if (specialPages.includes(pageId)) {
        document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
        const dynamicContainer = document.getElementById('page-dynamic');
        if (dynamicContainer) {
            dynamicContainer.innerHTML = '';
            dynamicContainer.classList.add('hidden');
        }
        
        // Show corresponding Google page
        const googlePage = document.getElementById('page-' + pageId);
        if (googlePage) googlePage.classList.remove('hidden');
        
        // Update URL
        let url = "http://www.gogle.com/";
        if (pageId === 'google-gmail') url = "http://mail.gogle.com/";
        else if (pageId === 'google-drive') url = "http://drive.gogle.com/";
        else if (pageId === 'google-maps') url = "http://maps.gogle.com/";
        else if (pageId === 'google-translate') url = "http://translate.gogle.com/";
        else if (pageId === 'dark-game') url = "http://darklightergame88x.ann/";
        updateBrowserURL(url);
        
        // Push to history
        if (!window.browserHistory) window.browserHistory = [];
        if (window.browserHistory[window.browserHistory.length - 1] !== pageId) {
            window.browserHistory.push(pageId);
        }
        
        // Custom Google Initializers (reset views)
        if (pageId === 'google') {
            const homeView = document.getElementById('google-search-home');
            const resultsView = document.getElementById('google-search-results');
            if (homeView) homeView.classList.remove('hidden');
            if (resultsView) resultsView.classList.add('hidden');
        }
        
        // Re-draw game menu when navigating to dark-game
        if (pageId === 'dark-game' && window.sdLighter) {
            if (!window.sdLighter.running) {
                window.sdLighter.drawMenu();
            }
        }
    } else {
        document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
        
        if (pageId !== 'torch') {
            if (typeof checkTutorialProgress === 'function') checkTutorialProgress('browse');
        }
        
        let targetNode = null;
        if (window.deepWebDB) {
            targetNode = window.deepWebDB.find(n => n.id === pageId);
        }

        if (state.freeRoam && ['wiki', 'tracker', 'pastedumps', 'market'].includes(pageId)) {
            targetNode = null; // Force treat as non-existent in Free Roam
        }

        if (pageId === 'vault77' || pageId === 'vault77.ann') {
            const dynamicContainer = document.getElementById('page-dynamic');
            if (dynamicContainer) {
                dynamicContainer.innerHTML = `
                    <div style="background:#060d13; border:2px solid #00e5ff; color:#00e5ff; font-family:monospace; padding:25px; border-radius:4px; max-width:700px; margin:20px auto; box-shadow:0 0 25px rgba(0,229,255,0.2);">
                        <div style="border-bottom:1px solid #00e5ff; padding-bottom:10px; margin-bottom:15px; display:flex; justify-content:space-between; align-items:center;">
                            <h2 style="margin:0; font-family:'VT323',monospace; font-size:1.8rem; color:#00e5ff;">🔒 BÓVEDA SEGURA VAULT-77 — SERVIDOR PRIVADO</h2>
                            <span style="color:#ffcc00; font-size:0.8rem; background:#201800; border:1px solid #ffcc00; padding:2px 6px;">ESTADO: ENCRIPTADO</span>
                        </div>
                        <p style="color:#a0d0e0; font-size:0.9rem; line-height:1.5;">
                            > Acceso restringido a operadores autorizados del Proyecto Puppeteer 1998.<br>
                            > Ingrese la clave de autenticación transmitida por radio FM o interceptada en el nodo para descargar el volcado de memoria de seguridad (<b>dump_core.bin</b>).
                        </p>
                        <div style="margin:20px 0; background:rgba(0,0,0,0.5); padding:15px; border:1px solid #1a3a4a; border-radius:3px;">
                            <label style="color:#00e5ff; display:block; margin-bottom:8px; font-weight:bold;">CLAVE DE DESCARGA:</label>
                            <div style="display:flex; gap:10px;">
                                <input type="text" id="vault77-pass" placeholder="Ingrese clave..." style="background:#000; border:1px solid #00e5ff; color:#fff; padding:8px 12px; font-family:monospace; flex:1; font-size:1rem;">
                                <button id="btn-vault77-download" style="background:#00e5ff; color:#000; border:none; padding:8px 18px; font-family:'VT323',monospace; font-size:1.2rem; cursor:pointer; font-weight:bold;">DESCARGAR</button>
                            </div>
                            <div id="vault77-msg" style="margin-top:10px; font-size:0.85rem;"></div>
                        </div>
                    </div>
                `;
                dynamicContainer.classList.remove('hidden');
                updateBrowserURL("http://vault77.ann/");
                
                const btnDl = document.getElementById('btn-vault77-download');
                const passInput = document.getElementById('vault77-pass');
                const msgEl = document.getElementById('vault77-msg');
                if (btnDl && passInput) {
                    btnDl.onclick = () => {
                        const pass = passInput.value.trim().toUpperCase();
                        if (pass === 'X9-DELTA-44' || pass === 'PUPPETEER' || pass === 'VAULT77' || (window.state && window.state.storyMode && window.state.storyMode.chapter >= 1)) {
                            msgEl.innerHTML = "<span style='color:#00ff66;'>✓ AUTENTICACIÓN CORRECTA. Descargando 'dump_core.bin' al sistema de archivos local...</span>";
                            if (window.StoryMode && typeof window.StoryMode.completeObjective === 'function') {
                                window.StoryMode.completeObjective('c1_torch');
                            }
                            if (window.state && window.state.vfs) {
                                if (!window.state.vfs.find(f => f.name === 'dump_core.bin')) {
                                    window.state.vfs.push({
                                        name: "dump_core.bin",
                                        content: "-----BEGIN ENCRYPTED MEMORY DUMP-----\nPROJECT_PUPPETEER_NODE_77\n[RSA-2048 ENCRYPTED DATA: 0x9F4C1B...]\n\nDescifra este volcado ejecutando:\ndecrypt dump_core.bin\n-----END ENCRYPTED DUMP-----",
                                        decryptedContent: "PROYECTO PUPPETEER - ARCHIVO CONFIDENCIAL DESCLASIFICADO\n=======================================================\n> SUJETO: Operador de Nodo Local (Usuario 1998).\n> ESTADO: Bajo vigilancia perimetral activa.\n> ENTIDAD BIOLÓGICA ASIGNADA: Colector de Pasillo Modelo-IV.\n> ADVERTENCIA: La entidad responde al ruido y a las emisiones electromagnéticas del monitor CRT. Si el monitor está encendido durante la recolección, el sujeto será eliminado.\n> SERVIDOR PRINCIPAL: http://puppeteer-project.ann/ (IP: 184.22.9.101)\n=======================================================",
                                        decrypted: false,
                                        canDelete: false
                                    });
                                }
                            }
                            if (typeof updateTrashUI === 'function') updateTrashUI();
                            if (typeof showCustomAlert === 'function') {
                                showCustomAlert("DESCARGA COMPLETADA", "'dump_core.bin' guardado en tu disco local. Descífralo con Terminal Root.", "success");
                            }
                        } else {
                            msgEl.innerHTML = "<span style='color:#ff3333;'>✗ CLAVE INVÁLIDA. Sintoniza la estación 'Numbers Station' en la Radio Boombox para obtenerla.</span>";
                        }
                    };
                }
            }
            return;
        }

        if (pageId === 'puppeteer-project' || pageId === 'puppeteer-project.ann') {
            const dynamicContainer = document.getElementById('page-dynamic');
            if (dynamicContainer) {
                dynamicContainer.innerHTML = `
                    <div style="background:#100406; border:2px solid #ff3366; color:#ff8899; font-family:monospace; padding:25px; border-radius:4px; max-width:750px; margin:20px auto; box-shadow:0 0 25px rgba(255,51,102,0.25);">
                        <div style="border-bottom:1px solid #ff3366; padding-bottom:10px; margin-bottom:15px; display:flex; justify-content:space-between; align-items:center;">
                            <h2 style="margin:0; font-family:'VT323',monospace; font-size:1.8rem; color:#ff3366;">☣ PROYECTO PUPPETEER — NODO CENTRAL 184.22.9.101</h2>
                            <span style="color:#ffcc00; font-size:0.8rem; background:#300; border:1px solid #ff3366; padding:2px 6px;">NIVEL OMEGA</span>
                        </div>
                        <p style="color:#f0c0c8; font-size:0.9rem; line-height:1.5;">
                            > <b>INVESTIGACIÓN GLOBAL DE VIGILANCIA BIOLÓGICA</b>.<br>
                            > Los usuarios que acceden al foro DarkLink son clasificados como especímenes. Las entidades son desplegadas en sus domicilios para neutralizar filtraciones.
                        </p>
                        <div style="background:rgba(0,0,0,0.6); border:1px solid #501018; padding:12px; margin:15px 0; border-radius:3px; font-size:0.85rem;">
                            <p style="color:#00ff66; margin:0 0 6px 0;">[ LISTA DE PROTOCOLOS DESCLASIFICADOS ]</p>
                            <p style="margin:4px 0;">• Protocolo Colector Pasillo: Activado.</p>
                            <p style="margin:4px 0;">• Protocolo Intrusión Remota: Activo en puerto 443.</p>
                            <p style="margin:4px 0;">• Vulnerabilidad del Servidor: Vulnerable a 'exploit_pack.pkg' y purga total con 'purge_master.sh'.</p>
                        </div>
                    </div>
                `;
                dynamicContainer.classList.remove('hidden');
                updateBrowserURL("http://puppeteer-project.ann/");
                if (window.StoryMode && typeof window.StoryMode.completeObjective === 'function') {
                    window.StoryMode.completeObjective('c4_search');
                }
            }
            return;
        }

        if (targetNode && pageId !== 'torch') {
            const dynamicContainer = document.getElementById('page-dynamic');
            if (dynamicContainer) {
                dynamicContainer.innerHTML = window.DWRenderer.renderSite(targetNode);
                dynamicContainer.classList.remove('hidden');
                if (targetNode.category === 'chat') {
                    const chatContainer = document.getElementById('chat-messages-container');
                    if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
                }
            }
            updateBrowserURL(targetNode.url);
        } else {
            const dynamicContainer = document.getElementById('page-dynamic');
            if (dynamicContainer) {
                dynamicContainer.innerHTML = '';
                dynamicContainer.classList.add('hidden');
            }

            if (pageId === 'torch') {
                const pageTorch = document.getElementById('page-torch');
                if (pageTorch) pageTorch.classList.remove('hidden');
                updateBrowserURL("http://torchsearch3x21d.ann/");
                const idxCount = document.getElementById('torch-index-count');
                if (idxCount && window.deepWebDB) {
                    idxCount.innerText = window.deepWebDB.length;
                }
            } else {
                if (state.freeRoam) {
                    // Render a retro 404 Not Found page for Free Roam
                    if (typeof playErrorSound === 'function') playErrorSound();
                    if (dynamicContainer) {
                        dynamicContainer.innerHTML = `
                            <div style="background:#111; padding:30px; border:1px solid #333; text-align:center; font-family:monospace; color:#ff3333; margin-top:50px; border-radius:4px;">
                                <h1 style="font-size:3rem; margin-bottom:20px; text-shadow:0 0 10px red;">404 NOT FOUND</h1>
                                <p style="color:#aaa; font-size:1.1rem; margin-bottom:30px;">El nodo solicitado no responde o ha sido desactivado.</p>
                                <button class="terminal-btn free-link" data-target="torch" style="border:1px solid #ff6600; padding:10px 20px; color:#ff6600; background:transparent; font-family:monospace; cursor:pointer;">_VOLVER_A_TORCH</button>
                            </div>
                        `;
                        dynamicContainer.classList.remove('hidden');
                    }
                    let url = `http://${Math.random().toString(36).substr(2,10)}.ann/null_node`;
                    updateBrowserURL(url);
                } else {
                    const targetPage = document.getElementById('page-' + pageId) || document.getElementById('page-wiki');
                    if (targetPage) targetPage.classList.remove('hidden');
                    let url = "http://nightlink.network/" + pageId;
                    updateBrowserURL(url);
                }
            }
        }
    }
    
    if (!window.browserHistory) window.browserHistory = [];
    if (window.browserHistory[window.browserHistory.length - 1] !== pageId) {
        window.browserHistory.push(pageId);
    }
    
    // Resolve page title and URL
    const lang = (typeof window.getLanguage === 'function') ? window.getLanguage() : 'es';
    const isEn = lang === 'en';
    let tabTitle = isEn ? "Loading..." : "Cargando...";
    let currentUrlText = isEn ? "unknown.ann" : "desconocido.ann";
    
    if (pageId === 'torch') {
        tabTitle = "Torch Search";
        currentUrlText = "torchsearch3x21d.ann";
    } else if (pageId === 'google') {
        tabTitle = "Gogle Search";
        currentUrlText = "gogle.com";
    } else if (pageId === 'google-gmail') {
        tabTitle = "Gmail";
        currentUrlText = "mail.gogle.com";
    } else if (pageId === 'google-drive') {
        tabTitle = "Gogle Drive";
        currentUrlText = "drive.gogle.com";
    } else if (pageId === 'google-maps') {
        tabTitle = "Gogle Maps";
        currentUrlText = "maps.gogle.com";
    } else if (pageId === 'google-translate') {
        tabTitle = isEn ? "Gogle Translate" : "Gogle Traductor";
        currentUrlText = "translate.gogle.com";
    } else if (pageId === 'dark-game') {
        tabTitle = "Dark Lighter";
        currentUrlText = "darklightergame88x.ann";
    } else if (window.deepWebDB) {
        const site = window.deepWebDB.find(n => n.id === pageId);
        if (site) {
            tabTitle = (isEn && site.title_en) ? site.title_en : site.title;
            currentUrlText = site.url.replace('http://', '').replace('/', '');
        } else {
            tabTitle = "404 Not Found";
        }
    } else {
        tabTitle = pageId;
    }
    
    const activeUrl = document.querySelector('.browser-address input') ? document.querySelector('.browser-address input').value : '';

    // Sync with active tab
    if (state.freeRoam && window.browserTabs && window.browserTabs[window.activeTabIdx]) {
        const activeTab = window.browserTabs[window.activeTabIdx];
        activeTab.pageId = pageId;
        activeTab.title = tabTitle;
        activeTab.url = activeUrl;
        if (activeTab.history[activeTab.history.length - 1] !== pageId) {
            activeTab.history.push(pageId);
        }
    }

    // Actualizar pestaña superior (Modo Libre) y destino del circuito Tor
    if (state.freeRoam && !_switchingTab) {
        renderBrowserTabs();
    }
}

function updateBrowserURL(url) {
    const input = document.querySelector('.browser-address input');
    if (input) input.value = url;
}

// Bucle de comentarios foros dinámicos (Modo Libre)
setInterval(() => {
    if (!state.freeRoam) return;
    const forumContainer = document.getElementById('dynamic-forum-posts');
    const activeSite = window.deepWebDB ? window.deepWebDB.find(n => n.id === state.activePageId) : null;
    if (forumContainer && activeSite && activeSite.category === 'foro') {
        if (Math.random() < 0.3) {
            const topic = activeSite.topic;
            let isUserDox = false;
            if (state.lastCapturedPhoto && Math.random() < 0.3) {
                isUserDox = true;
            }

            const currentLang = (typeof window.getLanguage === 'function') ? window.getLanguage() : 'es';
            const isEnglish = currentLang === 'en';

            const msgs_es = isUserDox ? [
                `¡Miren a este novato navegando sin proxy! Tenemos visual.`,
                `¿Es este el tipo que está buscando sobre ${topic}? Qué cara de susto.`,
                `Alguien dejó su webcam abierta... miren lo que encontré.`,
                `Captura detectada en el nodo de salida. Sonríe, amigo.`
            ] : [
                `¿Alguien ha encontrado un nuevo nodo relacionado con ${topic}?`,
                `Los precios de información sobre ${topic} están subiendo...`,
                `Tengan cuidado, he visto bots rastreando este hilo de ${topic}.`,
                `Tengo 0.5 BTC para el primero que comparta los archivos reales de ${topic}.`,
                `Fake news. Nada de lo que hay aquí sobre ${topic} es real.`
            ];

            const msgs_en = isUserDox ? [
                `Look at this rookie browsing without proxy! We have visual.`,
                `Is this the guy searching about ${topic}? Look at that scared face.`,
                `Someone left their webcam open... look what I found.`,
                `Capture detected at exit node. Smile, friend.`
            ] : [
                `Anyone found a new node related to ${topic}?`,
                `Prices for intelligence on ${topic} are going up...`,
                `Be careful, I've seen crawlers tracking this ${topic} thread.`,
                `I've got 0.5 BTC for the first person to share actual files on ${topic}.`,
                `Fake news. Nothing posted here about ${topic} is real.`
            ];

            const msgs = isEnglish ? msgs_en : msgs_es;
            const msg = msgs[Math.floor(Math.random() * msgs.length)];
            const userPrefix = isEnglish ? "User_" : "Usuario_";
            const username = `${userPrefix}${Math.floor(Math.random()*9999)}`;
            const postsCount = Math.floor(Math.random() * 500);
            const dateStr = isEnglish ? "Posted: Just now" : "Publicado: Justo ahora";
            const signatureStr = isEnglish ? "Information wants to be free." : "La información quiere ser libre.";
            const badgeTag = isEnglish ? "REAL_TIME_CAPTURE" : "CAPTURA_REAL_TIME";
            
            let doxImageHTML = "";
            if (isUserDox) {
                doxImageHTML = `
                    <div style="margin-top: 10px; border: 2px solid red; background: #000; padding: 5px; position: relative; max-width: 320px;">
                        <img src="${state.lastCapturedPhoto}" style="width: 100%; display: block; filter: sepia(0.8) contrast(1.3) grayscale(0.3); border: 1px solid #500;">
                        <div style="position: absolute; top: 10px; left: 10px; background: red; color: white; font-size: 0.7rem; padding: 2px 6px; font-weight: bold; font-family: monospace; letter-spacing: 1px;">${badgeTag}</div>
                    </div>
                `;
            }

            const newComment = {
                user: username,
                posts: postsCount,
                date: dateStr,
                text: msg,
                isUserDox: isUserDox,
                doxImageHTML: doxImageHTML,
                signature: signatureStr
            };

            if (!activeSite.comments) {
                activeSite.comments = [];
            }
            activeSite.comments.unshift(newComment);
            if (activeSite.comments.length > 15) {
                activeSite.comments.pop();
            }

            const newPost = document.createElement('div');
            newPost.className = "dw-forum-post";
            newPost.style.borderLeft = "3px solid lime";
            
            const avatar = "assets/dw_hacker_group.png";
            newPost.innerHTML = `
                <div class="dw-forum-user">
                    <img src="${avatar}" alt="Avatar" style="width: 80px; height: 80px; object-fit: cover; border: 1px solid #444;">
                    <br><strong>${username}</strong>
                    <br><span style="font-size:0.7rem; color:#666;">Posts: ${postsCount}</span>
                </div>
                <div class="dw-forum-body">
                    <div class="dw-forum-date" style="color:lime;">${dateStr}</div>
                    <p style="margin-bottom: 10px; text-align: justify; color: #ccc;">${msg}</p>
                </div>
            `;
            
            if (isUserDox) {
                newPost.style.borderLeft = "3px solid red";
                newPost.innerHTML = `
                    <div class="dw-forum-user">
                        <img src="${avatar}" alt="Avatar" style="width: 80px; height: 80px; object-fit: cover; border: 1px solid #444;">
                        <br><strong style="color:red;">${username}</strong>
                        <br><span style="font-size:0.7rem; color:#666;">Posts: ${postsCount}</span>
                    </div>
                    <div class="dw-forum-body">
                        <div class="dw-forum-date" style="color:red;">${dateStr}</div>
                        <p style="margin-bottom: 10px; text-align: justify; color: #f88; font-weight: bold;">${msg}</p>
                        ${doxImageHTML}
                    </div>
                `;
            }

            forumContainer.prepend(newPost);
            
            if (forumContainer.children.length > 15) {
                forumContainer.removeChild(forumContainer.lastChild);
            }
        }
    }
}, 4000);

// Bucle de chat IRC activo (Modo Libre)
setInterval(() => {
    if (!state.freeRoam) return;
    const activeSite = window.deepWebDB ? window.deepWebDB.find(n => n.id === state.activePageId) : null;
    if (activeSite && activeSite.category === 'chat') {
        if (Math.random() < 0.45) { // 45% de probabilidad cada 8 segundos
            const npcNames = ["Kaelen_Ghost", "root_phantom", "VPN_User", "Specter_X", "cyber_demon", "phreak", "AnonZero", "cyber_ninja", "phreaker_88", "dark_lord"];
            const randomNpc = npcNames[Math.floor(Math.random() * npcNames.length)];
            
            const msgs = [
                `¿Alguien vio las últimas filtraciones en el nodo leaks?`,
                `¿Cómo va la cotización del BTC hoy?`,
                `Creo que hay un sniffer en este canal. Tengan cuidado.`,
                `Alguien está escaneando puertos en el rango local.`,
                `¿SilkSale volvió a caer? No me conecta.`,
                `La RedRoom #02 está en vivo ahora, sintonicen.`,
                `Busco un exploit zero-day limpio para ssh.`,
                `Usa PGP para todo o te rastrearán en minutos.`,
                `El mezclador de Shadow Exchange funciona bastante rápido.`,
                `¿Alguien activo para cooperar en un escaneo remoto?`
            ];
            const msg = msgs[Math.floor(Math.random() * msgs.length)];
            
            const timeStr = typeof formatTime === 'function' ? formatTime(state.gameTimeMinutes) : "03:14 AM";
            
            if (!activeSite.chatHistory) activeSite.chatHistory = [];
            activeSite.chatHistory.push({
                user: randomNpc,
                time: timeStr,
                text: msg
            });
            if (activeSite.chatHistory.length > 20) activeSite.chatHistory.shift();
            
            if (state.activePageId === activeSite.id) {
                appendChatMessageToDOM(randomNpc, timeStr, msg);
            }
        }
    }
}, 8000);

// Bucle de Captura Sigilosa y Doxxeo
setInterval(() => {
    if (!state.freeRoam || !state.webcamStream) return;

    if (typeof takePhoto === 'function') {
        const photo = takePhoto();
        if (photo) state.lastCapturedPhoto = photo;
    }

    if (Math.random() < 0.05) {
        if (typeof triggerDoxAlert === 'function') triggerDoxAlert();
    }
}, 30000);

// Event Bindings
document.addEventListener('DOMContentLoaded', () => {
    const iconBrowser = document.getElementById('icon-browser');
    const btnCloseBrowser = document.getElementById('btn-close-browser');
    const btnBackBrowser = document.getElementById('btn-back-browser');
    const linkMarket = document.getElementById('link-market');
    const linkTracker = document.getElementById('link-tracker');
    const linkPasteDumps = document.getElementById('link-pastedumps');
    const btnMaliciousLink = document.getElementById('btn-malicious-link');

    if (iconBrowser) {
        iconBrowser.addEventListener('click', () => {
            const winBrowser = document.getElementById('window-browser');
            if (winBrowser) {
                winBrowser.classList.remove('hidden');
                if (typeof bringToFront === 'function') bringToFront(winBrowser);
            }
            if (typeof addTaskbarTab === 'function') addTaskbarTab('browser', 'NightLink');

            if (state.freeRoam) {
                loadPage('torch');
                return;
            }

            if (!state.hackerRevealed && !state.isDialogueActive && !state.hasSeenWikiIntro) {
                state.hasSeenWikiIntro = true;
                if (typeof queueDialogues === 'function') {
                    queueDialogues([
                        { name: "player", text: tFn("dialogue_wiki_1", "Wow, parece que entré. Esta es 'The Hidden Wiki', un índice de páginas de la darknet.") },
                        { name: "player", text: tFn("dialogue_wiki_2", "¿Qué es ese enlace a 'SilkSale'? Dicen que allí se venden cosas terribles.") }
                    ]);
                }
            }
        });
    }

    if (btnCloseBrowser) {
        btnCloseBrowser.addEventListener('click', () => {
            const winBrowser = document.getElementById('window-browser');
            if (winBrowser) winBrowser.classList.add('hidden');
            if (typeof removeTaskbarTab === 'function') removeTaskbarTab('browser');
            
            const dynamicContainer = document.getElementById('page-dynamic');
            if (dynamicContainer) {
                dynamicContainer.innerHTML = '';
                dynamicContainer.classList.add('hidden');
            }
        });
    }

    if (btnBackBrowser) {
        btnBackBrowser.addEventListener('click', () => {
            if (state.freeRoam) {
                loadPage('torch');
            } else {
                loadPage('wiki');
            }
        });
    }

    // Hacer la barra de direcciones editable y funcional
    const urlInput = document.getElementById('browser-url-input');
    if (urlInput) {
        urlInput.removeAttribute('readonly');
        urlInput.style.cursor = 'text';
        urlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                let val = urlInput.value.trim().toLowerCase();
                if (!val) return;
                
                // Limpiar protocolo e IP/Dominio
                val = val.replace('http://', '').replace('https://', '').split('/')[0];
                
                if (val.includes('gmail') || val.includes('mail.google')) {
                    tryNavigate('google-gmail', false);
                } else if (val.includes('drive') || val.includes('drive.google')) {
                    tryNavigate('google-drive', false);
                } else if (val.includes('maps') || val.includes('maps.google')) {
                    tryNavigate('google-maps', false);
                } else if (val.includes('translate') || val.includes('traductor') || val.includes('translate.google')) {
                    tryNavigate('google-translate', false);
                } else if (val.includes('google')) {
                    tryNavigate('google', false);
                } else if (val.includes('vault77') || val === 'vault77.ann') {
                    tryNavigate('vault77', false);
                } else if (val.includes('puppeteer') || val === 'puppeteer-project.ann') {
                    tryNavigate('puppeteer-project', false);
                } else if (val.includes('torch') || val === 'torchsearch3x21d.ann') {
                    tryNavigate('torch', false);
                } else if (val.includes('wiki') || val.includes('hiddenwiki')) {
                    tryNavigate('wiki', false);
                } else if (window.deepWebDB) {
                    const site = window.deepWebDB.find(n => n.id === val || n.url.toLowerCase().includes(val));
                    if (site) {
                        tryNavigate(site.id, false);
                    } else {
                        // Buscar en Torch automáticamente si no coincide con un nodo directo
                        tryNavigate('torch', false);
                        setTimeout(() => {
                            const torchInput = document.getElementById('torch-search-input');
                            if (torchInput) {
                                torchInput.value = urlInput.value;
                                const torchBtn = document.getElementById('torch-search-btn');
                                if (torchBtn) torchBtn.click();
                            }
                        }, 500);
                    }
                } else {
                    tryNavigate('wiki', false);
                }
            }
        });
    }

    if (linkMarket) {
        linkMarket.addEventListener('click', () => {
            if (state.freeRoam) return tryNavigate('market');
            
            const pageMarket = document.getElementById('page-market');
            document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
            if (pageMarket) pageMarket.classList.remove('hidden');
            
            if (!state.hackerRevealed && !state.hasSeenMarketIntro) {
                state.hasSeenMarketIntro = true;
                if (typeof queueDialogues === 'function') {
                    queueDialogues([
                        { name: "player", text: tFn("dialogue_market_1", "Esto es un mercado negro... Venden cuentas robadas, drogas y datos clasificados.") },
                        { name: "player", text: tFn("dialogue_market_2", "Espera, ¿qué es ese 'ARCHIVO CONFIDENCIAL_VIP'? Dice que su descarga es gratuita.") }
                    ]);
                }
            }
        });
    }

    if (linkTracker) {
        linkTracker.addEventListener('click', () => {
            if (state.freeRoam) return tryNavigate('tracker');
            if (state.currentQuest < 1) {
                if (typeof queueDialogues === 'function') queueDialogues([{ name: "Sistema", text: tFn("tracker_restricted_dialogue", "ACCESO RESTRINGIDO. Requiere alerta de seguridad activa para rastrear.") }]);
                return;
            }
            
            const pageTracker = document.getElementById('page-tracker');
            document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
            if (pageTracker) pageTracker.classList.remove('hidden');
            if (state.currentQuest === 1 && typeof initTrackerMinigame === 'function') initTrackerMinigame();
        });
    }

    if (linkPasteDumps) {
        linkPasteDumps.addEventListener('click', () => {
            if (state.freeRoam) return tryNavigate('pastedumps');
            if (state.currentQuest < 3) {
                if (typeof queueDialogues === 'function') queueDialogues([{ name: "Sistema", text: tFn("pastedumps_restricted_dialogue", "ERROR. Conexión rechazada por el cortafuegos perimetral. Desbloquéalo primero.") }]);
                return;
            }
            
            const pagePasteDumps = document.getElementById('page-pastedumps');
            document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
            if (pagePasteDumps) pagePasteDumps.classList.remove('hidden');
            if (typeof initPasteDumpsMinigame === 'function') initPasteDumpsMinigame();
        });
    }

    if (btnMaliciousLink) {
        btnMaliciousLink.addEventListener('click', () => {
            if (state.freeRoam) {
                if (typeof triggerRandomMinigame === 'function') {
                    return triggerRandomMinigame(() => loadPage('market'));
                }
            }
            if (state.hackerRevealed) return;
            
            const winBrowser = document.getElementById('window-browser');
            if (winBrowser) winBrowser.classList.add('hidden');
            if (typeof removeTaskbarTab === 'function') removeTaskbarTab('browser');
            if (typeof triggerHackSequence === 'function') triggerHackSequence();
        });
    }

    const btnDetailsCredentials = document.getElementById('btn-details-credentials');
    if (btnDetailsCredentials) {
        btnDetailsCredentials.addEventListener('click', () => {
            if (typeof playClickSound === 'function') playClickSound();
            if (!state.freeRoam) {
                if (typeof showCustomAlert === 'function') {
                    showCustomAlert(tFn("alert_proto_error_title", "ERROR DE PROTOCOLO"), tFn("alert_proto_error_desc", "Esta página requiere autenticación P2P y transacciones mediante billetera Bitcoin (BTC) para procesar compras."), "error");
                }
                if (typeof queueDialogues === 'function') {
                    queueDialogues([{ name: "Sistema", text: tFn("dialogue_market_denied", "Acceso denegado. No tienes fondos en tu monedero ni un enrutamiento de red seguro.") }]);
                }
            } else {
                if (typeof showCustomAlert === 'function') {
                    showCustomAlert(tFn("alert_product_details_title", "DETALLES DEL PRODUCTO"), tFn("alert_product_details_desc", "Cuentas Premium Streaming (Pack 100). Precio: 0.10 BTC. Contiene accesos directos y credenciales de servicios de suscripción streaming populares."), "info");
                }
            }
        });
    }

    // Inicializar lógica de páginas de Google
    if (typeof initGooglePages === 'function') initGooglePages();
});

let trackerInterval;
let isPasteDumpsInit = false;

function initTrackerMinigame() {
    const trackerResult = document.getElementById('tracker-result');
    const trackerMatrix = document.getElementById('tracker-matrix');
    const trackerProgress = document.getElementById('tracker-progress');
    if (!trackerResult || !trackerMatrix || !trackerProgress) return;
    
    if (trackerResult.classList.contains('hidden') === false) return; // ya resuelto
    trackerMatrix.innerHTML = "<div id='tracker-bg' style='color:#0f0; word-break:break-all;'></div>";
    clearInterval(trackerInterval);
    
    // Matriz de fondo numérico
    trackerInterval = setInterval(() => {
        let gibberish = "";
        for(let i=0; i<800; i++) {
            gibberish += Math.random().toString(36).substring(2, 3);
        }
        let bg = document.getElementById('tracker-bg');
        if (bg) bg.innerText = gibberish;
    }, 100);

    // Piezas de IP
    let chunks = ['184.22.', '9.', '101'];
    let chunksFound = 0;

    chunks.forEach((chunkText, index) => {
        let chunkEl = document.createElement('span');
        chunkEl.innerText = chunkText;
        chunkEl.style.position = 'absolute';
        chunkEl.style.color = '#fff';
        chunkEl.style.background = 'blue';
        chunkEl.style.padding = '2px';
        chunkEl.style.cursor = 'crosshair';
        chunkEl.style.zIndex = '50';
        chunkEl.style.userSelect = 'none';
        
        // Posicion inicial aleatoria
        chunkEl.style.top = Math.random() * 80 + '%';
        chunkEl.style.left = Math.random() * 80 + '%';
        
        // Movimiento errático
        setInterval(() => {
            chunkEl.style.top = Math.random() * 90 + '%';
            chunkEl.style.left = Math.random() * 90 + '%';
        }, 800 + index * 200);

        chunkEl.onmousedown = () => {
            chunkEl.style.display = 'none';
            chunksFound++;
            trackerProgress.innerText = `${chunksFound}/3`;
            if (typeof playClickSound === 'function') playClickSound();
            if(chunksFound === 3) {
                clearInterval(trackerInterval);
                const bg = document.getElementById('tracker-bg');
                if (bg) bg.innerText = "";
                trackerResult.classList.remove('hidden');
                updateQuest(2);
            }
        };
        trackerMatrix.appendChild(chunkEl);
    });
}

function initPasteDumpsMinigame() {
    if (isPasteDumpsInit) return;
    isPasteDumpsInit = true;

    const pastedumpsContent = document.getElementById('pastedumps-content');
    if (!pastedumpsContent) return;

    let text = "";
    for(let i=0; i<3000; i++) {
        text += Math.random().toString(36).substring(2, 8) + " ";
    }
    // Insertamos la clave
    const keyTag = tFn("pastedumps_key_tag", "CLAVE");
    const keyHTML = `<span style="color:red; font-weight:bold; cursor:pointer; background:black; padding:2px;" id="key-span">[${keyTag}:X9-DELTA-44]</span>`;
    
    // Posicion aleatoria en el texto
    let insertPos = Math.floor(Math.random() * (text.length - 1000)) + 500;
    text = text.slice(0, insertPos) + keyHTML + text.slice(insertPos);
    
    pastedumpsContent.innerHTML = text;

    document.getElementById('key-span').addEventListener('click', function() {
        this.style.color = 'lime';
        const keyCopied = tFn("pastedumps_key_copied", "CLAVE COPIADA");
        this.innerText = `[${keyCopied}: X9-DELTA-44]`;
        
        // Literalmente copiar al portapapeles del sistema operativo
        navigator.clipboard.writeText("X9-DELTA-44").catch(err => console.log('Error al copiar al portapapeles'));
        
        if (typeof playClickSound === 'function') playClickSound();
        
        if (state.currentQuest === 3) {
            updateQuest(4);
        }
    });
}

// Exportar globalmente
window.activeChatTask = activeChatTask;
window.startChatTaskGenerator = startChatTaskGenerator;
window.initFreeModeNavigation = initFreeModeNavigation;
window.tryNavigate = tryNavigate;
window.loadPage = loadPage;
window.updateBrowserURL = updateBrowserURL;
window.initTrackerMinigame = initTrackerMinigame;
window.initPasteDumpsMinigame = initPasteDumpsMinigame;

// ============================================================
// LÓGICA DE LAS PÁGINAS DE REPLICA DE GOOGLE
// ============================================================
function initGooglePages() {
    // 1. Navegación por pestañas/enlaces de Google
    document.querySelectorAll('.google-nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const target = e.currentTarget.getAttribute('data-target');
            if (target) {
                if (typeof playClickSound === 'function') playClickSound();
                loadPage(target);
            }
        });
    });

    // 2. Lógica del buscador de Google Search
    const searchBtn = document.getElementById('google-search-btn');
    const luckyBtn = document.getElementById('google-lucky-btn');
    const searchInput = document.getElementById('google-search-input');
    const resultsLogo = document.getElementById('google-results-logo');
    const resultsInput = document.getElementById('google-results-input');
    const resultsSearchBtn = document.getElementById('google-results-search-btn');

    const handleGoogleSearch = (query) => {
        if (!query.trim()) return;
        if (typeof playClickSound === 'function') playClickSound();
        
        const homeView = document.getElementById('google-search-home');
        const resultsView = document.getElementById('google-search-results');
        if (homeView) homeView.classList.add('hidden');
        if (resultsView) resultsView.classList.remove('hidden');

        if (searchInput) searchInput.value = query;
        if (resultsInput) resultsInput.value = query;

        const resultsList = document.getElementById('google-results-list');
        const resultsCount = document.getElementById('google-results-count');
        if (!resultsList) return;

        resultsList.innerHTML = '';
        
        const q = query.toLowerCase();
        let results = [];

        // Resultados temáticos basados en palabras clave del juego
        if (q.includes('darklink') || q.includes('juego') || q.includes('creador') || q.includes('luca') || q.includes('mateo')) {
            results.push({
                title: "DarkLink OS - Consola de Comandos y Simulación de Hacking",
                url: "http://www.darklink-system.com/about",
                desc: "Plataforma inmersiva de entrenamiento en seguridad ofensiva. Desarrollado por Luca Bonamaison y Mateo Gandini. El kernel virtual permite ejecutar comandos y descifrar claves PGP en tiempo real."
            });
            results.push({
                title: "Wikipedia: Proyecto DarkLink (Hacker Sandbox)",
                url: "https://es.wikipedia.org/wiki/DarkLink_OS",
                desc: "DarkLink es un videojuego de simulación de hacking con mecánicas de terror y supervivencia. Cuenta con un asistente virtual reactivo y simulación de web profunda."
            });
        }
        if (q.includes('hacker') || q.includes('exploit') || q.includes('zero') || q.includes('0-day') || q.includes('virus')) {
            results.push({
                title: "Hacker News: Zero-Days activos en la red A.N.N.",
                url: "https://hackernews.com/ann-network-zero-days",
                desc: "Expertos confirman que los nodos periféricos pueden comprometerse mediante el comando 'exploit <nodo>' si se posee la licencia correspondiente adquirida en SilkSale."
            });
            results.push({
                title: "Index of /root_repo/binaries - Repositorio de exploits",
                url: "http://torchsearch3x21d.ann/node_tools",
                desc: "Repositorio profundo con código abierto: bypass_firewall.py y keylogger_v3.exe. Descarga segura y libre de logs."
            });
        }
        if (q.includes('silksale') || q.includes('mercado') || q.includes('tienda') || q.includes('comprar')) {
            results.push({
                title: "Mercado Negro SilkSale - Enlace Directo",
                url: "http://torchsearch3x21d.ann/node_market",
                desc: "El sitio de comercio electrónico más grande de la red profunda. Compra paquetes de exploits, VPN Phantom, módulos de overclocking y llaves PGP."
            });
        }
        if (q.includes('184.22.9.101') || q.includes('ip') || q.includes('atacante') || q.includes('rastrear')) {
            results.push({
                title: "Geolocalización en Tiempo Real: IP 184.22.9.101",
                url: "http://maps.gogle.com/search?q=184.22.9.101",
                desc: "Triangulación GPS activa. Servidor proxy de salida detectado en Moscú, Rusia. Posible origen de ataques de phishing y escaneo de cámara."
            });
            results.push({
                title: "PasteDumps - Logs de Intrusion filtrados",
                url: "http://torchsearch3x21d.ann/node_pastedumps",
                desc: "Mensajes encriptados interceptados del atacante. Para descifrarlos en la terminal, se necesita la clave de acceso de 10 caracteres."
            });
        }
        if (q.includes('winhello') || q.includes('asistente') || q.includes('cara') || q.includes('ayuda')) {
            results.push({
                title: "Soporte Técnico de Gogle DarkOS: Configuración de WinHello",
                url: "https://support.gogle.com/winhello",
                desc: "Guía oficial del asistente de escritorio. WinHello supervisa el kernel. Si el asistente reporta sospechas de intrusión física o pasos, proceda a apagar el monitor de inmediato."
            });
        }
        
        // Resultados generales por defecto
        results.push({
            title: `Búsqueda en Gogle de "${query}"`,
            url: `https://www.gogle.com/search?q=${encodeURIComponent(query)}`,
            desc: `Resultados generales de la web de Gogle para "${query}". El cortafuegos de red local mantiene la sesión en modo seguro y aislado.`
        });
        results.push({
            title: `Wikipedia, la enciclopedia libre: Criptografía`,
            url: "https://es.wikipedia.org/wiki/Criptografía",
            desc: "La criptografía es el arte y la técnica de escribir con procedimientos o claves secretas o de un modo enigmático, a fin de que no pueda ser leído sino por las personas a quienes va dirigido."
        });

        resultsCount.innerText = results.length;

        // Knowledge Panel logic
        const knowledgePanel = document.getElementById('google-knowledge-panel');
        if (knowledgePanel) {
            if (q.includes('darklink') || q.includes('juego') || q.includes('creador') || q.includes('luca') || q.includes('mateo') || q.includes('bonamaison') || q.includes('gandini')) {
                knowledgePanel.classList.remove('hidden');
                knowledgePanel.innerHTML = `
                    <div style="text-align:center; margin-bottom:15px; padding-bottom:12px; border-bottom:1px solid #3c4043;">
                        <div style="font-size:3rem; margin-bottom:8px;">🎮</div>
                        <h3 style="color:#fff; font-size:1.15rem; margin:0;">DarkLink OS</h3>
                        <p style="color:#9aa0a6; font-size:0.8rem; margin:4px 0 0 0;">Videojuego de simulación</p>
                    </div>
                    <div style="font-size:0.85rem; line-height:1.6; color:#bdc1c6; margin-bottom:15px;">
                        DarkLink es un videojuego inmersivo de simulación de hacking con mecánicas de terror y supervivencia. Fue desarrollado como proyecto independiente por dos programadores argentinos.
                    </div>
                    <div style="font-size:0.82rem; color:#9aa0a6; display:flex; flex-direction:column; gap:8px; border-top:1px solid #3c4043; padding-top:12px;">
                        <div><span style="color:#8ab4f8;">Creadores:</span> Luca Bonamaison & Mateo Gandini</div>
                        <div><span style="color:#8ab4f8;">Género:</span> Simulación / Terror / Hacking</div>
                        <div><span style="color:#8ab4f8;">Motor:</span> HTML5 + JavaScript (vanilla)</div>
                        <div><span style="color:#8ab4f8;">Versión:</span> Fase 26</div>
                        <div><span style="color:#8ab4f8;">País:</span> Argentina 🇦🇷</div>
                    </div>
                    <div style="border-top:1px solid #3c4043; margin-top:12px; padding-top:12px; font-size:0.8rem; color:#9aa0a6;">
                        <p style="margin-bottom:6px;"><strong style="color:#e8eaed;">Luca Bonamaison</strong> — Diseño de UI/UX, asistente WinHello, sistema de archivos virtual, motor de terror y efectos visuales.</p>
                        <p><strong style="color:#e8eaed;">Mateo Gandini</strong> — Arquitectura de minijuegos, lógica de supervivencia, sistema de amenazas, feed de webcam y motor de red simulada.</p>
                    </div>
                `;
            } else {
                knowledgePanel.classList.add('hidden');
                knowledgePanel.innerHTML = '';
            }
        }

        results.forEach(res => {
            const div = document.createElement('div');
            div.style.marginBottom = '20px';
            div.innerHTML = `
                <div style="font-size: 0.85rem; color: #9aa0a6; margin-bottom: 3px;">${res.url}</div>
                <a class="fake-link google-result-link" style="font-size: 1.2rem; color: #8ab4f8; text-decoration: underline; cursor: pointer; display: inline-block; margin-bottom: 4px;" data-url="${res.url}">${res.title}</a>
                <div style="color: #bdc1c6; font-size: 0.9rem; line-height: 1.4;">${res.desc}</div>
            `;
            
            div.querySelector('.google-result-link').addEventListener('click', (e) => {
                const url = e.target.getAttribute('data-url');
                if (url.includes('node_market')) {
                    loadPage('market');
                } else if (url.includes('node_tools')) {
                    loadPage('tools');
                } else if (url.includes('node_pastedumps')) {
                    loadPage('pastedumps');
                } else if (url.includes('maps.google.com') || url.includes('maps.gogle.com')) {
                    loadPage('google-maps');
                    const mapsInput = document.getElementById('gmaps-search-input');
                    if (mapsInput) mapsInput.value = '184.22.9.101';
                    const mapsBtn = document.getElementById('gmaps-search-btn');
                    if (mapsBtn) mapsBtn.click();
                } else {
                    const dynamicContainer = document.getElementById('page-dynamic');
                    if (dynamicContainer) {
                        document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
                        dynamicContainer.innerHTML = `
                            <div style="background:#fff; color:#000; font-family:sans-serif; padding:35px; min-height:100%; box-sizing:border-box; text-align:left;">
                                <div style="border-bottom:1px solid #ccc; padding-bottom:15px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;">
                                    <span style="font-size:1.4rem; font-weight:bold; color: #1a0dab;">🌐 Lector Web Web-Viewer v1.0</span>
                                    <button class="terminal-btn" style="background:#000; color:#fff; border:1px solid #000; padding:5px 15px; cursor:pointer; font-family:monospace;" onclick="loadPage('google')">< Volver a Gogle</button>
                                </div>
                                <h1 style="color:#000; font-size:2.2rem; margin-bottom:10px; font-family:'Times New Roman', serif; border-bottom:1px solid #eaeaea; padding-bottom:5px;">${res.title}</h1>
                                <p style="color:#666; font-size:0.85rem; margin-bottom:25px;">Caché del Servidor de DarkOS | URL: ${res.url}</p>
                                <div style="line-height:1.6; color:#333; font-size:1.05rem; max-width:800px; font-family:sans-serif;">
                                    <p style="margin-bottom:15px;">Estás visualizando una copia estática del recurso de red. La conexión de sockets directos ha sido rechazada por el proxy de aislamiento.</p>
                                    <p style="margin-bottom:15px;"><strong>Resumen del Recurso:</strong> ${res.desc}</p>
                                    <p style="margin-bottom:15px;">El intercambio de paquetes fue enrutado y purgado. Los datos de la telemetría del navegador se han eliminado para preservar tu identidad y OPSEC.</p>
                                    <p style="margin-top:50px; border-top:1px dashed #ccc; padding-top:15px; font-size:0.8rem; color:#888;">Caché local de DarkLink. Bucle temporal de red: Activo.</p>
                                </div>
                            </div>
                        `;
                        dynamicContainer.classList.remove('hidden');
                        updateBrowserURL(res.url);
                    }
                }
            });

            resultsList.appendChild(div);
        });
    };

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => handleGoogleSearch(searchInput.value));
    }
    if (luckyBtn && searchInput) {
        luckyBtn.addEventListener('click', () => {
            const query = searchInput.value.trim() || 'DarkLink';
            handleGoogleSearch(query);
        });
    }
    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleGoogleSearch(searchInput.value);
        });
    }
    if (resultsSearchBtn && resultsInput) {
        resultsSearchBtn.addEventListener('click', () => handleGoogleSearch(resultsInput.value));
    }
    if (resultsInput) {
        resultsInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleGoogleSearch(resultsInput.value);
        });
    }
    if (resultsLogo) {
        resultsLogo.addEventListener('click', () => {
            loadPage('google');
        });
    }

    // 3. Lógica de Gmail (Bandeja y Lector de correo)
    const gmailRows = document.querySelectorAll('.gmail-row');
    const gmailReader = document.getElementById('gmail-reader-pane');
    const gmailBackBtn = document.getElementById('gmail-reader-back-btn');

    const emailsData = {
        'email-1': {
            sender: "Gogle Workspace",
            email: "security-noreply@gogle.com",
            subject: "[Alerta de Seguridad] Inicio de sesión inusual detectado",
            date: "Hoy, 10:45 AM",
            body: `Hola, operador de DarkOS.

Hemos verificado una petición de inicio de sesión sospechosa en tus credenciales locales.

Detalles del intento de acceso:
Dirección IP: 184.22.9.101
Procedencia: Moscú, Rusia
Dispositivo: SSH Remote Terminal Execution

Si no has autorizado esta sesión, es muy probable que tu router esté recibiendo un escaneo activo de puertos por un atacante. Te aconsejamos activar el Escudo del Antivirus inmediatamente (NetManager o Shield en escritorio) y cerrar el puerto de la cámara web.

Atentamente,
Soporte de Gogle Workspace.`
        },
        'email-2': {
            sender: "Luca B.",
            email: "luca.bonamaison@gmail.com",
            subject: "Avance en el código del juego y WinHello",
            date: "Ayer, 07:14 PM",
            body: `Qué tal Mateo,

Acabo de subir todos los cambios para la fase 24 de WinHello. Re-programé la interfaz, saqué las partículas que hacían lag, y le puse el mouse tracking para que los ojos sigan el cursor del mouse, queda súper tétrico.

También le agregué un jumpscare glitch al hacerle clic: tiene un 12% de chance de asustar al jugador con un temblor, chillido y ojos en pánico.

De paso, dejé guardado el archivo encriptado en la papelera del sistema por si acaso, se llama 'diario_hacker.pgp'. Recordá que para abrirlo tenés que usar la Terminal con el comando 'decrypt diario_hacker.pgp'.

Un abrazo,
Luca.`
        },
        'email-3': {
            sender: "Mateo G.",
            email: "mateo.gandini@gmail.com",
            subject: "Minijuegos integrados y testeo de sandbox",
            date: "Ayer, 04:30 PM",
            body: `Hola Luca,

Buenísimo el WinHello reactivo. Ya integré los 10 minijuegos de purga del antivirus.

Descubrí en mis pruebas que si compramos la VPN Phantom ('vpn_phantom.ovpn') en el SilkSale Market por 0.20 BTC, WinHello detecta que estamos seguros y cambia sus diálogos a unos mucho más amigables y nos da consejos avanzados, en lugar de susurrar cosas paranoicas.

Además, comprar el Exploit Pack por 0.40 BTC habilita el comando 'exploit <nodo>' en la consola, lo que saltea los minijuegos en los hackeos y da acceso directo.

Voy a seguir revisando el feed de la cámara web para asegurarme de que el doxxeo de fotos funcione correctamente en los foros de la deep web.

Saludos,
Mateo.`
        },
        'email-4': {
            sender: "Desconocido",
            email: "x9-delta@ann.network",
            subject: "[URGENTE] CLAVE DE ACCESO AL DEPOSITO",
            date: "Hace 3 días, 03:14 AM",
            body: `Hola.

Me están rastreando la conexión, así que seré breve.

La clave de desencriptación PGP que necesitas para desbloquear el volcado de logs es:
TOKEN: X9-DELTA-44

Introduce este token cuando uses la terminal para desencriptar el diario del hacker:
decrypt diario_hacker.pgp

Una vez desencriptado, podrás ver las IPs y credenciales que usa el atacante. Recuerda, si la cámara se enciende sola o escuchas ruidos cerca de tu silla, APAGA EL MONITOR con el botón rojo. Es la única forma de cortar la telemetría biológica.

No confíes en nadie.`
        }
    };

    gmailRows.forEach(row => {
        row.addEventListener('click', () => {
            const id = row.getAttribute('data-id');
            const data = emailsData[id];
            if (data && gmailReader) {
                if (typeof playClickSound === 'function') playClickSound();
                row.style.fontWeight = 'normal';
                row.style.background = 'transparent';
                
                document.getElementById('gmail-reader-subject').innerText = data.subject;
                document.getElementById('gmail-reader-sender').innerText = data.sender;
                document.getElementById('gmail-reader-email').innerText = `(${data.email})`;
                document.getElementById('gmail-reader-date').innerText = data.date;
                document.getElementById('gmail-reader-body').innerText = data.body;
                
                gmailReader.classList.remove('hidden');

                // Actualizar badge de mensajes no leídos
                const unreadBadge = document.getElementById('gmail-unread-badge');
                if (unreadBadge) {
                    const currentUnread = document.querySelectorAll('.gmail-row[style*="font-weight: bold"]').length;
                    unreadBadge.innerText = currentUnread;
                    if (currentUnread === 0) unreadBadge.classList.add('hidden');
                }
            }
        });
    });

    if (gmailBackBtn && gmailReader) {
        gmailBackBtn.addEventListener('click', () => {
            if (typeof playClickSound === 'function') playClickSound();
            gmailReader.classList.add('hidden');
        });
    }

    // Gmail Compose Send handler
    const gmailComposeSendBtn = document.getElementById('gmail-compose-send-btn');
    if (gmailComposeSendBtn) {
        gmailComposeSendBtn.addEventListener('click', () => {
            const to = document.getElementById('gmail-compose-to');
            const subject = document.getElementById('gmail-compose-subject');
            const body = document.getElementById('gmail-compose-body');
            const modal = document.getElementById('gmail-compose-modal');
            if (!to || !subject || !body) return;
            if (!subject.value.trim() && !body.value.trim()) {
                if (typeof showCustomAlert === 'function') showCustomAlert('ERROR', 'El mensaje está vacío. Escribe un asunto o cuerpo.', 'error');
                return;
            }
            if (typeof playClickSound === 'function') playClickSound();
            gmailComposeSendBtn.innerText = 'Enviando...';
            gmailComposeSendBtn.disabled = true;
            setTimeout(() => {
                // Add sent email to the inbox list visually
                const listPane = document.getElementById('gmail-list-pane');
                if (listPane) {
                    const sentId = 'email-sent-' + Date.now();
                    const newRow = document.createElement('div');
                    newRow.className = 'gmail-row';
                    newRow.setAttribute('data-id', sentId);
                    newRow.style.cssText = 'display:flex; align-items:center; padding:12px 20px; border-bottom:1px solid #282828; cursor:pointer; background:#1b1d22; font-weight:bold; transition: background 0.15s;';
                    newRow.innerHTML = `
                        <div style="width:180px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap; color:#e8eaed;">Para: ${to.value || 'Desconocido'}</div>
                        <div style="flex-grow:1; text-overflow:ellipsis; overflow:hidden; white-space:nowrap; color:#aaa; margin-right:15px;">
                            <span style="color:#fff;">${subject.value || '(Sin asunto)'}</span> - ${body.value.substring(0, 50)}...
                        </div>
                        <div style="width:80px; text-align:right; font-size:0.8rem; color:#34A853;">Enviado ✓</div>
                    `;
                    listPane.insertBefore(newRow, listPane.firstChild);
                }
                if (modal) modal.classList.add('hidden');
                subject.value = '';
                body.value = '';
                gmailComposeSendBtn.innerText = 'Enviar';
                gmailComposeSendBtn.disabled = false;
                if (typeof showCustomAlert === 'function') showCustomAlert('CORREO ENVIADO', `Tu mensaje a ${to.value} fue enviado exitosamente por el proxy SMTP cifrado.`, 'success');
                if (typeof playProudSound === 'function') playProudSound();
            }, 1200);
        });
    }

    // 4. Lógica de Google Drive (Previews y descargas)
    const driveItems = document.querySelectorAll('.drive-item');
    const drivePreviewPane = document.getElementById('drive-preview-pane');
    const drivePreviewTitle = document.getElementById('drive-preview-title');
    const drivePreviewBody = document.getElementById('drive-preview-body');
    const drivePreviewDownload = document.getElementById('drive-preview-download-btn');
    const drivePreviewClose = document.getElementById('drive-preview-close-btn');

    let currentDriveFileName = '';
    let currentDriveFileContent = '';

    const filesData = {
        'fotos_lucas': {
            title: "Carpeta: fotos_lucas",
            content: `📂 Directorio /fotos_lucas/
----------------------------------------
- [Imagen] luca_vacaciones.jpg (2.4 MB) - [PROTEGIDO]
- [Imagen] luca_oficina.png (1.2 MB) - [PROTEGIDO]
- [Imagen] luca_webcam_test.jpg (800 KB) - [PROTEGIDO]

Nota: La visualización de imágenes requiere la inicialización del subsistema multimedia de webcam del juego.`
        },
        'Manual_OPSEC.pdf': {
            title: "Manual_OPSEC.pdf",
            content: `MANUAL DE OPERACIONES Y SUPERVIVENCIA EN DARKLINK OS
----------------------------------------------------------------------
1. AMENAZA Y ENTORNO FISICO:
El atacante intentará geolocalizarte y escanear tu webcam. Si escuchas ruidos de pasos, respiraciones pesadas o estática en tus auriculares, usa el botón rojo 'APAGAR PANTALLA' para esconderte y permanece inmóvil.

2. CORTAFUEGOS LOCAL:
Activa el 'Escudo en tiempo real' en la aplicación Antivirus de escritorio para filtrar inyecciones SQL y ataques remotos.

3. CONSOLA DE COMANDOS:
Usa 'scan' en la terminal para mapear hosts vulnerables, y 'hack <nodo_id>' para desencriptar claves SSH remotas de manera manual.

4. BILLETERA BTC:
Resuelve contratos comerciales en DarkChat o piratea hosts remotos para acumular BTC, y utilízalos para comprar herramientas en SilkSale Market.`
        },
        'contraseña_wifi.txt': {
            title: "contraseña_wifi.txt",
            content: `PARÁMETROS DEL ROUTER HOGAREÑO:
----------------------------------------
SSID: Fibertel_Red_Privada
WiFi Key: admin1234
IP de Gateway: 192.168.1.1
IP del Servidor Atacante (Target): 184.22.9.101

¡Cifra tu red o tu webcam quedará expuesta!`
        },
        'proyecto_final.zip': {
            title: "proyecto_final.zip",
            content: `FICHERO COMPRIMIDO: proyecto_final.zip
----------------------------------------
Peso: 42.4 MB
Contenido del paquete:
- index.html (Estructura base)
- css/browser.css (Estilos de Google y Deep Web)
- js/main.js (Control de pantallas)
- js/winhello.js (Asistente cognitivo A.N.N)
- js/survival.js (threat loop de amenazas)
- sounds/menu_theme.mp3 (Banda sonora)

Desarrolladores: Luca Bonamaison & Mateo Gandini.`
        }
    };

    driveItems.forEach(item => {
        item.addEventListener('click', () => {
            const name = item.getAttribute('data-name');
            const data = filesData[name];
            if (data && drivePreviewPane) {
                if (typeof playClickSound === 'function') playClickSound();
                currentDriveFileName = name;
                currentDriveFileContent = data.content;
                
                if (drivePreviewTitle) drivePreviewTitle.innerText = data.title;
                if (drivePreviewBody) drivePreviewBody.innerText = data.content;
                
                drivePreviewPane.classList.remove('hidden');

                if (name === 'fotos_lucas') {
                    if (drivePreviewDownload) drivePreviewDownload.style.display = 'none';
                } else {
                    if (drivePreviewDownload) {
                        drivePreviewDownload.style.display = 'block';
                        drivePreviewDownload.innerText = "📥 Descargar en PC";
                        drivePreviewDownload.disabled = false;
                        drivePreviewDownload.style.background = '#303134';
                        drivePreviewDownload.style.color = '#8ab4f8';
                    }
                }
            }
        });
    });

    if (drivePreviewClose && drivePreviewPane) {
        drivePreviewClose.addEventListener('click', () => {
            if (typeof playClickSound === 'function') playClickSound();
            drivePreviewPane.classList.add('hidden');
        });
    }

    if (drivePreviewDownload) {
        drivePreviewDownload.addEventListener('click', () => {
            if (currentDriveFileName) {
                if (typeof playClickSound === 'function') playClickSound();
                const lang = (typeof window.getLanguage === 'function') ? window.getLanguage() : 'es';
                drivePreviewDownload.innerText = lang === 'en' ? "DOWNLOADING..." : "DESCARGANDO...";
                drivePreviewDownload.disabled = true;
                drivePreviewDownload.style.background = '#555';

                setTimeout(() => {
                    state.vfs.push({
                        name: currentDriveFileName,
                        name_en: currentDriveFileName,
                        content: currentDriveFileContent,
                        content_en: currentDriveFileContent,
                        decryptedContent: "",
                        decrypted: true,
                        canDelete: true
                    });
                    if (typeof updateTrashUI === 'function') updateTrashUI();
                    if (typeof showCustomAlert === 'function') {
                        const alertTitle = lang === 'en' ? "DOWNLOAD COMPLETED" : "DESCARGA COMPLETADA";
                        const alertMsg = lang === 'en'
                            ? `File '${currentDriveFileName}' was successfully downloaded to Recycle Bin.`
                            : `El archivo '${currentDriveFileName}' fue descargado exitosamente a la Papelera.`;
                        showCustomAlert(alertTitle, alertMsg, "success");
                    }
                    drivePreviewDownload.innerText = lang === 'en' ? "DOWNLOADED" : "DESCARGADO";
                    drivePreviewDownload.style.background = '#052e0e';
                    drivePreviewDownload.style.color = '#5eff82';
                }, 1200);
            }
        });
    }

    // Drive Upload handler
    const driveUploadBtn = document.getElementById('drive-upload-btn');
    if (driveUploadBtn) {
        driveUploadBtn.addEventListener('click', () => {
            const nameInput = document.getElementById('drive-upload-name');
            const typeSelect = document.getElementById('drive-upload-type');
            const contentInput = document.getElementById('drive-upload-content');
            const modal = document.getElementById('drive-upload-modal');
            if (!nameInput || !contentInput) return;
            const fileName = nameInput.value.trim();
            if (!fileName) {
                if (typeof showCustomAlert === 'function') showCustomAlert('ERROR', 'Debes ingresar un nombre de archivo.', 'error');
                return;
            }
            if (typeof playClickSound === 'function') playClickSound();
            driveUploadBtn.innerText = 'Cargando...';
            driveUploadBtn.disabled = true;
            setTimeout(() => {
                // Add the file to VFS
                state.vfs.push({
                    name: fileName,
                    content: contentInput.value || '(Archivo vacío)',
                    decryptedContent: '',
                    decrypted: true,
                    canDelete: true
                });
                if (typeof updateTrashUI === 'function') updateTrashUI();

                // Add to Drive grid visually
                const driveGrid = document.querySelector('#page-google-drive .drive-item')?.parentElement;
                if (driveGrid) {
                    const typeVal = typeSelect ? typeSelect.value : 'txt';
                    const icons = { txt: '📝', pdf: '📄', zip: '📦' };
                    const colors = { txt: '#4285F4', pdf: '#EA4335', zip: '#f59e0b' };
                    const newItem = document.createElement('div');
                    newItem.className = 'drive-item';
                    newItem.setAttribute('data-type', typeVal);
                    newItem.setAttribute('data-name', fileName);
                    newItem.style.cssText = 'background:#202124; border:1px solid #3c4043; border-radius:8px; padding:15px; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; text-align:center; transition: border-color 0.2s;';
                    newItem.innerHTML = `
                        <span style="font-size:3rem; margin-bottom:8px; color:${colors[typeVal] || '#4285F4'};">${icons[typeVal] || '📝'}</span>
                        <span style="font-size:0.85rem; color:#fff; font-weight:bold; word-break:break-all;">${fileName}</span>
                    `;
                    // Add click handler for preview
                    newItem.addEventListener('click', () => {
                        if (drivePreviewPane) {
                            currentDriveFileName = fileName;
                            currentDriveFileContent = contentInput.value || '(Archivo vacío)';
                            if (drivePreviewTitle) drivePreviewTitle.innerText = fileName;
                            if (drivePreviewBody) drivePreviewBody.innerText = contentInput.value || '(Archivo vacío)';
                            if (drivePreviewDownload) {
                                drivePreviewDownload.style.display = 'block';
                                drivePreviewDownload.innerText = 'DESCARGADO';
                                drivePreviewDownload.disabled = true;
                                drivePreviewDownload.style.background = '#052e0e';
                                drivePreviewDownload.style.color = '#5eff82';
                            }
                            drivePreviewPane.classList.remove('hidden');
                        }
                    });
                    driveGrid.appendChild(newItem);
                }

                if (modal) modal.classList.add('hidden');
                nameInput.value = '';
                contentInput.value = '';
                driveUploadBtn.innerText = 'Cargar';
                driveUploadBtn.disabled = false;
                if (typeof showCustomAlert === 'function') showCustomAlert('ARCHIVO CARGADO', `El archivo '${fileName}' fue cargado a Gogle Drive y guardado en la Papelera local.`, 'success');
                if (typeof playProudSound === 'function') playProudSound();
            }, 1500);
        });
    }

    // 5. Lógica de Google Maps
    const mapsSearchInput = document.getElementById('gmaps-search-input');
    const mapsSearchBtn = document.getElementById('gmaps-search-btn');
    const mapsElements = document.getElementById('gmaps-elements-container');
    const mapsInfo = document.getElementById('gmaps-info-content');
    const mapsAttackerMarker = document.getElementById('gmaps-attacker-marker');
    const mapsZoomIn = document.getElementById('gmaps-zoom-in');
    const mapsZoomOut = document.getElementById('gmaps-zoom-out');

    let currentZoom = 1;

    // Generador de datos de IP dinámica
    const generateIpGeoData = (ip) => {
        const locations = [
            { city: 'Moscú', country: 'Rusia', isp: 'RuNet Telecom', lat: '55.75', lon: '37.61', risk: 'CRÍTICO' },
            { city: 'Berlín', country: 'Alemania', isp: 'Deutsche Telekom AG', lat: '52.52', lon: '13.40', risk: 'ALTO' },
            { city: 'Shenzhen', country: 'China', isp: 'China Telecom', lat: '22.54', lon: '114.05', risk: 'CRÍTICO' },
            { city: 'São Paulo', country: 'Brasil', isp: 'Vivo Telecom', lat: '-23.55', lon: '-46.63', risk: 'MEDIO' },
            { city: 'Lagos', country: 'Nigeria', isp: 'MTN Nigeria', lat: '6.52', lon: '3.37', risk: 'ALTO' },
            { city: 'Tokio', country: 'Japón', isp: 'NTT Communications', lat: '35.68', lon: '139.69', risk: 'BAJO' },
            { city: 'Mumbai', country: 'India', isp: 'Reliance Jio', lat: '19.07', lon: '72.87', risk: 'MEDIO' },
            { city: 'Estocolmo', country: 'Suecia', isp: 'Bahnhof AB', lat: '59.33', lon: '18.06', risk: 'BAJO' }
        ];
        // Use IP octets as seed for deterministic location
        const parts = ip.split('.').map(Number);
        const seed = (parts[0] * 7 + parts[1] * 13 + parts[2] * 23 + parts[3] * 37);
        const loc = locations[seed % locations.length];
        const openPorts = [22, 80, 443, 8080, 3306, 5432, 8443, 9090].filter((_, i) => (seed + i) % 3 === 0);
        return { ...loc, ip, openPorts };
    };

    const handleMapsSearch = () => {
        const query = mapsSearchInput.value.trim();
        if (!query) return;
        if (typeof playClickSound === 'function') playClickSound();

        // Check if input looks like an IP address
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        const isIp = ipRegex.test(query);

        if (query.includes('184.22.9.101') || query.toLowerCase().includes('atacante') || query.toLowerCase().includes('moscu') || query.toLowerCase().includes('rusia')) {
            if (mapsAttackerMarker) {
                mapsAttackerMarker.classList.remove('hidden');
                const label = mapsAttackerMarker.querySelector('div:last-child');
                if (label) label.innerText = 'OBJETIVO: 184.22.9.101';
            }
            if (mapsElements) {
                currentZoom = 1.35;
                mapsElements.style.transform = `scale(${currentZoom}) translate(-12%, 12%)`;
            }
            if (mapsInfo) {
                mapsInfo.innerHTML = `
                    <p style="color:#ff3333; font-weight:bold;">[NODO HOSTIL GEOLOCALIZADO]</p>
                    <p>IP objetivo: 184.22.9.101</p>
                    <p>Ubicación: Moscú, Rusia</p>
                    <p>Enrutamiento: Red Clandestina .ANN</p>
                    <p style="margin-top:10px;">Este servidor es la IP de salida del atacante de telemetría y doxxeo. Ha secuestrado controladores de cámara locales.</p>
                    <p style="color:yellow; margin-top:8px;">Directiva: Ejecuta 'hack 184.22.9.101' o 'exploit 184.22.9.101' en tu Terminal para neutralizar el nodo.</p>
                `;
            }
        } else if (isIp) {
            // Dynamic IP geolocation for any IP
            const geo = generateIpGeoData(query);
            const riskColors = { 'CRÍTICO': '#ff3333', 'ALTO': '#ff9900', 'MEDIO': '#ffcc00', 'BAJO': '#00ff66' };
            if (mapsAttackerMarker) {
                mapsAttackerMarker.classList.remove('hidden');
                const dot = mapsAttackerMarker.querySelector('div:first-child');
                const label = mapsAttackerMarker.querySelector('div:last-child');
                if (dot) {
                    dot.style.background = riskColors[geo.risk] || '#ff9900';
                    dot.style.boxShadow = `0 0 15px ${riskColors[geo.risk] || '#ff9900'}`;
                }
                if (label) {
                    label.innerText = `OBJETIVO: ${query}`;
                    label.style.color = riskColors[geo.risk] || '#ff9900';
                    label.style.borderColor = riskColors[geo.risk] || '#ff9900';
                }
                // Randomize position on map
                const topPct = 20 + ((geo.lat.charCodeAt(0) * 7) % 50);
                const leftPct = 20 + ((geo.lon.charCodeAt(0) * 11) % 55);
                mapsAttackerMarker.style.top = topPct + '%';
                mapsAttackerMarker.style.left = leftPct + '%';
            }
            if (mapsElements) {
                currentZoom = 1.2;
                mapsElements.style.transform = `scale(${currentZoom})`;
            }
            if (mapsInfo) {
                mapsInfo.innerHTML = `
                    <p style="color:${riskColors[geo.risk]}; font-weight:bold;">[NODO GEOLOCALIZADO — RIESGO: ${geo.risk}]</p>
                    <p>IP objetivo: ${query}</p>
                    <p>Ciudad: ${geo.city}, ${geo.country}</p>
                    <p>ISP: ${geo.isp}</p>
                    <p>Coordenadas: ${geo.lat}°N, ${geo.lon}°E</p>
                    <p style="margin-top:8px;">Puertos abiertos: ${geo.openPorts.length > 0 ? geo.openPorts.join(', ') : 'Ninguno detectado'}</p>
                    <p style="color:#aaa; margin-top:8px; font-style:italic;">Resolución satelital ejecutada vía cortafuegos proxy A.N.N. Datos cifrados con capa TLS/SSL.</p>
                    <p style="color:yellow; margin-top:8px;">Directiva: Ejecuta 'hack ${query}' en tu Terminal para intentar comprometer el nodo.</p>
                `;
            }
        } else {
            if (mapsAttackerMarker) mapsAttackerMarker.classList.add('hidden');
            if (mapsElements) {
                mapsElements.style.transform = `scale(1) translate(0, 0)`;
                currentZoom = 1;
            }
            if (mapsInfo) {
                mapsInfo.innerHTML = `
                    <p style="color:#aaa;">Búsqueda: "${query}"</p>
                    <p style="color:#888; font-style:italic; margin-top:10px;">Coordenadas fuera del mapa de red cifrada. El cortafuegos denegó la resolución DNS del satélite externo.</p>
                    <p style="color:#555; margin-top:8px;">Tip: Introduce una dirección IP válida (ej: 95.216.14.88) para geolocalizar un nodo.</p>
                `;
            }
        }
    };

    if (mapsSearchBtn) mapsSearchBtn.addEventListener('click', handleMapsSearch);
    if (mapsSearchInput) {
        mapsSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleMapsSearch();
        });
    }

    if (mapsZoomIn && mapsElements) {
        mapsZoomIn.addEventListener('click', () => {
            if (typeof playClickSound === 'function') playClickSound();
            currentZoom = Math.min(2.5, currentZoom + 0.2);
            mapsElements.style.transform = `scale(${currentZoom})`;
        });
    }
    if (mapsZoomOut && mapsElements) {
        mapsZoomOut.addEventListener('click', () => {
            if (typeof playClickSound === 'function') playClickSound();
            currentZoom = Math.max(0.5, currentZoom - 0.2);
            mapsElements.style.transform = `scale(${currentZoom})`;
        });
    }

    // 6. Lógica de Google Translate
    const translateInput = document.getElementById('gtranslate-input');
    const translateOutput = document.getElementById('gtranslate-output');
    const translateBtn = document.getElementById('gtranslate-translate-btn');
    const translateClear = document.getElementById('gtranslate-btn-clear');
    const translateSpinner = document.getElementById('gtranslate-spinner');

    if (translateClear && translateInput) {
        translateClear.addEventListener('click', () => {
            if (typeof playClickSound === 'function') playClickSound();
            translateInput.value = '';
            if (translateOutput) translateOutput.innerText = '';
        });
    }

    // Translation functions for each mode
    const translateToLeet = (text) => {
        let words = text.toLowerCase()
            .replace(/a/g, '4').replace(/e/g, '3').replace(/i/g, '1').replace(/o/g, '0').replace(/u/g, 'v');
        const slangDictionary = {
            'hola': 'h0l4 br0', 'servidor': 'n0d0 r00t', 'seguridad': '0p53c_w4rr10r',
            'computadora': 't3rm1n4l_v1rtu4l', 'password': 'p455w0rd_h4ck', 'contraseña': 'p455w0rd_h4ck',
            'antivirus': 'sh13ld_k3rn3l', 'hacker': 'h4x0r_l33t', 'dinero': 'btc_w4ll3t', 'sistema': 'k3rn3l_os'
        };
        Object.keys(slangDictionary).forEach(word => {
            const searchWord = word.replace(/a/g, '4').replace(/e/g, '3').replace(/i/g, '1').replace(/o/g, '0').replace(/u/g, 'v');
            words = words.replace(new RegExp(searchWord, 'g'), slangDictionary[word]);
        });
        return `>>> TRADUCCIÓN l33t REALIZADA EN LA NUBE:\n${words}\n\n[OPSEC segura]`;
    };

    const translateToBinary = (text) => {
        const binary = text.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
        return `>>> CODIFICACIÓN BINARIA (8-bit ASCII):\n${binary}\n\n[${text.length} caracteres → ${text.length * 9 - 1} bits]`;
    };

    const translateToBase64 = (text) => {
        try {
            const encoded = btoa(unescape(encodeURIComponent(text)));
            return `>>> CODIFICACIÓN BASE64:\n${encoded}\n\nDecodificar: atob("${encoded.substring(0, 30)}...")`;
        } catch(e) {
            return `>>> ERROR DE CODIFICACIÓN:\nNo se pudo codificar el texto a Base64.`;
        }
    };

    const translateToMorse = (text) => {
        const morseMap = {
            'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---',
            'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
            'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--', 'Z': '--..',
            '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
            '6': '-....', '7': '--...', '8': '---..', '9': '----.', ' ': '/', '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--',
            'Á': '.--.-', 'É': '..-..', 'Í': '..', 'Ó': '---.', 'Ú': '..-', 'Ñ': '--.--'
        };
        const morse = text.toUpperCase().split('').map(c => morseMap[c] || c).join(' ');
        return `>>> CÓDIGO MORSE:\n${morse}\n\n[Señal de transmisión lista — Canal de radio cifrado]`;
    };

    if (translateBtn && translateInput && translateOutput && translateSpinner) {
        translateBtn.addEventListener('click', () => {
            const text = translateInput.value.trim();
            if (!text) return;
            if (typeof playClickSound === 'function') playClickSound();

            translateOutput.innerText = '';
            translateSpinner.classList.remove('hidden');

            setTimeout(() => {
                translateSpinner.classList.add('hidden');

                const langSelect = document.getElementById('gtranslate-lang-select');
                const mode = langSelect ? langSelect.value : 'leet';

                let result;
                switch (mode) {
                    case 'binary': result = translateToBinary(text); break;
                    case 'base64': result = translateToBase64(text); break;
                    case 'morse': result = translateToMorse(text); break;
                    case 'leet':
                    default: result = translateToLeet(text); break;
                }

                translateOutput.innerText = result;
                if (typeof playProudSound === 'function') playProudSound();
            }, 800);
        });
    }
}

// --- Phantom Browser Tab Management ---
function renderBrowserTabs() {
    const tabContainer = document.getElementById('browser-tabs');
    if (!tabContainer) return;
    
    // Clear container
    tabContainer.innerHTML = '';
    
    if (!window.browserTabs || window.browserTabs.length === 0) {
        window.browserTabs = [
            { pageId: 'torch', title: 'Torch Search', history: ['torch'], url: 'http://torchsearch3x21d.ann/' }
        ];
        window.activeTabIdx = 0;
    }
    
    // Clamp activeTabIdx just in case
    if (window.activeTabIdx < 0) window.activeTabIdx = 0;
    if (window.activeTabIdx >= window.browserTabs.length) window.activeTabIdx = window.browserTabs.length - 1;
    
    window.browserTabs.forEach((tab, index) => {
        const tabEl = document.createElement('div');
        tabEl.className = 'browser-tab' + (index === window.activeTabIdx ? ' active' : '');
        tabEl.style.cursor = 'grab';
        tabEl.setAttribute('draggable', 'true');
        
        // Truncate title
        let displayTitle = tab.title || 'Torch Search';
        if (displayTitle.length > 15) {
            displayTitle = displayTitle.substring(0, 12) + '...';
        }
        
        tabEl.innerHTML = `
            <span class="tab-secure-status">🔒</span>
            <span class="tab-title">${displayTitle}</span>
            <span class="tab-close-btn" style="margin-left: 8px; font-weight: bold; cursor: pointer; font-size: 1.1rem; line-height: 1;">&times;</span>
        `;
        
        // Click to switch tab, close button click closes tab
        tabEl.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-close-btn')) {
                e.stopPropagation();
                closeBrowserTab(index);
            } else {
                switchBrowserTab(index);
            }
        });
        
        // Drag and Drop Event Listeners
        tabEl.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', index.toString());
            tabEl.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        tabEl.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            tabEl.classList.add('drag-over');
        });

        tabEl.addEventListener('dragleave', () => {
            tabEl.classList.remove('drag-over');
        });

        tabEl.addEventListener('drop', (e) => {
            e.preventDefault();
            tabEl.classList.remove('drag-over');
            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
            const toIndex = index;
            
            if (fromIndex !== toIndex && !isNaN(fromIndex)) {
                // Reorder window.browserTabs
                const [movedTab] = window.browserTabs.splice(fromIndex, 1);
                window.browserTabs.splice(toIndex, 0, movedTab);
                
                // Update activeTabIdx
                if (window.activeTabIdx === fromIndex) {
                    window.activeTabIdx = toIndex;
                } else if (window.activeTabIdx > fromIndex && window.activeTabIdx <= toIndex) {
                    window.activeTabIdx--;
                } else if (window.activeTabIdx < fromIndex && window.activeTabIdx >= toIndex) {
                    window.activeTabIdx++;
                }
                
                renderBrowserTabs();
            }
        });

        tabEl.addEventListener('dragend', () => {
            tabEl.classList.remove('dragging');
            tabContainer.querySelectorAll('.browser-tab').forEach(t => t.classList.remove('drag-over'));
        });
        
        tabContainer.appendChild(tabEl);
    });
    
    // Add the '+' button
    const plusBtn = document.createElement('div');
    plusBtn.className = 'browser-tab-plus';
    plusBtn.innerText = '+';
    plusBtn.title = 'Nueva pestaña';
    plusBtn.style.cursor = 'pointer';
    plusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        addNewBrowserTab();
    });
    tabContainer.appendChild(plusBtn);
    
    // Update tor circuit destination display
    const destUrlEl = document.getElementById('tor-dest-url');
    if (destUrlEl && window.browserTabs[window.activeTabIdx]) {
        const activeTab = window.browserTabs[window.activeTabIdx];
        let currentUrlText = "desconocido.ann";
        if (activeTab.pageId === 'torch') currentUrlText = "torchsearch3x21d.ann";
        else if (activeTab.pageId === 'google') currentUrlText = "gogle.com";
        else if (activeTab.pageId === 'google-gmail') currentUrlText = "mail.gogle.com";
        else if (activeTab.pageId === 'google-drive') currentUrlText = "drive.gogle.com";
        else if (activeTab.pageId === 'google-maps') currentUrlText = "maps.gogle.com";
        else if (activeTab.pageId === 'google-translate') currentUrlText = "translate.gogle.com";
        else if (activeTab.pageId === 'dark-game') currentUrlText = "darklightergame88x.ann";
        else if (window.deepWebDB) {
            const site = window.deepWebDB.find(n => n.id === activeTab.pageId);
            if (site) {
                currentUrlText = site.url.replace('http://', '').replace('/', '');
            }
        }
        destUrlEl.innerText = currentUrlText;
    }
}

// Internal flag to prevent loadPage -> renderBrowserTabs -> switchBrowserTab loops
let _switchingTab = false;

function switchBrowserTab(index) {
    if (index < 0 || index >= window.browserTabs.length) return;
    if (_switchingTab) return; // prevent re-entrance
    
    _switchingTab = true;
    window.activeTabIdx = index;
    const tab = window.browserTabs[index];
    
    // Sync global history
    window.browserHistory = [...tab.history];
    state.activePageId = tab.pageId;
    
    // Use loadPage to properly render the page content (this handles all page types correctly)
    // But first hide everything cleanly
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    const dynamicContainer = document.getElementById('page-dynamic');
    if (dynamicContainer) {
        dynamicContainer.innerHTML = '';
        dynamicContainer.classList.add('hidden');
    }
    
    // Reset all browser page state inputs & results
    const torchInput = document.getElementById('torch-search-input');
    if (torchInput) torchInput.value = '';
    const torchResults = document.getElementById('torch-results');
    if (torchResults) torchResults.innerHTML = '';
    
    const googleSearchInput = document.getElementById('google-search-input');
    if (googleSearchInput) googleSearchInput.value = '';
    const googleResultsInput = document.getElementById('google-results-input');
    if (googleResultsInput) googleResultsInput.value = '';
    const googleResultsList = document.getElementById('google-results-list');
    if (googleResultsList) googleResultsList.innerHTML = '';
    
    const gmapsSearchInput = document.getElementById('gmaps-search-input');
    if (gmapsSearchInput) gmapsSearchInput.value = '';
    
    const gtranslateInput = document.getElementById('gtranslate-input');
    if (gtranslateInput) gtranslateInput.value = '';
    const gtranslateOutput = document.getElementById('gtranslate-output');
    if (gtranslateOutput) gtranslateOutput.innerText = '';
    
    const gmailReaderPane = document.getElementById('gmail-reader-pane');
    if (gmailReaderPane) gmailReaderPane.classList.add('hidden');
    
    const drivePreviewPane = document.getElementById('drive-preview-pane');
    if (drivePreviewPane) drivePreviewPane.classList.add('hidden');
    
    // Now load the actual page
    const googlePages = ['google', 'google-gmail', 'google-drive', 'google-maps', 'google-translate'];
    
    if (googlePages.includes(tab.pageId)) {
        const googlePage = document.getElementById('page-' + tab.pageId);
        if (googlePage) googlePage.classList.remove('hidden');
        
        if (tab.pageId === 'google') {
            const homeView = document.getElementById('google-search-home');
            const resultsView = document.getElementById('google-search-results');
            if (homeView) homeView.classList.remove('hidden');
            if (resultsView) resultsView.classList.add('hidden');
        }
    } else if (tab.pageId === 'torch') {
        const torchPage = document.getElementById('page-torch');
        if (torchPage) torchPage.classList.remove('hidden');
    } else {
        // Deep web site
        if (window.deepWebDB) {
            const targetNode = window.deepWebDB.find(n => n.id === tab.pageId);
            if (targetNode && dynamicContainer) {
                if (window.DWRenderer && typeof window.DWRenderer.renderSite === 'function') {
                    dynamicContainer.innerHTML = window.DWRenderer.renderSite(targetNode);
                } else {
                    dynamicContainer.innerHTML = `<div style="padding: 20px; color: #fff;">${targetNode.description}</div>`;
                }
                dynamicContainer.classList.remove('hidden');
                
                if (targetNode.category === 'chat') {
                    const chatContainer = document.getElementById('chat-messages-container');
                    if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
                }
            }
        }
    }
    
    // Update address bar
    updateBrowserURL(tab.url || 'http://torchsearch3x21d.ann/');
    
    // Re-render the visual tabs list
    renderBrowserTabs();
    
    if (typeof playClickSound === 'function') playClickSound();
    
    _switchingTab = false;
}

function addNewBrowserTab() {
    if (!window.browserTabs) window.browserTabs = [];
    
    window.browserTabs.push({
        pageId: 'torch',
        title: 'Torch Search',
        history: ['torch'],
        url: 'http://torchsearch3x21d.ann/'
    });
    window.activeTabIdx = window.browserTabs.length - 1;
    switchBrowserTab(window.activeTabIdx);
}

function closeBrowserTab(index) {
    if (!window.browserTabs || window.browserTabs.length === 0) return;
    
    if (window.browserTabs.length <= 1) {
        // Can't close last tab, reset it
        window.browserTabs[0] = {
            pageId: 'torch',
            title: 'Torch Search',
            history: ['torch'],
            url: 'http://torchsearch3x21d.ann/'
        };
        window.activeTabIdx = 0;
        switchBrowserTab(0);
        return;
    }
    
    const wasActive = (index === window.activeTabIdx);
    window.browserTabs.splice(index, 1);
    
    // Adjust activeTabIdx after removal
    if (wasActive) {
        // Switch to the next tab, or the previous if we closed the last one
        if (window.activeTabIdx >= window.browserTabs.length) {
            window.activeTabIdx = window.browserTabs.length - 1;
        }
        switchBrowserTab(window.activeTabIdx);
    } else if (window.activeTabIdx > index) {
        // Active tab shifted left
        window.activeTabIdx--;
        renderBrowserTabs(); // Just re-render visual, no page switch needed
    } else {
        renderBrowserTabs(); // Just re-render visual
    }
}

window.renderBrowserTabs = renderBrowserTabs;
window.switchBrowserTab = switchBrowserTab;
window.addNewBrowserTab = addNewBrowserTab;
window.closeBrowserTab = closeBrowserTab;

