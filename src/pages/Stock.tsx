import { useState } from 'react';
import { useStockItems } from '@/hooks/useStockItems';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Package, Minus, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Stock() {
  const { items, isLoading, addItem, issueItem, returnItem, deleteItem } = useStockItems();
  const { categories } = useCategories();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // No default values — everything starts empty
  const [newItem, setNewItem] = useState({
    name: '',
    category_id: '',
    quantity: '',
  });

  // Issue dialog — starts empty
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);
  const [selectedIssueItemId, setSelectedIssueItemId] = useState<string | null>(null);
  const [issueQuantity, setIssueQuantity] = useState<string>('');

  // Restock dialog — starts empty
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
  const [selectedRestockItemId, setSelectedRestockItemId] = useState<string | null>(null);
  const [restockQuantity, setRestockQuantity] = useState<string>('');

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddItem = () => {
    if (!newItem.name || !newItem.quantity) return;

    addItem.mutate({
      name: newItem.name,
      category_id: newItem.category_id || null,
      quantity: Number(newItem.quantity),
    });

    // Reset to empty values
    setNewItem({ name: '', category_id: '', quantity: '' });
    setIsAddOpen(false);
  };

  // Issue handlers
  const openIssueDialog = (itemId: string) => {
    setSelectedIssueItemId(itemId);
    setIssueQuantity(''); // empty
    setIsIssueDialogOpen(true);
  };

  const handleIssueConfirm = () => {
    const qty = Number(issueQuantity);
    if (!selectedIssueItemId || !issueQuantity || qty <= 0) return;

    issueItem.mutate(
      { id: selectedIssueItemId, quantity: qty },
      {
        onSuccess: () => {
          setIsIssueDialogOpen(false);
          setSelectedIssueItemId(null);
          setIssueQuantity('');
        },
      }
    );
  };

  // Restock handlers
  const openRestockDialog = (itemId: string) => {
    setSelectedRestockItemId(itemId);
    setRestockQuantity(''); // empty
    setIsRestockDialogOpen(true);
  };

  const handleRestockConfirm = () => {
    const qty = Number(restockQuantity);
    if (!selectedRestockItemId || !restockQuantity || qty <= 0) return;

    returnItem.mutate(
      { id: selectedRestockItemId, quantity: qty },
      {
        onSuccess: () => {
          setIsRestockDialogOpen(false);
          setSelectedRestockItemId(null);
          setRestockQuantity('');
        },
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <Badge className="bg-success/20 text-success">In Stock</Badge>;
      case 'low_stock':
        return <Badge className="bg-warning/20 text-warning">Low Stock</Badge>;
      case 'out_of_stock':
        return <Badge variant="destructive">Out of Stock</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Stock Items</h1>
          <p className="text-muted-foreground">Manage your inventory</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Item name"
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={newItem.category_id}
                  onValueChange={(v) => setNewItem({ ...newItem, category_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Initial Quantity</Label>
                <Input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  placeholder="Enter quantity"
                />
              </div>

              <Button
                onClick={handleAddItem}
                className="w-full"
                disabled={!newItem.name || !newItem.quantity}
              >
                Add Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No items found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      {item.category ? (
                        <Badge variant="outline" style={{ borderColor: item.category.color }}>
                          {item.category.name}
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-center font-mono">{item.quantity}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openIssueDialog(item.id)}
                          disabled={item.quantity <= 0}
                          title="Issue / Remove items"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openRestockDialog(item.id)}
                          title="Restock / Add items"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => deleteItem.mutate(item.id)}
                          title="Delete item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Issue Dialog */}
      <Dialog open={isIssueDialogOpen} onOpenChange={setIsIssueDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Issue Items</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="issue-quantity">Quantity to Issue</Label>
              <Input
                id="issue-quantity"
                type="number"
                value={issueQuantity}
                onChange={(e) => setIssueQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              This will reduce the current stock by the entered amount.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsIssueDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleIssueConfirm} 
              disabled={!issueQuantity || Number(issueQuantity) <= 0}
            >
              Issue {issueQuantity || '—'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Stock (Restock)</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="restock-quantity">Quantity to Add</Label>
              <Input
                id="restock-quantity"
                type="number"
                value={restockQuantity}
                onChange={(e) => setRestockQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              This will increase the current stock by the entered amount.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRestockDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRestockConfirm} 
              disabled={!restockQuantity || Number(restockQuantity) <= 0}
            >
              Add {restockQuantity || '—'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}