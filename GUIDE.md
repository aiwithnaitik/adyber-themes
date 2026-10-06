# Technical Specification & Architecture Guide (GUIDE.md)

This document is the official technical source of truth for the entire Theme Creation and Installer System. It defines the core architecture, data contracts, asset handling pipelines, validation criteria, installer generation mechanics, and Windows operating system integration rules.

---

## 1. Project Overview

### 1.1 What This Project Is
This project is an end-to-end platform for creating, packaging, distributing, and installing personalized Windows desktop themes. The platform bridges the gap between theme designers and Windows personalization by automating asset formatting, theme manifest generation, and executable installer compilation.

### 1.2 What a Theme Is
A **Theme** is a structured, declarative bundle consisting of:
- **Desktop Backgrounds**: High-resolution static wallpapers or dynamic multi-image slideshows.
- **Mouse Cursors**: Animated (`.ani`) or static (`.cur`) custom Windows pointer roles (Normal Select, Link Select, Working/Busy, etc.).
- **System Sound Events**: Audio cues mapped to Windows system hooks (hardware plug-in chime, notifications, critical alerts, navigation clicks, logon, and logoff).
- **Desktop Appearance**: Windows Desktop Window Manager (DWM) accent colors (such as slate Storm `#4F585E`), system-wide Dark Mode/Light Mode flags, and color prevalence rules.
- **Creator Metadata**: Authorship details, attribution links, and custom branding icons.

### 1.3 System 1: The Creator Studio (Web Application)
The **Creator Studio** is a client-facing **Web Application**. It runs in the web browser (or hosted environment) and does **NOT** run as an Electron application. It provides an intuitive, sectioned visual interface where creators design themes, upload media assets, configure timing and color palettes, preview the desktop aesthetic in real time, run automated schema validation, and initiate installer generation.

### 1.4 System 2: The Generated Theme Installer (Electron Desktop Application)
The **Generated Installer** is a standalone, portable Windows executable (`.exe`) compiled using Electron. When an end user downloads and executes this `.exe`, the installer runs locally on their Windows PC, presents a clean confirmation dialog ("Install theme? [Theme Name] by [Creator]"), and upon user consent, calls privileged Windows Win32 APIs and registry keys to install and activate the theme.

### 1.5 System Interaction Pipeline

```text
┌────────────────────────────────────────────────────────┐
│             SYSTEM 1: CREATOR STUDIO (WEB)             │
│  - Web-based theme designer                            │
│  - Next.js + React + TypeScript + Tailwind CSS         │
│  - Asset uploads & preview                             │
│  - Schema validation & draft persistence               │
└───────────────────────────┬────────────────────────────┘
                            │ Initiates "Create Installer"
                            ▼
┌────────────────────────────────────────────────────────┐
│              INSTALLER GENERATION PIPELINE             │
│  - Asset processing & transcoding (Audio -> PCM WAV)   │
│  - Declarative theme manifest compilation (theme.json) │
│  - Electron bundle packaging                           │
│  - Portable .exe binary generation                     │
└───────────────────────────┬────────────────────────────┘
                            │ Produces downloadable binary
                            ▼
┌────────────────────────────────────────────────────────┐
│         SYSTEM 2: GENERATED INSTALLER (ELECTRON)       │
│  - Standalone portable Windows executable (theme.exe)  │
│  - User confirmation dialog                            │
│  - Silent asset extraction to %LOCALAPPDATA%\Themes\   │
│  - Win32 API execution (SystemParametersInfo, DWM)     │
│  - Windows Theme Applied Successfully                  │
└────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

The platform enforces a strict technical boundary between the web-based creation environment and the local Windows installer application.

### 2.1 Creator Studio (Web Application)
- **Next.js (App Router)**: Framework for the web application, handling client-side routing, modular page structure, and server-side API routes for packaging.
- **React (v18+)**: Component-based user interface rendering interactive panels, drag-and-drop dropzones, and real-time state manipulation.
- **TypeScript**: Static type safety across theme models, form controls, validation rules, and IPC/API payloads.
- **Tailwind CSS**: Utility-first responsive styling system providing dark-mode aesthetics, glassmorphism translucent panels, curated color palettes, and polished micro-interactions.

### 2.2 Generated Installer (Windows Application)
- **Electron (v30+)**: Desktop runtime providing native Windows operating system access and process lifecycle management.
- **TypeScript**: Typed main process logic, preload bridge, and service routines.
- **Node.js**: File system operations (`fs`, `path`), child process execution (`child_process.execFile`), and stream extraction.
- **Windows Integration Layer**:
  - `user32.dll` P/Invoke: Calls `SystemParametersInfo` (wallpaper updates `0x0014`, cursor reloads `0x0057`) and `SetSystemCursor` for immediate pointer updates.
  - Windows Registry (`HKCU`): Manages DWM accent colors, Explorer Accent palettes, Personalization dark mode, Desktop Slideshow timing, and `AppEvents` sound schemes.
  - PowerShell Engine: Executes bypass-policy scripts for Win32 API interop and `SendMessageTimeout` broadcasts (`ImmersiveColorSet`, `AppEvents`).
  - Native Wallpaper Helper: Integrates `windows-wallpaper-x86-64.exe` for seamless desktop background deployment.

### 2.3 Additional Tools & Services
- **electron-builder**: Packages the compiled Electron application into a zero-install portable Windows executable (`target: portable`, `x64`).
- **Audio Transcoding Service**: Converts uploaded audio formats (`.mp3`, `.m4a`, `.ogg`) into uncompressed PCM `.wav` format required by Windows `AppEvents`.
  - *Current Status*: Automated transcoding via WinRT `Windows.Media.Transcoding.MediaTranscoder` / PowerShell audio pipeline.
  - *Planned / To Be Decided*: WebAssembly-based FFmpeg (`ffmpeg.wasm`) for client-side browser transcoding prior to package upload.
- **Cloud Packaging Service**: *Planned / To Be Decided* — Cloud runner (Docker / GitHub Actions / Serverless worker) for compiling `.exe` binaries remotely when running Creator Studio on non-Windows web servers.

---

## 3. How a Theme is Created

The theme creation process in Creator Studio follows a linear, non-destructive workflow:

```text
1. Open Creator Studio Dashboard
   └─ Click "Create Theme"
