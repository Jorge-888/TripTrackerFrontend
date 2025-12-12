import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { ListComponent as UsuariosList } from './app/pages/acceso/usuarios/list/list';
import { ListComponent as ColaboradoresList } from './app/pages/generales/colaboradores/list/list';
import { ListComponent as ViajesList } from './app/pages/viajes/viajes/list/list';

import { LoginComponent } from './app/pages/login/login/login';
import { HomeComponent } from './app/pages/home/home';
import { ReporteTransportistaComponent } from './app/pages/viajes/reporte-transportista/reporte-transportista';





export const appRoutes: Routes = [

    {
        path: '',
        component: AppLayout,
        children: [
            { path: '', component: HomeComponent },
            // { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
            // { path: 'documentation', component: Documentation },
            // { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }

        ]
    },
    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },



    {
        path: 'acceso',
        component: AppLayout,
        children: [
            { path: '', component: Dashboard },
            { path: 'usuarios', component: UsuariosList },

        ]
    },
    {
        path: 'general',
        component: AppLayout,
        children: [
            { path: 'colaboradores', component: ColaboradoresList },

        ]
    },
    {
        path: 'viajes',
        component: AppLayout,
        children: [
            { path: 'viajes', component: ViajesList },
            { path: 'reportetransportista', component: ReporteTransportistaComponent }
        ]
    },



    { path: 'login', component: LoginComponent },



    { path: '**', redirectTo: '/notfound' },

];
