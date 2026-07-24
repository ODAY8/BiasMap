const reportsService = require('../services/reports/reportsService');

const list = async (req, res, next) => {
  try { res.json(await reportsService.list(req.user.id)); } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    res.status(201).json(await reportsService.create(req.user.id, req.body));
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await reportsService.remove(req.user.id, req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

const exportPdf = async (req, res, next) => {
  try {
    await reportsService.exportPdf(req.user.id, req.params.id, res);
  } catch (err) { next(err); }
};

const shareLink = async (req, res, next) => {
  try {
    res.json(await reportsService.getShareLink(req.params.id));
  } catch (err) { next(err); }
};

module.exports = { list, create, remove, exportPdf, shareLink };
