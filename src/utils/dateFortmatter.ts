export const formatSpanishDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);

    return `${day}/${month}/${year}`;
};
export function formatFecha(fecha: string): string {
    // Verificar si la fecha ya está en el formato deseado (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        // La fecha ya está en el formato deseado, devolverla directamente
        return fecha;
    } else if (/^\d{2}\/\d{2}\/\d{2}$/.test(fecha)) {
        // La fecha está en el formato "DD/MM/YY", convertirla a "YYYY-MM-DD"
        const partes = fecha.split('/');
        const year = parseInt(partes[2]) < 100 ? `20${partes[2]}` : partes[2];
        const formattedFecha = `${year}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
        return formattedFecha;
    } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) {
        // La fecha está en el formato "DD/MM/YYYY", convertirla a "YYYY-MM-DD"
        const partes = fecha.split('/');
        const formattedFecha = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
        return formattedFecha;
    }
    return fecha;
}
