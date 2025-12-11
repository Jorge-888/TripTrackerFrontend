import { Component, EventEmitter, Output, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
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
    selector: 'app-edit',
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        ButtonModule,
        InputTextModule,
        SelectModule,
        ToggleSwitchModule
    ],
    standalone: true,
    templateUrl: './edit.html',
    styleUrl: './edit.scss'
})
export class EditComponent implements OnInit, OnChanges {
    @Input() usuario!: Usuarios;
    @Output() updated = new EventEmitter<Usuarios>();
    @Output() cancel = new EventEmitter<void>();

    usuarioEdit: Usuarios = new Usuarios();

    // Listas para los dropdowns
    roles: Rol[] = [];
    colaboradores: Colaborador[] = [];

    // Estados de carga
    saving = false;
    loadingRoles = false;
    loadingColaboradores = false;

    constructor(private http: HttpClient, private toastr: ToastrService) { }

    ngOnInit(): void {
        this.loadRoles();
        this.loadColaboradores();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['usuario'] && this.usuario) {
            // Crear una copia del usuario para editar
            this.usuarioEdit = { ...this.usuario };
        }
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

    submit(form: NgForm): void {
        // Validar rol
        if (!this.usuarioEdit.role_Id) {
            this.toastr.warning('Debes seleccionar un rol', 'Validación');
            form.control.markAllAsTouched();
            return;
        }

        // Validar colaborador
        if (!this.usuarioEdit.colb_Id) {
            this.toastr.warning('Debes seleccionar un colaborador', 'Validación');
            form.control.markAllAsTouched();
            return;
        }

        if (form.invalid) {
            form.control.markAllAsTouched();
            this.toastr.warning('Por favor completa todos los campos requeridos', 'Formulario incompleto');
            return;
        }

        this.saving = true;

        // Preparar el usuario para actualizar
        const usuarioActualizar = {
            ...this.usuarioEdit,
            usua_Contrasena: '',
            usua_Modificacion: 1,
            usua_FechaModificacion: this.formatLocalDateTime(new Date())
        };

        this.http.put<Usuarios>(`${environment.apiUrl}/Usuarios/Actualizar`, usuarioActualizar, {
            headers: { 'x-api-key': environment.API_KEY }
        }).subscribe({
            next: updated => {
                this.saving = false;
                this.toastr.success('Usuario actualizado exitosamente', 'Éxito');
                this.updated.emit(updated);
            },
            error: err => {
                this.saving = false;
                console.error('Error al actualizar usuario', err);
                this.toastr.error('No se pudo actualizar el usuario. Intenta de nuevo.', 'Error');
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
