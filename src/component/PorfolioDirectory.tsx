import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust Firebase import path
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, File } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

interface DirectoryItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  link?: string;
  parentId: string | null;
  children?: DirectoryItem[];
}

interface PublicDirectoryViewProps {
  onFileSelect: (item: DirectoryItem) => void; // Add onFileSelect prop
}

export default function PublicDirectoryView({ onFileSelect }: PublicDirectoryViewProps) {
  const [directories, setDirectories] = useState<DirectoryItem[]>([]);

  useEffect(() => {
    fetchDirectories();
  }, []);

  const fetchDirectories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'directories'));
      const fetchedDirectories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DirectoryItem));
      const structuredDirectories = buildDirectoryTree(fetchedDirectories);
      setDirectories(structuredDirectories);
    } catch (error) {
      console.error('Error fetching directories:', error);
    }
  };

  const buildDirectoryTree = (items: DirectoryItem[]): DirectoryItem[] => {
    const itemMap = new Map<string, DirectoryItem>();
    items.forEach(item => itemMap.set(item.id, { ...item, children: [] }));

    const rootItems: DirectoryItem[] = [];
    itemMap.forEach(item => {
      if (item.parentId === null) {
        rootItems.push(item);
      } else {
        const parent = itemMap.get(item.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(item);
        }
      }
    });

    return rootItems;
  };

  const DirectoryItem: React.FC<{ item: DirectoryItem; depth: number }> = ({ item, depth }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => setIsOpen(!isOpen);

    const handleFileClick = () => {
      if (item.type === 'file' && item.link) {
        onFileSelect(item); // Trigger the onFileSelect callback
      }
    };

    return (
      <div style={{ marginLeft: `${depth * 20}px` }}>
        {item.type === 'folder' ? (
          <div>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={toggleOpen}
            >
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            <span className="ml-1 text-sm font-medium">{item.name}</span>
            {isOpen && item.children && (
              <div>
                {item.children.map((child, index) => (
                  <DirectoryItem key={index} item={child} depth={depth + 1} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center" onClick={handleFileClick}>
            <File className="h-4 w-4 text-muted-foreground" />
            <span className="ml-2 text-sm hover:underline">{item.name}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <ScrollArea className="h-[600px] w-full rounded-md ">
        {directories.map((item, index) => (
          <DirectoryItem key={index} item={item} depth={0} />
        ))}
      </ScrollArea>
    </div>
  );
}