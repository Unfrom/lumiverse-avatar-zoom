interface FloatingState {
  scale: number;
  posX: number;
  posY: number;
  rotation: number;
  targetScale: number;
  targetPosX: number;
  targetPosY: number;
  targetRotation: number;
  isDragging: boolean;
  isPinching: boolean;
  startX: number;
  startY: number;
  initialDistance: number;
  lastPinchAngle: number;
  userRotated: boolean;
  pinchStartScale: number;
  pinchStartPosX: number;
  pinchStartPosY: number;
  pinchFocalX: number;
  pinchFocalY: number;
}

const MIN_SCALE = 0.35;
const MAX_SCALE = 8.0;
const ZOOM_STEP = 0.16;
const BASE_WIDTH = 300; // Janitor AI default width

const STORAGE_KEY = 'lumi_avatar_zoom_prefs';

function loadSavedPrefs(): { scale: number; posX: number; posY: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed.scale === 'number' && typeof parsed.posX === 'number' && typeof parsed.posY === 'number') {
      return {
        scale: Math.min(MAX_SCALE, Math.max(MIN_SCALE, parsed.scale)),
        posX: Math.min(window.innerWidth - 60, Math.max(-200, parsed.posX)),
        posY: Math.min(window.innerHeight - 60, Math.max(0, parsed.posY)),
      };
    }
  } catch (_) {}
  return null;
}

function savePrefs(scale: number, posX: number, posY: number) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ scale, posX, posY }));
  } catch (_) {}
}

