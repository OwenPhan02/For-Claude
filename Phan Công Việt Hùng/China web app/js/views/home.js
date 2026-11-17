import { store, rankOf, DAILY_XP_CAP } from '../store.js';
import { esc, hz, zhs } from '../util.js';
import { HSK1 } from '../data/hsk1.js';
import { t } from '../i18n.js';
import { cultureOfDay } from '../data/culture.js';
import { SONGS } from '../data/songs.js';

export function render(el) {
  const st = store.get();
  const cul = cultureOfDay();
  const rank = rankOf(st.xp);
  const l1 = HSK1[0];
  const l1p = st.lessons[l1.id]?.parts || {};
  const steps = [
    { done: st.toneBest > 0 || st.pinyinSeen.length >= 5, text: t('home.step1'), href: '#/pinyin' },
    { done: !!l1p.vocab, text: t('home.step2'), href: `#/lesson/${l1.id}/vocab` },
    { done: store.dailyDone(), text: t('home.step3'), href: '#/daily' },
  ];
  const dailyPct = Math.round((st.dailyXpToday / DAILY_XP_CAP) * 100);

  el.innerHTML = `
    ${t('contentNote') ? `<div class="tipbox" style="margin-bottom:16px">ℹ️ ${esc(t('contentNote'))}</div>` : ''}
    <section class="hero">
      <div class="eyebrow">${t('home.heroEyebrow')}</div>
      <h1>${t('home.heroTitle')}</h1>
      <p>${t('home.heroDesc')}</p>
      <div class="levels">${[1, 2, 3, 4, 5, 6].map(n => `<span>HSK ${n}</span>`).join('')}</div>
      <a class="btn" href="#/test">${t('home.heroBtn')}</a>
      <div class="hero-badge zh">${hz({ s: '级', t: '級' })}?</div>
    </section>

    <section class="card welcome">
      <div>
        <div class="eyebrow">${t('home.free')}</div>
        <h2 style="font-size:clamp(1.4rem,3vw,2rem)">${t('home.welcomeTitle')}</h2>
        <p class="muted">${t('home.welcomeDesc')}</p>
        <div class="row">
          <a class="btn primary" href="#/pinyin">${t('home.startPinyin')}</a>
          <a class="btn" href="#/lesson/${l1.id}">${t('home.openL1')}</a>
        </div>
      </div>
      <div class="welcome-art" aria-hidden="true">${artSvg()}</div>
    </section>

    <section class="card">
      <div class="row spread" style="margin-bottom:10px">
        <div class="row"><b>${t('home.today')}</b><span class="pill red zh" title="${esc(rank.vi)}">${esc(rank.zh)}</span><span class="muted small">${esc(rank.vi)} · ${t('home.totalXp')}: ${st.xp}</span></div>
        <span class="pill gold">🔥 ${t('home.streak', { n: st.streak })}</span>
      </div>
      <div class="row spread small muted"><span>${t('home.dailyBar')}</span><span><b>${st.dailyXpToday}</b> / ${DAILY_XP_CAP} XP</span></div>
      <div class="xpbar" style="margin:4px 0 16px"><span style="width:${dailyPct}%"></span></div>
      <div class="grid grid-3">
        <div class="tile">
          <div class="tile-icon">⚡</div>
          <div class="tile-body"><b>${t('home.dailyTitle')}</b><span class="muted small">${store.dailyDone() ? t('home.dailyDone') : t('home.dailyDesc')}</span></div>
          <a class="btn small primary" href="#/daily">${store.dailyDone() ? t('home.practice') : t('home.doIt')}</a>
        </div>
        <div class="tile">
          <div class="tile-icon zh">${hz({ s: '听', t: '聽' })}</div>
          <div class="tile-body"><b>${t('home.g1Title')}</b><span class="muted small">${t('home.g1Desc')}</span></div>
          <a class="btn small" href="#/game/grab">${t('home.play')}</a>
        </div>
        <div class="tile">
          <div class="tile-icon zh">${hz({ s: '龙', t: '龍' })}</div>
          <div class="tile-body"><b>${t('home.g2Title')}</b><span class="muted small">${t('home.g2Desc')}</span></div>
          <a class="btn small" href="#/game/chain">${t('home.play')}</a>
        </div>
      </div>
      <div class="row" style="justify-content:flex-end;margin-top:10px"><a href="#/progress" class="small">${t('home.badges')}</a></div>
    </section>

    <section class="card">
      <h3>${t('home.steps')}</h3>
      <ul class="steps">
        ${steps.map(s => `<li class="${s.done ? 'done' : ''}"><span class="check">${s.done ? '✓' : ''}</span><a href="${s.href}" style="color:inherit"><span>${esc(s.text)}</span></a></li>`).join('')}
      </ul>
    </section>

    <section class="grid grid-2" style="margin-bottom:20px">
      <a class="card tile" href="#/pinyin" style="margin:0;color:inherit;text-decoration:none">
        <div class="tile-icon" style="font-family:inherit">ā</div>
        <div class="tile-body"><span class="pill jade">${t('home.free')}</span> <span class="pill">${t('home.beginner')}</span>
          <b style="margin-top:4px">${t('home.pinyinTitle')}</b><span class="muted small">${t('home.pinyinDesc')}</span></div>
      </a>
      <a class="card tile" href="#/lesson/${l1.id}" style="margin:0;color:inherit;text-decoration:none">
        <div class="tile-icon">HSK<br>1</div>
        <div class="tile-body"><span class="pill jade">${t('home.free')}</span>
          <b style="margin-top:4px">HSK 1 · Bài 1 – <span class="zh">${esc(hz(l1.title))}</span> (${esc(l1.vi)})</b>
          <span class="muted small">${t('home.l1Desc')}</span></div>
      </a>
    </section>

    <section class="card">
      <div class="row spread"><h3 style="margin:0">🏮 Văn hóa hôm nay</h3><a href="#/culture" class="small">Tất cả bài →</a></div>
      <a href="#/culture/${cul.id}" class="tile" style="margin-top:10px;color:inherit;text-decoration:none">
        <div class="tile-icon" style="font-family:inherit">${cul.icon}</div>
        <div class="tile-body"><b>${esc(cul.title)} · <span class="zh">${esc(zhs(cul.zh))}</span></b><span class="muted small">${esc(cul.summary)}</span></div>
      </a>
    </section>

    <section class="card">
      <div class="row spread"><h3 style="margin:0">🎵 Học qua đồng dao & thơ Đường</h3><a href="#/songs" class="small">Tất cả →</a></div>
      <div class="grid grid-3" style="margin-top:10px">
        ${SONGS.slice(0, 6).map(s => `
          <a class="tile" href="#/songs/${s.id}" style="color:inherit;text-decoration:none">
            <div class="tile-body"><span class="pill ${s.type === 'Thơ Đường' ? 'gold' : 'jade'}">${esc(s.level)}</span>
              <b class="zh" style="font-size:1.3rem;margin-top:4px">${esc(zhs(s.zh))}</b><span class="muted small">${esc(s.py)} · ${esc(s.vi)}</span></div>
            <span class="small" style="color:var(--red)">Học →</span>
          </a>`).join('')}
      </div>
    </section>`;
}

