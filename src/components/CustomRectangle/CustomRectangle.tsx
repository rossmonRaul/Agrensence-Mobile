import { Text, View } from "react-native";
import { styles } from "./CustomRectangle.styles";

export interface CustomRectangleProps {
    data: { title: string; text: string }[];
}

export const CustomRectangle: React.FC<CustomRectangleProps> = ({ data }) => {
    return (
        <View style={styles.rectangle}>
            {data.map((item, index) => (
                <Text key={index} style={styles.text}>
                    <Text style={styles.titleText}>{item.title}:</Text> {item.text}
                </Text>
            ))}
        </View>
    );
};