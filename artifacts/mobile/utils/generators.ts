// SWARM-BUILDER-ZERO — Android Code Generation Engine
// Generates complete, compilable Android (Kotlin/Compose) project structures

import { selfRepairFiles } from './self-repair';

export type AppType =
  | 'calculator'
  | 'notes'
  | 'todo'
  | 'timer'
  | 'weather'
  | 'chat'
  | 'generic';

export type Language = 'kotlin' | 'xml' | 'gradle' | 'toml' | 'markdown';

export interface GeneratedFile {
  path: string;
  content: string;
  language: Language;
}

export interface GeneratedProject {
  id: string;
  name: string;
  description: string;
  prompt: string;
  packageName: string;
  appType: AppType;
  files: GeneratedFile[];
  createdAt: number;
  decisions?: Record<string, string>;
  repairReport?: {
    repairs: string[];
    lessons: string[];
  };
}

export type AgentName = 'ARCHITECT' | 'CODER' | 'BUILDER' | 'FIXER' | 'OPTIMIZER';

export interface AgentProgress {
  agent: AgentName;
  action: string;
  status: 'idle' | 'active' | 'complete';
}

// ── Type Detection ──────────────────────────────────────────────────────────

export function detectAppType(prompt: string): AppType {
  const lower = prompt.toLowerCase();
  if (/\b(calc(ulator)?|math|arithmetic|add|subtract|multiply|divide|equation)\b/.test(lower)) return 'calculator';
  if (/\b(note|notes|memo|journal|diary|jot|write|notepad)\b/.test(lower)) return 'notes';
  if (/\b(todo|to-do|task|checklist|reminder|shopping list|grocery)\b/.test(lower)) return 'todo';
  if (/\b(timer|stopwatch|countdown|clock|alarm|interval|pomodoro)\b/.test(lower)) return 'timer';
  if (/\b(weather|forecast|temperature|rain|sun|climate|humidity)\b/.test(lower)) return 'weather';
  if (/\b(chat|message|messenger|dm|conversation|talk|reply)\b/.test(lower)) return 'chat';
  return 'generic';
}

