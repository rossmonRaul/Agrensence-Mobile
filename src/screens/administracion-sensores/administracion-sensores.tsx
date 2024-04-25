import React, { useState, useEffect } from 'react';
import { View, ImageBackground, TextInput, TouchableOpacity, Text } from 'react-native';
import { styles } from '../../styles/menu-global-styles.styles';
import { BackButtonComponent } from '../../components/BackButton/BackButton';
import { IconRectangle } from '../../components/IconRectangle/IconRectangle';
import { Admin_sensor } from '../../constants';
import { ScreenProps } from '../../constants';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const AdministracionSensores: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();



    const HandleRectanglePress = (sensors: any) => {
        if (sensors.screen !== '') {
            if (sensors.datoValidacion !== undefined) {
                navigation.navigate(sensors.screen, { datoValidacion: sensors.datoValidacion });
            } else {
                navigation.navigate(sensors.screen);
            }
        } else {
            alert('Pantalla aún no disponible');
        }
    }

    return (
        <View style={styles.container} >
            <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#274c48'} />
            <View style={styles.textAboveContainer}>
                <Text style={styles.textAbove} >Administración de sensores</Text>
            </View>

            <View style={styles.rowContainer}>

                {Admin_sensor.map((sensors) => (
                    <View style={styles.row} key={sensors.id}>
                        <IconRectangle
                            onPress={() => HandleRectanglePress(sensors)}
                            iconImg={sensors.iconImage}
                            text={sensors.text}
                        />
                    </View>
                ))}

            </View>

        </View>
    );
}