export type RepairLanguage = 'kotlin' | 'xml' | 'gradle' | 'toml' | 'markdown' | 'python' | 'yaml' | 'text';

export interface RepairableFile {
  path: string;
  content: string;
  language: RepairLanguage;
}

export interface RepairReport {
  repairs: string[];
  lessons: string[];
}

function hasFile(files: RepairableFile[], path: string): boolean {
  return files.some((file) => file.path === path);
}

/**
 * Offline fixer for structural mistakes that commonly make generated Android
 * projects fail during the first Gradle sync. It never sends source code away.
 */
export function selfRepairFiles(input: RepairableFile[], previousLessons: string[] = []) {
  const files = input.map((file) => ({ ...file }));
  const repairs: string[] = [];
  const lessons: string[] = [...previousLessons];

  const settings = files.find((file) => file.path === 'settings.gradle.kts');
  if (settings && !settings.content.includes('import org.gradle.api.initialization.resolve.RepositoriesMode')) {
    settings.content = `import org.gradle.api.initialization.resolve.RepositoriesMode

${settings.content}`;
    repairs.push('Added the missing RepositoriesMode import to settings.gradle.kts.');
    lessons.push('Gradle settings using FAIL_ON_PROJECT_REPOS require the RepositoriesMode import.');
  }

  const manifest = files.find((file) => file.path === 'app/src/main/AndroidManifest.xml');
  const themeMatch = manifest?.content.match(/android:theme="@style\/(Theme\.[A-Za-z0-9_]+)"/);
  if (themeMatch && !hasFile(files, 'app/src/main/res/values/themes.xml')) {
    files.push({
      path: 'app/src/main/res/values/themes.xml',
      language: 'xml',
      content: `<resources>
    <style name="${themeMatch[1]}" parent="android:style/Theme.Material.Light.NoActionBar" />
</resources>
`,
    });
    repairs.push('Generated the Android theme resource referenced by the manifest.');
    lessons.push('Manifest theme references must have a matching values/themes.xml resource.');
  }

  const appBuild = files.find((file) => file.path === 'app/build.gradle.kts');
  if (appBuild?.content.includes('proguard-rules.pro') && !hasFile(files, 'app/proguard-rules.pro')) {
    files.push({
      path: 'app/proguard-rules.pro',
      language: 'gradle',
      content: '# Generated project rules. Add release-specific rules here when needed.\n',
    });
    repairs.push('Added the missing release ProGuard rules file.');
    lessons.push('Release buildTypes must ship the proguard-rules.pro file they reference.');
  }

  if ((settings || appBuild) && !hasFile(files, 'gradle.properties')) {
    files.push({
      path: 'gradle.properties',
      language: 'gradle',
      content: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
kotlin.code.style=official
android.nonTransitiveRClass=true
`,
    });
    repairs.push('Added AndroidX and Gradle defaults.');
    lessons.push('Generated Android projects should include a small, explicit gradle.properties file.');
  }

  return {
    files,
    report: {
      repairs,
      lessons: Array.from(new Set(lessons)).slice(-20),
    },
  };
}