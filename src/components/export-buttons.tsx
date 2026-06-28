"use client";

import { Download, FileText, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

export function ExportButtons({ 
  data, 
  columns, 
  filename, 
  title 
}: { 
  data: any[], 
  columns: { header: string, key: string, isCurrency?: boolean }[],
  filename: string,
  title: string
}) {

  const handleExportCSV = () => {
    if (data.length === 0) return;
    
    const headers = columns.map(c => c.header).join(",");
    const rows = data.map(row => {
      return columns.map(c => {
        let val = row[c.key];
        // Handle nested or formatted values if needed, basic stringify for now
        if (typeof val === 'string' && val.includes(',')) {
          val = `"${val}"`;
        }
        return val;
      }).join(",");
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${format(new Date(), "yyyyMMdd")}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleExportPDF = () => {
    if (data.length === 0) return;
    
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text(`MBM Quarry - ${title}`, 14, 22);
    
    // Subtitle / Date
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${format(new Date(), "dd MMM yyyy, h:mm a")}`, 14, 30);
    
    const tableColumn = columns.map(c => c.header);
    const tableRows = data.map(row => {
      return columns.map(c => {
        let val = row[c.key];
        if (c.isCurrency && typeof val === 'number') {
          return `Rs. ${val.toLocaleString()}`;
        }
        return val;
      });
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [243, 156, 18], textColor: 255 }, // matches #f39c12
      styles: { fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });
    
    doc.save(`${filename}_${format(new Date(), "yyyyMMdd")}.pdf`);
  };

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={handleExportCSV}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 transition-colors"
      >
        <FileSpreadsheet className="w-4 h-4" />
        CSV
      </button>
      <button 
        onClick={handleExportPDF}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800 transition-colors"
      >
        <FileText className="w-4 h-4" />
        PDF
      </button>
    </div>
  );
}
