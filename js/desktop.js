// --- DESKTOP OS INTERACTION (NOTEPAD, START MENU, APP WINDOWS & APPLERS) ---

function tFn(key, fallback) {
    return (typeof window.t === 'function') ? window.t(key, fallback) : fallback;
}

const taskbarApps = document.getElementById('taskbar-apps');

function addTaskbarTab(id, label) {
    if (document.getElementById('tab-' + id)) return; // ya existe
    let tab = document.createElement('div');
    tab.id = 'tab-' + id;
    tab.innerText = label;
    tab.style.background = '#333';
    tab.style.color = '#fff';
    tab.style.padding = '0 10px';
    tab.style.border = '1px outset #555';
    tab.style.cursor = 'pointer';
    tab.style.lineHeight = '30px';
    tab.style.whiteSpace = 'nowrap';
    
    tab.addEventListener('click', () => {
        let win = document.getElementById('window-' + id);
        if (!win) return;
        if (win.classList.contains('hidden')) {
            win.classList.remove('hidden');
            if (typeof bringToFront === 'function') bringToFront(win);
            if (typeof playWindowOpenSound === 'function') playWindowOpenSound();
        } else {
            win.classList.add('hidden'); 
            if (typeof playWindowCloseSound === 'function') playWindowCloseSound();
        }
    });
    if (taskbarApps) taskbarApps.appendChild(tab);
}

function removeTaskbarTab(id) {
    let tab = document.getElementById('tab-' + id);
    if (tab) tab.remove();
}

// Global openNotepad function
window.openNotepad = function(title, content, readonly = true) {
    const windowNotepad = document.getElementById('window-notepad');
    if (windowNotepad) {
        const titleEl = document.getElementById('notepad-title');
        const textarea = document.getElementById('notepad-content');
        if (titleEl) titleEl.innerText = title;
        if (textarea) {
            textarea.value = content;
            if (readonly) textarea.setAttribute('readonly', 'true');
            else textarea.removeAttribute('readonly');
        }
        
        windowNotepad.classList.remove('hidden');
        if (typeof bringToFront === 'function') bringToFront(windowNotepad);
        addTaskbarTab('notepad', 'Notepad');
        if (typeof playWindowOpenSound === 'function') playWindowOpenSound();
    }
};

// Recycle Bin Trash UI
let selectedTrashFile = null;

// Helper: get the best readable content for a vfs file, respecting language
function getFileContent(file, lang) {
    // If file is a decrypted .pgp and has real decrypted content, use that
    if (file.decrypted && file.decryptedContent && file.decryptedContent.length > 0) {
        if (lang === 'en' && file.decryptedContent_en && file.decryptedContent_en.length > 0) {
            return file.decryptedContent_en;
        }
        return file.decryptedContent;
    }
    // Otherwise the readable content is in .content / .content_en
    if (lang === 'en' && file.content_en && file.content_en.length > 0) {
        return file.content_en;
    }
    return file.content;
}

function updateTrashUI() {
    const fileListEl = document.getElementById('trash-file-list');
    const fileTitleEl = document.getElementById('trash-file-title');
    const fileViewEl = document.getElementById('trash-file-view');
    const btnDelete = document.getElementById('btn-trash-delete');
    const lang = (typeof window.getLanguage === 'function') ? window.getLanguage() : 'es';
    
    if (!fileListEl) return;
    
    fileListEl.innerHTML = '';
    
    if (state.vfs.length === 0) {
        fileListEl.innerHTML = `<div style="color: #666; font-style: italic; padding: 10px;">${tFn("trash_empty", "Papelera vacía")}</div>`;
        if (fileTitleEl) fileTitleEl.innerText = tFn("trash_no_selected", "Ningún archivo seleccionado");
        if (fileViewEl) fileViewEl.innerText = tFn("trash_view_hint", "Selecciona un archivo de la lista para ver su contenido.");
        if (btnDelete) btnDelete.disabled = true;
        selectedTrashFile = null;
        return;
    }
    
    state.vfs.forEach((file) => {
        const fileDiv = document.createElement('div');
        fileDiv.style.padding = '8px';
        fileDiv.style.cursor = 'pointer';
        fileDiv.style.borderBottom = state.freeRoam ? '1px solid #ccc' : '1px solid #222';
        fileDiv.style.display = 'flex';
        fileDiv.style.alignItems = 'center';
        fileDiv.style.gap = '8px';
        
        if (state.freeRoam) {
            fileDiv.style.background = selectedTrashFile === file ? '#000080' : 'transparent';
            if (selectedTrashFile === file) {
                fileDiv.style.color = '#ffffff';
            } else {
                fileDiv.style.color = file.name.endsWith('.pgp') && !file.decrypted ? '#ff3333' : '#000000';
            }
        } else {
            fileDiv.style.background = selectedTrashFile === file ? '#222' : 'transparent';
            fileDiv.style.color = file.name.endsWith('.pgp') && !file.decrypted ? '#ff3333' : '#eee';
        }
        
        const iconSpan = document.createElement('span');
        iconSpan.innerText = file.name.endsWith('.pgp') ? '🔒' : '📄';
        fileDiv.appendChild(iconSpan);
        
        const nameSpan = document.createElement('span');
        const displayName = (lang === 'en' && file.name_en) ? file.name_en : file.name;
        nameSpan.innerText = displayName;
        nameSpan.style.overflow = 'hidden';
        nameSpan.style.textOverflow = 'ellipsis';
        nameSpan.style.whiteSpace = 'nowrap';
        fileDiv.appendChild(nameSpan);
        
        fileDiv.addEventListener('click', () => {
            selectedTrashFile = file;
            updateTrashUI();
        });
        
        fileDiv.addEventListener('dblclick', () => {
            if (state.freeRoam && typeof window.openNotepad === 'function') {
                if (file.name.endsWith('.pgp') && !file.decrypted) {
                    const alertMsg = (lang === 'en') ? "This file is PGP encrypted. You must decrypt it using the 'decrypt <file>' command in the Terminal before reading it." : "Este archivo está cifrado con PGP. Debes desencriptarlo usando el comando 'decrypt <archivo>' en la Terminal antes de poder leerlo.";
                    window.openNotepad(displayName, alertMsg, true);
                } else {
                    window.openNotepad(displayName, getFileContent(file, lang), true);
                }
            }
        });
        
        fileListEl.appendChild(fileDiv);
    });
    
    if (selectedTrashFile) {
        const displayName = (lang === 'en' && selectedTrashFile.name_en) ? selectedTrashFile.name_en : selectedTrashFile.name;
        if (fileTitleEl) fileTitleEl.innerText = displayName;
        if (btnDelete) btnDelete.disabled = !selectedTrashFile.canDelete;
        
        if (fileViewEl) {
            if (selectedTrashFile.name.endsWith('.pgp') && !selectedTrashFile.decrypted) {
                // Still encrypted – show raw PGP block in the right language
                const content = (lang === 'en' && selectedTrashFile.content_en) ? selectedTrashFile.content_en : selectedTrashFile.content;
                fileViewEl.innerText = content;
                fileViewEl.style.color = '#ff5555';
            } else {
                fileViewEl.innerText = getFileContent(selectedTrashFile, lang);
                fileViewEl.style.color = state.freeRoam ? '#000000' : '#bbb';
            }
        }
    } else {
        if (fileTitleEl) fileTitleEl.innerText = tFn("trash_no_selected", "Ningún archivo seleccionado");
        if (fileViewEl) fileViewEl.innerText = tFn("trash_view_hint", "Selecciona un archivo de la lista para ver su contenido.");
        if (btnDelete) btnDelete.disabled = true;
    }
    
    // Update status bar if present
    const statusTextEl = document.getElementById('trash-status-text');
    const capacityTextEl = document.getElementById('trash-capacity-text');
    if (statusTextEl) {
        statusTextEl.innerText = tFn("trash_status_count", "{count} archivo(s) listado(s)").replace('{count}', state.vfs.length);
    }
    if (capacityTextEl) {
        const totalSize = state.vfs.reduce((acc, f) => acc + (f.content ? f.content.length : 100), 0);
        const kb = (totalSize / 1024).toFixed(1);
        capacityTextEl.innerText = tFn("trash_status_usage", "Uso: {used} KB / {max} KB").replace('{used}', kb).replace('{max}', '50.0');
    }
}

// Antivirus Heuristics
function logAntivirus(msg) {
    const logsEl = document.getElementById('antivirus-logs');
    if (logsEl) {
        logsEl.innerHTML += `<br>> ${msg}`;
        logsEl.scrollTop = logsEl.scrollHeight;
    }
}

// NetManager aligns
let nodeStates = [false, false, false, false, false];

function toggleNode(idx) {
    const nodeBtns = document.querySelectorAll('.node-btn');
    if (idx < 0 || idx >= 5 || nodeBtns.length === 0) return;
    nodeStates[idx] = !nodeStates[idx];
    nodeBtns[idx].style.background = nodeStates[idx] ? 'lime' : 'red';
}

