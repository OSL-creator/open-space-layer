(function () {
  const page = document.body.dataset.page;
  const API_BASE = window.OSL_CONFIG?.API_BASE || 'http://127.0.0.1:8000';

  async function getJson(path) {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json();
  }

  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function evidenceBadge(presentation, fallback) {
    const label = presentation?.display_label || fallback || 'Unknown';
    const cls = (presentation?.evidence_class || fallback || '').toLowerCase();
    return `<span class="badge ${cls}">${label}${presentation?.display_marker || ''}</span>`;
  }

  function escapeHtml(str) {
    return (str || '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  }

  function formatDate(input) {
    if (!input) return 'Unknown time';
    return new Date(input).toLocaleString();
  }

  function resultLink(item) {
    if (item.object_type === 'event') return `./event.html?id=${encodeURIComponent(item.id)}`;
    if (item.object_type === 'document') return `./document.html?id=${encodeURIComponent(item.id)}`;
    if (item.object_type === 'excerpt' && item.extra?.document_id) return `./document.html?id=${encodeURIComponent(item.extra.document_id)}`;
    return '#';
  }

  async function renderHome() {
    const data = await getJson('/api/home');
    const topicHost = document.getElementById('topic-suggestions');
    const missionHost = document.getElementById('missions-grid');
    const form = document.getElementById('hero-search-form');
    const input = document.getElementById('hero-search-input');

    topicHost.innerHTML = data.suggested_topics.map((topic) => `<a class="chip" href="./search.html?q=${encodeURIComponent(topic)}">${escapeHtml(topic)}</a>`).join('');
    missionHost.innerHTML = data.missions.map((mission) => `
      <a class="mission-card" href="./mission.html?slug=${encodeURIComponent(mission.slug)}">
        <div class="eyebrow">${escapeHtml(mission.mission_type)}</div>
        <h3>${escapeHtml(mission.name)}</h3>
        <div class="meta-row"><span>Status: ${escapeHtml(mission.status)}</span></div>
        <div class="result-snippet">${escapeHtml(mission.summary || 'No summary available yet.')}</div>
      </a>
    `).join('');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = input.value.trim();
      if (q) window.location.href = `./search.html?q=${encodeURIComponent(q)}`;
    });
  }

  async function renderSearch() {
    const initialQ = qs('q') || '';
    const form = document.getElementById('search-form');
    const input = document.getElementById('search-input');
    const resultsHost = document.getElementById('search-results');
    const suggestionsHost = document.getElementById('search-suggestions');
    const title = document.getElementById('results-title');
    const typeFilter = document.getElementById('filter-type');
    const evidenceFilter = document.getElementById('filter-evidence');
    const confirmedFilter = document.getElementById('filter-confirmed');
    input.value = initialQ;

    async function runSearch() {
      const q = input.value.trim();
      if (!q) {
        resultsHost.innerHTML = '<div class="empty">Enter a query to search official NASA evidence.</div>';
        suggestionsHost.innerHTML = '';
        title.textContent = 'Results';
        return;
      }
      const params = new URLSearchParams({ q });
      if (typeFilter.value) params.set('object_type', typeFilter.value);
      if (evidenceFilter.value) params.set('evidence_class', evidenceFilter.value);
      if (confirmedFilter.checked) params.set('confirmed_only', 'true');

      const data = await getJson(`/api/search?${params.toString()}`);
      title.textContent = `${data.total} result${data.total === 1 ? '' : 's'} for “${q}”`;
      suggestionsHost.innerHTML = data.suggestions.map((topic) => `<a class="chip" href="./search.html?q=${encodeURIComponent(topic)}">${escapeHtml(topic)}</a>`).join('');
      resultsHost.innerHTML = data.results.length
        ? data.results.map((item) => `
          <a class="result-card" href="${resultLink(item)}">
            <div class="meta-row">
              <span>${escapeHtml(item.object_type)}</span>
              ${item.evidence_presentation ? evidenceBadge(item.evidence_presentation, item.evidence_class) : ''}
              ${item.source_type ? `<span>${escapeHtml(item.source_type)}</span>` : ''}
            </div>
            <p class="result-title">${escapeHtml(item.title)}</p>
            <p class="result-snippet">${escapeHtml(item.snippet)}</p>
            <div class="meta-row">
              ${item.mission_slug ? `<span>Mission: ${escapeHtml(item.mission_slug)}</span>` : ''}
              ${item.timestamp ? `<span>${formatDate(item.timestamp)}</span>` : ''}
            </div>
          </a>`).join('')
        : '<div class="empty">No results matched that combination. Try loosening the filters.</div>';
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const q = input.value.trim();
      const next = new URLSearchParams(window.location.search);
      if (q) next.set('q', q); else next.delete('q');
      history.replaceState({}, '', `${window.location.pathname}?${next.toString()}`);
      await runSearch();
    });

    [typeFilter, evidenceFilter, confirmedFilter].forEach((el) => el.addEventListener('change', runSearch));
    await runSearch();
  }

  async function renderMission() {
    const slug = qs('slug');
    const heroHost = document.getElementById('mission-hero');
    const timelineHost = document.getElementById('timeline-list');
    if (!slug) {
      heroHost.innerHTML = '<div class="empty">Mission slug missing.</div>';
      return;
    }
    const mission = await getJson(`/api/missions/${slug}`);
    const timeline = await getJson(`/api/missions/${slug}/timeline`);
    heroHost.innerHTML = `
      <div class="eyebrow">${escapeHtml(mission.mission_type)}</div>
      <h1>${escapeHtml(mission.name)}</h1>
      <p class="doc-text">${escapeHtml(mission.summary || '')}</p>
      <div class="kv-grid">
        <div class="kv-card"><div class="kv-label">Status</div><div class="kv-value">${escapeHtml(mission.status)}</div></div>
        <div class="kv-card"><div class="kv-label">Documents</div><div class="kv-value">${mission.documents_count}</div></div>
        <div class="kv-card"><div class="kv-label">Events</div><div class="kv-value">${mission.events_count}</div></div>
      </div>
    `;
    timelineHost.innerHTML = timeline.map((event) => `
      <a class="timeline-item" href="./event.html?id=${encodeURIComponent(event.id)}">
        <div class="meta-row">${evidenceBadge(event.evidence_presentation, event.evidence_class)}<span>${formatDate(event.start_time)}</span></div>
        <p class="timeline-title">${escapeHtml(event.title)}</p>
        <p class="timeline-summary">${escapeHtml(event.summary)}</p>
      </a>
    `).join('');
  }

  async function renderEvent() {
    const id = qs('id');
    const detailHost = document.getElementById('event-detail');
    const evidenceHost = document.getElementById('event-evidence');
    if (!id) {
      detailHost.innerHTML = '<div class="empty">Event id missing.</div>';
      return;
    }
    const event = await getJson(`/api/events/${id}`);
    detailHost.innerHTML = `
      <div class="meta-row">${evidenceBadge(event.evidence_presentation, event.evidence_class)}<span>${formatDate(event.start_time)}</span></div>
      <h1>${escapeHtml(event.title)}</h1>
      <p class="doc-text">${escapeHtml(event.summary)}</p>
      ${event.evidence_presentation?.disclosure_note ? `
        <div class="disclosure">
          <strong>${escapeHtml(event.evidence_presentation.disclosure_title || 'Disclosure')}</strong>
          <p>${escapeHtml(event.evidence_presentation.disclosure_note)}</p>
          ${event.derivation_note ? `<p class="code-note">${escapeHtml(event.derivation_note)}</p>` : ''}
        </div>` : ''}
    `;
    evidenceHost.innerHTML = event.evidence_links.length ? event.evidence_links.map((link) => `
      <div class="evidence-card">
        <div class="meta-row"><span>${escapeHtml(link.relation_type)}</span><span>Support: ${link.support_strength}</span></div>
        <p class="doc-text">${escapeHtml(link.excerpt.excerpt_text)}</p>
        <div class="meta-row">${link.excerpt.section_label ? `<span>Section: ${escapeHtml(link.excerpt.section_label)}</span>` : ''}${link.excerpt.page_number ? `<span>Page: ${link.excerpt.page_number}</span>` : ''}</div>
      </div>
    `).join('') : '<div class="empty">No supporting excerpts are attached yet.</div>';
  }

  async function renderDocument() {
    const id = qs('id');
    const detailHost = document.getElementById('document-detail');
    const excerptHost = document.getElementById('document-excerpts');
    if (!id) {
      detailHost.innerHTML = '<div class="empty">Document id missing.</div>';
      return;
    }
    const doc = await getJson(`/api/documents/${id}`);
    detailHost.innerHTML = `
      <div class="eyebrow">${escapeHtml(doc.source_type)}</div>
      <h1>${escapeHtml(doc.title)}</h1>
      <div class="meta-row"><span>${escapeHtml(doc.publisher)}</span><span>${doc.published_at ? formatDate(doc.published_at) : 'Publish date unavailable'}</span></div>
      <p><a class="source-link" href="${escapeHtml(doc.source_url)}" target="_blank" rel="noreferrer">Open original official source</a></p>
      <div class="disclosure"><strong>Document text</strong><p class="doc-text">${escapeHtml(doc.raw_text || 'Raw text unavailable.')}</p></div>
    `;
    excerptHost.innerHTML = doc.excerpts.length ? doc.excerpts.map((ex) => `
      <div class="evidence-card">
        <div class="meta-row"><span>Excerpt ${ex.excerpt_index}</span>${ex.section_label ? `<span>${escapeHtml(ex.section_label)}</span>` : ''}</div>
        <p class="doc-text">${escapeHtml(ex.excerpt_text)}</p>
      </div>`).join('') : '<div class="empty">No excerpts available.</div>';
  }

  const runners = { home: renderHome, search: renderSearch, mission: renderMission, event: renderEvent, document: renderDocument };
  if (runners[page]) runners[page]().catch((err) => {
    const host = document.querySelector('main');
    if (host) host.insertAdjacentHTML('afterbegin', `<section class="container"><div class="card"><p class="empty">${escapeHtml(err.message)}</p><p class="empty">If you are running the frontend from GitHub Pages, point <code>web/config.js</code> to your live API.</p></div></section>`);
    console.error(err);
  });
})();
