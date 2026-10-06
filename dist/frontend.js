var z="lumi_avatar_zoom_prefs";function k(){try{let g=localStorage.getItem(z);if(!g)return null;let n=JSON.parse(g);if(typeof n.scale=="number"&&typeof n.posX=="number"&&typeof n.posY=="number")return{scale:Math.min(8,Math.max(.35,n.scale)),posX:Math.min(window.innerWidth-60,Math.max(-200,n.posX)),posY:Math.min(window.innerHeight-60,Math.max(0,n.posY))}}catch{}return null}function N(g,n,d){try{localStorage.setItem(z,JSON.stringify({scale:g,posX:n,posY:d}))}catch{}}function H(){let g=document.createElement("style");g.id="lumi-avatar-zoom-janitor-styles",g.textContent=`
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
  `,document.head.appendChild(g);let n=document.createElement("div");n.className="_enlargedAvatarOverlay_4evg7_233",n.setAttribute("role","region"),n.setAttribute("aria-label","Enlarged Avatar");let d=document.createElement("div");d.className="_enlargedAvatarTiltInner";let u=document.createElement("img");u.className="_enlargedAvatarImage_4evg7_261",u.alt="Enlarged Avatar",u.draggable=!1;let p=document.createElement("button");p.type="button",p.className="_enlargedAvatarClose_4evg7_268",p.setAttribute("aria-label","Close enlarged avatar"),p.innerHTML=`
    <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"></path>
    </svg>
  `,d.appendChild(u),d.appendChild(p),n.appendChild(d),document.body.appendChild(n);let l=k(),M=Math.max(20,window.innerWidth-300-40),L=80,t={scale:l?l.scale:1,posX:l?l.posX:M,posY:l?l.posY:L,rotation:0,targetScale:l?l.scale:1,targetPosX:l?l.posX:M,targetPosY:l?l.posY:L,targetRotation:0,isDragging:!1,isPinching:!1,startX:0,startY:0,initialDistance:0,lastPinchAngle:0,pinchStartScale:1,pinchStartPosX:100,pinchStartPosY:100,pinchFocalX:0,pinchFocalY:0},P=!1,X=performance.now(),v=350,f=22,x=1,r={x:0,y:0,scale:0,rot:0};function Y(){n.style.transform=`translateX(${t.posX.toFixed(3)}px) translateY(${t.posY.toFixed(3)}px) scale(${t.scale.toFixed(4)})`,d.style.transform=`rotate(${t.rotation.toFixed(3)}deg)`}function h(){if(P)return;P=!0,X=performance.now();function e(a){let o=Math.min((a-X)/1e3,.04);X=a;let m=4,s=o/m;for(let b=0;b<m;b++){let y=v*(t.targetPosX-t.posX)-f*r.x,A=v*(t.targetPosY-t.posY)-f*r.y;r.x+=y/x*s,r.y+=A/x*s,t.posX+=r.x*s,t.posY+=r.y*s;let E=v*(t.targetRotation-t.rotation)-f*r.rot;r.rot+=E/x*s,t.rotation+=r.rot*s;let W=v*(t.targetScale-t.scale)-f*r.scale;r.scale+=W/x*s,t.scale+=r.scale*s}Y();let c=Math.hypot(r.x,r.y);if(Math.hypot(t.targetPosX-t.posX,t.targetPosY-t.posY)<.1&&Math.abs(t.targetRotation-t.rotation)<.05&&Math.abs(t.targetScale-t.scale)<6e-4&&c<8&&Math.abs(r.rot)<25&&Math.abs(r.scale)<.02){t.posX=t.targetPosX,t.posY=t.targetPosY,t.scale=t.targetScale,t.rotation=t.targetRotation,r.x=0,r.y=0,r.rot=0,r.scale=0,Y(),P=!1;return}requestAnimationFrame(e)}requestAnimationFrame(e)}function w(e,a){return Math.hypot(e.x-a.x,e.y-a.y)}function I(e,a){return{x:(e.x+a.x)/2,y:(e.y+a.y)/2}}function F(e,a){return Math.atan2(a.y-e.y,a.x-e.x)}function S(e,a,o,m=!0){let s=Math.min(8,Math.max(.35,e));if(s===t.targetScale)return;let c=s/t.targetScale;t.targetPosX=a-(a-t.targetPosX)*c,t.targetPosY=o-(o-t.targetPosY)*c,t.targetScale=s,h()}function O(e,a,o){let m=e.replace(/[?&](width|height|thumb|w|h|size)=\d+/g,"");u.src=m;let s=k();if(s)t.scale=s.scale,t.targetScale=s.scale,t.posX=s.posX,t.targetPosX=s.posX,t.posY=s.posY,t.targetPosY=s.posY;else{let c=a?Math.min(window.innerWidth-300-20,a+20):window.innerWidth-300-40,_=o?Math.min(window.innerHeight-360,Math.max(20,o-60)):80;t.scale=1,t.targetScale=1,t.posX=Math.max(10,c),t.posY=Math.max(10,_),t.targetPosX=t.posX,t.targetPosY=t.posY}t.rotation=0,t.targetRotation=0,r.x=0,r.y=0,r.rot=0,r.scale=0,n.style.transition="none",n.style.transform=`translateX(${t.posX.toFixed(3)}px) translateY(${(t.posY+24).toFixed(3)}px) scale(${(t.scale*.94).toFixed(4)})`,d.style.transform="rotate(0deg)",n.classList.remove("animating","visible"),n.offsetWidth,n.classList.add("animating"),n.classList.add("visible"),Y(),setTimeout(()=>{n.classList.remove("animating")},220)}function C(){N(t.targetScale,t.targetPosX,t.targetPosY),n.classList.add("animating"),n.style.transform=`translateX(${t.posX.toFixed(3)}px) translateY(${(t.posY+20).toFixed(3)}px) scale(${(t.scale*.94).toFixed(4)})`,n.classList.remove("visible"),setTimeout(()=>{n.classList.contains("visible")||(u.src="",n.classList.remove("animating"))},200)}n.addEventListener("wheel",e=>{if(e.preventDefault(),e.stopPropagation(),e.ctrlKey){let a=Math.exp(-e.deltaY*.012),o=t.targetScale*a;S(o,e.clientX,e.clientY)}else{let a=e.deltaY<0?1.16:.8620689655172414,o=t.targetScale*a;S(o,e.clientX,e.clientY,!0)}},{passive:!1});let i=new Map;n.addEventListener("pointerdown",e=>{if(!(e.target===p||p.contains(e.target))){if(i.set(e.pointerId,{x:e.clientX,y:e.clientY}),n.setPointerCapture(e.pointerId),n.classList.remove("animating"),n.style.transition="none",i.size===1)t.isDragging=!0,t.isPinching=!1,t.startX=e.clientX-t.posX,t.startY=e.clientY-t.posY,n.classList.add("dragging"),h();else if(i.size===2){t.isDragging=!1,t.isPinching=!0,n.classList.remove("dragging");let a=Array.from(i.values());t.initialDistance=w(a[0],a[1]),t.lastPinchAngle=F(a[0],a[1]),t.pinchStartScale=t.scale,t.pinchStartPosX=t.posX,t.pinchStartPosY=t.posY;let o=I(a[0],a[1]);t.pinchFocalX=o.x,t.pinchFocalY=o.y}}}),n.addEventListener("pointermove",e=>{if(i.has(e.pointerId))if(i.set(e.pointerId,{x:e.clientX,y:e.clientY}),t.isPinching&&i.size===2){let a=Array.from(i.values()),o=w(a[0],a[1]),m=F(a[0],a[1]),s=I(a[0],a[1]),c=(m-t.lastPinchAngle)*(180/Math.PI);for(;c>180;)c-=360;for(;c<-180;)c+=360;if(t.lastPinchAngle=m,Math.abs(c)>.01&&(t.targetRotation=c),t.initialDistance>0){let _=o/t.initialDistance,b=Math.min(8,Math.max(.35,t.pinchStartScale*_)),y=b/t.pinchStartScale,A=s.x-t.pinchFocalX,E=s.y-t.pinchFocalY;t.targetScale=b,t.targetPosX=t.pinchFocalX-(t.pinchFocalX-t.pinchStartPosX)*y+A,t.targetPosY=t.pinchFocalY-(t.pinchFocalY-t.pinchStartPosY)*y+E}h()}else t.isDragging&&i.size===1&&(t.targetPosX=e.clientX-t.startX,t.targetPosY=e.clientY-t.startY,h())});let D=e=>{i.delete(e.pointerId);try{n.releasePointerCapture(e.pointerId)}catch{}if(i.size===0)t.isDragging=!1,t.isPinching=!1,n.classList.remove("dragging"),h(),N(t.targetScale,t.targetPosX,t.targetPosY);else if(i.size===1){t.isPinching=!1,t.isDragging=!0,n.classList.add("dragging");let a=Array.from(i.values())[0];t.startX=a.x-t.posX,t.startY=a.y-t.posY}};n.addEventListener("pointerup",D),n.addEventListener("pointercancel",D),n.addEventListener("dblclick",e=>{e.target===p||p.contains(e.target)||(e.preventDefault(),t.scale>1.25?S(1,e.clientX,e.clientY,!0):S(2,e.clientX,e.clientY,!0))}),p.addEventListener("click",e=>{e.stopPropagation(),C()}),window.addEventListener("keydown",e=>{e.key==="Escape"&&n.classList.contains("visible")&&C()});let R=['[data-component*="Message"] [class*="_avatar_" i] img','[class*="_avatar_" i] img','[class*="avatar" i] img','img[class*="avatar" i]','[data-component="CharacterCard"] img','[data-component="GroupChatMemberBar"] img'].join(", "),T=e=>{let a=e.target;if(!a||n.contains(a))return;let o=a.closest(R)||(a.tagName==="IMG"&&a.closest('[class*="_avatar_" i], [class*="avatar" i]')?a:null);o&&o.src&&(e.preventDefault(),e.stopPropagation(),O(o.src,e.clientX,e.clientY))};return document.addEventListener("click",T,!0),()=>{document.removeEventListener("click",T,!0),g.remove(),n.remove()}}export{H as setup};
