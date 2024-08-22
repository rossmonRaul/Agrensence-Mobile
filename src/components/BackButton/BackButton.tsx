import React from 'react';
import { TouchableOpacity } from 'react-native';
import { styles } from './BackButton.styles';
import { AntDesign } from '@expo/vector-icons';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface BackButtonProps {
    screenName: string;
    color: string;
    parametro?: string;
}

export const BackButtonComponent: React.FC<BackButtonProps> = ({ screenName, color, parametro }) => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const handleBackPress = () => {
        if (parametro) {
            navigation.navigate(screenName, { datoValidacion: parametro });
        } else {
            navigation.navigate(screenName);
        }
    };

    return (
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <AntDesign name="left" size={34} color={color} />
        </TouchableOpacity>
    );
};
