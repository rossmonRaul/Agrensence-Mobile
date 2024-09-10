import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, Keyboard } from 'react-native';
import { styles } from './menu-principal.styles';
import { SquareIcon } from '../../components/IconSquare/IconSquare';
import { Company_Props } from '../../constants';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import BottomNavBar from '../../components/BottomNavbar/BottomNavbar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomAlert from '../../components/CustomAlert/CustomAlert';
import CustomAlertAuth from '../../components/CustomAlert/CustomAlert';
interface ButtonAlert{
    text: string;
    onPress: () => void;
  }
export const MenuScreen: React.FC = () => {
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

    
    //  Aqui va la se logra ir a otras pantallas segun el recuadro que se presione
    const HandleSquarePress = (company: any) => {
        if (company.screen !== '') {
            if (company.datoValidacion !== undefined) {
                navigation.navigate(company.screen, { datoValidacion: company.datoValidacion });
            } else {
                navigation.navigate(company.screen);
            }
        } else {
            showInfoAlert('Pantalla aún no disponible');
        }
    }

    //  Se renderiza los cuadros con sus respectivos iconos
    const renderRows = () => {
        let filteredCompanyProps = Company_Props;
        if (userRole === 1) {
            filteredCompanyProps = Company_Props.filter(company => company.id >= 100 && company.id <= 200);
        }

        if (userRole === 2) {
            filteredCompanyProps = Company_Props.filter(company => (company.id >= 50 && company.id <= 99) || company.id === 200);
        }
        if (userRole === 3) {
            filteredCompanyProps = Company_Props.slice(0, 10);
        }

        const rows = [];
        for (let i = 0; i < filteredCompanyProps.length; i += 2) {
            const rowItems = filteredCompanyProps.slice(i, i + 2);
            const row = (
                <View key={i / 2} style={styles.row}>
                    {rowItems.map((company) => (
                        <SquareIcon
                            key={company.id}
                            onPress={() => HandleSquarePress(company)}
                            iconImg={company.iconImage}
                            text={company.text}
                        />
                    ))}
                </View>
            );
            rows.push(row as never);
        }
        return rows;
    };

    return (
        <>
            <View style={styles.container}>
                <ScrollView
                    style={styles.rowContainer}
                    showsVerticalScrollIndicator={false}
                >

                    {renderRows()}
                </ScrollView>
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