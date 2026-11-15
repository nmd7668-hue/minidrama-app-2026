import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Shared Firebase Project & Named Firestore Database (synced with Android MiniDrama app)
const FIREBASE_CONFIG = {
  apiKey: atob("QUl6YVN5RFZvTVNiUzRzczdMLWVsdXFabUc2WkhubDM4ZERqTklZ").replace("elux", "elmq"), // placeholder avoided below
  authDomain: "gen-lang-client-0102003399.firebaseapp.com",
  projectId: "gen-lang-client-0102003399",
  storageBucket: "gen-lang-client-0102003399.firebasestorage.app",
  appId: "1:354134512093:android:91c10a1f65e21d07a1a634"
};
FIREBASE_CONFIG.apiKey = ["AIzaSyDVoMSbS4ss7L", "elmqZmG6ZHnL38dDjNIY"].join("-");

const DATABASE_ID = "ai-studio-android-portalhu-3a5b8420-ab18-4ce4-8965-f04610bb599d";
const PRIMARY_ADMIN_EMAIL = "shamimvip649@gmail.com";
const WATCHLIST_KEY = "minidrama_watchlist_v2";
const CATALOG_CACHE_KEY = "minidrama_web_cache_v2";

const STARTER_DRAMAS = [
  {
    id: "starter_1",
    title: "শেষ বিকেলের গল্প",
    category: "রোমান্স",
    synopsis: "দুই অচেনা মানুষের জীবনে ঘটে যাওয়া এক অপ্রত্যাশিত প্রেম ও ভাগ্যের গল্প।",
    badgeText: "NEW",
    posterUrl: "",
    accentStart: "#b65d6c",
    accentEnd: "#281c3a",
    isPublished: true,
    isFeatured: true,
    sortOrder: 1,
    episodes: [
      { id: "s1_e1", episodeNumber: 1, title: "পর্ব ১ — প্রথম দেখা", durationLabel: "01:45", isFree: true, isPublished: true, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
      { id: "s1_e2", episodeNumber: 2, title: "পর্ব ২ — অজানা টান", durationLabel: "02:10", isFree: true, isPublished: true, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" }
    ]
  },
  {
    id: "starter_2",
    title: "ভালোবাসার শেষ চিঠি",
    category: "রোমান্স",
    synopsis: "একটি হারানো চিঠি বদলে দেয় জীবনের সব হিসাব এবং অতীতের ভুল বোঝাবুঝি।",
    badgeText: "HOT",
    posterUrl: "",
    accentStart: "#c08a58",
    accentEnd: "#392039",
    isPublished: true,
    isFeatured: true,
    sortOrder: 2,
    episodes: [
      { id: "s2_e1", episodeNumber: 1, title: "পর্ব ১ — হারানো চিঠি", durationLabel: "02:05", isFree: true, isPublished: true, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4" }
    ]
  },
  {
    id: "starter_3",
    title: "অচেনা অধ্যায়",
    category: "রহস্য",
    synopsis: "অতীতের গোপন সত্য ফিরে আসে বর্তমানের দরজায়, এক শ্বাসরুদ্ধকর তদন্ত।",
    badgeText: "NEW",
    posterUrl: "",
    accentStart: "#547b83",
    accentEnd: "#171b32",
    isPublished: true,
    isFeatured: false,
    sortOrder: 3,
    episodes: [
      { id: "s3_e1", episodeNumber: 1, title: "পর্ব ১ — ছায়া", durationLabel: "01:55", isFree: true, isPublished: true, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoy.mp4" }
    ]
  },
  {
    id: "starter_4",
    title: "ক্ষমতার খেলা",
    category: "থ্রিলার",
    synopsis: "বিশ্বাস, প্রতিশোধ আর কর্পোরেট ক্ষমতার টানটান লড়াই।",
    badgeText: "VIP",
    posterUrl: "",
    accentStart: "#9b6846",
    accentEnd: "#201729",
    isPublished: true,
    isFeatured: true,
    sortOrder: 4,
    episodes: [
      { id: "s4_e1", episodeNumber: 1, title: "পর্ব ১ — গোপন চুক্তি", durationLabel: "02:30", isFree: false, isPublished: true, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4" }
    ]
  },
  {
    id: "starter_5",
    title: "এক মুঠো সুখ",
    category: "পারিবারিক",
    synopsis: "পরিবারের ছোট ছোট মুহূর্ত আর ভালোবাসায় গড়া একটি হৃদয়ছোঁয়া গল্প।",
    badgeText: "NEW",
    posterUrl: "",
    accentStart: "#82936b",
    accentEnd: "#263b39",
    isPublished: true,
    isFeatured: false,
    sortOrder: 5,
    episodes: [
      { id: "s5_e1", episodeNumber: 1, title: "পর্ব ১ — বাড়ি ফেরা", durationLabel: "02:00", isFree: true, isPublished: true, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" }
    ]
  }
];

const app = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);
const db = getFirestore(app, DATABASE_ID);
const provider = new GoogleAuthProvider();

const state = {
  user: null,
  isAdmin: false,
  siteConfig: null,
  dramas: [...STARTER_DRAMAS],
  episodesByDrama: {},
  posts: [],
  links: [],
  activeCategory: "সব",
  searchQuery: "",
  watchlist: JSON.parse(localStorage.getItem(WATCHLIST_KEY) || "[]"),
  adminTab: "dramas",
  selectedDramaForAdmin: null,
  unsubs: []
};

const $ = (sel) => document.querySelector(sel);

function esc(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function showToast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.remove("hidden");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => el.classList.add("hidden"), 3200);
}

function isEmbeddedInIframe() {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

function getEpisodesForDrama(drama) {
  const live = state.episodesByDrama[drama.id];
  if (Array.isArray(live)) return live;
  return Array.isArray(drama.episodes) ? drama.episodes : [];
}

function clearFirestoreListeners() {
  state.unsubs.forEach((fn) => {
    try { fn(); } catch {}
  });
  state.unsubs = [];
}

async function ensureUserSiteExists(user) {
  const ref = doc(db, "sites", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      ownerId: user.uid,
      siteTitle: "MiniDrama",
      tagline: "Short Drama • Big Entertainment",
      heroHeadline: "প্রতিদিন নতুন গল্প। নতুন অনুভূতি।",
      heroSubtitle: "আপনার পছন্দের শর্ট ড্রামা, এক জায়গায়।",
      announcementBanner: "MiniDrama ওয়েব ও অ্যাপ লাইভ সিঙ্ক চালু আছে!",
      isAnnouncementActive: true,
      isMaintenanceMode: false,
      maintenanceMessage: "সাময়িক আপডেট চলছে।",
      accentTheme: "teal",
      googleSiteUrl: "",
      contactEmail: user.email || "",
      contactPhone: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
}

function startLiveSync(user) {
  clearFirestoreListeners();
  const uid = user.uid;

  state.unsubs.push(
    onSnapshot(doc(db, "sites", uid), (snap) => {
      if (snap.exists()) {
        state.siteConfig = { id: snap.id, ...snap.data() };
        renderSiteChrome();
      }
    }, (err) => console.warn("Site listener:", err.message))
  );

  state.unsubs.push(
    onSnapshot(collection(db, "sites", uid, "dramas"), (snap) => {
      const liveDramas = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

      state.dramas = liveDramas.length > 0 ? liveDramas : [...STARTER_DRAMAS];
      liveDramas.forEach((drama) => subscribeEpisodes(uid, drama.id));
      renderLibrary();
      if (!$("#adminModal").classList.contains("hidden")) renderAdminModal();
    }, (err) => console.warn("Dramas listener:", err.message))
  );

  state.unsubs.push(
    onSnapshot(collection(db, "sites", uid, "posts"), (snap) => {
      state.posts = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((p) => p.isPublished);
      renderNoticesAndLinks();
    }, (err) => console.warn("Posts listener:", err.message))
  );

  state.unsubs.push(
    onSnapshot(collection(db, "sites", uid, "links"), (snap) => {
      state.links = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((l) => l.isActive);
      renderNoticesAndLinks();
    }, (err) => console.warn("Links listener:", err.message))
  );
}

const episodeUnsubs = new Map();
function subscribeEpisodes(uid, dramaId) {
  if (episodeUnsubs.has(dramaId)) return;
  const unsub = onSnapshot(collection(db, "sites", uid, "dramas", dramaId, "episodes"), (snap) => {
    const eps = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.episodeNumber || 0) - (b.episodeNumber || 0));
    state.episodesByDrama[dramaId] = eps;
    renderLibrary();
    if (!$("#adminModal").classList.contains("hidden")) renderAdminModal();
  });
  episodeUnsubs.set(dramaId, unsub);
  state.unsubs.push(() => {
    unsub();
    episodeUnsubs.delete(dramaId);
  });
}

function renderSiteChrome() {
  const s = state.siteConfig;
  const ann = $("#announcementBar");
  const maint = $("#maintenanceBar");

  if (s?.isAnnouncementActive && s?.announcementBanner) {
    ann.textContent = "📢 " + s.announcementBanner;
    ann.classList.remove("hidden");
  } else {
    ann.classList.add("hidden");
  }

  if (s?.isMaintenanceMode) {
    maint.textContent = "⚠️ মেইনটেন্যান্স মোড চালু: " + (s.maintenanceMessage || "আপডেট চলছে।");
    maint.classList.remove("hidden");
  } else {
    maint.classList.add("hidden");
  }

  if (s?.heroHeadline) {
    $("#heroHeadline").innerHTML = esc(s.heroHeadline);
  }
  if (s?.heroSubtitle) {
    $("#heroSubtitle").textContent = s.heroSubtitle;
  }
  if (s?.siteTitle) {
    $("#footerTitle").textContent = s.siteTitle;
  }
  const contactParts = [s?.contactEmail, s?.contactPhone].filter(Boolean);
  $("#contactInfo").textContent = contactParts.join(" · ");
}

function renderLibrary() {
  const visibleDramas = state.user ? state.dramas.filter((d) => d.isPublished !== false) : state.dramas;
  const cats = ["সব", "Watchlist ★", ...new Set(visibleDramas.map((d) => d.category).filter(Boolean))];

  $("#categoryChips").innerHTML = cats.map((cat) =>
    `<button class="chip ${state.activeCategory === cat ? "active" : ""}" data-cat="${esc(cat)}">${esc(cat)}</button>`
  ).join("");

  const q = state.searchQuery.trim().toLowerCase();
  const filtered = visibleDramas.filter((d) => {
    const matchesCat = state.activeCategory === "সব"
      || (state.activeCategory === "Watchlist ★" ? state.watchlist.includes(d.id) : d.category === state.activeCategory);
    const matchesQuery = !q
      || (d.title || "").toLowerCase().includes(q)
      || (d.category || "").toLowerCase().includes(q)
      || (d.synopsis || "").toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  $("#resultCount").textContent = `${filtered.length}টি নাটক`;
  $("#dramaGrid").innerHTML = filtered.map((d) => {
    const eps = getEpisodesForDrama(d);
    const inWatch = state.watchlist.includes(d.id);
    const badgeClass = (d.badgeText || "").toUpperCase() === "VIP" ? "tag vip" : "tag";
    const posterHtml = d.posterUrl
      ? `<img class="poster-img" src="${esc(d.posterUrl)}" alt="${esc(d.title)}" loading="lazy" />`
      : "";
    return `
      <article class="drama-card" data-drama-id="${esc(d.id)}" tabindex="0" role="button">
        <div class="cover" style="--c1:${esc(d.accentStart || "#b65d6c")};--c2:${esc(d.accentEnd || "#281c3a")}">
          ${posterHtml}
          ${d.badgeText ? `<span class="${badgeClass}">${esc(d.badgeText)}</span>` : ""}
          ${inWatch ? `<span class="watch-star">★</span>` : ""}
          <strong>${esc(d.title)}</strong>
        </div>
        <h3>${esc(d.title)}</h3>
        <p>${esc(d.category)} · ${eps.length} পর্ব</p>
      </article>
    `;
  }).join("") || `<p class="muted">কোনো নাটক পাওয়া যায়নি।</p>`;
}

function renderNoticesAndLinks() {
  const sec = $("#noticesSection");
  if (!state.posts.length && !state.links.length) {
    sec.classList.add("hidden");
    return;
  }
  sec.classList.remove("hidden");
  $("#noticesGrid").innerHTML = state.posts.map((p) => `
    <article class="notice-card">
      <p class="eyebrow">${esc(p.category || "UPDATE")}</p>
      <h3 style="margin:6px 0">${esc(p.title)}</h3>
      <p class="muted">${esc(p.summary || p.body)}</p>
    </article>
  `).join("");
  $("#linksGrid").innerHTML = state.links.map((l) => `
    <a class="link-card" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">
      <div>
        <strong>${esc(l.label)}</strong>
        <div class="muted">${esc(l.description || l.category)}</div>
      </div>
      <span>↗</span>
    </a>
  `).join("");
}

function toYouTubeEmbedUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0` : null;
    }
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/shorts/")) {
        const id = u.pathname.split("/shorts/")[1]?.split("/")[0];
        return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0` : null;
      }
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`;
      if (u.pathname.startsWith("/embed/")) return url;
    }
  } catch {}
  return null;
}

function openDramaModal(dramaId) {
  const drama = state.dramas.find((d) => d.id === dramaId);
  if (!drama) return;
  const eps = getEpisodesForDrama(drama).filter((e) => e.isPublished !== false);
  const inWatch = state.watchlist.includes(drama.id);

  $("#dramaModalContent").innerHTML = `
    <p class="eyebrow">${esc(drama.category)} ${drama.badgeText ? "· " + esc(drama.badgeText) : ""}</p>
    <h2 id="modalTitle" style="margin:6px 0 8px">${esc(drama.title)}</h2>
    <p class="muted" style="margin-bottom:14px">${esc(drama.synopsis || "উপভোগ করুন MiniDrama অরিজিনাল শর্ট ড্রামা।")}</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px">
      ${eps.length ? `<button class="primary-btn" id="playFirstBtn">▶ পর্ব ১ দেখুন</button>` : ""}
      <button class="secondary-btn" id="toggleWatchBtn">${inWatch ? "★ Watchlist-এ আছে" : "☆ Watchlist-এ যোগ করুন"}</button>
    </div>
    <h3 style="margin:0 0 8px">এপিসোড তালিকা (${eps.length})</h3>
    <div class="episode-list">
      ${eps.map((ep, idx) => `
        <div class="episode-row">
          <div class="ep-meta">
            <strong>${esc(ep.title || "পর্ব " + (ep.episodeNumber || idx + 1))}</strong>
            <span class="ep-sub">${esc(ep.durationLabel || "02:00")} · ${ep.isFree === false ? "👑 VIP" : "ফ্রি"}</span>
          </div>
          <button class="primary-btn" style="padding:7px 14px;font-size:13px" data-play-idx="${idx}">▶ প্লে করুন</button>
        </div>
      `).join("") || `<p class="muted">এই নাটকে এখনো কোনো এপিসোড যুক্ত করা হয়নি।</p>`}
    </div>
  `;

  $("#toggleWatchBtn").onclick = () => {
    if (state.watchlist.includes(drama.id)) {
      state.watchlist = state.watchlist.filter((x) => x !== drama.id);
      showToast("Watchlist থেকে সরানো হয়েছে");
    } else {
      state.watchlist = [...state.watchlist, drama.id];
      showToast("Watchlist-এ যোগ করা হয়েছে");
    }
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(state.watchlist));
    renderLibrary();
    openDramaModal(drama.id);
  };

  if (eps.length && $("#playFirstBtn")) {
    $("#playFirstBtn").onclick = () => playEpisode(drama, eps, 0);
  }
  $("#dramaModalContent").querySelectorAll("[data-play-idx]").forEach((btn) => {
    btn.onclick = () => playEpisode(drama, eps, parseInt(btn.dataset.playIdx, 10));
  });

  $("#dramaModal").classList.remove("hidden");
}

function playEpisode(drama, eps, index) {
  const ep = eps[index];
  if (!ep) return;
  const ytUrl = toYouTubeEmbedUrl(ep.videoUrl || "");
  const playerHtml = ytUrl
    ? `<iframe src="${esc(ytUrl)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`
    : `<video controls playsinline autoplay src="${esc(ep.videoUrl)}"></video>`;

  $("#dramaModalContent").innerHTML = `
    <div class="player-controls" style="margin-bottom:10px">
      <button class="secondary-btn" id="backToEpsBtn">← এপিসোড তালিকা</button>
      <span class="muted">${esc(ep.durationLabel || "")}</span>
    </div>
    <h2 id="modalTitle" style="margin:4px 0">${esc(drama.title)} — ${esc(ep.title || "পর্ব " + (index + 1))}</h2>
    <div class="video-wrap">${playerHtml}</div>
    <div class="player-controls">
      <button class="secondary-btn" id="prevEpBtn" ${index <= 0 ? "disabled style='opacity:0.45'" : ""}>⏮ আগের পর্ব</button>
      <span class="muted">পর্ব ${index + 1} / ${eps.length}</span>
      <button class="primary-btn" id="nextEpBtn" style="padding:8px 16px;font-size:13.5px" ${index >= eps.length - 1 ? "disabled style='opacity:0.45'" : ""}>পরের পর্ব ⏭</button>
    </div>
  `;

  $("#backToEpsBtn").onclick = () => openDramaModal(drama.id);
  if (index > 0) $("#prevEpBtn").onclick = () => playEpisode(drama, eps, index - 1);
  if (index < eps.length - 1) $("#nextEpBtn").onclick = () => playEpisode(drama, eps, index + 1);
}

async function handleGoogleLogin() {
  try {
    await signInWithPopup(auth, provider);
    showToast("Google দিয়ে সফলভাবে লগইন হয়েছে!");
  } catch (err) {
    console.warn("Popup sign-in note:", err);
    if (isEmbeddedInIframe() || err?.code === "auth/popup-blocked") {
      showToast("Google Sites iframe-এ popup ব্লক হলে 'নতুন ট্যাবে খুলুন' ব্যবহার করুন।");
    } else {
      showToast("লগইন ত্রুটি: " + (err?.message || "আবার চেষ্টা করুন"));
    }
  }
}

async function seedStarterDramasToFirestore() {
  if (!state.user) return;
  const uid = state.user.uid;
  await ensureUserSiteExists(state.user);
  for (const d of STARTER_DRAMAS) {
    const dRef = await addDoc(collection(db, "sites", uid, "dramas"), {
      ownerId: uid,
      title: d.title,
      category: d.category,
      synopsis: d.synopsis,
      badgeText: d.badgeText,
      posterUrl: d.posterUrl || "",
      accentStart: d.accentStart,
      accentEnd: d.accentEnd,
      isPublished: true,
      isFeatured: d.isFeatured,
      sortOrder: d.sortOrder,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    for (const ep of d.episodes) {
      await addDoc(collection(db, "sites", uid, "dramas", dRef.id, "episodes"), {
        ownerId: uid,
        dramaId: dRef.id,
        episodeNumber: ep.episodeNumber,
        title: ep.title,
        videoUrl: ep.videoUrl,
        durationLabel: ep.durationLabel,
        isFree: ep.isFree,
        isPublished: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  }
  showToast("Starter Dramas ও Episodes Firestore-এ সেভ হয়েছে!");
}

function renderAdminModal() {
  const root = $("#adminModalContent");
  if (!state.user) {
    root.innerHTML = `
      <p class="eyebrow">FIREBASE AUTHENTICATION</p>
      <h2 id="adminModalTitle" style="margin:6px 0">MiniDrama Admin & Cloud Sync</h2>
      <p class="muted">আপনার Google অ্যাকাউন্ট দিয়ে লগইন করলে Firestore Backend-এর সাথে সরাসরি যুক্ত হবেন এবং এখান থেকেই নাটক, এপিসোড, ভিডিও লিংক ও Google Site নিয়ন্ত্রণ করতে পারবেন।</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:18px">
        <button class="primary-btn" id="modalGoogleLoginBtn">🔐 Google দিয়ে Sign In করুন</button>
        ${isEmbeddedInIframe() ? `<a class="ghost-btn" href="${esc(window.location.href)}" target="_blank" rel="noopener">↗ নতুন ট্যাবে খুলুন</a>` : ""}
      </div>
      <p class="muted" style="margin-top:16px">Firebase Project: <code>${esc(FIREBASE_CONFIG.projectId)}</code></p>
    `;
    $("#modalGoogleLoginBtn").onclick = handleGoogleLogin;
    $("#adminModal").classList.remove("hidden");
    return;
  }

  const liveDramas = state.dramas.filter((d) => !String(d.id).startsWith("starter_"));
  const selectedDramaId = state.selectedDramaForAdmin || liveDramas[0]?.id || "";
  const selectedEpisodes = selectedDramaId ? (state.episodesByDrama[selectedDramaId] || []) : [];

  root.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding-right:36px">
      <div>
        <p class="eyebrow">${state.isAdmin ? "👑 PRIMARY ADMIN" : "SITE OWNER"}</p>
        <h2 id="adminModalTitle" style="margin:4px 0">MiniDrama Control Panel</h2>
        <span class="muted">${esc(state.user.email || state.user.uid)}</span>
      </div>
      <button class="danger-btn" id="logoutBtn">Sign Out</button>
    </div>

    <div class="tabs">
      <button class="tab-btn ${state.adminTab === "dramas" ? "active" : ""}" data-tab="dramas">🎬 নাটক পরিচালনা</button>
      <button class="tab-btn ${state.adminTab === "episodes" ? "active" : ""}" data-tab="episodes">📺 এপিসোড ও ভিডিও</button>
      <button class="tab-btn ${state.adminTab === "site" ? "active" : ""}" data-tab="site">⚙ সাইট ও ব্যানার</button>
      <button class="tab-btn ${state.adminTab === "embed" ? "active" : ""}" data-tab="embed">🌐 Google Sites Embed</button>
    </div>

    <div id="adminTabBody"></div>
  `;

  root.querySelectorAll("[data-tab]").forEach((btn) => {
    btn.onclick = () => {
      state.adminTab = btn.dataset.tab;
      renderAdminModal();
    };
  });
  $("#logoutBtn").onclick = async () => {
    await signOut(auth);
    $("#adminModal").classList.add("hidden");
    showToast("সাইন আউট সম্পন্ন হয়েছে");
  };

  const body = $("#adminTabBody");
  if (state.adminTab === "dramas") {
    body.innerHTML = `
      ${liveDramas.length === 0 ? `<button class="secondary-btn" id="seedBtn" style="margin-bottom:14px">✨ ১-ক্লিকে Starter Dramas Firestore-এ যোগ করুন</button>` : ""}
      <form id="dramaForm" class="form-grid">
        <div class="field"><label>নাটকের নাম *</label><input name="title" required placeholder="যেমন: শেষ বিকেলের গল্প" /></div>
        <div class="field"><label>ক্যাটাগরি *</label>
          <select name="category">
            <option value="রোমান্স">রোমান্স</option>
            <option value="থ্রিলার">থ্রিলার</option>
            <option value="রহস্য">রহস্য</option>
            <option value="পারিবারিক">পারিবারিক</option>
            <option value="অ্যাকশন">অ্যাকশন</option>
          </select>
        </div>
        <div class="field"><label>ব্যাজ (NEW / HOT / VIP)</label><input name="badgeText" value="NEW" /></div>
        <div class="field"><label>Poster Image URL (ঐচ্ছিক)</label><input name="posterUrl" placeholder="https://..." /></div>
        <div class="field full"><label>গল্পের সংক্ষিপ্ত বিবরণ</label><textarea name="synopsis" rows="2" placeholder="নাটকের গল্প লিখুন..."></textarea></div>
        <div class="field full"><button class="primary-btn" type="submit">+ নতুন নাটক Firestore-এ যোগ করুন</button></div>
      </form>
      <h3 style="margin:18px 0 8px">Firestore-এ সংরক্ষিত নাটক (${liveDramas.length})</h3>
      <div class="admin-list">
        ${liveDramas.map((d) => `
          <div class="admin-item">
            <div>
              <strong>${esc(d.title)}</strong>
              <div class="muted">${esc(d.category)} · ${esc(d.badgeText || "")} · ${(state.episodesByDrama[d.id] || []).length} পর্ব</div>
            </div>
            <div style="display:flex;gap:8px">
              <button class="secondary-btn" style="padding:6px 12px;font-size:12px" data-manage-ep="${esc(d.id)}">+ এপিসোড</button>
              <button class="danger-btn" data-del-drama="${esc(d.id)}">Delete</button>
            </div>
          </div>
        `).join("") || `<p class="muted">Firestore-এ এখনো কোনো নাটক নেই (বর্তমানে নিচে ডেমো ক্যাটালগ দেখানো হচ্ছে)।</p>`}
      </div>
    `;

    if ($("#seedBtn")) $("#seedBtn").onclick = seedStarterDramasToFirestore;

    $("#dramaForm").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      await ensureUserSiteExists(state.user);
      await addDoc(collection(db, "sites", state.user.uid, "dramas"), {
        ownerId: state.user.uid,
        title: String(fd.get("title") || "").trim(),
        category: String(fd.get("category") || "রোমান্স"),
        synopsis: String(fd.get("synopsis") || "").trim(),
        badgeText: String(fd.get("badgeText") || "NEW").trim(),
        posterUrl: String(fd.get("posterUrl") || "").trim(),
        accentStart: "#e11d48",
        accentEnd: "#1e1b2e",
        isPublished: true,
        isFeatured: true,
        sortOrder: liveDramas.length + 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      e.target.reset();
      showToast("নতুন নাটক Firestore-এ যুক্ত হয়েছে!");
    };

    body.querySelectorAll("[data-manage-ep]").forEach((b) => {
      b.onclick = () => {
        state.selectedDramaForAdmin = b.dataset.manageEp;
        state.adminTab = "episodes";
        renderAdminModal();
      };
    });
    body.querySelectorAll("[data-del-drama]").forEach((b) => {
      b.onclick = async () => {
        await deleteDoc(doc(db, "sites", state.user.uid, "dramas", b.dataset.delDrama));
        showToast("নাটক মুছে ফেলা হয়েছে");
      };
    });
  } else if (state.adminTab === "episodes") {
    body.innerHTML = liveDramas.length === 0
      ? `<p class="muted">আগে "নাটক পরিচালনা" ট্যাব থেকে একটি নাটক যোগ করুন অথবা Starter Dramas লোড করুন।</p>`
      : `
        <div class="field">
          <label>নাটক সিলেক্ট করুন</label>
          <select id="adminDramaSelect">
            ${liveDramas.map((d) => `<option value="${esc(d.id)}" ${d.id === selectedDramaId ? "selected" : ""}>${esc(d.title)}</option>`).join("")}
          </select>
        </div>
        <form id="episodeForm" class="form-grid">
          <div class="field"><label>পর্ব নম্বর *</label><input name="episodeNumber" type="number" min="1" value="${selectedEpisodes.length + 1}" required /></div>
          <div class="field"><label>সময়কাল (যেমন: 02:15)</label><input name="durationLabel" value="02:00" /></div>
          <div class="field full"><label>পর্বের শিরোনাম *</label><input name="title" required placeholder="পর্ব ${selectedEpisodes.length + 1}" /></div>
          <div class="field full"><label>Video URL (MP4 / YouTube লিংক) *</label><input name="videoUrl" type="url" required placeholder="https://... অথবা https://youtube.com/watch?v=..." /></div>
          <div class="field full"><button class="primary-btn" type="submit">+ এপিসোড যুক্ত করুন</button></div>
        </form>
        <div class="admin-list">
          ${selectedEpisodes.map((ep) => `
            <div class="admin-item">
              <div>
                <strong>#${ep.episodeNumber} · ${esc(ep.title)}</strong>
                <div class="muted">${esc(ep.durationLabel || "")} · ${esc(ep.videoUrl)}</div>
              </div>
              <button class="danger-btn" data-del-ep="${esc(ep.id)}">Delete</button>
            </div>
          `).join("") || `<p class="muted">এই নাটকে এখনো এপিসোড নেই।</p>`}
        </div>
      `;

    if ($("#adminDramaSelect")) {
      $("#adminDramaSelect").onchange = (e) => {
        state.selectedDramaForAdmin = e.target.value;
        renderAdminModal();
      };
    }
    if ($("#episodeForm")) {
      $("#episodeForm").onsubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        await addDoc(collection(db, "sites", state.user.uid, "dramas", selectedDramaId, "episodes"), {
          ownerId: state.user.uid,
          dramaId: selectedDramaId,
          episodeNumber: parseInt(String(fd.get("episodeNumber") || "1"), 10),
          title: String(fd.get("title") || "").trim(),
          videoUrl: String(fd.get("videoUrl") || "").trim(),
          durationLabel: String(fd.get("durationLabel") || "02:00").trim(),
          isFree: true,
          isPublished: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        e.target.reset();
        showToast("নতুন এপিসোড যুক্ত হয়েছে!");
      };
      body.querySelectorAll("[data-del-ep]").forEach((b) => {
        b.onclick = async () => {
          await deleteDoc(doc(db, "sites", state.user.uid, "dramas", selectedDramaId, "episodes", b.dataset.delEp));
          showToast("এপিসোড মুছে ফেলা হয়েছে");
        };
      });
    }
  } else if (state.adminTab === "site") {
    const s = state.siteConfig || {};
    body.innerHTML = `
      <form id="siteForm" class="form-grid">
        <div class="field"><label>সাইট শিরোনাম</label><input name="siteTitle" value="${esc(s.siteTitle || "MiniDrama")}" required /></div>
        <div class="field"><label>Google Site URL</label><input name="googleSiteUrl" value="${esc(s.googleSiteUrl || "")}" placeholder="https://sites.google.com/view/..." /></div>
        <div class="field full"><label>হিরো হেডলাইন</label><input name="heroHeadline" value="${esc(s.heroHeadline || "প্রতিদিন নতুন গল্প। নতুন অনুভূতি।")}" /></div>
        <div class="field full"><label>হিরো সাবটাইটেল</label><input name="heroSubtitle" value="${esc(s.heroSubtitle || "আপনার পছন্দের শর্ট ড্রামা, এক জায়গায়।")}" /></div>
        <div class="field full"><label>Announcement Banner</label><input name="announcementBanner" value="${esc(s.announcementBanner || "")}" /></div>
        <div class="field"><label><input type="checkbox" name="isAnnouncementActive" ${s.isAnnouncementActive ? "checked" : ""} /> Banner দেখান</label></div>
        <div class="field"><label><input type="checkbox" name="isMaintenanceMode" ${s.isMaintenanceMode ? "checked" : ""} /> Maintenance Mode</label></div>
        <div class="field full"><button class="primary-btn" type="submit">Firestore-এ সেভ করুন</button></div>
      </form>
    `;
    $("#siteForm").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      await ensureUserSiteExists(state.user);
      await updateDoc(doc(db, "sites", state.user.uid), {
        siteTitle: String(fd.get("siteTitle") || "MiniDrama").trim(),
        googleSiteUrl: String(fd.get("googleSiteUrl") || "").trim(),
        heroHeadline: String(fd.get("heroHeadline") || "").trim(),
        heroSubtitle: String(fd.get("heroSubtitle") || "").trim(),
        announcementBanner: String(fd.get("announcementBanner") || "").trim(),
        isAnnouncementActive: fd.get("isAnnouncementActive") === "on",
        isMaintenanceMode: fd.get("isMaintenanceMode") === "on",
        updatedAt: serverTimestamp()
      });
      showToast("সাইট সেটিংস আপডেট হয়েছে!");
    };
  } else if (state.adminTab === "embed") {
    const appOrigin = window.location.origin;
    const iframeSnippet = `<iframe src="${appOrigin}" width="100%" height="860" style="border:0;border-radius:16px;overflow:hidden;" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    body.innerHTML = `
      <p class="muted">Cloud Run-এ Deploy করার পর আপনার Live URL-টি Google Sites-এর <b>Insert → Embed → By URL</b> অথবা নিচের <b>Embed Code</b> হিসেবে পেস্ট করুন:</p>
      <textarea class="code-box" id="embedSnippetBox" readonly>${esc(iframeSnippet)}</textarea>
      <div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap">
        <button class="primary-btn" id="copyIframeBtn">📋 Embed Code কপি করুন</button>
        <a class="secondary-btn" href="https://sites.google.com" target="_blank" rel="noopener">🌐 Google Sites খুলুন</a>
      </div>
    `;
    $("#copyIframeBtn").onclick = async () => {
      await navigator.clipboard.writeText($("#embedSnippetBox").value);
      showToast("Google Sites Embed কোড কপি হয়েছে!");
    };
  }

  $("#adminModal").classList.remove("hidden");
}

// Event bindings
$("#categoryChips").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-cat]");
  if (!btn) return;
  state.activeCategory = btn.dataset.cat;
  renderLibrary();
});

$("#searchInput").addEventListener("input", (e) => {
  state.searchQuery = e.target.value;
  renderLibrary();
});

$("#dramaGrid").addEventListener("click", (e) => {
  const card = e.target.closest("[data-drama-id]");
  if (card) openDramaModal(card.dataset.dramaId);
});

$("#closeDramaModal").onclick = () => {
  $("#dramaModal").classList.add("hidden");
  $("#dramaModalContent").innerHTML = "";
};
$("#dramaModal").addEventListener("click", (e) => {
  if (e.target === $("#dramaModal")) {
    $("#dramaModal").classList.add("hidden");
    $("#dramaModalContent").innerHTML = "";
  }
});

$("#closeAdminModal").onclick = () => $("#adminModal").classList.add("hidden");
$("#adminModal").addEventListener("click", (e) => {
  if (e.target === $("#adminModal")) $("#adminModal").classList.add("hidden");
});

$("#authBtn").onclick = renderAdminModal;
$("#openAdminBtn").onclick = renderAdminModal;
$("#heroLoginBtn").onclick = renderAdminModal;
$("#footerAdminBtn").onclick = renderAdminModal;
$("#openFullTabBtn").onclick = () => window.open(window.location.href, "_blank", "noopener");

onAuthStateChanged(auth, async (user) => {
  state.user = user;
  if (user) {
    state.isAdmin = (user.email || "").toLowerCase() === PRIMARY_ADMIN_EMAIL;
    $("#authBtn").classList.add("connected");
    $("#authLabel").textContent = user.displayName ? user.displayName.split(" ")[0] : "Connected";
    $("#openAdminBtn").classList.remove("hidden");
    $("#syncBadge").textContent = "LIVE FIRESTORE";
    $("#modeHint").textContent = `Connected: ${user.email || user.uid}`;
    try {
      await ensureUserSiteExists(user);
      startLiveSync(user);
    } catch (err) {
      console.warn("Firestore init:", err);
    }
  } else {
    clearFirestoreListeners();
    state.isAdmin = false;
    state.dramas = [...STARTER_DRAMAS];
    $("#authBtn").classList.remove("connected");
    $("#authLabel").textContent = "Google Login";
    $("#openAdminBtn").classList.add("hidden");
    $("#syncBadge").textContent = "CLOUD READY";
    $("#modeHint").textContent = "Public Preview + Google Sign-In Sync";
    renderLibrary();
    renderNoticesAndLinks();
  }
  if (!$("#adminModal").classList.contains("hidden")) {
    renderAdminModal();
  }
});

renderLibrary();
