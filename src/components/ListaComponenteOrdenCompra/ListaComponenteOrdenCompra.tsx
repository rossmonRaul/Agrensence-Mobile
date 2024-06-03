import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ObtenerDetalleOrdenDeCompraPorId } from '../../servicios/ServicioOrdenCompra';
import { Ionicons } from '@expo/vector-icons'

interface Item {
    id: string;
    producto: string;
    cantidad: string;
    precioUnitario: string;
    iva: string;
    total: string;
}

interface PropsEnviarDatos {
    enviarDatos: (datos: Item[]) => void;
    idOrdenDeCompra:number;
    datosImperdibles?: Item[],
  }

const ListaComponenteOrdenCompra: React.FC<PropsEnviarDatos> = ({enviarDatos,idOrdenDeCompra,datosImperdibles=[]}) => {
    const [items, setItems] = useState<Item[]>([]);
    const [producto, setProducto] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [precioUnitario, setPrecioUnitario] = useState('');
    const [iva, setIva] = useState('0');

    useEffect(() => {
        verificarIdOrdenDeCompra();
        verificarHistorialDatos(datosImperdibles);
      }, []);
    

      const verificarHistorialDatos = async (datosImperdibles:Item[]) => {
        setItems([...datosImperdibles]);
      }

      const verificarIdOrdenDeCompra = async () => {
        if(idOrdenDeCompra===0){
            //console.log('Método llamado al montar el componente, el id compra es 0',idOrdenDeCompra);
        }else{
            const formData = { IdOrdenDeCompra: idOrdenDeCompra};

            try {
                const datosListaProductos: Item[] = await ObtenerDetalleOrdenDeCompraPorId(formData);
                if (Array.isArray(datosListaProductos)) {
                    // Actualizar el estado 'items' agregando los nuevos productos
                    setItems(prevItems => [...prevItems, ...datosListaProductos]);
                    enviarDatos([...datosListaProductos]);
                } else {
                    console.error("datosListaProductos no es un array");
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }   
      };

    const calculateTotal = (cantidad: string, precioUnitario: string, iva: string) => {
        const subtotal = parseFloat(cantidad) * parseFloat(precioUnitario);
        const ivaTotal = subtotal * (parseFloat(iva) / 100);
        return subtotal + ivaTotal;
    };

    const addItem = () => {

        if (parseFloat(cantidad) < 0.1) {
            alert('La cantidad debe ser mayor que cero.');
            return;
        }
        if (parseFloat(precioUnitario) < 0.1) {
            alert('El precio unitario debe ser mayor que cero.');
            return;
        }
        
        if (producto.trim() !== '' && cantidad.trim() !== '' && precioUnitario.trim() !== '') {
            const total = calculateTotal(cantidad, precioUnitario, iva).toFixed(2);
            const newItem: Item = {
                id: Date.now().toString(),
                producto,
                cantidad,
                precioUnitario,
                iva,
                total
            };
            setItems([...items, newItem]);
            enviarDatos([...items, newItem]);
            
            setProducto('');
            setCantidad('');
            setPrecioUnitario('');
            setIva('0');
        }
    };

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
        enviarDatos(items.filter(item => item.id !== id));
    };

    return (
        
        <View style={styles.container}>
            <Text style={styles.formText} >Producto</Text>
            <TextInput
                placeholder="Producto"
                value={producto}
                onChangeText={setProducto}
                style={styles.input}
            />
            <Text style={styles.formText} >Cantidad</Text>
            <TextInput
                placeholder="Cantidad"
                keyboardType="numeric"
                value={cantidad}
                onChangeText={setCantidad}
                style={styles.input}
            />
            <Text style={styles.formText} >Precio Unitario</Text>
            <TextInput
                placeholder="Precio Unitario"
                keyboardType="numeric"
                value={precioUnitario}
                onChangeText={setPrecioUnitario}
                style={styles.input}
            />
            <Text style={styles.formText} >Iva</Text>
            <Picker
                selectedValue={iva}
                onValueChange={(itemValue) => setIva(itemValue)}
                style={[styles.picker,styles.pickerBorder]}
            >
                <Picker.Item label="Exento" value="0" />
                <Picker.Item label="1%" value="1" />
                <Picker.Item label="2%" value="2" />
                <Picker.Item label="3%" value="3" />
                <Picker.Item label="4%" value="4" />
                <Picker.Item label="5%" value="5" />
                <Picker.Item label="6%" value="6" />
                <Picker.Item label="7%" value="7" />
                <Picker.Item label="8%" value="8" />
                <Picker.Item label="9%" value="9" />
                <Picker.Item label="10%" value="10" />
                <Picker.Item label="11%" value="11" />
                <Picker.Item label="12%" value="12" />
                <Picker.Item label="13%" value="13" />
            </Picker>
            <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => {
                                        addItem();
                                    }}
                                >
                                    <View style={styles.buttonContent}>
                                        <Ionicons name="add-circle" size={20} color="white" style={styles.iconStyle} />
                                        <Text style={styles.buttonText}>Agregar</Text>
                                    </View>
                                </TouchableOpacity>
            {items.map(item => (
                <View key={item.id} style={styles.itemContainer}>
                    <View  style={styles.recuadroContainer}>
                    <TouchableOpacity style={styles.recuadro} onPress={() => removeItem(item.id)}>
                        <Text style={styles.removeText}>X</Text>
                    </TouchableOpacity>
                    </View>
                    <Text style={styles.text}>Producto: {item.producto}</Text>
                    <Text style={styles.text}>Cantidad: {item.cantidad}</Text>
                    <Text style={styles.text}>Precio Unitario: ₡{item.precioUnitario}</Text>
                    <Text style={styles.text}>IVA: {item.iva}%</Text>
                    <Text style={styles.text}>Total: ₡{item.total}</Text>
                    
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        padding: 10,
    },
    picker: {
        height: 50,
        width: '100%',
        marginBottom: 10,
    },
    pickerBorder: {
        borderWidth: 1, // Ancho del borde
        borderColor: 'gray', // Color del borde
        borderRadius: 4, // Radio del borde
    },
    itemContainer: {
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    text: {
        fontSize: 16,
    },
    removeText: {
        color: 'red',
        //marginTop: 10,
        fontSize:24,
        //textAlign: 'right',
    //     borderWidth: 2,        // Ancho del borde
    // borderColor: 'black',  // Color del borde
    // borderRadius: 5,    
    },
    formText: {
        fontSize: 20,
        fontFamily: 'CatamaranBold'
    },
    Button:{
        backgroundColor: '#548256'
    },
    recuadro:{
     borderWidth: 2,        // Ancho del borde
     borderColor: '#ddd',  // Color del borde
     borderRadius: 5, 
     width:35,
     height:40,
     alignItems: 'center',
     justifyContent:'center',
    },
    recuadroContainer:{
        justifyContent:"flex-end",
        alignItems:"flex-end"
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
        fontFamily: 'CatamaranBold'
    },
  button: {
        backgroundColor: '#548256',
        //padding: 8,
        alignItems: 'center',
        borderRadius: 12,
        marginBottom: 10,
        //width: ,
        height: 35,
    },
 buttonContent: {
        marginTop: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
 iconStyle: {
        width: 20,
        height: 20,
        marginRight: 5,
    },
});

export default ListaComponenteOrdenCompra;