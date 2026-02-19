document.querySelectorAll('.compare-container').forEach(container => {

  const topImage = container.querySelector('.compare-top');
  const slider = container.querySelector('.compare-slider');
  const line = container.querySelector('.compare-line');

  const beforeCaption = container.querySelector('.compare-caption.before');
  const afterCaption  = container.querySelector('.compare-caption.after');

  let dragging = false;
  let wasDragging = false;   // <-- important flag
  let sliderPercent = 50;

  /* -------------------
     Slider Position Logic
  ------------------- */

  function setClip(offsetX) {
    const rect = container.getBoundingClientRect();

    offsetX = offsetX - rect.left;
    offsetX = Math.max(0, Math.min(offsetX, rect.width));

    sliderPercent = (offsetX / rect.width) * 100;
    updateVisuals();
  }

  function updateVisuals() {
    const rect = container.getBoundingClientRect();

    topImage.style.clipPath = `inset(0 0 0 ${sliderPercent}%)`;

    slider.style.left = sliderPercent + '%';
    slider.style.top = rect.height / 2 + 'px';

    line.style.left = sliderPercent + '%';
    line.style.height = rect.height + 'px';

    const fadeZone = 20;
    const beforeOpacity = Math.min(1, Math.max(0, sliderPercent / fadeZone));
    const afterOpacity  = Math.min(1, Math.max(0, (100 - sliderPercent) / fadeZone));

    if (beforeCaption) beforeCaption.style.opacity = beforeOpacity;
    if (afterCaption)  afterCaption.style.opacity  = afterOpacity;
  }

  /* -------------------
     Drag Handling (FIXED)
  ------------------- */

  slider.addEventListener('mousedown', e => {
    dragging = true;
    wasDragging = false;
    e.preventDefault();
  });

  slider.addEventListener('touchstart', e => {
    dragging = true;
    wasDragging = false;
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    wasDragging = true;
    setClip(e.clientX);
  });

  document.addEventListener('touchmove', e => {
    if (!dragging || !e.touches[0]) return;
    wasDragging = true;
    setClip(e.touches[0].clientX);
  });

  document.addEventListener('mouseup', () => {
    if (dragging) {
      // Let click event see that a drag occurred
      setTimeout(() => { wasDragging = false; }, 0);
    }
    dragging = false;
  });

  document.addEventListener('touchend', () => {
    if (dragging) {
      setTimeout(() => { wasDragging = false; }, 0);
    }
    dragging = false;
  });

  container.addEventListener('click', e => {
    if (wasDragging) return;
    setClip(e.clientX);
  });

  /* -------------------
     Init + Resize
  ------------------- */

  const img = container.querySelector('img');

  const init = () => updateVisuals();

  if (img.complete) {
    init();
  } else {
    img.onload = init;
  }

  window.addEventListener('resize', updateVisuals);


  /* =========================
     FULLSCREEN LOGIC
  ========================= */

  const btn = document.createElement("button");
  btn.className = "compare-fullscreen-btn";
  btn.textContent = "⛶";
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
    btn.textContent = "✖";

    window.dispatchEvent(new Event('resize'));
  }

  function exit() {
    if (!overlay) return;

    placeholder.parentNode.insertBefore(container, placeholder);
    placeholder.remove();
    overlay.remove();

    container.classList.remove("is-fullscreen");
    btn.textContent = "⛶";

    overlay = null;
    placeholder = null;

    window.dispatchEvent(new Event('resize'));
  }

  btn.addEventListener("click", e => {
    e.stopPropagation();
    overlay ? exit() : enter();
  });

  document.addEventListener("click", e => {
    if (!overlay) return;

    // 🔥 FIX: ignore overlay click if it followed a drag
    if (e.target === overlay && !wasDragging) {
      exit();
    }
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") exit();
  });

});