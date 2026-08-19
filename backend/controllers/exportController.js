const Transaction = require('../models/Transaction');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const mongoose = require('mongoose');

exports.exportCSV = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .populate('category', 'name')
      .populate('wallet', 'name')
      .sort({ date: -1 })
      .lean();

    const fields = ['date', 'description', 'amount', 'type', 'category.name', 'wallet.name', 'paymentMode'];
    const opts = { fields };
    
    const parser = new Parser(opts);
    const csv = parser.parse(transactions);

    res.header('Content-Type', 'text/csv');
    res.attachment('transactions.csv');
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.exportPDF = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .populate('category', 'name')
      .populate('wallet', 'name')
      .sort({ date: -1 })
      .lean();

    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
    
    doc.pipe(res);

    doc.fontSize(20).text('Monthly Finance Report', { align: 'center' });
    doc.moveDown();

    transactions.forEach(txn => {
      doc.fontSize(12).text(
        `${new Date(txn.date).toLocaleDateString()} - ${txn.description} - $${txn.amount} (${txn.type})`
      );
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
