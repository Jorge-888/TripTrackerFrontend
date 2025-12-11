import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { MenuModule } from 'primeng/menu';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, MenuModule, AppConfigurator],
    template: ` <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" routerLink="/">
                
                <span>TripTracker</span>
            </a>
        </div>

        <div class="layout-topbar-actions">
            

            <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    
                    <button type="button" class="layout-topbar-action" (click)="userMenu.toggle($event)" style="position: relative;">
                        <i class="pi pi-user"></i>
                        <span>{{ usuarioActual?.usua_Nombre || 'Usuario' }}</span>
                    </button>
                    <p-menu #userMenu [model]="userMenuItems" [popup]="true" [style]="{'min-width': '200px'}"></p-menu>
                </div>
            </div>
        </div>
    </div>`
})


// <button type="button" class="layout-topbar-action">
//     <i class="pi pi-calendar"></i>
//     <span>Calendar</span>
// </button>
// <button type="button" class="layout-topbar-action">
//     <i class="pi pi-inbox"></i>
//     <span>Messages</span>
// </button>
export class AppTopbar implements OnInit {
    items!: MenuItem[];
    usuarioActual: any = null;
    userMenuItems: MenuItem[] = [];

    constructor(
        public layoutService: LayoutService,
        private router: Router
    ) { }

    ngOnInit(): void {
        // Obtener usuario actual del localStorage
        const usuarioStr = localStorage.getItem('usuarioActual');
        if (usuarioStr) {
            this.usuarioActual = JSON.parse(usuarioStr);
        }

        // Configurar menú de usuario
        this.userMenuItems = [
            {
                label: 'Perfil',
                icon: 'pi pi-user',
                command: () => this.goToProfile()
            },
            {
                separator: true
            },
            {
                label: 'Cerrar Sesión',
                icon: 'pi pi-sign-out',
                command: () => this.logout(),
                style: { 'color': '#ef4444' }
            }
        ];
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    goToProfile(): void {
        // Implementar navegación al perfil cuando esté disponible
        console.log('Ir a perfil');
    }

    logout(): void {
        // Limpiar localStorage
        localStorage.removeItem('usuarioActual');

        // Navegar al login
        this.router.navigate(['/login']);
    }
}



// <div class="layout-config-menu">
//                 <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
//                     <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
//                 </button>
//                 <div class="relative">
//                     <button
//                         class="layout-topbar-action layout-topbar-action-highlight"
//                         pStyleClass="@next"
//                         enterFromClass="hidden"
//                         enterActiveClass="animate-scalein"
//                         leaveToClass="hidden"
//                         leaveActiveClass="animate-fadeout"
//                         [hideOnOutsideClick]="true"
//                     >
//                         <i class="pi pi-palette"></i>
//                     </button>
//                     <app-configurator />
//                 </div>
//             </div>