const analysisService = require('../services/analysis/analysisService');
const aiService = require('../ai/aiService');
const sourceQualityService = require('../services/analysis/sourceQualityService');
const sanitizeHtml = require('sanitize-html');
const { ANON_USER_ID } = require('../config/constants');

const clean = (t) => sanitizeHtml(t, { allowedTags: [], allowedAttributes: {} });

const analyze = async (req, res, next) => {
  try {
    const result = await analysisService.analyze(ANON_USER_ID, req.body.text, req.body.source_type);
    res.status(201).json(result);
  } catch (err) { next(err); }
};

const list = async (req, res, next) => {
  try {
    const result = await analysisService.listForUser(ANON_USER_ID);
    res.json(result);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const result = await analysisService.getById(req.params.id);
    if (!result) return res.status(404).json({ error: { message: 'Analysis not found', code: 'NOT_FOUND' } });
    res.json(result);
  } catch (err) { next(err); }
};

const replay = async (req, res, next) => {
  try {
    const result = await analysisService.getReplay(req.params.id, ANON_USER_ID);
    res.json(result);
  } catch (err) { next(err); }
};

const viewpoints = async (req, res, next) => {
  try {
    const result = await aiService.analyzeViewpoints(clean(req.body.text));
    res.json(result);
  } catch (err) { next(err); }
};

const emotion = async (req, res, next) => {
  try {
    const result = await aiService.analyzeEmotion(clean(req.body.text));
    res.json(result);
  } catch (err) { next(err); }
};

const rewriteHeadline = async (req, res, next) => {
  try {
    const result = await aiService.rewriteHeadline(clean(req.body.headline));
    res.json(result);
  } catch (err) { next(err); }
};

const segmentClaims = async (req, res, next) => {
  try {
    const result = await aiService.segmentClaims(clean(req.body.text));
    res.json(result);
  } catch (err) { next(err); }
};

const verifyClaims = async (req, res, next) => {
  try {
    const result = await aiService.verifyClaims(clean(req.body.text));
    res.json(result);
  } catch (err) { next(err); }
};

const sourceQuality = async (req, res, next) => {
  try {
    const result = await sourceQualityService.analyzeSourceQuality(req.body.text);
    res.json(result);
  } catch (err) { next(err); }
};

module.exports = { analyze, list, getById, replay, viewpoints, emotion, rewriteHeadline, segmentClaims, verifyClaims, sourceQuality };
