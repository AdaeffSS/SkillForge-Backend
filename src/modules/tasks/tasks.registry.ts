import { BaseTask } from './baseTask';

export const tasksRegistry: Array<new (...args: any[]) => BaseTask<any>> = [];
