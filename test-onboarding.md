# Onboarding Flow Test Checklist

## Prerequisites
- Development server running
- Browser with console access

---

## Test 1: New User Onboarding Flow

### Step 1: Clear State
```javascript
// Open browser console and run:
localStorage.clear();
sessionStorage.clear();
```

### Step 2: Create Account / Login
- [ ] Navigate to `/login` or `/signup`
- [ ] Create new account or login
- [ ] **Expected:** Auto-redirect to `/onboarding/intent`

### Step 3: Intent Selection
- [ ] Verify you're on `/onboarding/intent`
- [ ] See 4 intent options with icons
- [ ] Try clicking "Continue" without selection
- [ ] **Expected:** Button disabled or shows validation
- [ ] Select "Flat-lay → model photo"
- [ ] Click "Continue"
- [ ] **Expected:** Redirect to `/onboarding/create/flat-lay`

### Step 4: Simplified Creation UI
- [ ] Verify no "Steps" indicator at top
- [ ] Verify no aspect ratio selector
- [ ] Verify no resolution selector
- [ ] Upload a product image
- [ ] Click generate/next step buttons as needed
- [ ] **Expected:** Generation starts

### Step 5: Auto-Redirect After Generation
- [ ] Wait for generation to complete
- [ ] **Expected:** Auto-redirect to `/onboarding/create/result`
- [ ] **Expected:** See celebration message "🎉 Your first image is ready"
- [ ] **Expected:** See generated image

### Step 6: Complete Onboarding
- [ ] Click "Download image" button
- [ ] **Expected:** Image downloads
- [ ] Click "Create another image" button
- [ ] **Expected:** Redirect to `/dashboard`
- [ ] Verify full dashboard with all features visible

---

## Test 2: Returning User (Onboarding Complete)

### Setup
User with `onboardingCompleted: true` in localStorage

### Steps
- [ ] Login with user account
- [ ] **Expected:** Direct access to `/dashboard`
- [ ] **Expected:** NO redirect to onboarding
- [ ] Navigate manually to `/onboarding/intent`
- [ ] **Expected:** Redirect back to `/dashboard`

---

## Test 3: Mid-Flow Abandonment & Resumption

### Step 1: Start Onboarding
- [ ] Clear localStorage
- [ ] Login as new user
- [ ] Navigate to `/onboarding/intent`
- [ ] Select "On-model fashion photo"
- [ ] Click "Continue"
- [ ] **Expected:** Land on `/onboarding/create/on-model`

### Step 2: Abandon Mid-Flow
- [ ] Close browser tab (or clear session)
- [ ] **Expected:** Intent saved in localStorage

### Step 3: Return
- [ ] Login again with same account
- [ ] **Expected:** Resume at `/onboarding/intent` or last step
- [ ] Intent should still be remembered

---

## Test 4: All Intent Types

Test each intent option redirects correctly:

### Flat-Lay
- [ ] Select "Flat-lay → model photo"
- [ ] **Expected:** Redirect to `/onboarding/create/flat-lay`

### On-Model
- [ ] Select "On-model fashion photo"
- [ ] **Expected:** Redirect to `/onboarding/create/on-model`

### Mannequin
- [ ] Select "Mannequin → model photo"
- [ ] **Expected:** Redirect to `/onboarding/create/mannequin`

### Background Change
- [ ] Select "Background change only"
- [ ] **Expected:** Redirect to `/onboarding/create/background`

---

## Test 5: Direct URL Access (Security)

### Test Protected Routes
- [ ] Logout completely
- [ ] Navigate to `/onboarding/intent`
- [ ] **Expected:** Redirect to `/login`
- [ ] Navigate to `/onboarding/create/flat-lay`
- [ ] **Expected:** Redirect to `/login`
- [ ] Navigate to `/onboarding/create/result`
- [ ] **Expected:** Redirect to `/login`

---

## Test 6: State Persistence

### Verify localStorage
```javascript
// In browser console after completing onboarding:
const authState = JSON.parse(localStorage.getItem('auth-storage'));
console.log({
  onboardingCompleted: authState.state?.user?.onboardingCompleted,
  intent: authState.state?.user?.intent,
  onboardingProgress: authState.state?.onboardingProgress
});
```

**Expected:**
```javascript
{
  onboardingCompleted: true,
  intent: "flat_lay" (or other selected intent),
  onboardingProgress: null
}
```

---

## Common Issues & Solutions

### Issue: Infinite Redirect Loop
**Symptom:** Page keeps redirecting between onboarding and dashboard

**Solution:** 
1. Check console for logs
2. Verify `onboardingCompleted` is being set to `true`
3. Clear localStorage and restart test

### Issue: Result Page Shows Loading Forever
**Symptom:** Result page stuck on loading spinner

**Solution:**
1. Check `sessionStorage.getItem('onboarding-result-image')`
2. Verify generation completed successfully
3. Check console for errors

### Issue: Advanced Options Still Visible
**Symptom:** Aspect ratio/resolution selectors showing in onboarding

**Solution:**
1. Verify `isOnboarding={true}` prop passed to component
2. Check component received and uses the prop correctly
3. Hard refresh browser to clear component cache

---

## Success Criteria

All tests pass if:
- ✅ New users are automatically redirected to onboarding
- ✅ Intent selection is mandatory (cannot skip)
- ✅ Creation UI is simplified (no steps, no advanced options)
- ✅ Auto-redirect to result page after generation
- ✅ Onboarding marks as complete after result page
- ✅ Returning users skip onboarding entirely
- ✅ State persists across sessions
- ✅ Protected routes redirect to login if not authenticated

---

## Test Results

Date: __________

Tester: __________

### Test 1: New User Flow
- [ ] PASS
- [ ] FAIL (Details: _________________)

### Test 2: Returning User
- [ ] PASS
- [ ] FAIL (Details: _________________)

### Test 3: Mid-Flow Abandonment
- [ ] PASS
- [ ] FAIL (Details: _________________)

### Test 4: All Intent Types
- [ ] PASS
- [ ] FAIL (Details: _________________)

### Test 5: Direct URL Access
- [ ] PASS
- [ ] FAIL (Details: _________________)

### Test 6: State Persistence
- [ ] PASS
- [ ] FAIL (Details: _________________)

---

## Next Steps After Testing

If all tests pass:
1. ✅ Mark implementation as complete
2. 📊 Set up analytics tracking (optional)
3. 🎨 Fine-tune UI/UX based on user feedback
4. 🔄 Consider backend integration for production

If tests fail:
1. Document specific failure points
2. Review implementation summary for troubleshooting steps
3. Check browser console for error messages
4. Verify all files were saved correctly

