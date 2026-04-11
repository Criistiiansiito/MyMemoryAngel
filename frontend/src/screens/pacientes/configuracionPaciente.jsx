import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, TextInput, Image, ActivityIndicator, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker'; 
import * as ImagePicker from 'expo-image-picker';

import { getStyles } from '../../style/styles';
import { useAccesibilidad } from '../../services/accesibilidadContext'; 
import { configuracionPerfil } from '../../services/configuracionPerfil';

export default function ConfiguracionPaciente({ navigation }) {
    const { aplicarEscala, textSizeLabel, setTextSizeLabel, isDaltonic, setIsDaltonic, cargarDesdeServidor } = useAccesibilidad();

    const styles = getStyles(aplicarEscala);
    
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [fechaSQL, setFechaSQL] = useState(''); 
    const [dateText, setDateText] = useState('dd/mm/aaaa'); 
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { 
        cargarDatos(); 
    }, []);

    const cargarDatos = async () => {
        try {
            const data = await configuracionPerfil.obtenerPerfil();
            if (data.ok && data.usuario) {
                setNombre(data.usuario.nombre || '');
                setEmail(data.usuario.correo || '');
                if (data.usuario.fecha_nacimiento) {
                    const fechaLimpia = data.usuario.fecha_nacimiento.split('T')[0];
                    setFechaSQL(fechaLimpia);
                    const [year, month, day] = fechaLimpia.split('-');
                    setDateText(`${day}/${month}/${year}`);
                }
                if (data.usuario.foto_perfil) setProfilePhoto(data.usuario.foto_perfil);
                cargarDesdeServidor(data.usuario);
            }
        } catch (error) {
            console.error("Error al cargar perfil:", error);
            Alert.alert("Error", "No se pudo conectar con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    // NUEVA FUNCIÓN PARA GUARDADO AUTOMÁTICO DE ACCESIBILIDAD 
    const autoGuardarAccesibilidad = async (nuevoTamano, nuevoDaltonismo) => {
        try {
            // Llamamos a la API inmediatamente
            await configuracionPerfil.actualizarAccesibilidad({
                tamano_texto: nuevoTamano,
                modo_daltonico: nuevoDaltonismo ? 1 : 0
            });
            console.log("Accesibilidad guardada automáticamente");
        } catch (error) {
            console.error("Error en el auto-guardado:", error);
        }
    };

    // MANEJADORES DE CAMBIO INSTANTÁNEO
    const manejarCambioTamano = (size) => {
        setTextSizeLabel(size); 
        autoGuardarAccesibilidad(size, isDaltonic); 
    };

    const manejarCambioDaltonismo = (val) => {
        setIsDaltonic(val); 
        autoGuardarAccesibilidad(textSizeLabel, val); 
    };

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDateText(selectedDate.toLocaleDateString());
            const isoDate = selectedDate.toISOString().split('T')[0];
            setFechaSQL(isoDate);
        }
    };

    const pickImage = async () => {
        let resultPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!resultPermission.granted) {
            Alert.alert("Permisos", "Se necesitan permisos para acceder a la galería");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaType.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.4,
            base64: true,
        });

        if (!result.canceled) {
            const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
            setProfilePhoto(base64Image);
        }
    };

    // GUARDADO MANUAL (SOLO LOS DATOS DE LA CUENTA) 
    const manejarGuardarPerfil = async () => {
        if (!nombre.trim()) {
            Alert.alert("Error", "El nombre es obligatorio");
            return;
        }

        try {
            setLoading(true);
            const resPerfil = await configuracionPerfil.actualizarPerfil(nombre, profilePhoto, fechaSQL);
            
            if (resPerfil.ok) {
                Alert.alert("Éxito", "Tus datos personales se han actualizado correctamente.");
            } else {
                Alert.alert("Error", "No se pudieron guardar los datos personales.");
            }
        } catch (error) {
            console.error("Error al guardar perfil:", error);
            Alert.alert("Error", "Hubo un problema al conectar con el servidor.");
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
            <View style={styles.topBar}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} size={24} />
                    </TouchableOpacity>
                    <Text style={styles.brandName}>Configuración de mi perfil</Text>
                </View>
            </View>
            
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                <View style={styles.profileSection}>
                    <TouchableOpacity style={styles.profilePhotoContainer} onPress={pickImage}>
                        <View style={styles.photoCircle}>
                          <Image source={{ uri: profilePhoto }} style={{ width: 130, height: 130, borderRadius: 65 }} />    
                        </View>
                        <View style={styles.editPhotoButton}>
                            <MaterialCommunityIcons name="camera" size={20} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>

                    <Text style={styles.label}>Nombre completo</Text>
                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="account-outline" style={styles.inputIcon} />
                        <TextInput 
                            style={styles.input} 
                            value={nombre} 
                            onChangeText={setNombre}
                            placeholder="Tu nombre"
                        />
                    </View>

                    <Text style={styles.label}>Correo electrónico</Text>
                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="email-outline" style={styles.inputIcon} />
                        <TextInput 
                            style={[styles.input, { color: "#94A3B8" }]} 
                            value={email} 
                            editable={false} 
                        />
                    </View>

                    <Text style={styles.label}>Fecha de nacimiento</Text>
                    <TouchableOpacity 
                        style={styles.inputContainer} 
                        onPress={() => setShowDatePicker(true)}
                    >
                        <MaterialCommunityIcons name="calendar-outline" style={styles.inputIcon} />
                        <Text style={styles.input}>
                            {dateText}
                        </Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker 
                            value={fechaSQL ? new Date(fechaSQL) : new Date()} 
                            mode="date" 
                            display="default" 
                            maximumDate={new Date()}
                            onChange={onDateChange} 
                        />
                    )}

                    <TouchableOpacity style={[styles.mainButton, { marginTop: 25 }]} onPress={manejarGuardarPerfil}>
                        <Text style={styles.mainButtonText}>Guardar Cambios de Perfil</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>Ajustes de la App</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* Ajuste de Tamaño de Texto */}
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
                                onPress={() => manejarCambioTamano(size)} 
                            >
                                <Text style={[
                                    styles.optionText, 
                                    textSizeLabel === size && styles.optionTextActive
                                ]}>{size}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Ajuste de Daltonismo */}
                <View style={styles.settingsCard}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="eye-outline" size={22} color={isDaltonic ? "#000" : "#8B5CF6"} />
                        <Text style={styles.sectionTitle}>Modo Daltónico</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: aplicarEscala(16) }}>Activar filtros de color</Text>
                        <Switch 
                            onValueChange={manejarCambioDaltonismo} 
                            value={isDaltonic} 
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}