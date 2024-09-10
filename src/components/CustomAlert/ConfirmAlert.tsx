import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';

interface Button {
  text: string;
  onPress: () => void;
  style?: 'cancel' | 'default' | 'destructive';
}

interface ConfirmAlertProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttons: Button[];
}

const ConfirmAlert: React.FC<ConfirmAlertProps> = ({ isVisible, onClose, title, message, buttons }) => {
  return (
    <Modal
      isVisible={isVisible}
      backdropColor="black" // Color del fondo
      backdropOpacity={0.5} // Opacidad del fondo
      onBackdropPress={() => {}}
      style={{ justifyContent: 'center', alignItems: 'center' }}
    >
      <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center', width: '80%' }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', fontFamily: 'CatamaranSemiBold' }}>{title}</Text>
        <Text style={{ marginTop: 10, fontFamily: 'CatamaranSemiBold' }}>{message}</Text>

        <View style={{ marginTop: 20, flexDirection: 'row' }}>
          {buttons.map((button, index) => (
            <TouchableOpacity
              key={index}
              onPress={button.onPress}
              style={{
                marginHorizontal: 10,
                padding: 10,
                backgroundColor: button.style === 'cancel' ? 'red' : 'green',
                borderRadius: 5,
              }}
            >
              <Text style={{ color: 'white', fontFamily: 'CatamaranSemiBold' }}>{button.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmAlert;