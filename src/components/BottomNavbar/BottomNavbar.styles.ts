import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 8,
        flexDirection: 'row',
        height: 42,
        //backgroundColor: '#d8d8d8',
        backgroundColor: '#025951',
        borderRadius: 40,
        marginLeft: 20,
        marginRight: 20,
        width: '90%',
    },
    tab: {
        flex: 1,
        justifyContent: 'center',
        marginTop: 2,
        alignItems: 'center',
    },
    tabText: {
        //color: '#565656',
        color: '#a5cf60',
        fontSize: 10,
        fontFamily: 'CatamaranRegular',
    },
    notificationIconContainer: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationBadge: {
        position: 'absolute',
        top: -5,
        right: -10,
        backgroundColor: 'red',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationBadgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
})