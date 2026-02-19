document.querySelectorAll('.compare-container').forEach(container => {
  const topImage = container.querySelector('.compare-top');
  const slider = container.querySelector('.compare-slider');
  const line = container.querySelector('.compare-line');

  const beforeCaption = container.querySelector('.compare-caption.before');
  const afterCaption  = container.querySelector('.compare-caption.after');

  let dragging = false;

  // Store slider percentage (0–100) instead of absolute px
  let sliderPercent = 50; // initialize in the middle

  function setClip(offsetX) {
    const rect = container.getBoundingClientRect();

    offsetX = offsetX - rect.left;
    offsetX = Math.max(0, Math.min(offsetX, rect.width));

    sliderPercent = (offsetX / rect.width) * 100;

    updateVisuals();
  }

  function updateVisuals() {
    const rect = container.getBoundingClientRect();

    // clip top image (flipped)
    topImage.style.clipPath = `inset(0 0 0 ${sliderPercent}%)`;

    // slider position
    slider.style.left = sliderPercent + '%';
    slider.style.top = rect.height / 2 + 'px';

    // vertical line
    line.style.left = sliderPercent + '%';
    line.style.height = rect.height + 'px';

    // captions
    const fadeZone = 20;
    const beforeOpacity = Math.min(1, Math.max(0, sliderPercent / fadeZone));
    const afterOpacity = Math.min(1, Math.max(0, (100 - sliderPercent) / fadeZone));

    if (beforeCaption) beforeCaption.style.opacity = beforeOpacity;
    if (afterCaption)  afterCaption.style.opacity  = afterOpacity;
  }

  // Drag events
  slider.addEventListener('mousedown', e => { dragging = true; e.preventDefault(); });
  slider.addEventListener('touchstart', e => { dragging = true; e.preventDefault(); });
  document.addEventListener('mouseup', () => dragging = false);
  document.addEventListener('touchend', () => dragging = false);
  document.addEventListener('mousemove', e => { if (dragging) setClip(e.clientX); });
  document.addEventListener('touchmove', e => { if (dragging && e.touches[0]) setClip(e.touches[0].clientX); });
  container.addEventListener('click', e => setClip(e.clientX));

  // Initialize after image loads
  const img = container.querySelector('img');
  const init = () => {
    updateVisuals(); // set initial positions
  };
  if (img.complete) {
    init();
  } else {
    img.onload = init;
  }

  // Listen for window resize to adjust vertical scaling only
  window.addEventListener('resize', () => {
    updateVisuals(); // keep X (sliderPercent) the same
  });
});

document.querySelectorAll(".compare-container").forEach(container => {

  const btn = document.createElement("button");
  btn.className = "compare-fullscreen-btn";
  btn.innerHTML = "⛶";
  container.appendChild(btn);

  let overlay = null;
  let placeholder = null;

  function enter() {
    overlay = document.createElement("div");
    overlay.className = "compare-overlay";

    placeholder = document.createElement("div");
    container.parentNode.insertBefore(placeholder, container);

    overlay.appendChild(container);
    document.body.appendChild(overlay);

    container.classList.add("is-fullscreen");

    // --- FIX: update slider & vertical line immediately ---
    const event = new Event('resize'); // trigger resize listeners
    window.dispatchEvent(event);        // your existing listener will call updateVisuals()
  }

  function exit() {
    if (!overlay) return;

    placeholder.parentNode.insertBefore(container, placeholder);
    placeholder.remove();
    overlay.remove();

    container.classList.remove("is-fullscreen");

    overlay = null;
    placeholder = null;

    // --- FIX: update slider & vertical line after exit ---
    const event = new Event('resize');
    window.dispatchEvent(event);
  }

  btn.addEventListener("click", e => {
    e.stopPropagation();
    overlay ? exit() : enter();
  });

  document.addEventListener("click", e => {
    if (!overlay) return;
    if (e.target === overlay) exit();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") exit();
  });
});
