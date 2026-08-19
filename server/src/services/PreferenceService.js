import PreferenceRepository from "../repositories/PreferenceRepository.js";

class PreferenceService {
  async get(userId) {
    return PreferenceRepository.getOrCreate(userId);
  }

  async update(userId, data) {
    return PreferenceRepository.upsert(userId, data);
  }
}

export default new PreferenceService();
