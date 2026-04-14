(function () {
  const page = document.body.dataset.page;
  const API_BASE = window.OSL_CONFIG?.API_BASE || null;
  const DEMO_MODE = Boolean(window.OSL_CONFIG?.DEMO_MODE);
  const DEMO = window.OSL_DEMO_DATA || {};

  function escapeHtml(str) {
    return (str || '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  }

  function formatDate(input) {
    if (!input) return 'Unknown time';
    return new Date(input).toLocaleString();
  }

  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function normalizeSearchResults(results) {
    return (results || []).map((item) => ({ ...item, score: item.score ?? 1.0 }));
  }

  function suggestionsForQuery(q) {
    const base = (DEMO.home?.suggested_topics || []);
    const lower = (q || '').toLowerCase();
    if (!lower) return base;
    const filtered = base.filter((topic) => topic.toLowerCase().includes(lower) || lower.includes(topic.toLowerCase()));
    return filtered.length ? filtered : base.slice(0, 4);
  }

  function allDocuments() {
    return Object.values(DEMO.documents || {});
  }

  function findExcerptReference(excerptId) {
    for (const doc of allDocuments()) {
      for (const excerpt of (doc.excerpts || [])) {
        if (excerpt.id === excerptId) {
          return { document: doc, excerpt };
        }
      }
    }
    return null;
  }

  function citationForExcerpt(excerptId) {
    const ref = findExcerptReference(excerptId);
    if (!ref) return null;
    return {
      document_id: ref.document.id,
      document_title: ref.document.title,
      document_url: ref.document.source_url,
      excerpt_id: ref.excerpt.id,
      excerpt_index: ref.excerpt.excerpt_index,
      excerpt_text: ref.excerpt.excerpt_text,
      source_type: ref.document.source_type,
      publisher: ref.document.publisher,
      published_at: ref.document.published_at,
      page_number: ref.excerpt.page_number,
      section_label: ref.excerpt.section_label
    };
  }

  function eventCitations(event) {
    return (event?.evidence_links || [])
      .map((link) => citationForExcerpt(link.excerpt?.id))
      .filter(Boolean);
  }

  function documentCitations(doc) {
    return (doc?.excerpts || [])
      .map((excerpt) => citationForExcerpt(excerpt.id))
      .filter(Boolean);
  }

  function evidenceBadge(presentation, fallback) {
    const label = presentation?.display_label || fallback || 'Unknown';
    const cls = (presentation?.evidence_class || fallback || '').toLowerCase();
    return `<span class="badge ${cls}">${label}${presentation?.display_marker || ''}</span>`;
  }

  function resultLink(item) {
    if (item.object_type === 'event') return `./event.html?id=${encodeURIComponent(item.id)}`;
    if (item.object_type === 'document') return `./document.html?id=${encodeURIComponent(item.id)}`;
    if (item.object_type === 'excerpt' && item.extra?.document_id) {
      return `./document.html?id=${encodeURIComponent(item.extra.document_id)}#excerpt=${encodeURIComponent(item.id)}`;
    }
    return '#';
  }

  function ensureEvidenceDrawer() {
    let drawer = document.getElementById('evidence-drawer');
    if (drawer) return drawer;
    drawer = document.createElement('div');
    drawer.id = 'evidence-drawer';
    drawer.className = 'drawer-backdrop hidden';
    drawer.innerHTML = `
      <aside class="drawer-panel" aria-modal="true" aria-label="Evidence panel">
        <div class="drawer-head">
          <div>
            <div class="eyebrow">Citation evidence</div>
            <h2 id="drawer-title">Source details</h2>
          </div>
          <button class="drawer-close" type="button" aria-label="Close evidence panel">×</button>
        </div>
        <div id="drawer-body" class="drawer-body"></div>
      </aside>
    `;
    document.body.appendChild(drawer);
    drawer.addEventListener('click', (e) => {
      if (e.target === drawer || e.target.classList.contains('drawer-close')) closeDrawer();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDrawer();
    });
    return drawer;
  }

  function openDrawer(citation) {
    const drawer = ensureEvidenceDrawer();
    document.getElementById('drawer-title').textContent = citation.document_title || 'Source details';
    document.getElementById('drawer-body').innerHTML = `
      <div class="drawer-meta">
        <span class="chip">${escapeHtml(citation.publisher || 'Official source')}</span>
        ${citation.source_type ? `<span class="chip">${escapeHtml(citation.source_type)}</span>` : ''}
        ${citation.section_label ? `<span class="chip">${escapeHtml(citation.section_label)}</span>` : ''}
        <span class="chip">Excerpt ${citation.excerpt_index}</span>
      </div>
      <div class="disclosure">
        <strong>Supporting excerpt</strong>
        <p class="doc-text">${escapeHtml(citation.excerpt_text)}</p>
      </div>
      <div class="kv-grid citation-grid">
        <div class="kv-card"><div class="kv-label">Publisher</div><div class="kv-value citation-small">${escapeHtml(citation.publisher || 'NASA')}</div></div>
        <div class="kv-card"><div class="kv-label">Published</div><div class="kv-value citation-small">${escapeHtml(citation.published_at ? formatDate(citation.published_at) : 'Unavailable')}</div></div>
        <div class="kv-card"><div class="kv-label">Excerpt link</div><div class="kv-value citation-small"><a class="source-link" href="./document.html?id=${encodeURIComponent(citation.document_id)}#excerpt=${encodeURIComponent(citation.excerpt_id)}">Open in document</a></div></div>
      </div>
      <p><a class="source-link" href="${escapeHtml(citation.document_url)}" target="_blank" rel="noreferrer">Open original official source</a></p>
    `;
    drawer.classList.remove('hidden');
    document.body.classList.add('drawer-open');
  }

  function closeDrawer() {
    const drawer = document.getElementById('evidence-drawer');
    if (!drawer) return;
    drawer.classList.add('hidden');
    document.body.classList.remove('drawer-open');
  }

  function citationChip(citation, n = 1) {
    const safe = encodeURIComponent(JSON.stringify(citation));
    return `<button type="button" class="citation-chip" data-citation="${safe}">[Source ${n}]</button>`;
  }

  function citationRow(citations) {
    if (!citations || !citations.length) return '';
    return `<div class="citation-row">${citations.map((citation, idx) => citationChip(citation, idx + 1)).join('')}</div>`;
  }

  function bindCitationChips(scope = document) {
    scope.querySelectorAll('.citation-chip').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          openDrawer(JSON.parse(decodeURIComponent(btn.dataset.citation)));
        } catch (err) {
          console.error(err);
        }
      });
    });
  }

  function demoSearch(path) {
    const url = new URL(`https://osl.local${path}`);
    const q = (url.searchParams.get('q') || '').toLowerCase();
    const objectType = url.searchParams.get('object_type');
    const evidenceClass = url.searchParams.get('evidence_class');
    const confirmedOnly = url.searchParams.get('confirmed_only') === 'true';
    const mission = url.searchParams.get('mission');

    const eventItems = Object.values(DEMO.events || {}).map((event) => ({
      object_type: 'event',
      id: event.id,
      title: event.title,
      snippet: event.summary,
      mission_slug: 'artemis-ii',
      evidence_class: event.evidence_class,
      evidence_presentation: event.evidence_presentation,
      timestamp: event.start_time,
      score: 1.0,
      extra: { citations: eventCitations(event) }
    }));
    const docItems = allDocuments().map((doc) => ({
      object_type: 'document',
      id: doc.id,
      title: doc.title,
      snippet: doc.raw_text,
      mission_slug: 'artemis-ii',
      source_type: doc.source_type,
      timestamp: doc.published_at,
      score: 0.9,
      extra: { citations: documentCitations(doc).slice(0, 2) }
    }));
    const excerptItems = allDocuments().flatMap((doc) =>
      (doc.excerpts || []).map((ex) => ({
        object_type: 'excerpt',
        id: ex.id,
        title: `Excerpt ${ex.excerpt_index}: ${doc.title}`,
        snippet: ex.excerpt_text,
        mission_slug: 'artemis-ii',
        source_type: doc.source_type,
        timestamp: doc.published_at,
        score: 0.85,
        extra: { document_id: doc.id, citations: [citationForExcerpt(ex.id)].filter(Boolean) }
      }))
    );

    let results = [...eventItems, ...docItems, ...excerptItems];
    if (mission && mission !== 'artemis-ii') results = [];
    if (q) {
      results = results.filter((item) => (`${item.title} ${item.snippet}`).toLowerCase().includes(q));
    }
    if (objectType) results = results.filter((item) => item.object_type === objectType);
    if (evidenceClass) results = results.filter((item) => item.evidence_class === evidenceClass);
    if (confirmedOnly) results = results.filter((item) => item.evidence_class === 'confirmed');

    return {
      query: url.searchParams.get('q') || '',
      total: results.length,
      results: normalizeSearchResults(results),
      suggestions: suggestionsForQuery(url.searchParams.get('q') || '')
    };
  }

  function getDemoJson(path) {
    if (path === '/api/home') return DEMO.home;
    if (path === '/api/missions') return DEMO.missions;
    if (path.startsWith('/api/missions/') && path.endsWith('/timeline')) {
      const slug = decodeURIComponent(path.split('/')[3]);
      return DEMO.missionTimelines?.[slug] || [];
    }
    if (path.startsWith('/api/missions/')) {
      const slug = decodeURIComponent(path.split('/')[3]);
      return (DEMO.missions || []).find((m) => m.slug === slug);
    }
    if (path.startsWith('/api/events/')) {
      const id = decodeURIComponent(path.split('/')[3]);
      return DEMO.events?.[id];
    }
    if (path.startsWith('/api/documents/')) {
      const id = decodeURIComponent(path.split('/')[3]);
      return DEMO.documents?.[id];
    }
    if (path.startsWith('/api/search')) return demoSearch(path);
    if (path.startsWith('/api/suggestions')) {
      const url = new URL(`https://osl.local${path}`);
      return suggestionsForQuery(url.searchParams.get('q') || '');
    }
    throw new Error(`No demo route for ${path}`);
  }

  async function getJson(path) {
    if (DEMO_MODE || !API_BASE) return getDemoJson(path);
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json();
  }

  function mountCitations() {
    bindCitationChips(document);
    const excerptTarget = window.location.hash.replace('#excerpt=', '');
    if (excerptTarget) {
      const target = document.getElementById(excerptTarget);
      if (target) target.classList.add('excerpt-highlight');
    }
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
    mountCitations();
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
            ${citationRow(item.extra?.citations || [])}
            <div class="meta-row">
              ${item.mission_slug ? `<span>Mission: ${escapeHtml(item.mission_slug)}</span>` : ''}
              ${item.timestamp ? `<span>${formatDate(item.timestamp)}</span>` : ''}
            </div>
          </a>`).join('')
        : '<div class="empty">No results matched that combination. Try loosening the filters.</div>';
      bindCitationChips(resultsHost);
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
    timelineHost.innerHTML = timeline.map((event) => {
      const citations = eventCitations(DEMO.events?.[event.id] || event);
      return `
      <a class="timeline-item" href="./event.html?id=${encodeURIComponent(event.id)}">
        <div class="meta-row">${evidenceBadge(event.evidence_presentation, event.evidence_class)}<span>${formatDate(event.start_time)}</span></div>
        <p class="timeline-title">${escapeHtml(event.title)}</p>
        <p class="timeline-summary">${escapeHtml(event.summary)}</p>
        ${citationRow(citations)}
      </a>`;
    }).join('');
    bindCitationChips(timelineHost);
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
    const citations = eventCitations(event);
    detailHost.innerHTML = `
      <div class="meta-row">${evidenceBadge(event.evidence_presentation, event.evidence_class)}<span>${formatDate(event.start_time)}</span></div>
      <h1>${escapeHtml(event.title)}</h1>
      <p class="doc-text">${escapeHtml(event.summary)}</p>
      ${citationRow(citations)}
      ${event.evidence_presentation?.disclosure_note ? `
        <div class="disclosure">
          <strong>${escapeHtml(event.evidence_presentation.disclosure_title || 'Disclosure')}</strong>
          <p>${escapeHtml(event.evidence_presentation.disclosure_note)}</p>
          ${event.derivation_note ? `<p class="code-note">${escapeHtml(event.derivation_note)}</p>` : ''}
        </div>` : ''}
    `;
    evidenceHost.innerHTML = event.evidence_links.length ? event.evidence_links.map((link) => {
      const citation = citationForExcerpt(link.excerpt.id);
      return `
      <div class="evidence-card" id="${escapeHtml(link.excerpt.id)}">
        <div class="meta-row"><span>${escapeHtml(link.relation_type)}</span><span>Support: ${link.support_strength}</span></div>
        <p class="doc-text">${escapeHtml(link.excerpt.excerpt_text)}</p>
        ${citationRow(citation ? [citation] : [])}
        <div class="meta-row">${link.excerpt.section_label ? `<span>Section: ${escapeHtml(link.excerpt.section_label)}</span>` : ''}${link.excerpt.page_number ? `<span>Page: ${link.excerpt.page_number}</span>` : ''}</div>
      </div>`;
    }).join('') : '<div class="empty">No supporting excerpts are attached yet.</div>';
    bindCitationChips(detailHost);
    bindCitationChips(evidenceHost);
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
    const citations = documentCitations(doc);
    detailHost.innerHTML = `
      <div class="eyebrow">${escapeHtml(doc.source_type)}</div>
      <h1>${escapeHtml(doc.title)}</h1>
      <div class="meta-row"><span>${escapeHtml(doc.publisher)}</span><span>${doc.published_at ? formatDate(doc.published_at) : 'Publish date unavailable'}</span></div>
      <p><a class="source-link" href="${escapeHtml(doc.source_url)}" target="_blank" rel="noreferrer">Open original official source</a></p>
      ${citationRow(citations.slice(0, 2))}
      <div class="disclosure"><strong>Document text</strong><p class="doc-text">${escapeHtml(doc.raw_text || 'Raw text unavailable.')}</p></div>
    `;
    excerptHost.innerHTML = doc.excerpts.length ? doc.excerpts.map((ex) => {
      const citation = citationForExcerpt(ex.id);
      return `
      <div class="evidence-card" id="${escapeHtml(ex.id)}">
        <div class="meta-row"><span>Excerpt ${ex.excerpt_index}</span>${ex.section_label ? `<span>${escapeHtml(ex.section_label)}</span>` : ''}</div>
        <p class="doc-text">${escapeHtml(ex.excerpt_text)}</p>
        ${citationRow(citation ? [citation] : [])}
      </div>`;
    }).join('') : '<div class="empty">No excerpts available.</div>';
    bindCitationChips(detailHost);
    bindCitationChips(excerptHost);
    mountCitations();
  }

  const runners = { home: renderHome, search: renderSearch, mission: renderMission, event: renderEvent, document: renderDocument };
  if (runners[page]) runners[page]().catch((err) => {
    const host = document.querySelector('main');
    if (host) host.insertAdjacentHTML('afterbegin', `<section class="container"><div class="card"><p class="empty">${escapeHtml(err.message)}</p><p class="empty">If you are running the frontend from GitHub Pages, keep demo mode enabled or point <code>web/config.js</code> to your live API.</p></div></section>`);
    console.error(err);
  });
})();
