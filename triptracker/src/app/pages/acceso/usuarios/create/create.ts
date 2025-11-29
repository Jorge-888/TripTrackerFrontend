import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environment/environment';
import { Usuarios } from '../../../../models/usuariosModel';

// Importar componentes de PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-create',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    ToggleSwitch,
    PasswordModule
  ],
  standalone: true,
  templateUrl: './create.html',
  styleUrl: './create.scss'
})
export class CreateComponent {
  @Output() created = new EventEmitter<Usuarios>();
  @Output() cancel = new EventEmitter<void>();

  usuario: Usuarios = new Usuarios();

  saving = false;

  constructor(private http: HttpClient) { }

  submit(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.saving = true;

    this.usuario.usua_Creacion = 1;
    this.usuario.usua_FechaCreacion = new Date();
    this.usuario.usua_Modificacion = 1;


    this.http.post<Usuarios>(`${environment.apiUrl}/Usuarios/Insertar`, this.usuario, {
      headers: { 'x-api-key': environment.API_KEY }
    }).subscribe({
      next: created => {
        this.saving = false;
        this.created.emit(created);
        // Limpiar el formulario
        this.usuario = new Usuarios();
        form.resetForm();
      },
      error: err => {
        this.saving = false;
        console.error('Error al crear usuario', err);
        alert('Error al crear el usuario. Intenta de nuevo.');
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