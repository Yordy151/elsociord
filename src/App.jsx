import { useState, useEffect, useRef } from "react";

/* ================================================================
   EL SOCIO RD — v5  Psychological colors · Micro-interactions · Toasts
   ================================================================ */

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;600;700;800;900&family=Nunito:wght@700;800;900&display=swap";
document.head.appendChild(fontLink);

// Inject global keyframes
const styleEl = document.createElement("style");
styleEl.textContent = `
  @keyframes fadeSlideUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn      { from { opacity:0; } to { opacity:1; } }
  @keyframes scaleIn     { from { opacity:0; transform:scale(.92); } to { opacity:1; transform:scale(1); } }
  @keyframes pulse       { 0%,100%{box-shadow:0 0 0 0 #5DB87A55} 50%{box-shadow:0 0 0 8px #5DB87A00} }
  @keyframes ripple      { from{transform:scale(0);opacity:.4} to{transform:scale(4);opacity:0} }
  @keyframes toastIn     { from{opacity:0;transform:translateY(20px) scale(.95)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes toastOut    { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(10px)} }
  @keyframes spin        { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes shimmer     { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
  @keyframes bounce      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
  @keyframes urgentPulse { 0%,100%{opacity:1} 50%{opacity:.65} }
  @keyframes countUp     { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes checkPop    { 0%{transform:scale(0) rotate(-15deg)} 70%{transform:scale(1.2) rotate(5deg)} 100%{transform:scale(1) rotate(0)} }
  @keyframes gradShift   { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
  * { box-sizing:border-box; }
  ::-webkit-scrollbar { width:5px; } ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:#3a4a3e; border-radius:99px; }
`;
document.head.appendChild(styleEl);

// ── THEMES ────────────────────────────────────────────────────────
const D = {
  bg:"#0E1210", surface:"#141A16", card:"#1A2119", border:"#253022",
  accent:"#5DB87A", accentDark:"#3d9960", gold:"#D4A843", red:"#E05252",
  blue:"#5B9BD5", orange:"#E07B45", text:"#EEE9E0", muted:"#7A8C7E",
  faint:"#1E2820", shadow:"0 8px 48px #00000099", green:"#5DB87A",
};
const L = {
  bg:"#F5F3EE", surface:"#FFFFFF", card:"#FFFFFF", border:"#E2DDD5",
  accent:"#1F7A4B", accentDark:"#155c38", gold:"#B8882A", red:"#C0392B",
  blue:"#2C6FAC", orange:"#C05B2A", text:"#1A1F1C", muted:"#66786B",
  faint:"#EEEbE4", shadow:"0 4px 28px #00000014", green:"#1F7A4B",
};

// ── TRANSLATIONS ──────────────────────────────────────────────────
const T = {
  es: {
    brand:"El Socio RD", tagline:"Servicios verificados, personas de confianza",
    nav:{ browse:"Explorar", post:"Publicar Trabajo", client:"Panel Cliente", provider:"Panel Proveedor", admin:"Administración" },
    theme:{ dark:"Modo Claro", light:"Modo Oscuro" }, lang:"English",
    signup:"Registrarse", login:"Iniciar Sesión", loggedAs:"Sesión activa", demo:"Demo",
    su:{
      title:"Bienvenido a El Socio RD", sub:"La plataforma de confianza para servicios en República Dominicana",
      asClient:"Necesito un servicio", asProvider:"Ofrezco servicios",
      name:"Nombre completo", email:"Correo electrónico", phone:"Teléfono",
      whatsapp:"WhatsApp (si es diferente)", password:"Contraseña",
      sector:"Sector / Barrio", city:"Ciudad", howHeard:"¿Cómo nos encontraste?",
      howOpts:["Facebook","Instagram","Un amigo","Google","Otro"],
      deviceNote:"Completando tu registro desde",
      category:"Categoría de servicio", experience:"Años de experiencia",
      bio:"Descripción de tu servicio", portfolio:"Fotos de trabajos anteriores (hasta 3)",
      verifyId:"Verificar identidad (sube ID + selfie)", verifyNote:"La verificación genera más confianza y más clientes",
      verifyNow:"Verificar ahora", verifyLater:"Verificar después",
      next:"Siguiente →", back:"← Atrás", step:"Paso", of:"de",
      codeTitle:"Verifica tu correo", codeSub:"Enviamos un código a",
      demoCode:"Código demo:", confirm:"Confirmar", resend:"Reenviar código",
      already:"¿Ya tienes cuenta?",
    },
    br:{
      heroTitle:"Encuentra el profesional perfecto",
      heroSub:"Miles de proveedores verificados en tu sector",
      searchPlaceholder:"¿Qué necesitas? Ej: plomero, electricista...",
      allCats:"Todos", featuredLabel:"DESTACADOS", allLabel:"TODOS LOS PROVEEDORES",
      verTip:"Verificado con identificación gubernamental oficial",
      reviews:"reseñas", contactWA:"Contactar por WhatsApp",
      featuredBadge:"Destacado", noResults:"No encontramos proveedores en esta categoría aún.",
    },
    pj:{
      title:"Publica tu trabajo", sub:"Gratis. Los mejores profesionales te contactarán.",
      cat:"¿Qué tipo de servicio necesitas?", desc:"Describe el trabajo",
      descPh:"Sé específico: ej. 'Tengo una fuga bajo el fregadero de la cocina, necesito reparación urgente.'",
      sector:"Sector / Barrio", city:"Ciudad",
      budget:"Presupuesto estimado (RD$)", budgetPh:"Ej: 1500",
      urgency:"Urgencia", urgent:"Urgente (hoy)", soon:"Esta semana", flex:"Sin prisa",
      size:"Tamaño del trabajo", small:"Pequeño (1–2h)", medium:"Mediano (1 día)", large:"Grande (+1 día)",
      submit:"Publicar gratis →",
      successTitle:"¡Trabajo publicado!", successSub:"Los profesionales verificados en tu área lo verán de inmediato.",
      interestedTitle:"Profesionales interesados",
      interestedSub:"Estos proveedores tienen experiencia en trabajos similares.",
      postAnother:"Publicar otro trabajo",
    },
    cd:{
      title:"Mis Trabajos", sub:"Historial, métricas y gestión de tus solicitudes",
      posted:"Publicados", responses:"Respuestas", completed:"Completados",
      history:"Historial de trabajos", resp:"resp.", status:{ filled:"cubierto", open:"abierto", closed:"cerrado" },
    },
    pd:{
      title:"Mi Panel", sub:"Tu presencia, clientes y estadísticas",
      views:"Vistas al perfil", leads:"Leads recibidos", jobs:"Trabajos", rating:"Calificación",
      featuredCta:"Hazte Destacado", featuredDesc:"Aparece primero. Más clientes te ven.",
      featuredPrice:"RD$500/mes — 100% más visibilidad",
      recentLeads:"Leads recientes", editProfile:"Editar perfil", portfolio:"Mi Portafolio",
    },
    ad:{
      title:"Administración", sub:"Control total de la plataforma El Socio RD",
      tabs:{ overview:"Resumen", providers:"Proveedores", clients:"Clientes", jobs:"Trabajos", heatmap:"Demanda", pending:"Verificaciones" },
      stats:{ users:"Usuarios totales", providers:"Proveedores", clients:"Clientes", jobs:"Trabajos publicados", pending:"Verificaciones pendientes", featured:"Perfiles destacados" },
      csv:{ providers:"⬇ Descargar Proveedores CSV", clients:"⬇ Descargar Clientes CSV", jobs:"⬇ Descargar Trabajos CSV" },
      actions:{ verify:"✓ Verificar", reject:"✗ Rechazar", ban:"🚫 Banear", unban:"↩ Desbanear", feature:"⭐ Destacar", unfeature:"✕ Quitar destaque", editAccount:"Editar cuenta", viewProfile:"Ver perfil" },
      heatmap:{ title:"Mapa de Demanda por Sector", sub:"Basado en trabajos publicados — ideal para anunciantes", requests:"solicitudes" },
      pending:{ title:"Verificaciones Pendientes", none:"¡Todo al día! Sin verificaciones pendientes.", submitted:"Enviado", govId:"Cédula / ID", selfie:"Selfie" },
      banModal:{ title:"¿Banear esta cuenta?", desc:"El usuario perderá acceso permanentemente.", confirm:"Sí, banear", cancel:"Cancelar" },
      editModal:{ title:"Editar cuenta", save:"Guardar cambios", cancel:"Cancelar" },
      verified:"Verificado", unverified:"No verificado", banned:"Baneado", featured:"Destacado",
      internal:"INTERNO",
    },
    cats:["Plomería","Electricidad","Limpieza","Tutoría","Carpintería","Belleza","Fotografía","Masajes","IT / Soporte","Pintura","Jardinería","Mudanzas"],
    toast:{ verified:"✓ Proveedor verificado", rejected:"✕ Solicitud rechazada", banned:"🚫 Cuenta baneada", unbanned:"↩ Cuenta desban​eada", featured:"⭐ Perfil destacado", unfeatured:"Destaque removido", saved:"✓ Cambios guardados", copied:"Copiado al portapapeles" },
  },
  en: {
    brand:"El Socio RD", tagline:"Verified services, trusted people",
    nav:{ browse:"Browse", post:"Post a Job", client:"Client Panel", provider:"Provider Panel", admin:"Admin" },
    theme:{ dark:"Light Mode", light:"Dark Mode" }, lang:"Español",
    signup:"Sign Up", login:"Log In", loggedAs:"Logged in", demo:"Demo",
    su:{
      title:"Welcome to El Socio RD", sub:"The trusted services platform for the Dominican Republic",
      asClient:"I need a service", asProvider:"I offer services",
      name:"Full name", email:"Email address", phone:"Phone number",
      whatsapp:"WhatsApp (if different)", password:"Password",
      sector:"Neighborhood / Sector", city:"City", howHeard:"How did you find us?",
      howOpts:["Facebook","Instagram","A friend","Google","Other"],
      deviceNote:"Completing registration from",
      category:"Service category", experience:"Years of experience",
      bio:"Describe your service", portfolio:"Portfolio photos (up to 3)",
      verifyId:"Verify identity (upload ID + selfie)", verifyNote:"Verification builds trust and brings more clients",
      verifyNow:"Verify now", verifyLater:"Verify later",
      next:"Next →", back:"← Back", step:"Step", of:"of",
      codeTitle:"Verify your email", codeSub:"We sent a code to",
      demoCode:"Demo code:", confirm:"Confirm", resend:"Resend code",
      already:"Already have an account?",
    },
    br:{
      heroTitle:"Find the perfect professional",
      heroSub:"Thousands of verified providers in your area",
      searchPlaceholder:"What do you need? E.g: plumber, electrician...",
      allCats:"All", featuredLabel:"FEATURED", allLabel:"ALL PROVIDERS",
      verTip:"Verified with official government identification",
      reviews:"reviews", contactWA:"Contact via WhatsApp",
      featuredBadge:"Featured", noResults:"No providers in this category yet.",
    },
    pj:{
      title:"Post your job", sub:"Free. The best professionals will contact you.",
      cat:"What type of service do you need?", desc:"Describe the job",
      descPh:"Be specific: e.g. 'I have a leak under the kitchen sink, need urgent repair.'",
      sector:"Neighborhood / Sector", city:"City",
      budget:"Estimated budget (RD$)", budgetPh:"E.g: 1500",
      urgency:"Urgency", urgent:"Urgent (today)", soon:"This week", flex:"Flexible",
      size:"Job size", small:"Small (1–2h)", medium:"Medium (1 day)", large:"Large (+1 day)",
      submit:"Post for free →",
      successTitle:"Job posted!", successSub:"Verified professionals in your area will see it immediately.",
      interestedTitle:"Interested professionals",
      interestedSub:"These providers have experience with similar jobs.",
      postAnother:"Post another job",
    },
    cd:{
      title:"My Jobs", sub:"History, metrics and management of your requests",
      posted:"Posted", responses:"Responses", completed:"Completed",
      history:"Job history", resp:"resp.", status:{ filled:"filled", open:"open", closed:"closed" },
    },
    pd:{
      title:"My Dashboard", sub:"Your presence, clients and stats",
      views:"Profile views", leads:"Leads received", jobs:"Jobs", rating:"Rating",
      featuredCta:"Get Featured", featuredDesc:"Appear first. More clients see you.",
      featuredPrice:"RD$500/mo — 100% more visibility",
      recentLeads:"Recent leads", editProfile:"Edit profile", portfolio:"My Portfolio",
    },
    ad:{
      title:"Administration", sub:"Full platform control for El Socio RD",
      tabs:{ overview:"Overview", providers:"Providers", clients:"Clients", jobs:"Jobs", heatmap:"Demand Map", pending:"Verifications" },
      stats:{ users:"Total users", providers:"Providers", clients:"Clients", jobs:"Jobs posted", pending:"Pending verifications", featured:"Featured profiles" },
      csv:{ providers:"⬇ Download Providers CSV", clients:"⬇ Download Clients CSV", jobs:"⬇ Download Jobs CSV" },
      actions:{ verify:"✓ Verify", reject:"✗ Reject", ban:"🚫 Ban", unban:"↩ Unban", feature:"⭐ Feature", unfeature:"✕ Unfeature", editAccount:"Edit account", viewProfile:"View profile" },
      heatmap:{ title:"Demand Map by Neighborhood", sub:"Based on posted jobs — ideal for advertiser presentations", requests:"requests" },
      pending:{ title:"Pending Verifications", none:"All clear! No pending verifications.", submitted:"Submitted", govId:"Gov ID", selfie:"Selfie" },
      banModal:{ title:"Ban this account?", desc:"The user will permanently lose access.", confirm:"Yes, ban", cancel:"Cancel" },
      editModal:{ title:"Edit account", save:"Save changes", cancel:"Cancel" },
      verified:"Verified", unverified:"Unverified", banned:"Banned", featured:"Featured",
      internal:"INTERNAL",
    },
    cats:["Plumbing","Electrical","Cleaning","Tutoring","Carpentry","Beauty","Photography","Massage","IT Support","Painting","Gardening","Moving"],
    toast:{ verified:"✓ Provider verified", rejected:"✕ Request rejected", banned:"🚫 Account banned", unbanned:"↩ Account unbanned", featured:"⭐ Profile featured", unfeatured:"Feature removed", saved:"✓ Changes saved", copied:"Copied to clipboard" },
  }
};