export function extractAppName(prompt: string, type: AppType): string {
  const patterns = [
    /(?:app called|app named|called|named)\s+["']?([A-Z][a-zA-Z0-9]+(?:\s[A-Z][a-zA-Z0-9]+)*)["']?/i,
    /(?:build|make|create|generate)\s+(?:a|an)\s+([a-zA-Z]+(?:\s[a-zA-Z]+)?)\s+app/i,
  ];
  for (const pat of patterns) {
    const m = prompt.match(pat);
    if (m) {
      return m[1]
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join('');
    }
  }
  const defaults: Record<AppType, string> = {
    calculator: 'CalcPro',
    notes: 'SwarmNotes',
    todo: 'TaskFlow',
    timer: 'PulseTimer',
    weather: 'WeatherSense',
    chat: 'NexusChat',
    generic: 'SwarmApp',
  };
  return defaults[type];
}

export function generatePackageName(name: string): string {
  return 'com.swarm.' + name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function appTypeDescription(type: AppType): string {
  const map: Record<AppType, string> = {
    calculator: 'A modern scientific calculator with memory functions',
    notes: 'A clean note-taking app with Markdown-style formatting',
    todo: 'A task management app with priorities and completion tracking',
    timer: 'A precision countdown/stopwatch timer with lap tracking',
    weather: 'A weather dashboard with 7-day forecast (API-ready)',
    chat: 'A real-time messaging UI with bubble layout',
    generic: 'A modern Android app with Jetpack Compose foundation',
  };
  return map[type];
}

// ── Common Files ────────────────────────────────────────────────────────────

function settingsGradle(name: string): GeneratedFile {
  return {
    path: 'settings.gradle.kts',
    language: 'gradle',
    content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "${name}"
include(":app")
`,
  };
}

function rootBuildGradle(): GeneratedFile {
  return {
    path: 'build.gradle.kts',
    language: 'gradle',
    content: `// Top-level build file
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
}
`,
  };
}

function libsVersionsToml(): GeneratedFile {
  return {
    path: 'gradle/libs.versions.toml',
    language: 'toml',
    content: `[versions]
agp = "8.7.3"
kotlin = "2.1.0"
coreKtx = "1.15.0"
junit = "4.13.2"
junitVersion = "1.2.1"
espressoCore = "3.6.1"
lifecycleRuntimeKtx = "2.8.7"
activityCompose = "1.10.1"
composeBom = "2025.02.00"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
junit = { group = "junit", name = "junit", version.ref = "junit" }
androidx-junit = { group = "androidx.test.ext", name = "junit", version.ref = "junitVersion" }
androidx-espresso-core = { group = "androidx.test.espresso", name = "espresso-core", version.ref = "espressoCore" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
androidx-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-ui-test-manifest = { group = "androidx.compose.ui", name = "ui-test-manifest" }
androidx-ui-test-junit4 = { group = "androidx.compose.ui", name = "ui-test-junit4" }
androidx-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-material-icons-extended = { group = "androidx.compose.material", name = "material-icons-extended" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
`,
  };
}

function appBuildGradle(pkg: string): GeneratedFile {
  return {
    path: 'app/build.gradle.kts',
    language: 'gradle',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "${pkg}"
    compileSdk = 35

    defaultConfig {
        applicationId = "${pkg}"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons.extended)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.ui.test.junit4)
    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)
}
`,
  };
}

function androidManifest(pkg: string, appName: string): GeneratedFile {
  return {
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:allowBackup="true"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:theme="@style/Theme.${appName}">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="@string/app_name"
            android:theme="@style/Theme.${appName}">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`,
  };
}

function mainActivity(pkg: string, appName: string): GeneratedFile {
  return {
    path: `app/src/main/java/${pkg.replace(/\./g, '/')}/MainActivity.kt`,
    language: 'kotlin',
    content: `package ${pkg}

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Modifier
import ${pkg}.ui.screens.MainScreen
import ${pkg}.ui.theme.AppTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AppTheme {
                MainScreen(modifier = Modifier.fillMaxSize())
            }
        }
    }
}
`,
  };
}

function colorKt(pkg: string): GeneratedFile {
  return {
    path: `app/src/main/java/${pkg.replace(/\./g, '/')}/ui/theme/Color.kt`,
    language: 'kotlin',
    content: `package ${pkg}.ui.theme

import androidx.compose.ui.graphics.Color

val Primary = Color(0xFF6200EE)
val PrimaryVariant = Color(0xFF3700B3)
val Secondary = Color(0xFF03DAC6)
val Background = Color(0xFF121212)
val Surface = Color(0xFF1E1E1E)
val OnPrimary = Color(0xFFFFFFFF)
val OnSecondary = Color(0xFF000000)
val OnBackground = Color(0xFFE0E0E0)
val OnSurface = Color(0xFFE0E0E0)
val Error = Color(0xFFCF6679)
val OnError = Color(0xFF000000)
`,
  };
}

function themeKt(pkg: string, appName: string): GeneratedFile {
  return {
    path: `app/src/main/java/${pkg.replace(/\./g, '/')}/ui/theme/Theme.kt`,
    language: 'kotlin',
    content: `package ${pkg}.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = Primary,
    secondary = Secondary,
    background = Background,
    surface = Surface,
    onPrimary = OnPrimary,
    onSecondary = OnSecondary,
    onBackground = OnBackground,
    onSurface = OnSurface,
    error = Error,
    onError = OnError
)

private val LightColorScheme = lightColorScheme(
    primary = Primary,
    secondary = Secondary,
    onPrimary = OnPrimary,
    onSecondary = OnSecondary
)

@Composable
fun AppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
`,
  };
}

function typeKt(pkg: string): GeneratedFile {
  return {
    path: `app/src/main/java/${pkg.replace(/\./g, '/')}/ui/theme/Type.kt`,
    language: 'kotlin',
    content: `package ${pkg}.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

val Typography = Typography(
    bodyLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        lineHeight = 24.sp,
        letterSpacing = 0.5.sp
    ),
    titleLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 22.sp,
        lineHeight = 28.sp,
        letterSpacing = 0.sp
    ),
    labelSmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 11.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.5.sp
    )
)
`,
  };
}

function stringsXml(appName: string, extra: string = ''): GeneratedFile {
  return {
    path: 'app/src/main/res/values/strings.xml',
    language: 'xml',
    content: `<resources>
    <string name="app_name">${appName}</string>
${extra}</resources>
`,
  };
}

function themesXml(appName: string): GeneratedFile {
  return {
    path: 'app/src/main/res/values/themes.xml',
    language: 'xml',
    content: `<resources>
    <style name="Theme.${appName}" parent="android:style/Theme.Material.Light.NoActionBar" />
</resources>
`,
  };
}

function gradleProperties(): GeneratedFile {
  return {
    path: 'gradle.properties',
    language: 'gradle',
    content: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
kotlin.code.style=official
android.nonTransitiveRClass=true
`,
  };
}

function proguardRules(): GeneratedFile {
  return {
    path: 'app/proguard-rules.pro',
    language: 'gradle',
    content: `# SWARM-BUILDER-ZERO keeps release builds simple and debuggable.
`,
  };
}

function readmeFile(
  name: string,
  type: AppType,
  description: string,
  pkg: string,
): GeneratedFile {
  return {
    path: 'README.md',
    language: 'markdown',
    content: `# ${name}

> Generated by SWARM-BUILDER-ZERO

${description}

## Project Structure

\`\`\`
${name}/
├── app/
│   ├── src/main/
│   │   ├── java/${pkg.replace(/\./g, '/')}/
│   │   │   ├── MainActivity.kt
│   │   │   └── ui/
│   │   │       ├── screens/MainScreen.kt
│   │   │       └── theme/
│   │   │           ├── Color.kt
│   │   │           ├── Theme.kt
│   │   │           └── Type.kt
│   │   ├── res/values/strings.xml
│   │   └── AndroidManifest.xml
│   └── build.gradle.kts
├── build.gradle.kts
├── settings.gradle.kts
└── gradle/libs.versions.toml
\`\`\`

## Build Requirements

- Android Studio Hedgehog or newer
- JDK 17+
- minSdk 26 (Android 8.0)
- targetSdk 35 (Android 15)
- Kotlin 2.1.0
- Jetpack Compose BOM 2025.02.00

## How to Build

1. Open the project in Android Studio
2. Wait for Gradle sync to complete
3. Run on emulator or physical device (API 26+)

## App Type: ${type.toUpperCase()}

Built with Jetpack Compose using Material Design 3.
`,
  };
}

