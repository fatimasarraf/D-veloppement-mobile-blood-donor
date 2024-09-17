import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, TouchableOpacity, Image, Text, TextInput, Alert, Modal, FlatList } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import { collection, getDocs } from "firebase/firestore";
import { db } from "./ConfigFirebase";

const facultyCoordinates = {
  latitude: 33.2258,
  longitude: -8.4867,
};



  const CustomMarker = ({ location, onPress, isCurrentUser }) => {
  const markerStyle = isCurrentUser ? styles.currentUserMarker : styles.otherMarker;
  const textContainerStyle = isCurrentUser ? styles.currentUserTextContainer : styles.otherTextContainer;
  const markerTextStyle = isCurrentUser ? styles.currentUserMarkerText : styles.otherMarkerText;
 

  return (
    <Marker
      onPress={() => {
        if (!isCurrentUser) {
          onPress(location);
        }
      }}
      coordinate={{
        latitude: location.coordinates.latitude,
        longitude: location.coordinates.longitude,
      }}
    >
      <View style={[styles.markerContainer, markerStyle]}>
        <View style={styles.markerContent}>
          <View style={styles.pinContainer}>
            <Image source={require('./pin.png')} style={styles.pinIcon} />
          </View>
          <View style={[styles.markerTextContainer, textContainerStyle]}>
            <Text style={[styles.markerText, markerTextStyle]}>{location.name}</Text>
          </View>
        </View>
      </View>
    </Marker>
  );
};

const LocationModal = ({ location, onClose }) => {
  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={!!location}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>{location.name}</Text>
        <Image source={{ uri: location.image }} style={styles.modalImage} />
        <Text style={styles.modalDescription}>{location.description}</Text>
        <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
          <Text style={styles.modalCloseButtonText}>Fermer</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const BottomSheet = ({ isVisible, onClose, onSelectLocation, markersData }) => {
  // Fonction pour trier les données par ordre alphabétique
  const sortedMarkersData = markersData.slice().sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => onSelectLocation(item)}>
      <View style={styles.locationItem}>
        <Text style={styles.locationItemText}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.bottomSheetContainer}>
        <View style={styles.bottomSheetContent}>
          <FlatList 
            data={sortedMarkersData} 
            renderItem={renderItem}
          
            keyExtractor={(item) => item.name}
            style={styles.flatList}
          />
        </View>
      </View>
    </Modal>
  );
};

export default function Map() {
  const [mapType, setMapType] = useState("standard");
  const [currentPosition, setCurrentPosition] = useState(null);
  const [showFacultyPosition, setShowFacultyPosition] = useState(true);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const [isFloatingButtonOpen, setIsFloatingButtonOpen] = useState(false);
  const [destination, setDestination] = useState('');
  const [destinationCoordinates, setDestinationCoordinates] = useState(null);
  const mapViewRef = useRef(null);
  const [routeDetails, setRouteDetails] = useState({
    distance: null,
    duration: null,
  });
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [markersData, setMarkersData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch markers data
        const markersCollectionRef = collection(db, 'location');
        const markersSnapshot = await getDocs(markersCollectionRef);
        const markersList = markersSnapshot.docs.map(doc => doc.data());
        setMarkersData(markersList);
  
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
  }
};
fetchData();
}, []);


const getCurrentLocation = async () => {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      console.error('La permission de la géolocalisation a été refusée');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});

    if (location) {
      const { latitude, longitude } = location.coords;

      setCurrentPosition({ latitude, longitude });

      if (mapViewRef.current) {
        mapViewRef.current.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.007,
          longitudeDelta: 0.007,
        });
      }

      setShowUserLocation(true);
      setShowFacultyPosition(false);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de la position actuelle:', error);

    if (error.code === 'E_LOCATION_SERVICES_DISABLED') {
      console.error('Les services de localisation sont désactivés.');
    } else if (error.code === 'E_LOCATION_TIMEOUT') {
      console.error('Timeout lors de la récupération de la localisation.');
    }
  }
};

