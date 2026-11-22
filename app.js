import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const COARSE = matchMedia('(pointer: coarse)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const isDesk = () => innerWidth >= 900;

/* ====================== Language ====================== */
const AR = {
  nav_inside: 'داخل العلبة', nav_road: 'الطريق إلى الإطلاق', nav_mission: 'المهمة', nav_crew: 'الفريق',
  days_to_launch: 'يومًا على الإطلاق', camview: 'ما تراه كاميرتنا', star_name: 'الطائر',
  hero_p: 'نحن خمسة طلاب من الجامعة الأمريكية في البحرين، نبني قمرًا صناعيًا بحجم علبة مشروب لأول مسابقة كان سات في البحرين.',
  dropday: 'يوم الإسقاط: 12 ديسمبر، برج فورسيزونز، خليج البحرين',
  ch1: 'البناء', ch2: 'الخليج', ch3: 'الإطلاق', ch4: 'المظلة', ch5: 'الكاميرات', ch6: 'الراديو', ch7: 'الهبوط',
  cd_d: 'ي', cd_h: 'س', cd_m: 'د', cd_s: 'ث',
  cue: 'مرّر',
  c1_h: 'قمر صناعي حقيقي', c1_p: 'الكان سات يؤدي عمل قمر صناعي، لكنه مضغوط في حجم علبة مشروب.',
  c2_h: 'طبقة فوق طبقة', c2_p: 'كاميرات وحاسوب طيران وبطارية وحساسات وراديو، مرتّبة على طبقات مطبوعة ثلاثيًا.',
  c3_h: 'جاهز للطيران', c3_p: 'الغلاف والغطاء والهوائي ومظلة مطوية. صمّمه وطبعه فريقنا.',
  c4_h: 'خليج البحرين', c4_p: '12 ديسمبر. عشرة فرق جامعية وبرج واحد: فورسيزونز، بارتفاع 201 متر.',
  c5_h: 'انطلق', c5_p: 'من ارتفاع 170 مترًا تقريبًا، من الجسر المعلّق قرب القمة.',
  c6_h: 'انفتحت المظلة', c6_p: 'ثانية واحدة من السقوط الحر، ثم يتباطأ إلى نحو 7 أمتار في الثانية.',
  c7_h: 'العين إلى الأسفل', c7_p: 'كاميرا ترى الألوان، وأخرى ترى الحرارة: الماء أبرد، والطرق والرمال أسخن.', cam_rgb: 'كاميرا الألوان', cam_th: 'الكاميرا الحرارية', cooler: 'أبرد', warmer: 'أسخن',
  c8_h: 'يتحدث إلى الأرض', c8_p: 'كل ثانية يرسل ارتفاعه وقراءاته عبر الراديو إلى محطتنا الأرضية في هيلتون جاردن إن.',
  w_calm: 'هادئ', w_breeze: 'نسيم', w_windy: 'رياح قوية', again: 'أسقطه مرة أخرى',
  simnote: 'محاكاة توضيحية. بيانات الخريطة © المساهمون في OpenStreetMap.',
  in_h: 'داخل قمرنا', in_p: 'تصميمنا الحقيقي ثلاثي الأبعاد. فكّكه واضغط على أي قطعة.', cad_hint: 'اسحب للتدوير', explode: 'فكّك القطع',
  road_h: 'الطريق إلى الإطلاق', road_p: 'أول مسابقة كان سات في دول الخليج تسير مثل مهمة فضائية حقيقية.',
  st_done: 'تم', r1: 'فكرة المهمة', r1p: 'ماذا سيفعل قمرنا؟', r2d: 'تم · 15 نوفمبر', r2: 'التصميم الأولي', r2p: 'هل يمكن بناؤه؟',
  r3d: 'الآن · 22 نوفمبر', r3: 'التصميم النهائي', r3p: 'مُعتمد وجاهز للبناء', r4d: '2 ديسمبر', r4: 'فحص الطيران', r4p: 'مبني ومُختبر وجاهز',
  r5d: '12 ديسمبر', r5: 'يوم الإطلاق', r5p: 'الإسقاط ثم النتائج',
  org: 'تنظّمها وكالة البحرين للفضاء والجامعة الأمريكية في البحرين، برعاية بنك البحرين والكويت.',
  m_h: 'أرض من البحر', m_p: 'البحرين تكبر باتجاه البحر. البرج الذي نسقط منه يقف على جزيرة بُنيت فوق الماء، وقمرنا ينظر إلى ذلك الساحل عن قرب.',
  m_seal: 'تفاصيل المهمة بعد 12 ديسمبر',
  t_h: 'الفريق', t_p: 'خمسة طلاب من الجامعة الأمريكية في البحرين، مع مشرفنا.',
  t1r: 'مديرة المشروع', t1p: 'تُبقي الخطة والفريق على المسار.', t2r: 'قائد الفريق الميكانيكي', t2p: 'يصمّم العلبة والمظلة.',
  t3r: 'قائدة الفريق الكهربائي', t3p: 'توصّل الطاقة والحساسات والراديو.', t4r: 'قائدة البرمجيات', t4p: 'تكتب كود الطيران ومحطة الاستقبال.',
  t5r: 'قائد العلوم والتواصل', t5p: 'مسؤول عن العلوم ويروي قصتنا.', t6n: 'د. شاذلي عثمان', t6r: 'المشرف', t6p: 'مشرفنا الأكاديمي ومرشدنا.',
  motto: 'نهتدي بألمع نجم', follow: 'تابع رحلة البناء'
};
const EXTRA = {
  en: {
    land_h: 'Landed', land_p: 'About {t} seconds from the top to the ground.',
    water_h: 'Splashdown', water_p: 'The wind carried it into the bay. That is why wind matters on launch day.',
    falling: 'Falling…', cad_hint_touch: 'Two fingers to turn', part_hint: 'Tap a part to see what it does.',
    tag_computer: 'Flight computer', tag_camera: 'Cameras', tag_battery: 'Battery', tag_sensors: 'Sensors', tag_radio: 'Radio', tag_lid: 'Antenna and parachute',
    fs: 'Four Seasons', av: 'The Avenues', bay: 'Bahrain Bay', island: 'Four Seasons island', built: 'Land built on the sea', stn: 'Ground station · Hilton Garden Inn'
  },
  ar: {
    land_h: 'هبط', land_p: 'نحو {t} ثانية من القمة إلى الأرض.',
    water_h: 'سقط في الماء', water_p: 'حملته الرياح إلى الخليج. لهذا تهمّ الرياح يوم الإطلاق.',
    falling: 'يسقط…', cad_hint_touch: 'إصبعان للتدوير', part_hint: 'اضغط على قطعة لترى ما تفعله.',
    tag_computer: 'حاسوب الطيران', tag_camera: 'الكاميرات', tag_battery: 'البطارية', tag_sensors: 'الحساسات', tag_radio: 'الراديو', tag_lid: 'الهوائي والمظلة',
    fs: 'فورسيزونز', av: 'الأفنيوز', bay: 'خليج البحرين', island: 'جزيرة فورسيزونز', built: 'أرض بُنيت فوق البحر', stn: 'المحطة الأرضية · هيلتون جاردن إن'
  }
};
// Parts shown in the "Inside" section: generic names on purpose, no part numbers
const PARTS = {
  en: {
    camera: ['Cameras', 'Point straight down through the base to photograph the ground.'],
    computer: ['Flight computer', 'The brain. Runs our code, saves every photo and reading.'],
    battery: ['Battery', 'Powers everything for hours. Its drawer slides out for a fast swap.'],
    sensors: ['Sensors', 'Feel the air and how the can is moving and turning.'],
    radio: ['Radio', 'Sends live data down to our ground station while it falls.'],
    antenna: ['Antenna', 'Sticks out of the lid so the radio signal reaches the ground.'],
    parachute: ['Parachute', 'Folded on the lid. Opens after release and slows the fall.'],
    shell: ['Shell', 'Our 3D-printed tube, base and lid that hold it all together.']
  },
  ar: {
    camera: ['الكاميرات', 'تتجه مباشرة إلى الأسفل عبر القاعدة لتصوير الأرض.'],
    computer: ['حاسوب الطيران', 'العقل. يشغّل الكود ويحفظ كل صورة وقراءة.'],
    battery: ['البطارية', 'تغذّي كل شيء لساعات. درجها ينزلق لتبديلها بسرعة.'],
    sensors: ['الحساسات', 'تستشعر الهواء وحركة العلبة ودورانها.'],
    radio: ['الراديو', 'يرسل البيانات مباشرة إلى محطتنا الأرضية أثناء السقوط.'],
    antenna: ['الهوائي', 'يبرز من الغطاء ليصل إشارة الراديو إلى الأرض.'],
    parachute: ['المظلة', 'مطوية على الغطاء. تنفتح بعد الإطلاق وتبطئ السقوط.'],
    shell: ['الغلاف', 'الأنبوب والقاعدة والغطاء المطبوعة ثلاثيًا التي تجمع كل شيء.']
  }
};
const EN = {};
$$('[data-i18n]').forEach(el => { EN[el.dataset.i18n] = el.innerHTML; });
let lang = 'en';
try { lang = localStorage.getItem('altair-lang') || 'en'; } catch (e) {}
const T = k => (lang === 'ar' ? (AR[k] ?? EXTRA.ar[k]) : (EN[k] ?? EXTRA.en[k])) ?? k;
const num = (n, pad = 0) => lang === 'ar' ? new Intl.NumberFormat('ar-EG', { minimumIntegerDigits: pad || 1, useGrouping: false }).format(n) : String(n).padStart(pad, '0');
const langHooks = [];
function applyLang() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  $$('[data-i18n]').forEach(el => { const v = lang === 'ar' ? AR[el.dataset.i18n] : EN[el.dataset.i18n]; if (v) el.innerHTML = v; });
  const b = $('#lang'); b.textContent = lang === 'ar' ? 'English' : 'عربي'; b.lang = lang === 'ar' ? 'en' : 'ar';
  if (COARSE) $('#cadhint').textContent = T('cad_hint_touch');
  langHooks.forEach(f => f());
  tick();
}
$('#lang').addEventListener('click', () => { lang = lang === 'ar' ? 'en' : 'ar'; try { localStorage.setItem('altair-lang', lang); } catch (e) {} applyLang(); });

/* ====================== Intro ====================== */
(function intro() {
  const el = $('#intro'); let seen = false;
  try { seen = sessionStorage.getItem('altair-intro') === '1'; sessionStorage.setItem('altair-intro', '1'); } catch (e) {}
  if (RM || seen) { el.classList.add('gone'); return; }
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('play')));
  setTimeout(() => el.classList.add('gone'), 2100);
  el.addEventListener('click', () => el.classList.add('gone'));
})();

