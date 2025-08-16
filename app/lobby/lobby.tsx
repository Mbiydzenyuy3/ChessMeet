// app/lobby/Lobby.tsx
import { Text, TouchableOpacity, View } from 'react-native';
import { logout } from '../../redux/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../../redux/slices/hooks';

export default function Lobby() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  return (
    <View style={{ flex: 1, padding: 24, gap: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '600' }}>
        Welcome{user?.email ? `, ${user.email}` : ''}!
      </Text>

      <TouchableOpacity
        style={{ padding: 16, backgroundColor: '#3763B0', borderRadius: 12 }}
        onPress={() => {
          // navigate to PlayAI when that screen exists
        }}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>Play vs AI</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ padding: 16, backgroundColor: '#3763B0', borderRadius: 12 }}
        onPress={() => {
          // navigate to PlayMultiplayer when that screen exists
        }}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>Play Multiplayer</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          padding: 16,
          backgroundColor: '#E64A19',
          borderRadius: 12,
          marginTop: 'auto',
        }}
        onPress={() => dispatch(logout())}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
