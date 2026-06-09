import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { DataPoint, predictFutureValue } from '../utils/analytics';

// Definição de Tipos Estruturais
export interface Thresholds {
  maxTemperature: number;
  minEnergy: number;
  maxLatency: number;
}

export interface Mission {
  id: string;
  name: string;
  orbitType: 'LEO' | 'MEO' | 'GEO';
  status: 'ATIVA' | 'FINALIZADA';
  createdAt: string;
}

export interface TelemetryData {
  temperature: DataPoint[];
  energy: DataPoint[];
  latency: DataPoint[];
}

export interface AlertLog {
  id: string;
  missionId: string;
  missionName: string;
  metric: 'Temperatura' | 'Energia' | 'Comunicação';
  type: 'CRÍTICO' | 'PREDITIVO';
  message: string;
  timestamp: string;
}

interface MissionContextType {
  missions: Mission[];
  activeMissionId: string | null;
  telemetry: TelemetryData;
  thresholds: Thresholds;
  alerts: AlertLog[];
  isDarkMode: boolean;
  createMission: (name: string, orbitType: 'LEO' | 'MEO' | 'GEO') => Promise<void>;
  setActiveMissionId: (id: string) => void;
  updateThresholds: (newThresholds: Thresholds) => Promise<void>;
  toggleDarkMode: () => void;
  clearAlertLogs: () => Promise<void>;
}

const MissionContext = createContext<MissionContextType | undefined>(undefined);

const DEFAULT_THRESHOLDS: Thresholds = {
  maxTemperature: 75.0, // °C
  minEnergy: 20.0,      // %
  maxLatency: 450.0,    // ms
};