/* ====================== Countdown ====================== */
const LAUNCH = new Date('2026-12-12T09:00:00+03:00');
function tick() {
  let s = Math.max(0, Math.floor((LAUNCH - Date.now()) / 1000));
  const d = Math.floor(s / 86400); s -= d * 86400; const h = Math.floor(s / 3600); s -= h * 3600; const m = Math.floor(s / 60); s -= m * 60;
  $('#cd-d').textContent = num(d); $('#cd-h').textContent = num(h, 2); $('#cd-m').textContent = num(m, 2); $('#cd-s').textContent = num(s, 2);
  $('#chipdays').textContent = num(d);
}
setInterval(tick, 1000);

/* ====================== Scroll progress ====================== */
const story = $('#story'), header = $('#top');
let pTarget = 0, p = 0, storyVisible = true;
function readScroll() {
  const r = story.getBoundingClientRect(), span = story.offsetHeight - innerHeight;
  pTarget = clamp(-r.top / span);
  header.classList.toggle('solid', pTarget > .405 || r.bottom < 70);
}
addEventListener('scroll', readScroll, { passive: true }); addEventListener('resize', readScroll);
new IntersectionObserver(([e]) => { storyVisible = e.isIntersecting; }).observe(story);
readScroll(); p = pTarget;

/* ====================== Night sky with Aquila ====================== */
const sky = (function () {
  const c = $('#sky'), x = c.getContext('2d'), lab = $('#starlabel');
  const A = { alpha: [19.846, 8.87, .76], gamma: [19.771, 10.61, 2.7], beta: [19.922, 6.41, 3.7], delta: [19.425, 3.11, 3.4], zeta: [19.090, 13.86, 3.0], eps: [18.994, 15.07, 4.0], theta: [20.188, -.82, 3.2], lambda: [19.104, -4.88, 3.4], eta: [19.874, 1.01, 3.9] };
  const L = [['gamma', 'alpha'], ['alpha', 'beta'], ['alpha', 'delta'], ['delta', 'zeta'], ['zeta', 'eps'], ['delta', 'lambda'], ['delta', 'eta'], ['eta', 'theta']];
  let W = 0, H = 0, stars = [];
  function size() {
    const r = c.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
    W = r.width; H = r.height; c.width = W * dpr; c.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0);
    let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    stars = Array.from({ length: Math.round(W * H / 2400) }, () => ({ x: rnd() * W, y: rnd() * H, r: rnd() ** 3 * 1.5 + .3, p: rnd() * 6.28, s: .4 + rnd() * 1.2 }));
  }
  function proj([ra, dec]) {
    const d = isDesk(), cx = d ? W * (lang === 'ar' ? .28 : .74) : W * .6, cy = d ? H * .42 : H * .7, k = d ? Math.min(W, 1300) / 46 : W / 48;
    return [cx - (ra - 19.6) * 15 * k, cy - (dec - 5) * k];
  }
  function draw(t, alpha) {
    x.clearRect(0, 0, W, H);
    if (alpha <= 0) return;
    x.globalAlpha = alpha;
    for (const s of stars) { x.globalAlpha = alpha * (.45 + (RM ? 0 : .3 * Math.sin(t * s.s + s.p)) + .2); x.fillStyle = '#e3ebf8'; x.beginPath(); x.arc(s.x, s.y, s.r, 0, 6.283); x.fill(); }
    x.globalAlpha = alpha * .4; x.strokeStyle = '#8ecae6'; x.lineWidth = 1;
    for (const [a, b] of L) { const p1 = proj(A[a]), q = proj(A[b]); x.beginPath(); x.moveTo(...p1); x.lineTo(...q); x.stroke(); }
    x.globalAlpha = alpha;
    for (const k in A) {
      const [px, py] = proj(A[k]);
      if (k === 'alpha') {
        const g = x.createRadialGradient(px, py, 0, px, py, 30); g.addColorStop(0, 'rgba(252,163,17,.8)'); g.addColorStop(1, 'rgba(252,163,17,0)');
        x.fillStyle = g; x.beginPath(); x.arc(px, py, 30, 0, 6.283); x.fill();
        x.fillStyle = '#fff4d8'; x.beginPath(); x.arc(px, py, 3.8, 0, 6.283); x.fill();
        x.strokeStyle = '#fca311'; x.lineWidth = 1.2; x.beginPath(); x.arc(px, py, 12 + (RM ? 0 : Math.sin(t * 1.6) * 1.5), 0, 6.283); x.stroke();
        lab.style.left = px + 'px'; lab.style.top = py + 'px';
      } else { x.fillStyle = '#eef3fc'; x.beginPath(); x.arc(px, py, Math.max(1, 3 - A[k][2] * .5), 0, 6.283); x.fill(); }
    }
    x.globalAlpha = 1;
  }
  size(); addEventListener('resize', size);
  return { draw };
})();

/* ====================== Shared CAD model ====================== */
// The outer shell, base and lid in the logo's navy; the inner printed decks in light grey
const NAVY = '#1b2a4c';
const PART_COLOR = { base: NAVY, camera: '#dfe3ea', computer: '#c9ced6', battery: '#e7e9ee', sensors: '#dfe3ea', radio: '#dfe3ea', shell: NAVY, lid: NAVY };
const EXPLODE = { base: [0, -46, 0], camera: [0, -24, 0], computer: [0, -10, 0], battery: [0, 8, 44], sensors: [0, 26, 0], radio: [0, 50, 0], lid: [0, 84, 0], shell: [118, 22, 0] };
const CHIP_COLOR = { camera: '#2b2f36', computer: '#1e4d3a', battery: '#b9c0ca', sensors: '#24305e', radio: '#2a5db0', antenna: '#15181d', parachute: '#f26b1d', shell: NAVY };
let cadGeo = null; const cadWaiters = [];
fetch('assets/cansat.json').then(r => r.json()).then(j => {
  const bin = Uint8Array.from(atob(j.glb), ch => ch.charCodeAt(0)).buffer;
  new GLTFLoader().parse(bin, '', g => {
    cadGeo = {};
    g.scene.updateMatrixWorld(true);
    g.scene.traverse(o => {
      if (!o.isMesh) return;
      const name = o.name.replace(/_\d+$/, '');
      const geo = (o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone()).applyMatrix4(o.matrixWorld);
      geo.computeVertexNormals(); cadGeo[name] = geo;
    });
    cadWaiters.splice(0).forEach(f => f());
  });
});
const whenCad = f => (cadGeo ? f() : cadWaiters.push(f));

// Builds one CanSat: the eight printed parts plus simple stand-in electronics, each part in its own group
// Small canvas textures for the boards, so the electronics read as real parts up close
const texCache = {};
function boardTex(base, accent, kind) {
  const key = base + kind; if (texCache[key]) return texCache[key];
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  let sd = kind.length * 97 + 13; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  x.fillStyle = base; x.fillRect(0, 0, 256, 256);
  x.strokeStyle = accent; x.lineWidth = 2.2; x.globalAlpha = .55;
  for (let i = 0; i < 26; i++) { let px = r() * 256, py = r() * 256; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 3; k++) { if (r() > .5) px += (r() - .5) * 120; else py += (r() - .5) * 120; x.lineTo(px, py); } x.stroke(); }
  x.globalAlpha = 1; x.fillStyle = '#d8b35a'; for (let i = 0; i < 40; i++) { const px = r() * 240 + 8, py = r() * 240 + 8; x.fillRect(px, py, 6, 4); }
  x.fillStyle = '#d8b35a'; for (let i = 0; i < 14; i++) { x.beginPath(); x.arc(8 + i * 17.5, 248, 5, 0, 6.283); x.fill(); x.beginPath(); x.arc(8 + i * 17.5, 8, 5, 0, 6.283); x.fill(); }
  x.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < 10; i++) { x.fillRect(r() * 220 + 10, r() * 220 + 10, 18 + r() * 20, 3); }
  if (kind === 'chip') { x.fillStyle = '#16181c'; x.fillRect(80, 80, 96, 96); x.fillStyle = '#2a2d33'; x.fillRect(86, 86, 84, 84); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return (texCache[key] = t);
}
function labelTex(bg, fg, lines) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d');
  x.fillStyle = bg; x.fillRect(0, 0, 256, 128); x.fillStyle = fg; x.font = '600 34px "Readex Pro",sans-serif'; x.fillText(lines[0], 18, 52);
  x.font = '400 22px "Readex Pro",sans-serif'; x.fillText(lines[1], 18, 92); x.fillRect(18, 104, 220, 3);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function fabricTex() {
  if (texCache.fabric) return texCache.fabric;
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.fillStyle = '#f26b1d'; x.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 128; i += 4) { x.fillStyle = 'rgba(255,255,255,.07)'; x.fillRect(i, 0, 1, 128); x.fillStyle = 'rgba(0,0,0,.07)'; x.fillRect(0, i, 128, 1); }
  x.strokeStyle = 'rgba(120,40,0,.35)'; x.lineWidth = 2; for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(0, 20 + i * 24); x.bezierCurveTo(40, 8 + i * 24, 80, 36 + i * 24, 128, 18 + i * 24); x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return (texCache.fabric = t);
}

