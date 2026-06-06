import React, { useEffect, useState, useCallback } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CropAreasStackParamList } from '../navigation/types';
import { CropArea, AreaUnit, PolygonPoint } from '../types/CropArea';
import { Farm } from '../types/Farm';
import { cropAreaService } from '../services/cropAreaService';
import { farmService } from '../services/farmService';
import { useAuth } from '../contexts/AuthContext';
import { isRequired, isValidNumber, isValidCoordinate } from '../utils/validators';
import { buildGeoJsonPolygon, geoJsonToString } from '../utils/geoJsonHelpers';
import { theme } from '../constants/theme';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import ScreenContainer from '../components/ScreenContainer';
import LoadingState from '../components/LoadingState';
import MapPolygonPicker from '../components/MapPolygonPicker';

type Props = NativeStackScreenProps<CropAreasStackParamList, 'CropAreaForm'>;

type LocationMode = 'coords' | 'map';

interface FormErrors {
  name?: string;
  crop?: string;
  areaSize?: string;
  farmId?: string;
  latitude?: string;
  longitude?: string;
  polygon?: string;
}

const UNITS: AreaUnit[] = ['ha', 'm2', 'acre'];
const UNIT_LABELS: Record<AreaUnit, string> = { ha: 'Hectare (ha)', m2: 'm²', acre: 'Acre' };

