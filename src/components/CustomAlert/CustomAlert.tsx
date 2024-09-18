import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Button {
  text: string;
  onPress: () => void;
}

interface CustomAlertProps {
  isVisible: boolean;
  onClose: () => void;
  message: string;
  iconType: 'success' | 'error' | 'warning' | 'info';
  buttons: Button[];
  navigateTo?: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  isVisible,
  onClose,
  message,
  iconType,
  buttons,
  navigateTo,
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Icon name="check-circle" size={50} color="green" />;
      case 'error':
        return <Icon name="cancel" size={50} color="red" />;
      case 'warning':
        return <Icon name="warning" size={50} color="orange" />;
      case 'info':
      default:
        return <Icon name="info" size={50} color="blue" />;
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      backdropColor="black"
      backdropOpacity={0.5}
      onBackdropPress={() => {}}  // Close the alert when tapping outside
      style={{ justifyContent: 'center', alignItems: 'center' }}
    >
      <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center', width: '80%' }}>
        {getIcon(iconType)}
        <Text style={{ marginTop: 20, textAlign: 'center' }}>{message}</Text>

        <View style={{ marginTop: 20, flexDirection: 'row' }}>
          {buttons.map((button, index) => (
            <TouchableOpacity key={index} onPress={() => {
              button.onPress();
              onClose();  // Close the alert
              if (iconType === 'success' && navigateTo) navigateTo();  // Navigate if success
            }} style={{ marginHorizontal: 10 }}>
              <Text style={{ color: 'blue' }}>{button.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;