// Builds one CanSat: the eight printed parts from our CAD plus stand-in electronics, each part in its own group
function makeCan() {
  const root = new THREE.Group(), groups = {}, comps = {};
  const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: o.r ?? .55, metalness: o.m ?? .05, map: o.map || null });
  const shellMat = () => new THREE.MeshPhysicalMaterial({ color: NAVY, roughness: .42, metalness: .15, clearcoat: .7, clearcoatRoughness: .28, sheen: .3, sheenColor: new THREE.Color('#5d86c4') });
  for (const name in cadGeo) {
    const grp = new THREE.Group(); grp.name = name;
    const navy = name === 'shell' || name === 'base' || name === 'lid';
    const mat = navy ? shellMat() : M(PART_COLOR[name] || '#ccc', { r: .72 });
    const mesh = new THREE.Mesh(cadGeo[name], mat); mesh.userData.cad = name; grp.add(mesh);
    groups[name] = grp; root.add(grp);
  }
  const add = (key, grpName, geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz);
    groups[grpName].add(m); (comps[key] ||= []).push(m); return m;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d), C = (r, h, sg = 24) => new THREE.CylinderGeometry(r, r, h, sg);
  // a circuit board: textured top face, plain edges
  const board = (base, accent, kind) => { const side = M(base, { r: .6 }), top = M('#ffffff', { r: .45, map: boardTex(base, accent, kind) }); return [side, side, top, side, side, side]; };
  const metal = M('#cfd4da', { r: .25, m: .85 }), gold = M('#d6ad55', { r: .3, m: .9 }), black = M('#16181c', { r: .45 }), rubber = M('#1a1c20', { r: .9 });
  const glass = new THREE.MeshPhysicalMaterial({ color: '#2c4f7c', roughness: .05, metalness: .2, clearcoat: 1, clearcoatRoughness: .02 });
  const chip = M('#121418', { r: .35 });
  // Cameras: two modules under the camera deck, lenses pointing down
  add('camera', 'camera', B(20, 1.6, 20), board('#1f2328', '#3b4048', 'cam'), 9, 23.2, 2);
  add('camera', 'camera', C(4.4, 4.2), black, 9, 20.4, 2); add('camera', 'camera', C(3.6, 1.2), M('#2a2d33', { r: .3, m: .5 }), 9, 17.9, 2); add('camera', 'camera', C(2.7, .6), glass, 9, 17.2, 2);
  add('camera', 'camera', B(16, 1.6, 14), board('#1f2328', '#3b4048', 'th'), -12, 23.2, 16); add('camera', 'camera', C(3.4, 4.4, 6), M('#8a8f97', { r: .3, m: .8 }), -12, 20.3, 16); add('camera', 'camera', C(2.2, .5), glass, -12, 18, 16);
  // Flight computer: a thumb-sized board with a metal shield and a USB-C port, held by the strap
  add('computer', 'computer', B(21, 1.2, 17.5), board('#1e4d3a', '#2f7a5c', 'mcu'), -12, 18.6, -4);
  add('computer', 'computer', B(12, 1.6, 12), metal, -12, 17.3, -4); add('computer', 'computer', B(4.2, 2.6, 8.6), metal, -1.4, 18.6, -4);
  add('computer', 'computer', B(5, .8, 5), chip, -18, 19.6, 1);
  // Battery: a pouch cell with a printed label in the drawer
  add('battery', 'battery', B(34, 8.6, 48), M('#c4cbd5', { r: .3, m: .65 }), 0, 35, -6);
  const lab = add('battery', 'battery', B(34.2, 8.8, 24), [M('#1d5d8f'), M('#1d5d8f'), M('#ffffff', { map: labelTex('#1d5d8f', '#ffffff', ['Li-Po 3.7 V', 'Rechargeable']) }), M('#1d5d8f'), M('#1d5d8f'), M('#1d5d8f')], 0, 35, -6);
  add('battery', 'battery', C(.9, 14, 6), M('#c8322c'), 4, 35, 22, Math.PI / 2); add('battery', 'battery', C(.9, 14, 6), rubber, -4, 35, 22, Math.PI / 2);
  add('battery', 'battery', B(10, 4, 5), M('#f2f2f2', { r: .5 }), 0, 35, 30);
  // Sensors: two small boards with chips and header pins
  for (const [sx, sz, base] of [[-12, 6, '#24305e'], [12, -8, '#3b2a6b']]) {
    add('sensors', 'sensors', B(18, 1.6, 15), board(base, '#4c5ca0', 'chip'), sx, 60.4, sz);
    add('sensors', 'sensors', B(3.2, 1, 3.2), metal, sx + 3, 61.7, sz - 2); add('sensors', 'sensors', B(14, 2.4, 2.4), black, sx, 62, sz + 6);
    for (let i = 0; i < 6; i++) add('sensors', 'sensors', C(.35, 5, 6), gold, sx - 6 + i * 2.4, 63.6, sz + 6);
  }
  // Radio: a module with a shield, an antenna socket and a cable up to the lid
  add('radio', 'radio', B(21, 2.2, 36), board('#2a5db0', '#4a84d8', 'radio'), 0, 88, 0);
  add('radio', 'radio', B(16, 2.2, 20), metal, 0, 90.2, -5); add('radio', 'radio', C(3, 6), gold, 0, 92, 14);
  add('radio', 'radio', C(1.2, 34, 8), rubber, 0, 112, 14);
  // Antenna on the lid, and the folded parachute tied to it
  add('antenna', 'lid', C(4.4, 6), gold, 0, 141, 14); add('antenna', 'lid', C(4.6, 2, 6), gold, 0, 145, 14);
  add('antenna', 'lid', new THREE.CylinderGeometry(3, 4, 44, 20), rubber, 0, 168, 14); add('antenna', 'lid', new THREE.SphereGeometry(3, 16, 8), rubber, 0, 190, 14);
  const ft = fabricTex();
  add('parachute', 'lid', new THREE.CapsuleGeometry(9, 22, 8, 18), new THREE.MeshStandardMaterial({ map: ft, roughness: .85 }), -14, 147, -10, 0, .4, Math.PI / 2);
  add('parachute', 'lid', new THREE.TorusGeometry(9.4, .9, 6, 20), M('#f5f2ea', { r: .9 }), -14, 147, -10, 0, .4 + Math.PI / 2, 0);
  const lp = []; for (const [lx, lz] of [[-30, -20], [-30, 10], [10, -30], [4, 22]]) lp.push(-14, 147, -10, lx, 138, lz);
  const lines = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(lp, 3)), new THREE.LineBasicMaterial({ color: '#f5f2ea' }));
  groups.lid.add(lines); (comps.parachute ||= []).push(lines);
  comps.shell = [groups.shell.children[0], groups.base.children[0], groups.lid.children[0]];
  root.traverse(o => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { m.transparent = true; }); });
  return { root, groups, comps };
}
const eachMat = (o, f) => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(f); };
function roomEnv(r) { const pm = new THREE.PMREMGenerator(r); const t = pm.fromScene(new RoomEnvironment(), .04).texture; pm.dispose(); return t; }

/* ====================== Story renderer ====================== */
const glCanvas = $('#gl'), stageEl = $('#stage');
let renderer = null;
try {
  renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, alpha: true, logarithmicDepthBuffer: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(isDesk() ? 2 : 1.5, devicePixelRatio));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
} catch (e) { renderer = null; }
let SW = 1, SH = 1;
function sizeStage() { const r = stageEl.getBoundingClientRect(); SW = r.width; SH = r.height; renderer && renderer.setSize(SW, SH, false); }
sizeStage(); addEventListener('resize', sizeStage);

/* ---- Scene 1: the can builds itself ---- */
const canScene = new THREE.Scene();
const canCam = new THREE.PerspectiveCamera(30, 1, 5, 6000);
canScene.add(new THREE.HemisphereLight(0xdbe8ff, 0x1a2540, .7));
{ const k = new THREE.DirectionalLight(0xfff3e0, 2.4); k.position.set(220, 320, 260); canScene.add(k); const r2 = new THREE.DirectionalLight(0x8ecae6, 2.6); r2.position.set(-260, 160, -260); canScene.add(r2); const r3 = new THREE.DirectionalLight(0xfca311, 1.2); r3.position.set(300, 40, -200); canScene.add(r3); }
if (renderer) { canScene.environment = roomEnv(renderer); canScene.environmentIntensity = .6; }
let storyCan = null;
const ORDER = [['base', .10, .125], ['computer', .125, .155], ['camera', .155, .185], ['battery', .20, .23], ['sensors', .23, .26], ['radio', .26, .29], ['shell', .32, .355], ['lid', .355, .385]];
const TAGGED = { computer: 'tag_computer', camera: 'tag_camera', battery: 'tag_battery', sensors: 'tag_sensors', radio: 'tag_radio', lid: 'tag_lid' };
const tagEls = {};
whenCad(() => {
  storyCan = makeCan(); canScene.add(storyCan.root);
  for (const k in TAGGED) { const s = document.createElement('span'); $('#tags').appendChild(s); tagEls[k] = s; }
  langHooks.push(() => { for (const k in TAGGED) tagEls[k].textContent = T(TAGGED[k]); });
  for (const k in TAGGED) tagEls[k].textContent = T(TAGGED[k]);
});
const tmpV = new THREE.Vector3(), tmpBox = new THREE.Box3();
function updateCanScene(pp, t) {
  if (!storyCan) return;
  const desk = isDesk();
  // gentle turn while building, then the can tips toward the ground and falls out of frame
  storyCan.root.rotation.y = -0.6 + pp * 5.5;
  const fall = smooth(.375, .415, pp);
  storyCan.root.position.set(0, -fall * 420, 0);
  for (const [name, a, b] of ORDER) {
    const g = storyCan.groups[name]; if (!g) continue;
    const k = RM ? (pp >= a ? 1 : 0) : smooth(a, b, pp);
    g.position.set(name === 'shell' ? 0 : (1 - k) * 0, (1 - k) * (name === 'shell' || name === 'lid' ? 260 : 200), name === 'battery' ? (1 - k) * 60 : 0);
    g.visible = k > 0.001;
    g.traverse(o => eachMat(o, m => { m.opacity = k; m.depthWrite = k > .98; }));
    if (tagEls[name]) {
      const show = k > .98 && pp < (name === 'lid' ? .4 : b + .05) && pp > a;
      if (show) {
        tmpBox.setFromObject(g); tmpBox.getCenter(tmpV); tmpV.project(canCam);
        tagEls[name].style.left = ((tmpV.x + 1) / 2 * SW) + 'px'; tagEls[name].style.top = ((1 - tmpV.y) / 2 * SH) + 'px';
      }
      tagEls[name].style.opacity = show ? 1 : 0;
    }
  }
  const R = desk ? 420 : 600, ang = .9 + pp * .6;
  canCam.position.set(Math.sin(ang) * R, 150 + pp * 60, Math.cos(ang) * R);
  canCam.aspect = SW / SH;
  canCam.lookAt(0, 70, 0);
  // push the can to the side of the caption on desktop, upward above the caption on phones
  const shiftX = desk ? (lang === 'ar' ? .2 : -.2) * SW : 0, shiftY = desk ? 0 : .14 * SH;
  canCam.setViewOffset(SW, SH, shiftX, shiftY, SW, SH);
  canCam.updateProjectionMatrix();
}

/* ---- Scene 2: Bahrain Bay ---- */
let bay = null;
const bayScene = new THREE.Scene();
const bayCam = new THREE.PerspectiveCamera(50, 1, .05, 14000);
fetch('assets/bay.json').then(r => r.json()).then(d => { bay = buildBay(d); drawCoast(d); addEventListener('resize', () => drawCoast(d)); langHooks.push(() => drawCoast(d)); });

