const savedReportModel = require('../../models/savedReportModel');
const analysisModel = require('../../models/analysisModel');
const PDFDocument = require('pdfkit');

const list = (userId) => savedReportModel.list(userId);

const create = async (userId, { analysisId, title }) => {
  return savedReportModel.create({ userId, analysisId, title });
};

const remove = async (userId, id) => {
  const report = await savedReportModel.findById(id);
  if (!report) { const e = new Error('Report not found'); e.status = 404; throw e; }
  if (report.user_id !== userId) { const e = new Error('Forbidden'); e.status = 403; throw e; }
  await savedReportModel.remove(id, userId);
};

const exportPdf = async (userId, id, res) => {
  const report = await savedReportModel.findById(id);
  if (!report) { const e = new Error('Report not found'); e.status = 404; throw e; }
  if (report.user_id !== userId) { const e = new Error('Forbidden'); e.status = 403; throw e; }

  const analysis = report.analysis_id ? await analysisModel.findById(report.analysis_id) : null;
  const sentences = analysis ? await analysisModel.findSentences(analysis.id) : [];

  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="biasmap-report-${id}.pdf"`);
  doc.pipe(res);

  doc.fontSize(20).text('BiasMap Analysis Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text(report.title);
  doc.fontSize(10).text(`Generated: ${new Date().toISOString()}`);
  doc.moveDown();

  if (analysis) {
    doc.fontSize(12).text('Overall Scores:');
    const scores = analysis.scores || {};
    Object.entries(scores).forEach(([k, v]) => doc.fontSize(10).text(`  ${k}: ${v}`));
    doc.moveDown();
    doc.fontSize(12).text('Sentence Analysis:');
    sentences.forEach((s, i) => {
      doc.moveDown(0.5);
      doc.fontSize(10).text(`${i + 1}. [${s.category}] ${s.sentence_text}`);
      if (s.technique) doc.text(`   Technique: ${s.technique}`);
      if (s.explanation) doc.text(`   ${s.explanation}`);
      if (s.question) doc.text(`   Q: ${s.question}`);
    });
  }

  doc.end();
};

const getShareLink = async (id) => {
  const report = await savedReportModel.findById(id);
  if (!report) { const e = new Error('Report not found'); e.status = 404; throw e; }
  return { share_token: report.share_token };
};

module.exports = { list, create, remove, exportPdf, getShareLink };
