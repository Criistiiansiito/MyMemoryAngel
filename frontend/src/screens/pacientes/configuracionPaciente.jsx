import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, TextInput, Image, ActivityIndicator, Platform, Alert, StatusBar, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker'; 
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import QRCode from 'react-native-qrcode-svg';
import { useFocusEffect } from '@react-navigation/native';

import { getStyles } from '../../style/styles';
import { useAccesibilidad } from '../../services/accesibilidadContext'; 
import { configuracionPerfil } from '../../services/configuracionPerfil';

export default function ConfiguracionPaciente({ navigation }) {
    const { aplicarEscala, textSizeLabel, setTextSizeLabel, isDaltonic, setIsDaltonic, cargarDesdeServidor } = useAccesibilidad();
    const styles = getStyles(aplicarEscala, isDaltonic);
    
    const insets = useSafeAreaInsets();
    
    // Estados actuales
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [fechaSQL, setFechaSQL] = useState(''); 
    const [dateText, setDateText] = useState('dd/mm/aaaa'); 
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uid, setUid] = useState(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => { 
        cargarDatos(); 
    }, []);

    useEffect(() => () => {
        Speech.stop();
    }, []);

    useFocusEffect(
        useCallback(() => {
            return () => {
                Speech.stop();
                setIsSpeaking(false);
            };
        }, [])
    );

    const cargarDatos = async () => {
        try {
            const data = await configuracionPerfil.obtenerPerfil();
            if (data.ok && data.usuario) {
                setNombre(data.usuario.nombre || '');
                setEmail(data.usuario.correo || '');
                // Guardamos el ID del usuario para generar el QR
                setUid(data.usuario.id || data.usuario.uid || 'Sin ID');
                
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

    const autoGuardarAccesibilidad = async (nuevoTamano, nuevoDaltonismo) => {
        try {
            await configuracionPerfil.actualizarAccesibilidad({
                tamano_texto: nuevoTamano,
                modo_daltonico: nuevoDaltonismo ? 1 : 0
            });
        } catch (error) {
            console.error("Error en el auto-guardado:", error);
        }
    };

    const manejarCambioTamano = (size) => {
        setTextSizeLabel(size); 
        autoGuardarAccesibilidad(size, isDaltonic); 
    };

    const manejarCambioDaltonismo = (val) => {
        setIsDaltonic(val); 
        autoGuardarAccesibilidad(textSizeLabel, val); 
    };

    const confirmarCerrarSesion = () => {
        Alert.alert(
            "Cerrar Sesión",
            "¿Estás seguro de que quieres cerrar sesión?",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Sí, salir", 
                    style: "destructive",
                    onPress: () => {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Bienvenida' }], 
                        });
                    } 
                }
            ]
        );
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
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

    const manejarGuardarPerfil = async () => {
        if (!nombre.trim()) {
            Alert.alert("Error", "El nombre es obligatorio");
            return;
        }
        try {
            setLoading(true);
            const resPerfil = await configuracionPerfil.actualizarPerfil(nombre, profilePhoto, fechaSQL);
            if (resPerfil.ok) {
                Alert.alert("¡Hecho!", "Tu perfil se ha actualizado correctamente.");
            } else {
                Alert.alert("Error", "No se pudieron guardar los cambios.");
            }
        } catch (error) {
            Alert.alert("Error", "Hubo un problema al conectar con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    const leerResumen = () => {
        if (isSpeaking) {
            Speech.stop();
            setIsSpeaking(false);
            return;
        }

        const mensaje = [
        'Estás en la pantalla de configuración.',
        'Aquí puedes cambiar tu foto de perfil, tu nombre y tu fecha de nacimiento.',
        'También puedes ajustar el tamaño del texto y activar el modo daltónico.',
        'Más abajo encontrarás tu código QR para conectarte con tu cuidador.',
        'Por último, al final de la pantalla puedes cerrar la sesión.',
        ].join(' ');

        setIsSpeaking(true);
        Speech.speak(mensaje, {
            language: 'es-ES',
            pitch: 1,
            rate: 0.8,
            onDone: () => setIsSpeaking(false),
            onStopped: () => setIsSpeaking(false),
            onError: () => setIsSpeaking(false),
        });
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#4D6BFE" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* HEADER */}
            <View style={[
                styles.topBar, 
                { paddingTop: insets.top }
            ]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
                        </TouchableOpacity>
                    <Text style={styles.brandName}>Configuración</Text>
                    </View>
                    <TouchableOpacity style={styles.headerIconButton} onPress={leerResumen}>
                        <MaterialCommunityIcons name={isSpeaking ? 'stop' : 'volume-high'} size={24} color="#334155" />
                    </TouchableOpacity>
                </View>
            </View>
            
            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
            >
                {/* SECCIÓN PERFIL */}
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
                        <Text style={styles.input}>{dateText}</Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker 
                            value={fechaSQL ? new Date(fechaSQL) : new Date()} 
                            mode="date" 
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            maximumDate={new Date()}
                            onChange={onDateChange} 
                        />
                    )}

                    <TouchableOpacity style={[styles.mainButton, { marginTop: 25 }]} onPress={manejarGuardarPerfil}>
                        <Text style={styles.mainButtonText}>Guardar Perfil</Text>
                    </TouchableOpacity>
                </View>

                {/* SECCIÓN PERSONALIZACIÓN */}
                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>Personalización</Text>
                    <View style={styles.dividerLine} />
                </View>

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

                {/* SECCIÓN VINCULACIÓN (QR) */}
                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>Vinculación</Text>
                    <View style={styles.dividerLine} />
                </View>

                <View style={styles.qrCard}>
                    <Text style={[styles.qrDescription, { fontSize: aplicarEscala(13) }]}>
                        Muestra este código a tu cuidador para que pueda ayudarte con tu cuenta.
                    </Text>
                    <View style={{paddingTop:5}}>
                        {uid ? ( //El value es el valor que le pasamos para que lo convierta en qr
                            <QRCode value={uid.toString()} size={190} color="black" backgroundColor="white" />
                        ) : (
                            <ActivityIndicator color="#4D6BFE" />
                        )}
                    </View>
                    <Text style={[styles.uidText, { fontSize: aplicarEscala(10) }]}>
                        ID: {uid}
                    </Text>
                </View>

                {/* BOTÓN CERRAR SESIÓN */}
                <TouchableOpacity 
                    style={[styles.mainButton, { backgroundColor: '#EF4444', marginTop: 30, marginBottom: 50 }]} 
                    onPress={confirmarCerrarSesion}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialCommunityIcons name="logout" size={20} color="#FFF" style={{ marginRight: 10 }} />
                        <Text style={styles.mainButtonText}>Cerrar Sesión</Text>
                    </View>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}
