// SearchModal.tsx
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Book } from '../../lib/types';

const normalizeString = (str: string) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  books: Book[];
  onBookPress: (book: Book) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  onClose,
  books,
  onBookPress
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const insets = useSafeAreaInsets();

  // Función para manejar la limpieza y cierre
  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  // Filtrado de libros para la búsqueda
  const filteredBooks =
    searchQuery.trim() === ''
      ? []
      : books.filter(
          (book) =>
            normalizeString(book.title).includes(normalizeString(searchQuery)) ||
            normalizeString(book.author).includes(normalizeString(searchQuery))
        );
  
  // Manejador del botón "atrás" nativo
  useEffect(() => {
    if (visible) {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          handleClose();
          return true; // Previene la acción por defecto
        }
      );

      return () => backHandler.remove();
    }
  }, [visible]);

  return (
    <Modal 
      visible={visible} 
      animationType="slide"
      onRequestClose={handleClose}
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
    >
      <StatusBar style="light" />
      <SafeAreaView className="flex-1 bg-white">
        {/* Barra de búsqueda con autofocus para abrir el teclado automáticamente */}
        <View 
          className="flex-row items-center"
          style={{
            paddingTop: insets.top > 0 ? insets.top : 16,
            paddingHorizontal: 20,
            paddingBottom: 12
          }}
        >
          <TextInput
            autoFocus
            placeholder="Buscar libros..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 bg-gray-100 p-3 rounded-lg text-base"
          />
          <TouchableOpacity
            onPress={handleClose}
            className="ml-3"
          >
            <Text className="text-primary font-bold">Cancelar</Text>
          </TouchableOpacity>
        </View>
        
        {/* Resultados de búsqueda: se muestran en forma de lista con la portada a la izquierda */}
        <FlatList
          data={filteredBooks}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={{ 
            paddingHorizontal: 20, 
            paddingBottom: Math.max(insets.bottom + 20, 40) 
          }}
          ListEmptyComponent={
            <View className="items-center mt-10">
              <Text className="text-gray-500">
                {searchQuery.trim() !== '' 
                  ? "No se encontraron resultados" 
                  : "Escribe para buscar libros"}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                onBookPress(item);
                handleClose();
              }}
              className="flex-row items-center mb-4 p-2 border-b border-gray-200"
            >
              <Image
                source={{ uri: item.cover_url }}
                className="w-16 h-16 rounded-md"
              />
              <View className="ml-4 flex-1">
                <Text className="font-bold text-base">{item.title}</Text>
                <Text className="text-gray-600 text-sm">{item.author}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
};

export default SearchModal;