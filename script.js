/**
 * Quran Radio Web Application - Frontend Logic
 * Consumes public MP3Quran API v3 dynamically.
 * Features:
 * - Dynamic Reciter & Surah fetching.
 * - Dynamic Radio streams loading & search.
 * - Custom Audio Player with AudioContext Canvas Visualizer.
 * - LocalStorage state preservation.
 * - Light / Dark Theme toggle.
 */

// Base API Endpoints (language query parameter is appended dynamically)
const API_BASE_SUWAR = 'https://mp3quran.net/api/v3/suwar';
const API_BASE_RADIOS = 'https://mp3quran.net/api/v3/radios';
const API_BASE_RECITERS = 'https://mp3quran.net/api/v3/reciters';

// API Response Cache Store (provides instant switching without redundant fetches)
let apiCache = {};

// Helper to construct translated endpoints:
// Arabic and Urdu fetch their respective native scripts.
// All LTR languages fetch 'eng' to retrieve clean, transliterated names.
function getAPIUrl(base, lang) {
  const apiLang = (lang === 'ar' || lang === 'ur') ? lang : 'eng';
  return `${base}?language=${apiLang}`;
}

async function fetchAPIWithCache(url) {
  if (apiCache[url]) {
    return apiCache[url];
  }
  const data = await fetchAPI(url);
  if (data) {
    apiCache[url] = data;
  }
  return data;
}

