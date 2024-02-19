import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    square: {
        backgroundColor: '#264d49',
        width: 140,
        height: 140,
        padding: 0,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontFamily: 'CatamaranBold',
        color: '#a5cf60',
        fontSize: 13,
        textAlign: 'center',
    },
    iconImage: {
        width: 70,
        height: 70,
        marginTop: 10,
        marginBottom: 5
    },
    squareWithoutIcon: {
        width: 120,
        height: 120,
    }
})

