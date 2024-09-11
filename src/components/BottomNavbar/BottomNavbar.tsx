import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { styles } from "./BottomNavbar.styles";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenProps } from "../../constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { CerrarSesion } from "../../servicios/ServicioUsuario";
import { ObtenerNotificaciones } from "../../servicios/ServicioNotificaciones";
import { useAuth } from "../../hooks/useAuth";
import { ObtenerFincas } from "../../servicios/ServicioFinca";
import { ObtenerParcelas } from "../../servicios/ServicioParcela";

const BottomNavBar = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const { userData } = useAuth();
  useEffect(() => {
    let fincas = [];
    let parcelas = [];
    let cargaInicial = false;
    const fetchFincas = async () => {
      fincas = await ObtenerFincas(userData.idEmpresa);
      parcelas = await ObtenerParcelas(userData.idEmpresa);
    };

    const fetchNotifications = async () => {
      try {
        if (!cargaInicial && userData.identificacion) {
          fetchFincas();
          cargaInicial = true;
        }
        if (userData.identificacion) {
          const notificaciones = await ObtenerNotificaciones();
          const notificacionesFiltradas = notificaciones.filter(
            (notificacion: { idFinca: any; idParcela: any }) => {
              const finca = fincas.find(
                (f: { idFinca: any }) => f.idFinca === notificacion.idFinca
              );
              const parcela = parcelas.find(
                (f: { idParcela: any }) =>
                  f.idParcela === notificacion.idParcela
              );
              return (
                finca &&
                (finca as any).idEmpresa === userData.idEmpresa &&
                parcela &&
                (parcela as any).idFinca === (finca as any).idFinca
              );
            }
          );
          const unreadCount = notificacionesFiltradas.length; // Puedes ajustar esto según tu lógica
          setNotificationCount(unreadCount);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    // Llamada inicial para obtener las notificaciones
    fetchNotifications();

    // Configura un intervalo para hacer polling cada 30 segundos (puedes ajustar el tiempo)
    const intervalId = setInterval(fetchNotifications, 1000);

    // Limpia el intervalo cuando se desmonte el componente
    return () => clearInterval(intervalId);
  }, []);

  const navigateToInicio = () => {
    navigation.navigate(ScreenProps.Menu.screenName);
  };

  const navigateToNotificaciones = () => {
    navigation.navigate(ScreenProps.Notifications.screenName);
  };

  const handleLogOut = async () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que deseas cerrar sesión?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sí",
          onPress: async () => {
            try {
              await CerrarSesion();
              navigation.navigate(ScreenProps.Login.screenName);
            } catch (error) {
              console.error("Error al cerrar sesión:", error);
              Alert.alert(
                "Error",
                "Ocurrió un error al cerrar sesión. Por favor, inténtalo de nuevo más tarde.",
                [{ text: "Aceptar" }],
                { cancelable: false }
              );
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
            <TouchableOpacity style={styles.tab} onPress={navigateToInicio}>
                <AntDesign name="home" size={22} color="#a5cf60" />
                <Text style={styles.tabText}>Inicio</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab} onPress={navigateToNotificaciones}>
                <View style={styles.notificationIconContainer}>
                    <Ionicons name="notifications" size={22} color="#a5cf60" />
                    {notificationCount > 0 && (
                        <View style={styles.notificationBadge}>
                            <Text style={styles.notificationBadgeText}>{notificationCount}</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.tabText}>Notificaciones</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab} onPress={handleLogOut}>
                <MaterialIcons name="logout" size={22} color="#a5cf60" />
                <Text style={styles.tabText}>Cerrar sesión</Text>
            </TouchableOpacity>
        </View>
  );
};

export default BottomNavBar;
