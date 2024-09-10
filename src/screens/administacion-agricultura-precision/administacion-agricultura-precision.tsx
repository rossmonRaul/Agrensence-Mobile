import React, { useState, useEffect } from 'react';
import { View, ImageBackground, TextInput, TouchableOpacity, Text, ScrollView, Keyboard } from 'react-native';
import { styles } from '../../styles/menu-global-styles.styles';
import { BackButtonComponent } from '../../components/BackButton/BackButton';
import { IconRectangle } from '../../components/IconRectangle/IconRectangle';
import { Admin_Agricultura_Precision } from '../../constants';
import { ScreenProps } from '../../constants';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomAlert from '../../components/CustomAlert/CustomAlert';

interface ButtonAlert{
    text: string;
    onPress: () => void;
  }
export const AdministracionAgriculturaPrecision: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [isAlertVisible, setAlertVisible] = useState(false);
    const [alertProps, setAlertProps] = useState({
        message: '',
        buttons: [] as ButtonAlert[], // Define el tipo explícitamente
        iconType: 'success' as 'success' | 'error' | 'warning' | 'info',
    });



 const showSuccessAlert = (message: string) => {
        setAlertProps({
          message: message,
          iconType: 'success',
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
	Keyboard.dismiss()
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
	Keyboard.dismiss()
        setAlertVisible(true);
      };

    
      const hideAlert = () => {
        setAlertVisible(false);
      };
    const HandleRectanglePress = (agriculture: any) => {
        if (agriculture.screen !== '') {
            if (agriculture.datoValidacion !== undefined) {
                navigation.navigate(agriculture.screen, { datoValidacion: agriculture.datoValidacion });
            } else {
                navigation.navigate(agriculture.screen);
            }
        } else {
            showInfoAlert('Pantalla aún no disponible');
        }
    }

    return (
        <View style={styles.container} >
            <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#274c48'} />
            <View style={styles.textAboveContainer}>
                <Text style={styles.textAbove} >Administración de agricultura de precisión</Text>
            </View>
            {/* <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}> */}
            <View style={styles.rowContainer}>

                {Admin_Agricultura_Precision.map((agriculture) => (
                    <View style={styles.rowEspaciado} key={agriculture.id}>
                        <IconRectangle 
                            onPress={() => HandleRectanglePress(agriculture)}
                            iconImg={agriculture.iconImage}
                            text={agriculture.text}
                            
                        />
                    </View>
                ))}

            </View>
            {/* </ScrollView> */}
            <CustomAlert
                isVisible={isAlertVisible}
                onClose={hideAlert}
                message={alertProps.message}
                iconType={alertProps.iconType}
                buttons={alertProps.buttons}
                navigateTo={alertProps.iconType === 'success' ? () => {} : undefined}
                />
        </View>
    );
}