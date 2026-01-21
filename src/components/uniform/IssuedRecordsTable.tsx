import { useState, useMemo } from 'react';
import { Search, Edit2, Trash2, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IssuedUniform } from '@/types/uniform';

interface IssuedRecordsTableProps {
  records: IssuedUniform[];
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
}

export const IssuedRecordsTable = ({ records, onUpdate, onDelete }: IssuedRecordsTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<IssuedUniform | null>(null);
  
  const [editFormData, setEditFormData] = useState({
    studentName: '',
    quantityTaken: '',
    date: '',
    uniformName: '',
    uniformCategory: '',
  });

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  const existingCategories = useMemo(() => 
    Array.from(new Set(records.map(r => r.uniformCategory))).filter(Boolean), 
  [records]);
  
  const existingUniformNames = useMemo(() => 
    Array.from(new Set(records.map(r => r.uniformName))).filter(Boolean), 
  [records]);

  const filteredRecords = records.filter(record =>
    record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.uniformName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.uniformCategory.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openEdit = (record: IssuedUniform) => {
    setEditingRecord(record);
    setEditFormData({
      studentName: record.studentName,
      quantityTaken: record.quantityTaken.toString(),
      date: record.date,
      uniformName: record.uniformName,
      uniformCategory: record.uniformCategory,
    });
    setIsEditOpen(true);
  };

  const handleEdit = () => {
    if (editingRecord) {
      onUpdate(editingRecord.id, {
        studentName: editFormData.studentName,
        quantityTaken: parseInt(editFormData.quantityTaken),
        date: editFormData.date,
        uniformName: editFormData.uniformName,
        uniformCategory: editFormData.uniformCategory,
      });
      setIsEditOpen(false);
      setEditingRecord(null);
    }
  };

  const openDeleteConfirm = (id: string) => {
    setRecordToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (recordToDelete) {
      onDelete(recordToDelete);
      setIsDeleteConfirmOpen(false);
      setRecordToDelete(null);
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-card-foreground">Issued Records</h2>
          <span className="text-sm text-muted-foreground">({records.length} total)</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student, uniform, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="overflow-x-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Uniform</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                  No records match your search.
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.studentName}</TableCell>
                  <TableCell>{record.uniformName}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">
                      {record.uniformCategory}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">{record.quantityTaken}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(record.date)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(record)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteConfirm(record.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog - No changes needed here */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Edit Issued Record</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Student Name</Label>
              <Input
                value={editFormData.studentName}
                onChange={(e) => setEditFormData({ ...editFormData, studentName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Uniform Item</Label>
                <Select value={editFormData.uniformName} onValueChange={(val) => setEditFormData({ ...editFormData, uniformName: val })}>
                  <SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger>
                  <SelectContent>{existingUniformNames.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={editFormData.uniformCategory} onValueChange={(val) => setEditFormData({ ...editFormData, uniformCategory: val })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{existingCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" value={editFormData.quantityTaken} onChange={(e) => setEditFormData({ ...editFormData, quantityTaken: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={editFormData.date} onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })} />
              </div>
            </div>
            <Button onClick={handleEdit} className="w-full">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-center">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-center text-muted-foreground">
            Are you sure you want to delete this record? This action cannot be undone.
          </p>
          <DialogFooter className="flex gap-2 sm:justify-center mt-4">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>Delete Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};