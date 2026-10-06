import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { execFile } from 'child_process'
import { promisify } from 'util'
import JSZip from 'jszip'
import { ThemeManifest } from '@/types/theme'

const execFileAsync = promisify(execFile)

// Windows Cursor Registry keys mapping
const CURSOR_REGISTRY_MAP: Record<string, string> = {
  Arrow: 'Arrow',
  Help: 'Help',
  AppStarting: 'AppStarting',
  Wait: 'Wait',
  Crosshair: 'Crosshair',
  IBeam: 'IBeam',
  NWPen: 'NWPen',
  No: 'No',
  SizeNS: 'SizeNS',
  SizeWE: 'SizeWE',
  SizeNWSE: 'SizeNWSE',
  SizeNESW: 'SizeNESW',
  SizeAll: 'SizeAll',
  UpArrow: 'UpArrow',
  Hand: 'Hand',
  Pin: 'Pin',
  Person: 'Person',
}

// Windows Sound AppEvents keys mapping
const SOUND_REGISTRY_MAP: Record<string, string> = {
  deviceConnect: 'DeviceConnect',
  deviceDisconnect: 'DeviceDisconnect',
  deviceFail: 'DeviceFail',
  notification: 'Notification.Default',
  notificationIM: 'Notification.IM',
  notificationMail: 'Notification.Mail',
  notificationReminder: 'Notification.Reminder',
  error: '.Default',
  click: 'Navigating',
  startup: 'WindowsLogon',
  shutdown: 'WindowsLogoff',
  systemAsterisk: 'SystemAsterisk',
  systemExclamation: 'SystemExclamation',
  lowBattery: 'LowBatteryAlarm',
  criticalBattery: 'CriticalBatteryAlarm',
  emptyRecycleBin: 'EmptyRecycleBin',
}

