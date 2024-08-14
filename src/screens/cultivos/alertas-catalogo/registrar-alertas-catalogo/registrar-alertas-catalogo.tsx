import React, { useState, useEffect } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
import { styles } from '../../../../styles/global-styles.styles';
import DropdownComponent from '../../../../components/Dropdown/Dropwdown';
import { useNavigation } from '@react-navigation/native';
import { ScreenProps } from '../../../../constants';
import { useAuth } from '../../../../hooks/useAuth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackButtonComponent } from '../../../../components/BackButton/BackButton';
import { InsertarAlertaCatalogo, ObtenerMedicionesSensorYNomenclatura, ObtenerRolesPorIdentificacion } from '../../../../servicios/ServicioAlertasCatalogo';
import BottomNavBar from '../../../../components/BottomNavbar/BottomNavbar';
import { Ionicons } from '@expo/vector-icons';
import { ObtenerUsuariosAsignadosPorIdentificacion } from '../../../../servicios/ServicioUsuario';

export const RegistrarAlertaCatalogoScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();

    const [fincas, setFincas] = useState<{ idFinca: number; nombreFinca?: string }[]>([]);
    const [parcelas, setParcelas] = useState<{ idFinca: number; idParcela: number; nombre: string }[]>([]);
    const [parcelasFiltradas, setParcelasFiltradas] = useState<{ idParcela: number; nombre: string }[]>([]);
    const [mediciones, setMediciones] = useState<{ idMedicion: number; nombre: string; nomenclatura: string }[]>([]);
    const [roles, setRoles] = useState<{ idRol: number; nombreRol: string }[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<number[]>([]); 

    const [selectedFinca, setSelectedFinca] = useState<string | null>(null);
    const [selectedParcela, setSelectedParcela] = useState<string | null>(null);
    const [selectedMedicion, setSelectedMedicion] = useState<string | null>(null);

    const [formulario, setFormulario] = useState({
        idFinca: selectedFinca,
        idParcela: selectedParcela,
        nombreAlerta: '',
        idMedicionSensor: '',
        condicion: '',
        parametrodeConsulta: '',
        usuariosNotificacion: '',
        usuarioCreacion: userData.identificacion,
    });

    const updateFormulario = (key: string, value: string) => {
        setFormulario(prevState => ({
            ...prevState,
            [key]: value
        }));
    };

    const handleRegister = async () => {
        //console.log("Datos del formulario:", formulario);
        if (!formulario.nombreAlerta || !formulario.idMedicionSensor || !formulario.condicion || !formulario.parametrodeConsulta) {
            alert('Por favor complete todos los campos obligatorios');
            return;
        }

        const formData = {
            ...formulario,
            parametrodeConsulta: parseFloat(formulario.parametrodeConsulta),
            usuariosNotificacion: selectedRoles.join(','), 
            fechaCreacion: new Date().toISOString(),
            usuarioModificacion: formulario.usuarioCreacion,
            fechaModificacion: new Date().toISOString(),
            estado: true,
        };

        const responseInsert = await InsertarAlertaCatalogo(formData);

        if (responseInsert.indicador === 1) {
            Alert.alert('¡Alerta del catálogo creada correctamente!', '', [
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
            const usuario = { usuario: userData.identificacion };
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

                const rolesObtenidos = await ObtenerRolesPorIdentificacion(usuario);
                setRoles(rolesObtenidos);

            } catch (error) {
                console.error('Error al obtener los datos:', error);
            }
        };

        obtenerDatosIniciales();
    }, []);

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
        setSelectedParcela('Seleccione una Parcela');
        obtenerParcelasPorFinca(fincaId);
        updateFormulario('idFinca', item.value);
    };

    const handleRoleSelection = (roleId: number) => {
        setSelectedRoles(prevRoles =>
            prevRoles.includes(roleId)
                ? prevRoles.filter(id => id !== roleId) 
                : [...prevRoles, roleId] 
        );
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ImageBackground
                    source={require('../../../../assets/images/siembros_imagen.jpg')}
                    style={styles.upperContainer}
                ></ImageBackground>
                <BackButtonComponent screenName={ScreenProps.ListAlertasCatalogo.screenName} color={'#ffff'} />
                <View style={styles.lowerContainer}>
                    <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
                        <View>
                            <Text style={styles.createAccountText}>Registro de Alerta del Catálogo</Text>
                        </View>

                        <View style={styles.formContainer}>

                        <Text style={styles.formText}>Finca</Text>
                            <DropdownComponent
                                placeholder="Seleccione una Finca"
                                data={fincas.map(finca => ({ label: finca.nombreFinca || 'Sin nombre', value: String(finca.idFinca) }))}
                                value={selectedFinca}
                                iconName="tree"
                                onChange={handleFincaChange}
                            />

                            <Text style={styles.formText}>Parcela</Text>
                            <DropdownComponent
                                placeholder="Seleccione una Parcela"
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
                                placeholder="Seleccione una Medición"
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
                                placeholder="Seleccione una Condición"
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
                                    onPress={() => handleRoleSelection(rol.idRol)}
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
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
            <BottomNavBar />
        </View>
    );
};
