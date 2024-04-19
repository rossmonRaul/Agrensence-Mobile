import React, { useState, useEffect } from 'react';
import { View, ImageBackground, TextInput, TouchableOpacity, Text } from 'react-native';
import { styles } from '../../styles/menu-global-styles.styles';
import { BackButtonComponent } from '../../components/BackButton/BackButton';
import { IconRectangle } from '../../components/IconRectangle/IconRectangle';
import { Admin_clima } from '../../constants';
import { ScreenProps } from '../../constants';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const AdministracionClima: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const handleBackPress = () => {
        console.log('Botón de retroceso presionado');
    };

    const HandleRectanglePress = (weather: any) => {
        if (weather.screen !== '') {
            if (weather.datoValidacion !== undefined) {
                navigation.navigate(weather.screen, { datoValidacion: weather.datoValidacion });
            } else {
                navigation.navigate(weather.screen);
            }
        } else {
            alert('Pantalla aún no disponible');
        }
    }

    return (
        <View style={styles.container} >
            <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#274c48'} />
            <View style={styles.textAboveContainer}>
                <Text style={styles.textAbove} >Administración de clima</Text>
            </View>

            <View style={styles.rowContainer}>

                {Admin_clima.map((weather) => (
                    <View style={styles.row} key={weather.id}>
                        <IconRectangle
                            onPress={() => HandleRectanglePress(weather)}
                            iconImg={weather.iconImage}
                            text={weather.text}
                        />
                    </View>
                ))}

            </View>

        </View>
    );
}