// Multi-Language Translation Dictionary
const translations = {
  ar: {
    brand_title: 'إذاعة القرآن الكريم',
    brand_subtitle: 'QURAN WEB RADIO & ON-DEMAND LIBRARY',
    reset_player: 'إعادة تعيين المشغل',
    reset_player_btn: 'إعادة الضبط',
    theme_toggle: 'تبديل Mظهر',
    select_language: 'اختر اللغة / Select Language',
    visualizer_title: 'موجات التلاوة',
    visualizer_label: 'المشغل المرئي',
    visualizer_subtitle: 'التردد الصوتي التفاعلي للبث',
    visualizer_fallback: 'شغل الصوت لتنشيط المؤثرات البصرية',
    radios_title: 'المحطات الإذاعية المباشرة',
    radios_label: 'الراديو والمحطات',
    radios_subtitle: 'اختر من بين أكثر من 150 بثًا مباشرًا',
    preset_cairo: 'إذاعة القاهرة',
    preset_saudi: 'إذاعة المملكة',
    search_radio_placeholder: 'البحث عن إذاعة (مثال: القاهرة، المنشاوي)...',
    search_reciter_placeholder: 'ابحث عن قارئ...',
    search_surah_placeholder: 'ابحث عن سورة بالاسم...',
    library_badge: 'المكتبة الصوتية الشاملة',
    library_status: 'متصل بخادم المصادر ومحدث',
    library_title: 'الاستماع حسب الطلب',
    library_subtitle: 'ابحث عن قارئك المفضل، واختر الرواية والسورة للاستماع الفوري.',
    select_reciter_label: '1. اختر القارئ (Reciter)',
    select_edition_label: '2. رواية / نوع المصحف (Edition)',
    select_surah_label: '3. اختر السورة للتشغيل (Surah)',
    available_surahs: 'السور المتوفرة:',
    empty_placeholder: 'الرجاء اختيار القارئ والرواية لعرض السور المتاحة للاستماع',
    loading_reciters: 'جاري تحميل القراء...',
    select_reciter_first: 'اختر القارئ أولاً...',
    footer_copyright: '© 2026 إذاعة القرآن الكريم الإلكترونية. جميع الحقوق محفوظة.',
    footer_link: 'الموقع الرسمي MP3Quran',
    footer_update: 'تحديث تلقائي للمصادر عبر API v3',
    now_playing_loading: 'جاري تحميل الإذاعة...',
    please_wait: 'يرجى الانتظار',
    prev_track: 'السورة السابقة / المحطة السابقة',
    play_pause: 'تشغيل / إيقاف مؤقت',
    next_track: 'السورة التالية / المحطة التالية',
    mute_btn: 'كتم الصوت',
    volume_slider: 'مستوى الصوت',
    live_mode: 'بث مباشر',
    library_mode: 'المكتبة الصوتية',
    live_subtitle: 'بث حي مستمر',
    no_radios_found: 'لا توجد إذاعة تطابق البحث',
    no_surahs_found: 'لا توجد سورة متطابقة مع البحث',
    live_badge: 'مباشر',
    meccan: 'مكية',
    medinan: 'مدنية',
    page: 'صفحة',
    unknown: 'غير معروف',
    surah: 'سورة',
    error_title: 'خطأ في الاتصال بالخادم',
    error_subtitle: 'يرجى التحقق من اتصالك بالإنترنت',
    buffering: 'جاري التحميل والتخزين المؤقت...',
    playback_failed: 'فشل تحميل الصوت. محاولة إعادة الاتصال...',
    form_help_text: 'تتوفر روايات متعددة لبعض القراء (حفص، ورش، قالون).'
  },
  en: {
    brand_title: 'Holy Quran Radio',
    brand_subtitle: 'QURAN WEB RADIO & ON-DEMAND LIBRARY',
    reset_player: 'Reset Player',
    reset_player_btn: 'Reset',
    theme_toggle: 'Toggle Theme',
    select_language: 'Select Language',
    visualizer_title: 'Recitation Waves',
    visualizer_label: 'Visual Player',
    visualizer_subtitle: 'Interactive Audio Spectrum',
    visualizer_fallback: 'Play audio to activate visualizer',
    radios_title: 'Live Radio Streams',
    radios_label: 'Radio & Stations',
    radios_subtitle: 'Choose from over 150 live broadcasts',
    preset_cairo: 'Cairo Radio',
    preset_saudi: 'Saudi Radio',
    search_radio_placeholder: 'Search radio (e.g., Cairo, Minshawi)...',
    search_reciter_placeholder: 'Search reciter...',
    search_surah_placeholder: 'Search surah by name...',
    library_badge: 'Comprehensive Audio Library',
    library_status: 'Connected to API & Updated',
    library_title: 'On-Demand Listening',
    library_subtitle: 'Search for your favorite reciter, and select the narration and surah to play.',
    select_reciter_label: '1. Select Reciter',
    select_edition_label: '2. Narration / Edition',
    select_surah_label: '3. Select Surah',
    available_surahs: 'Available Surahs:',
    empty_placeholder: 'Please select a reciter and narration to show available surahs',
    loading_reciters: 'Loading reciters...',
    select_reciter_first: 'Select reciter first...',
    footer_copyright: '© 2026 Holy Quran Web Radio. All rights reserved.',
    footer_link: 'Official Website MP3Quran',
    footer_update: 'Auto updated via API v3',
    now_playing_loading: 'Loading stream...',
    please_wait: 'Please wait',
    prev_track: 'Previous Track',
    play_pause: 'Play / Pause',
    next_track: 'Next Track',
    mute_btn: 'Mute',
    volume_slider: 'Volume',
    live_mode: 'Live',
    library_mode: 'Recitation',
    live_subtitle: 'Continuous live stream',
    no_radios_found: 'No radio stations found matching search',
    no_surahs_found: 'No surahs found matching search',
    live_badge: 'Live',
    meccan: 'Meccan',
    medinan: 'Medinan',
    page: 'Page',
    unknown: 'Unknown',
    surah: 'Surah',
    error_title: 'Connection Error',
    error_subtitle: 'Please check your internet connection',
    buffering: 'Loading & buffering...',
    playback_failed: 'Audio load failed. Reconnecting...',
    form_help_text: 'Multiple narrations are available for some reciters (Hafs, Warsh, Qaloon).'
  },
  fr: {
    brand_title: 'Radio du Coran',
    brand_subtitle: 'RADIO WEB DU CORAN & BIBLIOTHÈQUE SUR DEMANDE',
    reset_player: 'Réinitialiser le lecteur',
    reset_player_btn: 'Reset',
    theme_toggle: 'Changer le thème',
    select_language: 'Choisir la langue',
    visualizer_title: 'Ondes de Récitation',
    visualizer_label: 'Lecteur Visuel',
    visualizer_subtitle: 'Spectre Audio Interactif',
    visualizer_fallback: 'Jouez de l\'audio pour activer le visualiseur',
    radios_title: 'Stations en Direct',
    radios_label: 'Radios & Stations',
    radios_subtitle: 'Choisissez parmi plus de 150 stations',
    preset_cairo: 'Radio du Caire',
    preset_saudi: 'Radio d\'Arabie',
    search_radio_placeholder: 'Rechercher une radio (ex. Le Caire, Minshawi)...',
    search_reciter_placeholder: 'Rechercher un réciteur...',
    search_surah_placeholder: 'Rechercher une sourate par nom...',
    library_badge: 'Bibliothèque Complète',
    library_status: 'Connecté à l\'API & Mis à jour',
    library_title: 'Écoute sur Demande',
    library_subtitle: 'Recherchez votre réciteur préféré, choisissez la narration et la sourate.',
    select_reciter_label: '1. Choisir le réciteur',
    select_edition_label: '2. Narration / Édition',
    select_surah_label: '3. Choisir la sourate',
    available_surahs: 'Sourates disponibles :',
    empty_placeholder: 'Sélectionnez un réciteur et une narration pour afficher les sourates',
    loading_reciters: 'Chargement des réciteurs...',
    select_reciter_first: 'Sélectionnez d\'abord un réciteur...',
    footer_copyright: '© 2026 Radio Web du Coran. Tous droits réservés.',
    footer_link: 'Site officiel MP3Quran',
    footer_update: 'Mise à jour automatique via API v3',
    now_playing_loading: 'Chargement du flux...',
    please_wait: 'Veuillez patienter',
    prev_track: 'Sourate précédente / Station précédente',
    play_pause: 'Lecture / Pause',
    next_track: 'Sourate suivante / Station suivante',
    mute_btn: 'Muet',
    volume_slider: 'Volume',
    live_mode: 'Direct',
    library_mode: 'Récitation',
    live_subtitle: 'Diffusion en direct continue',
    no_radios_found: 'Aucune station trouvée',
    no_surahs_found: 'Aucune sourate trouvée',
    live_badge: 'Direct',
    meccan: 'Mecquoise',
    medinan: 'Médinoise',
    page: 'Page',
    unknown: 'Inconnu',
    surah: 'Sourate',
    error_title: 'Erreur de connexion',
    error_subtitle: 'Veuillez vérifier votre connexion Internet',
    buffering: 'Chargement & mise en mémoire...',
    playback_failed: 'Échec de chargement. Reconnexion...',
    form_help_text: 'Plusieurs narrations sont disponibles pour certains réciteurs (Hafs, Warsh, Qaloon).'
  },
  ur: {
    brand_title: 'قرآن ریڈیو',
    brand_subtitle: 'قرآن ویب ریڈیو اور آن ڈیمانڈ لائبریری',
    reset_player: 'ری سیٹ کریں',
    reset_player_btn: 'ری سیٹ',
    theme_toggle: 'تھیم تبدیل کریں',
    select_language: 'زبان منتخب کریں',
    visualizer_title: 'تلاوت کی لہریں',
    visualizer_label: 'بصری پلیئر',
    visualizer_subtitle: 'انٹرایکٹو آڈیو سپیکٹرم',
    visualizer_fallback: 'بصری اثرات کو چالو کرنے کے لیے آڈیو چلائیں',
    radios_title: 'براہ راست ریڈیو اسٹیشنز',
    radios_label: 'ریڈیو اور اسٹیشنز',
    radios_subtitle: '150 سے زیادہ لائیو نشریات میں سے انتخاب کریں',
    preset_cairo: 'قاهرہ ریڈیو',
    preset_saudi: 'سعودی ریڈیو',
    search_radio_placeholder: 'ریڈیو تلاش کریں (جیسے: قاہرہ، منشاوی)...',
    search_reciter_placeholder: 'قاری تلاش کریں...',
    search_surah_placeholder: 'سورت کا نام تلاش کریں...',
    library_badge: 'جامع آڈیو لائبریری',
    library_status: 'API سے منسلک اور اپ ڈیٹ شدہ',
    library_title: 'آن ڈیمانڈ لائبریری',
    library_subtitle: 'اپنے پسندیدہ قاری کو تلاش کریں، تلاوت کا طریقہ اور سورت منتخب کریں۔',
    select_reciter_label: '1. قاری منتخب کریں (Reciter)',
    select_edition_label: '2. تلاوت کا طریقہ / نسخہ (Edition)',
    select_surah_label: '3. سورت منتخب کریں (Surah)',
    available_surahs: 'دستیاب سورتیں:',
    empty_placeholder: 'دستیاب سورتیں دیکھنے کے لیے قاری اور ایڈیشن منتخب کریں',
    loading_reciters: 'قارئین لوڈ ہو رہے ہیں...',
    select_reciter_first: 'پہلے قاری منتخب کریں...',
    footer_copyright: '© 2026 قرآن ویب ریڈیو۔ جملہ حقوق محفوظ ہیں۔',
    footer_link: 'آفیشل ویب سائٹ MP3Quran',
    footer_update: 'API v3 کے ذریعے خودکار اپ ڈیٹ',
    now_playing_loading: 'نشریات لوڈ ہو رہی ہیں...',
    please_wait: 'براہ کرم انتظار کریں',
    prev_track: 'پچھلی سورت / پچھلا اسٹیشن',
    play_pause: 'چلائیں / روکیں',
    next_track: 'اگلی سورت / اگلا اسٹیشن',
    mute_btn: 'خاموش',
    volume_slider: 'آواز',
    live_mode: 'لائیو نشریات',
    library_mode: 'تلاوت',
    live_subtitle: 'مسلسل لائیو سٹریم',
    no_radios_found: 'تلاش کے مطابق کوئی ریڈیو نہیں ملا',
    no_surahs_found: 'تلاش کے مطابق کوئی سورت نہیں ملی',
    live_badge: 'براہ راست',
    meccan: 'مکی',
    medinan: 'مدنی',
    page: 'صفحہ',
    unknown: 'نامعلوم',
    surah: 'سورت',
    error_title: 'کنکشن کی خرابی',
    error_subtitle: 'براہ کرم انٹرنیٹ کنکشن چیک کریں',
    buffering: 'لوڈنگ اور بفرنگ جاری ہے...',
    playback_failed: 'آڈیو لوڈنگ ناکام۔ دوبارہ کوشش...',
    form_help_text: 'کچھ قارئین کے لیے متعدد تلاوتیں دستیاب ہیں (حفص، ورش، قالون)۔'
  },
  tr: {
    brand_title: 'Kuran Radyosu',
    brand_subtitle: 'KURAN WEB RADYOSU & İSTEĞE BAĞLI KÜTÜPHANE',
    reset_player: 'Oynatıcıyı Sıfırla',
    reset_player_btn: 'Sıfırla',
    theme_toggle: 'Temayı Değiştir',
    select_language: 'Dil Seçin',
    visualizer_title: 'Kıraat Dalgaları',
    visualizer_label: 'Görsel Oynatıcı',
    visualizer_subtitle: 'Etkileşimli Ses Spektrumu',
    visualizer_fallback: 'Görsel efektleri etkinleştirmek için ses çalın',
    radios_title: 'Canlı Radyolar',
    radios_label: 'Radyo & İstasyonlar',
    radios_subtitle: '150\'den fazla canlı yayın arasından seçim yapın',
    preset_cairo: 'Kahire Radyosu',
    preset_saudi: 'Suudi Radyosu',
    search_radio_placeholder: 'Radyo ara (ör. Kahire, Minshawi)...',
    search_reciter_placeholder: 'Hafız ara...',
    search_surah_placeholder: 'Sure adı ara...',
    library_badge: 'Kapsamlı Ses Kütüphanesi',
    library_status: 'API\'ye Bağlı & Güncel',
    library_title: 'İsteğe Bağlı Dinleme',
    library_subtitle: 'En sevdiğiniz hafızı arayın, kıraat türünü ve sureyi seçin.',
    select_reciter_label: '1. Hafız Seçin',
    select_edition_label: '2. Kıraat Türü / Mushaf',
    select_surah_label: '3. Sure Seçin',
    available_surahs: 'Mevcut Sureler:',
    empty_placeholder: 'Sureleri görüntülemek için lütfen hafız ve kıraat seçin',
    loading_reciters: 'Hafızlar yükleniyor...',
    select_reciter_first: 'Önce hafız seçin...',
    footer_copyright: '© 2026 Kuran Web Radyosu. Tüm hakları saklıdır.',
    footer_link: 'Resmi Web Sitesi MP3Quran',
    footer_update: 'API v3 ile otomatik güncellenir',
    now_playing_loading: 'Yayın yükleniyor...',
    please_wait: 'Lütfen bekleyin',
    prev_track: 'Önceki Sure / Önceki İstasyon',
    play_pause: 'Oynat / Duraklat',
    next_track: 'Sonraki Sure / Sonraki İstasyon',
    mute_btn: 'Sessiz',
    volume_slider: 'Ses Seviyesi',
    live_mode: 'Canlı',
    library_mode: 'Kıraat',
    live_subtitle: 'Kesintisiz canlı yayın',
    no_radios_found: 'Aramaya uygun radyo istasyonu bulunamadı',
    no_surahs_found: 'Aramaya uygun sure bulunamadı',
    live_badge: 'Canlı',
    meccan: 'Mekki',
    medinan: 'Medeni',
    page: 'Sayfa',
    unknown: 'Bilinmeyen',
    surah: 'Sure',
    error_title: 'Bağlantı Hatası',
    error_subtitle: 'Lütfen internet bağlantınızı kontrol edin',
    buffering: 'Yükleniyor & Arabelleğe alınıyor...',
    playback_failed: 'Yüklenemedi. Yeniden bağlanıyor...',
    form_help_text: 'Bazı hafızlar için birden fazla kıraat mevcuttur (Hafs, Warş, Kalun).'
  },
  id: {
    brand_title: 'Radio Al-Quran',
    brand_subtitle: 'RADIO WEB AL-QURAN & PERPUSTAKAAN AUDIO',
    reset_player: 'Atur Ulang Pemutar',
    reset_player_btn: 'Atur Ulang',
    theme_toggle: 'Ganti Tema',
    select_language: 'Pilih Bahasa',
    visualizer_title: 'Gelombang Lantunan',
    visualizer_label: 'Pemutar Visual',
    visualizer_subtitle: 'Spektrum Audio Interaktif',
    visualizer_fallback: 'Putar audio untuk mengaktifkan visualizer',
    radios_title: 'Stasiun Radio Langsung',
    radios_label: 'Radio & Stasiun',
    radios_subtitle: 'Pilih dari lebih dari 150 siaran langsung',
    preset_cairo: 'Radio Kairo',
    preset_saudi: 'Radio Saudi',
    search_radio_placeholder: 'Cari radio (mis. Kairo, Minshawi)...',
    search_reciter_placeholder: 'Cari qari...',
    search_surah_placeholder: 'Cari surah berdasarkan nama...',
    library_badge: 'Perpustakaan Audio Lengkap',
    library_status: 'Tersambung ke API & Diperbarui',
    library_title: 'Mendengarkan Sesuai Permintaan',
    library_subtitle: 'Cari qari favorit Anda, pilih riwayat/edisi dan surah.',
    select_reciter_label: '1. Pilih Qari',
    select_edition_label: '2. Edisi / Riwayat',
    select_surah_label: '3. Pilih Surah',
    available_surahs: 'Surah Tersedia:',
    empty_placeholder: 'Silakan pilih qari dan edisi untuk menampilkan surah',
    loading_reciters: 'Memuat qari...',
    select_reciter_first: 'Pilih qari terlebih dahulu...',
    footer_copyright: '© 2026 Radio Web Al-Quran. Hak cipta dilindungi undang-undang.',
    footer_link: 'Situs Resmi MP3Quran',
    footer_update: 'Pembaruan otomatis sumber via API v3',
    now_playing_loading: 'Memuat siaran...',
    please_wait: 'Mohon tunggu',
    prev_track: 'Surah Sebelumnya / Stasiun Sebelumnya',
    play_pause: 'Putar / Jeda',
    next_track: 'Surah Berikutnya / Stasiun Berikutnya',
    mute_btn: 'Bisu',
    volume_slider: 'Volume',
    live_mode: 'Langsung',
    library_mode: 'Lantunan',
    live_subtitle: 'Aliran langsung berkelanjutan',
    no_radios_found: 'Tidak ada stasiun radio yang cocok dengan pencarian',
    no_surahs_found: 'Tidak ada surah yang cocok dengan pencarian',
    live_badge: 'Langsung',
    meccan: 'Makkiyah',
    medinan: 'Madaniyah',
    page: 'Halaman',
    unknown: 'Tidak Diketahui',
    surah: 'Surah',
    error_title: 'Kesalahan Koneksi',
    error_subtitle: 'Silakan periksa koneksi internet Anda',
    buffering: 'Memuat & menyangga...',
    playback_failed: 'Gagal memuat audio. Menghubungkan kembali...',
    form_help_text: 'Tersedia beberapa riwayat untuk sebagian qari (Hafs, Warsh, Qaloon).'
  },
  ms: {
    brand_title: 'Radio Al-Quran',
    brand_subtitle: 'RADIO WEB AL-QURAN & PERPUSTAKAAN AUDIO',
    reset_player: 'Set Semula Pemain',
    reset_player_btn: 'Set Semula',
    theme_toggle: 'Tukar Tema',
    select_language: 'Pilih Bahasa',
    visualizer_title: 'Gelombang Bacaan',
    visualizer_label: 'Pemain Visual',
    visualizer_subtitle: 'Spektrum Audio Interaktif',
    visualizer_fallback: 'Mainkan audio untuk mengaktifkan visualizer',
    radios_title: 'Stesen Radio Langsung',
    radios_label: 'Radio & Stesen',
    radios_subtitle: 'Pilih daripada lebih 150 siaran langsung',
    preset_cairo: 'Radio Kaherah',
    preset_saudi: 'Radio Saudi',
    search_radio_placeholder: 'Cari radio (cth. Kaherah, Minshawi)...',
    search_reciter_placeholder: 'Cari qari...',
    search_surah_placeholder: 'Cari surah mengikut nama...',
    library_badge: 'Perpustakaan Audio Lengkap',
    library_status: 'Bersambung ke API & Dikemas kini',
    library_title: 'Mendengar Sesuai Permintaan',
    library_subtitle: 'Cari qari kegemaran anda, pilih riwayat/edisi dan surah.',
    select_reciter_label: '1. Pilih Qari',
    select_edition_label: '2. Edisi / Riwayat',
    select_surah_label: '3. Pilih Surah',
    available_surahs: 'Surah Tersedia:',
    empty_placeholder: 'Sila pilih qari dan edisi untuk memaparkan surah',
    loading_reciters: 'Memuatkan qari...',
    select_reciter_first: 'Pilih qari terlebih dahulu...',
    footer_copyright: '© 2026 Radio Web Al-Quran. Hak cipta terpelihara.',
    footer_link: 'Laman Web Rasmi MP3Quran',
    footer_update: 'Kemas kini sumber automatik melalui API v3',
    now_playing_loading: 'Memuatkan siaran...',
    please_wait: 'Sila tunggu',
    prev_track: 'Surah Sebelumnya / Stesen Sebelumnya',
    play_pause: 'Main / Jeda',
    next_track: 'Surah Seterusnya / Stesen Seterusnya',
    mute_btn: 'Senyap',
    volume_slider: 'Kelantangan',
    live_mode: 'Langsung',
    library_mode: 'Bacaan',
    live_subtitle: 'Aliran langsung berterusan',
    no_radios_found: 'Tiada stesen radio yang sepadan dengan carian',
    no_surahs_found: 'Tiada surah yang sepadan dengan carian',
    live_badge: 'Langsung',
    meccan: 'Makkiyah',
    medinan: 'Madaniyah',
    page: 'Halaman',
    unknown: 'Tidak Diketahui',
    surah: 'Surah',
    error_title: 'Ralat Sambungan',
    error_subtitle: 'Sila periksa sambungan internet anda',
    buffering: 'Memuatkan & menimbal...',
    playback_failed: 'Gagal memuatkan audio. Menyambung semula...',
    form_help_text: 'Terdapat beberapa riwayat untuk sesetengah qari (Hafs, Warsh, Qaloon).'
  }
};

