# 🚀 Quick Start Guide

Get your Campaign Profitability Tracker up and running in 10 minutes!

## ⚡ Super Quick Setup

### 1. Verify Build Readiness
```bash
npm run build-check
```

### 2. Set up Supabase (2 minutes)
1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy URL and anon key from Settings → API
3. Go to SQL Editor → Paste content from `database-schema.sql` → Run

### 3. Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### 4. Test Locally
```bash
npm install
npm run dev
```
Open http://localhost:3000 and test adding an invoice.

### 5. Deploy to GitHub + Netlify
```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/campaign-tracker.git
git push -u origin main

# Deploy on Netlify
# 1. Go to netlify.com → New site from Git
# 2. Connect GitHub repo
# 3. Add environment variables (same as .env.local)
# 4. Deploy!
```

## 🎯 What You Get

✅ **Campaign Grouping**: Multiple invoices per campaign  
✅ **Automatic Calculations**: 18% tax + profit/margin  
✅ **Inline Editing**: Edit directly in table  
✅ **Responsive Design**: Works on all devices  
✅ **Real-time Data**: Powered by Supabase  
✅ **Production Ready**: Optimized for deployment  

## 📱 Features Overview

### Dashboard
- **Summary Cards**: Total revenue, expenses, profit, margin
- **Campaign Rows**: Click to expand and see individual invoices
- **Color Coding**: Green (customer), Red (vendor), Blue (profit)

### Data Entry
- **Add Campaign**: Creates new campaign with first invoice
- **Add Invoice**: Add customer/vendor invoices to existing campaigns
- **Inline Edit**: Click edit button to modify data in place
- **Auto-calculations**: Tax and profit calculated automatically

### Data Structure
Each campaign can have:
- Multiple customer invoices (money coming in)
- Multiple vendor expenses (money going out)
- Automatic profit/margin calculations
- Payment status tracking

## 🔧 Customization

### Colors & Styling
Edit `src/app/globals.css` and Tailwind classes in components.

### Database Schema
Modify `database-schema.sql` and update TypeScript types in `src/lib/database.types.ts`.

### Business Logic
Update calculation functions in `src/lib/utils.ts`.

## 🆘 Troubleshooting

### Build Issues
```bash
npm run prepare-deploy
```
This runs all checks and builds the project.

### Database Connection
- Check Supabase URL and key in environment variables
- Ensure database schema was run successfully
- Verify RLS policies are enabled

### Deployment Issues
- Check environment variables in Netlify/Vercel
- Review build logs for specific errors
- Ensure all dependencies are in package.json

## 📞 Support

- **Documentation**: See README.md and DEPLOYMENT.md
- **Issues**: Create GitHub issue with details
- **Contributing**: See CONTRIBUTING.md

## 🎉 You're Ready!

Your Campaign Profitability Tracker is now ready for production use. Share the live URL with your team and start tracking those campaigns!

---

**Need help?** Check the detailed guides:
- 📖 [README.md](README.md) - Full documentation
- 🚀 [DEPLOYMENT.md](DEPLOYMENT.md) - Detailed deployment guide
- 🤝 [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute
