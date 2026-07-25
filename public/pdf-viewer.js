/* Self-contained PDF viewer modal for DRISTI 2.0.
   Exposes window.openPdfModal(url, title).
   Depends only on locally vendored pdf.js (UMD build).
   Loaded via a plain <script src> tag (classic script, no modules). */
(function () {
  'use strict';

  var PDFJS_LIB_SRC = 'vendor/pdfjs/pdf.min.js';
  var PDFJS_WORKER_SRC = 'vendor/pdfjs/pdf.worker.min.js';
  var MAX_DPR = 2;
  var MAX_SCALE = 2.0;

  // Singleton modal state.
  var els = null;            // cached DOM references
  var libPromise = null;     // promise for lazily loaded pdf.js library
  var currentTask = null;    // the active pdf.js loading task
  var renderToken = 0;       // increments on each open to cancel stale renders
  var lastFocused = null;    // element focused before opening (restored on close)

  // Lazily inject the pdf.js library once and resolve with window.pdfjsLib.
  function loadPdfJs() {
    if (window.pdfjsLib) {
      configureWorker();
      return Promise.resolve(window.pdfjsLib);
    }
    if (libPromise) {
      return libPromise;
    }
    libPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = PDFJS_LIB_SRC;
      script.async = true;
      script.onload = function () {
        if (window.pdfjsLib) {
          configureWorker();
          resolve(window.pdfjsLib);
        } else {
          reject(new Error('pdf.js loaded but window.pdfjsLib is undefined'));
        }
      };
      script.onerror = function () {
        libPromise = null;
        reject(new Error('Failed to load pdf.js from ' + PDFJS_LIB_SRC));
      };
      document.head.appendChild(script);
    });
    return libPromise;
  }

  function configureWorker() {
    try {
      if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;
      }
    } catch (e) {
      // Non-fatal: pdf.js can fall back to a fake worker on the main thread.
    }
  }

  // Build the modal DOM a single time and cache references.
  function buildModal() {
    if (els) {
      return els;
    }

    var overlay = document.createElement('div');
    overlay.className = 'pdfv-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-hidden', 'true');

    var backdrop = document.createElement('div');
    backdrop.className = 'pdfv-backdrop';

    var panel = document.createElement('div');
    panel.className = 'pdfv-panel';

    var header = document.createElement('div');
    header.className = 'pdfv-header';

    var titleEl = document.createElement('div');
    titleEl.className = 'pdfv-title';

    var actions = document.createElement('div');
    actions.className = 'pdfv-actions';

    var newTab = document.createElement('a');
    newTab.className = 'pdfv-newtab';
    newTab.target = '_blank';
    newTab.rel = 'noopener';
    newTab.textContent = 'Open in new tab';

    var closeBtn = document.createElement('button');
    closeBtn.className = 'pdfv-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = '&times;';

    actions.appendChild(newTab);
    actions.appendChild(closeBtn);
    header.appendChild(titleEl);
    header.appendChild(actions);

    var scroll = document.createElement('div');
    scroll.className = 'pdfv-scroll';

    panel.appendChild(header);
    panel.appendChild(scroll);
    overlay.appendChild(backdrop);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    // Wire up close interactions.
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.key === 'Esc') && overlay.classList.contains('pdfv-open')) {
        closeModal();
      }
    });

    els = {
      overlay: overlay,
      backdrop: backdrop,
      panel: panel,
      title: titleEl,
      newTab: newTab,
      close: closeBtn,
      scroll: scroll
    };
    return els;
  }

  function clearScroll() {
    if (els && els.scroll) {
      els.scroll.innerHTML = '';
    }
  }

  function showStatus(message, withSpinner) {
    clearScroll();
    var status = document.createElement('div');
    status.className = 'pdfv-status';
    if (withSpinner) {
      var spinner = document.createElement('div');
      spinner.className = 'pdfv-spinner';
      status.appendChild(spinner);
    }
    var text = document.createElement('div');
    text.textContent = message;
    status.appendChild(text);
    els.scroll.appendChild(status);
  }

  function showError(url) {
    clearScroll();
    var box = document.createElement('div');
    box.className = 'pdfv-error';

    var line = document.createElement('div');
    line.textContent = 'This document could not be loaded.';
    box.appendChild(line);

    var linkWrap = document.createElement('div');
    linkWrap.style.marginTop = '10px';
    var link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = 'Open the PDF in a new tab';
    linkWrap.appendChild(link);
    box.appendChild(linkWrap);

    els.scroll.appendChild(box);
  }

  function openModal() {
    var e = buildModal();
    lastFocused = document.activeElement;
    e.overlay.classList.add('pdfv-open');
    e.overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // Move focus into the modal for keyboard users.
    try { e.close.focus(); } catch (err) {}
  }

  function closeModal() {
    if (!els) {
      return;
    }
    // Invalidate any in-flight render loop.
    renderToken++;
    els.overlay.classList.remove('pdfv-open');
    els.overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // Destroy the active document to free memory.
    if (currentTask) {
      try {
        if (currentTask.destroy) {
          currentTask.destroy();
        }
      } catch (err) {}
      currentTask = null;
    }
    clearScroll();
    if (lastFocused && lastFocused.focus) {
      try { lastFocused.focus(); } catch (err) {}
    }
    lastFocused = null;
  }

  // Render a single page into a fresh canvas appended to the scroll area.
  function renderPage(page, containerWidth) {
    var baseViewport = page.getViewport({ scale: 1 });
    var fitScale = containerWidth / baseViewport.width;
    if (!isFinite(fitScale) || fitScale <= 0) {
      fitScale = 1;
    }
    if (fitScale > MAX_SCALE) {
      fitScale = MAX_SCALE;
    }

    var dpr = window.devicePixelRatio || 1;
    if (dpr > MAX_DPR) {
      dpr = MAX_DPR;
    }

    var viewport = page.getViewport({ scale: fitScale });

    var canvas = document.createElement('canvas');
    canvas.className = 'pdfv-page';
    var ctx = canvas.getContext('2d');

    // Backing store scaled for HiDPI crispness.
    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);
    // CSS size stays at the fitted (device-independent) dimensions.
    canvas.style.width = viewport.width + 'px';
    canvas.style.height = 'auto';

    els.scroll.appendChild(canvas);

    var renderContext = {
      canvasContext: ctx,
      viewport: viewport,
      transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null
    };

    return page.render(renderContext).promise;
  }

  // Sequentially render all pages of the document, progressively appended.
  function renderDocument(pdf, token) {
    var containerWidth = els.scroll.clientWidth - 40; // account for padding
    if (containerWidth <= 0) {
      containerWidth = els.scroll.clientWidth || 800;
    }

    clearScroll();

    var chain = Promise.resolve();
    var i = 1;

    function next(pageNum) {
      return pdf.getPage(pageNum).then(function (page) {
        if (token !== renderToken) {
          return; // modal was closed or reopened; abort quietly
        }
        return renderPage(page, containerWidth);
      });
    }

    for (i = 1; i <= pdf.numPages; i++) {
      (function (pageNum) {
        chain = chain.then(function () {
          if (token !== renderToken) {
            return;
          }
          return next(pageNum);
        });
      })(i);
    }

    return chain;
  }

  // Public entry point.
  function openPdfModal(url, title) {
    var e = buildModal();
    e.title.textContent = title || 'Document';
    e.title.setAttribute('title', title || '');
    e.newTab.href = url;

    openModal();

    var token = ++renderToken;
    showStatus('Loading document...', true);

    loadPdfJs().then(function (pdfjsLib) {
      if (token !== renderToken) {
        return; // superseded by another open/close
      }
      // Tear down any previous document before loading a new one.
      if (currentTask) {
        try {
          if (currentTask.destroy) {
            currentTask.destroy();
          }
        } catch (err) {}
        currentTask = null;
      }

      var task = pdfjsLib.getDocument(url);
      currentTask = task;

      return task.promise.then(function (pdf) {
        if (token !== renderToken) {
          return;
        }
        return renderDocument(pdf, token);
      });
    }).catch(function (err) {
      if (token !== renderToken) {
        return; // stale error, modal already moved on
      }
      if (window.console && console.error) {
        console.error('PDF viewer error:', err);
      }
      showError(url);
    });
  }

  window.openPdfModal = openPdfModal;
})();
