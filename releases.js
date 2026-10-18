(() => {
  'use strict';
  const repository = 'https://github.com/ElAbraxX/Army-Launcher-Releases';
  const api = 'https://api.github.com/repos/ElAbraxX/Army-Launcher-Releases/releases?per_page=20';
  const refreshIntervalMs = 5 * 60 * 1000;
  const list = document.getElementById('versions-list');
  const badge = document.getElementById('release-badge');
  const title = document.getElementById('release-title');
  const description = document.getElementById('release-description');
  const download = document.getElementById('download-button');
  const downloadPage = document.body.classList.contains('download-page');
  const requestedVersion = downloadPage ? new URLSearchParams(location.search).get('version') : null;

  function installerUrl(asset) {
    try {
      const url = new URL(asset.browser_download_url);
      if (url.origin !== 'https://github.com') return null;
      if (!url.pathname.startsWith('/ElAbraxX/Army-Launcher-Releases/releases/download/')) return null;
      if (!/^KryonCraft-\d+\.\d+\.\d+-x64-Setup\.exe$/i.test(asset.name || '')) return null;
      return url.href;
    } catch { return null; }
  }
  function releaseUrl(release) {
    try {
      const url = new URL(release.html_url);
      if (url.origin === 'https://github.com' &&
          url.pathname.startsWith('/ElAbraxX/Army-Launcher-Releases/releases/tag/')) return url.href;
    } catch {}
    return repository + '/releases';
  }
  function installer(release) {
    if (!Array.isArray(release.assets)) return null;
    const asset = release.assets.find(item => installerUrl(item));
    const metadata = release.assets.find(item => item.name === 'latest.yml');
    if (!asset || !metadata) return null;
    const version = asset.name.match(/^KryonCraft-(\d+\.\d+\.\d+)-x64-Setup\.exe$/i)?.[1];
    if (!version || release.tag_name !== 'v' + version) return null;
    return asset;
  }
  function addLink(parent, label, href) {
    const link = document.createElement('a');
    link.href = href;
    link.rel = 'noopener noreferrer';
    link.textContent = label;
    parent.append(link);
  }
  function empty(message, heading) {
    if (badge) {
      badge.textContent = 'En preparación';
      title.textContent = heading;
      description.textContent = message;
      download.hidden = true;
    }
    if (list) {
      list.replaceChildren();
      const note = document.createElement('p');
      note.className = 'versions-empty';
      note.textContent = message;
      list.append(note);
    }
  }
  function render(releases) {
    const published = releases.filter(release => release && !release.draft && release.published_at);
    if (!published.length) {
      empty('La primera versión aparecerá aquí cuando se publique en GitHub Releases.', 'Aún no hay instalador publicado');
      return;
    }
    const current = published.find(release =>
      installer(release) && (!downloadPage || !requestedVersion || release.tag_name === 'v' + requestedVersion));
    if (current && badge) {
      const asset = installer(current);
      badge.textContent = current.prerelease ? 'Beta disponible' : 'Disponible';
      title.textContent = current.name || current.tag_name || 'Última versión';
      description.textContent = (current.prerelease ? 'Versión beta' : 'Versión estable') + ' · Windows 64 bits · ' + Math.round(asset.size / 1048576) + ' MB';
      download.href = downloadPage ? installerUrl(asset) : 'descargar.html';
      download.hidden = false;
    } else if (badge) {
      badge.textContent = 'Sin instalador';
      title.textContent = requestedVersion ? 'Versión no disponible' : 'Versiones publicadas sin instalador';
      description.textContent = requestedVersion
        ? 'No encontramos esa versión con instalador. Elige otra en el historial de versiones.'
        : 'La descarga aparecerá cuando se adjunten el instalador y latest.yml a la publicación.';
      download.hidden = true;
    }
    if (!list) return;
    list.replaceChildren();
    for (const release of published.slice(0, 8)) {
      const card = document.createElement('article');
      card.className = 'version-card';
      const summary = document.createElement('div');
      const heading = document.createElement('h3');
      heading.textContent = release.name || release.tag_name || 'Versión';
      const pill = document.createElement('span');
      pill.className = release.prerelease ? 'version-pill' : 'version-pill stable';
      pill.textContent = release.prerelease ? 'Beta' : 'Estable';
      heading.append(pill);
      const date = document.createElement('time');
      date.dateTime = release.published_at;
      date.textContent = new Intl.DateTimeFormat('es', { dateStyle: 'long' }).format(new Date(release.published_at));
      summary.append(heading, date);
      const links = document.createElement('div');
      links.className = 'version-links';
      const asset = installer(release);
      if (asset) addLink(links, 'Descargar ↓', 'descargar.html?version=' + encodeURIComponent(release.tag_name.slice(1)));
      addLink(links, 'Notas y archivos ↗', releaseUrl(release));
      card.append(summary, links);
      list.append(card);
    }
  }
  let loading = false;
  async function refresh() {
    if (loading || document.hidden) return;
    loading = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    try {
      const response = await fetch(api, {
        headers: { Accept: 'application/vnd.github+json' },
        cache: 'no-store',
        signal: controller.signal
      });
      if (!response.ok) throw new Error('GitHub ' + response.status);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Respuesta inesperada');
      render(data);
    } catch {
      if (!download?.href) {
        empty('No se pudo consultar el historial. Abre las versiones directamente en GitHub.', 'Historial no disponible ahora');
      }
    } finally {
      clearTimeout(timeout);
      loading = false;
    }
  }
  refresh();
  setInterval(refresh, refreshIntervalMs);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refresh();
  });
})();