// DarkChat messaging helpers
function postChatMessage(text, color="#0f0") {
    const chatHistory = document.getElementById('chat-history');
    if(!chatHistory) return;
    chatHistory.innerHTML += `<p style="margin:5px 0; color:${color};">${text}</p>`;
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// DOM events configuration
document.addEventListener('DOMContentLoaded', () => {
    // Start Menu and context menus
    const startMenu = document.getElementById('start-menu');
    const startBtn = document.querySelector('.start-btn');
    const contextMenu = document.getElementById('context-menu');
    const desktopScreen = document.getElementById('screen-desktop');
    const clock = document.getElementById('clock');
    const telemetryPopup = document.getElementById('telemetry-popup');
    
    if (startBtn && startMenu) {
        startBtn.addEventListener('click', (e) => {
            if (!state.freeRoam) return;
            e.stopPropagation();
            const startMenuStandup = document.getElementById('start-menu-standup');
            if (startMenuStandup) {
                startMenuStandup.style.display = (state.freeRoam && state.questId === -1) ? 'block' : 'none';
            }
            startMenu.classList.toggle('hidden');
            if (contextMenu) contextMenu.classList.add('hidden');
            if (telemetryPopup) telemetryPopup.classList.add('hidden');
        });
    }

    if (desktopScreen && contextMenu) {
        desktopScreen.addEventListener('contextmenu', (e) => {
            if (!state.freeRoam) return;

            // Solo mostrar en el escritorio vacío, no dentro de ventanas/taskbar/winhello
            const blocked = e.target.closest('.os-window, .taskbar, #winhello, #start-menu, #context-menu, .dialogue-box, #wallet-ui, #telemetry-popup, #right-sidebar');
            if (blocked) return;

            e.preventDefault();
            contextMenu.style.left = `${e.clientX}px`;
            contextMenu.style.top = `${e.clientY}px`;
            contextMenu.classList.remove('hidden');
            if (startMenu) startMenu.classList.add('hidden');
            if (telemetryPopup) telemetryPopup.classList.add('hidden');
        });

        const ctxChangeBg = document.getElementById('ctx-change-bg');
        const ctxNewNote = document.getElementById('ctx-new-note');
        const ctxOpenTerminal = document.getElementById('ctx-open-terminal');

        const wallpapers = [
            // --- HACKER / TERMINAL ---
            '#002222',                                                                              // Verde oscuro clásico
            'linear-gradient(135deg, #001a00 0%, #003300 50%, #001a00 100%)',                       // Matrix verde profundo
            'radial-gradient(ellipse at center, #003300 0%, #001100 60%, #000000 100%)',            // Foco terminal verde
            'repeating-linear-gradient(0deg, #000 0px, #000 2px, #001a00 2px, #001a00 4px)',       // Scanlines verdes

            // --- CYBERPUNK / NEON ---
            'linear-gradient(45deg, #0f0c29, #302b63, #24243e)',                                   // Galaxia morada
            'linear-gradient(135deg, #1a0033 0%, #4b0082 50%, #1a0033 100%)',                      // Índigo oscuro
            'radial-gradient(ellipse at top left, #ff00ff22 0%, #00000000 50%), radial-gradient(ellipse at bottom right, #00ffff22 0%, #00000000 50%), #0a0a1a', // Neon dualidad
            'linear-gradient(to bottom right, #0d0221, #190d3a, #0d1117)',                         // Cyberpunk noche
            'linear-gradient(135deg, #000428 0%, #004e92 100%)',                                   // Azul profundo

            // --- SYNTHWAVE / RETRO ---
            'linear-gradient(to bottom, #1a0030 0%, #3d006e 40%, #ff006e 100%)',                   // Synthwave sunset
            'linear-gradient(180deg, #0d0221 0%, #1a0c3e 40%, #7b1fa2 70%, #e91e8c 100%)',        // Purple rain
            'linear-gradient(to bottom, #000000 0%, #1b0036 50%, #ff006e33 100%)',                 // Dark retro

            // --- ESPACIO / COSMOS ---
            'radial-gradient(ellipse at 20% 50%, #1a237e 0%, #000000 70%)',                        // Nebulosa azul
            'radial-gradient(circle at 80% 20%, #4a148c44 0%, #000000 60%), radial-gradient(circle at 20% 80%, #0d47a133 0%, #000000 60%), #000005', // Galaxia doble
            'linear-gradient(to bottom, #020024 0%, #090979 35%, #00d4ff11 100%)',                 // Universo oceánico

            // --- PELIGRO / ROJO ---
            'radial-gradient(ellipse at center, #1a0000 0%, #3d0000 50%, #000000 100%)',           // Red room oscuro
            'linear-gradient(135deg, #1a0000 0%, #4a0000 50%, #0d0000 100%)',                      // Sangre profunda
            'linear-gradient(to bottom, #000000 0%, #1a0000 60%, #ff000015 100%)',                 // Alerta roja

            // --- OSCURO TOTAL ---
            'linear-gradient(to right, #000000, #0d0d0d, #000000)',                               // Negro puro degradado
            '#050505',                                                                             // Negro absoluto
        ];
        let wpIndex = 0;


        if (ctxChangeBg) {
            ctxChangeBg.addEventListener('click', () => {
                wpIndex = (wpIndex + 1) % wallpapers.length;
                desktopScreen.style.background = wallpapers[wpIndex];
                contextMenu.classList.add('hidden');
            });
        }

        if (ctxNewNote) {
            ctxNewNote.addEventListener('click', () => {
                if (typeof window.openNotepad === 'function') {
                    window.openNotepad("Nueva Nota.txt", "Escribe aquí...");
                    const contentArea = document.getElementById('notepad-content');
                    if (contentArea) contentArea.removeAttribute('readonly');
                }
                contextMenu.classList.add('hidden');
            });
        }

        if (ctxOpenTerminal) {
            ctxOpenTerminal.addEventListener('click', () => {
                const iconTerminal = document.getElementById('icon-terminal');
                if (iconTerminal) iconTerminal.click();
                contextMenu.classList.add('hidden');
            });
        }
    }

    if (clock && telemetryPopup) {
        clock.addEventListener('click', (e) => {
            if (!state.freeRoam) return;
            e.stopPropagation();
            telemetryPopup.classList.toggle('hidden');
            if (startMenu) startMenu.classList.add('hidden');
            if (contextMenu) contextMenu.classList.add('hidden');
            
            if (!telemetryPopup.classList.contains('hidden')) {
                const tCpu = document.getElementById('telemetry-cpu');
                const tRam = document.getElementById('telemetry-ram');
                const tNet = document.getElementById('telemetry-net');
                const tConn = document.getElementById('telemetry-conn');
                
                if (tCpu) tCpu.innerText = `CPU: ${Math.floor(Math.random() * 30 + 10)}%`;
                if (tRam) tRam.innerText = `RAM: ${Math.floor(Math.random() * 300 + 300)}MB / 1024MB`;
                if (tNet) tNet.innerText = `RED: ${(state.upgrades && state.upgrades.vpn) ? 'VPN PHANTOM [ENCRIPTADO]' : 'A.N.N [VULNERABLE]'}`;
                if (tConn && window.deepWebDB) tConn.innerText = `NODOS: ${window.deepWebDB.length} REGISTRADOS`;
            }
        });
    }

    document.addEventListener('click', (e) => {
        if (startMenu && !startMenu.contains(e.target) && !e.target.classList.contains('start-btn')) {
            startMenu.classList.add('hidden');
        }
        if (contextMenu && !contextMenu.contains(e.target)) {
            contextMenu.classList.add('hidden');
        }
        if (telemetryPopup && !telemetryPopup.contains(e.target) && e.target.id !== 'clock') {
            telemetryPopup.classList.add('hidden');
        }
    });

    // Notepad close & minimise bindings
    const windowNotepad = document.getElementById('window-notepad');
    const btnCloseNotepad = document.getElementById('btn-close-notepad');
    const btnMinNotepad = document.getElementById('btn-min-notepad');

    if (btnCloseNotepad) {
        btnCloseNotepad.addEventListener('click', () => {
            if (windowNotepad) windowNotepad.classList.add('hidden');
            removeTaskbarTab('notepad');
            if (typeof playWindowCloseSound === 'function') playWindowCloseSound();
        });
    }
    if (btnMinNotepad) {
        btnMinNotepad.addEventListener('click', () => {
            if (windowNotepad) windowNotepad.classList.add('hidden');
            if (typeof playWindowCloseSound === 'function') playWindowCloseSound();
        });
    }

    // Minimise button mappings
    const minBr = document.getElementById('btn-min-browser');
    const minNm = document.getElementById('btn-min-netmanager');
    const minTe = document.getElementById('btn-min-terminal');
    const minHa = document.getElementById('btn-min-hacker');
    
    if (minBr) minBr.addEventListener('click', () => {
        const win = document.getElementById('window-browser');
        if (win) win.classList.add('hidden');
        if (typeof playWindowCloseSound === 'function') playWindowCloseSound();
    });
    if (minNm) minNm.addEventListener('click', () => {
        const win = document.getElementById('window-netmanager');
        if (win) win.classList.add('hidden');
        if (typeof playWindowCloseSound === 'function') playWindowCloseSound();
    });
    if (minTe) minTe.addEventListener('click', () => {
        const win = document.getElementById('window-terminal');
        if (win) win.classList.add('hidden');
        if (typeof playWindowCloseSound === 'function') playWindowCloseSound();
    });
    if (minHa) minHa.addEventListener('click', () => {
        const win = document.getElementById('window-hacker');
        if (win) win.classList.add('hidden');
        if (typeof playWindowCloseSound === 'function') playWindowCloseSound();
    });

    // Recycle Bin bindings
    const iconTrash = document.getElementById('icon-trash');
    const windowTrash = document.getElementById('window-trash');
    const btnCloseTrash = document.getElementById('btn-close-trash');
    const btnMinTrash = document.getElementById('btn-min-trash');
    const btnTrashDelete = document.getElementById('btn-trash-delete');
    const btnEmptyTrash = document.getElementById('btn-empty-trash');

    if (iconTrash) {
        iconTrash.addEventListener('click', () => {
            if (!state.freeRoam && state.currentQuest < 1) {
                if (typeof queueDialogues === 'function') {
                    queueDialogues([{ name: "Sistema", text: tFn("trash_denied_dialogue", "ACCESO DENEGADO. Papelera de reciclaje bloqueada temporalmente por políticas de seguridad del kernel.") }]);
                }
                if (typeof playErrorSound === 'function') playErrorSound();
                return;
            }
            if (windowTrash) {
                windowTrash.classList.remove('hidden');
                if (typeof bringToFront === 'function') bringToFront(windowTrash);
                addTaskbarTab('trash', tFn("trash_window_title", "Papelera"));
                updateTrashUI();
                if (typeof playWindowOpenSound === 'function') playWindowOpenSound();
            }
        });
    }
    if (btnCloseTrash) {
        btnCloseTrash.addEventListener('click', () => {
            if (windowTrash) windowTrash.classList.add('hidden');
            removeTaskbarTab('trash');
            if (typeof playWindowCloseSound === 'function') playWindowCloseSound();
        });
    }

    // NetManager bindings
    const iconNetmanager = document.getElementById('icon-netmanager');
    const windowNetmanager = document.getElementById('window-netmanager');
    const btnCloseNetmanager = document.getElementById('btn-close-netmanager');

    if (iconNetmanager) {
        iconNetmanager.addEventListener('click', () => {
            if (!state.freeRoam && state.currentQuest < 2) {
                if (typeof queueDialogues === 'function') {
                    queueDialogues([{ name: "Sistema", text: tFn("netmanager_restricted_dialogue", "ERROR: Acceso restringido. Restablezca las conexiones del puerto VPN antes de usar NetManager.") }]);
                }
                if (typeof playErrorSound === 'function') playErrorSound();
                return;
            }
            if (windowNetmanager) {
                windowNetmanager.classList.remove('hidden');
                if (typeof bringToFront === 'function') bringToFront(windowNetmanager);
                addTaskbarTab('netmanager', 'NetManager');
                if (typeof playWindowOpenSound === 'function') playWindowOpenSound();
            }
        });
    }
    if (btnCloseNetmanager) {
        btnCloseNetmanager.addEventListener('click', () => {
            if (windowNetmanager) windowNetmanager.classList.add('hidden');
            removeTaskbarTab('netmanager');
            if (typeof playWindowCloseSound === 'function') playWindowCloseSound();
        });
    }
    if (btnMinTrash) {
        btnMinTrash.addEventListener('click', () => {
            if (windowTrash) windowTrash.classList.add('hidden');
            if (typeof playWindowCloseSound === 'function') playWindowCloseSound();
        });
    }
    if (btnTrashDelete) {
        btnTrashDelete.addEventListener('click', () => {
            if (selectedTrashFile && selectedTrashFile.canDelete) {
                state.vfs = state.vfs.filter(f => f !== selectedTrashFile);
                selectedTrashFile = null;
                updateTrashUI();
                if (typeof playTrashEmptySound === 'function') playTrashEmptySound();
                if (typeof showCustomAlert === 'function') {
                    showCustomAlert("ARCHIVO ELIMINADO", "El archivo ha sido purgado permanentemente.", "info");
                }
            }
        });
    }
    if (btnEmptyTrash) {
        btnEmptyTrash.addEventListener('click', () => {
            const countBefore = state.vfs.length;
            state.vfs = state.vfs.filter(f => !f.canDelete);
            selectedTrashFile = null;
            updateTrashUI();
            if (typeof playTrashEmptySound === 'function') playTrashEmptySound();
            const deletedCount = countBefore - state.vfs.length;
            if (deletedCount > 0) {
                if (typeof showCustomAlert === 'function') {
                    showCustomAlert(tFn("trash_alert_emptied_title", "PAPELERA VACIADA"), tFn("trash_alert_emptied_desc", "Se han eliminado permanentemente {count} archivos.").replace('{count}', deletedCount), "success");
                }
            } else {
                if (typeof showCustomAlert === 'function') {
                    showCustomAlert(tFn("trash_alert_info_title", "INFORMACIÓN"), tFn("trash_alert_info_desc", "No hay archivos eliminables en la papelera."), "info");
                }
            }
        });
    }

    // Antivirus Window bindings
    const iconAntivirus = document.getElementById('icon-antivirus');
    const windowAntivirus = document.getElementById('window-antivirus');
    const btnCloseAntivirus = document.getElementById('btn-close-antivirus');
    const btnMinAntivirus = document.getElementById('btn-min-antivirus');
    const btnAntivirusShield = document.getElementById('btn-antivirus-shield');
    const antivirusStatus = document.getElementById('antivirus-status');
    const btnAntivirusScan = document.getElementById('btn-antivirus-scan');
    const antivirusScanArea = document.getElementById('antivirus-scan-area');
    const antivirusScanFile = document.getElementById('antivirus-scan-file');
    const antivirusScanPercent = document.getElementById('antivirus-scan-percent');
    const antivirusScanBar = document.getElementById('antivirus-scan-bar');

    if (iconAntivirus) {
        iconAntivirus.addEventListener('click', () => {
            if (windowAntivirus) {
                windowAntivirus.classList.remove('hidden');
                if (typeof bringToFront === 'function') bringToFront(windowAntivirus);
                addTaskbarTab('antivirus', 'Antivirus');
                if (typeof playWindowOpenSound === 'function') playWindowOpenSound();
            }
        });
    }
    if (btnCloseAntivirus) {
        btnCloseAntivirus.addEventListener('click', () => {
            if (windowAntivirus) windowAntivirus.classList.add('hidden');
            removeTaskbarTab('antivirus');
            if (typeof playWindowCloseSound === 'function') playWindowCloseSound();
        });
    }
    if (btnMinAntivirus) {
        btnMinAntivirus.addEventListener('click', () => {
            if (windowAntivirus) windowAntivirus.classList.add('hidden');
            if (typeof playWindowCloseSound === 'function') playWindowCloseSound();
        });
    }
    if (btnAntivirusShield) {
        btnAntivirusShield.addEventListener('click', () => {
            state.antivirusShield = !state.antivirusShield;
            const shieldLabel = document.getElementById('antivirus-shield-label');
            if (state.antivirusShield) {
                btnAntivirusShield.innerText = tFn("antivirus_btn_active", "ACTIVO");
                btnAntivirusShield.classList.remove('shield-inactive');
                btnAntivirusShield.classList.add('shield-active');
                btnAntivirusShield.style.borderColor = "lime";
                btnAntivirusShield.style.color = "lime";
                if (antivirusStatus) {
                    antivirusStatus.innerText = tFn("antivirus_status_protected", "PROTEGIDO");
                    antivirusStatus.classList.remove('shield-inactive');
                    antivirusStatus.classList.add('shield-active');
                    antivirusStatus.style.color = "lime";
                }
                if (shieldLabel) {
                    shieldLabel.innerText = tFn("antivirus_prot_active", "Protección Activa");
                    shieldLabel.classList.remove('shield-inactive');
                    shieldLabel.classList.add('shield-active');
                    shieldLabel.style.color = "lime";
                }
                logAntivirus("Monitoreo heurístico activado. Cortafuegos al 100%.");
                if (typeof checkTutorialProgress === 'function') checkTutorialProgress('shield');
                if (window.StoryMode && typeof window.StoryMode.completeObjective === 'function') {
                    window.StoryMode.completeObjective('c3_antivirus');
                }
            } else {
                btnAntivirusShield.innerText = tFn("antivirus_btn_inactive", "INACTIVO");
                btnAntivirusShield.classList.remove('shield-active');
                btnAntivirusShield.classList.add('shield-inactive');
                btnAntivirusShield.style.borderColor = "#ff3333";
                btnAntivirusShield.style.color = "#ff3333";
                if (antivirusStatus) {
                    antivirusStatus.innerText = tFn("antivirus_status_vulnerable", "VULNERABLE");
                    antivirusStatus.classList.remove('shield-active');
                    antivirusStatus.classList.add('shield-inactive');
                    antivirusStatus.style.color = "#ff3333";
                }
                if (shieldLabel) {
                    shieldLabel.innerText = tFn("antivirus_prot_inactive", "Protección Inactiva");
                    shieldLabel.classList.remove('shield-active');
                    shieldLabel.classList.add('shield-inactive');
                    shieldLabel.style.color = "#ff3333";
                }
                logAntivirus("Monitoreo en tiempo real desactivado. Sistema expuesto.");
            }
            if (typeof playClickSound === 'function') playClickSound();
        });
    }

    // Inicializar App de Expediente 98
    initExpedienteApp();

    let isScanning = false;
    if (btnAntivirusScan) {
        btnAntivirusScan.addEventListener('click', () => {
            if (isScanning) return;
            isScanning = true;
            btnAntivirusScan.disabled = true;
            btnAntivirusScan.innerText = tFn("antivirus_btn_scanning", "ESCANEAR...");
            if (antivirusScanArea) antivirusScanArea.classList.remove('hidden');
            
            logAntivirus(tFn("antivirus_log_start", "Iniciando escaneo completo del sistema..."));
            
            const scanFiles = [
                "boot.ini", "kernel32.dll", "driver_webcam.sys", "hosts.txt",
                "diario_hacker.pgp", "registro_sistema.log", "system_backup.log",
                "svchost.exe", "lsass.exe", "memory_dump.bin"
            ];
            
            let progress = 0;
            let fileIdx = 0;
            if (antivirusScanBar) antivirusScanBar.style.width = '0%';
            if (antivirusScanPercent) antivirusScanPercent.innerText = '0%';
            
            const scanInterval = setInterval(() => {
                progress += 10;
                if (progress > 100) progress = 100;
                
                if (antivirusScanBar) antivirusScanBar.style.width = progress + '%';
                if (antivirusScanPercent) antivirusScanPercent.innerText = progress + '%';
                if (antivirusScanFile) antivirusScanFile.innerText = `Buscando en: ${scanFiles[fileIdx % scanFiles.length]}...`;
                fileIdx++;
                
                if (progress === 100) {
                    clearInterval(scanInterval);
                    isScanning = false;
                    btnAntivirusScan.disabled = false;
                    btnAntivirusScan.innerText = tFn("antivirus_btn_scan", "ESCANEAR");
                    
                    logAntivirus(tFn("antivirus_log_complete", "Escaneo completado con éxito."));
                    
                    if (state.threatActive) {
                        clearTimeout(state.threatTimer);
                        state.threatActive = false;
                        
                        if (typeof stopThreatSound === 'function') stopThreatSound();
                        if (typeof realAudioBreathing !== 'undefined') realAudioBreathing.pause();
                        if (typeof realAudioFootsteps !== 'undefined') realAudioFootsteps.pause();
                        
                        const audioCaption = document.getElementById('audio-caption');
                        if (audioCaption) {
                            audioCaption.classList.add('hidden');
                            audioCaption.style.color = "white";
                        }
                        
                        logAntivirus(tFn("antivirus_log_alert", "[ALERTA] ¡Intrusión neutralizada con éxito!"));
                        logAntivirus(tFn("antivirus_log_terminated", "> Proceso sospechoso forzado a terminar."));
                        logAntivirus(tFn("antivirus_log_quarantine", "> Conexiones no autorizadas en cuarentena."));
                        
                        if (typeof showCustomAlert === 'function') {
                            showCustomAlert(tFn("antivirus_alert_elim_title", "AMENAZA ELIMINADA"), tFn("antivirus_alert_elim_desc", "El antivirus detectó una intrusión activa en tu red local y la neutralizó de inmediato."), "success");
                        }
                    } else {
                        logAntivirus(tFn("antivirus_log_clean", "No se encontraron amenazas activas."));
                        if (typeof showCustomAlert === 'function') {
                            showCustomAlert(tFn("antivirus_alert_safe_title", "SISTEMA SEGURO"), tFn("antivirus_alert_safe_desc", "El análisis ha finalizado. No se detectaron intrusiones ni malware activo."), "success");
                        }
                    }
                }
            }, state.upgrades.overclock ? 200 : 500);
        });
    }

    // NetNodes aligners
    const nodeBtns = document.querySelectorAll('.node-btn');
    nodeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            let idx = parseInt(btn.getAttribute('data-index'));
            if (typeof playClickSound === 'function') playClickSound();
            
            toggleNode(idx);
            toggleNode(idx - 1);
            toggleNode(idx + 1);
            
            if (nodeStates.every(s => s === true)) {
                const netResult = document.getElementById('net-result');
                if (netResult) {
                    if (state.currentQuest === 2) {
                        netResult.classList.remove('hidden');
                        netResult.innerText = "ACCESO RESTAURADO.";
                        netResult.style.color = "lime";
                        if (typeof updateQuest === 'function') updateQuest(3);
                    } else {
                        netResult.classList.remove('hidden');
                        netResult.innerText = "FIREWALL DESBLOQUEADO (Se requiere Target IP).";
                        netResult.style.color = "yellow";
                    }
                }
            }
        });
    });

    // Wiki text Bloc de notas
    const iconWiki = document.getElementById('icon-wiki');
    const windowWiki = document.getElementById('window-wiki');
    const btnCloseWiki = document.getElementById('btn-close-wiki');
    const btnMinWiki = document.getElementById('btn-min-wiki');
    const wikiLinks = document.getElementById('wiki-links');

    window.openBrowserDirectly = function(targetId) {
        const browserWin = document.getElementById('window-browser');
        if (browserWin && browserWin.classList.contains('hidden')) {
            browserWin.classList.remove('hidden');
            if (typeof bringToFront === 'function') bringToFront(browserWin);
            addTaskbarTab('browser', 'NightLink');
        }
        if (typeof tryNavigate === 'function') tryNavigate(targetId, false);
    };

    if (iconWiki) {
        iconWiki.addEventListener('click', () => {
            if (windowWiki) {
                windowWiki.classList.remove('hidden');
                if (typeof bringToFront === 'function') bringToFront(windowWiki);
            }
            addTaskbarTab('wiki', 'Wiki.txt');
            if (typeof playWindowOpenSound === 'function') playWindowOpenSound();
            
            if (wikiLinks) {
                if (state.freeRoam && window.deepWebDB) {
                    wikiLinks.innerHTML = '';
                    const lang = (typeof window.getLanguage === 'function') ? window.getLanguage() : 'es';
                    const isEn = lang === 'en';
                    
                    // Fixed primary pages
                    const torchTitle = isEn ? "Torch Search Engine" : "Buscador Torch";
                    const torchDesc = isEn ? "The primary search engine for indexing the darknet." : "El motor de búsqueda principal para indexar la darknet.";
                    
                    const googleTitle = isEn ? "Gogle Search (Clearnet Proxy)" : "Buscador Gogle (Clearnet Proxy)";
                    const googleDesc = isEn ? "Access to clearnet services: Search, Gmail, Drive, Translate, and Maps." : "Acceso a servicios de clearnet: Buscador, Gmail, Drive, Traductor y Maps.";

                    const darkGameTitle = isEn ? "Super Dark Lighter (2D Game - Win BTC!)" : "Super Dark Lighter (Juego 2D - ¡Gana BTC!)";
                    const darkGameDesc = isEn ? "2D arcade minigame to mine satoshis (BTC) in real time while dodging malware." : "Minijuego arcade 2D para minar satoshis (BTC) en tiempo real esquivando malware.";

                    const hiddenNodesHeader = isEn ? "Listed Hidden Nodes:" : "Nodos Ocultos Listados:";

                    wikiLinks.innerHTML += `<div style="margin-bottom: 10px; border-bottom: 1px dashed #ccc; padding-bottom: 5px;">
                        <strong>${torchTitle}</strong><br>
                        <span style="color: blue; text-decoration: underline; cursor: pointer;" onclick="openBrowserDirectly('torch')">http://torchsearch3x21d.ann/</span>
                        <p style="color:#555; font-size:0.8rem; margin:2px 0 0 0;">${torchDesc}</p>
                    </div>`;

                    wikiLinks.innerHTML += `<div style="margin-bottom: 10px; border-bottom: 1px dashed #ccc; padding-bottom: 5px;">
                        <strong>${googleTitle}</strong><br>
                        <span style="color: blue; text-decoration: underline; cursor: pointer;" onclick="openBrowserDirectly('google')">http://www.gogle.com/</span>
                        <p style="color:#555; font-size:0.8rem; margin:2px 0 0 0;">${googleDesc}</p>
                    </div>`;

                    wikiLinks.innerHTML += `<div style="margin-bottom: 10px; border-bottom: 1px dashed #ccc; padding-bottom: 5px;">
                        <strong>${darkGameTitle}</strong><br>
                        <span style="color: blue; text-decoration: underline; cursor: pointer;" onclick="openBrowserDirectly('dark-game')">http://darklightergame88x.ann/</span>
                        <p style="color:#555; font-size:0.8rem; margin:2px 0 0 0;">${darkGameDesc}</p>
                    </div>`;

                    wikiLinks.innerHTML += `<div style="margin-top: 15px; margin-bottom: 5px; font-weight: bold; color: #000;">${hiddenNodesHeader}</div>`;
                    
                    const addedIds = new Set(['torch', 'google', 'dark-game']);
                    let addedCount = 0;
                    for(let i=0; i<100 && addedCount < 10; i++) {
                        const site = window.deepWebDB[Math.floor(Math.random() * window.deepWebDB.length)];
                        if (site && !addedIds.has(site.id) && site.id !== 'torch') {
                            addedIds.add(site.id);
                            addedCount++;
                            const sTitle = (isEn && site.title_en) ? site.title_en : site.title;
                            const sDesc = (isEn && site.description_en) ? site.description_en : site.description;
                            wikiLinks.innerHTML += `<div style="margin-bottom: 10px;">
                                <strong>${sTitle}</strong><br>
                                <span style="color: blue; text-decoration: underline; cursor: pointer;" onclick="openBrowserDirectly('${site.id}')">${site.url}</span>
                                <p style="color:#555; font-size:0.8rem; margin:2px 0 0 0;">${sDesc}</p>
                            </div>`;
                        }
                    }
                } else {
                    wikiLinks.innerHTML = `<p>${tFn("wiki_offline", "The hidden wiki no está disponible sin conexión.")}</p>`;
                }
            }
        });
    }

    if (btnCloseWiki) {
        btnCloseWiki.addEventListener('click', () => {
            if (windowWiki) windowWiki.classList.add('hidden');
            removeTaskbarTab('wiki');
            if (typeof playWindowCloseSound === 'function') playWindowCloseSound();
        });
    }

    if (btnMinWiki) {
        btnMinWiki.addEventListener('click', () => {
            if (windowWiki) windowWiki.classList.add('hidden');
            if (typeof playWindowCloseSound === 'function') playWindowCloseSound();
        });
    }

    // DarkChat and Wallet UI bindings
    const iconChat = document.getElementById('icon-chat');
    const windowChat = document.getElementById('window-chat');
    const btnCloseChat = document.getElementById('btn-close-chat');
    const btnMinChat = document.getElementById('btn-min-chat');
    const chatInput = document.getElementById('chat-input');
    const btnSendChat = document.getElementById('btn-send-chat');

    if (iconChat) {
        iconChat.addEventListener('click', () => {
            if (windowChat) {
                windowChat.classList.remove('hidden');
                if (typeof bringToFront === 'function') bringToFront(windowChat);
            }
            addTaskbarTab('chat', 'DarkChat');
            const walletUI = document.getElementById('wallet-ui');
            if(walletUI) walletUI.classList.remove('hidden');
            if (typeof playWindowOpenSound === 'function') playWindowOpenSound();
        });
    }

    if (btnCloseChat) {
        btnCloseChat.addEventListener('click', () => {
            if (windowChat) windowChat.classList.add('hidden');
            removeTaskbarTab('chat');
            if (typeof playWindowCloseSound === 'function') playWindowCloseSound();
        });
    }

    if (btnMinChat) {
        btnMinChat.addEventListener('click', () => {
            if (windowChat) windowChat.classList.add('hidden');
            if (typeof playWindowCloseSound === 'function') playWindowCloseSound();
        });
    }

    if (btnSendChat && chatInput) {
        btnSendChat.addEventListener('click', () => {
            const text = chatInput.value.trim();
            if(!text) return;
            postChatMessage(`Tú: ${text}`, '#aaa');
            chatInput.value = "";
            
            if (window.StoryMode && typeof window.StoryMode.completeObjective === 'function') {
                window.StoryMode.completeObjective('c1_chat');
            }
            
            if (activeChatTask) {
                const targetNode = window.deepWebDB ? window.deepWebDB.find(n => n.url === text || n.id === text) : null;
                if (targetNode) {
                    if (targetNode.topic === activeChatTask.expectedTopic) {
                        if (activeChatTask.isScam) {
                            postChatMessage('Anónimo: "Gracias por el enlace... ¡Y por tu IP! ¡Disfruta el malware!"', 'red');
                            activeChatTask = null;
                            setTimeout(() => { 
                                if(typeof triggerRandomMinigame === 'function') triggerRandomMinigame(); 
                            }, 2000);
                        } else {
                            const reward = (Math.random() * 0.5 + 0.1);
                            postChatMessage(`Anónimo: "Excelente enlace. Transfiriendo ${reward.toFixed(3)} BTC a tu billetera."`, 'lime');
                            updateWallet(reward);
                            activeChatTask = null;
                        }
                    } else {
                        postChatMessage('Anónimo: "Este no es el tema que pedí. No me sirves."', 'orange');
                        activeChatTask = null;
                    }
                } else {
                    if (state.freeRoam) {
                        setTimeout(() => {
                            const aiReply = typeof getMockAIResponse === 'function' ? getMockAIResponse(text) : "Canal seguro.";
                            postChatMessage(`Guía_Neta: "${aiReply}"`, '#00ffcc');
                        }, 1000);
                    } else {
                        postChatMessage('Anónimo: "Ese enlace no es válido o está caído."', 'orange');
                    }
                }
            } else {
                if (state.freeRoam) {
                    setTimeout(() => {
                        const aiReply = typeof getMockAIResponse === 'function' ? getMockAIResponse(text) : "Canal seguro.";
                        postChatMessage(`Guía_Neta: "${aiReply}"`, '#00ffcc');
                    }, 1000);
                } else {
                    postChatMessage('Sistema: Nadie está esperando una respuesta.', '#555');
                }
            }
        });
        
                chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                btnSendChat.click();
            }
        });
    }

    // ── DarkPaint bindings ───────────────────────────────────
    const iconPaint    = document.getElementById('icon-paint');
    const windowPaint  = document.getElementById('window-paint');
    const btnClosePaint = document.getElementById('btn-close-paint');
    const btnMinPaint   = document.getElementById('btn-min-paint');

    let paintInitialized = false;

    if (iconPaint) {
        iconPaint.addEventListener('click', () => {
            if (!state.freeRoam) return;
            if (windowPaint) {
                windowPaint.classList.remove('hidden');
                if (typeof bringToFront === 'function') bringToFront(windowPaint);
                addTaskbarTab('paint', '🎨 DarkPaint');
                // Init only once so canvas content is preserved
                if (!paintInitialized && typeof window.initDarkPaint === 'function') {
                    window.initDarkPaint();
                    paintInitialized = true;
                }
                if (typeof playWindowOpenSound === 'function') playWindowOpenSound();
            }
        });
    }

    if (btnClosePaint) {
        btnClosePaint.addEventListener('click', () => {
            if (windowPaint) windowPaint.classList.add('hidden');
            removeTaskbarTab('paint');
            if (typeof playWindowCloseSound === 'function') playWindowCloseSound();
        });
    }

    if (btnMinPaint) {
        btnMinPaint.addEventListener('click', () => {
            if (windowPaint) windowPaint.classList.add('hidden');
            if (typeof playWindowCloseSound === 'function') playWindowCloseSound();
        });
    }

    // Dox window close bindings
    const btnCloseDox = document.getElementById('btn-close-dox');
    const windowDox = document.getElementById('window-dox');
    if (btnCloseDox) {
        btnCloseDox.addEventListener('click', () => {
            if (windowDox) windowDox.classList.add('hidden');
            removeTaskbarTab('dox');
            if (typeof playWindowCloseSound === 'function') playWindowCloseSound();
        });
    }

    // Make DarkPaint window draggable
    if (windowPaint) {
        makeDraggable(windowPaint, '.browser-header');
        windowPaint.addEventListener('mousedown', () => bringToFront(windowPaint));
    }

    // === Creador de Fondos Pro Bindings ===
    const iconWallpaperGen = document.getElementById('icon-wallpaper-gen');
    const windowWallpaperGen = document.getElementById('window-wallpaper-gen');
    const btnCloseWallpaperGen = document.getElementById('btn-close-wallpaper-gen');
    const btnMinWallpaperGen = document.getElementById('btn-min-wallpaper-gen');
    const btnWallpaperPreview = document.getElementById('btn-wallpaper-preview');
    const btnWallpaperApply = document.getElementById('btn-wallpaper-apply');

    if (iconWallpaperGen && windowWallpaperGen) {
        iconWallpaperGen.addEventListener('click', () => {
            windowWallpaperGen.classList.remove('hidden');
            if (typeof bringToFront === 'function') bringToFront(windowWallpaperGen);
            addTaskbarTab('wallpaper-gen', '🖼️ Fondos Pro');
            if (typeof playWindowOpenSound === 'function') playWindowOpenSound();
            drawWallpaperPreview(); // Draw default template on open
        });
        makeDraggable(windowWallpaperGen, '.browser-header');
        windowWallpaperGen.addEventListener('mousedown', () => bringToFront(windowWallpaperGen));
    }
    if (btnCloseWallpaperGen && windowWallpaperGen) {
        btnCloseWallpaperGen.addEventListener('click', () => {
            windowWallpaperGen.classList.add('hidden');
            removeTaskbarTab('wallpaper-gen');
            if (typeof playWindowCloseSound === 'function') playWindowCloseSound();
        });
    }
    if (btnMinWallpaperGen && windowWallpaperGen) {
        btnMinWallpaperGen.addEventListener('click', () => {
            windowWallpaperGen.classList.add('hidden');
            if (typeof playWindowCloseSound === 'function') playWindowCloseSound();
        });
    }
    if (btnWallpaperPreview) {
        btnWallpaperPreview.addEventListener('click', () => {
            if (typeof playClickSound === 'function') playClickSound();
            drawWallpaperPreview();
        });
    }
    if (btnWallpaperApply) {
        btnWallpaperApply.addEventListener('click', () => {
            const desktopScreen = document.getElementById('screen-desktop');
            if (desktopScreen) {
                if (typeof playProudSound === 'function') playProudSound();
                
                // Crear un canvas de alta resolución
                const highResCanvas = document.createElement('canvas');
                const screenW = (window.screen && window.screen.width) ? window.screen.width : (window.innerWidth || 1920);
                const screenH = (window.screen && window.screen.height) ? window.screen.height : (window.innerHeight || 1080);
                
                highResCanvas.width = Math.max(1280, screenW);
                highResCanvas.height = Math.max(720, screenH);
                
                if (typeof drawWallpaperOnCanvas === 'function') {
                    drawWallpaperOnCanvas(highResCanvas, true);
                } else {
                    // Fallback directo por si acaso
                    const canvas = document.getElementById('wallpaper-canvas');
                    if (canvas) drawWallpaperPreview();
                }
                
                const activeCanvas = (typeof drawWallpaperOnCanvas === 'function') ? highResCanvas : document.getElementById('wallpaper-canvas');
                if (activeCanvas) {
                    const dataUrl = activeCanvas.toDataURL('image/png');
                    desktopScreen.style.background = `url(${dataUrl})`;
                    desktopScreen.style.backgroundSize = 'cover';
                    desktopScreen.style.backgroundRepeat = 'no-repeat';
                    desktopScreen.style.backgroundPosition = 'center';
                    if (typeof showCustomAlert === 'function') {
                        showCustomAlert("FONDO APLICADO", "El fondo de pantalla personalizado fue generado en alta resolución (" + activeCanvas.width + "x" + activeCanvas.height + ") e inyectado con éxito.", "success");
                    }
                }
            }
        });
    }

    // === Network Node Map Bindings ===
    const iconNodeMap = document.getElementById('icon-nodemap');
    const windowNodeMap = document.getElementById('window-nodemap');
    const btnCloseNodeMap = document.getElementById('btn-close-nodemap');
    const btnMinNodeMap = document.getElementById('btn-min-nodemap');

    if (iconNodeMap && windowNodeMap) {
        iconNodeMap.addEventListener('click', () => {
            windowNodeMap.classList.remove('hidden');
            if (typeof bringToFront === 'function') bringToFront(windowNodeMap);
            addTaskbarTab('nodemap', '🌐 Redes');
            if (typeof playWindowOpenSound === 'function') playWindowOpenSound();
            
            if (!window.networkNodeMap) {
                window.networkNodeMap = new NetworkNodeMap();
            }
            window.networkNodeMap.start();
        });
        makeDraggable(windowNodeMap, '.browser-header');
        windowNodeMap.addEventListener('mousedown', () => bringToFront(windowNodeMap));
    }
    if (btnCloseNodeMap && windowNodeMap) {
        btnCloseNodeMap.addEventListener('click', () => {
            windowNodeMap.classList.add('hidden');
            removeTaskbarTab('nodemap');
            if (typeof playWindowCloseSound === 'function') playWindowCloseSound();
            if (window.networkNodeMap) {
                window.networkNodeMap.stop();
            }
        });
    }
    if (btnMinNodeMap && windowNodeMap) {
        btnMinNodeMap.addEventListener('click', () => {
            windowNodeMap.classList.add('hidden');
            if (typeof playWindowCloseSound === 'function') playWindowCloseSound();
            if (window.networkNodeMap) {
                window.networkNodeMap.stop();
            }
        });
    }

    // === BTC Miner Bindings ===
    const iconMiner = document.getElementById('icon-miner');
    const windowMiner = document.getElementById('window-miner');
    const btnCloseMiner = document.getElementById('btn-close-miner');
    const btnMinMiner = document.getElementById('btn-min-miner');
    const btnMinerToggle = document.getElementById('btn-miner-toggle');

    if (iconMiner && windowMiner) {
        iconMiner.addEventListener('click', () => {
            windowMiner.classList.remove('hidden');
            if (typeof bringToFront === 'function') bringToFront(windowMiner);
            addTaskbarTab('miner', '⛏️ Minador BTC');
            if (typeof playWindowOpenSound === 'function') playWindowOpenSound();
        });
        makeDraggable(windowMiner, '.browser-header');
        windowMiner.addEventListener('mousedown', () => bringToFront(windowMiner));
    }
    if (btnCloseMiner && windowMiner) {
        btnCloseMiner.addEventListener('click', () => {
            windowMiner.classList.add('hidden');
            removeTaskbarTab('miner');
            if (typeof playWindowCloseSound === 'function') playWindowCloseSound();
        });
    }
    if (btnMinMiner && windowMiner) {
        btnMinMiner.addEventListener('click', () => {
            windowMiner.classList.add('hidden');
            if (typeof playWindowCloseSound === 'function') playWindowCloseSound();
        });
    }
    if (btnMinerToggle) {
        btnMinerToggle.addEventListener('click', toggleMiner);
    }

    // === NetSniffer Bindings ===
    const iconNetSniffer = document.getElementById('icon-netsniffer');
    const windowNetSniffer = document.getElementById('window-netsniffer');
    const btnCloseNetSniffer = document.getElementById('btn-close-netsniffer');
    const btnMinNetSniffer = document.getElementById('btn-min-netsniffer');

    if (iconNetSniffer && windowNetSniffer) {
        iconNetSniffer.addEventListener('click', () => {
            windowNetSniffer.classList.remove('hidden');
            if (typeof bringToFront === 'function') bringToFront(windowNetSniffer);
            addTaskbarTab('netsniffer', '📡 NetSniffer');
            if (typeof playWindowOpenSound === 'function') playWindowOpenSound();
            
            // Inicializar simulación de sniffing
            if (typeof initNetSniffer === 'function') {
                initNetSniffer();
            }
        });
        makeDraggable(windowNetSniffer, '.browser-header');
        windowNetSniffer.addEventListener('mousedown', () => bringToFront(windowNetSniffer));
    }
    if (btnCloseNetSniffer && windowNetSniffer) {
        btnCloseNetSniffer.addEventListener('click', () => {
            windowNetSniffer.classList.add('hidden');
            removeTaskbarTab('netsniffer');
            if (typeof playWindowCloseSound === 'function') playWindowCloseSound();
            
            // Detener simulación de sniffing
            if (typeof shutdownNetSniffer === 'function') {
                shutdownNetSniffer();
            }
        });
    }
    if (btnMinNetSniffer && windowNetSniffer) {
        btnMinNetSniffer.addEventListener('click', () => {
            windowNetSniffer.classList.add('hidden');
            if (typeof playWindowCloseSound === 'function') playWindowCloseSound();
        });
    }

    // Auto-previsualize wallpaper generator on changes
    const wpBgSelect = document.getElementById('wallpaper-bg-select');
    const wpPatternSelect = document.getElementById('wallpaper-pattern-select');
    const wpTextInput = document.getElementById('wallpaper-text-input');
    const wpColorSelect = document.getElementById('wallpaper-color-select');
    const wpSizeSelect = document.getElementById('wallpaper-size-select');
    
    [wpBgSelect, wpPatternSelect, wpColorSelect, wpSizeSelect].forEach(el => {
        if (el) el.addEventListener('change', drawWallpaperPreview);
    });
    if (wpTextInput) wpTextInput.addEventListener('input', drawWallpaperPreview);


});


