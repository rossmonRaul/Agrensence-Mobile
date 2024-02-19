interface DataItem {
    title: string;
    text: string;
}

interface Result {
    data: DataItem[];
}
export function processData(jsonData: any[], keyMapping: Record<string, string>): Result | null {
    // Verifica que las claves proporcionadas existan en al menos un objeto del JSON
    const keys = Object.keys(keyMapping);
    if (!jsonData.length || keys.some(key => !(keyMapping[key] in jsonData[0]))) {
        console.error('Claves proporcionadas no válidas.');
        return null;
    }

    const formattedData: DataItem[] = jsonData.map((item: any) => {
        return keys.map(key => ({
            title: `${key}`,
            text: `${item[keyMapping[key]]}`,
        }));
    }).flat();

    return { data: formattedData };
}