// types/navigation.ts
export type RootStackParamList = {
  GetStarted: undefined;
  SignIn: undefined;
  Local: undefined;
  OTPVerify: { userIdentifier: string };
  Lobby: undefined;
  SplashScreen: undefined;
  Multiplayer: undefined;
  AI: {
    gameId?: string;
    token?: string;
  };
  GameRules: undefined;
  // Settings: undefined;
  Profile: undefined;
  History: undefined;
};
