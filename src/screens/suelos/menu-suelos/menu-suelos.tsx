import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, Keyboard } from 'react-native';
import { styles } from '../../../styles/menu-global-styles.styles';
import { IconRectangle } from '../../../components/IconRectangle/IconRectangle';
import { Admin_suelo } from '../../../constants';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../hooks/useAuth';
import BottomNavBar from '../../../components/BottomNavbar/BottomNavbar';
import { ScreenProps } from '../../../constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackButtonComponent } from '../../../components/BackButton/BackButton';
import CustomAlertAuth from '../../../components/CustomAlert/CustomAlert';
import CustomAlert from '../../../components/CustomAlert/CustomAlert';
import { ObtenerAccesoMenuPorRol } from '../../../servicios/ServicioUsuario';

interface ButtonAlert{
    text: string;
    onPress: () => void;
  }


export const MenuSueloScreen: React.FC = () => {
  const { userData, isAlertVisibleAuth , alertPropsAuth , hideAlertAuth  } = useAuth();
  //const { userData } = useAuth();
    const userRole = userData.idRol;
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [isAlertVisible, setAlertVisible] = useState(false);
    const [alertProps, setAlertProps] = useState({
        message: '',
        buttons: [] as ButtonAlert[], // Define el tipo explícitamente
        iconType: 'success' as 'success' | 'error' | 'warning' | 'info',
    });

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
    //  Aqui va la se logra ir a otras pantallas segun el recuadro que se presione
    const HandleRectanglePress = (item: any) => {
        if (item.screen !== '') {

            navigation.navigate(item.screen);

        } else {
            showInfoAlert('Pantalla aún no disponible');
        }
    }

    //  Se renderiza los cuadros con sus respectivos iconos
    useEffect( () => {
      obtenerDatosIniciales();
    }, [userData.idRol]);

  const obtenerDatosIniciales = async () => {
    // Lógica para obtener datos desde la API
    const formData = { idRol: userData.idRol };
    try {


    const accessMenu = await ObtenerAccesoMenuPorRol(formData); 
    //console.log("accessMenu",accessMenu)

    const uniqueItems = accessMenu.filter(item => item.idCategoria === 14);

     let filteredAdminSueloProps = Admin_suelo;

     filteredAdminSueloProps = Admin_suelo.filter(opcion =>
     uniqueItems.some(opcionMenu => opcionMenu.idOpcionMenu === opcion.id)
     );
      //console.log("uniqueItems",uniqueItems)
      setValoresSubMenuFiltrados(filteredAdminSueloProps)

     
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

    return (
        <>
            <View style={styles.container} >
                <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#274c48'} />
                <View style={styles.textAboveContainer}>
                    <Text style={styles.textAbove} >Administración de suelos</Text>
                </View>

                <View style={styles.rowContainer}>

                    {valoresSubMenuFiltrados.map((item) => (

                        <View style={styles.row} key={item.id}>
                            <IconRectangle
                                onPress={() => HandleRectanglePress(item)}
                                iconImg={item.iconImage}
                                text={item.text}
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
           
            <BottomNavBar />
        </>
    );
};