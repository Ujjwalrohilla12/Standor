Title: Morphing Gateway — Sign Up scene

Claude Design (creative brief):
- Goal: Design an abstract biomorphic sculpture that morphs between 'closed' and 'open' states to symbolize onboarding.
- Visual style: soft metallic gradient (warm copper → teal), rim light, organic silhouettes, low-medium poly.
- Motion: continuous morph cycle (8–12s) between closed and open; vertex-displacement waves; micro-rotations.
- Interactivity: clicking toggles an 'open' morph and emits a small particle burst.
- Deliverables: glTF/GLB with morph targets named `morph_open` and optionally `vertex_wave` (looping). Provide normal + roughness maps.

Google Stitch MCP (technical/export):
- Export: GLB binary with morph targets and embedded textures.
- Mesh & naming:
  - root: `morph_root`.
  - base mesh: `morph_body` with morph targets `morph_open`, `vertex_wave`.
- Animations:
  - Provide a looping morph animation `morph_cycle` (0..10s).
  - Provide a named short clip `open_trigger` keyed to `morph_open` transition for client triggers.
- Textures: normal (512), roughness (512), emissive optional.
- Constraints: ≤25k tris desktop, ≤8–12k mobile.
- Filenames: `signup.glb`, include `signup.json` and poster PNG.

Notes:
- Ensure morph target names match exactly for client-side control.
- If morph targets unsupported, provide skinned animation or baked vertex-based animation clips.