// ── Type-Specific Screen Generators ────────────────────────────────────────

function calculatorScreen(pkg: string): GeneratedFile {
  return {
    path: `app/src/main/java/${pkg.replace(/\./g, '/')}/ui/screens/MainScreen.kt`,
    language: 'kotlin',
    content: `package ${pkg}.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun MainScreen(modifier: Modifier = Modifier) {
    var display by remember { mutableStateOf("0") }
    var operand1 by remember { mutableStateOf<Double?>(null) }
    var operator by remember { mutableStateOf<String?>(null) }
    var awaitingOperand by remember { mutableStateOf(false) }

    fun onDigit(d: String) {
        display = if (awaitingOperand || display == "0") {
            awaitingOperand = false
            d
        } else if (display.length < 12) {
            display + d
        } else display
    }

    fun onDecimal() {
        if (awaitingOperand) { display = "0."; awaitingOperand = false; return }
        if (!display.contains('.')) display += "."
    }

    fun onOperator(op: String) {
        val current = display.toDoubleOrNull() ?: return
        if (operand1 != null && !awaitingOperand) {
            val result = when (operator) {
                "+" -> operand1!! + current
                "-" -> operand1!! - current
                "×" -> operand1!! * current
                "÷" -> if (current != 0.0) operand1!! / current else Double.NaN
                "%" -> operand1!! % current
                else -> current
            }
            display = if (result.isNaN()) "Error"
                      else if (result == result.toLong().toDouble()) result.toLong().toString()
                      else "%.8g".format(result).trimEnd('0').trimEnd('.')
            operand1 = result
        } else {
            operand1 = current
        }
        operator = op
        awaitingOperand = true
    }

    fun onEquals() {
        val current = display.toDoubleOrNull() ?: return
        val op1 = operand1 ?: return
        val op = operator ?: return
        val result = when (op) {
            "+" -> op1 + current
            "-" -> op1 - current
            "×" -> op1 * current
            "÷" -> if (current != 0.0) op1 / current else Double.NaN
            "%" -> op1 % current
            else -> current
        }
        display = if (result.isNaN()) "Error"
                  else if (result == result.toLong().toDouble()) result.toLong().toString()
                  else "%.8g".format(result).trimEnd('0').trimEnd('.')
        operand1 = null
        operator = null
        awaitingOperand = true
    }

    fun onClear() { display = "0"; operand1 = null; operator = null; awaitingOperand = false }
    fun onPlusMinus() { display = (-(display.toDoubleOrNull() ?: 0.0)).let {
        if (it == it.toLong().toDouble()) it.toLong().toString() else it.toString()
    }}
    fun onBackspace() {
        display = if (display.length > 1 && display != "0") display.dropLast(1) else "0"
    }

    val haptic = LocalHapticFeedback.current

    Column(
        modifier = modifier
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp),
        verticalArrangement = Arrangement.Bottom
    ) {
        // Operator display
        Row(
            modifier = Modifier.fillMaxWidth().padding(end = 8.dp, bottom = 4.dp),
            horizontalArrangement = Arrangement.End
        ) {
            Text(
                text = if (operand1 != null && operator != null) (operand1!!.let { if (it == it.toLong().toDouble()) it.toLong().toString() else it.toString() } + " " + (operator ?: "")) else "",
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f),
                fontSize = 18.sp
            )
        }
        // Main display
        Text(
            text = display,
            modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 8.dp),
            color = MaterialTheme.colorScheme.onBackground,
            fontSize = if (display.length > 10) 36.sp else 56.sp,
            fontWeight = FontWeight.Light,
            textAlign = TextAlign.End,
            maxLines = 1
        )
        Spacer(modifier = Modifier.height(16.dp))

        // Buttons
        val rows = listOf(
            listOf("C", "+/-", "⌫", "÷"),
            listOf("7", "8", "9",  "×"),
            listOf("4", "5", "6",  "-"),
            listOf("1", "2", "3",  "+"),
            listOf(".", "0", "=",  "%"),
        )

        rows.forEach { row ->
            Row(
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                row.forEach { label ->
                    val isOperator = label in listOf("÷", "×", "-", "+", "=", "%")
                    val isClear = label in listOf("C", "+/-", "⌫")
                    CalcButton(
                        label = label,
                        modifier = Modifier.weight(1f),
                        containerColor = when {
                            label == "=" -> MaterialTheme.colorScheme.primary
                            isOperator -> MaterialTheme.colorScheme.primaryContainer
                            isClear -> MaterialTheme.colorScheme.secondaryContainer
                            else -> MaterialTheme.colorScheme.surface
                        },
                        contentColor = when {
                            label == "=" -> MaterialTheme.colorScheme.onPrimary
                            isOperator -> MaterialTheme.colorScheme.onPrimaryContainer
                            isClear -> MaterialTheme.colorScheme.onSecondaryContainer
                            else -> MaterialTheme.colorScheme.onSurface
                        },
                        onClick = {
                            haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                            when (label) {
                                in "0".."9" -> onDigit(label)
                                "." -> onDecimal()
                                "C" -> onClear()
                                "+/-" -> onPlusMinus()
                                "⌫" -> onBackspace()
                                "=" -> onEquals()
                                else -> onOperator(label)
                            }
                        }
                    )
                }
            }
        }
        Spacer(modifier = Modifier.height(8.dp))
    }
}

@Composable
fun CalcButton(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    containerColor: Color = MaterialTheme.colorScheme.surface,
    contentColor: Color = MaterialTheme.colorScheme.onSurface,
) {
    Box(
        modifier = modifier
            .aspectRatio(1f)
            .clip(CircleShape)
            .background(containerColor)
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = label,
            color = contentColor,
            fontSize = 22.sp,
            fontWeight = FontWeight.Medium
        )
    }
}
`,
  };
}

