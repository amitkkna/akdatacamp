# ✅ Deployment Checklist

Use this checklist to ensure smooth deployment to GitHub and Netlify/Vercel.

## 🔍 Pre-Deployment Verification

### ✅ Code Quality
- [ ] Run `npm run build-check` - All checks pass
- [ ] Run `npm run lint` - No linting errors
- [ ] Run `npm run type-check` - No TypeScript errors
- [ ] Run `npm run build` - Build succeeds
- [ ] Test locally with `npm run dev` - App works correctly

### ✅ Database Setup
- [ ] Supabase project created
- [ ] Database schema applied (`database-schema.sql`)
- [ ] Sample data inserted and visible
- [ ] API credentials copied (URL + anon key)
- [ ] RLS policies enabled and working

### ✅ Environment Configuration
- [ ] `.env.local` created with correct Supabase credentials
- [ ] Local app connects to database successfully
- [ ] Can add/edit/delete invoices locally
- [ ] Profit calculations working correctly

## 🐙 GitHub Deployment

### ✅ Repository Setup
- [ ] GitHub repository created
- [ ] Repository name: `campaign-profitability-tracker`
- [ ] Repository is public (or private with proper access)
- [ ] README.md is comprehensive and up-to-date

### ✅ Code Push
```bash
# Initialize and push
git init
git add .
git commit -m "Initial commit: Campaign Profitability Tracker"
git remote add origin https://github.com/yourusername/campaign-profitability-tracker.git
git branch -M main
git push -u origin main
```

- [ ] All files pushed to GitHub
- [ ] `.env.local` is NOT in repository (check .gitignore)
- [ ] Repository is accessible and complete

## 🌐 Netlify Deployment

### ✅ Site Setup
- [ ] Netlify account created/logged in
- [ ] "New site from Git" selected
- [ ] GitHub repository connected
- [ ] Build settings configured:
  - Build command: `npm run build`
  - Publish directory: `.next`

### ✅ Environment Variables
Add these in Netlify Site Settings > Environment Variables:
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://your-project-id.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your_supabase_anon_key_here`

### ✅ Deployment
- [ ] Initial deployment triggered
- [ ] Build completes successfully
- [ ] Site is accessible at Netlify URL
- [ ] No console errors in browser
- [ ] Database connection works on live site

## ⚡ Vercel Deployment (Alternative)

### ✅ Site Setup
- [ ] Vercel account created/logged in
- [ ] "New Project" selected
- [ ] GitHub repository imported
- [ ] Framework preset: Next.js (auto-detected)

### ✅ Environment Variables
Add during import or in Project Settings:
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://your-project-id.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your_supabase_anon_key_here`

### ✅ Deployment
- [ ] Initial deployment triggered
- [ ] Build completes successfully
- [ ] Site is accessible at Vercel URL
- [ ] No console errors in browser
- [ ] Database connection works on live site

## 🧪 Post-Deployment Testing

### ✅ Core Functionality
- [ ] Homepage loads correctly
- [ ] Summary cards show correct totals
- [ ] Can add new campaign invoice
- [ ] Can edit existing invoices
- [ ] Can delete invoices
- [ ] Campaign grouping works
- [ ] Expandable rows function properly

### ✅ Data Operations
- [ ] Customer invoice creation works
- [ ] Vendor expense creation works
- [ ] 18% tax calculation is automatic
- [ ] Profit/margin calculations are correct
- [ ] Payment status updates work
- [ ] Data persists after page refresh

### ✅ UI/UX
- [ ] Responsive design works on mobile
- [ ] Table scrolls properly on small screens
- [ ] All buttons and forms are functional
- [ ] Color coding is clear and consistent
- [ ] Loading states work properly

### ✅ Performance
- [ ] Page loads quickly (< 3 seconds)
- [ ] No JavaScript errors in console
- [ ] Database queries are fast
- [ ] Images and assets load properly

## 🔧 Troubleshooting

### Build Failures
- Check environment variables are set correctly
- Verify all dependencies are in package.json
- Review build logs for specific errors
- Ensure database schema is applied

### Runtime Errors
- Check browser console for JavaScript errors
- Verify Supabase connection in Network tab
- Test database operations manually
- Check RLS policies in Supabase

### Performance Issues
- Monitor Supabase usage in dashboard
- Check for slow queries
- Optimize images and assets
- Review Core Web Vitals

## 🎉 Success Criteria

Your deployment is successful when:

✅ **Build**: No errors during build process  
✅ **Deploy**: Site is live and accessible  
✅ **Database**: All CRUD operations work  
✅ **UI**: Responsive and functional on all devices  
✅ **Performance**: Fast loading and smooth interactions  
✅ **Data**: Calculations are accurate and persistent  

## 📞 Support

If you encounter issues:

1. **Check this checklist** - Ensure all steps completed
2. **Review logs** - Build logs, browser console, Supabase logs
3. **Test locally** - Verify everything works in development
4. **Check documentation** - README.md, DEPLOYMENT.md
5. **Create issue** - GitHub issues with detailed description

---

**🚀 Ready to deploy? Follow this checklist step by step!**