export async function POST(req: Request) {
  const logs: string[] = []
  const tempDir = path.join(os.tmpdir(), `theme-build-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`)

  try {
    const theme: ThemeManifest = await req.json()
    logs.push('[1/5] Received theme manifest: "' + (theme.metadata.name || 'Untitled') + '"')

    if (!theme.metadata.name) {
      return NextResponse.json({ success: false, error: 'Theme name is required.', logs }, { status: 400 })
    }

    const themeId = theme.metadata.id || theme.metadata.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-') || 'theme'
    const artifactName = theme.installer?.artifactName || 'theme.exe'
    const productName = theme.installer?.productName || 'theme'
    const confirmationTitle = theme.installer?.confirmationTitle || 'Install theme'
    const confirmationMessage = theme.installer?.confirmationMessage || 'Install theme?'

    fs.mkdirSync(tempDir, { recursive: true })
    const assetsDir = path.join(tempDir, 'package')
    fs.mkdirSync(assetsDir, { recursive: true })
    fs.mkdirSync(path.join(assetsDir, 'wallpaper'), { recursive: true })
    fs.mkdirSync(path.join(assetsDir, 'cursors'), { recursive: true })
    fs.mkdirSync(path.join(assetsDir, 'sounds'), { recursive: true })
    fs.mkdirSync(path.join(assetsDir, 'metadata'), { recursive: true })

    logs.push('[2/5] Extracting media assets and decoding base64 payloads...')

    const relativeManifest: any = JSON.parse(JSON.stringify(theme))

    // 1. Wallpaper
    let primaryWallpaperRelPath = ''
    if (theme.wallpaper.mode === 'static' && theme.wallpaper.static?.assetPath) {
      const dataUrl = theme.wallpaper.static.assetPath
      const ext = dataUrl.includes('image/png') ? 'png' : dataUrl.includes('image/webp') ? 'webp' : 'jpg'
      const fileName = `wallpaper.${ext}`
      const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '')
      fs.writeFileSync(path.join(assetsDir, 'wallpaper', fileName), Buffer.from(base64Data, 'base64'))
      relativeManifest.wallpaper.static.assetPath = `wallpaper/${fileName}`
      primaryWallpaperRelPath = `wallpaper/${fileName}`
    } else if (theme.wallpaper.mode === 'slideshow' && theme.wallpaper.slideshow?.slides) {
      theme.wallpaper.slideshow.slides.forEach((slide, idx) => {
        if (slide.assetPath && slide.assetPath.startsWith('data:')) {
          const ext = slide.assetPath.includes('image/png') ? 'png' : 'jpg'
          const fileName = `slide_${slide.order || idx + 1}.${ext}`
          const base64Data = slide.assetPath.replace(/^data:image\/\w+;base64,/, '')
          fs.writeFileSync(path.join(assetsDir, 'wallpaper', fileName), Buffer.from(base64Data, 'base64'))
          relativeManifest.wallpaper.slideshow.slides[idx].assetPath = `wallpaper/${fileName}`
          if (!primaryWallpaperRelPath) primaryWallpaperRelPath = `wallpaper/${fileName}`
        }
      })
    }

    // 2. Cursors
    const activeCursors: Record<string, string> = {}
    if (theme.cursors.roles) {
      for (const [roleId, dataUrl] of Object.entries(theme.cursors.roles)) {
        if (dataUrl && dataUrl.startsWith('data:')) {
          const fileMeta = theme.cursors.files?.[roleId]
          const isAni = fileMeta?.isAni || fileMeta?.fileName?.toLowerCase().endsWith('.ani')
          const ext = isAni ? 'ani' : 'cur'
          const fileName = `${roleId}.${ext}`
          const base64Data = dataUrl.replace(/^data:[^;]+;base64,/, '')
          fs.writeFileSync(path.join(assetsDir, 'cursors', fileName), Buffer.from(base64Data, 'base64'))
          relativeManifest.cursors.roles[roleId] = `cursors/${fileName}`
          activeCursors[roleId] = `cursors/${fileName}`
        }
      }
    }

    // 3. Sounds
    const activeSounds: Record<string, string> = {}
    if (theme.sounds.events) {
      for (const [eventId, dataUrl] of Object.entries(theme.sounds.events)) {
        if (dataUrl && dataUrl.startsWith('data:')) {
          const fileName = `${eventId}.wav`
          const base64Data = dataUrl.replace(/^data:[^;]+;base64,/, '')
          fs.writeFileSync(path.join(assetsDir, 'sounds', fileName), Buffer.from(base64Data, 'base64'))
          relativeManifest.sounds.events[eventId] = `sounds/${fileName}`
          activeSounds[eventId] = `sounds/${fileName}`
        }
      }
    }

    // 4. Icon
    let iconFileName = ''
    if (theme.metadata.icon && theme.metadata.icon.startsWith('data:')) {
      const isIco = theme.metadata.icon.includes('x-icon') || theme.metadata.icon.includes('.ico')
      iconFileName = isIco ? 'icon.ico' : 'icon.png'
      const base64Data = theme.metadata.icon.replace(/^data:[^;]+;base64,/, '')
      fs.writeFileSync(path.join(assetsDir, 'metadata', iconFileName), Buffer.from(base64Data, 'base64'))
      relativeManifest.metadata.icon = `metadata/${iconFileName}`
    }

    // Save cleaned theme.json
    fs.writeFileSync(path.join(assetsDir, 'theme.json'), JSON.stringify(relativeManifest, null, 2), 'utf8')

    // 5. Create Standalone PowerShell installation script for batch runner
    const psScript = generatePowerShellInstallerScript(theme, themeId, primaryWallpaperRelPath, activeCursors, activeSounds)
    fs.writeFileSync(path.join(assetsDir, 'install.ps1'), psScript, 'utf8')

    const cmdScript = `@echo off\r\ntitle ${theme.metadata.name} Installer\r\ncd /d "%~dp0"\r\npowershell.exe -ExecutionPolicy Bypass -NoProfile -File "install.ps1"\r\n`
    fs.writeFileSync(path.join(assetsDir, 'Install-Theme.cmd'), cmdScript, 'utf8')

    logs.push('[3/5] Bundling theme assets into payload zip...')

    // Create theme.zip using JSZip
    const zip = new JSZip()
    const addDirToZip = (dirPath: string, zipFolder: JSZip) => {
      const items = fs.readdirSync(dirPath)
      for (const item of items) {
        const fullPath = path.join(dirPath, item)
        const stat = fs.statSync(fullPath)
        if (stat.isDirectory()) {
          addDirToZip(fullPath, zipFolder.folder(item)!)
        } else {
          zipFolder.file(item, fs.readFileSync(fullPath))
        }
      }
    }
    addDirToZip(assetsDir, zip)
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
    const zipPath = path.join(tempDir, 'theme.zip')
    fs.writeFileSync(zipPath, zipBuffer)

    logs.push('[4/5] Generating standalone native Windows executable source code...')

    // Generate C# Win32 installer application
    const csharpCode = generateCSharpInstallerSource(theme, themeId, confirmationTitle, confirmationMessage, primaryWallpaperRelPath, activeCursors, activeSounds)
    const csPath = path.join(tempDir, 'Installer.cs')
    fs.writeFileSync(csPath, csharpCode, 'utf8')

    const cscPath = 'C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe'
    let exeBuffer: Buffer | null = null

    if (fs.existsSync(cscPath)) {
      logs.push('[5/5] Compiling native Windows executable via csc.exe...')
      const exeOutPath = path.join(tempDir, artifactName)
      const args = [
        '/r:System.IO.Compression.FileSystem.dll',
        '/target:winexe',
        '/platform:x64',
        '/optimize+',
        `/resource:${zipPath},theme.zip`,
        `/out:${exeOutPath}`,
        csPath,
      ]

      if (iconFileName && iconFileName.endsWith('.ico')) {
        const iconPath = path.join(assetsDir, 'metadata', iconFileName)
        if (fs.existsSync(iconPath)) {
          args.unshift(`/win32icon:${iconPath}`)
        }
      }

      try {
        await execFileAsync(cscPath, args)
        if (fs.existsSync(exeOutPath)) {
          exeBuffer = fs.readFileSync(exeOutPath)
          logs.push(`[SUCCESS] Portable Windows binary "${artifactName}" compiled successfully (${(exeBuffer.length / 1024).toFixed(1)} KB)!`)
        }
      } catch (compileErr: any) {
        logs.push(`[WARN] Native compilation fallback: ${compileErr?.message || 'csc error'}`)
      }
    }

    // Clean up temporary directory asynchronously
    setTimeout(() => {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true })
      } catch {
        // ignore cleanup error
      }
    }, 5000)

    return NextResponse.json({
      success: true,
      artifactName,
      hasExe: Boolean(exeBuffer),
      exeBase64: exeBuffer ? exeBuffer.toString('base64') : null,
      zipBase64: zipBuffer.toString('base64'),
      logs,
    })
  } catch (err: any) {
    logs.push(`[ERROR] Build pipeline error: ${err?.message || 'Unknown error'}`)
    return NextResponse.json({ success: false, error: err?.message, logs }, { status: 500 })
  }
}

