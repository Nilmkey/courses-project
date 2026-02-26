// utils/slugify.ts
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const generateUniqueSlug = async (
  baseText: string,
  checkExists: (slug: string) => Promise<boolean>,
  separator = "-",
): Promise<string> => {
  let slug = slugify(baseText);
  let counter = 1;
  const originalSlug = slug;

  while (await checkExists(slug)) {
    slug = `${originalSlug}${separator}${counter}`;
    counter++;
  }

  return slug;
};

export const generateSlugWithIncrement = (
  baseSlug: string,
  increment: number,
  separator = "-",
): string => {
  return increment === 0 ? baseSlug : `${baseSlug}${separator}${increment}`;
};
