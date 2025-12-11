import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environment/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CreateComponent } from '../create/create';
import { EditComponent } from '../edit/edit';
import { DetailsComponent } from '../details/details';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Table } from 'primeng/table';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MenuModule } from 'primeng/menu';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';

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

@Component({
    selector: 'app-list',
    imports: [
        CommonModule,
        FormsModule,
        CreateComponent,
        EditComponent,
        DetailsComponent,
        CardModule,
        ButtonModule,
        TableModule,
        MenuModule,
        TagModule,
        SkeletonModule,
        DialogModule,
        InputTextModule,
        DatePickerModule
    ],
    standalone: true,
    templateUrl: './list.html',
    styleUrl: './list.scss'
})
export class ListComponent implements OnInit {
    @ViewChild('menu') menu!: Menu;
    @ViewChild('dt') table!: Table;

    viajes: Viaje[] = [];
    loading = false;
    showCreateForm = false;
    showEditForm = false;
    showDetailsView = false;
    showDeleteModal = false;
    menuItems: MenuItem[] = [];
    selectedViaje: Viaje | null = null;

    globalFilterValue: string = '';
    dateFilterValue: Date | null = null;

    constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private toastr: ToastrService) { }

    ngOnInit(): void {
        this.cargarViajes();
    }

    cargarViajes(): void {
        this.loading = true;
        this.http.get<Viaje[]>(`${environment.apiUrl}/Viajes/ListarViajes`, {
            headers: { 'x-api-key': environment.API_KEY }
        }).subscribe({
            next: data => {
                this.viajes = Array.isArray(data) ? data : [];
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: err => {
                console.error('Error al cargar viajes', err);
                this.viajes = [];
                this.loading = false;
                this.toastr.error('No se pudieron cargar los viajes', 'Error');
                this.cdr.detectChanges();
            }
        });
    }

    toggleCreateForm(): void {
        this.showCreateForm = !this.showCreateForm;
    }

    onViajeCreated(created: any): void {
        this.cargarViajes();
        this.showCreateForm = false;
    }

    onCancelCreate(): void {
        this.showCreateForm = false;
    }

    getTransportistaNombre(viaje: Viaje): string {
        return `${viaje.trpo_Nombres} ${viaje.trpo_Apellidos}`;
    }

    formatFecha(fecha: string): string {
        return new Date(fecha).toLocaleDateString('es-HN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    onMenuClick(event: Event, viaje: Viaje): void {
        this.selectedViaje = viaje;
        this.menuItems = [
            {
                label: 'Editar',
                icon: 'pi pi-pencil',
                command: () => this.editar(this.selectedViaje!)
            },
            {
                label: 'Detalles',
                icon: 'pi pi-eye',
                command: () => this.detalles(this.selectedViaje!)
            },
            {
                label: 'Eliminar',
                icon: 'pi pi-trash',
                command: () => this.eliminar(this.selectedViaje!)
            }
        ];
        this.menu.toggle(event);
    }

    editar(viaje: Viaje): void {
        this.selectedViaje = viaje;
        this.showEditForm = true;
    }

    detalles(viaje: Viaje): void {
        this.selectedViaje = viaje;
        this.showDetailsView = true;
    }

    eliminar(viaje: Viaje): void {
        this.selectedViaje = viaje;
        this.showDeleteModal = true;
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

    confirmDelete(): void {
        if (!this.selectedViaje) return;

        console.log(this.selectedViaje);

        const usuarioActual = localStorage.getItem('usuarioActual');
        const userId = JSON.parse(usuarioActual!).usua_Id;

        console.log(usuarioActual);
        console.log(userId);

        this.selectedViaje.usua_Modificacion = userId;
        this.selectedViaje.viaj_FechaModificacion = this.formatLocalDateTime(new Date());

        this.http.post(`${environment.apiUrl}/Viajes/EliminarViaje`, this.selectedViaje, {
            headers: { 'x-api-key': environment.API_KEY }
        }).subscribe({
            next: () => {
                this.toastr.success('Viaje eliminado exitosamente', 'Éxito');
                this.showDeleteModal = false;
                this.selectedViaje = null;
                this.cargarViajes();
            },
            error: err => {
                console.error('Error al eliminar viaje', err);
                this.toastr.error('No se pudo eliminar el viaje', 'Error');
            }
        });
    }

    cancelDelete(): void {
        this.showDeleteModal = false;
        this.selectedViaje = null;
    }

    onViajeUpdated(updated: any): void {
        this.showEditForm = false;
        this.selectedViaje = null;
        this.cargarViajes();
    }

    onEditCancelled(): void {
        this.showEditForm = false;
        this.selectedViaje = null;
    }

    onDetailsClose(): void {
        this.showDetailsView = false;
        this.selectedViaje = null;
    }

    onGlobalFilter(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.table.filterGlobal(value, 'contains');
    }

    onDateFilter(): void {
        if (this.dateFilterValue) {
            const selectedDate = new Date(this.dateFilterValue).toDateString();
            this.table.filter(selectedDate, 'viaj_Fecha', 'contains');
        }
    }

    clearDateFilter(): void {
        this.dateFilterValue = null;
        this.table.filter('', 'viaj_Fecha', 'contains');
    }
}
