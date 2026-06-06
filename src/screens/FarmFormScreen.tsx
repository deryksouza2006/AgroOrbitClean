import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FarmsStackParamList } from '../navigation/types';
import { Farm } from '../types/Farm';
import { farmService } from '../services/farmService';
import { isRequired, isValidCoordinate } from '../utils/validators';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../constants/theme';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import ScreenContainer from '../components/ScreenContainer';
import LoadingState from '../components/LoadingState';

type Props = NativeStackScreenProps<FarmsStackParamList, 'FarmForm'>;

interface FormErrors {
  name?: string;
  responsibleName?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: string;
  longitude?: string;
}

export default function FarmFormScreen({ navigation, route }: Props) {
  const farmId = route.params?.farmId;
  const isEditing = !!farmId;
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [responsibleName, setResponsibleName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('Brasil');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  useEffect(() => {
    if (!isEditing || !farmId) return;
    (async () => {
      try {
        const farm = await farmService.getById(farmId);
        setName(farm.name);
        setResponsibleName(farm.responsibleName);
        setCity(farm.city);
        setState(farm.state);
        setCountry(farm.country);
        setLatitude(farm.latitude?.toString() ?? '');
        setLongitude(farm.longitude?.toString() ?? '');
      } catch {
        Alert.alert('Erro', 'Não foi possível carregar os dados da fazenda.');
        navigation.goBack();
      } finally {
        setInitialLoading(false);
      }
    })();
  }, [farmId, isEditing, navigation]);

  function validate(): boolean {
    const e: FormErrors = {};
    if (!isRequired(name)) e.name = 'Nome obrigatório';
    if (!isRequired(responsibleName)) e.responsibleName = 'Responsável obrigatório';
    if (!isRequired(city)) e.city = 'Cidade obrigatória';
    if (!isRequired(state)) e.state = 'Estado obrigatório';
    if (!isRequired(country)) e.country = 'País obrigatório';
    if (!isValidCoordinate(latitude)) e.latitude = 'Latitude inválida';
    if (!isValidCoordinate(longitude)) e.longitude = 'Longitude inválida';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload: Omit<Farm, 'id'> = {
        name: name.trim(),
        responsibleName: responsibleName.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        status: 'HEALTHY',
      };

      if (isEditing && farmId) {
        await farmService.update(farmId, payload, user?.id ?? 0);
        Alert.alert('Sucesso', 'Fazenda atualizada com sucesso!');
      } else {
        await farmService.create(payload, user?.id ?? 0);
        Alert.alert('Sucesso', 'Fazenda cadastrada com sucesso!');
      }
      navigation.goBack();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a fazenda. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) {
    return (
      <ScreenContainer
        title={isEditing ? 'Editar Fazenda' : 'Nova Fazenda'}
        onBackPress={() => navigation.goBack()}
      >
        <LoadingState />
      </ScreenContainer>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.kav}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ScreenContainer
            title={isEditing ? 'Editar Fazenda' : 'Nova Fazenda'}
            subtitle={isEditing ? 'Atualize os dados da fazenda.' : 'Preencha os dados da nova fazenda.'}
            onBackPress={() => navigation.goBack()}
            scrollable={false}
          >
            <AppInput label="Nome da fazenda" value={name} onChangeText={setName} placeholder="Ex: Fazenda Sol Nascente" error={errors.name} />
            <AppInput label="Nome do responsável" value={responsibleName} onChangeText={setResponsibleName} placeholder="Ex: Daniel Rural" error={errors.responsibleName} />
            <AppInput label="Cidade" value={city} onChangeText={setCity} placeholder="Ex: Ribeirão Preto" error={errors.city} />
            <AppInput label="Estado" value={state} onChangeText={setState} placeholder="Ex: SP" maxLength={2} autoCapitalize="characters" error={errors.state} />
            <AppInput label="País" value={country} onChangeText={setCountry} placeholder="Ex: Brasil" error={errors.country} />
            <AppInput label="Latitude (opcional)" value={latitude} onChangeText={setLatitude} placeholder="Ex: -21.1767" keyboardType="numeric" error={errors.latitude} />
            <AppInput label="Longitude (opcional)" value={longitude} onChangeText={setLongitude} placeholder="Ex: -47.8208" keyboardType="numeric" error={errors.longitude} />

            <AppButton
              label={isEditing ? 'Salvar alterações' : 'Cadastrar fazenda'}
              onPress={handleSave}
              loading={loading}
            />
            <AppButton
              label="Cancelar"
              onPress={() => navigation.goBack()}
              variant="ghost"
              style={styles.cancelBtn}
            />
          </ScreenContainer>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  kav: { flex: 1 },
  scroll: { flexGrow: 1 },
  cancelBtn: { marginTop: -8 },
});
