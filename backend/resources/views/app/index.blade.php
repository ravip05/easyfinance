<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="EasyFinance">
<meta name="application-name" content="EasyFinance CRM">
<meta name="theme-color" content="#2563eb">
<meta name="description" content="EasyFinance CRM – Complete Loan Consultancy Platform">
<meta name="msapplication-tap-highlight" content="no">
<link rel="manifest" id="pwa-manifest">
<title>EasyFinance CRM</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap" rel="stylesheet">
<style id="pwa-styles">
/* ── Safe-area insets ── */
:root {
  --sat:env(safe-area-inset-top,0px); --sab:env(safe-area-inset-bottom,0px);
  --sal:env(safe-area-inset-left,0px); --sar:env(safe-area-inset-right,0px);
  --bottom-nav-h:0px;
}
body { padding-bottom:var(--bottom-nav-h); }

/* ── Dark mode ── */
[data-theme="dark"] {
  --bg:#0f172a; --bg2:#1a2234; --surface:#1e293b; --surface2:#253346;
  --border:#2d3f55; --border2:#3d526b;
  --text:#f1f5f9; --text2:#94a3b8; --text3:#64748b; --text4:#475569;
  --accent-light:rgba(37,99,235,.18);
  --shadow-sm:0 1px 4px rgba(0,0,0,.35); --shadow:0 4px 20px rgba(0,0,0,.45);
  --shadow-lg:0 12px 48px rgba(0,0,0,.6);
}
[data-theme="dark"] body{background:var(--bg);color:var(--text);}
[data-theme="dark"] .sidebar,[data-theme="dark"] .topbar,
[data-theme="dark"] .card,[data-theme="dark"] .stat-card,
[data-theme="dark"] .modal,[data-theme="dark"] .modal-header,
[data-theme="dark"] .modal-footer,[data-theme="dark"] .toast,
[data-theme="dark"] .fr-card,[data-theme="dark"] .fu-card,
[data-theme="dark"] .pipeline-card,[data-theme="dark"] .bottom-nav,
[data-theme="dark"] .course-card,[data-theme="dark"] .bank-policy-card,
[data-theme="dark"] .lesson-list,[data-theme="dark"] .kpi,
[data-theme="dark"] .calc-result{background:var(--surface);border-color:var(--border);}
[data-theme="dark"] .form-input,[data-theme="dark"] .form-select,
[data-theme="dark"] .form-textarea,[data-theme="dark"] .topbar-search input
{background:var(--bg2);border-color:var(--border);color:var(--text);}
[data-theme="dark"] thead th,[data-theme="dark"] .demo-accounts,
[data-theme="dark"] .tabs,[data-theme="dark"] .chip{background:var(--bg2);border-color:var(--border);}
[data-theme="dark"] .tab.active{background:var(--surface);}
[data-theme="dark"] .login-card,[data-theme="dark"] .role-btn{background:var(--surface);border-color:var(--border);}
[data-theme="dark"] .role-btn.selected,[data-theme="dark"] .nav-item.active
{background:rgba(37,99,235,.18);border-color:var(--accent);}
[data-theme="dark"] tbody tr:hover,[data-theme="dark"] .nav-item:hover,
[data-theme="dark"] .lesson-item:hover{background:var(--bg2);}
[data-theme="dark"] .btn-secondary,[data-theme="dark"] .btn-ghost
{background:var(--bg2);border-color:var(--border);color:var(--text2);}
[data-theme="dark"] .icon-btn{border-color:var(--border);color:var(--text2);}
[data-theme="dark"] .nav-item{color:var(--text2);}
[data-theme="dark"] .card-title,[data-theme="dark"] .modal-title,
[data-theme="dark"] .login-title,[data-theme="dark"] .rb-label{color:var(--text);}
[data-theme="dark"] .policy-detail-table td:first-child{color:var(--text2);}
[data-theme="dark"] .policy-detail-table td:last-child{color:var(--text);}
[data-theme="dark"] .policy-detail-table td,[data-theme="dark"] .bank-row{border-bottom-color:var(--border);}
[data-theme="dark"] .sidebar-bottom{border-top-color:var(--border);}
[data-theme="dark"] .nav-section{color:var(--text3);}
[data-theme="dark"] .user-name{color:var(--text);}
[data-theme="dark"] .user-role{color:var(--text3);}

/* ── Bottom Nav ── */
.bottom-nav{
  display:none; position:fixed; bottom:0; left:var(--sal); right:var(--sar);
  height:calc(60px + var(--sab)); padding-bottom:var(--sab);
  background:var(--surface); border-top:1px solid var(--border);
  z-index:300; box-shadow:0 -2px 16px rgba(0,0,0,.08);
  backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
}
.bottom-nav-inner{display:flex;height:60px;align-items:stretch;}
.bnav-item{
  flex:1; display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  gap:2px; cursor:pointer; padding:6px 2px;
  color:var(--text3); font-size:10px; font-weight:600;
  position:relative; -webkit-tap-highlight-color:transparent; user-select:none;
  transition:color .15s;
}
.bnav-item .bi{font-size:21px;line-height:1;transition:transform .2s cubic-bezier(.34,1.56,.64,1);}
.bnav-item.active{color:var(--accent);}
.bnav-item.active .bi{transform:scale(1.18) translateY(-1px);}
.bnav-active-bar{
  position:absolute; top:0; left:20%; right:20%; height:2.5px;
  background:var(--accent); border-radius:0 0 3px 3px;
  transform:scaleX(0); transition:transform .2s;
}
.bnav-item.active .bnav-active-bar{transform:scaleX(1);}
.bnav-dot{
  position:absolute; top:7px; right:calc(50% - 13px);
  width:7px; height:7px; border-radius:50%;
  background:var(--red); border:2px solid var(--surface);
}

/* ── Install Banner ── */
.install-banner{
  position:fixed; bottom:calc(var(--bottom-nav-h) + 10px);
  left:12px; right:12px;
  background:var(--surface); border:1px solid var(--border);
  border-radius:18px; padding:14px 16px;
  display:flex; align-items:center; gap:12px;
  box-shadow:var(--shadow-lg); z-index:1000;
  animation:ib-in .4s cubic-bezier(.34,1.56,.64,1);
}
.install-banner.hidden{display:none;}
@keyframes ib-in{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
.ib-icon{width:46px;height:46px;border-radius:12px;flex-shrink:0;
  background:linear-gradient(135deg,#2563eb,#7c3aed);
  display:flex;align-items:center;justify-content:center;font-size:22px;}
.ib-text{flex:1;min-width:0;}
.ib-title{font-size:13px;font-weight:700;color:var(--text);}
.ib-sub{font-size:11px;color:var(--text3);margin-top:1px;}
.ib-actions{display:flex;gap:6px;flex-shrink:0;}

/* ── Offline Banner ── */
.offline-bar{
  position:fixed; top:var(--topbar-h); left:0; right:0;
  background:#dc2626; color:#fff; padding:7px 16px;
  display:none; align-items:center; justify-content:center;
  gap:8px; font-size:12px; font-weight:600; z-index:500;
}
.offline-bar.show{display:flex;}

/* ── Update Banner ── */
.update-bar{
  position:fixed; top:calc(var(--topbar-h) + 8px);
  left:12px; right:12px; background:var(--accent); color:#fff;
  border-radius:12px; padding:10px 16px;
  display:none; align-items:center; justify-content:space-between;
  gap:10px; z-index:500; box-shadow:var(--shadow-lg); font-size:13px;
}
.update-bar.show{display:flex;}

/* ── Splash Screen ── */
#splash{
  position:fixed; inset:0; z-index:99999;
  background:linear-gradient(150deg,#0f172a 0%,#1e293b 50%,#162032 100%);
  display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap:14px;
  transition:opacity .5s ease;
}
#splash.out{opacity:0;pointer-events:none;}
#splash.gone{display:none;}
.sp-logo{
  width:84px; height:84px; border-radius:24px;
  background:linear-gradient(135deg,#2563eb,#7c3aed);
  display:flex; align-items:center; justify-content:center; font-size:42px;
  box-shadow:0 0 0 0 rgba(37,99,235,.5);
  animation:sp-pop .7s cubic-bezier(.34,1.56,.64,1) .15s both,
             sp-glow 2s ease 1.5s infinite;
}
@keyframes sp-pop{from{transform:scale(.5);opacity:0;}to{transform:scale(1);opacity:1;}}
@keyframes sp-glow{0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,.4);}50%{box-shadow:0 0 0 14px rgba(37,99,235,0);}}
.sp-title{font-family:"Syne",sans-serif;font-size:28px;font-weight:800;color:#fff;letter-spacing:-.5px;
  animation:sp-up .6s ease .35s both;}
.sp-sub{font-size:13px;color:rgba(255,255,255,.5);animation:sp-up .6s ease .45s both;}
@keyframes sp-up{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
.sp-bar{width:160px;height:3px;background:rgba(255,255,255,.12);border-radius:2px;
  overflow:hidden;animation:sp-up .4s ease .55s both;margin-top:6px;}
.sp-fill{height:100%;width:0;background:linear-gradient(90deg,#2563eb,#7c3aed);border-radius:2px;
  animation:sp-load 1.6s ease .65s forwards;}
@keyframes sp-load{to{width:100%;}}

/* ── PTR indicator ── */
.ptr-bar{
  position:fixed; top:calc(var(--topbar-h) + var(--sat));
  left:50%; transform:translateX(-50%) translateY(-56px);
  background:var(--surface); border:1px solid var(--border);
  border-radius:20px; padding:5px 14px; font-size:12px; color:var(--text2);
  display:flex; align-items:center; gap:6px;
  box-shadow:var(--shadow); transition:transform .3s; z-index:400;
  white-space:nowrap;
}
.ptr-bar.show{transform:translateX(-50%) translateY(6px);}

/* ── Theme toggle ── */
.theme-btn{
  background:none; border:1px solid var(--border); width:34px; height:34px;
  border-radius:8px; display:flex; align-items:center; justify-content:center;
  font-size:15px; cursor:pointer; transition:all .15s; flex-shrink:0;
}
.theme-btn:hover{border-color:var(--accent);background:var(--accent-light);}

/* ── Network dot ── */
.net-dot{
  width:8px; height:8px; border-radius:50%;
  background:var(--green); flex-shrink:0;
  box-shadow:0 0 0 0 rgba(5,150,105,.4);
  animation:net-pulse 2.5s infinite;
}
.net-dot.off{background:var(--red);animation:none;}
@keyframes net-pulse{0%{box-shadow:0 0 0 0 rgba(5,150,105,.4);}
  70%{box-shadow:0 0 0 6px rgba(5,150,105,0);}
  100%{box-shadow:0 0 0 0 rgba(5,150,105,0);}}

/* ── Haptic micro-interactions ── */
.btn:active{transform:scale(.97);}
.nav-item:active,.bnav-item:active{opacity:.75;}
.stat-card:active,.course-card:active,.bank-policy-card:active{transform:scale(.99);}

/* ── Page enter animation ── */
.page.active{animation:pg-in .22s ease;}
@keyframes pg-in{from{opacity:.3;transform:translateY(5px);}to{opacity:1;transform:translateY(0);}}

/* ── Focus ring ── */
*:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:4px;}

/* ── Skeleton shimmer ── */
.skel{
  background:linear-gradient(90deg,var(--bg2) 25%,var(--border) 50%,var(--bg2) 75%);
  background-size:200% 100%;animation:skel-sh 1.5s infinite;border-radius:6px;
}
@keyframes skel-sh{0%{background-position:200% 0;}100%{background-position:-200% 0;}}

/* ── Mobile: activate bottom nav, adjust content ── */
@media(max-width:900px){
  .bottom-nav{display:block;}
  :root{--bottom-nav-h:calc(60px + var(--sab));}
  .toast-container{bottom:calc(var(--bottom-nav-h) + 10px);}
  .install-banner{bottom:calc(var(--bottom-nav-h) + 10px);}
  .content{padding-bottom:calc(20px + var(--bottom-nav-h));}
}
@media(max-width:600px){.content{padding-bottom:calc(14px + var(--bottom-nav-h));}}

/* ── Standalone display mode ── */
@media(display-mode:standalone){
  .install-banner{display:none!important;}
  .topbar{padding-top:var(--sat);}
  .sidebar{padding-top:var(--sat);}
}

/* ── Reduced motion ── */
@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important;}
}

