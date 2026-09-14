# New Demo Skill

Scaffold a new demo in the creative-lab project using the `pnpm new-demo` generator.

## Buckets

Demos live in one of 5 alphabet-range folders, derived automatically from the demo's
name — `A-C`, `D-G`, `H-N`, `O-S`, `T-Z`. There is nothing to choose; the generator and
`generateRoute()` both compute the bucket from the first letter of the name.

## Instructions

The user may invoke this as `/new-demo` with an optional arg like `/new-demo MyDemo` or
just `/new-demo`.

1. **Parse args** — `$args` is the demo name.
   - If the demo name is missing, ask the user: "What should the demo be called? (PascalCase, e.g. BouncingBall)"

2. **Run the generator**:

```bash
pnpm new-demo <DemoName>
```

3. **Report what was created** — list the three paths the script printed (View, Demo component, router entry).

4. **Remind the user of the one manual step**:
   - Drop a thumbnail at `public/thumbnails/<Bucket>/<DemoName>.mp4` (e.g. `public/thumbnails/D-G/MyDemo.mp4`).
