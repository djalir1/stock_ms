import { useState, useEffect } from 'react';
import { ClipboardList, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UniformItem } from '@/types/uniform';
import { useToast } from '@/hooks/use-toast'; // Changed to match shadcn standard

interface IssuanceFormProps {
  uniforms: UniformItem[];
  onIssue: (studentName: string, uniformId: string, quantity: number, date: string) => void;
}

export const IssuanceForm = ({ uniforms, onIssue }: IssuanceFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [selectedUniformId, setSelectedUniformId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const now = new Date();
    const formatted = now.toISOString().slice(0, 10);
    setDate(formatted);
  }, []);

  // Important: Check remainingQuantity, not totalQuantity
  const selectedUniform = uniforms.find(u => u.id === selectedUniformId);
  const availableStock = selectedUniform?.remainingQuantity || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentName.trim() || !selectedUniformId || !quantity) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all details.",
        variant: "destructive"
      });
      return;
    }
    
    const qty = parseInt(quantity);
    if (qty > availableStock) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${availableStock} items left.`,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Execute the mutation from the store
      await onIssue(studentName.trim(), selectedUniformId, qty, date);
      
      // Reset form on success
      setStudentName('');
      setSelectedUniformId('');
      setQuantity('');
      toast({
        title: "Success",
        description: `Issued ${qty}x ${selectedUniform?.name} to ${studentName}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not process issuance.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <ClipboardList className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">Issue Uniform</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="studentName">Student Name</Label>
            <Input
              id="studentName"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="uniform">Uniform Item</Label>
            <Select value={selectedUniformId} onValueChange={setSelectedUniformId}>
              <SelectTrigger>
                <SelectValue placeholder="Select uniform" />
              </SelectTrigger>
              <SelectContent>
                {uniforms.map((uniform) => (
                  <SelectItem 
                    key={uniform.id} 
                    value={uniform.id} 
                    disabled={uniform.remainingQuantity === 0}
                  >
                    <div className="flex justify-between w-full gap-4">
                      <span>{uniform.name}</span>
                      <span className="text-muted-foreground font-mono text-xs">
                        ({uniform.remainingQuantity} left)
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={availableStock}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="How many?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Issuance Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        {selectedUniform && availableStock < 5 && availableStock > 0 && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs font-medium">Low stock warning: Only {availableStock} remaining.</span>
          </div>
        )}

        {selectedUniform && availableStock === 0 && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs font-medium">Out of stock: You cannot issue this item.</span>
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting || (!!selectedUniformId && availableStock === 0)}
        >
          {isSubmitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
          ) : (
            "Confirm Issuance"
          )}
        </Button>
      </form>
    </div>
  );
};