// SVG Line Icons Templates
const SVG_PLAY = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>`;
const SVG_PAUSE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="4" x2="18" y2="20"></line><line x1="6" y1="4" x2="6" y2="20"></line></svg>`;
const SVG_RADIO = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"></circle><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path></svg>`;
const SVG_DISC = `<svg class="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 1.35rem; height: 1.35rem;"><circle cx="12" cy="12" r="10"></circle><path d="M12 6a6 6 0 1 0 6 6"></path></svg>`;
const SVG_VOLUME = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>`;
const SVG_MUTE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`;
const SVG_PLAY_CIRCLE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>`;
const SVG_PAUSE_CIRCLE = `<svg class="animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="10" y1="15" x2="10" y2="9"></line><line x1="14" y1="15" x2="14" y2="9"></line></svg>`;
const SVG_EXCLAMATION = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
const SVG_SEARCH_MINUS = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>`;

// Application State
let state = {
  suwarMap: {},        // Map of surahId -> surahName
  suwarList: [],       // Raw surah list for details
  radios: [],          // Array of all radio stations
  reciters: [],        // Array of all reciters
  filteredRadios: [],  // Filtered radio list for rendering
  filteredReciters: [],// Filtered reciters list for rendering
  selectedLang: 'ar',  // Active selected language


  // Audio Player State
  activePlayerMode: 'live', // 'live' or 'library'
  activeRadio: null,       // Currently playing radio object
  selectedReciter: null,   // Selected reciter object
  selectedMoshaf: null,    // Selected moshaf/edition object
  selectedSurahId: null,   // Currently playing surah ID (integer)
  selectedSurahsList: [],  // List of surah IDs available for current moshaf

  // Audio Graph
  audioContext: null,
  analyserNode: null,
  sourceNode: null,
  isAudioGraphInit: false
};

// DOM Elements
const domAudioPlayer = document.getElementById('audio-player');
const radioAudioPlayer = document.createElement('audio');
radioAudioPlayer.id = 'radio-audio-player';
document.body.appendChild(radioAudioPlayer);

// A Transparent JS Proxy wrapper that routes all controls/attributes to the active player
// (radioAudioPlayer for live streams, domAudioPlayer for library surahs).
// This completely resolves browser CORS muting of Icecast live streams in AudioContext.
const audioPlayer = new Proxy({}, {
  get(target, prop) {
    if (prop === 'addEventListener') {
      return function (type, listener, options) {
        domAudioPlayer.addEventListener(type, listener, options);
        radioAudioPlayer.addEventListener(type, listener, options);
      };
    }
    if (prop === 'removeEventListener') {
      return function (type, listener, options) {
        domAudioPlayer.removeEventListener(type, listener, options);
        radioAudioPlayer.removeEventListener(type, listener, options);
      };
    }
    const active = state.activePlayerMode === 'live' ? radioAudioPlayer : domAudioPlayer;
    const value = active[prop];
    if (typeof value === 'function') {
      return value.bind(active);
    }
    return value;
  },
  set(target, prop, value) {
    const active = state.activePlayerMode === 'live' ? radioAudioPlayer : domAudioPlayer;
    active[prop] = value;
    return true;
  }
});
const playPauseBtn = document.getElementById('play-pause-btn');
const playPauseIcon = document.getElementById('play-pause-icon');
const prevTrackBtn = document.getElementById('prev-track-btn');
const nextTrackBtn = document.getElementById('next-track-btn');
const muteBtn = document.getElementById('mute-btn');
const muteIcon = document.getElementById('mute-icon');
const volumeSlider = document.getElementById('volume-slider');
const volumeValue = document.getElementById('volume-value');
const resetPlayerBtn = document.getElementById('reset-player-btn');

// Status Badges & Text
const playerModeBadge = document.getElementById('player-mode-badge');
const nowPlayingTitle = document.getElementById('now-playing-title');
const nowPlayingSubtitle = document.getElementById('now-playing-subtitle');
const playerStatusIcon = document.getElementById('player-status-icon');

// Visualizer container wrapper for CSS animation hooks
const visualizerBox = document.getElementById('visualizer-container-box');

// Timeline Components
const timelineContainer = document.getElementById('timeline-container');
const progressBar = document.getElementById('progress-bar');
const timeCurrent = document.getElementById('time-current');
const timeTotal = document.getElementById('time-total');

// Search & Dropdown Elements
const radioSearchInput = document.getElementById('radio-search-input');
const radiosListContainer = document.getElementById('radios-list-container');
const reciterSearchInput = document.getElementById('reciter-search-input');
const recitersDropdown = document.getElementById('reciters-dropdown');
const moshafDropdown = document.getElementById('moshaf-dropdown');
const surahSearchInput = document.getElementById('surah-search-input');
const surahsGridContainer = document.getElementById('surahs-grid-container');
const surahCountBadge = document.getElementById('surah-count-badge');
const libraryStatusBadge = document.getElementById('library-status-badge');

// Canvas Visualizer
const canvas = document.getElementById('visualizer');
const canvasCtx = canvas.getContext('2d');
const visualizerFallback = document.getElementById('visualizer-fallback');
let animationFrameId = null;

// Initialize Web App
window.addEventListener('DOMContentLoaded', init);

/**
 * Main Initialization Routine
 */
async function init() {
  initLanguage();
  initTheme();
  setupCanvas();
  restoreVolumeSettings();
  setupAudioListeners();
  setupUIEventListeners();
  drawIdleVisualizer();

  try {
    // 1. Fetch Surah Details (Suwar)
    await fetchSuwar();
    // 2. Fetch Radio Streams
    await fetchRadios();
    // 3. Fetch Reciters
    await fetchReciters();

    // Show API online badge
    libraryStatusBadge.style.display = 'inline-flex';

    // Choose and play a default radio station
    loadDefaultRadio();
  } catch (error) {
    console.error('Initialization error:', error);
    const errTitle = translations[state.selectedLang]['error_title'] || 'Connection Error';
    const errSub = translations[state.selectedLang]['error_subtitle'] || 'Please check your internet connection';
    nowPlayingTitle.textContent = errTitle;
    nowPlayingSubtitle.textContent = errSub;
  }
}

/**
 * Initialize Multi-Language System
 */
function initLanguage() {
  const langSelect = document.getElementById('lang-select');
  const supportedLangs = ['ar', 'en', 'fr', 'ur', 'tr', 'id', 'ms'];

  // Choose fallback hierarchy: saved preference -> browser locale -> Arabic (ar) fallback
  const browserLang = navigator.language ? navigator.language.split('-')[0].toLowerCase() : 'ar';
  const savedLang = localStorage.getItem('quran_radio_lang');
  let startLang = 'ar';

  if (savedLang && supportedLangs.includes(savedLang)) {
    startLang = savedLang;
  } else if (supportedLangs.includes(browserLang)) {
    startLang = browserLang;
  }

  state.selectedLang = startLang;
  if (langSelect) {
    langSelect.value = startLang;
  }

  applyTranslations(startLang);
  updateLangSelectLabels();

  if (langSelect) {
    langSelect.addEventListener('change', async (e) => {
      const selected = e.target.value;
      state.selectedLang = selected;

      // Update directions, tooltips, static UI texts instantly
      applyTranslations(selected);
      updateLangSelectLabels();
      showLoadersOnLangSwitch();

      try {
        // Fetch translated lists (or load from local memory cache)
        await fetchSuwar();
        await fetchRadios();
        await fetchReciters();

        // Update lists and dropdown contents dynamically
        updateDynamicUI();
      } catch (err) {
        console.error('Error reloading language APIs:', err);
      }
    });
  }
}

/**
 * Apply DOM translations and directional adjustments
 */
function applyTranslations(lang) {
  const isRtl = (lang === 'ar' || lang === 'ur');
  document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lang);

  // Update language selector wrapper direction to match selected language direction
  const langSelectWrapper = document.querySelector('.lang-select-wrapper');
  if (langSelectWrapper) {
    langSelectWrapper.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
  }

  localStorage.setItem('quran_radio_lang', lang);

  // Element Text translations
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      const dot = el.querySelector('.badge-dot');
      if (dot) {
        el.innerHTML = '';
        el.appendChild(dot);
        el.appendChild(document.createTextNode(translations[lang][key]));
      } else {
        el.textContent = translations[lang][key];
      }
    }
  });

  // Element Placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[lang] && translations[lang][key]) {
      el.placeholder = translations[lang][key];
    }
  });

  // Element Tooltips / Titles
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (translations[lang] && translations[lang][key]) {
      el.title = translations[lang][key];
    }
  });
}

/**
 * Dynamically switch language selector labels between short codes (mobile) and full names (desktop)
 */
function updateLangSelectLabels() {
  const langSelect = document.getElementById('lang-select');
  if (!langSelect) return;

  const labels = {
    ar: 'العربية',
    en: 'English',
    fr: 'Français',
    ur: 'اردو',
    tr: 'Türkçe',
    id: 'Bahasa Indonesia',
    ms: 'Bahasa Melayu'
  };

  Array.from(langSelect.options).forEach(opt => {
    const lang = opt.value;
    if (labels[lang]) {
      opt.textContent = labels[lang];
    }
  });
}

/**
 * Show temporary skeleton states during language API reload
 */
function showLoadersOnLangSwitch() {
  radiosListContainer.innerHTML = `
    <div class="shimmer-card"></div>
    <div class="shimmer-card"></div>
    <div class="shimmer-card"></div>
  `;

  recitersDropdown.disabled = true;
  moshafDropdown.disabled = true;
  surahSearchInput.disabled = true;

  const loadingText = translations[state.selectedLang]['loading_reciters'] || 'Loading...';
  recitersDropdown.innerHTML = `<option value="" disabled selected>${loadingText}</option>`;
}

/**
 * Refresh lists, dropdown options, and currently active playing titles
 */
function updateDynamicUI() {
  populateRadiosSidebar();
  populateRecitersDropdown();

  if (state.selectedReciter) {
    const updatedReciter = state.reciters.find(r => r.id === state.selectedReciter.id);
    if (updatedReciter) {
      state.selectedReciter = updatedReciter;
      recitersDropdown.value = updatedReciter.id;

      moshafDropdown.disabled = false;
      moshafDropdown.innerHTML = '';
      updatedReciter.moshaf.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.name;
        moshafDropdown.appendChild(opt);
      });

      if (state.selectedMoshaf) {
        const updatedMoshaf = updatedReciter.moshaf.find(m => m.id === state.selectedMoshaf.id);
        if (updatedMoshaf) {
          state.selectedMoshaf = updatedMoshaf;
          moshafDropdown.value = updatedMoshaf.id;
          surahSearchInput.disabled = false;
          populateSurahsGrid();
        }
      }
    }
  }

  // Update current player state text
  if (state.activePlayerMode === 'live' && state.activeRadio) {
    const updatedRadio = state.radios.find(r => r.id === state.activeRadio.id);
    if (updatedRadio) {
      state.activeRadio = updatedRadio;
      nowPlayingTitle.textContent = updatedRadio.name;
    }
  } else if (state.activePlayerMode === 'library' && state.selectedSurahId) {
    const metadata = state.suwarMap[state.selectedSurahId] || { name: `Surah ${state.selectedSurahId}` };
    const surahPrefix = translations[state.selectedLang]['surah'] || 'Surah';
    nowPlayingTitle.textContent = `${surahPrefix} ${metadata.name}`;

    if (state.selectedReciter && state.selectedMoshaf) {
      nowPlayingSubtitle.textContent = `${state.selectedReciter.name} (${state.selectedMoshaf.name})`;
    }
  }
}


/**
 * Initialize Light/Dark Theme Switcher
 */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const sunIcon = themeToggleBtn.querySelector('.sun-icon');
  const moonIcon = themeToggleBtn.querySelector('.moon-icon');

  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('quran_radio_theme', theme);
    if (theme === 'dark') {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    } else {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    }
  };

  // Check saved setting or prefers-color-scheme system defaults
  const savedTheme = localStorage.getItem('quran_radio_theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  setTheme(initialTheme);

  // Button toggle action
  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });
}

/**
 * Handle Canvas dimensions
 */
function setupCanvas() {
  const resizeCanvas = () => {
    // Set internal resolution matching element size * device pixel ratio for crisp rendering
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvasCtx.scale(dpr, dpr);
  };

  resizeCanvas();
  window.addEventListener('resize', () => {
    resizeCanvas();
    updateLangSelectLabels();
  });
}

/**
 * Volume state initialization
 */
function restoreVolumeSettings() {
  const savedVolume = localStorage.getItem('quran_radio_volume');
  if (savedVolume !== null) {
    const vol = parseFloat(savedVolume);
    audioPlayer.volume = vol;
    volumeSlider.value = Math.round(vol * 100);
    volumeValue.textContent = `${Math.round(vol * 100)}%`;
  } else {
    audioPlayer.volume = 0.8;
  }
}

/**
 * Setup Event Listeners for HTML5 Audio Element
 */
function setupAudioListeners() {
  // We set crossOrigin dynamically per-source to allow CORS fallbacks

  audioPlayer.addEventListener('play', () => {
    playPauseIcon.innerHTML = SVG_PAUSE;

    // Add layout and design breathing animation markers
    visualizerBox.classList.add('playing');
    document.body.classList.add('is-playing');

    playerStatusIcon.classList.add('animate-pulse');
    if (state.activePlayerMode === 'live') {
      playerStatusIcon.innerHTML = SVG_RADIO;
    } else {
      playerStatusIcon.innerHTML = SVG_DISC;
    }

    // Trigger visualizer
    if (state.isAudioGraphInit) {
      drawLiveVisualizer();
    }
  });

  audioPlayer.addEventListener('pause', () => {
    playPauseIcon.innerHTML = SVG_PLAY;
    playerStatusIcon.innerHTML = SVG_RADIO;

    // Remove design breathing animation markers
    visualizerBox.classList.remove('playing');
    document.body.classList.remove('is-playing');

    playerStatusIcon.classList.remove('animate-pulse');
  });

  audioPlayer.addEventListener('timeupdate', () => {
    if (state.activePlayerMode === 'library' && audioPlayer.duration) {
      const current = audioPlayer.currentTime;
      const duration = audioPlayer.duration;
      progressBar.value = (current / duration) * 100;
      timeCurrent.textContent = formatTime(current);
    }
  });

  audioPlayer.addEventListener('durationchange', () => {
    if (state.activePlayerMode === 'library' && audioPlayer.duration) {
      timeTotal.textContent = formatTime(audioPlayer.duration);
    }
  });

  audioPlayer.addEventListener('ended', () => {
    // When in library mode, auto-advance to next Surah
    if (state.activePlayerMode === 'library') {
      playNextSurah();
    } else {
      // Reconnect live stream if connection dropped
      audioPlayer.load();
      audioPlayer.play().catch(err => console.log('Live reconnect failed: ', err));
    }
  });

  audioPlayer.addEventListener('waiting', () => {
    nowPlayingSubtitle.textContent = translations[state.selectedLang]['buffering'] || 'Loading & buffering...';
  });

  audioPlayer.addEventListener('playing', () => {
    if (state.activePlayerMode === 'live') {
      nowPlayingSubtitle.textContent = translations[state.selectedLang]['live_subtitle'] || 'Continuous live stream';
    } else if (state.selectedReciter && state.selectedMoshaf) {
      nowPlayingSubtitle.textContent = `${state.selectedReciter.name} (${state.selectedMoshaf.name})`;
    }
  });

  audioPlayer.addEventListener('error', (e) => {
    console.error('Audio playback error:', e);

    // If loading failed and crossOrigin was anonymous, try loading without crossOrigin as a fallback
    if (audioPlayer.crossOrigin === "anonymous") {
      console.warn("CORS playback failed. Retrying without CORS...");
      audioPlayer.removeAttribute('crossorigin');
      const currentSrc = audioPlayer.src;
      audioPlayer.src = currentSrc;
      audioPlayer.load();
      audioPlayer.play().catch(err => console.log('Fallback playback failed:', err));
      return;
    }

    nowPlayingSubtitle.textContent = translations[state.selectedLang]['playback_failed'] || 'Audio load failed. Reconnecting...';
  });
}

/**
 * Setup Controls & Dropdown Listeners
 */
function setupUIEventListeners() {
  // Play/Pause button
  playPauseBtn.addEventListener('click', togglePlay);

  // Mute button
  muteBtn.addEventListener('click', toggleMute);

  // Volume slider
  volumeSlider.addEventListener('input', (e) => {
    const vol = e.target.value / 100;
    audioPlayer.volume = vol;
    volumeValue.textContent = `${e.target.value}%`;
    localStorage.setItem('quran_radio_volume', vol);
    updateMuteIcon(vol === 0);
  });

  // Timeline Progress seeking
  progressBar.addEventListener('input', (e) => {
    if (state.activePlayerMode === 'library' && audioPlayer.duration) {
      const seekTime = (e.target.value / 100) * audioPlayer.duration;
      audioPlayer.currentTime = seekTime;
    }
  });

  // Next / Previous buttons
  nextTrackBtn.addEventListener('click', handleNextBtn);
  prevTrackBtn.addEventListener('click', handlePrevBtn);

  // Reset player
  resetPlayerBtn.addEventListener('click', () => {
    audioPlayer.pause();
    loadDefaultRadio();
  });

  // Radio Search Input
  radioSearchInput.addEventListener('input', (e) => {
    filterRadiosList(e.target.value);
  });

  // Quick Access Presets
  document.querySelectorAll('.quick-radio-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-radio-id');
      handleQuickRadioPreset(type);
    });
  });

  // Reciter Search & Dropdown
  reciterSearchInput.addEventListener('input', (e) => {
    filterRecitersList(e.target.value);
  });

  recitersDropdown.addEventListener('change', (e) => {
    const reciterId = parseInt(e.target.value);
    const reciter = state.reciters.find(r => r.id === reciterId);
    if (reciter) {
      handleReciterSelect(reciter);
    }
  });

  // Moshaf Selection dropdown
  moshafDropdown.addEventListener('change', (e) => {
    const moshafId = parseInt(e.target.value);
    if (state.selectedReciter) {
      const moshaf = state.selectedReciter.moshaf.find(m => m.id === moshafId);
      if (moshaf) {
        handleMoshafSelect(moshaf);
      }
    }
  });

  // Surah search filter
  surahSearchInput.addEventListener('input', (e) => {
    filterSurahsGrid(e.target.value);
  });

  // Auto-hide header on scroll-down
  setupHeaderScrollBehavior();
}

/**
 * Auto-hide header on scroll down, show on scroll up.
 */
function setupHeaderScrollBehavior() {
  const header = document.querySelector('.app-header');
  if (!header) return;

  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    // Prevent issues with negative scroll on iOS elastic scroll
    if (currentScrollY <= 0) {
      header.classList.remove('header-hidden');
      lastScrollY = currentScrollY;
      return;
    }

    // Hide header on scroll down, show on scroll up
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      header.classList.add('header-hidden');
    } else if (currentScrollY < lastScrollY) {
      header.classList.remove('header-hidden');
    }

    lastScrollY = currentScrollY;
  }, { passive: true });
}

/**
 * API Fetches
 */
async function fetchSuwar() {
  const url = getAPIUrl(API_BASE_SUWAR, state.selectedLang);
  const data = await fetchAPIWithCache(url);
  if (data && data.suwar) {
    state.suwarList = data.suwar;
    state.suwarMap = {};
    data.suwar.forEach(surah => {
      state.suwarMap[surah.id] = {
        name: surah.name.trim(),
        isMeccan: surah.makkia === 1,
        startPage: surah.start_page
      };
    });
  }
}

async function fetchRadios() {
  const url = getAPIUrl(API_BASE_RADIOS, state.selectedLang);
  const data = await fetchAPIWithCache(url);
  if (data && data.radios) {
    // Keywords for content to filter out (Quran-only constraint)
    const nonQuranKeywords = [
      'تفسير', 'tafsir', 'فتاوى', 'fatawa', 'سيرة', 'biography', 'السيرة',
      'أذكار', 'adhkar', 'الرقية', 'ruqyah', 'صحيح', 'sahih', 'البخاري',
      'مسلم', 'رياض الصالحين', 'تكبيرات', 'قصص', 'الشمائل', 'كتاب',
      'ترجمة', 'معاني', 'translation'
    ];
    state.radios = data.radios.filter(radio => {
      const name = radio.name.toLowerCase();
      return !nonQuranKeywords.some(keyword => name.includes(keyword));
    });
    state.filteredRadios = [...state.radios];
    populateRadiosSidebar();
  }
}

async function fetchReciters() {
  const url = getAPIUrl(API_BASE_RECITERS, state.selectedLang);
  const data = await fetchAPIWithCache(url);
  if (data && data.reciters) {
    const nonQuranKeywords = ['ترجمة', 'translation', 'تفسير', 'tafsir', 'معاني', 'meanings', 'كتاب'];

    // Filter reciter's moshafs to keep only pure recitation Quran editions
    const filteredReciters = data.reciters.map(reciter => {
      if (!reciter.moshaf) return null;
      const moshafs = reciter.moshaf.filter(m => {
        const mName = m.name.toLowerCase();
        return !nonQuranKeywords.some(kw => mName.includes(kw));
      });
      if (moshafs.length === 0) return null;
      return {
        ...reciter,
        moshaf: moshafs
      };
    }).filter(r => r !== null);

    // Alphabetical sort suited for active language script (Arabic/Urdu vs LTR Latin)
    const sortLocale = (state.selectedLang === 'ar' || state.selectedLang === 'ur') ? state.selectedLang : 'en';
    state.reciters = filteredReciters.sort((a, b) => a.name.localeCompare(b.name, sortLocale));
    state.filteredReciters = [...state.reciters];
    populateRecitersDropdown();
  }
}

/**
 * Generic JSON Fetch Wrapper
 */
async function fetchAPI(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch from endpoint: ${url}`, error);
    throw error;
  }
}

