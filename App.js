// App.js
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './Login';
import Accueil from './Acceuil';  // Assurez-vous que le chemin est correct
import Map from './Map';
import WelcomePage from './WelcomePage';

const Stack = createStackNavigator();

const App = () => {
  const [isAuth, setIsAuth] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuth ? (
          <Stack.Screen name="Welcome">
            {() => <WelcomePage onAnimationComplete={() => setIsAuth(true)} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Login">
              {() => <Login setIsAuth={setIsAuth} />}
            </Stack.Screen>
            <Stack.Screen name="Accueil">
              {() => <Accueil onDeconnexion={() => setIsAuth(false)} onNavigationMap={() => navigation.navigate('EcranCarte')} />}
            </Stack.Screen>
            <Stack.Screen name="EcranCarte" component={Map} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
