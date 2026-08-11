const sharp = require('sharp');
const fs = require('fs');

async function createSnellenChart() {
  const svg = `
  <svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="600" rx="30" fill="#FFFFFF" />
    <rect x="24" y="24" width="552" height="552" rx="24" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="4" />
    
    <!-- Title -->
    <text x="300" y="75" font-family="sans-serif" font-size="22" font-weight="800" fill="#116B3C" text-anchor="middle" letter-spacing="4">SNELLEN EYE CHART</text>
    
    <!-- Big E -->
    <text x="300" y="175" font-family="serif" font-size="95" font-weight="900" fill="#0F172A" text-anchor="middle">E</text>
    
    <!-- Line 2 -->
    <text x="300" y="240" font-family="sans-serif" font-size="52" font-weight="900" fill="#0F172A" text-anchor="middle" letter-spacing="22">F P</text>
    
    <!-- Line 3 -->
    <text x="300" y="295" font-family="sans-serif" font-size="38" font-weight="800" fill="#0F172A" text-anchor="middle" letter-spacing="16">T O Z</text>
    
    <!-- Line 4 -->
    <text x="300" y="342" font-family="sans-serif" font-size="30" font-weight="800" fill="#0F172A" text-anchor="middle" letter-spacing="12">L P E D</text>
    
    <!-- Line 5 (Red line) -->
    <line x1="70" y1="368" x2="530" y2="368" stroke="#DC2626" stroke-width="4.5" stroke-linecap="round" />
    
    <!-- Line 6 -->
    <text x="300" y="410" font-family="sans-serif" font-size="24" font-weight="800" fill="#0F172A" text-anchor="middle" letter-spacing="9">P E C F D</text>
    
    <!-- Line 7 (Green line) -->
    <line x1="70" y1="434" x2="530" y2="434" stroke="#16A34A" stroke-width="4.5" stroke-linecap="round" />
    
    <!-- Line 8 -->
    <text x="300" y="475" font-family="sans-serif" font-size="19" font-weight="800" fill="#0F172A" text-anchor="middle" letter-spacing="7">E D F C Z P</text>

    <!-- Bottom label -->
    <text x="300" y="535" font-family="sans-serif" font-size="14" font-weight="800" fill="#116B3C" text-anchor="middle" letter-spacing="2.5">OPTIK I SEE YOU · CEK VISUS</text>
  </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile('D:/PROJECT WEB/isy-photobooth/public/fasilitas/snellen-chart.png');
}

async function createLensmeter() {
  const svg = `
  <svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="600" rx="30" fill="#FFFFFF" />
    <rect x="24" y="24" width="552" height="552" rx="24" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="4" />
    
    <!-- Title -->
    <text x="300" y="75" font-family="sans-serif" font-size="22" font-weight="800" fill="#116B3C" text-anchor="middle" letter-spacing="4">AUTOMATIC LENSMETER</text>

    <!-- Lensmeter body drawing -->
    <g transform="translate(150, 70)">
      <!-- Base -->
      <rect x="30" y="390" width="240" height="50" rx="12" fill="#E2E8F0" stroke="#94A3B8" stroke-width="4" />
      <rect x="50" y="440" width="45" height="15" rx="5" fill="#334155" />
      <rect x="205" y="440" width="45" height="15" rx="5" fill="#334155" />
      
      <!-- Main column -->
      <path d="M75 390 L75 170 Q75 110 150 110 Q225 110 225 170 L225 390 Z" fill="#F1F5F9" stroke="#94A3B8" stroke-width="4" />
      
      <!-- Top Eyepiece / Lens Head -->
      <circle cx="150" cy="90" r="48" fill="#116B3C" stroke="#052E16" stroke-width="4" />
      <circle cx="150" cy="90" r="32" fill="#022C22" />
      <circle cx="140" cy="80" r="10" fill="#86EFAC" opacity="0.6" />
      
      <!-- Stage & Lens Holder -->
      <rect x="40" y="250" width="220" height="22" rx="6" fill="#475569" />
      <!-- Target eyeglass lens being measured -->
      <ellipse cx="150" cy="250" rx="65" ry="14" fill="rgba(47,168,79,0.25)" stroke="#2FA84F" stroke-width="3.5" />
      
      <!-- LCD Screen Display Box -->
      <rect x="80" y="145" width="140" height="80" rx="10" fill="#0F172A" stroke="#334155" stroke-width="3" />
      <text x="150" y="178" font-family="monospace" font-size="15" font-weight="bold" fill="#4ADE80" text-anchor="middle">SPH: -2.50</text>
      <text x="150" y="202" font-family="monospace" font-size="15" font-weight="bold" fill="#4ADE80" text-anchor="middle">CYL: -0.75</text>

      <!-- Control Dial -->
      <circle cx="240" cy="315" r="25" fill="#334155" stroke="#1E293B" stroke-width="4" />
      <line x1="240" y1="290" x2="240" y2="340" stroke="#64748B" stroke-width="3" />
      <line x1="215" y1="315" x2="265" y2="315" stroke="#64748B" stroke-width="3" />
    </g>

    <!-- Bottom label -->
    <text x="300" y="535" font-family="sans-serif" font-size="14" font-weight="800" fill="#116B3C" text-anchor="middle" letter-spacing="2.5">OPTIK I SEE YOU · CEK LENSA LAMA</text>
  </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile('D:/PROJECT WEB/isy-photobooth/public/fasilitas/lensmeter.png');
}

Promise.all([createSnellenChart(), createLensmeter()]).then(() => {
  console.log('Snellen chart and Lensmeter images generated successfully!');
}).catch(console.error);