/**
 * UI Population: Radios Sidebar
 */
function populateRadiosSidebar() {
  radiosListContainer.innerHTML = '';

  if (state.filteredRadios.length === 0) {
    const noRadiosText = translations[state.selectedLang]['no_radios_found'] || 'No radio stations found';
    radiosListContainer.innerHTML = `
      <div class="empty-placeholder" style="padding: 1.5rem 1rem; border: none; grid-column: 1 / -1;">
        ${SVG_EXCLAMATION}
        <p>${noRadiosText}</p>
      </div>`;
    return;
  }

  state.filteredRadios.forEach(radio => {
    const isActive = state.activePlayerMode === 'live' && state.activeRadio && state.activeRadio.id === radio.id;

    const radioBtn = document.createElement('button');
    radioBtn.className = `station-btn ${isActive ? 'active' : ''}`;

    const liveText = translations[state.selectedLang]['live_badge'] || 'Live';
    radioBtn.innerHTML = `
      <div class="station-btn-content">
        <div class="station-btn-icon">
          ${isActive ? SVG_VOLUME : SVG_RADIO}
        </div>
        <span>${radio.name}</span>
      </div>
      ${isActive ? `<span class="badge badge-danger animate-pulse"><span class="badge-dot"></span>${liveText}</span>` : ''}
    `;

    radioBtn.addEventListener('click', () => {
      loadRadioStream(radio);
    });

    radiosListContainer.appendChild(radioBtn);
  });
}

