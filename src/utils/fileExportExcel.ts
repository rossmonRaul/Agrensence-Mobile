import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
export async function createExcelFile(title: string, data: any[], keyMapping: Record<string, string>, fileName: string): Promise<string> {
    try {
        // Verificar que las claves proporcionadas existan en al menos un objeto del JSON
        const keys = Object.keys(keyMapping);
        if (!data.length || keys.some(key => !(keyMapping[key] in data[0]))) {
            console.error('Claves proporcionadas no válidas.');
            return '';
        }
        // Crear un nuevo libro de Excel
        const workbook: XLSX.WorkBook = XLSX.utils.book_new();

        // Crear una nueva hoja en el libro de Excel
        const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([]);

        // Obtener los encabezados del keyMapping
        const headers: string[] = Object.keys(keyMapping).map(key => key);

        // Mapear los datos y agregarlos a la hoja
        const dataArray: any[][] = [headers, ...data.map(obj => keys.map(key => obj[keyMapping[key]]))];
        XLSX.utils.sheet_add_aoa(worksheet, dataArray);
        XLSX.utils.book_append_sheet(workbook, worksheet, title);

        // Convertir el libro de Excel a un archivo base64
        const excelBase64: string = XLSX.write(workbook, { type: 'base64' });

        // Obtener la ruta del archivo
        const filePath: string = `${FileSystem.documentDirectory}${fileName}.xlsx`;

        // Escribir el archivo en el sistema de archivos
        await FileSystem.writeAsStringAsync(filePath, excelBase64, { encoding: FileSystem.EncodingType.Base64 });

        // Verificar si el archivo se creó correctamente
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        if (!fileInfo.exists || fileInfo.size === 0) {
            throw new Error(`Error al crear el archivo "${filePath}".`);
        }
        return filePath;
    } catch (error) {
        console.error('Error al crear el archivo:', error);
        throw error;
    }
}

