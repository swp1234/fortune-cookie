function getActiveLang() {
    if (typeof i18n !== 'undefined' && typeof i18n.getCurrentLanguage === 'function') {
        return i18n.getCurrentLanguage();
    }
    return new URLSearchParams(window.location.search).get('lang') || 'ko';
}

function getShareUrl() {
    return 'https://dopabrain.com/fortune-cookie/?lang=' + encodeURIComponent(getActiveLang()) + '&utm_source=share';
}

function preserveLanguageLinks() {
    var currentLang = getActiveLang();
    var links = document.querySelectorAll('.related-card, a[href^="/soul-age/"], a[href^="/future-self/"], a[href^="/dream-fortune/"], a[href^="/life-in-numbers/"]');
    var base = (window.location.origin && window.location.origin !== 'null') ? window.location.origin : 'https://dopabrain.com';
    links.forEach(function(link) {
        var href = link.getAttribute('href');
        if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('/portal/')) return;
        try {
            var url = new URL(href, base);
            url.searchParams.set('lang', currentLang);
            url.searchParams.set('source', 'fortune_cookie_result');
            link.setAttribute('href', url.pathname + url.search);
        } catch (e) {}
        if (!link.__ctaBound) {
            link.__ctaBound = true;
            link.addEventListener('click', function() {
                if (typeof gtag === 'function') {
                    gtag('event', 'content_cta_click', {
                        cta_surface: 'related_tools',
                        destination: link.getAttribute('href'),
                        source: 'fortune_cookie_result',
                        lang: getActiveLang()
                    });
                }
            });
        }
    });
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preserveLanguageLinks);
} else {
    preserveLanguageLinks();
}

// Fortune Cookie - Main App
const _t = (k, fb) => (window.i18n?.t(k) !== k ? window.i18n.t(k) : fb);

const cookieContainer = document.getElementById('cookie-container');
const cookieEl = document.getElementById('cookie');
const tapHint = document.getElementById('tap-hint');
const fortuneCard = document.getElementById('fortune-card');
let isAnimating = false;
let lastFortuneData = null;

const AMAZON_DOMAINS = {
    ko: 'https://www.amazon.com/dp/{asin}?tag=dopabrain-20',
    en: 'https://www.amazon.com/dp/{asin}?tag=dopabrain-20',
    ja: 'https://www.amazon.co.jp/dp/{asin}?tag=dopabrain-20',
    zh: 'https://www.amazon.com/dp/{asin}?tag=dopabrain-20',
    es: 'https://www.amazon.es/dp/{asin}?tag=dopabrain-20',
    pt: 'https://www.amazon.com.br/dp/{asin}?tag=dopabrain-20',
    hi: 'https://www.amazon.in/dp/{asin}?tag=dopabrain-20',
    ru: 'https://www.amazon.com/dp/{asin}?tag=dopabrain-20',
    id: 'https://www.amazon.sg/dp/{asin}?tag=dopabrain-20',
    tr: 'https://www.amazon.com.tr/dp/{asin}?tag=dopabrain-20',
    de: 'https://www.amazon.de/dp/{asin}?tag=dopabrain-20',
    fr: 'https://www.amazon.fr/dp/{asin}?tag=dopabrain-20'
};

const CURATED_BOOKS = [
    {
        key: 'dailyStoic',
        asin: '0735211736',
        icon: '📜',
        fallbackTitle: 'The Daily Stoic',
        fallbackAuthor: 'Ryan Holiday & Stephen Hanselman',
        fallbackWhy: '366 concise daily reflections to turn short fortune prompts into steady perspective and clarity.'
    },
    {
        key: 'meditations',
        asin: '0812968255',
        icon: '🏛️',
        fallbackTitle: 'Meditations',
        fallbackAuthor: 'Marcus Aurelius',
        fallbackWhy: 'Timeless personal notes on calm focus, gratitude, and composure in uncertain moments.'
    }
];

function getLocalizedBookUrl(asin) {
    const lang = getActiveLang();
    const template = AMAZON_DOMAINS[lang] || AMAZON_DOMAINS.en;
    return template.replace('{asin}', asin);
}

