import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastrService } from 'ngx-toastr';

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
    usua_Modificacion: number | null;
    viaj_FechaModificacion: string | null;
    colaboradoresJson: string;
    trpo_Nombres: string;
    trpo_Apellidos: string;
    trpo_DNI: string;
    trpo_Sexo: string;
    trpo_Placa: string;
    trpo_Vehiculo: string;
    sucu_Descripcion: string;
    usuarioCreacion: string;
    usuarioModificacion: string | null;
}

interface Transportista {
    trpo_Id: number;
    trpo_Nombres: string;
    trpo_Apellidos: string;
    trpo_DNI: string;
    trpo_Vehiculo: string;
    trpo_Placa: string;
}

@Component({
    selector: 'app-reporte-transportista',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        SelectModule,
        DatePickerModule,
        ButtonModule,
        CardModule
    ],
    templateUrl: './reporte-transportista.html',
    styleUrl: './reporte-transportista.scss'
})
export class ReporteTransportistaComponent implements OnInit {

    allViajes: Viaje[] = [];
    filteredViajes: any[] = [];
    transportistas: Transportista[] = [];

    selectedTransportista: Transportista | null = null;
    dateRange: Date[] | null = null;

    loading = false;
    loadingTransportistas = false;

    totalTarifaGlobal: number = 0;

    constructor(private http: HttpClient, private toastr: ToastrService) { }

    ngOnInit(): void {
        this.loadTransportistas();
        this.loadViajes();
    }

    loadTransportistas(): void {
        this.loadingTransportistas = true;
        this.http.get<Transportista[]>(`${environment.apiUrl}/Viajes/ListarTransportistas`, {
            headers: { 'x-api-key': environment.API_KEY }
        }).subscribe({
            next: (data) => {
                this.transportistas = data;
                this.loadingTransportistas = false;
            },
            error: (err) => {
                console.error('Error loading transportistas', err);
                this.toastr.error('Error al cargar transportistas');
                this.loadingTransportistas = false;
            }
        });
    }

    loadViajes(): void {
        this.loading = true;
        this.http.get<Viaje[]>(`${environment.apiUrl}/Viajes/ListarViajes`, {
            headers: { 'x-api-key': environment.API_KEY }
        }).subscribe({
            next: (data) => {
                this.allViajes = data;
                this.filterData();
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading viajes', err);
                this.toastr.error('Error al cargar viajes');
                this.loading = false;
            }
        });
    }

    onFilterChange(): void {
        this.filterData();
    }

    filterData(): void {
        if (!this.selectedTransportista) {
            this.filteredViajes = [];
            this.totalTarifaGlobal = 0;
            return;
        }

        let filtered = this.allViajes.filter(v => v.trpo_Id === this.selectedTransportista!.trpo_Id);

        if (this.dateRange && this.dateRange.length > 0) {
            const startDate = this.dateRange[0];
            const endDate = this.dateRange[1];

            if (startDate) {
                filtered = filtered.filter(v => {
                    const viaDate = new Date(v.viaj_Fecha);
                    // Reset times for comparison
                    viaDate.setHours(0, 0, 0, 0);
                    const start = new Date(startDate);
                    start.setHours(0, 0, 0, 0);

                    if (endDate) {
                        const end = new Date(endDate);
                        end.setHours(23, 59, 59, 999);
                        return viaDate >= start && viaDate <= end;
                    } else {
                        const end = new Date(startDate);
                        end.setHours(23, 59, 59, 999);
                        return viaDate >= start && viaDate <= end;
                    }
                });
            }
        }

        this.filteredViajes = filtered.map(v => {
            let colabs = [];
            try {
                colabs = JSON.parse(v.colaboradoresJson) || [];
            } catch { colabs = []; }

            const totalDist = colabs.reduce((sum: number, c: any) => sum + (c.ViDt_DistanciaCasa || 0), 0);

            return {
                ...v,
                calculatedColaboradoresCount: colabs.length,
                calculatedDistanciaTotal: totalDist,
                dateObj: new Date(v.viaj_Fecha)
            };
        });

        this.totalTarifaGlobal = this.filteredViajes.reduce((sum, v) => sum + (v.viaj_TarifaTotal || 0), 0);
    }

    getTransportistaFullName(): string {
        if (!this.selectedTransportista) return '';
        return `${this.selectedTransportista.trpo_Nombres} ${this.selectedTransportista.trpo_Apellidos}`;
    }

    clearFilters(): void {
        this.selectedTransportista = null;
        this.dateRange = null;
        this.filterData();
    }
}
