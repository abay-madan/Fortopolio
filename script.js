/**
 * Akbar Ramadhan - Portfolio Interactive Engine 2026
 * Senior Frontend Architecture & Interactive Animations
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Accent Switcher
    initThemeAccent();

    // 2. Sound Effects Engine (Web Audio API)
    const sfx = initSoundEffects();

    // 3. Particle Network Background Canvas
    initParticleCanvas();

    // 4. Custom Magnetic Cursor
    initCustomCursor();

    // 5. Interactive Developer Terminal in Hero
    initInteractiveTerminal(sfx);

    // 6. 3D Tilt and Spotlight Card Effects
    init3DTiltAndSpotlight();

    // 7. Dynamic Project Filtering & Lightbox Modal
    initProjectShowcase(sfx);

    // 8. Animated Metrics & Stats Counter (Intersection Observer)
    initStatsCounter();

    // 9. ScrollSpy & Floating HUD Navigation
    initNavigationAndScrollSpy();

    // 10. Contact Form with Direct WhatsApp Integration
    initContactForm(sfx);

    // 11. Skill Progress Bars Animation
    initSkillProgress();
});

/* ==========================================================================
   1. THEME ACCENT SWITCHER
   ========================================================================== */
function initThemeAccent() {
    const root = document.documentElement;
    const accentBtns = document.querySelectorAll('.theme-dot');
    const savedAccent = localStorage.getItem('portfolio-accent') || 'cyan';

    const themes = {
        cyan: {
            '--primary-color': '#00f2fe',
            '--primary-glow': 'rgba(0, 242, 254, 0.4)',
            '--secondary-color': '#4facfe',
            '--accent-gradient': 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)'
        },
        violet: {
            '--primary-color': '#a855f7',
            '--primary-glow': 'rgba(168, 85, 247, 0.4)',
            '--secondary-color': '#ec4899',
            '--accent-gradient': 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'
        },
        emerald: {
            '--primary-color': '#10b981',
            '--primary-glow': 'rgba(16, 185, 129, 0.4)',
            '--secondary-color': '#06b6d4',
            '--accent-gradient': 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)'
        },
        amber: {
            '--primary-color': '#f59e0b',
            '--primary-glow': 'rgba(245, 158, 11, 0.4)',
            '--secondary-color': '#ef4444',
            '--accent-gradient': 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'
        }
    };

    function applyTheme(themeName) {
        const theme = themes[themeName] || themes.cyan;
        for (const [prop, val] of Object.entries(theme)) {
            root.style.setProperty(prop, val);
        }
        localStorage.setItem('portfolio-accent', themeName);

        accentBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === themeName);
        });
    }

    applyTheme(savedAccent);

    accentBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            applyTheme(btn.dataset.theme);
        });
    });
}

/* ==========================================================================
   2. SOUND EFFECTS (Web Audio API Synthesizer - Zero Dependencies)
   ========================================================================== */
function initSoundEffects() {
    let audioCtx = null;
    let isMuted = localStorage.getItem('portfolio-audio-muted') === 'true';

    const muteBtn = document.getElementById('soundToggle');
    const muteIcon = document.getElementById('soundIcon');

    function updateMuteUI() {
        if (muteIcon) {
            muteIcon.className = isMuted ? 'bi bi-volume-mute-fill' : 'bi bi-volume-up-fill';
        }
        if (muteBtn) {
            muteBtn.setAttribute('title', isMuted ? 'Aktifkan Suara' : 'Bisukan Suara');
            muteBtn.classList.toggle('muted', isMuted);
        }
    }
    updateMuteUI();

    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            isMuted = !isMuted;
            localStorage.setItem('portfolio-audio-muted', isMuted);
            updateMuteUI();
            if (!isMuted) playTone(800, 'sine', 0.05, 0.03);
        });
    }

    function getAudioContext() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) audioCtx = new AudioContext();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function playTone(freq, type = 'sine', duration = 0.06, gainLevel = 0.04) {
        if (isMuted) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            // Audio context error handling
        }
    }

    return {
        hover: () => playTone(600, 'sine', 0.04, 0.02),
        click: () => playTone(950, 'triangle', 0.06, 0.05),
        success: () => {
            playTone(523.25, 'sine', 0.1, 0.04);
            setTimeout(() => playTone(659.25, 'sine', 0.1, 0.04), 80);
            setTimeout(() => playTone(783.99, 'sine', 0.15, 0.04), 160);
        },
        terminalKey: () => playTone(300 + Math.random() * 200, 'square', 0.02, 0.015)
    };
}

