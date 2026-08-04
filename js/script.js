/* =========================================================
   Subhash — Portfolio interactions
   ========================================================= */
(function () {
    'use strict';

    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.addEventListener('DOMContentLoaded', () => {
        initNav();
        initScrollUI();
        initReveal();
        initCounters();
        initReel();
        initCaseModal();
        initTilt();
        initForms();
        initMisc();
    });

    /* ---------------- Navigation ---------------- */
    function initNav() {
        const nav = $('#nav');
        const toggle = $('#nav-toggle');
        const links = $('#nav-links');
        if (!nav || !toggle || !links) return;

        const closeMenu = () => {
            links.classList.remove('open');
            toggle.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Open menu');
            document.body.style.overflow = '';
        };

        toggle.addEventListener('click', () => {
            const open = links.classList.toggle('open');
            toggle.classList.toggle('open', open);
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
            document.body.style.overflow = open ? 'hidden' : '';
        });

        links.addEventListener('click', (e) => {
            if (e.target.closest('a')) closeMenu();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMenu();
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 860) closeMenu();
        });

        // Scroll spy
        const sections = $$('main section[id]');
        const navLinks = $$('.nav-link');
        if (!sections.length) return;

        const spy = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const id = entry.target.id;
                navLinks.forEach((link) => {
                    link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });

        sections.forEach((s) => spy.observe(s));
    }

    /* ---------------- Scroll progress, nav bg, back to top ---------------- */
    function initScrollUI() {
        const nav = $('#nav');
        const bar = $('#progress-bar');
        const toTop = $('#back-to-top');
        let ticking = false;

        const update = () => {
            const y = window.scrollY;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            if (nav) nav.classList.toggle('scrolled', y > 24);
            if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
            if (toTop) toTop.classList.toggle('show', y > 600);
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(update);
            }
        }, { passive: true });

        update();

        if (toTop) {
            toTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
            });
        }
    }

    /* ---------------- Reveal on scroll ---------------- */
    function initReveal() {
        const items = $$('[data-reveal]');
        if (!items.length) return;

        if (reduceMotion || !('IntersectionObserver' in window)) {
            items.forEach((el) => el.classList.add('is-visible'));
            return;
        }

        const io = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry, i) => {
                if (!entry.isIntersecting) return;
                setTimeout(() => entry.target.classList.add('is-visible'), i * 70);
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

        items.forEach((el) => io.observe(el));

        // Fail-safe: anything already on screen (e.g. landing directly on #work)
        // is revealed immediately, and nothing stays hidden for more than 3s.
        const revealInView = () => {
            items.forEach((el) => {
                const r = el.getBoundingClientRect();
                if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-visible');
            });
        };
        window.addEventListener('load', revealInView);
        setTimeout(revealInView, 1200);
    }

    /* ---------------- Animated stat counters ---------------- */
    function initCounters() {
        const counters = $$('[data-count]');
        if (!counters.length) return;

        const run = (el) => {
            const target = parseFloat(el.dataset.count);
            const suffix = el.dataset.suffix || '';
            if (reduceMotion) { el.textContent = target + suffix; return; }

            const duration = 1400;
            const start = performance.now();
            const step = (now) => {
                const p = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.round(target * eased) + suffix;
                if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        };

        if (!('IntersectionObserver' in window)) { counters.forEach(run); return; }

        const io = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                run(entry.target);
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.6 });

        counters.forEach((el) => io.observe(el));
    }

    /* ---------------- Device frame builder (shared) ---------------- */
    function makeFrame(d) {
        const wrap = document.createElement('div');
        wrap.className = 'frame frame-' + d.frame;
        wrap.style.setProperty('--vr', d.vr);

        if (d.frame === 'browser') {
            wrap.innerHTML =
                '<div class="frame-browser" style="--vr:' + d.vr + '">' +
                    '<div class="frame-bar">' +
                        '<span class="dot"></span><span class="dot"></span><span class="dot"></span>' +
                        '<span class="frame-url"></span>' +
                    '</div>' +
                    '<div class="frame-screen"></div>' +
                '</div>';
            wrap.className = 'frame';
            wrap.querySelector('.frame-url').textContent =
                d.url.replace(/^https?:\/\//, '').split('/')[0];
        } else {
            wrap.innerHTML =
                '<div class="phone-device" style="--vr:' + d.vr + '">' +
                    '<span class="phone-notch"></span><div class="frame-screen"></div>' +
                '</div>';
        }

        const video = document.createElement('video');
        video.src = d.video;
        video.loop = true; video.muted = true; video.autoplay = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('muted', '');
        wrap.querySelector('.frame-screen').appendChild(video);
        const play = video.play();
        if (play && play.catch) play.catch(() => {});
        return wrap;
    }

    /* ---------------- Showreel: sticky stage + index list ---------------- */
    function initReel() {
        const list = $('#reel-list');
        const stageFrame = $('#stage-frame');
        if (!list || !stageFrame) return;

        const items = $$('.reel-item', list);
        const el = {
            index: $('#stage-index'), cat: $('#stage-cat'), title: $('#stage-title'),
            sub: $('#stage-sub'), desc: $('#stage-desc'), tags: $('#stage-tags'),
            live: $('#stage-live'), caseBtn: $('#stage-case')
        };
        const info = $('.stage-info');
        // the stage exists at every breakpoint (compact + pinned on small screens)
        const stageOn = () => stageFrame.offsetParent !== null;

        let active = null;
        let hoverLock = 0;

        const dataOf = (item) => {
            try { return JSON.parse(item.querySelector('.card-data').textContent); }
            catch (e) { return null; }
        };

        const buildFrame = makeFrame;

        const swapStage = (d) => {
            const old = $$('.frame', stageFrame);
            const next = buildFrame(d);
            stageFrame.appendChild(next);
            requestAnimationFrame(() => next.classList.add('is-in'));
            old.forEach((f) => {
                f.classList.remove('is-in');
                f.classList.add('is-out');
                const v = f.querySelector('video');
                if (v) v.pause();
                setTimeout(() => f.remove(), 750);
            });

            el.index.textContent = d.index;
            el.cat.textContent = d.cat;
            el.title.textContent = d.title;
            el.sub.textContent = d.sub;
            el.desc.textContent = d.desc;
            el.tags.innerHTML = '';
            (d.tags || []).forEach((t) => {
                const span = document.createElement('span');
                span.textContent = t;
                el.tags.appendChild(span);
            });
            el.live.href = d.url;
            if (el.caseBtn) {
                el.caseBtn.href = d.doc;
                if (/^https?:/.test(d.doc)) { el.caseBtn.target = '_blank'; el.caseBtn.rel = 'noopener'; }
                else { el.caseBtn.removeAttribute('target'); el.caseBtn.removeAttribute('rel'); }
            }
            el.live.childNodes[0].nodeValue = d.cta === 'View build' ? 'View build ' : 'Live demo ';

            if (info && !reduceMotion) {
                info.classList.remove('swap');
                void info.offsetWidth;
                info.classList.add('swap');
            }
        };

        const setActive = (item) => {
            if (!item || item === active) return;
            const d = dataOf(item);
            if (!d) return;
            items.forEach((i) => i.classList.toggle('is-active', i === item));
            active = item;
            if (stageOn()) swapStage(d);
        };

        // hover preview (desktop only)
        items.forEach((item) => {
            item.addEventListener('pointerenter', (e) => {
                if (e.pointerType === 'touch' || !stageOn()) return;
                hoverLock = Date.now();
                setActive(item);
            });
            item.addEventListener('click', (e) => {
                const row = e.target.closest('.reel-row');
                if (!row) return;
                // the href is the no-JS / crawler path to the case-study document;
                // with JS we open the richer lightbox instead
                if (!e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
                    e.preventDefault();
                    setActive(item);
                    if (typeof window.__openCase === 'function') window.__openCase(item);
                }
            });
        });

        if (el.caseBtn) {
            el.caseBtn.addEventListener('click', (e) => {
                if (!active) return;
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                e.preventDefault();
                if (typeof window.__openCase === 'function') window.__openCase(active);
            });
        }

        // scroll-sync: whichever row sits mid-track drives the stage. The index is its
        // own scroll container on wide screens, so the observer root has to follow suit.
        let spy = null;
        const scrolls = () => list.scrollHeight - list.clientHeight > 12;

        const buildSpy = () => {
            if (!('IntersectionObserver' in window)) return;
            if (spy) spy.disconnect();
            spy = new IntersectionObserver((entries) => {
                if (!stageOn()) return;
                if (Date.now() - hoverLock < 1200) return;   // don't fight the pointer
                const hit = entries
                    .filter((en) => en.isIntersecting && !en.target.classList.contains('is-hidden'))
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
                if (hit) setActive(hit.target);
            }, {
                root: scrolls() ? list : null,
                rootMargin: '-40% 0px -40% 0px',
                threshold: [0, 0.5, 1]
            });
            items.forEach((i) => spy.observe(i));
        };
        buildSpy();

        // pointer-driven 3D tilt on the stage
        const shell = $('.stage-shell');
        const glow = $('.stage-glow');
        if (shell && !reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            shell.addEventListener('pointermove', (e) => {
                const r = shell.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width - 0.5;
                const py = (e.clientY - r.top) / r.height - 0.5;
                stageFrame.style.setProperty('--sry', (px * 16).toFixed(2) + 'deg');
                stageFrame.style.setProperty('--srx', (-py * 11).toFixed(2) + 'deg');
                if (glow) {
                    glow.style.setProperty('--gx', (px * 46).toFixed(1) + 'px');
                    glow.style.setProperty('--gy', (py * 30).toFixed(1) + 'px');
                }
            });
            shell.addEventListener('pointerleave', () => {
                stageFrame.style.setProperty('--sry', '0deg');
                stageFrame.style.setProperty('--srx', '0deg');
                if (glow) { glow.style.setProperty('--gx', '0px'); glow.style.setProperty('--gy', '0px'); }
            });
        }

        // First preview is deferred until the work section is close to the viewport,
        // so a visitor who never scrolls never downloads a video.
        const primeStage = () => setActive(items[0]);
        const section = document.getElementById('work');
        if (section && 'IntersectionObserver' in window) {
            const warm = new IntersectionObserver((entries, obs) => {
                if (entries.some((en) => en.isIntersecting)) {
                    obs.disconnect();
                    primeStage();
                }
            }, { rootMargin: '600px 0px' });
            warm.observe(section);
        } else {
            primeStage();
        }
        let resizeTimer = null;
        window.addEventListener('resize', () => {
            if (stageOn() && active && !$('.frame', stageFrame)) swapStage(dataOf(active));
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(buildSpy, 220);
        });

        document.addEventListener('visibilitychange', () => {
            $$('video', stageFrame).forEach((v) => {
                if (document.hidden) { v.pause(); return; }
                const play = v.play();
                if (play && play.catch) play.catch(() => {});
            });
        });

        /* ---- filters ---- */
        const buttons = $$('.filter-btn');
        buttons.forEach((btn) => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                buttons.forEach((b) => {
                    const on = b === btn;
                    b.classList.toggle('is-active', on);
                    b.setAttribute('aria-pressed', String(on));
                });

                let firstVisible = null;
                items.forEach((item, i) => {
                    const match = filter === 'all' || item.dataset.cat === filter;
                    item.classList.toggle('is-hidden', !match);
                    if (match) {
                        if (!firstVisible) firstVisible = item;
                        if (!reduceMotion) {
                            item.style.animation = 'none';
                            void item.offsetWidth;
                            item.style.animation = 'swap-in 0.45s var(--ease) both';
                            item.style.animationDelay = Math.min(i, 8) * 45 + 'ms';
                        }
                    }
                });

                if (scrolls()) list.scrollTop = 0;
                if (active && active.classList.contains('is-hidden')) {
                    active = null;
                    setActive(firstVisible);
                }
            });
        });
    }

    /* ---------------- Case study lightbox ---------------- */
    function initCaseModal() {
        const modal = $('#case-modal');
        if (!modal) return;

        const panel = $('.case-panel', modal);
        const stage = $('#case-frame');
        const els = {
            index: $('#case-index'), cat: $('#case-cat'), title: $('#case-title'), sub: $('#case-sub'),
            overview: $('#case-overview'), features: $('#case-features'), role: $('#case-role'),
            stack: $('#case-stack'), live: $('#case-live'), doc: $('#case-doc'), counter: $('#case-counter')
        };
        const closeBtn = $('#case-close');
        const prevBtn = $('#case-prev');
        const nextBtn = $('#case-next');

        let cards = $$('.reel-item');
        let current = -1;
        let lastFocus = null;

        const dataOf = (card) => {
            const holder = card.querySelector('.card-data');
            try { return JSON.parse(holder.textContent); } catch (e) { return null; }
        };

        const buildFrame = (d) => {
            stage.innerHTML = '';
            stage.appendChild(makeFrame(d));
        };

        const render = (i) => {
            const visible = cards.filter((c) => !c.classList.contains('is-hidden'));
            const card = cards[i];
            const d = dataOf(card);
            if (!d) return;
            current = i;

            els.index.textContent = d.index;
            els.cat.textContent = d.cat;
            els.title.textContent = d.title;
            els.sub.textContent = d.sub;
            els.overview.textContent = d.overview;
            els.role.textContent = d.role;
            els.stack.textContent = d.stack;
            els.features.innerHTML = '';
            d.features.forEach((f) => {
                const li = document.createElement('li');
                li.textContent = f;
                els.features.appendChild(li);
            });
            els.live.href = d.url;
            els.live.childNodes[0].nodeValue = d.cta === 'View build' ? 'View build ' : 'Open live ';
            els.doc.href = d.doc;
            els.counter.textContent = (visible.indexOf(card) + 1) + ' / ' + visible.length;

            buildFrame(d);
            $('.case-scroll', modal).scrollTop = 0;
        };

        const step = (dir) => {
            const visible = cards.filter((c) => !c.classList.contains('is-hidden'));
            if (!visible.length) return;
            const pos = visible.indexOf(cards[current]);
            const next = visible[(pos + dir + visible.length) % visible.length];
            render(cards.indexOf(next));
        };

        const open = (card) => {
            lastFocus = document.activeElement;
            cards = $$('.reel-item');
            render(cards.indexOf(card));
            modal.hidden = false;
            document.body.classList.add('modal-open');
            requestAnimationFrame(() => modal.classList.add('is-open'));
            setTimeout(() => closeBtn.focus(), 60);
        };

        const close = () => {
            modal.classList.remove('is-open');
            document.body.classList.remove('modal-open');
            setTimeout(() => {
                modal.hidden = true;
                stage.innerHTML = '';
            }, 320);
            if (lastFocus && lastFocus.focus) lastFocus.focus();
        };

        window.__openCase = open;

        closeBtn.addEventListener('click', close);
        $('.case-backdrop', modal).addEventListener('click', close);
        prevBtn.addEventListener('click', () => step(-1));
        nextBtn.addEventListener('click', () => step(1));

        document.addEventListener('keydown', (e) => {
            if (modal.hidden) return;
            if (e.key === 'Escape') close();
            if (e.key === 'ArrowRight') step(1);
            if (e.key === 'ArrowLeft') step(-1);
            if (e.key === 'Tab') {
                const focusables = $$('button, a[href], [tabindex]:not([tabindex="-1"])', panel)
                    .filter((el) => el.offsetParent !== null);
                if (!focusables.length) return;
                const first = focusables[0];
                const last = focusables[focusables.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        });
    }

    /* ---------------- 3D tilt: service cards + hero card ---------------- */
    function initTilt() {
        if (reduceMotion || window.matchMedia('(hover: none)').matches) return;

        // service cards: spotlight follows the cursor, card tilts toward it
        $$('.service-card').forEach((card) => {
            card.addEventListener('pointermove', (e) => {
                const r = card.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width;
                const py = (e.clientY - r.top) / r.height;
                card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
                card.style.setProperty('--my', (e.clientY - r.top) + 'px');
                card.style.setProperty('--sry', ((px - 0.5) * 11).toFixed(2) + 'deg');
                card.style.setProperty('--srx', ((0.5 - py) * 9).toFixed(2) + 'deg');
            });
            card.addEventListener('pointerleave', () => {
                card.style.setProperty('--sry', '0deg');
                card.style.setProperty('--srx', '0deg');
            });
        });

        // hero profile card tilts to the pointer anywhere over the hero
        const hero = $('.hero');
        const heroCard = $('.hero-card-inner');
        if (hero && heroCard) {
            hero.addEventListener('pointermove', (e) => {
                const r = hero.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width - 0.5;
                const py = (e.clientY - r.top) / r.height - 0.5;
                heroCard.style.setProperty('--cry', (px * 13).toFixed(2) + 'deg');
                heroCard.style.setProperty('--crx', (-py * 9).toFixed(2) + 'deg');
            });
            hero.addEventListener('pointerleave', () => {
                heroCard.style.setProperty('--cry', '0deg');
                heroCard.style.setProperty('--crx', '0deg');
            });
        }
    }

    /* ---------------- Contact forms (EmailJS) ---------------- */
    function initForms() {
        const SERVICE = 'service_t2zneb1';
        const TEMPLATE = 'template_hwwj18o';
        const SDK = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';

        // The mail SDK is a third-party script that only matters once someone
        // actually writes a message, so it is fetched on first form interaction.
        let sdkPromise = null;
        const loadEmailJS = () => {
            if (sdkPromise) return sdkPromise;
            sdkPromise = new Promise((resolve, reject) => {
                if (window.emailjs) return resolve(window.emailjs);
                const tag = document.createElement('script');
                tag.src = SDK;
                tag.async = true;
                tag.onload = () => {
                    if (!window.emailjs) return reject(new Error('sdk missing'));
                    window.emailjs.init('qMGiGB4Vd73UkGKzx');
                    resolve(window.emailjs);
                };
                tag.onerror = () => reject(new Error('sdk blocked'));
                document.head.appendChild(tag);
            });
            return sdkPromise;
        };

        const setStatus = (el, text, state) => {
            if (!el) return;
            el.textContent = text;
            el.className = 'form-status' + (state ? ' ' + state : '');
        };

        const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

        const wire = (form, statusEl, getParams) => {
            if (!form) return;

            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const fields = $$('input[required], textarea[required]', form);
                let ok = true;
                fields.forEach((field) => {
                    const bad = !field.value.trim() || (field.type === 'email' && !validEmail(field.value.trim()));
                    field.classList.toggle('invalid', bad);
                    if (bad && ok) { field.focus(); ok = false; }
                });

                if (!ok) {
                    setStatus(statusEl, 'Please fill in every field with a valid email.', 'error');
                    return;
                }

                const submitBtn = $('.form-submit', form);
                if (submitBtn) submitBtn.disabled = true;
                setStatus(statusEl, 'Sending…', 'pending');

                loadEmailJS()
                    .then((sdk) => sdk.send(SERVICE, TEMPLATE, getParams()))
                    .then(() => {
                        setStatus(statusEl, 'Message sent — I\'ll get back to you within 24 hours.', 'success');
                        form.reset();
                        if (submitBtn) submitBtn.disabled = false;
                        setTimeout(() => setStatus(statusEl, '', 'hidden'), 6000);
                    })
                    .catch(() => {
                        setStatus(statusEl, 'Sending failed. Please email subhash1422005s@gmail.com directly.', 'error');
                        if (submitBtn) submitBtn.disabled = false;
                    });
            });

            $$('input, textarea, select', form).forEach((field) => {
                field.addEventListener('input', () => field.classList.remove('invalid'));
                field.addEventListener('focus', () => { loadEmailJS().catch(() => {}); }, { once: true });
            });
        };

        // Main contact section form
        const mainForm = $('#main-form');
        const mainStatus = $('#main-status');
        wire(mainForm, mainStatus, () => ({
            from_name: $('#mf-name').value.trim(),
            from_email: $('#mf-email').value.trim(),
            message: '[' + $('#mf-type').value + ']\n\n' + $('#mf-message').value.trim()
        }));

        // Floating quick-message form
        const quickForm = $('#contact-form');
        const quickStatus = $('#chat-status');
        wire(quickForm, quickStatus, () => ({
            from_name: $('#sender-name').value.trim(),
            from_email: $('#sender-email').value.trim(),
            message: $('#sender-message').value.trim()
        }));

        // Chat widget open/close
        const chatToggle = $('#chatbot-toggle');
        const chatWindow = $('#chatbot-window');
        const chatClose = $('#chat-close');
        if (chatToggle && chatWindow) {
            const setOpen = (open) => {
                chatWindow.classList.toggle('hidden', !open);
                chatToggle.setAttribute('aria-expanded', String(open));
                if (open) setTimeout(() => $('#sender-name').focus(), 220);
            };
            chatToggle.addEventListener('click', () => setOpen(chatWindow.classList.contains('hidden')));
            if (chatClose) chatClose.addEventListener('click', () => setOpen(false));
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') setOpen(false);
            });
            document.addEventListener('click', (e) => {
                if (chatWindow.classList.contains('hidden')) return;
                if (!e.target.closest('#chatbot-container')) setOpen(false);
            });
        }
    }

    /* ---------------- Misc ---------------- */
    function initMisc() {
        const year = $('#year');
        if (year) year.textContent = new Date().getFullYear();
    }
})();
