import { Eye } from "lucide-react";
import { useViewCounter } from "@/hooks/useViewCounter";

export default function ViewCounter() {
  const { views, loading } = useViewCounter();

  if (loading) return null;

  return (
    <div className="flex items-center gap-2 text-[10px] text-cyan-500/70 font-mono border border-cyan-900/30 bg-black/40 px-2 py-1 rounded select-none">
      <Eye className="w-3 h-3" />
      <span className="tracking-wider">
        OBSERVERS: {views.toLocaleString()}
      </span>
    </div>
  );
}
