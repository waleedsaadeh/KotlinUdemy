# CLAUDE.md

Guidance for AI assistants (Claude Code and others) working in this repository.

## What this repository is

**KotlinUdemy** is the companion source code for *"The Complete Android Kotlin
Developer Course."* It is a **teaching / tutorial repository**, not a single
deployable application. It collects dozens of small, self-contained examples
that build up from Kotlin language fundamentals to complete Android apps and
games. Each example maps to a lesson in the course.

Because it is educational material, code favors clarity and demonstrating a
single concept over production hardening. Preserve that intent when editing:
keep examples minimal, readable, and focused on the concept they teach. Do not
"modernize" or refactor an example unless explicitly asked — doing so can break
its correspondence with the course videos.

## Top-level layout

```
Kotlin/          Plain console Kotlin (IntelliJ IDEA project) — language fundamentals
Android/         ~17 standalone Android Studio projects, one folder per app/lesson
README.md        Course description + index of the apps, each linking to its folder
LICENSE.md
```

### `Kotlin/` — console fundamentals

An IntelliJ IDEA project (`Kotlin.iml`, `.idea/`). All lessons live as loose
`.kt` files under `Kotlin/src/`, each with its own `fun main()` entry point.
Files are named after the concept they demonstrate, e.g. `DataTypes.kt`,
`NestedLoop.kt`, `Lamda.kt`, `HashMapDemo.kt`, `FunctionOverload.kt`,
`WhenMenu.kt`. Two sub-packages group later material:

- `Kotlin/src/com/car/maintin/` — OOP examples (classes, data classes,
  inheritance): `Car.kt`, `Truck.kt`, `DataClass.kt`, `CreditCardCompany.kt`, …
- `Kotlin/src/legacy/` — generics, singletons, enums, abstract classes,
  overriding, nested classes.

To run one of these, open the `Kotlin/` project in IntelliJ and run the
`main` function of the target file, or compile a single file with:

```
kotlinc Kotlin/src/FirstApp.kt -include-runtime -d app.jar && java -jar app.jar
```

### `Android/` — one project per app

Each subfolder under `Android/` is an **independent Android Studio / Gradle
project** (its own `settings.gradle`, `gradlew`, and `app/` module). There is
no root Gradle build tying them together — you build/open each app on its own.
Most projects nest the actual Gradle root inside a `StartUp/` folder
(e.g. `Android/Calculator/StartUp/`); a few differ (see notes below).

Apps (see `README.md` for the annotated list and course links):

| Folder | App | Concept taught |
|---|---|---|
| `FindMyAge` | Find My Age | first Android app, layouts, intents |
| `Calculator` | Calculator | UI + arithmetic logic |
| `TicTacToy Game/TicTacToeLocal` | Tic Tac Toe (local) | 2-player game logic |
| `TicTacToy Game/TicTacToyOnline` | Tic Tac Toe (online) | Firebase realtime |
| `PockemonAndroid` | Pokémon game | game loop, images |
| `ZooApp` | Zoo | lists / adapters |
| `FoodApp` | Restaurants | RecyclerView, images |
| `GetSunSet` | Find Sunrise time | REST + JSON |
| `NoteApp/MyNotes SQlite` | My Notes | SQLite CRUD |
| `NoteApp/MyNotes Room Jetpack ` | My Notes | Room / Jetpack |
| `TwitterDemo` | Twitter/Facebook clone | Firebase social app |
| `TwitterWebService` | Twitter (PHP+MySQL) | Android + `TwitterAndroidServer/*.php` backend |
| `MediaPlayer` | MediaPlayer | audio playback |
| `AlarmManager` | Alarm | `AlarmManager` |
| `NotificationChannelsApp` | Notification channels | notifications |
| `sensors/light` | Light sensor | sensor API |
| `sensors/numbizz` | Shake-to-vibrate | accelerometer |
| `FindMyPhone` | Find My Phone | device admin |
| `StartUp` | Startup template | boilerplate starter |
| `Assets/` | — | shared image assets (not a project) |

## Build & run (Android apps)

These are **legacy projects** pinned to old tooling. Do not assume they build
with current Android Studio without an upgrade. Typical pinned versions
(from `Android/Calculator/StartUp/`):

- Gradle wrapper: **5.1.1**
- Android Gradle Plugin: **3.4.1**
- Kotlin: **1.3.41**
- `compileSdkVersion` / `targetSdkVersion`: **29**, `minSdkVersion`: **17**
- Uses `kotlin-android-extensions` (synthetic view binding — deprecated in
  modern Kotlin) and `jcenter()` (shut down; may need substituting for
  `mavenCentral()`/`google()` if you actually build).

To build a single app from the command line:

```
cd "Android/<AppFolder>/StartUp"
./gradlew assembleDebug        # build the debug APK
./gradlew installDebug         # build + install on a connected device/emulator
./gradlew test                 # JVM unit tests (app/src/test)
./gradlew connectedAndroidTest # instrumented tests (needs a device)
```

Path caveats: several folders contain **spaces** (`TicTacToy Game`,
`MyNotes Room Jetpack `, `Food Images`) — quote paths in shell commands. The
Room notes folder has a **trailing space** in its name.

## Conventions

- **Language:** Kotlin for app code; a few Android test stubs are Java
  (`ExampleUnitTest.java`, `ExampleInstrumentedTest.java` — the default
  Android template files). One backend is PHP (`TwitterWebService/TwitterAndroidServer/`).
- **Package naming:** app code lives under `com.hussein.<app>` or
  `com.alrubaye.<app>` (the author's namespaces); the on-disk source template
  path is usually `app/src/main/java/com/hussein/startup/`. Match the existing
  package of the specific app you are editing rather than introducing a new one.
- **Entry point (console):** every `Kotlin/src/*.kt` file has its own
  `fun main()`.
- **UI:** classic Android Views + XML layouts under `app/src/main/res/layout/`,
  strings in `res/values/strings.xml`. No Jetpack Compose.
- **Naming:** file/class names describe the lesson concept; expect informal
  and occasionally misspelled names (`Lamda.kt`, `SimpleAbstruct.kt`,
  `TicTacToy`, `numbizz`). Keep existing names unless a rename is the point of
  the task — they are referenced by the course and by `README.md` links.

## Working in this repo

- Each app is isolated: a change in one app never affects another. Scope edits
  to the single project folder in question.
- The generated/IDE files (`.idea/`, `.gradle/`, `build/`, `*.iml`,
  `gradle-wrapper.jar`, `.ser` caches) are committed in places. Don't
  regenerate or churn them unless the task requires it.
- When adding a new example, follow the existing pattern: a new `.kt` file with
  `main()` under `Kotlin/src/` for language topics, or a new self-contained
  Gradle project under `Android/` for an app. Update `README.md`'s app index if
  you add an app.
- If asked to modernize/upgrade, expect a coordinated bump of Gradle wrapper,
  AGP, Kotlin, SDK levels, the `jcenter()` → `mavenCentral()` migration, and
  replacing `kotlin-android-extensions` with view binding or Compose. Treat
  that as an explicit, per-app migration, not a blanket sweep.

## Git workflow

- Development branch for AI-assisted work: **`claude/claude-md-docs-yszahn`**.
  Create it from the latest default branch if it does not exist; commit with
  clear messages; push with `git push -u origin claude/claude-md-docs-yszahn`.
- Default branch: **`master`**.
- Do **not** open a pull request unless explicitly asked.
