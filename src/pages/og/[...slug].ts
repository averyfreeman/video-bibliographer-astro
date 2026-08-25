import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';

const entries = await getCollection('docs');
const pages = Object.fromEntries(entries.map(({ data, id }) => [id, { data }]));

type Page = (typeof pages)[string];

export const { getStaticPaths, GET } = await OGImageRoute({
  pages,
  getImageOptions: (_id, page: Page) => ({
    title: page.data.title,
    description: page.data.description,
    bgGradient: [
      [37, 29, 52],
      [110, 58, 165],
    ],
    border: { color: [242, 184, 75], width: 20 },
    padding: 120,
  }),
});
