/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { setAssistantEnabled, setSuggestions } from '../store/gameSlice';

export default function AssistantPanel({
  onAsk,
  fullWidth = false,
}: {
  onAsk: () => void;
  fullWidth?: boolean;
}) {
  const dispatch = useAppDispatch();
  const { suggestions, assistantEnabled, loading } = useAppSelector((s) => s.game);

  return (
    <View style={[styles.panel, { width: fullWidth ? '100%' : 280 }]}>
      {/* Enable/Disable Card */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Coach IA</Text>
          <Switch
            value={assistantEnabled}
            onValueChange={(value) => {
              dispatch(setAssistantEnabled(value));
            }}
            trackColor={{ false: '#767577', true: '#D4AF37' }}
            thumbColor={assistantEnabled ? '#FFF8E1' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Ask Button */}
      <Pressable
        onPress={onAsk}
        disabled={!assistantEnabled}
        style={[styles.actionButton, !assistantEnabled && { opacity: 0.5 }]}
      >
        <Text style={styles.actionButtonText}>Ask for a suggestion</Text>
      </Pressable>

      {/* Suggestions List */}
      <ScrollView style={styles.suggestionsContainer}>
        {loading ? (
          <Loading label="Analyzing board..." />
        ) : suggestions.length === 0 ? (
          <Text style={styles.placeholderText}>No suggestions yet.</Text>
        ) : (
          suggestions.map((s, i) => (
            <View key={i} style={styles.suggestionItem}>
              <Text style={styles.suggestionMove}>{s.move}</Text>
              {s.reason ? <Text style={styles.suggestionReason}>{s.reason}</Text> : null}
            </View>
          ))
        )}
      </ScrollView>

      {/* Clear Button */}
      <Pressable
        onPress={() => dispatch(setSuggestions([]))}
        style={styles.clearButton}
      ></Pressable>
    </View>
  );
}

export const Loading = ({ label }: { label?: string }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#D4AF37" />
    {label ? <Text style={styles.loadingLabel}>{label}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  panel: {
    backgroundColor: 'transparent', // Panel is now transparent, content has background
    padding: 12,
    flex: 1,
  },
  card: {
    backgroundColor: 'rgba(40, 25, 15, 0.8)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6b4f3a',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
  },
  label: {
    fontSize: 18,
    color: '#E0E0E0',
    fontFamily: 'CinzelDecorative-Bold',
  },
  actionButton: {
    backgroundColor: '#8B4513',
    borderWidth: 2,
    borderColor: '#D4AF37',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 15,
  },
  actionButtonText: {
    color: '#FFF8E1',
    fontSize: 16,
    fontWeight: 'bold',
  },
  suggestionsContainer: {
    flex: 1,
    backgroundColor: 'rgba(40, 25, 15, 0.8)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6b4f3a',
    padding: 10,
  },
  placeholderText: {
    color: '#b0a090',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  suggestionItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#6b4f3a',
  },
  suggestionMove: {
    fontWeight: 'bold',
    color: '#FFF8E1',
    fontSize: 16,
  },
  suggestionReason: {
    color: '#E0E0E0',
    marginTop: 4,
  },
  clearButton: {
    padding: 12,
    marginTop: 10,
  },
  clearButtonText: {
    color: '#b0a090',
    textAlign: 'center',
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingLabel: {
    marginTop: 10,
    color: '#E0E0E0',
    fontSize: 16,
  },
});
