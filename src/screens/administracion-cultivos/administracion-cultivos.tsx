import React, { useState, useEffect } from 'react';
import { View, ImageBackground, TextInput, TouchableOpacity, Text } from 'react-native';
import { styles } from './administracion-cultivos.styles'
import { BackButtonComponent } from '../../components/BackButton/BackButton';
import { IconRectangle } from '../../components/IconRectangle/IconRectangle';
import { Admin_cultivation } from '../../constants';
import { ScreenProps } from '../../constants';
export const AdministracionCultivos: React.FC = () => {

    const handleBackPress = () => {
        console.log('Botón de retroceso presionado');
    };

    const HandleRectanglePress = () => {
        console.log('Rectangulo Presiona');
    }

    return (
        <View style={styles.container} >
            <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#ffff'} />
            <View style={styles.textAboveContainer}>
                <Text style={styles.textAbove} >Administración de cultivos</Text>
            </View>

            <View style={styles.rowContainer}>

                {Admin_cultivation.map((item) => (
                    <View style={styles.row}>
                        <IconRectangle
                            key={item.id}
                            onPress={HandleRectanglePress}
                            iconImg={item.iconImage}
                            text={item.text}
                        />
                    </View>
                ))}

            </View>

        </View>
    );
}