function generateCSharpInstallerSource(
  theme: ThemeManifest,
  themeId: string,
  confirmationTitle: string,
  confirmationMessage: string,
  primaryWallpaperRel: string,
  cursors: Record<string, string>,
  sounds: Record<string, string>
): string {
  const accentHex = theme.appearance.accentColor || '#4F585E'
  const cleanHex = accentHex.replace('#', '')
  const r = parseInt(cleanHex.slice(0, 2), 16) || 79
  const g = parseInt(cleanHex.slice(2, 4), 16) || 88
  const b = parseInt(cleanHex.slice(4, 6), 16) || 94

  const accentAbgr = (0xff << 24) | (b << 16) | (g << 8) | r
  const colorizationArgb = (0xc4 << 24) | (r << 16) | (g << 8) | b
  const isDark = theme.appearance.colorMode !== 'light' ? 0 : 1

  const cursorStatements = Object.entries(cursors)
    .map(([role, relPath]) => {
      const regKey = CURSOR_REGISTRY_MAP[role] || role
      return `Registry.SetValue(@"HKEY_CURRENT_USER\\Control Panel\\Cursors", "${regKey}", Path.Combine(installDir, @"${relPath.replace(/\//g, '\\')}"));`
    })
    .join('\n            ')

  const soundStatements = Object.entries(sounds)
    .map(([eventKey, relPath]) => {
      const regKey = SOUND_REGISTRY_MAP[eventKey] || eventKey
      return `Registry.SetValue(@"HKEY_CURRENT_USER\\AppEvents\\Schemes\\Apps\\.Default\\${regKey}\\.Current", "", Path.Combine(installDir, @"${relPath.replace(/\//g, '\\')}"));`
    })
    .join('\n            ')

  const playDeviceConnectSound = sounds.deviceConnect
    ? `string chSound = Path.Combine(installDir, @"${sounds.deviceConnect.replace(/\//g, '\\')}");
            if (File.Exists(chSound)) {
                try { using (var sp = new SoundPlayer(chSound)) { sp.PlaySync(); } } catch {}
            }`
    : ''

  return `
using System;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Windows.Forms;
using System.Runtime.InteropServices;
using Microsoft.Win32;
using System.Media;

class ThemeInstaller {
    [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
    static extern bool SystemParametersInfo(int uiAction, int uiParam, string pvParam, int fWinIni);

    [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
    static extern IntPtr SendMessageTimeout(IntPtr hWnd, uint Msg, IntPtr wParam, string lParam, uint fuFlags, uint uTimeout, out IntPtr lpdwResult);

    const int SPI_SETDESKWALLPAPER = 0x0014;
    const int SPI_SETCURSORS = 0x0057;
    const int SPIF_UPDATEINIFILE = 0x01;
    const int SPIF_SENDCHANGE = 0x02;
    const uint WM_SETTINGCHANGE = 0x001A;

    [STAThread]
    static void Main() {
        try {
            string themeName = "${theme.metadata.name.replace(/"/g, '\\"')}";
            string creator = "${(theme.metadata.author?.name || 'Creator').replace(/"/g, '\\"')}";

            DialogResult res = MessageBox.Show(
                "${confirmationMessage.replace(/"/g, '\\"')}\\n\\n" + themeName + " by " + creator,
                "${confirmationTitle.replace(/"/g, '\\"')}",
                MessageBoxButtons.OKCancel,
                MessageBoxIcon.Question
            );

            if (res != DialogResult.OK) return;

            string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            string installDir = Path.Combine(localAppData, "Themes", "${themeId}");
            Directory.CreateDirectory(installDir);

            // Extract embedded theme payload zip
            var asm = Assembly.GetExecutingAssembly();
            using (var stream = asm.GetManifestResourceStream("theme.zip")) {
                if (stream != null) {
                    string tempZip = Path.Combine(Path.GetTempPath(), "theme_" + Guid.NewGuid() + ".zip");
                    using (var fs = File.Create(tempZip)) {
                        stream.CopyTo(fs);
                    }
                    ZipFile.ExtractToDirectory(tempZip, installDir);
                    try { File.Delete(tempZip); } catch {}
                }
            }

            // 1. Apply Desktop Wallpaper & Slideshow
            string wallpaperPath = Path.Combine(installDir, @"${primaryWallpaperRel.replace(/\//g, '\\')}");
            bool isSlideshow = ${theme.wallpaper.mode === 'slideshow' ? 'true' : 'false'};
            int slideshowIntervalMs = ${(theme.wallpaper.slideshow?.intervalSeconds || 60) * 1000};
            int slideshowShuffle = ${(theme.wallpaper.slideshow?.shuffle ?? true) ? 1 : 0};

            if (isSlideshow) {
                try {
                    string wpFolder = Path.Combine(installDir, "wallpaper");
                    Registry.SetValue(@"HKEY_CURRENT_USER\Control Panel\Personalization\Desktop Slideshow", "Interval", slideshowIntervalMs, RegistryValueKind.DWord);
                    Registry.SetValue(@"HKEY_CURRENT_USER\Control Panel\Personalization\Desktop Slideshow", "Shuffle", slideshowShuffle, RegistryValueKind.DWord);
                    Registry.SetValue(@"HKEY_CURRENT_USER\Control Panel\Personalization\Desktop Slideshow", "ImagesRootPath", wpFolder);

                    string userThemesDir = Path.Combine(localAppData, "Microsoft", "Windows", "Themes");
                    Directory.CreateDirectory(userThemesDir);
                    string themeFile = "[Theme]\r\nDisplayName=" + themeName + "\r\n[Control Panel\\Desktop]\r\nWallpaper=" + wallpaperPath + "\r\nWallpaperStyle=10\r\nTileWallpaper=0\r\n[Slideshow]\r\nInterval=" + slideshowIntervalMs + "\r\nShuffle=" + slideshowShuffle + "\r\nImagesRootPath=" + wpFolder + "\r\n";
                    File.WriteAllText(Path.Combine(userThemesDir, "${themeId}.theme"), themeFile);
                    File.WriteAllText(Path.Combine(installDir, "${themeId}.theme"), themeFile);
                } catch {}
            }

            if (File.Exists(wallpaperPath)) {
                Registry.SetValue(@"HKEY_CURRENT_USER\Control Panel\Desktop", "Wallpaper", wallpaperPath);
                Registry.SetValue(@"HKEY_CURRENT_USER\Control Panel\Desktop", "WallpaperStyle", "10"); // Fill
                Registry.SetValue(@"HKEY_CURRENT_USER\Control Panel\Desktop", "TileWallpaper", "0");
                SystemParametersInfo(SPI_SETDESKWALLPAPER, 0, wallpaperPath, SPIF_UPDATEINIFILE | SPIF_SENDCHANGE);
            }

            // 2. Apply Accent Colors (DWM & Personalize)
            Registry.SetValue(@"HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\DWM", "AccentColor", ${accentAbgr}, RegistryValueKind.DWord);
            Registry.SetValue(@"HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\DWM", "ColorizationColor", ${colorizationArgb}, RegistryValueKind.DWord);
            Registry.SetValue(@"HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\DWM", "ColorPrevalence", 1, RegistryValueKind.DWord);

            Registry.SetValue(@"HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize", "ColorPrevalence", 1, RegistryValueKind.DWord);
            Registry.SetValue(@"HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize", "AppsUseLightTheme", ${isDark}, RegistryValueKind.DWord);
            Registry.SetValue(@"HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize", "SystemUsesLightTheme", ${isDark}, RegistryValueKind.DWord);

            // 3. Apply Cursors
            ${cursorStatements}
            SystemParametersInfo(SPI_SETCURSORS, 0, null, SPIF_UPDATEINIFILE | SPIF_SENDCHANGE);

            // 4. Apply Sound Scheme
            ${soundStatements}

            // 5. Broadcast ImmersiveColorSet so Explorer refreshes without restart
            IntPtr resultPtr;
            SendMessageTimeout((IntPtr)0xffff, WM_SETTINGCHANGE, IntPtr.Zero, "ImmersiveColorSet", 2, 500, out resultPtr);
            SendMessageTimeout((IntPtr)0xffff, WM_SETTINGCHANGE, IntPtr.Zero, "TraySettings", 2, 500, out resultPtr);

            // 6. Play Confirmation Chime
            ${playDeviceConnectSound}

        } catch (Exception ex) {
            MessageBox.Show("Theme installation encounter an error: " + ex.Message, "Theme Installer", MessageBoxButtons.OK, MessageBoxIcon.Warning);
        }
    }
}
`
}

