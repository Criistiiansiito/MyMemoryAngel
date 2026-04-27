import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, TextInput, Image, ActivityIndicator, Platform, Alert, StatusBar, StyleSheet, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker'; 
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera'; 

import { getStyles } from '../../style/styles';
import { useAccesibilidad } from '../../services/accesibilidadContext'; 
import { configuracionPerfil } from '../../services/configuracionPerfil';
import { vinculacionesService } from '../../services/vinculacionesService';

export default function ConfiguracionPaciente({ navigation }) {
    const { aplicarEscala, textSizeLabel, setTextSizeLabel, isDarkMode, setIsDarkMode, cargarDesdeServidor } = useAccesibilidad();
    const styles = getStyles(aplicarEscala, isDarkMode);
    const insets = useSafeAreaInsets();
    
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [fechaSQL, setFechaSQL] = useState(''); 
    const [dateText, setDateText] = useState('dd/mm/aaaa'); 
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const isScanningRef = useRef(false);
    const [showScanner, setShowScanner] = useState(false);

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

    // LÓGICA DE ESCÁNER
    const iniciarEscaneo = async () => {
        const { granted } = await requestPermission();
        if (!granted) {
            Alert.alert("Permisos", "Se requiere acceso a la cámara para escanear.");
            return;
        }
        setScanned(false);
        setShowScanner(true);
    };

    const handleBarCodeScanned = async ({ data }) => {
        if (isScanningRef.current) return; 
        isScanningRef.current = true;
        setScanned(true); 
        setShowScanner(false);

        try {
            const res = await vinculacionesService.obtenerPacientePorId(data);

            if (res.ok && res.paciente) {
                Alert.alert(
                    "Paciente Detectado",
                    `¿Quieres vincularte con ${res.paciente.nombre}?`,
                    [
                        { 
                            text: "Cancelar", 
                            style: "cancel",
                            // Si cancela, reseteamos para que pueda volver a escanear luego
                            onPress: () => {
                                setScanned(false);
                                isScanningRef.current = false; // Liberamos referencia
                            }
                        },
                        { 
                            text: "Sí, vincular", 
                            onPress: async () => {
                                const vinculo = await vinculacionesService.vincularPaciente(data);
                                if (vinculo.ok) Alert.alert("Éxito", "Vinculación completada");
                                setScanned(false);
                                isScanningRef.current = false; // Liberamos referencia
                            }
                        }
                    ]
                );
            } else {
                Alert.alert("Error", "No se encontró al paciente.", [
                    { text: "OK", onPress: () => { isScanningRef.current = false; setScanned(false); } }
                ]);
            }
        } catch (error) {
            Alert.alert("Error", "Problema de conexión.", [
                { text: "OK", onPress: () => { isScanningRef.current = false; setScanned(false); } }
            ]);
        }
    };

    const autoGuardarAccesibilidad = async (nuevoTamano, nuevoTemaOscuro) => {
        try {
            await configuracionPerfil.actualizarAccesibilidad({
                tamano_texto: nuevoTamano,
                modo_daltonico: nuevoTemaOscuro ? 1 : 0
            });
        } catch (error) {
            console.error("Error en el auto-guardado:", error);
        }
    };

    const manejarCambioTamano = (size) => {
        setTextSizeLabel(size); 
        autoGuardarAccesibilidad(size, isDarkMode); 
    };

    const manejarCambioTema = (val) => {
        setIsDarkMode(val); 
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
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialCommunityIcons name="arrow-left" style={styles.topBarArrow} />
                    </TouchableOpacity>
                    <Text style={styles.brandName}>Configuración</Text>
                </View>
            </View>
            
            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
            >
                {/* PERFIL */}
                <View style={styles.profileSection}>
                    <TouchableOpacity style={styles.profilePhotoContainer} onPress={pickImage}>
                        <View style={styles.photoCircle}>
                            {profilePhoto ? (
                                    <Image source={{ uri: profilePhoto }} style={{ width: 130, height: 130, borderRadius: 65 }} />
                                ) : (
                                    <MaterialCommunityIcons name="account-tie" size={80} color="#334155" />
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

                {/* ACCESIBILIDAD */}
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
                                    textSizeLabel === size && styles.optionButtonActive,
                                    isDarkMode && textSizeLabel === size && { borderColor: '#000000' }
                                ]}
                                onPress={() => manejarCambioTamano(size)} 
                            >
                                <Text style={[
                                    styles.optionText, 
                                    textSizeLabel === size && styles.optionTextActive,
                                    isDarkMode && textSizeLabel !== size && { color: '#000000' },
                                    isDarkMode && textSizeLabel === size && { color: '#FFFFFF' }
                                ]}>{size}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.settingsCard}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="eye-outline" size={22} color={isDarkMode ? "#60A5FA" : "#F59E0B"} />
                        <Text style={styles.sectionTitle}>Modo oscuro</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: aplicarEscala(16) }}>Activar tema oscuro</Text>
                        <Switch 
                            onValueChange={manejarCambioTema} 
                            value={isDarkMode} 
                        />
                    </View>
                </View>

                {/* VINCULACIÓN QR */}
                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                       <Text style={styles.dividerText}>Vinculación</Text>
                    <View style={styles.dividerLine} />
                </View>

                <View style={styles.qrCard}>
                    <Text style={[styles.qrDescription, { fontSize: aplicarEscala(13) }]}>Escanea el código del paciente para supervisar su actividad.</Text>
                    <TouchableOpacity style={styles.scanBtn} onPress={iniciarEscaneo}>
                        <MaterialCommunityIcons name="qrcode-scan" size={22} color="#FFF" style={{ marginRight: 10 }} />
                        <Text style={styles.scanBtnText}>Abrir Cámara</Text>
                    </TouchableOpacity>
                </View>                 

                {/* BOTÓN SALIR */}
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

            {/* MODAL DEL ESCÁNER */}
            <Modal visible={showScanner} animationType="slide">
                <View style={{ flex: 1, backgroundColor: '#000' }}>
                    <CameraView 
                        style={StyleSheet.absoluteFillObject} 
                        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned} 
                    />
                    
                    <View style={styles.scanCameraContainer}>
                        <View style={styles.scanMarker} />
                        <Text style={styles.scanMarkerText}>Coloca el QR aquí</Text>
                    </View>

                    <TouchableOpacity 
                        style={[styles.scanCloseModal, {top: 15}] } 
                        onPress={() => {
                            setShowScanner(false);
                            setScanned(false);
                            isScanningRef.current = false;
                        }}
                    >
                    <MaterialCommunityIcons name="close" size={28} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
}
