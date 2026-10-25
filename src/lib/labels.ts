/** Reads a concept slug the way a person would: `as1-1-foundation` becomes "AS1.1 foundation". */
export function conceptLabel(slug: string): string {
  const lesson = /^([a-z]{2}\d*)-(\d+)-(.+)$/.exec(slug);
  if (lesson)
    return `${lesson[1].toUpperCase()}.${lesson[2]} ${lesson[3].replaceAll("-", " ")}`;
  return slug.replaceAll("-", " ");
}
