import { Check, Orbit, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMission } from '../../context/MissionContext';

export default function MissionsScreen() {
  const { missions, activeMissionId, createMission, setActiveMissionId, isDarkMode } = useMission();
  const [name, setName] = useState('');
  const [orbit, setOrbit] = useState<'LEO' | 'MEO' | 'GEO'>('LEO');
  const [error, setError] = useState('');

  const styles = createStyles(isDarkMode);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('A designação identificadora da missão é obrigatória.');
      return;
    }
    setError('');
    await createMission(name.trim(), orbit);
    setName('');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Registrar nova operação orbital</Text>
        
        <Text style={styles.label}>Nome da missão</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: Krab-IX" 
          placeholderTextColor="#64748B"
          value={name}
          onChangeText={setName}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={styles.label}>Parâmetro de altitude orbital</Text>
        <View style={styles.orbitContainer}>
          {(['LEO', 'MEO', 'GEO'] as const).map((type) => (
            <TouchableOpacity 
              key={type} 
              style={[styles.orbitBtn, orbit === type && styles.orbitBtnActive]} 
              onPress={() => setOrbit(type)}
            >
              <Text style={[styles.orbitBtnTxt, orbit === type && styles.orbitBtnTxtActive]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleCreate}>
          <Plus color="#FFFFFF" size={18} />
          <Text style={styles.submitBtnText}>Inicializar link de telemetria</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Módulos em execução</Text>
      {missions.map((mission) => {
        const isActive = mission.id === activeMissionId;
        return (
          <TouchableOpacity 
            key={mission.id} 
            style={[styles.missionCard, isActive && styles.missionCardActive]}
            onPress={() => setActiveMissionId(mission.id)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Orbit color={isActive ? '#38BDF8' : '#64748B'} size={24} />
              <View>
                <Text style={styles.mName}>{mission.name}</Text>
                <Text style={styles.mMeta}>Órbita: {mission.orbitType} • Criada em: {mission.createdAt}</Text>
              </View>
            </View>
            {isActive && (
              <View style={styles.activeIndicator}>
                <Check color="#10B981" size={14} />
                <Text style={styles.activeTxt}>ATIVA</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const createStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDarkMode ? '#0B0F19' : '#F3F4F6', padding: 16 },
  card: { backgroundColor: isDarkMode ? '#111827' : '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: isDarkMode ? '#1E293B' : '#E5E7EB' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: isDarkMode ? '#F8FAFC' : '#1F2937', marginBottom: 16 },
  label: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  input: { backgroundColor: isDarkMode ? '#1E293B' : '#F9FAFB', color: isDarkMode ? '#F8FAFC' : '#1F2937', padding: 12, borderRadius: 8, marginTop: 6, marginBottom: 4, borderWidth: 1, borderColor: isDarkMode ? '#334155' : '#D1D5DB' },
  errorText: { color: '#EF4444', fontSize: 11, marginBottom: 10 },
  orbitContainer: { flexDirection: 'row', gap: 8, marginTop: 6, marginBottom: 16 },
  orbitBtn: { flex: 1, paddingVertical: 10, backgroundColor: isDarkMode ? '#1E293B' : '#E5E7EB', borderRadius: 8, alignItems: 'center' },
  orbitBtnActive: { backgroundColor: '#38BDF8' },
  orbitBtnTxt: { color: isDarkMode ? '#94A3B8' : '#4B5563', fontWeight: 'bold', fontSize: 12 },
  orbitBtnTxtActive: { color: '#0B0F19' },
  submitBtn: { backgroundColor: '#38BDF8', padding: 14, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  submitBtnText: { color: '#0B0F19', fontWeight: 'bold', fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: isDarkMode ? '#94A3B8' : '#4B5563', marginBottom: 12 },
  missionCard: { backgroundColor: isDarkMode ? '#111827' : '#FFFFFF', padding: 14, borderRadius: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: isDarkMode ? '#1E293B' : '#E5E7EB' },
  missionCardActive: { borderColor: '#38BDF8' },
  mName: { fontSize: 14, fontWeight: 'bold', color: isDarkMode ? '#F8FAFC' : '#1F2937' },
  mMeta: { fontSize: 11, color: '#64748B', marginTop: 2 },
  activeIndicator: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#10B98115', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  activeTxt: { color: '#10B981', fontSize: 10, fontWeight: 'bold' }
});
