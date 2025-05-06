// BookDetailModal.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Book } from '../../lib/types';

interface BookDetailModalProps {
  visible: boolean;
  onClose: () => void;
  // onRefresh es opcional; se intentará llamarla si se pasa
  onRefresh?: () => void;
  book: Book | null;
}

const BookDetailModal: React.FC<BookDetailModalProps> = ({ visible, onClose, onRefresh, book }) => {
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    if (visible && book) {
      const fetchSavedStatus = async () => {
        try {
          const key = `biblioteca_${book.$id}`;
          const savedValue = await AsyncStorage.getItem(key);
          setIsSaved(savedValue === 'true');
        } catch (error) {
          console.error("Error retrieving favorite status:", error);
        }
      };
      fetchSavedStatus();
    }
  }, [visible, book]);

  const handleDownload = async () => {
    if (!book) return;
    try {
      // Asegurarse de que la URL del archivo es válida
      const fileUrl = book.file_url;
      if (!fileUrl) {
        Alert.alert("Error", "La URL del archivo es inválida.");
        return;
      }
      
      // Extraer el nombre del archivo
      const segments = fileUrl.split('/');
      const fileName = segments[segments.length - 1];
      
      // Descargar el archivo a una ubicación temporal en el sandbox
      const tempFileUri = FileSystem.documentDirectory + fileName;
      const downloadResult = await FileSystem.downloadAsync(fileUrl, tempFileUri);
      if (downloadResult.status !== 200) {
        Alert.alert("Error", `La descarga falló con código: ${downloadResult.status}`);
        return;
      }
      
      // Solicitar permisos para acceder a la Media Library
      const mediaPermission = await MediaLibrary.requestPermissionsAsync();
      if (!mediaPermission.granted) {
        Alert.alert("Permiso denegado", "No se tiene permiso para guardar archivos en la librería.");
        return;
      }
      
      // Crear un asset a partir del archivo descargado
      const asset = await MediaLibrary.createAssetAsync(tempFileUri);
      
      // Crear (o agregar a) un álbum público llamado "freelit"
      let album = await MediaLibrary.getAlbumAsync('freelit');
      if (!album) {
        album = await MediaLibrary.createAlbumAsync('freelit', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }
      
      Alert.alert("Descarga completada", `El archivo se ha guardado en el álbum "freelit".`);
    } catch (error) {
      console.error("Error downloading file:", error);
      Alert.alert("Error", "No se pudo descargar el archivo");
    }
  };

  const handleLibraryToggle = async () => {
    if (!book) return;
    const storageKey = `biblioteca_${book.$id}`;
    try {
      if (!isSaved) {
        await AsyncStorage.setItem(storageKey, 'true');
        setIsSaved(true);
        Alert.alert("¡Libro agregado!", "El libro se ha añadido a tu biblioteca.");
      } else {
        await AsyncStorage.removeItem(storageKey);
        setIsSaved(false);
        Alert.alert("Libro removido", "El libro ha sido removido de tu biblioteca.");
      }
    } catch (error) {
      console.error("Error updating library", error);
      Alert.alert("Error", "No se pudo actualizar el estado de la biblioteca.");
    }
  };

  // Al cerrar el modal se llama a onClose(), y luego se invoca onRefresh (si está definida).
  const handleClose = () => {
    onClose();
    onRefresh?.();
  };

  if (!book) return null;

  return (
    <Modal 
      visible={visible}
      animationType="slide"
      // Esta propiedad se invoca al presionar el botón de "atrás" físico/digital
      onRequestClose={handleClose}
    >
      <StatusBar style="light" />
      <View className="flex-1 bg-white">
        {/* Botón de cerrar en la esquina superior derecha */}
        <TouchableOpacity onPress={handleClose} className="absolute top-10 right-5 z-10">
          <Ionicons name="close-circle" size={32} color="#333" />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
          {/* Portada: ocupa el 80% del ancho, centrada y mantiene aspect ratio */}
          <Image
            source={{ uri: book.cover_url }}
            style={{ width: '80%', alignSelf: 'center', height: undefined, aspectRatio: 0.6 }}
            resizeMode="contain"
            className="rounded-2xl mb-5"
          />

          {/* Título */}
          <Text className="text-2xl font-bold text-center text-gray-800 mb-2">
            {book.title}
          </Text>

          {/* Autor */}
          <Text className="text-lg text-gray-600 text-center mb-3">
            por {book.author}
          </Text>

          {/* Botones de acción */}
          <View className="flex-row justify-around mt-5">
            <TouchableOpacity onPress={handleDownload} className="bg-primary py-3 px-4 rounded-lg flex-1 mx-2">
              <Text className="text-white text-center font-bold">Descargar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLibraryToggle} className="bg-primary py-3 px-4 rounded-lg flex-1 mx-2">
              <Text className="text-white text-center font-bold">
                {isSaved ? 'Quitar de la biblioteca' : 'Añadir a biblioteca'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Descripción */}
          <Text className="text-base text-gray-700 text-justify mt-5">
            {book.description}
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default BookDetailModal;
