import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 15,
        flexDirection: 'row',
        height: 40,
        backgroundColor: '#d8d8d8',
        borderRadius: 40,
        marginLeft: 20,
        marginRight: 20,
        width: '90%',
    },
    tab: {
        flex: 1,
        justifyContent: 'center',
        marginTop: 5,
        alignItems: 'center',
    },
    tabText: {
        color: '#565656',
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