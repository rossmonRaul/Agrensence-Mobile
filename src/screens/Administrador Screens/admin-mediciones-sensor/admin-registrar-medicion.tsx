import React, { useState } from 'react';
import { View, ImageBackground, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { styles } from './admin-modificar-medicion.styles';
import { useNavigation } from '@react-navigation/native';
import { ScreenProps } from '../../../constants';
import { useAuth } from '../../../hooks/useAuth';
import { BackButtonComponent } from '../../../components/BackButton/BackButton';
import BottomNavBar from '../../../components/BottomNavbar/BottomNavbar';
import { Ionicons } from '@expo/vector-icons'
import { InsertarMedicionesSensor } from '../../../servicios/ServiciosSensor';

export const AdminRegistrarMedicionScreen: React.FC = () => {
    const navigation = useNavigation();
    const { userData } = useAuth();
    //  Se define un estado para almacenar los datos del formulario
    const [formulario, setFormulario] = useState({
        nombre:'',
        unidadMedida:'',
        nomenclatura: ''
    });

    //  Esta es una función para actualizar el estado del formulario
    const updateFormulario = (key: string, value: string) => {
        setFormulario(prevState => ({
            ...prevState,
            [key]: value
        }));
    };


    // Se defina una función para manejar el registro del identificacion
    const handleRegistrarCompany = async () => {

        //  Se valida que la nombre, estén seleccionadas
        if (!formulario.nombre) {
            alert('Ingrese un nombre');
            return
        }
        if (!formulario.unidadMedida) {
            alert('Ingrese una unidad medida');
            return
        }
        if (!formulario.nomenclatura) {
            alert('Ingrese una nomenclatura');
            return
        }

        //  Se crea un objeto con los datos del formulario para mandarlo por la API con formato JSON
        const formData = {
            nombre: formulario.nombre,
            unidadMedida: formulario.unidadMedida,
            nomenclatura: formulario.nomenclatura,
            usuarioCreacionModificacion: userData.identificacion
        };

        //  Se inserta el identificacion en la base de datos
        const responseInsert = await InsertarMedicionesSensor(formData);
        //  Se muestra una alerta de éxito o error según la respuesta obtenida
        if (responseInsert.indicador === 1) {
            Alert.alert('¡Se creo la medición correctamente!', '', [
                {
                    text: 'OK',
                    onPress: () => {
                        navigation.navigate(ScreenProps.Menu.screenName as never);
                    },
                },
            ]);
        } else {
            alert(responseInsert.mensaje)
        }
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../../../assets/images/siembros_imagen.jpg')}
                style={styles.upperContainer}
            >
            </ImageBackground>
            <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#ffff'} />

            <View style={styles.lowerContainer}>
                <View>
                    <Text style={styles.createAccountText} >Crear Medición</Text>
                </View>
                <View style={styles.formContainer}>
                    <Text style={styles.formText} >Nombre</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nombre de medición"
                        value={formulario.nombre}
                        onChangeText={(text) => updateFormulario('nombre', text)}
                    />
                    <Text style={styles.formText} >Unidad de Medida</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Unidad de Medida"
                        value={formulario.unidadMedida}
                        onChangeText={(text) => updateFormulario('unidadMedida', text)}
                    />
                     <Text style={styles.formText} >Nomenclatura</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nomenclatura"
                        value={formulario.nomenclatura}
                        onChangeText={(text) => updateFormulario('nomenclatura', text)}
                    />
                    <TouchableOpacity
                        style={styles.button}
                        onPress={async () => { handleRegistrarCompany() }}
                    >
                        <View style={styles.buttonContent}>
                            <Ionicons name="save-outline" size={20} color="white" style={styles.iconStyle} />
                            <Text style={styles.buttonText}> Guardar registro</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            <BottomNavBar />

        </View>
    );
}