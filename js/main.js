(()=>{
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* RNF-003: sanitización de entradas (se limpia al guardar y se escapa al mostrar) */
const clean=s=>String(s??'').replace(/<[^>]*>?/g,'').replace(/[<>]/g,'').trim().slice(0,500);
const norm=t=>String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 
/* ===== TEMA CLARO / OSCURO (RF-007, RN-004, RNF-004) ===== */
const root=document.documentElement;
const paint=t=>{root.dataset.theme=t;document.querySelectorAll('#theme i').forEach(i=>i.className='fa-solid '+(t==='dark'?'fa-sun':'fa-moon'))};
paint(localStorage.getItem('uf_theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'));
const bindTheme=()=>{const b=$('#theme');if(!b)return;paint(root.dataset.theme);b.onclick=()=>{const t=root.dataset.theme==='dark'?'light':'dark';localStorage.setItem('uf_theme',t);paint(t)}};
 
/* ===== DATOS ===== */
const PRENDAS=['Overol','Chaqueta','Bata','Pantalón','Botas','Camisa'],PROGS=['ADSO','Salud','Mantenimiento','General'];
const seed={
users:[],
empresas:[
{id:1,nombre:'Textiles Jhon',slogan:'Calidad y estilo',ubicacion:'Bogotá',whatsapp:'3001110001',telefono:'300 111 0001',entrega:5},
{id:2,nombre:'Dotaciones SENA',slogan:'Tu formación, nuestra prioridad',ubicacion:'Bogotá - Salitre',whatsapp:'3001110002',telefono:'300 111 0002',entrega:7},
{id:3,nombre:'Confecciones Gamarra',slogan:'Uniformes que trabajan contigo',ubicacion:'Bogotá - Chapinero',whatsapp:'3001110003',telefono:'300 111 0003',entrega:4},
{id:4,nombre:'Uniformes del Norte',slogan:'Vístete para el éxito',ubicacion:'Bogotá - Usaquén',whatsapp:'3001110004',telefono:'300 111 0004',entrega:6}],
uniformes:[
{id:1,empresaId:1,prenda:'Overol',programa:'Mantenimiento',precio:90000,tela:'Drill'},
{id:2,empresaId:1,prenda:'Chaqueta',programa:'ADSO',precio:70000,tela:'Poliéster'},
{id:3,empresaId:1,prenda:'Bata',programa:'Salud',precio:55000,tela:'Antifluido'},
{id:4,empresaId:2,prenda:'Chaqueta',programa:'ADSO',precio:65000,tela:'Algodón'},
{id:5,empresaId:2,prenda:'Bata',programa:'Salud',precio:60000,tela:'Algodón'},
{id:6,empresaId:2,prenda:'Botas',programa:'Mantenimiento',precio:120000,tela:'Cuero'},
{id:7,empresaId:3,prenda:'Chaqueta',programa:'ADSO',precio:72000,tela:'Poliéster'},
{id:8,empresaId:3,prenda:'Overol',programa:'Mantenimiento',precio:85000,tela:'Drill'},
{id:9,empresaId:4,prenda:'Chaqueta',programa:'ADSO',precio:68000,tela:'Gabardina'},
{id:10,empresaId:4,prenda:'Bata',programa:'Salud',precio:58000,tela:'Antifluido'}],
resenas:[
{id:1,autorId:0,nombre:'Juan Pérez',empresaId:2,rating:5,texto:'La atención fue muy buena y encontré el uniforme que necesitaba.',foto:null,fecha:'12/05/2025'},
{id:2,autorId:0,nombre:'María López',empresaId:1,rating:5,texto:'Buenos precios y diferentes opciones de tela.',foto:null,fecha:'08/05/2025'},
{id:3,autorId:0,nombre:'Laura Gómez',empresaId:3,rating:4,texto:'Gran variedad de diseños y buena calidad.',foto:null,fecha:'02/05/2025'}],
mensajes:[]};
if(!localStorage.getItem('uf2_init')){for(const k in seed)localStorage.setItem('uf2_'+k,JSON.stringify(seed[k]));localStorage.setItem('uf2_init','1')}
const DB={get:k=>JSON.parse(localStorage.getItem('uf2_'+k)||'[]'),set:(k,v)=>localStorage.setItem('uf2_'+k,JSON.stringify(v))};
const nid=l=>l.reduce((m,x)=>Math.max(m,x.id),0)+1;
const me=()=>DB.get('users').find(x=>x.id==sessionStorage.getItem('uf_me'));
const page=document.body.dataset.page;
const money=n=>'$'+Number(n).toLocaleString('es-CO');
const stars=n=>'★'.repeat(n)+'☆'.repeat(5-n);
const eName=id=>DB.get('empresas').find(e=>e.id==id)?.nombre||'—';
const eOpts=()=>DB.get('empresas').map(e=>[e.id,e.nombre]);
const avg=id=>{const r=DB.get('resenas').filter(x=>x.empresaId==id);return r.length?(r.reduce((a,x)=>a+x.rating,0)/r.length).toFixed(1):'—'};
const nRes=id=>DB.get('resenas').filter(x=>x.empresaId==id).length;
/* RN-003: la plataforma no cobra; redirige a WhatsApp */
const wa=e=>{let d=String(e.whatsapp||'').replace(/\D/g,'');if(d.length===10)d='57'+d;return d?`https://wa.me/${d}?text=${encodeURIComponent('Hola '+e.nombre+', vi sus uniformes en UniFormate y quiero cotizar.')}`:'#'};
const shrink=file=>new Promise(res=>{if(!file||!/^image\//.test(file.type))return res(null);const r=new FileReader();r.onload=()=>{const i=new Image();i.onload=()=>{const k=Math.min(1,320/i.width),c=document.createElement('canvas');c.width=i.width*k;c.height=i.height*k;c.getContext('2d').drawImage(i,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.7))};i.onerror=()=>res(null);i.src=r.result};r.readAsDataURL(file)});
 
/* ===== LOGIN / REGISTRO (RF-003, RN-001) - sin contraseñas ===== */
if(page==='login'){
 bindTheme();
 if(me())location.replace('index.html');
 const rol=$('#l-rol'),emp=$('#l-emp'),mail=$('#l-mail'),err=$('#l-err');
 emp.innerHTML=eOpts().map(([v,l])=>`<option value="${v}">${esc(l)}</option>`).join('');
 const sync=()=>{$('#g-emp').hidden=rol.value!=='empresa';$('#g-mail').hidden=rol.value!=='aprendiz'};
 rol.onchange=sync;sync();
 $('#login-form').onsubmit=e=>{e.preventDefault();
  const nombre=clean($('#l-nombre').value),r=rol.value,m=clean(mail.value).toLowerCase();
  if(nombre.length<3)return err.textContent='Escribe tu nombre (mínimo 3 letras).';
  if(r==='aprendiz'&&m&&!/^[^\s@]+@(misena|sena)\.edu\.co$/.test(m))return err.textContent='Usa tu correo institucional (@misena.edu.co o @sena.edu.co) o déjalo vacío.';
  const eid=r==='empresa'?+emp.value:null,l=DB.get('users');
  let x=l.find(k=>norm(k.nombre)===norm(nombre)&&k.rol===r&&(k.empresaId||null)===eid);
  if(!x){x={id:nid(l),nombre,rol:r,empresaId:eid};l.push(x);DB.set('users',l)}
  sessionStorage.setItem('uf_me',x.id);location.href='index.html'};
 return;
}
 
/* ===== PERMISOS POR ROL (protección de rutas) ===== */
const PAGES={
 aprendiz:['index','comparador','resenas','contacto','nosotros'],
 empresa:['index','comparador','resenas','panel'],
 administrador:['index','comparador','resenas','contacto','nosotros','panel'],
 sistema:['index','resenas','contacto','panel']};
const LABEL={index:'Catálogo',comparador:'Comparador',nosotros:'Nosotros',contacto:'Contáctanos',resenas:'Reseñas'};
const PANEL={empresa:'Mi empresa',administrador:'Administración',sistema:'Sistema'};
const DESC={aprendiz:'Compara uniformes y deja tus reseñas.',empresa:'Actualiza tus prendas, precios y datos de contacto en tu panel.',administrador:'Gestiona usuarios, empresas y prendas, y modera reseñas.',sistema:'Modera la plataforma: elimina reseñas, mensajes, usuarios y datos.'};
const u=me();
if(!u){location.replace('login.html');return}
if(!PAGES[u.rol].includes(page)){location.replace('index.html');return}
 
/* ===== ENCABEZADO Y PIE ===== */
document.body.insertAdjacentHTML('afterbegin',`<header class="header"><div class="container header-container">
<a href="index.html" class="brand"><div class="brand-logo"><img src="img/logo-uniformate-web.png" alt="Logo UniFormate"></div><div class="brand-text"><div class="brand-title">UniFormate</div><div class="brand-subtitle">SENA UNIFORMES</div></div></a>
<nav class="nav" id="nav" aria-label="Navegación principal"><ul class="nav-list">${PAGES[u.rol].map(p=>`<li><a href="${p}.html" class="nav-link ${p===page?'active':''}">${p==='panel'?PANEL[u.rol]:LABEL[p]}</a></li>`).join('')}</ul></nav>
<div class="header-actions"><form class="hdr-search" id="hs" role="search"><input id="hs-q" type="search" placeholder="Buscar uniformes..." aria-label="Buscar uniformes"></form>
<span class="user-chip"><i class="fa-solid fa-user"></i> ${esc(u.nombre)} · ${u.rol}</span>
<button class="icon-btn" id="theme" type="button" aria-label="Cambiar tema claro u oscuro"><i class="fa-solid fa-moon"></i></button>
<button class="btn btn-sm btn-light" id="logout" type="button">Salir</button>
<button class="icon-btn mobile-menu-btn" id="menu-toggle" type="button" aria-label="Abrir menú"><i class="fa-solid fa-bars"></i></button></div></div></header>`);
document.body.insertAdjacentHTML('beforeend','<footer class="footer"><div class="container footer-content"><div class="logo-name">UniFormate</div><p class="copyright">© 2026 UniFormate. Todos los derechos reservados.</p></div></footer>');
bindTheme();
$('#logout').onclick=()=>{sessionStorage.removeItem('uf_me');location.href='login.html'};
$('#menu-toggle').onclick=()=>$('#nav').classList.toggle('open');
$('#hs').onsubmit=e=>{e.preventDefault();const v=clean($('#hs-q').value);
 if(page==='index')document.dispatchEvent(new CustomEvent('uf-search',{detail:v}));else location.href='index.html?q='+encodeURIComponent(v)};
 
/* ===== CRUD GENERICO ===== */
function crud(el,o){
 let editing=null;
 const can=(f,r)=>typeof f==='function'?f(r):!!f;
 const opts=f=>(typeof f.options==='function'?f.options():f.options).map(([v,l])=>`<option value="${esc(v)}">${esc(l)}</option>`).join('');
 const field=f=>`<div class="form-group"><label>${f.label}</label>${f.options?`<select name="${f.k}">${f.opt?'<option value="">—</option>':''}${opts(f)}</select>`:`<input name="${f.k}" type="${f.type||'text'}"${f.type==='number'?' min="0"':''}>`}</div>`;
 function draw(){
  const rows=o.rows();
  el.innerHTML=`<div class="crud"><div class="crud-head"><h3>${o.title}</h3>${can(o.add)?'<button class="btn btn-sm" data-a="new" type="button">+ Nuevo</button>':''}</div>
<form class="crud-form" hidden novalidate>${o.fields.map(field).join('')}<p class="error-message"></p><button class="btn btn-sm">Guardar</button> <button type="button" class="btn btn-sm btn-light" data-a="cancel">Cancelar</button></form>
<div class="table-wrapper"><table><thead><tr>${o.cols.map(c=>`<th>${c.label}</th>`).join('')}<th></th></tr></thead><tbody>${rows.map(r=>`<tr>${o.cols.map(c=>`<td>${c.fmt?c.fmt(r):esc(r[c.k])}</td>`).join('')}<td class="acts">${can(o.edit,r)?`<button class="btn btn-sm btn-light" data-a="edit" data-id="${r.id}">Editar</button>`:''}${can(o.del,r)?`<button class="btn btn-sm btn-danger" data-a="del" data-id="${r.id}">Eliminar</button>`:''}</td></tr>`).join('')||`<tr><td colspan="${o.cols.length+1}">Sin registros.</td></tr>`}</tbody></table></div></div>`;
 }
 el.onclick=e=>{
  const b=e.target.closest('[data-a]');if(!b)return;
  const a=b.dataset.a,id=+b.dataset.id,f=$('.crud-form',el);
  if(a==='new'){editing=null;f.reset();f.hidden=false}
  else if(a==='cancel')f.hidden=true;
  else if(a==='edit'){const r=DB.get(o.key).find(x=>x.id===id);editing=id;f.hidden=false;o.fields.forEach(c=>f.elements[c.k].value=r[c.k]??'')}
  else if(a==='del'&&confirm('¿Eliminar este registro?')){DB.set(o.key,DB.get(o.key).filter(x=>x.id!==id));o.onDel?.(id);draw()}
 };
 el.onsubmit=e=>{
  e.preventDefault();const f=e.target,v={};let bad=false;
  o.fields.forEach(c=>{const x=clean(f.elements[c.k].value);if(!x&&!c.opt)bad=true;v[c.k]=x===''?null:(c.type==='number'||c.num?Number(x):x)});
  if(bad)return $('.error-message',f).textContent='Completa todos los campos.';
  const l=DB.get(o.key);
  if(editing)Object.assign(l.find(x=>x.id===editing),v);else l.push({id:nid(l),...(o.defaults?o.defaults():{}),...v});
  DB.set(o.key,l);editing=null;draw();
 };
 draw();
}
const msgCfg={title:'Mensajes de contacto',key:'mensajes',rows:()=>DB.get('mensajes').slice().reverse(),
 cols:[{k:'nombre',label:'Nombre'},{k:'email',label:'Correo'},{k:'texto',label:'Mensaje'},{k:'fecha',label:'Fecha'}],fields:[],del:true};
 
/* ===== PAGINAS ===== */
const PG={
 /* RF-001 catálogo + RF-005 buscador y filtro */
 index(){
  const q=$('#q'),pr=$('#prog'),box=$('#lista');
  q.value=clean(new URLSearchParams(location.search).get('q')||'');
  $('#welcome').innerHTML=`Hola, <strong>${esc(u.nombre)}</strong> (${u.rol}). ${DESC[u.rol]}`;
  let sel=JSON.parse(sessionStorage.getItem('uf_cmp')||'[]');
  const bar=()=>{const b=$('#cmp-bar');b.hidden=!sel.length||!PAGES[u.rol].includes('comparador');b.innerHTML=`${sel.length} empresa(s) para comparar. <a class="btn btn-sm" href="comparador.html">Ir al comparador</a>`};
  const card=(e,ps)=>`<article class="company-card"><div class="card-header"><div class="company-brand"><div class="avatar">${esc(e.nombre[0])}</div><div><h3>${esc(e.nombre)}</h3><p>${esc(e.slogan)}</p></div></div>
${PAGES[u.rol].includes('comparador')?`<label class="badge cmp"><input type="checkbox" data-c="${e.id}"${sel.includes(e.id)?' checked':''}> Comparar</label>`:''}</div>
<ul class="uni-list">${ps.map(p=>`<li><span>${esc(p.prenda)} <small>· ${esc(p.programa)} · ${esc(p.tela)}</small></span><strong class="price">${money(p.precio)}</strong></li>`).join('')}</ul>
<div class="price-location"><div class="location"><i class="fa-solid fa-location-dot"></i> ${esc(e.ubicacion)}</div><div class="rating">★ ${avg(e.id)} <small>(${nRes(e.id)})</small></div></div>
<div class="price-location"><small><i class="fa-solid fa-truck"></i> Entrega: ${esc(e.entrega)} días</small><small><i class="fa-solid fa-phone"></i> ${esc(e.telefono)}</small></div>
<a class="btn btn-block btn-wa" href="${wa(e)}" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i> Cotizar por WhatsApp</a>
<a class="btn btn-block btn-light" href="resenas.html?e=${e.id}" style="margin-top:8px">Ver reseñas</a></article>`;
  const draw=()=>{
   const t=norm(q.value.trim()),g=pr.value;
   const html=DB.get('empresas').map(e=>{
    const em=t&&norm(e.nombre+' '+e.ubicacion).includes(t);
    const ps=DB.get('uniformes').filter(p=>p.empresaId===e.id&&(!g||p.programa===g)&&(!t||em||norm(p.prenda+' '+p.programa+' '+p.tela).includes(t)));
    return ps.length?card(e,ps):'';
   }).join('');
   box.innerHTML=html||'<p class="no-results">No encontramos uniformes con esa búsqueda.</p>';
  };
  box.onchange=e=>{const c=+e.target.dataset.c;if(!c)return;
   if(e.target.checked){if(sel.length>=3){e.target.checked=false;return alert('Puedes comparar máximo 3 empresas.')}sel.push(c)}else sel=sel.filter(x=>x!==c);
   sessionStorage.setItem('uf_cmp',JSON.stringify(sel));bar()};
  q.oninput=pr.onchange=draw;
  document.addEventListener('uf-search',e=>{q.value=e.detail;draw()});
  draw();bar();
 },
 /* RF-002 comparador (2 o 3 empresas) */
 comparador(){
  let sel=JSON.parse(sessionStorage.getItem('uf_cmp')||'[]').filter(id=>DB.get('empresas').some(e=>e.id===id));
  const chips=$('#chips'),out=$('#tabla');
  const save=()=>sessionStorage.setItem('uf_cmp',JSON.stringify(sel));
  const drawChips=()=>chips.innerHTML=DB.get('empresas').map(e=>`<label class="badge cmp"><input type="checkbox" data-c="${e.id}"${sel.includes(e.id)?' checked':''}> ${esc(e.nombre)}</label>`).join('');
  const table=()=>{
   if(sel.length<2){out.innerHTML='<p class="no-results">Selecciona 2 o 3 empresas para comparar.</p>';return}
   const E=sel.map(id=>DB.get('empresas').find(e=>e.id===id)),P=DB.get('uniformes');
   const min=(e,f)=>{const v=P.filter(p=>p.empresaId===e.id&&f(p)).map(p=>p.precio);return v.length?Math.min(...v):null};
   const pm=n=>({t:n==null?'—':money(n),n});
   const row=(l,cells,best)=>{const nums=cells.map(c=>c.n).filter(n=>n!=null);const b=nums.length>1?Math[best](...nums):null;return `<tr><td>${l}</td>${cells.map(c=>`<td class="${b!==null&&c.n===b?'best':''}">${c.t}</td>`).join('')}</tr>`};
   const tipos=[...new Set(P.filter(p=>sel.includes(p.empresaId)).map(p=>p.prenda))];
   out.innerHTML=`<table><thead><tr><th>Característica</th>${E.map(e=>`<th>${esc(e.nombre)}</th>`).join('')}</tr></thead><tbody>`+
    row('Precio desde',E.map(e=>pm(min(e,()=>true))),'min')+
    tipos.map(t=>row('Precio '+esc(t),E.map(e=>pm(min(e,p=>p.prenda===t))),'min')).join('')+
    row('Tiempo de entrega',E.map(e=>({t:esc(e.entrega)+' días',n:+e.entrega})),'min')+
    row('Telas',E.map(e=>({t:esc([...new Set(P.filter(p=>p.empresaId===e.id).map(p=>p.tela))].join(', ')||'—')})),'min')+
    row('Calificación',E.map(e=>({t:'★ '+avg(e.id),n:avg(e.id)==='—'?null:+avg(e.id)})),'max')+
    row('Ubicación',E.map(e=>({t:esc(e.ubicacion)})),'min')+
    row('Contacto',E.map(e=>({t:`<a class="btn btn-sm btn-wa" target="_blank" rel="noopener" href="${wa(e)}">WhatsApp</a>`})),'min')+'</tbody></table>';
  };
  chips.onchange=e=>{const c=+e.target.dataset.c;if(!c)return;
   if(e.target.checked){if(sel.length>=3){e.target.checked=false;return alert('Puedes comparar máximo 3 empresas.')}sel.push(c)}else sel=sel.filter(x=>x!==c);
   save();table()};
  drawChips();table();
 },
 nosotros(){},
 contacto(){
  const f=$('#contact-form'),fb=$('#contact-feedback');
  f.onsubmit=e=>{e.preventDefault();
   const n=clean(f.nombre.value),m=clean(f.email.value),t=clean(f.mensaje.value);
   if(n.length<3||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m)||t.length<10){fb.className='form-feedback error';fb.textContent='Revisa: nombre, correo válido y mensaje de 10+ caracteres.';return}
   const l=DB.get('mensajes');l.push({id:nid(l),nombre:n,email:m,texto:t,fecha:new Date().toLocaleDateString('es-CO')});DB.set('mensajes',l);
   fb.className='form-feedback success';fb.textContent='¡Gracias! Recibimos tu mensaje.';f.reset();
   if(['administrador','sistema'].includes(u.rol))crud($('#msgs'),msgCfg)};
  if(['administrador','sistema'].includes(u.rol))crud($('#msgs'),msgCfg);
 },
 /* RF-004 reseñas (1-5 estrellas, comentario, foto; RN-002: 1 por empresa) */
 resenas(){
  let fe=+new URLSearchParams(location.search).get('e')||0;
  const fs=$('#fil'),opts=DB.get('empresas').map(e=>`<option value="${e.id}">${esc(e.nombre)}</option>`).join('');
  fs.innerHTML='<option value="0">Todas las empresas</option>'+opts;fs.value=fe;
  const can=r=>u.rol==='aprendiz'?r.autorId===u.id:u.rol==='administrador'||u.rol==='sistema';
  const list=()=>{
   const rs=DB.get('resenas').filter(r=>!fe||r.empresaId===fe).reverse();
   $('#cards').innerHTML=rs.map(r=>`<div class="user-review"><div class="review-user-header"><strong>${esc(r.nombre)} <small>→ ${esc(eName(r.empresaId))}</small></strong><div class="stars" aria-label="${r.rating} estrellas">${stars(r.rating)}</div></div><p>${esc(r.texto)}</p>${r.foto&&/^data:image\//.test(r.foto)?`<img class="rv-photo" src="${esc(r.foto)}" alt="Foto de la reseña">`:''}<p>${esc(r.fecha)}${can(r)?` · <button class="btn btn-sm btn-danger" data-d="${r.id}">Eliminar</button>`:''}</p></div>`).join('')||'<p>Aún no hay reseñas.</p>';
  };
  fs.onchange=()=>{fe=+fs.value;list()};
  $('#cards').onclick=e=>{const id=+e.target.dataset.d;if(id&&confirm('¿Eliminar esta reseña?')){DB.set('resenas',DB.get('resenas').filter(r=>r.id!==id));list()}};
  list();
  if(u.rol!=='aprendiz'){$('#form-box').hidden=true;return}
  const f=$('#review-form'),fb=$('#form-feedback'),err=$('#r-err');
  $('#r-emp').innerHTML=opts;if(fe)$('#r-emp').value=fe;
  f.onsubmit=async e=>{e.preventDefault();
   const eid=+$('#r-emp').value,st=f.querySelector('input[name=star]:checked'),tx=clean($('#r-txt').value);
   err.textContent='';
   if(!st)return err.textContent='Elige una calificación de 1 a 5 estrellas.';
   if(tx.length<10)return err.textContent='El comentario debe tener al menos 10 caracteres.';
   if(DB.get('resenas').some(r=>r.autorId===u.id&&r.empresaId===eid))return err.textContent='Ya calificaste esta empresa. Elimina tu reseña anterior si quieres cambiarla.';
   const foto=await shrink($('#r-foto').files[0]),l=DB.get('resenas');
   l.push({id:nid(l),autorId:u.id,nombre:u.nombre,empresaId:eid,rating:+st.value,texto:tx,foto,fecha:new Date().toLocaleDateString('es-CO')});
   try{DB.set('resenas',l)}catch{return err.textContent='No hay espacio para la foto. Prueba sin foto.'}
   f.reset();fb.className='form-feedback success';fb.textContent='¡Gracias por tu reseña!';list()};
 },
 /* RF-006 gestión de empresa + CRUD por rol */
 panel(){
  const A=u.rol==='administrador',S=u.rol==='sistema',own=u.rol==='empresa';
  const empFields=[{k:'nombre',label:'Nombre'},{k:'slogan',label:'Eslogan'},{k:'ubicacion',label:'Ubicación'},{k:'whatsapp',label:'WhatsApp (10 dígitos)'},{k:'telefono',label:'Teléfono'},{k:'entrega',label:'Días de entrega',type:'number'}];
  const empCols=[{k:'nombre',label:'Nombre'},{k:'ubicacion',label:'Ubicación'},{k:'whatsapp',label:'WhatsApp'},{k:'telefono',label:'Teléfono'},{k:'entrega',label:'Entrega (días)'}];
  const uni={title:own?'Mis prendas':'Prendas',key:'uniformes',
   rows:()=>DB.get('uniformes').filter(x=>!own||x.empresaId===u.empresaId),
   cols:[{k:'prenda',label:'Prenda'},{k:'programa',label:'Programa'},{label:'Empresa',fmt:r=>esc(eName(r.empresaId))},{label:'Precio',fmt:r=>money(r.precio)},{k:'tela',label:'Tela'}],
   fields:[...(own?[]:[{k:'empresaId',label:'Empresa',options:eOpts,num:1}]),{k:'prenda',label:'Prenda',options:PRENDAS.map(x=>[x,x])},{k:'programa',label:'Programa',options:PROGS.map(x=>[x,x])},{k:'precio',label:'Precio',type:'number'},{k:'tela',label:'Tela'}],
   add:own||A,edit:own||A,del:true,defaults:()=>own?{empresaId:u.empresaId}:{}};
  const tabs=[];
  if(own){
   if(!u.empresaId){$('#tab').innerHTML='<p class="no-results">Tu usuario no tiene una empresa asignada. Cierra sesión y entra de nuevo eligiendo tu empresa.</p>';return}
   tabs.push(['Datos de mi empresa',{title:'Datos de mi empresa',key:'empresas',rows:()=>DB.get('empresas').filter(e=>e.id===u.empresaId),cols:empCols,fields:empFields,edit:true}]);
   tabs.push(['Mis prendas',uni]);
  }else{
   tabs.push(['Usuarios',{title:'Usuarios',key:'users',rows:()=>DB.get('users'),cols:[{k:'nombre',label:'Nombre'},{k:'rol',label:'Rol'},{label:'Empresa',fmt:r=>r.empresaId?esc(eName(r.empresaId)):'—'}],
    fields:[{k:'nombre',label:'Nombre'},{k:'rol',label:'Rol',options:['aprendiz','empresa','administrador','sistema'].map(r=>[r,r])},{k:'empresaId',label:'Empresa (solo rol empresa)',options:eOpts,num:1,opt:1}],edit:A,del:r=>r.id!==u.id}]);
   tabs.push(['Empresas',{title:'Empresas',key:'empresas',rows:()=>DB.get('empresas'),cols:empCols,fields:empFields,add:A,edit:A,del:true,onDel:id=>DB.set('uniformes',DB.get('uniformes').filter(x=>x.empresaId!==id))}]);
   tabs.push(['Prendas',uni]);
   if(S)tabs.push(['Mensajes',msgCfg]);
  }
  $('#tabs').innerHTML=tabs.map((t,i)=>`<button class="btn btn-sm btn-light" data-i="${i}" type="button">${t[0]}</button>`).join('')+(S?'<button class="btn btn-sm btn-danger" id="reset" type="button">Restablecer datos</button>':'');
  const show=i=>{document.querySelectorAll('#tabs [data-i]').forEach(b=>b.classList.toggle('on',+b.dataset.i===i));crud($('#tab'),tabs[i][1])};
  $('#tabs').onclick=e=>{const b=e.target.closest('[data-i]');if(b)show(+b.dataset.i);
   if(e.target.id==='reset'&&confirm('Se borrarán todos los datos y volverán los de ejemplo. ¿Continuar?')){Object.keys(localStorage).filter(k=>k.startsWith('uf2_')).forEach(k=>localStorage.removeItem(k));sessionStorage.clear();location.href='login.html'}};
  show(0);
 }
};
PG[page]?.();
})();
 