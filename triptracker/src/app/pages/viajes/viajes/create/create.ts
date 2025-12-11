import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environment/environment';
import { ToastrService } from 'ngx-toastr';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';

interface Viaje {
    viaj_Id: number;
    viaj_Fecha: string;
    viaj_TarifaTotal: number;
    viaj_TarifaKM: number;
    trpo_Id: number;
    sucu_Id: number;
    viaj_Estado: boolean;
    usua_Creacion: number;
    viaj_FechaCreacion: string;
    usua_Modificacion: number;
    viaj_FechaModificacion: string;
    colaboradoresJson: string;
}

interface Sucursal { sucu_Id: number; sucu_Descripcion: string; sucu_Estado: boolean; }
interface Transportista {
    trpo_Id: number;
    trpo_DNI: string;
    trpo_Nombres: string;
    trpo_Apellidos: string;
    trpo_TarifaKM: number;
    trpo_Sexo: string;
    trpo_Placa: string;
    trpo_Vehiculo: string;
    trpo_Estado: boolean;
}

interface ColaboradorPorSucursal {
    colb_Id: number;
    colb_DNI: string;
    colb_Nombres: string;
    colb_Apellidos: string;
    colb_Telefono: string;
    colb_Sexo: string;
    colb_Direccion: string;
    suCo_Id: number;
    suCo_DistanciaCasa: number;
    sucu_Id: number;
    sucu_Descripcion: string;
    area_Descripcion: string;
    carg_Descripcion: string;
    selected: boolean;
    disabled: boolean;
}

interface ViajeExistente {
    viaj_Id: number;
    viaj_Fecha: string;
    colaboradoresJson: string;
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
        DatePickerModule,
        CheckboxModule
    ],
    standalone: true,
    templateUrl: './create.html',
    styleUrl: './create.scss'
})
export class CreateComponent implements OnInit {
    @Output() created = new EventEmitter<Viaje>();
    @Output() cancel = new EventEmitter<void>();

    viaje: any = {
        viaj_Fecha: null,
        trpo_Id: null,
        sucu_Id: null,
        viaj_Estado: true
    };

    sucursales: Sucursal[] = [];
    transportistas: Transportista[] = [];
    colaboradores: ColaboradorPorSucursal[] = [];
    viajesExistentes: ViajeExistente[] = [];

    selectedTransportista: Transportista | null = null;
    totalDistancia: number = 0;
    tarifaTotal: number = 0;
    distanciaExcedida: boolean = false;

    saving = false;
    loadingData = false;
    loadingColaboradores = false;

    constructor(private http: HttpClient, private toastr: ToastrService) { }