// ── SEED DATA ─────────────────────────────────────────────────────
const PROVIDERS_SEED = [
  { id:1, accountNo:"ESR-P-00001", name:"Marcus Rivera", category:"Plomería", rating:4.9, reviews:134, sector:"Piantini", city:"Santo Domingo", verified:true, featured:true, banned:false, avatar:"MR", jobs:312, phone:"8095550001", whatsapp:"8095550001", email:"marcus@email.com", experience:"12 años", bio:"Plomero maestro certificado con 12 años de experiencia. Disponible 24/7 para emergencias. Trabajo garantizado.", portfolio:["🔧","🚿","🚰"], joinedDate:"Ene 2024", howHeard:"Facebook", device:"Android", leadCount:47 },
  { id:2, accountNo:"ESR-P-00002", name:"Tanya Wells", category:"Limpieza", rating:4.8, reviews:89, sector:"Naco", city:"Santo Domingo", verified:true, featured:true, banned:false, avatar:"TW", jobs:201, phone:"8095550002", whatsapp:"8095550002", email:"tanya@email.com", experience:"8 años", bio:"Especialista en limpieza profunda y mantenimiento del hogar. Productos ecológicos. Asegurada y con referencias.", portfolio:["🧹","✨","🏠"], joinedDate:"Feb 2024", howHeard:"Instagram", device:"iPhone", leadCount:38 },
  { id:3, accountNo:"ESR-P-00003", name:"Devon Park", category:"Electricidad", rating:4.7, reviews:56, sector:"Bella Vista", city:"Santo Domingo", verified:true, featured:false, banned:false, avatar:"DP", jobs:145, phone:"8095550003", whatsapp:"8095550003", email:"devon@email.com", experience:"10 años", bio:"Electricista certificado. Residencial y comercial. Presupuestos gratis el mismo día.", portfolio:["⚡","🔌","💡"], joinedDate:"Mar 2024", howHeard:"Un amigo", device:"Android", leadCount:29 },
  { id:4, accountNo:"ESR-P-00004", name:"Lucia Gomez", category:"Tutoría", rating:5.0, reviews:47, sector:"Evaristo Morales", city:"Santo Domingo", verified:true, featured:false, banned:false, avatar:"LG", jobs:98, phone:"8095550004", whatsapp:"8095550004", email:"lucia@email.com", experience:"6 años", bio:"Tutora de Matemáticas y Ciencias. Preparación SAT/ACT. El 100% de mis estudiantes mejoran sus notas.", portfolio:["📚","📐","🏆"], joinedDate:"Abr 2024", howHeard:"Google", device:"iPhone", leadCount:21 },
  { id:5, accountNo:"ESR-P-00005", name:"James Okoro", category:"Fotografía", rating:4.6, reviews:72, sector:"Gazcue", city:"Santo Domingo", verified:false, featured:false, banned:false, avatar:"JO", jobs:88, phone:"8095550005", whatsapp:"8095550005", email:"james@email.com", experience:"5 años", bio:"Fotógrafo de retratos y eventos. Edición profesional incluida. Disponible fines de semana.", portfolio:["📷","🎨","🌅"], joinedDate:"May 2024", howHeard:"Facebook", device:"Android", leadCount:15 },
  { id:7, accountNo:"ESR-P-00007", name:"Miguel Torres", category:"Carpintería", rating:4.8, reviews:63, sector:"Los Minas", city:"Santo Domingo", verified:true, featured:false, banned:false, avatar:"MT", jobs:134, phone:"8095550007", whatsapp:"8095550007", email:"miguel@email.com", experience:"14 años", bio:"Carpintero y ebanista con 14 años de experiencia. Muebles a medida, reparaciones y remodelaciones. Trabajo impecable garantizado.", portfolio:["🔨","🪑","🚪"], joinedDate:"Jul 2024", howHeard:"Un amigo", device:"Android", leadCount:26 },
  { id:7, accountNo:"ESR-P-00007", name:"Miguel Torres", category:"Carpintería", rating:4.8, reviews:63, sector:"Los Minas", city:"Santo Domingo", verified:true, featured:false, banned:false, avatar:"MT", jobs:134, phone:"8095550007", whatsapp:"8095550007", email:"miguel@email.com", experience:"14 años", bio:"Carpintero y ebanista con 14 años de experiencia. Muebles a medida, reparaciones y remodelaciones. Trabajo impecable garantizado.", portfolio:["🔨","🪑","🚪"], joinedDate:"Jul 2024", howHeard:"Un amigo", device:"Android", leadCount:26 },
  { id:6, accountNo:"ESR-P-00006", name:"Priya Nair", category:"Belleza", rating:4.9, reviews:110, sector:"Los Prados", city:"Santo Domingo", verified:true, featured:false, banned:false, avatar:"PN", jobs:220, phone:"8095550006", whatsapp:"8095550006", email:"priya@email.com", experience:"9 años", bio:"Estilista móvil. Cortes, color, trenzas y tratamientos. Voy a tu domicilio con todos los materiales.", portfolio:["✂️","💅","🌸"], joinedDate:"Jun 2024", howHeard:"Instagram", device:"iPhone", leadCount:44 },
];
const CLIENTS_SEED = [
  { id:101, accountNo:"ESR-C-00101", name:"Carlos Méndez", email:"carlos@email.com", phone:"8095551001", whatsapp:"8095551001", sector:"Piantini", city:"Santo Domingo", joinedDate:"Ene 2025", howHeard:"Facebook", device:"Android", jobsPosted:3, banned:false },
  { id:102, accountNo:"ESR-C-00102", name:"Ana Rodríguez", email:"ana@email.com", phone:"8095551002", whatsapp:"8095551002", sector:"Naco", city:"Santo Domingo", joinedDate:"Feb 2025", howHeard:"Un amigo", device:"iPhone", jobsPosted:5, banned:false },
  { id:103, accountNo:"ESR-C-00103", name:"Pedro Santana", email:"pedro@email.com", phone:"8095551003", whatsapp:"8095551003", sector:"Bella Vista", city:"Santo Domingo", joinedDate:"Feb 2025", howHeard:"Instagram", device:"Android", jobsPosted:2, banned:false },
  { id:104, accountNo:"ESR-C-00104", name:"María López", email:"maria@email.com", phone:"8095551004", whatsapp:"8095551004", sector:"Gazcue", city:"Santo Domingo", joinedDate:"Mar 2025", howHeard:"Google", device:"iPhone", jobsPosted:7, banned:false },
];
const JOBS_SEED = [
  { id:1, clientName:"Carlos M.", category:"Plomería", sector:"Piantini", city:"Santo Domingo", desc:"Fuga bajo el fregadero", budget:"1500", urgency:"urgent", size:"small", date:"Mar 6, 2025", responses:4, status:"filled", device:"Android", source:"Facebook" },
  { id:2, clientName:"Ana R.", category:"Electricidad", sector:"Naco", city:"Santo Domingo", desc:"Instalar 4 tomas nuevas", budget:"2000", urgency:"soon", size:"medium", date:"Mar 4, 2025", responses:3, status:"filled", device:"iPhone", source:"Instagram" },
  { id:3, clientName:"Pedro S.", category:"Limpieza", sector:"Bella Vista", city:"Santo Domingo", desc:"Limpieza profunda mudanza", budget:"900", urgency:"soon", size:"medium", date:"Mar 2, 2025", responses:5, status:"filled", device:"Android", source:"Un amigo" },
  { id:4, clientName:"María L.", category:"Tutoría", sector:"Gazcue", city:"Santo Domingo", desc:"Clases matemáticas 3x/semana", budget:"600", urgency:"flex", size:"large", date:"Feb 28, 2025", responses:2, status:"open", device:"iPhone", source:"Google" },
  { id:5, clientName:"Carlos M.", category:"Pintura", sector:"Piantini", city:"Santo Domingo", desc:"Pintar sala y comedor", budget:"4500", urgency:"soon", size:"large", date:"Feb 20, 2025", responses:4, status:"filled", device:"Android", source:"Facebook" },
];
const PENDING_SEED = [
  { id:7, name:"Roberto Díaz", category:"Carpintería", sector:"Santiago", city:"Santiago", submitted:"Hace 2h", avatar:"RD", email:"roberto@email.com", phone:"8095557001" },
  { id:8, name:"Carmen Santos", category:"Masajes", sector:"Bella Vista", city:"Santo Domingo", submitted:"Hace 5h", avatar:"CS", email:"carmen@email.com", phone:"8095557002" },
];
const HEATMAP_DATA = [
  { sector:"Piantini", jobs:47, color:"#E05252" },
  { sector:"Naco", jobs:38, color:"#E07B45" },
  { sector:"Bella Vista", jobs:34, color:"#E07B45" },
  { sector:"Gazcue", jobs:29, color:"#D4A843" },
  { sector:"Evaristo Morales", jobs:24, color:"#D4A843" },
  { sector:"Los Prados", jobs:19, color:"#5DB87A" },
  { sector:"Arroyo Hondo", jobs:15, color:"#5DB87A" },
  { sector:"La Esperilla", jobs:12, color:"#5DB87A" },
  { sector:"Miraflores", jobs:9, color:"#5B9BD5" },
  { sector:"Ciudad Nueva", jobs:7, color:"#5B9BD5" },
  { sector:"Santiago Centro", jobs:6, color:"#5B9BD5" },
  { sector:"Villa Olga", jobs:4, color:"#7A8C7E" },
];
const CAT_ICONS = {"Plomería":"🔧","Electricidad":"⚡","Limpieza":"🧹","Tutoría":"📚","Carpintería":"🔨","Belleza":"💇","Fotografía":"📷","Masajes":"🙌","IT / Soporte":"💻","Pintura":"🎨","Jardinería":"🌱","Mudanzas":"📦","Plumbing":"🔧","Electrical":"⚡","Cleaning":"🧹","Tutoring":"📚","Carpentry":"🔨","Beauty":"💇","Photography":"📷","Massage":"🙌","IT Support":"💻","Painting":"🎨","Gardening":"🌱","Moving":"📦"};

// ── UTILITIES ─────────────────────────────────────────────────────
// Seeded shuffle — consistent within a session, different each page load
function seededShuffle(arr) {
  const seed = Math.floor(Date.now() / 86400000); // changes daily
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function downloadCSV(data, filename) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => `"${String(row[h]??"").replace(/"/g,'""')}"`).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type:"text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href=url; a.download=filename; a.click();
  URL.revokeObjectURL(url);
}

// Animated counter hook
function useCountUp(target, duration=900) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0; const step = target / (duration / 16);
    const t = setInterval(() => { start += step; if (start >= target) { setVal(target); clearInterval(t); } else setVal(Math.floor(start)); }, 16);
    return () => clearInterval(t);
  }, [target]);
  return val;
}

// ── TOAST SYSTEM ──────────────────────────────────────────────────
function ToastContainer({ toasts }) {
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, display:"flex", flexDirection:"column", gap:8, pointerEvents:"none" }}>
      {toasts.map(t => (
        <div key={t.id} style={{ background: t.type==="error"?"#C0392B": t.type==="warn"?"#B8882A":"#1F7A4B", color:"#fff", padding:"11px 18px", borderRadius:12, fontSize:13, fontWeight:700, fontFamily:"Nunito Sans,sans-serif", boxShadow:"0 4px 20px #00000033", animation:`${t.exiting?"toastOut":"toastIn"} .3s ease`, minWidth:220, display:"flex", alignItems:"center", gap:8 }}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = (msg, type="success") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type, exiting:false }]);
    setTimeout(() => setToasts(p => p.map(t => t.id===id ? {...t, exiting:true} : t)), 2400);
    setTimeout(() => setToasts(p => p.filter(t => t.id!==id)), 2700);
  };
  return { toasts, push };
}

