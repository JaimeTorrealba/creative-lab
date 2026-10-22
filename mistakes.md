# Mistakes

Running log of errors in my own reasoning or approach, so they don't repeat.

## 2026-10-05 — Shader branch placed in the densest part of the data (UnderwaterHair)

`vertex.glsl` picked a reference axis for the curl basis with
`abs(T.y) > 0.9 ? vec3(1,0,0) : vec3(0,1,0)`. I treated that threshold as a rare edge case. Hair
hangs vertically, so tangents cluster at `|T.y| ≈ 0.9–1.0` — the branch ran straight through the
*most* populated part of the distribution. Measured afterwards: 25.5% of all vertices sat within
0.05 of the threshold and ~2% flipped it every 6 frames, each flip rotating the basis to an
unrelated frame and teleporting that vertex. Per-vertex, so strands sheared apart mid-length.

**Lesson:** before choosing a threshold in a shader, measure where the data actually sits. And
prefer a CPU-baked per-instance frame over any frame derived from a live varying — no continuous
frame field exists on the sphere of directions (hairy-ball), so a tangent-derived basis always
has a seam somewhere. The fix was to bake two orthonormal axes per strand on the CPU.

## 2026-10-05 — "No NaN, lengths stable" is not a test for temporal smoothness

The first headless test checked for NaN, in-range indices and stable strand lengths, and passed
cleanly while the demo was visibly exploding. Those are *spatial* invariants; the bug was
*temporal*. Frame-to-frame jerk, branch-flip counts and the encoded video bitrate all caught it
immediately once measured.

**Lesson:** for anything animated, add a frame-to-frame metric (mean |Δ|, |Δ²|, or the ratio) to
the headless checks. A 40× drop in VP9 file size at identical resolution/duration/bitrate turned
out to be the single clearest signal that per-pixel popping was gone.

## 2026-10-05 — Constraint ordering: soft forces do not belong in the hard-constraint loop

The bend constraint ran inside the 6-iteration solver loop at stiffness 0.14, compounding to
`1-(1-0.14)^6 ≈ 59%` straightening per step. That overwhelmed gravity and froze the hair into a
rigid radial starburst — a dandelion, not hair. Moving it to once per substep, and raising
gravity ~10×, produced actual draping.

**Lesson:** separate hard constraints (length, collision — iterate to convergence) from soft pose
forces (bend — apply once). Also: when a parameter sweep shows the result is insensitive to a
force's magnitude, that force is not the thing in control; find what is.

## 2026-10-05 — Default material `side` silently voided an entire render pass

The opacity-shadow-map pass drew 81,000 triangles per frame into a completely empty target. The
shadow ribbon expands along `cross(T, lightDir)`, so its winding is *consistent* across every
strand; with `ShaderMaterial`'s default `FrontSide` the whole head of hair was back-facing from
the light and every triangle was culled. The camera pass never revealed it because it uses
`DoubleSide`.

**Lesson:** when a pass draws geometry but writes nothing, check `side` and blending before
suspecting the projection. `renderer.info.render.triangles` distinguishes "did not draw" from
"drew and was discarded" in one step, and is the fastest first probe.

## 2026-10-05 — Readback type must match the render target type

Probing a `HalfFloatType` MRT with a `Float32Array` returns silent zeros. I briefly took that as
evidence the pass was broken. (It *was* broken, for an unrelated reason — but the measurement
could not have told me either way.) Half-float targets need a `Uint16Array` plus manual decoding.
Repeated full-target readbacks also wedged the page more than once; crop the read.

## 2026-10-05 — Destructuring parameter names must match the caller's keys

`marschnerLut.js` destructured `{ ior, glintAngle }` while the params object supplies `iorHair`.
`ior` was `undefined`, so the Bravais index was `NaN` and the entire N lookup table baked to NaN —
with no error anywhere, just black. Caught only because the headless check asserted
`.every(Number.isFinite)` on the baked texture.

**Lesson:** assert finiteness on every generated buffer/texture. Silent NaN propagation through a
float texture produces no console error at all.

## 2026-10-19 — Follow-the-leader without velocity correction never settles (UnderwaterHair)

The solver's root-outward, child-only length correction is plain FTL. In Verlet every correction
becomes velocity, so the chain gained energy: with the head *still*, tips were moving at 30–50
units/s three seconds in (hair length 3.6) and never came to rest. That was the "jumping like
crazy". The earlier headless checks only measured short windows and spatial invariants, so a
sim that never reaches equilibrium went unnoticed.

**Lesson:** for any position-based chain, run the probe with zero input for a few seconds and
assert it *settles*. FTL needs the DFTL velocity term (Müller 2012): feed `-s·d_child` back into
the parent's velocity (in Verlet, `prev[parent] += s·d_child`).

