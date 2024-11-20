import {CameraView, CameraType, useCameraPermissions} from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import {Audio} from 'expo-av';
import React, {useEffect, useRef, useState} from 'react';
import {Button, StyleSheet, Text, TouchableOpacity, View, Alert} from 'react-native';
import * as Speech from 'expo-speech';

export default function App() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
    const cameraRef = useRef<CameraView | null>(null);
    const [recordedText, setRecordedText] = useState<string | null>(null);
    const [recording, setRecording] = useState();
    const [permissionResponse, requestPermission] = Audio.usePermissions();
    const [recordingUri, setRecordingUri] = useState<string | null>(null);


    useEffect(() => {
        if (!cameraPermission?.granted) {
            requestCameraPermission();
        }
        if (!mediaPermission?.granted) {
            requestMediaPermission();
        }
    }, []);

    if (!cameraPermission) {
        // Camera permissions are still loading.
        return <View/>;
    }

    if (!cameraPermission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestCameraPermission} title="Grant Camera Permission"/>
            </View>
        );
    }

    // if (!mediaPermission?.granted) {
    //     return (
    //         <View style={styles.container}>
    //             <Text style={styles.message}>We need your permission to save photos</Text>
    //             <Button onPress={requestMediaPermission} title="Grant Media Library Permission"/>
    //         </View>
    //     );
    // }


    const toggleCameraFacing = () => {
        setFacing((current) => (current === 'back' ? 'front' : 'back'));
    };

    async function startRecording() {
        try {
            if (permissionResponse.status !== 'granted') {
                console.log('Requesting permission..');
                await requestPermission();
            }
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            console.log('Starting recording..');
            const {recording} = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
            console.log('Recording started');
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    }

    async function stopRecording() {
        console.log('Stopping recording..');
        setRecording(undefined);
        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync(
            {
                allowsRecordingIOS: false,
            }
        );
        const uri = recording.getURI();
        setRecordingUri(uri);
        console.log('Recording stopped and stored at', uri);
    }

    async function playRecording() {
        if (!recordingUri) {
            Alert.alert('녹음 파일이 없습니다.');
            return;
        }

        const sound = new Audio.Sound();
        try {
            await sound.loadAsync({uri: recordingUri});
            await sound.playAsync();
        } catch (err) {
            console.error('녹음 파일을 재생할 수 없습니다.', err);
        }
    }

    const transcribeAudio = async (uri: string): Promise<string> => {
        // Example: Replace this logic with actual speech-to-text implementation
        // Using `expo-speech` for simplicity (placeholder for real transcription logic)
        const mockTranscription = "This is a placeholder transcription for demo purposes.";
        return mockTranscription;
    };

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                        <Text style={styles.text}>Flip Camera</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.recordButton}
                        onPress={recording ? stopRecording : startRecording}
                    >
                        <Text style={styles.buttonText}>
                            {recording ? 'Stop Recording' : 'Start Recording'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.playButton}
                        onPress={playRecording}
                    >
                        <Text style={styles.buttonText}>녹음 듣기</Text>
                    </TouchableOpacity>
                    {recordedText && (
                        <Text style={styles.transcription}>Transcription: {recordedText}</Text>
                    )}
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        marginBottom: 30,
    },
    button: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 5,
        padding: 10,
    },
    text: {
        fontSize: 18,
        color: 'white',
    },
    transcriptionContainer: {
        padding: 20,
        backgroundColor: '#f9f9f9',
    },
    transcriptionText: {
        fontWeight: 'bold',
    },
    recordButton: {
        backgroundColor: '#ff4757',
        padding: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    transcription: {
        marginTop: 20,
        fontSize: 16,
        color: '#2f3542',
        textAlign: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    playButton: {
        backgroundColor: '#1e90ff',
        padding: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
