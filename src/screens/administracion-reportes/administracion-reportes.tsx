import React, { useState, useEffect } from 'react';
import { View, ImageBackground, TextInput, TouchableOpacity, Text } from 'react-native';
import { styles } from '../../styles/menu-global-styles.styles';
import { BackButtonComponent } from '../../components/BackButton/BackButton';
import { IconRectangle } from '../../components/IconRectangle/IconRectangle';
import { Admin_Reports } from '../../constants';
import { ScreenProps } from '../../constants';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const AdministracionReportes: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const HandleRectanglePress = (report: any) => {
        if (report.screen !== '') {
            if (report.datoValidacion !== undefined) {
                navigation.navigate(report.screen, { datoValidacion: report.datoValidacion });
            } else {
                navigation.navigate(report.screen);
            }
        } else {
            alert('Pantalla aún no disponible');
        }
    }

    return (
        <View style={styles.container} >
            <BackButtonComponent screenName={ScreenProps.Menu.screenName} color={'#274c48'} />
            <View style={styles.textAboveContainer}>
                <Text style={styles.textAbove} >Administración de reportes</Text>
            </View>

            <View style={styles.rowContainer}>

                {Admin_Reports.map((report) => (
                    <View style={styles.row} key={report.id}>
                        <IconRectangle
                            onPress={() => HandleRectanglePress(report)}
                            iconImg={report.iconImage}
                            text={report.text}
                        />
                    </View>
                ))}

            </View>

        </View>
    );
}