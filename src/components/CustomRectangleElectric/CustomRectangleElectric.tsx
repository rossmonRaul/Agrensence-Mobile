import React from "react";
import { Text, View } from "react-native";
import { styles } from "./CustomRectangleElectric.styles";

export interface CustomRectangleElectricProps {
    data: { title: string; text: string }[];
}

export const CustomRectangleElectric: React.FC<CustomRectangleElectricProps> = ({ data }) => {
    return (
        <View style={styles.rectangle}>
            {data.map((item, index) => {
                let textStyle = styles.text;
                let stressLevelText = "";
                if (!isNaN(parseFloat(item.text))) {
                    const value = parseInt(item.text);

                    if (value <= 20) {
                        textStyle = styles.textRed;
                        stressLevelText = "Alto estrés por sequía";
                        item.text += ` - ${stressLevelText}`
                    }
                    if (value >= 90.1) {
                        textStyle = styles.textRed;
                        stressLevelText = "Alto estrés por humedad";
                        item.text += ` - ${stressLevelText}`
                    }
                    if ((value >= 20.1 && value <= 30)) {
                        textStyle = styles.textOrange;
                        stressLevelText = "Medio estrés por sequía";
                        item.text += ` - ${stressLevelText}`
                    }
                    if ((value >= 80.1 && value <= 90)) {
                        textStyle = styles.textOrange;
                        stressLevelText = "Medio estrés por humedad";
                        item.text += ` - ${stressLevelText}`
                    }
                    if ((value >= 30.1 && value <= 50)) {
                        textStyle = styles.textGreen;
                        stressLevelText = "Bajo estrés por sequía";
                        item.text += ` - ${stressLevelText}`
                    }
                    if ((value >= 75 && value <= 80)) {
                        textStyle = styles.textGreen;
                        stressLevelText = "Bajo estrés por humedad";
                        item.text += ` - ${stressLevelText}`
                    }
                }

                stressLevelText = ''
                return (
                    <Text key={index} style={styles.text}>
                        <Text style={styles.titleText}>{item.title}:</Text> <Text style={textStyle}>{item.text}</Text>
                    </Text>
                );
            })}
        </View>
    );
};
