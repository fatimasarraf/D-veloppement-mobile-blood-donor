import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { db } from './ConfigFirebase';
import { FontAwesome5 } from '@expo/vector-icons'; // Importez FontAwesome5 ou utilisez une autre bibliothèque d'icônes

const Accueil = () => {
  const navigation = useNavigation();
  const [evenements, setEvenements] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'evenement'), querySnapshot => {
      const events = [];
      querySnapshot.forEach(documentSnapshot => {
        const data = documentSnapshot.data();
        const date = data.date.toDate();
        // Formatage de la date
        const formattedDate = formatDate(date);
        // Ajout des données formatées dans le tableau d'événements
        events.push({
          ...data,
          id: documentSnapshot.id,
          date: date,
          formattedDate: formattedDate,
        });
      });
      // Tri des événements par date croissante
      events.sort((a, b) => a.date - b.date);
      setEvenements(events);
    });

    return () => unsubscribe();
  }, []);

  // Fonction pour rendre chaque élément de la liste
  const renderItem = ({ item }) => {
    console.log("Item:", item); // Débogage des données de l'élément
    return (
      <TouchableOpacity style={styles.eventContainer}>
        <View style={styles.dateTimeContainer}>
          <Text style={styles.dateText}>{item.formattedDate}</Text>
          <Text style={styles.heureText}>{item.heure}</Text>
        </View>
        <View style={styles.eventDetails}>
          <Text style={styles.eventSujet}>{item.sujet}</Text>
          <View style={styles.lieuContainer}>
            <FontAwesome5 name="map-marker-alt" size={16} color="#05AD06" style={styles.icon} />
            <Text style={styles.eventLieu}>{item.lieu}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Fonction pour formater la date
  const formatDate = (date) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
  };

  // Fonction pour déconnecter l'utilisateur et naviguer vers l'écran de connexion
  const handleLogout = () => {
    // Code pour déconnecter l'utilisateur
    // Navigation vers l'écran de connexion
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      {/* Header avec le nom de l'application */}
      <View style={styles.header}>
       
        {/* Logo au milieu */}
        <Image source={require('./logo.png')} style={styles.logo} />
        {/* Bouton de déconnexion à droite */}
        <TouchableOpacity onPress={handleLogout}>
          <FontAwesome5 name="sign-out-alt" size={35} color="white" style={styles.logoutIcon} />
        </TouchableOpacity>
      </View>

      {/* Titre des événements à venir */}
      <Text style={styles.eventsTitle}>Actualités Événementielles de l'Université</Text>

      {/* Liste des événements */}
      <FlatList
        data={evenements}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.eventList}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.bottomButton} onPress={() => navigation.navigate('EcranCarte')}>
          <Text style={styles.buttonText}>Voir la carte</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: 'rgba(255, 193, 7, 0.7)', // Fond du header
  },
  logo: {
    width: 100,
    height: 100,
  },
  userIcon: {
    marginRight: 10,
  },
  logoutIcon: {
    marginLeft: 10,
  },
  eventsTitle: {
    fontSize: 20, // Taille du titre
    fontWeight: 'bold', // Gras
    color: '#333', // Couleur du texte
    paddingHorizontal: 20, // Espacement horizontal
    marginTop: 20, // Marge en haut
    textAlign: 'center', // Centré horizontalement
    letterSpacing: 1, // Espacement entre les lettres
    fontFamily: 'Arial', // Police de caractères
  },
  eventList: {
    flex: 1,
    padding: 20,
  },
  eventContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 193, 7, 0.7)', // Couleur de fond pour chaque élément
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    shadowColor: '#000', // Ajout d'une ombre pour donner un effet de profondeur
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dateTimeContainer: {
    backgroundColor: 'rgba(5, 173, 6, 0.5)',
    borderRadius: 5,
    marginRight: 10,
    padding: 10,
    alignItems: 'center', // Aligner le contenu au centre
  },
  dateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF', // Couleur du texte de la date en blanc
  },
  heureText: {
    fontSize: 12,
    color: '#FFFFFF', // Couleur du texte de l'heure en blanc
    marginTop: 5, // Ajout d'un espace entre la date et l'heure
  },
  eventDetails: {
    flex: 1,
  },
  eventSujet: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1C291C',
  },
  lieuContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  icon: {
    marginRight: 5,
  },
  eventLieu: {
    fontSize: 14,
    color: 'rgba(5, 173, 6, 0.5)',
    fontWeight: 'bold',
  },
  footer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 20,
  },
  bottomButton: {
    backgroundColor: '#05AD06',
    padding: 15,
    borderRadius: 25, // Augmenter le rayon de la bordure pour rendre le bouton plus arrondi
    alignItems: 'center',
    width: '80%', // Réduire légèrement la largeur du bouton
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16, // Augmenter légèrement la taille du texte
  },
});

export default Accueil;

