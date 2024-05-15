import React, { useState, useEffect } from 'react';
import { View, ImageBackground, TextInput, TouchableOpacity, Text } from 'react-native';
import { styles } from '../../styles/menu-global-styles.styles';
import { BackButtonComponent } from '../../components/BackButton/BackButton';
import { IconRectangle } from '../../components/IconRectangle/IconRectangle';
import { Admin_ordenCompra } from '../../constants';
import { ScreenProps } from '../../constants';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const AdminAdministracion: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const HandleRectanglePress = (admin: any) => {
        if (admin.screen !== '') {
            if (admin.datoValidacion !== undefined) {
                navigation.navigate(admin.screen, { datoValidacion: admin.datoValidacion });
            } else {
                navigation.navigate(admin.screen);
            }
        } else {
            alert('Pantalla aún no disponible');
        }
    }

    return (
        <View style={styles.container} >
            <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#274c48'} />
            <View style={styles.textAboveContainer}>
                <Text style={styles.textAbove} >Administración</Text>
            </View>

            <View style={styles.rowContainer}>

                {Admin_ordenCompra.map((admin) => (
                    <View style={styles.row} key={admin.id}>
                        <IconRectangle
                            onPress={() => HandleRectanglePress(admin)}
                            iconImg={admin.iconImage}
                            text={admin.text}
                        />
                    </View>
                ))}

            </View>

        </View>
    );
}