export default function CropAreaFormScreen({ navigation, route }: Props) {
  const cropAreaId = route.params?.cropAreaId;
  const isEditing = !!cropAreaId;
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [crop, setCrop] = useState('');
  const [areaSize, setAreaSize] = useState('');
  const [areaUnit, setAreaUnit] = useState<AreaUnit>('ha');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [description, setDescription] = useState('');
  const [farmId, setFarmId] = useState<number | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [locationMode, setLocationMode] = useState<LocationMode>('coords');
  const [polygonPoints, setPolygonPoints] = useState<PolygonPoint[]>([]);
  const [boundaryGeoJson, setBoundaryGeoJson] = useState<string>('');
  const [polygonConfirmed, setPolygonConfirmed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const farmList = await farmService.getAll(user?.id);
        setFarms(farmList);
        if (farmList.length > 0 && !farmId) {
          setFarmId(farmList[0].id);
        }
        if (isEditing && cropAreaId) {
          const area = await cropAreaService.getById(cropAreaId);
          setName(area.name);
          setCrop(area.crop);
          setAreaSize(area.areaSize.toString());
          setAreaUnit(area.areaUnit);
          setLatitude(area.latitude?.toString() ?? '');
          setLongitude(area.longitude?.toString() ?? '');
          setDescription(area.description ?? '');
          setFarmId(area.farmId);

          if (area.polygonPoints && area.polygonPoints.length > 0) {
            setPolygonPoints(area.polygonPoints);
            setBoundaryGeoJson(area.boundaryGeoJson ?? '');
            setPolygonConfirmed(true);
            setLocationMode('map');
          }
        }
      } catch {
        Alert.alert('Erro', 'Não foi possível carregar os dados.');
        navigation.goBack();
      } finally {
        setInitialLoading(false);
      }
    })();
  }, []);

  function validate(): boolean {
    const e: FormErrors = {};
    if (!isRequired(name)) e.name = 'Nome obrigatório';
    if (!isRequired(crop)) e.crop = 'Cultura obrigatória';
    if (!isRequired(areaSize)) e.areaSize = 'Área obrigatória';
    else if (!isValidNumber(areaSize)) e.areaSize = 'Área inválida';
    if (!farmId) e.farmId = 'Selecione uma fazenda';

    if (locationMode === 'coords') {
      if (!isValidCoordinate(latitude)) e.latitude = 'Latitude inválida';
      if (!isValidCoordinate(longitude)) e.longitude = 'Longitude inválida';
    } else {
      if (polygonConfirmed && polygonPoints.length < 3) {
        e.polygon = 'O polígono precisa ter pelo menos 3 pontos';
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate() || !farmId) return;
    setLoading(true);
    try {
      const payload: Omit<CropArea, 'id'> = {
        name: name.trim(),
        crop: crop.trim(),
        areaSize: parseFloat(areaSize),
        areaUnit,
        farmId,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        description: description.trim() || undefined,
        status: 'HEALTHY',
        polygonPoints: polygonConfirmed ? polygonPoints : undefined,
        boundaryGeoJson: polygonConfirmed ? boundaryGeoJson : undefined,
      };
      if (isEditing && cropAreaId) {
        await cropAreaService.update(cropAreaId, payload);
        Alert.alert('Sucesso', 'Talhão atualizado!');
      } else {
        await cropAreaService.create(payload);
        Alert.alert('Sucesso', 'Talhão cadastrado!');
      }
      navigation.goBack();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o talhão.');
    } finally {
      setLoading(false);
    }
  }

  const handleMapConfirm = useCallback(
    (pts: PolygonPoint[], geoJson: string) => {
      setPolygonPoints(pts);
      setBoundaryGeoJson(geoJson);
      setPolygonConfirmed(true);
      Alert.alert('Área confirmada!', `${pts.length} pontos salvos no formulário.`);
    },
    [],
  );

  if (initialLoading) {
    return (
      <ScreenContainer
        title={isEditing ? 'Editar Talhão' : 'Novo Talhão'}
        onBackPress={() => navigation.goBack()}
        scrollable={false}
      >
        <LoadingState />
      </ScreenContainer>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <ScreenContainer
            title={isEditing ? 'Editar Talhão' : 'Novo Talhão'}
            subtitle="Preencha os dados do talhão."
            onBackPress={() => navigation.goBack()}
            scrollable={false}
          >
            <AppInput label="Nome do talhão" value={name} onChangeText={setName} placeholder="Ex: Talhão A" error={errors.name} />
            <AppInput label="Cultura" value={crop} onChangeText={setCrop} placeholder="Ex: Milho, Soja, Cana" error={errors.crop} />
            <AppInput label="Tamanho da área" value={areaSize} onChangeText={setAreaSize} placeholder="Ex: 4.5" keyboardType="numeric" error={errors.areaSize} />

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Unidade de medida</Text>
              <View style={styles.unitRow}>
                {UNITS.map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={[styles.unitBtn, areaUnit === u && styles.unitBtnActive]}
                    onPress={() => setAreaUnit(u)}
                  >
                    <Text style={[styles.unitLabel, areaUnit === u && styles.unitLabelActive]}>
                      {UNIT_LABELS[u]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Fazenda vinculada</Text>
              {errors.farmId && <Text style={styles.fieldError}>{errors.farmId}</Text>}
              {farms.map((f) => (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.farmBtn, farmId === f.id && styles.farmBtnActive]}
                  onPress={() => setFarmId(f.id)}
                >
                  <Text style={[styles.farmLabel, farmId === f.id && styles.farmLabelActive]}>
                    {f.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Localização do talhão</Text>
              <View style={styles.modeRow}>
                <TouchableOpacity
                  style={[styles.modeBtn, locationMode === 'coords' && styles.modeBtnActive]}
                  onPress={() => setLocationMode('coords')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modeIcon}>📍</Text>
                  <Text style={[styles.modeText, locationMode === 'coords' && styles.modeTextActive]}>
                    Informar lat/lng
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modeBtn, locationMode === 'map' && styles.modeBtnActive]}
                  onPress={() => setLocationMode('map')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modeIcon}>🗺️</Text>
                  <Text style={[styles.modeText, locationMode === 'map' && styles.modeTextActive]}>
                    Desenhar no mapa
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {locationMode === 'coords' && (
              <>
                <AppInput label="Latitude (opcional)" value={latitude} onChangeText={setLatitude} placeholder="Ex: -21.18" keyboardType="numeric" error={errors.latitude} />
                <AppInput label="Longitude (opcional)" value={longitude} onChangeText={setLongitude} placeholder="Ex: -47.82" keyboardType="numeric" error={errors.longitude} />
              </>
            )}

            {locationMode === 'map' && (
              <View style={styles.mapSection}>
                <MapPolygonPicker
                  initialPoints={polygonPoints.length > 0 ? polygonPoints : undefined}
                  onConfirm={handleMapConfirm}
                />

                {errors.polygon && (
                  <Text style={styles.fieldError}>{errors.polygon}</Text>
                )}

                {polygonConfirmed && polygonPoints.length > 0 && (
                  <View style={styles.confirmedCard}>
                    <View style={styles.confirmedHeader}>
                      <Text style={styles.confirmedBadge}>✓ Área confirmada</Text>
                      <Text style={styles.confirmedCount}>
                        {polygonPoints.length} pontos
                      </Text>
                    </View>

                    <View style={styles.pointsList}>
                      {polygonPoints.map((p, idx) => (
                        <View key={idx} style={styles.pointRow}>
                          <View style={styles.pointDot} />
                          <Text style={styles.pointText}>
                            Ponto {idx + 1}: {p.latitude.toFixed(6)}, {p.longitude.toFixed(6)}
                          </Text>
                        </View>
                      ))}
                    </View>

                  </View>
                )}
              </View>
            )}

            <AppInput label="Descrição (opcional)" value={description} onChangeText={setDescription} placeholder="Informações adicionais sobre o talhão..." multiline numberOfLines={3} style={styles.multiline} />

            <AppButton label={isEditing ? 'Salvar alterações' : 'Cadastrar talhão'} onPress={handleSave} loading={loading} />
            <AppButton label="Cancelar" onPress={() => navigation.goBack()} variant="ghost" style={styles.cancelBtn} />
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
  field: { marginBottom: 16 },
  fieldLabel: { color: theme.textMuted, fontSize: 13, fontWeight: '500', marginBottom: 8 },
  fieldError: { color: theme.red, fontSize: 12, marginBottom: 6 },
  unitRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  unitBtn: {
    borderWidth: 1.5,
    borderColor: theme.border,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: theme.surfaceLight,
  },
  unitBtnActive: { borderColor: theme.primary, backgroundColor: `${theme.primary}22` },
  unitLabel: { color: theme.textMuted, fontSize: 13, fontWeight: '500' },
  unitLabelActive: { color: theme.primary, fontWeight: '700' },
  farmBtn: {
    borderWidth: 1.5,
    borderColor: theme.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 6,
    backgroundColor: theme.surfaceLight,
  },
  farmBtnActive: { borderColor: theme.primary, backgroundColor: `${theme.primary}22` },
  farmLabel: { color: theme.textMuted, fontSize: 14 },
  farmLabelActive: { color: theme.primary, fontWeight: '700' },
  multiline: { height: 80, textAlignVertical: 'top' },
  cancelBtn: { marginTop: -8 },

  modeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: theme.border,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 10,
    backgroundColor: theme.surfaceLight,
  },
  modeBtnActive: {
    borderColor: theme.primary,
    backgroundColor: `${theme.primary}18`,
  },
  modeIcon: {
    fontSize: 18,
  },
  modeText: {
    color: theme.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  modeTextActive: {
    color: theme.primary,
  },

  mapSection: {
    marginBottom: 8,
  },

  confirmedCard: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${theme.primary}44`,
    backgroundColor: `${theme.primary}0D`,
    padding: 14,
  },
  confirmedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmedBadge: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  confirmedCount: {
    color: theme.textMuted,
    fontSize: 12,
  },
  pointsList: {
    gap: 4,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.primary,
  },
  pointText: {
    color: theme.textMuted,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