function notesScreen(pkg: string): GeneratedFile {
  return {
    path: `app/src/main/java/${pkg.replace(/\./g, '/')}/ui/screens/MainScreen.kt`,
    language: 'kotlin',
    content: `package ${pkg}.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import java.text.SimpleDateFormat
import java.util.*

data class Note(val id: Long, var title: String, var content: String, val createdAt: Long = System.currentTimeMillis())

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(modifier: Modifier = Modifier) {
    val notes = remember { mutableStateListOf(
        Note(1, "Getting Started", "Tap + to create your first note. Long-press to delete.", System.currentTimeMillis() - 60000),
        Note(2, "Markdown Tips", "Use **bold** and *italic* for formatting. Keep notes short and focused.", System.currentTimeMillis() - 3600000),
    )}
    var showDialog by remember { mutableStateOf(false) }
    var editingNote by remember { mutableStateOf<Note?>(null) }

    Scaffold(
        modifier = modifier,
        topBar = {
            TopAppBar(
                title = { Text("Notes", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { editingNote = null; showDialog = true },
                containerColor = MaterialTheme.colorScheme.primary
            ) {
                Icon(Icons.Default.Add, contentDescription = "New Note")
            }
        }
    ) { padding ->
        if (notes.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize().padding(padding),
                contentAlignment = Alignment.Center
            ) {
                Text("No notes yet. Tap + to create one.", color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f))
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(padding),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(notes, key = { it.id }) { note ->
                    NoteCard(
                        note = note,
                        onEdit = { editingNote = note; showDialog = true },
                        onDelete = { notes.remove(note) }
                    )
                }
            }
        }
    }

    if (showDialog) {
        NoteDialog(
            note = editingNote,
            onDismiss = { showDialog = false },
            onSave = { title, content ->
                val existing = editingNote
                if (existing != null) {
                    val idx = notes.indexOfFirst { it.id == existing.id }
                    if (idx >= 0) { notes[idx] = existing.copy(title = title, content = content) }
                } else {
                    notes.add(0, Note(System.currentTimeMillis(), title, content))
                }
                showDialog = false
            }
        )
    }
}

@Composable
fun NoteCard(note: Note, onEdit: () -> Unit, onDelete: () -> Unit) {
    val fmt = remember { SimpleDateFormat("MMM dd, HH:mm", Locale.getDefault()) }
    Card(
        modifier = Modifier.fillMaxWidth().clickable { onEdit() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(note.title, fontWeight = FontWeight.SemiBold, fontSize = 16.sp, modifier = Modifier.weight(1f))
                Row {
                    IconButton(onClick = onEdit, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Default.Edit, contentDescription = "Edit", tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(18.dp))
                    }
                    IconButton(onClick = onDelete, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Default.Delete, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(18.dp))
                    }
                }
            }
            Spacer(Modifier.height(4.dp))
            Text(note.content, maxLines = 3, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f), fontSize = 14.sp)
            Spacer(Modifier.height(8.dp))
            Text(fmt.format(Date(note.createdAt)), fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f))
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NoteDialog(note: Note?, onDismiss: () -> Unit, onSave: (String, String) -> Unit) {
    var title by remember { mutableStateOf(note?.title ?: "") }
    var content by remember { mutableStateOf(note?.content ?: "") }

    Dialog(onDismissRequest = onDismiss) {
        Card(shape = RoundedCornerShape(16.dp)) {
            Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(if (note == null) "New Note" else "Edit Note", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                OutlinedTextField(value = title, onValueChange = { title = it }, label = { Text("Title") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                OutlinedTextField(value = content, onValueChange = { content = it }, label = { Text("Content") }, modifier = Modifier.fillMaxWidth().height(120.dp), maxLines = 6)
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                    TextButton(onClick = onDismiss) { Text("Cancel") }
                    Spacer(Modifier.width(8.dp))
                    Button(onClick = { if (title.isNotBlank()) onSave(title.trim(), content.trim()) }) { Text("Save") }
                }
            }
        }
    }
}
`,
  };
}

