// ============================ components/UI.tsx ============================
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';


export const Button = ({ title, onPress, disabled }: { title: string; onPress?: () => void; disabled?: boolean }) => (
<Pressable onPress={onPress} disabled={disabled} style={{ paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14, backgroundColor: disabled ? '#a3a3a3' : '#111827', shadowOpacity: 0.15, shadowRadius: 8 }}>
<Text style={{ color: 'white', fontWeight: '600', textAlign: 'center' }}>{title}</Text>
</Pressable>
);


export const Chip = ({ children }: { children: React.ReactNode }) => (
<View style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: '#f3f4f6' }}>
<Text style={{ color: '#111827' }}>{children}</Text>
</View>
);


export const Loading = ({ label }: { label?: string }) => (
<View style={{ alignItems: 'center', justifyContent: 'center', padding: 16 }}>
<ActivityIndicator />
{label ? <Text style={{ marginTop: 8, color: '#374151' }}>{label}</Text> : null}
</View>
);