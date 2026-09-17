import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy } from 'lucide-react';

const CodeBlock = ({ inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const codeText = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) {
    return (
      <div className="relative group my-4 rounded-xl overflow-hidden border border-slate-800 bg-slate-950/90 shadow-lg">
        <div className="flex items-center justify-between px-4 py-1.5 bg-slate-900/80 border-b border-slate-800/80 text-xs font-mono text-slate-400">
          <span className="uppercase tracking-wider font-semibold text-indigo-400">{match[1]}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-800"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[10px] text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span className="text-[10px]">Copy</span>
              </>
            )}
          </button>
        </div>
        <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono text-slate-200 leading-relaxed">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      </div>
    );
  }

  if (!inline) {
    return (
      <pre className="p-4 rounded-xl overflow-x-auto bg-slate-950 border border-slate-800 my-4 text-xs sm:text-sm font-mono text-slate-200">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    );
  }

  return (
    <code className="bg-slate-800/80 text-indigo-300 px-1.5 py-0.5 rounded font-mono text-xs font-medium border border-slate-700/50" {...props}>
      {children}
    </code>
  );
};

export const MarkdownRenderer = ({ content }) => {
  return (
    <div className="markdown-body text-slate-300">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock,
          a: ({ node, ...props }) => (
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors font-medium"
              {...props}
            />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-indigo-500 bg-indigo-500/10 px-4 py-3 my-3 rounded-r-xl text-slate-200 not-italic border-slate-800" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4 rounded-xl border border-slate-800">
              <table className="min-w-full divide-y divide-slate-800" {...props} />
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