function shapeFrom(ring) { const s = new THREE.Shape(); ring.forEach(([x, z], i) => (i ? s.lineTo(x, -z) : s.moveTo(x, -z))); return s; }
// Seeded random so the scene looks the same for every visitor
let seed = 20261212; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// ----- procedural textures (no image downloads) -----
function canvasTex(w, h, draw, repeat = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function facadeTex() { // 4 windows wide (12 m) by 4 floors (14 m)
  return canvasTex(256, 256, (x, w, h) => {
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      const l = 40 + rnd() * 30; x.fillStyle = `hsl(205,22%,${l}%)`;
      x.fillRect(c * 64 + 9, r * 64 + 14, 46, 38);
      x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(c * 64 + 9, r * 64 + 14, 46, 5);
    }
    x.fillStyle = 'rgba(0,0,0,.08)'; for (let r = 0; r < 4; r++) x.fillRect(0, r * 64 + 58, w, 3);
  });
}
function noiseTex(base, spread, n = 9000) {
  return canvasTex(256, 256, (x, w, h) => { x.fillStyle = base; x.fillRect(0, 0, w, h); for (let i = 0; i < n; i++) { const v = (rnd() - .5) * spread; x.fillStyle = v > 0 ? `rgba(255,255,255,${v})` : `rgba(0,0,0,${-v})`; x.fillRect(rnd() * w, rnd() * h, 2, 2); } });
}
function waterNormals() { // tileable ripples: sum of integer-frequency waves
  const S = 256, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'), img = x.createImageData(S, S);
  const waves = Array.from({ length: 9 }, () => ({ fx: Math.round(rnd() * 8 - 4) || 1, fy: Math.round(rnd() * 8 - 4) || 2, a: .3 + rnd() * .7, ph: rnd() * 6.28 }));
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
    let dx = 0, dy = 0;
    for (const w of waves) { const ph = 6.2832 * (w.fx * i + w.fy * j) / S + w.ph, c2 = Math.cos(ph) * w.a; dx += c2 * w.fx; dy += c2 * w.fy; }
    const k = (j * S + i) * 4, nx = -dx * .06, ny = -dy * .06, nz = 1, L = Math.hypot(nx, ny, nz);
    img.data[k] = (nx / L * .5 + .5) * 255; img.data[k + 1] = (ny / L * .5 + .5) * 255; img.data[k + 2] = (nz / L * .5 + .5) * 255; img.data[k + 3] = 255;
  }
  x.putImageData(img, 0, 0); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
// split an extruded shape into roof (caps) and wall (sides) pieces, tinted per building
function splitExtrude(g, tint) {
  const out = [[], []], col = new THREE.Color(tint);
  for (const grp of g.groups) {
    const piece = new THREE.BufferGeometry();
    for (const name of ['position', 'normal', 'uv']) { const a = g.attributes[name]; piece.setAttribute(name, new THREE.BufferAttribute(a.array.slice(grp.start * a.itemSize, (grp.start + grp.count) * a.itemSize), a.itemSize)); }
    const n = grp.count, cc = new Float32Array(n * 3); for (let i = 0; i < n; i++) { cc[i * 3] = col.r; cc[i * 3 + 1] = col.g; cc[i * 3 + 2] = col.b; }
    piece.setAttribute('color', new THREE.BufferAttribute(cc, 3));
    out[grp.materialIndex ? 1 : 0].push(piece);
  }
  return out;
}

const IRON = ['#0b0423', '#3a0c62', '#7a1878', '#c02f5b', '#ec5f24', '#f8a00f', '#fde14a', '#fffbe0'];
function ironbow(t) { t = clamp(t) * (IRON.length - 1); const i = Math.min(IRON.length - 2, Math.floor(t)); return new THREE.Color(IRON[i]).lerp(new THREE.Color(IRON[i + 1]), t - i); }