/* ── Virtual keyboard open: hide bottom nav ── */
@media(max-height:480px){
  .bottom-nav{display:none!important;}
  :root{--bottom-nav-h:0px!important;}
}
</style>
<style>
/* ===== LOGIN SCREEN ===== */
.login-screen {
  position: fixed; inset: 0; z-index: 9999;
  background: linear-gradient(135deg, #1e3a5f 0%, #1e293b 40%, #0f172a 100%);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.login-screen.hidden { display: none; }
.login-card {
  background: #fff; border-radius: 20px; width: 100%; max-width: 440px;
  padding: 40px 36px; box-shadow: 0 24px 80px rgba(0,0,0,0.4);
}
.login-logo { display:flex; align-items:center; gap:12px; margin-bottom:28px; }
.login-logo-icon {
  width:46px; height:46px; border-radius:12px;
  background: linear-gradient(135deg,#2563eb,#7c3aed);
  display:flex; align-items:center; justify-content:center; font-size:22px;
}
.login-logo-text { font-family:'Syne',sans-serif; font-size:20px; font-weight:800; color:#1e293b; line-height:1.1; }
.login-logo-text span { display:block; font-size:12px; font-weight:400; color:#94a3b8; }
.login-title { font-family:'Syne',sans-serif; font-size:24px; font-weight:800; color:#1e293b; margin-bottom:6px; }
.login-sub { font-size:13px; color:#64748b; margin-bottom:28px; }
.login-role-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:24px; }
.role-btn {
  border:2px solid #e2e8f0; border-radius:10px; padding:10px 8px;
  text-align:center; cursor:pointer; transition:all 0.15s; background:#f8fafc;
}
.role-btn:hover { border-color:#2563eb; background:#eff6ff; }
.role-btn.selected { border-color:#2563eb; background:#eff6ff; }
.role-btn .rb-icon { font-size:22px; margin-bottom:4px; }
.role-btn .rb-label { font-size:12px; font-weight:600; color:#1e293b; }
.role-btn .rb-sub { font-size:10px; color:#94a3b8; margin-top:1px; }
.login-divider { text-align:center; font-size:12px; color:#94a3b8; margin:16px 0; position:relative; }
.login-divider::before, .login-divider::after { content:''; position:absolute; top:50%; width:42%; height:1px; background:#e2e8f0; }
.login-divider::before { left:0; } .login-divider::after { right:0; }
.login-error { background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:10px 12px; font-size:12px; color:#dc2626; margin-bottom:14px; display:none; }
.login-error.show { display:block; }
.demo-accounts { background:#f0f4f9; border-radius:10px; padding:12px 14px; margin-top:16px; }
.demo-accounts-title { font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:8px; }
.demo-row { display:flex; align-items:center; justify-content:space-between; padding:4px 0; border-bottom:1px solid #e2e8f0; font-size:12px; }
.demo-row:last-child { border-bottom:none; }
.demo-row .demo-name { font-weight:600; color:#1e293b; }
.demo-row .demo-creds { color:#64748b; }
.demo-row .demo-fill { cursor:pointer; color:#2563eb; font-size:11px; font-weight:600; }
.demo-row .demo-fill:hover { text-decoration:underline; }
/* ===== ROLE BADGE IN TOPBAR ===== */
.role-pill {
  display:inline-flex; align-items:center; gap:5px;
  padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700;
}
.rp-admin { background:#fef2f2; color:#991b1b; }
.rp-manager { background:#eff6ff; color:#1d4ed8; }
.rp-staff { background:#ecfdf5; color:#065f46; }
.rp-dsa { background:#fff7ed; color:#9a3412; }
/* ===== LMS STYLES ===== */
.lms-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
.course-card {
  background:#fff; border:1px solid #e2e8f0; border-radius:14px;
  overflow:hidden; cursor:pointer; transition:all 0.15s; box-shadow:0 1px 3px rgba(0,0,0,0.06);
}
.course-card:hover { box-shadow:0 8px 24px rgba(0,0,0,0.1); transform:translateY(-2px); border-color:#2563eb; }
.course-thumb {
  height:110px; display:flex; align-items:center; justify-content:center; font-size:44px;
  position:relative; overflow:hidden;
}
.course-body { padding:14px; }
.course-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; color:#1e293b; margin-bottom:4px; line-height:1.3; }
.course-meta { font-size:11px; color:#94a3b8; display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:10px; }
.course-progress { height:5px; background:#e2e8f0; border-radius:3px; overflow:hidden; margin-bottom:8px; }
.course-progress-fill { height:100%; border-radius:3px; transition:width 0.6s; }
.course-footer { display:flex; align-items:center; justify-content:space-between; }
.course-badge { font-size:10px; font-weight:700; padding:2px 8px; border-radius:10px; }
.cb-beginner { background:#ecfdf5; color:#065f46; }
.cb-intermediate { background:#eff6ff; color:#1d4ed8; }
.cb-advanced { background:#fef2f2; color:#991b1b; }
.lesson-list { border:1px solid #e2e8f0; border-radius:10px; overflow:hidden; }
.lesson-item {
  display:flex; align-items:center; gap:12px; padding:12px 16px;
  border-bottom:1px solid #e2e8f0; cursor:pointer; transition:background 0.12s;
}
.lesson-item:last-child { border-bottom:none; }
.lesson-item:hover { background:#f8fafc; }
.lesson-icon { width:34px; height:34px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
.li-video { background:#fef2f2; }
.li-pdf { background:#fff7ed; }
.li-quiz { background:#eff6ff; }
.li-text { background:#ecfdf5; }
.lesson-done { width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; flex-shrink:0; margin-left:auto; }
.ld-done { background:#ecfdf5; color:#059669; }
.ld-pending { background:#f1f5f9; color:#94a3b8; }
/* ===== BANK POLICY STYLES ===== */
.bank-policy-card {
  background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:18px;
  cursor:pointer; transition:all 0.15s; box-shadow:0 1px 3px rgba(0,0,0,0.05);
}
.bank-policy-card:hover { border-color:#2563eb; box-shadow:0 4px 16px rgba(37,99,235,0.1); }
.bp-header { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
.bp-logo { width:44px; height:44px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; flex-shrink:0; }
.policy-detail-table { width:100%; font-size:12px; }
.policy-detail-table td { padding:5px 0; border-bottom:1px solid #f1f5f9; }
.policy-detail-table td:first-child { color:#64748b; width:50%; }
.policy-detail-table td:last-child { font-weight:600; color:#1e293b; }
.policy-detail-table tr:last-child td { border-bottom:none; }
/* Responsive extras */
@media(max-width:900px) { .lms-grid { grid-template-columns:1fr 1fr; } }
@media(max-width:600px) { .lms-grid { grid-template-columns:1fr; } .login-role-grid { grid-template-columns:1fr 1fr; } .login-card { padding:28px 20px; } }
@media(max-width:380px) { .login-role-grid { grid-template-columns:1fr 1fr; } }
</style>
<style>
/* ===== RESET & BASE ===== */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 16px; scroll-behavior: smooth; }
body {
  font-family: 'DM Sans', sans-serif;
  background: #f0f4f9;
  color: #1e293b;
  min-height: 100vh;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}
h1,h2,h3,h4,h5,h6 { font-family: 'Syne', sans-serif; }
a { text-decoration: none; }
button { cursor: pointer; font-family: 'DM Sans', sans-serif; }
img { max-width: 100%; }

/* ===== CSS VARIABLES ===== */
:root {
  --bg: #f0f4f9;
  --bg2: #e8edf5;
  --surface: #ffffff;
  --surface2: #f8fafc;
  --border: #e2e8f0;
  --border2: #cbd5e1;

  --accent: #2563eb;
  --accent-light: #eff6ff;
  --accent-hover: #1d4ed8;
  --green: #059669;
  --green-light: #ecfdf5;
  --gold: #d97706;
  --gold-light: #fffbeb;
  --purple: #7c3aed;
  --purple-light: #f5f3ff;
  --red: #dc2626;
  --red-light: #fef2f2;
  --orange: #ea580c;
  --orange-light: #fff7ed;
  --cyan: #0891b2;
  --cyan-light: #ecfeff;

  --text: #1e293b;
  --text2: #475569;
  --text3: #94a3b8;
  --text4: #cbd5e1;

  --sidebar-w: 248px;
  --topbar-h: 60px;
  --radius: 12px;
  --radius-sm: 8px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05);
  --shadow: 0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
  --shadow-lg: 0 10px 40px rgba(0,0,0,0.12);
}

/* ===== SIDEBAR ===== */
.sidebar {
  position: fixed;
  left: 0; top: 0; bottom: 0;
  width: var(--sidebar-w);
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  z-index: 200;
  transition: transform 0.3s cubic-bezier(0.4,0,0.2,1), width 0.3s;
  overflow: hidden;
}
.sidebar-logo {
  height: var(--topbar-h);
  display: flex; align-items: center;
  padding: 0 18px; gap: 10px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.logo-icon {
  width: 34px; height: 34px; border-radius: 9px;
  background: linear-gradient(135deg, var(--accent), var(--purple));
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(37,99,235,0.3);
}
.logo-text { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 14px; color: var(--text); line-height: 1.1; }
.logo-text span { display: block; font-size: 10px; font-weight: 400; color: var(--text3); font-family: 'DM Sans', sans-serif; }
.sidebar-nav { flex: 1; overflow-y: auto; padding: 10px 0; }
.sidebar-nav::-webkit-scrollbar { width: 0; }
.nav-group { margin-bottom: 4px; }
.nav-section {
  padding: 12px 18px 4px;
  font-size: 10px; font-weight: 700;
  color: var(--text3); text-transform: uppercase; letter-spacing: 1.2px;
}
.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 18px;
  cursor: pointer; color: var(--text2);
  font-size: 13.5px; font-weight: 500;
  transition: all 0.15s; border-radius: 0;
  position: relative; white-space: nowrap;
}
.nav-item:hover { background: var(--bg); color: var(--accent); }
.nav-item.active {
  background: var(--accent-light); color: var(--accent); font-weight: 600;
}
.nav-item.active::before {
  content: ''; position: absolute; left: 0; top: 6px; bottom: 6px;
  width: 3px; border-radius: 0 3px 3px 0;
  background: var(--accent);
}
.nav-icon { font-size: 16px; width: 20px; text-align: center; flex-shrink: 0; }
.nav-label { flex: 1; }
.nav-badge {
  font-size: 10px; font-weight: 700; padding: 2px 7px;
  border-radius: 20px; flex-shrink: 0;
}
.nb-orange { background: var(--orange-light); color: var(--orange); }
.nb-green { background: var(--green-light); color: var(--green); }
.nb-blue { background: var(--accent-light); color: var(--accent); }
.sidebar-bottom {
  border-top: 1px solid var(--border);
  padding: 12px 18px;
  display: flex; align-items: center; gap: 10px;
  flex-shrink: 0;
}
.user-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: linear-gradient(135deg, var(--purple), var(--accent));
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: white;
  flex-shrink: 0;
}
.user-name { font-size: 13px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { font-size: 11px; color: var(--text3); }
.sidebar-overlay {
  display: none;
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  z-index: 199; backdrop-filter: blur(2px);
}

/* ===== MAIN LAYOUT ===== */
.main { margin-left: var(--sidebar-w); min-height: 100vh; display: flex; flex-direction: column; }

/* ===== TOPBAR ===== */
.topbar {
  position: sticky; top: 0; z-index: 100;
  height: var(--topbar-h);
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center;
  padding: 0 24px; gap: 12px;
  box-shadow: var(--shadow-sm);
}
.hamburger {
  display: none;
  background: none; border: none;
  font-size: 20px; padding: 4px; color: var(--text2);
  flex-shrink: 0;
}
.topbar-title { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.topbar-search {
  position: relative; flex: 0 1 260px;
}
.topbar-search input {
  width: 100%; padding: 8px 12px 8px 34px;
  border: 1px solid var(--border); border-radius: 8px;
  background: var(--bg); color: var(--text);
  font-size: 13px; font-family: 'DM Sans', sans-serif;
  outline: none; transition: border-color 0.15s;
}
.topbar-search input:focus { border-color: var(--accent); background: white; }
.topbar-search::before { content: '🔍'; position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-size: 13px; pointer-events: none; }
.topbar-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.icon-btn {
  position: relative; background: none; border: 1px solid var(--border);
  width: 36px; height: 36px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; color: var(--text2); transition: all 0.15s;
}
.icon-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
.notif-dot { position: absolute; top: 5px; right: 5px; width: 7px; height: 7px; background: var(--red); border-radius: 50%; border: 2px solid white; }

/* ===== CONTENT ===== */
.content { flex: 1; padding: 24px; }

/* ===== BUTTONS ===== */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 8px 16px; border-radius: 8px;
  font-size: 13px; font-weight: 500; border: none;
  transition: all 0.15s; white-space: nowrap;
  font-family: 'DM Sans', sans-serif;
}
.btn-primary { background: var(--accent); color: white; }
.btn-primary:hover { background: var(--accent-hover); box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
.btn-secondary { background: var(--surface); color: var(--text2); border: 1px solid var(--border); }
.btn-secondary:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
.btn-success { background: var(--green); color: white; }
.btn-success:hover { background: #047857; }
.btn-danger { background: var(--red); color: white; }
.btn-danger:hover { background: #b91c1c; }
.btn-ghost { background: none; color: var(--text2); border: 1px solid var(--border); }
.btn-ghost:hover { background: var(--bg); color: var(--accent); border-color: var(--accent); }
.btn-sm { padding: 5px 10px; font-size: 12px; border-radius: 6px; gap: 4px; }
.btn-xs { padding: 3px 8px; font-size: 11px; border-radius: 5px; }

/* ===== CARDS ===== */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 8px; flex-wrap: wrap; }
.card-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: var(--text); }
.card-sub { font-size: 12px; color: var(--text3); margin-top: 1px; }

/* ===== STAT CARDS ===== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}
.stat-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 18px 20px;
  position: relative; overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s, transform 0.2s;
}
.stat-card:hover { box-shadow: var(--shadow); transform: translateY(-1px); }
.stat-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.stat-icon-wrap {
  width: 40px; height: 40px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; font-size: 18px;
}
.stat-icon-wrap.blue { background: var(--accent-light); }
.stat-icon-wrap.green { background: var(--green-light); }
.stat-icon-wrap.gold { background: var(--gold-light); }
.stat-icon-wrap.purple { background: var(--purple-light); }
.stat-icon-wrap.orange { background: var(--orange-light); }
.stat-icon-wrap.cyan { background: var(--cyan-light); }
.stat-label { font-size: 12px; color: var(--text2); font-weight: 500; margin-bottom: 4px; }
.stat-value { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; line-height: 1.1; color: var(--text); }
.stat-sub { font-size: 11px; color: var(--text3); margin-top: 3px; }
.stat-sub.up { color: var(--green); }
.stat-sub.down { color: var(--red); }

/* ===== GRIDS ===== */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

/* ===== TABLES ===== */
.table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 500px; }
thead th {
  padding: 10px 14px; text-align: left;
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.6px; color: var(--text3);
  background: var(--surface2); border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
thead th:first-child { border-radius: 8px 0 0 0; }
thead th:last-child { border-radius: 0 8px 0 0; }
tbody td { padding: 11px 14px; border-bottom: 1px solid var(--border); vertical-align: middle; }
tbody tr:last-child td { border-bottom: none; }
tbody tr:hover { background: #f8fafc; }
.td-name { display: flex; align-items: center; gap: 8px; }
.mini-avatar {
  width: 30px; height: 30px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700; color: white; flex-shrink: 0;
  background: linear-gradient(135deg, var(--accent), var(--purple));
}

/* ===== BADGES ===== */
.badge { display: inline-block; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; white-space: nowrap; }
.badge-new { background: #eff6ff; color: #1d4ed8; }
.badge-contacted { background: #f5f3ff; color: #6d28d9; }
.badge-docs { background: #fffbeb; color: #92400e; }
.badge-login { background: #fff7ed; color: #9a3412; }
.badge-cibil { background: #ecfeff; color: #164e63; }
.badge-processing { background: #f5f3ff; color: #5b21b6; }
.badge-sanction { background: #ecfdf5; color: #065f46; }
.badge-disbursed { background: #ecfeff; color: #0e7490; }
.badge-closed { background: #f1f5f9; color: #475569; }
.badge-active { background: #ecfdf5; color: #065f46; }
.badge-inactive { background: #fef2f2; color: #991b1b; }
.badge-high { background: #fef2f2; color: #991b1b; }
.badge-med { background: #fffbeb; color: #92400e; }
.badge-low { background: #ecfdf5; color: #065f46; }
.badge-excellent { background: #ecfdf5; color: #065f46; }
.badge-good { background: #ecfeff; color: #0e7490; }
.badge-fair { background: #fffbeb; color: #92400e; }
.badge-poor { background: #fef2f2; color: #991b1b; }

/* ===== FORMS ===== */
.form-group { margin-bottom: 14px; }
.form-label { display: block; font-size: 12px; font-weight: 600; color: var(--text2); margin-bottom: 5px; }
.form-label .req { color: var(--red); }
.form-input, .form-select, .form-textarea {
  width: 100%; padding: 9px 12px;
  border: 1px solid var(--border); border-radius: 8px;
  background: var(--surface); color: var(--text);
  font-size: 13px; font-family: 'DM Sans', sans-serif;
  outline: none; transition: border-color 0.15s, box-shadow 0.15s;
}
.form-input:focus, .form-select:focus, .form-textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
}
.form-select { cursor: pointer; appearance: auto; }
.form-textarea { resize: vertical; min-height: 80px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }

/* ===== PAGES ===== */
.page { display: none; animation: fadeUp 0.25s ease; }
.page.active { display: block; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

/* ===== TABS ===== */
.tabs {
  display: flex; gap: 2px;
  background: var(--bg2); border-radius: 10px;
  padding: 4px; margin-bottom: 18px;
  flex-wrap: wrap;
}
.tab {
  padding: 7px 16px; border-radius: 7px;
  font-size: 13px; font-weight: 500;
  cursor: pointer; color: var(--text2);
  transition: all 0.15s; white-space: nowrap;
}
.tab.active {
  background: var(--surface); color: var(--accent);
  font-weight: 600; box-shadow: var(--shadow-sm);
}

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  z-index: 500; display: none;
  align-items: center; justify-content: center;
  padding: 16px;
  backdrop-filter: blur(4px);
}
.modal-overlay.open { display: flex; }
.modal {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 16px; width: 100%; max-width: 560px;
  max-height: 92vh; overflow-y: auto;
  box-shadow: var(--shadow-lg);
  animation: modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.94) translateY(12px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.modal-header {
  padding: 18px 22px 14px;
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  position: sticky; top: 0; background: var(--surface); z-index: 2;
}
.modal-title { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; }
.modal-close {
  background: var(--bg); border: 1px solid var(--border);
  width: 30px; height: 30px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; color: var(--text2); cursor: pointer;
  transition: all 0.15s; flex-shrink: 0;
}
.modal-close:hover { background: var(--red-light); border-color: var(--red); color: var(--red); }
.modal-body { padding: 18px 22px; }
.modal-footer {
  padding: 12px 22px; border-top: 1px solid var(--border);
  display: flex; gap: 8px; justify-content: flex-end;
  flex-wrap: wrap;
}

/* ===== PIPELINE ===== */
.pipeline-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; padding-bottom: 8px; }
.pipeline { display: flex; gap: 12px; min-width: max-content; }
.pipeline-col { width: 200px; flex-shrink: 0; }
.pipeline-header {
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.5px;
  padding: 8px 12px; border-radius: 8px; margin-bottom: 10px;
  display: flex; align-items: center; justify-content: space-between;
}
.ph-new { background: #eff6ff; color: #1d4ed8; }
.ph-contacted { background: #f5f3ff; color: #6d28d9; }
.ph-docs { background: #fffbeb; color: #92400e; }
.ph-login { background: #fff7ed; color: #9a3412; }
.ph-processing { background: #fdf4ff; color: #6b21a8; }
.ph-sanction { background: #ecfdf5; color: #065f46; }
.ph-disbursed { background: #ecfeff; color: #0e7490; }
.pipeline-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 10px; padding: 12px; margin-bottom: 8px;
  cursor: pointer; transition: all 0.15s; box-shadow: var(--shadow-sm);
}
.pipeline-card:hover { border-color: var(--accent); box-shadow: var(--shadow); transform: translateY(-1px); }
.pc-name { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 2px; }
.pc-meta { font-size: 11px; color: var(--text3); }
.pc-amount { font-size: 12px; color: var(--green); font-weight: 600; margin-top: 6px; }
.pc-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; font-size: 10px; color: var(--text3); }

/* ===== PROGRESS ===== */
.progress-bar { height: 6px; background: var(--bg2); border-radius: 10px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 10px; transition: width 0.6s ease; }

/* ===== TIMELINE ===== */
.timeline { position: relative; padding-left: 28px; }
.timeline::before { content: ''; position: absolute; left: 8px; top: 4px; bottom: 4px; width: 2px; background: var(--border); border-radius: 1px; }
.timeline-item { position: relative; margin-bottom: 20px; }
.timeline-dot {
  position: absolute; left: -24px; top: 3px;
  width: 14px; height: 14px; border-radius: 50%;
  border: 2px solid var(--accent); background: var(--surface);
}
.timeline-title { font-size: 13px; font-weight: 600; color: var(--text); }
.timeline-time { font-size: 11px; color: var(--text3); margin-top: 1px; }
.timeline-desc { font-size: 12px; color: var(--text2); margin-top: 3px; }

/* ===== RANGE SLIDER ===== */
input[type=range] {
  width: 100%; height: 4px; cursor: pointer;
  accent-color: var(--accent); margin: 6px 0;
}

/* ===== CALC RESULT ===== */
.calc-result {
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: 10px; padding: 16px; margin-top: 14px;
}
.calc-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 7px 0; font-size: 13px;
  border-bottom: 1px solid var(--border);
}
.calc-row:last-child { border-bottom: none; font-weight: 700; font-size: 14px; }
.calc-row:last-child .calc-val { color: var(--accent); font-size: 18px; }
.calc-lbl { color: var(--text2); }
.calc-val { font-weight: 600; color: var(--text); }

/* ===== FRANCHISE CARD ===== */
.fr-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 12px; padding: 18px;
  box-shadow: var(--shadow-sm); transition: all 0.15s;
}
.fr-card:hover { border-color: var(--accent); box-shadow: var(--shadow); }
.fr-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-top: 12px; text-align: center; }
.fr-stat-val { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 800; }
.fr-stat-lbl { font-size: 10px; color: var(--text3); margin-top: 1px; }

/* ===== FOLLOW-UP CARDS ===== */
.followup-scroll { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; -webkit-overflow-scrolling: touch; }
.followup-scroll::-webkit-scrollbar { height: 0; }
.fu-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 10px; padding: 13px 15px;
  min-width: 200px; flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}
.fu-card.overdue { border-left: 3px solid var(--red); }
.fu-card.today { border-left: 3px solid var(--gold); }
.fu-card.upcoming { border-left: 3px solid var(--accent); }
.fu-card.done { border-left: 3px solid var(--green); }

/* ===== SCORE GAUGE ===== */
.score-gauge {
  width: 148px; height: 148px; border-radius: 50%;
  margin: 0 auto 14px;
  display: flex; align-items: center; justify-content: center;
  position: relative;
}
.score-inner {
  width: 106px; height: 106px; border-radius: 50%;
  background: var(--surface);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  box-shadow: var(--shadow-sm);
  z-index: 1;
}
.score-num { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; line-height: 1; }
.score-lbl { font-size: 10px; color: var(--text3); margin-top: 2px; }

/* ===== DONUT SVG ===== */
.donut-chart { position: relative; width: 120px; height: 120px; flex-shrink: 0; }
.donut-chart svg { transform: rotate(-90deg); }
.donut-center {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}

/* ===== PROFILE ===== */
.profile-hd { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
.profile-av {
  width: 58px; height: 58px; border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--purple));
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; font-weight: 700; color: white; flex-shrink: 0;
  font-family: 'Syne', sans-serif;
}
.profile-name { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; }
.profile-meta { font-size: 13px; color: var(--text2); margin-top: 3px; }

/* ===== KPI ROW ===== */
.kpi-row { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 18px; }
.kpi {
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: 10px; padding: 12px 16px; min-width: 110px;
}
.kpi-val { font-family: 'Syne', sans-serif; font-size: 19px; font-weight: 800; color: var(--text); }
.kpi-lbl { font-size: 11px; color: var(--text3); margin-top: 2px; }

/* ===== FILTER BAR ===== */
.filter-bar { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 16px; }
.filter-bar .form-select, .filter-bar .form-input { width: auto; flex: 1; min-width: 120px; max-width: 180px; }
.filter-bar .search-wrap { flex: 1; min-width: 180px; position: relative; }
.filter-bar .search-wrap input { width: 100%; padding-left: 32px; }
.filter-bar .search-wrap::before { content: '🔍'; position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-size: 12px; pointer-events: none; }

/* ===== TOAST ===== */
.toast-container { position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; max-width: calc(100vw - 40px); }
.toast {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 10px; padding: 12px 16px;
  font-size: 13px; display: flex; align-items: center; gap: 10px;
  box-shadow: var(--shadow-lg); min-width: 240px;
  animation: toastIn 0.3s ease;
}
@keyframes toastIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
.toast.success { border-left: 3px solid var(--green); }
.toast.info { border-left: 3px solid var(--accent); }
.toast.error { border-left: 3px solid var(--red); }

/* ===== CHIP ===== */
.chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;
  background: var(--surface); border: 1px solid var(--border);
  color: var(--text2); cursor: pointer; transition: all 0.15s; white-space: nowrap;
}
.chip:hover { border-color: var(--accent); color: var(--accent); }
.chip.active { border-color: var(--accent); color: var(--accent); background: var(--accent-light); font-weight: 600; }

/* ===== EMPTY STATE ===== */
.empty { text-align: center; padding: 40px 20px; color: var(--text3); }
.empty .empty-icon { font-size: 40px; margin-bottom: 10px; }
.empty .empty-text { font-size: 14px; }

/* ===== SECTION DIVIDER ===== */
.section-gap { margin-bottom: 18px; }

/* ===== SCROLLBARS ===== */
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 10px; }

/* ===== BANK COMPARE ===== */
.bank-row {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 0; border-bottom: 1px solid var(--border);
}
.bank-row:last-child { border-bottom: none; }
.bank-tag {
  width: 52px; height: 28px; border-radius: 6px;
  background: var(--bg2); display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800; flex-shrink: 0;
}
.bank-emi { font-size: 14px; font-weight: 700; }

/* ===== RESPONSIVE ===== */
/* Large tablets / small desktops */
@media (max-width: 1200px) {
  :root { --sidebar-w: 220px; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
}

/* Tablets */
@media (max-width: 900px) {
  :root { --sidebar-w: 0px; --topbar-h: 56px; }
  .sidebar { transform: translateX(-248px); width: 248px; }
  .sidebar.open { transform: translateX(0); box-shadow: var(--shadow-lg); }
  .sidebar-overlay.open { display: block; }
  .main { margin-left: 0; }
  .hamburger { display: flex; }
  .topbar-search { flex: 0 1 200px; }
  .content { padding: 16px; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .grid-2 { grid-template-columns: 1fr; }
  .grid-3 { grid-template-columns: 1fr; }
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
  .form-grid { grid-template-columns: 1fr; }
  .form-row { grid-template-columns: 1fr; }
  .topbar-actions .btn-primary span { display: none; }
}

/* Large phones */
@media (max-width: 600px) {
  :root { --topbar-h: 52px; }
  .topbar { padding: 0 14px; gap: 8px; }
  .topbar-title { font-size: 15px; }
  .topbar-search { display: none; }
  .content { padding: 12px; }
  .card { padding: 14px; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .stat-value { font-size: 22px; }
  .stat-card { padding: 14px; }
  .grid-4 { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .modal { border-radius: 14px; }
  .modal-body { padding: 14px 16px; }
  .modal-footer { padding: 10px 16px; }
  .tabs { overflow-x: auto; flex-wrap: nowrap; }
  .tabs::-webkit-scrollbar { height: 0; }
  .tab { flex-shrink: 0; }
  .kpi-row { gap: 8px; }
  .kpi { min-width: 90px; }
  .filter-bar { gap: 6px; }
  .filter-bar .form-select { max-width: 140px; }
  .profile-hd { gap: 12px; }
  .profile-av { width: 48px; height: 48px; font-size: 16px; }
  .profile-name { font-size: 17px; }
  table { font-size: 12px; }
  thead th { padding: 8px 10px; }
  tbody td { padding: 9px 10px; }
}

/* Small phones */
@media (max-width: 380px) {
  .stats-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
  .stat-value { font-size: 20px; }
  .grid-4 { grid-template-columns: 1fr 1fr; }
  .btn { padding: 6px 12px; font-size: 12px; }
  .card { padding: 12px; }
  .content { padding: 10px; }
}

/* Print */
@media print {
  .sidebar, .topbar, .hamburger, .sidebar-overlay { display: none !important; }
  .main { margin-left: 0 !important; }
  .content { padding: 0 !important; }
  .btn { display: none !important; }
}
</style>
</head>
<body>

<!-- ── SPLASH ── -->
<div id="splash">
  <div class="sp-logo">💰</div>
  <div class="sp-title">EasyFinance CRM</div>
  <div class="sp-sub">Loan Consultancy Platform</div>
  <div class="sp-bar"><div class="sp-fill"></div></div>
</div>

<!-- ── OFFLINE BAR ── -->
<div class="offline-bar" id="offline-bar">
  <span>📡</span><span>You're offline — cached data shown</span>
</div>

<!-- ── UPDATE BAR ── -->
<div class="update-bar" id="update-bar">
  <span style="flex:1;">🔄 A new version is ready</span>
  <button class="btn btn-sm" style="background:#fff;color:#2563eb;padding:5px 12px;border-radius:6px;" onclick="doUpdate()">Update</button>
  <button onclick="document.getElementById('update-bar').classList.remove('show')" style="background:none;border:none;color:#fff;font-size:20px;cursor:pointer;line-height:1;">×</button>
</div>

<!-- ── PTR BAR ── -->
<div class="ptr-bar" id="ptr-bar">
  <span id="ptr-icon">↓</span><span id="ptr-text">Pull to refresh</span>
</div>

<!-- ── INSTALL BANNER ── -->
<div class="install-banner hidden" id="install-banner">
  <div class="ib-icon">💰</div>
  <div class="ib-text">
    <div class="ib-title">Install EasyFinance CRM</div>
    <div class="ib-sub">Works offline · Add to home screen</div>
  </div>
  <div class="ib-actions">
    <button class="btn btn-ghost btn-sm" onclick="dismissInstall()">Later</button>
    <button class="btn btn-primary btn-sm" onclick="triggerInstall()">Install</button>
  </div>
</div>


<!-- ===== LOGIN SCREEN ===== -->
<div class="login-screen" id="login-screen">
  <div class="login-card">
    <div class="login-logo">
      <div class="login-logo-icon">💰</div>
      <div class="login-logo-text">EasyFinance CRM <span>Loan Consultancy Platform</span></div>
    </div>
    <div class="login-title">Welcome back 👋</div>
    <div class="login-sub">Select your role and sign in to continue</div>

    <div class="login-role-grid" id="role-select-grid">
      <div class="role-btn selected" onclick="selectRole('admin',this)" data-role="admin">
        <div class="rb-icon">🛡️</div>
        <div class="rb-label">Super Admin</div>
        <div class="rb-sub">Full access</div>
      </div>
      <div class="role-btn" onclick="selectRole('manager',this)" data-role="manager">
        <div class="rb-icon">👔</div>
        <div class="rb-label">Manager</div>
        <div class="rb-sub">Team lead</div>
      </div>
      <div class="role-btn" onclick="selectRole('staff',this)" data-role="staff">
        <div class="rb-icon">👤</div>
        <div class="rb-label">Staff / Executive</div>
        <div class="rb-sub">Field agent</div>
      </div>
      <div class="role-btn" onclick="selectRole('dsa',this)" data-role="dsa">
        <div class="rb-icon">🤝</div>
        <div class="rb-label">DSA / Franchise</div>
        <div class="rb-sub">Partner</div>
      </div>
    </div>

    <div class="form-group">
      <div class="form-label">Email / Username</div>
      <input class="form-input" id="login-email" placeholder="Enter your email" type="email" value="admin@easyfinancewale.in">
    </div>
    <div class="form-group">
      <div class="form-label">Password</div>
      <div style="position:relative;">
        <input class="form-input" id="login-pass" placeholder="Enter password" type="password" value="admin123" style="padding-right:40px;">
        <button onclick="togglePassView()" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;font-size:16px;cursor:pointer;" id="pass-eye">👁</button>
      </div>
    </div>
    <div class="login-error" id="login-error">Invalid credentials. Please try again.</div>
    <button class="btn btn-primary" style="width:100%;padding:11px;font-size:14px;" onclick="doLogin()">Sign In →</button>

    <div class="demo-accounts">
      <div class="demo-accounts-title">Demo Accounts</div>
      <div class="demo-row">
        <span class="demo-name">🛡️ Admin</span>
        <span class="demo-creds"><a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="ff9e9b929691bf9a9e8c869996919e919c9a889e939ad19691">[email&#160;protected]</a> / admin123</span>
        <span class="demo-fill" onclick="fillDemo('admin@easyfinancewale.in','admin123','admin')">Use</span>
      </div>
      <div class="demo-row">
        <span class="demo-name">👔 Manager</span>
        <span class="demo-creds"><a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="7505071c0c14351014060c131c1b141b1610021419105b1c1b">[email&#160;protected]</a> / mgr123</span>
        <span class="demo-fill" onclick="fillDemo('priya@easyfinancewale.in','mgr123','manager')">Use</span>
      </div>
      <div class="demo-row">
        <span class="demo-name">👤 Staff</span>
        <span class="demo-creds"><a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="dbbab6b2af9bbebaa8a2bdb2b5bab5b8beacbab7bef5b2b5">[email&#160;protected]</a> / staff123</span>
        <span class="demo-fill" onclick="fillDemo('amit@easyfinancewale.in','staff123','staff')">Use</span>
      </div>
      <div class="demo-row">
        <span class="demo-name">🤝 DSA</span>
        <span class="demo-creds"><a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="deb3abb3bcbfb7baadbf9ebbbfada7b8b7b0bfb0bdbba9bfb2bbf0b7b0">[email&#160;protected]</a> / dsa123</span>
        <span class="demo-fill" onclick="fillDemo('mumbaidsa@easyfinancewale.in','dsa123','dsa')">Use</span>
      </div>
    </div>
  </div>
</div>

<!-- ===== SIDEBAR OVERLAY ===== -->
<div class="sidebar-overlay" id="sidebar-overlay" onclick="closeSidebar()"></div>

<!-- ===== SIDEBAR ===== -->
<aside class="sidebar" id="sidebar">
  <div class="sidebar-logo">
    <div class="logo-icon">💰</div>
    <div class="logo-text">EasyFinance <span>Loan CRM · v2.0</span></div>
  </div>
  <nav class="sidebar-nav" id="sidebar-nav">
    <!-- Rendered dynamically by buildSidebar() -->
  </nav>
  <div class="sidebar-bottom">
    <div class="user-avatar" id="sb-avatar">AD</div>
    <div style="flex:1;min-width:0;">
      <div class="user-name" id="sb-name">Admin User</div>
      <div class="user-role" id="sb-role-lbl">Super Admin</div>
    </div>
    <button class="icon-btn" title="Admin Settings" onclick="showPage('settings',document.querySelector('[data-page=settings]'))" style="flex-shrink:0;" id="sb-settings-btn">⚙️</button>
  </div>
</aside>

<!-- ===== MAIN ===== -->
<main class="main">

  <!-- TOPBAR -->
  <div class="topbar">
    <button class="hamburger" onclick="toggleSidebar()" aria-label="Open menu" id="hamburger-btn">☰</button>
    <div class="topbar-title" id="page-title">Dashboard</div>
    <div class="topbar-search">
      <input type="text" placeholder="Search leads, clients…" aria-label="Search">
    </div>
    <div class="topbar-actions">
      <span class="net-dot" id="net-dot" title="Online"></span>
      <span class="role-pill" id="topbar-role-pill" style="display:none;">🛡️ Admin</span>
      <button class="theme-btn" id="theme-btn" onclick="toggleTheme()" title="Toggle dark mode" aria-label="Toggle theme">🌙</button>
      <button class="icon-btn notif-btn" title="Notifications" aria-label="Notifications">🔔<span class="notif-dot"></span></button>
      <button class="btn btn-primary btn-sm" id="topbar-new-lead-btn" onclick="openModal('modal-lead')" style="display:none;" aria-label="New lead"><span>+</span><span>New Lead</span></button>
      <button class="btn btn-ghost btn-sm" id="topbar-logout-btn" onclick="doLogout()" title="Sign out" aria-label="Sign out" style="display:none;padding:7px 8px;">🚪</button>
    </div>
  </div>
    <div class="topbar-actions">
      <span class="role-pill" id="topbar-role-pill">🛡️ Admin</span>
      <button class="icon-btn notif-btn" title="Notifications">
        🔔<span class="notif-dot"></span>
      </button>
      <button class="btn btn-primary btn-sm" id="topbar-new-lead-btn" onclick="openModal('modal-lead')">
        <span>+</span><span>New Lead</span>
      </button>
      <button class="btn btn-ghost btn-sm" onclick="doLogout()" title="Sign Out" style="padding:7px 8px;">🚪</button>
    </div>
  </div>

  <!-- CONTENT -->
  <div class="content">

    <!-- ===== DASHBOARD ===== -->
    <div id="page-dashboard" class="page active">

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card-top">
            <div><div class="stat-label">Total Leads</div><div class="stat-value">248</div><div class="stat-sub up">↑ 18 this week</div></div>
            <div class="stat-icon-wrap blue">🎯</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card-top">
            <div><div class="stat-label">Disbursed (Month)</div><div class="stat-value">₹4.2Cr</div><div class="stat-sub up">↑ 12% vs last month</div></div>
            <div class="stat-icon-wrap green">💰</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card-top">
            <div><div class="stat-label">Active Files</div><div class="stat-value">86</div><div class="stat-sub">34 pending docs</div></div>
            <div class="stat-icon-wrap gold">📁</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card-top">
            <div><div class="stat-label">Conversion Rate</div><div class="stat-value">34%</div><div class="stat-sub up">↑ 5% this quarter</div></div>
            <div class="stat-icon-wrap purple">📊</div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid-2 section-gap">
        <div class="card">
          <div class="card-header">
            <div><div class="card-title">Monthly Lead Trend</div><div class="card-sub">Last 6 months</div></div>
            <span class="badge badge-active">Live</span>
          </div>
          <div style="display:flex;align-items:flex-end;gap:8px;height:100px;" id="trend-chart"></div>
          <div style="display:flex;gap:8px;margin-top:6px;" id="trend-labels"></div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Lead Status Breakdown</div></div>
          <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;">
            <div class="donut-chart">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="48" fill="none" stroke="#e2e8f0" stroke-width="16"/>
                <circle cx="60" cy="60" r="48" fill="none" stroke="#2563eb" stroke-width="16" stroke-dasharray="108 194" stroke-dashoffset="0"/>
                <circle cx="60" cy="60" r="48" fill="none" stroke="#059669" stroke-width="16" stroke-dasharray="60 242" stroke-dashoffset="-108"/>
                <circle cx="60" cy="60" r="48" fill="none" stroke="#d97706" stroke-width="16" stroke-dasharray="48 254" stroke-dashoffset="-168"/>
                <circle cx="60" cy="60" r="48" fill="none" stroke="#7c3aed" stroke-width="16" stroke-dasharray="39 263" stroke-dashoffset="-216"/>
              </svg>
              <div class="donut-center"><span style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;">248</span><span style="font-size:10px;color:var(--text3);">Total</span></div>
            </div>
            <div style="flex:1;min-width:130px;">
              <div class="bank-row" style="font-size:13px;"><span style="display:flex;align-items:center;gap:6px;"><span style="width:10px;height:10px;border-radius:2px;background:#2563eb;display:inline-block;flex-shrink:0;"></span>New</span><strong>86</strong></div>
              <div class="bank-row" style="font-size:13px;"><span style="display:flex;align-items:center;gap:6px;"><span style="width:10px;height:10px;border-radius:2px;background:#059669;display:inline-block;flex-shrink:0;"></span>Processing</span><strong>47</strong></div>
              <div class="bank-row" style="font-size:13px;"><span style="display:flex;align-items:center;gap:6px;"><span style="width:10px;height:10px;border-radius:2px;background:#d97706;display:inline-block;flex-shrink:0;"></span>Docs Pending</span><strong>38</strong></div>
              <div class="bank-row" style="font-size:13px;"><span style="display:flex;align-items:center;gap:6px;"><span style="width:10px;height:10px;border-radius:2px;background:#7c3aed;display:inline-block;flex-shrink:0;"></span>Sanctioned</span><strong>31</strong></div>
              <div class="bank-row" style="font-size:13px; border-bottom:none;"><span style="display:flex;align-items:center;gap:6px;"><span style="width:10px;height:10px;border-radius:2px;background:#0891b2;display:inline-block;flex-shrink:0;"></span>Disbursed</span><strong>46</strong></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tables Row -->
      <div class="grid-2 section-gap">
        <div class="card">
          <div class="card-header">
            <div class="card-title">Recent Leads</div>
            <button class="btn btn-ghost btn-sm" onclick="showPage('leads',document.querySelector('[data-page=leads]'))">View All →</button>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Type</th><th>Amount</th><th>Stage</th></tr></thead>
              <tbody>
                <tr><td><div class="td-name"><div class="mini-avatar">RK</div>Rajesh Kumar</div></td><td>Home Loan</td><td style="color:var(--green);font-weight:600;">₹45L</td><td><span class="badge badge-docs">Docs Pending</span></td></tr>
                <tr><td><div class="td-name"><div class="mini-avatar" style="background:linear-gradient(135deg,#059669,#0891b2);">MP</div>Meena Patel</div></td><td>Business</td><td style="color:var(--green);font-weight:600;">₹20L</td><td><span class="badge badge-login">Login</span></td></tr>
                <tr><td><div class="td-name"><div class="mini-avatar" style="background:linear-gradient(135deg,#d97706,#ea580c);">SY</div>Suresh Yadav</div></td><td>Personal</td><td style="color:var(--green);font-weight:600;">₹5L</td><td><span class="badge badge-new">New</span></td></tr>
                <tr><td><div class="td-name"><div class="mini-avatar" style="background:linear-gradient(135deg,#7c3aed,#a21caf);">AS</div>Anika Sharma</div></td><td>Car Loan</td><td style="color:var(--green);font-weight:600;">₹8L</td><td><span class="badge badge-sanction">Sanctioned</span></td></tr>
                <tr><td><div class="td-name"><div class="mini-avatar" style="background:linear-gradient(135deg,#0891b2,#059669);">VG</div>Vivek Gupta</div></td><td>Home Loan</td><td style="color:var(--green);font-weight:600;">₹60L</td><td><span class="badge badge-disbursed">Disbursed</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">🏆 Employee Leaderboard</div></div>
          <div id="dash-leaderboard"></div>
        </div>
      </div>

      <!-- Follow-up -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">⏰ Today's Follow-ups</div>
          <span class="badge badge-high">8 pending</span>
        </div>
        <div class="followup-scroll">
          <div class="fu-card overdue">
            <div style="font-size:12px;font-weight:600;color:var(--text);">Rajesh Kumar</div>
            <div style="font-size:11px;color:var(--text2);margin-top:2px;">10:30 AM · Home Loan</div>
            <div style="font-size:11px;color:var(--red);margin-top:5px;font-weight:600;">⚠ Overdue</div>
          </div>
          <div class="fu-card today">
            <div style="font-size:12px;font-weight:600;color:var(--text);">Meena Patel</div>
            <div style="font-size:11px;color:var(--text2);margin-top:2px;">2:00 PM · Doc Collection</div>
            <div style="font-size:11px;color:var(--gold);margin-top:5px;font-weight:600;">📋 Due Today</div>
          </div>
          <div class="fu-card upcoming">
            <div style="font-size:12px;font-weight:600;color:var(--text);">Suresh Yadav</div>
            <div style="font-size:11px;color:var(--text2);margin-top:2px;">4:00 PM · CIBIL Check</div>
            <div style="font-size:11px;color:var(--accent);margin-top:5px;font-weight:600;">🔵 Scheduled</div>
          </div>
          <div class="fu-card upcoming">
            <div style="font-size:12px;font-weight:600;color:var(--text);">Deepak Nair</div>
            <div style="font-size:11px;color:var(--text2);margin-top:2px;">5:30 PM · LAP Processing</div>
            <div style="font-size:11px;color:var(--accent);margin-top:5px;font-weight:600;">🔵 Scheduled</div>
          </div>
          <div class="fu-card done">
            <div style="font-size:12px;font-weight:600;color:var(--text);">Anika Sharma</div>
            <div style="font-size:11px;color:var(--text2);margin-top:2px;">9:00 AM · Sanction Call</div>
            <div style="font-size:11px;color:var(--green);margin-top:5px;font-weight:600;">✅ Done</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== LEADS ===== -->
    <div id="page-leads" class="page">
      <div class="filter-bar">
        <div class="search-wrap">
          <input class="form-input" placeholder="Search name, phone, type...">
        </div>
        <select class="form-select">
          <option>All Stages</option>
          <option>New</option><option>Contacted</option><option>Docs Pending</option>
          <option>Docs Received</option><option>CIBIL</option><option>Login</option>
          <option>Processing</option><option>Sanctioned</option><option>Disbursed</option><option>Closed</option>
        </select>
        <select class="form-select">
          <option>All Types</option>
          <option>Home Loan</option><option>Business Loan</option><option>Personal Loan</option>
          <option>Car Loan</option><option>LAP</option><option>Insurance</option>
        </select>
        <select class="form-select">
          <option>All Employees</option>
          <option>Priya Singh</option><option>Amit Kumar</option><option>Raj Mehta</option>
        </select>
        <button class="btn btn-primary btn-sm" onclick="openModal('modal-lead')">+ Add Lead</button>
        <button class="btn btn-secondary btn-sm">⬆ Import</button>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th><input type="checkbox"></th>
                <th>Lead</th><th>Contact</th><th>Type</th><th>Amount</th>
                <th>Stage</th><th>Assigned</th><th>Priority</th><th>Follow-up</th><th>Actions</th>
              </tr>
            </thead>
            <tbody id="leads-tbody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ===== PIPELINE ===== -->
    <div id="page-pipeline" class="page">
      <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">
        <div class="chip active">All Loans</div>
        <div class="chip">Home Loan</div>
        <div class="chip">Business</div>
        <div class="chip">Personal</div>
        <div class="chip">Insurance</div>
      </div>
      <div class="pipeline-wrap">
        <div class="pipeline" id="pipeline-board"></div>
      </div>
    </div>

    <!-- ===== CLIENTS ===== -->
    <div id="page-clients" class="page">
      <div class="filter-bar">
        <div class="search-wrap"><input class="form-input" placeholder="Search clients..."></div>
        <select class="form-select"><option>All Loan Types</option><option>Home Loan</option><option>Business Loan</option><option>Personal Loan</option></select>
        <button class="btn btn-primary btn-sm" onclick="openModal('modal-client')">+ Add Client</button>
      </div>

      <!-- Client Detail Panel -->
      <div id="client-detail" class="card section-gap" style="display:none;">
        <div class="profile-hd">
          <div class="profile-av" id="cd-av">RK</div>
          <div style="flex:1;min-width:0;">
            <div class="profile-name" id="cd-name">Rajesh Kumar</div>
            <div class="profile-meta" id="cd-meta">📞 9876543210 · Home Loan Client</div>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="document.getElementById('client-detail').style.display='none'">✕ Close</button>
        </div>
        <div class="tabs">
          <div class="tab active" onclick="switchTab('ct','overview',this)">Overview</div>
          <div class="tab" onclick="switchTab('ct','documents',this)">Documents</div>
          <div class="tab" onclick="switchTab('ct','history',this)">Loan History</div>
          <div class="tab" onclick="switchTab('ct','timeline',this)">Timeline</div>
        </div>
        <div id="ct-overview">
          <div class="kpi-row">
            <div class="kpi"><div class="kpi-val">₹45L</div><div class="kpi-lbl">Loan Amt</div></div>
            <div class="kpi"><div class="kpi-val" style="color:var(--green);">740</div><div class="kpi-lbl">CIBIL Score</div></div>
            <div class="kpi"><div class="kpi-val">₹85K</div><div class="kpi-lbl">Monthly Income</div></div>
            <div class="kpi"><div class="kpi-val">42%</div><div class="kpi-lbl">FOIR</div></div>
            <div class="kpi"><div class="kpi-val" style="font-size:14px;">SBI</div><div class="kpi-lbl">Preferred Bank</div></div>
          </div>
          <div class="form-grid">
            <div><div class="form-label">PAN</div><div style="font-size:13px;padding:6px 0;">ABCDE1234F</div></div>
            <div><div class="form-label">Aadhaar</div><div style="font-size:13px;padding:6px 0;">****-****-1234</div></div>
            <div><div class="form-label">Employment</div><div style="font-size:13px;padding:6px 0;">Salaried – TechCorp Pvt Ltd</div></div>
            <div><div class="form-label">Current Stage</div><span class="badge badge-docs">Docs Pending</span></div>
          </div>
        </div>
        <div id="ct-documents" style="display:none;">
          <div class="grid-3">
            <div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:14px;text-align:center;">
              <div style="font-size:28px;margin-bottom:6px;">📄</div>
              <div style="font-size:12px;font-weight:600;">PAN Card</div>
              <div style="font-size:10px;color:var(--green);margin-top:3px;">✓ Uploaded</div>
            </div>
            <div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:14px;text-align:center;">
              <div style="font-size:28px;margin-bottom:6px;">🏠</div>
              <div style="font-size:12px;font-weight:600;">Address Proof</div>
              <div style="font-size:10px;color:var(--green);margin-top:3px;">✓ Uploaded</div>
            </div>
            <div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:14px;text-align:center;">
              <div style="font-size:28px;margin-bottom:6px;">💼</div>
              <div style="font-size:12px;font-weight:600;">Salary Slips</div>
              <div style="font-size:10px;color:var(--gold);margin-top:3px;">⏳ Pending</div>
            </div>
            <div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:14px;text-align:center;">
              <div style="font-size:28px;margin-bottom:6px;">🏦</div>
              <div style="font-size:12px;font-weight:600;">Bank Statement</div>
              <div style="font-size:10px;color:var(--gold);margin-top:3px;">⏳ Pending</div>
            </div>
            <div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:14px;text-align:center;">
              <div style="font-size:28px;margin-bottom:6px;">📊</div>
              <div style="font-size:12px;font-weight:600;">ITR (2 years)</div>
              <div style="font-size:10px;color:var(--green);margin-top:3px;">✓ Uploaded</div>
            </div>
            <div style="background:var(--surface2);border:2px dashed var(--border2);border-radius:8px;padding:14px;text-align:center;cursor:pointer;">
              <div style="font-size:28px;margin-bottom:6px;">➕</div>
              <div style="font-size:12px;color:var(--text3);">Upload Doc</div>
            </div>
          </div>
        </div>
        <div id="ct-history" style="display:none;">
          <div class="table-wrap">
            <table>
              <thead><tr><th>Loan Type</th><th>Amount</th><th>Bank</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                <tr><td>Home Loan</td><td>₹45L</td><td>SBI</td><td><span class="badge badge-docs">In Progress</span></td><td>Jan 2025</td></tr>
                <tr><td>Personal Loan</td><td>₹3L</td><td>HDFC</td><td><span class="badge badge-disbursed">Disbursed</span></td><td>Mar 2024</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div id="ct-timeline" style="display:none;">
          <div class="timeline">
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="timeline-title">Documents Requested</div>
              <div class="timeline-time">15 Jan 2025</div>
              <div class="timeline-desc">Requested salary slips and bank statements from client</div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot" style="border-color:var(--green);"></div>
              <div class="timeline-title">CIBIL Score Checked</div>
              <div class="timeline-time">10 Jan 2025</div>
              <div class="timeline-desc">Score: 740 – Eligible for Home Loan up to ₹50L</div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot" style="border-color:var(--gold);"></div>
              <div class="timeline-title">Lead Created</div>
              <div class="timeline-time">5 Jan 2025</div>
              <div class="timeline-desc">Lead added by Priya Singh via direct referral</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="table-wrap">
          <table>
            <thead><tr><th>Client</th><th>Phone</th><th>Loan Type</th><th>Amount</th><th>CIBIL</th><th>Stage</th><th>Manager</th><th>Actions</th></tr></thead>
            <tbody id="clients-tbody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ===== CALCULATOR ===== -->
    <div id="page-calculator" class="page">
      <div class="tabs">
        <div class="tab active" onclick="switchTab('calc','emi',this)">💰 EMI Calculator</div>
        <div class="tab" onclick="switchTab('calc','eligibility',this)">🏦 Eligibility Check</div>
        <div class="tab" onclick="switchTab('calc','foir',this)">📊 FOIR / DSR</div>
      </div>

      <!-- EMI TAB -->
      <div id="calc-emi">
        <div class="grid-2">
          <div class="card">
            <div class="card-title" style="margin-bottom:18px;">EMI Calculator</div>
            <div class="form-group">
              <div style="display:flex;justify-content:space-between;"><div class="form-label">Loan Amount</div><strong id="la-disp" style="color:var(--accent);font-size:13px;">₹25,00,000</strong></div>
              <input type="range" min="100000" max="10000000" step="50000" value="2500000" id="la" oninput="calcEMI()">
            </div>
            <div class="form-group">
              <div style="display:flex;justify-content:space-between;"><div class="form-label">Interest Rate (% p.a.)</div><strong id="ir-disp" style="color:var(--accent);font-size:13px;">8.50%</strong></div>
              <input type="range" min="5" max="24" step="0.25" value="8.5" id="ir" oninput="calcEMI()">
            </div>
            <div class="form-group">
              <div style="display:flex;justify-content:space-between;"><div class="form-label">Tenure</div><strong id="tn-disp" style="color:var(--accent);font-size:13px;">20 years</strong></div>
              <input type="range" min="1" max="30" step="1" value="20" id="tn" oninput="calcEMI()">
            </div>
            <div class="form-group">
              <div class="form-label">Loan Type</div>
              <select class="form-select" onchange="calcEMI()">
                <option>Home Loan</option><option>Business Loan</option><option>Personal Loan</option><option>Car Loan</option><option>LAP</option>
              </select>
            </div>
            <div class="calc-result">
              <div class="calc-row"><span class="calc-lbl">Principal</span><span class="calc-val" id="emi-principal">₹25,00,000</span></div>
              <div class="calc-row"><span class="calc-lbl">Total Interest</span><span class="calc-val" id="emi-interest">₹27,08,720</span></div>
              <div class="calc-row"><span class="calc-lbl">Total Payment</span><span class="calc-val" id="emi-total">₹52,08,720</span></div>
              <div class="calc-row"><span class="calc-lbl">Monthly EMI</span><span class="calc-val" id="emi-val" style="color:var(--accent);font-size:20px;">₹21,703</span></div>
            </div>
          </div>
          <div class="card">
            <div class="card-title" style="margin-bottom:16px;">🏦 Bank Rate Comparison</div>
            <div id="bank-compare"></div>
          </div>
        </div>
      </div>

      <!-- ELIGIBILITY TAB -->
      <div id="calc-eligibility" style="display:none;">
        <div class="grid-2">
          <div class="card">
            <div class="card-title" style="margin-bottom:16px;">Loan Eligibility Calculator</div>
            <div class="form-grid">
              <div class="form-group"><div class="form-label">Monthly Income (₹)</div><input class="form-input" type="number" placeholder="75000" id="eli-income" oninput="calcEligibility()"></div>
              <div class="form-group"><div class="form-label">Existing EMIs (₹)</div><input class="form-input" type="number" placeholder="10000" id="eli-emi" oninput="calcEligibility()"></div>
              <div class="form-group"><div class="form-label">Age</div><input class="form-input" type="number" placeholder="35" id="eli-age" oninput="calcEligibility()"></div>
              <div class="form-group"><div class="form-label">CIBIL Score</div><input class="form-input" type="number" placeholder="720" id="eli-cibil" oninput="calcEligibility()"></div>
              <div class="form-group"><div class="form-label">Employment Type</div>
                <select class="form-select" id="eli-emp" onchange="calcEligibility()">
                  <option>Salaried</option><option>Self-Employed</option><option>Business</option>
                </select>
              </div>
              <div class="form-group"><div class="form-label">Loan Type</div>
                <select class="form-select" onchange="calcEligibility()">
                  <option>Home Loan</option><option>Business Loan</option><option>Personal Loan</option>
                </select>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-title" style="margin-bottom:16px;">Eligibility Result</div>
            <div id="eli-result">
              <div class="empty"><div class="empty-icon">🏦</div><div class="empty-text">Enter details to calculate eligibility</div></div>
            </div>
          </div>
        </div>
      </div>

      <!-- FOIR TAB -->
      <div id="calc-foir" style="display:none;">
        <div class="grid-2">
          <div class="card">
            <div class="card-title" style="margin-bottom:16px;">FOIR / DSR Calculator</div>
            <div class="form-group"><div class="form-label">Gross Monthly Income (₹)</div><input class="form-input" type="number" placeholder="80000" id="foir-income" oninput="calcFOIR()"></div>
            <div class="form-group"><div class="form-label">Proposed EMI (₹)</div><input class="form-input" type="number" placeholder="20000" id="foir-proposed" oninput="calcFOIR()"></div>
            <div class="form-group"><div class="form-label">Existing EMIs (₹)</div><input class="form-input" type="number" placeholder="5000" id="foir-existing" oninput="calcFOIR()"></div>
          </div>
          <div class="card">
            <div class="card-title" style="margin-bottom:16px;">FOIR Analysis</div>
            <div id="foir-result">
              <div class="empty"><div class="empty-icon">📊</div><div class="empty-text">Fill in details for FOIR analysis</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== CIBIL ===== -->
    <div id="page-cibil" class="page">
      <div class="grid-2">
        <div class="card">
          <div class="card-title" style="margin-bottom:16px;">Check CIBIL Score</div>
          <div class="form-group"><div class="form-label">Full Name <span class="req">*</span></div><input class="form-input" placeholder="Enter client full name" id="cibil-name"></div>
          <div class="form-group"><div class="form-label">PAN Number <span class="req">*</span></div><input class="form-input" placeholder="ABCDE1234F" id="cibil-pan" style="text-transform:uppercase;"></div>
          <div class="form-grid">
            <div class="form-group"><div class="form-label">Date of Birth</div><input class="form-input" type="date" id="cibil-dob"></div>
            <div class="form-group"><div class="form-label">Mobile Number</div><input class="form-input" placeholder="9876543210" id="cibil-mobile"></div>
          </div>
          <div class="form-group"><div class="form-label">Pincode</div><input class="form-input" placeholder="400001" id="cibil-pin"></div>
          <button class="btn btn-primary" style="width:100%;" onclick="checkCIBIL()">🔍 Check CIBIL Score</button>
        </div>
        <div class="card">
          <div class="card-title" style="margin-bottom:16px;">Score Report</div>
          <div id="cibil-result">
            <div class="empty"><div class="empty-icon">📊</div><div class="empty-text">Enter details and click Check to view CIBIL score report</div></div>
          </div>
        </div>
      </div>

      <div class="card section-gap" style="margin-top:16px;">
        <div class="card-header"><div class="card-title">Recent CIBIL Checks</div></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Client</th><th>PAN</th><th>Score</th><th>Grade</th><th>Checked By</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              <tr><td>Rajesh Kumar</td><td>ABCDE1234F</td><td><strong style="color:var(--green);">740</strong></td><td><span class="badge badge-excellent">Excellent</span></td><td>Priya Singh</td><td>15 Jan 2025</td><td><span class="badge badge-active">Eligible</span></td></tr>
              <tr><td>Meena Patel</td><td>PQRST5678G</td><td><strong style="color:var(--cyan);">680</strong></td><td><span class="badge badge-good">Good</span></td><td>Amit Kumar</td><td>12 Jan 2025</td><td><span class="badge badge-active">Eligible</span></td></tr>
              <tr><td>Rahul Shah</td><td>LMNOP9012H</td><td><strong style="color:var(--red);">580</strong></td><td><span class="badge badge-poor">Poor</span></td><td>Raj Mehta</td><td>8 Jan 2025</td><td><span class="badge badge-processing">Improvement Plan</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card" style="margin-top:0;">
        <div class="card-header"><div class="card-title">CIBIL Score Guide</div></div>
        <div class="grid-4">
          <div style="background:var(--red-light);border:1px solid #fecaca;border-radius:10px;padding:14px;text-align:center;">
            <div style="font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:var(--red);">300–549</div>
            <div style="font-size:11px;font-weight:600;color:var(--red);margin-top:3px;">Poor</div>
            <div style="font-size:10px;color:var(--text3);margin-top:2px;">High Risk · No Loan</div>
          </div>
          <div style="background:var(--gold-light);border:1px solid #fde68a;border-radius:10px;padding:14px;text-align:center;">
            <div style="font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:var(--gold);">550–649</div>
            <div style="font-size:11px;font-weight:600;color:var(--gold);margin-top:3px;">Fair</div>
            <div style="font-size:10px;color:var(--text3);margin-top:2px;">Needs Improvement</div>
          </div>
          <div style="background:var(--cyan-light);border:1px solid #a5f3fc;border-radius:10px;padding:14px;text-align:center;">
            <div style="font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:var(--cyan);">650–749</div>
            <div style="font-size:11px;font-weight:600;color:var(--cyan);margin-top:3px;">Good</div>
            <div style="font-size:10px;color:var(--text3);margin-top:2px;">Eligible for Loans</div>
          </div>
          <div style="background:var(--green-light);border:1px solid #a7f3d0;border-radius:10px;padding:14px;text-align:center;">
            <div style="font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:var(--green);">750–900</div>
            <div style="font-size:11px;font-weight:600;color:var(--green);margin-top:3px;">Excellent</div>
            <div style="font-size:10px;color:var(--text3);margin-top:2px;">Best Rates Available</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== EMPLOYEES ===== -->
    <div id="page-employees" class="page">
      <div class="stats-grid" style="margin-bottom:16px;">
        <div class="stat-card">
          <div class="stat-card-top">
            <div><div class="stat-label">Total Employees</div><div class="stat-value">28</div></div>
            <div class="stat-icon-wrap blue">👥</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card-top">
            <div><div class="stat-label">Active Today</div><div class="stat-value">21</div></div>
            <div class="stat-icon-wrap green">✅</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card-top">
            <div><div class="stat-label">DSA Partners</div><div class="stat-value">12</div></div>
            <div class="stat-icon-wrap gold">🤝</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card-top">
            <div><div class="stat-label">On Leave</div><div class="stat-value">3</div></div>
            <div class="stat-icon-wrap purple">🏖</div>
          </div>
        </div>
      </div>
      <div class="filter-bar">
        <div class="search-wrap"><input class="form-input" placeholder="Search employees..."></div>
        <select class="form-select"><option>All Roles</option><option>Admin</option><option>Manager</option><option>Staff</option><option>DSA</option></select>
        <select class="form-select"><option>All Departments</option><option>Home Loans</option><option>Business Loans</option><option>Insurance</option></select>
        <button class="btn btn-primary btn-sm" onclick="openModal('modal-emp')">+ Add Employee</button>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead><tr><th>Employee</th><th>Role</th><th>Department</th><th>Leads</th><th>Converted</th><th>Conv.%</th><th>Commission</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody id="emp-tbody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ===== FRANCHISE ===== -->
    <div id="page-franchise" class="page">
      <div class="stats-grid" style="margin-bottom:16px;">
        <div class="stat-card">
          <div class="stat-card-top">
            <div><div class="stat-label">Total Branches</div><div class="stat-value">8</div></div>
            <div class="stat-icon-wrap blue">🏢</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card-top">
            <div><div class="stat-label">Total Collection</div><div class="stat-value">₹1.8Cr</div></div>
            <div class="stat-icon-wrap green">💰</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card-top">
            <div><div class="stat-label">Active Partners</div><div class="stat-value">6</div></div>
            <div class="stat-icon-wrap gold">🤝</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card-top">
            <div><div class="stat-label">Pending Payouts</div><div class="stat-value">₹2.4L</div></div>
            <div class="stat-icon-wrap purple">⏳</div>
          </div>
        </div>
      </div>

      <div class="filter-bar">
        <div class="search-wrap"><input class="form-input" placeholder="Search franchise..."></div>
        <select class="form-select"><option>All Status</option><option>Active</option><option>Inactive</option></select>
        <button class="btn btn-primary btn-sm" onclick="openModal('modal-franchise')">+ Add Franchise</button>
      </div>

      <div id="franchise-grid" class="grid-3 section-gap"></div>

      <div class="card">
        <div class="card-header"><div class="card-title">Franchise Leads & Payouts</div></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Franchise</th><th>Owner</th><th>Leads</th><th>Converted</th><th>Disbursed</th><th>Rate</th><th>Payout</th><th>Actions</th></tr></thead>
            <tbody id="franchise-tbody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ===== REPORTS ===== -->
    <div id="page-reports" class="page">
      <div class="tabs">
        <div class="tab active" onclick="switchTab('rpt','overview',this)">📊 Overview</div>
        <div class="tab" onclick="switchTab('rpt','leads',this)">🎯 Leads Report</div>
        <div class="tab" onclick="switchTab('rpt','employees',this)">👥 Employees</div>
        <div class="tab" onclick="switchTab('rpt','payouts',this)">💰 Payouts</div>
      </div>

      <!-- Overview -->
      <div id="rpt-overview">
        <div class="stats-grid section-gap">
          <div class="stat-card"><div class="stat-card-top"><div><div class="stat-label">Leads This Month</div><div class="stat-value">86</div><div class="stat-sub up">↑ 22% vs last</div></div><div class="stat-icon-wrap blue">🎯</div></div></div>
          <div class="stat-card"><div class="stat-card-top"><div><div class="stat-label">Disbursements</div><div class="stat-value">₹1.2Cr</div><div class="stat-sub">18 cases</div></div><div class="stat-icon-wrap green">💰</div></div></div>
          <div class="stat-card"><div class="stat-card-top"><div><div class="stat-label">Total Commission</div><div class="stat-value">₹3.6L</div><div class="stat-sub up">↑ 8% this month</div></div><div class="stat-icon-wrap gold">🏆</div></div></div>
          <div class="stat-card"><div class="stat-card-top"><div><div class="stat-label">Conversion Rate</div><div class="stat-value">34%</div><div class="stat-sub">Industry avg: 22%</div></div><div class="stat-icon-wrap purple">📈</div></div></div>
        </div>
        <div class="grid-2">
          <div class="card">
            <div class="card-header"><div class="card-title">Loan Type Distribution</div></div>
            <div id="loan-type-chart"></div>
          </div>
          <div class="card">
            <div class="card-header"><div class="card-title">🏆 Top Performers</div></div>
            <div id="rpt-leaderboard"></div>
          </div>
        </div>
      </div>

      <!-- Leads Report -->
      <div id="rpt-leads" style="display:none;">
        <div class="filter-bar" style="margin-bottom:14px;">
          <select class="form-select"><option>This Month</option><option>Last Month</option><option>This Quarter</option></select>
          <select class="form-select"><option>All Stages</option><option>New</option><option>Processing</option><option>Closed</option></select>
          <button class="btn btn-secondary btn-sm">⬇ Export CSV</button>
          <button class="btn btn-secondary btn-sm">🖨 Print</button>
        </div>
        <div class="card">
          <div class="table-wrap">
            <table>
              <thead><tr><th>Lead Name</th><th>Type</th><th>Amount</th><th>Stage</th><th>Created</th><th>Assigned</th><th>Days Open</th></tr></thead>
              <tbody id="rpt-leads-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Employees Report -->
      <div id="rpt-employees" style="display:none;">
        <div class="card">
          <div class="table-wrap">
            <table>
              <thead><tr><th>Employee</th><th>Role</th><th>Leads Handled</th><th>Converted</th><th>Conv. Rate</th><th>Commission</th><th>Avg Deal Size</th></tr></thead>
              <tbody>
                <tr><td><div class="td-name"><div class="mini-avatar">PS</div>Priya Singh</div></td><td>Sr. Manager</td><td>42</td><td>18</td><td><strong style="color:var(--green);">43%</strong></td><td>₹1,08,000</td><td>₹32L</td></tr>
                <tr><td><div class="td-name"><div class="mini-avatar" style="background:linear-gradient(135deg,#059669,#0891b2);">AK</div>Amit Kumar</div></td><td>Manager</td><td>36</td><td>13</td><td><strong style="color:var(--gold);">36%</strong></td><td>₹78,000</td><td>₹28L</td></tr>
                <tr><td><div class="td-name"><div class="mini-avatar" style="background:linear-gradient(135deg,#d97706,#ea580c);">RM</div>Raj Mehta</div></td><td>Executive</td><td>28</td><td>8</td><td><strong style="color:var(--text2);">29%</strong></td><td>₹48,000</td><td>₹22L</td></tr>
                <tr><td><div class="td-name"><div class="mini-avatar" style="background:linear-gradient(135deg,#7c3aed,#a21caf);">NV</div>Neha Verma</div></td><td>Executive</td><td>22</td><td>9</td><td><strong style="color:var(--cyan);">41%</strong></td><td>₹36,000</td><td>₹18L</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Payouts Report -->
      <div id="rpt-payouts" style="display:none;">
        <div class="card">
          <div class="table-wrap">
            <table>
              <thead><tr><th>Employee / Partner</th><th>Type</th><th>Leads</th><th>Disbursed Amt</th><th>Rate</th><th>Amount Due</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                <tr><td><div class="td-name"><div class="mini-avatar">PS</div>Priya Singh</div></td><td>Staff</td><td>18</td><td>₹4.8Cr</td><td>0.25%</td><td>₹1,20,000</td><td><span class="badge badge-active">Paid</span></td><td><button class="btn btn-ghost btn-xs">📄 Slip</button></td></tr>
                <tr><td><div class="td-name"><div class="mini-avatar" style="background:linear-gradient(135deg,#d97706,#ea580c);">MB</div>Mumbai DSA</div></td><td>Franchise</td><td>24</td><td>₹6.2Cr</td><td>0.30%</td><td>₹1,86,000</td><td><span class="badge badge-docs">Pending</span></td><td><button class="btn btn-primary btn-xs">💰 Pay</button></td></tr>
                <tr><td><div class="td-name"><div class="mini-avatar" style="background:linear-gradient(135deg,#7c3aed,#a21caf);">RM</div>Raj Mehta</div></td><td>Staff</td><td>8</td><td>₹1.9Cr</td><td>0.20%</td><td>₹38,000</td><td><span class="badge badge-active">Paid</span></td><td><button class="btn btn-ghost btn-xs">📄 Slip</button></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== ADMIN SETTINGS ===== -->
    <div id="page-settings" class="page">

      <div class="tabs" id="settings-tabs">
        <div class="tab active" onclick="switchSettingsTab('company',this)">🏢 Company</div>
        <div class="tab" onclick="switchSettingsTab('users',this)">👥 Users & Access</div>
        <div class="tab" onclick="switchSettingsTab('commission',this)">💰 Commission</div>
        <div class="tab" onclick="switchSettingsTab('notifications',this)">🔔 Notifications</div>
        <div class="tab" onclick="switchSettingsTab('lead-config',this)">🎯 Lead Config</div>
        <div class="tab" onclick="switchSettingsTab('security',this)">🔐 Security</div>
      </div>

      <!-- COMPANY SETTINGS -->
      <div id="stab-company">
        <div class="grid-2">
          <div class="card">
            <div class="card-header"><div class="card-title">🏢 Company Details</div></div>
            <div class="form-group"><div class="form-label">Company Name</div><input class="form-input" id="s-company-name" value="Easy Finance Wale Pvt. Ltd."></div>
            <div class="form-group"><div class="form-label">Tagline</div><input class="form-input" id="s-tagline" value="Your Trusted Loan Partner"></div>
            <div class="form-group"><div class="form-label">Registered Address</div><textarea class="form-textarea" id="s-address" style="min-height:60px;">201, Finance Tower, MG Road, Mumbai – 400001</textarea></div>
            <div class="form-grid">
              <div class="form-group"><div class="form-label">Phone</div><input class="form-input" id="s-phone" value="+91 98765 43210"></div>
              <div class="form-group"><div class="form-label">Email</div><input class="form-input" type="email" id="s-email" value="admin@easyfinancewale.in"></div>
            </div>
            <div class="form-grid">
              <div class="form-group"><div class="form-label">GSTIN</div><input class="form-input" id="s-gst" value="27AABCE1234F1Z5"></div>
              <div class="form-group"><div class="form-label">PAN</div><input class="form-input" id="s-pan" value="AABCE1234F"></div>
            </div>
            <div class="form-group"><div class="form-label">Website</div><input class="form-input" id="s-website" value="www.easyfinancewale.in"></div>
            <button class="btn btn-primary" onclick="saveSettings('Company details')">💾 Save Company Info</button>
          </div>

          <div>
            <div class="card" style="margin-bottom:16px;">
              <div class="card-header"><div class="card-title">🧾 Invoice & Tax Settings</div></div>
              <div class="form-grid">
                <div class="form-group"><div class="form-label">Default GST (%)</div><input class="form-input" type="number" id="s-gst-pct" value="18" step="0.5"></div>
                <div class="form-group"><div class="form-label">Invoice Prefix</div><input class="form-input" id="s-inv-prefix" value="EFW-INV-"></div>
              </div>
              <div class="form-group"><div class="form-label">Invoice Footer Note</div><textarea class="form-textarea" id="s-inv-footer" style="min-height:55px;">Thank you for choosing Easy Finance Wale. This is a computer generated invoice.</textarea></div>
              <div class="form-group">
                <div class="form-label">Financial Year Start</div>
                <select class="form-select" id="s-fy">
                  <option>April (India standard)</option><option>January</option>
                </select>
              </div>
              <button class="btn btn-primary" onclick="saveSettings('Invoice settings')">💾 Save Invoice Settings</button>
            </div>

            <div class="card">
              <div class="card-header"><div class="card-title">🎨 Branding</div></div>
              <div class="form-group">
                <div class="form-label">Primary Color</div>
                <div style="display:flex;gap:8px;align-items:center;">
                  <input type="color" id="s-primary-color" value="#2563eb" style="width:40px;height:36px;border:1px solid var(--border);border-radius:6px;cursor:pointer;padding:2px;">
                  <input class="form-input" id="s-primary-hex" value="#2563eb" style="flex:1;" oninput="document.getElementById('s-primary-color').value=this.value">
                </div>
              </div>
              <div class="form-group">
                <div class="form-label">Date Format</div>
                <select class="form-select" id="s-date-fmt">
                  <option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option>
                </select>
              </div>
              <div class="form-group">
                <div class="form-label">Currency Symbol</div>
                <select class="form-select">
                  <option>₹ (Indian Rupee)</option><option>$ (USD)</option><option>€ (Euro)</option>
                </select>
              </div>
              <button class="btn btn-primary" onclick="applyBranding()">🎨 Apply Branding</button>
            </div>
          </div>
        </div>
      </div>

      <!-- USERS & ACCESS -->
      <div id="stab-users" style="display:none;">
        <div class="card" style="margin-bottom:16px;">
          <div class="card-header">
            <div><div class="card-title">👥 User Accounts & Role Management</div><div class="card-sub">Manage access levels for all staff members</div></div>
            <button class="btn btn-primary btn-sm" onclick="openModal('modal-emp')">+ Add User</button>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>User</th><th>Email</th><th>Role</th><th>Department</th><th>Access Level</th><th>Last Login</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody id="settings-users-tbody"></tbody>
            </table>
          </div>
        </div>

        <div class="grid-2">
          <div class="card">
            <div class="card-header"><div class="card-title">🔑 Role Permissions</div></div>
            <div style="margin-bottom:12px;">
              <div class="form-label" style="margin-bottom:8px;">Select Role to Configure</div>
              <select class="form-select" id="s-role-select" onchange="renderRolePerms()">
                <option>Super Admin</option><option>Manager</option><option>Staff</option><option>DSA Partner</option>
              </select>
            </div>
            <div id="role-perms-list"></div>
            <button class="btn btn-primary" style="margin-top:12px;" onclick="saveSettings('Role permissions')">💾 Save Permissions</button>
          </div>

          <div class="card">
            <div class="card-header"><div class="card-title">🏷️ Department Management</div></div>
            <div id="dept-list" style="margin-bottom:12px;"></div>
            <div style="display:flex;gap:8px;">
              <input class="form-input" id="new-dept-name" placeholder="New department name..." style="flex:1;">
              <button class="btn btn-primary btn-sm" onclick="addDepartment()">+ Add</button>
            </div>
          </div>
        </div>
      </div>

      <!-- COMMISSION SETTINGS -->
      <div id="stab-commission" style="display:none;">
        <div class="grid-2">
          <div class="card">
            <div class="card-header"><div class="card-title">💰 Commission Slabs by Role</div></div>
            <div id="commission-slabs"></div>
            <div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border);">
              <div class="form-label" style="margin-bottom:8px;">Add Commission Rule</div>
              <div class="form-grid">
                <div class="form-group"><div class="form-label">Role / Department</div>
                  <select class="form-select" id="new-comm-role">
                    <option>Staff</option><option>Manager</option><option>DSA Partner</option><option>IDC Partner</option>
                  </select>
                </div>
                <div class="form-group"><div class="form-label">Loan Type</div>
                  <select class="form-select" id="new-comm-type">
                    <option>Home Loan</option><option>Business Loan</option><option>Personal Loan</option><option>All</option>
                  </select>
                </div>
                <div class="form-group"><div class="form-label">Rate (%)</div><input class="form-input" type="number" id="new-comm-rate" placeholder="0.25" step="0.05"></div>
                <div class="form-group"><div class="form-label">Min Disbursement (₹)</div><input class="form-input" type="number" id="new-comm-min" placeholder="500000"></div>
              </div>
              <button class="btn btn-primary btn-sm" onclick="addCommissionSlab()">+ Add Rule</button>
            </div>
          </div>

          <div class="card">
            <div class="card-header"><div class="card-title">⚙️ Payout Settings</div></div>
            <div class="form-group">
              <div class="form-label">Payout Cycle</div>
              <select class="form-select" id="s-payout-cycle">
                <option>Monthly (Last day)</option><option>Bi-weekly</option><option>Weekly</option><option>On Disbursement</option>
              </select>
            </div>
            <div class="form-group">
              <div class="form-label">TDS Deduction (%)</div>
              <input class="form-input" type="number" id="s-tds" value="10" step="0.5">
            </div>
            <div class="form-group">
              <div class="form-label">Minimum Payout Threshold (₹)</div>
              <input class="form-input" type="number" id="s-min-payout" value="500">
            </div>
            <div class="form-group">
              <div class="form-label">CIBIL Check Charge (₹ per check)</div>
              <input class="form-input" type="number" id="s-cibil-charge" value="150">
            </div>

            <!-- Toggle switches -->
            <div style="margin-top:6px;">
              <div id="toggle-container"></div>
            </div>

            <button class="btn btn-primary" style="margin-top:14px;" onclick="saveSettings('Payout settings')">💾 Save Payout Settings</button>
          </div>
        </div>
      </div>

      <!-- NOTIFICATIONS -->
      <div id="stab-notifications" style="display:none;">
        <div class="grid-2">
          <div class="card">
            <div class="card-header"><div class="card-title">🔔 Notification Rules</div></div>
            <div id="notif-rules-list"></div>
          </div>
          <div class="card">
            <div class="card-header"><div class="card-title">📱 Notification Channels</div></div>
            <div class="form-group">
              <div class="form-label">WhatsApp Business Number</div>
              <input class="form-input" placeholder="+91 98765 43210" id="s-wa">
            </div>
            <div class="form-group">
              <div class="form-label">SMS Gateway API Key</div>
              <input class="form-input" placeholder="Enter SMS gateway API key" type="password" id="s-sms-key">
            </div>
            <div class="form-group">
              <div class="form-label">Email SMTP Host</div>
              <input class="form-input" placeholder="smtp.gmail.com" id="s-smtp">
            </div>
            <div class="form-grid">
              <div class="form-group"><div class="form-label">SMTP Port</div><input class="form-input" value="587" id="s-smtp-port"></div>
              <div class="form-group"><div class="form-label">From Email</div><input class="form-input" value="noreply@easyfinancewale.in" id="s-from-email"></div>
            </div>
            <div class="form-group"><div class="form-label">SMTP Password</div><input class="form-input" type="password" placeholder="••••••••" id="s-smtp-pass"></div>
            <button class="btn btn-secondary btn-sm" onclick="showToast('Test email sent!','success')">📧 Send Test Email</button>
            <button class="btn btn-primary" style="margin-top:10px;width:100%;" onclick="saveSettings('Notification channels')">💾 Save Channels</button>
          </div>
        </div>

        <div class="card" style="margin-top:16px;">
          <div class="card-header"><div class="card-title">⏰ Auto-Reminder Schedules</div></div>
          <div class="grid-3" style="gap:12px;">
            <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:14px;">
              <div style="font-size:13px;font-weight:600;margin-bottom:8px;">Follow-up Reminder</div>
              <div class="form-group"><div class="form-label">Before (hours)</div><input class="form-input" type="number" value="2" min="1" max="48"></div>
              <div class="form-group" style="margin-bottom:0;"><div class="form-label">Channel</div><select class="form-select"><option>WhatsApp</option><option>SMS</option><option>Email</option><option>All</option></select></div>
            </div>
            <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:14px;">
              <div style="font-size:13px;font-weight:600;margin-bottom:8px;">Payout Reminder</div>
              <div class="form-group"><div class="form-label">Days before cycle end</div><input class="form-input" type="number" value="3" min="1" max="10"></div>
              <div class="form-group" style="margin-bottom:0;"><div class="form-label">Channel</div><select class="form-select"><option>Email</option><option>WhatsApp</option><option>SMS</option><option>All</option></select></div>
            </div>
            <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:14px;">
              <div style="font-size:13px;font-weight:600;margin-bottom:8px;">Document Expiry Alert</div>
              <div class="form-group"><div class="form-label">Days before expiry</div><input class="form-input" type="number" value="7" min="1" max="30"></div>
              <div class="form-group" style="margin-bottom:0;"><div class="form-label">Channel</div><select class="form-select"><option>Email</option><option>WhatsApp</option><option>SMS</option><option>All</option></select></div>
            </div>
          </div>
          <button class="btn btn-primary" style="margin-top:14px;" onclick="saveSettings('Reminder schedules')">💾 Save Schedules</button>
        </div>
      </div>

      <!-- LEAD CONFIG -->
      <div id="stab-lead-config" style="display:none;">
        <div class="grid-2">
          <div class="card">
            <div class="card-header"><div class="card-title">🔄 Loan Pipeline Stages</div></div>
            <div style="font-size:12px;color:var(--text3);margin-bottom:12px;">Drag to reorder · Click ✕ to remove · Click + to add</div>
            <div id="stage-list"></div>
            <div style="display:flex;gap:8px;margin-top:10px;">
              <input class="form-input" id="new-stage-name" placeholder="New stage name..." style="flex:1;">
              <select class="form-select" style="width:130px;" id="new-stage-type">
                <option>Loan</option><option>Insurance</option><option>CIBIL</option>
              </select>
              <button class="btn btn-primary btn-sm" onclick="addStage()">+ Add</button>
            </div>
          </div>

          <div class="card">
            <div class="card-header"><div class="card-title">📋 Lead Form Fields</div></div>
            <div style="font-size:12px;color:var(--text3);margin-bottom:12px;">Toggle required/optional fields for lead creation form</div>
            <div id="lead-fields-list"></div>
          </div>
        </div>

        <div class="card" style="margin-top:16px;">
          <div class="card-header"><div class="card-title">🏦 Bank & Product Master</div></div>
          <div class="grid-3" style="gap:12px;margin-bottom:14px;" id="bank-master-grid"></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <input class="form-input" id="new-bank-name" placeholder="Bank / NBFC name..." style="flex:1;min-width:160px;">
            <select class="form-select" style="width:140px;">
              <option>All Products</option><option>Home Loan</option><option>Business Loan</option><option>Personal Loan</option>
            </select>
            <input class="form-input" placeholder="Interest rate (e.g. 8.5%)" style="width:160px;">
            <button class="btn btn-primary btn-sm" onclick="addBank()">+ Add Bank</button>
          </div>
        </div>
      </div>

      <!-- SECURITY -->
      <div id="stab-security" style="display:none;">
        <div class="grid-2">
          <div class="card">
            <div class="card-header"><div class="card-title">🔐 Security Settings</div></div>
            <div id="security-toggles"></div>
            <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border);">
              <div class="form-group">
                <div class="form-label">Session Timeout (minutes)</div>
                <input class="form-input" type="number" value="30" id="s-session" min="5" max="480">
              </div>
              <div class="form-group">
                <div class="form-label">Max Login Attempts Before Lock</div>
                <input class="form-input" type="number" value="5" id="s-max-attempts" min="3" max="10">
              </div>
              <div class="form-group">
                <div class="form-label">Password Expiry (days)</div>
                <input class="form-input" type="number" value="90" id="s-pass-exp" min="30" max="365">
              </div>
            </div>
            <button class="btn btn-primary" onclick="saveSettings('Security settings')">💾 Save Security</button>
          </div>

          <div>
            <div class="card" style="margin-bottom:16px;">
              <div class="card-header"><div class="card-title">🛡️ Data & Backup</div></div>
              <div id="backup-toggles" style="margin-bottom:14px;"></div>
              <div class="form-group">
                <div class="form-label">Auto Backup Frequency</div>
                <select class="form-select">
                  <option>Daily at midnight</option><option>Every 12 hours</option><option>Weekly</option>
                </select>
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button class="btn btn-secondary btn-sm" onclick="showToast('Backup started…','info')">🔄 Backup Now</button>
                <button class="btn btn-ghost btn-sm" onclick="showToast('Restore wizard opened','info')">📥 Restore</button>
              </div>
            </div>

            <div class="card">
              <div class="card-header"><div class="card-title">📜 Audit Log</div></div>
              <div id="audit-log"></div>
              <button class="btn btn-secondary btn-sm" style="margin-top:10px;" onclick="showToast('Audit log exported','success')">⬇ Export Log</button>
            </div>
          </div>
        </div>
      </div>

    </div><!-- /page-settings -->

    <!-- ===== LMS – KNOWLEDGE BASE ===== -->
    <div id="page-lms" class="page">

      <div class="tabs" id="lms-tabs">
        <div class="tab active" onclick="switchLmsTab('courses',this)">📚 My Courses</div>
        <div class="tab" onclick="switchLmsTab('materials',this)">📄 Study Materials</div>
        <div class="tab" onclick="switchLmsTab('quizzes',this)">🧠 Quizzes & Tests</div>
        <div class="tab" onclick="switchLmsTab('certificates',this)">🏆 Certificates</div>
        <div id="lms-upload-tab" class="tab" onclick="switchLmsTab('upload',this)" style="display:none;">⬆ Upload Content</div>
      </div>

      <!-- COURSES TAB -->
      <div id="ltab-courses">
        <!-- Progress Banner -->
        <div style="background:linear-gradient(135deg,#1e40af,#4f46e5);border-radius:14px;padding:20px 24px;color:white;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
          <div>
            <div style="font-family:'Syne',sans-serif;font-size:18px;font-weight:800;margin-bottom:4px;">Your Learning Progress 🎓</div>
            <div style="font-size:13px;opacity:0.85;" id="lms-progress-label">3 of 8 courses completed · Keep going!</div>
          </div>
          <div style="display:flex;gap:16px;flex-wrap:wrap;">
            <div style="text-align:center;"><div style="font-family:'Syne',sans-serif;font-size:24px;font-weight:800;" id="lms-stat-completed">3</div><div style="font-size:11px;opacity:0.8;">Completed</div></div>
            <div style="text-align:center;"><div style="font-family:'Syne',sans-serif;font-size:24px;font-weight:800;" id="lms-stat-inprog">2</div><div style="font-size:11px;opacity:0.8;">In Progress</div></div>
            <div style="text-align:center;"><div style="font-family:'Syne',sans-serif;font-size:24px;font-weight:800;" id="lms-stat-pts">240</div><div style="font-size:11px;opacity:0.8;">Points</div></div>
          </div>
        </div>

        <!-- Filter row -->
        <div class="filter-bar" style="margin-bottom:16px;">
          <div class="chip active" onclick="filterCourses('all',this)">All Courses</div>
          <div class="chip" onclick="filterCourses('inprogress',this)">In Progress</div>
          <div class="chip" onclick="filterCourses('completed',this)">Completed</div>
          <div class="chip" onclick="filterCourses('loans',this)">Loans</div>
          <div class="chip" onclick="filterCourses('insurance',this)">Insurance</div>
          <div class="chip" onclick="filterCourses('sales',this)">Sales Skills</div>
          <div class="chip" onclick="filterCourses('compliance',this)">Compliance</div>
        </div>

        <div class="lms-grid" id="courses-grid"></div>
      </div>

      <!-- MATERIALS TAB -->
      <div id="ltab-materials" style="display:none;">
        <div class="filter-bar" style="margin-bottom:16px;">
          <div class="search-wrap" style="flex:1;"><input class="form-input" placeholder="Search materials..."></div>
          <select class="form-select" style="width:140px;"><option>All Categories</option><option>Loans</option><option>Insurance</option><option>Compliance</option><option>Sales</option><option>HR Policies</option></select>
          <select class="form-select" style="width:130px;"><option>All Types</option><option>PDF</option><option>Video</option><option>Presentation</option><option>Spreadsheet</option></select>
        </div>
        <div class="card">
          <div class="table-wrap">
            <table>
              <thead><tr><th>Title</th><th>Category</th><th>Type</th><th>Size</th><th>Uploaded By</th><th>Date</th><th>Views</th><th>Actions</th></tr></thead>
              <tbody id="materials-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- QUIZZES TAB -->
      <div id="ltab-quizzes" style="display:none;">
        <div class="grid-2" id="active-quiz-wrap" style="margin-bottom:18px;"></div>
        <div class="card">
          <div class="card-header"><div class="card-title">📊 Quiz Leaderboard</div><span class="badge badge-active">This Month</span></div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Employee</th><th>Quizzes Taken</th><th>Avg Score</th><th>Best Score</th><th>Points Earned</th></tr></thead>
              <tbody id="quiz-leaderboard-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- CERTIFICATES TAB -->
      <div id="ltab-certificates" style="display:none;">
        <div class="grid-3" id="certs-grid"></div>
      </div>

      <!-- UPLOAD TAB (Admin/Manager only) -->
      <div id="ltab-upload" style="display:none;">
        <div class="grid-2">
          <div class="card">
            <div class="card-title" style="margin-bottom:16px;">📤 Upload Study Material</div>
            <div class="form-group"><div class="form-label">Title <span class="req">*</span></div><input class="form-input" placeholder="e.g. Home Loan Processing Guide 2025"></div>
            <div class="form-grid">
              <div class="form-group"><div class="form-label">Category</div>
                <select class="form-select"><option>Loans</option><option>Insurance</option><option>CIBIL</option><option>Compliance</option><option>Sales Skills</option><option>HR Policies</option></select>
              </div>
              <div class="form-group"><div class="form-label">Content Type</div>
                <select class="form-select"><option>PDF Document</option><option>Video (URL)</option><option>Presentation</option><option>Spreadsheet</option><option>Text / Article</option></select>
              </div>
            </div>
            <div class="form-group"><div class="form-label">Access Level</div>
              <select class="form-select"><option>All Staff</option><option>Staff Only</option><option>Managers & Above</option><option>DSA Partners</option></select>
            </div>
            <div class="form-group"><div class="form-label">Description</div><textarea class="form-textarea" placeholder="Brief description of this material..."></textarea></div>
            <div style="border:2px dashed #cbd5e1;border-radius:10px;padding:28px;text-align:center;cursor:pointer;margin-bottom:14px;transition:border-color 0.15s;" onmouseover="this.style.borderColor='#2563eb'" onmouseout="this.style.borderColor='#cbd5e1'">
              <div style="font-size:32px;margin-bottom:8px;">📎</div>
              <div style="font-size:13px;font-weight:600;color:#1e293b;">Drop file here or click to browse</div>
              <div style="font-size:11px;color:#94a3b8;margin-top:4px;">PDF, PPT, XLSX, MP4 · Max 50MB</div>
            </div>
            <button class="btn btn-primary" style="width:100%;" onclick="showToast('Material uploaded successfully!','success')">📤 Upload Material</button>
          </div>
          <div class="card">
            <div class="card-title" style="margin-bottom:16px;">🎬 Add Video Lesson</div>
            <div class="form-group"><div class="form-label">Video Title</div><input class="form-input" placeholder="e.g. Understanding FOIR Calculation"></div>
            <div class="form-group"><div class="form-label">YouTube / Vimeo URL</div><input class="form-input" placeholder="https://youtube.com/watch?v=..."></div>
            <div class="form-grid">
              <div class="form-group"><div class="form-label">Duration (mins)</div><input class="form-input" type="number" placeholder="15"></div>
              <div class="form-group"><div class="form-label">Assign to Course</div>
                <select class="form-select"><option>Home Loan Basics</option><option>Business Loans</option><option>CIBIL Mastery</option><option>Standalone</option></select>
              </div>
            </div>
            <div class="form-group"><div class="form-label">Add Quiz after video?</div>
              <select class="form-select"><option>No quiz</option><option>Auto-generate quiz</option><option>Attach existing quiz</option></select>
            </div>
            <button class="btn btn-primary" onclick="showToast('Video lesson added!','success')">➕ Add Lesson</button>
            <div style="margin-top:20px;padding-top:20px;border-top:1px solid #e2e8f0;">
              <div class="card-title" style="margin-bottom:12px;">📋 Create Quiz</div>
              <div class="form-group"><div class="form-label">Quiz Title</div><input class="form-input" placeholder="e.g. Home Loan KYC Quiz"></div>
              <div class="form-group"><div class="form-label">Passing Score (%)</div><input class="form-input" type="number" value="70" min="50" max="100"></div>
              <div class="form-group"><div class="form-label">Time Limit (mins)</div><input class="form-input" type="number" value="15" min="5"></div>
              <button class="btn btn-secondary" onclick="showToast('Quiz created! Add questions in quiz editor.','info')">🧠 Create Quiz</button>
            </div>
          </div>
        </div>
      </div>

    </div><!-- /page-lms -->

    <!-- ===== BANK POLICIES ===== -->
    <div id="page-bankpolicies" class="page">

      <div class="tabs" id="bp-tabs">
        <div class="tab active" onclick="switchBPTab('overview',this)">🏦 All Banks</div>
        <div class="tab" onclick="switchBPTab('homeloan',this)">🏠 Home Loan</div>
        <div class="tab" onclick="switchBPTab('business',this)">💼 Business Loan</div>
        <div class="tab" onclick="switchBPTab('personal',this)">👤 Personal Loan</div>
        <div class="tab" onclick="switchBPTab('car',this)">🚗 Car Loan</div>
        <div class="tab" onclick="switchBPTab('lap',this)">🏗 LAP</div>
      </div>

      <!-- OVERVIEW -->
      <div id="bptab-overview">
        <div class="filter-bar" style="margin-bottom:16px;">
          <div class="search-wrap" style="flex:1;"><input class="form-input" placeholder="Search banks, rates, criteria..."></div>
          <select class="form-select" style="width:140px;"><option>All Banks</option><option>PSU Banks</option><option>Private Banks</option><option>NBFCs</option></select>
          <select class="form-select" style="width:150px;"><option>Sort: Best Rate</option><option>Sort: A-Z</option><option>Sort: Max Tenure</option></select>
        </div>
        <!-- Rate Comparison Banner -->
        <div style="background:linear-gradient(135deg,#ecfdf5,#d1fae5);border:1px solid #a7f3d0;border-radius:14px;padding:16px 20px;margin-bottom:18px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
          <div style="font-size:28px;">💡</div>
          <div>
            <div style="font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:#065f46;">Today's Best Home Loan Rate</div>
            <div style="font-size:13px;color:#047857;margin-top:2px;">PNB Housing offering <strong>8.45% p.a.</strong> for salaried applicants with CIBIL ≥ 750 · Valid till 31 Mar 2025</div>
          </div>
          <button class="btn btn-success btn-sm" style="margin-left:auto;" onclick="showToast('Rate alert set!','success')">🔔 Set Rate Alert</button>
        </div>
        <div class="grid-3" id="bank-policy-grid"></div>
      </div>

      <!-- LOAN TYPE TABS (all share same template) -->
      <div id="bptab-homeloan" style="display:none;"></div>
      <div id="bptab-business" style="display:none;"></div>
      <div id="bptab-personal" style="display:none;"></div>
      <div id="bptab-car" style="display:none;"></div>
      <div id="bptab-lap" style="display:none;"></div>

    </div><!-- /page-bankpolicies -->

  </div><!-- /content -->
</main>

<!-- ── BOTTOM NAVIGATION ── -->
<nav class="bottom-nav" id="bottom-nav" aria-label="Main navigation">
  <div class="bottom-nav-inner" id="bottom-nav-inner"><!-- built by JS --></div>
</nav>


<!-- ===== MODALS ===== -->

<!-- Add Lead -->
<div class="modal-overlay" id="modal-lead">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title">🎯 Add New Lead</div>
      <button class="modal-close" onclick="closeModal('modal-lead')">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-grid">
        <div class="form-group"><div class="form-label">Full Name <span class="req">*</span></div><input class="form-input" placeholder="Client Full Name" id="nl-name"></div>
        <div class="form-group"><div class="form-label">Mobile <span class="req">*</span></div><input class="form-input" placeholder="9876543210" id="nl-phone" type="tel"></div>
        <div class="form-group"><div class="form-label">Email</div><input class="form-input" type="email" placeholder="client@email.com"></div>
        <div class="form-group"><div class="form-label">Loan Type <span class="req">*</span></div>
          <select class="form-select" id="nl-type">
            <option>Home Loan</option><option>Business Loan</option><option>Personal Loan</option><option>Car Loan</option><option>LAP</option><option>Insurance</option>
          </select>
        </div>
        <div class="form-group"><div class="form-label">Loan Amount (₹)</div><input class="form-input" type="number" placeholder="2500000" id="nl-amount"></div>
        <div class="form-group"><div class="form-label">Lead Source</div>
          <select class="form-select">
            <option>Direct</option><option>Website</option><option>Referral</option><option>DSA Partner</option><option>Social Media</option><option>Walk-in</option>
          </select>
        </div>
        <div class="form-group"><div class="form-label">Assign To</div>
          <select class="form-select" id="nl-assign">
            <option>Priya Singh</option><option>Amit Kumar</option><option>Raj Mehta</option><option>Unassigned</option>
          </select>
        </div>
        <div class="form-group"><div class="form-label">Priority</div>
          <select class="form-select" id="nl-priority">
            <option>High</option><option>Medium</option><option>Low</option>
          </select>
        </div>
        <div class="form-group"><div class="form-label">Follow-up Date</div><input class="form-input" type="date" id="nl-followup"></div>
        <div class="form-group"><div class="form-label">Monthly Income (₹)</div><input class="form-input" type="number" placeholder="75000"></div>
      </div>
      <div class="form-group"><div class="form-label">Notes</div><textarea class="form-textarea" placeholder="Additional information about this lead..."></textarea></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal('modal-lead')">Cancel</button>
      <button class="btn btn-primary" onclick="addLead()">✓ Add Lead</button>
    </div>
  </div>
</div>

<!-- Add Employee -->
<div class="modal-overlay" id="modal-emp">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title">👤 Add Employee</div>
      <button class="modal-close" onclick="closeModal('modal-emp')">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-grid">
        <div class="form-group"><div class="form-label">Full Name <span class="req">*</span></div><input class="form-input" placeholder="Employee Name"></div>
        <div class="form-group"><div class="form-label">Mobile <span class="req">*</span></div><input class="form-input" type="tel" placeholder="9876543210"></div>
        <div class="form-group"><div class="form-label">Email <span class="req">*</span></div><input class="form-input" type="email" placeholder="emp@company.com"></div>
        <div class="form-group"><div class="form-label">Role</div>
          <select class="form-select">
            <option>Staff</option><option>Manager</option><option>Team Lead</option><option>Admin</option><option>DSA Partner</option>
          </select>
        </div>
        <div class="form-group"><div class="form-label">Department</div>
          <select class="form-select">
            <option>Home Loans</option><option>Business Loans</option><option>Personal Loans</option><option>Insurance</option><option>CIBIL</option>
          </select>
        </div>
        <div class="form-group"><div class="form-label">Commission Rate (%)</div><input class="form-input" type="number" placeholder="0.25" step="0.05"></div>
        <div class="form-group"><div class="form-label">Joining Date</div><input class="form-input" type="date"></div>
        <div class="form-group"><div class="form-label">Work Type</div>
          <select class="form-select">
            <option>In-House</option><option>Work From Home</option><option>Hybrid</option>
          </select>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal('modal-emp')">Cancel</button>
      <button class="btn btn-primary" onclick="closeModal('modal-emp');showToast('Employee added successfully!','success')">✓ Add Employee</button>
    </div>
  </div>
</div>

<!-- Add Client -->
<div class="modal-overlay" id="modal-client">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title">👤 Add Client Profile</div>
      <button class="modal-close" onclick="closeModal('modal-client')">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-grid">
        <div class="form-group"><div class="form-label">Full Name <span class="req">*</span></div><input class="form-input" placeholder="Client Name"></div>
        <div class="form-group"><div class="form-label">PAN Number</div><input class="form-input" placeholder="ABCDE1234F" style="text-transform:uppercase;"></div>
        <div class="form-group"><div class="form-label">Mobile <span class="req">*</span></div><input class="form-input" type="tel" placeholder="9876543210"></div>
        <div class="form-group"><div class="form-label">Email</div><input class="form-input" type="email" placeholder="client@email.com"></div>
        <div class="form-group"><div class="form-label">Loan Type</div>
          <select class="form-select">
            <option>Home Loan</option><option>Business Loan</option><option>Personal Loan</option><option>Car Loan</option>
          </select>
        </div>
        <div class="form-group"><div class="form-label">Loan Amount (₹)</div><input class="form-input" type="number" placeholder="2500000"></div>
        <div class="form-group"><div class="form-label">Monthly Income (₹)</div><input class="form-input" type="number" placeholder="75000"></div>
        <div class="form-group"><div class="form-label">CIBIL Score</div><input class="form-input" type="number" placeholder="720" min="300" max="900"></div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal('modal-client')">Cancel</button>
      <button class="btn btn-primary" onclick="closeModal('modal-client');showToast('Client profile created!','success')">✓ Add Client</button>
    </div>
  </div>
</div>

<!-- Add Franchise -->
<div class="modal-overlay" id="modal-franchise">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title">🏢 Add Franchise / Branch</div>
      <button class="modal-close" onclick="closeModal('modal-franchise')">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-grid">
        <div class="form-group"><div class="form-label">Branch Name <span class="req">*</span></div><input class="form-input" placeholder="e.g. Mumbai West Branch"></div>
        <div class="form-group"><div class="form-label">Owner Name <span class="req">*</span></div><input class="form-input" placeholder="Owner Full Name"></div>
        <div class="form-group"><div class="form-label">Mobile <span class="req">*</span></div><input class="form-input" type="tel" placeholder="9876543210"></div>
        <div class="form-group"><div class="form-label">Email</div><input class="form-input" type="email" placeholder="branch@email.com"></div>
        <div class="form-group"><div class="form-label">City</div><input class="form-input" placeholder="Mumbai"></div>
        <div class="form-group"><div class="form-label">Commission Rate (%)</div><input class="form-input" type="number" placeholder="0.30" step="0.05"></div>
        <div class="form-group"><div class="form-label">Agreement Date</div><input class="form-input" type="date"></div>
        <div class="form-group"><div class="form-label">Type</div>
          <select class="form-select">
            <option>DSA Partner</option><option>IDC Partner</option><option>Full Branch</option>
          </select>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal('modal-franchise')">Cancel</button>
      <button class="btn btn-success" onclick="closeModal('modal-franchise');showToast('Franchise added successfully!','success')">✓ Add Franchise</button>
    </div>
  </div>
</div>

<!-- TOAST -->
<div class="toast-container" id="toast-container"></div>

<!-- ===== JAVASCRIPT ===== -->
<script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script><script>
'use strict';

// ===== DATA =====
const LEADS = [
  {id:1,name:'Rajesh Kumar',initials:'RK',phone:'9876543210',type:'Home Loan',amount:'₹45L',stage:'Docs Pending',assigned:'Priya Singh',priority:'High',followup:'2025-01-20',color:'#2563eb'},
  {id:2,name:'Meena Patel',initials:'MP',phone:'9876541234',type:'Business Loan',amount:'₹20L',stage:'Login',assigned:'Amit Kumar',priority:'High',followup:'2025-01-18',color:'#059669'},
  {id:3,name:'Suresh Yadav',initials:'SY',phone:'9876549999',type:'Personal Loan',amount:'₹5L',stage:'New',assigned:'Unassigned',priority:'Medium',followup:'2025-01-22',color:'#d97706'},
  {id:4,name:'Anika Sharma',initials:'AS',phone:'9876548888',type:'Car Loan',amount:'₹8L',stage:'Sanctioned',assigned:'Raj Mehta',priority:'Low',followup:'2025-01-25',color:'#7c3aed'},
  {id:5,name:'Vivek Gupta',initials:'VG',phone:'9876547777',type:'Home Loan',amount:'₹60L',stage:'Disbursed',assigned:'Priya Singh',priority:'High',followup:'2025-01-28',color:'#0891b2'},
  {id:6,name:'Deepak Nair',initials:'DN',phone:'9876546666',type:'LAP',amount:'₹80L',stage:'CIBIL',assigned:'Amit Kumar',priority:'High',followup:'2025-01-19',color:'#ea580c'},
  {id:7,name:'Sunita Joshi',initials:'SJ',phone:'9876545555',type:'Business Loan',amount:'₹35L',stage:'Processing',assigned:'Raj Mehta',priority:'Medium',followup:'2025-01-21',color:'#0891b2'},
  {id:8,name:'Arjun Singh',initials:'AR',phone:'9876544444',type:'Home Loan',amount:'₹90L',stage:'Contacted',assigned:'Priya Singh',priority:'High',followup:'2025-01-17',color:'#059669'},
];

const CLIENTS = [
  {name:'Rajesh Kumar',initials:'RK',phone:'9876543210',type:'Home Loan',amount:'₹45L',cibil:740,stage:'Docs Pending',manager:'Priya Singh'},
  {name:'Meena Patel',initials:'MP',phone:'9876541234',type:'Business Loan',amount:'₹20L',cibil:680,stage:'Login',manager:'Amit Kumar'},
  {name:'Vivek Gupta',initials:'VG',phone:'9876547777',type:'Home Loan',amount:'₹60L',cibil:760,stage:'Disbursed',manager:'Priya Singh'},
  {name:'Anika Sharma',initials:'AS',phone:'9876548888',type:'Car Loan',amount:'₹8L',cibil:720,stage:'Sanctioned',manager:'Raj Mehta'},
];

const EMPLOYEES = [
  {name:'Priya Singh',initials:'PS',role:'Sr. Manager',dept:'Home Loans',leads:42,conv:18,commission:'₹1,08,000',status:'Active',bg:'linear-gradient(135deg,#2563eb,#7c3aed)'},
  {name:'Amit Kumar',initials:'AK',role:'Manager',dept:'Business Loans',leads:36,conv:13,commission:'₹78,000',status:'Active',bg:'linear-gradient(135deg,#059669,#0891b2)'},
  {name:'Raj Mehta',initials:'RM',role:'Executive',dept:'Personal Loans',leads:28,conv:8,commission:'₹48,000',status:'Active',bg:'linear-gradient(135deg,#d97706,#ea580c)'},
  {name:'Neha Verma',initials:'NV',role:'Executive',dept:'Insurance',leads:22,conv:9,commission:'₹36,000',status:'Active',bg:'linear-gradient(135deg,#7c3aed,#a21caf)'},
  {name:'Karan Jain',initials:'KJ',role:'Team Lead',dept:'CIBIL',leads:18,conv:5,commission:'₹24,000',status:'On Leave',bg:'linear-gradient(135deg,#0891b2,#059669)'},
];

const FRANCHISES = [
  {name:'Mumbai West DSA',code:'EFW-MUM01',owner:'Rohit Shah',city:'Mumbai',leads:48,conv:18,amount:'₹2.8Cr',rate:'0.30%',payout:'₹84,000',status:'Active'},
  {name:'Pune Central',code:'EFW-PUN01',owner:'Sanjay Patil',city:'Pune',leads:36,conv:12,amount:'₹1.9Cr',rate:'0.28%',payout:'₹53,200',status:'Active'},
  {name:'Delhi North Branch',code:'EFW-DEL01',owner:'Vikram Arora',city:'Delhi',leads:28,conv:8,amount:'₹1.2Cr',rate:'0.25%',payout:'₹30,000',status:'Active'},
  {name:'Bangalore IDC',code:'EFW-BLR01',owner:'Ramesh Kumar',city:'Bangalore',leads:22,conv:6,amount:'₹0.8Cr',rate:'0.30%',payout:'₹24,000',status:'Inactive'},
];

const STAGE_BADGE = {
  'New':'badge-new','Contacted':'badge-contacted','Docs Pending':'badge-docs',
  'Docs Received':'badge-docs','CIBIL':'badge-cibil','Login':'badge-login',
  'Processing':'badge-processing','Sanctioned':'badge-sanction','Disbursed':'badge-disbursed','Closed':'badge-closed'
};

// ===== SIDEBAR =====
function toggleSidebar() {
  const s = document.getElementById('sidebar');
  const o = document.getElementById('sidebar-overlay');
  s.classList.toggle('open');
  o.classList.toggle('open');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
}

// ===== NAVIGATION (base – overridden after login by role-aware version) =====
function showPage(id, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pg = document.getElementById('page-' + id);
  if (pg) pg.classList.add('active');
  if (el) el.classList.add('active');
  closeSidebar();
}

// ===== TAB SWITCHER =====
function switchTab(prefix, id, el) {
  const allTabs = el ? el.closest('.tabs') : null;
  if (allTabs) allTabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
  // find siblings with prefix-
  const parent = el ? el.closest('.page') || el.closest('.card') || document.body : document.body;
  parent.querySelectorAll('[id^="' + prefix + '-"]').forEach(d => {
    d.style.display = d.id === prefix + '-' + id ? 'block' : 'none';
  });
}

// ===== MODALS =====
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('open');
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
});

// ===== RENDER LEADS =====
function renderLeads() {
  const prioMap = {High:'badge-high',Medium:'badge-med',Low:'badge-low'};
  document.getElementById('leads-tbody').innerHTML = LEADS.map(l => `
    <tr>
      <td><input type="checkbox"></td>
      <td>
        <div class="td-name">
          <div class="mini-avatar" style="background:linear-gradient(135deg,${l.color},${l.color}99);">${l.initials}</div>
          <strong>${l.name}</strong>
        </div>
      </td>
      <td><a href="tel:${l.phone}" style="color:var(--accent);">${l.phone}</a></td>
      <td>${l.type}</td>
      <td style="color:var(--green);font-weight:600;">${l.amount}</td>
      <td>
        <select class="form-select" style="min-width:130px;padding:4px 8px;font-size:11px;" onchange="updateLeadStage(${l.id},this.value)">
          ${['New','Contacted','Docs Pending','Docs Received','CIBIL','Login','Processing','Sanctioned','Disbursed','Closed'].map(s=>`<option${s===l.stage?' selected':''}>${s}</option>`).join('')}
        </select>
      </td>
      <td style="font-size:12px;">${l.assigned}</td>
      <td><span class="badge ${prioMap[l.priority]||'badge-med'}">${l.priority}</span></td>
      <td style="font-size:12px;color:var(--text2);">${l.followup}</td>
      <td>
        <div style="display:flex;gap:4px;">
          <button class="btn btn-ghost btn-xs" onclick="showPage('clients',document.querySelector('[data-page=clients]'))">👁</button>
          <button class="btn btn-ghost btn-xs">✏️</button>
          <button class="btn btn-ghost btn-xs" style="color:var(--red);">🗑</button>
        </div>
      </td>
    </tr>`).join('');
}
function updateLeadStage(id, stage) {
  const l = LEADS.find(x => x.id === id);
  if (l) { l.stage = stage; renderPipeline(); showToast(`Stage updated to "${stage}"`, 'success'); }
}

// ===== RENDER CLIENTS =====
function renderClients() {
  const stageMap = {'Docs Pending':'badge-docs','Login':'badge-login','Disbursed':'badge-disbursed','Sanctioned':'badge-sanction'};
  document.getElementById('clients-tbody').innerHTML = CLIENTS.map((c, i) => `
    <tr>
      <td style="cursor:pointer;" onclick="openClientDetail(${i})">
        <div class="td-name">
          <div class="mini-avatar">${c.initials}</div>
          <strong>${c.name}</strong>
        </div>
      </td>
      <td>${c.phone}</td>
      <td>${c.type}</td>
      <td style="color:var(--green);font-weight:600;">${c.amount}</td>
      <td><strong style="color:${c.cibil>=750?'var(--green)':c.cibil>=650?'var(--cyan)':'var(--red)'};">${c.cibil}</strong></td>
      <td><span class="badge ${stageMap[c.stage]||'badge-new'}">${c.stage}</span></td>
      <td style="font-size:12px;">${c.manager}</td>
      <td>
        <div style="display:flex;gap:4px;">
          <button class="btn btn-ghost btn-xs" onclick="openClientDetail(${i})">👁 View</button>
          <button class="btn btn-ghost btn-xs">✏️</button>
        </div>
      </td>
    </tr>`).join('');
}
function openClientDetail(i) {
  const c = CLIENTS[i];
  document.getElementById('cd-av').textContent = c.initials;
  document.getElementById('cd-name').textContent = c.name;
  document.getElementById('cd-meta').textContent = `📞 ${c.phone} · ${c.type} · CIBIL: ${c.cibil}`;
  document.getElementById('client-detail').style.display = 'block';
  document.getElementById('client-detail').scrollIntoView({behavior:'smooth',block:'start'});
}

// ===== RENDER EMPLOYEES =====
function renderEmployees() {
  document.getElementById('emp-tbody').innerHTML = EMPLOYEES.map(e => {
    const rate = Math.round((e.conv / e.leads) * 100);
    return `
    <tr>
      <td>
        <div class="td-name">
          <div class="mini-avatar" style="background:${e.bg};">${e.initials}</div>
          <strong>${e.name}</strong>
        </div>
      </td>
      <td style="font-size:12px;">${e.role}</td>
      <td style="font-size:12px;">${e.dept}</td>
      <td style="font-weight:600;">${e.leads}</td>
      <td style="font-weight:600;color:var(--green);">${e.conv}</td>
      <td>
        <div style="display:flex;align-items:center;gap:6px;">
          <strong style="font-size:12px;color:${rate>=40?'var(--green)':rate>=30?'var(--gold)':'var(--text2)'};">${rate}%</strong>
          <div class="progress-bar" style="width:50px;"><div class="progress-fill" style="width:${rate}%;background:${rate>=40?'var(--green)':rate>=30?'var(--gold)':'var(--text3)'}"></div></div>
        </div>
      </td>
      <td style="color:var(--text);font-weight:600;">${e.commission}</td>
      <td><span class="badge ${e.status==='Active'?'badge-active':'badge-docs'}">${e.status}</span></td>
      <td>
        <div style="display:flex;gap:3px;">
          <button class="btn btn-ghost btn-xs">👁</button>
          <button class="btn btn-ghost btn-xs">✏️</button>
          <button class="btn btn-secondary btn-xs" onclick="showToast('Leads assigned to ${e.name}','info')">📋</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

// ===== RENDER FRANCHISES =====
function renderFranchises() {
  document.getElementById('franchise-grid').innerHTML = FRANCHISES.map(f => `
    <div class="fr-card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:4px;gap:8px;">
        <div>
          <div style="font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:var(--text);">${f.name}</div>
          <div style="font-size:11px;color:var(--text3);margin-top:1px;">${f.code} · ${f.city}</div>
        </div>
        <span class="badge ${f.status==='Active'?'badge-active':'badge-inactive'}">${f.status}</span>
      </div>
      <div style="font-size:12px;color:var(--text2);margin-top:8px;">👤 ${f.owner}</div>
      <div style="font-size:12px;color:var(--text2);margin-top:3px;">💰 Commission: ${f.rate}</div>
      <div class="fr-stats">
        <div class="franchise-stat"><div class="fr-stat-val" style="color:var(--accent);">${f.leads}</div><div class="fr-stat-lbl">Leads</div></div>
        <div class="franchise-stat"><div class="fr-stat-val" style="color:var(--green);">${f.conv}</div><div class="fr-stat-lbl">Converted</div></div>
        <div class="franchise-stat"><div class="fr-stat-val" style="color:var(--gold);font-size:13px;">${f.amount}</div><div class="fr-stat-lbl">Disbursed</div></div>
      </div>
      <div style="display:flex;gap:6px;margin-top:12px;">
        <button class="btn btn-ghost btn-sm" style="flex:1;">👁 View</button>
        <button class="btn btn-primary btn-sm" style="flex:1;">📋 Leads</button>
      </div>
    </div>`).join('');

  document.getElementById('franchise-tbody').innerHTML = FRANCHISES.map(f => `
    <tr>
      <td><strong>${f.name}</strong></td>
      <td style="font-size:12px;">${f.owner}</td>
      <td>${f.leads}</td>
      <td style="color:var(--green);font-weight:600;">${f.conv}</td>
      <td style="color:var(--accent);font-weight:600;">${f.amount}</td>
      <td>${f.rate}</td>
      <td><span class="badge badge-docs">${f.payout}</span></td>
      <td>
        <div style="display:flex;gap:4px;">
          <button class="btn btn-ghost btn-xs">👁</button>
          <button class="btn btn-primary btn-xs" onclick="showToast('Payout processed!','success')">💰 Pay</button>
        </div>
      </td>
    </tr>`).join('');
}

// ===== RENDER LEADERBOARD =====
function renderLeaderboard() {
  const medals = ['🥇','🥈','🥉','',''];
  const html = EMPLOYEES.sort((a,b)=>b.conv-a.conv).map((e,i)=>`
    <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:${i<4?'1px solid var(--border)':'none'};">
      <div style="width:22px;text-align:center;font-size:13px;">${medals[i]||(i+1+'.')}</div>
      <div class="mini-avatar" style="background:${e.bg};">${e.initials}</div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${e.name}</div>
        <div style="font-size:11px;color:var(--text3);">${e.dept}</div>
      </div>
      <div style="font-size:13px;font-weight:700;color:var(--green);">${e.conv} deals</div>
      <div style="width:60px;"><div class="progress-bar"><div class="progress-fill" style="width:${(e.conv/18)*100}%;background:${i===0?'var(--gold)':i===1?'var(--accent)':'var(--green)'}"></div></div></div>
    </div>`).join('');
  document.getElementById('dash-leaderboard').innerHTML = html;
  const rpt = document.getElementById('rpt-leaderboard');
  if (rpt) rpt.innerHTML = html;
}

// ===== RENDER TREND CHART =====
function renderTrendChart() {
  const months = ['Aug','Sep','Oct','Nov','Dec','Jan'];
  const vals = [38,45,52,48,61,86];
  const max = Math.max(...vals);
  const tc = document.getElementById('trend-chart');
  const tl = document.getElementById('trend-labels');
  if (!tc) return;
  tc.innerHTML = vals.map((v,i) => `
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;">
      <div style="font-size:11px;font-weight:${i===5?'700':'400'};color:${i===5?'var(--accent)':'var(--text3)'};">${v}</div>
      <div style="flex:1;width:100%;display:flex;align-items:flex-end;">
        <div style="width:100%;height:${(v/max)*80}px;border-radius:4px 4px 0 0;background:${i===5?'var(--accent)':'var(--bg2)'};border:${i===5?'none':'1px solid var(--border)'};"></div>
      </div>
    </div>`).join('');
  tl.innerHTML = months.map((m,i) => `<div style="flex:1;text-align:center;font-size:10px;color:${i===5?'var(--accent)':'var(--text3)'};font-weight:${i===5?700:400};">${m}</div>`).join('');
}

// ===== RENDER LOAN TYPE CHART =====
function renderLoanTypeChart() {
  const el = document.getElementById('loan-type-chart');
  if (!el) return;
  const types = [
    {name:'Home Loan',pct:42,color:'var(--accent)'},
    {name:'Business Loan',pct:28,color:'var(--purple)'},
    {name:'Personal Loan',pct:18,color:'var(--green)'},
    {name:'Car Loan',pct:8,color:'var(--gold)'},
    {name:'Others',pct:4,color:'var(--text3)'},
  ];
  el.innerHTML = types.map(t => `
    <div style="margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;">
        <span style="display:flex;align-items:center;gap:6px;"><span style="width:10px;height:10px;border-radius:2px;background:${t.color};display:inline-block;flex-shrink:0;"></span>${t.name}</span>
        <strong>${t.pct}%</strong>
      </div>
      <div class="progress-bar" style="height:8px;"><div class="progress-fill" style="width:${t.pct}%;background:${t.color};"></div></div>
    </div>`).join('');
}

// ===== RENDER PIPELINE =====
function renderPipeline() {
  const stages = ['New','Contacted','Docs Pending','Login','Processing','Sanctioned','Disbursed'];
  const ph = {New:'ph-new',Contacted:'ph-contacted','Docs Pending':'ph-docs',Login:'ph-login',Processing:'ph-processing',Sanctioned:'ph-sanction',Disbursed:'ph-disbursed'};
  const board = document.getElementById('pipeline-board');
  if (!board) return;
  board.innerHTML = stages.map(stage => {
    const leads = LEADS.filter(l => l.stage === stage);
    return `
      <div class="pipeline-col">
        <div class="pipeline-header ${ph[stage]||'ph-new'}">
          <span>${stage}</span>
          <span style="background:rgba(0,0,0,0.1);border-radius:10px;padding:1px 7px;">${leads.length}</span>
        </div>
        ${leads.map(l => `
          <div class="pipeline-card">
            <div class="pc-name">${l.name}</div>
            <div class="pc-meta">${l.phone}</div>
            <div class="pc-amount">${l.type} · ${l.amount}</div>
            <div class="pc-footer">
              <span>👤 ${l.assigned.split(' ')[0]}</span>
              <span>${l.followup}</span>
            </div>
          </div>`).join('')}
        <div style="text-align:center;padding:10px 0;font-size:12px;color:var(--text3);cursor:pointer;border:2px dashed var(--border);border-radius:8px;margin-top:4px;" onclick="openModal('modal-lead')">+ Add Lead</div>
      </div>`;
  }).join('');
}

// ===== RENDER REPORT LEADS =====
function renderReportLeads() {
  document.getElementById('rpt-leads-tbody').innerHTML = LEADS.map(l => `
    <tr>
      <td><div class="td-name"><div class="mini-avatar" style="background:linear-gradient(135deg,${l.color},${l.color}99);">${l.initials}</div>${l.name}</div></td>
      <td>${l.type}</td><td style="color:var(--green);font-weight:600;">${l.amount}</td>
      <td><span class="badge ${STAGE_BADGE[l.stage]||'badge-new'}">${l.stage}</span></td>
      <td>${l.followup}</td><td>${l.assigned}</td>
      <td>${Math.floor(Math.random()*20)+1} days</td>
    </tr>`).join('');
}

// ===== EMI CALCULATOR =====
function calcEMI() {
  const p = +document.getElementById('la').value;
  const r = +document.getElementById('ir').value / 12 / 100;
  const n = +document.getElementById('tn').value * 12;
  document.getElementById('la-disp').textContent = '₹' + p.toLocaleString('en-IN');
  document.getElementById('ir-disp').textContent = (+document.getElementById('ir').value).toFixed(2) + '%';
  document.getElementById('tn-disp').textContent = document.getElementById('tn').value + ' years';
  const emi = (p * r * Math.pow(1+r,n)) / (Math.pow(1+r,n)-1);
  const total = emi * n;
  const interest = total - p;
  document.getElementById('emi-val').textContent = '₹' + Math.round(emi).toLocaleString('en-IN');
  document.getElementById('emi-principal').textContent = '₹' + p.toLocaleString('en-IN');
  document.getElementById('emi-interest').textContent = '₹' + Math.round(interest).toLocaleString('en-IN');
  document.getElementById('emi-total').textContent = '₹' + Math.round(total).toLocaleString('en-IN');
  renderBankComparison(p, n);
}

function renderBankComparison(p, n) {
  const el = document.getElementById('bank-compare');
  if (!el) return;
  const banks = [
    {name:'SBI', rate:8.50, color:'#2563eb'},
    {name:'HDFC', rate:8.75, color:'#7c3aed'},
    {name:'ICICI', rate:9.00, color:'#059669'},
    {name:'Axis', rate:8.65, color:'#d97706'},
    {name:'Kotak', rate:9.25, color:'#ea580c'},
    {name:'PNB', rate:8.45, color:'#0891b2'},
  ];
  el.innerHTML = banks.map(b => {
    const r = b.rate / 12 / 100;
    const emi = Math.round((p * r * Math.pow(1+r,n)) / (Math.pow(1+r,n)-1));
    return `
      <div class="bank-row">
        <div class="bank-tag" style="color:${b.color};border:1px solid ${b.color}33;">${b.name}</div>
        <div style="flex:1;">
          <div style="font-size:11px;color:var(--text2);">${b.rate}% p.a.</div>
        </div>
        <div class="bank-emi" style="color:${b.color};">₹${emi.toLocaleString('en-IN')}</div>
      </div>`;
  }).join('');
}

// ===== ELIGIBILITY CALCULATOR =====
function calcEligibility() {
  const income = +document.getElementById('eli-income').value || 0;
  const existing = +document.getElementById('eli-emi').value || 0;
  const age = +document.getElementById('eli-age').value || 0;
  const cibil = +document.getElementById('eli-cibil').value || 0;
  const el = document.getElementById('eli-result');
  if (!income || !age) return;
  const avail = income * 0.5 - existing;
  const r = 8.5 / 12 / 100;
  const maxYrs = Math.min(30, 60 - age);
  const nn = maxYrs * 12;
  const maxLoan = avail > 0 ? avail * (Math.pow(1+r,nn)-1) / (r*Math.pow(1+r,nn)) : 0;
  const eligible = cibil >= 650 && age >= 21 && age <= 60 && maxLoan > 100000;
  const meter = Math.min(100, Math.max(0, ((cibil||500)-300)/600*100));
  const mColor = meter > 70 ? 'var(--green)' : meter > 50 ? 'var(--gold)' : 'var(--red)';
  el.innerHTML = `
    <div style="margin-bottom:14px;">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px;"><span style="color:var(--text2);">Eligibility Confidence</span><strong>${meter.toFixed(0)}%</strong></div>
      <div class="progress-bar" style="height:10px;border-radius:5px;"><div class="progress-fill" style="width:${meter}%;background:${mColor};border-radius:5px;"></div></div>
    </div>
    ${eligible ? `
      <div style="background:var(--green-light);border:1px solid #a7f3d0;border-radius:10px;padding:16px;text-align:center;margin-bottom:12px;">
        <div style="font-size:11px;font-weight:600;color:var(--green);">✅ ELIGIBLE FOR LOAN</div>
        <div style="font-family:'Syne',sans-serif;font-size:26px;font-weight:800;color:var(--green);margin:6px 0;">₹${(maxLoan/100000).toFixed(1)}L</div>
        <div style="font-size:11px;color:var(--text3);">Maximum Loan Amount</div>
      </div>
      <div style="font-size:12px;color:var(--text2);margin-bottom:4px;">📊 FOIR: ${((existing/income)*100).toFixed(0)}% · Available capacity: ${((avail/income)*100).toFixed(0)}%</div>
      <div style="font-size:12px;color:var(--text2);">🏦 Recommended: SBI, HDFC, ICICI</div>
    ` : `
      <div style="background:var(--red-light);border:1px solid #fecaca;border-radius:10px;padding:16px;text-align:center;">
        <div style="font-size:11px;font-weight:600;color:var(--red);">❌ NOT CURRENTLY ELIGIBLE</div>
        <div style="font-size:12px;color:var(--text2);margin-top:6px;">${cibil < 650 ? 'CIBIL score below minimum 650.' : age < 21 ? 'Minimum age requirement is 21 years.' : maxLoan <= 100000 ? 'Insufficient income after existing obligations.' : 'Please check all inputs.'}</div>
      </div>
    `}`;
}

// ===== FOIR CALCULATOR =====
function calcFOIR() {
  const income = +document.getElementById('foir-income').value || 0;
  const proposed = +document.getElementById('foir-proposed').value || 0;
  const existing = +document.getElementById('foir-existing').value || 0;
  if (!income) return;
  const total = proposed + existing;
  const foir = (total / income) * 100;
  const s = foir <= 40 ? {label:'Excellent',color:'var(--green)',bg:'var(--green-light)',border:'#a7f3d0',icon:'✅'} :
             foir <= 50 ? {label:'Acceptable',color:'var(--gold)',bg:'var(--gold-light)',border:'#fde68a',icon:'⚠️'} :
             {label:'High Risk',color:'var(--red)',bg:'var(--red-light)',border:'#fecaca',icon:'❌'};
  document.getElementById('foir-result').innerHTML = `
    <div style="text-align:center;margin-bottom:16px;">
      <div style="font-family:'Syne',sans-serif;font-size:42px;font-weight:800;color:${s.color};">${foir.toFixed(1)}%</div>
      <div style="font-size:13px;font-weight:600;">${s.icon} ${s.label}</div>
    </div>
    <div style="background:${s.bg};border:1px solid ${s.border};border-radius:10px;padding:14px;margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;"><span style="color:var(--text2);">Monthly Income</span><strong>₹${income.toLocaleString('en-IN')}</strong></div>
      <div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;border-top:1px solid ${s.border};"><span style="color:var(--text2);">Proposed EMI</span><strong>₹${proposed.toLocaleString('en-IN')}</strong></div>
      <div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;border-top:1px solid ${s.border};"><span style="color:var(--text2);">Existing EMIs</span><strong>₹${existing.toLocaleString('en-IN')}</strong></div>
      <div style="display:flex;justify-content:space-between;font-size:13px;padding:6px 0;border-top:1px solid ${s.border};font-weight:700;"><span>Total FOIR</span><span style="color:${s.color};">${foir.toFixed(1)}%</span></div>
    </div>
    <div style="font-size:11px;color:var(--text3);">Most banks require FOIR ≤ 50%. Ideal is below 40%.</div>`;
}

// ===== CIBIL CHECKER =====
function checkCIBIL() {
  const scores = [575, 610, 645, 680, 710, 735, 755, 772, 790, 818, 842];
  const score = scores[Math.floor(Math.random() * scores.length)];
  const pct = ((score - 300) / 600) * 100;
  const g = score >= 750 ? {label:'Excellent',color:'var(--green)',bg:'var(--green-light)',border:'#a7f3d0'} :
            score >= 700 ? {label:'Good',color:'var(--cyan)',bg:'var(--cyan-light)',border:'#a5f3fc'} :
            score >= 650 ? {label:'Fair',color:'var(--gold)',bg:'var(--gold-light)',border:'#fde68a'} :
            {label:'Poor',color:'var(--red)',bg:'var(--red-light)',border:'#fecaca'};
  const dash = 2 * Math.PI * 53;
  const filled = (pct / 100) * dash;
  document.getElementById('cibil-result').innerHTML = `
    <div style="text-align:center;margin-bottom:16px;">
      <div style="width:148px;height:148px;margin:0 auto 12px;position:relative;">
        <svg width="148" height="148" viewBox="0 0 148 148">
          <circle cx="74" cy="74" r="53" fill="none" stroke="var(--bg2)" stroke-width="16"/>
          <circle cx="74" cy="74" r="53" fill="none" stroke="${g.color}" stroke-width="16"
            stroke-dasharray="${filled.toFixed(1)} ${dash.toFixed(1)}"
            stroke-dashoffset="${(dash/4).toFixed(1)}"
            transform="rotate(-90 74 74)" stroke-linecap="round"/>
        </svg>
        <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <div style="font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:${g.color};">${score}</div>
          <div style="font-size:10px;color:var(--text3);">out of 900</div>
        </div>
      </div>
      <div style="display:inline-block;background:${g.bg};border:1px solid ${g.border};border-radius:20px;padding:4px 14px;font-size:13px;font-weight:700;color:${g.color};">${g.label}</div>
    </div>
    <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;font-size:12px;padding:5px 0;"><span style="color:var(--text2);">Score Range</span><strong>${score>=750?'750–900':score>=700?'700–749':score>=650?'650–699':'300–649'}</strong></div>
      <div style="display:flex;justify-content:space-between;font-size:12px;padding:5px 0;border-top:1px solid var(--border);"><span style="color:var(--text2);">Loan Eligibility</span><span style="font-weight:600;color:${score>=650?'var(--green)':'var(--red)'};">${score>=650?'✅ Eligible':'❌ Not Eligible'}</span></div>
      <div style="display:flex;justify-content:space-between;font-size:12px;padding:5px 0;border-top:1px solid var(--border);"><span style="color:var(--text2);">Best Rate Available</span><strong>${score>=750?'8.5%':score>=700?'9.5%':'12%+'} p.a.</strong></div>
      <div style="display:flex;justify-content:space-between;font-size:12px;padding:5px 0;border-top:1px solid var(--border);"><span style="color:var(--text2);">Report Date</span><strong>${new Date().toLocaleDateString('en-IN')}</strong></div>
    </div>
    <button class="btn btn-success" style="width:100%;">📥 Download Report</button>`;
  showToast('CIBIL report generated successfully!', 'success');
}

// ===== ADD LEAD =====
function addLead() {
  const name = document.getElementById('nl-name').value.trim();
  const phone = document.getElementById('nl-phone').value.trim();
  if (!name || !phone) { showToast('Please fill Name and Mobile', 'error'); return; }
  const colors = ['#2563eb','#059669','#d97706','#7c3aed','#ea580c','#0891b2'];
  LEADS.unshift({
    id: LEADS.length + 1,
    name, phone,
    initials: name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(),
    type: document.getElementById('nl-type').value,
    amount: document.getElementById('nl-amount').value ? '₹' + parseInt(document.getElementById('nl-amount').value).toLocaleString('en-IN') : 'TBD',
    stage: 'New',
    assigned: document.getElementById('nl-assign').value,
    priority: document.getElementById('nl-priority').value,
    followup: document.getElementById('nl-followup').value || 'TBD',
    color: colors[Math.floor(Math.random()*colors.length)]
  });
  renderLeads();
  renderPipeline();
  closeModal('modal-lead');
  showToast(`Lead "${name}" added successfully!`, 'success');
}

// ===== TOAST =====
function showToast(msg, type = 'info') {
  const icons = {success:'✅', info:'ℹ️', error:'❌'};
  const tc = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type]||'📌'}</span><span style="flex:1;">${msg}</span>`;
  tc.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity 0.3s, transform 0.3s';
    el.style.opacity = '0'; el.style.transform = 'translateX(20px)';
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

// ===== CHIP TOGGLE =====
document.querySelectorAll('.chip').forEach(c => {
  c.addEventListener('click', () => {
    c.closest('div').querySelectorAll('.chip').forEach(x => x.classList.remove('active'));
    c.classList.add('active');
  });
});

// ===== INIT =====
// ===== ADMIN SETTINGS =====

function switchSettingsTab(id, el) {
  document.querySelectorAll('[id^="stab-"]').forEach(d => d.style.display = 'none');
  const t = document.getElementById('stab-' + id);
  if (t) t.style.display = 'block';
  document.querySelectorAll('#settings-tabs .tab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
  // lazy render
  if (id === 'users') renderSettingsUsers();
  if (id === 'commission') renderCommissionSlabs();
  if (id === 'notifications') renderNotifRules();
  if (id === 'lead-config') { renderStageList(); renderLeadFields(); renderBankMaster(); }
  if (id === 'security') { renderSecurityToggles(); renderAuditLog(); }
}

function saveSettings(section) {
  showToast(`${section} saved successfully!`, 'success');
}

// ---- USERS TABLE ----
function renderSettingsUsers() {
  const tbody = document.getElementById('settings-users-tbody');
  if (!tbody) return;
  const users = [
    { name:'Admin User', initials:'AD', email:'admin@easyfinancewale.in', role:'Super Admin', dept:'All', access:'Full', last:'Today, 9:12 AM', status:'Active', bg:'linear-gradient(135deg,#2563eb,#7c3aed)' },
    ...EMPLOYEES.map(e => ({
      name: e.name, initials: e.initials, email: e.name.toLowerCase().replace(' ','.') + '@easyfinancewale.in',
      role: e.role, dept: e.dept, access: e.role === 'Manager' || e.role === 'Sr. Manager' ? 'Manager' : 'Staff',
      last: 'Today', status: e.status, bg: e.bg
    }))
  ];
  tbody.innerHTML = users.map(u => `
    <tr>
      <td><div class="td-name"><div class="mini-avatar" style="background:${u.bg||'linear-gradient(135deg,#2563eb,#7c3aed)'};">${u.initials}</div><strong>${u.name}</strong></div></td>
      <td style="font-size:12px;color:var(--text2);">${u.email}</td>
      <td><span class="badge ${u.role==='Super Admin'?'badge-high':u.role.includes('Manager')?'badge-cibil':'badge-new'}">${u.role}</span></td>
      <td style="font-size:12px;">${u.dept}</td>
      <td style="font-size:12px;">${u.access}</td>
      <td style="font-size:12px;color:var(--text3);">${u.last}</td>
      <td><span class="badge ${u.status==='Active'?'badge-active':'badge-docs'}">${u.status}</span></td>
      <td>
        <div style="display:flex;gap:4px;">
          <button class="btn btn-ghost btn-xs" onclick="showToast('Edit user opened','info')">✏️</button>
          <button class="btn btn-ghost btn-xs" onclick="toggleUserStatus(this)" style="${u.role==='Super Admin'?'opacity:0.3;pointer-events:none;':''}">
            ${u.status==='Active'?'🚫 Block':'✅ Activate'}
          </button>
          <button class="btn btn-ghost btn-xs" onclick="showToast('Password reset email sent','success')">🔑</button>
        </div>
      </td>
    </tr>`).join('');
}

function toggleUserStatus(btn) {
  const row = btn.closest('tr');
  const statusCell = row.querySelector('.badge');
  if (statusCell.classList.contains('badge-active')) {
    statusCell.className = 'badge badge-docs'; statusCell.textContent = 'Blocked';
    btn.textContent = '✅ Activate'; showToast('User blocked', 'info');
  } else {
    statusCell.className = 'badge badge-active'; statusCell.textContent = 'Active';
    btn.textContent = '🚫 Block'; showToast('User activated', 'success');
  }
}

// ---- ROLE PERMISSIONS ----
const ROLE_PERMS = {
  'Super Admin': ['View Dashboard','Manage Leads','Assign Leads','View Reports','Export Data','Manage Employees','Set Commission','Manage Franchise','Admin Settings','Delete Records','Import Data','Manage Bank Policies'],
  'Manager': ['View Dashboard','Manage Leads','Assign Leads','View Reports','Export Data','Manage Employees'],
  'Staff': ['View Dashboard','Manage Own Leads','View Own Reports'],
  'DSA Partner': ['View Own Leads','Add New Leads','View Own Commission'],
};
const ALL_PERMS = ['View Dashboard','Manage Leads','Assign Leads','View Reports','Export Data','Manage Employees','Set Commission','Manage Franchise','Admin Settings','Delete Records','Import Data','Manage Bank Policies','Add New Leads','View Own Leads','View Own Reports','View Own Commission','Manage Own Leads'];

function renderRolePerms() {
  const role = document.getElementById('s-role-select').value;
  const enabled = ROLE_PERMS[role] || [];
  document.getElementById('role-perms-list').innerHTML = ALL_PERMS.map(p => `
    <label style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);cursor:pointer;font-size:13px;">
      <input type="checkbox" ${enabled.includes(p)?'checked':''} style="width:14px;height:14px;accent-color:var(--accent);">
      <span>${p}</span>
    </label>`).join('');
}

// ---- DEPARTMENTS ----
let DEPARTMENTS = ['Home Loans','Business Loans','Personal Loans','Car Loans','Insurance','CIBIL','Operations'];
function renderDepartments() {
  document.getElementById('dept-list').innerHTML = DEPARTMENTS.map((d,i) => `
    <div style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--surface2);border:1px solid var(--border);border-radius:7px;margin-bottom:6px;">
      <span style="flex:1;font-size:13px;">${d}</span>
      <button class="btn btn-ghost btn-xs" style="color:var(--red);" onclick="removeDept(${i})">✕</button>
    </div>`).join('');
}
function addDepartment() {
  const v = document.getElementById('new-dept-name').value.trim();
  if (!v) return;
  DEPARTMENTS.push(v);
  document.getElementById('new-dept-name').value = '';
  renderDepartments();
  showToast(`Department "${v}" added`, 'success');
}
function removeDept(i) {
  const name = DEPARTMENTS[i];
  DEPARTMENTS.splice(i, 1);
  renderDepartments();
  showToast(`Removed "${name}"`, 'info');
}

// ---- COMMISSION SLABS ----
let COMM_SLABS = [
  { role:'Staff', type:'Home Loan', rate:'0.25%', min:'₹5L' },
  { role:'Staff', type:'Business Loan', rate:'0.30%', min:'₹3L' },
  { role:'Manager', type:'All', rate:'0.15%', min:'₹5L' },
  { role:'DSA Partner', type:'All', rate:'0.35%', min:'₹2L' },
];
function renderCommissionSlabs() {
  const el = document.getElementById('commission-slabs');
  if (!el) return;
  el.innerHTML = `
    <div class="table-wrap">
      <table style="min-width:400px;">
        <thead><tr><th>Role</th><th>Loan Type</th><th>Rate</th><th>Min Disbursement</th><th>Action</th></tr></thead>
        <tbody>${COMM_SLABS.map((s,i) => `
          <tr>
            <td><span class="badge badge-new">${s.role}</span></td>
            <td>${s.type}</td>
            <td style="font-weight:700;color:var(--green);">${s.rate}</td>
            <td>${s.min}</td>
            <td><button class="btn btn-ghost btn-xs" style="color:var(--red);" onclick="removeCommSlab(${i})">✕ Remove</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
  renderToggleSwitches();
}
function addCommissionSlab() {
  const role = document.getElementById('new-comm-role').value;
  const type = document.getElementById('new-comm-type').value;
  const rate = document.getElementById('new-comm-rate').value;
  const min = document.getElementById('new-comm-min').value;
  if (!rate) { showToast('Please enter a rate', 'error'); return; }
  COMM_SLABS.push({ role, type, rate: rate + '%', min: min ? '₹' + parseInt(min).toLocaleString('en-IN') : '–' });
  renderCommissionSlabs();
  showToast('Commission rule added', 'success');
}
function removeCommSlab(i) { COMM_SLABS.splice(i, 1); renderCommissionSlabs(); showToast('Rule removed', 'info'); }

// ---- TOGGLE SWITCH HELPER ----
function makeToggle(id, label, checked, onChange) {
  return `<label style="display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--border);cursor:pointer;gap:10px;">
    <span style="font-size:13px;">${label}</span>
    <div style="position:relative;width:40px;height:22px;flex-shrink:0;" onclick="this.querySelector('input').click();">
      <input type="checkbox" id="${id}" ${checked?'checked':''} style="opacity:0;width:0;height:0;position:absolute;" onchange="${onChange||''}">
      <div id="${id}-track" style="position:absolute;inset:0;border-radius:11px;background:${checked?'var(--accent)':'var(--border2)'};transition:background 0.2s;"></div>
      <div id="${id}-thumb" style="position:absolute;top:3px;left:${checked?'21px':'3px'};width:16px;height:16px;border-radius:50%;background:white;box-shadow:0 1px 3px rgba(0,0,0,0.2);transition:left 0.2s;"></div>
    </div>
  </label>`;
}

function renderToggleSwitches() {
  const tc = document.getElementById('toggle-container');
  if (!tc) return;
  const items = [
    { id:'tog-auto-calc', label:'Auto-calculate commission on disbursement', on:true },
    { id:'tog-tds-deduct', label:'Deduct TDS automatically from payout', on:true },
    { id:'tog-cibil-deduct', label:'Deduct CIBIL check charges from payout', on:false },
    { id:'tog-payout-notify', label:'Send payout notification to employee', on:true },
  ];
  tc.innerHTML = items.map(i => makeToggle(i.id, i.label, i.on, `toggleTrack('${i.id}')`)).join('');
}

function toggleTrack(id) {
  const inp = document.getElementById(id);
  const track = document.getElementById(id+'-track');
  const thumb = document.getElementById(id+'-thumb');
  if (inp && track && thumb) {
    track.style.background = inp.checked ? 'var(--accent)' : 'var(--border2)';
    thumb.style.left = inp.checked ? '21px' : '3px';
  }
}

// ---- NOTIFICATION RULES ----
function renderNotifRules() {
  const el = document.getElementById('notif-rules-list');
  if (!el) return;
  const rules = [
    { label:'New lead assigned', on:true },
    { label:'Follow-up due reminder', on:true },
    { label:'Lead stage changed', on:true },
    { label:'Document uploaded by client', on:false },
    { label:'Loan sanctioned', on:true },
    { label:'Disbursement completed', on:true },
    { label:'Payout processed', on:true },
    { label:'CIBIL check completed', on:false },
    { label:'Support ticket raised', on:true },
    { label:'Employee marked absent', on:false },
  ];
  el.innerHTML = rules.map((r,i) => makeToggle('notif-'+i, r.label, r.on, `toggleTrack('notif-${i}')`)).join('');
}

// ---- PIPELINE STAGE LIST ----
let STAGES_LOAN = ['New','Contacted','Docs Pending','Docs Received','CIBIL','Login','Processing','Sanction','Disbursement','Closed'];
function renderStageList() {
  const el = document.getElementById('stage-list');
  if (!el) return;
  el.innerHTML = STAGES_LOAN.map((s,i) => `
    <div style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;margin-bottom:6px;">
      <span style="color:var(--text3);font-size:12px;cursor:grab;">☰</span>
      <div style="width:8px;height:8px;border-radius:50%;background:var(--accent);flex-shrink:0;"></div>
      <span style="flex:1;font-size:13px;font-weight:500;">${s}</span>
      <span class="badge badge-new" style="font-size:10px;">Loan</span>
      <button class="btn btn-ghost btn-xs" style="color:var(--red);" onclick="removeStage(${i})">✕</button>
    </div>`).join('');
}
function addStage() {
  const v = document.getElementById('new-stage-name').value.trim();
  if (!v) return;
  STAGES_LOAN.push(v);
  document.getElementById('new-stage-name').value = '';
  renderStageList();
  showToast(`Stage "${v}" added`, 'success');
}
function removeStage(i) {
  const n = STAGES_LOAN[i]; STAGES_LOAN.splice(i,1); renderStageList();
  showToast(`Stage "${n}" removed`, 'info');
}

// ---- LEAD FORM FIELDS ----
function renderLeadFields() {
  const el = document.getElementById('lead-fields-list');
  if (!el) return;
  const fields = [
    { name:'Full Name', req:true, locked:true },
    { name:'Mobile Number', req:true, locked:true },
    { name:'Email Address', req:false, locked:false },
    { name:'Loan Type', req:true, locked:true },
    { name:'Loan Amount', req:false, locked:false },
    { name:'Monthly Income', req:false, locked:false },
    { name:'Lead Source', req:false, locked:false },
    { name:'Priority Level', req:true, locked:false },
    { name:'Follow-up Date', req:false, locked:false },
    { name:'PAN Number', req:false, locked:false },
    { name:'Notes / Remarks', req:false, locked:false },
  ];
  el.innerHTML = fields.map((f,i) => `
    <label style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border);cursor:${f.locked?'default':'pointer'};font-size:13px;">
      <input type="checkbox" ${f.req?'checked':''} ${f.locked?'disabled':''} style="width:14px;height:14px;accent-color:var(--accent);">
      <span style="flex:1;">${f.name}</span>
      ${f.locked ? '<span style="font-size:10px;color:var(--text3);">Required</span>' : '<span style="font-size:10px;color:var(--text3);">Optional</span>'}
    </label>`).join('');
}

// ---- BANK MASTER ----
let BANKS = [
  { name:'SBI', rate:'8.50%', type:'Home Loan', status:'Active' },
  { name:'HDFC', rate:'8.75%', type:'Home Loan', status:'Active' },
  { name:'ICICI', rate:'9.00%', type:'All', status:'Active' },
  { name:'Axis Bank', rate:'8.65%', type:'All', status:'Active' },
  { name:'Kotak', rate:'9.25%', type:'Personal Loan', status:'Active' },
  { name:'PNB', rate:'8.45%', type:'Home Loan', status:'Active' },
];
function renderBankMaster() {
  const el = document.getElementById('bank-master-grid');
  if (!el) return;
  el.innerHTML = BANKS.map((b,i) => `
    <div style="background:var(--surface2);border:1px solid var(--border);border-radius:9px;padding:12px;display:flex;align-items:center;gap:8px;">
      <div style="width:36px;height:36px;border-radius:8px;background:var(--accent-light);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:var(--accent);">${b.name.slice(0,4)}</div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:13px;font-weight:600;">${b.name}</div>
        <div style="font-size:11px;color:var(--text3);">${b.rate} · ${b.type}</div>
      </div>
      <button class="btn btn-ghost btn-xs" style="color:var(--red);flex-shrink:0;" onclick="removeBank(${i})">✕</button>
    </div>`).join('');
}
function addBank() {
  const n = document.getElementById('new-bank-name').value.trim();
  if (!n) return;
  BANKS.push({ name:n, rate:'–', type:'All', status:'Active' });
  document.getElementById('new-bank-name').value = '';
  renderBankMaster();
  showToast(`Bank "${n}" added`, 'success');
}
function removeBank(i) { const n=BANKS[i].name; BANKS.splice(i,1); renderBankMaster(); showToast(`"${n}" removed`,'info'); }

// ---- SECURITY TOGGLES ----
function renderSecurityToggles() {
  const el = document.getElementById('security-toggles');
  if (!el) return;
  const items = [
    { id:'sec-2fa', label:'Two-Factor Authentication (OTP on login)', on:false },
    { id:'sec-otp', label:'OTP for sensitive actions (delete, export)', on:true },
    { id:'sec-mask', label:'Mask Aadhaar / PAN in staff views', on:true },
    { id:'sec-audit', label:'Enable full audit trail', on:true },
    { id:'sec-dup', label:'Block duplicate lead entry (same phone)', on:true },
    { id:'sec-geo', label:'Restrict login to office IP range', on:false },
  ];
  el.innerHTML = items.map(i => makeToggle(i.id, i.label, i.on, `toggleTrack('${i.id}')`)).join('');

  const el2 = document.getElementById('backup-toggles');
  if (!el2) return;
  const items2 = [
    { id:'bk-auto', label:'Auto cloud backup enabled', on:true },
    { id:'bk-encrypt', label:'Encrypt backup files', on:true },
    { id:'bk-local', label:'Keep local copy on server', on:false },
  ];
  el2.innerHTML = items2.map(i => makeToggle(i.id, i.label, i.on, `toggleTrack('${i.id}')`)).join('');
}

// ---- AUDIT LOG ----
function renderAuditLog() {
  const el = document.getElementById('audit-log');
  if (!el) return;
  const logs = [
    { user:'Admin', action:'Changed commission rate for Staff → 0.25%', time:'Today 10:45 AM', type:'⚙️' },
    { user:'Priya Singh', action:'Deleted lead #1042 (Rohit Sharma)', time:'Today 9:30 AM', type:'🗑️' },
    { user:'Admin', action:'Added new franchise: Delhi North Branch', time:'Yesterday 4:10 PM', type:'🏢' },
    { user:'Amit Kumar', action:'Exported leads report (CSV)', time:'Yesterday 2:00 PM', type:'⬇️' },
    { user:'Admin', action:'Updated SMTP settings', time:'Jan 14, 5:20 PM', type:'🔐' },
  ];
  el.innerHTML = logs.map(l => `
    <div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);align-items:flex-start;">
      <span style="font-size:16px;flex-shrink:0;">${l.type}</span>
      <div style="flex:1;min-width:0;">
        <div style="font-size:12px;font-weight:600;">${l.user} <span style="font-weight:400;color:var(--text2);">· ${l.action}</span></div>
        <div style="font-size:11px;color:var(--text3);margin-top:1px;">${l.time}</div>
      </div>
    </div>`).join('');
}

// ---- BRANDING ----
function applyBranding() {
  const color = document.getElementById('s-primary-color').value;
  document.documentElement.style.setProperty('--accent', color);
  // derive light version
  document.documentElement.style.setProperty('--accent-light', color + '18');
  document.getElementById('s-primary-hex').value = color;
  showToast('Branding applied!', 'success');
}
document.getElementById('s-primary-color') && document.getElementById('s-primary-color').addEventListener('input', function() {
  document.getElementById('s-primary-hex').value = this.value;
});

// ===== AUTH & ROLE SYSTEM =====
const DEMO_USERS = {
  'admin@easyfinancewale.in':   { pass:'admin123', role:'admin',   name:'Admin User',  initials:'AD', dept:'All Departments' },
  'priya@easyfinancewale.in':   { pass:'mgr123',   role:'manager', name:'Priya Singh', initials:'PS', dept:'Home Loans' },
  'amit@easyfinancewale.in':    { pass:'staff123',  role:'staff',   name:'Amit Kumar',  initials:'AK', dept:'Business Loans' },
  'mumbaidsa@easyfinancewale.in':{ pass:'dsa123',   role:'dsa',     name:'Mumbai DSA',  initials:'MD', dept:'DSA Partner' },
};
const ROLE_CONFIG = {
  admin:   { label:'Super Admin',      pill:'rp-admin',   icon:'🛡️',
    nav:[{s:'Main',i:[{p:'dashboard',ic:'📊',l:'Dashboard'}]},{s:'Leads',i:[{p:'leads',ic:'🎯',l:'Lead Management',b:'12',bc:'nb-orange'},{p:'pipeline',ic:'🔄',l:'Pipeline View'}]},{s:'Clients',i:[{p:'clients',ic:'👤',l:'Client Profiles'}]},{s:'Tools',i:[{p:'calculator',ic:'🧮',l:'Loan Calculator'},{p:'cibil',ic:'📈',l:'CIBIL Checker',b:'New',bc:'nb-green'}]},{s:'Team',i:[{p:'employees',ic:'👥',l:'Employees'},{p:'franchise',ic:'🏢',l:'Franchise'}]},{s:'Knowledge',i:[{p:'lms',ic:'🎓',l:'Training & LMS',b:'New',bc:'nb-green'},{p:'bankpolicies',ic:'🏦',l:'Bank Policies'}]},{s:'Analytics',i:[{p:'reports',ic:'📋',l:'Reports'}]},{s:'System',i:[{p:'settings',ic:'⚙️',l:'Admin Settings'}]}]
  },
  manager: { label:'Manager',          pill:'rp-manager', icon:'👔',
    nav:[{s:'Main',i:[{p:'dashboard',ic:'📊',l:'Dashboard'}]},{s:'Leads',i:[{p:'leads',ic:'🎯',l:'Lead Management',b:'8',bc:'nb-orange'},{p:'pipeline',ic:'🔄',l:'Pipeline View'}]},{s:'Clients',i:[{p:'clients',ic:'👤',l:'Client Profiles'}]},{s:'Tools',i:[{p:'calculator',ic:'🧮',l:'Loan Calculator'},{p:'cibil',ic:'📈',l:'CIBIL Checker'}]},{s:'Team',i:[{p:'employees',ic:'👥',l:'My Team'}]},{s:'Knowledge',i:[{p:'lms',ic:'🎓',l:'Training & LMS'},{p:'bankpolicies',ic:'🏦',l:'Bank Policies'}]},{s:'Analytics',i:[{p:'reports',ic:'📋',l:'Reports'}]}]
  },
  staff:   { label:'Staff / Executive', pill:'rp-staff',   icon:'👤',
    nav:[{s:'Main',i:[{p:'dashboard',ic:'📊',l:'My Dashboard'}]},{s:'My Leads',i:[{p:'leads',ic:'🎯',l:'My Leads'},{p:'pipeline',ic:'🔄',l:'Pipeline'}]},{s:'Clients',i:[{p:'clients',ic:'👤',l:'My Clients'}]},{s:'Tools',i:[{p:'calculator',ic:'🧮',l:'Loan Calculator'},{p:'cibil',ic:'📈',l:'CIBIL Checker'}]},{s:'Learn',i:[{p:'lms',ic:'🎓',l:'Training & LMS',b:'2',bc:'nb-orange'},{p:'bankpolicies',ic:'🏦',l:'Bank Policies'}]}]
  },
  dsa:     { label:'DSA Partner',      pill:'rp-dsa',     icon:'🤝',
    nav:[{s:'Main',i:[{p:'dashboard',ic:'📊',l:'My Dashboard'}]},{s:'My Leads',i:[{p:'leads',ic:'🎯',l:'My Leads'},{p:'pipeline',ic:'🔄',l:'Pipeline'}]},{s:'Tools',i:[{p:'calculator',ic:'🧮',l:'Loan Calculator'},{p:'cibil',ic:'📈',l:'CIBIL Checker'}]},{s:'Learn',i:[{p:'lms',ic:'🎓',l:'Training & LMS'},{p:'bankpolicies',ic:'🏦',l:'Bank Policies'}]}]
  }
};

let CURRENT_USER = null;
let SELECTED_ROLE = 'admin';

function selectRole(role, el) {
  SELECTED_ROLE = role;
  document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('selected'));
  if (el) el.classList.add('selected');
}
function fillDemo(email, pass, role) {
  document.getElementById('login-email').value = email;
  document.getElementById('login-pass').value = pass;
  SELECTED_ROLE = role;
  document.querySelectorAll('.role-btn').forEach(b => b.classList.toggle('selected', b.dataset.role === role));
}
function togglePassView() {
  const inp = document.getElementById('login-pass');
  inp.type = inp.type === 'password' ? 'text' : 'password';
  document.getElementById('pass-eye').textContent = inp.type === 'password' ? '👁' : '🙈';
}
function doLogin() {
  // Laravel API authentication
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-pass').value;
  const selRole  = document.querySelector('.role-btn.selected')?.dataset.role;
  if (!email || !password) { showLoginError('Please enter email and password.'); return; }
  const btn = document.querySelector('.login-card .btn-primary');
  const origText = btn ? btn.innerHTML : '';
  if (btn) btn.innerHTML = '⏳ Signing in…';
  fetch('/api/auth/login', {
    method: 'POST',
    headers: {'Content-Type':'application/json','Accept':'application/json','X-Requested-With':'XMLHttpRequest'},
    body: JSON.stringify({email, password}),
  })
  .then(r => r.json().then(data => ({ok:r.ok, data})))
  .then(({ok, data}) => {
    if (!ok) { if(btn)btn.innerHTML=origText; showLoginError(data.message || 'Invalid credentials'); return; }
    localStorage.setItem('ef_token', data.token);
    const u = data.user;
    CURRENT_USER = {name:u.name, email:u.email, initials:u.initials||u.name.split(' ').map(w=>w[0]).join('').toUpperCase(), role:u.role, dept:u.department||'', id:u.id};
    document.getElementById('login-screen').classList.add('hidden');
    initApp();
  })
  .catch(() => { if(btn)btn.innerHTML=origText; showLoginError('Connection error. Please try again.'); });
  return; // Skip original static auth

  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pass  = document.getElementById('login-pass').value;
  const errEl = document.getElementById('login-error');
  const user  = DEMO_USERS[email];
  if (!user || user.pass !== pass || user.role !== SELECTED_ROLE) {
    errEl.classList.add('show');
    errEl.textContent = !user ? 'Account not found.' : user.pass !== pass ? 'Wrong password.' : 'Role mismatch — select the correct role above.';
    return;
  }
  errEl.classList.remove('show');
  CURRENT_USER = { ...user, email };
  document.getElementById('login-screen').classList.add('hidden');
  initApp();
}
function efFetch(url, opts={}) {
  const token = localStorage.getItem('ef_token');
  opts.headers = Object.assign({'Content-Type':'application/json','Accept':'application/json','X-Requested-With':'XMLHttpRequest', ...(token?{'Authorization':'Bearer '+token}:{})}, opts.headers||{});
  return fetch(url, opts);
}
function doLogout() {
  const token = localStorage.getItem('ef_token');
  if(token) efFetch('/api/auth/logout',{method:'POST'}).finally(()=>{localStorage.removeItem('ef_token');});
  else localStorage.removeItem('ef_token');

  CURRENT_USER = null;
  document.getElementById('login-screen').classList.remove('hidden');
}
document.getElementById('login-pass').addEventListener('keydown', e => { if (e.key==='Enter') doLogin(); });

function initApp() {
  const u = CURRENT_USER, cfg = ROLE_CONFIG[u.role];
  document.getElementById('sb-avatar').textContent = u.initials;
  document.getElementById('sb-name').textContent = u.name;
  document.getElementById('sb-role-lbl').textContent = cfg.label;
  const pill = document.getElementById('topbar-role-pill');
  pill.className = 'role-pill ' + cfg.pill;
  pill.textContent = cfg.icon + ' ' + cfg.label;
  document.getElementById('sb-settings-btn').style.display = u.role==='admin' ? '' : 'none';
  buildSidebar(cfg.nav);
  document.getElementById('lms-upload-tab').style.display = (u.role==='admin'||u.role==='manager') ? '' : 'none';
  showPage(cfg.nav[0].i[0].p);
  renderLeads(); renderClients(); renderEmployees(); renderFranchises();
  renderLeaderboard(); renderTrendChart(); renderLoanTypeChart(); renderReportLeads(); renderPipeline();
  renderSettingsUsers(); renderRolePerms(); renderDepartments(); renderToggleSwitches();
  renderCommissionSlabs(); renderNotifRules(); renderStageList(); renderLeadFields(); renderBankMaster();
  renderSecurityToggles(); renderAuditLog();
  calcEMI();
  const fu = document.getElementById('nl-followup');
  if (fu) fu.value = new Date().toISOString().split('T')[0];
}

function buildSidebar(navCfg) {
  document.getElementById('sidebar-nav').innerHTML = navCfg.map(g => `
    <div class="nav-group">
      <div class="nav-section">${g.s}</div>
      ${g.i.map(item => `
        <div class="nav-item" data-page="${item.p}" onclick="showPage('${item.p}',this)">
          <span class="nav-icon">${item.ic}</span>
          <span class="nav-label">${item.l}</span>
          ${item.b ? `<span class="nav-badge ${item.bc||''}">${item.b}</span>` : ''}
        </div>`).join('')}
    </div>`).join('');
}

// Role-aware showPage replaces old one
const _baseSP = showPage;
window.showPage = function(id, el) {
  if (CURRENT_USER) {
    const cfg = ROLE_CONFIG[CURRENT_USER.role];
    const allowed = cfg.nav.flatMap(g => g.i.map(i => i.p));
    if (!allowed.includes(id)) { showToast('Access denied for your role','error'); return; }
  }
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pg = document.getElementById('page-'+id);
  if (pg) pg.classList.add('active');
  if (el) { el.classList.add('active'); } else {
    const navEl = document.querySelector(`[data-page="${id}"]`);
    if (navEl) navEl.classList.add('active');
  }
  const TITLES = {dashboard:'Dashboard',leads:'Lead Management',pipeline:'Pipeline View',clients:'Client Profiles',calculator:'Loan Calculator',cibil:'CIBIL Checker',employees:'Employee Management',franchise:'Franchise Module',reports:'Reports & Analytics',settings:'Admin Settings',lms:'Training & LMS',bankpolicies:'Bank Policies'};
  document.getElementById('page-title').textContent = TITLES[id]||id;
  closeSidebar();
  if (id==='lms') renderLMS();
  if (id==='bankpolicies') renderBankPolicies();
  if (id==='settings') { renderSettingsUsers(); renderRolePerms(); renderDepartments(); renderToggleSwitches(); }
};

// ===== LMS =====
const COURSES = [
  {id:1,title:'Home Loan Basics',          thumb:'🏠',color:'#dbeafe',category:'loans',     level:'beginner',     lessons:8, duration:'2h 15m',progress:100,enrolled:true},
  {id:2,title:'Business Loan Processing',  thumb:'💼',color:'#d1fae5',category:'loans',     level:'intermediate', lessons:12,duration:'3h 30m',progress:65, enrolled:true},
  {id:3,title:'CIBIL Score Mastery',       thumb:'📊',color:'#fef3c7',category:'loans',     level:'beginner',     lessons:6, duration:'1h 45m',progress:100,enrolled:true},
  {id:4,title:'Insurance Products',        thumb:'🛡️',color:'#ede9fe',category:'insurance', level:'beginner',     lessons:9, duration:'2h',    progress:30, enrolled:true},
  {id:5,title:'Advanced Sales Techniques', thumb:'🎯',color:'#fee2e2',category:'sales',      level:'advanced',     lessons:15,duration:'4h',    progress:0,  enrolled:false},
  {id:6,title:'KYC & Compliance Guide',    thumb:'📋',color:'#ecfeff',category:'compliance', level:'intermediate', lessons:7, duration:'1h 30m',progress:100,enrolled:true},
  {id:7,title:'Personal Loan & LAP',       thumb:'👤',color:'#fce7f3',category:'loans',     level:'intermediate', lessons:10,duration:'2h 45m',progress:0,  enrolled:false},
  {id:8,title:'Customer Handling & CRM',   thumb:'🤝',color:'#f0fdf4',category:'sales',      level:'beginner',     lessons:11,duration:'3h',    progress:0,  enrolled:false},
];
const MATERIALS = [
  {title:'Home Loan KYC Checklist 2025',       cat:'Loans',      type:'PDF',          size:'1.2 MB', by:'Admin',      date:'15 Jan 2025',views:142},
  {title:'SBI Home Loan Policy Update Q1 2025',cat:'Loans',      type:'PDF',          size:'890 KB', by:'Admin',      date:'10 Jan 2025',views:98},
  {title:'HDFC Business Loan Criteria',        cat:'Loans',      type:'PDF',          size:'1.5 MB', by:'Priya Singh',date:'5 Jan 2025', views:76},
  {title:'CIBIL Improvement 30-Day Plan',      cat:'Loans',      type:'PDF',          size:'650 KB', by:'Admin',      date:'2 Jan 2025', views:211},
  {title:'LIC Term Insurance Product Guide',   cat:'Insurance',   type:'PDF',          size:'3.2 MB', by:'Admin',      date:'28 Dec 2024',views:54},
  {title:'Sales Objection Handling Scripts',   cat:'Sales',      type:'Presentation', size:'4.1 MB', by:'Priya Singh',date:'20 Dec 2024',views:187},
  {title:'FOIR Calculation Template',          cat:'Loans',      type:'Spreadsheet',  size:'280 KB', by:'Admin',      date:'15 Dec 2024',views:320},
  {title:'HR Policy Manual',                   cat:'HR Policies',type:'PDF',          size:'5.8 MB', by:'Admin',      date:'1 Dec 2024', views:89},
];

let courseFilter = 'all';
function filterCourses(f, el) {
  courseFilter = f;
  document.querySelectorAll('#ltab-courses .chip').forEach(c => c.classList.remove('active'));
  if (el) el.classList.add('active');
  renderCourseGrid();
}
function renderLMS() { renderCourseGrid(); renderMaterials(); renderQuizzes(); renderCerts(); }
function renderCourseGrid() {
  const grid = document.getElementById('courses-grid');
  if (!grid) return;
  const levelInfo = {beginner:['cb-beginner','Beginner'],intermediate:['cb-intermediate','Intermediate'],advanced:['cb-advanced','Advanced']};
  let list = COURSES;
  if (courseFilter==='inprogress') list = COURSES.filter(c=>c.progress>0&&c.progress<100);
  else if (courseFilter==='completed') list = COURSES.filter(c=>c.progress===100);
  else if (courseFilter!=='all') list = COURSES.filter(c=>c.category===courseFilter);
  grid.innerHTML = list.length ? list.map(c => {
    const [cls,lbl] = levelInfo[c.level];
    return `<div class="course-card" onclick="openCourse(${c.id})">
      <div class="course-thumb" style="background:${c.color};">${c.thumb}</div>
      <div class="course-body">
        <div class="course-title">${c.title}</div>
        <div class="course-meta"><span>📖 ${c.lessons} lessons</span><span>⏱ ${c.duration}</span></div>
        <div class="course-progress"><div class="course-progress-fill" style="width:${c.progress}%;background:${c.progress===100?'#059669':c.progress>0?'#2563eb':'#e2e8f0'};"></div></div>
        <div class="course-footer">
          <span class="course-badge ${cls}">${lbl}</span>
          <span style="font-size:11px;font-weight:700;color:${c.progress===100?'#059669':c.progress>0?'#2563eb':'#94a3b8'};">${c.progress===100?'✅ Done':c.progress>0?c.progress+'% done':c.enrolled?'Start':'Enroll'}</span>
        </div>
      </div>
    </div>`;
  }).join('') : '<div class="empty" style="grid-column:1/-1;"><div class="empty-icon">📚</div><div class="empty-text">No courses in this category</div></div>';
}
function openCourse(id) {
  const c = COURSES.find(x=>x.id===id);
  const lessons = [
    {title:'Introduction & Overview',    type:'video',dur:'12 min',done:c.progress>0},
    {title:'Key Concepts & Terminology', type:'text', dur:'8 min', done:c.progress>=25},
    {title:'Practical Examples',         type:'video',dur:'18 min',done:c.progress>=50},
    {title:'Case Study Analysis',        type:'pdf',  dur:'15 min',done:c.progress>=75},
    {title:'Final Quiz',                 type:'quiz', dur:'10 min',done:c.progress===100},
  ];
  const typeMap = {video:['li-video','🎬'],pdf:['li-pdf','📄'],quiz:['li-quiz','🧠'],text:['li-text','📝']};
  const ov = document.createElement('div');
  ov.className='modal-overlay open';
  ov.innerHTML=`<div class="modal" style="max-width:500px;">
    <div class="modal-header">
      <div><div class="modal-title">${c.thumb} ${c.title}</div><div style="font-size:11px;color:#94a3b8;">${c.lessons} lessons · ${c.duration}</div></div>
      <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
    </div>
    <div class="modal-body">
      <div style="margin-bottom:14px;">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px;"><span style="color:#64748b;">Progress</span><strong>${c.progress}%</strong></div>
        <div class="progress-bar" style="height:8px;"><div class="progress-fill" style="width:${c.progress}%;background:${c.progress===100?'#059669':'#2563eb'};"></div></div>
      </div>
      <div class="lesson-list">${lessons.map((l,i)=>{const[cls,ico]=typeMap[l.type];return`<div class="lesson-item"><div class="lesson-icon ${cls}">${ico}</div><div style="flex:1;"><div style="font-size:13px;font-weight:600;">${l.title}</div><div style="font-size:11px;color:#94a3b8;">${l.dur}</div></div><div class="lesson-done ${l.done?'ld-done':'ld-pending'}">${l.done?'✓':'○'}</div></div>`;}).join('')}</div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Close</button>
      <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove();showToast('Lesson started!','success');">▶ ${c.progress>0&&c.progress<100?'Continue':'Start'} Course</button>
    </div>
  </div>`;
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove();});
  document.body.appendChild(ov);
}
function renderMaterials() {
  const tbody = document.getElementById('materials-tbody');
  if(!tbody) return;
  const ti = {PDF:'📄',Video:'🎬',Presentation:'📊',Spreadsheet:'📈'};
  tbody.innerHTML = MATERIALS.map(m=>`<tr><td><strong>${m.title}</strong></td><td><span class="badge badge-new" style="font-size:10px;">${m.cat}</span></td><td>${ti[m.type]||'📎'} ${m.type}</td><td style="color:#94a3b8;font-size:12px;">${m.size}</td><td style="font-size:12px;">${m.by}</td><td style="font-size:12px;color:#94a3b8;">${m.date}</td><td>${m.views}</td><td><div style="display:flex;gap:4px;"><button class="btn btn-ghost btn-xs" onclick="showToast('Opening…','info')">👁</button><button class="btn btn-ghost btn-xs" onclick="showToast('Downloading','success')">⬇</button></div></td></tr>`).join('');
}
function renderQuizzes() {
  const w = document.getElementById('active-quiz-wrap');
  if(!w) return;
  const qz = [{title:'Home Loan KYC Quiz',questions:10,time:'10 min',score:null,due:'Today'},{title:'CIBIL Score & Improvement',questions:8,time:'8 min',score:85,due:'Completed'}];
  w.innerHTML = qz.map(q=>`<div class="card"><div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;"><div style="width:44px;height:44px;border-radius:10px;background:#eff6ff;display:flex;align-items:center;justify-content:center;font-size:20px;">🧠</div><div><div style="font-family:'Syne',sans-serif;font-size:14px;font-weight:700;">${q.title}</div><div style="font-size:12px;color:#94a3b8;">${q.questions} questions · ${q.time}</div></div>${q.score?`<span class="badge badge-sanction" style="margin-left:auto;">${q.score}%</span>`:`<span class="badge badge-docs" style="margin-left:auto;">Due ${q.due}</span>`}</div><button class="btn ${q.score?'btn-ghost':'btn-primary'} btn-sm" style="width:100%;" onclick="showToast('${q.score?'Review opened':'Quiz started!'}','${q.score?'info':'success'}')">${q.score?'🔁 Review':'▶ Start Quiz'}</button></div>`).join('');
  const tb = document.getElementById('quiz-leaderboard-tbody');
  if(!tb) return;
  const lb=[{name:'Priya Singh',ini:'PS',taken:6,avg:91,best:98,pts:460},{name:'Amit Kumar',ini:'AK',taken:5,avg:84,best:92,pts:350},{name:'Raj Mehta',ini:'RM',taken:4,avg:78,best:88,pts:260},{name:'Neha Verma',ini:'NV',taken:4,avg:82,best:90,pts:280}];
  const md=['🥇','🥈','🥉','4.'];
  tb.innerHTML=lb.map((e,i)=>`<tr><td>${md[i]}</td><td><div class="td-name"><div class="mini-avatar">${e.ini}</div><strong>${e.name}</strong></div></td><td>${e.taken}</td><td><strong style="color:${e.avg>=85?'#059669':'#d97706'};">${e.avg}%</strong></td><td>${e.best}%</td><td style="font-weight:700;color:#2563eb;">${e.pts}</td></tr>`).join('');
}
function renderCerts() {
  const g = document.getElementById('certs-grid');
  if(!g) return;
  const certs=[{title:'Home Loan Specialist',course:'Home Loan Basics',date:'12 Jan 2025',score:94},{title:'CIBIL Expert',course:'CIBIL Score Mastery',date:'8 Jan 2025',score:88},{title:'Compliance Officer',course:'KYC & Compliance',date:'20 Dec 2024',score:96}];
  g.innerHTML=certs.map(c=>`<div style="background:linear-gradient(135deg,#1e3a5f,#1e40af);border-radius:16px;padding:24px;color:white;text-align:center;position:relative;overflow:hidden;"><div style="position:absolute;top:-20px;right:-20px;width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,0.05);"></div><div style="font-size:36px;margin-bottom:10px;">🏆</div><div style="font-family:'Syne',sans-serif;font-size:16px;font-weight:800;margin-bottom:4px;">${c.title}</div><div style="font-size:11px;opacity:0.7;margin-bottom:12px;">${c.course}</div><div style="background:rgba(255,255,255,0.1);border-radius:8px;padding:8px;margin-bottom:14px;"><div style="font-size:11px;opacity:0.7;">Awarded to</div><div style="font-size:14px;font-weight:700;">${CURRENT_USER?.name||'Demo User'}</div><div style="font-size:11px;opacity:0.7;margin-top:2px;">Score: ${c.score}% · ${c.date}</div></div><button class="btn btn-sm" style="background:rgba(255,255,255,0.2);color:white;border:1px solid rgba(255,255,255,0.3);width:100%;" onclick="showToast('Downloading certificate…','success')">⬇ Download PDF</button></div>`).join('');
}
function switchLmsTab(id, el) {
  ['courses','materials','quizzes','certificates','upload'].forEach(t=>{const d=document.getElementById('ltab-'+t);if(d)d.style.display=t===id?'block':'none';});
  document.querySelectorAll('#lms-tabs .tab').forEach(t=>t.classList.remove('active'));
  if(el) el.classList.add('active');
}

// ===== BANK POLICIES =====
const BANK_POLICIES = [
  {name:'SBI',        logo:'SBI',  color:'#1d4ed8',bg:'#dbeafe',type:'PSU',     hl_rate:'8.50%',hl_max:'₹10Cr',hl_tenure:'30 yrs',hl_ltv:'90%',bl_rate:'11.15%',bl_max:'₹5Cr', bl_tenure:'15 yrs',pl_rate:'12.00%',pl_max:'₹20L',pl_tenure:'7 yrs', cibil_min:700,income_min:'₹25K/mo',age:'21–70',processing:'0.35%',prepay:'Nil after 6 EMIs',updated:'15 Jan 2025',highlight:'Best for govt & salaried employees'},
  {name:'HDFC Bank',  logo:'HDFC', color:'#dc2626',bg:'#fee2e2',type:'Private', hl_rate:'8.75%',hl_max:'₹15Cr',hl_tenure:'30 yrs',hl_ltv:'90%',bl_rate:'10.75%',bl_max:'₹50L',bl_tenure:'15 yrs',pl_rate:'10.85%',pl_max:'₹40L',pl_tenure:'5 yrs', cibil_min:700,income_min:'₹20K/mo',age:'21–65',processing:'0.50%',prepay:'2% before 24 mo',updated:'12 Jan 2025',highlight:'Fastest approval – 48 hrs'},
  {name:'ICICI Bank',  logo:'ICICI',color:'#ea580c',bg:'#fff7ed',type:'Private', hl_rate:'9.00%',hl_max:'₹10Cr',hl_tenure:'30 yrs',hl_ltv:'85%',bl_rate:'10.65%',bl_max:'₹2Cr', bl_tenure:'12 yrs',pl_rate:'10.75%',pl_max:'₹50L',pl_tenure:'6 yrs', cibil_min:720,income_min:'₹25K/mo',age:'23–65',processing:'0.50%',prepay:'Nil after 12 mo', updated:'10 Jan 2025',highlight:'Best digital application'},
  {name:'Axis Bank',   logo:'AXIS', color:'#7c3aed',bg:'#ede9fe',type:'Private', hl_rate:'8.65%',hl_max:'₹5Cr', hl_tenure:'30 yrs',hl_ltv:'80%',bl_rate:'10.95%',bl_max:'₹75L',bl_tenure:'15 yrs',pl_rate:'11.25%',pl_max:'₹40L',pl_tenure:'5 yrs', cibil_min:700,income_min:'₹15K/mo',age:'21–65',processing:'1%',   prepay:'Nil (floating)', updated:'8 Jan 2025', highlight:'Flexible repayment options'},
  {name:'PNB Housing', logo:'PNB',  color:'#059669',bg:'#d1fae5',type:'NBFC',    hl_rate:'8.45%',hl_max:'₹5Cr', hl_tenure:'30 yrs',hl_ltv:'90%',bl_rate:'12.50%',bl_max:'₹50L',bl_tenure:'10 yrs',pl_rate:'13.00%',pl_max:'₹15L',pl_tenure:'5 yrs', cibil_min:650,income_min:'₹20K/mo',age:'21–70',processing:'0.35%',prepay:'Nil',             updated:'5 Jan 2025', highlight:'Lowest rate for CIBIL 750+'},
  {name:'Kotak Mahindra',logo:'KTKM',color:'#0891b2',bg:'#ecfeff',type:'Private',hl_rate:'9.25%',hl_max:'₹10Cr',hl_tenure:'20 yrs',hl_ltv:'85%',bl_rate:'11.50%',bl_max:'₹5Cr', bl_tenure:'10 yrs',pl_rate:'10.99%',pl_max:'₹40L',pl_tenure:'5 yrs', cibil_min:720,income_min:'₹30K/mo',age:'21–60',processing:'0.50%',prepay:'4% before 12 mo', updated:'3 Jan 2025', highlight:'Best for self-employed'},
];
function renderBankPolicies() {
  const g = document.getElementById('bank-policy-grid');
  if (!g || g.innerHTML) return;
  g.innerHTML = BANK_POLICIES.map((b,i)=>`
    <div class="bank-policy-card" onclick="openBankPolicy(${i})">
      <div class="bp-header">
        <div class="bp-logo" style="background:${b.bg};color:${b.color};">${b.logo}</div>
        <div style="flex:1;min-width:0;"><div style="font-family:'Syne',sans-serif;font-size:15px;font-weight:800;">${b.name}</div><div style="display:flex;gap:6px;align-items:center;margin-top:3px;"><span class="badge" style="background:${b.bg};color:${b.color};font-size:10px;">${b.type}</span><span style="font-size:10px;color:#94a3b8;">${b.updated}</span></div></div>
        <div style="text-align:right;flex-shrink:0;"><div style="font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:${b.color};">${b.hl_rate}</div><div style="font-size:10px;color:#94a3b8;">Home Loan</div></div>
      </div>
      <table class="policy-detail-table"><tr><td>CIBIL Min</td><td>${b.cibil_min}+</td></tr><tr><td>Min Income</td><td>${b.income_min}</td></tr><tr><td>Tenure</td><td>${b.hl_tenure}</td></tr><tr><td>LTV</td><td>${b.hl_ltv}</td></tr><tr><td>Processing</td><td>${b.processing}</td></tr></table>
      <div style="margin-top:10px;background:#f0fdf4;border:1px solid #a7f3d0;border-radius:7px;padding:7px 10px;font-size:11px;color:#065f46;">💡 ${b.highlight}</div>
      <button class="btn btn-primary btn-sm" style="width:100%;margin-top:10px;" onclick="event.stopPropagation();openBankPolicy(${i})">📋 Full Policy →</button>
    </div>`).join('');
  ['homeloan','business','personal','car','lap'].forEach(type=>{
    const el=document.getElementById('bptab-'+type);
    if(!el||el.innerHTML) return;
    const map={homeloan:'hl',business:'bl',personal:'pl',car:'hl',lap:'bl'};
    const p=map[type];
    el.innerHTML='<div class="grid-3">'+BANK_POLICIES.map((b,i)=>`<div class="bank-policy-card" onclick="openBankPolicy(${i})"><div class="bp-header"><div class="bp-logo" style="background:${b.bg};color:${b.color};">${b.logo}</div><div><div style="font-family:'Syne',sans-serif;font-size:14px;font-weight:800;">${b.name}</div><span class="badge" style="background:${b.bg};color:${b.color};font-size:10px;">${b.type}</span></div><div style="text-align:right;"><div style="font-family:'Syne',sans-serif;font-size:17px;font-weight:800;color:${b.color};">${b[p+'_rate']||b.hl_rate}</div><div style="font-size:10px;color:#94a3b8;">p.a.</div></div></div><table class="policy-detail-table"><tr><td>Max Loan</td><td>${b[p+'_max']||'–'}</td></tr><tr><td>Tenure</td><td>${b[p+'_tenure']||'–'}</td></tr><tr><td>CIBIL Min</td><td>${b.cibil_min}+</td></tr><tr><td>Processing</td><td>${b.processing}</td></tr></table><button class="btn btn-primary btn-sm" style="width:100%;margin-top:10px;" onclick="event.stopPropagation();openBankPolicy(${i})">View Policy →</button></div>`).join('')+'</div>';
  });
}
function openBankPolicy(i) {
  const b=BANK_POLICIES[i];
  const ov=document.createElement('div');
  ov.className='modal-overlay open';
  ov.innerHTML=`<div class="modal" style="max-width:580px;">
    <div class="modal-header">
      <div style="display:flex;align-items:center;gap:12px;"><div class="bp-logo" style="background:${b.bg};color:${b.color};width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;flex-shrink:0;">${b.logo}</div><div><div class="modal-title">${b.name} – Full Policy</div><div style="font-size:11px;color:#94a3b8;">Updated: ${b.updated}</div></div></div>
      <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
    </div>
    <div class="modal-body">
      <div style="background:#f0fdf4;border:1px solid #a7f3d0;border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:12px;color:#065f46;">💡 ${b.highlight}</div>
      <div class="tabs" style="margin-bottom:14px;" id="mpol-tabs-${i}">
        <div class="tab active" onclick="swMP('home',this,${i})">🏠 Home Loan</div>
        <div class="tab" onclick="swMP('biz',this,${i})">💼 Business</div>
        <div class="tab" onclick="swMP('pl',this,${i})">👤 Personal</div>
        <div class="tab" onclick="swMP('gen',this,${i})">ℹ General</div>
      </div>
      <div id="mpol-home-${i}"><table class="policy-detail-table" style="width:100%;"><tr><td>Interest Rate</td><td style="color:#059669;font-weight:700;">${b.hl_rate} p.a.</td></tr><tr><td>Maximum Loan</td><td>${b.hl_max}</td></tr><tr><td>Max Tenure</td><td>${b.hl_tenure}</td></tr><tr><td>Max LTV Ratio</td><td>${b.hl_ltv}</td></tr><tr><td>Processing Fee</td><td>${b.processing} of loan amount</td></tr><tr><td>Prepayment</td><td>${b.prepay}</td></tr><tr><td>CIBIL Minimum</td><td>${b.cibil_min}+</td></tr><tr><td>Min Income</td><td>${b.income_min}</td></tr><tr><td>Eligible Age</td><td>${b.age} years</td></tr></table></div>
      <div id="mpol-biz-${i}" style="display:none;"><table class="policy-detail-table" style="width:100%;"><tr><td>Interest Rate</td><td style="color:#059669;font-weight:700;">${b.bl_rate} p.a.</td></tr><tr><td>Maximum Loan</td><td>${b.bl_max}</td></tr><tr><td>Max Tenure</td><td>${b.bl_tenure}</td></tr><tr><td>Processing Fee</td><td>${b.processing}</td></tr><tr><td>CIBIL Minimum</td><td>${b.cibil_min}+</td></tr><tr><td>Eligible Age</td><td>${b.age}</td></tr></table></div>
      <div id="mpol-pl-${i}" style="display:none;"><table class="policy-detail-table" style="width:100%;"><tr><td>Interest Rate</td><td style="color:#059669;font-weight:700;">${b.pl_rate} p.a.</td></tr><tr><td>Maximum Loan</td><td>${b.pl_max}</td></tr><tr><td>Max Tenure</td><td>${b.pl_tenure}</td></tr><tr><td>Processing Fee</td><td>${b.processing}</td></tr><tr><td>CIBIL Minimum</td><td>${b.cibil_min}+</td></tr></table></div>
      <div id="mpol-gen-${i}" style="display:none;"><table class="policy-detail-table" style="width:100%;"><tr><td>Bank Type</td><td>${b.type}</td></tr><tr><td>Eligible Age</td><td>${b.age} years</td></tr><tr><td>Min Income</td><td>${b.income_min}</td></tr><tr><td>CIBIL Min</td><td>${b.cibil_min}+</td></tr><tr><td>Prepayment</td><td>${b.prepay}</td></tr></table></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Close</button>
      <button class="btn btn-secondary btn-sm" onclick="showToast('Saved to favourites!','success')">⭐ Save</button>
      <button class="btn btn-primary btn-sm" onclick="showToast('Downloading policy PDF…','success')">⬇ Download</button>
    </div>
  </div>`;
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove();});
  document.body.appendChild(ov);
}
function swMP(id,el,i) {
  ['home','biz','pl','gen'].forEach(t=>{const d=document.getElementById('mpol-'+t+'-'+i);if(d)d.style.display=t===id?'block':'none';});
  el.closest('.tabs').querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
}
function switchBPTab(id,el) {
  ['overview','homeloan','business','personal','car','lap'].forEach(t=>{
    const d=document.getElementById('bptab-'+t);
    if(d)d.style.display=t===id?'block':'none';
  });
  document.querySelectorAll('#bp-tabs .tab').forEach(t=>t.classList.remove('active'));
  if(el) el.classList.add('active');
}

// Resize re-render
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { renderTrendChart(); }, 200);
});

// ════════════════════════════════════════════════════════════
// PWA ENGINE
// ════════════════════════════════════════════════════════════

/* ── Manifest (blob URL — works in single-file HTML) ── */
(function(){
  const m = {
    name:'EasyFinance CRM', short_name:'EasyFinance',
    description:'Complete Loan Consultancy Management System',
    start_url:'./', display:'standalone', orientation:'any',
    background_color:'#0f172a', theme_color:'#2563eb',
    categories:['finance','business','productivity'],
    icons:[
      {src:"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' rx='96' fill='%232563eb'/%3E%3Ctext x='256' y='336' font-size='288' text-anchor='middle' fill='white'%3E%F0%9F%92%B0%3C/text%3E%3C/svg%3E",
       sizes:'512x512', type:'image/svg+xml', purpose:'any maskable'}
    ],
    shortcuts:[
      {name:'New Lead',     url:'./?a=new-lead',    description:'Add a new lead'},
      {name:'CIBIL Check',  url:'./?a=cibil',       description:'Check CIBIL score'},
      {name:'Calculator',   url:'./?a=calculator',  description:'Loan EMI calculator'}
    ]
  };
  try {
    const blob = new Blob([JSON.stringify(m)], {type:'application/json'});
    const link = document.getElementById('pwa-manifest') || document.createElement('link');
    link.id='pwa-manifest'; link.rel='manifest';
    link.href = URL.createObjectURL(blob);
    if (!link.parentNode) document.head.appendChild(link);
  } catch(e){}
})();

/* ── Service Worker (blob — single-file compatible) ── */
(function(){
  if (!('serviceWorker' in navigator)) return;
  const CACHE = 'efcrm-v3';
  const swSrc = `
const CACHE='${CACHE}';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./'])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const net = fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        }
        return res;
      }).catch(() => cached || new Response('Offline'));
      return cached || net;
    })
  );
});
self.addEventListener('message', e => { if (e.data === 'skip') self.skipWaiting(); });
  `;
  try {
    const swBlob = new Blob([swSrc.replace('${CACHE}', CACHE)], {type:'text/javascript'});
    navigator.serviceWorker.register(URL.createObjectURL(swBlob), {scope:'./'})
      .then(reg => {
        reg.addEventListener('updatefound', () => {
          const nw = reg.installing;
          nw.addEventListener('statechange', () => {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) {
              document.getElementById('update-bar').classList.add('show');
            }
          });
        });
      });
  } catch(e){}
})();

function doUpdate() {
  try { navigator.serviceWorker.controller?.postMessage('skip'); } catch(e){}
  window.location.reload();
}

/* ── Splash screen dismiss ── */
(function(){
  const el = document.getElementById('splash');
  if (!el) return;
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.classList.add('gone'), 520);
  }, 1900);
})();

/* ── Install prompt ── */
let _dip = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault(); _dip = e;
  try {
    if (!sessionStorage.getItem('ib-dismissed') && CURRENT_USER) {
      setTimeout(() => document.getElementById('install-banner').classList.remove('hidden'), 4500);
    }
  } catch(ex){}
});
window.addEventListener('appinstalled', () => {
  document.getElementById('install-banner').classList.add('hidden');
  showToast('EasyFinance installed! 🎉', 'success');
});
function triggerInstall() {
  if (_dip) { _dip.prompt(); _dip.userChoice.then(r => { if(r.outcome==='accepted') showToast('Installing…','success'); _dip=null; }); }
  document.getElementById('install-banner').classList.add('hidden');
}
function dismissInstall() {
  document.getElementById('install-banner').classList.add('hidden');
  try { sessionStorage.setItem('ib-dismissed','1'); } catch(e){}
}

/* ── Network status ── */
function syncNetStatus() {
  const on = navigator.onLine;
  const dot = document.getElementById('net-dot');
  const bar = document.getElementById('offline-bar');
  if (dot) { dot.classList.toggle('off', !on); dot.title = on ? 'Online' : 'Offline'; }
  if (bar) bar.classList.toggle('show', !on);
}
window.addEventListener('online',  () => { syncNetStatus(); showToast('Back online ✓','success'); });
window.addEventListener('offline', () => syncNetStatus());
syncNetStatus();

/* ── Dark / Light theme ── */
function toggleTheme() {
  const html = document.documentElement;
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  const btn = document.getElementById('theme-btn');
  if (btn) btn.textContent = next === 'dark' ? '☀️' : '🌙';
  document.querySelector('meta[name="theme-color"]').content = next === 'dark' ? '#1e293b' : '#2563eb';
  try { localStorage.setItem('eftheme', next); } catch(e){}
}
(function applyStoredTheme() {
  let t = 'light';
  try { t = localStorage.getItem('eftheme') || (window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light'); } catch(e){}
  if (t === 'dark') {
    document.documentElement.setAttribute('data-theme','dark');
    const btn = document.getElementById('theme-btn');
    if (btn) btn.textContent = '☀️';
  }
  window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change', e => {
    try { if (!localStorage.getItem('eftheme')) { document.documentElement.setAttribute('data-theme', e.matches?'dark':'light'); } } catch(ex){}
  });
})();

/* ── Bottom Navigation ── */
const BNAV = {
  admin:   [{p:'dashboard',i:'📊',l:'Home'},{p:'leads',i:'🎯',l:'Leads',d:1},{p:'clients',i:'👤',l:'Clients'},{p:'lms',i:'🎓',l:'Learn'},{p:'reports',i:'📋',l:'Reports'}],
  manager: [{p:'dashboard',i:'📊',l:'Home'},{p:'leads',i:'🎯',l:'Leads',d:1},{p:'clients',i:'👤',l:'Clients'},{p:'lms',i:'🎓',l:'Learn'},{p:'reports',i:'📋',l:'Reports'}],
  staff:   [{p:'dashboard',i:'📊',l:'Home'},{p:'leads',i:'🎯',l:'Leads',d:1},{p:'pipeline',i:'🔄',l:'Pipeline'},{p:'calculator',i:'🧮',l:'Calc'},{p:'lms',i:'🎓',l:'Learn'}],
  dsa:     [{p:'dashboard',i:'📊',l:'Home'},{p:'leads',i:'🎯',l:'Leads'},{p:'calculator',i:'🧮',l:'Calc'},{p:'bankpolicies',i:'🏦',l:'Rates'},{p:'lms',i:'🎓',l:'Learn'}],
};
function buildBottomNav(role) {
  const inner = document.getElementById('bottom-nav-inner');
  if (!inner) return;
  const items = BNAV[role] || BNAV.staff;
  inner.innerHTML = items.map(it =>
    `<div class="bnav-item" data-bnav="${it.p}" onclick="showPage('${it.p}')" role="button" tabindex="0" aria-label="${it.l}">
      <div class="bnav-active-bar"></div>
      <div class="bi">${it.i}</div>
      <span>${it.l}</span>
      ${it.d ? '<span class="bnav-dot"></span>' : ''}
    </div>`
  ).join('');
}
function syncBottomNav(id) {
  document.querySelectorAll('.bnav-item').forEach(el => el.classList.toggle('active', el.dataset.bnav === id));
}

/* ── Pull-to-Refresh ── */
(function() {
  let sy = 0, dragging = false;
  const bar = document.getElementById('ptr-bar');
  const icon = document.getElementById('ptr-icon');
  const txt  = document.getElementById('ptr-text');
  document.addEventListener('touchstart', e => {
    if (window.scrollY === 0) { sy = e.touches[0].clientY; dragging = true; }
  }, {passive:true});
  document.addEventListener('touchmove', e => {
    if (!dragging) return;
    const dy = e.touches[0].clientY - sy;
    if (dy > 36) {
      bar?.classList.add('show');
      if (dy > 80) { if(icon) icon.textContent='↑'; if(txt) txt.textContent='Release to refresh'; }
      else          { if(icon) icon.textContent='↓'; if(txt) txt.textContent='Pull to refresh'; }
    } else bar?.classList.remove('show');
  }, {passive:true});
  document.addEventListener('touchend', e => {
    if (!dragging) return;
    const dy = e.changedTouches[0].clientY - sy;
    if (dy > 80 && window.scrollY === 0) {
      if(icon) icon.textContent = '🔄'; if(txt) txt.textContent = 'Refreshing…';
      setTimeout(() => { bar?.classList.remove('show'); showToast('Data refreshed','success'); }, 1100);
    } else bar?.classList.remove('show');
    dragging = false; sy = 0;
  }, {passive:true});
})();

/* ── Swipe-right-edge → back to Dashboard ── */
(function() {
  let sx = 0;
  document.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, {passive:true});
  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx;
    if (dx > 72 && sx < 28 && CURRENT_USER) {
      const cur = document.querySelector('.page.active')?.id?.replace('page-','');
      if (cur && cur !== 'dashboard') showPage('dashboard');
    }
  }, {passive:true});
})();

/* ── Keyboard shortcuts ── */
document.addEventListener('keydown', e => {
  if (!e.altKey) return;
  if (e.key==='l') { e.preventDefault(); if(CURRENT_USER) showPage('leads'); }
  if (e.key==='d') { e.preventDefault(); if(CURRENT_USER) showPage('dashboard'); }
  if (e.key==='n') { e.preventDefault(); if(CURRENT_USER) openModal('modal-lead'); }
  if (e.key==='t') { e.preventDefault(); toggleTheme(); }
  if (e.key==='c') { e.preventDefault(); if(CURRENT_USER) showPage('calculator'); }
});

/* ── Deep-link shortcuts ── */
(function() {
  const a = new URLSearchParams(window.location.search).get('a');
  if (!a) return;
  const map = {'new-lead':()=>openModal('modal-lead'),'cibil':()=>showPage('cibil'),'calculator':()=>showPage('calculator')};
  if (map[a]) setTimeout(map[a], 2300);
})();

/* ── Patch initApp — wire PWA init after login ── */
const _baseInit = initApp;
window.initApp = function() {
  _baseInit();
  // Show post-login topbar items
  document.getElementById('topbar-role-pill').style.display = '';
  document.getElementById('topbar-new-lead-btn').style.display = '';
  document.getElementById('topbar-logout-btn').style.display = '';
  // Build bottom nav
  buildBottomNav(CURRENT_USER.role);
  syncNetStatus();
  // Install prompt (if available)
  if (_dip) setTimeout(() => document.getElementById('install-banner').classList.remove('hidden'), 5000);
};

/* ── Patch showPage — sync bottom nav ── */
const _baseSP2 = window.showPage;
window.showPage = function(id, el) {
  _baseSP2(id, el);
  syncBottomNav(id);
};

/* ── Window resize ── */
let _rt;
window.addEventListener('resize', () => { clearTimeout(_rt); _rt = setTimeout(() => renderTrendChart(), 200); });

</script>
</body>
</html>
