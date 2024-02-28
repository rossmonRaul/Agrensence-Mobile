import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { styles } from './IconSquare.styles'

//Este es un componente el cual se le pasa una imagen y un icono para luego utilizarse en Empresa
interface SquareIconProps {
    iconImg?: any;
    text?: string;
    onPress: () => void;
}

export const SquareIcon: React.FC<SquareIconProps> = ({ iconImg, text, onPress }) => {
    if (iconImg && text) {
        return (
            <TouchableOpacity style={styles.container} onPress={onPress} >
                <View style={styles.square}>
                    <Image source={iconImg} style={styles.iconImage} />
                    <Text style={styles.text} >{text}</Text>
                </View>
            </TouchableOpacity>
        )
    } else {
        return (
            <View style={styles.container}>

            </View>
        )
    }

}