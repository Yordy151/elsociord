import { useState, useEffect, useRef } from "react";
import { supabase, signUp, signIn, signOut, getSession, getProfile, getProviderProfile, getClientJobs } from "./supabase.js";

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
  @keyframes slideUp     { from{transform:translateY(100%)} to{transform:translateY(0)} }
  * { box-sizing:border-box; }
  ::-webkit-scrollbar { width:5px; } ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:#3a4a3e; border-radius:99px; }
  html, body { -webkit-tap-highlight-color: transparent; }
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
// HEATMAP_DATA removed — admin uses real job data
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

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return mobile;
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

function Input({ label, value, onChange, onBlur, type="text", placeholder="", C, icon }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom:14 }}>
      {label && <label style={{ fontSize:11, fontWeight:700, color:focused?C.accent:C.muted, display:"block", marginBottom:5, letterSpacing:"0.06em", textTransform:"uppercase", fontFamily:"Nunito Sans,sans-serif", transition:"color .15s" }}>{label}</label>}
      <div style={{ position:"relative" }}>
        {icon && <span style={{ position:"absolute", left:12, top:"50%", fontSize:14, pointerEvents:"none", transition:"transform .15s", transform: focused?"translateY(-50%) scale(1.1)":"translateY(-50%) scale(1)" }}>{icon}</span>}
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          style={{ width:"100%", padding:`11px 13px 11px ${icon?"38px":"13px"}`, borderRadius:10, background:C.surface, border:`1.5px solid ${focused?C.accent:C.border}`, color:C.text, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"Nunito Sans,sans-serif", transition:"border .15s, box-shadow .15s", boxShadow:focused?`0 0 0 3px ${C.accent}18`:"none" }}
          onFocus={()=>setFocused(true)}
          onBlur={e=>{ setFocused(false); onBlur && onBlur(e); }} />
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
function Sidebar({ view, setView, t, C, dark, setDark, lang, setLang, onSignup, onLogin, session, profile, onSignOut }) {
  const role = profile?.role;
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const nav = [
    { id:"browse",   ic:"◈", emoji:"🔍", l:t.nav.browse,   show: true },
    { id:"post",     ic:"✦", emoji:"✦",  l:t.nav.post,     show: true },
    { id:"client",   ic:"⊙", emoji:"⊙",  l:t.nav.client,   show: !!session && (role==="client"  || role==="admin") },
    { id:"provider", ic:"◎", emoji:"◎",  l:t.nav.provider, show: !!session && (role==="provider"|| role==="admin") },
    { id:"admin",    ic:"⬡", emoji:"⬡",  l:t.nav.admin,    show: !!session && role==="admin" },
  ].filter(n => n.show);

  // ── MOBILE: bottom tab bar + slide-up drawer ──
  if (isMobile) {
    const avatarInit = profile ? (profile.name||"U").split(" ").filter(Boolean).map(w=>w[0]).join("").slice(0,2).toUpperCase() : "?";
    return (
      <>
        {/* Bottom Tab Bar */}
        <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:500, background:C.surface, borderTop:`1px solid ${C.border}`, display:"flex", alignItems:"stretch", paddingBottom:"env(safe-area-inset-bottom,0px)", boxShadow:"0 -4px 20px #00000022" }}>
          {nav.map(n => {
            const active = view === n.id;
            return (
              <button key={n.id} onClick={()=>setView(n.id)}
                style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:3, padding:"10px 4px 8px", border:"none", background:"transparent", cursor:"pointer", position:"relative", minWidth:0 }}>
                {active && <span style={{ position:"absolute", top:0, left:"20%", right:"20%", height:2, borderRadius:"0 0 3px 3px", background:C.accent }}/>}
                <span style={{ fontSize:18, lineHeight:1, filter:active?"none":"grayscale(0.3)", opacity:active?1:0.5, transition:"all .2s" }}>{n.ic}</span>
                <span style={{ fontSize:9, fontWeight:active?800:500, color:active?C.accent:C.muted, fontFamily:"Nunito Sans,sans-serif", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:"100%", transition:"color .2s" }}>
                  {n.l.split(" ")[0]}
                </span>
              </button>
            );
          })}
          {/* Menu button */}
          <button onClick={()=>setDrawerOpen(true)}
            style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:3, padding:"10px 4px 8px", border:"none", background:"transparent", cursor:"pointer", minWidth:0 }}>
            {session && profile
              ? <Av init={avatarInit} size={22} color={C.accent}/>
              : <span style={{ fontSize:18, opacity:0.5 }}>☰</span>}
            <span style={{ fontSize:9, fontWeight:500, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>
              {session ? "Cuenta" : "Menú"}
            </span>
          </button>
        </div>

        {/* Slide-up Drawer */}
        {drawerOpen && (
          <div style={{ position:"fixed", inset:0, zIndex:600, animation:"fadeIn .2s ease" }} onClick={()=>setDrawerOpen(false)}>
            <div style={{ position:"absolute", inset:0, background:"#00000066" }}/>
            <div onClick={e=>e.stopPropagation()}
              style={{ position:"absolute", bottom:0, left:0, right:0, background:C.surface, borderRadius:"20px 20px 0 0", padding:"20px 20px calc(20px + env(safe-area-inset-bottom,0px))", animation:"slideUp .25s ease", boxShadow:"0 -8px 40px #00000044" }}>
              {/* Handle */}
              <div style={{ width:40, height:4, borderRadius:99, background:C.border, margin:"0 auto 20px" }}/>
              {/* Brand */}
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, paddingBottom:16, borderBottom:`1px solid ${C.border}` }}>
                <BrandName size={20} C={C}/>
              </div>
              {/* User info */}
              {session && profile && (
                <div style={{ background:C.faint, borderRadius:12, padding:"12px 14px", marginBottom:14, display:"flex", alignItems:"center", gap:10 }}>
                  <Av init={avatarInit} size={36} color={C.accent}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:800, color:C.text, fontFamily:"Nunito Sans,sans-serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{profile.name}</div>
                    <div style={{ fontSize:11, color:C.accent, fontFamily:"Nunito Sans,sans-serif", fontWeight:700 }}>{profile.account_no}</div>
                  </div>
                </div>
              )}
              {/* Settings */}
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:14 }}>
                <button onClick={()=>{ setDark(d=>{ const next=!d; try{localStorage.setItem("esr_dark",next?"1":"0")}catch{}; return next; }); }}
                  style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 14px", borderRadius:12, background:C.faint, border:"none", color:C.text, fontSize:14, cursor:"pointer", fontWeight:600, fontFamily:"Nunito Sans,sans-serif", textAlign:"left" }}>
                  {dark?"☀️":"🌙"} <span>{dark?t.theme.dark:t.theme.light}</span>
                </button>
                <button onClick={()=>setLang(l=>l==="es"?"en":"es")}
                  style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 14px", borderRadius:12, background:C.faint, border:"none", color:C.text, fontSize:14, cursor:"pointer", fontWeight:600, fontFamily:"Nunito Sans,sans-serif", textAlign:"left" }}>
                  🌐 <span>{t.lang}</span>
                </button>
              </div>
              {/* Auth */}
              {session && profile ? (
                <button onClick={()=>{ onSignOut(); setDrawerOpen(false); }}
                  style={{ width:"100%", padding:"14px", borderRadius:12, background:"transparent", border:`1.5px solid ${C.red}40`, color:C.red, fontSize:14, cursor:"pointer", fontWeight:700, fontFamily:"Nunito Sans,sans-serif" }}>
                  Cerrar sesión
                </button>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                  <Btn onClick={()=>{ onSignup(); setDrawerOpen(false); }} full C={C} size="lg" pulse>{t.signup}</Btn>
                  <button onClick={()=>{ onLogin(); setDrawerOpen(false); }}
                    style={{ width:"100%", padding:"13px", background:"transparent", border:`1.5px solid ${C.border}`, borderRadius:12, color:C.muted, fontSize:14, cursor:"pointer", fontFamily:"Nunito Sans,sans-serif" }}>
                    {t.login}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  // ── DESKTOP: original sidebar ──
  return (
    <div style={{ width:232, background:C.surface, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", flexShrink:0 }}>
      <div style={{ padding:"24px 20px 16px", borderBottom:`1px solid ${C.border}` }}>
        <div onClick={()=>setView("browse")} style={{ cursor:"pointer", display:"inline-block" }}>
          <BrandName size={22} C={C}/>
        </div>
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
        <button onClick={()=>setDark(d=>{ const next=!d; try{localStorage.setItem("esr_dark",next?"1":"0")}catch{}; return next; })} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 11px", borderRadius:9, background:C.faint, border:"none", color:C.text, fontSize:12, cursor:"pointer", fontWeight:600, fontFamily:"Nunito Sans,sans-serif", transition:"background .15s" }}
          onMouseEnter={e=>e.currentTarget.style.background=C.border} onMouseLeave={e=>e.currentTarget.style.background=C.faint}>
          {dark?"☀️":"🌙"} {dark?t.theme.dark:t.theme.light}
        </button>
        <button onClick={()=>setLang(l=>l==="es"?"en":"es")} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 11px", borderRadius:9, background:C.faint, border:"none", color:C.text, fontSize:12, cursor:"pointer", fontWeight:600, fontFamily:"Nunito Sans,sans-serif", transition:"background .15s" }}
          onMouseEnter={e=>e.currentTarget.style.background=C.border} onMouseLeave={e=>e.currentTarget.style.background=C.faint}>
          🌐 {t.lang}
        </button>
        {session && profile ? (
          <div style={{ background:C.faint, border:`1px solid ${C.border}`, borderRadius:11, padding:"10px 12px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <Av init={(profile.name||"U").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()} size={30} color={C.accent}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:800, color:C.text, fontFamily:"Nunito Sans,sans-serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{profile.name}</div>
                <div style={{ fontSize:10, color:C.accent, fontFamily:"Nunito Sans,sans-serif", fontWeight:700 }}>{profile.account_no}</div>
              </div>
            </div>
            <button onClick={onSignOut} style={{ width:"100%", padding:"6px", borderRadius:8, background:"transparent", border:`1px solid ${C.border}`, color:C.muted, fontSize:11, cursor:"pointer", fontFamily:"Nunito Sans,sans-serif", transition:"all .15s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.red;e.currentTarget.style.color=C.red;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;}}>
              Cerrar sesión
            </button>
          </div>
        ) : (
          <>
            <Btn onClick={onSignup} full C={C} pulse>{t.signup}</Btn>
            <button onClick={onLogin} style={{ width:"100%", padding:"7px", background:"transparent", border:`1px solid ${C.border}`, borderRadius:9, color:C.muted, fontSize:12, cursor:"pointer", fontFamily:"Nunito Sans,sans-serif", transition:"all .15s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.color=C.accent;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;}}>
              {t.login}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── SIGNUP MODAL ──────────────────────────────────────────────────
// ── LOGIN MODAL ───────────────────────────────────────────────────
function LoginModal({ C, t, onClose, onAuthChange, onSwitchToSignup }) {
  const [form, setForm] = useState({ email:"", password:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forgotSent, setForgotSent] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.password) { setError("Por favor completa todos los campos."); return; }
    setLoading(true); setError(null);
    const { data, error: err } = await signIn({ email: form.email, password: form.password });
    setLoading(false);
    if (err) {
      if (err.message.includes("Invalid login")) setError("Correo o contraseña incorrectos.");
      else if (err.message.includes("Email not confirmed")) setError("Debes confirmar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.");
      else setError(err.message);
      return;
    }
    onAuthChange && onAuthChange(data.session);
    onClose();
  };

  const handleForgot = async () => {
    if (!form.email) { setError("Escribe tu correo primero."); return; }
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(form.email, { redirectTo: "https://elsociord.com" });
    setLoading(false);
    setForgotSent(true);
  };

  if (forgotSent) return (
    <Modal onClose={onClose} C={C} width={400}>
      <div style={{ textAlign:"center", padding:"16px 0" }}>
        <div style={{ fontSize:48, marginBottom:12 }}>📧</div>
        <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:20, fontWeight:900, color:C.text, margin:"0 0 8px" }}>Revisa tu correo</h2>
        <p style={{ color:C.muted, fontSize:13, fontFamily:"Nunito Sans,sans-serif", lineHeight:1.6 }}>
          Te enviamos un enlace para restablecer tu contraseña a <strong style={{color:C.accent}}>{form.email}</strong>
        </p>
        <div style={{ marginTop:20 }}><Btn onClick={onClose} full C={C}>Entendido</Btn></div>
      </div>
    </Modal>
  );

  return (
    <Modal onClose={onClose} C={C} width={420}>
      <div style={{ textAlign:"center", marginBottom:22 }}>
        <BrandName size={26} C={C}/>
        <p style={{ fontSize:13, color:C.muted, margin:"8px 0 0", fontFamily:"Nunito Sans,sans-serif" }}>
          Bienvenido de vuelta
        </p>
      </div>

      {error && (
        <div style={{ background:`${C.red}15`, border:`1px solid ${C.red}40`, borderRadius:10, padding:"11px 14px", fontSize:12, color:C.red, marginBottom:14, fontFamily:"Nunito Sans,sans-serif", lineHeight:1.5 }}>
          {error}
        </div>
      )}

      <Input label="Correo electrónico" value={form.email}
        onChange={e=>setForm(f=>({...f,email:e.target.value}))} type="email" icon="✉️" C={C}/>
      <Input label="Contraseña" value={form.password}
        onChange={e=>setForm(f=>({...f,password:e.target.value}))} type="password" icon="🔒" C={C}
        onKeyDown={e=>e.key==="Enter" && handleLogin()}/>

      <div style={{ textAlign:"right", marginBottom:16, marginTop:-4 }}>
        <span onClick={()=>setShowForgot(true)} style={{ fontSize:11, color:C.accent, cursor:"pointer", fontFamily:"Nunito Sans,sans-serif", fontWeight:600 }}>
          ¿Olvidaste tu contraseña?
        </span>
      </div>

      {showForgot && (
        <div style={{ background:C.faint, border:`1px solid ${C.border}`, borderRadius:10, padding:"11px 14px", marginBottom:14, display:"flex", gap:8, alignItems:"center" }}>
          <span style={{ fontSize:12, color:C.muted, fontFamily:"Nunito Sans,sans-serif", flex:1 }}>
            Enviaremos un enlace a <strong style={{color:C.text}}>{form.email||"tu correo"}</strong>
          </span>
          <Btn onClick={handleForgot} disabled={loading} C={C} size="sm">Enviar</Btn>
        </div>
      )}

      <Btn full onClick={handleLogin} disabled={loading} C={C} size="lg">
        {loading
          ? <><span style={{ display:"inline-block", width:16, height:16, border:"2px solid #ffffff44", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .6s linear infinite" }}/> Entrando...</>
          : "Iniciar Sesión →"}
      </Btn>

      <div style={{ textAlign:"center", marginTop:14, fontSize:12, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>
        ¿No tienes cuenta?{" "}
        <span onClick={onSwitchToSignup} style={{ color:C.accent, cursor:"pointer", fontWeight:700 }}>
          Regístrate gratis
        </span>
      </div>
    </Modal>
  );
}


function SignupModal({ C, t, onClose, onAuthChange, onSwitchToLogin }) {
  const s = t.su;
  const [role, setRole] = useState(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name:"", email:"", phone:"", whatsapp:"", password:"", sector:"", city:"Santo Domingo", howHeard:"", category:"", experience:"", bio:"", verifyNow:true });
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ email:"", password:"" });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const upd = (k,v) => setForm(f=>({...f,[k]:v}));
  const steps = role==="provider" ? 4 : 3;  // provider: info, location, service, confirm | client: info, location, confirm

  const handleSignup = async () => {
    setLoading(true); setAuthError(null);
    const { error } = await signUp({ ...form, role });
    setLoading(false);
    if (error) { setAuthError(error.message); return; }
    setDone(true);
  };

  const handleLogin = async () => {
    setLoading(true); setAuthError(null);
    const { data, error } = await signIn(loginForm);
    setLoading(false);
    if (error) { setAuthError(error.message); return; }
    onAuthChange && onAuthChange(data.session);
    onClose();
  };

  if (done) return (
    <Modal onClose={onClose} C={C} width={420}>
      <div style={{ textAlign:"center", padding:"16px 0" }}>
        <div style={{ fontSize:52, animation:"checkPop .5s cubic-bezier(.175,.885,.32,1.275)", display:"inline-block" }}>📧</div>
        <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:22, fontWeight:900, color:C.text, margin:"14px 0 8px" }}>¡Revisa tu correo!</h2>
        <p style={{ color:C.muted, fontSize:14, fontFamily:"Nunito Sans,sans-serif", lineHeight:1.6, margin:"0 0 10px" }}>
          Te enviamos un enlace de confirmación a:
        </p>
        <div style={{ fontWeight:800, color:C.accent, fontSize:15, marginBottom:16, fontFamily:"Nunito Sans,sans-serif" }}>{form.email}</div>
        <div style={{ background:C.faint, border:`1px solid ${C.border}`, borderRadius:12, padding:"13px 16px", fontSize:12, color:C.muted, fontFamily:"Nunito Sans,sans-serif", lineHeight:1.7, marginBottom:20, textAlign:"left" }}>
          <strong style={{color:C.text}}>Pasos siguientes:</strong><br/>
          1. Abre tu correo electrónico<br/>
          2. Busca un mensaje de <strong style={{color:C.text}}>El Socio RD</strong><br/>
          3. Haz clic en el enlace para confirmar tu cuenta<br/>
          4. Regresa aquí e inicia sesión
        </div>
        <Btn onClick={onClose} full C={C} size="lg">Entendido →</Btn>
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
          <div style={{ textAlign:"center", fontSize:12, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{s.already} <span onClick={onSwitchToLogin} style={{ color:C.accent, cursor:"pointer", fontWeight:700 }}>{t.login}</span></div>
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
              {step===0?"Información básica":step===1?"Ubicación y más":step===2&&role==="provider"?"Tu servicio":"Resumen"}
            </h2>
          </div>

          {step===0 && <>
            <Input label={s.name} value={form.name} onChange={e=>upd("name",e.target.value)} icon="👤" C={C}/>
            <Input label={s.email} value={form.email} onChange={e=>upd("email",e.target.value)} type="email" icon="✉️" C={C}/>
            <Input label={s.phone} value={form.phone} onChange={e=>upd("phone",e.target.value)} type="tel" icon="📱" C={C}/>
            <Input label={s.whatsapp} value={form.whatsapp} onChange={e=>upd("whatsapp",e.target.value)} type="tel" icon="💬" placeholder="Si es diferente al teléfono" C={C}/>
            <Input label={s.password} value={form.password} onChange={e=>upd("password",e.target.value)} type="password" icon="🔒" C={C}/>
            <div style={{ fontSize:10, color:C.muted, fontFamily:"Nunito Sans,sans-serif", marginTop:-8, marginBottom:4 }}>Mínimo 6 caracteres</div>
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
                {T.es.cats.map(c=>(
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
            {step===0 && (!form.name.trim()||!form.email.includes("@")||!form.phone.trim()||!form.password||form.password.length<6) && (
              <div style={{ fontSize:11, color:C.red, fontFamily:"Nunito Sans,sans-serif", marginTop:8, textAlign:"center" }}>
                {!form.name.trim()?"⚠️ Ingresa tu nombre completo":!form.email.includes("@")?"⚠️ Ingresa un correo válido":!form.phone.trim()?"⚠️ Ingresa tu teléfono":form.password.length<6?"⚠️ La contraseña debe tener al menos 6 caracteres":""}
              </div>
            )}
            {step===1 && !form.sector.trim() && (form.city||form.howHeard) && (
              <div style={{ fontSize:11, color:C.red, fontFamily:"Nunito Sans,sans-serif", marginTop:8, textAlign:"center" }}>⚠️ Ingresa tu sector o barrio</div>
            )}
            {step===2 && role==="provider" && !form.category && (
              <div style={{ fontSize:11, color:C.red, fontFamily:"Nunito Sans,sans-serif", marginTop:8, textAlign:"center" }}>⚠️ Selecciona tu categoría de servicio</div>
            )}
            <Btn onClick={()=>{
              if(step===0 && (!form.name.trim()||!form.email.includes("@")||!form.phone.trim()||!form.password||form.password.length<6)) return;
              if(step===1 && !form.sector.trim()) return;
              if(step===2 && role==="provider" && !form.category) return;
              setStep(x=>x+1);
            }} full C={C}>{s.next}</Btn>
          </div>
        </div>
      )}

      {role && step===steps-1 && (
        <div style={{ animation:"fadeSlideUp .2s ease" }}>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif", marginBottom:8 }}>{s.step} {step+1} {s.of} {steps}</div>
            <div style={{ display:"flex", gap:4, marginBottom:14 }}>
              {Array.from({length:steps}).map((_,i)=>(
                <div key={i} style={{ height:4, flex:1, borderRadius:99, background:i<=step?C.accent:C.border, transition:"background .35s ease" }}/>
              ))}
            </div>
            <h2 style={{ fontSize:18, fontWeight:800, color:C.text, margin:0, fontFamily:"'Nunito',sans-serif" }}>Crear tu cuenta</h2>
          </div>
          {authError && (
            <div style={{ background:`${C.red}15`, border:`1px solid ${C.red}30`, borderRadius:10, padding:"10px 14px", fontSize:12, color:C.red, marginBottom:14, fontFamily:"Nunito Sans,sans-serif" }}>
              {authError}
            </div>
          )}
          <div style={{ background:C.faint, borderRadius:12, padding:"13px 16px", marginBottom:16, fontSize:12, color:C.muted, fontFamily:"Nunito Sans,sans-serif", lineHeight:1.7 }}>
            <strong style={{color:C.text}}>📋 Resumen de tu cuenta:</strong><br/>
            👤 {form.name}<br/>
            ✉️ {form.email}<br/>
            📱 {form.phone}<br/>
            📍 {form.sector}, {form.city}<br/>
            {role==="provider" && form.category && <span>{CAT_ICONS[form.category]} {form.category}{form.experience?` · ${form.experience}`:""}<br/></span>}
            {role==="provider" && form.bio && <span style={{fontStyle:"italic"}}>"{form.bio.slice(0,60)}{form.bio.length>60?"...":""}"<br/></span>}
          </div>
          <Btn full onClick={handleSignup} disabled={loading||!acceptedTerms} C={C} size="lg">
            {loading
              ? <><span style={{ display:"inline-block", width:16, height:16, border:"2px solid #ffffff44", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .6s linear infinite" }}/> Creando cuenta...</>
              : "Crear cuenta gratis →"}
          </Btn>

          {/* T&C checkbox */}
          <div style={{ display:"flex", alignItems:"flex-start", gap:9, margin:"12px 0 4px" }}>
            <input type="checkbox" checked={acceptedTerms} onChange={e=>setAcceptedTerms(e.target.checked)}
              style={{ accentColor:C.accent, width:16, height:16, marginTop:2, flexShrink:0, cursor:"pointer" }}/>
            <div style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif", lineHeight:1.6 }}>
              Acepto los{" "}
              <span onClick={()=>setShowTerms(true)} style={{ color:C.accent, cursor:"pointer", fontWeight:700, textDecoration:"underline" }}>
                Términos y Condiciones
              </span>
              {" "}de El Socio RD. Entiendo que la plataforma es un intermediario y no es responsable por disputas entre cliente y proveedor.
            </div>
          </div>
          {!acceptedTerms && (
            <div style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif", textAlign:"center", marginTop:4 }}>
              ⚠️ Debes aceptar los términos para continuar
            </div>
          )}
          <div style={{ display:"flex", gap:9, marginTop:10 }}>
            <Btn onClick={()=>setStep(x=>x-1)} outline full C={C} size="sm">{s.back}</Btn>
          </div>
        </div>
      )}
      {showTerms && <TermsModal C={C} onClose={()=>setShowTerms(false)}/>}
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
          {p.avatar_url
            ? <img src={p.avatar_url} alt={p.name} style={{ width:48, height:48, borderRadius:"50%", objectFit:"cover", flexShrink:0, border:`2px solid ${featured?C.gold:C.accent}` }}/>
            : <Av init={p.avatar} size={48} color={C.accent}/>
          }
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
        {(p.portfolio||[]).map((item,i)=>(
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

// ── AD MEDIA BLOCK ────────────────────────────────────────────────
function AdMediaBlock({ ad, C }) {
  const safeLink = ad.link
    ? (ad.link.startsWith("http://") || ad.link.startsWith("https://") ? ad.link : "https://" + ad.link)
    : null;
  return (
    <div>
      {ad.media_type === "video" ? (
        <video src={ad.media_url} style={{ width:"100%", display:"block", maxHeight:200, objectFit:"cover" }} autoPlay muted loop playsInline/>
      ) : (
        <img src={ad.media_url} alt={ad.title} style={{ width:"100%", display:"block", objectFit:"cover", maxHeight:200 }}/>
      )}
      {ad.title && (
        <div style={{ padding:"9px 12px 11px", textAlign:"center" }}>
          <div style={{ fontWeight:700, fontSize:12, color:C.text, fontFamily:"'Nunito',sans-serif", marginBottom:2 }}>{ad.title}</div>
          {safeLink && (
            <a
              href={safeLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ display:"inline-block", marginTop:4, padding:"5px 14px", borderRadius:7, background:C.accent, color:"#fff", fontSize:11, fontWeight:700, fontFamily:"Nunito Sans,sans-serif", textDecoration:"none" }}>
              Ver más →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ── ADSENSE SLOT ──────────────────────────────────────────────────
function AdSenseSlot({ code, C }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !code) return;
    ref.current.innerHTML = code;
    // Re-execute any script tags inside the injected code
    Array.from(ref.current.querySelectorAll("script")).forEach(oldScript => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach(a => newScript.setAttribute(a.name, a.value));
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }, [code]);
  if (!code) return null;
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden" }}>
      <div style={{ padding:"5px 12px", background:C.faint, borderBottom:`1px solid ${C.border}` }}>
        <span style={{ fontSize:9, color:C.muted, letterSpacing:"0.1em", fontFamily:"Nunito Sans,sans-serif", textTransform:"uppercase" }}>Publicidad · Google</span>
      </div>
      <div ref={ref} style={{ padding:"8px", minHeight:60, display:"flex", alignItems:"center", justifyContent:"center" }}/>
    </div>
  );
}

// ── TERMS MODAL ───────────────────────────────────────────────────
function TermsModal({ C, onClose }) {
  return (
    <Modal onClose={onClose} C={C} width={560}>
      <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:20, fontWeight:900, color:C.text, margin:"0 0 4px" }}>📄 Términos y Condiciones</h2>
      <p style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif", marginBottom:18 }}>Última actualización: Marzo 2025 · El Socio RD</p>
      <div style={{ maxHeight:420, overflowY:"auto", paddingRight:8 }}>
        {[
          { title:"1. Naturaleza del servicio", body:"El Socio RD es una plataforma digital que actúa exclusivamente como intermediario entre clientes que buscan servicios y proveedores que los ofrecen. El Socio RD NO presta servicios directamente, NO contrata trabajadores, y NO garantiza la calidad, puntualidad ni resultado de los servicios contratados entre las partes." },
          { title:"2. Responsabilidad limitada", body:"El Socio RD no es responsable por daños, pérdidas, accidentes, robos, incumplimientos, disputas o cualquier consecuencia derivada de la relación entre cliente y proveedor. Toda transacción, acuerdo de precio y condiciones de servicio se establece directamente entre las partes." },
          { title:"3. Verificación de identidad", body:"La insignia de 'Verificado' indica únicamente que el proveedor presentó documentos de identidad al momento del registro. El Socio RD no garantiza las habilidades profesionales, certificaciones, ni el historial del proveedor más allá de dicha verificación de identidad." },
          { title:"4. Disputas y reclamaciones", body:"Cualquier disputa entre cliente y proveedor debe ser resuelta directamente entre las partes. En caso de conducta ilegal, fraude, o situaciones que requieran intervención de autoridades, las partes deben acudir a las autoridades competentes de la República Dominicana. El Socio RD no interviene en disputas ni actúa como árbitro." },
          { title:"5. Conducta en la plataforma", body:"Los usuarios se comprometen a usar la plataforma de buena fe. Está prohibido el uso de información falsa, spam, acoso, o cualquier actividad que viole las leyes de la República Dominicana. El Socio RD se reserva el derecho de suspender o eliminar cuentas que violen estas normas." },
          { title:"6. Datos personales", body:"La información proporcionada al registrarse (nombre, teléfono, correo) es utilizada únicamente para facilitar la conexión entre clientes y proveedores. No vendemos ni compartimos tus datos con terceros fuera de la plataforma." },
          { title:"7. Modificaciones", body:"El Socio RD puede modificar estos términos en cualquier momento. El uso continuado de la plataforma tras dichas modificaciones implica la aceptación de los nuevos términos." },
          { title:"8. Jurisdicción", body:"Estos términos se rigen por las leyes de la República Dominicana. Cualquier controversia legal será sometida a los tribunales competentes del país." },
        ].map(({title, body}) => (
          <div key={title} style={{ marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:800, color:C.text, fontFamily:"'Nunito',sans-serif", marginBottom:4 }}>{title}</div>
            <div style={{ fontSize:12, color:C.muted, fontFamily:"Nunito Sans,sans-serif", lineHeight:1.7 }}>{body}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop:18 }}>
        <Btn onClick={onClose} full C={C}>Entendido →</Btn>
      </div>
    </Modal>
  );
}

// ── RATING MODAL ──────────────────────────────────────────────────
function RatingModal({ C, job, onClose, onSubmit }) {
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!stars) return;
    setSubmitting(true);
    await onSubmit({ jobId: job.id, providerId: job.provider_id, stars, comment });
    setSubmitting(false);
    onClose();
  };

  return (
    <Modal onClose={onClose} C={C} width={420}>
      <div style={{ textAlign:"center", marginBottom:20 }}>
        <div style={{ fontSize:40, marginBottom:8 }}>⭐</div>
        <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:18, fontWeight:900, color:C.text, margin:"0 0 6px" }}>Calificar el servicio</h2>
        <p style={{ fontSize:12, color:C.muted, fontFamily:"Nunito Sans,sans-serif", margin:0 }}>{job.category} · {job.sector}</p>
        <p style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif", margin:"3px 0 0", fontStyle:"italic" }}>"{job.description?.slice(0,60)}{job.description?.length>60?"...":""}"</p>
      </div>

      {/* Star selector */}
      <div style={{ display:"flex", justifyContent:"center", gap:10, marginBottom:16 }}>
        {[1,2,3,4,5].map(n => (
          <button key={n}
            onClick={()=>setStars(n)}
            onMouseEnter={()=>setHovered(n)}
            onMouseLeave={()=>setHovered(0)}
            style={{ fontSize:36, background:"none", border:"none", cursor:"pointer", transition:"transform .15s", transform:(hovered||stars)>=n?"scale(1.2)":"scale(1)", filter:(hovered||stars)>=n?"none":"grayscale(1) opacity(0.4)" }}>
            ⭐
          </button>
        ))}
      </div>
      <div style={{ textAlign:"center", fontSize:13, fontWeight:700, color:C.accent, fontFamily:"Nunito Sans,sans-serif", marginBottom:16, height:20 }}>
        {(hovered||stars)===1?"😕 Malo":(hovered||stars)===2?"😐 Regular":(hovered||stars)===3?"🙂 Bueno":(hovered||stars)===4?"😊 Muy bueno":(hovered||stars)===5?"🤩 Excelente":""}
      </div>

      {/* Comment */}
      <div style={{ marginBottom:16 }}>
        <label style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:"0.06em", textTransform:"uppercase", fontFamily:"Nunito Sans,sans-serif", display:"block", marginBottom:6 }}>Comentario (opcional)</label>
        <textarea value={comment} onChange={e=>setComment(e.target.value)} rows={3}
          placeholder="¿Cómo fue tu experiencia con este proveedor?"
          style={{ width:"100%", padding:"10px 12px", borderRadius:10, background:C.faint, border:`1.5px solid ${C.border}`, color:C.text, fontSize:13, outline:"none", resize:"none", fontFamily:"Nunito Sans,sans-serif", boxSizing:"border-box" }}
          onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border}/>
      </div>

      <div style={{ display:"flex", gap:9 }}>
        <Btn onClick={onClose} outline full C={C}>Cancelar</Btn>
        <Btn onClick={handleSubmit} full C={C} disabled={!stars||submitting}>
          {submitting ? "Enviando..." : "Enviar calificación ⭐"}
        </Btn>
      </div>
    </Modal>
  );
}

// ── TERMS LINK (reusable inline link that opens modal) ────────────
function TermsLink({ C }) {
  const [show, setShow] = useState(false);
  return (
    <>
      <span onClick={()=>setShow(true)} style={{ fontSize:12, color:C.accent, cursor:"pointer", fontFamily:"Nunito Sans,sans-serif", fontWeight:600, textDecoration:"underline" }}>
        Términos y Condiciones
      </span>
      {show && <TermsModal C={C} onClose={()=>setShow(false)}/>}
    </>
  );
}

// ── MOBILE HEADER ─────────────────────────────────────────────────
function MobileHeader({ C, title }) {
  const isMobile = useIsMobile();
  if (!isMobile) return null;
  return (
    <div style={{ padding:"14px 18px 12px", background:C.surface, borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:10, position:"sticky", top:0, zIndex:100 }}>
      <BrandName size={18} C={C}/>
      {title && <span style={{ fontSize:12, color:C.muted, fontFamily:"Nunito Sans,sans-serif", marginLeft:4 }}>· {title}</span>}
    </div>
  );
}

// ── BROWSE VIEW ───────────────────────────────────────────────────
function BrowseView({ C, t }) {
  const b = t.br;
  const isMobile = useIsMobile();
  const [cat, setCat] = useState(null);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [dbProviders, setDbProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [usingReal, setUsingReal] = useState(false);
  const [sidebarAds, setSidebarAds] = useState([]);
  const [topAds,     setTopAds]     = useState([]);
  const [bottomAds,  setBottomAds]  = useState([]);
  const [adsenseSlot1, setAdsenseSlot1] = useState("");
  const [adsenseSlot2, setAdsenseSlot2] = useState("");

  const fetchSidebarAds = () => {
    supabase.from("announcements").select("*").eq("active", true).order("created_at", { ascending: false })
      .then(({ data }) => {
        const all = data || [];
        setSidebarAds(all.filter(a => a.position === "sidebar"));
        setTopAds(all.filter(a => a.position === "top"));
        setBottomAds(all.filter(a => a.position === "bottom"));
      });
    supabase.from("site_settings").select("*")
      .then(({ data }) => {
        if (data) {
          const s1 = data.find(s => s.key === "adsense_slot_1");
          const s2 = data.find(s => s.key === "adsense_slot_2");
          setAdsenseSlot1(s1?.value || "");
          setAdsenseSlot2(s2?.value || "");
        }
      });
  };

  useEffect(() => {
    fetchSidebarAds();

    // Poll every 2 seconds so delete/pause from admin reflects almost instantly
    const interval = setInterval(fetchSidebarAds, 2000);

    // Also refetch when user switches back to this tab
    const onFocus = () => fetchSidebarAds();
    window.addEventListener("focus", onFocus);

    const fetchProviders = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, providers(*)")
        .eq("role", "provider")
        .eq("banned", false);
      if (!error && data && data.length > 0) {
        // Normalize DB shape to match card expectations
        const normalized = data.map(p => ({
          id: p.id,
          accountNo: p.account_no,
          name: p.name,
          email: p.email,
          phone: p.phone,
          whatsapp: p.whatsapp || p.phone,
          sector: p.sector || "",
          city: p.city || "Santo Domingo",
          banned: p.banned,
          avatar: (p.name||"U").split(" ").filter(Boolean).map(w=>w[0]).join("").slice(0,2).toUpperCase(),
          category: p.providers?.category || "",
          experience: p.providers?.experience || "",
          bio: p.providers?.bio || "",
          verified: p.providers?.verified || false,
          featured: p.providers?.featured || false,
          rating: p.providers?.rating || 0,
          reviews: p.providers?.review_count || 0,
          jobs: p.providers?.job_count || 0,
          leadCount: p.providers?.lead_count || 0,
          portfolio: [],
          avatar_url: p.providers?.avatar_url || null,
        }));
        setDbProviders(normalized);
        setUsingReal(true);
      } else {
        // No providers yet — show empty state
        setDbProviders([]);
        setUsingReal(false);
      }
      setLoadingProviders(false);
    };
    fetchProviders();
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const sourceData = dbProviders;

  const filtered = sourceData.filter(p =>
    !p.banned &&
    (!cat || p.category===cat) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))
  );
  const featured = seededShuffle(filtered.filter(p=>p.featured));
  const rest = filtered.filter(p=>!p.featured);

  return (
    <div style={{ flex:1, overflowY:"auto", background:C.bg, display:"flex", flexDirection:"column" }}>
      <MobileHeader C={C} title={null}/>
      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg, ${C.surface} 0%, ${C.faint} 100%)`, borderBottom:`1px solid ${C.border}`, padding:"24px 18px 20px", animation:"fadeSlideUp .4s ease" }}>
        <h1 style={{ fontFamily:"'Nunito',sans-serif", fontSize:24, fontWeight:900, color:C.text, margin:"0 0 5px", lineHeight:1.2 }}>{b.heroTitle}</h1>
        <p style={{ fontSize:13, color:C.muted, margin:"0 0 16px", fontFamily:"Nunito Sans,sans-serif" }}>{b.heroSub}</p>
        {/* Search */}
        <div style={{ position:"relative", maxWidth:500 }}>
          <span style={{ position:"absolute", left:14, top:"50%", fontSize:16, transition:"transform .2s", transform: searchFocused?"translateY(-50%) scale(1.1)":"translateY(-50%)" }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={b.searchPlaceholder}
            style={{ width:"100%", padding:"13px 16px 13px 44px", borderRadius:12, background:C.card, border:`1.5px solid ${searchFocused?C.accent:C.border}`, color:C.text, fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"Nunito Sans,sans-serif", transition:"border .15s, box-shadow .15s", boxShadow:searchFocused?`0 0 0 4px ${C.accent}18`:"none" }}
            onFocus={()=>setSearchFocused(true)} onBlur={()=>setSearchFocused(false)}/>
          {search && (
            <button onClick={()=>setSearch("")} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:16, lineHeight:1, padding:4 }}>✕</button>
          )}
        </div>
      </div>

      {/* Empty state when no providers yet */}
      {!loadingProviders && !usingReal && (
        <div style={{ background:`${C.accent}08`, borderBottom:`1px solid ${C.accent}20`, padding:"11px 28px", display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:14 }}>🚀</span>
          <span style={{ fontSize:12, color:C.accent, fontFamily:"Nunito Sans,sans-serif", fontWeight:600 }}>
            Sé el primero en registrarte como proveedor en El Socio RD y recibe clientes desde el día uno.
          </span>
        </div>
      )}

      {/* Top banner ads */}
      {topAds.map(ad => {
        const safeLink = ad.link ? (ad.link.startsWith("http")?ad.link:"https://"+ad.link) : null;
        const inner = (
          <div style={{ position:"relative" }}>
            {ad.media_type==="video"
              ? <video src={ad.media_url} style={{ width:"100%", maxHeight:120, objectFit:"cover", display:"block" }} autoPlay muted loop playsInline/>
              : <img src={ad.media_url} alt={ad.title} style={{ width:"100%", maxHeight:120, objectFit:"cover", display:"block" }}/>}
            <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, background:"linear-gradient(to right,#00000044,transparent,#00000044)", display:"flex", alignItems:"center", justifyContent:"center", gap:16 }}>
              {ad.title && <span style={{ color:"#fff", fontWeight:900, fontSize:18, fontFamily:"'Nunito',sans-serif", textShadow:"0 2px 8px #000" }}>{ad.title}</span>}
              {safeLink && <span style={{ background:"#fff", color:"#111", fontSize:12, fontWeight:700, padding:"5px 14px", borderRadius:20, fontFamily:"Nunito Sans,sans-serif" }}>Ver más →</span>}
            </div>
          </div>
        );
        return (
          <div key={ad.id} style={{ borderBottom:`1px solid ${C.border}`, overflow:"hidden" }}>
            <div style={{ padding:"3px 28px 2px", background:C.faint, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:9, color:C.muted, letterSpacing:"0.1em", fontFamily:"Nunito Sans,sans-serif", textTransform:"uppercase" }}>Anuncio Patrocinado</span>
            </div>
            {safeLink ? <a href={safeLink} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{ display:"block", textDecoration:"none" }}>{inner}</a> : inner}
          </div>
        );
      })}

      {/* Main layout */}
      <div style={{ display:"flex", alignItems:"flex-start", flex:1 }}>
        {/* Feed */}
        <div style={{ flex:1, padding:"16px 14px 16px 14px", minWidth:0 }}>
          {/* Category pills */}
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:18 }}>
            {[null,...T.es.cats].map((c,i)=>{
              const active = c===null?!cat:cat===c;
              return (
                <button key={i} onClick={()=>setCat(c===null?null:c)}
                  style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:22, fontSize:11, fontWeight:600, cursor:"pointer", border:`1.5px solid ${active?C.accent:C.border}`, background:active?C.accent:"transparent", color:active?"#fff":C.muted, transition:"all .2s", transform:active?"scale(1.04)":"scale(1)", fontFamily:"Nunito Sans,sans-serif", boxShadow:active?`0 2px 10px ${C.accent}44`:"none" }}
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

        {/* Ad Sidebar — desktop only */}
        {!isMobile && <div style={{ width:256, flexShrink:0, padding:"22px 18px 22px 0", display:"flex", flexDirection:"column", gap:14 }}>

          {/* Real ads from DB */}
          {sidebarAds.map((ad, i) => (
            <div key={ad.id}>
              <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden", transition:"box-shadow .2s, transform .18s" }}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow=C.shadow;e.currentTarget.style.transform="translateY(-2px)";}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="translateY(0)";}}>
                <div style={{ padding:"5px 12px", background:C.faint, borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:9, color:C.muted, letterSpacing:"0.1em", fontFamily:"Nunito Sans,sans-serif", textTransform:"uppercase" }}>Anuncio Patrocinado</span>
                </div>
                <AdMediaBlock ad={ad} C={C}/>
              </div>
              {/* Insert AdSense slot 1 after first ad, slot 2 after second */}
              {i === 0 && <AdSenseSlot code={adsenseSlot1} C={C}/>}
              {i === 1 && <AdSenseSlot code={adsenseSlot2} C={C}/>}
            </div>
          ))}

          {/* If no real ads, show AdSense slots + placeholder */}
          {sidebarAds.length === 0 && (
            <>
              {adsenseSlot1
                ? <AdSenseSlot code={adsenseSlot1} C={C}/>
                : <div style={{ background:C.card, border:`2px dashed ${C.border}`, borderRadius:14, overflow:"hidden" }}>
                    <div style={{ padding:"5px 12px", background:C.faint, borderBottom:`1px solid ${C.border}` }}>
                      <span style={{ fontSize:9, color:C.muted, letterSpacing:"0.1em", fontFamily:"Nunito Sans,sans-serif", textTransform:"uppercase" }}>Publicidad</span>
                    </div>
                    <div style={{ width:"100%", height:200, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6 }}>
                      <div style={{ fontSize:24 }}>📢</div>
                      <div style={{ fontSize:11, fontWeight:700, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>Espacio disponible</div>
                      <div style={{ fontSize:10, color:C.muted, textAlign:"center", padding:"0 14px", fontFamily:"Nunito Sans,sans-serif", lineHeight:1.5 }}>Agrega anuncios desde el panel de admin</div>
                    </div>
                  </div>
              }
              {adsenseSlot2
                ? <AdSenseSlot code={adsenseSlot2} C={C}/>
                : <div style={{ background:C.card, border:`2px dashed ${C.border}`, borderRadius:14, overflow:"hidden" }}>
                    <div style={{ padding:"5px 12px", background:C.faint, borderBottom:`1px solid ${C.border}` }}>
                      <span style={{ fontSize:9, color:C.muted, letterSpacing:"0.1em", fontFamily:"Nunito Sans,sans-serif", textTransform:"uppercase" }}>Publicidad · AdSense</span>
                    </div>
                    <div style={{ width:"100%", height:250, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6 }}>
                      <div style={{ fontSize:26 }}>📢</div>
                      <div style={{ fontSize:11, fontWeight:700, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>Google AdSense</div>
                      <div style={{ fontSize:10, color:C.muted, textAlign:"center", padding:"0 14px", fontFamily:"Nunito Sans,sans-serif", lineHeight:1.5 }}>Pega tu código en Admin → Anuncios</div>
                    </div>
                  </div>
              }
            </>
          )}

          {/* Advertise CTA */}
          <div style={{ background:`linear-gradient(135deg,${C.accent}12,${C.blue}08)`, border:`1px solid ${C.accent}30`, borderRadius:12, padding:"14px 12px", textAlign:"center" }}>
            <div style={{ fontSize:18, marginBottom:5 }}>📣</div>
            <div style={{ fontSize:12, fontWeight:800, color:C.accent, marginBottom:4, fontFamily:"'Nunito',sans-serif" }}>¿Quieres anunciarte?</div>
            <div style={{ fontSize:11, color:C.muted, marginBottom:10, lineHeight:1.4, fontFamily:"Nunito Sans,sans-serif" }}>Llega a miles de clientes en RD</div>
            <a href="mailto:ads@elsociord.com" style={{ display:"block", padding:"7px 0", borderRadius:8, background:C.accent, color:"#fff", fontSize:11, fontWeight:700, textDecoration:"none", fontFamily:"Nunito Sans,sans-serif" }}>Contactar →</a>
          </div>
        </div>}
      </div>

      {/* Bottom banner ads */}
      {bottomAds.map(ad => {
        const safeLink = ad.link ? (ad.link.startsWith("http")?ad.link:"https://"+ad.link) : null;
        const inner = (
          <div style={{ position:"relative" }}>
            {ad.media_type==="video"
              ? <video src={ad.media_url} style={{ width:"100%", maxHeight:120, objectFit:"cover", display:"block" }} autoPlay muted loop playsInline/>
              : <img src={ad.media_url} alt={ad.title} style={{ width:"100%", maxHeight:120, objectFit:"cover", display:"block" }}/>}
            <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, background:"linear-gradient(to right,#00000044,transparent,#00000044)", display:"flex", alignItems:"center", justifyContent:"center", gap:16 }}>
              {ad.title && <span style={{ color:"#fff", fontWeight:900, fontSize:18, fontFamily:"'Nunito',sans-serif", textShadow:"0 2px 8px #000" }}>{ad.title}</span>}
              {safeLink && <span style={{ background:"#fff", color:"#111", fontSize:12, fontWeight:700, padding:"5px 14px", borderRadius:20, fontFamily:"Nunito Sans,sans-serif" }}>Ver más →</span>}
            </div>
          </div>
        );
        return (
          <div key={ad.id} style={{ borderTop:`1px solid ${C.border}`, overflow:"hidden" }}>
            <div style={{ padding:"3px 28px 2px", background:C.faint, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:9, color:C.muted, letterSpacing:"0.1em", fontFamily:"Nunito Sans,sans-serif", textTransform:"uppercase" }}>Anuncio Patrocinado</span>
            </div>
            {safeLink ? <a href={safeLink} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{ display:"block", textDecoration:"none" }}>{inner}</a> : inner}
          </div>
        );
      })}

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:`1px solid ${C.border}`, padding:"24px 20px 20px", background:C.surface, flexShrink:0 }}>
        <div style={{ display:"flex", flexWrap:"wrap", gap:24, justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
          {/* Brand */}
          <div style={{ minWidth:160, maxWidth:220 }}>
            <BrandName size={17} C={C}/>
            <div style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif", marginTop:5, lineHeight:1.6 }}>
              Conectamos clientes con proveedores verificados en República Dominicana.
            </div>
          </div>
          {/* Links */}
          <div style={{ display:"flex", gap:28, flexWrap:"wrap" }}>
            <div>
              <div style={{ fontSize:10, fontWeight:800, color:C.text, fontFamily:"'Nunito',sans-serif", marginBottom:8, letterSpacing:"0.07em", textTransform:"uppercase" }}>Legal</div>
              <TermsLink C={C}/>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:800, color:C.text, fontFamily:"'Nunito',sans-serif", marginBottom:8, letterSpacing:"0.07em", textTransform:"uppercase" }}>Ayuda</div>
              <a href="mailto:soporte@elsociord.com" style={{ display:"block", fontSize:12, color:C.muted, fontFamily:"Nunito Sans,sans-serif", textDecoration:"none", marginBottom:5 }}
                onMouseEnter={e=>e.target.style.color=C.accent} onMouseLeave={e=>e.target.style.color=C.muted}>
                ✉️ soporte@elsociord.com
              </a>
              <a href="https://wa.me/18094444444" target="_blank" rel="noreferrer" style={{ display:"block", fontSize:12, color:C.muted, fontFamily:"Nunito Sans,sans-serif", textDecoration:"none" }}
                onMouseEnter={e=>e.target.style.color=C.accent} onMouseLeave={e=>e.target.style.color=C.muted}>
                💬 WhatsApp soporte
              </a>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:800, color:C.text, fontFamily:"'Nunito',sans-serif", marginBottom:8, letterSpacing:"0.07em", textTransform:"uppercase" }}>Anuncios</div>
              <a href="mailto:ads@elsociord.com" style={{ display:"block", fontSize:12, color:C.muted, fontFamily:"Nunito Sans,sans-serif", textDecoration:"none" }}
                onMouseEnter={e=>e.target.style.color=C.accent} onMouseLeave={e=>e.target.style.color=C.muted}>
                📣 ads@elsociord.com
              </a>
            </div>
          </div>
        </div>
        {/* Bottom bar */}
        <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:12, display:"flex", flexWrap:"wrap", gap:8, justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:10, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>
            © {new Date().getFullYear()} El Socio RD · Todos los derechos reservados
          </div>
          <div style={{ fontSize:10, color:C.muted, fontFamily:"Nunito Sans,sans-serif", textAlign:"right" }}>
            Somos intermediarios — no somos responsables por disputas. <TermsLink C={C}/>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PostJobView({ C, t, setView, session, profile }) {
  const p = t.pj;
  const [form, setForm] = useState({ category:"", desc:"", sector:"", city:"Santo Domingo", budget:"", urgency:"soon", size:"medium", howHeard:"" });
  const [contact, setContact] = useState({ name:"", phone:"", email:"" });
  const [posted, setPosted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const upd = (k,v) => setForm(f=>({...f,[k]:v}));
  const updC = (k,v) => setContact(c=>({...c,[k]:v}));

  // Pre-fill contact from profile on mount
  useEffect(() => {
    if (profile) {
      setContact({
        name:  profile.name  || "",
        phone: profile.phone || "",
        email: profile.email || session?.user?.email || "",
      });
    }
  }, [profile]);

  const contactOk = contact.name.trim().length > 1 && contact.phone.trim().length > 6 && contact.email.includes("@");
  const valid = form.category && form.desc.length > 10 && form.sector && contactOk;
  const completeness = [form.category, form.desc.length>10, form.sector, form.budget, form.howHeard, contactOk].filter(Boolean).length;
  const pct = Math.round((completeness/6)*100);

  const handleSubmit = async () => {
    if (!valid) return;
    setSubmitting(true);
    setSubmitError(null);
    const device = /Mobi/.test(navigator.userAgent) ? "Mobile" : "Desktop";

    // If logged in and profile was missing phone/name, save them back
    if (session && profile && (!profile.phone || !profile.name)) {
      await supabase.from("profiles").update({
        name:  contact.name  || profile.name,
        phone: contact.phone || profile.phone,
      }).eq("id", session.user.id);
    }

    const { error } = await supabase.from("jobs").insert([{
      client_id:    session?.user?.id || null,   // null for anonymous guests
      client_name:  contact.name,
      client_phone: contact.phone,
      client_email: contact.email,
      category:     form.category,
      description:  form.desc,
      sector:       form.sector,
      city:         form.city,
      budget:       form.budget,
      urgency:      form.urgency,
      size:         form.size,
      how_heard:    form.howHeard,
      device,
      status:       "open",
    }]);
    setSubmitting(false);
    if (error) { setSubmitError("Error al publicar: " + error.message); return; }
    setPosted(true);
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
          <div style={{ padding:"14px 0", textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:8 }}>📲</div>
            <div style={{ fontSize:13, color:C.muted, fontFamily:"Nunito Sans,sans-serif", lineHeight:1.7 }}>
              Los proveedores de <strong style={{color:C.accent}}>{form.category}</strong> en tu área recibirán tu solicitud y te contactarán.
            </div>
          </div>
          <div style={{ height:1, background:C.border, margin:"10px 0" }}/>
          <div style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>
            <div style={{ marginBottom:4 }}>📞 <strong style={{color:C.text}}>{contact.name}</strong></div>
            <div style={{ marginBottom:4 }}>📱 {contact.phone}</div>
            <div>✉️ {contact.email}</div>
          </div>
        </div>
        <Btn onClick={()=>{setPosted(false);setForm({category:"",desc:"",sector:"",city:"Santo Domingo",budget:"",urgency:"soon",size:"medium",howHeard:""});setContact({ name:"", phone:"", email:"" });}} C={C} size="lg">{p.postAnother}</Btn>
      </div>
    </div>
  );

  return (
    <div style={{ flex:1, overflowY:"auto", background:C.bg }}>
      <MobileHeader C={C} title="Publicar Trabajo"/>
      <div style={{ padding:"20px 16px", maxWidth:580, margin:"0 auto", animation:"fadeSlideUp .3s ease" }}>
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
            {T.es.cats.map(c=>(
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

        {/* ── CONTACT INFO ── */}
        <div style={{ background:C.faint, border:`1.5px solid ${contactOk?C.accent:C.border}`, borderRadius:13, padding:"16px 18px", marginBottom:18, transition:"border .2s" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ fontSize:12, fontWeight:800, color:C.text, fontFamily:"'Nunito',sans-serif" }}>📞 Tu información de contacto</div>
            {contactOk
              ? <span style={{ fontSize:11, color:C.accent, fontWeight:700, fontFamily:"Nunito Sans,sans-serif" }}>✓ Completo</span>
              : <span style={{ fontSize:11, color:C.red, fontWeight:700, fontFamily:"Nunito Sans,sans-serif" }}>* Requerido</span>}
          </div>
          <p style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif", margin:"0 0 12px", lineHeight:1.5 }}>
            Los proveedores usarán esta información para contactarte. No se comparte públicamente.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <Input label="Nombre completo *" value={contact.name} onChange={e=>updC("name",e.target.value)} icon="👤" placeholder="Tu nombre" C={C}/>
            <Input label="Teléfono / WhatsApp *" value={contact.phone} onChange={e=>updC("phone",e.target.value)} icon="📱" placeholder="809-000-0000" C={C}/>
          </div>
          <Input label="Correo electrónico *" value={contact.email} onChange={e=>updC("email",e.target.value)} icon="✉️" placeholder="tu@email.com" type="email" C={C}/>
          {!contactOk && (contact.name||contact.phone||contact.email) && (
            <div style={{ fontSize:11, color:C.red, fontFamily:"Nunito Sans,sans-serif", marginTop:6 }}>
              {!contact.name.trim() ? "⚠️ Falta el nombre." : !contact.phone.trim() ? "⚠️ Falta el teléfono." : "⚠️ Correo inválido."}
            </div>
          )}
        </div>

        {submitError && (
          <div style={{ background:`${C.red}15`, border:`1px solid ${C.red}30`, borderRadius:10, padding:"10px 14px", fontSize:12, color:C.red, marginBottom:12, fontFamily:"Nunito Sans,sans-serif" }}>{submitError}</div>
        )}

        {/* T&C checkbox */}
        <div style={{ display:"flex", alignItems:"flex-start", gap:9, marginBottom:14, background:C.faint, borderRadius:11, padding:"12px 14px" }}>
          <input type="checkbox" checked={acceptedTerms} onChange={e=>setAcceptedTerms(e.target.checked)}
            style={{ accentColor:C.accent, width:16, height:16, marginTop:2, flexShrink:0, cursor:"pointer" }}/>
          <div style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif", lineHeight:1.6 }}>
            Acepto los{" "}
            <span onClick={()=>setShowTerms(true)} style={{ color:C.accent, cursor:"pointer", fontWeight:700, textDecoration:"underline" }}>
              Términos y Condiciones
            </span>
            . Entiendo que El Socio RD es un intermediario y no es responsable por el resultado del servicio.
          </div>
        </div>

        <Btn onClick={handleSubmit} full disabled={!valid||submitting||!acceptedTerms} size="lg" C={C}>
          {submitting ? <><span style={{ display:"inline-block", width:16, height:16, border:"2px solid #ffffff44", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .6s linear infinite" }}/> Publicando...</> : p.submit}
        </Btn>
        {showTerms && <TermsModal C={C} onClose={()=>setShowTerms(false)}/>}
      </div>
    </div>
  );
}

// ── CLIENT DASHBOARD ──────────────────────────────────────────────
function ClientDashboard({ C, t, session, profile }) {
  const c = t.cd;
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [showProfileDetail, setShowProfileDetail] = useState(false);
  const [ratingJob, setRatingJob] = useState(null);
  const [ratedJobs, setRatedJobs] = useState(new Set());

  const loadJobs = () => {
    if (!session) return;
    getClientJobs(session.user.id).then(({ data }) => {
      setJobs(data || []);
      setLoadingJobs(false);
    });
  };

  useEffect(() => { loadJobs(); }, [session]);

  const handleRatingSubmit = async ({ jobId, providerId, stars, comment }) => {
    // Insert review
    await supabase.from("reviews").insert([{
      job_id:      jobId,
      provider_id: providerId,
      client_id:   session.user.id,
      rating:      stars,
      comment:     comment || null,
      created_at:  new Date().toISOString(),
    }]);
    // Update provider avg rating
    const { data: reviews } = await supabase.from("reviews").select("rating").eq("provider_id", providerId);
    if (reviews && reviews.length > 0) {
      const avg = reviews.reduce((a,r)=>a+r.rating,0) / reviews.length;
      await supabase.from("providers").update({ rating: Math.round(avg*10)/10, review_count: reviews.length }).eq("id", providerId);
    }
    setRatedJobs(prev => new Set([...prev, jobId]));
  };

  const v1 = useCountUp(jobs.length);
  const v2 = useCountUp(jobs.reduce((a,j)=>a+(j.response_count||0),0));
  const v3 = useCountUp(jobs.filter(j=>j.status==="filled").length);
  const avatarInit = (profile?.name||"U").split(" ").filter(Boolean).map(w=>w[0]).join("").slice(0,2).toUpperCase();

  if (!session) return (
    <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", background:C.bg }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:40, marginBottom:12 }}>🔒</div>
        <div style={{ fontWeight:700, color:C.text, fontFamily:"'Nunito',sans-serif", fontSize:18, marginBottom:6 }}>Acceso restringido</div>
        <div style={{ color:C.muted, fontSize:13, fontFamily:"Nunito Sans,sans-serif" }}>Debes iniciar sesión para ver tu panel.</div>
      </div>
    </div>
  );

  const ProfileField = ({ icon, label, value }) => (
    <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
      <div style={{ fontSize:10, fontWeight:700, color:C.muted, letterSpacing:"0.06em", textTransform:"uppercase", fontFamily:"Nunito Sans,sans-serif" }}>{icon} {label}</div>
      <div style={{ fontSize:13, color:value ? C.text : C.border, fontFamily:"Nunito Sans,sans-serif", fontWeight:value ? 600 : 400, fontStyle:value ? "normal" : "italic" }}>{value || "No registrado"}</div>
    </div>
  );

  return (
    <div style={{ flex:1, overflowY:"auto", background:C.bg, animation:"fadeSlideUp .3s ease" }}>
      <MobileHeader C={C} title="Mi Panel"/>
      <div style={{ padding:"18px 16px" }}>

      {/* ── PROFILE CARD ── */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:22, marginBottom:20 }}>
        {/* Top row */}
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
          <Av init={avatarInit} size={54} color={C.accent}/>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:18, fontWeight:900, color:C.text, fontFamily:"'Nunito',sans-serif", marginBottom:2 }}>{profile?.name || "—"}</div>
            <div style={{ fontSize:12, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>📍 {profile?.sector||"—"}{profile?.city ? `, ${profile.city}` : ""}</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:C.faint, border:`1px solid ${C.border}`, borderRadius:8, padding:"5px 11px" }}>
              <span style={{ fontSize:10, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>N° Cuenta</span>
              <span style={{ fontSize:12, fontWeight:900, color:C.accent, fontFamily:"Nunito Sans,sans-serif", letterSpacing:"0.06em" }}>{profile?.account_no || "—"}</span>
            </div>
            <Tag color={C.accent} C={C}>👤 Cliente</Tag>
          </div>
        </div>

        {/* Info grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, padding:"16px 0", borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}`, marginBottom:14 }}>
          <ProfileField icon="✉️" label="Correo" value={profile?.email || session?.user?.email}/>
          <ProfileField icon="📱" label="Teléfono" value={profile?.phone}/>
          <ProfileField icon="💬" label="WhatsApp" value={profile?.whatsapp || profile?.phone}/>
          <ProfileField icon="📍" label="Sector" value={profile?.sector}/>
          <ProfileField icon="🏙️" label="Ciudad" value={profile?.city}/>
          <ProfileField icon="📣" label="Nos encontró por" value={profile?.how_heard}/>
        </div>

        {/* Read-only notice */}
        <div style={{ display:"flex", alignItems:"center", gap:10, background:`${C.gold}10`, border:`1px solid ${C.gold}30`, borderRadius:10, padding:"10px 14px" }}>
          <span style={{ fontSize:16, flexShrink:0 }}>🔒</span>
          <div style={{ fontSize:12, color:C.muted, fontFamily:"Nunito Sans,sans-serif", lineHeight:1.5 }}>
            Para modificar tu información, contáctanos por WhatsApp al <strong style={{color:C.text}}>+1 (809) 444-4444</strong> o escríbenos a <strong style={{color:C.accent}}>soporte@elsociord.com</strong>. Verificaremos tu identidad antes de realizar cualquier cambio.
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <h2 style={{ fontSize:20, fontWeight:800, color:C.text, margin:"0 0 14px", fontFamily:"'Nunito',sans-serif" }}>{c.title}</h2>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:13, marginBottom:22 }}>
        {[{l:c.posted,v:v1,ic:"📋",col:C.accent},{l:c.responses,v:v2,ic:"📬",col:C.blue},{l:c.completed,v:v3,ic:"✅",col:C.gold}].map((s,i)=>(
          <div key={s.l} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"17px 20px", transition:"transform .18s, box-shadow .18s", animation:`fadeSlideUp .3s ease ${i*0.08}s both` }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=C.shadow;}}
            onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
            <div style={{ fontSize:22, marginBottom:8 }}>{s.ic}</div>
            <div style={{ fontSize:26, fontWeight:900, color:s.col, fontFamily:"'Nunito',sans-serif" }}>{s.v}</div>
            <div style={{ fontSize:12, color:C.muted, marginTop:3, fontFamily:"Nunito Sans,sans-serif" }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* ── JOB HISTORY ── */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden" }}>
        <div style={{ padding:"14px 20px", borderBottom:`1px solid ${C.border}`, fontWeight:800, color:C.text, fontFamily:"'Nunito',sans-serif", fontSize:15 }}>{c.history}</div>
        {loadingJobs ? (
          <div style={{ padding:28, textAlign:"center", color:C.muted, fontSize:13, fontFamily:"Nunito Sans,sans-serif" }}>Cargando trabajos...</div>
        ) : jobs.length === 0 ? (
          <div style={{ padding:36, textAlign:"center" }}>
            <div style={{ fontSize:36, marginBottom:10 }}>📋</div>
            <div style={{ fontWeight:700, color:C.text, fontFamily:"Nunito Sans,sans-serif", fontSize:14, marginBottom:4 }}>No has publicado trabajos todavía</div>
            <div style={{ color:C.muted, fontSize:12, fontFamily:"Nunito Sans,sans-serif" }}>Publica tu primer trabajo para recibir propuestas de proveedores verificados.</div>
          </div>
        ) : jobs.map((j,i)=>(
          <div key={j.id} style={{ padding:"13px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", transition:"background .15s", animation:`fadeSlideUp .3s ease ${i*0.05}s both` }}
            onMouseEnter={e=>e.currentTarget.style.background=C.faint} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div style={{ display:"flex", gap:11, alignItems:"center" }}>
              <div style={{ width:38, height:38, borderRadius:10, background:C.faint, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{CAT_ICONS[j.category]||"🛠️"}</div>
              <div>
                <div style={{ fontWeight:700, fontSize:13, color:C.text, fontFamily:"Nunito Sans,sans-serif" }}>{j.description}</div>
                <div style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{j.category} · {j.sector} · {new Date(j.created_at).toLocaleDateString("es-DO")}</div>
              </div>
            </div>
            <div style={{ textAlign:"right", flexShrink:0, display:"flex", flexDirection:"column", alignItems:"flex-end", gap:5 }}>
              <div style={{ fontSize:14, fontWeight:700, color:C.accent, fontFamily:"Nunito Sans,sans-serif" }}>{j.response_count||0} {c.resp}</div>
              <Tag color={j.status==="filled"?C.accent:j.status==="open"?C.blue:C.muted} C={C}>{c.status?.[j.status]||j.status}</Tag>
              {j.status==="filled" && !ratedJobs.has(j.id) && !j.rated && (
                <button onClick={()=>setRatingJob(j)}
                  style={{ marginTop:2, padding:"4px 10px", borderRadius:8, background:`${C.gold}18`, border:`1.5px solid ${C.gold}50`, color:C.gold, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"Nunito Sans,sans-serif", transition:"all .15s" }}
                  onMouseEnter={e=>e.currentTarget.style.background=`${C.gold}30`}
                  onMouseLeave={e=>e.currentTarget.style.background=`${C.gold}18`}>
                  ⭐ Calificar
                </button>
              )}
              {(ratedJobs.has(j.id) || j.rated) && (
                <span style={{ fontSize:10, color:C.accent, fontFamily:"Nunito Sans,sans-serif", fontWeight:600 }}>✓ Calificado</span>
              )}
            </div>
          </div>
        ))}
      </div>
      </div>

      {/* Rating Modal */}
      {ratingJob && (
        <RatingModal C={C} job={ratingJob} onClose={()=>setRatingJob(null)} onSubmit={handleRatingSubmit}/>
      )}
    </div>
  );
}

// ── PROVIDER LEADS LIST — real jobs from DB ───────────────────────
function ProviderLeadsList({ C, t, category, session, providerId }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);
  const [accepted, setAccepted] = useState(new Set());

  const loadLeads = () => {
    if (!category) { setLoading(false); return; }
    supabase
      .from("jobs")
      .select("*, profiles(name)")
      .eq("category", category)
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => { setLeads(data || []); setLoading(false); });
  };

  useEffect(() => { loadLeads(); }, [category]);

  const handleAccept = async (job) => {
    if (!session) return;
    setAccepting(job.id);
    // Mark job as filled and record which provider accepted it
    const { error } = await supabase.from("jobs").update({
      status: "filled",
      provider_id: session.user.id,
      accepted_at: new Date().toISOString(),
    }).eq("id", job.id);
    if (!error) {
      // Increment provider's job count and lead count
      await supabase.from("providers").update({
        job_count: supabase.rpc ? undefined : undefined,
      }).eq("id", session.user.id);
      await supabase.rpc("increment_provider_stats", { pid: session.user.id }).catch(()=>{});
      setAccepted(prev => new Set([...prev, job.id]));
      setLeads(prev => prev.filter(l => l.id !== job.id));
    }
    setAccepting(null);
  };

  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden", marginBottom:16 }}>
      <div style={{ padding:"13px 20px", borderBottom:`1px solid ${C.border}`, fontWeight:800, color:C.text, fontFamily:"'Nunito',sans-serif", fontSize:14, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span>📬 Leads disponibles</span>
        {leads.length > 0 && <Tag color={C.accent} C={C}>{leads.length} nuevo{leads.length!==1?"s":""}</Tag>}
      </div>
      {loading ? (
        <div style={{ padding:24, textAlign:"center", color:C.muted, fontSize:12, fontFamily:"Nunito Sans,sans-serif" }}>Cargando leads...</div>
      ) : !category ? (
        <div style={{ padding:24, textAlign:"center" }}>
          <div style={{ fontSize:28, marginBottom:8 }}>🛠️</div>
          <div style={{ color:C.muted, fontSize:12, fontFamily:"Nunito Sans,sans-serif" }}>Completa tu categoría de servicio para ver leads relevantes.</div>
        </div>
      ) : leads.length === 0 ? (
        <div style={{ padding:28, textAlign:"center" }}>
          <div style={{ fontSize:32, marginBottom:8 }}>📬</div>
          <div style={{ fontWeight:700, color:C.text, fontFamily:"Nunito Sans,sans-serif", fontSize:13, marginBottom:4 }}>No hay leads por ahora</div>
          <div style={{ color:C.muted, fontSize:12, fontFamily:"Nunito Sans,sans-serif" }}>Los clientes que busquen <strong>{category}</strong> aparecerán aquí automáticamente.</div>
        </div>
      ) : leads.map((j, i) => (
        <div key={j.id} style={{ padding:"14px 20px", borderBottom:`1px solid ${C.border}`, transition:"background .15s", animation:`fadeSlideUp .25s ease ${i*0.05}s both` }}
          onMouseEnter={e=>e.currentTarget.style.background=C.faint} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
            <div style={{ fontSize:22, flexShrink:0, marginTop:1 }}>{CAT_ICONS[j.category]||"🛠️"}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:13, color:C.text, fontFamily:"Nunito Sans,sans-serif", marginBottom:3 }}>{j.description}</div>
              <div style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif", marginBottom:6 }}>
                📍 {j.sector}{j.city?`, ${j.city}`:""} · {j.urgency==="urgent"?"🔴 Urgente":j.urgency==="soon"?"🟡 Pronto":"🟢 Flexible"} · {new Date(j.created_at).toLocaleDateString("es-DO")}
              </div>
              {j.budget && <div style={{ fontSize:11, color:C.gold, fontFamily:"Nunito Sans,sans-serif", fontWeight:700, marginBottom:8 }}>💰 Presupuesto: RD${j.budget}</div>}
              {/* Contact info */}
              <div style={{ background:C.faint, border:`1px solid ${C.border}`, borderRadius:9, padding:"9px 12px", display:"flex", gap:14, flexWrap:"wrap", marginBottom:10 }}>
                {j.client_name && <div style={{ fontSize:11, fontFamily:"Nunito Sans,sans-serif" }}><span style={{color:C.muted}}>👤 </span><strong style={{color:C.text}}>{j.client_name}</strong></div>}
                {j.client_phone && (
                  <a href={`https://wa.me/1${j.client_phone.replace(/\D/g,"")}`} target="_blank" rel="noreferrer"
                    style={{ fontSize:11, color:"#25D366", fontWeight:700, fontFamily:"Nunito Sans,sans-serif", textDecoration:"none", display:"flex", alignItems:"center", gap:3 }}>
                    💬 {j.client_phone}
                  </a>
                )}
                {j.client_email && (
                  <a href={`mailto:${j.client_email}`}
                    style={{ fontSize:11, color:C.blue, fontFamily:"Nunito Sans,sans-serif", textDecoration:"none" }}>
                    ✉️ {j.client_email}
                  </a>
                )}
              </div>
              {/* Accept button */}
              {accepted.has(j.id) ? (
                <div style={{ fontSize:12, color:C.accent, fontWeight:700, fontFamily:"Nunito Sans,sans-serif" }}>✅ Trabajo aceptado — contacta al cliente</div>
              ) : (
                <button
                  onClick={()=>handleAccept(j)}
                  disabled={accepting===j.id}
                  style={{ padding:"8px 18px", borderRadius:9, background:C.accent, color:"#fff", fontSize:12, fontWeight:700, border:"none", cursor:"pointer", fontFamily:"Nunito Sans,sans-serif", transition:"opacity .15s", opacity:accepting===j.id?.6:1 }}>
                  {accepting===j.id ? "Aceptando..." : "✓ Aceptar trabajo"}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
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
  const waEmail = "whatsapp://send?phone=18094444444";
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
            <a href={`https://wa.me/18094444444?text=${contactMsg}`} target="_blank" rel="noreferrer"
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
function ProviderDashboard({ C, t, session, profile }) {
  const p = t.pd;
  const [provData, setProvData] = useState(null);
  const [loadingProv, setLoadingProv] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarFileRef = useRef(null);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !session) return;
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `avatars/${session.user.id}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      await supabase.from("providers").update({ avatar_url: publicUrl }).eq("id", session.user.id);
      setAvatarUrl(publicUrl);
    }
    setUploadingAvatar(false);
  };

  useEffect(() => {
    if (!session) return;
    getProviderProfile(session.user.id).then(({ data }) => {
      setProvData(data);
      if (data?.avatar_url) setAvatarUrl(data.avatar_url);
      setLoadingProv(false);
    });
  }, [session]);

  const avatarInit = (profile?.name||"U").split(" ").filter(Boolean).map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const v1 = useCountUp(provData?.lead_count||0);
  const v2 = useCountUp(provData?.job_count||0);
  const vR = useCountUp(Math.round((provData?.rating||0)*10));

  if (!session) return (
    <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", background:C.bg }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:40, marginBottom:12 }}>🔒</div>
        <div style={{ fontWeight:700, color:C.text, fontFamily:"'Nunito',sans-serif", fontSize:18, marginBottom:6 }}>Acceso restringido</div>
        <div style={{ color:C.muted, fontSize:13, fontFamily:"Nunito Sans,sans-serif" }}>Debes iniciar sesión para ver tu panel.</div>
      </div>
    </div>
  );

  const InfoRow = ({ icon, label, value }) => (
    <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
      <div style={{ fontSize:10, fontWeight:700, color:C.muted, letterSpacing:"0.06em", textTransform:"uppercase", fontFamily:"Nunito Sans,sans-serif" }}>{icon} {label}</div>
      <div style={{ fontSize:13, color:value ? C.text : C.border, fontFamily:"Nunito Sans,sans-serif", fontWeight:value ? 600 : 400, fontStyle:value ? "normal" : "italic" }}>{value || "No registrado"}</div>
    </div>
  );

  return (
    <div style={{ flex:1, overflowY:"auto", background:C.bg, animation:"fadeSlideUp .3s ease" }}>
      <MobileHeader C={C} title="Mi Panel"/>
      <div style={{ padding:"18px 16px" }}>

      {/* ── PROFILE CARD ── */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:22, marginBottom:18 }}>
        {/* Header row */}
        <div style={{ display:"flex", gap:16, alignItems:"flex-start", marginBottom:16 }}>
          {/* Avatar with upload */}
          <div style={{ position:"relative", flexShrink:0 }}>
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" style={{ width:64, height:64, borderRadius:"50%", objectFit:"cover", border:`2px solid ${C.accent}` }}/>
              : <Av init={avatarInit} size={64} color={C.accent}/>
            }
            <button onClick={()=>avatarFileRef.current?.click()}
              title="Cambiar foto"
              style={{ position:"absolute", bottom:0, right:0, width:22, height:22, borderRadius:"50%", background:C.accent, border:`2px solid ${C.card}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11 }}>
              {uploadingAvatar ? <span style={{ width:10, height:10, border:"2px solid #fff4", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin .6s linear infinite" }}/> : "📷"}
            </button>
            <input ref={avatarFileRef} type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display:"none" }}/>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
              <span style={{ fontSize:18, fontWeight:900, color:C.text, fontFamily:"'Nunito',sans-serif" }}>{profile?.name || "—"}</span>
              {provData?.verified && <VerBadge tip={t.br.verTip} C={C}/>}
              {provData?.featured && <Tag color={C.gold} C={C}>⭐ Destacado</Tag>}
            </div>
            <div style={{ fontSize:12, color:C.muted, fontFamily:"Nunito Sans,sans-serif", marginBottom:4 }}>
              {CAT_ICONS[provData?.category]} {provData?.category||"Sin categoría"} · 📍 {profile?.sector||"—"}{profile?.city?`, ${profile.city}`:""}
            </div>
            {provData?.rating > 0 && (
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <Stars n={provData.rating} size={12}/>
                <span style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{provData.rating} ({provData.review_count} reseñas)</span>
              </div>
            )}
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:7, flexShrink:0 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:C.faint, border:`1px solid ${C.border}`, borderRadius:8, padding:"5px 11px" }}>
              <span style={{ fontSize:10, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>N° Cuenta</span>
              <span style={{ fontSize:12, fontWeight:900, color:C.accent, fontFamily:"'Nunito',sans-serif", letterSpacing:"0.06em" }}>{profile?.account_no || "—"}</span>
            </div>
            <Tag color={C.accent} C={C}>🛠️ Proveedor</Tag>
            <Btn size="sm" outline C={C} onClick={()=>setShowProfile(true)}>Ver mi perfil completo</Btn>
          </div>
        </div>

        {/* Bio */}
        {provData?.bio && (
          <div style={{ background:C.faint, borderRadius:10, padding:"12px 14px", marginBottom:14, fontSize:13, color:C.muted, fontFamily:"Nunito Sans,sans-serif", lineHeight:1.6, fontStyle:"italic" }}>
            "{provData.bio}"
          </div>
        )}

        {/* Contact fields */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, padding:"14px 0", borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}`, marginBottom:14 }}>
          <InfoRow icon="✉️" label="Correo" value={profile?.email || session?.user?.email}/>
          <InfoRow icon="📱" label="Teléfono" value={profile?.phone}/>
          <InfoRow icon="💬" label="WhatsApp" value={profile?.whatsapp || profile?.phone}/>
          <InfoRow icon="📅" label="Experiencia" value={provData?.experience}/>
          <InfoRow icon="📍" label="Sector" value={profile?.sector}/>
          <InfoRow icon="🏙️" label="Ciudad" value={profile?.city}/>
        </div>

        {/* Read-only notice */}
        <div style={{ display:"flex", alignItems:"center", gap:10, background:`${C.gold}10`, border:`1px solid ${C.gold}30`, borderRadius:10, padding:"10px 14px" }}>
          <span style={{ fontSize:16, flexShrink:0 }}>🔒</span>
          <div style={{ fontSize:12, color:C.muted, fontFamily:"Nunito Sans,sans-serif", lineHeight:1.5 }}>
            Para modificar tu información, contáctanos por WhatsApp al <strong style={{color:C.text}}>+1 (809) 444-4444</strong> o escríbenos a <strong style={{color:C.accent}}>soporte@elsociord.com</strong>. Verificaremos tu identidad antes de realizar cualquier cambio.
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:18 }}>
        {[{l:p.leads,v:v1,ic:"📬",c:C.accent},{l:p.jobs,v:v2,ic:"✅",c:C.green},{l:p.rating,v:`${(vR/10).toFixed(1)}★`,ic:"⭐",c:C.gold}].map((s,i)=>(
          <div key={s.l} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:13, padding:"15px 16px", transition:"transform .18s", animation:`fadeSlideUp .3s ease ${i*.07}s both` }}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
            onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            <div style={{ fontSize:20, marginBottom:5 }}>{s.ic}</div>
            <div style={{ fontSize:22, fontWeight:900, color:s.c, fontFamily:"'Nunito',sans-serif" }}>{s.v}</div>
            <div style={{ fontSize:10, color:C.muted, marginTop:2, fontFamily:"Nunito Sans,sans-serif" }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* ── FEATURED CTA ── */}
      <FeaturedPlansCard C={C} t={t} isFeatured={provData?.featured}/>

      {/* ── PORTFOLIO PLACEHOLDER ── */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:18, marginBottom:16 }}>
        <div style={{ fontWeight:800, color:C.text, marginBottom:4, fontFamily:"'Nunito',sans-serif", fontSize:14 }}>📸 Foto de perfil</div>
        <div style={{ fontSize:12, color:C.muted, fontFamily:"Nunito Sans,sans-serif", marginBottom:14 }}>Tu foto aparece en tu tarjeta en la página de Explorar</div>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          {/* Current photo */}
          <div style={{ position:"relative", flexShrink:0 }}>
            {avatarUrl
              ? <img src={avatarUrl} alt="foto" style={{ width:72, height:72, borderRadius:"50%", objectFit:"cover", border:`3px solid ${C.accent}` }}/>
              : <div style={{ width:72, height:72, borderRadius:"50%", background:C.faint, border:`2px dashed ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>👤</div>
            }
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, color:C.text, fontFamily:"Nunito Sans,sans-serif", marginBottom:8, fontWeight:600 }}>
              {avatarUrl ? "✅ Foto cargada" : "Sin foto aún"}
            </div>
            <div style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif", marginBottom:10 }}>
              Formatos: JPG, PNG, WebP · Máx 5MB · Recomendado: foto clara de tu cara
            </div>
            <button onClick={()=>avatarFileRef.current?.click()}
              disabled={uploadingAvatar}
              style={{ padding:"8px 18px", borderRadius:9, background:C.accent, color:"#fff", fontSize:12, fontWeight:700, border:"none", cursor:"pointer", fontFamily:"Nunito Sans,sans-serif", opacity:uploadingAvatar?.6:1, transition:"opacity .15s" }}>
              {uploadingAvatar
                ? <><span style={{ display:"inline-block", width:12, height:12, border:"2px solid #fff4", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .6s linear infinite", marginRight:6 }}/>Subiendo...</>
                : avatarUrl ? "📷 Cambiar foto" : "📷 Subir foto"}
            </button>
            <input ref={avatarFileRef} type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display:"none" }}/>
          </div>
        </div>
      </div>

      {/* ── LEADS ── */}
      <ProviderLeadsList C={C} t={t} category={provData?.category} session={session} providerId={session?.user?.id}/>

      {/* ── FULL PROFILE MODAL ── */}
      {showProfile && (
        <Modal onClose={()=>setShowProfile(false)} C={C} width={500}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
            <Av init={avatarInit} size={52} color={C.accent}/>
            <div>
              <div style={{ fontSize:17, fontWeight:900, color:C.text, fontFamily:"'Nunito',sans-serif", marginBottom:3 }}>{profile?.name}</div>
              <div style={{ fontSize:11, color:C.accent, fontFamily:"Nunito Sans,sans-serif", fontWeight:700 }}>{profile?.account_no}</div>
              <div style={{ display:"flex", gap:6, marginTop:5, flexWrap:"wrap" }}>
                {provData?.verified && <Tag color={C.accent} C={C}>✓ Verificado</Tag>}
                {provData?.featured && <Tag color={C.gold} C={C}>⭐ Destacado</Tag>}
                <Tag color={C.blue} C={C}>🛠️ Proveedor</Tag>
              </div>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
            <InfoRow icon="✉️" label="Correo" value={profile?.email || session?.user?.email}/>
            <InfoRow icon="📱" label="Teléfono" value={profile?.phone}/>
            <InfoRow icon="💬" label="WhatsApp" value={profile?.whatsapp || profile?.phone}/>
            <InfoRow icon="📍" label="Sector" value={profile?.sector}/>
            <InfoRow icon="🏙️" label="Ciudad" value={profile?.city}/>
            <InfoRow icon="📅" label="Experiencia" value={provData?.experience}/>
            <InfoRow icon="🛠️" label="Categoría" value={provData?.category}/>
            <InfoRow icon="📣" label="Nos encontró por" value={profile?.how_heard}/>
          </div>

          {provData?.bio && (
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:10, fontWeight:700, color:C.muted, letterSpacing:"0.06em", textTransform:"uppercase", fontFamily:"Nunito Sans,sans-serif", marginBottom:6 }}>📝 Bio</div>
              <div style={{ fontSize:13, color:C.muted, fontFamily:"Nunito Sans,sans-serif", lineHeight:1.6, fontStyle:"italic" }}>"{provData.bio}"</div>
            </div>
          )}

          <div style={{ background:`${C.gold}10`, border:`1px solid ${C.gold}30`, borderRadius:10, padding:"11px 14px", fontSize:12, color:C.muted, fontFamily:"Nunito Sans,sans-serif", lineHeight:1.5 }}>
            🔒 Para modificar tu información contáctanos: <strong style={{color:C.accent}}>soporte@elsociord.com</strong> · <strong style={{color:C.text}}>+1 (809) 444-4444</strong>
          </div>
        </Modal>
      )}
      </div>
    </div>
  );
}

// ── ADMIN DASHBOARD ───────────────────────────────────────────────
function AdminDashboard({ C, t, session, profile }) {
  const { toasts, push } = useToast();

  // Tabs
  const [tab, setTab] = useState("overview");

  // Data
  const [users,   setUsers]   = useState([]);
  const [jobs,    setJobs]    = useState([]);
  const [pending, setPending] = useState([]);
  const [actLog,  setActLog]  = useState([]);
  const [ads,     setAds]     = useState([]);
  const [traffic, setTraffic] = useState({ total:0, today:0, week:0, byDay:[] });
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  // Ads state
  const [adForm,      setAdForm]      = useState({ title:"", link:"", position:"sidebar", active:true });
  const [adFile,      setAdFile]      = useState(null);
  const [adPreview,   setAdPreview]   = useState(null);
  const [adUploading, setAdUploading] = useState(false);
  const [adError,     setAdError]     = useState(null);
  const adFileRef = useRef(null);

  // AdSense state
  const [adsenseSlot1,    setAdsenseSlot1]    = useState("");
  const [adsenseSlot2,    setAdsenseSlot2]    = useState("");
  const [adsenseSaving,   setAdsenseSaving]   = useState(false);
  const [adsenseSaved,    setAdsenseSaved]    = useState(false);

  // Add Admin state — kept for future use
  // (current flow: user signs up → admin promotes via ✏️ Edit → role = Admin)

  // Modals
  const [editUser,    setEditUser]    = useState(null);  // edit account modal
  const [editJob,     setEditJob]     = useState(null);  // edit job modal
  const [deleteUser,  setDeleteUser]  = useState(null);  // confirm delete account
  const [deleteJob,   setDeleteJob]   = useState(null);  // confirm delete job
  const [banTarget,   setBanTarget]   = useState(null);  // confirm ban
  const [noteTarget,  setNoteTarget]  = useState(null);  // admin note on user
  const [resetTarget, setResetTarget] = useState(null);  // password reset confirm
  const [editForm,    setEditForm]    = useState({});
  const [editJobForm, setEditJobForm] = useState({});
  const [noteText,    setNoteText]    = useState("");

  // ── Helpers ──
  const avatarInit = n => (n||"?").split(" ").filter(Boolean).map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const logAction  = async (action, target) => {
    const entry = { admin_id: session.user.id, action, target_info: target, created_at: new Date().toISOString() };
    await supabase.from("admin_log").insert([entry]).then(()=>{}).catch(()=>{});
    setActLog(prev => [entry, ...prev].slice(0,100));
  };

  // ── Load all data ──
  const loadAll = async () => {
    setLoading(true);
    const [{ data: u }, { data: j }, { data: pend }, { data: log }, { data: pv }, { data: adData }, { data: settings }] = await Promise.all([
      supabase.from("profiles").select("*, providers(*)").order("created_at", { ascending: false }),
      supabase.from("jobs").select("*, profiles(name,email)").order("created_at", { ascending: false }),
      supabase.from("verifications").select("*, profiles(name,email,phone), providers(category)").eq("status","pending").order("submitted_at", { ascending: true }),
      supabase.from("admin_log").select("*").order("created_at", { ascending: false }).limit(60),
      supabase.from("page_views").select("created_at, session_id").order("created_at", { ascending: false }).limit(5000),
      supabase.from("announcements").select("*").order("created_at", { ascending: false }),
      supabase.from("site_settings").select("*"),
    ]);
    setUsers(u  || []);
    setJobs(j   || []);
    setPending(pend || []);
    setActLog(log   || []);
    setAds(adData || []);
    // Load AdSense codes
    if (settings) {
      const s1 = settings.find(s => s.key === "adsense_slot_1");
      const s2 = settings.find(s => s.key === "adsense_slot_2");
      if (s1) setAdsenseSlot1(s1.value || "");
      if (s2) setAdsenseSlot2(s2.value || "");
    }
    // Process traffic
    if (pv && pv.length > 0) {
      const now   = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const week  = new Date(now.getTime() - 7*24*60*60*1000).toISOString();
      // Unique sessions per day for last 7 days
      const dayMap = {};
      for (let i=6; i>=0; i--) {
        const d = new Date(now.getTime() - i*24*60*60*1000);
        const key = `${d.getMonth()+1}/${d.getDate()}`;
        dayMap[key] = new Set();
      }
      pv.forEach(r => {
        const d = new Date(r.created_at);
        const key = `${d.getMonth()+1}/${d.getDate()}`;
        if (dayMap[key]) dayMap[key].add(r.session_id);
      });
      setTraffic({
        total:  pv.length,
        today:  pv.filter(r => r.created_at >= today).length,
        week:   pv.filter(r => r.created_at >= week).length,
        unique7: new Set(pv.filter(r => r.created_at >= week).map(r=>r.session_id)).size,
        byDay:  Object.entries(dayMap).map(([day, sids]) => ({ day, visits: sids.size })),
      });
    }
    setLoading(false);
  };
  useEffect(() => {
    loadAll();
    // Auto-refresh every 30 seconds so new jobs/users appear without manual refresh
    const interval = setInterval(loadAll, 30000);
    return () => clearInterval(interval);
  }, []);

  // Derived lists
  const providers = users.filter(u => u.role === "provider");
  const clients   = users.filter(u => u.role === "client");
  const admins    = users.filter(u => u.role === "admin");

  // Animated counters
  const uTotal     = useCountUp(users.length);
  const uProviders = useCountUp(providers.length);
  const uClients   = useCountUp(clients.length);
  const uJobs      = useCountUp(jobs.length);
  const uPending   = useCountUp(pending.length);
  const uFeatured  = useCountUp(providers.filter(p=>p.providers?.featured).length);

  // ── ACTIONS ──────────────────────────────────────────────────────

  const doBan = async (user) => {
    const next = !user.banned;
    await supabase.from("profiles").update({ banned: next }).eq("id", user.id);
    await logAction(next ? "BAN" : "UNBAN", `${user.name} (${user.email})`);
    setBanTarget(null);
    push(next ? `🚫 ${user.name} baneado` : `✅ ${user.name} reactivado`, next ? "warn" : "success");
    loadAll();
  };

  const doDeleteUser = async (user) => {
    if (user.role === "provider") await supabase.from("providers").delete().eq("id", user.id);
    await supabase.from("jobs").delete().eq("client_id", user.id);
    await supabase.from("profiles").delete().eq("id", user.id);
    await logAction("DELETE_USER", `${user.name} (${user.email}) role=${user.role}`);
    setDeleteUser(null);
    push(`🗑️ ${user.name} eliminado`, "error");
    loadAll();
  };

  const doDeleteJob = async (job) => {
    await supabase.from("jobs").delete().eq("id", job.id);
    await logAction("DELETE_JOB", `"${job.description?.slice(0,40)}" by ${job.profiles?.name}`);
    setDeleteJob(null);
    push("🗑️ Trabajo eliminado", "error");
    loadAll();
  };

  const doFeature = async (providerId, name, curr) => {
    await supabase.from("providers").update({ featured: !curr }).eq("id", providerId);
    await logAction(curr ? "UNFEATURE" : "FEATURE", name);
    push(curr ? `⭐ ${name} ya no está destacado` : `⭐ ${name} destacado`);
    loadAll();
  };

  const doVerify = async (prov) => {
    await supabase.from("providers").update({ verified: true }).eq("id", prov.provider_id);
    await supabase.from("verifications").update({ status:"approved", reviewed_at: new Date().toISOString() }).eq("provider_id", prov.provider_id).eq("status","pending");
    await logAction("VERIFY", `${prov.profiles?.name} (${prov.providers?.category})`);
    push(`✅ ${prov.profiles?.name} verificado`);
    loadAll();
  };

  const doReject = async (prov) => {
    await supabase.from("verifications").update({ status:"rejected", reviewed_at: new Date().toISOString() }).eq("provider_id", prov.provider_id).eq("status","pending");
    await logAction("REJECT_VERIFY", prov.profiles?.name);
    push(`❌ Verificación de ${prov.profiles?.name} rechazada`, "error");
    loadAll();
  };

  const doSendPasswordReset = async (user) => {
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: "https://elsociord.com",
    });
    await logAction("PASSWORD_RESET", `${user.name} (${user.email})`);
    setResetTarget(null);
    if (error) push(`❌ Error: ${error.message}`, "error");
    else push(`📧 Email de restablecimiento enviado a ${user.email}`);
  };

  const doSaveNote = async () => {
    await supabase.from("profiles").update({ admin_note: noteText }).eq("id", noteTarget.id);
    await logAction("NOTE", `${noteTarget.name}: "${noteText.slice(0,40)}"`);
    setNoteTarget(null);
    setNoteText("");
    push("📝 Nota guardada");
    loadAll();
  };

  const doSaveUser = async () => {
    const profileFields = {
      name:     editForm.name,
      phone:    editForm.phone,
      whatsapp: editForm.whatsapp,
      sector:   editForm.sector,
      city:     editForm.city,
      role:     editForm.role,
      banned:   editForm.banned,
    };
    await supabase.from("profiles").update(profileFields).eq("id", editUser.id);
    if (editForm.role === "provider" || editUser.role === "provider") {
      const provFields = { category: editForm.category, experience: editForm.experience, bio: editForm.bio, verified: editForm.verified, featured: editForm.featured };
      const { data: exists } = await supabase.from("providers").select("id").eq("id", editUser.id).single();
      if (exists) await supabase.from("providers").update(provFields).eq("id", editUser.id);
      else        await supabase.from("providers").insert({ id: editUser.id, ...provFields });
    }
    await logAction("EDIT_USER", `${editForm.name} → role=${editForm.role}`);
    setEditUser(null);
    push("💾 Cambios guardados");
    loadAll();
  };

  const doSaveJob = async () => {
    await supabase.from("jobs").update({
      category:    editJobForm.category,
      description: editJobForm.description,
      sector:      editJobForm.sector,
      budget:      editJobForm.budget,
      status:      editJobForm.status,
    }).eq("id", editJob.id);
    await logAction("EDIT_JOB", `"${editJobForm.description?.slice(0,40)}"`);
    setEditJob(null);
    push("💾 Trabajo actualizado");
    loadAll();
  };

  // ── ADS ACTIONS ──────────────────────────────────────────────────

  const handleAdFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAdFile(file);
    const reader = new FileReader();
    reader.onload = ev => setAdPreview({ url: ev.target.result, type: file.type });
    reader.readAsDataURL(file);
    setAdError(null);
  };

  const doUploadAd = async () => {
    if (!adFile) { setAdError("Selecciona una imagen o video."); return; }
    if (!adForm.title.trim()) { setAdError("Escribe un título para el anuncio."); return; }
    setAdUploading(true); setAdError(null);
    try {
      const ext  = adFile.name.split(".").pop();
      const path = `ads/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("ads-media").upload(path, adFile, { upsert: false });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("ads-media").getPublicUrl(path);
      await supabase.from("announcements").insert([{
        title:     adForm.title.trim(),
        link:      adForm.link.trim() || null,
        media_url: publicUrl,
        media_type: adFile.type.startsWith("video") ? "video" : "image",
        position:  adForm.position,
        active:    adForm.active,
        storage_path: path,
      }]);
      await logAction("ADD_AD", adForm.title);
      push("📢 Anuncio publicado");
      setAdForm({ title:"", link:"", position:"sidebar", active:true });
      setAdFile(null); setAdPreview(null);
      if (adFileRef.current) adFileRef.current.value = "";
      loadAll();
    } catch(e) {
      setAdError(e.message || "Error al subir el archivo.");
    }
    setAdUploading(false);
  };

  const doToggleAd = async (ad) => {
    try {
      const { error } = await supabase.from("announcements").update({ active: !ad.active }).eq("id", ad.id);
      if (error) { console.error("Toggle error:", error); push(`❌ Error: ${error.message}`, "error"); return; }
      push(ad.active ? "⏸ Anuncio pausado" : "▶ Anuncio activado");
      loadAll();
    } catch(e) { console.error("Toggle catch:", e); push(`❌ ${e.message}`, "error"); }
  };

  const doDeleteAd = async (ad) => {
    if (!window.confirm(`¿Eliminar el anuncio "${ad.title}"? Esto no se puede deshacer.`)) return;
    try {
      const { error } = await supabase.from("announcements").delete().eq("id", ad.id);
      if (error) { console.error("Delete DB error:", error); push(`❌ Error: ${error.message}`, "error"); return; }
      push("🗑️ Anuncio eliminado", "error");
      // Storage cleanup — fire and forget
      if (ad.storage_path) {
        supabase.storage.from("ads-media").remove([ad.storage_path]).catch(e => console.warn("Storage cleanup failed:", e));
      }
      loadAll();
    } catch(e) { console.error("Delete catch:", e); push(`❌ ${e.message}`, "error"); }
  };

  const doSaveAdsense = async () => {
    setAdsenseSaving(true);
    const upsert = async (key, value) => {
      await supabase.from("site_settings").upsert({ key, value }, { onConflict: "key" });
    };
    await Promise.all([
      upsert("adsense_slot_1", adsenseSlot1),
      upsert("adsense_slot_2", adsenseSlot2),
    ]);
    await logAction("SAVE_ADSENSE", "AdSense slots updated");
    setAdsenseSaving(false);
    setAdsenseSaved(true);
    setTimeout(() => setAdsenseSaved(false), 3000);
    push("✅ Código AdSense guardado");
  };

  const doAddAdmin = async () => {
    const { name, email } = newAdminForm;
    if (!name.trim() || !email.includes("@")) {
      setAddAdminError("Nombre y correo válido son requeridos."); return;
    }
    setAddingAdmin(true); setAddAdminError(""); setAddAdminSuccess("");
    // Create auth user with a temporary password — they'll reset it via email
    const tempPass = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2).toUpperCase() + "!9";
    const { data: authData, error: authErr } = await supabase.auth.admin
      ? supabase.auth.admin.createUser({ email: email.trim(), password: tempPass, email_confirm: true })
      : { data: null, error: { message: "Función admin no disponible desde el cliente. Usa la invitación por email." } };

    if (authErr) {
      // Fallback: send a signup invitation via Supabase magic link approach
      // Since we can't create users from client, update an existing profile or guide admin
      setAddAdminError(`No se puede crear usuario desde aquí. Pide al nuevo admin que se registre primero, luego cambia su rol a Admin desde la pestaña Proveedores o Clientes usando el botón ✏️.`);
      setAddingAdmin(false); return;
    }

    // Set role to admin in profiles
    if (authData?.user) {
      await supabase.from("profiles").update({ role: "admin", name: name.trim() }).eq("id", authData.user.id);
      await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: "https://elsociord.com" });
      await logAction("ADD_ADMIN", `${name} (${email})`);
      setAddAdminSuccess(`✅ Admin creado. Se envió un email a ${email} para que establezca su contraseña.`);
      setNewAdminForm({ name:"", email:"" });
      push(`👑 ${name} agregado como admin`);
      loadAll();
    }
    setAddingAdmin(false);
  };
  const filteredProviders = providers.filter(p =>
    !search ||
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.providers?.category?.toLowerCase().includes(search.toLowerCase()) ||
    p.account_no?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredClients = clients.filter(c =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.account_no?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredJobs = jobs.filter(j =>
    !search ||
    j.description?.toLowerCase().includes(search.toLowerCase()) ||
    j.category?.toLowerCase().includes(search.toLowerCase()) ||
    j.sector?.toLowerCase().includes(search.toLowerCase()) ||
    j.profiles?.name?.toLowerCase().includes(search.toLowerCase())
  );

  // ── TAB CONFIG ──
  const TABS = [
    { id:"overview",       label:"📊 Resumen" },
    { id:"providers",      label:`🛠️ Proveedores (${providers.length})` },
    { id:"clients",        label:`👤 Clientes (${clients.length})` },
    { id:"jobs",           label:`📋 Trabajos (${jobs.length})` },
    { id:"connections",    label:`🤝 Conexiones (${jobs.filter(j=>j.status==="filled"&&j.provider_id).length})` },
    { id:"verifications",  label:`⏳ Verificaciones${pending.length>0?" ("+pending.length+")":""}` },
    { id:"ads",            label:`📢 Anuncios${ads.length>0?" ("+ads.length+")":""}` },
    { id:"demand",         label:"🗺️ Demanda" },
    { id:"actlog",         label:"🔐 Actividad" },
  ];

  // ── Shared table cell style ──
  const TH = h => (
    <th key={h} style={{ padding:"9px 14px", textAlign:"left", fontSize:10, color:C.muted, fontWeight:700, letterSpacing:"0.07em", fontFamily:"Nunito Sans,sans-serif", whiteSpace:"nowrap" }}>
      {h}
    </th>
  );
  const tableBox = { background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden", animation:"fadeSlideUp .25s ease" };
  const hoverRow = { transition:"background .12s", cursor:"default" };

  // ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ flex:1, overflowY:"auto", padding:"16px 14px", background:C.bg }}>
      <MobileHeader C={C} title="Admin"/>
      <ToastContainer toasts={toasts}/>

      {/* ── HEADER ── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:10 }}>
        <div>
          <h1 style={{ fontFamily:"'Nunito',sans-serif", fontSize:21, fontWeight:900, color:C.text, margin:"0 0 2px" }}>⬡ Control Total — Administración</h1>
          <p style={{ fontSize:11, color:C.muted, margin:0, fontFamily:"Nunito Sans,sans-serif" }}>El Socio RD · Admin: {profile?.name} · {profile?.account_no}</p>
        </div>
        <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
          <Tag color={C.red} C={C}>🔒 ADMIN</Tag>
          <Btn size="sm" outline C={C} onClick={loadAll}>↻ Actualizar</Btn>
          <Btn size="sm" outline C={C} onClick={()=>downloadCSV(users.map(u=>({ name:u.name, email:u.email, phone:u.phone, role:u.role, sector:u.sector, account_no:u.account_no, banned:u.banned, joined:u.created_at })), "usuarios_elsociord.csv")}>⬇ CSV</Btn>
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:16 }}>
        {TABS.map(tb => (
          <button key={tb.id} onClick={()=>setTab(tb.id)}
            style={{ padding:"7px 13px", borderRadius:9, fontSize:11, fontWeight:700, cursor:"pointer", border:`1.5px solid ${tab===tb.id?C.accent:C.border}`, background:tab===tb.id?`${C.accent}18`:C.surface, color:tab===tb.id?C.accent:C.muted, fontFamily:"Nunito Sans,sans-serif", transition:"all .15s", whiteSpace:"nowrap" }}>
            {tb.label}
          </button>
        ))}
      </div>

      {/* ── SEARCH (providers / clients / jobs) ── */}
      {["providers","clients","jobs"].includes(tab) && (
        <div style={{ marginBottom:14, position:"relative", maxWidth:380 }}>
          <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", fontSize:13 }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Buscar por nombre, email, N° cuenta, categoría..."
            style={{ width:"100%", padding:"9px 12px 9px 34px", borderRadius:10, background:C.card, border:`1.5px solid ${C.border}`, color:C.text, fontSize:12, outline:"none", fontFamily:"Nunito Sans,sans-serif" }}/>
          {search && (
            <button onClick={()=>setSearch("")} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:14 }}>✕</button>
          )}
        </div>
      )}

      {loading && (
        <div style={{ textAlign:"center", padding:48, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>
          <div style={{ display:"inline-block", width:24, height:24, border:`3px solid ${C.border}`, borderTopColor:C.accent, borderRadius:"50%", animation:"spin .7s linear infinite", marginBottom:12 }}/>
          <div>Cargando datos en tiempo real...</div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB: OVERVIEW
         ══════════════════════════════════════════════════════════════ */}
      {!loading && tab==="overview" && (
        <div style={{ animation:"fadeSlideUp .25s ease" }}>
          {/* Stat cards */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:11, marginBottom:18 }}>
            {[
              { l:"Total Usuarios",  v:uTotal,     ic:"👥", c:C.text },
              { l:"Proveedores",     v:uProviders, ic:"🛠️", c:C.accent },
              { l:"Clientes",        v:uClients,   ic:"👤", c:C.blue },
              { l:"Trabajos",        v:uJobs,      ic:"📋", c:C.gold },
              { l:"Verificaciones",  v:uPending,   ic:"⏳", c:C.orange },
              { l:"Destacados",      v:uFeatured,  ic:"⭐", c:C.green },
            ].map((s,i) => (
              <div key={s.l} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:13, padding:"15px 17px", animation:`fadeSlideUp .3s ease ${i*.06}s both` }}>
                <div style={{ fontSize:19, marginBottom:5 }}>{s.ic}</div>
                <div style={{ fontSize:25, fontWeight:900, color:s.c, fontFamily:"'Nunito',sans-serif" }}>{s.v}</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:2, fontFamily:"Nunito Sans,sans-serif" }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* ── TRAFFIC COUNTER ── */}
          <div style={{ background:C.card, border:`1.5px solid ${C.accent}30`, borderRadius:14, padding:18, marginBottom:14, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${C.accent},${C.blue},${C.gold})` }}/>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <div>
                <div style={{ fontWeight:900, color:C.text, fontFamily:"'Nunito',sans-serif", fontSize:14 }}>📈 Tráfico del Sitio</div>
                <div style={{ fontSize:10, color:C.muted, fontFamily:"Nunito Sans,sans-serif", marginTop:2 }}>Visitas registradas · Solo visible para admins</div>
              </div>
              <Tag color={C.accent} C={C}>🔒 Admin Only</Tag>
            </div>
            {/* Stats row */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:16 }}>
              {[
                { l:"Total visitas",    v:traffic.total,   ic:"🌐", c:C.text },
                { l:"Hoy",             v:traffic.today,   ic:"☀️", c:C.accent },
                { l:"Últimos 7 días",  v:traffic.week,    ic:"📅", c:C.blue },
                { l:"Sesiones únicas (7d)", v:traffic.unique7||0, ic:"👤", c:C.gold },
              ].map((s,i) => (
                <div key={s.l} style={{ background:C.faint, borderRadius:10, padding:"12px 14px", textAlign:"center" }}>
                  <div style={{ fontSize:18, marginBottom:4 }}>{s.ic}</div>
                  <div style={{ fontSize:20, fontWeight:900, color:s.c, fontFamily:"'Nunito',sans-serif" }}>{s.v}</div>
                  <div style={{ fontSize:10, color:C.muted, fontFamily:"Nunito Sans,sans-serif", marginTop:2 }}>{s.l}</div>
                </div>
              ))}
            </div>
            {/* 7-day bar chart */}
            {traffic.byDay && traffic.byDay.length > 0 && (
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:C.muted, letterSpacing:"0.06em", fontFamily:"Nunito Sans,sans-serif", marginBottom:8, textTransform:"uppercase" }}>Sesiones únicas — últimos 7 días</div>
                <div style={{ display:"flex", gap:6, alignItems:"flex-end", height:52 }}>
                  {traffic.byDay.map(({day, visits}, i) => {
                    const maxV = Math.max(...traffic.byDay.map(d=>d.visits), 1);
                    const pct  = Math.round((visits/maxV)*100);
                    const isToday = i === traffic.byDay.length-1;
                    return (
                      <div key={day} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                        <div style={{ fontSize:9, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{visits}</div>
                        <div style={{ width:"100%", background: isToday?C.accent:C.blue, borderRadius:"4px 4px 0 0", height:`${Math.max(pct,4)}%`, minHeight:3, transition:"height .4s ease", opacity:isToday?1:.65 }}/>
                        <div style={{ fontSize:9, color:isToday?C.accent:C.muted, fontFamily:"Nunito Sans,sans-serif", fontWeight:isToday?700:400 }}>{day}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {traffic.total === 0 && (
              <div style={{ textAlign:"center", padding:"12px 0", color:C.muted, fontSize:12, fontFamily:"Nunito Sans,sans-serif" }}>
                Sin datos de tráfico aún. Asegúrate de haber corrido <strong style={{color:C.accent}}>add_page_views.sql</strong> en Supabase.
              </div>
            )}
          </div>

          {/* Admins */}
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:13, padding:18, marginBottom:14 }}>
            <div style={{ fontWeight:800, color:C.text, marginBottom:12, fontFamily:"'Nunito',sans-serif", fontSize:14 }}>👑 Administradores ({admins.length})</div>
            {admins.length === 0 && <div style={{ color:C.muted, fontSize:12, fontFamily:"Nunito Sans,sans-serif" }}>Sin administradores.</div>}
            {admins.map(a => (
              <div key={a.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:`1px solid ${C.border}` }}>
                <Av init={avatarInit(a.name)} size={30} color={C.red}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.text, fontFamily:"Nunito Sans,sans-serif" }}>{a.name}</div>
                  <div style={{ fontSize:10, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{a.email} · {a.account_no}</div>
                </div>
                <Tag color={C.red} C={C}>Admin</Tag>
              </div>
            ))}
          </div>

          {/* Add Admin */}
          <div style={{ background:C.card, border:`1.5px solid ${C.red}25`, borderRadius:13, padding:18, marginBottom:14 }}>
            <div style={{ fontWeight:800, color:C.text, marginBottom:4, fontFamily:"'Nunito',sans-serif", fontSize:14 }}>➕ Agregar administrador</div>
            <div style={{ fontSize:12, color:C.muted, fontFamily:"Nunito Sans,sans-serif", marginBottom:14, lineHeight:1.6 }}>
              Para dar acceso de administrador a alguien, sigue estos pasos:
            </div>
            {[
              { n:1, text:"La persona se registra normalmente en ElSocioRD.com (como cliente o proveedor)." },
              { n:2, text:"Confirma su correo electrónico desde el enlace que recibe." },
              { n:3, text:"Tú buscas su cuenta en la pestaña Proveedores o Clientes." },
              { n:4, text:'Haces clic en ✏️ Editar → cambias el rol a "Admin" → Guardar.' },
              { n:5, text:"La próxima vez que inicie sesión, verá el panel de administración automáticamente." },
            ].map(({n, text}) => (
              <div key={n} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:10 }}>
                <div style={{ width:22, height:22, borderRadius:"50%", background:`${C.red}18`, border:`1.5px solid ${C.red}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:C.red, fontFamily:"Nunito Sans,sans-serif", flexShrink:0, marginTop:1 }}>{n}</div>
                <div style={{ fontSize:12, color:C.muted, fontFamily:"Nunito Sans,sans-serif", lineHeight:1.6 }}>{text}</div>
              </div>
            ))}
            <div style={{ background:`${C.accent}10`, border:`1px solid ${C.accent}30`, borderRadius:9, padding:"9px 13px", fontSize:11, color:C.accent, fontFamily:"Nunito Sans,sans-serif", marginTop:6 }}>
              💡 Usa el buscador en las pestañas Proveedores o Clientes para encontrarlos rápido por nombre o email.
            </div>
          </div>

          {/* Quick stats bar */}
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:13, padding:18 }}>
            <div style={{ fontWeight:800, color:C.text, marginBottom:12, fontFamily:"'Nunito',sans-serif", fontSize:14 }}>📥 Exportar datos</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <Btn outline C={C} size="sm" onClick={()=>downloadCSV(providers.map(p=>({ name:p.name, email:p.email, phone:p.phone, account_no:p.account_no, category:p.providers?.category, sector:p.sector, verified:p.providers?.verified, featured:p.providers?.featured, banned:p.banned, joined:p.created_at })),"proveedores.csv")}>⬇ Proveedores</Btn>
              <Btn outline C={C} size="sm" onClick={()=>downloadCSV(clients.map(c=>({ name:c.name, email:c.email, phone:c.phone, account_no:c.account_no, sector:c.sector, banned:c.banned, joined:c.created_at })),"clientes.csv")}>⬇ Clientes</Btn>
              <Btn outline C={C} size="sm" onClick={()=>downloadCSV(jobs.map(j=>({ id:j.id, category:j.category, description:j.description, sector:j.sector, budget:j.budget, status:j.status, date:j.created_at })),"trabajos.csv")}>⬇ Trabajos</Btn>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB: PROVIDERS
         ══════════════════════════════════════════════════════════════ */}
      {!loading && tab==="providers" && (
        <div style={tableBox}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", minWidth:820 }}>
              <thead><tr style={{ background:C.faint }}>
                {["Proveedor","Categoría","Sector","Estado","Nota","Acciones"].map(TH)}
              </tr></thead>
              <tbody>
                {filteredProviders.length === 0 && (
                  <tr><td colSpan={6} style={{ padding:28, textAlign:"center", color:C.muted, fontFamily:"Nunito Sans,sans-serif", fontSize:13 }}>Sin resultados</td></tr>
                )}
                {filteredProviders.map((p, i) => (
                  <tr key={p.id} style={{ ...hoverRow, borderTop:`1px solid ${C.border}`, opacity:p.banned?.45:1, animation:`fadeSlideUp .22s ease ${i*.03}s both` }}
                    onMouseEnter={e=>e.currentTarget.style.background=C.faint}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{ padding:"10px 14px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <Av init={avatarInit(p.name)} size={30} color={C.accent}/>
                        <div>
                          <div style={{ fontSize:12, color:C.text, fontWeight:700, fontFamily:"Nunito Sans,sans-serif" }}>{p.name}</div>
                          <div style={{ fontSize:10, color:C.accent, fontWeight:700, fontFamily:"Nunito Sans,sans-serif" }}>{p.account_no}</div>
                          <div style={{ fontSize:10, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{p.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:"10px 14px", fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{CAT_ICONS[p.providers?.category]||""} {p.providers?.category||"—"}</td>
                    <td style={{ padding:"10px 14px", fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{p.sector||"—"}</td>
                    <td style={{ padding:"10px 14px" }}>
                      <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                        {p.banned ? <Tag color={C.red} C={C}>🚫 Baneado</Tag>
                          : p.providers?.verified ? <Tag color={C.accent} C={C}>✓ Verificado</Tag>
                          : <Tag color={C.muted} C={C}>Sin verificar</Tag>}
                        {p.providers?.featured && <Tag color={C.gold} C={C}>⭐ Destacado</Tag>}
                      </div>
                    </td>
                    <td style={{ padding:"10px 14px", maxWidth:120 }}>
                      {p.admin_note
                        ? <span style={{ fontSize:10, color:C.gold, fontFamily:"Nunito Sans,sans-serif", fontStyle:"italic" }}>📝 {p.admin_note.slice(0,30)}{p.admin_note.length>30?"…":""}</span>
                        : <span style={{ fontSize:10, color:C.border, fontFamily:"Nunito Sans,sans-serif" }}>—</span>}
                    </td>
                    <td style={{ padding:"10px 14px" }}>
                      <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                        <Btn size="sm" outline C={C} onClick={()=>{ setEditUser(p); setEditForm({ name:p.name||"", email:p.email||"", phone:p.phone||"", whatsapp:p.whatsapp||"", sector:p.sector||"", city:p.city||"", role:p.role||"provider", category:p.providers?.category||"", experience:p.providers?.experience||"", bio:p.providers?.bio||"", verified:p.providers?.verified||false, featured:p.providers?.featured||false, banned:p.banned||false }); }}>✏️</Btn>
                        <Btn size="sm" color={C.gold} outline={p.providers?.featured} C={C} onClick={()=>doFeature(p.id, p.name, p.providers?.featured)}>{p.providers?.featured?"★":"☆"}</Btn>
                        <Btn size="sm" color={p.banned?C.accent:C.red} C={C} onClick={()=>setBanTarget(p)}>{p.banned?"✓":"🚫"}</Btn>
                        <Btn size="sm" color={C.orange} outline C={C} onClick={()=>{ setNoteTarget(p); setNoteText(p.admin_note||""); }}>📝</Btn>
                        <Btn size="sm" outline C={C} onClick={()=>setResetTarget(p)}>🔑</Btn>
                        <Btn size="sm" color={C.red} C={C} onClick={()=>setDeleteUser(p)}>🗑️</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB: CLIENTS
         ══════════════════════════════════════════════════════════════ */}
      {!loading && tab==="clients" && (
        <div style={tableBox}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", minWidth:700 }}>
              <thead><tr style={{ background:C.faint }}>
                {["Cliente","Sector","Registrado","Estado","Nota","Acciones"].map(TH)}
              </tr></thead>
              <tbody>
                {filteredClients.length === 0 && (
                  <tr><td colSpan={6} style={{ padding:28, textAlign:"center", color:C.muted, fontFamily:"Nunito Sans,sans-serif", fontSize:13 }}>Sin resultados</td></tr>
                )}
                {filteredClients.map((c, i) => (
                  <tr key={c.id} style={{ ...hoverRow, borderTop:`1px solid ${C.border}`, opacity:c.banned?.45:1, animation:`fadeSlideUp .22s ease ${i*.03}s both` }}
                    onMouseEnter={e=>e.currentTarget.style.background=C.faint}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{ padding:"10px 14px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <Av init={avatarInit(c.name)} size={30} color={C.blue}/>
                        <div>
                          <div style={{ fontSize:12, color:C.text, fontWeight:700, fontFamily:"Nunito Sans,sans-serif" }}>{c.name}</div>
                          <div style={{ fontSize:10, color:C.accent, fontWeight:700, fontFamily:"Nunito Sans,sans-serif" }}>{c.account_no}</div>
                          <div style={{ fontSize:10, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:"10px 14px", fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{c.sector||"—"}</td>
                    <td style={{ padding:"10px 14px", fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{new Date(c.created_at).toLocaleDateString("es-DO")}</td>
                    <td style={{ padding:"10px 14px" }}>{c.banned ? <Tag color={C.red} C={C}>🚫 Baneado</Tag> : <Tag color={C.accent} C={C}>Activo</Tag>}</td>
                    <td style={{ padding:"10px 14px", maxWidth:120 }}>
                      {c.admin_note
                        ? <span style={{ fontSize:10, color:C.gold, fontFamily:"Nunito Sans,sans-serif", fontStyle:"italic" }}>📝 {c.admin_note.slice(0,30)}{c.admin_note.length>30?"…":""}</span>
                        : <span style={{ fontSize:10, color:C.border }}>—</span>}
                    </td>
                    <td style={{ padding:"10px 14px" }}>
                      <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                        <Btn size="sm" outline C={C} onClick={()=>{ setEditUser(c); setEditForm({ name:c.name||"", email:c.email||"", phone:c.phone||"", whatsapp:c.whatsapp||"", sector:c.sector||"", city:c.city||"", role:c.role||"client", category:"", experience:"", bio:"", verified:false, featured:false, banned:c.banned||false }); }}>✏️</Btn>
                        <Btn size="sm" color={c.banned?C.accent:C.red} C={C} onClick={()=>setBanTarget(c)}>{c.banned?"✓":"🚫"}</Btn>
                        <Btn size="sm" color={C.orange} outline C={C} onClick={()=>{ setNoteTarget(c); setNoteText(c.admin_note||""); }}>📝</Btn>
                        <Btn size="sm" outline C={C} onClick={()=>setResetTarget(c)}>🔑</Btn>
                        <Btn size="sm" color={C.red} C={C} onClick={()=>setDeleteUser(c)}>🗑️</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB: JOBS
         ══════════════════════════════════════════════════════════════ */}
      {!loading && tab==="jobs" && (
        <div style={tableBox}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", minWidth:820 }}>
              <thead><tr style={{ background:C.faint }}>
                {["Trabajo","Cliente / Contacto","Sector","Presupuesto","Estado","Acciones"].map(TH)}
              </tr></thead>
              <tbody>
                {filteredJobs.length === 0 && (
                  <tr><td colSpan={6} style={{ padding:28, textAlign:"center", color:C.muted, fontFamily:"Nunito Sans,sans-serif", fontSize:13 }}>No hay trabajos publicados todavía</td></tr>
                )}
                {filteredJobs.map((j, i) => (
                  <tr key={j.id} style={{ ...hoverRow, borderTop:`1px solid ${C.border}`, animation:`fadeSlideUp .22s ease ${i*.03}s both` }}
                    onMouseEnter={e=>e.currentTarget.style.background=C.faint}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{ padding:"10px 14px", maxWidth:220 }}>
                      <div style={{ display:"flex", gap:9, alignItems:"center" }}>
                        <span style={{ fontSize:20, flexShrink:0 }}>{CAT_ICONS[j.category]||"🛠️"}</span>
                        <div>
                          <div style={{ fontSize:12, fontWeight:700, color:C.text, fontFamily:"Nunito Sans,sans-serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:180 }}>{j.description}</div>
                          <div style={{ fontSize:10, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{j.category} · {new Date(j.created_at).toLocaleDateString("es-DO")}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:"10px 14px", minWidth:180 }}>
                      <div style={{ fontSize:13, fontWeight:800, color:C.text, fontFamily:"Nunito Sans,sans-serif", marginBottom:3 }}>{j.client_name || j.profiles?.name || "—"}</div>
                      {j.client_phone && (
                        <a href={`https://wa.me/1${j.client_phone.replace(/\D/g,"")}`} target="_blank" rel="noreferrer"
                          style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:12, color:"#25D366", fontFamily:"Nunito Sans,sans-serif", fontWeight:700, textDecoration:"none", marginBottom:2 }}>
                          💬 {j.client_phone}
                        </a>
                      )}
                      {j.client_email && (
                        <a href={`mailto:${j.client_email}`}
                          style={{ display:"block", fontSize:11, color:C.blue, fontFamily:"Nunito Sans,sans-serif", textDecoration:"none" }}>
                          ✉️ {j.client_email}
                        </a>
                      )}
                    </td>
                    <td style={{ padding:"10px 14px", fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{j.sector||"—"}</td>
                    <td style={{ padding:"10px 14px", fontSize:12, color:C.gold, fontWeight:700, fontFamily:"Nunito Sans,sans-serif" }}>{j.budget?`RD$${j.budget}`:"—"}</td>
                    <td style={{ padding:"10px 14px" }}>
                      <Tag color={j.status==="filled"?C.accent:j.status==="open"?C.blue:C.muted} C={C}>{j.status||"open"}</Tag>
                    </td>
                    <td style={{ padding:"10px 14px" }}>
                      <div style={{ display:"flex", gap:4 }}>
                        <Btn size="sm" outline C={C} onClick={()=>{ setEditJob(j); setEditJobForm({ category:j.category||"", description:j.description||"", sector:j.sector||"", budget:j.budget||"", status:j.status||"open" }); }}>✏️</Btn>
                        <Btn size="sm" color={C.red} C={C} onClick={()=>setDeleteJob(j)}>🗑️</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB: CONEXIONES
         ══════════════════════════════════════════════════════════════ */}
      {!loading && tab==="connections" && (
        <div style={{ animation:"fadeSlideUp .25s ease" }}>
          {jobs.filter(j=>j.status==="filled"&&j.provider_id).length === 0 ? (
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:44, textAlign:"center" }}>
              <div style={{ fontSize:40, marginBottom:10 }}>🤝</div>
              <div style={{ fontWeight:700, color:C.text, fontFamily:"Nunito Sans,sans-serif" }}>Sin conexiones todavía</div>
              <div style={{ fontSize:12, color:C.muted, fontFamily:"Nunito Sans,sans-serif", marginTop:6 }}>Aquí aparecerán los trabajos donde un proveedor aceptó conectar con un cliente.</div>
            </div>
          ) : (
            <div style={tableBox}>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", minWidth:900 }}>
                  <thead><tr style={{ background:C.faint }}>
                    {["Trabajo","Cliente","Proveedor","Sector","Presupuesto","Fecha conexión","Calificación"].map(TH)}
                  </tr></thead>
                  <tbody>
                    {jobs.filter(j=>j.status==="filled"&&j.provider_id).map((j,i) => {
                      const provider = users.find(u=>u.id===j.provider_id);
                      return (
                        <tr key={j.id} style={{ ...hoverRow, borderTop:`1px solid ${C.border}`, animation:`fadeSlideUp .22s ease ${i*.03}s both` }}
                          onMouseEnter={e=>e.currentTarget.style.background=C.faint}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          {/* Work */}
                          <td style={{ padding:"11px 14px", maxWidth:200 }}>
                            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                              <span style={{ fontSize:18 }}>{CAT_ICONS[j.category]||"🛠️"}</span>
                              <div>
                                <div style={{ fontSize:12, fontWeight:700, color:C.text, fontFamily:"Nunito Sans,sans-serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:160 }}>{j.description}</div>
                                <div style={{ fontSize:10, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{j.category}</div>
                              </div>
                            </div>
                          </td>
                          {/* Client */}
                          <td style={{ padding:"11px 14px" }}>
                            <div style={{ fontSize:12, fontWeight:700, color:C.text, fontFamily:"Nunito Sans,sans-serif" }}>{j.client_name||j.profiles?.name||"—"}</div>
                            {j.client_phone && <a href={`https://wa.me/1${j.client_phone.replace(/\D/g,"")}`} target="_blank" rel="noreferrer" style={{ fontSize:10, color:"#25D366", fontFamily:"Nunito Sans,sans-serif", textDecoration:"none" }}>💬 {j.client_phone}</a>}
                            {j.client_email && <div style={{ fontSize:10, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>✉️ {j.client_email}</div>}
                          </td>
                          {/* Provider */}
                          <td style={{ padding:"11px 14px" }}>
                            {provider ? (
                              <>
                                <div style={{ fontSize:12, fontWeight:700, color:C.text, fontFamily:"Nunito Sans,sans-serif" }}>{provider.name}</div>
                                <div style={{ fontSize:10, color:C.accent, fontFamily:"Nunito Sans,sans-serif" }}>{provider.account_no}</div>
                                {provider.phone && <div style={{ fontSize:10, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>📱 {provider.phone}</div>}
                              </>
                            ) : <span style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>—</span>}
                          </td>
                          <td style={{ padding:"11px 14px", fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{j.sector||"—"}</td>
                          <td style={{ padding:"11px 14px", fontSize:12, color:C.gold, fontWeight:700, fontFamily:"Nunito Sans,sans-serif" }}>{j.budget?`RD$${j.budget}`:"—"}</td>
                          <td style={{ padding:"11px 14px", fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>
                            {j.accepted_at ? new Date(j.accepted_at).toLocaleDateString("es-DO") : new Date(j.created_at).toLocaleDateString("es-DO")}
                          </td>
                          <td style={{ padding:"11px 14px" }}>
                            <Tag color={j.rating?C.gold:C.muted} C={C}>{j.rating?`⭐ ${j.rating}`:"Sin calificar"}</Tag>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB: VERIFICATIONS
         ══════════════════════════════════════════════════════════════ */}
      {!loading && tab==="verifications" && (
        <div style={{ animation:"fadeSlideUp .25s ease" }}>
          {pending.length === 0 ? (
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:44, textAlign:"center" }}>
              <div style={{ fontSize:40, marginBottom:10 }}>✅</div>
              <div style={{ fontWeight:700, color:C.text, fontFamily:"Nunito Sans,sans-serif" }}>Todo al día — no hay verificaciones pendientes</div>
              <div style={{ fontSize:12, color:C.muted, fontFamily:"Nunito Sans,sans-serif", marginTop:6 }}>Cuando un proveedor solicite verificación, aparecerá aquí.</div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {pending.map((v, i) => (
                <div key={v.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:14, animation:`fadeSlideUp .25s ease ${i*.06}s both` }}>
                  <div style={{ display:"flex", gap:13, alignItems:"center", flex:1 }}>
                    <Av init={avatarInit(v.profiles?.name)} size={44} color={C.orange}/>
                    <div>
                      <div style={{ fontWeight:800, color:C.text, fontFamily:"'Nunito',sans-serif", fontSize:14 }}>{v.profiles?.name}</div>
                      <div style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{v.profiles?.email}</div>
                      <div style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{v.providers?.category} · Enviado: {new Date(v.submitted_at).toLocaleDateString("es-DO")}</div>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                    <Btn size="sm" color={C.red} outline C={C} onClick={()=>doReject(v)}>❌ Rechazar</Btn>
                    <Btn size="sm" color={C.accent} C={C} onClick={()=>doVerify(v)}>✅ Verificar</Btn>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB: ADS MANAGER
         ══════════════════════════════════════════════════════════════ */}
      {!loading && tab==="ads" && (
        <div style={{ animation:"fadeSlideUp .25s ease", display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

          {/* ── LEFT: Upload new ad ── */}
          <div>
            <div style={{ background:C.card, border:`1.5px solid ${C.accent}30`, borderRadius:14, padding:22, marginBottom:14 }}>
              <div style={{ fontWeight:900, color:C.text, fontFamily:"'Nunito',sans-serif", fontSize:15, marginBottom:4 }}>📢 Publicar nuevo anuncio</div>
              <div style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif", marginBottom:18 }}>Imágenes (JPG, PNG, GIF, WebP) o videos (MP4, WebM) · Máx 25MB</div>

              {/* File drop zone */}
              <div onClick={()=>adFileRef.current?.click()}
                style={{ border:`2px dashed ${adPreview?C.accent:C.border}`, borderRadius:12, padding:"20px 14px", textAlign:"center", cursor:"pointer", marginBottom:14, background:adPreview?`${C.accent}06`:C.faint, transition:"all .2s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=adPreview?C.accent:C.border;}}>
                {adPreview ? (
                  adPreview.type.startsWith("video") ? (
                    <video src={adPreview.url} style={{ maxWidth:"100%", maxHeight:160, borderRadius:8 }} controls/>
                  ) : (
                    <img src={adPreview.url} alt="preview" style={{ maxWidth:"100%", maxHeight:160, borderRadius:8, objectFit:"cover" }}/>
                  )
                ) : (
                  <>
                    <div style={{ fontSize:32, marginBottom:6 }}>🖼️</div>
                    <div style={{ fontSize:13, fontWeight:700, color:C.text, fontFamily:"Nunito Sans,sans-serif", marginBottom:3 }}>Haz clic para seleccionar</div>
                    <div style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>o arrastra tu imagen/video aquí</div>
                  </>
                )}
              </div>
              <input ref={adFileRef} type="file" accept="image/*,video/mp4,video/webm" onChange={handleAdFileChange} style={{ display:"none" }}/>

              {/* Title */}
              <Input label="Título del anuncio *" value={adForm.title} onChange={e=>setAdForm(f=>({...f,title:e.target.value}))} icon="📝" placeholder="Ej: Ferretería El Constructor" C={C}/>

              {/* Link */}
              <Input label="URL de destino (opcional)" value={adForm.link} onChange={e=>setAdForm(f=>({...f,link:e.target.value}))} onBlur={e=>{ const v=e.target.value.trim(); if(v && !v.startsWith("http://") && !v.startsWith("https://")) setAdForm(f=>({...f,link:"https://"+v})); }} icon="🔗" placeholder="https://..." C={C}/>

              {/* Position */}
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:"0.06em", textTransform:"uppercase", fontFamily:"Nunito Sans,sans-serif", marginBottom:7 }}>📍 Posición</div>
                <div style={{ display:"flex", gap:8 }}>
                  {[{v:"sidebar",l:"📌 Sidebar"},{v:"top",l:"⬆ Banner superior"},{v:"bottom",l:"⬇ Banner inferior"}].map(opt=>(
                    <button key={opt.v} onClick={()=>setAdForm(f=>({...f,position:opt.v}))}
                      style={{ flex:1, padding:"8px 0", borderRadius:9, border:`2px solid ${adForm.position===opt.v?C.accent:C.border}`, background:adForm.position===opt.v?`${C.accent}18`:C.surface, color:adForm.position===opt.v?C.accent:C.muted, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"Nunito Sans,sans-serif", transition:"all .15s" }}>
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active toggle */}
              <label style={{ display:"flex", alignItems:"center", gap:9, cursor:"pointer", marginBottom:16 }}>
                <input type="checkbox" checked={adForm.active} onChange={e=>setAdForm(f=>({...f,active:e.target.checked}))} style={{ accentColor:C.accent, width:16, height:16 }}/>
                <span style={{ fontSize:13, color:adForm.active?C.accent:C.muted, fontFamily:"Nunito Sans,sans-serif", fontWeight:600 }}>▶ Activo al publicar</span>
              </label>

              {adError && (
                <div style={{ background:`${C.red}15`, border:`1px solid ${C.red}30`, borderRadius:9, padding:"9px 13px", fontSize:12, color:C.red, marginBottom:12, fontFamily:"Nunito Sans,sans-serif" }}>⚠️ {adError}</div>
              )}

              <Btn full onClick={doUploadAd} disabled={adUploading} C={C} size="lg">
                {adUploading
                  ? <><span style={{ display:"inline-block", width:15, height:15, border:"2px solid #fff4", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .6s linear infinite" }}/> Subiendo...</>
                  : "📤 Publicar anuncio"}
              </Btn>
            </div>

            {/* Supabase reminder */}
            <div style={{ background:`${C.gold}10`, border:`1px solid ${C.gold}30`, borderRadius:10, padding:"11px 14px", fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif", lineHeight:1.6 }}>
              💡 <strong style={{color:C.text}}>Recuerda:</strong> El bucket <code style={{background:C.faint,padding:"1px 5px",borderRadius:4,color:C.accent}}>ads-media</code> debe estar en Supabase Storage como público. Corre <strong style={{color:C.accent}}>add_ads.sql</strong> si aún no lo has hecho.
            </div>
          </div>

          {/* ── RIGHT: Active ads list ── */}
          <div>
            {/* ── ADSENSE MANAGER ── */}
            <div style={{ background:C.card, border:`1.5px solid ${C.blue}30`, borderRadius:14, padding:20, marginBottom:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                <span style={{ fontSize:20 }}>📊</span>
                <div>
                  <div style={{ fontWeight:900, color:C.text, fontFamily:"'Nunito',sans-serif", fontSize:14 }}>Google AdSense</div>
                  <div style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>Pega tu código de unidad de anuncio — se muestra en el sidebar del Explorar</div>
                </div>
              </div>

              <div style={{ background:`${C.blue}08`, border:`1px solid ${C.blue}20`, borderRadius:9, padding:"9px 12px", marginBottom:14, marginTop:10, fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif", lineHeight:1.6 }}>
                ℹ️ Pega el código completo que Google te da, incluyendo el tag <code style={{background:C.faint,padding:"1px 4px",borderRadius:3,color:C.blue}}>&lt;ins class="adsbygoogle"...&gt;</code> y el script de abajo.
              </div>

              {/* Slot 1 */}
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:"0.06em", textTransform:"uppercase", fontFamily:"Nunito Sans,sans-serif", marginBottom:6 }}>
                  📌 Slot 1 — Sidebar superior
                </div>
                <textarea
                  value={adsenseSlot1}
                  onChange={e=>setAdsenseSlot1(e.target.value)}
                  rows={4}
                  placeholder={'<ins class="adsbygoogle"\n  style="display:block"\n  data-ad-client="ca-pub-XXXXXXXX"\n  data-ad-slot="XXXXXXXX"></ins>\n<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>'}
                  style={{ width:"100%", padding:"10px 12px", borderRadius:10, background:C.faint, border:`1.5px solid ${C.border}`, color:C.text, fontSize:11, outline:"none", resize:"vertical", fontFamily:"monospace", lineHeight:1.6, boxSizing:"border-box" }}
                  onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border}
                />
                {adsenseSlot1 && (
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:5 }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", background:C.accent }}/>
                    <span style={{ fontSize:10, color:C.accent, fontFamily:"Nunito Sans,sans-serif" }}>Código guardado — activo en el sidebar</span>
                  </div>
                )}
              </div>

              {/* Slot 2 */}
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:"0.06em", textTransform:"uppercase", fontFamily:"Nunito Sans,sans-serif", marginBottom:6 }}>
                  📌 Slot 2 — Sidebar inferior
                </div>
                <textarea
                  value={adsenseSlot2}
                  onChange={e=>setAdsenseSlot2(e.target.value)}
                  rows={4}
                  placeholder={'<ins class="adsbygoogle"\n  style="display:block"\n  data-ad-client="ca-pub-XXXXXXXX"\n  data-ad-slot="YYYYYYYY"></ins>\n<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>'}
                  style={{ width:"100%", padding:"10px 12px", borderRadius:10, background:C.faint, border:`1.5px solid ${C.border}`, color:C.text, fontSize:11, outline:"none", resize:"vertical", fontFamily:"monospace", lineHeight:1.6, boxSizing:"border-box" }}
                  onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border}
                />
                {adsenseSlot2 && (
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:5 }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", background:C.accent }}/>
                    <span style={{ fontSize:10, color:C.accent, fontFamily:"Nunito Sans,sans-serif" }}>Código guardado — activo en el sidebar</span>
                  </div>
                )}
              </div>

              <Btn full onClick={doSaveAdsense} disabled={adsenseSaving} C={C} color={C.blue}>
                {adsenseSaving
                  ? <><span style={{ display:"inline-block", width:14, height:14, border:"2px solid #fff4", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .6s linear infinite" }}/> Guardando...</>
                  : adsenseSaved ? "✅ ¡Guardado!" : "💾 Guardar código AdSense"}
              </Btn>
            </div>

            <div style={{ fontWeight:900, color:C.text, fontFamily:"'Nunito',sans-serif", fontSize:14, marginBottom:12 }}>📋 Anuncios publicados ({ads.length})</div>
            {ads.length === 0 ? (
              <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:36, textAlign:"center" }}>
                <div style={{ fontSize:36, marginBottom:10 }}>📢</div>
                <div style={{ fontWeight:700, color:C.text, fontFamily:"Nunito Sans,sans-serif", fontSize:13, marginBottom:4 }}>No hay anuncios aún</div>
                <div style={{ color:C.muted, fontSize:11, fontFamily:"Nunito Sans,sans-serif" }}>Sube tu primer anuncio con el formulario de la izquierda.</div>
              </div>
            ) : ads.map((ad, i) => (
              <div key={ad.id} style={{ background:C.card, border:`1.5px solid ${ad.active?C.accent+"50":C.border}`, borderRadius:14, overflow:"hidden", marginBottom:12, animation:`fadeSlideUp .22s ease ${i*.05}s both`, opacity:ad.active?1:.7, transition:"border .2s, opacity .2s" }}>
                {/* Media preview */}
                <div style={{ background:C.faint, borderBottom:`1px solid ${C.border}`, position:"relative", minHeight:60, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {ad.media_type === "video" ? (
                    <video src={ad.media_url} style={{ maxWidth:"100%", maxHeight:130, display:"block" }} muted loop/>
                  ) : (
                    <img src={ad.media_url} alt={ad.title} style={{ maxWidth:"100%", maxHeight:130, display:"block", objectFit:"cover", width:"100%" }}/>
                  )}
                  <div style={{ position:"absolute", top:8, right:8 }}>
                    <Tag color={ad.active?C.accent:C.muted} C={C}>{ad.active?"▶ Activo":"⏸ Pausado"}</Tag>
                  </div>
                </div>
                <div style={{ padding:"12px 14px" }}>
                  <div style={{ fontWeight:800, color:C.text, fontFamily:"'Nunito',sans-serif", fontSize:13, marginBottom:2 }}>{ad.title}</div>
                  <div style={{ fontSize:10, color:C.muted, fontFamily:"Nunito Sans,sans-serif", marginBottom:2 }}>📍 {ad.position} · {ad.media_type === "video" ? "🎬 Video" : "🖼️ Imagen"}</div>
                  {ad.link && <div style={{ fontSize:10, color:C.blue, fontFamily:"Nunito Sans,sans-serif", marginBottom:8, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>🔗 {ad.link}</div>}
                  <div style={{ fontSize:9, color:C.muted, fontFamily:"Nunito Sans,sans-serif", marginBottom:10 }}>Subido: {new Date(ad.created_at).toLocaleDateString("es-DO")}</div>
                  <div style={{ display:"flex", gap:7 }}>
                    <Btn size="sm" color={ad.active?C.muted:C.accent} outline={ad.active} C={C} onClick={()=>doToggleAd(ad)}>
                      {ad.active?"⏸ Pausar":"▶ Activar"}
                    </Btn>
                    {ad.link && (
                      <a href={ad.link} target="_blank" rel="noreferrer" style={{ display:"inline-flex", alignItems:"center", padding:"4px 10px", borderRadius:7, border:`1.5px solid ${C.border}`, fontSize:11, color:C.muted, textDecoration:"none", fontFamily:"Nunito Sans,sans-serif", fontWeight:600 }}>🔗 Abrir</a>
                    )}
                    <Btn size="sm" color={C.red} C={C} onClick={()=>doDeleteAd(ad)}>🗑️</Btn>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB: DEMAND HEATMAP
         ══════════════════════════════════════════════════════════════ */}
      {!loading && tab==="demand" && (
        <div style={{ animation:"fadeSlideUp .25s ease", display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          {/* By sector */}
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
            <div style={{ fontWeight:800, color:C.text, marginBottom:4, fontFamily:"'Nunito',sans-serif", fontSize:14 }}>📍 Demanda por Sector</div>
            <div style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif", marginBottom:14 }}>{jobs.length} trabajos publicados</div>
            {Object.entries(jobs.reduce((a,j)=>{ a[j.sector||"Sin sector"]=(a[j.sector||"Sin sector"]||0)+1; return a; },{}))
              .sort((a,b)=>b[1]-a[1]).slice(0,10).map(([sector,count],i,arr)=>{
              const pct = Math.round((count/arr[0][1])*100);
              const col = pct>75?C.red:pct>40?C.orange:pct>20?C.gold:C.muted;
              return (
                <div key={sector} style={{ marginBottom:9 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                    <span style={{ fontSize:12, color:C.text, fontFamily:"Nunito Sans,sans-serif", fontWeight:600 }}>{sector}</span>
                    <span style={{ fontSize:12, color:col, fontFamily:"Nunito Sans,sans-serif", fontWeight:800 }}>{count}</span>
                  </div>
                  <div style={{ height:5, background:C.border, borderRadius:99, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:col, borderRadius:99, transition:"width .6s ease" }}/>
                  </div>
                </div>
              );
            })}
            {jobs.length===0 && <div style={{ textAlign:"center", color:C.muted, fontSize:12, padding:20, fontFamily:"Nunito Sans,sans-serif" }}>Sin datos todavía</div>}
          </div>
          {/* By category */}
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
            <div style={{ fontWeight:800, color:C.text, marginBottom:4, fontFamily:"'Nunito',sans-serif", fontSize:14 }}>🛠️ Demanda por Categoría</div>
            <div style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif", marginBottom:14 }}>Servicios más solicitados</div>
            {Object.entries(jobs.reduce((a,j)=>{ a[j.category||"Sin cat"]=(a[j.category||"Sin cat"]||0)+1; return a; },{}))
              .sort((a,b)=>b[1]-a[1]).slice(0,10).map(([cat,count],i,arr)=>{
              const pct = Math.round((count/arr[0][1])*100);
              const col = pct>75?C.red:pct>40?C.orange:pct>20?C.gold:C.muted;
              return (
                <div key={cat} style={{ marginBottom:9 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                    <span style={{ fontSize:12, color:C.text, fontFamily:"Nunito Sans,sans-serif", fontWeight:600 }}>{CAT_ICONS[cat]||"🛠️"} {cat}</span>
                    <span style={{ fontSize:12, color:col, fontFamily:"Nunito Sans,sans-serif", fontWeight:800 }}>{count}</span>
                  </div>
                  <div style={{ height:5, background:C.border, borderRadius:99, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:col, borderRadius:99, transition:"width .6s ease" }}/>
                  </div>
                </div>
              );
            })}
            {jobs.length===0 && <div style={{ textAlign:"center", color:C.muted, fontSize:12, padding:20, fontFamily:"Nunito Sans,sans-serif" }}>Sin datos todavía</div>}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB: ACTIVITY LOG
         ══════════════════════════════════════════════════════════════ */}
      {!loading && tab==="actlog" && (
        <div style={{ animation:"fadeSlideUp .25s ease" }}>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden" }}>
            <div style={{ padding:"13px 18px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontWeight:800, color:C.text, fontFamily:"'Nunito',sans-serif", fontSize:14 }}>🔐 Registro de Actividad Admin</span>
              <Tag color={C.muted} C={C}>Últimas {actLog.length} acciones</Tag>
            </div>
            {actLog.length === 0 && (
              <div style={{ padding:32, textAlign:"center", color:C.muted, fontFamily:"Nunito Sans,sans-serif", fontSize:13 }}>
                No hay actividad registrada todavía. Las acciones que realices aquí aparecerán automáticamente.
              </div>
            )}
            {actLog.map((entry, i) => {
              const col = entry.action?.includes("DELETE")||entry.action?.includes("BAN")||entry.action?.includes("REJECT") ? C.red
                : entry.action?.includes("VERIFY")||entry.action?.includes("UNBAN") ? C.accent
                : entry.action?.includes("FEATURE") ? C.gold
                : entry.action?.includes("RESET") ? C.orange
                : C.muted;
              const icon = entry.action?.includes("DELETE")?"🗑️":entry.action?.includes("BAN")?"🚫":entry.action?.includes("VERIFY")?"✅":entry.action?.includes("UNBAN")?"✓":entry.action?.includes("FEATURE")?"⭐":entry.action?.includes("RESET")?"🔑":entry.action?.includes("NOTE")?"📝":entry.action?.includes("EDIT")?"✏️":"🔐";
              return (
                <div key={i} style={{ padding:"10px 18px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:16, flexShrink:0 }}>{icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:col, fontFamily:"Nunito Sans,sans-serif" }}>{entry.action}</div>
                    <div style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>{entry.target_info}</div>
                  </div>
                  <div style={{ fontSize:10, color:C.muted, fontFamily:"Nunito Sans,sans-serif", flexShrink:0 }}>
                    {new Date(entry.created_at).toLocaleString("es-DO")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODALS
         ═══════════════════════════════════════════════════════════════ */}

      {/* ── EDIT USER ── */}
      {editUser && (
        <Modal onClose={()=>setEditUser(null)} C={C} width={520}>
          <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:18, fontWeight:900, color:C.text, margin:"0 0 3px" }}>✏️ Editar Cuenta</h2>
          <div style={{ fontSize:11, color:C.accent, fontFamily:"Nunito Sans,sans-serif", marginBottom:16 }}>{editUser.account_no} · {editUser.email}</div>

          {/* Role */}
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:"0.06em", textTransform:"uppercase", fontFamily:"Nunito Sans,sans-serif", marginBottom:7 }}>Rol de la cuenta</div>
            <div style={{ display:"flex", gap:8 }}>
              {["client","provider","admin"].map(r => (
                <button key={r} onClick={()=>setEditForm(f=>({...f,role:r}))}
                  style={{ flex:1, padding:"9px 0", borderRadius:9, border:`2px solid ${editForm.role===r?C.accent:C.border}`, background:editForm.role===r?`${C.accent}18`:C.surface, color:editForm.role===r?C.accent:C.muted, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"Nunito Sans,sans-serif", transition:"all .15s" }}>
                  {r==="client"?"👤 Cliente":r==="provider"?"🛠️ Proveedor":"👑 Admin"}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:4 }}>
            <Input label="Nombre" value={editForm.name} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))} icon="👤" C={C}/>
            <Input label="Teléfono" value={editForm.phone} onChange={e=>setEditForm(f=>({...f,phone:e.target.value}))} icon="📱" C={C}/>
            <Input label="WhatsApp" value={editForm.whatsapp} onChange={e=>setEditForm(f=>({...f,whatsapp:e.target.value}))} icon="💬" C={C}/>
            <Input label="Sector" value={editForm.sector} onChange={e=>setEditForm(f=>({...f,sector:e.target.value}))} icon="📍" C={C}/>
            <Input label="Ciudad" value={editForm.city} onChange={e=>setEditForm(f=>({...f,city:e.target.value}))} icon="🏙️" C={C}/>
          </div>

          {editForm.role === "provider" && (
            <>
              <div style={{ height:1, background:C.border, margin:"12px 0 13px" }}/>
              <div style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:"0.07em", textTransform:"uppercase", fontFamily:"Nunito Sans,sans-serif", marginBottom:9 }}>Datos de Proveedor</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:"0.06em", textTransform:"uppercase", fontFamily:"Nunito Sans,sans-serif", marginBottom:6 }}>Categoría</div>
                  <select value={editForm.category} onChange={e=>setEditForm(f=>({...f,category:e.target.value}))}
                    style={{ width:"100%", padding:"10px 12px", borderRadius:10, background:C.card, border:`1.5px solid ${C.border}`, color:C.text, fontSize:13, outline:"none", fontFamily:"Nunito Sans,sans-serif" }}>
                    <option value="">— Seleccionar —</option>
                    {T.es.cats.map(c=>(
                      <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>
                    ))}
                  </select>
                </div>
                <Input label="Experiencia" value={editForm.experience} onChange={e=>setEditForm(f=>({...f,experience:e.target.value}))} icon="📅" C={C}/>
              </div>
              <div style={{ display:"flex", gap:18, marginBottom:10 }}>
                {[{k:"verified",l:"✓ Verificado",c:C.accent},{k:"featured",l:"⭐ Destacado",c:C.gold},{k:"banned",l:"🚫 Baneado",c:C.red}].map(({k,l,c})=>(
                  <label key={k} style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer" }}>
                    <input type="checkbox" checked={!!editForm[k]} onChange={e=>setEditForm(f=>({...f,[k]:e.target.checked}))} style={{ accentColor:c, width:15, height:15 }}/>
                    <span style={{ fontSize:12, color:editForm[k]?c:C.muted, fontFamily:"Nunito Sans,sans-serif", fontWeight:600 }}>{l}</span>
                  </label>
                ))}
              </div>
            </>
          )}

          {editForm.role !== "provider" && (
            <div style={{ marginTop:10, marginBottom:12 }}>
              <label style={{ display:"flex", alignItems:"center", gap:7, cursor:"pointer" }}>
                <input type="checkbox" checked={!!editForm.banned} onChange={e=>setEditForm(f=>({...f,banned:e.target.checked}))} style={{ accentColor:C.red, width:15, height:15 }}/>
                <span style={{ fontSize:12, color:editForm.banned?C.red:C.muted, fontFamily:"Nunito Sans,sans-serif", fontWeight:600 }}>🚫 Cuenta baneada</span>
              </label>
            </div>
          )}

          <div style={{ display:"flex", gap:9, marginTop:6 }}>
            <Btn onClick={()=>setEditUser(null)} outline full C={C}>Cancelar</Btn>
            <Btn onClick={doSaveUser} full C={C}>💾 Guardar cambios</Btn>
          </div>
        </Modal>
      )}

      {/* ── EDIT JOB ── */}
      {editJob && (
        <Modal onClose={()=>setEditJob(null)} C={C} width={460}>
          <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:17, fontWeight:900, color:C.text, margin:"0 0 14px" }}>✏️ Editar Trabajo</h2>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:"0.06em", textTransform:"uppercase", fontFamily:"Nunito Sans,sans-serif", marginBottom:6 }}>Categoría</div>
            <select value={editJobForm.category} onChange={e=>setEditJobForm(f=>({...f,category:e.target.value}))}
              style={{ width:"100%", padding:"10px 12px", borderRadius:10, background:C.card, border:`1.5px solid ${C.border}`, color:C.text, fontSize:13, outline:"none", fontFamily:"Nunito Sans,sans-serif" }}>
              {T.es.cats.map(c=>(
                <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:"0.06em", textTransform:"uppercase", fontFamily:"Nunito Sans,sans-serif", marginBottom:6 }}>Descripción</div>
            <textarea value={editJobForm.description} onChange={e=>setEditJobForm(f=>({...f,description:e.target.value}))} rows={3}
              style={{ width:"100%", padding:"10px 12px", borderRadius:10, background:C.card, border:`1.5px solid ${C.border}`, color:C.text, fontSize:13, outline:"none", resize:"vertical", fontFamily:"Nunito Sans,sans-serif" }}/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:12 }}>
            <Input label="Sector" value={editJobForm.sector} onChange={e=>setEditJobForm(f=>({...f,sector:e.target.value}))} icon="📍" C={C}/>
            <Input label="Presupuesto RD$" value={editJobForm.budget} onChange={e=>setEditJobForm(f=>({...f,budget:e.target.value}))} icon="💰" C={C}/>
          </div>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:"0.06em", textTransform:"uppercase", fontFamily:"Nunito Sans,sans-serif", marginBottom:6 }}>Estado</div>
            <div style={{ display:"flex", gap:8 }}>
              {["open","filled","closed"].map(s=>(
                <button key={s} onClick={()=>setEditJobForm(f=>({...f,status:s}))}
                  style={{ flex:1, padding:"9px 0", borderRadius:9, border:`2px solid ${editJobForm.status===s?C.accent:C.border}`, background:editJobForm.status===s?`${C.accent}18`:C.surface, color:editJobForm.status===s?C.accent:C.muted, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"Nunito Sans,sans-serif" }}>
                  {s==="open"?"🟢 Abierto":s==="filled"?"✅ Completado":"🔴 Cerrado"}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", gap:9 }}>
            <Btn onClick={()=>setEditJob(null)} outline full C={C}>Cancelar</Btn>
            <Btn onClick={doSaveJob} full C={C}>💾 Guardar</Btn>
          </div>
        </Modal>
      )}

      {/* ── BAN CONFIRM ── */}
      {banTarget && (
        <Modal onClose={()=>setBanTarget(null)} C={C} width={360}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:44, marginBottom:12 }}>{banTarget.banned?"✅":"🚫"}</div>
            <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:18, color:C.text, margin:"0 0 7px" }}>{banTarget.banned?"¿Reactivar cuenta?":"¿Banear esta cuenta?"}</h2>
            <p style={{ fontSize:13, fontWeight:700, color:C.text, margin:"0 0 3px", fontFamily:"Nunito Sans,sans-serif" }}>{banTarget.name}</p>
            <p style={{ fontSize:11, color:C.muted, margin:"0 0 20px", fontFamily:"Nunito Sans,sans-serif" }}>{banTarget.email} · {banTarget.account_no}</p>
            <div style={{ display:"flex", gap:9 }}>
              <Btn onClick={()=>setBanTarget(null)} outline full C={C}>Cancelar</Btn>
              <Btn onClick={()=>doBan(banTarget)} color={banTarget.banned?C.accent:C.red} full C={C}>{banTarget.banned?"✓ Reactivar":"🚫 Banear"}</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* ── DELETE USER CONFIRM ── */}
      {deleteUser && (
        <Modal onClose={()=>setDeleteUser(null)} C={C} width={390}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:44, marginBottom:12 }}>🗑️</div>
            <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:17, color:C.red, margin:"0 0 7px" }}>¿Eliminar cuenta permanentemente?</h2>
            <p style={{ fontSize:13, fontWeight:700, color:C.text, margin:"0 0 3px", fontFamily:"Nunito Sans,sans-serif" }}>{deleteUser.name}</p>
            <p style={{ fontSize:11, color:C.muted, margin:"0 0 4px", fontFamily:"Nunito Sans,sans-serif" }}>{deleteUser.email} · {deleteUser.account_no}</p>
            <div style={{ background:`${C.red}12`, border:`1px solid ${C.red}30`, borderRadius:10, padding:"9px 13px", marginBottom:18, marginTop:8, fontSize:12, color:C.red, fontFamily:"Nunito Sans,sans-serif" }}>
              ⚠️ Esto elimina su perfil, datos y trabajos asociados. No se puede deshacer.
            </div>
            <div style={{ display:"flex", gap:9 }}>
              <Btn onClick={()=>setDeleteUser(null)} outline full C={C}>Cancelar</Btn>
              <Btn onClick={()=>doDeleteUser(deleteUser)} color={C.red} full C={C}>🗑️ Eliminar</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* ── DELETE JOB CONFIRM ── */}
      {deleteJob && (
        <Modal onClose={()=>setDeleteJob(null)} C={C} width={380}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:44, marginBottom:12 }}>🗑️</div>
            <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:17, color:C.red, margin:"0 0 7px" }}>¿Eliminar este trabajo?</h2>
            <p style={{ fontSize:13, fontWeight:700, color:C.text, margin:"0 0 16px", fontFamily:"Nunito Sans,sans-serif", maxWidth:300, marginLeft:"auto", marginRight:"auto" }}>"{deleteJob.description?.slice(0,60)}"</p>
            <div style={{ display:"flex", gap:9 }}>
              <Btn onClick={()=>setDeleteJob(null)} outline full C={C}>Cancelar</Btn>
              <Btn onClick={()=>doDeleteJob(deleteJob)} color={C.red} full C={C}>🗑️ Eliminar</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* ── ADMIN NOTE ── */}
      {noteTarget && (
        <Modal onClose={()=>setNoteTarget(null)} C={C} width={420}>
          <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:17, fontWeight:900, color:C.text, margin:"0 0 5px" }}>📝 Nota interna</h2>
          <p style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif", marginBottom:14 }}>{noteTarget.name} · {noteTarget.account_no} — Solo visible para admins</p>
          <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} rows={4}
            placeholder="Ej: Cliente problemático, reportado dos veces. Monitorear."
            style={{ width:"100%", padding:"11px 13px", borderRadius:10, background:C.card, border:`1.5px solid ${C.border}`, color:C.text, fontSize:13, outline:"none", resize:"vertical", fontFamily:"Nunito Sans,sans-serif", marginBottom:14 }}/>
          <div style={{ display:"flex", gap:9 }}>
            <Btn onClick={()=>setNoteTarget(null)} outline full C={C}>Cancelar</Btn>
            <Btn onClick={doSaveNote} full C={C}>💾 Guardar nota</Btn>
          </div>
        </Modal>
      )}

      {/* ── PASSWORD RESET ── */}
      {resetTarget && (
        <Modal onClose={()=>setResetTarget(null)} C={C} width={380}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🔑</div>
            <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:17, color:C.text, margin:"0 0 7px" }}>Enviar restablecimiento de contraseña</h2>
            <p style={{ fontSize:13, fontWeight:700, color:C.text, margin:"0 0 3px", fontFamily:"Nunito Sans,sans-serif" }}>{resetTarget.name}</p>
            <p style={{ fontSize:12, color:C.muted, margin:"0 0 18px", fontFamily:"Nunito Sans,sans-serif" }}>Se enviará un email a <strong>{resetTarget.email}</strong> con un enlace para restablecer su contraseña.</p>
            <div style={{ display:"flex", gap:9 }}>
              <Btn onClick={()=>setResetTarget(null)} outline full C={C}>Cancelar</Btn>
              <Btn onClick={()=>doSendPasswordReset(resetTarget)} color={C.orange} full C={C}>📧 Enviar email</Btn>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}



// ── ROOT ──────────────────────────────────────────────────────────
export default function App() {
  const [view, setView]             = useState("browse");
  const [dark, setDark]             = useState(() => { try { return localStorage.getItem("esr_dark")==="1"; } catch{ return false; } });
  const [lang, setLang]             = useState("es");
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin]   = useState(false);
  const [session, setSession]       = useState(null);
  const [profile, setProfile]       = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const C = dark ? D : L;
  const t = T[lang];

  // Track whether this is a fresh login (needs redirect) vs page reload
  const justLoggedIn = useRef(false);

  const loadProfile = async (userId) => {
    const { data } = await getProfile(userId);
    setProfile(data);
    setAuthLoading(false);
    // Redirect to correct panel after login
    if (justLoggedIn.current) {
      justLoggedIn.current = false;
      if (!data) {
        // Profile missing — stay on browse, user is still logged in
        setView("browse");
        return;
      }
      if (data.role === "provider") setView("provider");
      else if (data.role === "admin") setView("admin");
      else setView("client");
    }
  };

  const [confirmedEmail, setConfirmedEmail] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetForm, setResetForm] = useState({ password:"", confirm:"" });
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetDone, setResetDone] = useState(false);

  const handleResetPassword = async () => {
    if (resetForm.password.length < 6) { setResetError("Mínimo 6 caracteres."); return; }
    if (resetForm.password !== resetForm.confirm) { setResetError("Las contraseñas no coinciden."); return; }
    setResetLoading(true); setResetError("");
    const { error } = await supabase.auth.updateUser({ password: resetForm.password });
    setResetLoading(false);
    if (error) { setResetError(error.message); return; }
    setResetDone(true);
    setTimeout(() => { setShowResetPassword(false); setResetDone(false); setResetForm({ password:"", confirm:"" }); }, 2500);
  };

  useEffect(() => {
    // ── Track page view ──
    try {
      let sid = sessionStorage.getItem("esr_sid");
      if (!sid) { sid = Math.random().toString(36).slice(2)+Date.now().toString(36); sessionStorage.setItem("esr_sid", sid); }
      supabase.from("page_views").insert([{ session_id: sid, path: window.location.pathname, created_at: new Date().toISOString() }]).then(()=>{});
    } catch(e) {}

    // ── Handle Supabase auth tokens in URL hash ──
    // IMPORTANT: Read the hash FIRST before Supabase clears it, then let SDK process it
    const hash = window.location.hash;
    const isSignup   = hash.includes("type=signup");
    const isRecovery = hash.includes("type=recovery");

    if (isSignup) {
      setConfirmedEmail(true);
      // Don't clear hash — let Supabase SDK parse the access_token from it
    }
    if (isRecovery) {
      setShowResetPassword(true);
      // Don't clear hash — let Supabase SDK parse and establish the session
    }

    // On mount: check for existing session
    getSession().then(sess => {
      setSession(sess);
      if (sess) loadProfile(sess.user.id);
      else setAuthLoading(false);
    });

    // Listen for auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
      if (event === "SIGNED_IN") {
        // After email confirmation, don't auto-redirect — show the banner + login prompt
        if (isSignup) {
          setAuthLoading(false);
          // Clear the hash now that Supabase has processed it
          window.history.replaceState(null, "", window.location.pathname);
          return;
        }
        justLoggedIn.current = true;
        setSession(sess);
        if (sess) loadProfile(sess.user.id);
      } else if (event === "PASSWORD_RECOVERY") {
        setShowResetPassword(true);
        window.history.replaceState(null, "", window.location.pathname);
      } else if (event === "USER_UPDATED") {
        setSession(sess);
        if (sess) loadProfile(sess.user.id);
      } else if (event === "SIGNED_OUT") {
        setSession(null);
        setProfile(null);
        setAuthLoading(false);
        setView("browse");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSetView = (v) => {
    const protectedViews = ["client", "provider", "admin"];
    if (!session && protectedViews.includes(v)) {
      setShowLogin(true); return;
    }
    // Role guards — only block if profile is loaded
    if (profile) {
      if (v === "admin"    && profile.role !== "admin") return;
      if (v === "provider" && profile.role !== "provider" && profile.role !== "admin") return;
      if (v === "client"   && profile.role !== "client"   && profile.role !== "admin") return;
    }
    setView(v); window.scrollTo(0, 0);
  };

  const isMobile = useIsMobile();

  const VIEWS = { browse:BrowseView, post:PostJobView, client:ClientDashboard, provider:ProviderDashboard, admin:AdminDashboard };
  const View = VIEWS[view] || BrowseView;

  if (authLoading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:C.bg }}>
      <div style={{ textAlign:"center" }}>
        <BrandName size={28} C={C}/>
        <div style={{ marginTop:16, display:"flex", justifyContent:"center" }}>
          <div style={{ width:24, height:24, border:`3px solid ${C.border}`, borderTopColor:C.accent, borderRadius:"50%", animation:"spin .7s linear infinite" }}/>
        </div>
        <div style={{ marginTop:12, fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>Cargando sesión...</div>
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", height:"100vh", background:C.bg, fontFamily:"Nunito Sans,sans-serif", color:C.text, transition:"background .3s, color .3s" }}>
      {!isMobile && (
        <Sidebar
          view={view} setView={handleSetView} t={t} C={C}
          dark={dark} setDark={setDark} lang={lang} setLang={setLang}
          onSignup={()=>setShowSignup(true)}
          onLogin={()=>setShowLogin(true)}
          session={session} profile={profile} onSignOut={handleSignOut}
        />
      )}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, paddingBottom: isMobile ? "calc(62px + env(safe-area-inset-bottom,0px))" : 0 }}>
        {/* Email confirmed banner */}
        {confirmedEmail && !session && (
          <div style={{ background:`${C.accent}15`, borderBottom:`1px solid ${C.accent}40`, padding:"12px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:18 }}>✅</span>
              <div>
                <div style={{ fontSize:13, fontWeight:800, color:C.accent, fontFamily:"'Nunito',sans-serif" }}>¡Correo confirmado!</div>
                <div style={{ fontSize:11, color:C.muted, fontFamily:"Nunito Sans,sans-serif" }}>Tu cuenta está activa. Inicia sesión para continuar.</div>
              </div>
            </div>
            <Btn onClick={()=>{ setConfirmedEmail(false); setShowLogin(true); }} C={C} size="sm">Iniciar sesión →</Btn>
          </div>
        )}
        <View C={C} t={t} setView={handleSetView} session={session} profile={profile}/>
      </div>
      {isMobile && (
        <Sidebar
          view={view} setView={handleSetView} t={t} C={C}
          dark={dark} setDark={setDark} lang={lang} setLang={setLang}
          onSignup={()=>setShowSignup(true)}
          onLogin={()=>setShowLogin(true)}
          session={session} profile={profile} onSignOut={handleSignOut}
        />
      )}
      {showSignup && (
        <SignupModal C={C} t={t} onClose={()=>setShowSignup(false)} onAuthChange={(sess)=>{ if(sess){ justLoggedIn.current=true; setSession(sess); loadProfile(sess.user.id); } }} onSwitchToLogin={()=>{setShowSignup(false);setShowLogin(true);}}/>
      )}
      {showLogin && (
        <LoginModal C={C} t={t} onClose={()=>setShowLogin(false)} onAuthChange={(sess)=>{ if(sess){ justLoggedIn.current=true; setSession(sess); loadProfile(sess.user.id); } }} onSwitchToSignup={()=>{setShowLogin(false);setShowSignup(true);}}/>
      )}

      {/* ── PASSWORD RESET MODAL ── */}
      {showResetPassword && (
        <Modal onClose={()=>setShowResetPassword(false)} C={C} width={420}>
          {resetDone ? (
            <div style={{ textAlign:"center", padding:"16px 0" }}>
              <div style={{ fontSize:52, marginBottom:12 }}>✅</div>
              <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:20, fontWeight:900, color:C.text, margin:"0 0 8px" }}>¡Contraseña actualizada!</h2>
              <p style={{ color:C.muted, fontSize:13, fontFamily:"Nunito Sans,sans-serif" }}>Ya puedes iniciar sesión con tu nueva contraseña.</p>
            </div>
          ) : (
            <>
              <div style={{ textAlign:"center", marginBottom:22 }}>
                <div style={{ fontSize:40, marginBottom:8 }}>🔑</div>
                <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:20, fontWeight:900, color:C.text, margin:"0 0 6px" }}>Nueva contraseña</h2>
                <p style={{ fontSize:12, color:C.muted, fontFamily:"Nunito Sans,sans-serif", margin:0 }}>Elige una contraseña segura para tu cuenta</p>
              </div>
              {resetError && (
                <div style={{ background:`${C.red}15`, border:`1px solid ${C.red}30`, borderRadius:10, padding:"10px 14px", fontSize:12, color:C.red, marginBottom:14, fontFamily:"Nunito Sans,sans-serif" }}>{resetError}</div>
              )}
              <Input label="Nueva contraseña" value={resetForm.password} onChange={e=>setResetForm(f=>({...f,password:e.target.value}))} type="password" icon="🔒" C={C}/>
              <div style={{ fontSize:10, color:C.muted, fontFamily:"Nunito Sans,sans-serif", marginTop:-8, marginBottom:14 }}>Mínimo 6 caracteres</div>
              <Input label="Confirmar contraseña" value={resetForm.confirm} onChange={e=>setResetForm(f=>({...f,confirm:e.target.value}))} type="password" icon="🔒" C={C}/>
              <Btn full onClick={handleResetPassword} disabled={resetLoading} C={C} size="lg">
                {resetLoading ? "Guardando..." : "Guardar nueva contraseña →"}
              </Btn>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}