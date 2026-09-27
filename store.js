// ═══════════════════════════════════════════
// Capa de datos. El resto de la app no sabe si
// guarda en este dispositivo o en la nube.
// Colecciones: bodyweights, exercises, routines, workouts (+ profile)
// ═══════════════════════════════════════════
export const COLLECTIONS = ['bodyweights', 'exercises', 'routines', 'workouts'];
const LOCAL_KEY = 'iron-data-v2';
const FB_VERSION = '10.12.2';

function emptyData() {
  const d = { profile: {} };
  COLLECTIONS.forEach(c => (d[c] = []));
  return d;
}
const clean = o => JSON.parse(JSON.stringify(o)); // Firestore no admite undefined

// ── Modo local: solo este navegador ─────────
export class LocalStore {
  constructor() { this.mode = 'local'; this.user = null; }
  async init() { return true; }
  async loadAll() {
    try {
      const raw = localStorage.getItem(LOCAL_KEY) || localStorage.getItem('migym-data-v1');
      return raw ? { ...emptyData(), ...JSON.parse(raw) } : emptyData();
    } catch { return emptyData(); }
  }
  _save(data) {
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(data)); }
    catch (e) {
      console.error('No se pudo guardar', e);
      this.onError?.(e, 'guardando');
    }
  }
  put(data) { this._save(data); }
  del(data) { this._save(data); }
  setProfile(data) { this._save(data); }
}

// ── Modo nube: Firebase (login Google + Firestore) ──
// Huella SHA-256 de un texto, para comparar el correo sin guardarlo en claro
async function huella(txt) {
  if (!globalThis.crypto?.subtle) throw new Error('Abre la app por https: el navegador no permite comprobar la cuenta en una dirección no segura.');
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export class FirebaseStore {
  constructor(config, ownerEmail, ownerHash) {
    this.config = config;
    this.ownerEmail = (ownerEmail || '').trim().toLowerCase();
    this.ownerHash = (ownerHash || '').trim().toLowerCase();
    this.mode = 'firebase';
    this.user = null;
  }

  async init() {
    const base = `https://www.gstatic.com/firebasejs/${FB_VERSION}`;
    const [appMod, authMod, fsMod] = await Promise.all([
      import(`${base}/firebase-app.js`),
      import(`${base}/firebase-auth.js`),
      import(`${base}/firebase-firestore.js`),
    ]);
    this.A = authMod; this.F = fsMod;
    const app = appMod.initializeApp(this.config);
    this.auth = authMod.getAuth(app);

    // Sesión persistente: sigues dentro aunque cierres la app o el navegador.
    try { await authMod.setPersistence(this.auth, authMod.browserLocalPersistence); } catch (e) { console.warn(e); }

    // Datos persistentes y disponibles sin cobertura.
    this.db = fsMod.initializeFirestore(app, {
      localCache: fsMod.persistentLocalCache({ tabManager: fsMod.persistentMultipleTabManager() }),
    });

    try {
      const res = await authMod.getRedirectResult(this.auth);
      if (res?.user) await this._enforceOwner(res.user);
    } catch (e) { console.warn(e); }

    const u = await new Promise(res => {
      const off = authMod.onAuthStateChanged(this.auth, x => { off(); res(x); });
    });
    if (u && !(await this._isOwner(u))) { await this.logout(); return false; }
    this.user = u;
    return !!u;
  }

  async _isOwner(u) {
    const email = (u.email || '').trim().toLowerCase();
    if (this.ownerEmail) return email === this.ownerEmail;
    if (this.ownerHash) return (await huella(email)) === this.ownerHash;
    return true;   // sin correo ni huella configurados: entra cualquiera
  }
  async _enforceOwner(u) {
    if (await this._isOwner(u)) return true;
    await this.logout();
    const err = new Error('Esta app es privada: solo puede entrar su dueño.');
    err.code = 'app/not-owner';
    throw err;
  }

  // ── Registro e inicio de sesión con correo y contraseña ──
  async registrarCorreo(email, password) {
    const cred = await this.A.createUserWithEmailAndPassword(this.auth, email.trim(), password);
    if (!(await this._isOwner(cred.user))) {
      // No es el dueño: deshacemos la cuenta recién creada en vez de dejarla ahí
      try { await this.A.deleteUser(cred.user); } catch { await this.logout(); }
      const err = new Error('Esta app es privada: solo puede entrar su dueño.');
      err.code = 'app/not-owner';
      throw err;
    }
    this.user = cred.user;
    return true;
  }
  async entrarCorreo(email, password) {
    const cred = await this.A.signInWithEmailAndPassword(this.auth, email.trim(), password);
    await this._enforceOwner(cred.user);
    this.user = cred.user;
    return true;
  }
  recuperarCorreo(email) { return this.A.sendPasswordResetEmail(this.auth, email.trim()); }

  async login() {
    const provider = new this.A.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    let cred;
    try {
      cred = await this.A.signInWithPopup(this.auth, provider);
    } catch (e) {
      if (String(e.code || '').includes('popup')) {   // móviles / ventanas bloqueadas
        return this.A.signInWithRedirect(this.auth, provider);
      }
      throw e;
    }
    await this._enforceOwner(cred.user);
    this.user = cred.user;
    return true;
  }

  logout() { this.user = null; return this.A.signOut(this.auth); }

  _userDoc() { return this.F.doc(this.db, 'users', this.user.uid); }
  _col(c) { return this.F.collection(this.db, 'users', this.user.uid, c); }

  async loadAll() {
    const d = emptyData();
    const snaps = await Promise.all(COLLECTIONS.map(c => this.F.getDocs(this._col(c))));
    COLLECTIONS.forEach((c, i) => { d[c] = snaps[i].docs.map(s => s.data()); });
    const u = await this.F.getDoc(this._userDoc());
    d.profile = (u.exists() && u.data().profile) || {};
    return d;
  }

  // Sin await: si no hay cobertura queda en cola y sube al volver la conexión.
  _fail(e, what) {
    console.error('Error ' + what, e);
    this.onError?.(e, what);   // la app lo enseña como aviso
  }
  put(_data, col, item) {
    this.F.setDoc(this.F.doc(this._col(col), item.id), clean(item))
      .catch(e => this._fail(e, 'guardando'));
  }
  del(_data, col, id) {
    this.F.deleteDoc(this.F.doc(this._col(col), id))
      .catch(e => this._fail(e, 'borrando'));
  }
  setProfile(data) {
    this.F.setDoc(this._userDoc(), { profile: clean(data.profile) }, { merge: true })
      .catch(e => this._fail(e, 'guardando el perfil'));
  }
  // Sin await: con el móvil sin cobertura, commit() no resuelve hasta llegar al
  // servidor y la importación se quedaría colgada para siempre.
  bulkPut(col, items) {
    for (let i = 0; i < items.length; i += 400) {
      const b = this.F.writeBatch(this.db);
      items.slice(i, i + 400).forEach(it => b.set(this.F.doc(this._col(col), it.id), clean(it)));
      b.commit().catch(e => this._fail(e, 'importando'));
    }
  }
}
