import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    upperContainer: {
        flex: 0.4,
        resizeMode: 'cover',
        justifyContent: 'center',
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
        marginBottom: 10,
        alignItems: 'center',
        borderRadius: 12,
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
        fontFamily: 'CatamaranBold'
    },
    buttonContainer: {
        paddingTop: 20,
    },
    buttonDelete: {
        marginTop: 10,
        backgroundColor: '#aa5458',
        padding: 8,
        alignItems: 'center',
        borderRadius: 12,
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
    secondForm: {
        paddingTop: 10,
    },
    rowContainer: {
        width: '100%',
    }
});
