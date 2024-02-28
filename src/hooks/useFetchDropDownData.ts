import { useEffect } from 'react';

// Se define la interfaz que describe la estructura de los datos para el dropdown
export interface DropdownData {
    label: string;
    value: string;
    id: string;
}

// Se define la interfaz que describe los parámetros esperados por el hook
export interface UseFetchDropdownDataProps<T> {
    fetchDataFunction: () => Promise<T[]>;
    setDataFunction: (data: DropdownData[]) => void;

    labelKey: keyof T;
    valueKey: keyof T;
    idKey: keyof T;
}

// Se define el hook que utilizará los parámetros proporcionados
export const useFetchDropdownData = <T>({
    fetchDataFunction,
    setDataFunction,
    labelKey,
    valueKey,
    idKey,
}: UseFetchDropdownDataProps<T>) => {
    useEffect(() => {
        // Se define una función asíncrona para obtener y formatear los datos
        const fetchData = async () => {
            try {
                const data = await fetchDataFunction();

                // Se formatea los datos al formato esperado por el dropdown
                const formattedData = data.map((item: T) => ({
                    label: String(item[labelKey]),
                    value: String(item[valueKey]),
                    id: String(item[idKey]),
                }));
                // Se llama a la función para establecer los datos en el estado
                setDataFunction(formattedData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [fetchDataFunction, setDataFunction, labelKey, valueKey]);
};
