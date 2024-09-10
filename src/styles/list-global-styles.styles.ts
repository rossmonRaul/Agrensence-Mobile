import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    listcontainer: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textAboveContainer: {
        //alignItems: 'flex-start',
        width: '100%',
        paddingTop: 20,
        paddingLeft: 0,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
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
        // alignSelf: 'flex-start',
        // alignItems: 'center',
        // justifyContent: 'center',
        // textAlign: 'center',
        textAlign: 'center', // Esto centra el texto dentro del componente
    alignSelf: 'center', // Asegura que el componente esté centrado en su contenedor
    justifyContent: 'center',
    },
    titleContainer: {
        alignItems: 'flex-start',
        width: 300,
        paddingTop: 20,
        paddingLeft: 20,
        alignSelf: 'flex-end'
    },
    searchContainer: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',  
        //marginBottom: 10,
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
    dropDownContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 300,
    },
    datePickerContainer: {
        flexDirection: 'row',
        //justifyContent: 'space-between',
        justifyContent: 'center',
        marginRight:5,
        marginLeft:5,
        gap: 10,
    },
    input: {
        height: 40,
        borderColor: '#548256',
        borderWidth: 2,
        marginBottom: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
        fontFamily: 'CatamaranMedium',
        width: 120,
        textAlign: 'center'
    },
    inputDatePicker: {
        height: 40,
        borderColor: '#548256',
        borderWidth: 2,
        marginBottom: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
        fontFamily: 'CatamaranMedium',
        width: 182,
        textAlign: 'center'
    },
    iosPickerButtons: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    buttonPicker: {
        borderRadius: 5,
        padding: 10,
        backgroundColor: '#ccc',
    },
    dateTimePicker: {
        width: 120,
    },
    filterButton: {
        backgroundColor: '#548256',
        padding: 10,
        borderRadius: 5,
        height: 40,
        justifyContent: 'center',
        marginRight: 10
    },
    filterButtonText: {
        color: 'white',
        paddingHorizontal: 10,
    },
    buttonContent: {
        marginTop: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        //height: 40,
    },

 iconStyle: {
        width: 20,
        height: 20,
        marginRight: 5,
    },

    notificationContainer: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    notificationText: {
        fontSize: 14,
        color: '#333',
    },
    notificationDescription: {
        fontSize: 16,
        color: '#000',
        fontWeight: 'bold',
        marginVertical: 5,
    },
    highlight: {
        fontWeight: 'bold',
        color: '#274c48',
    },
    formText: {
        fontSize: 20,
        fontFamily: 'CatamaranBold'
      },
    closeButton: {
        position: 'absolute',
        top: 110,
        right: 10,
        zIndex: 1, // Asegura que el botón esté sobre el contenido de la notificación
        backgroundColor: 'transparent', // Fondo transparente para que solo se vea el icono
        padding: 1, // Añade algo de espacio alrededor del icono
    },
    
})