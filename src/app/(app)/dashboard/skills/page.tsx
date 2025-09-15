"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Skill = {
  id: string;
  user_id: string;
  name: string;
  level: number | null;
  category: string;
  target_level: number | null;
  hours_practiced: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type SkillProgress = {
  id: string;
  skill_id: string;
  level_before: number;
  level_after: number;
  hours_added: number;
  notes: string | null;
  created_at: string;
};

type SkillRecommendation = {
  id: string;
  skill_id: string;
  recommendation_type: 'course' | 'practice' | 'project' | 'certification';
  title: string;
  description: string | null;
  url: string | null;
  priority: number;
  completed: boolean;
  created_at: string;
};

const SKILL_CATEGORIES = [
  'Technical',
  'Programming',
  'Design',
  'Marketing',
  'Management',
  'Communication',
  'Data Analysis',
  'General'
];

export default function SkillsPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillProgress, setSkillProgress] = useState<SkillProgress[]>([]);
  const [recommendations, setRecommendations] = useState<SkillRecommendation[]>([]);
  
  // Form states
  const [name, setName] = useState("");
  const [level, setLevel] = useState<number | "">("");
  const [category, setCategory] = useState("General");
  const [targetLevel, setTargetLevel] = useState<number | "">("");
  const [hours, setHours] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingLevel, setEditingLevel] = useState<number | "">("");
  const [editingCategory, setEditingCategory] = useState("");
  const [editingTargetLevel, setEditingTargetLevel] = useState<number | "">("");
  const [editingHours, setEditingHours] = useState<number | "">("");
  const [editingNotes, setEditingNotes] = useState("");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"created" | "name" | "level" | "progress">("created");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "progress" | "recommendations">("overview");
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  async function fetchSkills() {
    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setSkills(data as Skill[]);
  }

  async function fetchSkillProgress() {
    const { data } = await supabase
      .from("skill_progress")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setSkillProgress(data as SkillProgress[]);
  }

  async function fetchRecommendations() {
    const { data } = await supabase
      .from("skill_recommendations")
      .select("*")
      .eq("completed", false)
      .order("priority", { ascending: false });
    if (data) setRecommendations(data as SkillRecommendation[]);
  }

  useEffect(() => {
    Promise.all([fetchSkills(), fetchSkillProgress(), fetchRecommendations()])
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onAddSkill(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const { error } = await supabase
      .from("skills")
      .insert({ 
        name, 
        level: level === "" ? null : Number(level),
        category,
        target_level: targetLevel === "" ? null : Number(targetLevel),
        hours_practiced: hours === "" ? 0 : Number(hours),
        notes: notes || null
      });
    if (!error) {
      setName("");
      setLevel("");
      setCategory("General");
      setTargetLevel("");
      setHours("");
      setNotes("");
      fetchSkills();
      setMessage("Skill added successfully");
      setTimeout(() => setMessage(""), 1500);
    }
  }

  function startEdit(skill: Skill) {
    setEditingId(skill.id);
    setEditingName(skill.name);
    setEditingLevel(skill.level ?? "");
    setEditingCategory(skill.category);
    setEditingTargetLevel(skill.target_level ?? "");
    setEditingHours(skill.hours_practiced);
    setEditingNotes(skill.notes || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName("");
    setEditingLevel("");
    setEditingCategory("");
    setEditingTargetLevel("");
    setEditingHours("");
    setEditingNotes("");
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    
    const oldSkill = skills.find(s => s.id === editingId);
    const newLevel = editingLevel === "" ? null : Number(editingLevel);
    const newHours = Number(editingHours);
    
    const payload = {
      name: editingName.trim(),
      level: newLevel,
      category: editingCategory,
      target_level: editingTargetLevel === "" ? null : Number(editingTargetLevel),
      hours_practiced: newHours,
      notes: editingNotes || null,
    };
    
    await supabase.from("skills").update(payload).eq("id", editingId);
    
    // Track progress if level changed
    if (oldSkill && oldSkill.level !== newLevel && oldSkill.level !== null && newLevel !== null) {
      await supabase.from("skill_progress").insert({
        skill_id: editingId,
        level_before: oldSkill.level,
        level_after: newLevel,
        hours_added: newHours - oldSkill.hours_practiced,
        notes: `Level updated from ${oldSkill.level} to ${newLevel}`
      });
    }
    
    cancelEdit();
    fetchSkills();
    fetchSkillProgress();
    setMessage("Skill updated successfully");
    setTimeout(() => setMessage(""), 1500);
  }

  async function deleteSkill(skillId: string) {
    await supabase.from("skills").delete().eq("id", skillId);
    setSkills((prev) => prev.filter((s) => s.id !== skillId));
    setMessage("Skill deleted");
    setTimeout(() => setMessage(""), 1500);
  }

  async function addPracticeHours(skillId: string, hoursToAdd: number, notes?: string) {
    const skill = skills.find(s => s.id === skillId);
    if (!skill) return;

    const newHours = skill.hours_practiced + hoursToAdd;
    await supabase.from("skills").update({ hours_practiced: newHours }).eq("id", skillId);
    
    // Track progress
    await supabase.from("skill_progress").insert({
      skill_id: skillId,
      level_before: skill.level || 0,
      level_after: skill.level || 0,
      hours_added: hoursToAdd,
      notes: notes || `Added ${hoursToAdd} practice hours`
    });

    fetchSkills();
    fetchSkillProgress();
    setMessage(`Added ${hoursToAdd} hours to ${skill.name}`);
    setTimeout(() => setMessage(""), 1500);
  }

  async function generateRecommendations(skillId: string) {
    const skill = skills.find(s => s.id === skillId);
    if (!skill) return;

    // Simple rule-based recommendations
    const recommendations = [];
    
    if (!skill.level || skill.level < 2) {
      recommendations.push({
        skill_id: skillId,
        recommendation_type: 'course' as const,
        title: `Beginner ${skill.name} Course`,
        description: `Start with fundamentals of ${skill.name}`,
        priority: 5
      });
    }
    
    if (skill.level && skill.level >= 2 && skill.level < 4) {
      recommendations.push({
        skill_id: skillId,
        recommendation_type: 'project' as const,
        title: `Intermediate ${skill.name} Project`,
        description: `Build a real-world project using ${skill.name}`,
        priority: 4
      });
    }
    
    if (skill.level && skill.level >= 4) {
      recommendations.push({
        skill_id: skillId,
        recommendation_type: 'certification' as const,
        title: `${skill.name} Certification`,
        description: `Get certified in ${skill.name}`,
        priority: 3
      });
    }

    for (const rec of recommendations) {
      await supabase.from("skill_recommendations").insert(rec);
    }

    fetchRecommendations();
    setMessage(`Generated recommendations for ${skill.name}`);
    setTimeout(() => setMessage(""), 1500);
  }

  function getProgressPercentage(skill: Skill): number {
    if (!skill.target_level || !skill.level) return 0;
    return Math.min((skill.level / skill.target_level) * 100, 100);
  }

  function getSkillsByCategory() {
    const grouped: { [key: string]: Skill[] } = {};
    skills.forEach(skill => {
      const cat = skill.category || 'General';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(skill);
    });
    return grouped;
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading skills...</div>;
  }

  const filteredSkills = skills
    .filter((s) => {
      const matchesQuery = s.name.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = categoryFilter === "all" || s.category === categoryFilter;
      return matchesQuery && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "level") return (b.level ?? -1) - (a.level ?? -1);
      if (sortBy === "progress") return getProgressPercentage(b) - getProgressPercentage(a);
      return 0;
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Smart Skills Tracking</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              activeTab === "overview" ? "bg-blue-50 border-blue-200 text-blue-700" : "border-gray-200"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("progress")}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              activeTab === "progress" ? "bg-blue-50 border-blue-200 text-blue-700" : "border-gray-200"
            }`}
          >
            Progress
          </button>
          <button
            onClick={() => setActiveTab("recommendations")}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              activeTab === "recommendations" ? "bg-blue-50 border-blue-200 text-blue-700" : "border-gray-200"
            }`}
          >
            Recommendations
          </button>
        </div>
      </div>

      {message && (
        <div className="px-4 py-3 rounded-lg border border-green-200 bg-green-50 text-green-700">
          {message}
        </div>
      )}

      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Add Skill Form */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Add New Skill</h2>
            <form onSubmit={onAddSkill} className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Skill Name</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. React, Python, Design Thinking"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {SKILL_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Current Level</label>
                <input
                  type="number"
                  min={0}
                  max={5}
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                  value={level}
                  onChange={(e) => setLevel(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="0-5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Target Level</label>
                <input
                  type="number"
                  min={0}
                  max={5}
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="0-5"
                />
              </div>
              <div className="md:col-span-6">
                <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Learning goals, resources, or other notes..."
                />
              </div>
              <div className="md:col-span-6">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Add Skill
                </button>
              </div>
            </form>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-2">Search Skills</label>
              <input
                className="w-64 border rounded-lg px-3 py-2 bg-white"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                className="w-48 border rounded-lg px-3 py-2 bg-white"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {SKILL_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <select
                className="w-48 border rounded-lg px-3 py-2 bg-white"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "created" | "name" | "level" | "progress")}
              >
                <option value="created">Recently Added</option>
                <option value="name">Name A-Z</option>
                <option value="level">Skill Level</option>
                <option value="progress">Progress</option>
              </select>
            </div>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map((skill) => (
              <div key={skill.id} className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                {editingId === skill.id ? (
                  <form onSubmit={saveEdit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <input
                        className="w-full border rounded-lg px-3 py-2"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Current Level</label>
                        <input
                          type="number"
                          min={0}
                          max={5}
                          className="w-full border rounded-lg px-3 py-2"
                          value={editingLevel}
                          onChange={(e) => setEditingLevel(e.target.value === "" ? "" : Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Target Level</label>
                        <input
                          type="number"
                          min={0}
                          max={5}
                          className="w-full border rounded-lg px-3 py-2"
                          value={editingTargetLevel}
                          onChange={(e) => setEditingTargetLevel(e.target.value === "" ? "" : Number(e.target.value))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select
                        className="w-full border rounded-lg px-3 py-2"
                        value={editingCategory}
                        onChange={(e) => setEditingCategory(e.target.value)}
                      >
                        {SKILL_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Hours Practiced</label>
                      <input
                        type="number"
                        min={0}
                        step="0.5"
                        className="w-full border rounded-lg px-3 py-2"
                        value={editingHours}
                        onChange={(e) => setEditingHours(e.target.value === "" ? "" : Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Notes</label>
                      <textarea
                        className="w-full border rounded-lg px-3 py-2"
                        rows={2}
                        value={editingNotes}
                        onChange={(e) => setEditingNotes(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Save
                      </button>
                      <button type="button" onClick={cancelEdit} className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{skill.name}</h3>
                        <p className="text-sm text-gray-500">{skill.category}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(skill)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Edit skill"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteSkill(skill.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete skill"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current Level: {skill.level ?? "Not set"}/5</span>
                        <span>Target: {skill.target_level ?? "Not set"}/5</span>
                      </div>
                      {skill.target_level && skill.level && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getProgressPercentage(skill)}%` }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="text-sm text-gray-600">
                      <p>Practice Hours: {skill.hours_practiced}</p>
                      {skill.notes && <p className="mt-1 text-xs">{skill.notes}</p>}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => addPracticeHours(skill.id, 1)}
                        className="flex-1 text-xs bg-green-50 text-green-700 py-2 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                      >
                        +1 Hour
                      </button>
                      <button
                        onClick={() => generateRecommendations(skill.id)}
                        className="flex-1 text-xs bg-purple-50 text-purple-700 py-2 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
                      >
                        Get Tips
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredSkills.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No skills found</p>
              <p>Add your first skill to start tracking your progress!</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "progress" && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Progress Tracking</h2>
          
          {skillProgress.length > 0 ? (
            <div className="space-y-4">
              {skillProgress.slice(0, 20).map((progress) => {
                const skill = skills.find(s => s.id === progress.skill_id);
                return (
                  <div key={progress.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{skill?.name}</h3>
                        <p className="text-sm text-gray-600">
                          Level {progress.level_before} → {progress.level_after}
                          {progress.hours_added > 0 && ` • +${progress.hours_added} hours`}
                        </p>
                        {progress.notes && (
                          <p className="text-xs text-gray-500 mt-1">{progress.notes}</p>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(progress.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No progress recorded yet</p>
              <p>Start practicing and updating your skill levels to see progress here!</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "recommendations" && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Learning Recommendations</h2>
          
          {recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((rec) => {
                const skill = skills.find(s => s.id === rec.skill_id);
                return (
                  <div key={rec.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{rec.title}</h3>
                        <p className="text-sm text-gray-600">For: {skill?.name}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        rec.recommendation_type === 'course' ? 'bg-blue-100 text-blue-700' :
                        rec.recommendation_type === 'project' ? 'bg-green-100 text-green-700' :
                        rec.recommendation_type === 'certification' ? 'bg-purple-100 text-purple-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {rec.recommendation_type}
                      </span>
                    </div>
                    {rec.description && (
                      <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                    )}
                    <div className="flex gap-2">
                      {rec.url && (
                        <a
                          href={rec.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                        >
                          View Resource
                        </a>
                      )}
                      <button
                        onClick={async () => {
                          await supabase.from("skill_recommendations").update({ completed: true }).eq("id", rec.id);
                          fetchRecommendations();
                          setMessage("Recommendation marked as completed");
                          setTimeout(() => setMessage(""), 1500);
                        }}
                        className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                      >
                        Mark Complete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No recommendations yet</p>
              <p>Click "Get Tips" on any skill to generate personalized learning recommendations!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