// ── RIPPLE BUTTON ─────────────────────────────────────────────────
function Btn({ children, onClick, color, outline, full, size="md", disabled, C, pulse: doPulse }) {
  const [ripples, setRipples] = useState([]);
  const bg = outline ? "transparent" : (color || C.accent);
  const tc = outline ? (color||C.accent) : "#fff";
  const pad = size==="sm" ? "6px 13px" : size==="lg" ? "14px 28px" : "10px 20px";
  const fs = size==="sm" ? 11 : size==="lg" ? 15 : 13;

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left; const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(r => [...r, { id, x, y }]);
    setTimeout(() => setRipples(r => r.filter(rr => rr.id !== id)), 600);
    onClick && onClick(e);
  };

  return (
    <button onClick={handleClick} disabled={disabled}
      style={{ position:"relative", overflow:"hidden", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, padding:pad, borderRadius:10, border:`1.5px solid ${outline?(color||C.accent):bg}`, background:disabled?C.faint:bg, color:disabled?C.muted:tc, fontSize:fs, fontWeight:700, cursor:disabled?"default":"pointer", fontFamily:"Nunito Sans,sans-serif", width:full?"100%":"auto", transition:"transform .12s, opacity .12s, box-shadow .2s", opacity:disabled?.55:1, letterSpacing:"0.01em", animation: doPulse?"pulse 2s infinite":undefined }}
      onMouseEnter={e=>{ if(!disabled){e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 4px 16px ${(color||C.accent)}44`;}}}
      onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none";}}>
      {ripples.map(r => (
        <span key={r.id} style={{ position:"absolute", left:r.x, top:r.y, width:10, height:10, borderRadius:"50%", background:"#ffffff44", transform:"translate(-50%,-50%) scale(0)", animation:"ripple .55s ease-out forwards", pointerEvents:"none" }}/>
      ))}
      {children}
    </button>
  );
}

// ── UI PRIMITIVES ─────────────────────────────────────────────────
function Stars({ n, size=12 }) {
  return <span>{[1,2,3,4,5].map(i => <span key={i} style={{ fontSize:size, color:i<=Math.round(n)?"#D4A843":"#ccc5b8" }}>★</span>)}</span>;
}
function Tag({ children, color, C }) {
  const c = color||C.accent;
  return <span style={{ background:`${c}18`, color:c, border:`1px solid ${c}30`, borderRadius:6, padding:"2px 9px", fontSize:11, fontWeight:700, letterSpacing:"0.03em", textTransform:"uppercase", whiteSpace:"nowrap", fontFamily:"Nunito Sans,sans-serif" }}>{children}</span>;
}
function Av({ init, size=40, color }) {
  const c = color||"#5DB87A";
  return <div style={{ width:size, height:size, borderRadius:"50%", background:`linear-gradient(135deg,${c}25,${c}55)`, border:`2px solid ${c}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*.34, fontWeight:900, color:c, flexShrink:0, fontFamily:"Nunito,sans-serif" }}>{init}</div>;
}
function VerBadge({ tip, C }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, cursor:"default", position:"relative" }}
      onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)}>
      <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:18, height:18, borderRadius:"50%", background:"linear-gradient(135deg,#1d6b3a,#2fa854)", color:"#fff", fontSize:10, fontWeight:900, flexShrink:0, animation:"pulse 2.5s infinite" }}>✓</span>
      <span style={{ fontSize:11, fontWeight:700, color:"#2fa854", fontFamily:"Nunito Sans,sans-serif", whiteSpace:"nowrap" }}>ID Verificado</span>
      {show && (
        <div style={{ position:"absolute", top:"calc(100% + 8px)", left:0, background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:"9px 13px", fontSize:11, color:C.text, width:220, lineHeight:1.6, boxShadow:C.shadow, zIndex:99999, pointerEvents:"none", fontFamily:"Nunito Sans,sans-serif", animation:"scaleIn .15s ease" }}>
          {tip}
        </div>
      )}
    </span>
  );
}

function Input({ label, value, onChange, type="text", placeholder="", C, icon }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom:14 }}>
      {label && <label style={{ fontSize:11, fontWeight:700, color:focused?C.accent:C.muted, display:"block", marginBottom:5, letterSpacing:"0.06em", textTransform:"uppercase", fontFamily:"Nunito Sans,sans-serif", transition:"color .15s" }}>{label}</label>}
      <div style={{ position:"relative" }}>
        {icon && <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:14, pointerEvents:"none", transition:"transform .15s", transform: focused?"translateY(-50%) scale(1.1)":"translateY(-50%) scale(1)" }}>{icon}</span>}
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          style={{ width:"100%", padding:`11px 13px 11px ${icon?"38px":"13px"}`, borderRadius:10, background:C.surface, border:`1.5px solid ${focused?C.accent:C.border}`, color:C.text, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"Nunito Sans,sans-serif", transition:"border .15s, box-shadow .15s", boxShadow:focused?`0 0 0 3px ${C.accent}18`:"none" }}
          onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} />
      </div>
    </div>
  );
}
function Modal({ children, onClose, C, width=460 }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"#00000077", display:"flex", alignItems:"center", justifyContent:"center", zIndex:400, padding:16, animation:"fadeIn .2s ease" }}>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:32, width, maxWidth:"100%", boxShadow:C.shadow, position:"relative", maxHeight:"90vh", overflowY:"auto", animation:"scaleIn .2s ease" }}>
        <button onClick={onClose} style={{ position:"absolute", top:14, right:16, background:C.faint, border:"none", color:C.muted, fontSize:16, cursor:"pointer", lineHeight:1, borderRadius:"50%", width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", transition:"background .15s" }}
          onMouseEnter={e=>e.currentTarget.style.background=C.border} onMouseLeave={e=>e.currentTarget.style.background=C.faint}>✕</button>
        {children}
      </div>
    </div>
  );
}

// ── BRAND NAME with gradient ──────────────────────────────────────
function BrandName({ size=21, C }) {
  return (
    <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:size, fontWeight:900, letterSpacing:"-0.02em", background:"linear-gradient(135deg, #2fa854 0%, #1a8c6e 50%, #0e7a9a 100%)", backgroundSize:"200% 200%", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:"gradShift 4s ease infinite" }}>
      {T.es.brand}
    </span>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────────
function Sidebar({ view, setView, t, C, dark, setDark, lang, setLang, onSignup }) {
  const nav = [
    {id:"browse", ic:"◈", l:t.nav.browse},
    {id:"post",   ic:"✦", l:t.nav.post},
    {id:"client", ic:"⊙", l:t.nav.client},
    {id:"provider",ic:"◎",l:t.nav.provider},
    {id:"admin",  ic:"⬡", l:t.nav.admin},
  ];
  return (
    <div style={{ width:232, background:C.surface, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", flexShrink:0 }}>
      <div style={{ padding:"24px 20px 16px", borderBottom:`1px solid ${C.border}` }}>
        <BrandName size={22} C={C}/>
        <div style={{ fontSize:10, color:C.muted, marginTop:4, fontFamily:"Nunito Sans,sans-serif", lineHeight:1.4 }}>{t.tagline}</div>
      </div>
      <nav style={{ flex:1, padding:"10px 8px" }}>
        {nav.map(n => {
          const active = view===n.id;
          return (
            <button key={n.id} onClick={()=>setView(n.id)}
              style={{ display:"flex", alignItems:"center", gap:9, width:"100%", padding:"10px 12px", borderRadius:10, border:"none", cursor:"pointer", marginBottom:2, textAlign:"left", background:active?`${C.accent}18`:"transparent", color:active?C.accent:C.muted, fontSize:13, fontWeight:active?700:500, borderLeft:active?`3px solid ${C.accent}`:"3px solid transparent", transition:"all .18s", fontFamily:"Nunito Sans,sans-serif", position:"relative" }}
              onMouseEnter={e=>{ if(!active){e.currentTarget.style.background=C.faint; e.currentTarget.style.color=C.text;}}}
              onMouseLeave={e=>{ if(!active){e.currentTarget.style.background="transparent"; e.currentTarget.style.color=C.muted;}}}>
              <span style={{ fontSize:15, transition:"transform .2s", transform:active?"scale(1.15)":"scale(1)" }}>{n.ic}</span>
              {n.l}
              {active && <span style={{ marginLeft:"auto", width:6, height:6, borderRadius:"50%", background:C.accent, animation:"pulse 2s infinite" }}/>}
            </button>
          );
        })}
      </nav>
      <div style={{ padding:"12px 10px 20px", borderTop:`1px solid ${C.border}`, display:"flex", flexDirection:"column", gap:7 }}>
        <button onClick={()=>setDark(d=>!d)} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 11px", borderRadius:9, background:C.faint, border:"none", color:C.text, fontSize:12, cursor:"pointer", fontWeight:600, fontFamily:"Nunito Sans,sans-serif", transition:"background .15s" }}
          onMouseEnter={e=>e.currentTarget.style.background=C.border} onMouseLeave={e=>e.currentTarget.style.background=C.faint}>
          {dark?"☀️":"🌙"} {dark?t.theme.dark:t.theme.light}
        </button>
        <button onClick={()=>setLang(l=>l==="es"?"en":"es")} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 11px", borderRadius:9, background:C.faint, border:"none", color:C.text, fontSize:12, cursor:"pointer", fontWeight:600, fontFamily:"Nunito Sans,sans-serif", transition:"background .15s" }}
          onMouseEnter={e=>e.currentTarget.style.background=C.border} onMouseLeave={e=>e.currentTarget.style.background=C.faint}>
          🌐 {t.lang}
        </button>
        <Btn onClick={onSignup} full C={C} pulse>{t.signup}</Btn>
        <div style={{ paddingLeft:2, marginTop:2 }}>
          <div style={{ fontSize:10, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{t.loggedAs}</div>
          <div style={{ fontSize:12, color:C.text, fontWeight:700, marginTop:1, fontFamily:"Nunito Sans,sans-serif" }}>{t.demo}</div>
        </div>
      </div>
    </div>
  );
}

// ── SIGNUP MODAL ──────────────────────────────────────────────────
function SignupModal({ C, t, onClose }) {
  const s = t.su;
  const [role, setRole] = useState(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name:"", email:"", phone:"", whatsapp:"", password:"", sector:"", city:"Santo Domingo", howHeard:"", category:"", experience:"", bio:"", verifyNow:true });
  const [code, setCode] = useState(["","","","","",""]);
  const [done, setDone] = useState(false);
  const upd = (k,v) => setForm(f=>({...f,[k]:v}));
  const handleCode = (i,v) => { const c=[...code]; c[i]=v.slice(-1); setCode(c); if(v&&i<5) document.getElementById(`code-${i+1}`)?.focus(); };
  const steps = role==="provider" ? 4 : 3;

  if (done) return (
    <Modal onClose={onClose} C={C} width={400}>
      <div style={{ textAlign:"center", padding:"16px 0" }}>
        <div style={{ fontSize:52, animation:"checkPop .5s cubic-bezier(.175,.885,.32,1.275)", display:"inline-block" }}>🎉</div>
        <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:22, fontWeight:900, color:C.text, margin:"14px 0 8px" }}>¡Bienvenido{role==="provider"?" proveedor":""}!</h2>
        <p style={{ color:C.muted, fontSize:14, fontFamily:"Nunito Sans,sans-serif", lineHeight:1.6 }}>Tu cuenta ha sido creada en <BrandName size={14} C={C}/>. Ya puedes explorar la plataforma.</p>
        <div style={{ marginTop:20 }}><Btn onClick={onClose} full C={C} size="lg">Comenzar →</Btn></div>
      </div>
    </Modal>
  );

  return (
    <Modal onClose={onClose} C={C} width={480}>
      {!role && (
        <div style={{ animation:"fadeSlideUp .25s ease" }}>
          <div style={{ textAlign:"center", marginBottom:24 }}>
            <BrandName size={28} C={C}/>
            <p style={{ fontSize:13, color:C.muted, margin:"8px 0 0", fontFamily:"Nunito Sans,sans-serif" }}>{s.sub}</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:18 }}>
            {[{id:"client",l:s.asClient,ic:"🔍",desc:"Encuentra profesionales verificados"},{id:"provider",l:s.asProvider,ic:"🛠️",desc:"Recibe clientes y haz crecer tu negocio"}].map(r=>(
              <button key={r.id} onClick={()=>setRole(r.id)}
                style={{ padding:"22px 14px", borderRadius:14, border:`2px solid ${C.border}`, background:C.surface, cursor:"pointer", textAlign:"center", transition:"all .2s", fontFamily:"Nunito Sans,sans-serif" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.background=C.accent+"12";e.currentTarget.style.transform="translateY(-2px)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.surface;e.currentTarget.style.transform="translateY(0)";}}>
                <div style={{ fontSize:30, marginBottom:8 }}>{r.ic}</div>
                <div style={{ fontWeight:700, fontSize:14, color:C.text, marginBottom:4 }}>{r.l}</div>
                <div style={{ fontSize:11, color:C.muted }}>{r.desc}</div>
              </button>
            ))}
          </div>
          <div style={{ textAlign:"center", fontSize:12, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{s.already} <span style={{ color:C.accent, cursor:"pointer", fontWeight:700 }}>{t.login}</span></div>
        </div>
      )}

      {role && step < steps-1 && (
        <div key={step} style={{ animation:"fadeSlideUp .2s ease" }}>
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif", marginBottom:8 }}>{s.step} {step+1} {s.of} {steps-1}</div>
            <div style={{ display:"flex", gap:4, marginBottom:14 }}>
              {Array.from({length:steps-1}).map((_,i)=>(
                <div key={i} style={{ height:4, flex:1, borderRadius:99, background:i<=step?C.accent:C.border, transition:"background .35s ease" }}/>
              ))}
            </div>
            <h2 style={{ fontSize:18, fontWeight:800, color:C.text, margin:0, fontFamily:"'Nunito',sans-serif" }}>
              {step===0?"Información básica":step===1?"Ubicación y más":role==="provider"?"Tu servicio":"Verificar correo"}
            </h2>
          </div>

          {step===0 && <>
            <Input label={s.name} value={form.name} onChange={e=>upd("name",e.target.value)} icon="👤" C={C}/>
            <Input label={s.email} value={form.email} onChange={e=>upd("email",e.target.value)} type="email" icon="✉️" C={C}/>
            <Input label={s.phone} value={form.phone} onChange={e=>upd("phone",e.target.value)} type="tel" icon="📱" C={C}/>
            <Input label={s.whatsapp} value={form.whatsapp} onChange={e=>upd("whatsapp",e.target.value)} type="tel" icon="💬" placeholder="Si es diferente al teléfono" C={C}/>
            <Input label={s.password} value={form.password} onChange={e=>upd("password",e.target.value)} type="password" icon="🔒" C={C}/>
          </>}

          {step===1 && <>
            <Input label={s.sector} value={form.sector} onChange={e=>upd("sector",e.target.value)} icon="📍" placeholder="Ej: Piantini, Naco, Gazcue" C={C}/>
            <Input label={s.city} value={form.city} onChange={e=>upd("city",e.target.value)} icon="🏙️" C={C}/>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:7, letterSpacing:"0.06em", textTransform:"uppercase", fontFamily:"Nunito Sans,sans-serif" }}>{s.howHeard}</label>
              <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                {s.howOpts.map(o=>(
                  <button key={o} onClick={()=>upd("howHeard",o)}
                    style={{ padding:"7px 14px", borderRadius:20, fontSize:12, fontWeight:600, border:`1.5px solid ${form.howHeard===o?C.accent:C.border}`, background:form.howHeard===o?C.accent+"18":"transparent", color:form.howHeard===o?C.accent:C.muted, cursor:"pointer", fontFamily:"Nunito Sans,sans-serif", transition:"all .15s", transform:form.howHeard===o?"scale(1.06)":"scale(1)" }}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ background:C.faint, borderRadius:9, padding:"10px 13px", fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>
              {s.deviceNote} <strong style={{color:C.text}}>{/Mobi/.test(navigator.userAgent)?"dispositivo móvil":"computadora"}</strong>
            </div>
          </>}

          {step===2 && role==="provider" && <>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:7, letterSpacing:"0.06em", textTransform:"uppercase", fontFamily:"Nunito Sans,sans-serif" }}>{s.category}</label>
              <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                {t.cats.map(c=>(
                  <button key={c} onClick={()=>upd("category",c)}
                    style={{ padding:"7px 13px", borderRadius:9, fontSize:12, fontWeight:600, border:`1.5px solid ${form.category===c?C.accent:C.border}`, background:form.category===c?C.accent+"18":"transparent", color:form.category===c?C.accent:C.muted, cursor:"pointer", fontFamily:"Nunito Sans,sans-serif", transition:"all .15s" }}>
                    {CAT_ICONS[c]} {c}
                  </button>
                ))}
              </div>
            </div>
            <Input label={s.experience} value={form.experience} onChange={e=>upd("experience",e.target.value)} icon="📅" placeholder="Ej: 5 años" C={C}/>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:7, letterSpacing:"0.06em", textTransform:"uppercase", fontFamily:"Nunito Sans,sans-serif" }}>{s.bio}</label>
              <textarea value={form.bio} onChange={e=>upd("bio",e.target.value)} rows={3}
                style={{ width:"100%", padding:"11px 13px", borderRadius:10, background:C.surface, border:`1.5px solid ${C.border}`, color:C.text, fontSize:13, outline:"none", resize:"vertical", boxSizing:"border-box", fontFamily:"Nunito Sans,sans-serif", transition:"border .15s" }}
                onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border}/>
            </div>
            <div style={{ background:`${C.accent}10`, border:`1.5px solid ${C.accent}30`, borderRadius:12, padding:"14px 16px" }}>
              <div style={{ fontWeight:700, fontSize:13, color:C.accent, marginBottom:4, fontFamily:"Nunito Sans,sans-serif" }}>🛡️ {s.verifyId}</div>
              <div style={{ fontSize:11, color:C.muted, marginBottom:10, fontFamily:"Nunito Sans,sans-serif" }}>{s.verifyNote}</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {[{v:true,l:s.verifyNow},{v:false,l:s.verifyLater}].map(opt=>(
                  <button key={String(opt.v)} onClick={()=>upd("verifyNow",opt.v)}
                    style={{ padding:"9px", borderRadius:9, border:`1.5px solid ${form.verifyNow===opt.v?C.accent:C.border}`, background:form.verifyNow===opt.v?C.accent+"22":"transparent", color:form.verifyNow===opt.v?C.accent:C.muted, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"Nunito Sans,sans-serif", transition:"all .15s" }}>
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
          </>}

          <div style={{ display:"flex", gap:9, marginTop:20 }}>
            {step>0 && <Btn onClick={()=>setStep(x=>x-1)} outline C={C}>{s.back}</Btn>}
            <Btn onClick={()=>setStep(x=>x+1)} full C={C}>{s.next}</Btn>
          </div>
        </div>
      )}

      {role && step===steps-1 && (
        <div style={{ animation:"fadeSlideUp .2s ease" }}>
          <div style={{ textAlign:"center", marginBottom:24 }}>
            <div style={{ fontSize:44, marginBottom:10 }}>📧</div>
            <h2 style={{ fontSize:18, fontWeight:800, color:C.text, margin:"0 0 6px", fontFamily:"'Nunito',sans-serif" }}>{s.codeTitle}</h2>
            <p style={{ fontSize:13, color:C.muted, margin:"0 0 4px", fontFamily:"Nunito Sans,sans-serif" }}>{s.codeSub}</p>
            <p style={{ fontSize:13, color:C.accent, fontWeight:700, fontFamily:"Nunito Sans,sans-serif" }}>{form.email||"tu@correo.com"}</p>
            <div style={{ display:"inline-block", background:C.faint, border:`1px solid ${C.border}`, borderRadius:7, padding:"5px 12px", fontSize:11, color:C.muted, marginTop:6, fontFamily:"Nunito Sans,sans-serif" }}>{s.demoCode} <strong style={{color:C.accent}}>4 8 2 1 9 3</strong></div>
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:20 }}>
            {code.map((c,i)=>(
              <input key={i} id={`code-${i}`} value={c} onChange={e=>handleCode(i,e.target.value)} maxLength={1}
                style={{ width:48, height:56, textAlign:"center", fontSize:24, fontWeight:800, borderRadius:10, background:C.surface, border:`2px solid ${c?C.accent:C.border}`, color:C.text, outline:"none", fontFamily:"Nunito,sans-serif", transition:"border .15s, transform .12s", transform:c?"scale(1.05)":"scale(1)" }}/>
            ))}
          </div>
          <Btn full onClick={()=>setDone(true)} C={C} size="lg">{s.confirm}</Btn>
          <button style={{ width:"100%", marginTop:8, padding:"10px", background:"transparent", border:"none", color:C.muted, fontSize:12, cursor:"pointer", fontFamily:"Nunito Sans,sans-serif" }}
            onMouseEnter={e=>e.currentTarget.style.color=C.text} onMouseLeave={e=>e.currentTarget.style.color=C.muted}>{s.resend}</button>
        </div>
      )}
    </Modal>
  );
}

