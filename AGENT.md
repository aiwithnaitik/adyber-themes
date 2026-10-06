# AI Agent Implementation Guide (AGENT.md)

This document is the mandatory operational and architectural guide for any AI coding assistant or software engineer working on this repository.

---

## 1. Read GUIDE.md First

Before writing, refactoring, or designing any code in this repository, you **MUST** read [GUIDE.md](file:///c:/Users/Rox/Desktop/installer/GUIDE.md).

- `GUIDE.md` is the single source of technical truth for:
  - Theme data structures and schema definitions.
  - Asset folder organization and naming conventions.
  - Windows registry mappings and Win32 API contracts.
  - Validation rules and installer generation flow.
- Never invent an alternate theme schema or separate folder structure that diverges from `GUIDE.md`.

---

## 2. Creator Studio Responsibility

The **Creator Studio** is a **Web Application**.
- **Technology**: Built using **Next.js**, **React**, **TypeScript**, and **Tailwind CSS**.
- **Core Responsibilities**:
  - Visually creating and editing theme configurations.
  - Managing file uploads (wallpapers, cursors, sounds, icons).
  - Providing client-side live theme previews.
  - Executing pre-flight schema validation.
  - Preparing theme packages for the installer build service.
  - Triggering installer compilation.
- **Critical Boundary**:
  - The Creator Studio does **NOT** run as an Electron application.
  - The Creator Studio does **NOT** execute privileged Windows Win32 operations or modify the host PC's registry.

---

## 3. Installer Responsibility

The **Generated Theme Installer** is a **Windows Desktop Application** built with **Electron**.
- **Technology**: Built using **Electron**, **TypeScript**, and **Node.js**.
- **Core Responsibilities**:
  - Executing on an end user's Windows computer as a standalone `.exe`.
  - Reading the bundled theme manifest (`theme.json`) and accompanying assets.
  - Displaying a lightweight native confirmation dialog ("Install theme? [Theme] by [Creator]").
  - Extracting assets to `%LOCALAPPDATA%\Themes\<ThemeId>\`.
  - Invoking privileged Win32 APIs (`SystemParametersInfo`, `SetSystemCursor`, `SendMessageTimeout`).
  - Applying wallpaper, slideshows, cursors, sound hooks, dark mode, and Storm accent color.

---

## 4. Do Not Mix the Two Systems

An AI agent must **NEVER** confuse or merge these two systems:
- Do **NOT** turn the Creator Studio into an Electron app simply because the final installer uses Electron.
- Do **NOT** import Electron native APIs (`ipcRenderer`, `remote`, `dialog`) inside Creator Studio web components.
- Do **NOT** run PowerShell scripts or registry modifications from the web browser.
- Maintain the strict separation:

```text
WEB CREATOR STUDIO (Next.js)
        ↓ (Packages manifest & media assets)
GENERATED ELECTRON INSTALLER (Electron .exe)
        ↓ (Applies theme to end user's PC)
WINDOWS OPERATING SYSTEM
```

---

## 5. Theme Schema Centralization

- All theme attributes (wallpaper, slideshow, cursors, sounds, appearance, metadata) must strictly conform to the unified TypeScript contract defined in `GUIDE.md`.
- Theme state must never be trapped in isolated UI component states.
- Use centralized, typed state management (e.g. React hooks / Context) mapping directly to the `ThemeManifest` schema.

---

## 6. Asset Handling Guidelines

- **Relative Asset Paths**: Never write host-specific absolute file paths (`C:\Users\...`) into the theme manifest. All asset references must use relative forward-slash paths (e.g. `wallpaper/1.jpg`, `cursors/normal.ani`).
- **Sound Transcoding**: Windows event sounds require uncompressed PCM `.wav` format. Any uploaded MP3, M4A, or OGG file must be transcoded to `.wav` before final installer assembly.
- **Cursor Validation**: Ensure cursors have `.ani` (animated) or `.cur` (static) extensions and valid headers.
- **No Path Duplication**: Keep asset path resolution inside dedicated asset-processing utilities.

---

## 7. Installer Generation Modularity

The "Create Installer" pipeline must remain clean and modular:

```text
1. Validate Theme
        ↓ (Checks schema integrity and asset existence)
2. Process Assets
        ↓ (Transcodes audio to WAV, optimizes images)
3. Assemble Package
        ↓ (Writes theme.json and media into bundle folder)
4. Invoke Build Engine
        ↓ (Runs electron-builder targeting portable .exe)
5. Return Artifact
        ↓ (Yields downloadable theme.exe)
```

If the remote Electron compiler backend is not active in the current development environment, create a clear, typed service boundary (`themeBuildService`) with appropriate status callbacks. **Never fabricate fake downloadable binaries.**

---

## 8. Security & Sandboxing Rules

- **Browser Sandboxing**: The Creator Studio web app must operate within standard browser security sandbox constraints.
- **Privileged Boundaries**: All privileged operations (file system writes outside sandbox, Windows registry edits, Win32 P/Invoke) belong strictly in the Electron installer runtime.
- **No Client Secrets**: Never embed signing certificates, server credentials, or host tokens into client-side web bundles.

---

## 9. Implementation Principles for AI Agents

1. **Inspect Before Changing**: Always examine the existing files, types, and configurations before modifying or replacing them.
2. **No Fake Functionality**: Never create non-functional buttons or fake progress bars that pretend to perform actions they do not.
3. **Strong Typing**: Use strict TypeScript throughout. Avoid `any` types; define explicit interfaces for manifests, events, and validation results.
4. **Component Modularity**: Keep UI components focused and organized by panel (General, Wallpaper, Cursors, Sounds, Appearance, Creator, Preview, Validation, Build).
5. **Separate Services from UI**: Keep business logic (validation, formatting, color conversion) in `/services` or `/utils`, not embedded in React JSX rendering logic.

---

## 10. Feature Status Classifications

Maintain clear distinction across feature capabilities:

- **SUPPORTED**:
  - Static wallpapers & multi-slide slideshows.
  - Normal, pointer, and loading cursors (`.ani`, `.cur`).
  - Hardware insert sound (`DeviceConnect`), notification, and alert events.
  - System Dark Mode and slate Storm accent color (`#4F585E`).
  - Native confirmation dialog installer.
- **COMING SOON**:
  - **Video Wallpaper**: Must display a "Coming Soon" badge in the UI and block installer compilation if selected.
- **PLANNED**:
  - WebAssembly audio transcoding (`ffmpeg.wasm`) directly in the browser.
  - Cloud-based remote installer build service.
  - Additional cursor roles and sound scheme events.

---

## 11. How to Add a New Theme Feature

When adding support for a new theme feature (e.g. Lock Screen background or Terminal themes):

```text
1. Update GUIDE.md
   └─ Define technical architecture, manifest fields, and OS registry keys.
2. Update Theme Schema
   └─ Add typed fields to ThemeManifest in types/theme.ts.
3. Update Creator Studio UI
   └─ Add configuration controls and input dropzones in the appropriate panel.
4. Update Validation Engine
   └─ Add validation rules in services/validator.ts.
5. Update Asset Pipeline
   └─ Ensure new file formats are validated and processed.
6. Update Electron Installer
   └─ Add Win32 application logic in the installer's theme applier service.
7. Test End-to-End
   └─ Verify that the created theme builds and installs cleanly on Windows.
```

---

## 12. Documentation Synchronization

Whenever you modify any part of the theme schema, UI panel structure, or installer application logic:
1. Update `GUIDE.md` to reflect the technical changes.
2. Update `AGENT.md` if development instructions or boundaries change.
3. Keep schema comments, TypeScript types, and documentation aligned at all times.
