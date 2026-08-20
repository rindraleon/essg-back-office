import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FloatingInput } from '@/components/ui/floating-input';

export type DataSource = { title: string; url: string };
export default function DataSourcesField({ value, onChange }: { value: DataSource[]; onChange: (value: DataSource[]) => void }) {
  const update = (index: number, key: keyof DataSource, next: string) => onChange(value.map((item, i) => i === index ? { ...item, [key]: next } : item));
  return <div className="space-y-2"><div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wide text-ink-600">Sources de données</span><Button type="button" size="sm" variant="outline" onClick={() => onChange([...value, { title: '', url: '' }])}><Plus className="mr-1 size-3"/>Ajouter</Button></div>{value.map((item,index)=><div key={index} className="grid grid-cols-[1fr_1.4fr_auto] gap-2"><FloatingInput label="Titre de la source" value={item.title} onChange={e=>update(index,'title',e.target.value)} required/><FloatingInput label="URL https://…" type="url" value={item.url} onChange={e=>update(index,'url',e.target.value)} required/><Button type="button" size="icon" variant="destructive" onClick={()=>onChange(value.filter((_,i)=>i!==index))}><Trash2 className="size-4"/></Button></div>)}</div>;
}
