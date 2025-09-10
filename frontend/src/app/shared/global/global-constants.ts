/**
 * @description Questa classe fornisce costanti di utilità per tutto il progetto
 */

export class GlobalConstants {
    //Messages
    public static genericError: string = "Qualcosa è andato storto. Riprova più tardi";
    public static unauthorized: string = "Non sei autorizzato per accedere a questa pagina";

    //Regex
    public static nameRegex: string = "[a-zA-Z0-9 ]*";
    public static emailRegex: string = "[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}";
    public static contactNumberRegex: string = "^[e0-9]{10,10}$";

    //Variable
    public static error: string = "error";

}