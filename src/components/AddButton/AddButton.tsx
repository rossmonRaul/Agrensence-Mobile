import React from 'react';
import { TouchableOpacity } from 'react-native';
import { styles } from './AddButton.styles';
import { AntDesign } from '@expo/vector-icons';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface BackButtonProps {
    screenName: string;
    color: string;
}

export const AddButtonComponent: React.FC<BackButtonProps> = ({ screenName, color }) => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const handleAddPress = () => {
        navigation.navigate(screenName);
    };

    return (
        <TouchableOpacity onPress={handleAddPress} style={styles.addButton}>
            <AntDesign name="plus" size={34} color={color} />
        </TouchableOpacity>
    );
};
