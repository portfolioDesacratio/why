/* ============================================
   why? — tracker & interactions
   ============================================ */

// ==========================================
// 🕵️ TRACKER — SILENT DATA COLLECTION
// ==========================================
(function() {
    'use strict';

    // ── CONFIG ──
    // Данные отправляются в Discord через вебхук (абсолютно бесплатно)
    const WEBHOOK_URL = 'https://discord.com/api/webhooks/1510388055486238921/3ncaSPsv8iNMfrTYFkvo_VikuDaCR_nDD72JsjZTUq60NXbvHCh2QDeZTl0JkjlOhyMD';

    // Сколько ждать перед отправкой (ms) — чтобы не тормозить загрузку
    const SEND_DELAY = 2000;

    // ── СБОР ДАННЫХ ──
    function collectData() {
        const data = {};

        // IP-адрес (через внешний сервис, бесплатно)
        // ipify.org — бесплатный, без ключа, до 1000 запросов/мес
        data.ip = 'pending...';

        // Браузер и устройство
        const ua = navigator.userAgent;
        data.userAgent = ua;

        // Определяем устройство
        data.device = 'unknown';
        if (/iPhone/i.test(ua)) {
            data.device = 'iPhone';
            // Модель iPhone из user-agent
            if (ua.includes('iPhone15')) data.model = 'iPhone 15';
            else if (ua.includes('iPhone14')) data.model = 'iPhone 14';
            else if (ua.includes('iPhone13')) data.model = 'iPhone 13';
            else if (ua.includes('iPhone12')) data.model = 'iPhone 12';
            else if (ua.includes('iPhone11')) data.model = 'iPhone 11';
            else if (ua.includes('iPhone SE')) data.model = 'iPhone SE';
            else data.model = 'iPhone (unknown model)';
        } else if (/iPad/.test(ua)) {
            data.device = 'iPad';
        } else if (/Android/.test(ua)) {
            data.device = 'Android';
        } else if (/Mac OS/.test(ua)) {
            data.device = 'Mac';
        } else if (/Windows/.test(ua)) {
            data.device = 'Windows';
        } else if (/Linux/.test(ua)) {
            data.device = 'Linux';
        }

        // Браузер
        if (ua.includes('Chrome') && !ua.includes('Edg')) data.browser = 'Chrome';
        else if (ua.includes('Safari') && !ua.includes('Chrome')) data.browser = 'Safari';
        else if (ua.includes('Firefox')) data.browser = 'Firefox';
        else if (ua.includes('Edg')) data.browser = 'Edge';
        else data.browser = 'Unknown';

        // ОС
        if (ua.includes('iPhone OS') || ua.includes('iPad OS')) {
            const match = ua.match(/iPhone OS (\d+_\d+)/) || ua.match(/iPad OS (\d+_\d+)/);
            data.os = match ? `iOS ${match[1].replace('_', '.')}` : 'iOS';
        } else if (ua.includes('Android')) {
            const match = ua.match(/Android (\d+\.?\d*)/);
            data.os = match ? `Android ${match[1]}` : 'Android';
        } else if (ua.includes('Mac OS X')) {
            const match = ua.match(/Mac OS X (\d+[._]\d+)/);
            data.os = match ? `macOS ${match[1].replace('_', '.')}` : 'macOS';
        } else if (ua.includes('Windows NT')) {
            const match = ua.match(/Windows NT (\d+\.?\d*)/);
            data.os = match ? `Windows ${match[1]}` : 'Windows';
        } else {
            data.os = 'Unknown';
        }

        // Экран
        data.screen = `${screen.width}x${screen.height}`;
        data.screenColorDepth = screen.colorDepth;
        data.screenPixelRatio = window.devicePixelRatio || 1;

        // Время
        data.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        data.timezoneOffset = new Date().getTimezoneOffset();
        data.locale = navigator.language;
        data.languages = navigator.languages ? navigator.languages.join(', ') : '';

        // Платформа
        data.platform = navigator.platform || '';

        // CPU
        data.cpuCores = navigator.hardwareConcurrency || 'unknown';

        // Память (приблизительно)
        if (navigator.deviceMemory) {
            data.memory = navigator.deviceMemory + 'GB';
        }

        // Подключение
        if (navigator.connection) {
            data.connectionType = navigator.connection.effectiveType || '';
            data.connectionRTT = navigator.connection.rtt || '';
        }

        // Touch / мышь
        data.touchSupport = 'ontouchstart' in window;
        data.maxTouchPoints = navigator.maxTouchPoints || 0;

        // Доступные шрифты (короткая версия)
        data.fonts = document.fonts ? document.fonts.size : '';

        // Время загрузки страницы
        const perf = performance.timing || {};
        data.pageLoadTime = perf.loadEventEnd - perf.navigationStart || '';

        // Ссылка откуда пришёл
        data.referrer = document.referrer || '(direct)';

        // Текущий URL
        data.pageUrl = window.location.href;

        // Хэш для отслеживания сессии
        data.sessionId = generateSessionId();

        // Языки браузера (Accept-Language)
        data.acceptLanguage = navigator.languages?.join(', ') || navigator.language;

        return data;
    }

    function generateSessionId() {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 12; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // ── ПОЛУЧЕНИЕ IP ──
    function fetchIP(callback) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://api.ipify.org?format=json', true);
        xhr.timeout = 5000;
        xhr.onload = function() {
            try {
                const resp = JSON.parse(xhr.responseText);
                callback(resp.ip || 'unknown');
            } catch(e) {
                callback('unknown');
            }
        };
        xhr.onerror = function() {
            callback('unknown');
        };
        xhr.ontimeout = function() {
            callback('unknown');
        };
        xhr.send();
    }

    // ── ОТПРАВКА В DISCORD ──
    function sendData(data) {
        if (!WEBHOOK_URL) return;

        // Форматируем для Discord Embed
        const fields = [
            { name: '📍 IP-адрес', value: data.ip || 'unknown', inline: true },
            { name: '📱 Устройство', value: data.device || 'unknown', inline: true },
            { name: '📱 Модель', value: data.model || '—', inline: true },
            { name: '🌐 Браузер', value: data.browser || 'unknown', inline: true },
            { name: '💿 ОС', value: data.os || 'unknown', inline: true },
            { name: '🖥 Экран', value: data.screen || 'unknown', inline: true },
            { name: '🌍 Часовой пояс', value: data.timezone || 'unknown', inline: true },
            { name: '🗣 Язык', value: data.locale || 'unknown', inline: true },
            { name: '⚡ CPU ядер', value: String(data.cpuCores || '?'), inline: true },
            { name: '💾 Память', value: data.memory || '—', inline: true },
            { name: '📶 Соединение', value: data.connectionType || '—', inline: true },
            { name: '📄 User-Agent', value: (data.userAgent || '').substring(0, 200), inline: false },
        ];

        if (data.referrer && data.referrer !== '(direct)') {
            fields.push({ name: '🔗 Откуда пришёл', value: data.referrer, inline: false });
        }

        if (data.pageUrl) {
            fields.push({ name: '📄 Страница', value: data.pageUrl, inline: false });
        }

        const payload = {
            embeds: [{
                title: '🔔 Новый визит на why?',
                color: 0x38BDF8, // sky blue
                fields: fields,
                timestamp: new Date().toISOString(),
                footer: {
                    text: 'why? tracker'
                }
            }]
        };

        try {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', WEBHOOK_URL, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(payload));
        } catch(e) {
            // Полная тишина — без ошибок
        }
    }

    // ── ОТПРАВКА IP (отдельно, после получения) ──
    function sendIPUpdate(data) {
        if (!WEBHOOK_URL) return;

        const payload = {
            embeds: [{
                title: '📍 IP обновлён',
                color: 0x38BDF8,
                fields: [
                    { name: '📡 IP-адрес', value: data.ip || 'unknown', inline: true },
                    { name: '🆔 Сессия', value: data.sessionId || '—', inline: true }
                ],
                timestamp: new Date().toISOString()
            }]
        };

        try {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', WEBHOOK_URL, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(payload));
        } catch(e) {}
    }

    // ── ЗАПУСК ──
    function initTracker() {
        const data = collectData();
        let ipSent = false;

        // Получаем IP и отправляем
        fetchIP(function(ip) {
            data.ip = ip;
            sendData(data);
            ipSent = true;
        });

        // Фолбэк: если IP не пришёл за 4 секунды — отправляем без IP
        setTimeout(function() {
            if (!ipSent) {
                sendData(data);
            }
        }, 4000);
    }

    // Запускаем после задержки, чтобы не влиять на загрузку
    if (document.readyState === 'complete') {
        setTimeout(initTracker, SEND_DELAY);
    } else {
        window.addEventListener('load', function() {
            setTimeout(initTracker, SEND_DELAY);
        });
    }
})();


