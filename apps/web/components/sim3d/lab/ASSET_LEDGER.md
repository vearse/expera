# Chemistry laboratory visual assets

All realism work is **procedural** (canvas-generated at runtime or primitive meshes). Extra download: **0 bytes**. No runtime network requests.

| Asset | Source | Runtime size | Notes |
| --- | --- | --- | --- |
| Floor vinyl tiles (albedo, roughness, normal) | Generated in `labTextures.ts` | 512² or 1024² GPU | Grout, scuffs, tile variation |
| Wall plaster | Generated | 512² / 1024² | Noise + stains |
| Wood grain (shelves) | Generated | 512² / 1024² | Grain + worn edges |
| Epoxy bench top | Generated | 512² / 1024² | Rings + scratches |
| White laminate | Generated | 512² / 1024² | Cabinet bodies |
| Paper fibre | Generated | ≤512² | Posters / notes |
| Notice board | Canvas 2048×1144 | GPU only | 2× readable type, mipmaps |
| Periodic table poster | Canvas 1792×1280 | GPU only | Real group colours, symbols |
| Safety / measurement / biology posters | Canvas 1408×1152 | GPU only | |
| Environment probe | Runtime PMREM of a tiny lab box | ~128–256 GPU | No HDR fetch |
| Apparatus / furniture | Three.js primitives + LatheGeometry | Bundled JS | No GLB, no Draco |
| Ms. Ada | Unchanged existing meshes | — | Do not modify |
