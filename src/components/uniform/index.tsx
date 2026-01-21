import React from 'react';
import { useUniformStore } from '@/hooks/useUniformStore';
import { InventorySection } from './InventorySection';
import { IssuanceForm } from './IssuanceForm';
import { IssuedRecordsTable } from './IssuedRecordsTable';
import { ReportsSection } from './ReportsSection';
import { ActivityTimeline } from './ActivityTimeline';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function UniformPage() {
  const { 
    uniforms, 
    issuedUniforms, 
    categories, 
    movements,
    isLoading, 
    isLoadingMovements,
    // INVENTORY ACTIONS
    onAddUniform, 
    onUpdateUniform, 
    onDeleteUniform,
    // CATEGORY ACTIONS
    onAddCategory,
    onDeleteCategory,
    // ISSUANCE ACTIONS
    issueUniform,
    updateIssued,
    deleteIssued 
  } = useUniformStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Uniform Management</h1>
        <p className="text-muted-foreground">Track inventory levels and recent student issuances.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-8">
          <Tabs defaultValue="inventory" className="w-full">
            <TabsList className="grid w-full max-col-md grid-cols-3 mb-8">
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="issuance">Issue Uniform</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="inventory" className="space-y-6">
              <InventorySection 
                uniforms={uniforms} 
                categories={categories}
                onAddUniform={onAddUniform}
                onUpdateUniform={onUpdateUniform}
                onDeleteUniform={onDeleteUniform}
                onAddCategory={onAddCategory}
                onDeleteCategory={onDeleteCategory}
              />
              
              <IssuedRecordsTable 
                records={issuedUniforms}
                onDelete={deleteIssued}
                onUpdate={updateIssued}
              />
            </TabsContent>

            <TabsContent value="issuance">
              <IssuanceForm uniforms={uniforms} onIssue={issueUniform} />
            </TabsContent>

            <TabsContent value="reports">
              <ReportsSection records={issuedUniforms} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="xl:col-span-1">
          <ActivityTimeline 
            movements={movements} 
            isLoading={isLoadingMovements} 
          />
        </div>
      </div>
    </div>
  );
}