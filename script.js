/* =========================================================
   TECHFUSION TOOLS
   COMPLETE WEBSITE SCRIPT
   ========================================================= */

const CONFIG = {
  WHATSAPP_NUMBER: "919667095547",
  HERO_DURATION: 7000,
  HERO_TRANSITION: 850
};


/* =========================================================
   GLOBAL STATE
========================================================= */

const state = {
  products: [],
  filter: "all",
  query: ""
};

let currentProduct = null;


/* =========================================================
   HELPERS
========================================================= */

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => [
  ...document.querySelectorAll(selector)
];

function esc(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[character])
  );
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .trim();
}

function productImage(product) {
  if (product?.image) {
    return product.image;
  }

  if (product?.page) {
    return `assets/product-images/page-${String(
      product.page
    ).padStart(2, "0")}.png`;
  }

  return "assets/placeholder.jpg";
}


/* =========================================================
   ADMIN PRODUCTS
========================================================= */

function getCustomProducts() {
  try {
    return JSON.parse(
      localStorage.getItem(
        "techfusion_admin_products"
      ) || "[]"
    );
  } catch (error) {
    console.warn(
      "Could not read admin products:",
      error
    );

    return [];
  }
}


/* =========================================================
   MERGE PRODUCTS
========================================================= */

function mergeProducts(baseProducts) {
  const customProducts =
    getCustomProducts();

  const map = new Map(
    baseProducts.map(product => [
      String(product.id),
      product
    ])
  );

  customProducts.forEach(product => {
    map.set(
      String(product.id),
      product
    );
  });

  return [...map.values()];
}


/* =========================================================
   FIND PRODUCT
========================================================= */

function findProduct(id) {
  return state.products.find(
    product =>
      String(product.id) === String(id)
  );
}


/* =========================================================
   FILTER PRODUCTS
========================================================= */

function filtered() {
  let products = [...state.products];

  if (state.filter !== "all") {
    products = products.filter(
      product =>
        normalize(product.category) ===
        normalize(state.filter)
    );
  }

  if (state.query) {
    const query =
      normalize(state.query);

    products = products.filter(product => {
      const searchableText = [
        product.model,
        product.title,
        product.category,
        product.description,
        ...(product.specs || [])
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }

  return products;
}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts() {
  const grid = $("#productGrid");
  const empty = $("#emptyState");
  const count = $("#productCount");

  if (!grid) {
    return;
  }

  const products = filtered();

  if (count) {
    count.textContent =
      `${products.length} product${
        products.length === 1 ? "" : "s"
      } available`;
  }

  if (!products.length) {
    grid.innerHTML = "";

    if (empty) {
      empty.hidden = false;
    }

    return;
  }

  if (empty) {
    empty.hidden = true;
  }

  grid.innerHTML = products
    .map((product, index) => {

      const name =
        product.model ||
        product.title ||
        "Product Model";

      return `
        <article
          class="product-card premium-product-card reveal visible"
          data-id="${esc(product.id)}"
          style="
            --card-index:${index};
            transition-delay:${Math.min(
              index * 22,
              300
            )}ms;
          "
        >

          <div class="product-card-border"></div>

          <div class="product-media premium-product-media">

            <div class="product-image-glow"></div>
            <div class="product-image-ring"></div>

            <img
              src="${esc(productImage(product))}"
              alt="${esc(name)}"
              loading="lazy"
              onerror="
                this.onerror=null;
                this.src='assets/placeholder.jpg';
              "
            >

          </div>

          <div class="product-body premium-product-body">

            <span class="category product-category">
              ${esc(
                product.category ||
                "Professional Tool"
              )}
            </span>

            <h3 class="premium-product-title">
              ${esc(name)}
            </h3>

            <div class="card-actions premium-card-actions">

              <button
                class="request premium-price-btn"
                type="button"
                data-quote="${esc(product.id)}"
                aria-label="Get best price for ${esc(name)}"
              >
                <span>GET BEST PRICE</span>
                <b>↗</b>
              </button>

              <button
                class="wa premium-details-btn"
                type="button"
                data-details="${esc(product.id)}"
                aria-label="View details for ${esc(name)}"
              >
                <span>VIEW DETAILS</span>
                <b>+</b>
              </button>

            </div>

          </div>

        </article>
      `;
    })
    .join("");

  $$("[data-quote]").forEach(button => {
    button.addEventListener(
      "click",
      event => {
        event.preventDefault();
        event.stopPropagation();

        const product =
          findProduct(button.dataset.quote);

        if (product) {
          openQuote(product);
        }
      }
    );
  });

  $$("[data-details]").forEach(button => {
    button.addEventListener(
      "click",
      event => {
        event.preventDefault();
        event.stopPropagation();

        const product =
          findProduct(button.dataset.details);

        if (product) {
          openProduct(product);
        }
      }
    );
  });

  $$(".premium-product-card").forEach(card => {
    card.addEventListener(
      "click",
      event => {

        if (
          event.target.closest("button")
        ) {
          return;
        }

        const product =
          findProduct(card.dataset.id);

        if (product) {
          openProduct(product);
        }
      }
    );
  });
}


/* =========================================================
   FILTER
========================================================= */

function setFilter(value) {
  state.filter = value || "all";

  $$("#filters .filter").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.filter === state.filter
    );
  });

  renderProducts();
}


