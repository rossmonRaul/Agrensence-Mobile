import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e2e465',
        padding: 80,
    },
    textAboveContainer: {
        alignItems: 'flex-start',
        width: 300,
        paddingTop: 20,
        paddingLeft: 20,
        alignSelf: 'flex-end'
    },
    rowContainer: {
        flex: 1,
        marginTop: 10,
    },
    row: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    textAbove: {
        fontFamily: 'CatamaranBold',
        fontSize: 24,
        color: '#274c48',
        alignSelf: 'flex-start',
    }
})