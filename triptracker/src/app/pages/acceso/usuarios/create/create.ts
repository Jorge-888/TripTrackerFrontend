import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environment/environment';
import { Usuarios } from '../../../../models/usuariosModel';
import { ToastrService } from 'ngx-toastr';

// Importar componentes de PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { PasswordModule } from 'primeng/password';

// Interfaces para los datos de la API
interface Rol {
  role_Id: number;
  role_Descripcion: string;
  role_Estado: boolean;
}

interface Colaborador {
  colb_Id: number;
  colb_DNI: string;
  colb_Nombres: string;
  colb_Apellidos: string;
  colb_Telefono: string;
  colb_Sexo: string;
  colb_Direccion: string;
  colb_Estado: boolean;
}

@Component({
  selector: 'app-create',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    ToggleSwitchModule,
    PasswordModule
  ],
  standalone: true,
  templateUrl: './create.html',
  styleUrl: './create.scss'
})
export class CreateComponent implements OnInit {
  @Output() created = new EventEmitter<Usuarios>();
  @Output() cancel = new EventEmitter<void>();

  usuario: Usuarios = new Usuarios();

  // Listas para los dropdowns
  roles: Rol[] = [];
  colaboradores: Colaborador[] = [];

  // Estados de carga
  saving = false;
  loadingRoles = false;
  loadingColaboradores = false;

  // Errores de validación personalizados
  passwordError = '';

  constructor(private http: HttpClient, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.loadRoles();
    this.loadColaboradores();
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

  private loadRoles(): void {
    this.loadingRoles = true;
    this.http.get<Rol[]>(`${environment.apiUrl}/Usuarios/ListarRoles`, {
      headers: { 'x-api-key': environment.API_KEY }
    }).subscribe({
      next: data => {
        this.roles = Array.isArray(data) ? data.filter(r => r.role_Estado) : [];
        this.loadingRoles = false;
      },
      error: err => {
        console.error('Error al cargar roles', err);
        this.roles = [];
        this.loadingRoles = false;
        this.toastr.error('No se pudieron cargar los roles', 'Error');
      }
    });
  }

  private loadColaboradores(): void {
    this.loadingColaboradores = true;
    this.http.get<Colaborador[]>(`${environment.apiUrl}/Generales/ListarColaboradores`, {
      headers: { 'x-api-key': environment.API_KEY }
    }).subscribe({
      next: data => {
        this.colaboradores = Array.isArray(data) ? data.filter(c => c.colb_Estado) : [];
        this.loadingColaboradores = false;
      },
      error: err => {
        console.error('Error al cargar colaboradores', err);
        this.colaboradores = [];
        this.loadingColaboradores = false;
        this.toastr.error('No se pudieron cargar los colaboradores', 'Error');
      }
    });
  }

  // Formatear el nombre del colaborador para mostrar en el dropdown
  getColaboradorLabel(colaborador: Colaborador): string {
    return `${colaborador.colb_Nombres} ${colaborador.colb_Apellidos} (${colaborador.colb_DNI})`;
  }

  // Validar contraseña
  validatePassword(): boolean {
    if (!this.usuario.usua_Contrasena) {
      this.passwordError = 'La contraseña es requerida';
      this.toastr.warning('La contraseña es requerida', 'Advertencia');
      return false;
    }
    if (this.usuario.usua_Contrasena.length < 8) {
      this.passwordError = 'La contraseña debe tener al menos 8 caracteres';
      this.toastr.warning('La contraseña debe tener al menos 8 caracteres', 'Advertencia');
      return false;
    }
    this.passwordError = '';
    return true;
  }

  submit(form: NgForm): void {
    // Validar contraseña
    const passwordValid = this.validatePassword();

    // Validar rol
    if (!this.usuario.role_Id) {
      this.toastr.warning('Debes seleccionar un rol', 'Validación');
      form.control.markAllAsTouched();
      return;
    }

    // Validar colaborador
    if (!this.usuario.colb_Id) {
      this.toastr.warning('Debes seleccionar un colaborador', 'Validación');
      form.control.markAllAsTouched();
      return;
    }

    if (form.invalid || !passwordValid) {
      form.control.markAllAsTouched();
      this.toastr.warning('Por favor completa todos los campos requeridos', 'Formulario incompleto');
      return;
    }

    this.saving = true;

    this.usuario.usua_Creacion = 1;
    this.usuario.usua_Modificacion = 1;

    const usuarioInsert = {
      ...this.usuario,
      usua_FechaCreacion: this.formatLocalDateTime(new Date()),
      usua_FechaModificacion: this.formatLocalDateTime(new Date())
    };


    this.http.post<Usuarios>(`${environment.apiUrl}/Usuarios/Insertar`, usuarioInsert, {
      headers: { 'x-api-key': environment.API_KEY }
    }).subscribe({
      next: created => {
        this.saving = false;
        this.toastr.success('Usuario creado exitosamente', 'Éxito');
        this.created.emit(created);
        // Limpiar el formulario
        this.usuario = new Usuarios();
        this.passwordError = '';
        form.resetForm();
      },
      error: err => {
        this.saving = false;
        console.error('Error al crear usuario', err);
        this.toastr.error('No se pudo crear el usuario. Intenta de nuevo.', 'Error');
      }
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  // Helper para saber si un campo es inválido
  isFieldInvalid(form: NgForm, fieldName: string): boolean {
    const field = form.controls[fieldName];
    return !!(field && field.invalid && (field.dirty || field.touched || form.submitted));
  }
}
