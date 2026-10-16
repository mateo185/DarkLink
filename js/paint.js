// ============================================================
//  DARKPAINT — Canvas drawing app for DarkLink (Modo Libre)
// ============================================================

(function () {
    'use strict';

    // ── State ────────────────────────────────────────────────
    let isDrawing = false;
    let tool = 'pencil';      // pencil | eraser | fill | rect | ellipse | line | eyedropper
    let primaryColor   = '#00ff66';
    let secondaryColor = '#000000';
    let lineWidth = 4;
    let startX = 0, startY = 0;
    let snapshot = null;      // ImageData for shape preview

    // ── Canvas refs (populated on init) ─────────────────────
    let canvas, ctx;

    // ── Color palette ───────────────────────────────────────
    const PALETTE = [
        '#000000','#1a1a1a','#333333','#555555','#888888','#bbbbbb','#dddddd','#ffffff',
        '#ff0000','#ff4400','#ff8800','#ffcc00','#ffff00','#aaff00',
        '#00ff66','#00ffcc','#00ccff','#0088ff','#0000ff','#6600ff',
        '#cc00ff','#ff00cc','#ff0066','#ff6699',
        '#003300','#002222','#000033','#1a0033','#330000','#1a1100',
    ];

    // ── Helpers ─────────────────────────────────────────────
    function getPos(e) {
        const r = canvas.getBoundingClientRect();
        const scaleX = canvas.width  / r.width;
        const scaleY = canvas.height / r.height;
        if (e.touches) {
            return {
                x: (e.touches[0].clientX - r.left) * scaleX,
                y: (e.touches[0].clientY - r.top)  * scaleY,
            };
        }
        return {
            x: (e.clientX - r.left) * scaleX,
            y: (e.clientY - r.top)  * scaleY,
        };
    }

    function hexToRgba(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b, 255];
    }

    function rgbaMatch(a, b) {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
    }

    // ── Flood fill (bucket) ──────────────────────────────────
    function floodFill(startX, startY, fillColor) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const idx  = (Math.round(startY) * canvas.width + Math.round(startX)) * 4;
        const targetColor = [data[idx], data[idx+1], data[idx+2], data[idx+3]];
        const fill = hexToRgba(fillColor);

        if (rgbaMatch(targetColor, fill)) return;

        const stack = [[Math.round(startX), Math.round(startY)]];
        const w = canvas.width, h = canvas.height;

        while (stack.length) {
            const [x, y] = stack.pop();
            if (x < 0 || x >= w || y < 0 || y >= h) continue;
            const i = (y * w + x) * 4;
            if (!rgbaMatch([data[i], data[i+1], data[i+2], data[i+3]], targetColor)) continue;
            data[i]   = fill[0];
            data[i+1] = fill[1];
            data[i+2] = fill[2];
            data[i+3] = fill[3];
            stack.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
        }
        ctx.putImageData(imageData, 0, 0);
    }

    // ── Eyedropper ───────────────────────────────────────────
    function pickColor(x, y, button) {
        const px = ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data;
        const hex = '#' + [px[0],px[1],px[2]].map(v => v.toString(16).padStart(2,'0')).join('');
        if (button !== 2) {
            primaryColor = hex;
            document.getElementById('paint-color-primary').style.background = hex;
            document.getElementById('paint-color-primary').value = hex;
        } else {
            secondaryColor = hex;
            document.getElementById('paint-color-secondary').style.background = hex;
            document.getElementById('paint-color-secondary').value = hex;
        }
    }

    // ── Drawing ──────────────────────────────────────────────
    function startDraw(e) {
        e.preventDefault();
        const {x, y} = getPos(e);
        isDrawing = true;
        startX = x; startY = y;
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const btn = e.button === 2 ? secondaryColor : primaryColor;

        if (tool === 'fill') {
            floodFill(x, y, btn);
            isDrawing = false;
            return;
        }
        if (tool === 'eyedropper') {
            pickColor(x, y, e.button);
            isDrawing = false;
            return;
        }

        ctx.beginPath();
        ctx.moveTo(x, y);

        if (tool === 'pencil' || tool === 'eraser') {
            ctx.strokeStyle = tool === 'eraser' ? secondaryColor : btn;
            ctx.lineWidth   = tool === 'eraser' ? lineWidth * 3 : lineWidth;
            ctx.lineCap     = 'round';
            ctx.lineJoin    = 'round';
        }
    }

    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const {x, y} = getPos(e);
        const btn = e.buttons === 2 ? secondaryColor : primaryColor;

        if (tool === 'pencil' || tool === 'eraser') {
            ctx.lineTo(x, y);
            ctx.stroke();
            return;
        }

        // Shape preview: restore snapshot then draw
        ctx.putImageData(snapshot, 0, 0);
        ctx.strokeStyle = btn;
        ctx.fillStyle   = btn + '33';
        ctx.lineWidth   = lineWidth;
        ctx.lineCap     = 'round';

        if (tool === 'rect') {
            ctx.beginPath();
            ctx.rect(startX, startY, x - startX, y - startY);
            ctx.fill();
            ctx.stroke();
        } else if (tool === 'ellipse') {
            ctx.beginPath();
            const rx = Math.abs(x - startX) / 2;
            const ry = Math.abs(y - startY) / 2;
            const cx = startX + (x - startX) / 2;
            const cy = startY + (y - startY) / 2;
            ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } else if (tool === 'line') {
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    }

    function stopDraw(e) {
        if (!isDrawing) return;
        isDrawing = false;
        snapshot = null;
        ctx.beginPath(); // reset path
    }

    // ── Save / Export ────────────────────────────────────────
    function saveImage() {
        const link = document.createElement('a');
        link.download = 'darkpaint_' + Date.now() + '.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    // ── Clear ────────────────────────────────────────────────
    function clearCanvas() {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // ── UI builder ───────────────────────────────────────────
    function buildPaletteHTML() {
        return PALETTE.map(c =>
            `<div class="paint-swatch" data-color="${c}" title="${c}"
                  style="background:${c};width:18px;height:18px;border:1px solid #333;cursor:pointer;flex-shrink:0;"
             ></div>`
        ).join('');
    }

    // ── Init ─────────────────────────────────────────────────
    window.initDarkPaint = function () {
        canvas = document.getElementById('paint-canvas');
        if (!canvas) return;
        ctx = canvas.getContext('2d');

        // Fill black background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Build palette
        const paletteEl = document.getElementById('paint-palette');
        if (paletteEl) paletteEl.innerHTML = buildPaletteHTML();

        // ── Palette clicks ───────────────────────────────────
        paletteEl && paletteEl.addEventListener('mousedown', (e) => {
            const swatch = e.target.closest('.paint-swatch');
            if (!swatch) return;
            if (e.button === 2) {
                secondaryColor = swatch.dataset.color;
                document.getElementById('paint-color-secondary').style.background = secondaryColor;
                document.getElementById('paint-color-secondary').value = secondaryColor;
            } else {
                primaryColor = swatch.dataset.color;
                document.getElementById('paint-color-primary').style.background = primaryColor;
                document.getElementById('paint-color-primary').value = primaryColor;
            }
        });

        paletteEl && paletteEl.addEventListener('contextmenu', e => e.preventDefault());

        // ── Color inputs ─────────────────────────────────────
        const pickerPrimary = document.getElementById('paint-color-primary');
        if (pickerPrimary) {
            pickerPrimary.value = primaryColor;
            pickerPrimary.style.background = primaryColor;
            pickerPrimary.addEventListener('input', () => {
                primaryColor = pickerPrimary.value;
                pickerPrimary.style.background = primaryColor;
            });
        }
        const pickerSecondary = document.getElementById('paint-color-secondary');
        if (pickerSecondary) {
            pickerSecondary.value = secondaryColor;
            pickerSecondary.style.background = secondaryColor;
            pickerSecondary.addEventListener('input', () => {
                secondaryColor = pickerSecondary.value;
                pickerSecondary.style.background = secondaryColor;
            });
        }

        // ── Tool buttons ─────────────────────────────────────
        document.querySelectorAll('.paint-tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                tool = btn.dataset.tool;
                document.querySelectorAll('.paint-tool-btn').forEach(b => b.classList.remove('paint-tool-active'));
                btn.classList.add('paint-tool-active');
                canvas.style.cursor = toolCursor(tool);
            });
        });

        // ── Size slider ──────────────────────────────────────
        const sizeSlider = document.getElementById('paint-size');
        const sizeLabel  = document.getElementById('paint-size-label');
        if (sizeSlider) {
            sizeSlider.value = lineWidth;
            sizeSlider.addEventListener('input', () => {
                lineWidth = parseInt(sizeSlider.value);
                if (sizeLabel) sizeLabel.innerText = lineWidth + 'px';
            });
        }

        // ── Action buttons ───────────────────────────────────
        const btnClear = document.getElementById('paint-btn-clear');
        if (btnClear) btnClear.addEventListener('click', clearCanvas);

        const btnSave = document.getElementById('paint-btn-save');
        if (btnSave) btnSave.addEventListener('click', saveImage);

        const btnWallpaper = document.getElementById('paint-btn-wallpaper');
        if (btnWallpaper) {
            btnWallpaper.addEventListener('click', () => {
                const dataUrl = canvas.toDataURL('image/png');
                const desktopEl = document.getElementById('screen-desktop');
                if (desktopEl) {
                    desktopEl.style.setProperty('background-image', `url(${dataUrl})`, 'important');
                    desktopEl.style.setProperty('background-size', 'cover', 'important');
                    desktopEl.style.setProperty('background-position', 'center', 'important');
                    desktopEl.style.setProperty('background-repeat', 'no-repeat', 'important');
                    
                    if (typeof showCustomAlert === 'function') {
                        const tFn = (typeof window.t === 'function') ? window.t : (k, fb) => fb;
                        showCustomAlert(tFn("paint_alert_wallpaper_title", "FONDO ESTABLECIDO"), tFn("paint_alert_wallpaper_msg", "El dibujo de DarkPaint se ha establecido como fondo de pantalla."), "success");
                    }
                }
            });
        }


        // ── Canvas mouse events ──────────────────────────────
        canvas.addEventListener('mousedown',  startDraw);
        canvas.addEventListener('mousemove',  draw);
        canvas.addEventListener('mouseup',    stopDraw);
        canvas.addEventListener('mouseleave', stopDraw);
        canvas.addEventListener('contextmenu', e => e.preventDefault());

        // Touch support
        canvas.addEventListener('touchstart',  startDraw, {passive: false});
        canvas.addEventListener('touchmove',   draw,      {passive: false});
        canvas.addEventListener('touchend',    stopDraw);

        // Default tool cursor
        canvas.style.cursor = toolCursor(tool);
    };

    function toolCursor(t) {
        switch(t) {
            case 'eraser':     return 'cell';
            case 'fill':       return 'crosshair';
            case 'eyedropper': return 'copy';
            default:           return 'crosshair';
        }
    }
})();