const toggleFloatingButton = () => {
  setIsFloatingButtonOpen((prev) => !prev);
};

  const toggleMapType = () => {
    if (mapViewRef.current) {
      setMapType((prevMapType) => (prevMapType === "standard" ? "satellite" : "standard"));
      closeFloatingButton();
    }
  };

  const closeFloatingButton = () => {
    setIsFloatingButtonOpen(false);
  };

  const getDestinationCoordinates = () => {
    try {
      const lowerCaseDestination = destination.toLowerCase().trim();
  
      const destinationLocation = markersData.find(
        loc => loc.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === lowerCaseDestination.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      );
  
      if (destinationLocation) {
        setDestinationCoordinates(destinationLocation.coordinates);
      } else {
        Alert.alert('Destination invalide', 'Veuillez sélectionner une destination valide parmi les options disponibles.');
      }
    } catch (error) {
      console.error('Erreur de géocodage de la destination:', error);
    }
  };
  
  const handleGetDirections = () => {
    if (destination.trim() === '') {
      Alert.alert('Erreur', 'Veuillez saisir une destination valide.');
      return;
    }

    getDestinationCoordinates();
  };

  const showMarkerInfo = (location) => {
    setSelectedMarker(location);
  };

  const closeMarkerInfo = () => {
    setSelectedMarker(null);
  };

  const toggleBottomSheet = () => {
    setIsBottomSheetVisible(!isBottomSheetVisible);
  };

  const handleSelectLocation = (location) => {
    setCurrentPosition(location.coordinates);

    // Déplacer la carte vers la nouvelle position sélectionnée
    if (mapViewRef.current) {
      mapViewRef.current.animateToRegion({
        latitude: location.coordinates.latitude,
        longitude: location.coordinates.longitude,
        latitudeDelta: 0.009,
        longitudeDelta: 0.009,
    
      });
    }

    setIsBottomSheetVisible(false); // Fermer le panneau inférieur après avoir sélectionné une localisation
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapViewRef}
        minZoomLevel={18}
        maxZoomLevel={25}
        mapType={mapType}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          ...facultyCoordinates,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={false}
        showsMyLocationButton={false}
        followsUserLocation={false}
      >
        {/* {showFacultyPosition && (
          <CustomMarker
            location={{
              name: "Faculté des Sciences el Jadida",
              coordinates: facultyCoordinates,
              description: "Description de la Faculté des Sciences el Jadida",
              image: require('./administration.jpeg'),
            }}
            onPress={() => {
              console.log('Faculty marker pressed');
              showMarkerInfo({
                name: "Faculté des Sciences el Jadida",
                description: "Description de la Faculté des Sciences el Jadida",
                image: require('./administration.jpeg'),
              });
            }}
          />
        )} */}

        {showUserLocation && currentPosition && (
          <CustomMarker
            location={{
              name: "Vous êtes ici",
              coordinates: currentPosition,
              description: "Description de votre position",
              image: require('./administration.jpeg'),
            }}
            onPress={() => {
              console.log('User location marker pressed');
              showMarkerInfo({
                name: "Vous êtes ici",
                description: "Description de votre position",
                image: require('./administration.jpeg'),
              });
            }}
            isCurrentUser={true}
          />
        )}

        {markersData.map((item, index) => (
          <CustomMarker
            key={index}
            location={item}
            onPress={(location) => {
              console.log(`Marker pressed: ${location.name}`);
              showMarkerInfo(location);
              setSelectedMarker(location);
            }}
          />
        ))}

        {destinationCoordinates && currentPosition && (
          <MapViewDirections
            origin={currentPosition}
            destination={destinationCoordinates}
            apikey={'Api key'}
            strokeWidth={5}
            strokeColor="yellow"
            mode="WALKING"
            onReady={(result) => {
              console.log(`Distance: ${result.distance} km`);
              console.log(`Durée estimée du trajet: ${result.duration} min`);
              setRouteDetails({
                distance: result.distance.toFixed(2),
                duration: result.duration.toFixed(0),
              });
            }}
          />
        )}
      </MapView>

      <TextInput
        style={styles.destinationInput}
        value={destination}
        onChangeText={setDestination}
        placeholder="Entrez votre destination"
        placeholderTextColor="black"
      />
      <TouchableOpacity style={styles.getDirectionsButton} onPress={handleGetDirections}>
        <Image source={require('./icone_directions.png')} style={styles.buttonIcon} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={toggleFloatingButton}
      >
        {isFloatingButtonOpen ? (
          <View style={styles.buttonContent}>
            <TouchableOpacity style={styles.subButton} onPress={toggleMapType}>
              <Image source={require('./icone_satellite.png')} style={styles.buttonIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.subButton} onPress={getCurrentLocation}>
              <Image source={require('./icone_location.png')} style={styles.buttonIcon} />
            </TouchableOpacity>
          </View>
        ) : (
          <Image source={require('./icon_menu.png')} style={styles.buttonIcon} />
        )}
      </TouchableOpacity>

      {destinationCoordinates && (
        <View style={styles.routeDetailsContainer}>
          <View style={styles.tableContainer}>
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text style={styles.tableHeader}>Distance</Text>
              </View>
              <View style={styles.tableCell}>
                <Text style={styles.tableHeader}>Durée estimée</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text style={styles.tableData}>{routeDetails.distance} km</Text>
              </View>
              <View style={styles.tableCell}>
                <Text style={styles.tableData}>{routeDetails.duration} min</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {selectedMarker && (
        <LocationModal location={selectedMarker} onClose={closeMarkerInfo} />
      )}

      <TouchableOpacity style={styles.bottomSheetButton} onPress={toggleBottomSheet}>
        <Text style={styles.bottomSheetButtonText}>Liste des localisations</Text>
      </TouchableOpacity>

      <BottomSheet
        isVisible={isBottomSheetVisible}
        onClose={toggleBottomSheet}
        onSelectLocation={handleSelectLocation}
        markersData={markersData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingButton: {
    position: "absolute",
    top: 100,
    right: 16,
    backgroundColor: '#BCEC87',
    borderRadius: 32,
    padding: 8,
    elevation: 5,
  },
  buttonContent: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  subButton: {
    backgroundColor: "#BCEC87",
    borderRadius: 24,
    marginBottom: 8,
    padding: 6,
    elevation: 5,
  },
  buttonIcon: {
    width: 24,
    height: 24,
  },
  destinationInput: {
    position: "absolute",
    top: 40,
    left: 23,
    width: '65%',
    padding: 8,
    backgroundColor: '#BCEC87',
    borderRadius: 8,
    elevation: 5,
    color: 'black', 
    fontWeight: 'bold' ,
  },
  getDirectionsButton: {
    position: "absolute",
    top: 40,
    right: 55,
    backgroundColor: '#BCEC87',
    padding: 9,
    borderRadius: 8,
    elevation: 4,
  },
  markerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerContent: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  pinContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  pinIcon: {
    width: 30,
    height: 20,
  },
  markerTextContainer: {
    borderRadius: 16,
    padding: 8,
    marginTop: 5,
  },
  markerText: {
    fontFamily: 'Arial',
    fontSize: 8,
    fontWeight: 'bold',
  },
  currentUserTextContainer: {
    backgroundColor: '#BCEC87',
  },
  otherTextContainer: {
    backgroundColor: '#FFD700',
  },
  currentUserMarkerText: {
    color: 'black',
  },
  otherMarkerText: {
    color: 'black',
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color:  'rgba(255, 193, 7, 0.7)',
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    color: 'black',
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#BCEC87',
    borderRadius: 8,
  },
  modalCloseButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    borderRadius:10,
  },
  bottomSheetContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomSheetContent: {
    backgroundColor: 'rgba(255, 255, 255,255)',
    padding: 16,
    width:'100%',
    height:'100%',
  },
  bottomSheetButton: {
    position: 'absolute',
    bottom: 20, // Position verticale par rapport au bas de l'écran
    backgroundColor: '#BCEC87',
    padding: 15,
    right:'10',
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20, // Marge en bas de l'écran
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bottomSheetButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'black',
  },

  routeDetailsContainer: {
    position: 'absolute',
    left: 60, // Ajustement de la position
    top: 120,
    width: '50%', // Ajustement de la largeur
    backgroundColor: '#F4D46A',
    padding: 16,
    borderRadius: 10,
    elevation: 5,
  },
  tableContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  tableCell: {
    flex: 1,
    alignItems: 'flex-start',
  },
  tableHeader: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  tableData: {
    fontSize: 12,
  },
  locationItem: {
    backgroundColor: 'rgba(255, 193, 7,0.6)', // Jaune transparent
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  locationItemText: {
    color: 'black',
    fontWeight: 'bold',
  },
});
