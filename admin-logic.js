/**
 * jasa_web/shared/admin-logic.js
 * Logika CRUD untuk Admin Dashboard semua tema.
 * Requires: config.js (window.GAS_URL)
 * Exports:  window.ADMIN namespace
 */
(function () {
  'use strict';
  const ADMIN = (window.ADMIN = {});

  /* ── Sheet yang TIDAK ditampilkan di admin ── */
  ADMIN.EXCLUDED_SHEETS = ['Panduan', 'panduan', 'PANDUAN'];

  /* ── Label human-readable untuk field Branding ── */
  ADMIN.LABEL_MAP = {
    brand_name:      'Nama Brand / Toko',
    logo_url:        'URL Logo (link gambar)',
    wa_number:       'Nomor WhatsApp (contoh: 628123456789)',
    wa_greeting:     'Pesan Pembuka WhatsApp',
    color_accent:    'Warna Aksen — tombol & highlight (hex, contoh: #0eeef7)',
    color_bg:        'Warna Latar Halaman (hex, contoh: #f0f4ff)',
    color_text:      'Warna Teks Utama (hex, contoh: #0a1645)',
    color_surface:   'Warna Kartu / Panel (hex, contoh: #ffffff)',
    color_secondary: 'Warna Sekunder (hex, contoh: #126bdd)',
    color_border:    'Warna Border (hex, contoh: #0a1645)',
    hero_title:      'Judul Utama Halaman (Heading H1)',
    hero_subtitle:   'Tagline / Deskripsi Singkat di bawah judul',
    hero_image:      'URL Gambar Banner / Promosi',
    footer_text:     'Teks di bagian bawah halaman (Footer)',
    seo_title:       'Judul Tab Browser (SEO)',
    ig_url:          'Link Instagram',
    tiktok_url:      'Link TikTok',
    shopee_url:      'Link Toko Shopee',
    facebook_url:    'Link Facebook',
    youtube_url:     'Link YouTube',
    admin_password:  'Password Admin (untuk keamanan)',
  };

  /* ── Tipe input otomatis berdasarkan nama field ── */
  ADMIN.getFieldType = function (key) {
    const k = key.toLowerCase();
    if (/harga|price|biaya/.test(k)) return 'number';
    if (/url|link|foto|image|img|logo/.test(k)) return 'url';
    if (/deskripsi|desc|catatan|isi|jawaban|body|subtitle|tagline/.test(k)) return 'textarea';
    if (/stok/.test(k)) return 'select-stok';
    if (/badge/.test(k)) return 'select-badge';
    if (/password|pass/.test(k)) return 'password';
    if (/color|warna/.test(k)) return 'color-hex';
    return 'text';
  };

  /* ── Helper: POST ke GAS ── */
  const post = (body) =>
    fetch(window.GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(body),
    }).then((r) => r.json());

  /* ── Helper: GET dari GAS ── */
  const get = (params) =>
    fetch(`${window.GAS_URL}?${new URLSearchParams(params).toString()}`).then((r) => r.json());

  /* ── Ambil daftar semua sheet (minus EXCLUDED) ── */
  ADMIN.fetchSheets = () =>
    get({ type: 'sheets' }).then((sheets) =>
      sheets.filter((s) => !ADMIN.EXCLUDED_SHEETS.includes(s))
    );

  /* ── Ambil data lengkap satu sheet ── */
  ADMIN.fetchData = (sheet) => get({ type: 'data', sheet });

  /* ── Ambil Branding sebagai key-value ── */
  ADMIN.fetchBranding = () => get({ type: 'branding' });

  /* ── CRUD ── */
  ADMIN.addRow    = (sheet, data)              => post({ action: 'add', sheet, data });
  ADMIN.updateRow = (sheet, rowIndex, data)    => post({ action: 'update', sheet, rowIndex, data });
  ADMIN.deleteRow = (sheet, rowIndex)          => post({ action: 'delete', sheet, rowIndex });
  ADMIN.updateBranding = (data)               => post({ action: 'update_branding', data });

  /**
   * buildFormFields(headers, values)
   * Untuk sheet biasa (bukan Branding).
   */
  ADMIN.buildFormFields = function (headers, values = {}) {
    return headers.map((h) => {
      const key   = h.trim();
      const label = ADMIN.LABEL_MAP[key.toLowerCase()] || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const type  = ADMIN.getFieldType(key);
      return { key, label, type, value: values[h] || '' };
    });
  };

  /**
   * buildBrandingFields(brandingObj)
   * Untuk sheet Branding — key adalah label, value adalah input.
   * Key TIDAK bisa diubah. Return: [{key, label, type, value}]
   */
  ADMIN.buildBrandingFields = function (brandingObj) {
    return Object.entries(brandingObj).map(([key, value]) => ({
      key,
      label: ADMIN.LABEL_MAP[key.toLowerCase()] || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      type:  ADMIN.getFieldType(key),
      value: value || '',
    }));
  };

})();