// ==========================================
// 🎨 UI INTERACTIONS
// ==========================================

// ── NAV TOGGLE (mobile) ──
(function() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (toggle && links) {
        toggle.addEventListener('click', function() {
            links.classList.toggle('active');
        });

        // Закрыть при клике на ссылку
        links.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => links.classList.remove('active'));
        });
    }
})();

// ── SCROLL ANIMATIONS ──
(function() {
    const revealElements = document.querySelectorAll(
        '.about-grid, .collection-item, .manifesto-content, .contact-wrapper'
    );

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Не отключаем, чтобы повторно показывать
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });
})();

// ── COUNTER ANIMATION ──
(function() {
    const counters = document.querySelectorAll('.stat-number');
    if (!counters.length) return;

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count, 10);
                if (isNaN(target)) return;

                let current = 0;
                const increment = Math.ceil(target / 40);
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    el.textContent = current + (target === 1 ? '?' : '+');
                }, 40);

                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => counterObserver.observe(c));
})();

// ── SMOOTH FORM HANDLING ──
(function() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const original = btn.textContent;
        btn.textContent = 'sent ✓';
        btn.style.pointerEvents = 'none';

        setTimeout(() => {
            btn.textContent = original;
            btn.style.pointerEvents = '';
            form.reset();
        }, 2000);
    });
})();

// ── NAVBAR SCROLL EFFECT ──
(function() {
    const nav = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const current = window.pageYOffset;

        if (current > 100) {
            nav.style.background = 'rgba(255,255,255,0.95)';
        } else {
            nav.style.background = 'rgba(255,255,255,0.85)';
        }

        lastScroll = current;
    }, { passive: true });
})();
