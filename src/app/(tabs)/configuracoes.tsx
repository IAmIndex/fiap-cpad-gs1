import { Moon, Save, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMission } from '../../context/MissionContext';

export default function SettingsScreen() {
  const { thresholds, updateThresholds, isDarkMode, toggleDarkMode, clearAlertLogs } = useMission();

  const [temp, setTemp] = useState(thresholds.maxTemperature.toString());
  const [energy, setEnergy] = useState(thresholds.minEnergy.toString());
  const [latency, setLatency] = useState(thresholds.maxLatency.toString());
  const [success, setSuccess] = useState(false);

  const styles = createStyles(isDarkMode);

  const handleSave = async () => {
    const numericTemp = parseFloat(temp);
    const numericEnergy = parseFloat(energy);
    const numericLatency = parseFloat(latency);

    if (isNaN(numericTemp) || isNaN(numericEnergy) || isNaN(numericLatency)) {
      Alert.alert('Erro de Entrada', 'Garanta que todos os limiares informados possuam formato numérico.');
      return;
    }

    await updateThresholds({
      maxTemperature: numericTemp,
      minEnergy: numericEnergy,
      maxLatency: numericLatency
    });

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.rowToggle}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Moon color={isDarkMode ? '#38BDF8' : '#64748B'} size={22} />
            <View>
              <Text style={styles.cardTitle}>Modo escuro</Text>
              <Text style={styles.desc}>Ativa ou desativa o modo escuro</Text>
            </View>
          </View>
          <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={[styles.cardTitle, { marginBottom: 16 }]}>Configurar Limiares de Alerta do Módulo Técnico</Text>

        <Text style={styles.label}>Temperatura Máxima Crítica (°C)</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={temp} onChangeText={setTemp} />

        <Text style={styles.label}>Nível Mínimo Seguro de Energia (%)</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={energy} onChangeText={setEnergy} />

        <Text style={styles.label}>Latência Limite de Comunicação (ms)</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={latency} onChangeText={setLatency} />

        {success && <Text style={styles.successText}>Limiares de órbita reconfigurados com sucesso!</Text>}

        <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
          <Save color="#0B0F19" size={18} />
          <Text style={styles.btnSaveTxt}>Gravar Alterações de Escopo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Manutenção de Memória</Text>
        <Text style={styles.desc}>Zerar histórico de anomalias salvas localmente no dispositivo.</Text>
        <TouchableOpacity style={styles.btnClear} onPress={clearAlertLogs}>
          <Trash2 color="#EF4444" size={16} />
          <Text style={styles.btnClearTxt}>Limpar Histórico de Alertas</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const createStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDarkMode ? '#0B0F19' : '#F3F4F6', padding: 16 },
  card: { backgroundColor: isDarkMode ? '#111827' : '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: isDarkMode ? '#1E293B' : '#E5E7EB' },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: isDarkMode ? '#F8FAFC' : '#1F2937' },
  desc: { fontSize: 11, color: '#64748B', marginTop: 2 },
  rowToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 12, color: '#94A3B8', fontWeight: '500', marginTop: 12 },
  input: { backgroundColor: isDarkMode ? '#1E293B' : '#F9FAFB', color: isDarkMode ? '#F8FAFC' : '#1F2937', padding: 10, borderRadius: 8, marginTop: 6, borderWidth: 1, borderColor: isDarkMode ? '#334155' : '#D1D5DB' },
  successText: { color: '#10B981', fontSize: 12, marginTop: 12, fontWeight: '600', textAlign: 'center' },
  btnSave: { backgroundColor: '#38BDF8', padding: 14, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 16 },
  btnSaveTxt: { color: '#0B0F19', fontWeight: 'bold', fontSize: 13 },
  btnClear: { flexDirection: 'row', alignItems: 'center', gap: 6, borderColor: '#EF444440', borderWidth: 1, padding: 10, borderRadius: 8, marginTop: 14, justifyContent: 'center' },
  btnClearTxt: { color: '#EF4444', fontWeight: 'bold', fontSize: 12 }
});
