export const createNewBlock = (type: "text" | "video" | "quiz") => ({
  id: crypto.randomUUID(),
  title: "",
  type,
  content: type === "text" ? { text: "" } : { url: "", title: "" }, // дефолтные данные
});

