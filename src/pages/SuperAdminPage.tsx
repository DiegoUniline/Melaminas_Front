import React, { useState } from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { 
  Users, 
  FileText, 
  UserCircle,
  Plus, 
  Phone, 
  Mail,
  MoreVertical,
  Pencil,
  Trash2,
  Key,
  RotateCcw,
  Eye,
  Shield
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, USER_ROLES, Client, Quotation } from '@/types';
import { mockUsers, mockClients, mockQuotations } from '@/data/mockData';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const SuperAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [quotations, setQuotations] = useState<Quotation[]>(mockQuotations);
  
  // Estados para diálogos
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<User | null>(null);
  
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'vendedor' as User['role'],
    isActive: true
  });

  const [newPassword, setNewPassword] = useState('');

  const resetUserForm = () => {
    setUserFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'vendedor',
      isActive: true
    });
    setEditingUser(null);
  };

  const openEditUserDialog = (user: User) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: '',
      role: user.role,
      isActive: user.isActive
    });
    setIsUserDialogOpen(true);
  };

  const openPasswordDialog = (user: User) => {
    setSelectedUserForPassword(user);
    setNewPassword('');
    setIsPasswordDialogOpen(true);
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      setUsers(prev => prev.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...userFormData, password: userFormData.password || u.password }
          : u
      ));
      toast.success('Usuario actualizado');
    } else {
      if (!userFormData.password) {
        toast.error('La contraseña es requerida');
        return;
      }
      const newUser: User = {
        id: Date.now().toString(),
        name: userFormData.name,
        email: userFormData.email,
        phone: userFormData.phone,
        password: userFormData.password,
        role: userFormData.role,
        isActive: userFormData.isActive,
        createdAt: new Date()
      };
      setUsers(prev => [...prev, newUser]);
      toast.success('Usuario creado exitosamente');
    }
    
    setIsUserDialogOpen(false);
    resetUserForm();
  };

  const handlePasswordChange = () => {
    if (!selectedUserForPassword || !newPassword.trim()) {
      toast.error('Ingresa una contraseña válida');
      return;
    }
    
    setUsers(prev => prev.map(u => 
      u.id === selectedUserForPassword.id 
        ? { ...u, password: newPassword }
        : u
    ));
    
    toast.success(`Contraseña actualizada para ${selectedUserForPassword.name}`);
    setIsPasswordDialogOpen(false);
    setSelectedUserForPassword(null);
    setNewPassword('');
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user?.role === 'superadmin') {
      toast.error('No puedes eliminar al Super Admin');
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
    toast.success('Usuario eliminado');
  };

  const handleDeleteClient = (clientId: string) => {
    setClients(prev => prev.filter(c => c.id !== clientId));
    toast.success('Cliente eliminado');
  };

  const handleDeleteQuotation = (quotationId: string) => {
    setQuotations(prev => prev.filter(q => q.id !== quotationId));
    toast.success('Cotización eliminada');
  };

  const handleResetAll = () => {
    setUsers(mockUsers);
    setClients(mockClients);
    setQuotations(mockQuotations);
    setIsResetDialogOpen(false);
    toast.success('Todos los datos han sido restablecidos');
  };

  const toggleUserStatus = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user?.role === 'superadmin') {
      toast.error('No puedes desactivar al Super Admin');
      return;
    }
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, isActive: !u.isActive } : u
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

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      borrador: 'bg-gray-500',
      enviada: 'bg-blue-500',
      aceptada: 'bg-green-500',
      rechazada: 'bg-red-500'
    };
    return (
      <Badge className={`${statusColors[status] || 'bg-gray-500'} text-white`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <ResponsiveLayout title="Panel Admin">
      <div className="space-y-5">
        {/* Header con gradiente */}
        <div className="rounded-lg bg-primary p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-white/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Panel de Administración</h2>
                <p className="text-sm text-white/80">Control total del sistema</p>
              </div>
            </div>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setIsResetDialogOpen(true)}
              className="bg-white/20 text-white hover:bg-white/30 border-0"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        {/* Stats Cards con gradientes */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border bg-card">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{users.length}</p>
              <p className="text-xs text-muted-foreground">Usuarios</p>
            </CardContent>
          </Card>
          <Card className="border bg-card">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center mx-auto mb-2">
                <UserCircle className="w-5 h-5 text-info" />
              </div>
              <p className="text-2xl font-bold text-foreground">{clients.length}</p>
              <p className="text-xs text-muted-foreground">Clientes</p>
            </CardContent>
          </Card>
          <Card className="border bg-card">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center mx-auto mb-2">
                <FileText className="w-5 h-5 text-success" />
              </div>
              <p className="text-2xl font-bold text-foreground">{quotations.length}</p>
              <p className="text-xs text-muted-foreground">Cotizaciones</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs con estilo mejorado */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Usuarios</TabsTrigger>
            <TabsTrigger value="clients" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Clientes</TabsTrigger>
            <TabsTrigger value="quotations" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Cotizaciones</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-3">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => {
                resetUserForm();
                setIsUserDialogOpen(true);
              }}>
                <Plus className="w-4 h-4 mr-1" />
                Nuevo Usuario
              </Button>
            </div>
            
            {users.map((user) => (
              <Card key={user.id} className={!user.isActive ? 'opacity-60' : ''}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium truncate">{user.name}</p>
                        {!user.isActive && (
                          <Badge variant="secondary" className="text-xs">Inactivo</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getRoleBadge(user.role)}
                        <span className="text-xs text-muted-foreground">
                          Pass: {user.password}
                        </span>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-background border">
                        <DropdownMenuItem onClick={() => openEditUserDialog(user)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openPasswordDialog(user)}>
                          <Key className="w-4 h-4 mr-2" />
                          Cambiar Contraseña
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleUserStatus(user.id)}>
                          {user.isActive ? 'Desactivar' : 'Activar'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-destructive"
                          disabled={user.role === 'superadmin'}
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
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-3">
            {clients.map((client) => (
              <Card key={client.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{client.name}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        <span>{client.phone}</span>
                      </div>
                      {client.email && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{client.email}</span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">{client.city}</p>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteClient(client.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Quotations Tab */}
          <TabsContent value="quotations" className="space-y-3">
            {quotations.map((quotation) => (
              <Card key={quotation.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{quotation.folio}</p>
                        {getStatusBadge(quotation.status)}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {quotation.client.name}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-semibold text-primary">
                          ${quotation.total.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(quotation.createdAt), 'dd MMM yyyy', { locale: es })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => navigate(`/cotizacion/${quotation.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteQuotation(quotation.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog para crear/editar usuario */}
      <Dialog open={isUserDialogOpen} onOpenChange={(open) => {
        setIsUserDialogOpen(open);
        if (!open) resetUserForm();
      }}>
        <DialogContent className="mx-4 max-w-[calc(100vw-2rem)]">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </DialogTitle>
            <DialogDescription>
              {editingUser ? 'Modifica los datos del usuario' : 'Crea un nuevo usuario con contraseña'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUserSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                value={userFormData.name}
                onChange={(e) => setUserFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Juan Pérez"
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={userFormData.email}
                onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="juan@elmelaminas.com"
                required
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                value={userFormData.phone}
                onChange={(e) => setUserFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="555-123-4567"
                required
                maxLength={20}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Contraseña {editingUser && '(dejar vacío para mantener actual)'}
              </Label>
              <Input
                id="password"
                type="text"
                value={userFormData.password}
                onChange={(e) => setUserFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder={editingUser ? '••••••••' : 'Contraseña'}
                required={!editingUser}
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select 
                value={userFormData.role} 
                onValueChange={(value: User['role']) => setUserFormData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border">
                  <SelectItem value="superadmin">Super Admin</SelectItem>
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
                checked={userFormData.isActive}
                onCheckedChange={(checked) => setUserFormData(prev => ({ ...prev, isActive: checked }))}
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

      {/* Dialog para cambiar contraseña */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="mx-4 max-w-[calc(100vw-2rem)]">
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
            <DialogDescription>
              Nueva contraseña para {selectedUserForPassword?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva contraseña</Label>
              <Input
                id="newPassword"
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nueva contraseña"
                maxLength={50}
              />
            </div>
            
            <DialogFooter>
              <Button onClick={handlePasswordChange} className="w-full">
                <Key className="w-4 h-4 mr-2" />
                Actualizar Contraseña
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog para restablecer todo */}
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Restablecer todos los datos?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto eliminará todos los cambios y restaurará los datos originales de usuarios, clientes y cotizaciones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetAll} className="bg-destructive text-destructive-foreground">
              Restablecer Todo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ResponsiveLayout>
  );
};

export default SuperAdminPage;