function artSvg() {
  // Tranh minh họa đơn giản: cổng đình, mặt trời, đèn lồng
  return `<svg viewBox="0 0 320 200" width="100%" height="100%" role="img" aria-label="Minh họa">
    <circle cx="250" cy="55" r="28" fill="var(--gold)" opacity=".85"/>
    <path d="M0 170 Q80 120 160 165 T320 150 V200 H0Z" fill="var(--jade)" opacity=".35"/>
    <g fill="var(--red)">
      <rect x="70" y="70" width="180" height="12" rx="4"/>
      <path d="M55 64 Q160 40 265 64 L258 72 Q160 52 62 72Z"/>
      <rect x="95" y="82" width="12" height="90"/><rect x="213" y="82" width="12" height="90"/>
      <rect x="88" y="100" width="144" height="8" rx="3"/>
    </g>
    <g>
      <line x1="40" y1="0" x2="40" y2="30" stroke="var(--muted)"/>
      <ellipse cx="40" cy="48" rx="16" ry="20" fill="var(--red)"/>
      <rect x="34" y="66" width="12" height="5" fill="var(--gold)"/>
      <text x="40" y="54" font-size="16" text-anchor="middle" fill="#ffd166" font-family="Noto Sans SC">福</text>
    </g>
  </svg>`;
}
