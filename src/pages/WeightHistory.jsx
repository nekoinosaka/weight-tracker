import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton, Chip, TextField, InputAdornment,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Button, CircularProgress, Rating, Tooltip, Stack, Menu, MenuItem,
  Checkbox, FormControlLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import SearchIcon from '@mui/icons-material/Search';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import * as XLSX from 'xlsx';
import { useAuth } from '../contexts/AuthContext';
import { recordService } from '../services/supabase';

const WeightHistory = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    recordId: null
  });
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState({
    open: false,
    recordIds: []
  });
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importMenuAnchor, setImportMenuAnchor] = useState(null);
  const [showWeight, setShowWeight] = useState(true); // 添加控制体重显示的状态

  useEffect(() => {
    fetchRecords();
  }, [user]);

  useEffect(() => {
    // 当搜索词或记录变化时，过滤记录
    if (searchTerm.trim() === '') {
      setFilteredRecords(records);
    } else {
      const filtered = records.filter(record => {
        const date = new Date(record.date).toLocaleDateString();
        const weight = record.weight.toString();
        const notes = record.notes || '';
        const dietScore = record.diet_score?.toString() || '';
        const waterScore = record.water_score?.toString() || '';
        const exerciseScore = record.exercise_score?.toString() || '';
        const moodScore = record.mood_score?.toString() || '';
        const sleepScore = record.sleep_condition?.toString() || '';
        
        const searchLower = searchTerm.toLowerCase();
        return (
          date.includes(searchTerm) ||
          weight.includes(searchTerm) ||
          notes.toLowerCase().includes(searchLower) ||
          dietScore.includes(searchTerm) ||
          waterScore.includes(searchTerm) ||
          exerciseScore.includes(searchTerm) ||
          moodScore.includes(searchTerm) ||
          sleepScore.includes(searchTerm)
        );
      });
      setFilteredRecords(filtered);
    }
  }, [searchTerm, records]);

  const fetchRecords = async () => {
    try {
      if (user) {
        setLoading(true);
        const data = await recordService.getRecords(user.id);
        // 按日期排序（最新的在前）
        const sortedData = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecords(sortedData);
        setFilteredRecords(sortedData);
      }
    } catch (error) {
      console.error('获取记录失败:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteClick = (recordId) => {
    setDeleteDialog({
      open: true,
      recordId
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await recordService.deleteRecord(deleteDialog.recordId);
      // 更新本地状态
      setRecords(prevRecords => prevRecords.filter(record => record.id !== deleteDialog.recordId));
      setDeleteDialog({ open: false, recordId: null });
    } catch (error) {
      console.error('删除记录失败:', error.message);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, recordId: null });
  };

  // 批量删除相关处理
  const handleSelectRecord = (recordId) => {
    setSelectedRecords(prev => {
      if (prev.includes(recordId)) {
        return prev.filter(id => id !== recordId);
      } else {
        return [...prev, recordId];
      }
    });
  };

  const handleSelectAll = (event) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    if (checked) {
      // 选择所有过滤后的记录
      setSelectedRecords(filteredRecords.map(record => record.id));
    } else {
      // 取消所有选择
      setSelectedRecords([]);
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedRecords.length === 0) return;
    setBulkDeleteDialog({
      open: true,
      recordIds: selectedRecords
    });
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      await recordService.bulkDeleteRecords(bulkDeleteDialog.recordIds);
      // 更新本地状态
      setRecords(prevRecords => prevRecords.filter(record => !bulkDeleteDialog.recordIds.includes(record.id)));
      // 重置选择状态
      setSelectedRecords([]);
      setSelectAll(false);
      setBulkDeleteDialog({ open: false, recordIds: [] });
    } catch (error) {
      console.error('批量删除记录失败:', error.message);
      alert(`批量删除失败: ${error.message}`);
    }
  };

  const handleBulkDeleteCancel = () => {
    setBulkDeleteDialog({ open: false, recordIds: [] });
  };

  // 导入菜单处理
  const handleImportMenuOpen = (event) => {
    setImportMenuAnchor(event.currentTarget);
  };

  const handleImportMenuClose = () => {
    setImportMenuAnchor(null);
  };

  // 处理JSON文件导入
  const handleJsonImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    handleImportMenuClose();

    try {
      setImportLoading(true);
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target.result;
          const records = JSON.parse(content);
          
          if (!Array.isArray(records)) {
            alert('导入的文件格式不正确，请确保是有效的JSON数组');
            return;
          }
          
          // 确保每条记录都有user_id
          const recordsWithUserId = records.map(record => ({
            ...record,
            user_id: user.id
          }));
          
          // 检查是否有重复日期
          const dates = recordsWithUserId.map(record => record.date);
          const duplicateDates = await recordService.checkDuplicateDates(user.id, dates);
          
          if (duplicateDates.length > 0) {
            // 格式化日期列表以便于阅读
            const formattedDates = duplicateDates
              .map(date => new Date(date).toLocaleDateString())
              .join(', ');
            
            alert(`导入失败：存在日期相同的数据，请修改导入的文件。\n重复的日期: ${formattedDates}`);
            return;
          }
          
          // 使用批量导入API
          await recordService.bulkAddRecords(recordsWithUserId);
          alert(`成功导入 ${records.length} 条记录`);
          
          // 重新获取记录
          fetchRecords();
        } catch (error) {
          console.error('解析或导入数据失败:', error);
          alert(`导入失败: ${error.message}`);
        } finally {
          setImportLoading(false);
        }
      };
      
      reader.onerror = () => {
        alert('读取文件失败');
        setImportLoading(false);
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('导入过程出错:', error);
      alert(`导入过程出错: ${error.message}`);
      setImportLoading(false);
    }
  };

  // 处理Excel文件导入
  const handleExcelImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    handleImportMenuClose();

    try {
      setImportLoading(true);
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);

          // 设置日期处理选项，确保正确解析日期
          const workbook = XLSX.read(data, { 
            type: 'array',
            cellDates: true, // 将日期单元格转换为JS日期对象
            dateNF: 'yyyy-mm-dd' // 指定日期格式
          });

          // 获取第一个工作表
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // 直接访问工作表单元格，了解数据结构
          console.log('工作表数据:', worksheet);
          
          // 将工作表转换为JSON，同时获取原始值和格式化值
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            raw: true, // 获取原始值
            rawNumbers: true, // 保持数字为数字
            defval: null // 设置默认值为null
          });
          
          // 检查第一条记录，了解数据结构
          if (jsonData.length > 0) {
            console.log('第一条记录样本:', jsonData[0]);
          }
          
          // 检查第一条记录，了解数据结构
          if (jsonData.length > 0) {
            console.log('第一条记录样本:', jsonData[0]);
          }
          
          if (!Array.isArray(jsonData) || jsonData.length === 0) {
            alert('Excel文件中没有找到有效数据');
            return;
          }
          
          // 映射Excel数据到应用程序所需的格式
          const mappedRecords = jsonData.map(row => {
            // 尝试识别并映射列名
            const record = {
              user_id: user.id,
              weight: parseFloat(row.weight || row.Weight || row['体重'] || 0),
              notes: row.notes || row.Notes || row['备注'] || '',
              diet_score: parseInt(row.diet_score || row['饮食评分'] || row['Diet Score'] || 0),
              water_score: parseInt(row.water_score || row['饮水评分'] || row['Water Score'] || 0),
              exercise_score: parseInt(row.exercise_score || row['运动评分'] || row['Exercise Score'] || 0),
              mood_score: parseInt(row.mood_score || row['心情评分'] || row['Mood Score'] || 0),
              sleep_condition: parseInt(row.sleep_condition || row['睡眠评分'] || row['Sleep Score'] || 0),
              has_bowel_movement: Boolean(row.has_bowel_movement || row['排便情况'] || row['Bowel Movement'] || false)
            };
            
            // 处理日期 - 优先使用原始单元格数据
            let dateValue = row.date || row.Date || row['日期'];
            
            // 如果日期值是日期对象，直接格式化
            if (dateValue instanceof Date) {
              record.date = dateValue.toISOString().split('T')[0];
            }
            // 如果是字符串，尝试解析
            else if (typeof dateValue === 'string') {
              // 检查是否已经是YYYY-MM-DD格式
              if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
                record.date = dateValue;
              } else {
                // 尝试解析其他格式的日期字符串
                const dateObj = new Date(dateValue);
                if (!isNaN(dateObj.getTime())) {
                  record.date = dateObj.toISOString().split('T')[0];
                } else {
                  // 如果无法解析，使用当前日期
                  record.date = new Date().toISOString().split('T')[0];
                }
              }
            }
            // 如果是数字（Excel序列号），转换为日期
            else if (typeof dateValue === 'number') {
              // Excel日期是从1900年1月1日开始的天数
              // 需要转换为JavaScript日期
              const excelEpoch = new Date(1899, 11, 30); // Excel的起始日期是1900年1月0日
              const msPerDay = 24 * 60 * 60 * 1000;
              const dateObj = new Date(excelEpoch.getTime() + dateValue * msPerDay);
              record.date = dateObj.toISOString().split('T')[0];
            }
            // 如果没有日期值，使用当前日期
            else {
              record.date = new Date().toISOString().split('T')[0];
            }
            
            // 验证体重是否为有效数字
            if (isNaN(record.weight) || record.weight <= 0) {
              record.weight = 0; // 设置默认值或标记为无效
            }
            
            return record;
          });
          
          // 过滤掉无效记录（例如体重为0的记录）
          const validRecords = mappedRecords.filter(record => record.weight > 0);
          
          if (validRecords.length === 0) {
            alert('没有找到有效的记录数据，请确保Excel文件包含体重列');
            return;
          }
          
          // 检查是否有重复日期
          const dates = validRecords.map(record => record.date);
          const duplicateDates = await recordService.checkDuplicateDates(user.id, dates);
          
          if (duplicateDates.length > 0) {
            // 格式化日期列表以便于阅读
            const formattedDates = duplicateDates
              .map(date => new Date(date).toLocaleDateString())
              .join(', ');
            
            alert(`导入失败：存在日期相同的数据，请修改导入的文件。\n重复的日期: ${formattedDates}`);
            return;
          }
          
          // 使用批量导入API
          await recordService.bulkAddRecords(validRecords);
          alert(`成功导入 ${validRecords.length} 条记录`);
          
          // 重新获取记录
          fetchRecords();
        } catch (error) {
          console.error('解析或导入Excel数据失败:', error);
          alert(`导入失败: ${error.message}`);
        } finally {
          setImportLoading(false);
        }
      };
      
      reader.onerror = () => {
        alert('读取Excel文件失败');
        setImportLoading(false);
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('导入Excel过程出错:', error);
      alert(`导入过程出错: ${error.message}`);
      setImportLoading(false);
    }
  };
  
  // 兼容旧版本的导入函数
  const handleImport = handleJsonImport;

  // 计算体重变化
  const getWeightChange = (index) => {
    if (index === filteredRecords.length - 1) return null; // 第一条记录没有变化
    
    const currentWeight = filteredRecords[index].weight;
    const previousWeight = filteredRecords[index + 1].weight;
    const change = currentWeight - previousWeight;
    
    return {
      value: change.toFixed(1),
      isGain: change > 0
    };
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
      <Typography variant="h4" gutterBottom>体重历史</Typography>
      
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="搜索日期、体重或备注..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControlLabel
          control={
            <Checkbox
              checked={showWeight}
              onChange={(e) => setShowWeight(e.target.checked)}
              color="primary"
            />
          }
          label="显示体重数值"
          sx={{ minWidth: '150px' }}
        />
        
        <Button
          variant="contained"
          startIcon={<UploadFileIcon />}
          endIcon={<ArrowDropDownIcon />}
          disabled={importLoading}
          onClick={handleImportMenuOpen}
          sx={{ minWidth: '120px' }}
        >
          {importLoading ? '导入中...' : '导入数据'}
        </Button>
        
        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteSweepIcon />}
          disabled={selectedRecords.length === 0}
          onClick={handleBulkDeleteClick}
          sx={{ minWidth: '120px' }}
        >
          批量删除 ({selectedRecords.length})
        </Button>
        
        <Menu
          anchorEl={importMenuAnchor}
          open={Boolean(importMenuAnchor)}
          onClose={handleImportMenuClose}
        >
          <MenuItem component="label">
            导入JSON文件
            <input
              type="file"
              accept=".json"
              hidden
              onChange={handleJsonImport}
              disabled={importLoading}
            />
          </MenuItem>
          <MenuItem component="label">
            导入Excel文件
            <input
              type="file"
              accept=".xlsx,.xls"
              hidden
              onChange={handleExcelImport}
              disabled={importLoading}
            />
          </MenuItem>
        </Menu>
      </Stack>
      
      {filteredRecords.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">
            {records.length === 0 ? '还没有记录数据' : '没有找到匹配的记录'}
          </Typography>
          {records.length === 0 && (
            <Typography variant="body1" sx={{ mt: 1 }}>
              开始记录你的体重，以便跟踪你的减肥进度！
            </Typography>
          )}
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectAll}
                    onChange={handleSelectAll}
                    indeterminate={selectedRecords.length > 0 && selectedRecords.length < filteredRecords.length}
                  />
                </TableCell>
                <TableCell>日期</TableCell>
                <TableCell>体重 (kg)</TableCell>
                <TableCell>变化</TableCell>
                <TableCell align="center"><Tooltip title="饮食评分"><RestaurantIcon /></Tooltip></TableCell>
                <TableCell align="center"><Tooltip title="饮水评分"><WaterDropIcon /></Tooltip></TableCell>
                <TableCell align="center"><Tooltip title="运动评分"><FitnessCenterIcon /></Tooltip></TableCell>
                <TableCell align="center"><Tooltip title="心情评分"><FavoriteIcon /></Tooltip></TableCell>
                <TableCell align="center"><Tooltip title="睡眠评分"><BedtimeIcon /></Tooltip></TableCell>
                <TableCell align="center"><Tooltip title="排便情况">💩</Tooltip></TableCell>
                <TableCell>备注</TableCell>
                <TableCell align="right">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecords.map((record, index) => {
                const weightChange = getWeightChange(index);
                
                return (
                  <TableRow key={record.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedRecords.includes(record.id)}
                        onChange={() => handleSelectRecord(record.id)}
                      />
                    </TableCell>
                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                    <TableCell>{showWeight ? record.weight : '******'}</TableCell>
                    <TableCell>
                      {weightChange && (
                        <Chip 
                          label={showWeight ? `${weightChange.isGain ? '+' : '-'}${Math.abs(weightChange.value)} kg` : '******'}
                          color={weightChange.isGain ? 'error' : 'success'}
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {record.diet_score !== null ? (
                        <Rating value={record.diet_score} readOnly max={10} size="small" />
                      ) : '-'}
                    </TableCell>
                    <TableCell align="center">
                      {record.water_score !== null ? (
                        <Rating value={record.water_score} readOnly max={10} size="small" />
                      ) : '-'}
                    </TableCell>
                    <TableCell align="center">
                      {record.exercise_score !== null ? (
                        <Rating value={record.exercise_score} readOnly max={10} size="small" />
                      ) : '-'}
                    </TableCell>
                    <TableCell align="center">
                      {record.mood_score !== null ? (
                        <Rating 
                          value={record.mood_score} 
                          readOnly 
                          max={10} 
                          size="small"
                          icon={<FavoriteIcon fontSize="inherit" />}
                        />
                      ) : '-'}
                    </TableCell>
                    <TableCell align="center">
                      {record.sleep_condition !== null ? (
                        <Rating 
                          value={record.sleep_condition} 
                          readOnly 
                          max={10} 
                          size="small"
                        />
                      ) : '-'}
                    </TableCell>
                    <TableCell align="center">
                      {record.has_bowel_movement !== null ? (
                        record.has_bowel_movement ? 
                          <CheckCircleIcon color="success" fontSize="small" /> : 
                          <CancelIcon color="error" fontSize="small" />
                      ) : '-'}
                    </TableCell>
                    <TableCell>{record.notes || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton 
                        aria-label="delete" 
                        onClick={() => handleDeleteClick(record.id)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* 删除确认对话框 */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            你确定要删除这条记录吗？此操作无法撤销。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>取消</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            删除
          </Button>
        </DialogActions>
      </Dialog>

      {/* 批量删除确认对话框 */}
      <Dialog
        open={bulkDeleteDialog.open}
        onClose={handleBulkDeleteCancel}
      >
        <DialogTitle>确认批量删除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            你确定要删除选中的 {bulkDeleteDialog.recordIds.length} 条记录吗？此操作无法撤销。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBulkDeleteCancel}>取消</Button>
          <Button onClick={handleBulkDeleteConfirm} color="error" autoFocus>
            批量删除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WeightHistory;