// فایل اطلاعات محصولات
// برای تغییر قیمت‌ها یا اضافه کردن محصول، این فایل را ویرایش کنید
// یا از پنل مدیریت (admin.html) استفاده کرده و فایل جدید را دانلود و جایگزین کنید

const products = [
  {
    id: 1,
    name: "لوبیا چیتی",
    unitPrice: 200000,
    packPrice: 1000000,  // اختیاری - اگر null باشد نمایش داده نمی‌شود
    image: "images/lobia.jpg",
    order: 1,
    available: true       // true = موجود | false = در حال تامین
  },
  {
    id: 2,
    name: "نخود",
    unitPrice: 180000,
    packPrice: 900000,
    image: "images/nohood.jpg",
    order: 2,
    available: true
  },
  {
    id: 3,
    name: "عدس",
    unitPrice: 220000,
    packPrice: null,  // فقط قیمت واحد
    image: "images/adas.jpg",
    order: 3,
    available: false  // نمونه: در حال تامین
  }
];