## 2026-10-19 — Zeroing velocity after a pre-settle kicked the rest pose

After pre-simulating the hair to rest I called `prev.set(pos)` to "zero the velocity". With DFTL,
`prev` carries a steady-state bias even at rest, so wiping it knocked every strand out of
equilibrium and reintroduced a startup burst (peak 19 u/s vs 0.5 without it).

**Lesson:** when a solver modifies `prev` as part of its constraint handling, `prev` is state,
not just history; don't reset it at a settled equilibrium.

## 2026-10-19 — Guessed a route path instead of reading routesUtils

Opened `/underwater_hair` and got a 404 on camera. `generateRoute` lowercases the name and
splits on `-`, so camelCase names become `/underwaterhair`. Read `src/utils/routesUtils.js`
before navigating.

## 2026-10-22 — Assumed spec-valid WGSL is portable WGSL (RayTracingWeekend)

Two constructs I took as valid per the WGSL spec failed in naga (Deno 1.46's WebGPU):
`random_unit_vector()` returning only from inside an endless `loop {}` (the book's `while (true)`),
and an abstract-int literal passed to a user function's `f32` parameter
(`make_sphere(..., 100)`). Tint may accept both; Firefox/wgpu-based implementations may not.

**Lesson:** add an unreachable trailing `return` after endless loops, and write float literals
(`100.0`) for `f32` function arguments. Validate WGSL headlessly with Deno's `--unstable-webgpu`
before handing it over — it caught both in seconds.

## 2026-10-22 — naga's abstract-int rejection also covers returns and assignments (RayTracingWeekend)

The earlier lesson only mentioned function arguments. Extending the book port, naga also
rejected `return 0;` from an `f32` function (`linear_to_gamma`) and `cam.vfov = 90;` into an
`f32` struct field. Struct constructors with `0` for `f32` members are the same risk.

**Lesson:** in WGSL meant to run beyond Chrome, write every `f32` literal with a decimal point:
returns, assignments, constructor arguments, function arguments.

## 2026-10-22 — Took Deno's `onSubmittedWorkDone` as a real GPU fence

The progressive renderer awaits `queue.onSubmittedWorkDone()` after each pass and previews once a
second. Headless in Deno no preview ever fired: the promise resolves without waiting for the GPU,
so all 500 passes were queued instantly and only the final `mapAsync` waited (59 s).

**Lesson:** in Deno, time GPU work with `mapAsync` on a readback, not `onSubmittedWorkDone`. To
exercise time-based code paths there, fake `performance.now`.

## 2026-10-22 — Guessed book chapter numbers in code comments

Wrote "chapter 9 (Antialiasing)" / "chapter 10" from memory into WGSL comments; the numbering was
unverified. Replaced them with chapter names. Cite what the source actually shows (listing names,
headings), not numbers you have not checked.

## 2026-10-22 — Scripted edits turned `'\n'` inside JS strings into real newlines

Moving the camera code into `utils/rtweekend/camera.js` with a Python heredoc, the replacement
text `.join('\n')` reached the file as `.join('` + newline + `')`, a syntax error, and a second
replacement silently didn't match. Only the Deno import caught it.

**Lesson:** for code containing escape sequences, use the Edit tool rather than scripted
string replacement; when scripting, assert each replacement matched and re-import the module.

## 2026-10-22 — Timed GPU frames by mapping a buffer the frames never touched

First timing of the real-time renderer said 0.7 ms per frame. `mapAsync` on a buffer that no
submitted work uses resolves immediately, so it measured nothing. Copying one pixel of the
rendered texture into the mapped buffer gave the real number (9 ms).

**Lesson:** to fence GPU work, map a buffer that the measured work (or a copy after it) writes.

## 2026-10-22 — `pane.on('change')` also fires for Tweakpane read-only monitors

The real-time ray tracer restarted accumulation on any pane change. The read-only `samples` and
`fps` monitors emit `change` every time they refresh (200 ms), so accumulation restarted five
times a second and never reached `samples_per_pixel`: the image looked like it was always moving.

**Lesson:** in Tweakpane 4, never listen to `change` on a pane or folder that holds `readonly`
bindings for anything with side effects. Listen on the folder or bindings that are inputs only.

## 2026-10-22 — Installed a new package without asking

Asked to "add stat.js", I ran `pnpm add stats.js` straight away. The user didn't want a new
dependency; `@tweakpane/plugin-essentials` (already installed) has an FPS graph.

**Lesson:** never add a dependency without asking first. Before proposing one, check
`package.json` for something already installed that covers the need.