// ── PROVIDER CARD ─────────────────────────────────────────────────
function ProvCard({ p, C, t, featured }) {
  const b = t.br;
  const [saved, setSaved] = useState(false);
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        background: C.card,
        border: featured
          ? `1.5px solid ${hovered ? C.gold : C.gold+"99"}`
          : `1.5px solid ${hovered ? C.accent : C.border}`,
        borderTop: featured ? `3px solid ${C.gold}` : undefined,
        borderRadius: 16,
        overflow: "visible",
        transition: "transform .2s, box-shadow .2s, border-color .2s",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: featured
          ? (hovered ? `0 0 0 2px ${C.gold}44, ${C.shadow}` : `0 0 0 2px ${C.gold}28`)
          : (hovered ? C.shadow : "none"),
        position: "relative",
        animation: "fadeSlideUp .3s ease",
      }}
      onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>

      {/* Featured: star badge only — border-top handles the gold line */}
      {featured && (
        <div style={{ position:"absolute", top:8, left:8, zIndex:3, width:18, height:18, borderRadius:"50%", background:`linear-gradient(135deg,${C.gold},${C.gold}bb)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"#fff", boxShadow:`0 2px 6px ${C.gold}66` }}>
          ★
        </div>
      )}
      {/* Save button — moves right when featured badge present */}
      <button onClick={()=>setSaved(s=>!s)}
        style={{ position:"absolute", top:10, right:10, zIndex:3, background:saved?C.gold+"22":"#00000018", border:`1px solid ${saved?C.gold:C.border}`, borderRadius:"50%", width:30, height:30, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, transition:"all .2s", transform:saved?"scale(1.15)":"scale(1)" }}>
        {saved?"❤️":"🤍"}
      </button>

      {/* Header */}
      <div style={{ background: featured ? `linear-gradient(135deg,${C.gold}0a,${C.faint})` : `linear-gradient(135deg,${C.faint},${C.surface})`, padding:`${featured?"24px":"18px"} 16px 14px`, borderBottom:`1px solid ${featured?C.gold+"33":C.border}`, borderRadius:"14px 14px 0 0", overflow:"hidden" }}>
        <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
          <Av init={p.avatar} size={48} color={C.accent}/>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
              <span style={{ fontWeight:800, fontSize:15, color:C.text, fontFamily:"'Nunito',sans-serif" }}>{p.name}</span>
              {p.verified && <VerBadge tip={b.verTip} C={C}/>}
            </div>
            <div style={{ fontSize:12, color:C.muted, fontFamily:"Nunito Sans,sans-serif", marginBottom:5 }}>{CAT_ICONS[p.category]} {p.category} · 📍 {p.sector}</div>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              <Stars n={p.rating}/>
              <span style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{p.rating} ({p.reviews} {b.reviews})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio */}
      <div style={{ display:"flex", gap:6, padding:"10px 14px", borderBottom:`1px solid ${C.border}`, background:C.faint }}>
        {p.portfolio.map((item,i)=>(
          <div key={i} style={{ width:44, height:44, borderRadius:8, background:C.surface, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, transition:"transform .15s" }}
            onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
            {item}
          </div>
        ))}
      </div>

      {/* Body */}
      <div style={{ padding:"12px 16px 14px" }}>
        <p style={{ fontSize:13, color:C.muted, margin:"0 0 12px", lineHeight:1.6, fontFamily:"Nunito Sans,sans-serif" }}>{p.bio}</p>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:12, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>📍 {p.sector}, {p.city}</span>
          <a href={`https://wa.me/1${p.whatsapp||p.phone}`} target="_blank" rel="noreferrer"
            style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"8px 14px", borderRadius:9, background:"#25D366", color:"#fff", fontSize:12, fontWeight:700, textDecoration:"none", fontFamily:"Nunito Sans,sans-serif", transition:"transform .15s, box-shadow .15s" }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 4px 14px #25D36655";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
            💬 {b.contactWA}
          </a>
        </div>
      </div>
    </div>
  );
}

// ── BROWSE VIEW ───────────────────────────────────────────────────
function BrowseView({ C, t }) {
  const b = t.br;
  const [cat, setCat] = useState(null);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  // Shuffle featured on every page load so all featured providers get equal exposure
  const [featuredOrder] = useState(() => seededShuffle(PROVIDERS_SEED.filter(p=>p.featured && !p.banned).map(p=>p.id)));

  const filtered = PROVIDERS_SEED.filter(p =>
    !p.banned &&
    (!cat || p.category===cat) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))
  );
  const featured = featuredOrder
    .map(id => filtered.find(p => p.id === id))
    .filter(Boolean);
  const rest = filtered.filter(p=>!p.featured);

  return (
    <div style={{ flex:1, overflowY:"auto", background:C.bg }}>
      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg, ${C.surface} 0%, ${C.faint} 100%)`, borderBottom:`1px solid ${C.border}`, padding:"32px 28px 24px", animation:"fadeSlideUp .4s ease" }}>
        <h1 style={{ fontFamily:"'Nunito',sans-serif", fontSize:28, fontWeight:900, color:C.text, margin:"0 0 6px", lineHeight:1.2 }}>{b.heroTitle}</h1>
        <p style={{ fontSize:14, color:C.muted, margin:"0 0 18px", fontFamily:"Nunito Sans,sans-serif" }}>{b.heroSub}</p>
        {/* Search */}
        <div style={{ position:"relative", maxWidth:500 }}>
          <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:16, transition:"transform .2s", transform: searchFocused?"translateY(-50%) scale(1.1)":"translateY(-50%)" }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={b.searchPlaceholder}
            style={{ width:"100%", padding:"13px 16px 13px 44px", borderRadius:12, background:C.card, border:`1.5px solid ${searchFocused?C.accent:C.border}`, color:C.text, fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"Nunito Sans,sans-serif", transition:"border .15s, box-shadow .15s", boxShadow:searchFocused?`0 0 0 4px ${C.accent}18`:"none" }}
            onFocus={()=>setSearchFocused(true)} onBlur={()=>setSearchFocused(false)}/>
          {search && (
            <button onClick={()=>setSearch("")} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:16, lineHeight:1, padding:4 }}>✕</button>
          )}
        </div>
      </div>

      {/* Main layout */}
      <div style={{ display:"flex", alignItems:"flex-start" }}>
        {/* Feed */}
        <div style={{ flex:1, padding:"22px 22px 22px 28px", minWidth:0 }}>
          {/* Category pills */}
          <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:22 }}>
            {[null,...t.cats].map((c,i)=>{
              const active = c===null?!cat:cat===c;
              return (
                <button key={i} onClick={()=>setCat(c===null?null:c)}
                  style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 14px", borderRadius:22, fontSize:12, fontWeight:600, cursor:"pointer", border:`1.5px solid ${active?C.accent:C.border}`, background:active?C.accent:"transparent", color:active?"#fff":C.muted, transition:"all .2s", transform:active?"scale(1.04)":"scale(1)", fontFamily:"Nunito Sans,sans-serif", boxShadow:active?`0 2px 10px ${C.accent}44`:"none" }}
                  onMouseEnter={e=>{ if(!active){e.currentTarget.style.borderColor=C.accent; e.currentTarget.style.color=C.accent;}}}
                  onMouseLeave={e=>{ if(!active){e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.muted;}}}>
                  {c && <span>{CAT_ICONS[c]||"🛠️"}</span>}{c===null?b.allCats:c}
                </button>
              );
            })}
          </div>

          {/* Featured */}
          {featured.length>0 && <>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
              <div style={{ height:1, flex:1, background:`linear-gradient(90deg,${C.gold}44,transparent)` }}/>
              <span style={{ fontSize:10, fontWeight:800, color:C.gold, letterSpacing:"0.12em", fontFamily:"Nunito Sans,sans-serif" }}>⭐ {b.featuredLabel}</span>
              <div style={{ height:1, flex:1, background:`linear-gradient(90deg,transparent,${C.gold}44)` }}/>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16, marginBottom:26 }}>
              {featured.map(p=><ProvCard key={p.id} p={p} C={C} t={t} featured/>)}
            </div>
          </>}

          {/* All */}
          <div style={{ fontSize:10, fontWeight:700, color:C.muted, letterSpacing:"0.1em", marginBottom:14, fontFamily:"Nunito Sans,sans-serif" }}>{b.allLabel} ({rest.length})</div>
          {rest.length===0
            ? <div style={{ textAlign:"center", padding:"40px 0", color:C.muted, fontFamily:"Nunito Sans,sans-serif", animation:"fadeIn .3s ease" }}>
                <div style={{ fontSize:36, marginBottom:8 }}>🔍</div>
                {b.noResults}
              </div>
            : <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
                {rest.map(p=><ProvCard key={p.id} p={p} C={C} t={t}/>)}
              </div>
          }
        </div>

        {/* Ad Sidebar */}
        <div style={{ width:256, flexShrink:0, padding:"22px 18px 22px 0", display:"flex", flexDirection:"column", gap:14 }}>
          {/* Partner ad 1 */}
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden", transition:"box-shadow .2s" }}
            onMouseEnter={e=>e.currentTarget.style.boxShadow=C.shadow} onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
            <div style={{ padding:"5px 12px", background:C.faint, borderBottom:`1px solid ${C.border}` }}>
              <span style={{ fontSize:9, color:C.muted, letterSpacing:"0.1em", fontFamily:"Nunito Sans,sans-serif", textTransform:"uppercase" }}>Anuncio Patrocinado</span>
            </div>
            <div style={{ padding:"14px 12px", textAlign:"center" }}>
              <div style={{ width:44, height:44, borderRadius:10, background:`linear-gradient(135deg,${C.accent}22,${C.accent}44)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, margin:"0 auto 8px" }}>🔩</div>
              <div style={{ fontWeight:800, fontSize:13, color:C.text, marginBottom:3, fontFamily:"'Nunito',sans-serif" }}>Ferretería El Constructor</div>
              <div style={{ fontSize:11, color:C.muted, lineHeight:1.5, marginBottom:10, fontFamily:"Nunito Sans,sans-serif" }}>Materiales y herramientas. 10% descuento para proveedores.</div>
              <a href="#" style={{ display:"block", padding:"7px 0", borderRadius:8, background:C.accent, color:"#fff", fontSize:12, fontWeight:700, textDecoration:"none", fontFamily:"Nunito Sans,sans-serif", transition:"opacity .15s" }}
                onMouseEnter={e=>e.currentTarget.style.opacity=".85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>Ver oferta →</a>
            </div>
          </div>

          {/* AdSense slot 1 */}
          <div style={{ background:C.card, border:`2px dashed ${C.border}`, borderRadius:14, overflow:"hidden" }}>
            <div style={{ padding:"5px 12px", background:C.faint, borderBottom:`1px solid ${C.border}` }}>
              <span style={{ fontSize:9, color:C.muted, letterSpacing:"0.1em", fontFamily:"Nunito Sans,sans-serif", textTransform:"uppercase" }}>Publicidad · AdSense</span>
            </div>
            <div style={{ width:"100%", height:250, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6 }}>
              <div style={{ fontSize:26 }}>📢</div>
              <div style={{ fontSize:11, fontWeight:700, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>Google AdSense</div>
              <div style={{ fontSize:10, color:C.muted, textAlign:"center", padding:"0 14px", fontFamily:"Nunito Sans,sans-serif", lineHeight:1.5 }}>300×250 · Pega tu código aquí</div>
            </div>
          </div>

          {/* Partner ad 2 */}
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden", transition:"box-shadow .2s" }}
            onMouseEnter={e=>e.currentTarget.style.boxShadow=C.shadow} onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
            <div style={{ padding:"5px 12px", background:C.faint, borderBottom:`1px solid ${C.border}` }}>
              <span style={{ fontSize:9, color:C.muted, letterSpacing:"0.1em", fontFamily:"Nunito Sans,sans-serif", textTransform:"uppercase" }}>Anuncio Patrocinado</span>
            </div>
            <div style={{ padding:"14px 12px", textAlign:"center" }}>
              <div style={{ width:44, height:44, borderRadius:10, background:`linear-gradient(135deg,${C.gold}22,${C.gold}44)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, margin:"0 auto 8px" }}>🎨</div>
              <div style={{ fontWeight:800, fontSize:13, color:C.text, marginBottom:3, fontFamily:"'Nunito',sans-serif" }}>Pinturas Tropical</div>
              <div style={{ fontSize:11, color:C.muted, lineHeight:1.5, marginBottom:10, fontFamily:"Nunito Sans,sans-serif" }}>Las mejores pinturas del Caribe. Envío gratis +RD$2,000.</div>
              <a href="#" style={{ display:"block", padding:"7px 0", borderRadius:8, background:C.gold, color:"#fff", fontSize:12, fontWeight:700, textDecoration:"none", fontFamily:"Nunito Sans,sans-serif", transition:"opacity .15s" }}
                onMouseEnter={e=>e.currentTarget.style.opacity=".85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>Ver oferta →</a>
            </div>
          </div>

          {/* AdSense slot 2 */}
          <div style={{ background:C.card, border:`2px dashed ${C.border}`, borderRadius:14, overflow:"hidden" }}>
            <div style={{ padding:"5px 12px", background:C.faint, borderBottom:`1px solid ${C.border}` }}>
              <span style={{ fontSize:9, color:C.muted, letterSpacing:"0.1em", fontFamily:"Nunito Sans,sans-serif", textTransform:"uppercase" }}>Publicidad · AdSense</span>
            </div>
            <div style={{ width:"100%", height:260, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6 }}>
              <div style={{ fontSize:26 }}>📢</div>
              <div style={{ fontSize:11, fontWeight:700, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>Google AdSense</div>
              <div style={{ fontSize:10, color:C.muted, textAlign:"center", padding:"0 14px", fontFamily:"Nunito Sans,sans-serif", lineHeight:1.5 }}>300×300 · Pega tu código aquí</div>
            </div>
          </div>

          {/* Advertise CTA */}
          <div style={{ background:`linear-gradient(135deg,${C.accent}12,${C.blue}08)`, border:`1px solid ${C.accent}30`, borderRadius:12, padding:"14px 12px", textAlign:"center" }}>
            <div style={{ fontSize:18, marginBottom:5 }}>📣</div>
            <div style={{ fontSize:12, fontWeight:800, color:C.accent, marginBottom:4, fontFamily:"'Nunito',sans-serif" }}>¿Quieres anunciarte?</div>
            <div style={{ fontSize:11, color:C.muted, marginBottom:10, lineHeight:1.4, fontFamily:"Nunito Sans,sans-serif" }}>Llega a miles de clientes en RD</div>
            <a href="mailto:ads@elsociord.com" style={{ display:"block", padding:"7px 0", borderRadius:8, background:C.accent, color:"#fff", fontSize:11, fontWeight:700, textDecoration:"none", fontFamily:"Nunito Sans,sans-serif" }}>Contactar →</a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── POST JOB ──────────────────────────────────────────────────────
function PostJobView({ C, t, setView }) {
  const p = t.pj;
  const [form, setForm] = useState({ category:"", desc:"", sector:"", city:"Santo Domingo", budget:"", urgency:"soon", size:"medium", howHeard:"" });
  const [posted, setPosted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const upd = (k,v) => setForm(f=>({...f,[k]:v}));
  const valid = form.category && form.desc.length>10 && form.sector;
  const completeness = [form.category,form.desc.length>10,form.sector,form.budget,form.howHeard].filter(Boolean).length;
  const pct = Math.round((completeness/5)*100);

  const handleSubmit = () => {
    if (!valid) return;
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setPosted(true); }, 1200);
  };

  if (posted) return (
    <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", background:C.bg, padding:24 }}>
      <div style={{ maxWidth:480, width:"100%", textAlign:"center", animation:"scaleIn .3s ease" }}>
        <div style={{ fontSize:56, animation:"checkPop .5s cubic-bezier(.175,.885,.32,1.275)", display:"inline-block" }}>✅</div>
        <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:24, fontWeight:900, color:C.text, margin:"14px 0 8px" }}>{p.successTitle}</h2>
        <p style={{ color:C.muted, fontSize:14, marginBottom:22, lineHeight:1.6, fontFamily:"Nunito Sans,sans-serif" }}>{p.successSub}</p>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20, marginBottom:20, textAlign:"left" }}>
          <div style={{ fontWeight:800, color:C.text, marginBottom:4, fontFamily:"'Nunito',sans-serif", fontSize:15 }}>{p.interestedTitle}</div>
          <p style={{ fontSize:12, color:C.muted, marginBottom:12, fontFamily:"Nunito Sans,sans-serif" }}>{p.interestedSub}</p>
          {PROVIDERS_SEED.slice(0,3).map((pr,i)=>(
            <div key={pr.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:i<2?`1px solid ${C.border}`:"none", animation:`fadeSlideUp .3s ease ${i*0.1}s both` }}>
              <Av init={pr.avatar} size={34} color={C.accent}/>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ fontWeight:700, fontSize:13, color:C.text, fontFamily:"Nunito Sans,sans-serif" }}>{pr.name}</span>
                  {pr.verified && <VerBadge tip={t.br.verTip} C={C}/>}
                </div>
                <div style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}><Stars n={pr.rating} size={10}/> {pr.rating} · {pr.reviews} reseñas</div>
              </div>
              <a href={`https://wa.me/1${pr.whatsapp}`} target="_blank" rel="noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"5px 10px", borderRadius:8, background:"#25D366", color:"#fff", fontSize:11, fontWeight:700, textDecoration:"none", fontFamily:"Nunito Sans,sans-serif" }}>💬 WA</a>
            </div>
          ))}
        </div>
        <Btn onClick={()=>{setPosted(false);setForm({category:"",desc:"",sector:"",city:"Santo Domingo",budget:"",urgency:"soon",size:"medium",howHeard:""});}} C={C} size="lg">{p.postAnother}</Btn>
      </div>
    </div>
  );

  return (
    <div style={{ flex:1, overflowY:"auto", background:C.bg, padding:"26px 30px" }}>
      <div style={{ maxWidth:580, margin:"0 auto", animation:"fadeSlideUp .3s ease" }}>
        <div style={{ marginBottom:22 }}>
          <h1 style={{ fontFamily:"'Nunito',sans-serif", fontSize:26, fontWeight:900, color:C.text, margin:"0 0 4px" }}>{p.title}</h1>
          <p style={{ fontSize:13, color:C.muted, margin:"0 0 14px", fontFamily:"Nunito Sans,sans-serif" }}>{p.sub}</p>
          {/* Completeness bar */}
          <div style={{ background:C.faint, borderRadius:99, height:6, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${pct}%`, borderRadius:99, background:`linear-gradient(90deg,${C.accent},${C.blue})`, transition:"width .4s ease" }}/>
          </div>
          <div style={{ fontSize:10, color:C.muted, marginTop:4, fontFamily:"Nunito Sans,sans-serif" }}>Completado {pct}%</div>
        </div>

        {/* Category */}
        <div style={{ marginBottom:18 }}>
          <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:8, letterSpacing:"0.06em", textTransform:"uppercase", fontFamily:"Nunito Sans,sans-serif" }}>{p.cat}</label>
          <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
            {t.cats.map(c=>(
              <button key={c} onClick={()=>upd("category",c)}
                style={{ padding:"8px 13px", borderRadius:9, fontSize:12, fontWeight:600, cursor:"pointer", border:`1.5px solid ${form.category===c?C.accent:C.border}`, background:form.category===c?C.accent:"transparent", color:form.category===c?"#fff":C.muted, transition:"all .18s", fontFamily:"Nunito Sans,sans-serif", boxShadow:form.category===c?`0 2px 8px ${C.accent}44`:"none", transform:form.category===c?"scale(1.05)":"scale(1)" }}>
                {CAT_ICONS[c]} {c}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:6, letterSpacing:"0.06em", textTransform:"uppercase", fontFamily:"Nunito Sans,sans-serif" }}>{p.desc}</label>
          <textarea value={form.desc} onChange={e=>upd("desc",e.target.value)} placeholder={p.descPh} rows={4}
            style={{ width:"100%", padding:"12px 13px", borderRadius:11, background:C.card, border:`1.5px solid ${C.border}`, color:C.text, fontSize:13, outline:"none", resize:"vertical", boxSizing:"border-box", lineHeight:1.6, fontFamily:"Nunito Sans,sans-serif", transition:"border .15s" }}
            onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border}/>
          <div style={{ fontSize:10, color:form.desc.length>10?C.accent:C.muted, marginTop:3, fontFamily:"Nunito Sans,sans-serif", textAlign:"right" }}>{form.desc.length} caracteres {form.desc.length>10?"✓":""}</div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <Input label={p.sector} value={form.sector} onChange={e=>upd("sector",e.target.value)} icon="📍" placeholder="Ej: Piantini" C={C}/>
          <Input label={p.city} value={form.city} onChange={e=>upd("city",e.target.value)} icon="🏙️" C={C}/>
        </div>
        <Input label={p.budget} value={form.budget} onChange={e=>upd("budget",e.target.value)} icon="💰" placeholder={p.budgetPh} C={C}/>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:18 }}>
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:7, letterSpacing:"0.06em", textTransform:"uppercase", fontFamily:"Nunito Sans,sans-serif" }}>{p.urgency}</label>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {[{v:"urgent",l:p.urgent,ic:"🔴",col:C.red},{v:"soon",l:p.soon,ic:"🟡",col:C.gold},{v:"flex",l:p.flex,ic:"🟢",col:C.accent}].map(u=>(
                <button key={u.v} onClick={()=>upd("urgency",u.v)}
                  style={{ padding:"9px 10px", borderRadius:9, border:`1.5px solid ${form.urgency===u.v?u.col:C.border}`, background:form.urgency===u.v?`${u.col}18`:"transparent", color:form.urgency===u.v?u.col:C.muted, cursor:"pointer", fontSize:12, fontWeight:600, textAlign:"left", fontFamily:"Nunito Sans,sans-serif", transition:"all .15s", animation: u.v==="urgent"&&form.urgency==="urgent"?"urgentPulse 1.5s infinite":undefined }}>
                  {u.ic} {u.l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:7, letterSpacing:"0.06em", textTransform:"uppercase", fontFamily:"Nunito Sans,sans-serif" }}>{p.size}</label>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {[{v:"small",l:p.small,ic:"🔹"},{v:"medium",l:p.medium,ic:"🔷"},{v:"large",l:p.large,ic:"💠"}].map(s=>(
                <button key={s.v} onClick={()=>upd("size",s.v)}
                  style={{ padding:"9px 10px", borderRadius:9, border:`1.5px solid ${form.size===s.v?C.accent:C.border}`, background:form.size===s.v?`${C.accent}18`:"transparent", color:form.size===s.v?C.accent:C.muted, cursor:"pointer", fontSize:12, fontWeight:600, textAlign:"left", fontFamily:"Nunito Sans,sans-serif", transition:"all .15s" }}>
                  {s.ic} {s.l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* How heard */}
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"block", marginBottom:7, letterSpacing:"0.06em", textTransform:"uppercase", fontFamily:"Nunito Sans,sans-serif" }}>¿Cómo nos encontraste?</label>
          <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
            {t.su.howOpts.map(o=>(
              <button key={o} onClick={()=>upd("howHeard",o)}
                style={{ padding:"7px 14px", borderRadius:20, fontSize:12, fontWeight:600, border:`1.5px solid ${form.howHeard===o?C.accent:C.border}`, background:form.howHeard===o?C.accent+"18":"transparent", color:form.howHeard===o?C.accent:C.muted, cursor:"pointer", fontFamily:"Nunito Sans,sans-serif", transition:"all .15s" }}>
                {o}
              </button>
            ))}
          </div>
        </div>

        <Btn onClick={handleSubmit} full disabled={!valid||submitting} size="lg" C={C}>
          {submitting ? <><span style={{ display:"inline-block", width:16, height:16, border:"2px solid #ffffff44", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .6s linear infinite" }}/> Publicando...</> : p.submit}
        </Btn>
      </div>
    </div>
  );
}

// ── CLIENT DASHBOARD ──────────────────────────────────────────────
function ClientDashboard({ C, t }) {
  const c = t.cd;
  const v1 = useCountUp(3); const v2 = useCountUp(12); const v3 = useCountUp(2);
  return (
    <div style={{ flex:1, overflowY:"auto", padding:"26px 28px", background:C.bg, animation:"fadeSlideUp .3s ease" }}>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontSize:22, fontWeight:800, color:C.text, margin:"0 0 4px", fontFamily:"'Nunito',sans-serif" }}>{c.title}</h2>
        <p style={{ fontSize:13, color:C.muted, margin:0, fontFamily:"Nunito Sans,sans-serif" }}>{c.sub}</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:24 }}>
        {[{l:c.posted,v:v1,ic:"📋",col:C.accent},{l:c.responses,v:v2,ic:"📬",col:C.blue},{l:c.completed,v:v3,ic:"✅",col:C.gold}].map((s,i)=>(
          <div key={s.l} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"18px 20px", transition:"transform .18s, box-shadow .18s", animation:`fadeSlideUp .3s ease ${i*0.08}s both` }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=C.shadow;}}
            onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
            <div style={{ fontSize:22, marginBottom:8 }}>{s.ic}</div>
            <div style={{ fontSize:26, fontWeight:900, color:s.col, fontFamily:"'Nunito',sans-serif", animation:"countUp .4s ease" }}>{s.v}</div>
            <div style={{ fontSize:12, color:C.muted, marginTop:3, fontFamily:"Nunito Sans,sans-serif" }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden" }}>
        <div style={{ padding:"14px 20px", borderBottom:`1px solid ${C.border}`, fontWeight:800, color:C.text, fontFamily:"'Nunito',sans-serif", fontSize:15 }}>{c.history}</div>
        {JOBS_SEED.map((j,i)=>(
          <div key={j.id} style={{ padding:"13px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", transition:"background .15s", animation:`fadeSlideUp .3s ease ${i*0.05}s both`, cursor:"default" }}
            onMouseEnter={e=>e.currentTarget.style.background=C.faint} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div style={{ display:"flex", gap:11, alignItems:"center" }}>
              <div style={{ width:38, height:38, borderRadius:10, background:C.faint, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{CAT_ICONS[j.category]||"🛠️"}</div>
              <div>
                <div style={{ fontWeight:700, fontSize:13, color:C.text, fontFamily:"Nunito Sans,sans-serif" }}>{j.desc}</div>
                <div style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{j.category} · {j.sector} · {j.date}</div>
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:14, fontWeight:700, color:C.accent, fontFamily:"Nunito Sans,sans-serif" }}>{j.responses} {c.resp}</div>
              <Tag color={j.status==="filled"?C.accent:j.status==="open"?C.blue:C.muted} C={C}>{c.status[j.status]}</Tag>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── FEATURED PLANS CARD ───────────────────────────────────────────
const FEATURED_PLANS = [
  { days:5,  price:500,  label:"Inicio",     color:"#7A8C7E", popular:false },
  { days:10, price:1000, label:"Básico",     color:"#5B9BD5", popular:false },
  { days:15, price:1500, label:"Popular",    color:"#5DB87A", popular:true  },
  { days:20, price:2000, label:"Avanzado",   color:"#E07B45", popular:false },
  { days:25, price:2500, label:"Pro",        color:"#D4A843", popular:false },
  { days:30, price:3000, label:"Máximo",     color:"#E05252", popular:false },
];

function FeaturedPlansCard({ C, t, isFeatured }) {
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(2); // default to popular
  const waEmail = "whatsapp://send?phone=18095550000";
  const contactMsg = encodeURIComponent(
    `Hola, me interesa el plan Destacado de ${FEATURED_PLANS[selected].days} días (RD$${FEATURED_PLANS[selected].price.toLocaleString()}) para mi perfil en El Socio RD.`
  );

  return (
    <>
      {/* Banner — always visible */}
      <div style={{ background:`linear-gradient(135deg,${C.gold}18,${C.gold}06)`, border:`1.5px solid ${C.gold}50`, borderRadius:14, padding:"16px 20px", marginBottom:18 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
          <div>
            {isFeatured
              ? <div style={{ fontWeight:800, color:C.gold, fontSize:14, marginBottom:3, fontFamily:"'Nunito',sans-serif" }}>⭐ Tu perfil está Destacado</div>
              : <div style={{ fontWeight:800, color:C.gold, fontSize:14, marginBottom:3, fontFamily:"'Nunito',sans-serif" }}>⭐ Aparece primero — Hazte Destacado</div>
            }
            <div style={{ fontSize:12, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>
              {isFeatured ? "Renueva tu plan para seguir apareciendo al tope." : "Más visibilidad. Más clientes. Desde RD$500 por 5 días."}
            </div>
          </div>
          <Btn color={C.gold} C={C} onClick={()=>setShowModal(true)}>
            {isFeatured ? "Renovar plan" : "Ver planes →"}
          </Btn>
        </div>
      </div>

      {/* Plans Modal */}
      {showModal && (
        <Modal onClose={()=>setShowModal(false)} C={C} width={560}>
          <div style={{ textAlign:"center", marginBottom:22 }}>
            <div style={{ fontSize:32, marginBottom:6 }}>⭐</div>
            <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:20, fontWeight:900, color:C.text, margin:"0 0 6px" }}>Planes Destacado</h2>
            <p style={{ fontSize:13, color:C.muted, margin:0, fontFamily:"Nunito Sans,sans-serif", lineHeight:1.6 }}>
              Aparecer al tope de los resultados de búsqueda genera hasta <strong style={{color:C.accent}}>3× más contactos</strong>.<br/>
              El orden de los Destacados rota automáticamente para dar visibilidad equitativa a todos.
            </p>
          </div>

          {/* Plan grid */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:20 }}>
            {FEATURED_PLANS.map((plan, i) => {
              const active = selected === i;
              return (
                <div key={plan.days} onClick={()=>setSelected(i)}
                  style={{ position:"relative", padding:"16px 12px", borderRadius:13, border:`2px solid ${active ? plan.color : C.border}`, background: active ? `${plan.color}12` : C.surface, cursor:"pointer", textAlign:"center", transition:"all .18s", transform: active ? "scale(1.03)" : "scale(1)", boxShadow: active ? `0 4px 14px ${plan.color}33` : "none" }}>
                  {plan.popular && (
                    <div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)", background:`linear-gradient(90deg,${plan.color},${plan.color}cc)`, color:"#fff", fontSize:9, fontWeight:800, padding:"2px 10px", borderRadius:20, letterSpacing:"0.06em", fontFamily:"Nunito Sans,sans-serif", whiteSpace:"nowrap" }}>
                      MÁS POPULAR
                    </div>
                  )}
                  <div style={{ fontSize:22, fontWeight:900, color: active ? plan.color : C.text, fontFamily:"'Nunito',sans-serif", lineHeight:1 }}>{plan.days}</div>
                  <div style={{ fontSize:10, color:C.muted, fontFamily:"Nunito Sans,sans-serif", marginBottom:8 }}>días</div>
                  <div style={{ fontSize:16, fontWeight:900, color: active ? plan.color : C.text, fontFamily:"'Nunito',sans-serif" }}>RD${plan.price.toLocaleString()}</div>
                  <div style={{ fontSize:10, color:C.muted, fontFamily:"Nunito Sans,sans-serif", marginTop:2 }}>RD${(plan.price/plan.days).toFixed(0)}/día</div>
                  <div style={{ marginTop:8, fontSize:10, fontWeight:700, color: active ? plan.color : C.muted, fontFamily:"Nunito Sans,sans-serif", background: active ? `${plan.color}18` : C.faint, borderRadius:6, padding:"3px 0" }}>{plan.label}</div>
                </div>
              );
            })}
          </div>

          {/* Selected summary */}
          <div style={{ background:C.faint, border:`1px solid ${C.border}`, borderRadius:12, padding:"13px 16px", marginBottom:18, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontSize:12, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>Plan seleccionado</div>
              <div style={{ fontSize:15, fontWeight:800, color:C.text, fontFamily:"'Nunito',sans-serif" }}>
                {FEATURED_PLANS[selected].days} días · <span style={{color:FEATURED_PLANS[selected].color}}>RD${FEATURED_PLANS[selected].price.toLocaleString()}</span>
              </div>
            </div>
            <div style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif", textAlign:"right" }}>
              RD${(FEATURED_PLANS[selected].price / FEATURED_PLANS[selected].days).toFixed(0)} por día
            </div>
          </div>

          {/* Payment notice */}
          <div style={{ background:`${C.blue}10`, border:`1px solid ${C.blue}30`, borderRadius:10, padding:"10px 14px", marginBottom:18, display:"flex", gap:9, alignItems:"flex-start" }}>
            <span style={{ fontSize:16, flexShrink:0 }}>💳</span>
            <div style={{ fontSize:12, color:C.muted, fontFamily:"Nunito Sans,sans-serif", lineHeight:1.6 }}>
              Aceptamos <strong style={{color:C.text}}>PayPal</strong> y <strong style={{color:C.text}}>transferencia bancaria</strong>. Al contactarnos recibirás las instrucciones de pago. Tu perfil se activa dentro de las <strong style={{color:C.text}}>24 horas</strong>.
            </div>
          </div>

          {/* CTA buttons */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <a href={`https://wa.me/18095550000?text=${contactMsg}`} target="_blank" rel="noreferrer"
              style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px 16px", borderRadius:10, background:"#25D366", color:"#fff", fontSize:13, fontWeight:700, textDecoration:"none", fontFamily:"Nunito Sans,sans-serif", transition:"opacity .15s" }}
              onMouseEnter={e=>e.currentTarget.style.opacity=".85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
              💬 Contactar por WhatsApp
            </a>
            <a href={`mailto:featured@elsociord.com?subject=Plan Destacado ${FEATURED_PLANS[selected].days} días&body=${decodeURIComponent(contactMsg)}`}
              style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px 16px", borderRadius:10, background:C.accent, color:"#fff", fontSize:13, fontWeight:700, textDecoration:"none", fontFamily:"Nunito Sans,sans-serif", transition:"opacity .15s" }}
              onMouseEnter={e=>e.currentTarget.style.opacity=".85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
              ✉️ Contactar por Email
            </a>
          </div>
          <div style={{ textAlign:"center", marginTop:10, fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>
            También puedes escribirnos a <strong style={{color:C.accent}}>featured@elsociord.com</strong>
          </div>
        </Modal>
      )}
    </>
  );
}


// ── PROVIDER DASHBOARD ────────────────────────────────────────────
function ProviderDashboard({ C, t }) {
  const p = t.pd;
  const me = PROVIDERS_SEED[0];
  const v1 = useCountUp(47); const v2 = useCountUp(me.leadCount); const v3 = useCountUp(me.jobs); const vR = useCountUp(49);
  return (
    <div style={{ flex:1, overflowY:"auto", padding:"26px 28px", background:C.bg, animation:"fadeSlideUp .3s ease" }}>
      <div style={{ marginBottom:18 }}>
        <h2 style={{ fontSize:22, fontWeight:800, color:C.text, margin:"0 0 4px", fontFamily:"'Nunito',sans-serif" }}>{p.title}</h2>
        <p style={{ fontSize:13, color:C.muted, margin:0, fontFamily:"Nunito Sans,sans-serif" }}>{p.sub}</p>
      </div>
      {/* Profile card */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:22, marginBottom:18, display:"flex", gap:16, alignItems:"center" }}>
        <Av init={me.avatar} size={58} color={C.accent}/>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
            <span style={{ fontSize:18, fontWeight:800, color:C.text, fontFamily:"'Nunito',sans-serif" }}>{me.name}</span>
            {me.verified && <VerBadge tip={t.br.verTip} C={C}/>}
            {me.featured && <Tag color={C.gold} C={C}>⭐ Destacado</Tag>}
          </div>
          <div style={{ fontSize:13, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{CAT_ICONS[me.category]} {me.category} · 📍 {me.sector}, {me.city}</div>
          <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:5 }}><Stars n={me.rating} size={13}/><span style={{ fontSize:12, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{me.rating} ({me.reviews} reseñas)</span></div>
          <div style={{ marginTop:6, display:"inline-flex", alignItems:"center", gap:5, background:C.faint, border:`1px solid ${C.border}`, borderRadius:6, padding:"3px 9px" }}>
            <span style={{ fontSize:10, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>Cuenta:</span>
            <span style={{ fontSize:11, fontWeight:800, color:C.accent, fontFamily:"Nunito Sans,sans-serif", letterSpacing:"0.05em" }}>{me.accountNo}</span>
          </div>
        </div>
        <Btn outline C={C} size="sm">{p.editProfile}</Btn>
      </div>
      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:18 }}>
        {[{l:p.views,v:v1,ic:"👁️",c:C.text},{l:p.leads,v:v2,ic:"📬",c:C.accent},{l:p.jobs,v:v3,ic:"✅",c:C.green},{l:p.rating,v:`${(vR/10).toFixed(1)}★`,ic:"⭐",c:C.gold}].map((s,i)=>(
          <div key={s.l} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:13, padding:"15px 16px", transition:"transform .18s", animation:`fadeSlideUp .3s ease ${i*0.07}s both` }}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            <div style={{ fontSize:20, marginBottom:5 }}>{s.ic}</div>
            <div style={{ fontSize:22, fontWeight:900, color:s.c, fontFamily:"'Nunito',sans-serif" }}>{s.v}</div>
            <div style={{ fontSize:10, color:C.muted, marginTop:2, fontFamily:"Nunito Sans,sans-serif" }}>{s.l}</div>
          </div>
        ))}
      </div>
      {/* Featured CTA */}
      <FeaturedPlansCard C={C} t={t} isFeatured={me.featured}/>
      {/* Portfolio */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:18, marginBottom:16 }}>
        <div style={{ fontWeight:800, color:C.text, marginBottom:12, fontFamily:"'Nunito',sans-serif", fontSize:14 }}>{p.portfolio}</div>
        <div style={{ display:"flex", gap:10 }}>
          {me.portfolio.map((item,i)=>(
            <div key={i} style={{ width:80, height:80, borderRadius:12, background:C.faint, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, transition:"transform .15s", cursor:"pointer" }}
              onMouseEnter={e=>e.currentTarget.style.transform="scale(1.08)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
              {item}
            </div>
          ))}
          <div style={{ width:80, height:80, borderRadius:12, border:`2px dashed ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", color:C.muted, fontSize:22, cursor:"pointer", transition:"border-color .15s, color .15s" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.color=C.accent;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;}}>+</div>
        </div>
      </div>
      {/* Leads */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden" }}>
        <div style={{ padding:"13px 20px", borderBottom:`1px solid ${C.border}`, fontWeight:800, color:C.text, fontFamily:"'Nunito',sans-serif", fontSize:14 }}>{p.recentLeads}</div>
        {JOBS_SEED.slice(0,3).map((j,i)=>(
          <div key={j.id} style={{ padding:"12px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:11, transition:"background .15s", animation:`fadeSlideUp .3s ease ${i*0.06}s both` }}
            onMouseEnter={e=>e.currentTarget.style.background=C.faint} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div style={{ fontSize:20 }}>{CAT_ICONS[j.category]||"🛠️"}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, fontSize:13, color:C.text, fontFamily:"Nunito Sans,sans-serif" }}>{j.desc}</div>
              <div style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>📍 {j.sector} · {j.date}</div>
            </div>
            <Tag color={j.status==="filled"?C.accent:C.blue} C={C}>{j.status}</Tag>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ADMIN DASHBOARD ───────────────────────────────────────────────
function AdminDashboard({ C, t }) {
  const a = t.ad;
  const { toasts, push } = useToast();
  const [tab, setTab] = useState("overview");
  const [providers, setProviders] = useState(PROVIDERS_SEED);
  const [clients, setClients] = useState(CLIENTS_SEED);
  const [banTarget, setBanTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [selectedPending, setSelectedPending] = useState(null);
  const [pendingList, setPendingList] = useState(PENDING_SEED);

  const totalUsers = providers.length + clients.length;
  const uTotal = useCountUp(totalUsers);
  const uProviders = useCountUp(providers.length);
  const uClients = useCountUp(clients.length);
  const uJobs = useCountUp(JOBS_SEED.length);
  const uPending = useCountUp(pendingList.length);
  const uFeatured = useCountUp(providers.filter(p=>p.featured).length);

  const doVerify = (id) => { setPendingList(l=>l.filter(p=>p.id!==id)); setProviders(ps=>ps.map(p=>p.id===id?{...p,verified:true}:p)); setSelectedPending(null); push(t.toast.verified); };
  const doReject = (id) => { setPendingList(l=>l.filter(p=>p.id!==id)); setSelectedPending(null); push(t.toast.rejected,"error"); };
  const doBan = (type, id, wasBanned) => { if(type==="provider") setProviders(ps=>ps.map(p=>p.id===id?{...p,banned:!p.banned}:p)); else setClients(cs=>cs.map(c=>c.id===id?{...c,banned:!c.banned}:c)); setBanTarget(null); push(wasBanned?t.toast.unbanned:t.toast.banned, wasBanned?"success":"warn"); };
  const doFeature = (id, wasFeatured) => { setProviders(ps=>ps.map(p=>p.id===id?{...p,featured:!p.featured}:p)); push(wasFeatured?t.toast.unfeatured:t.toast.featured); };
  const openEdit = (item, type) => { setEditTarget({...item,_type:type}); setEditForm({...item}); };
  const saveEdit = () => { if(editTarget._type==="provider") setProviders(ps=>ps.map(p=>p.id===editTarget.id?{...p,...editForm}:p)); else setClients(cs=>cs.map(c=>c.id===editTarget.id?{...c,...editForm}:c)); setEditTarget(null); push(t.toast.saved); };

  const tabs = Object.entries(a.tabs).map(([id,l])=>({id,l}));

  return (
    <div style={{ flex:1, overflowY:"auto", padding:"24px 26px", background:C.bg }}>
      <ToastContainer toasts={toasts}/>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
        <div>
          <h1 style={{ fontFamily:"'Nunito',sans-serif", fontSize:22, fontWeight:900, color:C.text, margin:"0 0 3px" }}>{a.title}</h1>
          <p style={{ fontSize:12, color:C.muted, margin:0, fontFamily:"Nunito Sans,sans-serif" }}>{a.sub}</p>
        </div>
        <Tag color={C.red} C={C}>{a.internal}</Tag>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:18 }}>
        {tabs.map(tb=>(
          <button key={tb.id} onClick={()=>setTab(tb.id)}
            style={{ padding:"7px 15px", borderRadius:9, fontSize:12, fontWeight:700, cursor:"pointer", border:`1.5px solid ${tab===tb.id?C.accent:C.border}`, background:tab===tb.id?`${C.accent}18`:C.surface, color:tab===tb.id?C.accent:C.muted, fontFamily:"Nunito Sans,sans-serif", transition:"all .15s" }}
            onMouseEnter={e=>{ if(tab!==tb.id){e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.color=C.accent;}}}
            onMouseLeave={e=>{ if(tab!==tb.id){e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;}}}>
            {tb.l}{tb.id==="pending"&&pendingList.length>0?` (${pendingList.length})`:""}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab==="overview" && (
        <div style={{ animation:"fadeSlideUp .25s ease" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:13, marginBottom:22 }}>
            {[{l:a.stats.users,v:uTotal,ic:"👥",c:C.text},{l:a.stats.providers,v:uProviders,ic:"🛠️",c:C.accent},{l:a.stats.clients,v:uClients,ic:"👤",c:C.blue},{l:a.stats.jobs,v:uJobs,ic:"📋",c:C.gold},{l:a.stats.pending,v:uPending,ic:"⏳",c:C.orange},{l:a.stats.featured,v:uFeatured,ic:"⭐",c:C.green}].map((s,i)=>(
              <div key={s.l} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:13, padding:"16px 18px", transition:"transform .18s", animation:`fadeSlideUp .3s ease ${i*0.06}s both` }}
                onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                <div style={{ fontSize:20, marginBottom:6 }}>{s.ic}</div>
                <div style={{ fontSize:26, fontWeight:900, color:s.c, fontFamily:"'Nunito',sans-serif" }}>{s.v}</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:3, fontFamily:"Nunito Sans,sans-serif" }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:13, padding:18 }}>
            <div style={{ fontWeight:800, color:C.text, marginBottom:12, fontFamily:"'Nunito',sans-serif", fontSize:14 }}>Exportar Datos</div>
            <div style={{ display:"flex", gap:9, flexWrap:"wrap" }}>
              {[{l:a.csv.providers,d:providers.map(({portfolio,...p})=>p),f:"elsociord_proveedores.csv"},{l:a.csv.clients,d:clients,f:"elsociord_clientes.csv"},{l:a.csv.jobs,d:JOBS_SEED,f:"elsociord_trabajos.csv"}].map(item=>(
                <Btn key={item.f} onClick={()=>{downloadCSV(item.d,item.f);push(t.toast.copied);}} outline C={C} size="sm">{item.l}</Btn>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PROVIDERS */}
      {tab==="providers" && (
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden", animation:"fadeSlideUp .25s ease" }}>
          <div style={{ padding:"13px 18px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontWeight:800, color:C.text, fontFamily:"'Nunito',sans-serif", fontSize:14 }}>Proveedores ({providers.length})</span>
            <Btn onClick={()=>downloadCSV(providers.map(({portfolio,...p})=>p),"elsociord_proveedores.csv")} outline size="sm" C={C}>{a.csv.providers}</Btn>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", minWidth:700 }}>
              <thead><tr style={{ background:C.faint }}>
                {["Proveedor","Categoría","Sector","Estado","Acciones"].map(h=>(
                  <th key={h} style={{ padding:"9px 14px", textAlign:"left", fontSize:10, color:C.muted, fontWeight:700, letterSpacing:"0.07em", fontFamily:"Nunito Sans,sans-serif" }}>{h.toUpperCase()}</th>
                ))}
              </tr></thead>
              <tbody>{providers.map((p,i)=>(
                <tr key={p.id} style={{ borderTop:`1px solid ${C.border}`, opacity:p.banned?.45:1, transition:"background .12s, opacity .2s", animation:`fadeSlideUp .3s ease ${i*0.04}s both` }}
                  onMouseEnter={e=>e.currentTarget.style.background=C.faint} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"11px 14px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <Av init={p.avatar} size={28} color={C.accent}/>
                      <div>
                        <div style={{ fontSize:12, color:C.text, fontWeight:700, fontFamily:"Nunito Sans,sans-serif" }}>{p.name}</div>
                        <div style={{ fontSize:10, color:C.accent, fontWeight:700, fontFamily:"Nunito Sans,sans-serif", letterSpacing:"0.04em" }}>{p.accountNo}</div>
                        <div style={{ fontSize:10, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{p.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:"11px 14px", fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{CAT_ICONS[p.category]} {p.category}</td>
                  <td style={{ padding:"11px 14px", fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{p.sector}</td>
                  <td style={{ padding:"11px 14px" }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                      {p.banned ? <Tag color={C.red} C={C}>{a.banned}</Tag> : p.verified ? <div style={{ display:"flex", alignItems:"center", gap:5 }}><VerBadge tip={t.br.verTip} C={C}/><span style={{ fontSize:10, color:C.blue, fontFamily:"Nunito Sans,sans-serif" }}>{a.verified}</span></div> : <Tag color={C.muted} C={C}>{a.unverified}</Tag>}
                      {p.featured && <Tag color={C.gold} C={C}>⭐ {a.featured}</Tag>}
                    </div>
                  </td>
                  <td style={{ padding:"11px 14px" }}>
                    <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                      <Btn size="sm" onClick={()=>openEdit(p,"provider")} outline C={C}>{a.actions.editAccount}</Btn>
                      <Btn size="sm" onClick={()=>doFeature(p.id,p.featured)} color={C.gold} outline={p.featured} C={C}>{p.featured?a.actions.unfeature:a.actions.feature}</Btn>
                      <Btn size="sm" onClick={()=>setBanTarget({...p,_type:"provider"})} color={p.banned?C.accent:C.red} C={C}>{p.banned?a.actions.unban:a.actions.ban}</Btn>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* CLIENTS */}
      {tab==="clients" && (
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden", animation:"fadeSlideUp .25s ease" }}>
          <div style={{ padding:"13px 18px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontWeight:800, color:C.text, fontFamily:"'Nunito',sans-serif", fontSize:14 }}>Clientes ({clients.length})</span>
            <Btn onClick={()=>downloadCSV(clients,"elsociord_clientes.csv")} outline size="sm" C={C}>{a.csv.clients}</Btn>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", minWidth:580 }}>
              <thead><tr style={{ background:C.faint }}>
                {["Cliente","Sector","Registrado","Trabajos","Fuente","Acciones"].map(h=>(
                  <th key={h} style={{ padding:"9px 14px", textAlign:"left", fontSize:10, color:C.muted, fontWeight:700, letterSpacing:"0.07em", fontFamily:"Nunito Sans,sans-serif" }}>{h.toUpperCase()}</th>
                ))}
              </tr></thead>
              <tbody>{clients.map((c,i)=>(
                <tr key={c.id} style={{ borderTop:`1px solid ${C.border}`, opacity:c.banned?.45:1, transition:"background .12s", animation:`fadeSlideUp .3s ease ${i*0.05}s both` }}
                  onMouseEnter={e=>e.currentTarget.style.background=C.faint} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"11px 14px" }}>
                    <div style={{ fontSize:12, color:C.text, fontWeight:700, fontFamily:"Nunito Sans,sans-serif" }}>{c.name}</div>
                    <div style={{ fontSize:10, color:C.accent, fontWeight:700, fontFamily:"Nunito Sans,sans-serif", letterSpacing:"0.04em" }}>{c.accountNo}</div>
                    <div style={{ fontSize:10, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{c.email}</div>
                  </td>
                  <td style={{ padding:"11px 14px", fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{c.sector}</td>
                  <td style={{ padding:"11px 14px", fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{c.joinedDate}</td>
                  <td style={{ padding:"11px 14px", fontSize:13, color:C.accent, fontWeight:700, fontFamily:"Nunito Sans,sans-serif" }}>{c.jobsPosted}</td>
                  <td style={{ padding:"11px 14px" }}><Tag color={C.blue} C={C}>{c.howHeard}</Tag></td>
                  <td style={{ padding:"11px 14px" }}>
                    <div style={{ display:"flex", gap:5 }}>
                      <Btn size="sm" onClick={()=>openEdit(c,"client")} outline C={C}>{a.actions.editAccount}</Btn>
                      <Btn size="sm" onClick={()=>setBanTarget({...c,_type:"client"})} color={c.banned?C.accent:C.red} C={C}>{c.banned?a.actions.unban:a.actions.ban}</Btn>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* JOBS */}
      {tab==="jobs" && (
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden", animation:"fadeSlideUp .25s ease" }}>
          <div style={{ padding:"13px 18px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontWeight:800, color:C.text, fontFamily:"'Nunito',sans-serif", fontSize:14 }}>Trabajos ({JOBS_SEED.length})</span>
            <Btn onClick={()=>downloadCSV(JOBS_SEED,"elsociord_trabajos.csv")} outline size="sm" C={C}>{a.csv.jobs}</Btn>
          </div>
          {JOBS_SEED.map((j,i)=>(
            <div key={j.id} style={{ padding:"13px 18px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", transition:"background .12s", animation:`fadeSlideUp .3s ease ${i*0.05}s both` }}
              onMouseEnter={e=>e.currentTarget.style.background=C.faint} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <div style={{ fontSize:20 }}>{CAT_ICONS[j.category]||"🛠️"}</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:13, color:C.text, fontFamily:"Nunito Sans,sans-serif" }}>{j.desc}</div>
                  <div style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>📍 {j.sector} · 💰 RD${j.budget} · 📱 {j.device} · 📣 {j.source} · {j.date}</div>
                </div>
              </div>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <span style={{ fontSize:13, fontWeight:700, color:C.accent, fontFamily:"Nunito Sans,sans-serif" }}>{j.responses} resp.</span>
                <Tag color={j.status==="filled"?C.accent:C.blue} C={C}>{j.status}</Tag>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* HEATMAP */}
      {tab==="heatmap" && (
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:22, animation:"fadeSlideUp .25s ease" }}>
          <div style={{ fontWeight:800, color:C.text, marginBottom:4, fontFamily:"'Nunito',sans-serif", fontSize:16 }}>{a.heatmap.title}</div>
          <p style={{ fontSize:12, color:C.muted, margin:"0 0 20px", fontFamily:"Nunito Sans,sans-serif" }}>{a.heatmap.sub}</p>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {HEATMAP_DATA.map((h,i)=>(
              <div key={h.sector} style={{ display:"flex", alignItems:"center", gap:12, animation:`fadeSlideUp .3s ease ${i*0.05}s both` }}>
                <div style={{ width:140, fontSize:12, color:C.text, fontWeight:600, fontFamily:"Nunito Sans,sans-serif", flexShrink:0 }}>{h.sector}</div>
                <div style={{ flex:1, height:30, borderRadius:8, background:C.faint, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${(h.jobs/HEATMAP_DATA[0].jobs)*100}%`, background:`linear-gradient(90deg,${h.color}dd,${h.color}88)`, borderRadius:8, display:"flex", alignItems:"center", paddingLeft:10, transition:"width .8s ease", minWidth:40 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:"#fff", fontFamily:"Nunito Sans,sans-serif" }}>{h.jobs} {a.heatmap.requests}</span>
                  </div>
                </div>
                <div style={{ width:28, fontSize:12, color:h.color, fontWeight:800, textAlign:"right", fontFamily:"Nunito Sans,sans-serif" }}>{h.jobs}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:16, display:"flex", gap:14, flexWrap:"wrap" }}>
            {[{c:"#E05252",l:"Alta demanda"},{c:"#E07B45",l:"Media-alta"},{c:"#D4A843",l:"Media"},{c:"#5DB87A",l:"Creciendo"},{c:"#5B9BD5",l:"Emergente"}].map(leg=>(
              <div key={leg.l} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:10, height:10, borderRadius:3, background:leg.c }}/>
                <span style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{leg.l}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PENDING */}
      {tab==="pending" && (
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden", animation:"fadeSlideUp .25s ease" }}>
          <div style={{ padding:"13px 18px", borderBottom:`1px solid ${C.border}`, fontWeight:800, color:C.text, fontFamily:"'Nunito',sans-serif", fontSize:14 }}>{a.pending.title}</div>
          {pendingList.length===0
            ? <div style={{ padding:32, textAlign:"center", color:C.muted, fontFamily:"Nunito Sans,sans-serif", animation:"scaleIn .3s ease" }}>
                <div style={{ fontSize:28, marginBottom:8 }}>✅</div>{a.pending.none}
              </div>
            : pendingList.map((p,i)=>(
              <div key={p.id} style={{ padding:"14px 18px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", transition:"background .12s", animation:`fadeSlideUp .3s ease ${i*0.07}s both` }}
                onMouseEnter={e=>e.currentTarget.style.background=C.faint} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                  <Av init={p.avatar} size={36} color={C.muted}/>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13, color:C.text, fontFamily:"Nunito Sans,sans-serif" }}>{p.name}</div>
                    <div style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{p.category} · {p.sector} · {p.submitted}</div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:7 }}>
                  <Btn size="sm" onClick={()=>setSelectedPending(p)} outline C={C}>{a.actions.viewProfile}</Btn>
                  <Btn size="sm" onClick={()=>doVerify(p.id)} color={C.accent} C={C}>{a.actions.verify}</Btn>
                  <Btn size="sm" onClick={()=>doReject(p.id)} color={C.red} C={C}>{a.actions.reject}</Btn>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* ID Review Modal */}
      {selectedPending && (
        <Modal onClose={()=>setSelectedPending(null)} C={C} width={440}>
          <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:18, color:C.text, margin:"0 0 4px" }}>{a.pending.govId} & {a.pending.selfie}</h2>
          <p style={{ color:C.muted, fontSize:12, margin:"0 0 18px", fontFamily:"Nunito Sans,sans-serif" }}>{selectedPending.name} · {selectedPending.category}</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:18 }}>
            {[{l:a.pending.govId,ic:"🪪"},{l:a.pending.selfie,ic:"🤳"}].map(item=>(
              <div key={item.l} style={{ background:C.faint, border:`2px dashed ${C.border}`, borderRadius:12, padding:22, textAlign:"center", transition:"border-color .15s" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                <div style={{ fontSize:30, marginBottom:5 }}>{item.ic}</div>
                <div style={{ fontSize:12, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{item.l}</div>
                <div style={{ fontSize:10, color:C.accent, marginTop:2, fontFamily:"Nunito Sans,sans-serif" }}>{a.pending.submitted}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:9 }}>
            <Btn onClick={()=>doReject(selectedPending.id)} color={C.red} full C={C}>{a.actions.reject}</Btn>
            <Btn onClick={()=>doVerify(selectedPending.id)} color={C.accent} full C={C}>{a.actions.verify}</Btn>
          </div>
        </Modal>
      )}

      {/* Ban Modal */}
      {banTarget && (
        <Modal onClose={()=>setBanTarget(null)} C={C} width={380}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:44, marginBottom:12, animation:"bounce .6s ease" }}>🚫</div>
            <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:18, color:C.text, margin:"0 0 6px" }}>{a.banModal.title}</h2>
            <p style={{ fontSize:14, fontWeight:700, color:C.text, margin:"0 0 4px", fontFamily:"Nunito Sans,sans-serif" }}>{banTarget.name}</p>
            <p style={{ fontSize:12, color:C.muted, margin:"0 0 20px", fontFamily:"Nunito Sans,sans-serif" }}>{a.banModal.desc}</p>
            <div style={{ display:"flex", gap:9 }}>
              <Btn onClick={()=>setBanTarget(null)} outline full C={C}>{a.banModal.cancel}</Btn>
              <Btn onClick={()=>doBan(banTarget._type, banTarget.id, banTarget.banned)} color={banTarget.banned?C.accent:C.red} full C={C}>{banTarget.banned?a.actions.unban:a.banModal.confirm}</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <Modal onClose={()=>setEditTarget(null)} C={C} width={460}>
          {/* Header */}
          <div style={{ marginBottom:18 }}>
            <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:18, color:C.text, margin:"0 0 6px" }}>{a.editModal.title}</h2>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:11, fontWeight:700, color:C.accent, fontFamily:"Nunito Sans,sans-serif", letterSpacing:"0.05em" }}>{editTarget.accountNo}</span>
              <span style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>·</span>
              <span style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{editTarget._type==="provider"?"Proveedor":"Cliente"}</span>
            </div>
          </div>

          {/* Locked fields notice */}
          <div style={{ background:`${C.red}10`, border:`1px solid ${C.red}30`, borderRadius:10, padding:"10px 13px", marginBottom:16, display:"flex", gap:9, alignItems:"flex-start" }}>
            <span style={{ fontSize:16, flexShrink:0 }}>🔒</span>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:C.red, fontFamily:"Nunito Sans,sans-serif", marginBottom:2 }}>Campos bloqueados</div>
              <div style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif", lineHeight:1.5 }}>Nombre, teléfono y correo solo pueden ser modificados por el administrador. El usuario debe contactar soporte para solicitar cambios.</div>
            </div>
          </div>

          {/* Locked fields — read only */}
          {[
            { label:"Nombre", value:editTarget.name, icon:"👤" },
            { label:"Correo electrónico", value:editTarget.email, icon:"✉️" },
            { label:"Teléfono", value:editTarget.phone, icon:"📱" },
          ].map(f => (
            <div key={f.label} style={{ marginBottom:12 }}>
              <label style={{ fontSize:11, fontWeight:700, color:C.muted, display:"flex", alignItems:"center", gap:5, marginBottom:5, letterSpacing:"0.06em", textTransform:"uppercase", fontFamily:"Nunito Sans,sans-serif" }}>
                {f.label} <span style={{ fontSize:10, background:`${C.red}15`, color:C.red, borderRadius:4, padding:"1px 6px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.04em" }}>🔒 Solo Admin</span>
              </label>
              <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 13px", borderRadius:10, background:C.faint, border:`1px solid ${C.border}`, opacity:0.7 }}>
                <span style={{ fontSize:14 }}>{f.icon}</span>
                <span style={{ fontSize:13, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{f.value}</span>
              </div>
            </div>
          ))}

          <div style={{ height:1, background:C.border, margin:"16px 0" }}/>

          {/* Editable fields */}
          <div style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:"0.07em", textTransform:"uppercase", fontFamily:"Nunito Sans,sans-serif", marginBottom:12 }}>Campos editables</div>
          <Input label="WhatsApp" value={editForm.whatsapp||""} onChange={e=>setEditForm(f=>({...f,whatsapp:e.target.value}))} icon="💬" C={C}/>
          <Input label="Sector / Barrio" value={editForm.sector||""} onChange={e=>setEditForm(f=>({...f,sector:e.target.value}))} icon="📍" C={C}/>
          <Input label="Ciudad" value={editForm.city||""} onChange={e=>setEditForm(f=>({...f,city:e.target.value}))} icon="🏙️" C={C}/>
          {editTarget._type==="provider" && <>
            <Input label="Categoría" value={editForm.category||""} onChange={e=>setEditForm(f=>({...f,category:e.target.value}))} C={C}/>
            <Input label="Experiencia" value={editForm.experience||""} onChange={e=>setEditForm(f=>({...f,experience:e.target.value}))} icon="📅" C={C}/>
          </>}

          <div style={{ display:"flex", gap:9, marginTop:8 }}>
            <Btn onClick={()=>setEditTarget(null)} outline full C={C}>{a.editModal.cancel}</Btn>
            <Btn onClick={saveEdit} full C={C}>{a.editModal.save}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("browse");
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState("es");
  const [showSignup, setShowSignup] = useState(false);
  const C = dark ? D : L;
  const t = T[lang];

  const handleSetView = (v) => { setView(v); window.scrollTo(0,0); };

  const VIEWS = { browse:BrowseView, post:PostJobView, client:ClientDashboard, provider:ProviderDashboard, admin:AdminDashboard };
  const View = VIEWS[view] || BrowseView;

  return (
    <div style={{ display:"flex", height:"100vh", background:C.bg, fontFamily:"Nunito Sans,sans-serif", color:C.text, transition:"background .3s, color .3s" }}>
      <Sidebar view={view} setView={handleSetView} t={t} C={C} dark={dark} setDark={setDark} lang={lang} setLang={setLang} onSignup={()=>setShowSignup(true)}/>
      <View C={C} t={t} setView={handleSetView}/>
      {showSignup && <SignupModal C={C} t={t} onClose={()=>setShowSignup(false)}/>}
    </div>
  );
}