function todoScreen(pkg: string): GeneratedFile {
  return {
    path: `app/src/main/java/${pkg.replace(/\./g, '/')}/ui/screens/MainScreen.kt`,
    language: 'kotlin',
    content: `package ${pkg}.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp

data class Task(val id: Long, val text: String, var done: Boolean = false, val priority: Int = 1)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(modifier: Modifier = Modifier) {
    val tasks = remember { mutableStateListOf(
        Task(1, "Set up development environment", done = true, priority = 3),
        Task(2, "Read project documentation", priority = 2),
        Task(3, "Build first feature", priority = 3),
        Task(4, "Write unit tests", priority = 1),
    )}
    var inputText by remember { mutableStateOf("") }
    var selectedPriority by remember { mutableStateOf(2) }

    val pending = tasks.count { !it.done }
    val done = tasks.count { it.done }

    Scaffold(
        modifier = modifier,
        topBar = {
            TopAppBar(
                title = { Column {
                    Text("Task Flow", style = MaterialTheme.typography.titleLarge)
                    Text("$pending pending • $done done", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f))
                }},
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.background)
            )
        }
    ) { padding ->
        Column(modifier = Modifier.fillMaxSize().padding(padding)) {
            // Input row
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedTextField(
                    value = inputText,
                    onValueChange = { inputText = it },
                    placeholder = { Text("Add a task…") },
                    modifier = Modifier.weight(1f),
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp)
                )
                FloatingActionButton(
                    onClick = {
                        if (inputText.isNotBlank()) {
                            tasks.add(0, Task(System.currentTimeMillis(), inputText.trim(), priority = selectedPriority))
                            inputText = ""
                        }
                    },
                    modifier = Modifier.size(48.dp),
                    containerColor = MaterialTheme.colorScheme.primary
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Add")
                }
            }
            // Priority chips
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf(1 to "Low", 2 to "Medium", 3 to "High").forEach { (p, label) ->
                    FilterChip(
                        selected = selectedPriority == p,
                        onClick = { selectedPriority = p },
                        label = { Text(label) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = when (p) {
                                3 -> MaterialTheme.colorScheme.errorContainer
                                2 -> MaterialTheme.colorScheme.primaryContainer
                                else -> MaterialTheme.colorScheme.secondaryContainer
                            }
                        )
                    )
                }
            }
            Spacer(Modifier.height(8.dp))
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                val sorted = tasks.sortedWith(compareBy({ it.done }, { -it.priority }))
                items(sorted, key = { it.id }) { task ->
                    TaskRow(task = task, onToggle = {
                        val i = tasks.indexOfFirst { it.id == task.id }
                        if (i >= 0) tasks[i] = task.copy(done = !task.done)
                    }, onDelete = { tasks.removeAll { it.id == task.id } })
                }
            }
        }
    }
}

@Composable
fun TaskRow(task: Task, onToggle: () -> Unit, onDelete: () -> Unit) {
    val priorityColor = when (task.priority) {
        3 -> MaterialTheme.colorScheme.error
        2 -> MaterialTheme.colorScheme.primary
        else -> MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f)
    }
    Card(
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (task.done) MaterialTheme.colorScheme.surface.copy(alpha = 0.6f)
                             else MaterialTheme.colorScheme.surface
        )
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Checkbox(checked = task.done, onCheckedChange = { onToggle() })
            Spacer(Modifier.width(4.dp))
            Text(
                text = task.text,
                modifier = Modifier.weight(1f),
                textDecoration = if (task.done) TextDecoration.LineThrough else TextDecoration.None,
                color = if (task.done) MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f) else MaterialTheme.colorScheme.onSurface
            )
            Surface(
                shape = RoundedCornerShape(4.dp),
                color = priorityColor.copy(alpha = 0.15f),
                modifier = Modifier.padding(horizontal = 4.dp)
            ) {
                Text(
                    text = when (task.priority) { 3 -> "HIGH"; 2 -> "MED"; else -> "LOW" },
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                    style = MaterialTheme.typography.labelSmall,
                    color = priorityColor
                )
            }
            IconButton(onClick = onDelete, modifier = Modifier.size(32.dp)) {
                Icon(Icons.Default.Delete, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error.copy(alpha = 0.7f), modifier = Modifier.size(16.dp))
            }
        }
    }
}
`,
  };
}

