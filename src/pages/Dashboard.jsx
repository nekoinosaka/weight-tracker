import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Card, CardContent, Tabs, Tab, FormControlLabel, Checkbox } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { recordService } from '../services/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BedtimeIcon from '@mui/icons-material/Bedtime';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [showWeightYAxis, setShowWeightYAxis] = useState(true);
  const [showWeightStats, setShowWeightStats] = useState(true);
  const [stats, setStats] = useState({
    currentWeight: 0,
    startWeight: 0,
    weightLost: 0,
    averageWeight: 0,
    avgDietScore: 0,
    avgWaterScore: 0,
    avgExerciseScore: 0,
    avgMoodScore: 0,
    avgSleepScore: 0,
    bowelPercentage: 0,
  });

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        if (user) {
          setLoading(true);
          const data = await recordService.getRecords(user.id);
          
          // 按日期排序数据（最新的在前）
          const sortedData = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
          setRecords(sortedData);
          
          // 计算统计数据
          if (sortedData.length > 0) {
            const currentWeight = sortedData[0].weight;
            const startWeight = sortedData[sortedData.length - 1].weight;
            const weightLost = startWeight - currentWeight;
            const totalWeight = sortedData.reduce((sum, record) => sum + record.weight, 0);
            const averageWeight = totalWeight / sortedData.length;
            
            // 计算其他健康指标的平均值
            const validDietScores = sortedData.filter(record => record.diet_score !== null);
            const validWaterScores = sortedData.filter(record => record.water_score !== null);
            const validExerciseScores = sortedData.filter(record => record.exercise_score !== null);
            const validMoodScores = sortedData.filter(record => record.mood_score !== null);
            const validSleepScores = sortedData.filter(record => record.sleep_condition !== null);
            const validBowelRecords = sortedData.filter(record => record.has_bowel_movement !== null);
            
            const avgDietScore = validDietScores.length > 0 
              ? validDietScores.reduce((sum, record) => sum + record.diet_score, 0) / validDietScores.length 
              : 0;
              
            const avgWaterScore = validWaterScores.length > 0 
              ? validWaterScores.reduce((sum, record) => sum + record.water_score, 0) / validWaterScores.length 
              : 0;
              
            const avgExerciseScore = validExerciseScores.length > 0 
              ? validExerciseScores.reduce((sum, record) => sum + record.exercise_score, 0) / validExerciseScores.length 
              : 0;
              
            const avgMoodScore = validMoodScores.length > 0 
              ? validMoodScores.reduce((sum, record) => sum + record.mood_score, 0) / validMoodScores.length 
              : 0;

            const avgSleepScore = validSleepScores.length > 0 
              ? validSleepScores.reduce((sum, record) => sum + record.sleep_condition, 0) / validSleepScores.length 
              : 0;
              
            const bowelPercentage = validBowelRecords.length > 0
              ? (validBowelRecords.filter(record => record.has_bowel_movement).length / validBowelRecords.length) * 100
              : 0;
            
            setStats({
              currentWeight,
              startWeight,
              weightLost,
              averageWeight: parseFloat(averageWeight.toFixed(1)),
              avgDietScore: parseFloat(avgDietScore.toFixed(1)),
              avgWaterScore: parseFloat(avgWaterScore.toFixed(1)),
              avgExerciseScore: parseFloat(avgExerciseScore.toFixed(1)),
              avgMoodScore: parseFloat(avgMoodScore.toFixed(1)),
              avgSleepScore: parseFloat(avgSleepScore.toFixed(1)),
              bowelPercentage: parseFloat(bowelPercentage.toFixed(0)),
            });
          }
        }
      } catch (error) {
        console.error('获取记录失败:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [user]);

  // 为图表准备数据
  const weightChartData = records.map(record => ({
    date: new Date(record.date).toLocaleDateString(),
    weight: record.weight
  })).reverse(); // 反转以便在图表上从左到右显示时间
  
  // 为健康评分图表准备数据
  const healthScoreChartData = records.map(record => ({
    date: new Date(record.date).toLocaleDateString(),
    饮食: record.diet_score || 0,
    饮水: record.water_score || 0,
    运动: record.exercise_score || 0,
    心情: record.mood_score || 0,
    睡眠: record.sleep_condition || 0,
  })).reverse();
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>健康仪表盘</Typography>
      
      {records.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">还没有记录数据</Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            开始记录你的体重，以便跟踪你的减肥进度！
          </Typography>
        </Paper>
      ) : (
        <>
          {/* 显示控制 */}
          <Grid container spacing={3} sx={{ mb: 2, alignItems: 'center' }}>
            <Grid item>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showWeightStats}
                    onChange={(e) => setShowWeightStats(e.target.checked)}
                  />
                }
                label="显示具体体重"
              />
            </Grid>
          </Grid>

          {/* 统计卡片 */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>当前体重</Typography>
                  <Typography variant="h4">{showWeightStats ? stats.currentWeight : '***'} kg</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>起始体重</Typography>
                  <Typography variant="h4">{showWeightStats ? stats.startWeight : '***'} kg</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>已减重</Typography>
                  <Typography variant="h4" color={stats.weightLost > 0 ? 'success.main' : 'error.main'}>
                    {showWeightStats ? 
                      (stats.weightLost > 0 ? `-${stats.weightLost.toFixed(2)}` : `+${Math.abs(stats.weightLost).toFixed(2)}`) 
                      : '***'} kg
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>平均体重</Typography>
                  <Typography variant="h4">{showWeightStats ? stats.averageWeight : '***'} kg</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* 健康评分卡片 */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                  <RestaurantIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>平均饮食评分</Typography>
                    <Typography variant="h4">{stats.avgDietScore}/10</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                  <WaterDropIcon sx={{ mr: 1, color: 'info.main' }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>平均饮水评分</Typography>
                    <Typography variant="h4">{stats.avgWaterScore}/10</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                  <FitnessCenterIcon sx={{ mr: 1, color: 'success.main' }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>平均运动评分</Typography>
                    <Typography variant="h4">{stats.avgExerciseScore}/10</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                  <FavoriteIcon sx={{ mr: 1, color: 'error.main' }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>平均心情评分</Typography>
                    <Typography variant="h4">{stats.avgMoodScore}/10</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* 睡眠评分卡片 */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                  <BedtimeIcon sx={{ mr: 1, color: 'secondary.main' }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>平均睡眠评分</Typography>
                    <Typography variant="h4">{stats.avgSleepScore}/10</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    <Typography color="textSecondary" gutterBottom>排便情况</Typography>
                    <Typography variant="h4" sx={{ ml: 2 }}>{stats.bowelPercentage}%</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* 图表选项卡 */}
          <Paper sx={{ p: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} centered sx={{ mb: 2 }}>
              <Tab label="体重趋势" />
              <Tab label="健康评分趋势" />
            </Tabs>
            
            {activeTab === 0 ? (
              <Box>
                <Typography variant="h6" gutterBottom>体重趋势</Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showWeightYAxis}
                      onChange={(e) => setShowWeightYAxis(e.target.checked)}
                    />
                  }
                  label="显示具体体重"
                  sx={{ mb: 2 }}
                />
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={weightChartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis 
                        domain={['dataMin - 1', 'dataMax + 1']}
                        tickFormatter={(value) => showWeightYAxis ? value : '***'}
                      />
                      <Tooltip formatter={(value) => showWeightYAxis ? value : '***'} />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#4caf50"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            ) : (
              <Box>
                <Typography variant="h6" gutterBottom>健康评分趋势</Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={healthScoreChartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip formatter={(value) => showWeightYAxis ? value : '***'} />
                      <Bar dataKey="饮食" fill="#8884d8" />
                      <Bar dataKey="饮水" fill="#2196f3" />
                      <Bar dataKey="运动" fill="#4caf50" />
                      <Bar dataKey="心情" fill="#f44336" />
                      <Bar dataKey="睡眠" fill="#9c27b0" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
};

export default Dashboard;
