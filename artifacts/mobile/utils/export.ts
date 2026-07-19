import { Platform } from 'react-native';
import { strToU8, zipSync } from 'fflate';
import { GeneratedProject } from './generators';

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function exportProjectAsZip(project: GeneratedProject): Promise<void> {
  // Pack every generated file into a ZIP (pure JS — no native deps)
  const zipEntries: Record<string, Uint8Array> = {};
  for (const file of project.files) {
    zipEntries[file.path] = strToU8(file.content);
  }
  const zipped = zipSync(zipEntries, { level: 6 });
  const safeName = project.name.replace(/[^a-zA-Z0-9_-]/g, '_');

  if (Platform.OS === 'web') {
    // Web: trigger a browser file download via Blob + anchor
    const blob = new Blob([zipped], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${safeName}.zip`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  } else {
    // Native: write to cache dir then share via system share sheet
    // Dynamic require avoids bundling expo-file-system for web
    const FileSystem = require('expo-file-system');
    const Sharing = require('expo-sharing');

    const zipPath = (FileSystem.cacheDirectory ?? '') + `${safeName}.zip`;
    await FileSystem.writeAsStringAsync(zipPath, uint8ToBase64(zipped), {
      encoding: FileSystem.EncodingType.Base64,
    });

    const available = await Sharing.isAvailableAsync();
    if (available) {
      await Sharing.shareAsync(zipPath, {
        mimeType: 'application/zip',
        dialogTitle: `Export ${project.name}`,
        UTI: 'public.zip-archive',
      });
    } else {
      throw new Error('Sharing is not available on this device.');
    }
  }
}
