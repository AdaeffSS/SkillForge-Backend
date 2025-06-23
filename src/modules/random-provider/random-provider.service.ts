import { Injectable } from "@nestjs/common";

@Injectable()
export class RandomProvider {
  private readonly seed: number;
  private state: number;

  constructor(seed?: number) {
    this.seed = seed ?? Date.now();
    this.state = this.seed;
  }

  next(): number {
    this.state = (this.state * 1664525 + 1013904223) % 0x100000000;
    return this.state / 0x100000000;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick<T>(arr: T[]): T {
    if (!arr.length) throw new Error("Cannot pick from empty array");
    return arr[this.nextInt(0, arr.length - 1)];
  }

  getRandomName(gender?: "male" | "female"): string {
    const maleNames = [
      "Ваня",
      "Петя",
      "Алексей",
      "Дима",
      "Сергей",
      "Андрей",
      "Миша",
      "Коля",
      "Владимир",
      "Женя",
      "Юра",
      "Максим",
      "Витя",
      "Олег",
      "Константин",
      "Вася",
      "Аркадий",
      "Игорь",
      "Рома",
      "Толя",
      "Степа",
    ];

    const femaleNames = [
      "Анна",
      "Мария",
      "Елена",
      "Ольга",
      "Татьяна",
      "Наталья",
      "Светлана",
      "Ирина",
      "Людмила",
      "Вера",
      "Любовь",
      "Екатерина",
      "Юлия",
      "Ксения",
      "Алёна",
      "Валентина",
    ];

    if (!gender) {
      gender = this.pick(["male", "female"]);
    }
    if (gender === "male") {
      return this.pick(maleNames);
    } else return this.pick(femaleNames);
  }

  getSeed(): number {
    return this.seed;
  }
}
