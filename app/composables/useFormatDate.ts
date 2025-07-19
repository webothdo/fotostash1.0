export const useFormatDate = (date: string) => {
  const formattedDate = new Date(date).toLocaleDateString("en-GB", {
    year: "numeric",
    day: "numeric",
    month: "short",
  });
  return formattedDate;
};
