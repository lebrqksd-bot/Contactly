# Deploy to GoDaddy - Step by Step Guide

## Prerequisites
- GoDaddy domain and hosting account
- FTP access to your GoDaddy hosting (or cPanel File Manager)

## Step 1: Build Your Web App

Run this command in your project directory:

```bash
npm run build:web
```

This will create a `web-build` folder with all the static files needed for your website.

## Step 2: Prepare Files for Upload

1. Open the `web-build` folder
2. You should see files like:
   - `index.html`
   - `_expo/` folder
   - `assets/` folder
   - Other static files

## Step 3: Upload to GoDaddy

### Option A: Using cPanel File Manager (Easiest)

1. Log in to your GoDaddy account
2. Go to **My Products** → **Web Hosting** → **Manage**
3. Click **cPanel Admin**
4. Open **File Manager**
5. Navigate to `public_html` folder (or your domain's root folder)
6. **Delete all existing files** in public_html (backup first if needed!)
7. Upload all files from your `web-build` folder:
   - Select all files in `web-build`
   - Upload to `public_html`
   - Make sure folder structure is preserved

### Option B: Using FTP Client (FileZilla, WinSCP, etc.)

1. Get your FTP credentials from GoDaddy:
   - Go to cPanel → **FTP Accounts**
   - Note your FTP host, username, and password

2. Connect using FTP client:
   - Host: `ftp.yourdomain.com` (or IP from GoDaddy)
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21

3. Navigate to `public_html` folder
4. Upload all files from `web-build` folder

## Step 4: Configure Your Domain

1. In GoDaddy, go to **DNS Management**
2. Make sure your domain points to your hosting:
   - A record should point to your hosting IP
   - Or use GoDaddy's nameservers

## Step 5: Set Environment Variables

Since GoDaddy hosting doesn't support environment variables easily, you have two options:

### Option A: Hardcode in Code (Not Recommended for Production)
Update your code to use the values directly (only for web build).

### Option B: Use Build-time Variables (Recommended)
Create a `.env.production` file:
```env
EXPO_PUBLIC_SUPABASE_URL=https://bnxjvjcxctzbczodsaqa.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key-here
EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET=contact-images
```

Then build:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://bnxjvjcxctzbczodsaqa.supabase.co EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key npm run build:web
```

## Step 6: Test Your Website

1. Wait 5-10 minutes for DNS propagation
2. Visit your domain: `https://yourdomain.com`
3. Your app should load!

## Troubleshooting

### App Not Loading?
- Check that `index.html` is in the root of `public_html`
- Verify all folders (`_expo`, `assets`) are uploaded
- Check browser console for errors (F12)

### 404 Errors?
- Make sure you uploaded the `_expo` folder
- Check file permissions (should be 644 for files, 755 for folders)

### Environment Variables Not Working?
- Rebuild with environment variables set
- Check that variables start with `EXPO_PUBLIC_`

## Important Notes

⚠️ **GoDaddy Traditional Hosting Limitations:**
- May not support all React Native Web features
- Some native modules won't work on web
- Performance may be slower than modern hosting

✅ **Better Alternatives for Web:**
- **Vercel** (Free, fast, easy) - Recommended
- **Netlify** (Free, good for static sites)
- **Expo Hosting** (Built for Expo apps)

## Quick Deploy to Vercel (Alternative - Recommended)

If GoDaddy hosting has issues, use Vercel instead:

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Build and deploy:
   ```bash
   npm run build:web
   cd web-build
   vercel --prod
   ```

3. Connect your GoDaddy domain in Vercel dashboard
4. Update DNS in GoDaddy to point to Vercel

This gives you:
- ✅ Better performance
- ✅ Free SSL certificate
- ✅ Easy environment variables
- ✅ Automatic deployments
- ✅ Your GoDaddy domain still works

## Need Help?

- GoDaddy Support: https://www.godaddy.com/help
- Expo Web Docs: https://docs.expo.dev/workflow/web/
- Vercel Docs: https://vercel.com/docs

