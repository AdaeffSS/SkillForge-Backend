import 'reflect-metadata';

export function RegisterTask(exam: string, subject: string, taskKey: string) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {

    Reflect.defineMetadata('exam', exam, constructor);
    Reflect.defineMetadata('subject', subject, constructor);
    Reflect.defineMetadata('taskKey', taskKey, constructor);
  };
}
