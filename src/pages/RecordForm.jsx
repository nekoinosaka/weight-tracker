import { useState } from 'react';
import { 
  Box, Typography, TextField, Button, Paper, Snackbar, Alert, Grid,
  FormControlLabel, Switch, Slider, FormControl, FormLabel, Rating
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { useAuth } from '../contexts/AuthContext';
import { recordService } from '../services/supabase';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import BedtimeIcon from '@mui/icons-material/Bedtime';

const RecordForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [formData, setFormData] = useState({
    weight: '',
    date: dayjs(),
    notes: '',
    diet_score: 5,
    water_score: 5,
    exercise_score: 5,
    mood_score: 5,
    has_bowel_movement: false,
    sleep_condition: 5,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSliderChange = (name) => (e, newValue) => {
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleRatingChange = (name) => (e, newValue) => {
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleDateChange = (newDate) => {
    setFormData(prev => ({
      ...prev,
      date: newDate
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 基本验证
    if (!formData.weight || isNaN(formData.weight) || parseFloat(formData.weight) <= 0) {
      setSnackbar({
        open: true,
        message: '请输入有效的体重数值',
        severity: 'error',
      });
      return;
    }

    try {
      setLoading(true);
      
      // 准备数据
      const recordData = {
        user_id: user.id,
        weight: parseFloat(formData.weight),
        date: formData.date.format('YYYY-MM-DD'), // 使用dayjs格式化为 YYYY-MM-DD
        notes: formData.notes || null,
        diet_score: formData.diet_score,
        water_score: formData.water_score,
        exercise_score: formData.exercise_score,
        mood_score: formData.mood_score,
        has_bowel_movement: formData.has_bowel_movement,
        sleep_condition: formData.sleep_condition,
      };
      
      // 保存到数据库
      await recordService.addRecord(recordData);
      
      // 显示成功消息
      setSnackbar({
        open: true,
        message: '记录已保存！',
        severity: 'success',
      });
      
      // 重置表单
      setFormData({
        weight: '',
        date: dayjs(),
        notes: '',
        diet_score: 5,
        water_score: 5,
        exercise_score: 5,
        mood_score: 5,
        has_bowel_movement: false,
        sleep_condition: 5,
      });
      
      // 延迟导航到仪表盘
      setTimeout(() => {
        navigate('/');
      }, 1500);
      
    } catch (error) {
      console.error('保存记录失败:', error.message);
      setSnackbar({
        open: true,
        message: `保存失败: ${error.message}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>记录健康数据</Typography>
      
      <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="日期"
                  value={formData.date}
                  onChange={handleDateChange}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                  maxDate={dayjs()}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="weight"
                label="体重 (kg)"
                type="number"
                value={formData.weight}
                onChange={handleChange}
                fullWidth
                required
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                <RestaurantIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                饮食评分 (1-10)
              </Typography>
              <Box sx={{ px: 2 }}>
                <Rating
                  name="diet_score"
                  value={formData.diet_score}
                  onChange={handleRatingChange('diet_score')}
                  max={10}
                  size="large"
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  1 = 很差 (暴饮暴食), 10 = 非常好 (均衡健康饮食)
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                <WaterDropIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                饮水评分 (1-10)
              </Typography>
              <Box sx={{ px: 2 }}>
                <Rating
                  name="water_score"
                  value={formData.water_score}
                  onChange={handleRatingChange('water_score')}
                  max={10}
                  size="large"
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  1 = 很少 (几乎没喝水), 10 = 充足 (2升以上)
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                <FitnessCenterIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                运动评分 (1-10)
              </Typography>
              <Box sx={{ px: 2 }}>
                <Rating
                  name="exercise_score"
                  value={formData.exercise_score}
                  onChange={handleRatingChange('exercise_score')}
                  max={10}
                  size="large"
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  1 = 无运动, 10 = 高强度运动
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                <FavoriteIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                心情评分 (1-10)
              </Typography>
              <Box sx={{ px: 2 }}>
                <Rating
                  name="mood_score"
                  value={formData.mood_score}
                  onChange={handleRatingChange('mood_score')}
                  max={10}
                  icon={<FavoriteIcon fontSize="inherit" />}
                  emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
                  size="large"
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  1 = 非常糟糕, 10 = 非常愉快
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                <BedtimeIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                睡眠评分 (1-10)
              </Typography>
              <Box sx={{ px: 2 }}>
                <Rating
                  name="sleep_condition"
                  value={formData.sleep_condition}
                  onChange={handleRatingChange('sleep_condition')}
                  max={10}
                  size="large"
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  1 = 睡眠质量差, 10 = 睡眠质量好
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.has_bowel_movement}
                    onChange={handleSwitchChange}
                    name="has_bowel_movement"
                    color="primary"
                  />
                }
                label="今日排便情况"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="notes"
                label="备注"
                value={formData.notes}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                placeholder="记录你的感受、饮食情况或运动记录..."
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                fullWidth
                disabled={loading}
              >
                {loading ? '保存中...' : '保存记录'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RecordForm;