/**
 * UI Population: Reciters Dropdown
 */
function populateRecitersDropdown() {
  const placeholderText = translations[state.selectedLang]['select_reciter_first'] || 'Select reciter...';
  recitersDropdown.innerHTML = `<option value="" disabled selected>${placeholderText}</option>`;

  state.filteredReciters.forEach(reciter => {
    const opt = document.createElement('option');
    opt.value = reciter.id;
    opt.textContent = reciter.name;
    recitersDropdown.appendChild(opt);
  });
}

/**
 * Load Default Radio on Start
 */
function loadDefaultRadio() {
  if (state.radios.length > 0) {
    let defaultRadio = state.radios.find(r => r.name.includes('القاهرة') || r.name.toLowerCase().includes('cairo') || r.name.toLowerCase().includes('qahira'));
    if (!defaultRadio) defaultRadio = state.radios[0];

    loadRadioStream(defaultRadio, false); // Do not autoplay on initial page load
  }
}

/**
 * Handle Selection of Quick Radio Buttons
 */
function handleQuickRadioPreset(type) {
  let targetRadio = null;
  if (type === 'minshawi') {
    // Search for Al-Minshawi (Mohammed Siddiq Al-Minshawi) — iconic Egyptian reciter in the API
    targetRadio = state.radios.find(r =>
      r.name.includes('المنشاوي') ||
      r.name.includes('منشاوي') ||
      r.name.toLowerCase().includes('minshawi') ||
      r.name.toLowerCase().includes('alminshawi') ||
      r.name.toLowerCase().includes('siddiq')
    );
  } else if (type === 'saudi') {
    targetRadio = state.radios.find(r =>
      r.name.includes('السعودية') ||
      r.name.includes('السعودي') ||
      r.name.includes('المملكة') ||
      r.name.includes('سعودية') ||
      r.name.includes('الحرمين') ||
      r.name.toLowerCase().includes('saudi') ||
      r.name.toLowerCase().includes('haramain')
    );
  }

  if (targetRadio) {
    loadRadioStream(targetRadio);

    // Clear search filter & rebuild list to show playing
    radioSearchInput.value = '';
    state.filteredRadios = [...state.radios];
    populateRadiosSidebar();
  }
}

