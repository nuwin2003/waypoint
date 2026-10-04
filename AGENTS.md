<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Waypoint (imported from GitHub nuwin2003/waypoint)
- Screens from the original React app live in src/app, src/features, src/shared and keep react-router style imports via src/lib/router-compat.tsx; keep that shim so imported code stays unchanged.
- src/api.ts keeps the original `api` object signatures but is backed by Lovable Cloud; add new data actions there, not as REST calls.
- Planning engine is a pure TS port in src/lib/planning-engine.ts; plan runs and admin user creation run as server functions in src/lib/waypoint.functions.ts.
- Workspace routes (/admin, /dispatch, /load, /store, /drive) are ssr:false layouts gated by RoleRoute; roles live in user_roles, the first sign-up becomes ADMIN.
- tsconfig strict index/optional flags are relaxed to match the original repo's settings.

- Driver navigation map uses the browser key in .env `VITE_GOOGLE_MAPS_API_KEY` (safe to ship to the client, map + Routes API only). Route lines come from Routes API `directions/v2:computeRoutes` called directly from the browser (src/features/driver/drivingRoute.ts); the legacy JS DirectionsService fallback in DvMap.tsx was removed because the key project has it disabled.
