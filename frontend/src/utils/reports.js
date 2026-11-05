// Report generation (PDF via jsPDF + autoTable, Excel via ExcelJS).
// Libraries are imported on demand so they don't bloat the main bundle.
import { formatDate, vehicleName } from './format';

export const REPORT_TYPES = {
  vehicles: { title: 'Vehicle inventory', description: 'Every vehicle with price, odometer and service count.' },
  'service-history': { title: 'Service history', description: 'All service records for one vehicle, with totals.' },
  monthly: { title: 'Monthly maintenance summary', description: 'Service count and spend grouped by month.' },
};

// jsPDF's built-in fonts have no ₹ glyph, so PDFs use "Rs.".
const rs = (n) => `Rs. ${Math.round(Number(n) || 0).toLocaleString('en-IN')}`;
const carIdOf = (service) => service.car?._id || service.car;
const stamp = () => new Date().toISOString().slice(0, 10);
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** Build the table data for a report. Returns { title, subtitle, columns, rows, summary, filename }. */
export const buildReport = (type, { cars = [], services = [], carId }) => {
  if (type === 'vehicles') {
    const total = cars.reduce((s, c) => s + (c.price || 0), 0);
    return {
      title: 'Vehicle inventory',
      filename: `vehicles-${stamp()}`,
      columns: ['Vehicle', 'Type', 'Year', 'Colour', 'Odometer (km)', 'Services', 'Price'],
      rows: cars.map((c) => [vehicleName(c), c.type || 'Car', c.year, c.color || '-', c.mileage ?? '-', c.services?.length || 0, c.price || 0]),
      money: [6],
      summary: [
        ['Vehicles', cars.length],
        ['Total value', total],
        ['Average value', cars.length ? total / cars.length : 0],
      ],
      moneySummary: [1, 2],
    };
  }

  if (type === 'service-history') {
    const car = cars.find((c) => c._id === carId);
    const list = services.filter((s) => carIdOf(s) === carId).sort((a, b) => new Date(b.date) - new Date(a.date));
    const total = list.reduce((s, x) => s + (x.cost || 0), 0);
    return {
      title: 'Service history',
      subtitle: car ? `${vehicleName(car)} (${car.year})` : '',
      filename: `service-history-${slug(car ? vehicleName(car) : 'vehicle')}-${stamp()}`,
      columns: ['Date', 'Type', 'Work done', 'Provider', 'Cost'],
      rows: list.map((s) => [formatDate(s.date), s.serviceType, s.description, s.serviceProvider || '-', s.cost || 0]),
      money: [4],
      summary: [
        ['Services', list.length],
        ['Total cost', total],
        ['Average cost', list.length ? total / list.length : 0],
      ],
      moneySummary: [1, 2],
    };
  }

  // monthly
  const groups = new Map();
  [...services]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach((s) => {
      const d = new Date(s.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
      const g = groups.get(key) || { label, count: 0, total: 0 };
      g.count += 1;
      g.total += s.cost || 0;
      groups.set(key, g);
    });
  const total = services.reduce((s, x) => s + (x.cost || 0), 0);
  return {
    title: 'Monthly maintenance summary',
    filename: `monthly-maintenance-${stamp()}`,
    columns: ['Month', 'Services', 'Total cost', 'Average cost'],
    rows: [...groups.values()].map((g) => [g.label, g.count, g.total, g.total / g.count]),
    money: [2, 3],
    summary: [
      ['Services', services.length],
      ['Total cost', total],
      ['Average cost', services.length ? total / services.length : 0],
    ],
    moneySummary: [1, 2],
  };
};

export const downloadPdf = async (report) => {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const doc = new jsPDF();
  const fmt = (row, moneyCols) => row.map((cell, i) => (moneyCols.includes(i) ? rs(cell) : String(cell)));

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(report.title, 14, 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text([report.subtitle, `Generated ${formatDate(new Date())} · Car Manager`].filter(Boolean), 14, 25);

  autoTable(doc, {
    startY: report.subtitle ? 35 : 31,
    head: [report.columns],
    body: report.rows.length ? report.rows.map((r) => fmt(r, report.money)) : [[{ content: 'No records', colSpan: report.columns.length }]],
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: [15, 23, 42], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: Object.fromEntries(report.money.map((i) => [i, { halign: 'right' }])),
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    head: [['Summary', '']],
    body: report.summary.map(([k, v], i) => [k, report.moneySummary.includes(i) ? rs(v) : String(v)]),
    theme: 'plain',
    styles: { fontSize: 10 },
    headStyles: { fontStyle: 'bold' },
    tableWidth: 90,
    columnStyles: { 1: { halign: 'right' } },
  });

  doc.save(`${report.filename}.pdf`);
};

export const downloadExcel = async (report) => {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Car Manager';
  const sheet = workbook.addWorksheet(report.title.slice(0, 31));

  sheet.addRow([report.title]).font = { bold: true, size: 14 };
  if (report.subtitle) sheet.addRow([report.subtitle]);
  sheet.addRow([`Generated ${formatDate(new Date())}`]).font = { color: { argb: 'FF64748B' } };
  sheet.addRow([]);

  const header = sheet.addRow(report.columns);
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
  });
  report.rows.forEach((r) => {
    const row = sheet.addRow(r);
    report.money.forEach((i) => {
      row.getCell(i + 1).numFmt = '"₹"#,##,##0';
    });
  });

  sheet.addRow([]);
  report.summary.forEach(([k, v], i) => {
    const row = sheet.addRow([k, v]);
    row.getCell(1).font = { bold: true };
    if (report.moneySummary.includes(i)) row.getCell(2).numFmt = '"₹"#,##,##0';
  });

  sheet.columns.forEach((col, i) => {
    const longest = Math.max(...[report.columns[i] || '', ...report.rows.map((r) => r[i])].map((v) => String(v ?? '').length));
    col.width = Math.min(Math.max(longest + 2, 12), 60);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${report.filename}.xlsx`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
