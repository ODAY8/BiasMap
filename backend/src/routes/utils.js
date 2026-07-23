const { ApiError } = require('../middleware/errors');

function findOr404(db, table, id) {
  const record = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
  const names = { categories: 'category', sources: 'source', reports: 'report', markers: 'marker' };
  if (!record) throw new ApiError(404, `${names[table] || table} not found`);
  return record;
}

function listResult(rows, total, page, limit) {
  return {
    data: rows,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  };
}

function parseBounds(query) {
  const values = ['minLat', 'maxLat', 'minLng', 'maxLng'].map((key) => {
    if (query[key] === undefined) return undefined;
    const value = Number(query[key]);
    if (!Number.isFinite(value)) throw new ApiError(400, `${key} must be a number`);
    return value;
  });
  if (values[0] !== undefined && (values[0] < -90 || values[0] > 90) ||
      values[1] !== undefined && (values[1] < -90 || values[1] > 90) ||
      values[2] !== undefined && (values[2] < -180 || values[2] > 180) ||
      values[3] !== undefined && (values[3] < -180 || values[3] > 180)) {
    throw new ApiError(400, 'map bounds are outside valid latitude/longitude ranges');
  }
  if (values[0] !== undefined && values[1] !== undefined && values[0] > values[1] ||
      values[2] !== undefined && values[3] !== undefined && values[2] > values[3]) {
    throw new ApiError(400, 'minimum map bounds cannot exceed maximum bounds');
  }
  return { minLat: values[0], maxLat: values[1], minLng: values[2], maxLng: values[3] };
}

module.exports = { findOr404, listResult, parseBounds };
