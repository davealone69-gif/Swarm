---
name: GitHub-first builds
description: Build and publishing convention for generated Android and Python projects.
---

Generated projects should include their own GitHub Actions workflow. Android projects use a hosted Gradle build to produce a debug APK artifact; Python projects compile and run unit tests on push. Source is pushed through the server-side GitHub connector so mobile clients never handle tokens.

**Why:** The product direction is GitHub-based builds instead of requiring Android Studio, while keeping credentials out of the device app.

**How to apply:** Keep push operations serial and server-side. Treat the generated repository as source-of-truth and expose build results separately from source ZIP export.