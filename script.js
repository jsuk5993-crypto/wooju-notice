(() => {
  const entrance = document.getElementById('entrance');
  const siteShell = document.getElementById('siteShell');
  const enterButton = document.getElementById('enterButton');
  const reopenEntrance = document.getElementById('reopenEntrance');
  const readingProgress = document.getElementById('readingProgress');
  const currentSectionLabel = document.getElementById('currentSectionLabel');
  const navLinks = [...document.querySelectorAll('[data-section]')];
  const sections = [...document.querySelectorAll('.notice-section')];
  const revealItems = [...document.querySelectorAll('.reveal')];
  const completeButton = document.getElementById('completeButton');
  const successModal = document.getElementById('successModal');
  const toast = document.getElementById('toast');
  const copyPassword = document.getElementById('copyPassword');
  const backToTop = document.getElementById('backToTop');
  const cursorLight = document.getElementById('cursorLight');
  const mobileNav = document.getElementById('mobileNav');
  const mobileNavButton = document.getElementById('mobileNavButton');
  const mobileNavClose = document.getElementById('mobileNavClose');
  const mobileNavBackdrop = document.getElementById('mobileNavBackdrop');

  let entranceTimer;

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 1800);
  };

  const getEntranceTarget = () => (
    window.location.hash && document.querySelector(window.location.hash)
      ? window.location.hash
      : '#welcome'
  );

  const finishEntrance = () => {
    window.clearTimeout(entranceTimer);
    entrance.hidden = true;
    entrance.classList.remove('charging', 'opening', 'crossing', 'leaving');
    entrance.dataset.busy = 'false';
    enterButton.disabled = false;
    siteShell.classList.remove('entering');
    siteShell.classList.add('ready');
    document.body.classList.remove('entrance-active');
    document.body.style.overflow = '';
    updateScrollUI();
  };

  const enterSite = () => {
    if (entrance.dataset.busy === 'true') return;

    const target = getEntranceTarget();
    entrance.dataset.busy = 'true';
    siteShell.hidden = false;
    siteShell.classList.remove('ready');
    siteShell.classList.add('entering');
    document.querySelector(target)?.scrollIntoView({ block: 'start' });
    enterButton.disabled = true;

    // 1) 문구가 먼저 사라지고 중앙 틈이 밝아짐
    requestAnimationFrame(() => {
      entrance.classList.add('charging');
    });

    // 2) 두 문이 확실히 양쪽으로 열림
    window.setTimeout(() => {
      if (entrance.dataset.busy !== 'true') return;
      entrance.classList.add('opening');
    }, 140);

    // 3) 열린 문 안쪽으로 들어가는 듯 본문을 앞으로 가져옴
    window.setTimeout(() => {
      if (entrance.dataset.busy !== 'true') return;
      siteShell.classList.remove('entering');
      siteShell.classList.add('ready');
      entrance.classList.add('crossing');
    }, 1040);

    entranceTimer = window.setTimeout(finishEntrance, 1320);
  };

  const showEntrance = () => {
    closeMobileNav();
    window.clearTimeout(entranceTimer);
    entrance.hidden = false;
    entrance.classList.remove('charging', 'opening', 'crossing', 'leaving');
    entrance.dataset.busy = 'false';
    enterButton.disabled = false;
    siteShell.classList.remove('ready', 'entering');
    document.body.classList.add('entrance-active');
    document.body.style.overflow = 'hidden';
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const updateScrollUI = () => {
    if (siteShell.hidden) return;
    const doc = document.documentElement;
    const scrollable = Math.max(doc.scrollHeight - window.innerHeight, 1);
    const percent = Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100));
    readingProgress.style.width = `${percent}%`;
    backToTop.classList.toggle('show', window.scrollY > 650);
  };

  const setActiveSection = (section) => {
    if (!section) return;
    navLinks.forEach((link) => link.classList.toggle('active', link.dataset.section === section.id));
    currentSectionLabel.textContent = section.dataset.title || '우주네 공지';
  };

  const openMobileNav = () => {
    mobileNav.hidden = false;
    mobileNavBackdrop.hidden = false;
    document.body.style.overflow = 'hidden';
    mobileNavButton.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => {
      mobileNav.classList.add('open');
      mobileNavBackdrop.classList.add('open');
    });
  };

  const closeMobileNav = () => {
    if (mobileNav.hidden) return;
    mobileNav.classList.remove('open');
    mobileNavBackdrop.classList.remove('open');
    mobileNavButton.setAttribute('aria-expanded', 'false');
    window.setTimeout(() => {
      mobileNav.hidden = true;
      mobileNavBackdrop.hidden = true;
      if (entrance.hidden && successModal.hidden) document.body.style.overflow = '';
    }, 260);
  };

  enterButton.addEventListener('click', enterSite);
  reopenEntrance.addEventListener('click', showEntrance);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !entrance.hidden) enterSite();
    if (event.key === 'Escape') {
      closeMobileNav();
      if (!successModal.hidden) closeSuccessModal();
    }
  });

  window.addEventListener('scroll', updateScrollUI, { passive: true });
  window.addEventListener('resize', updateScrollUI);
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActiveSection(visible.target);
  }, { rootMargin: '-18% 0px -64% 0px', threshold: [0.04, 0.15, 0.35, 0.6] });
  sections.forEach((section) => sectionObserver.observe(section));

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  revealItems.forEach((item) => revealObserver.observe(item));

  copyPassword.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('1107');
    } catch {
      const input = document.createElement('textarea');
      input.value = '1107';
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }
    copyPassword.textContent = '복사 완료';
    showToast('구인방 비밀번호 1107을 복사했습니다.');
    window.setTimeout(() => { copyPassword.textContent = '비밀번호 복사'; }, 1600);
  });

  const openSuccessModal = () => {
    successModal.hidden = false;
    document.body.style.overflow = 'hidden';
    successModal.querySelector('button')?.focus();
  };

  function closeSuccessModal() {
    successModal.hidden = true;
    document.body.style.overflow = '';
    completeButton.focus();
  }

  completeButton.addEventListener('click', openSuccessModal);
  successModal.querySelectorAll('[data-close-modal]').forEach((element) => element.addEventListener('click', closeSuccessModal));

  mobileNavButton.addEventListener('click', openMobileNav);
  mobileNavClose.addEventListener('click', closeMobileNav);
  mobileNavBackdrop.addEventListener('click', closeMobileNav);
  mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMobileNav));

  if (window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('pointermove', (event) => {
      cursorLight.style.left = `${event.clientX}px`;
      cursorLight.style.top = `${event.clientY}px`;
    });
    document.addEventListener('pointerleave', () => { cursorLight.style.opacity = '0'; });
    document.addEventListener('pointerenter', () => { cursorLight.style.opacity = '.08'; });
  }

  document.body.classList.add('entrance-active');
  document.body.style.overflow = 'hidden';
  setActiveSection(sections[0]);
})();
