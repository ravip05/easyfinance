# EasyFinance CRM — Hostinger Cloud Professional Deployment
## Total time: ~20 minutes

---

## WHAT'S IN THIS PACKAGE

```
EasyFinanceCRM/
├── DEPLOY.md         ← You are here
├── setup.sh          ← Run once on server via SSH (installs everything)
├── backend/          ← Upload to your Hostinger server
└── frontend/         ← Build on your computer first, then upload dist/
```

**How it works:** Laravel lives at `/home/user/crm/` on your server.
Its `public/` subfolder is your website's document root and serves both:
- The React app (`index.html` + JS/CSS bundles)
- The Laravel API (`/api/*` routes)

One domain, zero subdomains needed.

---

## STEP 1 — Build React on your computer

Requires Node.js 18+. Get it from nodejs.org.

```bash
cd frontend
npm install
```

Open `frontend/.env.production` and change the URL:
```
VITE_API_BASE_URL=https://yourdomain.com
```

```bash
npm run build
```

Now copy the **contents** of `frontend/dist/` into `backend/public/`:
- **Mac/Linux:** `cp -r frontend/dist/. backend/public/`
- **Windows:** Open `frontend\dist\`, select all files → copy → paste into `backend\public\`

---

## STEP 2 — Hostinger hPanel: Create MySQL database

1. hPanel → **Databases** → **MySQL Databases**
2. Create a new database (note the name)
3. Create a user with a strong password (note user + password)
4. Add the user to the database with **All Privileges**

---

## STEP 3 — Hostinger hPanel: Set PHP 8.2

hPanel → **PHP Configuration** (or "PHP Version") → Select **PHP 8.2** → Save

---

## STEP 4 — Upload backend/ to your server

Using hPanel **File Manager** or FileZilla (SFTP):

1. Navigate to `/home/u123456789/`
2. Create a new folder named `crm`
3. Upload everything inside `backend/` into that `crm/` folder

Your server should look like:
```
/home/u123456789/
├── public_html/          ← leave this alone
└── crm/                  ← upload backend/ contents here
    ├── app/
    ├── bootstrap/
    ├── config/
    ├── database/
    ├── public/           ← this becomes your document root
    │   ├── index.html    ← React app (copied from dist/)
    │   ├── index.php     ← Laravel entry point
    │   ├── .htaccess
    │   └── assets/
    ├── routes/
    ├── storage/
    └── composer.json
```

---

## STEP 5 — Change document root in hPanel

hPanel → **Domains** → your domain → **Manage** → **Document Root**

Change to: `/home/u123456789/crm/public`

Save.

---

## STEP 6 — SSH: three commands

Enable SSH in hPanel → **SSH Access**, connect:
```bash
ssh u123456789@yourdomain.com
```

**Create .env:**
```bash
cp ~/crm/.env.example ~/crm/.env
nano ~/crm/.env
```

Set these 6 values (everything else stays as-is):
```ini
APP_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
DB_HOST=127.0.0.1
DB_DATABASE=u123456789_crm
DB_USERNAME=u123456789_crmuser
DB_PASSWORD=YourPasswordHere
```
Ctrl+O to save, Ctrl+X to exit.

**Run setup:**
```bash
bash ~/crm/setup.sh
```
Takes ~2 minutes. Creates all database tables and seeds demo data.

**Verify:**
```bash
curl https://yourdomain.com/api/health
```
Expected: `{"success":true,"status":"ok"}`

---

## STEP 7 — Open your CRM

Visit `https://yourdomain.com` → Login screen appears.

**Login credentials:**

| Role    | Email                        | Password |
|---------|------------------------------|----------|
| Admin   | admin@easyfinancewale.in     | admin123 |
| Manager | priya@easyfinancewale.in     | mgr123   |
| Staff   | amit@easyfinancewale.in      | staff123 |
| Staff   | neha@easyfinancewale.in      | staff123 |
| DSA     | mumbaidsa@easyfinancewale.in | dsa123   |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| **403 Forbidden** | Document root must end in `/crm/public` not `/crm` |
| **CORS error in browser console** | Set FRONTEND_URL in .env, run `php artisan config:cache` |
| **500 Server Error** | `tail -50 ~/crm/storage/logs/laravel.log` |
| **Page refresh gives 404** | `.htaccess` not working — contact Hostinger to enable mod_rewrite |
| **DB connection refused** | Use `DB_HOST=127.0.0.1` not `localhost` |
| **Blank screen after login** | Clear cache (Ctrl+Shift+R), check browser console |

---

## Updating the app later

**Backend (PHP changes):** Upload files → `php artisan config:cache && php artisan route:cache`

**Frontend (React changes):** `cd frontend && npm run build` → Upload `dist/` contents to `crm/public/`