function buildBay(D) {
  const S = bayScene, desk = isDesk();
  const sunDir = new THREE.Vector3(); { const az = THREE.MathUtils.degToRad(140), el = THREE.MathUtils.degToRad(31); sunDir.set(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)); }
  // physically based sky for 12 December, about 9 am, and an environment map from it for reflections
  const sky = new Sky(); sky.scale.setScalar(9000);
  const su = sky.material.uniforms; su.turbidity.value = 5; su.rayleigh.value = 1.4; su.mieCoefficient.value = .006; su.mieDirectionalG.value = .82; su.sunPosition.value.copy(sunDir);
  S.add(sky);
  if (renderer) { const pm = new THREE.PMREMGenerator(renderer); const envScene = new THREE.Scene(); const s2 = new Sky(); s2.scale.setScalar(1000); s2.material.uniforms.sunPosition.value.copy(sunDir); for (const k of ['turbidity', 'rayleigh', 'mieCoefficient', 'mieDirectionalG']) s2.material.uniforms[k].value = su[k].value; envScene.add(s2); S.environment = pm.fromScene(envScene).texture; S.environmentIntensity = .55; }
  const haze = new THREE.Color('#d3e3ea'); S.fog = new THREE.Fog(haze, 1100, 4200);
  S.add(new THREE.HemisphereLight(0xdfeefc, 0xb8a47e, .45));
  const sun = new THREE.DirectionalLight(0xfff0d6, 2.15); sun.position.copy(sunDir).multiplyScalar(1500);
  sun.castShadow = true; sun.shadow.mapSize.setScalar(desk ? 4096 : 2048);
  Object.assign(sun.shadow.camera, { left: -700, right: 700, top: 700, bottom: -700, near: 10, far: 4000 });
  sun.shadow.bias = -0.0003; sun.shadow.normalBias = .5; S.add(sun);
  const heat = new Map(); const H = (m, h) => { heat.set(m, h); return m; };
  const flat = (o, units) => Object.assign(new THREE.MeshStandardMaterial(o), { polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: units });

  // sea with moving ripples
  const wn = waterNormals(); wn.repeat.set(210, 210);
  const seaMat = new THREE.MeshStandardMaterial({ color: '#1c7891', roughness: .16, metalness: .05, normalMap: wn, normalScale: new THREE.Vector2(.18, .18) });
  const sea = H(new THREE.Mesh(new THREE.PlaneGeometry(16000, 16000), seaMat), .16); sea.rotation.x = -Math.PI / 2; sea.position.y = -1; sea.receiveShadow = true; S.add(sea);
  // land: pale paving and sand with grain
  const landTex = noiseTex('#f2f2f2', .14); landTex.repeat.set(1 / 30, 1 / 30);
  const landGeos = D.land.map(poly => { const s = shapeFrom(poly[0]); poly.slice(1).forEach(h => s.holes.push(new THREE.Path(h.map(([x, z]) => new THREE.Vector2(x, -z))))); const g = new THREE.ExtrudeGeometry(s, { depth: 1.6, bevelEnabled: false }); g.rotateX(-Math.PI / 2); g.translate(0, -1, 0); return g; });
  const land = H(new THREE.Mesh(mergeGeometries(landGeos), new THREE.MeshStandardMaterial({ color: '#d8cbae', map: landTex, roughness: .96 })), .62); land.receiveShadow = true; S.add(land);
  // parks
  const grassTex = noiseTex('#8fb36c', .18); grassTex.repeat.set(1 / 20, 1 / 20);
  const parkGeos = D.parks.map(r => { const g = new THREE.ShapeGeometry(shapeFrom(r)); g.rotateX(-Math.PI / 2); return g; });
  const parks = H(new THREE.Mesh(mergeGeometries(parkGeos), flat({ color: '#a7c98a', map: grassTex, roughness: 1 }, -2)), .4); parks.position.y = .62; parks.receiveShadow = true; S.add(parks);
  // roads: asphalt with lane dashes
  const roadTex = canvasTex(128, 64, (x, w, h) => { x.fillStyle = '#62666d'; x.fillRect(0, 0, w, h); for (let i = 0; i < 700; i++) { x.fillStyle = `rgba(255,255,255,${rnd() * .06})`; x.fillRect(rnd() * w, rnd() * h, 2, 2); } x.fillStyle = '#e9e6dc'; x.fillRect(0, h / 2 - 2, w * .55, 4); x.fillRect(0, 2, w, 2); x.fillRect(0, h - 4, w, 2); });
  const rg = [];
  for (const [w, pts] of D.roads) for (let i = 0; i < pts.length - 1; i++) {
    const [x1, z1] = pts[i], [x2, z2] = pts[i + 1], dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz); if (len < .5) continue;
    const g = new THREE.PlaneGeometry(len + w * .5, w); const uv = g.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setX(k, uv.getX(k) * (len + w * .5) / 12);
    g.rotateX(-Math.PI / 2); g.rotateY(-Math.atan2(dz, dx)); g.translate((x1 + x2) / 2, 0, (z1 + z2) / 2); rg.push(g);
  }
  const roads = H(new THREE.Mesh(mergeGeometries(rg), flat({ color: '#ffffff', map: roadTex, roughness: .9 }, -4)), .82); roads.position.y = .66; roads.receiveShadow = true; S.add(roads);
  // buildings: facades with windows, roofs plain; towers read as glass
  const fac = facadeTex(); fac.repeat.set(1 / 12, 1 / 14);
  const roofTex = noiseTex('#d9d6cf', .1, 4000); roofTex.repeat.set(1 / 25, 1 / 25);
  const roofs = [], walls = [];
  const tints = ['#e9e2d4', '#ddd3c0', '#d3d7da', '#e6dccb', '#cfd5d9', '#e0d0b5'];
  for (const [h, mh, ring] of D.buildings) {
    if (ring.length < 3 || h - mh < 1) continue;
    const g = new THREE.ExtrudeGeometry(shapeFrom(ring), { depth: h - mh, bevelEnabled: false }); g.rotateX(-Math.PI / 2); g.translate(0, mh + .6, 0);
    const tint = h >= 60 ? (rnd() > .5 ? '#8fb0c4' : '#a3b6c1') : tints[Math.floor(rnd() * tints.length)];
    const [c, sides] = splitExtrude(g, tint); roofs.push(...c); walls.push(...sides);
  }
  const wallM = H(new THREE.Mesh(mergeGeometries(walls), new THREE.MeshStandardMaterial({ vertexColors: true, map: fac, roughness: .55, metalness: .08 })), .55);
  const roofM = H(new THREE.Mesh(mergeGeometries(roofs), new THREE.MeshStandardMaterial({ vertexColors: true, map: roofTex, roughness: .9 })), .74);
  for (const m of [wallM, roofM]) { m.castShadow = m.receiveShadow = true; S.add(m); }

  // The Four Seasons from its map outline: bronze piers with fins, glass floors, the open gap and the sky bridge
  const finTex = canvasTex(64, 64, (x, w, h) => { x.fillStyle = '#b08a58'; x.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) { x.fillStyle = 'rgba(70,45,20,.25)'; x.fillRect(i * 16 + 12, 0, 3, h); x.fillStyle = 'rgba(255,240,210,.25)'; x.fillRect(i * 16 + 2, 0, 3, h); } }); finTex.repeat.set(1 / 6, 1 / 6);
  const glassTex = canvasTex(64, 128, (x, w, h) => { x.fillStyle = '#7fa6bf'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(25,45,60,.55)'; x.fillRect(0, 0, w, 10); x.fillRect(0, 64, w, 10); x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(0, 12, w, 4); x.fillRect(0, 76, w, 4); x.fillStyle = 'rgba(20,35,50,.3)'; x.fillRect(30, 0, 2, h); }); glassTex.repeat.set(1 / 4, 1 / 7.4);
  const FSM = {
    bronze: new THREE.MeshStandardMaterial({ map: finTex, roughness: .45, metalness: .35 }),
    glass: new THREE.MeshStandardMaterial({ map: glassTex, roughness: .08, metalness: .75, envMapIntensity: 1.2 }),
    stone: new THREE.MeshStandardMaterial({ color: '#efe8dc', roughness: .8 })
  };
  const FSH = { bronze: .6, glass: .32, stone: .66 };
  for (const pt of D.fsParts) { const g = new THREE.ExtrudeGeometry(shapeFrom(pt.r), { depth: pt.y1 - pt.y0, bevelEnabled: false }); g.rotateX(-Math.PI / 2); g.translate(0, pt.y0 + .6, 0); const m = H(new THREE.Mesh(g, FSM[pt.m]), FSH[pt.m]); m.castShadow = m.receiveShadow = true; S.add(m); }

  // ---- point-in-land helpers ----
  const inRing = (x, z, r) => { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, zi] = r[i], [xj, zj] = r[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; };
  const onLand = (x, z) => D.land.some(poly => inRing(x, z, poly[0]) && !poly.slice(1).some(h => inRing(x, z, h)));
  const nearFS = (x, z, m) => D.fsParts.some(pt => { const xs = pt.r.map(q => q[0]), zs = pt.r.map(q => q[1]); return x > Math.min(...xs) - m && x < Math.max(...xs) + m && z > Math.min(...zs) - m && z < Math.max(...zs) + m; });

  // ---- the Four Seasons island: beach edge, lawns, pools, palms, umbrellas and people ----
  const isl = D.island, cx0 = isl.reduce((a, q) => a + q[0], 0) / isl.length, cz0 = isl.reduce((a, q) => a + q[1], 0) / isl.length;
  const shrink = k => isl.map(([x, z]) => [cx0 + (x - cx0) * k, cz0 + (z - cz0) * k]);
  const beachTex = noiseTex('#e9d9b0', .1); beachTex.repeat.set(1 / 15, 1 / 15);
  const beachG = new THREE.ShapeGeometry(shapeFrom(isl)); beachG.rotateX(-Math.PI / 2);
  const beach = H(new THREE.Mesh(beachG, flat({ color: '#ffffff', map: beachTex, roughness: 1 }, -2)), .7); beach.position.y = .63; beach.receiveShadow = true; S.add(beach);
  const lawnG = new THREE.ShapeGeometry(shapeFrom(shrink(.8))); lawnG.rotateX(-Math.PI / 2);
  const lawn = H(new THREE.Mesh(lawnG, flat({ color: '#86b06a', map: grassTex, roughness: 1 }, -4)), .38); lawn.position.y = .64; lawn.receiveShadow = true; S.add(lawn);
  const plazaG = new THREE.CircleGeometry(48, 40); plazaG.rotateX(-Math.PI / 2);
  const plaza = H(new THREE.Mesh(plazaG, flat({ color: '#ede4d3', map: landTex, roughness: .9 }, -6)), .64); plaza.position.set(0, .65, 0); plaza.receiveShadow = true; S.add(plaza);
  const poolMat = flat({ color: '#4fd0e3', roughness: .05, metalness: .1, normalMap: wn, normalScale: new THREE.Vector2(.15, .15) }, -8);
  for (const [px, pz, w, d, r] of [[46, 40, 26, 11, .65], [-62, -30, 18, 8, .65], [-20, 70, 12, 7, .2]]) {
    const deck = new THREE.Mesh(new THREE.PlaneGeometry(w + 6, d + 6).rotateX(-Math.PI / 2), flat({ color: '#e9dcc5', roughness: .9 }, -7)); deck.position.set(px, .66, pz); deck.rotation.y = r; S.add(H(deck, .7));
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), poolMat); pool.position.set(px, .67, pz); pool.rotation.y = r; S.add(H(pool, .24));
  }
  // palms just inside the shoreline
  const palmPts = [];
  for (let i = 0; i < isl.length; i++) {
    const [ax, az] = isl[i], [bx, bz] = isl[(i + 1) % isl.length], L = Math.hypot(bx - ax, bz - az);
    for (let d = 0; d < L; d += 9) { const u = d / L, x = ax + (bx - ax) * u, z = az + (bz - az) * u, k = 1 - 9 / Math.hypot(x - cx0, z - cz0); const px = cx0 + (x - cx0) * k, pz = cz0 + (z - cz0) * k; if (!nearFS(px, pz, 6)) palmPts.push([px, pz]); }
  }
  const trunkG = new THREE.CylinderGeometry(.18, .3, 7, 6); trunkG.translate(0, 3.5, 0);
  const fronds = []; for (let i = 0; i < 8; i++) { const f = new THREE.BoxGeometry(.55, .06, 3.4, 1, 1, 3); const pos = f.attributes.position; for (let k = 0; k < pos.count; k++) { const z = pos.getZ(k) + 1.7, w = 1 - Math.abs(z - 1.4) / 2.2; pos.setX(k, pos.getX(k) * Math.max(.2, w)); pos.setY(k, pos.getY(k) - z * z * .16); pos.setZ(k, z); } f.computeVertexNormals(); f.rotateY(i / 8 * 6.283 + (i % 2) * .2); fronds.push(f); }
  const crownG = mergeGeometries(fronds); crownG.translate(0, 7, 0);
  const inst = (geo, mat, pts, place, h) => { const m = new THREE.InstancedMesh(geo, mat, pts.length); const o = new THREE.Object3D(); pts.forEach((q, i) => { place(o, q, i); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }); m.castShadow = true; m.receiveShadow = true; S.add(m); heat.set(m, h); return m; };
  const placePalm = (o, [x, z]) => { o.position.set(x, .6, z); o.rotation.set((rnd() - .5) * .12, rnd() * 6.28, (rnd() - .5) * .12); o.scale.setScalar(.85 + rnd() * .35); };
  seed = 77; inst(trunkG, new THREE.MeshStandardMaterial({ color: '#8a6a47', roughness: .9 }), palmPts, placePalm, .5);
  seed = 77; inst(crownG, new THREE.MeshStandardMaterial({ color: '#4a7a34', roughness: .8, side: THREE.DoubleSide }), palmPts, placePalm, .36);
  // umbrellas and people on the beach and by the pools
  const beachPts = [], peoplePts = [];
  for (let i = 0; i < 900 && (beachPts.length < 26 || peoplePts.length < 90); i++) {
    const j = Math.floor(rnd() * isl.length), [ax, az] = isl[j], [bx, bz] = isl[(j + 1) % isl.length], u = rnd(), x = ax + (bx - ax) * u, z = az + (bz - az) * u;
    const k = 1 - (3 + rnd() * 6) / Math.hypot(x - cx0, z - cz0), px = cx0 + (x - cx0) * k, pz = cz0 + (z - cz0) * k;
    if (nearFS(px, pz, 4) || !onLand(px, pz)) continue;
    if (beachPts.length < 26 && rnd() > .5) beachPts.push([px, pz]); else if (peoplePts.length < 90) peoplePts.push([px, pz]);
  }
  for (let i = 0; i < 24; i++) { const a = rnd() * 6.28, r = 16 + rnd() * 6; peoplePts.push([46 + Math.cos(a) * r * .8, 40 + Math.sin(a) * r * .45]); }
  const umbG = new THREE.ConeGeometry(1.5, .6, 10); umbG.translate(0, 2.3, 0); const poleG = new THREE.CylinderGeometry(.04, .04, 2.2, 4); poleG.translate(0, 1.1, 0);
  inst(poleG, new THREE.MeshStandardMaterial({ color: '#ddd' }), beachPts, (o, [x, z]) => o.position.set(x, .6, z), .5);
  const umb = inst(umbG, new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: .8 }), beachPts, (o, [x, z]) => o.position.set(x, .6, z), .5);
  beachPts.forEach((q, i) => umb.setColorAt(i, new THREE.Color(i % 3 ? '#f4f1ea' : '#1d5d8f')));
  const personG = new THREE.CapsuleGeometry(.22, 1.1, 3, 6); personG.translate(0, .8, 0);
  const people = inst(personG, new THREE.MeshStandardMaterial({ roughness: .8 }), peoplePts, (o, [x, z]) => { o.position.set(x, .6, z); o.scale.setScalar(.9 + rnd() * .2); }, .92);
  const outfit = ['#ffffff', '#1d1d1d', '#c9b08a', '#2f6fb0', '#d24b3e', '#f2c94c', '#3c8a5a'];
  peoplePts.forEach((q, i) => people.setColorAt(i, new THREE.Color(outfit[i % outfit.length])));
  // boats in the bay and trees in the parks
  const boatPts = []; for (let i = 0; boatPts.length < 9 && i < 400; i++) { const x = (rnd() - .5) * 1400, z = (rnd() - .5) * 1100; if (!onLand(x, z) && Math.hypot(x, z) > 160 && !onLand(x + 12, z) && !onLand(x - 12, z)) boatPts.push([x, z]); }
  const hullG = new THREE.BoxGeometry(8, 1.4, 2.8); hullG.translate(0, -.2, 0); const cabG = new THREE.BoxGeometry(3, 1.3, 2); cabG.translate(-.8, 1.1, 0);
  const placeBoat = (o, [x, z]) => { o.position.set(x, -.8, z); o.rotation.y = rnd() * 6.28; };
  seed = 5; inst(hullG, new THREE.MeshStandardMaterial({ color: '#fbfbf8', roughness: .4 }), boatPts, placeBoat, .55);
  seed = 5; inst(cabG, new THREE.MeshStandardMaterial({ color: '#2a3c55', roughness: .3, metalness: .4 }), boatPts, placeBoat, .4);
  const treePts = []; for (const r of D.parks) { const xs = r.map(q => q[0]), zs = r.map(q => q[1]); const area = (Math.max(...xs) - Math.min(...xs)) * (Math.max(...zs) - Math.min(...zs)); for (let i = 0; i < Math.min(40, area / 260); i++) { const x = Math.min(...xs) + rnd() * (Math.max(...xs) - Math.min(...xs)), z = Math.min(...zs) + rnd() * (Math.max(...zs) - Math.min(...zs)); if (inRing(x, z, r) && Math.hypot(x, z) < 1500) treePts.push([x, z]); } }
  const treeG = new THREE.IcosahedronGeometry(2.4, 0); treeG.translate(0, 4, 0); const tTrunk = new THREE.CylinderGeometry(.2, .3, 3, 5); tTrunk.translate(0, 1.5, 0);
  const placeTree = (o, [x, z]) => { o.position.set(x, .6, z); o.scale.setScalar(.8 + rnd() * .5); };
  seed = 9; inst(tTrunk, new THREE.MeshStandardMaterial({ color: '#7a5c3c' }), treePts, placeTree, .5);
  seed = 9; inst(treeG, new THREE.MeshStandardMaterial({ color: '#5c8a45', roughness: .9, flatShading: true }), treePts, placeTree, .36);
  // cars along the main roads
  const carPts = []; for (const [w, pts] of D.roads) { if (w < 14) continue; for (let i = 0; i < pts.length - 1; i++) { const [x1, z1] = pts[i], [x2, z2] = pts[i + 1], L = Math.hypot(x2 - x1, z2 - z1), ang = Math.atan2(z2 - z1, x2 - x1); for (let d = rnd() * 30; d < L; d += 26 + rnd() * 30) { const u = d / L, side = (rnd() > .5 ? 1 : -1) * (w * .22); carPts.push([x1 + (x2 - x1) * u - Math.sin(ang) * side, z1 + (z2 - z1) * u + Math.cos(ang) * side, ang]); } } }
  const carG = new THREE.BoxGeometry(4.5, 1.5, 1.9); carG.translate(0, 1.35, 0);
  const cars = inst(carG, new THREE.MeshStandardMaterial({ roughness: .35, metalness: .5 }), carPts.slice(0, 260), (o, [x, z, a]) => { o.position.set(x, 0, z); o.rotation.y = -a; }, .86);
  const paint = ['#f5f5f5', '#1f1f1f', '#9aa3ad', '#c8ccd1', '#7a1f24', '#24426b']; carPts.slice(0, 260).forEach((q, i) => cars.setColorAt(i, new THREE.Color(paint[i % paint.length])));

  // ---- ground station at the Hilton Garden Inn Bahrain Bay (map position from OpenStreetMap) ----
  const STN = new THREE.Vector3(D.station.x, D.station.y, D.station.z);
  const stn = new THREE.Group(); stn.position.copy(STN);
  const dish = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 8, 0, 6.283, 0, 1.1), new THREE.MeshStandardMaterial({ color: '#f2f2f2', side: THREE.DoubleSide, roughness: .4 })); dish.rotation.x = -1.1; dish.position.y = 2.4;
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, 2.4, 6), new THREE.MeshStandardMaterial({ color: '#999' })); mast.position.y = 1.2;
  const yagi = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 5, 6), new THREE.MeshStandardMaterial({ color: '#333' })); yagi.position.set(2.2, 4, 0);
  stn.add(dish, mast, yagi); stn.lookAt(0, STN.y, 0); S.add(stn); heat.set(dish, .6);
  const pulse = new THREE.Mesh(new THREE.RingGeometry(3, 3.6, 40), new THREE.MeshBasicMaterial({ color: '#fca311', transparent: true, opacity: .8, depthWrite: false, side: THREE.DoubleSide })); pulse.rotation.x = -Math.PI / 2; pulse.position.copy(STN).y += .3; S.add(pulse);
  const PK = 14, packets = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffd166' }), PK); packets.frustumCulled = false; S.add(packets);
  const linkPos = new Float32Array(41 * 3); const link = new THREE.Line(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(linkPos, 3)), new THREE.LineDashedMaterial({ color: '#fca311', dashSize: 6, gapSize: 5, transparent: true, opacity: .8 })); link.frustumCulled = false; S.add(link);

  // ---- the can under its parachute (true size) ----
  const can = new THREE.Group();
  can.add(H(new THREE.Mesh(new THREE.CylinderGeometry(.038, .038, .138, 20), new THREE.MeshStandardMaterial({ color: NAVY, roughness: .4, metalness: .2 })), .55));
  const capM = new THREE.Mesh(new THREE.CylinderGeometry(.039, .039, .012, 20), new THREE.MeshStandardMaterial({ color: '#fca311' })); capM.position.y = .07; can.add(H(capM, .55));
  const chute = new THREE.Group();
  const dome = H(new THREE.Mesh(new THREE.SphereGeometry(.3, 24, 10, 0, Math.PI * 2, 0, Math.PI * .42), new THREE.MeshStandardMaterial({ color: '#f26b1d', roughness: .7, side: THREE.DoubleSide })), .45); dome.position.y = .55; chute.add(dome);
  const lp = []; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; lp.push(Math.cos(a) * .27, .52, Math.sin(a) * .27, 0, .08, 0); }
  chute.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(lp, 3)), new THREE.LineBasicMaterial({ color: '#334' })));
  can.add(chute); can.traverse(o => { if (o.isMesh) o.castShadow = true; }); S.add(can);
  const beacon = new THREE.Mesh(new THREE.RingGeometry(.8, 1, 32), new THREE.MeshBasicMaterial({ color: '#fca311', transparent: true, opacity: .9, depthTest: false })); beacon.renderOrder = 10; S.add(beacon);
  const trailPos = new Float32Array(1500 * 3);
  const trail = new THREE.Line(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(trailPos, 3)), new THREE.LineBasicMaterial({ color: '#fca311', transparent: true, opacity: .75 })); trail.frustumCulled = false; S.add(trail);
  const mark = new THREE.Mesh(new THREE.RingGeometry(1.4, 2, 40), new THREE.MeshBasicMaterial({ color: '#fca311', transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -8 })); mark.rotation.x = -Math.PI / 2; S.add(mark);

  const R0 = D.release, rel = new THREE.Vector3(R0.x, R0.y, R0.z);
  const n = new THREE.Vector3(R0.nx, 0, R0.nz), s = new THREE.Vector3(-R0.nz, 0, R0.nx), up = new THREE.Vector3(0, 1, 0);

  // Precomputed fall for a given wind: free fall for 1.1 s, then the parachute; wind from the north-west pushes south-east
  const windDir = new THREE.Vector3(1, 0, 1).normalize();
  function simulate(wind) {
    const dt = 1 / 50, out = []; let y = R0.y, v = 0, t = 0, px = R0.x, pz = R0.z;
    while (y > .6 && t < 60) {
      if (t < 1.1) v += 9.81 * dt; else v += (7.2 - v) * Math.min(1, dt / .45);
      const drift = t < 1.1 ? 0 : wind * Math.min(1, (t - 1.1) / 3);
      px += windDir.x * drift * dt; pz += windDir.z * drift * dt; y -= v * dt; t += dt;
      out.push([t, px, Math.max(.6, y), pz, v]);
    }
    const last = out[out.length - 1], wet = !onLand(last[1], last[3]);
    if (wet) last[2] = -.4;
    return { f: out, T: last[0], wet };
  }
  let F = simulate(1);
  const at = t => { const f = F.f, i = clamp(Math.floor(t * 50), 0, f.length - 1); return f[i]; };

  // Guided cameras: [time, out from the tower, along the face, up, look-out, look-down]
  const KEYS = [[0, 62, 38, -6, 0, 0], [2.6, 9, 6, 2.5, 0, 0], [5.5, -3, .8, 4, 0, 0], [15, -3, .8, 4, 0, 0], [-5, 14, 8, 9, 0, 0], ['end', 34, 12, 62, 0, 0]];
  const lookOff = new THREE.Vector3();
  function offsetAt(t) {
    const T = F.T, ks = KEYS.map(k => [k[0] === 'end' ? T : k[0] < 0 ? T + k[0] : k[0], ...k.slice(1)]);
    let i = 0; while (i < ks.length - 2 && t > ks[i + 1][0]) i++;
    const a = ks[i], b = ks[i + 1], u = smooth(a[0], b[0], t), L = j => lerp(a[j], b[j], u);
    lookOff.set(0, 0, 0).addScaledVector(n, L(4)).addScaledVector(up, -L(5));
    return new THREE.Vector3().addScaledVector(n, L(1)).addScaledVector(s, L(2)).addScaledVector(up, L(3));
  }
  const labels = [['fs', 0, 214, 0], ['av', 140, 30, 330], ['bay', 180, 8, -90], ['stn', STN.x, STN.y + 8, STN.z]].map(([id, x, y, z]) => { const el = document.createElement('span'); el.className = 'bl'; if (id === 'stn') el.classList.add('stn'); $('#tags').appendChild(el); return { id, el, v: new THREE.Vector3(x, y, z) }; });
  const setLabels = () => labels.forEach(l => { l.el.textContent = T(l.id); }); setLabels(); langHooks.push(setLabels);

  // ---- thermal look: swap every surface to a flat colour from its heat value ----
  const thermalMat = new Map(); for (const [m, h] of heat) thermalMat.set(m, new THREE.MeshBasicMaterial({ color: ironbow(h + (rnd() - .5) * .04), fog: false }));
  const thermalCols = new Map(); for (const m of [people, cars, umb]) if (m.instanceColor) { const a = m.instanceColor.clone(); for (let i = 0; i < a.count; i++) { const c = ironbow(heat.get(m) + (rnd() - .5) * .12); a.setXYZ(i, c.r, c.g, c.b); } thermalCols.set(m, [m.instanceColor, a]); thermalMat.get(m).color.set('#ffffff'); }
  const thermalBg = new THREE.Color('#12062a');
  function thermalOn(on) {
    for (const [m, tm] of thermalMat) { if (on) { m.userData.mat = m.material; m.material = tm; } else if (m.userData.mat) m.material = m.userData.mat; }
    for (const [m, [real, th]] of thermalCols) m.instanceColor = on ? th : real;
    sky.visible = !on; S.background = on ? thermalBg : null; S.fog = on ? null : fogKeep; beacon.visible = beacon.visible && !on; trail.visible = !on;
  }
  const fogKeep = S.fog;

  const P = new THREE.Vector3(), cpos = new THREE.Vector3(), look = new THREE.Vector3(), mid = new THREE.Vector3(), tmpO = new THREE.Object3D(), qa = new THREE.Vector3(), qb = new THREE.Vector3();
  // render state for fall time t. establish: wide opening shot. eye: the can's own camera. relay: wide shot of the radio link to the ground station
  function pose(t, establish, eye, relay, showLabels, now) {
    const [, x, y, z, v] = at(t); P.set(x, y, z);
    const flying = t > 0 && t < F.T;
    can.position.copy(P); const sw = flying && t > 2 ? Math.sin(t * 2.1) * .14 : 0; can.rotation.set(sw, t * .6, sw * .6);
    chute.visible = t > 1.1; chute.scale.setScalar(clamp((t - 1.1) / .6, .01, 1));
    if (t >= F.T) { chute.rotation.z = 1.2; chute.position.set(.4, -.25, 0); } else { chute.rotation.z = 0; chute.position.set(0, 0, 0); }
    const nTr = Math.min(1500, Math.floor(t * 50));
    for (let i = 0; i < nTr; i++) { const f = F.f[Math.min(i, F.f.length - 1)]; trailPos[i * 3] = f[1]; trailPos[i * 3 + 1] = f[2] + .2; trailPos[i * 3 + 2] = f[3]; }
    trail.geometry.setDrawRange(0, nTr); trail.geometry.attributes.position.needsUpdate = true;
    wn.offset.set(now * .000012, now * .000008);
    // camera
    cpos.copy(P).add(offsetAt(t)); look.copy(P).add(lookOff);
    if (establish > 0) { const wide = new THREE.Vector3().copy(rel).addScaledVector(n, 430).addScaledVector(s, 280).addScaledVector(up, 70); cpos.lerp(wide, establish); look.lerp(new THREE.Vector3(0, 110, 0), establish); }
    if (relay > 0) {
      mid.copy(P).add(STN).multiplyScalar(.5); const span = P.distanceTo(STN);
      const side = new THREE.Vector3().subVectors(STN, P).setY(0).normalize(); const perp = new THREE.Vector3(side.z, 0, -side.x);
      if (perp.dot(n) < 0) perp.negate();
      cpos.lerp(new THREE.Vector3().copy(mid).addScaledVector(perp, span * .95).addScaledVector(up, span * .32), relay); look.lerp(mid, relay);
    }
    if (eye > 0) { const ep = new THREE.Vector3().copy(P).addScaledVector(up, -.12), el2 = new THREE.Vector3().copy(P).addScaledVector(n, 2.5).addScaledVector(up, -12); cpos.lerp(ep, eye); look.lerp(el2, eye); }
    bayCam.position.copy(cpos); bayCam.lookAt(look);
    bayCam.fov = lerp(50, 64, eye); bayCam.aspect = SW / SH; bayCam.clearViewOffset(); bayCam.updateProjectionMatrix();
    const dist = bayCam.position.distanceTo(P);
    beacon.position.copy(P).addScaledVector(up, .1); beacon.quaternion.copy(bayCam.quaternion); beacon.scale.setScalar(Math.max(.05, dist * (relay > .5 ? .02 : .012))); beacon.visible = dist > 8 && eye < .5;
    mark.position.set(P.x, F.wet ? -.9 : .75, P.z); mark.material.opacity = t >= F.T ? .9 : 0;
    // radio link: an arc of packets from the can to the ground station, one packet a second, shown in the relay shot
    const linkOn = relay > .05 && flying;
    link.visible = packets.visible = linkOn; pulse.visible = relay > .05;
    if (pulse.visible) { const k = (now / 1400) % 1; pulse.scale.setScalar(1 + k * 3); pulse.material.opacity = (1 - k) * .9 * relay; }
    if (linkOn) {
      const ctrl = new THREE.Vector3().copy(P).add(STN).multiplyScalar(.5); ctrl.y = Math.max(P.y, STN.y) + 40;
      const curve = new THREE.QuadraticBezierCurve3(P.clone(), ctrl, STN.clone());
      for (let i = 0; i <= 40; i++) { curve.getPoint(i / 40, qa); linkPos.set([qa.x, qa.y, qa.z], i * 3); }
      link.geometry.attributes.position.needsUpdate = true; link.computeLineDistances(); link.material.opacity = .8 * relay;
      for (let i = 0; i < PK; i++) { const u = ((now / 1000) * .55 + i / PK) % 1; curve.getPoint(u, qb); tmpO.position.copy(qb); tmpO.scale.setScalar(Math.max(1, bayCam.position.distanceTo(qb) * .006)); tmpO.updateMatrix(); packets.setMatrixAt(i, tmpO.matrix); }
      packets.instanceMatrix.needsUpdate = true;
    }
    for (const l of labels) {
      tmpV.copy(l.v).project(bayCam);
      const want = l.id === 'stn' ? relay > .5 : showLabels && relay < .2;
      const ok = want && eye < .2 && tmpV.z < 1 && Math.abs(tmpV.x) < .95 && Math.abs(tmpV.y) < .9 && bayCam.position.distanceTo(l.v) > 80;
      l.el.style.opacity = ok ? 1 : 0;
      if (ok) { l.el.style.left = ((tmpV.x + 1) / 2 * SW) + 'px'; l.el.style.top = ((1 - tmpV.y) / 2 * SH) + 'px'; }
    }
    return { h: Math.max(0, y), v: flying ? v : 0 };
  }
  return { pose, thermalOn, get T() { return F.T; }, get wet() { return F.wet; }, setWind(w) { F = simulate(w); } };
}

