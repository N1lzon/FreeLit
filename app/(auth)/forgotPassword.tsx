// app/(auth)/forgotPassword.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { account } from "../../lib/appwrite";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onRecoverPassword = async () => {
    if (!email) {
      Alert.alert("Campos incompletos", "Por favor, introduce tu correo.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert(
        "Formato de correo inválido",
        "Por favor, introduce un correo válido."
      );
      return;
    }

    setLoading(true);
    try {
      // NOTA: Usa un redirect URL permitido. Aquí usamos localhost para pruebas.
      const redirectUrl = "http://localhost/reset-password";
      await account.createRecovery(email, redirectUrl);
      Alert.alert(
        "Enlace enviado",
        "Revisa tu correo para continuar con la recuperación."
      );
      router.replace("/login");
    } catch (error: any) {
      console.error("Error en la recuperación:", error);
      Alert.alert(
        "Error en la recuperación",
        error.message || "No se pudo enviar el enlace de recuperación."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      extraScrollHeight={20}
      enableOnAndroid
      keyboardOpeningTime={0}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 24,
        backgroundColor: "white",
      }}
    >
      <View className="items-center">
        {/* Header: logo y nombre de la app */}
        <View className="flex-row mb-7">
          <Image
            source={require("../../assets/images/icon.png")}
            className="w-40 h-20"
            resizeMode="contain"
          />
          <Text className="font-bold text-6xl mt-3">FreeLit</Text>
        </View>

        {/* Ilustración */}
        <Image
          source={require("../../assets/forgot.png")}
          className="w-80 h-80 mb-8"
          resizeMode="contain"
        />

        {/* Título */}
        <Text className="text-3xl font-bold text-center text-gray-800 mb-10">
          Recuperar Contraseña
        </Text>

        {/* Campo para el email */}
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="E-mail"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          keyboardType="email-address"
          className="bg-gray-100 rounded-lg p-4 w-full mb-4 text-base text-gray-700"
        />

        {/* Botón para enviar el enlace */}
        <TouchableOpacity
          onPress={onRecoverPassword}
          disabled={loading}
          className={`bg-primary rounded-lg p-4 w-full items-center justify-center ${
            loading ? "opacity-70" : ""
          }`}
        >
          {loading ? (
            <Text className="text-white text-lg font-semibold">Enviando...</Text>
          ) : (
            <Text className="text-white text-2xl font-bold">Enviar Enlace</Text>
          )}
        </TouchableOpacity>

        {/* Enlace para volver al login */}
        <TouchableOpacity onPress={() => router.push("/login")} className="mt-8">
          <Text className="text-center text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <Text className="text-primary font-semibold">Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}
