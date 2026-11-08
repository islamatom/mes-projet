/* Atom Clients · branchement Supabase
   Donne à la page la même petite interface qu'avant (collection / doc / onSnapshot),
   mais les données sont dans le projet Supabase « atom-clients », protégées par ta connexion. */
(function () {
  const cfg = window.ATOM_CONFIG || {};
  const ok = cfg.supabaseUrl && !/A_REMPLIR/.test(cfg.supabaseUrl) && window.supabase;
  if (!ok) return;
  const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: 'atom-clients-auth' }
  });
  window.SB = sb;

  /* ---------- connexion (une seule fois par appareil) ---------- */
  function ecranConnexion() {
    return new Promise(resolve => {
      const el = document.createElement('div');
      el.id = 'sblogin';
      el.innerHTML = `<div class="sbl-in">
        <svg viewBox="0 0 100 100" width="64" height="64" aria-hidden="true"><g fill="none" stroke="#7C9CFF" stroke-width="3"><ellipse cx="50" cy="50" rx="44" ry="16"/><ellipse cx="50" cy="50" rx="44" ry="16" transform="rotate(60 50 50)"/><ellipse cx="50" cy="50" rx="44" ry="16" transform="rotate(120 50 50)"/></g><circle cx="50" cy="50" r="7" fill="#7C9CFF"/></svg>
        <h1>Atom Clients</h1><p>Première connexion sur cet appareil</p>
        <form id="sbf"><label for="sbe">E-mail</label><input id="sbe" type="email" autocomplete="username" required>
        <label for="sbp">Mot de passe</label><input id="sbp" type="password" autocomplete="current-password" required>
        <button type="submit">Se connecter</button><div id="sberr" role="alert"></div></form>
        <small>Ensuite, ce sera juste ton code à 4 chiffres.</small></div>`;
      document.body.appendChild(el);
      el.querySelector('#sbf').onsubmit = async e => {
        e.preventDefault();
        const b = el.querySelector('button'); b.disabled = true; b.textContent = 'Connexion…';
        const { error } = await sb.auth.signInWithPassword({ email: el.querySelector('#sbe').value.trim(), password: el.querySelector('#sbp').value });
        if (error) { el.querySelector('#sberr').textContent = 'E-mail ou mot de passe incorrect'; b.disabled = false; b.textContent = 'Se connecter'; return; }
        el.remove(); resolve();
      };
    });
  }

  /* ---------- petite base façon « collection / doc » ---------- */
  function table(name) {
    const lst = [];
    let canal = null;
    async function charger() {
      const { data, error } = await sb.from(name).select('id,data');
      if (error) throw error;
      return data || [];
    }
    function ecouter(fn) {
      lst.push(fn);
      if (!canal) {
        canal = sb.channel('rt-' + name)
          .on('postgres_changes', { event: '*', schema: 'public', table: name }, () => lst.forEach(f => f()))
          .subscribe();
      }
    }
    return { charger, ecouter };
  }
  const T = { clients: table('clients'), reglages: table('reglages') };

  function collection(name) {
    const t = T[name];
    return {
      doc: id => ({
        set: async data => { const { error } = await sb.from(name).upsert({ id: String(id), data, updated_at: new Date().toISOString() }); if (error) throw error; },
        delete: async () => { const { error } = await sb.from(name).delete().eq('id', String(id)); if (error) throw error; }
      }),
      onSnapshot(cb, onErr) {
        const go = async () => { try { const rows = await t.charger(); cb({ docs: rows.map(r => ({ id: r.id, data: () => r.data })) }); } catch (e) { onErr && onErr(e); } };
        go(); t.ecouter(go);
        document.addEventListener('visibilitychange', () => { if (!document.hidden) go(); });
      }
    };
  }
  function doc(path) {
    const [name, id] = path.split('/');
    const t = T[name];
    return {
      set: async data => { const { error } = await sb.from(name).upsert({ id, data, updated_at: new Date().toISOString() }); if (error) throw error; },
      onSnapshot(cb) {
        const go = async () => { try { const rows = await t.charger(); const r = rows.find(x => x.id === id); cb({ exists: !!r, data: () => r && r.data }); } catch (e) {} };
        go(); t.ecouter(go);
      }
    };
  }

  /* ---------- fichiers des clients (bucket privé « docs ») ---------- */
  window.SB_ASSETS = {
    async upload(f) {
      if (f.size > 20 * 1024 * 1024) { const e = new Error('trop lourd'); e.code = 'too_large'; throw e; }
      const path = Date.now() + '-' + f.name.replace(/[^\w.\-]+/g, '_');
      const { error } = await sb.storage.from('docs').upload(path, f, { contentType: f.type || undefined });
      if (error) throw error;
      const { data } = await sb.storage.from('docs').createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      return { id: path, url: data.signedUrl, contentType: f.type, sizeBytes: f.size };
    },
    async delete(id) { await sb.storage.from('docs').remove([id]); }
  };

  window.SB_DB = async function () {
    const { data } = await sb.auth.getSession();
    if (!data.session) await ecranConnexion();
    return { collection, doc };
  };
  window.SB_LOGOUT = async function () { await sb.auth.signOut(); location.reload(); };
})();