// thermal camera: render a tiny 80 x 60 image and show it with hard pixels, like a real low-resolution heat camera
const thermRT = new THREE.WebGLRenderTarget(80, 60, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
thermRT.texture.colorSpace = THREE.SRGBColorSpace;
const quadScene = new THREE.Scene(), quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: thermRT.texture, toneMapped: false })); quadScene.add(quad);
function renderSplit(split) {
  const wide = SW >= SH, w2 = wide ? SW / 2 : SW, h2 = wide ? SH : SH / 2;
  // colour view: left half (or top half on phones)
  renderer.setScissorTest(true);
  bayCam.aspect = w2 / h2; bayCam.updateProjectionMatrix();
  const lx = 0, ly = wide ? 0 : SH / 2;
  renderer.setViewport(lx, ly, w2, h2); renderer.setScissor(lx, ly, w2, h2); renderer.render(bayScene, bayCam);
  // thermal view: right half (or bottom half)
  thermRT.setSize(80, Math.round(80 * h2 / w2));
  bay.thermalOn(true); const tm = renderer.toneMapping; renderer.toneMapping = THREE.NoToneMapping;
  renderer.setRenderTarget(thermRT); renderer.setScissorTest(false); renderer.setViewport(0, 0, thermRT.width, thermRT.height); renderer.clear(); renderer.render(bayScene, bayCam); renderer.setRenderTarget(null);
  bay.thermalOn(false); renderer.toneMapping = tm;
  renderer.setScissorTest(true);
  const rx = wide ? SW / 2 : 0, ry = 0;
  renderer.setViewport(rx, ry, w2, h2); renderer.setScissor(rx, ry, w2, h2); renderer.render(quadScene, quadCam);
  renderer.setScissorTest(false); renderer.setViewport(0, 0, SW, SH);
  bayCam.aspect = SW / SH; bayCam.updateProjectionMatrix();
}

