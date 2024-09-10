import React, { useState } from 'react';
import { View, ImageBackground, TextInput, TouchableOpacity, Text, Keyboard } from 'react-native';
import { styles } from './admin-modificar-medicion.styles';
import { useNavigation } from '@react-navigation/native';
import { ScreenProps } from '../../../constants';
import { useAuth } from '../../../hooks/useAuth';
import { BackButtonComponent } from '../../../components/BackButton/BackButton';
import BottomNavBar from '../../../components/BottomNavbar/BottomNavbar';
import { Ionicons } from '@expo/vector-icons'
import { InsertarMedicionesSensor } from '../../../servicios/ServiciosSensor';
import CustomAlert from '../../../components/CustomAlert/CustomAlert';
import CustomAlertAuth from '../../../components/CustomAlert/CustomAlert';
interface Button {
    text: string;
    onPress: () => void;
  }


export const AdminRegistrarMedicionScreen: React.FC = () => {
    const navigation = useNavigation();
    // const { userData } = useAuth();
   const { userData, isAlertVisibleAuth , alertPropsAuth , hideAlertAuth  } = useAuth();
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

    const [isAlertVisible, setAlertVisible] = useState(false);
    const [alertProps, setAlertProps] = useState({
        message: '',
        buttons: [] as Button[], // Define el tipo explícitamente
        iconType: 'success' as 'success' | 'error' | 'warning' | 'info',
    });
    // Se defina una función para manejar el registro del identificacion
    const handleRegistrarCompany = async () => {
        Keyboard.dismiss()
        //  Se valida que la nombre, estén seleccionadas
        if (!formulario.nombre) {
            showInfoAlert('Ingrese un nombre');
            return
        }
        if (!formulario.unidadMedida) {
            showInfoAlert('Ingrese una unidad medida');
            return
        }
        if (!formulario.nomenclatura) {
            showInfoAlert('Ingrese una nomenclatura');
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
            showSuccessAlert('¡Se creo la medición correctamente!');
        } else {
            showErrorAlert(responseInsert.mensaje)
        }
    };


    const showSuccessAlert = (message: string) => {
        setAlertProps({
          message: message,
          iconType: 'success',
          buttons: [
            {
              text: 'Cerrar',
              onPress: () => {
                navigation.navigate(ScreenProps.ListMeasureSensor.screenName as never);
              },
            },
          ],
        });
        setAlertVisible(true);
      };
    
      const showErrorAlert = (message: string) => {
        setAlertProps({
          message: message,
          iconType: 'error',
          buttons: [
            {
              text: 'Cerrar',
              onPress: () => {
               
              },
            },
          ],
        });
        setAlertVisible(true);
      };

      const showInfoAlert = (message: string) => {
        setAlertProps({
          message: message,
          iconType: 'info',
          buttons: [
            {
              text: 'Cerrar',
              onPress: () => {
             
              },
            },
          ],
        });
        setAlertVisible(true);
      };

    
      const hideAlert = () => {
        setAlertVisible(false);
      };
    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../../../assets/images/siembros_imagen.jpg')}
                style={styles.upperContainer}
            >
            </ImageBackground>
            <BackButtonComponent screenName={ScreenProps.ListMeasureSensor.screenName} color={'#ffff'} parametro={'0'}/>

            <View style={styles.lowerContainer}>
                <View>
                    <Text style={styles.createAccountText} >Crear medición</Text>
                </View>
                <View style={styles.formContainer}>
                    <Text style={styles.formText} >Nombre</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nombre de medición"
                        value={formulario.nombre}
                        onChangeText={(text) => updateFormulario('nombre', text)}
                    />
                    <Text style={styles.formText} >Unidad de medida</Text>
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
                            <Text style={styles.buttonText}> Guardar medición</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            <BottomNavBar />
            <CustomAlert
                isVisible={isAlertVisible}
                onClose={hideAlert}
                message={alertProps.message}
                iconType={alertProps.iconType}
                buttons={alertProps.buttons}
                navigateTo={alertProps.iconType === 'success' ? () => navigation.navigate(ScreenProps.ListMeasureSensor.screenName as never) : undefined}
                />
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