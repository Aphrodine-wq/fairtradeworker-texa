import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/src/store';
import { Colors } from '@/src/constants/theme';

export default function TabsLayout() {
  const currentUser = useAppStore((state) => state.currentUser);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
        },
        headerStyle: {
          backgroundColor: Colors.surface,
        },
        headerTintColor: Colors.textPrimary,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 32, height: 32, backgroundColor: Colors.primary, borderRadius: 8, justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="construct" size={20} color={Colors.textInverse} />
              </View>
              <View>
                <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.textPrimary }}>FairTradeWorker</Text>
                <Text style={{ fontSize: 9, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 0.5 }}>HOME SERVICES</Text>
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: 'Browse Jobs',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
          href: currentUser ? '/dashboard' : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
