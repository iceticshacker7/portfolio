import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DirectoryItem } from "@shared/schemas";
import { useApi } from "@/lib/api";
import { buildDirectoryTree } from "@/lib/content";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Link, useSearchParams } from "react-router-dom";

const ShimmerCard: React.FC = () => {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </CardHeader>
      <CardFooter>
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded w-16"></div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
      </CardFooter>
    </Card>
  );
};

const DirectoryView: React.FC<{
  items: DirectoryItem[];
  onSelect: (item: DirectoryItem) => void;
}> = ({ items, onSelect }) => {
  return (
    <ScrollArea className="max-h-[calc(100vh-200px)] w-full rounded-md border p-4">
      {items.map((item) => (
        <DirectoryItemView
          key={item.id}
          item={item}
          onSelect={onSelect}
          depth={0}
        />
      ))}
    </ScrollArea>
  );
};

const DirectoryItemView: React.FC<{
  item: DirectoryItem;
  onSelect: (item: DirectoryItem) => void;
  depth: number;
}> = ({ item, onSelect, depth }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <motion.div
      style={{ marginLeft: `${depth * 20}px` }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: depth * 0.1 }}
    >
      {item.type === "folder" ? (
        <div>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            aria-label={isOpen ? `Collapse ${item.name}` : `Expand ${item.name}`}
            onClick={() => {
              toggleOpen();
              onSelect(item);
            }}
          >
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          <button
            type="button"
            className="text-sm font-medium hover:text-blue-600"
            onClick={() => {
              toggleOpen();
              onSelect(item);
            }}
          >
            <Folder className="h-4 w-4 inline-block mr-2 text-blue-500" />
            {item.name}
          </button>
          <AnimatePresence>
            {isOpen && item.children && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {item.children.map((child) => (
                  <DirectoryItemView
                    key={child.id}
                    item={child}
                    onSelect={onSelect}
                    depth={depth + 1}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex items-center py-1">
          <File className="h-4 w-4 text-gray-400 mr-2" />
          <Link
            to={`/learning/${item.id}`}
            className="text-sm hover:text-blue-500 hover:underline transition-colors"
          >
            {item.name}
          </Link>
        </div>
      )}
    </motion.div>
  );
};
const summary = (item: DirectoryItem) => {
  const text = item.learningItem?.content.find((c) => c.type === "text")?.content || "";
  return text.length > 100 ? text.slice(0, 100) + "..." : text;
};

const ItemCard: React.FC<{ item: DirectoryItem; onClick: () => void }> = ({
  item,
  onClick,
}) => {
  const cardContent = (
    <Card className="w-full bg-gradient-to-br from-teal-100 to-blue-100 border-0 overflow-hidden cursor-pointer transition-transform transform hover:scale-105 flex flex-col h-full">
      <div className="relative overflow-hidden rounded-md">
        {item.type === "folder" ? (
          <div className="w-full h-32 bg-blue-200 flex items-center justify-center">
            <Folder size={48} className="text-blue-600" />
          </div>
        ) : (
          <div className="w-full h-32 bg-purple-200 flex items-center justify-center">
            <File size={48} className="text-purple-600" />
          </div>
        )}
      </div>
      <CardContent className="p-3 flex-grow">
        <h3 className="text-lg font-semibold mt-1 hover:underline cursor-pointer">
          {item.name}
        </h3>
        {item.type === "file" && item.learningItem && (
          <div className="flex flex-wrap gap-2 mb-4">
            {item.learningItem.keywords.slice(0, 3).map((keyword, index) => (
              <span key={index} className="text-xs text-blue-600">
                {keyword}
              </span>
            ))}
          </div>
        )}
        <p className="text-sm text-gray-600 line-clamp-4">
          {item.type === "folder"
            ? `This folder contains ${item.children?.length || 0} items.`
            : summary(item)}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        {item.type === "folder" ? (
          <span className="text-sm text-gray-500">
            {item.children?.length || 0} items
          </span>
        ) : (
          <ExternalLink
            size={20}
            className="text-blue-600 hover:text-blue-800"
          />
        )}
      </CardFooter>
    </Card>
  );

  return item.type === "file" ? (
    <Link to={`/learning/${item.id}`}>{cardContent}</Link>
  ) : (
    <div onClick={onClick}>{cardContent}</div>
  );
};

const HierarchicalLearningTags: React.FC = () => {
  const { data: items, loading } = useApi<DirectoryItem[]>("/directories", []);
  // The open folder lives in the URL (?folder=id) so it survives reloads and can be linked.
  const [searchParams, setSearchParams] = useSearchParams();
  const directories = buildDirectoryTree(items);

  const findItem = (list: DirectoryItem[], id: string | null): DirectoryItem | null => {
    if (!id) return null;
    for (const item of list) {
      if (item.id === id) return item;
      const found = findItem(item.children || [], id);
      if (found) return found;
    }
    return null;
  };
  const selectedItem = findItem(directories, searchParams.get("folder"));
  const currentItems = selectedItem ? selectedItem.children || [] : directories;

  const handleItemSelection = (item: DirectoryItem) => {
    if (item.type !== "folder") return;
    setSearchParams({ folder: item.id }, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 font-mono py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-3xl sm:text-4xl font-bold mb-2 text-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          My Learning Journey
        </motion.h1>
        <motion.p
          className="text-gray-600 mb-10 text-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          A progression from foundational mathematics to advanced machine
          learning and AI applications.
        </motion.p>
        <div className="flex flex-col lg:flex-row gap-8">
          <motion.div
            className="w-full lg:w-1/3 bg-white rounded-lg shadow-lg p-6"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-4">Topics</h2>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-5 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            ) : directories.length === 0 ? (
              <p className="text-gray-500">No topics yet.</p>
            ) : (
              <DirectoryView items={directories} onSelect={handleItemSelection} />
            )}
          </motion.div>
          <motion.div
            className="w-full lg:w-2/3"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4 gap-2">
                <h2 className="text-2xl font-bold">{selectedItem ? selectedItem.name : "Contents"}</h2>
                {selectedItem && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const parent = findItem(directories, selectedItem.parentId);
                      setSearchParams(parent ? { folder: parent.id } : {}, { replace: true });
                    }}
                  >
                    Up one level
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading
                  ? Array(4)
                      .fill(0)
                      .map((_, index) => <ShimmerCard key={index} />)
                  : currentItems.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        onClick={() => handleItemSelection(item)}
                      />
                    ))}
              </div>
              {!loading && currentItems.length === 0 && (
                <p className="text-gray-500 text-center py-8">This folder is empty.</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HierarchicalLearningTags;
