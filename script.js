(() => {
  const PRICE = 13.9;
  const WA = "51923801883";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const header = $("#header");
  const mobileNav = $("[data-mobile-nav]");
  const qtyInput = $("[data-qty-input]");
  const drawer = $("[data-cart-drawer]");
  const overlay = $("[data-cart-overlay]");
  const brand = $("#brand-fly");
  const navSlot = $("#nav-logo-slot");
  const product = $("#hero-product");
  const hero = $("#inicio");
  const year = $("[data-year]");
  const video = $(".hero-video");

  let qtyCart = 0;
  if (year) year.textContent = String(new Date().getFullYear());

  /* Ensure video plays */
  if (video) {
    video.muted = true;
    video.play().catch(() => {});
  }

  /* Mobile menu */
  $("[data-menu-toggle]")?.addEventListener("click", () => {
    const open = mobileNav?.hasAttribute("hidden");
    if (open) mobileNav.removeAttribute("hidden");
    else mobileNav.setAttribute("hidden", "");
  });
  $$( "a", mobileNav || document.createElement("div")).forEach((a) =>
    a.addEventListener("click", () => mobileNav?.setAttribute("hidden", ""))
  );

  /* Reveal */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* Enjoy: una imagen completa por tramo de scroll */
  const enjoySection = $("[data-enjoy-scroll]");
  const enjoySlides = $$("[data-enjoy-slide]", enjoySection || document);
  const enjoyBar = $("[data-enjoy-bar]");
  let enjoyIndex = -1;

  const updateEnjoyScroll = () => {
    if (!enjoySection || !enjoySlides.length) return;
    const rect = enjoySection.getBoundingClientRect();
    const total = Math.max(1, enjoySection.offsetHeight - window.innerHeight);
    const scrolled = clamp(-rect.top, 0, total);
    const p = scrolled / total;
    const next = Math.min(
      enjoySlides.length - 1,
      Math.floor(p * enjoySlides.length)
    );

    if (next !== enjoyIndex) {
      enjoySlides.forEach((slide, i) => {
        slide.classList.toggle("is-leave", i === enjoyIndex);
        slide.classList.toggle("is-on", i === next);
        if (i !== enjoyIndex && i !== next) {
          slide.classList.remove("is-leave");
        }
      });
      enjoyIndex = next;
    }

    if (enjoyBar) enjoyBar.style.width = `${p * 100}%`;
  };

  /* ========= Collider-like: nombre gigante → navbar ========= */
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => 1 - Math.pow(1 - t, 3);

  const glass = $("#hero-glass");
  const glassCards = $$("[data-card]");
  const tagline = $("[data-tagline]");
  // Orden de aparición al scrollear (después de que el título llega)
  const cardThresholds = [0.42, 0.52, 0.62, 0.72];

  const updateBrandFly = () => {
    if (!brand || !navSlot || !hero) return;

    // Progreso lineal del pin sticky
    const max = Math.max(1, hero.offsetHeight - window.innerHeight);
    const p = clamp(window.scrollY / max, 0, 1);

    // Primera parte del scroll: solo vuela el título (~40%)
    const t = ease(clamp(p / 0.4, 0, 1));

    const isMobile = window.innerWidth < 760;
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight * (isMobile ? 0.15 : 0.12);
    const startSize = isMobile
      ? Math.min(window.innerWidth * 0.148, 64)
      : Math.min(window.innerWidth * 0.155, 168);

    const slot = navSlot.getBoundingClientRect();
    const endX = slot.left + slot.width / 2;
    const endY = slot.top + slot.height / 2;
    const endSize = 15;

    const x = lerp(startX, endX, t);
    const y = lerp(startY, endY, t);
    const size = lerp(startSize, endSize, t);

    const startA = 0.62;
    const endA = 1;
    const a = lerp(startA, endA, Math.min(t * 1.4, 1));

    // Se mantiene cream → blanco (navbar glass), no verde sólido
    const r = Math.round(lerp(255, 255, t));
    const g = Math.round(lerp(244, 255, t));
    const b = Math.round(lerp(214, 255, t));

    brand.style.fontSize = `${size}px`;
    brand.style.color = `rgba(${r}, ${g}, ${b}, ${a})`;
    brand.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    brand.style.textShadow = "0 1px 10px rgba(0,0,0,.4)";
    brand.classList.toggle("is-flying", t > 0.08 && t < 0.97);

    const docked = t >= 0.96;
    brand.classList.toggle("is-docked", docked);
    header?.classList.toggle("logo-docked", docked);
    header?.classList.toggle("is-visible", t > 0.88);
    // En secciones claras (después del hero) el glass usa texto más oscuro
    header?.classList.toggle("on-light", window.scrollY > max + window.innerHeight * 0.15);

    // Layout glass listo cuando el título ya casi llega
    const reveal = p > 0.36;
    hero.classList.toggle("is-revealed", reveal);
    if (glass) glass.setAttribute("aria-hidden", reveal ? "false" : "true");

    // Cards una por una mientras sigue el scroll
    glassCards.forEach((card) => {
      const i = Number(card.getAttribute("data-card")) || 0;
      const on = p >= cardThresholds[i];
      card.classList.toggle("is-on", on);
    });
    tagline?.classList.toggle("is-on", p >= 0.82);

    // Frasco: movimiento lento en todo el pin
    if (product) {
      const jarY = p * 36;
      product.style.transform = `translateY(${jarY}px)`;
      product.style.opacity = "1";
    }
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateBrandFly();
      updateEnjoyScroll();
      ticking = false;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    updateBrandFly();
    updateEnjoyScroll();
  });
  updateBrandFly();
  updateEnjoyScroll();

  /* Qty */
  const clampQty = (n) => Math.min(20, Math.max(1, Number(n) || 1));
  $("[data-qty-minus]")?.addEventListener("click", () => {
    if (qtyInput) qtyInput.value = String(clampQty(Number(qtyInput.value) - 1));
  });
  $("[data-qty-plus]")?.addEventListener("click", () => {
    if (qtyInput) qtyInput.value = String(clampQty(Number(qtyInput.value) + 1));
  });
  qtyInput?.addEventListener("change", () => {
    qtyInput.value = String(clampQty(qtyInput.value));
  });

  /* Cart */
  const money = (n) =>
    `S/ ${n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const updateCart = () => {
    const empty = qtyCart <= 0;
    $("[data-cart-empty]")?.toggleAttribute("hidden", !empty);
    $("[data-cart-item]")?.toggleAttribute("hidden", empty);
    $("[data-cart-foot]")?.toggleAttribute("hidden", empty);

    const count = $("[data-cart-count]");
    if (count) count.textContent = String(qtyCart);

    const units = $("[data-cart-units]");
    if (units) {
      units.textContent = empty
        ? "0 frascos"
        : `${qtyCart} ${qtyCart === 1 ? "frasco" : "frascos"}`;
    }

    const q = $("[data-cart-qty]");
    if (q) q.textContent = String(qtyCart);

    const total = $("[data-cart-total]");
    if (total) total.textContent = money(qtyCart * PRICE);

    const wa = $("[data-whatsapp-order]");
    if (wa) {
      const msg = encodeURIComponent(
        `Hola CAMU VIVO 👋\nQuiero pedir:\n• Mermelada de camu camu 240 g\n• Cantidad: ${qtyCart}\n• Total: ${money(qtyCart * PRICE)}`
      );
      wa.href = `https://wa.me/${WA}?text=${msg}`;
    }
  };

  const openCart = () => {
    drawer?.classList.add("open");
    drawer?.setAttribute("aria-hidden", "false");
    overlay?.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
  };
  const closeCart = () => {
    drawer?.classList.remove("open");
    drawer?.setAttribute("aria-hidden", "true");
    overlay?.setAttribute("hidden", "");
    document.body.style.overflow = "";
  };

  $$("[data-cart-open]").forEach((b) => b.addEventListener("click", openCart));
  $$("[data-cart-close]").forEach((b) => b.addEventListener("click", closeCart));
  overlay?.addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCart();
  });

  $("[data-scroll-product]")?.addEventListener("click", () => {
    closeCart();
    $("#producto")?.scrollIntoView({ behavior: "smooth" });
  });

  $$("[data-add-cart]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const fromBtn = Number(btn.getAttribute("data-qty"));
      const add = clampQty(
        Number.isFinite(fromBtn) && fromBtn > 0 ? fromBtn : qtyInput?.value || 1
      );
      qtyCart = clampQty(qtyCart + add);
      updateCart();
      openCart();
    });
  });

  $("[data-cart-minus]")?.addEventListener("click", () => {
    qtyCart = Math.max(0, qtyCart - 1);
    updateCart();
  });
  $("[data-cart-plus]")?.addEventListener("click", () => {
    qtyCart = clampQty(qtyCart + 1);
    updateCart();
  });
  $("[data-cart-remove]")?.addEventListener("click", () => {
    qtyCart = 0;
    updateCart();
  });

  updateCart();

  /* Lucide icons */
  if (window.lucide?.createIcons) {
    window.lucide.createIcons();
  }
})();