/* ==========================================================================
   3. PARTICLE CONSTELLATION CANVAS
   ========================================================================== */
function initParticleCanvas() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height, particles = [];
    let animationFrameId;

    const mouse = { x: null, y: null, radius: 120 };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        createParticles();
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 0.8;
            this.vx = (Math.random() - 0.5) * 0.6;
            this.vy = (Math.random() - 0.5) * 0.6;
            this.baseAlpha = Math.random() * 0.5 + 0.2;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            // Mouse interaction
            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    const directionX = (dx / distance) * force * 1.5;
                    const directionY = (dy / distance) * force * 1.5;
                    this.x -= directionX;
                    this.y -= directionY;
                }
            }
        }

        draw() {
            const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#00f2fe';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = primaryColor;
            ctx.globalAlpha = this.baseAlpha;
            ctx.fill();
        }
    }

    function createParticles() {
        particles = [];
        const count = Math.min(Math.floor((width * height) / 14000), 85);
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function connect() {
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#00f2fe';
        const maxDist = 110;

        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxDist) {
                    const alpha = (1 - dist / maxDist) * 0.18;
                    ctx.beginPath();
                    ctx.strokeStyle = primaryColor;
                    ctx.globalAlpha = alpha;
                    ctx.lineWidth = 0.8;
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        connect();
        animationFrameId = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        cancelAnimationFrame(animationFrameId);
        resize();
        animate();
    });

    resize();
    animate();
}

/* ==========================================================================
   4. CUSTOM MAGNETIC CURSOR
   ========================================================================== */
function initCustomCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return; // Disable on touch devices

    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    if (!cursorDot || !cursorOutline) return;

    let mouseX = -100, mouseY = -100;
    let outlineX = -100, outlineY = -100;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    function animateCursor() {
        outlineX += (mouseX - outlineX) * 0.15;
        outlineY += (mouseY - outlineY) * 0.15;
        cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px)`;
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    const hoverables = document.querySelectorAll('a, button, .project-card, .skill-card, .terminal-shortcut, input, select, textarea');
    hoverables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorOutline.classList.add('cursor-hover');
        });
        el.addEventListener('mouseleave', () => {
            cursorOutline.classList.remove('cursor-hover');
        });
    });
}

/* ==========================================================================
   5. INTERACTIVE DEVELOPER TERMINAL IN HERO
   ========================================================================== */
function initInteractiveTerminal(sfx) {
    const termInput = document.getElementById('terminalInput');
    const termBody = document.getElementById('terminalOutput');
    const tabButtons = document.querySelectorAll('.term-tab-btn');
    const codePanes = document.querySelectorAll('.code-pane');
    const shortcuts = document.querySelectorAll('.terminal-shortcut');

    if (!termBody) return;

    // Tab switching
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (sfx) sfx.click();
            tabButtons.forEach(b => b.classList.remove('active'));
            codePanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPane = document.getElementById(btn.dataset.target);
            if (targetPane) targetPane.classList.add('active');

            if (btn.dataset.target === 'terminalPane' && termInput) {
                termInput.focus();
            }
        });
    });

    // Terminal Commands
    const commands = {
        help: `Available commands:
  <span class="cmd-cyan">skills</span>     - View tech stack and proficiencies
  <span class="cmd-cyan">projects</span>   - List featured projects
  <span class="cmd-cyan">about</span>      - Short bio and background
  <span class="cmd-cyan">contact</span>    - Show contact details & WhatsApp
  <span class="cmd-cyan">theme</span>      - Switch theme (cyan, violet, emerald, amber)
  <span class="cmd-cyan">clear</span>      - Clear terminal screen
  <span class="cmd-cyan">sudo hire</span>  - Fast track hiring shortcut`,
        skills: `🚀 <span class="cmd-cyan">Tech Stack:</span>
  • Frontend: HTML5, CSS3, JavaScript, Bootstrap 5, Responsive UI
  • Backend: PHP, Python (Basic), MySQL
  • Tools: Figma, Affinity Designer/Photo, VS Code, Git/GitHub
  • Soft Skills: Problem Solving, Teamwork, Communication`,
        projects: `💼 <span class="cmd-cyan">Featured Projects:</span>
  1. <a href="#projects" class="cmd-link">Brand Identity Package (Affinity Suite)</a>
  2. <a href="#projects" class="cmd-link">Custom VS Code Theme & Extension</a>
  3. <a href="#projects" class="cmd-link">Mobile App UI Kit & Design System (Figma)</a>
  4. <a href="#projects" class="cmd-link">Web Apps & Agency Showcase</a>`,
        about: `👨‍💻 <span class="cmd-cyan">Akbar Ramadhan</span>
  • Student at SMK MULTI KARYA Medan (RPL)
  • Passionate Frontend Developer & UI/UX Designer
  • Status: 🟢 Open to Freelance & Collaboration`,
        contact: `📬 <span class="cmd-cyan">Contact Info:</span>
  • WhatsApp: <a href="https://wa.me/6285217161933" target="_blank" class="cmd-link">+62 852-1716-1933</a>
  • Email: akbar60305@gmail.com
  • Location: Medan, Sumatera Utara, Indonesia`,
        'sudo hire': `🎉 <span class="cmd-green">ACCESS GRANTED!</span>
