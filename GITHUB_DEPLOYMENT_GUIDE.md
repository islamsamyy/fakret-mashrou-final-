# GitHub & Production Deployment Guide

**Project:** arabic-platform  
**Date:** May 30, 2026  
**Status:** Ready for GitHub & Production

---

## 🚀 Step 1: Create GitHub Repository

### Option A: Using GitHub Web Interface

1. Go to [github.com/new](https://github.com/new)
2. **Repository Name:** `arabic-platform`
3. **Description:** Investment platform connecting Arab investors and entrepreneurs
4. **Visibility:** `Public` or `Private` (choose based on your preference)
5. **Initialize repository:** Leave unchecked (we already have git initialized)
6. Click "Create repository"

### Option B: Using GitHub CLI

```bash
# Install GitHub CLI from https://cli.github.com
gh auth login          # Authenticate with GitHub
gh repo create arabic-platform --source=. --remote=origin --push
```

---

## 🔗 Step 2: Add Remote to Git

```bash
cd "d:\IDEA BUSINESS"

# Add remote to your repository
git remote add origin https://github.com/YOUR-USERNAME/arabic-platform.git

# Or if using SSH (recommended):
git remote add origin git@github.com:YOUR-USERNAME/arabic-platform.git

# Verify remote
git remote -v
```

---

## 📤 Step 3: Push Code to GitHub

```bash
cd "d:\IDEA BUSINESS"

# Push all branches
git push -u origin main

# Verify push succeeded
git log --oneline -5

# Check GitHub website to confirm code is there
```

---

## 🛡️ Step 4: Repository Security Settings

### On GitHub Web Interface:

1. **Go to:** Settings → Security & analysis
2. **Enable:**
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates
   - ✅ Secret scanning
   - ✅ Secret scanning push protection

3. **Go to:** Settings → Code security and analysis
4. **Enable:**
   - ✅ Code scanning (GitHub Advanced Security)

---

## 🚀 Step 5: Deploy to Vercel (Recommended)

### A. Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign up"
3. Choose "GitHub" for authentication
4. Authorize Vercel to access your GitHub

### B. Import Project to Vercel
1. Click "New Project" on Vercel dashboard
2. **Import Git Repository**
3. Select `arabic-platform` repository
4. Click "Import"

### C. Configure Environment Variables

In Vercel Project Settings → Environment Variables, add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
STRIPE_SECRET_KEY=sk_live_... (if payments enabled)
STRIPE_PUBLISHABLE_KEY=pk_live_... (if payments enabled)
STRIPE_WEBHOOK_SECRET=whsec_... (if payments enabled)
```

### D. Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Access your live URL once deployment finishes

---

## 🌍 Step 6: Deploy to Staging Environment

Vercel automatically creates:
- **Production:** `https://yourdomain.com` (main branch)
- **Preview:** `https://preview-xxx.vercel.app` (pull requests)

### Testing Preview Deployments

1. Create a test branch: `git checkout -b test-deployment`
2. Make a small change
3. Push: `git push -u origin test-deployment`
4. Create Pull Request on GitHub
5. Vercel creates preview deployment
6. Click link in PR to test
7. Merge PR to production once verified

---

## 🔐 Step 7: Custom Domain Setup

### A. Point Domain to Vercel

1. Go to Vercel Project Settings → Domains
2. Add your domain (e.g., `yourdomain.com`)
3. Follow the DNS configuration instructions
4. Update your domain registrar's DNS records

### B. Configure SSL Certificate

- Vercel automatically issues Let's Encrypt SSL
- Free HTTPS enabled automatically
- Renews automatically

---

## 🔔 Step 8: Configure GitHub Actions (CI/CD)

### Create `.github/workflows/deploy.yml`

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Run tests
        run: npm test --if-present
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Setup Secrets

1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Add these secrets:
   - `VERCEL_TOKEN` - Get from Vercel
   - `VERCEL_ORG_ID` - Get from Vercel
   - `VERCEL_PROJECT_ID` - Get from Vercel

---

## 📋 Step 9: Pre-Deployment Testing

```bash
# 1. Local build test
npm run build

# 2. Start production server
npm run start

# 3. Test endpoints
curl http://localhost:3000/api/search?q=test

# 4. Verify database connection
# Check Supabase dashboard for query activity

# 5. Run automated tests
npm test

# 6. Manual testing
# Visit http://localhost:3000 in browser
# Test registration, login, projects, investments
```

---

## 🎯 Step 10: Production Launch Checklist

Before going live:

- [ ] All code pushed to GitHub main branch
- [ ] Vercel deployment successful
- [ ] Environment variables configured in Vercel
- [ ] Custom domain configured and DNS updated
- [ ] SSL certificate active
- [ ] All tests passing in CI/CD
- [ ] Database backups configured
- [ ] Monitoring and alerts set up
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Analytics configured
- [ ] User onboarding prepared
- [ ] Support documentation ready

---

## 📊 Step 11: Monitor Deployment

### Vercel Monitoring
- Dashboard shows all deployments
- Real-time build logs
- Performance metrics
- Error tracking

### Add Application Monitoring

#### Option 1: Sentry (Error Tracking)
```bash
npm install @sentry/nextjs

# Configure in next.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

#### Option 2: LogRocket (User Session Replay)
```bash
npm install logrocket

# Initialize in _app.tsx
import LogRocket from 'logrocket';

if (typeof window !== 'undefined') {
  LogRocket.init('your-app-id');
}
```

#### Option 3: Datadog
```bash
npm install @datadog/browser-rum

# Configure analytics
```

---

## 🔄 Step 12: Continuous Deployment Workflow

### Development Workflow
```
1. Create feature branch
   git checkout -b feature/new-feature

2. Make changes and test locally
   npm run dev

3. Commit changes
   git add .
   git commit -m "feat: add new feature"

4. Push to GitHub
   git push -u origin feature/new-feature

5. Create Pull Request
   - Go to GitHub → Pull Requests → New
   - Vercel creates preview deployment
   - Team reviews code
   - Run automated tests

6. Merge to main
   - Approvals obtained
   - Preview tested
   - Merge pull request

7. Automatic deployment
   - GitHub Action triggers
   - Build runs
   - Tests run
   - Deploys to Vercel production
```

---

## 🛑 Step 13: Rollback Procedure

If production deployment has issues:

```bash
# 1. Identify the issue
# Check Vercel logs
# Check error tracking (Sentry)

# 2. Revert the commit
git revert <commit-hash>
git push origin main

# 3. Vercel automatically redeploys
# Previous version goes live

# 4. Fix the issue in development
# Create new PR with fix
# Test in preview
# Merge to main

# 5. Deploy again
# Vercel redeployes new fix
```

---

## 📞 Step 14: Setup Support & Documentation

### Create Documentation Files

1. **README.md** - Already created ✅
2. **CONTRIBUTING.md** - For contributors
3. **CODE_OF_CONDUCT.md** - Community guidelines
4. **SECURITY.md** - Security policy
5. **LICENSE** - Add MIT or your preferred license

### Create Issue Templates

In `.github/ISSUE_TEMPLATE/`:
- `bug_report.md` - For bug reports
- `feature_request.md` - For feature requests
- `question.md` - For questions

### Create PR Template

`.github/pull_request_template.md`:
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change

## Testing
- [ ] Local testing
- [ ] All tests passing

## Checklist
- [ ] Code follows style guidelines
- [ ] Documentation updated
```

---

## ✅ Final Verification Checklist

- [ ] GitHub repository created
- [ ] All code pushed to main branch
- [ ] Vercel project created and deployed
- [ ] Environment variables configured
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] CI/CD pipeline working
- [ ] Tests passing in pipeline
- [ ] Monitoring configured
- [ ] Error tracking enabled
- [ ] Database backups verified
- [ ] Documentation complete
- [ ] Team trained on deployment
- [ ] Support channels ready

---

## 🚀 You're Live!

Your application is now:
✅ On GitHub (version controlled)
✅ On Vercel (production deployed)
✅ On Custom Domain (branded URL)
✅ With SSL (HTTPS secured)
✅ With CI/CD (automated deployments)
✅ With Monitoring (error tracking)
✅ With Backups (data protected)

---

## 📞 Useful Commands

```bash
# Check git status
git status

# View recent commits
git log --oneline -10

# View branches
git branch -a

# Create new branch
git checkout -b feature/name

# Switch branches
git checkout main

# Update local main
git pull origin main

# Push changes
git push origin feature-name

# Create PR on GitHub website
# https://github.com/YOUR-USERNAME/arabic-platform/compare

# View CI/CD status
# https://github.com/YOUR-USERNAME/arabic-platform/actions

# View Vercel deployments
# https://vercel.com/dashboard
```

---

## 🎯 Success!

Your project is now:
- ✅ Version controlled on GitHub
- ✅ Deployed to production on Vercel
- ✅ With automated CI/CD
- ✅ With monitoring and alerts
- ✅ Production-ready and scalable

**Congratulations! Your application is live!** 🎉

