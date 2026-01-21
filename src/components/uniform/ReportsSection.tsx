import { useState } from 'react';
import { FileDown, Filter, Calendar } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { IssuedUniform } from '@/types/uniform';
import { toast } from 'sonner';

interface ReportsSectionProps {
  records: IssuedUniform[];
}

export const ReportsSection = ({ records }: ReportsSectionProps) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredRecords, setFilteredRecords] = useState<IssuedUniform[]>([]);
  const [hasFiltered, setHasFiltered] = useState(false);

  const handleFilter = () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const filtered = records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= start && recordDate <= end;
    });

    setFilteredRecords(filtered);
    setHasFiltered(true);
    toast.success(`Found ${filtered.length} records in the selected date range`);
  };

  const clearFilter = () => {
    setStartDate('');
    setEndDate('');
    setFilteredRecords([]);
    setHasFiltered(false);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const generatePDF = () => {
    if (filteredRecords.length === 0) {
      toast.error('No records to export. Please filter records first.');
      return;
    }

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text('Student Uniform Issuance Report', 14, 22);
    
    // Date range
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Date Range: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`, 14, 32);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 38);
    doc.text(`Total Records: ${filteredRecords.length}`, 14, 44);

    // Table
    const tableData = filteredRecords.map(record => [
      record.studentName,
      record.uniformName,
      record.uniformCategory,
      record.quantityTaken.toString(),
      formatDate(record.date),
    ]);

    autoTable(doc, {
      head: [['Student Name', 'Uniform', 'Category', 'Quantity', 'Date']],
      body: tableData,
      startY: 52,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    // Summary
    const totalQuantity = filteredRecords.reduce((sum, r) => sum + r.quantityTaken, 0);
    const finalY = (doc as any).lastAutoTable.finalY || 52;
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`Total Uniforms Issued: ${totalQuantity}`, 14, finalY + 10);

    doc.save(`uniform-report-${startDate}-to-${endDate}.pdf`);
    toast.success('PDF report downloaded successfully');
  };

  const displayRecords = hasFiltered ? filteredRecords : [];

  return (
    <div className="bg-card rounded-lg card-shadow p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-warning/10 rounded-lg">
          <Calendar className="h-5 w-5 text-warning" />
        </div>
        <h2 className="text-xl font-semibold text-card-foreground">Reports</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="flex items-end gap-2">
          <Button onClick={handleFilter} className="flex-1">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          {hasFiltered && (
            <Button variant="outline" onClick={clearFilter}>
              Clear
            </Button>
          )}
        </div>
        <div className="flex items-end">
          <Button 
            onClick={generatePDF} 
            variant="secondary" 
            className="w-full"
            disabled={filteredRecords.length === 0}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {hasFiltered && (
        <div className="overflow-x-auto">
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredRecords.length} records from {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Uniform</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No records found in the selected date range.
                  </TableCell>
                </TableRow>
              ) : (
                displayRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.studentName}</TableCell>
                    <TableCell>{record.uniformName}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-secondary rounded-full text-sm">
                        {record.uniformCategory}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-medium">{record.quantityTaken}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(record.date)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {filteredRecords.length > 0 && (
            <div className="mt-4 p-3 bg-secondary rounded-lg">
              <span className="font-medium">Total Uniforms Issued:</span>{' '}
              <span className="text-primary font-bold">
                {filteredRecords.reduce((sum, r) => sum + r.quantityTaken, 0)}
              </span>
            </div>
          )}
        </div>
      )}

      {!hasFiltered && (
        <div className="text-center py-8 text-muted-foreground">
          Select a date range and click "Filter" to view reports.
        </div>
      )}
    </div>
  );
};
