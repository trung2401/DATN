const normalizeDataPath = (value) => {
    if (!value) return null;
    if (/^https?:\/\//i.test(value)) return value;
    if (value.startsWith('/data/')) return value;
    if (value.startsWith('data/')) return `/${value}`;
    return `/data/${value.replace(/^\/+/, '')}`;
};

module.exports = { normalizeDataPath };