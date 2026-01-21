import React, { useState } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
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
import { toast } from 'sonner';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'vendedor' as User['role'],
    isActive: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'vendedor',
      isActive: true
    });
    setEditingUser(null);
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      // Actualizar usuario existente
      setUsers(prev => prev.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...formData }
          : u
      ));
      toast.success('Usuario actualizado');
    } else {
      // Crear nuevo usuario
      const newUser: User = {
        id: Date.now().toString(),
        ...formData,
        password: 'temp123', // Contraseña temporal por defecto
        createdAt: new Date()
      };
      setUsers(prev => [...prev, newUser]);
      toast.success('Usuario creado con contraseña: temp123');
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    toast.success('Usuario eliminado');
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId 
        ? { ...u, isActive: !u.isActive }
        : u
    ));
  };

  const getRoleBadge = (role: User['role']) => {
    const config = USER_ROLES[role];
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <MobileLayout title="Usuarios">
      <div className="space-y-4">
        {/* Header con botón de agregar */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Equipo</h2>
            <p className="text-sm text-muted-foreground">{users.length} usuarios</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Agregar
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-4 max-w-[calc(100vw-2rem)]">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                </DialogTitle>
                <DialogDescription>
                  {editingUser ? 'Modifica los datos del usuario' : 'Agrega un nuevo miembro al equipo'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Juan Pérez"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="juan@elmelaminas.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="555-123-4567"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value: User['role']) => setFormData(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="vendedor">Vendedor</SelectItem>
                      <SelectItem value="instalador">Instalador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Usuario activo</Label>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                </div>

                <DialogFooter>
                  <Button type="submit" className="w-full">
                    {editingUser ? 'Guardar cambios' : 'Crear usuario'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de usuarios */}
        <div className="space-y-2">
          {users.map((user) => (
            <Card key={user.id} className={!user.isActive ? 'opacity-60' : ''}>
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
                      <DropdownMenuItem onClick={() => openEditDialog(user)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleUserStatus(user.id)}>
                        {user.isActive ? 'Desactivar' : 'Activar'}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(user.id)}
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
          ))}
        </div>
      </div>
    </MobileLayout>
  );
};

export default UsersPage;