2. Configure General Metadata
   └─ Enter Theme Name, SemVer Version, and Description
3. Select & Upload Wallpaper
   ├─ Mode: Static (1 image) or Slideshow (N images, timing, shuffle)
   └─ Note: Video Wallpaper is marked "Coming Soon"
4. Assign Mouse Cursors
   ├─ Normal Select (Arrow)
   ├─ Link Select (Pointer)
   └─ Busy / Working (Loading)
5. Map Sound Scheme Events
   ├─ Device Connect (Hardware Plug-in chime)
   ├─ Device Disconnect, Notification, Alert/Error, Startup, Shutdown
   └─ Automated audio transcoding pipeline to PCM WAV
6. Design Appearance & Color Palette
   ├─ Select Dark Mode / Light Mode
   ├─ Select Accent Color (e.g. Storm Slate #4F585E)
   └─ Preview 8-shade 32-byte AccentPalette spectrum
7. Input Creator Information
   ├─ Author Name, Website / Portfolio, Contact Email, Notes
   └─ Upload custom installer icon (.png / .ico)
8. Visual Theme Preview
   └─ Simulated Windows desktop displaying wallpaper, window frames, and cursor sandbox
9. Automated Pre-Flight Validation
   └─ Comprehensive rule check across all assets, timing intervals, and metadata
10. Click "Create Installer"
    └─ Package assembly -> Binary build -> Download theme.exe
```

---

## 4. Theme Components

### 4.1 General Metadata
- **Theme Name**: Human-readable name displayed in Windows personalization and the installer prompt (e.g., `Neon Storm`).
- **Version**: Semantic versioning string (e.g., `1.0.0`).
- **Description**: Concise summary of visual style and component customizations.

### 4.2 Wallpaper System
- **Static Mode**:
  - Exactly one wallpaper image.
  - Supported aspect ratios: 16:9, 16:10, 21:9, 32:9.
  - Fit modes: `fill`, `fit`, `stretch`, `tile`, `center`, `span`.
- **Slideshow Mode**:
  - Number of slides: Integer $N \ge 2$.
  - Image sequencing: Each slide has an explicit integer `order` (1, 2, ..., $N$).
  - Duration per slide: Integer `intervalSeconds` $\ge 10$ seconds (default: 60 seconds).
  - Shuffle: Boolean toggle to randomize image rotation.
- **Video Wallpaper**:
  - Status: **Coming Soon / Not Currently Supported**.
  - The UI displays a distinct badge and prevents installer generation if selected.

### 4.3 Cursor System
Windows maps pointers to predefined Win32 `OCR_*` identifiers. The architecture allows modular registration of cursor roles:

| Cursor Role | Win32 Identifier | Registry Entry (`HKCU:\Control Panel\Cursors`) | Purpose |
| :--- | :--- | :--- | :--- |
| `normal` | `OCR_NORMAL` (32512) | `Arrow` | Standard navigation pointer |
| `pointer` | `OCR_HAND` (32649) | `Hand` | Hyperlink and button hover |
| `loading` | `OCR_WAIT` (32514) | `Wait` | Busy / animated progress indicator |
| `textSelect` | `OCR_IBEAM` (32513) | `IBeam` | Text editing cursor |
| *customRole* | *Dynamic* | *Dynamic* | Extensible future roles |

### 4.4 Sound System
Windows sound schemes map system events to registry paths under `HKCU:\AppEvents\Schemes\Apps\.Default\<EventName>\`.

| Event Key | Registry Event Key | Windows Action |
| :--- | :--- | :--- |
| `deviceConnect` | `DeviceConnect` | USB device or hardware plug-in |
| `deviceDisconnect` | `DeviceDisconnect` | USB device removed / disconnected |
| `notification` | `Notification.Default` | Action center toast notification |
| `error` | `.Default` (Critical Stop) | System modal error dialog |
| `click` | `Navigating` | Windows Explorer folder navigation |
| `startup` | `WindowsLogon` | User log-on greeting |
| `shutdown` | `WindowsLogoff` | User log-off farewell |

### 4.5 Appearance & Colors
- **Color Mode**: `"dark"`, `"light"`, or `"system"`. Dark mode configures `AppsUseLightTheme = 0` and `SystemUsesLightTheme = 0`.
- **Accent Color**: 6-character hex code (e.g., `#4F585E` for Storm slate).
  - Calculated into DWM ABGR (`0xFF5E584F`), Colorization ARGB (`0xC44F585E`), and 32-byte `AccentPalette`.
- **Window Color**: Optional secondary border and title bar tint.
- **Color Prevalence**: Boolean indicating whether accent color is active on taskbar, Start menu, and window borders (`ColorPrevalence = 1`).

### 4.6 Creator Information
- **Creator Name**: Required author attribution.
- **Website / Social**: URL for creator portfolio or repository.
- **Support Email**: Optional contact email.
- **Installer Icon**: Custom branding icon (`.png` or `.ico`) applied to the generated installer executable.

---

## 5. Theme Assets

### 5.1 Supported Formats
| Asset Category | Supported Input Formats | Target Format in Package |
| :--- | :--- | :--- |
| **Wallpaper** | `.jpg`, `.jpeg`, `.png`, `.webp`, `.bmp` | `.jpg` / `.png` |
| **Cursors** | `.ani` (animated), `.cur` (static) | `.ani` / `.cur` |
| **Sounds** | `.mp3`, `.wav`, `.m4a`, `.aac`, `.ogg` | **Uncompressed PCM `.wav`** |
| **Installer Icon** | `.png`, `.ico` | `.ico` (Windows) / `.png` |

### 5.2 Asset References & Packaging Rules
- Assets are referenced in `theme.json` using **relative forward-slash paths** (e.g., `wallpaper/1.jpg`, `cursors/normal.ani`, `sounds/device-connect.wav`).
- Host-specific absolute paths (e.g. `C:\Users\...`) must **never** be written to the theme manifest.
- All media assets are stored inside designated subdirectories within the theme package.

---

## 6. Theme Configuration Schema (`theme.json`)

The central theme schema is defined by the following TypeScript interface:

```typescript
export interface ThemeManifest {
  $schema?: string;
  schemaVersion: "1.0.0";

  metadata: {
    id: string;               // Unique slug (e.g. "neon-storm")
    name: string;             // Theme display name
    version: string;          // SemVer (e.g. "1.0.0")
    description: string;      // Summary
    author: {
      name: string;           // Creator name
      url?: string;           // Portfolio / website
      email?: string;         // Support contact
      notes?: string;         // Author notes
    };
    icon?: string;            // Relative path to icon asset
    createdDate: string;      // ISO 8601 timestamp
    tags?: string[];          // Discovery tags
  };

  appearance: {
    colorMode: "dark" | "light" | "system";
    accentColor: string;      // Hex color code (e.g. "#4F585E")
    windowColor?: string;     // Hex color code
    colorPrevalence: boolean; // Accent on taskbar & borders
    additionalColors?: Record<string, string>; // Extensible color tokens
  };

  wallpaper: {
    mode: "static" | "slideshow" | "video";
    static?: {
      assetPath: string;      // Relative path (e.g. "wallpaper/1.jpg")
      fit: "fill" | "fit" | "stretch" | "tile" | "center" | "span";
    };
    slideshow?: {
      slides: Array<{
        order: number;
        assetPath: string;    // Relative path
        name?: string;
      }>;
      intervalSeconds: number;// Duration per slide
      shuffle: boolean;       // Randomize order
    };
    video?: {
      assetPath?: string;
      comingSoon: true;       // Non-deployable flag
    };
  };

  cursors: {
    roles: {
      normal?: string;        // Path to .ani/.cur
      pointer?: string;
      loading?: string;
      textSelect?: string;
      [customRole: string]: string | undefined;
    };
  };

  sounds: {
    events: {
      deviceConnect?: string; // Path to .wav
      deviceDisconnect?: string;
      notification?: string;
      error?: string;
      click?: string;
      startup?: string;
      shutdown?: string;
      [customEvent: string]: string | undefined;
    };
  };

  installer?: {
    productName: string;      // Default: "theme"
    artifactName: string;     // Default: "theme.exe"
    confirmationTitle?: string;
    confirmationMessage?: string;
  };

  custom?: Record<string, unknown>;
}
```

---

## 7. Validation Rules

Before an installer can be generated, the theme manifest and associated assets must pass strict validation checks:

| Section | Rule | Severity | Failure Action |
| :--- | :--- | :--- | :--- |
| **General** | `metadata.name` cannot be empty | Error | Blocks installer creation |
| **General** | `metadata.version` must match SemVer (`X.Y.Z`) | Error | Blocks installer creation |
| **Creator** | `metadata.author.name` cannot be empty | Error | Blocks installer creation |
| **Wallpaper** | `static.assetPath` must point to valid image if mode is `static` | Error | Blocks installer creation |
| **Wallpaper** | `slideshow.slides` must contain $\ge 2$ images if mode is `slideshow` | Error | Blocks installer creation |
| **Wallpaper** | `slideshow.intervalSeconds` must be $\ge 10$ seconds | Error | Blocks installer creation |
| **Wallpaper** | Mode cannot be `video` ("Coming Soon") | Error | Blocks installer creation |
| **Cursors** | Cursor files must have `.ani` or `.cur` extension | Error | Blocks installer creation |
| **Sounds** | Audio files must be PCM `.wav` or convertible audio | Error | Blocks installer creation |
| **Appearance**| `accentColor` must be a valid 6-digit hex code (`#RRGGBB`) | Error | Blocks installer creation |
| **Cursors** | No custom cursors configured | Warning | System default cursors will remain active |
| **Sounds** | No custom sounds configured | Warning | System default sounds will remain active |

---

## 8. Asset Processing Pipeline

1. **Audio Transcoding (MP3/M4A $\rightarrow$ PCM WAV)**:
   - Windows Win32 audio APIs (`PlaySound`, `AppEvents`) fail silently on MP3 files.
   - When an MP3, M4A, or OGG file is uploaded, the processing service converts it into uncompressed 16-bit PCM WAV (44.1 kHz or 48 kHz).
   - The converted `.wav` file is saved into `sounds/` and its path is recorded in `theme.json`.
2. **Image Optimization**:
   - Wallpaper images are verified for valid headers and standard dimensions.
3. **Cursor Format Verification**:
   - Files are checked for standard RIFF/ACON (animated) or CUR headers.

---

## 9. How the Theme Becomes an Installer

The build pipeline packages the theme into a standalone Windows installer:

```text
1. Theme Manifest Generated:
   Creator Studio compiles verified settings into `theme.json`.
2. Asset Assembly:
   Wallpapers, cursors, sounds, and icon are assembled into `assets/theme/`.
3. Electron Scaffold Ingestion:
   The theme package is placed into the Electron build tree under `extraResources/assets/theme/`.
4. Electron-Builder Invocation:
   electron-builder compiles the portable binary target:
   - Output executable: `release/theme.exe`
   - Target architecture: Windows x64 portable
   - Unpacked assets: `asarUnpack: ["assets/**/*", "node_modules/wallpaper/**/*"]`
5. Downloadable Executable:
   The resulting `theme.exe` is delivered to the creator for distribution.
```

---

## 10. Generated Electron Installer Behavior

When the end user executes `theme.exe`:
1. **Lightweight Launch**: The application launches without opening a large browser window or complex setup wizard.
2. **Native Confirmation Dialog**:
   - Title: `Install theme`
   - Message: `Install theme? [Theme Name] by [Creator]`
   - Options: `[Install]` and `[Cancel]`
3. **Execution on Install**:
   - Extracts theme assets to `%LOCALAPPDATA%\Themes\<ThemeId>\`.
   - Calls the theme applier engine to update Windows settings.
   - Plays the hardware plug-in chime synchronously as an audible confirmation.
   - Terminates cleanly without unwanted lingering popups.
4. **Execution on Cancel**:
   - Closes immediately with zero modifications made to user settings.

---

## 11. Windows Application of Theme

### 11.1 Supported Now
- **Desktop Wallpaper**: Applied via `SystemParametersInfo(0x0014, ...)` and `windows-wallpaper-x86-64.exe`.
- **Wallpaper Slideshow**: Configured in registry (`SlideshowSourceDirectoriesSet = 1`, `BackgroundType = 2`, `Interval`, `Shuffle`, `SlideshowDirectoryPath1`).
- **Mouse Cursors**:
  - Live on-screen update: `SetSystemCursor(hCopy, 32512)` (`OCR_NORMAL`).
  - Persistent registry update: `HKCU:\Control Panel\Cursors` (`Arrow`).
  - Reload broadcast: `SystemParametersInfo(0x0057, 0, 0, 3)`.
- **Hardware Insert Sound**: Configured in `HKCU:\AppEvents\Schemes\Apps\.Default\DeviceConnect\.Current` and `.Default`. Synchronous playback via `SoundPlayer.PlaySync()`.
- **System Dark Mode**: Configured in `HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize` (`AppsUseLightTheme = 0`, `SystemUsesLightTheme = 0`).
- **Accent Color (Storm `#4F585E`)**:
  - DWM DWORDs: `AccentColor` (ABGR `0xFF5E584F`), `ColorizationColor` (ARGB `0xC44F585E`), `ColorPrevalence = 1`.
  - Explorer Accent: `AccentColorMenu`, `StartColorMenu`, and 32-byte `AccentPalette`.
  - Broadcast: `SendMessageTimeout(HWND_BROADCAST, WM_SETTINGCHANGE, 0, "ImmersiveColorSet", ...)`.

### 11.2 Planned / Future
- Video wallpaper background hook.
- Additional sound scheme events (Battery low, Device fail, Recycle bin).
- Windows Terminal and VS Code theme synchronization.
- Lock screen image synchronization.

---

## 12. Creator Studio $\rightarrow$ Installer Data Flow

| Stage | Input | Transformation / Output |
| :--- | :--- | :--- |
| **Studio UI** | Form inputs & file pickers | In-memory `ThemeManifest` object & raw File blobs |
| **Validation** | In-memory `ThemeManifest` | `ValidationReport` with errors/warnings |
| **Asset Pipeline** | Audio files (`.mp3`/`.m4a`) | Transcoded PCM `.wav` files |
| **Package Stager** | Manifest + Processed files | Standardized `theme/` bundle directory |
| **Builder Service**| Theme directory + Electron source | Executable binary `release/theme.exe` |
| **End User** | Executed `theme.exe` | Extracted `%LOCALAPPDATA%\Themes\<Id>\` & Windows registry |

---

## 13. Future Extensibility

The platform is designed for scalable feature expansion:
- **Additional Cursors**: Add new keys under `cursors.roles[roleName]`; installer maps recognized roles to Windows registry slots.
- **Additional Sound Events**: Add new keys under `sounds.events[eventName]`; installer maps keys to Windows `AppEvents` subkeys.
- **Video Wallpapers**: Architecture reserves `wallpaper.video` configuration block for borderless DirectShow / CEF video renderers.
- **Community Marketplace & Cloud Sharing**: Modular theme schema is ready for REST API serialization and cloud storage (e.g. S3 / R2).
