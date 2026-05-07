Title: Constellation Key — Login scene

Claude Design (creative brief):
- Goal: Create a low-poly "constellation key" sculpture for the login hero. The sculpture should feel calm, elegant and secure.
- Visual style: Indigo → teal palette, glassy nodes with soft emissive bloom, thin luminous connector lines. Minimal, low-poly, modern.
- Motion: Entrance timeline (0–2s) nodes scale up in sequence; line draw (2–6s) reveal; idle: continuous slow rotation and gentle vertical bob; loopable.
- Interactivity: small mouse-parallax; hover repels nodes.
- Deliverables: glTF/GLB with baked animation channels for node scales, line draw progress (or morph alternative), and root rotation. Provide a mobile LOD (≤12k tris). Provide emissive and roughness textures (512px, 256px).

Google Stitch MCP (technical/export):
- Export: binary glTF (GLB) with embedded textures.
- Mesh & naming:
  - nodes: group named `nodes_group`, individual node meshes `node_0..node_N`.
  - lines: `line_group` (preferably with a morph target `line_draw` if shader attributes aren't supported).
  - root: `constellation_root` with rotation animation keys.
- Animations:
  - `node_scale` per node (0..2s) keys applied to each `node_X.scale`.
  - `line_draw_progress` (2..6s) as morph or animated vertex attribute; if not possible, bake geometry morph that reveals lines.
  - `idle_rotation` loop (0..10s) keyed on `constellation_root.rotation`.
- Textures: emissive (512x512), roughness (256x256), normal optional.
- Constraints: desktop ≤30k tris; mobile LOD ≤12k tris. Name file `login.glb`. Include `login.json` metadata and a 1200x800 poster PNG.

Notes for integrator:
- Keep animations loopable. If providing animations as named clips, use clip names: `node_entrance`, `line_draw`, `idle_loop`.
- If possible provide a variant that exposes a `line_draw` uniform in the material for the client shader to animate.
