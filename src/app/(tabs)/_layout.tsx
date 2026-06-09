import { Tabs } from 'expo-router';
import { LineChart, Rocket, Settings, ShieldAlert } from 'lucide-react-native';
import { useMission } from '../../context/MissionContext';

export default function TabsLayout() {
  const { isDarkMode } = useMission();

  const themeColors = {
    bg: isDarkMode ? '#0B0F19' : '#F3F4F6',
    active: isDarkMode ? '#38BDF8' : '#0284C7',
    inactive: isDarkMode ? '#64748B' : '#94A3B8',
    tabBarBg: isDarkMode ? '#111827' : '#FFFFFF',
    border: isDarkMode ? '#1E293B' : '#E5E7EB',
  };

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: themeColors.active,
      tabBarInactiveTintColor: themeColors.inactive,
      tabBarStyle: {
        backgroundColor: themeColors.tabBarBg,
        borderTopWidth: 1,
        borderTopColor: themeColors.border,
        paddingBottom: 5,
        height: 60,
      },
      headerStyle: {
        backgroundColor: themeColors.tabBarBg,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.border,
      },
      headerTitleStyle: {
        color: isDarkMode ? '#F8FAFC' : '#1F2937',
        fontSize: 18,
        fontWeight: 'bold',
      }
    }}>
      <Tabs.Screen name="index" options={{ title: 'Centro de Controle', tabBarIcon: ({ color, size }) => <Rocket color={color} size={size} /> }} />
      <Tabs.Screen name="dashboards" options={{ title: 'Dashboards', tabBarIcon: ({ color, size }) => <LineChart color={color} size={size} /> }} />
      <Tabs.Screen name="missoes" options={{ title: 'Missões', tabBarIcon: ({ color, size }) => <ShieldAlert color={color} size={size} /> }} />
      <Tabs.Screen name="configuracoes" options={{ title: 'Configurações', tabBarIcon: ({ color, size }) => <Settings color={color} size={size} /> }} />
    </Tabs>
  );
}
