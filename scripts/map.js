// Countries we've represented.
// To update the map, add country names to this list. Use the names exactly as the map shows them
// (hover over a country to see its name), for example 'United States of America' or 'Dem. Rep. Congo'.
const REPRESENTED = [
  // 'France',
  // 'Japan',
];

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

    // Shade the countries in the list and warn about any name the map doesn't recognise.
    const found = [];
    REPRESENTED.forEach(name => {
      const p = byName.get(name.toLowerCase());
      if (p) { p.classList.add('visited'); found.push(p.dataset.name); }
      else console.warn('Map: no country named "' + name + '". Hover over the map to check the spelling.');
    });

    // Count and text list (the list is also there for screen readers).
    const count = document.querySelector('.map-count');
    const list = document.querySelector('.country-list');
    if (found.length) {
      count.textContent = found.length + (found.length === 1 ? ' country represented' : ' countries represented');
      found.sort().forEach(n => { const li = document.createElement('li'); li.textContent = n; list.appendChild(li); });
    }

    // Tooltip that follows the pointer (also shows when a country is tapped on touch screens).
    const showTip = (e) => {
      const p = e.target.closest('path[data-name]');
      if (!p) { tip.classList.remove('show'); return; }
      const box = mapWrap.getBoundingClientRect();
      tip.textContent = p.dataset.name + (p.classList.contains('visited') ? ' (represented)' : '');
      tip.style.left = (e.clientX - box.left) + 'px';
      tip.style.top = (e.clientY - box.top) + 'px';
      tip.classList.add('show');
    };
    mapWrap.addEventListener('pointermove', showTip);
    mapWrap.addEventListener('pointerdown', showTip);
    mapWrap.addEventListener('pointerleave', () => tip.classList.remove('show'));
  }
}