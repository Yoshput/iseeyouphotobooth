export type QuizType = 'style-persona' | 'vision-screening' | 'eye-health' | 'glasses-care';

export interface QuizOption {
  id: string;
  text: string;
  isCorrect?: boolean;
  scoreWeight?: number;
  explanation?: string;
  indicates?: 'normal' | 'minus' | 'cylinder' | 'fatigue' | 'quiet-luxe' | 'bold-statement' | 'everyday-chic' | 'the-dreamer';
}

export interface QuizQuestionItem {
  id: string;
  title: string;
  subtitle?: string;
  type: 'standard' | 'astigmatic-dial' | 'duochrome-test' | 'symptom-check';
  options: QuizOption[];
  educationalNote?: string;
}

export interface QuizModule {
  id: QuizType;
  title: string;
  tagline: string;
  description: string;
  iconName: 'Compass' | 'Eye' | 'Activity' | 'ShieldCheck';
  xpReward: number;
  estimatedMinutes: number;
  badgeLabel: string;
  badgeTone: 'emerald' | 'blue' | 'amber' | 'purple';
  questions: QuizQuestionItem[];
}

export const QUIZ_MODULES: QuizModule[] = [
  // ── 1. STYLE & FRAME PERSONA (FRAME DNA) ──
  {
    id: 'style-persona',
    title: 'Analisis Karakter & Frame DNA',
    tagline: 'Temukan siluet kacamata yang paling mewakili karakter & kebiasaanmu',
    description: 'Kuis gaya hidup dan preferensi harian tanpa benar/salah untuk menentukan seri frame kacamata paling harmonis dengan kepribadianmu.',
    iconName: 'Compass',
    xpReward: 100,
    estimatedMinutes: 2,
    badgeLabel: 'Frame DNA',
    badgeTone: 'purple',
    questions: [
      {
        id: 'sp_1',
        title: 'Bagaimana pendekatanmu saat memilih busana sehari-hari?',
        subtitle: 'Pilih yang paling menggambarkan prinsip berpakaianmu',
        type: 'standard',
        options: [
          {
            id: 'sp1_a',
            text: 'Minimalis, warna netral, potongan rapi tanpa logo mencolok',
            indicates: 'quiet-luxe',
          },
          {
            id: 'sp1_b',
            text: 'Tegas, percaya diri, dan selalu memiliki satu aksen statement',
            indicates: 'bold-statement',
          },
          {
            id: 'sp1_c',
            text: 'Fleksibel, nyaman, dan siap dipakai kerja hingga hangout',
            indicates: 'everyday-chic',
          },
          {
            id: 'sp1_d',
            text: 'Eksploratif, artsy, menyukai siluet vintage atau transparan',
            indicates: 'the-dreamer',
          },
        ],
      },
      {
        id: 'sp_2',
        title: 'Aktivitas akhir pekan yang paling membuat energimu terisi ulang?',
        subtitle: 'Aktivitas favorit menggambarkan kebutuhan fungsional frame',
        type: 'standard',
        options: [
          {
            id: 'sp2_c',
            text: 'Jalan santai, berkumpul bareng teman, atau bepergian spontan',
            indicates: 'everyday-chic',
          },
          {
            id: 'sp2_a',
            text: 'Membaca buku atau bersantai dengan suasana privat yang tenang',
            indicates: 'quiet-luxe',
          },
          {
            id: 'sp2_d',
            text: 'Menulis, fotografi, hunting barang antik, atau berkreasi',
            indicates: 'the-dreamer',
          },
          {
            id: 'sp2_b',
            text: 'Mendatangi pameran seni, event musik, atau cafe berkonsep unik',
            indicates: 'bold-statement',
          },
        ],
      },
      {
        id: 'sp_3',
        title: 'Karakter material frame yang paling menarik perhatianmu?',
        subtitle: 'Material menentukan rasa nyaman dan kesan pertama',
        type: 'standard',
        options: [
          {
            id: 'sp3_b',
            text: 'Acetate tebal berkualitas tinggi dengan kilau pekat dan garis tegas',
            indicates: 'bold-statement',
          },
          {
            id: 'sp3_d',
            text: 'Crystal acrylic bening atau siluet cat-eye dengan sudut bersudut',
            indicates: 'the-dreamer',
          },
          {
            id: 'sp3_a',
            text: 'Pure Titanium ultra-ringan dengan finishing matte yang understated',
            indicates: 'quiet-luxe',
          },
          {
            id: 'sp3_c',
            text: 'Kombinasi metal dan TR90 yang lentur, tahan banting untuk harian',
            indicates: 'everyday-chic',
          },
        ],
      },
      {
        id: 'sp_4',
        title: 'Apa yang kamu inginkan orang lain rasakan saat melihat kacamatamu?',
        subtitle: 'Kacamata adalah pusat komunikasi tatap muka pertama',
        type: 'standard',
        options: [
          {
            id: 'sp4_d',
            text: 'Kesan unik, kreatif, dan memiliki selera estetika otentik',
            indicates: 'the-dreamer',
          },
          {
            id: 'sp4_c',
            text: 'Kesan ramah, approachable, dan enak diajak diskusi apapun',
            indicates: 'everyday-chic',
          },
          {
            id: 'sp4_b',
            text: 'Kesan berani, visioner, dan memiliki kepemimpinan kuat',
            indicates: 'bold-statement',
          },
          {
            id: 'sp4_a',
            text: 'Kesan intelek, bersih, dan berkelas tanpa perlu berteriak',
            indicates: 'quiet-luxe',
          },
        ],
      },
    ],
  },

  // ── 2. VISION SCREENING (MINUS & SILINDER) ──
  {
    id: 'vision-screening',
    title: 'Skrining Refraksi Cepat: Minus & Silinder',
    tagline: 'Tes visual interaktif untuk mendeteksi ketajaman fokus mata',
    description: 'Gunakan layar ponsel atau monitormu untuk memeriksa indikasi astigmatisme (silinder) lewat dial kipas dan fokus duochrome merah-hijau.',
    iconName: 'Eye',
    xpReward: 120,
    estimatedMinutes: 3,
    badgeLabel: 'Skrining Visual',
    badgeTone: 'emerald',
    questions: [
      {
        id: 'vs_1',
        title: 'Tes Kipas Silinder (Astigmatic Clock Dial)',
        subtitle: 'Posisikan layar sejajar mata sekitar 40 cm. Tutup satu mata secara bergantian. Perhatikan garis melingkar di bawah ini:',
        type: 'astigmatic-dial',
        options: [
          {
            id: 'vs1_b',
            text: 'Ada 1 atau beberapa garis tertentu yang jauh lebih hitam dan tebal',
            isCorrect: false,
            scoreWeight: 10,
            indicates: 'cylinder',
            explanation: 'Garis yang tampak lebih tebal pada meridian tertentu adalah indikator khas kelengkungan kornea silinder (astigmatisme).',
          },
          {
            id: 'vs1_a',
            text: 'Semua garis terlihat sama jelas dan sama tebalnya',
            isCorrect: true,
            scoreWeight: 25,
            indicates: 'normal',
            explanation: 'Sistem refraksi kornea matamu tampak bulat simetris tanpa perbedaan kelengkungan fokus yang signifikan.',
          },
          {
            id: 'vs1_c',
            text: 'Garis terlihat berbayang ganda atau agak buram merata',
            isCorrect: false,
            scoreWeight: 10,
            indicates: 'cylinder',
            explanation: 'Bayangan ganda menandakan fokus berkas cahaya terpecah ke lebih dari satu titik fokus retina.',
          },
        ],
        educationalNote: 'Pada mata astigmatisme, kornea memiliki kelengkungan seperti bola rugby sehingga bayangan garis pada orientasi tertentu tampak lebih kontras dibanding garis lain.',
      },
      {
        id: 'vs_2',
        title: 'Tes Duochrome Merah vs Hijau',
        subtitle: 'Lihat kedua kotak warna di bawah. Huruf atau lingkaran di latar warna mana yang tampak lebih pekat dan tajam?',
        type: 'duochrome-test',
        options: [
          {
            id: 'vs2_b',
            text: 'Karakter di dalam kotak MERAH terlihat lebih tajam dan tebal',
            isCorrect: false,
            scoreWeight: 15,
            indicates: 'minus',
            explanation: 'Cahaya merah memiliki panjang gelombang lebih panjang. Jika merah lebih jelas, fokus berada di depan retina (indikasi miopi / mata minus).',
          },
          {
            id: 'vs2_a',
            text: 'Kedua sisi (Merah & Hijau) terlihat sama pekat dan tajam',
            isCorrect: true,
            scoreWeight: 25,
            indicates: 'normal',
            explanation: 'Fokus panjang gelombang cahaya jatuh tepat di retina, menandakan refraksi yang seimbang.',
          },
          {
            id: 'vs2_c',
            text: 'Karakter di dalam kotak HIJAU terlihat lebih tajam dan tebal',
            isCorrect: false,
            scoreWeight: 15,
            indicates: 'fatigue',
            explanation: 'Cahaya hijau memiliki gelombang pendek. Jika hijau lebih tajam, fokus berada di belakang retina (indikasi hipermetropi atau mata akomodasi berlebih).',
          },
        ],
        educationalNote: 'Tes Duochrome memanfaatkan aberasi kromatik alami mata. Optometris biasa menggunakannya untuk menyempurnakan resep lensa minus.',
      },
      {
        id: 'vs_3',
        title: 'Gejala Penglihatan Saat Malam Hari',
        subtitle: 'Bagaimana pengalamanmu saat melihat lampu kendaraan atau lampu jalan di malam hari?',
        type: 'symptom-check',
        options: [
          {
            id: 'vs3_c',
            text: 'Sulit memperkirakan jarak dan terasa silau berlebihan',
            isCorrect: false,
            scoreWeight: 10,
            indicates: 'minus',
            explanation: 'Refraksi minus yang bertambah menyebabkan ketajaman visual malam hari (night myopia) menurun drastis.',
          },
          {
            id: 'vs3_b',
            text: 'Lampu memanjang seperti garis bintang (starburst) atau berpendar panjang',
            isCorrect: false,
            scoreWeight: 10,
            indicates: 'cylinder',
            explanation: 'Efek starburst atau garis cahaya yang memanjang saat malam adalah tanda umum mata silinder yang belum terkoreksi lensa.',
          },
          {
            id: 'vs3_a',
            text: 'Lampu terlihat bulat rapi dengan pendaran normal',
            isCorrect: true,
            scoreWeight: 25,
            indicates: 'normal',
            explanation: 'Media refraksi dan pupil merespon kontras gelap-terang secara optimal.',
          },
        ],
      },
      {
        id: 'vs_4',
        title: 'Kebiasaan Akomodasi Saat Membaca Jauh',
        subtitle: 'Saat melihat papan nama, proyektor, atau tulisan di kejauhan...',
        type: 'symptom-check',
        options: [
          {
            id: 'vs4_b',
            text: 'Sering refleks menyipitkan kelopak mata agar teks terlihat lebih fokus',
            isCorrect: false,
            scoreWeight: 10,
            indicates: 'minus',
            explanation: 'Menyipitkan mata menciptakan efek lubang jarum (pinhole) sementara untuk mempersempit berkas cahaya yang buram karena minus.',
          },
          {
            id: 'vs4_a',
            text: 'Langsung terbaca jelas dan santai tanpa perlu menyipitkan mata',
            isCorrect: true,
            scoreWeight: 25,
            indicates: 'normal',
            explanation: 'Visus penglihatan jauh berada di kisaran normal 6/6 (20/20).',
          },
          {
            id: 'vs4_c',
            text: 'Mata cepat lelah, alis terasa tegang, atau sering sakit kepala di pelipis',
            isCorrect: false,
            scoreWeight: 10,
            indicates: 'fatigue',
            explanation: 'Otot siliaris mata terus-menerus bekerja ekstra keras mencoba memfokuskan bayangan yang tidak presisi.',
          },
        ],
      },
    ],
  },

  // ── 3. EYE HEALTH & SCREEN TIME ──
  {
    id: 'eye-health',
    title: 'IQ Kesehatan Mata di Era Gadget',
    tagline: 'Uji wawasan dan kebiasaanmu dalam melindungi mata dari kelelahan digital',
    description: 'Apakah kebiasaan menatap layar komputermu sudah benar? Ikuti kuis cerdas untuk mengetahui risiko Computer Vision Syndrome.',
    iconName: 'Activity',
    xpReward: 90,
    estimatedMinutes: 2,
    badgeLabel: 'Edukasi Digital',
    badgeTone: 'blue',
    questions: [
      {
        id: 'eh_1',
        title: 'Apa arti aturan 20-20-20 yang disarankan para dokter mata dunia?',
        subtitle: 'Metode sederhana paling efektif untuk mencegah mata lelah digital',
        type: 'standard',
        options: [
          {
            id: 'eh1_b',
            text: 'Gunakan layar selama 20 jam per minggu dengan 20 kali kedipan per menit',
            isCorrect: false,
            scoreWeight: 0,
            explanation: 'Kurang tepat. Aturan 20-20-20 adalah jeda berkala: setiap 20 menit menatap layar, istirahatkan mata selama 20 detik melihat jarak jauh 20 kaki.',
          },
          {
            id: 'eh1_a',
            text: 'Tiap 20 menit, istirahatkan mata 20 detik, pandang objek sejauh 20 kaki (6 meter)',
            isCorrect: true,
            scoreWeight: 25,
            explanation: 'Tepat! Melihat objek sejauh 6 meter merelaksasi otot fokus mata setelah bekerja jarak dekat.',
          },
          {
            id: 'eh1_c',
            text: 'Teteskan obat mata 20 menit sebelum tidur sebanyak 20 tetes',
            isCorrect: false,
            scoreWeight: 0,
            explanation: 'Tidak benar dan berbahaya! Meneteskan obat mata berlebihan justru dapat merusak lapisan air mata alami.',
          },
        ],
      },
      {
        id: 'eh_2',
        title: 'Mengapa mata terasa kering atau berpasir saat menatap monitor berjam-jam?',
        subtitle: 'Fenomena ilmiah yang sering tidak disadari pengguna gadget',
        type: 'standard',
        options: [
          {
            id: 'eh2_b',
            text: 'Suhu monitor membakar air mata secara langsung dari jarak 50 cm',
            isCorrect: false,
            scoreWeight: 0,
            explanation: 'Bukan karena suhu monitor, melainkan berkurangnya frekuensi kedipan refleks akibat konsentrasi menatap layar.',
          },
          {
            id: 'eh2_c',
            text: 'Cahaya monitor menyerap cairan darah di sekitar rongga mata',
            isCorrect: false,
            scoreWeight: 0,
            explanation: 'Mitos. Masalah utamanya adalah penguapan tear film karena jarangnya kelopak mata mengedip.',
          },
          {
            id: 'eh2_a',
            text: 'Frekuensi kedipan mata alami menurun drastis hingga 50-60%',
            isCorrect: true,
            scoreWeight: 25,
            explanation: 'Benar sekali! Saat fokus ke monitor, kita hanya berkedip 5-7 kali/menit (normalnya 15-20 kali), sehingga lapisan air mata cepat menguap.',
          },
        ],
      },
      {
        id: 'eh_3',
        title: 'Bagaimana cara kerja lensa Bluechromic dalam melindungi mata?',
        subtitle: 'Kombinasi teknologi lensa modern terpopuler',
        type: 'standard',
        options: [
          {
            id: 'eh3_a',
            text: 'Memblokir sinar biru layar gadget sekaligus menggelap otomatis saat terkena sinar UV outdoor',
            isCorrect: true,
            scoreWeight: 25,
            explanation: 'Sempurna! Bluechromic menggabungkan filter Blue Ray 420nm (indoor) dan molekul Photochromic adaptif (outdoor).',
          },
          {
            id: 'eh3_b',
            text: 'Membuat layar komputer otomatis berubah menjadi mode hitam putih',
            isCorrect: false,
            scoreWeight: 0,
            explanation: 'Lensa tidak mengubah warna tampilan layar secara drastis, melainkan memotong spektrum gelombang biru berenergi tinggi.',
          },
          {
            id: 'eh3_c',
            text: 'Memantulkan semua jenis cahaya termasuk cahaya ruangan hingga terlihat gelap total',
            isCorrect: false,
            scoreWeight: 0,
            explanation: 'Lensa optik berkualitas tetap mempertahankan transmisi cahaya tampak agar penglihatan tetap jernih dan natural.',
          },
        ],
      },
      {
        id: 'eh_4',
        title: 'Berapa jarak ideal antara mata dan layar komputer saat bekerja?',
        subtitle: 'Ergonomi posisi kerja yang menjaga kesehatan leher dan mata',
        type: 'standard',
        options: [
          {
            id: 'eh4_b',
            text: 'Sekitar 15 - 20 cm agar tulisan kecil terlihat lebih detail',
            isCorrect: false,
            scoreWeight: 0,
            explanation: 'Terlalu dekat! Jarak di bawah 30 cm memaksa otot akomodasi mata mencengkeram maksimal dan memicu rabun jauh berkembang cepat.',
          },
          {
            id: 'eh4_a',
            text: 'Sekitar 50 - 70 cm (sepanjang rentangan satu lengan tangan)',
            isCorrect: true,
            scoreWeight: 25,
            explanation: 'Tepat! Posisi layar sepanjang rentangan tangan dengan sudut 15 derajat di bawah garis mata membuat mata paling rileks.',
          },
          {
            id: 'eh4_c',
            text: 'Lebih dari 2 meter di sudut ruangan',
            isCorrect: false,
            scoreWeight: 0,
            explanation: 'Terlalu jauh untuk monitor kerja harian dan justru membuat Anda memajukan leher (text neck syndrome).',
          },
        ],
      },
    ],
  },

  // ── 4. GLASSES CARE MASTER ──
  {
    id: 'glasses-care',
    title: 'Master Perawatan Kacamata',
    tagline: 'Uji kebiasaanmu: Apakah kamu sudah merawat kacamata dengan benar?',
    description: 'Banyak kacamata rusak bukan karena usia, melainkan salah cara membersihkan. Cari tahu apakah kacamata kesayanganmu aman!',
    iconName: 'ShieldCheck',
    xpReward: 90,
    estimatedMinutes: 2,
    badgeLabel: 'Tips Awet & Bersih',
    badgeTone: 'amber',
    questions: [
      {
        id: 'gc_1',
        title: 'Bolehkah mengelap lensa kacamata dengan ujung kaos atau tisu basah serbaguna?',
        subtitle: 'Kebiasaan paling sering yang merusak lapisan coating lensa',
        type: 'standard',
        options: [
          {
            id: 'gc1_b',
            text: 'Boleh saja asalkan bahan kaosnya katun 100% dan digosok kuat',
            isCorrect: false,
            scoreWeight: 0,
            explanation: 'Keliru. Debu halus yang menempel di baju justru bertindak seperti amplas mikroskopis yang membuat lensa buram.',
          },
          {
            id: 'gc1_a',
            text: 'Sangat tidak disarankan! Serat kayu pada tisu & debu pada kaos dapat menggores lapisan coating lensa',
            isCorrect: true,
            scoreWeight: 25,
            explanation: 'Tepat sekali! Tisu terbuat dari serat kayu mikro yang abrasif. Selalu gunakan kain lap microfiber khusus kacamata.',
          },
          {
            id: 'gc1_c',
            text: 'Boleh, tisu basah alkohol justru membunuh bakteri pada lensa',
            isCorrect: false,
            scoreWeight: 0,
            explanation: 'Alkohol keras dapat melarutkan lapisan coating anti-refleksi dan membuat bingkai acetate menjadi kusam belang.',
          },
        ],
      },
      {
        id: 'gc_2',
        title: 'Cara mencuci kacamata yang benar saat terkena minyak dan sidik jari?',
        subtitle: 'Langkah aman yang dianjurkan laboratorium faset optik',
        type: 'standard',
        options: [
          {
            id: 'gc2_b',
            text: 'Rendam dengan air panas mendidih selama 10 menit agar steril',
            isCorrect: false,
            scoreWeight: 0,
            explanation: 'Jangan pernah! Air panas merusak susunan molekul coating lensa (crazing) dan membuat frame melengkung berubah bentuk.',
          },
          {
            id: 'gc2_c',
            text: 'Semprotkan parfum atau pembersih kaca jendela rumah',
            isCorrect: false,
            scoreWeight: 0,
            explanation: 'Bahan kimia amonia dan pewangi keras pada pembersih rumah tangga akan mengelupas lapisan pelindung lensa optik.',
          },
          {
            id: 'gc2_a',
            text: 'Bilas air mengalir suhu ruang, beri 1 tetes sabun cuci piring lembut (tanpa scrub), lalu keringkan dengan microfiber',
            isCorrect: true,
            scoreWeight: 25,
            explanation: 'Benar! Sabun cuci piring lembut efektif mengangkat minyak tanpa meninggalkan residu pelembab seperti pada sabun mandi.',
          },
        ],
      },
      {
        id: 'gc_3',
        title: 'Bagaimana posisi meletakkan kacamata di atas meja yang benar saat dilepas?',
        subtitle: 'Kebiasaan kecil yang mencegah baret di permukaan tengah lensa',
        type: 'standard',
        options: [
          {
            id: 'gc3_a',
            text: 'Lensa menghadap ke atas, dengan bingkai terbuka atau bertumpu pada gagang kacamata',
            isCorrect: true,
            scoreWeight: 25,
            explanation: 'Tepat! Menaruh lensa menghadap ke bawah langsung menggesek permukaan meja dan menimbulkan baret di titik pusat fokus.',
          },
          {
            id: 'gc3_b',
            text: 'Lensa telungkup menghadap ke bawah permukaan meja',
            isCorrect: false,
            scoreWeight: 0,
            explanation: 'Salah! Bagian cembung lensa akan langsung bergesekan dengan kotoran meja dan merusak visus optik.',
          },
          {
            id: 'gc3_c',
            text: 'Diselipkan di leher kaos atau digantung di atas kepala',
            isCorrect: false,
            scoreWeight: 0,
            explanation: 'Menaruh kacamata di atas kepala membuat gagang cepat renggang (longgar) dan minyak rambut menodai lensa.',
          },
        ],
      },
      {
        id: 'gc_4',
        title: 'Mengapa melepas kacamata dengan satu tangan dapat merusak kenyamanan?',
        subtitle: 'Penyebab utama kacamata terasa miring di hidung',
        type: 'standard',
        options: [
          {
            id: 'gc4_b',
            text: 'Melepas dengan satu tangan dapat memicu listrik statis di lensa',
            isCorrect: false,
            scoreWeight: 0,
            explanation: 'Bukan masalah listrik statis, melainkan tekanan mekanis pada engsel (hinge) yang tidak seimbang.',
          },
          {
            id: 'gc4_a',
            text: 'Menarik satu sisi gagang membuat engsel kendor dan bingkai menjadi miring tidak simetris',
            isCorrect: true,
            scoreWeight: 25,
            explanation: 'Benar! Selalu gunakan dua tangan dari depan saat memakai dan melepas kacamata agar tekanan engsel seimbang.',
          },
          {
            id: 'gc4_c',
            text: 'Hanya masalah mitos adat kebiasaan',
            isCorrect: false,
            scoreWeight: 0,
            explanation: 'Ini murni prinsip mekanika optik: tarikan satu sisi selalu merenggangkan screw engsel lebih cepat.',
          },
        ],
      },
    ],
  },
];
