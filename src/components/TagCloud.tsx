import './TagCloud.css';

interface Props {
  counts: Record<string, number>;
  selected: string[];
  onToggle: (tag: string) => void;
}

export function TagCloud({ counts, selected, onToggle }: Props) {
  const tags = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return (
    <div className="tag-cloud">
      {tags.map(([tag, count]) => (
        <button
          type="button"
          key={tag}
          className={`tag-pill ${selected.includes(tag) ? 'selected' : ''}`}
          onClick={() => onToggle(tag)}
        >
          #{tag}<span className="count">{count}</span>
        </button>
      ))}
    </div>
  );
}