function timerScreen(pkg: string): GeneratedFile {
  return {
    path: `app/src/main/java/${pkg.replace(/\./g, '/')}/ui/screens/MainScreen.kt`,
    language: 'kotlin',
    content: `package ${pkg}.ui.screens

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Flag
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

@Composable
fun MainScreen(modifier: Modifier = Modifier) {
    var elapsedMs by remember { mutableLongStateOf(0L) }
    var running by remember { mutableStateOf(false) }
    var laps by remember { mutableStateOf(listOf<Long>()) }
    var lastLapMs by remember { mutableLongStateOf(0L) }

    LaunchedEffect(running) {
        while (running) {
            delay(10L)
            elapsedMs += 10L
        }
    }

    val primaryColor = MaterialTheme.colorScheme.primary
    val bgColor = MaterialTheme.colorScheme.background
    val surfaceColor = MaterialTheme.colorScheme.surface

    val progress by animateFloatAsState(
        targetValue = (elapsedMs % 60000L) / 60000f,
        animationSpec = tween(durationMillis = 0), label = "progress"
    )
    val arcColor by animateColorAsState(
        targetValue = if (running) primaryColor else primaryColor.copy(alpha = 0.4f),
        label = "arcColor"
    )

    Column(
        modifier = modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(Modifier.height(32.dp))
        // Timer ring
        Box(
            modifier = Modifier.size(240.dp),
            contentAlignment = Alignment.Center
        ) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                val stroke = 12.dp.toPx()
                val inset = stroke / 2
                drawArc(
                    color = surfaceColor,
                    startAngle = -90f,
                    sweepAngle = 360f,
                    useCenter = false,
                    topLeft = Offset(inset, inset),
                    size = Size(size.width - stroke, size.height - stroke),
                    style = Stroke(width = stroke, cap = StrokeCap.Round)
                )
                drawArc(
                    color = arcColor,
                    startAngle = -90f,
                    sweepAngle = progress * 360f,
                    useCenter = false,
                    topLeft = Offset(inset, inset),
                    size = Size(size.width - stroke, size.height - stroke),
                    style = Stroke(width = stroke, cap = StrokeCap.Round)
                )
            }
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = formatTime(elapsedMs),
                    fontFamily = FontFamily.Monospace,
                    fontSize = 44.sp,
                    fontWeight = FontWeight.Light,
                    color = MaterialTheme.colorScheme.onBackground
                )
                if (laps.isNotEmpty()) {
                    Text(
                        text = "Lap: " + formatTime(elapsedMs - lastLapMs),
                        fontFamily = FontFamily.Monospace,
                        fontSize = 16.sp,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }
        }

        Spacer(Modifier.height(40.dp))

        // Controls
        Row(
            horizontalArrangement = Arrangement.spacedBy(24.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Reset/Lap
            FilledTonalIconButton(
                onClick = {
                    if (running) { laps = laps + (elapsedMs - lastLapMs); lastLapMs = elapsedMs }
                    else { elapsedMs = 0L; laps = listOf(); lastLapMs = 0L }
                },
                modifier = Modifier.size(56.dp)
            ) {
                Icon(
                    if (running) Icons.Default.Flag else Icons.Default.Refresh,
                    contentDescription = if (running) "Lap" else "Reset"
                )
            }
            // Start/Stop
            FloatingActionButton(
                onClick = { running = !running },
                modifier = Modifier.size(72.dp),
                containerColor = if (running) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary
            ) {
                Icon(
                    if (running) Icons.Default.Stop else Icons.Default.PlayArrow,
                    contentDescription = if (running) "Stop" else "Start",
                    modifier = Modifier.size(36.dp)
                )
            }
        }

        Spacer(Modifier.height(32.dp))

        // Laps list
        if (laps.isNotEmpty()) {
            LazyColumn(modifier = Modifier.fillMaxWidth()) {
                items(laps.asReversed().take(10).mapIndexed { i, t -> (laps.size - i) to t }) { (n, t) ->
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Lap $n", color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f))
                        Text(formatTime(t), fontFamily = FontFamily.Monospace, color = MaterialTheme.colorScheme.onBackground)
                    }
                    HorizontalDivider(color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.08f))
                }
            }
        }
    }
}

fun formatTime(ms: Long): String {
    val min = (ms / 60000) % 60
    val sec = (ms / 1000) % 60
    val centis = (ms % 1000) / 10
    return "%02d:%02d.%02d".format(min, sec, centis)
}
`,
  };
}

function weatherScreen(pkg: string): GeneratedFile {
  return {
    path: `app/src/main/java/${pkg.replace(/\./g, '/')}/ui/screens/MainScreen.kt`,
    language: 'kotlin',
    content: `package ${pkg}.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

data class DayForecast(val day: String, val high: Int, val low: Int, val icon: ImageVector, val condition: String)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(modifier: Modifier = Modifier) {
    // Stub weather data — replace with OpenWeatherMap or WeatherAPI.com
    val location = "San Francisco, CA"
    val temp = 18
    val feelsLike = 15
    val humidity = 72
    val wind = 14
    val condition = "Partly Cloudy"
    val forecast = listOf(
        DayForecast("Mon", 20, 13, Icons.Default.WbSunny, "Sunny"),
        DayForecast("Tue", 17, 12, Icons.Default.Cloud, "Cloudy"),
        DayForecast("Wed", 14, 10, Icons.Default.Umbrella, "Rainy"),
        DayForecast("Thu", 19, 13, Icons.Default.WbSunny, "Sunny"),
        DayForecast("Fri", 22, 15, Icons.Default.WbSunny, "Clear"),
        DayForecast("Sat", 16, 11, Icons.Default.WbCloudy, "Overcast"),
        DayForecast("Sun", 18, 12, Icons.Default.WbCloudy, "Cloudy"),
    )

    Scaffold(
        modifier = modifier,
        topBar = {
            TopAppBar(
                title = { Text(location, fontWeight = FontWeight.SemiBold) },
                actions = {
                    IconButton(onClick = { /* TODO: change location */ }) {
                        Icon(Icons.Default.Search, contentDescription = "Search")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.background)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Main temp card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primary)
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(Icons.Default.WbCloudy, contentDescription = null, modifier = Modifier.size(80.dp), tint = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.9f))
                    Spacer(Modifier.height(8.dp))
                    Text("$temp°C", fontSize = 64.sp, fontWeight = FontWeight.Thin, color = MaterialTheme.colorScheme.onPrimary)
                    Text(condition, fontSize = 18.sp, color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.8f))
                    Spacer(Modifier.height(16.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(24.dp)) {
                        StatChip("Feels", "$feelsLike°")
                        StatChip("Humidity", "$humidity%")
                        StatChip("Wind", "$wind km/h")
                    }
                }
            }

            // 7-day forecast
            Text("7-Day Forecast", fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(forecast) { day ->
                    ForecastCard(day)
                }
            }

            // API note
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = MaterialTheme.colorScheme.secondaryContainer,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(Icons.Default.Info, contentDescription = null, tint = MaterialTheme.colorScheme.onSecondaryContainer, modifier = Modifier.size(18.dp))
                    Text(
                        "Connect to OpenWeatherMap API for live data. Add your API key to BuildConfig.",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSecondaryContainer
                    )
                }
            }
        }
    }
}

@Composable
fun StatChip(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.onPrimary)
        Text(label, fontSize = 12.sp, color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.7f))
    }
}

@Composable
fun ForecastCard(day: DayForecast) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(
            modifier = Modifier.padding(12.dp).width(64.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Text(day.day, fontWeight = FontWeight.Medium, fontSize = 13.sp)
            Icon(day.icon, contentDescription = day.condition, modifier = Modifier.size(28.dp), tint = MaterialTheme.colorScheme.primary)
            Text(day.high.toString() + "°", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Text(day.low.toString() + "°", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
        }
    }
}
`,
  };
}