export function setup() {
  // 1. Exact Janitor AI CSS classes and design tokens
  const styleEl = document.createElement('style');
  styleEl.id = 'lumi-avatar-zoom-janitor-styles';
  styleEl.textContent = `
    /* Outer position anchor: transparent wrapper handling posX, posY, scale */
    ._enlargedAvatarOverlay_4evg7_233 {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 999999;
      touch-action: none;
      -webkit-user-select: none;
      user-select: none;
      display: inline-block;
      box-sizing: border-box;
      cursor: grab;
      width: ${BASE_WIDTH}px;
      transform-origin: 0 0; /* Keeps focal zoom 100% rock-solid with zero coordinate drift */
      opacity: 0;
      pointer-events: none;
      transform: translateY(10%);
      background: transparent;
      padding: 0;
      border: 0;
      box-shadow: none;
    }

    /* Inner card: contains background, blur, padding, border and rotates completely as ONE element */
    ._enlargedAvatarTiltInner {
      width: 100%;
      height: 100%;
      position: relative;
      transform-origin: center center;
      will-change: transform;
      background: rgba(0, 0, 0, 0.30);
      -webkit-backdrop-filter: blur(5px);
      backdrop-filter: blur(5px);
      padding: 16px 2px 2px;
      border-radius: 4px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      box-sizing: border-box;
      image-rendering: high-quality;
    }

    /* Janitor AI opening entrance animation */
    ._enlargedAvatarOverlay_4evg7_233.animating {
      transition: opacity 180ms ease, transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    ._enlargedAvatarOverlay_4evg7_233.visible {
      opacity: 1;
      pointer-events: auto;
    }

    ._enlargedAvatarOverlay_4evg7_233.dragging {
      cursor: grabbing;
      transition: none !important;
    }

    ._enlargedAvatarOverlay_4evg7_233.dragging ._enlargedAvatarTiltInner {
      box-shadow: 0 16px 24px -4px rgba(0, 0, 0, 0.25), 0 6px 10px -2px rgba(0, 0, 0, 0.15);
    }

    /* 1:1 Janitor Avatar Image */
    ._enlargedAvatarImage_4evg7_261 {
      display: block;
      width: 100%;
      height: auto;
      max-height: 80vh;
      object-fit: contain;
      border-radius: 2px;
      will-change: width, height;
      pointer-events: none;
      user-select: none;
      -webkit-user-drag: none;
    }

    /* 1:1 Janitor Close Button positioned in the 16px top drag header */
    ._enlargedAvatarClose_4evg7_268 {
      position: absolute;
      top: 1px;
      right: 2px;
      width: 14px;
      height: 14px;
      padding: 0;
      margin: 0;
      background: transparent;
      border: 0;
      outline: none;
      color: rgba(255, 255, 255, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 13px;
      line-height: 1;
      transition: color 140ms ease, transform 140ms ease;
      z-index: 2;
    }

    ._enlargedAvatarClose_4evg7_268:hover {
      color: #ffffff;
      transform: scale(1.15);
    }

    ._enlargedAvatarClose_4evg7_268 svg {
      width: 1em;
      height: 1em;
      pointer-events: none;
    }

    /* Subtle cursor hint on clickable avatars across Lumiverse */
    [class*="_avatar_" i] img,
    [class*="avatar" i] img,
    [data-component*="Message"] [class*="_avatar_" i],
    [data-component="CharacterCard"] img {
      cursor: pointer !important;
    }
  `;
  document.head.appendChild(styleEl);

  // 2. Exact 1:1 Janitor AI DOM structure with isolated tilt wrapper
  const overlay = document.createElement('div');
  overlay.className = '_enlargedAvatarOverlay_4evg7_233';
  overlay.setAttribute('role', 'region');
  overlay.setAttribute('aria-label', 'Enlarged Avatar');

  const tiltWrapper = document.createElement('div');
  tiltWrapper.className = '_enlargedAvatarTiltInner';

  const img = document.createElement('img');
  img.className = '_enlargedAvatarImage_4evg7_261';
  img.alt = 'Enlarged Avatar';
  img.draggable = false;

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = '_enlargedAvatarClose_4evg7_268';
  closeBtn.setAttribute('aria-label', 'Close enlarged avatar');
  closeBtn.innerHTML = `
    <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"></path>
    </svg>
  `;

  tiltWrapper.appendChild(img);
  tiltWrapper.appendChild(closeBtn);
  overlay.appendChild(tiltWrapper);
  document.body.appendChild(overlay);

  // 3. State Engine
  const saved = loadSavedPrefs();
  const defaultInitialX = Math.max(20, window.innerWidth - BASE_WIDTH - 40);
  const defaultInitialY = 80;

  const state: FloatingState = {
    scale: saved ? saved.scale : 1,
    posX: saved ? saved.posX : defaultInitialX,
    posY: saved ? saved.posY : defaultInitialY,
    rotation: 0,
    targetScale: saved ? saved.scale : 1,
    targetPosX: saved ? saved.posX : defaultInitialX,
    targetPosY: saved ? saved.posY : defaultInitialY,
    targetRotation: 0,
    isDragging: false,
    isPinching: false,
    startX: 0,
    startY: 0,
    initialDistance: 0,
    lastPinchAngle: 0,
    userRotated: false,
    pinchStartScale: 1,
    pinchStartPosX: 100,
    pinchStartPosY: 100,
    pinchFocalX: 0,
    pinchFocalY: 0,
  };

  let animLoopRunning = false;
  let lastFrameTime = performance.now();

  // Janitor-exact spring, decompiled from useDragControl-CP3ezJEq.js:
  // framer-motion useSpring { stiffness: 350, damping: 22, mass: 1 }
  // → damping ratio ≈ 0.59 (underdamped): trails the pointer, settles with
  //   a whisper of overshoot. No speed caps anywhere.
  const SPRING_STIFFNESS = 350;
  const SPRING_DAMPING = 22;
  const SPRING_MASS = 1;
  const vel = { x: 0, y: 0, scale: 0, rot: 0 };

  function renderTransform() {
    overlay.style.transform = `translateX(${state.posX.toFixed(3)}px) translateY(${state.posY.toFixed(3)}px) scale(${state.scale.toFixed(4)})`;
    tiltWrapper.style.transform = `rotate(${state.rotation.toFixed(3)}deg)`;
  }

  // Unified Physics Engine — ported 1:1 from Janitor's useDragControl hook
  // (decompiled from assets.janitorai.com/useDragControl-CP3ezJEq.js):
  //
  //   const SPRING = { damping: 22, stiffness: 350 };
  //   onDrag: ({ offset: [dx, dy] }) => { rawX.set(dx); rawY.set(dy); }   // instant targets
  //   drag:   { from: () => [x.get(), y.get()] }                          // grab from LAGGING pos
  //   style:  { x, y, scale, rotateZ }                                    // springs drive render
  //
  // So: pointer writes targets instantly, rendered values chase them through
  // an underdamped spring (ζ ≈ 0.59) — trails slightly, settles with a whisper
  // of overshoot. No speed caps, no lerp, no rubberband on drag.
  // Pinch (also 1:1): scale target = pinchStartScale * distRatio (clamped
  // 0.5–4), rotation = twist angle offset, position keeps the two-finger
  // midpoint stationary. Everything still flows through the same spring.
  function runPhysicsLoop() {
    if (animLoopRunning) return;
    animLoopRunning = true;
    lastFrameTime = performance.now();

    function step(now: number) {
      const dt = Math.min((now - lastFrameTime) / 1000, 0.04);
      lastFrameTime = now;

      // Integrate with 4 substeps per frame: semi-implicit Euler is symplectic
      // and slightly overdamps at 60Hz; quarter-steps bring the visible
      // overshoot within ~1% of framer-motion's analytic response.
      const SUBSTEPS = 4;
      const h = dt / SUBSTEPS;
      for (let s = 0; s < SUBSTEPS; s++) {
        // --- 1. Position spring (x, y) ---
        // Hooke: F = -k*(x - target) - c*v  ≡  k*(target - x) - c*v
        const Fx = SPRING_STIFFNESS * (state.targetPosX - state.posX) - SPRING_DAMPING * vel.x;
        const Fy = SPRING_STIFFNESS * (state.targetPosY - state.posY) - SPRING_DAMPING * vel.y;
        vel.x += (Fx / SPRING_MASS) * h;
        vel.y += (Fy / SPRING_MASS) * h;
        state.posX += vel.x * h;
        state.posY += vel.y * h;

        // --- 2. Rotation spring (rotateZ) — same spring config as x/y ---
        // Janitor: const [rot, springRot] = [useMotionValue(0), useSpring(rot, SPRING)]
        const FRot = SPRING_STIFFNESS * (state.targetRotation - state.rotation) - SPRING_DAMPING * vel.rot;
        vel.rot += (FRot / SPRING_MASS) * h;
        state.rotation += vel.rot * h;

        // --- 3. Scale spring — same spring config (Janitor wraps scale too) ---
        const FScale = SPRING_STIFFNESS * (state.targetScale - state.scale) - SPRING_DAMPING * vel.scale;
        vel.scale += (FScale / SPRING_MASS) * h;
        state.scale += vel.scale * h;
      }

      renderTransform();

      // Settle check: spring is at rest when all gaps AND all velocities ~ 0.
      // Allowed even mid-hold — any new pointer event simply restarts the loop,
      // so there is no busy rAF while the card is held perfectly still.
      const speed = Math.hypot(vel.x, vel.y);
      const isSettled =
        Math.hypot(state.targetPosX - state.posX, state.targetPosY - state.posY) < 0.1 &&
        Math.abs(state.targetRotation - state.rotation) < 0.05 &&
        Math.abs(state.targetScale - state.scale) < 0.0006 &&
        speed < 8 && Math.abs(vel.rot) < 25 && Math.abs(vel.scale) < 0.02;

      if (isSettled) {
        state.posX = state.targetPosX;
        state.posY = state.targetPosY;
        state.scale = state.targetScale;
        state.rotation = state.targetRotation;
        vel.x = 0; vel.y = 0; vel.rot = 0; vel.scale = 0;
        renderTransform();
        animLoopRunning = false;
        return;
      }

      requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function getDistance(p1: { x: number; y: number }, p2: { x: number; y: number }) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
  }

  function getCenter(p1: { x: number; y: number }, p2: { x: number; y: number }) {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  }

  function getAngle(p1: { x: number; y: number }, p2: { x: number; y: number }) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }

  // Focal zoom through the spring — mirrors Janitor: raw motion values are
  // set instantly (t.set(...), n.set(...)), the spring chases them.
  // Ratio accumulates on TARGETS so repeated wheel steps compose cleanly and
  // the resting state is exactly focal-invariant.
  function zoomTowards(newScale: number, focalX: number, focalY: number, _smooth = true) {
    const clampedScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, newScale));
    if (clampedScale === state.targetScale) return;

    const ratio = clampedScale / state.targetScale;
    state.targetPosX = focalX - (focalX - state.targetPosX) * ratio;
    state.targetPosY = focalY - (focalY - state.targetPosY) * ratio;
    state.targetScale = clampedScale;
    runPhysicsLoop();
  }

  function openAvatar(src: string, clickX?: number, clickY?: number) {
    const cleanSrc = src.replace(/[?&](width|height|thumb|w|h|size)=\d+/g, '');
    img.src = cleanSrc;

    const savedPrefs = loadSavedPrefs();
    if (savedPrefs) {
      state.scale = savedPrefs.scale;
      state.targetScale = savedPrefs.scale;
      state.posX = savedPrefs.posX;
      state.targetPosX = savedPrefs.posX;
      state.posY = savedPrefs.posY;
      state.targetPosY = savedPrefs.posY;
    } else {
      const defaultX = clickX ? Math.min(window.innerWidth - BASE_WIDTH - 20, clickX + 20) : window.innerWidth - BASE_WIDTH - 40;
      const defaultY = clickY ? Math.min(window.innerHeight - 360, Math.max(20, clickY - 60)) : 80;
      state.scale = 1;
      state.targetScale = 1;
      state.posX = Math.max(10, defaultX);
      state.posY = Math.max(10, defaultY);
      state.targetPosX = state.posX;
      state.targetPosY = state.posY;
    }

    state.rotation = 0;
    state.targetRotation = 0;
    vel.x = 0; vel.y = 0; vel.rot = 0; vel.scale = 0; // fresh spring on open

    // Janitor AI entrance: start with translateY(10%) and pop into final position
    overlay.style.transition = 'none';
    overlay.style.transform = `translateX(${state.posX.toFixed(3)}px) translateY(${(state.posY + 24).toFixed(3)}px) scale(${(state.scale * 0.94).toFixed(4)})`;
    tiltWrapper.style.transform = 'rotate(0deg)';
    overlay.classList.remove('animating', 'visible');

    // Trigger reflow then animate
    void overlay.offsetWidth;

    overlay.classList.add('animating');
    overlay.classList.add('visible');
    renderTransform();

    setTimeout(() => {
      overlay.classList.remove('animating');
    }, 220);
  }

  function closeAvatar() {
    savePrefs(state.targetScale, state.targetPosX, state.targetPosY);
    overlay.classList.add('animating');
    overlay.style.transform = `translateX(${state.posX.toFixed(3)}px) translateY(${(state.posY + 20).toFixed(3)}px) scale(${(state.scale * 0.94).toFixed(4)})`;
    overlay.classList.remove('visible');

    setTimeout(() => {
      if (!overlay.classList.contains('visible')) {
        img.src = '';
        overlay.classList.remove('animating');
      }
    }, 200);
  }

  // 4. Smooth Mouse Wheel & Trackpad Pinch Zoom
  overlay.addEventListener('wheel', (e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.ctrlKey) {
      // High-precision continuous trackpad pinch — accumulate from TARGET
      // (Janitor: n.get() reads the last-set raw value, i.e. the target)
      const pinchZoomFactor = Math.exp(-e.deltaY * 0.012);
      const nextScale = state.targetScale * pinchZoomFactor;
      zoomTowards(nextScale, e.clientX, e.clientY);
    } else {
      // Mouse wheel step
      const stepFactor = e.deltaY < 0 ? (1 + ZOOM_STEP) : (1 / (1 + ZOOM_STEP));
      const nextScale = state.targetScale * stepFactor;
      zoomTowards(nextScale, e.clientX, e.clientY, true);
    }
  }, { passive: false });

  // 5. Drag with Resistance, Regulated Speed & Free Rotation
  const activePointers = new Map<number, { x: number; y: number }>();

  overlay.addEventListener('pointerdown', (e: PointerEvent) => {
    if (e.target === closeBtn || closeBtn.contains(e.target as Node)) return;

    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    overlay.setPointerCapture(e.pointerId);

    overlay.classList.remove('animating');
    overlay.style.transition = 'none';

    if (activePointers.size === 1) {
      state.isDragging = true;
      state.isPinching = false;
      // Grab from the LAGGING position (Janitor: drag.from = () => [x.get(), y.get()]).
      // Do NOT reset targets here — an in-flight glide continues under the finger.
      state.startX = e.clientX - state.posX;
      state.startY = e.clientY - state.posY;

      overlay.classList.add('dragging');
      runPhysicsLoop();
    } else if (activePointers.size === 2) {
      state.isDragging = false;
      state.isPinching = true;
      overlay.classList.remove('dragging');

      const pts = Array.from(activePointers.values());
      state.initialDistance = getDistance(pts[0], pts[1]);
      state.lastPinchAngle = getAngle(pts[0], pts[1]);
      state.pinchStartScale = state.scale;
      state.pinchStartPosX = state.posX;
      state.pinchStartPosY = state.posY;

      const center = getCenter(pts[0], pts[1]);
      state.pinchFocalX = center.x;
      state.pinchFocalY = center.y;
    }
  });

  overlay.addEventListener('pointermove', (e: PointerEvent) => {
    if (!activePointers.has(e.pointerId)) return;
    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (state.isPinching && activePointers.size === 2) {
      const pts = Array.from(activePointers.values());
      const currentDist = getDistance(pts[0], pts[1]);
      const currentAngle = getAngle(pts[0], pts[1]);
      const currentCenter = getCenter(pts[0], pts[1]);

      // 1. Two-finger twist: rotation target follows the twist (Janitor: m.set(offset));
      //    the spring chases it — smooth, weighted, never 1:1 snappy.
      let deltaDeg = (currentAngle - state.lastPinchAngle) * (180 / Math.PI);
      while (deltaDeg > 180) deltaDeg -= 360;
      while (deltaDeg < -180) deltaDeg += 360;
      state.lastPinchAngle = currentAngle;
      if (Math.abs(deltaDeg) > 0.01) {
        state.targetRotation += deltaDeg;
        state.userRotated = true;
      }

      // 2. Pinch zoom — targets only (Janitor: n.set(offset), t.set(f-(o-1)*d));
      //    the spring renders. Midpoint stays stationary under the fingers.
      if (state.initialDistance > 0) {
        const distRatio = currentDist / state.initialDistance;
        const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, state.pinchStartScale * distRatio));
        const ratio = nextScale / state.pinchStartScale;

        const panDeltaX = currentCenter.x - state.pinchFocalX;
        const panDeltaY = currentCenter.y - state.pinchFocalY;

        state.targetScale = nextScale;
        state.targetPosX = state.pinchFocalX - (state.pinchFocalX - state.pinchStartPosX) * ratio + panDeltaX;
        state.targetPosY = state.pinchFocalY - (state.pinchFocalY - state.pinchStartPosY) * ratio + panDeltaY;
      }

      runPhysicsLoop();
    } else if (state.isDragging && activePointers.size === 1) {
      // Cursor moves ahead: sets target position
      state.targetPosX = e.clientX - state.startX;
      state.targetPosY = e.clientY - state.startY;

      // Rotation is strictly gesture-gated: ONLY Shift+drag (desktop) or a
      // two-finger twist (touch). A plain drag must NEVER rotate the card.
      // If the card was twisted, that rotation is HELD while the finger
      // stays down — no snap-back and no override until a full release.
      if (e.shiftKey && !state.userRotated) {
        const rect = overlay.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const currentAngleRad = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        state.targetRotation = currentAngleRad * (180 / Math.PI);
      }

      runPhysicsLoop();
    }
  });

  const onPointerRelease = (e: PointerEvent) => {
    activePointers.delete(e.pointerId);
    try { overlay.releasePointerCapture(e.pointerId); } catch (_) {}

    if (activePointers.size === 0) {
      state.isDragging = false;
      state.isPinching = false;
      overlay.classList.remove('dragging');

      // Normalize current rotation to [-180, 180] so snap-back takes the shortest, smoothest angular path back to 0°
      state.rotation = ((state.rotation % 360) + 540) % 360 - 180;
      state.targetRotation = 0;
      state.userRotated = false; // finger fully lifted — glide back to 0° now

      // Ensure physics finishes gliding into place and snaps back smoothly
      runPhysicsLoop();
      savePrefs(state.targetScale, state.targetPosX, state.targetPosY);
    } else if (activePointers.size === 1) {
      state.isPinching = false;
      state.isDragging = true;
      overlay.classList.add('dragging');
      const remaining = Array.from(activePointers.values())[0];
      state.startX = remaining.x - state.posX;
      state.startY = remaining.y - state.posY;
    }
  };

  overlay.addEventListener('pointerup', onPointerRelease);
  overlay.addEventListener('pointercancel', onPointerRelease);

  // Double click toggles zoom anchored at the clicked spot
  overlay.addEventListener('dblclick', (e: MouseEvent) => {
    if (e.target === closeBtn || closeBtn.contains(e.target as Node)) return;
    e.preventDefault();
    if (state.scale > 1.25) {
      zoomTowards(1.0, e.clientX, e.clientY, true);
    } else {
      zoomTowards(2.0, e.clientX, e.clientY, true);
    }
  });

  // Close Button
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeAvatar();
  });

  // Escape key closes enlarged avatar
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && overlay.classList.contains('visible')) {
      closeAvatar();
    }
  });

  // 6. Global Delegated Click Listener across Lumiverse
  const AVATAR_SELECTORS = [
    '[data-component*="Message"] [class*="_avatar_" i] img',
    '[class*="_avatar_" i] img',
    '[class*="avatar" i] img',
    'img[class*="avatar" i]',
    '[data-component="CharacterCard"] img',
    '[data-component="GroupChatMemberBar"] img'
  ].join(', ');

  const handleDocumentClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    if (overlay.contains(target)) return;

    const imgEl = target.closest<HTMLImageElement>(AVATAR_SELECTORS) ||
      (target.tagName === 'IMG' && target.closest('[class*="_avatar_" i], [class*="avatar" i]') ? target as HTMLImageElement : null);

    if (imgEl && imgEl.src) {
      e.preventDefault();
      e.stopPropagation();
      openAvatar(imgEl.src, e.clientX, e.clientY);
    }
  };

  document.addEventListener('click', handleDocumentClick, true);

  return () => {
    document.removeEventListener('click', handleDocumentClick, true);
    styleEl.remove();
    overlay.remove();
  };
}
