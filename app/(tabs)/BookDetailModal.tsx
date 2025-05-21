// BookDetailModal.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Book } from '../../lib/types';
// Importamos el SDK de Appwrite para construir la URL de descarga
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { config, storage } from '../../lib/appwrite';

interface BookDetailModalProps {
  visible: boolean;
  onClose: () => void;
  // onRefresh es opcional; se intentará llamarla si se pasa
  onRefresh?: () => void;
  book: Book | null;
}

const BookDetailModal: React.FC<BookDetailModalProps> = ({ visible, onClose, onRefresh, book }) => {
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);
  const [localFilePath, setLocalFilePath] = useState<string>('');
  const insets = useSafeAreaInsets(); // Para gestionar áreas seguras

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

      const checkIfDownloaded = async () => {
        if (!book || !book.title) return;
        
        // Crear un nombre de archivo limpio basado en el título
        const sanitizedTitle = book.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const fileName = `${sanitizedTitle}.epub`;
        
        // Verificar si el archivo existe en el directorio de documentos
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        
        try {
          const fileInfo = await FileSystem.getInfoAsync(fileUri);
          setIsDownloaded(fileInfo.exists);
          if (fileInfo.exists) {
            setLocalFilePath(fileUri);
            console.log("Archivo encontrado localmente:", fileUri);
          }
        } catch (error) {
          console.error("Error checking if file exists:", error);
          setIsDownloaded(false);
        }
      };
      
      fetchSavedStatus();
      checkIfDownloaded();
    }
  }, [visible, book]);

  const openEpubFile = async (fileUri: string) => {
    try {
      if (Platform.OS === 'ios') {
        // En iOS, usamos Sharing para abrir el archivo
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert('Error', 'Compartir no está disponible en este dispositivo');
        }
      } else {
        // En Android, usamos IntentLauncher para abrir el archivo
        const cUri = await FileSystem.getContentUriAsync(fileUri);
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: cUri,
          flags: 1,
          type: 'application/epub+zip'
        });
      }
    } catch (error) {
      console.error('Error al abrir el archivo:', error);
      Alert.alert(
        'Error', 
        'No se pudo abrir el archivo. Asegúrate de tener instalada una aplicación compatible con archivos EPUB.'
      );
    }
  };

  const handleDeleteFile = async () => {
    if (!isDownloaded || !localFilePath || !book) return;

    Alert.alert(
      "Eliminar archivo",
      `¿Estás seguro de que deseas eliminar "${book.title}" del dispositivo?`,
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              // Eliminar el archivo del sistema de archivos
              await FileSystem.deleteAsync(localFilePath);
              
              // Actualizar el estado
              setIsDownloaded(false);
              setLocalFilePath('');
              
              Alert.alert(
                "Archivo eliminado",
                `"${book.title}" ha sido eliminado del dispositivo correctamente.`
              );
            } catch (error) {
              console.error("Error al eliminar archivo:", error);
              Alert.alert(
                "Error",
                "No se pudo eliminar el archivo. Por favor, intenta de nuevo."
              );
            }
          }
        }
      ]
    );
  };

  const handleDownload = async () => {
    if (!book || !book.file_id) {
      Alert.alert("Error", "El archivo del libro no está disponible.");
      return;
    }

    try {
      setDownloading(true);
      
      // Aquí asumimos que tienes configurado el storage de Appwrite en tu lib/appwrite.ts
      // Y que el file_id es el ID del archivo en Appwrite
      
      // Obtener la URL de descarga como string
      const fileUrl = storage.getFileView(config.bucketId, book.file_id).toString();
      
      // Determinar la extensión del archivo basada en el nombre o tipo
      let extension = '.epub';
      if (book.title) {
        // Crear un nombre de archivo limpio basado en el título
        const sanitizedTitle = book.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const fileName = `${sanitizedTitle}${extension}`;
        
        // Definir la ruta completa donde se guardará el archivo en el dispositivo
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        
        console.log("Downloading file from:", fileUrl);
        console.log("Saving to:", fileUri);
        
        // Descargar el archivo
        const downloadResult = await FileSystem.downloadAsync(fileUrl, fileUri);
        
        if (downloadResult.status !== 200) {
          throw new Error(`La descarga falló con código: ${downloadResult.status}`);
        }
        
        // Solicitar permisos para acceder a la Media Library
        const { status } = await MediaLibrary.requestPermissionsAsync();
        
        if (status !== 'granted') {
          Alert.alert(
            "Permiso denegado", 
            "Necesitamos permiso para guardar el archivo en tu dispositivo."
          );
          return;
        }
        
        // Guardar el archivo en la Media Library
        const asset = await MediaLibrary.createAssetAsync(fileUri);
        
        // Intentar guardar en un álbum específico si es posible
        try {
          let album = await MediaLibrary.getAlbumAsync('FreeLit');
          
          if (album === null) {
            album = await MediaLibrary.createAlbumAsync('FreeLit', asset, false);
          } else {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
          }
          
          Alert.alert(
            "¡Descarga completa!", 
            `"${book.title}" se ha guardado en tu carpeta FreeLit.`,
            [
              { 
                text: 'Abrir ahora', 
                onPress: () => openEpubFile(fileUri) 
              },
              { 
                text: 'Más tarde', 
                style: 'cancel' 
              }
            ]
          );
          
          // Actualizar el estado para mostrar el botón "Abrir"
          setIsDownloaded(true);
          setLocalFilePath(fileUri);
        } catch (albumError) {
          // Si falla la creación del álbum, al menos el archivo ya está en la Media Library
          console.error("Error creating/accessing album:", albumError);
          Alert.alert(
            "¡Descarga completa!", 
            `"${book.title}" se ha guardado en tu galería.`
          );
          // Actualizar el estado para mostrar el botón "Abrir"
          setIsDownloaded(true);
          setLocalFilePath(fileUri);
        }
      } else {
        throw new Error("No se pudo determinar el nombre del archivo");
      }
    } catch (error) {
      console.error("Error al descargar el archivo:", error);
      Alert.alert(
        "Error de descarga", 
        "No se pudo descargar el archivo. Por favor, intenta de nuevo más tarde."
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadOrOpen = async () => {
    if (isDownloaded && localFilePath) {
      // Si el archivo ya está descargado, lo abrimos
      await openEpubFile(localFilePath);
    } else {
      // Si no está descargado, lo descargamos
      await handleDownload();
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
      onRequestClose={handleClose}
      // Esta propiedad es crucial para que el modal sea realmente de pantalla completa
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
    >
      <StatusBar style="light" />
      <SafeAreaView className="flex-1 bg-white">
        {/* Botón de cerrar en la esquina superior derecha */}
        <TouchableOpacity 
          onPress={handleClose} 
          className="absolute z-10"
          style={{ 
            top: insets.top + 10,
            right: 16
          }}
        >
          <Ionicons name="close-circle" size={32} color="#333" />
        </TouchableOpacity>

        <ScrollView 
          contentContainerStyle={{ 
            padding: 20, 
            paddingTop: insets.top + 50,
            paddingBottom: Math.max(insets.bottom, 24)
          }}
        >
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
          <View className="mt-5">
            {/* Primera fila de botones: Descargar/Abrir y Biblioteca */}
            <View className="flex-row justify-around">
              <TouchableOpacity 
                onPress={handleDownloadOrOpen} 
                className={`bg-primary py-3 px-4 rounded-lg flex-1 mx-2 ${downloading ? 'opacity-50' : ''}`}
                disabled={downloading}
              >
                <Text className="text-white text-center font-bold">
                  {downloading ? 'Descargando...' : isDownloaded ? 'Abrir' : 'Descargar'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLibraryToggle} className="bg-primary py-3 px-4 rounded-lg flex-1 mx-2">
                <Text className="text-white text-center font-bold">
                  {isSaved ? 'Quitar de la biblioteca' : 'Añadir a biblioteca'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Segunda fila: Botón de eliminar archivo - Solo visible si está descargado */}
            {isDownloaded && (
              <TouchableOpacity 
                onPress={handleDeleteFile} 
                className="bg-secondary py-3 px-4 rounded-lg mt-3 mx-2"
              >
                <Text className="text-white text-center font-bold">
                  Eliminar del dispositivo
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Descripción */}
          <Text className="text-base text-gray-700 text-justify mt-5">
            {book.description}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default BookDetailModal;