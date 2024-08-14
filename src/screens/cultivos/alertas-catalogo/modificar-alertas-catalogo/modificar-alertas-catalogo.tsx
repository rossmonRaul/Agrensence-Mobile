import React, { useState, useEffect } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
import { styles } from '../../../../styles/global-styles.styles';
import DropdownComponent from '../../../../components/Dropdown/Dropwdown';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScreenProps } from '../../../../constants';
import { useAuth } from '../../../../hooks/useAuth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackButtonComponent } from '../../../../components/BackButton/BackButton';
import { ModificarAlertaCatalogo, ObtenerMedicionesSensorYNomenclatura, ObtenerRolesPorIdentificacion, ObtenerAlertasCatalogo, CambiarEstadoAlertaCatalogo } from '../../../../servicios/ServicioAlertasCatalogo';
import BottomNavBar from '../../../../components/BottomNavbar/BottomNavbar';
import { Ionicons } from '@expo/vector-icons';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../../servicios/ServicioUsuario';

interface RouteParams {
    idAlerta: string;
    idFinca: string;
    idParcela: string;
    nombreAlerta: string;
    idMedicionSensor: string;
    condicion: string;
    parametrodeConsulta: string;
    usuariosNotificacion: string;
    estado: string;
}

export const ModificarAlertaCatalogoScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();
    const route = useRoute();
    const { idAlerta, idFinca, idParcela, nombreAlerta, idMedicionSensor, condicion, parametrodeConsulta, usuariosNotificacion, estado } = route.params as RouteParams;

    const [fincas, setFincas] = useState<{ idFinca: number; nombreFinca?: string }[]>([]);
    const [parcelas, setParcelas] = useState<{ idFinca: number; idParcela: number; nombre: string }[]>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<{ idParcela: number; nombre: string }[]>([]);
    const [mediciones, setMediciones] = useState<{ idMedicion: number; nombre: string }[]>([]);
    const [roles, setRoles] = useState<{ idRol: number; nombreRol: string }[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<number[]>(usuariosNotificacion.split(',').map(Number));
    const [selectedFinca, setSelectedFinca] = useState<string | null>(idFinca || null);
    const [selectedParcela, setSelectedParcela] = useState<string | null>(idParcela || null);
    const [selectedMedicion, setSelectedMedicion] = useState<string | null>(idMedicionSensor || null);

    const [formulario, setFormulario] = useState({
        idFinca: idFinca,
        idParcela: idParcela,
        nombreAlerta: nombreAlerta,
        idMedicionSensor: idMedicionSensor,
        condicion: condicion,
        parametrodeConsulta: parametrodeConsulta,
        usuariosNotificacion: usuariosNotificacion,
        usuarioCreacion: userData.identificacion,
    });

    const updateFormulario = (key: string, value: string) => {
        setFormulario(prevState => ({
            ...prevState,
            [key]: value
        }));
    };

    const handleRegister = async () => {
        if (!formulario.nombreAlerta || !formulario.idMedicionSensor || !formulario.condicion || !formulario.parametrodeConsulta) {
            alert('Por favor complete todos los campos obligatorios');
            return;
        }

        const formData = {
            idAlerta: idAlerta,
            idFinca: formulario.idFinca,
            idParcela: formulario.idParcela,
            nombreAlerta: formulario.nombreAlerta,
            idMedicionSensor: formulario.idMedicionSensor,
            condicion: formulario.condicion,
            parametrodeConsulta: parseFloat(formulario.parametrodeConsulta),
            usuariosNotificacion: selectedRoles.join(','),
            usuarioCreacion: formulario.usuarioCreacion,
            fechaCreacion: new Date().toISOString(),
            usuarioModificacion: formulario.usuarioCreacion,
            fechaModificacion: new Date().toISOString(),
            estado: true,
        };

        const responseInsert = await ModificarAlertaCatalogo(formData);

        if (responseInsert.indicador === 1) {
            Alert.alert('¡Alerta del catálogo modificada correctamente!', '', [
                {
                    text: 'OK',
                    onPress: () => {
                        navigation.navigate(ScreenProps.ListAlertasCatalogo.screenName as never);
                    },
                },
            ]);
        } else {
            alert('¡Oops! Parece que algo salió mal');
        }
    };

    useEffect(() => {
        const obtenerDatosIniciales = async () => {
            const formData = { identificacion: userData.identificacion };

            try {
                const datosInicialesObtenidos = await ObtenerUsuariosAsignadosPorIdentificacion(formData);
                const fincasUnicas = Array.from(new Set(datosInicialesObtenidos.map(item => item.idFinca)))
                    .map(idFinca => {
                        const relacion = datosInicialesObtenidos.find(item => item.idFinca === idFinca);
                        return { idFinca: idFinca as number, nombreFinca: relacion?.nombreFinca || '' };
                    });

                setFincas(fincasUnicas);

                const parcelasUnicas = datosInicialesObtenidos.map(item => ({
                    idFinca: item.idFinca as number,
                    idParcela: item.idParcela as number,
                    nombre: item.nombreParcela || '',
                }));

                setParcelas(parcelasUnicas);

                const medicionesObtenidas = await ObtenerMedicionesSensorYNomenclatura();
                setMediciones(medicionesObtenidas.map(med => ({
                    idMedicion: med.idMedicion,
                    nombre: `${med.nombre} (${med.nomenclatura})`
                })));

                const rolesObtenidos = await ObtenerRolesPorIdentificacion({ usuario: userData.identificacion });
                setRoles(rolesObtenidos);

                const parcelaInicial = parcelasUnicas.find(parcela => parcela.idParcela === parseInt(idParcela));
                setSelectedParcela(parcelaInicial?.nombre || null);

                const fincaInicial = fincasUnicas.find(finca => finca.idFinca === parseInt(idFinca));
                setSelectedFinca(fincaInicial?.nombreFinca || null);

                const alertasCatalogo = await ObtenerAlertasCatalogo();
                const alerta = alertasCatalogo.find(alerta => alerta.idAlerta === parseInt(idAlerta));

                if (alerta) {
                    updateFormulario('parametrodeConsulta', String(alerta.parametrodeConsulta));
                    updateFormulario('usuariosNotificacion', alerta.usuariosNotificacion);
                    setSelectedRoles(alerta.usuariosNotificacion.split(',').map(Number));
                }

            } catch (error) {
                console.error('Error al obtener los datos:', error);
            }
        };

        obtenerDatosIniciales();
    }, []);

    useEffect(() => {
        const parcelaInicial = parcelas.find(parcela => parcela.idParcela === parseInt(idParcela));
        setSelectedParcela(parcelaInicial?.nombre || null);

        const fincaInicial = fincas.find(finca => finca.idFinca === parseInt(idFinca));
        setSelectedFinca(fincaInicial?.nombreFinca || null);

    }, [parcelas, fincas]);

    const obtenerParcelasPorFinca = async (fincaId: number) => {
        try {
            const parcelasFiltradas = parcelas.filter(item => item.idFinca === fincaId);
            setParcelasFiltradas(parcelasFiltradas);
        } catch (error) {
            console.error('Error al obtener parcelas:', error);
        }
    };

    const handleFincaChange = (item: { label: string; value: string }) => {
        const fincaId = parseInt(item.value, 10);
        setSelectedFinca(item.value);
        updateFormulario('idParcela', '');
        setSelectedParcela('Seleccione una Parcela');
        obtenerParcelasPorFinca(fincaId);
    };

    const handleChangeAccess = async () => {
        const formData = {
            idAlerta: idAlerta,
        };
    
        Alert.alert(
            'Confirmar eliminación',
            '¿Estás seguro de que deseas eliminar el registro?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Aceptar',
                    onPress: async () => {
                        try {
                            const response = await CambiarEstadoAlertaCatalogo(formData);
                            if (response.indicador === 1) {
                                Alert.alert(
                                    '¡Registro eliminado con éxito!',
                                    '',
                                    [
                                        {
                                            text: 'OK',
                                            onPress: () => {
                                                navigation.navigate(ScreenProps.ListAlertasCatalogo.screenName);
                                            },
                                        },
                                    ]
                                );
                            } else {
                                alert('¡Oops! Parece que algo salió mal al eliminar el registro!');
                            }
                        } catch (error) {
                            console.error('Error al eliminar el registro:', error);
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ImageBackground
                    source={require('../../../../assets/images/siembros_imagen.jpg')}
                    style={styles.upperContainer}
                ></ImageBackground>
                <BackButtonComponent screenName={ScreenProps.ListAlertasCatalogo.screenName} color={'#ffff'} />
                <View style={styles.lowerContainer}>
                    <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
                        <View>
                            <Text style={styles.createAccountText}>Modificar Alerta del Catálogo</Text>
                        </View>

                        <View style={styles.formContainer}>

                        <Text style={styles.formText}>Finca</Text>

                            <DropdownComponent
                                placeholder={selectedFinca ? selectedFinca : "Seleccione una Finca"}
                                data={fincas.map(finca => ({ label: finca.nombreFinca || 'Sin nombre', value: String(finca.idFinca) }))}
                                value={selectedFinca}
                                iconName="tree"
                                onChange={handleFincaChange}
                            />

                            <Text style={styles.formText}>Parcela</Text>
                            <DropdownComponent
                                placeholder={selectedParcela ? selectedParcela : "Seleccione una Parcela"}
                                data={parcelasFiltradas.map(parcela => ({ label: parcela.nombre || 'Sin nombre', value: String(parcela.idParcela) }))}
                                value={selectedParcela}
                                iconName="pagelines"
                                onChange={(selectedItem) => {
                                    setSelectedParcela(selectedItem.value);
                                    updateFormulario('idParcela', selectedItem.value);
                                }}
                            />

                            <Text style={styles.formText}>Nombre de la Alerta</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nombre de la Alerta"
                                value={formulario.nombreAlerta}
                                onChangeText={(text) => updateFormulario('nombreAlerta', text)}
                            />

                            <Text style={styles.formText}>Medición Sensor</Text>
                            <DropdownComponent
                                placeholder={selectedMedicion ? selectedMedicion : "Seleccione una Medición"}
                                data={mediciones.map(medicion => ({ label: medicion.nombre, value: String(medicion.idMedicion) }))}
                                value={selectedMedicion}
                                iconName="bars"
                                onChange={(selectedItem) => {
                                    setSelectedMedicion(selectedItem.value);
                                    updateFormulario('idMedicionSensor', selectedItem.value);
                                }}
                            />

                            <Text style={styles.formText}>Condición</Text>
                            <DropdownComponent
                                placeholder={formulario.condicion ? formulario.condicion : "Seleccione una Condición"}
                                data={[
                                    { label: 'Igual (=)', value: '=' },
                                    { label: 'Mayor que (>)', value: '>' },
                                    { label: 'Menor que (<)', value: '<' }
                                ]}
                                value={formulario.condicion}
                                iconName="bars"
                                onChange={(selectedItem) => updateFormulario('condicion', selectedItem.value)}
                            />

                            <Text style={styles.formText}>Parámetro de Consulta</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Parámetro de Consulta"
                                value={formulario.parametrodeConsulta}
                                onChangeText={(text) => updateFormulario('parametrodeConsulta', text)}
                                keyboardType="numeric"
                            />

                            <Text style={styles.formText}>Usuarios Notificación</Text>
                            {roles.map(rol => (
                                <TouchableOpacity
                                    key={rol.idRol}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginVertical: 5,
                                    }}
                                    onPress={() => {
                                        const isSelected = selectedRoles.includes(rol.idRol);
                                        setSelectedRoles(isSelected
                                            ? selectedRoles.filter(id => id !== rol.idRol)
                                            : [...selectedRoles, rol.idRol]);
                                    }}
                                >
                                    <Ionicons
                                        name={selectedRoles.includes(rol.idRol) ? 'checkbox' : 'square-outline'}
                                        size={24}
                                        color="black"
                                    />
                                    <Text style={{ marginLeft: 8 }}>{rol.nombreRol}</Text>
                                </TouchableOpacity>
                            ))}

                            
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[styles.button, { width: '100%', marginTop: '5%' }]}
                                    onPress={handleRegister}
                                >
                                    <View style={styles.buttonContent}>
                                        <Ionicons name="save-outline" size={20} color="white" style={styles.iconStyle} />
                                        <Text style={styles.buttonText}> Guardar</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            {estado
                                ? <TouchableOpacity
                                    style={styles.buttonDelete}
                                    onPress={() => {
                                        handleChangeAccess();
                                    }}
                                >
                                    <View style={styles.buttonContent}>
                                        <Ionicons name="trash" size={20} color="white" style={styles.iconStyle} />
                                        <Text style={styles.buttonText}> Eliminar</Text>
                                    </View>
                                </TouchableOpacity>
                                :
                                <TouchableOpacity
                                    style={styles.buttonActive}
                                    onPress={() => {
                                        handleChangeAccess();
                                    }}
                                >
                                    <View style={styles.buttonContent}>
                                        <Ionicons name="checkmark" size={20} color="white" style={styles.iconStyle} />
                                        <Text style={styles.buttonText}> Activar</Text>
                                    </View>
                                </TouchableOpacity>
                            }
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
            <BottomNavBar />
        </View>
    );
};
