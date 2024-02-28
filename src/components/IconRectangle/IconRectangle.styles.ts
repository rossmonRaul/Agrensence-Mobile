import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rectangle: {
        flexDirection: 'row',
        backgroundColor: '#264d49',
        width: 350,
        height: 120,
        padding: 0,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    text: {
        fontFamily: 'CatamaranBold',
        color: '#a5cf60',
        fontSize: 20
    },
    iconImage: {
        width: 70,
        height: 70,
        marginTop: 10,
        marginBottom: 5
    },
    textContainer: {
        width: 230,
        justifyContent: 'center',
        alignItems: 'center'
    }
})

