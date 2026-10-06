interface FloatingState {
  scale: number;
  posX: number;
  posY: number;
  rotation: number;
  targetScale: number;
  targetPosX: number;
  targetPosY: number;
  targetRotation: number;
  zoomAnchorFocalX: number;
  zoomAnchorFocalY: number;
  zoomAnchorBasePosX: number;
  zoomAnchorBasePosY: number;
  zoomAnchorBaseScale: number;
  isZooming: boolean;
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
    zoomAnchorFocalX: 0,
    zoomAnchorFocalY: 0,
    zoomAnchorBasePosX: saved ? saved.posX : defaultInitialX,
    zoomAnchorBasePosY: saved ? saved.posY : defaultInitialY,
    zoomAnchorBaseScale: saved ? saved.scale : 1,
    isZooming: false,
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

  function renderTransform() {
    overlay.style.transform = `translateX(${state.posX.toFixed(3)}px) translateY(${state.posY.toFixed(3)}px) scale(${state.scale.toFixed(4)})`;
    tiltWrapper.style.transform = `rotate(${state.rotation.toFixed(3)}deg)`;
  }

  // Unified Physics Engine:
  // - Focal zoom interpolation is mathematically locked: position is derived continuously from scale,
  //   preventing any focal drift, mismatch, or stuttering across any scale threshold!
  // - Drag maintains subtle resistance and governed velocity
  // - Rotation smoothly snaps back to 0° upon release
  function runPhysicsLoop() {
    if (animLoopRunning) return;
    animLoopRunning = true;
    lastFrameTime = performance.now();

    function step(now: number) {
      const dt = Math.min((now - lastFrameTime) / 1000, 0.04);
      lastFrameTime = now;

      // 1. Zoom Interpolation (Butter-smooth, zero-stutter focal tracking)
      if (state.isZooming) {
        const dScale = state.targetScale - state.scale;
        if (Math.abs(dScale) > 0.0004) {
          // Continuous smooth exponential approach (22.0 rate for snappy yet organic zoom)
          state.scale += dScale * Math.min(1, 22.0 * dt);
          // Derived position: exact focal invariant formula at every sub-frame
          const ratio = state.scale / state.zoomAnchorBaseScale;
          state.posX = state.zoomAnchorFocalX - (state.zoomAnchorFocalX - state.zoomAnchorBasePosX) * ratio;
          state.posY = state.zoomAnchorFocalY - (state.zoomAnchorFocalY - state.zoomAnchorBasePosY) * ratio;
          state.targetPosX = state.posX;
          state.targetPosY = state.posY;
        } else {
          state.scale = state.targetScale;
          const ratio = state.scale / state.zoomAnchorBaseScale;
          state.posX = state.zoomAnchorFocalX - (state.zoomAnchorFocalX - state.zoomAnchorBasePosX) * ratio;
          state.posY = state.zoomAnchorFocalY - (state.zoomAnchorFocalY - state.zoomAnchorBasePosY) * ratio;
          state.targetPosX = state.posX;
          state.targetPosY = state.posY;
          state.isZooming = false;
        }
      } else if (!state.isPinching) {
        // 2. Drag Translation Physics (When not zooming)
        const dX = state.targetPosX - state.posX;
        const dY = state.targetPosY - state.posY;
        const dist = Math.hypot(dX, dY);

        if (dist > 0.08) {
          const MAX_SPEED = 1400; // px/sec: regulated velocity ceiling
          const CHASE_RATE = 15.0; // Natural elastic pull rate

          const desiredSpeed = Math.min(dist * CHASE_RATE, MAX_SPEED);
          const stepDist = desiredSpeed * dt;

          if (stepDist >= dist) {
            state.posX = state.targetPosX;
            state.posY = state.targetPosY;
          } else {
            state.posX += (dX / dist) * stepDist;
            state.posY += (dY / dist) * stepDist;
          }
        } else {
          state.posX = state.targetPosX;
          state.posY = state.targetPosY;
        }
      }

      // 3. Rotation Physics (Full Rotation + Resistance + Smooth Snap Back)
      const dRot = state.targetRotation - state.rotation;
      if (Math.abs(dRot) > 0.02) {
        const MAX_ROT_SPEED = 420; // deg/sec: top speed once fully ramped
        const ROT_RATE = 9.0; // gentle start — speed ramps up as the twist gap grows

        const desiredRotSpeed = Math.min(Math.abs(dRot) * ROT_RATE, MAX_ROT_SPEED);
        const rotStep = desiredRotSpeed * dt;

        if (rotStep >= Math.abs(dRot)) {
          state.rotation = state.targetRotation;
        } else {
          state.rotation += Math.sign(dRot) * rotStep;
        }
      } else {
        state.rotation = state.targetRotation;
      }

      renderTransform();

      // Check if settled
      const isSettled = !state.isDragging && !state.isPinching && !state.isZooming &&
        Math.hypot(state.targetPosX - state.posX, state.targetPosY - state.posY) < 0.15 &&
        Math.abs(state.targetScale - state.scale) < 0.0008 &&
        Math.abs(state.targetRotation - state.rotation) < 0.05;

      if (isSettled) {
        state.posX = state.targetPosX;
        state.posY = state.targetPosY;
        state.scale = state.targetScale;
        state.rotation = state.targetRotation;
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

  // Pure focal zoom: anchors focal point continuously without stutter
  function zoomTowards(newScale: number, focalX: number, focalY: number, smooth = true) {
    const clampedScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, newScale));
    if (clampedScale === state.targetScale && !state.isZooming) return;

    // Anchor focal snapshot
    state.zoomAnchorFocalX = focalX;
    state.zoomAnchorFocalY = focalY;
    state.zoomAnchorBasePosX = state.posX;
    state.zoomAnchorBasePosY = state.posY;
    state.zoomAnchorBaseScale = state.scale;
    state.targetScale = clampedScale;

    if (!smooth) {
      state.scale = clampedScale;
      const ratio = state.scale / state.zoomAnchorBaseScale;
      state.posX = focalX - (focalX - state.zoomAnchorBasePosX) * ratio;
      state.posY = focalY - (focalY - state.zoomAnchorBasePosY) * ratio;
      state.targetPosX = state.posX;
      state.targetPosY = state.posY;
      state.isZooming = false;
      renderTransform();
    } else {
      state.isZooming = true;
      runPhysicsLoop();
    }
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
    state.isZooming = false;

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
      // High-precision continuous trackpad pinch
      const pinchZoomFactor = Math.exp(-e.deltaY * 0.012);
      const nextScale = state.scale * pinchZoomFactor;
      zoomTowards(nextScale, e.clientX, e.clientY, false);
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
    state.isZooming = false;

    if (activePointers.size === 1) {
      state.isDragging = true;
      state.isPinching = false;
      state.startX = e.clientX - state.posX;
      state.startY = e.clientY - state.posY;
      state.targetPosX = state.posX;
      state.targetPosY = state.posY;

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

      // 1. Two-finger twist: incremental free rotation with governed ramp-up.
      //    Small twist = slow spin; the further the fingers twist ahead of the
      //    card, the faster it rotates, capped at MAX_ROT_SPEED (constant speed
      //    beyond that) — the same resistance feel as the drag physics.
      let deltaDeg = (currentAngle - state.lastPinchAngle) * (180 / Math.PI);
      while (deltaDeg > 180) deltaDeg -= 360;
      while (deltaDeg < -180) deltaDeg += 360;
      state.lastPinchAngle = currentAngle;
      if (Math.abs(deltaDeg) > 0.01) {
        state.targetRotation += deltaDeg;
        state.userRotated = true;
        // Rotation chases the target in the physics loop (ramping speed),
        // instead of snapping 1:1 to the finger angle.
        runPhysicsLoop();
      }

      // 2. Continuous two-finger pinch zoom: perfectly linear and seamless (no deadzone jumps!)
      if (state.initialDistance > 0) {
        const distRatio = currentDist / state.initialDistance;
        const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, state.pinchStartScale * distRatio));
        const ratio = nextScale / state.pinchStartScale;

        const panDeltaX = currentCenter.x - state.pinchFocalX;
        const panDeltaY = currentCenter.y - state.pinchFocalY;

        state.scale = nextScale;
        state.targetScale = nextScale;
        state.posX = state.pinchFocalX - (state.pinchFocalX - state.pinchStartPosX) * ratio + panDeltaX;
        state.posY = state.pinchFocalY - (state.pinchFocalY - state.pinchStartPosY) * ratio + panDeltaY;
        state.targetPosX = state.posX;
        state.targetPosY = state.posY;
      }

      renderTransform();
    } else if (state.isDragging && activePointers.size === 1) {
      // Cursor moves ahead: sets target position
      state.targetPosX = e.clientX - state.startX;
      state.targetPosY = e.clientY - state.startY;

      // When dragging with mouse/pointer, holding Shift allows free manual rotation around center,
      // or standard drag tilts dynamically into the movement
      // If the user has twisted the card, that rotation is HELD while the finger
      // stays down — no snap-back and no tilt override until a full release.
      if (state.userRotated) {
        // keep targetRotation exactly as twisted
      } else if (e.shiftKey) {
        const rect = overlay.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const currentAngleRad = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        state.targetRotation = currentAngleRad * (180 / Math.PI);
      } else {
        const pullDeltaX = state.targetPosX - state.posX;
        state.targetRotation = pullDeltaX * 0.12; // Natural dynamic tilt into drag
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
