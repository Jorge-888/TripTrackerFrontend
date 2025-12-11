import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environment/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CreateComponent } from '../create/create';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Table } from 'primeng/table';

// Importar componentes PrimeNG necesarios
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MenuModule } from 'primeng/menu';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';

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

@Component({
    selector: 'app-list',
    imports: [
        CommonModule,
        FormsModule,
        CreateComponent,
        CardModule,
        ButtonModule,
        TableModule,
        MenuModule,
        TagModule,
        SkeletonModule,
        InputTextModule
    ],
    standalone: true,
    templateUrl: './list.html',
    styleUrl: './list.scss'
})
export class ListComponent implements OnInit {
    @ViewChild('menu') menu!: Menu;
    @ViewChild('dt') table!: Table;

    colaboradores: Colaborador[] = [];
    loading = false;
    showCreateForm = false;
    menuItems: MenuItem[] = [];
    selectedColaborador: Colaborador | null = null;

    globalFilterValue: string = '';

    constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private toastr: ToastrService) { }

    ngOnInit(): void {
        this.cargarColaboradores();
    }

    cargarColaboradores(): void {
        this.loading = true;
        this.http.get<Colaborador[]>(`${environment.apiUrl}/Generales/ListarColaboradores`, {
            headers: { 'x-api-key': environment.API_KEY }
        }).subscribe({
            next: data => {
                console.log('Colaboradores cargados:', data);
                this.colaboradores = Array.isArray(data) ? data : [];
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: err => {
                console.error('Error al cargar colaboradores', err);
                this.colaboradores = [];
                this.loading = false;
                this.toastr.error('No se pudieron cargar los colaboradores', 'Error');
                this.cdr.detectChanges();
            }
        });
    }

    toggleCreateForm(): void {
        this.showCreateForm = !this.showCreateForm;
    }

    onColaboradorCreated(created: Colaborador): void {
        this.cargarColaboradores();
        this.showCreateForm = false;
    }

    onCancelCreate(): void {
        this.showCreateForm = false;
    }

    getNombreCompleto(colaborador: Colaborador): string {
        return `${colaborador.colb_Nombres} ${colaborador.colb_Apellidos}`;
    }

    getSexoLabel(sexo: string): string {
        return sexo === 'M' ? 'Masculino' : 'Femenino';
    }

    eliminar(colaborador: Colaborador): void {
        // Placeholder - no endpoint yet
        this.toastr.info('Función de eliminación pendiente de implementar', 'Información');
    }

    onMenuClick(event: Event, colaborador: Colaborador): void {
        this.selectedColaborador = colaborador;
        this.menuItems = [
            {
                label: 'Editar',
                icon: 'pi pi-pencil',
                command: () => this.editar(this.selectedColaborador!)
            },
            {
                label: 'Detalles',
                icon: 'pi pi-eye',
                command: () => this.detalles(this.selectedColaborador!)
            },
            {
                label: 'Eliminar',
                icon: 'pi pi-trash',
                command: () => this.eliminar(this.selectedColaborador!)
            }
        ];
        this.menu.toggle(event);
    }

    editar(colaborador: Colaborador): void {
        this.toastr.info('Función de edición pendiente de implementar', 'Información');
    }

    detalles(colaborador: Colaborador): void {
        this.toastr.info('Función de detalles pendiente de implementar', 'Información');
    }

    onGlobalFilter(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.table.filterGlobal(value, 'contains');
    }
}
