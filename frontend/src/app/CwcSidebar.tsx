"use client";
import React, { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon, UserIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

// Updated mock data for CWC hierarchy (positions and names)
const hierarchy = [
  {
    position: "Chairman",
    name: "Atul Jain",
    heading: "Central Water Commission",
    children: [
      {
        position: "Member (D&R)",
        name: "Bhopal Singh",
        children: [
          {
            position: "CE (Design EMO)",
            name: "S. D. Sharma",
            children: []
          },
          {
            position: "CE (Design NW&S)",
            name: "Vivek Tripathi",
            children: []
          },
          {
            position: "CE (PMO)",
            name: "S. S. Bakshi",
            children: []
          },
          {
            position: "CE (BPMO)",
            name: "Bhupinder Singh",
            children: []
          },
          {
            position: "CE (IMO)",
            name: "Rakesh Kashyap",
            children: []
          },
          {
            position: "CE (D&R)",
            name: "D. S. Chaukar",
            children: []
          },
          {
            position: "CE (HQ)",
            name: "B. K. Gangwar",
            children: []
          },
          {
            position: "CE (P&D)",
            name: "B. L. Kalpana",
            children: []
          }
        ]
      },
      {
        position: "Member (WP&P)",
        name: "Yogesh Pathankar",
        children: [
          {
            position: "CE (WP&P)",
            name: "C. C. Vishwakarma",
            children: []
          },
          {
            position: "CE (BMIC)",
            name: "C. E. Singh",
            children: []
          },
          {
            position: "CE (PMO)",
            name: "B. P. Pandey",
            children: []
          },
          {
            position: "CE (PPAO)",
            name: "Ratna Chaudhari",
            children: []
          },
          {
            position: "CE (P&IC)",
            name: "A. K. RIC",
            children: []
          },
          {
            position: "CE (P&IC)",
            name: "K. K. Pandit",
            children: []
          },
          {
            position: "CE (P&IC)",
            name: "K. K. Singh",
            children: []
          }
        ]
      },
      {
        position: "Member (RM)",
        name: "Anupam Prasad",
        children: [
          {
            position: "Reading Secretary",
            name: "CE (BBOC)",
            children: []
          },
          {
            position: "CE (BBOC)",
            name: "N. K. Ali",
            children: []
          },
          {
            position: "CE (BBOC)",
            name: "Rajesh Kumar",
            children: []
          },
          {
            position: "CE (BBOC)",
            name: "D. S. Chaukar",
            children: []
          },
          {
            position: "CE (BBOC)",
            name: "Aditya Sharma",
            children: []
          },
          {
            position: "CE (BBOC)",
            name: "CE (BBOC) Lucknow",
            children: []
          },
          {
            position: "CE (BBOC)",
            name: "CE (BBOC) Kolkata",
            children: []
          },
          {
            position: "CE (BBOC)",
            name: "CE (BBOC) Patna",
            children: []
          },
          {
            position: "CE (BBOC)",
            name: "CE (BBOC) Bhopal",
            children: []
          },
          {
            position: "CE (BBOC)",
            name: "CE (BBOC) New Delhi",
            children: []
          },
          {
            position: "CE (BBOC)",
            name: "CE (BBOC) Chandigarh",
            children: []
          },
          {
            position: "CE (BBOC)",
            name: "CE (BBOC) Hyderabad",
            children: []
          },
          {
            position: "CE (BBOC)",
            name: "CE (BBOC) Bengaluru",
            children: []
          },
          {
            position: "CE (BBOC)",
            name: "CE (BBOC) Guwahati",
            children: []
          },
          {
            position: "CE (BBOC)",
            name: "CE (BBOC) Ahmedabad",
            children: []
          },
          {
            position: "CE (BBOC)",
            name: "CE (BBOC) Pune",
            children: []
          },
          {
            position: "CE (BBOC)",
            name: "CE (BBOC) Jaipur",
            children: []
          }
        ]
      }
    ]
  }
];

type HierarchyNode = {
  position: string;
  name?: string;
  heading?: string;
  children?: HierarchyNode[];
};

function filterHierarchy(nodes: HierarchyNode[], query: string): HierarchyNode[] {
  if (!query.trim()) return nodes;
  const q = query.toLowerCase();
  function filterNode(node: HierarchyNode): HierarchyNode | null {
    const match =
      node.position.toLowerCase().includes(q) ||
      (node.heading && node.heading.toLowerCase().includes(q));
    const filteredChildren = node.children
      ? node.children.map(filterNode).filter(Boolean) as HierarchyNode[]
      : [];
    if (match || filteredChildren.length > 0) {
      return { ...node, children: filteredChildren };
    }
    return null;
  }
  return nodes.map(filterNode).filter(Boolean) as HierarchyNode[];
}

const TreeNode: React.FC<{
  node: HierarchyNode;
  level?: number;
}> = ({ node, level = 0 }) => {
  const [open, setOpen] = useState(level < 2); // Expand top 2 levels by default
  const hasChildren = node.children && node.children.length > 0;
  return (
    <div className={`pl-${level * 3} sm:pl-${level * 4} py-0.5 sm:py-1`}>
      <div
        className="flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none hover:bg-blue-50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 transition-colors duration-150 min-h-[36px] sm:min-h-[40px]"
        onClick={() => hasChildren && setOpen((o) => !o)}
      >
        {hasChildren ? (
          open ? (
            <ChevronDownIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
          ) : (
            <ChevronRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
          )
        ) : (
          <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
        )}
        <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 shrink-0" />
        <span className="font-semibold text-gray-800 text-xs sm:text-sm leading-tight">{node.position}</span>
        {node.name && (
          <span className="text-gray-600 ml-1 text-xs leading-tight truncate">{node.name}</span>
        )}
        {node.heading && !node.name && (
          <span className="text-gray-600 ml-1 text-xs leading-tight truncate">{node.heading}</span>
        )}
      </div>
      {hasChildren && open && (
        <div className="ml-3 sm:ml-4 border-l-2 border-blue-200">
          {node.children!.map((child, i) => (
            <TreeNode node={child} level={level + 1} key={i} />
          ))}
        </div>
      )}
    </div>
  );
};

const CwcSidebar: React.FC = () => {
  const [search, setSearch] = useState("");
  const filtered = filterHierarchy(hierarchy, search);
  return (
    <aside className="w-72 sm:w-80 max-w-full h-full bg-gradient-to-b from-white to-blue-50 shadow-xl border-r border-blue-200 flex flex-col">
      {/* Header */}
      <div className="text-white p-3 sm:p-4" style={{backgroundColor: '#1fb1da'}}>
        <h2 className="text-base sm:text-lg font-bold">CWC Hierarchy</h2>
        <p className="text-blue-100 text-xs sm:text-sm">Organizational Structure</p>
      </div>
      
      {/* Search Bar */}
      <div className="p-3 sm:p-4 border-b border-blue-100 bg-white">
        <div className="relative">
          <MagnifyingGlassIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all duration-200 text-sm"
            placeholder="Filter by position or heading..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      {/* Hierarchy Tree */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3">
        {filtered.length === 0 ? (
          <div className="text-gray-500 text-center mt-6 sm:mt-8 p-3 sm:p-4">
            <UserIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2" />
            <p className="font-medium text-sm sm:text-base">No results found</p>
            <p className="text-xs sm:text-sm text-gray-400">Try a different search term</p>
          </div>
        ) : (
          filtered.map((node, i) => <TreeNode node={node} key={i} />)
        )}
      </div>
    </aside>
  );
};

export default CwcSidebar; 