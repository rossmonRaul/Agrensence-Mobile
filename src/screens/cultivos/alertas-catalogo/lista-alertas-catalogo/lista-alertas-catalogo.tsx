import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { styles } from '../../../../styles/list-global-styles.styles';
import { BackButtonComponent } from '../../../../components/BackButton/BackButton';
import DropdownComponent from '../../../../components/Dropdown/Dropwdown';
import { Ionicons } from '@expo/vector-icons';
import { ObtenerAlertasCatalogo, ObtenerMedicionesSensorYNomenclatura, ObtenerRolesPorIdentificacion } from '../../../../servicios/ServicioAlertasCatalogo';
import { processData } from '../../../../utils/processData';
import { CustomRectangle } from '../../../../components/CustomRectangle/CustomRectangle';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenProps } from '../../../../constants';
import { useAuth } from '../../../../hooks/useAuth';
import BottomNavBar from '../../../../components/BottomNavbar/BottomNavbar';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../../servicios/ServicioUsuario';
import { AddButtonComponent } from '../../../../components/AddButton/AddButton';
import CustomAlertAuth from '../../../../components/CustomAlert/CustomAlert';
type RootStackParamList = {
    ListAlertasCatalogo: { reload: boolean };
};

interface Finca {
    idFinca: number;
    nombreFinca: string;
}

interface Parcela {
    idFinca: number;
    idParcela: number;
    nombreParcela: string;
}

interface MedicionesSensor {
    idMedicion: number;
    nombre: string;
}

export const ListaAlertasCatalogoScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
   // const { userData } = useAuth();
   const { userData, isAlertVisibleAuth , alertPropsAuth , hideAlertAuth  } = useAuth();
    const route = useRoute<RouteProp<RootStackParamList, 'ListAlertasCatalogo'>>();

    const [apiData, setApiData] = useState<any[]>([]);
    const [alertasFiltradosData, setAlertasFiltrados] = useState<any[]>([]);
    const [fincas, setFincas] = useState<Finca[]>([]);
    const [parcelas, setParcelas] = useState<Parcela[]>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<Parcela[]>([]);
    const [medicionesSensor, setMedicionesSensor] = useState<MedicionesSensor[]>([]);
    const [roles, setRoles] = useState<any[]>([]);

    const [selectedFinca, setSelectedFinca] = useState<string | null>(null);
    const [selectedParcela, setSelectedParcela] = useState<string | null>(null);

    const obtenerDatosIniciales = async () => {
        const formData = { identificacion: userData.identificacion };

        try {
            const usuariosAsignados = await ObtenerUsuariosAsignadosPorIdentificacion(formData);
            const fincasUnicas = Array.from(new Set(usuariosAsignados.map(item => item.idFinca)))
                .map(idFinca => {
                    const relacion = usuariosAsignados.find(item => item.idFinca === idFinca);
                    const nombreFinca = relacion ? relacion.nombreFinca : '';
                    return { idFinca: idFinca as number, nombreFinca };
                });

            setFincas(fincasUnicas);

            const parcelasUnicas = usuariosAsignados.map(item => ({
                idFinca: item.idFinca as number,
                idParcela: item.idParcela as number,
                nombreParcela: item.nombreParcela,
            }));

            setParcelas(parcelasUnicas);

            const mediciones = await ObtenerMedicionesSensorYNomenclatura();
            setMedicionesSensor(mediciones);

            const rolesResponse = await ObtenerRolesPorIdentificacion(formData);
            setRoles(rolesResponse);

            const alertasCatalogo = await ObtenerAlertasCatalogo();
            const filteredData = alertasCatalogo.filter(item => item.estado === 1).map((item) => {
                const sensor = mediciones.find(med => med.idMedicion === parseInt(item.idMedicionSensor));
                const nombreMedicion = sensor ? sensor.nombre : item.idMedicionSensor;

                let condicionTexto;
                switch (item.condicion) {
                    case '=':
                        condicionTexto = 'Igual';
                        break;
                    case '>':
                        condicionTexto = 'Mayor que';
                        break;
                    case '<':
                        condicionTexto = 'Menor que';
                        break;
                    default:
                        condicionTexto = item.condicion;
                }

                const condicionParametro = `${condicionTexto} ${item.parametrodeConsulta}`;

                const rolesIds = item.usuariosNotificacion.split(',').map((id: string) => parseInt(id, 10));
                const nombresRoles = rolesIds.map(idRol => {
                    switch (idRol) {
                        case 1:
                            return 'SuperAdmin';
                        case 2:
                            return 'Admin';
                        case 3:
                            return 'UsuarioAsignado';
                        case 4:
                            return 'UsuarioNoAsignado';
                        default:
                            return `ID: ${idRol}`;
                    }
                }).join(', ');

                return {
                    ...item,
                    estado: item.estado === 0 ? 'Inactivo' : 'Activo',
                    nombreMedicion: nombreMedicion,
                    condicionTexto: condicionTexto,
                    nombresRoles: nombresRoles,
                    condicionParametro: condicionParametro,  
                };
            });

            setApiData(filteredData);

        } catch (error) {
            console.error('Error al obtener los datos:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            obtenerDatosIniciales();

            setSelectedFinca(null);
            setSelectedParcela(null);
            setParcelasFiltradas([]);
            setAlertasFiltrados([]);

            return () => {};
        }, [route.params?.reload])
    );

    const obtenerParcelasPorFinca = async (fincaId: number) => {
        try {
            const resultado = parcelas.filter(item => item.idFinca === fincaId);
            setParcelasFiltradas(resultado);
        } catch (error) {
            console.error('Error al obtener las parcelas:', error);
        }
    };

    const obtenerAlertasPorFinca = async (fincaId: number) => {
        try {
            const alertasFiltradas = apiData.filter(item => item.idFinca === fincaId);
            setAlertasFiltrados(alertasFiltradas);
        } catch (error) {
            console.error('Error al obtener los datos:', error);
        }
    };

    const obtenerAlertasPorFincaYParcela = async (fincaId: number, parcelaId: number) => {
        try {
            const alertasFiltradas = apiData.filter(item => item.idFinca === fincaId && item.idParcela === parcelaId);
            setAlertasFiltrados(alertasFiltradas);
        } catch (error) {
            console.error('Error al obtener los datos:', error);
        }
    };

    const handleFincaChange = (item: { label: string; value: string }) => {
        const fincaId = parseInt(item.value, 10);
        setSelectedFinca(item.value ?? '');
        setSelectedParcela(null);
        obtenerParcelasPorFinca(fincaId);
        obtenerAlertasPorFinca(fincaId);
    };

    const handleParcelaChange = (item: { label: string; value: string }) => {
        const parcelaId = parseInt(item.value, 10);
        const fincaId = selectedFinca ? parseInt(selectedFinca, 10) : null;
        setSelectedParcela(item.value ?? '');
        if (fincaId !== null) {
            obtenerAlertasPorFincaYParcela(fincaId, parcelaId);
        } else {
            console.warn('Finca seleccionada es null. No se pueden obtener las alertas del catálogo.');
        }
    };

    const keyMapping = {
        'Alerta': 'nombreAlerta',
        'Medición': 'nombreMedicion',
        'Condición': 'condicionParametro',  
        'Roles de Notificación': 'nombresRoles',
    };

    const handleRectanglePress = (idAlerta: number, idFinca: number, idParcela: number, nombreAlerta: string, 
        idMedicionSensor: string, condicion: string, parametrodeConsulta: number, 
        usuariosNotificacion: string, usuarioCreacion: string, estado: string) => {
        
        navigation.navigate(ScreenProps.ModifyAlertaCatalogo.screenName, {
            idAlerta,
            idFinca,
            idParcela,
            nombreAlerta,
            idMedicionSensor,
            condicion,
            parametrodeConsulta,
            usuariosNotificacion,
            usuarioCreacion,
            estado
        });
    };

    return (
        <View style={styles.container} >

            <View style={styles.listcontainer}>
                <AddButtonComponent screenName={ScreenProps.RegisterAlertaCatalogo.screenName} color={'#274c48'} />
                <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#274c48'} />

                <View style={styles.textAboveContainer}>
                    <Text style={styles.textAbove} >Catálogo de alertas</Text>
                </View>
                
                <View style={styles.dropDownContainer}>
                <View style={styles.searchContainer}>
                <Text style={styles.formText} >Finca:     </Text>
                    <DropdownComponent
                        placeholder="Seleccione una Finca"
                        data={fincas.map(finca => ({ label: finca.nombreFinca, value: String(finca.idFinca) }))}
                        value={selectedFinca}
                        iconName="tree"
                        onChange={handleFincaChange}
                        customWidth={305}
                    />
                    </View>
                    <View style={styles.searchContainer}>
                    <Text style={styles.formText} >Parcela: </Text>
                    <DropdownComponent
                        placeholder="Seleccione una Parcela"
                        data={parcelasFiltradas.map(parcela => ({ label: parcela.nombreParcela, value: String(parcela.idParcela) }))}
                        value={selectedParcela}
                        iconName="pagelines"
                        onChange={handleParcelaChange}
                        customWidth={305}
                    />
                    </View>
                </View>
                <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
                    {alertasFiltradosData.map((item, index) => {
                        return (
                            <TouchableOpacity key={item.idAlerta} onPress={() => handleRectanglePress(item.idAlerta, item.idFinca, item.idParcela, 
                                item.nombreAlerta, item.nombreMedicion, item.condicionTexto, item.parametrodeConsulta, 
                                item.nombresRoles, item.usuarioCreacion, item.estado)}>
                                <CustomRectangle
                                    key={item.idAlerta}
                                    data={processData([item], keyMapping)?.data || []} />
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

            </View>

            <BottomNavBar />
            {isAlertVisibleAuth  && (
                <CustomAlertAuth
                isVisible={isAlertVisibleAuth }
                onClose={hideAlertAuth }
                message={alertPropsAuth .message}
                iconType={alertPropsAuth .iconType}
                buttons={alertPropsAuth .buttons}
                navigateTo={alertPropsAuth .iconType === 'success' ? () => {} : undefined}
                />
                )}
        </View>
    );
}
