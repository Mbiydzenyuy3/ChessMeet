// app/_layout.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

import { Provider } from 'react-redux';
import { store } from '../redux/store'; // adjust path to where your store is

import OTPVerify from './auth/OTPverify';
import SignIn from './auth/SignIn';
import PlayLocal from './game/PlayLocal';
import GetStarted from './index';
// import Lobby from './lobby/lobby';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootLayout() {
  return (
    <Provider store={store}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="GetStarted" component={GetStarted} />
        <Stack.Screen name="SignIn" component={SignIn} />
        <Stack.Screen name="OTPVerify" component={OTPVerify} />
        <Stack.Screen name="Local" component={PlayLocal} />
        {/* <Stack.Screen name="Lobby" component={Lobby} /> */}
      </Stack.Navigator>
    </Provider>
  );
}
