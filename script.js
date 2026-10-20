// --------------------------------------------------------------------------
// FIREBASE FIRESTORE CANLI VERİ TABANI YAPILANDIRMASI
// --------------------------------------------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCc8-jBAz-1JtfMCPTeAIxyeYoMFfxT0Tw",
  authDomain: "ptech-website-150c5.firebaseapp.com",
  projectId: "ptech-website-150c5",
  storageBucket: "ptech-website-150c5.firebasestorage.app",
  messagingSenderId: "537877075508",
  appId: "1:537877075508:web:29af9a556dfb2425cddc61"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function getYoutubeThumbnail(url) {
  if (!url) return null;
  let videoId = null;
  if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('v=')[1]?.split('&')[0];
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0];
  } else if (url.includes('youtube.com/embed/')) {
    videoId = url.split('embed/')[1]?.split('?')[0];
  }
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
}

// 1. CANLI SAYAÇ (07/07/2025)
const startDate = new Date("2025-07-07T00:00:00").getTime();

function updateTimer() {
  const now = new Date().getTime();
  const diff = now - startDate;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (document.getElementById("days")) {
    document.getElementById("days").innerText = days < 10 ? "0" + days : days;
    document.getElementById("hours").innerText = hours < 10 ? "0" + hours : hours;
    document.getElementById("minutes").innerText = minutes < 10 ? "0" + minutes : minutes;
    document.getElementById("seconds").innerText = seconds < 10 ? "0" + seconds : seconds;
  }
}

setInterval(updateTimer, 1000);
updateTimer();

// 2. DISCORD LİNKİ YÜKLEME (Firebase'den)
async function syncDiscordLinks() {
  try {
    const docRef = doc(db, "settings", "general");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().discordUrl) {
      const discordUrl = docSnap.data().discordUrl;
      document.querySelectorAll('a[href*="discord.gg"]').forEach(btn => {
        btn.href = discordUrl;
      });
    }
  } catch (e) {
    console.error("Discord linki yüklenemedi:", e);
  }
}

// 3. CANLI İSTATİSTİK YÜKLEYİCİ (Ana Sayfa Top 3)
async function loadServerStats() {
  try {
    const response = await fetch('stats.json');
    if (!response.ok) return;

    const data = await response.json();
    const topList = document.getElementById("topDigsList");

    if (topList && Array.isArray(data)) {
      topList.innerHTML = "";
      
      data.slice(0, 3).forEach((player, index) => {
        const rankClass = `rank-${index + 1}`;
        const playerName = player.name || player.uuid || "Oyuncu";
        const digsCount = player.digs ? player.digs.toLocaleString() : 0;

        const itemHtml = `
          <div class="leader-item ${rankClass}">
            <div class="rank-badge">${index + 1}</div>
            <img src="https://mc-heads.net/avatar/${playerName}/64" alt="${playerName}" class="leader-head">
            <div class="leader-details">
              <span class="player-name">${playerName}</span>
              <span class="player-sub">Teknik Madenci</span>
            </div>
            <div class="leader-score">
              <span class="score-num">${digsCount}</span>
              <span class="score-label">Blok Kazıldı</span>
            </div>
          </div>
        `;
        topList.innerHTML += itemHtml;
      });
    }
  } catch (error) {
    console.error("Stats verisi çekilemedi:", error);
  }
}

// 4. FIREBASE'DEN EKİP VE GALERİ VERİLERİNİ YÜKLEME
async function loadDynamicTeamAndGallery() {
  const teamContainer = document.getElementById("teamContainer");
  const galleryContainer = document.getElementById("galleryContainer");

  // Ekip Yükleme
  if (teamContainer) {
    try {
      const teamSnap = await getDocs(collection(db, "team"));
      let teamHtml = "";

      if (teamSnap.empty) {
        teamHtml = `<p style="color: #94a3b8; text-align: center;">Henüz ekip üyesi eklenmedi.</p>`;
      } else {
        teamSnap.forEach(docSnap => {
          const m = docSnap.data();
          const pSocials = m.socials || {};
          
          const hasAnySocial = Boolean(
            (pSocials.discord && pSocials.discord.trim()) ||
            (pSocials.namemc && pSocials.namemc.trim()) ||
            (pSocials.youtube && pSocials.youtube.trim()) ||
            (pSocials.instagram && pSocials.instagram.trim()) ||
            (pSocials.twitch && pSocials.twitch.trim()) ||
            (pSocials.kick && pSocials.kick.trim())
          );

          if (hasAnySocial) {
            teamHtml += `
              <div class="team-card" onclick="openPlayerCardModal('${m.name}', '${m.role}', ${JSON.stringify(pSocials).replace(/"/g, '&quot;')})" style="cursor: pointer;">
                <img src="https://mc-heads.net/avatar/${m.name}/100" alt="${m.name}" class="skin-head">
                <h3>${m.name}</h3>
                <span class="role-badge founder" style="background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe;">${m.role}</span>
                <div class="click-info">Detaylar için tıkla</div>
              </div>
            `;
          } else {
            teamHtml += `
              <div class="team-card" style="cursor: default;">
                <img src="https://mc-heads.net/avatar/${m.name}/100" alt="${m.name}" class="skin-head">
                <h3>${m.name}</h3>
                <span class="role-badge founder" style="background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe;">${m.role}</span>
              </div>
            `;
          }
        });
      }
      teamContainer.innerHTML = teamHtml;
    } catch (e) {
      console.error("Ekip verisi çekilemedi:", e);
    }
  }

  // Galeri Yükleme
  if (galleryContainer) {
    try {
      const gallerySnap = await getDocs(collection(db, "gallery"));
      galleryContainer.innerHTML = "";
      
      gallerySnap.forEach(docSnap => {
        const g = docSnap.data();
        if (g.showOnHome) {
          let thumb = g.thumbnail || (g.type === 'video' ? getYoutubeThumbnail(g.url) : g.url);
          galleryContainer.innerHTML += `
            <div class="gallery-card" onclick="window.location.href='gallery/index.html'">
              <div class="gallery-img-wrapper">
                <img src="${thumb}" alt="${g.title}">
              </div>
              <div class="gallery-info">
                <h3>${g.title}</h3>
                <p>${g.desc || ''}</p>
                ${g.date ? `<div style="font-size: 0.75rem; color: #2563eb; font-weight: 700; margin-top: 0.5rem;">📅 ${g.date}</div>` : ''}
              </div>
            </div>
          `;
        }
      });
    } catch (e) {
      console.error("Galeri verisi çekilemedi:", e);
    }
  }
}