/**
 * Load and Play Live Radio Stream
 */
function loadRadioStream(radio, autoplay = true) {
  state.activePlayerMode = 'live';

  // Pause the library player to prevent overlapping audio
  domAudioPlayer.pause();

  state.activeRadio = radio;
  state.selectedReciter = null;
  state.selectedMoshaf = null;
  state.selectedSurahId = null;

  // UI updates
  playerModeBadge.className = 'badge badge-danger';
  const liveModeText = translations[state.selectedLang]['live_mode'] || 'Live';
  playerModeBadge.innerHTML = `<span class="badge-dot animate-pulse"></span>${liveModeText}`;

  nowPlayingTitle.textContent = radio.name;
  nowPlayingSubtitle.textContent = translations[state.selectedLang]['live_subtitle'] || 'Continuous live stream';


  timelineContainer.style.display = 'none'; // Hide progress bar during live streams

  // Disable CORS for live streams as Icecast/Shoutcast servers often have compatibility issues with Origin headers
  audioPlayer.removeAttribute('crossorigin');
  audioPlayer.src = radio.url;
  audioPlayer.load();

  if (autoplay) {
    playAudio();
  } else {
    // Show static idle state when not autoplaying on start
    drawIdleVisualizer();
    playPauseIcon.innerHTML = SVG_PLAY;
    visualizerBox.classList.remove('playing');
    document.body.classList.remove('is-playing');
  }

  // Highlight active radio in lists
  populateRadiosSidebar();
}

