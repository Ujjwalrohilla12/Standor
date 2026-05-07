3D Assets & Integration — Guide

Overview
- Drop GLB assets exported from Claude Design / Google Stitch into `public/models/` using these filenames:
  - `login.glb` (+ `login.json`, `login-poster.png`)
  - `signup.glb` (+ `signup.json`, `signup-poster.png`)
  - `about.glb` (+ `about.json`, `about-poster.png`)
  - `register.glb` (+ `register.json`, `register-poster.png`)

What the repo supports
- Each scene has a procedural fallback implemented in React/Three (`app/frontend/src/components/3d/*`).
- The `GLBLoaderWrapper` checks for model presence via a `HEAD` request and will load the GLB when available; otherwise it renders the procedural scene.
- `AnimatedHero` forwards `sceneProps` to each scene. The `Register` page passes `sceneProps={{ triggerSuccess: success }}` so the registration scene will play a `form_key_success` clip if the GLB exposes it, otherwise the procedural scene shows a success pulse.

Designer/exporter checklist
- Export binary glTF (GLB) with embedded textures.
- Include named animation clips when needed (e.g., `form_key_success`, `align_on_focus`, `morph_cycle`).
- Keep desktop polycount ≤30k tris; mobile LOD ≤12k tris.
- Provide JSON metadata with `scale` and `camera` preferences. Example:
  {
    "name": "Constellation Key",
    "file": "login.glb",
    "scale": 0.9,
    "camera": [0,0.4,5.5],
    "preferredBackground": "#08091a"
  }

Local testing
1) From `app/frontend` install deps and run dev server:

```bash
npm install
npm run dev
```

2) Visit pages:
- http://localhost:5173/login
- http://localhost:5173/register
- /about and /signup as applicable

3) To test register success animation locally without a backend, you can temporarily set `success` state to `true` in `Register.tsx` or submit the form with a working backend.

Notes & limitations
- The `GLBLoaderWrapper` uses `fetch HEAD` to detect model presence — static hosts must allow HEAD requests.
- If a GLB provides animations, the loader creates a `THREE.AnimationMixer` and attempts to locate a clip named `form_key_success`. Ensure clip names match.
- For shader-driven effects (e.g., line draw uniforms) the GLB must expose a material parameter or the client will need to replace material with a shader — Claude/Stitch exporter should provide instructions if special uniforms are required.

Next steps you can ask me to run
- Wire additional page events (login hover, signup click) to GLB clips.
- Add UI dev controls (via `leva`) to tweak scene params live.
- Replace procedural placeholders with supplied GLBs and test behavior for each page.
