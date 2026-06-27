# New Demo Skill

Scaffold a new demo in the creative-lab project using the `pnpm new-demo` generator.

## Sections

Valid sections: `basic`, `complex`, `controls`, `intermediate`, `shaders`, `fragment`, `random`

## Instructions

The user may invoke this as `/new-demo` with optional args like `/new-demo intermediate MyDemo` or just `/new-demo`.

1. **Parse args** — split `$args` on whitespace. First token is section, second is demo name.
   - If section is missing or invalid, ask the user: "Which section? (basic / complex / controls / intermediate / shaders / fragment / random)"
   - If demo name is missing, ask the user: "What should the demo be called? (PascalCase, e.g. BouncingBall)"

2. **Run the generator**:

```bash
pnpm new-demo <section> <DemoName>
```

3. **Report what was created** — list the three paths the script printed (View, component, router entry).

4. **Remind the user of the two manual steps**:
   - Open the router file (`src/router/<section>.js`) and fill in the `description` field (and optionally `basedOn`) for the new entry.
   - Drop a GIF thumbnail at `public/gifs/<Section>/<Name>.gif`.
