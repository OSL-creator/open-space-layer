
(function () {
  const liveSources = [
    {
      title: 'Kitten Rescue Cam',
      org: 'Explore.org / Kitten Rescue',
      url: 'https://explore.org/livecams/kitten-rescue/kitten-rescue-cam',
      note: 'Open the live rescue cam in a new tab if the host blocks embedding.'
    },
    {
      title: 'FOF Rescue Center Streams',
      org: 'Friends of Felines Rescue Center',
      url: 'https://www.youtube.com/@FOFRescueCenter/streams',
      note: 'Live and recent rescue streams from the center’s channel.'
    }
  ];

  function ensureCatMode() {
    if (document.getElementById('cat-mode-launcher')) return;
    const launcher = document.createElement('button');
    launcher.id = 'cat-mode-launcher';
    launcher.className = 'cat-launcher';
    launcher.type = 'button';
    launcher.setAttribute('aria-label', 'Open Cat Mode');
    launcher.innerHTML = '<span class="cat-launcher-face">🐾</span><span class="cat-launcher-label">Cat Mode</span>';

    const modal = document.createElement('div');
    modal.id = 'cat-mode-modal';
    modal.className = 'cat-modal hidden';
    modal.innerHTML = `
      <div class="cat-modal-panel" role="dialog" aria-modal="true" aria-label="Cat Mode">
        <div class="cat-modal-head">
          <div>
            <div class="eyebrow">Morale boost</div>
            <h2>Cat Mode</h2>
          </div>
          <div class="cat-head-icons"><span>🐱</span><span>✨</span></div>
          <button type="button" class="cat-close" aria-label="Close Cat Mode">×</button>
        </div>
        <div class="cat-subhead">Live rescue links when available, animated cats when not. Zero stress, maximum paws.</div>
        <div class="cat-tab-row">
          <button type="button" class="cat-tab active" data-cat-tab="live">Live rescue cams</button>
          <button type="button" class="cat-tab" data-cat-tab="animated">Animated cats</button>
        </div>
        <section class="cat-tab-panel" data-cat-panel="live">
          <div class="cat-live-grid">
            ${liveSources.map((source) => `
              <article class="cat-live-card">
                <div class="meta-row"><span>Official source</span><span>${source.org}</span></div>
                <h3>${source.title}</h3>
                <p>${source.note}</p>
                <div class="cat-live-actions">
                  <a class="chip" href="${source.url}" target="_blank" rel="noreferrer">Open live source</a>
                </div>
              </article>
            `).join('')}
          </div>
          <div class="cat-note">
            Some rescue sites block direct embeds. When that happens, Cat Mode keeps the animation lounge active and opens the live source in a new tab.
          </div>
        </section>
        <section class="cat-tab-panel hidden" data-cat-panel="animated">
          <div class="cat-stage">
            <div class="cat-float cat-one">🐈</div>
            <div class="cat-float cat-two">🐈‍⬛</div>
            <div class="cat-float cat-three">🐾</div>
            <div class="cat-float cat-four">🐱</div>
            <div class="cat-bed">
              <div class="cat-sleeper">😺</div>
              <div class="sleep-bubble">z z z</div>
            </div>
          </div>
          <div class="cat-facts">
            <div class="cat-fact-card"><strong>Purr break</strong><p>Use Cat Mode as a calm overlay while you browse source evidence.</p></div>
            <div class="cat-fact-card"><strong>Paw patrol</strong><p>The floating paws are lightweight CSS animation, so they work on static hosting.</p></div>
          </div>
        </section>
      </div>
    `;

    document.body.appendChild(launcher);
    document.body.appendChild(modal);

    function openModal() {
      modal.classList.remove('hidden');
      document.body.classList.add('cat-mode-open');
    }
    function closeModal() {
      modal.classList.add('hidden');
      document.body.classList.remove('cat-mode-open');
    }
    function switchTab(tab) {
      modal.querySelectorAll('.cat-tab').forEach((btn) => btn.classList.toggle('active', btn.dataset.catTab === tab));
      modal.querySelectorAll('.cat-tab-panel').forEach((panel) => panel.classList.toggle('hidden', panel.dataset.catPanel !== tab));
      try { localStorage.setItem('osl-cat-mode-tab', tab); } catch (e) {}
    }

    launcher.addEventListener('click', openModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('cat-close')) closeModal();
      const btn = e.target.closest('.cat-tab');
      if (btn) switchTab(btn.dataset.catTab);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    let preferred = 'animated';
    try { preferred = localStorage.getItem('osl-cat-mode-tab') || 'animated'; } catch (e) {}
    switchTab(preferred);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureCatMode);
  } else {
    ensureCatMode();
  }
})();