/**
 * Handle Reciter Selection
 */
function handleReciterSelect(reciter) {
  state.selectedReciter = reciter;

  // Re-enable/populate Moshaf dropdown
  moshafDropdown.disabled = false;
  moshafDropdown.innerHTML = '';

  reciter.moshaf.forEach((m, idx) => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.name;
    if (idx === 0) opt.selected = true;
    moshafDropdown.appendChild(opt);
  });

  // Select the first moshaf by default
  if (reciter.moshaf.length > 0) {
    handleMoshafSelect(reciter.moshaf[0]);
  }
}

/**
 * Handle Moshaf / Narration style Selection
 */
function handleMoshafSelect(moshaf) {
  state.selectedMoshaf = moshaf;

  // Enable surah search
  surahSearchInput.disabled = false;
  surahSearchInput.value = '';

  // Parse surah list from comma-separated values
  state.selectedSurahsList = moshaf.surah_list.split(',').map(idStr => parseInt(idStr.trim()));

  // Update surah count badge
  surahCountBadge.textContent = state.selectedSurahsList.length;

  // Build grid
  populateSurahsGrid();
}

/**
 * Populate Surahs Grid Based on Selected Moshaf
 */
function populateSurahsGrid(filterText = '') {
  surahsGridContainer.innerHTML = '';

  const surahLabel = translations[state.selectedLang]['surah'] || 'Surah';

  const matchedSurahs = state.selectedSurahsList.filter(id => {
    const name = state.suwarMap[id]?.name || `${surahLabel} ${id}`;
    return name.includes(filterText);
  });

  if (matchedSurahs.length === 0) {
    const noSurahsText = translations[state.selectedLang]['no_surahs_found'] || 'No surahs found';
    surahsGridContainer.innerHTML = `
      <div class="empty-placeholder" style="padding: 1.5rem 1rem;">
        ${SVG_SEARCH_MINUS}
        <p>${noSurahsText}</p>
      </div>`;
    return;
  }

  matchedSurahs.forEach(id => {
    const metadata = state.suwarMap[id] || { name: `${surahLabel} ${id}`, isMeccan: true };
    const isPlaying = state.activePlayerMode === 'library'
      && state.selectedReciter?.id === state.selectedReciter?.id
      && state.selectedMoshaf?.id === state.selectedMoshaf?.id
      && state.selectedSurahId === id;

    const surahCard = document.createElement('button');
    surahCard.className = `surah-card ${isPlaying ? 'active' : ''}`;

    const typeLabel = metadata.isMeccan ?
      (translations[state.selectedLang]['meccan'] || 'Meccan') :
      (translations[state.selectedLang]['medinan'] || 'Medinan');
    const pageLabel = translations[state.selectedLang]['page'] || 'Page';
    const unknownLabel = translations[state.selectedLang]['unknown'] || 'Unknown';
    const pageText = `${pageLabel} ${metadata.startPage || unknownLabel}`;

    surahCard.innerHTML = `
      <div class="surah-info-group">
        <div class="surah-num">
          ${id}
        </div>
        <div class="surah-meta">
          <span class="surah-name">${metadata.name}</span>
          <span class="surah-type-page">${typeLabel} - ${pageText}</span>
        </div>
      </div>
      <div class="surah-action-icon">
        ${isPlaying ? SVG_PAUSE_CIRCLE : SVG_PLAY_CIRCLE}
      </div>
    `;

    surahCard.addEventListener('click', () => {
      if (isPlaying) {
        togglePlay();
      } else {
        loadSurah(id);
      }
    });

    surahsGridContainer.appendChild(surahCard);
  });
}

/**
 * Load and Play selected Surah from Library
 */
function loadSurah(surahId) {
  if (!state.selectedReciter || !state.selectedMoshaf) return;

  state.activePlayerMode = 'library';

  // Pause the live player to prevent overlapping audio
  radioAudioPlayer.pause();

  state.selectedSurahId = surahId;
  state.activeRadio = null;

  const surahLabel = translations[state.selectedLang]['surah'] || 'Surah';
  const metadata = state.suwarMap[surahId] || { name: `${surahLabel} ${surahId}` };
  const paddedId = String(surahId).padStart(3, '0');

  // Construct direct MP3 URL
  const server = state.selectedMoshaf.server;
  const audioUrl = `${server}${paddedId}.mp3`;

  // UI updates
  playerModeBadge.className = 'badge badge-success';
  const libraryModeText = translations[state.selectedLang]['library_mode'] || 'Recitation';
  playerModeBadge.innerHTML = `<span class="badge-dot animate-pulse"></span>${libraryModeText}`;

  nowPlayingTitle.textContent = `${surahLabel} ${metadata.name}`;
  nowPlayingSubtitle.textContent = `${state.selectedReciter.name} (${state.selectedMoshaf.name})`;

  // Display and reset timeline progress - use 'flex' to match bottom bar layout
  timelineContainer.style.display = 'flex';
  progressBar.value = 0;
  timeCurrent.textContent = '00:00';
  timeTotal.textContent = '00:00';

  // Attempt CORS first to get visualizer, fallback to no-CORS on error
  audioPlayer.crossOrigin = "anonymous";
  audioPlayer.src = audioUrl;
  audioPlayer.load();

  playAudio();

  // Re-render grids to highlight active elements
  populateSurahsGrid(surahSearchInput.value);
  populateRadiosSidebar();
}

/**
 * Play standard audio, initializing AudioContext on first gesture
 */
function playAudio() {
  if (!state.isAudioGraphInit) {
    initAudioGraph();
  }

  if (state.audioContext && state.audioContext.state === 'suspended') {
    state.audioContext.resume().then(() => {
      console.log('AudioContext resumed successfully.');
    }).catch(err => {
      console.warn('Failed to resume AudioContext:', err);
    });
  }

  audioPlayer.play()
    .then(() => {
      // Succeeded
    })
    .catch(err => {
      console.warn('Playback block or fail:', err);
      playPauseIcon.innerHTML = SVG_PLAY;
    });
}

/**
 * Initialize Web Audio API graph for the visualizer
 */
function initAudioGraph() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    state.audioContext = new AudioContextClass();

    state.analyserNode = state.audioContext.createAnalyser();
    state.analyserNode.fftSize = 256;

    state.sourceNode = state.audioContext.createMediaElementSource(domAudioPlayer);
    state.sourceNode.connect(state.analyserNode);
    state.analyserNode.connect(state.audioContext.destination);

    state.isAudioGraphInit = true;
    visualizerFallback.classList.add('hidden');

    drawLiveVisualizer();
  } catch (error) {
    console.error('Failed to init Web Audio API. Visualizer will fallback.', error);
  }
}

/**
 * Toggle Play/Pause state
 */
function togglePlay() {
  if (audioPlayer.paused) {
    playAudio();
  } else {
    audioPlayer.pause();
  }
}

/**
 * Toggle Mute state
 */
function toggleMute() {
  if (audioPlayer.muted) {
    audioPlayer.muted = false;
    const vol = parseFloat(localStorage.getItem('quran_radio_volume') || '0.8');
    volumeSlider.value = Math.round(vol * 100);
    volumeValue.textContent = `${volumeSlider.value}%`;
    updateMuteIcon(false);
  } else {
    audioPlayer.muted = true;
    volumeSlider.value = 0;
    volumeValue.textContent = '0%';
    updateMuteIcon(true);
  }
}

function updateMuteIcon(isMuted) {
  if (isMuted) {
    muteIcon.innerHTML = SVG_MUTE;
    muteIcon.style.color = 'var(--color-danger)';
  } else {
    muteIcon.innerHTML = SVG_VOLUME;
    muteIcon.style.color = 'var(--color-text-secondary)';
  }
}

/**
 * Previous Track click logic
 */
function handlePrevBtn() {
  if (state.activePlayerMode === 'library') {
    playPrevSurah();
  } else {
    // Live mode: play previous radio in the list
    if (state.radios.length > 0 && state.activeRadio) {
      const idx = state.radios.findIndex(r => r.id === state.activeRadio.id);
      const prevIdx = (idx - 1 + state.radios.length) % state.radios.length;
      loadRadioStream(state.radios[prevIdx]);
    }
  }
}

/**
 * Next Track click logic
 */
function handleNextBtn() {
  if (state.activePlayerMode === 'library') {
    playNextSurah();
  } else {
    // Live mode: play next radio in the list
    if (state.radios.length > 0 && state.activeRadio) {
      const idx = state.radios.findIndex(r => r.id === state.activeRadio.id);
      const nextIdx = (idx + 1) % state.radios.length;
      loadRadioStream(state.radios[nextIdx]);
    }
  }
}