function generatePowerShellInstallerScript(
  theme: ThemeManifest,
  themeId: string,
  primaryWallpaperRel: string,
  cursors: Record<string, string>,
  sounds: Record<string, string>
): string {
  const accentHex = theme.appearance.accentColor || '#4F585E'
  const isDark = theme.appearance.colorMode !== 'light' ? 0 : 1

  return `# Standalone Windows Theme Installer Script
param()

$ThemeName = "${theme.metadata.name}"
$Creator = "${theme.metadata.author?.name || 'Creator'}"

$res = [System.Windows.Forms.MessageBox]::Show("Install theme?\`n\`n$ThemeName by $Creator", "Install theme", [System.Windows.Forms.MessageBoxButtons]::OKCancel, [System.Windows.Forms.MessageBoxIcon]::Question)
if ($res -ne [System.Windows.Forms.DialogResult]::OK) { exit }

$TargetDir = "$env:LOCALAPPDATA\\Themes\\${themeId}"
New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null
Copy-Item -Path "$PSScriptRoot\\*" -Destination $TargetDir -Recurse -Force

# Wallpaper & Slideshow
$WallpaperPath = "$TargetDir\\${primaryWallpaperRel.replace(/\//g, '\\')}"
$IsSlideshow = ${theme.wallpaper.mode === 'slideshow' ? '$true' : '$false'}
$IntervalMs = ${(theme.wallpaper.slideshow?.intervalSeconds || 60) * 1000}
$Shuffle = ${(theme.wallpaper.slideshow?.shuffle ?? true) ? 1 : 0}

if ($IsSlideshow) {
    $wpFolder = "$TargetDir\wallpaper"
    Set-ItemProperty -Path 'HKCU:\Control Panel\Personalization\Desktop Slideshow' -Name Interval -Value $IntervalMs -ErrorAction SilentlyContinue
    Set-ItemProperty -Path 'HKCU:\Control Panel\Personalization\Desktop Slideshow' -Name Shuffle -Value $Shuffle -ErrorAction SilentlyContinue
    Set-ItemProperty -Path 'HKCU:\Control Panel\Personalization\Desktop Slideshow' -Name ImagesRootPath -Value $wpFolder -ErrorAction SilentlyContinue

    $userThemesDir = "$env:LOCALAPPDATA\Microsoft\Windows\Themes"
    New-Item -ItemType Directory -Force -Path $userThemesDir | Out-Null
    $themeContent = @"
[Theme]
DisplayName=$ThemeName
[Control Panel\Desktop]
Wallpaper=$WallpaperPath
WallpaperStyle=10
TileWallpaper=0
[Slideshow]
Interval=$IntervalMs
Shuffle=$Shuffle
ImagesRootPath=$wpFolder
"@
    Set-Content -Path "$userThemesDir\${themeId}.theme" -Value $themeContent -Force
    Set-Content -Path "$TargetDir\${themeId}.theme" -Value $themeContent -Force
}

if (Test-Path $WallpaperPath) {
    Set-ItemProperty -Path 'HKCU:\Control Panel\Desktop' -Name Wallpaper -Value $WallpaperPath
    Set-ItemProperty -Path 'HKCU:\Control Panel\Desktop' -Name WallpaperStyle -Value '10'
    Set-ItemProperty -Path 'HKCU:\Control Panel\Desktop' -Name TileWallpaper -Value '0'
    
    Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class WinAPI {
    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
}
"@ -ErrorAction SilentlyContinue
    [WinAPI]::SystemParametersInfo(0x0014, 0, $WallpaperPath, 0x01 -bor 0x02) | Out-Null
}

# Accent & Dark Mode
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize' -Name AppsUseLightTheme -Value ${isDark}
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize' -Name SystemUsesLightTheme -Value ${isDark}
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize' -Name ColorPrevalence -Value 1

# Sound confirmation
${sounds.deviceConnect ? `
$soundFile = "$TargetDir\\${sounds.deviceConnect.replace(/\//g, '\\')}"
if (Test-Path $soundFile) {
    $player = New-Object System.Media.SoundPlayer $soundFile
    $player.PlaySync()
}
` : ''}

Write-Host "Theme $ThemeName installed successfully."
`
}
