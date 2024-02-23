import React from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { styles } from './menu-principal.styles';
import { SquareIcon } from '../../components/IconSquare/IconSquare';
import { Company_Props } from '../../constants';
import { UserContext } from '../../context/UserProvider';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import BottomNavBar from '../../components/BottomNavbar/BottomNavbar';
export const MenuScreen: React.FC = () => {
    const { userData } = useAuth();
    const userRole = userData.idRol;
    const navigation = useNavigation();

    //  Aqui va la se logra ir a otras pantallas segun el recuadro que se presione
    const HandleSquarePress = (screen: string) => {
        if (screen !== '') {
            navigation.navigate(screen as never);
        } else {
            alert('Pantalla aun no disponible')
        }
    }

    //  Se renderiza los cuadros con sus respectivos iconos
    const renderRows = () => {
        let filteredCompanyProps = Company_Props;
        if (userRole === 1) {
            filteredCompanyProps = Company_Props.filter(company => company.id === 11 || company.id === 13 || company.id === 14 || company.id === 15);
        }
        if (userRole === 2) {
            filteredCompanyProps = Company_Props.slice(0, 12);
        }
        if (userRole === 3) {
            filteredCompanyProps = Company_Props.slice(0, 10);
        }
        if (userRole === 4) {
            filteredCompanyProps = Company_Props.filter(company => company.id === 7 || company.id === 15);
        }


        const rows = [];
        for (let i = 0; i < filteredCompanyProps.length; i += 2) {
            const rowItems = filteredCompanyProps.slice(i, i + 2);
            const row = (
                <View key={i / 2} style={styles.row}>
                    {rowItems.map((company) => (
                        <SquareIcon
                            key={company.id}
                            onPress={() => HandleSquarePress(company.screen)}
                            iconImg={company.iconImage}
                            text={company.text}
                        />
                    ))}
                </View>
            );
            rows.push(row as never);
        }
        return rows;
    };

    return (
        <>
            <View style={styles.container}>
                <ScrollView
                    style={styles.rowContainer}
                    showsVerticalScrollIndicator={false}
                >

                    {renderRows()}
                </ScrollView>
            </View>
            <BottomNavBar />
        </>
    );
};