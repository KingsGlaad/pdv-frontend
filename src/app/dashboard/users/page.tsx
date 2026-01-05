"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { usersService } from "@/services/users.service";
import { User, CreateUserDto } from "@/types/user";
import { UsersHeader } from "./_components/users-header";
import { UserForm } from "./_components/user-form";
import { DeleteUserDialog } from "./_components/delete-user-dialog";
import { getUserColumns } from "./_components/table/user-columns";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await usersService.getAll({
        page,
        limit: 10,
        search,
      });
      setUsers(response.data);
      setTotalUsers(response.meta.total);
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleCreate = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    setIsSaving(true);
    try {
      if (editingUser) {
        // Only specific fields can be updated or passed, but service handles partial
        await usersService.update(editingUser.id, data);
        toast.success("Usuário atualizado com sucesso!");
      } else {
        await usersService.create(data as CreateUserDto);
        toast.success("Usuário criado com sucesso!");
      }
      setIsFormOpen(false);
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar usuário");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await usersService.delete(userToDelete.id);
      toast.success("Usuário excluído com sucesso!");
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir usuário");
    }
  };

  const columns = useMemo(
    () =>
      getUserColumns({
        onEdit: handleEdit,
        onDelete: handleDeleteClick,
      }),
    []
  );

  return (
    <div className="space-y-4">
      <UsersHeader onRefresh={fetchUsers} loading={loading} />

      <DataTable
        data={users}
        columns={columns}
        total={totalUsers}
        page={page}
        limit={10}
        onPageChange={setPage}
        onSearchChange={setSearch}
        isLoading={loading}
        searchPlaceholder="Buscar por nome ou email..."
        onAddClick={handleCreate}
        addButtonLabel="Novo Usuário"
      />

      <UserForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        initialData={editingUser}
        isLoading={isSaving}
      />

      <DeleteUserDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        userName={userToDelete?.name}
        isDeleting={loading && isDeleteDialogOpen}
      />
    </div>
  );
}
