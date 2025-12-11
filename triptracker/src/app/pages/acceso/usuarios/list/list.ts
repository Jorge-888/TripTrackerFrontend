import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environment/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Usuarios } from '../../../../models/usuariosModel';
import { CreateComponent } from '../create/create';
import { EditComponent } from '../edit/edit';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Table } from 'primeng/table';
import { ToastrService } from 'ngx-toastr';

// Importar componentes PrimeNG necesarios
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MenuModule } from 'primeng/menu';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-list',
  imports: [
    CommonModule,
    FormsModule,
    CreateComponent,
    EditComponent,
    CardModule,
    ButtonModule,
    TableModule,
    MenuModule,
    TagModule,
    SkeletonModule,
    DialogModule,
    PasswordModule,
    InputTextModule
  ],
  standalone: true,
  templateUrl: './list.html',
  styleUrl: './list.scss'
})
export class ListComponent implements OnInit {
  @ViewChild('menu') menu!: Menu;
  @ViewChild('dt') table!: Table;

  usuarios: Usuarios[] = [];
  loading = false;
  showCreateForm = false;
  showEditForm = false;
  editingUser: Usuarios | null = null;
  selectedUser: Usuarios | null = null;
  showConfirmModal = false;
  showResetPasswordModal = false;
  newPassword: string = '';
  confirmPassword: string = '';
  menuItems: MenuItem[] = [];

  globalFilterValue: string = '';

  resetPasswordError = '';

