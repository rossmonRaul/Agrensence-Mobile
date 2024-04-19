import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    dropdown: {
        borderColor: '#548256',
        borderWidth: 2,
        borderRadius: 8,
        paddingHorizontal: 8,
    },
    label: {
        position: 'absolute',
        backgroundColor: 'white',
        left: 22,
        top: 8,
        zIndex: 999,
        paddingHorizontal: 8,
        fontSize: 14,
    },
    placeholderStyle: {
        fontSize: 16,
    },
    selectedTextStyle: {
        fontSize: 16,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
    },
    dropdownView: {
        paddingBottom: 10,
    },
    icon: {
        marginRight: 5,
    },
});
