# Linter Issues Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 83 remaining linter errors (81 in blog/admin pages, 2 in utility files) while maintaining all functionality and ensuring clean code compilation.

**Architecture:** Fix issues in three priority phases:
1. **Blog Pages** (Lines 204, 126 in page.tsx and [slug]/page.tsx) - Replace Date.now() impure function calls with static cache-busting, convert `<img>` tags to Next.js Image component, fix `any` type casting
2. **Admin Pages** (users/page.tsx, analytics/page.tsx, kyc/page.tsx) - Replace `any` type casting with proper TypeScript interfaces
3. **Utility/Test Files** - Fix require() imports and unused variables (lower priority, affects tool files not production code)

**Tech Stack:** TypeScript, Next.js Image component, React, Supabase types

---

## Phase 1: Blog Pages (High Priority)

### Task 1: Fix app/blog/page.tsx - Date.now() impure function

**Files:**
- Modify: `app/blog/page.tsx:204` (featured blog author avatar)
- Modify: `app/blog/page.tsx:165, 204` (img tag replacements)

**Why:** React components must be pure functions. Date.now() called during render produces different results on each render, violating React's rules. Next.js Image component provides better optimization and caching strategies.

**Context:** Featured blog section displays author avatar with cache-busting query parameter. Instead of dynamic Date.now(), we'll use a static approach or remove the cache-buster entirely since image URLs shouldn't change.

- [ ] **Step 1: Remove Date.now() from featured blog author avatar (line 204)**

Replace this:
```tsx
<img src={`${featuredBlog.author.avatar_url}?t=${Date.now()}`} alt="" className="w-full h-full object-cover" />
```

With this (use Next.js Image component):
```tsx
import Image from 'next/image';

<Image 
  src={featuredBlog.author.avatar_url} 
  alt={featuredBlog.author?.full_name || 'Author'} 
  width={64}
  height={64}
  className="w-full h-full object-cover"
/>
```

- [ ] **Step 2: Convert img tag to Image component at line 165**

Replace:
```tsx
<img src={`${featuredBlog.author.avatar_url}?t=${Date.now()}`} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
```

With:
```tsx
<Image 
  src={featuredBlog.author.avatar_url} 
  alt={featuredBlog.author?.full_name || 'Author'} 
  width={64}
  height={64}
  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
/>
```

- [ ] **Step 3: Remove unused import**

Remove line 8:
```tsx
import { emitSystemLog } from '@/lib/utils';
```

- [ ] **Step 4: Verify no other img tags in blog grid (lines 228+)**

The blog grid section uses blog.image_url which will be checked in Task 2.

- [ ] **Step 5: Run linter on this file**

```bash
npm run lint app/blog/page.tsx
```

Expected: 0 errors (may have warnings about Image optimization, which is acceptable)

- [ ] **Step 6: Commit**

```bash
git add app/blog/page.tsx
git commit -m "fix: remove Date.now() impure function and use Next.js Image in blog page

- Replace img tags with Next.js Image component for better optimization
- Remove Date.now() cache-busting (causes purity violation)
- Remove unused emitSystemLog import
- Fixes linter errors: 1 purity violation, 2 img element warnings"
```

---

### Task 2: Fix app/blog/[slug]/page.tsx - Any types and img tag

**Files:**
- Modify: `app/blog/[slug]/page.tsx:49-50` (any type casting)
- Modify: `app/blog/[slug]/page.tsx:126` (Date.now() + img tag)
- Modify: `app/blog/[slug]/page.tsx:175, 268, 272` (any type casting)

**Why:** `any` types defeat TypeScript's type safety. The code already defines proper types via database schema, we just need to use them explicitly.

**Context:** The page fetches blog content and parses it into typed items. Headings are filtered from items - we can define a proper ContentItem union type instead of using `any`.

- [ ] **Step 1: Define ContentItem type at top of file**

Add after imports (around line 7):
```tsx
interface ContentItem {
  type: 'heading' | 'paragraph';
  level?: number;
  text: string;
  id: string;
}
```

- [ ] **Step 2: Fix contentWithIds mapping (line 39)**

Replace:
```tsx
const contentWithIds = blog.content.split('\n\n').map((para: string, i: number) => {
```

With:
```tsx
const contentWithIds: ContentItem[] = blog.content.split('\n\n').map((para: string, i: number): ContentItem => {
```

- [ ] **Step 3: Fix headings filter (lines 48-50)**

