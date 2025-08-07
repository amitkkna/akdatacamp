# 🌐 Netlify Environment Variables Setup

Your app works locally but not on Netlify because environment variables aren't configured properly. Here's how to fix it:

## 🔧 **Step-by-Step Fix**

### **1. Get Your Supabase Credentials**

From your local `.env.local` file, you have:
- **Supabase URL:** `https://sybdtzjudvuklbweqeuw.supabase.co`
- **Supabase Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5YmR0emp1ZHZ1a2xid2VxZXV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMDgzNTQsImV4cCI6MjA2MzU4NDM1NH0.CYV4B4ejEvqcnu65-j4IXqAhu7u-08vZlwReO_IMBms`

### **2. Add Environment Variables to Netlify**

1. **Go to Netlify Dashboard**
   - Visit [netlify.com](https://netlify.com)
   - Click on your site (ptrateekdata)

2. **Navigate to Environment Variables**
   - Click "Site settings"
   - Click "Environment variables" in the left sidebar

3. **Add These Variables**
   
   **Variable 1:**
   - **Key:** `NEXT_PUBLIC_SUPABASE_URL`
   - **Value:** `https://sybdtzjudvuklbweqeuw.supabase.co`
   - **Scopes:** All scopes (Production, Deploy previews, Branch deploys)

   **Variable 2:**
   - **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5YmR0emp1ZHZ1a2xid2VxZXV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMDgzNTQsImV4cCI6MjA2MzU4NDM1NH0.CYV4B4ejEvqcnu65-j4IXqAhu7u-08vZlwReO_IMBms`
   - **Scopes:** All scopes (Production, Deploy previews, Branch deploys)

### **3. Trigger a New Deploy**

After adding environment variables:

1. **Go to Deploys tab**
2. **Click "Trigger deploy"**
3. **Select "Deploy site"**

OR

1. **Make a small change to your code**
2. **Push to GitHub** (auto-deploys)

### **4. Verify the Fix**

Once deployed:

1. **Open your live site**
2. **Open browser developer tools** (F12)
3. **Check the Console tab**
4. **Look for the "Environment check" log**
5. **Should show your Supabase URL and confirm the key exists**

## 🔍 **Troubleshooting**

### **If Still Not Working:**

1. **Check Environment Variables**
   ```
   In Netlify: Site Settings > Environment Variables
   Should see:
   ✅ NEXT_PUBLIC_SUPABASE_URL
   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

2. **Check Build Logs**
   ```
   In Netlify: Deploys > [Latest Deploy] > Deploy log
   Look for any environment variable errors
   ```

3. **Check Browser Console**
   ```
   Open your live site
   Press F12 > Console
   Look for "Environment check" log
   Should show your Supabase URL
   ```

### **Common Issues:**

❌ **Environment variables not set in Netlify**
✅ **Solution:** Add them in Site Settings > Environment Variables

❌ **Variables set but not deployed**
✅ **Solution:** Trigger a new deploy after adding variables

❌ **Wrong variable names**
✅ **Solution:** Must be exactly `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

❌ **Variables not scoped correctly**
✅ **Solution:** Enable for "All scopes" or at least "Production"

## 📱 **Quick Test**

After setting up environment variables:

1. **Visit your live site**
2. **Add `/test` to the URL** (e.g., `https://your-site.netlify.app/test`)
3. **This will show a connection test page**
4. **Should show "✅ Connected successfully!"**

## 🎯 **Expected Result**

After following these steps:
- ✅ Environment variables visible in Netlify dashboard
- ✅ New deploy triggered and completed
- ✅ Live site shows data from Supabase
- ✅ Console shows environment check with your Supabase URL
- ✅ No connection errors in browser console

---

**Need help?** Check the browser console for error messages and compare with your local environment.
