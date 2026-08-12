import * as XLSX from 'xlsx';

// Export data list to standard CSV file format with UTF-8 BOM for Windows Excel compatibility
export function exportToCSV(data, headersMap, filename = 'cgst-visitors-export.csv') {
  if (!data || !data.length) return;
  
  const headersKeys = Object.keys(headersMap);
  const headersLabels = Object.values(headersMap);
  
  const csvRows = [];
  
  // 1. Add headers
  csvRows.push(headersLabels.join(','));
  
  // 2. Add records
  for (const row of data) {
    const values = headersKeys.map(key => {
      const val = row[key] !== undefined && row[key] !== null ? row[key] : '';
      // Escape double quotes inside text
      const escaped = ('' + val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  // Prepend UTF-8 BOM (\ufeff) and use CRLF (\r\n) line endings
  const blob = new Blob(['\ufeff' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export data list to native Excel workbook format (.xlsx) using SheetJS
export function exportToExcel(data, headersMap, filename = 'cgst-visitors-export.xlsx') {
  if (!data || !data.length) return;
  
  const headersKeys = Object.keys(headersMap);
  const headersLabels = Object.values(headersMap);
  
  // Map rows to objects with human-readable header keys matching headersLabels
  const formattedData = data.map(row => {
    const obj = {};
    headersKeys.forEach(key => {
      obj[headersMap[key]] = row[key] !== undefined && row[key] !== null ? row[key] : '';
    });
    return obj;
  });
  
  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(formattedData, { header: headersLabels });
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Visitor History');
  
  // Use SheetJS built-in file writer for seamless, bug-free download in browser
  XLSX.writeFile(workbook, filename);
}
