import React, { useState, useEffect } from 'react';
import { View, ImageBackground, TextInput, TouchableOpacity, Text, Keyboard } from 'react-native';
import { styles } from '../../../styles/menu-global-styles.styles';
import { BackButtonComponent } from '../../../components/BackButton/BackButton';
import { IconRectangle } from '../../../components/IconRectangle/IconRectangle';
import { Admin_plagas, ScreenProps } from '../../../constants';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomAlert from '../../../components/CustomAlert/CustomAlert';
interface ButtonAlert{
    text: string;
    onPress: () => void;
  }

export const AdministracionPlagas: React.FC = () => {
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
                navigation.navigate(ScreenProps.CompanyList.screenName as never);
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

    const HandleRectanglePress = (pests: any) => {
        if (pests.screen !== '') {
            if (pests.datoValidacion !== undefined) {
                navigation.navigate(pests.screen, { datoValidacion: pests.datoValidacion });
            } else {
                navigation.navigate(pests.screen);
            }
        } else {
            showInfoAlert('Pantalla aún no disponible');
        }
    }

    return (
        <View style={styles.container} >
            <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#274c48'} />
            <View style={styles.textAboveContainer}>
                <Text style={styles.textAbove} >Administración de plagas</Text>
            </View>

            <View style={styles.rowContainer}>

                {Admin_plagas.map((pests) => (
                    <View style={styles.row} key={pests.id}>
                        <IconRectangle
                            onPress={() => HandleRectanglePress(pests)}
                            iconImg={pests.iconImage}
                            text={pests.text}
                        />
                    </View>
                ))}

            </View>
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