/**
 * APP.JS - LEAGUE OF LEGENDS: DÚO BOT 7 MESES (CAMUS & LYRA)
 * 
 * CORRECCIONES ESTRICTAS:
 * 1. Dirección matemática correcta: la imagen base mira a la izquierda.
 *    dx > 0 (derecha) => transform: scaleX(-1) para mirar a la derecha.
 *    dx < 0 (izquierda) => transform: scaleX(1) para mirar a la izquierda.
 * 2. Reubicación del Nexo (Nivel 7) a x: 86%, y: 44% (centro-derecha, 100% libre de HUD).
 *    Sendero sinuoso y largo cruzando el mapa de extremo a extremo.
 *    Nexo real y detallado (plataforma circular de piedra, pilares y cristal 3D facetado).
 * 3. Prohibido window.alert(): reemplazado por #finalLockModal personalizado Hextech.
 * 4. Cero confeti: eliminado todo rastro de confetti canvas.
 *    Final con ilustración del beso romántico de Camus & Lyra y texto de amor eterno.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'lol_anniversary_data_v7';
  const CHESTS_STORAGE_KEY = 'lol_anniversary_opened_v7';

  let currentConfig = loadSavedConfig();
  let openedChests = loadOpenedChests();
  let soundEnabled = true;
  const bgMusic = null;

  // =========================================================================
  // REGLA 2: RECORRIDO LARGO Y REUBICACIÓN DEL NEXO (NIVEL 7 A x: 86%, y: 44%)
  // Área 100% limpia sin chocar con los botones del HUD superior
  // =========================================================================
    const WAYPOINTS = [
    { level: 0, x: 39.0, y: 94.0, name: 'Base Aliada' },
    { level: 1, x: 45.0, y: 80.0, name: 'Nivel 1 â€¢ Entrada a la Grieta' },
    { level: 2, x: 31.0, y: 73.0, name: 'Nivel 2 â€¢ Altar de la Ribera' },
    { level: 3, x: 44.0, y: 8.0,  name: 'Nivel 3 â€¢ Claro del RÃ­o Superior' },
    { level: 4, x: 54.0, y: 56.0, name: 'Nivel 4 â€¢ Cruce Central' },
    { level: 5, x: 85.0, y: 84.0, name: 'Nivel 5 â€¢ Sendero Arcano' },
    { level: 6, x: 82.0, y: 54.0, name: 'Nivel 6 â€¢ Antorcha de la Jungla' },
    { level: 7, x: 74.0, y: 18.0, name: 'Nivel 7 â€¢ El Gran Nexo' }
  ];

  // SUB-WAYPOINTS INTERMEDIOS PARA SEGUIR EXCLUSIVAMENTE LOS SENDEROS DE TIERRA Y PIEDRA
  // (Sin atravesar Ã¡rboles, muros, piedras ni el rÃ­o)
  const LEG_SUB_WAYPOINTS = {
    1: [
      { x: 45.0, y: 80.0 }
    ],
    2: [
      { x: 40.0, y: 75.0 },
      { x: 31.0, y: 73.0 }
    ],
    3: [
      { x: 27.0, y: 62.0 },
      { x: 26.0, y: 46.0 },
      { x: 28.0, y: 32.0 },
      { x: 34.0, y: 20.0 },
      { x: 44.0, y: 8.0 }
    ],
    4: [
      { x: 48.0, y: 16.0 },
      { x: 55.0, y: 28.0 },
      { x: 56.0, y: 42.0 },
      { x: 54.0, y: 56.0 }
    ],
    5: [
      { x: 65.0, y: 50.0 },
      { x: 76.0, y: 52.0 },
      { x: 84.0, y: 56.0 },
      { x: 87.0, y: 70.0 },
      { x: 85.0, y: 84.0 }
    ],
    6: [
      { x: 87.0, y: 70.0 },
      { x: 82.0, y: 54.0 }
    ],
    7: [
      { x: 72.0, y: 48.0 },
      { x: 64.0, y: 40.0 },
      { x: 65.0, y: 28.0 },
      { x: 74.0, y: 18.0 }
    ]
  };

  // Dimensiones panorÃ¡micas reales del mundo de la Grieta
  const WORLD_WIDTH = 2752;
  const WORLD_HEIGHT = 1536;
  const WALK_SPEED_PX_S = 280;
  const PAWN_CHEST_OFFSET_Y = 12; // px de separaciÃ³n frente al cofre

  let currentWaypointIndex = 0;
  let targetChestIndex = 1;
  let isWalking = false;

  // Estado de Vida y Nivel (100 HP a 700 HP / 777 HP)
  let currentHp = 100;
  const maxNormalHp = 700;
  let currentLevel = 1;

  function loadSavedConfig() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    const def = JSON.parse(JSON.stringify(ANNIVERSARY_CONFIG));
    if (!def.pareja.el.nombre || def.pareja.el.nombre === 'Mi Amor') def.pareja.el.nombre = 'CAMUS';
    if (!def.pareja.ella.nombre || def.pareja.ella.nombre === 'Mi Princesa') def.pareja.ella.nombre = 'LYRA';
    return def;
  }

  function saveCustomConfig(newConfig) {
    currentConfig = newConfig;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentConfig));
    } catch (e) {}
    applyConfigToDOM();
  }

  function loadOpenedChests() {
    try {
      const saved = localStorage.getItem(CHESTS_STORAGE_KEY);
      if (saved) return new Set(JSON.parse(saved));
    } catch (e) {}
    return new Set();
  }

  function saveOpenedChests() {
    try {
      localStorage.setItem(CHESTS_STORAGE_KEY, JSON.stringify(Array.from(openedChests)));
    } catch (e) {}
    updateCounterDisplay();
  }

  // =========================================================================
  // SISTEMA DE AUDIO PROCEDURAL (WEB AUDIO API)
  // =========================================================================
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playMatchFoundSound() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const freqs = [196, 293.66, 392, 587.33];
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3 / (i + 1), ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.85);
      });
    } catch (e) {}
  }

  function playHextechClickSound() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(820, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (e) {}
  }

  function playStepSound() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(230 + Math.random() * 45, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch (e) {}
  }

  function playChestOpenSound() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const oscLock = ctx.createOscillator();
      const gainLock = ctx.createGain();
      oscLock.type = 'square';
      oscLock.frequency.setValueAtTime(180, ctx.currentTime);
      oscLock.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.15);
      gainLock.gain.setValueAtTime(0.24, ctx.currentTime);
      gainLock.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      oscLock.connect(gainLock);
      gainLock.connect(ctx.destination);
      oscLock.start();
      oscLock.stop(ctx.currentTime + 0.16);

      const notes = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + 0.1 + (index * 0.07);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.48);
      });
    } catch (e) {}
  }

  function playNexusExplosionSound() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.8);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.85);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.6);
      gain2.gain.setValueAtTime(0.25, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start();
      osc2.stop(ctx.currentTime + 0.65);
    } catch (e) {}
  }

  function playVictoryFanfareSound() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const fanfareChords = [
        { time: 0.0, freqs: [392.00, 523.25, 659.25], dur: 0.25 },
        { time: 0.28, freqs: [440.00, 587.33, 698.46], dur: 0.25 },
        { time: 0.56, freqs: [523.25, 659.25, 783.99], dur: 0.35 },
        { time: 0.95, freqs: [523.25, 659.25, 1046.50], dur: 1.3 }
      ];
      fanfareChords.forEach(chord => {
        chord.freqs.forEach(freq => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = ctx.currentTime + chord.time;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(0.28, startTime + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + chord.dur);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + chord.dur + 0.05);
        });
      });
    } catch (e) {}
  }

  function playAbilitySound(spell) {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      if (spell === 'Q') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1046, ctx.currentTime + 0.22);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      } else if (spell === 'W') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(330, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.22, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      } else if (spell === 'E') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      }
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.32);
    } catch (e) {}
  }

  // =========================================================================
  // CAPA DE CLIC DE CAMINO DE LOL
  // =========================================================================
  const clickIndicatorLayer = document.getElementById('clickIndicatorLayer');
  function spawnClickIndicator(xPercent, yPercent) {
    if (!clickIndicatorLayer) return;
    const ping = document.createElement('div');
    ping.className = 'move-click-ping';
    ping.style.left = `${xPercent}%`;
    ping.style.top = `${yPercent}%`;
    clickIndicatorLayer.appendChild(ping);

    setTimeout(() => {
      if (ping.parentNode) ping.parentNode.removeChild(ping);
    }, 650);
  }

  // =========================================================================
  // REGLA 2: RENDERIZADO DE LOS 6 COFRES Y EL GRAN NEXO REAL (NIVEL 7)
  // =========================================================================
  const chestsInteractiveLayer = document.getElementById('chestsInteractiveLayer');
  const duoChampionsPawn = document.getElementById('duoChampionsPawn');
  const championsSpriteContainer = document.getElementById('championsSpriteContainer');
  const barChestsCount = document.getElementById('barChestsCount');

  const overheadLevelCircle = document.getElementById('overheadLevelCircle');
  const overheadHpFill = document.getElementById('overheadHpFill');
  const overheadHealLayer = document.getElementById('overheadHealLayer');
  const hudHpBarFill = document.getElementById('hudHpBarFill');
  const hudHpBarText = document.getElementById('hudHpBarText');
  const hudLevelBadge = document.getElementById('hudLevelBadge');
  const spellFxLayer = document.getElementById('spellFxLayer');
  const riftViewport = document.getElementById('riftViewport');

  function updateCounterDisplay() {
    if (barChestsCount) {
      barChestsCount.textContent = `${openedChests.size} / 7`;
    }
  }

  function renderMapNodes() {
    if (!chestsInteractiveLayer) return;
    chestsInteractiveLayer.innerHTML = '';

    for (let level = 1; level <= 7; level++) {
      const wp = WAYPOINTS[level];
      if (!wp) continue;

      const isUnlocked = openedChests.has(level);
      const isNextTarget = (level === targetChestIndex);
      const isNexus = (level === 7);

      if (!isNexus) {
        // NIVELES 1 AL 6: COFRES HEXTECH 3D REALES
        const chestNode = document.createElement('div');
        chestNode.className = `real-hextech-chest-node ${isUnlocked ? 'unlocked' : ''} ${isNextTarget ? 'active-target' : ''}`;
        chestNode.style.left = `${wp.x}%`;
        chestNode.style.top = `${wp.y}%`;
        chestNode.id = `mapNode-${level}`;

        chestNode.innerHTML = `
          <div class="target-glow-beacon"></div>
          <div class="plaque-tag-rift">NIVEL ${level}</div>
          <div class="chest-hover-pod">
            <div class="chest-floor-rune-glow"></div>
            <div class="chest-floating-sprite-wrap">
              <img src="./assets/hextech_chest_closed.png" alt="Cofre Cerrado" class="chest-actual-img img-closed">
              <img src="./assets/hextech_chest_open.png" alt="Cofre Abierto" class="chest-actual-img img-open">
            </div>
          </div>
        `;

        chestNode.addEventListener('click', (e) => {
          e.stopPropagation();
          walkToLevel(level);
        });

        chestsInteractiveLayer.appendChild(chestNode);
      } else {
        // NIVEL 7: EL GRAN NEXO REAL DE LEAGUE OF LEGENDS
        const nexusNode = document.createElement('div');
        nexusNode.className = `real-nexus-node ${isUnlocked ? 'unlocked' : ''} ${isNextTarget ? 'active-target' : ''}`;
        nexusNode.style.left = `${wp.x}%`;
        nexusNode.style.top = `${wp.y}%`;
        nexusNode.id = `mapNode-7`;

        nexusNode.innerHTML = `
          <div class="nexus-plaque-tag">👑 EL GRAN NEXO (NIVEL 7)</div>
          <div class="nexus-dais-assembly">
            <!-- Plataforma rúnica de piedra escalonada -->
            <div class="nexus-floor-platform"></div>
            <!-- Anillo rúnico giratorio de energía -->
            <div class="nexus-spinning-runes"></div>
            
            <!-- Cristal Central de Nexo 3D Detallado -->
            <div class="nexus-floating-crystal">
              <svg viewBox="0 0 120 140" class="nexus-crystal-svg">
                <defs>
                  <linearGradient id="nexusSpireCore" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ffffff"/>
                    <stop offset="20%" stop-color="#00f7ff"/>
                    <stop offset="50%" stop-color="#ff4081"/>
                    <stop offset="80%" stop-color="#7c4dff"/>
                    <stop offset="100%" stop-color="#2a0845"/>
                  </linearGradient>
                  <linearGradient id="nexusGoldTrim" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#ffd700"/>
                    <stop offset="50%" stop-color="#fff8d1"/>
                    <stop offset="100%" stop-color="#c8aa6e"/>
                  </linearGradient>
                  <linearGradient id="nexusGlassFacet" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
                    <stop offset="50%" stop-color="#00f7ff" stop-opacity="0.4"/>
                    <stop offset="100%" stop-color="#ff4081" stop-opacity="0.1"/>
                  </linearGradient>
                  <filter id="nexusGlow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                <!-- 4 Pilares / Garras Doradas de la base apuntando al cristal -->
                <polygon points="12,120 28,100 24,128 10,132" fill="url(#nexusGoldTrim)"/>
                <polygon points="108,120 92,100 96,128 110,132" fill="url(#nexusGoldTrim)"/>
                <polygon points="60,138 52,118 68,118" fill="url(#nexusGoldTrim)"/>

                <!-- Cristal Central Hextech Facetado (Spire) -->
                <polygon points="60,6 98,42 82,118 38,118 22,42" fill="url(#nexusSpireCore)" stroke="url(#nexusGoldTrim)" stroke-width="2.5" filter="url(#nexusGlow)"/>
                
                <!-- Faceta Superior Frontal -->
                <polygon points="60,18 84,46 60,98 36,46" fill="url(#nexusGlassFacet)"/>
                
                <!-- Faceta Lateral Izquierda -->
                <polygon points="60,6 22,42 36,46 60,18" fill="#00e5ff" opacity="0.6"/>
                
                <!-- Faceta Lateral Derecha -->
                <polygon points="60,6 98,42 84,46 60,18" fill="#ff4081" opacity="0.6"/>
                
                <!-- Diamante Núcleo Mágico Interno -->
                <polygon points="60,42 72,58 60,74 48,58" fill="#ffffff" stroke="#00f7ff" stroke-width="1.5"/>

                <!-- Cristales Satélites Flotantes -->
                <polygon points="10,50 18,62 10,74 2,62" fill="#00f7ff" stroke="#fff" stroke-width="1"/>
                <polygon points="110,50 118,62 110,74 102,62" fill="#ff4081" stroke="#fff" stroke-width="1"/>
              </svg>
            </div>
          </div>
        `;

        nexusNode.addEventListener('click', (e) => {
          e.stopPropagation();
          walkToLevel(7);
        });

        chestsInteractiveLayer.appendChild(nexusNode);
      }
    }

    renderMinimap();
  }

  // =========================================================================
  // MINIMAPA
  // =========================================================================
  const minimapNodesLayer = document.getElementById('minimapNodesLayer');
  const minimapPlayerDot = document.getElementById('minimapPlayerDot');

  function renderMinimap() {
    if (!minimapNodesLayer) return;
    minimapNodesLayer.innerHTML = '';

    for (let i = 1; i <= 7; i++) {
      const wp = WAYPOINTS[i];
      if (!wp) continue;

      const isUnlocked = openedChests.has(i);
      const isNextTarget = (i === targetChestIndex);

      const dot = document.createElement('div');
      dot.className = `minimap-dot ${isNextTarget ? 'active' : ''} ${isUnlocked ? 'unlocked' : ''}`;
      dot.style.left = `${wp.x}%`;
      dot.style.top = `${wp.y}%`;
      dot.title = (i === 7) ? 'Gran Nexo' : `Nivel ${i}`;
      minimapNodesLayer.appendChild(dot);
    }

    updateMinimapPlayerPosition(currentWaypointIndex);
  }

  function updateMinimapPlayerPosition(wpIndex) {
    const wp = WAYPOINTS[wpIndex];
    if (minimapPlayerDot && wp) {
      minimapPlayerDot.style.left = `${wp.x}%`;
      minimapPlayerDot.style.top = `${wp.y}%`;
    }
  }

  // ---- Mundo 3D: suelo en mosaico, cámara y brújula ----
  const riftWorld = document.getElementById('riftWorld');
  const riftGround = document.getElementById('riftGround');
  const targetCompass = document.getElementById('targetCompass');
  const compassLabel = document.getElementById('compassLabel');

  function worldSize() {
    return { w: WORLD_VW * window.innerWidth, h: WORLD_VH * window.innerHeight };
  }

  function buildGround() {
    if (!riftGround) return;
    riftGround.innerHTML = '';
    const cls = ['fn', 'fx', 'fy', 'fxy'];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 6; c++) {
        const t = document.createElement('div');
        t.className = 'gt ' + cls[(r % 2) * 2 + (c % 2)];
        riftGround.appendChild(t);
      }
    }
  }

  // La cámara mueve el mundo para que los campeones queden siempre en el centro
  // =========================================================================
  // REGLA 1: CÃMARA LIBRE + PAN / DRAG CON MOUSE Y TOUCH
  // =========================================================================
  let camX = 0, camY = 0;

  function clampCam(x, y) {
    const vw = window.innerWidth, vh = window.innerHeight;
    return [
      Math.max(0, Math.min(Math.max(0, WORLD_WIDTH - vw), x)),
      Math.max(0, Math.min(Math.max(0, WORLD_HEIGHT - vh), y))
    ];
  }

  function applyCam(durationMs, ease = 'linear') {
    if (!riftWorld) return;
    riftWorld.style.transition = durationMs ? `transform ${durationMs / 1000}s ${ease}` : 'none';
    riftWorld.style.transform = `translate3d(${-camX}px, ${-camY}px, 0)`;
  }

  function setCamera(wp, durationMs, ease = 'linear') {
    if (!riftWorld || !wp) return;
    const px = (wp.x / 100) * WORLD_WIDTH;
    const py = (wp.y / 100) * WORLD_HEIGHT + PAWN_CHEST_OFFSET_Y;
    const vw = window.innerWidth, vh = window.innerHeight;
    [camX, camY] = clampCam(px - vw / 2, py - vh / 2);
    applyCam(durationMs, ease);
  }

  // PAN / DRAG: Arrastrar libremente el mapa con mouse o dedo en celular
  (function initPan() {
    const vp = document.getElementById('riftViewport');
    if (!vp) return;
    let isDown = false;
    let hasDragged = false;
    let startX = 0, startY = 0;
    let startCamX = 0, startCamY = 0;

    const startDrag = (clientX, clientY) => {
      if (isWalking) return;
      isDown = true;
      hasDragged = false;
      startX = clientX;
      startY = clientY;
      startCamX = camX;
      startCamY = camY;
    };

    const moveDrag = (clientX, clientY) => {
      if (!isDown || isWalking) return;
      const dx = clientX - startX;
      const dy = clientY - startY;
      if (!hasDragged && Math.hypot(dx, dy) < 6) return;
      hasDragged = true;
      vp.classList.add('dragging');
      [camX, camY] = clampCam(startCamX - dx, startCamY - dy);
      applyCam(0);
    };

    const endDrag = () => {
      if (!isDown) return;
      isDown = false;
      vp.classList.remove('dragging');
      setTimeout(() => { hasDragged = false; }, 60);
    };

    vp.addEventListener('mousedown', e => {
      if (e.button === 0) startDrag(e.clientX, e.clientY);
    });
    window.addEventListener('mousemove', e => moveDrag(e.clientX, e.clientY));
    window.addEventListener('mouseup', endDrag);

    vp.addEventListener('touchstart', e => {
      if (e.touches.length === 1) {
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchmove', e => {
      if (isDown && e.touches.length === 1) {
        moveDrag(e.touches[0].clientX, e.touches[0].clientY);
        if (hasDragged && e.cancelable) e.preventDefault();
      }
    }, { passive: false });

    window.addEventListener('touchend', endDrag);

    vp.addEventListener('click', e => {
      if (hasDragged) {
        e.stopPropagation();
        e.preventDefault();
      }
    }, true);
  })();

  // =========================================================================
  // REGLA 4: EASTER EGGS (5 FOTOS SECRETAS EN LOS ARBUSTOS)
  // =========================================================================
  const FOTOS_SECRETAS = (typeof ANNIVERSARY_CONFIG !== 'undefined' && ANNIVERSARY_CONFIG.fotosSecretas) || [
    { x: 18.0, y: 52.0, imagen_url: './assets/couple_chibi_red.jpg',      pie_de_foto: 'Nuestro primer mes juntos ðŸ’•' },
    { x: 41.0, y: 32.0, imagen_url: './assets/avatar_girl.jpg',           pie_de_foto: 'Mi Lyra, mi persona favorita âœ¨' },
    { x: 67.0, y: 74.0, imagen_url: './assets/avatar_boy_red.jpg',        pie_de_foto: 'Camus, mi compaÃ±ero de partida ðŸ›¡ï¸' },
    { x: 92.0, y: 40.0, imagen_url: './assets/couple_chibi_kiss_red.jpg', pie_de_foto: 'Un beso en cada temporada ðŸ˜˜' },
    { x: 57.0, y: 12.0, imagen_url: './assets/walking_couple.png',        pie_de_foto: 'Siempre caminando de la mano ðŸŒ¿' }
  ];

  function renderSecretSparks() {
    const layer = document.getElementById('secretSparksLayer');
    const modal = document.getElementById('secretPhotoModal');
    const img = document.getElementById('secretPhotoImg');
    const cap = document.getElementById('secretPhotoCaption');
    const closeBtn = document.getElementById('secretPhotoClose');

    if (!layer || !modal) return;
    layer.innerHTML = '';

    const closeModal = () => modal.classList.remove('open');
    if (closeBtn) closeBtn.onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };

    FOTOS_SECRETAS.forEach((foto, i) => {
      const spark = document.createElement('div');
      spark.className = 'secret-spark';
      spark.style.left = `${foto.x}%`;
      spark.style.top = `${foto.y}%`;
      spark.style.animationDelay = `${i * 0.45}s`;
      spark.title = 'âœ¨ Recuerdo secreto';

      spark.addEventListener('click', (e) => {
        e.stopPropagation();
        if (img) img.src = foto.imagen_url;
        if (cap) cap.textContent = foto.pie_de_foto;
        modal.classList.add('open');
        try { playHextechClickSound(); } catch (err) {}
      });

      layer.appendChild(spark);
    });
  }

  window.addEventListener('resize', () => {
    const wp = WAYPOINTS[currentWaypointIndex];
    setCamera(wp, 0);
  });
    function setChampionsPosition(wpIndex) {
    const wp = WAYPOINTS[wpIndex];
    if (duoChampionsPawn && wp) {
      duoChampionsPawn.style.transition = 'none';
      duoChampionsPawn.style.left = `${wp.x}%`;
      duoChampionsPawn.style.top = `calc(${wp.y}% + ${PAWN_CHEST_OFFSET_Y}px)`;
      updateMinimapPlayerPosition(wpIndex);
      setCamera(wp, 0);
    }
    if (championsSpriteContainer) {
      championsSpriteContainer.style.transform = 'scaleX(-1)';
    }
  }

  // =========================================================================
  // REGLA 1: DIRECCIÓN MATEMÁTICA Y ANIMACIÓN REAL DE CAMINATA
  // =========================================================================
    // =========================================================================
  // REGLA 2: RUTA NATURAL CON WAYPOINTS OCULTOS POR SENDEROS DE TIERRA Y PIEDRA
  // =========================================================================
  function walkToLevel(targetLevel) {
    if (isWalking) return;
    targetLevel = Math.max(1, Math.min(7, targetLevel));

    if (targetLevel === currentWaypointIndex) {
      triggerNodeInteraction(targetLevel);
      return;
    }

    isWalking = true;
    const finalWp = WAYPOINTS[targetLevel];
    spawnClickIndicator(finalWp.x, finalWp.y);
    playHextechClickSound();

    // Obtener los sub-puntos a recorrer para esta etapa
    let subPts = LEG_SUB_WAYPOINTS[targetLevel];
    if (!subPts || subPts.length === 0) {
      subPts = [{ x: finalWp.x, y: finalWp.y }];
    }

    let currentPos = WAYPOINTS[currentWaypointIndex];
    let ptIndex = 0;

    // Sonido continuo de pasos
    playStepSound();
    const stepInterval = setInterval(() => {
      if (isWalking) playStepSound();
      else clearInterval(stepInterval);
    }, 220);

    if (duoChampionsPawn) {
      duoChampionsPawn.classList.add('walking-motion-active');
      duoChampionsPawn.classList.remove('opening-chest-gesture');
    }

    function moveToNextSubPoint() {
      if (ptIndex >= subPts.length) {
        // Fin del recorrido hacia este cofre
        isWalking = false;
        clearInterval(stepInterval);
        currentWaypointIndex = targetLevel;
        updateMinimapPlayerPosition(targetLevel);

        if (duoChampionsPawn) {
          duoChampionsPawn.classList.remove('walking-motion-active');
        }

        // REGLA 3: INTERACCIÃ“N FÃSICA CON EL COFRE
        triggerNodeInteraction(targetLevel);
        return;
      }

      const nextPt = subPts[ptIndex];
      const isLast = (ptIndex === subPts.length - 1);
      ptIndex++;

      // OrientaciÃ³n segÃºn dx
      const dx = nextPt.x - currentPos.x;
      if (championsSpriteContainer && Math.abs(dx) > 0.05) {
        championsSpriteContainer.style.transform = (dx > 0) ? 'scaleX(-1)' : 'scaleX(1)';
      }

      // Distancia en pÃ­xeles sobre el mundo panorÃ¡mico
      const distPx = Math.hypot(
        ((nextPt.x - currentPos.x) / 100) * WORLD_WIDTH,
        ((nextPt.y - currentPos.y) / 100) * WORLD_HEIGHT
      );
      const segDurationMs = Math.max(380, Math.round((distPx / WALK_SPEED_PX_S) * 1000));

      // Mover el peÃ³n
      if (duoChampionsPawn) {
        duoChampionsPawn.style.transition = `left ${segDurationMs / 1000}s linear, top ${segDurationMs / 1000}s linear`;
        duoChampionsPawn.style.left = `${nextPt.x}%`;
        const offsetY = isLast ? PAWN_CHEST_OFFSET_Y : 0;
        duoChampionsPawn.style.top = `calc(${nextPt.y}% + ${offsetY}px)`;
      }

      // CÃ¡mara sigue al peÃ³n suavemente
      setCamera(nextPt, segDurationMs);

      currentPos = nextPt;
      setTimeout(moveToNextSubPoint, segDurationMs);
    }

    moveToNextSubPoint();
  }

  // =========================================================================
  // MECÁNICA DE CURACIÓN (+100 HP) Y ESTADÍSTICAS
  // =========================================================================
  function applyHealing(level) {
    if (level >= 1 && level <= 6) {
      currentHp = Math.min(maxNormalHp, level * 100 + 100);
      currentLevel = Math.min(7, level + 1);

      spawnFloatingHealText('+100 HP', false);

      if (overheadLevelCircle) {
        overheadLevelCircle.classList.remove('level-up-flash');
        void overheadLevelCircle.offsetWidth;
        overheadLevelCircle.classList.add('level-up-flash');
        overheadLevelCircle.textContent = currentLevel;
      }
      if (hudLevelBadge) hudLevelBadge.textContent = currentLevel;

      const pct = (currentHp / maxNormalHp) * 100;
      if (overheadHpFill) overheadHpFill.style.width = `${pct}%`;
      if (hudHpBarFill) hudHpBarFill.style.width = `${pct}%`;
      if (hudHpBarText) hudHpBarText.textContent = `VIDA: ${currentHp} / 700 HP`;
    } else if (level === 7) {
      currentHp = 777;
      currentLevel = 7;

      spawnFloatingHealText('+VIDA MÁXIMA ALCANZADA (777 HP)', true);

      if (overheadLevelCircle) {
        overheadLevelCircle.classList.add('level-up-flash');
        overheadLevelCircle.textContent = '7';
      }
      if (hudLevelBadge) hudLevelBadge.textContent = '7';

      if (overheadHpFill) overheadHpFill.style.width = '100%';
      if (hudHpBarFill) hudHpBarFill.style.width = '100%';
      if (hudHpBarText) hudHpBarText.textContent = 'VIDA: 777 / 777 HP (MÁXIMA)';
    }
  }

  function spawnFloatingHealText(text, isMax = false) {
    if (!overheadHealLayer) return;
    const healSpan = document.createElement('span');
    healSpan.className = `floating-heal-text ${isMax ? 'max-heal' : ''}`;
    healSpan.textContent = text;
    overheadHealLayer.appendChild(healSpan);

    setTimeout(() => {
      if (healSpan.parentNode) healSpan.parentNode.removeChild(healSpan);
    }, 1250);
  }

  // =========================================================================
  // INTERACCIÓN CON COFRES Y EL GRAN NEXO
  // =========================================================================
    // =========================================================================
  // REGLA 3: INTERACCIÃ“N DE "AGARRAR EL COFRE CON LAS MANOS"
  // =========================================================================
  function triggerNodeInteraction(level) {
    const node = document.getElementById(`mapNode-${level}`);

    openedChests.add(level);
    saveOpenedChests();

    if (level === targetChestIndex && targetChestIndex < 7) {
      targetChestIndex++;
    }
    renderMapNodes();
    applyHealing(level);

    if (level >= 1 && level <= 6) {
      // 1. Los campeones se inclinan y acercan sus manos al cofre
      if (duoChampionsPawn) {
        duoChampionsPawn.classList.add('opening-chest-gesture');
      }

      // 2. El cofre se abre mÃ¡gicamente entre sus cuerpos con destellos
      if (node) {
        node.classList.add('bursting-open');
        node.classList.add('unlocked');
      }
      playChestOpenSound();

      // 3. Pausa de 1300ms para contemplar la animaciÃ³n juntos antes del modal
      setTimeout(() => {
        if (duoChampionsPawn) {
          duoChampionsPawn.classList.remove('opening-chest-gesture');
        }
        openChestModal(level);
      }, 1300);

    } else if (level === 7) {
      if (duoChampionsPawn) {
        duoChampionsPawn.classList.add('opening-chest-gesture');
      }
      if (node) node.classList.add('nexus-exploding');
      playNexusExplosionSound();

      if (riftViewport) {
        riftViewport.classList.add('screen-shake');
        setTimeout(() => riftViewport.classList.remove('screen-shake'), 650);
      }

      setTimeout(() => {
        if (duoChampionsPawn) {
          duoChampionsPawn.classList.remove('opening-chest-gesture');
        }
        startVictoryFlow();
      }, 1400);
    }
  }

  function walkNext() {
    if (currentWaypointIndex < 7) {
      walkToLevel(currentWaypointIndex + 1);
    }
  }

  function walkPrev() {
    if (currentWaypointIndex > 1) {
      walkToLevel(currentWaypointIndex - 1);
    }
  }

  if (riftViewport) {
    riftViewport.addEventListener('click', (e) => {
      if (e.target.closest('.real-hextech-chest-node') || e.target.closest('.real-nexus-node') || e.target.closest('button')) return;
      if (currentWaypointIndex < 7) {
        walkNext();
      }
    });
  }

  // =========================================================================
  // HUD INFERIOR Y HABILIDADES Q, W, E, R
  // =========================================================================
  function triggerSpell(spell) {
    playAbilitySound(spell);
    if (!spellFxLayer) return;

    if (spell === 'Q') {
      const heart = document.createElement('div');
      heart.className = 'spell-fx-heart';
      heart.textContent = '💖';
      spellFxLayer.appendChild(heart);
      setTimeout(() => { if (heart.parentNode) heart.parentNode.removeChild(heart); }, 900);
    } else if (spell === 'W') {
      const shield = document.createElement('div');
      shield.className = 'spell-fx-shield';
      spellFxLayer.appendChild(shield);
      setTimeout(() => { if (shield.parentNode) shield.parentNode.removeChild(shield); }, 900);
    } else if (spell === 'E') {
      const ping = document.createElement('div');
      ping.className = 'spell-fx-ping';
      spellFxLayer.appendChild(ping);
      setTimeout(() => { if (ping.parentNode) ping.parentNode.removeChild(ping); }, 800);
    }
  }

  const spellSlotQ = document.getElementById('spellSlotQ');
  const spellSlotW = document.getElementById('spellSlotW');
  const spellSlotE = document.getElementById('spellSlotE');
  const ultimateRBtn = document.getElementById('ultimateRBtn');
  const navNextBtn = document.getElementById('navNextBtn');
  const navPrevBtn = document.getElementById('navPrevBtn');

  if (spellSlotQ) spellSlotQ.addEventListener('click', (e) => { e.stopPropagation(); triggerSpell('Q'); });
  if (spellSlotW) spellSlotW.addEventListener('click', (e) => { e.stopPropagation(); triggerSpell('W'); });
  if (spellSlotE) spellSlotE.addEventListener('click', (e) => { e.stopPropagation(); triggerSpell('E'); });
  if (ultimateRBtn) ultimateRBtn.addEventListener('click', (e) => { e.stopPropagation(); walkNext(); });
  if (navNextBtn) navNextBtn.addEventListener('click', (e) => { e.stopPropagation(); walkNext(); });
  if (navPrevBtn) navPrevBtn.addEventListener('click', (e) => { e.stopPropagation(); walkPrev(); });

  window.addEventListener('keydown', (e) => {
    if (document.querySelector('.lol-modal-backdrop.show') || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key === 'r' || e.key === 'R' || e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ' || e.key === 's' || e.key === 'S') {
      e.preventDefault();
      walkNext();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'w' || e.key === 'W') {
      e.preventDefault();
      walkPrev();
    } else if (e.key === 'q' || e.key === 'Q') {
      triggerSpell('Q');
    } else if (e.key === 'e' || e.key === 'E') {
      triggerSpell('E');
    }
  });

  // =========================================================================
  // MODAL DE COFRE HEXTECH (NIVEL 1 AL 6)
  // =========================================================================
  const chestModal = document.getElementById('chestModal');
  const modalLevelBadge = document.getElementById('modalLevelBadge');
  const modalChestTitle = document.getElementById('modalChestTitle');
  const modalChestSubtitle = document.getElementById('modalChestSubtitle');
  const modalChestMessage = document.getElementById('modalChestMessage');
  const modalChestReward = document.getElementById('modalChestReward');
  const closeChestModalBtn = document.getElementById('closeChestModalBtn');
  const confirmChestBtn = document.getElementById('confirmChestBtn');

  function openChestModal(level) {
    const item = currentConfig.cofres.find(c => c.nivel === level);
    if (!item) return;

    if (modalLevelBadge) modalLevelBadge.textContent = `NIVEL ${item.nivel} • ${item.mes}`;
    if (modalChestTitle) modalChestTitle.textContent = item.titulo;
    if (modalChestSubtitle) modalChestSubtitle.textContent = item.subtitulo;
    if (modalChestMessage) modalChestMessage.textContent = item.mensaje;
    if (modalChestReward) modalChestReward.textContent = item.recompensa;

    if (confirmChestBtn) {
      const btnText = confirmChestBtn.querySelector('.btn-text');
      if (btnText) {
        btnText.textContent = (level < 6) ? `🚶‍♂️ CAMINAR AL NIVEL ${level + 1}` : '👑 AVANZAR AL GRAN NEXO (NIVEL 7)';
      }
    }

    if (chestModal) chestModal.classList.add('show');
  }

  function closeChestModal() {
    playHextechClickSound();
    if (chestModal) chestModal.classList.remove('show');
  }

  if (closeChestModalBtn) closeChestModalBtn.addEventListener('click', closeChestModal);
  if (confirmChestBtn) {
    confirmChestBtn.addEventListener('click', () => {
      closeChestModal();
      setTimeout(() => {
        if (currentWaypointIndex < 7) walkNext();
      }, 300);
    });
  }
  if (chestModal) {
    chestModal.addEventListener('click', (e) => {
      if (e.target === chestModal) closeChestModal();
    });
  }

  // =========================================================================
  // REGLAS 3 Y 4: PANTALLA DE VICTORIA LIMPIA + MODAL DE BESO FINAL
  // PROHIBIDO window.alert() • CERO CONFETI
  // =========================================================================
  const victoryModal = document.getElementById('victoryModal');
  const victoryStepEmblem = document.getElementById('victoryStepEmblem');
  const victoryStepLetter = document.getElementById('victoryStepLetter');
  const openLetterBtn = document.getElementById('openLetterBtn');
  const closeVictoryModalBtn = document.getElementById('closeVictoryModalBtn');
  const playAgainBtn = document.getElementById('playAgainBtn');

  const finalLockModal = document.getElementById('finalLockModal');
  const closeFinalLockModalBtn = document.getElementById('closeFinalLockModalBtn');
  const finalAcceptDoneBtn = document.getElementById('finalAcceptDoneBtn');

  function startVictoryFlow() {
    playVictoryFanfareSound();
    if (victoryStepEmblem) victoryStepEmblem.classList.add('active');
    if (victoryStepLetter) victoryStepLetter.classList.remove('active');
    if (victoryModal) victoryModal.classList.add('show');
  }

  if (openLetterBtn) {
    openLetterBtn.addEventListener('click', () => {
      playHextechClickSound();
      if (victoryStepEmblem) victoryStepEmblem.classList.remove('active');
      if (victoryStepLetter) victoryStepLetter.classList.add('active');
    });
  }

  function closeVictoryModal() {
    playHextechClickSound();
    if (victoryModal) victoryModal.classList.remove('show');
  }

  if (closeVictoryModalBtn) closeVictoryModalBtn.addEventListener('click', closeVictoryModal);
  if (victoryModal) {
    victoryModal.addEventListener('click', (e) => {
      if (e.target === victoryModal) closeVictoryModal();
    });
  }

  // REGLA 3 & 4: AL DAR CLIC A "¿JUGAMOS OTRA PARTIDA JUNTOS? SÍ",
  // SE ABRE EL MODAL PERSONALIZADO CON EL BESO DE CAMUS Y LYRA (SIN ALERT)
  if (playAgainBtn) {
    playAgainBtn.addEventListener('click', () => {
      playVictoryFanfareSound();
      closeVictoryModal();

      setTimeout(() => {
        if (finalLockModal) {
          finalLockModal.classList.add('show');
        }
      }, 250);
    });
  }

    function closeFinalLock() {
    playHextechClickSound();
    if (finalLockModal) finalLockModal.classList.remove('show');

    // REGLA 6: AL CERRAR EL BESO FINAL, MOSTRAR BOTÃ“N Ã‰PICO "VOLVER A JUGAR"
    if (openedChests.has(7)) {
      setTimeout(() => {
        const overlay = document.getElementById('replayAdventureOverlay');
        if (overlay) overlay.classList.add('show');
      }, 350);
    }
  }

  // REINICIAR TODA LA AVENTURA
  function restartAdventure() {
    playVictoryFanfareSound();
    const overlay = document.getElementById('replayAdventureOverlay');
    if (overlay) overlay.classList.remove('show');

    // Resetear datos de cofres
    openedChests.clear();
    saveOpenedChests();

    currentWaypointIndex = 0;
    targetChestIndex = 1;
    currentHp = 100;
    currentLevel = 1;

    // Actualizar interfaz
    if (barChestsCount) barChestsCount.textContent = '0 / 7';
    if (overheadLevelCircle) overheadLevelCircle.textContent = '1';
    if (hudLevelBadge) hudLevelBadge.textContent = '1';
    if (overheadHpFill) overheadHpFill.style.width = '14.3%';
    if (hudHpBarFill) hudHpBarFill.style.width = '14.3%';
    if (hudHpBarText) hudHpBarText.textContent = 'VIDA: 100 / 700 HP';

    // Cerrar todos los cofres en el mapa
    renderMapNodes();

    // Teletransportar a la Base Aliada y centrar cÃ¡mara
    setChampionsPosition(0);
    setCamera(WAYPOINTS[0], 700, 'ease-out');
  }

  const epicReplayBtn = document.getElementById('epicReplayBtn');
  if (epicReplayBtn) epicReplayBtn.addEventListener('click', restartAdventure);

  if (closeFinalLockModalBtn) closeFinalLockModalBtn.addEventListener('click', closeFinalLock);
  if (finalAcceptDoneBtn) finalAcceptDoneBtn.addEventListener('click', closeFinalLock);
  if (finalLockModal) {
    finalLockModal.addEventListener('click', (e) => {
      if (e.target === finalLockModal) closeFinalLock();
    });
  }

  // =========================================================================
  // FASE 1: CLIENTE DE LEAGUE OF LEGENDS ("¡PARTIDA ENCONTRADA!")
  // =========================================================================
  const phaseMatchFound = document.getElementById('phaseMatchFound');
  const phaseLoading = document.getElementById('phaseLoading');
  const phaseGameplay = document.getElementById('phaseGameplay');
  const matchAcceptBtn = document.getElementById('matchAcceptBtn');
  const matchTimerRing = document.getElementById('matchTimerRing');
  const matchTimerCount = document.getElementById('matchTimerCount');

  let matchSecondsLeft = 10;
  let matchInterval = null;

  function startMatchFoundFlow() {
    playMatchFoundSound();
    matchInterval = setInterval(() => {
      matchSecondsLeft--;
      if (matchTimerCount) matchTimerCount.textContent = matchSecondsLeft;

      if (matchTimerRing) {
        const offset = 848 - (848 * ((10 - matchSecondsLeft) / 10));
        matchTimerRing.style.strokeDashoffset = offset;
      }

      if (matchSecondsLeft <= 0) {
        clearInterval(matchInterval);
        acceptMatch();
      }
    }, 1000);
  }

  function acceptMatch() {
    clearInterval(matchInterval);
    playHextechClickSound();
    playChestOpenSound();

    if (matchAcceptBtn) {
      matchAcceptBtn.style.background = '#2ecc71';
      const text = matchAcceptBtn.querySelector('.btn-hex-text');
      if (text) text.textContent = '¡ACEPTADO!';
    }

    setTimeout(() => {
      if (phaseMatchFound) phaseMatchFound.classList.remove('active');
      if (phaseLoading) phaseLoading.classList.add('active');
      startLoadingPhase();
    }, 550);
  }

  if (matchAcceptBtn) matchAcceptBtn.addEventListener('click', acceptMatch);

  // =========================================================================
  // FASE 2: PANTALLA DE CARGA (LOADING)
  // =========================================================================
  const loadFill = document.getElementById('loadFill');
  const loadPercentNum = document.getElementById('loadPercentNum');
  const loadStatusText = document.getElementById('loadStatusText');
  const loadTipText = document.getElementById('loadTipText');
  const enterGameDirectBtn = document.getElementById('enterGameDirectBtn');

  let loadPercent = 0;
  let tipIndex = 0;

  function cycleLoadingTips() {
    if (!currentConfig.tipsCarga || currentConfig.tipsCarga.length === 0) return;
    tipIndex = (tipIndex + 1) % currentConfig.tipsCarga.length;
    if (loadTipText) {
      loadTipText.style.opacity = '0';
      setTimeout(() => {
        loadTipText.textContent = `"${currentConfig.tipsCarga[tipIndex]}"`;
        loadTipText.style.opacity = '1';
      }, 300);
    }
  }

  function startLoadingPhase() {
    const tipsTimer = setInterval(cycleLoadingTips, 3200);
    const loadTimer = setInterval(() => {
      const inc = Math.floor(Math.random() * 8) + 4;
      loadPercent = Math.min(100, loadPercent + inc);

      if (loadFill) loadFill.style.width = `${loadPercent}%`;
      if (loadPercentNum) loadPercentNum.textContent = `${loadPercent}%`;

      if (loadPercent >= 100) {
        clearInterval(loadTimer);
        clearInterval(tipsTimer);
        if (loadStatusText) loadStatusText.textContent = '¡100% CARGADO! Entrando a la Grieta...';
        if (enterGameDirectBtn) enterGameDirectBtn.style.animation = 'pulseGoldGlow 1.4s infinite';

        setTimeout(enterTheGameplay, 750);
      }
    }, 120);
  }

  function enterTheGameplay() {
    playHextechClickSound();
    if (phaseLoading) phaseLoading.classList.remove('active');
    if (phaseGameplay) phaseGameplay.classList.add('active');
    setCamera(WAYPOINTS[currentWaypointIndex], 0);
  }

  if (enterGameDirectBtn) enterGameDirectBtn.addEventListener('click', enterTheGameplay);

  // =========================================================================
  // EDITOR EN VIVO DE MENSAJES Y CARTA
  // =========================================================================
  const editorModal = document.getElementById('editorModal');
  const openEditorBtn = document.getElementById('openEditorBtn');
  const closeEditorModalBtn = document.getElementById('closeEditorModalBtn');
  const saveEditorChangesBtn = document.getElementById('saveEditorChangesBtn');
  const resetDefaultsBtn = document.getElementById('resetDefaultsBtn');
  const editorTabs = document.querySelectorAll('.editor-tab');
  const editorTabPanes = document.querySelectorAll('.editor-tab-pane');

  editorTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      playHextechClickSound();
      editorTabs.forEach(t => t.classList.remove('active'));
      editorTabPanes.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const targetPane = document.getElementById(tab.dataset.tab);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  function populateEditorForm() {
    const editBoyName = document.getElementById('editBoyName');
    const editBoyRole = document.getElementById('editBoyRole');
    const editGirlName = document.getElementById('editGirlName');
    const editGirlRole = document.getElementById('editGirlRole');

    if (editBoyName) editBoyName.value = currentConfig.pareja.el.nombre;
    if (editBoyRole) editBoyRole.value = currentConfig.pareja.el.rol;
    if (editGirlName) editGirlName.value = currentConfig.pareja.ella.nombre;
    if (editGirlRole) editGirlRole.value = currentConfig.pareja.ella.rol;

    const editorChestsList = document.getElementById('editorChestsList');
    if (editorChestsList) {
      editorChestsList.innerHTML = '';
      currentConfig.cofres.forEach((cofre, index) => {
        const chestCard = document.createElement('div');
        chestCard.className = 'editor-chest-card';
        chestCard.innerHTML = `
          <h4>🎁 Nivel ${cofre.nivel} (${cofre.mes})</h4>
          <div class="form-group">
            <label>Título:</label>
            <input type="text" class="lol-input edit-chest-title" data-index="${index}" value="${cofre.titulo}">
          </div>
          <div class="form-group">
            <label>Subtítulo:</label>
            <input type="text" class="lol-input edit-chest-subtitle" data-index="${index}" value="${cofre.subtitulo}">
          </div>
          <div class="form-group">
            <label>Mensaje:</label>
            <textarea class="lol-textarea edit-chest-message" data-index="${index}" rows="3">${cofre.mensaje}</textarea>
          </div>
          <div class="form-group">
            <label>Recompensa:</label>
            <input type="text" class="lol-input edit-chest-reward" data-index="${index}" value="${cofre.recompensa}">
          </div>
        `;
        editorChestsList.appendChild(chestCard);
      });
    }

    const editLetterTitle = document.getElementById('editLetterTitle');
    const editLetterContent = document.getElementById('editLetterContent');
    const editLetterFarewell = document.getElementById('editLetterFarewell');
    const editLetterSignature = document.getElementById('editLetterSignature');

    if (editLetterTitle) editLetterTitle.value = currentConfig.cartaAmor.titulo;
    if (editLetterContent) editLetterContent.value = currentConfig.cartaAmor.contenido;
    if (editLetterFarewell) editLetterFarewell.value = currentConfig.cartaAmor.despedida;
    if (editLetterSignature) editLetterSignature.value = currentConfig.cartaAmor.firma;
  }

  function saveEditorChanges() {
    playHextechClickSound();
    const editBoyName = document.getElementById('editBoyName');
    const editBoyRole = document.getElementById('editBoyRole');
    const editGirlName = document.getElementById('editGirlName');
    const editGirlRole = document.getElementById('editGirlRole');

    if (editBoyName) currentConfig.pareja.el.nombre = editBoyName.value;
    if (editBoyRole) currentConfig.pareja.el.rol = editBoyRole.value;
    if (editGirlName) currentConfig.pareja.ella.nombre = editGirlName.value;
    if (editGirlRole) currentConfig.pareja.ella.rol = editGirlRole.value;

    const titleInputs = document.querySelectorAll('.edit-chest-title');
    const subInputs = document.querySelectorAll('.edit-chest-subtitle');
    const msgInputs = document.querySelectorAll('.edit-chest-message');
    const rewardInputs = document.querySelectorAll('.edit-chest-reward');

    titleInputs.forEach(input => {
      const idx = parseInt(input.dataset.index, 10);
      if (currentConfig.cofres[idx]) currentConfig.cofres[idx].titulo = input.value;
    });
    subInputs.forEach(input => {
      const idx = parseInt(input.dataset.index, 10);
      if (currentConfig.cofres[idx]) currentConfig.cofres[idx].subtitulo = input.value;
    });
    msgInputs.forEach(input => {
      const idx = parseInt(input.dataset.index, 10);
      if (currentConfig.cofres[idx]) currentConfig.cofres[idx].mensaje = input.value;
    });
    rewardInputs.forEach(input => {
      const idx = parseInt(input.dataset.index, 10);
      if (currentConfig.cofres[idx]) currentConfig.cofres[idx].recompensa = input.value;
    });

    const editLetterTitle = document.getElementById('editLetterTitle');
    const editLetterContent = document.getElementById('editLetterContent');
    const editLetterFarewell = document.getElementById('editLetterFarewell');
    const editLetterSignature = document.getElementById('editLetterSignature');

    if (editLetterTitle) currentConfig.cartaAmor.titulo = editLetterTitle.value;
    if (editLetterContent) currentConfig.cartaAmor.contenido = editLetterContent.value;
    if (editLetterFarewell) currentConfig.cartaAmor.despedida = editLetterFarewell.value;
    if (editLetterSignature) currentConfig.cartaAmor.firma = editLetterSignature.value;

    saveCustomConfig(currentConfig);
    if (editorModal) editorModal.classList.remove('show');
  }

  function resetToDefaults() {
    if (confirm('¿Quieres restablecer todos los mensajes a su versión original?')) {
      playHextechClickSound();
      currentConfig = JSON.parse(JSON.stringify(ANNIVERSARY_CONFIG));
      currentConfig.pareja.el.nombre = 'CAMUS';
      currentConfig.pareja.ella.nombre = 'LYRA';
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      applyConfigToDOM();
      populateEditorForm();
    }
  }

  if (openEditorBtn) openEditorBtn.addEventListener('click', () => {
    playHextechClickSound();
    populateEditorForm();
    if (editorModal) editorModal.classList.add('show');
  });
  if (closeEditorModalBtn) closeEditorModalBtn.addEventListener('click', () => {
    playHextechClickSound();
    if (editorModal) editorModal.classList.remove('show');
  });
  if (saveEditorChangesBtn) saveEditorChangesBtn.addEventListener('click', saveEditorChanges);
  if (resetDefaultsBtn) resetDefaultsBtn.addEventListener('click', resetToDefaults);

  // Control de Sonido
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');
  if (soundToggleBtn) {
        soundToggleBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      if (soundIcon) soundIcon.textContent = soundEnabled ? 'ðŸ”Š' : 'ðŸ”‡';
      if (bgMusic) {
        bgMusic.volume = soundEnabled ? 0.45 : 0;
        if (soundEnabled && bgMusic.paused) bgMusic.play().catch(() => {});
      }
      if (soundEnabled) playHextechClickSound();
    });
  }

  // Rotación en móvil

  // =========================================================================
  // APLICAR CONFIGURACIÓN AL DOM
  // =========================================================================
  function applyConfigToDOM() {
    const pawnNamesTag = document.getElementById('pawnNamesTag');
    const matchBoyName = document.getElementById('matchBoyName');
    const matchGirlName = document.getElementById('matchGirlName');
    const loadBoyName = document.getElementById('loadBoyName');
    const loadBoyRole = document.getElementById('loadBoyRole');
    const loadBoyChamp = document.getElementById('loadBoyChamp');
    const loadGirlName = document.getElementById('loadGirlName');
    const loadGirlRole = document.getElementById('loadGirlRole');
    const loadGirlChamp = document.getElementById('loadGirlChamp');

    const boyName = currentConfig.pareja.el.nombre || 'CAMUS';
    const girlName = currentConfig.pareja.ella.nombre || 'LYRA';

    if (pawnNamesTag) pawnNamesTag.textContent = `${boyName} & ${girlName}`;

    if (matchBoyName) matchBoyName.textContent = `${boyName} (ADC)`;
    if (matchGirlName) matchGirlName.textContent = `${girlName} (Support)`;

    if (loadBoyName) loadBoyName.textContent = boyName;
    if (loadBoyRole) loadBoyRole.textContent = currentConfig.pareja.el.rol;
    if (loadBoyChamp) loadBoyChamp.textContent = currentConfig.pareja.el.campeonFavorito;

    if (loadGirlName) loadGirlName.textContent = girlName;
    if (loadGirlRole) loadGirlRole.textContent = currentConfig.pareja.ella.rol;
    if (loadGirlChamp) loadGirlChamp.textContent = currentConfig.pareja.ella.campeonFavorito;

    const letterTitle = document.getElementById('letterTitle');
    const letterDate = document.getElementById('letterDate');
    const letterContent = document.getElementById('letterContent');
    const letterFarewell = document.getElementById('letterFarewell');
    const letterSignature = document.getElementById('letterSignature');

    if (letterTitle) letterTitle.textContent = currentConfig.cartaAmor.titulo;
    if (letterDate) letterDate.textContent = currentConfig.cartaAmor.fecha;
    if (letterFarewell) letterFarewell.textContent = currentConfig.cartaAmor.despedida;
    if (letterSignature) letterSignature.textContent = currentConfig.cartaAmor.firma;

    if (letterContent) {
      letterContent.innerHTML = '';
      const paragraphs = currentConfig.cartaAmor.contenido.split('\n\n');
      paragraphs.forEach(pText => {
        if (pText.trim()) {
          const p = document.createElement('p');
          p.textContent = pText.trim();
          letterContent.appendChild(p);
        }
      });
    }

    renderMapNodes();
    updateCounterDisplay();
  }

  // =========================================================================
  // INICIALIZACIÓN
  // =========================================================================
  renderSecretSparks();
  setChampionsPosition(0);
  
  applyConfigToDOM();
  startMatchFoundFlow();

})();
