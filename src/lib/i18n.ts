import { useUiStore } from '@/store/useUiStore';

export const translations = {
  en: {
    // General
    settings: 'Settings',
    language: 'Language',
    theme: 'Theme',
    
    // Sidebar
    allTasks: 'All Tasks',
    newList: 'New List',
    newListName: 'New list name',
    
    // TaskList
    unfinished: 'Unfinished',
    inProgress: 'In Progress',
    done: 'Done',
    noTasks: 'No tasks yet. Add one below!',
    addATask: 'Add a task',
    
    // TaskItem
    addSubtask: 'Add sub-task',
    changeIcon: 'Change Icon',
    removeIcon: 'Remove Icon',
    moveToList: 'Move to List',
    delete: 'Delete',
    
    // Status Colors
    doneStatusColor: 'Done Status Color',
    inProgressStatusColor: 'In Progress Status Color',
    unfinishedStatusColor: 'Unfinished Status Color',
  },
  vi: {
    // General
    settings: 'Cài đặt',
    language: 'Ngôn ngữ',
    theme: 'Giao diện',
    
    // Sidebar
    allTasks: 'Tất cả công việc',
    newList: 'Danh sách mới',
    newListName: 'Tên danh sách mới',
    
    // TaskList
    unfinished: 'Chưa làm',
    inProgress: 'Đang làm',
    done: 'Đã xong',
    noTasks: 'Chưa có công việc nào. Hãy thêm ở dưới nhé!',
    addATask: 'Thêm công việc',
    
    // TaskItem
    addSubtask: 'Thêm công việc phụ',
    changeIcon: 'Đổi Biểu tượng',
    removeIcon: 'Xóa Biểu tượng',
    moveToList: 'Chuyển sang Danh sách',
    delete: 'Xóa',
    
    // Status Colors
    doneStatusColor: 'Màu trạng thái Đã xong',
    inProgressStatusColor: 'Màu trạng thái Đang làm',
    unfinishedStatusColor: 'Màu trạng thái Chưa làm',
  }
};

export type TranslationKey = keyof typeof translations.en;

export function useTranslation() {
  const language = useUiStore((state) => state.language);
  
  return (key: TranslationKey) => {
    return translations[language][key] || key;
  };
}
