import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environment/environment';
import { ToastrService } from 'ngx-toastr';

// Importar componentes de PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';

// Interfaces
interface Colaborador {
    colb_Id: number;
    colb_DNI: string;
    colb_Nombres: string;
    colb_Apellidos: string;
    colb_Telefono: string;
    colb_Sexo: string;
    colb_Direccion: string;
    esCi_Id: number;
    muni_Codigo: string;
    area_Id: number;
    carg_Id: number;
    colb_Estado: boolean;
    usua_Creacion: number;
    colb_FechaCreacion: string;
    usua_Modificacion: number;
    colb_FechaModificacion: string;
    sucursalesJson: string;
}

interface Area { area_Id: number; area_Descripcion: string; area_Estado: boolean; }
interface Cargo { carg_Id: number; carg_Descripcion: string; carg_Estado: boolean; }
interface EstadoCivil { esCi_Id: number; esCi_Descripcion: string; }
interface Municipio { muni_Codigo: string; muni_Descripcion: string; depa_Codigo: string; }
interface Departamento { depa_Codigo: string; depa_Descripcion: string; }
interface Sucursal { sucu_Id: number; sucu_Descripcion: string; muni_Codigo: string; sucu_Estado: boolean; }
interface SucursalColaborador { Sucu_Id: number; SuCo_DistanciaCasa: number; }

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
        InputMaskModule,
        InputNumberModule
    ],
    standalone: true,
    templateUrl: './create.html',
    styleUrl: './create.scss'
})
export class CreateComponent implements OnInit {
    @Output() created = new EventEmitter<Colaborador>();
    @Output() cancel = new EventEmitter<void>();

    colaborador: any = {
        colb_DNI: '',
        colb_Nombres: '',
        colb_Apellidos: '',
        colb_Telefono: '',
        colb_Sexo: 'M',
        colb_Direccion: '',
        esCi_Id: null,
        muni_Codigo: null,
        area_Id: null,
        carg_Id: null,
        colb_Estado: true
    };

    // Listas para dropdowns
    areas: Area[] = [];
    cargos: Cargo[] = [];
    estadosCiviles: EstadoCivil[] = [];
    municipios: Municipio[] = [];
    municipiosFiltrados: Municipio[] = [];
    departamentos: Departamento[] = [];
    sucursales: Sucursal[] = [];
    sucursalesDisponibles: Sucursal[] = [];

    // Sucursales del colaborador
    sucursalesColaborador: SucursalColaborador[] = [];
    sucursalSeleccionada: number | null = null;
    distanciaSeleccionada: number | null = null;

    // Departamento seleccionado
    departamentoSeleccionado: string | null = null;

    // Estados de carga
    saving = false;
    loadingData = false;

    constructor(private http: HttpClient, private toastr: ToastrService) { }

    ngOnInit(): void {
        this.loadAllData();
    }

    private formatLocalDateTime(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }

    private loadAllData(): void {
        this.loadingData = true;
        Promise.all([
            this.loadAreas(),
            this.loadCargos(),
            this.loadEstadosCiviles(),
            this.loadMunicipios(),
            this.loadDepartamentos(),
            this.loadSucursales()
        ]).then(() => {
            this.loadingData = false;
        }).catch(() => {
            this.loadingData = false;
        });
    }

