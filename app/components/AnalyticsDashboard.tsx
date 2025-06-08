import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions, ColorValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { analyticsService } from '@/services/AnalyticsService';
import Colors from '@/constants/Colors';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { TrendingUp, Users, Heart, MessageCircle, Target, DollarSign } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface DashboardData {
  liveUsers: number;
  todaySignups: number;
  todayMatches: number;
  todayMessages: number;
  conversionRate: number;
  revenueToday: number;
  topFeatures: Array<{ name: string; usage: number; }>;
}

export default function AnalyticsDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await analyticsService.getDashboardData();
      setDashboardData(data);
      setLoading(false);
    } catch (error) {
      console.error('📊 Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  const MetricCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    gradient,
    delay = 0 
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    gradient: readonly [ColorValue, ColorValue, ...ColorValue[]];
    delay?: number;
  }) => (
    <Animated.View 
      entering={FadeIn.delay(delay).duration(400)}
      style={styles.metricCard}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            {icon}
          </View>
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <Text style={styles.cardValue}>{value}</Text>
      </LinearGradient>
    </Animated.View>
  );

  const FeatureUsageBar = ({ 
    feature, 
    delay = 0 
  }: { 
    feature: { name: string; usage: number; }; 
    delay?: number; 
  }) => (
    <Animated.View 
      entering={SlideInRight.delay(delay).duration(400)}
      style={styles.featureBar}
    >
      <View style={styles.featureInfo}>
        <Text style={styles.featureName}>{feature.name}</Text>
        <Text style={styles.featurePercent}>{Math.round(feature.usage * 100)}%</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <Animated.View 
          style={[
            styles.progressBar, 
            { width: `${feature.usage * 100}%` }
          ]}
        />
      </View>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Analytics...</Text>
      </View>
    );
  }

  if (!dashboardData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load analytics data</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#fafbff', '#f8faff', '#fafaff', '#fcfaff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      <Animated.View 
        entering={FadeIn.duration(400)}
        style={styles.header}
      >
        <Text style={styles.title}>📊 Analytics Dashboard</Text>
        <Text style={styles.subtitle}>Real-time app insights</Text>
      </Animated.View>

      <View style={styles.metricsGrid}>
        <MetricCard
          title="Live Users"
          value={dashboardData.liveUsers}
          icon={<Users size={24} color={Colors.primary} />}
          color={Colors.primary}
          gradient={['#E75480', '#F875AA'] as const}
          delay={100}
        />
        
        <MetricCard
          title="Today's Signups"
          value={dashboardData.todaySignups}
          icon={<TrendingUp size={24} color="#10B981" />}
          color="#10B981"
          gradient={['#10B981', '#34D399'] as const}
          delay={200}
        />
        
        <MetricCard
          title="Matches Today"
          value={dashboardData.todayMatches}
          icon={<Heart size={24} color="#F59E0B" />}
          color="#F59E0B"
          gradient={['#F59E0B', '#FBBF24'] as const}
          delay={300}
        />
        
        <MetricCard
          title="Messages Sent"
          value={dashboardData.todayMessages}
          icon={<MessageCircle size={24} color="#8B5CF6" />}
          color="#8B5CF6"
          gradient={['#8B5CF6', '#A78BFA'] as const}
          delay={400}
        />
        
        <MetricCard
          title="Conversion Rate"
          value={`${(dashboardData.conversionRate * 100).toFixed(1)}%`}
          icon={<Target size={24} color="#EF4444" />}
          color="#EF4444"
          gradient={['#EF4444', '#F87171'] as const}
          delay={500}
        />
        
        <MetricCard
          title="Revenue Today"
          value={`$${dashboardData.revenueToday.toFixed(2)}`}
          icon={<DollarSign size={24} color="#059669" />}
          color="#059669"
          gradient={['#059669', '#10B981'] as const}
          delay={600}
        />
      </View>

      <Animated.View 
        entering={FadeIn.delay(700).duration(400)}
        style={styles.featuresSection}
      >
        <Text style={styles.sectionTitle}>🔥 Top Features</Text>
        <View style={styles.featuresContainer}>
          {dashboardData.topFeatures.map((feature, index) => (
            <FeatureUsageBar 
              key={feature.name} 
              feature={feature} 
              delay={800 + index * 100}
            />
          ))}
        </View>
      </Animated.View>

      <Animated.View 
        entering={FadeIn.delay(1100).duration(400)}
        style={styles.insightsSection}
      >
        <Text style={styles.sectionTitle}>💡 Key Insights</Text>
        <View style={styles.insightCard}>
          <Text style={styles.insightText}>
            • Group browsing is your most popular feature ({Math.round(dashboardData.topFeatures[0]?.usage * 100)}% usage)
          </Text>
          <Text style={styles.insightText}>
            • Conversion rate is {dashboardData.conversionRate > 0.08 ? 'excellent' : 'good'} at {(dashboardData.conversionRate * 100).toFixed(1)}%
          </Text>
          <Text style={styles.insightText}>
            • {dashboardData.todaySignups} new users joined today
          </Text>
          <Text style={styles.insightText}>
            • Revenue trending {dashboardData.revenueToday > 1000 ? '📈 up' : '📊 steady'}
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#EF4444',
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.textLight,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  metricCard: {
    width: (width - 44) / 2,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  cardGradient: {
    padding: 20,
    minHeight: 120,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: '#fff',
    opacity: 0.9,
    flex: 1,
  },
  cardValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#fff',
  },
  featuresSection: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.text,
    marginBottom: 20,
  },
  featuresContainer: {
    gap: 16,
  },
  featureBar: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  featureInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.text,
  },
  featurePercent: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.primary + '20',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  insightsSection: {
    margin: 20,
    marginBottom: 40,
  },
  insightCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  insightText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 8,
  },
}); 