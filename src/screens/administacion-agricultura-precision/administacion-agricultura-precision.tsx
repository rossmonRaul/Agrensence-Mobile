import React, { useState, useEffect } from 'react';
import { View, ImageBackground, TextInput, TouchableOpacity, Text } from 'react-native';
import { styles } from '../../styles/menu-global-styles.styles';
import { BackButtonComponent } from '../../components/BackButton/BackButton';
import { IconRectangle } from '../../components/IconRectangle/IconRectangle';
import { Admin_Agricultura_Precision } from '../../constants';
import { ScreenProps } from '../../constants';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const AdministracionAgriculturaPrecision: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const HandleRectanglePress = (agriculture: any) => {
        if (agriculture.screen !== '') {
            if (agriculture.datoValidacion !== undefined) {
                navigation.navigate(agriculture.screen, { datoValidacion: agriculture.datoValidacion });
            } else {
                navigation.navigate(agriculture.screen);
            }
        } else {
            alert('Pantalla aún no disponible');
        }
    }

    return (
        <View style={styles.container} >
            <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#274c48'} />
            <View style={styles.textAboveContainer}>
                <Text style={styles.textAbove} >Administración de Agricultura de Precisión</Text>
            </View>

            <View style={styles.rowContainer}>

                {Admin_Agricultura_Precision.map((agriculture) => (
                    <View style={styles.row} key={agriculture.id}>
                        <IconRectangle
                            onPress={() => HandleRectanglePress(agriculture)}
                            iconImg={agriculture.iconImage}
                            text={agriculture.text}
                        />
                    </View>
                ))}

            </View>

        </View>
    );
}