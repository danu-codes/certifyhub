import {
  Users,
  Search,
  Trash2,
  Plus,
  CheckCircle2,
} from "lucide-react";

import { useState } from "react";

export default function ParticipantList({
  participants,
  setParticipants,
  selectedIndex,
  setSelectedIndex,
}) {
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");

  const filtered = participants
    .map((person, index) => ({
      ...person,
      originalIndex: index,
    }))
    .filter((person) =>
      person.name.toLowerCase().includes(search.toLowerCase())
    );

  const addParticipant = () => {
    const name = newName.trim();

    if (!name) return;

    setParticipants((previous) => [
      ...previous,
      {
        id: Date.now(),
        name,
      },
    ]);

    setNewName("");
    setSearch("");
    setSelectedIndex(participants.length);
  };

  const deleteParticipant = (index) => {
    setParticipants((previous) =>
      previous.filter((_, i) => i !== index)
    );

    setSelectedIndex((current) => {
      if (current > index) return current - 1;
      if (current === index) {
        return Math.max(0, Math.min(index, participants.length - 2));
      }
      return current;
    });
  };

  const editParticipant = (index, name) => {
    setParticipants((previous) =>
      previous.map((person, i) =>
        i === index ? { ...person, name } : person
      )
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-violet-600" />
          <h3 className="font-bold">Participants</h3>
        </div>

        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
          {participants.length} Total
        </span>
      </div>

      <div className="p-5">
        <div className="relative mb-4">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search participants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-violet-500"
          />
        </div>

        <div className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="Add participant name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addParticipant();
            }}
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500"
          />

          <button
            onClick={addParticipant}
            className="rounded-xl bg-violet-600 px-4 text-white hover:bg-violet-700"
            aria-label="Add participant"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="custom-scrollbar max-h-96 space-y-2 overflow-y-auto">
          {filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-400">
              No participants found.
            </p>
          )}

          {filtered.map((person) => {
            const active = selectedIndex === person.originalIndex;

            return (
              <div
                key={person.id}
                className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                  active
                    ? "border-violet-300 bg-violet-50"
                    : "border-slate-100 hover:bg-slate-50"
                }`}
              >
                <button
                  onClick={() =>
                    setSelectedIndex(person.originalIndex)
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-violet-700 shadow-sm"
                >
                  {person.originalIndex + 1}
                </button>

                <input
                  type="text"
                  value={person.name}
                  onFocus={() =>
                    setSelectedIndex(person.originalIndex)
                  }
                  onChange={(e) =>
                    editParticipant(
                      person.originalIndex,
                      e.target.value
                    )
                  }
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none"
                  aria-label={`Participant ${person.originalIndex + 1} name`}
                />

                {active && (
                  <CheckCircle2
                    size={17}
                    className="shrink-0 text-violet-600"
                  />
                )}

                <button
                  onClick={() =>
                    deleteParticipant(person.originalIndex)
                  }
                  className="shrink-0 text-slate-400 hover:text-red-500"
                  aria-label={`Delete ${person.name}`}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}