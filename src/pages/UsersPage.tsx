import React, { useState, useCallback } from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  User as UserIcon, 
  Phone, 
  Mail,
  MoreVertical,
  Pencil,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, USER_ROLES } from '@/types';
import { mockUsers } from '@/data/mockData';
import { UserFormModal, UserFormData } from '@/components/shared/UserFormModal';
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog';
import { toast } from 'sonner';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const openEditDialog = useCallback((user: User) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  }, []);

  const openNewDialog = useCallback(() => {
    setEditingUser(null);
    setIsDialogOpen(true);
  }, []);

  const handleSaveUser = useCallback((formData: UserFormData): boolean => {
    if (editingUser) {
      setUsers(prev => prev.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...formData }
          : u
      ));
      toast.success('Usuario actualizado');
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        ...formData,
        password: 'temp123',
        createdAt: new Date()
      };
      setUsers(prev => [...prev, newUser]);
      toast.success('Usuario creado con contraseña: temp123');
    }
    return true;
  }, [editingUser]);

  const handleDeleteUser = useCallback(() => {
    if (userToDelete) {
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      toast.success('Usuario eliminado');
      setUserToDelete(null);
    }
  }, [userToDelete]);

  const toggleUserStatus = useCallback((userId: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId 
        ? { ...u, isActive: !u.isActive }
        : u
    ));
  }, []);

  const getRoleBadge = useCallback((role: User['role']) => {
    const config = USER_ROLES[role];
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  }, []);

  return (
    <ResponsiveLayout title="Usuarios">
      <div className="space-y-4">
        {/* Header con botón de agregar */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Equipo</h2>
            <p className="text-sm text-muted-foreground">{users.length} usuarios</p>
          </div>
          <Button size="sm" onClick={openNewDialog}>
            <Plus className="w-4 h-4 mr-1" />
            Agregar
          </Button>
        </div>

        {/* Lista de usuarios */}
        <div className="space-y-2">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              getRoleBadge={getRoleBadge}
              onEdit={openEditDialog}
              onToggleStatus={toggleUserStatus}
              onDelete={(u) => {
                setUserToDelete(u);
                setDeleteDialogOpen(true);
              }}
            />
          ))}
        </div>
      </div>

      {/* Reusable User Form Modal */}
      <UserFormModal
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingUser={editingUser}
        onSave={handleSaveUser}
      />

      {/* Reusable Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="¿Eliminar usuario?"
        description={`Esta acción no se puede deshacer. Se eliminará el usuario "${userToDelete?.name}" permanentemente.`}
        confirmLabel="Eliminar"
        onConfirm={handleDeleteUser}
        variant="danger"
      />
    </ResponsiveLayout>
  );
};

// Memoized User Card component
interface UserCardProps {
  user: User;
  getRoleBadge: (role: User['role']) => React.ReactNode;
  onEdit: (user: User) => void;
  onToggleStatus: (userId: string) => void;
  onDelete: (user: User) => void;
}

const UserCard = React.memo<UserCardProps>(({ 
  user, 
  getRoleBadge, 
  onEdit, 
  onToggleStatus, 
  onDelete 
}) => (
  <Card className={!user.isActive ? 'opacity-60' : ''}>
    <CardContent className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <UserIcon className="w-6 h-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium truncate">{user.name}</p>
              {!user.isActive && (
                <Badge variant="secondary" className="text-xs">Inactivo</Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
              <Mail className="w-3 h-3" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Phone className="w-3 h-3" />
              <span>{user.phone}</span>
            </div>
            <div className="mt-2">
              {getRoleBadge(user.role)}
            </div>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(user)}>
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleStatus(user.id)}>
              {user.isActive ? 'Desactivar' : 'Activar'}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(user)}
              className="text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardContent>
  </Card>
));

UserCard.displayName = 'UserCard';

export default UsersPage;
