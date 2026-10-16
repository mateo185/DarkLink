// --- SISTEMA DE DIÁLOGOS GLOBAL ---

let isTyping = false;
let currentFullText = "";

function queueDialogues(dialoguesArray) {
    state.dialogueQueue = state.dialogueQueue.concat(dialoguesArray);
    if (!state.isDialogueActive) {
        showNextDialogue();
    }
}

async function showNextDialogue() {
    const dialogueBox = document.getElementById('dialogue-box');
    const dialogueName = document.getElementById('dialogue-name');
    const dialogueText = document.getElementById('dialogue-text');
    
    if (!dialogueBox || !dialogueName || !dialogueText) return;

    if (state.dialogueQueue.length > 0) {
        state.isDialogueActive = true;
        const diag = state.dialogueQueue.shift();
        
        dialogueBox.classList.remove('hidden');
        
        let speakerName = diag.name === 'player' 
            ? (state.playerName || (typeof window.t === 'function' ? window.t('speaker_player', 'Player') : 'Player')) 
            : (diag.name === 'Sistema' 
                ? (typeof window.t === 'function' ? window.t('speaker_system', 'Sistema') : 'Sistema')
                : (diag.name === 'Hacker' 
                    ? (typeof window.t === 'function' ? window.t('speaker_hacker', 'Hacker') : 'Hacker')
                    : diag.name));
        dialogueName.innerText = speakerName;
        
        // Estilos según quien hable
        if (diag.name === 'player') {
            dialogueName.style.color = "var(--text-color)";
            dialogueBox.style.borderColor = "var(--border-color)";
            dialogueBox.style.boxShadow = "0 0 15px rgba(0, 255, 0, 0.3)";
        } else if (diag.name === 'Hacker') {
            dialogueName.style.color = "var(--danger-color)";
            dialogueBox.style.borderColor = "var(--danger-color)";
            dialogueBox.style.boxShadow = "var(--danger-glow)";
        } else {
            dialogueName.style.color = "var(--warning-color)";
            dialogueBox.style.borderColor = "var(--warning-color)";
            dialogueBox.style.boxShadow = "0 0 15px rgba(255, 204, 0, 0.3)";
        }
        
        isTyping = true;
        currentFullText = diag.text;
        dialogueText.innerHTML = '';
        
        for (let i = 0; i < currentFullText.length; i++) {
            if (!isTyping) break; // Si el jugador hizo clic para saltar la animacion
            dialogueText.innerHTML += currentFullText[i];
            
            if (i % 2 === 0 && typeof playTypeSound === 'function') playTypeSound(); // Sonido de tipeo máquina de escribir
            
            await new Promise(r => setTimeout(r, 20)); // Velocidad de escritura
        }
        
        isTyping = false;
        dialogueText.innerHTML = currentFullText; // Asegurar texto completo
        
        // Ejecutar evento si el diálogo tiene uno
        if (diag.event) {
            diag.event();
        }
        
    } else {
        // No hay más diálogos
        state.isDialogueActive = false;
        dialogueBox.classList.add('hidden');
    }
}

function skipAllDialogues() {
    if (!state.isDialogueActive) return;
    
    // Cortar animación actual si la hay
    isTyping = false;
    
    // Si la secuencia final (tutorial), y la saltan sin terminar de leer, lanzaremos la alerta.
    let pendingEvents = [];
    if (state.dialogueQueue.length > 0) {
        pendingEvents = state.dialogueQueue.filter(d => d.event).map(d => d.event);
    }
    
    // Vaciar cola
    state.dialogueQueue = [];
    state.isDialogueActive = false;
    
    const dialogueBox = document.getElementById('dialogue-box');
    if (dialogueBox) dialogueBox.classList.add('hidden');
    
    // Ejecutar eventos pendientes (ej. comenzar el survival)
    pendingEvents.forEach(evt => evt());
}

// Event bindings when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const dialogueBox = document.getElementById('dialogue-box');
    const btnSkipDialogue = document.getElementById('btn-skip-dialogue');

    if (dialogueBox) {
        dialogueBox.addEventListener('click', (e) => {
            if (e.target.id === 'btn-skip-dialogue') return;
            if (isTyping) {
                isTyping = false;
            } else {
                showNextDialogue();
            }
        });
    }

    if (btnSkipDialogue) {
        btnSkipDialogue.addEventListener('click', (e) => {
            e.stopPropagation();
            skipAllDialogues();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') skipAllDialogues();
    });
});

// Exportar globalmente
window.queueDialogues = queueDialogues;
window.showNextDialogue = showNextDialogue;
window.skipAllDialogues = skipAllDialogues;
