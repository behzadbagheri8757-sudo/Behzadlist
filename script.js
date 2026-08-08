// ==============================
// توابع مشترک + ساعت زنده شمسی
// ==============================

const WEEKDAYS = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
const MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

/**
 * تبدیل تاریخ میلادی به شمسی (الگوریتم ساده و دقیق)
 */
function gregorianToJalali(gy, gm, gd) {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = (gy <= 1600) ? 0 : 979;
  gy -= (gy <= 1600) ? 621 : 1600;
  let gy2 = (gm > 2) ? (gy + 1) : gy;
  let days = (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) - 80 + gd + g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm = (days < 186) ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  let jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
  return { jy, jm, jd };
}

function pad(n) {
  return n < 10 ? '0' + n : '' + n;
}

function formatPrice(num) {
  if (num === null || num === undefined || num === '') return null;
  return Number(num).toLocaleString('fa-IR') + ' تومان';
}

function updateLiveClock() {
  const now = new Date();
  const { jy, jm, jd } = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const weekday = WEEKDAYS[now.getDay()];
  const dateStr = `${weekday} ${jd} ${MONTHS[jm - 1]} ${jy}`;
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const dateEl = document.getElementById('live-date');
  const timeEl = document.getElementById('live-time');
  if (dateEl) dateEl.textContent = dateStr;
  if (timeEl) timeEl.textContent = timeStr;
}

function initLiveClock() {
  updateLiveClock();
  setInterval(updateLiveClock, 1000);
}

// ==============================
// رندر صفحه مشتری
// ==============================

function getSortedProducts() {
  if (typeof products === 'undefined' || !Array.isArray(products)) return [];
  return [...products].sort((a, b) => (a.order || 0) - (b.order || 0));
}

function renderCustomerProducts() {
  const container = document.getElementById('products-list');
  if (!container) return;

  const list = getSortedProducts();
  if (list.length === 0) {
    container.innerHTML = '<div class="empty-message">هیچ محصولی ثبت نشده است</div>';
    return;
  }

  container.innerHTML = list.map(p => {
    const isAvailable = p.available !== false; // پیش‌فرض: موجود

    let priceHtml = '';
    if (isAvailable) {
      const unit = formatPrice(p.unitPrice);
      const pack = (p.packPrice !== null && p.packPrice !== undefined && p.packPrice !== '')
        ? formatPrice(p.packPrice)
        : null;

      priceHtml = `
        <div class="product-price">${unit || '—'}</div>
        ${pack ? `<div class="product-pack">بسته ۵ کیلویی: <span>${pack}</span></div>` : ''}
      `;
    } else {
      priceHtml = `<div class="product-status">در حال تامین</div>`;
    }

    return `
      <article class="product-card ${isAvailable ? '' : 'unavailable'}">
        <img class="product-image" src="${p.image || ''}" alt="${p.name}" loading="lazy"
             onerror="this.style.background='#e8e8e8'; this.src=''; this.alt='تصویر موجود نیست';">
        <div class="product-info">
          <h2 class="product-name">${p.name || '—'}</h2>
          ${priceHtml}
        </div>
      </article>
    `;
  }).join('');
}

// ==============================
// پنل مدیریت
// ==============================

let adminProducts = [];

function loadAdminData() {
  if (typeof products !== 'undefined' && Array.isArray(products)) {
    adminProducts = JSON.parse(JSON.stringify(products));
  } else {
    adminProducts = [];
  }
  renderAdminList();
}

function renderAdminList() {
  const listEl = document.getElementById('admin-list');
  if (!listEl) return;

  const sorted = [...adminProducts].sort((a, b) => (a.order || 0) - (b.order || 0));

  if (sorted.length === 0) {
    listEl.innerHTML = '<div class="empty-message">هنوز محصولی اضافه نشده</div>';
    return;
  }

  listEl.innerHTML = sorted.map((p, idx) => {
    const isAvailable = p.available !== false;
    const statusLabel = isAvailable ? 'موجود' : 'در حال تامین';
    const statusClass = isAvailable ? 'status-on' : 'status-off';

    return `
    <div class="admin-product ${isAvailable ? '' : 'admin-unavailable'}" data-id="${p.id}">
      <img class="admin-product-img" src="${p.image || ''}" alt=""
           onerror="this.style.background='#ddd'; this.src='';">
      <div class="admin-product-body">
        <div class="admin-product-order">ترتیب: ${p.order ?? idx + 1}</div>
        <div class="admin-product-name">${p.name}</div>
        <div class="admin-product-prices">
          واحد: ${formatPrice(p.unitPrice) || '—'}
          ${p.packPrice ? ' | بسته: ' + formatPrice(p.packPrice) : ''}
        </div>
        <div class="admin-product-status ${statusClass}">${statusLabel}</div>
        <div class="admin-product-actions">
          <button class="btn btn-secondary btn-sm" onclick="openEditModal(${p.id})">ویرایش</button>
          <button class="btn ${isAvailable ? 'btn-outline' : 'btn-primary'} btn-sm" onclick="toggleAvailability(${p.id})">
            ${isAvailable ? 'خاموش کردن' : 'روشن کردن'}
          </button>
          <button class="btn btn-outline btn-sm" onclick="moveProduct(${p.id}, -1)">↑</button>
          <button class="btn btn-outline btn-sm" onclick="moveProduct(${p.id}, 1)">↓</button>
          <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">حذف</button>
        </div>
      </div>
    </div>
  `;
  }).join('');
}

