import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './ConfigFirebase';
import { FontAwesome5 } from '@expo/vector-icons'; // Importez FontAwesome5 ou utilisez une autre bibliothèque d'icônes
import WelcomePage from './WelcomePage';

const Login = ({ setIsAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [showWelcomePage, setShowWelcomePage] = useState(true);
  const [resetPasswordSent, setResetPasswordSent] = useState(false);
  const [hidePassword, setHidePassword] = useState(true); // État pour masquer/afficher le mot de passe
  const navigation = useNavigation();

  useEffect(() => {
    const onAnimationComplete = () => {
      setShowWelcomePage(false);
    };

    const timeoutId = setTimeout(() => {
      onAnimationComplete();
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, []);

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setIsAuth(true);
      navigation.navigate('Accueil');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleForgotPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      setResetPasswordSent(true);
      Alert.alert('Réinitialisation du mot de passe', 'Un e-mail de réinitialisation du mot de passe a été envoyé à votre adresse e-mail.');
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur s\'est produite lors de la réinitialisation du mot de passe. Veuillez réessayer.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Logo en haut à gauche */}
      <Image source={require('./fsj.png')} style={styles.backgroundImage} />
      <Image source={require('./logo1.png')} style={styles.logo1} />
      <Image source={require('./logo2.png')} style={styles.logo2} />
      {/* Affichez la page de bienvenue si showWelcomePage est vrai */}
      {showWelcomePage && <WelcomePage onAnimationComplete={() => setShowWelcomePage(false)} />}

      {!showWelcomePage && (
        <View style={styles.loginContainer}>
          {/* Logo en haut à droite */}
          <Image source={require('./user.png')} style={styles.title} />
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Saisir adresse email"
              placeholderTextColor="white"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor="white"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={hidePassword} // Utilisez le mode de saisie sécurisé en fonction de l'état
            />
            {/* Ajoutez une icône pour permettre à l'utilisateur de basculer entre l'affichage et le masquage du mot de passe */}
            <TouchableOpacity onPress={() => setHidePassword(!hidePassword)} style={styles.togglePasswordVisibility}>
              <FontAwesome5 name={hidePassword ? 'eye-slash' : 'eye'} size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.buttonText}>Se connecter</Text>
            </TouchableOpacity>
            {resetPasswordSent ? (
              <Text style={styles.successMessage}>Un e-mail de réinitialisation a été envoyé. Veuillez vérifier votre boîte de réception.</Text>
            ) : (
              <>
                <TouchableOpacity onPress={handleForgotPassword}>
                  <View style={styles.forgotPasswordContainer}>
                    <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
                  </View>
                </TouchableOpacity>
                {error && <Text style={styles.error}>{error}</Text>}
              </>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  logo1: {
    position: 'absolute',
    top: 50,
    left: 0,
    width: 100,
    height: 100,
  },
  logo2: {
    position: 'absolute',
    top: 50,
    right: 5,
    width: 100,
    height:100,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#023903',
  },
  loginContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 20,
    borderRadius: 20,
    width: '80%',
  },
  title: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: 'rgba(255, 193, 7, 0.7)',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    color: 'white',
    fontStyle: 'italic',
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: '#05AD06',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  forgotPasswordContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  togglePasswordVisibility: {
    position: 'absolute',
    top: '50%', // Centrez l'icône verticalement par rapport au champ de mot de passe
    right: 10,
    transform: [{ translateY: -27 }], // Ajustez la position verticale pour centrer l'icône par rapport au champ de mot de passe
  },
  successMessage: {
    color: 'green',
    marginTop: 10,
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});

export default Login;
