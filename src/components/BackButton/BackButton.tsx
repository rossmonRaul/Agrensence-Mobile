import React from 'react';
import { TouchableOpacity } from 'react-native';
import { styles } from './BackButton.styles';
import { AntDesign } from '@expo/vector-icons';

interface BackButtonProps {
    onPress: () => void;
}

export const BackButtonComponent: React.FC<BackButtonProps> = ({ onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.backButton}>
            <AntDesign name="left" size={34} color="#264d49" />
        </TouchableOpacity>
    )
}
