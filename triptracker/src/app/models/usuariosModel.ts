export class Usuarios {
    usua_Id: number = 0;
    usua_Nombre: string = "";
    usua_Admin: boolean = false;
    usua_Contrasena: string = "";

    role_Id: number = 0;
    colb_Id: number = 0;

    usua_Creacion: number = 0;
    usua_FechaCreacion: Date = new Date();
    usua_Modificacion: number = 0;
    usua_FechaModificacion: Date = new Date();
    usua_Estado: boolean = true;

    usuarioCreacion: string = "";
    usuarioModificacion: string = "";
    // code_Status: number = 0;
    // message_Status: string = "";

    constructor(init?: Partial<Usuarios>) {
        Object.assign(this, init);
    }
}