function renderCuratedResources() {
    const card = document.getElementById('curated-resources-card');
    const list = document.getElementById('curated-resources-list');
    if (!card || !list) return;
    list.innerHTML = '';
    const lang = getActiveLang();

    CURATED_BOOKS.forEach((book) => {
        const href = getLocalizedBookUrl(book.asin);
        const item = document.createElement('a');
        item.className = 'curated-item';
        item.href = href;
        item.target = '_blank';
        item.rel = 'noopener noreferrer sponsored';

        const iconSpan = document.createElement('span');
        iconSpan.className = 'curated-icon';
        iconSpan.textContent = book.icon;

        const copyDiv = document.createElement('div');
        copyDiv.className = 'curated-copy';

        const titleDiv = document.createElement('div');
        titleDiv.className = 'curated-item-title';
        titleDiv.textContent = _t(`curated.${book.key}.title`, book.fallbackTitle);

        const authorDiv = document.createElement('div');
        authorDiv.className = 'curated-item-author';
        authorDiv.textContent = _t(`curated.${book.key}.author`, book.fallbackAuthor);

        const whyDiv = document.createElement('div');
        whyDiv.className = 'curated-item-why';
        whyDiv.textContent = _t(`curated.${book.key}.why`, book.fallbackWhy);

        copyDiv.appendChild(titleDiv);
        copyDiv.appendChild(authorDiv);
        copyDiv.appendChild(whyDiv);

        const arrowSpan = document.createElement('span');
        arrowSpan.className = 'curated-arrow';
        arrowSpan.textContent = '→';

        item.appendChild(iconSpan);
        item.appendChild(copyDiv);
        item.appendChild(arrowSpan);

        item.addEventListener('click', () => {
            if (typeof gtag === 'function') {
                gtag('event', 'curated_resource_click', {
                    app_name: 'fortune-cookie',
                    resource_key: book.key,
                    content_locale: lang,
                    cta_surface: 'curated_resources'
                });
                gtag('event', 'content_cta_click', {
                    cta_type: 'curated_book',
                    destination: href,
                    source: 'fortune_cookie'
                });
            }
        });

        list.appendChild(item);
    });

    card.classList.remove('hidden');
}

function showToast(message) {
    let toast = document.getElementById('fortune-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'fortune-toast';
        toast.className = 'fortune-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.display = 'block';
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
        if (toast) toast.style.display = 'none';
    }, 2400);
}

