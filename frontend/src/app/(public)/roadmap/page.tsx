import fs from 'fs';
import path from 'path';
import { remark } from 'remark';
import html from 'remark-html';

export default async function RoadmapPage() {
  const filePath = path.join(process.cwd(), 'content', 'ROADMAP.md');
  const file = fs.readFileSync(filePath, 'utf-8');

  const processedContent = await remark().use(html).process(file);
  const htmlContent = processedContent.toString();

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 prose">
      {/* Hardcoded string */}
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">Roadmap</h1>
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </main>
  );
}
