import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

export type FarmsStackParamList = {
  FarmsScreen: undefined;
  FarmForm: { farmId?: number } | undefined;
};

export type CropAreasStackParamList = {
  CropAreasScreen:
    | {
        mode?: 'all' | 'farm';
        farmId?: number;
        farmName?: string;
      }
    | undefined;
  CropAreaForm: { cropAreaId?: number } | undefined;
  CropAreaDetails: { cropAreaId: number };
};

export type DrawerParamList = {
  Dashboard: undefined;
  Fazendas: NavigatorScreenParams<FarmsStackParamList>;
  Talhões: NavigatorScreenParams<CropAreasStackParamList>;
  Alertas: undefined;
  Recomendações: undefined;
  Perfil: undefined;
};

export type RootParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<DrawerParamList>;
};
