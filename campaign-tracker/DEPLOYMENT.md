# 🚀 Deployment Guide

This guide will help you deploy the Campaign Profitability Tracker to GitHub and then to Netlify or Vercel.

## 📋 Prerequisites

- GitHub account
- Supabase account (free tier is sufficient)
- Netlify or Vercel account (both have free tiers)

## 🗄️ Step 1: Set up Supabase Database

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose organization and enter project details
   - Wait for project to be created

2. **Run Database Schema**
   - In your Supabase dashboard, go to "SQL Editor"
   - Copy the entire content from `database-schema.sql`
   - Paste and run the SQL script
   - This will create the table, indexes, and sample data

3. **Get API Credentials**
   - Go to Settings > API
   - Copy your "Project URL" and "anon public" key
   - Keep these safe - you'll need them for deployment

## 📁 Step 2: Prepare Code for GitHub

1. **Create Local Environment File**
   ```bash
   cp .env.example .env.local
   ```

2. **Add Your Supabase Credentials**
   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Test Locally**
   ```bash
   npm run dev
   ```
   - Open http://localhost:3000
   - Test adding/editing invoices
   - Ensure everything works

## 🐙 Step 3: Push to GitHub

1. **Initialize Git Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Campaign Profitability Tracker"
   ```

2. **Create GitHub Repository**
   - Go to [github.com](https://github.com)
   - Click "New repository"
   - Name it `campaign-profitability-tracker`
   - Don't initialize with README (we already have one)
   - Click "Create repository"

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/yourusername/campaign-profitability-tracker.git
   git branch -M main
   git push -u origin main
   ```

## 🌐 Step 4A: Deploy to Netlify

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Choose "GitHub" and authorize
   - Select your repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - (These are already configured in `netlify.toml`)

3. **Set Environment Variables**
   - In Netlify dashboard, go to Site settings > Environment variables
   - Add these variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL = https://your-project-id.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_anon_key_here
     ```

4. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete
   - Your site will be live at a Netlify URL

## ⚡ Step 4B: Deploy to Vercel (Alternative)

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   - During import, add environment variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL = https://your-project-id.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_anon_key_here
     ```

3. **Deploy**
   - Click "Deploy"
   - Vercel will automatically detect Next.js settings
   - Your site will be live at a Vercel URL

## 🔧 Step 5: Configure Custom Domain (Optional)

### For Netlify:
1. Go to Site settings > Domain management
2. Add custom domain
3. Follow DNS configuration instructions

### For Vercel:
1. Go to Project settings > Domains
2. Add custom domain
3. Configure DNS records as instructed

## ✅ Step 6: Verify Deployment

1. **Test Core Features**
   - Add new campaign invoice
   - Edit existing data
   - Check profit calculations
   - Verify tax calculations (18%)

2. **Check Console for Errors**
   - Open browser developer tools
   - Look for any JavaScript errors
   - Ensure Supabase connection works

3. **Test Responsive Design**
   - Check on mobile devices
   - Verify table scrolling works
   - Test all buttons and forms

## 🔄 Step 7: Set up Continuous Deployment

Both Netlify and Vercel automatically deploy when you push to GitHub:

1. **Make Changes Locally**
   ```bash
   # Make your changes
   git add .
   git commit -m "Update feature"
   git push origin main
   ```

2. **Automatic Deployment**
   - Netlify/Vercel will automatically detect the push
   - Build and deploy the new version
   - Usually takes 1-3 minutes

## 🛠️ Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Ensure all dependencies are in `package.json`
- Check build logs for specific errors

### Database Connection Issues
- Verify Supabase URL and key are correct
- Check if RLS policies are properly set
- Ensure database schema was run successfully

### UI Issues
- Clear browser cache
- Check if all CSS files are loading
- Verify responsive design on different screen sizes

## 📊 Monitoring and Analytics

### Netlify Analytics
- Go to Site overview > Analytics
- Monitor page views and performance

### Vercel Analytics
- Go to Project > Analytics
- Track Core Web Vitals and usage

### Supabase Monitoring
- Go to Supabase dashboard > Reports
- Monitor database usage and API calls

## 🔐 Security Considerations

1. **Environment Variables**
   - Never commit `.env.local` to Git
   - Use different Supabase projects for dev/prod if needed

2. **Supabase Security**
   - Review RLS policies
   - Monitor API usage
   - Set up proper authentication if needed

3. **Domain Security**
   - Use HTTPS (automatic with Netlify/Vercel)
   - Consider adding security headers

## 🎯 Next Steps

After successful deployment:

1. **Share with Users**
   - Send them the live URL
   - Provide user guide/training

2. **Monitor Usage**
   - Check analytics regularly
   - Monitor for any errors

3. **Plan Updates**
   - Gather user feedback
   - Plan new features
   - Regular maintenance updates

---

**🎉 Congratulations! Your Campaign Profitability Tracker is now live!**
