export function toSlug(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function uniqueSlug(name, prismaModel, excludeId = null) {
  const base = toSlug(name);
  let candidate = base;
  let counter = 2;

  while (true) {
    const where = excludeId
      ? { slug: candidate, NOT: { id: excludeId } }
      : { slug: candidate };
    const exists = await prismaModel.findFirst({ where });
    if (!exists) return candidate;
    candidate = `${base}-${counter++}`;
  }
}
