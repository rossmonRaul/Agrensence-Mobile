import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { styles } from './Dropdown.styles'
import { FontAwesome } from '@expo/vector-icons';

//Este es un componente llamado DropdownComponent para pasarle algunos datos como por ejemplo el de la interfaz
interface DropdownComponentProps {
    placeholder: string;
    data: { label: string; value: string }[];
    value: string | null;
    iconName: string;
    selectedTextColor?: string;
    iconColor?: string;
    height?: number;
    onChange: (item: { label: string; value: string }) => void;
}
const DropdownComponent: React.FC<DropdownComponentProps> = ({
    placeholder,
    data,
    value,
    iconName,
    selectedTextColor = 'black',
    iconColor = 'black',
    height = 50,
    onChange,
}) => {
    const placeholderFontFamily = selectedTextColor !== 'black' ? 'CatamaranBold' : 'CatamaranMedium';

    return (
        <View style={styles.dropdownView} >
            <Dropdown
                style={[styles.dropdown, { height: height }]}
                placeholderStyle={[styles.placeholderStyle, { color: selectedTextColor, fontFamily: placeholderFontFamily }]}
                placeholder={placeholder}
                selectedTextStyle={[styles.selectedTextStyle, { color: selectedTextColor, fontFamily: placeholderFontFamily }]}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={data}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                searchPlaceholder="Buscar..."
                value={value}
                onChange={onChange}
                renderLeftIcon={() => (
                    <FontAwesome style={styles.icon}
                        name={iconName as never}
                        size={20}
                        color={iconColor} />
                )}
            />
        </View>
    );
};

export default DropdownComponent;