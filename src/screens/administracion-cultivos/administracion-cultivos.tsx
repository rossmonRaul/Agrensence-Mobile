import React, { useState, useEffect } from 'react';
import { View, ImageBackground, TextInput, TouchableOpacity, Text, Keyboard } from 'react-native';
import { styles } from '../../styles/menu-global-styles.styles';
import { BackButtonComponent } from '../../components/BackButton/BackButton';
import { IconRectangle } from '../../components/IconRectangle/IconRectangle';
import { Admin_cultivation } from '../../constants';
import { ScreenProps } from '../../constants';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomAlert from '../../components/CustomAlert/CustomAlert';
import useAuth from '../../hooks/useAuth';
import { ObtenerAccesoMenuPorRol } from '../../servicios/ServicioUsuario';
interface ButtonAlert{
    text: string;
    onPress: () => void;
  }
export const AdministracionCultivos: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const [isAlertVisible, setAlertVisible] = useState(false);
    const [alertProps, setAlertProps] = useState({
        message: '',
        buttons: [] as ButtonAlert[], // Define el tipo explícitamente
        iconType: 'success' as 'success' | 'error' | 'warning' | 'info',
    });
    const { userData, isAlertVisibleAuth , alertPropsAuth , hideAlertAuth  } = useAuth();
    const [valoresSubMenuFiltrados, setValoresSubMenuFiltrados] = useState<any[]>([]);


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
    const HandleRectanglePress = (crops: any) => {
        if (crops.screen !== '') {
            if (crops.datoValidacion !== undefined) {
                navigation.navigate(crops.screen, { datoValidacion: crops.datoValidacion });
            } else {
                navigation.navigate(crops.screen);
            }
        } else {
            showInfoAlert('Pantalla aún no disponible');
        }
    }

    useEffect( () => {
      obtenerDatosIniciales();
    }, [userData.idRol]);

  const obtenerDatosIniciales = async () => {
    // Lógica para obtener datos desde la API
    const formData = { idRol: userData.idRol };
    try {


    const accessMenu = await ObtenerAccesoMenuPorRol(formData); 
    //console.log("accessMenu",accessMenu)

    const uniqueItems = accessMenu.filter(item => item.idCategoria === 9);

     let filteredAdminCultivationProps = Admin_cultivation;

     filteredAdminCultivationProps = Admin_cultivation.filter(opcion =>
     uniqueItems.some(opcionMenu => opcionMenu.idOpcionMenu === opcion.id)
     );
      //console.log("uniqueItems",uniqueItems)
      setValoresSubMenuFiltrados(filteredAdminCultivationProps)

     
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

    return (
        <View style={styles.container} >
            <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#274c48'} />
            <View style={styles.textAboveContainer}>
                <Text style={styles.textAbove} >Administración de cultivos</Text>
            </View>

            <View style={styles.rowContainer}>

                {valoresSubMenuFiltrados.map((crops) => (
                    <View style={styles.row} key={crops.id}>
                        <IconRectangle
                            onPress={() => HandleRectanglePress(crops)}
                            iconImg={crops.iconImage}
                            text={crops.text}
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