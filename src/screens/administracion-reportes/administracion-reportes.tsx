import React, { useState, useEffect } from 'react';
import { View, ImageBackground, TextInput, TouchableOpacity, Text, Keyboard } from 'react-native';
import { styles } from '../../styles/menu-global-styles.styles';
import { BackButtonComponent } from '../../components/BackButton/BackButton';
import { IconRectangle } from '../../components/IconRectangle/IconRectangle';
import { Admin_Reports } from '../../constants';
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
export const AdministracionReportes: React.FC = () => {
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
    const HandleRectanglePress = (report: any) => {
        if (report.screen !== '') {
            if (report.datoValidacion !== undefined) {
                navigation.navigate(report.screen, { datoValidacion: report.datoValidacion });
            } else {
                navigation.navigate(report.screen);
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

    const uniqueItems = accessMenu.filter(item => item.idCategoria === 13);

     let filteredAdminReportsProps = Admin_Reports;

     filteredAdminReportsProps = Admin_Reports.filter(opcion =>
     uniqueItems.some(opcionMenu => opcionMenu.idOpcionMenu === opcion.id)
     );
      //console.log("uniqueItems",uniqueItems)
      setValoresSubMenuFiltrados(filteredAdminReportsProps)

     
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};
    return (
        <View style={styles.container} >
            <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#274c48'} />
            <View style={styles.textAboveContainer}>
                <Text style={styles.textAbove} >Administración de reportes</Text>
            </View>

            <View style={styles.rowContainer}>

                {valoresSubMenuFiltrados.map((report) => (
                    <View style={styles.row} key={report.id}>
                        <IconRectangle
                            onPress={() => HandleRectanglePress(report)}
                            iconImg={report.iconImage}
                            text={report.text}
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