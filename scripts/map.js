// The countries we've represented, and the conferences they came from, are listed under the map.
// That list is filled in by build.py from data/attended.json (see the README), so there is nothing to edit here.

const mapWrap = document.querySelector('.map-wrap');
if (mapWrap) {
  const holder = mapWrap.querySelector('.map-svg');
  const tip = mapWrap.querySelector('.map-tip');

  // The map drawing lives in images/world-map.svg and is loaded in here so each country can be styled.
  fetch('images/world-map.svg')
    .then(res => { if (!res.ok) throw new Error(res.status); return res.text(); })
    .then(svgText => { holder.innerHTML = svgText; setupMap(); })
    .catch(() => {
      holder.innerHTML = '<p class="map-note">The map could not be loaded. If you opened this page straight from a folder, run it through a local server or view the published site.</p>';
    });

  function setupMap() {
    const svgPaths = [...holder.querySelectorAll('path[data-name]')];
    const byName = new Map(svgPaths.map(p => [p.dataset.name.toLowerCase(), p]));

    // Shade each country in the list and remember which conferences it came from.
    const info = new Map();
    const entries = [...document.querySelectorAll('.country-list li[data-country]')];
    entries.forEach(li => {
      const name = li.dataset.country;
      const p = byName.get(name.toLowerCase());
      if (p) { p.classList.add('visited'); info.set(p, li.dataset.conferences || ''); }
      else console.warn('Map: no country named "' + name + '". Hover over the map to check the spelling.');
    });

    const count = document.querySelector('.map-count');
    if (count && info.size) {
      count.textContent = info.size + (info.size === 1 ? ' country represented' : ' countries represented');
    }

    // Tooltip that follows the pointer (also shows when a country is tapped on touch screens).
    const showTip = (e) => {
      const p = e.target.closest('path[data-name]');
      if (!p) { tip.classList.remove('show'); return; }
      const box = mapWrap.getBoundingClientRect();
      const conferences = info.get(p);
      tip.textContent = '';
      if (conferences) {
        const name = document.createElement('strong');
        name.textContent = p.dataset.name;
        const detail = document.createElement('span');
        detail.style.fontWeight = '500';
        detail.textContent = conferences;
        tip.append(name, document.createElement('br'), detail);
      } else {
        tip.textContent = p.dataset.name + (p.classList.contains('visited') ? ' (represented)' : '');
      }
      tip.style.left = (e.clientX - box.left) + 'px';
      tip.style.top = (e.clientY - box.top) + 'px';
      tip.classList.add('show');
    };
    mapWrap.addEventListener('pointermove', showTip);
    mapWrap.addEventListener('pointerdown', showTip);
    mapWrap.addEventListener('pointerleave', () => tip.classList.remove('show'));
  }
}