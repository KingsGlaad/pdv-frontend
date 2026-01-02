"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { DataTable } from "./_components/table/data-table";
import { ProductForm } from "./_components/product-form";
import { productsService } from "@/services/products.service";
import { Product, CreateProductDto } from "@/types/product";
import { ProductsHeader } from "./_components/products-header";
import { DeleteProductDialog } from "./_components/delete-product-dialog";
import { getProductColumns } from "./_components/table/product-columns";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await productsService.getAll({
        page,
        limit: 10,
        search,
      });
      setProducts(response.data);
      setTotalProducts(response.meta.total);
    } catch (error) {
      console.error("Failed to fetch products", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleCreate = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: CreateProductDto) => {
    setIsSaving(true);
    try {
      if (editingProduct) {
        await productsService.update(editingProduct.id, data);
        toast.success("Produto atualizado com sucesso!");
      } else {
        await productsService.create(data);
        toast.success("Produto criado com sucesso!");
      }
      setIsFormOpen(false);
      fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar produto");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await productsService.delete(productToDelete.id);
      toast.success("Produto excluído com sucesso!");
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir produto");
    }
  };

  const columns = useMemo(
    () =>
      getProductColumns({
        onEdit: handleEdit,
        onDelete: handleDeleteClick,
      }),
    []
  );

  return (
    <div className="space-y-4">
      <ProductsHeader onRefresh={fetchProducts} loading={loading} />

      <DataTable
        data={products}
        columns={columns}
        total={totalProducts}
        page={page}
        limit={10}
        onPageChange={setPage}
        onSearchChange={setSearch}
        isLoading={loading}
        searchPlaceholder="Buscar por nome ou código..."
        onAddClick={handleCreate}
      />

      <ProductForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        initialData={editingProduct}
        isLoading={isSaving}
      />

      <DeleteProductDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        productName={productToDelete?.name}
        isDeleting={loading && isDeleteDialogOpen} // Reusing loading state broadly, ideally should be specific but mostly fine here as delete is quick
      />
    </div>
  );
}
