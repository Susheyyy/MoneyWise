const Transaction = require('../models/Transaction');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

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
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.pdf');
    
    doc.pipe(res);

    doc.fontSize(20).text('Transaction History', { align: 'center' });
    doc.moveDown();

    transactions.forEach(txn => {
      doc.fontSize(12).text(
        `${new Date(txn.date).toISOString().slice(0, 10)} - ${txn.description} - INR ${txn.amount} (${txn.type})`
      );
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
