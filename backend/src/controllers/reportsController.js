const reportsService = require('../services/reports/reportsService');
const { ANON_USER_ID } = require('../config/constants');

const list = async (req, res, next) => {
  try { res.json(await reportsService.list(ANON_USER_ID)); } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const report = await reportsService.create(ANON_USER_ID, req.body);
    res.status(201).json(report);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await reportsService.remove(ANON_USER_ID, req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

const exportPdf = async (req, res, next) => {
  try {
    await reportsService.exportPdf(ANON_USER_ID, req.params.id, res);
  } catch (err) { next(err); }
};

const shareLink = async (req, res, next) => {
  try {
    const result = await reportsService.getShareLink(req.params.id);
    res.json(result);
  } catch (err) { next(err); }
};

module.exports = { list, create, remove, exportPdf, shareLink };
