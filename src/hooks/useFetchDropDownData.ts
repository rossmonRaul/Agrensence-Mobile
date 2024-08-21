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
        let isMounted = true;

        const fetchData = async () => {
            try {
                const data = await fetchDataFunction();

                // Se formatea los datos solo si el componente sigue montado
                if (isMounted) {
                    const formattedData = data.map((item: T) => ({
                        label: String(item[labelKey]),
                        value: String(item[valueKey]),
                        id: String(item[idKey]),
                    }));
                    setDataFunction(formattedData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();

        // Cleanup function to mark component as unmounted
        return () => {
            isMounted = false;
        };
    }, [fetchDataFunction, setDataFunction, labelKey, valueKey, idKey]);
};