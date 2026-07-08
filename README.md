<div align="center">

# 🕌 إذاعة القرآن الكريم · Quran Web Radio

**بث مباشر وعلى الطلب · Live Streaming & On-Demand Library**

[![MP3Quran API](https://img.shields.io/badge/API-MP3Quran%20v3-green?style=flat-square)](https://mp3quran.net)
[![Vanilla JS](https://img.shields.io/badge/Frontend-HTML%20%2F%20CSS%20%2F%20JS-yellow?style=flat-square)](#)
[![Python](https://img.shields.io/badge/Backend-Python%203-blue?style=flat-square)](#)
[![Docker](https://img.shields.io/badge/Icecast-Docker%20Compose-2496ED?style=flat-square)](#)
[![Languages](https://img.shields.io/badge/Languages-7-orange?style=flat-square)](#-multi-language-support)

</div>

---

## 📖 نظرة عامة · Overview

تطبيق ويب حديث وتفاعلي للاستماع إلى القرآن الكريم بثاً مباشراً أو حسب الطلب، يعتمد بالكامل على **MP3Quran API v3** المجانية دون أي تخزين محلي للملفات الصوتية.

A modern, interactive single-page web application for listening to the Holy Quran — either via live radio streams or the on-demand recitation library — powered entirely by the free **MP3Quran API v3**.

---

## ✨ المميزات · Features

### 🎙️ البث الإذاعي الحي · Live Radio Streaming
- أكثر من **150 محطة إذاعية حية** متاحة مباشرةً من API
- بحث فوري في قائمة المحطات
- اختصارات سريعة لإذاعة القاهرة وإذاعة المملكة العربية السعودية
- **Over 150 live radio stations** loaded directly from the API
- Instant search filter across all stations
- Quick-access preset buttons (Cairo Radio, Saudi Radio)

### 📚 المكتبة الصوتية · On-Demand Library
- اختيار القارئ من قائمة كاملة محدثة عبر API
- دعم **روايات متعددة** (حفص، ورش، قالون، وغيرها) حسب ما يوفره كل قارئ
- بحث سريع في القراء وفي أسماء السور
- شبكة تفاعلية لعرض جميع السور المتاحة مع تفاصيلها (مكية/مدنية، رقم الصفحة، عدد الآيات)
- تشغيل فوري بالنقر، والتنقل التلقائي بين السور
- Select any reciter from a live-updated API list
- **Multiple narration editions** per reciter (Hafs, Warsh, Qaloon, etc.)
- Real-time search for both reciters and surah names
- Surah grid showing type (Meccan/Medinan), page number, and verse count
- One-click playback with automatic sequential navigation

### 🎛️ المشغل · Audio Player
- شريط تحكم ثابت في أسفل الشاشة (Spotify-style)
- مستوى صوت قابل للضبط محفوظ في `localStorage`
- زر كتم الصوت مع تبديل الأيقونة
- شريط تقدم زمني قابل للسحب (لسور المكتبة فقط)
- زر إعادة تعيين المشغل
- Persistent bottom player bar (Spotify-style)
- Adjustable volume saved to `localStorage`
- Mute/unmute with icon toggle
- Draggable progress/timeline bar (library mode only)
- Reset player button

### 🌊 المشغل البصري · Canvas Audio Visualizer
- رسم بياني للذبذبات الصوتية في الوقت الحقيقي باستخدام `AudioContext` و`AnalyserNode`
- دعم نسبة البكسل العالية (HiDPI/Retina) لحدة بصرية مثالية
- رسم توقف جمالي عند عدم تشغيل الصوت
- تأثيرات تنفس متحركة عند التشغيل
- Real-time frequency spectrum using `AudioContext` + `AnalyserNode`
- HiDPI/Retina support via `devicePixelRatio` scaling
- Idle animated fallback when no audio is playing
- Breathing animation on the player while audio is active

### 🌐 دعم متعدد اللغات · Multi-Language Support

يدعم التطبيق **7 لغات** مع تكيف كامل للاتجاه (RTL/LTR)، وترجمة ديناميكية لجميع عناصر الواجهة بما فيها العناوين والتلميحات والنصوص الفارغة:

The app supports **7 languages** with full RTL/LTR layout switching and dynamic translation of all UI elements:

| الكود | اللغة |
|-------|-------|
| `ar`  | العربية |
| `en`  | English |
| `fr`  | Français |
| `ur`  | اردو |
| `tr`  | Türkçe |
| `id`  | Bahasa Indonesia |
| `ms`  | Bahasa Melayu |

- أسماء اللغات تُعرض بشكلها الكامل (العربية، English، Français، ...) في قائمة الاختيار
- حفظ اللغة المختارة في `localStorage` وإعادة تطبيقها عند كل زيارة
- كشف لغة المتصفح تلقائياً كاحتياطية
- Language names shown in their **full native form** in the selector (العربية, English, Français, etc.)
- Language preference saved to `localStorage` and restored on every visit
- Automatic browser language detection as fallback

### 🎨 التصميم والمظهر · Design & Theming
- وضع فاتح / داكن مع حفظ التفضيل ودعم `prefers-color-scheme`
- تصميم إسلامي راقي مع نمط هندسي دوار في الخلفية
- خط عربي Amiri و Noto Naskh Arabic للنصوص العربية، وخط Poppins/Inter للنصوص اللاتينية
- بانر ﷽ متوهج في الترويسة
- Light / Dark theme with saved preference and `prefers-color-scheme` system default support
- Premium Islamic aesthetic with animated rotating geometric arabesque background
- Amiri & Noto Naskh Arabic fonts for Arabic text, Poppins/Inter for Latin text
- Shimmering Bismillah banner in the header

### ⚡ الأداء · Performance
- **ذاكرة تخزين API مؤقتة** (`apiCache`): يتم جلب كل طلب API مرة واحدة فقط والنتائج تُخزن في الذاكرة، مما يجعل تبديل اللغات فورياً بعد الجلب الأول
- **Proxy للمشغل المزدوج**: يوجّه جميع عمليات التحكم إلى العنصر الصوتي الصحيح (Live Radio أو Library)، ويحل مشكلة CORS لتدفقات Icecast في `AudioContext`
- شاشات تحميل Skeleton أثناء تغيير اللغة
- **In-memory API cache** (`apiCache`): every API endpoint is fetched only once and cached — subsequent language switches are instant with zero extra network requests
- **JavaScript Proxy dual audio engine**: transparently routes all player controls to the active audio element (live radio or library), resolving AudioContext CORS issues with Icecast streams
- Skeleton shimmer loaders shown during language switches

---

## 🗂️ هيكل المشروع · Project Structure

```
quran-radio/
├── index.html          # واجهة التطبيق الرئيسية / Main SPA markup
├── styles.css          # نظام التصميم الكامل / Full design system (Vanilla CSS)
├── script.js           # منطق التطبيق / App logic, API, player, i18n, visualizer
├── streamer.py         # بث Python آلي 24/7 / Python 24/7 automated Icecast streamer
├── docker-compose.yml  # خادم Icecast محلي / Local Icecast2 server via Docker
└── README.md
```

---

## 🚀 تشغيل الواجهة الأمامية · Running the Frontend

> الواجهة الأمامية لا تحتاج إلى أي تثبيت. فقط شغّل خادم ويب بسيطاً.
> The frontend requires no installation. Just serve it with any static server.

**Python:**
```bash
python -m http.server 3000
```

**Node.js:**
```bash
npx http-server -p 3000
```

ثم افتح المتصفح على: `http://localhost:3000`

---

## 📡 برنامج البث الآلي · Python 24/7 Streamer (`streamer.py`)

برنامج بايثون يجلب تلاوات أي قارئ عبر API ويبثها مستمراً 24/7 إلى خادم Icecast/Shoutcast باستخدام `ffmpeg`، مع إعادة تشغيل تلقائية عند انتهاء القائمة أو حدوث خطأ.

A Python script that fetches any reciter's audio from the API and streams it continuously 24/7 to an Icecast/Shoutcast server via `ffmpeg`, with automatic restart on completion or failure.

### المتطلبات · Prerequisites

- Python 3.x (standard library only — no extra packages needed)
- [`ffmpeg`](https://ffmpeg.org/) مثبت وفي متغيرات البيئة (`PATH`)
  - Windows: `winget install Gyan.FFmpeg`
  - Linux/macOS: `sudo apt install ffmpeg` / `brew install ffmpeg`
- خادم Icecast أو Shoutcast (استخدم `docker-compose.yml` للاختبار المحلي)

### تشغيل الخادم المحلي · Start Local Icecast Server

```bash
docker compose up -d
```

| | |
|--|--|
| Admin panel | `http://localhost:8000` (admin / admin) |
| Stream endpoint | `http://localhost:8000/live` |
| Source username | `source` |
| Source password | `hackme` |

### تشغيل البث · Start Streaming

```bash
python streamer.py --host localhost --port 8000 --password hackme --mount /live
```

عند التشغيل، يعرض البرنامج قائمة بأشهر 30 قارئاً. أدخل رقم القارئ أو اضغط Enter لاختيار عشوائي.

On startup, the script lists the top 30 reciters. Enter a reciter ID or press Enter for a random selection.

### الخيارات · CLI Options

| الخيار | الوصف | الافتراضي / Default |
|--------|-------|---------|
| `--host` | عنوان خادم Icecast / Icecast server hostname | `localhost` |
| `--port` | منفذ الخادم / Server port | `8000` |
| `--username` | اسم مستخدم المصدر / Source username | `source` |
| `--password` | كلمة مرور البث / Source password | `hackme` |
| `--mount` | نقطة التثبيت / Mountpoint | `/live` |
| `--reciter` | معرّف القارئ / Reciter ID (skips interactive prompt) | — |
| `--shuffle` | تشغيل عشوائي للسور / Shuffle surah playlist | `false` |
| `--bitrate` | معدل بت الصوت kbps / Audio bitrate in kbps | `128` |

### أمثلة · Examples

```bash
# بث قارئ بعينه بجودة عالية وترتيب عشوائي
# Stream a specific reciter at high quality with shuffled surahs
python streamer.py --reciter 1 --bitrate 192 --shuffle

# بث تلقائي في بيئة الإنتاج
# Automated streaming in production (non-interactive)
python streamer.py --host radio.example.com --port 8000 --password secret --reciter 5
```

---

## 🌐 MP3Quran API v3 — Endpoints Used

| الغرض / Purpose | الرابط / Endpoint |
|-------|--------|
| أسماء السور وتفاصيلها / Surah names & details | `https://mp3quran.net/api/v3/suwar?language={lang}` |
| قائمة القراء والروايات / Reciters & narrations | `https://mp3quran.net/api/v3/reciters?language={lang}` |
| محطات الراديو الحية / Live radio stations | `https://mp3quran.net/api/v3/radios?language={lang}` |
| رابط التلاوة المباشر / Audio file URL | `{SERVER_URL}{003}.mp3` |

> **Language mapping:** Arabic (`ar`) and Urdu (`ur`) fetch their native script. All other UI languages fetch `eng` for clean transliterated names.

---

## 📜 الرخصة · License

© 2026 إذاعة القرآن الكريم الإلكترونية. جميع الحقوق محفوظة.  
بيانات التلاوات مقدمة بإذن من [MP3Quran.net](https://mp3quran.net).

© 2026 Holy Quran Web Radio. All rights reserved.  
Recitation data provided courtesy of [MP3Quran.net](https://mp3quran.net).