/* ---- Story frame ---- */
const caps = $$('.cap').map(el => ({ el, a: +el.dataset.from, b: +el.dataset.to }));
const dayBg = $('#daybg'), skyC = $('#sky'), starLabel = $('#starlabel'), splitEl = $('#split'), altEl = $('#alt');
const FALL0 = .485, FALL1 = .88;
const rail = $('#rail'), railItems = $$('#rail li');
const CH = [[.09, .40], [.40, .485], [.485, .535], [.535, .66], [.66, .765], [.765, .885], [.885, 1]];
$$('#rail [data-go]').forEach(b => b.addEventListener('click', () => { const span = story.offsetHeight - innerHeight; window.scrollTo({ top: story.offsetTop + span * +b.dataset.go, behavior: RM ? 'auto' : 'smooth' }); }));
function updateRail() {
  rail.style.opacity = smooth(.07, .1, p); rail.classList.toggle('lit', p > .41);
  CH.forEach(([a, b], i) => { const k = clamp((p - a) / (b - a)); railItems[i].querySelector('i').style.setProperty('--k', isDesk() ? (k > 0 ? 1 : 0) : k); railItems[i].classList.toggle('now', p >= a && p < b || (i === CH.length - 1 && p >= 1)); });
}
let auto = null, wind = 1, lastT = performance.now();
function landText() {
  const wet = bay && bay.wet;
  $('#land-h').textContent = T(wet ? 'water_h' : 'land_h');
  $('#land-p').textContent = T(wet ? 'water_p' : 'land_p').replace('{t}', num(Math.round(bay ? bay.T : 24)));
}
langHooks.push(landText);
$$('[data-wind]').forEach(b => b.addEventListener('click', () => { wind = +b.dataset.wind; $$('[data-wind]').forEach(x => x.setAttribute('aria-pressed', x === b)); }));
$('#again').addEventListener('click', () => { if (!bay) return; bay.setWind(wind); auto = { t0: performance.now() }; });

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(.05, (now - lastT) / 1000); lastT = now;
  p = RM ? pTarget : p + (pTarget - p) * (1 - Math.exp(-dt * 7));
  if (Math.abs(pTarget - p) < 1e-4) p = pTarget;
  if (!storyVisible) return;
  for (const c of caps) {
    const fin = c.a === 0 ? 1 : smooth(c.a, c.a + .012, p), fout = 1 - smooth(c.b - .012, c.b, p), o = fin * fout;
    c.el.style.opacity = o; c.el.classList.toggle('on', o > .5);
    if (c.el.id !== 'hero') c.el.style.translate = `0 ${(1 - fin) * 14 - (1 - fout) * 14}px`;
  }
  updateRail();
  const day = smooth(.39, .43, p); dayBg.style.opacity = day;
  const nightA = 1 - smooth(.38, .43, p); skyC.style.opacity = nightA; sky.draw(now / 1000, nightA);
  starLabel.style.opacity = 1 - smooth(.06, .1, p);
  if (!renderer) return;
  if (p < .412 || !bay) {
    glCanvas.style.opacity = 1;
    updateCanScene(p, now / 1000);
    renderer.toneMappingExposure = 1.05; renderer.setClearColor(0x000000, 0); renderer.render(canScene, canCam);
    altEl.style.opacity = 0; splitEl.style.opacity = 0;
    $$('#tags .bl').forEach(e => { e.style.opacity = 0; });
  } else {
    for (const k in tagEls) tagEls[k].style.opacity = 0;
    glCanvas.style.opacity = smooth(.412, .43, p);
    let t, establish = 1 - smooth(.45, FALL0, p), eye = smooth(.66, .675, p) * (1 - smooth(.75, .765, p)), relay = smooth(.765, .785, p) * (1 - smooth(.855, .872, p));
    if (auto) {
      t = (now - auto.t0) / 1000; establish = 0; eye = 0; relay = 0;
      if (t > bay.T + 1.2) { auto = null; landText(); }
      $('#landcap').style.opacity = t < bay.T ? .25 : 1;
    } else { const u = clamp((p - FALL0) / (FALL1 - FALL0)); t = u < .15 ? u / .15 * 2 : 2 + (u - .15) / .85 * (bay.T - 2); }
    const st = bay.pose(Math.min(t, bay.T), establish, eye, relay, p < .53 || p > .87 || !!auto, now);
    renderer.toneMappingExposure = .85;
    if (eye > .55) renderSplit(); else renderer.render(bayScene, bayCam);
    splitEl.style.opacity = eye > .55 ? 1 : 0;
    altEl.style.opacity = (smooth(FALL0 - .01, FALL0 + .005, p) * (1 - smooth(.9, .92, p)) + (auto ? 1 : 0)) * (1 - eye);
    $('#alt-v').textContent = num(Math.round(st.h)); $('#spd-v').textContent = lang === 'ar' ? num(st.v.toFixed(1)) : st.v.toFixed(1);
  }
}
requestAnimationFrame(frame);

