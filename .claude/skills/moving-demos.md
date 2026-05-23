# Moving Demos Skill

Move a demo from one section to another, updating all affected files automatically.

## Sections

Valid sections: `basic`, `complex`, `controls`, `intermediate`, `shaders`, `fragment`, `random`

## Section name mappings

| CLI arg      | Router file                    | Views / GIFs folder | Component folder  |
|-------------|-------------------------------|---------------------|-------------------|
| basic        | src/router/basic.js           | Basics/             | basics/           |
| intermediate | src/router/intermediate.js    | Intermediate/       | intermediate/     |
| complex      | src/router/complex.js         | Complex/            | complex/          |
| controls     | src/router/controls.js        | Controls/           | controls/         |
| shaders      | src/router/shaders.js         | Shaders/            | shaders/          |
| fragment     | src/router/fragment.js        | Fragment/           | fragment/         |
| random       | src/router/random.js          | Random/             | random/           |

PascalCase = capitalize first letter only (e.g. `basic` → `Basics`).

## Instructions

The user invokes this as `/moving-demos` with optional args like `/moving-demos BouncingBall basic random`.

### 1. Parse args

Split `$args` on whitespace. Tokens: `<DemoName> <fromSection> <toSection>`.

- If `DemoName` is missing, ask: "What is the demo name? (PascalCase, e.g. BouncingBall)"
- If `fromSection` is missing or invalid, ask: "Which section is it currently in? (basic / complex / controls / intermediate / shaders / fragment / random)"
- If `toSection` is missing or invalid, ask: "Which section should it move to? (basic / complex / controls / intermediate / shaders / fragment / random)"

### 2. Derive names

From `DemoName` and the two section args, compute:

- `FromPascal` — capitalize first letter of `fromSection` (e.g. `basic` → `Basics`)
- `ToPascal` — capitalize first letter of `toSection`
- `demoKebab` — convert `DemoName` from PascalCase to kebab-case by inserting a hyphen before each uppercase letter (after the first) and lowercasing everything (e.g. `BouncingBall` → `bouncing-ball`, `MyGLTFDemo` → `my-g-l-t-f-demo`)

### 3. Validate

Read `src/views/{FromPascal}/{DemoName}View.vue`. If it does not exist, stop and tell the user the file was not found.

### 4. Move the View file

- Read `src/views/{FromPascal}/{DemoName}View.vue`
- Find the import line that contains `@/components/demos/{fromSection}/{demoKebab}` and replace `{fromSection}` with `{toSection}`
- Write the updated content to `src/views/{ToPascal}/{DemoName}View.vue`
- Delete `src/views/{FromPascal}/{DemoName}View.vue` using PowerShell `Remove-Item`

### 5. Move the demo component folder

Run via PowerShell:

```powershell
Move-Item "src/components/demos/{fromSection}/{demoKebab}" "src/components/demos/{toSection}/{demoKebab}"
```

### 6. Update the source router file

- Read `src/router/{fromSection}.js`
- Locate the route object for `{DemoName}` — it starts with `{` and contains `name: '{DemoName}'`
- Extract the entire object (from `{` to the matching `},` or `}` at the end of the array)
- Remove it (and any trailing comma/blank line) from the file
- Write the updated source router file back

### 7. Update the target router file

- Read `src/router/{toSection}.js`
- Insert the extracted route object into the routes array in alphabetical order by `name`
  - Find the correct insertion point by comparing `{DemoName}` lexicographically with existing `name` values
  - Ensure a trailing comma on the inserted object if it is not the last entry, and add a comma to the previous last entry if it becomes non-last
- Write the updated target router file back

### 8. Move the GIF thumbnail

Check whether `public/gifs/{FromPascal}/{DemoName}.gif` exists. If yes:

```powershell
Move-Item "public/gifs/{FromPascal}/{DemoName}.gif" "public/gifs/{ToPascal}/{DemoName}.gif"
```

If not found, note it as a manual step: "No GIF found at `public/gifs/{FromPascal}/{DemoName}.gif` — move it manually if it exists elsewhere."

### 9. Report

List every action taken:
- View moved: `src/views/{FromPascal}/{DemoName}View.vue` → `src/views/{ToPascal}/{DemoName}View.vue`
- Import path updated inside View
- Component folder moved: `src/components/demos/{fromSection}/{demoKebab}/` → `src/components/demos/{toSection}/{demoKebab}/`
- Route entry removed from `src/router/{fromSection}.js` and added to `src/router/{toSection}.js`
- GIF moved (or manual step noted)
