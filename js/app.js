// Fortune Cookie - Main App
const _t = (k, fb) => (window.i18n?.t(k) !== k ? window.i18n.t(k) : fb);

const cookieContainer = document.getElementById('cookie-container');
const cookieEl = document.getElementById('cookie');
const tapHint = document.getElementById('tap-hint');
const fortuneCard = document.getElementById('fortune-card');
let isAnimating = false;

// i18n init
(async function initI18n() {
    try {
        await i18n.loadTranslations(i18n.getCurrentLanguage());
        i18n.updateUI();
        const langToggle = document.getElementById('lang-toggle');
        const langMenu = document.getElementById('lang-menu');
        document.querySelector(`[data-lang="${i18n.getCurrentLanguage()}"]`)?.classList.add('active');
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
    return parseInt(localStorage.getItem('fortune_cookie_count') || '0');
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
    // Use timestamp + random for variety
    const seed = Date.now() ^ (Math.random() * 0xFFFFFF | 0);
    const rand = seededRand(seed);

    // Fortune messages (from i18n)
    const fortuneKeys = [];
    for (let i = 1; i <= 30; i++) {
        fortuneKeys.push(`fortunes.f${i}`);
    }

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

    const idx = Math.floor(rand() * 30);
    const fortune = _t(fortuneKeys[idx], fallbacks[idx]);

    // Lucky number
    const luckyNum = Math.floor(rand() * 99) + 1;

    // Lucky color
    const colorKeys = ['red', 'blue', 'green', 'gold', 'purple', 'pink', 'orange', 'silver'];
    const colorIdx = Math.floor(rand() * colorKeys.length);
    const luckyColor = _t(`colors.${colorKeys[colorIdx]}`, colorKeys[colorIdx]);

    // Mood
    const moodKeys = ['mood1', 'mood2', 'mood3', 'mood4', 'mood5', 'mood6'];
    const moodFallbacks = ['Adventurous', 'Peaceful', 'Energetic', 'Romantic', 'Creative', 'Lucky'];
    const moodIdx = Math.floor(rand() * moodKeys.length);
    const mood = _t(`moods.${moodKeys[moodIdx]}`, moodFallbacks[moodIdx]);

    return { fortune, luckyNum, luckyColor, mood };
}

// Crack cookie
cookieContainer.addEventListener('click', () => {
    if (isAnimating) return;
    isAnimating = true;

    // Sparkle effect
    spawnSparkles(cookieContainer);

    // Crack animation
    cookieEl.classList.add('cracked');
    tapHint.style.display = 'none';

    setTimeout(() => {
        cookieContainer.style.display = 'none';
        showFortune();
    }, 600);

    if (typeof gtag === 'function') gtag('event', 'crack_cookie', { event_category: 'fortune_cookie' });
});

function showFortune() {
    const data = getFortune();

    document.getElementById('fortune-text').textContent = data.fortune;
    document.getElementById('lucky-number').textContent = data.luckyNum;
    document.getElementById('lucky-color').textContent = data.luckyColor;
    document.getElementById('lucky-mood').textContent = data.mood;

    // Fortune rarity system
    const rarityRoll = Math.random();
    let rarity, rarityColor, rarityLabel;
    if (rarityRoll < 0.03) {
        rarity = 'legendary'; rarityColor = '#fbbf24'; rarityLabel = '⭐ Legendary';
    } else if (rarityRoll < 0.12) {
        rarity = 'rare'; rarityColor = '#a78bfa'; rarityLabel = '💎 Rare';
    } else if (rarityRoll < 0.35) {
        rarity = 'uncommon'; rarityColor = '#34d399'; rarityLabel = '✨ Uncommon';
    } else {
        rarity = 'common'; rarityColor = '#9ca3af'; rarityLabel = '🥠 Common';
    }

    let rarityBadge = document.getElementById('rarity-badge');
    if (!rarityBadge) {
        rarityBadge = document.createElement('div');
        rarityBadge.id = 'rarity-badge';
        rarityBadge.style.cssText = 'text-align:center;font-size:13px;font-weight:700;margin-top:8px;padding:4px 12px;border-radius:12px;display:inline-block;';
        const fortuneText = document.getElementById('fortune-text');
        fortuneText.parentElement.insertBefore(rarityBadge, fortuneText.nextSibling);
    }
    rarityBadge.textContent = rarityLabel;
    rarityBadge.style.color = rarityColor;
    rarityBadge.style.background = rarityColor + '18';
    rarityBadge.style.border = `1px solid ${rarityColor}44`;

    // Legendary effect
    if (rarity === 'legendary') {
        spawnSparkles(document.querySelector('.fortune-card') || document.body);
    }

    fortuneCard.classList.remove('hidden');
    incrementCookieCount();
    checkDailyStreak();
    isAnimating = false;
}

// Daily streak tracker
function checkDailyStreak() {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem('fortune_lastDate');
    let streak = parseInt(localStorage.getItem('fortune_streak') || '0');

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
        sparkle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        const angle = (Math.PI * 2 * i) / 8;
        const dist = 40 + Math.random() * 40;
        sparkle.style.left = (cx + Math.cos(angle) * dist) + 'px';
        sparkle.style.top = (cy + Math.sin(angle) * dist) + 'px';
        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 800);
    }
}

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
    const text = _t('share.text', 'My fortune cookie says: "{fortune}" 🥠\nGet your fortune!')
        .replace('{fortune}', fortune);
    const url = 'https://dopabrain.com/fortune-cookie/';

    if (navigator.share) {
        navigator.share({ title: _t('share.title', 'Fortune Cookie'), text, url }).catch(() => {});
    } else {
        navigator.clipboard.writeText(text + '\n' + url)
            .then(() => alert(_t('share.copied', 'Copied to clipboard!')))
            .catch(() => {});
    }
    if (typeof gtag === 'function') gtag('event', 'share', { event_category: 'fortune_cookie' });
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
