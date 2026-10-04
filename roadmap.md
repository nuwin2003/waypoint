# Waypoint migration roadmap

Source: GitHub nuwin2003/waypoint @ 74c02fc (development)

- [x] Import React frontend (all 5 workspaces, styles, assets) onto TanStack routing
- [x] Enable Lovable Cloud; port schema + reference/demo data
- [x] Auth: email/password sign-in, roles table, role-based workspace gating, first-admin setup
- [x] Data layer: Cloud-backed outlets, vehicles, orders, receive
- [x] Admin: users list/create/activate/assign, overview stats
- [x] Planning engine port + plan run/context
- [x] Loader and driver data actions
- [x] Demo accounts for all five roles created; each signs in to its workspace
- [x] Seed official datasets (120 outlets, 60 vehicles, 12 districts, allowances) + S1 peak-day orders
- [x] Engine fixes: published allowances, delivery windows, best-fit packing, deferral reasons, re-plan, weekly fuel; passes check_allocation.py
- [x] Planning screen: date/depot picker, allocated trips with ETAs, deferral list, carry-over, demo reset
- [x] Replace sample proposal with live suggested plan and immediate, validated manual route edits
- [ ] Google Maps key for driver navigation (blocked: needs key from user)
- [ ] Repo deliverables outside Lovable (docker-compose, docs, AI disclosure, video) — user's task
