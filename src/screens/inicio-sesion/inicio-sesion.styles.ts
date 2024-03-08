import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    upperContainer: {
        flex: 0.8,
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
        paddingTop: 20,
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
    buttonText: {
        color: 'white',
        fontSize: 20,
        fontFamily: 'CatamaranBold'
    },
    buttonContainer: {
        paddingTop: 20,
    },
    loginText: {
        fontSize: 26,
        fontFamily: 'CatamaranBold',
    },
    underLoginText: {
        fontSize: 14,
        paddingLeft: 2,
        fontFamily: 'CatamaranRegular',
    },
    createAccountContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 16,
    },
    createAccountText: {
        color: '#696866',
        fontSize: 14,
        fontFamily: 'CatamaranBold'
    },
    formText: {
        fontSize: 22,
        fontFamily: 'CatamaranBold'
    },
    loadingText: {
        paddingBottom: 30,
    },
    loadingView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    rowContainer: {
        width: '100%',
    }
});
