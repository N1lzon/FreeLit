// BookDetailModal.tsx
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Alert, Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Book } from '../types';

interface BookDetailModalProps {
  visible: boolean;
  onClose: () => void;
  book: Book | null;
}

const BookDetailModal: React.FC<BookDetailModalProps> = ({ visible, onClose, book }) => {
  if (!book) return null;

  const handleDownload = async () => {
    try {
      // Definimos la ruta de descarga
      const downloadsDir = FileSystem.documentDirectory + "descargas/freelit/";
      const dirInfo = await FileSystem.getInfoAsync(downloadsDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(downloadsDir, { intermediates: true });
      }

      // Extraemos el nombre del archivo del file_url
      const fileUrl = book.file_url;
      const segments = fileUrl.split('/');
      const fileName = segments[segments.length - 1];
      const filePath = downloadsDir + fileName;

      // Descargamos el archivo
      await FileSystem.downloadAsync(fileUrl, filePath);
      Alert.alert("Descarga completada", "Se ha descargado el libro!");
    } catch (error) {
      console.error("Error downloading file: ", error);
      Alert.alert("Error", "No se pudo descargar el archivo");
    }
  };

  // Sólo se llama a onClose() para cerrar el modal.
  const handleClose = () => {
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <StatusBar style="light" />
      <View className="flex-1 bg-white">
        {/* Botón de cierre en la esquina superior derecha */}
        <TouchableOpacity onPress={handleClose} className="absolute top-10 right-5 z-10">
          <Ionicons name="close-circle" size={32} color="#333" />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
          {/* Imagen de la portada: ocupa 80% del ancho, centrada, mantiene aspect ratio */}
          <Image
            source={{ uri: book.cover_url }}
            style={{ width: '80%', alignSelf: 'center', height: undefined, aspectRatio: 0.6 }}
            resizeMode="contain"
            className="rounded-2xl mb-5"
          />

          {/* Título del libro */}
          <Text className="text-2xl font-bold text-center text-gray-800 mb-2">
            {book.title}
          </Text>

          {/* Autor */}
          <Text className="text-lg text-gray-600 text-center mb-3">
            por {book.author}
          </Text>
          
          {/* Descripción */}
          <Text className="text-base text-gray-700 text-justify mt-5">
            {book.description}
          </Text>

          {/* Botones de acción */}
          <View className="flex-row justify-around mt-5">
            <TouchableOpacity onPress={handleDownload} className="bg-primary py-3 px-4 rounded-lg flex-1 mx-2">
              <Text className="text-white text-center font-bold">Descargar</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-primary py-3 px-4 rounded-lg flex-1 mx-2">
              <Text className="text-white text-center font-bold">
                Añadir a biblioteca
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default BookDetailModal;
