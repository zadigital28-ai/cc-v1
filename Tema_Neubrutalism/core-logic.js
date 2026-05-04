/**
 * jasa_web/shared/core-logic.js
 * Shared data logic untuk semua tema.
 * Requires: config.js (window.GAS_URL) + React 18 CDN
 * Exports:  window.APP namespace
 */
(function () {
  'use strict';
  const R = window.React;
  const APP = (window.APP = {});

  /* ── CSS var defaults (override dari GAS branding) ── */
  const DEFAULTS = {
    '--color-accent': '#0eeef7',
    '--color-bg': '#f0f4ff',
    '--color-text': '#0a1645',
    '--color-surface': '#ffffff',
    '--color-secondary': '#126bdd',
    '--color-border': '#0a1645',
    '--color-muted': '#64748b',
  };

  /* ── Utilities ── */
  APP.fmt = (n) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(parseInt(String(n || 0).replace(/\D/g, '')) || 0);

  APP.esc = (s) =>
    String(s || '').replace(/[&<>'"]/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c])
    );

  APP.san = (s) => {
    let t = APP.esc(s);
    t = t.replace(/&lt;br&gt;/gi, '<br>').replace(/&lt;b&gt;/gi, '<b>').replace(/&lt;\/b&gt;/gi, '</b>');
    return t.replace(/\n/g, '<br>');
  };

  /* ── Apply theme CSS vars dari GAS branding ── */
  APP.applyTheme = function (b) {
    const root = document.documentElement;
    // Set defaults first
    Object.entries(DEFAULTS).forEach(([k, v]) => root.style.setProperty(k, v));
    // Override dengan nilai dari GAS
    const map = {
      color_accent: '--color-accent',
      color_bg: '--color-bg',
      color_text: '--color-text',
      color_surface: '--color-surface',
      color_secondary: '--color-secondary',
      color_border: '--color-border',
      color_muted: '--color-muted',
    };
    Object.entries(map).forEach(([key, cssVar]) => {
      if (b[key]) root.style.setProperty(cssVar, b[key]);
    });
    // Update meta title & favicon
    if (b.brand_name) document.title = b.brand_name;
    if (b.seo_title) document.title = b.seo_title;
    if (b.favicon_url) {
      let fav = document.getElementById('favicon');
      if (!fav) { fav = document.createElement('link'); fav.rel = 'icon'; fav.id = 'favicon'; document.head.appendChild(fav); }
      fav.href = b.favicon_url;
    }
  };

  /* ── React Context ── */
  APP.Ctx = R.createContext(null);
  APP.useStore = () => R.useContext(APP.Ctx);

  /* ── Cart hook ── */
  APP.useCart = function (waNumber, waGreeting) {
    const [cart, setCart] = R.useState([]);

    const getPrice = (item) => parseInt(String(item.harga || '0').replace(/\D/g, '')) || 0;

    const add = (item) => {
      const hideQty = (item.sembunyikan_qty || '').toLowerCase() === 'ya';
      setCart((prev) => {
        const ex = prev.find((c) => c.id === item.nama_produk);
        if (ex) return prev.map((c) => c.id === item.nama_produk ? { ...c, qty: hideQty ? 1 : c.qty + 1 } : c);
        return [...prev, { id: item.nama_produk, item, qty: 1, hideQty }];
      });
    };

    const remove = (id) => setCart((p) => p.filter((c) => c.id !== id));

    const setQty = (id, qty) => {
      if (qty <= 0) return remove(id);
      setCart((p) => p.map((c) => (c.id === id ? { ...c, qty } : c)));
    };

    const clear = () => setCart([]);

    const total = cart.reduce((s, c) => s + getPrice(c.item) * c.qty, 0);
    const count = cart.reduce((s, c) => s + c.qty, 0);

    const checkout = () => {
      if (!cart.length) return;
      let msg = `${waGreeting || 'Halo, saya ingin order:'}\n\n`;
      cart.forEach((c, i) => {
        const sub = getPrice(c.item) * c.qty;
        msg += `${i + 1}. ${c.item.nama_produk}${c.hideQty ? '' : ` x${c.qty}`} = ${APP.fmt(sub)}\n`;
      });
      msg += `\n*Total: ${APP.fmt(total)}*\n\nMohon konfirmasi. Terima kasih!`;
      const num = (waNumber || '').replace(/\D/g, '');
      if (!num) { alert('Nomor WhatsApp belum diatur pemilik toko.'); return; }
      window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    return { cart, add, remove, setQty, clear, total, count, checkout };
  };

  /* ── Loading component (React.createElement, no JSX) ── */
  APP.Loading = function () {
    return R.createElement('div', {
      style: {
        position: 'fixed', inset: 0, background: 'var(--color-bg, #f0f4ff)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', zIndex: 9999,
      }
    },
      R.createElement('style', null, '@keyframes spin{to{transform:rotate(360deg)}}'),
      R.createElement('div', {
        style: {
          width: 48, height: 48, border: '5px solid var(--color-accent, #0eeef7)',
          borderTopColor: 'transparent', borderRadius: '50%',
          animation: 'spin .8s linear infinite',
        }
      }),
      R.createElement('p', {
        style: { marginTop: 16, fontWeight: 700, color: 'var(--color-text, #0a1645)', fontSize: 14 }
      }, 'Memuat data...')
    );
  };

  /* ── Error component ── */
  APP.ErrorScreen = function ({ msg }) {
    return R.createElement('div', {
      style: {
        position: 'fixed', inset: 0, background: 'var(--color-bg, #f0f4ff)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', zIndex: 9999, padding: 24, textAlign: 'center',
      }
    },
      R.createElement('div', { style: { fontSize: 48 } }, '⚠️'),
      R.createElement('h2', { style: { marginTop: 12, color: 'var(--color-text)' } }, 'Koneksi Gagal'),
      R.createElement('p', { style: { color: '#64748b', margin: '8px 0 4px' } }, 'Tidak dapat terhubung ke Google Sheets.'),
      R.createElement('p', { style: { fontSize: 11, color: '#94a3b8', marginBottom: 20 } }, msg),
      R.createElement('button', {
        onClick: () => location.reload(),
        style: {
          padding: '12px 28px', background: 'var(--color-accent)', border: '2px solid var(--color-text)',
          fontWeight: 800, cursor: 'pointer', borderRadius: 8, boxShadow: '3px 3px 0 var(--color-text)',
          fontSize: 14, textTransform: 'uppercase',
        }
      }, 'Coba Lagi')
    );
  };

  /* ── Main data fetch ── */
  APP.fetchAll = () =>
    fetch(`${window.GAS_URL}?type=all`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); });

})();