  // Info para el breadcrumb
  breadcrumb = [
    { label: 'Inicio', url: '/' },
    { label: 'Acceso', url: '/acceso' },
    { label: 'Usuarios', url: '/acceso/usuarios' }
  ];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private toastr: ToastrService) { }

  ngOnInit(): void {
    console.log('usuario en localstorage:', localStorage.getItem('usuarioActual'));
    this.cargarUsuarios();

    console.log('fechahora', new Date());
    console.log('fechahoraiso', new Date().toISOString());
  }

  cargarUsuarios(): void {
    this.loading = true;
    this.http.get<Usuarios[]>(`${environment.apiUrl}/Usuarios/Listar`, {
      headers: { 'x-api-key': environment.API_KEY }
    }).subscribe({
      next: data => {
        console.log('Usuarios cargados:', data);
        this.usuarios = Array.isArray(data) ? data : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error al cargar usuarios', err);
        this.usuarios = [];
        this.loading = false;
        this.toastr.error('No se pudieron cargar los usuarios', 'Error');
        this.cdr.detectChanges();
      }
    });
  }

  mostrarFormularioCrear(): void {
    this.showCreateForm = true;
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
  }

  onUserCreated(created: Usuarios): void {
    // Agregar al inicio para que sea visible inmediatamente
    // this.usuarios.unshift(created);
    this.cargarUsuarios();
    this.showCreateForm = false;
  }

  onCancelCreate(): void {
    this.showCreateForm = false;
  }

  // Helper para formatear fecha en zona horaria local (sin conversión a UTC)
  private formatLocalDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  editar(u: Usuarios): void {
    this.editingUser = { ...u };
    this.showEditForm = true;
  }

  onUserUpdated(updated: Usuarios): void {
    // Recargar la lista completa para asegurar datos actualizados
    this.cargarUsuarios();
    this.showEditForm = false;
    this.editingUser = null;
  }

  onCancelEdit(): void {
    this.showEditForm = false;
    this.editingUser = null;
  }

  detalles(u: Usuarios): void {
    // Por implementar: vista de detalles
    console.log('Ver detalles:', u);
  }

  eliminar(u: Usuarios): void {
    this.selectedUser = u;
    this.showConfirmModal = true;
  }

  confirmDeactivate(): void {
    if (!this.selectedUser) return;

    const u = this.selectedUser;
    const usuarioDesactivar = {
      ...u,
      usua_Contrasena: '',
      usua_Estado: !u.usua_Estado,
      usua_Modificacion: 1,
      usua_FechaModificacion: this.formatLocalDateTime(new Date())
    };

    this.http.post(`${environment.apiUrl}/Usuarios/Desactivar`, usuarioDesactivar, {
      headers: { 'x-api-key': environment.API_KEY }
    }).subscribe({
      next: () => {
        u.usua_Estado = !u.usua_Estado;
        const mensaje = u.usua_Estado ? 'activado' : 'desactivado';
        this.toastr.success(`Usuario "${u.usua_Nombre}" ${mensaje} exitosamente`, 'Actualizado');
        this.showConfirmModal = false;
        this.selectedUser = null;
      },
      error: err => {
        console.error('Error al actualizar usuario', err);
        this.toastr.error('No se pudo actualizar el usuario. Intenta de nuevo.', 'Error');
        this.showConfirmModal = false;
        this.selectedUser = null;
      }
    });
  }

  cancelDeactivate(): void {
    this.showConfirmModal = false;
    this.selectedUser = null;
  }

  openResetPasswordModal(u: Usuarios): void {
    this.selectedUser = u;
    this.newPassword = '';
    this.confirmPassword = '';
    this.resetPasswordError = '';
    this.showResetPasswordModal = true;
  }

  resetPassword(): void {
    if (!this.selectedUser) return;

    if (!this.newPassword || !this.confirmPassword) {
      this.resetPasswordError = 'Ambos campos son requeridos';
      this.toastr.warning('Debes completar ambos campos de contraseña', 'Validación');
      return;
    }

    if (this.newPassword.length < 8) {
      this.resetPasswordError = 'La contraseña debe tener al menos 8 caracteres';
      this.toastr.warning('La contraseña debe tener al menos 8 caracteres', 'Validación');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.resetPasswordError = 'Las contraseñas no coinciden';
      this.toastr.warning('Las contraseñas no coinciden', 'Validación');
      return;
    }

    const usuarioReestablecer = {
      ...this.selectedUser,
      usua_Contrasena: this.newPassword,
      usua_Modificacion: 1,
      usua_FechaModificacion: this.formatLocalDateTime(new Date())
    };

    this.http.post(`${environment.apiUrl}/Usuarios/Reestablecer`, usuarioReestablecer, {
      headers: { 'x-api-key': environment.API_KEY }
    }).subscribe({
      next: () => {
        this.toastr.success(`Contraseña restablecida para "${this.selectedUser!.usua_Nombre}"`, 'Éxito');
        this.cancelResetPassword();
      },
      error: err => {
        console.error('Error al restablecer contraseña', err);
        this.toastr.error('No se pudo restablecer la contraseña. Intenta de nuevo.', 'Error');
      }
    });
  }

  cancelResetPassword(): void {
    this.showResetPasswordModal = false;
    this.selectedUser = null;
    this.newPassword = '';
    this.confirmPassword = '';
    this.resetPasswordError = '';
  }

  // Genera las opciones del menú de acciones para cada usuario
  onMenuClick(event: Event, usuario: Usuarios): void {
    this.menuItems = [
      {
        label: 'Editar',
        icon: 'pi pi-pencil',
        command: () => this.editar(usuario)
      },
      {
        label: 'Detalles',
        icon: 'pi pi-eye',
        command: () => this.detalles(usuario)
      },
      {
        label: 'Restablecer Contraseña',
        icon: 'pi pi-key',
        command: () => this.openResetPasswordModal(usuario)
      },
      {
        label: (usuario.usua_Estado === true ? 'Desactivar' : 'Activar'),
        icon: (usuario.usua_Estado === true ? 'pi pi-user-minus' : 'pi pi-user-plus'),
        command: () => this.eliminar(usuario)
      }
    ];
    this.menu.toggle(event);
  }

  toggleEstado(usuario: Usuarios): void {
    // Cambiar el estado del usuario
    usuario.usua_Estado = !usuario.usua_Estado;
    console.log('Toggle estado:', usuario.usua_Nombre, usuario.usua_Estado);
    // TODO: implementar actualización en el backend
  }

  onGlobalFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.table.filterGlobal(value, 'contains');
  }
}