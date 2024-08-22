import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    rectangle: {
        borderWidth: 1,
        borderColor: '#025951',
        borderRadius: 5,
        padding: 10,
        backgroundColor: '#f9f9f9',
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        width: 375, 
    },
    text: {
        fontFamily: 'CatamaranRegular',
        fontSize: 18,
        marginBottom: 5,
        color: '#000',
    },
    titleText: {
        fontFamily: 'CatamaranBold',
        fontSize: 18,
        color: '#000',
    },
});