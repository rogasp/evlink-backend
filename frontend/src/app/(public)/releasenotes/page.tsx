// src/app/releasenotes/page.tsx

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

export default async function ReleaseNotesPage() {
  const filePath = path.join(process.cwd(), 'content', 'RELEASE_NOTES.md');
  const file = fs.readFileSync(filePath, 'utf-8');

  const { content } = matter(file);
  const processedContent = await remark().use(html).process(content);
  const htmlContent = processedContent.toString();

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      {/* Hardcoded string */}
      <h1 className="text-3xl font-extrabold text-indigo-700 mb-4">Release Notes</h1>
      <div className="h-px bg-gray-200 mb-8" />
      <article
        className="prose prose-indigo prose-sm sm:prose lg:prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </main>
  );
}
