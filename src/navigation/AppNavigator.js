import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// User Screens
import UserDashboard from '../screens/user/UserDashboard';
import LoanTypesScreen from '../screens/user/LoanTypesScreen';
import LoanDetailScreen from '../screens/user/LoanDetailScreen';
import MyLoansScreen from '../screens/user/MyLoansScreen';
import LoanApplicationDetailScreen from '../screens/user/LoanApplicationDetailScreen';
import RepaymentScreen from '../screens/user/RepaymentScreen';
import ProfileScreen from '../screens/user/ProfileScreen';
import ReviewsScreen from '../screens/user/ReviewsScreen';

// Admin Screens
import AdminDashboard from '../screens/admin/AdminDashboard';
import AdminApplicationsScreen from '../screens/admin/AdminApplicationsScreen';
import AdminApplicationDetailScreen from '../screens/admin/AdminApplicationDetailScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import ManageLoanTypesScreen from '../screens/admin/ManageLoanTypesScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// AUTH NAVIGATOR
function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// USER BOTTOM TABS
function UserTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: '#4F46E5',
      tabBarInactiveTintColor: '#94A3B8',
      tabBarStyle: { paddingBottom: 5, height: 60 },
      tabBarIcon: ({ focused, color }) => {
        const icons = { Home: '🏠', Loans: '💳', Reviews: '⭐', Profile: '👤' };
        return <Text style={{ fontSize: focused ? 22 : 18 }}>{icons[route.name]}</Text>;
      }
    })}>
      <Tab.Screen name="Home" component={UserDashboard} />
      <Tab.Screen name="Loans" component={MyLoansScreen} />
      <Tab.Screen name="Reviews" component={ReviewsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// USER NAVIGATOR
function UserNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserTabs" component={UserTabs} />
      <Stack.Screen name="LoanTypes" component={LoanTypesScreen} />
      <Stack.Screen name="LoanDetail" component={LoanDetailScreen} />
      <Stack.Screen name="LoanApplicationDetail" component={LoanApplicationDetailScreen} />
      <Stack.Screen name="Repayment" component={RepaymentScreen} />
    </Stack.Navigator>
  );
}

// ADMIN BOTTOM TABS
function AdminTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: '#059669',
      tabBarInactiveTintColor: '#94A3B8',
      tabBarStyle: { paddingBottom: 5, height: 60 },
      tabBarIcon: ({ focused }) => {
        const icons = { Dashboard: '📊', Applications: '📋', Users: '👥', LoanMgmt: '💰' };
        return <Text style={{ fontSize: focused ? 22 : 18 }}>{icons[route.name]}</Text>;
      }
    })}>
      <Tab.Screen name="Dashboard" component={AdminDashboard} />
      <Tab.Screen name="Applications" component={AdminApplicationsScreen} />
      <Tab.Screen name="Users" component={AdminUsersScreen} />
      <Tab.Screen name="LoanMgmt" component={ManageLoanTypesScreen} options={{ tabBarLabel: 'Loan Types' }} />
    </Tab.Navigator>
  );
}

// ADMIN NAVIGATOR
function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
      <Stack.Screen name="ApplicationDetail" component={AdminApplicationDetailScreen} />
      <Stack.Screen name="ManageLoanTypes" component={ManageLoanTypesScreen} />
    </Stack.Navigator>
  );
}

// ROOT
export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer>
      {!user ? (
        <AuthNavigator />
      ) : user.role === 'admin' ? (
        <AdminNavigator />
      ) : (
        <UserNavigator />
      )}
    </NavigationContainer>
  );
}
