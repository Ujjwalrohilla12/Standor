Title: Passkey Sculpture — Register scene

Claude Design (creative brief):
- Goal: Provide an interlocking ring-group and small gear pieces that animate into a key silhouette on successful registration.
- Visual style: chrome rings with rim highlights, darker background; small mechanical details.
- Motion: idle loop, align_on_focus short clip, form_key_success clip (1.0–1.5s) showing rings sliding/rotating into key shape.
- Deliverables: GLB with named animation clips and separate nodes for rings and gears.

Google Stitch MCP (technical/export):
- Export: `register.glb` (binary glTF). Embed textures.
- Mesh & naming:
  - root `passkey_root`.
  - rings `ring_0..ring_N`.
  - gears `gear_0..gear_N`.
- Animations (named clips):
  - `idle_loop` (loopable), `align_on_focus` (0.6s), `form_key_success` (1.2s).
- Textures: normal and roughness (512 each).
- Constraints: desktop ≤30k tris; mobile ≤12k tris.

Notes:
- Provide animation clip names exactly as above to allow client triggers via three.js/GLTFMixer.
- If possible, export separate animation tracks per ring for granular control.
