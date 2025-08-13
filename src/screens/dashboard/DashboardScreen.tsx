import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, RefreshControl, ScrollView, Dimensions } from 'react-native';
import { Text, Card, ActivityIndicator, List, useTheme, MD3Theme } from 'react-native-paper';
import BarChart from 'react-native-chart-kit/dist/BarChart';
import { getDashboardData } from '../../api/dashboard';
import { DashboardWidget } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation/MainNavigator';

type Props = {
  navigation: BottomTabNavigationProp<MainTabParamList, 'Dashboard'>;
};

const RenderHeader = React.memo(({ user, theme }: { user: any; theme: MD3Theme }) => {
  const styles = useStyles(theme);
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.welcomeText}>Welcome, {user?.fullName || 'User'}</Text>
      <Text style={styles.subtitleText}>Dashboard</Text>
    </View>
  );
});

const RenderError = React.memo(({ error, theme }: { error: string | null; theme: MD3Theme }) => {
  const styles = useStyles(theme);
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );
});

const DashboardWidgetItem = React.memo(
  ({ item, styles }: { item: DashboardWidget; styles: any }) => {
    if (item.type === 'number') {
      return (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.numberValue}>{item.data}</Text>
          </Card.Content>
        </Card>
      );
    }

    if (item.type === 'list') {
      const listData = item.data || [];
      return (
        <Card style={[styles.card, styles.listCard]}>
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
    }

    if (item.type === 'chart') {
      const chartData = {
        labels: ['Target', 'Achieved'],
        datasets: [
          {
            data: [item.data.target, item.data.achieved],
          },
        ],
      };
      return (
        <Card style={[styles.card, styles.chartCard]}>
          <Card.Title title={item.title} />
          <BarChart
            data={chartData}
            width={Dimensions.get('window').width - 64}
            height={220}
            yAxisLabel="৳"
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#ffa726',
              },
            }}
            verticalLabelRotation={30}
          />
        </Card>
      );
    }

    return null;
  }
);

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const styles = useStyles(theme);

  const fetchDashboardData = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const result = await getDashboardData();
      if (result.data) {
        setWidgets(result.data.widgets);
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <RenderHeader user={user} theme={theme} />
      {error && <RenderError error={error} theme={theme} />}
      <View style={styles.widgetsContainer}>
        <View style={styles.numberWidgetsRow}>
          {widgets
            .filter((w) => w.type === 'number')
            .map((widget) => (
              <DashboardWidgetItem key={widget.title} item={widget} styles={styles} />
            ))}
        </View>
        {widgets
          .filter((w) => w.type !== 'number')
          .map((widget) => (
            <DashboardWidgetItem key={widget.title} item={widget} styles={styles} />
          ))}
      </View>
    </ScrollView>
  );
};

const useStyles = (theme: MD3Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    marginTop: 30,
  },
  contentContainer: {
    padding: 16,
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
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  subtitleText: {
    fontSize: 16,
    marginTop: 4,
    color: theme.colors.secondary,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: theme.colors.errorContainer,
    borderRadius: theme.roundness,
    marginBottom: 16,
  },
  errorText: {
    color: theme.colors.onError,
  },
  widgetsContainer: {
    flex: 1,
  },
  numberWidgetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  card: {
    margin: 8,
    flex: 1,
    minWidth: 150,
    borderRadius: theme.roundness,
  },
  cardTitle: {
    fontSize: 14,
    color: theme.colors.secondary,
  },
  numberValue: {
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 8,
    color: theme.colors.primary,
  },
  listCard: {
    marginHorizontal: 0,
    marginTop: 16,
  },
  chartCard: {
    marginHorizontal: 0,
    marginTop: 16,
  },
});

export default DashboardScreen;
