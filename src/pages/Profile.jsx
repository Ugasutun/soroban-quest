import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  loadProgress,
  importProgress,
  exportProgress,
  resetProgress,
  loadProfile,
  saveProfile,
} from "../systems/storage";

import { getXPProgress, getRankTitle, BADGES } from "../systems/gameEngine";
import { getAllMissions } from "../systems/missionLoader";
import { avatars } from "../data/avatars";
import { logActivity, ACTIVITY_TYPES } from "../systems/activityLogger";

export default function Profile() {
  const [state, setState] = useState(loadProgress());
  const [profile, setProfile] = useState(() => loadProfile());

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name || "");
  const [avatar, setAvatar] = useState(profile.avatar || "🛡️");

  const [importStatus, setImportStatus] = useState("");
  const fileInputRef = useRef(null);

  const xpProgress = getXPProgress(state);
  const rankTitle = getRankTitle(state.level);
  const missions = getAllMissions();

  /* ---------------- SAVE PROFILE ---------------- */
  const saveUserProfile = () => {
    const updated = {
      name: name.trim() || "Player",
      avatar,
    };

    saveProfile(updated);
    setProfile(updated);
    setEditing(false);
  };

  const openEdit = () => {
    setName(profile.name);
    setAvatar(profile.avatar);
    setEditing(true);
  };

  /* ---------------- PROGRESS ACTIONS ---------------- */
  const handleExport = () => {
    exportProgress();
    setImportStatus("✅ Progress exported!");
    logActivity(ACTIVITY_TYPES.EXPORT, {}, "Exported adventure progress");
    setTimeout(() => setImportStatus(""), 3000);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const newState = await importProgress(file);
      setState(newState);
      setImportStatus("✅ Progress imported successfully!");
      logActivity(ACTIVITY_TYPES.IMPORT, {}, "Imported adventure progress from file");
    } catch {
      setImportStatus("❌ Invalid file — could not import.");
    }

    setTimeout(() => setImportStatus(""), 3000);
  };

  const handleReset = () => {
    if (window.confirm("Reset all progress? This cannot be undone.")) {
      const newState = resetProgress();
      setState(newState);
      setImportStatus("🗑️ Progress reset.");
      setTimeout(() => setImportStatus(""), 3000);
    }
  };

  const completedMissions = missions.filter((m) =>
    state.completedMissions.includes(m.id),
  );

  return (
    <div id="main-content" className="profile-page">
      {/* HEADER */}
      <div className="profile-header">
        {/* AVATAR */}
        <div className="profile-avatar text-5xl" role="img" aria-label={`Active avatar character: ${profile.avatar}`}>
          {profile.avatar}
        </div>

        {/* INFO */}
        <div className="profile-info" style={{ flex: 1 }}>
          <h1 className="profile-name">
            <span className="sr-only">Adventurer Name: </span>
            {profile.name}
          </h1>

          <div className="profile-rank">
            <span className="sr-only">Rank Title: </span>
            {rankTitle}
          </div>

          <div className="xp-bar-container" aria-label={`XP progress bar: ${xpProgress.percentage}% complete`}>
            <div className="xp-bar-track">
              <div
                className="xp-bar-fill"
                style={{ width: `${xpProgress.percentage}%` }}
              />
            </div>

            <div className="xp-bar-label">
              <span>
                {xpProgress.current} / {xpProgress.needed} XP needed for next level
              </span>
              <span>Total cumulative: {state.xp} XP</span>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2 mt-3">
            <button type="button" className="btn btn-secondary" onClick={openEdit}>
              ✏️ Edit Character Profile
            </button>
            <Link to="/journal" className="btn btn-ghost">
              📖 View Quest Journal
            </Link>
          </div>
        </div>

        {/* STATS */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          role="region"
          aria-label="Adventurer stats dashboard"
        >
          <div className="card">
            <div style={{ fontSize: "1.3rem", fontWeight: 800 }}>
              {state.completedMissions.length}
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
              Missions Completed
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: "1.3rem", fontWeight: 800 }}>
              {state.badges.length}
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
              Badges Earned
            </div>
          </div>
        </div>
      </div>

      {/* EDIT PANEL */}
      {editing && (
        <div className="card mt-4" role="form" aria-labelledby="edit-profile-heading">
          <h3 id="edit-profile-heading" className="mb-3">Edit Profile</h3>

          {/* NAME */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label htmlFor="profile-name-edit-input" className="text-sm font-semibold">
              Adventurer Character Name
            </label>
            <input
              id="profile-name-edit-input"
              className="w-full p-2 mb-3 rounded"
              style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
            />
          </div>

          {/* AVATARS */}
          <fieldset className="mb-3" style={{ border: "none", padding: 0, margin: 0 }}>
            <legend className="text-sm font-semibold mb-2">Select Character Emblem Avatar</legend>
            <div className="grid grid-cols-6 gap-2">
              {avatars.map((a) => (
                <button
                  type="button"
                  key={a}
                  onClick={() => setAvatar(a)}
                  className="text-2xl p-2 rounded transition"
                  aria-label={`Select avatar icon character ${a}`}
                  aria-pressed={avatar === a}
                  style={{
                    backgroundColor: avatar === a ? "var(--cyan-dim)" : "var(--bg-glass)",
                    transform: avatar === a ? "scale(1.1)" : "none",
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </fieldset>

          {/* ACTIONS */}
          <div className="flex gap-2">
            <button type="button" className="btn btn-primary" onClick={saveUserProfile}>
              Save Profile Changes
            </button>

            <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
              Cancel Changes
            </button>
          </div>
        </div>
      )}

      {/* BADGES */}
      <h2 className="profile-section-title">🏅 Earned Honor Badges</h2>

      <div className="profile-badges-grid" role="region" aria-label="Badges progression collection">
        {BADGES.map((badge) => {
          const earned = state.badges.includes(badge.id);

          return (
            <div
              key={badge.id}
              className={`profile-badge-card ${earned ? "earned" : "locked"}`}
              aria-label={`Badge record: ${badge.name}. Description: ${badge.description}. Status: ${earned ? 'Earned' : 'Locked'}`}
            >
              <div className="profile-badge-icon" aria-hidden="true">{badge.icon}</div>
              <div className="profile-badge-info" aria-hidden="true">
                <h4>{badge.name}</h4>
                <p>{badge.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* MISSIONS */}
      <h2 className="profile-section-title">✅ Completed Missions Catalog</h2>

      <div className="flex flex-col gap-2" role="region" aria-label="Completed missions listing log">
        {completedMissions.length === 0 ? (
          <div className="card text-center p-6" role="status">No missions completed yet on this adventure.</div>
        ) : (
          completedMissions.map((m) => (
            <div key={m.id} className="card flex justify-between" aria-label={`Completed mission entry: ${m.title}. Reward gathered: ${m.xpReward} XP.`}>
              <span aria-hidden="true">{m.title}</span>
              <span className="text-gold" aria-hidden="true">+{m.xpReward} XP</span>
            </div>
          ))
        )}
      </div>

      {/* DATA */}
      <h2 className="profile-section-title">⚙️ Local Progression Management Data</h2>

      <div className="profile-actions" role="group" aria-label="Game progress backup controls">
        <button type="button" className="btn btn-secondary" onClick={handleExport}>
          Export Progress File
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => fileInputRef.current?.click()}
        >
          Import Progress File
        </button>

        <button type="button" className="btn btn-ghost" style={{ color: "var(--red)" }} onClick={handleReset}>
          Reset Progress
        </button>

        <input
          ref={fileInputRef}
          type="file"
          id="progress-import-hidden-file"
          accept=".json"
          hidden
          onChange={handleImport}
          aria-label="Hidden file progress backup uploader tool"
        />
      </div>

      {importStatus && (
        <p className="mt-3 text-sm text-gray-400" role="status">{importStatus}</p>
      )}
    </div>
  );
}