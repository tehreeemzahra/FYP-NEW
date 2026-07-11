import { ChildLoginCode } from './parent/parentChildren';

interface ChildSelectorProps {
  linkedChildren: any[];
  selectedChildId: string | null;
  onSelect: (childId: string) => void;
  onAddChild?: () => void;
  maxChildren?: number;
}

export function ChildSelector({
  linkedChildren,
  selectedChildId,
  onSelect,
  onAddChild,
  maxChildren = 5,
}: ChildSelectorProps) {
  const canAdd = linkedChildren.length < maxChildren;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {linkedChildren.map((child) => {
        const active = child.id === selectedChildId;
        return (
          <button
            key={child.id}
            type="button"
            onClick={() => onSelect(child.id)}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors border ${
              active
                ? 'bg-[#2d5a8a] text-white border-[#2d5a8a] shadow-sm'
                : 'bg-white text-gray-700 border-gray-200 hover:border-[#2d5a8a]/40 hover:bg-blue-50/60'
            }`}
          >
            <span aria-hidden>{child.age <= 10 ? '👧' : '🧒'}</span>
            <span className="truncate max-w-[8rem]">{child.name}</span>
          </button>
        );
      })}
      {canAdd && onAddChild && (
        <button
          type="button"
          onClick={onAddChild}
          className="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold text-[#2d5a8a] border border-dashed border-[#2d5a8a]/50 hover:bg-blue-50/70 transition-colors"
        >
          + Add child
        </button>
      )}
    </div>
  );
}

export function toChildLoginCodes(children: any[]): ChildLoginCode[] {
  return children.map((child) => ({
    name: child.name,
    loginCode: child.loginCode,
  }));
}