// Wallpaper canvas renderer with support for high resolution scaling
function drawWallpaperOnCanvas(canvas, isHighRes = false) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const bgSelect = document.getElementById('wallpaper-bg-select');
    const patternSelect = document.getElementById('wallpaper-pattern-select');
    const textInput = document.getElementById('wallpaper-text-input');
    const colorSelect = document.getElementById('wallpaper-color-select');
    const sizeSelect = document.getElementById('wallpaper-size-select');

    const bg = bgSelect ? bgSelect.value : '#000000';
    const pattern = patternSelect ? patternSelect.value : 'none';
    const text = textInput ? textInput.value : '';
    const textColor = colorSelect ? colorSelect.value : '#00ff66';
    
    // Scale fonts and spacing if rendering in high-res
    let rawTextSize = sizeSelect ? sizeSelect.value : '16px';
    let sizeNumber = parseInt(rawTextSize, 10) || 16;
    
    if (isHighRes) {
        // High-res output is usually around 1920px wide. Preview is 260px wide.
        const scale = canvas.width / 260;
        sizeNumber = Math.round(sizeNumber * scale);
    }
    const textSize = sizeNumber + 'px';
    
    // Draw background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw pattern
    if (pattern === 'grid') {
        ctx.strokeStyle = textColor + '24'; // subtle transparency
        ctx.lineWidth = isHighRes ? Math.max(1, Math.round(canvas.width / 260)) : 1;
        const step = isHighRes ? Math.round(20 * (canvas.width / 260)) : 20;
        for (let x = 0; x < canvas.width; x += step) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += step) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    } else if (pattern === 'scanlines') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        const step = isHighRes ? Math.max(2, Math.round(4 * (canvas.height / 200))) : 4;
        const height = isHighRes ? Math.max(1, Math.round(2 * (canvas.height / 200))) : 2;
        for (let y = 0; y < canvas.height; y += step) {
            ctx.fillRect(0, y, canvas.width, height);
        }
    } else if (pattern === 'matrix') {
        ctx.fillStyle = textColor + '33'; // subtle transparency
        const fontSize = isHighRes ? Math.round(9 * (canvas.width / 260)) : 9;
        ctx.font = `${fontSize}px monospace`;
        const stepX = isHighRes ? Math.round(15 * (canvas.width / 260)) : 15;
        const stepY = isHighRes ? Math.round(15 * (canvas.height / 200)) : 15;
        for (let x = stepX / 2; x < canvas.width; x += stepX) {
            for (let y = stepY * 0.8; y < canvas.height; y += stepY) {
                if (Math.random() > 0.6) {
                    ctx.fillText(Math.floor(Math.random() * 2), x, y);
                }
            }
        }
    }
    
    // Draw text
    if (text) {
        ctx.fillStyle = textColor;
        ctx.font = `bold ${textSize} monospace`;
        ctx.textAlign = 'center';
        ctx.shadowColor = textColor;
        ctx.shadowBlur = isHighRes ? Math.round(4 * (canvas.width / 260)) : 4;
        // Shift text based on size so it sits nicely in the center
        const offsetShift = sizeNumber / 3;
        ctx.fillText(text, canvas.width / 2, canvas.height / 2 + offsetShift);
        ctx.shadowBlur = 0; // reset
    }
}

