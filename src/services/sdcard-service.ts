/**
 * SD Card & MicroSD Export Helper for Anycubic Kobra 2
 *
 * Anycubic Kobra 2 firmware (Marlin-based V2/V3) enforces strict media constraints:
 * 1. File system MUST be FAT32 (exFAT or NTFS will fail to mount on printer)
 * 2. Card capacity: 8GB - 32GB recommended
 * 3. File naming: Strict 8.3 convention or short alphanumeric naming (under 16 chars).
 *    Special characters, spaces, accents, and non-ASCII characters will either hide the file
 *    from the printer menu or cause "File corrupt" halts.
 * 4. Files must be placed in the ROOT directory (the Kobra 2 cannot navigate nested folders).
 */

export interface SDCardExportOptions {
  suggestedName: string;
  gcode: string;
}

export interface SDCardValidationResult {
  valid: boolean;
  sanitizedName: string;
  warnings: string[];
}

export function sanitizeKobra2Filename(rawName: string): string {
  // Strip path and extension
  let base = rawName.replace(/^.*[\\\/]/, '').replace(/\.[^/.]+$/, '');
  
  // Replace spaces, dashes and non-alphanumeric with underscores
  base = base.replace(/[^a-zA-Z0-9]/g, '_');
  
  // Collapse multiple underscores
  base = base.replace(/_+/g, '_').replace(/^_|_$/g, '');

  // Truncate to maximum 16 characters for reliable Kobra 2 LCD screen display
  if (base.length > 16) {
    base = base.slice(0, 16);
  }

  // Fallback if empty
  if (!base) {
    base = 'model';
  }

  return `${base}.gcode`;
}

export function validateSDCardFilename(filename: string): SDCardValidationResult {
  const warnings: string[] = [];
  const sanitized = sanitizeKobra2Filename(filename);

  if (filename.length > 20) {
    warnings.push('Long filename detected: Anycubic Kobra 2 LCD screen truncates names longer than 16 chars.');
  }
  if (/[^a-zA-Z0-9._-]/.test(filename)) {
    warnings.push('Non-standard characters/spaces detected: The Kobra 2 mainboard may fail to display this file.');
  }

  return {
    valid: warnings.length === 0,
    sanitizedName: sanitized,
    warnings
  };
}

/**
 * Saves G-code directly using the browser's File System Access API
 * allowing user to select their SD card drive letter directly, with automatic fallback to download.
 */
export async function exportToSDCard(gcode: string, rawFilename: string): Promise<{ success: boolean; filename: string; method: 'picker' | 'download' }> {
  const sanitized = sanitizeKobra2Filename(rawFilename);

  // Try modern File System Access API (Chromium / Edge / Chrome)
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: sanitized,
        types: [{
          description: 'Anycubic Kobra 2 G-Code File (.gcode)',
          accept: {
            'text/plain': ['.gcode']
          }
        }]
      });

      const writable = await handle.createWritable();
      await writable.write(gcode);
      await writable.close();
      return { success: true, filename: sanitized, method: 'picker' };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw err; // user cancelled
      }
      console.warn('showSaveFilePicker failed or unsupported, using standard download fallback:', err);
    }
  }

  // Standard Blob Download Fallback
  const blob = new Blob([gcode], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = sanitized;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return { success: true, filename: sanitized, method: 'download' };
}
