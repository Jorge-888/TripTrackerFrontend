import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';

// Importar componentes PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';

interface DashboardStats {
    totalViajes: number;
    viajesActivos: number;
    viajesCompletados: number;
    totalUsuarios: number;
    totalSucursales: number;
}

interface RecentTrip {
    id: number;
    destino: string;
    fecha: Date;
    estado: string;
    pasajeros: number;
}

@Component({
    selector: 'app-home',
    imports: [
        CommonModule,
        CardModule,
        ButtonModule,
        ChartModule,
        TableModule,
        TagModule,
        SkeletonModule
    ],
    standalone: true,
    templateUrl: './home.html',
    styleUrl: './home.scss'
})
export class HomeComponent implements OnInit {
    loading = true;
    usuarioActual: any = null;

    // Estadísticas del dashboard
    stats: DashboardStats = {
        totalViajes: 0,
        viajesActivos: 0,
        viajesCompletados: 0,
        totalUsuarios: 0,
        totalSucursales: 0
    };

    // Viajes recientes (datos de ejemplo)
    recentTrips: RecentTrip[] = [];

    // Datos para el gráfico
    chartData: any;
    chartOptions: any;

    constructor(
        private router: Router,
        private http: HttpClient
    ) { }

    ngOnInit(): void {
        // Obtener usuario actual del localStorage
        const usuarioStr = localStorage.getItem('usuarioActual');
        if (usuarioStr) {
            this.usuarioActual = JSON.parse(usuarioStr);
        }

        this.loadDashboardData();
        this.setupChart();
    }

    private loadDashboardData(): void {
        this.loading = true;

        // Cargar usuarios y sucursales desde la API
        Promise.all([
            this.http.get<any[]>(`${environment.apiUrl}/Usuarios/Listar`, {
                headers: { 'x-api-key': environment.API_KEY }
            }).toPromise(),
            this.http.get<any[]>(`${environment.apiUrl}/Generales/ListarSucursales`, {
                headers: { 'x-api-key': environment.API_KEY }
            }).toPromise()
        ]).then(([usuarios, sucursales]) => {
            this.stats = {
                totalViajes: 0, // Placeholder
                viajesActivos: 0, // Placeholder
                viajesCompletados: 0, // Placeholder
                totalUsuarios: Array.isArray(usuarios) ? usuarios.length : 0,
                totalSucursales: Array.isArray(sucursales) ? sucursales.length : 0
            };

            this.recentTrips = [
                // Datos de ejemplo - comentar cuando tengas endpoint de viajes
                {
                    id: 1,
                    destino: 'San Pedro Sula',
                    fecha: new Date('2025-12-10'),
                    estado: 'Activo',
                    pasajeros: 35
                },
                {
                    id: 2,
                    destino: 'La Ceiba',
                    fecha: new Date('2025-12-09'),
                    estado: 'Completado',
                    pasajeros: 42
                },
                {
                    id: 3,
                    destino: 'Comayagua',
                    fecha: new Date('2025-12-08'),
                    estado: 'Activo',
                    pasajeros: 28
                },
                {
                    id: 4,
                    destino: 'Choluteca',
                    fecha: new Date('2025-12-07'),
                    estado: 'Completado',
                    pasajeros: 38
                },
                {
                    id: 5,
                    destino: 'Copán Ruinas',
                    fecha: new Date('2025-12-06'),
                    estado: 'Completado',
                    pasajeros: 30
                }
            ];

            this.loading = false;
        }).catch(error => {
            console.error('Error al cargar datos del dashboard', error);
            this.loading = false;
        });
    }

    private setupChart(): void {
        const documentStyle = getComputedStyle(document.documentElement);

        this.chartData = {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'Viajes Completados',
                    data: [22, 28, 25, 30, 27, 32],
                    backgroundColor: 'rgba(135, 93, 74, 0.2)',
                    borderColor: '#875D4A',
                    borderWidth: 2,
                    tension: 0.4
                }
            ]
        };

        this.chartOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            layout: {
                padding: {
                    top: 10,
                    right: 10,
                    bottom: 10,
                    left: 10
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#495057'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#495057'
                    },
                    grid: {
                        color: '#ebedef'
                    }
                },
                y: {
                    ticks: {
                        color: '#495057'
                    },
                    grid: {
                        color: '#ebedef'
                    }
                }
            }
        };
    }

    // Navegación rápida
    navigateToUsuarios(): void {
        this.router.navigate(['/acceso/usuarios']);
    }

    navigateToColaboradores(): void {
        this.router.navigate(['/general/colaboradores']);
    }

    navigateToViajes(): void {
        this.router.navigate(['/viajes/viajes']);
    }

    // Obtener severity para el tag de estado
    getEstadoSeverity(estado: string): 'success' | 'info' | 'warning' | 'danger' {
        switch (estado) {
            case 'Completado':
                return 'success';
            case 'Activo':
                return 'info';
            case 'Pendiente':
                return 'warning';
            default:
                return 'danger';
        }
    }

    // Formatear fecha
    formatDate(date: Date): string {
        return new Date(date).toLocaleDateString('es-HN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }
}