    ngOnInit(): void {
        this.loadInitialData();
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

    private loadInitialData(): void {
        this.loadingData = true;
        Promise.all([
            this.loadSucursales(),
            this.loadTransportistas(),
            this.loadViajesExistentes()
        ]).then(() => {
            this.loadingData = false;
        }).catch(() => {
            this.loadingData = false;
        });
    }

    private loadSucursales(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.http.get<Sucursal[]>(`${environment.apiUrl}/Generales/ListarSucursales`, {
                headers: { 'x-api-key': environment.API_KEY }
            }).subscribe({
                next: data => {
                    this.sucursales = Array.isArray(data) ? data.filter(s => s.sucu_Estado) : [];
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

    private loadTransportistas(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.http.get<Transportista[]>(`${environment.apiUrl}/Viajes/ListarTransportistas`, {
                headers: { 'x-api-key': environment.API_KEY }
            }).subscribe({
                next: data => {
                    this.transportistas = Array.isArray(data) ? data.filter(t => t.trpo_Estado) : [];
                    resolve();
                },
                error: err => {
                    console.error('Error al cargar transportistas', err);
                    this.toastr.error('No se pudieron cargar los transportistas', 'Error');
                    reject(err);
                }
            });
        });
    }

    private loadViajesExistentes(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.http.get<ViajeExistente[]>(`${environment.apiUrl}/Viajes/ListarViajes`, {
                headers: { 'x-api-key': environment.API_KEY }
            }).subscribe({
                next: data => {
                    this.viajesExistentes = Array.isArray(data) ? data : [];
                    resolve();
                },
                error: err => {
                    console.error('Error al cargar viajes existentes', err);
                    reject(err);
                }
            });
        });
    }

    onTransportistaChange(): void {
        if (this.viaje.trpo_Id) {
            this.selectedTransportista = this.transportistas.find(t => t.trpo_Id === this.viaje.trpo_Id) || null;
            this.calculateTarifaTotal();
        } else {
            this.selectedTransportista = null;
            this.tarifaTotal = 0;
        }
    }

    onSucursalChange(): void {
        if (this.viaje.sucu_Id) {
            this.loadColaboradoresPorSucursal();
        } else {
            this.colaboradores = [];
            this.resetCalculations();
        }
    }

    private loadColaboradoresPorSucursal(): void {
        this.loadingColaboradores = true;
        this.http.get<ColaboradorPorSucursal[]>(`${environment.apiUrl}/Viajes/ListarColaboradoresPorSucursal/${this.viaje.sucu_Id}`, {
            headers: { 'x-api-key': environment.API_KEY }
        }).subscribe({
            next: data => {
                this.colaboradores = Array.isArray(data) ? data.map(c => ({
                    ...c,
                    selected: false,
                    disabled: false
                })) : [];
                this.checkColaboradorDisponibilidad();
                this.loadingColaboradores = false;
            },
            error: err => {
                console.error('Error al cargar colaboradores', err);
                this.toastr.error('No se pudieron cargar los colaboradores', 'Error');
                this.colaboradores = [];
                this.loadingColaboradores = false;
            }
        });
    }

    getSelectedCount(): number {
        return this.colaboradores.filter(c => c.selected).length;
    }

    onFechaChange(): void {
        if (this.viaje.viaj_Fecha && this.colaboradores.length > 0) {
            this.checkColaboradorDisponibilidad();
        }
    }

    private checkColaboradorDisponibilidad(): void {
        if (!this.viaje.viaj_Fecha) return;

        const fechaSeleccionada = new Date(this.viaje.viaj_Fecha).toDateString();

        this.colaboradores.forEach(colaborador => {
            const viajeEnFecha = this.viajesExistentes.find(viaje => {
                const viajesFecha = new Date(viaje.viaj_Fecha).toDateString();
                if (viajesFecha === fechaSeleccionada) {
                    try {
                        const colaboradoresViaje = JSON.parse(viaje.colaboradoresJson);
                        return colaboradoresViaje.some((c: any) => c.Colb_Id === colaborador.colb_Id);
                    } catch {
                        return false;
                    }
                }
                return false;
            });

            colaborador.disabled = !!viajeEnFecha;
            if (colaborador.disabled && colaborador.selected) {
                colaborador.selected = false;
            }
        });

        this.calculateDistanciaTotal();
    }

    onColaboradorToggle(colaborador: ColaboradorPorSucursal): void {
        if (!colaborador.disabled) {
            colaborador.selected = !colaborador.selected;
            this.calculateDistanciaTotal();
        }
    }

    calculateDistanciaTotal(): void {
        this.totalDistancia = this.colaboradores
            .filter(c => c.selected)
            .reduce((sum, c) => sum + Number(c.suCo_DistanciaCasa || 0), 0);

        this.distanciaExcedida = this.totalDistancia > 100;

        if (this.distanciaExcedida) {
            this.toastr.warning('La distancia total no puede exceder 100 km', 'Validación');
        }

        this.calculateTarifaTotal();
    }

    private calculateTarifaTotal(): void {
        if (this.selectedTransportista && this.totalDistancia > 0) {
            this.tarifaTotal = this.totalDistancia * Number(this.selectedTransportista.trpo_TarifaKM);
        } else {
            this.tarifaTotal = 0;
        }
    }

    private resetCalculations(): void {
        this.totalDistancia = 0;
        this.tarifaTotal = 0;
        this.distanciaExcedida = false;
    }

    getTransportistaNombre(transportista: Transportista): string {
        return `${transportista.trpo_Nombres} ${transportista.trpo_Apellidos}`;
    }

    getColaboradorNombre(colaborador: ColaboradorPorSucursal): string {
        return `${colaborador.colb_Nombres} ${colaborador.colb_Apellidos}`;
    }

    validateForm(): boolean {
        if (!this.viaje.viaj_Fecha) {
            this.toastr.warning('La fecha es requerida', 'Validación');
            return false;
        }

        if (!this.viaje.sucu_Id) {
            this.toastr.warning('Debes seleccionar una sucursal', 'Validación');
            return false;
        }

        if (!this.viaje.trpo_Id) {
            this.toastr.warning('Debes seleccionar un transportista', 'Validación');
            return false;
        }

        const selectedColaboradores = this.colaboradores.filter(c => c.selected);
        if (selectedColaboradores.length === 0) {
            this.toastr.warning('Debes seleccionar al menos un colaborador', 'Validación');
            return false;
        }

        if (this.distanciaExcedida) {
            this.toastr.warning('La distancia total excede el límite de 100 km', 'Validación');
            return false;
        }

        if (this.totalDistancia === 0) {
            this.toastr.warning('La distancia total no puede ser 0', 'Validación');
            return false;
        }

        if (this.tarifaTotal === 0) {
            this.toastr.warning('La tarifa total no puede ser 0', 'Validación');
            return false;
        }

        return true;
    }

    submit(form: NgForm): void {
        this.calculateDistanciaTotal();

        if (!this.validateForm()) {
            return;
        }

        this.saving = true;

        const selectedColaboradores = this.colaboradores
            .filter(c => c.selected)
            .map(c => ({
                SuCo_Id: c.suCo_Id,
                ViDt_DistanciaCasa: c.suCo_DistanciaCasa
            }));

        const now = new Date();

        const usuarioActual = localStorage.getItem('usuarioActual');
        const userId = usuarioActual ? JSON.parse(usuarioActual).usua_Id : 1;

        const viajeData = {
            viaj_Fecha: this.formatLocalDateTime(this.viaje.viaj_Fecha),
            viaj_TarifaTotal: this.tarifaTotal,
            viaj_TarifaKM: this.selectedTransportista!.trpo_TarifaKM,
            trpo_Id: this.viaje.trpo_Id,
            sucu_Id: this.viaje.sucu_Id,
            viaj_Estado: true,
            usua_Creacion: userId,
            viaj_FechaCreacion: this.formatLocalDateTime(now),
            usua_Modificacion: userId,
            viaj_FechaModificacion: this.formatLocalDateTime(now),
            colaboradoresJson: JSON.stringify(selectedColaboradores)
        };

        this.http.post<Viaje>(`${environment.apiUrl}/Viajes/InsertarViajesCompleto`, viajeData, {
            headers: { 'x-api-key': environment.API_KEY }
        }).subscribe({
            next: created => {
                this.saving = false;
                this.toastr.success('Viaje creado exitosamente', 'Éxito');
                this.created.emit(created);
                this.resetForm(form);
            },
            error: err => {
                this.saving = false;
                console.error('Error al crear viaje', err);
                this.toastr.error('No se pudo crear el viaje. Intenta de nuevo.', 'Error');
            }
        });
    }

    resetForm(form: NgForm): void {
        this.viaje = {
            viaj_Fecha: null,
            trpo_Id: null,
            sucu_Id: null,
            viaj_Estado: true
        };
        this.selectedTransportista = null;
        this.colaboradores = [];
        this.resetCalculations();
        form.resetForm();
    }

    onCancel(): void {
        this.cancel.emit();
    }
}
