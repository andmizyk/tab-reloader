/* global api, defaults, active, disable */

let tab;
const startup = [];

/* presets */
api.storage.get({
  'presets': defaults.presets
}).then(({presets}) => {
  const f = document.createDocumentFragment();

  presets.slice(0, 6).forEach((preset, n) => {
    const span = document.createElement('span');
    span.textContent = api.convert.obj2str(preset);
    span.preset = preset;
    span.classList.add('entry');
    span.title = 'Ctrl/Command + ' + (n + 1);
    f.appendChild(span);
  });

  document.getElementById('presets').appendChild(f);
});
document.getElementById('presets').onclick = e => {
  if (e.target.preset) {
    document.getElementById('period').value = api.convert.obj2str(e.target.preset);
  }
};

const profile = prefs => {
  for (const [id, value] of Object.entries(prefs)) {
    const e = document.getElementById(id);
    if (e) {
      e[e.type === 'checkbox' ? 'checked' : 'value'] = value;
    }
  }
};

startup.push(async alarm => {
  api.post.bg({
    method: 'search-for-profile-anyway',
    alarm,
    url: tab.url
  }, r => {
    if (r.active) {
      tab.profile = r.profile;
      active();
    }

    profile(r.profile);
  });
});
startup.push(async (o, firstRun) => {
  if (firstRun === false && !o) {
    disable();
  }
});

/* init */
api.tabs.active().then(async t => {
  tab = t;
  const o = await api.alarms.get(tab.id.toString());

  for (const c of startup) {
    c(o, true);
  }
});
