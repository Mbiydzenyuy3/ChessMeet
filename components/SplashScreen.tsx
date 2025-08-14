import React, { useEffect, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { Shield, Sparkles, Bot, Users } from 'lucide-react-native';

interface SplashScreenProps {
  onComplete?: () => void;
  minDisplayTime?: number;
}

export default function SplashScreen({ onComplete, minDisplayTime = 2000 }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    { icon: Bot, text: 'AI-Powered Chess Engine', color: 'purple' },
    { icon: Users, text: 'Real-time Multiplayer', color: 'blue' },
    { icon: Shield, text: 'Secure Authentication', color: 'green' },
    { icon: Sparkles, text: 'Smart Move Analysis', color: 'yellow' },
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          if (onComplete) {
            setTimeout(onComplete, 500);
          }
          return 100;
        }
        return prev + 2;
      });
    }, minDisplayTime / 50);

    const featureInterval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(featureInterval);
    };
  }, [minDisplayTime, onComplete, features.length]);

  const CurrentIcon = features[currentFeature].icon;

  return (
    <View className="flex-1 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 justify-center items-center">
      {/* Main Logo */}
      <View className="items-center mb-8">
        <View className="relative w-24 h-24 mb-6">
          <View className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl" />
          <View className="absolute inset-2 bg-white rounded-2xl justify-center items-center">
            <Shield width={48} height={48} color="#7c3aed" />
          </View>
          <View className="absolute -top-2 -right-2">
            <Sparkles width={24} height={24} color="#facc15" />
          </View>
        </View>

        <Text className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-blue-200 mb-2">
          Chess AI
        </Text>
        <Text className="text-slate-300 text-lg font-medium">AI-Native Chess Experience</Text>
      </View>

      {/* Feature Showcase */}
      <View className="mb-8 h-16 justify-center items-center">
        <View className="flex-row items-center gap-3">
          <CurrentIcon width={32} height={32} color={features[currentFeature].color} />
          <Text className="text-white text-lg font-medium">{features[currentFeature].text}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="mb-6 w-3/4">
        <View className="bg-slate-700 rounded-full h-2 overflow-hidden">
          <View
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
            style={{ width: `${progress}%` }}
          />
        </View>
        <View className="flex-row justify-between mt-2">
          <Text className="text-slate-400 text-sm">Loading...</Text>
          <Text className="text-slate-400 text-sm">{Math.round(progress)}%</Text>
        </View>
      </View>

      {/* Loading States */}
      <View className="space-y-2">
        <Text className={`text-slate-400 text-sm ${progress > 20 ? 'opacity-100' : 'opacity-50'}`}>
          ✓ Initializing chess engine
        </Text>
        <Text className={`text-slate-400 text-sm ${progress > 40 ? 'opacity-100' : 'opacity-50'}`}>
          ✓ Loading AI models
        </Text>
        <Text className={`text-slate-400 text-sm ${progress > 60 ? 'opacity-100' : 'opacity-50'}`}>
          ✓ Connecting to servers
        </Text>
        <Text className={`text-slate-400 text-sm ${progress > 80 ? 'opacity-100' : 'opacity-50'}`}>
          ✓ Preparing game interface
        </Text>
      </View>

      {/* Floating Chess Pieces */}
      <View className="absolute inset-0 pointer-events-none">
        {['♔', '♕', '♖', '♗', '♘', '♙'].map((piece, index) => (
          <Animated.Text
            key={index}
            className="absolute text-white opacity-10 text-4xl"
            style={{
              left: `${10 + index * 15}%`,
              top: `${20 + (index % 2) * 60}%`,
              transform: [{ translateY: new Animated.Value(0) }],
              animationDelay: `${index * 0.5}s`,
            }}
          >
            {piece}
          </Animated.Text>
        ))}
      </View>
    </View>
  );
}