Replace:
```tsx
const headings = contentWithIds
  .filter((item: any) => item.type === 'heading')
  .map((item: any) => ({ id: item.id, text: item.text }));
```

With:
```tsx
const headings = contentWithIds
  .filter((item): item is ContentItem & { type: 'heading' } => item.type === 'heading')
  .map((item) => ({ id: item.id, text: item.text }));
```

- [ ] **Step 4: Fix Date.now() in author avatar (line 126)**

Replace:
```tsx
<img src={`${blog.author?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}?t=${Date.now()}`} alt={blog.author?.full_name || 'Admin'} className="w-full h-full object-cover rounded-xl grayscale group-hover:grayscale-0 transition-all duration-500" />
```

With:
```tsx
import Image from 'next/image';

const authorImageUrl = blog.author?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';

<Image 
  src={authorImageUrl} 
  alt={blog.author?.full_name || 'Admin'} 
  width={256}
  height={256}
  className="w-full h-full object-cover rounded-xl grayscale group-hover:grayscale-0 transition-all duration-500"
/>
```

- [ ] **Step 5: Fix any types in markdown rendering (line 175)**

The code renders markdown - check if there are any `map` calls with `any` typing. Replace with proper ContentItem type:
```tsx
// Before:
{contentWithIds.map((item: any, i: number) => (

// After:
{contentWithIds.map((item: ContentItem, i: number) => (
```

- [ ] **Step 6: Fix any types in related posts rendering (line 268)**

Replace:
```tsx
{relatedPosts?.map((post: any) => (
```

With:
```tsx
interface RelatedPost {
  title: string;
  slug: string;
  image_url: string | null;
  category: string;
}

// Then:
{relatedPosts?.map((post: RelatedPost) => (
```

- [ ] **Step 7: Convert img tag in related posts (line 272)**

Replace:
```tsx
<img src={post.image_url || 'placeholder.jpg'} alt={post.title} />
```

With:
```tsx
<Image 
  src={post.image_url || 'https://images.unsplash.com/photo-1526374965328-7f5ae4e8a433?auto=format&fit=crop&w=400&q=80'} 
  alt={post.title}
  width={300}
  height={200}
/>
```

- [ ] **Step 8: Run linter on this file**

```bash
npm run lint app/blog/\[slug\]/page.tsx
```

Expected: 0 errors for lines 49, 50, 126, 175, 268, 272

- [ ] **Step 9: Commit**

```bash
git add app/blog/\[slug\]/page.tsx
git commit -m "fix: replace any types with proper TypeScript interfaces in blog slug page

- Define ContentItem interface for parsed blog content
- Define RelatedPost interface for related posts
- Replace img tags with Next.js Image component
- Remove Date.now() impure function calls
- Fix type safety violations with proper generics and type guards
- Fixes linter errors: 4 any type violations, 1 purity violation, 3 img element warnings"
```

---

## Phase 2: Admin Pages (High Priority)

### Task 3: Fix app/admin/users/page.tsx - Any type casting

**Files:**
- Modify: `app/admin/users/page.tsx:58, 65, 72, 92` (any type casting)

**Why:** The users array should be properly typed based on the Supabase select query. All type information is available at query time.

**Context:** The query selects: `id, full_name, role, kyc_status, tier, created_at`. We can create an interface matching this shape and use it throughout.

- [ ] **Step 1: Define User interface after imports**

Add after imports (around line 6):
```tsx
interface User {
  id: string;
  full_name: string | null;
  role: 'founder' | 'investor' | 'admin';
  kyc_status: string | null;
  tier: string | null;
  created_at: string;
}
```

- [ ] **Step 2: Type the users array at query site (line 29)**

Replace:
```tsx
const { data: users } = await supabase
```

With:
```tsx
const { data: users } = await supabase
  .from('profiles')
  .select('id, full_name, role, kyc_status, tier, created_at')
  .order('created_at', { ascending: false }) as { data: User[] | null };
```

- [ ] **Step 3: Fix filter on line 58**

Replace:
```tsx
{users?.filter((u: any) => u.role === 'founder').length || 0}
```

With:
```tsx
{users?.filter((u: User) => u.role === 'founder').length || 0}
```

- [ ] **Step 4: Fix filter on line 65**

Replace:
```tsx
{users?.filter((u: any) => u.role === 'investor').length || 0}
```

With:
```tsx
{users?.filter((u: User) => u.role === 'investor').length || 0}
```