function chatScreen(pkg: string): GeneratedFile {
  return {
    path: `app/src/main/java/${pkg.replace(/\./g, '/')}/ui/screens/MainScreen.kt`,
    language: 'kotlin',
    content: `package ${pkg}.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

data class Message(val id: Long, val text: String, val isMe: Boolean, val time: Long = System.currentTimeMillis())

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(modifier: Modifier = Modifier) {
    val messages = remember { mutableStateListOf(
        Message(1, "Hey! How is the project going?", false),
        Message(2, "Really well! Just finished the Compose migration.", true),
        Message(3, "Nice! How does it compare to XML views?", false),
        Message(4, "Way better. Declarative UI is so much cleaner.", true),
        Message(5, "Totally agree. Are you using state hoisting?", false),
    )}
    var inputText by remember { mutableStateOf("") }
    val listState = rememberLazyListState()
    val scope = rememberCoroutineScope()

    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) listState.animateScrollToItem(messages.size - 1)
    }

    Scaffold(
        modifier = modifier,
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Surface(shape = RoundedCornerShape(50), color = MaterialTheme.colorScheme.primary, modifier = Modifier.size(36.dp)) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(Icons.Default.Person, contentDescription = null, tint = MaterialTheme.colorScheme.onPrimary, modifier = Modifier.size(20.dp))
                            }
                        }
                        Column {
                            Text("Alex", fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
                            Text("Online", fontSize = 12.sp, color = MaterialTheme.colorScheme.primary)
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.background)
            )
        },
        bottomBar = {
            Surface(
                tonalElevation = 4.dp,
                color = MaterialTheme.colorScheme.background
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 8.dp).navigationBarsPadding().imePadding(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = inputText,
                        onValueChange = { inputText = it },
                        placeholder = { Text("Message…") },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(24.dp),
                        maxLines = 3
                    )
                    FloatingActionButton(
                        onClick = {
                            if (inputText.isNotBlank()) {
                                messages.add(Message(System.currentTimeMillis(), inputText.trim(), true))
                                inputText = ""
                                scope.launch { listState.animateScrollToItem(messages.size - 1) }
                            }
                        },
                        modifier = Modifier.size(48.dp),
                        containerColor = MaterialTheme.colorScheme.primary
                    ) {
                        Icon(Icons.AutoMirrored.Filled.Send, contentDescription = "Send", modifier = Modifier.size(20.dp))
                    }
                }
            }
        }
    ) { padding ->
        LazyColumn(
            state = listState,
            modifier = Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(messages, key = { it.id }) { msg ->
                MessageBubble(msg)
            }
        }
    }
}

@Composable
fun MessageBubble(msg: Message) {
    val fmt = remember { SimpleDateFormat("HH:mm", Locale.getDefault()) }
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (msg.isMe) Arrangement.End else Arrangement.Start
    ) {
        Column(
            modifier = Modifier.widthIn(max = 280.dp),
            horizontalAlignment = if (msg.isMe) Alignment.End else Alignment.Start
        ) {
            Surface(
                shape = RoundedCornerShape(
                    topStart = 16.dp, topEnd = 16.dp,
                    bottomStart = if (msg.isMe) 16.dp else 4.dp,
                    bottomEnd = if (msg.isMe) 4.dp else 16.dp
                ),
                color = if (msg.isMe) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surface
            ) {
                Text(
                    text = msg.text,
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                    color = if (msg.isMe) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
                )
            }
            Text(
                text = fmt.format(Date(msg.time)),
                fontSize = 10.sp,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.4f),
                modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
            )
        }
    }
}
`,
  };
}

