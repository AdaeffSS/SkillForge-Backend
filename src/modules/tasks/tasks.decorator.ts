import 'reflect-metadata';

/**
 * Декоратор для регистрации метаданных задания
 * @param exam Экзамен (например, "OGE", "EGE")
 * @param subject Предмет (например, "math", "info")
 * @param taskKey Уникальный ключ задания (например, "t_1_1")
 */
export function RegisterTask(exam: string, subject: string, taskKey: string) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    Reflect.defineMetadata('exam', exam, constructor);
    Reflect.defineMetadata('subject', subject, constructor);
    Reflect.defineMetadata('taskKey', taskKey, constructor);
  };
}
