(()=>{
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const seed={
users:[
{id:1,nombre:'Admin UniFormate',email:'admin@uniformate.co',pass:'admin123',rol:'administrador'},
{id:2,nombre:'Sistema',email:'sistema@uniformate.co',pass:'sistema123',rol:'sistema'},
{id:3,nombre:'Textiles Jhon',email:'empresa@uniformate.co',pass:'empresa123',rol:'empresa',empresaId:1},
{id:4,nombre:'Juan Pérez',email:'aprendiz@misena.edu.co',pass:'aprendiz123',rol:'aprendiz'}],
empresas:[
{id:1,nombre:'Textiles Jhon',slogan:'Calidad y estilo',ubicacion:'Bogotá'},
{id:2,nombre:'Dotaciones SENA',slogan:'Tu formación, nuestra prioridad',ubicacion:'Bogotá - Salitre'},
{id:3,nombre:'Confecciones Gamarra',slogan:'Uniformes que trabajan contigo',ubicacion:'Bogotá - Chapinero'}],
uniformes:[
{id:1,empresaId:1,nombre:'Uniforme azul',precio:70000,material:'Poliéster'},
{id:2,empresaId:2,nombre:'Uniforme blanco',precio:65000,material:'Algodón'},
{id:3,empresaId:3,nombre:'Uniforme verde',precio:72000,material:'Poliéster'}],
resenas:[
{id:1,autorId:4,nombre:'Juan Pérez',empresaId:2,rating:5,texto:'La atención fue muy buena y encontré el uniforme que necesitaba.',fecha:'12/05/2025'},
{id:2,autorId:0,nombre:'María López',empresaId:1,rating:5,texto:'Buenos precios y diferentes opciones.',fecha:'08/05/2025'},
{id:3,autorId:0,nombre:'Laura Gómez',empresaId:3,rating:4,texto:'Gran variedad de diseños y buena calidad.',fecha:'02/05/2025'}],
mensajes:[]};
if(!localStorage.getItem('uf_init')){for(const k in seed)localStorage.setItem('uf_'+k,JSON.stringify(seed[k]));localStorage.setItem('uf_init','1')}
const DB={get:k=>JSON.parse(localStorage.getItem('uf_'+k)||'[]'),set:(k,v)=>localStorage.setItem('uf_'+k,JSON.stringify(v))};
const nid=l=>l.reduce((m,x)=>Math.max(m,x.id),0)+1;
const me=()=>DB.get('users').find(u=>u.id==sessionStorage.getItem('uf_me'));
const page=document.body.dataset.page;
const money=n=>'$'+Number(n).toLocaleString('es-CO');
const stars=n=>'★'.repeat(n)+'☆'.repeat(5-n);
const eName=id=>DB.get('empresas').find(e=>e.id==id)?.nombre||'—';
const eOpts=()=>DB.get('empresas').map(e=>[e.id,e.nombre]);
const avg=id=>{const r=DB.get('resenas').filter(x=>x.empresaId==id);return r.length?(r.reduce((a,x)=>a+x.rating,0)/r.length).toFixed(1):'—'};
 
/* ===== LOGIN ===== */
if(page==='login'){
 if(me())location.replace('index.html');
 $('#demo').onclick=e=>{const b=e.target.closest('button');if(b){$('#l-email').value=b.dataset.e;$('#l-pass').value=b.dataset.p}};
 $('#login-form').onsubmit=e=>{e.preventDefault();
  const em=$('#l-email').value.trim().toLowerCase(),pw=$('#l-pass').value;
  const u=DB.get('users').find(x=>x.email.toLowerCase()===em&&x.pass===pw);
  if(!u)return $('#l-err').textContent='Correo o contraseña incorrectos.';
  sessionStorage.setItem('uf_me',u.id);location.href='index.html'};
 return;
}
 
/* ===== PERMISOS POR ROL ===== */
const PAGES={
 aprendiz:['index','empresas','comparacion','nosotros','contacto','resenas'],
 empresa:['index','empresas','comparacion','resenas','panel'],
 administrador:['index','empresas','comparacion','nosotros','contacto','resenas','panel'],
 sistema:['index','empresas','contacto','resenas','panel']};
const LABEL={index:'Inicio',empresas:'Empresas',comparacion:'Comparación',nosotros:'Nosotros',contacto:'Contáctanos',resenas:'Reseñas'};
const PANEL={empresa:'Mis uniformes',administrador:'Administración',sistema:'Sistema'};
const DESC={
 aprendiz:'Compara uniformes y empresas, y deja tus reseñas.',
 empresa:'Administra los uniformes de tu empresa desde tu panel.',
 administrador:'Gestiona usuarios, empresas y uniformes, y modera reseñas.',
 sistema:'Modera la plataforma: elimina reseñas, mensajes, usuarios y datos.'};
const u=me();
if(!u){location.replace('login.html');return}
if(!PAGES[u.rol].includes(page)){location.replace('index.html');return}
 
/* ===== ENCABEZADO Y PIE ===== */
document.body.insertAdjacentHTML('afterbegin',`<header class="header"><div class="container header-container">
<a href="index.html" class="brand"><div class="brand-logo"><img src="imagenes/logo-uniformate-web.png" alt="Logo UniFormate"></div><div class="brand-text"><div class="brand-title">UniFormate</div><div class="brand-subtitle">SENA UNIFORMES</div></div></a>
<nav class="nav" id="nav" aria-label="Navegación principal"><ul class="nav-list">${PAGES[u.rol].map(p=>`<li><a href="${p}.html" class="nav-link ${p===page?'active':''}">${p==='panel'?PANEL[u.rol]:LABEL[p]}</a></li>`).join('')}</ul></nav>
<div class="header-actions"><span class="user-chip">${esc(u.nombre)} · ${u.rol}</span><button class="btn btn-sm btn-light" id="logout" type="button">Salir</button>
<button class="icon-btn mobile-menu-btn" id="menu-toggle" type="button" aria-label="Abrir menú"><i class="fa-solid fa-bars"></i></button></div></div></header>`);
document.body.insertAdjacentHTML('beforeend','<footer class="footer"><div class="container footer-content"><div class="logo-name">UniFormate</div><p class="copyright">© 2026 UniFormate. Todos los derechos reservados.</p></div></footer>');
$('#logout').onclick=()=>{sessionStorage.removeItem('uf_me');location.href='login.html'};
$('#menu-toggle').onclick=()=>$('#nav').classList.toggle('open');
 
/* ===== CRUD GENERICO ===== */
function crud(el,o){
 let editing=null;
 const can=(f,r)=>typeof f==='function'?f(r):!!f;
 const opts=f=>(typeof f.options==='function'?f.options():f.options).map(([v,l])=>`<option value="${esc(v)}">${esc(l)}</option>`).join('');
 const field=f=>`<div class="form-group"><label>${f.label}</label>${f.type==='textarea'?`<textarea name="${f.k}" rows="3"></textarea>`:f.options?`<select name="${f.k}">${f.opt?'<option value="">—</option>':''}${opts(f)}</select>`:`<input name="${f.k}" type="${f.type||'text'}"${f.type==='number'?' min="0"':''}>`}</div>`;
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
  o.fields.forEach(c=>{const x=f.elements[c.k].value.trim();if(!x&&!c.opt)bad=true;v[c.k]=x===''?null:(c.type==='number'||c.num?Number(x):x)});
  if(bad)return $('.error-message',f).textContent='Completa todos los campos.';
  const l=DB.get(o.key);
  if(editing)Object.assign(l.find(x=>x.id===editing),v);else l.push({id:nid(l),...(o.defaults?o.defaults():{}),...v});
  DB.set(o.key,l);editing=null;draw();
 };
 draw();
}
 
/* ===== CONFIGURACIONES CRUD ===== */
const resCfg=(panel)=>({title:panel?'Reseñas':'Reseñas de aprendices',key:'resenas',
 rows:()=>DB.get('resenas').slice().reverse(),
 cols:[{k:'nombre',label:'Autor'},{label:'Empresa',fmt:r=>esc(eName(r.empresaId))},{label:'Calificación',fmt:r=>`<span class="stars">${stars(r.rating)}</span>`},{k:'texto',label:'Comentario'},{k:'fecha',label:'Fecha'}],
 fields:[{k:'empresaId',label:'Empresa',options:eOpts,num:1},{k:'rating',label:'Calificación',options:[1,2,3,4,5].map(n=>[n,n+' ★']),num:1},{k:'texto',label:'Comentario',type:'textarea'}],
 add:u.rol==='aprendiz',
 edit:r=>u.rol==='aprendiz'&&r.autorId===u.id,
 del:r=>u.rol==='aprendiz'?r.autorId===u.id:u.rol!=='empresa',
 defaults:()=>({autorId:u.id,nombre:u.nombre,fecha:new Date().toLocaleDateString('es-CO')})});
const msgCfg={title:'Mensajes de contacto',key:'mensajes',rows:()=>DB.get('mensajes').slice().reverse(),
 cols:[{k:'nombre',label:'Nombre'},{k:'email',label:'Correo'},{k:'texto',label:'Mensaje'},{k:'fecha',label:'Fecha'}],fields:[],del:true};
 
/* ===== PAGINAS ===== */
const PG={
 index(){
  $('#welcome').innerHTML=`<h2>Hola, ${esc(u.nombre)} 👋</h2><p>Entraste como <strong>${u.rol}</strong>. ${DESC[u.rol]}</p>`+
   PAGES[u.rol].filter(p=>p!=='index').map(p=>`<a class="btn btn-sm" href="${p}.html">${p==='panel'?PANEL[u.rol]:LABEL[p]}</a>`).join('');
 },
 empresas(){
  $('#lista').innerHTML=DB.get('empresas').map(e=>{
   const us=DB.get('uniformes').filter(x=>x.empresaId===e.id);
   return `<article class="company-card"><div class="card-header"><div class="company-brand"><div class="company-icon text-green"><i class="fa-solid fa-shirt"></i></div><div><h3>${esc(e.nombre)}</h3><p>${esc(e.slogan)}</p></div></div></div>
<ul class="uni-list">${us.map(x=>`<li><span>${esc(x.nombre)} <small>(${esc(x.material)})</small></span><strong class="price">${money(x.precio)}</strong></li>`).join('')||'<li>Sin uniformes aún</li>'}</ul>
<div class="price-location"><div class="location"><i class="fa-solid fa-location-dot"></i> ${esc(e.ubicacion)}</div><div class="rating">★ ${avg(e.id)}</div></div></article>`}).join('');
 },
 comparacion(){
  const E=DB.get('empresas'),U=DB.get('uniformes');
  const mn=e=>{const p=U.filter(x=>x.empresaId===e.id).map(x=>x.precio);return p.length?money(Math.min(...p)):'—'};
  const mat=e=>[...new Set(U.filter(x=>x.empresaId===e.id).map(x=>x.material))].map(esc).join(', ')||'—';
  const row=(l,f)=>`<tr><td>${l}</td>${E.map(e=>`<td>${f(e)}</td>`).join('')}</tr>`;
  $('#tabla').innerHTML=`<table><thead><tr><th>Característica</th>${E.map(e=>`<th>${esc(e.nombre)}</th>`).join('')}</tr></thead><tbody>${row('Precio desde',mn)}${row('Material',mat)}${row('Calificación',e=>'★ '+avg(e.id))}${row('Ubicación',e=>esc(e.ubicacion))}</tbody></table>`;
 },
 nosotros(){},
 contacto(){
  const f=$('#contact-form'),fb=$('#contact-feedback');
  f.onsubmit=e=>{e.preventDefault();
   const n=f.nombre.value.trim(),m=f.email.value.trim(),t=f.mensaje.value.trim();
   if(n.length<3||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m)||t.length<10){fb.className='form-feedback error';fb.textContent='Revisa los campos: nombre, correo válido y mensaje de 10+ caracteres.';return}
   const l=DB.get('mensajes');l.push({id:nid(l),nombre:n,email:m,texto:t,fecha:new Date().toLocaleDateString('es-CO')});DB.set('mensajes',l);
   fb.className='form-feedback success';fb.textContent='¡Gracias! Recibimos tu mensaje.';f.reset();
   if($('#msgs').innerHTML)crud($('#msgs'),msgCfg)};
  if(['administrador','sistema'].includes(u.rol))crud($('#msgs'),msgCfg);
 },
 resenas(){crud($('#crud'),resCfg(false))},
 panel(){
  const A=u.rol==='administrador',S=u.rol==='sistema';
  const uni=own=>({title:'Uniformes',key:'uniformes',
   rows:()=>DB.get('uniformes').filter(x=>!own||x.empresaId===u.empresaId),
   cols:[{k:'nombre',label:'Uniforme'},{label:'Empresa',fmt:r=>esc(eName(r.empresaId))},{label:'Precio',fmt:r=>money(r.precio)},{k:'material',label:'Material'}],
   fields:[{k:'nombre',label:'Nombre'},...(own?[]:[{k:'empresaId',label:'Empresa',options:eOpts,num:1}]),{k:'precio',label:'Precio',type:'number'},{k:'material',label:'Material'}],
   add:own||A,edit:own||A,del:true,defaults:()=>own?{empresaId:u.empresaId}:{}});
  const tabs=[];
  if(u.rol==='empresa'){
   if(!u.empresaId){$('#tab').innerHTML='<p class="no-results">Tu usuario no tiene una empresa asignada. Pídele al administrador que te la asigne.</p>';return}
   tabs.push(['Mis uniformes',uni(true)]);
  }else{
   tabs.push(['Usuarios',{title:'Usuarios',key:'users',rows:()=>DB.get('users'),
    cols:[{k:'nombre',label:'Nombre'},{k:'email',label:'Correo'},{k:'rol',label:'Rol'},{label:'Empresa',fmt:r=>r.empresaId?esc(eName(r.empresaId)):'—'}],
    fields:[{k:'nombre',label:'Nombre'},{k:'email',label:'Correo',type:'email'},{k:'pass',label:'Contraseña'},{k:'rol',label:'Rol',options:['aprendiz','empresa','administrador','sistema'].map(r=>[r,r])},{k:'empresaId',label:'Empresa (solo rol empresa)',options:eOpts,num:1,opt:1}],
    add:A,edit:A,del:r=>r.id!==u.id}]);
   tabs.push(['Empresas',{title:'Empresas',key:'empresas',rows:()=>DB.get('empresas'),
    cols:[{k:'nombre',label:'Nombre'},{k:'slogan',label:'Eslogan'},{k:'ubicacion',label:'Ubicación'}],
    fields:[{k:'nombre',label:'Nombre'},{k:'slogan',label:'Eslogan'},{k:'ubicacion',label:'Ubicación'}],
    add:A,edit:A,del:true,onDel:id=>DB.set('uniformes',DB.get('uniformes').filter(x=>x.empresaId!==id))}]);
   tabs.push(['Uniformes',uni(false)]);
   if(S){tabs.push(['Reseñas',resCfg(true)]);tabs.push(['Mensajes',msgCfg])}
  }
  $('#tabs').innerHTML=tabs.map((t,i)=>`<button class="btn btn-sm btn-light" data-i="${i}" type="button">${t[0]}</button>`).join('')+
   (S?'<button class="btn btn-sm btn-danger" id="reset" type="button">Restablecer datos</button>':'');
  const show=i=>{document.querySelectorAll('#tabs [data-i]').forEach(b=>b.classList.toggle('on',+b.dataset.i===i));crud($('#tab'),tabs[i][1])};
  $('#tabs').onclick=e=>{const b=e.target.closest('[data-i]');if(b)show(+b.dataset.i);if(e.target.id==='reset'&&confirm('Se borrarán todos los datos y volverán los de ejemplo. ¿Continuar?')){Object.keys(localStorage).filter(k=>k.startsWith('uf_')).forEach(k=>localStorage.removeItem(k));sessionStorage.clear();location.href='login.html'}};
  show(0);
 }
};
PG[page]?.();
})();
 