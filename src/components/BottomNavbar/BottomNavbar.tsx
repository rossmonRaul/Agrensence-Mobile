import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from './BottomNavbar.styles';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenProps } from '../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

const BottomNavBar = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const navigateToInicio = () => {
        navigation.navigate(ScreenProps.Menu.screenName);
    };

    const navigateToNotificaciones = () => {
        console.log('navigateToNotificaciones')
    };


    const handleLogOut = async () => {
        // Mostrar un cuadro de diálogo de confirmación antes de cerrar sesión
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro de que deseas cerrar sesión?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Sí',
                    onPress: async () => {
                        await AsyncStorage.clear();
                        navigation.navigate(ScreenProps.Login.screenName);
                    },
                },
            ],
            { cancelable: false }
        );
    };
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.tab} onPress={navigateToInicio}>
                <AntDesign name="home" size={20} color="#565656" />
                <Text style={styles.tabText}>Inicio</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab} onPress={navigateToNotificaciones}>
                <Ionicons name="notifications" size={20} color="#565656" />
                <Text style={styles.tabText}>Notificaciones</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab} onPress={handleLogOut}>
                <MaterialIcons name="logout" size={20} color="#565656" />
                <Text style={styles.tabText}>Cerrar sesión</Text>
            </TouchableOpacity>
        </View>
    );
};

export default BottomNavBar;
