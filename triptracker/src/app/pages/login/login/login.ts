import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';

// Importar componentes de PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { Usuarios } from '../../../models/usuariosModel';



@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule
  ],
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {

  usuario = new Usuarios;


  rememberMe = false;
  loading = false;
  errorMessage = '';

  // logoPath = new URL('/assets/images/busLogin.png', import.meta.url).href;

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // Llamada al API de login
    this.http.post<any>(`${environment.apiUrl}/Usuarios/Login`, this.usuario, {
      headers: { 'x-api-key': environment.API_KEY }
    }).subscribe({
      next: response => {
        this.loading = false;

        console.log('Respuesta del login:', response);
        if (response.usua_Id > 0) {
          localStorage.setItem('usuarioActual', JSON.stringify(response));
          localStorage.setItem('userId', response.usua_Id.toString());
        }



        this.router.navigate(['/']);
      },
      error: err => {
        this.loading = false;
        console.error('Error al iniciar sesión', err);

        // Personalizar mensaje según el código de error
        if (err.status === 401) {
          this.errorMessage = 'Usuario o contraseña incorrectos';
        } else if (err.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor';
        } else {
          this.errorMessage = 'Error al iniciar sesión. Intenta de nuevo.';
        }
      }
    });
  }

  isFieldInvalid(form: NgForm, fieldName: string): boolean {
    const field = form.controls[fieldName];
    return !!(field && field.invalid && (field.dirty || field.touched || form.submitted));
  }

  ngOnInit(): void {


  }
}