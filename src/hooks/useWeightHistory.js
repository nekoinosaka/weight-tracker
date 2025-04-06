// useWeightHistory.js
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { recordService } from "../services/supabase";

export const useWeightHistory = (user) => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date(),
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    recordId: null,
  });
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState({
    open: false,
    recordIds: [],
  });
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importMenuAnchor, setImportMenuAnchor] = useState(null);
  const [showWeight, setShowWeight] = useState(true);
  const [exportFileName, setExportFileName] = useState("健康记录数据");
  const [exportDialog, setExportDialog] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, [user]);

  useEffect(() => {
    let filtered = records;

    // 应用搜索条件
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((record) => {
        const date = new Date(record.date).toLocaleDateString();
        const weight = record.weight.toString();
        const notes = record.notes || "";
        const dietScore = record.diet_score?.toString() || "";
        const waterScore = record.water_score?.toString() || "";
        const exerciseScore = record.exercise_score?.toString() || "";
        const moodScore = record.mood_score?.toString() || "";
        const sleepScore = record.sleep_condition?.toString() || "";

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
    }

    // 应用日期范围筛选
    filtered = filtered.filter((record) => {
      const recordDate = new Date(record.date);
      return (
        recordDate >= dateRange.startDate && recordDate <= dateRange.endDate
      );
    });

    setFilteredRecords(filtered);
  }, [searchTerm, records, dateRange]);

  const fetchRecords = async () => {
    try {
      if (user) {
        setLoading(true);
        const data = await recordService.getRecords(user.id);
        const sortedData = [...data].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setRecords(sortedData);
        setFilteredRecords(sortedData);
      }
    } catch (error) {
      console.error("获取记录失败:", error.message);
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
      recordId,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await recordService.deleteRecord(deleteDialog.recordId);
      setRecords((prevRecords) =>
        prevRecords.filter((record) => record.id !== deleteDialog.recordId)
      );
      setDeleteDialog({ open: false, recordId: null });
    } catch (error) {
      console.error("删除记录失败:", error.message);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, recordId: null });
  };

  const handleSelectRecord = (recordId) => {
    setSelectedRecords((prev) => {
      if (prev.includes(recordId)) {
        return prev.filter((id) => id !== recordId);
      } else {
        return [...prev, recordId];
      }
    });
  };

  const handleSelectAll = (event) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    if (checked) {
      setSelectedRecords(filteredRecords.map((record) => record.id));
    } else {
      setSelectedRecords([]);
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedRecords.length === 0) return;
    setBulkDeleteDialog({
      open: true,
      recordIds: selectedRecords,
    });
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      await recordService.bulkDeleteRecords(bulkDeleteDialog.recordIds);
      setRecords((prevRecords) =>
        prevRecords.filter(
          (record) => !bulkDeleteDialog.recordIds.includes(record.id)
        )
      );
      setSelectedRecords([]);
      setSelectAll(false);
      setBulkDeleteDialog({ open: false, recordIds: [] });
    } catch (error) {
      console.error("批量删除记录失败:", error.message);
      alert(`批量删除失败: ${error.message}`);
    }
  };

  const handleBulkDeleteCancel = () => {
    setBulkDeleteDialog({ open: false, recordIds: [] });
  };

  const handleImportMenuOpen = (event) => {
    setImportMenuAnchor(event.currentTarget);
  };

  const handleImportMenuClose = () => {
    setImportMenuAnchor(null);
  };

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
            alert("导入的文件格式不正确，请确保是有效的JSON数组");
            return;
          }

          const recordsWithUserId = records.map((record) => ({
            ...record,
            user_id: user.id,
          }));

          const dates = recordsWithUserId.map((record) => record.date);
          const duplicateDates = await recordService.checkDuplicateDates(
            user.id,
            dates
          );

          if (duplicateDates.length > 0) {
            const formattedDates = duplicateDates
              .map((date) => new Date(date).toLocaleDateString())
              .join(", ");

            alert(
              `导入失败：存在日期相同的数据，请修改导入的文件。\n重复的日期: ${formattedDates}`
            );
            return;
          }

          await recordService.bulkAddRecords(recordsWithUserId);
          alert(`成功导入 ${records.length} 条记录`);
          fetchRecords();
        } catch (error) {
          console.error("解析或导入数据失败:", error);
          alert(`导入失败: ${error.message}`);
        } finally {
          setImportLoading(false);
        }
      };

      reader.onerror = () => {
        alert("读取文件失败");
        setImportLoading(false);
      };

      reader.readAsText(file);
    } catch (error) {
      console.error("导入过程出错:", error);
      alert(`导入过程出错: ${error.message}`);
      setImportLoading(false);
    }
  };

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
          const workbook = XLSX.read(data, {
            type: "array",
            cellDates: true,
            dateNF: "yyyy-mm-dd",
          });

          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            raw: false,
            rawNumbers: true,
            defval: null,
          });

          if (!Array.isArray(jsonData) || jsonData.length === 0) {
            alert("Excel文件中没有找到有效数据");
            return;
          }

          const mappedRecords = jsonData.map((row) => {
            const record = {
              user_id: user.id,
              weight: parseFloat(row.weight || row.Weight || row["体重"] || 0),
              notes: row.notes || row.Notes || row["备注"] || "",
              diet_score: parseInt(
                row.diet_score || row["饮食评分"] || row["Diet Score"] || 0
              ),
              water_score: parseInt(
                row.water_score || row["饮水评分"] || row["Water Score"] || 0
              ),
              exercise_score: parseInt(
                row.exercise_score ||
                  row["运动评分"] ||
                  row["Exercise Score"] ||
                  0
              ),
              mood_score: parseInt(
                row.mood_score || row["心情评分"] || row["Mood Score"] || 0
              ),
              sleep_condition: parseInt(
                row.sleep_condition ||
                  row["睡眠评分"] ||
                  row["Sleep Score"] ||
                  0
              ),
              has_bowel_movement: Boolean(
                row.has_bowel_movement ||
                  row["排便情况"] ||
                  row["Bowel Movement"] ||
                  false
              ),
            };

            let dateValue = row.date || row.Date || row["日期"];
            if (dateValue instanceof Date) {
              record.date = dateValue.toISOString().split("T")[0];
            } else if (typeof dateValue === "string") {
              if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
                record.date = dateValue;
              } else {
                const dateObj = new Date(dateValue);
                if (!isNaN(dateObj.getTime())) {
                  record.date = dateObj.toISOString().split("T")[0];
                } else {
                  record.date = new Date().toISOString().split("T")[0];
                }
              }
            } else if (typeof dateValue === "number") {
              const excelEpoch = new Date(1899, 11, 30);
              const msPerDay = 24 * 60 * 60 * 1000;
              const dateObj = new Date(
                excelEpoch.getTime() + dateValue * msPerDay
              );
              record.date = dateObj.toISOString().split("T")[0];
            } else {
              record.date = new Date().toISOString().split("T")[0];
            }

            if (isNaN(record.weight) || record.weight <= 0) {
              record.weight = 0;
            }

            return record;
          });

          const validRecords = mappedRecords.filter(
            (record) => record.weight > 0
          );

          if (validRecords.length === 0) {
            alert("没有找到有效的记录数据，请确保Excel文件包含体重列");
            return;
          }

          const dates = validRecords.map((record) => record.date);
          const duplicateDates = await recordService.checkDuplicateDates(
            user.id,
            dates
          );

          if (duplicateDates.length > 0) {
            const formattedDates = duplicateDates
              .map((date) => new Date(date).toLocaleDateString())
              .join(", ");

            alert(
              `导入失败：存在日期相同的数据，请修改导入的文件。\n重复的日期: ${formattedDates}`
            );
            return;
          }

          await recordService.bulkAddRecords(validRecords);
          alert(`成功导入 ${validRecords.length} 条记录`);
          fetchRecords();
        } catch (error) {
          console.error("解析或导入Excel数据失败:", error);
          alert(`导入失败: ${error.message}`);
        } finally {
          setImportLoading(false);
        }
      };

      reader.onerror = () => {
        alert("读取Excel文件失败");
        setImportLoading(false);
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("导入Excel过程出错:", error);
      alert(`导入过程出错: ${error.message}`);
      setImportLoading(false);
    }
  };

  const handleImport = handleJsonImport;

  const handleExportExcel = () => {
    setExportDialog(true);
  };

  const handleExportConfirm = () => {
    try {
      const exportData = filteredRecords.map((record) => ({
        日期: new Date(record.date).toLocaleDateString(),
        "体重(kg)": record.weight,
        饮食评分: record.diet_score || 0,
        饮水评分: record.water_score || 0,
        运动评分: record.exercise_score || 0,
        心情评分: record.mood_score || 0,
        睡眠评分: record.sleep_condition || 0,
        排便情况: record.has_bowel_movement ? "是" : "否",
        备注: record.notes || "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const columnWidths = [
        { wch: 12 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 30 },
      ];
      worksheet["!cols"] = columnWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "健康记录");
      XLSX.writeFile(workbook, `${exportFileName}.xlsx`);
      setExportDialog(false);
    } catch (error) {
      console.error("导出Excel失败:", error);
      alert(`导出失败: ${error.message}`);
      setExportDialog(false);
    }
  };

  const handleExportCancel = () => {
    setExportDialog(false);
  };

  const getWeightChange = (index) => {
    if (index === filteredRecords.length - 1) return null;
    const currentWeight = filteredRecords[index].weight;
    const previousWeight = filteredRecords[index + 1].weight;
    const change = currentWeight - previousWeight;
    return {
      value: change.toFixed(1),
      isGain: change > 0,
    };
  };

  const toggleShowWeight = () => {
    setShowWeight(!showWeight);
  };

  return {
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
    dateRange,
    setDateRange,
  };
};
