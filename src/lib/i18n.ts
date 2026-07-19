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
    sort: 'Sort',
    sortManual: 'Manual (Drag & Drop)',
    sortStarred: 'Starred First',
    sortName: 'Name (A-Z)',
    sortDate: 'Date Added',
    
    // TaskItem
    addSubtask: 'Add sub-task',
    changeIcon: 'Change Icon',
    removeIcon: 'Remove Icon',
    moveToList: 'Move to List',
    delete: 'Delete',
    note: 'Note',
    addANote: 'Add a note… (Ctrl+Enter to save)',
    save: 'Save',
    editNote: 'Edit note',
    addNote: 'Add note',
    
    // Status Colors
    // Status Colors
    doneStatusColor: 'Done Status Color',
    in_progressStatusColor: 'In Progress Status Color',
    unfinishedStatusColor: 'Unfinished Status Color',
    
    // Appearance & List Settings
    appearance: 'Appearance',
    uploadBackground: 'Upload Background',
    solidColor: 'Solid Color',
    opacity: 'Opacity',
    textColor: 'Text Color',
    customColor: 'Custom Color',
    removeBackground: 'Remove background',
    listSettings: 'List Settings',
    listName: 'List Name',
    descriptionSubtitle: 'Description (subtitle)',
    iconEmoji: 'Icon (Emoji)',
    closePicker: 'Close Picker',
    chooseEmoji: 'Choose Emoji',
    deleteList: 'Delete List',
    areYouSure: 'Are you absolutely sure?',
    cannotBeUndone: 'This action cannot be undone. This will permanently delete the list and all of its tasks.',
    cancel: 'Cancel',
    yesDelete: 'Yes, delete list',
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
    sort: 'Sắp xếp',
    sortManual: 'Thủ công (Kéo thả)',
    sortStarred: 'Có gắn sao',
    sortName: 'Tên (A-Z)',
    sortDate: 'Ngày tạo',
    
    // TaskItem
    addSubtask: 'Thêm công việc phụ',
    changeIcon: 'Đổi Biểu tượng',
    removeIcon: 'Xóa Biểu tượng',
    moveToList: 'Chuyển sang Danh sách',
    delete: 'Xóa',
    note: 'Ghi chú',
    addANote: 'Thêm ghi chú… (Ctrl+Enter để lưu)',
    save: 'Lưu',
    editNote: 'Sửa ghi chú',
    addNote: 'Thêm ghi chú',
    
    // Status Colors
    // Status Colors
    doneStatusColor: 'Màu cho trạng thái đã hoàn thành',
    in_progressStatusColor: 'Màu cho trạng thái đang trong tiến trình',
    unfinishedStatusColor: 'Màu cho trạng thái chưa hoàn thành',
    
    // Appearance & List Settings
    appearance: 'Giao diện',
    uploadBackground: 'Tải ảnh nền lên',
    solidColor: 'Màu đơn sắc',
    opacity: 'Độ mờ',
    textColor: 'Màu chữ',
    customColor: 'Màu tùy chỉnh',
    removeBackground: 'Xóa ảnh nền',
    listSettings: 'Cài đặt danh sách',
    listName: 'Tên danh sách',
    descriptionSubtitle: 'Mô tả (dòng phụ)',
    iconEmoji: 'Biểu tượng (Emoji)',
    closePicker: 'Đóng bảng',
    chooseEmoji: 'Chọn Emoji',
    deleteList: 'Xóa danh sách',
    areYouSure: 'Bạn có chắc chắn không?',
    cannotBeUndone: 'Hành động này không thể hoàn tác. Danh sách và mọi công việc bên trong sẽ bị xóa vĩnh viễn.',
    cancel: 'Hủy',
    yesDelete: 'Có, xóa danh sách',
  }
};

export type TranslationKey = keyof typeof translations.en;

export function useTranslation() {
  const language = useUiStore((state) => state.language);
  
  return (key: TranslationKey) => {
    return translations[language][key] || key;
  };
}