/* =========================================================
   WHATSAPP PRODUCT
========================================================= */

function whatsapp(product) {
  const message = product
    ? `Hello TechFusion Tools,

I would like a quotation for:

Model: ${product.model || ""}

Product: ${product.title || ""}

Please share price, availability and delivery details.`
    : `Hello TechFusion Tools,

I would like to know more about your products and request a quotation.`;

  const url =
    `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${
      encodeURIComponent(message)
    }`;

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );
}


/* =========================================================
   OPEN PRODUCT MODAL
========================================================= */

function openProduct(product) {
  if (!product) {
    return;
  }

  currentProduct = product;

  const category = $("#modalCategory");
  const model = $("#modalModel");
  const title = $("#modalTitle");
  const image = $("#modalImg");
  const specs = $("#modalSpecs");

  if (category) {
    category.textContent =
      product.category ||
      "Professional Tool";
  }

  if (model) {
    model.textContent =
      product.model ||
      "Product Model";
  }

  if (title) {
    title.textContent =
      product.title || "";
  }

  if (image) {
    image.src =
      productImage(product);

    image.alt =
      product.model ||
      "TechFusion Product";
  }

  if (specs) {
    const productSpecs =
      product.specs || [];

    specs.innerHTML =
      productSpecs.length
        ? productSpecs
            .map(
              specification => `
                <div>
                  ✓ ${esc(specification)}
                </div>
              `
            )
            .join("")
        : `
            <div>✓ Professional quality</div>
            <div>✓ Price available on request</div>
            <div>✓ Contact TechFusion Tools</div>
          `;
  }

  const modal =
    $("#productModal");

  if (!modal) {
    return;
  }

  modal.classList.add("open");

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.style.overflow =
    "hidden";
}


/* =========================================================
   OPEN QUOTE
========================================================= */

function openQuote(product = null) {
  currentProduct =
    product || currentProduct;

  const productField =
    $("#qProduct");

  if (productField) {
    productField.value =
      currentProduct
        ? `${currentProduct.model || ""}${
            currentProduct.title
              ? " — " +
                currentProduct.title
              : ""
          }`
        : "";
  }

  const modal =
    $("#quoteModal");

  if (!modal) {
    return;
  }

  modal.classList.add("open");

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.style.overflow =
    "hidden";

  setTimeout(() => {
    $("#qName")?.focus();
  }, 100);
}


/* =========================================================
   CLOSE MODALS
========================================================= */