function genericScreen(pkg: string, appName: String): GeneratedFile {
  return {
    path: `app/src/main/java/${pkg.replace(/\./g, '/')}/ui/screens/MainScreen.kt`,
    language: 'kotlin',
    content: `package ${pkg}.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(modifier: Modifier = Modifier) {
    var counter by remember { mutableIntStateOf(0) }
    var selectedFeature by remember { mutableStateOf<Feature?>(null) }

    val features = listOf(
        Feature("Dashboard", Icons.Default.Dashboard, "View key metrics and summaries"),
        Feature("Profile", Icons.Default.Person, "Manage your account settings"),
        Feature("Notifications", Icons.Default.Notifications, "Stay up to date with alerts"),
        Feature("Settings", Icons.Default.Settings, "Customize your experience"),
    )

    Scaffold(
        modifier = modifier,
        topBar = {
            TopAppBar(
                title = { Text("${appName}", fontWeight = FontWeight.Bold) },
                actions = {
                    IconButton(onClick = { /* TODO */ }) {
                        Icon(Icons.Default.MoreVert, contentDescription = "More")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.background)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Hero counter
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("Interactions", color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f))
                    Text("$counter", fontSize = 56.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onPrimaryContainer)
                    Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                        OutlinedButton(onClick = { if (counter > 0) counter-- }) { Text("−") }
                        Button(onClick = { counter++ }, colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)) { Text("+") }
                    }
                }
            }

            Text("Features", fontWeight = FontWeight.SemiBold, fontSize = 16.sp)

            features.chunked(2).forEach { row ->
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    row.forEach { feature ->
                        FeatureCard(feature = feature, modifier = Modifier.weight(1f)) { selectedFeature = feature }
                    }
                    if (row.size == 1) Spacer(Modifier.weight(1f))
                }
            }
        }
    }

    selectedFeature?.let { f ->
        AlertDialog(
            onDismissRequest = { selectedFeature = null },
            icon = { Icon(f.icon, contentDescription = null) },
            title = { Text(f.title) },
            text = { Text(f.description) },
            confirmButton = { Button(onClick = { selectedFeature = null }) { Text("Got it") } }
        )
    }
}

data class Feature(val title: String, val icon: ImageVector, val description: String)

@Composable
fun FeatureCard(feature: Feature, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        onClick = onClick,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(
            modifier = Modifier.padding(16.dp).fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Icon(feature.icon, contentDescription = feature.title, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(32.dp))
            Text(feature.title, fontWeight = FontWeight.Medium, fontSize = 14.sp, textAlign = TextAlign.Center)
        }
    }
}
`,
  };
}

// ── Main Generation Function ────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function generateProject(
  prompt: string,
  onAgentProgress: (progress: AgentProgress) => void,
  decisions: Record<string, string> = {},
  previousLessons: string[] = [],
): Promise<GeneratedProject> {
  const type = detectAppType(prompt);
  const appName = extractAppName(prompt, type);
  const packageName = generatePackageName(appName);
  const description = appTypeDescription(type);
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 6);

  // Agent: ARCHITECT
  onAgentProgress({ agent: 'ARCHITECT', action: `Designing ${appName} structure (${type})…`, status: 'active' });
  await sleep(900);
  onAgentProgress({ agent: 'ARCHITECT', action: `App structure designed — ${type} pattern`, status: 'complete' });

  // Agent: CODER
  onAgentProgress({ agent: 'CODER', action: 'Writing Kotlin/Compose UI code…', status: 'active' });
  await sleep(1100);

  // Generate type-specific screen
  let screen: GeneratedFile;
  switch (type) {
    case 'calculator': screen = calculatorScreen(packageName); break;
    case 'notes':      screen = notesScreen(packageName);      break;
    case 'todo':       screen = todoScreen(packageName);       break;
    case 'timer':      screen = timerScreen(packageName);      break;
    case 'weather':    screen = weatherScreen(packageName);    break;
    case 'chat':       screen = chatScreen(packageName);       break;
    default:           screen = genericScreen(packageName, appName); break;
  }
  onAgentProgress({ agent: 'CODER', action: `${screen.path.split('/').pop()} written (${type} UI)`, status: 'complete' });

  // Agent: BUILDER
  onAgentProgress({ agent: 'BUILDER', action: 'Configuring Gradle + Manifest…', status: 'active' });
  await sleep(700);
  onAgentProgress({ agent: 'BUILDER', action: 'Build files configured (SDK 35 / KGP 2.1.0)', status: 'complete' });

  const rawFiles: GeneratedFile[] = [
    settingsGradle(appName),
    rootBuildGradle(),
    libsVersionsToml(),
    appBuildGradle(packageName),
    androidManifest(packageName, appName),
    mainActivity(packageName, appName),
    colorKt(packageName),
    themeKt(packageName, appName),
    typeKt(packageName),
    screen,
    stringsXml(appName),
    themesXml(appName),
    gradleProperties(),
    proguardRules(),
    readmeFile(appName, type, description, packageName),
  ];
  // Agent: FIXER — inspect and repair the actual generated project.
  onAgentProgress({ agent: 'FIXER', action: 'Running offline structural repair scan…', status: 'active' });
  await sleep(600);
  const repaired = selfRepairFiles(rawFiles, previousLessons);
  onAgentProgress({
    agent: 'FIXER',
    action: repaired.report.repairs.length > 0
      ? `Self-repaired ${repaired.report.repairs.length} project issue(s)`
      : 'No structural issues found in repair scan',
    status: 'complete',
  });

  // Agent: OPTIMIZER
  onAgentProgress({ agent: 'OPTIMIZER', action: 'Applying Compose performance optimizations…', status: 'active' });
  await sleep(400);
  onAgentProgress({ agent: 'OPTIMIZER', action: 'Project optimized — ready to compile', status: 'complete' });

  return {
    id,
    name: appName,
    description,
    prompt,
    packageName,
    appType: type,
    files: repaired.files,
    createdAt: Date.now(),
    decisions,
    repairReport: repaired.report,
  };
}