Thank you for your interest! Let's build extraordinary digital products together.
Opening WhatsApp directly...`
    };

    function appendOutput(content, isCommand = false) {
        const line = document.createElement('div');
        line.className = isCommand ? 'term-line term-command' : 'term-line term-response';
        line.innerHTML = content;
        termBody.appendChild(line);
        termBody.scrollTop = termBody.scrollHeight;
    }

    function processCommand(rawCmd) {
        const cmd = rawCmd.trim().toLowerCase();
        if (!cmd) return;

        appendOutput(`<span class="term-prompt">akbar@portfolio:~$</span> ${escapeHTML(rawCmd)}`, true);
        if (sfx) sfx.terminalKey();

        if (cmd === 'clear') {
            termBody.innerHTML = '';
            return;
        }

        if (cmd.startsWith('theme ')) {
            const themeName = cmd.split(' ')[1];
            const btn = document.querySelector(`.theme-dot[data-theme="${themeName}"]`);
            if (btn) {
                btn.click();
                appendOutput(`✨ Accent theme updated to <span class="cmd-cyan">${themeName}</span>.`);
            } else {
                appendOutput(`❌ Unknown theme. Choose: <span class="cmd-cyan">cyan, violet, emerald, amber</span>.`);
            }
            return;
        }

        if (commands[cmd]) {
            appendOutput(commands[cmd]);
            if (cmd === 'sudo hire') {
                setTimeout(() => {
                    window.open('https://wa.me/6285217161933?text=Halo%20Akbar,%20saya%20tertarik%20untuk%20bekerja%20sama%20dengan%20Anda!', '_blank');
                }, 1200);
            }
        } else {
            appendOutput(`Command not found: <span class="cmd-red">${escapeHTML(rawCmd)}</span>. Type <span class="cmd-cyan">'help'</span> for available commands.`);
        }
    }

    if (termInput) {
        termInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const val = termInput.value;
                termInput.value = '';
                processCommand(val);
            } else if (sfx && e.key.length === 1) {
                sfx.terminalKey();
            }
        });
    }

    shortcuts.forEach(chip => {
        chip.addEventListener('click', () => {
            const cmd = chip.dataset.cmd;
            const termTab = document.querySelector('.term-tab-btn[data-target="terminalPane"]');
            if (termTab) termTab.click();
            processCommand(cmd);
        });
    });
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag] || tag));
}

/* ==========================================================================
   6. 3D TILT & DYNAMIC SPOTLIGHT CARD EFFECTS
   ========================================================================== */
function init3DTiltAndSpotlight() {
    const cards = document.querySelectorAll('.spotlight-card, .project-card, .hero-terminal, .profile-avatar-wrap');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Set spotlight CSS variables
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            // 3D tilt calculation
            if (card.classList.contains('tilt-3d')) {
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -7;
                const rotateY = ((x - centerX) / centerX) * 7;

                card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
            }
        });

        card.addEventListener('mouseleave', () => {
            if (card.classList.contains('tilt-3d')) {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
            }
        });
    });
}

/* ==========================================================================
   7. PROJECT SHOWCASE (Filtering & Modal Lightbox)
   ========================================================================== */
function initProjectShowcase(sfx) {
    const filterBtns = document.querySelectorAll('.filter-chip');
    const projectItems = document.querySelectorAll('.project-col');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (sfx) sfx.click();
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            projectItems.forEach(item => {
                const category = item.dataset.category;
                if (filter === 'all' || category === filter) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // Project Lightbox Modal
    const modalEl = document.getElementById('projectDetailModal');
    if (!modalEl) return;

    const modalTitle = document.getElementById('modalProjectTitle');
    const modalImg = document.getElementById('modalProjectImg');
    const modalCategory = document.getElementById('modalProjectCategory');
    const modalDesc = document.getElementById('modalProjectDesc');
    const modalTech = document.getElementById('modalProjectTech');
    const modalLive = document.getElementById('modalProjectLive');
    const modalSource = document.getElementById('modalProjectSource');

    const detailButtons = document.querySelectorAll('.btn-project-detail');
    detailButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (sfx) sfx.click();

            const card = btn.closest('.project-card');
            if (!card) return;

            const title = card.querySelector('.project-title')?.textContent || 'Project Detail';
            const img = card.querySelector('.project-image')?.getAttribute('src') || 'SS-1.jpeg';
            const category = card.querySelector('.project-category-badge')?.textContent || 'Web Development';
            const desc = card.querySelector('.project-full-desc')?.innerHTML || card.querySelector('.project-desc')?.innerHTML || '';
            const techBadges = card.querySelector('.tech-stack')?.innerHTML || '';
            const liveUrl = card.dataset.live || '#';
            const sourceUrl = card.dataset.source || '#';

            if (modalTitle) modalTitle.textContent = title;
            if (modalImg) modalImg.src = img;
            if (modalCategory) modalCategory.textContent = category;
            if (modalDesc) modalDesc.innerHTML = desc;
            if (modalTech) modalTech.innerHTML = techBadges;

            if (modalLive) modalLive.href = liveUrl;
            if (modalSource) modalSource.href = sourceUrl;

            const bsModal = new bootstrap.Modal(modalEl);
            bsModal.show();
        });
    });
}

/* ==========================================================================
   8. ANIMATED METRICS & STATS COUNTER
   ========================================================================== */
function initStatsCounter() {
    const statsNumbers = document.querySelectorAll('.stat-number');
    let animated = false;

    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                animated = true;
                statsNumbers.forEach(stat => {
                    const target = parseInt(stat.dataset.count, 10) || 0;
                    const suffix = stat.dataset.suffix || '';
                    let current = 0;
                    const duration = 1500;
                    const increment = target / (duration / 16);

                    function updateCount() {
                        current += increment;
                        if (current < target) {
                            stat.textContent = Math.ceil(current) + suffix;
                            requestAnimationFrame(updateCount);
                        } else {
                            stat.textContent = target + suffix;
                        }
                    }
                    updateCount();
                });
                observer.disconnect();
            }
        });
    }, { threshold: 0.3 });

    const statsSection = document.getElementById('statsSection');
    if (statsSection) statsObserver.observe(statsSection);
}

/* ==========================================================================
   9. SCROLLSPY & NAVIGATION
   ========================================================================== */
function initNavigationAndScrollSpy() {
    const navbar = document.querySelector('.navbar');
    const backToTop = document.getElementById('backToTop');
    const scrollProgress = document.getElementById('scrollProgressCircle');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        // Navbar blur intensity
        if (navbar) {
            navbar.classList.toggle('scrolled', scrollY > 40);
        }

        // Back to top & SVG Circle Progress
        if (backToTop) {
            backToTop.classList.toggle('show', scrollY > 300);

            if (scrollProgress) {
                const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
                const progress = (scrollY / totalHeight) * 100;
                const offset = 100 - progress;
                scrollProgress.style.strokeDashoffset = offset;
            }
        }

        // ScrollSpy
        let currentId = '';
        sections.forEach(sec => {
            const secTop = sec.offsetTop - 120;
            const secHeight = sec.clientHeight;
            if (scrollY >= secTop && scrollY < secTop + secHeight) {
                currentId = sec.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentId}`) {
                link.classList.add('active');
            }
        });
    });

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Smooth anchor navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth' });

                // Close mobile menu if opened
                const navCollapse = document.getElementById('navbarNav');
                if (navCollapse && navCollapse.classList.contains('show')) {
                    const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
                    if (bsCollapse) bsCollapse.hide();
                }
            }
        });
    });
}

