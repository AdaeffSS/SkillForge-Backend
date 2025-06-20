import 'reflect-metadata';
import { tasksRegistry } from './tasks.registry';

export function RegisterTask(exam: string, subject: string, taskKey: string) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    // Записываем метаданные в класс
    Reflect.defineMetadata('exam', exam, constructor);
    Reflect.defineMetadata('subject', subject, constructor);
    Reflect.defineMetadata('taskKey', taskKey, constructor);

    // Регистрируем класс задания в общем реестре
    tasksRegistry.push(constructor as any);

    // Лог для отладки, чтобы видеть, что класс действительно зарегистрирован
    console.log(`[RegisterTask] Registered task: exam=${exam}, subject=${subject}, taskKey=${taskKey}, class=${constructor.name}`);
  };
}
