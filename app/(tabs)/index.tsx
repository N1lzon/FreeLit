// HomeScreen.tsx
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { getBooks } from '../../lib/libros';
import { Book } from '../../lib/types';
import BookDetailModal from './BookDetailModal';
import SearchModal from './SearchModal';

const categories = ['Filosofía', 'Clásicos', 'Horror'];
const screenWidth = Dimensions.get('window').width;
const cardWidth = screenWidth / 2 - 30;

const HomeScreen: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Filosofía');
  const [searchModalVisible, setSearchModalVisible] = useState<boolean>(false);

  // Estados para el modal de detalles
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const libros = await getBooks();
        setBooks(libros);
      } catch (error) {
        console.error('Error al obtener libros:', error);
      }
    };

    fetchBooks();
  }, []);

  // Se filtran los libros para la pantalla principal según la categoría, se ordenan y se limitan.
  const finalBooks = books
    .filter((book) => book.category === selectedCategory)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 10);

  // Función para manejar el toque en un libro, ya sea desde la pantalla principal o el modal de búsqueda.
  const handleBookPress = (book: Book) => {
    setSelectedBook(book);
    setDetailModalVisible(true);
  };

  // Encabezado de la pantalla principal (banner, botón de búsqueda y pestañas de categoría)
  const renderHeader = () => (
    <View>
      <View className="bg-secondary p-5 rounded-b-[30px]">
        <TouchableOpacity
          onPress={() => setSearchModalVisible(true)}
          className="bg-white p-3 rounded-lg text-base mt-10"
        >
          <Text className="text-gray-400">Buscar...</Text>
        </TouchableOpacity>
        <View className="mt-5">
          <Image
            source={require('../../assets/banner.jpg')}
            className="w-full h-40 rounded-2xl"
          />
          <Text className="absolute top-10 left-60 text-3xl text-white font-bold">
            Últimos libros
          </Text>
          <Text className="absolute top-20 left-60 text-3xl text-white font-bold">
            agregados
          </Text>
        </View>
      </View>
      <View className="flex-row justify-around mt-5">
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            className={`${selectedCategory === cat ? 'bg-primary' : 'bg-gray-200'} py-1 px-3 rounded-lg`}
          >
            <Text className={`${selectedCategory === cat ? 'text-white' : 'text-gray-800'}`}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <>
      <StatusBar style="light" />
      <FlatList
        data={finalBooks}
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
              <View className="absolute top-2 right-2 bg-accentOne rounded-md px-2 py-1">
                <Text className="text-xs text-white">Nuevo</Text>
              </View>
            </View>
            <Text className="font-bold mt-2 text-center">{item.title}</Text>
            <Text className="text-gray-600 text-center">{item.author}</Text>
          </TouchableOpacity>
        )}
      />
      <SearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        books={books}
        onBookPress={(book) => handleBookPress(book)}
      />
      <BookDetailModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        book={selectedBook}
      />
    </>
  );
};

export default HomeScreen;
