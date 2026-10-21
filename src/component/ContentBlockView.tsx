import React from "react";
import ReactMarkdown from "react-markdown";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import c from "react-syntax-highlighter/dist/esm/languages/prism/c";
import cpp from "react-syntax-highlighter/dist/esm/languages/prism/cpp";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import java from "react-syntax-highlighter/dist/esm/languages/prism/java";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import r from "react-syntax-highlighter/dist/esm/languages/prism/r";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Expand, ExternalLink, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { ContentBlock } from "@shared/schemas";
import { isUrl } from "@/lib/content";

// Only the languages this portfolio uses are bundled (the full set is ~500 KB).
// Add more here if a code block shows up unhighlighted.
const languages = { bash, sh: bash, shell: bash, c, cpp, "c++": cpp, css, java, javascript, js: javascript, json, jsx, html: markup, xml: markup, markup, python, py: python, r, sql, tsx, typescript, ts: typescript, yaml, yml: yaml };
Object.entries(languages).forEach(([name, lang]) => SyntaxHighlighter.registerLanguage(name, lang));
const lang = (l?: string) => (l || "text").toLowerCase();

// react-markdown never renders raw HTML and strips javascript: links, so text
// blocks are safe to render from the database.
export const Markdown: React.FC<{ children: string }> = ({ children }) => (
  <ReactMarkdown
    components={{
      h1: (props) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
      h2: (props) => <h2 className="text-2xl font-semibold mt-6 mb-3" {...props} />,
      h3: (props) => <h3 className="text-xl font-medium mt-4 mb-2" {...props} />,
      p: (props) => <p className="text-foreground/85 leading-relaxed mb-4" {...props} />,
      ul: (props) => <ul className="list-disc pl-6 mb-4" {...props} />,
      ol: (props) => <ol className="list-decimal pl-6 mb-4" {...props} />,
      li: (props) => <li className="mb-2" {...props} />,
      blockquote: (props) => <blockquote className="border-l-4 border-input pl-4 italic my-4" {...props} />,
      a: (props) => <a className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
      code: ({ className, children, ...props }) => {
        const match = /language-(\w+)/.exec(className || "");
        return match ? (
          <SyntaxHighlighter language={lang(match[1])} style={vscDarkPlus} PreTag="div" customStyle={{ borderRadius: "0.5rem" }}>
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        ) : (
          <code className="bg-muted rounded px-1 py-0.5" {...props}>
            {children}
          </code>
        );
      },
    }}
  >
    {children}
  </ReactMarkdown>
);

const ZoomableImage: React.FC<{ src: string }> = ({ src }) => (
  <TransformWrapper initialScale={1}>
    {({ zoomIn, zoomOut, resetTransform }) => (
      <>
        <div className="mb-2 flex gap-2">
          <Button size="sm" variant="outline" onClick={() => zoomIn()}>Zoom In</Button>
          <Button size="sm" variant="outline" onClick={() => zoomOut()}>Zoom Out</Button>
          <Button size="sm" variant="outline" onClick={() => resetTransform()}>Reset</Button>
        </div>
        <TransformComponent wrapperClass="!w-full rounded-lg border" contentClass="!w-full">
          <img src={src} alt="" loading="lazy" className="w-full h-auto" />
        </TransformComponent>
      </>
    )}
  </TransformWrapper>
);

/** Uploaded/linked HTML and inline HTML both run in a sandbox without same-origin access. */
const HtmlFrame: React.FC<{ content: string; className: string }> = ({ content, className }) =>
  isUrl(content) ? (
    <iframe src={content} title="Embedded content" className={className} sandbox="allow-scripts allow-popups" />
  ) : (
    <iframe srcDoc={content} title="Embedded content" className={className} sandbox="allow-scripts" />
  );

const HtmlBlock: React.FC<{ block: ContentBlock }> = ({ block }) => (
  <div className="w-full">
    <div className="mb-2 flex flex-wrap gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm">
            <Expand className="h-4 w-4 mr-2" />
            Expand
          </Button>
        </DialogTrigger>
        <DialogContent className="w-full max-w-7xl h-[90vh]">
          <DialogTitle className="sr-only">Embedded content</DialogTitle>
          <HtmlFrame content={block.content} className="w-full h-full rounded-lg" />
        </DialogContent>
      </Dialog>
      {block.category && isUrl(block.content) && (
        <Button size="sm" variant="outline" asChild>
          <a href={block.content} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Page
          </a>
        </Button>
      )}
    </div>
    <HtmlFrame content={block.content} className="w-full rounded-lg border h-[500px] md:h-[600px]" />
  </div>
);

export const ContentBlockView: React.FC<{ block: ContentBlock; zoomableImages?: boolean }> = ({ block, zoomableImages }) => {
  switch (block.type) {
    case "text":
      return <Markdown>{block.content}</Markdown>;
    case "code":
      // Older content used code blocks with language "markdown" for formatted write-ups.
      if (/^(markdown|md)$/i.test(block.language || "")) return <Markdown>{block.content}</Markdown>;
      return (
        <SyntaxHighlighter language={lang(block.language)} style={vscDarkPlus} customStyle={{ borderRadius: "0.5rem" }}>
          {block.content}
        </SyntaxHighlighter>
      );
    case "image":
    case "gif":
      if (!block.content) return null;
      return zoomableImages ? (
        <ZoomableImage src={block.content} />
      ) : (
        <img src={block.content} alt="" loading="lazy" className="w-full rounded-lg shadow-md" />
      );
    case "html":
      return block.content ? <HtmlBlock block={block} /> : null;
    case "notebook":
      return (
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-2 flex items-center">
            <FileCode className="h-5 w-5 mr-2" />
            Jupyter Notebook
          </h4>
          {isUrl(block.content) ? (
            <a href={block.content} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-all">
              Open notebook
            </a>
          ) : (
            <pre className="whitespace-pre-wrap overflow-x-auto text-sm">{block.content}</pre>
          )}
        </div>
      );
    default:
      return null;
  }
};
