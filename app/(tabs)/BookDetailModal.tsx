// BookDetailModal.tsx
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Book } from '../types';

interface BookDetailModalProps {
  visible: boolean;
  onClose: () => void;
  book: Book | null;
}

const BookDetailModal: React.FC<BookDetailModalProps> = ({ visible, onClose, book }) => {
  if (!book) return null;

  return (
    <Modal visible={visible} animationType="slide">
      <StatusBar style="light" />
      <View className="flex-1 bg-white">
        {/* Botón de cierre en la esquina superior derecha */}
        <TouchableOpacity
          onPress={onClose}
          className="absolute top-10 right-5 z-10"
        >
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

          {/* Título con estilos */}
          <Text className="text-2xl font-bold text-center text-gray-800 mb-2">
            {book.title}
          </Text>
          {/* Autor con estilos */}
          <Text className="text-lg text-gray-600 text-center mb-3">
            por {book.author}
          </Text>

          {/* Botones de acción */}
          <View className="flex-row justify-around">
            <TouchableOpacity className="bg-primary py-3 px-4 rounded-lg flex-1 mx-2">
              <Text className="text-white text-center font-bold">Descargar</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-primary py-3 px-4 rounded-lg flex-1 mx-2">
              <Text className="text-white text-center font-bold">
                Añadir a biblioteca
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
