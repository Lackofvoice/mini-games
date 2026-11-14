export function memoryKV() {
    const keys = new Map();
    return {
        async get(key, type) {
            const item = keys.get(key);
            if (!item || item.until <= Date.now()) return null;
            return type === 'json' ? JSON.parse(item.value) : item.value;
        },
        async put(key, value, { expirationTtl = Infinity } = {}) {
            keys.set(key, { value, until: Date.now() + expirationTtl * 1000 });
        }
    };
}