/* ==========================================================================
   10. CONTACT FORM WITH DIRECT WHATSAPP INTEGRATION
   ========================================================================== */
function initContactForm(sfx) {
    const form = document.getElementById('contactForm');
    const messageInput = document.getElementById('message');
    const charCount = document.getElementById('charCount');
    const btnWhatsApp = document.getElementById('btnSendWhatsApp');
    const toastEl = document.getElementById('portfolioToast');

    if (messageInput && charCount) {
        messageInput.addEventListener('input', () => {
            const len = messageInput.value.length;
            charCount.textContent = len;
            charCount.style.color = len > 500 ? '#ef4444' : 'inherit';
        });
    }

    function showToast(title, msg, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        // Create custom toast element
        const toast = document.createElement('div');
        const toastType = type === true ? 'success' : (type === false ? 'error' : type);
        toast.className = `custom-toast toast-${toastType}`;

        const iconClass = toastType === 'success' 
            ? 'bi-check-circle-fill' 
            : (toastType === 'error' ? 'bi-exclamation-octagon-fill' : 'bi-info-circle-fill');

        toast.innerHTML = `
            <div class="toast-icon-wrap">
                <i class="bi ${iconClass}"></i>
            </div>
            <div class="toast-text pe-4">
                <h5>${title}</h5>
                <p>${msg}</p>
            </div>
            <button class="toast-close" title="Tutup">
                <i class="bi bi-x-lg"></i>
            </button>
            <div class="toast-progress"></div>
        `;

        container.appendChild(toast);
        if (sfx) {
            if (toastType === 'success') sfx.success();
            else sfx.click();
        }

        // Close button handler
        const closeBtn = toast.querySelector('.toast-close');
        function removeToast() {
            toast.classList.add('toast-hiding');
            setTimeout(() => {
                if (toast.parentElement) toast.parentElement.removeChild(toast);
            }, 400);
        }

        closeBtn.addEventListener('click', removeToast);

        // Auto dismiss after 4 seconds
        setTimeout(removeToast, 4000);
    }

    // Direct WhatsApp send button
    if (btnWhatsApp) {
        btnWhatsApp.addEventListener('click', () => {
            const name = document.getElementById('name')?.value.trim();
            const email = document.getElementById('email')?.value.trim();
            const subject = document.getElementById('subject')?.value || 'Tanya Portofolio';
            const msg = document.getElementById('message')?.value.trim();

            if (!name || !msg) {
                showToast('Form Belum Lengkap', 'Mohon isi nama dan pesan Anda sebelum mengirim ke WhatsApp.', false);
                return;
            }

            const waMessage = `*Halo Akbar Ramadhan!*%0A%0A*Nama:* ${encodeURIComponent(name)}%0A*Email:* ${encodeURIComponent(email || '-')}%0A*Subjek:* ${encodeURIComponent(subject)}%0A%0A*Pesan:*%0A${encodeURIComponent(msg)}%0A%0A_Dikirim melalui Website Portofolio_`;
            const waUrl = `https://wa.me/6285217161933?text=${waMessage}`;

            window.open(waUrl, '_blank');
            showToast('Membuka WhatsApp', 'Pesan telah diformat dan diteruskan ke WhatsApp.');
        });
    }

    // Email / Normal submit
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name')?.value.trim();
            const email = document.getElementById('email')?.value.trim();
            const subject = document.getElementById('subject')?.value;
            const msg = document.getElementById('message')?.value.trim();

            if (!name || !email || !msg) {
                showToast('Form Belum Lengkap', 'Harap isi semua kolom bertanda bintang (*).', false);
                return;
            }

            // Create mailto fallback
            const mailtoUrl = `mailto:akbar60305@gmail.com?subject=${encodeURIComponent(`[Portofolio] ${subject}: ${name}`)}&body=${encodeURIComponent(`Nama: ${name}\nEmail: ${email}\nSubjek: ${subject}\n\nPesan:\n${msg}`)}`;
            window.location.href = mailtoUrl;

            showToast('Pesan Terkirim!', 'Klien email Anda dibuka untuk mengirim pesan.');
            form.reset();
            if (charCount) charCount.textContent = '0';
        });
    }

    // Copy email button
    const copyEmailBtns = [document.getElementById('btnCopyEmail'), document.getElementById('btnCopyEmailAction')];
    copyEmailBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                navigator.clipboard.writeText('akbar60305@gmail.com').then(() => {
                    showToast('Email Berhasil Disalin!', 'Alamat akbar60305@gmail.com telah disalin ke clipboard Anda.', 'success');
                }).catch(() => {
                    showToast('Info Kontak', 'akbar60305@gmail.com', 'info');
                });
            });
        }
    });
}

/* ==========================================================================
   11. SKILL PROGRESS BARS ANIMATION
   ========================================================================== */
function initSkillProgress() {
    const progressBars = document.querySelectorAll('.skill-progress-fill');

    const progressObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const width = bar.dataset.progress || '80%';
                bar.style.width = width;
                observer.unobserve(bar);
            }
        });
    }, { threshold: 0.2 });

    progressBars.forEach(bar => progressObserver.observe(bar));
}
