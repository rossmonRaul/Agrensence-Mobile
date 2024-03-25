import { StyleSheet, Dimensions } from 'react-native';

const windowWidth = Dimensions.get('window').width;

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        padding: 60,
         // Ajuste de estilos para pantallas pequeñas
         ...(
            windowWidth < 500 ? { 
                // Cambiar el padding horizontal en pantallas más pequeñas
                padding: 40
            } : {}
            
        )
    },
    rowContainer: {
        flex: 1,
        marginTop: 10,
        marginBottom: 10,
       
    },
    row: {
        flex: 1,
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        
    }
});

