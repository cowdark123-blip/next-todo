"use client"
import React, { useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Settings2, Trash, Image as ImageIcon, Type, Palette } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ListSettingsProps {
  listId: string;
}

const AVAILABLE_ICONS = ['Sun', 'Star', 'Home', 'List', 'Briefcase', 'Heart', 'Coffee', 'Book'];

export function ListSettings({ listId }: ListSettingsProps) {
  const { lists, updateList, updateListSettings, deleteList } = useTaskStore();
  const router = useRouter();
  const list = lists.find(l => l.id === listId);
  const [isOpen, setIsOpen] = useState(false);

  if (!list) return null;

  const handleDelete = () => {
    deleteList(listId);
    router.push('/');
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Settings2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <h4 className="font-medium leading-none mb-4">List Settings</h4>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Type className="w-3.5 h-3.5" /> List Name
            </label>
            <input
              type="text"
              value={list.name}
              onChange={(e) => updateList(listId, { name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Palette className="w-3.5 h-3.5" /> Icon
            </label>
            <div className="grid grid-cols-4 gap-2">
              {AVAILABLE_ICONS.map(icon => (
                <button
                  key={icon}
                  onClick={() => updateListSettings(listId, { icon })}
                  className={`p-2 rounded border text-xs text-center transition-colors ${
                    list.icon === icon 
                      ? 'bg-primary/20 border-primary text-primary' 
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5" /> Background URL / Color
            </label>
            <input
              type="text"
              value={list.background || ''}
              onChange={(e) => updateListSettings(listId, { background: e.target.value })}
              placeholder="e.g. #ff0000 or https://..."
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="space-y-4 pt-4">
            <label className="text-xs font-medium text-muted-foreground flex justify-between">
              <span>Background Opacity</span>
              <span>{Math.round((list.bgOpacity ?? 1) * 100)}%</span>
            </label>
            <Slider
              value={[list.bgOpacity ?? 1]}
              max={1}
              step={0.01}
              onValueChange={([val]) => updateListSettings(listId, { bgOpacity: val })}
            />
          </div>

          <div className="pt-4 border-t border-border mt-4">
            <Button variant="destructive" className="w-full" onClick={handleDelete}>
              <Trash className="w-4 h-4 mr-2" />
              Delete List
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