function closeAll() {
  $$(".modal").forEach(modal => {
    modal.classList.remove("open");

    modal.setAttribute(
      "aria-hidden",
      "true"
    );
  });

  document.body.style.overflow = "";
}


/* =========================================================
   SEND QUOTE
========================================================= */

function sendQuote(event) {
  event.preventDefault();

  const name =
    $("#qName")?.value.trim() || "";

  const company =
    $("#qCompany")?.value.trim() || "";

  const contact =
    $("#qContact")?.value.trim() || "";

  const product =
    $("#qProduct")?.value.trim() || "";

  const quantity =
    $("#qQty")?.value.trim() || "";

  const message =
    $("#qMessage")?.value.trim() || "";

  const whatsappMessage =
    `Hello TechFusion Tools,

I would like a quotation.

Name: ${name}

Company: ${company}

Contact: ${contact}

Product / Model: ${product}

Quantity: ${quantity}

Requirement: ${message}`;

  const url =
    `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${
      encodeURIComponent(
        whatsappMessage
      )
    }`;

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );

  closeAll();
}


/* =========================================================
   MAIN WHATSAPP
========================================================= */

function setupMainWhatsApp() {
  const buttons = [
    $("#mainWhatsApp"),
    $("#contactWhatsApp")
  ];

  const message =
    "Hello TechFusion Tools, I would like to know more about your products and request a quotation.";

  const url =
    `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${
      encodeURIComponent(message)
    }`;

  buttons
    .filter(Boolean)
    .forEach(button => {
      button.href = url;
      button.target = "_blank";
      button.rel =
        "noopener noreferrer";
    });
}


/* =========================================================
   MOBILE MENU
========================================================= */

function setupMobileMenu() {
  const menuButton =
    $("#menuBtn");

  const navigation =
    $("#navLinks");

  if (
    !menuButton ||
    !navigation
  ) {
    return;
  }

  menuButton.addEventListener(
    "click",
    () => {
      const isOpen =
        navigation.classList.toggle(
          "open"
        );

      menuButton.setAttribute(
        "aria-expanded",
        isOpen ? "true" : "false"
      );
    }
  );

  $$("#navLinks a").forEach(link => {
    link.addEventListener(
      "click",
      () => {
        navigation.classList.remove(
          "open"
        );

        menuButton.setAttribute(
          "aria-expanded",
          "false"
        );
      }
    );
  });
}


/* =========================================================
   HEADER HEIGHT
========================================================= */

function getHeaderHeight() {
  const header =
    $(".header");

  if (!header) {
    return 0;
  }

  return header
    .getBoundingClientRect()
    .height;
}


/* =========================================================
   SCROLL TO SECTION
========================================================= */

function scrollToSection(
  target,
  updateHash = true,
  behavior = "smooth"
) {
  if (!target) {
    return;
  }

  const headerHeight =
    getHeaderHeight();

  const gap = 10;

  let targetTop =
    target.getBoundingClientRect().top +
    window.scrollY -
    headerHeight -
    gap;

  if (target.id === "home") {
    targetTop = 0;
  }

  window.scrollTo({
    top: Math.max(
      0,
      targetTop
    ),
    behavior
  });

  if (
    updateHash &&
    target.id
  ) {
    history.replaceState(
      null,
      "",
      `#${target.id}`
    );
  }
}


/* =========================================================
   NAVIGATION SCROLL
========================================================= */

function setupNavigationScroll() {
  document.addEventListener(
    "click",
    event => {

      const link =
        event.target.closest(
          'a[href^="#"]'
        );

      if (!link) {
        return;
      }

      const href =
        link.getAttribute("href");

      if (
        !href ||
        href === "#"
      ) {
        return;
      }

      let target = null;

      try {
        target =
          document.querySelector(
            href
          );
      } catch (error) {
        return;
      }

      if (!target) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      scrollToSection(
        target,
        true,
        "smooth"
      );

      const navigation =
        $("#navLinks");

      const menuButton =
        $("#menuBtn");

      if (navigation) {
        navigation.classList.remove(
          "open"
        );
      }

      if (menuButton) {
        menuButton.setAttribute(
          "aria-expanded",
          "false"
        );
      }
    },
    true
  );
}


