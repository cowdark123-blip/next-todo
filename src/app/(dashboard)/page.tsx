import { TaskList } from '@/components/tasks/TaskList';

export default function DashboardPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">My Day</h1>
        <p className="text-muted-foreground mt-1">What are you focusing on today?</p>
      </div>
      
      <div className="flex-1">
        <TaskList listId="default-1" />
      </div>
    </div>
  );
}
