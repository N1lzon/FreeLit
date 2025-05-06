// SearchModal.tsx
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Book } from '../types';

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

  const filteredBooks =
    searchQuery.trim() === ''
      ? []
      : books.filter(
          (book) =>
            normalizeString(book.title).includes(normalizeString(searchQuery)) ||
            normalizeString(book.author).includes(normalizeString(searchQuery))
        );

  return (
    <Modal visible={visible} animationType="slide">
      <StatusBar style="light" />
      <View className="flex-1 bg-white">
        {/* Barra de búsqueda con autofocus para abrir el teclado automáticamente */}
        <View className="p-5 flex-row items-center">
          <TextInput
            autoFocus
            placeholder="Buscar libros..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 bg-gray-100 p-3 rounded-lg text-base"
          />
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              onClose();
            }}
            className="ml-3"
          >
            <Text className="text-primary font-bold">Cancelar</Text>
          </TouchableOpacity>
        </View>

        {/* Resultados de búsqueda: se muestran en forma de lista con la portada a la izquierda */}
        <FlatList
          data={filteredBooks}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          ListEmptyComponent={
            <View className="items-center mt-10">
              <Text className="text-gray-500">Escribe para buscar libros</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                onBookPress(item);
                onClose();
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
      </View>
    </Modal>
  );
};

export default SearchModal;