/* =========================================================
   DIRECT NAV LINKS
========================================================= */

function setupDirectNavLinks() {
  const navigation =
    $("#navLinks");

  if (!navigation) {
    return;
  }

  $$("#navLinks a[href^='#']")
    .forEach(link => {
      link.addEventListener(
        "click",
        () => {
          navigation.classList.remove(
            "open"
          );
        }
      );
    });
}


/* =========================================================
   INITIAL HASH FIX
========================================================= */

function handleInitialHash() {
  const hash =
    window.location.hash;

  if (!hash) {
    return;
  }

  let target = null;

  try {
    target =
      document.querySelector(
        hash
      );
  } catch (error) {
    return;
  }

  if (!target) {
    return;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      scrollToSection(
        target,
        false,
        "auto"
      );
    });
  });
}


/* =========================================================
   CATEGORY CARDS
========================================================= */

function setupCategoryCards() {
  $$(".category-card")
    .forEach(card => {

      card.addEventListener(
        "click",
        () => {

          const category =
            card.dataset.category;

          const supportedCategories = [
            "Soldering Solutions",
            "SMD Rework Solutions",
            "2-in-1 Stations",
            "Electronics Repair Tools",
            "Industrial Tools & Equipment"
          ];

          if (
            supportedCategories.includes(
              category
            )
          ) {
            setFilter(category);

            const products =
              $("#products");

            if (products) {
              setTimeout(() => {
                scrollToSection(
                  products,
                  false,
                  "smooth"
                );
              }, 30);
            }

          } else {
            state.filter = "all";
            renderProducts();

            const products =
              $("#products");

            if (products) {
              scrollToSection(
                products,
                false,
                "smooth"
              );
            }
          }
        }
      );
    });
}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {
  const input =
    $("#searchInput");

  if (!input) {
    return;
  }

  input.addEventListener(
    "input",
    event => {
      state.query =
        event.target.value.trim();

      renderProducts();
    }
  );
}


/* =========================================================
   FILTER BUTTONS
========================================================= */

function setupFilters() {
  $$("#filters .filter")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {
          setFilter(
            button.dataset.filter
          );
        }
      );
    });
}


/* =========================================================
   MODALS
========================================================= */

function setupModals() {

  $$("[data-close]")
    .forEach(button => {

      button.addEventListener(
        "click",
        closeAll
      );
    });

  $("#quoteBtn")
    ?.addEventListener(
      "click",
      () => {
        openQuote();
      }
    );

  $("#modalQuote")
    ?.addEventListener(
      "click",
      () => {

        closeAll();

        openQuote(
          currentProduct
        );
      }
    );

  $("#modalWhatsApp")
    ?.addEventListener(
      "click",
      () => {
        whatsapp(
          currentProduct
        );
      }
    );

  $("#quoteForm")
    ?.addEventListener(
      "submit",
      sendQuote
    );

  $$(".modal").forEach(modal => {

    modal.addEventListener(
      "click",
      event => {

        if (
          event.target === modal
        ) {
          closeAll();
        }

      }
    );
  });

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape"
      ) {
        closeAll();
      }

    }
  );
}


/* =========================================================
   REVEAL ANIMATION
========================================================= */

function setupReveal() {

  if (
    !("IntersectionObserver" in window)
  ) {
    $$(".reveal")
      .forEach(element =>
        element.classList.add(
          "visible"
        )
      );

    return;
  }

  const observer =
    new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if (
            entry.isIntersecting
          ) {

            entry.target.classList.add(
              "visible"
            );

            observer.unobserve(
              entry.target
            );
          }

        });

      },
      {
        threshold: 0.08
      }
    );

  $$(".reveal")
    .forEach(element =>
      observer.observe(
        element
      )
    );
}


