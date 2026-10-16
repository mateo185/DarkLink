// ============================================================
//  SYSTEM CAMERA APP — Take photos and record video (Modo Libre)
// ============================================================

(function() {
    'use strict';

    const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;

    let mediaRecorder = null;
    let recordedChunks = [];
    let isRecording = false;
    let gallery = []; // Array of { id, type: 'photo' | 'video', url, blob }

    const iconCamera = document.getElementById('icon-camera');
    const windowCamera = document.getElementById('window-camera');
    const btnMinCamera = document.getElementById('btn-min-camera');
    const btnCloseCamera = document.getElementById('btn-close-camera');
    
    const feedEl = document.getElementById('camera-app-feed');
    const recordingIndicator = document.getElementById('camera-recording-indicator');
    
    const btnPhoto = document.getElementById('btn-camera-photo');
    const btnRecord = document.getElementById('btn-camera-record');
    const galleryEl = document.getElementById('camera-gallery');

    // Bindings
    if (iconCamera) {
        iconCamera.addEventListener('click', async () => {
            if (!state.freeRoam) return;
            if (windowCamera) {
                windowCamera.classList.remove('hidden');
                if (typeof bringToFront === 'function') bringToFront(windowCamera);
                if (typeof addTaskbarTab === 'function') addTaskbarTab('camera', tFn('start_menu_camera', '📷 Cámara'));
                if (typeof playWindowOpenSound === 'function') playWindowOpenSound();
                
                // Start feed
                await initCameraFeed();
            }
        });
    }

    if (btnMinCamera) {
        btnMinCamera.addEventListener('click', () => {
            if (windowCamera) windowCamera.classList.add('hidden');
            if (typeof playWindowCloseSound === 'function') playWindowCloseSound();
        });
    }

    if (btnCloseCamera) {
        btnCloseCamera.addEventListener('click', () => {
            if (windowCamera) windowCamera.classList.add('hidden');
            if (typeof removeTaskbarTab === 'function') removeTaskbarTab('camera');
            if (typeof playWindowCloseSound === 'function') playWindowCloseSound();
            
            // Stop recording if active
            if (isRecording && mediaRecorder) {
                mediaRecorder.stop();
            }
        });
    }

    async function initCameraFeed() {
        if (!state.webcamStream) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                state.webcamStream = stream;
                
                // Sync with system webcam feed
                const sysFeed = document.getElementById('webcam-feed');
                if (sysFeed) sysFeed.srcObject = stream;
            } catch (err) {
                console.error("Error al iniciar cámara:", err);
                if (typeof showCustomAlert === 'function') {
                    showCustomAlert(tFn("camera_error_title", "ERROR CÁMARA"), tFn("camera_error_msg", "No se pudo activar el dispositivo de video."), "error");
                }
                return;
            }
        }
        
        if (feedEl && state.webcamStream) {
            feedEl.srcObject = state.webcamStream;
        }
    }

    // Capture photo
    if (btnPhoto) {
        btnPhoto.addEventListener('click', () => {
            if (!state.webcamStream || !feedEl) {
                if (typeof showCustomAlert === 'function') {
                    showCustomAlert(tFn("camera_inactive_title", "CÁMARA INACTIVA"), tFn("camera_inactive_photo_msg", "Inicia la cámara para capturar fotos."), "error");
                }
                return;
            }
            
            const canvas = document.createElement('canvas');
            canvas.width = feedEl.videoWidth || 640;
            canvas.height = feedEl.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(feedEl, 0, 0, canvas.width, canvas.height);
            
            try {
                const dataUrl = canvas.toDataURL('image/jpeg');
                addGalleryItem('photo', dataUrl);
                if (typeof playClickSound === 'function') playClickSound();
            } catch (err) {
                console.error("Error al capturar foto:", err);
            }
        });
    }

    // Record video
    if (btnRecord) {
        btnRecord.addEventListener('click', () => {
            if (!state.webcamStream) {
                if (typeof showCustomAlert === 'function') {
                    showCustomAlert(tFn("camera_inactive_title", "CÁMARA INACTIVA"), tFn("camera_inactive_record_msg", "Inicia la cámara para grabar."), "error");
                }
                return;
            }

            if (!isRecording) {
                // Start Recording
                recordedChunks = [];
                try {
                    let options = { mimeType: 'video/webm;codecs=vp9,opus' };
                    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                        options = { mimeType: 'video/webm;codecs=vp8,opus' };
                        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                            options = { mimeType: 'video/webm' };
                        }
                    }
                    
                    mediaRecorder = new MediaRecorder(state.webcamStream, options);
                    
                    mediaRecorder.ondataavailable = (e) => {
                        if (e.data && e.data.size > 0) {
                            recordedChunks.push(e.data);
                        }
                    };

                    mediaRecorder.onstop = () => {
                        const blob = new Blob(recordedChunks, { type: 'video/webm' });
                        const videoUrl = URL.createObjectURL(blob);
                        addGalleryItem('video', videoUrl, blob);
                    };

                    mediaRecorder.start();
                    isRecording = true;
                    btnRecord.innerText = tFn("camera_btn_stop", "⏹ DETENER");
                    btnRecord.style.borderColor = "red";
                    btnRecord.style.color = "red";
                    if (recordingIndicator) recordingIndicator.style.display = "flex";
                } catch (err) {
                    console.error("Error starting MediaRecorder:", err);
                }
            } else {
                // Stop Recording
                if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                    mediaRecorder.stop();
                }
                isRecording = false;
                btnRecord.innerText = tFn("camera_btn_record", "🎥 GRABAR VIDEO");
                btnRecord.style.borderColor = "#ff9900";
                btnRecord.style.color = "#ff9900";
                if (recordingIndicator) recordingIndicator.style.display = "none";
            }
        });
    }

    function addGalleryItem(type, url, blob = null) {
        const item = {
            id: Date.now(),
            type,
            url,
            blob
        };
        gallery.unshift(item);
        renderGallery();
    }

    function renderGallery() {
        if (!galleryEl) return;
        galleryEl.innerHTML = '';

        if (gallery.length === 0) {
            galleryEl.innerHTML = `<p style="color: #666; font-size: 0.85rem; font-family: monospace; grid-column: span 2; text-align: center; margin-top: 20px;" data-i18n="camera_gallery_empty">${tFn("camera_gallery_empty", "Galería vacía")}</p>`;
            return;
        }

        gallery.forEach(item => {
            const card = document.createElement('div');
            card.style.background = '#0a0a0a';
            card.style.border = '1px solid #00ff6633';
            card.style.position = 'relative';
            card.style.padding = '4px';
            card.style.borderRadius = '4px';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.alignItems = 'center';
            card.style.justifyContent = 'space-between';
            card.style.height = '100px';
            card.style.overflow = 'hidden';

            let previewHTML = '';
            if (item.type === 'photo') {
                previewHTML = `<img src="${item.url}" style="width: 100%; height: 70px; object-fit: cover; border-radius: 2px;">`;
            } else {
                previewHTML = `
                    <div style="width: 100%; height: 70px; background: #201000; border-radius: 2px; display: flex; align-items: center; justify-content: center; position: relative;">
                        <span style="font-size: 1.5rem;">🎞️</span>
                        <span style="position: absolute; font-size: 0.8rem; color: #ff9900; bottom: 2px; right: 4px; font-weight: bold; font-family: monospace;">VID</span>
                    </div>
                `;
            }

            card.innerHTML = `
                ${previewHTML}
                <div style="display:flex; width: 100%; justify-content: space-around; padding-top: 4px; border-top: 1px solid #222; margin-top: auto;">
                    <a href="${item.url}" download="${item.type === 'photo' ? 'photo_' : 'video_'}${item.id}.${item.type === 'photo' ? 'jpg' : 'webm'}" title="${tFn('camera_download_title', 'Descargar')}" style="color: #00ff66; text-decoration: none; font-size: 0.85rem;">💾</a>
                    <span class="delete-btn" style="color: #ff3333; cursor: pointer; font-size: 0.85rem;" title="${tFn('camera_delete_title', 'Eliminar')}">🗑️</span>
                </div>
            `;

            const delBtn = card.querySelector('.delete-btn');
            if (delBtn) {
                delBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    gallery = gallery.filter(g => g.id !== item.id);
                    renderGallery();
                    if (typeof playClickSound === 'function') playClickSound();
                });
            }

            card.addEventListener('click', () => {
                showPreviewOverlay(item);
            });

            galleryEl.appendChild(card);
        });
    }

    function showPreviewOverlay(item) {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(0,0,0,0.9)';
        overlay.style.zIndex = '10010';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.padding = '20px';
        overlay.style.boxSizing = 'border-box';

        let mediaHTML = '';
        if (item.type === 'photo') {
            mediaHTML = `<img src="${item.url}" style="max-width: 90%; max-height: 80%; object-fit: contain; border: 2px solid #00ff66; border-radius: 4px;">`;
        } else {
            mediaHTML = `<video src="${item.url}" controls autoplay style="max-width: 90%; max-height: 80%; border: 2px solid #ff9900; border-radius: 4px;"></video>`;
        }

        overlay.innerHTML = `
            <div style="width: 100%; display: flex; justify-content: flex-end; max-width: 90%; margin-bottom: 10px;">
                <button class="terminal-btn" id="preview-close-btn" style="border-color: #ff3333; color: #ff3333; padding: 6px 15px; font-size: 1rem; cursor: pointer; font-family: monospace;">${tFn('camera_close_preview', 'X CERRAR')}</button>
            </div>
            ${mediaHTML}
        `;

        document.body.appendChild(overlay);

        const closeBtn = overlay.querySelector('#preview-close-btn');
        closeBtn.addEventListener('click', () => {
            overlay.remove();
            if (typeof playClickSound === 'function') playClickSound();
        });
    }

})();
