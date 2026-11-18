(function () {
  var feed = document.getElementById('flickr-feed');
  if (!feed) return;
  var section = feed.closest('section');
  var id = (feed.dataset.flickrId || '').trim();
  var count = parseInt(feed.dataset.count, 10) || 6;
  var tag = (feed.dataset.tag || '').trim();
  if (!/^\d+@N\d+$/.test(id)) return;

  // Only accept links and images that really point at Flickr.
  function flickrUrl(value, suffix) {
    try {
      var u = new URL(value);
      var host = u.hostname;
      function isOn(domain) { return host === domain || host.endsWith('.' + domain); }
      var ok = isOn('flickr.com') || isOn('staticflickr.com');
      if (!ok || (u.protocol !== 'https:' && u.protocol !== 'http:')) return null;
      return 'https://' + host + u.pathname + u.search;
    } catch (e) { return null; }
  }

  // Camera filenames like IMG_4521 make poor alt text.
  function altFor(title) {
    title = (title || '').trim();
    if (!title || /^(IMG|DSC|DSCN|PXL|MVIMG)?[_-]?\d+/i.test(title)) return 'Photo from OU Model UN';
    return title;
  }

  window.__oumunFlickr = function (data) {
    var items = (data && data.items) || [];
    var shown = 0;
    for (var i = 0; i < items.length && shown < count; i++) {
      var item = items[i];
      var page = flickrUrl(item.link);
      var small = flickrUrl(item.media && item.media.m);
      if (!page || !small) continue;

      var fig = document.createElement('figure');
      var a = document.createElement('a');
      a.href = page;
      a.target = '_blank';
      a.rel = 'noopener';
      a.style.display = 'block';
      var img = document.createElement('img');
      img.alt = altFor(item.title);
      img.loading = 'lazy';
      // Ask for the 640px version; fall back to the always-available small one.
      img.onerror = function () {
        this.onerror = null;
        this.src = this.dataset.fallback;
      };
      img.dataset.fallback = small;
      img.src = small.replace(/_m\.jpg$/, '_z.jpg');
      a.appendChild(img);
      fig.appendChild(a);
      feed.appendChild(fig);
      shown++;
    }
    if (!shown) return;
    var more = document.getElementById('flickr-more');
    var profile = data && flickrUrl(data.link);
    if (more && profile) more.href = profile;
    if (section) section.hidden = false;
  };

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://api.flickr.com/services/feeds/photos_public.gne?id=' + encodeURIComponent(id) +
          (tag ? '&tags=' + encodeURIComponent(tag) + '&tagmode=all' : '') +
          '&format=json&jsoncallback=__oumunFlickr';
  document.head.appendChild(s);
})();