/* =========================================================
   CURSOR GLOW
========================================================= */

function setupPointer() {
  const glow =
    $("#cursorGlow");

  if (!glow) {
    return;
  }

  if (
    window.matchMedia(
      "(pointer: coarse)"
    ).matches
  ) {
    return;
  }

  window.addEventListener(
    "pointermove",
    event => {

      glow.style.transform =
        `translate3d(
          ${event.clientX - 170}px,
          ${event.clientY - 170}px,
          0
        )`;
    },
    {
      passive: true
    }
  );
}


/* =========================================================
   SCROLL PROGRESS
========================================================= */

function updateProgress() {
  const progress =
    $("#progress");

  if (!progress) {
    return;
  }

  const maxScroll =
    document.documentElement
      .scrollHeight -
    window.innerHeight;

  const percentage =
    maxScroll > 0
      ? (
          window.scrollY /
          maxScroll
        ) * 100
      : 0;

  progress.style.width =
    `${Math.min(
      100,
      Math.max(
        0,
        percentage
      )
    )}%`;
}

window.addEventListener(
  "scroll",
  updateProgress,
  {
    passive: true
  }
);


/* =========================================================
   LOGO INTRO
========================================================= */

function setupLogoIntro() {
  const intro =
    $("#logoIntro");

  if (!intro) {
    return;
  }

  setTimeout(
    () => {

      intro.classList.add(
        "hide"
      );

      setTimeout(
        () => {
          intro.remove();
        },
        700
      );

    },
    2800
  );
}


/* =========================================================
   =========================================================
   HERO SLIDER
   =========================================================
   IMPORTANT:
   - 6 slides supported
   - 7 seconds
   - percentage based transform
   - no fixed pixel calculation
   - no image blanking
   - proper resize
   - proper touch swipe
   =========================================================
========================================================= */