function openAddForm() {
  document.getElementById('form-title').textContent = 'افزودن محصول جدید';
  document.getElementById('edit-id').value = '';
  document.getElementById('input-name').value = '';
  document.getElementById('input-unit').value = '';
  document.getElementById('input-pack').value = '';
  document.getElementById('input-image').value = 'images/';
  document.getElementById('input-available').checked = true;
  document.getElementById('form-card').style.display = 'block';
  document.getElementById('input-name').focus();
}

function openEditModal(id) {
  const p = adminProducts.find(x => x.id === id);
  if (!p) return;

  document.getElementById('form-title').textContent = 'ویرایش محصول';
  document.getElementById('edit-id').value = p.id;
  document.getElementById('input-name').value = p.name || '';
  document.getElementById('input-unit').value = p.unitPrice ?? '';
  document.getElementById('input-pack').value = p.packPrice ?? '';
  document.getElementById('input-image').value = p.image || '';
  document.getElementById('input-available').checked = p.available !== false;
  document.getElementById('form-card').style.display = 'block';
  document.getElementById('input-name').focus();
}

function cancelForm() {
  document.getElementById('form-card').style.display = 'none';
}

function saveProduct() {
  const idVal = document.getElementById('edit-id').value;
  const name = document.getElementById('input-name').value.trim();
  const unit = document.getElementById('input-unit').value.trim();
  const pack = document.getElementById('input-pack').value.trim();
  const image = document.getElementById('input-image').value.trim();
  const available = document.getElementById('input-available').checked;

  if (!name) {
    alert('نام محصول الزامی است');
    return;
  }
  if (unit === '' || isNaN(Number(unit))) {
    alert('قیمت واحد را به صورت عدد وارد کنید');
    return;
  }

  const unitPrice = Number(unit);
  const packPrice = (pack === '' || isNaN(Number(pack))) ? null : Number(pack);

  if (idVal) {
    // ویرایش
    const p = adminProducts.find(x => x.id === Number(idVal));
    if (p) {
      p.name = name;
      p.unitPrice = unitPrice;
      p.packPrice = packPrice;
      p.image = image;
      p.available = available;
    }
  } else {
    // جدید
    const maxId = adminProducts.reduce((m, x) => Math.max(m, x.id || 0), 0);
    const maxOrder = adminProducts.reduce((m, x) => Math.max(m, x.order || 0), 0);
    adminProducts.push({
      id: maxId + 1,
      name,
      unitPrice,
      packPrice,
      image,
      order: maxOrder + 1,
      available: available
    });
  }

  cancelForm();
  renderAdminList();
}

/** خاموش / روشن کردن سریع محصول */
function toggleAvailability(id) {
  const p = adminProducts.find(x => x.id === id);
  if (!p) return;
  p.available = !(p.available !== false);
  renderAdminList();
}

function deleteProduct(id) {
  if (!confirm('آیا از حذف این محصول مطمئن هستید؟')) return;
  adminProducts = adminProducts.filter(x => x.id !== id);
  renderAdminList();
}

function moveProduct(id, direction) {
  const sorted = [...adminProducts].sort((a, b) => (a.order || 0) - (b.order || 0));
  const idx = sorted.findIndex(x => x.id === id);
  if (idx < 0) return;

  const newIdx = idx + direction;
  if (newIdx < 0 || newIdx >= sorted.length) return;

  // جابه‌جایی order
  const tempOrder = sorted[idx].order;
  sorted[idx].order = sorted[newIdx].order;
  sorted[newIdx].order = tempOrder;

  // اگر order یکسان بود، مقداردهی مجدد
  sorted.forEach((p, i) => { p.order = i + 1; });

  adminProducts = sorted;
  renderAdminList();
}

/**
 * تولید محتوای فایل products.js و دانلود آن
 */
function downloadProductsFile() {
  // مرتب‌سازی نهایی
  adminProducts.sort((a, b) => (a.order || 0) - (b.order || 0));
  adminProducts.forEach((p, i) => { p.order = i + 1; });

  const content = `// فایل اطلاعات محصولات
// برای تغییر قیمت‌ها یا اضافه کردن محصول، این فایل را ویرایش کنید
// یا از پنل مدیریت (admin.html) استفاده کرده و فایل جدید را دانلود و جایگزین کنید

const products = ${JSON.stringify(adminProducts, null, 2)};
`;

  const blob = new Blob([content], { type: 'application/javascript;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'products.js';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  alert('فایل products.js دانلود شد.\nآن را جایگزین فایل قبلی در پروژه کنید و صفحه را رفرش کنید.');
}
