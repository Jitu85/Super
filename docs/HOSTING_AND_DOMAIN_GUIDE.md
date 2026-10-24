# TalentHunt • Private Hosting & Custom Domain Guide

This guide explains how to host your TalentHunt CBSE website **completely free of cost** with your own private domain name (e.g., `talenthuntcbse.com`, `yourname.com`, etc.).

---

## 🚀 Option 1: 100% Free Cloud Hosting on Render (Recommended)

Render offers a **free web service tier** with:
- Zero hosting fees ($0/month)
- Free automatic SSL certificates (HTTPS)
- Full support for custom domain names
- Git integration (auto-deploys on push)

### Steps to Deploy on Render:
1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of TalentHunt"
   git remote add origin https://github.com/YOUR_USERNAME/talenthunt.git
   git push -u origin main
   ```
2. Go to [Render.com](https://render.com) and sign up for a free account.
3. Click **New +** &rarr; **Web Service**.
4. Connect your GitHub repository.
5. In the service settings:
   - **Name**: `talenthunt`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
6. Click **Create Web Service**. Within 2 minutes, your website is live!

### Connect Your Custom Domain on Render:
1. Go to your Render Web Service dashboard &rarr; **Settings** &rarr; **Custom Domains**.
2. Click **Add Custom Domain** and enter your domain (e.g., `talenthuntcbse.com` and `www.talenthuntcbse.com`).
3. Log into your domain registrar (GoDaddy, Namecheap, Hostinger, Cloudflare, etc.) and add DNS records:
   - **CNAME Record**: Name: `www`, Value: `<your-service-name>.onrender.com`
   - **A Record**: Name: `@`, Value: (Render will show the exact IP address)
4. Render automatically provisions a free SSL Certificate (Let's Encrypt) within minutes.

---

## 🖥️ Option 2: Self-Hosting on a VPS (DigitalOcean / Linode / Oracle Free Tier)

If you have a Linux VPS (Ubuntu 22.04 / 24.04):

### 1. Install Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Clone and Setup TalentHunt:
```bash
git clone https://github.com/YOUR_USERNAME/talenthunt.git /var/www/talenthunt
cd /var/www/talenthunt
npm install --production
```

### 3. Keep Running with PM2 (Free Process Manager):
```bash
sudo npm install -g pm2
pm2 start server.js --name "talenthunt"
pm2 startup
pm2 save
```

### 4. Setup Nginx Reverse Proxy with Free SSL:
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Edit `/etc/nginx/sites-available/talenthunt`:
```nginx
server {
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site and get SSL:
```bash
sudo ln -s /etc/nginx/sites-available/talenthunt /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 🗄️ Database Persistence (SQLite)

- TalentHunt uses an embedded SQLite database (`./data/talenthunt.db`).
- **Cost**: $0.00 forever (no external database server needed).
- **Backups**: Simply copy the single file `./data/talenthunt.db` anytime to create a complete backup of all students, questions, attempts, and certificates.

---

## 🌐 Summary of DNS Settings for Any Registrar

| Type | Name / Host | Target / Value | TTL |
|------|-------------|----------------|-----|
| `A`  | `@`         | Your Server IP (e.g. `203.0.113.195`) | Automatic / 3600 |
| `CNAME` | `www`    | `yourdomain.com` or Host CNAME | Automatic / 3600 |

---
Enjoy your live CBSE Class III TalentHunt learning portal!
