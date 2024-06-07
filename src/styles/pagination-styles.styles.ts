import { StyleSheet } from 'react-native';

export const paginationStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    listContainer: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 20,
        alignItems: 'center',
    },
    textAboveContainer: {
        marginBottom: 10,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    pageButton: {
        padding: 10,
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 5,
    },
    activePageButton: {
        backgroundColor: 'gray',
    },
    pageButtonText: {
        color: '#333',
    },
    activePageButtonText: {
        color: '#fff',
    },
});