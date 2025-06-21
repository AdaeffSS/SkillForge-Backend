export const NamePicker = () => {
    const names = ["Андрей", "Олег", "Стёпа", "Максим"];
    return names[Math.floor(Math.random() * names.length)];
}
