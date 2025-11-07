'use client';

/**
 * New Feature Card Form
 * Create new feature cards for the roadmap
 */

import React, { useState } from 'react';
import type { FeatureCard } from './RoadmapBoard';

interface NewFeatureCardFormProps {
  onClose: () => void;
  onSubmit: (card: Omit<FeatureCard, 'id' | 'createdAt' | 'aiReviews'> | FeatureCard) => void;
  existingCard?: FeatureCard;
}

const AI_OPTIONS = [
  { id: 'claude', name: 'Claude', emoji: '🏗️', role: 'Architecture & Implementation' },
  { id: 'chatgpt', name: 'ChatGPT', emoji: '📚', role: 'Research & Documentation' },
  { id: 'codex', name: 'VS Code Codex', emoji: '💻', role: 'Real-time Development' },
  { id: 'augment', name: 'Augment Code', emoji: '🎯', role: 'Code Generation & Optimization' }
] as const;

export default function NewFeatureCardForm({ onClose, onSubmit, existingCard }: NewFeatureCardFormProps) {
  const [formData, setFormData] = useState({
    title: existingCard?.title || '',
    description: existingCard?.description || '',
    priority: (existingCard?.priority || 'medium') as 'high' | 'medium' | 'low',
    status: (existingCard?.status || 'backlog') as FeatureCard['status'],
    assignedAIs: (existingCard?.assignedAIs || []) as ('claude' | 'chatgpt' | 'codex' | 'augment')[],
    estimatedDays: existingCard?.estimatedDays || 1,
    dependencies: existingCard?.dependencies || [] as string[],
    tags: existingCard?.tags || [] as string[],
    tagInput: '',
    userType: (existingCard?.userType || 'end-user') as 'end-user' | 'creator-admin',
    eventPhase: (existingCard?.eventPhase || 'before-event') as 'before-event' | 'at-event' | 'after-event',
    buildStatus: existingCard?.buildStatus,
    spec: existingCard?.spec,
    aiReviews: existingCard?.aiReviews
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { tagInput, ...cardData } = formData;

    if (existingCard) {
      // Editing existing card - preserve id and createdAt
      onSubmit({
        ...cardData,
        id: existingCard.id,
        createdAt: existingCard.createdAt
      } as FeatureCard);
    } else {
      // Creating new card
      onSubmit(cardData);
    }

    onClose();
  };

  const toggleAI = (ai: typeof AI_OPTIONS[number]['id']) => {
    setFormData(prev => ({
      ...prev,
      assignedAIs: prev.assignedAIs.includes(ai)
        ? prev.assignedAIs.filter(a => a !== ai)
        : [...prev.assignedAIs, ai]
    }));
  };

  const addTag = () => {
    if (formData.tagInput.trim() && !formData.tags.includes(formData.tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.tagInput.trim()],
        tagInput: ''
      }));
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {existingCard ? '✏️ Edit Feature Card' : '➕ Create New Feature Card'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Feature Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="e.g., AI-Powered Content Analysis"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="Describe the feature, its goals, and expected outcomes..."
              />
            </div>

            {/* User Type & Event Phase */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  User Type *
                </label>
                <select
                  value={formData.userType}
                  onChange={(e) => setFormData(prev => ({ ...prev, userType: e.target.value as any }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="end-user">👤 End User</option>
                  <option value="creator-admin">⚙️ Creator/Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Event Phase *
                </label>
                <select
                  value={formData.eventPhase}
                  onChange={(e) => setFormData(prev => ({ ...prev, eventPhase: e.target.value as any }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="before-event">📅 Before Event</option>
                  <option value="at-event">🎪 At Event</option>
                  <option value="after-event">📊 After Event</option>
                </select>
              </div>
            </div>

            {/* Priority & Estimate */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="high">🔴 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🔵 Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Estimated Days
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.estimatedDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedDays: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                />
              </div>
            </div>

            {/* Assign AIs */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Assign AI Collaborators
              </label>
              <div className="grid grid-cols-2 gap-3">
                {AI_OPTIONS.map(ai => (
                  <button
                    key={ai.id}
                    type="button"
                    onClick={() => toggleAI(ai.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      formData.assignedAIs.includes(ai.id)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{ai.emoji}</span>
                      <span className="font-semibold text-sm text-gray-900">{ai.name}</span>
                      {formData.assignedAIs.includes(ai.id) && (
                        <span className="ml-auto text-purple-600">✓</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600">{ai.role}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={formData.tagInput}
                  onChange={(e) => setFormData(prev => ({ ...prev, tagInput: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="Add tags (press Enter)"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Add
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Initial Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Initial Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="backlog">📋 Backlog</option>
                <option value="planning">🎯 Planning</option>
                <option value="in-progress">🚀 In Progress</option>
                <option value="review">👀 Review</option>
                <option value="done">✅ Done</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              {existingCard ? '💾 Save Changes' : '➕ Create Feature Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

