// --- Z-INDEX & DRAG AND DROP SYSTEMS ---

let highestZIndex = 50;

function bringToFront(element) {
    highestZIndex++;
    element.style.zIndex = highestZIndex;
}

function makeDraggable(element, handleSelector) {
    const handle = handleSelector ? element.querySelector(handleSelector) : element;
    if (!handle) return;
    
    let isDragging = false;
    let startX, startY, initialX, initialY;
    let hasMoved = false;
    let preventNextClick = false; // bloquea solo el click inmediato post-drag

    // Cursor visual de arrastre en la barra de título
    handle.style.cursor = 'grab';

    handle.addEventListener('mousedown', (e) => {
        if (!state.freeRoam) return;
        // Ignorar clicks en botones interactivos dentro del header (minimizar, cerrar, inputs)
        if (e.target.closest('button, .close-btn, .min-btn, .story-widget-min-btn, input, select, textarea')) return;
        
        isDragging = true;
        hasMoved = false;
        preventNextClick = false;
        bringToFront(element);
        handle.style.cursor = 'grabbing';

        // Usar offsetLeft y offsetTop para que la posición inicial coincida exactamente con el offsetParent sin saltos
        startX = e.clientX;
        startY = e.clientY;
        initialX = element.offsetLeft;
        initialY = element.offsetTop;

        // Anclar con position:absolute y coordenadas en px para que el drag sea fluido y preciso
        element.style.position = 'absolute';
        element.style.left = `${initialX}px`;
        element.style.top = `${initialY}px`;
        element.style.right = 'auto';
        element.style.bottom = 'auto';
        element.style.margin = '0';
        element.style.transform = 'none';
        
        document.body.style.userSelect = 'none';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            hasMoved = true;
        }

        const parent = element.offsetParent || document.body;
        const maxX = parent.clientWidth - element.offsetWidth;
        const maxY = parent.clientHeight - element.offsetHeight;

        const newX = Math.max(0, Math.min(initialX + dx, maxX));
        const newY = Math.max(0, Math.min(initialY + dy, maxY));

        element.style.left = `${newX}px`;
        element.style.top = `${newY}px`;
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            handle.style.cursor = 'grab';
            document.body.style.userSelect = '';
            // Solo bloquear el click si realmente se arrastró
            if (hasMoved) preventNextClick = true;
        }
        hasMoved = false; // siempre resetear para que futuros clicks no queden bloqueados
    });
    
    handle.addEventListener('click', (e) => {
        if (preventNextClick) {
            preventNextClick = false; // consumir: solo bloquea UNA vez post-drag
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);
}



function checkElementOverlap(el1, el2, padding = 15) {
    if (!el1 || !el2 || el2.offsetParent === null) return false;
    const r1 = el1.getBoundingClientRect();
    const r2 = el2.getBoundingClientRect();
    
    const left1 = r1.left + padding;
    const right1 = r1.right - padding;
    const top1 = r1.top + padding;
    const bottom1 = r1.bottom - padding;
    
    const left2 = r2.left + padding;
    const right2 = r2.right - padding;
    const top2 = r2.top + padding;
    const bottom2 = r2.bottom - padding;
    
    return !(right1 < left2 || 
             left1 > right2 || 
             bottom1 < top2 || 
             top1 > bottom2);
}

function makeIconDraggable(element) {
    let isDragging = false;
    let startX, startY, initialX, initialY;
    let hasMoved = false;
    let isReverting = false;

    element.addEventListener('mousedown', (e) => {
        if (!state.freeRoam) return;
        if (isReverting) return;
        isDragging = true;
        hasMoved = false;
        startX = e.clientX;
        startY = e.clientY;
        
        if (window.getComputedStyle(element).position !== 'absolute') {
            const parent = element.parentElement;
            const parentRect = parent.getBoundingClientRect();
            const icons = Array.from(parent.querySelectorAll('.icon'));
            const rects = icons.map(icon => icon.getBoundingClientRect());
            
            icons.forEach((icon, i) => {
                icon.style.position = 'absolute';
                icon.style.left = `${rects[i].left - parentRect.left}px`;
                icon.style.top = `${rects[i].top - parentRect.top}px`;
                icon.style.margin = '0';
            });
        }
        
        initialX = element.offsetLeft;
        initialY = element.offsetTop;
        document.body.style.userSelect = 'none';
        element.style.zIndex = 10; // Mantener iconos siempre debajo de ventanas abiertas
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            hasMoved = true;
        }
        const parent = element.offsetParent || document.body;
        const maxX = parent.clientWidth - element.offsetWidth;
        const maxY = parent.clientHeight - element.offsetHeight;

        const newX = Math.max(0, Math.min(initialX + dx, maxX));
        const newY = Math.max(0, Math.min(initialY + dy, maxY));

        element.style.left = `${newX}px`;
        element.style.top = `${newY}px`;
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            document.body.style.userSelect = '';
            
            const otherIcons = Array.from(document.querySelectorAll('.desktop-icons .icon')).filter(icon => {
                return icon !== element && !icon.classList.contains('hidden') && icon.offsetParent !== null;
            });
            
            let overlaps = false;
            for (const other of otherIcons) {
                if (checkElementOverlap(element, other, 15)) {
                    overlaps = true;
                    break;
                }
            }
            
            if (!overlaps) {
                const rightSidebar = document.getElementById('right-sidebar');
                if (checkElementOverlap(element, rightSidebar, 5)) {
                    overlaps = true;
                }
            }
            
            if (!overlaps) {
                const taskbar = document.querySelector('.taskbar');
                if (checkElementOverlap(element, taskbar, 5)) {
                    overlaps = true;
                }
            }
            
            // Impedir que los iconos se superpongan sobre ventanas abiertas
            if (!overlaps) {
                const openWindows = Array.from(document.querySelectorAll('.os-window')).filter(w => {
                    return !w.classList.contains('hidden') && w.offsetParent !== null;
                });
                for (const win of openWindows) {
                    if (checkElementOverlap(element, win, 5)) {
                        overlaps = true;
                        break;
                    }
                }
            }
            
            // Impedir que los iconos se superpongan sobre el asistente WinHello
            if (!overlaps) {
                const winHelloEl = document.getElementById('winhello-assistant');
                if (winHelloEl && !winHelloEl.classList.contains('hidden') && winHelloEl.offsetParent !== null) {
                    if (checkElementOverlap(element, winHelloEl, 5)) {
                        overlaps = true;
                    }
                }
            }
            if (!overlaps) {
                const winHelloBubble = document.getElementById('winhello-bubble');
                if (winHelloBubble && !winHelloBubble.classList.contains('hidden') && winHelloBubble.offsetParent !== null) {
                    if (checkElementOverlap(element, winHelloBubble, 5)) {
                        overlaps = true;
                    }
                }
            }
            
            if (overlaps) {
                isReverting = true;
                element.style.transition = 'left 0.15s ease-out, top 0.15s ease-out';
                element.style.left = `${initialX}px`;
                element.style.top = `${initialY}px`;
                setTimeout(() => {
                    element.style.transition = '';
                    isReverting = false;
                }, 150);
            }
            
            // Restaurar z-index del icono a un valor bajo
            element.style.zIndex = '';
        }
    });
    
    element.addEventListener('click', (e) => {
        if (hasMoved || isReverting) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);
}

// Bindings when DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.os-window').forEach(win => {
        win.addEventListener('mousedown', () => bringToFront(win));
        makeDraggable(win, '.browser-header');
    });

    const storyWidget = document.getElementById('story-mission-widget');
    if (storyWidget) {
        storyWidget.addEventListener('mousedown', () => bringToFront(storyWidget));
        makeDraggable(storyWidget, '.story-widget-header');
    }

    document.querySelectorAll('.desktop-icons .icon').forEach(icon => {
        makeIconDraggable(icon);
    });
});

// Exportar globalmente
window.highestZIndex = highestZIndex;
window.bringToFront = bringToFront;
window.makeDraggable = makeDraggable;
window.checkElementOverlap = checkElementOverlap;
window.makeIconDraggable = makeIconDraggable;
