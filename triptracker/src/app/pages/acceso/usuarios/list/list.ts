import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environment/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Usuarios } from '../../../../models/usuariosModel';
import { CreateComponent } from '../create/create';
import { MenuItem } from 'primeng/api';

// Importar componentes PrimeNG necesarios
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MenuModule } from 'primeng/menu';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-list',
  imports: [
    CommonModule,
    FormsModule,
    CreateComponent,
    CardModule,
    ButtonModule,
    TableModule,
    MenuModule,
    TagModule,
    SkeletonModule
  ],
  standalone: true,
  templateUrl: './list.html',
  styleUrl: './list.scss'
})
export class ListComponent implements OnInit {
  usuarios: Usuarios[] = [];
  loading = false;
  showCreateForm = false;

  // Info para el breadcrumb
  breadcrumb = [
    { label: 'Inicio', url: '/' },
    { label: 'Acceso', url: '/acceso' },
    { label: 'Usuarios', url: '/acceso/usuarios' }
  ];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    console.log('usuario en localstorage:', localStorage.getItem('usuarioActual'));
    this.cargarUsuarios();
    
  }

  private cargarUsuarios(): void {
    this.loading = true;
    this.http.get<Usuarios[]>(`${environment.apiUrl}/Usuarios/Listar`, {
      headers: { 'x-api-key': environment.API_KEY }
    }).subscribe({
      next: data => {
        setTimeout(() => {
          this.usuarios = Array.isArray(data) ? data : [];
          this.loading = false;
          this.cdr.detectChanges();
          console.log('Usuarios cargados:', this.usuarios);
        }, 500);
      },
      error: err => {
        console.error('Error al cargar usuarios', err);
        this.usuarios = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
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

  editar(u: Usuarios): void {
    // Por implementar: formulario de edición
    console.log('Editar usuario:', u);
  }

  detalles(u: Usuarios): void {
    // Por implementar: vista de detalles
    console.log('Ver detalles:', u);
  }

  eliminar(u: Usuarios): void {
    if (!confirm(`¿Eliminar usuario "${u.usua_Nombre}"?`)) return;

    this.http.delete(`${environment.apiUrl}/Usuarios/Eliminar/${u.usua_Id}`, {
      headers: { 'x-api-key': environment.API_KEY }
    }).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter(x => x.usua_Id !== u.usua_Id);
      },
      error: err => {
        console.error('Error al eliminar usuario', err);
        alert('Error al eliminar el usuario.');
      }
    });
  }

  // Genera las opciones del menú de acciones para cada usuario
  getActionItems(usuario: Usuarios): MenuItem[] {
    return [
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
        label: 'Eliminar',
        icon: 'pi pi-trash',
        command: () => this.eliminar(usuario)
      }
    ];
  }

  toggleEstado(usuario: Usuarios): void {
    // Cambiar el estado del usuario
    usuario.usua_Estado = !usuario.usua_Estado;
    console.log('Toggle estado:', usuario.usua_Nombre, usuario.usua_Estado);
    // TODO: implementar actualización en el backend
  }
}