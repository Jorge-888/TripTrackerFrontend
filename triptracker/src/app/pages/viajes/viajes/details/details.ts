import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environment/environment';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

interface ViajeDetalle {
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

interface ColaboradorDetalle {
    Colb_Id: number;
    SuCo_Id: number;
    ViDt_DistanciaCasa: number;
}

interface ColaboradorCompleto {
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
    distanciaViaje?: number;
}

@Component({
    selector: 'app-details',
    imports: [
        CommonModule,
        CardModule,
        ButtonModule,
        TagModule
    ],
    standalone: true,
    templateUrl: './details.html',
    styleUrl: './details.scss'
})
export class DetailsComponent implements OnInit {
    @Input() viaje!: ViajeDetalle;
    @Output() close = new EventEmitter<void>();

    colaboradores: ColaboradorCompleto[] = [];
    loading = false;

    constructor(private http: HttpClient) { }

    ngOnInit(): void {
        if (this.viaje && this.viaje.colaboradoresJson && this.viaje.sucu_Id) {
            this.loadColaboradores();
        }
    }

    private loadColaboradores(): void {
        this.loading = true;

        // Parse the colaboradores from JSON
        let colaboradoresIds: ColaboradorDetalle[] = [];
        try {
            colaboradoresIds = JSON.parse(this.viaje.colaboradoresJson);
        } catch (error) {
            console.error('Error parsing colaboradoresJson', error);
            this.loading = false;
            return;
        }

        // Fetch full colaborador data from the endpoint
        this.http.get<ColaboradorCompleto[]>(`${environment.apiUrl}/Viajes/ListarColaboradoresPorSucursal/${this.viaje.sucu_Id}`, {
            headers: { 'x-api-key': environment.API_KEY }
        }).subscribe({
            next: (allColaboradores) => {
                // Match and combine the data
                this.colaboradores = colaboradoresIds.map(colabId => {
                    const fullData = allColaboradores.find(c => c.colb_Id === colabId.Colb_Id);
                    if (fullData) {
                        return {
                            ...fullData,
                            distanciaViaje: colabId.ViDt_DistanciaCasa
                        };
                    }
                    // Fallback if not found
                    return {
                        colb_Id: colabId.Colb_Id,
                        colb_DNI: 'N/A',
                        colb_Nombres: 'Colaborador',
                        colb_Apellidos: `#${colabId.Colb_Id}`,
                        colb_Telefono: '',
                        colb_Sexo: '',
                        colb_Direccion: '',
                        suCo_Id: colabId.SuCo_Id,
                        suCo_DistanciaCasa: colabId.ViDt_DistanciaCasa,
                        sucu_Id: this.viaje.sucu_Id,
                        sucu_Descripcion: this.viaje.sucu_Descripcion,
                        area_Descripcion: 'N/A',
                        carg_Descripcion: 'N/A',
                        distanciaViaje: colabId.ViDt_DistanciaCasa
                    };
                });
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading colaboradores', err);
                this.loading = false;
                // Use basic data from JSON
                this.colaboradores = colaboradoresIds.map(colabId => ({
                    colb_Id: colabId.Colb_Id,
                    colb_DNI: 'N/A',
                    colb_Nombres: 'Colaborador',
                    colb_Apellidos: `#${colabId.Colb_Id}`,
                    colb_Telefono: '',
                    colb_Sexo: '',
                    colb_Direccion: '',
                    suCo_Id: colabId.SuCo_Id,
                    suCo_DistanciaCasa: colabId.ViDt_DistanciaCasa,
                    sucu_Id: this.viaje.sucu_Id,
                    sucu_Descripcion: this.viaje.sucu_Descripcion,
                    area_Descripcion: 'N/A',
                    carg_Descripcion: 'N/A',
                    distanciaViaje: colabId.ViDt_DistanciaCasa
                }));
            }
        });
    }

    formatFecha(fecha: string): string {
        return new Date(fecha).toLocaleDateString('es-HN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getTransportistaNombre(): string {
        return `${this.viaje.trpo_Nombres} ${this.viaje.trpo_Apellidos}`;
    }

    getColaboradorNombre(colaborador: ColaboradorCompleto): string {
        return `${colaborador.colb_Nombres} ${colaborador.colb_Apellidos}`;
    }

    getTotalDistancia(): number {
        return this.colaboradores.reduce((sum, c) => sum + (c.distanciaViaje || 0), 0);
    }

    onClose(): void {
        this.close.emit();
    }
}
