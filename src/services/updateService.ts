export interface VersionInfo {
  tag_name: string;
  html_url: string;
}

const CURRENT_VERSION = 'v1.0.0';
const REPO = 'ghostintheprompt/amnesia';

export async function checkForUpdates(): Promise<VersionInfo | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.tag_name !== CURRENT_VERSION) {
      return {
        tag_name: data.tag_name,
        html_url: data.html_url
      };
    }
    return null;
  } catch (error) {
    console.error('Update check failed:', error);
    return null;
  }
}
