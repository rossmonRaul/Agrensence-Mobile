import React from 'react';
import { TouchableOpacity, View, Image, Text } from 'react-native';
import { styles } from './IconRectangle.styles';
import { AntDesign } from '@expo/vector-icons';

interface IconRectangleProps {
    iconImg: any;
    text: string;
    onPress: () => void;
}

export const IconRectangle: React.FC<IconRectangleProps> = ({ iconImg, text, onPress }) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress} >
            <View style={styles.rectangle}>
                <View><Image source={iconImg} style={styles.iconImage} /></View>
                <View style={styles.textContainer}><Text style={styles.text} >{text}</Text></View>


            </View>
        </TouchableOpacity>
    )
}
