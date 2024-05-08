import React, { Component, ReactNode, ErrorInfo } from 'react';
import { View, Text } from 'react-native';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        // Actualizar el estado para indicar que ha ocurrido un error
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Puedes registrar el error aquí si lo deseas
        console.error('Error capturado por ErrorBoundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Puedes personalizar este mensaje de error como desees
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Ocurrió un error en la aplicación. Por favor, intenta de nuevo más tarde.</Text>
                </View>
            );
        }

        return this.props.children;
    }
}
export default ErrorBoundary;
