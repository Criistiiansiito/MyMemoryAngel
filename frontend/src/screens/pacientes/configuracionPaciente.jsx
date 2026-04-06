import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, TextInput, Image, ActivityIndicator, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// Importaciones de tus archivos
import { getStyles } from '../../style/styles';
import { useAccesibilidad } from '../../services/accesibilidadContext'; 
import { configuracionPerfil } from '../../services/configuracionPerfil';

export default function ConfiguracionPaciente({ navigation }) {
    // Contexto de Accesibilidad
    const { aplicarEscala, textSizeLabel, setTextSizeLabel } = useAccesibilidad();
    const styles = getStyles(aplicarEscala);
    
    // Estados
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDaltonic, setIsDaltonic] = useState(false);

    useEffect(() => { 
        cargarDatos(); 
    }, []);

    const cargarDatos = async () => {
        try {
            const data = await configuracionPerfil.obtenerPerfil();
            if (data.ok) {
                setNombre(data.usuario.nombre);
                setEmail(data.usuario.correo);
                if (data.usuario.foto_perfil) setProfilePhoto(data.usuario.foto_perfil);
            }
        } catch (error) {
            console.error("Error al cargar perfil:", error);
            alert("No se pudo cargar la información del perfil.");
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        let resultPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!resultPermission.granted) {
            alert("Se necesitan permisos para acceder a la galería");
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7, // Reducimos un poco la calidad para que la subida sea más rápida
        });
        if (!result.canceled) setProfilePhoto(result.assets[0].uri);
    };

    const manejarGuardar = async () => {
        if (!nombre.trim()) {
            alert("El nombre no puede estar vacío");
            return;
        }

        try {
            setLoading(true);
            const res = await configuracionPerfil.actualizarPerfil(nombre, profilePhoto);
            
            if (res.ok) {
                Platform.OS === 'web' ? alert("Perfil actualizado") : Alert.alert("Éxito", "Perfil actualizado correctamente");
            } else {
                alert(res.msg || "Hubo un error al actualizar");
            }
        } catch (error) {
            console.error("Error al guardar:", error);
            alert("Error de conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#4D6BFE" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.topBar}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} size={24} />
                    </TouchableOpacity>
                    <Text style={styles.brandName}>Configuración de mi perfil</Text>
                </View>
            </View>
            
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* Sección Foto */}
                <View style={styles.profileSection}>
                    <TouchableOpacity style={styles.profilePhotoContainer} onPress={pickImage}>
                        <View style={styles.photoCircle}>
                            {profilePhoto ? (
                                <Image source={{ uri: profilePhoto }} style={{ width: 130, height: 130, borderRadius: 65 }} />
                            ) : (
                                <MaterialCommunityIcons name="account" size={80} color="#334155" />
                            )}
                        </View>
                        <View style={styles.editPhotoButton}>
                            <MaterialCommunityIcons name="camera" size={20} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>

                    {/* Inputs */}
                    <Text style={styles.label}>Nombre completo</Text>
                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="account" size={20} color="#A0AEC0" style={styles.inputIcon} />
                        <TextInput 
                            style={styles.input} 
                            value={nombre} 
                            onChangeText={setNombre}
                            placeholder="Tu nombre"
                        />
                    </View>

                    <Text style={styles.label}>Correo electrónico</Text>
                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="email-outline" size={20} color="#A0AEC0" style={styles.inputIcon} />
                        <TextInput 
                            style={[styles.input, { color: "#94A3B8" }]} 
                            value={email} 
                            editable={false} 
                        />
                    </View>

                    <TouchableOpacity style={[styles.mainButton, { marginTop: 25 }]} onPress={manejarGuardar}>
                        <Text style={styles.mainButtonText}>Guardar Cambios</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>Ajustes de la App</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* Selector de Tamaño de Texto */}
                <View style={styles.settingsCard}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="format-size" size={22} color="#4D6BFE" />
                        <Text style={styles.sectionTitle}>Tamaño del texto</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        {['Pequeño', 'Mediano', 'Grande'].map((size) => (
                            <TouchableOpacity 
                                key={size}
                                style={[
                                    styles.optionButton, 
                                    { flex: 1, marginHorizontal: 4 },
                                    textSizeLabel === size && styles.optionButtonActive
                                ]}
                                onPress={() => setTextSizeLabel(size)} 
                            >
                                <Text style={[
                                    styles.optionText, 
                                    textSizeLabel === size && styles.optionTextActive
                                ]}>{size}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Accesibilidad */}
                <View style={styles.settingsCard}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="eye-outline" size={22} color={isDaltonic ? "#000" : "#8B5CF6"} />
                        <Text style={styles.sectionTitle}>Modo Daltónico</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: aplicarEscala(16) }}>Activar filtros de color</Text>
                        <Switch onValueChange={setIsDaltonic} value={isDaltonic} />
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}