function drawWallpaperPreview() {
    const canvas = document.getElementById('wallpaper-canvas');
    drawWallpaperOnCanvas(canvas, false);
}

// Network Node Map class representing dynamic network connections
class NetworkNodeMap {
    constructor() {
        this.canvas = document.getElementById('nodemap-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.nodes = [];
        this.edges = [];
        this.packets = [];
        this.scanned = false;
        this.scanning = false;
        this.scanProgress = 0;
        this.scanRadius = 0;
        
        this.selectedNode = null;
        this.animationId = null;
        
        this.logEl = document.getElementById('nodemap-log');
        this.statusTextEl = document.getElementById('nodemap-status-text');
        this.connCountEl = document.getElementById('nodemap-connections-count');
        this.scanBtn = document.getElementById('btn-nodemap-scan');
        
        this.init();
    }
    
    init() {
        this.resetNodes();
        
        this.hackedNodes = new Set();
        this.hackBtn = document.getElementById('btn-nodemap-hack');
        this.hackOverlay = document.getElementById('nodemap-hack-overlay');
        this.hackBtnStart = document.getElementById('nodemap-hack-btn-start');
        this.hackBtnCancel = document.getElementById('nodemap-hack-btn-cancel');
        this.hackBlocks = document.querySelectorAll('.hack-block');
        
        if (this.hackBtn) {
            this.hackBtn.addEventListener('click', () => this.openHackMinigame());
        }
        if (this.hackBtnCancel) {
            this.hackBtnCancel.addEventListener('click', () => this.closeHackMinigame());
        }
        if (this.hackBtnStart) {
            this.hackBtnStart.addEventListener('click', () => this.startHackSequence());
        }
        
        this.hackBlocks.forEach(block => {
            block.addEventListener('click', (e) => this.handleBlockClick(e));
        });

        // Canvas click handler
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        
        // Scan button listener
        if (this.scanBtn) {
            // Remove old listener if any
            const newBtn = this.scanBtn.cloneNode(true);
            this.scanBtn.parentNode.replaceChild(newBtn, this.scanBtn);
            this.scanBtn = newBtn;
            this.scanBtn.addEventListener('click', () => this.startScan());
        }
        
        this.updateUI();
    }
    
    resetNodes() {
        this.nodes = [
            { id: 'local', label: '192.168.1.44 (LOCAL)', ip: '192.168.1.44', x: 240, y: 130, radius: 8, color: '#00ff66', state: 'ONLINE', ping: '1ms', details: 'Nexo de Entrada. Cripto-encriptación activada.', speedX: 0, speedY: 0, discovered: true },
            { id: 'gogle', label: 'gogle.com', ip: '172.217.16.14', x: 100, y: 60, radius: 6, color: '#3399ff', state: 'ONLINE', ping: '22ms', details: 'Clearnet Proxy. Puerto 80 abierto.', speedX: 0.2, speedY: -0.1, discovered: true },
            { id: 'torch', label: 'torchsearch.ann', ip: '10.45.2.89', x: 380, y: 70, radius: 6, color: '#ffcc00', state: 'ONLINE', ping: '84ms', details: 'Motor de búsqueda cebolla. Latencia de ruteo variable.', speedX: -0.15, speedY: 0.25, discovered: true },
            { id: 'crimson', label: 'crimson_forum.ann', ip: '10.221.9.12', x: 80, y: 200, radius: 6, color: '#ff3333', state: 'ONLINE', ping: '124ms', details: 'Nodo de intercambio P2P. Tráfico altamente cifrado.', speedX: -0.1, speedY: -0.15, discovered: true },
            { id: 'silksale', label: 'silksale.ann', ip: '10.88.42.100', x: 350, y: 210, radius: 6, color: '#ff00ff', state: 'ONLINE', ping: '92ms', details: 'Servicio de hosting y mercado libre de la Deep Web.', speedX: 0.25, speedY: -0.2, discovered: true },
            { id: 'relay1', label: 'Tor Guard Node', ip: '84.120.43.19', x: 200, y: 190, radius: 5, color: '#ffffff', state: 'ONLINE', ping: '15ms', details: 'Primer salto Tor. Nodo intermedio cifrado.', speedX: -0.05, speedY: 0.1, discovered: true },
            { id: 'relay2', label: 'Tor Exit Node', ip: '95.216.14.88', x: 280, y: 80, radius: 5, color: '#ffffff', state: 'ONLINE', ping: '48ms', details: 'Salida de circuito Tor. Tráfico descifrado hacia clearnet.', speedX: 0.12, speedY: 0.08, discovered: true }
        ];
        
        this.edges = [
            { from: 'local', to: 'gogle' },
            { from: 'local', to: 'torch' },
            { from: 'local', to: 'relay1' },
            { from: 'relay1', to: 'relay2' },
            { from: 'relay2', to: 'torch' },
            { from: 'torch', to: 'silksale' },
            { from: 'gogle', to: 'crimson' }
        ];
        
        this.packets = [];
        this.edges.forEach(edge => {
            const numPackets = Math.floor(Math.random() * 2) + 1;
            for (let i = 0; i < numPackets; i++) {
                this.packets.push({
                    edge: edge,
                    progress: Math.random(),
                    speed: 0.003 + Math.random() * 0.004,
                    color: '#00ff66'
                });
            }
        });
        
        this.scanned = true;
    }
    
    start() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.loop();
    }
    
