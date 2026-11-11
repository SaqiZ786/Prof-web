/* Profiniti Solutions - site script. Text is edited in index.html, not here. */

/* ===== HELPERS + SMALL SETUP (brand strip loop, year, mobile menu) ===== */
const $=(q,c=document)=>c.querySelector(q),$$=(q,c=document)=>[...c.querySelectorAll(q)];
const row=$('.row');row.innerHTML+=row.innerHTML;
$('#yr').textContent=new Date().getFullYear();
$('.burger').onclick=()=>$('.nav nav').classList.toggle('open');

/* ===== QUOTE FORM (validation only - sending not connected yet) ===== */
const qf=$('#qf');
if(qf){
 const sb=$('button[type=submit]',qf),subj=$('[name=subject]',qf),oi=$('[name=optin]',qf),fm=$('#fmsg');
 const say=(t,cls)=>{fm.className='mono note '+(cls||'');fm.textContent=t};
 // Submit stays disabled until a subject is chosen
 subj.addEventListener('change',()=>{sb.disabled=!subj.value});
 oi.addEventListener('change',()=>{if(oi.checked&&fm.classList.contains('err'))say('')});
 qf.addEventListener('submit',e=>{
  e.preventDefault();
  if(!subj.value){say('> Please select a subject.','err');return}
  if(!oi.checked){say('> Please tick the consent box above so we can contact you.','err');oi.focus();return}
  const d=Object.fromEntries(new FormData(qf));
  if(!d.name.trim()||!d.company.trim()){say('> Please enter your name and company.','err');return}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())){say('> Please enter a valid email address.','err');return}
  // TODO (email sending): connect the form here later.
  //   e.g. fetch('send.php',{method:'POST',body:new FormData(qf)}) on the server,
  //   or a form service. Until then nothing is sent - we only show a thank-you.
  say('> Thank you — we will be in touch.','ok');
  qf.reset();sb.disabled=true;
 });
}

/* ===== SECTION DOTS (built automatically from visible sections) ===== */
// section dots
const secs=$$('section[id]:not(.is-hidden),footer#contact'),dots=$('.dots'),names={top:'HOME',solutions:'SOLUTIONS',services:'SLA PLANS',process:'PROCESS',about:'ABOUT',industries:'INDUSTRIES',faq:'FAQ','quote-form':'QUOTE',contact:'CONTACT'};
secs.forEach(s=>{const a=document.createElement('a');a.href='#'+s.id;a.innerHTML=`<span>${names[s.id]||s.id}</span>`;dots.appendChild(a)});
const dotA=$$('a',dots);
const setDot=()=>{const y=innerHeight/2;let k=0;secs.forEach((s,i)=>{if(s.getBoundingClientRect().top<=y)k=i});dotA.forEach((a,i)=>a.classList.toggle('on',i===k))};
addEventListener('scroll',setDot,{passive:true});setDot();

/* ===== SMOOTH SCROLL + MENU LINKS ===== */
let lenis=null;
const go=(id)=>{const el=$(id);if(!el)return;const y=Math.min(el.getBoundingClientRect().top+window.scrollY,document.documentElement.scrollHeight-innerHeight);lenis?lenis.scrollTo(y,{duration:1.4,force:true}):window.scrollTo({top:y,behavior:'smooth'})};
$$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const h=a.getAttribute('href');if(h.length>1){e.preventDefault();$('.nav nav').classList.remove('open');go(h)}}));

/* ===== SOLUTIONS TABS ===== */
const hasG=window.gsap&&window.ScrollTrigger;
// tabs: click handler (vertical/mobile mode)
const tb=$$('.tabs button'),pn=$$('.panel');
const act=i=>{tb.forEach((x,j)=>x.classList.toggle('active',j===i));};
tb.forEach((b,i)=>b.onclick=()=>{if(document.documentElement.classList.contains('hz')&&window._solST){const st=window._solST;lenis?lenis.scrollTo(st.start+(st.end-st.start)*i/(pn.length-1)):scrollTo(0,st.start+(st.end-st.start)*i/(pn.length-1));}else{act(i);pn.forEach((p,j)=>p.classList.toggle('active',j===i))}});

/* ===== SCROLL ANIMATIONS (GSAP). Side-scroll only on screens 768px+ ===== */
if(!hasG){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.12});$$('.reveal').forEach(el=>io.observe(el));}
else{
 gsap.registerPlugin(ScrollTrigger);
 if(window.Lenis){lenis=new Lenis({duration:1.2,smoothWheel:true});lenis.on('scroll',()=>{ScrollTrigger.update();setDot()});gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0);}
 // reveals with alternating direction for vertical sections
 $$('.reveal').forEach(el=>{if(el.closest('.hs'))return;el.classList.add('in');const s=el.closest('section');const dir=s&&secs.indexOf(s)%2?60:-60;
  gsap.fromTo(el,{opacity:0,x:dir,y:30},{opacity:1,x:0,y:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%'}})});
 const mm=gsap.matchMedia();
 mm.add('(min-width:768px)',()=>{
  document.documentElement.classList.add('hz');
  $$('.hs').forEach(sec=>{
   const track=$('.htrack',sec),items=[...track.children];
   $$('.hs .reveal').forEach(e=>e.classList.add('in'));
   const prog=document.createElement('div');prog.className='hprog';prog.innerHTML='<i></i>';track.after(prog);
   const dist=()=>Math.max(0,track.scrollWidth-(innerWidth-track.getBoundingClientRect().left+gsap.getProperty(track,'x'))+60);
   const tw=gsap.to(track,{x:()=>-dist(),ease:'none',scrollTrigger:{trigger:sec,pin:true,scrub:1,start:'top top',end:()=>'+='+dist(),invalidateOnRefresh:true,anticipatePin:1,
     snap:{snapTo:1/(items.length-1),duration:{min:.2,max:.6},ease:'power2.inOut',delay:.05},
     onUpdate:s=>{$('i',prog).style.width=(s.progress*100)+'%';if(sec.id==='solutions')act(Math.round(s.progress*(items.length-1)))}}});
   if(sec.id==='solutions')window._solST=tw.scrollTrigger;
   // items fade/scale in as they enter horizontally
   items.forEach(it=>gsap.from(it,{opacity:.25,scale:.94,ease:'none',scrollTrigger:{trigger:it,containerAnimation:tw,start:'left 95%',end:'left 55%',scrub:true}}));
  });
  return()=>{document.documentElement.classList.remove('hz');$$('.hprog').forEach(p=>p.remove());window._solST=null};
 });
 // hero parallax
 gsap.to('#hero-dots',{yPercent:15,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
 gsap.to('.hero h1',{x:-120,opacity:.2,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
 addEventListener('load',()=>ScrollTrigger.refresh());
}
