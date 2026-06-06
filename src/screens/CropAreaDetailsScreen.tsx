import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Sprout,
  Map,
  Activity,
  Thermometer,
  Droplets,
  Layers,
  TriangleAlert,
  Lightbulb,
  MapPin,
  Wifi,
  Plus,
  Trash2,
  X,
  Zap,
  AlertCircle,
  Clock,
  Satellite,
  CloudRain,
} from 'lucide-react-native';
import { CropAreasStackParamList } from '../navigation/types';
import { CropArea } from '../types/CropArea';
import { Sensor, SensorType, SensorStatus } from '../types/Sensor';
import { SensorReading } from '../types/SensorReading';
import { SatelliteData } from '../types/SatelliteData';
import { ClimateAlert } from '../types/ClimateAlert';
import { Recommendation } from '../types/Recommendation';
import { cropAreaService } from '../services/cropAreaService';
import { sensorService } from '../services/sensorService';
import { sensorReadingService } from '../services/sensorReadingService';
import { satelliteDataService } from '../services/satelliteDataService';
import { alertService } from '../services/alertService';
import { recommendationService } from '../services/recommendationService';
import { riskAnalysisService } from '../services/riskAnalysisService';
import { theme } from '../constants/theme';
import {
  getCropAreaStatusColor,
  getCropAreaStatusLabel,
  getNdviColor,
  getAreaUnitLabel,
  getSeverityColor,
  getSeverityLabel,
  getPriorityColor,
  getPriorityLabel,
} from '../utils/statusHelpers';
import { formatRelativeTime, formatDate, formatDateTime } from '../utils/formatDate';
import ScreenContainer from '../components/ScreenContainer';
import StatusBadge from '../components/StatusBadge';
import LoadingState from '../components/LoadingState';

type Props = NativeStackScreenProps<CropAreasStackParamList, 'CropAreaDetails'>;

const SENSOR_TYPE_LABELS: Record<string, string> = {
  SOIL_MOISTURE: 'Umidade do solo',
  TEMPERATURE: 'Temperatura',
  AIR_HUMIDITY: 'Umidade do ar',
  MULTI_SENSOR: 'Estação AgroOrbit',
};

const SENSOR_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  MAINTENANCE: 'Manutenção',
  CRITICAL: 'Falha',
};

const SENSOR_STATUS_COLORS: Record<string, string> = {
  ACTIVE: theme.primary,
  INACTIVE: theme.textMuted,
  MAINTENANCE: theme.yellow,
  CRITICAL: theme.red,
};

const SENSOR_TYPE_OPTIONS: { label: string; value: SensorType }[] = [
  { label: 'Estação AgroOrbit', value: 'MULTI_SENSOR' },
  { label: 'Umidade do solo', value: 'SOIL_MOISTURE' },
  { label: 'Temperatura', value: 'TEMPERATURE' },
  { label: 'Umidade do ar', value: 'AIR_HUMIDITY' },
];

const SENSOR_STATUS_OPTIONS: { label: string; value: SensorStatus }[] = [
  { label: 'Ativo', value: 'ACTIVE' },
  { label: 'Inativo', value: 'INACTIVE' },
  { label: 'Manutenção', value: 'MAINTENANCE' },
];

function getTodayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function CropAreaDetailsScreen({ navigation, route }: Props) {
  const { cropAreaId } = route.params;
  const [area, setArea] = useState<CropArea | null>(null);
  const [loading, setLoading] = useState(true);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [satelliteData, setSatelliteData] = useState<SatelliteData[]>([]);
  const [alerts, setAlerts] = useState<ClimateAlert[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const [showSensorForm, setShowSensorForm] = useState(false);
  const [sensorName, setSensorName] = useState('AgroOrbit Field Station');
  const [sensorType, setSensorType] = useState<SensorType>('MULTI_SENSOR');
  const [sensorStatus, setSensorStatus] = useState<SensorStatus>('ACTIVE');
  const [sensorDate, setSensorDate] = useState(getTodayISO());
  const [savingSensor, setSavingSensor] = useState(false);

  const [savingReading, setSavingReading] = useState(false);

  const [savingNdvi, setSavingNdvi] = useState(false);

  const [analyzingRisk, setAnalyzingRisk] = useState(false);

  const loadSensors = useCallback(async () => {
    try {
      const data = await sensorService.getByCropArea(cropAreaId);
      setSensors(data);
    } catch {
    }
  }, [cropAreaId]);

  const loadReadings = useCallback(async () => {
    try {
      const data = await sensorReadingService.getByCropArea(cropAreaId);
      setReadings(data);
    } catch {
    }
  }, [cropAreaId]);

  const loadSatelliteData = useCallback(async () => {
    try {
      const data = await satelliteDataService.getByCropArea(cropAreaId);
      setSatelliteData(data);
    } catch {
    }
  }, [cropAreaId]);

  const loadRiskData = useCallback(async () => {
    const [areaResult, alertsResult, recsResult] = await Promise.allSettled([
      cropAreaService.getById(cropAreaId),
      alertService.getAll(),
      recommendationService.getByCropArea(cropAreaId),
    ]);

    if (areaResult.status === 'fulfilled') {
      setArea(areaResult.value);
    }

    if (alertsResult.status === 'fulfilled') {
      setAlerts(alertsResult.value.filter((a) => a.cropAreaId === cropAreaId));
    }

    if (recsResult.status === 'fulfilled') {
      setRecommendations(recsResult.value);
    }
  }, [cropAreaId]);

  useEffect(() => {
    (async () => {
      try {
        const data = await cropAreaService.getById(cropAreaId);
        setArea(data);

        const [sensorsResult, readingsResult, satResult, alertsResult, recsResult] = await Promise.allSettled([
          sensorService.getByCropArea(cropAreaId),
          sensorReadingService.getByCropArea(cropAreaId),
          satelliteDataService.getByCropArea(cropAreaId),
          alertService.getAll(),
          recommendationService.getByCropArea(cropAreaId),
        ]);

        if (sensorsResult.status === 'fulfilled') {
          setSensors(sensorsResult.value);
        }
        if (readingsResult.status === 'fulfilled') {
          setReadings(readingsResult.value);
        }
        if (satResult.status === 'fulfilled') {
          setSatelliteData(satResult.value);
        }
        if (alertsResult.status === 'fulfilled') {
          setAlerts(alertsResult.value.filter((a) => a.cropAreaId === cropAreaId));
        }
        if (recsResult.status === 'fulfilled') {
          setRecommendations(recsResult.value);
        }
      } catch {
        Alert.alert('Erro', 'Não foi possível carregar os detalhes do talhão.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    })();
  }, [cropAreaId, navigation]);

  function openSensorForm() {
    setSensorName('AgroOrbit Field Station');
    setSensorType('MULTI_SENSOR');
    setSensorStatus('ACTIVE');
    setSensorDate(getTodayISO());
    setShowSensorForm(true);
  }

  async function handleCreateSensor() {
    if (!sensorName.trim()) {
      Alert.alert('Erro', 'Informe o nome do sensor.');
      return;
    }
    setSavingSensor(true);
    try {
      await sensorService.create({
        name: sensorName.trim(),
        type: sensorType,
        status: sensorStatus,
        installedAt: sensorDate,
        cropAreaId,
      });
      setShowSensorForm(false);
      await loadSensors();
      Alert.alert('Sucesso', 'Sensor cadastrado com sucesso.');
    } catch {
      Alert.alert('Erro', 'Não foi possível cadastrar o sensor.');
    } finally {
      setSavingSensor(false);
    }
  }

  function handleDeleteSensor(sensor: Sensor) {
    Alert.alert(
      'Excluir sensor',
      `Deseja excluir "${sensor.name}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await sensorService.remove(sensor.id);
              setSensors((prev) => prev.filter((item) => item.id !== sensor.id));
              Alert.alert('Sucesso', 'Sensor excluído.');
            } catch {
              Alert.alert(
                'Erro',
                'Não foi possível excluir o sensor. Tente novamente em alguns instantes.',
              );
            }
          },
        },
      ],
    );
  }

  function generateSimulatedIoTReading() {
    const temperature = +(24.0 + Math.random() * 14.0).toFixed(1);
    const airHumidity = +(25.0 + Math.random() * 50.0).toFixed(1);
    const soilMoisture = +(15.0 + Math.random() * 50.0).toFixed(1);
    const manualAlert = temperature >= 35 || airHumidity <= 30 || soilMoisture <= 25;
    return { temperature, airHumidity, soilMoisture, manualAlert };
  }

  async function handleRegisterReading() {
    if (sensors.length === 0) {
      Alert.alert('Atenção', 'Cadastre um sensor antes de registrar leituras.');
      return;
    }
    const activeSensor = sensors.find((s) => s.status === 'ACTIVE');
    const chosenSensor = activeSensor ?? sensors[0];

    const simulated = generateSimulatedIoTReading();

    setSavingReading(true);
    try {
      await sensorReadingService.create({
        sensorId: chosenSensor.id,
        temperature: simulated.temperature,
        airHumidity: simulated.airHumidity,
        soilMoisture: simulated.soilMoisture,
        manualAlert: simulated.manualAlert,
        readingDate: new Date().toISOString(),
      });
      await loadReadings();
      Alert.alert('Sucesso', 'Coleta IoT gerada com sucesso.');
    } catch {
      Alert.alert('Erro', 'Não foi possível gerar a coleta IoT.');
    } finally {
      setSavingReading(false);
    }
  }

  function generateSimulatedNdviData() {
    const ndviMean = +(0.30 + Math.random() * 0.48).toFixed(2);
    const delta1 = +(0.08 + Math.random() * 0.08).toFixed(2);
    const delta2 = +(0.08 + Math.random() * 0.08).toFixed(2);
    const ndviMin = +Math.max(0, ndviMean - delta1).toFixed(2);
    const ndviMax = +Math.min(1, ndviMean + delta2).toFixed(2);
    const surfaceTemperature = +(24.0 + Math.random() * 16.0).toFixed(1);
    const cloudCoverage = +(5.0 + Math.random() * 30.0).toFixed(1);
    return { ndviMean, ndviMin, ndviMax, surfaceTemperature, cloudCoverage };
  }

  async function handleUpdateNdvi() {
    const sim = generateSimulatedNdviData();
    setSavingNdvi(true);
    try {
      await satelliteDataService.create({
        cropAreaId,
        source: 'SENTINEL_HUB_STATISTICAL_API',
        ndviMean: sim.ndviMean,
        ndviMin: sim.ndviMin,
        ndviMax: sim.ndviMax,
        surfaceTemperature: sim.surfaceTemperature,
        cloudCoverage: sim.cloudCoverage,
        capturedAt: getTodayISO(),
      });
      await loadSatelliteData();
      Alert.alert('Sucesso', 'NDVI gerado com sucesso.');
    } catch {
      Alert.alert('Erro', 'Não foi possível gerar o NDVI.');
    } finally {
      setSavingNdvi(false);
    }
  }

  async function handleAnalyzeRisk() {
    if (!latestReading) {
      Alert.alert('Atenção', 'Gere uma coleta IoT antes de iniciar a análise.');
      return;
    }

    if (!latestSatellite) {
      Alert.alert('Atenção', 'Gere um dado NDVI antes de iniciar a análise.');
      return;
    }

    setAnalyzingRisk(true);
    try {
      const result = await riskAnalysisService.analyze(cropAreaId);

      await Promise.allSettled([
        loadRiskData(),
        loadReadings(),
        loadSatelliteData(),
      ]);

      const hasGeneratedAlert = result.alertGenerated === true;
      Alert.alert(
        'Análise concluída',
        hasGeneratedAlert
          ? 'A análise identificou risco e gerou um alerta/recomendação.'
          : 'Nenhum risco crítico foi identificado para este talhão.',
      );
    } catch {
      Alert.alert('Erro', 'Não foi possível iniciar a análise de risco.');
    } finally {
      setAnalyzingRisk(false);
    }
  }

  if (loading || !area) {
    return (
      <ScreenContainer title="Detalhes do Talhão" onBackPress={() => navigation.goBack()} scrollable={false}>
        <LoadingState />
      </ScreenContainer>
    );
  }

  const statusColor = getCropAreaStatusColor(area.status);

  const latestReading = readings.length > 0
    ? readings.reduce((latest, r) => (r.readingDate > latest.readingDate ? r : latest), readings[0])
    : null;

  const latestSatellite = satelliteData.length > 0
    ? satelliteData.reduce((latest, s) => {
        if (s.capturedAt > latest.capturedAt) return s;
        if (s.capturedAt === latest.capturedAt && s.id > latest.id) return s;
        return latest;
      }, satelliteData[0])
    : null;

  const ndviValue = latestSatellite?.ndviMean ?? area.ndvi;
  const ndviColor = ndviValue != null ? getNdviColor(ndviValue) : theme.textMuted;

  const openAlerts = alerts.filter((a) => a.status === 'OPEN');

  const priorityOrder: Record<string, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  const mainRecommendation = recommendations.length > 0
    ? [...recommendations].sort((a, b) => (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99))[0]
    : null;

  return (
    <ScreenContainer
      title={area.name}
      subtitle={area.crop}
      onBackPress={() => navigation.goBack()}
    >
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Informações Gerais</Text>
          <StatusBadge
            label={getCropAreaStatusLabel(area.status)}
            color={statusColor}
          />
        </View>
        <View style={styles.infoGrid}>
          <InfoItem icon={<Sprout size={16} color={theme.primary} />} label="Cultura" value={area.crop} />
          <InfoItem icon={<Map size={16} color={theme.primary} />} label="Área" value={`${area.areaSize} ${getAreaUnitLabel(area.areaUnit)}`} />
          {area.lastReadingAt && (
            <InfoItem icon={<Activity size={16} color={theme.textMuted} />} label="Última leitura" value={formatRelativeTime(area.lastReadingAt)} />
          )}
          {area.description && (
            <InfoItem icon={<Layers size={16} color={theme.textMuted} />} label="Descrição" value={area.description} />
          )}
        </View>
      </View>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Wifi size={16} color={theme.primary} />
          <Text style={[styles.cardTitle, { flex: 1 }]}>Sensores do Talhão</Text>
          <TouchableOpacity style={styles.addSensorBtn} onPress={openSensorForm} activeOpacity={0.8}>
            <Plus size={14} color={theme.background} />
            <Text style={styles.addSensorLabel}>Cadastrar</Text>
          </TouchableOpacity>
        </View>

        {sensors.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum sensor cadastrado para este talhão.</Text>
        ) : (
          sensors.map((sensor) => (
            <View key={sensor.id} style={styles.sensorCard}>
              <View style={styles.sensorInfo}>
                <Text style={styles.sensorName}>{sensor.name}</Text>
                <View style={styles.sensorMeta}>
                  <Text style={styles.sensorType}>{SENSOR_TYPE_LABELS[sensor.type] ?? sensor.type}</Text>
                  <View style={styles.sensorDot} />
                  <StatusBadge
                    label={SENSOR_STATUS_LABELS[sensor.status] ?? sensor.status}
                    color={SENSOR_STATUS_COLORS[sensor.status] ?? theme.textMuted}
                    size="sm"
                  />
                </View>
                {sensor.installedAt && (
                  <Text style={styles.sensorDate}>Instalado em {formatDate(sensor.installedAt)}</Text>
                )}
              </View>
              <TouchableOpacity style={styles.sensorDeleteBtn} onPress={() => handleDeleteSensor(sensor)}>
                <Trash2 size={16} color={theme.red} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Satellite size={16} color={theme.primary} />
          <Text style={[styles.cardTitle, { flex: 1 }]}>Dados NDVI</Text>
          <TouchableOpacity
            style={[styles.addSensorBtn, savingNdvi && { opacity: 0.6 }]}
            onPress={handleUpdateNdvi}
            disabled={savingNdvi}
            activeOpacity={0.8}
          >
            <Activity size={14} color={theme.background} />
            <Text style={styles.addSensorLabel}>{savingNdvi ? 'Gerando...' : 'Gerar NDVI'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.iotSubtitle}>O NDVI representa o vigor da vegetação do talhão. Nesta versão, a análise é simulada e registrada na API.</Text>

        {latestSatellite ? (
          <View>
            <View style={styles.ndviRow}>
              <View style={styles.ndviMain}>
                <Activity size={28} color={ndviColor} />
                <Text style={[styles.ndviValue, { color: ndviColor }]}>{latestSatellite.ndviMean.toFixed(2)}</Text>
                <Text style={styles.ndviLabel}>NDVI médio</Text>
              </View>
              <View style={styles.ndviRange}>
                <View style={styles.ndviRangeItem}>
                  <Text style={styles.ndviRangeLabel}>Mínimo</Text>
                  <Text style={[styles.ndviRangeValue, { color: theme.red }]}>
                    {latestSatellite.ndviMin != null ? latestSatellite.ndviMin.toFixed(2) : '—'}
                  </Text>
                </View>
                <View style={styles.ndviRangeItem}>
                  <Text style={styles.ndviRangeLabel}>Máximo</Text>
                  <Text style={[styles.ndviRangeValue, { color: theme.primary }]}>
                    {latestSatellite.ndviMax != null ? latestSatellite.ndviMax.toFixed(2) : '—'}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.ndviExtraGrid}>
              {latestSatellite.surfaceTemperature != null && (
                <View style={styles.ndviExtraItem}>
                  <Thermometer size={14} color={theme.orange} />
                  <Text style={styles.ndviExtraLabel}>Superfície</Text>
                  <Text style={styles.ndviExtraValue}>{latestSatellite.surfaceTemperature}°C</Text>
                </View>
              )}
              {latestSatellite.cloudCoverage != null && (
                <View style={styles.ndviExtraItem}>
                  <CloudRain size={14} color={theme.blue} />
                  <Text style={styles.ndviExtraLabel}>Nuvens</Text>
                  <Text style={styles.ndviExtraValue}>{latestSatellite.cloudCoverage}%</Text>
                </View>
              )}
              <View style={styles.ndviExtraItem}>
                <Clock size={14} color={theme.textMuted} />
                <Text style={styles.ndviExtraLabel}>Captura</Text>
                <Text style={styles.ndviExtraValue}>{formatDate(latestSatellite.capturedAt)}</Text>
              </View>
            </View>
          </View>
        ) : (
          <Text style={styles.emptyText}>Nenhum dado NDVI registrado para este talhão.</Text>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Zap size={16} color={theme.primary} />
          <Text style={[styles.cardTitle, { flex: 1 }]}>Dados IoT (ESP32)</Text>
          <TouchableOpacity
            style={[styles.addSensorBtn, savingReading && { opacity: 0.6 }]}
            onPress={handleRegisterReading}
            disabled={savingReading}
            activeOpacity={0.8}
          >
            <Plus size={14} color={theme.background} />
            <Text style={styles.addSensorLabel}>{savingReading ? 'Gerando...' : 'Gerar coleta'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.iotSubtitle}>Gere uma coleta simulada do sensor instalado neste talhão e salve na API.</Text>
        {latestReading ? (
          <View>
            <View style={styles.iotGrid}>
              <IoTItem
                icon={<Thermometer size={20} color={theme.orange} />}
                label="Temperatura"
                value={latestReading.temperature != null ? `${latestReading.temperature}°C` : '—'}
                color={latestReading.temperature != null && latestReading.temperature > 32 ? theme.red : theme.text}
              />
              <IoTItem
                icon={<Droplets size={20} color={theme.blue} />}
                label="Umidade do ar"
                value={latestReading.airHumidity != null ? `${latestReading.airHumidity}%` : '—'}
                color={latestReading.airHumidity != null && latestReading.airHumidity < 35 ? theme.yellow : theme.text}
              />
              <IoTItem
                icon={<Layers size={20} color={theme.primary} />}
                label="Umidade do solo"
                value={latestReading.soilMoisture != null ? `${latestReading.soilMoisture}%` : '—'}
                color={latestReading.soilMoisture != null && latestReading.soilMoisture < 25 ? theme.red : theme.text}
              />
            </View>
            <View style={styles.iotFooter}>
              <Clock size={12} color={theme.textMuted} />
              <Text style={styles.iotTimestamp}>{formatDateTime(latestReading.readingDate)}</Text>
              {latestReading.manualAlert && (
                <View style={styles.manualAlertBadge}>
                  <AlertCircle size={11} color={theme.red} />
                  <Text style={styles.manualAlertText}>Alerta manual</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <Text style={styles.emptyText}>Nenhuma leitura IoT registrada para este talhão.</Text>
        )}
      </View>

      {(area.latitude || area.longitude) && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Localização</Text>
          <View style={styles.locationBox}>
            <MapPin size={24} color={theme.primary} />
            <View>
              <Text style={styles.coordText}>
                Lat: {area.latitude?.toFixed(4)} | Lon: {area.longitude?.toFixed(4)}
              </Text>
              <Text style={styles.coordSub}>Coordenadas GPS do talhão</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <TriangleAlert size={16} color={openAlerts.length > 0 ? theme.yellow : theme.primary} />
          <Text style={[styles.cardTitle, { flex: 1 }]}>Análise de Risco</Text>
          <TouchableOpacity
            style={[styles.addSensorBtn, analyzingRisk && { opacity: 0.6 }]}
            onPress={handleAnalyzeRisk}
            disabled={analyzingRisk}
            activeOpacity={0.8}
          >
            <Activity size={14} color={theme.background} />
            <Text style={styles.addSensorLabel}>{analyzingRisk ? 'Analisando...' : 'Iniciar análise'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.iotSubtitle}>Use os dados mais recentes de NDVI e IoT para gerar uma análise de risco pela API.</Text>
        {openAlerts.length === 0 ? (
          <Text style={styles.noRisk}>Nenhum risco identificado para este talhão.</Text>
        ) : (
          openAlerts.map((alert) => (
            <View key={alert.id} style={styles.riskItem}>
              <View style={[styles.riskDot, { backgroundColor: getSeverityColor(alert.severity) }]} />
              <View style={styles.riskContent}>
                <Text style={styles.riskText}>{alert.title || alert.description || 'Alerta'}</Text>
                <View style={styles.riskMeta}>
                  <StatusBadge
                    label={getSeverityLabel(alert.severity)}
                    color={getSeverityColor(alert.severity)}
                    size="sm"
                  />
                  <Text style={styles.riskDate}>{formatDate(alert.createdAt)}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={[styles.card, styles.recCard]}>
        <View style={styles.cardHeader}>
          <Lightbulb size={16} color={theme.primary} />
          <Text style={styles.cardTitle}>Recomendação Principal</Text>
        </View>
        {mainRecommendation ? (
          <View>
            <Text style={styles.recTitle}>{mainRecommendation.title}</Text>
            {mainRecommendation.description && (
              <Text style={styles.recText}>{mainRecommendation.description}</Text>
            )}
            <StatusBadge
              label={getPriorityLabel(mainRecommendation.priority)}
              color={getPriorityColor(mainRecommendation.priority)}
              size="sm"
            />
          </View>
        ) : (
          <Text style={styles.emptyText}>Nenhuma recomendação disponível para este talhão.</Text>
        )}
      </View>
      <Modal visible={showSensorForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cadastrar Sensor</Text>
              <TouchableOpacity onPress={() => setShowSensorForm(false)}>
                <X size={22} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Nome do sensor</Text>
              <TextInput
                style={styles.textInput}
                value={sensorName}
                onChangeText={setSensorName}
                placeholder="Ex: AgroOrbit Field Station"
                placeholderTextColor={theme.textMuted}
              />

              <Text style={styles.fieldLabel}>Tipo</Text>
              <View style={styles.optionsRow}>
                {SENSOR_TYPE_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.optionChip, sensorType === opt.value && styles.optionChipActive]}
                    onPress={() => setSensorType(opt.value)}
                  >
                    <Text style={[styles.optionChipText, sensorType === opt.value && styles.optionChipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Status</Text>
              <View style={styles.optionsRow}>
                {SENSOR_STATUS_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.optionChip, sensorStatus === opt.value && styles.optionChipActive]}
                    onPress={() => setSensorStatus(opt.value)}
                  >
                    <Text style={[styles.optionChipText, sensorStatus === opt.value && styles.optionChipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Data de instalação (AAAA-MM-DD)</Text>
              <TextInput
                style={styles.textInput}
                value={sensorDate}
                onChangeText={setSensorDate}
                placeholder="2026-06-03"
                placeholderTextColor={theme.textMuted}
                keyboardType="numbers-and-punctuation"
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowSensorForm(false)}>
                <Text style={styles.cancelBtnLabel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, savingSensor && { opacity: 0.6 }]}
                onPress={handleCreateSensor}
                disabled={savingSensor}
                activeOpacity={0.8}
              >
                <Text style={styles.saveBtnLabel}>{savingSensor ? 'Salvando...' : 'Cadastrar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScreenContainer>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      {icon}
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function IoTItem({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <View style={styles.iotItem}>
      <View style={styles.iotIcon}>{icon}</View>
      <Text style={styles.iotLabel}>{label}</Text>
      <Text style={[styles.iotValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    marginBottom: 10,
    gap: 12,
  },
  recCard: { borderColor: `${theme.primary}44` },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { color: theme.text, fontSize: 14, fontWeight: '700' },
  infoGrid: { gap: 10 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoLabel: { color: theme.textMuted, fontSize: 12 },
  infoValue: { color: theme.text, fontSize: 14, fontWeight: '600' },
  ndviRow: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  ndviMain: { alignItems: 'center', gap: 4 },
  ndviValue: { fontSize: 32, fontWeight: '900' },
  ndviLabel: { color: theme.textMuted, fontSize: 12 },
  ndviRange: { flex: 1, gap: 8 },
  ndviRangeItem: { flexDirection: 'row', justifyContent: 'space-between' },
  ndviRangeLabel: { color: theme.textMuted, fontSize: 13 },
  ndviRangeValue: { fontSize: 13, fontWeight: '700' },
  iotGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  iotItem: { alignItems: 'center', gap: 6 },
  iotIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: theme.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  iotLabel: { color: theme.textMuted, fontSize: 11, textAlign: 'center' },
  iotValue: { fontSize: 16, fontWeight: '800' },
  locationBox: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.surfaceLight, borderRadius: 10, padding: 12 },
  coordText: { color: theme.text, fontSize: 13, fontWeight: '600' },
  coordSub: { color: theme.textMuted, fontSize: 12 },
  noRisk: { color: theme.primary, fontSize: 14, fontWeight: '500' },
  riskItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 4 },
  riskDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6, flexShrink: 0 },
  riskContent: { flex: 1, gap: 4 },
  riskText: { color: theme.text, fontSize: 13, flex: 1 },
  riskMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  riskDate: { color: theme.textMuted, fontSize: 11 },
  recTitle: { color: theme.text, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  recText: { color: theme.text, fontSize: 14, lineHeight: 22, marginBottom: 8 },
  emptyText: {
    color: theme.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 16,
    fontStyle: 'italic',
  },
  addSensorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.primary,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  addSensorLabel: {
    color: theme.background,
    fontSize: 12,
    fontWeight: '700',
  },
  sensorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surfaceLight,
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  sensorInfo: {
    flex: 1,
    gap: 3,
  },
  sensorName: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '700',
  },
  sensorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sensorType: {
    color: theme.textMuted,
    fontSize: 12,
  },
  sensorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.textMuted,
  },
  sensorDate: {
    color: theme.textMuted,
    fontSize: 11,
  },
  sensorDeleteBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: `${theme.red}15`,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '800',
  },
  modalBody: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 14,
  },
  textInput: {
    backgroundColor: theme.surfaceLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    color: theme.text,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.surfaceLight,
  },
  optionChipActive: {
    borderColor: theme.primary,
    backgroundColor: `${theme.primary}22`,
  },
  optionChipText: {
    color: theme.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  optionChipTextActive: {
    color: theme.primary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnLabel: {
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: theme.primary,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnLabel: {
    color: theme.background,
    fontSize: 14,
    fontWeight: '700',
  },
  iotFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  iotTimestamp: {
    color: theme.textMuted,
    fontSize: 11,
    flex: 1,
  },
  manualAlertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${theme.red}18`,
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  manualAlertText: {
    color: theme.red,
    fontSize: 10,
    fontWeight: '700',
  },
  iotSubtitle: {
    color: theme.textMuted,
    fontSize: 12,
    marginTop: -4,
  },
  ndviExtraGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  ndviExtraItem: {
    alignItems: 'center',
    gap: 4,
  },
  ndviExtraLabel: {
    color: theme.textMuted,
    fontSize: 10,
  },
  ndviExtraValue: {
    color: theme.text,
    fontSize: 13,
    fontWeight: '700',
  },
});
