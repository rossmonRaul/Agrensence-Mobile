import React from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { styles } from '../../../styles/menu-global-styles.styles';
import { IconRectangle } from '../../../components/IconRectangle/IconRectangle';
import { Admin_hidrico } from '../../../constants';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../hooks/useAuth';
import BottomNavBar from '../../../components/BottomNavbar/BottomNavbar';
import { ScreenProps } from '../../../constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackButtonComponent } from '../../../components/BackButton/BackButton';


export const MenuHidricoScreen: React.FC = () => {
    const { userData } = useAuth();
    const userRole = userData.idRol;
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    //  Aqui va la se logra ir a otras pantallas segun el recuadro que se presione
    const HandleRectanglePress = (item: any) => {
        if (item.screen !== '') {

            navigation.navigate(item.screen);

        } else {
            alert('Pantalla aún no disponible');
        }
    }

    //  Se renderiza los cuadros con sus respectivos iconos


    return (
        <>
            <View style={styles.container} >
                <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#274c48'} />
                <View style={styles.textAboveContainer}>
                    <Text style={styles.textAbove} >Administración del uso del agua</Text>
                </View>

                <View style={styles.rowContainer}>

                    {Admin_hidrico.map((item) => (

                        <View style={styles.row} key={item.id}>
                            <IconRectangle
                                onPress={() => HandleRectanglePress(item)}
                                iconImg={item.iconImage}
                                text={item.text}
                            />
                        </View>
                    ))}

                </View>

            </View>
            <BottomNavBar />
        </>
    );
};