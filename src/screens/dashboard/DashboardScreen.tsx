import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import {
  Text,
  Card,
  ActivityIndicator,
  List,
  useTheme,
  MD3Theme,
  Avatar,
} from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ConfigPopup from '../../components/ConfigPopup';
import { BarChart } from 'react-native-chart-kit';
import { getDashboardData } from '../../api/dashboard';
import { DashboardWidget } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation/MainNavigator';

type Props = {
  navigation: BottomTabNavigationProp<MainTabParamList, 'Dashboard'>;
};

const screenWidth = Dimensions.get('window').width;

const Header = ({
  user,
  theme,
  serverUrl,
  onConfigPress,
}: {
  user: any;
  theme: MD3Theme;
  serverUrl: string;
  onConfigPress: () => void;
}) => {
  const styles = useStyles(theme);
  let avatarUrl = 'https://www.gravatar.com/avatar/';
  if (user?.user_image) {
    try {
      avatarUrl = new URL(user.user_image, serverUrl).href;
    } catch (e) {
      console.error('Invalid user_image URL:', e);
    }
  }

  return (
    <View style={styles.headerContainer}>
      <View>
        <Text style={styles.welcomeText}>Welcome,</Text>
        <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity onPress={onConfigPress} style={styles.configButton}>
          <Ionicons name="settings-outline" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Avatar.Image size={50} source={{ uri: avatarUrl }} />
      </View>
    </View>
  );
};

const NumberWidget = ({ item, theme }: { item: DashboardWidget; theme: MD3Theme }) => {
  const styles = useStyles(theme);
  return (
    <Card style={styles.numberCard} elevation={2}>
      <Card.Content>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.numberValue}>{item.data}</Text>
      </Card.Content>
    </Card>
  );
};

const ListWidget = ({ item, theme }: { item: DashboardWidget; theme: MD3Theme }) => {
  const styles = useStyles(theme);
  const listData = item.data || [];
  return (
    <Card style={styles.listCard}>
      <Card.Title title={item.title} />
      <Card.Content>
        {Array.isArray(listData) && listData.length > 0 ? (
          <List.Section>
            {listData.map((listItem, index) => (
              <List.Item
                key={index}
                title={listItem.name}
                description={`Status: ${listItem.status} - Amount: ${listItem.total_claimed_amount}`}
                left={() => <List.Icon icon="cash-multiple" />}
              />
            ))}
          </List.Section>
        ) : (
          <Text>No recent expense claims</Text>
        )}
      </Card.Content>
    </Card>
  );
};

const ChartWidget = ({ item, theme }: { item: DashboardWidget; theme: MD3Theme }) => {
  const styles = useStyles(theme);
  let chartData;
  if (item.data.labels) {
    chartData = {
      labels: item.data.labels,
      datasets: [{ data: item.data.values }],
    };
  } else {
    chartData = {
      labels: ['Target', 'Achieved'],
      datasets: [{ data: [item.data.target, item.data.achieved] }],
    };
  }

  const chartConfig = {
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: theme.colors.surface,
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => theme.colors.primary,
    labelColor: (opacity = 1) => theme.colors.onSurface,
    strokeWidth: 2,
    barPercentage: 0.8,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 10,
    },
  };

  return (
    <Card style={styles.chartCard}>
      <Card.Title title={item.title} />
      <BarChart
        data={chartData}
        width={screenWidth - 48}
        height={250}
        yAxisLabel="৳"
        yAxisSuffix=""
        chartConfig={chartConfig}
        verticalLabelRotation={30}
        style={{
          borderRadius: 16,
        }}
        withInnerLines={false}
        fromZero
        showBarTops={false}
      />
    </Card>
  );
};

