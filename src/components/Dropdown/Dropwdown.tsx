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
    onChange: (item: { label: string; value: string }) => void;
}
const DropdownComponent: React.FC<DropdownComponentProps> = ({
    placeholder,
    data,
    value,
    iconName,
    onChange,
}) => {
    return (
        <View style={styles.dropdownView} >
            <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                placeholder={placeholder}
                selectedTextStyle={styles.selectedTextStyle}
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
                        color="black" />
                )}
            />
        </View>
    );
};

export default DropdownComponent;