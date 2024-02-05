import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import { InsertarUsuario, ObtenerUsuarios } from './servicios/ServicioUsuario';

export default function App() {
  //const [data, setData] = useState(null);
  //shift+alt mas flecha abajo para copiar
  let [isloading, setIsLoading] = useState(true);
  let [error, setError] = useState();
  let [response, setResponse] = useState(null);

  useEffect(()=>{
     /*fetch("http://localhost:5271/api/v1.0/Usuario/ObtenerUsuarios")
    //fetch("http://192.168.100.20:5271/api/v1.0/Usuario/ObtenerUsuarios")
    .then(function(response){
      return response.json();
    })
    .then(function(json){
      setIsLoading(false);
      console.log(result);
      setResponse(result);
    })
    .catch(function(error) {
    console.log('There has been a problem with your fetch operation: ' + error.message);
    });*/

      /*.then(res=>res.json())
      .then(
        (result)=>{
          setIsLoading(false);
          console.log(result);
          setResponse(result);
        },
        (error)=>{
          setIsLoading(false);
          setError(error)
        }
      ).catch(e => {
        console.error(e)
        return e;
    })*/
      getAPIData();
  },[]);

   const getAPIData=async()=>{
    try {
      //const response = await fetch('http://localhost:5271/api/v1.0/Usuario/ObtenerUsuarios',);
      const response = await fetch('http://192.168.100.20:5271/api/v1.0/Usuario/ObtenerUsuarios',);
      const json = await response.json();
      console.log(json);
      return json.nombre;
    } catch (error) {
      console.error(error);
    }
    /*const url="http://localhost:5271/api/v1.0/Usuario/ObtenerUsuarios";
    const result=await fetch(url);
    console.log(result);*/
    //result=await result.json;
    //console.warn(result);
  }

 const getContent=()=>{
   if(isloading){
     return<ActivityIndicator size="large"/>;
  }
   if(error){
     return<Text>{error.message}</Text>
   }

   console.log(response);
     return<Text>API Called</Text>
 }; 


  return (
    <View>
      {getContent()}
      <StatusBar style="auto" />
    </View>
  );
}



const styles = StyleSheet.create({
  btnAlerta: {
    backgroundColor: "#0000FF",
    color: "#FFF",
    padding: 15,
    margin: 10,
    borderRadius: 10
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 10
  }
});


/*const handleClick = async () => {
  try {
    const resultado = await ObtenerUsuarios();
    //setUsuarios(resultado);
    console.log(resultado);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
  }
};*/

/*return (
  <>
  <View style={styles.container}>
    <StatusBar style="auto" />
    <Text>Hola mundo</Text>
    <TextInput style={styles.textInput} placeholder='prueba' />
    <TouchableOpacity>
      <Text style={styles.btnAlerta} onPress={handleClick}>Alerta</Text>
    </TouchableOpacity>

  </View>

 
</>
 );*/