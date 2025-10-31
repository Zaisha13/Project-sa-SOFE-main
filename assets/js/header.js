// PURPOSE: Shared header behaviors across customer, admin, and cashier portals

document.addEventListener('DOMContentLoaded', function(){
  try {
    const path = window.location.pathname.split('/').pop() || 'customer_dashboard.html';
    document.querySelectorAll('.nav-btn, .navbar a').forEach(a => {
      const href = (a.getAttribute('href') || '').split('/').pop();
      if (href === path) a.classList.add('active');
    });

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const rightHeader = document.querySelector('.right-header');
    
    function showAuthBanner(message, redirectUrl, delayMs = 1400) {
      try {
        let banner = document.querySelector('.auth-banner');
        if (!banner) {
          banner = document.createElement('div');
          banner.className = 'auth-banner';
          banner.setAttribute('role', 'status');
          document.body.appendChild(banner);
        }
        banner.innerHTML = `<div>${message}</div><small>You will be redirected shortly.</small>`;
        banner.getBoundingClientRect();
        banner.classList.add('auth-banner--visible');
        banner.style.pointerEvents = 'none';

        const t = setTimeout(() => {
          try {
            if (redirectUrl) window.location.href = redirectUrl;
          } finally {
            banner.classList.remove('auth-banner--visible');
            setTimeout(() => { if (banner && banner.parentNode) banner.parentNode.removeChild(banner); }, 300);
            document.removeEventListener('click', cancelFn, true);
          }
        }, delayMs);

        function cancelFn() {
          try { clearTimeout(t); } catch (e) {}
          try { banner.classList.remove('auth-banner--visible'); } catch (e) {}
          setTimeout(() => { if (banner && banner.parentNode) banner.parentNode.removeChild(banner); }, 300);
          document.removeEventListener('click', cancelFn, true);
        }

        document.addEventListener('click', cancelFn, true);
        return { timeoutId: t, banner, cancel: cancelFn };
      } catch (err) { console.warn('showAuthBanner error', err); }
    }

    if (rightHeader) {
      rightHeader.innerHTML = '';

      const navItems = [
        { href: 'customer_dashboard.html', text: 'Home' },
        { href: 'drinks.html', text: 'Menu' },
        { href: 'profile.html', text: 'Profile' },
        { href: 'inquiry.html', text: 'Inquiry' }
      ];

      const anchors = {};
      navItems.forEach(item => {
        const a = document.createElement('a');
        a.href = item.href;
        a.className = 'nav-btn';
        a.textContent = item.text;
        rightHeader.appendChild(a);
        anchors[item.text.toLowerCase()] = a;
      });

      if (!isLoggedIn) {
        const profileAnchor = anchors['profile'];
        if (profileAnchor) {
          profileAnchor.classList.add('disabled');
          profileAnchor.setAttribute('aria-disabled', 'true');
          if (!profileAnchor.dataset.origHref) profileAnchor.dataset.origHref = profileAnchor.getAttribute('href') || '';
          profileAnchor.removeAttribute('href');
          profileAnchor.addEventListener('click', function authRedirect(e){
            e.preventDefault();
            showAuthBanner('Please log in or register to access your profile.', 'customer_dashboard.html', 1400);
          });
        }

        const auth = document.createElement('a');
        auth.href = '#';
        auth.className = 'nav-btn auth-link login-link';
        auth.textContent = 'Create Account';
        auth.addEventListener('click', function(e) {
          e.preventDefault();
          if (typeof window.showAuthModal !== 'undefined') {
            window.showAuthModal('register');
          } else {
            // If modal is not available, redirect to dashboard where modal is available
            window.location.href = 'customer_dashboard.html';
          }
        });
        rightHeader.appendChild(auth);
      } else {
        const profileAnchor = anchors['profile'];
        if (profileAnchor) {
          profileAnchor.classList.remove('disabled');
          profileAnchor.removeAttribute('aria-disabled');
          if (profileAnchor.dataset.origHref) {
            profileAnchor.setAttribute('href', profileAnchor.dataset.origHref);
            delete profileAnchor.dataset.origHref;
          }
        }

        const logoutEl = document.createElement('a');
        logoutEl.href = '#'; logoutEl.className = 'nav-btn auth-link logout-btn'; logoutEl.textContent = 'Logout';
        logoutEl.addEventListener('click', function(e){
          e.preventDefault();
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('currentUser');
          window.location.href = 'customer_dashboard.html';
        });
        rightHeader.appendChild(logoutEl);
      }

      const pathName = path;
      Array.from(rightHeader.querySelectorAll('a')).forEach(a => {
        const href = (a.getAttribute('href') || '').split('/').pop();
        if (href === pathName) a.classList.add('active');
      });
    }

    const headerEl = document.querySelector('header');
    if (headerEl) {
      let ticking = false;
      const update = () => {
        const scrolled = window.scrollY > 8;
        headerEl.classList.toggle('scrolled', scrolled);
        ticking = false;
      };
      window.addEventListener('scroll', function onScroll() {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      }, { passive: true });
      update();
    }
  } catch (err) { console.warn('header.js init error', err); }
});