    private loadAreas(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.http.get<Area[]>(`${environment.apiUrl}/Generales/ListarAreas`, {
                headers: { 'x-api-key': environment.API_KEY }
            }).subscribe({
                next: data => {
                    this.areas = Array.isArray(data) ? data.filter(a => a.area_Estado) : [];
                    resolve();
                },
                error: err => {
                    console.error('Error al cargar áreas', err);
                    this.toastr.error('No se pudieron cargar las áreas', 'Error');
                    reject(err);
                }
            });
        });
    }

    private loadCargos(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.http.get<Cargo[]>(`${environment.apiUrl}/Generales/ListarCargos`, {
                headers: { 'x-api-key': environment.API_KEY }
            }).subscribe({
                next: data => {
                    this.cargos = Array.isArray(data) ? data.filter(c => c.carg_Estado) : [];
                    resolve();
                },
                error: err => {
                    console.error('Error al cargar cargos', err);
                    this.toastr.error('No se pudieron cargar los cargos', 'Error');
                    reject(err);
                }
            });
        });
    }

    private loadEstadosCiviles(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.http.get<EstadoCivil[]>(`${environment.apiUrl}/Generales/ListarEstadosCiviles`, {
                headers: { 'x-api-key': environment.API_KEY }
            }).subscribe({
                next: data => {
                    this.estadosCiviles = Array.isArray(data) ? data : [];
                    resolve();
                },
                error: err => {
                    console.error('Error al cargar estados civiles', err);
                    this.toastr.error('No se pudieron cargar los estados civiles', 'Error');
                    reject(err);
                }
            });
        });
    }

    private loadMunicipios(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.http.get<Municipio[]>(`${environment.apiUrl}/Generales/ListarMunicipios`, {
                headers: { 'x-api-key': environment.API_KEY }
            }).subscribe({
                next: data => {
                    this.municipios = Array.isArray(data) ? data : [];
                    resolve();
                },
                error: err => {
                    console.error('Error al cargar municipios', err);
                    this.toastr.error('No se pudieron cargar los municipios', 'Error');
                    reject(err);
                }
            });
        });
    }

    private loadDepartamentos(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.http.get<Departamento[]>(`${environment.apiUrl}/Generales/ListarDepartamentos`, {
                headers: { 'x-api-key': environment.API_KEY }
            }).subscribe({
                next: data => {
                    this.departamentos = Array.isArray(data) ? data : [];
                    resolve();
                },
                error: err => {
                    console.error('Error al cargar departamentos', err);
                    this.toastr.error('No se pudieron cargar los departamentos', 'Error');
                    reject(err);
                }
            });
        });
    }

    private loadSucursales(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.http.get<Sucursal[]>(`${environment.apiUrl}/Generales/ListarSucursales`, {
                headers: { 'x-api-key': environment.API_KEY }
            }).subscribe({
                next: data => {
                    this.sucursales = Array.isArray(data) ? data.filter(s => s.sucu_Estado) : [];
                    this.actualizarSucursalesDisponibles();
                    resolve();
                },
                error: err => {
                    console.error('Error al cargar sucursales', err);
                    this.toastr.error('No se pudieron cargar las sucursales', 'Error');
                    reject(err);
                }
            });
        });
    }

    onDepartamentoChange(): void {
        if (this.departamentoSeleccionado) {
            this.municipiosFiltrados = this.municipios.filter(
                m => m.depa_Codigo === this.departamentoSeleccionado
            );
            this.colaborador.muni_Codigo = null;
        } else {
            this.municipiosFiltrados = [];
            this.colaborador.muni_Codigo = null;
        }
    }

    actualizarSucursalesDisponibles(): void {
        const idsSeleccionados = this.sucursalesColaborador.map(s => s.Sucu_Id);
        this.sucursalesDisponibles = this.sucursales.filter(s => !idsSeleccionados.includes(s.sucu_Id));
    }

    agregarSucursal(): void {
        if (!this.sucursalSeleccionada) {
            this.toastr.warning('Debes seleccionar una sucursal', 'Validación');
            return;
        }

        if (!this.distanciaSeleccionada || this.distanciaSeleccionada <= 0 || this.distanciaSeleccionada > 50) {
            this.toastr.warning('La distancia debe ser mayor a 0 y menor o igual a 50 km', 'Validación');
            return;
        }

        this.sucursalesColaborador.push({
            Sucu_Id: this.sucursalSeleccionada,
            SuCo_DistanciaCasa: this.distanciaSeleccionada
        });

        this.sucursalSeleccionada = null;
        this.distanciaSeleccionada = null;
        this.actualizarSucursalesDisponibles();
    }

    removerSucursal(index: number): void {
        this.sucursalesColaborador.splice(index, 1);
        this.actualizarSucursalesDisponibles();
    }

    getSucursalNombre(sucuId: number): string {
        const sucursal = this.sucursales.find(s => s.sucu_Id === sucuId);
        return sucursal ? sucursal.sucu_Descripcion : '';
    }

    validateForm(): boolean {
        if (!this.colaborador.colb_DNI || this.colaborador.colb_DNI.trim() === '') {
            this.toastr.warning('El DNI es requerido', 'Validación');
            return false;
        }

        if (!this.colaborador.colb_Nombres || this.colaborador.colb_Nombres.trim() === '') {
            this.toastr.warning('Los nombres son requeridos', 'Validación');
            return false;
        }

        if (!this.colaborador.colb_Apellidos || this.colaborador.colb_Apellidos.trim() === '') {
            this.toastr.warning('Los apellidos son requeridos', 'Validación');
            return false;
        }

        if (!this.colaborador.colb_Telefono || this.colaborador.colb_Telefono.trim() === '') {
            this.toastr.warning('El teléfono es requerido', 'Validación');
            return false;
        }

        if (!this.colaborador.colb_Direccion || this.colaborador.colb_Direccion.trim() === '') {
            this.toastr.warning('La dirección es requerida', 'Validación');
            return false;
        }

        if (!this.colaborador.esCi_Id) {
            this.toastr.warning('Debes seleccionar un estado civil', 'Validación');
            return false;
        }

        if (!this.colaborador.muni_Codigo) {
            this.toastr.warning('Debes seleccionar un municipio', 'Validación');
            return false;
        }

        if (!this.colaborador.area_Id) {
            this.toastr.warning('Debes seleccionar un área', 'Validación');
            return false;
        }

        if (!this.colaborador.carg_Id) {
            this.toastr.warning('Debes seleccionar un cargo', 'Validación');
            return false;
        }

        if (this.sucursalesColaborador.length === 0) {
            this.toastr.warning('Debes agregar al menos una sucursal', 'Validación');
            return false;
        }

        return true;
    }

    submit(form: NgForm): void {
        if (!this.validateForm()) {
            return;
        }

        this.saving = true;

        const colaboradorData = {
            ...this.colaborador,
            usua_Creacion: 1,
            colb_FechaCreacion: this.formatLocalDateTime(new Date()),
            usua_Modificacion: 1,
            colb_FechaModificacion: this.formatLocalDateTime(new Date()),
            sucursalesJson: JSON.stringify(this.sucursalesColaborador)
        };

        console.log(colaboradorData);

        this.http.post<Colaborador>(`${environment.apiUrl}/Generales/InsertarColaboradorCompleto`, colaboradorData, {
            headers: { 'x-api-key': environment.API_KEY }
        }).subscribe({
            next: created => {
                this.saving = false;
                this.toastr.success('Colaborador creado exitosamente', 'Éxito');
                this.created.emit(created);
                this.resetForm(form);
            },
            error: err => {
                this.saving = false;
                console.error('Error al crear colaborador', err);
                this.toastr.error('No se pudo crear el colaborador. Intenta de nuevo.', 'Error');
            }
        });
    }

    resetForm(form: NgForm): void {
        this.colaborador = {
            colb_DNI: '',
            colb_Nombres: '',
            colb_Apellidos: '',
            colb_Telefono: '',
            colb_Sexo: 'M',
            colb_Direccion: '',
            esCi_Id: null,
            muni_Codigo: null,
            area_Id: null,
            carg_Id: null,
            colb_Estado: true
        };
        this.departamentoSeleccionado = null;
        this.municipiosFiltrados = [];
        this.sucursalesColaborador = [];
        this.sucursalSeleccionada = null;
        this.distanciaSeleccionada = null;
        this.actualizarSucursalesDisponibles();
        form.resetForm();
    }

    onCancel(): void {
        this.cancel.emit();
    }
}
