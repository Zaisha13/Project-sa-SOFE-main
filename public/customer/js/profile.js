// profile.js - handle profile load/save, photo upload, and password reset
/* PURPOSE: Profile page behavior — load/save current user profile, handle
  photo upload, phone normalization, and password reset UI. */
(function(){
  const KEY = 'currentUser';

  function $(id){ return document.getElementById(id); }

  function loadProfile(){
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch(e) { return null; }
  }

  function saveProfile(user){
    localStorage.setItem(KEY, JSON.stringify(user));
  }

  function dataURLFromFile(file, cb){
    const reader = new FileReader();
    reader.onload = () => cb(reader.result);
    reader.readAsDataURL(file);
  }

  document.addEventListener('DOMContentLoaded', () => {
    let user = loadProfile() || {};
    // Fallback: if currentUser missing, try to infer a customer from legacy store
    if (!user || (!user.email && !user.username)) {
      try {
        const users = JSON.parse(localStorage.getItem('jessie_users') || '[]');
        const customers = users.filter(u => (u && (u.role || 'customer') === 'customer'));
        if (customers.length === 1) {
          user = Object.assign({}, customers[0]);
        }
      } catch (e) {}
    }
    const originalUsername = user.username || null;
    const originalEmail = user.email || null;

  const photoImg = $('profile-photo');
  const photoInput = $('photo-input');
  const removeBtn = $('remove-photo');
  const photoFilename = $('photo-filename');

    // Populate fields
    const first = user.firstName || (user.name ? String(user.name).split(' ')[0] : '');
    const last = user.lastName || (user.name ? String(user.name).split(' ').slice(1).join(' ') : '');
    $('firstname').value = first || '';
    $('lastname').value = last || '';
    // removed gender/age per request
    $('username').value = user.username || '';
    $('email').value = user.email || '';
    $('phone').value = user.phone || '';
    $('address').value = user.address || '';

  const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='240' height='240' fill='none' stroke='%232E5D47' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><rect x='2' y='5' width='20' height='14' rx='2' ry='2'/><circle cx='12' cy='12' r='3'/><path d='M8 5l1.5-2h5L16 5'/></svg>";
  if (photoImg) {
    if (user.photo) photoImg.src = user.photo; else photoImg.src = DEFAULT_AVATAR;
  }

    if (photoInput) photoInput.addEventListener('change', (e)=>{
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      // show filename
      if (photoFilename) photoFilename.textContent = f.name || 'Selected file';
      dataURLFromFile(f, (dataUrl)=>{
        if (photoImg) photoImg.src = dataUrl;
        user.photo = dataUrl;
        saveProfile(user);
        showToast('success','Saved','Profile photo updated');
      });
    });

    if (removeBtn) removeBtn.addEventListener('click', ()=>{
      if (photoImg) photoImg.src = DEFAULT_AVATAR;
      delete user.photo;
      saveProfile(user);
      if (photoFilename) photoFilename.textContent = 'No file chosen';
      // clear native input so same file can be re-chosen if desired
      if (photoInput) photoInput.value = '';
      showToast('info','Removed','Profile photo removed');
    });

    // helper validators
    function setError(id, msg){
      const el = $(id);
      if (!el) return;
      el.textContent = msg || '';
    }
    function markInvalid(inputEl, isInvalid){
      if (!inputEl) return;
      if (isInvalid) inputEl.classList.add('invalid'); else inputEl.classList.remove('invalid');
    }

    // Save profile with confirmation modal, inline validation and phone normalization
    function performSave(){
      const firstName = $('firstname').value.trim();
      const lastName = $('lastname').value.trim();
      const name = `${firstName} ${lastName}`.trim();
      const username = $('username').value.trim();
      const email = $('email').value.trim();
      const age = '';
      const phone = $('phone').value.trim();

      let ok = true;
      // first/last name
      if (!firstName) { setError('err-firstname','First name is required'); markInvalid($('firstname'), true); ok = false; } else { setError('err-firstname',''); markInvalid($('firstname'), false); }
      if (!lastName) { setError('err-lastname','Last name is required'); markInvalid($('lastname'), true); ok = false; } else { setError('err-lastname',''); markInvalid($('lastname'), false); }
      // username
      if (!username) { setError('err-username','Username is required'); markInvalid($('username'), true); ok = false; } else { setError('err-username',''); markInvalid($('username'), false); }
      // email basic
      const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      if (!email || !emailRe.test(email)) { setError('err-email','Valid email is required'); markInvalid($('email'), true); ok = false; } else { setError('err-email',''); markInvalid($('email'), false); }
      // age optional but if provided numeric range
      // age removed
      // phone normalization (accepts local numbers and adds +63)
      if (phone) {
        const normalized = normalizePhone(phone);
        if (!normalized) { setError('err-phone','Enter a valid phone'); markInvalid($('phone'), true); ok = false; } else { setError('err-phone',''); markInvalid($('phone'), false); $('phone').value = normalized; }
      } else { setError('err-phone',''); markInvalid($('phone'), false); }

      if (!ok) return showToast('error','Validation failed','Please fix highlighted fields');

      // uniqueness checks against registered users
      const users = JSON.parse(localStorage.getItem('jessie_users') || '[]');
      const usernameTaken = users.some(u => u.username === username && u.username !== originalUsername);
      const emailTaken = users.some(u => u.email === email && u.email !== originalEmail);
      if (usernameTaken) { setError('err-username','Username already taken'); markInvalid($('username'), true); ok = false; }
      if (emailTaken) { setError('err-email','Email already in use'); markInvalid($('email'), true); ok = false; }
      if (!ok) return showToast('error','Validation failed','Username or email already used');

      // update local jessie_users store: update matching user or add if not present
      const phoneVal = $('phone').value.trim();
      const addrVal = $('address').value.trim();

      const matchIndex = users.findIndex(u => (originalUsername && u.username === originalUsername) || (originalEmail && u.email === originalEmail));
      if (matchIndex >= 0) {
        // merge changes into stored user
        users[matchIndex] = Object.assign({}, users[matchIndex], {
          name: name,
          firstName: firstName,
          lastName: lastName,
          username: username,
          email: email,
          phone: phoneVal,
          address: addrVal,
          
          photo: user.photo || users[matchIndex].photo
        });
      } else {
        // not found in registered users - append as a customer record
        users.push({
          name: name,
          firstName: firstName,
          lastName: lastName,
          username: username,
          email: email,
          password: user.password || '',
          role: user.role || 'customer',
          dateCreated: user.dateCreated || new Date().toISOString(),
          phone: phoneVal,
          address: addrVal,
          
          photo: user.photo || null
        });
      }

      localStorage.setItem('jessie_users', JSON.stringify(users));

      // update currentUser record
      user.name = name;
      user.firstName = firstName;
      user.lastName = lastName;
      user.username = username;
      user.email = email;
      user.phone = phoneVal;
      user.address = addrVal;

      saveProfile(user);
      showToast('success','Saved','Profile updated');
    }

    const saveConfirmModal = $('save-confirm-modal');
    const saveCancelBtn = $('save-cancel');
    const saveConfirmBtn = $('save-confirm');

    $('save-profile').addEventListener('click', ()=>{
      if (saveConfirmModal) saveConfirmModal.setAttribute('aria-hidden','false');
    });
    if (saveCancelBtn) saveCancelBtn.addEventListener('click', ()=>{
      if (saveConfirmModal) saveConfirmModal.setAttribute('aria-hidden','true');
    });
    if (saveConfirmBtn) saveConfirmBtn.addEventListener('click', ()=>{
      performSave();
      if (saveConfirmModal) saveConfirmModal.setAttribute('aria-hidden','true');
    });
    
    // Close save confirmation modal when clicking backdrop
    if (saveConfirmModal) {
      saveConfirmModal.addEventListener('click', (e) => {
        if (e.target === saveConfirmModal) {
          saveConfirmModal.setAttribute('aria-hidden','true');
        }
      });
    }

    // phone normalization on blur
    $('phone').addEventListener('blur', (e)=>{
      const v = e.target.value.trim();
      if (!v) return;
      const n = normalizePhone(v);
      if (n) e.target.value = n;
    });

    function normalizePhone(v){
      // strip non-digits
      const digits = v.replace(/[^0-9+]/g,'');
      if (digits.startsWith('+')) {
        const d = digits.replace(/[^0-9]/g,'');
        return d.length >= 8 ? `+${d}` : null;
      }
      if (digits.startsWith('0') && digits.length >= 10) {
        return '+63' + digits.replace(/^0+/, '');
      }
      if (digits.length === 9 || digits.length === 10) {
        return '+63' + digits.replace(/^0+/, '');
      }
      if (digits.startsWith('63') && digits.length >= 11) return '+' + digits;
      return null;
    }

    // Password modal wiring
    const pwModal = $('pw-modal');
    const pwCancel = $('pw-cancel');
    const pwSave = $('pw-save');

    $('reset-password').addEventListener('click', ()=>{
      pwModal.setAttribute('aria-hidden','false');
    });
    pwCancel.addEventListener('click', ()=> pwModal.setAttribute('aria-hidden','true'));
    
    // Close password modal when clicking backdrop
    if (pwModal) {
      pwModal.addEventListener('click', (e) => {
        if (e.target === pwModal) {
          pwModal.setAttribute('aria-hidden','true');
        }
      });
    }

    pwSave.addEventListener('click', ()=>{
      const cur = $('current-pw').value || '';
      const nw = $('new-pw').value || '';
      const conf = $('confirm-pw').value || '';
      const stored = loadProfile() || {};
      const storedPw = stored.password || '';

      if (!cur || !nw || !conf) return showToast('error','Missing','Please fill all password fields');
      if (cur !== storedPw) return showToast('error','Incorrect','Current password is incorrect');
      if (nw.length < 6) return showToast('error','Weak','New password should be at least 6 chars');
      if (nw !== conf) return showToast('error','Mismatch','New passwords do not match');

      // update stored password
      stored.password = nw;
      saveProfile(stored);
      pwModal.setAttribute('aria-hidden','true');
      $('current-pw').value = $('new-pw').value = $('confirm-pw').value = '';
      showToast('success','Saved','Password updated');
    });
  });

  // Tabs: profile vs order history
  (function setupTabs(){
    const tabProfile = document.getElementById('tab-profile');
    const tabHistory = document.getElementById('tab-history');
    const form = document.getElementById('profile-form');
    const history = document.getElementById('history-section');
    const title = document.getElementById('section-title');

    function setActive(btn){
      document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
      if (btn) btn.classList.add('active');
    }

    function showProfile(){ form.style.display = ''; history.style.display = 'none'; title.textContent = 'Profile Information'; setActive(tabProfile); }
    function showHistory(){ form.style.display = 'none'; history.style.display = ''; title.textContent = 'Order History'; setActive(tabHistory); renderOrderHistory(); }

    if (tabProfile) tabProfile.addEventListener('click', showProfile);
    if (tabHistory) tabHistory.addEventListener('click', showHistory);

    // default to profile
    setActive(tabProfile);
  })();

  function renderOrderHistory(){
    try {
      const wrap = document.getElementById('order-history-list');
      if (!wrap) return;
      wrap.innerHTML = '';
      const orders = JSON.parse(localStorage.getItem('jessie_orders') || '[]');
      const current = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const name = (current && current.name) || '';
      const username = (current && current.username) || '';
      const email = (current && current.email) || '';
      const mine = orders.filter(o => (o.customerName === name) || (o.customerUsername && o.customerUsername === username) || (o.customerEmail && o.customerEmail === email));
      if (mine.length === 0) {
        wrap.innerHTML = '<div style="color:#666;">No orders yet.</div>';
        return;
      }

      // Sort by date/time descending (newest first)
      mine.sort((a, b) => {
        const dateA = new Date(a.date + ' ' + (a.time || '00:00:00'));
        const dateB = new Date(b.date + ' ' + (b.time || '00:00:00'));
        return dateB - dateA;
      });

      // Table header
      const table = document.createElement('div');
      table.className = 'history-table';
      table.innerHTML = '<div class="history-row history-header"><div class="col id">ID</div><div class="col date">DATE</div><div class="col branch">BRANCH</div><div class="col status">STATUS</div><div class="col total">TOTAL</div><div class="col act">ACTION</div></div>';
      wrap.appendChild(table);

      mine.forEach(o => {
        const row = document.createElement('div');
        row.className = 'history-row';
        const status = (o.status || 'pending').toUpperCase();
        const branch = o.branch || 'N/A';
        // Normalize status class for CSS (handle variations)
        const statusClass = (o.status || 'pending').toLowerCase().replace(/\s+/g, '-');
        row.innerHTML = `<div class="col id">${o.id}</div><div class="col date">${o.date}</div><div class="col branch">${branch}</div><div class="col status"><span class="status-badge ${statusClass}">${status}</span></div><div class="col total">₱ ${o.total}</div><div class="col act"><button class="btn primary reorder">Re-order</button></div>`;
        row.addEventListener('click', (ev)=>{ if (!(ev.target && ev.target.classList.contains('reorder'))) showOrderDetail(o); });
        row.querySelector('.reorder').addEventListener('click', (ev)=>{ ev.stopPropagation(); reorderOrder(o); });
        table.appendChild(row);
      });
    } catch(e){}
  }

  function showOrderDetail(order){
    const wrap = document.getElementById('order-history-list');
    if (!wrap) return;
    const itemsHtml = (order.items||[]).map(i=>`<div class="detail-item"><span class="item-name">${i.qty}x ${i.name} <small>(${i.size})</small></span><span class="item-price">₱ ${Number(i.price*i.qty).toFixed(0)}</span></div>`).join('');
    const status = (order.status || 'pending').toUpperCase();
    const branch = order.branch || 'N/A';
    // Normalize status class for CSS (handle variations like "Out for Delivery")
    const statusClass = (order.status || 'pending').toLowerCase().replace(/\s+/g, '-');
    wrap.innerHTML = `
      <div class="order-detail-card">
        <div class="detail-header">
          <h3>Order ID: <span class="order-id">${order.id}</span></h3>
          <div class="detail-meta">
            <span>Date: <strong>${order.date}</strong></span>
            <span>Branch: <strong>${branch}</strong></span>
            <span class="status-badge ${statusClass}">${status}</span>
            <span>Payment: <strong>Paid</strong></span>
          </div>
        </div>
        <div class="detail-body">
          <div class="detail-section">
            <h4>Order Items</h4>
            <div class="detail-items">${itemsHtml}</div>
          </div>
        </div>
        <div class="detail-footer">
          <div class="detail-total">
            <span>TOTAL:</span>
            <strong>₱ ${order.total}</strong>
          </div>
          <div class="detail-actions">
            <button class="btn secondary" id="back-to-list">Back</button>
            <button class="btn primary" id="detail-reorder">Re-order</button>
          </div>
        </div>
      </div>`;
    const back = document.getElementById('back-to-list');
    if (back) back.addEventListener('click', renderOrderHistory);
    const re = document.getElementById('detail-reorder');
    if (re) re.addEventListener('click', ()=> reorderOrder(order));
  }

  function reorderOrder(order){
    try{
      const current = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const userKey = encodeURIComponent(((current && (current.email||current.username))||'guest').toLowerCase());
      const items = (order.items||[]).map(i=>({
        cartId: Date.now()+Math.random(),
        productId: i.productId || 0,
        name: i.name,
        img: i.img || '',
        size: i.size,
        special: i.special || 'None',
        notes: i.notes || '',
        qty: i.qty,
        unitPrice: i.price
      }));
      localStorage.setItem(`saved_cart_${userKey}`, JSON.stringify(items));
      window.location.href = 'drinks.html';
    } catch(e) { console.warn('reorder failed', e); }
  }

  // Logout handler
  const logoutBtn = document.getElementById('logout-link');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        window.location.href = 'customer_dashboard.html';
      }
    });
  }

})();