// i18n init
(async function initI18n() {
    try {
        const lang = i18n.getCurrentLanguage();
        document.documentElement.lang = lang;
        await i18n.loadTranslations(lang);
        i18n.updateUI();
        preserveLanguageLinks();
        const langToggle = document.getElementById('lang-toggle');
        const langMenu = document.getElementById('lang-menu');
        document.querySelector(`[data-lang="${lang}"]`)?.classList.add('active');
        langToggle?.addEventListener('click', () => langMenu.classList.toggle('hidden'));
        document.addEventListener('click', e => {
            if (!e.target.closest('.language-selector')) langMenu?.classList.add('hidden');
        });
        document.querySelectorAll('.lang-option').forEach(opt => {
            opt.addEventListener('click', async () => {
                await i18n.setLanguage(opt.dataset.lang);
                document.querySelectorAll('.lang-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                langMenu.classList.add('hidden');
                preserveLanguageLinks();
                if (lastFortuneData && !fortuneCard.classList.contains('hidden')) {
                    applyFortuneDisplay(lastFortuneData);
                    renderCuratedResources();
                }
            });
        });
    } catch (e) { console.warn('i18n init:', e); }
    finally {
        const loader = document.getElementById('app-loader');
        if (loader) { loader.classList.add('hidden'); setTimeout(() => loader.remove(), 300); }
    }
})();

// Update cookie count
function getCookieCount() {
    return parseInt(localStorage.getItem('fortune_cookie_count') || '0', 10);
}
function incrementCookieCount() {
    const c = getCookieCount() + 1;
    localStorage.setItem('fortune_cookie_count', c.toString());
    document.getElementById('cookie-count').textContent = c;
}
document.getElementById('cookie-count').textContent = getCookieCount();

// Seeded random
function seededRand(seed) {
    let s = seed;
    return function() {
        s = (s * 1664525 + 1013904223) | 0;
        return (s >>> 0) / 4294967296;
    };
}

// Get fortune data
function getFortune() {
    const seed = Date.now() ^ (getCookieCount() * 2654435761);
    const rand = seededRand(seed);

    const idx = Math.floor(rand() * 30);
    const fortuneKey = `fortunes.f${idx + 1}`;
    const fallbacks = [
        "A surprise awaits you around the corner.",
        "Your kindness will be rewarded today.",
        "A new opportunity is about to present itself.",
        "Trust your intuition — it knows the way.",
        "Something wonderful is about to happen.",
        "Today's patience will become tomorrow's strength.",
        "An unexpected message will brighten your day.",
        "Your creativity will solve a difficult problem.",
        "A small act of courage will change everything.",
        "The stars are aligned in your favor today.",
        "Someone is thinking of you right now.",
        "A journey of discovery begins with a single step.",
        "Your smile will open doors you didn't know existed.",
        "Good news is on its way to you.",
        "Trust the timing of your life.",
        "A forgotten dream will resurface with new meaning.",
        "Your positive energy attracts positive outcomes.",
        "An old friend will bring unexpected joy.",
        "Today is the perfect day to start something new.",
        "The universe is conspiring in your favor.",
        "A moment of clarity will guide your next decision.",
        "Your generosity will come back tenfold.",
        "A pleasant surprise awaits you this week.",
        "The answer you seek is closer than you think.",
        "Your persistence is about to pay off.",
        "Love is closer than you realize.",
        "A creative breakthrough is on the horizon.",
        "Someone will share good fortune with you soon.",
        "Your inner strength will surprise even yourself.",
        "Today's small victory leads to tomorrow's big success."
    ];

    const luckyNum = Math.floor(rand() * 99) + 1;
    const colorKeys = ['red', 'blue', 'green', 'gold', 'purple', 'pink', 'orange', 'silver'];
    const colorKey = colorKeys[Math.floor(rand() * colorKeys.length)];

    const moodKeys = ['mood1', 'mood2', 'mood3', 'mood4', 'mood5', 'mood6'];
    const moodFallbacks = ['Adventurous', 'Peaceful', 'Energetic', 'Romantic', 'Creative', 'Lucky'];
    const moodIdx = Math.floor(rand() * moodKeys.length);

    // Deterministic rarity roll from seeded generator
    const rarityRoll = rand();
    let rarity = 'common';
    if (rarityRoll < 0.04) rarity = 'legendary';
    else if (rarityRoll < 0.14) rarity = 'rare';
    else if (rarityRoll < 0.38) rarity = 'uncommon';

    return {
        fortuneKey,
        fortuneFallback: fallbacks[idx],
        luckyNum,
        colorKey,
        moodKey: moodKeys[moodIdx],
        moodFallback: moodFallbacks[moodIdx],
        rarity
    };
}

function applyFortuneDisplay(data) {
    const fortuneText = _t(data.fortuneKey, data.fortuneFallback);
    const luckyColor = _t(`colors.${data.colorKey}`, data.colorKey);
    const mood = _t(`moods.${data.moodKey}`, data.moodFallback);

    document.getElementById('fortune-text').textContent = fortuneText;
    document.getElementById('lucky-number').textContent = data.luckyNum;
    document.getElementById('lucky-color').textContent = luckyColor;
    document.getElementById('lucky-mood').textContent = mood;

    const rarityMeta = {
        legendary: { color: '#fbbf24', label: _t('rarity.legendary', '⭐ Legendary') },
        rare: { color: '#a78bfa', label: _t('rarity.rare', '💎 Rare') },
        uncommon: { color: '#34d399', label: _t('rarity.uncommon', '✨ Uncommon') },
        common: { color: '#9ca3af', label: _t('rarity.common', '🥠 Common') }
    }[data.rarity] || { color: '#9ca3af', label: _t('rarity.common', '🥠 Common') };

    let rarityBadge = document.getElementById('rarity-badge');
    if (!rarityBadge) {
        rarityBadge = document.createElement('div');
        rarityBadge.id = 'rarity-badge';
        rarityBadge.style.cssText = 'text-align:center;font-size:13px;font-weight:700;margin-top:8px;padding:4px 12px;border-radius:12px;display:inline-block;';
        const fortuneTextEl = document.getElementById('fortune-text');
        fortuneTextEl.parentElement.insertBefore(rarityBadge, fortuneTextEl.nextSibling);
    }
    rarityBadge.textContent = rarityMeta.label;
    rarityBadge.style.color = rarityMeta.color;
    rarityBadge.style.background = rarityMeta.color + '18';
    rarityBadge.style.border = `1px solid ${rarityMeta.color}44`;

    return { fortuneText, luckyColor, mood, rarityLabel: rarityMeta.label };
}

// Crack cookie
cookieContainer.addEventListener('click', () => {
    if (isAnimating) return;
    isAnimating = true;

    if (typeof gtag === 'function') {
        gtag('event', 'crack_cookie', { event_category: 'fortune_cookie' });
        gtag('event', 'test_start', { event_category: 'fortune_cookie', app_name: 'fortune-cookie' });
    }

    spawnSparkles(cookieContainer);
    cookieEl.classList.add('cracked');
    tapHint.style.display = 'none';

    setTimeout(() => {
        cookieContainer.style.display = 'none';
        showFortune();
    }, 600);
});

function showFortune() {
    const data = getFortune();
    lastFortuneData = data;
    applyFortuneDisplay(data);

    if (data.rarity === 'legendary') {
        spawnSparkles(document.querySelector('.fortune-card') || document.body);
    }

    fortuneCard.classList.remove('hidden');
    renderCuratedResources();
    preserveLanguageLinks();
    incrementCookieCount();
    checkFortuneStreak();
    isAnimating = false;

    if (typeof gtag === 'function') {
        gtag('event', 'test_complete', {
            event_category: 'fortune_cookie',
            app_name: 'fortune-cookie',
            result_type: data.rarity
        });
    }
}

// Fortune streak tracker
function checkFortuneStreak() {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem('fortune_lastDate');
    let streak = parseInt(localStorage.getItem('fortune_streak') || '0', 10);

    if (lastDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        streak = (lastDate === yesterday) ? streak + 1 : 1;
        localStorage.setItem('fortune_streak', streak.toString());
        localStorage.setItem('fortune_lastDate', today);
    }

    let streakEl = document.getElementById('daily-streak');
    if (!streakEl) {
        streakEl = document.createElement('div');
        streakEl.id = 'daily-streak';
        streakEl.style.cssText = 'text-align:center;font-size:14px;color:var(--text-secondary,#aaa);margin-top:12px;';
        const cookieCount = document.getElementById('cookie-count');
        if (cookieCount && cookieCount.parentElement) {
            cookieCount.parentElement.parentElement.appendChild(streakEl);
        }
    }
    if (streak >= 2) {
        const streakEmoji = streak >= 7 ? '🔥' : streak >= 3 ? '⭐' : '✨';
        streakEl.textContent = `${streakEmoji} ${streak} ${_t('streak.days', 'day streak')}`;
    }
}

function spawnSparkles(container) {
    const rect = container.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const emojis = ['✨', '⭐', '💫', '🌟', '🥠'];

    for (let i = 0; i < 8; i++) {
        const sparkle = document.createElement('span');
        sparkle.className = 'sparkle';
        sparkle.textContent = emojis[i % emojis.length];
        const angle = (Math.PI * 2 * i) / 8;
        const dist = 48 + (i % 3) * 14;
        sparkle.style.left = (cx + Math.cos(angle) * dist) + 'px';
        sparkle.style.top = (cy + Math.sin(angle) * dist) + 'px';
        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 800);
    }
}

