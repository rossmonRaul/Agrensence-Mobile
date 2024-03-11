import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    upperContainer: {
        flex: 0.25,
        resizeMode: 'cover',
        justifyContent: 'center',
    },
    buttonDelete: {
        marginTop: 3,
        backgroundColor: '#aa5458',
        padding: 8,
        alignItems: 'center',
        borderRadius: 12,
    },
    buttonActive: {
        backgroundColor: '#548256',
        marginTop: 3,
        padding: 8,
        alignItems: 'center',
        borderRadius: 12,
    },
    lowerContainer: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20,
    },
    upperContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    formContainer: {
        paddingTop: 10,
        justifyContent: 'center',
    },
    buttonContent: {
        marginTop: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        height: 40,
        borderColor: '#548256',
        borderWidth: 2,
        marginBottom: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
        fontFamily: 'CatamaranMedium'
    },
    button: {
        backgroundColor: '#548256',
        padding: 8,
        alignItems: 'center',
        borderRadius: 12,
    },
    buttonPicker: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        marginTop: 10,
        marginBottom: 15,
        backgroundColor: "#075985"
    },
    buttonTextBack: {
        color: 'black',
        fontSize: 20,
        fontFamily: 'CatamaranBold'
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
        fontFamily: 'CatamaranBold'
    },
    buttonTextPicker: {
        fontWeight: "500",
        fontSize: 14,
        fontFamily: 'CatamaranBold'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    createAccountText: {
        fontSize: 26,
        fontFamily: 'CatamaranBold',
    },
    loginButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 16,
    },
    loginButtonText: {
        color: '#696866',
        fontSize: 14,
        fontFamily: 'CatamaranBold'
    },
    formText: {
        fontSize: 22,
        fontFamily: 'CatamaranBold'
    },
    picker: {
        height: 50,
        borderColor: '#548256',
        borderWidth: 2,
        marginBottom: 10,
        borderRadius: 10,
    },
    dropdown: {
        height: 50,
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
    rowContainer: {
        width: '100%',
    },
    inputContainer: {

    },
    inputMultiline: {
        height: 100,
        borderColor: '#548256',
        borderWidth: 2,
        marginBottom: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
        fontFamily: 'CatamaranMedium'
    },
    calendarIcon: {
        // Estilos para el icono del calendario
        marginLeft: 10, // Espacio entre el input y el icono
    },
    dateTimePicker: {
        height: 120,
        marginTop: -10,
    },
    pickerButton: {
        paddingHorizontal: 20,
    }
});