    stop() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
    }
    
    startScan() {
        if (this.scanning) return;
        this.scanning = true;
        this.scanRadius = 0;
        this.selectedNode = null;
        
        if (this.logEl) this.logEl.innerHTML = tFn("netmanager_scan_start", "[SCAN] Iniciando barrido electromagnético en circuito de red ANN...");
        if (this.statusTextEl) {
            this.statusTextEl.innerText = tFn("netmanager_scanning", "ESCANEANDO...");
            this.statusTextEl.style.color = 'yellow';
        }
        
        this.nodes.forEach(n => {
            if (n.id !== 'local') n.discovered = false;
            else n.discovered = true;
        });
        
        this.updateUI();
        if (typeof playClickSound === 'function') playClickSound();
    }
    
    playBeep(freq = 800) {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.04, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.08);
        } catch (err) {}
    }
    
    handleCanvasClick(e) {
        if (this.scanning) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const clickX = (e.clientX - rect.left) * scaleX;
        const clickY = (e.clientY - rect.top) * scaleY;
        
        let foundNode = null;
        this.nodes.forEach(node => {
            if (!node.discovered) return;
            const dist = Math.hypot(clickX - node.x, clickY - node.y);
            if (dist <= node.radius + 8) {
                foundNode = node;
            }
        });
        
        this.selectedNode = foundNode;
        if (foundNode) {
            this.playBeep(900);
            if (this.logEl) {
                this.logEl.innerHTML = `<span style="color:#00ff66;">[NODO] ${foundNode.label}</span> | IP: ${foundNode.ip} | PING: ${foundNode.ping}<br><span style="color:#888;">>> ${foundNode.details}</span>`;
            }
            
            // Show HACK button if it's not the local node and not already hacked
            if (this.hackBtn && foundNode.id !== 'local' && !this.hackedNodes.has(foundNode.id)) {
                this.hackBtn.classList.remove('hidden');
                this.hackBtn.style.display = 'inline-block';
            } else if (this.hackBtn) {
                this.hackBtn.classList.add('hidden');
                this.hackBtn.style.display = 'none';
            }
        } else {
            // Hide hack button when clicking empty space
            if (this.hackBtn) {
                this.hackBtn.classList.add('hidden');
                this.hackBtn.style.display = 'none';
            }
        }
    }
    
    updateUI() {
        if (this.connCountEl) {
            const activeCount = this.nodes.filter(n => n.discovered).length;
            this.connCountEl.innerText = `${activeCount}/${this.nodes.length}`;
        }
    }
    
    update() {
        this.nodes.forEach(node => {
            if (node.id === 'local') return;
            node.x += node.speedX;
            node.y += node.speedY;
            
            const buffer = 30;
            if (node.x < buffer || node.x > this.canvas.width - buffer) {
                node.speedX *= -1;
                node.x = Math.max(buffer, Math.min(node.x, this.canvas.width - buffer));
            }
            if (node.y < buffer || node.y > this.canvas.height - buffer) {
                node.speedY *= -1;
                node.y = Math.max(buffer, Math.min(node.y, this.canvas.height - buffer));
            }
        });
        
        this.packets.forEach(p => {
            p.progress += p.speed;
            if (p.progress >= 1) {
                p.progress = 0;
                p.speed = 0.003 + Math.random() * 0.004;
            }
        });
        
        if (this.scanning) {
            const maxRadius = Math.hypot(this.canvas.width, this.canvas.height);
            this.scanRadius += 4;
            
            this.nodes.forEach(node => {
                if (!node.discovered) {
                    const localNode = this.nodes.find(n => n.id === 'local');
                    const distToLocal = Math.hypot(node.x - localNode.x, node.y - localNode.y);
                    if (this.scanRadius >= distToLocal) {
                        node.discovered = true;
                        this.playBeep(500 + (this.scanRadius * 0.5));
                        if (this.logEl) {
                            const nodeFoundTpl = tFn("netmanager_node_found", "[NODO DESCUBIERTO] Encontrada interfaz activa en {ip} ({label})");
                            this.logEl.innerText = nodeFoundTpl.replace('{ip}', node.ip).replace('{label}', node.label);
                        }
                        this.updateUI();
                    }
                }
            });
            
            if (this.scanRadius >= maxRadius) {
                this.scanning = false;
                if (this.statusTextEl) {
                    this.statusTextEl.innerText = tFn("netmanager_stable", "ESTABLE");
                    this.statusTextEl.style.color = '#00ff66';
                }
                if (this.logEl) this.logEl.innerHTML = tFn("netmanager_scan_complete", "[SCAN] Escaneo de red finalizado. Circuito virtual ANN enrutado correctamente.");
            }
        }
    }
    
    draw() {
        const ctx = this.ctx;
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        ctx.strokeStyle = 'rgba(0, 255, 102, 0.03)';
        ctx.lineWidth = 1;
        for (let x = 0; x < this.canvas.width; x += 20) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.canvas.height); ctx.stroke();
        }
        for (let y = 0; y < this.canvas.height; y += 20) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.canvas.width, y); ctx.stroke();
        }
        
        // Draw connections (edges)
        ctx.lineWidth = 1;
        this.edges.forEach(edge => {
            const fromNode = this.nodes.find(n => n.id === edge.from);
            const toNode = this.nodes.find(n => n.id === edge.to);
            if (fromNode && toNode && fromNode.discovered && toNode.discovered) {
                ctx.strokeStyle = 'rgba(0, 255, 102, 0.15)';
                ctx.beginPath();
                ctx.moveTo(fromNode.x, fromNode.y);
                ctx.lineTo(toNode.x, toNode.y);
                ctx.stroke();
            }
        });
        
        // Draw data packets
        this.packets.forEach(p => {
            const fromNode = this.nodes.find(n => n.id === p.edge.from);
            const toNode = this.nodes.find(n => n.id === p.edge.to);
            if (fromNode && toNode && fromNode.discovered && toNode.discovered) {
                const px = fromNode.x + (toNode.x - fromNode.x) * p.progress;
                const py = fromNode.y + (toNode.y - fromNode.y) * p.progress;
                
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(px, py, 2.5, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        // Draw scan sweep circle
        if (this.scanning) {
            const localNode = this.nodes.find(n => n.id === 'local');
            ctx.strokeStyle = 'rgba(0, 255, 102, 0.25)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(localNode.x, localNode.y, this.scanRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.fillStyle = 'rgba(0, 255, 102, 0.02)';
            ctx.beginPath();
            ctx.arc(localNode.x, localNode.y, this.scanRadius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw nodes
        this.nodes.forEach(node => {
            if (!node.discovered) return;
            
            // Draw selection glow
            if (node === this.selectedNode) {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius + 4, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            ctx.fillStyle = node.color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Labels
            ctx.fillStyle = '#00ff66';
            ctx.font = '8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(node.label.split(' ')[0], node.x, node.y - node.radius - 4);
        });
    }
    
    loop() {
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.loop());
    }
    
    // ── HACKING MINIGAME METHODS ──
    
    openHackMinigame() {
        if (!this.selectedNode || this.selectedNode.id === 'local') return;
        if (this.hackedNodes.has(this.selectedNode.id)) return;

        this.hackTargetNode = this.selectedNode;
        this.hackSequence = [];
        this.hackPlayerInput = [];
        this.hackPhase = 'waiting'; // waiting, showing, input, result
        
        const titleEl = document.getElementById('nodemap-hack-title');
        const instructionEl = document.getElementById('nodemap-hack-instruction');
        if (titleEl) {
            const tpl = tFn("hack_intrusion_title", "INTRUSIÓN EN NODO: {ip}");
            titleEl.textContent = tpl.replace('{ip}', this.hackTargetNode.ip);
        }
        if (instructionEl) instructionEl.textContent = tFn("hack_press_play", "Presione REPRODUCIR para ver la secuencia. Luego repítala en orden.");
        
        // Reset blocks visual
        this.hackBlocks.forEach(block => {
            block.style.background = 'rgba(0,255,102,0.1)';
            block.style.borderColor = '#00ff66';
            block.style.pointerEvents = 'none';
        });
        
        if (this.hackOverlay) {
            this.hackOverlay.classList.remove('hidden');
            this.hackOverlay.style.display = 'flex';
        }
        
        if (typeof playClickSound === 'function') playClickSound();
    }
    
    closeHackMinigame() {
        this.hackPhase = 'waiting';
        this.hackSequence = [];
        this.hackPlayerInput = [];
        this.hackTargetNode = null;
        
        if (this.hackOverlay) {
            this.hackOverlay.classList.add('hidden');
            this.hackOverlay.style.display = 'none';
        }
        
        // Hide hack button
        if (this.hackBtn) {
            this.hackBtn.classList.add('hidden');
            this.hackBtn.style.display = 'none';
        }
    }
    
    startHackSequence() {
        if (this.hackPhase === 'showing' || this.hackPhase === 'input') return;
        
        // Generate random sequence of 4-6 blocks
        const seqLength = 4 + Math.floor(Math.random() * 3); // 4 to 6
        this.hackSequence = [];
        for (let i = 0; i < seqLength; i++) {
            this.hackSequence.push(Math.floor(Math.random() * 4));
        }
        this.hackPlayerInput = [];
        this.hackPhase = 'showing';
        
        const instructionEl = document.getElementById('nodemap-hack-instruction');
        if (instructionEl) {
            const tpl = tFn("hack_watch_seq", "Observe la secuencia de {count} bloques...");
            instructionEl.textContent = tpl.replace('{count}', seqLength);
        }
        
        // Disable player clicks during showing
        this.hackBlocks.forEach(block => {
            block.style.pointerEvents = 'none';
        });
        
        // Flash sequence one by one
        let step = 0;
        const flashInterval = setInterval(() => {
            // Reset all blocks
            this.hackBlocks.forEach(block => {
                block.style.background = 'rgba(0,255,102,0.1)';
                block.style.borderColor = '#00ff66';
            });
            
            if (step >= this.hackSequence.length) {
                clearInterval(flashInterval);
                
                // Enable player input
                this.hackPhase = 'input';
                if (instructionEl) {
                    const tpl = tFn("hack_repeat_seq", "¡Repita la secuencia! ({cur}/{total})");
                    instructionEl.textContent = tpl.replace('{cur}', this.hackPlayerInput.length).replace('{total}', this.hackSequence.length);
                }
                this.hackBlocks.forEach(block => {
                    block.style.pointerEvents = 'auto';
                    block.style.cursor = 'pointer';
                });
                return;
            }
            
            // Flash the current block
            const idx = this.hackSequence[step];
            const block = this.hackBlocks[idx];
            if (block) {
                block.style.background = '#00ff66';
                block.style.borderColor = '#ffffff';
            }
            this.playBeep(600 + idx * 200);
            
            step++;
        }, 600);
    }
    
    handleBlockClick(e) {
        if (this.hackPhase !== 'input') return;
        
        const idx = parseInt(e.target.getAttribute('data-idx'));
        if (isNaN(idx)) return;
        
        this.hackPlayerInput.push(idx);
        
        // Flash the block briefly
        const block = this.hackBlocks[idx];
        if (block) {
            block.style.background = '#00ff66';
            block.style.borderColor = '#ffffff';
            setTimeout(() => {
                block.style.background = 'rgba(0,255,102,0.1)';
                block.style.borderColor = '#00ff66';
            }, 200);
        }
        this.playBeep(600 + idx * 200);
        
        const currentStep = this.hackPlayerInput.length - 1;
        const instructionEl = document.getElementById('nodemap-hack-instruction');
        
        // Check if the last input was correct
        if (this.hackPlayerInput[currentStep] !== this.hackSequence[currentStep]) {
            // WRONG - fail
            this.hackPhase = 'result';
            this.hackBlocks.forEach(b => {
                b.style.background = 'rgba(255,0,60,0.3)';
                b.style.borderColor = '#ff003c';
                b.style.pointerEvents = 'none';
            });
            if (instructionEl) instructionEl.textContent = tFn("hack_wrong_seq", "✗ SECUENCIA INCORRECTA. Intrusión fallida. Intente de nuevo.");
            this.playBeep(200);
            
            // Reset after a delay
            setTimeout(() => {
                this.hackPhase = 'waiting';
                this.hackBlocks.forEach(b => {
                    b.style.background = 'rgba(0,255,102,0.1)';
                    b.style.borderColor = '#00ff66';
                    b.style.pointerEvents = 'none';
                });
                if (instructionEl) instructionEl.textContent = tFn("hack_try_again", "Presione REPRODUCIR para intentar de nuevo.");
            }, 2000);
            return;
        }
        
        if (instructionEl) {
            const tpl = tFn("hack_repeat_seq", "¡Repita la secuencia! ({cur}/{total})");
            instructionEl.textContent = tpl.replace('{cur}', this.hackPlayerInput.length).replace('{total}', this.hackSequence.length);
        }
        
        // Check if sequence is complete
        if (this.hackPlayerInput.length === this.hackSequence.length) {
            // SUCCESS!
            this.hackPhase = 'result';
            this.hackBlocks.forEach(b => {
                b.style.background = 'rgba(0,255,102,0.4)';
                b.style.borderColor = '#00ff66';
                b.style.pointerEvents = 'none';
            });
            
            const reward = 0.03 + Math.random() * 0.02; // 0.03 to 0.05 BTC
            if (instructionEl) {
                const tpl = tFn("hack_success", "✓ ¡NODO COMPROMETIDO! +₿ {reward} BTC depositados.");
                instructionEl.textContent = tpl.replace('{reward}', reward.toFixed(3));
            }
            
            // Mark as hacked
            if (this.hackTargetNode) {
                this.hackedNodes.add(this.hackTargetNode.id);
                this.hackTargetNode.color = '#ff003c'; // Red = hacked
                this.hackTargetNode.details = (window.getLanguage && window.getLanguage() === 'en' ? '[COMPROMISED] ' : '[COMPROMETIDO] ') + this.hackTargetNode.details;
            }
            
            // Grant BTC
            if (typeof updateWallet === 'function') {
                updateWallet(reward);
            }
            if (typeof playProudSound === 'function') playProudSound();
            
            if (this.logEl) {
                const tpl = tFn("hack_log_success", "<span style='color:#ff003c;'>[HACK]</span> Nodo {ip} comprometido. ₿ {reward} BTC extraídos del servidor remoto.");
                this.logEl.innerHTML = tpl.replace('{ip}', this.hackTargetNode?.ip || '').replace('{reward}', reward.toFixed(3));
            }
            
            if (typeof showWinHelloBubble === 'function') {
                const tpl = tFn("hack_winhello_success", "Acceso root obtenido en {ip}. Fondos transferidos a la billetera local.");
                showWinHelloBubble(tpl.replace('{ip}', this.hackTargetNode?.ip || ''), 8000, 'proud');
            }
            
            // Close after a delay
            setTimeout(() => {
                this.closeHackMinigame();
            }, 1800);
        }
    }
}

// BTC Miner toggle & core loop
let minerInterval = null;
let minerSharesInterval = null;
let minerProgressInterval = null;
let isMining = false;

function toggleMiner() {
    const btn = document.getElementById('btn-miner-toggle');
    const consoleEl = document.getElementById('miner-console');
    const statusEl = document.getElementById('miner-status');
    const hashrateEl = document.getElementById('miner-hashrate');
    const progressBar = document.getElementById('miner-progress-bar');
    const percentText = document.getElementById('miner-percent');
    
    if (!btn || !consoleEl || !statusEl || !hashrateEl) return;
    
    if (typeof playClickSound === 'function') playClickSound();
    
    if (isMining) {
        // Stop mining
        isMining = false;
        clearInterval(minerInterval);
        clearInterval(minerSharesInterval);
        clearInterval(minerProgressInterval);
        btn.innerText = tFn("miner_btn_start", "INICIAR MINADO");
        btn.style.borderColor = "#00ff66";
        btn.style.color = "#00ff66";
        statusEl.innerText = tFn("miner_status_idle", "Inactivo");
        statusEl.style.color = "#aaa";
        hashrateEl.innerText = "0 H/s";
        if (progressBar) progressBar.style.width = '0%';
        if (percentText) percentText.innerText = '0%';
        consoleEl.innerHTML += `\n[MINER] ${window.getLanguage && window.getLanguage() === 'en' ? 'Mining service stopped logically.' : 'Servicio de minado detenido lógicamente.'}\n`;
        consoleEl.scrollTop = consoleEl.scrollHeight;
    } else {
        // Start mining
        isMining = true;
        btn.innerText = tFn("miner_btn_stop", "DETENER MINADO");
        btn.style.borderColor = "red";
        btn.style.color = "red";
        statusEl.innerText = tFn("miner_status_mining", "Minando...");
        statusEl.style.color = "lime";
        
        // Intensity radio
        const intensity = parseFloat(document.querySelector('input[name="miner-intensity"]:checked')?.value || 0.1);
        const rates = { 0.1: 45, 0.5: 280, 0.9: 890 };
        hashrateEl.innerText = `${rates[intensity] + Math.floor(Math.random() * 20)} H/s`;
        
        consoleEl.innerHTML = tFn("miner_connecting", `[MINER] Conectando a pool pool.antpool.com:3333...`);
        consoleEl.innerHTML += `\n${tFn("miner_connected", "[MINER] Conexión establecida. CPU Threads: 4. Dificultad: 1200.")}`;
        const miningBlockTpl = tFn("miner_mining_block", "[MINER] Minando bloque #{block} a intensidad {intensity}%...");
        consoleEl.innerHTML += `\n${miningBlockTpl.replace('{block}', '840921').replace('{intensity}', (intensity*100).toFixed(0))}`;
        consoleEl.scrollTop = consoleEl.scrollHeight;

        // Hashrate updates and logs
        minerInterval = setInterval(() => {
            const currentRate = rates[intensity] + Math.floor(Math.random() * 25) - 12;
            hashrateEl.innerText = `${currentRate} H/s`;
            const logs = window.getLanguage && window.getLanguage() === 'en' ? [
                `[MINER] Current hashrate: ${currentRate} H/s. CPU State: nominal.`,
                `[MINER] Searching valid hashes on block #840921...`,
                `[MINER] Broadcasting telemetry to pool... ping ok.`
            ] : [
                `[MINER] Hashrate actual: ${currentRate} H/s. Estado de CPU: nominal.`,
                `[MINER] Buscando hashes válidos sobre bloque #840921...`,
                `[MINER] Transmitiendo telemetría a pool... ping ok.`
            ];
            consoleEl.innerHTML += `\n${logs[Math.floor(Math.random() * logs.length)]}`;
            consoleEl.scrollTop = consoleEl.scrollHeight;
        }, 3000);

        // Share progress & payout
        const shareDelay = intensity === 0.1 ? 16000 : intensity === 0.5 ? 9000 : 5000;
        const increment = (100 / (shareDelay / 100)); // total steps
        let progress = 0;
        
        if (progressBar) progressBar.style.width = '0%';
        if (percentText) percentText.innerText = '0%';

        minerProgressInterval = setInterval(() => {
            if (!isMining) return;
            progress += increment;
            if (progress >= 100) {
                progress = 0;
                const payout = (intensity === 0.1 ? 0.001 : intensity === 0.5 ? 0.003 : 0.008);
                if (typeof updateWallet === 'function') updateWallet(payout);
                
                const shareAcceptedTpl = tFn("miner_share_accepted", "[MINER] ¡Share aceptado por la pool! Payout: +₿ {payout} BTC (Satoshis).");
                consoleEl.innerHTML += `\n<span style="color:yellow;">${shareAcceptedTpl.replace('{payout}', payout.toFixed(3))}</span>`;
                consoleEl.scrollTop = consoleEl.scrollHeight;

                // Danger trigger for high intensity mining
                if (intensity === 0.9 && Math.random() < 0.25) {
                    consoleEl.innerHTML += `\n<span style="color:red;">${tFn("miner_overheat_alert", "[MINER] ALERTA: Pico de temperatura detectado. Kernel en peligro.")}</span>`;
                    consoleEl.scrollTop = consoleEl.scrollHeight;
                    if (typeof showCustomAlert === 'function') {
                        showCustomAlert(tFn("miner_alert_title", "ALERTA DE SISTEMA"), tFn("miner_alert_msg", "El minado a alta intensidad ha provocado una sobrecarga térmica. Cuidado con el rastreo biológico."), "warning");
                    }
                    
                    if (typeof triggerImmediateWander === 'function') {
                        triggerImmediateWander();
                    }
                }
            }
            if (progressBar) progressBar.style.width = `${progress}%`;
            if (percentText) percentText.innerText = `${Math.floor(progress)}%`;
        }, 100);
    }
}


// --- BINDINGS APP EXPEDIENTE 98 (MODO HISTORIA) ---
function initExpedienteApp() {
    const iconExpediente = document.getElementById('icon-expediente');
    const windowExpediente = document.getElementById('window-expediente');
    const btnCloseExpediente = document.getElementById('btn-close-expediente');
    const btnMinExpediente = document.getElementById('btn-min-expediente');
    const btnToggleWidget = document.getElementById('btn-toggle-story-widget');
    const btnCloseWidget = document.getElementById('btn-close-story-widget');
    const widgetBody = document.getElementById('story-widget-body');
    const storyWidget = document.getElementById('story-mission-widget');

    if (iconExpediente) {
        iconExpediente.addEventListener('click', () => {
            if (windowExpediente) {
                windowExpediente.classList.remove('hidden');
                if (typeof bringToFront === 'function') bringToFront(windowExpediente);
                if (typeof addTaskbarTab === 'function') addTaskbarTab('expediente', 'Expediente 98');
                if (typeof playWindowOpenSound === 'function') playWindowOpenSound();
                if (window.StoryMode && typeof window.StoryMode.updateStoryUI === 'function') {
                    window.StoryMode.updateStoryUI();
                }
            }
            if (storyWidget) {
                storyWidget.classList.remove('hidden');
            }
        });
    }

    if (btnCloseExpediente) {
        btnCloseExpediente.addEventListener('click', () => {
            if (windowExpediente) windowExpediente.classList.add('hidden');
            if (typeof removeTaskbarTab === 'function') removeTaskbarTab('expediente');
            if (typeof playWindowCloseSound === 'function') playWindowCloseSound();
        });
    }

    if (btnMinExpediente) {
        btnMinExpediente.addEventListener('click', () => {
            if (windowExpediente) windowExpediente.classList.add('hidden');
            if (typeof playWindowCloseSound === 'function') playWindowCloseSound();
        });
    }

    if (btnToggleWidget && widgetBody) {
        btnToggleWidget.addEventListener('click', () => {
            widgetBody.classList.toggle('hidden');
            btnToggleWidget.innerText = widgetBody.classList.contains('hidden') ? '+' : '_';
        });
    }

    if (btnCloseWidget && storyWidget) {
        btnCloseWidget.addEventListener('click', () => {
            storyWidget.classList.add('hidden');
            if (typeof playWindowCloseSound === 'function') playWindowCloseSound();
        });
    }

    // Hacer arrastrable el widget de historia mediante su cabecera
    if (storyWidget) {
        const header = storyWidget.querySelector('.story-widget-header');
        if (header) {
            let isDragging = false, startX = 0, startY = 0, initialLeft = 0, initialTop = 0;
            header.addEventListener('mousedown', (e) => {
                if (e.target.tagName === 'BUTTON') return;
                isDragging = true;
                header.style.cursor = 'grabbing';
                startX = e.clientX;
                startY = e.clientY;
                const rect = storyWidget.getBoundingClientRect();
                initialLeft = rect.left;
                initialTop = rect.top;
                storyWidget.style.right = 'auto';
                storyWidget.style.left = initialLeft + 'px';
                storyWidget.style.top = initialTop + 'px';
            });
            window.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                const newLeft = Math.max(10, Math.min(window.innerWidth - storyWidget.offsetWidth - 10, initialLeft + dx));
                const newTop = Math.max(10, Math.min(window.innerHeight - 80, initialTop + dy));
                storyWidget.style.left = newLeft + 'px';
                storyWidget.style.top = newTop + 'px';
            });
            window.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    header.style.cursor = 'grab';
                }
            });
        }
    }

    // Mostrar el widget de misión en el escritorio si está en modo libre
    if (storyWidget && window.state && window.state.freeRoam) {
        storyWidget.classList.remove('hidden');
        if (window.StoryMode && typeof window.StoryMode.updateStoryUI === 'function') {
            window.StoryMode.updateStoryUI();
        }
    }
}

// Exportar globalmente
window.initExpedienteApp = initExpedienteApp;
window.addTaskbarTab = addTaskbarTab;
window.removeTaskbarTab = removeTaskbarTab;
window.updateTrashUI = updateTrashUI;
window.logAntivirus = logAntivirus;
window.postChatMessage = postChatMessage;
window.toggleNode = toggleNode;
window.nodeStates = nodeStates;
window.drawWallpaperPreview = drawWallpaperPreview;
window.NetworkNodeMap = NetworkNodeMap;
window.toggleMiner = toggleMiner;