// 5. OYUNCU BİLGİ KARTINI AÇMA MODALI
window.openPlayerCardModal = function(playerName, role, playerSocials = {}) {
  let modal = document.getElementById("playerCardModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "playerCardModal";
    modal.className = "player-card-modal-overlay";
    document.body.appendChild(modal);
  }

  let socialRowsHtml = "";

  if (playerSocials.discord && playerSocials.discord.trim()) {
    socialRowsHtml += `
      <div class="social-row-item discord-copy-item" onclick="copyDiscordTag('${playerSocials.discord.trim()}')">
        <div class="social-icon-label">
          <span class="icon">💬</span>
          <div class="social-text-info">
            <span class="social-title">Discord</span>
            <span class="social-val" id="dcCopyVal">${playerSocials.discord.trim()}</span>
          </div>
        </div>
        <button class="copy-btn" id="dcCopyBtn">Kopyala</button>
      </div>
    `;
  }

  if (playerSocials.namemc && playerSocials.namemc.trim()) {
    socialRowsHtml += `
      <a href="${playerSocials.namemc.trim()}" target="_blank" class="social-row-item">
        <div class="social-icon-label">
          <span class="icon">👤</span>
          <div class="social-text-info">
            <span class="social-title">NameMC Profil</span>
            <span class="social-val">Skin ve isim geçmişi</span>
          </div>
        </div>
        <span class="arrow">→</span>
      </a>
    `;
  }

  if (playerSocials.youtube && playerSocials.youtube.trim()) {
    socialRowsHtml += `
      <a href="${playerSocials.youtube.trim()}" target="_blank" class="social-row-item">
        <div class="social-icon-label"><span class="icon">▶️</span><div class="social-text-info"><span class="social-title">YouTube</span><span class="social-val">Kanalı Gör</span></div></div><span class="arrow">→</span>
      </a>
    `;
  }

  if (playerSocials.instagram && playerSocials.instagram.trim()) {
    socialRowsHtml += `
      <a href="${playerSocials.instagram.trim()}" target="_blank" class="social-row-item">
        <div class="social-icon-label"><span class="icon">📸</span><div class="social-text-info"><span class="social-title">Instagram</span><span class="social-val">Profili Gör</span></div></div><span class="arrow">→</span>
      </a>
    `;
  }

  if (playerSocials.twitch && playerSocials.twitch.trim()) {
    socialRowsHtml += `
      <a href="${playerSocials.twitch.trim()}" target="_blank" class="social-row-item">
        <div class="social-icon-label"><span class="icon">💜</span><div class="social-text-info"><span class="social-title">Twitch</span><span class="social-val">Yayını Gör</span></div></div><span class="arrow">→</span>
      </a>
    `;
  }

  if (playerSocials.kick && playerSocials.kick.trim()) {
    socialRowsHtml += `
      <a href="${playerSocials.kick.trim()}" target="_blank" class="social-row-item">
        <div class="social-icon-label"><span class="icon">🟢</span><div class="social-text-info"><span class="social-title">Kick</span><span class="social-val">Yayını Gör</span></div></div><span class="arrow">→</span>
      </a>
    `;
  }

  modal.innerHTML = `
    <div class="player-card-modal" onclick="event.stopPropagation()">
      <button class="player-card-close" onclick="closePlayerCardModal()">✕</button>
      
      <div class="player-card-header">
        <img src="https://mc-heads.net/avatar/${playerName}/100" alt="${playerName}" class="player-card-head">
        <h2>${playerName}</h2>
        <span class="role-badge founder" style="background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; margin-top: 0.4rem;">${role}</span>
      </div>

      <div class="player-socials-list">
        ${socialRowsHtml}
      </div>
    </div>
  `;

  modal.style.display = "flex";
  modal.onclick = closePlayerCardModal;
};

window.closePlayerCardModal = function() {
  const modal = document.getElementById("playerCardModal");
  if (modal) modal.style.display = "none";
};

window.copyDiscordTag = function(tag) {
  if (!tag) return;
  navigator.clipboard.writeText(tag).then(() => {
    const btn = document.getElementById("dcCopyBtn");
    if (btn) {
      btn.innerText = "Kopyalandı!";
      btn.style.background = "#22c55e";
      btn.style.color = "#ffffff";
      setTimeout(() => {
        btn.innerText = "Kopyala";
        btn.style.background = "#f1f5f9";
        btn.style.color = "#0f172a";
      }, 2000);
    }
  });
};

document.addEventListener("DOMContentLoaded", () => {
  syncDiscordLinks();
  loadServerStats();
  loadDynamicTeamAndGallery();
});

// 6. ADMIN PANELİNE GİRİŞ KISAYOLU (F8 veya Ctrl + Shift + P)
document.addEventListener("keydown", function(e) {
  const isShortcut = (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'p') || e.key === 'F8';
  if (isShortcut) {
    e.preventDefault();
    window.location.href = "admin/index.html";
  }
});
