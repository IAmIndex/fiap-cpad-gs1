import { Activity, Thermometer, Zap } from 'lucide-react-native';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-wagmi-charts';
import { useMission } from '../../context/MissionContext';
import { predictFutureValue } from '../../utils/analytics';

const { width } = Dimensions.get('window');

export default function DashboardsScreen() {
  const { telemetry, isDarkMode } = useMission();
  const styles = createStyles(isDarkMode);

  // Processamento Preditivo para exibição nos Dashboards
  const now = Math.floor(Date.now() / 1000);
  const targetFutureTime = now + 300; // +5 min

  const predTemp = predictFutureValue(telemetry.temperature, targetFutureTime);
  const predEnergy = predictFutureValue(telemetry.energy, targetFutureTime);
  const predLatency = predictFutureValue(telemetry.latency, targetFutureTime);

  // Helper para formatar dados estruturados para biblioteca Wagmi
  const formatChartData = (dataPoints: { timestamp: number; value: number }[]) => {
    if (dataPoints.length === 0) return [{ timestamp: 0, value: 0 }, { timestamp: 1, value: 0 }];
    return dataPoints.map(p => ({ timestamp: p.timestamp, value: p.value }));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      
      {/* COMPORTAMENTO TÉRMICO */}
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Thermometer color="#EF4444" size={20} />
          <Text style={styles.chartTitle}>Gradiente Térmico do Núcleo (°C)</Text>
        </View>
        <LineChart.Provider data={formatChartData(telemetry.temperature)}>
          <LineChart width={width - 48} height={130}>
            <LineChart.Path color="#EF4444" />
            <LineChart.CursorCrosshair color="#EF4444" />
          </LineChart>
        </LineChart.Provider>
        <View style={styles.predictFooter}>
          <Text style={styles.predictText}>Predição Linear (Próximos 5 Minutos): <Text style={styles.predictedVal}>{predTemp.toFixed(1)} °C</Text></Text>
        </View>
      </View>

      {/* EFICIÊNCIA DA BATERIA */}
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Zap color="#10B981" size={20} />
          <Text style={styles.chartTitle}>Decaimento Dinâmico de Carga (%)</Text>
        </View>
        <LineChart.Provider data={formatChartData(telemetry.energy)}>
          <LineChart width={width - 48} height={130}>
            <LineChart.Path color="#10B981" />
            <LineChart.CursorCrosshair color="#10B981" />
          </LineChart>
        </LineChart.Provider>
        <View style={styles.predictFooter}>
          <Text style={styles.predictText}>Autonomia Estimada Restante: <Text style={styles.predictedVal}>{predEnergy.toFixed(1)} %</Text></Text>
        </View>
      </View>

      {/* LATÊNCIA E ESTABILIDADE */}
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Activity color="#3B82F6" size={20} />
          <Text style={styles.chartTitle}>Latência e Jitter de Rede Espacial (ms)</Text>
        </View>
        <LineChart.Provider data={formatChartData(telemetry.latency)}>
          <LineChart width={width - 48} height={130}>
            <LineChart.Path color="#3B82F6" />
            <LineChart.CursorCrosshair color="#3B82F6" />
          </LineChart>
        </LineChart.Provider>
        <View style={styles.predictFooter}>
          <Text style={styles.predictText}>Latência Projetada em Órbita: <Text style={styles.predictedVal}>{predLatency.toFixed(0)} ms</Text></Text>
        </View>
      </View>

    </ScrollView>
  );
}

const createStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDarkMode ? '#0B0F19' : '#F3F4F6', padding: 16 },
  chartContainer: { backgroundColor: isDarkMode ? '#111827' : '#FFFFFF', padding: 16, borderRadius: 14, marginBottom: 20, borderWidth: 1, borderColor: isDarkMode ? '#1E293B' : '#E5E7EB', overflow: 'hidden' },
  chartHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  chartTitle: { fontSize: 14, fontWeight: 'bold', color: isDarkMode ? '#F8FAFC' : '#1F2937' },
  predictFooter: { borderTopWidth: 1, borderTopColor: isDarkMode ? '#1E293B' : '#F3F4F6', paddingTop: 10, marginTop: 10 },
  predictText: { fontSize: 12, color: '#64748B' },
  predictedVal: { color: '#38BDF8', fontWeight: 'bold' }
});
