export type BlogCategory = 'edukasi-mata' | 'tips-pilih-frame' | 'perawatan-softlens' | 'tren-gaya' | 'info-cabang-promo';

export type BlogPost = {
  slug: string;
  title: string;
  category: BlogCategory;
  excerpt: string;
  coverImage: string;
  videoUrl?: string;
  content: string; // HTML string
  author: string; // default: "Tim Optik I See You"
  publishedAt: string; // ISO 8601
  updatedAt: string;
  readingTime: number; // auto-calculate from word count
  relatedCabang?: string;
};

function calculateReadingTime(content: string): number {
  const words = content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(word => word.length > 0).length;
  return Math.ceil(words / 200);
}

const rawArticles: Omit<BlogPost, 'readingTime'>[] = [
  // ── NEW 1. EDUKASI INSTAGRAM: KACAMATA BARU MALAH PUSING (Post DeL4YrUCfHg) ──
  {
    slug: 'kacamata-baru-malah-pusing-penyebab-dan-solusi',
    title: 'Beli Kacamata Baru Malah Pusing & Kliyengan? Jangan Panik, Ini Penyebab Sebenarnya!',
    category: 'edukasi-mata',
    excerpt: 'Beli kacamata baru niatnya biar penglihatan makin jernih, tapi kok malah bikin pusing dan kliyengan? Jangan buru-buru panik mikir resepnya yang salah, simak penjelasan ahli refraksi berikut.',
    coverImage: '/blog/covers/kacamata-baru-pusing.jpg',
    author: 'Tim Optik I See You',
    publishedAt: '2026-10-06T09:00:00Z',
    updatedAt: '2026-10-06T09:00:00Z',
    content: `
      <p>Beli kacamata baru niatnya biar penglihatan makin jernih, tajam, dan nyaman saat beraktivitas. Tapi kok pas dipakai pertama kali rasanya malah pusing, mual, lantai berasa melengkung, atau kliyengan? Tenang dulu, jangan buru-buru panik dan menuduh resep minus atau silindermu salah!</p>

      <figure>
        <img src="/blog/kacamata-baru-pusing/slide-2.jpg" alt="Mata dan Otak Memerlukan Adaptasi Visual dengan Kacamata Baru" loading="lazy" />
        <figcaption>Adaptasi fisiologis wajar antara sistem visual mata dan persepsi otak saat berkenalan dengan sudut koreksi baru.</figcaption>
      </figure>

      <p>Faktanya, mata dan otak kamu memang membutuhkan fase adaptasi visual. Saat beralih ke kacamata baru, sistem saraf pusat ibarat baru saja berkenalan dengan dunia yang berbeda. Kacamata baru membawa banyak variabel perubahan: mulai dari peningkatan kekuatan koreksi lensa, sudut kemiringan pantoskopik bingkai, jarak verteks antara kornea dan lensa, hingga ukuran dan kelengkungan frame baru.</p>

      <h2>Kenapa Kacamata Baru Bisa Bikin Pusing?</h2>
      <p>Berikut beberapa faktor fisiologis normal yang terjadi selama masa adaptasi:</p>
      <ul>
        <li><strong>Perubahan Sudut Pandang &amp; Distorsi Tepi:</strong> Frame baru dengan bentuk berbeda merubah area lapang pandang periferal. Otak butuh waktu 3 hingga 7 hari untuk mengabaikan distorsi kecil di tepi lensa.</li>
        <li><strong>Adaptasi Otot Siliaris Mata:</strong> Otot fokus mata yang selama ini terbiasa bekerja keras akibat kacamata lama yang sudah under-corrected kini harus rileks menerima koreksi baru yang tepat sasaran.</li>
        <li><strong>Pergeseran Titik Fokus (Centration):</strong> Bila tinggi pupil (fitting height) atau jarak antarpupil (PD) pada frame baru sedikit berbeda dengan frame lama, persepsi ruang akan terasa sedikit goyang di awal pemakaian.</li>
      </ul>

      <figure>
        <img src="/blog/kacamata-baru-pusing/slide-3.jpg" alt="Pusing Berkepanjangan Bukan Berarti Harus Ditahan" loading="lazy" />
        <figcaption>Bila keluhan terasa berat atau menetap lebih dari satu minggu, jangan hanya menganggapnya adaptasi biasa.</figcaption>
      </figure>

      <h2>Kapan Pusing Ini Wajar, dan Kapan Harus Dicek Ulang?</h2>
      <p>Adaptasi wajar biasanya berlangsung <strong>3 sampai 7 hari</strong> dengan intensitas pusing ringan yang berangsur-angsur hilang saat kacamata dipakai rutin sejak bangun pagi. Namun, jika keluhan terasa sangat berat, pandangan berbayang ganda, mata cepat merah, atau pusing tidak berkurang setelah 1 minggu, itu tanda wajib dicek ulang!</p>

      <figure>
        <img src="/blog/kacamata-baru-pusing/slide-4.jpg" alt="Faktor Pemeriksaan: Resep, Posisi Lensa, Centration, dan Fitting Frame" loading="lazy" />
        <figcaption>Pemeriksaan menyeluruh mencakup resep optik, posisi dan sudut lensa, centration titik fokus, hingga kesesuaian anatomi frame.</figcaption>
      </figure>

      <p><strong>Plot twist-nya:</strong> Masalah pusing belum tentu ada di resep minus atau silinder kamu. Seringkali masalahnya ada pada:</p>
      <ol>
        <li><strong>Fitting Frame Belum Pas:</strong> Nosepad terlalu menekan, tangkai kacamata terlalu sempit di pelipis, atau frame melorot ke bawah.</li>
        <li><strong>Kemiringan Frame (Pantoscopic Tilt):</strong> Sudut kemiringan bingkai terhadap bidang wajah belum disesuaikan dengan postur alami kepala Anda.</li>
        <li><strong>Bahan &amp; Desain Lensa:</strong> Pemilihan indeks ketipisan lensa atau desain asferis yang belum optimal untuk minus tinggi.</li>
      </ol>

      <figure>
        <img src="/blog/kacamata-baru-pusing/slide-5.jpg" alt="Penyebab Pusing Seringkali Berasal dari Penyetelan Anatomi Frame" loading="lazy" />
        <figcaption>Penyetelan anatomi nosepad dan tangkai kacamata secara presisi seringkali langsung menuntaskan rasa pusing tanpa harus mengubah resep.</figcaption>
      </figure>

      <h2>Solusinya? Datang ke Optik I See You untuk Penyetelan Gratis</h2>
      <p>Kacamata baru seharusnya membuat harimu lebih produktif dan percaya diri, bukan malah menyiksa kepala sepanjang hari. Jangan tahan rasa pusingmu! Bawa kacamata kamu ke cabang Optik I See You terdekat di Purwokerto, Purbalingga, Wonosobo, atau Cilacap. Tim refraksionis dan optician kami siap membantu cek ulang titik fokus (centration), resep mata, dan penyetelan anatomi frame secara gratis sampai 100% nyaman!</p>

      <figure>
        <img src="/blog/kacamata-baru-pusing/slide-6.jpg" alt="Layanan Penyetelan dan Konsultasi Gratis di Cabang Optik I See You" loading="lazy" />
        <figcaption>Kunjungi cabang resmi Optik I See You di Purwokerto, Cilacap, Purbalingga, dan Wonosobo untuk pengecekan dan penyetelan gratis.</figcaption>
      </figure>
    `
  },

  // ── NEW 2. TREN GAYA INSTAGRAM: POV NYOBAIN SEISI TOKO (Post DeJij3CCT3L) ──
  {
    slug: 'kenapa-koleksi-frame-optik-i-see-you-bikin-candu',
    title: 'Niat Awal Cuma \'Lihat-Lihat\', Berujung Nyobain Seisi Toko: Kenapa Koleksi Frame Optik I See You Bikin Candu?',
    category: 'tren-gaya',
    excerpt: 'POV ketika niat awal cuma antar teman atau sekadar iseng cuci mata, tapi 5 menit coba frame hitam, 15 menit coba caramel, dan berujung fitting puluhan model! Kenapa frame di Optik I See You selalu pas di wajah?',
    coverImage: '/blog/covers/pov-nyobain-seisi-toko.jpg',
    author: 'Tim Optik I See You',
    publishedAt: '2026-10-06T08:00:00Z',
    updatedAt: '2026-10-06T08:00:00Z',
    content: `
      <p>Pernah nggak kamu ke optik niat awalnya cuma mau mengantar teman atau sekadar iseng cuci mata lihat-lihat model kacamata terbaru? Katanya sih <em>"Cuma liat-liat aja kok, nggak bakal beli."</em> Tapi realitanya begitu masuk ke store Optik I See You suasana langsung berbeda!</p>

      <figure>
        <img src="/blog/pov-nyobain-toko/slide-2.jpg" alt="Koleksi Frame Klasik Hitam Glossy yang Elegan" loading="lazy" />
        <figcaption>5 Menit Kemudian: Eksplorasi dimulai dengan siluet klasik hitam glossy yang langsung mempertegas karakter garis wajah.</figcaption>
      </figure>

      <p>Awalnya mencoba frame formal, tapi pantulan di cermin langsung memperlihatkan siluet wajah yang lebih segar dan berwibawa. Rasa penasaran pun mulai berlanjut ke barisan rak berikutnya.</p>

      <figure>
        <img src="/blog/pov-nyobain-toko/slide-3.jpg" alt="Koleksi Frame Translucent Caramel yang Mencerahkan Wajah" loading="lazy" />
        <figcaption>15 Menit Kemudian: Warna translucent caramel yang memberi nuansa hangat, lembut, dan mencerahkan warna kulit.</figcaption>
      </figure>

      <p>Warna caramel transparan ini langsung memberi visual aesthetic ala Korean look yang clean dan ramah kamera. Dari satu model, mata mulai melirik ke varian retro sunglasses di sebelahnya.</p>

      <figure>
        <img src="/blog/pov-nyobain-toko/slide-4.jpg" alt="Koleksi Sunglasses Oval Bold Bernuansa Vintage Retro" loading="lazy" />
        <figcaption>25 Menit Kemudian: Bertanya varian warna lain untuk siluet bold retro oval yang timeless dan chic.</figcaption>
      </figure>

      <figure>
        <img src="/blog/pov-nyobain-toko/slide-5.jpg" alt="Display Ratusan Koleksi Frame Tren Terkini di Optik I See You" loading="lazy" />
        <figcaption>35 Menit Kemudian: Menikmati kebebasan mencoba seluruh koleksi frame di rak display tanpa rasa canggung atau diburu-buru staf.</figcaption>
      </figure>

      <p>Tenang, kamu nggak sendirian! Ratusan pelanggan kami setiap minggunya mengalami momen seru yang sama. Pesona koleksi frame di Optik I See You memang dirancang khusus agar bikin penasaran dan susah ditolak. Kalau pada akhirnya kamu menemukan banyak frame yang langsung klop di wajah, mohon jangan salahkan kami ya!</p>

      <figure>
        <img src="/blog/pov-nyobain-toko/slide-6.jpg" alt="Store Resmi Optik I See You dengan Fasilitas Lengkap" loading="lazy" />
        <figcaption>Katanya lihat-lihat saja? Kalau yang cocok banyak, nikmati kepuasan menemukan kacamata impianmu.</figcaption>
      </figure>

      <h2>Kenapa Frame Optik I See You Selalu Pas di Wajah?</h2>
      <p>Bukan kebetulan bila frame kacamata di Optik I See You terasa sangat pas begitu dipasang di wajah. Ini rahasianya:</p>
      <ol>
        <li><strong>Ergonomi Asian Fit:</strong> Seluruh koleksi kami dikurasi dengan memperhitungkan jembatan hidung (nose bridge) dan lebar pelipis masyarakat Asia, sehingga kacamata tidak mudah melorot dan tidak menempel di pipi saat tersenyum.</li>
        <li><strong>Material Ringan &amp; Tahan Banting:</strong> Menggunakan bahan premium seperti TR90 fleksibel, titanium ultra-light, dan high-density acetate yang nyaman dipakai seharian tanpa bikin hidung pegal atau berbekas merah.</li>
        <li><strong>Palet Warna Estetik &amp; Skin Tone Friendly:</strong> Dari warna bold vintage tortoise, matte black, clear crystal, hingga warna pastel kalem yang menyatu harmonis dengan warna kulit dan hijab style kamu.</li>
      </ol>

      <h2>Bebas Fitting Sepuasnya di 4 Cabang Resmi</h2>
      <p>Di Optik I See You, kamu bebas mencoba dan mengeksplorasi puluhan hingga ratusan model frame di cermin tanpa rasa canggung atau diburu-buru staf. Mampir sekarang ke cabang resmi kami di <strong>Purwokerto, Purbalingga, Wonosobo, dan Cilacap</strong>, atau coba secara virtual kapan saja menggunakan fitur <strong>AR Try-On</strong> interaktif di website ini!</p>

      <figure>
        <img src="/blog/pov-nyobain-toko/slide-7.jpg" alt="Layanan Konsultasi dan Lokasi Cabang Optik I See You" loading="lazy" />
        <figcaption>Temukan kacamata terbaikmu di cabang resmi Optik I See You: Purwokerto, Cilacap, Purbalingga, dan Wonosobo.</figcaption>
      </figure>
    `
  },

  // ── NEW 3. EDUKASI INSTAGRAM: BIKIN KACAMATA EXPRESS 15 MENIT (Post DeGv4z5DzEJ) ──
  {
    slug: 'bikin-kacamata-express-15-menit-jadi-lab-cnc',
    title: 'Gak Pake Lama! Bikin Kacamata Express Cuma 15 Menit Langsung Jadi di Optik I See You',
    category: 'edukasi-mata',
    excerpt: 'Masih jaman bikin kacamata nunggu berhari-hari sampai mood hilang? Di Optik I See You, proses dari pemilihan frame, pemeriksaan mata, hingga faset lensa CNC presisi tinggi cuma butuh 15 menit dan bisa ditunggu!',
    coverImage: '/blog/covers/bikin-kacamata-15-menit.jpg',
    videoUrl: '/blog/videos/bikin-kacamata-15-menit.mp4',
    author: 'Tim Optik I See You',
    publishedAt: '2026-10-05T08:00:00Z',
    updatedAt: '2026-10-05T08:00:00Z',
    content: `
      <p>Masih jaman bikin kacamata resep harus menunggu berhari-hari sampai mood jalan-jalanmu keburu hilang? Di era serba cepat saat ini, kacamata adalah kebutuhan esensial yang tidak bisa ditunda, apalagi kalau kacamata lama patah atau lensanya hilang saat tugas kuliah dan pekerjaan kantor sedang menumpuk.</p>

      <p>Kenalin pengalaman baru bikin kacamata di <strong>Optik I See You</strong>: kamu cuma butuh waktu <strong>15 MENIT</strong> saja buat mendapatkan kacamata baru beresep akurat yang siap langsung dibawa pulang dan dipakai! Yes, seriusan cuma 15 menit dan bisa ditunggu sambil santai!</p>

      <h2>Bisa Secepat Itu, Gimana Sih Alur Prosesnya?</h2>
      <p>Di balik kecepatan 15 menit ini ada integrasi teknologi laboratorium mutakhir dan SOP profesional yang sangat terstruktur:</p>

      <figure>
        <img src="/blog/edukasi-15-menit/slide-3.jpg" alt="Langkah 1: Pemilihan Model Frame yang Sesuai Karakter Wajah" loading="lazy" />
        <figcaption>Menit 12:43: Bebas memilih ratusan model frame terkini yang paling sesuai dengan karakter, bentuk wajah, dan kebutuhan harian.</figcaption>
      </figure>

      <figure>
        <img src="/blog/edukasi-15-menit/slide-4.jpg" alt="Langkah 2: Pemeriksaan Refraksi dan Penyetelan Posisi Presisi" loading="lazy" />
        <figcaption>Menit 09:18: Tim refraksionis mengukur refraksi mata secara akurat dan menyetel posisi anatomi bingkai agar sangat nyaman dipakai.</figcaption>
      </figure>

      <figure>
        <img src="/blog/edukasi-15-menit/slide-5.jpg" alt="Langkah 3: Pemotongan Lensa Otomatis Mesin CNC di Laboratorium Internal" loading="lazy" />
        <figcaption>Menit 05:42: Laboratorium internal memproses lensa secara presisi menggunakan mesin CNC 3D frame tracing otomatis berakurasi mikron.</figcaption>
      </figure>

      <figure>
        <img src="/blog/edukasi-15-menit/slide-6.jpg" alt="Langkah 4: Kacamata Selesai dalam 15 Menit dan Langsung Siap Dipakai" loading="lazy" />
        <figcaption>Menit 00:00: 15 menit selesai. Satu kacamata baru siap dipakai langsung dengan hasil rapi, presisi, dan nyaman maksimal.</figcaption>
      </figure>

      <h2>Kualitas Tetap Nomor Satu</h2>
      <p>Cepat bukan berarti buru-buru atau mengorbankan kualitas. Mesin pemotong otomatis CNC kami memastikan bevel tepi lensa terkunci rapat pada bingkai tanpa ada celah renggang, sehingga lensa awet, kokoh, dan tidak mudah lepas. Datang milih frame, duduk santai sejenak sambil ngobrol, pulang sudah pakai kacamata baru!</p>

      <figure>
        <img src="/blog/edukasi-15-menit/slide-7.jpg" alt="Layanan Kacamata Express di Seluruh Cabang Optik I See You" loading="lazy" />
        <figcaption>Layanan kacamata express 15 menit tersedia di seluruh cabang resmi: Purwokerto, Cilacap, Purbalingga, dan Wonosobo.</figcaption>
      </figure>
    `
  },

  // ── NEW 4. EDUKASI INSTAGRAM: KACAMATA BERKABUT KONDENSASI (Post DeBoHTnD_0O) ──
  {
    slug: 'kacamata-berkabut-kondensasi-stop-lap-ujung-baju',
    title: 'Kacamata Tiba-Tiba Berkabut? Stop Lap Pakai Ujung Baju, Ini Penyebab & Cara Mengatasinya!',
    category: 'edukasi-mata',
    excerpt: 'Lagi asik jalan atau ngopi tiba-tiba lensa kacamata berkabut dan masuk mode blur? Eits, jangan buru-buru di-lap pakai ujung baju! Pahami fenomena kondensasi dan cara merawat coating lensa yang benar.',
    coverImage: '/blog/covers/kacamata-berkabut-kondensasi.jpg',
    author: 'Tim Optik I See You',
    publishedAt: '2026-10-03T08:00:00Z',
    updatedAt: '2026-10-03T08:00:00Z',
    content: `
      <p>Paling sebel kan kalau lagi asik jalan keluar dari ruangan ber-AC, menyeruput kuah mie ayam panas, atau minum kopi hangat, tiba-tiba lensa kacamata langsung berkabut putih dan pandangan seketika masuk ke <em>mode blur</em>? Eits, STOP! Jangan buru-buru di-lap pakai ujung baju ya!</p>

      <figure>
        <img src="/blog/kacamata-berkabut/slide-2.jpg" alt="Lensa Berkabut Merupakan Reaksi Alami Perbedaan Suhu Kondensasi" loading="lazy" />
        <figcaption>Lensa kacamata kamu tidak rusak: kabut putih terjadi karena fenomena fisika kondensasi alami.</figcaption>
      </figure>

      <h2>Lensa Kamu Bukan Rusak, Ini Fenomena Kondensasi!</h2>
      <p>Pertama-tama, tenang dulu: lensa kacamata kamu tidak rusak kok. Kabut putih tersebut adalah fenomena fisika alami bernama <strong>kondensasi</strong>. Udara hangat yang mengandung uap air tinggi bertemu dengan permukaan lensa kacamata yang suhunya jauh lebih dingin. Akibat perbedaan temperatur tersebut, uap air di udara berubah wujud menjadi jutaan butiran embun mikro yang menempel di kedua sisi permukaan lensa.</p>

      <figure>
        <img src="/blog/kacamata-berkabut/slide-3.jpg" alt="Proses Terjadinya Efek Kabut pada Kacamata" loading="lazy" />
        <figcaption>Skema kondensasi: udara hangat lembap bertemu permukaan lensa dingin menghasilkan embun mikro yang memburamkan pandangan.</figcaption>
      </figure>

      <h2>Kenapa Dilarang Keras Lap Lensa Pakai Ujung Baju?</h2>
      <p>Hampir semua orang refleks menarik ujung kaos, kemeja, atau tisu kering untuk membersihkan kacamata yang berembun. Padahal kebiasaan sepele ini adalah <strong>musuh terbesar kacamata Anda</strong>:</p>
      <ul>
        <li><strong>Serat Kain Baju Terlalu Kasar:</strong> Serat katun pakaian dan tisu kayu memiliki tekstur mikroskopis yang abrasif terhadap lapisan lensa optik.</li>
        <li><strong>Debu Mikro yang Terjebak:</strong> Pakaian yang sudah dipakai berjam-jam menyimpan partikel debu halus. Saat kamu menggosokkan baju ke lensa, debu tersebut bertindak layaknya amplas yang menghasilkan ratusan baret halus.</li>
        <li><strong>Merusak Lapisan Coating:</strong> Baret halus akan mengikis lapisan Anti-Refleksi (AR), filter Blue Ray, dan lapisan hydrophobic yang melindungi lensa kacamata.</li>
      </ul>

      <figure>
        <img src="/blog/kacamata-berkabut/slide-4.jpg" alt="Hindari Mengusap Lensa dengan Ujung Pakaian Kasar" loading="lazy" />
        <figcaption>Kain baju dan serat pakaian yang berdebu berpotensi menggores lapisan coating pelindung lensa.</figcaption>
      </figure>

      <figure>
        <img src="/blog/kacamata-berkabut/slide-5.jpg" alt="Solusi Coating Super Hydrophobic dan Lap Microfiber Khusus" loading="lazy" />
        <figcaption>Rawat lensa secara tepat dengan perlindungan yang sesuai aktivitas harian agar tidak mudah berkabut.</figcaption>
      </figure>

      <h2>Cara Ampuh Mencegah &amp; Mengatasi Kacamata Berkabut:</h2>
      <ol>
        <li><strong>Gunakan Kain Microfiber Khusus:</strong> Selalu simpan lap microfiber pembersih optik yang halus dan bebas serat di dalam kotak kacamatamu.</li>
        <li><strong>Gunakan Semprotan Lens Cleaner Anti-Fog:</strong> Semprotkan cairan pembersih lensa khusus yang memiliki formula anti-kabut untuk membentuk lapisan pelindung transparan tipis.</li>
        <li><strong>Pilih Lensa dengan Lapisan Super Hydrophobic di Optik I See You:</strong> Lapisan licin modern membuat partikel air tidak dapat menempel dan langsung meluncur jatuh, menjaga pandangan tetap jernih di segala kondisi cuaca.</li>
      </ol>

      <figure>
        <img src="/blog/kacamata-berkabut/slide-6.jpg" alt="Layanan Perawatan dan Pembersihan Lensa di Cabang Optik I See You" loading="lazy" />
        <figcaption>Kunjungi Optik I See You untuk mendapatkan aksesoris pembersih optik resmi dan lensa anti-fog berkualitas.</figcaption>
      </figure>
    `
  },

  // ── 0. GAYA & LIFESTYLE: STARTER PACK COFFEE SHOP (Instagram Post DcvcKUPj5ro) ──
  {
    slug: 'rekomendasi-frame-tipe-keseharian-starter-pack-coffee-shop',
    title: 'Starter Pack Nongkrong di Coffee Shop: Rekomendasi Frame Kacamata Sesuai Tipe Keseharian Kamu',
    category: 'tren-gaya',
    excerpt: 'Datang ke coffee shop bukan sekadar ngopi atau nugas, tapi juga ajang show off outfit harian! Simak rekomendasi frame kacamata yang klop dengan persona kamu: Si Paling Skena, The Overworked Creative, hingga The Aesthetic Minimalist.',
    coverImage: '/blog/lifestyle-dcvcku/slide-1.jpg',
    author: 'Tim Optik I See You',
    publishedAt: '2026-09-09T08:00:00Z',
    updatedAt: '2026-09-09T08:00:00Z',
    content: `
      <p>Bagi generasi urban saat ini, <em>coffee shop</em> bukan lagi sekadar tempat singgah untuk menikmati secangkir kopi. Di sanalah tempat kita bekerja (*WFC*), mencari inspirasi kreatif, berdiskusi santai, hingga mengekspresikan karakter diri lewat <strong>OOTD (Outfit of the Day)</strong>. Dan di antara semua elemen fashion, kacamata adalah aksesori paling sentral yang langsung dilihat pertama kali saat berhadapan dengan orang lain.</p>

      <p>Pertanyaannya: apakah kacamata yang kamu pakai saat ini sudah benar-benar merepresentasikan persona dan tipe keseharianmu? Yuk cek starter pack rekomendasi frame berikut dan temukan mana yang paling kamu banget!</p>

      <!-- SLIDE 1 SHOWCASE -->
      <div class="slide-showcase">
        <span class="slide-tag">Persona Guide • Slide 1</span>
        <img src="/blog/lifestyle-dcvcku/slide-1.jpg" alt="Starter Pack Nongkrong di Coffee Shop Optik I See You" />
        <h3>Starter Pack Nongkrong di Coffee Shop: Frame Mana yang Kamu Banget?</h3>
        <p>Dari warna crystal clear yang modern, palet warm caramel amber, hingga siluet vintage square. Setiap model kacamata punya energi unik yang siap memperkuat karakter personalmu.</p>
      </div>

      <h2>1. Si Paling Skena: Edgy, Modern &amp; Stand Out</h2>
      <p>Ciri khas persona ini adalah selalu update dengan tren streetwear, suka eksplorasi musik indie, dan nggak ragu tampil beda. Datang ke coffee shop bukan cuma buat nugas, tapi sekalian <em>show off fit</em> hari ini!</p>

      <!-- SLIDE 2 SHOWCASE -->
      <div class="slide-showcase">
        <span class="slide-tag">Tipe Persona • Slide 2</span>
        <img src="/blog/lifestyle-dcvcku/slide-2.jpg" alt="Si Paling Skena Frame Transparan OOTD Coffee Shop" />
        <h3>Si Paling Skena: Frame Transparan untuk Tampilan Edgy Maksimal</h3>
        <p><strong>Rekomendasi Frame:</strong> Pilih bingkai berbahan akrilik/asetat transparan (<em>clear crystal</em> atau <em>smoke gray</em>). Padukan dengan lensa gradasi atau <strong>lensa Photochromic</strong> yang otomatis menggelap saat nongkrong di area outdoor. Look kamu langsung terlihat effortlessly cool, edgy, dan berjiwa muda!</p>
      </div>

      <p>Frame transparan memiliki kelebihan universal: tidak menutupi riasan wajah atau garis alis, namun tetap memberikan aksen kontemporer yang sangat fotogenik untuk konten feed dan reels kamu.</p>

      <h2>2. The Overworked Creative: Bold, Cerdas &amp; Anti Pusing</h2>
      <p>Deadline menumpuk, revisi bertubi-tubi, dan laptop menyala berjam-jam ditemani segelas iced matcha latte atau americano dingin. Ini adalah potret para desainer, penulis, arsitek, dan pekerja kreatif digital.</p>

      <!-- SLIDE 3 SHOWCASE -->
      <div class="slide-showcase">
        <span class="slide-tag">Tipe Persona • Slide 3</span>
        <img src="/blog/lifestyle-dcvcku/slide-3.jpg" alt="The Overworked Creative Frame Acetate Hitam Tebal" />
        <h3>The Overworked Creative: Frame Acetate Hitam Tebal Andalan</h3>
        <p><strong>Rekomendasi Frame:</strong> Frame <em>bold black acetate</em> tebal dengan siluet semi-kotak atau wayfarer. Kacamata ini adalah penyelamat terbaik untuk menyamarkan kantung mata lelah sehabis begadang, sekaligus memberikan impresi intelek, tegas, dan berwibawa.</p>
      </div>

      <p><strong>Tips Proteksi Mata:</strong> Jangan lupa pasangkan dengan <strong>Lensa Bluechromic Optik I See You</strong>. Lensa ini memblokir radiasi sinar biru dari layar monitor dan laptop secara maksimal, sehingga mata tidak cepat perih, tegang, atau pusing meski harus menatap layar seharian penuh.</p>

      <h2>3. The Aesthetic Minimalist: Clean, Kalem &amp; Quiet Luxury</h2>
      <p>Prinsip hidupnya adalah <em>less is more</em>. Meja kerjanya selalu rapi teratur, menyukai warna-warna earth tone netral, dan mengutamakan kenyamanan fungsional di atas segalanya.</p>

      <!-- SLIDE 4 SHOWCASE -->
      <div class="slide-showcase">
        <span class="slide-tag">Tipe Persona • Slide 4</span>
        <img src="/blog/lifestyle-dcvcku/slide-4.jpg" alt="The Aesthetic Minimalist Frame Tipis Clean Super Ringan" />
        <h3>The Aesthetic Minimalist: Frame Tipis, Clean, dan Super Ringan</h3>
        <p><strong>Rekomendasi Frame:</strong> Frame bermaterial titanium ultra-ringan atau kawat bundar tipis (<em>wire frame</em>) bernuansa rose gold, matte black, atau champagne. Kacamata ini hampir tidak terasa di wajah, tidak meninggalkan bekas merah di hidung, dan memancarkan aura *quiet luxury* yang elegan tanpa perlu berlebihan.</p>
      </div>

      <h2>Apapun Persona Kamu, Temukan Frame Pelengkapnya di Optik I See You</h2>
      <p>Karakter setiap orang itu unik, dan tidak ada satu frame kacamata yang cocok untuk semua orang. Karena itulah di Optik I See You, filosofi kami adalah <em>"for every you"</em>: kami hadir menyediakan ratusan pilihan siluet frame dan teknologi lensa yang pas dengan kebutuhan mata serta gaya hidupmu.</p>

      <!-- SLIDE 5 SHOWCASE -->
      <div class="slide-showcase">
        <span class="slide-tag">Gerai Resmi • Slide 5</span>
        <img src="/blog/lifestyle-dcvcku/slide-5.jpg" alt="Koleksi Lengkap Frame di Gerai Resmi Optik I See You" />
        <h3>Apapun Persona Kamu, Temukan Frame Pelengkapnya di Optik I See You</h3>
        <p>Mampir dan fitting langsung sepuasnya di gerai resmi Optik I See You terdekat: <strong>Purwokerto, Purbalingga, Wonosobo, dan Cilacap</strong>. Nikmati juga layanan konsultasi mata profesional dan periksa mata komputerisasi tanpa pungutan biaya!</p>
      </div>

      <p>Mau coba pasang di wajahmu sekarang juga? Buka menu <strong>AR Try-On</strong> di website ini dan temukan frame coffee shop impianmu dalam hitungan detik!</p>
    `
  },
  // ── 1. EDUKASI: CONTOURING WAJAH ALAMI LEWAT KACAMATA (Instagram Post Dc0mhoAj3e2) ──
  {
    slug: 'kacamata-contouring-wajah-alami-ilusi-optik',
    title: 'Kacamata Itu Contouring Wajah Alami: Trik Ilusi Optik yang Jarang Dibahas!',
    category: 'tips-pilih-frame',
    excerpt: 'Bukan sekadar alat bantu penglihatan, kacamata adalah teknik contouring alami tanpa sapuan makeup! Pelajari rahasia ilusi optik: dari trik hidung lebih mancung lewat bridge, pipi chubby auto-tirus dengan cat-eye, hingga melembutkan garis rahang kotak.',
    coverImage: '/blog/edukasi-dc0mho/slide-1.jpg',
    author: 'Tim Optik I See You',
    publishedAt: '2026-09-08T09:00:00Z',
    updatedAt: '2026-09-08T09:00:00Z',
    content: `
      <p>Banyak orang mengira bahwa mengubah proporsi wajah agar terlihat lebih tirus, mancung, atau proporsional hanya bisa dicapai lewat riasan makeup tebal seperti shading dan contouring. Padahal, ada satu rahasia estetika yang jauh lebih praktis dan bekerja secara permanen setiap kali Anda beraktivitas: <strong>kacamata adalah contouring wajah alami</strong>.</p>

      <p>Dalam dunia optik dan estetika visual, bingkai kacamata memegang peranan penting sebagai garis pembagi (visual divider) yang memandu ke mana arah mata lawan bicara tertuju. Dengan memahami anatomi bingkai, Anda bisa memanfaatkan ilusi optik ini untuk menyempurnakan fitur wajah terbaik Anda.</p>

      <!-- SLIDE 1 SHOWCASE -->
      <div class="slide-showcase">
        <span class="slide-tag">Edukasi Visual • Slide 1</span>
        <img src="/blog/edukasi-dc0mho/slide-1.jpg" alt="Kacamata itu Contouring Wajah Alami Trik Ilusi Optik Optik I See You" />
        <h3>Kacamata Itu Contouring Wajah Alami: Trik Ilusi Optik yang Jarang Dibahas!</h3>
        <p>Garis-garis anatomi pada wajah menunjukkan bagaimana posisi bingkai kacamata secara langsung mengubah persepsi simetri, panjang hidung, serta ketegasan tulang pipi dan rahang. Mari kita bedah satu per satu rahasia ilusi optiknya di bawah ini!</p>
      </div>

      <h2>1. Mau Hidung Kelihatan Lebih Mancung? Kuncinya di Bridge!</h2>
      <p>Banyak yang belum tahu bahwa persepsi panjang dan tingginya tulang hidung sangat dipengaruhi oleh posisi <em>bridge</em> (jembatan penghubung antara lensa kanan dan kiri).</p>

      <!-- SLIDE 2 SHOWCASE -->
      <div class="slide-showcase">
        <span class="slide-tag">Edukasi Visual • Slide 2</span>
        <img src="/blog/edukasi-dc0mho/slide-2.jpg" alt="Trik Kacamata Bikin Hidung Kelihatan Lebih Mancung" />
        <h3>Kuncinya Ada di Posisi Bridge Kacamata!</h3>
        <p><strong>Trik Rahasia:</strong> Pilih frame dengan <em>bridge</em> di posisi atas (high-bridge), jangan yang posisinya persis di tengah atau rendah. Bridge tinggi membiarkan batang hidung Anda terekspos lebih panjang dari atas ke bawah, menciptakan ilusi visual hidung yang lebih jenjang, ramping, dan mancung proporsional.</p>
      </div>

      <p>Sebaliknya, jika bridge berada terlalu rendah atau tebal tepat di tengah hidung, mata lawan bicara akan menangkap ilusi seolah-olah batang hidung terpotong menjadi lebih pendek. Maka bagi Anda yang ingin hidung terlihat lebih berdimensi tanpa contouring rumit, pilihlah frame dengan desain <em>keyhole bridge</em> atau palang atas yang ramping.</p>

      <h2>2. Pipi Chubby Jadi Auto-Tirus Tanpa Shading Tebal</h2>
      <p>Bagi pemilik pipi bulat (chubby) atau bentuk wajah bulat, sering kali muncul kekhawatiran bahwa memakai kacamata akan membuat wajah terlihat semakin lebar atau penuh.</p>

      <!-- SLIDE 3 SHOWCASE -->
      <div class="slide-showcase">
        <span class="slide-tag">Edukasi Visual • Slide 3</span>
        <img src="/blog/edukasi-dc0mho/slide-3.jpg" alt="Trik Kacamata Pipi Chubby Auto Tirus Efek Cat Eye" />
        <h3>Pipi Chubby Auto-Tirus dengan Sudut Luar yang Naik</h3>
        <p><strong>Trik Rahasia:</strong> Lupakan shading tebal! Kenakan frame yang sudut luarnya agak ditarik naik ke atas (seperti siluet <em>cat-eye</em>, <em>butterfly</em>, atau sudut atas kotak yang tegas). Desain sudut naik ini memberikan <strong>efek lifting visual</strong> instan, menarik fokus pandangan ke bagian pelipis atas wajah dan membuat garis rahang serta pipi tampak jauh lebih ramping.</p>
      </div>

      <p>Hindari kacamata bulat tebal berukuran kecil yang garis bawahnya bersentuhan langsung dengan puncak pipi saat Anda tersenyum. Siluet <em>cat-eye</em> dengan sudut melancip lembut adalah sahabat terbaik untuk menciptakan siluet wajah tirus seketika.</p>

      <h2>3. Rahang Kotak yang Tegas Jadi Lebih Lembut dan Kalem</h2>
      <p>Memiliki bentuk wajah persegi (square face) dengan sudut rahang yang kuat dan tegas sering kali memberikan impresi yang sangat formal atau kaku jika salah memilih bingkai.</p>

      <!-- SLIDE 4 SHOWCASE -->
      <div class="slide-showcase">
        <span class="slide-tag">Edukasi Visual • Slide 4</span>
        <img src="/blog/edukasi-dc0mho/slide-4.jpg" alt="Trik Kacamata untuk Rahang Kotak Menjadi Lebih Soft" />
        <h3>Lembutkan Garis Wajah dengan Siluet Round atau Oval</h3>
        <p><strong>Trik Rahasia:</strong> Buat Anda yang memiliki garis rahang tegas atau <em>square face</em>, hindari memilih frame kotak kaku dengan sudut 90 derajat tajam! Lembutkan fitur wajah Anda dengan memakai frame berlekuk bulat (<em>round</em>) atau oval agar keseluruhan proporsi look Anda terlihat lebih seimbang, ramah, dan santun.</p>
      </div>

      <p>Siluet bulat dengan material asetat transparan atau titanium tipis akan menetralisir kekakuan sudut rahang, memberikan keseimbangan proporsional antara dahi, pipi, dan dagu secara natural.</p>

      <h2>Coba Langsung Fitting di Wajahmu Sekarang!</h2>
      <p>Penasaran ingin melihat langsung efek contouring ini di wajah Anda? Di <strong>Optik I See You</strong>, kami menyediakan fasilitas modern untuk menemukan pasangan kacamata paling presisi:</p>

      <ul>
        <li><strong>Fitur AR Try-On Real-Time:</strong> Coba puluhan model frame langsung di depan kamera HP atau laptop Anda secara instan di website kami tanpa perlu download aplikasi.</li>
        <li><strong>Fitting &amp; Konsultasi Langsung di 4 Cabang:</strong> Kunjungi gerai resmi kami di <strong>Purwokerto, Purbalingga, Wonosobo, dan Cilacap</strong>. Tim refraksionis optisien kami siap membantu menganalisis bentuk wajah dan merekomendasikan frame yang paling menonjolkan keunikan karakter Anda.</li>
        <li><strong>Pemeriksaan Refraksi Digital Gratis:</strong> Dapatkan pengecekan mata akurat dengan alat komputerisasi mutakhir tanpa pungutan biaya!</li>
      </ul>
    `
  },
  // ── 1. EVENT BANYUMAS WEDDING EXPO - RITA SUPERMALL PURWOKERTO ────────────
  {
    slug: 'optik-i-see-you-banyumas-wedding-expo-rita-supermall',
    title: 'Optik I See You Hadir di Banyumas Wedding Expo 2026: Layanan Cek Mata dan Studio Photobooth Gratis di Rita SuperMall Purwokerto',
    category: 'info-cabang-promo',
    excerpt: 'Dokumentasi agenda Optik I See You di Banyumas Wedding Expo 2026 yang berlangsung pada 4-6 September 2026 di Ground Floor Rita SuperMall Purwokerto. Simak keseruan layanan periksa mata gratis dan instalasi photobooth interaktif kami.',
    coverImage: '/blog/covers/cover-wedding-expo-rsm.jpg',
    videoUrl: 'https://pub-e4717ece411e494f82f5057d8bb6382b.r2.dev/static/videos/rsm-wedding-expo.mp4',
    author: 'Tim Optik I See You',
    publishedAt: '2026-09-04T00:00:00Z',
    updatedAt: '2026-09-07T00:00:00Z',
    relatedCabang: 'Purwokerto',
    content: `
      <div class="border border-amber-300 bg-amber-50/90 rounded-2xl p-5 mb-8 shadow-xs">
        <div class="flex items-start gap-3">
          <span class="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-amber-200 text-amber-900 font-extrabold text-[11px] uppercase tracking-wider flex-shrink-0">
            Event Telah Berakhir
          </span>
          <p class="text-xs sm:text-sm text-amber-900 leading-relaxed">
            <strong>Informasi Status:</strong> Agenda pameran dan booth Optik I See You di <strong>Banyumas Wedding Expo 2026 (Rita SuperMall Purwokerto)</strong> telah resmi selesai diselenggarakan pada <strong>4-6 September 2026</strong>. Artikel ini tetap diarsipkan sebagai dokumentasi agenda resmi. Bagi Anda yang ingin melakukan periksa mata gratis atau mencari kacamata, silakan kunjungi gerai cabang Optik I See You terdekat.
          </p>
        </div>
      </div>

      <div class="border border-isy-line bg-white rounded-2xl p-6 sm:p-8 mb-8 shadow-xs">
        <div class="flex items-center justify-between flex-wrap gap-2 mb-2">
          <span class="text-xs uppercase tracking-widest text-isy-green-deep font-semibold block">Dokumentasi Agenda Resmi</span>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
            ● Status: Telah Selesai
          </span>
        </div>
        <h3 class="text-xl sm:text-2xl font-dm-serif text-isy-green-deep mb-4">Banyumas Wedding Expo 2026 bersama Optik I See You</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-isy-ink/80 pt-4 border-t border-isy-line">
          <div>
            <p class="font-semibold text-isy-green-deep mb-1">Jadwal Pelaksanaan</p>
            <p>Jumat sampai Minggu, 4-6 September 2026</p>
            <p class="text-amber-800 font-semibold text-xs">(Agenda Resmi Telah Selesai)</p>
          </div>
          <div>
            <p class="font-semibold text-isy-green-deep mb-1">Titik Lokasi Booth</p>
            <p>Ground Floor (GF), Rita SuperMall Purwokerto</p>
            <p>Tepat di depan J.CO Donuts &amp; Coffee dan sebelah Lift Utama</p>
          </div>
        </div>
      </div>

      <p>Optik I See You secara resmi berpartisipasi dalam agenda tahunan <strong>Banyumas Wedding Expo 2026</strong> yang diselenggarakan di Ground Floor Rita SuperMall Purwokerto. Kehadiran booth ini didedikasikan untuk memberikan kemudahan akses bagi masyarakat Purwokerto, pengunjung pusat perbelanjaan, serta calon mempelai yang sedang mempersiapkan kebutuhan hari pernikahan.</p>

      <p>Selama tiga hari penyelenggaraan, tim Optik I See You menghadirkan serangkaian fasilitas dan layanan penunjang tanpa dipungut biaya, disertai penawaran kurasi frame dan lensa berkualitas tinggi.</p>

      <figure>
        <img src="/blog/banyumas-wedding-expo-2026.jpg" alt="Poster Resmi Agenda Banyumas Wedding Expo 2026 di Rita SuperMall Purwokerto" />
        <figcaption>Dokumentasi resmi penyelenggaraan Banyumas Wedding Expo 2026 di Rita SuperMall Purwokerto.</figcaption>
      </figure>

      <h2>Panduan Menuju Lokasi Booth</h2>
      <p>Untuk memudahkan kunjungan Anda tanpa kendala di area pameran, berikut panduan letak booth Optik I See You:</p>
      
      <div class="bg-isy-mist/70 border border-isy-line rounded-xl p-5 sm:p-6 my-6">
        <ul class="space-y-2 text-isy-ink/90">
          <li><strong>Pusat Perbelanjaan:</strong> Rita SuperMall Purwokerto, Jl. Jend. Soedirman No. 296.</li>
          <li><strong>Lantai Pameran:</strong> Ground Floor (GF).</li>
          <li><strong>Titik Patokan Utama:</strong> Tepat berhadapan langsung dengan gerai J.CO Donuts &amp; Coffee.</li>
          <li><strong>Titik Akses Lift:</strong> Bersebelahan persis dengan pintu lift penumpang utama lantai GF.</li>
          <li><strong>Jam Operasional:</strong> 10.00 hingga 22.00 WIB setiap hari pameran.</li>
        </ul>
      </div>

      <h2>Program dan Layanan Utama Booth</h2>
      <p>Berikut rangkaian fasilitas yang dapat Anda nikmati secara langsung di booth Optik I See You selama periode expo:</p>

      <h3>1. Pemeriksaan Refraksi Mata Digital Tanpa Biaya</h3>
      <p>Pemeriksaan ketajaman penglihatan komprehensif menggunakan perangkat <em>auto-refractometer</em> terkomputerisasi. Layanan ini dipandu langsung oleh tenaga refraksionis optisien berpengalaman untuk mendeteksi minus, plus, maupun silinder secara akurat. Layanan ini terbuka bagi masyarakat umum tanpa pungutan biaya.</p>

      <h3>2. Fasilitas Studio Photobooth Gratis untuk Pengunjung</h3>
      <p>Abadikan momen kunjungan Anda bersama pasangan, keluarga, atau sahabat melalui instalasi photobooth interaktif kami. Dilengkapi pencahayaan profesional dan properti kacamata pilihan, hasil foto dapat langsung dicetak maupun diunduh dalam format digital resolusi tinggi.</p>

      <h3>3. Penawaran Khusus Kurasi Frame dan Lensa Modern</h3>
      <p>Kami menghadirkan pilihan frame unggulan yang mencakup material titanium ultra-ringan, asetat ergonomis, hingga desain modern minimalis. Pengunjung expo dapat menikmati penawaran paket khusus lensa perlindungan digital (Bluechromic dan Photochromic) yang hanya berlaku selama pameran berlangsung.</p>

      <h3>4. Konsultasi Khusus Calon Mempelai (Wedding Eye-Look)</h3>
      <p>Bagi calon pengantin yang tengah merancang penampilan pernikahan di Banyumas Wedding Expo, kami menyediakan sesi konsultasi pemilihan lensa kontak estetik yang nyaman digunakan sepanjang prosesi akad dan resepsi, serta panduan memilih siluet bingkai kacamata yang serasi dengan riasan wajah.</p>

      <h2>Galeri Dokumentasi Kemeriahan Booth di Rita SuperMall</h2>
      <p>Berikut rangkuman dokumentasi visual keseruan booth Optik I See You selama berlangsungnya Banyumas Wedding Expo 2026 di Ground Floor Rita SuperMall Purwokerto (dikutip dari dokumentasi resmi Instagram <a href="https://www.instagram.com/p/Dc5fUQID5Jw/" target="_blank" rel="noopener noreferrer" class="text-isy-green-deep font-semibold underline">@iseeyou.glasses</a>):</p>

      <!-- SLIDE 1 -->
      <div class="slide-showcase">
        <span class="slide-tag">Dokumentasi 1 • Day 1 Recap</span>
        <img src="/blog/wedding-expo/slide-1.jpg" alt="Day 1 Recap Booth Optik I See You di Rita Super Mall Purwokerto" />
        <h3>Day 1 Recap: Rita Super Mall PWT Pecah Banget!</h3>
        <p>Suasana semarak booth Optik I See You di Ground Floor Rita SuperMall Purwokerto sejak hari pertama pameran. Tata letak booth yang bersih, neon sign estetik (Acetate Material, Steel Material, I See You), dan deretan display kacamata modern langsung menyedot perhatian pengunjung mall.</p>
      </div>

      <!-- SLIDE 2 -->
      <div class="slide-showcase">
        <span class="slide-tag">Dokumentasi 2 • Good Vibes &amp; Wedding Couple</span>
        <img src="/blog/wedding-expo/slide-2.jpg" alt="Pengunjung dan Pengantin Kunjungi Booth Optik I See You" />
        <h3>Good Vibes, Busy Day, Happy Faces!</h3>
        <p>Keseruan interaksi antara tim Optik I See You dengan pengunjung expo. Kehadiran pasangan pengantin berbusana adat pernikahan tradisional yang ikut mengunjungi booth menjadi salah satu momen paling berkesan dan menambah hangat suasana expo.</p>
      </div>

      <!-- SLIDE 3 -->
      <div class="slide-showcase">
        <span class="slide-tag">Dokumentasi 3 • Antrean Cek Mata Digital</span>
        <img src="/blog/wedding-expo/slide-3.jpg" alt="Antusiasme Pengunjung Cek Mata Gratis di Booth Optik I See You" />
        <h3>POV: Niatnya Cuma Cuci Mata, Eh Malah Nyangkut di Booth ISY</h3>
        <p>Area pemeriksaan mata gratis menggunakan perangkat <em>auto-refractometer</em> digital terkomputerisasi dipadati pengunjung. Banyak yang awalnya hanya berniat jalan-jalan santai di mall, namun antusias memeriksakan kondisi ketajaman mata dan berkonsultasi seputar kacamata bersama tim kami.</p>
      </div>

      <!-- SLIDE 4 -->
      <div class="slide-showcase">
        <span class="slide-tag">Dokumentasi 4 • Fitting Frame Aesthetic</span>
        <img src="/blog/wedding-expo/slide-4.jpg" alt="Pengunjung Memilih dan Mencoba Frame Kacamata Aesthetic" />
        <h3>Sibuk Milih Frame Aesthetic</h3>
        <p>Para pengunjung asyik mencoba langsung (fitting) beragam koleksi frame kacamata unggulan. Dari bahan titanium super ringan hingga model asetat kekinian yang siap menunjang penampilan harian maupun acara spesial pernikahan.</p>
      </div>

      <!-- SLIDE 5 -->
      <div class="slide-showcase">
        <span class="slide-tag">Dokumentasi 5 • Studio Photobooth Interaktif</span>
        <img src="/blog/wedding-expo/slide-5.jpg" alt="Pengunjung Berpose Seru di Photobooth Gratis Optik I See You" />
        <h3>Keseruan Studio Photobooth Interaktif</h3>
        <p>Instalasi studio photobooth gratis menjadi daya tarik favorit bagi pengunjung dari berbagai kalangan. Pengunjung dapat berpose seru dengan properti kacamata pilihan dan mengabadikan momen kebersamaan secara instan di area expo.</p>
      </div>

      <h2>Kunjungan Cabang &amp; Layanan Berkelanjutan</h2>
      <p>Meskipun agenda pameran Banyumas Wedding Expo 2026 telah resmi berakhir pada <strong>6 September 2026</strong>, seluruh fasilitas dan layanan unggulan kami tetap hadir setiap hari untuk Anda.</p>
      
      <p>Bagi Anda yang belum sempat mampir atau ingin melanjutkan konsultasi resep kacamata, penyesuaian lensa, maupun memilih koleksi frame terbaru, Anda dapat langsung mengunjungi gerai cabang resmi Optik I See You terdekat (Purwokerto, Purbalingga, Cilacap, dan Wonosobo) atau menghubungi layanan pelanggan kami.</p>
    `
  },
  // ── 1. TIPS BENTUK WAJAH (Instagram Post Dcf4EGfD_af) ─────────────────────
  {
    slug: '5-tips-pilih-frame-bentuk-wajah',
    title: '5 Tips Pilih Frame Kacamata Sesuai Bentuk Wajah (+ Cheat Sheet Fitting)',
    category: 'tips-pilih-frame',
    excerpt: 'Sering kejadian liat kacamata di display cakep bener, giliran dipake sendiri kok malah aneh? Kuncinya ada di proporsi dan bentuk wajah lo! Cek cheat sheet lengkapnya di sini.',
    coverImage: '/blog/covers/cover-bentuk-wajah.jpg',
    author: 'Tim Optik I See You',
    publishedAt: '2026-08-26T08:00:00Z',
    updatedAt: '2026-08-26T08:00:00Z',
    content: `
      <p>Sering banget kejadian kan: pas liat kacamata di etalase display kelihatannya cakep dan estetik banget, tapi giliran dipakai sendiri kok rasanya kurang pas atau malah aneh? Tenang, kamu nggak sendirian! Kuncinya ternyata ada di keselarasan antara siluet frame kacamata dengan proporsi garis wajah kamu.</p>

      <h2>Kenapa Proporsi Wajah Itu Penting?</h2>
      <p>Setiap orang memiliki struktur tulang wajah yang unik. Frame kacamata yang tepat akan berfungsi sebagai penyeimbang fitur alami wajah kamu, misalnya melembutkan rahang yang tegas, atau memberikan definisi tajam pada wajah yang membulat. Berikut panduan praktis (cheat sheet) untuk menentukan frame yang tepat:</p>

      <h2>1. Wajah Bulat (Round Face)</h2>
      <p>Karakteristik wajah bulat memiliki lebar dan panjang yang hampir seimbang dengan garis rahang melengkung lembut. <strong>Rekomendasi Frame:</strong> Pilih frame dengan garis bersudut tegas seperti kotak (square), persegi panjang (rectangular), atau geometric frame. Hindari frame bulat kecil karena akan membuat wajah terkesan semakin penuh.</p>

      <h2>2. Wajah Kotak (Square Face)</h2>
      <p>Memiliki garis rahang yang tegas dan dahi yang proporsional sejajar. <strong>Rekomendasi Frame:</strong> Frame kacamata berbentuk bulat (round), oval, atau siluet cat-eye dengan lekukan halus akan melembutkan sudut rahang dan memberi kesan wajah lebih seimbang dan manis.</p>

      <h2>3. Wajah Oval (Oval Face)</h2>
      <p>Bentuk wajah ini paling fleksibel karena proporsinya simetris alami dari dahi hingga dagu. <strong>Rekomendasi Frame:</strong> Hampir semua siluet cocok untukmu! Kamu bisa bebas bereksperimen dengan model aviator, cat-eye, oversized retro, hingga kacamata titanium ultra-thin.</p>

      <h2>4. Wajah Hati (Heart Face)</h2>
      <p>Dahi lebih lebar dengan dagu yang meruncing lancip. <strong>Rekomendasi Frame:</strong> Pilih frame dengan aksen lebih tegas di bagian bawah atau frame cat-eye lembut untuk menyeimbangkan lebar dahi dengan dagu.</p>

      <h2>5. Wajah Panjang (Oblong Face)</h2>
      <p>Panjang wajah terlihat lebih dominan dibanding lebarnya. <strong>Rekomendasi Frame:</strong> Pilih model frame oversized square atau frame berbahan tebal (acetate chunky) untuk memberikan ilusi wajah yang lebih proporsional dan tidak terlalu ramping.</p>

      <p>Kalau kamu masih ragu nebak-nebak bentuk muka sendiri di depan kaca, langsung saja mampir ke toko Optik I See You terdekat. Tim kami siap bantuin fitting langsung dari ratusan koleksi frame sampai nemu yang vibe-nya beneran sesuai karaktermu!</p>
    `
  },

  // ── 2. HACK KACAMATA KINCLONG (Instagram Post DcTFA9Tj6MS) ────────────────
  {
    slug: 'hack-kacamata-kinclong-awet',
    title: 'Hack Kacamata Kinclong: 5 Kebiasaan Sepele yang Bikin Kacamata Cepat Baret & Melar',
    category: 'edukasi-mata',
    excerpt: 'Siapa yang kacamatanya kalau nggak blur karena noda jari, pasti buram gara-gara salah lap? Intip 5 kebiasaan buruk yang bikin kacamata rusak dan cara perawatannya.',
    coverImage: '/blog/covers/cover-hack-kinclong.jpg',

    author: 'Tim Optik I See You',
    publishedAt: '2026-08-21T08:00:00Z',
    updatedAt: '2026-08-21T08:00:00Z',
    content: `
      <p>Siapa di sini yang kacamatanya kalau nggak blur kena minyak pipi atau sidik jari, pasti buram karena dilap pakai baju sembarangan? Ngaku deh, sebagian besar pengguna kacamata pasti pernah melakukan kebiasaan-kebiasaan ini tanpa sadar.</p>

      <h2>5 Kebiasaan yang Bikin Kacamatamu Cepat Rusak:</h2>

      <h3>1. Copot Kacamata Pakai Satu Tangan</h3>
      <p>Ini kebiasaan paling umum yang sering disepelekan. Menarik kacamata dengan satu tangan memberikan tekanan berlebih pada satu sisi engsel (hinge). Akibatnya, baut kacamata cepat kendor, gagang menjadi longgar sebelah, dan posisi frame tidak lagi presisi di depan mata.</p>

      <h3>2. Mengelap Lensa Pakai Ujung Baju atau Tisu Kasar</h3>
      <p>Kain kaos, kemeja, atau tisu kering memiliki serat kayu mikroskopis yang bisa mengikis lapisan coating anti-radiasi dan meninggalkan goresan halus (micro-scratches) permanen. Selalu gunakan kain microfiber halus khusus kacamata!</p>

      <h3>3. Menaruh Kacamata Sembarangan</h3>
      <p>Meletakkan kacamata di kasur, jok mobil, atau sofa adalah resep bencana. Risiko terinjak, terduduki, atau terhimpit buku tebal sangat tinggi. Selalu biasakan memasukkan kacamata ke dalam hard case saat sedang tidak dipakai.</p>

      <h3>4. Menaruh Kacamata di Atas Kepala Seperti Bando</h3>
      <p>Gaya ini memang terlihat santai, tapi lebar kepala bagian atas jauh lebih lebar dibanding pelipis mata. Menaruh kacamata di kepala akan meregangkan engsel frame dan membuat kacamata gampang melorot saat dipakai di hidung.</p>

      <h3>5. Terpapar Suhu Panas Berlebih</h3>
      <p>Meninggalkan kacamata di dashboard mobil yang terparkir di bawah terik matahari bisa merusak lapisan coating lensa dan membuat frame berbahan asetat melengkung atau memuai.</p>

      <h2>Cara Membersihkan Kacamata yang Benar:</h2>
      <ol>
        <li>Bilas lensa dengan air mengalir suhu ruang untuk menghilangkan butiran debu pasir.</li>
        <li>Teteskan sedikit sabun cuci tangan lembut yang netral (tanpa pelembap/scrub).</li>
        <li>Gosok perlahan permukaan lensa dan bingkai hidung (nosepad) dengan jari.</li>
        <li>Bilas hingga bersih, lalu keringkan menggunakan kain microfiber bersih.</li>
      </ol>
      <p>Kacamata kesayanganmu juga butuh perhatian ekstra biar tetap awet, kokoh, dan selalu kinclong menemani aktivitas produktifmu setiap hari!</p>
    `
  },

  // ── 3. INSPIRASI STYLE SPIDER-MAN (Instagram Post Dbaf3HRj2e7) ───────────
  {

    slug: 'style-kacamata-spiderman-pop-culture',
    title: 'Bedah Style Kacamata Favorit Pemeran Spider-Man: Dari Retro Peter Parker ke Clean Aviator Tom Holland (+ Bocoran Kode Framenya!)',
    category: 'tren-gaya',
    excerpt: 'Ternyata rahasia visual para pemeran Spider-Man nggak cuma dari kostum ketatnya, tapi juga pilihan kacamatanya! Intip bocoran slide 2 sampai 8 lengkap dengan kode frame favorit yang bisa kamu cobain langsung di Optik I See You.',
    coverImage: '/blog/covers/cover-spiderman.jpg',
    author: 'Tim Optik I See You',
    publishedAt: '2026-07-30T08:00:00Z',
    updatedAt: '2026-07-30T08:00:00Z',
    content: `
      <p>Pernah nggak kamu bertanya-tanya, kenapa karakter Peter Parker selalu punya tempat spesial di hati jutaan penonton lintas generasi? Jawabannya sederhana: di balik jubah pahlawan super penyelamat dunia, Peter Parker adalah cowok biasa yang ramah, sedikit pemalu, pintar, dan tentu saja... <strong>selalu tampil ikonik dengan kacamatanya!</strong></p>

      <p>Dari era Tobey Maguire yang nerd-sweet, Andrew Garfield yang edgy berkarisma, sampai Tom Holland yang sporty dan sleek, kacamata mereka terbukti bukan sekadar alat bantu baca, tapi aksesori fashion yang mengangkat aura ketampanan dan karakter wajah secara instan.</p>

      <p>Menariknya, baru-baru ini akun resmi <strong>@iseeyou.glasses</strong> merilis postingan feed yang membocorkan koleksi frame yang mirip banget dengan kacamata para pemeran Spider-Man. Nggak perlu pesan jauh-jauh ke luar negeri, kamu bisa dapatkan frame-frame ini langsung di <strong>Optik I See You</strong>. Yuk kita bedah bocoran tiap slidenya di bawah ini!</p>

      <h2>Bocoran Koleksi Kacamata Spider-Man Slide demi Slide:</h2>

      <!-- SLIDE 2 -->
      <div class="slide-showcase">
        <span class="slide-tag">Slide 2 • The Legacy Aviator</span>
        <img src="/blog/spiderman/slide-2.jpg" alt="Kacamata Spider-Man Aviator Besi Kode Frame 82056" />
        <h3>Aviator Besi (Kode Frame: <span class="slide-code">82056</span>)</h3>
        <p>Siluet ini langsung mengingatkan kita pada kacamata legendaris berteknologi canggih warisan Tony Stark yang diwariskan ke Peter Parker. Desain <em>double bridge</em> metaliknya memberikan ilusi hidung lebih mancung dan garis rahang lebih tegas. Cocok banget buat cowok maupun cewek yang ingin tampil percaya diri saat meeting kerja atau hangout sore.</p>
      </div>

      <!-- SLIDE 3 -->
      <div class="slide-showcase">
        <span class="slide-tag">Slide 3 • The Classic Academic</span>
        <img src="/blog/spiderman/slide-3.jpg" alt="Kacamata Spider-Man Oval Lentur Kode Frame 86059" />
        <h3>Oval Lentur (Kode Frame: <span class="slide-code">86059</span>)</h3>
        <p>Gaya khas Peter Parker saat masih sibuk nugas di perpustakaan sekolah! Bentuk oval dengan lekukan halus ini melembutkan ekspresi wajah, memberikan aura ramah, santun, dan cerdas. Keunggulan utamanya ada di material tangkai yang <strong>super lentur dan fleksibel</strong>, jadi aman banget buat kamu yang suka ketiduran saat baca buku atau aktif bergerak.</p>
      </div>

      <!-- SLIDE 4 -->
      <div class="slide-showcase">
        <span class="slide-tag">Slide 4 • The Sleek Charmer</span>
        <img src="/blog/spiderman/slide-4.jpg" alt="Kacamata Spider-Man Aviator Besi Kode Frame 8009" />
        <h3>Aviator Besi Sleek (Kode Frame: <span class="slide-code">8009</span>)</h3>
        <p>Ingin gaya aviator tapi takut terlihat terlalu maskulin? Varian kode 8009 ini jawabannya. Dengan ketebalan garis bingkai yang lebih tipis dan proporsi lensa yang proporsional, frame ini memberi kesan <em>clean</em>, modern, dan sangat manis di wajah cewek maupun cowok. Dipadukan dengan outfit kaos putih polos dan blazer saja sudah langsung kelihatan mahal!</p>
      </div>

      <!-- SLIDE 5 -->
      <div class="slide-showcase">
        <span class="slide-tag">Slide 5 • 70s Creative Nostalgia</span>
        <img src="/blog/spiderman/slide-5.jpg" alt="Kacamata Spider-Man Aviator Besi Retro" />
        <h3>Aviator Besi Retro (Kode Frame: <span class="slide-code">Aviator</span>)</h3>
        <p>Tren kacamata retro 70-an kini kembali merajai dunia fashion. Siluet frame aviator dengan proporsi agak lebar ini memberikan nuansa vintage bohemian yang sangat fotogenik. Cocok bagi mahasiswa seni, fotografer, konten kreator, atau siapa pun yang ingin tampil beda dari kerumunan orang banyak.</p>
      </div>

      <!-- SLIDE 6 -->
      <div class="slide-showcase">
        <span class="slide-tag">Slide 6 • The Intellectual Rebel</span>
        <img src="/blog/spiderman/slide-6.jpg" alt="Kacamata Spider-Man Bold Square Kode Frame 5509" />
        <h3>Bold Square Acetate (Kode Frame: <span class="slide-code">5509</span>)</h3>
        <p>Inspirasi kuat dari gaya Andrew Garfield saat menjelma menjadi Peter Parker yang cerdas dan misterius di laboratorium. Bingkai kotak tebal berbahan asetat kokoh ini memberikan definisi tajam pada wajah bulat atau oval. Begitu kamu memakainya, kacamata ini langsung menjadi <em>statement piece</em> yang mempertegas tatapan mata kamu.</p>
      </div>

      <!-- SLIDE 7 -->
      <div class="slide-showcase">
        <span class="slide-tag">Slide 7 • The Everyday Versatile</span>
        <img src="/blog/spiderman/slide-7.jpg" alt="Kacamata Spider-Man Semi Kotak Kode Frame isv6076" />
        <h3>Semi Kotak (Kode Frame: <span class="slide-code">isv6076</span>)</h3>
        <p>Kalau kamu tipe orang yang malas gonta-ganti kacamata dan butuh satu kacamata 'tempur' untuk segala suasana, model semi kotak ISV6076 adalah juaranya! Bagian atasnya memiliki garis lurus yang rapi, sedangkan bagian bawahnya melengkung ergonomis. Dipakai untuk kuliah, kantor formal, sampai santai ngopi di akhir pekan selalu menyatu sempurna.</p>
      </div>

      <!-- SLIDE 8 -->
      <div class="slide-showcase">
        <span class="slide-tag">Slide 8 • The Golden Hour Statement</span>
        <img src="/blog/spiderman/slide-8.jpg" alt="Kacamata Spider-Man Aviator Besi Eksklusif" />
        <h3>Aviator Besi Eksklusif (Kode Frame: <span class="slide-code">Aviator</span>)</h3>
        <p>Kombinasi sempurna jika dipadukan dengan lensa <strong>Bluechromic</strong>! Di dalam ruangan lensanya jernih menjaga mata dari radiasi laptop, tapi begitu kamu keluar ruangan di bawah terik matahari, lensanya akan otomatis bertransisi menjadi gelap seperti sunglasses. Vibes pemeran utama film Hollywood langsung terpancar seketika!</p>
      </div>

      <!-- SLIDE 9 -->
      <div class="slide-showcase">
        <span class="slide-tag">Slide 9 • Outlet & Lokasi Toko</span>
        <img src="/blog/spiderman/slide-9.jpg" alt="Info Cabang Optik I See You Purwokerto Purbalingga Wonosobo Cilacap" />
        <h3>Koleksi Lengkapnya Siap Kamu Coba di 4 Cabang!</h3>
        <p>Semua frame Spider-Man di atas bukan sekadar pajangan di katalog online lho! Kamu bisa datang langsung, pegang fisiknya, dan <strong>coba fitting sepuasnya</strong> di 4 cabang resmi Optik I See You:</p>
        <ul>
          <li><strong>Purwokerto:</strong> Jl. Sunan Ampel No. 5, Sidamulya, Kedungmalang.</li>
          <li><strong>Purbalingga:</strong> Jl. Onje No. 1, Purbalingga Lor.</li>
          <li><strong>Wonosobo:</strong> Jl. Jendral Soedirman, Sumberan Selatan, Wonosobo Barat.</li>
          <li><strong>Cilacap:</strong> Jl. Rinjani Depan Perum GRP No. 2 Ruko Rawangaru, Sidanegara.</li>
        </ul>
      </div>

      <h2>Kenapa Harus Cari Kacamata Spider-Man Kamu di Optik I See You?</h2>
      <ul>
        <li><strong>Cek Mata Digital Gratis:</strong> Dilakukan oleh tenaga refraksionis berpengalaman dengan mesin komputer akurat tanpa dipungut biaya sepeser pun.</li>
        <li><strong>Faset Cepat Bisa Ditunggu:</strong> Kacamata baru kamu bisa langsung jadi dalam waktu 20-30 menit saja, nggak perlu nunggu berhari-hari!</li>
        <li><strong>Harga Transparan &amp; Bersahabat:</strong> Nggak bikin kantong jebol, ada ratusan opsi frame trendy dengan kualitas material yang awet tahan lama.</li>
      </ul>

      <p>Jadi, dari sekian banyak gaya pemeran Spider-Man di atas, mana siluet frame yang paling menggambarkan kepribadian kamu? Screenshot kodenya sekarang dan langsung bawa ke cabang Optik I See You terdekat ya!</p>
    `
  },


  // ── 4. EDUKASI KACAMATA ANTI RADIASI (Instagram Post DaSHQdmD9Zp) ─────────
  {
    slug: '3-alasan-kacamata-anti-radiasi-wajib',
    title: '3 Alasan Penting Kenapa Kacamata Anti Radiasi Wajib Jadi Daily Essentials Kamu',
    category: 'edukasi-mata',
    excerpt: 'Mata gampang lelah dan sering pusing sehabis scrolling medsos atau nugas berjam-jam? Ini 3 alasan kenapa kacamata anti-radiasi wajib jadi daily essentials kamu.',
    coverImage: '/blog/covers/cover-anti-radiasi.jpg',
    author: 'Tim Optik I See You',
    publishedAt: '2026-07-01T08:00:00Z',
    updatedAt: '2026-07-01T08:00:00Z',
    content: `
      <p>Di era digital sekarang, hampir mustahil kita bisa lepas dari layar smartphone, tablet, laptop, dan televisi. Rata-rata orang Indonesia menghabiskan waktu lebih dari 7 hingga 9 jam setiap harinya di depan layar digital. Tanpa perlindungan yang memadai, mata kita terus-menerus dibombardir oleh radiasi sinar biru berenergi tinggi (High Energy Visible Blue Light).</p>

      <h2>3 Alasan Kenapa Kacamata Anti-Radiasi Wajib Kamu Miliki:</h2>

      <h3>1. Mengurangi Beban Kerja Mata &amp; Mencegah Digital Eye Strain</h3>
      <p>Sinar biru memiliki panjang gelombang pendek yang mudah menyebar dan sulit difokuskan oleh lensa mata secara alami. Hal ini memaksa otot siliaris mata berkontraksi lebih keras agar gambar tetap tajam. Lensa anti radiasi (Blue Cut) memblokir spektrum sinar berbahaya ini sehingga mata terasa jauh lebih rileks saat menatap layar berjam-jam.</p>

      <h3>2. Membantu Tidur Malam Jauh Lebih Pulas</h3>
      <p>Paparan sinar biru dari layar gadget di malam hari memanipulasi otak kita untuk berpikir bahwa hari masih siang. Akibatnya, produksi hormon melatonin (hormon pengatur siklus tidur) terhambat, memicu insomnia dan kualitas tidur yang buruk. Dengan kacamata anti radiasi, ritme sirkadian tubuhmu akan tetap terlindungi.</p>

      <h3>3. Investasi Kesehatan Jangka Panjang untuk Retina</h3>
      <p>Paparan radiasi sinar berlebih dalam jangka panjang dikaitkan dengan risiko kerusakan oksidatif pada sel-sel fotoreseptor retina. Mencegah jauh lebih baik daripada mengobati: memakai kacamata pelindung sejak usia muda adalah langkah cerdas menjaga ketajaman penglihatan di masa depan.</p>

      <p>Di Optik I See You, lensa anti radiasi tersedia baik untuk mata normal (tanpa minus) maupun bagi kamu yang memiliki resep minus dan silinder. Lindungi matamu hari ini juga!</p>
    `
  },

  // ── 5. TREND GAJI & CATEYE (Instagram Post DaSHSc1D9Fk) ───────────────────
  {
    slug: 'tren-self-reward-gajian-frame-cateye',
    title: 'Tren Self-Reward Gajian: Kenapa Frame Cat-Eye Jadi Pilihan Paling Worth It?',
    category: 'tren-gaya',
    excerpt: '99% gaji kamu bulan ini larinya ke mana nih? Daripada belanja impulsif yang cepat habis, self-reward frame cat-eye adalah investasi visual yang dipakai setiap hari.',
    coverImage: '/blog/covers/cover-self-reward-cateye.jpg',
    author: 'Tim Optik I See You',
    publishedAt: '2026-07-01T08:00:00Z',
    updatedAt: '2026-07-01T08:00:00Z',
    content: `
      <p>Hayo ngaku, pas tanggal gajian tiba, 99% saldo kamu larinya ke mana nih? Setelah sebulan penuh banting tulang, nahan pusing revisi kerjaan, atau sekadar pura-pura sibuk di depan laptop, self-reward itu hukumnya wajib untuk mengapresiasi diri sendiri!</p>

      <h2>Kenapa Kacamata Adalah Self-Reward Terbaik?</h2>
      <p>Banyak dari kita yang menghabiskan uang gajian untuk kopi kekinian atau outfit yang hanya dipakai sekali dua kali. Padahal, kacamata adalah barang yang kamu pakai setiap hari, dari pagi hingga malam, dan langsung berada di pusat perhatian wajahmu. Meng-upgrade kacamata ke model yang lebih stylish dan lensa yang lebih nyaman adalah bentuk self-care yang nyata dampaknya.</p>

      <h2>Daya Tarik Koleksi Cat-Eye: Cateye Caramel &amp; Cateye Skena</h2>
      <p>Salah satu siluet paling diburu pelanggan di Optik I See You adalah koleksi Cat-Eye Edition. Apa sih rahasianya?</p>
      <ul>
        <li><strong>Efek Visual Facelift Alami:</strong> Lekukan sudut atas frame cat-eye memberikan ilusi mengangkat tulang pipi, membuat wajah terlihat lebih proporsional, tirus, dan manis seketika.</li>
        <li><strong>Varian Warna Hangat (Caramel &amp; Honey Tortoise):</strong> Palet warna earthy caramel sangat menyatu dengan undertone kulit wanita Indonesia, memberikan kilau elegan tanpa terkesan berlebihan.</li>
        <li><strong>Material Acetate Berkualitas:</strong> Kokoh, tidak mudah patah, dan sangat nyaman bertengger di hidung sepanjang hari.</li>
      </ul>

      <p>Jangan biarkan gajianmu lewat begitu saja tanpa self-reward yang bermanfaat jangka panjang. Cek koleksi Cat-Eye Edition langsung di toko kami atau coba via AR Try-On di smartphone kamu sekarang!</p>
    `
  },

  // ── 6. MATA SERING PERIH SCREEN TIME (Instagram Post DZ7OajuDxtv) ─────────
  {
    slug: 'mata-sering-perih-screen-time',
    title: 'Mata Sering Terasa Perih Saat Menatap Layar? Cek Screen Time & Rule 20-20-20 Ini',
    category: 'edukasi-mata',
    excerpt: 'Mata perih bukan berarti harus ditahan atau dinormalisasi. Kenali penyebab mata kering akibat screen time berlebih dan cara meredakannya dengan aturan 20-20-20.',
    coverImage: '/blog/covers/cover-mata-perih.jpg',
    author: 'Tim Optik I See You',
    publishedAt: '2026-06-23T08:00:00Z',
    updatedAt: '2026-06-23T08:00:00Z',
    content: `
      <p>Pernahkah kamu merasakan sensasi mata pedih, terasa berpasir, atau sering berair sendiri saat sedang fokus bekerja di depan monitor atau scrolling HP? Rasa tidak nyaman ini sering kali kita abaikan dan dianggap hal sepele, padahal itu adalah alarm peringatan dari mata kamu!</p>

      <h2>Kenapa Menatap Layar Bikin Mata Perih?</h2>
      <p>Secara normal, manusia berkedip sekitar 15 sampai 20 kali per menit. Berkedip berfungsi melapisi kornea mata dengan lapisan air mata (tear film) yang kaya nutrisi dan pelumas alami. Namun, ketika kita menatap layar digital dengan konsentrasi tinggi, frekuensi berkedip menurun hingga 50-60%! Akibatnya, permukaan mata mengering, teriritasi, dan menimbulkan rasa perih menyengat.</p>

      <h2>Terapkan "Rule 20-20-20" Setiap Hari:</h2>
      <p>Metode sederhana yang direkomendasikan oleh para dokter mata dunia ini sangat ampuh meredakan ketegangan otot visual:</p>
      <ul>
        <li><strong>Setiap 20 Menit:</strong> Istirahatkan mata sejenak dari menatap layar monitor atau ponsel.</li>
        <li><strong>Lihat Sejauh 20 Kaki (sekitar 6 Meter):</strong> Arahkan pandangan keluar jendela atau ke ujung ruangan untuk melemaskan otot fokus mata.</li>
        <li><strong>Selama 20 Detik:</strong> Berkedip secara perlahan dan teratur beberapa kali untuk membasahi kembali kornea mata.</li>
      </ul>

      <h2>Tips Tambahan Menjaga Kelembapan Mata:</h2>
      <ol>
        <li>Atur jarak layar monitor minimal 50-60 cm dari posisi mata.</li>
        <li>Hindari hembusan angin AC yang mengarah langsung ke wajah.</li>
        <li>Gunakan lensa kacamata dengan anti-refleksi atau tetes mata penyegar (artificial tears) jika diperlukan.</li>
      </ol>
      <p>Jika rasa perih tidak kunjung hilang, bisa jadi kamu membutuhkan penyesuaian resep kacamata. Mampir ke cabang Optik I See You terdekat untuk pemeriksaan mata lengkap secara gratis!</p>
    `
  },

  // ── 7. KEPALA PUSING TANDA GANTI KACAMATA (Instagram Post DaDBUaRj4fy) ─────
  {
    slug: 'kepala-sering-pusing-tanda-ganti-kacamata',
    title: 'Tiap Hari Kepala Pusing Kirain Kurang Healing, Ternyata Kacamatamu Minta Ganti!',
    category: 'edukasi-mata',
    excerpt: 'Sering pusing tiap sore kirain butuh healing atau liburan? Tanpa disadari, kacamata yang kamu pakai setiap hari bisa jadi sudah minta diganti. Cek tanda-tandanya!',
    coverImage: '/blog/covers/cover-kepala-pusing.jpg',
    author: 'Tim Optik I See You',
    publishedAt: '2026-06-26T08:00:00Z',
    updatedAt: '2026-06-26T08:00:00Z',
    content: `
      <p>Pernah nggak kamu merasa kepala sering pusing, berdenyut di pelipis, atau leher tegang setiap sore menjelang pulang kerja? Pikiran pertama pasti: <em>"Wah, kayaknya gue butuh healing atau liburan nih."</em> Tapi pas udah liburan dan istirahat, rasa pusing itu tetap balik lagi saat kamu beraktivitas. Jangan-jangan, biang keroknya ada tepat di depan matamu!</p>

      <h2>Tanda-Tanda Kacamata Kamu Sudah Minta Diganti:</h2>

      <h3>1. Ukuran Minus atau Silinder Sudah Bergeser</h3>
      <p>Kondisi refraksi mata manusia bisa berubah seiring waktu akibat faktor usia, kebiasaan melihat dekat, atau gaya hidup kerja. Jika ukuran kacamata lama sudah tidak sesuai, otot mata dipaksa bekerja ekstra keras untuk mengakomodasi bayangan agar tidak buram. Ketegangan otot konstan inilah yang memicu sakit kepala tegang (tension headache).</p>

      <h3>2. Lensa Penuh Baret Halus atau Coating Terkelupas</h3>
      <p>Lensa yang baret akan membiaskan cahaya secara tidak teratur (scattered light), membuat mata cepat lelah dan silau saat melihat lampu kendaraan di malam hari.</p>

      <h3>3. Frame Longgar, Bengkok, atau Sering Melorot</h3>
      <p>Ketika frame melorot ke bawah, titik pusat optik lensa (optical center) tidak lagi sejajar dengan pupil matamu. Pergeseran beberapa milimeter saja bisa menimbulkan efek prisma yang membuat penglihatan tidak nyaman dan memicu pusing.</p>

      <h3>4. Kacamata Sudah Dipakai Lebih dari 1-2 Tahun Tanpa Pengecekan Ulang</h3>
      <p>Para ahli optometris menyarankan pemeriksaan mata minimal setahun sekali untuk memastikan kesehatan mata dan ketepatan resep lensa kamu.</p>

      <h2>Solusinya? Cek Mata Gratis di Optik I See You!</h2>
      <p>Kamu nggak perlu bingung nebak-nebak ukuran mata. Di semua cabang Optik I See You (Purwokerto, Purbalingga, Wonosobo, Cilacap), kamu bisa melakukan <strong>pemeriksaan mata digital komputerisasi secara GRATIS</strong> didampingi refraksionis berpengalaman.</p>
    `
  },

  // ── 8. LENSA BLUECHROMIC (Instagram Post DcnC_KZkSsC) ────────────────────
  {
    slug: 'lensa-bluechromic-anti-radiasi',
    title: 'Lensa Bluechromic: Investasi Terbaik Buat Kamu yang Menatap Layar Laptop Seharian',
    category: 'edukasi-mata',
    excerpt: 'Tiap hari staring contest sama layar laptop dan HP bikin mata pegal dan perih? Kombinasi frame estetik dan lensa bluechromic adalah ultimate combo biar tetap produktif.',
    coverImage: '/blog/covers/cover-bluechromic.jpg',
    author: 'Tim Optik I See You',
    publishedAt: '2026-08-28T08:00:00Z',
    updatedAt: '2026-08-28T08:00:00Z',
    content: `
      <p>Berapa jam dalam sehari kamu menatap layar laptop, tablet, dan smartphone? Jika kamu bekerja kantoran, mahasiswa, atau content creator, rata-rata waktu di depan layar bisa mencapai 8 hingga 12 jam per hari. Tanpa disadari, paparan sinar biru (blue light) dari perangkat digital dan sinar UV matahari saat beraktivitas di luar ruangan adalah penyebab utama mata cepat lelah, kering, hingga migrain.</p>

      <h2>Apa Itu Lensa Bluechromic?</h2>
      <p>Lensa Bluechromic adalah lensa teknologi hibrida yang menggabungkan dua perlindungan superior dalam satu kacamata:</p>
      <ul>
        <li><strong>Fitur Blue Ray Filter:</strong> Memblokir radiasi sinar biru berlebih yang dipancarkan layar monitor dan HP, sehingga mata tidak cepat lelah dan kualitas tidur malam tetap terjaga.</li>
        <li><strong>Fitur Photochromic:</strong> Lensa akan otomatis menggelap (menjadi sunglasses) saat kamu melangkah keluar ruangan terpapar sinar matahari UV, dan kembali jernih seketika saat masuk ke dalam ruangan.</li>
      </ul>

      <h2>Keunggulan Utama Menggunakan Lensa Bluechromic:</h2>
      <ol>
        <li><strong>Praktis 2-in-1:</strong> Tidak perlu repot gonta-ganti kacamata baca dan sunglasses saat beraktivitas indoor maupun outdoor.</li>
        <li><strong>Mencegah Sindrom Penglihatan Komputer (CVS):</strong> Mengurangi gejala mata perih, penglihatan berbayang, dan ketegangan otot leher akibat menatap layar berjam-jam.</li>
        <li><strong>Tampilan Tetap Trendy:</strong> Transisi warna lensa saat terkena sinar matahari memberikan kesan stylish dan eksklusif pada frame kacamata pilihanmu.</li>
      </ol>

      <h2>Cek Mata Gratis di Optik I See You</h2>
      <p>Daripada menahan rasa pegal dan pusing tiap sore, yuk periksakan kondisi matamu sekarang di Optik I See You terdekat!</p>
    `
  },

  // ── 9. PANDUAN MERAWAT SOFTLENS (Instagram Post Dcnl288kWyo) ─────────────
  {
    slug: 'panduan-merawat-softlens',
    title: 'Panduan Lengkap Merawat Softlens: 3 Aturan Dasar Biar Mata Tetap Sehat & Nyaman',
    category: 'perawatan-softlens',
    excerpt: 'Pake softlens emang bikin look makin cakep, tapi maintenance-nya juga harus bener dong! Jangan sampai malas ganti cairan di lens case atau nekat pakai air keran.',
    coverImage: '/blog/covers/cover-softlens.jpg',
    author: 'Tim Optik I See You',
    publishedAt: '2026-08-29T08:00:00Z',
    updatedAt: '2026-08-29T08:00:00Z',
    content: `
      <p>Memakai softlens memang langsung bikin mata terlihat lebih berdimensi, fresh, dan OOTD makin percaya diri. Tapi jangan sampai karena malas merawat, mata kamu malah kena iritasi atau infeksi! Kornea mata kita adalah organ yang sangat sensitif dan butuh suplai oksigen yang cukup setiap harinya.</p>

      <h2>3 Aturan Wajib (Basic Rules) Pengguna Softlens:</h2>

      <h3>1. Selalu Cuci & Keringkan Tangan Sebelum Menyentuh Lensa</h3>
      <p>Jangan pernah sekali-kali menyentuh softlens dengan tangan yang kotor atau basah kuyup oleh air keran biasa. Cuci tangan dengan sabun tanpa pewangi atau pelembap berlebih, lalu keringkan menggunakan tisu atau handuk bebas serat (lint-free).</p>

      <h3>2. Haram Pakai Air Keran, Air Mineral, atau Cairan Bekas</h3>
      <p>Air keran mengandung mikroorganisme seperti <em>Acanthamoeba</em> yang bisa menyebabkan infeksi parah pada kornea mata. Selalu gunakan cairan khusus (multi-purpose contact lens solution) steril. Buang cairan lama di lens case setiap hari dan isi dengan cairan yang baru, jangan ditumpuk!</p>

      <h3>3. Jangan Pernah Tidur Menggunakan Softlens</h3>
      <p>Saat tidur, mata kita tertutup sehingga pasokan oksigen ke kornea menurun drastis. Jika softlens masih menempel di mata saat tidur, kornea bisa mengalami hipoksia (kekurangan oksigen) yang memicu peradangan hebat dan rasa perih menyengat saat bangun tidur.</p>

      <h2>Berapa Lama Boleh Dipakai Dalam Sehari?</h2>
      <p>Waktu pemakaian ideal softlens harian adalah 6 sampai 8 jam sehari. Jika mata mulai terasa kering saat bekerja di ruangan ber-AC, selalu sediakan tetes mata khusus lensa kontak (re-wetting drops) agar kelembapan mata tetap terjaga optimal.</p>

      <p>Lagi cari softlens yang nyaman, kadar air seimbang, dan warnanya menyatu natural dengan mata aslimu? Kunjungi katalog softlens Optik I See You sekarang juga!</p>
    `
  },

  // ── 10. TREN FRAME 2026 ──────────────────────────────────────────────────
  {
    slug: 'tren-frame-kacamata-2026',
    title: 'Tren Frame Kacamata 2026: Dari Cat Eye ke Translucent Tortoise',
    category: 'tren-gaya',
    excerpt: 'Kacamata kini jadi fashion statement utama. Simak tren siluet frame paling diminati di tahun 2026, mulai dari The Feline Silhouette hingga The Skena Gaze.',
    coverImage: '/blog/covers/cover-tren-frame-2026.jpg',
    author: 'Tim Optik I See You',
    publishedAt: '2026-09-08T08:00:00Z',
    updatedAt: '2026-09-08T08:00:00Z',
    content: `
      <p>Kacamata kini bukan sekadar alat bantu penglihatan, melainkan bagian dari <em>fashion statement</em> yang menyempurnakan OOTD harian. Memasuki tahun 2026, tren gaya frame kacamata memadukan unsur klasik retro dengan sentuhan modern futuristik yang clean dan berkarakter.</p>

      <h2>1. The Feline Silhouette: Modern Cat-Eye</h2>
      <p>Bentuk bingkai terinspirasi cat-eye kembali mendominasi runway fashion. Kali ini hadir dengan proporsi yang lebih ergonomis dan sudut atas yang anggun, memberikan efek visual lifting alami pada tulang pipi.</p>

      <h2>2. The Lucid Vision: Bingkai Translucent Clear</h2>
      <p>Bahan asetat transparan bening, champagne, dan sage green memberikan kesan segar tanpa menutupi ekspresi wajah asli pemakainya. Sangat cocok dipadukan dengan gaya minimalis modern.</p>

      <h2>3. The Skena Gaze: Oversized Chunky Statement</h2>
      <p>Frame kotak berani dengan tepi tebal yang tegas memberikan aura retro 90s yang kuat dan estetik bagi pecinta street-style serta festival fashion.</p>

      <h2>4. Titanium Ultra-Thin</h2>
      <p>Bagi yang mengutamakan kenyamanan seharian, frame titanium ultra-ringan dengan bobot di bawah 15 gram menjadi pilihan utama profesional muda.</p>

      <p>Semua seri tren frame ini bisa kamu temukan dan coba langsung di katalog Optik I See You!</p>
    `
  },

  // ── 11. CARA BACA RESEP KACAMATA ─────────────────────────────────────────
  {
    slug: 'cara-baca-resep-kacamata',
    title: 'Cara Baca Resep Kacamata: Apa Itu SPH, CYL, dan AXIS?',
    category: 'edukasi-mata',
    excerpt: 'Pusing melihat resep kacamata yang isinya angka dan singkatan? Pelajari arti SPH, CYL, AXIS, ADD, dan PD agar tidak bingung lagi saat memilih lensa.',
    coverImage: '/blog/covers/cover-resep-kacamata.jpg',
    author: 'Tim Optik I See You',
    publishedAt: '2026-08-15T08:00:00Z',
    updatedAt: '2026-08-15T08:00:00Z',
    content: `
      <p>Melihat resep kacamata dari optometris sering kali membingungkan karena banyaknya istilah teknis. Berikut arti dari singkatan-singkatan penting tersebut:</p>

      <h2>1. SPH (Sphere / Sferis)</h2>
      <p>Menunjukkan kekuatan lensa untuk mengoreksi rabun jauh (tanda minus -) atau rabun dekat (tanda plus +).</p>

      <h2>2. CYL (Cylinder) &amp; AXIS (Derajat)</h2>
      <p>CYL mengukur besarnya silinder (astigmatisme) akibat kelengkungan kornea yang tidak simetris, sedangkan AXIS (1-180 derajat) menunjukkan posisi rotasi silinder tersebut pada lensa.</p>

      <h2>3. PD (Pupillary Distance)</h2>
      <p>Jarak antara pusat pupil mata kanan dan kiri dalam milimeter. PD yang presisi memastikan titik fokus optik berada tepat di depan pandangan mata Anda.</p>

      <p>Ingin resep mata terupdate yang akurat? Kunjungi Optik I See You untuk pemeriksaan mata gratis dengan alat komputer modern!</p>
    `
  },
  // ── 12. BIAYA GANTI LENSA KACAMATA (Non-Brand High Intent SEO) ───────────
  {
    slug: 'biaya-ganti-lensa-kacamata-jenis-harga',
    title: 'Biaya Ganti Lensa Kacamata: Daftar Harga Lengkap, Jenis Lensa & Tips Hemat di Optik',
    category: 'edukasi-mata',
    excerpt: 'Berapa biaya ganti lensa kacamata di optik? Simak rincian estimasi harga lensa minus, anti radiasi blueray, photochromic, bluechromic, dan tips hemat ganti lensa bawa frame sendiri.',
    coverImage: '/fasilitas/mesin potong otomatis.webp',
    author: 'Tim Optik I See You',
    publishedAt: '2026-09-10T09:00:00Z',
    updatedAt: '2026-09-10T09:00:00Z',
    content: `
      <p>Sering kali kita berada di situasi di mana bingkai (frame) kacamata kesayangan masih sangat bagus, kokoh, dan cocok dengan bentuk wajah kita, tetapi lensa kacamata sudah penuh baret halus, buram, atau ukuran minus dan silinder mata sudah bertambah. Pertanyaan paling umum yang sering diajukan pelanggan adalah: <strong>Berapa sih biaya ganti lensa kacamata di optik? Dan apakah bisa hanya ganti lensa saja tanpa beli frame baru?</strong></p>

      <p>Jawabannya: <strong>Bisa banget!</strong> Di Optik I See You, Anda bebas membawa frame kacamata sendiri dari rumah untuk dipasangkan lensa baru dengan ukuran resep mata yang paling terupdate.</p>

      <h2>Estimasi Rincian Biaya Ganti Lensa Kacamata Sesuai Jenisnya</h2>
      <p>Biaya ganti lensa kacamata sangat bervariasi tergantung pada fitur teknologi perlindungan yang disematkan pada lensa, indeks ketipisan, serta besarnya resep minus atau silinder Anda. Berikut rincian kisaran harga yang umum di pasaran dan gerai resmi:</p>

      <div class="bg-isy-mist/70 border border-isy-line rounded-2xl p-5 my-6">
        <ul class="space-y-3 text-isy-ink/90">
          <li><strong>1. Lensa Standar CRMC (Anti Refleksi Dasar):</strong> Kisaran Rp100.000 - Rp150.000. Pilihan paling ekonomis dengan lapisan anti pantul standar dan perlindungan goresan dasar untuk mata normal maupun minus rendah.</li>
          <li><strong>2. Lensa Anti Radiasi Blueray (Blue Cut):</strong> Kisaran Rp150.000 - Rp250.000. Wajib untuk mahasiswa, pekerja kantor, dan siapa saja yang menatap layar monitor atau smartphone lebih dari 6 jam sehari. Memblokir radiasi sinar biru berlebih agar mata tidak cepat lelah dan perih.</li>
          <li><strong>3. Lensa Photochromic (Lensa Bunglon Transisi UV):</strong> Kisaran Rp200.000 - Rp350.000. Lensa pintar yang otomatis menggelap seperti kacamata hitam saat terkena sinar matahari luar ruangan dan kembali bening jernih di dalam ruangan.</li>
          <li><strong>4. Lensa Bluechromic (Ultimate 2-in-1 Combo):</strong> Kisaran Rp300.000 - Rp450.000. Menggabungkan teknologi anti radiasi komputer dan photochromic transisi UV dalam satu pasang lensa. Sangat praktis bagi Anda yang aktif bekerja indoor dan sering beraktivitas outdoor.</li>
          <li><strong>5. Lensa High Index Tipis (1.61 / 1.67 / 1.74):</strong> Kisaran Rp350.000 - Rp750.000+. Didesain khusus bagi pemilik minus tinggi (-4.00 ke atas) atau silinder tebal agar tepi lensa 30% hingga 50% lebih tipis, ringan, dan tidak tampak menonjol keluar dari bingkai kacamata.</li>
          <li><strong>6. Lensa Progresif (Multifokal Tanpa Batas):</strong> Kisaran Rp350.000 - Rp800.000+. Solusi bagi usia 40 tahun ke atas yang membutuhkan penglihatan jarak jauh dan jarak baca dekat sekaligus tanpa garis batas di lensa.</li>
        </ul>
      </div>

      <h2>Kapan Waktu yang Tepat untuk Mengganti Lensa Kacamata?</h2>
      <ol>
        <li><strong>Sering Mengalami Pusing di Pelipis:</strong> Jika Anda sering sakit kepala atau leher tegang saat membaca atau bekerja, otot fokus mata kemungkinan bekerja ekstra keras karena ukuran minus/silinder sudah bergeser.</li>
        <li><strong>Lensa Penuh Baret Mikroskopis:</strong> Goresan pada lapisan coating lensa menyebabkan pembiasan cahaya tidak beraturan (glare), membuat mata silau saat berkendara di malam hari.</li>
        <li><strong>Lapisan Coating Mulai Mengelupas:</strong> Terlihat seperti bercak pelangi atau bintik minyak yang tidak bisa hilang meski dilap dengan kain microfiber.</li>
        <li><strong>Sudah Lebih dari 1 Tahun:</strong> Dokter mata dan optometris menganjurkan pemeriksaan refraksi berkala minimal 12 bulan sekali.</li>
      </ol>

      <h2>Kenapa Harus Ganti Lensa di Optik I See You?</h2>
      <ul>
        <li><strong>Periksa Mata Komputerisasi Gratis:</strong> Menggunakan mesin Autorefractor digital berakurasi tinggi tanpa biaya sepeser pun.</li>
        <li><strong>Faset Express CNC Bisa Ditunggu:</strong> Lab internal kami dilengkapi mesin pemotong lensa 3D Tracing CNC otomatis, sehingga proses pengerjaan kacamata resep standar bisa selesai dalam 20 hingga 30 menit saja!</li>
        <li><strong>Bisa Bawa Frame Sendiri:</strong> Anda tidak diwajibkan membeli frame baru jika bingkai lama masih nyaman dipakai.</li>
        <li><strong>Garansi Ketepatan Resep:</strong> Kenyamanan penglihatan Anda adalah prioritas kami.</li>
      </ul>

      <p>Ingin tahu estimasi biaya presisi untuk ukuran minus dan silinder Anda? Jangan ragu untuk berkonsultasi langsung dengan tim kami di 4 cabang (Purwokerto, Purbalingga, Wonosobo, Cilacap) atau hubungi Customer Care kami via WhatsApp!</p>
    `
  },
  // ── 13. REKOMENDASI OPTIK PURWOKERTO (Local Non-Brand High Intent SEO) ───
  {
    slug: 'rekomendasi-optik-kacamata-purwokerto-banyumas',
    title: 'Rekomendasi Optik di Purwokerto: Tempat Bikin Kacamata Minus Terbaik, Murah & Bergaransi',
    category: 'info-cabang-promo',
    excerpt: 'Mencari rekomendasi optik kacamata terbaik di Purwokerto? Simak review lengkap tempat periksa mata gratis, koleksi frame estetik, dan faset lensa express di Optik I See You.',
    coverImage: '/lokasi/purwokerto/IMG_1543.webp',
    author: 'Tim Optik I See You',
    publishedAt: '2026-09-10T10:00:00Z',
    updatedAt: '2026-09-10T10:00:00Z',
    relatedCabang: 'Purwokerto',
    content: `
      <p>Menemukan optik kacamata yang tepat di Purwokerto dan sekitarnya bukanlah hal yang sepele. Sebagian besar orang menginginkan tiga hal utama: <strong>hasil pemeriksaan minus yang akurat, pilihan model bingkai yang kekinian (bukan model kuno), dan harga yang transparan serta bersahabat di kantong</strong>, terutama bagi kalangan mahasiswa dan pelajar di kota pendidikan Banyumas ini.</p>

      <p>Jika Anda sedang mencari toko kacamata terdekat di Purwokerto dengan pelayanan profesional dan fasilitas modern, <strong>Optik I See You Purwokerto</strong> adalah salah satu rekomendasi teratas yang wajib Anda kunjungi.</p>

      <h2>Kenapa Optik I See You Jadi Rekomendasi Favorit di Purwokerto?</h2>

      <h3>1. Periksa Mata Digital Komputerisasi 100% Gratis</h3>
      <p>Tidak perlu khawatir ada biaya tersembunyi. Di Optik I See You Purwokerto, setiap pengunjung berhak mendapatkan pemeriksaan refraksi mata komprehensif menggunakan perangkat <em>Autorefractor</em> terkomputerisasi didampingi tenaga refraksionis berpengalaman. Kami memeriksa ketajaman visus, ukuran minus (miopia), plus (hipermetropia), hingga derajat silinder (astigmatisme) secara presisi.</p>

      <h3>2. Ratusan Pilihan Frame Estetik &amp; Kekinian</h3>
      <p>Lupakan bingkai kacamata yang kaku dan membosankan! Di gerai kami, Anda akan menemukan kurasi model frame modern yang dirancang untuk mempertegas karakter wajah:</p>
      <ul>
        <li><strong>Titanium Series:</strong> Bobot super ringan di bawah 15 gram, anti-karat, dan tidak meninggalkan bekas merah di batang hidung.</li>
        <li><strong>The Feline Silhouette (Cat-Eye):</strong> Memberikan efek lifting alami pada tulang pipi dan membuat wajah bulat terlihat lebih ramping.</li>
        <li><strong>Quiet Luxury &amp; Korean Minimalist:</strong> Bingkai tipis elegan dengan warna rose gold, champagne, dan matte black yang cocok untuk outfit ngampus maupun meeting kerja.</li>
        <li><strong>Acetate Bold (The Skena Gaze):</strong> Frame tebal retro 90-an yang sangat fotogenik dan jadi favorit anak muda skena Purwokerto.</li>
      </ul>

      <h3>3. Pengerjaan Faset Lensa Express dengan Mesin CNC 3D</h3>
      <p>Paling malas kalau harus menunggu kacamata resep selesai berhari-hari? Di Optik I See You cabang Purwokerto, kami memiliki fasilitas workshop internal dengan mesin potong lensa CNC otomatis berbasis 3D Frame Tracing. Kacamata minus Anda bisa <strong>ditunggu dalam waktu 20-30 menit saja</strong> dengan hasil potongan bevel lensa yang sangat rapi dan presisi.</p>

      <h3>4. Fitur Inovatif: Virtual AR Try-On &amp; Studio Photobooth</h3>
      <p>Optik I See You adalah pelopor optik digital di Jawa Tengah. Sebelum datang ke toko, Anda bisa mencoba puluhan model kacamata langsung di depan kamera smartphone Anda melalui fitur <strong>AR Try-On</strong> di website kami. Dan saat mampir ke toko, abadikan foto kacamata barumu di studio Photobooth interaktif kami secara cuma-cuma!</p>

      <h2>Panduan Lokasi Optik I See You Purwokerto</h2>
      <div class="bg-isy-mist/70 border border-isy-line rounded-2xl p-5 my-6">
        <p><strong>Alamat:</strong> Jl. Sunan Ampel No. 5, Sidamulya, Kedungmalang, Kec. Sumbang, Kabupaten Banyumas, Jawa Tengah 53124.</p>
        <p><strong>Patokan:</strong> Berada di jalur strategis penghubung Purwokerto Kota dan kawasan kampus Unsoed, sangat mudah dijangkau dengan kendaraan roda dua maupun roda empat (tersedia area parkir yang nyaman).</p>
        <p><strong>Jam Buka:</strong> Setiap hari (Senin sampai Minggu) pukul 09.00 - 21.00 WIB.</p>
        <p><strong>WhatsApp Reservasi:</strong> 0895-4156-14261.</p>
      </div>

      <p>Selain di Purwokerto, Optik I See You juga hadir melayani Anda di 3 cabang resmi lainnya: <strong>Purbalingga (Jl. Onje No.1), Wonosobo (Jl. Jenderal Soedirman), dan Cilacap (Jl. Rinjani Depan Perum GRP No.2)</strong>. Yuk, periksakan matamu dan upgrade penampilan kacamata hari ini!</p>
    `
  }
];

export const BLOG_POSTS: BlogPost[] = rawArticles.map(article => ({

  ...article,
  readingTime: calculateReadingTime(article.content)
}));