/* ---- Snap to the nearest chapter when scrolling stops inside the story ---- */
(function snapping() {
  const STOPS = [0, .145, .255, .385, .455, .505, .585, .71, .81, .95, 1];
  let timer = null, lastY = scrollY, dir = 1, touching = false, target = null, targetAt = 0;
  const go = () => {
    if (touching) return;
    const span = story.offsetHeight - innerHeight, pp = clamp((scrollY - story.offsetTop) / span);
    if (pp <= 0.0005 || pp >= .9995) return;
    let i = 0; while (i < STOPS.length - 2 && pp >= STOPS[i + 1]) i++;
    const a = STOPS[i], b = STOPS[i + 1], f = (pp - a) / (b - a);
    const to = dir > 0 ? (f > .1 ? b : a) : (f < .9 ? a : b);
    if (Math.abs(to - pp) * span < 4) return;
    target = to; targetAt = performance.now(); window.scrollTo({ top: story.offsetTop + span * to, behavior: RM ? 'auto' : 'smooth' });
  };
  addEventListener('scroll', () => {
    const y = scrollY; if (y !== lastY) dir = y > lastY ? 1 : -1; lastY = y;
    if (target !== null && performance.now() - targetAt < 1400) { const span = story.offsetHeight - innerHeight; if (Math.abs(story.offsetTop + span * target - y) < 3) target = null; return; }
    target = null;
    clearTimeout(timer); timer = setTimeout(go, 170);
  }, { passive: true });
  const cancel = () => { target = null; };
  addEventListener('wheel', cancel, { passive: true }); addEventListener('keydown', cancel);
  addEventListener('touchstart', () => { touching = true; target = null; clearTimeout(timer); }, { passive: true });
  addEventListener('touchend', () => { touching = false; clearTimeout(timer); timer = setTimeout(go, 260); }, { passive: true });
})();

/* ====================== Inside our CanSat (interactive) ====================== */
const CHIPS = ['camera', 'computer', 'battery', 'sensors', 'radio', 'antenna', 'parachute', 'shell'];
let selected = null, viewerApi = null;
function renderChips() {
  const box = $('#chips'); box.innerHTML = '';
  for (const k of CHIPS) {
    const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-pressed', selected === k);
    b.innerHTML = `<span class="dot" style="background:${CHIP_COLOR[k]}"></span>${PARTS[lang][k][0]}`;
    b.addEventListener('click', () => { selected = selected === k ? null : k; renderChips(); viewerApi && viewerApi.update(); });
    box.appendChild(b);
  }
  const info = $('#partinfo');
  if (selected) { const [nm, d] = PARTS[lang][selected]; info.innerHTML = `<b>${nm}.</b> ${d}`; } else info.textContent = T('part_hint');
}
langHooks.push(renderChips);
new IntersectionObserver((es, io) => { if (es.some(e => e.isIntersecting)) { io.disconnect(); whenCad(startViewer); } }, { rootMargin: '500px 0px' }).observe($('#viewer'));
function startViewer() {
  const canvas = $('#cancanvas'), box = $('#viewer'); let r;
  try { r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { return; }
  r.setPixelRatio(Math.min(2, devicePixelRatio));
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, 5, 5000);
  cam.position.set(330, 230, 420);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a96a8, .8)); scene.environment = roomEnv(r); scene.environmentIntensity = .7;
  const k = new THREE.DirectionalLight(0xffffff, 2.4); k.position.set(200, 300, 260); k.castShadow = false; scene.add(k);
  const rim = new THREE.DirectionalLight(0x8ecae6, 1.2); rim.position.set(-260, 120, -200); scene.add(rim);
  const c = makeCan(); scene.add(c.root);
  const ctl = new OrbitControls(cam, canvas);
  ctl.enableDamping = true; ctl.enablePan = false; ctl.minDistance = 220; ctl.maxDistance = 760; ctl.target.set(0, 80, 0);
  ctl.autoRotate = !RM; ctl.autoRotateSpeed = 1; ctl.addEventListener('start', () => { ctl.autoRotate = false; });
  if (COARSE) { ctl.touches = { ONE: -1, TWO: THREE.TOUCH.DOLLY_ROTATE }; canvas.style.touchAction = 'pan-y'; }
  const slider = $('#explode'), tag = document.createElement('span'); $('#vtags').appendChild(tag);
  const groupOf = { camera: ['camera'], computer: ['computer'], battery: ['battery'], sensors: ['sensors'], radio: ['radio'], antenna: ['lid'], parachute: ['lid'], shell: ['shell', 'base', 'lid'] };
  function update() {
    const e = +slider.value;
    for (const nm in c.groups) { const o = EXPLODE[nm] || [0, 0, 0]; c.groups[nm].position.set(o[0] * e, o[1] * e, o[2] * e); }
    const lit = selected ? new Set(c.comps[selected] || []) : null;
    c.root.traverse(o => {
      if (!o.material) return;
      let op = o.userData.cad === 'shell' ? 1 - .5 * e : 1;
      if (lit && !lit.has(o)) op = .1;
      eachMat(o, m => { m.opacity = op; m.depthWrite = op > .9; });
    });
  }
  slider.addEventListener('input', update); viewerApi = { update }; update();
  function size() { const b = box.getBoundingClientRect(); r.setSize(b.width, b.height, false); cam.aspect = b.width / b.height; cam.updateProjectionMatrix(); }
  new ResizeObserver(size).observe(box); size();
  let vis = true; new IntersectionObserver(([en]) => { vis = en.isIntersecting; }).observe(box);
  const bx = new THREE.Box3(), v = new THREE.Vector3();
  r.setAnimationLoop(() => {
    if (!vis) return; ctl.update(); r.render(scene, cam);
    if (selected && c.comps[selected]) {
      bx.makeEmpty(); c.comps[selected].forEach(m => bx.expandByObject(m)); bx.getCenter(v); v.y = bx.max.y; v.project(cam);
      const b = box.getBoundingClientRect(); tag.style.display = 'block';
      tag.style.left = ((v.x + 1) / 2 * b.width) + 'px'; tag.style.top = ((1 - v.y) / 2 * b.height - 6) + 'px'; tag.textContent = PARTS[lang][selected][0];
    } else tag.style.display = 'none';
  });
}

/* ====================== Crew carousel ====================== */
(function crew() {
  const list = $('#crewlist');
  const step = dir => { const card = list.querySelector('li'); const w = card ? card.getBoundingClientRect().width + 14 : 300; list.scrollBy({ left: dir * w * (document.documentElement.dir === 'rtl' ? -1 : 1), behavior: RM ? 'auto' : 'smooth' }); };
  $('#crew-prev').addEventListener('click', () => step(-1)); $('#crew-next').addEventListener('click', () => step(1));
})();

/* ====================== Coast map ====================== */
function drawCoast(D) {
  const c = $('#coast'), r = c.getBoundingClientRect(); if (!r.width) return;
  const dpr = Math.min(2, devicePixelRatio || 1); c.width = r.width * dpr; c.height = r.height * dpr;
  const x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); const W = r.width, H = r.height;
  x.fillStyle = '#1b2c50'; x.fillRect(0, 0, W, H);
  const [x0, z0, x1, z1] = [-1000, -800, 1000, 1200]; const k = Math.max(W / (x1 - x0), H / (z1 - z0));
  const Pp = ([px, pz]) => [(px - (x0 + x1) / 2) * k + W / 2, (pz - (z0 + z1) / 2) * k + H / 2];
  x.fillStyle = '#2f4a78'; x.strokeStyle = '#8ecae6'; x.lineWidth = 1;
  for (const poly of D.land) { x.beginPath(); for (const rg of poly) { rg.forEach((pt, i) => (i ? x.lineTo(...Pp(pt)) : x.moveTo(...Pp(pt)))); x.closePath(); } x.fill('evenodd'); x.stroke(); }
  x.fillStyle = 'rgba(252,163,17,.3)'; x.strokeStyle = '#fca311'; x.lineWidth = 2;
  x.beginPath(); D.island.forEach((pt, i) => (i ? x.lineTo(...Pp(pt)) : x.moveTo(...Pp(pt)))); x.closePath(); x.fill(); x.stroke();
  const [fx, fy] = Pp([0, 0]), rtl = lang === 'ar'; x.direction = rtl ? 'rtl' : 'ltr';
  const lx = fx + (rtl ? -22 : 22);
  x.font = '600 15px "Readex Pro",sans-serif'; x.fillStyle = '#fff'; x.fillText(T('island'), lx, fy - 6);
  x.font = '400 13px "Readex Pro",sans-serif'; x.fillStyle = '#b9dcef'; x.fillText(T('built'), lx, fy + 13);
}

applyLang();