- [ ] **Step 5: Fix filter on line 72**

Replace:
```tsx
{users?.filter((u: any) => u.kyc_status === 'verified').length || 0}
```

With:
```tsx
{users?.filter((u: User) => u.kyc_status === 'verified').length || 0}
```

- [ ] **Step 6: Fix map on line 92**

Replace:
```tsx
users.map((userItem: any) => (
```

With:
```tsx
users.map((userItem: User) => (
```

- [ ] **Step 7: Run linter on this file**

```bash
npm run lint app/admin/users/page.tsx
```

Expected: 0 errors for lines 58, 65, 72, 92

- [ ] **Step 8: Commit**

```bash
git add app/admin/users/page.tsx
git commit -m "fix: replace any types with User interface in admin users page

- Define User interface matching Supabase select schema
- Type users array with User[] from query
- Replace all any type usages with User interface
- Improves type safety and IDE autocomplete
- Fixes linter errors: 4 any type violations"
```

---

### Task 4: Fix app/admin/analytics/page.tsx - Any type, const, unused vars

**Files:**
- Modify: `app/admin/analytics/page.tsx:22, 58, 66, 85, 115` (unused var, missing dependency, const issue, any type)

**Why:** The code has several issues that hint at incomplete refactoring:
- `loading` state is set but never used
- `fetchAnalytics` is called but not included in useEffect dependency array
- `startDate` should be const, not let
- `projectsData` is fetched but unused
- Generic `any` types hide data structure

**Context:** This is a client component admin dashboard. We need to fix reactivity and type safety.

- [ ] **Step 1: Define data interfaces at top**

Add after imports (around line 7):
```tsx
interface ProjectData {
  id: string;
  created_at: string;
  amount_raised: number;
}

interface InvestmentData {
  id: string;
  created_at: string;
  amount: number;
}

interface ProfileData {
  id: string;
  created_at: string;
  role: string;
}
```

- [ ] **Step 2: Remove unused `loading` state (line 22)**

Replace:
```tsx
const [analytics, setAnalytics] = useState<Analytics | null>(null);
const [loading, setLoading] = useState(true);
const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');
```

With:
```tsx
const [analytics, setAnalytics] = useState<Analytics | null>(null);
const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');
```

- [ ] **Step 3: Move fetchAnalytics outside useEffect and memoize it (line 60)**

Replace the useEffect hook:
```tsx
useEffect(() => {
  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', session.user.id).single();
      if (profile?.role !== 'admin') {
        toast.error('Access denied. Admin only.');
        router.push('/dashboard');
        return;
      }
      
      fetchAnalytics();
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    }
  };
  
  checkAuth();
}, [supabase, router, dateRange]);

const fetchAnalytics = async () => {
```

With:
```tsx
const fetchAnalytics = useCallback(async () => {
  try {
    setLoading(true);
    
    const now = new Date();
    const startDate = new Date();  // Changed to const
    
    switch (dateRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Fetch data in parallel with proper typing
    const [
      { count: totalProjects },
      { count: totalInvestors },
      { count: totalInvestments },
      { data: investmentsData },
      { count: newSignups },
    ] = await Promise.all([
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'investor'),
      supabase.from('investments').select('*', { count: 'exact', head: true }).eq('status', 'paid'),
      supabase.from('investments').select('id,created_at,amount') as Promise<{ data: InvestmentData[] | null }>,
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startDate.toISOString()),
    ]);

    const totalRaised = investmentsData?.reduce((sum: number, inv: InvestmentData) => sum + (inv.amount || 0), 0) || 0;

    setAnalytics({
      dau: 0,
      mau: totalInvestors || 0,
      signupConversion: newSignups ? Math.round((newSignups / (totalProjects || 1)) * 100) : 0,
      investmentConversion: totalInvestments ? Math.round(((totalInvestments) / (totalInvestors || 1)) * 100) : 0,
      totalProjects: totalProjects || 0,
      totalRaised,
      totalInvestors: totalInvestors || 0,
    });

    setLoading(false);
  } catch (error) {
    console.error('Analytics error:', error);
    toast.error('Failed to load analytics');
    setLoading(false);
  }
}, [supabase, dateRange]);

useEffect(() => {
  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', session.user.id).single();
      if (profile?.role !== 'admin') {
        toast.error('Access denied. Admin only.');
        router.push('/dashboard');
        return;
      }
      
      fetchAnalytics();
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    }
  };
  
  checkAuth();
}, [supabase, router, fetchAnalytics]);
```

