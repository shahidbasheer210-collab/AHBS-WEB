(() => {
    const navToggles = document.querySelectorAll('.nav-toggle');

    navToggles.forEach((navToggle) => {
        const nav = navToggle.closest('.nav-shell')?.querySelector('.page-navigation');
        if (!nav) return;

        navToggle.addEventListener('click', () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', String(!isExpanded));
            navToggle.classList.toggle('is-open', !isExpanded);
            nav.classList.toggle('is-open', !isExpanded);
        });

        nav.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 600) {
                    navToggle.setAttribute('aria-expanded', 'false');
                    navToggle.classList.remove('is-open');
                    nav.classList.remove('is-open');
                }
            });
        });
    });

    const pageNavigation = document.querySelector('.page-navigation');
    const navLinks = Array.from(document.querySelectorAll('.page-navigation a'));

    const setActiveNav = (activeLink) => {
        navLinks.forEach((link) => {
            const isActive = link === activeLink;
            link.classList.toggle('active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    };

    if (pageNavigation && navLinks.length) {
        const hashLinks = navLinks.filter((link) => (link.getAttribute('href') || '').startsWith('#'));
        const pageLinks = navLinks.filter((link) => !(link.getAttribute('href') || '').startsWith('#'));

        const updateActiveNav = () => {
            const scrollPosition = window.scrollY + (window.innerHeight * 0.35);
            let activeLink = null;

            hashLinks.forEach((link) => {
                const sectionId = (link.getAttribute('href') || '').slice(1);
                const section = document.getElementById(sectionId);
                if (!section) return;
                const top = section.offsetTop;
                const bottom = top + section.offsetHeight;
                if (scrollPosition >= top && scrollPosition < bottom) {
                    activeLink = link;
                }
            });

            if (!activeLink) {
                activeLink = hashLinks.find((link) => (link.getAttribute('href') || '').slice(1) === 'home')
                    || pageLinks.find((link) => link.getAttribute('aria-current') === 'page')
                    || pageLinks[0]
                    || null;
            }

            if (activeLink) {
                setActiveNav(activeLink);
            }
        };

        window.addEventListener('scroll', () => {
            pageNavigation.classList.toggle('is-scrolled', window.scrollY > 24);
            updateActiveNav();
        }, { passive: true });

        updateActiveNav();
    }

    document.querySelectorAll('.contact-form').forEach((contactForm) => {
        const sendMessageButton = contactForm.querySelector('.send-message-button');
        if (!sendMessageButton) return;

        const buttonLabel = sendMessageButton.querySelector('.button-label');
        const statusMessage = document.createElement('p');
        statusMessage.className = 'form-status';
        statusMessage.setAttribute('role', 'status');
        statusMessage.setAttribute('aria-live', 'polite');
        contactForm.appendChild(statusMessage);

        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            sendMessageButton.disabled = true;
            sendMessageButton.classList.add('is-loading');
            sendMessageButton.setAttribute('aria-busy', 'true');
            buttonLabel.textContent = 'SENDING...';
            statusMessage.textContent = '';
            statusMessage.classList.remove('is-error');

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: JSON.stringify(Object.fromEntries(new FormData(contactForm))),
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
                });

                const result = await response.json();
                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Message could not be sent. Please try again.');
                }

                contactForm.reset();
                statusMessage.textContent = 'Thanks for reaching out. Your message has been sent successfully.';
            } catch (error) {
                statusMessage.textContent = error.message || 'Message could not be sent. Please try again.';
                statusMessage.classList.add('is-error');
            } finally {
                sendMessageButton.disabled = false;
                sendMessageButton.classList.remove('is-loading');
                sendMessageButton.removeAttribute('aria-busy');
                buttonLabel.textContent = 'SEND MESSAGE';
            }
        });
    });

    if (!window.matchMedia('(pointer: fine)').matches) {
        return;
    }

    const glow = document.createElement('span');
    glow.className = 'cursor-glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);

    let frameId;
    let pointerX = -120;
    let pointerY = -120;

    window.addEventListener('pointermove', (event) => {
        pointerX = event.clientX;
        pointerY = event.clientY;

        if (frameId) {
            return;
        }

        frameId = requestAnimationFrame(() => {
            glow.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`;
            glow.classList.add('is-active');
            frameId = undefined;
        });
    }, { passive: true });

    document.addEventListener('mouseleave', () => glow.classList.remove('is-active'));
})();