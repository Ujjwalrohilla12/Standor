Title: Timeline Orbit — About scene

Claude Design (creative brief):
- Goal: Create a central faceted crystal and 5–8 floating milestone cards that orbit around it.
- Visual style: pastel ambers, matte cards with slight bevels, faceted warm crystal core with soft glow.
- Motion: core slow pulse + rotation; orbital nodes moving on configurable tracks; cards mildly face camera; client handles card flip.
- Deliverables: GLB where core and cards are separate named meshes so client can replace card textures.

Google Stitch MCP (technical/export):
- Export: `about.glb` GLB with embedded placeholder front/back textures for cards.
- Mesh & naming:
  - core mesh: `knowledge_core` with animation clips: `core_pulse` (scale) and `core_rotation` (loop).
  - cards: `card_0..card_7` as separate plane meshes.
- Animations:
  - core_pulse (loopable) and core_rotation (loopable).
- Textures: cards should include UVs allowing swapping with client textures.
- Constraints: keep cards low-poly; overall model ≤30k tris.

Notes:
- Provide a small `cards.json` mapping of card mesh names and recommended front/back image sizes.
