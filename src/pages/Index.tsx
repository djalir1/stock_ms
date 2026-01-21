import { Shirt } from 'lucide-react';
import { InventorySection } from '@/components/uniform/InventorySection';
import { IssuanceForm } from '@/components/uniform/IssuanceForm';
import { IssuedRecordsTable } from '@/components/uniform/IssuedRecordsTable';
import { ReportsSection } from '@/components/uniform/ReportsSection';
import { useUniformStore } from '@/hooks/useUniformStore';

const Index = () => {
  const {
    categories,
    uniforms,
    issuedUniforms,
    addCategory,
    deleteCategory,
    addUniform,
    updateUniform,
    deleteUniform,
    issueUniform,
    updateIssuedUniform,
    deleteIssuedUniform,
  } = useUniformStore();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Shirt className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Uniform Management System</h1>
              <p className="text-sm text-muted-foreground">Track and manage student uniforms efficiently</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Top Row: Inventory + Issuance Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <InventorySection
                uniforms={uniforms}
                categories={categories}
                onAddUniform={addUniform}
                onUpdateUniform={updateUniform}
                onDeleteUniform={deleteUniform}
                onAddCategory={addCategory}
                onDeleteCategory={deleteCategory}
              />
            </div>
            <div className="lg:col-span-1">
              <IssuanceForm
                uniforms={uniforms}
                onIssue={issueUniform}
              />
            </div>
          </div>

          {/* Issued Records */}
          <IssuedRecordsTable
            records={issuedUniforms}
            onUpdate={updateIssuedUniform}
            onDelete={deleteIssuedUniform}
          />

          {/* Reports */}
          <ReportsSection records={issuedUniforms} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-muted-foreground">
            Student Uniform Management System © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
