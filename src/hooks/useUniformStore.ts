import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UniformItem, IssuedUniform, UniformCategory } from '@/types/uniform';
import { useToast } from '@/hooks/use-toast';

export const useUniformStore = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // --- 1. FETCH QUERIES ---

  const { data: categories = [] } = useQuery({
    queryKey: ['uniform-categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('uniform_categories').select('*').order('name');
      if (error) throw error;
      return data as UniformCategory[];
    }
  });

  const { data: uniforms = [], isLoading } = useQuery({
    queryKey: ['uniform-items'],
    queryFn: async () => {
      const { data, error } = await supabase.from('uniform_items').select('*').order('name');
      if (error) throw error;
      return data.map((u: any) => ({
        id: u.id,
        name: u.name,
        category: u.category,
        totalQuantity: u.total_quantity,
        remainingQuantity: u.remaining_quantity
      })) as UniformItem[];
    }
  });

  const { data: issuedUniforms = [] } = useQuery({
    queryKey: ['uniform-issuances'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('uniform_issuances')
        .select(`id, student_name, uniform_id, quantity_taken, issue_date, created_at, uniform_items ( name, category )`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data.map((r: any) => ({
        id: r.id,
        studentName: r.student_name,
        uniformId: r.uniform_id,
        quantityTaken: r.quantity_taken,
        date: r.issue_date,
        created_at: r.created_at,
        uniformName: r.uniform_items?.name || 'Deleted Item',
        uniformCategory: r.uniform_items?.category || 'Uncategorized'
      })) as IssuedUniform[];
    }
  });

  const { data: movements = [], isLoading: isLoadingMovements } = useQuery({
    queryKey: ['uniform-movements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('uniform_issuances')
        .select(`id, student_name, quantity_taken, created_at, uniform_items ( name )`)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data.map((m: any) => ({
        id: m.id,
        item_name: m.uniform_items?.name || 'Uniform Item',
        movement_type: 'issued',
        quantity: m.quantity_taken,
        created_at: m.created_at,
        performer_name: 'Admin',
        student_name: m.student_name
      }));
    }
  });

  // --- 2. INVENTORY MUTATIONS (ADD, UPDATE, DELETE) ---

  const addUniformMutation = useMutation({
    mutationFn: async (newUniform: Omit<UniformItem, 'id' | 'remainingQuantity'>) => {
      const { error } = await supabase.from('uniform_items').insert([{
        name: newUniform.name,
        category: newUniform.category,
        total_quantity: newUniform.totalQuantity,
        remaining_quantity: newUniform.totalQuantity // Initially remaining = total
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uniform-items'] });
      toast({ title: "Success", description: "Uniform added to inventory" });
    }
  });

  const updateUniformMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<UniformItem> }) => {
      // Mapping camelCase to snake_case for Supabase
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.category) dbUpdates.category = updates.category;
      if (updates.totalQuantity !== undefined) dbUpdates.total_quantity = updates.totalQuantity;
      if (updates.remainingQuantity !== undefined) dbUpdates.remaining_quantity = updates.remainingQuantity;

      const { error } = await supabase.from('uniform_items').update(dbUpdates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uniform-items'] });
      toast({ title: "Updated", description: "Inventory updated successfully" });
    }
  });

  const deleteUniformMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('uniform_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uniform-items'] });
      toast({ title: "Deleted", description: "Item removed from inventory", variant: "destructive" });
    }
  });

  // --- 3. CATEGORY MUTATIONS ---

  const addCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from('uniform_categories').insert([{ name }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uniform-categories'] });
      toast({ title: "Success", description: "Category created" });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('uniform_categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uniform-categories'] });
      toast({ title: "Deleted", description: "Category removed" });
    }
  });

  // --- 4. ISSUANCE MUTATIONS ---

  const issueUniformMutation = useMutation({
    mutationFn: async (vars: any) => {
      const { error } = await supabase.from('uniform_issuances').insert([{
        student_name: vars.studentName,
        uniform_id: vars.uniformId,
        quantity_taken: vars.quantity,
        issue_date: vars.date
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uniform-items'] });
      queryClient.invalidateQueries({ queryKey: ['uniform-issuances'] });
      queryClient.invalidateQueries({ queryKey: ['uniform-movements'] });
      toast({ title: "Issued", description: "Uniform issued successfully" });
    }
  });

  const deleteIssuedMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('uniform_issuances').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uniform-items'] });
      queryClient.invalidateQueries({ queryKey: ['uniform-issuances'] });
      queryClient.invalidateQueries({ queryKey: ['uniform-movements'] });
      toast({ title: "Deleted", description: "Record removed", variant: "destructive" });
    }
  });

  return {
    categories,
    uniforms,
    issuedUniforms,
    movements,
    isLoading,
    isLoadingMovements,
    // Inventory Actions
    onAddUniform: (u: any) => addUniformMutation.mutate(u),
    onUpdateUniform: (id: string, updates: any) => updateUniformMutation.mutate({ id, updates }),
    onDeleteUniform: (id: string) => deleteUniformMutation.mutate(id),
    // Category Actions
    onAddCategory: (name: string) => addCategoryMutation.mutate(name),
    onDeleteCategory: (id: string) => deleteCategoryMutation.mutate(id),
    // Issuance Actions
    issueUniform: (name: string, id: string, qty: number, date: string) => {
      issueUniformMutation.mutate({ studentName: name, uniformId: id, quantity: qty, date });
      return true;
    },
    deleteIssued: (id: string) => deleteIssuedMutation.mutate(id),
  };
};