const LocalDB = {
  _name: 'calsnap',
  _ver: 1,
  _db: null,

  async open() {
    if (this._db) return this._db;
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this._name, this._ver);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => { this._db = req.result; resolve(this._db); };
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'url' });
        }
      };
    });
  },

  async get(key) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('cache', 'readonly');
      const req = tx.objectStore('cache').get(key);
      req.onsuccess = () => {
        const r = req.result;
        resolve(r ? r.data : null);
      };
      req.onerror = () => reject(req.error);
    });
  },

  async set(key, data) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('cache', 'readwrite');
      tx.objectStore('cache').put({ url: key, data, ts: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
};
