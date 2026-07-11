import mongoose from 'mongoose';

const modulesEnabledSchema = new mongoose.Schema(
  {
    passwordCastle: { type: Boolean, default: true },
    scamSafari: { type: Boolean, default: true },
    privacyVillage: { type: Boolean, default: true },
    cyberbullyBattle: { type: Boolean, default: true },
  },
  { _id: false },
);

const adminSettingsSchema = new mongoose.Schema(
  {
    singleton: { type: String, unique: true, default: 'main' },
    maintenanceMode: { type: Boolean, default: false },
    parentAnnouncement: { type: String, default: '' },
    featuredModule: {
      type: String,
      enum: ['passwordCastle', 'scamSafari', 'privacyVillage', 'cyberbullyBattle'],
      default: 'passwordCastle',
    },
    difficultyPreset: {
      type: String,
      enum: ['Easy', 'Standard', 'Challenge'],
      default: 'Standard',
    },
    modulesEnabled: { type: modulesEnabledSchema, default: () => ({}) },
    // legacy fields kept for backward compatibility
    encryptionLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    adaptiveContentNotes: { type: String, default: '' },
  },
  { timestamps: true },
);

export const AdminSettings = mongoose.model('AdminSettings', adminSettingsSchema);

export const DEFAULT_MODULES_ENABLED = {
  passwordCastle: true,
  scamSafari: true,
  privacyVillage: true,
  cyberbullyBattle: true,
};

export function normalizeAdminSettings(doc) {
  const modulesEnabled = { ...DEFAULT_MODULES_ENABLED, ...(doc?.modulesEnabled || {}) };
  return {
    maintenanceMode: Boolean(doc?.maintenanceMode),
    parentAnnouncement: doc?.parentAnnouncement || '',
    featuredModule: doc?.featuredModule || 'passwordCastle',
    difficultyPreset: doc?.difficultyPreset || 'Standard',
    modulesEnabled,
  };
}
