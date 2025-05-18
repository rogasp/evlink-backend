// components/CodeBlock.tsx

export const CodeBlock = ({ code, language = 'yaml' }: { code: string; language?: string }) => (
  <pre className="bg-gray-900 text-white p-4 rounded overflow-auto text-sm">
    <code className={`language-${language}`}>{code}</code>
  </pre>
);
