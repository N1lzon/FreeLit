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
import { getBooks } from '../libros';
import { Book } from '../types';
import SearchModal from './SearchModal';

const categories = ['Filosofía', 'Clásicos', 'Horror'];
const screenWidth = Dimensions.get('window').width;
const cardWidth = screenWidth / 2 - 30;

const HomeScreen: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Filosofía');
  const [searchModalVisible, setSearchModalVisible] = useState<boolean>(false);

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

  // Se filtran los libros por la categoría seleccionada, se ordenan por "created_at"
  // de más reciente a más antiguo y se limitan a 10 elementos.
  const finalBooks = books
    .filter((book) => book.category === selectedCategory)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 10);

  // Encabezado de la pantalla principal, que incluye el banner, la barra de búsqueda (que abre el modal)
  // y las pestañas de categoría.
  const renderHeader = () => (
    <View>
      {/* Encabezado con fondo */}
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

      {/* Pestañas de categorías */}
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
          <View style={{ marginBottom: 20, width: cardWidth }}>
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
          </View>
        )}
      />
      <SearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        books={books}
      />
    </>
  );
};

export default HomeScreen;
