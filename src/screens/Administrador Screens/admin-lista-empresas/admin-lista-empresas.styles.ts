import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center'
    },
    textAboveContainer: {
        alignItems: 'center',
        width: 300,
        paddingTop: 20,
        paddingLeft: 0,           
        alignSelf: 'center',      
        flexDirection: 'row',
        marginBottom: 10,
        justifyContent: 'center' 
    },
    rowContainer: {
        width: '100%',
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
        color: '#548256',
        alignSelf: 'flex-start',
        marginLeft: 5,
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
    },
    titleContainer: {
        alignItems: 'flex-start',
        width: 300,
        paddingTop: 20,
        paddingLeft: 20,
        alignSelf: 'flex-end'
    },
    searchContainer: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    
  formText: {
    fontSize: 20,
    fontFamily: 'CatamaranBold'
  },
    searchInput: {
        width: '105%',
        height: 40,
        borderWidth: 1.2,
        fontFamily: 'CatamaranSemiBold',
        borderColor: '#548256',
        borderRadius: 8,
        paddingLeft: 10,
        marginRight: 10,
    },
    searchIconContainer: {
        padding: 10,
        backgroundColor: '#e0e0e0',
        borderRadius: 8,
    },
    listcontainer: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 60,
        alignItems: 'center'
    },
})