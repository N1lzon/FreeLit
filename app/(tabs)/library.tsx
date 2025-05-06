// LibraryScreen.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { getBooks } from '../libros';
import { Book } from '../types';
import BookDetailModal from './BookDetailModal';

const screenWidth = Dimensions.get('window').width;
const cardWidth = screenWidth / 2 - 30;

const LibraryScreen: React.FC = () => {
  // Estados para almacenar todos los libros y los que se han guardado
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [libraryBooks, setLibraryBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState<string>('');
  // Estados para manejar el modal de detalles:
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);

  // Función que obtiene los libros y luego filtra únicamente aquellos guardados
  const fetchLibraryBooks = async () => {
    try {
      const booksData = await getBooks();
      setAllBooks(booksData);
      // Obtenemos todas las claves de AsyncStorage
      const keys = await AsyncStorage.getAllKeys();
      // Filtramos las claves correspondientes a la biblioteca (guardadas con el prefijo "biblioteca_")
      const libraryKeys = keys.filter((k) => k.startsWith('biblioteca_'));
      // Extraemos los IDs de los libros guardados
      const savedBookIds = libraryKeys.map((key) => key.replace('biblioteca_', ''));
      // Filtramos de todos los libros solo aquellos que están guardados
      const savedBooks = booksData.filter((book) => savedBookIds.includes(book.$id));
      setLibraryBooks(savedBooks);
    } catch (error) {
      console.error('Error fetching library books', error);
    }
  };

  // Se ejecuta la función cada vez que la pantalla gane el foco
  useFocusEffect(
    React.useCallback(() => {
      fetchLibraryBooks();
    }, [])
  );

  // Se filtran los libros guardados con base en el texto ingresado en la barra de búsqueda.
  const filteredBooks = libraryBooks.filter(
    (book) =>
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase())
  );

  // Manejador para tocar un libro y abrir el modal de detalles.
  const handleBookPress = (book: Book) => {
    setSelectedBook(book);
    setDetailModalVisible(true);
  };

  // Encabezado de la pantalla con imagen y banner
  const renderHeader = () => (
    <View className="bg-secondary p-5 rounded-b-[30px] flex flex-row items-center">
      {/* Imagen en la parte izquierda */}
      <Image
        source={require('../../assets/reading.png')}
        className="h-64 w-64 mr-4"
        resizeMode="contain"
      />
      {/* Banner con título y subtítulo */}
      <View className="mt-5 flex-1">
        <Text className="text-3xl text-white font-bold">Mi Biblioteca</Text>
        <Text className="text-white">Libros guardados</Text>
      </View>
    </View>
  );

  return (
    <>
      <StatusBar style="light" />
      <View className="flex-1 bg-white">
        <FlatList
          data={filteredBooks}
          keyExtractor={(item) => item.$id}
          numColumns={2}
          ListHeaderComponent={renderHeader}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            marginTop: 20
          }}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleBookPress(item)}
              style={{ marginBottom: 20, width: cardWidth }}
            >
              <View className="relative">
                <Image
                  source={{ uri: item.cover_url }}
                  className="w-full h-72 rounded-2xl"
                />
                {/* Opcional: Etiqueta para libros nuevos */}
                <View className="absolute top-2 right-2 bg-accentOne rounded-md px-2 py-1">
                  <Text className="text-xs text-white">Nuevo</Text>
                </View>
              </View>
              <Text className="font-bold mt-2 text-center">{item.title}</Text>
              <Text className="text-gray-600 text-center">{item.author}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
      {/* Modal de detalles: se muestra cuando se toca un libro */}
      <BookDetailModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        book={selectedBook}
      />
    </>
  );
};

export default LibraryScreen;
