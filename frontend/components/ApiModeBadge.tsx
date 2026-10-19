import { apiMode } from '@/lib/config';

export default function ApiModeBadge() {
  return (
    <div className="mx-auto mt-4 w-fit rounded-full border border-border px-2.5 py-1 text-[10px] text-muted">
      API: {apiMode()}
    </div>
  );
}