export const MissionProvider = ({ children }: { children: ReactNode }) => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [activeMissionId, setActiveMissionIdState] = useState<string | null>(null);
  const [thresholds, setThresholds] = useState<Thresholds>(DEFAULT_THRESHOLDS);
  const [alerts, setAlerts] = useState<AlertLog[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true); // Padrão espacial escuro

  const [telemetry, setTelemetry] = useState<TelemetryData>({
    temperature: [],
    energy: [],
    latency: [],
  });

  // Carrega configurações iniciais persistidas
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const storedMissions = await AsyncStorage.getItem('@space_missions');
        const storedActiveId = await AsyncStorage.getItem('@space_active_id');
        const storedThresholds = await AsyncStorage.getItem('@space_thresholds');
        const storedAlerts = await AsyncStorage.getItem('@space_alerts');
        const storedTheme = await AsyncStorage.getItem('@space_dark_mode');

        if (storedMissions) setMissions(JSON.parse(storedMissions));
        if (storedActiveId) setActiveMissionIdState(storedActiveId);
        if (storedThresholds) setThresholds(JSON.parse(storedThresholds));
        if (storedAlerts) setAlerts(JSON.parse(storedAlerts));
        if (storedTheme) setIsDarkMode(JSON.parse(storedTheme));

        // Se não houver missões criadas, inicializa uma padrão (para demonstração)
        if (!storedMissions || JSON.parse(storedMissions).length === 0) {
          const defaultMission: Mission = {
            id: '1',
            name: 'Alpha-Orionis-Sim',
            orbitType: 'LEO',
            status: 'ATIVA',
            createdAt: new Date().toLocaleDateString('pt-BR'),
          };
          await AsyncStorage.setItem('@space_missions', JSON.stringify([defaultMission]));
          await AsyncStorage.setItem('@space_active_id', '1');
          setMissions([defaultMission]);
          setActiveMissionIdState('1');
        }
      } catch (error) {
        console.error('Erro carregando dados do AsyncStorage', error);
      }
    };
    loadPersistedData();
  }, []);

  // Altera a missão ativa e limpa a telemetria antiga para iniciar o novo fluxo de dados
  const setActiveMissionId = async (id: string) => {
    setActiveMissionIdState(id);
    await AsyncStorage.setItem('@space_active_id', id);
    setTelemetry({ temperature: [], energy: [], latency: [] });
  };

  // Criação de novas missões simuladas
  const createMission = async (name: string, orbitType: 'LEO' | 'MEO' | 'GEO') => {
    const newMission: Mission = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      orbitType,
      status: 'ATIVA',
      createdAt: new Date().toLocaleDateString('pt-BR'),
    };
    const updatedMissions = [...missions, newMission];
    setMissions(updatedMissions);
    await AsyncStorage.setItem('@space_missions', JSON.stringify(updatedMissions));
    await setActiveMissionId(newMission.id);
  };

  // Salva novos limites críticos ajustados pelo usuário
  const updateThresholds = async (newThresholds: Thresholds) => {
    setThresholds(newThresholds);
    await AsyncStorage.setItem('@space_thresholds', JSON.stringify(newThresholds));
  };

  // Toggle de Dark Mode
  const toggleDarkMode = async () => {
    const nextTheme = !isDarkMode;
    setIsDarkMode(nextTheme);
    await AsyncStorage.setItem('@space_dark_mode', JSON.stringify(nextTheme));
  };

  // Limpa os logs de alertas do dispositivo
  const clearAlertLogs = async () => {
    setAlerts([]);
    await AsyncStorage.removeItem('@space_alerts');
  };

  // Loop de simulação de Telemetria em Tempo Real (Loop a cada 60 segundos)
  useEffect(() => {
    if (!activeMissionId) return;

    const interval = setInterval(async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const currentActiveMission = missions.find(m => m.id === activeMissionId);
      
      // Simulação realista de flutuação de dados baseado em órbita (fórmulas geradas por IA)
      const baseTemp = 55 + Math.sin(nowSeconds / 500) * 15 + Math.random() * 4;
      const baseEnergy = Math.max(0, 100 - ((nowSeconds % 10000) / 100) + Math.random() * 2);
      const baseLatency = 200 + Math.cos(nowSeconds / 300) * 150 + Math.random() * 50;

      const newTempPoint = { timestamp: nowSeconds, value: parseFloat(baseTemp.toFixed(2)) };
      const newEnergyPoint = { timestamp: nowSeconds, value: parseFloat(baseEnergy.toFixed(2)) };
      const newLatencyPoint = { timestamp: nowSeconds, value: parseFloat(baseLatency.toFixed(2)) };

      setTelemetry(prev => {
        // Mantém as últimas 15 leituras para visualização nos gráficos
        const updateSeries = (series: DataPoint[], point: DataPoint) => {
          const slice = series.length > 15 ? series.slice(1) : series;
          return [...slice, point];
        };

        const nextTelemetry = {
          temperature: updateSeries(prev.temperature, newTempPoint),
          energy: updateSeries(prev.energy, newEnergyPoint),
          latency: updateSeries(prev.latency, newLatencyPoint),
        };

        // Projeta o cenário para os próximos 5 minutos
        const futureTime = nowSeconds + 300;
        const predictedTemp = predictFutureValue(nextTelemetry.temperature, futureTime);
        const predictedEnergy = predictFutureValue(nextTelemetry.energy, futureTime);
        const predictedLatency = predictFutureValue(nextTelemetry.latency, futureTime);

        const newLogs: AlertLog[] = [];
        const logTimestamp = new Date().toLocaleTimeString('pt-BR');

        // Validações de Limiares Instantâneos Críticos
        if (newTempPoint.value > thresholds.maxTemperature) {
          newLogs.push({
            id: Math.random().toString(),
            missionId: activeMissionId,
            missionName: currentActiveMission?.name || 'Desconhecida',
            metric: 'Temperatura',
            type: 'CRÍTICO',
            message: `Temperatura ultrapassou limite crítico! Atual: ${newTempPoint.value}°C`,
            timestamp: logTimestamp,
          });
        }
        if (newEnergyPoint.value < thresholds.minEnergy) {
          newLogs.push({
            id: Math.random().toString(),
            missionId: activeMissionId,
            missionName: currentActiveMission?.name || 'Desconhecida',
            metric: 'Energia',
            type: 'CRÍTICO',
            message: `Bateria abaixo do limite de segurança! Atual: ${newEnergyPoint.value}%`,
            timestamp: logTimestamp,
          });
        }
        if (newLatencyPoint.value > thresholds.maxLatency) {
          newLogs.push({
            id: Math.random().toString(),
            missionId: activeMissionId,
            missionName: currentActiveMission?.name || 'Desconhecida',
            metric: 'Comunicação',
            type: 'CRÍTICO',
            message: `Latência de uplink crítica! Atual: ${newLatencyPoint.value}ms`,
            timestamp: logTimestamp,
          });
        }

        // Validações de Tendências Preditivas
        if (newTempPoint.value <= thresholds.maxTemperature && predictedTemp > thresholds.maxTemperature) {
          newLogs.push({
            id: Math.random().toString(),
            missionId: activeMissionId,
            missionName: currentActiveMission?.name || 'Desconhecida',
            metric: 'Temperatura',
            type: 'PREDITIVO',
            message: `Predição: Aquecimento crítico estimado em ${predictedTemp.toFixed(1)}°C nos próximos 5 minutos.`,
            timestamp: logTimestamp,
          });
        }
        if (newEnergyPoint.value >= thresholds.minEnergy && predictedEnergy < thresholds.minEnergy) {
          newLogs.push({
            id: Math.random().toString(),
            missionId: activeMissionId,
            missionName: currentActiveMission?.name || 'Desconhecida',
            metric: 'Energia',
            type: 'PREDITIVO',
            message: `Predição: Falha de subsistema de energia projetada nos próximos 5 minutos (${predictedEnergy.toFixed(1)}%).`,
            timestamp: logTimestamp,
          });
        }
        if (newLatencyPoint.value >= thresholds.maxLatency && predictedLatency < thresholds.maxLatency) {
            newLogs.push({
                id: Math.random().toString(),
                missionId: activeMissionId,
                missionName: currentActiveMission?.name || 'Desconhecida',
                metric: 'Comunicação',
                type: 'PREDITIVO',
                message: `Predição: Alta latência de uplink projetada nos próximos 5 minutos (${predictedLatency}ms).`,
                timestamp: logTimestamp,
            })
        }

        if (newLogs.length > 0) {
          setAlerts(currentAlerts => {
            const updatedAlerts = [...newLogs, ...currentAlerts].slice(0, 50); // limita a 50 logs persistidos
            AsyncStorage.setItem('@space_alerts', JSON.stringify(updatedAlerts));
            return updatedAlerts;
          });
        }

        return nextTelemetry;
      });

    }, 5000); // Tempo de atualização

    return () => clearInterval(interval);
  }, [activeMissionId, thresholds, missions]);

  return (
    <MissionContext.Provider value={{
      missions, activeMissionId, telemetry, thresholds, alerts, isDarkMode,
      createMission, setActiveMissionId, updateThresholds, toggleDarkMode, clearAlertLogs
    }}>
      {children}
    </MissionContext.Provider>
  );
};

export const useMission = () => {
  const context = useContext(MissionContext);
  if (!context) throw new Error('useMission deve ser usado dentro de um MissionProvider');
  return context;
};