function wrapCanvasText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let current = '';
    for (const word of words) {
        const test = current ? current + ' ' + word : word;
        if (ctx.measureText(test).width > maxWidth && current) {
            lines.push(current);
            current = word;
        } else {
            current = test;
        }
    }
    if (current) lines.push(current);
    return lines;
}

function generateStoryCard() {
    if (!lastFortuneData) return;
    const display = applyFortuneDisplay(lastFortuneData);
    let canvas = document.getElementById('share-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'share-canvas';
        canvas.style.display = 'none';
        document.body.appendChild(canvas);
    }
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
    grad.addColorStop(0, '#0a0a1a');
    grad.addColorStop(0.5, '#1c1528');
    grad.addColorStop(1, '#26180a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Subtle warm glow behind cookie card
    const glow = ctx.createRadialGradient(540, 740, 40, 540, 740, 520);
    glow.addColorStop(0, 'rgba(245, 158, 11, 0.24)');
    glow.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 180, 1080, 1100);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 34px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('DOPABRAIN · ' + _t('app.title', 'Fortune Cookie').toUpperCase(), 540, 180);

    ctx.font = '150px sans-serif';
    ctx.fillText('🥠', 540, 380);

    // Paper card
    ctx.fillStyle = 'rgba(255, 251, 235, 0.08)';
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(100, 470, 880, 620, 36);
    else ctx.rect(100, 470, 880, 620);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(display.rarityLabel, 540, 550);

    ctx.fillStyle = '#fffbeb';
    ctx.font = 'bold 46px -apple-system, BlinkMacSystemFont, sans-serif';
    const lines = wrapCanvasText(ctx, `“${display.fortuneText}”`, 760).slice(0, 6);
    const startY = 660;
    lines.forEach((line, idx) => {
        ctx.fillText(line, 540, startY + idx * 66);
    });

    // Lucky trio boxes
    const items = [
        { label: _t('fortune.luckyNumber', 'Lucky Number'), value: String(lastFortuneData.luckyNum) },
        { label: _t('fortune.luckyColor', 'Lucky Color'), value: display.luckyColor },
        { label: _t('fortune.mood', "Today's Mood"), value: display.mood }
    ];
    items.forEach((item, idx) => {
        const bx = 100 + idx * 300;
        const by = 1170;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(bx, by, 280, 220, 24);
        else ctx.rect(bx, by, 280, 220);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#d1d5db';
        ctx.font = '600 24px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillText(item.label, bx + 140, by + 76);

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 42px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillText(item.value, bx + 140, by + 150);
    });

    ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
    ctx.font = '600 30px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(_t('fortune.cardFooter', 'Crack your daily fortune at dopabrain.com/fortune-cookie'), 540, 1740);

    try {
        const a = document.createElement('a');
        a.download = `fortune-cookie-${lastFortuneData.rarity}.png`;
        a.href = canvas.toDataURL('image/png');
        document.body.appendChild(a);
        a.click();
        a.remove();
        showToast(_t('fortune.saved', 'Story card saved!'));
    } catch (e) {}

    if (typeof gtag === 'function') {
        gtag('event', 'save_image', {
            event_category: 'fortune_cookie',
            app_name: 'fortune-cookie',
            result_type: lastFortuneData.rarity,
            save_surface: 'result_story_1080x1920'
        });
    }
}

