// WeightHistory.js
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  CircularProgress,
  Rating,
  Tooltip,
  Menu,
  MenuItem,
  Checkbox,
  FormControlLabel,
  useMediaQuery,
  useTheme,
  Switch,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import SearchIcon from "@mui/icons-material/Search";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import BedtimeIcon from "@mui/icons-material/Bedtime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useAuth } from "../contexts/AuthContext";
import { useWeightHistory } from "../hooks/useWeightHistory";

const WeightHistory = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    records,
    filteredRecords,
    loading,
    searchTerm,
    deleteDialog,
    bulkDeleteDialog,
    selectedRecords,
    selectAll,
    importLoading,
    importMenuAnchor,
    showWeight,
    exportFileName,
    exportDialog,
    handleSearchChange,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleSelectRecord,
    handleSelectAll,
    handleBulkDeleteClick,
    handleBulkDeleteConfirm,
    handleBulkDeleteCancel,
    handleImportMenuOpen,
    handleImportMenuClose,
    handleJsonImport,
    handleExcelImport,
    handleImport,
    handleExportExcel,
    handleExportConfirm,
    handleExportCancel,
    getWeightChange,
    toggleShowWeight,
    setExportFileName,
  } = useWeightHistory(user);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const MobileCardView = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
        <TextField
          size="small"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="搜索记录"
          sx={{ mb: 1 }}
        />
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            onClick={handleImportMenuOpen}
            variant="contained"
            startIcon={<UploadFileIcon />}
            endIcon={<ArrowDropDownIcon />}
            disabled={importLoading}
            size="small"
          >
            导入
          </Button>
          <Button onClick={handleExportExcel} variant="outlined" size="small">
            导出
          </Button>
          <FormControlLabel
            control={
              <Switch checked={showWeight} onChange={toggleShowWeight} />
            }
            label="显示体重"
            sx={{ ml: "auto" }}
          />
        </Box>
      </Box>
      {filteredRecords.map((record, index) => (
        <Paper
          key={record.id}
          sx={{ p: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {new Date(record.date).toLocaleDateString()}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {getWeightChange(index) && (
                <Chip
                  label={
                    showWeight
                      ? `${getWeightChange(index).isGain ? "+" : "-"}${Math.abs(
                          getWeightChange(index).value
                        )} kg`
                      : "***"
                  }
                  color={getWeightChange(index).isGain ? "error" : "success"}
                  size="small"
                />
              )}
              <Typography variant="h6" color="primary.main">
                {showWeight ? `${record.weight} kg` : "***"}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
            <Chip
              icon={<RestaurantIcon fontSize="small" />}
              label={`饮食: ${record.diet_score || 0}`}
              size="small"
            />
            <Chip
              icon={<WaterDropIcon fontSize="small" />}
              label={`饮水: ${record.water_score || 0}`}
              size="small"
            />
            <Chip
              icon={<FitnessCenterIcon fontSize="small" />}
              label={`运动: ${record.exercise_score || 0}`}
              size="small"
            />
            <Chip
              icon={
                record.has_bowel_movement ? (
                  <CheckCircleIcon fontSize="small" />
                ) : (
                  <CancelIcon fontSize="small" />
                )
              }
              label={`排便: ${record.has_bowel_movement ? "是" : "否"}`}
              size="small"
            />
          </Box>

          {record.notes && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              {record.notes}
            </Typography>
          )}

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <IconButton
              onClick={() => handleDeleteClick(record.id)}
              color="error"
              size="small"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      ))}
    </Box>
  );

  return isMobile ? (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h4" gutterBottom>
        体重历史记录
      </Typography>
      <MobileCardView />
    </Box>
  ) : (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h4" gutterBottom>
        体重历史记录
      </Typography>

      <Box
        sx={{
          display: "flex",
          mb: 2,
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <TextField
          placeholder="搜索记录..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{
            flexGrow: 1,
            maxWidth: { xs: "100%", sm: 300 },
            mb: { xs: 1, sm: 0 },
          }}
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
              onChange={toggleShowWeight}
              color="primary"
            />
          }
          label="显示体重数值"
          sx={{ minWidth: "150px" }}
        />

        <Button
          variant="contained"
          startIcon={<UploadFileIcon />}
          endIcon={<ArrowDropDownIcon />}
          disabled={importLoading}
          onClick={handleImportMenuOpen}
          sx={{ minWidth: "120px" }}
        >
          {importLoading ? "导入中..." : "导入数据"}
        </Button>

        <Button
          variant="contained"
          color="success"
          startIcon={<FileDownloadIcon />}
          onClick={handleExportExcel}
          sx={{ minWidth: "120px" }}
        >
          导出Excel
        </Button>

        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteSweepIcon />}
          disabled={selectedRecords.length === 0}
          onClick={handleBulkDeleteClick}
          sx={{ minWidth: "120px" }}
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
      </Box>

      {filteredRecords.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6">
            {records.length === 0 ? "还没有记录数据" : "没有找到匹配的记录"}
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
                    indeterminate={
                      selectedRecords.length > 0 &&
                      selectedRecords.length < filteredRecords.length
                    }
                  />
                </TableCell>
                <TableCell>日期</TableCell>
                <TableCell>体重 (kg)</TableCell>
                <TableCell>变化</TableCell>
                <TableCell align="center">
                  <Tooltip title="饮食评分">
                    <RestaurantIcon />
                  </Tooltip>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="饮水评分">
                    <WaterDropIcon />
                  </Tooltip>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="运动评分">
                    <FitnessCenterIcon />
                  </Tooltip>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="心情评分">
                    <FavoriteIcon />
                  </Tooltip>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="睡眠评分">
                    <BedtimeIcon />
                  </Tooltip>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="排便情况">💩</Tooltip>
                </TableCell>
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
                    <TableCell>
                      {new Date(record.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {showWeight ? record.weight : "******"}
                    </TableCell>
                    <TableCell>
                      {weightChange && (
                        <Chip
                          label={
                            showWeight
                              ? `${weightChange.isGain ? "+" : "-"}${Math.abs(
                                  weightChange.value
                                )} kg`
                              : "******"
                          }
                          color={weightChange.isGain ? "error" : "success"}
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {record.diet_score !== null ? (
                        <Rating
                          value={record.diet_score}
                          readOnly
                          max={10}
                          size="small"
                        />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {record.water_score !== null ? (
                        <Rating
                          value={record.water_score}
                          readOnly
                          max={10}
                          size="small"
                        />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {record.exercise_score !== null ? (
                        <Rating
                          value={record.exercise_score}
                          readOnly
                          max={10}
                          size="small"
                        />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {record.mood_score !== null ? (
                        <Rating
                          value={record.mood_score}
                          readOnly
                          max={10}
                          size="small"
                          icon={<FavoriteIcon fontSize="inherit" />}
                          emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
                        />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {record.sleep_condition !== null ? (
                        <Rating
                          value={record.sleep_condition}
                          readOnly
                          max={10}
                          size="small"
                        />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {record.has_bowel_movement !== null ? (
                        record.has_bowel_movement ? (
                          <CheckCircleIcon
                            color="success"
                            fontSize={isMobile ? "small" : "medium"}
                          />
                        ) : (
                          <CancelIcon
                            color="error"
                            fontSize={isMobile ? "small" : "medium"}
                          />
                        )
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {isMobile
                        ? record.notes
                          ? "..."
                          : "-"
                        : record.notes || "-"}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        aria-label="delete"
                        onClick={() => handleDeleteClick(record.id)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
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

      <Dialog open={bulkDeleteDialog.open} onClose={handleBulkDeleteCancel}>
        <DialogTitle>确认批量删除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            你确定要删除选中的 {bulkDeleteDialog.recordIds.length}{" "}
            条记录吗？此操作无法撤销。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBulkDeleteCancel}>取消</Button>
          <Button onClick={handleBulkDeleteConfirm} color="error" autoFocus>
            批量删除
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={exportDialog} onClose={handleExportCancel}>
        <DialogTitle>导出Excel</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            请输入要导出的Excel文件名：
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="文件名"
            fullWidth
            variant="outlined"
            value={exportFileName}
            onChange={(e) => setExportFileName(e.target.value)}
            helperText="文件将以.xlsx格式保存"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleExportCancel}>取消</Button>
          <Button
            onClick={handleExportConfirm}
            color="primary"
            variant="contained"
          >
            导出
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WeightHistory;
