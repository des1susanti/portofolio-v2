// =====================================================================
//  ISI PORTOFOLIO
//  Semua teks ada di sini, dalam bahasa Indonesia (id) dan Inggris (en).
//  - notes  : catatan singkat yang muncul saat gedung DIKLIK
//  - slides : isi papan di dalam gedung (geser dengan panah kiri/kanan)
//  Posisi px/py (pusat gedung) dan mx/my (pintu/penanda ◆) mengikuti peta 1500 x 1500.
//  Teks juga bisa diubah langsung di situs dengan tombol pensil ✎, lalu
//  "Unduh edits.json" dan simpan di folder data/ supaya permanen.
// =====================================================================

export const PROFILE = {
  name: "DESI SUSANTI",
  tagline: { id: "Pembelajar | Pendidik | Peneliti", en: "Learner | Educator | Researcher" },
  quote: {
    id: "Rasa ingin tahu adalah awal dari setiap algoritma, dan pembelajaran adalah fondasi dari setiap inovasi.",
    en: "Curiosity is the beginning of every algorithm, and learning is the foundation of every innovation.",
  },
  photo: "img/v1/dsi-nobg.png",
  github: "https://github.com/des1susanti",
  v1: "https://des1susanti.pythonanywhere.com",
  links: [
    { label: "WhatsApp", url: "https://wa.me/6282282603371", icon: "💬" },
    { label: "Instagram", url: "https://www.instagram.com/ds_wisayoga", icon: "📷" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/desi-susanti-70a7b831a", icon: "💼" },
    { label: "TikTok", url: "https://www.tiktok.com/@linxiao.ds", icon: "🎵" },
    { label: "X", url: "https://x.com/linxiao_ds", iconOnly: true,
      icon: '<svg class="ico-x" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' },
    { label: "GitHub", url: "https://github.com/des1susanti", icon: "🐙" },
  ],
};

// Repo GitHub tempat situs ini disimpan. Dipakai saat PEMILIK menyimpan perubahan
// (edit teks, tulis/hapus blog, unggah foto) langsung dari situs.
export const CONFIG = { owner: "des1susanti", repo: "portofolio-v2", branch: "main" };

const gh = (r) => `${PROFILE.github}/${r}`;
const T = (id, en) => ({ id, en: en ?? id });

// ------------------------------------------------------------------ proyek (dipakai Galeri & mode biasa)
export const PROJECTS = [
  { name: "Mitologi Nusantara", url: gh("mitologi-nusantara"), img: "img/proyek/mitologi.jpg", tag: "COMPUTER VISION",
    role: T("Pembuat", "Creator"), with: "Python · OpenCV · MediaPipe",
    desc: T("Sebelas tokoh mitologi Nusantara muncul di dalam kubus 3D dan bergerak (sayap mengepak, api berkobar, naga terbang). Dikendalikan gerakan tangan lewat webcam: cubit untuk memunculkan kubus, kepal untuk asap, buka untuk tokoh.",
            "Eleven Indonesian mythology characters appear inside a 3D cube and move (flapping wings, flickering fire, a flying dragon). Controlled by hand gestures through a webcam: pinch for the cube, fist for smoke, open hand for the character.") },
  { name: "Simulator Mesin 3D", url: gh("simulator-mesin-3d"), img: "img/proyek/mesin3d.jpg", tag: "COMPUTER VISION",
    role: T("Pembuat", "Creator"), with: "Python · OpenCV · MediaPipe",
    desc: T("Mobil sport dari ribuan titik cahaya. Jauhkan dua tangan untuk membongkar, cubit satu bagian untuk menariknya keluar, kepalkan tangan untuk merakit kembali.",
            "A sports car made of thousands of glowing points. Spread both hands to explode it, pinch a part to pull it out, make a fist to reassemble.") },
  { name: "Robot Gestur", url: gh("robot-gestur"), img: "img/proyek/robot.jpg", tag: "COMPUTER VISION",
    role: T("Pembuat", "Creator"), with: "Python · OpenCV · MediaPipe",
    desc: T("Robot marionet: setiap ujung jari terhubung benang emas ke lengan, kepala, dan kaki robot. Tangan kedua membuat robot berjalan, melompat, dan duduk.",
            "A marionette robot: each fingertip is tied with a golden string to its arms, head and legs. The second hand makes it walk, jump and sit.") },
  { name: "Nebula Hands", url: gh("nebula-hands"), img: "img/proyek/nebula.jpg", tag: "COMPUTER VISION",
    role: T("Pembuat", "Creator"), with: "Python · OpenCV · MediaPipe · NumPy",
    desc: T("Sistem partikel 3D yang dikendalikan gestur tangan: 5 jari jaringan node, 1 jari otak 3D, 3 jari hati berdetak, metal kubus, cubit lubang hitam, dan hati besar dari dua tangan.",
            "A 3D particle system driven by hand gestures: open hand for a node network, one finger for a 3D brain, three for a beating heart, metal sign for a cube, pinch for a black hole, and a big heart from two hands.") },
  { name: "AI Vision Interaction System", url: gh("AI-Vision-Interaction-System"), img: "img/proyek/aivision.jpg", tag: "COMPUTER VISION",
    role: T("Pembuat", "Creator"), with: "YOLOv8 · MediaPipe · OpenCV",
    desc: T("Kumpulan modul interaksi berbasis computer vision: Virtual Paint (menggambar di udara dengan jari) dan deteksi objek YOLOv8 dengan logika tambahan untuk membedakan objek mirip, misalnya smartwatch dan ponsel.",
            "Computer-vision interaction modules: Virtual Paint (drawing in the air with a fingertip) and YOLOv8 object detection with extra logic to tell similar objects apart, such as a smartwatch and a phone.") },
  { name: "Pohon Mangga", url: gh("turtle-animation-pohon"), img: "img/proyek/pohon.jpg", tag: "ANIMATION",
    role: T("Pembuat", "Creator"), with: "Python Turtle",
    desc: T("Animasi seorang petani menanam benih sampai pohon mangga berbunga dan berbuah, digambar sepenuhnya dengan Python Turtle.",
            "An animation of a farmer planting a seed until the mango tree blooms and bears fruit, drawn entirely with Python Turtle.") },
  { name: "Luwing Game", url: gh("luwing-game"), img: "img/proyek/luwing.jpg", tag: "GAME",
    role: T("Pembuat", "Creator"), with: "Python · Pygame",
    desc: T("Permainan ulat (luwing) yang mengikuti kursor: makan apel dan jamur, hindari bom, dengan sistem level, nyawa, musik latar, dan efek suara.",
            "A caterpillar (luwing) game that follows the cursor: eat apples and mushrooms, avoid bombs, with levels, lives, background music and sound effects.") },
  { name: "Life Design Quest", url: "https://des1susanti.github.io/life-design-quest/", img: "img/proyek/lifedesign.jpg", tag: "GAME",
    role: T("Pembuat", "Creator"), with: "HTML · JavaScript",
    desc: T("Game web untuk sesi Career Development \"Your Future, Your Plan\" berbasis buku Designing Your Life. Mahasiswa bermain 6 level di HP, skor tampil live di proyektor, dan di akhir mengunduh sertifikat roadmap karier.",
            "A web game for the \"Your Future, Your Plan\" career session based on the book Designing Your Life. Students play 6 levels on their phones, scores show live on the projector, and they download a career-roadmap certificate.") },
  { name: "Office Hacks: Mail Merge Quiz", url: gh("mail-merge-quiz"), img: "img/proyek/mailmerge.jpg", tag: "EDUCATION",
    role: T("Pembuat", "Creator"), with: "HTML · JavaScript (SPA)",
    desc: T("Aplikasi web edukatif satu halaman untuk belajar Mail Merge: ringkasan materi, kuis, dan tips anti gagal, untuk mahasiswa Akuntansi & Manajemen.",
            "A single-page educational web app for learning Mail Merge: quick lessons, a quiz and pitfalls to avoid, for Accounting & Management students.") },
  { name: "FTTH Self-Reporting", url: gh("ftth-self-reporting"), img: "img/proyek/ftth.jpg", tag: "WEB",
    role: T("Pembuat", "Creator"), with: "Laravel 11 · MySQL · Tailwind",
    desc: T("Aplikasi pelaporan gangguan internet FTTH dengan empat peran (Admin, Manager, Teknisi, Pelanggan): pelanggan melapor dan memantau tiket, teknisi memperbarui status, manajer mengekspor laporan.",
            "An FTTH outage-reporting app with four roles (Admin, Manager, Technician, Customer): customers report and track tickets, technicians update status, managers export reports.") },
  { name: "ETL SAP ↔ iCRM+ Supply Chain", url: gh("etl-sap-icrm-supply-chain"), img: "img/proyek/etl.jpg", tag: "WEB",
    role: T("Pembuat", "Creator"), with: "Laravel 11 · Python · MySQL",
    desc: T("Sistem ETL dan rekonsiliasi data otomatis antara SAP dan iCRM+ untuk gudang: menandai selisih stok, kode barang hilang, dan membuat laporan audit (Excel/PDF).",
            "An automated ETL and data-reconciliation system between SAP and iCRM+ for warehouses: flags stock mismatches and missing item codes, and produces audit reports (Excel/PDF).") },
  { name: "Kampus Mini 3D (Portofolio v2)", url: gh("portofolio-v2"), img: "img/proyek/kampus3d.jpg", tag: "WEB",
    role: T("Pembuat", "Creator"), with: "Three.js · JavaScript · GitHub Pages",
    desc: T("Portofolio 3D interaktif ini: jalankan robot kecil berkeliling kampus mini, masuk ke gedung-gedung, memancing, membaca buku, dan mengganti warna robot. Kunjungi di des1susanti.github.io/portofolio-v2.",
            "This interactive 3D portfolio: drive a little robot around a mini campus, enter buildings, go fishing, read books and repaint the robot. Visit at des1susanti.github.io/portofolio-v2.") },
  { name: "Portofolio v1", url: gh("flask-tailwind-portofolio"), img: "img/v1/dsi.jpg", tag: "WEB",
    role: T("Pembuat", "Creator"), with: "Flask · Tailwind CSS",
    desc: T("Versi pertama portofolio ini, dengan dua bahasa dan galeri foto. Masih bisa dikunjungi di des1susanti.pythonanywhere.com.",
            "The first version of this portfolio, bilingual with photo galleries. Still online at des1susanti.pythonanywhere.com.") },
  { name: "Predictive & Comparative Data Modeling", url: "https://doi.org/10.20895/infotel.v16i3.1163", img: "img/v1/research_thumb.jpg", tag: "PUBLISHED RESEARCH",
    role: T("Peneliti", "Researcher"), with: "Orange Data Mining",
    desc: T("Studi komparatif algoritma machine learning dengan Orange Data Mining untuk analisis prediktif, dipublikasikan di jurnal ilmiah nasional.",
            "A comparative study of machine-learning algorithms using Orange Data Mining for predictive analysis, published in a national journal.") },
  { name: "Kalkulator GUI", url: "", img: "", icon: "🧮", tag: "SOFTWARE DEV",
    role: T("Pembuat", "Creator"), with: "C# / .NET",
    desc: T("Aplikasi kalkulator desktop berbasis GUI di Visual Studio Community dengan logika OOP.",
            "A GUI desktop calculator built in Visual Studio Community using OOP logic.") },
  { name: "Alien Defense System", url: "", img: "", icon: "👾", tag: "GAME",
    role: T("Pembuat", "Creator"), with: "Java · Greenfoot",
    desc: T("Permainan interaktif dengan algoritma collision detection dan manajemen siklus hidup objek.",
            "An interactive game focusing on collision detection and object life-cycle management.") },
  { name: "The Monkey King", url: "", img: "", icon: "🐒", tag: "3D MODELING",
    role: T("Pembuat", "Creator"), with: "Alice 3D",
    desc: T("Lingkungan virtual dan alur cerita interaktif dengan teknik logic branching.",
            "A virtual environment and interactive story using logic branching.") },
];

const projectSlides = (filter) => PROJECTS.filter(filter).map((p) => ({
  title: T(p.name), link: p.url ? { label: p.url.replace(/^https?:\/\//, ""), url: p.url } : null,
  img: p.img, icon: p.icon, text: p.desc,
  meta: [{ k: T("PERAN", "ROLE"), v: p.role }, { k: T("DENGAN", "WITH"), v: T(p.with) }],
  badge: p.tag,
}));

// ------------------------------------------------------------------ lokasi
export const LOCATIONS = [
  { no: 1, key: "gerbang", px: 133, py: 760, mx: 205, my: 690, door: null,
    title: T("Gerbang Utama", "Main Gate"),
    notes: T(["👋 Selamat datang di Kampus Mini", "🎮 W A S D / panah untuk berjalan", "🗺️ Tombol peta di pojok kanan atas"],
             ["👋 Welcome to the Mini Campus", "🎮 W A S D / arrows to walk", "🗺️ Map button at the top right"]),
    slides: [{
      title: T("Selamat datang!", "Welcome!"), img: "img/v1/dsi-nobg.png",
      text: T(`<p>Ini <b>Kampus Mini</b>, portofolio 3D Desi Susanti.</p>
              <p><kbd>W A S D</kbd> / panah: berjalan · <kbd>Shift</kbd>: berlari · seret layar: geser pandangan · gulir: zoom.</p>
              <p>Datangi pintu bertanda <b>◆</b> untuk masuk ke gedung. Klik gedung untuk melihat isinya sekilas.</p>`,
              `<p>This is the <b>Mini Campus</b>, Desi Susanti's 3D portfolio.</p>
              <p><kbd>W A S D</kbd> / arrows: walk · <kbd>Shift</kbd>: run · drag: move the view · scroll: zoom.</p>
              <p>Walk into a door marked <b>◆</b> to enter a building. Click a building for a quick peek.</p>`),
    }] },

  { no: 2, key: "beranda", px: 455, py: 375, mx: 455, my: 470, door: { face: 1, d: 7, w: 3.2 },
    title: T("Gedung Beranda", "Home Hall"),
    notes: T(["👩‍🏫 Desi Susanti, M.Kom", "✨ Pembelajar | Pendidik | Peneliti", "📖 Cerita lengkap tentang saya"],
             ["👩‍🏫 Desi Susanti, M.Kom", "✨ Learner | Educator | Researcher", "📖 My full story"]),
    slides: [
      { title: T("Hey there! I'm Desi Susanti"), img: "img/v1/about-main.jpg",
        text: T(`<blockquote>"Rasa ingin tahu adalah awal dari setiap algoritma, dan pembelajaran adalah fondasi dari setiap inovasi."</blockquote>
                <p>Saya akademisi dan pendidik di bidang Ilmu Komputer, dengan fokus pada pengembangan <b>Artificial Intelligence</b> untuk pemodelan dan analisis data kompleks.</p>`,
                `<blockquote>"Curiosity is the beginning of every algorithm, and learning is the foundation of every innovation."</blockquote>
                <p>I am an academic and educator in Computer Science, focusing on <b>Artificial Intelligence</b> for modeling and analysing complex data.</p>`),
        meta: [{ k: T("PERAN", "ROLE"), v: T("Pembelajar · Pendidik · Peneliti", "Learner · Educator · Researcher") }] },
      { title: T("Cerita Saya", "My Story"), img: "img/v1/utama.jpg",
        text: T(`<p>Saya berfokus pada pengembangan pemodelan komputasi dan analisis data untuk mendukung pengambilan keputusan yang lebih tepat dan berbasis data.</p>
                <p>Penelitian saya berorientasi pada penguatan metodologi analitik, integrasi berbagai pendekatan komputasi, serta optimalisasi pengolahan data yang kompleks.</p>
                <p>Sebagai pendidik, saya berkomitmen membangun lingkungan akademik yang mendorong pemikiran kritis dan kemandirian intelektual.</p>`,
                `<p>I focus on computational modeling and data analysis that support more precise, data-driven decisions.</p>
                <p>My research strengthens analytical methodology, integrates computational approaches and optimises the processing of complex data.</p>
                <p>As an educator, I am committed to an academic environment that encourages critical thinking and intellectual independence.</p>`) },
    ] },

  { no: 3, key: "masjid", px: 505, py: 615, mx: 505, my: 705, door: { face: 1, d: 6, w: 3 },
    title: T("Masjid Kampus", "Campus Mosque"),
    notes: T(["🕌 Tempat rehat sejenak", "📜 Kata-kata mutiara", "✎ Teksnya bisa diedit"],
             ["🕌 A place to pause", "📜 Words of wisdom", "✎ The text is editable"]),
    slides: [
      { title: T("Rehat Sejenak", "A Moment of Rest"), icon: "🕌",
        text: T(`<blockquote class="big">"Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lain."</blockquote>
                <p class="muted">Tekan ✎ untuk mengganti kata-kata ini.</p>`,
                `<blockquote class="big">"The best of people are those who are most beneficial to others."</blockquote>
                <p class="muted">Press ✎ to change these words.</p>`) },
      { title: T("Niat Belajar", "Intention to Learn"), icon: "📖",
        text: T(`<blockquote class="big">"Tuntutlah ilmu, karena ilmu adalah cahaya bagi jalan hidup."</blockquote>`,
                `<blockquote class="big">"Seek knowledge, for knowledge is a light for life's path."</blockquote>`) },
    ] },

  { no: 4, key: "auditorium", px: 657, py: 620, mx: 657, my: 518, door: { face: -1, d: 8, w: 3 },
    title: T("Auditorium Wisuda", "Graduation Hall"),
    notes: T(["🎓 Magister Teknik Informatika (M.Kom)", "🏫 IIB Darmajaya, 2023–2024", "⭐ IPK 3,92 / 4,00"],
             ["🎓 Master of Informatics Engineering", "🏫 IIB Darmajaya, 2023–2024", "⭐ GPA 3.92 / 4.00"]),
    slides: [
      { title: T("Riwayat Pendidikan", "Education"), img: "img/v1/logo.png",
        link: { label: "darmajaya.ac.id", url: "https://www.darmajaya.ac.id" },
        text: T(`<h3>Institut Informatika dan Bisnis Darmajaya</h3><p>Master of Informatics Engineering (M.Kom)<br>2023 – 2024 · IPK <b>3,92</b> / 4,00</p>`,
                `<h3>Institut Informatika dan Bisnis Darmajaya</h3><p>Master of Informatics Engineering (M.Kom)<br>2023 – 2024 · GPA <b>3.92</b> / 4.00</p>`) },
      ...[1, 2, 3, 4, 5, 6, 7].map((i) => ({ title: T(`Wisuda · ${i}/7`, `Graduation · ${i}/7`), img: `img/v1/wisuda${i}.jpg`, photo: true })),
    ] },

  { no: 5, key: "lab", px: 930, py: 375, mx: 930, my: 470, door: { face: 1, d: 7, w: 3 },
    title: T("Lab AI", "AI Lab"),
    notes: T(["📄 Publikasi: ANN vs SVR — Jurnal INFOTEL 2024", "🔬 Riset: Orange Data Mining", "🧠 Keahlian: Deep Learning, Neural Network, SVR"],
             ["📄 Paper: ANN vs SVR — Jurnal INFOTEL 2024", "🔬 Research: Orange Data Mining", "🧠 Skills: Deep Learning, Neural Networks, SVR"]),
    slides: [
      { title: T("Jurnal INFOTEL · 2024"), img: "img/v1/research_thumb.jpg",
        link: { label: "doi.org/10.20895/infotel.v16i3.1163", url: "https://doi.org/10.20895/infotel.v16i3.1163" },
        text: T(`<h3>Prediction of Student Achievement Using Artificial Neural Network and Support Vector Regression</h3>
                <p>Studi komparatif ANN dan SVR untuk memprediksi capaian prestasi siswa dengan akurasi tinggi.</p>`,
                `<h3>Prediction of Student Achievement Using Artificial Neural Network and Support Vector Regression</h3>
                <p>A comparative study of ANN and SVR to predict student achievement with high accuracy.</p>`),
        meta: [{ k: T("PERAN", "ROLE"), v: T("Peneliti", "Researcher") }, { k: T("METODE", "METHOD"), v: T("ANN · SVR") }], badge: "PUBLIKASI" },
      ...projectSlides((p) => p.tag === "PUBLISHED RESEARCH"),
      { title: T("Keahlian & Kompetensi", "Skills"), icon: "🧠",
        text: T(`<ul><li><b>Artificial Intelligence & ML</b> — Deep Learning, Neural Networks, Predictive Modeling</li>
                <li><b>Computational Modeling</b> — SVR, Optimization Algorithms, Simulation</li>
                <li><b>Programming & Dev</b> — Python, Flask, SQL, Web Development</li>
                <li><b>Data Science</b> — Pandas, NumPy, Scikit-Learn, Matplotlib</li>
                <li><b>Computer Vision</b> — OpenCV, MediaPipe (proyek gestur tangan)</li></ul>`) },
    ] },

  { no: 6, key: "galeri", px: 1150, py: 380, mx: 1150, my: 480, door: null,
    title: T("Galeri Proyek", "Project Gallery"),
    notes: T(["✋ Computer vision: Mitologi, Mesin 3D, Robot Gestur, Nebula Hands, AI Vision", "🎮 Game: Luwing, Life Design Quest, Alien Defense", "🌐 Web: FTTH, ETL SAP–iCRM+, Mail Merge Quiz, Portofolio v1", "🥭 Animasi Pohon Mangga · 🧮 C# · 🐒 Alice"],
             ["✋ Computer vision: Mitologi, Engine 3D, Gesture Robot, Nebula Hands, AI Vision", "🎮 Games: Luwing, Life Design Quest, Alien Defense", "🌐 Web: FTTH, ETL SAP–iCRM+, Mail Merge Quiz, Portfolio v1", "🥭 Mango Tree animation · 🧮 C# · 🐒 Alice"]),
    slides: projectSlides((p) => p.tag !== "PUBLISHED RESEARCH") },

  { no: 7, key: "kelas", px: 925, py: 620, mx: 991, my: 695, door: { face: 1, d: 5.5, w: 2.6, dx: 6.6 },
    title: T("Ruang Kelas", "Classroom"),
    notes: T(["👩‍🏫 Mengajar Ilmu Komputer", "🧩 Pemrograman & AI", "✎ Daftar mata kuliah bisa diedit"],
             ["👩‍🏫 Teaching Computer Science", "🧩 Programming & AI", "✎ Course list is editable"]),
    slides: [
      { title: T("Mengajar", "Teaching"), icon: "👩‍🏫",
        text: T(`<p>Sebagai pendidik, saya ingin kelas menjadi tempat yang mendorong <b>pemikiran kritis</b> dan <b>kemandirian intelektual</b>.</p>
                <p>Mata kuliah yang diampu:</p><ul><li>(tambahkan mata kuliah — tekan ✎)</li></ul>`,
                `<p>As an educator I want classrooms that encourage <b>critical thinking</b> and <b>intellectual independence</b>.</p>
                <p>Courses taught:</p><ul><li>(add courses — press ✎)</li></ul>`) },
    ] },

  { no: 8, key: "prestasi", px: 1155, py: 620, mx: 1155, my: 718, door: { face: 1, d: 7, w: 3 },
    title: T("Balai Prestasi", "Hall of Achievements"),
    notes: T(["🏆 Juara 2 Provinsi — JAMBORE GTK HEBAT 2024", "🏆 Peringkat 1 Nasional 2023 — Proyek Kreatif", "🎖️ Peserta Terbaik Nasional"],
             ["🏆 2nd, Province — JAMBORE GTK HEBAT 2024", "🏆 1st, National 2023 — Creative Project", "🎖️ Best National Participant"]),
    slides: [
      { title: T("JAMBORE GTK HEBAT 2024"), img: "img/v1/jambore1.jpg", badge: "🏆 JUARA 2",
        text: T(`<p><b>Juara 2 Tingkat Provinsi</b> · kategori Guru Inovatif.</p><p>Diselenggarakan oleh Balai Guru Penggerak (BGP) Provinsi Lampung.</p>`,
                `<p><b>2nd place, provincial level</b> · Innovative Teacher category.</p><p>Organised by Balai Guru Penggerak (BGP) Lampung Province.</p>`) },
      ...[2, 3, 4, 5, 6, 7].map((i) => ({ title: T(`Jambore GTK Hebat · ${i}/7`), img: `img/v1/jambore${i}.jpg`, photo: true })),
      { title: T("Proyek Kreatif Nasional 2023", "National Creative Project 2023"), img: "img/v1/bbp2.jpg", badge: "🏆 PERINGKAT 1",
        text: T(`<p><b>Peringkat 1 Nasional</b> — Proyek Kreatif & Pelatihan Kewirausahaan, sekaligus <b>Peserta Terbaik Tingkat Nasional</b>.</p>
                <p>Diselenggarakan oleh BBPPMPV Bidang Mesin dan Teknik Industri (BMTI).</p>`,
                `<p><b>1st place nationally</b> — Creative Project & Entrepreneurship Training, and <b>Best National Participant</b>.</p>
                <p>Organised by BBPPMPV BMTI.</p>`) },
      { title: T("Peserta Terbaik", "Best Participant"), img: "img/v1/bbp1.jpg", photo: true },
    ] },

  { no: 9, key: "lapangan", px: 490, py: 1100, mx: 690, my: 960, door: null,
    title: T("Lapangan & Lintasan", "Field & Track"),
    notes: T(["⚽ Dorong bola ke gawang", "⏱️ Catat waktu keliling lintasan"], ["⚽ Push the ball into a goal", "⏱️ Time a lap around the track"]),
    slides: [{ title: T("Mini game!"), icon: "⚽",
      text: T(`<ul><li>Dorong bola putih ke salah satu gawang.</li><li>Lewati garis start di lintasan merah, kelilingi lapangan, lalu kembali ke garis start untuk mencatat waktu.</li></ul>`,
              `<ul><li>Push the white ball into either goal.</li><li>Cross the start line on the red track, go around and back to record a lap time.</li></ul>`) }] },

  { no: 10, key: "perpus", px: 930, py: 930, mx: 930, my: 836, door: { face: -1, d: 7, w: 3 },
    title: T("Perpustakaan · Blog Kode", "Library · Code Blog"),
    notes: T(["💻 Tulisan pemrograman", "✋ Proyek gerakan tangan (OpenCV, MediaPipe)", "🐢 Python Turtle"],
             ["💻 Programming posts", "✋ Hand-gesture projects (OpenCV, MediaPipe)", "🐢 Python Turtle"]),
    blog: "kode" },
  { no: 11, key: "kantin", px: 1155, py: 925, mx: 1155, my: 842, door: { face: -1, d: 6, w: 3 },
    title: T("Kantin · Blog Kuliner", "Canteen · Food Blog"),
    notes: T(["🍜 Cerita kuliner", "📍 Tempat makan favorit"], ["🍜 Food stories", "📍 Favourite places to eat"]),
    blog: "kuliner" },
  { no: 12, key: "terminal", px: 1150, py: 1140, mx: 1150, my: 1222, door: null,
    title: T("Terminal Bus · Blog Jalan-jalan", "Bus Terminal · Travel Blog"),
    notes: T(["🧳 Catatan perjalanan", "🗺️ Tempat-tempat yang pernah dikunjungi"], ["🧳 Travel notes", "🗺️ Places I have visited"]),
    blog: "jalan-jalan" },

  { no: 13, key: "pos", px: 915, py: 1145, mx: 915, my: 1068, door: { face: -1, d: 5, w: 2.6 },
    title: T("Kantor Pos · Kontak", "Post Office · Contact"),
    notes: T(["💬 WhatsApp · 💼 LinkedIn", "📷 Instagram · 🎵 TikTok · 🐙 GitHub"], ["💬 WhatsApp · 💼 LinkedIn", "📷 Instagram · 🎵 TikTok · 🐙 GitHub"]),
    contact: true },

  { no: 14, key: "bengkel", px: 1365, py: 705, mx: 1365, my: 625, door: { face: -1, d: 6, w: 3.4 },
    title: T("Bengkel Cat Robot", "Robot Paint Shop"),
    notes: T(["🎨 Ganti warna robot", "10 pilihan warna, termasuk pink"], ["🎨 Change the robot's colour", "10 colours, including pink"]),
    paint: true },

  { no: 15, key: "siger", px: 1360, py: 400, mx: 1360, my: 495, door: null,
    title: T("Menara Siger", "Siger Tower"),
    notes: T(["👑 Ikon Provinsi Lampung", "🛠️ Tentang situs ini"], ["👑 Icon of Lampung Province", "🛠️ About this site"]),
    slides: [{ title: T("Menara Siger"), icon: "👑",
      text: T(`<p>Mahkota siger adalah lambang Provinsi Lampung.</p><p class="muted">Portofolio v2 · Three.js · tanpa server · dibuat dengan bantuan AI.<br>Versi pertama: <a href="https://des1susanti.pythonanywhere.com" target="_blank">des1susanti.pythonanywhere.com</a></p>`,
              `<p>The siger crown is the symbol of Lampung Province.</p><p class="muted">Portfolio v2 · Three.js · serverless · AI-assisted.<br>First version: <a href="https://des1susanti.pythonanywhere.com" target="_blank">des1susanti.pythonanywhere.com</a></p>`) }] },

  { no: 16, key: "taman", px: 790, py: 1330, mx: 700, my: 1405, door: null,
    title: T("Taman Danau", "Lake Garden"),
    notes: T(["🎣 Memancing di dermaga", "📚 Membaca buku di bangku taman", "💎 Ada permata tersembunyi…"],
             ["🎣 Fishing on the pier", "📚 Reading on the garden bench", "💎 A hidden gem somewhere…"]),
    slides: [{ title: T("Taman Danau", "Lake Garden"), icon: "🌿",
      text: T(`<p>Tempat santai di tepi danau.</p><ul><li>🎣 Datangi <b>dermaga</b> untuk memancing.</li><li>📚 Duduk di <b>bangku</b> untuk membaca.</li></ul>`,
              `<p>A relaxing spot by the lake.</p><ul><li>🎣 Walk onto the <b>pier</b> to fish.</li><li>📚 Sit on the <b>bench</b> to read.</li></ul>`) }] },
];

// rak buku di bangku taman (bisa diedit dengan ✎)
// Daftar buku di bangku Taman Danau. Sampul & tautan diambil otomatis dari Google Books.
// Pemilik bisa menambah/menghapus buku langsung dari situs (mode pemilik).
export const BOOKS = [
  { title: "Designing Your Life", author: "Bill Burnett, Dave Evans" },
  { title: "Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow", author: "Aurélien Géron" },
  { title: "Laskar Pelangi", author: "Andrea Hirata" },
];

export const FISH = [
  { id: "Ikan Mas", en: "Goldfish", e: "🐟", w: 5 }, { id: "Ikan Nila", en: "Tilapia", e: "🐟", w: 5 },
  { id: "Ikan Lele", en: "Catfish", e: "🐠", w: 4 }, { id: "Gurame", en: "Giant Gourami", e: "🐡", w: 3 },
  { id: "Ikan Patin", en: "Pangasius", e: "🐟", w: 3 }, { id: "Udang", en: "Shrimp", e: "🦐", w: 2 },
  { id: "Sepatu bekas 😅", en: "An old shoe 😅", e: "👟", w: 1 },
];

export const UI = {
  start: T("KLIK UNTUK MULAI", "CLICK TO START"),
  map: T("Peta", "Map"), close: T("Tutup", "Close"), back: T("← Kembali", "← Back"),
  exit: T("KELUAR", "EXIT"), next: T("BERIKUT", "NEXT"), prev: T("SEBELUM", "PREV"), open: T("BUKA", "OPEN"),
  paint: T("Warna robot", "Robot colour"), classic: T("Mode biasa", "Classic mode"), write: T("Tulis blog", "Write a post"),
  goal: T("GOL!", "GOAL!"), lap: T("Waktu putaran", "Lap time"), best: T("terbaik", "best"),
  gem: T("Permata ditemukan! ✨", "Gem found! ✨"),
  read: T("Baca", "Read"), noPosts: T("Belum ada tulisan.", "No posts yet."),
  teleport: T("Klik penanda untuk pindah ke sana", "Click a marker to go there"),
  contactIntro: T("Kirim pesan lewat:", "Get in touch via:"),
  paintIntro: T("Pilih warna untuk robotmu. Warnanya diingat di browser ini.", "Pick a colour for your robot. It is remembered in this browser."),
  edit: T("Edit teks", "Edit text"), save: T("Simpan", "Save"), cancel: T("Batal", "Cancel"),
  editSaved: T("Tersimpan ke GitHub ✓ — situs untuk pengunjung diperbarui ±1 menit.", "Saved to GitHub ✓ — the public site updates in about a minute."),
  deleted: T("Tulisan dihapus ✓ — situs diperbarui ±1 menit.", "Post deleted ✓ — the site updates in about a minute."),
  owner: T("Masuk pemilik", "Owner login"),
  rotL: T("Putar kiri (Q)", "Rotate left (Q)"), rotR: T("Putar kanan (E)", "Rotate right (E)"),
  zoomIn: T("Perbesar", "Zoom in"), zoomOut: T("Perkecil", "Zoom out"), behind: T("Kamera di belakang robot", "Camera behind robot"),
  fishWait: T("Menunggu ikan…", "Waiting for a bite…"), fishBite: T("Ada yang makan umpan! Tekan SPASI / klik!", "Something's biting! Press SPACE / click!"),
  fishGot: T("Dapat", "Caught"), fishMiss: T("Yah, lepas…", "It got away…"), fishCount: T("tangkapan", "caught"),
  fishing: T("Memancing", "Fishing"), reading: T("Membaca", "Reading"),
  day: T("Siang", "Day"), night: T("Malam", "Night"),
  hintWalk: T("W A S D / panah: berjalan · seret: geser · klik kanan + seret / Q E: putar · gulir: zoom", "W A S D / arrows: walk · drag: pan · right-drag / Q E: rotate · scroll: zoom"),
  clickPeek: T("Datangi pintu ◆ untuk masuk", "Walk to the ◆ door to enter"),
};

export const COLORS = [
  { name: T("Ungu", "Purple"), hex: "#a259e0" },
  { name: T("Pink"), hex: "#ff6fb5" },
  { name: T("Toska", "Teal"), hex: "#1fb8a0" },
  { name: T("Biru", "Blue"), hex: "#2f80ed" },
  { name: T("Merah", "Red"), hex: "#e63946" },
  { name: T("Hijau", "Green"), hex: "#2ecc71" },
  { name: T("Kuning", "Yellow"), hex: "#f1c40f" },
  { name: T("Oranye", "Orange"), hex: "#ff8a3d" },
  { name: T("Putih", "White"), hex: "#f2f2f2" },
  { name: T("Hitam", "Black"), hex: "#2b2b2b" },
];

export { gh };
