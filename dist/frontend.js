var D="lumi_avatar_zoom_prefs";function C(){try{let p=localStorage.getItem(D);if(!p)return null;let o=JSON.parse(p);if(typeof o.scale=="number"&&typeof o.posX=="number"&&typeof o.posY=="number")return{scale:Math.min(8,Math.max(.35,o.scale)),posX:Math.min(window.innerWidth-60,Math.max(-200,o.posX)),posY:Math.min(window.innerHeight-60,Math.max(0,o.posY))}}catch{}return null}function R(p,o,h){try{localStorage.setItem(D,JSON.stringify({scale:p,posX:o,posY:h}))}catch{}}function B(){let p=document.createElement("style");p.id="lumi-avatar-zoom-janitor-styles",p.textContent=`
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
      width: 300px;
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
  `,document.head.appendChild(p);let o=document.createElement("div");o.className="_enlargedAvatarOverlay_4evg7_233",o.setAttribute("role","region"),o.setAttribute("aria-label","Enlarged Avatar");let h=document.createElement("div");h.className="_enlargedAvatarTiltInner";let u=document.createElement("img");u.className="_enlargedAvatarImage_4evg7_261",u.alt="Enlarged Avatar",u.draggable=!1;let m=document.createElement("button");m.type="button",m.className="_enlargedAvatarClose_4evg7_268",m.setAttribute("aria-label","Close enlarged avatar"),m.innerHTML=`
    <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"></path>
    </svg>
  `,h.appendChild(u),h.appendChild(m),o.appendChild(h),document.body.appendChild(o);let s=C(),Y=Math.max(20,window.innerWidth-300-40),A=80,t={scale:s?s.scale:1,posX:s?s.posX:Y,posY:s?s.posY:A,rotation:0,targetScale:s?s.scale:1,targetPosX:s?s.posX:Y,targetPosY:s?s.posY:A,targetRotation:0,zoomAnchorFocalX:0,zoomAnchorFocalY:0,zoomAnchorBasePosX:s?s.posX:Y,zoomAnchorBasePosY:s?s.posY:A,zoomAnchorBaseScale:s?s.scale:1,isZooming:!1,isDragging:!1,isPinching:!1,startX:0,startY:0,initialDistance:0,lastPinchAngle:0,userRotated:!1,pinchStartScale:1,pinchStartPosX:100,pinchStartPosY:100,pinchFocalX:0,pinchFocalY:0},P=!1,x=performance.now();function f(){o.style.transform=`translateX(${t.posX.toFixed(3)}px) translateY(${t.posY.toFixed(3)}px) scale(${t.scale.toFixed(4)})`,h.style.transform=`rotate(${t.rotation.toFixed(3)}deg)`}function v(){if(P)return;P=!0,x=performance.now();function e(a){let n=Math.min((a-x)/1e3,.04);if(x=a,t.isZooming){let r=t.targetScale-t.scale;if(Math.abs(r)>4e-4){t.scale+=r*Math.min(1,22*n);let g=t.scale/t.zoomAnchorBaseScale;t.posX=t.zoomAnchorFocalX-(t.zoomAnchorFocalX-t.zoomAnchorBasePosX)*g,t.posY=t.zoomAnchorFocalY-(t.zoomAnchorFocalY-t.zoomAnchorBasePosY)*g,t.targetPosX=t.posX,t.targetPosY=t.posY}else{t.scale=t.targetScale;let g=t.scale/t.zoomAnchorBaseScale;t.posX=t.zoomAnchorFocalX-(t.zoomAnchorFocalX-t.zoomAnchorBasePosX)*g,t.posY=t.zoomAnchorFocalY-(t.zoomAnchorFocalY-t.zoomAnchorBasePosY)*g,t.targetPosX=t.posX,t.targetPosY=t.posY,t.isZooming=!1}}else if(!t.isPinching){let r=t.targetPosX-t.posX,g=t.targetPosY-t.posY,d=Math.hypot(r,g);if(d>.08){let S=Math.min(d*15,1400)*n;S>=d?(t.posX=t.targetPosX,t.posY=t.targetPosY):(t.posX+=r/d*S,t.posY+=g/d*S)}else t.posX=t.targetPosX,t.posY=t.targetPosY}let l=t.targetRotation-t.rotation;if(Math.abs(l)>.02){let b=Math.min(Math.abs(l)*9,420)*n;b>=Math.abs(l)?t.rotation=t.targetRotation:t.rotation+=Math.sign(l)*b}else t.rotation=t.targetRotation;if(f(),!t.isDragging&&!t.isPinching&&!t.isZooming&&Math.hypot(t.targetPosX-t.posX,t.targetPosY-t.posY)<.15&&Math.abs(t.targetScale-t.scale)<8e-4&&Math.abs(t.targetRotation-t.rotation)<.05){t.posX=t.targetPosX,t.posY=t.targetPosY,t.scale=t.targetScale,t.rotation=t.targetRotation,f(),P=!1;return}requestAnimationFrame(e)}requestAnimationFrame(e)}function _(e,a){return Math.hypot(e.x-a.x,e.y-a.y)}function y(e,a){return{x:(e.x+a.x)/2,y:(e.y+a.y)/2}}function E(e,a){return Math.atan2(a.y-e.y,a.x-e.x)}function X(e,a,n,l=!0){let i=Math.min(8,Math.max(.35,e));if(!(i===t.targetScale&&!t.isZooming))if(t.zoomAnchorFocalX=a,t.zoomAnchorFocalY=n,t.zoomAnchorBasePosX=t.posX,t.zoomAnchorBasePosY=t.posY,t.zoomAnchorBaseScale=t.scale,t.targetScale=i,l)t.isZooming=!0,v();else{t.scale=i;let r=t.scale/t.zoomAnchorBaseScale;t.posX=a-(a-t.zoomAnchorBasePosX)*r,t.posY=n-(n-t.zoomAnchorBasePosY)*r,t.targetPosX=t.posX,t.targetPosY=t.posY,t.isZooming=!1,f()}}function I(e,a,n){let l=e.replace(/[?&](width|height|thumb|w|h|size)=\d+/g,"");u.src=l;let i=C();if(i)t.scale=i.scale,t.targetScale=i.scale,t.posX=i.posX,t.targetPosX=i.posX,t.posY=i.posY,t.targetPosY=i.posY;else{let r=a?Math.min(window.innerWidth-300-20,a+20):window.innerWidth-300-40,g=n?Math.min(window.innerHeight-360,Math.max(20,n-60)):80;t.scale=1,t.targetScale=1,t.posX=Math.max(10,r),t.posY=Math.max(10,g),t.targetPosX=t.posX,t.targetPosY=t.posY}t.rotation=0,t.targetRotation=0,t.isZooming=!1,o.style.transition="none",o.style.transform=`translateX(${t.posX.toFixed(3)}px) translateY(${(t.posY+24).toFixed(3)}px) scale(${(t.scale*.94).toFixed(4)})`,h.style.transform="rotate(0deg)",o.classList.remove("animating","visible"),o.offsetWidth,o.classList.add("animating"),o.classList.add("visible"),f(),setTimeout(()=>{o.classList.remove("animating")},220)}function M(){R(t.targetScale,t.targetPosX,t.targetPosY),o.classList.add("animating"),o.style.transform=`translateX(${t.posX.toFixed(3)}px) translateY(${(t.posY+20).toFixed(3)}px) scale(${(t.scale*.94).toFixed(4)})`,o.classList.remove("visible"),setTimeout(()=>{o.classList.contains("visible")||(u.src="",o.classList.remove("animating"))},200)}o.addEventListener("wheel",e=>{if(e.preventDefault(),e.stopPropagation(),e.ctrlKey){let a=Math.exp(-e.deltaY*.012),n=t.scale*a;X(n,e.clientX,e.clientY,!1)}else{let a=e.deltaY<0?1.16:.8620689655172414,n=t.targetScale*a;X(n,e.clientX,e.clientY,!0)}},{passive:!1});let c=new Map;o.addEventListener("pointerdown",e=>{if(!(e.target===m||m.contains(e.target))){if(c.set(e.pointerId,{x:e.clientX,y:e.clientY}),o.setPointerCapture(e.pointerId),o.classList.remove("animating"),o.style.transition="none",t.isZooming=!1,c.size===1)t.isDragging=!0,t.isPinching=!1,t.startX=e.clientX-t.posX,t.startY=e.clientY-t.posY,t.targetPosX=t.posX,t.targetPosY=t.posY,o.classList.add("dragging"),v();else if(c.size===2){t.isDragging=!1,t.isPinching=!0,o.classList.remove("dragging");let a=Array.from(c.values());t.initialDistance=_(a[0],a[1]),t.lastPinchAngle=E(a[0],a[1]),t.pinchStartScale=t.scale,t.pinchStartPosX=t.posX,t.pinchStartPosY=t.posY;let n=y(a[0],a[1]);t.pinchFocalX=n.x,t.pinchFocalY=n.y}}}),o.addEventListener("pointermove",e=>{if(c.has(e.pointerId)){if(c.set(e.pointerId,{x:e.clientX,y:e.clientY}),t.isPinching&&c.size===2){let a=Array.from(c.values()),n=_(a[0],a[1]),l=E(a[0],a[1]),i=y(a[0],a[1]),r=(l-t.lastPinchAngle)*(180/Math.PI);for(;r>180;)r-=360;for(;r<-180;)r+=360;if(t.lastPinchAngle=l,Math.abs(r)>.01&&(t.targetRotation+=r,t.userRotated=!0,v()),t.initialDistance>0){let g=n/t.initialDistance,d=Math.min(8,Math.max(.35,t.pinchStartScale*g)),b=d/t.pinchStartScale,w=i.x-t.pinchFocalX,F=i.y-t.pinchFocalY;t.scale=d,t.targetScale=d,t.posX=t.pinchFocalX-(t.pinchFocalX-t.pinchStartPosX)*b+w,t.posY=t.pinchFocalY-(t.pinchFocalY-t.pinchStartPosY)*b+F,t.targetPosX=t.posX,t.targetPosY=t.posY}f()}else if(t.isDragging&&c.size===1){if(t.targetPosX=e.clientX-t.startX,t.targetPosY=e.clientY-t.startY,!t.userRotated)if(e.shiftKey){let a=o.getBoundingClientRect(),n=a.left+a.width/2,l=a.top+a.height/2,i=Math.atan2(e.clientY-l,e.clientX-n);t.targetRotation=i*(180/Math.PI)}else{let a=t.targetPosX-t.posX;t.targetRotation=a*.12}v()}}});let L=e=>{c.delete(e.pointerId);try{o.releasePointerCapture(e.pointerId)}catch{}if(c.size===0)t.isDragging=!1,t.isPinching=!1,o.classList.remove("dragging"),t.rotation=(t.rotation%360+540)%360-180,t.targetRotation=0,t.userRotated=!1,v(),R(t.targetScale,t.targetPosX,t.targetPosY);else if(c.size===1){t.isPinching=!1,t.isDragging=!0,o.classList.add("dragging");let a=Array.from(c.values())[0];t.startX=a.x-t.posX,t.startY=a.y-t.posY}};o.addEventListener("pointerup",L),o.addEventListener("pointercancel",L),o.addEventListener("dblclick",e=>{e.target===m||m.contains(e.target)||(e.preventDefault(),t.scale>1.25?X(1,e.clientX,e.clientY,!0):X(2,e.clientX,e.clientY,!0))}),m.addEventListener("click",e=>{e.stopPropagation(),M()}),window.addEventListener("keydown",e=>{e.key==="Escape"&&o.classList.contains("visible")&&M()});let T=['[data-component*="Message"] [class*="_avatar_" i] img','[class*="_avatar_" i] img','[class*="avatar" i] img','img[class*="avatar" i]','[data-component="CharacterCard"] img','[data-component="GroupChatMemberBar"] img'].join(", "),z=e=>{let a=e.target;if(!a||o.contains(a))return;let n=a.closest(T)||(a.tagName==="IMG"&&a.closest('[class*="_avatar_" i], [class*="avatar" i]')?a:null);n&&n.src&&(e.preventDefault(),e.stopPropagation(),I(n.src,e.clientX,e.clientY))};return document.addEventListener("click",z,!0),()=>{document.removeEventListener("click",z,!0),p.remove(),o.remove()}}export{B as setup};
