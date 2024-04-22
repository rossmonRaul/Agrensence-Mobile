import React, { useState, useEffect } from 'react';
import { View, ImageBackground, TextInput, TouchableOpacity, Text } from 'react-native';
import { styles } from '../../styles/menu-global-styles.styles';
import { BackButtonComponent } from '../../components/BackButton/BackButton';
import { IconRectangle } from '../../components/IconRectangle/IconRectangle';
import { Admin_cultivation } from '../../constants';
import { ScreenProps } from '../../constants';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const AdministracionCultivos: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const handleBackPress = () => {
        console.log('Botón de retroceso presionado');
    };

    const HandleRectanglePress = (crops: any) => {
        if (crops.screen !== '') {
            if (crops.datoValidacion !== undefined) {
                navigation.navigate(crops.screen, { datoValidacion: crops.datoValidacion });
            } else {
                navigation.navigate(crops.screen);
            }
        } else {
            alert('Pantalla aún no disponible');
        }
    }

    return (
        <View style={styles.container} >
            <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#274c48'} />
            <View style={styles.textAboveContainer}>
                <Text style={styles.textAbove} >Administración de cultivos</Text>
            </View>

            <View style={styles.rowContainer}>

                {Admin_cultivation.map((crops) => (
                    <View style={styles.row} key={crops.id}>
                        <IconRectangle
                            onPress={() => HandleRectanglePress(crops)}
                            iconImg={crops.iconImage}
                            text={crops.text}
                        />
                    </View>
                ))}

            </View>

        </View>
    );
}