/**
 * Library: Play Next Surah (sequential)
 */
function playNextSurah() {
  if (state.selectedSurahsList.length === 0 || state.selectedSurahId === null) return;

  const currentIdx = state.selectedSurahsList.indexOf(state.selectedSurahId);
  if (currentIdx !== -1) {
    const nextIdx = (currentIdx + 1) % state.selectedSurahsList.length;
    const nextSurahId = state.selectedSurahsList[nextIdx];
    loadSurah(nextSurahId);
  }
}

/**
 * Library: Play Previous Surah (sequential)
 */
function playPrevSurah() {
  if (state.selectedSurahsList.length === 0 || state.selectedSurahId === null) return;

  const currentIdx = state.selectedSurahsList.indexOf(state.selectedSurahId);
  if (currentIdx !== -1) {
    const prevIdx = (currentIdx - 1 + state.selectedSurahsList.length) % state.selectedSurahsList.length;
    const prevSurahId = state.selectedSurahsList[prevIdx];
    loadSurah(prevSurahId);
  }
}

/**
 * Search Filters
 */
function filterRadiosList(query) {
  const normQuery = query.trim().toLowerCase();
  state.filteredRadios = state.radios.filter(radio =>
    radio.name.toLowerCase().includes(normQuery)
  );
  populateRadiosSidebar();
}

function filterRecitersList(query) {
  const normQuery = query.trim();
  if (!normQuery) {
    // Empty query: reset to full list
    state.filteredReciters = [...state.reciters];
    populateRecitersDropdown();
    return;
  }

  // Arabic names don't benefit from toLowerCase, so compare both as-is and lowercased
  state.filteredReciters = state.reciters.filter(reciter =>
    reciter.name.toLowerCase().includes(normQuery.toLowerCase()) ||
    reciter.name.includes(normQuery)
  );
  populateRecitersDropdown();

  // If exactly one match, auto-select it for immediate feedback
  if (state.filteredReciters.length === 1) {
    const reciter = state.filteredReciters[0];
    recitersDropdown.value = reciter.id;
    handleReciterSelect(reciter);
  }
}

function filterSurahsGrid(query) {
  populateSurahsGrid(query.trim());
}

/**
 * Drawing: Idle Visualizer (Slight pulsing waves when audio is paused or not loaded)
 */
function drawIdleVisualizer() {
  if (state.isAudioGraphInit && !audioPlayer.paused) return; // Exit if live graph running

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  const draw = () => {
    animationFrameId = requestAnimationFrame(draw);

    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    // Clear canvas - matches background mode
    canvasCtx.fillStyle = isDark ? 'rgba(26, 31, 38, 0.2)' : 'rgba(250, 247, 240, 0.2)';
    canvasCtx.fillRect(0, 0, width, height);

    // Draw peaceful gold waves in center
    canvasCtx.lineWidth = 1.5;
    canvasCtx.strokeStyle = isDark ? 'rgba(201, 162, 39, 0.35)' : 'rgba(201, 162, 39, 0.25)'; // Gold

    canvasCtx.beginPath();
    const time = Date.now() * 0.002;
    for (let i = 0; i < width; i++) {
      const y = height / 2 + Math.sin(i * 0.01 + time) * 8 * Math.cos(i * 0.003);
      if (i === 0) canvasCtx.moveTo(i, y);
      else canvasCtx.lineTo(i, y);
    }
    canvasCtx.stroke();

    // Secondary emerald wave
    canvasCtx.strokeStyle = isDark ? 'rgba(26, 188, 110, 0.25)' : 'rgba(15, 81, 50, 0.15)'; // Emerald
    canvasCtx.beginPath();
    for (let i = 0; i < width; i++) {
      const y = height / 2 + Math.sin(i * 0.015 - time * 0.7) * 5 * Math.sin(i * 0.005);
      if (i === 0) canvasCtx.moveTo(i, y);
      else canvasCtx.lineTo(i, y);
    }
    canvasCtx.stroke();
  };

  draw();
}

/**
 * Drawing: Live Audio Visualizer (Circular Glowing Frequency Ring)
 */
function drawLiveVisualizer() {
  if (!state.isAudioGraphInit) return;

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  const bufferLength = state.analyserNode.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const draw = () => {
    if (audioPlayer.paused) {
      drawIdleVisualizer();
      return;
    }

    animationFrameId = requestAnimationFrame(draw);

    if (state.activePlayerMode === 'live') {
      // Simulate/Generate organic wave frequency data for live streams to avoid flat visualizer
      const time = Date.now() * 0.003;
      for (let i = 0; i < bufferLength; i++) {
        const wave1 = Math.sin(i * 0.15 + time) * 30;
        const wave2 = Math.cos(i * 0.07 - time * 0.5) * 20;
        const wave3 = Math.sin(i * 0.35 + time * 1.5) * 15;
        let val = 45 + wave1 + wave2 + wave3;
        val *= (1 - (i / bufferLength) * 0.5);
        dataArray[i] = Math.max(10, Math.min(255, val));
      }
    } else {
      state.analyserNode.getByteFrequencyData(dataArray);
    }

    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    // Clear Canvas
    canvasCtx.fillStyle = isDark ? 'rgba(26, 31, 38, 0.18)' : 'rgba(250, 247, 240, 0.18)';
    canvasCtx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    // Average frequency to drive ambient glow radius
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    const avg = sum / bufferLength;

    // Dynamic central circle size pulsing with volume/beats
    const baseRadius = Math.min(width, height) * 0.22;
    const pulseRadius = baseRadius + (avg * 0.15);

    // Draw central ambient glow
    const gradientGlow = canvasCtx.createRadialGradient(centerX, centerY, pulseRadius * 0.8, centerX, centerY, pulseRadius * 1.5);
    if (isDark) {
      gradientGlow.addColorStop(0, 'rgba(15, 81, 50, 0.18)'); // Emerald
      gradientGlow.addColorStop(0.5, 'rgba(201, 162, 39, 0.08)'); // Gold
      gradientGlow.addColorStop(1, 'rgba(26, 31, 38, 0)');
    } else {
      gradientGlow.addColorStop(0, 'rgba(15, 81, 50, 0.12)'); // Emerald
      gradientGlow.addColorStop(0.5, 'rgba(201, 162, 39, 0.05)'); // Gold
      gradientGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    }
    canvasCtx.fillStyle = gradientGlow;
    canvasCtx.beginPath();
    canvasCtx.arc(centerX, centerY, pulseRadius * 1.6, 0, 2 * Math.PI);
    canvasCtx.fill();

    // Draw radial frequency bars
    const numBars = 72; // Circular subdivisions
    const barAngle = (2 * Math.PI) / numBars;

    for (let i = 0; i < numBars; i++) {
      const dataIdx = Math.floor((i / numBars) * (bufferLength * 0.7));
      const value = dataArray[dataIdx];
      const barLength = (value / 255) * (baseRadius * 0.7);

      const startX = centerX + Math.cos(i * barAngle) * pulseRadius;
      const startY = centerY + Math.sin(i * barAngle) * pulseRadius;
      const endX = centerX + Math.cos(i * barAngle) * (pulseRadius + barLength);
      const endY = centerY + Math.sin(i * barAngle) * (pulseRadius + barLength);

      const lineGrad = canvasCtx.createLinearGradient(startX, startY, endX, endY);
      lineGrad.addColorStop(0, 'rgba(15, 81, 50, 0.8)'); // Deep Emerald
      lineGrad.addColorStop(0.5, 'rgba(26, 133, 76, 0.9)'); // Light Emerald
      lineGrad.addColorStop(1, 'rgba(201, 162, 39, 0.95)'); // Accent Gold

      canvasCtx.strokeStyle = lineGrad;
      canvasCtx.lineWidth = 2.5;
      canvasCtx.lineCap = 'round';

      canvasCtx.beginPath();
      canvasCtx.moveTo(startX, startY);
      canvasCtx.lineTo(endX, endY);
      canvasCtx.stroke();
    }

    // Inner Ring
    canvasCtx.strokeStyle = isDark ? 'rgba(201, 162, 39, 0.5)' : 'rgba(201, 162, 39, 0.3)';
    canvasCtx.lineWidth = 1.5;
    canvasCtx.beginPath();
    canvasCtx.arc(centerX, centerY, pulseRadius, 0, 2 * Math.PI);
    canvasCtx.stroke();

    // Center decorative dot
    canvasCtx.fillStyle = 'rgba(201, 162, 39, 0.7)';
    canvasCtx.beginPath();
    canvasCtx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
    canvasCtx.fill();
  };

  draw();
}

/**
 * Format time helper (seconds -> mm:ss)
 */
function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return `${mm}:${ss}`;
}
