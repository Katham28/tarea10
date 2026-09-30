/*
	Ejemplo de app en React Native que permite tomar una foto con la cámara
	para establecerla como foto de perfil en monsterballgo

	Referencias:
	https://docs.expo.dev/versions/latest/sdk/imagepicker/
*/
import { File } from "expo-file-system";
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
	Alert,
	Image,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View
} from "react-native";

const SET_PROFILE_PICTURE_URL = 'http://monsterballgo.com/api/setpfp';

//Ejemplo de un componente reusable que recibe props, normalmente van en otro archivo y son importados
type MyButtonProps = {
  title: string;
  onPress: () => void;
};
export function MyButton({ title, onPress }: MyButtonProps) {
	  return (
		<Pressable onPress={onPress} style={styles.boton}>
		  <Text style={styles.botonTexto}>{title}</Text>
		</Pressable>
	  );
}

//Componente principal de la app
export default function Index() {
	//contiene el valor del input de id de usuario
	const [userValue, setUserValue] = useState('');
	//guarda la foto capturada para mostrarla y subirla
	const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);

	//callback del botón de tomar foto
	const onTomarFoto = async() =>
	{
		console.log('tomar foto');
		//hay que pedir permiso para usar la cámara
		const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
		if (!permissionResult.granted) {
			alert(" Dame permiso de camara plis");
			return;
		}
		
		let result = await ImagePicker.launchCameraAsync({
			mediaTypes: 'images', // ImagePicker.MediaType
			allowsEditing: true,
			aspect: [1, 1], //imagen cuadrada apropiada para foto de perfil
			quality: 1,
		});
		if (!result.canceled) {
			setPhoto(result.assets[0]);
		}
	}

	//callback del boton de subir foto
	const onSubirFoto = async() =>
	{
		console.log("subiendo foto");
		const id = userValue.trim();
		if (!id || !Number.isInteger(Number(id))) {
			Alert.alert('ID inválido', 'Escribe un ID de usuario valido');
			return;
		}
		if (!photo) {
			Alert.alert('Falta la foto', 'Toma una foto antes de intentar subirla.');
			return;
		}


		//construimos un formdata con la imagen y los parametros solicitados por el endpoint
		const formData = new FormData();
		formData.append('token', 'code37');
		formData.append('id', id);
		console.log(Platform.OS);
		formData.append('image',  new File(photo.uri)  );

		//intentar un poderosísimo fetch con la imagen en el body
		try {
			const response = await fetch(SET_PROFILE_PICTURE_URL, {
				method: 'POST',
				body: formData,
				headers: {
					'Content-Type': 'multipart/form-data',
			  	},
			});
			console.log('Respuesta del servidor:', response);
			const data: { error?: string; pfp_url?: string } = await response.json();

			if (!response.ok || data.error) {
				Alert.alert('No se pudo subir la foto', data.error ?? `Error HTTP ${response.status}`);
				return;
			}
			//cambiar la source uri de la imagen por la entregada por el servidor
			if (data.pfp_url) {
				setPhoto({ ...photo, uri: data.pfp_url });
			}
			Alert.alert('Foto actualizada', 'La foto de perfil se subió correctamente.');
		} catch (error) {
			console.error('Error al subir la foto:', error);
			Alert.alert('Error de conexión', 'No se pudo conectar con el servidor.');
		}
	}

	//callback para elegir foto de las guardadas en el dispositivo
	const onElegirImagen = async() =>
	{
		Alert.alert('Función no implementada', 'hay que implementar esta funcionalidad xdxd.');
	}

	//Esto se llama JSX/TSX y es un monstruoso híbrido de HTML y typescript para renderear la UI de la app
	return (

		<LinearGradient
  colors={["#ff0055", "#ff8fab", "#fff0f5"]}
  start={{ x: 0, y: 0 }}
  end={{ x: 0, y: 1 }}
  style={styles.container}
>


	<View style={styles.container}>

		<Text style={styles.title}>Tarea 10</Text>

<Image source={photo ? { uri: photo.uri } : { uri: 'http://monsterballgo.com/media/usr/default.png' }} style={styles.imagePreview}></Image>

	<View style={styles.buttonRow}>
		<Text style={styles.subtitle}>ID:</Text>
		<TextInput style={styles.input} onChangeText={setUserValue}></TextInput>
		
	</View>
		
		<View style={styles.buttonRow}>
		<MyButton title="Elegir Imagen" onPress={onElegirImagen} />
		<MyButton title="Tomar Foto" onPress={onTomarFoto} />
		<MyButton title="Subir Foto" onPress={onSubirFoto} />
		</View>
	
	</View>
	


	</LinearGradient>

	);
}

const styles = StyleSheet.create({
   container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",

    paddingTop: 80,
  },
  title:{
			fontFamily:'Nunito',
			 color: "#ffffff",
			fontSize:44
		},
	subtitle:{
		marginTop:10,
		fontFamily:'Nunito',
		color: "#ff0055",
		fontSize:18
	},
	input:{
		marginTop:10,
		borderWidth:1,
		borderColor:'gray',
		borderRadius:5,
		padding:10,
		fontFamily:'Nunito',
		fontSize:18,
		width:300,
		color: "#ff0055",
		backgroundColor: "#f7f7f7"
	},
	imagePreview:
	{
		width:150,
		height:150,
		marginTop:20
	},
	boton:{
		margin:5,  
		padding:10, 
		borderRadius:5,
		backgroundColor:'#ff0055',

	},
	botonTexto: {
		color: "#f7f7f7f7",
		fontWeight: "bold",
		fontSize: 16,
			fontFamily:'Nunito',
		textAlign: "center",
	},

	  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
	margin:25
  },
});