function setupHeroSlider() {

  const slider =
    document.querySelector(
      ".hero-slider"
    );

  const track =
    document.getElementById(
      "heroSliderTrack"
    );

  if (
    !slider ||
    !track
  ) {
    return;
  }

  const slides =
    Array.from(
      slider.querySelectorAll(
        ".hero-slide"
      )
    );

  const dots =
    Array.from(
      slider.querySelectorAll(
        ".hero-dot"
      )
    );

  const nextButton =
    document.getElementById(
      "heroNext"
    );

  const prevButton =
    document.getElementById(
      "heroPrev"
    );

  const progressBar =
    document.getElementById(
      "heroProgressBar"
    );

  if (!slides.length) {
    return;
  }


  /* -------------------------------------------------------
     SETTINGS
  ------------------------------------------------------- */

  const DURATION =
    Number(CONFIG.HERO_DURATION) || 7000;

  const TRANSITION =
    Number(CONFIG.HERO_TRANSITION) || 850;


  /* -------------------------------------------------------
     STATE
  ------------------------------------------------------- */

  let current = 0;
  let timer = null;
  let progressFrame = null;

  let isAnimating = false;
  let isPaused = false;

  let touchStartX = 0;
  let touchStartY = 0;

  let resizeTimer = null;


  /* -------------------------------------------------------
     IMPORTANT SLIDER CSS OVERRIDES
     
     We intentionally use percentage width.
     This prevents:
       - blank slides
       - wrong pixel calculation
       - partial images
       - random jumping
       - resize problems
  ------------------------------------------------------- */

  track.style.display = "flex";
  track.style.width = "100%";
  track.style.height = "100%";
  track.style.margin = "0";
  track.style.padding = "0";
  track.style.willChange = "transform";

  slides.forEach(slide => {
    slide.style.flex =
      "0 0 100%";

    slide.style.width =
      "100%";

    slide.style.minWidth =
      "100%";

    slide.style.maxWidth =
      "100%";

    slide.style.height =
      "100%";

    slide.style.margin =
      "0";

    slide.style.padding =
      "0";

    slide.style.position =
      "relative";

    slide.style.overflow =
      "hidden";
  });


  /* -------------------------------------------------------
     PRELOAD ALL HERO IMAGES
  ------------------------------------------------------- */

  slides.forEach(slide => {

    const image =
      slide.querySelector(
        ".hero-slide-bg"
      );

    if (!image) {
      return;
    }

    image.style.width = "100%";
    image.style.height = "100%";
    image.style.display = "block";

    /*
      COVER keeps the complete hero area filled.
      It will not create blank spaces.
    */

    image.style.objectFit =
      "cover";

    image.style.objectPosition =
      "center center";

    /*
      Prevent browser lazy loading from
      leaving a blank slide.
    */

    image.loading = "eager";
    image.decoding = "async";

    if (
      image.dataset.src &&
      !image.src
    ) {
      image.src =
        image.dataset.src;
    }
  });


  /* -------------------------------------------------------
     STOP PROGRESS
  ------------------------------------------------------- */

  function stopProgress() {

    if (progressFrame) {
      cancelAnimationFrame(
        progressFrame
      );

      progressFrame = null;
    }
  }


  /* -------------------------------------------------------
     RESET PROGRESS
  ------------------------------------------------------- */

  function resetProgress() {

    stopProgress();

    if (!progressBar) {
      return;
    }

    progressBar.style.transition =
      "none";

    progressBar.style.width =
      "0%";

    /*
      Force browser reflow so
      next animation starts clean.
    */

    void progressBar.offsetWidth;
  }


  /* -------------------------------------------------------
     START PROGRESS
  ------------------------------------------------------- */

  function startProgress() {

    stopProgress();

    if (
      !progressBar ||
      isPaused ||
      !timer
    ) {
      return;
    }

    const startTime =
      performance.now();

    function animateProgress(now) {

      if (
        !timer ||
        isPaused
      ) {
        return;
      }

      const elapsed =
        now - startTime;

      const percent =
        Math.min(
          100,
          (elapsed / DURATION) * 100
        );

      progressBar.style.width =
        `${percent}%`;

      if (percent < 100) {
        progressFrame =
          requestAnimationFrame(
            animateProgress
          );
      }
    }

    progressFrame =
      requestAnimationFrame(
        animateProgress
      );
  }


  /* -------------------------------------------------------
     UPDATE DOTS
  ------------------------------------------------------- */

  function updateDots() {

    dots.forEach(
      (dot, index) => {

        const active =
          index === current;

        dot.classList.toggle(
          "active",
          active
        );

        dot.setAttribute(
          "aria-current",
          active
            ? "true"
            : "false"
        );
      }
    );
  }


  /* -------------------------------------------------------
     UPDATE ACTIVE SLIDE
  ------------------------------------------------------- */

  function updateActiveSlide() {

    slides.forEach(
      (slide, index) => {

        slide.classList.toggle(
          "active",
          index === current
        );
      }
    );
  }


  /* -------------------------------------------------------
     SHOW SLIDE
  ------------------------------------------------------- */

  function showSlide(
    index,
    animate = true
  ) {

    if (!slides.length) {
      return;
    }

    /*
      Wrap around.
    */

    if (index < 0) {
      index =
        slides.length - 1;
    }

    if (
      index >= slides.length
    ) {
      index = 0;
    }

    /*
      Do not allow accidental
      double animations.
    */

    if (
      isAnimating &&
      animate
    ) {
      return;
    }

    current = index;

    isAnimating =
      animate;

    /*
      CRITICAL FIX:
      percentage based movement.

      0   = slide 1
      -100% = slide 2
      -200% = slide 3
      -300% = slide 4
      -400% = slide 5
      -500% = slide 6

      No pixel calculation.
    */

    track.style.transition =
      animate
        ? `transform ${TRANSITION}ms cubic-bezier(.65,0,.25,1)`
        : "none";

    track.style.transform =
      `translate3d(
        -${current * 100}%,
        0,
        0
      )`;

    updateActiveSlide();
    updateDots();
    resetProgress();

    if (animate) {

      window.setTimeout(
        () => {
          isAnimating = false;
        },
        TRANSITION + 50
      );

    } else {
      isAnimating = false;
    }
  }


  /* -------------------------------------------------------
     STOP AUTOPLAY
  ------------------------------------------------------- */

  function stopAutoplay() {

    if (timer) {
      clearInterval(timer);
      timer = null;
    }

    stopProgress();
  }


  /* -------------------------------------------------------
     START AUTOPLAY
  ------------------------------------------------------- */

  function startAutoplay() {

    stopAutoplay();

    if (isPaused) {
      return;
    }

    timer =
      setInterval(
        () => {

          if (!isAnimating) {
            showSlide(
              current + 1,
              true
            );
          }

        },
        DURATION
      );

    resetProgress();
    startProgress();
  }


  /* -------------------------------------------------------
     NEXT
  ------------------------------------------------------- */

  function nextSlide() {

    if (isAnimating) {
      return;
    }

    showSlide(
      current + 1,
      true
    );

    startAutoplay();
  }


  /* -------------------------------------------------------
     PREVIOUS
  ------------------------------------------------------- */

  function previousSlide() {

    if (isAnimating) {
      return;
    }

    showSlide(
      current - 1,
      true
    );

    startAutoplay();
  }


  /* -------------------------------------------------------
     NEXT BUTTON
  ------------------------------------------------------- */

  if (nextButton) {

    nextButton.addEventListener(
      "click",
      event => {

        event.preventDefault();
        event.stopPropagation();

        nextSlide();
      }
    );
  }


  /* -------------------------------------------------------
     PREVIOUS BUTTON
  ------------------------------------------------------- */

  if (prevButton) {

    prevButton.addEventListener(
      "click",
      event => {

        event.preventDefault();
        event.stopPropagation();

        previousSlide();
      }
    );
  }


  /* -------------------------------------------------------
     DOT BUTTONS
  ------------------------------------------------------- */

  dots.forEach(
    (dot, index) => {

      dot.addEventListener(
        "click",
        event => {

          event.preventDefault();
          event.stopPropagation();

          if (isAnimating) {
            return;
          }

          showSlide(
            index,
            true
          );

          startAutoplay();
        }
      );
    }
  );


  /* -------------------------------------------------------
     MOUSE HOVER PAUSE
  ------------------------------------------------------- */

  slider.addEventListener(
    "mouseenter",
    () => {

      isPaused = true;

      stopAutoplay();
    }
  );


  slider.addEventListener(
    "mouseleave",
    () => {

      isPaused = false;

      startAutoplay();
    }
  );


  /* -------------------------------------------------------
     TOUCH START
  ------------------------------------------------------- */

  slider.addEventListener(
    "touchstart",
    event => {

      if (
        !event.touches.length
      ) {
        return;
      }

      touchStartX =
        event.touches[0].clientX;

      touchStartY =
        event.touches[0].clientY;

      isPaused = true;

      stopAutoplay();
    },
    {
      passive: true
    }
  );


  /* -------------------------------------------------------
     TOUCH END
  ------------------------------------------------------- */

  slider.addEventListener(
    "touchend",
    event => {

      if (
        !event.changedTouches.length
      ) {
        isPaused = false;
        startAutoplay();
        return;
      }

      const touchEndX =
        event.changedTouches[0].clientX;

      const touchEndY =
        event.changedTouches[0].clientY;

      const distanceX =
        touchEndX - touchStartX;

      const distanceY =
        touchEndY - touchStartY;

      /*
        Only proper horizontal swipe.
      */

      if (
        Math.abs(distanceX) > 60 &&
        Math.abs(distanceX) >
        Math.abs(distanceY)
      ) {

        if (distanceX < 0) {
          nextSlide();
        } else {
          previousSlide();
        }
      }

      isPaused = false;

      startAutoplay();
    },
    {
      passive: true
    }
  );


  /* -------------------------------------------------------
     KEYBOARD CONTROL
  ------------------------------------------------------- */

  document.addEventListener(
    "keydown",
    event => {

      /*
        Don't interfere when typing
        into an input.
      */

      const tag =
        document.activeElement?.tagName;

      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT"
      ) {
        return;
      }

      if (
        event.key === "ArrowRight"
      ) {
        nextSlide();
      }

      if (
        event.key === "ArrowLeft"
      ) {
        previousSlide();
      }
    }
  );


  /* -------------------------------------------------------
     RESIZE
  ------------------------------------------------------- */

  window.addEventListener(
    "resize",
    () => {

      clearTimeout(
        resizeTimer
      );

      resizeTimer =
        setTimeout(
          () => {

            /*
              Reapply percentage layout.
            */

            track.style.width =
              "100%";

            slides.forEach(
              slide => {

                slide.style.flex =
                  "0 0 100%";

                slide.style.width =
                  "100%";

                slide.style.minWidth =
                  "100%";

                slide.style.maxWidth =
                  "100%";
              }
            );

            /*
              Keep current slide
              exactly in position.
            */

            track.style.transition =
              "none";

            track.style.transform =
              `translate3d(
                -${current * 100}%,
                0,
                0
              )`;

          },
          150
        );
    }
  );


  /* -------------------------------------------------------
     TAB VISIBILITY
  ------------------------------------------------------- */

  document.addEventListener(
    "visibilitychange",
    () => {

      if (
        document.hidden
      ) {

        stopAutoplay();

      } else {

        if (!isPaused) {
          startAutoplay();
        }
      }
    }
  );


  /* -------------------------------------------------------
     INITIALIZE
  ------------------------------------------------------- */

  showSlide(
    0,
    false
  );

  /*
    Small delay ensures the browser
    has calculated the hero dimensions.
  */

  setTimeout(
    () => {
      startAutoplay();
    },
    150
  );
}


