/* Edit the photo order and message here. Photos remain original, uncropped files. */
(() => {
  'use strict';
  const PHOTOS = [
    {file:'photo5.jpg', alt:'A saved birthday message, first part'},
    {file:'photo4.jpg', alt:'A saved birthday message, second part'},
    {file:'photo3.jpg', alt:'A saved birthday message, third part'},
    {file:'photo1.png', alt:'A saved birthday card'},
    {file:'photo2.png', alt:'A handmade birthday drawing and note'}
  ];
  
  const pages = [...document.querySelectorAll('.paper')].sort((a,b) => Number(a.querySelector('.page-number').textContent) - Number(b.querySelector('.page-number').textContent));
  PHOTOS.forEach((photo,index) => {
    const button = document.createElement('button');
    button.className = 'photo-frame';
    button.setAttribute('aria-label', `Enlarge ${photo.alt.toLowerCase()}`);
    const image = document.createElement('img');
    image.src = 'assets/' + photo.file; image.alt = photo.alt; image.className = 'memory-photo';
    const border = document.createElement('img');
    border.src = 'assets/frame.png'; border.alt = ''; border.className = 'red-frame';
    button.append(image,border);
    image.addEventListener('load', () => {
      const ratio = image.naturalWidth / image.naturalHeight;
      // Match the opening to the source aspect ratio; never crop the photo.
      const frameRatio = ratio * .686 / .8;
      button.style.width = `${Math.min(242, 327 * frameRatio)}px`;
      button.style.aspectRatio = String(frameRatio);
    });
    pages[index].classList.add('memory-page');
    pages[index].append(button);
    button.addEventListener('click', event => {event.stopPropagation(); openPhoto(button);});
  });
  function notePage(page, paragraphs) {
    const article = document.createElement('article'); article.className = 'journal-note';
    paragraphs.forEach((text,index) => { const p=document.createElement('p'); p.textContent=text; if(index===0 && text.startsWith('Dear')) p.className='salutation'; article.append(p); });
    page.append(article);
  }
  notePage(pages[5], NOTE); notePage(pages[6], ENDING);
  const rose = document.createElement('div'); rose.className='pressed-rose';
  rose.innerHTML='<img src="assets/rose.jpg" alt="A pressed rose"><span aria-hidden="true"></span>';
  pages[6].append(rose);
  // Original supplied artwork, displayed through small clipped SVG viewports.
  const decorations = [ ['kitty','bottom-left'], ['stars','top-right'], ['batman','bottom-right'], ['stars','bottom-left'], ['kitty','top-left'], ['stars','bottom-right'] ];
  decorations.forEach(([type,position],index) => {
    const art=document.createElement('div'); art.className=`page-drawing ${position}`; art.setAttribute('aria-hidden','true');
    if(type==='stars') art.innerHTML='<span class="little-star">✧</span><span class="tiny-star">✦</span>';
    else {
      const kitty = type==='kitty';
      const view = kitty ? '420 1035 222 257' : '706 858 216 329';
      const outline = kitty ? '455,1060 471,1044 525,1050 551,1039 580,1042 610,1061 613,1102 635,1124 637,1165 619,1193 617,1242 601,1278 572,1287 484,1282 458,1265 450,1210 433,1195 425,1166 435,1123 452,1104' : '718,928 728,881 739,870 751,882 761,908 864,909 877,872 888,865 899,878 912,966 915,1010 902,1047 919,1085 913,1132 901,1169 866,1181 823,1175 780,1181 744,1165 718,1167 715,1127 713,1089 728,1055 714,1020';
      art.innerHTML=`<svg viewBox="${view}" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="drawing-${index}"><polygon points="${outline}"/></clipPath></defs><image href="assets/drawings.png" width="1152" height="2048" clip-path="url(#drawing-${index})"/></svg>`;
    }
    pages[index].append(art);
  });

  const viewer=document.getElementById('photo-viewer');
  const zoom=document.getElementById('zoom-photo');
  const close=document.getElementById('close-photo');
  let origin=null, closing=false;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function motionFrom(rect,target) {
    return `translate(${rect.left-target.left}px,${rect.top-target.top}px) scale(${rect.width/target.width},${rect.height/target.height})`;
  }
  function openPhoto(button) {
    if(viewer.open) return;
    zoom.getAnimations().forEach(animation=>animation.cancel());
    origin=button; closing=false;
    const source=button.getBoundingClientRect();
    const copy=button.cloneNode(true); copy.removeAttribute('aria-label'); copy.tabIndex=-1; copy.classList.add('enlarged');
    const ratio=parseFloat(button.style.aspectRatio)||.7;
    const width=Math.min(innerWidth*.84, (innerHeight*.85)*ratio,720);
    zoom.style.width=`${width}px`; zoom.style.aspectRatio=String(ratio);
    copy.style.width='100%'; zoom.replaceChildren(copy);
    viewer.showModal(); viewer.classList.add('visible');
    const target=zoom.getBoundingClientRect();
    button.style.visibility='hidden';
    zoom.animate([{transform:motionFrom(source,target)},{transform:'none'}],{duration:reduced?0:580,easing:'cubic-bezier(.22,1,.36,1)'});
    close.focus();
  }
  async function closePhoto() {
    if(!viewer.open || closing) return; closing=true;
    viewer.classList.remove('visible');
    const target=zoom.getBoundingClientRect(); const dest=origin.getBoundingClientRect();
    await zoom.animate([{transform:'none'},{transform:motionFrom(dest,target)}],{duration:reduced?0:480,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'}).finished;
    viewer.close(); origin.style.visibility=''; origin.focus(); zoom.replaceChildren(); zoom.getAnimations().forEach(animation=>animation.cancel()); closing=false;
  }
  close.addEventListener('click',closePhoto);
  viewer.addEventListener('click',event=>{if(event.target===viewer)closePhoto();});
  viewer.addEventListener('cancel',event=>{event.preventDefault();closePhoto();});

  const audio=document.getElementById('audio');
  const play=document.getElementById('play-pause'), seek=document.getElementById('seek');
  const status=document.getElementById('audio-status');
  const tracks=[{file:'track1.mp3',title:'act ii date',artist:'4Batz'},{file:'track2.mp3',title:'315',artist:'Russ'}];
  let track=0;
  const time=value=>`${Math.floor((value||0)/60)}:${String(Math.floor((value||0)%60)).padStart(2,'0')}`;
  function loadTrack(index,autoplay=false) {
    track=(index+tracks.length)%tracks.length; audio.pause(); audio.src='assets/'+tracks[track].file;
    document.getElementById('track-title').textContent=tracks[track].title;
    document.getElementById('track-artist').textContent=tracks[track].artist;
    play.disabled=true; seek.disabled=true; status.textContent='';
    seek.value=0;document.getElementById('elapsed').textContent='0:00';
    if(autoplay)audio.play().catch(()=>{status.textContent='Tap play to listen.';});
  }
  document.getElementById('previous-track').addEventListener('click',()=>loadTrack(track-1,!audio.paused));
  document.getElementById('next-track').addEventListener('click',()=>loadTrack(track+1,!audio.paused));
  audio.addEventListener('ended',()=>loadTrack(track+1,true));
  audio.addEventListener('loadedmetadata',()=>{play.disabled=false;seek.disabled=!Number.isFinite(audio.duration);document.getElementById('total-time').textContent=time(audio.duration);});
  play.addEventListener('click',async()=>{if(audio.paused){try{await audio.play();}catch{status.textContent='Could not play this file. Choose another song.';}}else audio.pause();});
  const updatePlay=()=>{play.textContent=audio.paused?'▶':'Ⅱ';play.setAttribute('aria-label',audio.paused?'Play':'Pause');};
  audio.addEventListener('play',updatePlay);audio.addEventListener('pause',updatePlay);audio.addEventListener('ended',updatePlay);
  audio.addEventListener('timeupdate',()=>{document.getElementById('elapsed').textContent=time(audio.currentTime);seek.value=audio.duration?audio.currentTime/audio.duration*100:0;});
  seek.addEventListener('input',()=>{if(Number.isFinite(audio.duration))audio.currentTime=Number(seek.value)/100*audio.duration;});
  audio.addEventListener('error',()=>{status.textContent='This audio file could not be loaded.';play.disabled=true;seek.disabled=true;});
  loadTrack(0);
})();
