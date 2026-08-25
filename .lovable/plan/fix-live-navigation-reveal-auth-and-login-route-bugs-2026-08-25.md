# Fix live navigation, reveal, auth, and login-route bugs

## Scope

1. **Make route transitions immediate and explicit**
   - Configure the TanStack router to preload links on intent, keep preloaded route data warm, and show a branded page skeleton after roughly 100 ms instead of leaving the previous route visible.
   - Audit every route-level `loader` and `beforeLoad` in the project, with special focus on `/`, `/pricing`, `/booking`, `/assessment`, and `/directory`.
   - Keep all five named public routes free of blocking database/network work. Any public data request discovered there will move into component-side query/loading UI.

2. **Make Reveal progressive enhancement**
   - Render content visible by default during SSR and first paint.
   - Only animate elements after IntersectionObserver support and motion preference are known.
   - Never delay above-the-fold content, cap supported delays at 150 ms, and fully disable movement/fades for reduced-motion users.

3. **Surface Google OAuth callback failures**
   - Parse `error` and `error_description` from both query parameters and URL hash on `/auth`.
   - Render a visible, accessible error message and clear the busy state rather than silently leaving the page unchanged.
   - Preserve the existing sign-in and redirect behavior.

4. **Restore `/login` compatibility**
   - Add a public TanStack route that redirects `/login` to `/auth`, preserving a safe destination parameter when present.

5. **Verify build and deployed behavior**
   - Check the latest build diagnostics and run focused browser checks locally for route transitions, visible Reveal content, OAuth error rendering, and `/login` redirect.
   - Publish the fixed build, then load `https://discoverdiplomacy.org` directly and click through to `/pricing` and `/directory`, measuring when the new page content replaces the old page.
   - Confirm `/login` redirects and an OAuth error callback renders visibly on the deployed domain.

## Deliverables

- Exact list of route files that contained blocking loaders/beforeLoad hooks and the treatment applied to each.
- Exact list of changed files.
- Google-provider setup location in Lovable Cloud and the redirect URI to register with the Google OAuth client.
- Deployed-domain timing and rendered-text confirmation; no completion claim before that check passes.

## Technical notes

- The global pending component will be a stable semantic skeleton using existing design tokens.
- Authenticated route guards remain protected; they will not be weakened to make public navigation faster.
- The five named public routes currently appear loader-free in source, so the audit will distinguish actual route blockers from route-module/code-split latency and shared auth/session work.
