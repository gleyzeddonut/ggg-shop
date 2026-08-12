
  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lb-img');
  var lbClose = document.getElementById('lb-close');
  var lastTrigger = null;

  function openLightbox(trigger) {
    var img = trigger.querySelector('img');
    lbImg.src = trigger.dataset.full || img.src;
    lbImg.alt = img.alt;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lastTrigger = trigger;
    lbClose.focus();
  }
  function closeLightbox() {
    lightbox.hidden = true;
    lbImg.src = '';
    document.body.style.overflow = '';
    if (lastTrigger) lastTrigger.focus();
  }

  document.querySelectorAll('.zoom').forEach(function (z) {
    z.addEventListener('click', function () { openLightbox(z); });
  });
  lightbox.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });
