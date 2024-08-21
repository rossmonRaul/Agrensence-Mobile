import React, { useState, useEffect, ReactNode } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Alert } from 'react-native';
import { styles } from '../../../styles/list-global-styles.styles';
import { BackButtonComponent } from '../../../components/BackButton/BackButton';
import { ObtenerNotificaciones, EliminarNotificaciones } from '../../../servicios/ServicioNotificaciones';
import { ObtenerFincas } from '../../../servicios/ServicioFinca';
import { ObtenerParcelas } from '../../../servicios/ServicioParcela';
import { ObtenerUsuariosPorIdEmpresa } from '../../../servicios/ServicioUsuario';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenProps } from '../../../constants';
import BottomNavBar from '../../../components/BottomNavbar/BottomNavbar';
import { Ionicons } from '@expo/vector-icons';

interface NotificacionInterface {
    ubicacionFinca: ReactNode;
    nombreFinca: ReactNode;
    nombreParcela: ReactNode;
    idNotificacion: number;
    idFinca: number;
    idParcela: number;
    idMedicionSensor: number;
    descripcion: string;
    fechaCreacion: string;
    estado: number; // 0: Inactivo, 1: Activo
}

interface FincaInterface {
    idFinca: number;
    nombre: string;
    ubicacion: string;
    idEmpresa: number;
}

interface ParcelaInterface {
    idParcela: number;
    nombre: string;
    nombreFinca: string;
    idFinca: number;
}

export const NotificacionesScreen: React.FC = () => {
    const { userData } = useAuth();
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [notificaciones, setNotificaciones] = useState<NotificacionInterface[]>([]);
    const [fincas, setFincas] = useState<FincaInterface[]>([]);
    const [parcelas, setParcelas] = useState<ParcelaInterface[]>([]);

    useEffect(() => {
        const obtenerDatos = async () => {
            const Data = {
                userData: userData
            };
            try {
                console.log("Usuario logeado:", Data); // Verifica los datos del usuario logeado
                
                // Obtener usuarios asociados a la empresa del usuario logeado
                const usuarios = await ObtenerUsuariosPorIdEmpresa(Data);
                console.log("Usuarios de la empresa:", usuarios);

                // Filtrar fincas y parcelas según la empresa del usuario logeado
                const [notificacionesData, fincasData, parcelasData] = await Promise.all([
                    ObtenerNotificaciones(),
                    ObtenerFincas(userData.idEmpresa),
                    ObtenerParcelas(userData.idEmpresa),
                ]);

                const fincasFiltradas = fincasData.filter(finca => finca.idEmpresa === userData.idEmpresa);
                const parcelasFiltradas = parcelasData.filter(parcela => 
                    
                    fincasFiltradas.some(finca => finca.idFinca === parcela.idFinca)
                );

                const notificacionesConDetalles = notificacionesData
                    .filter(notificacion => 
                        fincasFiltradas.some(finca => finca.idFinca === notificacion.idFinca) &&
                        parcelasFiltradas.some(parcela => parcela.idParcela === notificacion.idParcela)
                    )
                    .map(notificacion => {
                        const finca = fincasFiltradas.find(f => f.idFinca === notificacion.idFinca);
                        const parcela = parcelasFiltradas.find(p => p.idParcela === notificacion.idParcela);

                        return {
                            ...notificacion,
                            nombreFinca: finca?.nombre || 'N/A',
                            ubicacionFinca: finca?.ubicacion || 'N/A',
                            nombreParcela: parcela?.nombre || 'N/A',
                        };
                    });

                setNotificaciones(notificacionesConDetalles);
                setFincas(fincasFiltradas);
                setParcelas(parcelasFiltradas);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        obtenerDatos();
    }, [userData]);

    const eliminarNotificacion = async (idNotificacion: number) => {
        const Data = {
            idNotificacion: idNotificacion
        };
        try {
            await EliminarNotificaciones(Data);
            setNotificaciones(prevNotificaciones =>
                prevNotificaciones.filter(notificacion => notificacion.idNotificacion !== idNotificacion)
            );
        } catch (error) {
            console.error('Error deleting notification:', error);
            Alert.alert('Error', 'No se pudo eliminar la notificación. Inténtalo de nuevo más tarde.');
        }
    };

    const convertEstadoToString = (estado: number) => (estado === 0 ? 'Inactivo' : 'Activo');

    return (
        <View style={styles.container}>
            <View style={styles.listcontainer}>
                <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#274c48'} />

                <View style={styles.textAboveContainer}>
                    <Text style={styles.textAbove}>Notificaciones Recibidas</Text>
                </View>

                <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
                    {notificaciones.map((item) => (
                        <View key={item.idNotificacion} style={styles.notificationContainer}>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => eliminarNotificacion(item.idNotificacion)}
                            >
                                <Ionicons name="close-circle" size={24} color="red" />
                            </TouchableOpacity>
                            <Text style={styles.notificationText}>
                                En la parcela <Text style={styles.highlight}>{item.nombreParcela}</Text> de la finca <Text style={styles.highlight}>{item.nombreFinca}</Text> ubicada en <Text style={styles.highlight}>{item.ubicacionFinca}</Text> hubo una alerta:
                            </Text>
                            <Text style={styles.notificationText}>
                                El Sensor <Text style={styles.highlight}>{item.idMedicionSensor}</Text> detectó:
                            </Text>
                            <Text style={styles.notificationDescription}>{item.descripcion}</Text>
                            <Text style={styles.notificationText}>{item.fechaCreacion}</Text>

                        </View>
                    ))}
                </ScrollView>
            </View>

            <BottomNavBar />
        </View>
    );
};