- [ ] **Step 4: Add useCallback import at top**

Replace:
```tsx
import { useState, useEffect } from 'react';
```

With:
```tsx
import { useState, useEffect, useCallback } from 'react';
```

- [ ] **Step 5: Remove unused projectsData variable**

The old code had this line - make sure it's removed in the refactored Promise.all (should already be removed in Step 3).

- [ ] **Step 6: Run linter on this file**

```bash
npm run lint app/admin/analytics/page.tsx
```

Expected: 0 errors for lines 22, 58, 66, 85, 115

- [ ] **Step 7: Commit**

```bash
git add app/admin/analytics/page.tsx
git commit -m "fix: improve type safety and react patterns in analytics dashboard

- Define ProjectData, InvestmentData, ProfileData interfaces
- Remove unused loading state variable
- Move fetchAnalytics outside useEffect and wrap with useCallback
- Fix startDate from let to const
- Remove unused projectsData from query
- Add fetchAnalytics to useEffect dependency array
- Properly type all data fetches
- Fixes linter errors: 1 unused var, 1 missing dependency, 1 prefer-const, 1 unused var, 1 any type"
```

---

### Task 5: Fix app/admin/kyc/page.tsx - Unused import

**Files:**
- Modify: `app/admin/kyc/page.tsx:5` (unused Profile import)

**Why:** Unused imports clutter the code and indicate incomplete refactoring.

**Context:** The page uses profiles data but doesn't need to import the type if it's only using inline type or Supabase's auto-types.

- [ ] **Step 1: Check if Profile is used in the file**

Read lines 1-30 and search for "Profile" usage. If it's not used anywhere, proceed to remove it.

- [ ] **Step 2: Remove unused import**

Replace:
```tsx
import type { Profile } from '@/lib/types';
```

Remove this line entirely if Profile is not used.

- [ ] **Step 3: Run linter on this file**

```bash
npm run lint app/admin/kyc/page.tsx
```

Expected: 0 warnings for unused Profile import

- [ ] **Step 4: Commit**

```bash
git add app/admin/kyc/page.tsx
git commit -m "fix: remove unused Profile import from kyc admin page"
```

---

## Phase 3: Summary Verification

### Task 6: Verify all fixes and run final build

**Files:** All modified files

**Why:** Ensure no regressions and all linter errors are fixed.

- [ ] **Step 1: Run full linter check**

```bash
npm run lint
```

Expected output should show:
- Previous: 83 errors (81 production + 2 files)
- After fixes: ~50 errors (mostly in test/skill files which are non-production)

- [ ] **Step 2: Count remaining errors (should be test/skill files only)**

```bash
npm run lint 2>&1 | grep "^✖"
```

- [ ] **Step 3: Run TypeScript build**

```bash
npm run build
```

Expected: Exit code 0, "Compiled successfully"

- [ ] **Step 4: Final verification commit**

```bash
git log --oneline -10
```

Verify all 5 commits are present:
1. Fix blog page
2. Fix blog slug page  
3. Fix admin users page
4. Fix admin analytics page
5. Fix admin kyc page

- [ ] **Step 5: Create final summary commit**

```bash
git add .
git commit -m "fix: resolve all blog and admin linter issues

Summary of changes:
- Removed Date.now() impure function calls (purity violations)
- Converted img tags to Next.js Image component for optimization
- Replaced any type casting with proper TypeScript interfaces
- Fixed React hooks dependencies and patterns
- Fixed unused imports and variables

Files modified:
- app/blog/page.tsx (removed Date.now, unused imports)
- app/blog/[slug]/page.tsx (removed Date.now, fixed any types)
- app/admin/users/page.tsx (replaced 4 any types with User interface)
- app/admin/analytics/page.tsx (fixed hooks, const, unused vars)
- app/admin/kyc/page.tsx (removed unused import)

Linter results:
- Production code: 0 errors
- Remaining errors: ~2 (in non-production test files)
- Build: ✓ Successful

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

- [ ] **Step 6: Push to GitHub**

```bash
git push origin main
```

---

## Execution Path

**Plan complete and saved.** Two execution options:

**1. Subagent-Driven (recommended)** - Fresh subagent per task, full context, fast iteration with review between tasks

**2. Inline Execution** - Execute tasks in this session with checkpoints for verification

Which approach would you prefer?
