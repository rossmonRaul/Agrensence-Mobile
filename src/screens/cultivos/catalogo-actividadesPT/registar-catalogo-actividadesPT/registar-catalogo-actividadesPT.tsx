import React, { useState } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
import { styles } from '../../../../styles/global-styles.styles';
import { useNavigation } from '@react-navigation/native';
import { ScreenProps } from '../../../../constants';
import { useAuth } from '../../../../hooks/useAuth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackButtonComponent } from '../../../../components/BackButton/BackButton';
import { InsertarActividadPreparacionTerreno } from '../../../../servicios/ServicioCatalogoActividadPT';
import BottomNavBar from '../../../../components/BottomNavbar/BottomNavbar';
import { Ionicons } from '@expo/vector-icons';

export const InsertarCatalogoActividadPTScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { userData } = useAuth();

    const [formulario, setFormulario] = useState({
        nombre: '',
        usuarioCreacionModificacion: userData.identificacion,
    });

    const updateFormulario = (key: string, value: string) => {
        setFormulario(prevState => ({
            ...prevState,
            [key]: value
        }));
    };

    const validateForm = () => {
        let isValid = true;

        if (!formulario.nombre) {
            alert('Ingrese el nombre de la actividad');
            isValid = false;
            return;
        }

        return isValid;
    };

    const handleRegister = async () => {
        if (validateForm()) {
            const responseInsert = await InsertarActividadPreparacionTerreno(formulario);

            if (responseInsert.indicador === 1) {
                Alert.alert('¡Se creó la actividad correctamente!', '', [
                    {
                        text: 'OK',
                        onPress: () => {
                            navigation.navigate(ScreenProps.ListCatalogoActividades.screenName as never);
                        },
                    },
                ]);
            } else {
                alert('!Oops! Parece que algo salió mal');
            }
        }
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
                <BackButtonComponent screenName={ScreenProps.ListCatalogoActividades.screenName} color={'#ffff'} />
                <View style={styles.lowerContainer}>
                    <ScrollView style={styles.rowContainer} showsVerticalScrollIndicator={false}>
                        <View>
                            <Text style={styles.createAccountText}>Registrar Actividad</Text>
                        </View>

                        <View style={styles.formContainer}>
                            <Text style={styles.formText}>Nombre de la Actividad</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nombre de la Actividad"
                                value={formulario.nombre}
                                onChangeText={(text) => updateFormulario('nombre', text)}
                            />

                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => {
                                    handleRegister();
                                }}
                            >
                                <View style={styles.buttonContent}>
                                    <Ionicons name="save-outline" size={20} color="white" style={styles.iconStyle} />
                                    <Text style={styles.buttonText}> Guardar</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
            <BottomNavBar />
        </View>
    );
};

export default InsertarCatalogoActividadPTScreen;
