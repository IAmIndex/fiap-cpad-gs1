import { AlertTriangle, Battery, CheckCircle, Cpu, Radio } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMission } from '../../context/MissionContext';

export default function ControlCenterScreen() {
  const { telemetry, alerts, missions, activeMissionId, isDarkMode } = useMission();

  const currentMission = missions.find(m => m.id === activeMissionId);
  
  const latestTemp = telemetry.temperature[telemetry.temperature.length - 1]?.value ?? '--';
  const latestEnergy = telemetry.energy[telemetry.energy.length - 1]?.value ?? '--';
  const latestLatency = telemetry.latency[telemetry.latency.length - 1]?.value ?? '--';

  const styles = createStyles(isDarkMode);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={styles.headerCard}>
        <Text style={styles.subtitle}>Missão Operando em Órbita</Text>
        <Text style={styles.title}>{currentMission ? currentMission.name : 'Nenhuma Missão Ativa'}</Text>
        <View style={styles.badge}><Text style={styles.badgeText}>ÓRBITA: {currentMission?.orbitType}</Text></View>
      </View>

      <Text style={styles.sectionTitle}>Telemetria Instantânea</Text>
      <View style={styles.grid}>
        <View style={styles.card}>
          <Cpu color="#EF4444" size={24} />
          <Text style={styles.cardLabel}>Núcleo Térmico</Text>
          <Text style={styles.cardValue}>{latestTemp}°C</Text>
        </View>
        <View style={styles.card}>
          <Battery color="#10B981" size={24} />
          <Text style={styles.cardLabel}>Subsistema de Carga</Text>
          <Text style={styles.cardValue}>{latestEnergy}%</Text>
        </View>
        <View style={styles.card}>
          <Radio color="#3B82F6" size={24} />
          <Text style={styles.cardLabel}>Latência Uplink</Text>
          <Text style={styles.cardValue}>{latestLatency}ms</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Log de Eventos e Alertas Críticos ({alerts.length})</Text>
      {alerts.length === 0 ? (
        <View style={styles.emptyAlert}>
          <CheckCircle color="#10B981" size={32} />
          <Text style={styles.emptyText}>Sistemas nominais. Nenhuma anomalia detectada em órbita.</Text>
        </View>
      ) : (
        alerts.map((alert) => (
          <View key={alert.id} style={[styles.alertItem, alert.type === 'CRÍTICO' ? styles.alertCrit : styles.alertPred]}>
            <View style={styles.alertHeaderRow}>
              <View style={styles.alertBadgeRow}>
                <AlertTriangle color={alert.type === 'CRÍTICO' ? '#EF4444' : '#F59E0B'} size={16} />
                <Text style={styles.alertType}>{alert.type}</Text>
              </View>
              <Text style={styles.alertTime}>{alert.timestamp}</Text>
            </View>
            <Text style={styles.alertMsg}>{alert.message}</Text>
            <Text style={styles.alertMeta}>Módulo: {alert.metric} | Redundância de Missão: {alert.missionName}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const createStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDarkMode ? '#0B0F19' : '#F3F4F6', padding: 16 },
  headerCard: { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF', padding: 20, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: isDarkMode ? '#334155' : '#E5E7EB' },
  title: { fontSize: 24, fontWeight: 'bold', color: isDarkMode ? '#F8FAFC' : '#1F2937', marginVertical: 4 },
  subtitle: { fontSize: 12, color: '#38BDF8', fontWeight: '600', textTransform: 'uppercase' },
  badge: { backgroundColor: '#38BDF820', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 6 },
  badgeText: { color: '#38BDF8', fontSize: 10, fontWeight: 'bold' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: isDarkMode ? '#94A3B8' : '#4B5563', marginBottom: 12, marginTop: 10 },
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  card: { backgroundColor: isDarkMode ? '#111827' : '#FFFFFF', width: '31%', padding: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: isDarkMode ? '#1E293B' : '#E5E7EB' },
  cardLabel: { fontSize: 10, color: '#64748B', marginTop: 8, textAlign: 'center' },
  cardValue: { fontSize: 16, fontWeight: 'bold', color: isDarkMode ? '#F8FAFC' : '#1F2937', marginTop: 4 },
  emptyAlert: { padding: 24, alignItems: 'center', backgroundColor: isDarkMode ? '#111827' : '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: isDarkMode ? '#1E293B' : '#E5E7EB' },
  emptyText: { color: '#64748B', fontSize: 13, textAlign: 'center', marginTop: 10 },
  alertItem: { padding: 14, borderRadius: 10, marginBottom: 10, borderWidth: 1 },
  alertCrit: { backgroundColor: '#EF444410', borderColor: '#EF444440' },
  alertPred: { backgroundColor: '#F59E0B10', borderColor: '#F59E0B40' },
  alertHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alertBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  alertType: { fontWeight: 'bold', fontSize: 12, color: isDarkMode ? '#F8FAFC' : '#1F2937' },
  alertTime: { fontSize: 11, color: '#64748B' },
  alertMsg: { fontSize: 13, color: isDarkMode ? '#E2E8F0' : '#374151', marginVertical: 6 },
  alertMeta: { fontSize: 10, color: '#64748B' }
});
