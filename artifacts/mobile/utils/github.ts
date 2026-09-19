import { Platform } from 'react-native';
import { GeneratedProject } from './generators';

function apiBase(): string {
  return Platform.OS === 'web' ? '' : `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
}

function defaultRepoName(project: GeneratedProject): string {
  return project.name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'swarm-generated-app';
}

export async function pushProjectToGitHub(project: GeneratedProject) {
  const response = await fetch(`${apiBase()}/api/github/push-project`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      repoName: defaultRepoName(project),
      description: project.description,
      files: project.files.map(({ path, content }) => ({ path, content })),
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok) {
    throw new Error(result.error ?? 'GitHub push failed.');
  }
  return result as { ok: true; pushed: number; repo: string; url: string; branch: string };
}