import React, { useState, useEffect } from 'react';
import { View, ImageBackground, TextInput, TouchableOpacity, Text } from 'react-native';
import { styles } from '../../../styles/menu-global-styles.styles';
import { BackButtonComponent } from '../../../components/BackButton/BackButton';
import { IconRectangle } from '../../../components/IconRectangle/IconRectangle';
import { Admin_plagas, ScreenProps } from '../../../constants';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const AdministracionPlagas: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const HandleRectanglePress = (pests: any) => {
        if (pests.screen !== '') {
            if (pests.datoValidacion !== undefined) {
                navigation.navigate(pests.screen, { datoValidacion: pests.datoValidacion });
            } else {
                navigation.navigate(pests.screen);
            }
        } else {
            alert('Pantalla aún no disponible');
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

        </View>
    );
}