/* =========================================================
   ADMIN PRODUCTS LIVE UPDATE
========================================================= */

window.addEventListener(
  "storage",
  event => {

    if (
      event.key ===
      "techfusion_admin_products"
    ) {

      const base =
        state.products.filter(
          product =>
            !product.custom
        );

      state.products =
        mergeProducts(base);

      renderProducts();
    }
  }
);


/* =========================================================
   INITIALIZE WEBSITE
========================================================= */

async function setup() {

  /*
    HERO SLIDER
    MUST INITIALIZE FIRST
  */

  setupHeroSlider();


  /* -------------------------------------------------------
     LOAD PRODUCTS
  ------------------------------------------------------- */

  try {

    const response =
      await fetch(
        "products.json"
      );

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    const data =
      await response.json();

    state.products =
      mergeProducts(
        data.products || []
      );

  } catch (error) {

    console.warn(
      "products.json could not be loaded:",
      error
    );

    state.products =
      mergeProducts([]);

    if (
      $("#productCount") &&
      !state.products.length
    ) {
      $("#productCount").textContent =
        "Products could not be loaded";
    }
  }


  /* -------------------------------------------------------
     WEBSITE FEATURES
  ------------------------------------------------------- */

  renderProducts();

  setupSearch();

  setupFilters();

  setupCategoryCards();

  setupModals();

  setupMobileMenu();

  setupDirectNavLinks();

  setupNavigationScroll();

  handleInitialHash();

  setupMainWhatsApp();

  setupReveal();

  setupPointer();

  setupLogoIntro();

  updateProgress();
}


/* =========================================================
   START WEBSITE
========================================================= */

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    setup
  );

} else {

  setup();
}