document.getElementById('btn-save-card')?.addEventListener('click', generateStoryCard);

// New cookie
document.getElementById('btn-new').addEventListener('click', () => {
    fortuneCard.classList.add('hidden');
    cookieContainer.style.display = '';
    cookieEl.classList.remove('cracked');
    tapHint.style.display = '';

    if (typeof gtag === 'function') gtag('event', 'new_cookie', { event_category: 'fortune_cookie' });
});

// Share
document.getElementById('btn-share').addEventListener('click', () => {
    const fortune = document.getElementById('fortune-text').textContent;
    const text = _t('share.text', 'My fortune cookie says: “{fortune}” 🥠\nGet your fortune!')
        .replace('{fortune}', fortune);
    const url = getShareUrl();

    if (navigator.share) {
        navigator.share({ title: _t('share.title', 'Fortune Cookie'), text, url }).catch(() => {});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text + '\n' + url)
            .then(() => showToast(_t('share.copied', 'Copied to clipboard!')))
            .catch(() => {});
    }
    if (typeof gtag === 'function') {
        gtag('event', 'share', {
            event_category: 'fortune_cookie',
            method: navigator.share ? 'native' : 'copy',
            content_type: 'fortune_result'
        });
    }
});

// Theme
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    themeToggle.textContent = saved === 'light' ? '🌙' : '☀️';
    themeToggle.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme');
        const next = cur === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        themeToggle.textContent = next === 'light' ? '🌙' : '☀️';
    });
}
