// Canonical pSEO build entry point.
// Keep this friendly alias so both commands stay reproducible:
//   node pseo/build.mjs
//   node pseo/generate.mjs
await import("./build.mjs");
