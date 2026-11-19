'use client';

import React from 'react';

export const CONSOLIDATION_CONTAINER_TYPES = [
  { value: '20ft', label: '20ft Standard Container' },
  { value: '40ft', label: '40ft Standard Container' },
  { value: '40ft HC', label: '40ft High Cube Container' },
  { value: '45ft', label: '45ft High Cube Container' },
  { value: 'LCL', label: 'LCL - Less than Container Load' },
];

export const createEmptyConsolidationForm = () => ({
  containerNumbers: [''],
  containerType: '',
  sealNumbers: [''],
  blNumbers: [''],
  vesselNames: [''],
  voyageNumbers: [''],
  estimatedDeparture: '',
  notes: '',
});

export const normalizeList = (value) => {
  if (!value) return [];
  const list = Array.isArray(value) ? value : String(value).split(',');
  return list.map((item) => (item == null ? '' : String(item).trim())).filter(Boolean);
};

export const dedupeList = (list) => [...new Set(normalizeList(list))];

export const cleanList = (list) => normalizeList(list);

export const buildConsolidationPayload = (form) => {
  const containerNumbers = cleanList(form.containerNumbers);
  const sealNumbers = cleanList(form.sealNumbers);
  const blNumbers = cleanList(form.blNumbers);
  const vesselNames = cleanList(form.vesselNames);
  const voyageNumbers = cleanList(form.voyageNumbers);

  return {
    containerNumbers,
    containerNumber: containerNumbers.join(', '),
    containerType: form.containerType,
    sealNumbers,
    sealNumber: sealNumbers.join(', '),
    blNumbers,
    blNumber: blNumbers.join(', '),
    vesselNames,
    vesselName: vesselNames.join(', '),
    voyageNumbers,
    voyageNumber: voyageNumbers.join(', '),
    estimatedDeparture: form.estimatedDeparture || undefined,
    notes: form.notes || '',
  };
};

export const autoGenerateConsolidationValues = (form) => {
  const now = new Date();
  const pad = (value, length) => String(value).padStart(length, '0');
  const datePart = `${now.getFullYear()}${pad(now.getMonth() + 1, 2)}${pad(now.getDate(), 2)}`;
  const randomPart = pad(Math.floor(Math.random() * 10000), 4);

  const fillFirstEmpty = (list, value) => {
    const next = [...(Array.isArray(list) && list.length ? list : [''])];
    const index = next.findIndex((item) => !item || !String(item).trim());
    if (index === -1) {
      next.push(value);
    } else {
      next[index] = value;
    }
    return next;
  };

  return {
    ...form,
    containerNumbers: fillFirstEmpty(form.containerNumbers, `CNTR-${Date.now()}`),
    sealNumbers: fillFirstEmpty(form.sealNumbers, `SEL-${datePart}-${randomPart}`),
  };
};

const ListField = ({ label, values, onChange, onAdd, onRemove, placeholder }) => (
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
    <div className="space-y-2">
      {values.map((value, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(event) => onChange(index, event.target.value)}
            placeholder={placeholder}
            className="flex-1 p-2 text-sm border rounded-lg focus:ring-1 focus:ring-[#E67E22]"
          />
          {values.length > 1 && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded"
            >
              Remove
            </button>
          )}
        </div>
      ))}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onAdd}
          className="px-3 py-1 text-xs bg-green-50 text-green-700 rounded"
        >
          {`Add ${label.replace(/\(s\)$/, '').toLowerCase()}`}
        </button>
      </div>
    </div>
  </div>
);

export default function ConsolidationFields({
  form,
  setForm,
  containerTypeDisabled = false,
  showAutoGenerate = true,
}) {
  const updateList = (key, index, value) => {
    setForm((previous) => {
      const next = [...(previous[key] || [])];
      next[index] = value;
      return { ...previous, [key]: next };
    });
  };

  const addToList = (key) => {
    setForm((previous) => ({ ...previous, [key]: [...(previous[key] || []), ''] }));
  };

  const removeFromList = (key, index) => {
    setForm((previous) => ({
      ...previous,
      [key]: (previous[key] || []).filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  return (
    <div className="space-y-3">
      <ListField
        label="Container Number(s)"
        values={form.containerNumbers || []}
        onChange={(index, value) => updateList('containerNumbers', index, value)}
        onAdd={() => addToList('containerNumbers')}
        onRemove={(index) => removeFromList('containerNumbers', index)}
        placeholder="e.g. MSKU1234567"
      />

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Container Type</label>
        <select
          value={form.containerType}
          onChange={(event) => setForm((previous) => ({ ...previous, containerType: event.target.value }))}
          disabled={containerTypeDisabled}
          className="w-full p-2 text-sm border rounded-lg focus:ring-1 focus:ring-[#E67E22] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <option value="">Select</option>
          {CONSOLIDATION_CONTAINER_TYPES.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      <ListField
        label="BL Number(s)"
        values={form.blNumbers || []}
        onChange={(index, value) => updateList('blNumbers', index, value)}
        onAdd={() => addToList('blNumbers')}
        onRemove={(index) => removeFromList('blNumbers', index)}
        placeholder="Bill of lading number"
      />

      <ListField
        label="Seal Number(s)"
        values={form.sealNumbers || []}
        onChange={(index, value) => updateList('sealNumbers', index, value)}
        onAdd={() => addToList('sealNumbers')}
        onRemove={(index) => removeFromList('sealNumbers', index)}
        placeholder="e.g. SEL-20261118-0001"
      />

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Estimated Departure</label>
        <input
          type="date"
          value={form.estimatedDeparture}
          onChange={(event) => setForm((previous) => ({ ...previous, estimatedDeparture: event.target.value }))}
          className="w-full p-2 text-sm border rounded-lg focus:ring-1 focus:ring-[#E67E22]"
        />
      </div>

      <ListField
        label="Vessel Name(s)"
        values={form.vesselNames || []}
        onChange={(index, value) => updateList('vesselNames', index, value)}
        onAdd={() => addToList('vesselNames')}
        onRemove={(index) => removeFromList('vesselNames', index)}
        placeholder="Vessel name"
      />

      <ListField
        label="Voyage Number(s)"
        values={form.voyageNumbers || []}
        onChange={(index, value) => updateList('voyageNumbers', index, value)}
        onAdd={() => addToList('voyageNumbers')}
        onRemove={(index) => removeFromList('voyageNumbers', index)}
        placeholder="Voyage number"
      />

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={form.notes}
          onChange={(event) => setForm((previous) => ({ ...previous, notes: event.target.value }))}
          rows={2}
          className="w-full p-2 text-sm border rounded-lg focus:ring-1 focus:ring-[#E67E22]"
        />
      </div>

      {showAutoGenerate && (
        <div className="border-t pt-3">
          <button
            type="button"
            onClick={() => setForm((previous) => autoGenerateConsolidationValues(previous))}
            className="px-3 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Auto-generate container &amp; seal (optional, only fills empty fields)
          </button>
        </div>
      )}
    </div>
  );
}
