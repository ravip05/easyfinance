<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Login – EasyFinance CRM</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',sans-serif;background:linear-gradient(135deg,#1e3a5f,#0f172a);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
.card{background:#fff;border-radius:20px;width:100%;max-width:420px;padding:40px 36px;box-shadow:0 24px 80px rgba(0,0,0,0.4)}
.logo{display:flex;align-items:center;gap:12px;margin-bottom:28px}
.logo-icon{width:46px;height:46px;border-radius:12px;background:linear-gradient(135deg,#2563eb,#7c3aed);display:flex;align-items:center;justify-content:center;font-size:22px}
.logo-text{font-size:18px;font-weight:800;color:#1e293b}
.logo-text span{display:block;font-size:12px;font-weight:400;color:#94a3b8}
h2{font-size:22px;font-weight:800;color:#1e293b;margin-bottom:6px}
.sub{font-size:13px;color:#64748b;margin-bottom:24px}
label{display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:5px}
input{width:100%;padding:10px 14px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;outline:none;transition:border-color .15s}
input:focus{border-color:#2563eb}
.form-group{margin-bottom:16px}
.error{background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:10px;font-size:12px;color:#dc2626;margin-bottom:14px}
.btn{width:100%;padding:12px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;margin-top:6px;transition:background .15s}
.btn:hover{background:#1d4ed8}
.demo{background:#f8fafc;border-radius:10px;padding:12px;margin-top:20px}
.demo-title{font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px}
.demo-row{display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid #e2e8f0;font-size:12px}
.demo-row:last-child{border-bottom:none}
.demo-name{font-weight:600;color:#1e293b}
.demo-creds{color:#64748b}
.demo-fill{cursor:pointer;color:#2563eb;font-weight:600;font-size:11px}
.demo-fill:hover{text-decoration:underline}
</style>
</head>
<body>
<div class="card">
  <div class="logo">
    <div class="logo-icon">💰</div>
    <div class="logo-text">EasyFinance CRM <span>Loan Consultancy Platform</span></div>
  </div>
  <h2>Welcome back 👋</h2>
  <p class="sub">Sign in to access your dashboard</p>

  @if ($errors->any())
    <div class="error">{{ $errors->first() }}</div>
  @endif

  <form method="POST" action="{{ route('login') }}">
    @csrf
    <div class="form-group">
      <label>Email Address</label>
      <input type="email" name="email" value="{{ old('email') }}" placeholder="you@easyfinancewale.in" required autofocus>
    </div>
    <div class="form-group">
      <label>Password</label>
      <input type="password" name="password" placeholder="••••••••" required>
    </div>
    <button type="submit" class="btn">Sign In →</button>
  </form>

  <div class="demo">
    <div class="demo-title">Demo Accounts</div>
    <div class="demo-row"><span class="demo-name">🛡 Super Admin</span><span class="demo-creds">admin@easyfinancewale.in / admin123</span><span class="demo-fill" onclick="fill('admin@easyfinancewale.in','admin123')">Use</span></div>
    <div class="demo-row"><span class="demo-name">👔 Manager</span><span class="demo-creds">priya@easyfinancewale.in / mgr123</span><span class="demo-fill" onclick="fill('priya@easyfinancewale.in','mgr123')">Use</span></div>
    <div class="demo-row"><span class="demo-name">👤 Staff</span><span class="demo-creds">amit@easyfinancewale.in / staff123</span><span class="demo-fill" onclick="fill('amit@easyfinancewale.in','staff123')">Use</span></div>
    <div class="demo-row"><span class="demo-name">🤝 DSA</span><span class="demo-creds">mumbaidsa@easyfinancewale.in / dsa123</span><span class="demo-fill" onclick="fill('mumbaidsa@easyfinancewale.in','dsa123')">Use</span></div>
  </div>
</div>
<script>
function fill(e,p){document.querySelector('[name=email]').value=e;document.querySelector('[name=password]').value=p;}
</script>
</body>
</html>
