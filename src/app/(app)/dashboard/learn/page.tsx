"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Module = { id: string; title: string; description: string | null; position: number };
type Item = { id: string; module_id: string; title: string; url: string | null; completed: boolean; position: number };

export default function LearnPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [modules, setModules] = useState<Module[]>([]);
  const [itemsByModule, setItemsByModule] = useState<Record<string, Item[]>>({});
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function reload() {
    const { data: mods } = await supabase
      .from("learning_modules")
      .select("id,title,description,position")
      .order("position", { ascending: true });
    setModules((mods || []) as Module[]);
    const { data: items } = await supabase
      .from("learning_items")
      .select("id,module_id,title,url,completed,position")
      .order("position", { ascending: true });
    const grouped: Record<string, Item[]> = {};
    const itemsTyped = (items || []) as Item[];
    itemsTyped.forEach((it) => {
      const arr = grouped[it.module_id] || (grouped[it.module_id] = []);
      arr.push(it);
    });
    setItemsByModule(grouped);
  }

  async function addModule(e: React.FormEvent) {
    e.preventDefault();
    const title = newModuleTitle.trim();
    if (!title) return;
    await supabase.from("learning_modules").insert({ title });
    setNewModuleTitle("");
    reload();
    setMessage("Module added");
    setTimeout(() => setMessage(""), 1500);
  }

  async function addItem(moduleId: string) {
    const title = prompt("Item title");
    if (!title) return;
    const url = prompt("Optional URL");
    await supabase.from("learning_items").insert({ module_id: moduleId, title, url: url || null });
    reload();
    setMessage("Item added");
    setTimeout(() => setMessage(""), 1500);
  }

  async function toggleItem(item: Item) {
    await supabase.from("learning_items").update({ completed: !item.completed }).eq("id", item.id);
    reload();
    setMessage("Item updated");
    setTimeout(() => setMessage(""), 1500);
  }

  async function deleteItem(itemId: string) {
    await supabase.from("learning_items").delete().eq("id", itemId);
    reload();
    setMessage("Item deleted");
    setTimeout(() => setMessage(""), 1500);
  }

  async function deleteModule(moduleId: string) {
    await supabase.from("learning_modules").delete().eq("id", moduleId);
    reload();
    setMessage("Module deleted");
    setTimeout(() => setMessage(""), 1500);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Learning Plan</h1>
      {message ? <div className="mb-3 text-sm px-3 py-2 rounded border border-green-200 bg-green-50 text-green-700">{message}</div> : null}
      <form onSubmit={addModule} className="flex gap-2 mb-6">
        <input className="flex-1 border rounded px-3 py-2 bg-transparent" placeholder="New module title" value={newModuleTitle} onChange={(e) => setNewModuleTitle(e.target.value)} />
        <button className="px-4 py-2 border rounded">Add Module</button>
      </form>

      <div className="space-y-6">
        {modules.map((m) => (
          <section key={m.id} className="border rounded p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-medium">{m.title}</h2>
                {m.description ? <p className="text-sm text-gray-600 dark:text-gray-300">{m.description}</p> : null}
              </div>
              <div className="flex items-center gap-2">
                <button className="text-sm px-3 py-1.5 rounded border" onClick={() => addItem(m.id)}>Add Item</button>
                <button className="text-sm px-3 py-1.5 rounded border" onClick={() => deleteModule(m.id)}>Delete Module</button>
              </div>
            </div>
            <ul className="mt-3 space-y-2">
              {(itemsByModule[m.id] || []).map((it) => (
                <li key={it.id} className="flex items-center justify-between border rounded px-3 py-2">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={it.completed} onChange={() => toggleItem(it)} />
                    <div>
                      <div className="text-sm font-medium">{it.title}</div>
                      {it.url ? (
                        <a className="text-xs underline" href={it.url} target="_blank" rel="noreferrer">Open</a>
                      ) : null}
                    </div>
                  </div>
                  <div>
                    <button className="text-xs px-3 py-1.5 rounded border" onClick={() => deleteItem(it.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

