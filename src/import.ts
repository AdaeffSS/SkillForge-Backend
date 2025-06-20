import fg from 'fast-glob';
import { resolve } from 'path';

export async function importAllTasks() {
  const tasksDir = resolve(process.cwd(), 'dist/modules/tasks');

  const entries = await fg(['**/*.js'], {
    cwd: tasksDir,
    absolute: true,
    ignore: ['*.js'],
  });

  console.log(`[importAllTasks] Найдено файлов для импорта: ${entries.length}`);
  console.log('tasksDir:', tasksDir);

  const tasksClasses: any[] = []
  for (const filePath of entries) {
    try {
      const module = await import(filePath) as any
      const taskClass = module.default ?? Object.values(module)[0];
      tasksClasses.push(taskClass);
      console.log(`[importAllTasks] Успешно импортирован файл: ${filePath}`);
    } catch (error) {
      console.error(`[importAllTasks] Ошибка при импорте файла: ${filePath}`, error);
    }
  }
  return tasksClasses;
}
