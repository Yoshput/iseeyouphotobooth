export type BlogCategory = 'edukasi-mata' | 'tips-pilih-frame' | 'perawatan-softlens' | 'tren-gaya' | 'info-cabang-promo';

export type BlogPost = {
  slug: string;
  title: string;
  category: BlogCategory;
  excerpt: string;
  coverImage: string;
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
      <p>Setiap orang memiliki struktur tulang wajah yang unik. Frame kacamata yang tepat akan berfungsi sebagai penyeimbang fitur alami wajah kamu—misalnya melembutkan rahang yang tegas, atau memberikan definisi tajam pada wajah yang membulat. Berikut panduan praktis (cheat sheet) untuk menentukan frame yang tepat:</p>

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

      <p>Dari era Tobey Maguire yang nerd-sweet, Andrew Garfield yang edgy berkarisma, sampai Tom Holland yang sporty dan sleek—kacamata mereka terbukti bukan sekadar alat bantu baca, tapi aksesori fashion yang mengangkat aura ketampanan dan karakter wajah secara instan.</p>

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
        <li><strong>Faset Cepat Bisa Ditunggu:</strong> Kacamata baru kamu bisa langsung jadi dalam waktu 20–30 menit saja, nggak perlu nunggu berhari-hari!</li>
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
      <p>Paparan radiasi sinar berlebih dalam jangka panjang dikaitkan dengan risiko kerusakan oksidatif pada sel-sel fotoreseptor retina. Mencegah jauh lebih baik daripada mengobati—memakai kacamata pelindung sejak usia muda adalah langkah cerdas menjaga ketajaman penglihatan di masa depan.</p>

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

      <h3>4. Kacamata Sudah Dipakai Lebih dari 1–2 Tahun Tanpa Pengecekan Ulang</h3>
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
      <p>Air keran mengandung mikroorganisme seperti <em>Acanthamoeba</em> yang bisa menyebabkan infeksi parah pada kornea mata. Selalu gunakan cairan khusus (multi-purpose contact lens solution) steril. Buang cairan lama di lens case setiap hari dan isi dengan cairan yang baru—jangan ditumpuk!</p>

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
  }
];

export const BLOG_POSTS: BlogPost[] = rawArticles.map(article => ({

  ...article,
  readingTime: calculateReadingTime(article.content)
}));
