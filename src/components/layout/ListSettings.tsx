"use client"
import React, { useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button, buttonVariants } from '@/components/ui/button';
import { Trash, Type, Check, AlertCircle, MoreHorizontal, AlignLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { useTranslation } from '@/lib/i18n';

interface ListSettingsProps {
  listId: string;
}

export function ListSettings({ listId }: ListSettingsProps) {
  const { lists, updateList, updateListSettings, deleteList } = useTaskStore();
  const router = useRouter();
  const list = lists.find(l => l.id === listId);
  const [isOpen, setIsOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const t = useTranslation();

  React.useEffect(() => {
    if (list) {
      setEditName(list.name);
      setEditDesc(list.description ?? '');
      setErrorMsg('');
    }
  }, [list?.name, list?.description, isOpen]);

  if (!list) return null;

  const handleSaveName = () => {
    const trimmed = editName.trim();
    if (trimmed.length < 1 || trimmed.length > 30) {
      setErrorMsg('Tên phải từ 1 đến 30 ký tự!');
      setEditName(list.name);
      setTimeout(() => setErrorMsg(''), 3000);
    } else {
      updateList(listId, { name: trimmed });
      setErrorMsg('');
    }
  };

  const handleSaveDesc = () => {
    updateListSettings(listId, { description: editDesc.trim() });
  };

  const handleDelete = () => {
    deleteList(listId);
    router.push('/');
    setIsOpen(false);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-foreground hover:text-foreground")}>
          <MoreHorizontal className="h-4 w-4" />
        </PopoverTrigger>
        <PopoverContent className={cn("p-4 transition-all duration-200", showEmojiPicker ? "w-[400px]" : "w-80")} align="end">
          <div className="space-y-4 max-h-[80vh] overflow-y-auto">
            <h4 className="font-medium leading-none mb-4">{t('listSettings')}</h4>

            {/* List Name */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Type className="w-3.5 h-3.5" /> {t('listName')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className={cn("w-full px-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2", errorMsg ? "border-destructive focus:ring-destructive/50" : "border-border focus:ring-primary/50")}
                />
                <Button size="icon" onClick={handleSaveName} variant="secondary" className="shrink-0">
                  <Check className="w-4 h-4" />
                </Button>
              </div>
              {errorMsg && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" /> {errorMsg}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <AlignLeft className="w-3.5 h-3.5" /> {t('descriptionSubtitle')}
              </label>
              <div className="flex gap-2">
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
                <Button size="icon" onClick={handleSaveDesc} variant="secondary" className="shrink-0 self-end">
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Icon */}
            <div className="space-y-2 pt-2 relative">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2 mb-2">
                {t('iconEmoji')}
              </label>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-muted rounded-md text-xl">
                  {list.icon || '📁'}
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                  {showEmojiPicker ? t('closePicker') : t('chooseEmoji')}
                </Button>
              </div>

              {showEmojiPicker && (
                <div className="mt-2 w-full flex justify-center">
                  <EmojiPicker
                    theme={Theme.DARK}
                    onEmojiClick={(emoji) => {
                      updateListSettings(listId, { icon: emoji.emoji });
                      setShowEmojiPicker(false);
                    }}
                    width="100%"
                    height={320}
                  />
                </div>
              )}
            </div>

            {/* Delete */}
            <div className="pt-4 border-t border-border mt-4">
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger className={cn(buttonVariants({ variant: "destructive" }), "w-full")}>
                  <Trash className="w-4 h-4 mr-2" />
                  {t('deleteList')}
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('areYouSure')}</DialogTitle>
                    <DialogDescription>
                      {t('cannotBeUndone')}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>{t('cancel')}</Button>
                    <Button variant="destructive" onClick={handleDelete}>{t('yesDelete')}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
