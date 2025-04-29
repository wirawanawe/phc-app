// This script seeds 5 dummy health articles into the database

// Import models and database configuration
const { default: ArticleModel } = require("../app/models/Article");
const { default: sequelize } = require("../app/config/db.config");
const { v4: uuidv4 } = require("uuid");

async function seedArticles() {
  try {
    console.log("Connecting to database...");
    // Test the database connection
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");

    console.log("Starting to seed articles...");

    // Define the dummy articles
    const articles = [
      {
        id: uuidv4(),
        title: "Pentingnya Asupan Nutrisi Seimbang untuk Kesehatan Optimal",
        slug: "pentingnya-asupan-nutrisi-seimbang-untuk-kesehatan-optimal",
        summary:
          "Nutrisi seimbang adalah kunci untuk menjaga kesehatan tubuh dan mencegah berbagai penyakit. Artikel ini membahas kelompok nutrisi penting dan bagaimana memastikan pola makan yang sehat.",
        content: `<p>Nutrisi seimbang merupakan fondasi penting untuk menjaga kesehatan tubuh secara optimal. Tubuh manusia membutuhkan berbagai jenis nutrisi dalam jumlah yang tepat untuk dapat berfungsi dengan baik. Artikel ini akan membahas pentingnya nutrisi seimbang dan bagaimana cara menjaga pola makan yang sehat.</p>

<h2>Apa itu Nutrisi Seimbang?</h2>
<p>Nutrisi seimbang adalah pola makan yang mencakup semua kelompok makanan dalam proporsi yang tepat. Ini meliputi karbohidrat, protein, lemak, vitamin, mineral, dan air. Setiap kelompok nutrisi memiliki peran penting dalam menjaga kesehatan tubuh.</p>

<h2>Manfaat Nutrisi Seimbang</h2>
<ul>
  <li>Meningkatkan energi dan stamina</li>
  <li>Mendukung sistem kekebalan tubuh</li>
  <li>Mencegah penyakit kronis seperti diabetes dan penyakit jantung</li>
  <li>Menjaga berat badan ideal</li>
  <li>Mendukung pertumbuhan dan perkembangan yang sehat</li>
</ul>

<h2>Tips Menjaga Pola Makan Seimbang</h2>
<ol>
  <li>Konsumsi makanan dari semua kelompok makanan setiap hari</li>
  <li>Batasi konsumsi gula, garam, dan lemak jenuh</li>
  <li>Makan lebih banyak buah dan sayuran</li>
  <li>Pilih karbohidrat kompleks daripada karbohidrat sederhana</li>
  <li>Konsumsi protein dari berbagai sumber</li>
  <li>Minum air putih yang cukup</li>
</ol>

<p>Dengan menjaga pola makan yang seimbang, kita dapat meningkatkan kualitas hidup dan mencegah berbagai penyakit. Mulailah dengan langkah kecil dan konsisten untuk mencapai kesehatan optimal.</p>`,
        author: "dr. Anisa Pratiwi",
        imageUrl: "/images/articles/nutrition-balance.jpg",
        isPublished: true,
        publishedDate: new Date(),
      },
      {
        id: uuidv4(),
        title: "Manfaat Olahraga Rutin untuk Kesehatan Mental",
        slug: "manfaat-olahraga-rutin-untuk-kesehatan-mental",
        summary:
          "Olahraga tidak hanya bermanfaat untuk kesehatan fisik, tetapi juga memiliki dampak positif pada kesehatan mental. Pelajari bagaimana olahraga dapat membantu mengurangi stres dan kecemasan.",
        content: `<p>Selain manfaat fisik yang telah banyak diketahui, olahraga rutin juga memiliki efek positif yang signifikan terhadap kesehatan mental. Aktivitas fisik dapat menjadi salah satu cara alami untuk mengatasi berbagai masalah kesehatan mental seperti stres, kecemasan, dan depresi.</p>

<h2>Bagaimana Olahraga Mempengaruhi Kesehatan Mental?</h2>
<p>Saat berolahraga, tubuh melepaskan endorfin, dopamin, dan serotonin yang dikenal sebagai "hormon kebahagiaan". Hormon-hormon ini dapat meningkatkan suasana hati, mengurangi rasa sakit, dan menciptakan perasaan positif secara keseluruhan.</p>

<h2>Manfaat Olahraga untuk Kesehatan Mental</h2>
<ul>
  <li>Mengurangi gejala depresi dan kecemasan</li>
  <li>Menurunkan tingkat stres</li>
  <li>Meningkatkan kualitas tidur</li>
  <li>Meningkatkan kepercayaan diri dan harga diri</li>
  <li>Memperbaiki fungsi kognitif dan memori</li>
  <li>Mengurangi risiko penurunan fungsi kognitif seiring bertambahnya usia</li>
</ul>

<h2>Olahraga yang Direkomendasikan</h2>
<p>Beberapa jenis olahraga yang dapat membantu meningkatkan kesehatan mental antara lain:</p>
<ol>
  <li>Aerobik (berjalan, berlari, berenang)</li>
  <li>Yoga dan meditasi</li>
  <li>Bersepeda</li>
  <li>Menari</li>
  <li>Olahraga tim seperti sepak bola atau bola basket</li>
</ol>

<p>Yang terpenting adalah menemukan jenis olahraga yang Anda nikmati, sehingga dapat dilakukan secara konsisten. Mulailah dengan durasi dan intensitas rendah, kemudian tingkatkan secara bertahap.</p>`,
        author: "dr. Budi Santoso, Sp.KJ",
        imageUrl: "/images/articles/exercise-mental-health.jpg",
        isPublished: true,
        publishedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        id: uuidv4(),
        title: "Mengenal Diabetes: Gejala, Penyebab, dan Cara Pengelolaannya",
        slug: "mengenal-diabetes-gejala-penyebab-dan-cara-pengelolaannya",
        summary:
          "Diabetes adalah penyakit kronis yang mempengaruhi cara tubuh mengolah glukosa darah. Pelajari tentang gejala, penyebab, dan strategi pengelolaan diabetes yang efektif.",
        content: `<p>Diabetes mellitus adalah kondisi kronis yang terjadi ketika tubuh tidak dapat menghasilkan insulin yang cukup atau tidak dapat menggunakan insulin secara efektif. Insulin adalah hormon yang mengatur kadar gula darah dan memungkinkan sel-sel tubuh menyerap dan menggunakan glukosa untuk energi.</p>

<h2>Jenis-jenis Diabetes</h2>
<ul>
  <li><strong>Diabetes Tipe 1:</strong> Sistem kekebalan tubuh menyerang dan menghancurkan sel-sel penghasil insulin di pankreas. Biasanya didiagnosis pada anak-anak dan dewasa muda.</li>
  <li><strong>Diabetes Tipe 2:</strong> Tubuh menjadi resisten terhadap insulin atau pankreas tidak menghasilkan insulin yang cukup. Ini adalah jenis diabetes yang paling umum.</li>
  <li><strong>Diabetes Gestasional:</strong> Terjadi selama kehamilan dan biasanya hilang setelah melahirkan, tetapi meningkatkan risiko diabetes tipe 2 di kemudian hari.</li>
</ul>

<h2>Gejala Diabetes</h2>
<p>Gejala umum diabetes meliputi:</p>
<ul>
  <li>Sering buang air kecil</li>
  <li>Rasa haus yang berlebihan</li>
  <li>Penurunan berat badan yang tidak dijelaskan</li>
  <li>Kelelahan ekstrem</li>
  <li>Penglihatan kabur</li>
  <li>Luka yang lambat sembuh</li>
</ul>

<h2>Pengelolaan Diabetes</h2>
<p>Meskipun diabetes adalah kondisi kronis, pengelolaan yang tepat dapat membantu menjalani hidup yang sehat:</p>
<ol>
  <li>Pemantauan gula darah secara teratur</li>
  <li>Pola makan sehat</li>
  <li>Aktivitas fisik rutin</li>
  <li>Penggunaan obat atau insulin sesuai resep dokter</li>
  <li>Pemeriksaan kesehatan rutin</li>
</ol>

<p>Dengan pengelolaan yang tepat, penderita diabetes dapat menjalani kehidupan yang normal dan aktif. Konsultasi rutin dengan tim kesehatan adalah kunci untuk pengelolaan diabetes yang efektif.</p>`,
        author: "dr. Chandra Wijaya, Sp.PD",
        imageUrl: "/images/articles/diabetes-management.jpg",
        isPublished: true,
        publishedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        id: uuidv4(),
        title: "Panduan Tidur Sehat: Meningkatkan Kualitas Istirahat Anda",
        slug: "panduan-tidur-sehat-meningkatkan-kualitas-istirahat-anda",
        summary:
          "Tidur yang berkualitas sangat penting untuk kesehatan fisik dan mental. Artikel ini menyajikan panduan praktis untuk meningkatkan kualitas tidur dan mengatasi masalah insomnia.",
        content: `<p>Tidur yang cukup dan berkualitas merupakan komponen penting dalam menjaga kesehatan secara keseluruhan. Sama pentingnya dengan pola makan sehat dan olahraga rutin, tidur yang baik dapat memengaruhi kesehatan mental, fisik, dan emosional kita.</p>

<h2>Mengapa Tidur Berkualitas Penting?</h2>
<p>Tidur yang berkualitas memiliki berbagai manfaat, antara lain:</p>
<ul>
  <li>Membantu tubuh memperbaiki dan meregenerasi sel-sel</li>
  <li>Meningkatkan fungsi otak dan kemampuan kognitif</li>
  <li>Mengurangi risiko penyakit jantung, diabetes, dan obesitas</li>
  <li>Memperkuat sistem kekebalan tubuh</li>
  <li>Meningkatkan mood dan mengurangi stres</li>
</ul>

<h2>Tips untuk Meningkatkan Kualitas Tidur</h2>
<ol>
  <li><strong>Tetapkan Jadwal Tidur:</strong> Upayakan tidur dan bangun pada waktu yang sama setiap hari, termasuk akhir pekan.</li>
  <li><strong>Ciptakan Lingkungan Tidur yang Nyaman:</strong> Pastikan kamar tidur Anda gelap, tenang, dan sejuk.</li>
  <li><strong>Batasi Paparan Cahaya Biru:</strong> Hindari penggunaan perangkat elektronik seperti ponsel atau laptop setidaknya satu jam sebelum tidur.</li>
  <li><strong>Perhatikan Asupan Makanan dan Minuman:</strong> Batasi konsumsi kafein dan alkohol, terutama menjelang tidur.</li>
  <li><strong>Lakukan Aktivitas Relaksasi:</strong> Mandi air hangat, membaca buku, atau meditasi dapat membantu tubuh dan pikiran rileks sebelum tidur.</li>
</ol>

<h2>Mengatasi Insomnia</h2>
<p>Jika Anda mengalami kesulitan tidur secara teratur, cobalah:</p>
<ul>
  <li>Teknik relaksasi otot progresif</li>
  <li>Terapi kognitif perilaku untuk insomnia (CBT-I)</li>
  <li>Membatasi waktu berbaring di tempat tidur jika tidak bisa tidur</li>
</ul>

<p>Jika masalah tidur berlanjut dan mengganggu kehidupan sehari-hari, konsultasikan dengan profesional kesehatan untuk mendapatkan penanganan yang tepat.</p>`,
        author: "dr. Dewi Anggraini, Sp.KJ",
        imageUrl: "/images/articles/healthy-sleep.jpg",
        isPublished: true,
        publishedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
      },
      {
        id: uuidv4(),
        title:
          "Cara Menjaga Kesehatan Jantung: Langkah Pencegahan Penyakit Kardiovaskular",
        slug: "cara-menjaga-kesehatan-jantung-langkah-pencegahan-penyakit-kardiovaskular",
        summary:
          "Penyakit jantung masih menjadi penyebab utama kematian di dunia. Pelajari cara menjaga kesehatan jantung dan strategi pencegahan penyakit kardiovaskular.",
        content: `<p>Penyakit kardiovaskular, termasuk penyakit jantung koroner dan stroke, adalah penyebab kematian nomor satu di dunia. Namun, banyak faktor risiko penyakit jantung yang dapat dimodifikasi melalui perubahan gaya hidup.</p>

<h2>Faktor Risiko Penyakit Jantung</h2>
<p>Beberapa faktor risiko penyakit jantung meliputi:</p>
<ul>
  <li>Tekanan darah tinggi</li>
  <li>Kolesterol tinggi</li>
  <li>Diabetes</li>
  <li>Merokok</li>
  <li>Obesitas</li>
  <li>Pola makan tidak sehat</li>
  <li>Kurang aktivitas fisik</li>
  <li>Stres berlebihan</li>
  <li>Riwayat keluarga dengan penyakit jantung</li>
</ul>

<h2>Cara Menjaga Kesehatan Jantung</h2>
<ol>
  <li><strong>Pola Makan Sehat:</strong> Konsumsi makanan kaya buah, sayuran, biji-bijian, protein tanpa lemak, dan lemak sehat. Batasi konsumsi garam, gula, dan lemak jenuh.</li>
  <li><strong>Aktivitas Fisik Rutin:</strong> Lakukan minimal 150 menit aktivitas fisik intensitas sedang per minggu.</li>
  <li><strong>Kontrol Berat Badan:</strong> Jaga berat badan ideal untuk mengurangi beban pada jantung.</li>
  <li><strong>Berhenti Merokok:</strong> Merokok merusak pembuluh darah dan meningkatkan risiko penyakit jantung secara signifikan.</li>
  <li><strong>Batasi Konsumsi Alkohol:</strong> Konsumsi alkohol berlebihan dapat meningkatkan tekanan darah dan merusak otot jantung.</li>
  <li><strong>Kelola Stres:</strong> Praktikkan teknik relaksasi seperti meditasi, yoga, atau pernapasan dalam.</li>
  <li><strong>Pemeriksaan Kesehatan Rutin:</strong> Pantau tekanan darah, kolesterol, dan gula darah secara teratur.</li>
</ol>

<h2>Kapan Harus Berkonsultasi dengan Dokter</h2>
<p>Segera konsultasikan dengan dokter jika Anda mengalami gejala seperti:</p>
<ul>
  <li>Nyeri atau ketidaknyamanan di dada</li>
  <li>Sesak napas</li>
  <li>Pusing atau pingsan</li>
  <li>Detak jantung tidak teratur</li>
</ul>

<p>Dengan langkah-langkah pencegahan yang tepat dan deteksi dini, risiko penyakit kardiovaskular dapat dikurangi secara signifikan.</p>`,
        author: "dr. Eko Prasetyo, Sp.JP",
        imageUrl: "/images/articles/heart-health.jpg",
        isPublished: true,
        publishedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      },
    ];

    // Insert articles into the database
    for (const article of articles) {
      await ArticleModel.create(article);
      console.log(`Created article: ${article.title}`);
    }

    console.log("Successfully seeded 5 dummy health articles");

    // Close the database connection
    await sequelize.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error seeding articles:", error);
    process.exit(1);
  }
}

// Execute the seed function
seedArticles();