const Widget = ({ item, theme }: { item: DashboardWidget; theme: MD3Theme }) => {
  switch (item.type) {
    case 'number':
      return <NumberWidget item={item} theme={theme} />;
    case 'list':
      return <ListWidget item={item} theme={theme} />;
    case 'chart':
      return <ChartWidget item={item} theme={theme} />;
    default:
      return null;
  }
};

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { user, serverUrl } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConfigPopupVisible, setIsConfigPopupVisible] = useState(false);
  const theme = useTheme();
  const styles = useStyles(theme);

  useEffect(() => {
    if (user) {
      console.log('Dashboard User:', user);
    }
  }, [user]);

  const handleConfigPress = () => {
    setIsConfigPopupVisible(true);
  };

  const handleCloseConfigPopup = () => {
    setIsConfigPopupVisible(false);
  };

  const fetchDashboardData = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const result = await getDashboardData(user);
      if (result.data) {
        const filteredWidgets = result.data.widgets.filter(
          (widget: DashboardWidget) =>
            !['Payable', 'Receivable'].includes(widget.title)
        );
        setWidgets(filteredWidgets);
      } else {
        setError(result.error || 'Failed to load dashboard data');
      }
    } catch (err) {
      setError('An error occurred while fetching dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = useCallback(() => {
    fetchDashboardData(true);
  }, []);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: DashboardWidget }) => (
    <Widget item={item} theme={theme} />
  );

  const numberWidgets = widgets.filter((w) => w.type === 'number');
  const otherWidgets = widgets.filter((w) => w.type !== 'number');

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        style={styles.container}
        data={otherWidgets}
        renderItem={renderItem}
        keyExtractor={(item) => item.title}
        ListHeaderComponent={
          <>
            <Header
              user={user}
              theme={theme}
              serverUrl={serverUrl}
              onConfigPress={handleConfigPress}
            />
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.numberWidgetsScrollView}
            >
              {numberWidgets.map((widget) => (
                <NumberWidget key={widget.title} item={widget} theme={theme} />
              ))}
            </ScrollView>
          </>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.contentContainer}
      />
      <ConfigPopup
        visible={isConfigPopupVisible}
        onDismiss={handleCloseConfigPopup}
        onSave={(serverUrl, apiKey, apiSecret) => {
          // Handle saving configuration, e.g., update context or local storage
          console.log('Config saved:', { serverUrl, apiKey, apiSecret });
          handleCloseConfigPopup();
        }}
        initialServerUrl={serverUrl || ''} // Use actual serverUrl from context
        initialApiKey={''} // Placeholder, replace with actual API key if available
        initialApiSecret={''} // Placeholder, replace with actual API secret if available
      />
    </SafeAreaView>
  );
};

const useStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: theme.colors.onSurface,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
      paddingHorizontal: 16,
      paddingTop: 20, // Adjust for SafeAreaView
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10, // Space between settings icon and avatar
    },
    configButton: {
      // No specific styles needed here, gap handles spacing
    },
    welcomeText: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    userName: {
      fontSize: 24,
      color: theme.colors.secondary,
    },
    errorContainer: {
      padding: 16,
      backgroundColor: theme.colors.errorContainer,
      borderRadius: theme.roundness,
      marginHorizontal: 16,
      marginBottom: 16,
    },
    errorText: {
      color: theme.colors.onError,
    },
    numberWidgetsScrollView: {
      paddingHorizontal: 8, // Padding for the horizontal scroll view
      marginBottom: 8,
    },
    numberCard: {
      marginHorizontal: 8,
      width: screenWidth * 0.4, // Make cards take up about 40% of screen width
      borderRadius: theme.roundness,
      backgroundColor: theme.colors.surfaceVariant,
      paddingVertical: 10, // Add some vertical padding
    },
    cardTitle: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center', // Center align title
    },
    numberValue: {
      fontSize: 36,
      fontWeight: 'bold',
      marginTop: 8,
      color: theme.colors.primary,
      textAlign: 'center', // Center align value
    },
    listCard: {
      marginHorizontal: 0,
      marginTop: 8,
      marginBottom: 8,
      backgroundColor: theme.colors.surface,
    },
    chartCard: {
      marginHorizontal: 0,
      marginTop: 8,
      marginBottom: 8,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.roundness * 2,
      paddingVertical: 16,
      paddingHorizontal: 8,
      alignItems: 'center',
    },
  });

export default DashboardScreen;
